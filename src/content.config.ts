import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { parse } from 'yaml';
import { prodottoSchema, impostazioniSchema } from './lib/catalogo/schema';

const cartellaProdotti = process.env.CONTENUTI === 'fixture' ? './tests/unit/fixtures/prodotti' : './src/content/prodotti';

const prodotti = defineCollection({
  loader: glob({ pattern: '*.md', base: cartellaProdotti, generateId: ({ data }) => String(data.slug) }),
  schema: prodottoSchema,
});

const impostazioni = defineCollection({
  // il pannello salva un oggetto semplice; il loader lo trasforma in una voce con id "sito"
  loader: file('./src/content/impostazioni/sito.yaml', { parser: (testo) => [{ id: 'sito', ...parse(testo) }] }),
  schema: impostazioniSchema,
});

export const collections = { prodotti, impostazioni };
