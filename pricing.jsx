'use strict';

// ─────── i18n ───────

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

// ─────── Utils ───────

function useInView(options = {}) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.07, ...options }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeUp({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`pr-fade${inView ? ' in' : ''}${className ? ' ' + className : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function LineReveal({ children, delay = 0, tag: Tag = 'div', className = '' }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`pr-line-reveal${inView ? ' in' : ''}${className ? ' ' + className : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

// ─────── Nav ───────

function Nav({ setLang }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const lang = React.useContext(LangCtx);
  const T = (window.VERTI_LANG || {})[lang] || {};
  const tn = T.nav || {};

  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

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
    ['#contatti', tn.contatti || 'Contatti'],
  ];

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Navigazione principale">
        <a href="index.html" className="nav-brand" aria-label="Verti Studio — Home">
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
        <ul className="nav-links" role="list">
          {links.map(([href, label]) => (
            <li key={href}>
              <a href={href} {...(href === 'pricing.html' ? { 'aria-current': 'page' } : {})}>{label}</a>
            </li>
          ))}
        </ul>
        <LangSwitcher setLang={setLang} />
        <button
          className={`nav-hamburger${open ? ' open' : ''}`}
          aria-label={open ? (tn.chiudiMenu || 'Chiudi menu') : (tn.apriMenu || 'Apri menu')}
          aria-expanded={open}
          aria-controls="nav-overlay-pricing"
          onClick={() => setOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </nav>

      <div
        id="nav-overlay-pricing"
        className={`nav-overlay${open ? ' open' : ''}`}
        aria-hidden={!open}
        role="dialog"
        aria-label="Menu di navigazione"
        onClick={close}
      >
        <nav className="nav-overlay-inner" onClick={(e) => e.stopPropagation()}>
          {links.map(([href, label], i) => (
            <a key={href} href={href} className="nav-overlay-link" style={{ '--i': i }} onClick={close} {...(href === 'pricing.html' ? { 'aria-current': 'page' } : {})}>
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

// ─────── Hero ───────

function PricingHero() {
  const [ref] = useInView({ threshold: 0.1 });
  const lang = React.useContext(LangCtx);
  const Th = (((window.VERTI_LANG || {})[lang] || {}).pricing || {}).hero || {};

  return (
    <section className="pr-hero" ref={ref}>
      <div className="pr-hero-bg" aria-hidden="true">
        <img src="assets/investmentsBG.jpg" alt="" className="pr-hero-img" fetchpriority="high" decoding="async" />
        <div className="pr-hero-veil" />
      </div>

      <span className="pr-hero-watermark" aria-hidden="true">{Th.watermark || 'VALORE'}</span>

      <div className="pr-hero-inner">
        <h1 className={`pr-hero-title${lang === 'de' ? ' pr-hero-title--de' : ''}`}>
          <LineReveal delay={120}>
            <span>{Th.titleA || 'Ogni progetto'}</span>
          </LineReveal>
          <LineReveal delay={240}>
            <span><em>{Th.titleEm || 'nasce da una'}</em></span>
          </LineReveal>
          <LineReveal delay={360}>
            <span>{Th.titleB || 'conversazione.'}</span>
          </LineReveal>
        </h1>

        <FadeUp delay={600} className="pr-hero-sub-wrap">
          <p className="pr-hero-sub">
            {(Th.sub || 'Non esistono pacchetti standard perché non esistono aziende standard.\nIl prezzo è il risultato di un dialogo. Non di un listino.').split('\n').map((line, i, arr) => (
              <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
            ))}
          </p>
        </FadeUp>

        <FadeUp delay={760}>
          <a href="#contatti" className="pr-hero-cta">
            <span>{Th.ctaLabel || 'Inizia la conversazione'}</span>
            <span className="pr-hero-cta-arrow" aria-hidden="true">→</span>
          </a>
        </FadeUp>

        <FadeUp delay={920}>
          <div className="pr-hero-scroll-hint" aria-hidden="true">
            <span className="pr-mono">{Th.scrollHint || 'scopri'}</span>
            <div className="pr-scroll-line" />
          </div>
        </FadeUp>
      </div>

      <div className="pr-hero-corner" aria-hidden="true" />
      <div className="pr-hero-coords" aria-hidden="true">
        <span className="pr-mono">46°30′N · 11°21′E</span>
      </div>
    </section>
  );
}


// ─────── Sartorialità Digitale ───────

function SartorialitaSection() {
  const [ref] = useInView({ threshold: 0.08 });
  const lang = React.useContext(LangCtx);
  const Ts = (((window.VERTI_LANG || {})[lang] || {}).pricing || {}).sartorial || {};
  const levels = Ts.levels || [
    { num: '01', tag: 'Sito premium', name: 'Presenza essenziale', focus: 'Identità forte, messaggio chiaro, prime impressioni che convertono.', desc: 'Un sito che finalmente rappresenta il livello reale del tuo lavoro. Non un template. Non una vetrina generica. Un progetto costruito intorno a chi sei e a chi vuoi raggiungere.', examples: 'Siti vetrina · Landing page · Brand personali · Portfolio' },
    { num: '02', tag: 'Piattaforma funzionale', name: 'Sistema integrato', focus: 'Funzionalità su misura, gestione autonoma, meno lavoro manuale.', desc: 'Quando il sito deve fare di più che essere bello. Prenota, vende, gestisce, filtra. Un sistema digitale progettato attorno ai tuoi processi reali, non ai limiti di un plugin.', examples: 'Prenotazioni online · E-commerce · CMS su misura · Aree riservate' },
    { num: '03', tag: 'Ecosistema digitale', name: 'Ecosistema automatizzato', focus: 'Automazione, AI, integrazioni che fanno risparmiare tempo ogni giorno.', desc: 'La fase in cui il digitale smette di essere uno strumento e diventa infrastruttura. Flussi che si attivano da soli, dati che si leggono, sistemi che comunicano tra loro.', examples: 'AI & automazioni · CRM custom · API & workflow · Sistemi gestionali' },
  ];

  return (
    <section className="pr-sartorial" ref={ref}>
      <div className="pr-sartorial-inner">
        <FadeUp>
          <span className="pr-mono pr-section-label">{Ts.label || '001 / COMPLESSITÀ PROGETTUALE'}</span>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="pr-sartorial-title">
            {Ts.titleA || 'Tre livelli di complessità.'}<br /><em>{Ts.titleEm || 'Infinite soluzioni.'}</em>
          </h2>
        </FadeUp>
        <FadeUp delay={160}>
          <p className="pr-sartorial-sub">
            {Ts.sub || 'Non sono pacchetti. Non sono prezzi fissi. Sono tre esempi di ciò che possiamo costruire insieme, a seconda delle tue esigenze, del tuo settore e dei tuoi obiettivi.'}
          </p>
        </FadeUp>

        <FadeUp delay={240}>
          <div className="pr-sartorial-disclaimer">
            <span className="pr-mono">{Ts.scrollHint || '↓ Scorri per capire la differenza'}</span>
          </div>
        </FadeUp>

        <div className="pr-sartorial-levels">
          {levels.map((l, i) => (
            <FadeUp key={l.num} delay={320 + i * 120} className="pr-sartorial-level-wrap">
              <div className="pr-sartorial-level">
                <span className="pr-mono pr-sartorial-num">{l.num}</span>
                <span className="pr-mono pr-sartorial-tag">{l.tag}</span>
                <h3 className="pr-sartorial-level-name">{l.name}</h3>
                <p className="pr-sartorial-focus">{l.focus}</p>
                <p className="pr-sartorial-desc">{l.desc}</p>
                <div className="pr-sartorial-examples">
                  <span className="pr-mono pr-sartorial-examples-label">{Ts.examplesLabel || 'Ad esempio'}</span>
                  <span className="pr-mono pr-sartorial-for">{l.examples}</span>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={680}>
          <div className="pr-sartorial-note">
            <span className="pr-sartorial-note-icon" aria-hidden="true">✦</span>
            <p className="pr-mono pr-sartorial-closing">
              {Ts.closing || 'Il tuo progetto potrebbe non rientrare in nessuna di queste categorie. La prima conversazione serve esattamente a capire di cosa hai bisogno, senza presupposti.'}
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─────── Bento Servizi ───────

function BentoCard({ servizio, index }) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Magnetic hover — throttled via rAF, no elastic easing
  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let rafId = 0;
    let mouseX = 0, mouseY = 0;
    const onMove = (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (mouseX - r.left - r.width  / 2) * 0.07;
        const y = (mouseY - r.top  - r.height / 2) * 0.07;
        gsap.to(el, { x, y, duration: 0.45, ease: 'power2.out' });
        rafId = 0;
      });
    };
    const onLeave = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: 'power3.out' });
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`pr-bento-card${servizio.featured ? ' pr-bento--featured' : ''}${visible ? ' in' : ''}`}
      style={{ gridArea: servizio.gridArea, transitionDelay: `${index * 80}ms` }}
    >
      <div className="pr-bento-num pr-mono">{servizio.num}</div>
      <h3 className="pr-bento-title">{servizio.title}</h3>
      <p className="pr-bento-desc">{servizio.desc}</p>
      {servizio.featured && <div className="pr-bento-featured-mark" aria-hidden="true" />}
    </div>
  );
}

const SERVIZI_GRID = [
  { id: 'web', gridArea: 'web', num: '01', featured: true },
  { id: 'ux',  gridArea: 'ux',  num: '02' },
  { id: 'ai',  gridArea: 'ai',  num: '03' },
  { id: 'mkt', gridArea: 'mkt', num: '04' },
  { id: 'ana', gridArea: 'ana', num: '05' },
];

function Servizi() {
  const lang = React.useContext(LangCtx);
  const Ts = (((window.VERTI_LANG || {})[lang] || {}).pricing || {}).servizi || {};
  const tItems = Ts.items || [
    { title: 'Web Design & Sviluppo', desc: "Siti su misura: architettura dell'informazione, visual design, codice preciso." },
    { title: 'UX / UI', desc: 'Esperienza utente studiata per convertire. Prima i wireframe, poi i pixel.' },
    { title: 'AI & Automazioni', desc: 'Flussi intelligenti che eliminano il lavoro ripetitivo.' },
    { title: 'Marketing Digitale', desc: 'Strategia, contenuti, distribuzione. Visibilità che porta clienti.' },
    { title: 'Analytics & Dati', desc: "Dashboard che raccontano la realtà dell'azienda. Decisioni su evidenze." },
  ];
  const servizi = SERVIZI_GRID.map((s, i) => ({ ...s, title: tItems[i]?.title || '', desc: tItems[i]?.desc || '' }));

  return (
    <section className="pr-servizi">
      <div className="pr-servizi-header">
        <FadeUp>
          <span className="pr-mono pr-section-label">{Ts.label || '002 / COSA INCLUDE IL TUO PROGETTO'}</span>
        </FadeUp>
        <LineReveal delay={100} tag="h2" className="pr-section-title">
          <span>{Ts.titleA || 'Competenze su misura,'}</span>
        </LineReveal>
        <LineReveal delay={200} tag="h2" className="pr-section-title pr-section-title--italic">
          <span><em>{Ts.titleEm || 'nessun pacchetto fisso.'}</em></span>
        </LineReveal>
      </div>

      <div className="pr-bento-grid" role="list">
        {servizi.map((s, i) => (
          <BentoCard key={s.id} servizio={s} index={i} />
        ))}
      </div>
    </section>
  );
}

// ─────── Evolution Plan ───────

function EvolutionPlan() {
  const [ref, inView] = useInView({ threshold: 0.15 });
  const [hovered, setHovered] = React.useState(false);
  const lang = React.useContext(LangCtx);
  const Te = (((window.VERTI_LANG || {})[lang] || {}).pricing || {}).evolution || {};
  const features = Te.features || [
    'Aggiornamenti contenuto illimitati',
    'Monitoraggio performance mensile',
    'Ottimizzazione SEO continua',
    'Backup e sicurezza garantiti',
    'Supporto prioritario entro 24h',
    'Report analytics mensile',
    'Test UX e ottimizzazioni progressive',
    'Consulenza strategica trimestrale',
  ];

  return (
    <section className="pr-evolution" id="evolution">
      <div className="pr-evolution-inner">
        <FadeUp>
          <span className="pr-mono pr-section-label">{Te.label || '003 / VERTI CARE'}</span>
        </FadeUp>

        <div
          ref={ref}
          className={`pr-evo-card${inView ? ' in' : ''}${hovered ? ' hovered' : ''}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="pr-evo-glow" aria-hidden="true" />
          <div className="pr-evo-top-accent" aria-hidden="true" />

          <div className="pr-evo-top">
            <div className="pr-evo-label-wrap">
              <span className="pr-mono pr-evo-badge">{Te.subtitle || 'Verti Care'}</span>
              <span className="pr-mono pr-evo-continuity">{Te.continuity || 'Continuità · Evoluzione · Risultati'}</span>
            </div>
            <div className="pr-evo-name-wrap">
              <LineReveal delay={100} tag="h2" className="pr-section-title">
                <span>{Te.titleA || 'Il sito che cresce.'}</span>
              </LineReveal>
              <LineReveal delay={220} tag="h2" className="pr-section-title pr-section-title--italic">
                <span><em>{Te.titleEm || 'Ogni mese.'}</em></span>
              </LineReveal>
            </div>
            <FadeUp delay={340}>
              <p className="pr-evo-value-stmt">
                {Te.valueStmt || 'Non un contratto di assistenza tecnica. Un partner strategico che mantiene il tuo sito sicuro, veloce e allineato a quello che sei oggi, non a quello che eri al lancio.'}
              </p>
            </FadeUp>
            <div className="pr-evo-custom-price">
              <span className="pr-mono pr-evo-custom-label">{Te.investLabel || 'Investimento'}</span>
              <div className="pr-evo-custom-value"><em>{Te.customValue || 'Su misura'}</em></div>
              <span className="pr-mono pr-evo-custom-note">{Te.customNote || 'Costruito sul tuo progetto'}</span>
            </div>
          </div>

          <div className="pr-evo-divider" aria-hidden="true">
            <svg viewBox="0 0 800 2" preserveAspectRatio="none" aria-hidden="true">
              <line x1="0" y1="1" x2="800" y2="1" stroke="currentColor" strokeWidth="1" strokeDasharray="3 9" />
            </svg>
          </div>

          <ul className="pr-evo-features" aria-label="Cosa è incluso">
            {features.map((f, i) => (
              <li
                key={i}
                className={`pr-evo-feature${inView ? ' in' : ''}`}
                style={{ transitionDelay: `${300 + i * 55}ms` }}
              >
                <span className="pr-evo-check" aria-hidden="true">✦</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="pr-evo-bottom">
            <a href="#contatti" className="pr-evo-cta">
              {Te.ctaLabel || 'Parliamo della soluzione più adatta'}
            </a>
            <p className="pr-evo-note pr-mono">
              {Te.bottomNote || 'Il piano si attiva dopo il completamento del sito. Il costo varia in base al progetto.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


// ─────── FAQ ───────

function FaqItem({ faq, index }) {
  const [open, setOpen] = React.useState(false);
  const bodyId = `faq-${index}-body`;
  const triggerId = `faq-${index}-trigger`;

  return (
    <div className={`pr-faq-item${open ? ' open' : ''}`}>
      <button
        id={triggerId}
        className="pr-faq-q"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <span className="pr-mono pr-faq-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span className="pr-faq-qtext">{faq.q}</span>
        <span className="pr-faq-icon" aria-hidden="true" />
      </button>
      <div
        id={bodyId}
        className="pr-faq-body"
        role="region"
        aria-labelledby={triggerId}
        style={{ maxHeight: open ? '640px' : '0' }}
      >
        <p className="pr-faq-a">{faq.a}</p>
      </div>
    </div>
  );
}

function FAQ() {
  const lang = React.useContext(LangCtx);
  const Tf = (((window.VERTI_LANG || {})[lang] || {}).pricing || {}).faq || {};
  const faqs = Tf.items || [
    { q: 'Quanto costa un sito web?', a: "Dipende dalla complessità del progetto: i contenuti, le funzionalità, i tempi. Per questo il primo passo è sempre una conversazione, non un preventivo al buio." },
    { q: 'Quanto tempo ci vuole?', a: 'Tra tre e otto settimane per la maggior parte dei progetti.' },
    { q: "L'Evolution Plan è obbligatorio?", a: "No. Consegniamo sempre il sito completo e funzionante. L'Evolution Plan è una scelta." },
    { q: "Lavorate solo con aziende dell'Alto Adige?", a: 'Verti Studio nasce in Alto Adige e ha un legame profondo con il territorio e il suo tessuto imprenditoriale. Non abbiamo, però, limiti geografici. Siamo aperti a collaborazioni in tutta Italia e, dove il progetto lo richiede, anche in Europa.' },
    { q: 'Cosa succede se il risultato non mi soddisfa?', a: 'Lavoriamo con cicli di revisione strutturati. Prima di produrre qualsiasi pagina, wireframe e design vengono approvati insieme.' },
  ];

  return (
    <section className="pr-faq">
      <div className="pr-faq-inner">
        <div className="pr-faq-header">
          <FadeUp>
            <span className="pr-mono pr-section-label">{Tf.label || '005 / DOMANDE FREQUENTI'}</span>
          </FadeUp>
          <LineReveal delay={100} tag="h2" className="pr-section-title">
            <span>{Tf.titleA || 'Le domande'}</span>
          </LineReveal>
          <LineReveal delay={220} tag="h2" className="pr-section-title pr-section-title--italic">
            <span><em>{Tf.titleEm || 'che sappiamo già.'}</em></span>
          </LineReveal>
        </div>

        <div className="pr-faq-list">
          {faqs.map((f, i) => (
            <FadeUp key={i} delay={i * 50}>
              <FaqItem faq={f} index={i} />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────── CTA Finale ───────

function CTAFinale() {
  const [ref, inView] = useInView({ threshold: 0.2 });
  const lang = React.useContext(LangCtx);
  const Tc = (((window.VERTI_LANG || {})[lang] || {}).pricing || {}).cta || {};

  return (
    <section className="pr-cta" id="contatti" ref={ref}>
      <div className="pr-cta-bg" aria-hidden="true">
        <img src="assets/investmentsBG.jpg" alt="" className="pr-cta-bg-img" loading="lazy" decoding="async" />
        <div className="pr-cta-bg-veil" />
      </div>

      <div className="pr-cta-inner">
        <FadeUp>
          <span className="pr-mono pr-section-label">{Tc.label || '006 / INIZIAMO'}</span>
        </FadeUp>

        <LineReveal delay={100} tag="h2" className="pr-cta-title">
          <span>{Tc.titleA || 'Pronto a costruire'}</span>
        </LineReveal>
        <LineReveal delay={220} tag="h2" className="pr-cta-title pr-cta-title--italic">
          <span><em>{Tc.titleEm || 'qualcosa che dura?'}</em></span>
        </LineReveal>

        <FadeUp delay={400}>
          <p className="pr-cta-sub">
            {Tc.sub || 'Due modi per iniziare. Scegli quello che si avvicina di più al tuo punto di partenza.'}
          </p>
        </FadeUp>

        <FadeUp delay={560}>
          <div className="pr-cta-actions">
            <a
              href="mailto:info@vertistudio.com?subject=Preventivo%20Sartoriale"
              className={`pr-cta-btn pr-cta-btn--primary${inView ? ' in' : ''}`}
            >
              <span className="pr-mono pr-cta-btn-label">{Tc.btn1Label || 'Hai un progetto in mente?'}</span>
              <span className="pr-cta-btn-main">{Tc.btn1Main || 'Richiedi un Preventivo Sartoriale'}</span>
            </a>
            <a
              href="mailto:info@vertistudio.com?subject=Consulenza%20Strategica"
              className={`pr-cta-btn pr-cta-btn--secondary${inView ? ' in' : ''}`}
              style={{ transitionDelay: '110ms' }}
            >
              <span className="pr-mono pr-cta-btn-label">{Tc.btn2Label || 'Non sai da dove partire?'}</span>
              <span className="pr-cta-btn-main">{Tc.btn2Main || 'Prenota una Consulenza Strategica'}</span>
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={720}>
          <p className="pr-cta-reassurance pr-mono">
            {Tc.reassurance || 'Nessun impegno. Solo una conversazione.'}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ─────── Footer (identico all'homepage) ───────

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

// ─────── App ───────

function App() {
  const [lang, setLang] = useLang();

  React.useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
    console.log('%cVerti Studio', 'color:#c8b89a;font-family:serif;font-size:22px;font-weight:300;letter-spacing:0.1em;');
    console.log('%cHai trovato qualcosa. Se ti piace come lavoriamo, scrivici: info@vertistudio.com', 'color:#c8c4bc;font-size:12px;font-family:monospace;');
  }, []);

  return (
    <LangCtx.Provider value={lang}>
      {/* Barra di progresso scroll */}
      <div className="pr-scroll-progress" aria-hidden="true" />

      <Nav setLang={setLang} />
      <main id="main-content">
        <PricingHero />
        <SartorialitaSection />
        <Servizi />
        <EvolutionPlan />
        <FAQ />
        <CTAFinale />
      </main>
      <Footer />
    </LangCtx.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
