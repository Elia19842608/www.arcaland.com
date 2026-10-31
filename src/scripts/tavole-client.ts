const TITOLI = ['Il progetto', 'Il materiale', 'La posa', "L'ispezione", 'Nel tempo'];

export function avviaTavole(): void {
  const racconto = document.querySelector<HTMLElement>('[data-racconto]');
  if (!racconto) return;
  const pagine = [...racconto.querySelectorAll<HTMLElement>('[data-pagina]')];
  const ancore = [...racconto.querySelectorAll<HTMLElement>('[data-ancora]')];
  const voci = [...racconto.querySelectorAll<HTMLAnchorElement>('[data-indice]')];
  const titolo = racconto.querySelector<HTMLElement>('[data-cartiglio-titolo]');

  const desktop = matchMedia('(min-width: 900px)');
  const movimento = matchMedia('(prefers-reduced-motion: reduce)');
  let osservatore: IntersectionObserver | null = null;
  let attiva = 1;

  function attiva_(n: number) {
    attiva = n;
    pagine.forEach((p) => p.classList.toggle('attiva', Number(p.dataset.pagina) === n));
    voci.forEach((v) => (Number(v.dataset.indice) === n ? v.setAttribute('aria-current', 'step') : v.removeAttribute('aria-current')));
    if (titolo) titolo.textContent = `Tavola ${n} di 5 — ${TITOLI[n - 1]}`;
  }

  // la tavola attiva è quella la cui ancora attraversa il centro dello schermo
  function daScroll() {
    const centro = innerHeight / 2;
    let migliore = attiva;
    for (const a of ancore) {
      const r = a.getBoundingClientRect();
      if (r.top <= centro && r.bottom > centro) { migliore = Number(a.dataset.ancora); break; }
    }
    if (ancore[0] && ancore[0].getBoundingClientRect().top > centro) migliore = 1;
    if (migliore !== attiva) attiva_(migliore);
  }

  function configura() {
    const animato = desktop.matches && !movimento.matches;
    racconto!.classList.toggle('animato', animato);
    osservatore?.disconnect();
    if (animato) {
      osservatore = new IntersectionObserver(daScroll, { threshold: [0, 0.25, 0.5, 0.75, 1] });
      ancore.forEach((a) => osservatore!.observe(a));
      attiva_(attiva);
      daScroll();
    } else {
      pagine.forEach((p) => p.classList.add('attiva'));
    }
  }

  // nell'indice, in modalità animata, si scorre fino all'ancora della tavola
  voci.forEach((v) => v.addEventListener('click', (e) => {
    if (!racconto.classList.contains('animato')) return;
    e.preventDefault();
    const n = Number(v.dataset.indice);
    ancore[n - 1]?.scrollIntoView({ block: 'center', behavior: 'auto' });
    attiva_(n);
  }));

  // con la tastiera: un pulsante della prima tavola che riceve il focus riporta alla tavola 1
  pagine[0]?.addEventListener('focusin', () => {
    if (racconto.classList.contains('animato') && attiva !== 1) ancore[0]?.scrollIntoView({ block: 'center' });
  });
  addEventListener('scroll', () => { if (racconto.classList.contains('animato')) daScroll(); }, { passive: true });
  function daHash() {
    const m = /^#tavola-([1-5])$/.exec(location.hash);
    if (!m || !racconto!.classList.contains('animato')) return;
    const n = Number(m[1]);
    ancore[n - 1]?.scrollIntoView({ block: 'center' });
    attiva_(n);
  }
  addEventListener('hashchange', daHash);
  desktop.addEventListener('change', configura);
  movimento.addEventListener('change', configura);
  configura();
  daHash();
  // il browser applica l'ancora dell'indirizzo dopo il caricamento: si ripete il posizionamento subito dopo
  if (document.readyState === 'complete') requestAnimationFrame(daHash);
  else addEventListener('load', () => requestAnimationFrame(daHash), { once: true });
}
