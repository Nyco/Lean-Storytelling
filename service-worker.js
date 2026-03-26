/* service-worker.js — Cache-first PWA service worker
   Bump CACHE_NAME version string to invalidate on update.
   -------------------------------------------------------- */

const CACHE_NAME = 'leanstory-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/prompts.js',
  '/consistency.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/fonts/playfair-display-v40-latin-regular.woff2',
  '/fonts/playfair-display-v40-latin-700.woff2',
  '/fonts/dm-sans-v17-latin-regular.woff2',
];

/* Install: pre-cache all static assets */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(
      PRECACHE_URLS.filter(url => !url.endsWith('.png'))  // skip missing icons gracefully
    ))
  );
  self.skipWaiting();
});

/* Activate: remove old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* Fetch: cache-first, network fallback */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
