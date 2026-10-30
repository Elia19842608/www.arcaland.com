import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { prodottoSchema } from '../../src/lib/catalogo/schema';
import { LINEE, MATERIALI } from '../../src/lib/catalogo/tipi';

const config = parse(readFileSync('public/admin/config.yml', 'utf8'));
const prodotti = config.collections.find((c: { name: string }) => c.name === 'prodotti');
const valori = (f: { options: (string | { value: string })[] }) => f.options.map((o) => (typeof o === 'string' ? o : o.value));

describe('configurazione del pannello', () => {
  it('backend GitHub sul repository del sito', () => {
    expect(config.backend).toMatchObject({ name: 'github', repo: 'Elia19842608/arcaland-sito', branch: 'main' });
  });
  it('collection prodotti nella cartella giusta', () => {
    expect(prodotti.folder).toBe('src/content/prodotti');
    expect(prodotti.media_folder ?? config.media_folder).toBe('public/media/prodotti');
  });
  it('i campi coincidono con lo schema', () => {
    const nomi = prodotti.fields.map((f: { name: string }) => f.name).filter((n: string) => n !== 'body');
    expect(new Set(nomi)).toEqual(new Set(Object.keys(prodottoSchema.shape)));
  });
  it('linea e materiale sono select con i valori dello schema', () => {
    const f = (n: string) => prodotti.fields.find((x: { name: string }) => x.name === n);
    expect(f('linea').widget).toBe('select');
    expect(valori(f('linea'))).toEqual([...LINEE]);
    expect(f('materiale').widget).toBe('select');
    expect(valori(f('materiale'))).toEqual([...MATERIALI]);
  });
  it('nessun campo prezzo', () => {
    expect(readFileSync('public/admin/config.yml', 'utf8')).not.toMatch(/prezzo|costo|ricarico/i);
  });
});
