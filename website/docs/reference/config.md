---
title: Config reference
---

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

## Fields

### `base`
Path to the base locale file.

### `targets`
Paths to target locales.

### `keyStyle`
- `auto` — infer from file
- `nested` — nested objects
- `flat` — dot-separated keys

### `placeholderStyle`
Supports auto-detection and explicit styles (comma-separated via CLI override).

### `ignoreKeys`
Keys to ignore (exact or patterns, depending on implementation).

### `translate`
Provider configuration. See **Guides → Translation providers**.
