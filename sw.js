/* =========================================================
   TARSUS FINDER
   SERVICE WORKER
   VERSION 4
========================================================= */

const CACHE_NAME =
    "tarsus-v4";


const BASE =
    "/tarsus-backup/";


const APP_SHELL = [

    BASE,

    BASE + "index.html",

    BASE + "data.js",

    BASE + "manifest.json",

    BASE + "icon-192.png",

    BASE + "icon-512.png"

];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )
                .then(
                    cache => {

                        return cache.addAll(
                            APP_SHELL
                        );

                    }
                )
                .then(
                    () => {

                        return self.skipWaiting();

                    }
                )

        );

    }
);


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    cacheNames => {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    name =>
                                        name !==
                                        CACHE_NAME
                                )
                                .map(
                                    name =>
                                        caches.delete(
                                            name
                                        )
                                )

                        );

                    }
                )
                .then(
                    () => {

                        return self.clients.claim();

                    }
                )

        );

    }
);


/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        if (
            request.method !==
            "GET"
        ) {

            return;

        }


        const url =
            new URL(
                request.url
            );


        /*
           Hanya URL milik TARSUS.
        */

        if (
            url.origin !==
            self.location.origin
        ) {

            return;

        }


        /*
           INDEX + DATA.JS
           ----------------
           Network First

           Supaya ketika kita update
           GitHub, versi baru lebih
           cepat digunakan.
        */

        const isCriticalFile =

            url.pathname ===
                BASE ||

            url.pathname ===
                BASE + "index.html" ||

            url.pathname ===
                BASE + "data.js";


        if (
            isCriticalFile
        ) {

            event.respondWith(

                fetch(
                    request,
                    {
                        cache:
                            "no-store"
                    }
                )
                .then(
                    response => {

                        if (
                            response &&
                            response.ok
                        ) {

                            const clone =
                                response.clone();


                            event.waitUntil(

                                caches
                                    .open(
                                        CACHE_NAME
                                    )
                                    .then(
                                        cache => {

                                            return cache.put(
                                                request,
                                                clone
                                            );

                                        }
                                    )

                            );

                        }


                        return response;

                    }
                )
                .catch(
                    () => {

                        return caches.match(
                            request
                        );

                    }
                )

            );


            return;

        }


        /*
           FILE LAIN
           ----------
           Cache First
           + update background
        */

        event.respondWith(

            caches
                .match(
                    request
                )
                .then(
                    cached => {

                        const network =
                            fetch(
                                request
                            )
                            .then(
                                response => {

                                    if (
                                        response &&
                                        response.ok
                                    ) {

                                        const clone =
                                            response.clone();


                                        event.waitUntil(

                                            caches
                                                .open(
                                                    CACHE_NAME
                                                )
                                                .then(
                                                    cache => {

                                                        return cache.put(
                                                            request,
                                                            clone
                                                        );

                                                    }
                                                )

                                        );

                                    }


                                    return response;

                                }
                            )
                            .catch(
                                () => {

                                    return cached;

                                }
                            );


                        return (
                            cached ||
                            network
                        );

                    }
                )

        );

    }
);
