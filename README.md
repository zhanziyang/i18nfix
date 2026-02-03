# i18nfix

**Write one language. Ship all languages.**

A CLI to **check**, **fix**, and **translate** i18n locale files.

Supported formats (common):
- JSON: `.json`
- YAML: `.yml` / `.yaml`
- JS/TS modules exporting an object: `.js` / `.ts` (`export default { ... }` or `module.exports = { ... }`)

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

i18nfix --help
```


## Getting started (integrate into an existing project)

### 1) Install

```bash
npm i -D i18nfix
```

### 2) Create/update config (Q&A)

```bash
npx i18nfix config
```

This writes `i18nfix.config.json` in your project root.

### 3) (Optional) Create new language files

If you currently only have one language and want to scaffold additional languages:

```bash
# create ja.ts / fr.ts (skips existing files)
i18nfix new --langs fr,ja
```

By default, i18nfix will follow an existing filename pattern if present (e.g. `en.ts` → `fr.ts`).

### 4) Add npm scripts

Add to your project's `package.json`:

```json
{
  "scripts": {
    "i18n:config": "i18nfix config",
    "i18n:check": "i18nfix check",
    "i18n:fix": "i18nfix fix --out-dir fixed",
    "i18n:fix:inplace": "i18nfix fix --in-place",
    "i18n:fix:drop-extra": "i18nfix fix --in-place --drop-extra-keys",
    "i18n:fix:translate": "i18nfix fix --in-place --translate",
    "i18n:fix:translate:verbose": "i18nfix fix --in-place --translate -v"
  }
}
```

### 5) (Optional) Enable translation via `.env`

Create `.env` in your project root:

```env
OPENAI_API_KEY=xxx
# or: OPENROUTER_API_KEY / ANTHROPIC_API_KEY / GEMINI_API_KEY
```

Then add a `translate` section to `i18nfix.config.json`:

```json
{
  "translate": {
    "provider": "openai",
    "apiKeyEnv": "OPENAI_API_KEY",
    "model": "gpt-4o-mini",
    "batchSize": 50,
    "concurrency": 3,
    "delayMs": 0
  }
}
```

### 5) CI example (GitHub Actions)

Create `.github/workflows/i18nfix.yml`:

```yaml
name: i18nfix

on:
  pull_request:
  push:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run i18n:check
```

## Quick start (recommended workflow)

### 1) Create/update config (Q&A)

```bash
# create
i18nfix init

# update later via Q&A
i18nfix config
```

This writes `i18nfix.config.json` in the current directory.

### 2) Check

```bash
i18nfix check
# JSON report
i18nfix check --json
```

### 3) Fix + Translate (one command)

```bash
# fix output to ./fixed
# then translate output to ./translated
i18nfix fix --out-dir fixed --translate --translate-out-dir translated
```

Fix and translate into the **same directory** (e.g. `dist-locales/`):

```bash
i18nfix fix --out-dir dist-locales --translate --translate-out-dir dist-locales
```

Fix and translate **in-place** (overwrite your target files):

```bash
i18nfix fix --in-place --translate
```

Verbose (prints BASE/TRNS for each translated key):

```bash
i18nfix fix --out-dir fixed --translate --translate-out-dir translated -v
```

## Example included

Try the included example files:

```bash
i18nfix check --config examples/i18nfix.config.json
i18nfix fix --config examples/i18nfix.config.json --out-dir examples/fixed --translate --translate-out-dir examples/translated
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

Defaults / behavior:
- Batch translation is enabled when `batchSize` is set (recommended for speed). If a batch output is missing keys or fails validation, i18nfix automatically retries those items in single-item mode.
- By default i18nfix validates placeholders + HTML tags + basic Markdown markers.
- Translation cache is enabled by default (`.i18nfix-cache/translations.jsonl`).

Example:

```json
{
  "translate": {
    "provider": "openai",
    "apiKeyEnv": "OPENAI_API_KEY",
    "model": "gpt-4o-mini",

    "batchSize": 50,
    "concurrency": 3,

    "retryCount": 3,
    "retryBaseDelayMs": 400,

    "cache": true,

    "delayMs": 0
    // maxItems is optional; when unset there is no limit
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

## Documentation

- Website: https://zhanziyang.github.io/i18nfix/
- Recommended workflow: https://zhanziyang.github.io/i18nfix/docs/guides/workflow

Reference docs in-repo:
- CLI reference: `docs/CLI.md`
- Config reference: `docs/CONFIG.md`

## CLI notes

- `translate --mode`:
  - default is `all` (only keys with issues)
  - `missing` / `empty` / `untranslated` are narrower modes
- `maxItems`:
  - optional (default: no limit)
  - when set, i18nfix will translate at most that many strings per run and print how many remain.
- output validation (default on):
  - placeholders must match
  - HTML tags must be preserved
  - basic Markdown markers must be preserved
- caching (default on):
  - `.i18nfix-cache/translations.jsonl`

## Roadmap

- Better placeholder detection (ICU message format, etc.)
- Array handling
- GitHub PR mode

## License

MIT
