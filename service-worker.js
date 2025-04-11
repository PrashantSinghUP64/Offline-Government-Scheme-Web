const CACHE_NAME = 'ruralconnect-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/schemes.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap'
];

// INSTALL
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installed');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activated');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  return self.clients.claim();
});

// FETCH (Cache-first strategy with fallback to network)
self.addEventListener('fetch', event => {
  console.log('[ServiceWorker] Fetching:', event.request.url);
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Fetch updated version in background
        fetch(event.request).then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        });
        return cachedResponse;
      } else {
        return fetch(event.request)
          .then(response => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
          .catch(() => caches.match('/offline.html'));
      }
    })
  );
});

// LISTEN FOR PUSH NOTIFICATIONS
self.addEventListener('push', event => {
  const data = event.data ? event.data.text() : 'New update available!';
  const options = {
    body: data,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  };
  event.waitUntil(
    self.registration.showNotification('📢 RuralConnect Alert', options)
  );
});

// NOTIFICATION CLICK HANDLER
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// BACKGROUND SYNC (optional logic for form data or updates)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-schemes') {
    console.log('[ServiceWorker] Syncing schemes in background...');
    // Add sync logic here if you need (like re-fetching new schemes)
  }
});
