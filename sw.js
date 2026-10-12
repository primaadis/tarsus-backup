
"use strict";

const CACHE_NAME = "tarsus-mobile-v4.5.1";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data.js",
  "./manifest.json",
  "./icon.svg",
  "./assets/logo.png",
  "./assets/logo-boot.png",
  "./assets/background.jpg",
  "./assets/background-boot.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith("tarsus-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith((async () => {
    try {
      const response = await fetch(request);

      if (response && response.ok) {
        const copy = response.clone();

        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, copy))
            .catch(error => console.warn(
              "[TARSUS] Cache gagal diperbarui:",
              error
            ))
        );
      }

      return response;
    } catch (error) {
      const cached = await caches.match(request);

      if (cached) {
        return cached;
      }

      // Hanya navigasi dokumen yang boleh memakai fallback HTML.
      if (request.mode === "navigate") {
        const indexPage = await caches.match("./index.html");
        if (indexPage) return indexPage;
      }

      // Jangan mengembalikan HTML sebagai pengganti JS, CSS, atau gambar.
      return new Response("Aset tidak tersedia. Periksa koneksi.", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
