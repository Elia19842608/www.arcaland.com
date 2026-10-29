import { describe, it, expect } from 'vitest';
import { slugDaCodice, mappaLinea, daListino, nomeLeggibile, type VoceListino } from '../../src/lib/import/listino';
import { prodottoSchema } from '../../src/lib/catalogo/schema';

const torre: VoceListino = { codice: '9.HP150.00', nome: 'HEXAPLAY TORRE 150', macro_categoria: 'Giochi', categoria: 'Hexaplay', stato: 'attivo' };

describe('slugDaCodice', () => {
  it('converte punti e maiuscole', () => expect(slugDaCodice('9.HP100.01')).toBe('9-hp100-01'));
  it('gestisce spazi e trattini', () => expect(slugDaCodice('TRB02 - P')).toBe('trb02-p'));
  it('codici diversi danno slug diversi', () => {
    const codici = ['9.HP100.01', '9.HP10.001', 'TRB02', 'TRB02 - P', '9.20071.12', '9.20071.12.3C'];
    expect(new Set(codici.map(slugDaCodice)).size).toBe(codici.length);
  });
});

describe('mappaLinea', () => {
  it('Giochi', () => expect(mappaLinea('Giochi')).toBe('giochi'));
  it('Arredo', () => expect(mappaLinea('Arredo')).toBe('arredo-urbano'));
  it("Sport all'aperto", () => expect(mappaLinea("Sport all'aperto")).toBe('percorsi-sportivi'));
  it('sconosciuta', () => expect(mappaLinea('Varie')).toBeNull());
});

describe('nomeLeggibile', () => {
  it('prima lettera maiuscola, resto minuscolo', () => expect(nomeLeggibile('HEXAPLAY TORRE 150')).toBe('Hexaplay torre 150'));
  it('conserva le sigle e i nomi propri', () => {
    expect(nomeLeggibile('GAZEBO 4 FALDE 3X3 TELO PVC')).toBe('Gazebo 4 falde 3x3 telo PVC');
    expect(nomeLeggibile('PANCA IN LARICE O RED GRANDIS E CORTEN')).toBe('Panca in larice o Red Grandis e corten');
  });
  it('maiuscola sul nome della serie', () => expect(nomeLeggibile('PANCHINA SERIE EQUESTRE CON SCHIENALE')).toBe('Panchina serie Equestre con schienale'));
});

describe('daListino', () => {
  it('mappa una torre Hexaplay', () => {
    const p = daListino(torre)!;
    expect(p.nome).toBe('Hexaplay torre 150');
    expect(p.sottocategoria).toBe('Hexaplay');
    expect(p.slug).toBe('9-hp150-00');
    expect(p.attivo).toBe(true);
    expect(prodottoSchema.safeParse(p).success).toBe(true);
  });
  it('stato disattivo', () => expect(daListino({ ...torre, stato: 'disattivo' })!.attivo).toBe(false));
  it('normalizza la sottocategoria', () =>
    expect(daListino({ ...torre, categoria: 'Altalene e dondoli ' })!.sottocategoria).toBe('Altalene e dondoli'));
  it('scarta i semilavorati e le linee sconosciute', () => {
    expect(daListino({ ...torre, macro_categoria: 'Arredo', categoria: 'Semilavorati' })).toBeNull();
    expect(daListino({ ...torre, macro_categoria: 'Varie' })).toBeNull();
  });
  it('materiale solo se dichiarato nel nome', () => {
    expect(daListino({ ...torre, nome: 'PANCHINA SERIE RONDINE IN ACCIAIO' })!.materiale).toBe('acciaio');
    expect(daListino({ ...torre, nome: 'PANCHINA AUTOPORTANTE IN PINO' })!.materiale).toBe('legno');
    expect(daListino({ ...torre, nome: 'TAVOLO IN LARICE O RED GRANDIS E CORTEN' })!.materiale).toBe('misto');
    expect(daListino(torre)!.materiale).toBeUndefined();
  });
  it('inclusivo per categoria o nome', () => {
    expect(daListino({ ...torre, categoria: 'Giochi Inclusivi' })!.inclusivo).toBe(true);
    expect(daListino({ ...torre, nome: 'COMPOSIZIONE SERIE EQUESTRE A SBALZO PER DISABILI' })!.inclusivo).toBe(true);
  });
  it('non porta mai prezzi', () => {
    const p = daListino({ ...torre, prezzo_ivato: 999 } as unknown as VoceListino)!;
    expect(JSON.stringify(p)).not.toMatch(/prezzo|costo|ricarico/);
  });
});

import { slugUnico } from '../../src/lib/import/listino';
describe('slugUnico', () => {
  it('aggiunge un suffisso ai doppioni', () => {
    const visti = new Set<string>();
    expect(slugUnico('9-10031f-00', visti)).toBe('9-10031f-00');
    expect(slugUnico('9-10031f-00', visti)).toBe('9-10031f-00-2');
    expect(slugUnico('9-10031f-00', visti)).toBe('9-10031f-00-3');
  });
});
