import { afterEach, describe, expect, it, vi } from 'vitest';
import { translateBatchOpenAI } from './openaiBatch.js';

describe('translateBatchOpenAI', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const items = [{ key: 'hello', text: 'Hello' }];

  it('parses {items:[...]} batch output', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ items: [{ key: 'hello', text: '你好' }] }) } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    const res = await translateBatchOpenAI({ provider: 'openai', apiKey: 'k', baseUrl: 'https://x/v1' }, items, {});
    expect(res.map.hello).toBe('你好');
  });

  it('parses plain array batch output for compatibility', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify([{ key: 'hello', text: '你好' }]) } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    const res = await translateBatchOpenAI({ provider: 'openai', apiKey: 'k', baseUrl: 'https://x/v1' }, items, {});
    expect(res.map.hello).toBe('你好');
  });

  it('parses key->text object output for compatibility', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ hello: '你好' }) } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    const res = await translateBatchOpenAI({ provider: 'openai', apiKey: 'k', baseUrl: 'https://x/v1' }, items, {});
    expect(res.map.hello).toBe('你好');
  });
});
