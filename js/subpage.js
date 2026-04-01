/* ========================================
   Subpage JavaScript
   Filter chips & theme sync
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFilterChips();
});

/* ----------------------------------------
   Filter Chips
   ---------------------------------------- */
function initFilterChips() {
  const filterBars = document.querySelectorAll('.filter-bar');

  filterBars.forEach((bar) => {
    const chips = bar.querySelectorAll('.filter-chip');
    // Find the grid sibling — the card-grid in the next section
    const grid = document.querySelector('.card-grid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.showcase-card');

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const filter = chip.dataset.filter;

        // Update active chip
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');

        // Filter cards
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
