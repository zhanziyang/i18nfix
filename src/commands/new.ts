import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { I18nFixConfig } from '../types.js';
import { readLocaleFile, writeLocaleFile } from '../fileio.js';
import { writeJsonFile } from '../config.js';

export interface NewOptions {
  langs: string[];
  skipExisting: boolean;
  updateConfig: boolean;
  configPath?: string;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function inferLangFromFilename(filePath: string): string | null {
  const base = path.basename(filePath);
  const m = base.match(/^([a-zA-Z]{2,3})([-_][a-zA-Z]{2,4})?\./);
  if (!m) return null;
  return m[1]!.toLowerCase();
}

function replaceLeadingLang(filePath: string, newLang: string): string {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const m = base.match(/^([a-zA-Z]{2,3})([-_][a-zA-Z]{2,4})?(\..+)$/);
  if (!m) {
    return path.join(dir, `${newLang}${path.extname(filePath) || ''}`);
  }
  const rest = m[3]!;
  return path.join(dir, `${newLang}${rest}`);
}

function pickPatternSource(cfg: I18nFixConfig): string {
  // Prefer an existing target path as the pattern source.
  if (cfg.targets?.length) return cfg.targets[0]!;
  return cfg.base;
}

export async function runNew(cfg: I18nFixConfig, opts: NewOptions): Promise<{ created: string[]; skipped: string[]; targets: string[] }> {
  const langs = uniq(opts.langs.map((s) => s.trim()).filter(Boolean));
  if (!langs.length) throw new Error('No --langs provided');

  const baseMeta = await readLocaleFile(cfg.base);
  const baseData = baseMeta.data;

  const patternSource = pickPatternSource(cfg);
  const baseLang = inferLangFromFilename(cfg.base);

  const created: string[] = [];
  const skipped: string[] = [];

  const nextTargets = new Set(cfg.targets ?? []);

  for (const lang of langs) {
    if (baseLang && lang.toLowerCase() === baseLang) continue;

    // If we have an existing pattern (target or base filename starting with lang), follow it.
    let outPath: string;
    const patternLang = inferLangFromFilename(patternSource);
    if (patternLang) {
      outPath = replaceLeadingLang(patternSource, lang);
    } else if (baseLang) {
      outPath = replaceLeadingLang(cfg.base, lang);
    } else {
      // fallback: same dir as base, lang + ext
      outPath = path.join(path.dirname(cfg.base), `${lang}${path.extname(cfg.base)}`);
    }

    try {
      await fs.access(outPath);
      // exists
      skipped.push(outPath);
      if (opts.updateConfig) nextTargets.add(outPath);
      continue;
    } catch {
      // does not exist
    }

    if (opts.skipExisting) {
      // if not exists, still create
    }

    // Create with copied base values (strategy B)
    await writeLocaleFile(outPath, baseData as any, {
      format: baseMeta.format,
      moduleKind: baseMeta.moduleKind,
      // no originalRaw for new files
    });

    created.push(outPath);
    if (opts.updateConfig) nextTargets.add(outPath);
  }

  const targets = Array.from(nextTargets);

  if (opts.updateConfig && opts.configPath) {
    const nextCfg: I18nFixConfig = { ...cfg, targets };
    await writeJsonFile(opts.configPath, nextCfg);
  }

  // print summary
  if (created.length) console.log(chalk.green(`Created ${created.length} file(s).`));
  if (skipped.length) console.log(chalk.gray(`Skipped ${skipped.length} existing file(s).`));

  return { created, skipped, targets };
}
