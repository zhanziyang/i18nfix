export type KeyStyle = 'auto' | 'nested' | 'flat';
export type PlaceholderStyle = 'auto' | 'brace' | 'mustache' | 'printf' | 'ruby';

export interface TranslateConfig {
  provider: 'openai' | 'openrouter' | 'claude' | 'gemini';
  /** Prefer env vars over storing keys in config. */
  apiKeyEnv?: string;
  /** If you insist, you can store the key here (not recommended). */
  apiKey?: string;
  model?: string;
  /** For openai-compatible providers (mainly for self-hosted proxies). */
  baseUrl?: string;
  /** Optional language hint, e.g. "en" */
  sourceLang?: string;
  /** Optional language hint, e.g. "zh" */
  targetLang?: string;
  /** Max strings per run (safety). */
  maxItems?: number;
  /** Batch size per LLM request (performance). */
  batchSize?: number;
  /** Concurrency of LLM requests (performance). */
  concurrency?: number;
  /** Retry count for single-item fallback (stability). */
  retryCount?: number;
  /** Base retry delay (ms) for backoff (stability). */
  retryBaseDelayMs?: number;
  /** Delay between requests (ms). */
  delayMs?: number;
}

export interface I18nFixConfig {
  base: string;
  targets: string[];
  keyStyle?: KeyStyle;
  placeholderStyle?: PlaceholderStyle | PlaceholderStyle[];
  ignoreKeys?: string[];
  treatSameAsBaseAsUntranslated?: boolean;
  translate?: TranslateConfig;
}

export interface Issue {
  type:
    | 'missing_key'
    | 'extra_key'
    | 'empty_value'
    | 'untranslated'
    | 'placeholder_mismatch'
    | 'parse_error';
  key?: string;
  file: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface Report {
  base: string;
  targets: string[];
  issues: Issue[];
  summary: {
    missingKeys: number;
    extraKeys: number;
    emptyValues: number;
    untranslated: number;
    placeholderMismatches: number;
    parseErrors: number;
  };
}


export interface RunOptions {
  failFast?: boolean;
}
