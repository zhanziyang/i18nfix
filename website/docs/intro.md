---
title: Introduction
---

**i18nfix** is a CLI to **check**, **fix**, and **translate** i18n locale files.

It’s built for the boring-but-painful reality of i18n maintenance:

- keys drift between locales
- values go empty or stay untranslated
- placeholders break at runtime (`{name}` vs `{username}`, `%s` vs `%d`)
- humans forget to update translations in PRs

## What you get

- **Check**: find missing/extra keys, empty values, placeholder mismatches, parse errors
- **Fix**: add missing keys, optionally drop extras, write to a directory or in-place
- **Translate**: translate only the problematic keys via an LLM provider

Supported formats (common):
- JSON: `.json`
- YAML: `.yml` / `.yaml`
- JS/TS modules exporting an object: `.js` / `.ts`

## Quick start

1) Create config

```bash
i18nfix init
```

2) Check

```bash
i18nfix check
```

3) Fix (and optionally translate)

```bash
# write to ./fixed
i18nfix fix --out-dir fixed

# fix + translate (recommended)
i18nfix fix --in-place --translate
```

Next: head to **Getting Started**.
