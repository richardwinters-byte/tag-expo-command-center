// TAG Expo Command Center - Service Worker
// Caches public assets + login/offline pages. Authenticated app pages are
// network-only on purpose: with two users sharing devices on the booth floor,
// caching authenticated HTML created a real cross-user leak risk. The actual
// app data lives in Supabase (network-only here anyway), so cached HTML
// would only have been a stale empty shell — losing it costs nothing.
// Bump CACHE version on deploys that change this file or need a cache reset.
const CACHE = 'tag-expo-v16';

// Pages to precache on install so they're available before first visit
// (Vegas Wi-Fi is unreliable; the offline shell needs to load no matter what).
// Keep this list public-only.
const OFFLINE_URLS = ['/offline', '/manifest.json', '/icon-192.png', '/icon-512.png'];
const AUTH_PATHS = ['/today', '/schedule', '/leads', '/intel', '/debrief', '/morning', '/targets', '/pipeline', '/map', '/report', '/settings'];

function isAuthHtml(url) {
  return AUTH_PATHS.some((path) => url.pathname === path || url.pathname.startsWith(path + '/'));
}

async function broadcast(type, payload = {}) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  clients.forEach((client) => client.postMessage({ type, ...payload }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // addAll is all-or-nothing. Wrap each URL in a best-effort add so one
      // flaky page doesn't block the whole precache (e.g. redirect during deploy).
      Promise.all(
        OFFLINE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            // eslint-disable-next-line no-console
            console.warn('[sw] precache miss:', url, err && err.message);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Best-effort cleanup for clients upgrading from <= v15, which may still
// hold cached auth HTML under the old /__authcache prefix. Sign-out posts
// this; activate's cache-version sweep is the durable guarantee.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_AUTH_CACHE') {
    event.waitUntil((async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k).catch(() => {})));
      } finally {
        broadcast('sync-complete', { detail: 'cache-cleared' }).catch(() => {});
      }
    })());
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Network-only for API/Supabase — never serve stale data for those.
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) {
    return;
  }

  const isHtml = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');

  // Authenticated HTML pages: network-only, with offline-shell fallback.
  // We do NOT cache these — see header comment for rationale.
  if (isHtml && isAuthHtml(url)) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE);
        const offline = await cache.match('/offline');
        return offline || new Response(
          '<!doctype html><meta charset=utf-8><title>Offline</title><style>body{font-family:system-ui;text-align:center;padding:4rem 1rem;color:#14595B}</style><h1>Offline</h1><p>No network. Reconnect to load this page.</p>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 }
        );
      })
    );
    return;
  }

  // Public HTML (login, offline, etc.): stale-while-revalidate.
  if (isHtml) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cacheKey = new Request(`${url.pathname}${url.search}`);
        const cached = await cache.match(cacheKey);
        const networkFetch = fetch(request)
          .then((response) => {
            const finalUrl = new URL(response.url || request.url);
            const redirectedToLogin = response.redirected && finalUrl.pathname.startsWith('/login');
            if (response && response.ok && !redirectedToLogin) {
              cache.put(cacheKey, response.clone());
            }
            return response;
          })
          .catch(async () => {
            if (cached) return cached;
            const offline = await cache.match('/offline');
            if (offline) return offline;
            return new Response(
              '<!doctype html><meta charset=utf-8><title>Offline</title><style>body{font-family:system-ui;text-align:center;padding:4rem 1rem;color:#14595B}</style><h1>Offline</h1><p>No network and this page has not been cached yet.</p>',
              { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 }
            );
          });
        return cached || networkFetch;
      })
    );
    return;
  }

  // Other assets (JS, CSS, images): stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
