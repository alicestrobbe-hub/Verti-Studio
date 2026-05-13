'use strict';

// ───────── i18n ─────────

const LangCtx = React.createContext('it');

function useLang() {
  const [lang, setLangState] = React.useState(() => {
    const l = localStorage.getItem('verti-lang') || 'it';
    document.documentElement.lang = l;
    return l;
  });
  const setLang = (l) => {
    localStorage.setItem('verti-lang', l);
    document.documentElement.lang = l;
    setLangState(l);
  };
  return [lang, setLang];
}

function LangSwitcher({ setLang }) {
  const lang = React.useContext(LangCtx);
  return (
    <div className="lang-switcher" aria-label="Lingua / Sprache / Language">
      {['it', 'de', 'en'].map((l, i) => (
        <React.Fragment key={l}>
          {i > 0 && <span className="lang-sep" aria-hidden="true">/</span>}
          <button
            className={`lang-btn${lang === l ? ' active' : ''}`}
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
          >
            {l.toUpperCase()}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

// ───────── Utils ─────────

function useScrollY() {
  const [y, setY] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const fn = () => { if (raf) return; raf = requestAnimationFrame(() => { setY(window.scrollY); raf = 0; }); };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => { window.removeEventListener('scroll', fn); cancelAnimationFrame(raf); };
  }, []);
  return y;
}

function useInView(options = {}) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.08, ...options });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// FadeUp standard
function FadeUp({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`fade-up${inView ? ' in' : ''}${className ? ' ' + className : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// Reveal per singola riga di testo (clip-path dal basso)
function LineReveal({ children, delay = 0, tag: Tag = 'div', className = '' }) {
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} className={`ah-line-reveal${inView ? ' in' : ''}${className ? ' ' + className : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

function Counter({ to, duration = 1800, suffix = '' }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 4)) * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toLocaleString('it-IT')}{suffix}</span>;
}

// ───────── Nav ─────────

function Nav({ scrollY, setLang }) {
  const scrolled = scrollY > 80;
  const [open, setOpen] = React.useState(false);
  const lang = React.useContext(LangCtx);
  const T = (window.VERTI_LANG || {})[lang] || {};
  const tn = T.nav || {};
  React.useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open]);
  const close = () => setOpen(false);
  const links = [
    ['index.html#metodo', tn.metodo || 'Metodo'],
    ['index.html#servizi', tn.servizi || 'Servizi'],
    ['index.html#lavori', tn.lavori || 'Lavori'],
    ['index.html#mantenimento', tn.cura || 'Cura'],
    ['pricing.html', tn.investimento || 'Investimento'],
    ['about.html', tn.chiSiamo || 'Chi siamo'],
    ['index.html#contatti', tn.contatti || 'Contatti'],
  ];
  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <a href="index.html" className="nav-brand" aria-label="Verti Studio — Homepage">
          <svg className="nav-logo-compact" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 64" aria-hidden="true">
            <g transform="translate(2 14) scale(0.56)">
              <path d="M4 50 L18 26 L26 36 L40 18 L60 50" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round"/>
              <path d="M4 56 L24 36 L34 44 L48 28 L60 56" fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinejoin="round" strokeLinecap="round" opacity="0.55"/>
              <path d="M40 18 L42 22" stroke="#c8b89a" strokeWidth="2.8" strokeLinecap="round"/>
            </g>
            <line x1="44" y1="14" x2="44" y2="50" stroke="#c8b89a" strokeWidth="1"/>
            <text x="58" y="44" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="300" fontSize="34" fill="currentColor" letterSpacing="-0.4">Verti</text>
            <text x="158" y="40" fontFamily="'Inter', system-ui, sans-serif" fontWeight="300" fontSize="11" fill="currentColor" letterSpacing="3.4" opacity="0.78">STUDIO</text>
          </svg>
        </a>
        <ul className="nav-links">{links.map(([href, label]) => (<li key={href}><a href={href} {...(href === 'about.html' ? { 'aria-current': 'page' } : {})}>{label}</a></li>))}</ul>
        <LangSwitcher setLang={setLang} />
        <button className={`nav-hamburger${open ? ' open' : ''}`} onClick={() => setOpen(v => !v)} aria-label={open ? (tn.chiudiMenu || 'Chiudi menu') : (tn.apriMenu || 'Apri menu')} aria-expanded={open} aria-controls="nav-overlay-about">
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div id="nav-overlay-about" className={`nav-overlay${open ? ' open' : ''}`} aria-hidden={!open} role="dialog" aria-label="Menu di navigazione" onClick={close}>
        <nav className="nav-overlay-inner" onClick={(e) => e.stopPropagation()}>
          {links.map(([href, label], i) => (<a key={href} href={href} className="nav-overlay-link" style={{ '--i': i }} onClick={close} {...(href === 'about.html' ? { 'aria-current': 'page' } : {})}>{label}</a>))}
          <LangSwitcher setLang={setLang} />
        </nav>
        <div className="nav-overlay-meta">46.4983° N · 11.3548° E · Bolzano</div>
      </div>
    </>
  );
}

// ───────── Hero ─────────
// Sfondo: alps-hero.jpg — già B&W, panoramica, cinematografica.
// Animazione: Ken Burns slow pan (image drifts left, slight dezoom).
// Testo: reveal linea per linea con clip-path (differente dall'homepage).

function AHeroText() {
  const lang = React.useContext(LangCtx);
  const Th = (((window.VERTI_LANG || {})[lang] || {}).about || {}).hero || {};
  return (
    <>
      <div className="ah-hero-eyebrow">
        <span className="eyebrow">{Th.eyebrow || 'Chi siamo · Verti Studio'}</span>
      </div>
      <h1 className="ah-hero-title" style={{ fontSize: 'clamp(64px, 8vw, 96px)', maxWidth: '960px', textAlign: 'center' }}>
        <LineReveal delay={500}><span>{Th.titleA || 'Nati in'}</span></LineReveal>
        <LineReveal delay={680}><span>{Th.titleB || 'Alto Adige.'}</span></LineReveal>
        <LineReveal delay={860}><span className="ah-hero-em">{Th.titleEm || 'Costruiti per restare.'}</span></LineReveal>
      </h1>
    </>
  );
}

function AboutHero() {
  const parallaxRef = React.useRef(null);
  const lang = React.useContext(LangCtx);
  const Th = (((window.VERTI_LANG || {})[lang] || {}).about || {}).hero || {};
  const scrollHint = (((window.VERTI_LANG || {})[lang] || {}).home || {}).scrollHint || 'scorri';

  // Parallax leggero: l'immagine scorre più lentamente della pagina (rAF throttled)
  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let rafId = 0;
    const fn = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.22}px)`;
        }
        rafId = 0;
      });
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => { window.removeEventListener('scroll', fn); if (rafId) cancelAnimationFrame(rafId); };
  }, []);

  return (
    <section className="ah-hero">
      {/* Layer 1: immagine con Ken Burns + parallax */}
      <div className="ah-hero-img-outer" ref={parallaxRef}>
        <img src="assets/orizz1.jpeg" alt="" className="ah-hero-img" aria-hidden="true" fetchpriority="high" decoding="async" />
      </div>
      {/* Layer 2: gradienti */}
      <div className="ah-hero-gradient" aria-hidden="true" />
      {/* Layer 3: testo centrato — pb lascia spazio visivo per l'HUD sottostante */}
      <div className="ah-hero-content container" style={{ justifyContent: 'center', paddingBottom: '0', paddingTop: '73px' }}>
        <div className="ah-hero-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '96px' }}>
          <AHeroText />
        </div>
      </div>

      {/* HUD: Angolo in basso a sinistra — Location */}
      <div className="ah-hud-anchor ah-hud-left" aria-hidden="true">
        <span className="ah-hud-line" />
        <span className="ah-hud-text">{Th.location || 'BOLZANO — MMXXVI'}</span>
      </div>

      {/* HUD: Centro in basso — Scroll indicator */}
      <div className="ah-hud-scroll" aria-hidden="true">
        <span className="ah-scroll-label">{scrollHint}</span>
        <span className="ah-scroll-line" />
      </div>

      {/* HUD: Angolo in basso a destra — Coordinate (nascosto su mobile) */}
      <div className="ah-hud-anchor ah-hud-right" aria-hidden="true">
        <span className="ah-hud-text">{Th.coords || '46.4983° N — 11.3548° E'}</span>
        <span className="ah-hud-line" />
      </div>
    </section>
  );
}

// ───────── Statement ─────────
// Zona di transizione tra hero e corpo della pagina.
// NESSUN bordo — geometria creata da: angolo ambra + watermark "Alto Adige"
// + coordinate verticali. Il grande testo fluttua nel nero senza box.

function Statement() {
  const [ref, inView] = useInView({ threshold: 0.2 });
  const lang = React.useContext(LangCtx);
  const Ts = (((window.VERTI_LANG || {})[lang] || {}).about || {}).statement || {};
  return (
    <div className="ah-statement" ref={ref}>
      <span className="ah-statement-watermark" aria-hidden="true">ALTO ADIGE</span>
      <span className="ah-statement-corner" aria-hidden="true" />
      <span className="ah-statement-coords" aria-hidden="true">46.4983° N</span>
      <div className="container">
        <p className={`ah-statement-text fade-up${inView ? ' in' : ''}`}>
          {Ts.text || 'Un digitale più semplice.'}<br />
          <em>{Ts.em || 'Più vicino. Su misura.'}</em>
        </p>
      </div>
    </div>
  );
}

// ───────── Origine ─────────
// Testo 2-col sticky + blocco immagine composita:
// Pull-quote a sinistra, vert1.jpg (calle Bolzano) a destra.
// Sotto: orizz3.jpeg (Bolzano Duomo) come ampia striscia orizzontale.

function Origine() {
  const lang = React.useContext(LangCtx);
  const To = (((window.VERTI_LANG || {})[lang] || {}).about || {}).origine || {};
  const titleParts = (To.title || 'Da Bolzano,\ncon metodo.').split('\n');
  const pullQuoteLines = (To.pullQuote || '"Il lavoro c\'è.\nLa qualità c\'è.\nManca la voce."').split('\n');
  return (
    <section className="section ah-section" id="origine">
      <div className="container">
        <div className="ah-two-col">
          <div className="ah-col-label">
            <FadeUp><span className="eyebrow">{To.eyebrow || '01 · Origine'}</span></FadeUp>
            <FadeUp delay={120}><h2 className="h2 ah-section-title">{titleParts[0]}<br />{titleParts[1]}</h2></FadeUp>
          </div>
          <div className="ah-col-text">
            <FadeUp delay={60}>
              <p className="ah-lead">{To.p1 || "Verti Studio nasce a Bolzano guardando una realtà che conosciamo bene: l'Alto Adige è una terra di lavoro serio, di imprenditoria autentica, di aziende che esistono da decenni e che hanno costruito reputazioni solide, quasi sempre senza il supporto di una presenza digitale efficace."}</p>
            </FadeUp>
            <FadeUp delay={180}>
              <p className="body-text ah-body-gap">{To.p2 || "Non lo diciamo per critica. Lo diciamo perché lo vediamo ogni giorno: artigiani straordinari con siti del 2009, ristoranti pieni di cui non si trova il menu online, studi professionali senza un biglietto da visita digitale che funzioni davvero."}</p>
            </FadeUp>
            <FadeUp delay={260}>
              <p className="body-text ah-body-gap">{To.p3 || "Il paradosso è che il lavoro c'è. La qualità c'è. Manca solo la voce giusta per raccontarlo nel momento in cui un cliente potenziale sta cercando esattamente quello che quella realtà sa fare meglio di chiunque altro."}</p>
            </FadeUp>
          </div>
        </div>

        <div className="ah-img-text-block">
          <div className="ah-img-text-left">
            <FadeUp delay={80}>
              <p className="ah-pull-quote">
                {pullQuoteLines.map((l, i) => <React.Fragment key={i}>{l}{i < pullQuoteLines.length - 1 && <br />}</React.Fragment>)}
              </p>
            </FadeUp>
            <FadeUp delay={220}>
              <p className="body-text" style={{ maxWidth: '30ch', marginTop: 32 }}>
                {To.p4 || "Essere presenti online non basta più. La domanda è quanto quella presenza rifletta davvero il valore di ciò che un'azienda ha costruito negli anni."}
              </p>
            </FadeUp>
          </div>
          <FadeUp delay={120} className="ah-img-text-right">
            <div className="ah-img-frame">
              <img src="assets/vert1.jpg" alt="Centro storico di Bolzano" className="ah-img-vertical" loading="lazy" decoding="async" />
              <div className="ah-img-caption">{To.imgCaption || 'Bolzano · centro storico'}</div>
            </div>
          </FadeUp>
        </div>

      </div>
    </section>
  );
}

// ───────── Filosofia ─────────
// Layout editoriale a righe: numero | titolo | testo.
// Aggiunta di vert4.jpeg come elemento visivo verticale nella sezione.

function Filosofia() {
  const lang = React.useContext(LangCtx);
  const Tf = (((window.VERTI_LANG || {})[lang] || {}).about || {}).filosofia || {};
  const pilastri = Tf.pilastri || [
    { n: '01', titolo: 'Chiarezza prima di tutto.', corpo: 'Un sito efficace non è complicato. È chiaro. Dice chi sei, cosa fai e perché qualcuno dovrebbe sceglierti, in meno tempo di quanto impieghi a fare una stretta di mano. Partiamo sempre da qui.' },
    { n: '02', titolo: 'Identità, non template.', corpo: "Ogni azienda ha una storia diversa. Il sito deve raccontarla, non nasconderla dietro un layout uguale a mille altri. Il digitale non snatura: amplifica quello che già funziona." },
    { n: '03', titolo: 'Strumento, non vetrina.', corpo: "Un sito non è un depliant online. È il tuo miglior commerciale: lavora 24 ore su 24, risponde a domande, costruisce fiducia, porta contatti. Progettiamo in quest'ottica, sempre." },
    { n: '04', titolo: 'Radici locali, standard globali.', corpo: "Conosciamo il tessuto imprenditoriale dell'Alto Adige. Sappiamo come comunicare a chi vive e lavora qui. E portiamo gli stessi standard di qualità che ci aspettiamo dai prodotti che usiamo ogni giorno." },
  ];
  const titleParts = (Tf.title || 'Il digitale\ncome lo vogliamo.').split('\n');

  // Breathing parallax on tall image (slow continuous scale)
  const breathRef = React.useRef(null);
  React.useEffect(() => {
    const el = breathRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let startTime = null;
    let rafId;
    const tick = (t) => {
      if (!startTime) startTime = t;
      const elapsed = (t - startTime) / 1000;
      // 10s period, max scale 1.05 — imperceptibly slow "breathing"
      const scale = 1 + 0.05 * (0.5 - 0.5 * Math.cos(elapsed * Math.PI / 5));
      el.style.transform = `scale(${scale.toFixed(5)})`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section className="section ah-section ah-dark" id="filosofia">
      <div className="container">
        <div className="ah-filosofia-layout">
          <div className="ah-filosofia-main">
            <div className="ah-section-header">
              <FadeUp><span className="eyebrow">{Tf.eyebrow || '02 · Filosofia'}</span></FadeUp>
              <FadeUp delay={120}><h2 className="h2 ah-section-title">{titleParts[0]}<br />{titleParts[1]}</h2></FadeUp>
              <FadeUp delay={220}>
                <p className="body-text" style={{ maxWidth: '44ch', marginTop: 24 }}>
                  {Tf.lead || "Non crediamo che il digitale debba essere complicato, costoso o lontano dalla realtà di chi lo usa ogni giorno."}
                </p>
              </FadeUp>
            </div>
            <div className="ah-pilastri">
              {pilastri.map((p, i) => (
                <FadeUp key={p.n} delay={i * 120}>
                  <div className="ah-pilastro">
                    <span className="ah-pilastro-num">{p.n}</span>
                    <h3 className="ah-pilastro-title">{p.titolo}</h3>
                    <p className="ah-pilastro-body">{p.corpo}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
          <FadeUp delay={200} className="ah-filosofia-img-col">
            <div className="ah-img-frame ah-img-frame--tall">
              <img ref={breathRef} src="assets/vert4.jpeg" alt="Alto Adige — paesaggio alpino" className="ah-img-tall" loading="lazy" decoding="async" style={{ transformOrigin: 'center center' }} />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ───────── Photo Strip ─────────
// Tre immagini verticali in striscia orizzontale — staggered reveal.
// Visivamente spezza il ritmo testuale e crea un momento puramente visivo.

function PhotoStrip() {
  const lang = React.useContext(LangCtx);
  const stripLabels = ((((window.VERTI_LANG || {})[lang] || {}).about || {}).photostrip || {}).labels || ['Dolomiti', 'Val Venosta', 'Sud Tirolo'];
  const photos = [
    { src: 'assets/vert3.jpeg', alt: 'Alto Adige · veduta alpina', label: stripLabels[0] },
    { src: 'assets/vert5.jpeg', alt: 'Alto Adige · paesaggio', label: stripLabels[1] },
    { src: 'assets/orizz2.jpeg', alt: 'Alto Adige · panorama', label: stripLabels[2] },
  ];

  const mq = typeof window !== 'undefined' ? window.matchMedia('(min-width: 641px)') : null;
  const [isWide, setIsWide] = React.useState(mq ? mq.matches : false);
  React.useEffect(() => {
    if (!mq) return;
    const handler = (e) => setIsWide(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="ah-photo-strip" style={isWide ? { overflow: 'visible' } : undefined}>
      {photos.map((p, i) => {
        const shouldRaise = isWide && (i === 0 || i === 2);
        return (
          <FadeUp key={p.src} delay={i * 120} className="ah-strip-item-wrap">
            <div style={shouldRaise ? { position: 'relative', top: '-100px' } : undefined}>
              <div className="ah-strip-item">
                {/* img 0 (vert3): soggetto nella parte bassa → 88%
                    img 1 (vert5): centrale, va bene così → center
                    img 2 (orizz2): soggetto nella parte bassa → 92% */}
                <img
                  src={p.src}
                  alt={p.alt}
                  className="ah-strip-img"
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: i === 0 ? 'center 88%' : i === 2 ? 'center 92%' : 'center center' }}
                />
                <div className="ah-strip-caption">{p.label}</div>
              </div>
            </div>
          </FadeUp>
        );
      })}
    </div>
  );
}

// ───────── Servizi ─────────
// Two-Column Typographic Split Index (desktop) / vertical stack (mobile)

function Servizi() {
  const lang = React.useContext(LangCtx);
  const Ts = (((window.VERTI_LANG || {})[lang] || {}).about || {}).serviziAbout || {};
  const servizi = Ts.items || [
    { tag: 'Web Design', label: 'Siti nuovi e redesign', desc: 'Progettiamo da zero o riprogettamo quelli esistenti. Design su misura, nessun template. Dal wireframe al lancio.' },
    { tag: 'UX / UI', label: 'Esperienza utente', desc: 'Analizziamo come le persone usano il tuo sito e ottimizziamo ogni punto di attrito. Meno abbandoni, più conversioni.' },
    { tag: 'Presenza digitale', label: 'Visibilità online', desc: 'SEO on-page, Google Business, profili social coordinati. Essere trovati da chi cerca esattamente quello che fai.' },
    { tag: 'Marketing', label: 'Comunicazione e contenuti', desc: 'Copy, immagini, struttura della comunicazione. Un messaggio coerente e riconoscibile su tutti i canali.' },
    { tag: 'AI & Automazioni', label: 'Processi automatizzati', desc: 'Chatbot, form intelligenti, integrazioni CRM. Strumenti che lavorano per te anche quando non puoi.' },
    { tag: 'Manutenzione', label: 'Cura continua', desc: 'Aggiornamenti, backup, monitoraggio prestazioni. Il sito non è un progetto finito: è un asset che va curato.' },
    { tag: 'Analytics', label: 'Dati e decisioni', desc: 'Setup analytics, lettura dei dati, report mensili. Capire cosa funziona e cosa no, con numeri reali.' },
  ];
  const titleParts = (Ts.title || 'Tutto ciò\ndi cui hai bisogno\nonline.').split('\n');
  const titleEm = Ts.titleEm || 'online.';
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [showSplit, setShowSplit] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const mqFine = window.matchMedia('(pointer: fine)');
    const check = () => setShowSplit(
      !!(window.Motion && window.Motion.motion && window.Motion.AnimatePresence) && mq.matches && mqFine.matches
    );
    check();
    mq.addEventListener('change', check);
    mqFine.addEventListener('change', check);
    return () => { mq.removeEventListener('change', check); mqFine.removeEventListener('change', check); };
  }, []);

  const activeService = servizi[activeIdx] || servizi[0];
  const indexStr = String(activeIdx + 1).padStart(2, '0');

  // Pre-build split body to avoid IIFE in JSX
  let splitBody;
  if (showSplit) {
    const M = window.Motion;
    const { motion: m, AnimatePresence } = M;
    splitBody = (
      <div className="ah-si-split">
        {/* Left — trigger list */}
        <div className="ah-si-triggers" role="list">
          {servizi.map((s, i) => {
            const isActive = activeIdx === i;
            return (
              <m.div
                key={s.tag}
                role="listitem"
                className="ah-si-trigger"
                onMouseEnter={() => setActiveIdx(i)}
                animate={{
                  opacity: isActive ? 1 : 0.28,
                  color: isActive ? '#c8b89a' : '#6e6c66',
                }}
                initial={false}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <m.span
                  className="ah-si-bullet"
                  aria-hidden="true"
                  animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -8 }}
                  initial={false}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >●</m.span>
                <span className="ah-si-tag-text">{s.tag}</span>
              </m.div>
            );
          })}
        </div>
        {/* Right — display canvas */}
        <div className="ah-si-canvas" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            <m.div
              key={activeIdx}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="ah-si-content"
            >
              <span className="ah-si-index">{indexStr}</span>
              <h3 className="ah-si-label">{activeService.label}</h3>
              <p className="ah-si-desc">{activeService.desc}</p>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    );
  } else {
    splitBody = (
      <div className="ah-si-mobile">
        {servizi.map((s, i) => (
          <FadeUp key={s.tag} delay={i * 60}>
            <div className="ah-si-mobile-item">
              <span className="ah-si-mobile-tag">{s.tag}</span>
              <h3 className="ah-si-mobile-label">{s.label}</h3>
              <p className="ah-si-mobile-desc">{s.desc}</p>
            </div>
          </FadeUp>
        ))}
      </div>
    );
  }

  return (
    <section className="section ah-section" id="servizi-about">
      <div className="container">
        <div className="ah-servizi-header-vflow">
          <FadeUp><span className="eyebrow">{Ts.eyebrow || '03 · Cosa facciamo'}</span></FadeUp>
          <FadeUp delay={120}>
            <h2 className="h2 ah-section-title ah-servizi-title-vflow">
              {titleParts.map((line, i) => (
                <React.Fragment key={i}>
                  {line === titleEm
                    ? <em className="ah-title-online">{line}</em>
                    : line}
                  {i < titleParts.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>
          </FadeUp>
          <FadeUp delay={220}>
            <p className="ah-servizi-lead-vflow">{Ts.lead || "Dalla prima riga di codice all'ultima analisi mensile. Seguiamo ogni aspetto della tua presenza digitale, così puoi concentrarti su quello che sai fare meglio."}</p>
          </FadeUp>
        </div>
        {splitBody}
      </div>
    </section>
  );
}

// ───────── Full-bleed ─────────
// orizz4.jpeg — foto orizzontale, non più vert2 (che era verticale e sgranava).
// Parallax GSAP + citazione sovrapposta.

function ImageMountain() {
  const imgRef = React.useRef(null);
  const sectionRef = React.useRef(null);

  React.useEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(imgRef.current, {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    return () => ScrollTrigger.getAll().filter(st => st.vars.trigger === sectionRef.current).forEach(st => st.kill());
  }, []);

  const lang = React.useContext(LangCtx);
  const Tt = (((window.VERTI_LANG || {})[lang] || {}).about || {}).territorio || {};
  const quoteLines = (Tt.quote || '"Il meglio di un territorio\nnon dovrebbe restare segreto."').split('\n');

  return (
    <div ref={sectionRef} className="ah-fullbleed">
      <div className="ah-fullbleed-img-wrap">
        <img ref={imgRef} src="assets/orizz4.jpeg" alt="Alto Adige — paesaggio alpino" className="ah-fullbleed-img" loading="lazy" decoding="async" />
        <div className="ah-fullbleed-overlay" aria-hidden="true" />
      </div>
      <div className="ah-fullbleed-content container">
        <FadeUp>
          <p className="ah-fullbleed-quote">
            {quoteLines.map((l, i) => <React.Fragment key={i}>{l}{i < quoteLines.length - 1 && <br />}</React.Fragment>)}
          </p>
        </FadeUp>
        <p className="ah-fullbleed-meta" aria-hidden="true">{Tt.quoteMeta || 'Alto Adige · Dolomiti'}</p>
      </div>
    </div>
  );
}

// ───────── Territorio ─────────

function Territorio() {
  const lang = React.useContext(LangCtx);
  const Tt = (((window.VERTI_LANG || {})[lang] || {}).about || {}).territorio || {};
  const titleParts = (Tt.title || "L'Alto Adige\nmerita di più.").split('\n');
  return (
    <section className="section ah-section" id="territorio">
      <div className="container">
        <div className="ah-two-col ah-two-col--reversed">
          <div className="ah-col-label">
            <FadeUp><span className="eyebrow">{Tt.eyebrow || '04 · Il territorio'}</span></FadeUp>
            <FadeUp delay={120}><h2 className="h2 ah-section-title">{titleParts[0]}<br />{titleParts[1]}</h2></FadeUp>
            <FadeUp delay={280}>
              <a href="index.html#contatti" className="btn" style={{ marginTop: 40, display: 'inline-flex' }}>
                <span>{Tt.cta || 'Parliamo del tuo progetto'}</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </a>
            </FadeUp>
          </div>
          <div className="ah-col-text">
            <FadeUp delay={60}>
              <p className="ah-lead">{Tt.p1 || "L'Alto Adige è una delle regioni con la più alta concentrazione di eccellenze artigianali e produttive d'Italia. Eppure, digitalmente, molte di queste realtà restano invisibili o rappresentate in modo inadeguato."}</p>
            </FadeUp>
            <FadeUp delay={160}>
              <p className="body-text ah-body-gap">{Tt.p2 || "Il turista che cerca un agriturismo, il cliente che vuole contattare un fornitore locale, il professionista che cerca uno studio in zona: tutti passano prima da Google. Se non sei lì, con qualcosa che funziona davvero, non esisti per loro."}</p>
            </FadeUp>
            <FadeUp delay={240}>
              <p className="body-text ah-body-gap">{Tt.p3 || "Non vogliamo omologare le aziende locali a un modello standard. Vogliamo dare loro una voce digitale che sia all'altezza di chi sono: precisa, autentica, riconoscibile. Una presenza che vale quanto il loro lavoro."}</p>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────── Numeri ─────────

function Numeri() {
  const lang = React.useContext(LangCtx);
  const Tn = (((window.VERTI_LANG || {})[lang] || {}).about || {}).numeri || {};
  const dati = Tn.items || [
    { n: 14, suf: 'gg', label: 'Dal brief al lancio, mediamente.' },
    { n: 100, suf: '%', label: 'Progetti seguiti internamente, senza outsourcing.' },
    { n: 0, suf: '', label: 'Template generici usati. Ogni sito è costruito da zero.' },
  ];
  return (
    <section className="section ah-section ah-dark">
      <div className="container">
        <div className="ah-numeri">
          {dati.map((d, i) => (
            <FadeUp key={i} delay={i * 100}>
              <div className="ah-numero">
                <span className="ah-numero-val"><Counter to={d.n} />{d.suf}</span>
                <p className="ah-numero-label">{d.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────── CTA finale ─────────

function CTAFinale() {
  const lang = React.useContext(LangCtx);
  const Tcf = (((window.VERTI_LANG || {})[lang] || {}).about || {}).ctaFinale || {};
  return (
    <section className="ah-cta-finale">
      <div className="container">
        <FadeUp><span className="eyebrow">{Tcf.eyebrow || 'Iniziamo'}</span></FadeUp>
        <FadeUp delay={120}>
          <p className="ah-cta-title">
            {Tcf.titleA || 'Raccontaci il tuo progetto.'}<br />
            <em>{Tcf.titleEm || 'Troveremo insieme la soluzione giusta.'}</em>
          </p>
        </FadeUp>
        <FadeUp delay={280}>
          <a href="index.html#contatti" className="btn">
            <span>{Tcf.cta || 'Scrivici ora'}</span>
            <span className="btn-arrow" aria-hidden="true">→</span>
          </a>
        </FadeUp>
      </div>
    </section>
  );
}

// ───────── Footer (identico all'homepage) ─────────

function Footer() {
  const lang = React.useContext(LangCtx);
  const Tf = (((window.VERTI_LANG || {})[lang] || {}).home || {}).footer || {};
  const sectors = Tf.sectors || ['Ristorazione', 'Artigianato', 'Professioni', 'Retail locale', 'Hospitality alpina', 'Studi tecnici', 'Atelier', 'Manifattura'];
  const links = Tf.links || {};
  return (
    <footer className="footer">
      <div className="footer-marquee">
        <div className="footer-marquee-track">
          <span>{sectors.join(' · ')}</span>
          <span>{sectors.join(' · ')}</span>
        </div>
      </div>
      <div className="footer-grid">
        <div className="footer-col">
          <div className="footer-brand-mark">
            <svg viewBox="0 0 64 64" width="28" height="28" fill="none" aria-hidden="true" style={{ color: 'var(--neve)' }}>
              <path d="M4 50 L18 26 L26 36 L40 18 L60 50" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>
              <path d="M4 56 L24 36 L34 44 L48 28 L60 56" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinejoin="round" strokeLinecap="round" opacity="0.55"/>
              <path d="M40 18 L42 22" stroke="#c8b89a" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="footer-brand-pillar"></span>
            <span className="footer-brand-name">
              <span className="footer-brand-serif">Verti</span>
              <span className="footer-brand-caps">Studio</span>
            </span>
          </div>
          <p className="footer-tagline">{Tf.tagline || 'Founded in the Alps. Presenza digitale costruita per durare. Bolzano, Alto Adige.'}</p>
        </div>
        <div className="footer-col">
          <h4>{Tf.colStudio || 'Studio'}</h4>
          <ul>
            <li><a href="index.html#metodo">{links.metodo || 'Metodo'}</a></li>
            <li><a href="index.html#servizi">{links.servizi || 'Servizi'}</a></li>
            <li><a href="index.html#lavori">{links.lavori || 'Lavori'}</a></li>
            <li><a href="index.html#mantenimento">{links.cura || 'Verti Care'}</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{Tf.colServizi || 'Servizi'}</h4>
          <ul>
            <li><a href="index.html#servizi">{links.analisiSito || 'Analisi sito'}</a></li>
            <li><a href="index.html#servizi">{links.webDesign || 'Web design'}</a></li>
            <li><a href="index.html#mantenimento">{links.mantenimento || 'Mantenimento'}</a></li>
            <li><a href="index.html#servizi">{links.automazione || 'Automazione'}</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{Tf.colContatti || 'Contatti'}</h4>
          <ul>
            <li><a href="mailto:info@vertistudio.com">info@vertistudio.com</a></li>
            <li><a href="tel:+393391711000">+39 339 1711000</a></li>
            <li><a href="#">Linkedin</a></li>
            <li><a href="#">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Verti Studio</span>
        <span>46.4983° N · 11.3548° E · Bolzano</span>
      </div>
    </footer>
  );
}

// ───────── Global UI: Spotlight + Custom Cursor ─────────

function SpotlightEffect() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0, px = window.innerWidth / 2, py = window.innerHeight / 2;
    const paint = () => {
      el.style.background = `radial-gradient(90px circle at ${px}px ${py}px, rgba(200,184,154,0.09) 0%, rgba(200,184,154,0.04) 55%, transparent 100%)`;
      raf = 0;
    };
    const onMove = (e) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(paint); };
    paint();
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="spotlight-effect" aria-hidden="true" />;
}

function CustomCursor() {
  React.useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.body.classList.add('cursor-active');
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my, raf = null;
    const startLoop = () => { if (raf) return; raf = requestAnimationFrame(tick); };
    const tick = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      if (dot) dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      if (ring) ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      if ((mx - rx) ** 2 + (my - ry) ** 2 > 0.01) { raf = requestAnimationFrame(tick); } else { raf = null; }
    };
    const onMove = (e) => { mx = e.clientX; my = e.clientY; startLoop(); };
    window.addEventListener('mousemove', onMove);
    startLoop();
    const onEnter = () => document.body.classList.add('hovering');
    const onLeave = () => document.body.classList.remove('hovering');
    const targets = document.querySelectorAll('a, button');
    targets.forEach(t => { t.addEventListener('mouseenter', onEnter); t.addEventListener('mouseleave', onLeave); });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
      targets.forEach(t => { t.removeEventListener('mouseenter', onEnter); t.removeEventListener('mouseleave', onLeave); });
      document.body.classList.remove('cursor-active', 'hovering');
    };
  }, []);
  return (<><div className="cursor-ring"></div><div className="cursor-dot"></div></>);
}

// ───────── App ─────────

function AboutApp() {
  const scrollY = useScrollY();
  const [lang, setLang] = useLang();

  React.useEffect(() => {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;
    const update = () => {
      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      const p = totalH > 0 ? Math.min(window.scrollY / totalH, 1) : 0;
      progressBar.style.transform = `scaleX(${p})`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  React.useEffect(() => {
    console.log(
      '%c Verti Studio %c\n%cFounded in the Alps. Bolzano, Alto Adige.\ninfo@vertistudio.com',
      'background:#c8b89a;color:#0a0a0a;padding:4px 12px;font-weight:bold;',
      '',
      'color:#c8b89a;font-size:11px;'
    );
  }, []);

  return (
    <LangCtx.Provider value={lang}>
      <CustomCursor />
      <SpotlightEffect />
      <div className="scroll-progress" aria-hidden="true" />
      <a href="#origine" className="skip-link">Vai al contenuto</a>
      <Nav scrollY={scrollY} setLang={setLang} />
      <AboutHero />
      <Statement />
      <Origine />
      <Filosofia />
      <PhotoStrip />
      <Servizi />
      <ImageMountain />
      <Territorio />
      <Numeri />
      <CTAFinale />
      <Footer />
    </LangCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(AboutApp));
