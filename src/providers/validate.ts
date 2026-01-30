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
