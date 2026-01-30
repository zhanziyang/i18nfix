import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { parse } from '@babel/parser';
import type { File } from '@babel/types';

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

export async function readLocaleFile(filePath: string): Promise<{ data: JsonValue; format: 'json' | 'yaml' | 'js' | 'ts'; moduleKind?: 'esm' | 'cjs' }> {
  const ext = path.extname(filePath).toLowerCase();
  const raw = await fs.readFile(filePath, 'utf8');

  if (ext === '.json') {
    const data = JSON.parse(raw) as unknown;
    assertStaticJsonValue(data, 'json');
    return { data, format: 'json' };
  }

  if (ext === '.yml' || ext === '.yaml') {
    const data = YAML.parse(raw) as unknown;
    assertStaticJsonValue(data, 'yaml');
    return { data, format: 'yaml' };
  }

  if (ext === '.js' || ext === '.ts') {
    const { value, moduleKind } = parseExportedObject(raw);
    return { data: value, format: ext === '.ts' ? 'ts' : 'js', moduleKind };
  }

  throw new Error(`Unsupported locale file extension: ${ext}`);
}

export async function writeLocaleFile(
  filePath: string,
  data: JsonValue,
  opts?: { format?: 'json' | 'yaml' | 'js' | 'ts'; moduleKind?: 'esm' | 'cjs' }
): Promise<void> {
  assertStaticJsonValue(data, 'data');
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const ext = path.extname(filePath).toLowerCase();
  const format = opts?.format ?? (ext === '.yml' || ext === '.yaml' ? 'yaml' : ext === '.js' ? 'js' : ext === '.ts' ? 'ts' : 'json');

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

  // JS/TS: write JSON-compatible object literal wrapped in module syntax
  const json = JSON.stringify(data, null, 2);
  const moduleKind = opts?.moduleKind ?? 'esm';
  const raw = moduleKind === 'cjs' ? `module.exports = ${json};\n` : `export default ${json};\n`;
  await fs.writeFile(filePath, raw, 'utf8');
}
