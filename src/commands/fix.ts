import path from 'node:path';
import { I18nFixConfig, Report } from '../types.js';
import { runCheck } from './check.js';
import { detectKeyStyle, flattenJson, isPlainObject, unflattenJson } from '../i18n.js';
import { readLocaleFile, writeLocaleFile } from '../fileio.js';

export interface FixOptions {
  inPlace: boolean;
  outDir?: string;
  keepExtraKeys: boolean;
  fillMissingWithBase: boolean;
}

export async function runFix(cfg: I18nFixConfig, opts: FixOptions): Promise<Report> {
  const report = await runCheck(cfg);

  let baseJson;
  try {
    baseJson = (await readLocaleFile(cfg.base)).data;
  } catch {
    return report;
  }

  const effectiveKeyStyle = cfg.keyStyle === 'auto' || !cfg.keyStyle ? detectKeyStyle(baseJson) : cfg.keyStyle;
  const baseFlat =
    effectiveKeyStyle === 'nested'
      ? flattenJson(baseJson)
      : (isPlainObject(baseJson) ? (baseJson as any) : {}) as Record<string, any>;

  const ignore = new Set(cfg.ignoreKeys ?? []);
  const baseKeys = Object.keys(baseFlat).filter((k) => !ignore.has(k));
  const baseKeySet = new Set(baseKeys);

  for (const targetFile of cfg.targets) {
    let targetJson: any;
    let targetMeta: any;
    try {
      targetMeta = await readLocaleFile(targetFile);
      targetJson = targetMeta.data;
    } catch {
      continue;
    }

    let targetFlat: Record<string, any> =
      effectiveKeyStyle === 'nested'
        ? flattenJson(targetJson)
        : (isPlainObject(targetJson) ? (targetJson as any) : {}) as Record<string, any>;

    // remove extras
    if (!opts.keepExtraKeys) {
      for (const k of Object.keys(targetFlat)) {
        if (ignore.has(k)) continue;
        if (!baseKeySet.has(k)) delete targetFlat[k];
      }
    }

    // add missing
    for (const k of baseKeys) {
      if (Object.prototype.hasOwnProperty.call(targetFlat, k)) continue;
      targetFlat[k] = opts.fillMissingWithBase ? baseFlat[k] : '';
    }

    // write
    const outObj = effectiveKeyStyle === 'nested' ? unflattenJson(targetFlat) : targetFlat;

    let outPath = targetFile;
    if (!opts.inPlace) {
      const dir = opts.outDir ? path.resolve(opts.outDir) : path.resolve(process.cwd(), 'fixed');
      // keep same filename (incl. extension)
      outPath = path.join(dir, path.basename(targetFile));
    }

    await writeLocaleFile(outPath, outObj, {
      format: targetMeta.format,
      moduleKind: targetMeta.moduleKind,
      originalRaw: targetMeta.raw,
    });
  }

  return report;
}
