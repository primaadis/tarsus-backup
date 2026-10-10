/* =========================================================
   TARSUS FINDER — APP ENGINE
   UI dan interaksi. Mesin data berada di data.js.
========================================================= */
"use strict";

const APP_VERSION = "1.0.0";
const APP_CONFIG = { introDuration: 1900, suggestionLimit: 8, searchDebounce: 120 };
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const DOM = {
  intro: $("#cinematicIntro"), app: $("#app"), sidebar: $("#sidebar"), sidebarBackdrop: $("#sidebarBackdrop"),
  openSidebar: $("#openSidebar"), closeSidebar: $("#closeSidebar"), themeToggle: $("#themeToggle"), themeIcon: $("#themeIcon"),
  breadcrumbCurrent: $("#breadcrumbCurrent"), searchForm: $("#searchForm"), origin: $("#origin"), destination: $("#destination"),
  originSuggestions: $("#originSuggestions"), destinationSuggestions: $("#destinationSuggestions"), clearOrigin: $("#clearOrigin"),
  clearDestination: $("#clearDestination"), swapStations: $("#swapStations"), resetSearch: $("#resetSearch"), searchButton: $("#searchButton"),
  searchMessage: $("#searchMessage"), resultsSection: $("#resultsSection"), results: $("#results"), resultsSummary: $("#resultsSummary"),
  resultsCount: $("#resultsCount"), appVersion: $("#appVersion"), footerVersion: $("#footerVersion"),
  footerVersionBottom: $("#footerVersionBottom"), toastContainer: $("#toastContainer")
};
const STATE = { databaseReady: false, searching: false, activePage: "search", searchRequest: 0, suggestionTimers: {}, toastTimers: new Set() };

function safeHTML(value) {
  if (window.TARSUS_DATA && typeof window.TARSUS_DATA.escapeHTML === "function") return window.TARSUS_DATA.escapeHTML(value);
  return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}
function initializeVersion() {
  [DOM.appVersion, DOM.footerVersion, DOM.footerVersionBottom].forEach(el => { if (el) el.textContent = "v" + APP_VERSION; });
}
function showToast(message, type = "info") {
  if (!DOM.toastContainer) { console.log("[TARSUS]", message); return; }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`; toast.setAttribute("role", "status");
  toast.innerHTML = `<span class="toast-indicator"></span><span class="toast-message">${safeHTML(message)}</span><button type="button" class="toast-close" aria-label="Tutup notifikasi">×</button>`;
  DOM.toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  let removed = false;
  const removeToast = () => { if (removed) return; removed = true; toast.classList.remove("show"); window.setTimeout(() => toast.remove(), 230); if (timer) { clearTimeout(timer); STATE.toastTimers.delete(timer); } };
  $(".toast-close", toast)?.addEventListener("click", removeToast);
  const timer = window.setTimeout(removeToast, 4200); STATE.toastTimers.add(timer);
}
function setSearchMessage(message, type = "info") {
  if (!DOM.searchMessage) return;
  DOM.searchMessage.textContent = message; DOM.searchMessage.className = `search-message message-${type}`; DOM.searchMessage.hidden = !message;
}
function setSearchLoading(loading) {
  STATE.searching = loading; if (!DOM.searchButton) return;
  DOM.searchButton.disabled = loading; DOM.searchButton.setAttribute("aria-busy", String(loading));
  const label = $(".submit-label", DOM.searchButton); if (label) label.textContent = loading ? "MEMERIKSA TARIF..." : "CARI TARIF KHUSUS";
}
function updateClearButtons() {
  if (DOM.clearOrigin && DOM.origin) DOM.clearOrigin.hidden = !DOM.origin.value.length;
  if (DOM.clearDestination && DOM.destination) DOM.clearDestination.hidden = !DOM.destination.value.length;
}
function renderEmptyResults(title = "Siap mencari tarif?", description = "Pilih stasiun asal dan tujuan, lalu tekan Cari Tarif Khusus.") {
  if (!DOM.results) return;
  DOM.results.innerHTML = `<div class="results-empty"><div class="empty-illustration"><div class="empty-rail empty-rail-one"></div><div class="empty-rail empty-rail-two"></div><div class="empty-station empty-station-one"></div><div class="empty-station empty-station-two"></div><div class="empty-center-mark">↗</div></div><div class="empty-title">${safeHTML(title)}</div><p class="empty-description">${safeHTML(description)}</p></div>`;
  if (DOM.resultsSummary) DOM.resultsSummary.textContent = "Hasil tarif akan ditampilkan di area ini.";
  if (DOM.resultsCount) DOM.resultsCount.innerHTML = "<span>—</span><small>HASIL</small>";
}
function renderRelation(stations) {
  if (!Array.isArray(stations) || !stations.length) return "—";
  return stations.map(station => safeHTML(station)).join('<span class="relation-arrow">→</span>');
}
function renderFare(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  if (window.TARSUS_DATA && typeof window.TARSUS_DATA.formatRupiah === "function") return window.TARSUS_DATA.formatRupiah(value);
  return "Rp " + new Intl.NumberFormat("id-ID").format(value);
}
function renderFareItem(label, value) {
  const unavailable = value === null || value === undefined || !Number.isFinite(value);
  return `<div class="fare-item"><span class="fare-class">${safeHTML(label)}</span><span class="fare-price ${unavailable ? "fare-unavailable" : ""}">${unavailable ? "—" : renderFare(value)}</span></div>`;
}
function renderTariffDetail(tarif, isMain = false) {
  const route = Array.isArray(tarif.referenceRoute) ? tarif.referenceRoute : [];
  return `<div class="tariff-detail ${isMain ? "tariff-main" : "tariff-alternative"}"><div class="reference-box"><div class="reference-label">${isMain ? "TARIF UTAMA" : "TARIF KHUSUS ALTERNATIF"}</div><div class="reference-route">${renderRelation(route)}</div></div><div class="fare-list">${renderFareItem("EKSEKUTIF", tarif.eks)}${renderFareItem("BISNIS", tarif.bis)}${renderFareItem("EKONOMI", tarif.eko)}</div><div class="tariff-meta"><span class="tariff-direction">${tarif.roundTrip ? "PULANG PERGI" : "SEARAH"}</span></div></div>`;
}
function renderResultCard(group, index) {
  const alternatives = Array.isArray(group.alternatives) ? group.alternatives : [];
  const alternativeHTML = alternatives.length ? `<details class="tariff-alternatives"><summary><span>Lihat ${alternatives.length} tarif khusus alternatif</span><span class="alternative-arrow">+</span></summary><div class="alternative-content">${alternatives.map(t => renderTariffDetail(t, false)).join("")}</div></details>` : `<div class="no-alternative">Tidak ada tarif alternatif lain untuk kelompok KA ini.</div>`;
  return `<article class="result-card grouped-result-card" id="result-${index}"><div class="result-card-top"><div class="result-train-symbol">T</div><div class="result-train-info"><div class="result-overline">HASIL PENCARIAN</div><h3 class="result-name">${safeHTML(group.namaKA)}</h3></div><div class="result-number">${String(index + 1).padStart(2,"0")}</div></div><div class="journey"><span class="journey-station">${safeHTML(group.asal)}</span><span class="journey-arrow">→</span><span class="journey-station">${safeHTML(group.tujuan)}</span></div>${renderTariffDetail(group.main, true)}${alternativeHTML}</article>`;
}
function renderResults(groups, asal, tujuan) {
  if (!DOM.results) return;
  if (!groups.length) {
    renderEmptyResults("Tarif belum ditemukan", "Tidak ditemukan relasi tarif yang cocok. Periksa kembali nama stasiun, arah perjalanan, dan data tarif.");
    if (DOM.resultsSummary) DOM.resultsSummary.textContent = `${asal} → ${tujuan}`;
    if (DOM.resultsCount) DOM.resultsCount.innerHTML = "<span>0</span><small>HASIL</small>";
    return;
  }
  DOM.results.innerHTML = groups.map(renderResultCard).join("");
  if (DOM.resultsSummary) DOM.resultsSummary.textContent = `${asal} → ${tujuan} · ${groups.length} kelompok KA ditemukan`;
  if (DOM.resultsCount) DOM.resultsCount.innerHTML = `<span>${groups.length}</span><small>HASIL</small>`;
  $$(".result-card", DOM.results).forEach((card, index) => { card.style.animationDelay = `${Math.min(index * 45, 270)}ms`; });
}
function hideSuggestions(container) { if (!container) return; container.hidden = true; container.innerHTML = ""; }
function renderStationSuggestions(input, container, query, fieldName) {
  if (!container || !input) return;
  const keyword = String(query ?? "").trim();
  if (!keyword || !STATE.databaseReady || !window.TARSUS_DATA) { hideSuggestions(container); return; }
  const suggestions = window.TARSUS_DATA.suggestions(keyword, APP_CONFIG.suggestionLimit);
  if (!suggestions.length) { container.innerHTML = '<div class="suggestion-empty">Stasiun tidak ditemukan.</div>'; container.hidden = false; return; }
  container.innerHTML = suggestions.map(station => `<button type="button" class="suggestion-item" data-station-name="${safeHTML(station.namaStasiun)}" data-station-field="${fieldName}" role="option" aria-selected="false"><span class="suggestion-name">${safeHTML(station.namaStasiun)}</span><span class="suggestion-arrow" aria-hidden="true"></span></button>`).join("");
  container.hidden = false;
}
function selectStation(name, fieldName) {
  const origin = fieldName === "origin", input = origin ? DOM.origin : DOM.destination, container = origin ? DOM.originSuggestions : DOM.destinationSuggestions;
  if (!input) return; input.value = name; hideSuggestions(container); updateClearButtons(); input.focus();
}
function setupSuggestionClick(container) {
  container?.addEventListener("click", event => { const button = event.target.closest("[data-station-name]"); if (button) selectStation(button.dataset.stationName, button.dataset.stationField); });
}
function setupStationInput(input, container, fieldName) {
  if (!input || !container) return;
  input.addEventListener("input", () => { updateClearButtons(); clearTimeout(STATE.suggestionTimers[fieldName]); const value = input.value; STATE.suggestionTimers[fieldName] = setTimeout(() => renderStationSuggestions(input, container, value, fieldName), APP_CONFIG.searchDebounce); });
  input.addEventListener("focus", () => { if (input.value.trim()) renderStationSuggestions(input, container, input.value, fieldName); });
  input.addEventListener("keydown", event => { if (event.key === "Escape") hideSuggestions(container); if (event.key === "Enter" && !container.hidden) { const first = $("[data-station-name]", container); if (first) { event.preventDefault(); selectStation(first.dataset.stationName, fieldName); } } });
}
function clearStation(fieldName) {
  const origin = fieldName === "origin", input = origin ? DOM.origin : DOM.destination, container = origin ? DOM.originSuggestions : DOM.destinationSuggestions;
  if (!input) return; input.value = ""; hideSuggestions(container); updateClearButtons(); input.focus();
}
function swapStations() {
  if (!DOM.origin || !DOM.destination) return;
  const old = DOM.origin.value; DOM.origin.value = DOM.destination.value; DOM.destination.value = old;
  hideSuggestions(DOM.originSuggestions); hideSuggestions(DOM.destinationSuggestions); updateClearButtons();
  if (DOM.swapStations) { DOM.swapStations.classList.remove("swap-animate"); void DOM.swapStations.offsetWidth; DOM.swapStations.classList.add("swap-animate"); }
}
function resetSearch() {
  if (DOM.origin) DOM.origin.value = ""; if (DOM.destination) DOM.destination.value = "";
  hideSuggestions(DOM.originSuggestions); hideSuggestions(DOM.destinationSuggestions); setSearchMessage(""); setSearchLoading(false); STATE.searchRequest++; renderEmptyResults(); updateClearButtons(); DOM.origin?.focus();
}
function normalizeStationName(value) { return String(value ?? "").trim().toLocaleLowerCase("id-ID").replace(/\s+/g," "); }
async function runSearch(event) {
  event?.preventDefault(); if (!DOM.origin || !DOM.destination) return;
  const asal = DOM.origin.value.trim(), tujuan = DOM.destination.value.trim();
  if (!asal || !tujuan) { setSearchMessage("Lengkapi stasiun asal dan tujuan terlebih dahulu.", "error"); showToast("Stasiun asal dan tujuan wajib diisi.", "error"); return; }
  if (normalizeStationName(asal) === normalizeStationName(tujuan)) { setSearchMessage("Stasiun asal dan tujuan tidak boleh sama.", "error"); return; }
  if (!STATE.databaseReady) { setSearchMessage("Database belum siap. Tunggu hingga data selesai dimuat.", "error"); return; }
  const requestId = ++STATE.searchRequest; hideSuggestions(DOM.originSuggestions); hideSuggestions(DOM.destinationSuggestions); setSearchMessage(""); setSearchLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 25)); if (requestId !== STATE.searchRequest) return;
    const results = window.TARSUS_DATA.search(asal, tujuan); renderResults(results, asal, tujuan);
    setSearchMessage(results.length ? `${results.length} kelompok KA ditemukan.` : "Tidak ditemukan tarif yang sesuai dengan rute tersebut.", results.length ? "success" : "info");
    DOM.resultsSection?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  } catch (error) {
    console.error("[TARSUS] Pencarian gagal:", error); setSearchMessage("Pencarian gagal. Periksa data dan coba kembali.", "error"); showToast("Terjadi kesalahan saat mencari tarif.", "error");
  } finally { if (requestId === STATE.searchRequest) setSearchLoading(false); }
}
function setupSearchEvents() {
  setupStationInput(DOM.origin, DOM.originSuggestions, "origin"); setupStationInput(DOM.destination, DOM.destinationSuggestions, "destination");
  setupSuggestionClick(DOM.originSuggestions); setupSuggestionClick(DOM.destinationSuggestions);
  DOM.searchForm?.addEventListener("submit", runSearch); DOM.swapStations?.addEventListener("click", swapStations); DOM.resetSearch?.addEventListener("click", resetSearch);
  DOM.clearOrigin?.addEventListener("click", () => clearStation("origin")); DOM.clearDestination?.addEventListener("click", () => clearStation("destination"));
  document.addEventListener("click", event => {
    const originField = DOM.origin?.closest(".station-field"), destinationField = DOM.destination?.closest(".station-field");
    if (originField && !originField.contains(event.target)) hideSuggestions(DOM.originSuggestions);
    if (destinationField && !destinationField.contains(event.target)) hideSuggestions(DOM.destinationSuggestions);
  }); updateClearButtons();
}
const PAGE_NAMES = { search: "Pencarian Tarif", information: "Informasi Aplikasi", guide: "Panduan Penggunaan", terms: "Syarat & Ketentuan", contact: "Hubungi Pengelola" };
function closeSidebar() { DOM.sidebar?.classList.remove("open"); DOM.sidebarBackdrop?.classList.remove("visible"); document.body.classList.remove("sidebar-open"); }
function openSidebar() { DOM.sidebar?.classList.add("open"); DOM.sidebarBackdrop?.classList.add("visible"); document.body.classList.add("sidebar-open"); }
function navigateToPage(pageName) {
  const page = PAGE_NAMES[pageName] ? pageName : "search"; STATE.activePage = page;
  $$(".page-section").forEach(section => section.classList.toggle("active", section.id === "page-" + page));
  $$('[data-page]').forEach(button => { const active = button.dataset.page === page; button.classList.toggle("active", active); if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current"); });
  if (DOM.breadcrumbCurrent) DOM.breadcrumbCurrent.textContent = PAGE_NAMES[page]; closeSidebar();
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
function setupNavigation() {
  $$('[data-page]').forEach(button => button.addEventListener("click", () => navigateToPage(button.dataset.page)));
  DOM.openSidebar?.addEventListener("click", openSidebar); DOM.closeSidebar?.addEventListener("click", closeSidebar); DOM.sidebarBackdrop?.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeSidebar(); });
}
function applyTheme(theme, save = true) {
  const selected = theme === "dark" ? "dark" : "light"; document.body.dataset.theme = selected;
  if (DOM.themeIcon) DOM.themeIcon.innerHTML = selected === "dark" ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.6 8.6 0 1 0 20.2 15.1Z"/></svg>';
  DOM.themeToggle?.setAttribute("aria-label", selected === "dark" ? "Gunakan tema terang" : "Gunakan tema gelap");
  const meta = $('meta[name="theme-color"]'); if (meta) meta.content = selected === "dark" ? "#0c1421" : "#101b2d";
  if (save) { try { localStorage.setItem("tarsus-theme", selected); } catch (_) { /* Penyimpanan lokal mungkin dibatasi browser. */ } }
}
function initializeTheme() {
  let theme = "light"; try { theme = localStorage.getItem("tarsus-theme") || "light"; } catch (_) { /* Abaikan jika storage diblokir. */ }
  applyTheme(theme, false); DOM.themeToggle?.addEventListener("click", () => applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark"));
}
function updateIntroStatus(message) { const status = $("#introStatus"); if (status) status.textContent = message; }
function playIntro() {
  return new Promise(resolve => {
    if (!DOM.intro) { resolve(); return; }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      DOM.intro.classList.add("is-hidden", "hide");
      setTimeout(() => { DOM.intro.hidden = true; DOM.app?.classList.add("is-ready"); resolve(); }, reduced ? 0 : 560);
    }, reduced ? 100 : APP_CONFIG.introDuration);
  });
}
async function initializeDatabase() {
  if (!window.TARSUS_DATA || typeof window.TARSUS_DATA.load !== "function") throw new Error("Data engine tidak ditemukan. Pastikan data.js dimuat sebelum app.js.");
  updateIntroStatus("MENGHUBUNGKAN DATABASE");
  try {
    const info = await window.TARSUS_DATA.load(); STATE.databaseReady = true; updateIntroStatus("SISTEM SIAP");
    console.info("[TARSUS] Database berhasil dimuat:", info); showToast(`Database siap · ${info.totalStasiun} stasiun`, "success"); return info;
  } catch (error) {
    STATE.databaseReady = false; updateIntroStatus("DATABASE PERLU DIPERIKSA"); console.error("[TARSUS] Database gagal dimuat:", error);
    setSearchMessage("Database belum dapat diakses. Periksa koneksi internet, izin Google Sheets, dan nama sheet.", "error"); showToast("Database gagal dimuat. Periksa koneksi dan akses Google Sheets.", "error"); return null;
  }
}
function setupGlobalInteractions() {
  window.addEventListener("resize", () => { if (window.innerWidth > 800) closeSidebar(); });
  window.addEventListener("online", () => showToast("Koneksi internet tersedia kembali.", "success"));
  window.addEventListener("offline", () => showToast("Koneksi internet terputus.", "error"));
}
async function initializeApp() {
  initializeVersion(); initializeTheme(); setupNavigation(); setupSearchEvents(); setupGlobalInteractions(); renderEmptyResults();
  const databasePromise = initializeDatabase();
  await playIntro();
  const info = await databasePromise;
  if (info) setSearchMessage("Database siap digunakan. Silakan pilih stasiun asal dan tujuan.", "success");
  console.info("[TARSUS] Aplikasi berhasil diinisialisasi.");
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeApp, { once: true }); else initializeApp();
