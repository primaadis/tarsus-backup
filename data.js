/* =========================================================
   TARSUS FINDER
   DATA ENGINE
   ---------------------------------------------------------
   DATABASE:
   1. MASTER_KA
   2. MASTER_TARIF
   3. MASTER_STASIUN

   GOOGLE SHEET:
   1a4Ln_wASazV35F2M3MKZcJHEmiAV8G-0WmkMmU4Csls
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
   DOM
========================================================= */

const asalInput =
    document.getElementById("asal");

const tujuanInput =
    document.getElementById("tujuan");

const asalSuggestions =
    document.getElementById(
        "asal-suggestions"
    );

const tujuanSuggestions =
    document.getElementById(
        "tujuan-suggestions"
    );

const searchBtn =
    document.getElementById(
        "searchBtn"
    );

const swapBtn =
    document.getElementById(
        "swapBtn"
    );

const statusEl =
    document.getElementById(
        "status"
    );

const resultsEl =
    document.getElementById(
        "results"
    );


/* =========================================================
   DATA
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


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];

        const next =
            text[i + 1];


        if (
            char === '"' &&
            insideQuotes &&
            next === '"'
        ) {

            cell += '"';

            i++;

            continue;

        }


        if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

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
            (
                char === "\n" ||
                char === "\r"
            ) &&
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
                    item =>
                        clean(item) !== ""
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
            item =>
                clean(item) !== ""
        )
    ) {

        rows.push(row);

    }


    return rows;

}


/* =========================================================
   GOOGLE SHEET LOADER
========================================================= */

async function loadSheet(
    sheetName
) {

    const url =
        "https://docs.google.com/spreadsheets/d/" +
        SHEET_ID +
        "/gviz/tq?tqx=out:csv&sheet=" +
        encodeURIComponent(sheetName);


    const response =
        await fetch(
            url,
            {
                cache: "no-store"
            }
        );


    if (
        !response.ok
    ) {

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

function rowsToObjects(
    rows
) {

    if (
        !rows ||
        rows.length === 0
    ) {

        return [];

    }


    const headers =
        rows[0].map(
            header =>
                clean(header)
        );


    return rows
        .slice(1)
        .map(
            row => {

                const obj = {};


                headers.forEach(
                    (
                        header,
                        index
                    ) => {

                        obj[header] =
                            clean(
                                row[index] ??
                                ""
                            );

                    }
                );


                return obj;

            }
        );

}


/* =========================================================
   MASTER KA
========================================================= */

function parseMasterKA(
    csv
) {

    const rows =
        parseCSV(csv);

    const objects =
        rowsToObjects(rows);


    return objects
        .filter(
            row =>
                clean(
                    row.ID_KA
                ) !== ""
        )
        .map(
            row => {

                return {

                    idKA:
                        clean(
                            row.ID_KA
                        ),

                    namaKA:
                        clean(
                            row.NAMA_KA
                        ),

                    aktif:
                        clean(
                            row.AKTIF
                        )

                };

            }
        );

}


/* =========================================================
   MASTER STASIUN
========================================================= */

function parseMasterStasiun(
    csv
) {

    const rows =
        parseCSV(csv);

    const objects =
        rowsToObjects(rows);


    return objects
        .filter(
            row => {

                return (

                    clean(
                        row.ID_STASIUN
                    ) !== "" &&

                    clean(
                        row.NAMA_STASIUN
                    ) !== ""

                );

            }
        )
        .map(
            row => {

                return {

                    idStasiun:
                        clean(
                            row.ID_STASIUN
                        ),

                    namaStasiun:
                        clean(
                            row.NAMA_STASIUN
                        ),

                    daop:
                        clean(
                            row.DAOP_DIVRE
                        ),

                    provinsi:
                        clean(
                            row.PROVINSI
                        ),

                    aktif:
                        clean(
                            row.AKTIF
                        )

                };

            }
        );

}


/* =========================================================
   MASTER TARIF
========================================================= */

function parseMasterTarif(
    csv
) {

    const rows =
        parseCSV(csv);

    const objects =
        rowsToObjects(rows);


    return objects
        .filter(
            row => {

                return (

                    clean(
                        row.ID_TARIF
                    ) !== "" &&

                    clean(
                        row.ID_KA
                    ) !== ""

                );

            }
        )
        .map(
            row => {

                const stations = [];


                for (
                    let i = 1;
                    i <= 15;
                    i++
                ) {

                    const station =
                        clean(
                            row[
                                "STASIUN_" +
                                i
                            ]
                        );


                    if (
                        station !== ""
                    ) {

                        stations.push(
                            station
                        );

                    }

                }


                return {

                    idTarif:
                        clean(
                            row.ID_TARIF
                        ),

                    idKA:
                        clean(
                            row.ID_KA
                        ),

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
                        parseFare(
                            row.EKS
                        ),

                    bis:
                        parseFare(
                            row.BIS
                        ),

                    eko:
                        parseFare(
                            row.EKO
                        ),

                    status:
                        clean(
                            row.STATUS
                        )

                };

            }
        );

}


/* =========================================================
   FARE PARSER
========================================================= */

function parseFare(
    value
) {

    const raw =
        clean(value);


    if (
        raw === "" ||
        raw === "-" ||
        raw === "—" ||
        raw.toLowerCase() ===
            "null"
    ) {

        return null;

    }


    const numberText =
        raw
            .replace(
                /rp/gi,
                ""
            )
            .replace(
                /\s/g,
                ""
            )
            .replace(
                /\./g,
                ""
            )
            .replace(
                /,/g,
                ""
            );


    const number =
        Number(
            numberText
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return null;

    }


    return number;

}


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(
    value
) {

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

function getLowestFare(
    tarif
) {

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


    return Math.min(
        ...fares
    );

}


/* =========================================================
   NAMA KA
========================================================= */

function getNamaKA(
    idKA
) {

    const ka =
        MASTER_KA.find(
            item =>
                normalize(
                    item.idKA
                ) ===
                normalize(
                    idKA
                )
        );


    if (!ka) {

        return idKA;

    }


    return (
        clean(
            ka.namaKA
        ) ||
        idKA
    );

}


/* =========================================================
   CHECK KA
========================================================= */

function isKAActive(
    idKA
) {

    const ka =
        MASTER_KA.find(
            item =>
                normalize(
                    item.idKA
                ) ===
                normalize(
                    idKA
                )
        );


    if (!ka) {

        return true;

    }


    const status =
        normalize(
            ka.aktif
        );


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
   CHECK TARIF
========================================================= */

function isTarifActive(
    tarif
) {

    const status =
        normalize(
            tarif.status
        );


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
   REFERENCE ROUTE
========================================================= */

function getReferenceRoute(
    tarif
) {

    if (
        !tarif.stations ||
        tarif.stations.length < 2
    ) {

        return [];

    }


    return [

        tarif.stations[0],

        tarif.stations[
            tarif.stations.length - 1
        ]

    ];

}


/* =========================================================
   FULL RELATION
========================================================= */

function relationHTML(
    stations
) {

    if (
        !stations ||
        stations.length === 0
    ) {

        return "—";

    }


    return stations
        .map(
            station =>
                escapeHTML(
                    station
                )
        )
        .join(
            '<span class="relation-arrow">→</span>'
        );

}


/* =========================================================
   ROUTE MATCH
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
                normalize(
                    station
                )
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
       Selain PP mengikuti
       urutan STASIUN_1 → STASIUN_15
    */

    return (
        asalIndex <
        tujuanIndex
    );

}


/* =========================================================
   SAFE ID
========================================================= */

function makeSafeId(
    value
) {

    return String(value)
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
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
                        ? "—"
                        : formatRupiah(value)
                }

            </span>

        </div>

    `;

}


/* =========================================================
   TARIF DETAIL
========================================================= */

function createTarifDetail(
    tarif,
    isMain
) {

    const reference =
        getReferenceRoute(
            tarif
        );


    const referenceHTML =
        relationHTML(
            reference
        );


    const title =
        isMain
            ? "TARIF UTAMA"
            : "TARIF ALTERNATIF";


    let direction =
        clean(
            tarif.arah
        );


    if (
        direction === "PP"
    ) {

        direction =
            "PULANG • PERGI";

    } else if (
        direction === ""
    ) {

        direction =
            "SEARAH";

    }


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

                    <span
                        class="tarsus-tariff-dot"
                    ></span>

                    <span>
                        ${title}
                    </span>

                </div>


                <span class="tarsus-direction">

                    ${escapeHTML(
                        direction
                    )}

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
   GROUP CARD
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
        makeSafeId(
            namaKA
        ) +
        "-" +
        index;


    const mainTarif =
        group[0];


    const alternatives =
        group.slice(1);


    const lowest =
        getLowestFare(
            mainTarif
        );


    const lowestHTML =
        Number.isFinite(
            lowest
        )
            ? formatRupiah(
                lowest
            )
            : "Tidak tersedia";


    let alternativesHTML =
        "";


    if (
        alternatives.length > 0
    ) {

        const details =
            alternatives
                .map(
                    tarif =>
                        createTarifDetail(
                            tarif,
                            false
                        )
                )
                .join("");


        alternativesHTML = `

            <details
                class="tarsus-alternatives"
            >

                <summary>

                    <span
                        class="tarsus-alternative-text"
                    >

                        <span
                            class="tarsus-alternative-icon"
                        >
                            +
                        </span>

                        <span>

                            Lihat
                            ${alternatives.length}
                            tarif alternatif

                        </span>

                    </span>


                    <span
                        class="tarsus-alternative-chevron"
                    >
                        ›

                    </span>

                </summary>


                <div
                    class="tarsus-alternative-content"
                >

                    ${details}

                </div>

            </details>

        `;

    }


    return `

        <article
            class="
                tarsus-result-card
                grouped-result-card
            "
            id="${escapeAttr(
                cardId
            )}"
        >


            <div class="tarsus-result-top">


                <div
                    class="tarsus-train-info"
                >

                    <div
                        class="tarsus-train-icon"
                    >
                        🚆
                    </div>


                    <div>

                        <div
                            class="tarsus-train-caption"
                        >
                            KERETA API
                        </div>


                        <h3
                            class="tarsus-train-name"
                        >

                            ${escapeHTML(
                                namaKA
                            )}

                        </h3>

                    </div>

                </div>


                <div
                    class="tarsus-lowest-fare"
                >

                    <span>
                        MULAI DARI
                    </span>

                    <strong>
                        ${lowestHTML}
                    </strong>

                </div>


            </div>


            <div class="tarsus-journey">


                <div
                    class="
                        tarsus-journey-station
                    "
                >

                    <span
                        class="tarsus-journey-label"
                    >
                        ASAL
                    </span>


                    <strong>
                        ${escapeHTML(
                            asal
                        )}
                    </strong>

                </div>


                <div
                    class="tarsus-journey-line"
                >

                    <span
                        class="tarsus-train-dot"
                    ></span>

                    <span
                        class="tarsus-journey-arrow"
                    >
                        →
                    </span>

                    <span
                        class="tarsus-train-dot"
                    ></span>

                </div>


                <div
                    class="
                        tarsus-journey-station
                        right
                    "
                >

                    <span
                        class="tarsus-journey-label"
                    >
                        TUJUAN
                    </span>


                    <strong>
                        ${escapeHTML(
                            tujuan
                        )}
                    </strong>

                </div>


            </div>


            ${createTarifDetail(
                mainTarif,
                true
            )}


            ${alternativesHTML}


        </article>

    `;

}


/* =========================================================
   SEARCH
========================================================= */

function searchTarif(
    asal,
    tujuan
) {

    const asalNorm =
        normalize(
            asal
        );

    const tujuanNorm =
        normalize(
            tujuan
        );


    if (
        !asalNorm ||
        !tujuanNorm
    ) {

        return [];

    }


    if (
        asalNorm ===
        tujuanNorm
    ) {

        return [];

    }


    const matches =
        MASTER_TARIF.filter(
            tarif => {

                if (
                    !isTarifActive(
                        tarif
                    )
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
                normalize(
                    namaKA
                );


            if (
                !grouped.has(
                    key
                )
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
                .push(
                    tarif
                );

        }
    );


    /*
       Tarif termurah menjadi utama.
    */

    grouped.forEach(
        group => {

            group.tarif.sort(
                (
                    a,
                    b
                ) => {

                    const fareA =
                        getLowestFare(
                            a
                        );

                    const fareB =
                        getLowestFare(
                            b
                        );


                    if (
                        fareA !==
                        fareB
                    ) {

                        return (
                            fareA -
                            fareB
                        );

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


    /*
       KA termurah tampil dahulu.
    */

    groups.sort(
        (
            a,
            b
        ) => {

            return (
                getLowestFare(
                    a.tarif[0]
                ) -
                getLowestFare(
                    b.tarif[0]
                )
            );

        }
    );


    return groups;

}


/* =========================================================
   EMPTY STATE
========================================================= */

function renderEmpty(
    asal,
    tujuan
) {

    resultsEl.innerHTML = `

        <div
            class="tarsus-empty-state"
        >

            <div
                class="tarsus-empty-icon"
            >
                ×
            </div>


            <h3>
                Tarif khusus tidak ditemukan
            </h3>


            <p>

                Belum ditemukan tarif khusus
                untuk perjalanan

                <strong>
                    ${escapeHTML(
                        asal
                    )}
                </strong>

                →

                <strong>
                    ${escapeHTML(
                        tujuan
                    )}
                </strong>.

            </p>


            <div
                class="tarsus-empty-hint"
            >

                Periksa kembali nama stasiun
                atau coba rute lainnya.

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

        renderEmpty(
            asal,
            tujuan
        );

        return;

    }


    let html = `

        <div
            class="tarsus-results-heading"
        >

            <div>

                <span
                    class="tarsus-results-eyebrow"
                >
                    HASIL PENCARIAN
                </span>


                <h2>
                    Tarif Khusus
                </h2>

            </div>


            <div
                class="tarsus-results-count"
            >

                <strong>
                    ${groups.length}
                </strong>

                <span>
                    KA
                </span>

            </div>

        </div>


        <div
            class="tarsus-result-list"
        >

    `;


    groups.forEach(
        (
            group,
            index
        ) => {

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
       Delay animasi setiap card.
    */

    resultsEl
        .querySelectorAll(
            ".tarsus-result-card"
        )
        .forEach(
            (
                card,
                index
            ) => {

                card.style.setProperty(
                    "--result-delay",
                    (
                        Math.min(
                            index * 45,
                            300
                        ) +
                        "ms"
                    )
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
        normalize(
            input.value
        );


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

                    const active =
                        normalize(
                            station.aktif
                        );


                    if (
                        active ===
                        "tidak"
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
            .slice(
                0,
                8
            );


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

                        <span
                            class="suggestion-dot"
                        ></span>

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
   SEARCH
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
            "Silakan isi stasiun asal dan tujuan.";

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


    window.setTimeout(
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
        80
    );

}


/* =========================================================
   SWAP
========================================================= */

function swapStations() {

    const asal =
        asalInput.value;

    asalInput.value =
        tujuanInput.value;

    tujuanInput.value =
        asal;


    closeSuggestions();


    if (
        clean(
            asalInput.value
        ) &&
        clean(
            tujuanInput.value
        )
    ) {

        performSearch();

    }

}


/* =========================================================
   ENTER
========================================================= */

function handleEnter(
    event
) {

    if (
        event.key ===
        "Enter"
    ) {

        event.preventDefault();

        performSearch();

    }

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

asalInput.addEventListener(
    "input",
    () => {

        showSuggestions(
            asalInput,
            asalSuggestions
        );

    }
);


tujuanInput.addEventListener(
    "input",
    () => {

        showSuggestions(
            tujuanInput,
            tujuanSuggestions
        );

    }
);


asalInput.addEventListener(
    "keydown",
    handleEnter
);


tujuanInput.addEventListener(
    "keydown",
    handleEnter
);


searchBtn.addEventListener(
    "click",
    performSearch
);


swapBtn.addEventListener(
    "click",
    swapStations
);


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
   LOAD DATABASE
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
            "TARSUS DATABASE READY"
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


    } catch (
        error
    ) {

        console.error(
            "TARSUS DATABASE ERROR:",
            error
        );


        statusEl.textContent =
            "Database gagal dimuat. Periksa koneksi atau Google Sheet.";


        resultsEl.innerHTML = `

            <div
                class="tarsus-empty-state"
            >

                <div
                    class="tarsus-empty-icon"
                >
                    !
                </div>


                <h3>
                    Database tidak dapat dimuat
                </h3>


                <p>

                    Pastikan Google Sheet dapat
                    diakses dan koneksi internet
                    tersedia.

                </p>

            </div>

        `;

    }

}


/* =========================================================
   START
========================================================= */

loadData();
