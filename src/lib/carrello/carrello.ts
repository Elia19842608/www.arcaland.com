export interface RigaCarrello { slug: string; codice: string; nome: string; quantita: number }
export type Carrello = readonly RigaCarrello[];

export const QUANTITA_MAX = 999;

function limita(q: number): number {
  return Math.min(QUANTITA_MAX, Math.trunc(q));
}

export function aggiungi(c: Carrello, voce: Omit<RigaCarrello, 'quantita'>, quantita = 1): RigaCarrello[] {
  const q = Math.max(1, limita(quantita));
  const esistente = c.find((r) => r.slug === voce.slug);
  if (esistente) return c.map((r) => (r.slug === voce.slug ? { ...r, quantita: limita(r.quantita + q) } : { ...r }));
  return [...c.map((r) => ({ ...r })), { slug: voce.slug, codice: voce.codice, nome: voce.nome, quantita: q }];
}

export function impostaQuantita(c: Carrello, slug: string, quantita: number): RigaCarrello[] {
  const q = limita(quantita);
  if (!Number.isFinite(q) || q <= 0) return rimuovi(c, slug);
  return c.map((r) => (r.slug === slug ? { ...r, quantita: q } : { ...r }));
}

export function rimuovi(c: Carrello, slug: string): RigaCarrello[] {
  return c.filter((r) => r.slug !== slug).map((r) => ({ ...r }));
}

export function totaleArticoli(c: Carrello): number {
  return c.reduce((s, r) => s + r.quantita, 0);
}

function rigaValida(x: unknown): x is RigaCarrello {
  if (!x || typeof x !== 'object') return false;
  const r = x as Record<string, unknown>;
  return typeof r.slug === 'string' && r.slug.length > 0
    && typeof r.codice === 'string' && typeof r.nome === 'string'
    && typeof r.quantita === 'number' && Number.isInteger(r.quantita)
    && r.quantita >= 1 && r.quantita <= QUANTITA_MAX;
}

/** Legge un carrello salvato, scartando in silenzio tutto ciò che non è valido. */
export function daJson(testo: string | null): RigaCarrello[] {
  if (!testo) return [];
  try {
    const dati: unknown = JSON.parse(testo);
    if (!Array.isArray(dati)) return [];
    return dati.filter(rigaValida).map(({ slug, codice, nome, quantita }) => ({ slug, codice, nome, quantita }));
  } catch {
    return [];
  }
}
