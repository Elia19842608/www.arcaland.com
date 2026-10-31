import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aggiungi, impostaQuantita, rimuovi, totaleArticoli, daJson, type Carrello } from '../../src/lib/carrello/carrello';

const panchina = { slug: '5-pa100-00', codice: '5.PA100.00', nome: 'Panchina' };
const torre = { slug: '9-hp150-00', codice: '9.HP150.00', nome: 'Torre' };

describe('operazioni', () => {
  it('aggiunge e somma', () => {
    let c = aggiungi([], panchina);
    expect(c).toEqual([{ ...panchina, quantita: 1 }]);
    c = aggiungi(c, panchina);
    expect(c[0].quantita).toBe(2);
    expect(aggiungi([{ ...panchina, quantita: 998 }], panchina, 5)[0].quantita).toBe(999);
  });
  it('imposta la quantità', () => {
    const c: Carrello = [{ ...panchina, quantita: 2 }, { ...torre, quantita: 1 }];
    expect(impostaQuantita(c, panchina.slug, 0)).toEqual([{ ...torre, quantita: 1 }]);
    expect(impostaQuantita(c, panchina.slug, 1500)[0].quantita).toBe(999);
    expect(impostaQuantita(c, panchina.slug, 2.7)[0].quantita).toBe(2);
    expect(rimuovi(c, torre.slug)).toEqual([{ ...panchina, quantita: 2 }]);
  });
  it('conta gli articoli', () => expect(totaleArticoli([{ ...panchina, quantita: 2 }, { ...torre, quantita: 3 }])).toBe(5));
  it('non modifica il carrello ricevuto', () => {
    const c: Carrello = Object.freeze([Object.freeze({ ...panchina, quantita: 1 })]) as Carrello;
    expect(() => { aggiungi(c, panchina); impostaQuantita(c, panchina.slug, 4); rimuovi(c, panchina.slug); }).not.toThrow();
    expect(c[0].quantita).toBe(1);
  });
});

describe('daJson', () => {
  it.each([['rotto'], [null], ['{"a":1}'], ['']])('restituisce vuoto per %s', (t) => expect(daJson(t as string | null)).toEqual([]));
  it('tiene solo le righe valide', () => {
    const t = JSON.stringify([
      { ...panchina, quantita: 2 },
      { ...torre, quantita: -1 },
      { ...torre, quantita: 'x' },
      { codice: 'A', nome: 'B', quantita: 1 },
      null,
    ]);
    expect(daJson(t)).toEqual([{ ...panchina, quantita: 2 }]);
  });
});

describe('archivio', () => {
  beforeEach(() => vi.resetModules());
  it('non lancia se localStorage lancia, e tiene il dato in memoria', async () => {
    const rotto = { getItem: () => { throw new Error('no'); }, setItem: () => { throw new Error('no'); } };
    vi.stubGlobal('localStorage', rotto);
    vi.stubGlobal('window', { dispatchEvent: () => true });
    const { leggiCarrello, salvaCarrello } = await import('../../src/lib/carrello/archivio');
    expect(leggiCarrello()).toEqual([]);
    expect(() => salvaCarrello([{ ...panchina, quantita: 3 }])).not.toThrow();
    expect(leggiCarrello()).toEqual([{ ...panchina, quantita: 3 }]);
    vi.unstubAllGlobals();
  });
});
