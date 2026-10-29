import { filtraProdotti, filtriAUrl, filtriDaUrl, type Filtri, type VoceIndice } from '../lib/catalogo/filtri';
import type { Linea, Materiale } from '../lib/catalogo/tipi';

const $ = <T extends Element>(sel: string) => document.querySelector<T>(sel);
const $$ = <T extends Element>(sel: string) => [...document.querySelectorAll<T>(sel)];

function numeroCampo(input: HTMLInputElement | null): number | undefined {
  if (!input || input.value.trim() === '') return undefined;
  const n = Number(input.value.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function contaAttivi(f: Filtri): number {
  return [f.sottocategoria, f.materiale, f.eta, f.caduta_max_cm, f.inclusivo].filter((v) => v !== undefined).length;
}

export async function avviaCatalogo(): Promise<void> {
  const tessere = new Map($$<HTMLElement>('[data-tessera]').map((el) => [el.dataset.slug!, el]));
  const conteggio = $<HTMLElement>('[data-conteggio]');
  const vuoto = $<HTMLElement>('[data-vuoto]');
  const griglia = $<HTMLElement>('[data-griglia]');
  const spazioL = $<HTMLInputElement>('[data-spazio-l]');
  const spazioW = $<HTMLInputElement>('[data-spazio-w]');
  const selSotto = $<HTMLSelectElement>('[data-sottocategoria]');
  const selEta = $<HTMLSelectElement>('[data-eta]');
  const selCaduta = $<HTMLSelectElement>('[data-caduta]');
  const inclusivo = $<HTMLInputElement>('[data-inclusivo]');
  const pannello = $<HTMLElement>('[data-pannello]');
  const velo = $<HTMLElement>('[data-velo]');
  const apri = $<HTMLButtonElement>('[data-apri-filtri]');
  const badge = $<HTMLElement>('[data-attivi]');
  const mostra = $<HTMLButtonElement>('[data-mostra]');
  const copertura = $<HTMLElement>('[data-copertura]');

  let filtri: Filtri = filtriDaUrl(new URLSearchParams(location.search));
  let voci: VoceIndice[] = [];

  try {
    const risposta = await fetch('/prodotti/indice.json');
    if (!risposta.ok) throw new Error(String(risposta.status));
    voci = await risposta.json();
  } catch {
    return; // senza indice il catalogo resta completo e consultabile
  }

  function sincronizzaControlli() {
    $$<HTMLButtonElement>('[data-linea]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.linea || undefined) === filtri.linea)));
    $$<HTMLButtonElement>('[data-materiale]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.materiale === filtri.materiale)));
    $$<HTMLOptGroupElement>('optgroup[data-linea]').forEach((g) => { g.hidden = !!filtri.linea && g.dataset.linea !== filtri.linea; });
    if (selSotto) selSotto.value = filtri.sottocategoria ?? '';
    if (selEta) selEta.value = filtri.eta !== undefined ? String(filtri.eta) : '';
    if (selCaduta) selCaduta.value = filtri.caduta_max_cm !== undefined ? String(filtri.caduta_max_cm) : '';
    if (inclusivo) inclusivo.checked = !!filtri.inclusivo;
    // i campi spazio si aggiornano solo da URL o azzeramento: non si tocca quello che l'utente sta scrivendo
    if (filtri.spazio && spazioL && spazioW && document.activeElement !== spazioL && document.activeElement !== spazioW) {
      spazioL.value = String(filtri.spazio.lunghezza_m);
      spazioW.value = String(filtri.spazio.larghezza_m);
    }
  }

  function applica(aggiornaUrl = true) {
    const visibili = new Set(filtraProdotti(voci, filtri).map((v) => v.slug));
    tessere.forEach((el, slug) => { el.hidden = !visibili.has(slug); });
    const n = visibili.size;
    const testo = n === 1 ? '1 prodotto' : `${n} prodotti`;
    if (conteggio) conteggio.textContent = testo;
    if (mostra) mostra.textContent = n === 0 ? 'Nessun prodotto' : `Mostra ${testo}`;
    if (vuoto) vuoto.hidden = n > 0;
    if (griglia) griglia.hidden = n === 0;
    if (copertura) {
      const conArea = voci.filter((v) => v.area_sicurezza).length;
      copertura.hidden = !filtri.spazio;
      copertura.textContent = `Area di sicurezza indicata per ${conArea} ${conArea === 1 ? 'prodotto' : 'prodotti'} su ${voci.length}: gli altri non compaiono finché la scheda non è completa.`;
    }
    const attivi = contaAttivi(filtri);
    if (badge) { badge.hidden = attivi === 0; badge.textContent = String(attivi); }
    sincronizzaControlli();
    if (aggiornaUrl) {
      const qs = filtriAUrl(filtri).toString();
      history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : ''));
    }
  }

  function imposta(parziale: Partial<Filtri>) {
    filtri = { ...filtri, ...parziale };
    (Object.keys(filtri) as (keyof Filtri)[]).forEach((k) => filtri[k] === undefined && delete filtri[k]);
    applica();
  }

  $$<HTMLButtonElement>('[data-linea]').forEach((b) => b.addEventListener('click', () => {
    const linea = (b.dataset.linea || undefined) as Linea | undefined;
    const sotto = filtri.sottocategoria && linea && voci.some((v) => v.linea === linea && v.sottocategoria === filtri.sottocategoria) ? filtri.sottocategoria : undefined;
    imposta({ linea, sottocategoria: sotto });
  }));
  $$<HTMLButtonElement>('[data-materiale]').forEach((b) => b.addEventListener('click', () => {
    const m = b.dataset.materiale as Materiale;
    imposta({ materiale: filtri.materiale === m ? undefined : m });
  }));
  selSotto?.addEventListener('change', () => imposta({ sottocategoria: selSotto.value || undefined }));
  selEta?.addEventListener('change', () => imposta({ eta: selEta.value ? Number(selEta.value) : undefined }));
  selCaduta?.addEventListener('change', () => imposta({ caduta_max_cm: selCaduta.value ? Number(selCaduta.value) : undefined }));
  inclusivo?.addEventListener('change', () => imposta({ inclusivo: inclusivo.checked || undefined }));

  const aggiornaSpazio = () => {
    const l = numeroCampo(spazioL), w = numeroCampo(spazioW);
    imposta({ spazio: l && w ? { lunghezza_m: l, larghezza_m: w } : undefined });
  };
  spazioL?.addEventListener('input', aggiornaSpazio);
  spazioW?.addEventListener('input', aggiornaSpazio);

  $$<HTMLButtonElement>('[data-azzera]').forEach((b) => b.addEventListener('click', () => {
    filtri = {};
    if (spazioL) spazioL.value = '';
    if (spazioW) spazioW.value = '';
    applica();
  }));

  function apriPannello(aperto: boolean) {
    pannello?.classList.toggle('aperto', aperto);
    if (velo) velo.hidden = !aperto;
    apri?.setAttribute('aria-expanded', String(aperto));
    if (aperto) pannello?.querySelector<HTMLElement>('button, select, input')?.focus();
    else apri?.focus();
  }
  apri?.addEventListener('click', () => apriPannello(true));
  velo?.addEventListener('click', () => apriPannello(false));
  $$<HTMLButtonElement>('[data-chiudi-filtri]').forEach((b) => b.addEventListener('click', () => apriPannello(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pannello?.classList.contains('aperto')) apriPannello(false);
  });

  applica(false);
}
