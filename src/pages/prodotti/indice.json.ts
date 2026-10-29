import type { APIRoute } from 'astro';
import { prodottiAttivi } from '../../lib/catalogo/carica';
import { versoVoce } from '../../lib/catalogo/filtri';

export const GET: APIRoute = async () => {
  const voci = (await prodottiAttivi()).map(versoVoce);
  return new Response(JSON.stringify(voci), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
