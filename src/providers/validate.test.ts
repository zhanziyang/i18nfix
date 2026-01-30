import { describe, it, expect } from 'vitest';
import { placeholderOk, htmlOk, markdownOk } from './validate.js';

describe('validate', () => {
  it('brace placeholders ok', () => {
    expect(placeholderOk('brace', 'Hello {name}', '你好 {name}')).toBe(true);
    expect(placeholderOk('brace', 'Hello {name}', '你好 {username}')).toBe(false);
  });

  it('ruby placeholders ok', () => {
    expect(placeholderOk('ruby', 'il y a %{count} secondes', 'il y a %{count} secondes')).toBe(true);
    expect(placeholderOk('ruby', 'il y a %{count} secondes', 'il y a %{cnt} secondes')).toBe(false);
  });

  it('html tags ok', () => {
    expect(htmlOk('Click <b>here</b>', 'Cliquez <b>ici</b>')).toBe(true);
    expect(htmlOk('Click <b>here</b>', 'Cliquez ici')).toBe(false);
  });

  it('markdown token counts ok', () => {
    expect(markdownOk('**Hello** `code`', '**Bonjour** `code`')).toBe(true);
    expect(markdownOk('**Hello** `code`', '*Bonjour* `code`')).toBe(false);
  });
});
