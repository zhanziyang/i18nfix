import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export interface CacheKeyParts {
  provider: string;
  model?: string;
  sourceLang?: string;
  targetLang?: string;
  text: string;
}

export interface CacheEntry {
  key: string;
  provider: string;
  model?: string;
  sourceLang?: string;
  targetLang?: string;
  text: string;
  translated: string;
  createdAt: string;
}

export class TranslationCache {
  private dir: string;
  private file: string;
  private mem = new Map<string, CacheEntry>();
  private loaded = false;

  constructor(rootDir: string) {
    this.dir = path.join(rootDir, '.i18nfix-cache');
    this.file = path.join(this.dir, 'translations.jsonl');
  }

  static makeKey(p: CacheKeyParts): string {
    const payload = JSON.stringify({
      provider: p.provider,
      model: p.model ?? '',
      sourceLang: p.sourceLang ?? '',
      targetLang: p.targetLang ?? '',
      text: p.text,
    });
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  async load(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const raw = await fs.readFile(this.file, 'utf8');
      const lines = raw.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        try {
          const e = JSON.parse(line) as CacheEntry;
          if (e?.key && typeof e.translated === 'string') this.mem.set(e.key, e);
        } catch {
          // ignore bad lines
        }
      }
    } catch {
      // no cache file yet
    }
  }

  get(p: CacheKeyParts): string | undefined {
    const key = TranslationCache.makeKey(p);
    const hit = this.mem.get(key);
    return hit?.translated;
  }

  async set(p: CacheKeyParts, translated: string): Promise<void> {
    const key = TranslationCache.makeKey(p);
    const entry: CacheEntry = {
      key,
      provider: p.provider,
      model: p.model,
      sourceLang: p.sourceLang,
      targetLang: p.targetLang,
      text: p.text,
      translated,
      createdAt: new Date().toISOString(),
    };
    this.mem.set(key, entry);
    await fs.mkdir(this.dir, { recursive: true });
    await fs.appendFile(this.file, JSON.stringify(entry) + '\n', 'utf8');
  }
}
