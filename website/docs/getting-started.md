---
title: Getting Started
---

## Install

Use any package manager (default shown: npm):

```bash
npm i -D i18nfix
# pnpm add -D i18nfix
# yarn add -D i18nfix
# bun add -d i18nfix
```

## Run i18nfix (local install)

If you installed i18nfix as a dev dependency (recommended), run it via **npx** (or add npm scripts).

### Create config

In your project root:

```bash
npx i18nfix init
```

This writes `i18nfix.config.json`.

If you want to update it later via Q&A:

```bash
npx i18nfix config
```

### Run a check

```bash
npx i18nfix check
```

For machine-readable output (CI / tooling):

```bash
npx i18nfix check --json
```

### Fix (recommended: in-place)

Recommended for the “one source language” workflow: update `targets` in-place, then commit the changes.

```bash
npx i18nfix fix --in-place
```

If you prefer a safer dry-run style, write output to a directory:

```bash
npx i18nfix fix --out-dir fixed
```

### Translate (recommended via fix)

```bash
npx i18nfix fix --in-place --translate
```

### Optional: npm scripts (recommended)

See: Guides → Recommended workflow.

## Optional: global install

If you prefer running `i18nfix ...` without `npx`, you can install it globally:

```bash
npm i -g i18nfix
```

You’ll need a provider + API key env var (see: Guides → Translation providers).
