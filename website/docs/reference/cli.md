---
title: CLI overview
---

`i18nfix` commands:

- `init` — create config via wizard
- `config` — update config via Q&A
- `check` — report issues
- `fix` — write fixed locales (optionally translate)
- `translate` — translate (advanced; prefer `fix --translate`)
- `new` — scaffold new locale files

Global options (supported by most commands):

- `-c, --config <path>`
- `--base <path>`
- `--targets <paths>` (comma-separated)
- `--key-style <auto|nested|flat>`
- `--placeholder-style <...>`
- `--ignore-keys <keys>` (comma-separated)
- `--fail-fast`
