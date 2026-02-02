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

## Create config

In your project root:

```bash
i18nfix init
```

This writes `i18nfix.config.json`.

If you want to update it later via Q&A:

```bash
i18nfix config
```

## Run a check

```bash
i18nfix check
```

For machine-readable output (CI / tooling):

```bash
i18nfix check --json
```

## Fix

Write fixed files to a directory:

```bash
i18nfix fix --out-dir fixed
```

Or overwrite targets:

```bash
i18nfix fix --in-place
```

## Translate (recommended via fix)

```bash
i18nfix fix --in-place --translate
```

You’ll need a provider + API key env var (see: Guides → Translation providers).
