import type { Linea, Materiale, Prodotto } from '../catalogo/tipi';

export interface VoceListino {
  codice: string; nome: string; descrizione?: string;
  macro_categoria: string; categoria: string; stato: string;
}

const LINEE: Record<string, Linea> = {
  giochi: 'giochi',
  arredo: 'arredo-urbano',
  "sport all'aperto": 'percorsi-sportivi',
};

/** Sottocategorie del Listino che non vanno sul sito. */
const ESCLUSE = new Set(['semilavorati']);

const SIGLE = new Set(['PVC', 'RAL', 'CLS', 'EN', 'EL', 'S/S', 'C/S', 'HPL', 'PE', 'UNI']);
const NOMI_PROPRI: Record<string, string> = {
  'RED GRANDIS': 'Red Grandis', HEXAPLAY: 'Hexaplay', NOLMO: 'Nolmo', MILANO: 'Milano', BOLOGNA: 'Bologna',
  LONDON: 'London', LIBERTY: 'Liberty', BORA: 'Bora', CERVI: 'Cervi', 'AGILITY DOG': 'Agility Dog',
};
const DOPO_SERIE = new Set(['SERIE', 'MOD.', 'MODELLO']);

export function slugDaCodice(codice: string): string {
  return codice.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function mappaLinea(macro: string): Linea | null {
  return LINEE[macro.trim().toLowerCase()] ?? null;
}

function maiuscolaIniziale(s: string): string {
  return s ? s[0].toLocaleUpperCase('it') + s.slice(1) : s;
}

export function nomeLeggibile(nome: string): string {
  let testo = nome.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
  const segnaposti: string[] = [];
  for (const [chiave, valore] of Object.entries(NOMI_PROPRI)) {
    testo = testo.replace(new RegExp(`\\b${chiave}\\b`, 'g'), () => `\u0000${segnaposti.push(valore) - 1}\u0000`);
  }
  const parole = testo.split(' ');
  const risultato = parole.map((p, i) => {
    if (p.includes('\u0000')) return p;
    if (SIGLE.has(p) || /^"[A-Z0-9]"$/.test(p)) return p;
    const minuscola = p.toLocaleLowerCase('it');
    if (i > 0 && DOPO_SERIE.has(parole[i - 1]) && /^[A-ZÀ-Ù]/.test(p)) return maiuscolaIniziale(minuscola);
    return minuscola;
  });
  const unito = maiuscolaIniziale(risultato.join(' '));
  return unito.replace(/\u0000(\d+)\u0000/g, (_, n) => segnaposti[Number(n)]);
}

function sottocategoria(categoria: string): string {
  const pulita = categoria.replace(/\s+/g, ' ').trim();
  if (pulita.toLowerCase() === 'hexaplay') return 'Hexaplay';
  return maiuscolaIniziale(pulita.toLocaleLowerCase('it'));
}

const LEGNO = /\b(LEGNO|PINO|LARICE|RED GRANDIS|ROBINIA|CASTAGNO)\b/;
const ACCIAIO = /\b(ACCIAIO|ZINCAT[OAIE]|CORTEN|GHISA|INOX|METALLO)\b/;

function materialeDaNome(nome: string): Materiale | undefined {
  const n = nome.toUpperCase();
  const legno = LEGNO.test(n), acciaio = ACCIAIO.test(n);
  if (legno && acciaio) return 'misto';
  if (legno) return 'legno';
  if (acciaio) return 'acciaio';
  return undefined;
}

export function daListino(v: VoceListino): Prodotto | null {
  const linea = mappaLinea(v.macro_categoria);
  if (!linea) return null;
  if (ESCLUSE.has(v.categoria.trim().toLowerCase())) return null;
  const sotto = sottocategoria(v.categoria);
  const prodotto: Prodotto = {
    codice: v.codice.trim(),
    slug: slugDaCodice(v.codice),
    nome: nomeLeggibile(v.nome),
    linea,
    sottocategoria: sotto,
    inclusivo: sotto.toLowerCase() === 'giochi inclusivi' || /\bDISABIL/i.test(v.nome),
    foto_render: [],
    foto_reali: [],
    attivo: v.stato.trim().toLowerCase() === 'attivo',
  };
  const materiale = materialeDaNome(v.nome);
  if (materiale) prodotto.materiale = materiale;
  if (v.descrizione?.trim()) prodotto.descrizione = v.descrizione.trim();
  return prodotto;
}

const CAMPI_CONTROLLATI: [keyof Prodotto | 'foto', string][] = [
  ['materiale', 'materiale'], ['eta_min', 'età'], ['altezza_caduta_cm', 'altezza di caduta'],
  ['ingombro', 'ingombro'], ['area_sicurezza', 'area di sicurezza'], ['foto', 'foto'],
  ['pdf_scheda', 'scheda PDF'], ['pdf_certificato', 'certificato'],
];

export function campiMancanti(p: Prodotto): string[] {
  return CAMPI_CONTROLLATI.filter(([campo]) => {
    if (campo === 'foto') return p.foto_render.length + p.foto_reali.length === 0;
    return p[campo] === undefined;
  }).map(([, etichetta]) => etichetta);
}

/** Restituisce uno slug non ancora usato e lo registra in `visti`. */
export function slugUnico(slug: string, visti: Set<string>): string {
  let candidato = slug;
  for (let n = 2; visti.has(candidato); n++) candidato = `${slug}-${n}`;
  visti.add(candidato);
  return candidato;
}
