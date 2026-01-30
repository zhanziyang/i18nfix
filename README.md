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

### 1) Create config

```bash
node dist/cli.js init
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

## Roadmap

- Better placeholder detection (ICU message format, etc.)
- Array handling
- `translate` command (plug in model providers)
- GitHub PR mode

## License

MIT
