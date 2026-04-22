/* ========================================
   CV Webpage — petr.junak.eu
   Main JavaScript
   ======================================== */

/* Scripts loaded with defer — DOM is ready when this runs */
initThemeToggle();
initStickyNav();
initScrollReveal();
initLanguageBars();
initDonutChart();
initExpandableCards();
initActiveNavHighlight();

/* ----------------------------------------
   Sticky Navigation
   ---------------------------------------- */
function initStickyNav() {
  const nav = document.getElementById('stickyNav');
  const hero = document.querySelector('.hero');
  if (!nav || !hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      nav.classList.toggle('visible', !entry.isIntersecting);
    },
    { threshold: 0 }
  );

  observer.observe(hero);
}

/* ----------------------------------------
   Expandable Experience Cards
   - Touch: tap to toggle (but let taps on links work)
   - Keyboard: Enter/Space to toggle
   - aria-expanded reflects the .expanded class
   ---------------------------------------- */
function initExpandableCards() {
  const cards = document.querySelectorAll('.experience-card');
  if (!cards.length) return;

  const isTouch = window.matchMedia('(hover: none)').matches;

  function toggle(card) {
    const now = card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', now ? 'true' : 'false');
  }

  cards.forEach((card) => {
    if (isTouch) {
      card.addEventListener('click', (e) => {
        // Don't swallow taps on links/buttons inside the card
        if (e.target.closest('a, button')) return;
        toggle(card);
      });
    }

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(card);
      }
    });

    // Hover devices: keep aria-expanded in sync with the CSS :hover / :focus-visible expansion
    card.addEventListener('focus', () => card.setAttribute('aria-expanded', 'true'));
    card.addEventListener('blur', () => {
      if (!card.classList.contains('expanded')) card.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ----------------------------------------
   Theme Toggle (light / dark)
   ---------------------------------------- */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Respect system preference on first visit
  const saved = localStorage.getItem('theme');
  if (saved) {
    html.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.setAttribute('data-theme', 'dark');
  }

  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

/* ----------------------------------------
   Scroll Reveal (Intersection Observer)
   ---------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-children');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* ----------------------------------------
   Language Progress Bars
   ---------------------------------------- */
function initLanguageBars() {
  const bars = document.querySelectorAll('.language-bar');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const targetWidth = bar.getAttribute('data-width');
          // Small delay so the animation is visible
          setTimeout(() => {
            bar.style.setProperty('--bar-fill', targetWidth + '%');
          }, 200);
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.5 }
  );

  bars.forEach((bar) => observer.observe(bar));
}

/* ----------------------------------------
   Interactive Donut Chart
   Uses event delegation to avoid per-segment listener leaks.
   Segments and legend items are keyboard-accessible.
   ---------------------------------------- */
function initDonutChart() {
  const svg = document.querySelector('#donutChart svg');
  const centerText = document.querySelector('.donut-center-text');
  const legend = document.getElementById('hobbiesLegend');
  // Bail early on pages without the chart (subpages share main.js)
  if (!svg || !centerText || !legend) return;

  const t = (key, fallback) => (window.i18n ? window.i18n.t(key) : fallback);

  const hobbies = [
    { key: 'hobby.3d_printers',  value: 25, color: '#3E0097',
      link: 'models/',
      examples: [
        { label: '3D Models',  url: 'models/' },
        { label: 'Printables', url: 'https://www.printables.com/@junakya_320548' },
      ]
    },
    { key: 'hobby.dnd',          value: 15, color: '#5A1DB8',
      link: 'projects/',
      examples: [
        { label: 'DnDAudio', url: 'https://github.com/pjunak/DnDAudio' },
        { label: 'dm-tools', url: 'https://github.com/pjunak/dm-tools' },
      ]
    },
    { key: 'hobby.learning',     value: 15, color: '#7636CC' },
    { key: 'hobby.programming',  value: 10, color: '#8F52D9',
      link: 'projects/',
      examples: [
        { label: 'Projects', url: 'projects/' },
        { label: 'GitHub',   url: 'https://github.com/pjunak' },
      ]
    },
    { key: 'hobby.3d_design',    value: 15, color: '#A870E3',
      link: 'models/',
      examples: [
        { label: '3D Models',  url: 'models/' },
        { label: 'Printables', url: 'https://www.printables.com/@junakya_320548' },
      ]
    },
    { key: 'hobby.games_books',  value: 15, color: '#BF92EB' },
    { key: 'hobby.poetry',       value: 5,  color: '#D4B5F2' },
  ];

  const examplesEl = document.getElementById('hobbiesExamples');
  const isTouch = window.matchMedia('(hover: none)').matches;
  const hintKey = isTouch ? 'hobby.hint_tap' : 'hobby.hint_hover';
  const nameOf = (h) => t(h.key, h.key);
  const getDefaultHint = () => t(hintKey, isTouch ? 'Tap a segment' : 'Hover a segment');

  // Give the center text an aria-live region so screen readers announce changes
  centerText.setAttribute('aria-live', 'polite');
  centerText.innerHTML = `<span class="donut-label">${getDefaultHint()}</span>`;

  // Give the SVG chart a role and label for accessibility
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Interactive donut chart showing hobby time distribution');

  const cx = 100;
  const cy = 100;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  function navigate(url) {
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener noreferrer');
    } else {
      window.location.href = url;
    }
  }

  function showExamples(hobby) {
    if (!examplesEl || !hobby.examples || hobby.examples.length === 0) {
      if (examplesEl) examplesEl.classList.remove('visible');
      return;
    }
    examplesEl.innerHTML = '';
    hobby.examples.forEach((ex) => {
      const a = document.createElement('a');
      a.classList.add('hobby-example-chip');
      a.textContent = ex.label;
      a.href = ex.url;
      if (ex.url.startsWith('http')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      examplesEl.appendChild(a);
    });
    examplesEl.classList.add('visible');
  }

  function hideExamples() {
    if (examplesEl) examplesEl.classList.remove('visible');
  }

  /** Highlight a specific hobby index in both chart and legend */
  function highlightSegment(index) {
    const hobby = hobbies[index];
    centerText.innerHTML = `<span style="font-size:1.3rem">${hobby.value}%</span><span class="donut-label">${nameOf(hobby)}</span>`;
    segments.forEach((s, j) => {
      s.style.opacity = j === index ? '1' : '0.4';
    });
    legend.querySelectorAll('.legend-item').forEach((item, j) => {
      item.style.opacity = j === index ? '1' : '0.6';
    });
    showExamples(hobby);
  }

  /** Clear all highlights back to default */
  function clearHighlight() {
    centerText.innerHTML = `<span class="donut-label">${getDefaultHint()}</span>`;
    segments.forEach((s) => { s.style.opacity = '1'; });
    legend.querySelectorAll('.legend-item').forEach((item) => {
      item.style.opacity = '1';
    });
    hideExamples();
  }

  // Build SVG segments
  let offset = 0;
  const segments = [];

  hobbies.forEach((hobby, i) => {
    const segLen = (hobby.value / 100) * circumference;
    const gap = 3;
    const dashLen = Math.max(segLen - gap, 0);
    const label = nameOf(hobby);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', radius);
    circle.setAttribute('class', 'donut-segment');
    circle.setAttribute('stroke', hobby.color);
    circle.setAttribute('stroke-dasharray', `${dashLen} ${circumference - dashLen}`);
    circle.setAttribute('stroke-dashoffset', -offset);
    circle.setAttribute('data-index', i);

    // Accessibility: make each segment focusable and labelled
    circle.setAttribute('tabindex', '0');
    circle.setAttribute('role', 'button');
    circle.setAttribute('aria-label', `${label}: ${hobby.value}%`);

    // Animate in: start collapsed, grow on intersection
    circle.style.strokeDasharray = `0 ${circumference}`;
    circle.dataset.targetDash = `${dashLen} ${circumference - dashLen}`;
    circle.dataset.targetOffset = -offset;

    svg.appendChild(circle);
    segments.push(circle);
    offset += segLen;

    // Legend item — keyboard accessible
    const legendItem = document.createElement('div');
    legendItem.classList.add('legend-item');
    legendItem.setAttribute('tabindex', '0');
    legendItem.setAttribute('role', 'button');
    legendItem.setAttribute('aria-label', `${label}: ${hobby.value}%`);
    legendItem.setAttribute('data-index', i);
    legendItem.innerHTML = `<span class="legend-dot" style="background:${hobby.color}"></span><span class="legend-text">${label}</span>`;
    legend.appendChild(legendItem);
  });

  // Refresh chart text when the language changes
  document.addEventListener('i18n:change', () => {
    segments.forEach((seg, i) => {
      const label = nameOf(hobbies[i]);
      seg.setAttribute('aria-label', `${label}: ${hobbies[i].value}%`);
    });
    legend.querySelectorAll('.legend-item').forEach((item, i) => {
      const label = nameOf(hobbies[i]);
      item.setAttribute('aria-label', `${label}: ${hobbies[i].value}%`);
      const text = item.querySelector('.legend-text');
      if (text) text.textContent = label;
    });
    // Reset the center text to the translated default hint
    clearHighlight();
  });

  // --- Event delegation on SVG (avoids per-segment listener leaks) ---
  function getSegmentIndex(target) {
    const seg = target.closest('.donut-segment');
    return seg ? parseInt(seg.getAttribute('data-index'), 10) : -1;
  }

  svg.addEventListener('mouseenter', (e) => {
    const i = getSegmentIndex(e.target);
    if (i >= 0) highlightSegment(i);
  }, true); // use capture for SVG bubbling

  svg.addEventListener('mouseleave', (e) => {
    const i = getSegmentIndex(e.target);
    if (i >= 0) clearHighlight();
  }, true);

  svg.addEventListener('focusin', (e) => {
    const i = getSegmentIndex(e.target);
    if (i >= 0) highlightSegment(i);
  });

  svg.addEventListener('focusout', (e) => {
    const i = getSegmentIndex(e.target);
    if (i >= 0) clearHighlight();
  });

  svg.addEventListener('touchstart', (e) => {
    const i = getSegmentIndex(e.target);
    if (i >= 0) { e.preventDefault(); highlightSegment(i); }
  }, { passive: false });

  svg.addEventListener('touchend', (e) => {
    const i = getSegmentIndex(e.target);
    if (i >= 0) clearHighlight();
  });

  svg.addEventListener('click', (e) => {
    const i = getSegmentIndex(e.target);
    if (i >= 0 && hobbies[i].link) navigate(hobbies[i].link);
  });

  svg.addEventListener('keydown', (e) => {
    const i = getSegmentIndex(e.target);
    if (i < 0) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (hobbies[i].link) navigate(hobbies[i].link);
    }
  });

  // --- Event delegation on legend ---
  function getLegendIndex(target) {
    const item = target.closest('.legend-item');
    return item ? parseInt(item.getAttribute('data-index'), 10) : -1;
  }

  legend.addEventListener('mouseenter', (e) => {
    const i = getLegendIndex(e.target);
    if (i >= 0) highlightSegment(i);
  }, true);

  legend.addEventListener('mouseleave', (e) => {
    const i = getLegendIndex(e.target);
    if (i >= 0) clearHighlight();
  }, true);

  legend.addEventListener('focusin', (e) => {
    const i = getLegendIndex(e.target);
    if (i >= 0) highlightSegment(i);
  });

  legend.addEventListener('focusout', (e) => {
    const i = getLegendIndex(e.target);
    if (i >= 0) clearHighlight();
  });

  legend.addEventListener('touchstart', (e) => {
    const i = getLegendIndex(e.target);
    if (i >= 0) { e.preventDefault(); highlightSegment(i); }
  }, { passive: false });

  legend.addEventListener('touchend', (e) => {
    const i = getLegendIndex(e.target);
    if (i >= 0) clearHighlight();
  });

  legend.addEventListener('click', (e) => {
    const i = getLegendIndex(e.target);
    if (i >= 0 && hobbies[i].link) navigate(hobbies[i].link);
  });

  legend.addEventListener('keydown', (e) => {
    const i = getLegendIndex(e.target);
    if (i < 0) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (hobbies[i].link) navigate(hobbies[i].link);
    }
  });

  // Animate chart segments on scroll
  const chartContainer = document.getElementById('donutChart');
  const chartObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          segments.forEach((seg, i) => {
            setTimeout(() => {
              seg.style.transition = 'stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 0s';
              seg.style.strokeDasharray = seg.dataset.targetDash;
              seg.setAttribute('stroke-dashoffset', seg.dataset.targetOffset);
            }, i * 80);
          });
          chartObserver.unobserve(chartContainer);
        }
      });
    },
    { threshold: 0.3 }
  );

  chartObserver.observe(chartContainer);
}

/* ----------------------------------------
   Active Section Highlight in Sticky Nav
   ---------------------------------------- */
function initActiveNavHighlight() {
  const navLinks = document.querySelectorAll('.sticky-nav-links a');
  const sections = [];

  navLinks.forEach((link) => {
    const id = link.getAttribute('href').replace('#', '');
    const section = document.getElementById(id);
    if (section) sections.push({ id, el: section, link });
  });

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const match = sections.find((s) => s.el === entry.target);
        if (match) match.isVisible = entry.isIntersecting;
      });

      // Highlight the first visible section
      const active = sections.find((s) => s.isVisible);
      navLinks.forEach((l) => l.classList.remove('active'));
      if (active) active.link.classList.add('active');
    },
    { threshold: 0, rootMargin: '-64px 0px -40% 0px' }
  );

  sections.forEach((s) => observer.observe(s.el));
}
