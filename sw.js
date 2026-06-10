/* ========================================
   Service Worker — petr.junak.eu
   Filenames are not content-hashed, so correctness comes first:
   - Fonts (assets/fonts/): cache-first — they only change by rename.
   - Everything else same-origin: network-first with cache fallback —
     deploys show up immediately, the site still works offline.
   - Cross-origin (GitHub API, Printables thumbnails): untouched.
   Bump CACHE_VERSION to drop every cached entry after a breaking change.
   ======================================== */

const CACHE_VERSION = 'pj-v1';

/* The minimal offline CV: home page shell + its render dependencies. */
const PRECACHE = [
  '/',
  '/css/style.css',
  '/js/i18n.js',
  '/js/main.js',
  '/assets/icons.svg',
  '/assets/face.webp',
  '/assets/fonts/inter-latin.woff2',
  '/assets/fonts/inter-latin-ext.woff2',
  '/assets/fonts/outfit-latin.woff2',
  '/assets/fonts/outfit-latin-ext.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function cacheFirst(request) {
  return caches.match(request).then((hit) => {
    if (hit) return hit;
    return fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
      }
      return response;
    });
  });
}

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() =>
      // ignoreSearch so /?lang=cs falls back to the cached / shell
      caches.match(request, { ignoreSearch: true }).then((hit) => {
        if (hit) return hit;
        if (request.mode === 'navigate') return caches.match('/');
        return Response.error();
      })
    );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/assets/fonts/')) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});
