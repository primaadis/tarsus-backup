/* =========================================================
   TARSUS FINDER
   DATA ENGINE — FINAL
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
   DATA STORAGE
========================================================= */

let MASTER_KA = [];

let MASTER_TARIF = [];

let MASTER_STASIUN = [];


/* =========================================================
   ELEMENT STORAGE
========================================================= */

let asalInput = null;

let tujuanInput = null;

let asalSuggestions = null;

let tujuanSuggestions = null;

let searchBtn = null;

let swapBtn = null;

let statusEl = null;

let resultsEl = null;


/* =========================================================
   DOM INIT
========================================================= */

function initElements() {

    asalInput =
        document.getElementById("asal");

    tujuanInput =
        document.getElementById("tujuan");

    asalSuggestions =
        document.getElementById(
            "asal-suggestions"
        );

    tujuanSuggestions =
        document.getElementById(
            "tujuan-suggestions"
        );

    searchBtn =
        document.getElementById(
            "searchBtn"
        );

    swapBtn =
        document.getElementById(
            "swapBtn"
        );

    statusEl =
        document.getElementById(
            "status"
        );

    resultsEl =
        document.getElementById(
            "results"
        );

}


/* =========================================================
   UTILITY
========================================================= */

function clean(value) {

    return String(
        value ?? ""
    )
        .replace(/\u00A0/g, " ")
        .trim();

}


function normalize(value) {

    return clean(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");

}


function normalizeCompact(value) {

    return normalize(value)
        .replace(/[^a-z0-9]/g, "");

}


function escapeHTML(value) {

    return String(
        value ?? ""
    )
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


    if (cell !== "" || row.length > 0) {

        row.push(cell);

    }


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
        encodeURIComponent(
            sheetName
        );


    const response =
        await fetch(
            url,
            {
                method: "GET",
                cache: "no-store"
            }
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "Gagal mengambil sheet: " +
            sheetName +
            " (" +
            response.status +
            ")"
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
            header =>
                clean(header)
        );


    return rows
        .slice(1)
        .map(row => {

            const obj = {};


            headers.forEach(
                (
                    header,
                    index
                ) => {

                    if (
                        header !== ""
                    ) {

                        obj[header] =
                            clean(
                                row[index] ??
                                ""
                            );

                    }

                }
            );


            return obj;

        });

}


/* =========================================================
   GET FIELD
   ---------------------------------------------------------
   Membuat pembacaan header lebih toleran
   tanpa mengubah struktur spreadsheet.
========================================================= */

function getField(
    row,
    ...names
) {

    const keys =
        Object.keys(row);


    for (
        const wanted of names
    ) {

        const wantedNorm =
            normalizeCompact(
                wanted
            );


        const key =
            keys.find(
                existing =>
                    normalizeCompact(
                        existing
                    ) === wantedNorm
            );


        if (
            key !== undefined
        ) {

            return clean(
                row[key]
            );

        }

    }


    return "";

}


/* =========================================================
   MASTER KA
========================================================= */

function parseMasterKA(csv) {

    const objects =
        rowsToObjects(
            parseCSV(csv)
        );


    return objects
        .filter(
            row =>
                getField(
                    row,
                    "ID_KA"
                ) !== ""
        )
        .map(
            row => {

                return {

                    idKA:
                        getField(
                            row,
                            "ID_KA"
                        ),

                    namaKA:
                        getField(
                            row,
                            "NAMA_KA",
                            "NAMA KA"
                        ),

                    aktif:
                        getField(
                            row,
                            "AKTIF",
                            "STATUS"

                        )

                };

            }
        );

}


/* =========================================================
   MASTER STASIUN
========================================================= */

function parseMasterStasiun(csv) {

    const objects =
        rowsToObjects(
            parseCSV(csv)
        );


    return objects
        .filter(
            row => {

                return (
                    getField(
                        row,
                        "ID_STASIUN"
                    ) !== "" &&
                    getField(
                        row,
                        "NAMA_STASIUN",
                        "NAMA STASIUN"
                    ) !== ""
                );

            }
        )
        .map(
            row => {

                return {

                    idStasiun:
                        getField(
                            row,
                            "ID_STASIUN"
                        ),

                    namaStasiun:
                        getField(
                            row,
                            "NAMA_STASIUN",
                            "NAMA STASIUN"
                        ),

                    daop:
                        getField(
                            row,
                            "DAOP_DIVRE",
                            "DAOP",
                            "DIVRE"
                        ),

                    provinsi:
                        getField(
                            row,
                            "PROVINSI"
                        ),

                    aktif:
                        getField(
                            row,
                            "AKTIF",
                            "STATUS"
                        )

                };

            }
        );

}


/* =========================================================
   MASTER TARIF
========================================================= */

function parseMasterTarif(csv) {

    const objects =
        rowsToObjects(
            parseCSV(csv)
        );


    return objects
        .filter(
            row => {

                return (
                    getField(
                        row,
                        "ID_TARIF"
                    ) !== "" &&
                    getField(
                        row,
                        "ID_KA"
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
                        getField(
                            row,
                            "STASIUN_" + i,
                            "STASIUN " + i
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
                        getField(
                            row,
                            "ID_TARIF"
                        ),

                    idKA:
                        getField(
                            row,
                            "ID_KA"
                        ),

                    arah:
                        getField(
                            row,
                            "ARAH"
                        ).toUpperCase(),

                    polaRelasi:
                        getField(
                            row,
                            "POLA_RELASI",
                            "POLA RELASI"
                        ),

                    stations,

                    eks:
                        parseFare(
                            getField(
                                row,
                                "EKS",
                                "EKSEKUTIF"
                            )
                        ),

                    bis:
                        parseFare(
                            getField(
                                row,
                                "BIS",
                                "BISNIS"
                            )
                        ),

                    eko:
                        parseFare(
                            getField(
                                row,
                                "EKO",
                                "EKONOMI"
                            )
                        ),

                    status:
                        getField(
                            row,
                            "STATUS",
                            "AKTIF"
                        )

                };

            }
        );

}


/* =========================================================
   FARE
========================================================= */

function parseFare(value) {

    const raw =
        clean(value);


    if (
        raw === "" ||
        raw === "-" ||
        raw === "—" ||
        normalize(raw) === "null" ||
        normalize(raw) === "tidak tersedia"
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
   RUPIAH
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
            tarif.stations
        ) ||
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
   STATION ALIAS MATCH
   ---------------------------------------------------------
   Memungkinkan nama stasiun dibandingkan dengan:
   - nama asli
   - ID stasiun
========================================================= */

function stationMatches(
    tarifStation,
    searchStation
) {

    const target =
        normalize(
            searchStation
        );

    const targetCompact =
        normalizeCompact(
            searchStation
        );


    if (
        !target
    ) {

        return false;

    }


    const station =
        MASTER_STASIUN.find(
            item => {

                const nama =
                    normalize(
                        item.namaStasiun
                    );

                const id =
                    normalize(
                        item.idStasiun
                    );

                return (
                    nama ===
                        normalize(
                            tarifStation
                        ) ||
                    id ===
                        normalize(
                            tarifStation
                        )
                );

            }
        );


    if (
        station
    ) {

        return (
            normalize(
                station.namaStasiun
            ) === target ||
            normalize(
                station.idStasiun
            ) === target ||
            normalizeCompact(
                station.namaStasiun
            ) === targetCompact ||
            normalizeCompact(
                station.idStasiun
            ) === targetCompact
        );

    }


    return (
        normalize(
            tarifStation
        ) === target ||
        normalizeCompact(
            tarifStation
        ) === targetCompact
    );

}


/* =========================================================
   RESOLVE STATION INDEX
========================================================= */

function findStationIndex(
    stations,
    searchStation
) {

    if (
        !Array.isArray(stations)
    ) {

        return -1;

    }


    return stations.findIndex(
        station =>
            stationMatches(
                station,
                searchStation
            )
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
        !Array.isArray(stations) ||
        stations.length < 2
    ) {

        return false;

    }


    const asalIndex =
        findStationIndex(
            stations,
            asal
        );


    const tujuanIndex =
        findStationIndex(
            stations,
            tujuan
        );


    if (
        asalIndex === -1 ||
        tujuanIndex === -1
    ) {

        return false;

    }


    if (
        tarif.arah === "PP"
    ) {

        return true;

    }


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
                normalize(
                    item.idKA
                ) ===
                normalize(idKA)
        );


    if (
        !ka
    ) {

        return clean(idKA);

    }


    return (
        clean(ka.namaKA) ||
        clean(idKA)
    );

}


/* =========================================================
   STATUS PARSER
========================================================= */

function statusIsActive(
    value
) {

    const status =
        normalize(value);


    if (
        status === ""
    ) {

        return true;

    }


    if (
        [
            "tidak",
            "nonaktif",
            "non aktif",
            "inactive",
            "no",
            "false",
            "0"
        ].includes(status)
    ) {

        return false;

    }


    return [
        "ya",
        "aktif",
        "active",
        "yes",
        "true",
        "1"
    ].includes(status);

}


/* =========================================================
   KA ACTIVE
========================================================= */

function isKAActive(idKA) {

    const ka =
        MASTER_KA.find(
            item =>
                normalize(
                    item.idKA
                ) ===
                normalize(idKA)
        );


    if (
        !ka
    ) {

        return true;

    }


    return statusIsActive(
        ka.aktif
    );

}


/* =========================================================
   TARIF ACTIVE
========================================================= */

function isTarifActive(
    tarif
) {

    return statusIsActive(
        tarif.status
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

        <div class="fare-item">

            <span class="fare-class">
                ${escapeHTML(label)}
            </span>

            <span class="fare-price ${
                unavailable
                    ? "fare-unavailable"
                    : ""
            }">

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
   SAFE ID
========================================================= */

function makeSafeId(value) {

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
            : "TARIF KHUSUS ALTERNATIF";


    return `

        <div
            class="tariff-detail ${
                isMain
                    ? "tariff-main"
                    : "tariff-alternative"
            }"
        >

            <div class="reference-box">

                <div class="reference-label">

                    ${title}

                </div>

                <div class="reference-route">

                    ${referenceHTML}

                </div>

            </div>


            <div class="fare-list">

                ${fareItem(
                    "EKS",
                    tarif.eks
                )}

                ${fareItem(
                    "BIS",
                    tarif.bis
                )}

                ${fareItem(
                    "EKO",
                    tarif.eko
                )}

            </div>

        </div>

    `;

}


/* =========================================================
   GROUPED KA CARD
========================================================= */

function createKAGroupCard(
    namaKA,
    group,
    asal,
    tujuan,
    index
) {

    if (
        !group ||
        group.length === 0
    ) {

        return "";

    }


    const cardId =
        "ka-" +
        makeSafeId(namaKA) +
        "-" +
        index;


    const mainTarif =
        group[0];


    const alternatives =
        group.slice(1);


    let alternativeHTML =
        "";


    if (
        alternatives.length > 0
    ) {

        const detailHTML =
            alternatives
                .map(
                    tarif =>
                        createTarifDetail(
                            tarif,
                            false
                        )
                )
                .join("");


        alternativeHTML = `

            <details
                class="tariff-alternatives"
            >

                <summary>

                    <span>
                        Lihat
                        ${alternatives.length}
                        tarif khusus alternatif
                    </span>

                    <span
                        class="alternative-arrow"
                    >
                        +
                    </span>

                </summary>


                <div class="alternative-content">

                    ${detailHTML}

                </div>

            </details>

        `;

    }


    return `

        <article
            class="result-card grouped-result-card"
            id="${escapeAttr(cardId)}"
        >

            <div class="result-name">

                ${escapeHTML(namaKA)}

            </div>


            <div class="journey">

                <span>
                    ${escapeHTML(asal)}
                </span>

                <span class="journey-arrow">
                    →
                </span>

                <span>
                    ${escapeHTML(tujuan)}
                </span>

            </div>


            ${createTarifDetail(
                mainTarif,
                true
            )}


            ${alternativeHTML}

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
        normalize(asal);

    const tujuanNorm =
        normalize(tujuan);


    if (
        !asalNorm ||
        !tujuanNorm ||
        asalNorm === tujuanNorm
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


                if (
                    getLowestFare(
                        tarif
                    ) === Infinity
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
                (
                    a,
                    b
                ) => {

                    const fareA =
                        getLowestFare(a);

                    const fareB =
                        getLowestFare(b);


                    if (
                        fareA !== fareB
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
   ENSURE RESULTS ELEMENT
========================================================= */

function ensureResultsElement() {

    let el =
        document.getElementById(
            "results"
        );


    if (
        el
    ) {

        resultsEl = el;

        return el;

    }


    const home =
        document.getElementById(
            "page-home"
        );


    if (
        !home
    ) {

        return null;

    }


    el =
        document.createElement(
            "div"
        );


    el.id =
        "results";

    el.className =
        "results";


    home.appendChild(
        el
    );


    resultsEl =
        el;


    return el;

}


/* =========================================================
   RENDER RESULTS
========================================================= */

function renderResults(
    groups,
    asal,
    tujuan
) {

    const target =
        ensureResultsElement();


    if (
        !target
    ) {

        return;

    }


    target.style.display =
        "block";


    if (
        !groups ||
        groups.length === 0
    ) {

        target.innerHTML = `

            <div class="empty-state">

                <div class="empty-symbol">
                    ⌕
                </div>

                <h3>
                    Tarif khusus tidak ditemukan
                </h3>

                <p>
                    Belum ditemukan tarif khusus
                    untuk perjalanan
                    ${escapeHTML(asal)}
                    →
                    ${escapeHTML(tujuan)}.
                </p>

            </div>

        `;

        return;

    }


    let html = `

        <div class="results-heading">

            <span>
                Tarif Ditemukan
            </span>

            <span>
                ${groups.length}
                KA
            </span>

        </div>

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


    target.innerHTML =
        html;

}


/* =========================================================
   AUTOCOMPLETE
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
                        !statusIsActive(
                            station.aktif
                        )
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

                        ${escapeHTML(
                            station.namaStasiun
                        )}

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
            asalInput?.value
        );

    const tujuan =
        clean(
            tujuanInput?.value
        );


    closeSuggestions();


    if (
        !asal ||
        !tujuan
    ) {

        if (
            statusEl
        ) {

            statusEl.textContent =
                "Silakan pilih stasiun asal dan tujuan.";

        }


        if (
            resultsEl
        ) {

            resultsEl.innerHTML =
                "";

        }


        return;

    }


    if (
        normalize(asal) ===
        normalize(tujuan)
    ) {

        if (
            statusEl
        ) {

            statusEl.textContent =
                "Stasiun asal dan tujuan tidak boleh sama.";

        }


        if (
            resultsEl
        ) {

            resultsEl.innerHTML =
                "";

        }


        return;

    }


    if (
        MASTER_TARIF.length === 0
    ) {

        if (
            statusEl
        ) {

            statusEl.textContent =
                "Database tarif belum siap. Silakan coba lagi.";

        }


        return;

    }


    if (
        statusEl
    ) {

        statusEl.textContent =
            "Mencari tarif khusus...";

    }


    setTimeout(
        () => {

            const groups =
                searchTarif(
                    asal,
                    tujuan
                );


            if (
                statusEl
            ) {

                statusEl.textContent =
                    groups.length > 0
                        ? (
                            "Ditemukan " +
                            groups.length +
                            " KA dengan tarif khusus."
                        )
                        : "Tidak ditemukan tarif khusus.";

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

    if (
        !asalInput ||
        !tujuanInput
    ) {

        return;

    }


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
   ENTER
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
   EVENT BINDING
========================================================= */

function bindEvents() {

    if (
        asalInput
    ) {

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


    if (
        tujuanInput
    ) {

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


    if (
        searchBtn
    ) {

        searchBtn.addEventListener(
            "click",
            performSearch
        );

    }


    if (
        swapBtn
    ) {

        swapBtn.addEventListener(
            "click",
            swapStations
        );

    }


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

}


/* =========================================================
   UPDATE DATABASE STATUS
========================================================= */

function updateDatabaseStatus(
    text
) {

    const el =
        document.getElementById(
            "databaseStatus"
        );


    if (
        el
    ) {

        el.textContent =
            text;

    }

}


/* =========================================================
   LOAD DATA
========================================================= */

async function loadData() {

    try {

        if (
            statusEl
        ) {

            statusEl.textContent =
                "Menghubungkan ke database tarif...";

        }


        if (
            window.TARSUS_UI
        ) {

            window.TARSUS_UI
                .setSplashStatus(
                    "Memuat database..."
                );

        }


        /*
           Ambil 3 database bersamaan.
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


        updateDatabaseStatus(
            "Siap digunakan"
        );


        if (
            statusEl
        ) {

            statusEl.textContent =
                "Database tarif siap digunakan.";

        }


        if (
            window.TARSUS_UI
        ) {

            window.TARSUS_UI
                .setSplashStatus(
                    "Aplikasi siap"
                );

            /*
               Tidak perlu menunggu lebih lama.
            */

            window.TARSUS_UI
                .hideSplash();

        }


        console.log(
            "================================"
        );

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

        console.log(
            "================================"
        );


    } catch (error) {

        console.error(
            "TARSUS FINDER ERROR:",
            error
        );


        updateDatabaseStatus(
            "Gagal dimuat"
        );


        if (
            statusEl
        ) {

            statusEl.textContent =
                "Database belum dapat dimuat. Periksa koneksi atau Google Sheet.";

        }


        const target =
            ensureResultsElement();


        if (
            target
        ) {

            target.innerHTML = `

                <div class="empty-state">

                    <div class="empty-symbol">
                        !
                    </div>

                    <h3>
                        Database belum tersedia
                    </h3>

                    <p>
                        Aplikasi tetap dapat dibuka,
                        tetapi pencarian tarif belum
                        dapat digunakan sampai database
                        berhasil dimuat.
                    </p>

                </div>

            `;

        }


        /*
           Sangat penting:
           error database TIDAK boleh membuat
           aplikasi tertahan di splash.
        */

        if (
            window.TARSUS_UI
        ) {

            window.TARSUS_UI
                .setSplashStatus(
                    "Aplikasi siap"
                );

            window.TARSUS_UI
                .hideSplash();

        }

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeTarsus() {

    initElements();

    bindEvents();

    /*
       Load database setelah UI siap.
    */

    loadData();

}


/*
   DOMContentLoaded aman untuk browser
   maupun TWA Android.
*/

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeTarsus,
        {
            once: true
        }
    );

} else {

    initializeTarsus();

}


/* =========================================================
   PUBLIC API
   ---------------------------------------------------------
   Berguna untuk debugging dari console.
========================================================= */

window.TARSUS_DATA = {

    get MASTER_KA() {
        return MASTER_KA;
    },

    get MASTER_TARIF() {
        return MASTER_TARIF;
    },

    get MASTER_STASIUN() {
        return MASTER_STASIUN;
    },

    searchTarif,

    performSearch,

    formatRupiah

};
