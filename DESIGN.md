# Design — sito Arcaland

Sistema visivo "Luce", costruito in Fase 1 (layout, catalogo, scheda prodotto). Questo documento descrive ciò che è nel codice; i valori di riferimento sono in `src/styles/tokens.css`.

## Idea guida

Il sito parla la lingua della **pianta tecnica dell'area gioco**: aree di sicurezza tratteggiate, quote in metri, ingombri. È così che ragiona un tecnico comunale, e nessun concorrente lo usa come linguaggio visivo. Il tratteggio è il segno ricorrente: area di sicurezza nelle schede, campo "Ho uno spazio di", separatore sopra il footer, segnaposto delle immagini.

## Colore

| Ruolo | Token | Valore | Uso |
|---|---|---|---|
| Fondo | `--carta` | `#FBF8F2` | Pagina |
| Fondo secondario | `--carta-2` / `--carta-3` | `#F4EEE3` / `#E7DFCF` | Footer, fondi foto, linee del selettore |
| Testo | `--inchiostro` | `#222018` | Titoli e testo |
| Testo secondario | `--inchiostro-2` / `--inchiostro-3` | `#4A463B` / `#6B6555` | Descrizioni, etichette, metadati (contrasto ≥ 4,5:1 su Carta) |
| Azione | `--oro` | `#E6AF0B` | **Solo** come pieno di pulsanti e indicatori, con testo Inchiostro. Mai testo oro su fondo chiaro |
| Terreno, aree | `--cielo-chiaro` / `--cielo-scuro` | `#E3EFF4` / `#2C5B70` | Aree di sicurezza, campo spazio, etichetta "Inclusivo", anello di focus |
| Avviso | `--terracotta` | `#C8613F` | Solo stati di errore o avviso (es. nessun risultato) |

## Tipografia

- **Archivo** (variabile, larghezza ridotta al 85–92%): titoli, pulsanti, numeri, codici articolo. Numeri sempre `tabular-nums`.
- **Atkinson Hyperlegible Next**: testi, etichette, tabelle. Scelto per la leggibilità negli uffici tecnici e su telefono in sopralluogo.
- Scala: `--titolo-l` (h1, fino a 3,75rem), `--titolo-m`, `--titolo-s`; testo base 1,0625rem, interlinea 1,6, misura massima 68ch.
- Mai etichette sopra i titoli ("eyebrow"), mai maiuscolo.

## Componenti

- **Pulsanti**: `.bottone-primario` (pieno oro, uno per vista) e `.bottone-secondario` (bordo). Altezza minima 44px.
- **Tessera prodotto**: fondo bianco su Carta, angoli 14px, foto 4:3 su `--carta-2`, codice sopra il nome, etichette a pillola, pulsante **+** oro rotondo in alto a destra. Al passaggio del mouse la foto reale sostituisce il render.
- **Scelte a pillola** (materiale): bordo, attiva = pieno Inchiostro con testo Carta, `aria-pressed`.
- **Selettore segmentato** (linee): fondo `--carta-2`, voce attiva bianca; su telefono scorre orizzontalmente.
- **Pianta area di sicurezza**: SVG in centimetri, area Cielo tratteggiata, ingombro Inchiostro al 14%, quote in metri con la virgola.
- **Pannello filtri**: colonna fissa su desktop; foglio ancorato in basso su telefono, con velo, Esc per chiudere e focus che torna al pulsante.
- **Segnaposto immagine**: riquadro Cielo tratteggiato "Immagine in arrivo"; mai icone generiche.

## Movimento

Durata 220ms, curva `cubic-bezier(0.16, 1, 0.3, 1)`. Solo transizioni di stato (hover, pressione, cambio foto). Con "riduci movimento" la durata va a zero.

## Superfici del browser

Selezione testo in `--oro-chiaro`, cursore oro scuro, barra di scorrimento nei toni Carta, focus visibile 3px Cielo scuro con distanza 3px.

## Accessibilità

WCAG 2.1 AA verificata con axe a 1440 e 375px su home, catalogo, scheda e richiesta. Link "Salta al contenuto", ogni controllo ha un nome accessibile, conteggio risultati in `role="status"`.

## Da fare nelle prossime fasi

- Sostituire il logotipo provvisorio con il logo ufficiale.
- La home (Fase 3) è una superficie Persuade: avrà un proprio giro di direzione visiva, partendo da questo sistema.
