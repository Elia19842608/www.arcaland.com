---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

## Scope
Home page (`src/pages/index.astro`). Modalità: Persuade. Pubblico: tecnici comunali (primari) e gestori di campeggi. Azione: entrare nel catalogo o chiedere un preventivo.

## Direction contract
THESIS: la home è un foglio tecnico di progetto, con cornice e cartiglio, che si sfoglia in cinque tavole (progetto, produzione, posa, ispezione, nel tempo); rifiuta la categoria "foto di bambini felici + tre card".
OWN-WORLD: palette Luce di DESIGN.md; il foglio è il supporto della pagina (cornice doppia in Inchiostro, cartiglio in basso a destra, quote in metri, aree tratteggiate Cielo, pezzi in Inchiostro al 15%, un solo elemento Oro per tavola); titoli Archivo stretti, testo Atkinson.
STORY: il tecnico capisce che Arcaland segue il parco per tutta la vita, non solo la vendita; si fida perché vede il metodo (aree, norme, ispezioni) e dati reali; entra nel catalogo o chiede un preventivo.
FIRST VIEWPORT: foglio a tutta larghezza sotto l'header; a sinistra titolo 76px "Aree gioco che durano.", sottotitolo, due pulsanti (oro: Esplora i prodotti; bordo: Richiedi un preventivo); a destra planimetria quotata 20×16 m con tre aree di sicurezza tratteggiate; in basso a sinistra l'indice delle 5 tavole, in basso a destra il cartiglio "Tavola 1 di 5 — Il progetto".
FORM: Tavola di progetto, scelta di Elia tra tre composizioni (lead del sorteggio); seed: seed:6e373f8064e016ea. Interazione firma: scorrendo, il foglio resta fermo e le tavole si sfogliano; il disegno di ogni tavola si traccia (stroke) e il cartiglio cambia numero e titolo. Grammatica del movimento: tracciamento di linee 900ms ease-out, cambio tavola in dissolvenza 300ms, nulla con "riduci movimento".
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
