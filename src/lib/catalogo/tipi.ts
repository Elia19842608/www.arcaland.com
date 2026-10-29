export const LINEE = ['giochi', 'arredo-urbano', 'percorsi-sportivi'] as const;
export const MATERIALI = ['legno', 'acciaio', 'misto'] as const;
export type Linea = (typeof LINEE)[number];
export type Materiale = (typeof MATERIALI)[number];

export const ETICHETTE_LINEA: Record<Linea, string> = {
  giochi: 'Giochi',
  'arredo-urbano': 'Arredo urbano',
  'percorsi-sportivi': 'Percorsi sportivi',
};
export const ETICHETTE_MATERIALE: Record<Materiale, string> = { legno: 'Legno', acciaio: 'Acciaio', misto: 'Misto' };

export interface Misure { lunghezza_cm: number; larghezza_cm: number; altezza_cm?: number }

export interface Prodotto {
  codice: string; slug: string; nome: string; linea: Linea; sottocategoria: string;
  materiale?: Materiale; eta_min?: number; eta_max?: number; altezza_caduta_cm?: number;
  ingombro?: Misure; area_sicurezza?: Misure; utenti_max?: number; inclusivo: boolean;
  descrizione?: string; foto_render: string[]; foto_reali: string[];
  pdf_scheda?: string; pdf_certificato?: string; pdf_istruzioni?: string; attivo: boolean;
}
