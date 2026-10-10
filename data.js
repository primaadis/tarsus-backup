/* =========================================
   TARSUS FINDER
   PART 10/10 — DATA ENGINE
========================================= */

"use strict";

/*
  FORMAT DATA:

  Tambahkan data tarif ke TARSUS_DATA.

  Fare menggunakan angka rupiah.
  Gunakan null jika kelas tidak tersedia.

  direction:
  - "Pulang-pergi"
  - "Hanya berangkat"

  route:
  Urutan stasiun yang dilalui kereta.

  specialRelation:
  Relasi tarif khusus yang berlaku.
*/

window.TARSUS_DATA = window.TARSUS_DATA || [];

function normalizeStation(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function parseStationList(value) {
  if (Array.isArray(value)) {
    return value
      .map((station) => String(station).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\s*(?:–|—|->|→|\|)\s*|\s*;\s*/)
      .map((station) => station.trim())
      .filter(Boolean);
  }

  return [];
}

function parseFare(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  const cleaned = String(value).replace(/[^\d]/g, "");

  if (!cleaned) {
    return null;
  }

  const result = Number(cleaned);

  return Number.isFinite(result) ? result : null;
}

/*
  Mendapatkan daftar nama stasiun unik
  dari rute dan relasi khusus.
*/
window.getTarsusStations = function () {
  const stations = new Map();

  window.TARSUS_DATA.forEach((item) => {
    const route = parseStationList(item.route);
    const relation = parseStationList(item.specialRelation);

    [...route, ...relation].forEach((station) => {
      const key = normalizeStation(station);

      if (key && !stations.has(key)) {
        stations.set(key, station);
      }
    });
  });

  return [...stations.values()].sort((a, b) =>
    a.localeCompare(b, "id")
  );
};

/*
  Pencarian relasi tarif khusus.

  Kriteria:
  1. Stasiun asal dan tujuan harus ada dalam relasi khusus.
  2. Urutan stasiun harus cocok dengan arah perjalanan.
  3. Untuk tarif satu arah, pencarian arah sebaliknya ditolak.
  4. Hasil menampilkan relasi tarif khusus lengkap.
*/
window.searchSpecialTariffs = async function (origin, destination) {
  const from = normalizeStation(origin);
  const to = normalizeStation(destination);

  if (!from || !to || from === to) {
    return [];
  }

  const results = [];

  for (const item of window.TARSUS_DATA) {
    const special = parseStationList(item.specialRelation);
    const route = parseStationList(item.route);

    const specialNormalized = special.map(normalizeStation);
    const routeNormalized = route.map(normalizeStation);

    const specialFrom = specialNormalized.indexOf(from);
    const specialTo = specialNormalized.indexOf(to);

    if (specialFrom === -1 || specialTo === -1) {
      continue;
    }

    const directionText = normalizeStation(item.direction || "Pulang-pergi");

    const oneWay =
      directionText.includes("hanya berangkat") ||
      directionText.includes("satu arah") ||
      directionText.includes("one way");

    const forward = specialFrom < specialTo;

    if (!forward && oneWay) {
      continue;
    }

    /*
      Jika rute lengkap tersedia, pastikan urutan stasiun
      juga konsisten dengan rute perjalanan.
    */
    const routeFrom = routeNormalized.indexOf(from);
    const routeTo = routeNormalized.indexOf(to);

    if (
      route.length &&
      routeFrom !== -1 &&
      routeTo !== -1 &&
      routeFrom >= routeTo
    ) {
      if (oneWay) {
        continue;
      }
    }

    results.push({
      trainName: item.trainName || item.namaKA || "Nama kereta tidak tersedia",

      trainNumber: item.trainNumber || item.nomorKA || "",

      specialRelation: Array.isArray(item.specialRelation)
        ? item.specialRelation.join(" – ")
        : String(item.specialRelation || ""),

      direction: oneWay ? "Hanya berangkat" : "Pulang-pergi",

      fares: {
        executive: parseFare(
          item.fares?.executive ??
          item.eksekutif ??
          item.eks
        ),

        business: parseFare(
          item.fares?.business ??
          item.bisnis
        ),

        economy: parseFare(
          item.fares?.economy ??
          item.ekonomi ??
          item.eko
        )
      },

      note: item.note || item.catatan || ""
    });
  }

  return results;
};

/*
  CONTOH DATA UNTUK TES

  Aktifkan dengan mengisi TARSUS_DATA di bawah.
  Hapus contoh ini jika ingin memasukkan data asli.

  Catatan:
  Data berikut hanya contoh format, bukan tarif resmi.
*/

if (window.TARSUS_DATA.length === 0) {
  window.TARSUS_DATA.push({
    trainName: "Contoh KA",

    trainNumber: "",

    route: [
      "Cirebon Kejaksan",
      "Tegal",
      "Semarang Tawang",
      "Solo Balapan"
    ],

    specialRelation: [
      "Cirebon Kejaksan",
      "Tegal",
      "Semarang Tawang",
      "Solo Balapan"
    ],

    direction: "Pulang-pergi",

    fares: {
      executive: 100000,
      business: null,
      economy: 50000
    },

    note: "DATA CONTOH — ganti dengan data tarif yang telah diverifikasi."
  });
         }
