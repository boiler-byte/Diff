/* HTML Diff – offline App-Shell. Keine Eingabedaten werden gespeichert. */
'use strict';
const CACHE_NAME = 'html-diff-pwa-v1';
const APP_FILES = [
  './index.html',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];
const APP_URL = new URL('./index.html', self.registration.scope).href;
const ROOT_URL = new URL('./', self.registration.scope).href;
const APP_ASSETS = new Set(APP_FILES.map(path => new URL(path, self.registration.scope).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_FILES);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('html-diff-pwa-') && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Online die aktuelle HTML-Version laden; offline auf die lokal
  // vorgeladene App zurückfallen. Keine Fremdseiten abfangen.
  if (request.mode === 'navigate') {
    if (url.pathname !== new URL(APP_URL).pathname &&
        url.pathname !== new URL(ROOT_URL).pathname) return;
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(APP_URL, response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match(APP_URL)) || Response.error();
      }
    })());
    return;
  }

  // Ausschließlich Manifest, Icons und App-HTML cachen.
  if (!APP_ASSETS.has(url.href)) return;
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
