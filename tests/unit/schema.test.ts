import { describe, it, expect } from 'vitest';
import { prodottoSchema } from '../../src/lib/catalogo/schema';

const completo = {
  codice: '9.HP150.00', slug: '9-hp150-00', nome: 'Hexaplay torre 150', linea: 'giochi', sottocategoria: 'Hexaplay',
  materiale: 'legno', eta_min: 3, eta_max: 12, altezza_caduta_cm: 150,
  ingombro: { lunghezza_cm: 300, larghezza_cm: 260, altezza_cm: 320 },
  area_sicurezza: { lunghezza_cm: 700, larghezza_cm: 660 }, utenti_max: 8, inclusivo: false,
  descrizione: 'Torre esagonale.', foto_render: ['/media/a.png'], foto_reali: ['/media/b.jpg'],
  pdf_scheda: '/media/s.pdf', pdf_certificato: '/media/c.pdf', pdf_istruzioni: '/media/i.pdf', attivo: true,
};

describe('prodottoSchema', () => {
  it('accetta un prodotto completo', () => {
    expect(prodottoSchema.safeParse(completo).success).toBe(true);
  });
  it('accetta un prodotto minimo e applica i default', () => {
    const r = prodottoSchema.parse({ codice: 'X1', slug: 'x1', nome: 'Panchina', linea: 'arredo-urbano', sottocategoria: 'Panchine' });
    expect(r.inclusivo).toBe(false);
    expect(r.foto_render).toEqual([]);
    expect(r.foto_reali).toEqual([]);
    expect(r.attivo).toBe(true);
  });
  it('rifiuta un materiale non previsto', () => {
    expect(prodottoSchema.safeParse({ ...completo, materiale: 'plastica' }).success).toBe(false);
  });
  it('rifiuta qualunque campo prezzo', () => {
    expect(prodottoSchema.safeParse({ ...completo, prezzo: 100 }).success).toBe(false);
  });
});
