export type KeyStyle = 'auto' | 'nested' | 'flat';
export type PlaceholderStyle = 'auto' | 'brace' | 'mustache' | 'printf';

export interface I18nFixConfig {
  base: string;
  targets: string[];
  keyStyle?: KeyStyle;
  placeholderStyle?: PlaceholderStyle | PlaceholderStyle[];
  ignoreKeys?: string[];
  treatSameAsBaseAsUntranslated?: boolean;
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
