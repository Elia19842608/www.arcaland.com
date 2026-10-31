import { describe, it, expect, beforeAll } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { ottimizzaImmagine } from '../../src/lib/import/immagini';

const dir = mkdtempSync(join(tmpdir(), 'img-'));
beforeAll(async () => {
  await sharp({ create: { width: 4000, height: 3000, channels: 3, background: '#9cc3d5' } })
    .composite([{ input: Buffer.from('<svg width="4000" height="3000"><rect x="500" y="500" width="3000" height="2000" fill="#e6af0b"/></svg>') }])
    .jpeg({ quality: 95 }).toFile(join(dir, 'grande.jpg'));
  await sharp({ create: { width: 800, height: 800, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: Buffer.from('<svg width="800" height="800"><circle cx="400" cy="400" r="300" fill="#222018"/></svg>') }])
    .png().toFile(join(dir, 'trasparente.png'));
  writeFileSync(join(dir, 'disegno.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>');
});

describe('ottimizzaImmagine', () => {
  it('riduce un JPG grande a WebP 1600 px', async () => {
    const r = await ottimizzaImmagine(join(dir, 'grande.jpg'), join(dir, 'grande.webp'));
    expect([r.larghezza, r.altezza]).toEqual([1600, 1200]);
    const meta = await sharp(join(dir, 'grande.webp')).metadata();
    expect(meta.format).toBe('webp');
    expect(r.byte).toBeLessThan(statSync(join(dir, 'grande.jpg')).size);
  });
  it('non ingrandisce e conserva la trasparenza', async () => {
    const r = await ottimizzaImmagine(join(dir, 'trasparente.png'), join(dir, 'trasparente.webp'));
    expect([r.larghezza, r.altezza]).toEqual([800, 800]);
    expect((await sharp(join(dir, 'trasparente.webp')).metadata()).hasAlpha).toBe(true);
  });
  it('copia gli SVG così come sono', async () => {
    await ottimizzaImmagine(join(dir, 'disegno.svg'), join(dir, 'copia.svg'));
    expect(readFileSync(join(dir, 'copia.svg'), 'utf8')).toBe(readFileSync(join(dir, 'disegno.svg'), 'utf8'));
  });
});
