import { aggiungi, impostaQuantita, rimuovi, totaleArticoli, QUANTITA_MAX, type RigaCarrello } from '../lib/carrello/carrello';
import { leggiCarrello, salvaCarrello, CHIAVE, EVENTO } from '../lib/carrello/archivio';

const ICONA_MENO = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M5 12h14"/></svg>';
const ICONA_PIU = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg>';
const ICONA_CESTINO = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export const articoli = (n: number) => (n === 1 ? '1 articolo' : `${n} articoli`);

export function rigaQuantitaHtml(r: RigaCarrello): string {
  const nome = esc(r.nome);
  return `<li data-slug="${esc(r.slug)}">
    <div><p class="nome"><a href="/prodotti/${esc(r.slug)}">${nome}</a></p><p class="codice">${esc(r.codice)}</p></div>
    <div class="controlli">
      <div class="quantita">
        <button type="button" data-passo="-1" aria-label="Togli uno di ${nome}">${ICONA_MENO}</button>
        <input type="number" inputmode="numeric" min="1" max="${QUANTITA_MAX}" step="1" value="${r.quantita}" aria-label="Quantità di ${nome}" data-quantita-riga />
        <button type="button" data-passo="1" aria-label="Aggiungi uno di ${nome}">${ICONA_PIU}</button>
      </div>
      <button type="button" class="link-rimuovi" data-rimuovi aria-label="Rimuovi ${nome}">${ICONA_CESTINO}Rimuovi</button>
    </div>
  </li>`;
}

/** Collega a un elenco di righe i controlli di quantità e rimozione. */
export function collegaRighe(lista: HTMLElement): void {
  lista.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const li = t.closest<HTMLElement>('li[data-slug]');
    if (!li) return;
    const slug = li.dataset.slug!;
    const passo = t.closest<HTMLElement>('[data-passo]');
    if (passo) {
      const riga = leggiCarrello().find((r) => r.slug === slug);
      if (riga) salvaCarrello(impostaQuantita(leggiCarrello(), slug, Math.max(1, riga.quantita + Number(passo.dataset.passo))));
    }
    if (t.closest('[data-rimuovi]')) salvaCarrello(rimuovi(leggiCarrello(), slug));
  });
  lista.addEventListener('change', (e) => {
    const input = (e.target as HTMLElement).closest<HTMLInputElement>('[data-quantita-riga]');
    const li = input?.closest<HTMLElement>('li[data-slug]');
    if (!input || !li) return;
    const n = Number(input.value);
    salvaCarrello(impostaQuantita(leggiCarrello(), li.dataset.slug!, Number.isFinite(n) && n >= 1 ? n : 1));
  });
}

let timerAvviso: ReturnType<typeof setTimeout> | undefined;
function avvisa(nome: string) {
  const el = document.querySelector<HTMLElement>('[data-avviso]');
  if (!el) return;
  el.innerHTML = `<p>Aggiunto: ${esc(nome)}</p><a href="/richiesta" data-apri-da-avviso>Vedi la richiesta</a>`;
  el.classList.add('visibile');
  clearTimeout(timerAvviso);
  timerAvviso = setTimeout(() => el.classList.remove('visibile'), 4000);
}

export function avviaCarrello(): void {
  const bottone = document.querySelector<HTMLButtonElement>('[data-apri-carrello]');
  const badge = document.querySelector<HTMLElement>('[data-badge-carrello]');
  const pannello = document.querySelector<HTMLElement>('[data-carrello]');
  const velo = document.querySelector<HTMLElement>('[data-velo-carrello]');
  const lista = document.querySelector<HTMLElement>('[data-righe-carrello]');
  const vuoto = document.querySelector<HTMLElement>('[data-carrello-vuoto]');
  const totale = document.querySelector<HTMLElement>('[data-totale-carrello]');
  const piede = pannello?.querySelector<HTMLElement>('footer');

  let precedente = -1;
  function aggiorna() {
    const c = leggiCarrello();
    const n = totaleArticoli(c);
    if (badge && precedente >= 0 && n > precedente) { badge.classList.remove('batte'); void badge.offsetWidth; badge.classList.add('batte'); }
    precedente = n;
    bottone?.setAttribute('aria-label', `Richiedi preventivo, ${articoli(n)}`);
    if (badge) { badge.textContent = String(n); badge.hidden = n === 0; }
    if (lista) {
      const attivo = document.activeElement as HTMLElement | null;
      const slugAttivo = attivo?.closest<HTMLElement>('li[data-slug]')?.dataset.slug;
      const passoAttivo = attivo?.dataset.passo;
      lista.innerHTML = c.map(rigaQuantitaHtml).join('');
      lista.hidden = c.length === 0;
      if (slugAttivo && passoAttivo) lista.querySelector<HTMLElement>(`li[data-slug="${CSS.escape(slugAttivo)}"] [data-passo="${passoAttivo}"]`)?.focus();
    }
    if (vuoto) vuoto.hidden = c.length > 0;
    if (piede) piede.hidden = c.length === 0;
    if (totale) totale.textContent = `${articoli(n)} da quotare`;
  }

  const focusabili = () => [...(pannello?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])') ?? [])].filter((x) => x.offsetParent !== null);

  function apri() {
    if (!pannello || !velo) return;
    pannello.hidden = false; velo.hidden = false;
    document.querySelector('[data-avviso]')?.classList.remove('visibile');
    document.documentElement.style.overflow = 'hidden';
    pannello.querySelector<HTMLElement>('[data-chiudi-carrello]')?.focus();
  }
  function chiudi() {
    if (!pannello || !velo || pannello.hidden) return;
    pannello.hidden = true; velo.hidden = true;
    document.documentElement.style.overflow = '';
    bottone?.focus();
  }

  bottone?.addEventListener('click', apri);
  velo?.addEventListener('click', chiudi);
  pannello?.querySelectorAll('[data-chiudi-carrello]').forEach((b) => b.addEventListener('click', chiudi));
  document.addEventListener('keydown', (e) => {
    if (!pannello || pannello.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); chiudi(); }
    if (e.key === 'Tab') {
      const f = focusabili(); if (!f.length) return;
      const primo = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primo) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primo.focus(); }
    }
  });
  if (lista) collegaRighe(lista);

  // aggiunta dai pulsanti + delle tessere
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-aggiungi]');
    if (!link) return;
    e.preventDefault();
    const { slug, codice, nome } = link.dataset;
    if (!slug || !codice || !nome) return;
    salvaCarrello(aggiungi(leggiCarrello(), { slug, codice, nome }));
    avvisa(nome);
  });
  // aggiunta dalla scheda prodotto con la quantità scelta
  document.querySelectorAll<HTMLFormElement>('form[data-aggiungi-form]').forEach((form) => {
    const input = form.querySelector<HTMLInputElement>('input[name="quantita"]');
    form.querySelectorAll<HTMLButtonElement>('[data-passo-scheda]').forEach((b) => b.addEventListener('click', () => {
      if (!input) return;
      const n = Math.min(QUANTITA_MAX, Math.max(1, (Number(input.value) || 1) + Number(b.dataset.passoScheda)));
      input.value = String(n);
    }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const { slug, codice, nome } = form.dataset;
      if (!slug || !codice || !nome) return;
      const q = Math.min(QUANTITA_MAX, Math.max(1, Math.trunc(Number(input?.value) || 1)));
      if (input) input.value = String(q);
      salvaCarrello(aggiungi(leggiCarrello(), { slug, codice, nome }, q));
      avvisa(q > 1 ? `${q} × ${nome}` : nome);
    });
  });

  window.addEventListener(EVENTO, aggiorna);
  window.addEventListener('storage', (e) => { if (e.key === CHIAVE) aggiorna(); });
  aggiorna();
}
