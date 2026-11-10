/** Fase del racconto (0 = apertura, 1–5 = tappe) dall'avanzamento 0–1 dello scorrimento. */
export function faseDaAvanzamento(p: number, fasi = 6): number {
  if (!(p > 0)) return 0;
  return Math.min(fasi - 1, Math.floor(p * fasi));
}

export const normalizzaNome = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export type EsitoRicerca<T> = { esito: 'vuoto' | 'trovato' | 'parziali' | 'nessuno'; comuni: T[] };

export function cercaComune<T extends { n: string }>(testo: string, comuni: T[]): EsitoRicerca<T> {
  const q = normalizzaNome(testo);
  if (q.length < 2) return { esito: 'vuoto', comuni: [] };
  const esatto = comuni.find((c) => normalizzaNome(c.n) === q);
  if (esatto) return { esito: 'trovato', comuni: [esatto] };
  const parziali = comuni.filter((c) => normalizzaNome(c.n).startsWith(q));
  return parziali.length ? { esito: 'parziali', comuni: parziali } : { esito: 'nessuno', comuni: [] };
}

/** Raggio della spunta sulla mappa: area proporzionale agli abitanti, minimo 6. */
export function raggioPunto(pop: number, max: number): number {
  return Math.round((6 + 12 * Math.sqrt(Math.max(0, pop) / max)) * 10) / 10;
}
