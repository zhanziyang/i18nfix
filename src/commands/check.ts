import { I18nFixConfig, Report } from '../types.js';
import { addIssue, makeEmptyReport } from '../report.js';
import {
  detectKeyStyle,
  detectPlaceholderStyle,
  extractStrings,
  flattenJson,
  getPlaceholderExtractor,
  isPlainObject,
} from '../i18n.js';
import { readLocaleFile } from '../fileio.js';

function uniqSorted(arr: string[]) {
  return Array.from(new Set(arr)).sort();
}

function placeholderSet(extract: (s: string) => string[], s: string) {
  return uniqSorted(extract(s));
}

function eqArr(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export async function runCheck(cfg: I18nFixConfig): Promise<Report> {
  const report = makeEmptyReport(cfg.base, cfg.targets);

  let baseJson;
  try {
    baseJson = (await readLocaleFile(cfg.base)).data;
  } catch (e: any) {
    addIssue(report, { type: 'parse_error', file: cfg.base, message: `Failed to read base locale file: ${e?.message ?? e}` });
    return report;
  }

  // detect key/placeholder style if auto
  const effectiveKeyStyle = cfg.keyStyle === 'auto' || !cfg.keyStyle ? detectKeyStyle(baseJson) : cfg.keyStyle;
  const baseFlat =
    effectiveKeyStyle === 'nested'
      ? flattenJson(baseJson)
      : (isPlainObject(baseJson) ? (baseJson as any) : {}) as Record<string, any>;

  const placeholderStyle = Array.isArray(cfg.placeholderStyle)
    ? cfg.placeholderStyle
    : cfg.placeholderStyle === 'auto' || !cfg.placeholderStyle
      ? detectPlaceholderStyle(extractStrings(baseFlat).slice(0, 200))
      : cfg.placeholderStyle;

  const placeholderStyles = Array.isArray(placeholderStyle) ? placeholderStyle : [placeholderStyle];
  const extractors = placeholderStyles.map((s) => ({ style: s, extract: getPlaceholderExtractor(s === 'auto' ? 'brace' : s) }));

  const ignore = new Set(cfg.ignoreKeys ?? []);
  const baseKeys = Object.keys(baseFlat).filter((k) => !ignore.has(k));

  for (const targetFile of cfg.targets) {
    let targetJson;
    try {
      targetJson = (await readLocaleFile(targetFile)).data;
    } catch (e: any) {
      addIssue(report, { type: 'parse_error', file: targetFile, message: `Failed to read target locale file: ${e?.message ?? e}` });
      continue;
    }

    const targetFlat =
      effectiveKeyStyle === 'nested'
        ? flattenJson(targetJson)
        : (isPlainObject(targetJson) ? (targetJson as any) : {}) as Record<string, any>;

    const targetKeys = Object.keys(targetFlat).filter((k) => !ignore.has(k));
    const targetKeySet = new Set(targetKeys);

    // missing keys
    for (const k of baseKeys) {
      if (!targetKeySet.has(k)) {
        addIssue(report, { type: 'missing_key', file: targetFile, key: k, message: `Missing key: ${k}` });
      }
    }

    // extra keys
    const baseKeySet = new Set(baseKeys);
    for (const k of targetKeys) {
      if (!baseKeySet.has(k)) {
        addIssue(report, { type: 'extra_key', file: targetFile, key: k, message: `Extra key not in base: ${k}` });
      }
    }

    // value checks
    for (const k of baseKeys) {
      if (!targetKeySet.has(k)) continue;
      const baseVal = baseFlat[k];
      const targetVal = targetFlat[k];
      if (typeof targetVal === 'string' && targetVal.trim().length === 0) {
        addIssue(report, { type: 'empty_value', file: targetFile, key: k, message: `Empty value for key: ${k}` });
      }
      if (cfg.treatSameAsBaseAsUntranslated && typeof baseVal === 'string' && typeof targetVal === 'string') {
        if (baseVal === targetVal) {
          addIssue(report, { type: 'untranslated', file: targetFile, key: k, message: `Value equals base (possibly untranslated): ${k}` });
        }
      }

      // placeholder mismatch
      if (typeof baseVal === 'string' && typeof targetVal === 'string') {
        for (const { style, extract } of extractors) {
          const a = placeholderSet(extract, baseVal);
          const b = placeholderSet(extract, targetVal);
          if (!eqArr(a, b)) {
            addIssue(report, {
              type: 'placeholder_mismatch',
              file: targetFile,
              key: k,
              message: `Placeholder mismatch (${style}) for key: ${k}`,
              details: { base: a, target: b, style },
            });
          }
        }
      }
    }
  }

  return report;
}
