# Nuovo sito arcaland.com — Specifica di design

Data: 30 ottobre 2026 · Stato: da approvare · Referente: Elia Ferretti

## 1. Obiettivo

Rifare arcaland.com (oggi WordPress 6.1.1, tema 2021, contenuti duplicati, servizi nascosti) con un sito moderno, velocissimo e memorabile.

Priorità, in ordine:
1. **Credibilità**: il tecnico comunale che cerca Arcaland deve fidarsi in 30 secondi.
2. **Privati, soprattutto campeggi** (poi agriturismi, scuole private).
3. **Richieste di preventivo**: devono arrivare precise e già pronte da lavorare.

Criteri di successo:
- un tecnico trova un gioco adatto al suo spazio e ne scarica scheda tecnica e certificato in meno di 1 minuto;
- le richieste arrivano con codici articolo e quantità;
- Elia o un collega aggiornano prodotti, comuni, realizzazioni e news senza sviluppatore.

## 2. Decisioni prese

| Tema | Decisione |
|---|---|
| Pubblico | Un unico sito per comuni e privati, senza percorsi separati. Il prodotto è lo stesso. |
| Posizionamento | Il sito non parla solo di legno: legno, acciaio e misto. Il messaggio centrale è durata, poca manutenzione e sicurezza nel tempo (i comuni chiedono sempre più acciaio). |
| Esperienze principali | "Il parco che dura" (racconto a scorrimento), mappa dei comuni serviti, compositore Hexaplay 2D, carrello preventivo. |
| Escluso dalla v1 | Configuratore Hexaplay 3D, versione inglese, prezzi pubblici. |
| Identità | Del brand attuale resta solo l'oro del logo `#E6AF0B`. Palette "Luce" (vedi §4). |
| Aggiornamento | Pannello semplice (Sveltia CMS) usato da Elia o da un collega. |
| Stack | Astro + Sveltia CMS + Netlify (vedi §8). |
| Dominio | Si presume di proprietà Arcaland: **da verificare prima della messa online**. |

## 3. Struttura del sito

Menu: Prodotti · Hexaplay · Servizi · Realizzazioni · Chi siamo · News · **Richiedi preventivo** (pulsante oro) · icona carrello.

| Pagina | URL | Contenuto |
|---|---|---|
| Home | `/` | §5 |
| Catalogo | `/prodotti` | §6.1 |
| Scheda prodotto | `/prodotti/[slug]` | §6.2 |
| Compositore Hexaplay | `/hexaplay` | §7.1 |
| Servizi | `/servizi`, `/servizi/ispezione-manutenzione` | Progettazione, produzione, posa, ispezione e manutenzione EN 1176 (pagina forte) |
| Realizzazioni | `/realizzazioni` | Mappa dei comuni (§7.2) + elenco dei casi |
| Chi siamo | `/chi-siamo` | Storia, Gruppo Zennaro, Reggio Emilia e Porto Viro, certificazioni |
| News | `/news`, `/news/[slug]` | Articoli |
| Richiesta preventivo | `/richiesta` | Carrello + form (§6.3) |
| Download | `/download` | Catalogo PDF, certificazioni, schede tecniche |
| Pannello | `/admin` | §9 |

**Redirect 301**: ogni URL del sito attuale (prodotti, categorie, news, `/about/`, `/manutenzione-parchi/`) rimanda alla pagina nuova corrispondente, per non perdere il posizionamento su Google.

## 4. Identità visiva — palette "Luce"

| Nome | Hex | Uso |
|---|---|---|
| Oro Arcaland | `#E6AF0B` | Pulsanti principali, evidenze, punti della mappa. Sempre come fondo con testo Inchiostro; **mai come colore del testo su chiaro** (contrasto insufficiente). |
| Carta | `#FBF8F2` | Fondo principale |
| Inchiostro | `#222018` | Testo, titoli |
| Terracotta | `#C8613F` | Secondo accento, con moderazione |
| Cielo | `#9CC3D5` | Sfondi delle scene all'aperto, illustrazioni |

- Tipografia: da scegliere in fase di design. Niente Inter né Lato; un carattere con personalità per i titoli e uno molto leggibile per i testi e i dati tecnici.
- Niente gradienti viola, niente card tutte uguali, niente aspetto "generico da AI".
- Foto di cantiere migliorate con AI: **sì a nitidezza, luce, colore e risoluzione; no a modifiche del contenuto** (niente giochi aggiunti, sfondi o cieli inventati).
- Accessibilità: WCAG 2.1 AA, navigazione da tastiera, rispetto di "riduci movimento".

## 5. Home

1. **Apertura**: titolo forte (testo definitivo da scrivere, esempio: "Parchi gioco che durano. Progettati, posati e ispezionati da noi."), un gioco scontornato che entra in scena, pulsanti **Esplora i prodotti** e **Componi il tuo Hexaplay**, riga di fiducia (EN 1176 · legno, acciaio e misto · Gruppo Zennaro).
2. **"Il parco che dura"**: la scena resta ferma mentre si scorre e cambia la tappa:
   1. Progetto: planimetria con le aree di sicurezza che si disegnano.
   2. Produzione: legno e acciaio, Porto Viro.
   3. Posa: il gioco si assembla pezzo per pezzo.
   4. Ispezione: le spunte EN 1176 compaiono.
   5. Nel tempo: lo stesso parco anni dopo, "un solo interlocutore, per sempre".

   Su telefono le tappe si scorrono in modo semplice; con "riduci movimento" diventano immagini statiche.
3. **Numeri e mappa**: contatori animati (comuni serviti, abitanti totali, realizzazioni) e un'anteprima della mappa che rimanda a `/realizzazioni`.
4. **Hexaplay**: mini-composizione che si monta da sola e pulsante **Componi il tuo**.
5. **Linee**: Giochi · Arredo urbano · Percorsi sportivi, più l'accesso ai giochi inclusivi.
6. **Realizzazioni recenti**: 3 casi alternati tra comune e campeggio.
7. **Chiusura**: "Hai un'area da attrezzare?" con **Richiedi preventivo**, poi il piè di pagina.

## 6. Catalogo e preventivo

### 6.1 Catalogo
- Circa 300 prodotti in una pagina, con schede Giochi / Arredo urbano / Percorsi sportivi.
- Filtri:
  - sottocategoria
  - materiale (legno, acciaio, misto)
  - fascia d'età
  - altezza di caduta massima
  - inclusivo
  - **"Ho uno spazio di __ × __ m"**: mostra solo i prodotti la cui area di sicurezza ci sta.
- Il filtraggio avviene nel browser con risultati immediati; lo stato dei filtri resta nell'URL, quindi un link filtrato si può condividere.
- Tessera prodotto: foto scontornata (al passaggio del mouse lascia il posto alla foto reale), nome, codice, etichette, pulsante **+** per il carrello.

### 6.2 Scheda prodotto
- Galleria con render e foto reali, etichettati in modo distinto.
- Nome, codice, descrizione, quantità, **Aggiungi alla richiesta**.
- **Pianta dell'area di sicurezza** generata dai dati (ingombro + area di impatto quotata).
- Dati tecnici: dimensioni, area di sicurezza, altezza di caduta, età, materiali, utenti massimi.
- Documenti: scheda tecnica PDF, certificato EN 1176, istruzioni di posa.
- Prodotti simili.

### 6.3 Carrello preventivo
- Icona fissa con il numero di articoli; il carrello si apre come pannello laterale.
- Contiene prodotti (con quantità modificabili) e composizioni Hexaplay (un blocco apribile con la distinta).
- Nessun prezzo. Il contenuto resta salvato nel browser (localStorage, con gestione degli errori).
- Form:
  - obbligatori: Ente pubblico o Attività privata, nome, ente o azienda, email, telefono, comune dell'area;
  - facoltativi: note, allegato (planimetria o foto, massimo 10 MB).
- Invio con Netlify Forms, protetto da campo anti-spam nascosto e reCAPTCHA (o equivalente).
- A chi arriva:
  - una mail a `elia.ferretti@zennarolegnami.com` (indirizzo modificabile dal pannello), con la tabella di codici, nomi e quantità;
  - una mail di conferma a chi ha inviato, con il riepilogo.
- Fase successiva (fuori dalla v1): invio automatico a HubSpot come trattativa "Richiesta da gestire".

## 7. Esperienze speciali

### 7.1 Compositore Hexaplay 2D (`/hexaplay`)

**Componenti** (dal Listino):

| Tipo | Codici |
|---|---|
| Torri | `9.HP100.00`, `9.HP150.00`, `9.HP190.00` |
| Scivolo a tubo | `9.HP100.05` (100), `9.HP150.04` (150), `9.HP190.01` (190) |
| Rampa climbing | `9.HP100.02` (100), `9.HP150.02` (150) |
| Pertica | `9.HP100.03` (100), `9.HP150.03` (150) |
| Arrampicata a pioli | `9.HP100.01` (100) |
| Scaletta in fune a pioli | `9.HP150.01` (150) |
| Comuni a tutte le altezze | Pannello standard `9.HPCOM.02`, Pannello tris `9.HPCOM.03`, Ponte tibetano `9.HPCOM.04`, Copertura `9.HPCOM.01` |
| Composizione di partenza | 2 torri "A" `9.HP02.00` |

**Regole** (confermate da Elia):
1. Ogni torre è un esagono con 6 lati; ogni lato ospita **un solo** elemento.
2. Gli accessori vanno solo su torri della **stessa altezza**.
3. Il ponte tibetano collega due torri lato contro lato, anche di altezze diverse.
4. La copertura è facoltativa, una per torre.
5. **Nessun lato può restare aperto**: senza accessorio o ponte ci va un pannello.
6. Massimo **6 torri**, valore modificabile da configurazione.

**Uso**:
- vista dall'alto su griglia esagonale; si piazza con un clic (niente trascinamento libero);
- si seleziona una torre, si clicca un lato e si sceglie tra i soli elementi compatibili;
- un interruttore per la copertura;
- "Parti dalla 2 torri A" carica la composizione `9.HP02.00` già montata.

**Validazione**:
- i lati aperti diventano arancioni con l'avviso "Lato senza protezione";
- "Aggiungi alla richiesta" resta bloccato finché ci sono lati aperti, e un messaggio spiega cosa manca;
- il pulsante "Chiudi i lati liberi con pannelli standard" li completa con un clic.

**Sempre visibili**: ingombro, area di sicurezza indicativa (con la dicitura "indicativa, verificata in fase di progetto") e distinta con codici e quantità.

**Uscita**: la composizione va nel carrello con la distinta e una miniatura SVG della pianta.

**Dati**: componenti e regole stanno in un file di configurazione modificabile dal pannello; un nuovo accessorio si aggiunge con una riga.

**Da definire con Elia** in fase di sviluppo: ingombro reale di ogni torre e accessorio e la logica dell'area di sicurezza indicativa (i valori servono per pianta e misure).

### 7.2 Mappa dei comuni serviti (`/realizzazioni` + anteprima in home)
- Mostra **tutti i comuni in cui Arcaland ha lavorato** (ispezioni, nuovi parchi, manutenzione) **senza distinguere il tipo di lavoro**.
- Un solo tipo di punto, oro. La **dimensione cresce con la popolazione**, su scala graduata con un minimo cliccabile.
- Al clic si vede solo il comune, la provincia e la popolazione.
- In alto: "N comuni serviti, per oltre X abitanti".
- Mappa MapLibre GL con stile chiaro nella palette Luce e tile vettoriali gratuiti (OpenFreeMap o equivalente). Inquadratura iniziale sul Nord Italia.
- Dati comuni (nome, provincia, coordinate, popolazione) da un dataset ISTAT caricato una volta nel sito. Dal pannello si sceglie il comune da un elenco con completamento automatico.
- Sotto la mappa: **elenco delle realizzazioni** a tessere (foto, luogo, tipo comune/campeggio/scuola, materiale, giochi installati con link al catalogo), slegate dai punti.
- Alternativa accessibile: l'elenco testuale dei comuni serviti, ordinabile.

## 8. Architettura

- **Astro** (sito statico):
  - le pagine sono generate in anticipo, quindi il caricamento è immediato e l'indicizzazione su Google ottima;
  - JavaScript solo dove serve: filtri, carrello, compositore, mappa, animazioni.
- **Contenuti** in file nel repository GitHub (Astro content collections): prodotti, realizzazioni, comuni, news, configurazione Hexaplay, impostazioni.
- **Sveltia CMS** su `/admin`, con login tramite GitHub. Alla pubblicazione Netlify ricostruisce il sito in circa 1 minuto.
- **Netlify**: hosting, HTTPS, Netlify Forms, redirect 301.
- **Immagini**: ottimizzazione automatica di Astro (AVIF/WebP, dimensioni responsive, caricamento differito).
- **Animazioni**: GSAP ScrollTrigger per "Il parco che dura"; CSS per le micro-interazioni; rispetto di `prefers-reduced-motion`.
- **Obiettivi di prestazione**:
  - Lighthouse ≥ 90 in tutte le categorie su telefono;
  - LCP < 2,5 s;
  - CLS < 0,1;
  - la mappa e il compositore si caricano solo quando servono.
- **SEO**: meta tag e Open Graph per ogni pagina, sitemap, dati strutturati (Organization, Product), redirect 301 dal vecchio sito.
- **Privacy**: informativa e cookie in regola. Nessun tracciamento senza consenso; statistiche senza cookie (per esempio Netlify Analytics o Plausible).

## 9. Pannello di gestione

| Sezione | Campi principali |
|---|---|
| Prodotti | Nome, codice, linea, sottocategoria, materiale, età, altezza di caduta, dimensioni, area di sicurezza, utenti, inclusivo, descrizione, foto (render / reali), PDF |
| Realizzazioni | Titolo, comune, tipo, materiale, foto, prodotti installati, testo |
| Comuni serviti | Solo il comune, scelto dall'elenco ISTAT |
| News | Titolo, data, foto, testo, realizzazione collegata |
| Hexaplay | Componenti, altezze compatibili, codici, limite torri |
| Impostazioni | Email per le richieste, numeri della home, testi principali |

## 10. Caricamento iniziale dei contenuti
- Prodotti: script di importazione dal Listino Arcaland (codici, nomi, categorie) unito a foto e PDF del sito attuale. Le schede incomplete vengono segnalate in un elenco da completare dal pannello.
- Comuni serviti: elenco fornito da Arcaland (Excel o testo), importato con uno script.
- News: migrazione degli articoli attuali, senza i duplicati.
- **Nessun prezzo** viene importato o pubblicato.

## 11. Gestione degli errori
- Invio del form fallito: messaggio chiaro, il carrello resta salvato, pulsante "Riprova".
- Browser senza localStorage: il carrello funziona fino alla chiusura della pagina.
- Prodotto senza foto o PDF: segnaposto pulito, campi vuoti nascosti (mai "N/D").
- Mappa che non si carica: compare l'elenco dei comuni.
- Composizione Hexaplay non valida: non si può inviare, con un messaggio che spiega il motivo.

## 12. Test e verifica
- Test automatici sulle regole del compositore Hexaplay (compatibilità, lati aperti, ponte, limite torri, distinta).
- Test su filtri del catalogo e carrello (aggiunta, quantità, salvataggio, composizioni).
- Verifica visiva su computer e telefono (Playwright), audit di accessibilità e Lighthouse.
- Verifica dei redirect 301 su tutti i vecchi URL.
- Invio di prova del form fino alla ricezione della mail.

## 13. Fasi di consegna
1. Base: struttura, palette, tipografia, pannello, importazione dei prodotti, catalogo e schede.
2. Carrello preventivo e form.
3. Home con "Il parco che dura".
4. Mappa dei comuni e realizzazioni.
5. Compositore Hexaplay.
6. Servizi, chi siamo, news, download, redirect, verifica finale e messa online.

## 14. Cose da fare per Arcaland
- Verificare chi controlla dominio e DNS di arcaland.com.
- Fornire l'elenco dei comuni serviti.
- Fornire le misure di ingombro di torri e accessori Hexaplay.
- Verificare che le schede tecniche contengano tutti i campi elencati in §9.
- Selezionare le foto di cantiere migliori da migliorare con AI.
