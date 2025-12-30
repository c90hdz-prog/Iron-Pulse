const CACHE_NAME = "iron-pulse-v2"; // bump when you ship updates

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/js/app.js",
  "./assets/icons/pulse.png",

];

// Install - cache core assets + activate new SW immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate - remove old caches + take control immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
      self.clients.claim()
    ])
  );
});

// Fetch - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

