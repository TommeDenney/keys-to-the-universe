// Offline support: network-first for app files (so updates arrive right
// away), cache fallback when offline. Piano samples and fonts are cache-first.
const CACHE = 'ivory-v1'; // v2: revalidate app files

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const cacheFirst = url.pathname.includes('/assets/samples/') || url.host.includes('fonts.g');
  if (cacheFirst) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  // no-cache: always ask the server if a file changed (GitHub Pages would
  // otherwise let the browser reuse files for 10 minutes after a deploy).
  e.respondWith(fetch(req, { cache: 'no-cache' }).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
    return res;
  }).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html'))));
});
