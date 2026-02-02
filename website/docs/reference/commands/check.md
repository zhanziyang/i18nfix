---
title: check
---

Check target locales vs base locale.

```bash
i18nfix check
```

Useful flags:
- `--json` — print JSON report
- `--init-if-missing` — run init wizard if config is missing
- `--fail-fast` — stop immediately on first parse error

Exit codes:
- `0` — clean
- `1` — issues found
- `2` — parse errors
