const CACHE = 'bhealthy-v1';
const ASSETS = [
  '/bhealthy/',
  '/bhealthy/index.html',
  '/bhealthy/manifest.json',
  '/bhealthy/icon.png',
  '/bhealthy/icon-192.png',
  '/bhealthy/icon-512.png'
];

// Installation : mettre en cache les fichiers essentiels
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Activation : nettoyer les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : cache d'abord, réseau ensuite
self.addEventListener('fetch', e => {
  // Ne pas intercepter les appels API (Open Food Facts)
  if (e.request.url.includes('openfoodfacts.org') ||
      e.request.url.includes('fonts.googleapis.com') ||
      e.request.url.includes('unpkg.com')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/bhealthy/index.html'));
    })
  );
});
