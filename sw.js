const CACHE = 'poker-dice-v15';
const LARGE = ['/bg-music.mp3']; // cached lazily on first request, not pre-cached
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/LoungeBait.ttf',
  '/dice-roll.mp3',
  '/btn-click.wav',
  '/btn-toggle.wav',
  '/btn-chip.wav',
  '/dice-hold.wav',
  '/win.wav',
  '/lose.wav',
  '/player-add.wav'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // index.html: network-first so JS/CSS changes always apply immediately
  const url = e.request.url;
  if(url.endsWith('/') || url.endsWith('/index.html')){
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Large files: serve from cache if available, otherwise fetch and cache lazily
  if(LARGE.some(u => url.endsWith(u))){
    e.respondWith(
      caches.match(e.request).then(cached => {
        if(cached) return cached;
        return fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
