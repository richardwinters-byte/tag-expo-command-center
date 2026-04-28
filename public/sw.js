// TAG Expo Command Center - Service Worker
// Caches last-synced view of key screens for offline read.
// Bump CACHE version on deploys that change this file or need a cache reset.
const CACHE = 'tag-expo-v13';
const AUTH_HTML_PREFIX = '/__authcache';

// Pages to precache on install so they're available before first visit
// (critical for the booth floor where Vegas Wi-Fi is unreliable).
// Keep this list public-only. Auth pages are cached lazily after successful
// signed-in navigation, never at install time.
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
            // Log but don't fail install
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

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_AUTH_CACHE') {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      const keys = await cache.keys();
      await Promise.all(
        keys
          .filter((request) => new URL(request.url).pathname.startsWith(AUTH_HTML_PREFIX + '/'))
          .map((request) => cache.delete(request))
      );
      await broadcast('sync-complete', { detail: 'cache-cleared' });
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

  // Navigations (HTML pages): stale-while-revalidate with offline fallback
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const url = new URL(request.url);
        const authKey = isAuthHtml(url) ? authCachePath(url) : `${url.pathname}${url.search}`;
        const cacheKey = new Request(authKey);
        const cached = await cache.match(cacheKey);
        const networkFetch = fetch(request)
          .then((response) => {
            const finalUrl = new URL(response.url || request.url);
            const redirectedToLogin = response.redirected && finalUrl.pathname.startsWith('/login');
            if (response && response.ok && !redirectedToLogin) {
              cache.put(cacheKey, response.clone());
              if (isAuthHtml(finalUrl)) {
                broadcast('offline-ready', { path: finalUrl.pathname }).catch(() => {});
              }
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

  // Other assets (JS, CSS, images): stale-while-revalidate
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
function authCachePath(url) {
  return `${AUTH_HTML_PREFIX}${url.pathname}${url.search}`;
}
