import { TranslateOptions, TranslateRequest, TranslateResponse } from './types.js';

export interface BatchItem {
  key: string;
  text: string;
  placeholders?: string[];
}

function buildSystemPrompt(sourceLang?: string, targetLang?: string) {
  return `You are a professional software localization translator.\nTranslate each item from ${sourceLang ?? 'the source language'} to ${targetLang ?? 'the target language'}.\nReturn ONLY valid JSON: an array of objects with shape {"key": string, "text": string}.\nRules:\n- Keep placeholders unchanged (examples: {name}, %{count}, %s).\n- Do not add extra keys.\n- Preserve punctuation and whitespace meaningfully.`;
}

export async function translateBatchOpenAI(
  opts: TranslateOptions,
  items: BatchItem[],
  ctx: { sourceLang?: string; targetLang?: string }
): Promise<Record<string, string>> {
  const baseUrl = opts.baseUrl ?? 'https://api.openai.com/v1';
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const userPayload = items.map((it) => ({ key: it.key, text: it.text }));

  const body = {
    model: opts.model ?? 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt(ctx.sourceLang, ctx.targetLang) },
      { role: 'user', content: JSON.stringify({ items: userPayload }) },
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
    throw new Error(`OpenAI batch request failed (${res.status}): ${t}`);
  }
  const json: any = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('Empty batch translation response');

  // response_format=json_object => expect {items:[{key,text},...]}
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error(`Failed to parse JSON batch output: ${content.slice(0, 200)}`);
  }

  const arr = parsed?.items;
  if (!Array.isArray(arr)) throw new Error('Batch output missing items array');

  const out: Record<string, string> = {};
  for (const it of arr) {
    if (!it || typeof it.key !== 'string' || typeof it.text !== 'string') continue;
    out[it.key] = it.text;
  }
  return out;
}
