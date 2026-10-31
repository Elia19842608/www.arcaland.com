# Fase 2 — Carrello preventivo e richiesta: piano di implementazione

> **Per chi esegue:** SUB-SKILL RICHIESTA: superpowers:executing-plans (esecuzione in sessione, scelta di Elia). I passi usano le caselle (`- [ ]`).

**Obiettivo:** il visitatore aggiunge prodotti con le quantità a un carrello senza prezzi, lo rivede in un pannello laterale e invia una richiesta di preventivo che arriva via mail ad Arcaland con codici e quantità. Inoltre le foto caricate in blocco vengono ottimizzate in automatico.

**Architettura:**
- Logica del carrello in moduli TypeScript puri (testati con Vitest): operazioni, lettura e scrittura sicura nel browser, testo della richiesta.
- Interfaccia: icona con contatore nell'header, pannello laterale, pulsanti "aggiungi" su tessere e scheda, pagina `/richiesta` con elenco modificabile e form.
- Invio con Netlify Forms (form statico rilevato al build, invio via `fetch`). La notifica interna è quella nativa di Netlify, da attivare una volta nel pannello Netlify.

**Stack:** Astro 5, TypeScript, Vitest, Playwright, Netlify Forms, `sharp` (già incluso in Astro).

**Specifica:** `docs/superpowers/specs/2026-10-30-sito-arcaland-design.md`, §6.3 e §10 (foto). Valgono `DESIGN.md` e `PRODUCT.md`.

## Vincoli globali

- **Nessun prezzo**, da nessuna parte.
- Quantità intere da 1 a 999.
- Il carrello resta salvato nel browser (`localStorage`). Se lo spazio non è disponibile, funziona fino alla chiusura della pagina, senza errori.
- Senza JavaScript il pulsante **+** porta comunque a `/richiesta?aggiungi=<slug>`, che aggiunge il prodotto.
- Form, campi obbligatori: tipo cliente (Ente pubblico / Attività privata), nome, ente o azienda, email, telefono, comune dell'area.
- Form, campi facoltativi: note e un allegato. L'allegato è limitato a **8 MB**, il massimo di Netlify Forms (la specifica diceva 10 MB).
- Protezione anti-spam: campo nascosto `bot-field` (honeypot di Netlify).
- Testi in italiano, WCAG 2.1 AA, rispetto di `prefers-reduced-motion`. Componenti nel sistema "Luce" di `DESIGN.md`.

## Punti critici da presidiare

1. **Dati del carrello corrotti o di una versione vecchia nel browser** (JSON rotto, quantità negative o non numeriche, prodotti non più a catalogo): si leggono le righe valide, si scartano le altre e il sito non va in errore. Test nel Task 1.
2. **Due schede del browser aperte**: un'aggiunta in una si vede anche nell'altra (evento `storage`). Test nel Task 3.
3. **Invio fallito** (rete assente, errore di Netlify): messaggio chiaro, il carrello e i campi compilati restano, c'è il pulsante "Riprova". Test nel Task 5.
4. **Richiesta inviata con il carrello vuoto**: è permessa, perché si può chiedere un progetto su misura scrivendo solo nelle note. Le note diventano però obbligatorie se il carrello è vuoto. Test nel Task 5.
5. **Allegato oltre 8 MB o in un formato non ammesso**: viene bloccato prima dell'invio, con un messaggio accanto al campo. Formati ammessi: PDF, JPG, PNG, DWG, ZIP. Test nel Task 5.

---

## Struttura dei file

```
src/lib/carrello/carrello.ts     operazioni pure sul carrello
src/lib/carrello/archivio.ts     lettura e scrittura sicura in localStorage, evento di aggiornamento
src/lib/carrello/richiesta.ts    testo della richiesta per la mail
src/scripts/carrello-client.ts   collega pulsanti, contatore e pannello
src/components/CarrelloPannello.astro, src/components/Avviso.astro
src/components/Header.astro      (modifica: icona carrello con contatore)
src/components/ProdottoCard.astro, src/pages/prodotti/[slug].astro   (modifica: pulsanti aggiungi)
src/pages/richiesta.astro        (riscritta), src/pages/richiesta/inviata.astro
src/lib/import/immagini.ts, scripts/raccogli-media.ts   (modifica: ottimizzazione)
tests/unit/carrello.test.ts, richiesta.test.ts, immagini.test.ts
tests/e2e/carrello.spec.ts, richiesta.spec.ts
```

---

### Task 1: Logica del carrello

**File:** crea `src/lib/carrello/carrello.ts`, `src/lib/carrello/archivio.ts`; test `tests/unit/carrello.test.ts`

**Interfacce prodotte:**

```ts
interface RigaCarrello { slug: string; codice: string; nome: string; quantita: number }
type Carrello = RigaCarrello[]
function aggiungi(c: Carrello, voce: Omit<RigaCarrello, 'quantita'>, quantita?: number): Carrello // somma se già presente, massimo 999
function impostaQuantita(c: Carrello, slug: string, quantita: number): Carrello      // 0 o meno rimuove la riga; oltre 999 diventa 999
function rimuovi(c: Carrello, slug: string): Carrello
function totaleArticoli(c: Carrello): number                                         // somma delle quantità
function daJson(testo: string | null): Carrello                                       // tollerante: scarta le righe non valide
const CHIAVE = 'arcaland-richiesta-v1'
function leggiCarrello(): Carrello; function salvaCarrello(c: Carrello): void          // try/catch, memoria di riserva
const EVENTO = 'carrello:aggiornato'                                                   // CustomEvent<Carrello> su window
```

- [ ] **Passo 1: Test che fallisce.**
  - `aggiungi` di una nuova voce ha quantità 1; aggiungendo di nuovo la stessa la quantità diventa 2; `aggiungi(..., 5)` su una riga a 998 dà 999.
  - `impostaQuantita(c, slug, 0)` rimuove la riga; con 1500 la porta a 999; con 2,7 la porta a 2.
  - `totaleArticoli` di [2, 3] dà 5.
  - `daJson('rotto')`, `daJson(null)` e `daJson('{"a":1}')` danno `[]`.
  - `daJson` di un array con una riga valida e righe non valide (quantità -1, "x", slug mancante) restituisce solo la riga valida.
  - Le funzioni non modificano il carrello che ricevono (immutabilità).
  - `leggiCarrello` e `salvaCarrello` su un `localStorage` finto che lancia eccezioni non lanciano a loro volta, e mantengono il dato in memoria.
- [ ] **Passo 2:** Esegui `npm test -- carrello`. Atteso: FAIL.
- [ ] **Passo 3:** Implementa.
- [ ] **Passo 4:** Esegui. Atteso: PASS.
- [ ] **Passo 5:** Commit `feat: logica del carrello preventivo`.

### Task 2: Testo della richiesta

**File:** crea `src/lib/carrello/richiesta.ts`; test `tests/unit/richiesta.test.ts`

**Interfaccia:** `function testoRichiesta(c: Carrello): string`. Restituisce una riga per prodotto nel formato `"<quantità> × <codice> — <nome>"`, poi una riga vuota e `"Totale: <n> articoli"` (`"1 articolo"` al singolare). Con il carrello vuoto restituisce `"Nessun prodotto selezionato: richiesta di progetto su misura."`.

- [ ] **Passo 1: Test che fallisce** con i tre casi: carrello con due righe, una sola riga con quantità 1 (singolare) e carrello vuoto.
- [ ] **Passo 2:** Esegui. Atteso: FAIL.
- [ ] **Passo 3:** Implementa.
- [ ] **Passo 4:** Esegui. Atteso: PASS.
- [ ] **Passo 5:** Commit `feat: testo della richiesta di preventivo`.

### Task 3: Pulsanti, contatore e pannello del carrello

**File:**
- Crea: `src/components/CarrelloPannello.astro`, `src/components/Avviso.astro`, `src/scripts/carrello-client.ts`
- Modifica: `Header.astro`, `ProdottoCard.astro`, `[slug].astro`, `Base.astro`
- Test: `tests/e2e/carrello.spec.ts`

**Comportamento:**
- **Pulsante + sulle tessere**: resta un link `<a href="/richiesta?aggiungi=<slug>" data-aggiungi data-slug data-codice data-nome>`. Con JavaScript attivo il clic viene intercettato: il prodotto si aggiunge, compare un avviso e il contatore si aggiorna.
- **Scheda prodotto**: campo quantità (numero da 1 a 999, con pulsanti − e +) e il pulsante "Aggiungi alla richiesta", che aggiunge la quantità scelta.
- **Header**: pulsante "Richiesta" con icona e contatore (`aria-label` "Richiesta di preventivo, N articoli"). Apre il pannello.
- **Pannello laterale** (`role="dialog"`, `aria-modal="true"`, titolo "La tua richiesta"):
  - le righe hanno nome, codice, quantità modificabile e "Rimuovi";
  - pulsanti "Continua a sfogliare" e "Completa la richiesta" (che porta a `/richiesta`);
  - stato vuoto con "La richiesta è vuota" e il link al catalogo;
  - Esc e clic sul velo chiudono il pannello; il focus resta dentro mentre è aperto e torna al pulsante dell'header alla chiusura.
- **Avviso** in `aria-live="polite"`: "Aggiunto: <nome>" con il link "Vedi la richiesta", scompare dopo 4 secondi.
- **Più schede del browser**: l'evento `storage` aggiorna contatore e pannello.

- [ ] **Passo 1: Test che fallisce** in `carrello.spec.ts`, sui prodotti di prova:
  - un clic sul + di "Panchina con schienale" porta il contatore a 1, mostra "Aggiunto: Panchina con schienale" e lascia l'URL invariato;
  - nella scheda di Hexaplay torre 150, quantità 3 e Aggiungi portano il contatore a 3;
  - nel pannello, cambiando la quantità a 5 il contatore va a 5; con Rimuovi compare "La richiesta è vuota";
  - il pannello si chiude con Esc e il focus torna al pulsante dell'header;
  - ricaricando la pagina il contatore resta;
  - con due pagine nello stesso contesto, un'aggiunta nella prima aggiorna il contatore della seconda;
  - con JavaScript disattivato (`javaScriptEnabled: false`), il + porta a `/richiesta?aggiungi=5-pa100-00`.
- [ ] **Passo 2:** Esegui. Atteso: FAIL.
- [ ] **Passo 3:** Implementa.
- [ ] **Passo 4:** Esegui tutta la suite e2e. Atteso: PASS. Correggi i test della Fase 1 che si aspettavano `href="/richiesta"` con un ruling nel registro.
- [ ] **Passo 5:** Screenshot a 1440 e 375 px con il pannello aperto, `critique` di impeccable, correzioni.
- [ ] **Passo 6:** Commit `feat: carrello preventivo con pannello laterale`.

### Task 4: Ottimizzazione delle foto

**File:** crea `src/lib/import/immagini.ts`; modifica `scripts/raccogli-media.ts`; test `tests/unit/immagini.test.ts`

**Interfaccia:** `async function ottimizzaImmagine(ingresso: string, uscita: string): Promise<{ larghezza: number; altezza: number; byte: number }>`. Converte in WebP qualità 80, lato lungo al massimo 1600 px (senza ingrandire), mantiene la trasparenza e ruota secondo l'EXIF. Gli SVG si copiano così come sono.

- [ ] **Passo 1: Test che fallisce:**
  - un JPG generato con `sharp` da 4000×3000 diventa un WebP da 1600×1200, più leggero dell'originale;
  - un PNG trasparente 800×800 resta 800×800 e conserva il canale alfa;
  - un SVG viene copiato identico.
- [ ] **Passo 2:** Esegui. Atteso: FAIL.
- [ ] **Passo 3:** Implementa. In `raccogli-media.ts`, le immagini raster passano da `ottimizzaImmagine` e il file salvato prende l'estensione `.webp`.
- [ ] **Passo 4:** Esegui. Atteso: PASS. Rilancia lo script su una cartella di prova con un JPG grande e verifica peso e percorso nella scheda.
- [ ] **Passo 5:** Commit `feat: ottimizzazione automatica delle foto importate`.

### Task 5: Pagina richiesta e invio

**File:** riscrivi `src/pages/richiesta.astro`; crea `src/pages/richiesta/inviata.astro`, `src/scripts/richiesta-client.ts`; test `tests/e2e/richiesta.spec.ts`

**Struttura della pagina** (due colonne su desktop, una su telefono):
- **A sinistra, "Prodotti selezionati"**: righe modificabili (stesse regole del pannello) e il link "Aggiungi altri prodotti". Con il carrello vuoto, testo che invita a descrivere il progetto nelle note.
- **A destra, il form** `name="richiesta-preventivo"`, `method="POST"`, `data-netlify="true"`, `netlify-honeypot="bot-field"`, `enctype="multipart/form-data"`. Campi:
  - `tipo_cliente`: radio "Ente pubblico" / "Attività privata";
  - `nome`, `ente`, `email` (type=email), `telefono` (type=tel), `comune`;
  - `note` (textarea), `allegato` (file);
  - campi nascosti `prodotti` (il testo del Task 2, compilato al momento dell'invio) e `form-name`.
- `?aggiungi=<slug>` all'apertura aggiunge il prodotto (risolto dall'indice `/prodotti/indice.json`) e pulisce l'URL.
- **Invio**:
  - validazione nel browser, con l'errore sotto ogni campo e il focus sul primo campo errato;
  - `fetch('/', { method: 'POST', body: FormData })`;
  - se va bene: carrello svuotato e reindirizzamento a `/richiesta/inviata`;
  - se fallisce: avviso "Non siamo riusciti a inviare la richiesta. Controlla la connessione e riprova." con il pulsante "Riprova", senza perdere nulla.
- **Pagina `/richiesta/inviata`**: "Richiesta inviata", tempi di risposta indicativi (testo da confermare con Elia: "ti rispondiamo entro 2 giorni lavorativi") e il link al catalogo.

- [ ] **Passo 1: Test che fallisce** in `richiesta.spec.ts`. L'invio usa `page.route('/', …)` per simulare Netlify (200 o 500).
  - L'HTML compilato di `/richiesta` contiene `data-netlify="true"`, `name="richiesta-preventivo"` e il campo `bot-field`.
  - `/richiesta?aggiungi=5-pa100-00` mostra la panchina e l'URL torna `/richiesta`.
  - Inviando con i campi obbligatori vuoti compaiono gli errori e il focus va su "Nome".
  - Con il carrello vuoto e le note vuote compare l'errore sulle note.
  - Un allegato da 9 MB è rifiutato con "Il file supera 8 MB"; un `.exe` è rifiutato.
  - Con l'invio a 200: la richiesta intercettata contiene `form-name=richiesta-preventivo` e il campo `prodotti` con "2 × 9.HP150.00"; si arriva a `/richiesta/inviata` e il contatore è a 0.
  - Con l'invio a 500: compare l'avviso, il campo nome conserva il valore e il carrello resta.
- [ ] **Passo 2:** Esegui. Atteso: FAIL.
- [ ] **Passo 3:** Implementa.
- [ ] **Passo 4:** Esegui tutta la suite (unit, e2e, accessibilità) con `/richiesta` e `/richiesta/inviata` aggiunte ad `a11y.spec.ts`. Atteso: PASS.
- [ ] **Passo 5:** `critique` e `polish` di impeccable su pagina richiesta e pannello; screenshot a 1440 e 375 px.
- [ ] **Passo 6:** Commit `feat: pagina richiesta di preventivo con invio Netlify Forms`.

### Task 6: Pubblicazione e attivazione dei moduli

- [ ] **Passo 1:** Abilita Forms sul progetto `arcaland-anteprima` con il connettore Netlify (`update-forms` → `enabled`).
- [ ] **Passo 2:** Push su `main` (deploy automatico) e attesa del deploy.
- [ ] **Passo 3:** Verifica online con WebFetch: `/richiesta` risponde e il form `richiesta-preventivo` risulta registrato (`get-forms-for-project`).
- [ ] **Passo 4:** Prepara per Elia i passaggi per attivare la notifica mail (Netlify → Forms → Form notifications → Email → `elia.ferretti@zennarolegnami.com`) e invia una richiesta di prova insieme a lui.
- [ ] **Passo 5:** Revisione finale dell'intero ramo, registro dei ruling e resoconto.

## Fuori da questa fase

- **Mail di conferma automatica a chi invia.** Richiede un servizio di invio mail (per esempio Resend) con il dominio `arcaland.com` verificato nei DNS. La pagina "Richiesta inviata" mostra comunque il riepilogo. Si attiva in Fase 6, quando il dominio è sotto controllo.
- **Composizioni Hexaplay nel carrello** (Fase 5).
- **Trattativa automatica su HubSpot.**
