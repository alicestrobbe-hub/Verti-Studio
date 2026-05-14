// app.jsx — Verti Studio homepage

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headline": "problema",
  "fontPair": "cormorant-inter",
  "animLevel": "full",
  "accentStrength": 1,
  "showCursor": true
}/*EDITMODE-END*/;

const HEADLINES = {
  "problema": {
    eyebrow: "Bolzano · Alto Adige",
    title: <>La tua azienda merita di essere <em>trovata.</em></>,
    sub: "Costruiamo la tua presenza digitale da zero o la facciamo finalmente funzionare."
  },
  "soluzione": {
    eyebrow: "Bolzano · Alto Adige",
    title: <>Presenza digitale costruita per <em>durare</em>.</>,
    sub: "Siti che vendono, non template. Analisi reale. Design intenzionale. Risultato misurabile."
  }
};

const FONT_PAIRS = {
  "cormorant-inter":   { display: "'Cormorant Garamond', Georgia, serif", body: "'Inter', system-ui, sans-serif" },
  "playfair-inter":    { display: "'Playfair Display', Georgia, serif", body: "'Inter', system-ui, sans-serif" },
  "cormorant-helvetica":{ display: "'Cormorant Garamond', Georgia, serif", body: "'Helvetica Neue', system-ui, sans-serif" }
};

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

// ───────── Hooks ─────────

function useScrollY() {
  const [y, setY] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { setY(window.scrollY); raf = 0; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return y;
}

function useInView(options = {}) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.2, ...options });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeUp({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`fade-up ${className} ${inView ? 'in' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function LineReveal({ children, delay = 0, tag: Tag = 'div', className = '' }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal-line${inView ? ' in' : ''}${className ? ' ' + className : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span>{children}</span>
    </Tag>
  );
}

function Counter({ to, duration = 1800, suffix = "", prefix = "" }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

// ───────── Spotlight Effect (mouse flashlight) ─────────

function SpotlightEffect() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    const paint = () => {
      el.style.background = `radial-gradient(90px circle at ${px}px ${py}px, rgba(200,184,154,0.09) 0%, rgba(200,184,154,0.04) 55%, transparent 100%)`;
      raf = 0;
    };
    const onMove = (e) => {
      px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} className="spotlight-effect" aria-hidden="true" />;
}

// ───────── Custom cursor ─────────

function CustomCursor({ enabled }) {
  React.useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('cursor-active', 'hovering');
      return;
    }
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.body.classList.add('cursor-active');

    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mx = window.innerWidth/2, my = window.innerHeight/2;
    let rx = mx, ry = my;
    let raf = null;
    let moving = false;

    const startLoop = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (dot) dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      const dx = mx - rx, dy = my - ry;
      if (dx * dx + dy * dy > 0.01) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };

    const onMove = (e) => { mx = e.clientX; my = e.clientY; startLoop(); };
    window.addEventListener('mousemove', onMove);

    startLoop();

    const onEnter = () => document.body.classList.add('hovering');
    const onLeave = () => document.body.classList.remove('hovering');
    const targets = document.querySelectorAll('a, button, .case, .metodo-step, .channel, .calendar-day, .calendar-time');
    targets.forEach(t => {
      t.addEventListener('mouseenter', onEnter);
      t.addEventListener('mouseleave', onLeave);
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
      targets.forEach(t => {
        t.removeEventListener('mouseenter', onEnter);
        t.removeEventListener('mouseleave', onLeave);
      });
      document.body.classList.remove('cursor-active', 'hovering');
    };
  }, [enabled]);
  return (
    <>
      <div className="cursor-ring"></div>
      <div className="cursor-dot"></div>
    </>
  );
}

// ───────── Tilt 3D ─────────

function useTilt(maxRotate = 4) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let rafId = 0, cx = 0, cy = 0;
    const onMove = (e) => {
      cx = e.clientX; cy = e.clientY;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        if (document.body.classList.contains('anim-soft')) { el.style.transform = ''; rafId = 0; return; }
        const r = el.getBoundingClientRect();
        const x = (cx - r.left) / r.width - 0.5;
        const y = (cy - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateX(${-y * maxRotate}deg) rotateY(${x * maxRotate}deg) translateZ(4px)`;
        rafId = 0;
      });
    };
    const onLeave = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      el.style.transform = '';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [maxRotate]);
  return ref;
}

// ───────── Splash screen ─────────

function shouldShowSplash() {
  try {
    const navType = (performance.getEntriesByType('navigation')[0] || {}).type || 'navigate';
    if (navType === 'reload') return true;
    if (sessionStorage.getItem('vs-splash-done')) return false;
    return true;
  } catch (e) {
    return !sessionStorage.getItem('vs-splash-done');
  }
}

function SplashScreen({ visible }) {
  return (
    <div className={`splash${visible ? '' : ' splash-out'}`} role="status" aria-label="Caricamento Verti Studio">
      <svg className="splash-logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 200" aria-hidden="true">
        <g transform="translate(20 56) scale(1.35)">
          <path className="vs-peak vs-peak-1" d="M4 50 L18 26 L26 36 L40 18 L60 50" fill="none" stroke="#e8e4dc" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"/>
          <path className="vs-peak vs-peak-2" d="M4 56 L24 36 L34 44 L48 28 L60 56" fill="none" stroke="#e8e4dc" strokeWidth="1.0" strokeLinejoin="round" strokeLinecap="round" opacity="0.55"/>
          <path className="vs-peak-tip" d="M40 18 L42 22" stroke="#c8b89a" strokeWidth="1.4" strokeLinecap="round"/>
        </g>
        <line className="vs-asta" x1="138" y1="46" x2="138" y2="154" stroke="#c8b89a" strokeWidth="1"/>
        <text className="vs-splash-verti" x="160" y="118" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="300" fontSize="78" fill="#e8e4dc" letterSpacing="-1">Verti</text>
        <text className="vs-splash-studio" x="160" y="142" fontFamily="'Inter', system-ui, sans-serif" fontWeight="300" fontSize="13" fill="#e8e4dc" letterSpacing="4.2" opacity="0.78">STUDIO</text>
        <text className="vs-splash-coord" x="160" y="166" fontFamily="'Inter', system-ui, sans-serif" fontWeight="300" fontSize="10" fill="#e8e4dc" letterSpacing="2.8" opacity="0.55">46.4983° N · 11.3548° E</text>
      </svg>
      <div className="splash-progress" aria-hidden="true">
        <div className="splash-progress-fill"></div>
      </div>
    </div>
  );
}

// ───────── Sections ─────────

// Scroll a una sezione nel sistema custom GSAP (content-inner translateY)
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const ZOOM_PX = window.innerHeight * 2.2;
  const navH = 80;
  window.scrollTo({ top: ZOOM_PX + el.offsetTop - navH, behavior: 'smooth' });
}

function Nav({ scrollY, setLang }) {
  const scrolled = scrollY > 80;
  const [open, setOpen] = React.useState(false);
  const hamburgerRef = React.useRef(null);
  const overlayRef = React.useRef(null);

  // Body scroll lock
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Focus management
  React.useEffect(() => {
    if (open) {
      const first = overlayRef.current?.querySelector('.nav-overlay-link');
      if (first) setTimeout(() => first.focus(), 80);
    } else {
      hamburgerRef.current?.focus();
    }
  }, [open]);

  // Escape closes menu
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const lang = React.useContext(LangCtx);
  const T = (window.VERTI_LANG || {})[lang] || {};
  const tn = T.nav || {};
  const close = () => setOpen(false);
  const links = [
    ['#metodo', tn.metodo || 'Metodo'],
    ['#servizi', tn.servizi || 'Servizi'],
    ['#lavori', tn.lavori || 'Lavori'],
    ['#mantenimento', tn.cura || 'Cura'],
    ['pricing.html', tn.investimento || 'Investimento'],
    ['about.html', tn.chiSiamo || 'Chi siamo'],
    ['#contatti', tn.contatti || 'Contatti'],
  ];

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <a href="#" className="nav-brand" aria-label="Verti Studio — home">
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
        <ul className="nav-links">
          {links.map(([href, label]) => (
            <li key={href}>
              <a
                href={href}
                onClick={href.startsWith('#') ? (e) => { e.preventDefault(); scrollToSection(href.slice(1)); close(); } : undefined}
              >{label}</a>
            </li>
          ))}
        </ul>
        <LangSwitcher setLang={setLang} />
        <button
          ref={hamburgerRef}
          className={`nav-hamburger${open ? ' open' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label={open ? (tn.chiudiMenu || 'Chiudi menu') : (tn.apriMenu || 'Apri menu')}
          aria-expanded={open}
          aria-controls="nav-overlay"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      <div
        ref={overlayRef}
        id="nav-overlay"
        className={`nav-overlay${open ? ' open' : ''}`}
        aria-hidden={!open}
        role="dialog"
        aria-label="Menu di navigazione"
        onClick={close}
      >
        <nav className="nav-overlay-inner" onClick={(e) => e.stopPropagation()}>
          {links.map(([href, label], i) => (
            <a
              key={href}
              href={href}
              className="nav-overlay-link"
              style={{ '--i': i }}
              onClick={href.startsWith('#') ? (e) => { e.preventDefault(); close(); scrollToSection(href.slice(1)); } : close}
            >
              {label}
            </a>
          ))}
          <LangSwitcher setLang={setLang} />
        </nav>
        <div className="nav-overlay-meta">46.4983° N · 11.3548° E · Bolzano</div>
      </div>
    </>
  );
}

// Sfondo fisso: video in loop + overlay.
function Hero() {
  return (
    <div id="bg-layer">
      <div className="hero-bg" id="hero-bg">
        <video className="hero-bg-img" autoPlay muted loop playsInline>
          <source src="assets/homepageWP.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-overlay"></div>
    </div>
  );
}

// Testo iniziale — prima sezione del foglio scorrevole (#content-inner).
// Durante lo zoom rimane fermo; poi scorre verso l'alto insieme al resto del sito.
function HeroText({ headline }) {
  const lang = React.useContext(LangCtx);
  const T = ((window.VERTI_LANG || {})[lang] || {}).home || {};
  const hl = (T.headlines || {})[headline] || HEADLINES[headline] || {};
  const eyebrow = hl.eyebrow || '';
  const titleA = hl.titleA !== undefined ? hl.titleA : '';
  const titleEm = hl.titleEm || '';
  const titleB = hl.titleB !== undefined ? hl.titleB : '';
  const sub = hl.sub || '';
  return (
    <div className="hero-text-section">
      <div className="hero-founded">
        <span>Founded in the Alps · MMXXVI</span>
      </div>
      <div className="hero-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '128px' }}>
        <FadeUp delay={300} className="hero-eyebrow">
          <span className="eyebrow">{eyebrow}</span>
        </FadeUp>
        <h1 className={`hero-title${lang === 'de' ? ' hero-title--de' : ''}`} style={{ fontSize: 'clamp(64px, 8vw, 96px)', maxWidth: '960px' }}>
          <FadeUp delay={600}>{titleA}<em>{titleEm}</em>{titleB}</FadeUp>
        </h1>
        <FadeUp delay={1000} className="hero-sub" style={{ maxWidth: '560px' }}>
          <p className="subtitle">{sub}</p>
        </FadeUp>
        <FadeUp delay={1150}>
          <div className="hero-services" aria-label="Servizi principali" style={{ justifyContent: 'center' }}>
            {(T.heroServices || ['Web design', 'UX / UI', 'Marketing', 'AI & Automazioni', 'Analytics']).map((s) => (
              <span key={s} className="hero-service-tag">{s}</span>
            ))}
          </div>
        </FadeUp>
        <FadeUp delay={1300}>
          <a href="#contatti" className="btn">
            <span>{T.heroCta || 'Parliamo del tuo progetto'}</span>
            <span className="btn-arrow" aria-hidden="true">→</span>
          </a>
        </FadeUp>
      </div>
      <FadeUp delay={1300}>
        <div className="hero-vline" style={{ height: 100 }}></div>
      </FadeUp>
      <div className="hero-meta">
        <div><strong>46.4983° N</strong></div>
        <div><strong>11.3548° E</strong></div>
        <div style={{ marginTop: 8 }}>MMXXVI</div>
      </div>
      <div className="scroll-hint">
        <span>{T.scrollHint || 'scorri'}</span>
        <span className="scroll-hint-line"></span>
      </div>
    </div>
  );
}

// ── MagneticStat: requires window.Motion — only rendered when available ──
function MagneticStat({ data, idx, isHovered, anyHovered, onHover, onLeave, inView, sourceLabel }) {
  const { motion, AnimatePresence } = window.Motion;

  return (
    <motion.div
      className={`fact-magnetic fact-magnetic--${idx + 1}${isHovered ? ' active' : ''}${anyHovered && !isHovered ? ' dimmed' : ''}`}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 1.1, delay: idx * 0.18, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ position: 'relative', overflow: 'visible' }}
    >
      {/* Stable anchor: rank + number — non si sposta mai, il testo hover emerge sotto in absolute */}
      <div className="fact-mag-anchor" style={{ position: 'relative' }}>
        <span className="fact-mag-rank">— {data.rank}</span>
        <motion.div
          className="fact-mag-num"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          initial={false}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'left bottom', display: 'block' }}
        >
          {inView && <Counter to={data.big} />}<em className="fact-mag-small">{data.small}</em>
        </motion.div>
      </div>
      {/* Description: always in flow BELOW anchor, reveals downward without shifting number */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            key="body"
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="fact-mag-content"
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, paddingTop: '28px', zIndex: 10 }}
          >
            <h3 className="fact-mag-title">{data.title}</h3>
            <p className="fact-mag-body">{data.body}</p>
            <span className="fact-mag-source">{sourceLabel || 'Fonte'} · {data.source}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Facts() {
  const lang = React.useContext(LangCtx);
  const Tf = (((window.VERTI_LANG || {})[lang] || {}).home || {}).facts || {};
  const items = Tf.items || [
    { rank: '01', big: 94, small: '%', title: 'I primi tre secondi decidono tutto.', body: "Il 94% delle prime impressioni di un sito è legato al design. Non al testo, non all'offerta. Al modo in cui appare nei primi istanti.", source: 'Stanford Web Credibility' },
    { rank: '02', big: 3, small: 'su 4', title: 'Il design è il tuo primo commerciale.', body: "Tre clienti su quattro giudicano la credibilità di un'azienda guardando solo il sito. Prima ancora di sapere chi sei, hanno deciso se fidarsi.", source: 'Studio Northumbria University' },
    { rank: '03', big: 9900, small: '%', title: 'Cento euro per ogni euro investito in UX.', body: "Ogni euro speso in user experience ne restituisce cento. Non è marketing: è la matematica che separa chi cresce da chi paga advertising per compensare un sito che non converte.", source: 'Forrester Research' },
  ];

  const sectionRef = React.useRef(null);
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  const [inView, setInView] = React.useState(false);
  const [showCanvas, setShowCanvas] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    const mqWide = window.matchMedia('(min-width: 769px)');
    const mqFine = window.matchMedia('(pointer: fine)');
    const check = () => setShowCanvas(
      !!(window.Motion && window.Motion.motion) && mqWide.matches && mqFine.matches
    );
    check();
    mqWide.addEventListener('change', check);
    mqFine.addEventListener('change', check);
    return () => { mqWide.removeEventListener('change', check); mqFine.removeEventListener('change', check); };
  }, []);

  const tp = Tf.titleParts || {};
  const srcLabel = Tf.sourceLabel;

  return (
    <section className="section facts" id="facts" ref={sectionRef}>
      <div className="container">
        <div className="facts-split">

          {/* ── Left: Sticky Intro Column ── */}
          <div className="facts-split-intro">
            <FadeUp>
              <span className="eyebrow">{Tf.sectionLabel || Tf.eyebrow}</span>
            </FadeUp>
            <FadeUp delay={100}>
              <h2 className="facts-split-title">
                {tp.before || ''}<em>{tp.italic || ''}</em>{tp.after || (!tp.before && (Tf.eyebrow || ''))}
              </h2>
            </FadeUp>
            <FadeUp delay={200}>
              <p className="facts-split-body">{Tf.quote}</p>
            </FadeUp>
          </div>

          {/* ── Right: Asymmetric Canvas or Mobile Stack ── */}
          {showCanvas ? (
            <div className="facts-canvas">
              <div
                className="facts-canvas-dim"
                aria-hidden="true"
                style={{ opacity: hoveredIdx !== null ? 1 : 0 }}
              />
              {items.map((f, i) => (
                <MagneticStat
                  key={f.rank}
                  data={f}
                  idx={i}
                  isHovered={hoveredIdx === i}
                  anyHovered={hoveredIdx !== null}
                  onHover={() => setHoveredIdx(i)}
                  onLeave={() => setHoveredIdx(null)}
                  inView={inView}
                  sourceLabel={srcLabel}
                />
              ))}
            </div>
          ) : (
            // ── Mobile / no-motion fallback: clean vertical stack ──
            <div className="facts-mobile-stack">
              {items.map((f, i) => (
                <div key={f.rank} className="fact-mobile-item">
                  <span className="fact-mob-rank">— {f.rank}</span>
                  <div className="fact-mob-num">
                    {inView && <Counter to={f.big} />}<em>{f.small}</em>
                  </div>
                  <div className="fact-mob-content">
                    <h3 className="fact-mob-title">{f.title}</h3>
                    <p className="fact-mob-body">{f.body}</p>
                    <span className="fact-mob-source">{srcLabel || 'Fonte'} · {f.source}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Problema() {
  const lang = React.useContext(LangCtx);
  const Tp = (((window.VERTI_LANG || {})[lang] || {}).home || {}).problema || {};
  const items = Tp.items || [
    { n: '01', display: "Il traffico c'è. Le richieste no.", body: 'Visite alte, conversioni piatte. La perdita avviene tra il primo scroll e il primo bottone, ed è invisibile finché non la misuri.' },
    { n: '02', display: 'I clienti arrivano solo dal passaparola.', body: "Il sito non ha mai generato un nuovo contatto. È un biglietto da visita digitale, non un canale commerciale." },
    { n: '03', display: 'Lo guardi e ti sembra datato.', body: 'Senti che non rappresenta più il livello del tuo lavoro. Ma non sai cosa cambiare, né a chi affidarti senza spendere male.' },
    { n: '04', display: 'Hai investito. Il ritorno non si misura.', body: "Hai pagato un sito anni fa. Funziona? Converte? Senza dati non c'è risposta. Solo il sospetto che qualcosa non torni." },
  ];

  const footerMessages = Tp.footerMessages || [
    "Nessuno per ora. Buon segno — ma vale la pena una verifica.",
    "Una corrispondenza. Una diagnosi mirata è il punto di partenza.",
    "Più di un punto in comune. È il momento di un audit completo.",
    "Più di un punto in comune. È il momento di un audit completo.",
    "Quattro su quattro. Iniziamo subito — 20 minuti, gratis.",
  ];

  const [selected, setSelected] = React.useState(new Set());
  const [animKey, setAnimKey] = React.useState(0);

  const toggle = (n) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
    setAnimKey(k => k + 1);
  };

  const count = selected.size;
  const titleParts = (Tp.title || 'Quattro sintomi.\nRiconoscine uno.').split('\n');

  return (
    <section className="section problema" id="problema">
      <div className="container">
        <div className="problema-layout">
          <div className="problema-intro">
            <div className="problema-intro-titles">
              <FadeUp><span className="eyebrow">{Tp.eyebrow || 'Sezione 01 · Diagnosi'}</span></FadeUp>
              <LineReveal delay={120} tag="h2" className="h2">{titleParts[0]}</LineReveal>
              <LineReveal delay={240} tag="h2" className="h2 h2--italic">{titleParts[1]}</LineReveal>
            </div>
            <div className="problema-intro-lead">
              <FadeUp delay={240}>
                <p className="body-text">{Tp.lead || 'Prima di proporre una soluzione, identifichiamo il problema. La maggior parte dei siti non converte per ragioni precise e ricorrenti. Tocca quelli che ti somigliano — il risultato cambia.'}</p>
              </FadeUp>
            </div>
          </div>

          <div className="problema-cards-wrap">
            <p className="problema-hint">
              <span className="problema-hint-box" aria-hidden="true" />
              {Tp.hintText || 'Seleziona i sintomi in cui ti riconosci'}
            </p>
            <div className="problema-cards">
              {items.map((it, i) => {
                const isSelected = selected.has(it.n);
                return (
                  <FadeUp key={it.n} delay={i * 80}>
                    <button
                      className={`problema-card${isSelected ? ' selected' : ''}`}
                      onClick={() => toggle(it.n)}
                      aria-pressed={isSelected}
                    >
                      <div className="problema-card-top">
                        <span className="problema-card-num">— {it.n}</span>
                        <span className={`problema-card-check${isSelected ? ' visible' : ''}`} aria-hidden="true">
                          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                            <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                      <div className="problema-card-title">{it.display}</div>
                      <p className="problema-card-body">{it.body}</p>
                    </button>
                  </FadeUp>
                );
              })}
            </div>

            <div className="problema-footer">
              <div className="problema-footer-count">
                <span className="problema-footer-num" key={`n-${animKey}`}>{count}</span>
                <span className="problema-footer-total">/ 4 {Tp.footerLabel || 'sintomi'}</span>
              </div>
              <div className="problema-footer-msg">
                <span className="problema-footer-text" key={`m-${animKey}`}>
                  {footerMessages[count]}
                </span>
              </div>
              <a href="#contatti" className="btn problema-footer-cta">
                <span>{Tp.footerCta || 'Prenota audit'}</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metodo() {
  const lang = React.useContext(LangCtx);
  const Tm = (((window.VERTI_LANG || {})[lang] || {}).home || {}).metodo || {};
  const steps = Tm.steps || [
    { n: '01', t: 'Analisi', d: 'Audit completo del sito esistente: UX, comunicazione, conversione. Report dettagliato con i tre punti che ti stanno costando di più.', time: '24 ORE' },
    { n: '02', t: 'Proposta', d: 'Documento di strategia con priorità, perimetro e tempi. Trasparente sui trade-off, mai un preventivo opaco.', time: '3 GIORNI' },
    { n: '03', t: 'Sviluppo', d: 'Design e build in iterazioni con feedback continuo. Il tuo input guida le decisioni, non un mockup statico.', time: '1 SETTIMANA' },
    { n: '04', t: 'Lancio', d: "Pubblicazione, monitoraggio analytics, affiancamento iniziale. Online in meno di due settimane.", time: '< 14 GIORNI' },
  ];

  const [activeStep, setActiveStep] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const timelineRef = React.useRef(null);

  const getStepFromX = React.useCallback((clientX) => {
    const el = timelineRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return Math.min(steps.length - 1, Math.max(0, Math.round((x / rect.width) * (steps.length - 1))));
  }, [steps.length]);

  React.useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      setActiveStep(getStepFromX(cx));
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, getStepFromX]);

  const progressPct = steps.length > 1 ? (activeStep / (steps.length - 1)) * 100 : 0;
  const titleParts = (Tm.title || 'Quattro passi.\nMeno di due settimane.').split('\n');

  return (
    <section className="section metodo" id="metodo">
      <div className="container">
        <div className="metodo-header">
          <div className="metodo-header-left">
            <FadeUp><span className="eyebrow">{Tm.eyebrow || 'Sezione 02 · Metodo'}</span></FadeUp>
            <div style={{ marginTop: 24 }}>
              <LineReveal delay={120} tag="h2" className="h2">{titleParts[0]}</LineReveal>
              <LineReveal delay={240} tag="h2" className="h2 h2--italic">{titleParts[1]}</LineReveal>
            </div>
          </div>
          <FadeUp delay={180} className="metodo-header-right">
            <p className="body-text">{Tm.lead || 'Niente cicli di review infiniti. Un processo chirurgico, calibrato sulle PMI: ogni tappa ha un esito, un tempo, una persona responsabile.'}</p>
          </FadeUp>
        </div>

        <div className="metodo-ticker">
          {(Tm.tickerItems || [
            { num: 24, unit: 'h', label: 'audit' },
            { num: 3, unit: 'gg', label: 'proposta' },
            { num: 14, unit: 'gg', label: 'lancio' },
          ]).map((item, i, arr) => (
            <React.Fragment key={i}>
              <span className="metodo-ticker-item">
                <span className="metodo-ticker-num"><Counter to={item.num} />{item.unit}</span>
                <span className="metodo-ticker-label">{item.label}</span>
              </span>
              {i < arr.length - 1 && <span className="metodo-ticker-sep" aria-hidden="true">·</span>}
            </React.Fragment>
          ))}
        </div>

        <FadeUp delay={300}>
          <div className="metodo-timeline-wrap">
            {!hasInteracted && (
              <div className="metodo-drag-hint" aria-hidden="true">
                <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
                  <path d="M1 6H27M1 6L5 2.5M1 6L5 9.5M27 6L23 2.5M27 6L23 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>trascina</span>
              </div>
            )}
            <div
              className={`metodo-timeline-rail${isDragging ? ' dragging' : ''}`}
              ref={timelineRef}
              onClick={(e) => { if (!hasInteracted) setHasInteracted(true); setActiveStep(getStepFromX(e.clientX)); }}
              onMouseDown={(e) => { if (!hasInteracted) setHasInteracted(true); setIsDragging(true); setActiveStep(getStepFromX(e.clientX)); }}
              onTouchStart={(e) => { if (!hasInteracted) setHasInteracted(true); setIsDragging(true); setActiveStep(getStepFromX(e.touches[0].clientX)); }}
              role="slider"
              aria-label="Seleziona fase del processo"
              aria-valuemin={0}
              aria-valuemax={steps.length - 1}
              aria-valuenow={activeStep}
            >
              <div className="metodo-timeline-fill" style={{ width: `${progressPct}%` }} />
              {steps.map((s, i) => {
                const pct = (i / (steps.length - 1)) * 100;
                return (
                  <button
                    key={s.n}
                    className={`metodo-timeline-dot${activeStep === i ? ' active' : ''}`}
                    style={{ left: `${pct}%` }}
                    onClick={(e) => { e.stopPropagation(); setActiveStep(i); }}
                    aria-label={`Passo ${s.n}: ${s.t}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" className="metodo-diamond">
                      <path d="M5 0L10 5L5 10L0 5Z" fill="currentColor"/>
                    </svg>
                  </button>
                );
              })}
              <div
                className={`metodo-timeline-cursor${isDragging ? ' dragging' : ''}`}
                style={{ left: `${progressPct}%` }}
                aria-hidden="true"
              />
            </div>

            <div className="metodo-steps">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className={`metodo-step${activeStep === i ? ' active' : ''}`}
                  onClick={() => setActiveStep(i)}
                >
                  <span className="metodo-step-num">PASSO {s.n}</span>
                  <div className="metodo-step-title">{s.t}</div>
                  <p className="metodo-step-desc">{s.d}</p>
                  <span className="metodo-step-time">{s.time}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        <div className="testimonial-inline" style={{ marginTop: 80 }}>
          <FadeUp>
            <blockquote>{Tm.testimonial || '"Il tasso di contatto è raddoppiato in sei settimane. Non avevamo cambiato l\'offerta, solo come la presentavamo."'}</blockquote>
            <cite><strong>Andrea Tomasi</strong>, {Tm.testimonialCite ? Tm.testimonialCite.replace('Andrea Tomasi, ', '') : 'Direttore · Studio Notarile Tomasi'}</cite>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function Servizi() {
  const lang = React.useContext(LangCtx);
  const Ts = (((window.VERTI_LANG || {})[lang] || {}).home || {}).servizi || {};
  const items = Ts.items || [
    { n: '01', name: 'Analisi sito', desc: 'Diagnosi su UX, comunicazione, conversione. Vendibile come servizio standalone.', tag: 'Standalone' },
    { n: '02', name: 'Web design & sviluppo', desc: 'Redesign o nuovo sito. Dalla strategia al lancio. Risultato misurabile, non solo estetico.', tag: 'Core' },
    { n: '03', name: 'Mantenimento ed evoluzione', desc: 'Abbonamento mensile. Il sito cresce con te: sicuro, aggiornato, performante.', tag: 'Continuativo' },
    { n: '04', name: 'Data & insight', desc: 'Lettura dei dati raccolti dal sito per capire cosa funziona, cosa no, dove potenziare. Decisioni su numeri, non su intuizione.', tag: 'Strategia' },
    { n: '05', name: 'Automazione', desc: 'Flussi, CRM, email automatiche. Ridurre il lavoro ripetitivo dove la macchina è più affidabile.', tag: 'Premium' },
    { n: '06', name: 'Marketing digitale', desc: 'Posizionamento, comunicazione, acquisizione. Per chi ha già una base solida e vuole scalare.', tag: 'Espansione' },
  ];

  const titleParts = (Ts.title || 'Sei servizi.\nUna sola filosofia.').split('\n');
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  const [showMotion, setShowMotion] = React.useState(false);

  React.useEffect(() => {
    const mqFine = window.matchMedia('(pointer: fine)');
    const check = () => setShowMotion(!!(window.Motion && window.Motion.motion) && mqFine.matches);
    check();
    mqFine.addEventListener('change', check);
    return () => mqFine.removeEventListener('change', check);
  }, []);

  // Shared header markup
  const headerBlock = (
    <div className="servizi-ed-header">
      <FadeUp><span className="eyebrow">{Ts.eyebrow || 'Sezione 03 · Servizi'}</span></FadeUp>
      <FadeUp delay={100}>
        <h2 className="h2 servizi-ed-title">
          {titleParts[0]}
          <em className="servizi-ed-title-em">{titleParts[1] || 'Una sola filosofia.'}</em>
        </h2>
      </FadeUp>
      <FadeUp delay={200}>
        <p className="servizi-ed-lead">{Ts.lead || 'Il design è la prova. Ogni servizio risponde a un momento del ciclo: prima del sito, durante, e dopo. Non un catalogo da agenzia — un percorso.'}</p>
      </FadeUp>
    </div>
  );

  if (!showMotion) {
    // Mobile / no-Motion: all descriptions visible, no dimming
    return (
      <section className="section servizi" id="servizi">
        <div className="container">
          {headerBlock}
          <div className="servizi-ed-list servizi-ed-list--static" role="list">
            {items.map((s) => (
              <div key={s.n} role="listitem" className="servizi-ed-item servizi-ed-item--open">
                <div className="servizi-ed-item-row">
                  <span className="servizi-ed-num">{s.n}</span>
                  <h3 className="servizi-ed-name">{s.name}</h3>
                  <span className="servizi-ed-tag">{s.tag}</span>
                </div>
                <p className="servizi-ed-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const { motion: m } = window.Motion;

  return (
    <section className="section servizi" id="servizi">
      <div className="container">
        {headerBlock}
        <div className="servizi-ed-list" role="list">
          {items.map((s, i) => {
            const isActive = hoveredIdx === i;
            const isDimmed = hoveredIdx !== null && !isActive;
            return (
              <m.div
                key={s.n}
                role="listitem"
                className={`servizi-ed-item${isActive ? ' active' : ''}`}
                animate={{ opacity: isDimmed ? 0.28 : 1 }}
                initial={false}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onHoverStart={() => setHoveredIdx(i)}
                onHoverEnd={() => setHoveredIdx(null)}
              >
                <div className="servizi-ed-item-row">
                  <span className="servizi-ed-num">{s.n}</span>
                  <m.h3
                    className="servizi-ed-name"
                    animate={{
                      color: isActive ? 'var(--ambra)' : 'var(--neve)',
                      x: isActive ? 10 : 0,
                    }}
                    initial={false}
                    transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {s.name}
                  </m.h3>
                  <span className="servizi-ed-tag">{s.tag}</span>
                </div>
                <m.div
                  animate={{
                    maxHeight: isActive ? 180 : 0,
                    opacity: isActive ? 1 : 0,
                  }}
                  initial={false}
                  transition={{
                    maxHeight: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.28, delay: isActive ? 0.16 : 0 },
                  }}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="servizi-ed-desc">{s.desc}</p>
                </m.div>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Portfolio() {
  const lang = React.useContext(LangCtx);
  const Tp = (((window.VERTI_LANG || {})[lang] || {}).home || {}).portfolio || {};
  const cases = Tp.cases || [
    { caseN: '01', year: '2025', type: 'Restaurant Site', sector: 'Ristorazione · Bolzano', title: 'Da brochure online a strumento di prenotazione.', problem: 'Menù in PDF, nessun contatto sotto i sessanta secondi. Le prenotazioni arrivavano solo per telefono.', result: '+218%', label: 'prenotazioni dirette' },
    { caseN: '02', year: '2025', type: 'Atelier Site', sector: 'Artigianato · Val Gardena', title: "Un atelier che vende all'estero.", problem: 'Sito vetrina solo in italiano. Prodotto eccezionale, zero richieste internazionali nonostante il valore reale.', result: '14', label: 'paesi raggiunti in 4 mesi' },
    { caseN: '03', year: '2025', type: 'Studio Site', sector: 'Studio professionale · Trento', title: 'Da curriculum digitale a generatore di lead.', problem: 'About autocelebrativa, nessuna call-to-action, nessun tracciamento. Tre anni online, zero contatti misurabili.', result: '×2', label: 'tasso di contatto' },
  ];
  const labelBefore = Tp.labelBefore || 'Prima';
  const labelAfter = Tp.labelAfter || 'Dopo';
  const titleParts = (Tp.title || 'Tre casi.\nStessa diagnosi.').split('\n');

  return (
    <section className="section portfolio" id="lavori">
      <div className="container">
        <div className="portfolio-header">
          <div>
            <FadeUp><span className="eyebrow">{Tp.eyebrow || 'Sezione 04 · Lavori'}</span></FadeUp>
            <div style={{ marginTop: 24 }}>
              <LineReveal delay={120} tag="h2" className="h2">{titleParts[0]}</LineReveal>
              <LineReveal delay={240} tag="h2" className="h2 h2--italic h2--gold">{titleParts[1] || 'Stessa diagnosi.'}</LineReveal>
            </div>
          </div>
          <div className="portfolio-intro">
            <FadeUp delay={200}>
              <p className="body-text">{Tp.lead || 'Non una galleria estetica. Per ogni caso: settore, problema iniziale, soluzione, risultato misurabile. I numeri citati sono al lordo della stagionalità.'}</p>
            </FadeUp>
          </div>
        </div>

        <div className="portfolio-grid">
          {cases.map((c, i) => (
            <FadeUp key={i} delay={i * 180}>
              <CaseCard data={c} labelBefore={labelBefore} labelAfter={labelAfter} index={i} />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseCard({ data, labelBefore = 'Prima', labelAfter = 'Dopo', index = 0 }) {
  const tiltRef = useTilt(5);
  return (
    <article ref={tiltRef} className="case">
      <div className="case-header">
        <span className="case-num">CASO {data.caseN || String(index + 1).padStart(2, '0')}</span>
        <span className="case-year">{data.year || '2025'}</span>
      </div>
      <div className="case-visual">
        <div className="case-before">
          <span className="case-label">{labelBefore}</span>
          <div className="case-mock-tile"></div>
        </div>
        <div className="case-after">
          <span className="case-label">{labelAfter}</span>
          <div className="case-mock-tile"></div>
        </div>
        <div className="case-divider"></div>
        <div className="case-visual-tag">
          <span>SCREENSHOT · {(data.type || '').toUpperCase()}</span>
        </div>
      </div>
      <div className="case-body">
        <span className="case-sector">{data.sector}</span>
        <h3 className="case-title">{data.title}</h3>
        <p className="case-problem">{data.problem}</p>
        <div className="case-result">
          <span className="case-result-num">{data.result}</span>
          <span className="case-result-label">{data.label}</span>
          <span className="case-result-arrow" aria-hidden="true">→</span>
        </div>
      </div>
    </article>
  );
}

// ── CuraAccordion: Fluid Typographic Accordion — horizontal panels (desktop) / vertical stack (mobile) ──
function CuraAccordion({ breaks }) {
  const [hovered, setHovered] = React.useState(null);
  const [showPanels, setShowPanels] = React.useState(false);
  const isTouchRef = React.useRef(window.matchMedia('(pointer: coarse)').matches);

  React.useEffect(() => {
    const mqWide = window.matchMedia('(min-width: 769px)');
    const mqFine = window.matchMedia('(pointer: fine)');
    const check = () => setShowPanels(
      !!(window.Motion && window.Motion.motion && window.Motion.AnimatePresence) && mqWide.matches && mqFine.matches
    );
    check();
    mqWide.addEventListener('change', check);
    mqFine.addEventListener('change', check);
    return () => { mqWide.removeEventListener('change', check); mqFine.removeEventListener('change', check); };
  }, []);

  if (!showPanels) {
    // Mobile / no-Motion: clean vertical stack
    return (
      <div className="cura-panels cura-panels--stack">
        {breaks.map((b, i) => (
          <div key={i} className="cura-panel-fallback">
            <span className="cura-panel-label">{b.label}</span>
            <div className="cura-panel-stat">
              {b.num}<em className="cura-panel-unit">{b.unit || ''}</em>
            </div>
            <p className="cura-panel-body-fallback">{b.body}</p>
          </div>
        ))}
      </div>
    );
  }

  const M = window.Motion;
  const motionComp = M.motion;

  return (
    <div className="cura-panels" role="list">
      {breaks.map((b, i) => {
        const isActive = hovered === i;
        return (
          <motionComp.div
            key={i}
            className={`cura-panel${isActive ? ' cura-panel--active' : ''}`}
            animate={{ flexGrow: isActive ? 3 : 1 }}
            initial={false}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden', flexShrink: 1, flexBasis: 0 }}
            onHoverStart={() => !isTouchRef.current && setHovered(i)}
            onHoverEnd={() => setHovered(null)}
            onClick={() => isTouchRef.current && setHovered(isActive ? null : i)}
            role="listitem"
          >
            <span className="cura-panel-label">{b.label}</span>
            <motionComp.div
              className="cura-panel-stat"
              animate={{
                color: isActive ? '#c8b89a' : '#e8e4dc',
                textShadow: isActive ? '0 0 40px rgba(200,184,154,0.22)' : '0 0 0px rgba(0,0,0,0)',
              }}
              initial={false}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {b.num}<em className="cura-panel-unit">{b.unit || ''}</em>
            </motionComp.div>
            <motionComp.div
              animate={{
                maxHeight: isActive ? 220 : 0,
                opacity: isActive ? 1 : 0,
              }}
              initial={false}
              transition={{
                maxHeight: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.3, delay: isActive ? 0.2 : 0 },
              }}
              style={{ overflow: 'hidden' }}
            >
              <p className="cura-panel-body">{b.body}</p>
            </motionComp.div>
          </motionComp.div>
        );
      })}
    </div>
  );
}

function AnimatedDivider() {
  const [ref, inView] = useInView({ threshold: 0.5 });
  const lineStyle = {
    height: '1px',
    background: 'rgba(255,255,255,0.05)',
    transformOrigin: 'left',
  };

  if (!window.Motion || !window.Motion.motion) {
    return <div ref={ref} style={{ margin: '80px 0' }}><div style={lineStyle} /></div>;
  }

  const { motion } = window.Motion;
  return (
    <div ref={ref} style={{ margin: '80px 0', overflow: 'hidden' }}>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={lineStyle}
      />
    </div>
  );
}

// ── CuraVisualBG: deep-space gradient orbs + organic SVG cells + micro-particle canvas ──
function CuraVisualBG() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const setSize = () => {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    setSize();
    const ctx = canvas.getContext('2d');

    const palette = ['200,184,154', '120,80,190', '60,100,200', '160,60,140'];
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.6 + 0.3,
      opacity: Math.random() * 0.13 + 0.04,
      color: palette[Math.floor(Math.random() * palette.length)],
    }));

    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -8) p.x = canvas.width + 8;
        if (p.x > canvas.width + 8) p.x = -8;
        if (p.y < -8) p.y = canvas.height + 8;
        if (p.y > canvas.height + 8) p.y = -8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    const ro = new ResizeObserver(() => {
      setSize();
      particles.forEach(p => {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
      });
    });
    ro.observe(parent);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return (
    <React.Fragment>
      <div className="cura-bg" aria-hidden="true">
        <div className="cura-orb cura-orb--1" />
        <div className="cura-orb cura-orb--2" />
        <div className="cura-orb cura-orb--3" />
        <div className="cura-orb cura-orb--4" />
        <svg className="cura-cells" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <ellipse className="cura-cell cura-cell--1" cx="320" cy="280" rx="200" ry="140" />
          <ellipse className="cura-cell cura-cell--2" cx="950" cy="580" rx="240" ry="170" />
          <ellipse className="cura-cell cura-cell--3" cx="1220" cy="180" rx="170" ry="210" />
          <path className="cura-cell cura-cell--4" d="M180,520 Q290,400 420,510 Q550,620 410,720 Q270,820 170,700 Q70,580 180,520Z" />
          <ellipse className="cura-cell cura-cell--5" cx="680" cy="820" rx="180" ry="110" />
        </svg>
      </div>
      <canvas ref={canvasRef} className="cura-particles-canvas" aria-hidden="true" />
    </React.Fragment>
  );
}

function Mantenimento() {
  const lang = React.useContext(LangCtx);
  const Tman = (((window.VERTI_LANG || {})[lang] || {}).home || {}).mantenimento || {};
  const breaks = Tman.breaks || [
    { num: '20', unit: '–30%', label: 'Freshness Factor', body: "L'algoritmo di Google penalizza i siti non aggiornati da sei mesi con una perdita di traffico organico fino al 30%. Ogni mese di silenzio è un cliente che trova un altro." },
    { num: '30k', label: 'Sicurezza', body: "Trentamila siti violati ogni giorno per plugin e CMS obsoleti. Una breccia non è un'eccezione: è una statistica che attende il tuo turno." },
    { num: '50%', label: 'Rottura silenziosa', body: "Una probabilità su due di bug funzionali entro dodici mesi, dovuti all'evoluzione di PHP e dei browser. Quando smette di funzionare, lo scopri da un cliente che non te lo dice." },
    { num: '25%', label: 'Link rot', body: "Un quarto dei link muore ogni due anni. Pagine che ti citavano, oggi restituiscono errore. L'autorità del brand si erode senza che nessuno la difenda." },
    { num: '×3', label: 'Costo ripristino', body: 'Riparare un sito già compromesso costa il triplo della manutenzione preventiva. Si paga sempre. La differenza è se prima o dopo il danno.' },
  ];
  const features = Tman.subscriptionFeatures || [
    { name: 'Aggiornamenti continui', desc: 'Contenuti, immagini, sezioni nuove. Senza ticket, senza preventivi minimi.' },
    { name: 'Sicurezza monitorata', desc: 'Patch, backup, scansioni. Nessuno scopre una breccia leggendo i giornali.' },
    { name: 'Performance & SEO', desc: 'Velocità sotto i tre secondi, Core Web Vitals nel verde, contenuti che restano freschi.' },
    { name: 'Strategia trimestrale', desc: 'Una call ogni tre mesi per leggere i dati, decidere cosa cambiare, cosa abbandonare.' },
    { name: 'Priorità sui tempi', desc: 'Risposte entro 24 ore. Modifiche urgenti in giornata. Il tuo sito non aspetta.' },
  ];
  const titleParts = (Tman.title || 'Un sito non è un prodotto.\nÈ un asset.').split('\n');
  return (
    <section className="section mantenimento" id="mantenimento">
      <CuraVisualBG />
      <div className="container">
        <div className="mantenimento-intro">
          <div>
            <FadeUp><span className="eyebrow">{Tman.eyebrow || 'Sezione 05 · Cura'}</span></FadeUp>
            <LineReveal delay={120} tag="h2" className="h2">{titleParts[0]}</LineReveal>
            <LineReveal delay={240} tag="h2" className="h2">{titleParts[1]}</LineReveal>
          </div>
          <FadeUp delay={240}>
            <p className="mantenimento-lead">
              {Tman.lead || "Il giorno del lancio non è la fine. È il primo. Per i nostri clienti il primo periodo di manutenzione è incluso, perché un sito abbandonato è un investimento che si dissolve in silenzio."}
            </p>
          </FadeUp>
        </div>

        <AnimatedDivider />

        <FadeUp delay={120}>
          <h2 className="mantenimento-sub-title">
            {Tman.subTitleParts ? (
              <>{Tman.subTitleParts.before}<em>{Tman.subTitleParts.italic}</em>{Tman.subTitleParts.after || ''}</>
            ) : (
              Tman.subEyebrow || ''
            )}
          </h2>
        </FadeUp>

        <CuraAccordion breaks={breaks} />

        <FadeUp delay={200}>
          <div className="subscription">
            {/* Elementi geometrici angolari */}
            <span className="subscription-geo subscription-geo--tr" aria-hidden="true" />
            <span className="subscription-geo subscription-geo--bl" aria-hidden="true" />
            <div className="subscription-left">
              <div className="subscription-badge">
                <span className="subscription-badge-dot" aria-hidden="true" />
                <span className="subscription-eyebrow">{Tman.subscriptionEyebrow || 'Verti Care'}</span>
              </div>
              <div className="subscription-sublabel">{Tman.subscriptionSublabel || 'Abbonamento mensile'}</div>
              <h3 className="subscription-title">{(Tman.subscriptionTitle || 'Il sito evolve con la tua azienda.\nMese dopo mese.').split('\n').map((line, i) => i === 0 ? <React.Fragment key={i}>{line}<br/></React.Fragment> : <React.Fragment key={i}>{line}</React.Fragment>)}</h3>
              <p className="subscription-body">
                {Tman.subscriptionBody || "Non un contratto di assistenza tecnica. Un partner strategico che mantiene il sito sicuro, veloce, allineato a quello che la tua azienda è oggi, non a quella che era al lancio."}
              </p>
              <a href="pricing.html" className="btn">
                <span>{Tman.subscriptionCta || 'Scopri Verti Care'}</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </a>
            </div>
            <ul className="subscription-features">
              {features.map((f, i) => (
                <li key={i} className="subscription-feature">
                  <span className="subscription-feature-mark">/{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="subscription-feature-name">{f.name}</div>
                    <div className="subscription-feature-desc">{f.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ───────── Contact (Calendar / Email / Message) ─────────

function Contact() {
  const [tab, setTab] = React.useState('call');
  const lang = React.useContext(LangCtx);
  const Tc = (((window.VERTI_LANG || {})[lang] || {}).home || {}).contact || {};
  return (
    <section className="section contact" id="contatti">
      <div className="container">
        <div className="contact-grid">
          <div className="contact-left">
            <FadeUp><span className="eyebrow">{Tc.eyebrow || 'Sezione 06 · Inizio'}</span></FadeUp>
            <LineReveal delay={120} tag="h2" className="h2">{Tc.title || 'Venti minuti. Tre punti. Zero pitch.'}</LineReveal>
            <FadeUp delay={240}>
              <p className="body-text">{Tc.lead || 'Una call gratuita con struttura chiara: tu mostri il sito, io individuo i tre punti che ti stanno costando di più. Senza obblighi, senza vendita. Se decidi di andare avanti, hai già metà della diagnosi.'}</p>
            </FadeUp>
            <FadeUp delay={360}>
              <div className="channels">
                <a href="mailto:info@vertistudio.com" className="channel">
                  <span className="channel-label">{Tc.channelEmail || 'Email'}</span>
                  <span className="channel-value">info@vertistudio.com</span>
                  <span className="channel-arrow" aria-hidden="true">→</span>
                </a>
                <a href="#" onClick={(e)=>{e.preventDefault(); setTab('message');}} className="channel">
                  <span className="channel-label">{Tc.channelMsg || 'Messaggio'}</span>
                  <span className="channel-value">{Tc.channelMsgValue || 'Scrivi due righe, rispondiamo entro 24h'}</span>
                  <span className="channel-arrow" aria-hidden="true">→</span>
                </a>
                <a href="https://wa.me/393391711000" className="channel">
                  <span className="channel-label">{Tc.channelWA || 'Whatsapp'}</span>
                  <span className="channel-value">+39 339 1711000</span>
                  <span className="channel-arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </FadeUp>
          </div>
          <FadeUp delay={300}>
            <BookingPanel tab={tab} setTab={setTab} />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function CalendlyEmbed() {
  React.useEffect(() => {
    if (document.querySelector('script[src*="calendly.com/assets"]')) return;
    const s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);
  return (
    <div
      className="calendly-inline-widget"
      data-url="https://calendly.com/alice-strobbe/30min?hide_event_type_details=1&background_color=141414&text_color=e8e4dc&primary_color=c8b89a"
    />
  );
}

function BookingPanel({ tab, setTab }) {
  const lang = React.useContext(LangCtx);
  const Tc = (((window.VERTI_LANG || {})[lang] || {}).home || {}).contact || {};
  return (
    <div className={`calendar${tab === 'call' ? ' calendar--calendly' : ''}`}>
      <div className="calendar-tabs">
        <button className={`calendar-tab ${tab==='call'?'active':''}`} onClick={()=>setTab('call')}>{Tc.tabCall || 'Prenota call'}</button>
        <button className={`calendar-tab ${tab==='message'?'active':''}`} onClick={()=>setTab('message')}>{Tc.tabMsg || 'Manda messaggio'}</button>
      </div>
      <div key={tab} className="calendar-content">
        {tab === 'call' ? <CalendlyEmbed /> : <MessageForm />}
      </div>
    </div>
  );
}

function CallBooker() {
  const lang = React.useContext(LangCtx);
  const Tc = (((window.VERTI_LANG || {})[lang] || {}).home || {}).contact || {};
  const [day, setDay] = React.useState(12);
  const [time, setTime] = React.useState('14:30');
  const [submitted, setSubmitted] = React.useState(false);
  const monthOffset = 4;
  const daysInMonth = 31;
  const cells = [];
  for (let i = 0; i < monthOffset; i++) cells.push({ empty: true, key: `e${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const dim = d < 5 || [9,10,16,17,23,24,30,31].includes(d);
    const available = !dim && [6,7,8,12,13,14,15,19,20,21,22,26,27,28,29].includes(d);
    cells.push({ d, dim, available, key: `d${d}` });
  }
  const times = ['09:00', '10:30', '14:30', '16:00', '17:30', '18:30'];
  const dayLetters = Tc.dayLetters || ['L','M','M','G','V','S','D'];
  const monthName = Tc.monthName || 'Maggio';
  const year = Tc.year || '2026';
  const dayUnavail = Tc.dayUnavail || ', non disponibile';
  const getDayLabel = (d) => Tc.dayLabel ? Tc.dayLabel(d) : `${d} maggio`;
  const getConfirmBtn = (d, t) => Tc.confirmBtn ? Tc.confirmBtn(d, t) : `Conferma · ${d} maggio · ${t}`;

  if (submitted) {
    const descLines = (Tc.successCallDesc || '12 maggio · 14:30 · 20 minuti.\nRiceverai un\'email con il link Meet entro pochi secondi.').split('\n');
    return (
      <div className="success-state">
        <div className="success-mark">✓</div>
        <div className="success-title">{Tc.successCallTitle || 'Call confermata'}</div>
        <p className="success-desc">{descLines.map((l, i) => <React.Fragment key={i}>{l}{i < descLines.length - 1 && <br/>}</React.Fragment>)}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="calendar-header">
        <div className="calendar-month">{monthName} <em>{year}</em></div>
        <div className="calendar-nav">
          <button aria-label={Tc.prevMonth || 'Mese precedente'}>‹</button>
          <button aria-label={Tc.nextMonth || 'Mese successivo'}>›</button>
        </div>
      </div>
      <div className="calendar-grid" role="grid" aria-label={`${monthName} ${year}`}>
        {dayLetters.map((d, i) => <div key={i} className="calendar-dow" role="columnheader">{d}</div>)}
        {cells.map(c => {
          if (c.empty) return <div key={c.key} className="calendar-day empty" role="gridcell"></div>;
          const cls = `calendar-day${c.dim?' dim':''}${c.available?' available':''}${c.d===day?' selected':''}`;
          return (
            <button
              key={c.key}
              role="gridcell"
              className={cls}
              onClick={() => { if (c.available) setDay(c.d); }}
              disabled={!c.available}
              aria-pressed={c.d === day}
              aria-label={`${getDayLabel(c.d)}${c.available ? '' : dayUnavail}`}
            >{c.d}</button>
          );
        })}
      </div>
      <div className="calendar-times">
        {times.map(t => (
          <button key={t} className={`calendar-time ${t===time?'selected':''}`} onClick={()=>setTime(t)}>{t}</button>
        ))}
      </div>
      <a href="#" className="btn" style={{ width: '100%', justifyContent: 'space-between' }} onClick={(e)=>{ e.preventDefault(); setSubmitted(true); }}>
        <span>{getConfirmBtn(day, time)}</span>
        <span className="btn-arrow">→</span>
      </a>
      <div className="calendar-footer" style={{ marginTop: 16 }}>
        <span>{Tc.calFooter1 || '20 minuti · Google Meet'}</span>
        <span>{Tc.calFooter2 || 'Fuso · Europe/Rome'}</span>
      </div>
    </div>
  );
}

function MessageForm() {
  const lang = React.useContext(LangCtx);
  const Tc = (((window.VERTI_LANG || {})[lang] || {}).home || {}).contact || {};
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  if (sent) {
    return (
      <div className="success-state">
        <div className="success-mark">✓</div>
        <div className="success-title">{Tc.successMsgTitle || 'Messaggio ricevuto'}</div>
        <p className="success-desc">{Tc.successMsgDesc || 'Risponderemo entro ventiquattro ore, di solito molto prima. Nel frattempo, se vuoi, prenota una call sopra.'}</p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setTimeout(() => setSent(true), 800);
  };

  const fl = Tc.formLabels || {};
  return (
    <form className="form-pane" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="f-nome">{fl.nameLabel || 'Nome'}</label>
        <input id="f-nome" type="text" placeholder={fl.namePlaceholder || 'Come ti chiami'} required />
      </div>
      <div className="field">
        <label htmlFor="f-email">{fl.emailLabel || 'Email'}</label>
        <input id="f-email" type="email" placeholder={fl.emailPlaceholder || 'dove ti rispondiamo'} required autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="f-sito">{fl.siteLabel || 'Sito attuale'}</label>
        <input id="f-sito" type="url" placeholder="https://..." />
      </div>
      <div className="field">
        <label htmlFor="f-problema">{fl.problemLabel || 'Cosa non funziona'}</label>
        <textarea id="f-problema" placeholder={fl.problemPlaceholder || 'Due righe, anche imprecise. Dal nostro lato leggiamo tutto.'} required></textarea>
      </div>
      <button
        type="submit"
        className="btn"
        style={{ width: '100%', justifyContent: 'space-between', marginTop: 8 }}
        disabled={sending}
        aria-busy={sending}
      >
        <span>{sending ? (Tc.btnSending || 'Invio in corso...') : (Tc.btnSend || 'Invia messaggio')}</span>
        <span className="btn-arrow" aria-hidden="true">→</span>
      </button>
    </form>
  );
}

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
            <li><a href="#metodo">{links.metodo || 'Metodo'}</a></li>
            <li><a href="#servizi">{links.servizi || 'Servizi'}</a></li>
            <li><a href="#lavori">{links.lavori || 'Lavori'}</a></li>
            <li><a href="#mantenimento">{links.cura || 'Verti Care'}</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{Tf.colServizi || 'Servizi'}</h4>
          <ul>
            <li><a href="#">{links.analisiSito || 'Analisi sito'}</a></li>
            <li><a href="#">{links.webDesign || 'Web design'}</a></li>
            <li><a href="#">{links.mantenimento || 'Mantenimento'}</a></li>
            <li><a href="#">{links.automazione || 'Automazione'}</a></li>
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

// ───────── Tweaks ─────────

function VertiTweaks({ t, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="Headline" />
      <TweakRadio
        label="Variante"
        value={t.headline}
        options={[
          { value: 'problema', label: 'Problema' },
          { value: 'soluzione', label: 'Soluzione' },
        ]}
        onChange={(v) => setTweak('headline', v)}
      />
      <TweakSection label="Tipografia" />
      <TweakSelect
        label="Font pair"
        value={t.fontPair}
        options={[
          { value: 'cormorant-inter', label: 'Cormorant + Inter' },
          { value: 'playfair-inter', label: 'Playfair + Inter' },
          { value: 'cormorant-helvetica', label: 'Cormorant + Helvetica' },
        ]}
        onChange={(v) => setTweak('fontPair', v)}
      />
      <TweakSection label="Visual" />
      <TweakSlider
        label="Intensità accenti"
        value={t.accentStrength} min={0} max={1.5} step={0.05}
        onChange={(v) => setTweak('accentStrength', v)}
      />
      <TweakRadio
        label="Animazioni"
        value={t.animLevel}
        options={[
          { value: 'soft', label: 'Soft' },
          { value: 'full', label: 'Full' },
        ]}
        onChange={(v) => setTweak('animLevel', v)}
      />
      <TweakToggle
        label="Cursore custom"
        value={t.showCursor}
        onChange={(v) => setTweak('showCursor', v)}
      />
    </TweaksPanel>
  );
}

// ───────── App ─────────

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const scrollY = useScrollY();
  const [lang, setLang] = useLang();
  const [splashVisible, setSplashVisible] = React.useState(() => shouldShowSplash());

  React.useEffect(() => {
    if (!splashVisible) return;
    const timer = setTimeout(() => {
      setSplashVisible(false);
      try { sessionStorage.setItem('vs-splash-done', '1'); } catch(e) {}
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  // ─── Scroll del foglio contenuto ────────────────────────────────────────────
  React.useEffect(() => {
    const gsap = window.gsap;
    if (!gsap) return;

    // ── Altezza scroll-driver ─────────────────────────────────────────────────
    const setDriverHeight = () => {
      const contentH = document.getElementById('content-inner').offsetHeight;
      document.getElementById('scroll-driver').style.height = `${contentH}px`;
    };
    setDriverHeight();
    window.addEventListener('resize', setDriverHeight);

    // ── Scroll handler: traduce #content-inner in Y ───────────────────────────
    const onScroll = () => {
      gsap.set('#content-inner', { y: -window.scrollY });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // stato iniziale

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', setDriverHeight);
    };
  }, []);

  // ─── Animazioni GSAP aggiuntive ────────────────────────────────────────────
  React.useEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;
    if (document.body.classList.contains('anim-soft')) return;

    // Parallax sull'overlay del mantenimento (bg radial)
    gsap.to('.mantenimento::before', {
      y: -80,
      ease: 'none',
      scrollTrigger: {
        trigger: '.mantenimento',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.8,
      }
    });

    // Barra di progresso scroll per homepage
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
      const updateProgress = () => {
        const el = document.getElementById('content-inner');
        if (!el) return;
        const totalH = el.offsetHeight - window.innerHeight;
        const scrolled = Math.max(0, window.scrollY - window.innerHeight * 2.2);
        const p = totalH > 0 ? Math.min(scrolled / totalH, 1) : 0;
        progressBar.style.transform = `scaleX(${p})`;
      };
      window.addEventListener('scroll', updateProgress, { passive: true });
      return () => window.removeEventListener('scroll', updateProgress);
    }
  }, []);

  // Gestisce hash nell'URL quando si arriva da un'altra pagina (es. pricing → index.html#metodo)
  React.useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const hasSplash = shouldShowSplash();
    const delay = hasSplash ? 2700 : 200;
    const timer = setTimeout(() => scrollToSection(hash.slice(1)), delay);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    // Easter egg — per chi ispeziona il codice
    console.log(
      '%c Verti Studio %c\n%cFounded in the Alps. Bolzano, Alto Adige.\ninfo@vertistudio.com',
      'background:#c8b89a;color:#0a0a0a;padding:4px 12px;font-weight:bold;',
      '',
      'color:#c8b89a;font-size:11px;'
    );
  }, []);

  React.useEffect(() => {
    const pair = FONT_PAIRS[t.fontPair];
    if (pair) {
      document.documentElement.style.setProperty('--font-display', pair.display);
      document.documentElement.style.setProperty('--font-body', pair.body);
    }
    document.documentElement.style.setProperty('--accent-strength', t.accentStrength);
    document.body.classList.toggle('anim-soft', t.animLevel === 'soft');
  }, [t.fontPair, t.accentStrength, t.animLevel]);

  return (
    <LangCtx.Provider value={lang}>
      <div className="scroll-progress" aria-hidden="true" />
      <a href="#facts" className="skip-link">Vai al contenuto</a>
      <SplashScreen visible={splashVisible} />
      <CustomCursor enabled={t.showCursor && t.animLevel === 'full'} />
      <SpotlightEffect />
      <Nav scrollY={scrollY} setLang={setLang} />
      {/* Layer 1: sfondo fisso — video in loop */}
      <Hero />

      {/* Layer 2: foglio contenuto — fermo durante zoom, poi tradotto in Y da JS
          overflow:hidden → il testo sparisce sotto la navbar in alto e non esce in basso */}
      <div id="content-sheet">
        <div id="content-inner">
          <HeroText headline={t.headline} />
          <Facts />
          <Problema />
          <Metodo />
          <Servizi />
          <Portfolio />
          <Mantenimento />
          <Contact />
          <Footer />
        </div>
      </div>

      {/* Layer 3: scroll driver — div trasparente, altezza = contenuto */}
      <div id="scroll-driver" aria-hidden="true"></div>
    </LangCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
