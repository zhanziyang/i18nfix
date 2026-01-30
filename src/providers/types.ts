export type ProviderName = 'openai' | 'openrouter' | 'claude' | 'gemini';

export interface TranslateOptions {
  provider: ProviderName;
  apiKey: string;
  model?: string;
  // openrouter/openai-compatible override
  baseUrl?: string;
}

export interface TranslateRequest {
  sourceLang?: string;
  targetLang?: string;
  text: string;
  // help the model preserve placeholders
  placeholderHints?: string[];
}

export interface TranslateResponse {
  text: string;
  raw?: unknown;
}
