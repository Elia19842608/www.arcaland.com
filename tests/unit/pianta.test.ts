import { describe, it, expect } from 'vitest';
import { calcolaPianta } from '../../src/lib/catalogo/pianta';

describe('calcolaPianta', () => {
  it('centra l’ingombro nell’area e quota in metri', () => {
    const p = calcolaPianta({ lunghezza_cm: 700, larghezza_cm: 500 }, { lunghezza_cm: 300, larghezza_cm: 200 });
    expect(p.area).toEqual({ x: 80, y: 80, w: 700, h: 500 });
    expect(p.ingombro).toEqual({ x: 280, y: 230, w: 300, h: 200 });
    expect(p.viewBox).toBe('0 0 860 660');
    const testi = p.quote.map((q) => q.testo);
    expect(testi).toContain('7,00 m');
    expect(testi).toContain('5,00 m');
    expect(testi).toContain('3,00 m');
    expect(testi).toContain('2,00 m');
  });
  it('senza ingombro mostra solo l’area', () => {
    const p = calcolaPianta({ lunghezza_cm: 450, larghezza_cm: 800 });
    expect(p.ingombro).toBeUndefined();
    expect(p.quote.map((q) => q.testo).sort()).toEqual(['4,50 m', '8,00 m']);
  });
  it('quota verticale per la larghezza', () => {
    const p = calcolaPianta({ lunghezza_cm: 700, larghezza_cm: 500 });
    expect(p.quote.find((q) => q.testo === '5,00 m')!.verticale).toBe(true);
    expect(p.quote.find((q) => q.testo === '7,00 m')!.verticale).toBe(false);
  });
});
