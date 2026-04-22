/* ========================================
   Dynamic GitHub Projects
   Fetches repos from the GitHub API and renders
   project cards, with manual overrides for metadata
   the API doesn't provide (categories, descriptions).
   ======================================== */

/**
 * Repo configuration: custom categories, descriptions, and display order.
 * Repos not listed here will still appear (under "Personal") unless hidden.
 *
 * Fields:
 *   category   — space-separated filter tags (personal, dnd, university, oss)
 *   desc       — override the GitHub description
 *   hide       — true to exclude from the grid
 *   tags       — array of tag objects: { label, className }
 *   langColor  — override the language dot color
 *   order      — lower numbers appear first (default: 100)
 */
const REPO_CONFIG = {
  'DnDAudio': {
    category: 'personal dnd',
    tagKey: 'dnd',
    order: 1,
  },
  'dm-tools': {
    category: 'personal dnd',
    tagKey: 'dnd',
    order: 2,
  },
  'Living-scroll': {
    category: 'personal dnd',
    tagKey: 'dnd',
    order: 3,
  },
  'digital-DnD-character-sheet': {
    category: 'personal dnd',
    desc: {
      en: 'A digital character sheet for D&D 5th Edition built in C++.',
      cs: 'Digitální list postavy pro D&D 5. edici vytvořený v C++.',
    },
    tagKey: 'dnd',
    order: 4,
  },
  'automation-node-red': {
    category: 'personal',
    desc: {
      en: 'Node-RED flows for smart home automation — tying together IoT devices and custom logic.',
      cs: 'Node-RED flow pro automatizaci chytré domácnosti — propojení IoT zařízení s vlastní logikou.',
    },
    tagKey: 'personal',
    langColor: '#e44d26',
    langName: 'Node-RED',
    order: 5,
  },
  'IIS-ITU-2021': {
    category: 'university',
    desc: {
      en: 'Full-stack information system project built as part of IIS & ITU coursework at BUT.',
      cs: 'Full-stack informační systém vyvinutý v rámci předmětů IIS a ITU na VUT.',
    },
    tagKey: 'university',
    order: 10,
  },
  'IVS2021': {
    category: 'university',
    desc: {
      en: 'Practical aspects of software testing — verification and validation project at BUT.',
      cs: 'Praktické aspekty testování softwaru — projekt verifikace a validace na VUT.',
    },
    tagKey: 'university',
    order: 11,
  },
  'IMS': {
    category: 'university',
    desc: {
      en: 'Modelling and simulation coursework project at Brno University of Technology.',
      cs: 'Projekt z předmětu Modelování a simulace na VUT v Brně.',
    },
    tagKey: 'university',
    order: 12,
  },
  'ISS2021': {
    category: 'university',
    desc: {
      en: 'Signals and systems analysis project using Python at BUT.',
      cs: 'Projekt analýzy signálů a systémů v Pythonu na VUT.',
    },
    tagKey: 'university',
    order: 13,
  },
  'rpm-spec-wizard': {
    category: 'oss',
    desc: {
      en: 'Fork of the RPM packaging wizard UI — contributed during Red Hat internship in 2019.',
      cs: 'Fork UI průvodce RPM balíčky — příspěvek z mé stáže v Red Hatu v roce 2019.',
    },
    tagKey: 'oss',
    order: 20,
  },
  'Prusa-Firmware-Buddy_custom_hw': {
    category: 'oss personal',
    desc: {
      en: 'Custom hardware fork of the official Prusa Firmware Buddy for MK4 / MINI / XL printers.',
      cs: 'Fork oficiálního Prusa Firmware Buddy pro vlastní hardware tiskáren MK4 / MINI / XL.',
    },
    tagKey: 'oss',
    order: 21,
  },

  /* ---- Hidden repos (meta, configs, forks without purpose) ---- */
  'pjunak': { hide: true },                // GitHub profile README
  'petr.junak.eu': { hide: true },          // This website
};

/** Tag metadata by key — label is resolved at render time via i18n. */
const TAG_META = {
  personal:   { i18nKey: 'projects.tag_personal',   className: 'showcase-tag--personal' },
  dnd:        { i18nKey: 'projects.tag_dnd',        className: 'showcase-tag--dnd' },
  university: { i18nKey: 'projects.tag_university', className: 'showcase-tag--uni' },
  oss:        { i18nKey: 'projects.tag_oss',        className: 'showcase-tag--oss' },
};

function translate(key, fallback) {
  return window.i18n ? window.i18n.t(key) : (fallback !== undefined ? fallback : key);
}

function resolveDesc(cfg, repo) {
  const lang = window.i18n ? window.i18n.lang : 'en';
  if (cfg.desc && typeof cfg.desc === 'object') {
    return cfg.desc[lang] || cfg.desc.en || repo.description || translate('projects.no_description', 'No description provided.');
  }
  if (typeof cfg.desc === 'string') return cfg.desc;
  return repo.description || translate('projects.no_description', 'No description provided.');
}

/** GitHub language → dot color mapping (common languages) */
const LANG_COLORS = {
  'Python':     '#3572A5',
  'JavaScript': '#f1e05a',
  'TypeScript': '#3178c6',
  'C#':         '#68217a',
  'C++':        '#f34b7d',
  'C':          '#555555',
  'HTML':       '#e34c26',
  'CSS':        '#563d7c',
  'PHP':        '#4f5d95',
  'Shell':      '#89e051',
  'Java':       '#b07219',
  'Go':         '#00ADD8',
  'Rust':       '#dea584',
};

const GITHUB_USER = 'pjunak';
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const REPO_CACHE_KEY = 'gh_repos_cache_v1';
const REPO_CACHE_TTL = 60 * 60 * 1000; // 1 hour

function readCachedRepos() {
  try {
    const raw = localStorage.getItem(REPO_CACHE_KEY);
    if (!raw) return null;
    const { repos, savedAt } = JSON.parse(raw);
    if (!repos || !savedAt || Date.now() - savedAt > REPO_CACHE_TTL) return null;
    return repos;
  } catch (e) { return null; }
}

function writeCachedRepos(repos) {
  try {
    localStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ repos, savedAt: Date.now() }));
  } catch (e) { /* quota/privacy mode — ignore */ }
}

/* ---- Rendering helpers ---- */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Build a single showcase card element for a repo.
 * @param {Object} repo — GitHub API repo object
 * @param {Object} config — merged config for this repo
 * @returns {HTMLElement}
 */
function buildCard(repo, config) {
  const card = document.createElement('a');
  card.href = repo.html_url;
  card.target = '_blank';
  card.rel = 'noopener';
  card.className = 'showcase-card showcase-card--no-img';
  card.dataset.category = config.category || 'personal';
  card.dataset.repoName = repo.name;
  card.tabIndex = 0;

  const langName = config.langName || repo.language || '';
  const langColor = config.langColor || LANG_COLORS[repo.language] || '#888';

  // Build tag — resolved via i18n at render (and on language change)
  const tagKey = config.tagKey || 'personal';
  const tagMeta = TAG_META[tagKey] || TAG_META.personal;
  const tagLabel = translate(tagMeta.i18nKey);
  const tagHtml = `<span class="showcase-tag ${tagMeta.className}" data-i18n="${tagMeta.i18nKey}">${escapeHtml(tagLabel)}</span>`;

  const langHtml = langName
    ? `<span class="showcase-lang"><i class="fa-solid fa-circle" style="color:${langColor}"></i> ${escapeHtml(langName)}</span>`
    : '';

  // Stats line
  const stats = [];
  if (repo.stargazers_count > 0) {
    stats.push(`<span><i class="fa-solid fa-star"></i> ${repo.stargazers_count}</span>`);
  }
  if (repo.fork && repo.source) {
    stats.push(`<span><i class="fa-solid fa-code-fork"></i> ${escapeHtml(translate('projects.fork_of', 'Fork of'))} ${escapeHtml(repo.source.full_name)}</span>`);
  } else if (repo.fork) {
    stats.push(`<span><i class="fa-solid fa-code-fork"></i> ${escapeHtml(translate('projects.fork', 'Fork'))}</span>`);
  }
  stats.push(`<span><i class="fa-brands fa-github"></i> ${escapeHtml(repo.full_name)}</span>`);

  const description = resolveDesc(config, repo);
  const ctaLabel = translate('projects.cta_view_github', 'View on GitHub');

  card.innerHTML = `
    <div class="showcase-card-body">
      <div class="showcase-tag-row">
        ${tagHtml}
        ${langHtml}
      </div>
      <h3 class="showcase-card-title">${escapeHtml(repo.name)}</h3>
      <p class="showcase-card-desc">${escapeHtml(description)}</p>
      <div class="showcase-card-stats">
        ${stats.join('\n        ')}
      </div>
    </div>
    <span class="showcase-card-cta"><span>${escapeHtml(ctaLabel)}</span> <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
  `;

  return card;
}

/**
 * Render a loading skeleton in the grid while data is fetched.
 */
function showSkeleton(grid, count) {
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'showcase-card showcase-card--no-img showcase-card--skeleton';
    card.setAttribute('aria-hidden', 'true');
    card.innerHTML = `
      <div class="showcase-card-body">
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line skeleton-line--title"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
    `;
    grid.appendChild(card);
  }
}

/**
 * Show a fallback message when the API fails.
 */
function showFallback(grid) {
  const fallback = translate('projects.fallback');
  grid.innerHTML = `
    <div class="showcase-card showcase-card--no-img" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
      <div class="showcase-card-body">
        <p class="showcase-card-desc" data-i18n="projects.fallback">${fallback}</p>
      </div>
    </div>
  `;
}

/** Cached repo list so we can re-render on language change. */
let CACHED_CARDS = null;

function renderCards(grid, cards) {
  grid.innerHTML = '';
  cards.forEach(({ repo, config }) => {
    grid.appendChild(buildCard(repo, config));
  });

  // subpage.js uses event delegation, so listeners already cover the new cards.
  // Just re-apply whatever filter the user had selected.
  if (typeof reapplyActiveFilter === 'function') reapplyActiveFilter();
}

function buildSortedCards(repos) {
  return repos
    .map((repo) => ({ repo, config: REPO_CONFIG[repo.name] || {} }))
    .filter(({ config }) => !config.hide)
    .sort((a, b) => (a.config.order || 100) - (b.config.order || 100));
}

/**
 * Main: fetch repos (with a 1-hour localStorage cache to dodge GitHub rate limits)
 * and render the grid.
 */
async function initProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  // If we have a recent cache, paint from it immediately — the fetch refreshes it in the background
  const cached = readCachedRepos();
  if (cached) {
    CACHED_CARDS = buildSortedCards(cached);
    renderCards(grid, CACHED_CARDS);
  } else {
    showSkeleton(grid, 6);
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const repos = await response.json();
    writeCachedRepos(repos);

    CACHED_CARDS = buildSortedCards(repos);
    renderCards(grid, CACHED_CARDS);
  } catch (err) {
    console.warn('GitHub API fetch failed:', err);
    // Keep whatever cached view we rendered; only show the fallback if we had nothing
    if (!cached) showFallback(grid);
  }
}

// Re-render cards when language changes so descriptions, tag labels,
// "Fork of X", and CTA text update in one pass.
document.addEventListener('i18n:change', () => {
  const grid = document.getElementById('projectsGrid');
  if (grid && CACHED_CARDS) renderCards(grid, CACHED_CARDS);
});

/* Script loaded with defer — DOM is ready */
initProjects();
