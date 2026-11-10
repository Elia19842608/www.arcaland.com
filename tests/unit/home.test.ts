import { describe, expect, it } from 'vitest';
import { faseDaAvanzamento, cercaComune, raggioPunto, normalizzaNome } from '../../src/lib/home/home';

const comuni = [{ n: 'Reggiolo' }, { n: "Sant'Ilario d'Enza" }, { n: 'Reggio nell\'Emilia' }, { n: 'Carpi' }];

describe('faseDaAvanzamento', () => {
  it('divide lo scorrimento in sei parti uguali', () => {
    expect(faseDaAvanzamento(0)).toBe(0);
    expect(faseDaAvanzamento(0.17)).toBe(1);
    expect(faseDaAvanzamento(0.5)).toBe(3);
    expect(faseDaAvanzamento(0.99)).toBe(5);
  });
  it('resta nei limiti', () => {
    expect(faseDaAvanzamento(-1)).toBe(0);
    expect(faseDaAvanzamento(1)).toBe(5);
    expect(faseDaAvanzamento(7)).toBe(5);
  });
});

describe('cercaComune', () => {
  it('ignora maiuscole, accenti e spazi ai bordi', () => {
    expect(normalizzaNome('  Mirà ')).toBe('mira');
    expect(cercaComune(' reggiolo ', comuni)).toEqual({ esito: 'trovato', comuni: [comuni[0]] });
  });
  it('con meno di due lettere non cerca', () => {
    expect(cercaComune('r', comuni).esito).toBe('vuoto');
  });
  it('elenca i comuni che iniziano così', () => {
    const r = cercaComune('regg', comuni);
    expect(r.esito).toBe('parziali');
    expect(r.comuni.map((c) => c.n)).toEqual(['Reggiolo', "Reggio nell'Emilia"]);
  });
  it('dice quando non c’è', () => {
    expect(cercaComune('Milano', comuni)).toEqual({ esito: 'nessuno', comuni: [] });
  });
});

describe('raggioPunto', () => {
  it('cresce con la popolazione ma con un minimo leggibile', () => {
    expect(raggioPunto(0, 100000)).toBe(6);
    expect(raggioPunto(100000, 100000)).toBe(18);
    expect(raggioPunto(25000, 100000)).toBe(12);
  });
});
