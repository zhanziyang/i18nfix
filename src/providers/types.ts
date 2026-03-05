export type ProviderName = 'openai' | 'openrouter' | 'claude' | 'gemini';

export interface TranslateOptions {
  provider: ProviderName;
  apiKey: string;
  model?: string;
  // provider API base URL override (openai/openrouter/claude)
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
