import { describe, it, expect } from 'vitest';
import { formatErrWithSnippet } from './errors.js';

describe('formatErrWithSnippet', () => {
  it('includes snippet and caret when loc present', () => {
    const e: any = new Error('boom');
    e.loc = { line: 2, column: 3 };
    const src = 'line1\nline2 here\nline3';
    const out = formatErrWithSnippet(e, src);
    expect(out).toContain('boom');
    expect(out).toContain('line2 here');
    expect(out).toContain('^');
  });
});
