const CACHE_NAME = 'grandchess9x9-v2';   // Version badal diya (update ke liye)

const ASSETS = [
  './',
  'index.html',
  'chess8x8.html',
  'chess9x9.html',
  'SuperChess8x8.html',
  'SuperChess9x9.html',
  'manifest.json',
  'img/Logo.png',
  // अगर और कोई इमेज, CSS या JS फाइल है तो यहाँ जोड़ दें
];

// Install Event
self.addEventListener('install', (e) => {
  console.log('🚀 Service Worker Installing...');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Caching game assets...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
  console.log('✅ Service Worker Activated');
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Cache First Strategy
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Cache mein hai toh wahi return karo
      if (cachedResponse) {
        return cachedResponse;
      }

      // Cache mein nahi hai toh network se lao
      return fetch(e.request).then((networkResponse) => {
        // Important files ko cache mein save karo
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline mode - agar page hai toh index.html return karo
        if (e.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
