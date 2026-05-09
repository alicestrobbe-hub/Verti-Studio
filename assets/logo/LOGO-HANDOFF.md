# Verti Studio — Logo Handoff

Pacchetto loghi pronto all'integrazione. Tutti i file SVG sono in `assets/logo/`.

---

## 1. File inclusi

| File | Uso | Note |
|---|---|---|
| `mark.svg` | Mark base (vette + accento ambra) | usa `currentColor` → eredita il colore dal contesto |
| `mark-mono.svg` | Mark monocromo, senza accento | per stampa B/N, debossing, watermark |
| `logo-compact.svg` | Header, firma email, footer | viewBox 280×64, lockup orizzontale |
| `logo-primary.svg` | Splash, hero, copertine | viewBox 480×200, con coordinate |
| `favicon.svg` | Favicon dark | sfondo `#0a0a0a`, vette neve + accento ambra |
| `favicon-light.svg` | Favicon light (alt) | sfondo neve, vette nere |
| `apple-touch-icon.svg` | iOS home screen | 180×180, sfondo nero |
| `app-icon-amber.svg` | App icon alternativo | sfondo ambra, vette nere |
| `og-image.svg` | Open Graph / social share | 1200×630 |

---

## 2. Font richiesti

Aggiungi nel `<head>` se non già presenti:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Inter:wght@300;400&display=swap" rel="stylesheet">
```

I file `logo-compact.svg` e `logo-primary.svg` contengono testo: vanno **inline-ati** (vedi sotto) perché un `<img src=".svg">` non carica i font web. Per `mark.svg`, `favicon.svg` ecc. va bene anche `<img>`.

---

## 3. Token di colore

```css
:root {
  --vs-abisso: #0a0a0a;
  --vs-neve:   #e8e4dc;
  --vs-ambra:  #c8b89a;
  --vs-pietra: #3a3a3a;
  --vs-ghiaccio: #c8c4bc;
}
```

---

## 4. Header — `logo-compact` in alto a sinistra

Va **inline-ato** per ereditare `currentColor` e animare l'asta in hover.

```html
<a href="/" class="vs-logo-link" aria-label="Verti Studio — home">
  <!-- Incolla qui il contenuto di assets/logo/logo-compact.svg -->
  <svg class="vs-logo-compact" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 64">…</svg>
</a>
```

```css
.vs-logo-link { display:inline-flex; color: var(--vs-abisso); text-decoration:none; }
.vs-logo-link:visited { color: var(--vs-abisso); }
.vs-logo-compact { height: 36px; width: auto; transition: opacity .25s ease; }
.vs-logo-link:hover .vs-logo-compact { opacity: .82; }

/* su sfondi scuri */
.dark .vs-logo-link { color: var(--vs-neve); }
```

Posiziona dentro l'header esistente, sostituendo il logo attuale. **Non serve testo "Verti Studio" accanto** — è già nel mark.

---

## 5. Splash screen — `logo-primary` con animazione elegante

Splash che appare al primo caricamento, scompare quando la pagina è pronta. Le vette si disegnano stroke-by-stroke, l'asta cresce dall'alto, il testo entra in cascata.

### HTML

```html
<div id="vs-splash" class="vs-splash" role="status" aria-label="Caricamento Verti Studio">
  <svg class="vs-splash-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 200" aria-hidden="true">
    <g class="vs-vette" transform="translate(20 56) scale(1.35)">
      <path class="vs-peak vs-peak-1" d="M4 50 L18 26 L26 36 L40 18 L60 50" fill="none" stroke="#e8e4dc" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>
      <path class="vs-peak vs-peak-2" d="M4 56 L24 36 L34 44 L48 28 L60 56" fill="none" stroke="#e8e4dc" stroke-width="1.0" stroke-linejoin="round" stroke-linecap="round" opacity=".55"/>
      <path class="vs-peak vs-peak-tip" d="M40 18 L42 22" stroke="#c8b89a" stroke-width="1.4" stroke-linecap="round"/>
    </g>
    <line class="vs-asta" x1="138" y1="46" x2="138" y2="154" stroke="#c8b89a" stroke-width="1"/>
    <text class="vs-verti" x="160" y="118" font-family="'Cormorant Garamond', Georgia, serif" font-weight="300" font-size="78" fill="#e8e4dc" letter-spacing="-1">Verti</text>
    <text class="vs-studio" x="160" y="142" font-family="'Inter', system-ui, sans-serif" font-weight="300" font-size="13" fill="#e8e4dc" letter-spacing="4.2" opacity=".78">STUDIO</text>
    <text class="vs-coord" x="160" y="166" font-family="'Inter', system-ui, sans-serif" font-weight="300" font-size="10" fill="#e8e4dc" letter-spacing="2.8" opacity=".55">46.4983° N · 11.3548° E</text>
  </svg>
</div>
```

### CSS

```css
.vs-splash {
  position: fixed; inset: 0; z-index: 9999;
  background: #0a0a0a;
  display: flex; align-items: center; justify-content: center;
  opacity: 1; transition: opacity .8s ease 0.2s, visibility 0s linear .9s;
}
.vs-splash.is-hidden { opacity: 0; visibility: hidden; }
.vs-splash-logo { width: min(480px, 70vw); height: auto; }

/* peaks: stroke draw */
.vs-peak {
  stroke-dasharray: 200; stroke-dashoffset: 200;
  animation: vs-draw 1.1s cubic-bezier(.6,.05,.2,1) forwards;
}
.vs-peak-1 { animation-delay: .1s; }
.vs-peak-2 { animation-delay: .35s; }
.vs-peak-tip { animation-delay: 1.0s; animation-duration: .4s; }

@keyframes vs-draw { to { stroke-dashoffset: 0; } }

/* asta: cresce dall'alto */
.vs-asta {
  transform-origin: 138px 46px;
  transform: scaleY(0);
  animation: vs-grow .7s cubic-bezier(.6,.05,.2,1) .55s forwards;
}
@keyframes vs-grow { to { transform: scaleY(1); } }

/* testo: fade-up in cascata */
.vs-verti, .vs-studio, .vs-coord {
  opacity: 0; transform: translateY(8px);
  animation: vs-rise .7s ease forwards;
}
.vs-verti  { animation-delay: .85s; }
.vs-studio { animation-delay: 1.05s; }
.vs-coord  { animation-delay: 1.25s; }

@keyframes vs-rise { to { opacity: 1; transform: translateY(0); } }
.vs-coord { animation-name: vs-rise-coord; }
@keyframes vs-rise-coord { to { opacity: .55; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  .vs-peak, .vs-asta, .vs-verti, .vs-studio, .vs-coord { animation: none; opacity: 1; transform: none; stroke-dashoffset: 0; }
  .vs-coord { opacity: .55; }
}
```

### JS — nascondi quando la pagina è pronta

```js
window.addEventListener('load', () => {
  // Aspetta che l'animazione abbia terminato (~1.7s) prima di iniziare il fade
  const min = 1700;
  const start = performance.now();
  const hide = () => document.getElementById('vs-splash')?.classList.add('is-hidden');
  setTimeout(hide, Math.max(0, min - (performance.now() - start)));
});
```

> Lo splash deve apparire **subito**: incolla l'HTML come **primo elemento** dentro `<body>` (prima di tutto il resto), con CSS critical inlined nel `<head>` o nel primo `<style>`. Altrimenti vedrai un flash di contenuto prima dello splash.

---

## 6. Footer — `mark` + nome compatto

```html
<footer class="vs-footer">
  <div class="vs-footer-mark">
    <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">…contenuto di mark.svg…</svg>
    <span class="vs-pillar"></span>
    <span class="vs-name">
      <span class="vs-name-serif">Verti</span>
      <span class="vs-name-caps">Studio</span>
    </span>
  </div>
  <p class="vs-footer-coord">46.4983° N · 11.3548° E · Bolzano</p>
  <p class="vs-footer-copy">© 2026 Verti Studio · P.IVA 00000000000</p>
</footer>
```

```css
.vs-footer { padding: 56px 32px; text-align: center; color: var(--vs-pietra); background: var(--vs-abisso); }
.vs-footer-mark { display: inline-flex; align-items: center; gap: 14px; color: var(--vs-neve); }
.vs-pillar { width: 1px; height: 32px; background: var(--vs-ambra); }
.vs-name { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
.vs-name-serif { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 22px; line-height: 1; }
.vs-name-caps { font-family: 'Inter', sans-serif; font-weight: 300; font-size: 9px; letter-spacing: .32em; text-transform: uppercase; color: var(--vs-ghiaccio); }
.vs-footer-coord { margin-top: 18px; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: #7a7468; font-variant-numeric: tabular-nums; }
.vs-footer-copy { margin-top: 6px; font-size: 10px; color: #555; letter-spacing: .04em; }
```

---

## 7. Meta tag — favicon, apple-touch, social

Aggiungi nel `<head>`:

```html
<!-- Favicon -->
<link rel="icon" href="/assets/logo/favicon.svg" type="image/svg+xml">
<link rel="mask-icon" href="/assets/logo/mark-mono.svg" color="#0a0a0a">

<!-- iOS / Android home screen -->
<link rel="apple-touch-icon" href="/assets/logo/apple-touch-icon.svg">

<!-- Theme color (browser chrome) -->
<meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#e8e4dc" media="(prefers-color-scheme: light)">

<!-- Open Graph -->
<meta property="og:title" content="Verti Studio">
<meta property="og:description" content="Studio di architettura · Bolzano · 46.4983° N · 11.3548° E">
<meta property="og:image" content="/assets/logo/og-image.svg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="/assets/logo/og-image.svg">
```

> **Nota**: alcuni social (LinkedIn, certi anteprime WhatsApp) **non leggono SVG come og:image**. Se ti serve compatibilità totale, esporta `og-image.svg` in PNG 1200×630 e usa quello al posto di `.svg`. Si fa con `rsvg-convert -w 1200 og-image.svg > og-image.png` oppure tramite [CloudConvert](https://cloudconvert.com/svg-to-png).

---

## 8. Spazio di rispetto e taglie minime

- **Spazio di rispetto** intorno al logo: almeno l'altezza del simbolo "vette" (= circa la x-height di "V" in Verti).
- **Taglia minima**:
  - `logo-primary` → mai sotto 180px di larghezza
  - `logo-compact` → mai sotto 120px di larghezza
  - `mark` da solo → mai sotto 24px (sotto questa soglia usa `favicon.svg` che è semplificato)

---

## 9. Cosa NON fare

- ❌ non cambiare il colore dell'accento ambra (`#c8b89a`) — è l'unica nota cromatica del sistema
- ❌ non riempire le vette di colore: sono sempre stroke, mai fill
- ❌ non comprimere o stirare in altezza/larghezza (mantieni proporzioni)
- ❌ non aggiungere ombre, gradienti o effetti
- ❌ non usare `logo-primary` come immagine raster — va inline-ato per i font

---

## 10. Riepilogo — dove va cosa

| Posizione | File | Modalità |
|---|---|---|
| Header (in alto sx) | `logo-compact.svg` | inline SVG |
| Splash al caricamento | `logo-primary.svg` (vedi §5) | inline SVG + CSS animation |
| Footer | `mark.svg` + testo HTML (vedi §6) | inline SVG |
| Favicon | `favicon.svg` | `<link rel="icon">` |
| iOS home | `apple-touch-icon.svg` | `<link rel="apple-touch-icon">` |
| Social share | `og-image.svg` (o PNG) | `<meta property="og:image">` |

Buon lavoro 🏔
