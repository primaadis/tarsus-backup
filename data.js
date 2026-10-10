/* =========================================================
   TARSUS FINDER — DATA ENGINE
   PART 1/3

   DATABASE:
   1. MASTER_KA
   2. MASTER_TARIF
   3. MASTER_STASIUN

   TUGAS:
   - Mengambil data Google Sheets
   - Memproses CSV
   - Menyiapkan data KA, tarif, dan stasiun
   - Menyediakan API untuk app.js

   Catatan:
   File ini tidak mengatur tampilan HTML.
   ========================================================= */


/* =========================================================
   1. GOOGLE SHEETS CONFIGURATION
========================================================= */

const TARSUS_SHEET_ID =
    "1a4Ln_wASazV35F2M3MKZcJHEmiAV8G-0WmkMmU4Csls";

const TARSUS_SHEETS = {
    ka: "MASTER_KA",
    tarif: "MASTER_TARIF",
    stasiun: "MASTER_STASIUN"
};


/* =========================================================
   2. DATA STORAGE
========================================================= */

let MASTER_KA = [];
let MASTER_TARIF = [];
let MASTER_STASIUN = [];

let TARSUS_IS_LOADED = false;
let TARSUS_LOAD_PROMISE = null;


/* =========================================================
   3. BASIC UTILITIES
========================================================= */

/*
   Membersihkan teks.
*/

function clean(value) {
    return String(value ?? "")
        .replace(/\uFEFF/g, "")
        .replace(/\u00A0/g, " ")
        .trim();
}


/*
   Normalisasi teks untuk pencarian.

   Contoh:
   "Cirebon Kejaksan"
   " cirebon   kejaksan "

   Akan dianggap sama.
*/

function normalize(value) {
    return clean(value)
        .toLocaleLowerCase("id-ID")
        .replace(/\s+/g, " ");
}


/*
   Escape HTML agar teks dari spreadsheet
   tidak dibaca sebagai markup HTML.
*/

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*
   Escape atribut HTML.
*/

function escapeAttr(value) {
    return escapeHTML(value);
}


/*
   Pemeriksaan status aktif.

   Status kosong dianggap aktif agar data lama
   tidak langsung hilang dari pencarian.
*/

function isActiveStatus(value) {
    const status = normalize(value);

    if (status === "") {
        return true;
    }

    return [
        "ya",
        "aktif",
        "active",
        "yes",
        "1",
        "true"
    ].includes(status);
}


/* =========================================================
   4. CSV PARSER
========================================================= */

/*
   Membaca CSV dengan dukungan:
   - Koma di dalam tanda kutip
   - Tanda kutip ganda
   - Baris baru
   - Baris kosong

   Data Google Sheets dibaca sebagai CSV.
*/

function parseCSV(text) {
    const rows = [];

    let row = [];
    let cell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const next = text[i + 1];

        /*
           Tanda kutip ganda di dalam sel.
        */

        if (
            char === '"' &&
            insideQuotes &&
            next === '"'
        ) {
            cell += '"';
            i++;
            continue;
        }

        /*
           Membuka atau menutup kutipan.
        */

        if (char === '"') {
            insideQuotes = !insideQuotes;
            continue;
        }

        /*
           Pemisah kolom.
        */

        if (char === "," && !insideQuotes) {
            row.push(cell);
            cell = "";
            continue;
        }

        /*
           Pemisah baris.
        */

        if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {
            if (char === "\r" && next === "\n") {
                i++;
            }

            row.push(cell);

            if (
                row.some(item => clean(item) !== "")
            ) {
                rows.push(row);
            }

            row = [];
            cell = "";

            continue;
        }

        cell += char;
    }

    /*
       Memasukkan baris terakhir.
    */

    row.push(cell);

    if (
        row.some(item => clean(item) !== "")
    ) {
        rows.push(row);
    }

    return rows;
}


/* =========================================================
   5. CSV TO OBJECT
========================================================= */

/*
   Mengubah CSV menjadi array object.

   Contoh header:
   ID_KA,NAMA_KA,AKTIF

   Menjadi:
   {
       ID_KA: "...",
       NAMA_KA: "...",
       AKTIF: "..."
   }
*/

function rowsToObjects(rows) {
    if (!rows || rows.length < 2) {
        return [];
    }

    const headers = rows[0].map(header =>
        clean(header)
    );

    return rows.slice(1).map(row => {
        const object = {};

        headers.forEach((header, index) => {
            if (!header) {
                return;
            }

            object[header] = clean(
                row[index] ?? ""
            );
        });

        return object;
    });
}


/* =========================================================
   6. GOOGLE SHEETS LOADER
========================================================= */

async function loadGoogleSheet(sheetName) {
    const url =
        "https://docs.google.com/spreadsheets/d/" +
        TARSUS_SHEET_ID +
        "/gviz/tq?tqx=out:csv&sheet=" +
        encodeURIComponent(sheetName);

    const response = await fetch(url, {
        method: "GET",
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(
            "Gagal memuat sheet " +
            sheetName +
            ". HTTP " +
            response.status
        );
    }

    const csv = await response.text();

    /*
       Google Sheets terkadang mengembalikan
       halaman error dalam bentuk HTML.

       Pemeriksaan ini membantu memberikan
       pesan kesalahan yang lebih jelas.
    */

    if (
        /<html[\s>]/i.test(csv) &&
        /<body[\s>]/i.test(csv)
    ) {
        throw new Error(
            "Sheet " +
            sheetName +
            " tidak dapat dibaca. " +
            "Periksa izin akses Google Sheets."
        );
    }

    return csv;
}


/* =========================================================
   7. PARSE FARE
========================================================= */

/*
   Mengubah nominal tarif menjadi angka.

   Contoh:
   "Rp 150.000" -> 150000
   "150000"     -> 150000
   "-"          -> null

   Kolom tarif diasumsikan berisi rupiah bulat.
*/

function parseFare(value) {
    const raw = clean(value);

    if (
        raw === "" ||
        raw === "-" ||
        raw === "—" ||
        normalize(raw) === "null"
    ) {
        return null;
    }

    const numberText = raw
        .replace(/rp/gi, "")
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(/,/g, "");

    if (!/^-?\d+$/.test(numberText)) {
        return null;
    }

    const number = Number(numberText);

    return Number.isSafeInteger(number)
        ? number
        : null;
}


/* =========================================================
   8. FORMAT RUPIAH
========================================================= */

function formatRupiah(value) {
    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(value)
    ) {
        return "—";
    }

    return "Rp " +
        new Intl.NumberFormat("id-ID", {
            maximumFractionDigits: 0
        }).format(value);
}


/* =========================================================
   AKHIR PART 1/3
   Lanjutkan dengan PART 2/3.
========================================================= */
/* =========================================================
   TARSUS FINDER — DATA ENGINE
   PART 2/3

   - Parser MASTER_KA
   - Parser MASTER_STASIUN
   - Parser MASTER_TARIF
   - Pemeriksaan status
   - Pencocokan relasi
   - Penentuan tarif utama
   ========================================================= */


/* =========================================================
   9. PARSE MASTER_KA
========================================================= */

function parseMasterKA(csv) {
    const objects = rowsToObjects(
        parseCSV(csv)
    );

    return objects
        .filter(row =>
            clean(row.ID_KA) !== ""
        )
        .map(row => ({
            idKA: clean(row.ID_KA),
            namaKA: clean(row.NAMA_KA),
            aktif: clean(row.AKTIF)
        }));
}


/* =========================================================
   10. PARSE MASTER_STASIUN
========================================================= */

function parseMasterStasiun(csv) {
    const objects = rowsToObjects(
        parseCSV(csv)
    );

    return objects
        .filter(row =>
            clean(row.ID_STASIUN) !== "" &&
            clean(row.NAMA_STASIUN) !== ""
        )
        .map(row => ({
            idStasiun: clean(row.ID_STASIUN),
            namaStasiun: clean(row.NAMA_STASIUN),
            daop: clean(row.DAOP_DIVRE),
            provinsi: clean(row.PROVINSI),
            aktif: clean(row.AKTIF)
        }));
}


/* =========================================================
   11. PARSE MASTER_TARIF
========================================================= */

function parseMasterTarif(csv) {
    const objects = rowsToObjects(
        parseCSV(csv)
    );

    return objects
        .filter(row =>
            clean(row.ID_TARIF) !== "" &&
            clean(row.ID_KA) !== ""
        )
        .map(row => {
            const stations = [];

            /*
               Relasi tarif menggunakan:
               STASIUN_1 sampai STASIUN_15.

               Urutan stasiun harus dipertahankan.
            */

            for (let i = 1; i <= 15; i++) {
                const station = clean(
                    row["STASIUN_" + i]
                );

                if (station !== "") {
                    stations.push(station);
                }
            }

            return {
                idTarif: clean(row.ID_TARIF),
                idKA: clean(row.ID_KA),

                arah: clean(row.ARAH).toUpperCase(),

                polaRelasi: clean(row.POLA_RELASI),

                stations,

                eks: parseFare(row.EKS),
                bis: parseFare(row.BIS),
                eko: parseFare(row.EKO),

                status: clean(row.STATUS)
            };
        });
}


/* =========================================================
   12. CHECK STATUS KA
========================================================= */

function isKAActive(idKA) {
    const ka = MASTER_KA.find(item =>
        normalize(item.idKA) === normalize(idKA)
    );

    /*
       Jika ID KA tidak ditemukan,
       jangan langsung membuang tarif.
    */

    if (!ka) {
        return true;
    }

    return isActiveStatus(ka.aktif);
}


/* =========================================================
   13. CHECK STATUS TARIF
========================================================= */

function isTarifActive(tarif) {
    return isActiveStatus(tarif.status);
}


/* =========================================================
   14. GET NAMA KA
========================================================= */

function getNamaKA(idKA) {
    const ka = MASTER_KA.find(item =>
        normalize(item.idKA) === normalize(idKA)
    );

    return ka && ka.namaKA
        ? ka.namaKA
        : idKA;
}


/* =========================================================
   15. GET LOWEST FARE
========================================================= */

function getLowestFare(tarif) {
    const fares = [
        tarif.eks,
        tarif.bis,
        tarif.eko
    ].filter(value =>
        value !== null &&
        value !== undefined &&
        Number.isFinite(value)
    );

    return fares.length
        ? Math.min(...fares)
        : Infinity;
}


/* =========================================================
   16. GET REFERENCE ROUTE
========================================================= */

/*
   Relasi tarif khusus ditampilkan menggunakan
   stasiun pertama dan terakhir.

   Contoh:
   Gambir → Jatinegara → Bekasi

   Acuan tarif:
   Gambir → Bekasi

   Daftar stasiun lengkap tetap disimpan
   untuk keperluan pencocokan perjalanan.
*/

function getReferenceRoute(tarif) {
    const stations = tarif.stations || [];

    if (stations.length < 2) {
        return [];
    }

    return [
        stations[0],
        stations[stations.length - 1]
    ];
}


/* =========================================================
   17. CHECK ROUND TRIP
========================================================= */

function isRoundTrip(tarif) {
    const arah = normalize(tarif.arah)
        .replace(/[_-]+/g, " ");

    const pola = normalize(tarif.polaRelasi)
        .replace(/[_-]+/g, " ");

    const value = arah + " " + pola;

    return (
        /\bpp\b/.test(value) ||
        value.includes("pulang pergi") ||
        value.includes("dua arah") ||
        value.includes("bolak balik") ||
        value.includes("round trip")
    );
}


/* =========================================================
   18. ROUTE MATCHING
========================================================= */

/*
   Ketentuan pencarian:

   1. Asal dan tujuan harus ditemukan
      di dalam urutan relasi tarif.

   2. Jika PP, perjalanan dapat cocok
      dalam kedua arah.

   3. Jika satu arah, urutan asal harus
      mendahului tujuan.

   4. Stasiun yang dimasukkan pengguna boleh
      berada di tengah relasi tarif.

   5. Hasil tetap menggunakan relasi tarif
      khusus lengkap sebagai acuan.
*/

function routeIsCovered(tarif, asal, tujuan) {
    const stations = tarif.stations || [];

    if (stations.length < 2) {
        return false;
    }

    const asalNorm = normalize(asal);
    const tujuanNorm = normalize(tujuan);

    const stationNorms = stations.map(
        station => normalize(station)
    );

    const asalIndex = stationNorms.indexOf(
        asalNorm
    );

    const tujuanIndex = stationNorms.indexOf(
        tujuanNorm
    );

    if (
        asalIndex === -1 ||
        tujuanIndex === -1
    ) {
        return false;
    }

    /*
       Asal dan tujuan tidak boleh stasiun sama.
    */

    if (asalIndex === tujuanIndex) {
        return false;
    }

    /*
       PP mengizinkan kedua arah.
    */

    if (isRoundTrip(tarif)) {
        return true;
    }

    /*
       Tarif satu arah mengikuti urutan relasi.
    */

    return asalIndex < tujuanIndex;
}


/* =========================================================
   19. CHECK FARE AVAILABILITY
========================================================= */

function hasAnyFare(tarif) {
    return [
        tarif.eks,
        tarif.bis,
        tarif.eko
    ].some(value =>
        value !== null &&
        value !== undefined &&
        Number.isFinite(value)
    );
}


/* =========================================================
   20. CREATE FARE OBJECT
========================================================= */

/*
   Menghasilkan objek tarif yang siap
   digunakan oleh app.js.

   Tampilan HTML dibuat oleh app.js,
   bukan oleh data.js.
*/

function createFareObject(tarif) {
    return {
        idTarif: tarif.idTarif,

        idKA: tarif.idKA,

        namaKA: getNamaKA(tarif.idKA),

        arah: tarif.arah,

        polaRelasi: tarif.polaRelasi,

        stations: [...tarif.stations],

        referenceRoute: getReferenceRoute(tarif),

        eks: tarif.eks,
        bis: tarif.bis,
        eko: tarif.eko,

        lowestFare: getLowestFare(tarif),

        roundTrip: isRoundTrip(tarif)
    };
}


/* =========================================================
   AKHIR PART 2/3
   Lanjutkan dengan PART 3/3.
========================================================= */
/* =========================================================
   TARSUS FINDER — DATA ENGINE
   PART 3/3

   - Pengelompokan hasil berdasarkan nama KA
   - Tarif utama dan alternatif
   - Pencarian tarif
   - Saran stasiun
   - Loader database
   - Public API untuk app.js
   ========================================================= */


/* =========================================================
   21. GROUP TARIFS BY TRAIN NAME
========================================================= */

function groupTarifsByKA(matches, asal, tujuan) {
    const grouped = new Map();

    matches.forEach(tarif => {
        const namaKA = getNamaKA(tarif.idKA);

        const key = normalize(namaKA);

        if (!grouped.has(key)) {
            grouped.set(key, {
                namaKA,
                idKA: tarif.idKA,
                tarifas: []
            });
        }

        const group = grouped.get(key);

        /*
           Hindari mengulang ID tarif yang sama.
        */

        const alreadyExists = group.tarifas.some(
            item =>
                normalize(item.idTarif) ===
                normalize(tarif.idTarif)
        );

        if (!alreadyExists) {
            group.tarifas.push(
                createFareObject(tarif)
            );
        }
    });

    /*
       Tarif termurah menjadi tarif utama.

       Tarif lainnya diurutkan dari yang
       termurah ke yang termahal.
    */

    const results = [];

    grouped.forEach(group => {
        group.tarifas.sort((a, b) => {
            return a.lowestFare - b.lowestFare;
        });

        const main = group.tarifas[0];

        const alternatives = group.tarifas.slice(1);

        results.push({
            namaKA: group.namaKA,

            idKA: group.idKA,

            asal,
            tujuan,

            main,

            alternatives,

            totalTarif: group.tarifas.length
        });
    });

    /*
       Urutan kartu hasil juga berdasarkan
       tarif utama yang paling murah.
    */

    results.sort((a, b) => {
        return (
            a.main.lowestFare -
            b.main.lowestFare
        );
    });

    return results;
}


/* =========================================================
   22. SEARCH TARIF
========================================================= */

function searchTarif(asal, tujuan) {
    const asalNorm = normalize(asal);
    const tujuanNorm = normalize(tujuan);

    if (!asalNorm || !tujuanNorm) {
        return [];
    }

    if (asalNorm === tujuanNorm) {
        return [];
    }

    /*
       Pastikan database sudah dimuat.
    */

    if (!TARSUS_IS_LOADED) {
        throw new Error(
            "Database belum selesai dimuat."
        );
    }

    /*
       Cari seluruh relasi yang sesuai.
    */

    const matches = MASTER_TARIF.filter(tarif => {
        if (!isTarifActive(tarif)) {
            return false;
        }

        if (!isKAActive(tarif.idKA)) {
            return false;
        }

        if (!hasAnyFare(tarif)) {
            return false;
        }

        return routeIsCovered(
            tarif,
            asal,
            tujuan
        );
    });

    /*
       Kelompokkan berdasarkan nama KA.

       Tarif dari beberapa ID KA yang memiliki
       nama sama akan masuk ke satu kelompok.
    */

    return groupTarifsByKA(
        matches,
        asal,
        tujuan
    );
}


/* =========================================================
   23. GET STATION SUGGESTIONS
========================================================= */

/*
   Digunakan oleh app.js untuk menampilkan
   saran stasiun saat pengguna mengetik.

   Contoh:
   input: "cire"

   hasil:
   Cirebon Kejaksan
   Cirebon Prujakan
*/

function getStationSuggestions(query, limit = 10) {
    const keyword = normalize(query);

    if (!keyword) {
        return [];
    }

    const maxResults = Math.max(
        1,
        Math.min(Number(limit) || 10, 50)
    );

    const activeStations = MASTER_STASIUN.filter(
        station => isActiveStatus(station.aktif)
    );

    const startsWith = [];
    const contains = [];

    activeStations.forEach(station => {
        const name = normalize(station.namaStasiun);

        if (name.startsWith(keyword)) {
            startsWith.push(station);
        } else if (name.includes(keyword)) {
            contains.push(station);
        }
    });

    /*
       Nama yang diawali kata pencarian
       ditampilkan terlebih dahulu.
    */

    return [
        ...startsWith,
        ...contains
    ]
        .slice(0, maxResults)
        .map(station => ({
            idStasiun: station.idStasiun,
            namaStasiun: station.namaStasiun,
            daop: station.daop,
            provinsi: station.provinsi
        }));
}


/* =========================================================
   24. GET ALL STATIONS
========================================================= */

function getAllStations() {
    return MASTER_STASIUN
        .filter(station =>
            isActiveStatus(station.aktif)
        )
        .map(station => ({
            idStasiun: station.idStasiun,
            namaStasiun: station.namaStasiun,
            daop: station.daop,
            provinsi: station.provinsi
        }));
}


/* =========================================================
   25. LOAD DATABASE
========================================================= */

/*
   Ketiga sheet dimuat secara paralel
   agar proses pengambilan data lebih efisien.

   Jika salah satu gagal dimuat, proses akan
   menampilkan error kepada app.js.
*/

async function loadTarsusDatabase() {
    if (TARSUS_IS_LOADED) {
        return getDatabaseInfo();
    }

    /*
       Mencegah pemanggilan berulang
       membuat beberapa permintaan sekaligus.
    */

    if (TARSUS_LOAD_PROMISE) {
        return TARSUS_LOAD_PROMISE;
    }

    TARSUS_LOAD_PROMISE = (async () => {
        try {
            const [
                csvKA,
                csvTarif,
                csvStasiun
            ] = await Promise.all([
                loadGoogleSheet(TARSUS_SHEETS.ka),
                loadGoogleSheet(TARSUS_SHEETS.tarif),
                loadGoogleSheet(TARSUS_SHEETS.stasiun)
            ]);

            /*
               Proses data setelah semua sheet
               berhasil diambil.
            */

            const dataKA = parseMasterKA(csvKA);

            const dataTarif = parseMasterTarif(
                csvTarif
            );

            const dataStasiun = parseMasterStasiun(
                csvStasiun
            );

            /*
               Pastikan database stasiun
               dan tarif tidak benar-benar kosong.
            */

            if (
                dataKA.length === 0 &&
                dataTarif.length === 0 &&
                dataStasiun.length === 0
            ) {
                throw new Error(
                    "Database kosong. " +
                    "Periksa nama sheet dan isi Google Sheets."
                );
            }

            MASTER_KA = dataKA;

            MASTER_TARIF = dataTarif;

            MASTER_STASIUN = dataStasiun;

            TARSUS_IS_LOADED = true;

            return getDatabaseInfo();

        } catch (error) {
            TARSUS_IS_LOADED = false;

            console.error(
                "[TARSUS] Gagal memuat database:",
                error
            );

            throw error;

        } finally {
            TARSUS_LOAD_PROMISE = null;
        }
    })();

    return TARSUS_LOAD_PROMISE;
}


/* =========================================================
   26. DATABASE INFORMATION
========================================================= */

function getDatabaseInfo() {
    return {
        loaded: TARSUS_IS_LOADED,

        totalKA: MASTER_KA.length,

        totalTarif: MASTER_TARIF.length,

        totalStasiun: MASTER_STASIUN.length
    };
}


/* =========================================================
   27. PUBLIC API
========================================================= */

/*
   app.js menggunakan API ini.

   Contoh:

   await TARSUS_DATA.load();

   const hasil = TARSUS_DATA.search(
       "Cirebon Kejaksan",
       "Solo Balapan"
   );

   const stasiun = TARSUS_DATA.suggestions(
       "cire"
   );
*/

window.TARSUS_DATA = Object.freeze({
    load: loadTarsusDatabase,

    search: searchTarif,

    suggestions: getStationSuggestions,

    stations: getAllStations,

    formatRupiah,

    escapeHTML,

    escapeAttr,

    getReferenceRoute,

    getLowestFare,

    getInfo: getDatabaseInfo
});


/* =========================================================
   END OF TARSUS DATA ENGINE
========================================================= */
