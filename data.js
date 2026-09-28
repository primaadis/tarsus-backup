/* =========================================================
   TARSUS FINDER
   DATA ENGINE
   ---------------------------------------------------------
   DATABASE:
   1. MASTER_KA
   2. MASTER_TARIF
   3. MASTER_STASIUN

   FITUR:
   - Pencarian tarif khusus berdasarkan stasiun
   - MASTER_TARIF = 1 baris = 1 relasi tarif
   - Nama KA diambil dari MASTER_KA
   - KA yang sama digabung menjadi 1 hasil
   - Tarif termurah menjadi TARIF UTAMA
   - Tarif lainnya menjadi TARIF KHUSUS ALTERNATIF
   - Alternatif dapat dibuka/tutup
   - Acuan tarif = stasiun pertama → stasiun terakhir
   ========================================================= */


/* =========================================================
   GOOGLE SHEET
========================================================= */

const SHEET_ID =
    "1a4Ln_wASazV35F2M3MKZcJHEmiAV8G-0WmkMmU4Csls";

const SHEETS = {
    ka: "MASTER_KA",
    tarif: "MASTER_TARIF",
    stasiun: "MASTER_STASIUN"
};


/* =========================================================
   ELEMENT
========================================================= */

const asalInput =
    document.getElementById("asal");

const tujuanInput =
    document.getElementById("tujuan");

const asalSuggestions =
    document.getElementById("asal-suggestions");

const tujuanSuggestions =
    document.getElementById("tujuan-suggestions");

const searchBtn =
    document.getElementById("searchBtn");

const swapBtn =
    document.getElementById("swapBtn");

const statusEl =
    document.getElementById("status");

const resultsEl =
    document.getElementById("results");


/* =========================================================
   DATA STORAGE
========================================================= */

let MASTER_KA = [];
let MASTER_TARIF = [];
let MASTER_STASIUN = [];


/* =========================================================
   UTILITY
========================================================= */

function clean(value) {

    return String(value ?? "")
        .replace(/\u00A0/g, " ")
        .trim();

}


function normalize(value) {

    return clean(value)
        .toLowerCase()
        .replace(/\s+/g, " ");

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttr(value) {

    return escapeHTML(value);

}


/* =========================================================
   CSV PARSER
========================================================= */

function parseCSV(text) {

    const rows = [];

    let row = [];
    let cell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];
        const next = text[i + 1];

        if (
            char === '"' &&
            insideQuotes &&
            next === '"'
        ) {

            cell += '"';
            i++;

            continue;

        }

        if (char === '"') {

            insideQuotes = !insideQuotes;

            continue;

        }

        if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);
            cell = "";

            continue;

        }

        if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;

            }

            row.push(cell);
            cell = "";

            if (
                row.some(
                    item => clean(item) !== ""
                )
            ) {

                rows.push(row);

            }

            row = [];

            continue;

        }

        cell += char;

    }

    row.push(cell);

    if (
        row.some(
            item => clean(item) !== ""
        )
    ) {

        rows.push(row);

    }

    return rows;

}


/* =========================================================
   GOOGLE SHEET LOADER
========================================================= */

async function loadSheet(sheetName) {

    const url =
        "https://docs.google.com/spreadsheets/d/" +
        SHEET_ID +
        "/gviz/tq?tqx=out:csv&sheet=" +
        encodeURIComponent(sheetName);

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            "Gagal mengambil sheet: " +
            sheetName
        );

    }

    return await response.text();

}


/* =========================================================
   CSV → OBJECT
========================================================= */

function rowsToObjects(rows) {

    if (
        !rows ||
        rows.length === 0
    ) {

        return [];

    }

    const headers =
        rows[0].map(
            header => clean(header)
        );

    return rows
        .slice(1)
        .map(row => {

            const obj = {};

            headers.forEach(
                (header, index) => {

                    obj[header] =
                        clean(
                            row[index] ?? ""
                        );

                }
            );

            return obj;

        });

}


/* =========================================================
   MASTER KA
========================================================= */

function parseMasterKA(csv) {

    const rows =
        parseCSV(csv);

    const objects =
        rowsToObjects(rows);

    return objects
        .filter(row => {

            return (
                clean(row.ID_KA) !== ""
            );

        })
        .map(row => {

            return {

                idKA:
                    clean(row.ID_KA),

                namaKA:
                    clean(row.NAMA_KA),

                aktif:
                    clean(row.AKTIF)

            };

        });

}


/* =========================================================
   MASTER STASIUN
========================================================= */

function parseMasterStasiun(csv) {

    const rows =
        parseCSV(csv);

    const objects =
        rowsToObjects(rows);

    return objects
        .filter(row => {

            return (
                clean(row.ID_STASIUN) !== "" &&
                clean(row.NAMA_STASIUN) !== ""
            );

        })
        .map(row => {

            return {

                idStasiun:
                    clean(row.ID_STASIUN),

                namaStasiun:
                    clean(row.NAMA_STASIUN),

                daop:
                    clean(row.DAOP_DIVRE),

                provinsi:
                    clean(row.PROVINSI),

                aktif:
                    clean(row.AKTIF)

            };

        });

}


/* =========================================================
   MASTER TARIF
========================================================= */

function parseMasterTarif(csv) {

    const rows =
        parseCSV(csv);

    const objects =
        rowsToObjects(rows);

    return objects
        .filter(row => {

            return (
                clean(row.ID_TARIF) !== "" &&
                clean(row.ID_KA) !== ""
            );

        })
        .map(row => {

            const stations = [];

            for (
                let i = 1;
                i <= 15;
                i++
            ) {

                const station =
                    clean(
                        row["STASIUN_" + i]
                    );

                if (
                    station !== ""
                ) {

                    stations.push(station);

                }

            }

            return {

                idTarif:
                    clean(row.ID_TARIF),

                idKA:
                    clean(row.ID_KA),

                arah:
                    clean(
                        row.ARAH
                    ).toUpperCase(),

                polaRelasi:
                    clean(
                        row.POLA_RELASI
                    ),

                stations,

                eks:
                    parseFare(row.EKS),

                bis:
                    parseFare(row.BIS),

                eko:
                    parseFare(row.EKO),

                status:
                    clean(row.STATUS)

            };

        });

}


/* =========================================================
   PARSE FARE
========================================================= */

function parseFare(value) {

    const raw =
        clean(value);

    if (
        raw === "" ||
        raw === "-" ||
        raw === "—" ||
        raw.toLowerCase() === "null"
    ) {

        return null;

    }

    const numberText =
        raw
            .replace(/rp/gi, "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(/,/g, "");

    const number =
        Number(numberText);

    if (
        !Number.isFinite(number)
    ) {

        return null;

    }

    return number;

}


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(value) {

    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(value)
    ) {

        return "—";

    }

    return (
        "Rp " +
        new Intl.NumberFormat(
            "id-ID"
        ).format(value)
    );

}


/* =========================================================
   LOWEST FARE
========================================================= */

function getLowestFare(tarif) {

    const fares = [

        tarif.eks,
        tarif.bis,
        tarif.eko

    ].filter(
        value =>
            value !== null &&
            Number.isFinite(value)
    );

    if (
        fares.length === 0
    ) {

        return Infinity;

    }

    return Math.min(...fares);

}


/* =========================================================
   REFERENCE ROUTE
========================================================= */

function getReferenceRoute(tarif) {

    const stations =
        tarif.stations;

    if (
        !stations ||
        stations.length < 2
    ) {

        return [];

    }

    return [

        stations[0],

        stations[
            stations.length - 1
        ]

    ];

}


/* =========================================================
   RELATION HTML
========================================================= */

function relationHTML(stations) {

    if (
        !stations ||
        stations.length === 0
    ) {

        return "—";

    }

    return stations
        .map(
            station =>
                escapeHTML(station)
        )
        .join(
            '<span class="relation-arrow">→</span>'
        );

}


/* =========================================================
   ROUTE MATCHING
========================================================= */

function routeIsCovered(
    tarif,
    asal,
    tujuan
) {

    const stations =
        tarif.stations;

    if (
        !stations ||
        stations.length < 2
    ) {

        return false;

    }

    const asalNorm =
        normalize(asal);

    const tujuanNorm =
        normalize(tujuan);

    const stationNorms =
        stations.map(
            station =>
                normalize(station)
        );

    const asalIndex =
        stationNorms.indexOf(
            asalNorm
        );

    const tujuanIndex =
        stationNorms.indexOf(
            tujuanNorm
        );

    if (
        asalIndex === -1 ||
        tujuanIndex === -1
    ) {

        return false;

    }

    /*
       PP = dua arah
    */

    if (
        tarif.arah === "PP"
    ) {

        return true;

    }

    /*
       Arah berangkat:
       mengikuti urutan STASIUN_1 → STASIUN_15
    */

    return (
        asalIndex <
        tujuanIndex
    );

}


/* =========================================================
   GET NAMA KA
========================================================= */

function getNamaKA(idKA) {

    const ka =
        MASTER_KA.find(
            item =>
                normalize(item.idKA) ===
                normalize(idKA)
        );

    if (!ka) {

        return idKA;

    }

    return (
        clean(ka.namaKA) ||
        idKA
    );

}


/* =========================================================
   CHECK KA ACTIVE
========================================================= */

function isKAActive(idKA) {

    const ka =
        MASTER_KA.find(
            item =>
                normalize(item.idKA) ===
                normalize(idKA)
        );

    if (!ka) {

        return true;

    }

    const status =
        normalize(ka.aktif);

    if (
        status === ""
    ) {

        return true;

    }

    return (

        status === "ya" ||
        status === "aktif" ||
        status === "yes" ||
        status === "1"

    );

}


/* =========================================================
   CHECK TARIF ACTIVE
========================================================= */

function isTarifActive(tarif) {

    const status =
        normalize(tarif.status);

    if (
        status === ""
    ) {

        return true;

    }

    return (

        status === "aktif" ||
        status === "ya" ||
        status === "active" ||
        status === "yes" ||
        status === "1"

    );

}


/* =========================================================
   FARE ITEM
========================================================= */

function fareItem(
    label,
    value
) {

    const unavailable =
        value === null ||
        value === undefined;

    return `

        <div class="tarsus-fare-item">

            <span class="tarsus-fare-label">
                ${escapeHTML(label)}
            </span>

            <span class="
                tarsus-fare-price
                ${
                    unavailable
                        ? "is-unavailable"
                        : ""
                }
            ">

                ${
                    unavailable
                        ? "Tidak tersedia"
                        : formatRupiah(value)
                }

            </span>

        </div>

    `;

}


/* =========================================================
   SAFE ID
========================================================= */

function makeSafeId(value) {

    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

}


/* =========================================================
   CREATE TARIF DETAIL
   ---------------------------------------------------------
   BAGIAN INI DISESUAIKAN DENGAN UI INDEX.HTML BARU
========================================================= */

function createTarifDetail(
    tarif,
    index,
    isMain
) {

    const reference =
        getReferenceRoute(tarif);

    const referenceHTML =
        relationHTML(reference);

    const title =
        isMain
            ? "TARIF UTAMA"
            : "TARIF KHUSUS ALTERNATIF";

    const arahLabel =
        tarif.arah === "PP"
            ? "Pulang • Pergi"
            : (
                tarif.arah === "BERANGKAT"
                    ? "Searah"
                    : clean(tarif.arah)
            );

    return `

        <div class="
            tarsus-tariff-detail
            ${
                isMain
                    ? "tarsus-main-tariff"
                    : "tarsus-alternative-tariff"
            }
        ">

            <div class="tarsus-tariff-header">

                <div class="tarsus-tariff-title">

                    <span class="tarsus-tariff-dot"></span>

                    <span>
                        ${title}
                    </span>

                </div>

                <span class="tarsus-direction">
                    ${escapeHTML(arahLabel)}
                </span>

            </div>


            <div class="tarsus-reference">

                <div class="tarsus-reference-label">
                    RELASI TARIF KHUSUS
                </div>

                <div class="tarsus-reference-route">

                    ${referenceHTML}

                </div>

            </div>


            <div class="tarsus-fare-grid">

                ${fareItem(
                    "EKSEKUTIF",
                    tarif.eks
                )}

                ${fareItem(
                    "BISNIS",
                    tarif.bis
                )}

                ${fareItem(
                    "EKONOMI",
                    tarif.eko
                )}

            </div>

        </div>

    `;

}


/* =========================================================
   CREATE GROUPED KA CARD
   ---------------------------------------------------------
   SATU NAMA KA = SATU CARD
========================================================= */

function createKAGroupCard(
    namaKA,
    group,
    asal,
    tujuan,
    index
) {

    const cardId =
        "ka-" +
        makeSafeId(namaKA) +
        "-" +
        index;

    const mainTarif =
        group[0];

    const alternativeTarif =
        group.slice(1);

    const lowestFare =
        getLowestFare(
            mainTarif
        );

    const lowestFareHTML =
        Number.isFinite(lowestFare)
            ? formatRupiah(lowestFare)
            : "Tarif tidak tersedia";

    const actualJourney = `

        <div class="tarsus-journey">

            <div class="tarsus-journey-station">

                <span class="tarsus-journey-label">
                    ASAL
                </span>

                <strong>
                    ${escapeHTML(asal)}
                </strong>

            </div>


            <div class="tarsus-journey-line">

                <span class="tarsus-train-dot"></span>

                <span class="tarsus-journey-arrow">
                    →
                </span>

                <span class="tarsus-train-dot"></span>

            </div>


            <div class="tarsus-journey-station right">

                <span class="tarsus-journey-label">
                    TUJUAN
                </span>

                <strong>
                    ${escapeHTML(tujuan)}
                </strong>

            </div>

        </div>

    `;


    let alternativeHTML = "";


    if (
        alternativeTarif.length > 0
    ) {

        const alternativeDetails =
            alternativeTarif
                .map(
                    (tarif, i) =>
                        createTarifDetail(
                            tarif,
                            i + 1,
                            false
                        )
                )
                .join("");


        alternativeHTML = `

            <details
                class="tarsus-alternatives"
            >

                <summary>

                    <span class="tarsus-alternative-text">

                        <span class="tarsus-alternative-icon">
                            +
                        </span>

                        <span>
                            Lihat
                            ${alternativeTarif.length}
                            tarif alternatif
                        </span>

                    </span>


                    <span class="tarsus-alternative-chevron">
                        ›
                    </span>

                </summary>


                <div class="tarsus-alternative-content">

                    ${alternativeDetails}

                </div>

            </details>

        `;

    }


    const mainHTML =
        createTarifDetail(
            mainTarif,
            0,
            true
        );


    return `

        <article
            class="
                result-card
                tarsus-result-card
                grouped-result-card
            "
            id="${escapeAttr(cardId)}"
        >

            <div class="tarsus-result-top">

                <div class="tarsus-train-info">

                    <div class="tarsus-train-icon">
                        🚆
                    </div>


                    <div>

                        <div class="tarsus-train-caption">
                            KERETA API
                        </div>

                        <h3 class="tarsus-train-name">
                            ${escapeHTML(namaKA)}
                        </h3>

                    </div>

                </div>


                <div class="tarsus-lowest-fare">

                    <span>
                        MULAI DARI
                    </span>

                    <strong>
                        ${lowestFareHTML}
                    </strong>

                </div>

            </div>


            ${actualJourney}


            ${mainHTML}


            ${alternativeHTML}

        </article>

    `;

}


/* =========================================================
   SEARCH TARIF
========================================================= */

function searchTarif(
    asal,
    tujuan
) {

    const asalNorm =
        normalize(asal);

    const tujuanNorm =
        normalize(tujuan);

    if (
        !asalNorm ||
        !tujuanNorm
    ) {

        return [];

    }

    if (
        asalNorm === tujuanNorm
    ) {

        return [];

    }


    const matches =
        MASTER_TARIF.filter(
            tarif => {

                if (
                    !isTarifActive(tarif)
                ) {

                    return false;

                }

                if (
                    !isKAActive(
                        tarif.idKA
                    )
                ) {

                    return false;

                }

                return routeIsCovered(
                    tarif,
                    asal,
                    tujuan
                );

            }
        );


    const grouped =
        new Map();


    matches.forEach(
        tarif => {

            const namaKA =
                getNamaKA(
                    tarif.idKA
                );

            const key =
                normalize(namaKA);


            if (
                !grouped.has(key)
            ) {

                grouped.set(
                    key,
                    {
                        namaKA,
                        tarif: []
                    }
                );

            }


            grouped
                .get(key)
                .tarif
                .push(tarif);

        }
    );


    grouped.forEach(
        group => {

            group.tarif.sort(
                (a, b) => {

                    const fareA =
                        getLowestFare(a);

                    const fareB =
                        getLowestFare(b);


                    if (
                        fareA !== fareB
                    ) {

                        return fareA - fareB;

                    }


                    return (
                        a.stations.length -
                        b.stations.length
                    );

                }
            );

        }
    );


    const groups =
        Array.from(
            grouped.values()
        );


    groups.sort(
        (a, b) => {

            const fareA =
                getLowestFare(
                    a.tarif[0]
                );

            const fareB =
                getLowestFare(
                    b.tarif[0]
                );


            return fareA - fareB;

        }
    );


    return groups;

}


/* =========================================================
   RESULT HEADER
========================================================= */

function createResultsHeading(
    count,
    asal,
    tujuan
) {

    return `

        <div class="tarsus-results-heading">

            <div>

                <span class="tarsus-results-eyebrow">
                    HASIL PENCARIAN
                </span>

                <h2>
                    Tarif Khusus
                </h2>

            </div>


            <div class="tarsus-results-count">

                <strong>
                    ${count}
                </strong>

                <span>
                    KA
                </span>

            </div>

        </div>

    `;

}


/* =========================================================
   EMPTY STATE
========================================================= */

function renderEmptyState(
    asal,
    tujuan
) {

    resultsEl.innerHTML = `

        <div class="
            empty-state
            tarsus-empty-state
        ">

            <div class="tarsus-empty-icon">
                ×
            </div>


            <h3>
                Tarif khusus tidak ditemukan
            </h3>


            <p>

                Belum ditemukan tarif khusus
                untuk perjalanan

                <strong>
                    ${escapeHTML(asal)}
                </strong>

                →

                <strong>
                    ${escapeHTML(tujuan)}
                </strong>.

            </p>


            <div class="tarsus-empty-hint">

                Coba periksa kembali nama stasiun
                atau gunakan rute lainnya.

            </div>

        </div>

    `;

}


/* =========================================================
   RENDER RESULTS
========================================================= */

function renderResults(
    groups,
    asal,
    tujuan
) {

    if (
        !groups ||
        groups.length === 0
    ) {

        renderEmptyState(
            asal,
            tujuan
        );

        return;

    }


    let html =
        createResultsHeading(
            groups.length,
            asal,
            tujuan
        );


    html += `
        <div class="tarsus-result-list">
    `;


    groups.forEach(
        (group, index) => {

            html +=
                createKAGroupCard(
                    group.namaKA,
                    group.tarif,
                    asal,
                    tujuan,
                    index
                );

        }
    );


    html += `
        </div>
    `;


    resultsEl.innerHTML =
        html;


    /*
       Animasi muncul per card.
    */

    const cards =
        resultsEl.querySelectorAll(
            ".tarsus-result-card"
        );


    cards.forEach(
        (card, index) => {

            card.style.setProperty(
                "--result-delay",
                `${Math.min(index * 45, 240)}ms`
            );

        }
    );

}


/* =========================================================
   AUTOCOMPLETE
========================================================= */

function showSuggestions(
    input,
    container
) {

    const keyword =
        normalize(input.value);


    if (
        !keyword
    ) {

        container.innerHTML =
            "";

        return;

    }


    const matches =
        MASTER_STASIUN
            .filter(
                station => {

                    if (
                        normalize(
                            station.aktif
                        ) === "tidak"
                    ) {

                        return false;

                    }

                    return normalize(
                        station.namaStasiun
                    ).includes(
                        keyword
                    );

                }
            )
            .slice(0, 8);


    if (
        matches.length === 0
    ) {

        container.innerHTML =
            "";

        return;

    }


    container.innerHTML =
        matches
            .map(
                station => `

                    <div
                        class="suggestion-item"
                        data-station="${escapeAttr(
                            station.namaStasiun
                        )}"
                    >

                        <span class="suggestion-dot"></span>

                        <span>
                            ${escapeHTML(
                                station.namaStasiun
                            )}
                        </span>

                    </div>

                `
            )
            .join("");


    container
        .querySelectorAll(
            ".suggestion-item"
        )
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    () => {

                        input.value =
                            item.dataset.station;

                        container.innerHTML =
                            "";

                        input.focus();

                    }
                );

            }
        );

}


/* =========================================================
   CLOSE SUGGESTIONS
========================================================= */

function closeSuggestions() {

    if (
        asalSuggestions
    ) {

        asalSuggestions.innerHTML =
            "";

    }

    if (
        tujuanSuggestions
    ) {

        tujuanSuggestions.innerHTML =
            "";

    }

}


/* =========================================================
   SEARCH BUTTON
========================================================= */

function performSearch() {

    const asal =
        clean(
            asalInput.value
        );

    const tujuan =
        clean(
            tujuanInput.value
        );


    closeSuggestions();


    if (
        !asal ||
        !tujuan
    ) {

        statusEl.textContent =
            "Silakan pilih stasiun asal dan tujuan.";

        resultsEl.innerHTML =
            "";

        return;

    }


    if (
        normalize(asal) ===
        normalize(tujuan)
    ) {

        statusEl.textContent =
            "Stasiun asal dan tujuan tidak boleh sama.";

        resultsEl.innerHTML =
            "";

        return;

    }


    statusEl.textContent =
        "Mencari tarif khusus...";


    /*
       Sedikit delay supaya transisi
       tombol/status terasa halus.
    */

    setTimeout(
        () => {

            const groups =
                searchTarif(
                    asal,
                    tujuan
                );


            if (
                groups.length > 0
            ) {

                statusEl.textContent =
                    "Ditemukan " +
                    groups.length +
                    " KA dengan tarif khusus.";

            } else {

                statusEl.textContent =
                    "Tidak ditemukan tarif khusus.";

            }


            renderResults(
                groups,
                asal,
                tujuan
            );

        },
        120
    );

}


/* =========================================================
   SWAP
========================================================= */

function swapStations() {

    const oldAsal =
        asalInput.value;

    asalInput.value =
        tujuanInput.value;

    tujuanInput.value =
        oldAsal;


    closeSuggestions();


    if (
        clean(asalInput.value) &&
        clean(tujuanInput.value)
    ) {

        performSearch();

    }

}


/* =========================================================
   ENTER KEY
========================================================= */

function handleEnter(event) {

    if (
        event.key === "Enter"
    ) {

        event.preventDefault();

        performSearch();

    }

}


/* =========================================================
   DYNAMIC CSS
   ---------------------------------------------------------
   CSS khusus untuk hasil pencarian.
   Dibuat di data.js supaya tidak perlu
   mengacak-acak CSS utama index.html.
========================================================= */

function injectDynamicStyles() {

    /*
       Jangan inject dua kali.
    */

    if (
        document.getElementById(
            "tarsus-dynamic-styles"
        )
    ) {

        return;

    }


    const style =
        document.createElement("style");


    style.id =
        "tarsus-dynamic-styles";


    style.textContent = `

        /* =================================================
           RESULT AREA
        ================================================= */

        .tarsus-results-heading {

            display: flex;

            align-items: flex-end;

            justify-content: space-between;

            gap: 16px;

            margin:
                8px 0 14px;

        }


        .tarsus-results-eyebrow {

            display: block;

            margin-bottom: 3px;

            color:
                var(--gold, #e4c783);

            font-family:
                "DM Sans",
                sans-serif;

            font-size:
                9px;

            font-weight:
                800;

            letter-spacing:
                .14em;

            text-transform:
                uppercase;

        }


        .tarsus-results-heading h2 {

            margin: 0;

            color:
                var(--white, #f4f8f8);

            font-family:
                "Manrope",
                sans-serif;

            font-size:
                clamp(21px, 5vw, 27px);

            line-height:
                1.1;

            font-weight:
                800;

            letter-spacing:
                -.035em;

        }


        .tarsus-results-count {

            display: flex;

            align-items: baseline;

            gap: 4px;

            flex-shrink: 0;

            padding:
                7px 10px;

            border:
                1px solid
                rgba(228,199,131,.18);

            border-radius:
                10px;

            background:
                rgba(228,199,131,.055);

        }


        .tarsus-results-count strong {

            color:
                var(--gold, #e4c783);

            font-family:
                "Manrope",
                sans-serif;

            font-size:
                15px;

            font-weight:
                800;

        }


        .tarsus-results-count span {

            color:
                var(--muted, #8fa9b1);

            font-size:
                9px;

            font-weight:
                700;

            letter-spacing:
                .08em;

        }


        .tarsus-result-list {

            display:
                grid;

            gap:
                13px;

        }


        /* =================================================
           RESULT CARD
        ================================================= */

        .tarsus-result-card {

            position:
                relative;

            overflow:
                hidden;

            padding:
                16px;

            border:
                1px solid
                rgba(213,236,236,.10);

            border-radius:
                18px;

            background:
                linear-gradient(
                    145deg,
                    rgba(31,76,96,.74),
                    rgba(20,52,68,.88)
                );

            box-shadow:
                0 10px 28px
                rgba(0,0,0,.16);

            animation:
                tarsusResultReveal
                .42s
                cubic-bezier(.2,.8,.2,1)
                both;

            animation-delay:
                var(--result-delay, 0ms);

        }


        .tarsus-result-card::before {

            content: "";

            position:
                absolute;

            left: 0;
            top: 0;

            width: 3px;
            height: 100%;

            background:
                linear-gradient(
                    180deg,
                    var(--gold, #e4c783),
                    rgba(228,199,131,.18)
                );

            opacity:
                .9;

        }


        .tarsus-result-card:hover {

            border-color:
                rgba(228,199,131,.20);

            transform:
                translateY(-1px);

        }


        /* =================================================
           TRAIN HEADER
        ================================================= */

        .tarsus-result-top {

            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            gap:
                14px;

            margin-bottom:
                14px;

        }


        .tarsus-train-info {

            display:
                flex;

            align-items:
                center;

            min-width:
                0;

            gap:
                10px;

        }


        .tarsus-train-icon {

            display:
                grid;

            place-items:
                center;

            width:
                39px;

            height:
                39px;

            flex:
                0 0 39px;

            border:
                1px solid
                rgba(228,199,131,.18);

            border-radius:
                12px;

            background:
                rgba(228,199,131,.07);

            font-size:
                18px;

        }


        .tarsus-train-caption {

            margin-bottom:
                2px;

            color:
                var(--muted, #8fa9b1);

            font-size:
                8px;

            font-weight:
                800;

            letter-spacing:
                .14em;

        }


        .tarsus-train-name {

            overflow:
                hidden;

            margin:
                0;

            color:
                var(--white, #f4f8f8);

            font-family:
                "Manrope",
                sans-serif;

            font-size:
                clamp(17px, 4.4vw, 21px);

            line-height:
                1.12;

            font-weight:
                800;

            letter-spacing:
                -.025em;

            text-overflow:
                ellipsis;

            white-space:
                nowrap;

        }


        .tarsus-lowest-fare {

            flex:
                0 0 auto;

            text-align:
                right;

        }


        .tarsus-lowest-fare span {

            display:
                block;

            margin-bottom:
                2px;

            color:
                var(--muted, #8fa9b1);

            font-size:
                7px;

            font-weight:
                800;

            letter-spacing:
                .10em;

        }


        .tarsus-lowest-fare strong {

            color:
                var(--gold, #e4c783);

            font-family:
                "Manrope",
                sans-serif;

            font-size:
                13px;

            font-weight:
                800;

            white-space:
                nowrap;

        }


        /* =================================================
           JOURNEY
        ================================================= */

        .tarsus-journey {

            display:
                grid;

            grid-template-columns:
                minmax(0, 1fr)
                auto
                minmax(0, 1fr);

            align-items:
                center;

            gap:
                9px;

            padding:
                12px 13px;

            margin-bottom:
                13px;

            border:
                1px solid
                rgba(213,236,236,.075);

            border-radius:
                13px;

            background:
                rgba(4,20,29,.18);

        }


        .tarsus-journey-station {

            min-width:
                0;

        }


        .tarsus-journey-station.right {

            text-align:
                right;

        }


        .tarsus-journey-label {

            display:
                block;

            margin-bottom:
                3px;

            color:
                var(--muted, #8fa9b1);

            font-size:
                7px;

            font-weight:
                800;

            letter-spacing:
                .12em;

        }


        .tarsus-journey-station strong {

            display:
                block;

            overflow:
                hidden;

            color:
                var(--white, #f4f8f8);

            font-family:
                "DM Sans",
                sans-serif;

            font-size:
                12px;

            line-height:
                1.25;

            font-weight:
                700;

            text-overflow:
                ellipsis;

            white-space:
                nowrap;

        }


        .tarsus-journey-line {

            display:
                flex;

            align-items:
                center;

            gap:
                4px;

            color:
                var(--gold, #e4c783);

        }


        .tarsus-train-dot {

            width:
                4px;

            height:
                4px;

            flex:
                0 0 4px;

            border-radius:
                50%;

            background:
                var(--gold, #e4c783);

        }


        .tarsus-journey-arrow {

            font-size:
                13px;

            line-height:
                1;

        }


        /* =================================================
           TARIFF DETAIL
        ================================================= */

        .tarsus-tariff-detail {

            overflow:
                hidden;

            border:
                1px solid
                rgba(213,236,236,.08);

            border-radius:
                14px;

            background:
                rgba(255,255,255,.022);

            animation:
                tarsusTariffReveal
                .35s
                cubic-bezier(.2,.8,.2,1)
                both;

        }


        .tarsus-main-tariff {

            border-color:
                rgba(228,199,131,.16);

            background:
                linear-gradient(
                    145deg,
                    rgba(228,199,131,.055),
                    rgba(255,255,255,.018)
                );

        }


        .tarsus-tariff-header {

            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            gap:
                10px;

            padding:
                10px 12px;

            border-bottom:
                1px solid
                rgba(213,236,236,.065);

        }


        .tarsus-tariff-title {

            display:
                flex;

            align-items:
                center;

            gap:
                7px;

            color:
                var(--gold, #e4c783);

            font-size:
                8px;

            font-weight:
                800;

            letter-spacing:
                .12em;

        }


        .tarsus-tariff-dot {

            width:
                6px;

            height:
                6px;

            flex:
                0 0 6px;

            border-radius:
                50%;

            background:
                var(--gold, #e4c783);

            box-shadow:
                0 0 0 3px
                rgba(228,199,131,.08);

        }


        .tarsus-alternative-tariff
        .tarsus-tariff-title {

            color:
                var(--muted, #8fa9b1);

        }


        .tarsus-alternative-tariff
        .tarsus-tariff-dot {

            background:
                #71848d;

            box-shadow:
                none;

        }


        .tarsus-direction {

            color:
                var(--muted, #8fa9b1);

            font-size:
                8px;

            font-weight:
                700;

        }


        /* =================================================
           REFERENCE
        ================================================= */

        .tarsus-reference {

            padding:
                12px;

        }


        .tarsus-reference-label {

            margin-bottom:
                7px;

            color:
                var(--muted, #8fa9b1);

            font-size:
                7px;

            font-weight:
                800;

            letter-spacing:
                .11em;

        }


        .tarsus-reference-route {

            display:
                flex;

            flex-wrap:
                wrap;

            align-items:
                center;

            gap:
                3px 5px;

            color:
                var(--white, #f4f8f8);

            font-family:
                "DM Sans",
                sans-serif;

            font-size:
                11px;

            line-height:
                1.45;

            font-weight:
                600;

        }


        .relation-arrow {

            display:
                inline-block;

            color:
                var(--gold, #e4c783);

            opacity:
                .72;

            margin:
                0 2px;

        }


        /* =================================================
           FARE GRID
        ================================================= */

        .tarsus-fare-grid {

            display:
                grid;

            grid-template-columns:
                repeat(3, 1fr);

            border-top:
                1px solid
                rgba(213,236,236,.065);

        }


        .tarsus-fare-item {

            min-width:
                0;

            padding:
                11px 8px;

            text-align:
                center;

        }


        .tarsus-fare-item
        + .tarsus-fare-item {

            border-left:
                1px solid
                rgba(213,236,236,.065);

        }


        .tarsus-fare-label {

            display:
                block;

            margin-bottom:
                4px;

            color:
                var(--muted, #8fa9b1);

            font-size:
                7px;

            font-weight:
                800;

            letter-spacing:
                .07em;

        }


        .tarsus-fare-price {

            display:
                block;

            color:
                var(--white, #f4f8f8);

            font-family:
                "Manrope",
                sans-serif;

            font-size:
                clamp(10px, 2.7vw, 13px);

            line-height:
                1.2;

            font-weight:
                800;

            white-space:
                nowrap;

        }


        .tarsus-main-tariff
        .tarsus-fare-item:first-child
        .tarsus-fare-price {

            color:
                var(--gold, #e4c783);

        }


        .tarsus-fare-price.is-unavailable {

            color:
                #667b83;

            font-weight:
                600;

        }


        /* =================================================
           ALTERNATIVE
        ================================================= */

        .tarsus-alternatives {

            margin-top:
                10px;

            overflow:
                hidden;

            border:
                1px solid
                rgba(213,236,236,.07);

            border-radius:
                13px;

            background:
                rgba(255,255,255,.015);

        }


        .tarsus-alternatives summary {

            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            gap:
                10px;

            padding:
                11px 12px;

            list-style:
                none;

            cursor:
                pointer;

            color:
                var(--soft, #cbd9dc);

            transition:
                background .2s ease,
                color .2s ease;

        }


        .tarsus-alternatives summary::-webkit-details-marker {

            display:
                none;

        }


        .tarsus-alternatives summary:hover {

            color:
                var(--gold, #e4c783);

            background:
                rgba(228,199,131,.035);

        }


        .tarsus-alternative-text {

            display:
                flex;

            align-items:
                center;

            gap:
                7px;

            min-width:
                0;

            font-size:
                9px;

            font-weight:
                700;

        }


        .tarsus-alternative-icon {

            display:
                grid;

            place-items:
                center;

            width:
                21px;

            height:
                21px;

            flex:
                0 0 21px;

            border:
                1px solid
                rgba(228,199,131,.15);

            border-radius:
                7px;

            color:
                var(--gold, #e4c783);

            font-size:
                14px;

            line-height:
                1;

        }


        .tarsus-alternative-chevron {

            color:
                var(--gold, #e4c783);

            font-size:
                19px;

            line-height:
                1;

            transition:
                transform .25s ease;

        }


        .tarsus-alternatives[open]
        .tarsus-alternative-chevron {

            transform:
                rotate(90deg);

        }


        .tarsus-alternative-content {

            display:
                grid;

            gap:
                9px;

            padding:
                0 9px 9px;

        }


        .tarsus-alternative-content
        .tarsus-tariff-detail {

            border-color:
                rgba(213,236,236,.06);

        }


        /* =================================================
           EMPTY STATE
        ================================================= */

        .tarsus-empty-state {

            padding:
                30px 20px;

            border:
                1px solid
                rgba(213,236,236,.08);

            border-radius:
                18px;

            background:
                rgba(255,255,255,.018);

            text-align:
                center;

        }


        .tarsus-empty-icon {

            display:
                grid;

            place-items:
                center;

            width:
                45px;

            height:
                45px;

            margin:
                0 auto 12px;

            border:
                1px solid
                rgba(228,199,131,.16);

            border-radius:
                14px;

            color:
                var(--gold, #e4c783);

            background:
                rgba(228,199,131,.05);

            font-family:
                "Manrope",
                sans-serif;

            font-size:
                24px;

            font-weight:
                700;

        }


        .tarsus-empty-state h3 {

            margin:
                0 0 7px;

            color:
                var(--white, #f4f8f8);

            font-family:
                "Manrope",
                sans-serif;

            font-size:
                17px;

            font-weight:
                800;

            letter-spacing:
                -.02em;

        }


        .tarsus-empty-state p {

            max-width:
                440px;

            margin:
                0 auto;

            color:
                var(--muted, #8fa9b1);

            font-size:
                11px;

            line-height:
                1.6;

        }


        .tarsus-empty-state p strong {

            color:
                var(--soft, #cbd9dc);

            font-weight:
                700;

        }


        .tarsus-empty-hint {

            margin-top:
                10px;

            color:
                #718890;

            font-size:
                9px;

        }


        /* =================================================
           AUTOCOMPLETE
        ================================================= */

        .suggestion-item {

            display:
                flex !important;

            align-items:
                center;

            gap:
                8px;

        }


        .suggestion-dot {

            width:
                5px;

            height:
                5px;

            flex:
                0 0 5px;

            border-radius:
                50%;

            background:
                var(--gold, #e4c783);

            opacity:
                .7;

        }


        /* =================================================
           ANIMATION
        ================================================= */

        @keyframes tarsusResultReveal {

            from {

                opacity:
                    0;

                transform:
                    translateY(8px);

            }

            to {

                opacity:
                    1;

                transform:
                    translateY(0);

            }

        }


        @keyframes tarsusTariffReveal {

            from {

                opacity:
                    0;

                transform:
                    translateY(5px);

            }

            to {

                opacity:
                    1;

                transform:
                    translateY(0);

            }

        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 680px) {

            .tarsus-result-card {

                padding:
                    13px;

                border-radius:
                    16px;

            }


            .tarsus-result-top {

                align-items:
                    flex-start;

                gap:
                    9px;

            }


            .tarsus-train-icon {

                width:
                    35px;

                height:
                    35px;

                flex-basis:
                    35px;

                border-radius:
                    10px;

                font-size:
                    16px;

            }


            .tarsus-train-name {

                font-size:
                    16px;

            }


            .tarsus-lowest-fare span {

                font-size:
                    6px;

            }


            .tarsus-lowest-fare strong {

                font-size:
                    11px;

            }


            .tarsus-journey {

                padding:
                    10px;

                gap:
                    6px;

            }


            .tarsus-journey-station strong {

                font-size:
                    10px;

            }


            .tarsus-reference {

                padding:
                    10px;

            }


            .tarsus-reference-route {

                font-size:
                    10px;

            }


            .tarsus-fare-item {

                padding:
                    10px 5px;

            }


            .tarsus-fare-label {

                font-size:
                    6px;

            }


            .tarsus-fare-price {

                font-size:
                    9px;

            }


            .tarsus-results-heading {

                margin-top:
                    4px;

            }


            .tarsus-results-heading h2 {

                font-size:
                    20px;

            }

        }


        /* =================================================
           REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {

            .tarsus-result-card,
            .tarsus-tariff-detail {

                animation:
                    none !important;

                transition:
                    none !important;

            }

        }

    `;


    document.head.appendChild(style);

}


/* =========================================================
   LOAD ALL DATA
========================================================= */

async function loadData() {

    try {

        statusEl.textContent =
            "Menghubungkan ke database tarif...";


        const [
            kaCSV,
            tarifCSV,
            stasiunCSV
        ] = await Promise.all([

            loadSheet(
                SHEETS.ka
            ),

            loadSheet(
                SHEETS.tarif
            ),

            loadSheet(
                SHEETS.stasiun
            )

        ]);


        MASTER_KA =
            parseMasterKA(
                kaCSV
            );


        MASTER_TARIF =
            parseMasterTarif(
                tarifCSV
            );


        MASTER_STASIUN =
            parseMasterStasiun(
                stasiunCSV
            );


        statusEl.textContent =
            "Database tarif siap digunakan.";


        console.log(
            "TARSUS FINDER — DATABASE LOADED"
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


    } catch (error) {

        console.error(
            "TARSUS FINDER ERROR:",
            error
        );


        statusEl.textContent =
            "Gagal memuat database. Periksa Google Sheet dan koneksi.";


        resultsEl.innerHTML = `

            <div class="
                empty-state
                tarsus-empty-state
            ">

                <div class="tarsus-empty-icon">
                    !
                </div>


                <h3>
                    Database tidak dapat dimuat
                </h3>


                <p>
                    Silakan periksa koneksi
                    dan konfigurasi Google Sheet.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   EVENT LISTENER
========================================================= */


/*
   Autocomplete asal
*/

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

}


/*
   Autocomplete tujuan
*/

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

}


/*
   Enter asal
*/

if (asalInput) {

    asalInput.addEventListener(
        "keydown",
        handleEnter
    );

}


/*
   Enter tujuan
*/

if (tujuanInput) {

    tujuanInput.addEventListener(
        "keydown",
        handleEnter
    );

}


/*
   Tombol pencarian
*/

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        performSearch
    );

}


/*
   Tombol swap
*/

if (swapBtn) {

    swapBtn.addEventListener(
        "click",
        swapStations
    );

}


/*
   Klik di luar autocomplete
*/

document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                ".input-wrap"
            )
        ) {

            closeSuggestions();

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

injectDynamicStyles();

loadData();
