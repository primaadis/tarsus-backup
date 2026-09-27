/* =========================================================
   TARSUS FINDER
   DATA ENGINE - FINAL
   ---------------------------------------------------------
   DATABASE:
   1. MASTER_KA
   2. MASTER_TARIF
   3. MASTER_STASIUN
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       KONFIGURASI
       ===================================================== */

    const SHEET_ID = "1a4Ln_wASazV35F2M3MKZcJHEmiAV8G-0WmkMmU4Csls";

    const SHEETS = {
        ka: "MASTER_KA",
        tarif: "MASTER_TARIF",
        stasiun: "MASTER_STASIUN"
    };

    const VERSION = "1.0.0";

    /* =====================================================
       STATE
       ===================================================== */

    let MASTER_KA = [];
    let MASTER_TARIF = [];
    let MASTER_STASIUN = [];

    let STATION_INDEX = new Map();

    let isDataLoaded = false;
    let isSearching = false;

    /* =====================================================
       DOM
       ===================================================== */

    const $ = (selector) => document.querySelector(selector);

    const asalInput = $("#asal");
    const tujuanInput = $("#tujuan");
    const asalSuggestions = $("#asal-suggestions");
    const tujuanSuggestions = $("#tujuan-suggestions");
    const searchBtn = $("#searchBtn");
    const swapBtn = $("#swapBtn");
    const results = $("#results");
    const statusBox = $("#status");

    /* =====================================================
       UTILITAS DASAR
       ===================================================== */

    function clean(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/\u00A0/g, " ")
            .trim();
    }

    function normalize(value) {
        return clean(value)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function normalizeKey(value) {
        return normalize(value)
            .replace(/[^a-z0-9]+/g, "");
    }

    function escapeHTML(value) {
        return clean(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttr(value) {
        return escapeHTML(value);
    }

    function makeSafeId(value) {
        return normalizeKey(value)
            .replace(/^[^a-z]+/, "")
            .slice(0, 50) || "item";
    }

    function unique(array) {
        return [...new Set(array)];
    }

    /* =====================================================
       STATUS UI
       ===================================================== */

    function setStatus(message, type = "normal") {
        if (!statusBox) {
            return;
        }

        statusBox.textContent = message;
        statusBox.dataset.type = type;
    }

    function splashStatus(message) {
        if (
            window.TARSUS_UI &&
            typeof window.TARSUS_UI.setSplashStatus === "function"
        ) {
            window.TARSUS_UI.setSplashStatus(message);
        }
    }

    /* =====================================================
       CSV PARSER
       ===================================================== */

    function parseCSV(text) {
        const rows = [];
        let row = [];
        let cell = "";
        let insideQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const next = text[i + 1];

            if (char === '"') {
                if (insideQuotes && next === '"') {
                    cell += '"';
                    i++;
                } else {
                    insideQuotes = !insideQuotes;
                }
            } else if (char === "," && !insideQuotes) {
                row.push(cell);
                cell = "";
            } else if (
                (char === "\n" || char === "\r") &&
                !insideQuotes
            ) {
                if (char === "\r" && next === "\n") {
                    i++;
                }

                row.push(cell);
                cell = "";

                if (row.some(item => clean(item) !== "")) {
                    rows.push(row);
                }

                row = [];
            } else {
                cell += char;
            }
        }

        row.push(cell);

        if (row.some(item => clean(item) !== "")) {
            rows.push(row);
        }

        return rows;
    }

    /* =====================================================
       CSV -> OBJECT
       ===================================================== */

    function rowsToObjects(rows) {
        if (!rows || rows.length === 0) {
            return [];
        }

        const headers = rows[0].map(header => clean(header));

        return rows
            .slice(1)
            .map(row => {
                const object = {};

                headers.forEach((header, index) => {
                    object[header] = clean(row[index] ?? "");
                });

                return object;
            })
            .filter(object =>
                Object.values(object).some(value => clean(value) !== "")
            );
    }

    /* =====================================================
       HEADER HELPER
       ===================================================== */

    function getField(row, possibleNames) {
        if (!row || typeof row !== "object") {
            return "";
        }

        const keys = Object.keys(row);

        for (const wanted of possibleNames) {
            const wantedKey = normalizeKey(wanted);

            const actualKey = keys.find(
                key => normalizeKey(key) === wantedKey
            );

            if (actualKey !== undefined) {
                return clean(row[actualKey]);
            }
        }

        return "";
    }

    /* =====================================================
       LOAD GOOGLE SHEET
       ===================================================== */

    async function fetchSheet(sheetName) {
        const url =
            `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
            `?sheet=${encodeURIComponent(sheetName)}` +
            `&tqx=out:csv`;

        const response = await fetch(url, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `Gagal mengambil ${sheetName}: HTTP ${response.status}`
            );
        }

        const text = await response.text();

        if (!text || !text.trim()) {
            throw new Error(
                `${sheetName} kosong atau tidak dapat dibaca.`
            );
        }

        return rowsToObjects(parseCSV(text));
    }

    /* =====================================================
       ACTIVE STATUS
       ===================================================== */

    function isExplicitInactive(value) {
        const n = normalize(value);

        return [
            "tidak",
            "nonaktif",
            "non active",
            "inactive",
            "no",
            "0",
            "false",
            "off"
        ].includes(n);
    }

    function isActive(value) {
        const n = normalize(value);

        if (!n) {
            return true;
        }

        if (isExplicitInactive(n)) {
            return false;
        }

        return true;
    }

    function isKAActive(row) {
        if (!row) {
            return false;
        }

        const status = getField(row, [
            "STATUS",
            "STATUS_KA",
            "AKTIF",
            "ACTIVE"
        ]);

        return isActive(status);
    }

    function isTarifActive(row) {
        if (!row) {
            return false;
        }

        const status = getField(row, [
            "STATUS",
            "STATUS_TARIF",
            "AKTIF",
            "ACTIVE"
        ]);

        return isActive(status);
    }

    /* =====================================================
       PARSE MASTER KA
       ===================================================== */

    function parseMasterKA(rows) {
        return rows.map(row => {
            const idKA = getField(row, [
                "ID_KA",
                "ID KA",
                "KODE_KA",
                "KODE KA",
                "KA_ID"
            ]);

            const namaKA = getField(row, [
                "NAMA_KA",
                "NAMA KA",
                "NAMA",
                "KA"
            ]);

            const kelas = getField(row, [
                "KELAS",
                "CLASS"
            ]);

            const relasi = getField(row, [
                "RELASI",
                "RUTE",
                "ROUTE"
            ]);

            const status = getField(row, [
                "STATUS",
                "STATUS_KA",
                "AKTIF",
                "ACTIVE"
            ]);

            return {
                ...row,

                ID_KA: idKA,
                NAMA_KA: namaKA,
                KELAS: kelas,
                RELASI: relasi,
                STATUS: status
            };
        }).filter(row => {
            return row.ID_KA || row.NAMA_KA;
        });
    }

    /* =====================================================
       PARSE MASTER STASIUN
       ===================================================== */

    function parseMasterStasiun(rows) {
        return rows.map(row => {
            const id = getField(row, [
                "ID_STASIUN",
                "ID STASIUN",
                "ID",
                "KODE_STASIUN",
                "KODE STASIUN",
                "KODE"
            ]);

            const kode = getField(row, [
                "KODE_STASIUN",
                "KODE STASIUN",
                "KODE",
                "CODE"
            ]);

            const nama = getField(row, [
                "NAMA_STASIUN",
                "NAMA STASIUN",
                "NAMA",
                "STASIUN",
                "STATION"
            ]);

            const urutan = getField(row, [
                "URUTAN",
                "NO_URUT",
                "NO URUT",
                "ORDER",
                "SEQUENCE"
            ]);

            return {
                ...row,

                ID_STASIUN: id,
                KODE_STASIUN: kode,
                NAMA_STASIUN: nama,
                URUTAN: urutan
            };
        }).filter(row => {
            return row.ID_STASIUN ||
                row.KODE_STASIUN ||
                row.NAMA_STASIUN;
        });
    }

    /* =====================================================
       PARSE MASTER TARIF
       ===================================================== */

    function parseMasterTarif(rows) {
        return rows.map(row => {
            const idKA = getField(row, [
                "ID_KA",
                "ID KA",
                "KODE_KA",
                "KODE KA",
                "KA_ID"
            ]);

            const asal = getField(row, [
                "ASAL",
                "STASIUN_ASAL",
                "STASIUN ASAL",
                "ORIGIN",
                "FROM"
            ]);

            const tujuan = getField(row, [
                "TUJUAN",
                "STASIUN_TUJUAN",
                "STASIUN TUJUAN",
                "DESTINATION",
                "TO"
            ]);

            const tarif = getField(row, [
                "TARIF",
                "HARGA",
                "FARE",
                "TARIF_KHUSUS",
                "TARIF KHUSUS"
            ]);

            const relasi = getField(row, [
                "RELASI",
                "RUTE",
                "ROUTE",
                "ARAH"
            ]);

            const status = getField(row, [
                "STATUS",
                "STATUS_TARIF",
                "AKTIF",
                "ACTIVE"
            ]);

            const catatan = getField(row, [
                "CATATAN",
                "KETERANGAN",
                "NOTE",
                "NOTES"
            ]);

            return {
                ...row,

                ID_KA: idKA,
                ASAL: asal,
                TUJUAN: tujuan,
                TARIF: tarif,
                RELASI: relasi,
                STATUS: status,
                CATATAN: catatan
            };
        }).filter(row => {
            return row.ID_KA &&
                (row.ASAL || row.TUJUAN);
        });
    }

    /* =====================================================
       PARSE TARIF
       ===================================================== */

    function parseFare(value) {
        const original = clean(value);

        if (
            !original ||
            original === "-" ||
            original === "—" ||
            original === "–"
        ) {
            return null;
        }

        let number = original
            .replace(/rp/gi, "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(/,/g, "");

        number = number.replace(/[^\d]/g, "");

        if (!number) {
            return null;
        }

        const result = Number(number);

        if (!Number.isFinite(result)) {
            return null;
        }

        return result;
    }

    function formatRupiah(value) {
        const number = parseFare(value);

        if (number === null) {
            return "Tidak tersedia";
        }

        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(number);
    }

    /* =====================================================
       STATION INDEX
       ===================================================== */

    function addStationAlias(alias, station) {
        const key = normalize(alias);

        if (!key) {
            return;
        }

        if (!STATION_INDEX.has(key)) {
            STATION_INDEX.set(key, station);
        }
    }

    function buildStationIndex() {
        STATION_INDEX = new Map();

        MASTER_STASIUN.forEach(station => {
            addStationAlias(station.ID_STASIUN, station);
            addStationAlias(station.KODE_STASIUN, station);
            addStationAlias(station.NAMA_STASIUN, station);

            const aliases = [
                getField(station, ["ALIAS"]),
                getField(station, ["NAMA_ALIAS"]),
                getField(station, ["NAMA LENGKAP"])
            ];

            aliases.forEach(alias => {
                addStationAlias(alias, station);
            });
        });
    }

    function findStation(value) {
        const key = normalize(value);

        if (!key) {
            return null;
        }

        if (STATION_INDEX.has(key)) {
            return STATION_INDEX.get(key);
        }

        const stations = MASTER_STASIUN;

        const exactName = stations.find(station =>
            normalize(station.NAMA_STASIUN) === key
        );

        if (exactName) {
            return exactName;
        }

        const exactCode = stations.find(station =>
            normalize(station.KODE_STASIUN) === key
        );

        if (exactCode) {
            return exactCode;
        }

        return null;
    }

    function stationMatches(value, station) {
        const a = normalize(value);

        if (!a || !station) {
            return false;
        }

        const aliases = [
            station.ID_STASIUN,
            station.KODE_STASIUN,
            station.NAMA_STASIUN,
            getField(station, ["ALIAS"]),
            getField(station, ["NAMA_ALIAS"])
        ];

        return aliases.some(alias =>
            normalize(alias) === a
        );
    }

    /* =====================================================
       KA HELPERS
       ===================================================== */

    function getNamaKA(idKA) {
        const key = normalize(idKA);

        const ka = MASTER_KA.find(item =>
            normalize(item.ID_KA) === key
        );

        if (ka) {
            return ka.NAMA_KA || ka.ID_KA;
        }

        return idKA || "KA Tidak Diketahui";
    }

    function getKA(idKA) {
        const key = normalize(idKA);

        return MASTER_KA.find(item =>
            normalize(item.ID_KA) === key
        ) || null;
    }

    /* =====================================================
       ROUTE
       ===================================================== */

    function getReferenceRoute(ka) {
        if (!ka) {
            return [];
        }

        const rawRoute =
            ka.RELASI ||
            getField(ka, [
                "RUTE",
                "ROUTE",
                "LINTASAN",
                "JALUR"
            ]);

        if (!rawRoute) {
            return [];
        }

        return rawRoute
            .split(/\s*(?:-|>|→|↔|\/|;|\|)\s*/)
            .map(item => clean(item))
            .filter(Boolean);
    }

    function relationHTML(route) {
        if (!route || route.length === 0) {
            return "";
        }

        return `
            <div class="route-line">
                ${route.map((station, index) => `
                    <span class="route-station">
                        ${escapeHTML(station)}
                    </span>
                    ${
                        index < route.length - 1
                            ? `<span class="route-arrow">→</span>`
                            : ""
                    }
                `).join("")}
            </div>
        `;
    }

    /* =====================================================
       CEK COVERAGE RUTE
       ===================================================== */

    function routeIsCovered(ka, origin, destination, tariffRow = null) {
        const originStation = findStation(origin);
        const destinationStation = findStation(destination);

        /*
         * Jika MASTER_STASIUN tersedia, kedua stasiun harus
         * dikenali. Ini mencegah pencarian ngawur.
         */
        if (MASTER_STASIUN.length > 0) {
            if (!originStation || !destinationStation) {
                return false;
            }
        }

        /*
         * Tarif khusus yang sudah secara eksplisit memiliki
         * ASAL dan TUJUAN dianggap sebagai rute utama.
         */
        if (tariffRow) {
            const tariffOrigin = normalize(tariffRow.ASAL);
            const tariffDestination = normalize(tariffRow.TUJUAN);

            const originKey = normalize(origin);
            const destinationKey = normalize(destination);

            const directMatch =
                tariffOrigin === originKey &&
                tariffDestination === destinationKey;

            const reverseMatch =
                normalize(tariffRow.RELASI) === "pp" &&
                tariffDestination === originKey &&
                tariffOrigin === destinationKey;

            if (directMatch || reverseMatch) {
                return true;
            }
        }

        /*
         * Cari rute KA.
         */
        const route = getReferenceRoute(ka);

        if (route.length < 2) {
            /*
             * Jika KA tidak memiliki data rute pada MASTER_KA,
             * jangan menolak tarif yang sudah ditemukan.
             */
            return true;
        }

        const normalizedRoute = route.map(normalize);

        const originIndex = normalizedRoute.findIndex(
            station => station === normalize(origin)
        );

        const destinationIndex = normalizedRoute.findIndex(
            station => station === normalize(destination)
        );

        /*
         * Coba berdasarkan kode/nama stasiun.
         */
        if (
            originIndex === -1 &&
            originStation
        ) {
            const aliases = [
                originStation.ID_STASIUN,
                originStation.KODE_STASIUN,
                originStation.NAMA_STASIUN
            ].map(normalize);

            const idx = normalizedRoute.findIndex(
                station => aliases.includes(station)
            );

            if (idx !== -1) {
                return routeIsCoveredByIndex(
                    idx,
                    destination,
                    normalizedRoute,
                    destinationStation
                );
            }
        }

        if (
            destinationIndex === -1 &&
            destinationStation
        ) {
            const aliases = [
                destinationStation.ID_STASIUN,
                destinationStation.KODE_STASIUN,
                destinationStation.NAMA_STASIUN
            ].map(normalize);

            const idx = normalizedRoute.findIndex(
                station => aliases.includes(station)
            );

            if (idx !== -1 && originIndex !== -1) {
                return originIndex < idx;
            }
        }

        if (originIndex === -1 || destinationIndex === -1) {
            return false;
        }

        /*
         * PP = kedua arah diterima.
         */
        const relation =
            normalize(
                tariffRow?.RELASI ||
                ka.RELASI ||
                ""
            );

        if (
            relation === "pp" ||
            relation.includes("pp")
        ) {
            return true;
        }

        /*
         * Default = arah perjalanan mengikuti urutan route.
         */
        return originIndex < destinationIndex;
    }

    function routeIsCoveredByIndex(
        originIndex,
        destination,
        normalizedRoute,
        destinationStation
    ) {
        let destinationIndex = normalizedRoute.findIndex(
            station => station === normalize(destination)
        );

        if (
            destinationIndex === -1 &&
            destinationStation
        ) {
            const aliases = [
                destinationStation.ID_STASIUN,
                destinationStation.KODE_STASIUN,
                destinationStation.NAMA_STASIUN
            ].map(normalize);

            destinationIndex = normalizedRoute.findIndex(
                station => aliases.includes(station)
            );
        }

        if (destinationIndex === -1) {
            return false;
        }

        return originIndex < destinationIndex;
    }

    /* =====================================================
       FARE ITEM
       ===================================================== */

    function fareItem(tarifRow) {
        const fare = parseFare(tarifRow.TARIF);

        if (fare === null) {
            return null;
        }

        return {
            ...tarifRow,
            fare
        };
    }

    /* =====================================================
       LOWEST FARE
       ===================================================== */

    function getLowestFare(rows) {
        const fares = rows
            .map(fareItem)
            .filter(Boolean)
            .sort((a, b) => a.fare - b.fare);

        return fares[0] || null;
    }

    /* =====================================================
       CREATE TARIF DETAIL
       ===================================================== */

    function createTarifDetail(tarifRow, isMain = false) {
        const fare = parseFare(tarifRow.TARIF);

        if (fare === null) {
            return "";
        }

        const relation =
            clean(tarifRow.RELASI) ||
            "Sekali jalan";

        const note =
            clean(tarifRow.CATATAN);

        return `
            <div class="tariff-box ${isMain ? "tariff-main" : ""}">
                <div class="tariff-label">
                    ${isMain ? "TARIF KHUSUS" : "ALTERNATIF"}
                </div>

                <div class="tariff-price">
                    ${formatRupiah(fare)}
                </div>

                <div class="tariff-note">
                    ${escapeHTML(relation)}
                    ${
                        note
                            ? ` · ${escapeHTML(note)}`
                            : ""
                    }
                </div>
            </div>
        `;
    }

    /* =====================================================
       CREATE KA CARD
       ===================================================== */

    function createKAGroupCard(group, origin, destination) {
        const ka = group.ka;
        const fares = group.fares;

        const sorted = [...fares]
            .map(fareItem)
            .filter(Boolean)
            .sort((a, b) => a.fare - b.fare);

        if (sorted.length === 0) {
            return "";
        }

        const mainFare = sorted[0];

        const alternatives = sorted.slice(1);

        const kaName =
            ka?.NAMA_KA ||
            getNamaKA(mainFare.ID_KA);

        const kelas =
            ka?.KELAS ||
            getField(ka, ["KELAS", "CLASS"]);

        const route =
            getReferenceRoute(ka);

        const safeId = makeSafeId(
            `${mainFare.ID_KA}-${origin}-${destination}`
        );

        return `
            <article
                class="result-card"
                id="result-${safeId}"
            >

                <div class="result-card-head">

                    <div>
                        <div class="ka-name">
                            ${escapeHTML(kaName)}
                        </div>

                        ${
                            kelas
                                ? `
                                    <div class="ka-badge">
                                        ${escapeHTML(kelas)}
                                    </div>
                                  `
                                : ""
                        }
                    </div>

                    <div class="ka-code">
                        ${escapeHTML(mainFare.ID_KA)}
                    </div>

                </div>

                ${
                    route.length
                        ? relationHTML(route)
                        : `
                            <div class="route-line route-fallback">
                                ${escapeHTML(origin)}
                                <span class="route-arrow">→</span>
                                ${escapeHTML(destination)}
                            </div>
                          `
                }

                ${createTarifDetail(mainFare, true)}

                ${
                    alternatives.length
                        ? `
                            <div class="alternative-title">
                                Tarif alternatif
                            </div>

                            <div class="alternative-list">

                                ${alternatives.map(item => `
                                    <div class="alternative-item">

                                        <div>
                                            <div class="alternative-relation">
                                                ${
                                                    escapeHTML(
                                                        item.RELASI ||
                                                        "Alternatif"
                                                    )
                                                }
                                            </div>

                                            ${
                                                item.CATATAN
                                                    ? `
                                                        <div class="alternative-note">
                                                            ${escapeHTML(item.CATATAN)}
                                                        </div>
                                                      `
                                                    : ""
                                            }
                                        </div>

                                        <div class="alternative-price">
                                            ${formatRupiah(item.fare)}
                                        </div>

                                    </div>
                                `).join("")}

                            </div>
                          `
                        : ""
                }

            </article>
        `;
    }

    /* =====================================================
       SEARCH TARIF
       ===================================================== */

    function searchTarif(origin, destination) {
        const originClean = clean(origin);
        const destinationClean = clean(destination);

        if (!originClean || !destinationClean) {
            return [];
        }

        const groups = new Map();

        MASTER_TARIF.forEach(tarif => {
            if (!isTarifActive(tarif)) {
                return;
            }

            const fare = parseFare(tarif.TARIF);

            if (fare === null) {
                return;
            }

            const ka = getKA(tarif.ID_KA);

            /*
             * Jika ID_KA ada di MASTER_KA dan KA tersebut
             * secara eksplisit nonaktif, tarif ikut disembunyikan.
             *
             * Jika ID_KA tidak ditemukan di MASTER_KA,
             * tarif tetap diproses.
             */
            if (ka && !isKAActive(ka)) {
                return;
            }

            if (
                !routeIsCovered(
                    ka,
                    originClean,
                    destinationClean,
                    tarif
                )
            ) {
                return;
            }

            /*
             * Prioritaskan kecocokan langsung ASAL-TUJUAN
             * pada MASTER_TARIF.
             */
            const tariffOrigin = normalize(tarif.ASAL);
            const tariffDestination = normalize(tarif.TUJUAN);

            const originKey = normalize(originClean);
            const destinationKey = normalize(destinationClean);

            const direct =
                tariffOrigin === originKey &&
                tariffDestination === destinationKey;

            const ppReverse =
                normalize(tarif.RELASI) === "pp" &&
                tariffOrigin === destinationKey &&
                tariffDestination === originKey;

            /*
             * Jika tarif memiliki ASAL/TUJUAN yang jelas,
             * harus cocok dengan pencarian.
             *
             * Jika kosong, biarkan route KA yang menentukan.
             */
            const hasExplicitStations =
                Boolean(tariffOrigin || tariffDestination);

            if (hasExplicitStations) {
                if (!direct && !ppReverse) {
                    return;
                }
            }

            const id = clean(tarif.ID_KA);

            if (!groups.has(id)) {
                groups.set(id, {
                    ka,
                    fares: []
                });
            }

            groups.get(id).fares.push(tarif);
        });

        return [...groups.values()]
            .filter(group => group.fares.length > 0)
            .sort((a, b) => {
                const fareA = getLowestFare(a.fares);
                const fareB = getLowestFare(b.fares);

                return (
                    (fareA?.fare ?? Infinity) -
                    (fareB?.fare ?? Infinity)
                );
            });
    }

    /* =====================================================
       RENDER RESULTS
       ===================================================== */

    function renderResults(groups, origin, destination) {
        if (!results) {
            return;
        }

        results.style.display = "block";

        if (!groups || groups.length === 0) {
            results.innerHTML = `
                <div class="result-empty">

                    <div class="result-empty-icon">
                        🔎
                    </div>

                    <div class="result-empty-title">
                        Tarif khusus tidak ditemukan
                    </div>

                    <div class="result-empty-text">
                        Belum ada tarif khusus yang sesuai
                        dengan relasi ${escapeHTML(origin)}
                        → ${escapeHTML(destination)}.
                    </div>

                </div>
            `;

            setStatus(
                "Tarif khusus tidak ditemukan.",
                "empty"
            );

            return;
        }

        const cards = groups
            .map(group =>
                createKAGroupCard(
                    group,
                    origin,
                    destination
                )
            )
            .filter(Boolean)
            .join("");

        results.innerHTML = `
            <div class="results-header">

                <div class="results-heading">
                    Tarif khusus
                </div>

                <div class="results-count">
                    ${groups.length} KA
                </div>

            </div>

            ${cards}
        `;

        setStatus(
            `${groups.length} KA dengan tarif khusus.`,
            "success"
        );
    }

    /* =====================================================
       SUGGESTION ENGINE
       ===================================================== */

    function getStationSuggestions(keyword) {
        const query = normalize(keyword);

        if (!query) {
            return MASTER_STASIUN.slice(0, 8);
        }

        return MASTER_STASIUN
            .filter(station => {
                const name = normalize(
                    station.NAMA_STASIUN
                );

                const code = normalize(
                    station.KODE_STASIUN
                );

                return (
                    name.includes(query) ||
                    code.includes(query)
                );
            })
            .slice(0, 8);
    }

    function showSuggestions(input, container) {
        if (!input || !container) {
            return;
        }

        const keyword = input.value;

        const stations =
            getStationSuggestions(keyword);

        if (!stations.length) {
            container.innerHTML = "";
            container.hidden = true;
            return;
        }

        container.innerHTML = stations
            .map(station => `
                <button
                    type="button"
                    class="suggestion-item"
                    data-station-id="${escapeAttr(
                        station.ID_STASIUN ||
                        station.KODE_STASIUN ||
                        station.NAMA_STASIUN
                    )}"
                >

                    <span class="suggestion-main">
                        ${escapeHTML(
                            station.NAMA_STASIUN
                        )}
                    </span>

                    ${
                        station.KODE_STASIUN
                            ? `
                                <span class="suggestion-code">
                                    ${escapeHTML(
                                        station.KODE_STASIUN
                                    )}
                                </span>
                              `
                            : ""
                    }

                </button>
            `)
            .join("");

        container.hidden = false;

        container
            .querySelectorAll(".suggestion-item")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const station =
                            findStation(
                                button.dataset.stationId
                            );

                        if (!station) {
                            return;
                        }

                        input.value =
                            station.NAMA_STASIUN;

                        closeSuggestions();
                    }
                );
            });
    }

    function closeSuggestions() {
        [
            asalSuggestions,
            tujuanSuggestions
        ].forEach(container => {

            if (!container) {
                return;
            }

            container.hidden = true;
            container.innerHTML = "";
        });
    }

    /* =====================================================
       VALIDASI INPUT
       ===================================================== */

    function validateSearch() {
        const origin =
            clean(asalInput?.value);

        const destination =
            clean(tujuanInput?.value);

        if (!origin || !destination) {
            setStatus(
                "Silakan isi stasiun asal dan tujuan.",
                "warning"
            );

            return null;
        }

        if (
            normalize(origin) ===
            normalize(destination)
        ) {
            setStatus(
                "Stasiun asal dan tujuan tidak boleh sama.",
                "warning"
            );

            return null;
        }

        return {
            origin,
            destination
        };
    }

    /* =====================================================
       PERFORM SEARCH
       ===================================================== */

    async function performSearch() {
        if (isSearching) {
            return;
        }

        const query = validateSearch();

        if (!query) {
            return;
        }

        if (!isDataLoaded) {
            setStatus(
                "Data sedang dimuat. Silakan tunggu sebentar.",
                "loading"
            );

            return;
        }

        isSearching = true;

        closeSuggestions();

        if (results) {
            results.innerHTML = `
                <div class="result-loading">

                    <div class="result-spinner"></div>

                    <div>
                        Mencari tarif khusus...
                    </div>

                </div>
            `;
        }

        setStatus(
            "Mencari tarif khusus...",
            "loading"
        );

        /*
         * Sedikit delay agar loading state terlihat natural
         * dan UI tidak terasa freeze.
         */
        await new Promise(resolve =>
            requestAnimationFrame(resolve)
        );

        try {
            const groups = searchTarif(
                query.origin,
                query.destination
            );

            renderResults(
                groups,
                query.origin,
                query.destination
            );

            /*
             * Scroll ke hasil pada mobile.
             */
            if (results && groups.length) {
                setTimeout(() => {
                    results.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }, 80);
            }

        } catch (error) {

            console.error(
                "[TARSUS] Search error:",
                error
            );

            if (results) {
                results.innerHTML = `
                    <div class="result-empty">

                        <div class="result-empty-icon">
                            ⚠️
                        </div>

                        <div class="result-empty-title">
                            Terjadi kesalahan
                        </div>

                        <div class="result-empty-text">
                            Pencarian tidak dapat diproses.
                            Silakan coba lagi.
                        </div>

                    </div>
                `;
            }

            setStatus(
                "Terjadi kesalahan saat mencari data.",
                "error"
            );

        } finally {
            isSearching = false;
        }
    }

    /* =====================================================
       SWAP
       ===================================================== */

    function swapStations() {
        if (!asalInput || !tujuanInput) {
            return;
        }

        const oldOrigin = asalInput.value;

        asalInput.value =
            tujuanInput.value;

        tujuanInput.value =
            oldOrigin;

        closeSuggestions();

        /*
         * Jika keduanya sudah terisi, langsung cari ulang.
         */
        if (
            clean(asalInput.value) &&
            clean(tujuanInput.value) &&
            isDataLoaded
        ) {
            performSearch();
        }
    }

    /* =====================================================
       ENTER HANDLER
       ===================================================== */

    function handleEnter(event) {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        performSearch();
    }

    /* =====================================================
       DYNAMIC STYLE UNTUK SUGGESTION
       ===================================================== */

    function injectDynamicStyles() {
        if (document.getElementById("tarsus-data-styles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "tarsus-data-styles";

        style.textContent = `
            .suggestion-item {
                width: 100%;
                border: 0;
                background: transparent;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 12px 14px;
                text-align: left;
                cursor: pointer;
                color: inherit;
                font: inherit;
            }

            .suggestion-item:hover {
                background: rgba(0,0,0,.05);
            }

            [data-theme="dark"] .suggestion-item:hover {
                background: rgba(255,255,255,.06);
            }

            .suggestion-main {
                font-weight: 700;
            }

            .suggestion-code {
                font-size: .78rem;
                opacity: .6;
                font-weight: 700;
            }

            .ka-code {
                font-size: .75rem;
                font-weight: 800;
                opacity: .6;
            }

            .route-fallback {
                margin-top: 10px;
            }

            .alternative-note {
                margin-top: 3px;
                font-size: .76rem;
                opacity: .65;
            }

            .tariff-main {
                margin-top: 14px;
            }
        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       DEBUG INFO
       ===================================================== */

    function debugData() {
        console.group(
            "%cTARSUS FINDER DATA",
            "font-weight:bold"
        );

        console.log(
            "MASTER_KA:",
            MASTER_KA.length
        );

        console.log(
            "MASTER_TARIF:",
            MASTER_TARIF.length
        );

        console.log(
            "MASTER_STASIUN:",
            MASTER_STASIUN.length
        );

        console.log(
            "STATION_INDEX:",
            STATION_INDEX.size
        );

        console.log(
            "VERSION:",
            VERSION
        );

        console.groupEnd();
    }

    /* =====================================================
       LOAD ALL DATA
       ===================================================== */

    async function loadData() {
        splashStatus(
            "Menghubungkan ke database..."
        );

        try {
            const [
                kaRows,
                tarifRows,
                stasiunRows
            ] = await Promise.all([
                fetchSheet(SHEETS.ka),
                fetchSheet(SHEETS.tarif),
                fetchSheet(SHEETS.stasiun)
            ]);

            splashStatus(
                "Memproses data..."
            );

            MASTER_KA =
                parseMasterKA(kaRows);

            MASTER_TARIF =
                parseMasterTarif(tarifRows);

            MASTER_STASIUN =
                parseMasterStasiun(stasiunRows);

            buildStationIndex();

            isDataLoaded = true;

            debugData();

            splashStatus(
                "Database siap."
            );

            setStatus(
                `${MASTER_STASIUN.length} stasiun siap dicari.`,
                "success"
            );

            /*
             * Sedikit waktu agar splash tidak terasa
             * langsung hilang secara kasar.
             */
            setTimeout(() => {

                if (
                    window.TARSUS_UI &&
                    typeof window.TARSUS_UI.finishSplash ===
                        "function"
                ) {
                    window.TARSUS_UI.finishSplash();
                }

            }, 350);

        } catch (error) {

            console.error(
                "[TARSUS] Gagal memuat database:",
                error
            );

            isDataLoaded = false;

            splashStatus(
                "Gagal memuat database."
            );

            setStatus(
                "Database tidak dapat dimuat. Periksa koneksi atau akses Google Sheet.",
                "error"
            );

            if (results) {
                results.innerHTML = `
                    <div class="result-empty">

                        <div class="result-empty-icon">
                            ⚠️
                        </div>

                        <div class="result-empty-title">
                            Database belum tersedia
                        </div>

                        <div class="result-empty-text">
                            TARSUS Finder tidak dapat
                            mengambil data dari Google Sheet.
                            Silakan periksa koneksi internet
                            dan akses spreadsheet.
                        </div>

                    </div>
                `;
            }

            /*
             * Jangan biarkan splash menggantung selamanya
             * ketika database gagal.
             */
            setTimeout(() => {

                if (
                    window.TARSUS_UI &&
                    typeof window.TARSUS_UI.finishSplash ===
                        "function"
                ) {
                    window.TARSUS_UI.finishSplash();
                }

            }, 1200);
        }
    }

    /* =====================================================
       EVENT BINDING
       ===================================================== */

    function bindEvents() {
        injectDynamicStyles();

        if (searchBtn) {
            searchBtn.addEventListener(
                "click",
                performSearch
            );
        }

        if (swapBtn) {
            swapBtn.addEventListener(
                "click",
                swapStations
            );
        }

        if (asalInput) {

            asalInput.addEventListener(
                "input",
                () => {
                    showSuggestions(
                        asalInput,
                        asalSuggestions
                    );
                }
            );

            asalInput.addEventListener(
                "focus",
                () => {
                    showSuggestions(
                        asalInput,
                        asalSuggestions
                    );
                }
            );

            asalInput.addEventListener(
                "keydown",
                handleEnter
            );
        }

        if (tujuanInput) {

            tujuanInput.addEventListener(
                "input",
                () => {
                    showSuggestions(
                        tujuanInput,
                        tujuanSuggestions
                    );
                }
            );

            tujuanInput.addEventListener(
                "focus",
                () => {
                    showSuggestions(
                        tujuanInput,
                        tujuanSuggestions
                    );
                }
            );

            tujuanInput.addEventListener(
                "keydown",
                handleEnter
            );
        }

        document.addEventListener(
            "click",
            event => {

                const insideOrigin =
                    asalInput?.contains(event.target) ||
                    asalSuggestions?.contains(event.target);

                const insideDestination =
                    tujuanInput?.contains(event.target) ||
                    tujuanSuggestions?.contains(event.target);

                if (
                    !insideOrigin &&
                    !insideDestination
                ) {
                    closeSuggestions();
                }
            }
        );
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.TARSUS_DATA = {
        getKA,
        getNamaKA,
        findStation,
        searchTarif,
        formatRupiah,
        isDataLoaded: () => isDataLoaded,

        getAllKA: () =>
            [...MASTER_KA],

        getAllTarif: () =>
            [...MASTER_TARIF],

        getAllStasiun: () =>
            [...MASTER_STASIUN]
    };

    /* =====================================================
       START
       ===================================================== */

    function init() {
        bindEvents();
        loadData();
    }

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

})();
