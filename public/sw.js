const CACHE_NAME = 'grandchess9x9-v1';

// 👑 1. Saari zaroori files ko yahan list karein taaki app fast load ho
const ASSETS = [
  './',                  // Main root folder
  'index.html',          // Aapka main page
  'chess8x8.html',
  'chess9x9.html',  // Naya 9x9 version (jo bhi aapne naam rakha ho)
  'img/Logo.png'         // Aapka handsome logo
  // Agar aapki koi style.css ya script.js file hai, toh use bhi yahan jodein
];

// Install Event: Saari files ko cache mein save karna
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching all game assets...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Naye service worker ko turant active karne ke liye
});

// Activate Event: Purane cache ko delete karna (jab aap game update karein)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache...', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch Event: Cache-First Strategy (Isse game offline bhi fast khulegai)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Agar cache mein file hai toh wahan se do, nahi toh internet se lao
      return cachedResponse || fetch(e.request).catch(() => {
        // Agar internet bhi nahi hai aur file cache mein bhi nahi hai (Offline fallback)
        if (e.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
