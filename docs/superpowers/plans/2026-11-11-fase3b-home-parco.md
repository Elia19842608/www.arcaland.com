# Fase 3b — Home "Il parco che nasce"

Sostituisce la home "Tavola di progetto" (bocciata) con la bozza approvata da Elia il 10/11/2026 (`public/bozze/home.html`).

1. Logica pura con test unitari: `src/lib/home/home.ts` (fase dallo scorrimento, ricerca comune, raggio del punto).
2. Dati: `src/data/mappa-comuni.json` (Italia proiettata + 80 comuni da ArcaTask), `src/data/interventi.json`.
3. Componenti: `ParcoCheNasce`, `MappaComuni`, `PrimaDopo`, `Famiglie`, `Hexaplay`, `Chiusura`; stile in `src/styles/home.css`; script `src/scripts/home-client.ts`.
4. Telefono, riduci movimento, senza JavaScript.
5. Test e2e nuovi in `tests/e2e/home.spec.ts`; a11y con axe; rimozione di Racconto, disegni, Lavori, Linee, tavole-client.
6. Verifica completa (unit + e2e + build), screenshot, pubblicazione.

Da fare prima del go-live: foto del "prima", copie locali delle foto oggi lette da arcaland.com, conferma dell'elenco comuni.
