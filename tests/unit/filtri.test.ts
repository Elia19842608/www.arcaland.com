import { describe, it, expect } from 'vitest';
import { entraNelloSpazio, filtraProdotti, filtriDaUrl, filtriAUrl, versoVoce, type VoceIndice, type Filtri } from '../../src/lib/catalogo/filtri';
import type { Prodotto } from '../../src/lib/catalogo/tipi';

const v = (o: Partial<VoceIndice> & { slug: string }): VoceIndice => ({
  codice: o.slug, nome: o.slug, linea: 'giochi', sottocategoria: 'Varie', inclusivo: false, ...o,
});
const voci: VoceIndice[] = [
  v({ slug: 'a', materiale: 'legno', eta_min: 2, eta_max: 6, altezza_caduta_cm: 100, area_sicurezza: { lunghezza_cm: 700, larghezza_cm: 500 } }),
  v({ slug: 'b', materiale: 'acciaio', eta_min: 5, eta_max: 14, altezza_caduta_cm: 200, area_sicurezza: { lunghezza_cm: 900, larghezza_cm: 500 } }),
  v({ slug: 'c' }),
  v({ slug: 'd', linea: 'arredo-urbano', sottocategoria: 'Panchine', materiale: 'legno', inclusivo: true, altezza_caduta_cm: 150 }),
];
const slugs = (r: VoceIndice[]) => r.map((x) => x.slug);

describe('entraNelloSpazio', () => {
  it('accetta il bordo esatto', () => expect(entraNelloSpazio({ lunghezza_cm: 700, larghezza_cm: 500 }, { lunghezza_m: 7, larghezza_m: 5 })).toBe(true));
  it('ruota il gioco di 90°', () => expect(entraNelloSpazio({ lunghezza_cm: 700, larghezza_cm: 500 }, { lunghezza_m: 5, larghezza_m: 7 })).toBe(true));
  it('rifiuta se non ci sta', () => expect(entraNelloSpazio({ lunghezza_cm: 700, larghezza_cm: 500 }, { lunghezza_m: 6.9, larghezza_m: 5 })).toBe(false));
});

describe('filtraProdotti', () => {
  it('senza filtri restituisce tutto, anche i dati mancanti', () => expect(slugs(filtraProdotti(voci, {}))).toEqual(['a', 'b', 'c', 'd']));
  it('età: dentro la fascia, esclusi i prodotti senza età', () => expect(slugs(filtraProdotti(voci, { eta: 3 }))).toEqual(['a']));
  it('spazio: esclude chi non ha area di sicurezza', () => expect(slugs(filtraProdotti(voci, { spazio: { lunghezza_m: 7, larghezza_m: 5 } }))).toEqual(['a']));
  it('altezza di caduta massima', () => expect(slugs(filtraProdotti(voci, { caduta_max_cm: 150 }))).toEqual(['a', 'd']));
  it('filtri combinati in AND', () => expect(slugs(filtraProdotti(voci, { materiale: 'legno', linea: 'giochi' }))).toEqual(['a']));
  it('inclusivo e sottocategoria', () => {
    expect(slugs(filtraProdotti(voci, { inclusivo: true }))).toEqual(['d']);
    expect(slugs(filtraProdotti(voci, { sottocategoria: 'Varie' }))).toEqual(['a', 'b', 'c']);
  });
});

describe('filtri e URL', () => {
  it('accetta la virgola decimale nello spazio', () =>
    expect(filtriDaUrl(new URLSearchParams('spazio=7,5x6'))).toEqual({ spazio: { lunghezza_m: 7.5, larghezza_m: 6 } }));
  it.each(['spazio=0x6', 'spazio=-2x3', 'spazio=abc', 'eta=abc', 'materiale=plastica', 'linea=xyz', 'caduta=-5', 'inclusivo=forse'])(
    'ignora il parametro non valido %s', (q) => expect(filtriDaUrl(new URLSearchParams(q))).toEqual({}),
  );
  it('andata e ritorno', () => {
    const f: Filtri = { linea: 'giochi', sottocategoria: 'Altalene e dondoli', materiale: 'acciaio', eta: 4, caduta_max_cm: 150, inclusivo: true, spazio: { lunghezza_m: 7.5, larghezza_m: 6 } };
    expect(filtriDaUrl(filtriAUrl(f))).toEqual(f);
  });
});

describe('versoVoce', () => {
  const p: Prodotto = {
    codice: 'X', slug: 'x', nome: 'X', linea: 'giochi', sottocategoria: 'S', inclusivo: false, attivo: true,
    foto_render: [], foto_reali: ['/r.jpg', '/r2.jpg'], descrizione: 'lunga', pdf_scheda: '/s.pdf',
  };
  it('tiene solo i campi dell’indice', () => {
    const voce = versoVoce(p);
    expect(Object.keys(voce).sort()).toEqual(['codice', 'foto', 'foto_reale', 'inclusivo', 'linea', 'nome', 'slug', 'sottocategoria'].sort());
    expect(JSON.stringify(voce)).not.toMatch(/prezzo|descrizione|pdf/);
  });
  it('usa la prima foto render, altrimenti la prima reale', () => {
    expect(versoVoce(p).foto).toBe('/r.jpg');
    expect(versoVoce({ ...p, foto_render: ['/x.png'] }).foto).toBe('/x.png');
    expect(versoVoce({ ...p, foto_render: ['/x.png'] }).foto_reale).toBe('/r.jpg');
  });
});
