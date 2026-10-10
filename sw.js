"use strict";

/* =========================================
   TARSUS FINDER
   SERVICE WORKER
========================================= */

const CACHE_VERSION = "tarsus-v2.1.0";

const APP_PREFIX = "/tarsus-backup/";

const APP_SHELL = [
  APP_PREFIX,
  APP_PREFIX + "index.html",
  APP_PREFIX + "style.css",
  APP_PREFIX + "app.js",
  APP_PREFIX + "data.js",
  APP_PREFIX + "manifest.json",
  APP_PREFIX + "icon.svg"
];

/* INSTALL */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ACTIVATE */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith("tarsus-") &&
                     name !== CACHE_VERSION;
            })
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

/* FETCH */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Hanya menangani permintaan GET.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Jangan mengambil alih permintaan ke domain lain.
  if (url.origin !== self.location.origin) return;

  // Navigasi halaman: coba jaringan terlebih dahulu.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_VERSION)
              .then((cache) => cache.put(request, copy));

            return response;
          }

          throw new Error("Respons jaringan tidak berhasil");
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);

          if (cachedPage) return cachedPage;

          const fallback = await caches.match(
            APP_PREFIX + "index.html"
          );

          if (fallback) return fallback;

          return new Response(
            "TARSUS Finder tidak dapat dibuka. Periksa koneksi internet.",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
        })
    );

    return;
  }

  // File aplikasi: cache terlebih dahulu, lalu jaringan.
  if (url.pathname.startsWith(APP_PREFIX)) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) {
          // Perbarui cache di belakang layar.
          fetch(request)
            .then((response) => {
              if (response && response.ok) {
                return caches.open(CACHE_VERSION)
                  .then((cache) => cache.put(request, response));
              }
            })
            .catch(() => {});

          return cachedResponse;
        }

        try {
          const response = await fetch(request);

          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_VERSION)
              .then((cache) => cache.put(request, copy));
          }

          return response;
        } catch (error) {
          return new Response(
            "File tidak tersedia secara offline.",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
        }
      })
    );
  }
});
