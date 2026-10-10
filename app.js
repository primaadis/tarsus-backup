"use strict";
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { ready: false, stations: [], activeField: null, selectedIndex: -1, toastTimer: null, searchToken: 0 };
  const dom = {
    intro: $("#intro"), shell: $("#appShell"), drawer: $("#drawer"), scrim: $("#scrim"), openDrawer: $("#openDrawer"), closeDrawer: $("#closeDrawer"), theme: $("#themeToggle"),
    form: $("#searchForm"), origin: $("#originInput"), destination: $("#destinationInput"), swap: $("#swapStations"), searchButton: $("#searchButton"), results: $("#results"), resultsSection: $("#resultsSection"), resultCount: $("#resultCount"), toast: $("#toast")
  };
  const fields = {
    origin: { input: dom.origin, list: $("#originSuggestions"), clear: $('[data-clear="originInput"]') },
    destination: { input: dom.destination, list: $("#destinationSuggestions"), clear: $('[data-clear="destinationInput"]') }
  };

  function esc(value) {
    if (window.TARSUS_DATA?.escapeHTML) return window.TARSUS_DATA.escapeHTML(value);
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
  }
  function rupiah(value) {
    if (value === null || value === undefined || !Number.isFinite(value)) return "—";
    return window.TARSUS_DATA?.formatRupiah ? window.TARSUS_DATA.formatRupiah(value) : "Rp " + new Intl.NumberFormat("id-ID").format(value);
  }
  function notify(message, type = "normal") {
    clearTimeout(state.toastTimer); dom.toast.textContent = message; dom.toast.className = "toast show" + (type === "error" ? " error" : "");
    state.toastTimer = setTimeout(() => dom.toast.classList.remove("show"), 3000);
  }
  function applyTheme(theme, save = true) {
    const selected = theme === "dark" ? "dark" : "light";
    document.body.dataset.theme = selected;
    dom.theme.setAttribute("aria-label", selected === "dark" ? "Gunakan tema terang" : "Gunakan tema gelap");
    const meta = $('meta[name="theme-color"]'); if (meta) meta.content = selected === "dark" ? "#0c1420" : "#101b2b";
    if (save) { try { localStorage.setItem("tarsus-theme", selected); } catch (_) {} }
  }
  function initTheme() {
    let theme = "light"; try { theme = localStorage.getItem("tarsus-theme") || "light"; } catch (_) {}
    applyTheme(theme, false); dom.theme.addEventListener("click", () => applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark"));
  }
  function openDrawer() { dom.drawer.classList.add("open"); dom.scrim.classList.add("open"); dom.drawer.setAttribute("aria-hidden", "false"); dom.openDrawer.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; }
  function closeDrawer() { dom.drawer.classList.remove("open"); dom.scrim.classList.remove("open"); dom.drawer.setAttribute("aria-hidden", "true"); dom.openDrawer.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; }
  function showView(name) {
    const target = $("#view-" + name); if (!target) return;
    $$(".view").forEach(view => { const active = view === target; view.hidden = !active; view.classList.toggle("active", active); });
    $$(".drawer-link").forEach(link => link.classList.toggle("active", link.dataset.view === name));
    closeDrawer(); window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function closeSuggestions(except) {
    Object.entries(fields).forEach(([name, field]) => {
      if (name === except) return;
      field.list.hidden = true; field.input.setAttribute("aria-expanded", "false"); field.input.removeAttribute("aria-activedescendant");
    });
    state.activeField = except || null; state.selectedIndex = -1;
  }
  function updateClear(field) { field.clear.hidden = !field.input.value; }
  function renderSuggestions(name) {
    const field = fields[name], query = field.input.value.trim();
    field.list.replaceChildren(); field.input.removeAttribute("aria-activedescendant"); state.selectedIndex = -1;
    if (!query || !state.ready) { field.list.hidden = true; field.input.setAttribute("aria-expanded", "false"); return; }
    const matches = window.TARSUS_DATA.suggestions(query, 9);
    if (!matches.length) {
      const empty = document.createElement("div"); empty.className = "suggestion-empty"; empty.textContent = "Stasiun tidak ditemukan"; field.list.append(empty);
    } else {
      matches.forEach((station, index) => {
        const option = document.createElement("button"); option.type = "button"; option.className = "suggestion-option"; option.setAttribute("role", "option"); option.id = `${name}-option-${index}`; option.setAttribute("aria-selected", "false"); option.textContent = station.namaStasiun;
        option.addEventListener("mousedown", event => event.preventDefault());
        option.addEventListener("click", () => selectStation(name, station.namaStasiun)); field.list.append(option);
      });
    }
    field.list.hidden = false; field.input.setAttribute("aria-expanded", "true"); closeSuggestions(name);
  }
  function selectStation(name, stationName) {
    const field = fields[name]; field.input.value = stationName; updateClear(field); field.list.hidden = true; field.input.setAttribute("aria-expanded", "false"); field.input.removeAttribute("aria-activedescendant");
    state.activeField = null;
    if (name === "origin") dom.destination.focus(); else field.input.blur();
  }
  function moveSuggestion(name, delta) {
    const field = fields[name], options = $$(".suggestion-option", field.list); if (!options.length) return false;
    state.selectedIndex = Math.max(0, Math.min(options.length - 1, state.selectedIndex + delta));
    options.forEach((option, index) => { const active = index === state.selectedIndex; option.setAttribute("aria-selected", String(active)); });
    field.input.setAttribute("aria-activedescendant", options[state.selectedIndex].id); options[state.selectedIndex].scrollIntoView({ block: "nearest" }); return true;
  }
  function initAutocomplete() {
    Object.entries(fields).forEach(([name, field]) => {
      field.input.addEventListener("input", () => { updateClear(field); closeSuggestions(name); renderSuggestions(name); });
      field.input.addEventListener("focus", () => { closeSuggestions(name); if (field.input.value.trim()) renderSuggestions(name); });
      field.input.addEventListener("keydown", event => {
        if (field.list.hidden && event.key !== "ArrowDown") return;
        if (event.key === "ArrowDown") { event.preventDefault(); if (field.list.hidden) renderSuggestions(name); moveSuggestion(name, 1); }
        else if (event.key === "ArrowUp") { event.preventDefault(); moveSuggestion(name, -1); }
        else if (event.key === "Enter" && !field.list.hidden) { const option = $(".suggestion-option[aria-selected='true']", field.list) || $(".suggestion-option", field.list); if (option) { event.preventDefault(); option.click(); } }
        else if (event.key === "Escape") { field.list.hidden = true; field.input.setAttribute("aria-expanded", "false"); }
      });
      field.clear.addEventListener("click", () => { field.input.value = ""; updateClear(field); field.input.focus(); field.list.hidden = true; field.input.setAttribute("aria-expanded", "false"); });
    });
    document.addEventListener("click", event => { if (!event.target.closest(".station-field")) closeSuggestions(null); });
    dom.swap.addEventListener("click", () => {
      const origin = dom.origin.value, destination = dom.destination.value; dom.origin.value = destination; dom.destination.value = origin;
      updateClear(fields.origin); updateClear(fields.destination); closeSuggestions(null); dom.origin.focus();
    });
  }
  function routeHTML(tarif) {
    const route = Array.isArray(tarif.referenceRoute) && tarif.referenceRoute.length ? tarif.referenceRoute : (tarif.stations || []);
    return route.map((station, index) => `${index ? '<span class="route-arrow" aria-hidden="true">→</span>' : ""}<span>${esc(station)}</span>`).join("");
  }
  function fareItem(label, value) {
    const unavailable = value === null || value === undefined || !Number.isFinite(value);
    return `<div class="fare-item"><span class="fare-class">${label}</span><strong class="fare-price${unavailable ? " fare-unavailable" : ""}">${unavailable ? "—" : rupiah(value)}</strong></div>`;
  }
  function tariffHTML(tarif, isMain) {
    return `<div class="tariff-detail"><div class="reference-heading">${isMain ? "RELASI TARIF KHUSUS" : "RELASI ALTERNATIF"}</div><div class="reference-route">${routeHTML(tarif)}</div><div class="fare-list">${fareItem("EKSEKUTIF", tarif.eks)}${fareItem("BISNIS", tarif.bis)}${fareItem("EKONOMI", tarif.eko)}</div><div class="tariff-meta"><span class="direction-chip">${tarif.roundTrip ? "PULANG PERGI" : "SEARAH"}</span><span class="tariff-id">Relasi ${esc(tarif.idTarif)}</span></div></div>`;
  }
  function trainIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="3" width="12" height="15" rx="3"/><path d="M8 7h8M9 11h.01M15 11h.01M8 18l-2 3m10-3 2 3M4 15h2m12 0h2"/></svg>'; }
  function renderCard(group, index) {
    const alternatives = Array.isArray(group.alternatives) ? group.alternatives : [];
    const alt = alternatives.length ? `<details class="alternatives"><summary>Lihat ${alternatives.length} tarif alternatif</summary><div class="alternative-body">${alternatives.map(item => tariffHTML(item, false)).join("")}</div></details>` : "";
    return `<article class="result-card"><div class="result-card-top"><div class="train-emblem">${trainIcon()}</div><div><div class="result-overline">KERETA API</div><h3 class="result-name">${esc(group.namaKA)}</h3></div><span class="result-number">${String(index + 1).padStart(2, "0")}</span></div><div class="journey"><span class="journey-station">${esc(group.asal)}</span><span class="journey-arrow" aria-hidden="true">→</span><span class="journey-station">${esc(group.tujuan)}</span></div>${tariffHTML(group.main, true)}${alt}</article>`;
  }
  function showEmpty(title, description, type = "empty") {
    const icon = type === "error" ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M4 18h16M6 15l2-9h8l2 9M9 9h6M10 12h4"/></svg>';
    dom.results.innerHTML = `<div class="${type === "error" ? "error-state" : "empty-state"}"><div class="welcome-icon">${icon}</div><h3>${esc(title)}</h3><p>${esc(description)}</p></div>`; dom.resultCount.textContent = "";
  }
  function setBusy(busy) { dom.resultsSection.setAttribute("aria-busy", String(busy)); dom.searchButton.disabled = busy; dom.searchButton.querySelector("span").textContent = busy ? "Mencari…" : "Cari tarif"; }
  async function runSearch(event) {
    event?.preventDefault(); closeSuggestions(null);
    const origin = dom.origin.value.trim(), destination = dom.destination.value.trim();
    if (!origin || !destination) { notify("Pilih stasiun asal dan tujuan terlebih dahulu.", "error"); (!origin ? dom.origin : dom.destination).focus(); return; }
    if (origin.toLocaleLowerCase("id-ID") === destination.toLocaleLowerCase("id-ID")) { notify("Stasiun asal dan tujuan tidak boleh sama.", "error"); return; }
    if (!state.ready) { showEmpty("Database belum tersedia", "Periksa koneksi internet dan akses Google Sheets, lalu muat ulang aplikasi.", "error"); return; }
    const token = ++state.searchToken; setBusy(true); dom.resultCount.textContent = ""; dom.results.innerHTML = '<div class="welcome-state"><div class="welcome-icon"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.2 4.2"/></svg></div><h3>Mencari relasi tarif</h3><p>Sedang mencocokkan stasiun dengan data tarif khusus.</p></div>';
    await new Promise(resolve => requestAnimationFrame(resolve));
    try {
      const matches = window.TARSUS_DATA.search(origin, destination);
      if (token !== state.searchToken) return;
      if (!matches.length) showEmpty("Tarif belum ditemukan", "Tidak ada relasi tarif khusus yang cocok untuk pasangan stasiun ini. Periksa nama stasiun atau arah perjalanan.");
      else { dom.results.innerHTML = matches.map(renderCard).join(""); dom.resultCount.textContent = `${matches.length} kereta ditemukan`; }
    } catch (error) { console.error("[TARSUS] Pencarian gagal:", error); showEmpty("Pencarian belum dapat dilakukan", "Database belum siap. Muat ulang aplikasi atau periksa akses Google Sheets.", "error"); }
    finally { if (token === state.searchToken) setBusy(false); }
  }
  async function initDatabase() {
    try {
      const info = await window.TARSUS_DATA.load(); state.ready = true; state.stations = window.TARSUS_DATA.stations();
      console.info("[TARSUS] Database siap", info); return true;
    } catch (error) { state.ready = false; console.error("[TARSUS] Database gagal dimuat:", error); showEmpty("Database belum dapat diakses", "Pastikan ketiga sheet Google Sheets dapat dibaca publik dan nama sheet sesuai konfigurasi.", "error"); return false; }
  }
  function initNavigation() {
    dom.openDrawer.addEventListener("click", openDrawer); dom.closeDrawer.addEventListener("click", closeDrawer); dom.scrim.addEventListener("click", closeDrawer);
    $$("[data-view]").forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
    document.addEventListener("keydown", event => { if (event.key === "Escape") closeDrawer(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 800) closeDrawer(); });
  }
  function initPWA() {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(error => console.warn("[TARSUS] Service worker belum terdaftar:", error)));
  }
  async function start() {
    initTheme(); initNavigation(); initAutocomplete(); dom.form.addEventListener("submit", runSearch); initPWA();
    Object.values(fields).forEach(updateClear);
    const introSeen = (() => { try { return sessionStorage.getItem("tarsus-intro-seen") === "1"; } catch (_) { return true; } })();
    if (introSeen || matchMedia("(prefers-reduced-motion: reduce)").matches) dom.intro.classList.add("is-hidden");
    else setTimeout(() => { dom.intro.classList.add("is-hidden"); try { sessionStorage.setItem("tarsus-intro-seen", "1"); } catch (_) {} }, 1250);
    await initDatabase();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
})();
