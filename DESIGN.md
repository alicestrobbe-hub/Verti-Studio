---
name: Verti Studio
description: Studio di web design a Bolzano — presenza digitale per le PMI dell'Alto Adige
colors:
  abisso: "#0a0a0a"
  notte: "#141414"
  granito: "#1e1e1e"
  ardesia: "#2c2c2c"
  pietra: "#3a3a3a"
  neve: "#e8e4dc"
  ghiaccio: "#c8c4bc"
  ambra: "#c8b89a"
  alpino: "#3d5a3d"
typography:
  display:
    fontFamily: "'Cormorant Garamond', Georgia, serif"
    fontSize: "clamp(52px, 9.5vw, 128px)"
    fontWeight: 300
    fontStyle: italic
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "clamp(28px, 4.2vw, 54px)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Cormorant Garamond', Georgia, serif"
    fontSize: "clamp(16px, 1.4vw, 19px)"
    fontWeight: 300
    lineHeight: 1.75
  label:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "clamp(9px, 0.82vw, 11px)"
    fontWeight: 300
    letterSpacing: "0.09em"
spacing:
  gutter: "clamp(24px, 5vw, 80px)"
  section-py: "clamp(80px, 12vh, 160px)"
  xs: "8px"
  sm: "16px"
  md: "28px"
  lg: "48px"
  xl: "96px"
rounded:
  none: "0"
  sm: "1px"
components:
  btn-primary:
    backgroundColor: "transparent"
    textColor: "{colors.ambra}"
    rounded: "{rounded.none}"
    padding: "17px 38px"
  btn-primary-hover:
    backgroundColor: "{colors.ambra}"
    textColor: "{colors.abisso}"
    rounded: "{rounded.none}"
    padding: "17px 38px"
  btn-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ghiaccio}"
    rounded: "{rounded.none}"
    padding: "17px 38px"
  btn-secondary-hover:
    backgroundColor: "oklch(22% 0.006 250 / 0.35)"
    textColor: "{colors.neve}"
    rounded: "{rounded.none}"
    padding: "17px 38px"
  nav-cta:
    backgroundColor: "transparent"
    textColor: "{colors.ambra}"
    rounded: "{rounded.none}"
    padding: "8px 20px"
  bento-card:
    backgroundColor: "{colors.granito}"
    textColor: "{colors.neve}"
    rounded: "{rounded.none}"
    padding: "clamp(28px, 3.5vw, 48px)"
  bento-card-featured:
    backgroundColor: "oklch(14% 0.010 80)"
    textColor: "{colors.neve}"
    rounded: "{rounded.none}"
    padding: "clamp(28px, 3.5vw, 48px)"
---

# Design System: Verti Studio

## 1. Overview

**Creative North Star: "La Precisione Alpina"**

Verti Studio si trova a Bolzano, dove la rigorosità nordeuropea incontra il senso estetico italiano. Il sistema di design esprime questa dualità senza folklorismo: scuro come le notti in quota, caldo come il larice, preciso come le carte topografiche svizzere. Ogni elemento guadagna il suo posto sulla pagina — niente è decorativo per definizione.

La paletta è quasi monocromatica, con un solo accento cromatico (l'ambra) usato con parsimonia: nei numeri, nelle etichette, nei bordi. Il calore non arriva dal colore saturo, ma dalla tintatura calda dei neutri e dalla texture del serif. Il silenzio tra gli elementi è trattato come materiale di design, non come spazio residuo.

Il sistema rifiuta esplicitamente: la crema-Inter dei SaaS generici, i blob-gradiente viola, gli hero video con font bold arancione, i portfolio di mockup flottanti su MacBook, e qualsiasi headline con "Trasformiamo la tua visione digitale".

**Key Characteristics:**
- Sfondo quasi-nero con tintatura neutra calda, non puro nero
- Un solo accento — ambra (#c8b89a) — usato su meno del 15% di ogni schermata
- Tipografia esclusivamente serif + mono, mai sans-serif di sistema per il corpo
- Margini fluidi via `clamp()`, mai fissi in px
- Animazioni di entrata orchestrate, non applicate a ogni elemento
- Spigoli vivi: `border-radius: 0` o al massimo `1px`

## 2. Colors: La Tavolozza dell'Altitudine

Una sequenza di neri e grigi caldi che sale dall'abisso verso la neve, con un unico tocco d'ambra come luce di lanterna.

### Primary
- **Ambra** (`#c8b89a` / `oklch(72% 0.06 80)`): L'unico accento di colore del sistema. Usato per etichette mono, numeri di sezione, bordi di card in evidenza, CTA border-fill, icone ✦ nelle feature list. Non usato come sfondo di massa. La sua rarità è il punto.

### Neutral — Dark Family
- **Abisso** (`#0a0a0a`): Sfondo primario della pagina. Né puro nero né grigio: tintato leggermente verso il marrone.
- **Notte** (`#141414`): Superficie elevata per sezioni alternate (Evolution Plan, FAQ). Crea ritmo senza richiedere colore.
- **Granito** (`#1e1e1e`): Card background standard. Bento cards, step cards del processo.
- **Ardesia** (`#2c2c2c`): Bordi medi, separatori strutturali.
- **Pietra** (`#3a3a3a`): Bordi leggeri, divisori sottili.

### Neutral — Light Family
- **Neve** (`#e8e4dc`): Testo primario. Non bianco puro: leggermente avorio-caldo, riduce l'affaticamento su dark background.
- **Ghiaccio** (`#c8c4bc`): Testo secondario, descrizioni corpo, metadati. 70–85% di opacità rispetto alla neve.

### Neutral — Green (splash only)
- **Alpino** (`#3d5a3d`): Usato esclusivamente nella barra di progresso dello splash screen. Non appare nel design principale.

### Named Rules
**La Regola dell'Unica Voce.** L'ambra è il solo accento cromatico. Non aggiungere blu, verde, viola, o rosso al mix. Se serve enfasi aggiuntiva, usare scala, peso, o spazio — non un altro colore.

**La Regola del Neutro Tintato.** Nessun grigio puro. Ogni neutro ha una tintatura verso il marrone caldo (hue ~60–80 in OKLCH). Non usare `#000`, `#111`, `#888`, `#fff`.

## 3. Typography: Il Carattere dell'Alto Adige

**Display Font:** Cormorant Garamond (italic 300, Roman 300–400), fallback Georgia, serif
**Headline Font:** Playfair Display (Roman 300), fallback Georgia, serif
**Label / Mono Font:** JetBrains Mono (300, 400), monospace

**Character:** Un serif antico e magro che respira come il paesaggio montano. Il corsivo di Cormorant porta la voce della marca — quando il testo inclina, sta parlando per Verti Studio. Il mono è chirurgico: etichette di sezione, coordinate, metadata. Non è usato come "tocco developer"; è usato come sistema di codifica visiva precisa.

### Hierarchy

- **Display** (Cormorant Garamond italic, peso 300, `clamp(52px, 9.5vw, 128px)`, line-height 1.05, tracking -0.025em): Hero title, titoli sezione CTA. Usa il corsivo sempre. Le parole in corsivo evocano il marchio, le parole in tondo evocano concretezza.
- **Headline** (Playfair Display, peso 300, `clamp(28px, 4.2vw, 54px)`, line-height 1.1, tracking -0.01em): Intestazioni di sezione secondarie (Competenze su misura, Un metodo chiaro). Non corsivo per default.
- **Title** (Cormorant Garamond, peso 300, `clamp(20px, 2vw, 28px)`, line-height 1.2): Titoli di card, nomi di servizi nelle bento card.
- **Body** (Cormorant Garamond, peso 300, `clamp(16px, 1.4vw, 19px)`, line-height 1.72–1.82, max-width 60–65ch): Testo descrittivo. Il serif richiede line-height più alto del sans su dark background. Non scendere sotto 16px.
- **Label** (JetBrains Mono, peso 300, `clamp(9px, 0.82vw, 11px)`, uppercase, tracking 0.09em): Numeri di sezione (`001 / INVESTIMENTO`), coordinate geografiche, metadati tecnici, note prezzo. Solo maiuscolo. Solo peso 300 o 400.

### Named Rules
**La Regola del Corsivo Parlante.** L'italico in display type è la voce di Verti Studio. Ogni titolo hero ha almeno una riga in corsivo. Il corsivo non è enfasi generica: è il tono che distingue la promessa dal dato.

**La Regola del Mono come Codice Visivo.** JetBrains Mono non è usato per "sembrare tecnico". È usato quando l'informazione è strutturata, numerica, o geografica. Mai come font di corpo. Mai come titolo display.

## 4. Elevation

Il sistema è piatto per default. La profondità viene espressa attraverso superfici tonali, non attraverso ombre.

I livelli tonali formano una scala di elevazione semantica:

| Livello | Token | Uso |
|---------|-------|-----|
| 0 — Abisso | `#0a0a0a` | Sfondo pagina |
| 1 — Notte | `#141414` | Sezioni alternate |
| 2 — Granito | `#1e1e1e` | Card standard |
| 3 — Glass | `oklch(14% 0.008 250 / 0.70)` + blur | Solo Evolution Plan |

### Shadow Vocabulary
Il sistema non usa ombre convenzionali (`box-shadow`). L'unica eccezione è il **glow ambra** sull'Evolution Plan card:
- **Ambra glow** (`radial-gradient`, `oklch(72% 0.08 80 / 0.14)`): Alone interno che simula luce dall'alto, usato solo sulla card Evolution. Non su altri elementi.

### Named Rules
**La Regola Piatta per Default.** Nessuna card ha `box-shadow`. L'elevazione si legge dalla differenza di luminosità tra la superficie e il suo contesto. Se stai pensando di aggiungere un'ombra, usa invece un livello tonale più chiaro.

**La Regola del Glass Singolo.** Il glassmorphism (`backdrop-filter: blur`) esiste in un solo posto: l'Evolution Plan card. È purposeful perché differenzia il piano da abbonamento da tutto il resto. Aggiunto altrove, diventa decorazione.

## 5. Components

### Buttons

Spigoli vivi (`border-radius: 0`). Non esistono pill button, né rounded. La forma rettangolare è coerente con l'estetica alpina-tipografica.

- **Shape:** Nessun radius (0px). Mai arrotondato.
- **Primary (CTA sartoriale):** `border: 1px solid var(--ambra)`, `color: var(--ambra)`, `background: transparent`. Hover: fill completo ambra, testo abisso. Padding: 17px top/bottom, 38px sinistra/destra. Transizione 320ms ease. Active: `scale(0.97)`.
- **Secondary (Consulenza):** `border: 1px solid oklch(48% 0.008 250 / 0.50)`, `color: var(--ghiaccio)`. Hover: bordo e sfondo si scuriscono, testo diventa neve.
- **Evolution CTA (inline):** Identico al Primary ma con `font-size: clamp(15px, 1.4vw, 18px)` e `letter-spacing: 0.04em`. Usato dentro la card Evolution.
- **Focus:** `outline: 2px solid oklch(72% 0.060 80 / 0.80)` con `outline-offset: 3px`.

### Bento Cards

Usate per la griglia di servizi. Grid con named areas esplicite, gap di 2px.

- **Shape:** Nessun radius. Bordo full-perimeter `1px solid oklch(35% 0.010 250 / 0.35)`.
- **Background:** `--pr-card` (`oklch(13% 0.006 250)`). Card featured (Web Design): `--pr-card-warm` (`oklch(14% 0.010 80)`), bordo ambra.
- **No glassmorphism.** Superfici solide. `backdrop-filter` è vietato nelle bento card.
- **Hover:** Bordo si scalda verso ambra (`oklch(50% 0.03 80 / 0.50)`).
- **Motion:** Entrata con `opacity + translateY(24px)`, stagger 80ms tra card. Magnetic hover via GSAP (rAF-throttled, fattore 0.07, `power2.out` / `power3.out` reset).

### Evolution Plan Card (Signature Component)

L'unico elemento glassmorphism del sistema. Differenzia il piano mensile da tutto il resto.

- **Background:** `oklch(14% 0.008 250 / 0.70)` + `backdrop-filter: blur(18px) saturate(1.2)`.
- **Border animato:** `@property --evo-hue` cicla da 80 a 45 in 8s (ambra → oro più caldo), creando un bordo "vivo".
- **Accent superiore:** Linea gradient ambra orizzontale sul bordo superiore della card.
- **Glow interno:** Radial gradient ambra (14% opacità) dalla sommità, si intensifica su hover.
- **`contain: paint`** per isolare il repaint del blur dal resto del layout.

### FAQ Accordion

Minimal. Nessuna card wrapper. L'elenco domande è separato da `border-bottom: 1px solid`.

- **Trigger button:** Full-width, min-height 56px (touch target). Label mono a sinistra, testo domanda al centro, icona a croce a destra.
- **Icona:** Due pseudo-elementi che formano `+`, ruotano a `×` su open (`transform: rotate(45deg)`, braccio verticale svanisce).
- **Body:** `max-height` transition da 0 a 640px, `var(--ease-quart-out)`, 420ms.
- **Sticky header:** La colonna intestazione rimane `position: sticky; top: 100px` sul desktop.

### Navigation

- **Default:** Trasparente, senza sfondo.
- **Scrolled (>60px):** Sfondo `rgba(10,10,10,0.85)` con `backdrop-filter: blur`.
- **Logo:** "V" in ambra + "erti Studio" in neve. Font: Cormorant Garamond.
- **Link attivo:** `color: var(--ambra)`, `opacity: 1`.
- **CTA nav:** Testo ambra, bordo sottile, nessun fill.

### Line Reveal (Signature Animation)

Animazione di entrata per titoli display. Clip-path verso l'alto.

- `overflow: hidden` sul wrapper.
- `transform: translateY(108%)` stato iniziale, `translateY(0)` finale.
- `transition: 1100ms cubic-bezier(0.16, 1, 0.3, 1)`.
- Stagger di 120ms tra righe.

## 6. Do's and Don'ts

### Do:
- **Do** usare `clamp()` per ogni valore tipografico e spaziale: il sistema è fluido per definizione.
- **Do** alternare `--pr-surface-0` (freddo) e `--pr-surface-1` (caldo) tra sezioni consecutive per creare ritmo senza aggiungere colore.
- **Do** usare il corsivo di Cormorant Garamond per la voce del brand nei titoli hero: è l'unico momento in cui il sito "parla".
- **Do** tenere l'ambra sotto il 15% della superficie visiva. La sua rarità è ciò che la rende efficace.
- **Do** usare `border-radius: 0` o `1px` su tutti i componenti interattivi. Il sistema è spigoloso, non morbido.
- **Do** applicare `overflow-wrap: break-word` e `hyphens: auto` a ogni blocco di testo descrittivo.
- **Do** rispettare `prefers-reduced-motion`: ogni animazione ha un fallback che riduce durata a 0.01ms.
- **Do** usare `contain: layout style` sulle sezioni che contengono `backdrop-filter` per isolare i repaint.
- **Do** preferire superfici tonali a ombre: il livello si legge dal contrasto, non dall'`box-shadow`.

### Don't:
- **Don't** usare Inter, Roboto, DM Sans, o qualsiasi sans-serif di sistema come font di corpo o display. Questo è il fallimento visivo più comune delle agenzie italiane concorrenti.
- **Don't** aggiungere glassmorphism a elementi diversi dall'Evolution Plan card. Un solo vetro nel sistema, non una regola generica.
- **Don't** usare `border-left` o `border-right` maggiore di 1px come stripe colorato su card o list item. Mai. Usare invece un bordo perimetrale completo, una tintatura di sfondo, o un numero/icona guida.
- **Don't** usare gradiente sul testo (`background-clip: text`). L'enfasi è nella scala e nel peso, non negli effetti CSS.
- **Don't** mettere testo grigio su sfondi colorati. Usare una tinta della superficie o trasparenza.
- **Don't** usare `#000000` o `#ffffff` puri. Il sistema usa `--abisso` e `--neve`, entrambi tintati.
- **Don't** aggiungere un secondo colore accento. Non blu, non verde (a parte lo splash), non viola. L'ambra è sola.
- **Don't** usare border-radius sopra 2px su nessun componente interattivo.
- **Don't** animare proprietà di layout (`width`, `height`, `top`, `left`, margini). Solo `transform` e `opacity` per le animazioni di movimento.
- **Don't** usare easing `elastic` o `bounce`. L'unico easing accettabile è expo-out, quart-out, o curve personalizzate con decelerazione finale.
- **Don't** imitare: "SaaS cream generici (Inter su bianco, blob gradiente viola)", "agenzie italiane con hero video e font bold arancione", "portfolio con gallerie di mockup su MacBook flottanti", qualsiasi headline con "Trasformiamo la tua visione digitale".
