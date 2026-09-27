const CACHE_NAME = "tarsus-v2";

const FILES_TO_CACHE = [
  "/tarsus-backup/",
  "/tarsus-backup/index.html",
  "/tarsus-backup/data.js",
  "/tarsus-backup/manifest.json",
  "/tarsus-backup/icon-192.png",
  "/tarsus-backup/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request);
    })
  );
});
