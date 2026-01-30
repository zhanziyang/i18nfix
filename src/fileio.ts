import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { parse } from '@babel/parser';
import type { File } from '@babel/types';
import recast from 'recast';
import * as t from '@babel/types';

export type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function assertStaticJsonValue(v: unknown, ctx = 'value'): asserts v is JsonValue {
  const t = typeof v;
  if (v == null || t === 'string' || t === 'number' || t === 'boolean') return;
  if (Array.isArray(v)) {
    for (const it of v) assertStaticJsonValue(it, `${ctx}[]`);
    return;
  }
  if (isPlainObject(v)) {
    for (const [k, it] of Object.entries(v)) {
      if (typeof k !== 'string') throw new Error(`Non-string key in ${ctx}`);
      assertStaticJsonValue(it, `${ctx}.${k}`);
    }
    return;
  }
  throw new Error(`Unsupported non-static ${ctx}: ${String(v)}`);
}

function objectExpressionToValue(node: any): JsonValue {
  // Supports only a safe subset of JS/TS object literal exports.
  switch (node.type) {
    case 'ObjectExpression': {
      const out: Record<string, JsonValue> = {};
      for (const prop of node.properties) {
        if (prop.type !== 'ObjectProperty') throw new Error('Only plain object properties are supported');
        if (prop.computed) throw new Error('Computed keys are not supported');
        let key: string;
        if (prop.key.type === 'Identifier') key = prop.key.name;
        else if (prop.key.type === 'StringLiteral') key = prop.key.value;
        else if (prop.key.type === 'NumericLiteral') key = String(prop.key.value);
        else throw new Error('Unsupported key type');
        out[key] = objectExpressionToValue(prop.value);
      }
      return out;
    }
    case 'ArrayExpression': {
      const out: JsonValue[] = [];
      for (const el of node.elements) {
        if (!el) {
          out.push(null);
          continue;
        }
        out.push(objectExpressionToValue(el));
      }
      return out;
    }
    case 'StringLiteral':
      return node.value;
    case 'NumericLiteral':
      return node.value;
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    // allow unary -1
    case 'UnaryExpression': {
      if (node.operator === '-' && node.argument?.type === 'NumericLiteral') return -node.argument.value;
      throw new Error('Unsupported unary expression');
    }
    default:
      throw new Error(`Unsupported expression type: ${node.type}`);
  }
}

function parseExportedObject(code: string): { value: JsonValue; moduleKind: 'esm' | 'cjs' } {
  const ast: File = parse(code, {
    sourceType: 'unambiguous',
    plugins: ['typescript'],
  }) as any;

  for (const stmt of ast.program.body as any[]) {
    // export default {...}
    if (stmt.type === 'ExportDefaultDeclaration') {
      const decl = stmt.declaration;
      if (decl.type !== 'ObjectExpression') throw new Error('export default must be an object literal');
      return { value: objectExpressionToValue(decl), moduleKind: 'esm' };
    }

    // module.exports = {...}
    if (stmt.type === 'ExpressionStatement' && stmt.expression?.type === 'AssignmentExpression') {
      const e = stmt.expression;
      const left = e.left;
      if (
        left?.type === 'MemberExpression' &&
        !left.computed &&
        left.object?.type === 'Identifier' &&
        left.object.name === 'module' &&
        left.property?.type === 'Identifier' &&
        left.property.name === 'exports'
      ) {
        const right = e.right;
        if (right.type !== 'ObjectExpression') throw new Error('module.exports must be an object literal');
        return { value: objectExpressionToValue(right), moduleKind: 'cjs' };
      }
    }
  }

  throw new Error('Unsupported JS/TS locale file. Expected `export default { ... }` or `module.exports = { ... }`.');
}

export async function readLocaleFile(filePath: string): Promise<{ data: JsonValue; format: 'json' | 'yaml' | 'js' | 'ts'; moduleKind?: 'esm' | 'cjs'; raw?: string }> {
  const ext = path.extname(filePath).toLowerCase();
  const raw = await fs.readFile(filePath, 'utf8');

  if (ext === '.json') {
    const data = JSON.parse(raw) as unknown;
    assertStaticJsonValue(data, 'json');
    return { data, format: 'json', raw };
  }

  if (ext === '.yml' || ext === '.yaml') {
    const data = YAML.parse(raw) as unknown;
    assertStaticJsonValue(data, 'yaml');
    return { data, format: 'yaml', raw };
  }

  if (ext === '.js' || ext === '.ts') {
    const { value, moduleKind } = parseExportedObject(raw);
    return { data: value, format: ext === '.ts' ? 'ts' : 'js', moduleKind, raw };
  }

  throw new Error(`Unsupported locale file extension: ${ext}`);
}

export async function writeLocaleFile(
  filePath: string,
  data: JsonValue,
  opts?: {
    format?: 'json' | 'yaml' | 'js' | 'ts';
    moduleKind?: 'esm' | 'cjs';
    /** For JS/TS, provide original source to preserve formatting/comments as much as possible. */
    originalRaw?: string;
  }
): Promise<void> {
  assertStaticJsonValue(data, 'data');
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const ext = path.extname(filePath).toLowerCase();
  const format =
    opts?.format ??
    (ext === '.yml' || ext === '.yaml'
      ? 'yaml'
      : ext === '.js'
        ? 'js'
        : ext === '.ts'
          ? 'ts'
          : 'json');

  if (format === 'yaml') {
    const raw = YAML.stringify(data as any);
    await fs.writeFile(filePath, raw, 'utf8');
    return;
  }

  if (format === 'json') {
    const raw = JSON.stringify(data, null, 2) + '\n';
    await fs.writeFile(filePath, raw, 'utf8');
    return;
  }

  const moduleKind = opts?.moduleKind ?? 'esm';

  // JS/TS: preserve formatting (best-effort) by parsing original source and mutating object literals in-place.
  const raw = opts?.originalRaw;
  if (raw) {
    const out = writeJsTsPreserve(raw, data, moduleKind);
    await fs.writeFile(filePath, out, 'utf8');
    return;
  }

  // fallback
  const json = JSON.stringify(data, null, 2);
  const fallback = moduleKind === 'cjs' ? `module.exports = ${json};\n` : `export default ${json};\n`;
  await fs.writeFile(filePath, fallback, 'utf8');
}

function writeJsTsPreserve(original: string, data: JsonValue, moduleKind: 'esm' | 'cjs'): string {
  const parser = {
    parse(source: string) {
      return parse(source, { sourceType: 'unambiguous', plugins: ['typescript'] }) as any;
    },
  };

  const ast = recast.parse(original, { parser });

  // find the exported object expression
  let objExpr: any | null = null;
  recast.types.visit(ast, {
    visitExportDefaultDeclaration(p) {
      const decl: any = p.node.declaration;
      if (decl?.type === 'ObjectExpression') {
        objExpr = decl;
        return false;
      }
      return this.traverse(p);
    },
    visitAssignmentExpression(p) {
      const n: any = p.node;
      if (n.left?.type === 'MemberExpression' && !n.left.computed) {
        const o = n.left.object;
        const pr = n.left.property;
        if (o?.type === 'Identifier' && o.name === 'module' && pr?.type === 'Identifier' && pr.name === 'exports') {
          if (n.right?.type === 'ObjectExpression') {
            objExpr = n.right;
            return false;
          }
        }
      }
      return this.traverse(p);
    },
  });

  if (!objExpr) {
    // if we can't find, fallback
    const json = JSON.stringify(data, null, 2);
    return moduleKind === 'cjs' ? `module.exports = ${json};\n` : `export default ${json};\n`;
  }

  if (!t.isObjectExpression(objExpr)) {
    throw new Error('JS/TS locale root is not an object expression');
  }

  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('JS/TS locale root must be an object');
  }

  syncObjectExpression(objExpr, data as Record<string, JsonValue>);

  return recast.print(ast).code + (original.endsWith('\n') ? '\n' : '\n');
}

function keyToAst(key: string): any {
  // Use Identifier when possible to keep keys unquoted
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) return t.identifier(key);
  return t.stringLiteral(key);
}

function findProp(obj: any, key: string): any | null {
  for (const p of obj.properties) {
    if (p.type !== 'ObjectProperty') continue;
    if (p.computed) continue;
    const k = p.key;
    if (k.type === 'Identifier' && k.name === key) return p;
    if (k.type === 'StringLiteral' && k.value === key) return p;
    if (k.type === 'NumericLiteral' && String(k.value) === key) return p;
  }
  return null;
}

function valueToAst(value: JsonValue): any {
  if (value === null) return t.nullLiteral();
  if (typeof value === 'string') return t.stringLiteral(value);
  if (typeof value === 'number') return t.numericLiteral(value);
  if (typeof value === 'boolean') return t.booleanLiteral(value);
  if (Array.isArray(value)) return t.arrayExpression(value.map((v) => valueToAst(v)));
  // object
  const props = Object.entries(value).map(([k, v]) => t.objectProperty(keyToAst(k), valueToAst(v)));
  return t.objectExpression(props);
}

function syncObjectExpression(objExpr: any, desired: Record<string, JsonValue>) {
  // Delete extras
  objExpr.properties = objExpr.properties.filter((p: any) => {
    if (p.type !== 'ObjectProperty' || p.computed) return true; // keep unsupported nodes as-is
    const k = p.key;
    let key: string | null = null;
    if (k.type === 'Identifier') key = k.name;
    else if (k.type === 'StringLiteral') key = k.value;
    else if (k.type === 'NumericLiteral') key = String(k.value);
    if (key == null) return true;
    return Object.prototype.hasOwnProperty.call(desired, key);
  });

  // Update existing + add missing (append at end)
  for (const [key, val] of Object.entries(desired)) {
    const existing = findProp(objExpr, key);
    if (existing) {
      if (t.isObjectExpression(existing.value) && val && typeof val === 'object' && !Array.isArray(val)) {
        syncObjectExpression(existing.value, val as any);
      } else {
        existing.value = valueToAst(val);
      }
    } else {
      objExpr.properties.push(t.objectProperty(keyToAst(key), valueToAst(val)));
    }
  }
}
