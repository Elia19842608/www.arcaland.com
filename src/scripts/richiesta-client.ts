import { aggiungi, totaleArticoli } from '../lib/carrello/carrello';
import { leggiCarrello, salvaCarrello, CHIAVE, EVENTO } from '../lib/carrello/archivio';
import { testoRichiesta } from '../lib/carrello/richiesta';
import type { VoceIndice } from '../lib/catalogo/filtri';
import { articoli, collegaRighe, rigaQuantitaHtml } from './carrello-client';

const MAX_BYTE = 8 * 1024 * 1024;
const ESTENSIONI = ['pdf', 'jpg', 'jpeg', 'png', 'dwg', 'zip'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Campo = 'tipo_cliente' | 'nome' | 'ente' | 'email' | 'telefono' | 'comune' | 'note' | 'allegato';
const ORDINE: Campo[] = ['tipo_cliente', 'nome', 'ente', 'email', 'telefono', 'comune', 'note', 'allegato'];

async function aggiungiDaUrl(): Promise<void> {
  const p = new URLSearchParams(location.search);
  const slug = p.get('aggiungi');
  if (!slug) return;
  const q = Math.max(1, Math.min(999, Math.trunc(Number(p.get('quantita')) || 1)));
  try {
    const voci: VoceIndice[] = await (await fetch('/prodotti/indice.json')).json();
    const v = voci.find((x) => x.slug === slug);
    if (v) salvaCarrello(aggiungi(leggiCarrello(), { slug: v.slug, codice: v.codice, nome: v.nome }, q));
  } catch { /* prodotto non trovato: si prosegue senza aggiungerlo */ }
  history.replaceState(null, '', location.pathname);
}

function erroreAllegato(file: File | undefined): string | null {
  if (!file || file.size === 0) return null;
  const est = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ESTENSIONI.includes(est)) return 'Formato non ammesso: usa PDF, JPG, PNG, DWG o ZIP';
  if (file.size > MAX_BYTE) return 'Il file supera 8 MB: comprimilo o mandacelo via mail';
  return null;
}

export async function avviaRichiesta(): Promise<void> {
  const form = document.querySelector<HTMLFormElement>('[data-form-richiesta]');
  const lista = document.querySelector<HTMLElement>('[data-righe-richiesta]');
  const vuota = document.querySelector<HTMLElement>('[data-richiesta-vuota]');
  const conteggio = document.querySelector<HTMLElement>('[data-conteggio-richiesta]');
  const campoProdotti = document.querySelector<HTMLInputElement>('[data-campo-prodotti]');
  const erroreInvio = document.querySelector<HTMLElement>('[data-errore-invio]');
  const invia = document.querySelector<HTMLButtonElement>('[data-invia]');
  if (!form || !lista) return;

  function disegna() {
    const c = leggiCarrello();
    lista!.innerHTML = c.map(rigaQuantitaHtml).join('');
    lista!.hidden = c.length === 0;
    if (vuota) vuota.hidden = c.length > 0;
    if (conteggio) conteggio.textContent = c.length ? articoli(totaleArticoli(c)) : '';
  }
  collegaRighe(lista);
  window.addEventListener(EVENTO, disegna);
  window.addEventListener('storage', (e) => { if (e.key === CHIAVE) disegna(); });
  disegna();
  await aggiungiDaUrl();
  disegna();

  const elementoDi = (campo: Campo) =>
    campo === 'tipo_cliente'
      ? form.querySelector<HTMLInputElement>('input[name="tipo_cliente"]')
      : form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${campo}"]`);

  function mostra(campo: Campo, messaggio: string | null) {
    const p = document.getElementById(`err-${campo}`);
    if (p) { p.textContent = messaggio ?? ''; p.hidden = !messaggio; }
    const el = campo === 'tipo_cliente' ? null : elementoDi(campo);
    if (el) el.setAttribute('aria-invalid', String(!!messaggio));
  }

  function valida(): Campo[] {
    const d = new FormData(form!);
    const testo = (k: string) => String(d.get(k) ?? '').trim();
    const errori: Partial<Record<Campo, string>> = {};
    if (!d.get('tipo_cliente')) errori.tipo_cliente = 'Indica se sei un ente pubblico o un’attività privata';
    if (!testo('nome')) errori.nome = 'Scrivi nome e cognome';
    if (!testo('ente')) errori.ente = "Scrivi il nome dell'ente o dell'azienda";
    if (!EMAIL.test(testo('email'))) errori.email = 'Scrivi un indirizzo email valido, per esempio nome@comune.it';
    if (testo('telefono').replace(/\D/g, '').length < 6) errori.telefono = 'Scrivi un numero di telefono';
    if (!testo('comune')) errori.comune = "Indica il comune dove si trova l'area";
    if (leggiCarrello().length === 0 && !testo('note')) errori.note = 'Descrivi il progetto nelle note, oppure aggiungi dei prodotti';
    const file = (form!.querySelector<HTMLInputElement>('[name="allegato"]')?.files ?? [])[0];
    const ea = erroreAllegato(file);
    if (ea) errori.allegato = ea;
    ORDINE.forEach((c) => mostra(c, errori[c] ?? null));
    return ORDINE.filter((c) => errori[c]);
  }

  // controllo immediato dell'allegato e pulizia degli errori mentre si corregge
  form.querySelector<HTMLInputElement>('[name="allegato"]')?.addEventListener('change', (e) => {
    mostra('allegato', erroreAllegato((e.target as HTMLInputElement).files?.[0]));
  });
  form.addEventListener('input', (e) => {
    const nome = (e.target as HTMLInputElement).name as Campo;
    if (ORDINE.includes(nome) && nome !== 'allegato') mostra(nome, null);
  });

  async function inviaModulo() {
    const sbagliati = valida();
    if (sbagliati.length) { elementoDi(sbagliati[0])?.focus(); return; }
    const c = leggiCarrello();
    if (campoProdotti) campoProdotti.value = testoRichiesta(c);
    if (erroreInvio) erroreInvio.hidden = true;
    invia?.setAttribute('aria-busy', 'true');
    if (invia) { invia.disabled = true; invia.textContent = 'Invio in corso…'; }
    try {
      const risposta = await fetch('/', { method: 'POST', body: new FormData(form!) });
      if (!risposta.ok) throw new Error(String(risposta.status));
      try { sessionStorage.setItem('arcaland-ultima-richiesta', testoRichiesta(c)); } catch { /* facoltativo */ }
      salvaCarrello([]);
      location.assign('/richiesta/inviata');
    } catch {
      if (erroreInvio) { erroreInvio.hidden = false; erroreInvio.querySelector<HTMLElement>('[data-riprova]')?.focus(); }
    } finally {
      invia?.removeAttribute('aria-busy');
      if (invia) { invia.disabled = false; invia.textContent = 'Invia la richiesta'; }
    }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); void inviaModulo(); });
  document.querySelector('[data-riprova]')?.addEventListener('click', () => void inviaModulo());
}
