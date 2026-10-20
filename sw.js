
"use strict";

/* =========================================================
   K-PEDIA — SERVICE WORKER
   Version: 6.0.0

   Tujuan:
   - Mengurangi masalah layar hitam saat refresh.
   - Menyediakan cache untuk penggunaan offline.
   - Menghapus cache versi lama saat pembaruan.
   - Tidak menggagalkan instalasi jika gambar opsional
     belum tersedia.
   ========================================================= */

/* Awalan "tarsus-" dipertahankan agar cache versi lama tetap terhapus saat activate. */
const CACHE_NAME = "kpedia-v6.4.0";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./theme-pro.css",
  "./polish.js",
  "./mascot.js",
  "./app.js",
  "./data.js",
  "./content.js",
  "./stations-info.js",
  "./wiki-data.js",
  "./search-engine.js",
  "./dialogs.js",
  "./clay.css",
  "./manifest.json",
  "./icon.png",
  "./assets/logo.png",
  "./assets/logo-boot.png",
  "./assets/logo-wordmark.png",
  "./assets/stations/placeholder.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

const OPTIONAL_ASSETS = [
  "./assets/background.jpg",
  "./assets/background-boot.jpg",
  "./assets/pengembang.jpg",
  "./assets/iklan-1.jpg",
  "./assets/iklan-2.jpg",
  "./assets/iklan-3.jpg",
  "./assets/iklan-4.jpg",
  "./assets/iklan-5.jpg"
];

/* =========================================================
   INSTALL
   Simpan aset inti. Aset gambar tambahan dicoba terpisah
   agar satu gambar yang belum ada tidak menggagalkan cache.
   ========================================================= */

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    await Promise.all(
      CORE_ASSETS.map(async asset => {
        try {
          const response = await fetch(
            new Request(asset, { cache: "reload" })
          );

          if (response.ok) {
            await cache.put(asset, response);
          } else {
            console.warn(
              "[K-Pedia] Aset inti tidak tersedia:",
              asset,
              response.status
            );
          }
        } catch (error) {
          console.warn(
            "[K-Pedia] Gagal menyimpan aset inti:",
            asset,
            error
          );
        }
      })
    );

    await Promise.all(
      OPTIONAL_ASSETS.map(async asset => {
        try {
          const response = await fetch(
            new Request(asset, { cache: "reload" })
          );

          if (response.ok) {
            await cache.put(asset, response);
          }
        } catch (_) {
          // Gambar opsional tidak boleh menggagalkan instalasi.
        }
      })
    );

    await self.skipWaiting();
  })());
});

/* =========================================================
   ACTIVATE
   Hapus cache versi lama, kemudian aktifkan SW baru.
   ========================================================= */

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key =>
          (key.startsWith("tarsus-") || key.startsWith("kpedia-")) &&
          key !== CACHE_NAME
        )
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

/* =========================================================
   FETCH
   Strategi:
   - Hanya menangani request GET dari origin yang sama.
   - Utamakan jaringan agar kode terbaru bisa diambil.
   - Simpan respons berhasil untuk penggunaan offline.
   - Jika jaringan gagal, gunakan cache.
   - Navigasi mendapat fallback index.html bila tersedia.
   ========================================================= */

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Jangan mengintervensi request data lintas-origin.
  // Misalnya Google Sheets atau sumber data eksternal.
  if (url.pathname.includes("/gviz/")) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    try {
      const response = await fetch(request);

      if (response && response.ok) {
        // Jangan menunggu proses cache untuk mengembalikan
        // respons ke halaman aplikasi.
        const copy = response.clone();

        event.waitUntil(
          cache.put(request, copy).catch(error => {
            console.warn(
              "[K-Pedia] Cache gagal diperbarui:",
              error
            );
          })
        );
      }

      return response;
    } catch (error) {
      const cached = await caches.match(request);

      if (cached) {
        return cached;
      }

      if (request.mode === "navigate") {
        const indexPage = await caches.match("./index.html");

        if (indexPage) {
          return indexPage;
        }
      }

      return new Response(
        request.mode === "navigate"
          ? "K-Pedia belum dapat dibuka. Periksa koneksi internet, lalu muat ulang aplikasi."
          : "Aset tidak tersedia. Periksa koneksi internet.",
        {
          status: 503,
          statusText: "Service Unavailable",
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store"
          }
        }
      );
    }
  })());
});
