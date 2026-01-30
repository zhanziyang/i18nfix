export function formatErr(e: any): string {
  if (!e) return 'Unknown error';
  const msg = String(e.message ?? e);
  const loc = (e.loc && typeof e.loc.line === 'number') ? ` (line ${e.loc.line}, col ${e.loc.column})` : '';
  const code = e.code ? ` [${e.code}]` : '';
  return msg + loc + code;
}
