/* TARSUS Finder 4.9.0 — navigation fallback is limited to document requests. */
const CACHE_NAME = "tarsus-mobile-v4.9.0";
const CORE_ASSETS = [
  "./", "./index.html", "./style.css", "./app.js", "./data.js",
  "./manifest.json", "./icon.svg", "./assets/logo.png",
  "./assets/logo-boot.png", "./assets/background.jpg", "./assets/background-boot.jpg"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith("tarsus-") && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  const url = new URL(request.url);
  const isAppCode = /\/(?:index\.html|app\.js|data\.js|style\.css|manifest\.json|sw\.js)$/.test(url.pathname) || request.mode === "navigate";
  if (isAppCode) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: "no-store" });
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          const key = request.mode === "navigate" ? "./index.html" : request;
          await cache.put(key, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await caches.match(request) || (request.mode === "navigate" ? await caches.match("./index.html") : null);
        if (cached) return cached;
        if (request.mode === "navigate") return new Response("<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>TARSUS Finder</title><body style='font:16px sans-serif;padding:24px'>TARSUS Finder belum dapat dimuat. Periksa koneksi internet lalu muat ulang halaman.</body>", { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 503 });
        throw error;
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response && response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone());
    return response;
  })());
});
