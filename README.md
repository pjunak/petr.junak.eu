# petr.junak.eu

Personal CV webpage

## Structure

- `index.html` — Single-page CV
- `projects/`, `models/` — Subpages for GitHub repos and 3D models
- `404.html` — Not-found page
- `sw.js` — Service worker (the CV works offline)
- `css/style.css`, `css/subpage.css` — Design system & styles (self-hosted fonts, no CDNs)
- `js/i18n.js` — Multilanguage (EN/CZ) translations and toggle; `?lang=cs` deep links
- `js/main.js` — Scroll animations, theme toggle, interactive charts
- `js/subpage.js` — Shared filter chip logic
- `js/projects.js`, `js/models.js` — Per-page card rendering
- `js/palette.js` — Command palette (press <kbd>Ctrl/Cmd</kbd>+<kbd>K</kbd>)
- `assets/` — Photos, icon sprite, fonts, PWA icons, CV PDFs
- `scripts/` — CI helper that refreshes Printables stats weekly
- `robots.txt`, `sitemap.xml` — Search engine hints

## CV PDFs

The downloadable CVs are **built from LaTeX in [pjunak/cv](https://github.com/pjunak/cv)**.
Every push there compiles both languages and publishes them to that repo's `latest` release;
this site's CI downloads them at image-build time, so the website always serves the current CV.

## Licensing

© 2026 Petr Junák. All rights reserved.
