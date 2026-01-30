import { TranslateOptions, TranslateRequest, TranslateResponse } from './types.js';
import { translateOpenAICompatible } from './openaiCompatible.js';
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
