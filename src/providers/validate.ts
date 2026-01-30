import { getPlaceholderExtractor } from '../i18n.js';
import type { PlaceholderStyle } from '../types.js';

export function placeholderOk(style: PlaceholderStyle, baseText: string, translatedText: string): boolean {
  const extract = getPlaceholderExtractor(style === 'auto' ? 'brace' : style);
  const a = extract(baseText).slice().sort();
  const b = extract(translatedText).slice().sort();
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function extractHtmlTags(s: string): string[] {
  const re = /<\/?[^>]+?>/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) out.push(m[0]!);
  return out;
}

export function htmlOk(baseText: string, translatedText: string): boolean {
  const a = extractHtmlTags(baseText).slice().sort();
  const b = extractHtmlTags(translatedText).slice().sort();
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function markdownTokenCounts(s: string): Record<string, number> {
  const tokens = ['`', '**', '__'];
  const out: Record<string, number> = {};
  for (const t of tokens) {
    const re = new RegExp(t.replace(/([\\*])/g, '\\$1'), 'g');
    out[t] = (s.match(re) ?? []).length;
  }
  return out;
}

export function markdownOk(baseText: string, translatedText: string): boolean {
  const a = markdownTokenCounts(baseText);
  const b = markdownTokenCounts(translatedText);
  for (const k of Object.keys(a)) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export function formatOk(style: PlaceholderStyle, baseText: string, translatedText: string): boolean {
  return placeholderOk(style, baseText, translatedText) && htmlOk(baseText, translatedText) && markdownOk(baseText, translatedText);
}
