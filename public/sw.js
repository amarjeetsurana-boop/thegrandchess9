const CACHE_NAME = 'grandchess9x9-v5';

const ASSETS = [
  './',
  'index.html',
  'Rules.html',
  'chess8x8.html',
  'chess9x9.html',
  'SuperChess8x8.html',
  'SuperChess9x9.html',
  'manifest.json',
  'img/Logo.png',
  'socket-clint.js'
];

// Install
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Caching Assets...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker Activated');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🗑 Removing Old Cache:', key);
            return caches.delete(key);
          }
          return Promise.resolve(); // Fixed: Added fallback promise to avoid undefined error
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  // ===== HTML Pages (Navigate) Network First strategy =====
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('index.html');
          });
        })
    );
  } else {
    // ===== Baki Files Cache First strategy =====
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;

        return fetch(event.request).then((response) => {
          if (
            response &&
            response.status === 200 &&
            event.request.method === "GET" &&
            event.request.url.startsWith("http")
          ) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return response;
        });
      })
    );
  }
});
