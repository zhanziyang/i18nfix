import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { runNew } from './new.js';

const tmp = path.join(process.cwd(), '.tmp-new');

describe('new command', () => {
  it('creates new targets following existing pattern and skips existing', async () => {
    await fs.rm(tmp, { recursive: true, force: true });
    await fs.mkdir(tmp, { recursive: true });

    const base = path.join(tmp, 'en.ts');
    await fs.writeFile(base, "export default { brand: { name: 'X' } };\n", 'utf8');

    const fr = path.join(tmp, 'fr.ts');
    await fs.writeFile(fr, "export default { brand: { name: 'X' } };\n", 'utf8');

    const cfg: any = { base, targets: [fr], keyStyle: 'auto', placeholderStyle: 'auto', ignoreKeys: [] };
    const res = await runNew(cfg, { langs: ['fr', 'ja'], skipExisting: true, updateConfig: false, configPath: undefined });

    expect(res.skipped).toContain(fr);
    const ja = path.join(tmp, 'ja.ts');
    const st = await fs.stat(ja);
    expect(st.isFile()).toBe(true);
  });
});
