import { daJson, type Carrello, type RigaCarrello } from './carrello';

export const CHIAVE = 'arcaland-richiesta-v1';
export const EVENTO = 'carrello:aggiornato';

let memoria: RigaCarrello[] | null = null;

export function leggiCarrello(): RigaCarrello[] {
  try {
    const salvato = localStorage.getItem(CHIAVE);
    if (salvato !== null) return daJson(salvato);
  } catch { /* spazio del browser non disponibile: si usa la memoria */ }
  return memoria ? memoria.map((r) => ({ ...r })) : [];
}

export function salvaCarrello(c: Carrello): void {
  memoria = c.map((r) => ({ ...r }));
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(memoria));
  } catch { /* resta in memoria fino alla chiusura della pagina */ }
  try {
    window.dispatchEvent(new CustomEvent(EVENTO, { detail: memoria }));
  } catch { /* ambiente senza window */ }
}
