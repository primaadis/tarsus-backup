const CACHE_NAME = "tarsus-v3";

const APP_SHELL = [
    "/tarsus-backup/",
    "/tarsus-backup/index.html",
    "/tarsus-backup/data.js",
    "/tarsus-backup/manifest.json",
    "/tarsus-backup/icon-192.png",
    "/tarsus-backup/icon-512.png"
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(APP_SHELL);

            })
            .then(() => {

                return self.skipWaiting();

            })

    );

});


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))

                );

            })
            .then(() => {

                return self.clients.claim();

            })

    );

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", event => {

    const request = event.request;


    /* Hanya proses GET */
    if (request.method !== "GET") {
        return;
    }


    const url = new URL(request.url);


    /* Jangan ganggu request Google Sheets,
       Google Fonts, atau website eksternal */

    if (url.origin !== self.location.origin) {
        return;
    }


    event.respondWith(

        caches.match(request)
            .then(cachedResponse => {


                /* -----------------------------------------
                   Ambil versi terbaru dari internet
                   di background
                   ----------------------------------------- */

                const networkUpdate = fetch(request)
                    .then(response => {

                        if (
                            response &&
                            response.ok
                        ) {

                            const responseClone =
                                response.clone();

                            event.waitUntil(

                                caches.open(CACHE_NAME)
                                    .then(cache => {

                                        return cache.put(
                                            request,
                                            responseClone
                                        );

                                    })

                            );

                        }

                        return response;

                    })
                    .catch(() => {

                        return cachedResponse;

                    });


                /* -----------------------------------------
                   Jika cache tersedia:
                   tampilkan langsung agar aplikasi cepat.

                   Internet tetap berjalan di background
                   untuk memperbarui cache.
                   ----------------------------------------- */

                if (cachedResponse) {

                    return cachedResponse;

                }


                /* -----------------------------------------
                   Jika belum ada cache:
                   gunakan internet.
                   ----------------------------------------- */

                return networkUpdate;

            })

    );

});
