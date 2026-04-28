/* ========================================
   Internationalization (i18n)
   Supports English (default) and Czech.
   Slovak visitors get Czech; anything else → English.

   Usage in HTML:
     <span data-i18n="key">English fallback</span>
     <meta data-i18n-attr="content:meta.description" content="...">
     <a data-i18n-attr="aria-label:nav.theme_toggle;title:nav.theme_toggle" ...>

   Usage in JS:
     window.i18n.t('key')
     document.addEventListener('i18n:change', (e) => { ... e.detail.lang ... });
   ======================================== */

(function () {
  const SUPPORTED = ['en', 'cs'];
  const CZECH_FAMILY = ['cs', 'sk']; // Slovak visitors default to Czech
  const STORAGE_KEY = 'lang';

  const TRANSLATIONS = {
    en: {
      /* Meta */
      'meta.title':        'Petr Junák — Software & IT Engineer',
      'meta.description':  'Personal CV of Petr Junák — software and IT engineer based in Brno, CZ. Python, JavaScript, networking, CI/CD, and 3D design.',
      'meta.og_title':     'Petr Junák — CV',
      'meta.og_description': 'Software & IT Engineer. Programmer, DIY enthusiast & tinkerer. View my interactive CV.',

      /* Sticky Nav */
      'nav.experience':       'Experience',
      'nav.skills':           'Skills',
      'nav.languages':        'Languages',
      'nav.education':        'Education',
      'nav.hobbies':          'Hobbies',
      'nav.models':           'Models',
      'nav.projects':         'Projects',
      'nav.email_cta':        'Email me',
      'nav.theme_toggle':     'Toggle dark mode',
      'nav.lang_switch_cs':   'Přepnout do češtiny',
      'nav.lang_switch_en':   'Switch to English',

      /* Hero */
      'hero.available':       'Available for new opportunities',
      'hero.role':            'Software & IT Engineer',
      'hero.tagline':         'Python · JavaScript · Networking · CI/CD · Git',
      'hero.education':       'BSc in Information Technology — Brno University of Technology, 2024',
      'hero.tip_email':       'Email',
      'hero.tip_phone':       'Phone',
      'hero.chip_networking': 'Networking',

      /* About */
      'about.text':           "I'm a software and IT engineer with 3+ years of professional experience across application development, network infrastructure, and automation. I've built monitoring tools from scratch, established CI/CD pipelines, and worked across the stack from Python scripts to ServiceNow integrations. I'm equally comfortable diving into code and handling infrastructure challenges — and I bring a maker's instinct for creative problem-solving to everything I work on.",
      'about.philosophy':     'A broken thing is an opportunity to learn by fixing it.',

      /* Experience */
      'experience.title':           'Experience',
      'exp.honeywell_it.role':      'IT Analyst',
      'exp.honeywell_it.meta':      'Sep 2023 – Mar 2025 · Brno, CZ',
      'exp.honeywell_it.item1':     'Scaled a local audit script into a comprehensive monitoring application for <strong>tracking configuration compliance</strong> and performance bottlenecks.',
      'exp.honeywell_it.item2':     'Standardized development workflows by establishing <strong>GitHub CI/CD</strong> and testing guidelines, reducing deployment errors.',
      'exp.honeywell_it.item3':     'Co-developed user-facing ServiceNow forms that simplified reporting of device issues.',
      'exp.honeywell_net.role':     'Network Technician',
      'exp.honeywell_net.meta':     'Jan 2023 – Sep 2023 · Brno, CZ',
      'exp.honeywell_net.item1':    'Shadowed senior engineers to learn infrastructure and IT workflows.',
      'exp.honeywell_net.item2':    '<strong>Led a small team</strong> to develop automated audit solution that <strong>aggregated network accessibility data</strong> to flag discontinued devices, cutting unnecessary licensing costs.',
      'exp.redhat.role':            'Software Engineer Intern',
      'exp.redhat.meta':            'Jun 2019 – Sep 2019 · Brno, CZ',
      'exp.redhat.item1':           'High school internship; spent most of the time <strong>debugging and linting Python code</strong> using pylint and similar tools.',
      'exp.redhat.item2':           'Contributed to an <strong>RPM packaging wizard UI</strong> with the engineering team.',
      'exp.livinin.role':           'Smart Home Technician',
      'exp.livinin.meta':           'Jul 2018 – Aug 2020 · Brno, CZ',
      'exp.livinin.item1':          'Installed and wired smart home systems independently.',
      'exp.livinin.item2':          'Hands-on electronics work including soldering sensors and security components such as fingerprint scanners.',

      /* Skills */
      'skills.title':              'Strengths & Skills',
      'skills.group_programming':  'Programming',
      'skills.group_tools':        'Tools',
      'skills.group_soft':         'Soft Skills',
      'skills.group_maker':        'Maker',
      'skill.testing_debugging':   'Testing & debugging',
      'skill.networking':          'Networking',
      'skill.monitoring':          'Monitoring',
      'skill.hardworking':         'Hard-working',
      'skill.fast_learner':        'Fast learner',
      'skill.problem_solving':     'Problem solving oriented',
      'skill.team_player':         'Team player',
      'skill.creative':            'Creative',
      'skill.3d_design':           '3D Design & Modeling',
      'skill.soldering':           'Soldering',

      /* Languages */
      'languages.title':    'Languages',
      'lang.czech':         'Czech',
      'lang.english':       'English',
      'lang.level_native':  'Native',

      /* Education */
      'education.title':         'Education',
      'education.degree':        "Bachelor's in Information Technology",
      'education.school':        'Brno University of Technology',
      'education.meta':          'Sep 2019 – Jul 2024 · Brno, CZ',
      'education.thesis_label':  'Thesis:',
      'education.thesis_text':   'Smart home sleep optimization — predicted ideal sleep onset using a random forest regression model trained on smart ring sleep data, user physical state, and target wake time; controlled smart lighting to promote natural tiredness.',

      /* Hobbies */
      'hobbies.title':            'Hobbies',
      'hobby.3d_printers':        'Tinkering with 3D printers',
      'hobby.dnd':                'D&D & creative writing',
      'hobby.learning':           'Learning new things',
      'hobby.programming':        'Programming & OSS',
      'hobby.3d_design':          '3D design & modeling',
      'hobby.games_books':        'Video games & books',
      'hobby.poetry':             'Reading & writing poetry',
      'hobby.hint_hover':         'Hover a segment',
      'hobby.hint_tap':           'Tap a segment',

      /* Explore More */
      'explore.title':           'Explore More',
      'explore.models_title':    '3D Models',
      'explore.models_desc':     'Browse my 3D printable designs for Rat Rig V-Core 4, Prusa, and more on Printables.',
      'explore.models_cta':      'View models',
      'explore.projects_title':  'Projects',
      'explore.projects_desc':   'D&D tools, home automation, university coursework, and open-source contributions on GitHub.',
      'explore.projects_cta':    'View projects',

      /* Footer */
      'footer.copy':  '© 2026 Petr Junák. All rights reserved.',
      'footer.copy_short': '© 2026 Petr Junák',

      /* CV download */
      'cv.pdf_path': 'assets/cv-en.pdf',
      'cv.tooltip':  'Download CV',

      /* Projects page */
      'projects.meta_title':        'Projects — Petr Junák',
      'projects.meta_description':  'Programming projects by Petr Junák — D&D tools, automation, university coursework, and open-source contributions.',
      'projects.back':              'Back to CV',
      'projects.sibling_models':    '3D Models',
      'projects.title':             'Projects',
      'projects.subtitle':          'A selection of personal and university projects. Most are on GitHub — feel free to explore, fork, or contribute.',
      'projects.filter_all':        'All',
      'projects.filter_personal':   'Personal',
      'projects.filter_dnd':        'D&D & Creative',
      'projects.filter_university': 'University',
      'projects.filter_oss':        'Open Source',
      'projects.view_all':          'View all repositories on GitHub',
      'projects.fallback':          "Couldn't load repositories right now. Visit my <a href=\"https://github.com/pjunak\" target=\"_blank\" rel=\"noopener\" style=\"color: var(--purple); font-weight: 600;\">GitHub profile</a> to browse them directly.",
      'projects.tag_personal':      'Personal',
      'projects.tag_dnd':           'D&D & Creative',
      'projects.tag_university':    'University',
      'projects.tag_oss':           'Open Source',
      'projects.cta_view_github':   'View on GitHub',
      'projects.no_description':    'No description provided.',
      'projects.fork_of':           'Fork of',
      'projects.fork':              'Fork',

      /* Models page */
      'models.meta_title':          '3D Models — Petr Junák',
      'models.meta_description':    '3D printable models designed by Petr Junák — Rat Rig V-Core 4 mods, Prusa upgrades, and more.',
      'models.back':                'Back to CV',
      'models.sibling_projects':    'Projects',
      'models.title':               '3D Models',
      'models.subtitle':            'I design and remix 3D printable parts mostly for my own printers — a <strong>Rat Rig V-Core 4</strong> and a <strong>Prusa MK3.5</strong>. All models are published on Printables under open licenses.',
      'models.filter_all':          'All',
      'models.filter_ratrig':       'Rat Rig V-Core 4',
      'models.filter_prusa':        'Prusa',
      'models.view_all':            'View all models on Printables',
      'models.cta_view_printables': 'View on Printables',
      'models.stat_collections':    'collections',

      /* 404 */
      'err.meta_title':  '404 — Page Not Found',
      'err.title':       'Page not found',
      'err.description': "The page you're looking for doesn't exist or has been moved.",
      'err.home':        'Back to homepage',
    },

    cs: {
      /* Meta */
      'meta.title':        'Petr Junák — Softwarový a IT inženýr',
      'meta.description':  'Osobní životopis Petra Junáka — softwarový a IT inženýr z Brna. Python, JavaScript, sítě, CI/CD a 3D design.',
      'meta.og_title':     'Petr Junák — Životopis',
      'meta.og_description': 'Softwarový a IT inženýr. Programátor, kutil a nadšenec. Prohlédněte si můj interaktivní životopis.',

      /* Sticky Nav */
      'nav.experience':       'Praxe',
      'nav.skills':           'Dovednosti',
      'nav.languages':        'Jazyky',
      'nav.education':        'Vzdělání',
      'nav.hobbies':          'Záliby',
      'nav.models':           'Modely',
      'nav.projects':         'Projekty',
      'nav.email_cta':        'Napište mi',
      'nav.theme_toggle':     'Přepnout tmavý režim',
      'nav.lang_switch_cs':   'Přepnout do češtiny',
      'nav.lang_switch_en':   'Switch to English',

      /* Hero */
      'hero.available':       'Otevřen novým příležitostem',
      'hero.role':            'Softwarový a IT inženýr',
      'hero.tagline':         'Python · JavaScript · Sítě · CI/CD · Git',
      'hero.education':       'Bakalář informačních technologií — Vysoké učení technické v Brně, 2024',
      'hero.tip_email':       'E-mail',
      'hero.tip_phone':       'Telefon',
      'hero.chip_networking': 'Sítě',

      /* About */
      'about.text':           'Jsem softwarový a IT inženýr s více než 3 lety profesní praxe v oblastech vývoje aplikací, síťové infrastruktury a automatizace. Od nuly jsem postavil monitorovací nástroje, zavedl CI/CD pipeline a pracoval napříč celým stackem — od Python skriptů až po integrace se ServiceNow. Se stejnou samozřejmostí se ponořím do kódu i do infrastrukturních výzev, a ke každému úkolu přistupuji s kutilským instinktem a kreativním řešením problémů.',
      'about.philosophy':     'Rozbitá věc je příležitost něco se při opravě naučit.',

      /* Experience */
      'experience.title':           'Praxe',
      'exp.honeywell_it.role':      'IT analytik',
      'exp.honeywell_it.meta':      '9/2023 – 3/2025 · Brno, ČR',
      'exp.honeywell_it.item1':     'Rozšířil jsem lokální auditní skript do komplexní monitorovací aplikace pro <strong>sledování souladu konfigurací</strong> a výkonnostních úzkých míst.',
      'exp.honeywell_it.item2':     'Standardizoval jsem vývojové procesy zavedením <strong>GitHub CI/CD</strong> a pravidel pro testování, čímž se snížil počet chyb při nasazení.',
      'exp.honeywell_it.item3':     'Spolupodílel jsem se na vývoji uživatelských formulářů v ServiceNow, které zjednodušily hlášení problémů se zařízeními.',
      'exp.honeywell_net.role':     'Síťový technik',
      'exp.honeywell_net.meta':     '1/2023 – 9/2023 · Brno, ČR',
      'exp.honeywell_net.item1':    'Zaučoval jsem se u seniorních inženýrů a osvojil si práci s infrastrukturou a IT procesy.',
      'exp.honeywell_net.item2':    '<strong>Vedl jsem malý tým</strong> při vývoji automatizovaného auditního řešení, které <strong>agregovalo data o dostupnosti sítě</strong> a označovalo vyřazená zařízení — čímž se snížily zbytečné náklady na licence.',
      'exp.redhat.role':            'Softwarový inženýr — stáž',
      'exp.redhat.meta':            '6/2019 – 9/2019 · Brno, ČR',
      'exp.redhat.item1':           'Středoškolská stáž; většinu času jsem strávil <strong>debugováním a lintováním Python kódu</strong> pomocí pylintu a podobných nástrojů.',
      'exp.redhat.item2':           'Přispíval jsem do <strong>uživatelského rozhraní průvodce RPM balíčky</strong> společně s inženýrským týmem.',
      'exp.livinin.role':           'Technik chytré domácnosti',
      'exp.livinin.meta':           '7/2018 – 8/2020 · Brno, ČR',
      'exp.livinin.item1':          'Samostatně jsem instaloval a zapojoval systémy chytré domácnosti.',
      'exp.livinin.item2':          'Praktická práce s elektronikou včetně pájení senzorů a bezpečnostních komponent, jako jsou čtečky otisků prstů.',

      /* Skills */
      'skills.title':              'Silné stránky a dovednosti',
      'skills.group_programming':  'Programování',
      'skills.group_tools':        'Nástroje',
      'skills.group_soft':         'Měkké dovednosti',
      'skills.group_maker':        'Kutil',
      'skill.testing_debugging':   'Testování a ladění',
      'skill.networking':          'Sítě',
      'skill.monitoring':          'Monitoring',
      'skill.hardworking':         'Pracovitost',
      'skill.fast_learner':        'Rychlé učení',
      'skill.problem_solving':     'Zaměření na řešení problémů',
      'skill.team_player':         'Týmový hráč',
      'skill.creative':            'Kreativita',
      'skill.3d_design':           '3D návrh a modelování',
      'skill.soldering':           'Pájení',

      /* Languages */
      'languages.title':    'Jazyky',
      'lang.czech':         'Čeština',
      'lang.english':       'Angličtina',
      'lang.level_native':  'Rodilý mluvčí',

      /* Education */
      'education.title':         'Vzdělání',
      'education.degree':        'Bakalář informačních technologií',
      'education.school':        'Vysoké učení technické v Brně',
      'education.meta':          '9/2019 – 7/2024 · Brno, ČR',
      'education.thesis_label':  'Bakalářská práce:',
      'education.thesis_text':   'Optimalizace spánku v chytré domácnosti — predikce ideálního času usnutí pomocí regresního modelu random forest trénovaného na datech ze smart prstenu, fyzickém stavu uživatele a cílovém času probuzení; řízení chytrého osvětlení pro podporu přirozené únavy.',

      /* Hobbies */
      'hobbies.title':            'Záliby',
      'hobby.3d_printers':        'Kutění s 3D tiskárnami',
      'hobby.dnd':                'D&D a tvůrčí psaní',
      'hobby.learning':           'Učení nových věcí',
      'hobby.programming':        'Programování a open source',
      'hobby.3d_design':          '3D návrh a modelování',
      'hobby.games_books':        'Videohry a knihy',
      'hobby.poetry':             'Čtení a psaní poezie',
      'hobby.hint_hover':         'Najeďte na výseč',
      'hobby.hint_tap':           'Klepněte na výseč',

      /* Explore More */
      'explore.title':           'Prozkoumat více',
      'explore.models_title':    '3D modely',
      'explore.models_desc':     'Prohlédněte si mé 3D tisknutelné návrhy pro Rat Rig V-Core 4, Prusa a další na Printables.',
      'explore.models_cta':      'Zobrazit modely',
      'explore.projects_title':  'Projekty',
      'explore.projects_desc':   'D&D nástroje, domácí automatizace, univerzitní projekty a open-source příspěvky na GitHubu.',
      'explore.projects_cta':    'Zobrazit projekty',

      /* Footer */
      'footer.copy':  '© 2026 Petr Junák. Všechna práva vyhrazena.',
      'footer.copy_short': '© 2026 Petr Junák',

      /* CV download */
      'cv.pdf_path': 'assets/cv-cz.pdf',
      'cv.tooltip':  'Stáhnout životopis',

      /* Projects page */
      'projects.meta_title':        'Projekty — Petr Junák',
      'projects.meta_description':  'Programátorské projekty Petra Junáka — D&D nástroje, automatizace, univerzitní projekty a open-source příspěvky.',
      'projects.back':              'Zpět na životopis',
      'projects.sibling_models':    '3D modely',
      'projects.title':             'Projekty',
      'projects.subtitle':          'Výběr osobních a univerzitních projektů. Většina je na GitHubu — neváhejte si je prohlédnout, forkovat nebo přispět.',
      'projects.filter_all':        'Vše',
      'projects.filter_personal':   'Osobní',
      'projects.filter_dnd':        'D&D a tvůrčí',
      'projects.filter_university': 'Univerzitní',
      'projects.filter_oss':        'Open Source',
      'projects.view_all':          'Zobrazit všechny repozitáře na GitHubu',
      'projects.fallback':          'Repozitáře se teď nepodařilo načíst. Navštivte můj <a href="https://github.com/pjunak" target="_blank" rel="noopener" style="color: var(--purple); font-weight: 600;">GitHub profil</a> a prohlédněte si je přímo tam.',
      'projects.tag_personal':      'Osobní',
      'projects.tag_dnd':           'D&D a tvůrčí',
      'projects.tag_university':    'Univerzitní',
      'projects.tag_oss':           'Open Source',
      'projects.cta_view_github':   'Zobrazit na GitHubu',
      'projects.no_description':    'Bez popisu.',
      'projects.fork_of':           'Fork z',
      'projects.fork':              'Fork',

      /* Models page */
      'models.meta_title':          '3D modely — Petr Junák',
      'models.meta_description':    '3D tisknutelné modely navržené Petrem Junákem — úpravy pro Rat Rig V-Core 4, vylepšení Prusa a další.',
      'models.back':                'Zpět na životopis',
      'models.sibling_projects':    'Projekty',
      'models.title':               '3D modely',
      'models.subtitle':            'Navrhuji a remixuji 3D tisknutelné díly, především pro své tiskárny — <strong>Rat Rig V-Core 4</strong> a <strong>Prusa MK3.5</strong>. Všechny modely publikuji na Printables pod otevřenými licencemi.',
      'models.filter_all':          'Vše',
      'models.filter_ratrig':       'Rat Rig V-Core 4',
      'models.filter_prusa':        'Prusa',
      'models.view_all':            'Zobrazit všechny modely na Printables',
      'models.cta_view_printables': 'Zobrazit na Printables',
      'models.stat_collections':    'kolekcí',

      /* 404 */
      'err.meta_title':  '404 — Stránka nenalezena',
      'err.title':       'Stránka nenalezena',
      'err.description': 'Stránka, kterou hledáte, neexistuje nebo byla přesunuta.',
      'err.home':        'Zpět na hlavní stránku',
    },
  };

  function detectLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;

    const browser = (navigator.language || 'en').toLowerCase().split('-')[0];
    return CZECH_FAMILY.includes(browser) ? 'cs' : 'en';
  }

  function getDict(lang) {
    return TRANSLATIONS[lang] || TRANSLATIONS.en;
  }

  function t(key) {
    const dict = getDict(currentLang);
    return dict[key] !== undefined ? dict[key] : key;
  }

  function applyTranslations(lang) {
    const dict = getDict(lang);
    document.documentElement.setAttribute('lang', lang);

    // textContent / innerHTML via data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // Attribute translations via data-i18n-attr="attr1:key1;attr2:key2"
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(';').forEach((pair) => {
        const idx = pair.indexOf(':');
        if (idx < 0) return;
        const attr = pair.slice(0, idx).trim();
        const key = pair.slice(idx + 1).trim();
        if (attr && key && dict[key] !== undefined) {
          el.setAttribute(attr, dict[key]);
        }
      });
    });

    // Document title fallback — look for <title data-i18n="...">
    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      const key = titleEl.getAttribute('data-i18n');
      if (dict[key]) document.title = dict[key];
    }
  }

  function updateToggle(btn, lang) {
    if (!btn) return;
    // Show the language you're currently viewing (click to switch)
    btn.textContent = lang.toUpperCase();
    const dict = getDict(lang);
    const aria = lang === 'cs' ? dict['nav.lang_switch_en'] : dict['nav.lang_switch_cs'];
    btn.setAttribute('aria-label', aria);
    btn.setAttribute('title', aria);
  }

  function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) lang = 'en';
    currentLang = lang;
    applyTranslations(lang);

    document.querySelectorAll('.lang-toggle').forEach((btn) => updateToggle(btn, lang));

    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang } }));
  }

  let currentLang = detectLanguage();

  // Apply translations immediately if the DOM is already parsed
  function init() {
    applyTranslations(currentLang);

    document.querySelectorAll('.lang-toggle').forEach((btn) => {
      updateToggle(btn, currentLang);
      btn.addEventListener('click', () => {
        const next = currentLang === 'cs' ? 'en' : 'cs';
        localStorage.setItem(STORAGE_KEY, next);
        setLanguage(next);
      });
    });

    document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang: currentLang } }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.i18n = {
    get lang() { return currentLang; },
    t,
    set: setLanguage,
  };
})();
