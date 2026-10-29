import type { Misure } from './tipi';

export interface Rett { x: number; y: number; w: number; h: number }
export interface Quota { testo: string; x: number; y: number; verticale: boolean }
export interface Pianta { viewBox: string; area: Rett; ingombro?: Rett; quote: Quota[] }

const MARGINE = 80;

export function metri(cm: number): string {
  return `${(cm / 100).toFixed(2).replace('.', ',')} m`;
}

/** Pianta dall'alto in unità SVG = cm: area di sicurezza con l'ingombro centrato e le quote. */
export function calcolaPianta(area: Misure, ingombro?: Misure): Pianta {
  const a: Rett = { x: MARGINE, y: MARGINE, w: area.lunghezza_cm, h: area.larghezza_cm };
  const quote: Quota[] = [
    { testo: metri(area.lunghezza_cm), x: a.x + a.w / 2, y: a.y - MARGINE / 2, verticale: false },
    { testo: metri(area.larghezza_cm), x: a.x - MARGINE / 2, y: a.y + a.h / 2, verticale: true },
  ];
  let i: Rett | undefined;
  if (ingombro) {
    i = {
      x: a.x + (a.w - ingombro.lunghezza_cm) / 2,
      y: a.y + (a.h - ingombro.larghezza_cm) / 2,
      w: ingombro.lunghezza_cm,
      h: ingombro.larghezza_cm,
    };
    quote.push(
      { testo: metri(ingombro.lunghezza_cm), x: i.x + i.w / 2, y: i.y + i.h + 40, verticale: false },
      { testo: metri(ingombro.larghezza_cm), x: i.x + i.w + 40, y: i.y + i.h / 2, verticale: true },
    );
  }
  return { viewBox: `0 0 ${a.w + 2 * MARGINE} ${a.h + 2 * MARGINE}`, area: a, ingombro: i, quote };
}
