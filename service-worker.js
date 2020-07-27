const CACHE_NAME = 'static-cache-v0';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.png',
  '/install.js',
  '/bundle.js',
  '/main.css',
  '/assets/apple-icon-120.png',
  '/assets/apple-icon-152.png',
  '/assets/apple-icon-167.png',
  '/assets/apple-icon-180.png',
  '/assets/manifest-icon-192.png',
  '/assets/manifest-icon-512.png',
];

// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', (event) => {
  // eslint-disable-next-line no-console
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // eslint-disable-next-line no-console
      console.log('[ServiceWorker] Pre-caching assets');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // eslint-disable-next-line no-restricted-globals
  self.skipWaiting();
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', (event) => {
  // eslint-disable-next-line no-console
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map(function onKeyList(key) {
          if (key !== CACHE_NAME) {
            // eslint-disable-next-line no-console
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
          return null;
        })
      );
    })
  );
  // eslint-disable-next-line no-restricted-globals
  self.clients.claim();
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', (event) => {
  // eslint-disable-next-line no-console
  console.log('[ServiceWorker] Fetch', event.request.url);
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        return response || fetch(event.request);
      });
    })
  );
});
