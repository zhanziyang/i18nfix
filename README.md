# i18nfix

A small CLI to **check** and **fix** i18n JSON locale files:
- missing keys
- extra keys
- empty values
- possibly untranslated values (same as base)
- placeholder mismatches (`{name}`, `{{name}}`, `%s` ...)

> Status: MVP / work in progress.

## Requirements

- Node.js >= 18

## Install

### From source

```bash
git clone https://github.com/zhanziyang/i18nfix.git
cd i18nfix
npm install
npm run build

# run directly
node dist/cli.js --help
```

## Quick start

### Try the included example

```bash
# from repo root
node dist/cli.js check --config examples/i18nfix.config.json

# write fixed file to examples/fixed
node dist/cli.js fix --config examples/i18nfix.config.json --out-dir examples/fixed

# or overwrite the target in-place (be careful)
# node dist/cli.js fix --config examples/i18nfix.config.json --in-place
```

What this example demonstrates:
- `zh.json` is missing `app.cta` (will be added)
- `home.subtitle` is identical to base (flagged as possibly untranslated)
- placeholder mismatch: `{name}` vs `{username}`
- printf mismatch: `%s` vs `%d`
- extra key: `app.extraKey` (only reported; fix can remove if you choose)

---



### 1) Create or update config

```bash
# create
node dist/cli.js init

# update via Q&A (loads existing config and rewrites it)
node dist/cli.js config
```

This writes `i18nfix.config.json` in the current directory.

### 2) Check

```bash
node dist/cli.js check
# JSON output
node dist/cli.js check --json
```

### 3) Fix

Write fixed files into a directory:

```bash
node dist/cli.js fix --out-dir fixed
```

Overwrite in place:

```bash
node dist/cli.js fix --in-place
```

## Config file

Default config filename: `i18nfix.config.json`

Example:

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

## CLI options (override config)

- `--base <path>`
- `--targets <comma-separated>`
- `--key-style <auto|nested|flat>`
- `--placeholder-style <auto|brace|mustache|printf>` (comma-separated list supported)
- `--ignore-keys <comma-separated>`

## Translate (LLM providers)

> Keys should be provided via environment variables (recommended). Do **not** commit keys to git.

Add a `translate` section to your `i18nfix.config.json`:

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
- `openrouter` (env: `OPENROUTER_API_KEY`, model example: `anthropic/claude-3.5-sonnet`)
- `claude` (Anthropic API, env: `ANTHROPIC_API_KEY`)
- `gemini` (Google, env: `GEMINI_API_KEY`)

Run:

If `translate.targetLang` is not set, i18nfix will try to infer it from the target filename (e.g. `zh.json`, `ja.json`, `fr-FR.json`).

```bash
# translate only problematic keys (default: all)
node dist/cli.js translate --mode missing --out-dir translated

# translate empty values
node dist/cli.js translate --mode empty --in-place

# translate values equal to base (needs treatSameAsBaseAsUntranslated=true)
node dist/cli.js translate --mode untranslated --out-dir translated

# translate ONLY keys that have issues (missing/empty/untranslated/placeholder mismatch)
# translate ONLY keys that have issues (missing/empty/untranslated/placeholder mismatch)
node dist/cli.js translate --mode all --out-dir translated
```

## Roadmap

- Better placeholder detection (ICU message format, etc.)
- Array handling
- GitHub PR mode

## License

MIT
