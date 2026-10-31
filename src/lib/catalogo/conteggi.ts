import { ETICHETTE_LINEA, LINEE, type Linea } from './tipi';

export interface ConteggioLinea { linea: Linea; etichetta: string; n: number }

/** Prodotti per linea, nell'ordine del catalogo; le linee vuote non compaiono. */
export function contaPerLinea(prodotti: { linea: Linea }[]): ConteggioLinea[] {
  return LINEE.map((linea) => ({ linea, etichetta: ETICHETTE_LINEA[linea], n: prodotti.filter((p) => p.linea === linea).length }))
    .filter((c) => c.n > 0);
}
