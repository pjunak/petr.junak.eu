/* ========================================
   CV Webpage — petr.junak.eu
   Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initStickyNav();
  initScrollReveal();
  initLanguageBars();
  initDonutChart();
  initExpandableCards();
  initActiveNavHighlight();
});

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
   Expandable Experience Cards (touch)
   ---------------------------------------- */
function initExpandableCards() {
  const isTouch = window.matchMedia('(hover: none)').matches;

  document.querySelectorAll('.experience-card').forEach((card) => {
    // Touch devices: toggle on click
    if (isTouch) {
      card.addEventListener('click', () => {
        card.classList.toggle('expanded');
      });
    }

    // Keyboard: toggle on Enter/Space for all devices
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('expanded');
      }
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
            bar.style.width = targetWidth + '%';
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
   ---------------------------------------- */
function initDonutChart() {
  const hobbies = [
    { name: 'Tinkering with 3D printers', value: 25, color: '#3E0097' },
    { name: 'D&D & creative writing',     value: 15, color: '#5A1DB8' },
    { name: 'Learning new things',         value: 15, color: '#7636CC' },
    { name: 'Programming & OSS',           value: 10, color: '#8F52D9' },
    { name: '3D design & modeling',        value: 15, color: '#A870E3' },
    { name: 'Video games & books',         value: 15, color: '#BF92EB' },
    { name: 'Reading & writing poetry',    value: 5,  color: '#D4B5F2' },
  ];

  const svg = document.querySelector('#donutChart svg');
  const centerText = document.querySelector('.donut-center-text');
  const legend = document.getElementById('hobbiesLegend');
  const isTouch = window.matchMedia('(hover: none)').matches;
  const defaultHint = isTouch ? 'Tap a segment' : 'Hover a segment';
  centerText.innerHTML = `<span class="donut-label">${defaultHint}</span>`;
  const cx = 100;
  const cy = 100;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke-dasharray for each segment
  let offset = 0;
  const segments = [];

  hobbies.forEach((hobby, i) => {
    const segLen = (hobby.value / 100) * circumference;
    const gap = 3; // Small gap between segments
    const dashLen = Math.max(segLen - gap, 0);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', radius);
    circle.setAttribute('class', 'donut-segment');
    circle.setAttribute('stroke', hobby.color);
    circle.setAttribute('stroke-dasharray', `${dashLen} ${circumference - dashLen}`);
    circle.setAttribute('stroke-dashoffset', -offset);
    circle.setAttribute('data-index', i);

    // Animate in: start collapsed, grow on intersection
    circle.style.strokeDasharray = `0 ${circumference}`;
    circle.dataset.targetDash = `${dashLen} ${circumference - dashLen}`;
    circle.dataset.targetOffset = -offset;

    svg.appendChild(circle);
    segments.push(circle);

    offset += segLen;

    // Show hobby name in center (shared by mouse & touch handlers)
    function highlightSegment() {
      centerText.innerHTML = `<span style="font-size:1.3rem">${hobby.value}%</span><span class="donut-label">${hobby.name}</span>`;
      segments.forEach((s, j) => {
        s.style.opacity = j === i ? '1' : '0.4';
      });
    }

    function clearHighlight() {
      centerText.innerHTML = `<span class="donut-label">${defaultHint}</span>`;
      segments.forEach((s) => { s.style.opacity = '1'; });
    }

    circle.addEventListener('mouseenter', highlightSegment);
    circle.addEventListener('mouseleave', clearHighlight);
    circle.addEventListener('touchstart', (e) => { e.preventDefault(); highlightSegment(); }, { passive: false });
    circle.addEventListener('touchend', clearHighlight);

    // Legend item
    const legendItem = document.createElement('div');
    legendItem.classList.add('legend-item');
    legendItem.innerHTML = `<span class="legend-dot" style="background:${hobby.color}"></span>${hobby.name}`;
    legendItem.addEventListener('mouseenter', highlightSegment);
    legendItem.addEventListener('mouseleave', clearHighlight);
    legendItem.addEventListener('touchstart', (e) => { e.preventDefault(); highlightSegment(); }, { passive: false });
    legendItem.addEventListener('touchend', clearHighlight);
    legend.appendChild(legendItem);
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
