# i18nfix

A CLI to **check**, **fix**, and **translate** i18n JSON locale files.

What it can do:
- Detect issues: missing keys, extra keys, empty values, possibly-untranslated values, placeholder mismatches
- Fix structure: add missing keys (optionally fill with base), optionally remove extras
- Translate only the *problematic* keys using an LLM provider (OpenAI / Claude / Gemini / OpenRouter)

> Status: MVP / work in progress.

## Requirements

- Node.js >= 18

## Install

```bash
git clone https://github.com/zhanziyang/i18nfix.git
cd i18nfix
npm install
npm run build

node dist/cli.js --help
```

## Quick start (recommended workflow)

### 1) Create/update config (Q&A)

```bash
# create
node dist/cli.js init

# update later via Q&A
node dist/cli.js config
```

This writes `i18nfix.config.json` in the current directory.

### 2) Check

```bash
node dist/cli.js check
# JSON report
node dist/cli.js check --json
```

### 3) Fix + Translate (one command)

```bash
# fix output to ./fixed
# then translate output to ./translated
node dist/cli.js fix --out-dir fixed --translate --translate-out-dir translated
```

Fix and translate into the **same directory** (e.g. `dist-locales/`):

```bash
node dist/cli.js fix --out-dir dist-locales --translate --translate-out-dir dist-locales
```

Fix and translate **in-place** (overwrite your target files):

```bash
node dist/cli.js fix --in-place --translate
```

Verbose (prints BASE/TRNS for each translated key):

```bash
node dist/cli.js fix --out-dir fixed --translate --translate-out-dir translated -v
```

## Example included

Try the included example files:

```bash
node dist/cli.js check --config examples/i18nfix.config.json
node dist/cli.js fix --config examples/i18nfix.config.json --out-dir examples/fixed --translate --translate-out-dir examples/translated
```

What the example demonstrates:
- `zh.json` is missing `app.cta` (will be added)
- `home.subtitle` is identical to base (flagged as possibly untranslated)
- placeholder mismatch: `{name}` vs `{username}`
- printf mismatch: `%s` vs `%d`
- extra key: `app.extraKey`

## Config file

Default filename: `i18nfix.config.json`

Minimal example:

```json
{
  "base": "locales/en.json",
  "targets": ["locales/zh.json"],
  "keyStyle": "auto",
  "placeholderStyle": ["auto"],
  "ignoreKeys": [],
  "treatSameAsBaseAsUntranslated": true
}
```

## Translate (LLM providers)

Keys should be provided via environment variables (recommended). i18nfix will also auto-load a local `.env` file.

Example:

```json
{
  "translate": {
    "provider": "openai",
    "apiKeyEnv": "OPENAI_API_KEY",
    "model": "gpt-4o-mini",
    "delayMs": 0,
    "maxItems": 200
  }
}
```

Supported providers:
- `openai` (env: `OPENAI_API_KEY`)
- `openrouter` (env: `OPENROUTER_API_KEY`) — OpenAI-compatible endpoint
- `claude` (env: `ANTHROPIC_API_KEY`)
- `gemini` (env: `GEMINI_API_KEY`)

Language handling:
- `targetLang` is inferred from the target filename when not provided (e.g. `zh.json`, `ja.json`, `fr-FR.json` → `zh`, `ja`, `fr`).
- from/to languages are printed by default during translation. Use `translate --no-show-langs` to hide.

## Full documentation

- CLI reference: `docs/CLI.md`
- Config reference: `docs/CONFIG.md`

## CLI notes

- `translate --mode`:
  - default is `all` (only keys with issues)
  - `missing` / `empty` / `untranslated` are narrower modes
- `maxItems`:
  - if there are more than `maxItems` keys to translate, it will translate the first batch and print how many remain.

## Roadmap

- Better placeholder detection (ICU message format, etc.)
- Array handling
- GitHub PR mode

## License

MIT
