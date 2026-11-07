
/* =========================================================
   K-PEDIA 6.0.0 (sebelumnya TARSUS Finder)
   Presentation Layer. Aturan tarif tetap di data.js.
   Konten yang mudah diedit: content.js, stations-info.js, wiki-data.js
   ========================================================= */

"use strict";

const VERSION = "6.4.0";

const state = {
  ready: false, page: "home", user: null,
  stations: [], trains: [], tariffs: [], searchGroups: [],
  loading: true, stationLimit: 120
};

const pageNames = {
  home: "Beranda", tarsus: "Tarif Khusus", search: "Cari Berdasarkan Rute", trains: "Cari Berdasarkan Kereta",
  peta: "Peta Jalur", stasiun: "Nama Stasiun", wiki: "Ensiklopedia KAI",
  favorites: "Favorit", history: "Riwayat Pencarian", guide: "Panduan Penggunaan",
  help: "Kritik dan Saran", settings: "Pengaturan"
};

const CFG = window.KP_CONTENT || {};
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const norm = v => String(v ?? "").toLocaleLowerCase("id-ID").replace(/\s+/g, " ").trim();
const rupiah = v => window.TARSUS_DATA.formatRupiah(v);

const $ = (s, p = document) => p.querySelector(s);

const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const esc = value =>
  window.TARSUS_DATA?.escapeHTML
    ? window.TARSUS_DATA.escapeHTML(value)
    : String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c]));

const keyFor = kind =>
  `tarsus:${kind}:${encodeURIComponent(state.user || "guest")}`;

function readStore(kind, fallback = []) {
  try {
    const value = JSON.parse(
      localStorage.getItem(keyFor(kind)) || "null"
    );
    return value ?? fallback;
  } catch (_) {
    return fallback;
  }
}

function writeStore(kind, value) {
  try {
    localStorage.setItem(keyFor(kind), JSON.stringify(value));
  } catch (_) {
    toast("Penyimpanan perangkat tidak tersedia.", "error");
  }
}

function toast(message, type = "info", opt) {
  window.kpToast?.(message, type, opt);
}

function prefGet(key, fallback) {
  try {
    const value = localStorage.getItem(`tarsus-pref:${key}`);
    return value === null ? fallback : value;
  } catch (_) {
    return fallback;
  }
}

function prefSet(key, value) {
  try {
    localStorage.setItem(`tarsus-pref:${key}`, String(value));
  } catch (_) {}
}

function applyPreferences() {
  const size = prefGet("fontSize", "normal");

  ["xsmall", "small", "large", "xlarge"].forEach(key => {
    document.body.classList.toggle(
      `font-${key}`,
      size === key
    );
  });

  document.documentElement.dataset.font = size;

  const fs = $("#fontSizeSetting");
  if (fs) fs.value = size;
}

function initTheme() {
  applyTheme(prefGet("theme", "system"), false, false);
  applyPreferences();

  $("#themeSetting")?.addEventListener("change", event => {
    applyTheme(event.target.value, true, true);
  });

  window.matchMedia
    ?.("(prefers-color-scheme: dark)")
    .addEventListener
    ?.("change", () => {
      if (prefGet("theme", "system") === "system") {
        applyTheme("system", false, true);
      }
    });

  $("#fontSizeSetting")?.addEventListener("change", event => {
    prefSet("fontSize", event.target.value);
    applyPreferences();
    toast("Ukuran teks diperbarui", "success", { icon: "text" });
  });
}

let loginFails = 0, lockUntil = 0;
async function sha256(text) {
  if (!window.crypto || !crypto.subtle) throw new Error("no-subtle");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, "0")).join("");
}

async function attemptLogin(event) {
  event.preventDefault();
  const id = $("#agentId").value.trim(), password = $("#agentPassword").value, msg = $("#loginMessage"), panel = $(".login-panel");
  const left = Math.ceil((lockUntil - Date.now()) / 1000);
  if (left > 0) { msg.textContent = `Terlalu banyak percobaan. Coba lagi dalam ${left} detik.`; window.KP_MASCOT?.react("lock"); return; }
  const auth = CFG.auth || {};
  let ok = false;
  try { ok = (await sha256(`${auth.salt}:${id.toLowerCase()}:${password}`)) === auth.hash; }
  catch (_) { msg.textContent = "Peramban ini tidak mendukung verifikasi aman. Buka lewat alamat https."; return; }
  if (!ok) {
    loginFails++;
    if (loginFails >= 5) { lockUntil = Date.now() + 30000; loginFails = 0; msg.textContent = "Terlalu banyak percobaan. Tunggu 30 detik."; window.KP_MASCOT?.react("lock"); }
    else { msg.textContent = "Akun atau kata sandi tidak sesuai."; window.KP_MASCOT?.react("bad"); }
    panel?.classList.remove("shake"); void panel?.offsetWidth; panel?.classList.add("shake");
    return;
  }
  loginFails = 0; msg.textContent = "";
  try { sessionStorage.setItem("tarsus-ui-session", "admin"); } catch (_) {}
  await (window.KP_MASCOT?.depart?.() ?? Promise.resolve());
  showApp("admin");
  toast("Berhasil masuk.", "success");
}

async function doLogout() {
  if (!(await kpConfirm({ title: "Keluar dari akun?", message: "Sesi K-Pedia di perangkat ini akan ditutup. Favorit dan riwayat tetap tersimpan.", confirmText: "Ya, keluar", cancelText: "Tetap di sini", icon: "logout" }))) return;

  try {
    sessionStorage.removeItem("tarsus-ui-session");
  } catch (_) {}

  state.user = null;

  document.body.classList.add("login-active");
  $("#appShell").hidden = true;
  $("#loginScreen").hidden = false;
  $("#agentPassword").value = "";
  $("#loginMessage").textContent = "";
}

function exitApplication() {
  closeSidebar();

  try {
    window.close();
  } catch (_) {}

  setTimeout(() => {
    if (!document.hidden) {
      toast(
        "Untuk menutup aplikasi, gunakan tombol Kembali perangkat atau tutup jendela/browser."
      );
    }
  }, 120);
}

function openSidebar() {
  $("#sidebar").classList.add("open");
  $("#sidebarScrim").classList.add("visible");
  document.body.classList.add("sidebar-open");
  $("#closeSidebar").focus();
}

function closeSidebar() {
  $("#sidebar")?.classList.remove("open");
  $("#sidebarScrim")?.classList.remove("visible");
  document.body.classList.remove("sidebar-open");
}

const icon = (name, cls = "") =>
  `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

function uiIcon(name) {
  const map = { train: "train", search: "search", station: "pin", heart: "star", history: "clock", menu: "menu" };
  return icon(map[name] || "train");
}

function fare(value) {
  return value == null || !Number.isFinite(value)
    ? "—"
    : window.TARSUS_DATA.formatRupiah(value);
}

function fareBlocks(t) {
  const cells = [
    ["Eksekutif", t.eks],
    ["Bisnis", t.bis],
    ["Ekonomi", t.eko]
  ]
    .filter(x => x[1] != null && Number.isFinite(x[1]))
    .map(x => `<div class="fare-cell"><span>${x[0]}</span><strong data-v="${x[1]}">${fare(x[1])}</strong></div>`)
    .join("");

  return `<div class="fare-grid">${cells || '<div class="fare-cell"><span>Tarif</span><strong>Perlu verifikasi</strong></div>'}</div>`;
}

function animateFares(root) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  $$(".fare-cell strong[data-v]", root).forEach(el => {
    const target = Number(el.dataset.v);
    const start = performance.now();

    const tick = now => {
      const p = Math.min(1, (now - start) / 650);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fare(p === 1 ? target : Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}

function stopLine(stations, hits) {
  return `<ol class="stop-line">${stations.map(name =>
    `<li${hits.has(String(name).toLocaleLowerCase("id")) ? ' class="is-hit"' : ""}>${esc(name)}</li>`
  ).join("")}</ol>`;
}

function favoriteExists(id) {
  return readStore("favorites").some(
    item => String(item.idTarif) === String(id)
  );
}

function starButton(t) {
  const saved = favoriteExists(t.idTarif);

  return `<button class="star-action ${saved ? "is-saved" : ""}" data-favorite="${esc(t.idTarif)}" aria-label="${saved ? "Hapus dari favorit" : "Simpan ke favorit"}" title="Favorit">${icon("star")}</button>`;
}

function tariffCard(t, opts = {}) {
  const full = t.referenceRoute || [];

  const fullText = full.length
    ? full.join(" — ")
    : "Relasi tarif khusus belum tersedia";

  const queried = opts.requestedRoute
    ? `${opts.requestedRoute.origin} → ${opts.requestedRoute.destination}`
    : "";

  const copy =
    `Kereta: ${t.namaKA || opts.namaKA || "-"}\n` +
    `${queried ? `Rute dicari: ${queried}\n` : ""}` +
    `Relasi tarif khusus: ${fullText}\n` +
    `Arah: ${t.roundTrip ? "Pulang pergi" : "Searah"}\n` +
    `Eksekutif: ${fare(t.eks)}\n` +
    `Bisnis: ${fare(t.bis)}\n` +
    `Ekonomi: ${fare(t.eko)}`;

  const hits = new Set(
    opts.requestedRoute
      ? [opts.requestedRoute.origin, opts.requestedRoute.destination].map(x => String(x).toLocaleLowerCase("id"))
      : []
  );

  const direction = `${t.roundTrip ? "Pulang pergi" : "Searah"}${t.arah && !/^(searah|pp)$/i.test(t.arah.trim()) ? ` · ${esc(t.arah)}` : ""}`;

  return `<article class="tariff-card ${opts.cardLabel ? "tariff-card-labelled" : ""}">
    ${opts.cardLabel ? `<div class="tariff-card-label">${esc(opts.cardLabel)}</div>` : ""}
    <div class="tariff-card-head">
      <div class="tariff-title-stack">
        <h3>${esc(t.namaKA || opts.namaKA || "TARIF KHUSUS")}</h3>
      </div>
      ${starButton(t)}
    </div>
    ${queried ? `<div class="route-info"><span>Rute yang dicari</span><strong>${esc(opts.requestedRoute.origin)} <i>→</i> ${esc(opts.requestedRoute.destination)}</strong></div>` : ""}
    <div class="route-special">
      <span class="route-label">Relasi tarif khusus penuh</span>
      ${full.length
        ? `<div class="route-track"><strong class="rt-end">${esc(full[0])}</strong><span class="rt-line" aria-hidden="true"><i></i></span><strong class="rt-end">${esc(full[full.length - 1])}</strong></div>`
        : "<strong>Relasi belum tersedia</strong>"}
      <small>${direction}</small>
    </div>
    ${fareBlocks(t)}
    ${(opts.showStations || opts.showFullRoute) && t.stations?.length ? `<details class="route-details"><summary>Lihat relasi lengkap <span>(${t.stations.length} stasiun)</span></summary>${stopLine(t.stations, hits)}</details>` : ""}
    <div class="tariff-card-foot">
      <button class="quiet-link" data-copy="${esc(copy)}" type="button">${icon("copy", "ic-sm")}Salin informasi</button>
      <span>Tarif khusus · verifikasi berkala</span>
    </div>
  </article>`;
}

function empty(title, desc) {
  return `<div class="empty-state"><span class="empty-symbol">${uiIcon("search")}</span><h3>${esc(title)}</h3><p>${esc(desc)}</p></div>`;
}

function renderSearchResults(groups, origin, destination) {
  state.searchGroups = groups;

  const root = $("#results");

  if (!groups.length) {
    root.innerHTML = empty(
      "Tarif tidak ditemukan",
      "Tidak ada relasi tarif khusus yang cocok dengan rute ini. Periksa kembali nama stasiun, arah perjalanan, dan referensi data."
    );

    $("#resultsSummary").textContent = `${origin} — ${destination}`;
    return;
  }

  root.innerHTML = groups.map(group => {
    const alternatives = group.alternatives || [];

    return `<section class="train-result-group">
      <div class="train-result-title">
        <h3>${esc(group.namaKA)}</h3>
        <span class="result-total">${1 + alternatives.length} tarif</span>
      </div>
      <div class="train-result-cards">
        ${tariffCard(
          { ...group.main, namaKA: group.namaKA },
          {
            cardLabel: "Tarif utama · harga terendah",
            requestedRoute: { origin, destination },
            showFullRoute: true
          }
        )}
        ${alternatives.length ? `<details class="alternatives">
          <summary>Lihat ${alternatives.length} tarif alternatif</summary>
          <div class="alternative-stack">
            ${alternatives.map((tariff, index) =>
              tariffCard(
                { ...tariff, namaKA: group.namaKA },
                {
                  cardLabel: `Tarif alternatif ${index + 1}`,
                  requestedRoute: { origin, destination },
                  showFullRoute: true
                }
              )
            ).join("")}
          </div>
        </details>` : ""}
      </div>
    </section>`;
  }).join("");

  animateFares(root);

  $("#resultsSummary").textContent =
    `${groups.length} nama kereta cocok dengan rute ini. Tarif utama diurutkan dari harga terendah; tarif lain tersedia pada bagian alternatif.`;
}

function showSuggestions(input, root, query, field) {
  const q = query.trim();

  if (!q || !state.ready) {
    root.hidden = true;
    root.innerHTML = "";
    return;
  }

  const list = window.TARSUS_DATA.suggestions(q, 8);

  root.innerHTML = list.length
    ? list.map(station =>
        `<button type="button" role="option" class="suggestion-row" data-pick="${esc(station.namaStasiun)}" data-field="${field}"><span class="suggestion-dot"></span><span>${esc(station.namaStasiun)}</span></button>`
      ).join("")
    : '<div class="suggestion-empty">Stasiun tidak ditemukan.</div>';

  root.hidden = false;
}

function setupStationField(id, suggestionsId, field) {
  const input = $(id);
  const root = $(suggestionsId);

  const clear = $(
    field === "origin" ? "#clearOrigin" : "#clearDestination"
  );

  input.addEventListener("input", () => {
    showSuggestions(input, root, input.value, field);
    clear.hidden = !input.value;
  });

  input.addEventListener("keydown", event => {
    if (root.hidden) return;

    const rows = $$(".suggestion-row", root);
    if (!rows.length) return;

    let index = rows.findIndex(row => row.classList.contains("is-active"));

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      rows[index]?.classList.remove("is-active");

      index = event.key === "ArrowDown"
        ? (index + 1) % rows.length
        : (index <= 0 ? rows.length - 1 : index - 1);

      rows[index].classList.add("is-active");
      rows[index].scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter" && index > -1) {
      event.preventDefault();
      rows[index].click();
    } else if (event.key === "Escape") {
      root.hidden = true;
    }
  });

  root.addEventListener("click", event => {
    const button = event.target.closest("[data-pick]");
    if (!button) return;

    input.value = button.dataset.pick;
    root.hidden = true;
    clear.hidden = false;

    const next = field === "origin" ? $("#destination") : null;
    (next && !next.value ? next : input).focus();
  });

  clear.addEventListener("click", () => {
    input.value = "";
    root.hidden = true;
    clear.hidden = true;
    input.focus();
  });

  document.addEventListener("click", event => {
    if (!input.closest(".field-wrap").contains(event.target)) {
      root.hidden = true;
    }
  });
}

function resolveStation(value) {
  const hit = state.stations.find(s => norm(s.namaStasiun) === norm(value));
  if (hit) return hit.namaStasiun;
  const sug = window.TARSUS_DATA.suggestions(value, 2);
  return sug.length === 1 ? sug[0].namaStasiun : null;
}

function searchRoute(event) {
  event.preventDefault();

  let origin = $("#origin").value.trim();
  let destination = $("#destination").value.trim();

  if (state.ready && origin && destination) {
    const o = resolveStation(origin), d = resolveStation(destination);
    if (!o || !d) {
      $("#searchMessage").hidden = false;
      $("#searchMessage").textContent = `Pilih nama stasiun ${!o ? "asal" : "tujuan"} dari daftar saran.`;
      $(!o ? "#origin" : "#destination").focus();
      return;
    }
    origin = o; destination = d;
    $("#origin").value = o; $("#destination").value = d;
  }

  if (!origin || !destination) {
    $("#searchMessage").hidden = false;
    $("#searchMessage").textContent =
      "Masukkan stasiun asal dan tujuan.";
    return;
  }

  if (
    origin.toLocaleLowerCase("id") ===
    destination.toLocaleLowerCase("id")
  ) {
    $("#searchMessage").hidden = false;
    $("#searchMessage").textContent =
      "Stasiun asal dan tujuan tidak boleh sama.";
    return;
  }

  if (!state.ready) {
    $("#searchMessage").hidden = false;
    $("#searchMessage").textContent =
      "Database belum siap. Periksa koneksi dan akses Google Sheets.";
    return;
  }

  try {
    const groups = window.TARSUS_DATA.search(origin, destination);

    renderSearchResults(groups, origin, destination);
    $("#searchMessage").hidden = true;

    const historyItems = readStore("history");

    historyItems.unshift({
      origin,
      destination,
      at: Date.now()
    });

    writeStore(
      "history",
      historyItems
        .filter((item, index) =>
          historyItems.findIndex(other =>
            norm(other.origin) === norm(item.origin) && norm(other.destination) === norm(item.destination)
          ) === index
        )
        .slice(0, 40)
    );

    renderHistory();

    if (!groups.length) {
      toast("Belum ada relasi tarif yang cocok.");
    } else {
      toast(`${groups.length} nama kereta ditemukan.`, "success");
    }
  } catch (error) {
    console.error(error);
    toast("Pencarian gagal. Periksa database.", "error");
  }
}

const skeletons = () => '<div class="skeleton"></div>'.repeat(4);

function renderTrains(filter = "") {
  const root = $("#trainList");

  if (!state.ready && state.loading) {
    root.innerHTML = skeletons();
    return;
  }

  if (!state.ready) {
    root.innerHTML = empty(
      "Database belum siap",
      "Daftar kereta akan muncul setelah data berhasil dimuat."
    );
    return;
  }

  const q = filter.trim().toLocaleLowerCase("id");

  const list = state.trains.filter(train =>
    train.namaKA.toLocaleLowerCase("id").includes(q)
  );

  root.innerHTML = list.length
    ? list.map(train =>
        `<button class="directory-card" data-train="${esc(train.key || train.idKA)}">
          <span class="directory-icon">${uiIcon("train")}</span>
          <span class="directory-main">
            <strong>${esc(train.namaKA)}</strong>
            <small>${train.totalRelasi} relasi tarif khusus</small>
          </span>
        </button>`
      ).join("")
    : empty(
        "Kereta tidak ditemukan",
        "Coba kata kunci nama kereta yang lain."
      );
}

function openTrain(id) {
  const train = state.trains.find(item =>
    String(item.key || "") === String(id) ||
    String(item.idKA) === String(id)
  );

  if (!train) return;

  const tariffs = window.TARSUS_DATA.tariffsByTrain(
    train.key || id
  );

  const root = $("#trainList");

  root.innerHTML = `<div class="detail-toolbar">
    <button class="secondary-button" id="backToTrains">← Daftar kereta</button>
    <div>
      <span class="eyebrow">Relasi tarif khusus</span>
      <h2>${esc(train.namaKA)}</h2>
    </div>
  </div>
  ${tariffs.length
    ? tariffs.map(tariff =>
        tariffCard(
          { ...tariff, namaKA: train.namaKA },
          { showStations: true, showFullRoute: true }
        )
      ).join("")
    : empty(
        "Relasi belum tersedia",
        "Tidak ada tarif aktif untuk kereta ini."
      )}`;

  $("#backToTrains").addEventListener("click", () => {
    renderTrains($("#trainFilter").value);
  });
}

function toggleFavorite(id) {
  const tariffs = state.tariffs;

  const item =
    tariffs.find(tariff =>
      String(tariff.idTarif) === String(id)
    ) ||
    state.searchGroups
      .flatMap(group => [
        group.main,
        ...(group.alternatives || [])
      ])
      .find(tariff =>
        String(tariff.idTarif) === String(id)
      );

  if (!item) {
    toast("Tarif tidak ditemukan untuk disimpan.", "error");
    return;
  }

  let favorites = readStore("favorites");

  if (favorites.some(t => String(t.idTarif) === String(id))) {
    favorites = favorites.filter(
      t => String(t.idTarif) !== String(id)
    );

    toast("Dihapus dari favorit.");
  } else {
    favorites.unshift({
      ...item,
      namaKA:
        item.namaKA ||
        state.trains.find(
          train => String(train.idKA) === String(item.idKA)
        )?.namaKA ||
        "Kereta",
      savedAt: Date.now()
    });

    toast("Disimpan ke favorit.", "success");
  }

  writeStore("favorites", favorites);

  renderFavorites();
  updateFavoriteCount();

  $$("[data-favorite]").forEach(button => {
    if (String(button.dataset.favorite) !== String(id)) return;

    const saved = favorites.some(
      item => String(item.idTarif) === String(id)
    );

    button.classList.toggle("is-saved", saved);
    button.setAttribute(
      "aria-label",
      saved ? "Hapus dari favorit" : "Simpan ke favorit"
    );
  });
}

function renderFavorites() {
  const root = $("#favoritesList");
  const items = readStore("favorites").map(f => state.tariffs.find(t => String(t.idTarif) === String(f.idTarif)) || f);

  root.innerHTML = items.length
    ? items.map(item =>
        tariffCard(item, {
          showStations: true,
          showFullRoute: true
        })
      ).join("")
    : empty(
        "Belum ada favorit",
        "Simpan relasi dari hasil pencarian dengan ikon bintang."
      );

  updateFavoriteCount();
}

function updateFavoriteCount() {
  const el = $("#favoriteCount");
  if (!el) return;

  const count = readStore("favorites").length;

  el.textContent = count;
  el.hidden = !count;
}

function renderHistory() {
  const root = $("#historyList");
  const items = readStore("history");

  root.innerHTML = items.length
    ? items.map(item =>
        `<button class="history-card"
          data-history-origin="${esc(item.origin)}"
          data-history-destination="${esc(item.destination)}">
          <span class="history-icon">${uiIcon("history")}</span>
          <span class="history-route">
            <strong>${esc(item.origin)} <i>→</i> ${esc(item.destination)}</strong>
            <small>${new Date(item.at).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short"
            })}</small>
          </span>
        </button>`
      ).join("")
    : empty(
        "Belum ada riwayat",
        "Pencarian yang kamu lakukan akan tersimpan di sini."
      );
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => toast("Informasi tarif disalin.", "success"))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const area = document.createElement("textarea");

  area.value = text;
  document.body.append(area);
  area.select();

  try {
    document.execCommand("copy");
    toast("Informasi tarif disalin.", "success");
  } catch (_) {
    toast("Tidak dapat menyalin otomatis.", "error");
  }

  area.remove();
}


/* ---------- Tema ---------- */
function applyTheme(theme, save = true, animate = true) {
  const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const preference = theme || prefGet("theme", "system");
  const value = preference === "system" ? (systemDark ? "dark" : "light") : (preference === "light" ? "light" : "dark");
  const old = document.body.dataset.theme;
  if (animate && old !== value) {
    document.body.classList.add("theme-transition");
    const fx = document.getElementById("themeTransition");
    if (fx) {
      fx.className = "theme-transition-orb " + (value === "light" ? "to-light" : "to-dark");
      fx.innerHTML = icon(value === "light" ? "sun" : "moon");
      fx.hidden = false;
      setTimeout(() => { fx.hidden = true; document.body.classList.remove("theme-transition"); }, 620);
    } else setTimeout(() => document.body.classList.remove("theme-transition"), 620);
  }
  document.body.dataset.theme = value;
  document.documentElement.dataset.theme = value;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", value === "light" ? "#e7ecf6" : "#1b2235");
  const select = $("#themeSetting"); if (select) select.value = preference;
  if (save) prefSet("theme", preference);
  if (animate && save && old !== undefined) { const nm = { system: "Mode otomatis aktif", light: "Mode terang aktif", dark: "Mode gelap aktif" }[preference]; toast(nm, "success", { icon: preference === "light" ? "sun" : preference === "dark" ? "moon" : "auto" }); }
  if (typeof refreshMapBase === "function") refreshMapBase();
}

/* ---------- Sesi ---------- */
function showApp(user) {
  state.user = user;
  const login = $("#loginScreen"), shell = $("#appShell");
  document.body.classList.remove("login-active");
  shell.hidden = false; shell.classList.add("app-reveal");
  login.classList.add("login-leave");
  window.setTimeout(() => { login.hidden = true; login.classList.remove("login-leave"); shell.classList.remove("app-reveal"); $(".login-video")?.pause?.(); }, 560);
  $("#profileName").textContent = user; $("#topAccountName").textContent = user;
  renderFavorites(); renderHistory(); updateFavoriteCount();
  navigate("home", false);
}

/* ---------- Navigasi ---------- */
function navigate(page, scroll = true, fromPop = false) {
  if (!pageNames[page]) page = "home";
  const changed = state.page !== page;
  state.page = page;
  if (!fromPop && changed) { try { history.pushState({ tarsus: true, page }, ""); } catch (_) {} }

  $$(".page").forEach(el => {
    const isTarget = el.id === `page-${page}`;
    el.classList.toggle("active", isTarget);
    if (isTarget && changed && !reducedMotion()) {
      el.classList.remove("page-enter"); void el.offsetWidth; el.classList.add("page-enter");
      setTimeout(() => el.classList.remove("page-enter"), 340);
    }
  });
  $$(".kp-seg [data-page]").forEach(el => {
    const on = el.dataset.page === page;
    el.classList.toggle("active", on); on ? el.setAttribute("aria-current", "page") : el.removeAttribute("aria-current");
  });
  $$(".nav-link").forEach(el => {
    const on = (el.dataset.pages || el.dataset.page).split(" ").includes(page);
    el.classList.toggle("active", on); on ? el.setAttribute("aria-current", "page") : el.removeAttribute("aria-current");
  });
  $("#pageCrumb").textContent = pageNames[page];
  closeSidebar(); closeSheet(true);
  hideGlobalResults();

  if (page === "trains") renderTrains($("#trainFilter").value);
  if (page === "stasiun") renderStations();
  if (page === "favorites") renderFavorites();
  if (page === "history") renderHistory();
  if (page === "wiki") renderWiki();
  if (page === "peta") initMap();
  page === "home" ? startAds() : stopAds();

  if (scroll) window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
}

/* ---------- Beranda: sapaan ---------- */
function renderGreeting() {
  const h = new Date().getHours();
  const g = h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
  const el = $("#homeGreeting"); if (el) el.textContent = g;
}

/* ---------- Beranda: carousel iklan (otomatis 3 detik) ---------- */
const ad = { i: 0, timer: null, paused: false, items: [], ms: 3000, startX: null, moved: false };

function buildAds() {
  ad.items = CFG.ads || []; ad.ms = CFG.adIntervalMs || 3000;
  const track = $("#adTrack"), dots = $("#adDots"), box = $("#adCarousel");
  if (!track || !ad.items.length) { box?.setAttribute("hidden", ""); return; }
  track.innerHTML = ad.items.map((a, n) =>
    `<button class="ad-slide" type="button" data-ad="${n}" aria-roledescription="slide" aria-label="${n + 1} dari ${ad.items.length}: ${esc(a.title)}"><img src="${esc(a.image)}" alt="" ${n ? 'loading="lazy"' : ""}><span class="ad-copy"><h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p><span class="ad-more">Lihat poster</span></span></button>`).join("");
  dots.innerHTML = ad.items.map((a, n) => `<button type="button" role="tab" data-ad-dot="${n}" aria-label="Informasi ${n + 1}"></button>`).join("");
  if (!$(".ad-progress", box)) box.insertAdjacentHTML("beforeend", '<div class="ad-progress" aria-hidden="true"><i></i></div>');
  box.style.setProperty("--ad-ms", ad.ms + "ms");
  showAd(0);

  const pause = v => { ad.paused = v; v ? clearTimeout(ad.timer) : scheduleAd(); if (v) $(".ad-progress", box).classList.remove("run"); };
  box.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") pause(true); });
  box.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") pause(false); });
  box.addEventListener("focusin", e => { if (e.target.matches?.(":focus-visible")) pause(true); });
  box.addEventListener("focusout", () => pause(false));
  box.addEventListener("pointerdown", e => { ad.startX = e.clientX; ad.moved = false; });
  box.addEventListener("pointerup", e => {
    if (ad.startX === null) return;
    const dx = e.clientX - ad.startX; ad.startX = null;
    if (Math.abs(dx) > 40) { ad.moved = true; showAd(ad.i + (dx < 0 ? 1 : -1)); }
  });
  box.addEventListener("click", e => {
    if (ad.moved) { ad.moved = false; e.stopPropagation(); return; }
    const dot = e.target.closest("[data-ad-dot]"); if (dot) { showAd(Number(dot.dataset.adDot)); e.stopPropagation(); }
  }, true);
  document.addEventListener("visibilitychange", () => document.hidden ? stopAds() : (state.page === "home" && startAds()));
}

function showAd(n) {
  const len = ad.items.length; if (!len) return;
  ad.i = (n + len) % len;
  $("#adTrack").style.transform = `translate3d(${-100 * ad.i}%,0,0)`;
  $$("#adDots button").forEach((b, k) => { b.classList.toggle("active", k === ad.i); b.setAttribute("aria-selected", k === ad.i); });
  $$("#adTrack .ad-slide").forEach((s, k) => s.setAttribute("aria-hidden", k !== ad.i));
  const c = $("#adCount"); if (c) c.textContent = `${ad.i + 1} / ${len}`;
  scheduleAd();
}

function scheduleAd() {
  clearTimeout(ad.timer);
  const bar = $("#adCarousel .ad-progress"); if (bar) { bar.classList.remove("run"); void bar.offsetWidth; }
  if (ad.paused || document.hidden || state.page !== "home" || ad.items.length < 2) return;
  bar?.classList.add("run");
  ad.timer = setTimeout(() => showAd(ad.i + 1), ad.ms);
}
function startAds() { ad.paused = false; scheduleAd(); }
function stopAds() { clearTimeout(ad.timer); $("#adCarousel .ad-progress")?.classList.remove("run"); }

function openAd(index) {
  const item = ad.items[index]; if (!item) return;
  $("#adModalTitle").textContent = item.title;
  const d = $("#adModalDescription"); d.textContent = item.desc || ""; d.hidden = !item.desc;
  const l = $("#adModalLink"); l.hidden = !item.link; if (item.link) { l.href = item.link; l.textContent = item.linkLabel || "Selengkapnya"; }
  const image = $("#adModalImage"); image.src = item.image; image.alt = item.title;
  $("#adModal").hidden = false; document.body.classList.add("modal-open");
  openAd.opener = document.activeElement; $(".ad-modal-close")?.focus();
}
function closeAd() {
  if ($("#adModal").hidden) return;
  $("#adModal").hidden = true; document.body.classList.remove("modal-open"); openAd.opener?.focus?.(); ad.paused = false; scheduleAd();
}

/* ---------- Pencarian utama ---------- */
const MENU_INDEX = [
  { label: "Tarif Khusus", sub: "Cari tarif, simulasi hemat, cek tiket", page: "tarsus", ic: "ticket", kw: "tarif khusus tarsus harga hemat simulasi" },
  { label: "Cari tarif berdasarkan rute", sub: "Tarif Khusus", page: "search", ic: "pin", kw: "rute asal tujuan stasiun cari tarif" },
  { label: "Cari tarif berdasarkan kereta", sub: "Tarif Khusus", page: "trains", ic: "train", kw: "nama kereta ka cari tarif" },
  { label: "Peta jalur kereta api", sub: "Peta & Stasiun", page: "peta", ic: "map", kw: "peta jalur rel lokasi" },
  { label: "Nama stasiun", sub: "Peta & Stasiun", page: "stasiun", ic: "pin", kw: "daftar stasiun daop divre" },
  { label: "Ensiklopedia KAI", sub: "Istilah, rangkaian, tiket", page: "wiki", ic: "book", kw: "kamus istilah ensiklopedia wiki" },
  { label: "Favorit", sub: "Relasi tersimpan", page: "favorites", ic: "star", kw: "favorit simpan" },
  { label: "Riwayat pencarian", sub: "Pencarian sebelumnya", page: "history", ic: "clock", kw: "riwayat history" },
  { label: "Pengaturan", sub: "Tema dan ukuran teks", page: "settings", ic: "sliders", kw: "pengaturan tema teks" },
  { label: "Panduan penggunaan", sub: "Cara memakai K-Pedia", page: "guide", ic: "info", kw: "panduan bantuan cara" }
];

function stationPool() {
  const names = new Map();
  state.stations.forEach(s => names.set(norm(s.namaStasiun), { name: s.namaStasiun, sub: s.daop || s.provinsi || "Stasiun" }));
  (window.KP_STATIONS || []).forEach(i => { if (!findInfoKey(i, names)) names.set(norm(i.nama), { name: i.nama, sub: i.region || "Stasiun", info: i }); });
  return [...names.values()];
}
function findInfoKey(info, names) { return info.alias.some(a => names.has(norm(a))); }

function globalSearchResults(q) {
  const k = norm(q); if (!k) return [];
  const has = (...t) => t.some(x => norm(x).includes(k));
  const groups = [];
  const menus = MENU_INDEX.filter(m => has(m.label, m.kw)).slice(0, 3)
    .map(m => ({ ic: m.ic, title: m.label, sub: m.sub, act: { type: "page", page: m.page } }));
  if (menus.length) groups.push({ title: "Menu", items: menus });
  const trains = state.trains.filter(t => norm(t.namaKA).includes(k)).slice(0, 4)
    .map(t => ({ ic: "train", title: t.namaKA, sub: `${t.totalRelasi} relasi tarif khusus`, act: { type: "train", key: t.key || t.idKA } }));
  if (trains.length) groups.push({ title: "Kereta", items: trains });
  const stations = stationPool().filter(s => norm(s.name).includes(k))
    .sort((a, b) => (norm(a.name).startsWith(k) ? 0 : 1) - (norm(b.name).startsWith(k) ? 0 : 1)).slice(0, 4)
    .map(s => ({ ic: "pin", title: s.name, sub: s.sub, act: { type: "station", name: s.name } }));
  if (stations.length) groups.push({ title: "Stasiun", items: stations });
  if (window.KP_SEARCH && state.wiki?.entries.length) {
    const r = window.KP_SEARCH.query(q, { limit: 4, faqLimit: 1 });
    if (r.faq.length) groups.unshift({ title: "Jawaban cepat", items: r.faq.map(f => ({ ic: "check", title: f.q, sub: f.a, long: true, act: { type: "wiki", id: f.topic, anchor: f.section } })) });
    const wiki = r.topics.filter(t => !r.faq.some(f => f.topic === t.id)).slice(0, 3).map(t => ({ ic: "book", title: t.entry.judul, sub: wikiCatName(t.entry.kategori) + " · " + t.section.heading, act: { type: "wiki", id: t.id, anchor: t.section.anchor } }));
    if (wiki.length) groups.push({ title: "Ensiklopedia", items: wiki });
  }
  return groups;
}

let gsItems = [];
function renderGlobalResults() {
  const q = $("#globalSearch").value, root = $("#globalResults");
  $("#clearGlobal").hidden = !q; const sr = $("#gsearch .suggest-row"); if (sr) sr.hidden = !!q.trim();
  if (!q.trim()) { hideGlobalResults(); return; }
  const groups = globalSearchResults(q); gsItems = [];
  root.innerHTML = groups.length ? groups.map(g => `<div class="gr-title">${esc(g.title)}</div>` + g.items.map(it => {
    gsItems.push(it);
    return `<button type="button" class="gr-item" role="option" data-gs="${gsItems.length - 1}"><span class="gr-ic">${icon(it.ic)}</span><span class="gr-text"><strong>${esc(it.title)}</strong><small class="${it.long ? "long" : ""}">${esc(it.sub)}</small></span></button>`;
  }).join("")).join("") : `<div class="gr-empty">Tidak ada hasil untuk “${esc(q.trim())}”. Coba nama kereta, stasiun, atau istilah lain.</div>`;
  root.hidden = false;
}
function hideGlobalResults() { const r = $("#globalResults"); if (r) { r.hidden = true; } }
function runAction(act) {
  hideGlobalResults();
  if (act.type === "page") navigate(act.page);
  else if (act.type === "train") { navigate("trains"); openTrain(act.key); }
  else if (act.type === "station") openStation(act.name);
  else if (act.type === "wiki") openWiki(act.id, act.anchor);
}
function initGlobalSearch() {
  const input = $("#globalSearch");
  input.addEventListener("input", renderGlobalResults);
  input.addEventListener("focus", () => input.value.trim() && renderGlobalResults());
  input.addEventListener("keydown", e => {
    const rows = $$(".gr-item", $("#globalResults")); if ($("#globalResults").hidden || !rows.length) return;
    let i = rows.findIndex(r => r.classList.contains("is-active"));
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); rows[i]?.classList.remove("is-active");
      i = e.key === "ArrowDown" ? (i + 1) % rows.length : (i <= 0 ? rows.length - 1 : i - 1);
      rows[i].classList.add("is-active"); rows[i].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") { e.preventDefault(); (rows[i] || rows[0]).click(); }
    else if (e.key === "Escape") hideGlobalResults();
  });
  $("#clearGlobal").addEventListener("click", () => { input.value = ""; hideGlobalResults(); $("#clearGlobal").hidden = true; input.focus(); });
  $("#globalResults").addEventListener("click", e => { const b = e.target.closest("[data-gs]"); if (b) runAction(gsItems[Number(b.dataset.gs)].act); });
  document.addEventListener("click", e => { if (!e.target.closest("#gsearch")) hideGlobalResults(); });
}

/* ---------- Menu Tarif Khusus ---------- */
function renderTarsusInfo() {
  const t = CFG.tarsus || {};
  $("#tarsusSteps").innerHTML = (t.steps || []).map(s => `<li><strong>${esc(s.t)}</strong><span>${esc(s.d)}</span></li>`).join("");
  $("#tarsusTerms").innerHTML = (t.terms || []).map((s, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(s.t)}</summary><p>${esc(s.d)}</p></details>`).join("");
  const L = CFG.links || {};
  if (L.access) $("#ctaAccess").href = L.access;
  if (L.call) $("#ctaCall").href = L.call;
}

const sim = { pax: 1 };
function parseMoney(v) { const n = Number(String(v).replace(/\D/g, "")); return Number.isFinite(n) ? n : 0; }
function fmtNum(n) { return new Intl.NumberFormat("id-ID").format(n); }
function runSim(source) {
  const rn = $("#simNormal"), rs = $("#simSpecial"), nn = $("#simNormalNum"), ns = $("#simSpecialNum");
  let normal, special;
  if (source === "rn") { normal = Number(rn.value); nn.value = fmtNum(normal); }
  else if (source === "nn") { normal = parseMoney(nn.value); nn.value = normal ? fmtNum(normal) : ""; rn.value = Math.min(normal, Number(rn.max)); }
  else normal = parseMoney(nn.value);
  if (source === "rs") { special = Number(rs.value); ns.value = fmtNum(special); }
  else if (source === "ns") { special = parseMoney(ns.value); ns.value = special ? fmtNum(special) : ""; rs.value = Math.min(special, Number(rs.max)); }
  else special = parseMoney(ns.value);
  [rn, rs].forEach(r => r.style.setProperty("--p", (Number(r.value) / Number(r.max) * 100) + "%"));

  const trips = $("#simRound").checked ? 2 : 1, mult = sim.pax * trips;
  const diff = normal - special, total = diff * mult, top = Math.max(normal, special, 1);
  $("#barNormal").style.width = (normal / top * 100) + "%";
  $("#barSpecial").style.width = (special / top * 100) + "%";
  $("#valNormal").textContent = rupiah(normal * mult); $("#valSpecial").textContent = rupiah(special * mult);
  const loss = diff < 0;
  $("#simSave").textContent = rupiah(Math.abs(total));
  $("#simLabel").textContent = loss ? "Tarif khusus lebih mahal" : diff === 0 ? "Tidak ada selisih" : "Kamu hemat";
  $(".sim-save").classList.toggle("is-loss", loss);
  $("#simPct").textContent = normal > 0 ? (loss ? "+" : "") + Math.abs(Math.round(diff / normal * 100)) + "%" : "–";
  $("#simNote").textContent = `${sim.pax} penumpang${trips === 2 ? ", pulang pergi" : ""}. Selisih per orang per perjalanan: ${rupiah(Math.abs(diff))}.`;
}
function initSim() {
  $("#simNormal").addEventListener("input", () => runSim("rn"));
  $("#simSpecial").addEventListener("input", () => runSim("rs"));
  $("#simNormalNum").addEventListener("input", () => runSim("nn"));
  $("#simSpecialNum").addEventListener("input", () => runSim("ns"));
  $("#simRound").addEventListener("change", () => runSim());
  $("#simMinus").addEventListener("click", () => { sim.pax = Math.max(1, sim.pax - 1); $("#simPax").textContent = sim.pax; runSim(); });
  $("#simPlus").addEventListener("click", () => { sim.pax = Math.min(20, sim.pax + 1); $("#simPax").textContent = sim.pax; runSim(); });
  runSim();
}

/* ---------- Informasi stasiun ---------- */
const CAT = {
  antarkota: { c: "#2f7de1", label: "Antarkota", ic: "train" },
  commuter:  { c: "#14a3b3", label: "KRL & lokal", ic: "train" },
  bandara:   { c: "#e8920c", label: "Bandara & feeder", ic: "plane" },
  whoosh:    { c: "#e0463d", label: "Whoosh", ic: "bolt" },
  heritage:  { c: "#8b6b3e", label: "Non-aktif & sejarah", ic: "landmark" }
};
let infoIndex = null;
function getInfoIndex() {
  if (infoIndex) return infoIndex;
  infoIndex = new Map();
  (window.KP_STATIONS || []).forEach(i => [i.nama, ...(i.alias || [])].forEach(a => infoIndex.set(norm(a), i)));
  return infoIndex;
}
const infoFor = name => getInfoIndex().get(norm(name)) || null;

function trainsAtStation(info, name) {
  const keys = new Set([norm(name), ...((info?.alias) || []).map(norm)]);
  const seen = new Map();
  state.tariffs.forEach(t => { if ((t.stations || []).some(s => keys.has(norm(s)))) seen.set(norm(t.namaKA), t.namaKA); });
  return [...seen.values()].sort((a, b) => a.localeCompare(b, "id"));
}

function stationDetailHTML(name, info) {
  const sheetRow = state.stations.find(s => norm(s.namaStasiun) === norm(name)) || (info && state.stations.find(s => (info.alias || []).some(a => norm(a) === norm(s.namaStasiun))));
  const cat = info ? CAT[info.kategori] : null;
  const region = info?.region || sheetRow?.daop || "";
  const prov = info?.provinsi || sheetRow?.provinsi || "";
  const title = info?.nama || sheetRow?.namaStasiun || name;
  const facts = [["Daop / Divre", region], ["Provinsi", prov], ["Kota", info?.kota], ["Elevasi", info?.elevasi ? info.elevasi + " mdpl" : ""], ["Periode", info?.periode], ["Kode", info?.kode]].filter(f => f[1]);
  const trains = trainsAtStation(info, title);
  const gmaps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(info?.maps || ("Stasiun " + title));
  const sec = (h, body) => body ? `<section class="st-sec"><h3>${h}</h3>${body}</section>` : "";
  const active = !info || info.status !== "inactive";
  return `<div class="st-hero"><img src="${esc(info?.foto || "assets/stations/placeholder.svg")}" alt="" onerror="this.onerror=null;this.src='assets/stations/placeholder.svg'"><div class="st-hero-text"><h2 id="sheetTitle">${esc(title)}</h2><p>${esc([info?.subjudul, region].filter(Boolean).join(" · ") || "Stasiun kereta api")}</p></div></div>
  <div class="st-pad">
    <div class="st-badges">${cat ? `<span class="badge" style="--c:${cat.c}"><i></i>${cat.label}</span>` : ""}${info ? `<span class="badge ${active ? "ok" : ""}">${active ? "Beroperasi" : "Tidak aktif"}</span>` : ""}</div>
    ${facts.length ? `<div class="st-facts">${facts.map(f => `<div><span>${f[0]}</span><strong>${esc(f[1])}</strong></div>`).join("")}</div>` : ""}
    ${info ? sec("Ulasan", info.ulasan ? `<p>${esc(info.ulasan)}</p>` : "") : `<div class="st-empty">Informasi lengkap stasiun ini (ulasan, fasilitas, sejarah) belum ditambahkan. Daftar kereta tarif khusus yang melintas tetap tersedia di bawah.</div>`}
    ${info ? sec("Deskripsi", info.deskripsi ? `<p>${esc(info.deskripsi)}</p>` : "") : ""}
    ${info?.fasilitas?.length ? sec(active ? "Fasilitas" : "Peninggalan", `<ul class="fac-list">${info.fasilitas.map(f => `<li>${icon("check")}${esc(f)}</li>`).join("")}</ul>`) : ""}
    ${info ? sec("Sejarah", info.sejarah ? `<p>${esc(info.sejarah)}</p>` : "") : ""}
    ${info ? sec("Denah dan akses", info.denah ? `<p>${esc(info.denah)}</p>` : "") : ""}
    ${trains.length ? `<section class="st-sec"><h3>Kereta tarif khusus yang melintas</h3><div class="st-trains">${trains.slice(0, 12).map(t => `<button type="button" data-open-train="${esc(t)}">${icon("train")}${esc(t)}</button>`).join("")}</div>${trains.length > 12 ? `<p style="margin-top:8px">dan ${trains.length - 12} kereta lainnya.</p>` : ""}</section>` : ""}
    <div class="st-actions">
      ${info?.koordinat?.length ? `<button class="primary-button" type="button" data-map-station="${esc(info.id)}">${icon("map", "ic-sm")}Lihat di peta</button>` : ""}
      <a class="secondary-button" href="${gmaps}" target="_blank" rel="noopener noreferrer">${icon("external", "ic-sm")}Google Maps</a>
      ${active && CFG.links?.access ? `<a class="secondary-button" href="${esc(CFG.links.access)}" target="_blank" rel="noopener noreferrer">${icon("ticket", "ic-sm")}Cek tiket</a>` : ""}
    </div>
  </div>`;
}

let sheetOpener = null;
function openStation(ref) {
  const info = typeof ref === "string" ? infoFor(ref) : ref;
  const name = typeof ref === "string" ? ref : ref.nama;
  $("#sheetBody").innerHTML = stationDetailHTML(name, info);
  $("#sheetBody").scrollTop = 0;
  $("#stationSheet").hidden = false; document.body.classList.add("modal-open");
  sheetOpener = document.activeElement; $(".sheet-close").focus();
  if (info && typeof markStation === "function") markStation(info.id);
}
function closeSheet(silent) {
  if ($("#stationSheet").hidden) return;
  $("#stationSheet").hidden = true; document.body.classList.remove("modal-open");
  if (!silent) sheetOpener?.focus?.();
}

/* ---------- Daftar nama stasiun ---------- */
function stationEntries() {
  const list = state.stations.map(s => ({ name: s.namaStasiun, region: s.daop || "Wilayah belum ditentukan", info: infoFor(s.namaStasiun) }));
  const have = new Set(list.map(s => norm(s.name)));
  (window.KP_STATIONS || []).forEach(i => { if (!(i.alias || []).some(a => have.has(norm(a)))) list.push({ name: i.nama, region: i.region || "Wilayah belum ditentukan", info: i }); });
  return list;
}
function renderStations(more) {
  const root = $("#stationList");
  if (!state.ready && state.loading && !(window.KP_STATIONS || []).length) { root.innerHTML = skeletons(); return; }
  if (!state.ready && !state.loading && !state.stations.length && !(window.KP_STATIONS || []).length) {
    root.innerHTML = empty("Database belum siap", "Direktori stasiun akan muncul setelah data dimuat."); return;
  }
  if (more !== true) state.stationLimit = 120;
  const q = norm($("#stationFilter").value), division = $("#divisionFilter").value;
  const all = stationEntries().filter(s => (!q || norm(s.name).includes(q)) && (!division || s.region === division));
  $("#stationCount").textContent = `${all.length} stasiun${q || division ? " cocok" : ""}`;
  if (!all.length) { root.innerHTML = empty("Stasiun tidak ditemukan", "Ubah kata kunci atau pilihan wilayah."); return; }
  all.sort((a, b) => a.region.localeCompare(b.region, "id") || a.name.localeCompare(b.name, "id"));
  const shown = all.slice(0, state.stationLimit), grouped = new Map();
  shown.forEach(s => { if (!grouped.has(s.region)) grouped.set(s.region, []); grouped.get(s.region).push(s); });
  const totals = new Map(); all.forEach(s => totals.set(s.region, (totals.get(s.region) || 0) + 1));
  root.innerHTML = [...grouped.entries()].map(([region, items]) =>
    `<section class="station-region"><div class="region-head"><h3>${esc(region)}</h3><span>${totals.get(region)} stasiun</span></div><div class="station-name-grid">${items.map(s =>
      `<button type="button" class="station-name-row" data-station="${esc(s.name)}"><span class="station-dot"></span><span>${esc(s.name)}</span>${s.info ? '<span class="has-info">Info</span>' : ""}</button>`).join("")}</div></section>`).join("") +
    (all.length > shown.length ? `<button type="button" class="secondary-button more-btn" id="moreStations" style="grid-column:1/-1;justify-self:center">Tampilkan lebih banyak (${all.length - shown.length})</button>` : "");
}
function populateDivisionFilter() {
  const select = $("#divisionFilter"), current = select.value;
  const divisions = [...new Set(stationEntries().map(s => s.region).filter(Boolean))].sort((a, b) => a.localeCompare(b, "id"));
  select.innerHTML = '<option value="">Semua Daop / Divre</option>' + divisions.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join("");
  select.value = divisions.includes(current) ? current : "";
}

/* ---------- Peta (Leaflet dimuat saat dibutuhkan) ---------- */
const MAP = { map: null, loading: null, base: null, baseKey: "clean", rail: null, markers: new Map(), cat: "all", user: null, sel: null };
const LEAFLET = [
  ["https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"],
  ["https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js", "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"]
];
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("gagal " + src)); document.head.append(s); }); }
function loadLeaflet() {
  if (window.L) return Promise.resolve();
  if (MAP.loading) return MAP.loading;
  MAP.loading = (async () => {
    for (const [js, css] of LEAFLET) {
      try {
        if (!document.querySelector('link[data-leaflet]')) { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = css; l.dataset.leaflet = "1"; document.head.append(l); }
        await loadScript(js); if (window.L) return;
      } catch (_) { document.querySelector('link[data-leaflet]')?.remove(); }
    }
    throw new Error("Leaflet tidak dapat dimuat");
  })().catch(e => { MAP.loading = null; throw e; });
  return MAP.loading;
}

function baseLayerFor(key) {
  const dark = document.body.dataset.theme === "dark";
  if (key === "osm") return L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" });
  if (key === "sat") return L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 18, maxNativeZoom: 17, attribution: "Tiles © Esri" });
  return L.tileLayer(`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${dark ? "Dark" : "Light"}_Gray_Base/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 18, maxNativeZoom: 16, attribution: "Tiles © Esri" });
}
function setBase(key) {
  if (!MAP.map) return;
  MAP.baseKey = key || MAP.baseKey;
  if (MAP.base) MAP.map.removeLayer(MAP.base);
  MAP.base = baseLayerFor(MAP.baseKey).addTo(MAP.map); MAP.base.bringToBack();
  $$("#layerMenu [data-base]").forEach(b => b.classList.toggle("active", b.dataset.base === MAP.baseKey));
}
function refreshMapBase() { if (MAP.map && MAP.baseKey === "clean") setBase(); }

function pinIcon(info) {
  const c = CAT[info.kategori] || CAT.antarkota;
  return L.divIcon({ className: "kp-pin " + info.kategori, html: `<span style="--c:${c.c}">${icon(c.ic)}</span>`, iconSize: [32, 32], iconAnchor: [16, 16] });
}
function renderMarkers() {
  if (!MAP.map) return;
  MAP.markers.forEach(m => m.remove()); MAP.markers.clear();
  (window.KP_STATIONS || []).filter(i => i.koordinat?.length === 2 && (MAP.cat === "all" || i.kategori === MAP.cat)).forEach(i => {
    const m = L.marker(i.koordinat, { icon: pinIcon(i), title: i.nama, keyboard: true, riseOnHover: true }).addTo(MAP.map);
    m.on("click", () => { MAP.map.flyTo(i.koordinat, Math.max(MAP.map.getZoom(), 11), { duration: .7 }); openStation(i); });
    MAP.markers.set(i.id, m);
  });
}
function markStation(id) {
  if (MAP.sel) MAP.markers.get(MAP.sel)?.getElement()?.classList.remove("is-sel");
  MAP.sel = id; MAP.markers.get(id)?.getElement()?.classList.add("is-sel");
}
function fitAll() {
  const pts = (window.KP_STATIONS || []).map(i => i.koordinat).filter(c => c?.length === 2);
  if (pts.length) MAP.map.fitBounds(pts, { padding: [48, 48], maxZoom: 8 });
}
function focusStationOnMap(id) {
  const info = (window.KP_STATIONS || []).find(i => i.id === id); if (!info) return;
  closeSheet(true); MAP.cat = "all";
  navigate("peta");
  initMap().then(() => { renderChips(); renderMarkers(); MAP.map.flyTo(info.koordinat, 13, { duration: 1 }); markStation(id); });
}
function renderChips() {
  const chips = [["all", "Semua", "#7a8aa0"], ...Object.entries(CAT).map(([k, v]) => [k, v.label, v.c])];
  $("#mapChips").innerHTML = chips.map(([k, l, c]) => `<button type="button" data-chip="${k}" style="--c:${c}" class="${MAP.cat === k ? "active" : ""}"><i></i>${l}</button>`).join("");
}
function initMap() {
  const fallback = $("#mapFallback");
  return loadLeaflet().then(() => {
    fallback.hidden = true;
    if (!MAP.map) {
      MAP.map = L.map("kpMap", { center: [-6.9, 108.8], zoom: 6, minZoom: 4, maxZoom: 18, zoomControl: false, worldCopyJump: false });
      L.control.zoom({ position: "bottomright" }).addTo(MAP.map);
      MAP.map.createPane("rail").style.zIndex = 250;
      MAP.rail = L.tileLayer("https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png", { pane: "rail", maxZoom: 18, attribution: "Rel © OpenRailwayMap" }).addTo(MAP.map);
      setBase("clean"); renderChips(); renderMarkers(); fitAll();
    }
    setTimeout(() => MAP.map.invalidateSize(), 60);
  }).catch(err => { console.warn("[K-Pedia] Peta:", err); fallback.hidden = false; });
}
function initMapUI() {
  $("#mapRetry").addEventListener("click", initMap);
  $("#layerBtn").addEventListener("click", e => { const m = $("#layerMenu"); m.hidden = !m.hidden; e.currentTarget.setAttribute("aria-expanded", String(!m.hidden)); });
  $("#layerMenu").addEventListener("click", e => { const b = e.target.closest("[data-base]"); if (b) setBase(b.dataset.base); });
  $("#railToggle").addEventListener("change", e => { if (!MAP.map) return; e.target.checked ? MAP.rail.addTo(MAP.map) : MAP.map.removeLayer(MAP.rail); });
  $("#mapChips").addEventListener("click", e => { const b = e.target.closest("[data-chip]"); if (!b || !MAP.map) return; MAP.cat = b.dataset.chip; renderChips(); renderMarkers(); });
  $("#locateBtn").addEventListener("click", () => {
    if (!MAP.map) return;
    if (!navigator.geolocation) { toast("Perangkat tidak mendukung lokasi.", "error"); return; }
    navigator.geolocation.getCurrentPosition(p => {
      const ll = [p.coords.latitude, p.coords.longitude];
      MAP.user?.remove(); MAP.user = L.marker(ll, { icon: L.divIcon({ className: "", html: '<div class="user-dot"></div>', iconSize: [16, 16] }), interactive: false }).addTo(MAP.map);
      MAP.map.flyTo(ll, 12, { duration: .9 });
    }, () => toast("Lokasi tidak dapat diakses. Periksa izin lokasi.", "error"), { timeout: 8000 });
  });
  const input = $("#mapSearch"), box = $("#mapSuggest");
  input.addEventListener("input", () => {
    const q = norm(input.value); if (!q) { box.hidden = true; return; }
    const hits = (window.KP_STATIONS || []).filter(i => [i.nama, ...(i.alias || []), i.kota].some(x => norm(x).includes(q))).slice(0, 6);
    box.innerHTML = hits.length ? hits.map(i => `<button type="button" class="suggestion-row" data-map-station="${esc(i.id)}"><span class="suggestion-dot"></span><span>${esc(i.nama)}</span></button>`).join("") : '<div class="suggestion-empty">Stasiun tidak ditemukan di peta.</div>';
    box.hidden = false;
  });
  box.addEventListener("click", e => { if (e.target.closest("[data-map-station]")) { box.hidden = true; input.value = ""; } });
  document.addEventListener("click", e => { if (!e.target.closest(".map-search")) box.hidden = true; if (!e.target.closest("#layerMenu,#layerBtn")) { $("#layerMenu").hidden = true; $("#layerBtn").setAttribute("aria-expanded", "false"); } });
}

/* ---------- Ensiklopedia ---------- */
state.wiki = { categories: [], entries: [], faq: [], cat: "all", q: "", open: null, anchor: null, source: "lokal" };
const wikiCatName = id => state.wiki.categories.find(c => c.id === id)?.nama || id;

function normalizeWiki(cats, entries) {
  const on = v => !/^(tidak|no|false|0|nonaktif)$/i.test(String(v ?? "Ya").trim());
  return {
    categories: cats.filter(c => c.id && c.nama).sort((a, b) => Number(a.urutan || 99) - Number(b.urutan || 99)),
    entries: entries.filter(e => e.id && e.judul && on(e.aktif)).sort((a, b) => Number(a.urutan || 999) - Number(b.urutan || 999))
  };
}
const normalizeFaq = list => (list || []).filter(f => f.pertanyaan && f.jawaban && !/^(tidak|no|false|0)$/i.test(String(f.aktif ?? "Ya").trim())).map(f => ({ pertanyaan: f.pertanyaan, jawaban: f.jawaban, topik: f.topik, bagian: f.bagian || "", kata_kunci: f.kata_kunci || f.kata_kunci || "", sumber: f.sumber || "" }));
function buildSearch() { try { window.KP_SEARCH?.build(state.wiki.entries, state.wiki.faq); } catch (e) { console.warn("[K-Pedia] indeks pencarian gagal", e); } }
async function loadWiki() {
  const local = window.KP_WIKI || { categories: [], entries: [] };
  Object.assign(state.wiki, normalizeWiki(local.categories, local.entries), { faq: normalizeFaq(local.faq) });
  buildSearch();
  const cfg = CFG.wiki || {};
  if (!cfg.sheetId) return;
  try { /* Tersambung ke Google Sheets bila sheetId diisi di content.js */
    const get = async name => { const r = await fetch(`https://docs.google.com/spreadsheets/d/${cfg.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`, { cache: "no-store" }); if (!r.ok) throw new Error(name); return rowsToObjects(parseCSV(await r.text())).map(o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k.toLowerCase(), v]))); };
    const [cats, ents] = await Promise.all([get(cfg.sheetCategories || "WIKI_KATEGORI"), get(cfg.sheetEntries || "WIKI")]);
    const data = normalizeWiki(cats, ents);
    let faq = state.wiki.faq;
    try { faq = normalizeFaq(await get(cfg.sheetFaq || "WIKI_FAQ")); } catch (_) { /* sheet FAQ opsional */ }
    if (data.entries.length) { Object.assign(state.wiki, data, { faq, source: "sheet" }); buildSearch(); renderWiki(); }
  } catch (e) { console.warn("[K-Pedia] Wiki memakai data bawaan:", e); }
}

function wikiBodyHTML(text) {
  const out = [];
  String(text || "").split(/\n\s*\n/).forEach(block => {
    let cur = null;
    block.split("\n").forEach(raw => {
      const line = raw.trim(); if (!line) return;
      const hd = /^##\s+(.*)/.exec(line);
      if (hd) { out.push({ type: "h", items: [hd[1]] }); cur = null; return; }
      const ul = /^[-•]\s+(.*)/.exec(line), ol = /^\d+[.)]\s+(.*)/.exec(line);
      const type = ul ? "ul" : ol ? "ol" : "p", content = esc(ul ? ul[1] : ol ? ol[1] : line);
      if (cur && cur.type === type && type !== "p") cur.items.push(content);
      else { cur = { type, items: [content] }; out.push(cur); }
    });
  });
  return out.map(b => b.type === "h" ? `<h3 id="sec-${window.KP_SEARCH.slug(b.items[0])}">${esc(b.items[0])}</h3>` : b.type === "p" ? `<p>${b.items.join(" ")}</p>` : `<${b.type}>${b.items.map(i => `<li>${i}</li>`).join("")}</${b.type}>`).join("");
}
const wikiSections = text => [...String(text || "").matchAll(/^##\s+(.*)$/gm)].map(m => ({ name: m[1].trim(), id: window.KP_SEARCH.slug(m[1]) }));
const linkify = t => esc(t).replace(/(https?:\/\/[^\s<]+)/g, u => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u.replace(/^https?:\/\/(www\.)?/, "").slice(0, 52)}${u.length > 60 ? "…" : ""}</a>`);
const hl = (text, terms) => { let h = esc(text); (terms || []).filter(t => t.length >= 3).forEach(t => { h = h.replace(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[a-z]*)", "ig"), "<mark>$1</mark>"); }); return h; };

function renderWiki() {
  const W = state.wiki;
  $("#wikiHome").hidden = !!W.open; $("#wikiDetail").hidden = !W.open;
  if (W.open) { renderWikiDetail(); return; }
  $("#wikiChips").innerHTML = [{ id: "all", nama: "Semua" }, ...W.categories].map(c => `<button type="button" data-wiki-cat="${esc(c.id)}" class="${W.cat === c.id ? "active" : ""}">${esc(c.nama)}</button>`).join("");
  const q = norm(W.q);
  const root = $("#wikiList");
  $("#wikiSuggest").hidden = !!q;
  if (q) { renderWikiSearch(q, root); return; }
  const list = W.entries.filter(e => W.cat === "all" || e.kategori === W.cat);
  if (!list.length) { root.innerHTML = `<div class="empty-state glass" style="grid-column:1/-1"><span class="empty-symbol">${icon("book")}</span><h3>Topik tidak ditemukan</h3><p>Coba kata kunci lain atau pilih kategori Semua.</p></div>`; return; }
  const card = e => `<button type="button" class="wiki-card" data-wiki="${esc(e.id)}"><strong>${esc(e.judul)}</strong><span>${esc(e.ringkasan)}</span></button>`;
  if (W.cat === "all" && !q) {
    root.innerHTML = W.categories.map(c => { const items = list.filter(e => e.kategori === c.id); return items.length ? `<div class="wiki-group-title"><h2>${esc(c.nama)}</h2><span>${esc(c.deskripsi || "")}</span></div>${items.map(card).join("")}` : ""; }).join("");
  } else root.innerHTML = list.map(card).join("");
}
function renderWikiSearch(q, root) {
  const W = state.wiki, r = window.KP_SEARCH.query(q, { limit: 10 });
  if (!r.topics.length) { root.innerHTML = `<div class="empty-state glass" style="grid-column:1/-1"><span class="empty-symbol">${icon("book")}</span><h3>Belum ketemu</h3><p>Coba kalimat lain, misalnya “cara batalkan tiket” atau “aturan bagasi”.</p></div>`; return; }
  const ans = r.faq.map(f => `<button type="button" class="wiki-answer" data-wiki="${esc(f.topic)}" data-anchor="${esc(f.section)}"><span class="wa-tag">Jawaban cepat</span><strong>${esc(f.q)}</strong><p>${hl(f.a, r.terms)}</p><small>Lihat penjelasan lengkap · ${esc(wikiTitle(f.topic))}</small></button>`).join("");
  const cards = r.topics.map(t => `<button type="button" class="wiki-card" data-wiki="${esc(t.id)}" data-anchor="${esc(t.section.anchor)}"><small class="wc-cat">${esc(wikiCatName(t.entry.kategori))}</small><strong>${esc(t.entry.judul)}</strong><span>${hl(t.section.snippet || t.entry.ringkasan, r.terms)}</span><em class="wc-sec">Bagian: ${esc(t.section.heading)}</em></button>`).join("");
  root.innerHTML = (ans ? `<div class="wiki-answers">${ans}</div>` : "") + `<div class="wiki-group-title"><h2>Topik yang cocok</h2></div>${cards}`;
}
const wikiTitle = id => state.wiki.entries.find(x => x.id === id)?.judul || id;
function openWiki(id, anchor) {
  const e = state.wiki.entries.find(x => x.id === id); if (!e) return;
  state.wiki.anchor = anchor || null;
  state.wiki.open = id; navigate("wiki"); renderWiki();
}
function renderWikiDetail() {
  const W = state.wiki, e = W.entries.find(x => x.id === W.open), root = $("#wikiDetail");
  if (!e) { W.open = null; renderWiki(); return; }
  const rel = W.entries.filter(x => x.kategori === e.kategori && x.id !== e.id).slice(0, 4);
  const secs = wikiSections(e.isi);
  const tags = String(e.tag || "").split(",").map(t => t.trim()).filter(Boolean);
  root.innerHTML = `<button class="quiet-link" type="button" id="wikiBack">${icon("back", "ic-sm")}Ensiklopedia</button>
  <div class="wiki-article glass"><span class="eyebrow">${esc(wikiCatName(e.kategori))}</span><h1>${esc(e.judul)}</h1><p class="wiki-lead">${esc(e.ringkasan)}</p>
  ${secs.length > 2 ? `<nav class="wiki-toc" aria-label="Isi halaman">${secs.map(x => `<button type="button" data-wiki-jump="${esc(x.id)}">${esc(x.name)}</button>`).join("")}</nav>` : ""}
  <div class="wiki-body">${wikiBodyHTML(e.isi)}</div>
  ${tags.length ? `<div class="wiki-tags">${tags.map(t => `<button type="button" data-wiki-tag="${esc(t)}">${esc(t)}</button>`).join("")}</div>` : ""}
  <div class="wiki-meta">${e.sumber ? `<div class="wiki-sources"><strong>Sumber</strong><ol>${String(e.sumber).split("\n").filter(Boolean).map(l => /^Catatan:/.test(l) ? `<li class="src-note">${esc(l)}</li>` : `<li>${linkify(l)}</li>`).join("")}</ol></div>` : ""}${e.diperbarui ? `<span><strong>Diperbarui:</strong> ${esc(e.diperbarui)}</span>` : ""}<span>Ketentuan dapat berubah. Pastikan kembali ke sumber resmi KAI.</span></div></div>
  ${rel.length ? `<div class="wiki-related"><h3>Topik terkait</h3><div class="wiki-list">${rel.map(r => `<button type="button" class="wiki-card" data-wiki="${esc(r.id)}"><strong>${esc(r.judul)}</strong><span>${esc(r.ringkasan)}</span></button>`).join("")}</div></div>` : ""}`;
  const target = W.anchor && document.getElementById("sec-" + W.anchor);
  if (target) setTimeout(() => { target.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" }); target.classList.add("flash"); setTimeout(() => target.classList.remove("flash"), 2200); }, 80);
  else window.scrollTo({ top: 0 });
  if (W.anchor) setTimeout(() => { W.anchor = null; }, 800);
}

/* ---------- Boot: logo morphing ---------- */
function runBoot(onDone) {
  const boot = $("#bootScreen"), K = $("#bootK"), word = $("#bootWord"), stage = $("#bootStage");
  const finishFade = () => { boot.classList.add("boot-screen-out"); setTimeout(() => { boot.remove(); onDone?.(); }, reducedMotion() ? 100 : 560); };
  const TARGET = { a: "M48 130Q48 92 88 92L146 92L146 208L292 94Q296 90 304 91L408 95Q412 97 408 101L274 212Q150 248 48 328Z",
                   b: "M48 372Q150 270 262 231L87 405L48 405Z",
                   c: "M127 405L286 238Q300 224 314 238L474 400Q477 405 470 405L362 405L254 298L184 405Z" };
  const els = { a: $("#bkA"), b: $("#bkB"), c: $("#bkC") };
  const setFinal = () => { Object.keys(TARGET).forEach(k => els[k].setAttribute("d", TARGET[k])); };
  $("#bkClipPath").setAttribute("d", TARGET.a + TARGET.b + TARGET.c);
  if (reducedMotion() || !els.a.getTotalLength) {
    setFinal(); word.style.clipPath = "inset(0 0 0 36.2%)"; $("#bkRail").style.display = "none";
    setTimeout(finishFade, 700); return;
  }
  const N = 200;
  const sample = d => { const p = els.a; const keep = p.getAttribute("d"); p.setAttribute("d", d); const L = p.getTotalLength(); const pts = []; for (let i = 0; i < N; i++) { const q = p.getPointAtLength(L * i / N); pts.push([q.x, q.y]); } p.setAttribute("d", keep || ""); return pts; };
  const circle = (cx, cy, r) => Array.from({ length: N }, (_, i) => { const t = i / N * Math.PI * 2 - Math.PI / 2; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; });
  const cost = (A, B, s) => { let c = 0; for (let i = 0; i < N; i += 4) { const a = A[i], b = B[(i + s) % N]; c += (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2; } return c; };
  const align = (from, to) => { let best = null; [from, [...from].reverse()].forEach(f => { for (let s = 0; s < N; s += 2) { const c = cost(f, to, s); if (!best || c < best.c) best = { c, f, s }; } }); return Array.from({ length: N }, (_, i) => best.f[(i + best.s) % N]); };
  const cy = 248, starts = { a: circle(134, cy, 15), c: circle(389, cy, 15), b: circle(261, cy, 15) };
  const tgt = {}, from = {};
  Object.keys(TARGET).forEach(k => { tgt[k] = sample(TARGET[k]); });
  Object.keys(TARGET).forEach(k => { from[k] = align(starts[k], tgt[k]); });
  const draw = (k, t) => { const f = from[k], g = tgt[k]; let d = ""; for (let i = 0; i < N; i++) d += (i ? "L" : "M") + (f[i][0] + (g[i][0] - f[i][0]) * t).toFixed(1) + " " + (f[i][1] + (g[i][1] - f[i][1]) * t).toFixed(1); els[k].setAttribute("d", d + "Z"); };
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (t, s, e) => clamp((t - s) / (e - s));

  // Posisi awal: logo K besar di tengah panggung
  const sw = stage.clientWidth, sh = stage.clientHeight;
  const kx = sw * (.0224 + .337 / 2), ky = sh * (.0578 + .639 / 2);
  const dx = sw / 2 - kx, dy = sh / 2 - ky, S0 = 1.7;
  const rail = $("#bkRail"), shine = $("#bkShineRect");
  Object.keys(TARGET).forEach(k => draw(k, 0));
  [els.a, els.c].forEach(e => e.style.opacity = 0); els.b.style.opacity = 0;
  const T = { rail: 450, morph: 1250, settle: 1350, move: 2250, wipe: 2750, hold: 3350 };
  const t0 = performance.now();
  (function frame(now) {
    const t = now - t0;
    rail.style.strokeDashoffset = 1 - ease(seg(t, 0, T.rail));
    const pop = i => clamp(seg(t, 150 + i * 90, 450 + i * 90)); // titik stasiun muncul berurutan
    ["a", "b", "c"].forEach((k, i) => {
      const m = ease(seg(t, 520 + [0, 180, 90][i], T.morph + [0, 180, 90][i] + 300));
      draw(k, m); els[k].style.opacity = Math.min(1, pop(i) * 3);
      if (m < .02) { const p = pop(i); els[k].style.transform = "none"; }
    });
    rail.style.opacity = 1 - seg(t, 800, 1400);
    const mv = ease(seg(t, T.settle, T.move)), sc = S0 + (1 - S0) * mv;
    K.style.transform = `translate(${dx * (1 - mv)}px,${dy * (1 - mv)}px) scale(${sc})`;
    shine.setAttribute("x", -200 + ease(seg(t, 1500, 2100)) * 760);
    word.style.clipPath = `inset(0 ${100 - (36.2 + ease(seg(t, T.move - 150, T.wipe)) * 63.8)}% 0 36.2%)`;
    if (t < T.hold) requestAnimationFrame(frame);
    else { setFinal(); finishFade(); }
  })(t0);
}
function scheduleBootRemoval() {
  const boot = document.getElementById("bootScreen"); if (!boot) return;
  try { if (sessionStorage.getItem("kp-booted")) { boot.remove(); return; } sessionStorage.setItem("kp-booted", "1"); } catch (_) {}
  try { runBoot(); } catch (e) { console.warn("[K-Pedia] Boot:", e); boot.remove(); }
}

/* ---------- Aksi ---------- */
function delegatedActions(event) {
  const t = event.target;
  if (t.closest("[data-retry-db]")) { toast("Memuat ulang data…"); loadDatabase(); return; }
  const nav = t.closest("[data-page]");
  if (nav) { navigate(nav.dataset.page); return; }
  const go = t.closest("[data-go]"); if (go) { navigate(go.dataset.go); return; }
  const slide = t.closest("[data-ad]"); if (slide) { openAd(Number(slide.dataset.ad)); return; }
  const star = t.closest("[data-favorite]"); if (star) { toggleFavorite(star.dataset.favorite); return; }
  const train = t.closest("[data-train]"); if (train) { openTrain(train.dataset.train); return; }
  const ot = t.closest("[data-open-train]"); if (ot) { const key = norm(ot.dataset.openTrain); closeSheet(true); navigate("trains"); openTrain(state.trains.find(x => norm(x.namaKA) === key)?.key || key); return; }
  const st = t.closest("[data-station]"); if (st) { openStation(st.dataset.station); return; }
  if (t.closest("#moreStations")) { state.stationLimit += 150; renderStations(true); return; }
  const ms = t.closest("[data-map-station]"); if (ms) { focusStationOnMap(ms.dataset.mapStation); return; }
  if (t.closest("[data-close-sheet]")) { closeSheet(); return; }
  const wj = t.closest("[data-wiki-jump]"); if (wj) { const el = document.getElementById("sec-" + wj.dataset.wikiJump); el?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" }); return; }
  const sg = t.closest("[data-suggest]"); if (sg) { const q = sg.dataset.suggest; const gs = $("#globalSearch"); if (sg.closest("#wikiSuggest")) { state.wiki.q = q; $("#wikiFilter").value = q; renderWiki(); } else if (gs) { gs.value = q; gs.focus(); renderGlobalResults(); } return; }
  const w = t.closest("[data-wiki]"); if (w) { openWiki(w.dataset.wiki, w.dataset.anchor); return; }
  const wc = t.closest("[data-wiki-cat]"); if (wc) { state.wiki.cat = wc.dataset.wikiCat; renderWiki(); return; }
  const wt = t.closest("[data-wiki-tag]"); if (wt) { state.wiki.open = null; state.wiki.q = wt.dataset.wikiTag; state.wiki.cat = "all"; $("#wikiFilter").value = state.wiki.q; renderWiki(); window.scrollTo({ top: 0 }); return; }
  if (t.closest("#wikiBack")) { state.wiki.open = null; renderWiki(); window.scrollTo({ top: 0 }); return; }
  const h = t.closest("[data-history-origin]");
  if (h) { $("#origin").value = h.dataset.historyOrigin; $("#destination").value = h.dataset.historyDestination; navigate("search"); $("#searchForm").requestSubmit(); return; }
  const copy = t.closest("[data-copy]"); if (copy) copyText(copy.dataset.copy);
}

/* ---------- Database ---------- */
async function loadDatabase() {
  state.loading = true; $("#dbDot").classList.remove("is-error");
  try {
    const info = await window.TARSUS_DATA.load();
    state.ready = true;
    state.stations = window.TARSUS_DATA.stations(); state.trains = window.TARSUS_DATA.trains(); state.tariffs = window.TARSUS_DATA.tariffs();
    populateDivisionFilter(); renderTrains(); renderStations();
    $("#dbStatus").textContent = "Referensi tersedia"; $("#dbStatusDetail").textContent = `${info.totalStasiun} stasiun · data terhubung`;
    state.loading = false; $("#dbDot").classList.add("is-ready"); $("#dbDot").title = "Data terhubung"; const M = window.TARSUS_META || {};
    $("#footerDataStatus").textContent = M.cached ? "Data tersimpan di perangkat · " + new Date(M.at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "Referensi terhubung";
    if (M.cached) toast("Sedang offline. Memakai data terakhir yang tersimpan.");
    return info;
  } catch (error) {
    console.error("K-Pedia database:", error);
    $("#dbStatus").textContent = "Data belum terhubung"; $("#footerDataStatus").textContent = "Database belum terhubung · akan dicoba lagi saat online";
    state.loading = false; $("#dbDot").classList.add("is-error"); $("#dbDot").title = "Data belum terhubung";
    const msg = empty("Database belum terhubung", "Periksa izin akses Google Sheets dan koneksi internet.").replace("</div>", '<button class="secondary-button" data-retry-db type="button" style="margin-top:14px">Coba lagi</button></div>');
    $("#trainList").innerHTML = msg; populateDivisionFilter(); renderStations();
    return null;
  }
}

/* ---------- Init ---------- */
function init() {
  scheduleBootRemoval();
  const versionLabel = $("#appVersion"); if (versionLabel) versionLabel.textContent = "v" + VERSION;
  initTheme();
  if (reducedMotion()) { const v = $(".login-video"); if (v) { v.removeAttribute("autoplay"); v.pause?.(); } }

  $("#loginForm").addEventListener("submit", attemptLogin);
  $("#togglePassword").addEventListener("click", event => {
    const input = $("#agentPassword"), show = input.type === "password", button = event.currentTarget;
    input.type = show ? "text" : "password"; input.classList.toggle("is-visible", show);
    button.setAttribute("aria-label", show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"); button.innerHTML = icon(show ? "eye-off" : "eye");
  });

  loadWiki(); renderGreeting(); renderTarsusInfo(); buildAds(); initGlobalSearch(); initSim(); initMapUI();
  $$("[data-close-ad]").forEach(b => b.addEventListener("click", closeAd));
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeAd(); closeSheet(); closeSidebar(); } });

  $("#clearHistorySetting")?.addEventListener("click", async () => { if (await kpConfirm({ tone: "danger", title: "Hapus riwayat pencarian?", message: "Seluruh riwayat pencarian di perangkat ini akan dihapus dan tidak bisa dikembalikan.", confirmText: "Hapus", icon: "trash" })) { writeStore("history", []); renderHistory(); toast("Riwayat pencarian dihapus."); } });
  $("#clearFavoritesSetting")?.addEventListener("click", async () => { if (await kpConfirm({ tone: "danger", title: "Hapus semua favorit?", message: "Seluruh tarif favorit di perangkat ini akan dihapus dan tidak bisa dikembalikan.", confirmText: "Hapus", icon: "trash" })) { writeStore("favorites", []); renderFavorites(); updateFavoriteCount(); toast("Favorit dihapus."); } });
  $("#logoutButton").addEventListener("click", doLogout);
  $("#exitAppButton")?.addEventListener("click", exitApplication);
  $("#openSidebar").addEventListener("click", openSidebar);
  $("#closeSidebar").addEventListener("click", closeSidebar);
  $("#sidebarScrim").addEventListener("click", closeSidebar);
  $("#accountButton").addEventListener("click", () => navigate("settings"));
  document.addEventListener("click", delegatedActions);

  $("#searchForm").addEventListener("submit", searchRoute);
  setupStationField("#origin", "#originSuggestions", "origin");
  setupStationField("#destination", "#destinationSuggestions", "destination");
  $("#swapStations").addEventListener("click", () => {
    const o = $("#origin"), d = $("#destination"); [o.value, d.value] = [d.value, o.value];
    $("#clearOrigin").hidden = !o.value; $("#clearDestination").hidden = !d.value; $("#swapStations").classList.toggle("flip");
  });
  $("#resetSearch").addEventListener("click", () => {
    $("#origin").value = ""; $("#destination").value = "";
    $("#results").innerHTML = empty("Siap mencari tarif?", "Pilih stasiun asal dan tujuan untuk mulai.");
    $("#resultsSummary").textContent = "Hasil tarif akan ditampilkan di sini.";
    $("#searchMessage").hidden = true; $("#clearOrigin").hidden = true; $("#clearDestination").hidden = true;
  });
  $("#trainFilter").addEventListener("input", e => renderTrains(e.target.value));
  $("#stationFilter").addEventListener("input", () => renderStations());
  $("#divisionFilter").addEventListener("change", () => renderStations());
  $("#wikiFilter").addEventListener("input", e => { state.wiki.q = e.target.value; renderWiki(); });
  $("#clearHistory").addEventListener("click", async () => { if (await kpConfirm({ tone: "danger", title: "Hapus riwayat pencarian?", message: "Seluruh riwayat pencarian akun ini di perangkat ini akan dihapus dan tidak bisa dikembalikan.", confirmText: "Hapus", icon: "trash" })) { writeStore("history", []); renderHistory(); toast("Riwayat dihapus."); } });

  let session = null; try { session = sessionStorage.getItem("tarsus-ui-session"); } catch (_) {}
  if (session === "admin") showApp("admin");
  else { try { sessionStorage.removeItem("tarsus-ui-session"); } catch (_) {} document.body.classList.add("login-active"); $("#loginScreen").hidden = false; }

  loadDatabase();
  window.addEventListener("online", () => { if (!state.ready) loadDatabase(); });

  history.replaceState({ tarsus: true, page: state.page }, "");
  window.addEventListener("popstate", event => {
    if (!$("#stationSheet").hidden) { closeSheet(); history.pushState({ tarsus: true, page: state.page }, ""); return; }
    if ($("#sidebar").classList.contains("open")) { closeSidebar(); history.pushState({ tarsus: true, page: state.page }, ""); return; }
    if (state.user) {
      const target = event.state && event.state.tarsus && pageNames[event.state.page] ? event.state.page : "home";
      navigate(target, false, true);
      if (target === "home") history.pushState({ tarsus: true, page: "home" }, "");
    } else history.pushState({ tarsus: true, page: "login" }, "");
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(error => console.warn("[K-Pedia] Service worker:", error)));
  }
}
document.addEventListener("DOMContentLoaded", init, { once: true });
