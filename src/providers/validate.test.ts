import { describe, it, expect } from 'vitest';
import { placeholderOk } from './validate.js';

describe('placeholderOk', () => {
  it('brace ok', () => {
    expect(placeholderOk('brace', 'Hello {name}', '你好 {name}')).toBe(true);
    expect(placeholderOk('brace', 'Hello {name}', '你好 {username}')).toBe(false);
  });

  it('ruby ok', () => {
    expect(placeholderOk('ruby', 'il y a %{count} secondes', 'il y a %{count} secondes')).toBe(true);
    expect(placeholderOk('ruby', 'il y a %{count} secondes', 'il y a %{cnt} secondes')).toBe(false);
  });
});
