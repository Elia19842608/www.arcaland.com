export type TipoMedia = 'render' | 'reale' | 'scheda' | 'certificato' | 'istruzioni';
export interface Abbinamento { codice: string; tipo: TipoMedia }

const IMMAGINI_RENDER = ['png', 'webp', 'svg', 'avif'];
const IMMAGINI_REALI = ['jpg', 'jpeg'];

const normalizza = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function tipoDa(nome: string, estensione: string): TipoMedia | null {
  const n = nome.toLowerCase();
  if (estensione === 'pdf') {
    if (n.includes('cert')) return 'certificato';
    if (n.includes('istruz') || n.includes('montaggio') || n.includes('posa')) return 'istruzioni';
    return 'scheda';
  }
  if (IMMAGINI_RENDER.includes(estensione) || IMMAGINI_REALI.includes(estensione)) {
    if (n.includes('render')) return 'render';
    if (n.includes('reale') || n.includes('parco') || n.includes('cantiere')) return 'reale';
    return IMMAGINI_RENDER.includes(estensione) ? 'render' : 'reale';
  }
  return null;
}

/** Riconosce il prodotto (dal codice nel nome del file) e il tipo di documento. */
export function abbinaFile(nomeFile: string, codici: string[]): Abbinamento | null {
  const punto = nomeFile.lastIndexOf('.');
  if (punto < 0) return null;
  const estensione = nomeFile.slice(punto + 1).toLowerCase();
  const base = nomeFile.slice(0, punto);
  const tipo = tipoDa(base, estensione);
  if (!tipo) return null;
  const testo = normalizza(base);
  let migliore: string | null = null;
  for (const codice of codici) {
    const c = normalizza(codice);
    if (c && testo.includes(c) && (!migliore || c.length > normalizza(migliore).length)) migliore = codice;
  }
  return migliore ? { codice: migliore, tipo } : null;
}
