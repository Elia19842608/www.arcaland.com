import { LINEE, MATERIALI, type Linea, type Materiale, type Misure, type Prodotto } from './tipi';

export interface VoceIndice {
  slug: string; codice: string; nome: string; linea: Linea; sottocategoria: string;
  materiale?: Materiale; eta_min?: number; eta_max?: number; altezza_caduta_cm?: number;
  area_sicurezza?: Misure; inclusivo: boolean; foto?: string; foto_reale?: string;
}

export interface Spazio { lunghezza_m: number; larghezza_m: number }

export interface Filtri {
  linea?: Linea; sottocategoria?: string; materiale?: Materiale; eta?: number;
  caduta_max_cm?: number; inclusivo?: boolean; spazio?: Spazio;
}

function senzaVuoti<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

export function versoVoce(p: Prodotto): VoceIndice {
  const foto = p.foto_render[0] ?? p.foto_reali[0];
  const foto_reale = p.foto_render.length ? p.foto_reali[0] : p.foto_reali[1];
  return senzaVuoti({
    slug: p.slug, codice: p.codice, nome: p.nome, linea: p.linea, sottocategoria: p.sottocategoria,
    materiale: p.materiale, eta_min: p.eta_min, eta_max: p.eta_max, altezza_caduta_cm: p.altezza_caduta_cm,
    area_sicurezza: p.area_sicurezza ? { lunghezza_cm: p.area_sicurezza.lunghezza_cm, larghezza_cm: p.area_sicurezza.larghezza_cm } : undefined,
    inclusivo: p.inclusivo, foto, foto_reale,
  });
}

export function entraNelloSpazio(area: Misure, spazio: Spazio): boolean {
  const a = area.lunghezza_cm, b = area.larghezza_cm;
  const L = Math.round(spazio.lunghezza_m * 100), W = Math.round(spazio.larghezza_m * 100);
  return (a <= L && b <= W) || (a <= W && b <= L);
}

export function filtraProdotti(voci: VoceIndice[], f: Filtri): VoceIndice[] {
  return voci.filter((v) => {
    if (f.linea && v.linea !== f.linea) return false;
    if (f.sottocategoria && v.sottocategoria !== f.sottocategoria) return false;
    if (f.materiale && v.materiale !== f.materiale) return false;
    if (f.inclusivo && !v.inclusivo) return false;
    if (f.eta !== undefined) {
      if (v.eta_min === undefined || v.eta_max === undefined) return false;
      if (f.eta < v.eta_min || f.eta > v.eta_max) return false;
    }
    if (f.caduta_max_cm !== undefined) {
      if (v.altezza_caduta_cm === undefined || v.altezza_caduta_cm > f.caduta_max_cm) return false;
    }
    if (f.spazio) {
      if (!v.area_sicurezza || !entraNelloSpazio(v.area_sicurezza, f.spazio)) return false;
    }
    return true;
  });
}

function numero(s: string | null): number | undefined {
  if (s === null || s.trim() === '') return undefined;
  const n = Number(s.trim().replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

export function leggiSpazio(s: string | null): Spazio | undefined {
  if (!s) return undefined;
  const parti = s.toLowerCase().split(/[x×*]/);
  if (parti.length !== 2) return undefined;
  const [l, w] = parti.map(numero);
  if (l === undefined || w === undefined || l <= 0 || w <= 0) return undefined;
  return { lunghezza_m: l, larghezza_m: w };
}

export function filtriDaUrl(p: URLSearchParams): Filtri {
  const f: Filtri = {};
  const linea = p.get('linea');
  if (linea && (LINEE as readonly string[]).includes(linea)) f.linea = linea as Linea;
  const sotto = p.get('sottocategoria');
  if (sotto && sotto.trim()) f.sottocategoria = sotto.trim();
  const mat = p.get('materiale');
  if (mat && (MATERIALI as readonly string[]).includes(mat)) f.materiale = mat as Materiale;
  const eta = numero(p.get('eta'));
  if (eta !== undefined && eta >= 0 && eta <= 99) f.eta = eta;
  const caduta = numero(p.get('caduta'));
  if (caduta !== undefined && caduta > 0) f.caduta_max_cm = caduta;
  if (p.get('inclusivo') === '1') f.inclusivo = true;
  const spazio = leggiSpazio(p.get('spazio'));
  if (spazio) f.spazio = spazio;
  return f;
}

export function filtriAUrl(f: Filtri): URLSearchParams {
  const p = new URLSearchParams();
  if (f.linea) p.set('linea', f.linea);
  if (f.sottocategoria) p.set('sottocategoria', f.sottocategoria);
  if (f.materiale) p.set('materiale', f.materiale);
  if (f.eta !== undefined) p.set('eta', String(f.eta));
  if (f.caduta_max_cm !== undefined) p.set('caduta', String(f.caduta_max_cm));
  if (f.inclusivo) p.set('inclusivo', '1');
  if (f.spazio) p.set('spazio', `${f.spazio.lunghezza_m}x${f.spazio.larghezza_m}`);
  return p;
}
