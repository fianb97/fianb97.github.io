const CACHE_NAME = 'mywallet-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/pages.css',
  './js/utils.js',
  './js/store.js',
  './js/router.js',
  './js/components.js',
  './js/pages/dashboard.js',
  './js/pages/transactions.js',
  './js/pages/wallets.js',
  './js/pages/debts.js',
  './js/pages/ai-assistant.js',
  './js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
