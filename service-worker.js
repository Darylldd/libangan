const CACHE_NAME = 'snake-game-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png'
];

// install: cache app shell
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// activate: cleanup
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); })
    ))
  );
  self.clients.claim();
});

// fetch: cache-first strategy with network fallback
self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then(cached => {
      if (cached) return cached;
      return fetch(evt.request).then(res => {
        // cache new GET requests for later (optional)
        if (evt.request.method === 'GET' && res && res.status === 200 && res.type !== 'opaque') {
          caches.open(CACHE_NAME).then(cache => cache.put(evt.request, res.clone()));
        }
        return res;
      }).catch(() => {
        // fallback for navigation requests: return cached index.html so app can work offline
        if (evt.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
