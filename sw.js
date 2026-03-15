// CrossConnect Service Worker
// Version bumped on every deploy — forces cache refresh
const CACHE_VERSION = 'crossconnect-v4';
const ASSETS = ['/', '/index.html', '/game.js', '/manifest.json'];

self.addEventListener('install', function(e) {
  // Force this SW to activate immediately, don't wait
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function(c) { return c.addAll(ASSETS); })
  );
});

self.addEventListener('activate', function(e) {
  // Delete ALL old caches so stale game.js is gone
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_VERSION; })
            .map(function(k)   { return caches.delete(k); })
      );
    }).then(function() {
      // Take control of all open tabs immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // For HTML and JS — always go to network first, fall back to cache
  // This ensures fresh code on every load
  var url = e.request.url;
  var isCore = url.endsWith('/') || url.endsWith('index.html') || url.endsWith('game.js');

  if (isCore) {
    e.respondWith(
      fetch(e.request).then(function(res) {
        // Update cache with fresh copy
        var clone = res.clone();
        caches.open(CACHE_VERSION).then(function(c) { c.put(e.request, clone); });
        return res;
      }).catch(function() {
        // Offline fallback
        return caches.match(e.request);
      })
    );
  } else {
    // Other assets: cache first
    e.respondWith(
      caches.match(e.request).then(function(r) { return r || fetch(e.request); })
    );
  }
});
