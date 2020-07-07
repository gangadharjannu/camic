const CACHE_NAME = 'static-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.png',
  '/install.js',
  '/dist/bundle.js',
  '/dist/main.css',
  '/assets/apple-icon-120.png',
  '/assets/apple-icon-152.png',
  '/assets/apple-icon-167.png',
  '/assets/apple-icon-180.png',
  '/assets/manifest-icon-192.png',
  '/assets/manifest-icon-512.png',
];

// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', function onInstall(event) {
  // eslint-disable-next-line no-console
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function onCacheOpen(cache) {
      // eslint-disable-next-line no-console
      console.log('[ServiceWorker] Pre-caching assets');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // eslint-disable-next-line no-restricted-globals
  self.skipWaiting();
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', function onActivate(event) {
  // eslint-disable-next-line no-console
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(function onCache(keyList) {
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
self.addEventListener('fetch', function onFetch(event) {
  // eslint-disable-next-line no-console
  console.log('[ServiceWorker] Fetch', event.request.url);
  event.respondWith(
    caches.open(CACHE_NAME).then(function onCacheOpen(cache) {
      return cache.match(event.request).then(function onCacheMatch(response) {
        return response || fetch(event.request);
      });
    })
  );
});
