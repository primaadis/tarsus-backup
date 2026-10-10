/* =========================================
   TARSUS FINDER
   PART 9/10 — APPLICATION CONTROLLER
========================================= */

"use strict";

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  const $ = (selector) => document.querySelector(selector);

  const loading = $("#app-loading");
  const app = $("#app");

  const sidebar = $("#sidebar");
  const overlay = $("#sidebar-overlay");

  const form = $("#search-form");
  const asalInput = $("#asal");
  const tujuanInput = $("#tujuan");

  const resultsSection = $("#results-section");
  const resultsContainer = $("#results-container");
  const resultsCount = $("#results-count");
  const resultsTitle = $("#results-title");
  const resultsDescription = $("#results-description");

  const emptyState = $("#empty-state");
  const searchStatus = $("#search-status");
  const searchButton = $("#search-button");

  let searchSequence = 0;

  // Tampilkan aplikasi setelah kerangka HTML siap.
  window.setTimeout(() => {
    app.classList.remove("hidden");

    window.setTimeout(() => {
      loading.classList.add("finished");
    }, 150);
  }, 250);

  // Tutup splash setelah transisi selesai.
  window.setTimeout(() => {
    loading.remove();
  }, 1000);

  // NAVIGASI HALAMAN
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.dataset.page;
      showPage(page);
      closeSidebar();
    });
  });

  function showPage(pageName) {
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.add("hidden");
      page.classList.remove("active");
    });

    const target = $("#page-" + pageName);

    if (target) {
      target.classList.remove("hidden");
      target.classList.add("active");
    }

    document.querySelectorAll(".nav-item").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.page === pageName
      );
    });

    const titles = {
      search: "Pencarian Tarif",
      information: "Informasi Aplikasi",
      terms: "Syarat & Ketentuan",
      contact: "Hubungi Pengelola"
    };

    $("#current-page-title").textContent =
      titles[pageName] || "TARSUS Finder";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // SIDEBAR
  $("#open-sidebar").addEventListener("click", openSidebar);
  $("#close-sidebar").addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("visible");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
  }

  // TEMA
  const themeButton = $("#theme-toggle");
  const themeIcon = $("#theme-icon");

  function applyTheme(theme) {
    document.body.classList.toggle("dark-mode", theme === "dark");
    themeIcon.textContent = theme === "dark" ? "☀" : "◐";
    themeButton.setAttribute(
      "aria-label",
      theme === "dark" ? "Aktifkan tema terang" : "Aktifkan tema gelap"
    );

    try {
      localStorage.setItem("tarsus-theme", theme);
    } catch (_) {}
  }

  let savedTheme = "light";

  try {
    savedTheme = localStorage.getItem("tarsus-theme") || "light";
  } catch (_) {}

  applyTheme(savedTheme);

  themeButton.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode")
      ? "light"
      : "dark";

    applyTheme(nextTheme);
  });

  // TUKAR STASIUN
  $("#swap-stations").addEventListener("click", () => {
    const oldAsal = asalInput.value;
    asalInput.value = tujuanInput.value;
    tujuanInput.value = oldAsal;

    hideSuggestions();
    clearStatus();

    if (asalInput.value) {
      asalInput.dispatchEvent(new Event("input"));
    }

    if (tujuanInput.value) {
      tujuanInput.dispatchEvent(new Event("input"));
    }
  });

  // TOMBOL HAPUS INPUT
  bindClearButton(asalInput, $("#clear-asal"));
  bindClearButton(tujuanInput, $("#clear-tujuan"));

  function bindClearButton(input, button) {
    const update = () => {
      button.classList.toggle("hidden", !input.value);
    };

    input.addEventListener("input", update);

    button.addEventListener("click", () => {
      input.value = "";
      input.focus();
      update();
      hideSuggestions();
      clearStatus();
    });
  }

  // AUTOCOMPLETE STASIUN
  bindAutocomplete(
    asalInput,
    $("#asal-suggestions")
  );

  bindAutocomplete(
    tujuanInput,
    $("#tujuan-suggestions")
  );

  function bindAutocomplete(input, list) {
    input.addEventListener("input", () => {
      const query = normalize(input.value);

      list.replaceChildren();

      if (query.length < 2) {
        list.classList.add("hidden");
        return;
      }

      const stations = getStationNames()
        .filter((name) => normalize(name).includes(query))
        .slice(0, 8);

      if (!stations.length) {
        list.classList.add("hidden");
        return;
      }

      stations.forEach((name) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "suggestion-item";
        button.textContent = name;

        button.addEventListener("click", () => {
          input.value = name;
          list.classList.add("hidden");
          input.dispatchEvent(new Event("input"));
          input.focus();
        });

        list.appendChild(button);
      });

      list.classList.remove("hidden");
    });
  }

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".field-group")) {
      hideSuggestions();
    }
  });

  function hideSuggestions() {
    document.querySelectorAll(".suggestion-list").forEach((list) => {
      list.classList.add("hidden");
    });
  }

  // FORM PENCARIAN
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const asal = asalInput.value.trim();
    const tujuan = tujuanInput.value.trim();

    clearStatus();
    hideSuggestions();

    if (!asal || !tujuan) {
      showStatus("Masukkan stasiun asal dan tujuan.", "error");
      return;
    }

    if (normalize(asal) === normalize(tujuan)) {
      showStatus("Stasiun asal dan tujuan tidak boleh sama.", "error");
      return;
    }

    if (typeof window.searchSpecialTariffs !== "function") {
      showStatus(
        "Mesin pencarian belum siap. Periksa file data.js.",
        "error"
      );
      return;
    }

    const currentSequence = ++searchSequence;

    searchButton.disabled = true;
    searchButton.querySelector("span").textContent = "Mencari...";
    showStatus("Sedang mencari relasi tarif khusus...", "");

    try {
      const results = await window.searchSpecialTariffs(asal, tujuan);

      if (currentSequence !== searchSequence) return;

      renderResults(results, asal, tujuan);
    } catch (error) {
      console.error("TARSUS search error:", error);

      showStatus(
        "Pencarian gagal. Periksa koneksi data atau struktur data.js.",
        "error"
      );
    } finally {
      if (currentSequence === searchSequence) {
        searchButton.disabled = false;
        searchButton.querySelector("span").textContent = "Cari Tarif";
      }
    }
  });

  function renderResults(results, asal, tujuan) {
    resultsContainer.replaceChildren();

    if (!Array.isArray(results) || results.length === 0) {
      resultsSection.classList.add("hidden");
      emptyState.classList.remove("hidden");

      showStatus(
        `Tidak ditemukan tarif khusus untuk ${asal} – ${tujuan}.`,
        "error"
      );

      return;
    }

    resultsTitle.textContent = `${asal} – ${tujuan}`;
    resultsDescription.textContent =
      "Berikut relasi tarif khusus yang cocok dengan pencarian.";

    resultsCount.textContent = `${results.length} HASIL`;

    results.forEach((item) => {
      resultsContainer.appendChild(createResultCard(item));
    });

    emptyState.classList.add("hidden");
    resultsSection.classList.remove("hidden");

    showStatus(
      `${results.length} relasi tarif khusus ditemukan.`,
      "success"
    );

    resultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // Membuat kartu dengan textContent agar data tidak dianggap sebagai HTML.
  function createResultCard(item) {
    const card = document.createElement("article");
    card.className = "result-card";

    const header = document.createElement("div");
    header.className = "result-card-header";

    const titleWrap = document.createElement("div");

    const title = document.createElement("h3");
    title.className = "train-name";
    title.textContent = item.trainName || "Nama kereta tidak tersedia";

    const label = document.createElement("span");
    label.className = "result-label";
    label.textContent = item.trainNumber
      ? `Nomor KA ${item.trainNumber}`
      : "Tarif khusus";

    titleWrap.append(title, label);

    const badge = document.createElement("span");
    badge.className = "direction-badge";
    badge.textContent = item.direction || "Sesuai ketentuan";

    header.append(titleWrap, badge);

    const body = document.createElement("div");
    body.className = "result-card-body";

    const relationLabel = document.createElement("div");
    relationLabel.className = "relation-label";
    relationLabel.textContent = "RELASI TARIF KHUSUS";

    const relation = document.createElement("p");
    relation.className = "relation-value";
    relation.textContent = item.specialRelation || "-";

    const fares = document.createElement("div");
    fares.className = "fare-grid";

    [
      ["Eksekutif", item.fares?.executive],
      ["Bisnis", item.fares?.business],
      ["Ekonomi", item.fares?.economy]
    ].forEach(([name, price]) => {
      const fare = document.createElement("div");
      fare.className = "fare-item";

      const fareName = document.createElement("span");
      fareName.className = "fare-class";
      fareName.textContent = name;

      const farePrice = document.createElement("strong");
      farePrice.className = "fare-price";

      if (price === null || price === undefined || price === "") {
        fare.classList.add("unavailable");
        farePrice.textContent = "Tidak tersedia";
      } else if (typeof price === "number" && Number.isFinite(price)) {
        farePrice.textContent = formatRupiah(price);
      } else {
        farePrice.textContent = String(price);
      }

      fare.append(fareName, farePrice);
      fares.appendChild(fare);
    });

    body.append(relationLabel, relation, fares);

    if (item.note) {
      const note = document.createElement("div");
      note.className = "result-note";
      note.textContent = item.note;
      body.appendChild(note);
    }

    card.append(header, body);

    return card;
  }

  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value);
  }

  function showStatus(message, type) {
    searchStatus.textContent = message;
    searchStatus.classList.remove("hidden", "error", "success");

    if (type) {
      searchStatus.classList.add(type);
    }
  }

  function clearStatus() {
    searchStatus.textContent = "";
    searchStatus.classList.add("hidden");
    searchStatus.classList.remove("error", "success");
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function getStationNames() {
    if (typeof window.getTarsusStations === "function") {
      const stations = window.getTarsusStations();

      if (Array.isArray(stations)) {
        return stations;
      }
    }

    return [];
  }

  // Versi aplikasi ditampilkan konsisten.
  $("#sidebar-version").textContent = "v2.0.0";
  $("#information-version").textContent = "2.0.0";

  // Escape menutup menu di perangkat yang memakai keyboard.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSidebar();
      hideSuggestions();
    }
  });

  // Registrasi service worker.
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/tarsus-backup/sw.js")
        .catch((error) => {
          console.warn("Service worker tidak terdaftar:", error);
        });
    });
  }
      }
