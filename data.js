/* =========================================================
   TARSUS FINDER
   DATA ENGINE
   ---------------------------------------------------------
   DATABASE:
   1. MASTER_KA
   2. MASTER_TARIF
   3. MASTER_STASIUN

   SINKRON DENGAN:
   index.html TARSUS Finder v1.0.0
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
   DATA STORAGE
   ========================================================= */

let MASTER_KA = [];

let MASTER_TARIF = [];

let MASTER_STASIUN = [];


/* =========================================================
   DOM ELEMENTS
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


const splashStatus =
    document.getElementById("splashStatus");


/* =========================================================
   RESULTS CONTAINER
   ---------------------------------------------------------
   HTML baru belum memiliki #results.
   Jadi kita buat otomatis melalui JavaScript.
   ========================================================= */

let resultsEl =
    document.getElementById("results");


if (!resultsEl) {

    resultsEl =
        document.createElement("div");

    resultsEl.id =
        "results";

    resultsEl.className =
        "tarsus-results";

    const searchPanel =
        document.getElementById("finderSection");

    if (searchPanel) {

        searchPanel.insertAdjacentElement(
            "afterend",
            resultsEl
        );

    }

}


/* =========================================================
   UTILITY
   ========================================================= */

function clean(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .trim();

}


function normalize(value) {

    return clean(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


function escapeHTML(value) {

    return clean(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttr(value) {

    return escapeHTML(value);

}
/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCSV(csv) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < csv.length;
        i++
    ) {

        const char =
            csv[i];

        const next =
            csv[i + 1];


        if (char === '"') {

            if (
                insideQuotes &&
                next === '"'
            ) {

                value += '"';

                i++;

            } else {

                insideQuotes =
                    !insideQuotes;

            }

            continue;

        }


        if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(value);

            value = "";

            continue;

        }


        if (
            (char === "\n" ||
             char === "\r") &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;

            }

            row.push(value);

            value = "";


            if (
                row.some(
                    cell =>
                        clean(cell) !== ""
                )
            ) {

                rows.push(row);

            }

            row = [];

            continue;

        }


        value += char;

    }


    if (
        value !== "" ||
        row.length > 0
    ) {

        row.push(value);

        if (
            row.some(
                cell =>
                    clean(cell) !== ""
            )
        ) {

            rows.push(row);

        }

    }


    return rows;

}


/* =========================================================
   LOAD GOOGLE SHEET
   ========================================================= */

async function loadSheet(sheetName) {

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
        rows.length < 2
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
        .map(row => {

            const object = {};

            headers.forEach(
                (header, index) => {

                    object[header] =
                        clean(
                            row[index] || ""
                        );

                }
            );

            return object;

        });

           }
/* =========================================================
   PARSE MASTER KA
   ========================================================= */

function parseMasterKA(rows) {

    const data =
        rowsToObjects(rows);


    return data.map(
        item => {

            return {

                ID_KA:
                    clean(item.ID_KA),

                NAMA_KA:
                    clean(item.NAMA_KA),

                KELAS:
                    clean(item.KELAS),

                AKTIF:
                    clean(item.AKTIF)

            };

        }
    );

}


/* =========================================================
   PARSE MASTER STASIUN
   ========================================================= */

function parseMasterStasiun(rows) {

    const data =
        rowsToObjects(rows);


    return data.map(
        item => {

            return {

                KODE_STASIUN:
                    clean(
                        item.KODE_STASIUN
                    ),

                NAMA_STASIUN:
                    clean(
                        item.NAMA_STASIUN
                    ),

                AKTIF:
                    clean(item.AKTIF)

            };

        }
    );

}


/* =========================================================
   PARSE MASTER TARIF
   ========================================================= */

function parseMasterTarif(rows) {

    const data =
        rowsToObjects(rows);


    return data.map(
        item => {

            const stationList = [];


            for (
                let i = 1;
                i <= 15;
                i++
            ) {

                const station =
                    clean(
                        item[
                            "STASIUN_" + i
                        ]
                    );


                if (station) {

                    stationList.push(
                        station
                    );

                }

            }


            return {

                ID_TARIF:
                    clean(
                        item.ID_TARIF
                    ),

                ID_KA:
                    clean(
                        item.ID_KA
                    ),

                ARAH:
                    clean(
                        item.ARAH
                    ),

                POLA_RELASI:
                    clean(
                        item.POLA_RELASI
                    ),

                STASIUN:
                    stationList,

                EKS:
                    parseFare(item.EKS),

                BIS:
                    parseFare(item.BIS),

                EKO:
                    parseFare(item.EKO),

                STATUS:
                    clean(
                        item.STATUS
                    )

            };

        }
    );

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


    const number =
        raw
            .replace(
                /Rp/gi,
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
                "");


    const parsed =
        Number(number);


    return Number.isFinite(parsed)
        ? parsed
        : null;

}
/* =========================================================
   FORMAT RUPIAH
   ========================================================= */

function formatRupiah(value) {

    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(
            Number(value)
        )
    ) {

        return "Tidak tersedia";

    }


    return new Intl.NumberFormat(
        "id-ID"
    ).format(
        Number(value)
    );

}


/* =========================================================
   LOWEST FARE
   ========================================================= */

function getLowestFare(tarif) {

    const fares = [
        tarif.EKS,
        tarif.BIS,
        tarif.EKO
    ].filter(
        value =>
            value !== null &&
            Number.isFinite(
                Number(value)
            )
    );


    if (!fares.length) {

        return null;

    }


    return Math.min(
        ...fares
    );

}


/* =========================================================
   REFERENCE ROUTE
   ========================================================= */

function getReferenceRoute(tarif) {

    if (
        !tarif ||
        !Array.isArray(
            tarif.STASIUN
        )
    ) {

        return [];

    }


    return tarif.STASIUN
        .filter(
            station =>
                clean(station) !== ""
        );

}


/* =========================================================
   ROUTE RELATION HTML
   ========================================================= */

function relationHTML(stations) {

    if (
        !stations ||
        !stations.length
    ) {

        return "-";

    }


    return stations
        .map(
            station =>
                `<span class="relation-station">${escapeHTML(station)}</span>`
        )
        .join(
            `<span class="relation-arrow">→</span>`
        );

}


/* =========================================================
   CHECK ROUTE COVERAGE
   ========================================================= */

function routeIsCovered(
    tarif,
    asal,
    tujuan
) {

    if (
        !tarif ||
        !Array.isArray(
            tarif.STASIUN
        )
    ) {

        return false;

    }


    const route =
        tarif.STASIUN.map(
            station =>
                normalize(station)
        );


    const origin =
        normalize(asal);


    const destination =
        normalize(tujuan);


    const originIndex =
        route.indexOf(origin);


    const destinationIndex =
        route.indexOf(destination);


    if (
        originIndex === -1 ||
        destinationIndex === -1
    ) {

        return false;

    }


    const arah =
        normalize(
            tarif.ARAH
        );


    /* -----------------------------------------------------
       PP = Pulang Pergi
       ----------------------------------------------------- */

    if (
        arah === "pp" ||
        arah === "pulang pergi"
    ) {

        return true;

    }


    /* -----------------------------------------------------
       Untuk arah tertentu,
       asal harus berada sebelum tujuan.
       ----------------------------------------------------- */

    return (
        originIndex <
        destinationIndex
    );

}


/* =========================================================
   GET NAMA KA
   ========================================================= */

function getNamaKA(idKA) {

    const target =
        normalize(idKA);


    const ka =
        MASTER_KA.find(
            item =>
                normalize(
                    item.ID_KA
                ) === target
        );


    return ka
        ? ka.NAMA_KA
        : idKA;

}


/* =========================================================
   CHECK KA ACTIVE
   ========================================================= */

function isKAActive(idKA) {

    const target =
        normalize(idKA);


    const ka =
        MASTER_KA.find(
            item =>
                normalize(
                    item.ID_KA
                ) === target
        );


    if (!ka) {

        return false;

    }


    return normalize(
        ka.AKTIF
    ) !== "tidak";

}


/* =========================================================
   CHECK TARIF ACTIVE
   ========================================================= */

function isTarifActive(tarif) {

    if (!tarif) {

        return false;

    }


    return normalize(
        tarif.STATUS
    ) !== "tidak";

}
/* =========================================================
   FARE ITEM
   ========================================================= */

function fareItem(
    label,
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return `
        <div class="fare-item">

            <span class="fare-class">
                ${escapeHTML(label)}
            </span>

            <strong>
                Rp ${formatRupiah(value)}
            </strong>

        </div>
    `;

}


/* =========================================================
   SAFE ID
   ========================================================= */

function makeSafeId(value) {

    return normalize(value)
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
   SEARCH TARIF
   ========================================================= */

function searchTarif(
    asal,
    tujuan
) {

    const origin =
        clean(asal);


    const destination =
        clean(tujuan);


    if (
        !origin ||
        !destination
    ) {

        return [];

    }


    const groups =
        new Map();


    MASTER_TARIF
        .filter(
            tarif =>
                isTarifActive(tarif)
        )
        .filter(
            tarif =>
                isKAActive(
                    tarif.ID_KA
                )
        )
        .filter(
            tarif =>
                routeIsCovered(
                    tarif,
                    origin,
                    destination
                )
        )
        .forEach(
            tarif => {

                const namaKA =
                    getNamaKA(
                        tarif.ID_KA
                    );


                const key =
                    normalize(
                        namaKA
                    );


                if (!groups.has(key)) {

                    groups.set(
                        key,
                        []
                    );

                }


                groups
                    .get(key)
                    .push(tarif);

            }
        );


    const result = [];


    groups.forEach(
        (tarifs, key) => {

            tarifs.sort(
                (a, b) => {

                    const fareA =
                        getLowestFare(a);

                    const fareB =
                        getLowestFare(b);


                    if (
                        fareA === null &&
                        fareB !== null
                    ) {

                        return 1;

                    }


                    if (
                        fareA !== null &&
                        fareB === null
                    ) {

                        return -1;

                    }


                    if (
                        fareA !== null &&
                        fareB !== null &&
                        fareA !== fareB
                    ) {

                        return fareA - fareB;

                    }


                    return (
                        a.STASIUN.length -
                        b.STASIUN.length
                    );

                }
            );


            result.push({

                key: key,

                namaKA:
                    getNamaKA(
                        tarifs[0].ID_KA
                    ),

                idKA:
                    tarifs[0].ID_KA,

                tarifs: tarifs

            });

        }
    );


    result.sort(
        (a, b) => {

            const fareA =
                getLowestFare(
                    a.tarifs[0]
                );


            const fareB =
                getLowestFare(
                    b.tarifs[0]
                );


            if (
                fareA === null &&
                fareB !== null
            ) {

                return 1;

            }


            if (
                fareA !== null &&
                fareB === null
            ) {

                return -1;

            }


            if (
                fareA !== null &&
                fareB !== null
            ) {

                return fareA - fareB;

            }


            return a.namaKA.localeCompare(
                b.namaKA,
                "id"
            );

        }
    );


    return result;

               }
/* =========================================================
   CREATE TARIF DETAIL
   ========================================================= */

function createTarifDetail(
    tarif,
    asal,
    tujuan,
    isMain = false
) {

    const route =
        getReferenceRoute(
            tarif
        );


    const lowest =
        getLowestFare(
            tarif
        );


    const routeText =
        relationHTML(
            route
        );


    const mainClass =
        isMain
            ? "tariff-detail main-detail"
            : "tariff-detail";


    return `
        <div class="${mainClass}">

            <div class="tariff-detail-top">

                <div>

                    <span class="tariff-label">
                        ${
                            isMain
                                ? "TARIF UTAMA"
                                : "TARIF ALTERNATIF"
                        }
                    </span>

                    <div class="tariff-route">
                        ${routeText}
                    </div>

                </div>

                ${
                    lowest !== null
                        ? `
                            <div class="lowest-fare">

                                <small>
                                    MULAI
                                </small>

                                <strong>
                                    Rp ${formatRupiah(lowest)}
                                </strong>

                            </div>
                        `
                        : ""
                }

            </div>


            <div class="fare-list">

                ${fareItem(
                    "Eksekutif",
                    tarif.EKS
                )}

                ${fareItem(
                    "Bisnis",
                    tarif.BIS
                )}

                ${fareItem(
                    "Ekonomi",
                    tarif.EKO
                )}

            </div>


            <div class="tariff-meta">

                <span>
                    Arah: ${
                        escapeHTML(
                            tarif.ARAH || "-"
                        )
                    }
                </span>

                <span>
                    ID: ${
                        escapeHTML(
                            tarif.ID_TARIF || "-"
                        )
                    }
                </span>

            </div>

        </div>
    `;

}


/* =========================================================
   CREATE KA GROUP CARD
   ========================================================= */

function createKAGroupCard(
    group,
    asal,
    tujuan,
    index
) {

    const tariffs =
        group.tarifs || [];


    if (!tariffs.length) {

        return "";

    }


    const mainTarif =
        tariffs[0];


    const alternatives =
        tariffs.slice(1);


    const lowest =
        getLowestFare(
            mainTarif
        );


    const cardId =
        "ka-" +
        makeSafeId(
            group.namaKA
        ) +
        "-" +
        index;


    let alternativeHTML =
        "";


    if (alternatives.length) {

        alternativeHTML = `
            <div class="tariff-alternatives">

                <button
                    type="button"
                    class="alternative-toggle"
                    data-target="${escapeAttr(cardId)}"
                >

                    <span>
                        ⇄
                    </span>

                    ${
                        alternatives.length
                    }
                    tarif alternatif

                    <b>
                        ›
                    </b>

                </button>


                <div
                    class="alternative-content"
                    id="${escapeAttr(cardId)}"
                >

                    ${alternatives
                        .map(
                            tarif =>
                                createTarifDetail(
                                    tarif,
                                    asal,
                                    tujuan,
                                    false
                                )
                        )
                        .join("")
                    }

                </div>

            </div>
        `;

    }


    return `
        <article class="grouped-result-card">

            <div class="result-card-header">

                <div>

                    <span class="result-kicker">
                        KERETA API
                    </span>

                    <h3>
                        ${escapeHTML(
                            group.namaKA
                        )}
                    </h3>

                </div>


                ${
                    lowest !== null
                        ? `
                            <div class="main-price">

                                <small>
                                    TARIF MULAI
                                </small>

                                <strong>
                                    Rp ${formatRupiah(lowest)}
                                </strong>

                            </div>
                        `
                        : ""
                }

            </div>


            <div class="journey">

                <div class="journey-station">
                    ${escapeHTML(asal)}
                </div>

                <div class="journey-line">
                    <span></span>
                    <i>→</i>
                    <span></span>
                </div>

                <div class="journey-station destination">
                    ${escapeHTML(tujuan)}
                </div>

            </div>


            ${createTarifDetail(
                mainTarif,
                asal,
                tujuan,
                true
            )}


            ${alternativeHTML}

        </article>
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

    if (!resultsEl) {

        return;

    }


    if (!groups.length) {

        resultsEl.innerHTML = `

            <div class="no-result-card">

                <div class="no-result-icon">
                    ⌕
                </div>

                <h3>
                    Tarif tidak ditemukan
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

                <small>
                    Periksa kembali nama stasiun
                    atau pastikan relasi tarif
                    tersedia di database.
                </small>

            </div>

        `;

        return;

    }


    resultsEl.innerHTML = `

        <div class="results-heading">

            <div>

                <span>
                    HASIL PENCARIAN
                </span>

                <h2>
                    Tarif Tersedia
                </h2>

            </div>

            <strong>
                ${groups.length} KA
            </strong>

        </div>


        <div class="results-route">

            <span>
                ${escapeHTML(asal)}
            </span>

            <i>
                →
            </i>

            <span>
                ${escapeHTML(tujuan)}
            </span>

        </div>


        <div class="results-list">

            ${groups
                .map(
                    (group, index) =>
                        createKAGroupCard(
                            group,
                            asal,
                            tujuan,
                            index
                        )
                )
                .join("")
            }

        </div>

    `;


    bindAlternativeButtons();

}


/* =========================================================
   ALTERNATIVE BUTTON
   ========================================================= */

function bindAlternativeButtons() {

    document
        .querySelectorAll(
            ".alternative-toggle"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const targetId =
                            button.dataset.target;


                        const target =
                            document.getElementById(
                                targetId
                            );


                        if (!target) {

                            return;

                        }


                        const opened =
                            target.classList.toggle(
                                "open"
                            );


                        button.classList.toggle(
                            "open",
                            opened
                        );

                    }
                );

            }
        );

}


/* =========================================================
   DYNAMIC CSS
   ========================================================= */

function injectDynamicStyles() {

    if (
        document.getElementById(
            "tarsusDataEngineStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement("style");


    style.id =
        "tarsusDataEngineStyles";


    style.textContent = `

        .tarsus-results {

            margin-top: 25px;

        }


        .results-heading {

            display: flex;

            align-items: flex-end;

            justify-content: space-between;

            gap: 12px;

            margin-bottom: 10px;

        }


        .results-heading span {

            color: var(--gold);

            font-size: 8px;

            font-weight: 800;

            letter-spacing: .17em;

        }


        .results-heading h2 {

            margin-top: 4px;

            color: var(--white);

            font-family: Manrope, sans-serif;

            font-size: 18px;

        }


        .results-heading > strong {

            color: var(--muted);

            font-size: 9px;

        }


        .results-route {

            display: flex;

            align-items: center;

            gap: 8px;

            margin-bottom: 12px;

            color: var(--muted);

            font-size: 9px;

        }


        .results-route i {

            color: var(--gold);

            font-style: normal;

        }


        .results-list {

            display: flex;

            flex-direction: column;

            gap: 12px;

        }


        .grouped-result-card {

            overflow: hidden;

            border: 1px solid var(--border);

            border-radius: 19px;

            background: rgba(18,48,64,.72);

            box-shadow: 0 18px 50px rgba(2,16,24,.16);

        }


        body.light-theme .grouped-result-card {

            background: rgba(255,255,255,.9);

        }


        .result-card-header {

            display: flex;

            align-items: flex-start;

            justify-content: space-between;

            gap: 12px;

            padding: 17px;

            border-bottom: 1px solid var(--border);

        }


        .result-kicker {

            color: var(--kai-green-light);

            font-size: 7px;

            font-weight: 800;

            letter-spacing: .16em;

        }


        .result-card-header h3 {

            margin-top: 5px;

            color: var(--white);

            font-family: Manrope, sans-serif;

            font-size: 17px;

        }


        .main-price {

            text-align: right;

        }


        .main-price small {

            display: block;

            color: var(--muted);

            font-size: 6px;

            font-weight: 800;

        }


        .main-price strong {

            display: block;

            margin-top: 3px;

            color: var(--gold);

            font-size: 11px;

        }


        .journey {

            display: grid;

            grid-template-columns: 1fr 80px 1fr;

            align-items: center;

            gap: 8px;

            padding: 13px 17px;

            background: rgba(111,183,167,.025);

        }


        .journey-station {

            overflow: hidden;

            color: var(--soft);

            font-size: 9px;

            font-weight: 700;

            text-overflow: ellipsis;

            white-space: nowrap;

        }


        .journey-station.destination {

            text-align: right;

        }


        .journey-line {

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 5px;

            color: var(--gold);

        }


        .journey-line span {

            width: 13px;

            height: 1px;

            background: rgba(228,199,131,.35);

        }


        .journey-line i {

            font-style: normal;

            font-size: 12px;

        }


        .tariff-detail {

            margin: 12px;

            padding: 14px;

            border: 1px solid var(--border);

            border-radius: 14px;

            background: rgba(220,240,240,.018);

        }


        .main-detail {

            border-color: rgba(228,199,131,.13);

        }


        .tariff-detail-top {

            display: flex;

            align-items: flex-start;

            justify-content: space-between;

            gap: 10px;

        }


        .tariff-label {

            display: block;

            color: var(--gold);

            font-size: 7px;

            font-weight: 800;

            letter-spacing: .14em;

        }


        .tariff-route {

            margin-top: 7px;

            color: var(--soft);

            font-size: 8px;

            line-height: 1.8;

        }


        .relation-arrow {

            margin: 0 3px;

            color: var(--muted);

        }


        .lowest-fare {

            flex-shrink: 0;

            text-align: right;

        }


        .lowest-fare small {

            display: block;

            color: var(--muted);

            font-size: 6px;

        }


        .lowest-fare strong {

            color: var(--gold);

            font-size: 10px;

        }


        .fare-list {

            display: grid;

            grid-template-columns: repeat(3, 1fr);

            gap: 6px;

            margin-top: 13px;

        }


        .fare-item {

            padding: 9px;

            border: 1px solid var(--border);

            border-radius: 9px;

            background: rgba(111,183,167,.025);

        }


        .fare-class {

            display: block;

            color: var(--muted);

            font-size: 6px;

        }


        .fare-item strong {

            display: block;

            margin-top: 3px;

            color: var(--soft);

            font-size: 8px;

        }


        .tariff-meta {

            display: flex;

            justify-content: space-between;

            gap: 8px;

            margin-top: 11px;

            color: var(--muted);

            font-size: 6px;

        }


        .tariff-alternatives {

            padding: 0 12px 12px;

        }


        .alternative-toggle {

            width: 100%;

            display: flex;

            align-items: center;

            gap: 7px;

            padding: 10px 11px;

            border: 1px solid var(--border);

            border-radius: 10px;

            color: var(--muted);

            background: rgba(111,183,167,.025);

            font-size: 8px;

            cursor: pointer;

            text-align: left;

        }


        .alternative-toggle span {

            color: var(--gold);

        }


        .alternative-toggle b {

            margin-left: auto;

            color: var(--gold);

            font-size: 14px;

            font-weight: 400;

            transition: transform .2s ease;

        }


        .alternative-toggle.open b {

            transform: rotate(90deg);

        }


        .alternative-content {

            display: none;

            padding-top: 2px;

        }


        .alternative-content.open {

            display: block;

        }


        .no-result-card {

            padding: 28px 20px;

            border: 1px solid var(--border);

            border-radius: 19px;

            background: rgba(18,48,64,.72);

            text-align: center;

        }


        body.light-theme .no-result-card {

            background: rgba(255,255,255,.9);

        }


        .no-result-icon {

            width: 44px;

            height: 44px;

            display: grid;

            place-items: center;

            margin: 0 auto 12px;

            border-radius: 13px;

            color: var(--gold);

            background: rgba(228,199,131,.06);

            font-size: 18px;

        }


        .no-result-card h3 {

            color: var(--white);

            font-family: Manrope, sans-serif;

            font-size: 15px;

        }


        .no-result-card p {

            margin-top: 7px;

            color: var(--muted);

            font-size: 9px;

            line-height: 1.7;

        }


        .no-result-card p strong {

            color: var(--soft);

        }


        .no-result-card small {

            display: block;

            margin-top: 8px;

            color: var(--muted);

            font-size: 7px;

            line-height: 1.6;

        }


        @media (max-width: 680px) {

            .fare-list {

                grid-template-columns: 1fr;

            }


            .journey {

                grid-template-columns: 1fr 50px 1fr;

            }


            .tariff-route {

                max-height: 70px;

                overflow-y: auto;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}
/* =========================================================
   SHOW SUGGESTIONS
   ========================================================= */

function showSuggestions(
    input,
    container
) {

    if (
        !input ||
        !container
    ) {

        return;

    }


    const keyword =
        normalize(
            input.value
        );


    if (!keyword) {

        container.innerHTML = "";

        container.style.display =
            "none";

        return;

    }


    const matches =
        MASTER_STASIUN
            .filter(
                station =>
                    normalize(
                        station.AKTIF
                    ) !== "tidak"
            )
            .filter(
                station => {

                    const name =
                        normalize(
                            station.NAMA_STASIUN
                        );


                    const code =
                        normalize(
                            station.KODE_STASIUN
                        );


                    return (
                        name.includes(
                            keyword
                        ) ||
                        code.includes(
                            keyword
                        )
                    );

                }
            )
            .slice(0, 8);


    if (!matches.length) {

        container.innerHTML = "";

        container.style.display =
            "none";

        return;

    }


    container.innerHTML =
        matches
            .map(
                station => `

                    <div
                        class="suggestion-item"
                        data-station="${escapeAttr(
                            station.NAMA_STASIUN
                        )}"
                    >

                        <strong>
                            ${escapeHTML(
                                station.NAMA_STASIUN
                            )}
                        </strong>

                        ${
                            station.KODE_STASIUN
                                ? `
                                    <small
                                        style="
                                            display:block;
                                            margin-top:3px;
                                            color:var(--muted);
                                            font-size:7px;
                                        "
                                    >
                                        ${escapeHTML(
                                            station.KODE_STASIUN
                                        )}
                                    </small>
                                `
                                : ""
                        }

                    </div>

                `
            )
            .join("");


    container.style.display =
        "block";


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

                        closeSuggestions(
                            container
                        );

                    }
                );

            }
        );

}


/* =========================================================
   CLOSE SUGGESTIONS
   ========================================================= */

function closeSuggestions(
    container
) {

    if (!container) {

        return;

    }


    container.innerHTML = "";

    container.style.display =
        "none";

}


/* =========================================================
   ENTER KEY
   ========================================================= */

function handleEnter(
    event
) {

    if (
        event.key === "Enter"
    ) {

        event.preventDefault();

        performSearch();

    }

}


/* =========================================================
   SWAP STATIONS
   ========================================================= */

function swapStations() {

    if (
        !asalInput ||
        !tujuanInput
    ) {

        return;

    }


    const currentAsal =
        asalInput.value;


    asalInput.value =
        tujuanInput.value;


    tujuanInput.value =
        currentAsal;


    closeSuggestions(
        asalSuggestions
    );


    closeSuggestions(
        tujuanSuggestions
    );


    if (
        asalInput.value &&
        tujuanInput.value
    ) {

        performSearch();

    }

}
/* =========================================================
   PERFORM SEARCH
   ========================================================= */

async function performSearch() {

    if (
        !asalInput ||
        !tujuanInput
    ) {

        return;

    }


    const asal =
        clean(
            asalInput.value
        );


    const tujuan =
        clean(
            tujuanInput.value
        );


    closeSuggestions(
        asalSuggestions
    );


    closeSuggestions(
        tujuanSuggestions
    );


    if (!asal) {

        if (statusEl) {

            statusEl.textContent =
                "Silakan pilih stasiun asal.";

        }

        asalInput.focus();

        return;

    }


    if (!tujuan) {

        if (statusEl) {

            statusEl.textContent =
                "Silakan pilih stasiun tujuan.";

        }

        tujuanInput.focus();

        return;

    }


    if (
        normalize(asal) ===
        normalize(tujuan)
    ) {

        if (statusEl) {

            statusEl.textContent =
                "Stasiun asal dan tujuan tidak boleh sama.";

        }

        return;

    }


    if (statusEl) {

        statusEl.textContent =
            "Mencari tarif khusus...";

    }


    if (searchBtn) {

        searchBtn.disabled =
            true;

        searchBtn.style.opacity =
            "0.65";

    }


    try {

        /*
         * Sedikit delay agar UI sempat
         * memperbarui status.
         */

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    80
                )
        );


        const results =
            searchTarif(
                asal,
                tujuan
            );


        renderResults(
            results,
            asal,
            tujuan
        );


        if (statusEl) {

            if (results.length) {

                statusEl.textContent =
                    `Ditemukan ${results.length} KA dengan tarif khusus.`;

            } else {

                statusEl.textContent =
                    "Pencarian selesai.";

            }

        }


        /*
         * Scroll ke hasil hanya jika
         * hasil memang tersedia.
         */

        if (
            results.length &&
            resultsEl
        ) {

            setTimeout(
                () => {

                    resultsEl.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                },
                100
            );

        }

    } catch (error) {

        console.error(
            "TARSUS Search Error:",
            error
        );


        if (statusEl) {

            statusEl.textContent =
                "Terjadi kesalahan saat mencari tarif.";

        }

    } finally {

        if (searchBtn) {

            searchBtn.disabled =
                false;

            searchBtn.style.opacity =
                "1";

        }

    }

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

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
        "keydown",
        handleEnter
    );

}


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


document.addEventListener(
    "click",
    event => {

        if (
            asalInput &&
            asalSuggestions &&
            !asalInput.contains(event.target) &&
            !asalSuggestions.contains(event.target)
        ) {

            closeSuggestions(
                asalSuggestions
            );

        }


        if (
            tujuanInput &&
            tujuanSuggestions &&
            !tujuanInput.contains(event.target) &&
            !tujuanSuggestions.contains(event.target)
        ) {

            closeSuggestions(
                tujuanSuggestions
            );

        }

    }
);
/* =========================================================
   LOAD DATABASE
   ========================================================= */

async function loadData() {

    try {

        if (statusEl) {

            statusEl.textContent =
                "Menghubungkan ke database...";

        }


        if (splashStatus) {

            splashStatus.textContent =
                "Menghubungkan database...";

        }


        /*
         * Ketiga MASTER dimuat bersamaan
         * agar lebih cepat.
         */

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


        if (splashStatus) {

            splashStatus.textContent =
                "Memproses data...";

        }


        MASTER_KA =
            parseMasterKA(
                parseCSV(kaCSV)
            );


        MASTER_TARIF =
            parseMasterTarif(
                parseCSV(tarifCSV)
            );


        MASTER_STASIUN =
            parseMasterStasiun(
                parseCSV(stasiunCSV)
            );


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


        if (statusEl) {

            statusEl.textContent =
                "Database siap digunakan.";

        }


        if (splashStatus) {

            splashStatus.textContent =
                "Database siap.";

        }


        /*
         * Beri sedikit waktu agar status
         * splash terlihat sebelum ditutup.
         */

        setTimeout(
            () => {

                const splash =
                    document.getElementById(
                        "splash"
                    );


                if (splash) {

                    splash.classList.add(
                        "hidden"
                    );

                }

            },
            350
        );


    } catch (error) {

        console.error(
            "TARSUS DATABASE ERROR:",
            error
        );


        if (statusEl) {

            statusEl.textContent =
                "Gagal memuat database. Periksa Google Sheet dan koneksi.";

        }


        if (splashStatus) {

            splashStatus.textContent =
                "Database gagal dimuat.";

        }


        /*
         * Tetap sembunyikan splash
         * agar aplikasi tidak stuck.
         */

        setTimeout(
            () => {

                const splash =
                    document.getElementById(
                        "splash"
                    );


                if (splash) {

                    splash.classList.add(
                        "hidden"
                    );

                }

            },
            1200
        );

    }

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

injectDynamicStyles();

loadData();
