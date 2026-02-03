---
title: Recommended workflow
---

A workflow designed around i18nfix’s biggest win:

**Maintain one source language by hand. Let CI keep every other locale in sync.**

## 0) Team rule: one source-of-truth language

Pick one language file as `base` (e.g. `locales/en.json`).

- ✅ You edit **only** `base` in PRs
- ✅ All other locales (`targets`) are **generated/updated** by i18nfix
- ❌ Don’t hand-edit `targets` (it will fight the generator and create noisy diffs)

## 1) Configure once

```bash
npx i18nfix init
```

Commit `i18nfix.config.json` to the repo.

## 2) Add npm scripts (recommended)

In your project’s `package.json`:

```json
{
  "scripts": {
    "i18n:check": "i18nfix check",
    "i18n:fix": "i18nfix fix --in-place",
    "i18n:fix:translate": "i18nfix fix --in-place --translate"
  }
}
```

## 3) CI: keep locales in sync

### Option A (common): CI checks only

CI runs on every PR:

```bash
npm ci
npm run i18n:check
```

If CI fails, a developer runs one of these locally and commits the updated locale files:

```bash
# structure only (no translation)
npm run i18n:fix

# structure + translation (recommended for “single source language” teams)
npm run i18n:fix:translate
```

Exit codes:
- `0`: clean
- `1`: issues found
- `2`: parse errors

### Option B (ideal): CI generates updates via bot PR

Run i18nfix in CI, then commit the updated `targets` back via a bot PR.

This keeps the promise of “you only write one language; CI updates the rest” without asking every developer to remember extra steps.

(Implementation varies by CI provider; we’ll add a concrete GitHub Actions example next.)

## 4) Translate policy (recommended)

Use `fix --translate` instead of `translate`:

```bash
npx i18nfix fix --in-place --translate
```

It translates only keys that need attention (missing/empty/untranslated) and still validates placeholders so runtime strings don’t break.
