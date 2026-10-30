// Uso: npx tsx scripts/raccogli-media.ts <cartella con foto e PDF>
// Abbina i file ai prodotti tramite il codice nel nome, li copia in public/media/prodotti/<slug>/
// e aggiunge i percorsi alle schede senza mai cancellare quello che c'è già.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse, stringify } from 'yaml';
import { abbinaFile } from '../src/lib/import/media';

const sorgente = process.argv[2];
if (!sorgente) { console.error('Indica la cartella con le foto e i PDF.'); process.exit(1); }

const cartellaProdotti = 'src/content/prodotti';
const schede = new Map<string, { file: string; dati: Record<string, unknown> }>();
for (const f of readdirSync(cartellaProdotti).filter((x) => x.endsWith('.md'))) {
  const testo = readFileSync(join(cartellaProdotti, f), 'utf8');
  const dati = parse(testo.split('---')[1]) as Record<string, unknown>;
  const codice = String(dati.codice);
  if (!schede.has(codice)) schede.set(codice, { file: join(cartellaProdotti, f), dati });
}
const codici = [...schede.keys()];

function* fileIn(dir: string): Generator<string> {
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) yield* fileIn(p);
    else yield p;
  }
}

const righe = ['file,esito,codice,tipo'];
const modificate = new Set<string>();
let abbinati = 0, scartati = 0;
const csv = (s: string) => `"${s.replace(/"/g, '""')}"`;

for (const percorso of fileIn(sorgente)) {
  const nome = basename(percorso);
  const a = abbinaFile(nome, codici);
  if (!a) { righe.push([csv(percorso), 'non abbinato', '', ''].join(',')); scartati++; continue; }
  const scheda = schede.get(a.codice)!;
  const slug = String(scheda.dati.slug);
  const pulito = nome.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  mkdirSync(join('public/media/prodotti', slug), { recursive: true });
  copyFileSync(percorso, join('public/media/prodotti', slug, pulito));
  const url = `/media/prodotti/${slug}/${pulito}`;
  const d = scheda.dati;
  if (a.tipo === 'render' || a.tipo === 'reale') {
    const campo = a.tipo === 'render' ? 'foto_render' : 'foto_reali';
    const lista = Array.isArray(d[campo]) ? (d[campo] as string[]) : [];
    if (!lista.includes(url)) d[campo] = [...lista, url];
  } else {
    const campo = { scheda: 'pdf_scheda', certificato: 'pdf_certificato', istruzioni: 'pdf_istruzioni' }[a.tipo];
    if (!d[campo]) d[campo] = url;
  }
  modificate.add(a.codice);
  righe.push([csv(percorso), 'abbinato', csv(a.codice), a.tipo].join(','));
  abbinati++;
}

for (const codice of modificate) {
  const { file, dati } = schede.get(codice)!;
  writeFileSync(file, `---\n${stringify(dati)}---\n`);
}
mkdirSync('dati', { recursive: true });
writeFileSync('dati/mappa-media.csv', righe.join('\n') + '\n');
console.log(`Abbinati ${abbinati} file su ${modificate.size} prodotti, non abbinati ${scartati}. Dettaglio: dati/mappa-media.csv`);
