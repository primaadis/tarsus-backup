/* =========================================================
   TARSUS FINDER
   DATA ENGINE v1.0.1
   ---------------------------------------------------------
   DATABASE:
   1. MASTER_KA
   2. MASTER_TARIF
   3. MASTER_STASIUN

   GOOGLE SHEET
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       KONFIGURASI
       ===================================================== */

    const TARSUS_SHEET_ID =
        "1a4Ln_wASazV35F2M3MKZcJHEmiAV8G-0WmkMmU4Csls";

    const TARSUS_SHEETS = {
        ka: "MASTER_KA",
        tarif: "MASTER_TARIF",
        stasiun: "MASTER_STASIUN"
    };


    /* =====================================================
       DATABASE MEMORY
       ===================================================== */

    let TARSUS_MASTER_KA = [];
    let TARSUS_MASTER_TARIF = [];
    let TARSUS_MASTER_STASIUN = [];

    let TARSUS_DATABASE_READY = false;
    let TARSUS_DATABASE_LOADING = false;


    /* =====================================================
       DOM HELPER
       ===================================================== */

    function tarsusEl(id) {
        return document.getElementById(id);
    }


    function tarsusEnsureResults() {

        let results = tarsusEl("results");

        if (results) {
            return results;
        }

        results = document.createElement("div");
        results.id = "results";

        const finderSection = tarsusEl("finderSection");

        if (finderSection && finderSection.parentNode) {

            finderSection.parentNode.insertBefore(
                results,
                finderSection.nextSibling
            );

        } else {

            document.body.appendChild(results);

        }

        return results;
    }


    /* =====================================================
       TEXT UTILITY
       ===================================================== */

    function tarsusClean(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value).trim();
    }


    function tarsusNormalize(value) {

        return tarsusClean(value)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();

    }


    function tarsusEscapeHTML(value) {

        return tarsusClean(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function tarsusEscapeAttr(value) {

        return tarsusEscapeHTML(value);

    }


    /* =====================================================
       CSV PARSER
       ===================================================== */

    function tarsusParseCSV(text) {

        const rows = [];
        let row = [];
        let value = "";
        let insideQuotes = false;

        for (let i = 0; i < text.length; i++) {

            const char = text[i];
            const next = text[i + 1];

            if (char === '"') {

                if (insideQuotes && next === '"') {

                    value += '"';
                    i++;

                } else {

                    insideQuotes = !insideQuotes;

                }

                continue;
            }


            if (char === "," && !insideQuotes) {

                row.push(value);
                value = "";
                continue;

            }


            if (
                (char === "\n" || char === "\r") &&
                !insideQuotes
            ) {

                if (char === "\r" && next === "\n") {
                    i++;
                }

                row.push(value);
                value = "";

                if (row.some(cell => tarsusClean(cell) !== "")) {
                    rows.push(row);
                }

                row = [];

                continue;
            }


            value += char;
        }


        row.push(value);

        if (row.some(cell => tarsusClean(cell) !== "")) {
            rows.push(row);
        }


        return rows;
    }


    /* =====================================================
       GOOGLE SHEET LOADER
       ===================================================== */

    async function tarsusLoadSheet(sheetName) {

        const url =
            "https://docs.google.com/spreadsheets/d/" +
            TARSUS_SHEET_ID +
            "/gviz/tq?tqx=out:csv&sheet=" +
            encodeURIComponent(sheetName);


        const response = await fetch(url, {
            cache: "no-store"
        });


        if (!response.ok) {

            throw new Error(
                "Gagal mengambil sheet " +
                sheetName +
                " (" +
                response.status +
                ")"
            );

        }


        return await response.text();
    }


    /* =====================================================
       ROW → OBJECT
       ===================================================== */

    function tarsusRowsToObjects(rows) {

        if (!rows || rows.length === 0) {
            return [];
        }


        const headers = rows[0].map(header =>
            tarsusClean(header)
        );


        const result = [];


        for (let i = 1; i < rows.length; i++) {

            const row = rows[i];

            if (!row || row.length === 0) {
                continue;
            }


            const obj = {};


            headers.forEach((header, index) => {

                obj[header] =
                    row[index] !== undefined
                        ? tarsusClean(row[index])
                        : "";

            });


            result.push(obj);
        }


        return result;
    }


    /* =====================================================
       FIELD HELPER
       ===================================================== */

    function tarsusField(row, names) {

        if (!row) {
            return "";
        }


        const keys = Object.keys(row);


        for (const name of names) {

            const target = tarsusNormalize(name);

            const found = keys.find(key =>
                tarsusNormalize(key) === target
            );


            if (found !== undefined) {

                const value = tarsusClean(row[found]);

                if (value !== "") {
                    return value;
                }

            }
        }


        return "";
    }


    /* =====================================================
       STATUS HELPER
       ===================================================== */

    function tarsusIsActive(value) {

        const v = tarsusNormalize(value);


        if (
            v === "" ||
            v === "aktif" ||
            v === "active" ||
            v === "ya" ||
            v === "yes" ||
            v === "1" ||
            v === "true"
        ) {

            return true;
        }


        if (
            v === "tidak" ||
            v === "nonaktif" ||
            v === "inactive" ||
            v === "non active" ||
            v === "no" ||
            v === "0" ||
            v === "false"
        ) {

            return false;
        }


        return true;
    }


    /* =====================================================
       MASTER KA
       ===================================================== */

    function tarsusParseMasterKA(rows) {

        return rows.map(row => {

            return {

                id_ka: tarsusField(row, [
                    "ID_KA",
                    "ID KA",
                    "ID"
                ]),

                nama_ka: tarsusField(row, [
                    "NAMA_KA",
                    "NAMA KA",
                    "NAMA",
                    "KA"
                ]),

                status: tarsusField(row, [
                    "STATUS",
                    "AKTIF",
                    "ACTIVE"
                ])

            };

        }).filter(item =>
            item.id_ka !== "" ||
            item.nama_ka !== ""
        );
    }


    /* =====================================================
       MASTER STASIUN
       ===================================================== */

    function tarsusParseMasterStasiun(rows) {

        return rows.map(row => {

            return {

                id_stasiun: tarsusField(row, [
                    "ID_STASIUN",
                    "ID STASIUN",
                    "ID"
                ]),

                kode_stasiun: tarsusField(row, [
                    "KODE_STASIUN",
                    "KODE STASIUN",
                    "KODE"
                ]),

                nama_stasiun: tarsusField(row, [
                    "NAMA_STASIUN",
                    "NAMA STASIUN",
                    "NAMA"
                ]),

                status: tarsusField(row, [
                    "STATUS",
                    "AKTIF",
                    "ACTIVE"
                ])

            };

        }).filter(item =>
            item.nama_stasiun !== "" ||
            item.kode_stasiun !== ""
        );
    }


    /* =====================================================
       MASTER TARIF
       ===================================================== */

    function tarsusParseMasterTarif(rows) {

        return rows.map(row => {

            const stasiun = [];

            for (let i = 1; i <= 15; i++) {

                const station = tarsusField(row, [
                    "STASIUN_" + i,
                    "STASIUN " + i
                ]);

                if (station !== "") {
                    stasiun.push(station);
                }
            }


            return {

                id_tarif: tarsusField(row, [
                    "ID_TARIF",
                    "ID TARIF",
                    "ID"
                ]),

                id_ka: tarsusField(row, [
                    "ID_KA",
                    "ID KA"
                ]),

                arah: tarsusField(row, [
                    "ARAH"
                ]),

                pola_relasi: tarsusField(row, [
                    "POLA_RELASI",
                    "POLA RELASI"
                ]),

                stasiun: stasiun,

                eks: tarsusField(row, [
                    "EKS",
                    "EKSEKUTIF"
                ]),

                bis: tarsusField(row, [
                    "BIS",
                    "BISNIS"
                ]),

                eko: tarsusField(row, [
                    "EKO",
                    "EKONOMI"
                ]),

                status: tarsusField(row, [
                    "STATUS",
                    "AKTIF",
                    "ACTIVE"
                ])

            };

        }).filter(item =>
            item.id_tarif !== "" ||
            item.id_ka !== "" ||
            item.stasiun.length > 0
        );
    }


    /* =====================================================
       TARIF PARSER
       ===================================================== */

    function tarsusParseFare(value) {

        const raw = tarsusClean(value);

        if (
            raw === "" ||
            raw === "-" ||
            raw === "—"
        ) {
            return null;
        }


        const number = raw
            .replace(/rp/gi, "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(/,/g, "")
            .replace(/[^\d]/g, "");


        if (!number) {
            return null;
        }


        const result = Number(number);


        return Number.isFinite(result)
            ? result
            : null;
    }


    function tarsusFormatRupiah(value) {

        if (
            value === null ||
            value === undefined ||
            !Number.isFinite(Number(value))
        ) {

            return "-";
        }


        return new Intl.NumberFormat(
            "id-ID"
        ).format(Number(value));
    }


    function tarsusGetLowestFare(tarif) {

        const fares = [
            {
                kelas: "Eksekutif",
                harga: tarsusParseFare(tarif.eks)
            },
            {
                kelas: "Bisnis",
                harga: tarsusParseFare(tarif.bis)
            },
            {
                kelas: "Ekonomi",
                harga: tarsusParseFare(tarif.eko)
            }
        ].filter(item =>
            item.harga !== null
        );


        if (fares.length === 0) {
            return null;
        }


        fares.sort((a, b) =>
            a.harga - b.harga
        );


        return fares[0];
    }


    /* =====================================================
       SELESAI PART 1
       ===================================================== */
 /* =====================================================
   STATION MATCHING
   ===================================================== */

function tarsusFindStation(value) {

    const search = tarsusNormalize(value);

    if (!search) {
        return null;
    }


    const stations = TARSUS_MASTER_STASIUN.filter(
        station => tarsusIsActive(station.status)
    );


    /* COCOK NAMA STASIUN */

    let found = stations.find(station =>
        tarsusNormalize(station.nama_stasiun) === search
    );

    if (found) {
        return found;
    }


    /* COCOK KODE STASIUN */

    found = stations.find(station =>
        tarsusNormalize(station.kode_stasiun) === search
    );

    if (found) {
        return found;
    }


    /* COCOK ID STASIUN */

    found = stations.find(station =>
        tarsusNormalize(station.id_stasiun) === search
    );

    if (found) {
        return found;
    }


    return null;
}


/* =====================================================
   STATION ALIAS MATCHING
   ===================================================== */

function tarsusStationMatches(
    stationValue,
    targetStation
) {

    if (!stationValue || !targetStation) {
        return false;
    }


    const source = tarsusNormalize(stationValue);


    const possibleValues = [
        targetStation.id_stasiun,
        targetStation.kode_stasiun,
        targetStation.nama_stasiun
    ];


    return possibleValues.some(value =>
        value &&
        tarsusNormalize(value) === source
    );
}


/* =====================================================
   TARIF STATION MATCHING
   ===================================================== */

function tarsusFindStationIndex(
    tarif,
    targetStation
) {

    if (!tarif || !targetStation) {
        return -1;
    }


    for (
        let i = 0;
        i < tarif.stasiun.length;
        i++
    ) {

        if (
            tarsusStationMatches(
                tarif.stasiun[i],
                targetStation
            )
        ) {

            return i;
        }
    }


    return -1;
}


/* =====================================================
   ROUTE COVERAGE
   ===================================================== */

function tarsusRouteIsCovered(
    tarif,
    asalStation,
    tujuanStation
) {

    if (
        !tarif ||
        !asalStation ||
        !tujuanStation
    ) {

        return false;
    }


    const asalIndex =
        tarsusFindStationIndex(
            tarif,
            asalStation
        );


    const tujuanIndex =
        tarsusFindStationIndex(
            tarif,
            tujuanStation
        );


    if (
        asalIndex === -1 ||
        tujuanIndex === -1
    ) {

        return false;
    }


    /* RELASI PP BISA DUA ARAH */

    const pola =
        tarsusNormalize(
            tarif.pola_relasi
        );


    if (
        pola === "pp" ||
        pola === "pulang pergi" ||
        pola === "pulang-pergi"
    ) {

        return true;
    }


    /* RELASI BIASA HARUS SESUAI ARAH */

    return asalIndex < tujuanIndex;
}


/* =====================================================
   GET NAMA KA
   ===================================================== */

function tarsusGetNamaKA(idKA) {

    const target =
        tarsusNormalize(idKA);


    const ka =
        TARSUS_MASTER_KA.find(item =>
            tarsusNormalize(item.id_ka) === target
        );


    if (ka && ka.nama_ka) {
        return ka.nama_ka;
    }


    return idKA || "Kereta Api";
}


/* =====================================================
   CHECK KA ACTIVE
   ===================================================== */

function tarsusIsKAActive(idKA) {

    const target =
        tarsusNormalize(idKA);


    const ka =
        TARSUS_MASTER_KA.find(item =>
            tarsusNormalize(item.id_ka) === target
        );


    if (!ka) {
        return false;
    }


    return tarsusIsActive(
        ka.status
    );
}


/* =====================================================
   CHECK TARIF ACTIVE
   ===================================================== */

function tarsusIsTarifActive(tarif) {

    if (!tarif) {
        return false;
    }


    return tarsusIsActive(
        tarif.status
    );
}


/* =====================================================
   GET REFERENCE ROUTE
   ===================================================== */

function tarsusGetReferenceRoute(tarif) {

    if (
        !tarif ||
        !Array.isArray(tarif.stasiun)
    ) {

        return [];
    }


    return tarif.stasiun.filter(
        station =>
            tarsusClean(station) !== ""
    );
}


/* =====================================================
   FARE ITEMS
   ===================================================== */

function tarsusFareItems(tarif) {

    const result = [];


    const fares = [
        {
            label: "Eksekutif",
            value: tarsusParseFare(
                tarif.eks
            )
        },

        {
            label: "Bisnis",
            value: tarsusParseFare(
                tarif.bis
            )
        },

        {
            label: "Ekonomi",
            value: tarsusParseFare(
                tarif.eko
            )
        }
    ];


    fares.forEach(item => {

        if (item.value !== null) {

            result.push(item);

        }

    });


    return result;
}


/* =====================================================
   ROUTE DISPLAY
   ===================================================== */

function tarsusRelationHTML(
    tarif
) {

    const stations =
        tarsusGetReferenceRoute(tarif);


    if (stations.length === 0) {
        return "-";
    }


    return stations
        .map(
            station =>
                `<span class="tarsus-route-station">
                    ${tarsusEscapeHTML(station)}
                 </span>`
        )
        .join(
            `<span class="tarsus-route-arrow">→</span>`
        );
}


/* =====================================================
   RESULT OBJECT
   ===================================================== */

function tarsusCreateResult(
    tarif,
    asalStation,
    tujuanStation
) {

    const lowestFare =
        tarsusGetLowestFare(tarif);


    if (!lowestFare) {
        return null;
    }


    const namaKA =
        tarsusGetNamaKA(
            tarif.id_ka
        );


    return {

        tarif: tarif,

        id_tarif: tarif.id_tarif,

        id_ka: tarif.id_ka,

        nama_ka: namaKA,

        asal:
            asalStation.nama_stasiun,

        tujuan:
            tujuanStation.nama_stasiun,

        harga:
            lowestFare.harga,

        kelas:
            lowestFare.kelas,

        fares:
            tarsusFareItems(tarif),

        route:
            tarsusGetReferenceRoute(tarif)

    };
}


/* =====================================================
   SEARCH TARIF
   ===================================================== */

function tarsusSearchTarif(
    asalValue,
    tujuanValue
) {

    const asalStation =
        tarsusFindStation(
            asalValue
        );


    const tujuanStation =
        tarsusFindStation(
            tujuanValue
        );


    if (!asalStation) {

        return {
            success: false,
            message:
                "Stasiun asal tidak ditemukan.",
            results: []
        };

    }


    if (!tujuanStation) {

        return {
            success: false,
            message:
                "Stasiun tujuan tidak ditemukan.",
            results: []
        };

    }


    if (
        tarsusNormalize(
            asalStation.nama_stasiun
        ) ===
        tarsusNormalize(
            tujuanStation.nama_stasiun
        )
    ) {

        return {
            success: false,
            message:
                "Stasiun asal dan tujuan tidak boleh sama.",
            results: []
        };

    }


    const matched = [];


    TARSUS_MASTER_TARIF.forEach(tarif => {

        if (
            !tarsusIsTarifActive(tarif)
        ) {

            return;
        }


        if (
            !tarsusIsKAActive(
                tarif.id_ka
            )
        ) {

            return;
        }


        if (
            !tarsusRouteIsCovered(
                tarif,
                asalStation,
                tujuanStation
            )
        ) {

            return;
        }


        const result =
            tarsusCreateResult(
                tarif,
                asalStation,
                tujuanStation
            );


        if (result) {
            matched.push(result);
        }

    });


    /* SORT BERDASARKAN TARIF TERMURAH */

    matched.sort(
        (a, b) => {

            if (a.harga !== b.harga) {
                return a.harga - b.harga;
            }


            return a.nama_ka.localeCompare(
                b.nama_ka,
                "id"
            );

        }
    );


    return {

        success: true,

        message:
            matched.length > 0
                ? `${matched.length} tarif ditemukan.`
                : "Tarif khusus tidak ditemukan.",

        results: matched

    };
}


/* =====================================================
   GROUP RESULT BY KA
   ===================================================== */

function tarsusGroupResults(
    results
) {

    const groups = {};


    results.forEach(result => {

        const key =
            tarsusNormalize(
                result.nama_ka
            );


        if (!groups[key]) {

            groups[key] = {

                nama_ka:
                    result.nama_ka,

                items: []

            };

        }


        groups[key].items.push(
            result
        );

    });


    return Object.values(groups);
}


/* =====================================================
   SELESAI PART 2
   ===================================================== */
 /* =====================================================
   RENDER RESULT
   ===================================================== */

function tarsusRenderResults(
    searchResult
) {

    const resultsEl =
        tarsusEnsureResults();


    if (!resultsEl) {
        return;
    }


    if (
        !searchResult ||
        !searchResult.success
    ) {

        resultsEl.innerHTML = `
            <div class="tarsus-result-empty">
                <div class="tarsus-empty-icon">⚠</div>
                <div class="tarsus-empty-title">
                    Pencarian tidak dapat diproses
                </div>
                <div class="tarsus-empty-text">
                    ${tarsusEscapeHTML(
                        searchResult?.message ||
                        "Terjadi kesalahan."
                    )}
                </div>
            </div>
        `;

        return;
    }


    if (
        !searchResult.results ||
        searchResult.results.length === 0
    ) {

        resultsEl.innerHTML = `
            <div class="tarsus-result-empty">
                <div class="tarsus-empty-icon">⌕</div>
                <div class="tarsus-empty-title">
                    Tarif tidak ditemukan
                </div>
                <div class="tarsus-empty-text">
                    Belum ada tarif khusus yang sesuai
                    dengan rute tersebut.
                </div>
            </div>
        `;

        return;
    }


    const groups =
        tarsusGroupResults(
            searchResult.results
        );


    let html = "";


    groups.forEach(
        (group, groupIndex) => {

            const first =
                group.items[0];


            html += `
                <div class="tarsus-result-card">

                    <div class="tarsus-result-header">

                        <div class="tarsus-ka-icon">
                            KA
                        </div>

                        <div class="tarsus-ka-info">

                            <div class="tarsus-ka-name">
                                ${tarsusEscapeHTML(
                                    group.nama_ka
                                )}
                            </div>

                            <div class="tarsus-ka-route">
                                ${tarsusEscapeHTML(
                                    first.asal
                                )}
                                <span>→</span>
                                ${tarsusEscapeHTML(
                                    first.tujuan
                                )}
                            </div>

                        </div>

                    </div>


                    <div class="tarsus-main-fare">

                        <div class="tarsus-fare-label">
                            Tarif Khusus
                        </div>

                        <div class="tarsus-fare-price">
                            Rp ${tarsusFormatRupiah(
                                first.harga
                            )}
                        </div>

                        <div class="tarsus-fare-class">
                            ${tarsusEscapeHTML(
                                first.kelas
                            )}
                        </div>

                    </div>


                    <div class="tarsus-fare-list">

                        ${first.fares
                            .map(fare => `
                                <div class="tarsus-fare-row">

                                    <span>
                                        ${tarsusEscapeHTML(
                                            fare.label
                                        )}
                                    </span>

                                    <strong>
                                        Rp ${tarsusFormatRupiah(
                                            fare.value
                                        )}
                                    </strong>

                                </div>
                            `)
                            .join("")}

                    </div>


                    ${
                        group.items.length > 1
                            ? `
                                <details class="tarsus-alternative">

                                    <summary>
                                        Lihat ${group.items.length - 1}
                                        alternatif tarif
                                    </summary>

                                    <div class="tarsus-alternative-list">

                                        ${group.items
                                            .slice(1)
                                            .map(item => `
                                                <div class="tarsus-alternative-item">

                                                    <div class="tarsus-alternative-route">

                                                        ${tarsusEscapeHTML(
                                                            item.route[0] ||
                                                            item.asal
                                                        )}

                                                        <span>→</span>

                                                        ${tarsusEscapeHTML(
                                                            item.route[
                                                                item.route.length - 1
                                                            ] ||
                                                            item.tujuan
                                                        )}

                                                    </div>

                                                    <div class="tarsus-alternative-price">

                                                        Rp ${tarsusFormatRupiah(
                                                            item.harga
                                                        )}

                                                    </div>

                                                    <div class="tarsus-alternative-class">

                                                        ${tarsusEscapeHTML(
                                                            item.kelas
                                                        )}

                                                    </div>

                                                </div>
                                            `)
                                            .join("")}

                                    </div>

                                </details>
                            `
                            : ""
                    }

                </div>
            `;
        }
    );


    resultsEl.innerHTML = `
        <div class="tarsus-results-title">
            <div>
                <strong>
                    Hasil Pencarian
                </strong>

                <span>
                    ${searchResult.results.length}
                    tarif ditemukan
                </span>
            </div>
        </div>

        <div class="tarsus-results-list">
            ${html}
        </div>
    `;
}


/* =====================================================
   STATUS
   ===================================================== */

function tarsusSetStatus(
    message,
    type = ""
) {

    const status =
        tarsusEl("status");


    if (!status) {
        return;
    }


    status.textContent =
        message || "";


    status.className =
        "status" +
        (
            type
                ? " " + type
                : ""
        );
}


/* =====================================================
   SEARCH ACTION
   ===================================================== */

async function tarsusPerformSearch() {

    const asalInput =
        tarsusEl("asal");

    const tujuanInput =
        tarsusEl("tujuan");


    if (!asalInput || !tujuanInput) {
        return;
    }


    const asal =
        tarsusClean(
            asalInput.value
        );

    const tujuan =
        tarsusClean(
            tujuanInput.value
        );


    if (!asal || !tujuan) {

        tarsusSetStatus(
            "Silakan isi stasiun asal dan tujuan.",
            "error"
        );

        tarsusRenderResults({
            success: false,
            message:
                "Stasiun asal dan tujuan wajib diisi."
        });

        return;
    }


    if (!TARSUS_DATABASE_READY) {

        tarsusSetStatus(
            "Database masih dimuat. Tunggu sebentar...",
            "loading"
        );

        return;
    }


    tarsusSetStatus(
        "Mencari tarif...",
        "loading"
    );


    const button =
        tarsusEl("searchBtn");


    if (button) {
        button.disabled = true;
    }


    try {

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    100
                )
        );


        const result =
            tarsusSearchTarif(
                asal,
                tujuan
            );


        if (
            result.results &&
            result.results.length > 0
        ) {

            tarsusSetStatus(
                `${result.results.length} tarif ditemukan.`,
                "success"
            );

        } else {

            tarsusSetStatus(
                "Tarif khusus tidak ditemukan.",
                "error"
            );

        }


        tarsusRenderResults(
            result
        );


        const resultsEl =
            tarsusEl("results");


        if (resultsEl) {

            setTimeout(() => {

                resultsEl.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 80);

        }

    } catch (error) {

        console.error(
            "TARSUS SEARCH ERROR:",
            error
        );


        tarsusSetStatus(
            "Terjadi kesalahan saat mencari tarif.",
            "error"
        );


        tarsusRenderResults({
            success: false,
            message:
                "Terjadi kesalahan saat memproses pencarian."
        });

    } finally {

        if (button) {
            button.disabled = false;
        }

    }
}


/* =====================================================
   SWAP STATION
   ===================================================== */

function tarsusSwapStations() {

    const asal =
        tarsusEl("asal");

    const tujuan =
        tarsusEl("tujuan");


    if (!asal || !tujuan) {
        return;
    }


    const temp =
        asal.value;


    asal.value =
        tujuan.value;

    tujuan.value =
        temp;


    if (
        tarsusClean(
            asal.value
        ) &&
        tarsusClean(
            tujuan.value
        ) &&
        TARSUS_DATABASE_READY
    ) {

        tarsusPerformSearch();

    }

}


/* =====================================================
   ENTER KEY
   ===================================================== */

function tarsusHandleEnter(event) {

    if (
        event.key === "Enter"
    ) {

        event.preventDefault();

        tarsusPerformSearch();

    }

}


/* =====================================================
   SELESAI PART 3
   ===================================================== */
 /* =====================================================
   SUGGESTION SYSTEM
   ===================================================== */

function tarsusShowSuggestions(
    input,
    suggestionBox
) {

    if (!input || !suggestionBox) {
        return;
    }


    const keyword =
        tarsusNormalize(
            input.value
        );


    if (!keyword) {

        suggestionBox.innerHTML = "";
        suggestionBox.classList.remove("show");

        return;
    }


    const stations =
        TARSUS_MASTER_STASIUN
            .filter(station =>
                tarsusIsActive(
                    station.status
                )
            )
            .filter(station => {

                const nama =
                    tarsusNormalize(
                        station.nama_stasiun
                    );

                const kode =
                    tarsusNormalize(
                        station.kode_stasiun
                    );


                return (
                    nama.includes(keyword) ||
                    kode.includes(keyword)
                );

            })
            .slice(0, 8);


    if (stations.length === 0) {

        suggestionBox.innerHTML = "";
        suggestionBox.classList.remove("show");

        return;
    }


    suggestionBox.innerHTML =
        stations.map(station => {

            const nama =
                tarsusEscapeHTML(
                    station.nama_stasiun
                );

            const kode =
                tarsusEscapeHTML(
                    station.kode_stasiun
                );


            return `
                <button
                    type="button"
                    class="tarsus-suggestion-item"
                    data-station="${tarsusEscapeAttr(
                        station.nama_stasiun
                    )}"
                >

                    <span class="tarsus-suggestion-icon">
                        ●
                    </span>

                    <span class="tarsus-suggestion-text">

                        <strong>
                            ${nama}
                        </strong>

                        ${
                            kode
                                ? `
                                    <small>
                                        ${kode}
                                    </small>
                                  `
                                : ""
                        }

                    </span>

                </button>
            `;

        }).join("");


    suggestionBox.classList.add("show");
}


/* =====================================================
   CLOSE SUGGESTIONS
   ===================================================== */

function tarsusCloseSuggestions(
    suggestionBox
) {

    if (!suggestionBox) {
        return;
    }


    suggestionBox.innerHTML = "";

    suggestionBox.classList.remove(
        "show"
    );
}


/* =====================================================
   SUGGESTION CLICK
   ===================================================== */

function tarsusSuggestionClick(
    event,
    input,
    suggestionBox
) {

    const item =
        event.target.closest(
            ".tarsus-suggestion-item"
        );


    if (!item) {
        return;
    }


    const station =
        item.getAttribute(
            "data-station"
        );


    if (input && station) {

        input.value =
            station;

    }


    tarsusCloseSuggestions(
        suggestionBox
    );

}


/* =====================================================
   DYNAMIC CSS
   ===================================================== */

function tarsusInjectStyles() {

    if (
        document.getElementById(
            "tarsusDataEngineStyles"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "tarsusDataEngineStyles";


    style.textContent = `

        /* =============================================
           RESULT CONTAINER
           ============================================= */

        #results {
            width: 100%;
            max-width: 900px;
            margin: 20px auto 0;
        }


        /* =============================================
           RESULT TITLE
           ============================================= */

        .tarsus-results-title {
            margin-bottom: 12px;
            padding: 0 4px;
        }


        .tarsus-results-title strong {
            display: block;
            font-size: 17px;
            font-weight: 800;
        }


        .tarsus-results-title span {
            display: block;
            margin-top: 3px;
            font-size: 12px;
            opacity: .65;
        }


        /* =============================================
           RESULT CARD
           ============================================= */

        .tarsus-result-card {
            position: relative;
            overflow: hidden;

            margin-bottom: 14px;
            padding: 16px;

            border-radius: 18px;

            background:
                var(
                    --card,
                    rgba(255,255,255,.96)
                );

            border:
                1px solid
                var(
                    --border,
                    rgba(0,0,0,.08)
                );

            box-shadow:
                0 8px 28px
                rgba(0,0,0,.06);

            animation:
                tarsusResultIn .28s ease both;
        }


        @keyframes tarsusResultIn {

            from {
                opacity: 0;
                transform:
                    translateY(8px);
            }

            to {
                opacity: 1;
                transform:
                    translateY(0);
            }

        }


        /* =============================================
           KA HEADER
           ============================================= */

        .tarsus-result-header {
            display: flex;
            align-items: center;
            gap: 12px;
        }


        .tarsus-ka-icon {
            width: 42px;
            height: 42px;

            display: flex;
            align-items: center;
            justify-content: center;

            flex-shrink: 0;

            border-radius: 13px;

            font-size: 11px;
            font-weight: 900;

            background:
                linear-gradient(
                    135deg,
                    #172033,
                    #34425c
                );

            color: white;
        }


        .tarsus-ka-info {
            min-width: 0;
            flex: 1;
        }


        .tarsus-ka-name {
            font-size: 16px;
            font-weight: 800;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }


        .tarsus-ka-route {
            margin-top: 3px;

            font-size: 12px;

            opacity: .68;
        }


        .tarsus-ka-route span {
            margin: 0 5px;
            font-weight: 800;
        }


        /* =============================================
           MAIN FARE
           ============================================= */

        .tarsus-main-fare {
            margin-top: 15px;
            padding: 14px;

            border-radius: 14px;

            background:
                rgba(127,127,127,.07);
        }


        .tarsus-fare-label {
            font-size: 11px;
            font-weight: 700;
            opacity: .62;

            text-transform: uppercase;
            letter-spacing: .04em;
        }


        .tarsus-fare-price {
            margin-top: 3px;

            font-size: 23px;
            line-height: 1.15;

            font-weight: 900;
        }


        .tarsus-fare-class {
            margin-top: 4px;

            font-size: 11px;
            opacity: .6;
        }


        /* =============================================
           FARE LIST
           ============================================= */

        .tarsus-fare-list {
            margin-top: 10px;
        }


        .tarsus-fare-row {
            display: flex;
            justify-content: space-between;
            align-items: center;

            padding: 8px 2px;

            border-bottom:
                1px solid
                rgba(127,127,127,.12);

            font-size: 12px;
        }


        .tarsus-fare-row:last-child {
            border-bottom: none;
        }


        .tarsus-fare-row strong {
            font-weight: 800;
        }


        /* =============================================
           ALTERNATIVE
           ============================================= */

        .tarsus-alternative {
            margin-top: 10px;

            border-top:
                1px solid
                rgba(127,127,127,.12);

            padding-top: 10px;
        }


        .tarsus-alternative summary {
            cursor: pointer;

            font-size: 12px;
            font-weight: 700;

            opacity: .72;
        }


        .tarsus-alternative-list {
            margin-top: 8px;
        }


        .tarsus-alternative-item {
            padding: 10px;

            border-radius: 12px;

            background:
                rgba(127,127,127,.06);

            margin-bottom: 7px;
        }


        .tarsus-alternative-route {
            font-size: 11px;
            font-weight: 700;
        }


        .tarsus-alternative-route span {
            margin: 0 4px;
        }


        .tarsus-alternative-price {
            margin-top: 4px;

            font-size: 14px;
            font-weight: 900;
        }


        .tarsus-alternative-class {
            margin-top: 2px;

            font-size: 10px;
            opacity: .6;
        }


        /* =============================================
           EMPTY / ERROR
           ============================================= */

        .tarsus-result-empty {
            margin-top: 14px;
            padding: 28px 18px;

            text-align: center;

            border-radius: 18px;

            background:
                var(
                    --card,
                    rgba(255,255,255,.96)
                );

            border:
                1px solid
                var(
                    --border,
                    rgba(0,0,0,.08)
                );
        }


        .tarsus-empty-icon {
            font-size: 28px;
            font-weight: 900;
            opacity: .5;
        }


        .tarsus-empty-title {
            margin-top: 8px;

            font-size: 15px;
            font-weight: 800;
        }


        .tarsus-empty-text {
            margin-top: 5px;

            font-size: 12px;
            line-height: 1.5;

            opacity: .62;
        }


        /* =============================================
           SUGGESTION
           ============================================= */

        .tarsus-suggestion-item {
            width: 100%;

            display: flex;
            align-items: center;

            gap: 10px;

            padding: 10px 12px;

            border: none;

            background: transparent;

            text-align: left;

            cursor: pointer;
        }


        .tarsus-suggestion-item:hover {
            background:
                rgba(127,127,127,.08);
        }


        .tarsus-suggestion-icon {
            width: 28px;
            height: 28px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background:
                rgba(127,127,127,.10);

            font-size: 9px;
        }


        .tarsus-suggestion-text {
            display: flex;
            flex-direction: column;

            min-width: 0;
        }


        .tarsus-suggestion-text strong {
            font-size: 13px;
        }


        .tarsus-suggestion-text small {
            margin-top: 2px;

            font-size: 10px;
            opacity: .55;
        }


        /* =============================================
           MOBILE
           ============================================= */

        @media (max-width: 600px) {

            #results {
                margin-top: 14px;
            }


            .tarsus-result-card {
                padding: 14px;
                border-radius: 16px;
            }


            .tarsus-fare-price {
                font-size: 21px;
            }

        }

    `;


    document.head.appendChild(
        style
    );
}


/* =====================================================
   EVENT BINDING
   ===================================================== */

function tarsusBindEvents() {

    const asal =
        tarsusEl("asal");

    const tujuan =
        tarsusEl("tujuan");

    const asalSuggestions =
        tarsusEl(
            "asal-suggestions"
        );

    const tujuanSuggestions =
        tarsusEl(
            "tujuan-suggestions"
        );

    const searchBtn =
        tarsusEl("searchBtn");

    const swapBtn =
        tarsusEl("swapBtn");


    /* =============================================
       ASAL
       ============================================= */

    if (asal) {

        asal.addEventListener(
            "input",
            () => {

                tarsusShowSuggestions(
                    asal,
                    asalSuggestions
                );

            }
        );


        asal.addEventListener(
            "focus",
            () => {

                if (
                    tarsusClean(
                        asal.value
                    )
                ) {

                    tarsusShowSuggestions(
                        asal,
                        asalSuggestions
                    );

                }

            }
        );


        asal.addEventListener(
            "keydown",
            tarsusHandleEnter
        );

    }


    /* =============================================
       TUJUAN
       ============================================= */

    if (tujuan) {

        tujuan.addEventListener(
            "input",
            () => {

                tarsusShowSuggestions(
                    tujuan,
                    tujuanSuggestions
                );

            }
        );


        tujuan.addEventListener(
            "focus",
            () => {

                if (
                    tarsusClean(
                        tujuan.value
                    )
                ) {

                    tarsusShowSuggestions(
                        tujuan,
                        tujuanSuggestions
                    );

                }

            }
        );


        tujuan.addEventListener(
            "keydown",
            tarsusHandleEnter
        );

    }


    /* =============================================
       SUGGESTION CLICK
       ============================================= */

    if (asalSuggestions) {

        asalSuggestions.addEventListener(
            "click",
            event => {

                tarsusSuggestionClick(
                    event,
                    asal,
                    asalSuggestions
                );

            }
        );

    }


    if (tujuanSuggestions) {

        tujuanSuggestions.addEventListener(
            "click",
            event => {

                tarsusSuggestionClick(
                    event,
                    tujuan,
                    tujuanSuggestions
                );

            }
        );

    }


    /* =============================================
       SEARCH BUTTON
       ============================================= */

    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            tarsusPerformSearch
        );

    }


    /* =============================================
       SWAP BUTTON
       ============================================= */

    if (swapBtn) {

        swapBtn.addEventListener(
            "click",
            tarsusSwapStations
        );

    }


    /* =============================================
       DOCUMENT CLICK
       ============================================= */

    document.addEventListener(
        "click",
        event => {

            if (
                asal &&
                asalSuggestions &&
                !asal.contains(event.target) &&
                !asalSuggestions.contains(event.target)
            ) {

                tarsusCloseSuggestions(
                    asalSuggestions
                );

            }


            if (
                tujuan &&
                tujuanSuggestions &&
                !tujuan.contains(event.target) &&
                !tujuanSuggestions.contains(event.target)
            ) {

                tarsusCloseSuggestions(
                    tujuanSuggestions
                );

            }

        }
    );

}


/* =====================================================
   SELESAI PART 4
   ===================================================== */
 /* =====================================================
   LOAD DATABASE
   ===================================================== */

async function tarsusLoadDatabase() {

    if (TARSUS_DATABASE_LOADING) {
        return;
    }


    TARSUS_DATABASE_LOADING = true;


    const splashStatus =
        tarsusEl("splashStatus");


    if (splashStatus) {
        splashStatus.textContent =
            "Memuat database TARSUS...";
    }


    tarsusSetStatus(
        "Memuat database...",
        "loading"
    );


    try {

        console.log(
            "TARSUS: mulai memuat database..."
        );


        /* =============================================
           LOAD 3 MASTER SECARA BERSAMAAN
           ============================================= */

        const [
            kaCSV,
            tarifCSV,
            stasiunCSV
        ] = await Promise.all([

            tarsusLoadSheet(
                TARSUS_SHEETS.ka
            ),

            tarsusLoadSheet(
                TARSUS_SHEETS.tarif
            ),

            tarsusLoadSheet(
                TARSUS_SHEETS.stasiun
            )

        ]);


        console.log(
            "TARSUS: CSV berhasil diterima."
        );


        /* =============================================
           PARSE CSV
           ============================================= */

        const kaRows =
            tarsusParseCSV(
                kaCSV
            );


        const tarifRows =
            tarsusParseCSV(
                tarifCSV
            );


        const stasiunRows =
            tarsusParseCSV(
                stasiunCSV
            );


        console.log(
            "TARSUS: jumlah baris mentah:",
            {
                MASTER_KA:
                    kaRows.length,

                MASTER_TARIF:
                    tarifRows.length,

                MASTER_STASIUN:
                    stasiunRows.length
            }
        );


        /* =============================================
           OBJECT
           ============================================= */

        const kaObjects =
            tarsusRowsToObjects(
                kaRows
            );


        const tarifObjects =
            tarsusRowsToObjects(
                tarifRows
            );


        const stasiunObjects =
            tarsusRowsToObjects(
                stasiunRows
            );


        /* =============================================
           PARSE MASTER
           ============================================= */

        TARSUS_MASTER_KA =
            tarsusParseMasterKA(
                kaObjects
            );


        TARSUS_MASTER_TARIF =
            tarsusParseMasterTarif(
                tarifObjects
            );


        TARSUS_MASTER_STASIUN =
            tarsusParseMasterStasiun(
                stasiunObjects
            );


        /* =============================================
           VALIDASI DATABASE
           ============================================= */

        console.log(
            "TARSUS DATABASE:",
            {
                KA:
                    TARSUS_MASTER_KA.length,

                TARIF:
                    TARSUS_MASTER_TARIF.length,

                STASIUN:
                    TARSUS_MASTER_STASIUN.length
            }
        );


        if (
            TARSUS_MASTER_KA.length === 0
        ) {

            throw new Error(
                "MASTER_KA kosong atau header tidak sesuai."
            );

        }


        if (
            TARSUS_MASTER_TARIF.length === 0
        ) {

            throw new Error(
                "MASTER_TARIF kosong atau header tidak sesuai."
            );

        }


        if (
            TARSUS_MASTER_STASIUN.length === 0
        ) {

            throw new Error(
                "MASTER_STASIUN kosong atau header tidak sesuai."
            );

        }


        /* =============================================
           DATABASE READY
           ============================================= */

        TARSUS_DATABASE_READY =
            true;


        TARSUS_DATABASE_LOADING =
            false;


        console.log(
            "TARSUS: database siap digunakan."
        );


        tarsusSetStatus(
            "Database siap digunakan.",
            "success"
        );


        if (splashStatus) {

            splashStatus.textContent =
                "Database siap digunakan";

        }


        /* =============================================
           INFO CONSOLE
           ============================================= */

        console.log(
            "TARSUS MASTER_KA:",
            TARSUS_MASTER_KA
        );


        console.log(
            "TARSUS MASTER_TARIF:",
            TARSUS_MASTER_TARIF
        );


        console.log(
            "TARSUS MASTER_STASIUN:",
            TARSUS_MASTER_STASIUN
        );


    } catch (error) {

        TARSUS_DATABASE_READY =
            false;


        TARSUS_DATABASE_LOADING =
            false;


        console.error(
            "TARSUS DATABASE ERROR:",
            error
        );


        tarsusSetStatus(
            "Gagal memuat database. Periksa Google Sheet dan koneksi.",
            "error"
        );


        if (splashStatus) {

            splashStatus.textContent =
                "Gagal memuat database";

        }

    }

}


/* =====================================================
   INITIALIZATION
   ===================================================== */

function tarsusInit() {

    console.log(
        "TARSUS DATA ENGINE: initialization..."
    );


    /* =============================================
       PASTIKAN CONTAINER HASIL ADA
       ============================================= */

    tarsusEnsureResults();


    /* =============================================
       INJECT STYLE
       ============================================= */

    tarsusInjectStyles();


    /* =============================================
       BIND EVENT
       ============================================= */

    tarsusBindEvents();


    /* =============================================
       LOAD DATABASE
       ============================================= */

    tarsusLoadDatabase();

}


/* =====================================================
   START
   ===================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        tarsusInit
    );

} else {

    tarsusInit();

}


/* =====================================================
   SELESAI DATA ENGINE
   ===================================================== */

})();
/* =====================================================
   TARSUS RESULT DISPLAY PATCH
   ===================================================== */

(function () {

    function showTarsusResultsPatch() {

        const results =
            document.getElementById("results");

        if (!results) {
            console.error("TARSUS: #results tidak ditemukan.");
            return;
        }

        results.style.display = "block";
        results.style.visibility = "visible";
        results.style.opacity = "1";
        results.style.height = "auto";
        results.style.maxHeight = "none";
        results.style.overflow = "visible";

    }


    function renderTarsusResultsPatch() {

        const results =
            document.getElementById("results");

        if (!results) {
            return;
        }


        if (
            typeof TARSUS_MASTER_TARIF === "undefined" ||
            typeof TARSUS_MASTER_KA === "undefined"
        ) {
            return;
        }


        const asal =
            document.getElementById("asal")?.value?.trim();

        const tujuan =
            document.getElementById("tujuan")?.value?.trim();


        if (!asal || !tujuan) {
            return;
        }


        if (
            typeof tarsusSearchTarif !== "function"
        ) {
            return;
        }


        const data =
            tarsusSearchTarif(
                asal,
                tujuan
            );


        if (
            !data ||
            !data.results ||
            data.results.length === 0
        ) {

            results.innerHTML = `
                <div style="
                    margin-top:16px;
                    padding:20px;
                    border-radius:16px;
                    text-align:center;
                    background:rgba(127,127,127,.08);
                ">
                    <strong>Tarif tidak ditemukan</strong>
                    <div style="
                        margin-top:6px;
                        font-size:12px;
                        opacity:.65;
                    ">
                        Tidak ada tarif khusus untuk rute tersebut.
                    </div>
                </div>
            `;

            showTarsusResultsPatch();

            return;
        }


        const groups =
            tarsusGroupResults(
                data.results
            );


        let html = "";


        groups.forEach(group => {

            const first =
                group.items[0];


            html += `
                <div style="
                    display:block;
                    margin:14px 0;
                    padding:18px;
                    border-radius:18px;
                    background:var(--card,#ffffff);
                    border:1px solid var(--border,rgba(0,0,0,.08));
                    box-shadow:0 6px 20px rgba(0,0,0,.08);
                ">

                    <div style="
                        font-size:18px;
                        font-weight:800;
                        margin-bottom:5px;
                    ">
                        ${tarsusEscapeHTML(
                            group.nama_ka
                        )}
                    </div>


                    <div style="
                        font-size:12px;
                        opacity:.65;
                        margin-bottom:14px;
                    ">
                        ${tarsusEscapeHTML(
                            first.asal
                        )}
                        →
                        ${tarsusEscapeHTML(
                            first.tujuan
                        )}
                    </div>


                    <div style="
                        padding:14px;
                        border-radius:13px;
                        background:rgba(127,127,127,.08);
                    ">

                        <div style="
                            font-size:11px;
                            opacity:.6;
                            margin-bottom:3px;
                        ">
                            TARIF KHUSUS
                        </div>


                        <div style="
                            font-size:24px;
                            font-weight:900;
                        ">
                            Rp ${tarsusFormatRupiah(
                                first.harga
                            )}
                        </div>


                        <div style="
                            margin-top:3px;
                            font-size:11px;
                            opacity:.6;
                        ">
                            ${tarsusEscapeHTML(
                                first.kelas
                            )}
                        </div>

                    </div>


                    <div style="
                        margin-top:12px;
                    ">

                        ${first.fares.map(fare => `

                            <div style="
                                display:flex;
                                justify-content:space-between;
                                padding:9px 2px;
                                border-bottom:1px solid rgba(127,127,127,.12);
                                font-size:12px;
                            ">

                                <span>
                                    ${tarsusEscapeHTML(
                                        fare.label
                                    )}
                                </span>

                                <strong>
                                    Rp ${tarsusFormatRupiah(
                                        fare.value
                                    )}
                                </strong>

                            </div>

                        `).join("")}

                    </div>


                    ${
                        group.items.length > 1
                        ? `

                            <details style="
                                margin-top:12px;
                            ">

                                <summary style="
                                    cursor:pointer;
                                    font-size:12px;
                                    font-weight:700;
                                ">
                                    Lihat ${group.items.length - 1}
                                    alternatif tarif
                                </summary>


                                <div style="
                                    margin-top:8px;
                                ">

                                    ${
                                        group.items
                                            .slice(1)
                                            .map(item => `

                                                <div style="
                                                    margin-top:8px;
                                                    padding:11px;
                                                    border-radius:12px;
                                                    background:rgba(127,127,127,.06);
                                                ">

                                                    <div style="
                                                        font-size:11px;
                                                        font-weight:700;
                                                    ">
                                                        ${
                                                            tarsusEscapeHTML(
                                                                item.route[0] ||
                                                                item.asal
                                                            )
                                                        }

                                                        →

                                                        ${
                                                            tarsusEscapeHTML(
                                                                item.route[
                                                                    item.route.length - 1
                                                                ] ||
                                                                item.tujuan
                                                            )
                                                        }
                                                    </div>


                                                    <div style="
                                                        margin-top:4px;
                                                        font-size:14px;
                                                        font-weight:900;
                                                    ">
                                                        Rp ${
                                                            tarsusFormatRupiah(
                                                                item.harga
                                                            )
                                                        }
                                                    </div>


                                                    <div style="
                                                        margin-top:2px;
                                                        font-size:10px;
                                                        opacity:.6;
                                                    ">
                                                        ${
                                                            tarsusEscapeHTML(
                                                                item.kelas
                                                            )
                                                        }
                                                    </div>

                                                </div>

                                            `)
                                            .join("")
                                    }

                                </div>

                            </details>

                        `
                        : ""
                    }

                </div>
            `;

        });


        results.innerHTML = `

            <div style="
                margin-bottom:10px;
                padding:0 4px;
            ">

                <div style="
                    font-size:17px;
                    font-weight:800;
                ">
                    Hasil Pencarian
                </div>

                <div style="
                    margin-top:3px;
                    font-size:12px;
                    opacity:.6;
                ">
                    ${groups.length} KA dengan tarif khusus
                </div>

            </div>


            ${html}

        `;


        showTarsusResultsPatch();


        setTimeout(() => {

            results.scrollIntoView({
                behavior:"smooth",
                block:"start"
            });

        }, 100);

    }


    /* =============================================
       PASANG KE TOMBOL CARI
       ============================================= */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const searchButton =
                document.getElementById(
                    "searchBtn"
                );


            if (!searchButton) {
                return;
            }


            searchButton.addEventListener(
                "click",
                function () {

                    setTimeout(
                        renderTarsusResultsPatch,
                        300
                    );

                }
            );

        }
    );


})();
