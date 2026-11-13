/* K-Pedia — infrastruktur UI beranda: panel mengambang, informasi penting, notifikasi, dokumen (tentang/privasi/ketentuan). */
"use strict";
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ph = (n, c = "") => `<i class="ph ph-${n} ic ${c}" aria-hidden="true"></i>`;
  const hasG = () => !!window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const fmtDate = iso => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ""); return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : ""; };

  /* ---------- Panel mengambang (GSAP bila tersedia) ---------- */
  let current = null;
  function openPanel(o) {
    closePanel(true); closePops();
    const host = $("#panelHost"), restore = document.activeElement;
    const wrap = document.createElement("div"); wrap.className = "fpanel-wrap";
    wrap.innerHTML = `<div class="fpanel-scrim"></div><section class="fpanel glass-strong" role="dialog" aria-modal="true" aria-label="${esc(o.title)}"><header class="fpanel-head"><h2>${ph(o.icon || "info")}${esc(o.title)}</h2><button type="button" class="icon-btn" data-fp-close aria-label="Tutup">${ph("x")}</button></header><div class="fpanel-body"></div></section>`;
    host.appendChild(wrap); document.body.classList.add("modal-open");
    const panel = $(".fpanel", wrap), scrim = $(".fpanel-scrim", wrap), body = $(".fpanel-body", wrap);
    const api = { body, wrap, close: () => closePanel(), restore };
    current = { api, o };
    scrim.addEventListener("click", () => closePanel()); $("[data-fp-close]", wrap).addEventListener("click", () => closePanel());
    wrap.addEventListener("keydown", e => {
      if (e.key !== "Tab") return; const f = $$('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])', panel).filter(x => x.offsetParent !== null);
      if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    if (hasG()) {
      let ox = "50% 0%"; if (o.from) { const r = o.from.getBoundingClientRect(), p = panel.getBoundingClientRect(); ox = `${Math.max(0, Math.min(100, ((r.left + r.width / 2 - p.left) / Math.max(p.width, 1)) * 100))}% ${Math.max(0, Math.min(60, (r.top - p.top) / Math.max(p.height, 1) * 100))}%`; }
      gsap.set(scrim, { autoAlpha: 0 }); gsap.set(panel, { autoAlpha: 0, y: 26, scale: .94, transformOrigin: ox });
      gsap.to(scrim, { autoAlpha: 1, duration: .25, ease: "power1.out" });
      gsap.to(panel, { autoAlpha: 1, y: 0, scale: 1, duration: .5, ease: "expo.out", clearProps: "transform" });
      requestAnimationFrame(() => { const kids = $$(".clock-card, .cal-grid > *, .wx-now, .wx-hour, .wx-day", body).slice(0, 60); if (kids.length) gsap.from(kids, { y: 12, autoAlpha: 0, duration: .4, ease: "power3.out", stagger: { each: .008, from: "start" }, delay: .12, clearProps: "all" }); });
    }
    setTimeout(() => $("[data-fp-close]", wrap)?.focus({ preventScroll: true }), 30);
    return api;
  }
  function closePanel(instant) {
    if (!current) return; const { api, o } = current; current = null;
    const done = () => { api.wrap.remove(); document.body.classList.remove("modal-open"); o.onClose && o.onClose(); try { (api.restore || o.from)?.focus?.({ preventScroll: true }); } catch (_) {} };
    if (instant || !hasG()) return done();
    gsap.to($(".fpanel", api.wrap), { autoAlpha: 0, y: 14, scale: .97, duration: .2, ease: "power2.in" });
    gsap.to($(".fpanel-scrim", api.wrap), { autoAlpha: 0, duration: .22, onComplete: done });
  }

  /* ---------- Popover (profil, notifikasi) ---------- */
  function closePops(except) {
    if (except !== "sidebar") { $("#sidebar")?.classList.remove("open"); $("#openSidebar")?.setAttribute("aria-expanded", "false"); }
    if (except !== "notif") { $("#notifMenu")?.classList.remove("open"); $("#notifButton")?.setAttribute("aria-expanded", "false"); }
    if (!except) $("#sidebarScrim")?.classList.remove("visible");
  }

  /* ---------- Informasi penting ---------- */
  const CATS = [["semua", "Semua"], ["pengumuman", "Pengumuman administrator"], ["gangguan", "Gangguan operasional"], ["layanan", "Informasi layanan"], ["promo", "Promo dan produk"], ["pembaruan", "Pembaruan K-Pedia"]];
  const CAT_LABEL = Object.fromEntries(CATS);
  const EMPTY = {
    pengumuman: "Belum ada pengumuman dari administrator.",
    gangguan: "Belum ada informasi gangguan operasional yang dipublikasikan di K-Pedia. Untuk kondisi operasional terkini, rujuk kanal resmi KAI (KAI 121, kai.id).",
    layanan: "Belum ada informasi layanan.", promo: "Belum ada promo atau informasi produk.", pembaruan: "Belum ada pembaruan."
  };
  let feed = [], cat = "semua", feedNote = "";
  async function loadFeed() {
    const base = (window.KP_ANNOUNCEMENTS?.items || []).slice(), url = window.KP_ANNOUNCEMENTS?.remoteUrl;
    feed = base;
    if (url) {
      const key = "kp:feed:remote"; let cached = null; try { cached = JSON.parse(localStorage.getItem(key) || "null"); } catch (_) {}
      let remote = null;
      if (cached && Date.now() - cached.at < 30 * 60 * 1000) remote = cached.items;
      else { try { const ctl = new AbortController(); setTimeout(() => ctl.abort(), 7000); const r = await fetch(url, { signal: ctl.signal }); if (r.ok) { const j = await r.json(); remote = Array.isArray(j) ? j : j.items; if (remote) localStorage.setItem(key, JSON.stringify({ at: Date.now(), items: remote })); } } catch (_) { remote = cached?.items || null; feedNote = "Sumber pengumuman daring tidak dapat dijangkau; menampilkan data bawaan."; } }
      if (Array.isArray(remote)) { const ids = new Set(remote.map(x => x.id)); feed = [...remote.filter(x => x && x.title && CAT_LABEL[x.category]), ...base.filter(b => !ids.has(b.id))]; }
    }
    feed.sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0) || String(b.date || b.effective || "").localeCompare(String(a.date || a.effective || "")));
  }
  function renderFilters() {
    const box = $("#infoFilters"); if (!box) return;
    box.innerHTML = CATS.map(([k, l]) => `<button type="button" role="tab" aria-selected="${k === cat}" class="${k === cat ? "active" : ""}" data-cat="${k}">${l}${k !== "semua" ? ` <small style="opacity:.7">${feed.filter(x => x.category === k).length}</small>` : ""}</button>`).join("");
  }
  function renderInfo() {
    const grid = $("#infoGrid"); if (!grid) return;
    const list = cat === "semua" ? feed : feed.filter(x => x.category === cat);
    if (!list.length) { grid.innerHTML = `<div class="info-empty">${ph(cat === "gangguan" ? "shield-check" : "megaphone")}<strong>${cat === "semua" ? "Belum ada informasi" : CAT_LABEL[cat]}</strong><p>${esc(EMPTY[cat] || "Belum ada informasi.")}</p>${cat === "gangguan" ? '<p><a href="https://www.kai.id" target="_blank" rel="noopener noreferrer">Buka kai.id</a></p>' : ""}</div>`; return; }
    grid.innerHTML = list.map(it => `<button type="button" class="info-card" data-info="${esc(it.id)}">${it.image ? `<span class="ic-thumb-wrap"><img class="ic-thumb" src="${esc(it.image)}" alt="" loading="lazy" decoding="async"></span>` : ""}<span class="info-body"><span class="info-meta"><span class="cat-badge c-${it.category}"><i></i>${esc(CAT_LABEL[it.category] || it.category)}</span>${it.important ? '<span class="imp-tag">Penting</span>' : ""}</span><h3>${esc(it.title)}</h3><p>${esc(it.desc || "")}</p><span class="info-foot">${it.date ? `<span>${ph("calendar-blank", "ic-sm")}${fmtDate(it.date)}</span>` : it.effective ? `<span>${ph("calendar-blank", "ic-sm")}Berlaku ${fmtDate(it.effective)}</span>` : ""}${it.source ? `<span>${ph("seal-check", "ic-sm")}${esc(it.source)}</span>` : ""}</span></span></button>`).join("");
    if (hasG() && !renderInfo.once) { renderInfo.once = true; }
  }
  function openInfo(id) {
    const it = feed.find(x => x.id === id); if (!it) return;
    openDoc(it.title, `<div class="info-meta"><span class="cat-badge c-${it.category}"><i></i>${esc(CAT_LABEL[it.category] || "")}</span>${it.important ? '<span class="imp-tag">Penting</span>' : ""}</div>${it.image ? `<img class="doc-img" src="${esc(it.image)}" alt="Poster: ${esc(it.title)}">` : ""}<p>${esc(it.desc || "")}</p>${it.effective ? `<p><b>Berlaku:</b> ${fmtDate(it.effective)}</p>` : ""}${it.date ? `<p><b>Tanggal:</b> ${fmtDate(it.date)}</p>` : ""}${it.source ? `<p><b>Sumber:</b> ${esc(it.source)}</p>` : ""}${it.link && /^https:\/\//.test(it.link) ? `<p><a class="btn primary" href="${esc(it.link)}" target="_blank" rel="noopener noreferrer">${esc(it.linkLabel || "Buka tautan")} ${ph("arrow-square-out")}</a></p>` : ""}`);
  }

  /* ---------- Notifikasi ---------- */
  const SEEN = "kp:notif:seen";
  const seen = () => { try { return JSON.parse(localStorage.getItem(SEEN) || "[]"); } catch (_) { return []; } };
  const notifs = () => feed.filter(x => x.notify || x.category === "pengumuman" || x.category === "gangguan");
  function paintNotif() {
    const list = notifs(), s = seen(), unread = list.filter(x => !s.includes(x.id)).length, dot = $("#notifDot");
    if (dot) { dot.hidden = !unread; dot.textContent = unread > 9 ? "9+" : unread; }
    const m = $("#notifMenu"); if (!m) return;
    m.innerHTML = `<div class="notif-head"><h2>Notifikasi</h2></div>` + (list.length ? `<div class="notif-list">${list.map(x => `<button type="button" class="notif-item ${s.includes(x.id) ? "" : "is-new"}" data-info="${esc(x.id)}"><span class="ni-ic">${ph(x.category === "gangguan" ? "warning" : x.category === "pembaruan" ? "sparkle" : "megaphone")}</span><span><strong>${esc(x.title)}</strong><small>${esc(CAT_LABEL[x.category] || "")}${x.date ? " · " + fmtDate(x.date) : ""}</small></span></button>`).join("")}</div>` : `<div class="notif-empty">${ph("bell-simple-slash")}<p>Tidak ada notifikasi baru.</p></div>`);
  }
  function toggleNotif() {
    const m = $("#notifMenu"), b = $("#notifButton"), open = !m.classList.contains("open");
    closePops(); if (!open) return;
    paintNotif(); m.classList.add("open"); b.setAttribute("aria-expanded", "true"); $("#sidebarScrim").classList.add("visible");
    try { localStorage.setItem(SEEN, JSON.stringify([...new Set([...seen(), ...notifs().map(x => x.id)])])); } catch (_) {}
    setTimeout(() => { const d = $("#notifDot"); if (d) d.hidden = true; }, 600);
  }

  /* ---------- Dokumen ---------- */
  const DOCS = {
    about: ["Tentang K-Pedia", `<p>K-Pedia (KAI Knowledge &amp; Tools) adalah ruang kerja digital yang membantu petugas Customer Service perkeretaapian menemukan informasi dengan cepat, mudah, dan akurat.</p><ul><li><b>Manual tools first:</b> alat bantu manual menjadi inti; RAKA AI hanya asisten opsional.</li><li><b>Bukan</b> situs pemesanan tiket, CRM, aplikasi percakapan pelanggan, atau situs berita.</li><li>Bukan aplikasi resmi PT Kereta Api Indonesia (Persero). Selalu pastikan ke sumber resmi KAI sebelum menyampaikan informasi.</li><li>Data tarif dan ensiklopedia dikelola administrator atau pengembang.</li></ul>`],
    privacy: ["Kebijakan privasi", `<p class="draft">Draf ringkas berdasarkan cara kerja aplikasi saat ini. Perlu ditinjau pihak yang berwenang sebelum dipublikasikan resmi.</p><h3>Data yang diproses</h3><ul><li>Akun: nama, email, dan status persetujuan disimpan di layanan akun K-Pedia.</li><li>Di perangkat Anda: favorit, riwayat pencarian, preferensi tampilan, serta salinan sementara data tarif, cuaca, dan hari libur.</li><li>Pertanyaan dan lampiran yang Anda kirim ke RAKA diproses oleh layanan AI K-Pedia untuk menjawab.</li></ul><h3>Layanan pihak ketiga</h3><ul><li>Cuaca: lokasi stasiun atau wilayah yang Anda pilih dikirim ke Open-Meteo.</li><li>Peta, font, ikon, dan pustaka animasi dimuat dari penyedia CDN sehingga alamat IP Anda terlihat oleh mereka.</li></ul><h3>Kontrol Anda</h3><ul><li>Riwayat dan favorit dapat dihapus di Pengaturan.</li><li>Keluar dari akun menutup sesi di perangkat ini.</li></ul>`],
    terms: ["Ketentuan penggunaan", `<p class="draft">Draf ringkas. Perlu ditinjau pihak yang berwenang sebelum dipublikasikan resmi.</p><ul><li>K-Pedia ditujukan bagi petugas yang disetujui administrator; jangan membagikan akun.</li><li>Informasi tarif, relasi, dan aturan dapat berubah. Verifikasi ke sumber resmi KAI sebelum digunakan atau disampaikan kepada pelanggan.</li><li>Jawaban RAKA AI dapat keliru; periksa sumber yang ditampilkan.</li><li>Dilarang menyalahgunakan akses, mengambil data secara massal, atau mengganggu layanan.</li><li>Fitur bertanda Segera belum memiliki data dan belum dapat dipakai.</li></ul>`]
  };
  function openDoc(title, html) {
    const m = $("#docModal"); $("#docTitle").textContent = title; $("#docBody").innerHTML = html; m.hidden = false; document.body.classList.add("modal-open");
    m._restore = document.activeElement;
    if (hasG()) { gsap.fromTo($(".doc-card", m), { autoAlpha: 0, y: 24, scale: .96 }, { autoAlpha: 1, y: 0, scale: 1, duration: .4, ease: "expo.out", clearProps: "transform" }); gsap.fromTo($(".doc-scrim", m), { autoAlpha: 0 }, { autoAlpha: 1, duration: .22 }); }
    setTimeout(() => $(".doc-close", m).focus({ preventScroll: true }), 30);
  }
  function closeDoc() {
    const m = $("#docModal"); if (m.hidden) return;
    const done = () => { m.hidden = true; if (!$("#panelHost .fpanel-wrap")) document.body.classList.remove("modal-open"); try { m._restore?.focus({ preventScroll: true }); } catch (_) {} };
    if (hasG()) { gsap.to($(".doc-card", m), { autoAlpha: 0, y: 12, duration: .18, ease: "power2.in" }); gsap.to($(".doc-scrim", m), { autoAlpha: 0, duration: .2, onComplete: done }); } else done();
  }

  /* ---------- Pemasangan ---------- */
  async function startHome() {
    await loadFeed(); renderFilters(); renderInfo(); paintNotif();
    window.KP_TIME?.startChip(); window.KP_WEATHER?.startChip();
    window.KP_TIME?.loadHolidays(window.KP_TIME.now().y);
  }
  function init() {
    document.addEventListener("click", e => {
      const op = e.target.closest("[data-open]"), cf = e.target.closest("[data-cat]"), info = e.target.closest("[data-info]"), doc = e.target.closest("[data-doc]");
      if (op) { op.dataset.open === "calendar" ? window.KP_TIME?.open() : window.KP_WEATHER?.open(); return; }
      if (cf) { cat = cf.dataset.cat; renderFilters(); renderInfo(); if (hasG()) gsap.from("#infoGrid > *", { y: 14, autoAlpha: 0, duration: .35, ease: "power3.out", stagger: .04, clearProps: "all" }); return; }
      if (info) { closePops(); openInfo(info.dataset.info); return; }
      if (doc && DOCS[doc.dataset.doc]) { openDoc(...DOCS[doc.dataset.doc]); return; }
      if (e.target.closest("[data-close-doc]")) closeDoc();
      if (e.target.closest("#notifButton")) toggleNotif();
      else if (e.target.closest(".pop-item[data-page]")) closePops();
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { if (!$("#docModal").hidden) closeDoc(); else if (current) closePanel(); else closePops(); } });
    const shell = $("#appShell");
    const run = () => { if (!shell.hidden && !init.started) { init.started = true; startHome(); } };
    new MutationObserver(run).observe(shell, { attributes: true, attributeFilter: ["hidden"] }); run();
  }
  window.KP_UI = { openPanel, closePanel, closePops, openDoc, fmtDate, esc };
  window.KP_TOOLS = { _loadFeed: loadFeed, _feed: () => feed };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init, { once: true }) : init();
})();
