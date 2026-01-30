export function formatErr(e: any): string {
  if (!e) return 'Unknown error';
  const msg = String(e.message ?? e);
  const loc = e.loc && typeof e.loc.line === 'number' ? ` (line ${e.loc.line}, col ${e.loc.column})` : '';
  const code = e.code ? ` [${e.code}]` : '';
  return msg + loc + code;
}

export function formatErrWithSnippet(e: any, source?: string): string {
  const base = formatErr(e);
  const line = e?.loc?.line;
  const col = e?.loc?.column;
  if (!source || typeof line !== 'number') return base;

  const lines = source.split(/\r?\n/);
  const idx = Math.max(0, Math.min(lines.length - 1, line - 1));
  const text = lines[idx] ?? '';
  const caretPos = typeof col === 'number' ? Math.max(0, col) : 0;
  const caret = ' '.repeat(Math.min(caretPos, 200)) + '^';
  return `${base}\n  ${text}\n  ${caret}`;
}
