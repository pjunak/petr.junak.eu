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
- `assets/` — Photos, icon sprite, fonts, PWA icons
- `scripts/` — CI helper that refreshes Printables stats weekly
- `robots.txt`, `sitemap.xml` — Search engine hints

## CV PDFs

The downloadable CVs are **built from LaTeX in [pjunak/cv](https://github.com/pjunak/cv)**.
Every push there compiles both languages and publishes them to that repo's `latest` release;
the site's download buttons link directly to those generated PDFs. A CV edit needs
no website rebuild, extra deployment token or manual PDF upload. Existing
`/assets/cv-en.pdf` and `/assets/cv-cz.pdf` bookmarks redirect to the same files.

## Verification and deployment

Pull requests check every JavaScript file, build the nginx image, validate its
configuration, and verify the home/projects/models pages, both stable CV redirects,
and the 404 response. Main-branch builds publish the same verified BuildKit
result and hand its immutable digest to the infrastructure repository.
Manual and weekly builds use the same gates. Weekly builds publish refreshed
Printables statistics; PDF updates are independent of website builds.

Container checks require Docker; source syntax checks alone do not establish
nginx or container behavior. Browser interaction and visual checks remain
separate from this smoke suite.

## Licensing

© 2026 Petr Junák. All rights reserved.

## Deployment results and retries

Main changes and weekly statistics builds publish the verified image, then
start infra's **Deploy** workflow with `service=petr` and the image digest. This
run is green once the image is handed over; the deployment result is the Deploy
run in [pjunak/infra](https://github.com/pjunak/infra/actions/workflows/deploy.yml).
Production runs are queued and superseded sources skip publication. Pull
requests verify without publishing or deploying.

Requires the `INFRA_REPO=pjunak/infra` variable and the `INFRA_DISPATCH_TOKEN`
secret (Actions write on infra). No server credential is stored here. To retry
or roll back, run infra's Deploy manually with the digest; see infra's
[application deployments](https://github.com/pjunak/infra/blob/main/docs/application-deployments.md).
