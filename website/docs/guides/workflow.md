---
title: Recommended workflow
---

A practical workflow that keeps i18n healthy without constant manual babysitting.

## 1) Configure once

```bash
i18nfix init
```

Commit `i18nfix.config.json` to the repo.

## 2) Run `check` in CI

Run on every PR:

```bash
i18nfix check
```

- exit code `0`: clean
- exit code `1`: issues found
- exit code `2`: parse errors

## 3) Fix locally (or in a bot)

```bash
# safe: write output to a new directory
i18nfix fix --out-dir fixed

# aggressive: overwrite
i18nfix fix --in-place
```

## 4) Translate only what’s broken

```bash
i18nfix fix --in-place --translate
```

This is usually preferable to running `translate` directly.
