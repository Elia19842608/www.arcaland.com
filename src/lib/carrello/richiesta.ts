import { totaleArticoli, type Carrello } from './carrello';

/** Testo leggibile della richiesta, incluso nella mail che arriva ad Arcaland. */
export function testoRichiesta(c: Carrello): string {
  if (c.length === 0) return 'Nessun prodotto selezionato: richiesta di progetto su misura.';
  const righe = c.map((r) => `${r.quantita} × ${r.codice} — ${r.nome}`);
  const n = totaleArticoli(c);
  return `${righe.join('\n')}\n\nTotale: ${n} ${n === 1 ? 'articolo' : 'articoli'}`;
}
