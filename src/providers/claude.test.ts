import { afterEach, describe, expect, it, vi } from 'vitest';
import { translateClaude } from './claude.js';

describe('translateClaude', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses custom baseUrl when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: '你好' }] }),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    const res = await translateClaude(
      { provider: 'claude', apiKey: 'k', model: 'claude-3-5-haiku-latest', baseUrl: 'https://proxy.example.com/v1/' },
      { text: 'Hello' }
    );

    expect(res.text).toBe('你好');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://proxy.example.com/v1/messages',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
