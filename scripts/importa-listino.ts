// Uso: npx tsx scripts/importa-listino.ts dati/listino-export.json
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { stringify } from 'yaml';
import { daListino, campiMancanti, slugUnico, type VoceListino } from '../src/lib/import/listino';
import { prodottoSchema } from '../src/lib/catalogo/schema';

const file = process.argv[2];
if (!file) { console.error('Indica il file JSON del Listino.'); process.exit(1); }
const voci: VoceListino[] = JSON.parse(readFileSync(file, 'utf8'));
const cartella = 'src/content/prodotti';
mkdirSync(cartella, { recursive: true });

let creati = 0, esistenti = 0, scartati = 0;
const slugVisti = new Set<string>();
const codiciVisti = new Set<string>();
const report: string[] = ['codice,nome,campi_mancanti'];
const csv = (s: string) => `"${s.replace(/"/g, '""')}"`;

for (const v of voci) {
  const p = daListino(v);
  if (!p) { scartati++; continue; }
  const doppione = codiciVisti.has(p.codice);
  codiciVisti.add(p.codice);
  p.slug = slugUnico(p.slug, slugVisti);
  prodottoSchema.parse(p);
  const note = [...(doppione ? ['CODICE DUPLICATO NEL LISTINO'] : []), ...campiMancanti(p)];
  report.push([csv(p.codice), csv(p.nome), csv(note.join('; '))].join(','));
  const percorso = join(cartella, `${p.slug}.md`);
  if (existsSync(percorso)) { esistenti++; continue; }
  const { foto_render, foto_reali, ...resto } = p;
  writeFileSync(percorso, `---\n${stringify({ ...resto, foto_render, foto_reali })}---\n`);
  creati++;
}
writeFileSync('dati/report-schede-incomplete.csv', report.join('\n') + '\n');
console.log(`Creati ${creati}, già presenti ${esistenti}, scartati ${scartati}. Report: dati/report-schede-incomplete.csv`);
