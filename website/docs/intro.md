---
title: Introduction
---

**i18nfix** is a CLI to **check**, **fix**, and **translate** i18n locale files.

## The big idea

**Maintain one language by hand.** Let i18nfix (often in CI) keep every other locale file in sync:

- adds missing keys / keeps structure consistent
- flags unsafe placeholder mismatches
- optionally translates only what’s broken

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

If you installed i18nfix locally (`npm i -D i18nfix`), use **npx** to run it:

1) Create config

```bash
npx i18nfix init
```

2) Check

```bash
npx i18nfix check
```

3) Fix (and optionally translate)

```bash
# write to ./fixed
npx i18nfix fix --out-dir fixed

# fix + translate (recommended)
npx i18nfix fix --in-place --translate
```

Tip: for teams/CI, add npm scripts (see **Recommended workflow**).

Next: head to **Getting Started**.
