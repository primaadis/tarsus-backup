"use strict";

const CACHE_VERSION = "tarsus-v2.3.0";
const APP_PREFIX = new URL("./", self.location).pathname;
const APP_SHELL = [
  APP_PREFIX,
  APP_PREFIX + "index.html",
  APP_PREFIX + "style.css",
  APP_PREFIX + "app.js",
  APP_PREFIX + "data.js",
  APP_PREFIX + "manifest.json",
  APP_PREFIX + "assets/logo.png",
  APP_PREFIX + "assets/background.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.all(APP_SHELL.map(async path => {
      try {
        const response = await fetch(path, { cache: "reload" });
        if (response.ok) await cache.put(path, response);
      } catch (_) { /* Aset opsional tidak boleh menggagalkan instalasi. */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("tarsus-") && name !== CACHE_VERSION).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_PREFIX)) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) || (await caches.match(APP_PREFIX + "index.html")) || new Response(
          "TARSUS Finder tidak dapat dibuka. Periksa koneksi internet.",
          { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
        );
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) {
      fetch(request).then(async response => {
        if (response.ok) (await caches.open(CACHE_VERSION)).put(request, response.clone());
      }).catch(() => {});
      return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok) (await caches.open(CACHE_VERSION)).put(request, response.clone()).catch(() => {});
      return response;
    } catch (_) {
      return new Response("File tidak tersedia secara offline.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  })());
});
