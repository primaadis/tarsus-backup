
"use strict";

/* =========================================================
   K-PEDIA — SERVICE WORKER
   Version: 8.0.0

   Tujuan:
   - Mengurangi masalah layar hitam saat refresh.
   - Menyediakan cache untuk penggunaan offline.
   - Menghapus cache versi lama saat pembaruan.
   - Tidak menggagalkan instalasi jika gambar opsional
     belum tersedia.
   ========================================================= */

/* Awalan "tarsus-" dipertahankan agar cache versi lama tetap terhapus saat activate. */
const CACHE_NAME = "kpedia-v8.0.0";

const CORE_ASSETS = [
  "./", "./index.html", "./kpedia.css", "./kp-icons.js", "./app.js", "./data.js", "./content.js", "./stations-info.js", "./wiki-data.js",
  "./search-engine.js", "./dialogs.js", "./announcements.js", "./kp-time.js", "./kp-weather.js", "./kp-calc.js", "./krl-planner.js", "./kp-tools.js",
  "./kp-raka3d.js", "./kp-motion.js", "./kp-auth.js", "./raka.js", "./manifest.json", "./icon.png",
  "./assets/logo.png", "./assets/logo-wordmark.png", "./assets/stations/placeholder.svg", "./assets/icon-192.png", "./assets/icon-512.png",
  "./assets/raka/raka-sit.webp", "./assets/raka/raka-stand.webp", "./assets/raka/raka-front.webp"
];

const OPTIONAL_ASSETS = [
  "./assets/raka/raka.glb", "./assets/pengembang.jpg",
  "./assets/info/poster-1.webp", "./assets/info/poster-2.webp", "./assets/info/poster-3.webp", "./assets/info/poster-4.webp", "./assets/info/poster-5.webp"
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
          key !== CACHE_NAME && key !== CACHE_NAME + "-cdn"
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

  // Aset statis pihak ketiga (ikon Phosphor, GSAP, font): stale-while-revalidate agar tetap tampil saat offline.
  if (url.origin !== self.location.origin) {
    if (/^(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname)) {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME + "-cdn"), hit = await cache.match(request);
        const net = fetch(request).then(r => { if (r && (r.ok || r.type === "opaque")) cache.put(request, r.clone()).catch(() => {}); return r; }).catch(() => hit);
        return hit || net;
      })());
    }
    return;
  }

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
