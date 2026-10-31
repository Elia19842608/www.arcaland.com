import { describe, it, expect } from 'vitest';
import { contaPerLinea } from '../../src/lib/catalogo/conteggi';

const p = (linea: string, inclusivo = false) => ({ linea, inclusivo }) as never;

describe('contaPerLinea', () => {
  it('conta per linea nell’ordine del catalogo e omette gli zeri', () => {
    expect(contaPerLinea([p('percorsi-sportivi'), p('giochi'), p('giochi', true)])).toEqual([
      { linea: 'giochi', etichetta: 'Giochi', n: 2 },
      { linea: 'percorsi-sportivi', etichetta: 'Percorsi sportivi', n: 1 },
    ]);
  });
  it('lista vuota', () => expect(contaPerLinea([])).toEqual([]));
});
