# petr.junak.eu

Multilingual English/Czech static CV and portfolio site. There is no framework,
bundler, transpiler, or runtime package installation: committed HTML, CSS, and
JavaScript are served directly by nginx.

## Commands

Local static server:

```powershell
python -m http.server 8080
```

Production-container check:

```powershell
docker build -t petr-junak-eu:test .
docker run --rm -p 8080:80 petr-junak-eu:test
```

Model-stat refresh, when intentionally requested:

```powershell
node scripts/update-model-stats.mjs
```

There is no automated application test suite. Browser verification is part of
completion.

## Structure

```text
index.html                  Single-page CV
projects/index.html         GitHub-project listing
models/index.html           3D-model listing
404.html                    noindex error page
css/style.css               fonts, tokens, shared and home-page styles
css/subpage.css             projects/models styles
js/i18n.js                  EN/CZ dictionaries and language lifecycle
js/main.js                  theme, navigation, reveal, home-page interactions
js/subpage.js               shared delegated filter controls
js/projects.js              GitHub fetch/cache/render
js/models.js                static model data/render
js/palette.js               Ctrl/Cmd+K command palette
assets/icons.svg            local SVG icon sprite
assets/fonts/               self-hosted variable fonts
sw.js                       service worker
manifest.json               PWA metadata
nginx-site.conf             production caching, gzip, headers, 404
Dockerfile                  static nginx image
scripts/update-model-stats.mjs
                            Printables statistics refresh
.github/workflows/          image publishing, deploy dispatch, stats refresh
```

## Runtime conventions

- Scripts are classic deferred scripts, not modules. Preserve dependency order:
  `i18n.js` -> `main.js` -> optional `subpage.js` -> page-specific script.
- Cross-script globals are intentional: `window.i18n`, `applyFilter`,
  `reapplyActiveFilter`, and `initFilterChips`.
- Use two-space indentation, single quotes in JavaScript, and double quotes for
  HTML attributes.
- Do not add a framework, build step, CDN, analytics, or runtime dependency
  without explicit approval.
- Use existing CSS custom properties for themes, spacing, typography, color,
  radii, and surfaces. Avoid one-off hard-coded design values.
- UI icons come from `assets/icons.svg`; preserve Font Awesome attribution and
  the source icon's viewBox when adding a symbol.

## Internationalization

- `js/i18n.js` is the source of truth. Add every user-visible key to both
  English and Czech dictionaries.
- Static content uses `data-i18n` or `data-i18n-attr`; dynamic content listens
  for `i18n:change` and re-renders.
- Language priority is URL `?lang=` -> saved preference -> browser language,
  with Slovak defaulting to Czech. The early head script and
  `detectLanguage()` must stay aligned.
- Czech and English variants have self-referential canonicals and matching
  `hreflang` entries in HTML and `sitemap.xml`.
- Test changed text, attributes, aria labels, dynamically rendered cards, and
  layout in both languages.

## Browser and UI invariants

- `main.js` runs on subpages. Home-only elements such as the donut chart must
  be null-guarded.
- Filter chips use delegation in `subpage.js`; do not attach listeners to each
  newly rendered card. Reapply the active filter after a rerender.
- `projects.js` caches the unauthenticated GitHub response for one hour and
  retains expired data as an error fallback. Do not add uncached API traffic.
- Keep visible controls keyboard accessible, icon-only buttons labelled, focus
  states clear, and touch targets usable.
- Verify at approximately 375 px and 1280 px widths plus both light and dark
  themes. Do not optimize for an unusually narrow preview pane.
- Expandable experience cards keep `role`, `aria-expanded`, keyboard behavior,
  and visual state synchronized.
- Update inline JSON-LD when corresponding visible identity, education,
  contact, or profile information changes.

## Assets, cache, and offline behavior

- The hero `<picture>` keeps explicit dimensions, high fetch priority, WebP
  source, and PNG fallback to protect LCP and layout stability.
- Fonts are self-hosted variable WOFF2 files with Latin and Latin-ext subsets.
  Czech requires Latin-ext; keep declared weight ranges aligned with usage.
- Production assets are cached for 24 hours and filenames are not hashed. Do
  not add `immutable` or increase the TTL without content-hashed filenames.
- HTML/root files remain revalidated. When editing `nginx-site.conf`, remember
  that an `add_header` in a child location stops inheriting parent headers.
- `sw.js` is network-first except for font caching. Bump `CACHE_VERSION` when
  renaming or restructuring cached core files.
- Cross-origin GitHub/Printables requests are deliberately outside the service
  worker.

## Deployment

- CI downloads current `cv-en.pdf` and `cv-cz.pdf` from the sibling `cv`
  repository's rolling release before building; committed PDFs are local
  fallbacks.
- The workflow publishes `latest` and `sha-<commit>` images to GHCR, then
  dispatches the immutable image digest to the sibling `junak.eu`
  infrastructure repository after nginx and HTTP smoke checks pass.
- This repository never SSHes to production.
- Preserve nginx's gzip, cache, `nosniff`, and custom-404 behavior.
- Changes to `Dockerfile`, `nginx-site.conf`, or deployment workflows require
  a container build and explicit review of their production effect.
- The weekly stats workflow may keep old committed values and exit successfully
  when Printables blocks CI. Do not interpret a green job as proof that every
  statistic refreshed.

## Completion

For prose or agent-guidance-only changes, review the diff, check local links,
and verify changed commands or contract claims. Runtime builds and operational
acceptance are required only for the affected behavior below. Reuse successful
checks on unchanged inputs; preserve complete CI and release gates.

For a page-local change, inspect that page and its changed interactions in both
languages and relevant layouts. Use the full matrix below for shared styling,
i18n, navigation, caching, asset delivery or release changes:

- Serve the site and visit the home, projects, models, and 404 pages.
- Verify EN/CZ, light/dark, keyboard navigation, and mobile/desktop layout.
- Check the browser console and network panel for errors and unintended
  third-party requests.
- For cache/service-worker work, test a clean profile plus an upgrade from the
  previous cache version.
- For deployment/header work, build and run the container rather than relying
  on `python -m http.server`.
- Update `README.md`, sitemap/metadata, and this file when their contracts
  change.

Do not commit secrets, local editor/agent state, or generated runtime files.
The global Codex instructions govern task commits. Never push, deploy, publish,
or alter workflow permissions unless explicitly requested.
