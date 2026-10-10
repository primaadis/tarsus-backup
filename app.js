/* =========================================================
   TARSUS FINDER
   APP ENGINE — PART 1/4

   Inisialisasi:
   - Elemen HTML
   - Konfigurasi aplikasi
   - Helper UI
   - Notifikasi
   - Tampilan hasil pencarian
   ========================================================= */

"use strict";


/* =========================================================
   1. CONFIGURATION
========================================================= */

const APP_VERSION = "1.0.0";

const APP_CONFIG = {
    introDuration: 2200,
    suggestionLimit: 8,
    searchDebounce: 120
};


/* =========================================================
   2. DOM ELEMENTS
========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


const DOM = {
    intro: $("#cinematicIntro"),

    app: $("#app"),

    sidebar: $("#sidebar"),

    sidebarBackdrop: $("#sidebarBackdrop"),

    openSidebar: $("#openSidebar"),

    closeSidebar: $("#closeSidebar"),

    themeToggle: $("#themeToggle"),

    themeIcon: $("#themeIcon"),

    breadcrumbCurrent: $("#breadcrumbCurrent"),

    searchForm: $("#searchForm"),

    origin: $("#origin"),

    destination: $("#destination"),

    originSuggestions: $("#originSuggestions"),

    destinationSuggestions: $("#destinationSuggestions"),

    clearOrigin: $("#clearOrigin"),

    clearDestination: $("#clearDestination"),

    swapStations: $("#swapStations"),

    resetSearch: $("#resetSearch"),

    searchButton: $("#searchButton"),

    searchMessage: $("#searchMessage"),

    resultsSection: $("#resultsSection"),

    results: $("#results"),

    resultsSummary: $("#resultsSummary"),

    resultsCount: $("#resultsCount"),

    appVersion: $("#appVersion"),

    footerVersion: $("#footerVersion"),

    toastContainer: $("#toastContainer")
};


/* =========================================================
   3. APPLICATION STATE
========================================================= */

const STATE = {
    databaseReady: false,

    databaseLoading: false,

    searching: false,

    activePage: "search",

    selectedOrigin: "",

    selectedDestination: "",

    searchRequest: 0,

    suggestionTimers: {},

    toastTimers: new Set()
};


/* =========================================================
   4. INITIAL VERSION
========================================================= */

function initializeVersion() {
    if (DOM.appVersion) {
        DOM.appVersion.textContent =
            "v" + APP_VERSION;
    }

    if (DOM.footerVersion) {
        DOM.footerVersion.textContent =
            "v" + APP_VERSION;
    }
}


/* =========================================================
   5. HTML ESCAPE
========================================================= */

function safeHTML(value) {
    if (
        window.TARSUS_DATA &&
        typeof window.TARSUS_DATA.escapeHTML === "function"
    ) {
        return window.TARSUS_DATA.escapeHTML(value);
    }

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   6. NOTIFICATION
========================================================= */

function showToast(message, type = "info") {
    if (!DOM.toastContainer) {
        console.log("[TARSUS]", message);
        return;
    }

    const toast = document.createElement("div");

    toast.className = "toast toast-" + type;

    toast.setAttribute("role", "status");

    toast.innerHTML = `
        <span class="toast-indicator"></span>
        <span class="toast-message">
            ${safeHTML(message)}
        </span>
        <button
            type="button"
            class="toast-close"
            aria-label="Tutup notifikasi"
        >×</button>
    `;

    DOM.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    const removeToast = () => {
        toast.classList.remove("show");

        window.setTimeout(() => {
            toast.remove();
        }, 250);
    };

    const closeButton = $(".toast-close", toast);

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            removeToast
        );
    }

    const timer = window.setTimeout(() => {
        removeToast();
        STATE.toastTimers.delete(timer);
    }, 4000);

    STATE.toastTimers.add(timer);
}


/* =========================================================
   7. SEARCH MESSAGE
========================================================= */

function setSearchMessage(message, type = "info") {
    if (!DOM.searchMessage) {
        return;
    }

    DOM.searchMessage.textContent = message;

    DOM.searchMessage.className =
        "search-message message-" + type;

    DOM.searchMessage.hidden = !message;
}


/* =========================================================
   8. LOADING STATE
========================================================= */

function setSearchLoading(isLoading) {
    STATE.searching = isLoading;

    if (!DOM.searchButton) {
        return;
    }

    DOM.searchButton.disabled = isLoading;

    const label = $(".submit-label", DOM.searchButton);

    if (label) {
        label.textContent = isLoading
            ? "MEMERIKSA TARIF..."
            : "CARI TARIF KHUSUS";
    }

    DOM.searchButton.setAttribute(
        "aria-busy",
        String(isLoading)
    );
}


/* =========================================================
   9. UPDATE CLEAR BUTTONS
========================================================= */

function updateClearButtons() {
    if (DOM.clearOrigin && DOM.origin) {
        DOM.clearOrigin.hidden =
            DOM.origin.value.length === 0;
    }

    if (
        DOM.clearDestination &&
        DOM.destination
    ) {
        DOM.clearDestination.hidden =
            DOM.destination.value.length === 0;
    }
}


/* =========================================================
   10. EMPTY RESULT
========================================================= */

function renderEmptyResults(
    title = "Siap mencari tarif?",
    description =
        "Pilih stasiun asal dan tujuan, lalu tekan Cari Tarif Khusus."
) {
    if (!DOM.results) {
        return;
    }

    DOM.results.innerHTML = `
        <div class="results-empty">
            <div class="empty-illustration">
                <div class="empty-rail empty-rail-one"></div>
                <div class="empty-rail empty-rail-two"></div>
                <div class="empty-station empty-station-one"></div>
                <div class="empty-station empty-station-two"></div>
                <div class="empty-center-mark">↗</div>
            </div>

            <div class="empty-title">
                ${safeHTML(title)}
            </div>

            <p class="empty-description">
                ${safeHTML(description)}
            </p>
        </div>
    `;

    if (DOM.resultsSummary) {
        DOM.resultsSummary.textContent =
            "Hasil tarif akan ditampilkan di area ini.";
    }

    if (DOM.resultsCount) {
        DOM.resultsCount.innerHTML = `
            <span>—</span>
            <small>HASIL</small>
        `;
    }
}


/* =========================================================
   11. RELATION HTML
========================================================= */

function renderRelation(stations) {
    if (!Array.isArray(stations) || !stations.length) {
        return "—";
    }

    return stations
        .map(station => safeHTML(station))
        .join(
            '<span class="relation-arrow">→</span>'
        );
}


/* =========================================================
   12. FORMAT FARE
========================================================= */

function renderFare(value) {
    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(value)
    ) {
        return "—";
    }

    if (
        window.TARSUS_DATA &&
        typeof window.TARSUS_DATA.formatRupiah === "function"
    ) {
        return window.TARSUS_DATA.formatRupiah(value);
    }

    return "Rp " +
        new Intl.NumberFormat("id-ID").format(value);
}


/* =========================================================
   13. FARE ITEMS
========================================================= */

function renderFareItem(label, value) {
    const unavailable =
        value === null ||
        value === undefined ||
        !Number.isFinite(value);

    return `
        <div class="fare-item">
            <span class="fare-class">
                ${safeHTML(label)}
            </span>

            <span class="fare-price ${
                unavailable ? "fare-unavailable" : ""
            }">
                ${unavailable ? "—" : renderFare(value)}
            </span>
        </div>
    `;
}


/* =========================================================
   AKHIR PART 1/4
   Lanjutkan dengan PART 2/4.
========================================================= */
/* =========================================================
   TARSUS FINDER
   APP ENGINE — PART 2/4

   - Kartu hasil
   - Tarif utama
   - Tarif alternatif
   - Ringkasan hasil pencarian
   ========================================================= */


/* =========================================================
   14. CREATE TARIFF DETAIL
========================================================= */

function renderTariffDetail(tarif, isMain = false) {
    const route = Array.isArray(tarif.referenceRoute)
        ? tarif.referenceRoute
        : [];

    const label = isMain
        ? "TARIF UTAMA"
        : "TARIF KHUSUS ALTERNATIF";

    return `
        <div class="tariff-detail ${
            isMain ? "tariff-main" : "tariff-alternative"
        }">

            <div class="reference-box">
                <div class="reference-label">
                    ${label}
                </div>

                <div class="reference-route">
                    ${renderRelation(route)}
                </div>
            </div>

            <div class="fare-list">
                ${renderFareItem("EKS", tarif.eks)}
                ${renderFareItem("BIS", tarif.bis)}
                ${renderFareItem("EKO", tarif.eko)}
            </div>

            <div class="tariff-meta">
                <span class="tariff-direction">
                    ${
                        tarif.roundTrip
                            ? "PULANG PERGI"
                            : "SEARAH"
                    }
                </span>

                <span class="tariff-id">
                    ID: ${safeHTML(tarif.idTarif)}
                </span>
            </div>
        </div>
    `;
}


/* =========================================================
   15. CREATE RESULT CARD
========================================================= */

function renderResultCard(group, index) {
    const main = group.main;

    const alternatives = Array.isArray(group.alternatives)
        ? group.alternatives
        : [];

    const cardId = "result-" + index;

    const journey = `
        <div class="journey">
            <span class="journey-station">
                ${safeHTML(group.asal)}
            </span>

            <span class="journey-arrow">→</span>

            <span class="journey-station">
                ${safeHTML(group.tujuan)}
            </span>
        </div>
    `;

    const alternativeHTML = alternatives.length
        ? `
            <details class="tariff-alternatives">
                <summary>
                    <span>
                        Lihat ${alternatives.length}
                        tarif khusus alternatif
                    </span>

                    <span class="alternative-arrow">+</span>
                </summary>

                <div class="alternative-content">
                    ${alternatives
                        .map(tarif =>
                            renderTariffDetail(tarif, false)
                        )
                        .join("")}
                </div>
            </details>
        `
        : `
            <div class="no-alternative">
                Tidak ada tarif alternatif lain
                untuk kelompok KA ini.
            </div>
        `;

    return `
        <article
            class="result-card grouped-result-card"
            id="${cardId}"
        >
            <div class="result-card-top">
                <div class="result-train-symbol">T</div>

                <div class="result-train-info">
                    <div class="result-overline">
                        HASIL PENCARIAN
                    </div>

                    <h3 class="result-name">
                        ${safeHTML(group.namaKA)}
                    </h3>
                </div>

                <div class="result-number">
                    ${String(index + 1).padStart(2, "0")}
                </div>
            </div>

            ${journey}

            ${renderTariffDetail(main, true)}

            ${alternativeHTML}
        </article>
    `;
}


/* =========================================================
   16. RENDER RESULTS
========================================================= */

function renderResults(groups, asal, tujuan) {
    if (!DOM.results) {
        return;
    }

    if (!groups.length) {
        renderEmptyResults(
            "Tarif belum ditemukan",
            "Tidak ditemukan relasi tarif yang cocok. Periksa kembali nama stasiun, arah perjalanan, dan data tarif."
        );

        if (DOM.resultsSummary) {
            DOM.resultsSummary.textContent =
                `${asal} → ${tujuan}`;
        }

        if (DOM.resultsCount) {
            DOM.resultsCount.innerHTML = `
                <span>0</span>
                <small>HASIL</small>
            `;
        }

        return;
    }

    DOM.results.innerHTML = groups
        .map((group, index) =>
            renderResultCard(group, index)
        )
        .join("");

    if (DOM.resultsSummary) {
        DOM.resultsSummary.textContent =
            `${asal} → ${tujuan} · ${groups.length} kelompok KA ditemukan`;
    }

    if (DOM.resultsCount) {
        DOM.resultsCount.innerHTML = `
            <span>${groups.length}</span>
            <small>HASIL</small>
        `;
    }

    /*
       Beri animasi masuk ringan.
    */

    $$(".result-card", DOM.results).forEach(
        (card, index) => {
            card.style.animationDelay =
                `${Math.min(index * 45, 270)}ms`;

            card.classList.add("result-enter");
        }
    );
}


/* =========================================================
   17. RESULT SUMMARY
========================================================= */

function showResultSummary(asal, tujuan, total) {
    if (!DOM.resultsSummary) {
        return;
    }

    DOM.resultsSummary.textContent =
        total > 0
            ? `${asal} → ${tujuan} · ${total} kelompok KA ditemukan`
            : `${asal} → ${tujuan} · Tidak ada tarif yang cocok`;
}


/* =========================================================
   18. ALTERNATIVE DETAILS INTERACTION
========================================================= */

function setupAlternativeDetails() {
    if (!DOM.results) {
        return;
    }

    DOM.results.addEventListener("toggle", event => {
        const details = event.target;

        if (
            details instanceof HTMLDetailsElement &&
            details.classList.contains("tariff-alternatives")
        ) {
            const arrow = $(".alternative-arrow", details);

            if (arrow) {
                arrow.textContent = details.open ? "−" : "+";
            }
        }
    }, true);
}


/* =========================================================
   AKHIR PART 2/4
   Lanjutkan dengan PART 3/4.
========================================================= */
/* =========================================================
   TARSUS FINDER
   APP ENGINE — PART 3/4

   - Saran stasiun
   - Pilih stasiun
   - Tukar stasiun
   - Reset formulir
   - Pencarian tarif
   ========================================================= */


/* =========================================================
   19. HIDE SUGGESTIONS
========================================================= */

function hideSuggestions(container) {
    if (!container) {
        return;
    }

    container.hidden = true;
    container.innerHTML = "";
}


/* =========================================================
   20. RENDER STATION SUGGESTIONS
========================================================= */

function renderStationSuggestions(
    input,
    container,
    query,
    fieldName
) {
    if (!container || !input) {
        return;
    }

    const keyword = String(query ?? "").trim();

    if (!keyword || !STATE.databaseReady) {
        hideSuggestions(container);
        return;
    }

    const suggestions =
        window.TARSUS_DATA.suggestions(
            keyword,
            APP_CONFIG.suggestionLimit
        );

    if (!suggestions.length) {
        container.innerHTML = `
            <div class="suggestion-empty">
                Stasiun tidak ditemukan.
            </div>
        `;

        container.hidden = false;
        return;
    }

    container.innerHTML = suggestions
        .map((station, index) => `
            <button
                type="button"
                class="suggestion-item"
                data-station-name="${safeHTML(station.namaStasiun)}"
                data-station-field="${fieldName}"
                role="option"
                aria-selected="false"
            >
                <span class="suggestion-marker">
                    ${index + 1}
                </span>

                <span class="suggestion-copy">
                    <span class="suggestion-name">
                        ${safeHTML(station.namaStasiun)}
                    </span>

                    <span class="suggestion-meta">
                        ${safeHTML(station.daop || "Stasiun")}
                    </span>
                </span>

                <span class="suggestion-arrow">↗</span>
            </button>
        `)
        .join("");

    container.hidden = false;
}


/* =========================================================
   21. SELECT STATION
========================================================= */

function selectStation(name, fieldName) {
    const isOrigin = fieldName === "origin";

    const input = isOrigin
        ? DOM.origin
        : DOM.destination;

    const container = isOrigin
        ? DOM.originSuggestions
        : DOM.destinationSuggestions;

    if (!input) {
        return;
    }

    input.value = name;

    if (isOrigin) {
        STATE.selectedOrigin = name;
    } else {
        STATE.selectedDestination = name;
    }

    hideSuggestions(container);

    updateClearButtons();

    input.focus();
}


/* =========================================================
   22. SUGGESTION CLICK HANDLERS
========================================================= */

function setupSuggestionClick(container) {
    if (!container) {
        return;
    }

    container.addEventListener("click", event => {
        const button = event.target.closest(
            "[data-station-name]"
        );

        if (!button) {
            return;
        }

        selectStation(
            button.dataset.stationName,
            button.dataset.stationField
        );
    });
}


/* =========================================================
   23. INPUT EVENTS
========================================================= */

function setupStationInput(input, container, fieldName) {
    if (!input || !container) {
        return;
    }

    input.addEventListener("input", () => {
        updateClearButtons();

        const value = input.value;

        /*
           Batalkan timer sebelumnya agar
           tidak memproses setiap ketikan
           secara berlebihan.
        */

        window.clearTimeout(
            STATE.suggestionTimers[fieldName]
        );

        STATE.suggestionTimers[fieldName] =
            window.setTimeout(() => {
                renderStationSuggestions(
                    input,
                    container,
                    value,
                    fieldName
                );
            }, APP_CONFIG.searchDebounce);
    });

    input.addEventListener("focus", () => {
        if (input.value.trim()) {
            renderStationSuggestions(
                input,
                container,
                input.value,
                fieldName
            );
        }
    });

    input.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            hideSuggestions(container);
        }

        if (
            event.key === "Enter" &&
            !container.hidden
        ) {
            const first = $(
                "[data-station-name]",
                container
            );

            if (first) {
                event.preventDefault();

                selectStation(
                    first.dataset.stationName,
                    fieldName
                );
            }
        }
    });
}


/* =========================================================
   24. CLEAR STATION
========================================================= */

function clearStation(fieldName) {
    const isOrigin = fieldName === "origin";

    const input = isOrigin
        ? DOM.origin
        : DOM.destination;

    const container = isOrigin
        ? DOM.originSuggestions
        : DOM.destinationSuggestions;

    if (!input) {
        return;
    }

    input.value = "";

    if (isOrigin) {
        STATE.selectedOrigin = "";
    } else {
        STATE.selectedDestination = "";
    }

    hideSuggestions(container);

    updateClearButtons();

    input.focus();
}


/* =========================================================
   25. SWAP STATIONS
========================================================= */

function swapStations() {
    if (!DOM.origin || !DOM.destination) {
        return;
    }

    const oldOrigin = DOM.origin.value;
    const oldDestination = DOM.destination.value;

    DOM.origin.value = oldDestination;
    DOM.destination.value = oldOrigin;

    STATE.selectedOrigin = DOM.origin.value;
    STATE.selectedDestination = DOM.destination.value;

    hideSuggestions(DOM.originSuggestions);
    hideSuggestions(DOM.destinationSuggestions);

    updateClearButtons();

    /*
       Animasi kecil pada tombol.
    */

    if (DOM.swapStations) {
        DOM.swapStations.classList.remove("swap-animate");

        void DOM.swapStations.offsetWidth;

        DOM.swapStations.classList.add("swap-animate");
    }
}


/* =========================================================
   26. RESET SEARCH
========================================================= */

function resetSearch() {
    if (DOM.origin) {
        DOM.origin.value = "";
    }

    if (DOM.destination) {
        DOM.destination.value = "";
    }

    STATE.selectedOrigin = "";
    STATE.selectedDestination = "";

    hideSuggestions(DOM.originSuggestions);
    hideSuggestions(DOM.destinationSuggestions);

    setSearchMessage("");

    setSearchLoading(false);

    renderEmptyResults();

    updateClearButtons();

    if (DOM.origin) {
        DOM.origin.focus();
    }
}


/* =========================================================
   27. RUN SEARCH
========================================================= */

async function runSearch(event) {
    if (event) {
        event.preventDefault();
    }

    if (!DOM.origin || !DOM.destination) {
        return;
    }

    const asal = DOM.origin.value.trim();
    const tujuan = DOM.destination.value.trim();

    if (!asal || !tujuan) {
        setSearchMessage(
            "Lengkapi stasiun asal dan tujuan terlebih dahulu.",
            "error"
        );

        showToast(
            "Stasiun asal dan tujuan wajib diisi.",
            "error"
        );

        return;
    }

    if (
        normalizeStationName(asal) ===
        normalizeStationName(tujuan)
    ) {
        setSearchMessage(
            "Stasiun asal dan tujuan tidak boleh sama.",
            "error"
        );

        return;
    }

    if (!STATE.databaseReady) {
        setSearchMessage(
            "Database belum siap. Tunggu hingga data selesai dimuat.",
            "error"
        );

        return;
    }

    const requestId = ++STATE.searchRequest;

    hideSuggestions(DOM.originSuggestions);
    hideSuggestions(DOM.destinationSuggestions);

    setSearchMessage("");

    setSearchLoading(true);

    try {
        /*
           Pencarian data bersifat sinkron.
           setTimeout memberi kesempatan browser
           memperbarui tampilan loading.
        */

        await new Promise(resolve =>
            window.setTimeout(resolve, 30)
        );

        if (requestId !== STATE.searchRequest) {
            return;
        }

        const results =
            window.TARSUS_DATA.search(asal, tujuan);

        renderResults(results, asal, tujuan);

        if (results.length) {
            setSearchMessage(
                `${results.length} kelompok KA ditemukan.`,
                "success"
            );
        } else {
            setSearchMessage(
                "Tidak ditemukan tarif yang sesuai dengan rute tersebut.",
                "info"
            );
        }

        if (DOM.resultsSection) {
            DOM.resultsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    } catch (error) {
        console.error(
            "[TARSUS] Pencarian gagal:",
            error
        );

        setSearchMessage(
            "Pencarian gagal. Periksa data dan coba kembali.",
            "error"
        );

        showToast(
            "Terjadi kesalahan saat mencari tarif.",
            "error"
        );

    } finally {
        if (requestId === STATE.searchRequest) {
            setSearchLoading(false);
        }
    }
}


/* =========================================================
   28. NORMALIZE STATION NAME
========================================================= */

function normalizeStationName(value) {
    return String(value ?? "")
        .trim()
        .toLocaleLowerCase("id-ID")
        .replace(/\s+/g, " ");
}


/* =========================================================
   29. SETUP SEARCH EVENTS
========================================================= */

function setupSearchEvents() {
    setupStationInput(
        DOM.origin,
        DOM.originSuggestions,
        "origin"
    );

    setupStationInput(
        DOM.destination,
        DOM.destinationSuggestions,
        "destination"
    );

    setupSuggestionClick(
        DOM.originSuggestions
    );

    setupSuggestionClick(
        DOM.destinationSuggestions
    );

    if (DOM.searchForm) {
        DOM.searchForm.addEventListener(
            "submit",
            runSearch
        );
    }

    if (DOM.swapStations) {
        DOM.swapStations.addEventListener(
            "click",
            swapStations
        );
    }

    if (DOM.resetSearch) {
        DOM.resetSearch.addEventListener(
            "click",
            resetSearch
        );
    }

    if (DOM.clearOrigin) {
        DOM.clearOrigin.addEventListener(
            "click",
            () => clearStation("origin")
        );
    }

    if (DOM.clearDestination) {
        DOM.clearDestination.addEventListener(
            "click",
            () => clearStation("destination")
        );
    }

    /*
       Klik di luar kolom menutup saran.
    */

    document.addEventListener("click", event => {
        const originField = DOM.origin?.closest(
            ".station-field"
        );

        const destinationField =
            DOM.destination?.closest(".station-field");

        if (
            originField &&
            !originField.contains(event.target)
        ) {
            hideSuggestions(DOM.originSuggestions);
        }

        if (
            destinationField &&
            !destinationField.contains(event.target)
        ) {
            hideSuggestions(DOM.destinationSuggestions);
        }
    });

    updateClearButtons();
}


/* =========================================================
   AKHIR PART 3/4
   Lanjutkan dengan PART 4/4.
========================================================= */
/* =========================================================
   TARSUS FINDER
   APP ENGINE — PART 4/4

   - Navigasi sidebar
   - Tema gelap/terang
   - Cinematic intro
   - Memuat database
   - Inisialisasi aplikasi
   ========================================================= */


/* =========================================================
   30. SIDEBAR
========================================================= */

function openSidebar() {
    if (!DOM.sidebar) {
        return;
    }

    DOM.sidebar.classList.add("open");

    if (DOM.sidebarBackdrop) {
        DOM.sidebarBackdrop.classList.add("visible");
    }

    document.body.classList.add("sidebar-open");
}


function closeSidebar() {
    if (DOM.sidebar) {
        DOM.sidebar.classList.remove("open");
    }

    if (DOM.sidebarBackdrop) {
        DOM.sidebarBackdrop.classList.remove("visible");
    }

    document.body.classList.remove("sidebar-open");
}


/* =========================================================
   31. PAGE NAVIGATION
========================================================= */

const PAGE_NAMES = {
    search: "Pencarian Tarif",
    information: "Informasi Aplikasi",
    guide: "Panduan Penggunaan",
    terms: "Syarat & Ketentuan",
    contact: "Hubungi Pengelola"
};


function navigateToPage(pageName) {
    const page = PAGE_NAMES[pageName]
        ? pageName
        : "search";

    STATE.activePage = page;

    $$(".page-section").forEach(section => {
        section.classList.toggle(
            "active",
            section.id === "page-" + page
        );
    });

    $$("[data-page]").forEach(button => {
        const isActive =
            button.dataset.page === page;

        button.classList.toggle(
            "active",
            isActive
        );

        button.setAttribute(
            "aria-current",
            isActive ? "page" : "false"
        );
    });

    if (DOM.breadcrumbCurrent) {
        DOM.breadcrumbCurrent.textContent =
            PAGE_NAMES[page];
    }

    closeSidebar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function setupNavigation() {
    $$("[data-page]").forEach(button => {
        button.addEventListener("click", () => {
            navigateToPage(button.dataset.page);
        });
    });

    if (DOM.openSidebar) {
        DOM.openSidebar.addEventListener(
            "click",
            openSidebar
        );
    }

    if (DOM.closeSidebar) {
        DOM.closeSidebar.addEventListener(
            "click",
            closeSidebar
        );
    }

    if (DOM.sidebarBackdrop) {
        DOM.sidebarBackdrop.addEventListener(
            "click",
            closeSidebar
        );
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });
}


/* =========================================================
   32. THEME
========================================================= */

function applyTheme(theme, save = true) {
    const selectedTheme =
        theme === "dark" ? "dark" : "light";

    document.body.dataset.theme = selectedTheme;

    if (DOM.themeIcon) {
        DOM.themeIcon.textContent =
            selectedTheme === "dark" ? "☾" : "☼";
    }

    if (DOM.themeToggle) {
        DOM.themeToggle.setAttribute(
            "aria-label",
            selectedTheme === "dark"
                ? "Gunakan tema terang"
                : "Gunakan tema gelap"
        );
    }

    const metaTheme = $(
        'meta[name="theme-color"]'
    );

    if (metaTheme) {
        metaTheme.content =
            selectedTheme === "dark"
                ? "#0c1421"
                : "#101b2d";
    }

    if (save) {
        try {
            localStorage.setItem(
                "tarsus-theme",
                selectedTheme
            );
        } catch (error) {
            console.warn(
                "[TARSUS] Preferensi tema tidak dapat disimpan."
            );
        }
    }
}


function initializeTheme() {
    let savedTheme = "light";

    try {
        savedTheme =
            localStorage.getItem("tarsus-theme") ||
            "light";
    } catch (error) {
        savedTheme = "light";
    }

    applyTheme(savedTheme, false);

    if (DOM.themeToggle) {
        DOM.themeToggle.addEventListener("click", () => {
            const current =
                document.body.dataset.theme;

            applyTheme(
                current === "dark" ? "light" : "dark"
            );
        });
    }
}


/* =========================================================
   33. CINEMATIC INTRO
========================================================= */

function playIntro() {
    return new Promise(resolve => {
        if (!DOM.intro) {
            resolve();
            return;
        }

        const reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

        const duration = reducedMotion
            ? 250
            : APP_CONFIG.introDuration;

        window.setTimeout(() => {
            DOM.intro.classList.add("is-hidden");
            DOM.intro.classList.add("hide");

            window.setTimeout(() => {
                DOM.intro.hidden = true;
                resolve();
            }, reducedMotion ? 0 : 650);

        }, duration);
    });
}


/* =========================================================
   34. UPDATE INTRO STATUS
========================================================= */

function updateIntroStatus(message) {
    const status = $("#introStatus");

    if (status) {
        status.textContent = message;
    }
}


/* =========================================================
   35. DATABASE INITIALIZATION
========================================================= */

async function initializeDatabase() {
    if (
        !window.TARSUS_DATA ||
        typeof window.TARSUS_DATA.load !== "function"
    ) {
        throw new Error(
            "Data engine tidak ditemukan. " +
            "Pastikan data.js dimuat sebelum app.js."
        );
    }

    STATE.databaseLoading = true;

    updateIntroStatus("MENGHUBUNGKAN DATABASE");

    try {
        const info =
            await window.TARSUS_DATA.load();

        STATE.databaseReady = true;

        updateIntroStatus("SISTEM SIAP");

        console.info(
            "[TARSUS] Database berhasil dimuat:",
            info
        );

        showToast(
            `Database siap · ${info.totalStasiun} stasiun`,
            "success"
        );

        return info;

    } catch (error) {
        STATE.databaseReady = false;

        updateIntroStatus("DATABASE PERLU DIPERIKSA");

        console.error(
            "[TARSUS] Database gagal dimuat:",
            error
        );

        setSearchMessage(
            "Database belum dapat diakses. Periksa koneksi internet, izin Google Sheets, dan nama sheet.",
            "error"
        );

        showToast(
            "Database gagal dimuat. Periksa koneksi dan akses Google Sheets.",
            "error"
        );

        return null;

    } finally {
        STATE.databaseLoading = false;
    }
}


/* =========================================================
   36. CLOSE SUGGESTIONS WHEN SCROLLING
========================================================= */

function setupGlobalInteractions() {
    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeSidebar();
        }
    });

    window.addEventListener("online", () => {
        showToast(
            "Koneksi internet tersedia kembali.",
            "success"
        );
    });

    window.addEventListener("offline", () => {
        showToast(
            "Koneksi internet terputus.",
            "error"
        );
    });
}


/* =========================================================
   37. INITIALIZE APPLICATION
========================================================= */

async function initializeApp() {
    initializeVersion();

    initializeTheme();

    setupNavigation();

    setupSearchEvents();

    setupAlternativeDetails();

    setupGlobalInteractions();

    renderEmptyResults();

    /*
       Tampilkan aplikasi setelah intro.
       Database dimuat bersamaan dengan
       tampilan pembuka.
    */

    const databasePromise =
        initializeDatabase();

    await playIntro();

    const databaseInfo =
        await databasePromise;

    if (databaseInfo) {
        setSearchMessage(
            "Database siap digunakan. Silakan pilih stasiun asal dan tujuan.",
            "success"
        );
    }

    console.info(
        "[TARSUS] Aplikasi berhasil diinisialisasi."
    );
}


/* =========================================================
   38. START APPLICATION
========================================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeApp,
        { once: true }
    );
} else {
    initializeApp();
}


/* =========================================================
   END OF APP.JS
========================================================= */
