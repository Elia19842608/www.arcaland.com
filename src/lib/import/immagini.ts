import { copyFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

export const LATO_MAX = 1600;

/** Converte una foto in WebP leggero (lato lungo massimo 1600 px). Gli SVG vengono copiati così come sono. */
export async function ottimizzaImmagine(ingresso: string, uscita: string): Promise<{ larghezza: number; altezza: number; byte: number }> {
  if (ingresso.toLowerCase().endsWith('.svg')) {
    copyFileSync(ingresso, uscita);
    return { larghezza: 0, altezza: 0, byte: statSync(uscita).size };
  }
  const info = await sharp(ingresso)
    .rotate()
    .resize({ width: LATO_MAX, height: LATO_MAX, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, alphaQuality: 90 })
    .toFile(uscita);
  return { larghezza: info.width, altezza: info.height, byte: info.size };
}
