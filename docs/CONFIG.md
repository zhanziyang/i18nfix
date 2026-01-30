# i18nfix Config Reference (`i18nfix.config.json`)

This document explains every supported field in `i18nfix.config.json`.

## Top-level

### `base` (string, required)
Path to the **source** locale file.

Supported formats (common):
- `.json`
- `.yml` / `.yaml`
- `.ts` / `.js` exporting an object (`export default { ... }` or `module.exports = { ... }`)

Example:
```json
{ "base": "locales/en.json" }
```

### `targets` (string[], required)
Paths to **target** locale JSON files.

Example:
```json
{ "targets": ["locales/zh.json", "locales/ja.json"] }
```

### `keyStyle` (`auto` | `nested` | `flat`, optional)
How translation keys are represented.

- `nested`: `{ "home": { "title": "..." } }`
- `flat`: `{ "home.title": "..." }`
- `auto`: detect from the base file

Default: `auto`

### `placeholderStyle` (string or string[], optional)
Which placeholder syntax to validate.

Supported:
- `auto`
- `brace` → `{name}`
- `mustache` → `{{name}}`
- `printf` → `%s`, `%d`, `%1$s`
- `ruby` → `%{count}`

Default: `auto`

### `ignoreKeys` (string[], optional)
Keys to ignore in check/fix/translate.

Default: `[]`

### `treatSameAsBaseAsUntranslated` (boolean, optional)
If true, values in target that exactly equal base are treated as **possibly untranslated**.

Default: `true`

---

## `translate` (object, optional)
Enables LLM translation.

### `translate.provider` (required if `translate` exists)
One of:
- `openai`
- `openrouter`
- `claude`
- `gemini`

### `translate.apiKeyEnv` (recommended)
Name of the environment variable holding the API key.

Examples:
- OpenAI: `OPENAI_API_KEY`
- OpenRouter: `OPENROUTER_API_KEY`
- Claude: `ANTHROPIC_API_KEY`
- Gemini: `GEMINI_API_KEY`

> i18nfix auto-loads `.env` in the current directory.

### `translate.apiKey` (not recommended)
You *can* inline a key here, but it is easy to leak/commit by accident. Prefer `apiKeyEnv`.

### `translate.model` (optional)
Provider model name.

Examples:
- OpenAI: `gpt-4o-mini`
- OpenRouter: `anthropic/claude-3.5-sonnet`
- Claude: `claude-3-5-haiku-latest`
- Gemini: `gemini-1.5-flash`

### `translate.baseUrl` (optional)
For OpenAI-compatible endpoints (mainly for self-hosted proxies). Usually not needed.

### `translate.maxItems` (number, optional)
Safety limit: maximum strings translated **per run**.

Default: (no limit)

If `maxItems` is set, i18nfix will translate at most that many strings per run and print how many remain.

### `translate.delayMs` (number, optional)
Delay between requests (ms). Useful for rate limits.

Default: `0`

### `translate.batchSize` (number, optional)
Batch size per LLM request.

Default: `25` (OpenAI often works well with 25–50)

### `translate.concurrency` (number, optional)
How many LLM requests to run in parallel.

Default: `3`

## Translation quality/safety

In batch mode, i18nfix will validate placeholder consistency. If a translated string is missing or has mismatched placeholders, it will automatically retry that item in single-item mode.

---

## Full example

```json
{
  "base": "locales/en.json",
  "targets": ["locales/zh.json"],
  "keyStyle": "auto",
  "placeholderStyle": ["auto"],
  "ignoreKeys": [],
  "treatSameAsBaseAsUntranslated": true,
  "translate": {
    "provider": "openai",
    "apiKeyEnv": "OPENAI_API_KEY",
    "model": "gpt-4o-mini",
    "maxItems": 200,
    "delayMs": 0
  }
}
```
