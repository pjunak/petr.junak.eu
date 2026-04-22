/* ========================================
   Subpage JavaScript
   Filter chips — event-delegated and idempotent,
   so it's safe to call after cards re-render.
   ======================================== */

/* Script loaded with defer — DOM is ready when this runs */
initFilterChips();

/* ----------------------------------------
   Filter Chips (event delegation)
   One listener on each .filter-bar handles all
   chip clicks. Card queries happen at click time,
   so re-rendering cards "just works" without rebinding.
   ---------------------------------------- */
function initFilterChips() {
  document.querySelectorAll('.filter-bar').forEach((bar) => {
    // Skip if already wired — safe to call this function multiple times
    if (bar.dataset.chipsInit === '1') return;
    bar.dataset.chipsInit = '1';

    bar.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip || !bar.contains(chip)) return;
      applyFilter(bar, chip.dataset.filter || 'all');
    });
  });
}

/** Update active chip + show/hide cards in the current grid. Exported for callers re-rendering cards. */
function applyFilter(bar, filter) {
  bar.querySelectorAll('.filter-chip').forEach((c) => {
    c.classList.toggle('active', c.dataset.filter === filter);
  });

  const grid = document.querySelector('.card-grid');
  if (!grid) return;

  grid.querySelectorAll('.showcase-card').forEach((card) => {
    if (filter === 'all') {
      card.classList.remove('hidden');
    } else {
      const categories = (card.dataset.category || '').split(/\s+/);
      card.classList.toggle('hidden', !categories.includes(filter));
    }
  });
}

/** Re-apply whatever filter is currently active — useful after cards re-render. */
function reapplyActiveFilter() {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;
  const active = bar.querySelector('.filter-chip.active');
  applyFilter(bar, active ? (active.dataset.filter || 'all') : 'all');
}
