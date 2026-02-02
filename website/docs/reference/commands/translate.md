---
title: translate
---

Translate strings using an LLM provider.

This is an advanced command; prefer:

```bash
i18nfix fix --in-place --translate
```

Usage:

```bash
i18nfix translate --mode all
```

Options:
- `--mode <missing|empty|untranslated|all>`
- `--no-show-langs` — hide from/to languages per file
- `-v, --verbose` — print base + translated text per key
