# Fase 1 — Base del sito e catalogo: piano di implementazione

> **Per chi esegue:** SUB-SKILL RICHIESTA: superpowers:subagent-driven-development (consigliata) oppure superpowers:executing-plans per eseguire il piano task per task. I passi usano le caselle (`- [ ]`) per tenere traccia dell'avanzamento.

**Obiettivo:** un sito Astro online in anteprima su Netlify, con identità visiva "Luce", catalogo filtrabile dei circa 300 prodotti importati dal Listino, scheda prodotto con pianta dell'area di sicurezza, e pannello Sveltia per modificare i prodotti.

**Architettura:**
- Sito statico Astro; i prodotti sono file Markdown con frontmatter YAML in una content collection validata con Zod.
- La logica (filtri, "ci sta nello spazio", geometria della pianta, mappatura del Listino) vive in moduli TypeScript puri, testati con Vitest.
- Le pagine sono componenti Astro; i filtri del catalogo sono un piccolo script nel browser che legge un indice JSON generato al build.

**Stack:** Astro 5, TypeScript, Vitest, Playwright, Sveltia CMS, Netlify.

**Specifica:** `docs/superpowers/specs/2026-10-30-sito-arcaland-design.md`. In questa fase si implementano §3 (solo prodotti e struttura), §4, §6.1, §6.2, §8, §9 (solo Prodotti e Impostazioni) e §10 (solo prodotti).

**Fuori da questa fase** (piani successivi):
- carrello e form (Fase 2)
- home (Fase 3)
- mappa e realizzazioni (Fase 4)
- Hexaplay (Fase 5)
- servizi, news, redirect e messa online (Fase 6)

Il pulsante **+** e "Aggiungi alla richiesta" in questa fase sono visibili ma portano a `/richiesta`, una pagina segnaposto "In arrivo".

## Vincoli globali

- Lingua del sito: italiano. Testi in maiuscola solo a inizio frase, niente punti esclamativi nei testi di sistema.
- Palette: Oro `#E6AF0B`, Carta `#FBF8F2`, Inchiostro `#222018`, Terracotta `#C8613F`, Cielo `#9CC3D5`. L'oro solo come fondo con testo Inchiostro, mai come colore del testo su fondo chiaro.
- Font: niente Inter, Lato o font di sistema generici; la scelta si fa nel Task 2 con impeccable.
- Niente gradienti viola, niente card tutte uguali.
- WCAG 2.1 AA; ogni animazione rispetta `prefers-reduced-motion`.
- **Nessun prezzo**: non si importa, non si salva nei file, non si pubblica.
- Campi vuoti nascosti; non si mostra mai "N/D", "null" o "undefined".
- Prestazioni: Lighthouse mobile ≥ 90 in tutte le categorie, LCP < 2,5 s, CLS < 0,1.
- Repository GitHub: `Elia19842608/www.arcaland.com`. Hosting Netlify.

## Punti critici da presidiare

1. **Prodotti con dati mancanti** (senza area di sicurezza, età, foto o materiale): la scheda nasconde i campi vuoti; un filtro attivo su un campo esclude i prodotti senza quel dato, mentre i filtri non attivi non escludono nulla. Test nei Task 4 e 7.
2. **Spazio scritto in modo "umano"**: `7,5` con la virgola, vuoto, zero o negativo. La virgola si accetta; i valori non validi disattivano il filtro senza errori; il gioco può essere ruotato di 90°. Test nel Task 4.
3. **URL con parametri sporchi** (`?eta=abc&materiale=plastica`): i parametri non validi vengono ignorati e la pagina funziona. Test nel Task 4.
4. **Codici con punti e nomi duplicati** (`9.HP100.01`, due "ALTALENA DOPPIA"): lo slug si ricava dal codice, è unico e stabile. Test nel Task 5.
5. **Nessun risultato**: messaggio "Nessun prodotto con questi filtri" e pulsante "Azzera filtri". Test nel Task 6.

---

## Struttura dei file

```
sito-arcaland/
  astro.config.mjs, netlify.toml, package.json, tsconfig.json, vitest.config.ts, playwright.config.ts
  src/
    content.config.ts              schema Zod della collection "prodotti" e "impostazioni"
    content/prodotti/*.md          un file per prodotto (generato dal Task 5, poi gestito dal pannello)
    content/impostazioni/sito.yaml email richieste, testi principali
    lib/catalogo/tipi.ts           tipi condivisi
    lib/catalogo/filtri.ts         filtraProdotti, entraNelloSpazio, filtri <-> URL
    lib/catalogo/indice.ts         prodotto completo -> voce leggera per l'indice JSON
    lib/catalogo/pianta.ts         geometria della pianta dell'area di sicurezza
    lib/import/listino.ts          voce del Listino -> frontmatter del prodotto
    styles/tokens.css, styles/base.css
    layouts/Base.astro
    components/Header.astro, Footer.astro, ProdottoCard.astro, Filtri.astro, PiantaSicurezza.astro, Galleria.astro
    scripts/catalogo-client.ts     filtri nel browser
    pages/index.astro (segnaposto), pages/prodotti/index.astro, pages/prodotti/[slug].astro,
    pages/prodotti/indice.json.ts, pages/richiesta.astro (segnaposto)
  public/admin/index.html, public/admin/config.yml   Sveltia CMS
  public/media/prodotti/           foto e PDF
  scripts/importa-listino.ts       CLI: JSON del Listino -> file .md + report
  dati/listino-export.json         esportazione del Listino (senza prezzi)
  tests/unit/*.test.ts, tests/e2e/*.spec.ts
```

---

### Task 1: Scheletro del progetto

**File:**
- Crea: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `netlify.toml`, `.gitignore`, `src/pages/index.astro`
- Test: `tests/e2e/smoke.spec.ts`

**Interfacce prodotte:** comandi `npm run dev`, `npm run build`, `npm test` (Vitest), `npm run test:e2e` (Playwright sul build servito con `astro preview`).

- [ ] **Passo 1:** Crea il progetto Astro (template minimal, TypeScript strict) e installa `vitest`, `@playwright/test` e `zod` (incluso in Astro). Il browser di Playwright è già installato: non eseguire `playwright install`.
- [ ] **Passo 2: Test che fallisce** `tests/e2e/smoke.spec.ts`: la home risponde 200 e ha `<html lang="it">`.
- [ ] **Passo 3:** Esegui `npm run build && npm run test:e2e`. Atteso: FAIL perché manca `lang="it"`.
- [ ] **Passo 4:** Imposta `lang="it"` nella pagina e la configurazione `netlify.toml`: build `npm run build`, publish `dist`, Node 20.
- [ ] **Passo 5:** Esegui `npm run build && npm run test:e2e`. Atteso: PASS.
- [ ] **Passo 6:** Commit `chore: scheletro Astro con Vitest e Playwright`.

### Task 2: Identità visiva con impeccable

**File:**
- Crea: `src/styles/tokens.css`, `src/styles/base.css`, `src/layouts/Base.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `.impeccable.md` (contesto di design)
- Test: `tests/e2e/layout.spec.ts`

**Interfacce prodotte:**
- `Base.astro` con props `{ titolo: string; descrizione?: string }` e uno slot.
- Variabili CSS:
  - colori: `--oro --carta --inchiostro --terracotta --cielo`, più le loro varianti chiare e scure;
  - tipografia: `--font-titoli --font-testo`;
  - spazi: `--spazio-1..8`;
  - movimento: `--raggio --durata --curva`.

- [ ] **Passo 1:** Esegui la skill `impeccable` in modalità teach usando la §4 della specifica (pubblico: tecnici comunali e gestori di campeggi; tono: solido, solare, affidabile). Salva il contesto in `.impeccable.md`.
- [ ] **Passo 2:** Con impeccable `craft`:
  - scegli la coppia di font (titoli con personalità, testo molto leggibile anche nelle tabelle tecniche), da caricare in locale con `@fontsource`;
  - definisci i token in `tokens.css` e le basi in `base.css`.
  - Colori esattamente quelli dei Vincoli globali.
- [ ] **Passo 3: Test che fallisce** `layout.spec.ts`:
  - header con link Prodotti, Hexaplay, Servizi, Realizzazioni, Chi siamo, News e pulsante "Richiedi preventivo";
  - footer con i contatti;
  - un link "Salta al contenuto" che diventa visibile quando riceve il focus da tastiera;
  - menu mobile che si apre con un pulsante con `aria-expanded` a 375 px di larghezza.
- [ ] **Passo 4:** Esegui. Atteso: FAIL.
- [ ] **Passo 5:** Implementa `Base.astro`, `Header.astro` e `Footer.astro`. Il logo arriva da `https://arcaland.com/site/wp-content/uploads/2021/03/arcaland_logo-1-1024x236.png` (da scaricare in `public/brand/`; se il download dal container non riesce, chiedilo a Elia in SVG o PNG).
- [ ] **Passo 6:** Esegui. Atteso: PASS.
- [ ] **Passo 7:** Fai uno screenshot di header e footer a 1440 e 375 px; passa `critique` di impeccable e correggi.
- [ ] **Passo 8:** Commit `feat: identità visiva Luce e layout base`.

### Task 3: Schema dei prodotti

**File:**
- Crea: `src/content.config.ts`, `src/lib/catalogo/tipi.ts`, `tests/unit/fixtures/prodotti/*.md`
- Test: `tests/unit/schema.test.ts`

**Interfacce prodotte** (in `tipi.ts`):

```ts
type Linea = 'giochi' | 'arredo-urbano' | 'percorsi-sportivi';
type Materiale = 'legno' | 'acciaio' | 'misto';
interface Misure { lunghezza_cm: number; larghezza_cm: number; altezza_cm?: number }
interface Prodotto {
  codice: string; slug: string; nome: string; linea: Linea; sottocategoria: string;
  materiale?: Materiale; eta_min?: number; eta_max?: number; altezza_caduta_cm?: number;
  ingombro?: Misure; area_sicurezza?: Misure; utenti_max?: number; inclusivo: boolean;
  descrizione?: string; foto_render: string[]; foto_reali: string[];
  pdf_scheda?: string; pdf_certificato?: string; pdf_istruzioni?: string; attivo: boolean;
}
```

Lo schema Zod `prodottoSchema` in `content.config.ts` ha la stessa forma:
- `codice` obbligatorio;
- `inclusivo` vale `false` di default;
- `foto_render` e `foto_reali` valgono `[]` di default;
- `attivo` vale `true` di default;
- **nessun campo prezzo**: lo schema è `strict()`, quindi un campo `prezzo` fa fallire la validazione.

- [ ] **Passo 1: Test che fallisce** in `schema.test.ts`:
  - un prodotto completo è valido;
  - un prodotto minimo (solo codice, slug, nome, linea, sottocategoria) è valido e prende i default;
  - `materiale: 'plastica'` non è valido;
  - un prodotto con `prezzo: 100` non è valido.
- [ ] **Passo 2:** Esegui `npm test -- schema`. Atteso: FAIL.
- [ ] **Passo 3:** Implementa lo schema esportando `prodottoSchema` e la collection `prodotti` (loader glob su `src/content/prodotti/*.md`) più `impostazioni` (file `sito.yaml` con `email_richieste: string`).
- [ ] **Passo 4:** Esegui. Atteso: PASS.
- [ ] **Passo 5:** Commit `feat: schema dei prodotti`.

### Task 4: Logica dei filtri

**File:**
- Crea: `src/lib/catalogo/filtri.ts`, `src/lib/catalogo/indice.ts`
- Test: `tests/unit/filtri.test.ts`

**Interfacce:**
- Usa: `Prodotto`, `Linea`, `Materiale` dal Task 3.
- Produce:

```ts
interface VoceIndice { slug; codice; nome; linea; sottocategoria; materiale?; eta_min?; eta_max?;
  altezza_caduta_cm?; area_sicurezza?: Misure; inclusivo; foto?: string; foto_reale?: string }
interface Filtri { linea?: Linea; sottocategoria?: string; materiale?: Materiale; eta?: number;
  caduta_max_cm?: number; inclusivo?: boolean; spazio?: { lunghezza_m: number; larghezza_m: number } }
function versoVoce(p: Prodotto): VoceIndice
function entraNelloSpazio(area: Misure, spazio: { lunghezza_m: number; larghezza_m: number }): boolean
function filtraProdotti(voci: VoceIndice[], f: Filtri): VoceIndice[]
function filtriDaUrl(p: URLSearchParams): Filtri
function filtriAUrl(f: Filtri): URLSearchParams
```

Parametri URL: `linea`, `sottocategoria`, `materiale`, `eta`, `caduta`, `inclusivo=1`, `spazio=7.5x6`.

- [ ] **Passo 1: Test che fallisce** in `filtri.test.ts`:
  - `entraNelloSpazio({lunghezza_cm:700,larghezza_cm:500},{lunghezza_m:7,larghezza_m:5})` restituisce `true` (il bordo è compreso);
  - lo stesso con lo spazio `{5,7}` restituisce `true` (rotazione di 90°);
  - con `{6.9,5}` restituisce `false`.
  - `filtraProdotti` con `eta: 3` tiene i prodotti con `eta_min ≤ 3 ≤ eta_max` ed esclude quelli senza dati sull'età.
  - Con `{}` restituisce tutti i prodotti, compresi quelli con dati mancanti.
  - Con `spazio` esclude i prodotti senza `area_sicurezza`.
  - Con `caduta_max_cm: 150` tiene i prodotti con caduta ≤ 150.
  - I filtri si combinano in AND.
  - `filtriDaUrl(new URLSearchParams('spazio=7,5x6'))` restituisce `{spazio:{lunghezza_m:7.5,larghezza_m:6}}`.
  - Restituiscono `{}`: `spazio=0x6`, `spazio=-2x3`, `spazio=abc`, `eta=abc`, `materiale=plastica`, `linea=xyz`.
  - Andata e ritorno: `filtriDaUrl(filtriAUrl(f))` è uguale a `f` per un filtro completo.
  - `versoVoce` non contiene campi oltre a quelli di `VoceIndice` (in particolare nessun prezzo); `foto` è la prima `foto_render` oppure la prima `foto_reali`.
- [ ] **Passo 2:** Esegui `npm test -- filtri`. Atteso: FAIL.
- [ ] **Passo 3:** Implementa le funzioni. I numeri si leggono accettando la virgola come separatore decimale; ogni valore non valido viene scartato in silenzio.
- [ ] **Passo 4:** Esegui. Atteso: PASS.
- [ ] **Passo 5:** Commit `feat: logica dei filtri del catalogo`.

### Task 5: Importazione dal Listino

**File:**
- Crea: `src/lib/import/listino.ts`, `scripts/importa-listino.ts`, `dati/listino-export.json`
- Test: `tests/unit/listino.test.ts`

**Interfacce:**
- Usa: `Prodotto` dal Task 3.
- Produce:

```ts
interface VoceListino { codice: string; nome: string; descrizione?: string; macro_categoria: string; categoria: string; stato: string }
function slugDaCodice(codice: string): string        // '9.HP100.01' -> '9-hp100-01'
function mappaLinea(macro: string): Linea | null      // 'Giochi'->'giochi', 'Arredo'->'arredo-urbano', "Sport all'aperto"->'percorsi-sportivi'
function daListino(v: VoceListino): Prodotto | null   // null se la linea non è mappabile
```

CLI: `npx tsx scripts/importa-listino.ts dati/listino-export.json`
- scrive `src/content/prodotti/<slug>.md`;
- **non sovrascrive** i file esistenti (rispetta le modifiche fatte dal pannello);
- scrive `dati/report-schede-incomplete.csv` con le colonne `codice,nome,campi_mancanti`.

- [ ] **Passo 1:** Esporta il Listino con il connettore `Listino.cerca_prodotti`, macro categoria per macro categoria, `limite` 200 con paginazione per query. In `dati/listino-export.json` salva **solo** `codice, nome, descrizione, macro_categoria, categoria, stato`. Verifica che il file non contenga le stringhe `costo`, `prezzo`, `ricarico`.
- [ ] **Passo 2: Test che fallisce** in `listino.test.ts`:
  - `slugDaCodice('9.HP100.01')` restituisce `'9-hp100-01'`;
  - codici diversi danno slug diversi;
  - `mappaLinea('Giochi')` restituisce `'giochi'`;
  - `mappaLinea('Varie')` restituisce `null`;
  - `daListino` di HEXAPLAY TORRE 150 dà `nome` "Hexaplay torre 150" (prima lettera maiuscola, il resto minuscolo, sigle conservate), `sottocategoria` "Hexaplay", `attivo: true`;
  - con `stato:'disattivo'` dà `attivo:false`;
  - il risultato passa la validazione di `prodottoSchema`.
- [ ] **Passo 3:** Esegui. Atteso: FAIL.
- [ ] **Passo 4:** Implementa la mappatura e la CLI. Il report elenca i campi mancanti tra: materiale, età, altezza di caduta, ingombro, area di sicurezza, foto, scheda PDF, certificato.
- [ ] **Passo 5:** Esegui. Atteso: PASS.
- [ ] **Passo 6:** Esegui la CLI. Atteso:
  - numero di file `.md` uguale al numero di voci mappabili (circa 300);
  - il secondo lancio non modifica nulla (`git status` pulito);
  - `npm run build` passa.
- [ ] **Passo 7:** Commit `feat: importazione prodotti dal Listino` (file `.md` e report inclusi).

### Task 6: Pagina catalogo

**File:**
- Crea: `src/pages/prodotti/index.astro`, `src/pages/prodotti/indice.json.ts`, `src/components/ProdottoCard.astro`, `src/components/Filtri.astro`, `src/scripts/catalogo-client.ts`, `src/pages/richiesta.astro`
- Test: `tests/e2e/catalogo.spec.ts`

**Interfacce:**
- Usa: `versoVoce`, `filtraProdotti`, `filtriDaUrl`, `filtriAUrl` dal Task 4.
- Produce: `GET /prodotti/indice.json`, che restituisce `VoceIndice[]` dei soli prodotti attivi.

La pagina:
- è generata in HTML con tutte le tessere già presenti, così funziona anche senza JavaScript;
- nel browser lo script legge i filtri dall'URL, nasconde o mostra le tessere tramite `data-slug` e aggiorna l'URL con `history.replaceState`;
- schede Linea in alto, filtri a sinistra su desktop e in un pannello dal basso su mobile, campo "Ho uno spazio di __ × __ m";
- conteggio dei risultati in una regione `aria-live="polite"`.

La tessera mostra foto (al passaggio del mouse la foto reale, se c'è), nome, codice, etichette materiale/età/EN 1176 e un link **+** con `aria-label="Aggiungi <nome> alla richiesta"` verso `/richiesta`.

- [ ] **Passo 1: Test che fallisce** in `catalogo.spec.ts`, con dati di prova da `tests/unit/fixtures/prodotti` (variabile d'ambiente `CONTENUTI=fixture` letta in `content.config.ts`):
  - `/prodotti` mostra tutte le tessere della linea giochi;
  - cliccando "Acciaio" restano solo i prodotti in acciaio e l'URL contiene `materiale=acciaio`;
  - aprendo `/prodotti?spazio=7,5x6` restano solo i prodotti che ci stanno;
  - `/prodotti?eta=abc` mostra tutte le tessere senza errori in console;
  - con filtri senza risultati compaiono "Nessun prodotto con questi filtri" e un pulsante "Azzera filtri", che riporta tutte le tessere;
  - a 375 px il pannello dei filtri si apre e si chiude da tastiera.
- [ ] **Passo 2:** Esegui. Atteso: FAIL.
- [ ] **Passo 3:** Implementa la pagina, i componenti, lo script e `richiesta.astro` (segnaposto "La richiesta di preventivo online arriva a breve. Scrivici a" seguito dall'email presa dalle impostazioni).
- [ ] **Passo 4:** Esegui. Atteso: PASS.
- [ ] **Passo 5:** Commit `feat: catalogo prodotti filtrabile`.

### Task 7: Scheda prodotto e pianta dell'area di sicurezza

**File:**
- Crea: `src/lib/catalogo/pianta.ts`, `src/components/PiantaSicurezza.astro`, `src/components/Galleria.astro`, `src/pages/prodotti/[slug].astro`
- Test: `tests/unit/pianta.test.ts`, `tests/e2e/scheda.spec.ts`

**Interfacce:**
- Usa: `Prodotto` dal Task 3.
- Produce:

```ts
interface Pianta { viewBox: string; area: Rett; ingombro?: Rett; quote: { testo: string; x: number; y: number; verticale: boolean }[] }
interface Rett { x: number; y: number; w: number; h: number }
function calcolaPianta(area: Misure, ingombro?: Misure): Pianta
```

Unità SVG = cm. L'ingombro va centrato nell'area; le quote si scrivono in metri con la virgola (`"7,50 m"`); il margine per le quote è di 80 unità.

- [ ] **Passo 1: Test che fallisce** in `pianta.test.ts`:
  - per area 700×500 e ingombro 300×200: `area` vale `{x:80,y:80,w:700,h:500}` e `ingombro` vale `{x:280,y:230,w:300,h:200}`;
  - le quote contengono `"7,00 m"` e `"5,00 m"`;
  - `viewBox` vale `"0 0 860 660"`;
  - senza ingombro: `ingombro` è `undefined` e ci sono solo le quote dell'area.
- [ ] **Passo 2:** Esegui. Atteso: FAIL.
- [ ] **Passo 3:** Implementa `calcolaPianta` e `PiantaSicurezza.astro`:
  - SVG con l'area in Cielo chiaro e bordo tratteggiato, l'ingombro in Inchiostro al 15%;
  - `role="img"` e un `<title>` che descrive le misure.
- [ ] **Passo 4:** Esegui. Atteso: PASS.
- [ ] **Passo 5: Test che fallisce** in `scheda.spec.ts`:
  - la scheda di un prodotto completo mostra nome, codice, galleria con le etichette "Render" e "Foto reale", tabella dei dati tecnici, pianta e link ai PDF;
  - la scheda di un prodotto minimo **non** contiene il testo "N/D", "undefined" o "null", né le sezioni pianta e documenti;
  - "Aggiungi alla richiesta" porta a `/richiesta`;
  - per ogni prodotto c'è un `<title>` unico e un meta description;
  - i dati strutturati JSON-LD sono di tipo `Product`, senza `offers`.
- [ ] **Passo 6:** Esegui. Atteso: FAIL.
- [ ] **Passo 7:** Implementa `[slug].astro` con `getStaticPaths` sui prodotti attivi, `Galleria.astro` e la sezione "Prodotti simili" (stessa sottocategoria, massimo 4).
- [ ] **Passo 8:** Esegui. Atteso: PASS.
- [ ] **Passo 9:** Commit `feat: scheda prodotto con pianta area di sicurezza`.

### Task 8: Pannello di gestione Sveltia

**File:**
- Crea: `public/admin/index.html`, `public/admin/config.yml`, `src/content/impostazioni/sito.yaml`
- Test: `tests/unit/admin-config.test.ts`

**Interfacce:**
- Usa: i campi di `prodottoSchema` dal Task 3.
- Produce: il pannello su `/admin` con le collection "Prodotti" e "Impostazioni".

- [ ] **Passo 1: Test che fallisce** in `admin-config.test.ts`:
  - legge `config.yml` con `yaml`;
  - verifica che il backend sia `github` con repo `Elia19842608/www.arcaland.com` e branch `main`;
  - verifica che la collection `prodotti` punti a `src/content/prodotti`, con `media_folder: public/media/prodotti`;
  - verifica che **l'insieme dei nomi dei campi coincida** con le chiavi di `prodottoSchema` (così pannello e schema non divergono);
  - verifica che materiale e linea siano campi `select` con gli stessi valori di Zod;
  - verifica che non ci siano campi che contengono "prezzo".
- [ ] **Passo 2:** Esegui. Atteso: FAIL.
- [ ] **Passo 3:** Scrivi `index.html` (carica Sveltia CMS da unpkg con versione fissata) e `config.yml`:
  - etichette in italiano;
  - sezioni Prodotti e Impostazioni;
  - `slug: "{{fields.slug}}"`;
  - accesso con token personale GitHub, che è il metodo più semplice per pochi utenti; l'OAuth si valuta in Fase 6.
- [ ] **Passo 4:** Esegui. Atteso: PASS.
- [ ] **Passo 5:** Verifica manuale: `npm run dev`, apri `/admin` e controlla che il pannello si carichi senza errori in console. Fallo con Playwright e salva uno screenshot.
- [ ] **Passo 6:** Commit `feat: pannello di gestione Sveltia`.

### Task 9: Foto e PDF dal sito attuale

**File:**
- Crea: `scripts/raccogli-media.ts`, `dati/mappa-media.csv`
- Test: `tests/unit/mappa-media.test.ts`

Il sito attuale è protetto da reCAPTCHA e il container può non raggiungerlo. Per questo il task è in due parti:
1. lo script lavora su una cartella locale di foto e PDF che fornisce Elia (per esempio un export della libreria media di WordPress o le foto scontornate dal server);
2. abbina i file ai prodotti tramite il codice articolo nel nome del file.

**Interfaccia:** `function abbinaFile(nomeFile: string, codici: string[]): { codice: string; tipo: 'render'|'reale'|'scheda'|'certificato'|'istruzioni' } | null`

Riconoscimento:
- codice nel nome, normalizzato senza punti e senza differenza tra maiuscole e minuscole;
- tipo dalla parola nel nome (`render`, `reale`/`parco`, `scheda`, `cert`, `istruz`);
- altrimenti un `.png` conta come render, un `.jpg` come foto reale, un `.pdf` come scheda.

- [ ] **Passo 1: Test che fallisce**:
  - `abbinaFile('9HP150-00_render.png', codici)` restituisce `{codice:'9.HP150.00', tipo:'render'}`;
  - `abbinaFile('foto-parco-9.HP150.00.jpg', …)` restituisce `tipo:'reale'`;
  - `abbinaFile('logo.png', …)` restituisce `null`;
  - se un nome contiene due codici, vince quello più lungo.
- [ ] **Passo 2:** Esegui. Atteso: FAIL.
- [ ] **Passo 3:** Implementa `abbinaFile` e la CLI `npx tsx scripts/raccogli-media.ts <cartella>`, che:
  - copia i file in `public/media/prodotti/<slug>/`;
  - aggiorna il frontmatter **solo** aggiungendo, senza mai cancellare;
  - scrive `dati/mappa-media.csv` con abbinati e non abbinati.
- [ ] **Passo 4:** Esegui. Atteso: PASS.
- [ ] **Passo 5:** Se Elia ha già fornito la cartella, esegui la CLI e verifica a campione 10 schede nel browser. Se non l'ha fornita, lascia lo script pronto e segnalalo nel resoconto finale.
- [ ] **Passo 6:** Commit `feat: abbinamento foto e PDF ai prodotti`.

### Task 10: Verifica finale e anteprima online

**File:**
- Modifica: i file che emergono da audit e critique
- Test: `tests/e2e/a11y.spec.ts`

- [ ] **Passo 1:** Aggiungi `@axe-core/playwright`. Test `a11y.spec.ts`: zero violazioni serious o critical su `/`, `/prodotti` e su una scheda completa.
- [ ] **Passo 2:** Esegui. Correggi finché il test passa.
- [ ] **Passo 3:** Esegui Lighthouse mobile (`npx lighthouse` con Chromium preinstallato) su `/prodotti` e su una scheda. Atteso: ≥ 90 in tutte e quattro le categorie, LCP < 2,5 s, CLS < 0,1. Correggi finché i valori non sono raggiunti.
- [ ] **Passo 4:** Passa impeccable `audit`, poi `critique`, poi `polish` sulle tre pagine e applica le correzioni. Riesegui tutti i test (`npm test && npm run test:e2e`).
- [ ] **Passo 5:** Crea il repository `Elia19842608/www.arcaland.com` (oppure chiedi a Elia di crearlo), fai il push e collega Netlify per l'anteprima. Se il collegamento richiede azioni nel suo account, prepara le istruzioni passo per passo.
- [ ] **Passo 6:** Apri l'URL di anteprima con Playwright e verifica che `/prodotti`, una scheda e `/admin` rispondano. Salva gli screenshot a 1440 e 375 px.
- [ ] **Passo 7:** Commit `chore: verifica finale fase 1` e invia a Elia l'URL di anteprima, gli screenshot e il report delle schede incomplete.
