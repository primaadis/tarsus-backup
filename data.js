/* =========================================================
   TARSUS FINDER — DATA ENGINE
   Google Sheets: MASTER_KA, MASTER_TARIF, MASTER_STASIUN
   Mesin data dipisahkan dari tampilan aplikasi.
========================================================= */
"use strict";

const TARSUS_SHEET_ID = "1a4Ln_wASazV35F2M3MKZcJHEmiAV8G-0WmkMmU4Csls";
const TARSUS_SHEETS = { ka: "MASTER_KA", tarif: "MASTER_TARIF", stasiun: "MASTER_STASIUN" };
let MASTER_KA = [], MASTER_TARIF = [], MASTER_STASIUN = [];
let TARSUS_IS_LOADED = false, TARSUS_LOAD_PROMISE = null;

function clean(value) { return String(value ?? "").replace(/\uFEFF/g, "").replace(/\u00A0/g, " ").trim(); }
function normalize(value) { return clean(value).toLocaleLowerCase("id-ID").replace(/\s+/g, " "); }
function escapeHTML(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
function escapeAttr(value) { return escapeHTML(value); }
function isActiveStatus(value) { const status = normalize(value); if (!status) return true; return ["ya", "aktif", "active", "yes", "1", "true"].includes(status); }

/* CSV parser: mendukung koma di dalam kutipan, kutipan ganda, CRLF, dan baris kosong. */
function parseCSV(text) {
  const rows = []; let row = [], cell = "", insideQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i], next = text[i + 1];
    if (char === '"' && insideQuotes && next === '"') { cell += '"'; i++; continue; }
    if (char === '"') { insideQuotes = !insideQuotes; continue; }
    if (char === "," && !insideQuotes) { row.push(cell); cell = ""; continue; }
    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell); if (row.some(item => clean(item) !== "")) rows.push(row);
      row = []; cell = ""; continue;
    }
    cell += char;
  }
  row.push(cell); if (row.some(item => clean(item) !== "")) rows.push(row); return rows;
}
function rowsToObjects(rows) {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0].map(clean);
  return rows.slice(1).map(row => { const object = {}; headers.forEach((header, index) => { if (header) object[header] = clean(row[index] ?? ""); }); return object; });
}
async function loadGoogleSheet(sheetName) {
  const url = "https://docs.google.com/spreadsheets/d/" + TARSUS_SHEET_ID + "/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent(sheetName);
  const response = await fetch(url, { method: "GET", cache: "no-store" });
  if (!response.ok) throw new Error(`Gagal memuat sheet ${sheetName}. HTTP ${response.status}`);
  const csv = await response.text();
  if (/<html[\s>]/i.test(csv) && /<body[\s>]/i.test(csv)) throw new Error(`Sheet ${sheetName} tidak dapat dibaca. Periksa izin akses Google Sheets.`);
  return csv;
}
function parseFare(value) {
  const raw = clean(value);
  if (!raw || raw === "-" || raw === "—" || normalize(raw) === "null") return null;
  const numberText = raw.replace(/rp/gi, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, "");
  if (!/^-?\d+$/.test(numberText)) return null;
  const number = Number(numberText); return Number.isSafeInteger(number) ? number : null;
}
function formatRupiah(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);
}
function parseMasterKA(csv) {
  return rowsToObjects(parseCSV(csv)).filter(row => clean(row.ID_KA) !== "").map(row => ({ idKA: clean(row.ID_KA), namaKA: clean(row.NAMA_KA), aktif: clean(row.AKTIF) }));
}
function parseMasterStasiun(csv) {
  return rowsToObjects(parseCSV(csv)).filter(row => clean(row.ID_STASIUN) && clean(row.NAMA_STASIUN)).map(row => ({ idStasiun: clean(row.ID_STASIUN), namaStasiun: clean(row.NAMA_STASIUN), daop: clean(row.DAOP_DIVRE), provinsi: clean(row.PROVINSI), aktif: clean(row.AKTIF) }));
}
function parseMasterTarif(csv) {
  return rowsToObjects(parseCSV(csv)).filter(row => clean(row.ID_TARIF) && clean(row.ID_KA)).map(row => {
    const stations = [];
    for (let i = 1; i <= 15; i++) { const station = clean(row["STASIUN_" + i]); if (station) stations.push(station); }
    return { idTarif: clean(row.ID_TARIF), idKA: clean(row.ID_KA), arah: clean(row.ARAH).toUpperCase(), polaRelasi: clean(row.POLA_RELASI), stations, eks: parseFare(row.EKS), bis: parseFare(row.BIS), eko: parseFare(row.EKO), status: clean(row.STATUS) };
  });
}
function isKAActive(idKA) { const ka = MASTER_KA.find(item => normalize(item.idKA) === normalize(idKA)); return ka ? isActiveStatus(ka.aktif) : true; }
function isTarifActive(tarif) { return isActiveStatus(tarif.status); }
function getNamaKA(idKA) { const ka = MASTER_KA.find(item => normalize(item.idKA) === normalize(idKA)); return ka && ka.namaKA ? ka.namaKA : idKA; }
function getLowestFare(tarif) { const fares = [tarif.eks, tarif.bis, tarif.eko].filter(value => value !== null && value !== undefined && Number.isFinite(value)); return fares.length ? Math.min(...fares) : Infinity; }
function getReferenceRoute(tarif) { const stations = tarif.stations || []; return stations.length < 2 ? [] : [stations[0], stations[stations.length - 1]]; }
function isRoundTrip(tarif) {
  const arah = normalize(tarif.arah).replace(/[_-]+/g, " "), pola = normalize(tarif.polaRelasi).replace(/[_-]+/g, " "), value = arah + " " + pola;
  return /\bpp\b/.test(value) || value.includes("pulang pergi") || value.includes("dua arah") || value.includes("bolak balik") || value.includes("round trip");
}
function routeIsCovered(tarif, asal, tujuan) {
  const stations = tarif.stations || []; if (stations.length < 2) return false;
  const asalIndex = stations.map(normalize).indexOf(normalize(asal)), tujuanIndex = stations.map(normalize).indexOf(normalize(tujuan));
  if (asalIndex === -1 || tujuanIndex === -1 || asalIndex === tujuanIndex) return false;
  return isRoundTrip(tarif) ? true : asalIndex < tujuanIndex;
}
function hasAnyFare(tarif) { return [tarif.eks, tarif.bis, tarif.eko].some(value => value !== null && value !== undefined && Number.isFinite(value)); }
function createFareObject(tarif) {
  return { idTarif: tarif.idTarif, idKA: tarif.idKA, namaKA: getNamaKA(tarif.idKA), arah: tarif.arah, polaRelasi: tarif.polaRelasi, stations: [...tarif.stations], referenceRoute: getReferenceRoute(tarif), eks: tarif.eks, bis: tarif.bis, eko: tarif.eko, lowestFare: getLowestFare(tarif), roundTrip: isRoundTrip(tarif) };
}
function groupTarifsByKA(matches, asal, tujuan) {
  const grouped = new Map();
  matches.forEach(tarif => {
    const namaKA = getNamaKA(tarif.idKA), key = normalize(namaKA);
    if (!grouped.has(key)) grouped.set(key, { namaKA, idKA: tarif.idKA, tarifas: [] });
    const group = grouped.get(key);
    if (!group.tarifas.some(item => normalize(item.idTarif) === normalize(tarif.idTarif))) group.tarifas.push(createFareObject(tarif));
  });
  const results = [];
  grouped.forEach(group => {
    group.tarifas.sort((a, b) => a.lowestFare - b.lowestFare);
    results.push({ namaKA: group.namaKA, idKA: group.idKA, asal, tujuan, main: group.tarifas[0], alternatives: group.tarifas.slice(1), totalTarif: group.tarifas.length });
  });
  results.sort((a, b) => a.main.lowestFare - b.main.lowestFare); return results;
}
function searchTarif(asal, tujuan) {
  const asalNorm = normalize(asal), tujuanNorm = normalize(tujuan); if (!asalNorm || !tujuanNorm || asalNorm === tujuanNorm) return [];
  if (!TARSUS_IS_LOADED) throw new Error("Database belum selesai dimuat.");
  const matches = MASTER_TARIF.filter(tarif => isTarifActive(tarif) && isKAActive(tarif.idKA) && hasAnyFare(tarif) && routeIsCovered(tarif, asal, tujuan));
  return groupTarifsByKA(matches, asal, tujuan);
}
function getStationSuggestions(query, limit = 10) {
  const keyword = normalize(query); if (!keyword) return [];
  const maxResults = Math.max(1, Math.min(Number(limit) || 10, 50));
  const activeStations = MASTER_STASIUN.filter(station => isActiveStatus(station.aktif)); const startsWith = [], contains = [];
  activeStations.forEach(station => { const name = normalize(station.namaStasiun); if (name.startsWith(keyword)) startsWith.push(station); else if (name.includes(keyword)) contains.push(station); });
  return [...startsWith, ...contains].slice(0, maxResults).map(station => ({ idStasiun: station.idStasiun, namaStasiun: station.namaStasiun, daop: station.daop, provinsi: station.provinsi }));
}
function getAllStations() { return MASTER_STASIUN.filter(station => isActiveStatus(station.aktif)).map(station => ({ idStasiun: station.idStasiun, namaStasiun: station.namaStasiun, daop: station.daop, provinsi: station.provinsi })); }
async function loadTarsusDatabase() {
  if (TARSUS_IS_LOADED) return getDatabaseInfo(); if (TARSUS_LOAD_PROMISE) return TARSUS_LOAD_PROMISE;
  TARSUS_LOAD_PROMISE = (async () => {
    try {
      const [csvKA, csvTarif, csvStasiun] = await Promise.all([loadGoogleSheet(TARSUS_SHEETS.ka), loadGoogleSheet(TARSUS_SHEETS.tarif), loadGoogleSheet(TARSUS_SHEETS.stasiun)]);
      const dataKA = parseMasterKA(csvKA), dataTarif = parseMasterTarif(csvTarif), dataStasiun = parseMasterStasiun(csvStasiun);
      if (dataKA.length === 0 && dataTarif.length === 0 && dataStasiun.length === 0) throw new Error("Database kosong. Periksa nama sheet dan isi Google Sheets.");
      MASTER_KA = dataKA; MASTER_TARIF = dataTarif; MASTER_STASIUN = dataStasiun; TARSUS_IS_LOADED = true; return getDatabaseInfo();
    } catch (error) { TARSUS_IS_LOADED = false; console.error("[TARSUS] Gagal memuat database:", error); throw error; }
    finally { TARSUS_LOAD_PROMISE = null; }
  })();
  return TARSUS_LOAD_PROMISE;
}
function getDatabaseInfo() { return { loaded: TARSUS_IS_LOADED, totalKA: MASTER_KA.length, totalTarif: MASTER_TARIF.length, totalStasiun: MASTER_STASIUN.length }; }
function getAllTrains() {
  if (!TARSUS_IS_LOADED) return [];
  // Satu nama kereta boleh mempunyai beberapa ID_KA. Satukan untuk paparan,
  // tetapi simpan semua ID agar seluruh relasi dari spreadsheet ikut terbaca.
  const byName = new Map();
  MASTER_TARIF.filter(tarif => isTarifActive(tarif) && isKAActive(tarif.idKA) && hasAnyFare(tarif)).forEach(tarif => {
    const name = getNamaKA(tarif.idKA), key = normalize(name);
    if (!byName.has(key)) byName.set(key, { key, idKA: tarif.idKA, idKAs: [], namaKA: name, totalRelasi: 0 });
    const group = byName.get(key);
    if (!group.idKAs.some(id => normalize(id) === normalize(tarif.idKA))) group.idKAs.push(tarif.idKA);
    group.totalRelasi++;
  });
  return [...byName.values()].sort((a, b) => a.namaKA.localeCompare(b.namaKA, "id"));
}
function getTarifsByTrain(idKAOrName) {
  if (!TARSUS_IS_LOADED) return [];
  const query = normalize(idKAOrName);
  const namedGroup = getAllTrains().find(train => train.key === query || normalize(train.namaKA) === query);
  const ids = namedGroup ? namedGroup.idKAs.map(normalize) : [query];
  return MASTER_TARIF.filter(tarif => ids.includes(normalize(tarif.idKA)) && isTarifActive(tarif) && isKAActive(tarif.idKA) && hasAnyFare(tarif))
    .map(createFareObject).sort((a, b) => a.lowestFare - b.lowestFare);
}
function getAllTarifs() {
  if (!TARSUS_IS_LOADED) return [];
  return MASTER_TARIF.filter(tarif => isTarifActive(tarif) && isKAActive(tarif.idKA) && hasAnyFare(tarif)).map(createFareObject);
}
window.TARSUS_DATA = Object.freeze({ load: loadTarsusDatabase, search: searchTarif, suggestions: getStationSuggestions, stations: getAllStations, trains: getAllTrains, tariffsByTrain: getTarifsByTrain, tariffs: getAllTarifs, formatRupiah, escapeHTML, escapeAttr, getReferenceRoute, getLowestFare, getInfo: getDatabaseInfo });
