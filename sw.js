const CACHE_VERSION = 'v1'; // NAIKKAN angka ini tiap kali index.html/manifest.json shell diubah, supaya cache lama otomatis dibuang dan versi baru dipakai.
const CACHE_NAME = 'marketing-shell-' + CACHE_VERSION;
const PRECACHE_ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Cuma urus request ke shell sendiri -- request ke iframe (origin/path lain)
  // otomatis tidak ditangkap oleh SW ini sama sekali (di luar scope), jadi
  // dibiarkan berjalan apa adanya, tidak perlu di-skip manual.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
      if (res.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, res.clone()));
      return res;
    }))
  );
});
