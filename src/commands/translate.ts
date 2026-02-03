import path from 'node:path';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { I18nFixConfig, TranslateConfig } from '../types.js';
import { detectKeyStyle, flattenJson, getPlaceholderExtractor, isPlainObject, unflattenJson } from '../i18n.js';
import { readLocaleFile, writeLocaleFile } from '../fileio.js';
import { TranslationCache } from '../cache.js';
import { translate as doTranslate, translateBatch } from '../providers/index.js';
import { runCheck } from './check.js';
import { sleep } from '../providers/util.js';
import { mapLimit } from '../providers/pool.js';
import { withRetry } from '../providers/retry.js';


function inferSourceLang(filePath: string): string | undefined {
  const base = path.basename(filePath);
  const m = base.match(/^([a-zA-Z]{2,3})([-_][a-zA-Z]{2,4})?\./);
  if (!m) return undefined;
  return m[1]!.toLowerCase();
}

function inferTargetLang(filePath: string): string | undefined {
  const base = path.basename(filePath);
  // common patterns: zh.json, zh-CN.json, pt_BR.json, en-US.json
  const m = base.match(/^([a-zA-Z]{2,3})([-_][a-zA-Z]{2,4})?\./);
  if (!m) return undefined;
  return m[1]!.toLowerCase();
}

export interface TranslateRunOptions {
  inPlace: boolean;
  outDir?: string;
  mode: 'missing' | 'empty' | 'untranslated' | 'all';
  showLangs?: boolean;
  printText?: boolean;
  failFast?: boolean;
}


function getApiKey(tc: TranslateConfig): string {
  if (tc.apiKey) return tc.apiKey;
  const env = tc.apiKeyEnv;
  if (env && process.env[env]) return process.env[env]!;
  // fallbacks by provider
  const fallbackEnvByProvider: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    claude: 'ANTHROPIC_API_KEY',
    gemini: 'GEMINI_API_KEY',
  };
  const f = fallbackEnvByProvider[tc.provider];
  if (f && process.env[f]) return process.env[f]!;
  throw new Error(
    `Missing API key. Set translate.apiKeyEnv in config or export ${f ?? 'PROVIDER_API_KEY'} in your shell.`
  );
}

export async function runTranslate(cfg: I18nFixConfig, opts: TranslateRunOptions) {
  const tc = cfg.translate;
  if (!tc) throw new Error('Config missing translate section. Add translate: { provider, apiKeyEnv, model }');

  let totalTranslated = 0;
  let totalFailed = 0;

  const apiKey = getApiKey(tc);
  const delayMs = tc.delayMs ?? 0;
  const maxItems = tc.maxItems;
  const batchSize = tc.batchSize ?? 25;
  const concurrency = tc.concurrency ?? 3;
  const retryCount = tc.retryCount ?? 3;
  const retryBaseDelayMs = tc.retryBaseDelayMs ?? 400;
  const cacheEnabled = tc.cache ?? true;
  const cache = new TranslationCache(process.cwd());
  if (cacheEnabled) await cache.load();

  let baseJson: any;
  baseJson = (await readLocaleFile(cfg.base)).data;

  const effectiveKeyStyle = cfg.keyStyle === 'auto' || !cfg.keyStyle ? detectKeyStyle(baseJson) : cfg.keyStyle;
  const baseFlat =
    effectiveKeyStyle === 'nested'
      ? flattenJson(baseJson)
      : (isPlainObject(baseJson) ? (baseJson as any) : {}) as Record<string, any>;

  const placeholderStyle = Array.isArray(cfg.placeholderStyle) ? cfg.placeholderStyle[0] : (cfg.placeholderStyle ?? 'brace');
  const extractor = getPlaceholderExtractor(placeholderStyle === 'auto' ? 'brace' : placeholderStyle);

  const ignore = new Set(cfg.ignoreKeys ?? []);
  const baseKeys = Object.keys(baseFlat).filter((k) => !ignore.has(k));

  const modeKeysByFile: Map<string, Set<string>> = new Map();
  if (opts.mode === 'all') {
    const report = await runCheck(cfg, { failFast: opts.failFast });
    for (const issue of report.issues) {
      if (!issue.key) continue;
      if (issue.type === 'missing_key' || issue.type === 'empty_value' || issue.type === 'untranslated' || issue.type === 'placeholder_mismatch') {
        const s = modeKeysByFile.get(issue.file) ?? new Set();
        s.add(issue.key);
        modeKeysByFile.set(issue.file, s);
      }
    }
  }

  // progress bars
  const totalToTranslateByFile: Record<string, number> = {};
  for (const tf of cfg.targets) {
    // count quickly using report issue set if mode=all, else approximate from base keys later
    totalToTranslateByFile[tf] = 0;
  }

  let totalPlanned = 0;
  let totalDone = 0;
  const totalBar = new cliProgress.SingleBar({
    format: 'TOTAL |{bar}| {value}/{total} ({percentage}%)',
    hideCursor: true,
  }, cliProgress.Presets.shades_classic);
  // we will start it once we know the total

  for (const targetFile of cfg.targets) {
    let targetJson: any;
    let targetMeta: any;
    targetMeta = await readLocaleFile(targetFile);
    targetJson = targetMeta.data;

    let targetFlat: Record<string, any> =
      effectiveKeyStyle === 'nested'
        ? flattenJson(targetJson)
        : (isPlainObject(targetJson) ? (targetJson as any) : {}) as Record<string, any>;

    const targetKeys = new Set(Object.keys(targetFlat).filter((k) => !ignore.has(k)));

    const toTranslate: string[] = [];

    const issueSet = modeKeysByFile.get(targetFile);

    for (const k of baseKeys) {
      const baseVal = baseFlat[k];
      const has = targetKeys.has(k);
      const targetVal = targetFlat[k];

      if (typeof baseVal !== 'string' || !baseVal.trim()) continue;

      if (opts.mode === 'missing' && !has) toTranslate.push(k);
      else if (opts.mode === 'empty' && has && typeof targetVal === 'string' && targetVal.trim().length === 0) toTranslate.push(k);
      else if (opts.mode === 'untranslated' && has && cfg.treatSameAsBaseAsUntranslated && targetVal === baseVal) toTranslate.push(k);
      else if (opts.mode === 'all' && issueSet && issueSet.has(k)) toTranslate.push(k);
    }

    const total = toTranslate.length;
    const effectiveMax = typeof maxItems === 'number' && maxItems > 0 ? maxItems : undefined;
    const items = effectiveMax ? toTranslate.slice(0, effectiveMax) : toTranslate;
    const remaining = effectiveMax ? Math.max(0, total - items.length) : 0;
    if (effectiveMax && total > effectiveMax) {
      console.log(chalk.yellow(`Note: ${total} items match, but maxItems=${effectiveMax}. This run will translate ${items.length} and leave ${remaining} for the next run.`));
    }

    if (items.length === 0) {
      console.log(chalk.gray(`No items to translate for ${targetFile} (mode=${opts.mode}).`));
      continue;
    }

    // initialize total bar when first file is processed
    totalPlanned += items.length;
    if (!totalBar.isActive) {
      totalBar.start(totalPlanned, totalDone);
    } else {
      totalBar.setTotal(totalPlanned);
    }

    const fileBar = new cliProgress.SingleBar({
      format: `${path.basename(targetFile)} |{bar}| {value}/{total} ({percentage}%)`,
      hideCursor: true,
    }, cliProgress.Presets.shades_classic);
    fileBar.start(items.length, 0);

    const fromLang = tc.sourceLang ?? inferSourceLang(cfg.base) ?? 'auto';
    const toLang = tc.targetLang ?? inferTargetLang(targetFile) ?? 'auto';
    if (opts.showLangs) {
      console.log(chalk.gray(`from: ${fromLang}  ->  to: ${toLang}`));
    }
    console.log(chalk.bold(`Translating ${items.length} items for ${targetFile} (mode=${opts.mode})...`));

    const batches: string[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    let done = 0;
    let translatedCount = 0;
    let failedCount = 0;

    await mapLimit(batches, concurrency, async (batch) => {
      const payload = batch.map((k) => ({ key: k, text: String(baseFlat[k]) }));

      // first try batch
      let result: { map: Record<string, string>; duplicates: string[]; extras: string[] } = { map: {}, duplicates: [], extras: [] };
      try {
        result = await withRetry(() => translateBatch(
          { provider: tc.provider, apiKey, model: tc.model, baseUrl: tc.baseUrl },
          payload,
          { sourceLang: fromLang === 'auto' ? undefined : fromLang, targetLang: toLang }
        ), { retries: retryCount, baseDelayMs: retryBaseDelayMs });
        // strict-ish structure warnings
        if (result.extras.length) {
          console.warn(chalk.yellow(`\nBatch returned extra keys (ignored): ${result.extras.slice(0, 5).join(', ')}${result.extras.length > 5 ? '…' : ''}`));
        }
        if (result.duplicates.length) {
          console.warn(chalk.yellow(`\nBatch returned duplicate keys: ${result.duplicates.slice(0, 5).join(', ')}${result.duplicates.length > 5 ? '…' : ''}`));
        }
      } catch (e: any) {
        console.warn(chalk.yellow(`\nBatch translate failed; falling back to single-item mode for this batch. (${e?.message ?? e})`));
      }

      for (const k of batch) {
        const baseText = String(baseFlat[k]);
        // cache hit
        const cached = cacheEnabled ? cache.get({ provider: tc.provider, model: tc.model, sourceLang: fromLang === 'auto' ? undefined : fromLang, targetLang: toLang, text: baseText }) : undefined;
        let translated = cached ?? result.map[k];

        // validate placeholders; if invalid or missing, retry single-item
        if (!translated || !translated.trim()) {
          // fallback single-item
          try {
            const r = await withRetry(() => doTranslate(
              { provider: tc.provider, apiKey, model: tc.model, baseUrl: tc.baseUrl },
              { text: baseText, sourceLang: fromLang === 'auto' ? undefined : fromLang, targetLang: toLang, placeholderHints: extractor(baseText) }
            ), { retries: retryCount, baseDelayMs: retryBaseDelayMs });
            translated = r.text;
          } catch {
            translated = '';
          }
        } else {
          // placeholder mismatch fallback
          try {
            const { formatOk } = await import('../providers/validate.js');
            const ok = formatOk(placeholderStyle === 'auto' ? 'brace' : (placeholderStyle as any), baseText, translated);
            if (!ok) {
              const r = await withRetry(() => doTranslate(
                { provider: tc.provider, apiKey, model: tc.model, baseUrl: tc.baseUrl },
                { text: baseText, sourceLang: fromLang === 'auto' ? undefined : fromLang, targetLang: toLang, placeholderHints: extractor(baseText) }
              ), { retries: retryCount, baseDelayMs: retryBaseDelayMs });
              translated = r.text;
            }
          } catch {
            // ignore validation errors
          }
        }

        if (translated && translated.trim()) {
          targetFlat[k] = translated;
          translatedCount++;
          totalTranslated++;
          if (cacheEnabled && !cached) {
            await cache.set({ provider: tc.provider, model: tc.model, sourceLang: fromLang === 'auto' ? undefined : fromLang, targetLang: toLang, text: baseText }, translated);
          }
          if (opts.printText) {
            console.log();
            console.log(chalk.cyan(k));
            console.log(chalk.gray(`BASE: ${baseText}`));
            console.log(chalk.green(`TRNS: ${translated}`));
          }
        } else {
          failedCount++;
          totalFailed++;
          if (opts.failFast) {
            throw new Error(`Translation failed for key: ${k} (${targetFile})`);
          }
        }

        done++;
        fileBar.update(done);
        totalDone++;
        totalBar.update(totalDone);
      }

      if (delayMs) await sleep(delayMs);
    });
    fileBar.stop();

    // write
    const outObj = effectiveKeyStyle === 'nested' ? unflattenJson(targetFlat) : targetFlat;

    let outPath = targetFile;
    if (!opts.inPlace) {
      const dir = opts.outDir ? path.resolve(opts.outDir) : path.resolve(process.cwd(), 'translated');
      outPath = path.join(dir, path.basename(targetFile));
    }

    await writeLocaleFile(outPath, outObj, {
      format: targetMeta.format,
      moduleKind: targetMeta.moduleKind,
      originalRaw: targetMeta.raw,
    });
    console.log(chalk.green(`Wrote: ${outPath}`));

    const summaryLine = `Translated: ${translatedCount}/${items.length}` + (failedCount ? `  Failed: ${failedCount}` : '');
    console.log(failedCount ? chalk.yellow(summaryLine) : chalk.gray(summaryLine));

    if (remaining > 0) {
      console.log(chalk.gray(`Next: re-run translate to process remaining items, or increase translate.maxItems in config.`));
    }
  }
  if (totalBar.isActive) totalBar.stop();

  if (totalFailed > 0) {
    throw new Error(`Translation failed for ${totalFailed} item(s).`);
  }
}

// ensure total bar stops
