import { TranslateOptions, TranslateRequest, TranslateResponse } from './types.js';

function buildPrompt(req: TranslateRequest) {
  const hints = (req.placeholderHints ?? []).filter(Boolean);
  const keep = hints.length ? `\n\nPlaceholders that MUST be preserved exactly (do not translate/modify): ${hints.join(', ')}` : '';
  return `You are a professional software localization translator.\nTranslate the given string from ${req.sourceLang ?? 'the source language'} to ${req.targetLang ?? 'the target language'}.\nReturn ONLY the translated text, no quotes, no explanations.${keep}\n\nTEXT:\n${req.text}`;
}

export async function translateGemini(opts: TranslateOptions, req: TranslateRequest): Promise<TranslateResponse> {
  const model = opts.model ?? 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: buildPrompt(req) }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Gemini request failed (${res.status}): ${t}`);
  }
  const json: any = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string' || !text.trim()) throw new Error('Empty translation response');
  return { text: text.trim(), raw: json };
}
