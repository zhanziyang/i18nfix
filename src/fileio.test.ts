import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readLocaleFile, writeLocaleFile } from './fileio.js';

const tmp = path.join(process.cwd(), '.tmp-test');

describe('fileio', () => {
  it('reads export default object from .ts', async () => {
    const p = path.join(tmp, 'fr.ts');
    await fs.mkdir(tmp, { recursive: true });
    await fs.writeFile(
      p,
      "export default { brand: { name: 'Hearem' }, common: { secondsAgo: 'il y a %{count} secondes' } };\n",
      'utf8'
    );

    const r = await readLocaleFile(p);
    expect(r.format).toBe('ts');
    expect(r.moduleKind).toBe('esm');
    expect((r.data as any).brand.name).toBe('Hearem');
    expect(typeof r.raw).toBe('string');
  });

  it('writes .ts preserving unquoted keys (best-effort)', async () => {
    const p = path.join(tmp, 'base.ts');
    await fs.mkdir(tmp, { recursive: true });
    const original = "export default { brand: { name: 'Hearem' }, common: { loading: 'Chargement...' } };\n";
    await fs.writeFile(p, original, 'utf8');

    const r = await readLocaleFile(p);
    const outPath = path.join(tmp, 'out.ts');
    await writeLocaleFile(outPath, {
      ...(r.data as any),
      common: { ...(r.data as any).common, initializingPleaseWait: 'Init...' }
    } as any, { format: 'ts', moduleKind: 'esm', originalRaw: r.raw });

    const out = await fs.readFile(outPath, 'utf8');
    expect(out).toContain('export default');
    // new key should be identifier-style (no quotes)
    expect(out).toContain('initializingPleaseWait');
    expect(out).not.toContain('"initializingPleaseWait"');
  });

  it('reads module.exports object from .js', async () => {
    const p = path.join(tmp, 'fr.js');
    await fs.mkdir(tmp, { recursive: true });
    await fs.writeFile(p, "module.exports = { a: { b: 'x' } };\n", 'utf8');
    const r = await readLocaleFile(p);
    expect(r.format).toBe('js');
    expect(r.moduleKind).toBe('cjs');
    expect((r.data as any).a.b).toBe('x');
  });

  it('reads and writes YAML', async () => {
    const p = path.join(tmp, 'en.yaml');
    await fs.mkdir(tmp, { recursive: true });
    await fs.writeFile(p, 'app:\n  title: Hello\n', 'utf8');
    const r = await readLocaleFile(p);
    expect(r.format).toBe('yaml');
    expect((r.data as any).app.title).toBe('Hello');

    const out = path.join(tmp, 'out.yaml');
    await writeLocaleFile(out, r.data, { format: 'yaml' });
    const r2 = await readLocaleFile(out);
    expect((r2.data as any).app.title).toBe('Hello');
  });
});
