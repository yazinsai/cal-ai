const CACHE_NAME = 'calorie-tracker-v1';
const DYNAMIC_CACHE = 'calorie-tracker-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  // Add other static assets as needed
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls (they should go to network)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return a custom offline response for API calls
        return new Response(
          JSON.stringify({ error: 'Offline' }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          }
        );
      })
    );
    return;
  }

  // For everything else, try cache first, then network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        // Don't cache non-successful responses
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Clone the response before caching
        const responseToCache = networkResponse.clone();

        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
        
        // Return a custom offline page/response
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-food-entries') {
    event.waitUntil(syncFoodEntries());
  }
});

async function syncFoodEntries() {
  try {
    // Get pending entries from IndexedDB or localStorage
    const pendingEntries = await getPendingEntries();
    
    if (pendingEntries.length > 0) {
      // Sync with server when online
      await Promise.all(
        pendingEntries.map(entry => 
          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
          })
        )
      );
      
      // Clear pending entries after successful sync
      await clearPendingEntries();
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingEntries() {
  // Implementation would retrieve from IndexedDB
  return [];
}

async function clearPendingEntries() {
  // Implementation would clear IndexedDB
  return;
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});