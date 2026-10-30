import { describe, it, expect } from 'vitest';
import { abbinaFile } from '../../src/lib/import/media';

const codici = ['9.HP150.00', '9.HP150.01', '9.HP15.00', 'TRB02', 'TRB02 - P', '9.10031F.00'];

describe('abbinaFile', () => {
  it('codice senza punti e tipo render', () => expect(abbinaFile('9HP150-00_render.png', codici)).toEqual({ codice: '9.HP150.00', tipo: 'render' }));
  it('codice con punti e foto nel parco', () => expect(abbinaFile('foto-parco-9.HP150.00.jpg', codici)).toEqual({ codice: '9.HP150.00', tipo: 'reale' }));
  it('nessun codice', () => expect(abbinaFile('logo.png', codici)).toBeNull());
  it('vince il codice più lungo', () => expect(abbinaFile('TRB02-P render.png', codici)).toEqual({ codice: 'TRB02 - P', tipo: 'render' }));
  it('non confonde codici che si contengono', () => {
    expect(abbinaFile('9HP1500.png', codici)?.codice).toBe('9.HP15.00');
    expect(abbinaFile('9HP15000.png', codici)?.codice).toBe('9.HP150.00');
  });
  it('riconosce i PDF', () => {
    expect(abbinaFile('9.HP150.00 scheda tecnica.pdf', codici)).toEqual({ codice: '9.HP150.00', tipo: 'scheda' });
    expect(abbinaFile('CERTIFICATO_9HP15000.pdf', codici)).toEqual({ codice: '9.HP150.00', tipo: 'certificato' });
    expect(abbinaFile('9HP15000-istruzioni-montaggio.pdf', codici)).toEqual({ codice: '9.HP150.00', tipo: 'istruzioni' });
  });
  it('tipo predefinito dall’estensione', () => {
    expect(abbinaFile('9HP15000.webp', codici)!.tipo).toBe('render');
    expect(abbinaFile('9HP15000.jpeg', codici)!.tipo).toBe('reale');
    expect(abbinaFile('9HP15000.pdf', codici)!.tipo).toBe('scheda');
  });
  it('ignora i formati non supportati', () => expect(abbinaFile('9HP15000.docx', codici)).toBeNull());
  it('maiuscole e minuscole indifferenti', () => expect(abbinaFile('9.10031f.00-render.png', codici)?.codice).toBe('9.10031F.00'));
});
