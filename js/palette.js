/* ========================================
   Command Palette (Ctrl/Cmd + K)
   Keyboard-first navigation: jump to sections, switch pages,
   toggle theme/language, download the CV. Builds its DOM lazily
   and reads labels from window.i18n at open time, so it is always
   in the current language without listening for i18n:change.
   ======================================== */

(function () {
  const t = (key, fallback) => (window.i18n ? window.i18n.t(key) : fallback || key);

  let overlay = null;
  let input = null;
  let list = null;
  let items = [];          // [{ el, action }]
  let activeIndex = 0;
  let lastFocus = null;

  /** Action list is computed per open so labels/links match the active language. */
  function buildActions() {
    const onHome = !/\/(projects|models)\/$/.test(location.pathname);
    const section = (id) => () => {
      if (onHome) {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else location.href = '/#' + id;
      } else {
        location.href = '/#' + id;
      }
    };

    const lang = window.i18n ? window.i18n.lang : 'en';
    const langLabel = lang === 'cs' ? t('nav.lang_switch_en') : t('nav.lang_switch_cs');

    return [
      { icon: 'arrow-right',          label: t('nav.experience'),  action: section('experience') },
      { icon: 'arrow-right',          label: t('nav.skills'),      action: section('skills') },
      { icon: 'arrow-right',          label: t('nav.languages'),   action: section('languages') },
      { icon: 'arrow-right',          label: t('nav.education'),   action: section('education') },
      { icon: 'arrow-right',          label: t('nav.hobbies'),     action: section('hobbies') },
      { icon: 'code',                 label: t('nav.projects'),    action: () => { location.href = '/projects/'; } },
      { icon: 'cube',                 label: t('nav.models'),      action: () => { location.href = '/models/'; } },
      { icon: 'file-arrow-down',      label: t('cv.tooltip'),      action: () => { location.href = '/' + t('cv.pdf_path'); } },
      { icon: 'envelope',             label: t('nav.email_cta'),   action: () => { location.href = 'mailto:junakpetr@gmail.com'; } },
      { icon: 'moon',                 label: t('nav.theme_toggle'), action: () => { const b = document.getElementById('themeToggle'); if (b) b.click(); } },
      { icon: 'arrow-up-right-from-square', label: langLabel,      action: () => { const b = document.querySelector('.lang-toggle'); if (b) b.click(); } },
    ];
  }

  function ensureDom() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'palette-overlay';
    overlay.innerHTML = `
      <div class="palette" role="dialog" aria-modal="true" data-i18n-attr="aria-label:palette.aria" aria-label="${t('palette.aria', 'Command palette')}">
        <input class="palette-input" type="text" role="combobox" aria-expanded="true"
               aria-controls="paletteList" autocomplete="off" spellcheck="false">
        <ul class="palette-list" id="paletteList" role="listbox"></ul>
        <div class="palette-footer">
          <span><kbd>↑↓</kbd> · <kbd>Enter</kbd> · <kbd>Esc</kbd></span>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    input = overlay.querySelector('.palette-input');
    list = overlay.querySelector('.palette-list');

    overlay.addEventListener('mousedown', (e) => {
      if (e.target === overlay) close();
    });
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); run(activeIndex); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
    list.addEventListener('click', (e) => {
      const li = e.target.closest('.palette-item');
      if (li) run(parseInt(li.dataset.index, 10));
    });
    list.addEventListener('mousemove', (e) => {
      const li = e.target.closest('.palette-item');
      if (li) setActive(parseInt(li.dataset.index, 10));
    });
  }

  function render(query) {
    const q = (query || '').trim().toLowerCase();
    const actions = buildActions().filter((a) => !q || a.label.toLowerCase().includes(q));
    list.innerHTML = '';
    items = [];
    if (!actions.length) {
      const li = document.createElement('li');
      li.className = 'palette-empty';
      li.textContent = t('palette.no_results', 'No matching commands');
      list.appendChild(li);
      return;
    }
    actions.forEach((a, i) => {
      const li = document.createElement('li');
      li.className = 'palette-item';
      li.id = 'palette-item-' + i;
      li.setAttribute('role', 'option');
      li.dataset.index = i;
      li.innerHTML = `<svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#${a.icon}"/></svg><span></span>`;
      li.querySelector('span').textContent = a.label;
      list.appendChild(li);
      items.push({ el: li, action: a.action });
    });
    setActive(0);
  }

  function setActive(i) {
    if (!items.length) return;
    activeIndex = Math.max(0, Math.min(i, items.length - 1));
    items.forEach((it, j) => it.el.classList.toggle('active', j === activeIndex));
    input.setAttribute('aria-activedescendant', 'palette-item-' + activeIndex);
    items[activeIndex].el.scrollIntoView({ block: 'nearest' });
  }

  function move(delta) {
    setActive((activeIndex + delta + items.length) % items.length);
  }

  function run(i) {
    const item = items[i];
    close();
    if (item) item.action();
  }

  function open() {
    ensureDom();
    lastFocus = document.activeElement;
    overlay.classList.add('visible');
    input.value = '';
    input.placeholder = t('palette.placeholder', 'Type a command…');
    render('');
    input.focus();
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('visible');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (overlay && overlay.classList.contains('visible')) close();
      else open();
    }
  });
})();
