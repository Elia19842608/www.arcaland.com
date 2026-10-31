import { describe, it, expect } from 'vitest';
import { testoRichiesta } from '../../src/lib/carrello/richiesta';

describe('testoRichiesta', () => {
  it('elenca i prodotti e il totale', () => {
    expect(testoRichiesta([
      { slug: 'a', codice: '9.HP150.00', nome: 'Hexaplay torre 150', quantita: 2 },
      { slug: 'b', codice: '5.PA100.00', nome: 'Panchina con schienale', quantita: 3 },
    ])).toBe('2 × 9.HP150.00 — Hexaplay torre 150\n3 × 5.PA100.00 — Panchina con schienale\n\nTotale: 5 articoli');
  });
  it('singolare', () => {
    expect(testoRichiesta([{ slug: 'a', codice: 'X', nome: 'Y', quantita: 1 }])).toBe('1 × X — Y\n\nTotale: 1 articolo');
  });
  it('carrello vuoto', () => {
    expect(testoRichiesta([])).toBe('Nessun prodotto selezionato: richiesta di progetto su misura.');
  });
});
