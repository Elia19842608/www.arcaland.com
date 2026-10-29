import { getCollection, getEntry } from 'astro:content';
import { LINEE, type Prodotto } from './tipi';

export async function prodottiAttivi(): Promise<Prodotto[]> {
  const voci = await getCollection('prodotti', ({ data }) => data.attivo);
  return voci
    .map((v) => v.data as Prodotto)
    .sort((a, b) =>
      LINEE.indexOf(a.linea) - LINEE.indexOf(b.linea) ||
      a.sottocategoria.localeCompare(b.sottocategoria, 'it') ||
      a.nome.localeCompare(b.nome, 'it'));
}

export async function emailRichieste(): Promise<string> {
  const voce = await getEntry('impostazioni', 'sito');
  return voce?.data.email_richieste ?? 'elia.ferretti@zennarolegnami.com';
}
