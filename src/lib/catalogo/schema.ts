import { z } from 'astro/zod';
import { LINEE, MATERIALI } from './tipi';

const misure = z.object({
  lunghezza_cm: z.number().positive(),
  larghezza_cm: z.number().positive(),
  altezza_cm: z.number().positive().optional(),
}).strict();

export const prodottoSchema = z.object({
  codice: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nome: z.string().min(1),
  linea: z.enum(LINEE),
  sottocategoria: z.string().min(1),
  materiale: z.enum(MATERIALI).optional(),
  eta_min: z.number().int().min(0).optional(),
  eta_max: z.number().int().min(0).optional(),
  altezza_caduta_cm: z.number().min(0).optional(),
  ingombro: misure.optional(),
  area_sicurezza: misure.optional(),
  utenti_max: z.number().int().positive().optional(),
  inclusivo: z.boolean().default(false),
  descrizione: z.string().optional(),
  foto_render: z.array(z.string()).default([]),
  foto_reali: z.array(z.string()).default([]),
  pdf_scheda: z.string().optional(),
  pdf_certificato: z.string().optional(),
  pdf_istruzioni: z.string().optional(),
  attivo: z.boolean().default(true),
}).strict();

export const impostazioniSchema = z.object({
  email_richieste: z.string().email(),
}).passthrough();
