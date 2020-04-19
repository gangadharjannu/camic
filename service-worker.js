var CACHE_NAME = 'static-cache-v1';
var FILES_TO_CACHE = [
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
  '/assets/manifest-icon-512.png'
];

self.addEventListener('install', function (event) {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('[ServiceWorker] Pre-caching assets');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  console.log('[ServiceWorker] Fetch', event.request.url);
  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request)
        .then(function (response) {
          return response || fetch(event.request);
        });
    })
  );
});
