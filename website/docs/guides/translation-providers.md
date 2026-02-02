---
title: Translation providers
---

i18nfix can translate problematic keys using an LLM provider.

## 1) Set API key in `.env`

Example:

```env
OPENAI_API_KEY=xxx
# or: OPENROUTER_API_KEY / ANTHROPIC_API_KEY / GEMINI_API_KEY
```

## 2) Configure `translate` in `i18nfix.config.json`

Example:

```json
{
  "translate": {
    "provider": "openai",
    "apiKeyEnv": "OPENAI_API_KEY",
    "model": "gpt-4o-mini",
    "batchSize": 50,
    "concurrency": 3,
    "retryCount": 3,
    "retryBaseDelayMs": 400,
    "cache": true
  }
}
```

## Recommended usage

Prefer:

```bash
i18nfix fix --in-place --translate
```

instead of calling `translate` directly.
