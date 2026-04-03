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
    tags: [{ label: 'D&D & Creative', className: 'showcase-tag--dnd' }],
    order: 1,
  },
  'dm-tools': {
    category: 'personal dnd',
    tags: [{ label: 'D&D & Creative', className: 'showcase-tag--dnd' }],
    order: 2,
  },
  'Living-scroll': {
    category: 'personal dnd',
    tags: [{ label: 'D&D & Creative', className: 'showcase-tag--dnd' }],
    order: 3,
  },
  'digital-DnD-character-sheet': {
    category: 'personal dnd',
    desc: 'A digital character sheet for D&D 5th Edition built in C++.',
    tags: [{ label: 'D&D & Creative', className: 'showcase-tag--dnd' }],
    order: 4,
  },
  'automation-node-red': {
    category: 'personal',
    desc: 'Node-RED flows for smart home automation — tying together IoT devices and custom logic.',
    tags: [{ label: 'Personal', className: 'showcase-tag--personal' }],
    langColor: '#e44d26',
    langName: 'Node-RED',
    order: 5,
  },
  'IIS-ITU-2021': {
    category: 'university',
    desc: 'Full-stack information system project built as part of IIS & ITU coursework at BUT.',
    tags: [{ label: 'University', className: 'showcase-tag--uni' }],
    order: 10,
  },
  'IVS2021': {
    category: 'university',
    desc: 'Practical aspects of software testing — verification and validation project at BUT.',
    tags: [{ label: 'University', className: 'showcase-tag--uni' }],
    order: 11,
  },
  'IMS': {
    category: 'university',
    desc: 'Modelling and simulation coursework project at Brno University of Technology.',
    tags: [{ label: 'University', className: 'showcase-tag--uni' }],
    order: 12,
  },
  'ISS2021': {
    category: 'university',
    desc: 'Signals and systems analysis project using Python at BUT.',
    tags: [{ label: 'University', className: 'showcase-tag--uni' }],
    order: 13,
  },
  'rpm-spec-wizard': {
    category: 'oss',
    desc: 'Fork of the RPM packaging wizard UI — contributed during Red Hat internship in 2019.',
    tags: [{ label: 'Open Source', className: 'showcase-tag--oss' }],
    order: 20,
  },
  'Prusa-Firmware-Buddy_custom_hw': {
    category: 'oss personal',
    desc: 'Custom hardware fork of the official Prusa Firmware Buddy for MK4 / MINI / XL printers.',
    tags: [{ label: 'Open Source', className: 'showcase-tag--oss' }],
    order: 21,
  },

  /* ---- Hidden repos (meta, configs, forks without purpose) ---- */
  'pjunak': { hide: true },                // GitHub profile README
  'petr.junak.eu': { hide: true },          // This website
};

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
  card.tabIndex = 0;

  const langName = config.langName || repo.language || '';
  const langColor = config.langColor || LANG_COLORS[repo.language] || '#888';

  // Build tags
  const tags = config.tags || [{ label: 'Personal', className: 'showcase-tag--personal' }];
  const tagHtml = tags
    .map((t) => `<span class="showcase-tag ${t.className}">${escapeHtml(t.label)}</span>`)
    .join('');

  const langHtml = langName
    ? `<span class="showcase-lang"><i class="fa-solid fa-circle" style="color:${langColor}"></i> ${escapeHtml(langName)}</span>`
    : '';

  // Stats line
  const stats = [];
  if (repo.stargazers_count > 0) {
    stats.push(`<span><i class="fa-solid fa-star"></i> ${repo.stargazers_count}</span>`);
  }
  if (repo.fork && repo.source) {
    stats.push(`<span><i class="fa-solid fa-code-fork"></i> Fork of ${escapeHtml(repo.source.full_name)}</span>`);
  } else if (repo.fork) {
    stats.push(`<span><i class="fa-solid fa-code-fork"></i> Fork</span>`);
  }
  stats.push(`<span><i class="fa-brands fa-github"></i> ${escapeHtml(repo.full_name)}</span>`);

  const description = config.desc || repo.description || 'No description provided.';

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
    <span class="showcase-card-cta">View on GitHub <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
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
  grid.innerHTML = `
    <div class="showcase-card showcase-card--no-img" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
      <div class="showcase-card-body">
        <p class="showcase-card-desc">
          Couldn't load repositories right now. Visit my
          <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener" style="color: var(--purple); font-weight: 600;">GitHub profile</a>
          to browse them directly.
        </p>
      </div>
    </div>
  `;
}

/**
 * Main: fetch repos and render the grid.
 */
async function initProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  showSkeleton(grid, 6);

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const repos = await response.json();

    // Merge config, filter hidden, and sort
    const cards = repos
      .map((repo) => ({
        repo,
        config: REPO_CONFIG[repo.name] || {},
      }))
      .filter(({ config }) => !config.hide)
      .sort((a, b) => (a.config.order || 100) - (b.config.order || 100));

    // Render
    grid.innerHTML = '';
    cards.forEach(({ repo, config }) => {
      grid.appendChild(buildCard(repo, config));
    });

    // Re-apply current filter (in case user clicked a chip during loading)
    const activeChip = document.querySelector('.filter-chip.active');
    if (activeChip && activeChip.dataset.filter !== 'all') {
      activeChip.click();
    }

    // Re-attach filter chip logic to the new cards
    reinitFilterChips();
  } catch (err) {
    console.warn('GitHub API fetch failed:', err);
    showFallback(grid);
  }
}

/**
 * Re-bind filter chips to the dynamically rendered cards.
 * This replaces the static initFilterChips for the projects page.
 */
function reinitFilterChips() {
  const filterBars = document.querySelectorAll('.filter-bar');

  filterBars.forEach((bar) => {
    const chips = bar.querySelectorAll('.filter-chip');
    const grid = document.querySelector('.card-grid');
    if (!grid) return;

    chips.forEach((chip) => {
      // Clone to remove old listeners, then re-add
      const newChip = chip.cloneNode(true);
      chip.replaceWith(newChip);

      newChip.addEventListener('click', () => {
        const filter = newChip.dataset.filter;
        const cards = grid.querySelectorAll('.showcase-card');

        bar.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
        newChip.classList.add('active');

        cards.forEach((card) => {
          if (filter === 'all') {
            card.classList.remove('hidden');
          } else {
            const categories = (card.dataset.category || '').split(/\s+/);
            card.classList.toggle('hidden', !categories.includes(filter));
          }
        });
      });
    });
  });
}

/* Script loaded with defer — DOM is ready */
initProjects();
