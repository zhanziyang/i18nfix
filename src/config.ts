import fs from 'node:fs/promises';
import path from 'node:path';
import { I18nFixConfig, KeyStyle, PlaceholderStyle } from './types.js';

export const DEFAULT_CONFIG_FILENAME = 'i18nfix.config.json';

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const raw = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(filePath, raw, 'utf8');
}

export function resolveConfigPath(p?: string): string {
  if (p) return path.resolve(p);
  return path.resolve(process.cwd(), DEFAULT_CONFIG_FILENAME);
}

export async function loadConfig(configPath: string): Promise<I18nFixConfig> {
  const cfg = await readJsonFile<I18nFixConfig>(configPath);
  if (!cfg.base) throw new Error(`Config missing required field: base`);
  if (!cfg.targets || !Array.isArray(cfg.targets) || cfg.targets.length === 0) {
    throw new Error(`Config missing required field: targets (non-empty array)`);
  }
  return cfg;
}

export function normalizeKeyStyle(v?: string): KeyStyle {
  if (!v) return 'auto';
  if (v === 'auto' || v === 'nested' || v === 'flat') return v;
  throw new Error(`Invalid --key-style: ${v}`);
}

export function normalizePlaceholderStyle(v?: string): PlaceholderStyle | PlaceholderStyle[] {
  if (!v) return 'auto';
  // allow comma-separated list
  const parts = v.split(',').map((s) => s.trim()).filter(Boolean);
  const norm = (p: string): PlaceholderStyle => {
    if (p === 'auto' || p === 'brace' || p === 'mustache' || p === 'printf' || p === 'ruby') return p;
    throw new Error(`Invalid --placeholder-style: ${p}`);
  };
  if (parts.length === 1) return norm(parts[0]!);
  return parts.map(norm);
}

export function mergeConfig(
  base: I18nFixConfig,
  overrides: Partial<I18nFixConfig> & { keyStyle?: KeyStyle; placeholderStyle?: PlaceholderStyle | PlaceholderStyle[] }
): I18nFixConfig {
  return {
    base: overrides.base ?? base.base,
    targets: overrides.targets ?? base.targets,
    keyStyle: overrides.keyStyle ?? base.keyStyle ?? 'auto',
    placeholderStyle: overrides.placeholderStyle ?? base.placeholderStyle ?? 'auto',
    ignoreKeys: overrides.ignoreKeys ?? base.ignoreKeys ?? [],
    treatSameAsBaseAsUntranslated:
      overrides.treatSameAsBaseAsUntranslated ?? base.treatSameAsBaseAsUntranslated ?? true,
    // preserve translate config unless explicitly overridden
    translate: overrides.translate ?? base.translate,
  };
}
