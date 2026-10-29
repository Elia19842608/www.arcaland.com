import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { prodottoSchema, impostazioniSchema } from './lib/catalogo/schema';

const cartellaProdotti = process.env.CONTENUTI === 'fixture' ? './tests/unit/fixtures/prodotti' : './src/content/prodotti';

const prodotti = defineCollection({
  loader: glob({ pattern: '*.md', base: cartellaProdotti, generateId: ({ data }) => String(data.slug) }),
  schema: prodottoSchema,
});

const impostazioni = defineCollection({
  loader: file('./src/content/impostazioni/sito.yaml'),
  schema: impostazioniSchema,
});

export const collections = { prodotti, impostazioni };
