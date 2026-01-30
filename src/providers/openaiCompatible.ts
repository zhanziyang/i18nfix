import { TranslateOptions, TranslateRequest, TranslateResponse } from './types.js';

function buildSystemPrompt(req: TranslateRequest) {
  const hints = (req.placeholderHints ?? []).filter(Boolean);
  const keep = hints.length ? `\n\nPlaceholders that MUST be preserved exactly (do not translate/modify): ${hints.join(', ')}` : '';
  return `You are a professional software localization translator.\nTranslate the given string from ${req.sourceLang ?? 'the source language'} to ${req.targetLang ?? 'the target language'}.\nReturn ONLY the translated text, no quotes, no explanations.${keep}`;
}

export async function translateOpenAICompatible(
  opts: TranslateOptions,
  req: TranslateRequest
): Promise<TranslateResponse> {
  const baseUrl = opts.baseUrl ?? 'https://api.openai.com/v1';
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const body = {
    model: opts.model ?? 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: buildSystemPrompt(req) },
      { role: 'user', content: req.text },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`OpenAI-compatible request failed (${res.status}): ${t}`);
  }
  const json: any = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('Empty translation response');
  return { text: text.trim(), raw: json };
}
