import { faseDaAvanzamento, cercaComune } from '../lib/home/home';

const $ = <T extends Element>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== Il parco che nasce ===== */
const nasce = $<HTMLElement>('[data-nasce]');
const palco = $<HTMLElement>('[data-palco]');
if (nasce && palco) {
  const passi = $$<HTMLButtonElement>('[data-vai]', nasce);
  const testi = $$<HTMLElement>('[data-testo]', nasce);
  const barra = $<HTMLElement>('[data-barra]', nasce);
  const corsa = () => nasce.offsetHeight - innerHeight;
  if (!fermo) { palco.classList.add('pre'); requestAnimationFrame(() => setTimeout(() => palco.classList.remove('pre'), 120)); }
  const mostra = (f: number) => {
    palco.dataset.f = String(f);
    passi.forEach((b) => (Number(b.dataset.vai) === f ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    testi.forEach((t) => (t.inert = Number(t.dataset.testo) !== f));
  };
  const aggiorna = () => {
    const p = Math.min(1, Math.max(0, (scrollY - nasce.offsetTop) / corsa()));
    if (barra) barra.style.width = `${p * 100}%`;
    const f = faseDaAvanzamento(p);
    if (palco.dataset.f !== String(f) || !palco.dataset.pronto) { palco.dataset.pronto = '1'; mostra(f); }
  };
  addEventListener('scroll', aggiorna, { passive: true });
  addEventListener('resize', aggiorna);
  aggiorna();
  passi.forEach((b) => b.addEventListener('click', () =>
    scrollTo({ top: nasce.offsetTop + ((Number(b.dataset.vai) + 0.5) / 6) * corsa(), behavior: fermo ? 'auto' : 'smooth' })));
}

/* ===== Mappa ===== */
const mappa = $<HTMLElement>('[data-mappa]');
if (mappa) {
  const svg = $<SVGSVGElement>('svg', mappa)!;
  const punti = $$<SVGGElement>('.pt', mappa);
  const tip = $<HTMLElement>('[data-tip]', mappa)!;
  const cerca = $<HTMLInputElement>('[data-cerca]')!;
  const esito = $<HTMLElement>('[data-esito]')!;
  const chips = $$<HTMLButtonElement>('.chip[data-reg]');
  const voci = punti.map((g) => ({ n: g.dataset.n!, g }));
  const mostraTip = (g: SVGGElement) => {
    const r = g.getBoundingClientRect(), b = mappa.getBoundingClientRect();
    tip.replaceChildren();
    const nome = document.createElement('b'); nome.textContent = `${g.dataset.n} (${g.dataset.pr})`;
    tip.append(nome, g.dataset.servizi ?? '', document.createElement('br'), `${Number(g.dataset.pop).toLocaleString('it-IT')} abitanti`);
    tip.style.left = `${r.left + r.width / 2 - b.left}px`; tip.style.top = `${r.top - b.top}px`; tip.classList.add('on');
  };
  const nascondiTip = () => tip.classList.remove('on');
  punti.forEach((g) => {
    g.addEventListener('mouseenter', () => mostraTip(g)); g.addEventListener('focus', () => mostraTip(g));
    g.addEventListener('mouseleave', nascondiTip); g.addEventListener('blur', nascondiTip);
  });
  const accendi = (lista: SVGGElement[] | null) => {
    svg.classList.toggle('spento', !!lista);
    punti.forEach((g) => g.classList.toggle('acceso', !!lista && lista.includes(g)));
  };
  cerca.addEventListener('input', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
    const r = cercaComune(cerca.value, voci);
    esito.className = 'esito'; esito.replaceChildren(); nascondiTip();
    if (r.esito === 'vuoto') return accendi(null);
    accendi(r.comuni.map((c) => c.g));
    if (r.esito === 'trovato') { esito.textContent = `Sì! A ${r.comuni[0].n} seguiamo già i parchi.`; esito.classList.add('si'); mostraTip(r.comuni[0].g); }
    else if (r.esito === 'parziali') esito.textContent = r.comuni.length === 1 ? `Forse cerchi ${r.comuni[0].n}?` : `${r.comuni.length} comuni iniziano così…`;
    else { const a = document.createElement('a'); a.href = '/richiesta'; a.textContent = 'Parliamone'; esito.append('Non ancora: sarebbe il primo. ', a); esito.classList.add('no'); }
  });
  chips.forEach((c) => c.addEventListener('click', () => {
    const attiva = c.getAttribute('aria-pressed') !== 'true';
    chips.forEach((x) => x.setAttribute('aria-pressed', 'false')); cerca.value = ''; esito.replaceChildren();
    if (attiva) { c.setAttribute('aria-pressed', 'true'); accendi(punti.filter((p) => p.dataset.reg === c.dataset.reg)); } else accendi(null);
  }));
  if (!fermo) new IntersectionObserver((es, o) => es.forEach((e) => {
    if (!e.isIntersecting) return; o.disconnect();
    punti.forEach((g, i) => { g.querySelector('circle')!.style.animationDelay = `${i * 18}ms`; g.classList.add('nuovo'); });
  }), { threshold: 0.3 }).observe(mappa);
}

/* ===== Prima e dopo ===== */
const confronto = $<HTMLElement>('[data-confronto]');
if (confronto) {
  type Intervento = { testo: string; dopo: string; prima: string | null };
  const casi: Intervento[] = JSON.parse($('#dati-interventi')!.textContent!);
  const cursore = $<HTMLInputElement>('[data-cursore]', confronto)!;
  const dopo = $<HTMLImageElement>('[data-dopo]', confronto)!;
  const primaImg = $<HTMLImageElement>('[data-prima-img]', confronto)!;
  const vuota = $<HTMLElement>('[data-prima-vuota]', confronto)!;
  const sposta = () => confronto.style.setProperty('--x', `${cursore.value}%`);
  cursore.addEventListener('input', sposta);
  const bottoni = $$<HTMLButtonElement>('[data-caso]');
  bottoni.forEach((b) => b.addEventListener('click', () => {
    const c = casi[Number(b.dataset.caso)];
    bottoni.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    dopo.style.opacity = '1'; dopo.src = c.dopo;
    primaImg.hidden = !c.prima; vuota.hidden = !!c.prima; if (c.prima) primaImg.src = c.prima;
    $('[data-desc]')!.textContent = c.testo; cursore.value = '50'; sposta();
  }));
}

/* ===== Entrata delle sezioni ===== */
if (!fermo) {
  const el = $$<HTMLElement>('.casa-sez .griglia2 > *, .fam .testa, .fam .linee > li, .hexa2 .scatola');
  el.forEach((e) => e.classList.add('rv'));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }), { threshold: 0.12 });
  el.forEach((e) => io.observe(e));
}
