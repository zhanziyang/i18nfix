export function isRetriableError(e: any): boolean {
  const msg = String(e?.message ?? e);
  // crude checks for typical rate limit/transient errors
  return (
    msg.includes('429') ||
    msg.includes('rate') ||
    msg.includes('Rate limit') ||
    msg.includes('503') ||
    msg.includes('502') ||
    msg.includes('timeout')
  );
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { retries: number; baseDelayMs: number }
): Promise<T> {
  let attempt = 0;
  let lastErr: any;
  while (attempt <= opts.retries) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (attempt >= opts.retries || !isRetriableError(e)) break;
      const delay = Math.round(opts.baseDelayMs * Math.pow(2, attempt));
      await new Promise((r) => setTimeout(r, delay));
      attempt++;
    }
  }
  throw lastErr;
}
