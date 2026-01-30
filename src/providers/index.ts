import { TranslateOptions, TranslateRequest, TranslateResponse } from './types.js';
import { translateOpenAICompatible } from './openaiCompatible.js';
import { translateBatchOpenAI } from './openaiBatch.js';
import type { BatchResult } from './openaiBatch.js';
import { translateClaude } from './claude.js';
import { translateGemini } from './gemini.js';

export async function translate(opts: TranslateOptions, req: TranslateRequest): Promise<TranslateResponse> {
  switch (opts.provider) {
    case 'openai':
      return translateOpenAICompatible({ ...opts, baseUrl: opts.baseUrl ?? 'https://api.openai.com/v1' }, req);
    case 'openrouter':
      return translateOpenAICompatible({ ...opts, baseUrl: opts.baseUrl ?? 'https://openrouter.ai/api/v1' }, req);
    case 'claude':
      return translateClaude(opts, req);
    case 'gemini':
      return translateGemini(opts, req);
    default:
      throw new Error(`Unsupported provider: ${(opts as any).provider}`);
  }
}

export async function translateBatch(
  opts: TranslateOptions,
  items: { key: string; text: string }[],
  ctx: { sourceLang?: string; targetLang?: string }
): Promise<BatchResult> {
  if (opts.provider === 'openai' || opts.provider === 'openrouter') {
    return translateBatchOpenAI(opts, items as any, ctx);
  }
  // fallback: per-item translate
  const map: Record<string, string> = {};
  for (const it of items) {
    const r = await translate(opts, { text: it.text, sourceLang: ctx.sourceLang, targetLang: ctx.targetLang });
    map[it.key] = r.text;
  }
  return { map, duplicates: [], extras: [] };
}
