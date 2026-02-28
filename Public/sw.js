// >>> Change this version string every deploy to bust the cache <<<
const CACHE_VERSION = '20260228-1';
const CACHE_NAME = 'orizon-' + CACHE_VERSION;

const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
];

self.addEventListener('install', (event) => {
  // Pre-cache only CDN libs (they never change).
  // index.html is always fetched network-first.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(CDN_ASSETS).catch(() => {})
    )
  );
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', (event) => {
  // Delete all old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // take control of all pages now
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always bypass cache for Supabase API
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(event.request).catch(() => new Response('offline', { status: 503 })));
    return;
  }

  // NETWORK-FIRST for same-origin HTML / navigation requests
  if (event.request.mode === 'navigate' || url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, cloned));
        }
        return response;
      }).catch(() => {
        // Offline fallback: serve from cache
        return caches.match(event.request).then(cached =>
          cached || (event.request.destination === 'document' ? caches.match('/index.html') : new Response('offline', { status: 503 }))
        );
      })
    );
    return;
  }

  // Cache-first for external CDN assets (they are versioned in their URL)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, cloned));
        }
        return response;
      });
    })
  );
});
