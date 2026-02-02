---
title: fix
---

Fix target locales: add missing keys, optionally remove extras.

```bash
# output to a directory
i18nfix fix --out-dir fixed

# overwrite targets
i18nfix fix --in-place
```

Options:
- `--drop-extra-keys` — remove keys not present in base
- `--fill-missing-with-base` — fill missing keys with base value
- `--translate` — run translation after fix
- `--translate-mode <all|missing|empty|untranslated>`
- `--translate-out-dir <dir>`
- `-v, --verbose` — print base + translated text per key
