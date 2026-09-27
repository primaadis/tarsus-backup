/* =========================================================
   TARSUS FINDER
   DATA ENGINE
   Database:
   1. MASTER_KA
   2. MASTER_TARIF
   3. MASTER_STASIUN
   ========================================================= */

const SHEET_ID =
    "1a4Ln_wASazV35F2M3MKZcJHEmiAV8G-0WmkMmU4Csls";

const SHEETS = {
    ka: "MASTER_KA",
    tarif: "MASTER_TARIF",
    stasiun: "MASTER_STASIUN"
};


/* =========================================================
   KONFIGURASI
   ========================================================= */

const TARSUS = {
    asal: null,
    tujuan: null,
    dataKA: [],
    dataTarif: [],
    dataStasiun: [],
    ready: false
};


/* =========================================================
   NORMALISASI TEKS
   ========================================================= */

function normalizeText(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");

}


/* =========================================================
   FORMAT HEADER
   ========================================================= */

function normalizeHeader(value) {

    return normalizeText(value)
        .replace(/[^a-z0-9]/g, "");

}


/* =========================================================
   MENCARI NAMA KOLOM
   ========================================================= */

function findColumn(row, aliases) {

    for (const alias of aliases) {

        const key = normalizeHeader(alias);

        if (Object.prototype.hasOwnProperty.call(row, key)) {
            return key;
        }

    }

    return null;

}


/* =========================================================
   GOOGLE SHEETS → JSON
   ========================================================= */

async function loadSheet(sheetName) {

    const url =
        "https://docs.google.com/spreadsheets/d/" +
        SHEET_ID +
        "/gviz/tq?tqx=out:json&sheet=" +
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

    const text = await response.text();

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
        throw new Error(
            "Format data Google Sheet tidak valid: " +
            sheetName
        );
    }

    const json = JSON.parse(
        text.substring(start, end + 1)
    );

    const table = json.table;

    if (!table || !table.cols) {
        throw new Error(
            "Sheet tidak memiliki struktur data: " +
            sheetName
        );
    }

    const headers = table.cols.map((col, index) => {

        let label =
            col.label ||
            col.id ||
            ("kolom" + index);

        return normalizeHeader(label);

    });

    const rows = [];

    (table.rows || []).forEach(row => {

        const obj = {};

        headers.forEach((header, index) => {

            const cell =
                row.c &&
                row.c[index];

            obj[header] =
                cell && cell.v != null
                    ? cell.v
                    : "";

        });

        rows.push(obj);

    });

    return rows;

}


/* =========================================================
   ANGKA
   ========================================================= */

function numberValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    if (typeof value === "number") {
        return value;
    }

    const clean =
        String(value)
            .replace(/[^\d,-]/g, "")
            .replace(/\./g, "")
            .replace(",", ".");

    const result = Number(clean);

    return Number.isFinite(result)
        ? result
        : null;

}


/* =========================================================
   FORMAT RUPIAH
   ========================================================= */

function formatRupiah(value) {

    const number = numberValue(value);

    if (number === null) {
        return "-";
    }

    return "Rp " +
        number.toLocaleString("id-ID");

}


/* =========================================================
   AMBIL NILAI KOLOM DENGAN ALIAS
   ========================================================= */

function getValue(row, aliases) {

    const column =
        findColumn(row, aliases);

    if (!column) {
        return "";
    }

    return row[column];

}


/* =========================================================
   LOAD SEMUA DATABASE
   ========================================================= */

async function loadTarsusData() {

    setStatus(
        "Memuat database tarif..."
    );

    try {

        const [
            dataKA,
            dataTarif,
            dataStasiun
        ] = await Promise.all([

            loadSheet(SHEETS.ka),

            loadSheet(SHEETS.tarif),

            loadSheet(SHEETS.stasiun)

        ]);

        TARSUS.dataKA = dataKA;
        TARSUS.dataTarif = dataTarif;
        TARSUS.dataStasiun = dataStasiun;

        TARSUS.ready = true;

        buildStationList();

        setStatus(
            "Database siap"
        );

        console.log(
            "TARSUS DATABASE READY"
        );

        console.log(
            "MASTER_KA:",
            dataKA.length
        );

        console.log(
            "MASTER_TARIF:",
            dataTarif.length
        );

        console.log(
            "MASTER_STASIUN:",
            dataStasiun.length
        );

    } catch (error) {

        console.error(
            "TARSUS ERROR:",
            error
        );

        TARSUS.ready = false;

        setStatus(
            "Database gagal dimuat"
        );

        const results =
            document.getElementById(
                "results"
            );

        if (results) {

            results.innerHTML = `
                <div class="empty">
                    <strong>Database tidak dapat dimuat.</strong>
                    <br><br>
                    Pastikan Google Sheet dapat diakses publik
                    sebagai Viewer.
                    <br><br>
                    <small>
                    ${error.message}
                    </small>
                </div>
            `;

        }

    }

}


/* =========================================================
   MEMBUAT DAFTAR STASIUN
   ========================================================= */

function getStationName(row) {

    return String(
        getValue(row, [
            "nama",
            "namastasiun",
            "stasiun",
            "station",
            "stationname"
        ])
    ).trim();

}


function buildStationList() {

    const names = [];

    TARSUS.dataStasiun.forEach(row => {

        const name =
            getStationName(row);

        if (name) {
            names.push(name);
        }

    });

    /*
     * Jika MASTER_STASIUN kosong/tidak terbaca,
     * coba ambil nama stasiun dari MASTER_KA.
     */

    if (names.length === 0) {

        TARSUS.dataKA.forEach(row => {

            const name =
                String(
                    getValue(row, [
                        "stasiun",
                        "namastasiun",
                        "station",
                        "stationname",
                        "asal",
                        "tujuan"
                    ])
                ).trim();

            if (name) {
                names.push(name);
            }

        });

    }

    const unique =
        [...new Set(
            names
                .filter(Boolean)
                .sort((a, b) =>
                    a.localeCompare(
                        b,
                        "id"
                    )
                )
        )];

    TARSUS.stationList = unique;

    console.log(
        "Jumlah stasiun:",
        unique.length
    );

}


/* =========================================================
   AUTOCOMPLETE STASIUN
   ========================================================= */

function setupStationInput(
    inputId,
    suggestionId,
    type
) {

    const input =
        document.getElementById(
            inputId
        );

    const box =
        document.getElementById(
            suggestionId
        );

    if (!input || !box) {
        return;
    }

    input.addEventListener(
        "input",
        function () {

            const keyword =
                normalizeText(
                    input.value
                );

            box.innerHTML = "";

            if (!keyword) {

                box.classList.remove(
                    "show"
                );

                return;

            }

            const matches =
                (TARSUS.stationList || [])
                    .filter(name =>
                        normalizeText(name)
                            .includes(keyword)
                    )
                    .slice(0, 10);

            if (matches.length === 0) {

                box.classList.remove(
                    "show"
                );

                return;

            }

            matches.forEach(name => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "suggestion-item";

                item.textContent =
                    name;

                item.addEventListener(
                    "click",
                    function () {

                        input.value =
                            name;

                        box.innerHTML = "";

                        box.classList.remove(
                            "show"
                        );

                    }
                );

                box.appendChild(item);

            });

            box.classList.add(
                "show"
            );

        }
    );

}


/* =========================================================
   SETUP INPUT
   ========================================================= */

function setupTarsusUI() {

    setupStationInput(
        "asal",
        "asal-suggestions",
        "asal"
    );

    setupStationInput(
        "tujuan",
        "tujuan-suggestions",
        "tujuan"
    );


    const asal =
        document.getElementById(
            "asal"
        );

    const tujuan =
        document.getElementById(
            "tujuan"
        );


    if (asal) {

        asal.addEventListener(
            "focus",
            function () {

                if (
                    asal.value &&
                    TARSUS.stationList
                ) {

                    asal.dispatchEvent(
                        new Event(
                            "input"
                        )
                    );

                }

            }
        );

    }


    if (tujuan) {

        tujuan.addEventListener(
            "focus",
            function () {

                if (
                    tujuan.value &&
                    TARSUS.stationList
                ) {

                    tujuan.dispatchEvent(
                        new Event(
                            "input"
                        )
                    );

                }

            }
        );

    }


    /*
     * TOMBOL SWAP
     */

    const swap =
        document.getElementById(
            "swapBtn"
        );

    if (swap) {

        swap.addEventListener(
            "click",
            function () {

                const temp =
                    asal.value;

                asal.value =
                    tujuan.value;

                tujuan.value =
                    temp;

                const asalEvent =
                    new Event("input");

                const tujuanEvent =
                    new Event("input");

                asal.dispatchEvent(
                    asalEvent
                );

                tujuan.dispatchEvent(
                    tujuanEvent
                );

            }
        );

    }


    /*
     * TOMBOL CARI
     */

    const search =
        document.getElementById(
            "searchBtn"
        );

    if (search) {

        search.addEventListener(
            "click",
            searchTarif
        );

    }

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(message) {

    const status =
        document.getElementById(
            "status"
        );

    if (status) {
        status.textContent =
            message;
    }

}


/* =========================================================
   CARI TARIF
   ========================================================= */

function searchTarif() {

    const asalInput =
        document.getElementById(
            "asal"
        );

    const tujuanInput =
        document.getElementById(
            "tujuan"
        );

    const results =
        document.getElementById(
            "results"
        );


    if (
        !asalInput ||
        !tujuanInput ||
        !results
    ) {

        console.error(
            "Elemen TARSUS tidak ditemukan."
        );

        return;

    }


    const asal =
        asalInput.value.trim();

    const tujuan =
        tujuanInput.value.trim();


    if (!asal || !tujuan) {

        results.innerHTML = `
            <div class="empty">
                Silakan isi stasiun asal
                dan tujuan terlebih dahulu.
            </div>
        `;

        return;

    }


    if (
        normalizeText(asal) ===
        normalizeText(tujuan)
    ) {

        results.innerHTML = `
            <div class="empty">
                Stasiun asal dan tujuan
                tidak boleh sama.
            </div>
        `;

        return;

    }


    if (!TARSUS.ready) {

        results.innerHTML = `
            <div class="empty">
                Database masih dimuat.
                Silakan tunggu sebentar.
            </div>
        `;

        return;

    }


    setStatus(
        "Mencari tarif..."
    );


    /*
     * CARI DATA TARIF
     */

    const matches =
        TARSUS.dataTarif.filter(
            row => {

                const rowAsal =
                    String(
                        getValue(row, [
                            "asal",
                            "stasiunasal",
                            "stasiunasal",
                            "from",
                            "origin"
                        ])
                    ).trim();

                const rowTujuan =
                    String(
                        getValue(row, [
                            "tujuan",
                            "stasiuntujuan",
                            "stasiuntujuan",
                            "to",
                            "destination"
                        ])
                    ).trim();


                const a =
                    normalizeText(
                        rowAsal
                    );

                const b =
                    normalizeText(
                        rowTujuan
                    );

                const x =
                    normalizeText(
                        asal
                    );

                const y =
                    normalizeText(
                        tujuan
                    );


                /*
                 * Tarif berlaku dua arah
                 */

                return (
                    (a === x && b === y) ||
                    (a === y && b === x)
                );

            }
        );


    renderResults(
        matches,
        asal,
        tujuan
    );


    setStatus(
        matches.length
            ? `${matches.length} tarif ditemukan`
            : "Tidak ada tarif khusus"
    );

}


/* =========================================================
   TAMPILKAN HASIL
   ========================================================= */

function renderResults(
    matches,
    asal,
    tujuan
) {

    const results =
        document.getElementById(
            "results"
        );


    if (!results) {
        return;
    }


    if (!matches.length) {

        results.innerHTML = `
            <div class="empty">
                <div style="font-size:30px;margin-bottom:8px;">
                    ⌕
                </div>

                <strong>
                    Tarif khusus tidak ditemukan
                </strong>

                <br>

                <span>
                    ${asal} → ${tujuan}
                </span>
            </div>
        `;

        return;

    }


    results.innerHTML =
        matches.map(
            (row, index) => {

                const kereta =
                    getValue(row, [
                        "kereta",
                        "nama",
                        "namakereta",
                        "ka",
                        "train",
                        "trainname"
                    ]);


                const kelas =
                    getValue(row, [
                        "kelas",
                        "class",
                        "jenis"
                    ]);


                const tarif =
                    getValue(row, [
                        "tarif",
                        "harga",
                        "price",
                        "fare"
                    ]);


                const rowAsal =
                    getValue(row, [
                        "asal",
                        "stasiunasal",
                        "stasiunasal",
                        "from",
                        "origin"
                    ]);


                const rowTujuan =
                    getValue(row, [
                        "tujuan",
                        "stasiuntujuan",
                        "stasiuntujuan",
                        "to",
                        "destination"
                    ]);


                return `
                    <div
                        class="result-card"
                        style="animation-delay:${index * 40}ms"
                    >

                        <div class="result-main">

                            <div class="result-train">
                                ${kereta || "Kereta"}
                            </div>

                            <div class="result-route">
                                ${rowAsal || asal}
                                <span>→</span>
                                ${rowTujuan || tujuan}
                            </div>

                        </div>


                        <div class="result-detail">

                            <div class="result-class">
                                ${kelas || "-"}
                            </div>

                            <div class="result-price">
                                ${formatRupiah(tarif)}
                            </div>

                        </div>

                    </div>
                `;

            }
        ).join("");

}


/* =========================================================
   JALANKAN TARSUS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupTarsusUI();

        loadTarsusData();

    }
);
