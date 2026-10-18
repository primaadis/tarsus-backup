
/* =========================================================
   K-PEDIA 5.1.0 (sebelumnya TARSUS Finder)
   Presentation Layer
   Core fare rules remain in data.js.
   ========================================================= */

"use strict";

const VERSION = "5.1.0";

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

const state = {
  ready: false,
  page: "home",
  user: null,
  stations: [],
  trains: [],
  tariffs: [],
  searchGroups: [],
  loading: true
};

const pageNames = {
  home: "Beranda",
  map: "Peta Jalur Kereta Api",
  encyclopedia: "Ensiklopedia KAI",
  stationdetail: "Informasi Stasiun",
  search: "Cari Berdasarkan Rute",
  trains: "Cari Berdasarkan Kereta",
  stations: "Direktori Stasiun",
  favorites: "Favorit",
  history: "Riwayat Pencarian",
  guide: "Panduan Penggunaan",
  help: "Kritik dan Saran",
  settings: "Pengaturan"
};

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

function toast(message, type = "info") {
  const region = $("#toastRegion");
  if (!region) return;

  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  region.append(el);

  requestAnimationFrame(() => el.classList.add("show"));

  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 240);
  }, 3300);
}

function applyTheme(theme, save = true, animate = true) {
  const systemDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const preference = theme || prefGet("theme", "system");

  const value =
    preference === "system"
      ? (systemDark ? "dark" : "light")
      : (preference === "light" ? "light" : "dark");

  const old = document.body.dataset.theme;

  if (animate && old !== value) {
    document.body.classList.add("theme-transition");

    const fx = document.getElementById("themeTransition");

    if (fx) {
      fx.className =
        "theme-transition-orb " +
        (value === "light" ? "to-light" : "to-dark");

      fx.innerHTML = icon(value === "light" ? "sun" : "moon");

      fx.hidden = false;

      setTimeout(() => {
        fx.hidden = true;
        document.body.classList.remove("theme-transition");
      }, 620);
    } else {
      setTimeout(() => {
        document.body.classList.remove("theme-transition");
      }, 620);
    }
  }

  document.body.dataset.theme = value;

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      value === "light" ? "#f4f6f9" : "#0a1420"
    );

  const select = $("#themeSetting");
  if (select) select.value = preference;

  if (save) prefSet("theme", preference);
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
    toast("Ukuran teks diperbarui.");
  });
}

function showApp(user) {
  state.user = user;

  const login = $("#loginScreen");
  const shell = $("#appShell");

  document.body.classList.remove("login-active");

  shell.hidden = false;
  shell.classList.add("app-reveal");

  login.classList.add("login-leave");

  window.setTimeout(() => {
    login.hidden = true;
    login.classList.remove("login-leave");
    shell.classList.remove("app-reveal");
  }, 560);

  $("#profileName").textContent = user;
  $("#topAccountName").textContent = user;

  renderHomeRecent();
  renderFavorites();
  renderHistory();
  updateFavoriteCount();

  navigate("home", false);
}

function attemptLogin(event) {
  event.preventDefault();

  const id = $("#agentId").value.trim();
  const password = $("#agentPassword").value;
  const msg = $("#loginMessage");

  if (id !== "admin" || password !== "Paskai121") {
    msg.textContent = "ID atau kata sandi tidak sesuai.";
    return;
  }

  // Browser-side demo credential only; not secure server authentication.
  state.user = "admin";

  try {
    sessionStorage.setItem("tarsus-ui-session", "admin");
  } catch (_) {}

  msg.textContent = "";
  showApp("admin");
  toast("Berhasil masuk.", "success");
}

function doLogout() {
  if (!confirm("Keluar dari sesi K-Pedia?")) return;

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

function navigate(page, scroll = true, fromPop = false) {
  if (!pageNames[page]) page = "home";

  const changed = state.page !== page;
  state.page = page;

  if (!fromPop && changed) {
    try {
      history.pushState({ tarsus: true, page }, "");
    } catch (_) {}
  }

  $$(".page").forEach(el => {
    const isTarget = el.id === `page-${page}`;

    el.classList.toggle("active", isTarget);

    if (
      isTarget &&
      changed &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.classList.remove("page-enter");
      void el.offsetWidth;
      el.classList.add("page-enter");

      setTimeout(() => {
        el.classList.remove("page-enter");
      }, 340);
    }
  });

  $$("[data-page]").forEach(el => {
    const active = el.dataset.page === page;

    el.classList.toggle("active", active);

    if (active) {
      el.setAttribute("aria-current", "page");
    } else {
      el.removeAttribute("aria-current");
    }
  });

  $("#pageCrumb").textContent = pageNames[page];

  closeSidebar();

  if (page === "trains") {
    renderTrains($("#trainFilter").value);
  }

  if (page === "stations") renderStations();
  if (page === "favorites") renderFavorites();
  if (page === "history") renderHistory();

  if (scroll) {
    window.scrollTo({
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth"
    });
  }
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
        `<button type="button" class="suggestion-row" data-pick="${esc(station.namaStasiun)}" data-field="${field}"><span class="suggestion-dot"></span><span>${esc(station.namaStasiun)}</span></button>`
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

function searchRoute(event) {
  event.preventDefault();

  const origin = $("#origin").value.trim();
  const destination = $("#destination").value.trim();

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
            other.origin === item.origin &&
            other.destination === item.destination
          ) === index
        )
        .slice(0, 40)
    );

    renderHistory();
    renderHomeRecent();

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

function renderStations() {
  const root = $("#stationList");

  if (!state.ready && state.loading) {
    root.innerHTML = skeletons();
    return;
  }

  if (!state.ready) {
    root.innerHTML = empty(
      "Database belum siap",
      "Direktori stasiun akan muncul setelah data dimuat."
    );
    return;
  }

  const q = $("#stationFilter").value
    .trim()
    .toLocaleLowerCase("id");

  const division = $("#divisionFilter").value;

  const list = state.stations.filter(station =>
    (!q || station.namaStasiun.toLocaleLowerCase("id").includes(q)) &&
    (!division || station.daop === division)
  );

  const grouped = new Map();

  list.forEach(station => {
    const key = station.daop || "Wilayah belum ditentukan";

    if (!grouped.has(key)) grouped.set(key, []);

    grouped.get(key).push(station);
  });

  root.innerHTML = list.length
    ? [...grouped.entries()]
        .sort((a, b) => a[0].localeCompare(b[0], "id"))
        .map(([region, items]) =>
          `<section class="station-region">
            <div class="region-head">
              <h3>${esc(region)}</h3>
              <span>${items.length} stasiun</span>
            </div>
            <div class="station-name-grid">
              ${items
                .sort((a, b) =>
                  a.namaStasiun.localeCompare(b.namaStasiun, "id")
                )
                .map(station =>
                  `<div class="station-name-row">
                    <span class="station-dot"></span>
                    <span>${esc(station.namaStasiun)}</span>
                  </div>`
                ).join("")}
            </div>
          </section>`
        ).join("")
    : empty(
        "Stasiun tidak ditemukan",
        "Ubah kata kunci atau pilihan wilayah."
      );
}

function populateDivisionFilter() {
  const select = $("#divisionFilter");
  const current = select.value;

  const divisions = [
    ...new Set(
      state.stations.map(station => station.daop).filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b, "id"));

  select.innerHTML =
    '<option value="">Semua Daop / Divre</option>' +
    divisions.map(division =>
      `<option value="${esc(division)}">${esc(division)}</option>`
    ).join("");

  select.value = divisions.includes(current) ? current : "";
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
  renderHomeRecent();
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
  const items = readStore("favorites");

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

function renderHomeRecent() {
  const root = $("#homeRecent");
  const items = readStore("history").slice(0, 4);

  root.innerHTML = items.length
    ? items.map(item =>
        `<button class="compact-history"
          data-history-origin="${esc(item.origin)}"
          data-history-destination="${esc(item.destination)}">
          <span>${esc(item.origin)} <i>→</i> ${esc(item.destination)}</span>
          <small>${new Date(item.at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short"
          })}</small>
        </button>`
      ).join("")
    : '<div class="list-placeholder">Riwayat pencarian akan muncul di sini.</div>';
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

function delegatedActions(event) {
  const nav = event.target.closest("[data-page]");

  if (nav) {
    if (nav.dataset.page === "menu") {
      openSidebar();
      return;
    }

    navigate(nav.dataset.page);
    return;
  }

  const go = event.target.closest("[data-go]");

  if (go) {
    navigate(go.dataset.go);
    return;
  }

  const star = event.target.closest("[data-favorite]");

  if (star) {
    toggleFavorite(star.dataset.favorite);
    return;
  }

  const train = event.target.closest("[data-train]");

  if (train) {
    openTrain(train.dataset.train);
    return;
  }

  const historyItem = event.target.closest("[data-history-origin]");

  if (historyItem) {
    $("#origin").value = historyItem.dataset.historyOrigin;
    $("#destination").value =
      historyItem.dataset.historyDestination;

    navigate("search");
    $("#searchForm").requestSubmit();
    return;
  }

  const copy = event.target.closest("[data-copy]");

  if (copy) {
    copyText(copy.dataset.copy);
    return;
  }
}

async function loadDatabase() {
  state.loading = true;

  $("#dbDot").classList.remove("is-error");

  try {
    const info = await window.TARSUS_DATA.load();

    state.ready = true;
    state.stations = window.TARSUS_DATA.stations();
    state.trains = window.TARSUS_DATA.trains();
    state.tariffs = window.TARSUS_DATA.tariffs();

    populateDivisionFilter();
    renderTrains();
    renderStations();

    $("#dbStatus").textContent = "Referensi tersedia";
    $("#dbStatusDetail").textContent =
      `${info.totalStasiun} stasiun · data terhubung`;

    state.loading = false;

    $("#dbDot").classList.add("is-ready");
    $("#dbDot").title = "Data terhubung";
    $("#footerDataStatus").textContent = "Referensi terhubung";

    return info;
  } catch (error) {
    console.error("K-Pedia database:", error);

    $("#dbStatus").textContent = "Data belum terhubung";
    $("#dbStatusDetail").textContent =
      "Periksa koneksi dan akses sheet";

    $("#footerDataStatus").textContent =
      "Database belum terhubung";

    state.loading = false;

    $("#dbDot").classList.add("is-error");
    $("#dbDot").title = "Data belum terhubung";

    $("#trainList").innerHTML = empty(
      "Database belum terhubung",
      "Periksa izin akses Google Sheets dan koneksi internet."
    );

    $("#stationList").innerHTML = empty(
      "Database belum terhubung",
      "Periksa izin akses Google Sheets dan koneksi internet."
    );

    $("#footerDataStatus").textContent =
      "Database belum terhubung · akan dicoba lagi saat online";

    return null;
  }
}

/* =========================================================
   BOOT SCREEN
   Timer dipasang paling awal agar tidak bergantung pada
   keberhasilan pemasangan event listener lainnya.
   ========================================================= */

function scheduleBootRemoval() {
  const boot = document.getElementById("bootScreen");

  if (!boot) return;

  try {
    if (sessionStorage.getItem("kp-booted")) {
      boot.remove();
      return;
    }

    sessionStorage.setItem("kp-booted", "1");
  } catch (_) {}

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  window.setTimeout(() => {
    if (!boot.isConnected) return;

    boot.classList.add("boot-screen-out");

    window.setTimeout(() => boot.remove(), reducedMotion ? 100 : 480);
  }, reducedMotion ? 300 : 1300);
}

function init() {
  // Jalankan timer sebelum inisialisasi lain.
  scheduleBootRemoval();

  const versionLabel = $("#appVersion");

  if (versionLabel) {
    versionLabel.textContent = "v" + VERSION;
  }

  initTheme();

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const loginVideo = $(".login-video");
    if (loginVideo) {
      loginVideo.removeAttribute("autoplay");
      loginVideo.pause?.();
    }
  }

  $("#loginForm").addEventListener("submit", attemptLogin);

  $("#togglePassword").addEventListener("click", event => {
    const input = $("#agentPassword");
    const show = input.type === "password";
    const button = event.currentTarget;

    input.type = show ? "text" : "password";
    input.classList.toggle("is-visible", show);
    button.setAttribute("aria-label", show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
    button.innerHTML = icon(show ? "eye-off" : "eye");
  });

  const adInfo = [
    { title: "Informasi 01", description: "" },
    { title: "Informasi 02", description: "" },
    { title: "Informasi 03", description: "" },
    { title: "Informasi 04", description: "" },
    { title: "Informasi 05", description: "" }
  ];

  let adOpener = null;

  function openAd(index) {
    const item = adInfo[index];
    if (!item) return;

    $("#adModalTitle").textContent = item.title;
    const adDesc = $("#adModalDescription");
    adDesc.textContent = item.description;
    adDesc.hidden = !item.description;

    const image = $("#adModalImage");
    image.src = `assets/iklan-${index + 1}.jpg`;
    image.alt = item.title;

    $("#adModal").hidden = false;
    document.body.classList.add("modal-open");
    adOpener = document.activeElement;
    $(".ad-modal-close")?.focus();
  }

  function closeAd() {
    if ($("#adModal").hidden) return;

    $("#adModal").hidden = true;
    document.body.classList.remove("modal-open");
    adOpener?.focus?.();
  }

  $$("[data-ad]").forEach(button => {
    button.addEventListener("click", () => {
      openAd(Number(button.dataset.ad));
    });
  });

  $$("[data-close-ad]").forEach(button => {
    button.addEventListener("click", closeAd);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeAd();
  });

  $("#clearHistorySetting")?.addEventListener("click", () => {
    if (
      confirm("Hapus seluruh riwayat pencarian di perangkat ini?")
    ) {
      writeStore("history", []);
      renderHistory();
      renderHomeRecent();
      toast("Riwayat pencarian dihapus.");
    }
  });

  $("#clearFavoritesSetting")?.addEventListener("click", () => {
    if (confirm("Hapus seluruh favorit di perangkat ini?")) {
      writeStore("favorites", []);
      renderFavorites();
      updateFavoriteCount();
      toast("Favorit dihapus.");
    }
  });

  $("#logoutButton").addEventListener("click", doLogout);
  $("#exitAppButton")?.addEventListener("click", exitApplication);

  $("#openSidebar").addEventListener("click", openSidebar);
  $("#closeSidebar").addEventListener("click", closeSidebar);
  $("#sidebarScrim").addEventListener("click", closeSidebar);

  $("#accountButton").addEventListener("click", () => {
    navigate("settings");
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeSidebar();
  });

  document.addEventListener("click", delegatedActions);

  $("#searchForm").addEventListener("submit", searchRoute);

  setupStationField(
    "#origin",
    "#originSuggestions",
    "origin"
  );

  setupStationField(
    "#destination",
    "#destinationSuggestions",
    "destination"
  );

  $("#swapStations").addEventListener("click", () => {
    const origin = $("#origin");
    const destination = $("#destination");

    [origin.value, destination.value] = [
      destination.value,
      origin.value
    ];

    $("#clearOrigin").hidden = !origin.value;
    $("#clearDestination").hidden = !destination.value;

    $("#swapStations").classList.toggle("flip");
  });

  $("#resetSearch").addEventListener("click", () => {
    $("#origin").value = "";
    $("#destination").value = "";

    $("#results").innerHTML = empty(
      "Siap mencari tarif?",
      "Pilih stasiun asal dan tujuan untuk mulai."
    );

    $("#resultsSummary").textContent =
      "Hasil tarif akan ditampilkan di sini.";

    $("#searchMessage").hidden = true;
    $("#clearOrigin").hidden = true;
    $("#clearDestination").hidden = true;
  });

  $("#trainFilter").addEventListener("input", event => {
    renderTrains(event.target.value);
  });

  $("#stationFilter").addEventListener("input", renderStations);
  $("#divisionFilter").addEventListener("change", renderStations);

  $("#clearHistory").addEventListener("click", () => {
    if (
      confirm(
        "Hapus semua riwayat pencarian akun ini di perangkat ini?"
      )
    ) {
      writeStore("history", []);
      renderHistory();
      renderHomeRecent();
      toast("Riwayat dihapus.");
    }
  });

  let session = null;

  try {
    session = sessionStorage.getItem("tarsus-ui-session");
  } catch (_) {}

  if (session === "admin") {
    showApp("admin");
  } else {
    try {
      sessionStorage.removeItem("tarsus-ui-session");
    } catch (_) {}

    document.body.classList.add("login-active");
    $("#loginScreen").hidden = false;
  }

  loadDatabase();

  window.addEventListener("online", () => {
    if (!state.ready) loadDatabase();
  });

  // Back button: close the drawer first, otherwise return to the
  // prior in-app page.
  history.replaceState(
    { tarsus: true, page: state.page },
    ""
  );

  window.addEventListener("popstate", event => {
    if ($("#sidebar").classList.contains("open")) {
      closeSidebar();
      history.pushState(
        { tarsus: true, page: state.page },
        ""
      );
      return;
    }

    if (state.user) {
      const target =
        event.state &&
        event.state.tarsus &&
        pageNames[event.state.page]
          ? event.state.page
          : "home";

      navigate(target, false, true);

      if (target === "home") {
        history.pushState(
          { tarsus: true, page: "home" },
          ""
        );
      }
    } else {
      history.pushState(
        { tarsus: true, page: "login" },
        ""
      );
    }
  });

  if (
    "serviceWorker" in navigator &&
    location.protocol.startsWith("http")
  ) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .catch(error => {
          console.warn("[K-Pedia] Service worker:", error);
        });
    });
  }
}

document.addEventListener(
  "DOMContentLoaded",
  init,
  { once: true }
);
/* =========================================================
   INTEGRASI PETA KAIPEDIA & NAVIGASI PINTAS
   ========================================================= */

// Fungsi agar tombol Beranda bisa langsung loncat ke halaman tujuan
window.navigatePage = function(pageId) {
  const targetNavBtn = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (targetNavBtn) {
    targetNavBtn.click();
  } else {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${pageId}`);
    if (target) target.classList.add('active');
  }

  // Jika yang dibuka adalah menu peta, jalankan mesin peta Leaflet
  if (pageId === 'map' && typeof window.initGisMap === 'function') {
    setTimeout(window.initGisMap, 100);
  }
};

// Pastikan saat menu samping (sidebar) 'Peta GIS' diklik, peta langsung di-render
document.addEventListener('DOMContentLoaded', function() {
  const mapNavBtn = document.querySelector('.nav-link[data-page="map"]');
  if (mapNavBtn) {
    mapNavBtn.addEventListener('click', function() {
      if (typeof window.initGisMap === 'function') {
        setTimeout(window.initGisMap, 150);
      }
    });
  }
});
