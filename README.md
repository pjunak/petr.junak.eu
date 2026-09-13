# petr.junak.eu

Personal CV webpage

## Structure

- `index.html` â€” Single-page CV
- `projects/`, `models/` â€” Subpages for GitHub repos and 3D models
- `404.html` â€” Not-found page
- `sw.js` â€” Service worker (the CV works offline)
- `css/style.css`, `css/subpage.css` â€” Design system & styles (self-hosted fonts, no CDNs)
- `js/i18n.js` â€” Multilanguage (EN/CZ) translations and toggle; `?lang=cs` deep links
- `js/main.js` â€” Scroll animations, theme toggle, interactive charts
- `js/subpage.js` â€” Shared filter chip logic
- `js/projects.js`, `js/models.js` â€” Per-page card rendering
- `js/palette.js` â€” Command palette (press <kbd>Ctrl/Cmd</kbd>+<kbd>K</kbd>)
- `assets/` â€” Photos, icon sprite, fonts, PWA icons, CV PDFs
- `scripts/` â€” CI helper that refreshes Printables stats weekly
- `robots.txt`, `sitemap.xml` â€” Search engine hints

## CV PDFs

The downloadable CVs are **built from LaTeX in [pjunak/cv](https://github.com/pjunak/cv)**.
Every push there compiles both languages and publishes them to that repo's `latest` release;
this site's CI downloads them at image-build time, so the website always serves the current CV.

## Verification and deployment

Pull requests check every JavaScript file, build the nginx image, validate its
configuration, and verify the home/projects/models pages, both CV downloads,
and the 404 response. Main-branch builds publish the same verified BuildKit
result and dispatch its immutable digest to the infrastructure repository.
Manual and weekly builds use the same gates. The digest also identifies builds
that use newer CV PDFs without a change to this repository's source revision.

Container checks require Docker; source syntax checks alone do not establish
nginx or container behavior. Browser interaction and visual checks remain
separate from this smoke suite.

## Licensing

Â© 2026 Petr JunÃ¡k. All rights reserved.

## Deployment results and retries

Current main changes and CV refreshes publish the verified image, then wait for
the infrastructure rollout to finish. Production runs are queued; superseded
sources skip publication. Pull requests verify without publishing or deploying.

Set `INFRA_REPO=pjunak/infra` and `INFRA_DISPATCH_TOKEN` with Contents read/write
and Actions read on infra. The workflow targets `petr` directly; `INFRA_SERVICE`
is obsolete. It uses the pinned shared infrastructure client, and no server SSH
credential is stored here.

**Deploy published release** accepts a completed build run ID. It verifies that
run's retained `published-image` artifact and successful publication job before
deploying the same digest without rebuilding or refetching the CV PDFs. Both
workflows report success only after the corresponding infrastructure deployment
succeeds. See the [shared contract](https://github.com/pjunak/infra/blob/main/docs/application-deployments.md).
