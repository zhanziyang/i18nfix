import path from 'node:path';
import { KeyStyle, PlaceholderStyle } from './types.js';
import { JsonValue } from './fileio.js';

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function flattenJson(obj: JsonValue, prefix = ''): Record<string, JsonValue> {
  const out: Record<string, JsonValue> = {};
  if (!isPlainObject(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) {
      Object.assign(out, flattenJson(v as JsonValue, key));
    } else {
      out[key] = v as JsonValue;
    }
  }
  return out;
}

export function unflattenJson(flat: Record<string, JsonValue>): Record<string, JsonValue> {
  const root: Record<string, JsonValue> = {};
  for (const [k, v] of Object.entries(flat)) {
    const parts = k.split('.');
    let cur: Record<string, any> = root;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]!;
      if (i === parts.length - 1) {
        cur[p] = v;
      } else {
        if (!isPlainObject(cur[p])) cur[p] = {};
        cur = cur[p];
      }
    }
  }
  return root;
}

export function detectKeyStyle(json: JsonValue): KeyStyle {
  if (!isPlainObject(json)) return 'nested';
  const hasDotKeys = Object.keys(json).some((k) => k.includes('.'));
  const hasNested = Object.values(json).some((v) => isPlainObject(v));
  if (hasDotKeys && !hasNested) return 'flat';
  if (hasNested && !hasDotKeys) return 'nested';
  // mixed: prefer nested but keep auto (caller may confirm)
  return 'nested';
}

export function extractStrings(flat: Record<string, JsonValue>): string[] {
  const out: string[] = [];
  for (const v of Object.values(flat)) {
    if (typeof v === 'string') out.push(v);
  }
  return out;
}

// placeholder extraction
export function placeholdersBrace(s: string): string[] {
  // {name}
  const re = /\{([a-zA-Z0-9_]+)\}/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) out.push(m[1]!);
  return out;
}

export function placeholdersMustache(s: string): string[] {
  // {{name}}
  const re = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) out.push(m[1]!);
  return out;
}

export function placeholdersPrintf(s: string): string[] {
  // basic printf tokens: %s %d %f %1$s
  const re = /%(?:\d+\$)?[sdif]/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) out.push(m[0]!);
  return out;
}

export function placeholdersRuby(s: string): string[] {
  // %{count}
  const re = /%\{\s*([a-zA-Z0-9_]+)\s*\}/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) out.push(m[1]!);
  return out;
}

export function detectPlaceholderStyle(samples: string[]): PlaceholderStyle {
  const score = { brace: 0, mustache: 0, printf: 0, ruby: 0 };
  for (const s of samples) {
    score.brace += placeholdersBrace(s).length;
    score.mustache += placeholdersMustache(s).length;
    score.printf += placeholdersPrintf(s).length;
    score.ruby += placeholdersRuby(s).length;
  }
  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0]![0];
  if (score[best as keyof typeof score] === 0) return 'brace';
  return best as PlaceholderStyle;
}

export function getPlaceholderExtractor(style: PlaceholderStyle) {
  switch (style) {
    case 'brace':
      return placeholdersBrace;
    case 'mustache':
      return placeholdersMustache;
    case 'printf':
      return placeholdersPrintf;
    case 'ruby':
      return placeholdersRuby;
    default:
      return placeholdersBrace;
  }
}

export function normalizePath(p: string): string {
  return path.resolve(p);
}
