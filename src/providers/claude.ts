import { TranslateOptions, TranslateRequest, TranslateResponse } from './types.js';

function buildPrompt(req: TranslateRequest) {
  const hints = (req.placeholderHints ?? []).filter(Boolean);
  const keep = hints.length ? `\n\nPlaceholders that MUST be preserved exactly (do not translate/modify): ${hints.join(', ')}` : '';
  return `Translate the following string from ${req.sourceLang ?? 'the source language'} to ${req.targetLang ?? 'the target language'}.\nReturn ONLY the translated text, no quotes, no explanations.${keep}\n\nTEXT:\n${req.text}`;
}

export async function translateClaude(opts: TranslateOptions, req: TranslateRequest): Promise<TranslateResponse> {
  const url = 'https://api.anthropic.com/v1/messages';
  const body = {
    model: opts.model ?? 'claude-3-5-haiku-latest',
    max_tokens: 512,
    temperature: 0.2,
    messages: [{ role: 'user', content: buildPrompt(req) }],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': opts.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Claude request failed (${res.status}): ${t}`);
  }
  const json: any = await res.json();
  const text = json?.content?.[0]?.text;
  if (typeof text !== 'string' || !text.trim()) throw new Error('Empty translation response');
  return { text: text.trim(), raw: json };
}
