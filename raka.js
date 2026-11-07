/* K-Pedia 6.6 — RAKA (Railway Assistant KAI)
   Asisten yang tidak hanya menjawab, tetapi juga membaca isi website dan menggerakkannya:
   membukakan menu, mengisi pencarian tarif, menunjukkan stasiun di peta, mengganti tampilan.
   Akun: memakai akun tunggal website (auth.js), tidak ada login kedua.
   Alur jawaban: (1) kumpulkan konteks lokal di browser (tarif, stasiun, ensiklopedia, spreadsheet RAKA)
   -> (2) kirim ke Worker; AI menjawab luwes dan, bila data lokal tidak cukup, mencari di internet
   -> (3) browser memasang tombol aksi dari penanda [[aksi:...]] dan dari pembacaan maksud pertanyaan.
   Bila server tidak terjangkau, RAKA tetap menjawab dari data lokal (mode offline) dan tombol aksi tetap berfungsi. */
"use strict";
(function () {
  const A = window.KP_AUTH;
  const SUGGEST = [
    "Tunjukkan stasiun Pasar Senen di peta",
    "Buka menu tarif khusus",
    "Tarif kereta Bandung ke Yogyakarta",
    "Berapa batas bagasi gratis?",
    "Ganti ke mode gelap"
  ];

  const S = { msgs: [], convId: null, busy: false, showHistory: false, history: [], admin: false, adminTab: "users", adminData: null };
  let root = null, fab = null;

  const $ = (s, p = document) => p.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const toast = (m, t = "info") => (window.kpToast ? window.kpToast(m, t) : null);
  const safeUrl = u => (/^https:\/\//i.test(u || "") ? u : "#");
  const api = (...a) => A.api(...a);
  const APP = () => window.KP_APP;

  /* ================= Konteks lokal (di browser) ================= */
  const normQ = s => " " + String(s || "").toLocaleLowerCase("id-ID").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim() + " ";
  const clip = (t, n) => String(t || "").replace(/\s+\n/g, "\n").trim().slice(0, n);
  const has = (text, name) => { const n = normQ(name); return n.trim().length >= 4 && text.includes(n); };

  function wikiSection(entry, heading) {
    const body = String(entry.isi || entry.ISI || "");
    if (heading) {
      const parts = body.split(/^##\s+/m).slice(1);
      const hit = parts.find(p => p.split("\n")[0].trim() === heading);
      if (hit) return "## " + hit;
    }
    return (entry.ringkasan ? entry.ringkasan + "\n" : "") + body;
  }
  function fareText(f) {
    const R = window.TARSUS_DATA?.formatRupiah || (v => "Rp " + v);
    const p = [];
    if (Number.isFinite(f.eks)) p.push("Eksekutif " + R(f.eks));
    if (Number.isFinite(f.bis)) p.push("Bisnis " + R(f.bis));
    if (Number.isFinite(f.eko)) p.push("Ekonomi " + R(f.eko));
    return p.join(", ");
  }
  const tarsusNames = () => { try { return (window.TARSUS_DATA?.stations() || []).map(s => s.namaStasiun).filter(Boolean); } catch (_) { return []; } };
  const trainNames = () => { try { return (window.TARSUS_DATA?.trains() || []).map(t => t.namaKA).filter(Boolean); } catch (_) { return []; } };

  /* Dua stasiun tarif yang disebut dalam teks, urut sesuai arah ("dari A ke B" atau "ke B dari A"). */
  function routePair(text) {
    const found = tarsusNames().map(n => ({ n, i: text.indexOf(normQ(n)) })).filter(x => x.i >= 0 && normQ(x.n).trim().length >= 4).sort((a, b) => a.i - b.i);
    const uniq = [...new Map(found.map(x => [x.n.toLowerCase(), x.n])).values()];
    if (uniq.length < 2) return null;
    let [a, b] = uniq; const iKe = text.indexOf(" ke "), iDari = text.indexOf(" dari ");
    if (iKe >= 0 && iDari >= 0 && iKe < iDari) [a, b] = [b, a];
    return { a, b };
  }

  function tariffContext(q) {
    const out = [], D = window.TARSUS_DATA; if (!D) return out;
    const text = normQ(q);
    try {
      const pair = routePair(text);
      if (pair) {
        let res = D.search(pair.a, pair.b), dir = `${pair.a} ke ${pair.b}`;
        if (!res.length) { res = D.search(pair.b, pair.a); dir = `${pair.b} ke ${pair.a}`; }
        if (res.length) out.push({
          title: `Tarif khusus ${dir}`,
          text: res.slice(0, 6).map(r => `${r.namaKA}: ${fareText(r.main)}${r.totalTarif > 1 ? ` (${r.totalTarif} relasi tarif tercatat)` : ""}`).join("\n") + "\nTarif dapat berubah; cek ketersediaan di Access by KAI.",
          source: "Database Tarif Khusus K-Pedia"
        });
      }
      (D.trains() || []).filter(t => t.namaKA && has(text, t.namaKA)).slice(0, 2).forEach(t => {
        const rows = D.tariffsByTrain(t.namaKA).slice(0, 8);
        if (rows.length) out.push({
          title: `Tarif khusus kereta ${t.namaKA}`,
          text: rows.map(r => `${r.stations[0]} - ${r.stations[r.stations.length - 1]}: ${fareText(r)}`).join("\n"),
          source: "Database Tarif Khusus K-Pedia"
        });
      });
    } catch (e) { console.warn("[RAKA] data tarif tidak terbaca", e); }
    return out;
  }
  function stationInfos(text, max = 2) {
    const out = [];
    (window.KP_STATIONS || []).forEach(s => {
      if (out.length >= max) return;
      if ([s.nama, ...(s.alias || [])].some(n => has(text, n))) out.push(s);
    });
    return out;
  }
  function stationContext(q) {
    return stationInfos(normQ(q)).map(s => {
      const lines = [`Kategori: ${s.kategori || "-"}`, `Wilayah: ${[s.region, s.kota, s.provinsi].filter(Boolean).join(", ")}`, s.koordinat?.length ? `Koordinat: ${s.koordinat.join(", ")}` : "", s.elevasi ? `Elevasi: ${s.elevasi} m` : "", s.periode ? `Periode: ${s.periode}` : "",
        s.ulasan, s.deskripsi, s.sejarah ? "Sejarah: " + s.sejarah : "", s.denah ? "Denah: " + s.denah : "", s.fasilitas ? "Fasilitas: " + (Array.isArray(s.fasilitas) ? s.fasilitas.join(", ") : s.fasilitas) : ""].filter(Boolean);
      return { title: "Stasiun " + s.nama, text: clip(lines.join("\n"), 1300), source: "Informasi Stasiun K-Pedia" };
    });
  }
  function wikiContext(q) {
    const out = [];
    try {
      const r = window.KP_SEARCH?.query(q, { limit: 3, faqLimit: 2 }) || {};
      (r.faq || []).forEach(f => out.push({ title: f.q, text: clip(f.a, 1300), source: "Ensiklopedia K-Pedia (FAQ)" }));
      (r.topics || []).forEach(t => out.push({ title: t.entry.judul + (t.section?.heading ? " — " + t.section.heading : ""), text: clip(wikiSection(t.entry, t.section?.heading), 1400), source: "Ensiklopedia K-Pedia: " + t.entry.judul }));
    } catch (e) { console.warn("[RAKA] pencarian ensiklopedia gagal", e); }
    return out;
  }
  function kbMatches(q) { try { return window.KP_KB?.query(q, 3) || []; } catch (_) { return []; } }
  function kbContext(q) {
    return kbMatches(q).map(e => ({ title: e.title, text: clip(e.text + (e.url ? "\nTautan: " + e.url : ""), 1400), source: e.source }));
  }
  const localContext = q => [...kbContext(q), ...tariffContext(q), ...stationContext(q), ...wikiContext(q)].slice(0, 7);

  /* ================= Aksi di website ================= */
  const PAGE_LABEL = { home: "Beranda", tarsus: "Tarif Khusus", search: "Cari tarif per rute", trains: "Cari tarif per kereta", peta: "Peta Jalur", stasiun: "Nama Stasiun", wiki: "Ensiklopedia", favorites: "Favorit", history: "Riwayat pencarian", guide: "Panduan penggunaan", help: "Kritik dan saran", settings: "Pengaturan" };
  const PAGE_ICON = { home: "home", tarsus: "ticket", search: "pin", trains: "train", peta: "map", stasiun: "pin", wiki: "book", favorites: "star", history: "clock", guide: "info", help: "mail", settings: "sliders" };
  const PAGES = [
    { p: "tarsus", re: /tarif khusus|tarsus|tiket murah|tarif murah/ },
    { p: "search", re: /(cari|cek|pencarian|search|temukan).{0,20}(tarif|rute)|berdasarkan rute|per rute/ },
    { p: "trains", re: /berdasarkan kereta|per kereta|cari.{0,12}nama kereta|daftar kereta/ },
    { p: "tarsus", scroll: "#simTitle", label: "Buka Simulasi hemat", icon: "calc", re: /simulasi|hitung hemat|hemat berapa|selisih tarif/ },
    { p: "peta", re: /\bpeta\b|\bmap\b|jalur rel|jalur kereta/ },
    { p: "stasiun", re: /daftar stasiun|nama stasiun|semua stasiun/ },
    { p: "favorites", re: /favorit/ },
    { p: "history", re: /riwayat (pencarian|tarif)|history/ },
    { p: "settings", re: /pengaturan|setelan|settings/ },
    { p: "guide", re: /panduan|cara pakai (aplikasi|k pedia|website|situs)/ },
    { p: "help", re: /kritik|saran|pengembang|developer|lapor(kan)? (data|error|bug)/ },
    { p: "home", re: /beranda|halaman utama|\bhome\b/ }
  ];
  const WHERE = /di ?mana|dimana|lokasi|letak|alamat|peta|\bmap\b|arah|menuju|tunjuk|lihat/;
  const NAV = /buka|bukakan|tampilkan|antar|arahkan|pergi|masuk|menu|halaman|tombol|klik/;

  const mkAct = (t, label, icon, extra = {}) => ({ t, label, icon, ...extra });
  const gmapsUrl = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

  function findStation(name) {
    const n = normQ(name);
    const info = (window.KP_STATIONS || []).find(s => [s.nama, ...(s.alias || [])].some(x => normQ(x) === n)) ||
                 (window.KP_STATIONS || []).find(s => [s.nama, ...(s.alias || [])].some(x => has(n, x) || has(normQ(x), name)));
    if (info) return { info, name: info.nama };
    const t = tarsusNames().find(x => normQ(x) === n) || tarsusNames().find(x => has(n, x));
    return t ? { info: null, name: t } : null;
  }
  function stationActs(st, where) {
    const out = [];
    const detail = mkAct("station", `Detail ${st.name}`, "info", { ref: st.info || st.name });
    const map = st.info?.koordinat?.length === 2 ? mkAct("map", `Tunjukkan ${st.name} di peta`, "map", { id: st.info.id }) : null;
    const gm = mkAct("gmaps", "Buka di Google Maps", "external", { url: gmapsUrl(st.info?.maps || "Stasiun " + st.name) });
    return where ? [map, gm, detail].filter(Boolean) : [detail, map, gm].filter(Boolean);
  }

  /* Baca maksud dari pertanyaan (dan nama yang muncul di jawaban) lalu buat tombol aksi. */
  function detectActions(q, answer = "") {
    const text = normQ(q), both = normQ(q + " " + answer), acts = [];
    const where = WHERE.test(text), nav = NAV.test(text);
    const add = a => { if (a && !acts.some(x => x.t === a.t && x.label === a.label)) acts.push(a); };

    // Rute tarif
    const pair = routePair(text) || (routePair(both));
    const tarifWord = /tarif|harga|tiket|biaya|murah|hemat|berapa/.test(text);
    if (pair && (tarifWord || /dari .* ke /.test(text))) add(mkAct("route", `Lihat tarif ${pair.a} → ${pair.b}`, "ticket", { from: pair.a, to: pair.b }));

    // Stasiun (dari pertanyaan; bila tidak ada, dari jawaban)
    let stations = stationInfos(text).map(i => ({ info: i, name: i.nama }));
    if (!stations.length) { const q2 = tarsusNames().filter(n => has(text, n)).slice(0, 2); stations = q2.map(n => findStation(n)).filter(Boolean); }
    if (!stations.length && answer) stations = stationInfos(normQ(answer), 1).map(i => ({ info: i, name: i.nama }));
    if (!(pair && !where)) stations.slice(0, 2).forEach((st, i) => stationActs(st, where).slice(0, i === 0 ? 3 : 1).forEach(add));

    // Kereta
    trainNames().filter(n => has(text, n)).slice(0, 2).forEach(n => add(mkAct("train", `Relasi tarif ${n}`, "train", { name: n })));

    // Halaman / menu
    let tarsusHit = false;
    PAGES.forEach(pg => {
      if (!pg.re.test(text)) return;
      if (pg.p === "peta" && acts.some(a => a.t === "map")) return;
      if (pg.p === "tarsus" && !pg.scroll) tarsusHit = true;
      add(mkAct("page", pg.label || ("Buka " + PAGE_LABEL[pg.p]), pg.icon || PAGE_ICON[pg.p], { page: pg.p, scroll: pg.scroll }));
    });
    if (tarsusHit) {
      add(mkAct("page", "Cari tarif per rute", "pin", { page: "search" }));
      add(mkAct("page", "Cari tarif per kereta", "train", { page: "trains" }));
    }

    // Tiket, kontak
    const L = window.KP_CONTENT?.links || {};
    if (/beli|pesan|booking|ketersediaan|access by kai|cek tiket|kursi/.test(text) && L.access) add(mkAct("link", "Buka Access by KAI", "ticket", { url: L.access }));
    if (/kontak|call center|hubungi|customer service|\b121\b|whatsapp|\bwa\b/.test(text)) {
      if (L.call) add(mkAct("link", "Telepon KAI 121", "phone", { url: L.call }));
      if (L.whatsapp) add(mkAct("link", "WhatsApp KAI", "chat", { url: L.whatsapp }));
    }

    // Tampilan
    if (/ganti|ubah|aktifkan|pakai|nyalakan|jadikan|setel|set\b|mode|tema/.test(text)) {
      if (/gelap|dark/.test(text)) add(mkAct("theme", "Pakai mode gelap", "moon", { v: "dark" }));
      else if (/terang|light|siang/.test(text)) add(mkAct("theme", "Pakai mode terang", "sun", { v: "light" }));
      else if (/otomatis|ikuti perangkat|sistem/.test(text)) add(mkAct("theme", "Ikuti pengaturan perangkat", "sliders", { v: "system" }));
    }
    if (/(besar|perbesar|gede).{0,12}(teks|tulisan|huruf)|(teks|tulisan|huruf).{0,12}(besar|gede)/.test(text) && /ubah|ganti|perbesar|besarkan|bikin|buat/.test(text)) add(mkAct("font", "Perbesar teks", "plus", { v: "large" }));
    if (/(kecil|perkecil).{0,12}(teks|tulisan|huruf)|(teks|tulisan|huruf).{0,12}kecil/.test(text) && /ubah|ganti|perkecil|kecilkan|bikin|buat/.test(text)) add(mkAct("font", "Perkecil teks", "minus", { v: "small" }));

    // Artikel ensiklopedia terkait (maksimal satu)
    try {
      const r = window.KP_SEARCH?.query(q, { limit: 2, faqLimit: 1 }) || {};
      const t = (r.topics || [])[0];
      if (t && !acts.some(a => a.t === "wiki") && acts.length < 4) add(mkAct("wiki", "Baca: " + t.entry.judul, "book", { id: t.id, anchor: t.section?.anchor }));
    } catch (_) {}

    // Urutkan: bila pengguna jelas minta membuka sesuatu, halaman duluan; selain itu urutan alami.
    if (nav) acts.sort((a, b) => (b.t === "page") - (a.t === "page"));
    return acts.slice(0, 5);
  }

  /* Penanda dari AI: [[aksi:jenis|argumen|argumen]] -> tombol. Penanda dibuang dari teks yang ditampilkan. */
  function extractMarkers(text) {
    const acts = [];
    const clean = String(text || "").replace(/\[\[\s*aksi\s*:\s*([^\]]+?)\s*\]\]/gi, (_, body) => {
      const [kind, ...args] = body.split("|").map(s => s.trim());
      const a = fromMarker(String(kind).toLowerCase(), args); if (a) acts.push(a); return "";
    }).replace(/[ \t]+\n/g, "\n").trim();
    return { clean, acts };
  }
  function fromMarker(kind, args) {
    const [x, y] = args, app = APP();
    if (kind === "halaman") { const p = String(x || "").toLowerCase(); return app?.pages.includes(p) && p !== "raka" ? mkAct("page", y || "Buka " + PAGE_LABEL[p], PAGE_ICON[p] || "chevron", { page: p }) : null; }
    if (kind === "tarif") {
      const a = tarsusNames().find(n => normQ(n) === normQ(x)), b = tarsusNames().find(n => normQ(n) === normQ(y));
      return a && b ? mkAct("route", `Lihat tarif ${a} → ${b}`, "ticket", { from: a, to: b }) : null;
    }
    if (kind === "stasiun") { const st = findStation(x); return st ? stationActs(st, false)[0] : null; }
    if (kind === "peta") {
      const st = findStation(x); if (!st) return x ? mkAct("gmaps", `Cari “${x}” di Google Maps`, "external", { url: gmapsUrl(x) }) : null;
      return stationActs(st, true)[0];
    }
    if (kind === "kereta") { const n = trainNames().find(t => normQ(t) === normQ(x)); return n ? mkAct("train", `Relasi tarif ${n}`, "train", { name: n }) : null; }
    if (kind === "wiki") return x ? mkAct("wiki", y || "Baca selengkapnya", "book", { id: x }) : null;
    if (kind === "link") return /^https:\/\//i.test(x || "") ? mkAct("link", y || "Buka tautan", "external", { url: x }) : null;
    if (kind === "tema") { const v = { gelap: "dark", terang: "light", otomatis: "system" }[String(x).toLowerCase()]; return v ? mkAct("theme", "Ganti tampilan", v === "dark" ? "moon" : "sun", { v }) : null; }
    return null;
  }

  function runAction(a) {
    const app = APP(); if (!app || !a) return;
    try {
      if (a.t === "page") app.go(a.page, a.scroll);
      else if (a.t === "route") app.route(a.from, a.to);
      else if (a.t === "station") app.station(a.ref);
      else if (a.t === "map") app.mapStation(a.id);
      else if (a.t === "train") app.train(a.name);
      else if (a.t === "wiki") app.wiki(a.id, a.anchor);
      else if (a.t === "theme") { app.theme(a.v); toast("Tampilan diganti", "success"); }
      else if (a.t === "font") app.fontSize(a.v);
    } catch (e) { console.warn("[RAKA] aksi gagal", e); toast("Aksi tidak bisa dijalankan.", "error"); }
  }

  /* ================= Media dari spreadsheet (gambar / tautan) ================= */
  function imgSrc(u) {
    const m = /drive\.google\.com\/file\/d\/([\w-]+)/.exec(u || "") || /drive\.google\.com\/open\?id=([\w-]+)/.exec(u || "");
    return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000` : u;
  }
  function mediaFor(q) {
    return kbMatches(q).filter(e => e.url && (e.type === "gambar" || e.type === "link")).slice(0, 3)
      .map(e => e.type === "gambar" ? { kind: "img", src: imgSrc(e.url), cap: e.title } : { kind: "link", url: e.url, title: e.title });
  }

  /* ================= Jawaban offline (data lokal saja) ================= */
  function localAnswer(q, ctx, why) {
    const lead = why === "pending" ? "Akunmu belum disetujui admin untuk fitur AI, jadi sementara aku jawab dari data K-Pedia dulu ya."
      : why === "offline" ? "Aku lagi nggak bisa terhubung ke server AI, jadi ini yang aku punya di data K-Pedia:" : "";
    const items = ctx.filter(c => !/^Tarif khusus kereta/.test(c.title) || ctx.length === 1).slice(0, 2);
    if (items.length) return [{ origin: "local", text: (lead ? lead + "\n\n" : "") + items.map(c => `**${c.title}**\n${clip(c.text, 700)}`).join("\n\n") }];
    return [{ origin: "none", text: (lead ? lead + "\n\n" : "") + "Aku belum menemukan jawabannya di data K-Pedia, dan pencarian internet butuh koneksi ke server AI. Coba tanya dengan kata lain, atau pakai tombol di bawah untuk membuka menu yang mungkin membantu." }];
  }

  /* ================= Tampilan teks ================= */
  const inline = s => s
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)|(https:\/\/[^\s<)]+[^\s<).,;:!?])/g, (m, t, u1, u2) => { const u = u1 || u2; return `<a href="${u}" target="_blank" rel="noopener noreferrer">${t || u.replace(/^https:\/\/(www\.)?/, "").slice(0, 48)}</a>`; });
  function fmt(t) {
    let out = "", list = null;
    const close = () => { if (list) { out += `</${list}>`; list = null; } };
    esc(t).split("\n").forEach(raw => {
      const l = raw.trim(); let m;
      if (!l) { close(); return; }
      if ((m = /^[-*•]\s+(.*)/.exec(l))) { if (list !== "ul") { close(); out += "<ul>"; list = "ul"; } out += `<li>${inline(m[1])}</li>`; }
      else if ((m = /^\d+[.)]\s+(.*)/.exec(l))) { if (list !== "ol") { close(); out += "<ol>"; list = "ol"; } out += `<li>${inline(m[1])}</li>`; }
      else { close(); out += `<p>${inline(l.replace(/^#+\s*/, ""))}</p>`; }
    });
    close(); return out;
  }
  const TAGS = { local: ["local", "Dari data K-Pedia"], web: ["web", "Dari internet"] };
  function actionsHTML(m, mi) {
    const media = (m.media || []).map(x => x.kind === "img"
      ? `<figure class="raka-img"><img src="${esc(safeUrl(x.src))}" alt="${esc(x.cap)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('figure').hidden=true"><figcaption>${esc(x.cap)}</figcaption></figure>` : "").join("");
    const btns = [
      ...(m.actions || []).map((a, i) => ["link", "gmaps"].includes(a.t)
        ? `<a class="raka-act" href="${esc(safeUrl(a.url))}" target="_blank" rel="noopener noreferrer">${ic(a.icon || "external")}<span>${esc(a.label)}</span></a>`
        : `<button class="raka-act" type="button" data-act="do" data-m="${mi}" data-i="${i}">${ic(a.icon || "chevron")}<span>${esc(a.label)}</span></button>`),
      ...(m.media || []).filter(x => x.kind === "link").map(x => `<a class="raka-act" href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener noreferrer">${ic("external")}<span>${esc(x.title)}</span></a>`)
    ].join("");
    return media + (btns ? `<div class="raka-actions" role="group" aria-label="Aksi yang bisa dilakukan">${btns}</div>` : "");
  }
  function botHTML(m, mi) {
    if (m.loading) return `<div class="raka-row bot"><div class="raka-bubble" aria-live="polite"><span class="raka-dots" aria-label="RAKA sedang mencari"><i></i><i></i><i></i></span></div></div>`;
    if (m.error) return `<div class="raka-row bot"><div class="raka-bubble"><p class="raka-err">${esc(m.error)}</p></div></div>`;
    const parts = (m.parts || []).map(p => {
      const tag = TAGS[p.origin];
      return `<div class="raka-part">${tag ? `<span class="raka-tag ${tag[0]}">${tag[1]}</span>` : ""}${fmt(p.text)}</div>`;
    }).join("");
    const src = (m.sources || []).map(s => /^https:\/\//i.test(s.url || "") ? `<a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>` : `<span>${esc(s.label || s.title)}</span>`).join("");
    return `<div class="raka-row bot"><div class="raka-bubble">${parts}${actionsHTML(m, mi)}${src ? `<div class="raka-src">${src}</div>` : ""}</div></div>`;
  }
  const msgHTML = (m, i) => m.role === "user" ? `<div class="raka-row user"><div class="raka-bubble"><p>${esc(m.text)}</p></div></div>` : botHTML(m, i);

  /* ================= Layar ================= */
  function head(extra = "") {
    return `<div class="raka-head"><span class="raka-avatar" aria-hidden="true">${ic("train")}</span><div class="raka-title"><strong>RAKA</strong><small>Railway Assistant KAI</small></div>${extra}</div>`;
  }
  function viewChat() {
    const u = A.user || {}, pending = u.status && u.status !== "active";
    const tools = `<div class="raka-tools"><button class="clay-btn ghost" data-act="new" type="button">Percakapan baru</button><button class="clay-btn ghost" data-act="history" type="button">Riwayat</button>${u.role === "admin" ? `<button class="clay-btn ghost" data-act="admin" type="button">Admin</button>` : ""}</div>`;
    const banner = pending ? `<div class="raka-card raka-banner"><p><b>Akunmu menunggu persetujuan admin.</b> Selama itu RAKA menjawab dari data K-Pedia dan tetap bisa membukakan menu, tarif, dan peta. Jawaban AI penuh aktif setelah akun disetujui.</p><div class="raka-tools"><button class="clay-btn ghost" data-act="refresh" type="button">Periksa status</button></div></div>` : "";
    const hist = S.showHistory ? `<div class="raka-card"><h2>Riwayat percakapan</h2><div class="raka-list">${S.history.length ? S.history.map(h => `<div class="raka-item"><div><strong>${esc(h.title)}</strong><small>${new Date(h.updated_at * 1000).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</small></div><div class="acts"><button class="go" data-act="open" data-id="${esc(h.id)}" type="button">Buka</button><button class="bad" data-act="del" data-id="${esc(h.id)}" type="button">Hapus</button></div></div>`).join("") : "<p>Belum ada percakapan.</p>"}</div></div>` : "";
    const first = String(u.name || "").trim().split(/\s+/)[0];
    const empty = `<div class="raka-empty"><span class="raka-avatar" aria-hidden="true">${ic("train")}</span><h2>${first ? "Hai, " + esc(first) + "! " : ""}Mau cari apa?</h2><p>Tanya apa saja soal kereta api. Aku juga bisa membukakan menu, mencarikan tarif, dan menunjukkan stasiun di peta. Kalau datanya belum ada di K-Pedia, aku carikan di internet.</p><div class="suggest-row">${SUGGEST.map(s => `<button type="button" data-act="suggest" data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div></div>`;
    return `<div class="raka-wrap">${head(tools)}${banner}${hist}
      <div class="raka-msgs" id="rakaMsgs" aria-live="polite">${S.msgs.length ? S.msgs.map(msgHTML).join("") : empty}</div>
      <form class="raka-composer" data-form="ask"><textarea id="rakaInput" rows="1" maxlength="1000" placeholder="Tanya atau minta apa saja…" aria-label="Pesan untuk RAKA"></textarea><button class="clay-btn primary" type="submit" ${S.busy ? "disabled" : ""}>Kirim</button></form>
      <p class="raka-note">RAKA bukan layanan resmi KAI dan bisa keliru. Tarif dan aturan dapat berubah; pastikan ke KAI 121 atau Access by KAI.</p></div>`;
  }

  /* ---------- Panel admin ---------- */
  const ADMIN_TABS = [["users", "Pengguna"], ["cand", "Kandidat internet"], ["kb", "Pengetahuan"], ["set", "Pengaturan"]];
  function viewAdmin() {
    const d = S.adminData, t = S.adminTab;
    let body = `<p>Memuat…</p>`;
    if (d) {
      if (t === "users") body = `<div class="raka-list">${d.users.length ? d.users.map(u => `<div class="raka-item"><div><strong>${esc(u.name)}</strong><small>${esc(u.email)} · ${esc(u.status)}${u.role === "admin" ? " · admin" : ""}</small></div><div class="acts">${u.role === "admin" ? "" : u.status === "pending" ? `<button class="go" data-act="ua" data-a="approve" data-id="${u.id}" type="button">Setujui</button><button class="bad" data-act="ua" data-a="reject" data-id="${u.id}" type="button">Tolak</button>` : u.status === "active" ? `<button class="bad" data-act="ua" data-a="suspend" data-id="${u.id}" type="button">Tangguhkan</button>` : `<button data-act="ua" data-a="reactivate" data-id="${u.id}" type="button">Aktifkan</button>`}</div></div>`).join("") : "<p>Belum ada pengguna.</p>"}</div>`;
      if (t === "cand") body = `<p>Jawaban dari internet yang menunggu keputusan Anda. “Tambahkan” memasukkannya ke pengetahuan RAKA; “Lewati” membuangnya.</p><div class="raka-list">${d.cand.length ? d.cand.map(c => `<div class="raka-item" style="align-items:flex-start;flex-wrap:wrap"><div><strong>${esc(c.topic)}</strong><small>${esc(clip(c.answer, 420))}</small><div class="raka-src" style="margin-top:6px">${c.sources.map(s => `<a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`).join("")}</div></div><div class="acts"><button class="go" data-act="ca" data-a="approve" data-id="${c.id}" type="button">Tambahkan</button><button class="bad" data-act="ca" data-a="reject" data-id="${c.id}" type="button">Lewati</button></div></div>`).join("") : "<p>Tidak ada kandidat.</p>"}</div>`;
      if (t === "kb") {
        const kb = window.KP_KB, n = kb?.entries.length || 0, sid = window.KP_CONTENT?.raka?.sheetId;
        body = `<div class="raka-card" style="padding:14px;box-shadow:none"><h2>Spreadsheet pengetahuan</h2><p>${sid ? (kb?.error ? `Gagal membaca: ${esc(kb.error)}. Pastikan sheet dibagikan “Siapa saja yang memiliki link: Pelihat” dan tab bernama RAKA_DATA.` : `Terbaca ${n} entri.`) : "Belum tersambung. Isi <code>raka.sheetId</code> di content.js. Kolom: JUDUL, ISI, TIPE (teks/link/gambar/sheet/doc), URL, KATA_KUNCI, TAB, AKTIF."}</p>${sid ? `<div class="raka-tools"><button class="clay-btn ghost" data-act="kbreload" type="button">Muat ulang spreadsheet</button></div>` : ""}</div>
        <form data-form="kb" class="raka-card" style="padding:0;box-shadow:none;background:none"><label>Tambah catatan cepat — judul<input name="title" maxlength="120" required></label><label>Isi (teks)<textarea name="content" maxlength="6000" required></textarea></label><label>Sumber (opsional)<input name="source" maxlength="300"></label><button class="clay-btn primary" type="submit">Simpan pengetahuan</button><p class="raka-msg" id="rakaMsg" aria-live="polite"></p></form><div class="raka-list">${d.kb.map(k => `<div class="raka-item"><div><strong>${esc(k.title)}</strong><small>${esc(k.origin === "web" ? "dari internet" : "admin")} · ${esc(k.status)} · ${esc(clip(k.content, 100))}</small></div><div class="acts"><button class="bad" data-act="kdel" data-id="${k.id}" type="button">Hapus</button></div></div>`).join("")}</div>`;
      }
      if (t === "set") { const s = d.set; body = `<div class="raka-list">${[["ai_enabled", "RAKA / AI aktif"], ["registration_enabled", "Pendaftaran dibuka"], ["raka_web_enabled", "Cari di internet bila data lokal tidak ada"]].map(([k, l]) => `<label class="raka-switch"><span>${l}</span><input type="checkbox" data-act="toggle" data-k="${k}" ${s[k] === "true" ? "checked" : ""}></label>`).join("")}</div>
        <form data-form="domains" class="raka-card" style="padding:0;box-shadow:none;background:none"><label>Domain sumber utama, diprioritaskan bila ada (pisahkan koma)<input name="domains" value="${esc(s.trusted_domains)}"></label><button class="clay-btn primary" type="submit">Simpan domain</button><p class="raka-msg" id="rakaMsg" aria-live="polite"></p></form>`; }
    }
    return `<div class="raka-wrap">${head(`<div class="raka-tools"><button class="clay-btn ghost" data-act="back" type="button">Kembali ke chat</button></div>`)}
      <div class="raka-card"><h2>Panel admin</h2><div class="raka-tabs">${ADMIN_TABS.map(([k, l]) => `<button type="button" data-act="atab" data-v="${k}" class="${k === t ? "active" : ""}">${l}</button>`).join("")}</div>${body}</div></div>`;
  }
  async function loadAdmin() {
    try {
      const [u, c, k, s] = await Promise.all([api("GET", "/api/admin/users"), api("GET", "/api/admin/candidates"), api("GET", "/api/admin/knowledge"), api("GET", "/api/admin/settings")]);
      S.adminData = { users: u.users, cand: c.items, kb: k.items, set: s.settings };
    } catch (e) { toast(e.message, "error"); }
    if (S.admin) render();
  }

  /* ================= Render & aksi ================= */
  function render() {
    if (!root) return;
    if (!A.user) { root.innerHTML = `<div class="raka-wrap">${head()}<div class="raka-card"><p>Silakan masuk dulu untuk memakai RAKA.</p></div></div>`; return; }
    root.innerHTML = S.admin && A.isAdmin ? viewAdmin() : viewChat();
    if (S.msgs.length && !S.admin) window.scrollTo({ top: document.body.scrollHeight, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  const say = (t, ok) => { const el = $("#rakaMsg", root); if (el) { el.textContent = t; el.classList.toggle("ok", !!ok); } };

  async function ask(q) {
    q = String(q || "").trim(); if (!q || S.busy) return;
    S.busy = true; S.msgs.push({ role: "user", text: q }); S.msgs.push({ role: "bot", loading: true }); render();
    const slot = S.msgs.length - 1;
    if (window.KP_KB && !window.KP_KB.ready) await Promise.race([window.KP_KB.load(), new Promise(r => setTimeout(r, 2500))]);
    const ctx = localContext(q), media = mediaFor(q);
    let result;
    try {
      if (!A.isActive) throw Object.assign(new Error("pending"), { pending: true });
      const r = await api("POST", "/api/raka/ask", {
        message: q, conversation_id: S.convId || undefined, local_context: ctx,
        client: {
          page: APP()?.currentPage?.() || "raka", style: "luwes", allow_web: true,
          actions: ["halaman", "tarif", "stasiun", "peta", "kereta", "wiki", "link", "tema"],
          pages: (APP()?.pages || []).filter(p => p !== "raka"),
          stations: stationInfos(normQ(q), 2).map(s => s.nama)
        }
      });
      S.convId = r.conversation_id;
      const acts = [], parts = (r.parts || []).map(p => { const x = extractMarkers(p.text); acts.push(...x.acts); return { ...p, text: x.clean }; }).filter(p => p.text);
      const all = [...acts, ...detectActions(q, parts.map(p => p.text).join(" "))].filter((a, i, arr) => arr.findIndex(b => b.t === a.t && b.label === a.label) === i).slice(0, 5);
      result = { role: "bot", parts: parts.length ? parts : [{ origin: "plain", text: "Maaf, aku belum punya jawabannya." }], sources: r.sources, actions: all, media };
    } catch (e) {
      if (e.expired) { S.msgs.splice(slot, 1); S.busy = false; return; }
      result = { role: "bot", parts: localAnswer(q, ctx, e.pending ? "pending" : "offline"), sources: ctx.slice(0, 2).map(c => ({ label: c.source })), actions: detectActions(q), media };
    }
    S.msgs[slot] = result; S.busy = false; render(); $("#rakaInput", root)?.focus();
  }
  async function openConv(id) {
    try {
      const r = await api("GET", "/api/conversations/" + encodeURIComponent(id));
      S.convId = id; S.showHistory = false; let lastQ = "";
      S.msgs = r.messages.map(m => {
        if (m.role === "user") { lastQ = m.content; return { role: "user", text: m.content }; }
        const parts = (m.meta?.parts || [{ origin: "plain", text: m.content }]).map(p => ({ ...p, text: extractMarkers(p.text).clean }));
        return { role: "bot", parts, sources: m.meta?.sources || [], actions: detectActions(lastQ, parts.map(p => p.text).join(" ")), media: [] };
      });
      render();
    } catch (e) { toast(e.message, "error"); }
  }
  async function confirmDo(o) { return window.kpConfirm ? window.kpConfirm(o) : Promise.resolve(window.confirm(o.message)); }

  async function onSubmit(e) {
    const f = e.target.closest("[data-form]"); if (!f) return; e.preventDefault();
    const kind = f.dataset.form, fd = Object.fromEntries(new FormData(f));
    const btn = f.querySelector("button[type=submit]");
    try {
      if (kind === "ask") { const ta = $("#rakaInput", root); const q = ta.value; ta.value = ""; ta.style.height = "auto"; await ask(q); return; }
      btn && (btn.disabled = true);
      if (kind === "kb") { await api("POST", "/api/admin/knowledge", { title: fd.title, content: fd.content, source: fd.source }); toast("Pengetahuan disimpan", "success"); await loadAdmin(); }
      else if (kind === "domains") { await api("PUT", "/api/admin/settings", { trusted_domains: fd.domains }); toast("Domain disimpan", "success"); await loadAdmin(); }
    } catch (err) { say(err.message); toast(err.message, "error"); }
    finally { btn && (btn.disabled = false); }
  }

  async function onClick(e) {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const a = el.dataset.act, id = el.dataset.id;
    try {
      if (a === "do") runAction(S.msgs[Number(el.dataset.m)]?.actions?.[Number(el.dataset.i)]);
      else if (a === "refresh") { await A.me(); render(); if (!A.isActive) toast("Akun masih menunggu persetujuan."); else toast("Akunmu sudah aktif. RAKA siap membantu!", "success"); }
      else if (a === "new") { S.msgs = []; S.convId = null; S.showHistory = false; render(); }
      else if (a === "history") { S.showHistory = !S.showHistory; if (S.showHistory) { const r = await api("GET", "/api/conversations"); S.history = r.conversations; } render(); }
      else if (a === "open") await openConv(id);
      else if (a === "del") { if (await confirmDo({ title: "Hapus percakapan?", message: "Percakapan ini dihapus permanen.", tone: "danger", confirmText: "Hapus" })) { await api("DELETE", "/api/conversations/" + encodeURIComponent(id)); if (S.convId === id) { S.msgs = []; S.convId = null; } S.history = S.history.filter(h => h.id !== id); render(); } }
      else if (a === "suggest") await ask(el.dataset.q);
      else if (a === "admin") { S.admin = true; S.adminData = null; render(); loadAdmin(); }
      else if (a === "back") { S.admin = false; render(); }
      else if (a === "atab") { S.adminTab = el.dataset.v; render(); }
      else if (a === "kbreload") { toast("Memuat ulang spreadsheet…"); await window.KP_KB.load(true); render(); toast(window.KP_KB.error ? "Spreadsheet belum terbaca." : "Spreadsheet dimuat ulang.", window.KP_KB.error ? "error" : "success"); }
      else if (a === "ua") { await api("POST", `/api/admin/users/${id}/${el.dataset.a}`); toast("Tersimpan", "success"); await loadAdmin(); }
      else if (a === "ca") { await api("POST", `/api/admin/candidates/${id}/${el.dataset.a}`); toast(el.dataset.a === "approve" ? "Ditambahkan ke pengetahuan" : "Dilewati", "success"); await loadAdmin(); }
      else if (a === "kdel") { if (await confirmDo({ title: "Hapus pengetahuan?", message: "Data ini tidak akan dipakai RAKA lagi.", tone: "danger", confirmText: "Hapus" })) { await api("DELETE", "/api/admin/knowledge/" + id); await loadAdmin(); } }
    } catch (err) { if (!err.expired) { toast(err.message, "error"); say(err.message); } }
  }
  async function onChange(e) {
    const el = e.target.closest("[data-act=toggle]"); if (!el) return;
    const k = el.dataset.k, on = el.checked;
    if (k === "ai_enabled" && on && !(await confirmDo({ title: "Aktifkan RAKA?", message: "Pertanyaan pengguna akan memakai kuota token BangunWeb, dengan batas harian yang sudah diatur.", confirmText: "Aktifkan" }))) { el.checked = false; return; }
    try { await api("PUT", "/api/admin/settings", { [k]: on }); toast("Pengaturan disimpan", "success"); await loadAdmin(); }
    catch (err) { el.checked = !on; toast(err.message, "error"); }
  }
  function onKey(e) {
    const ta = e.target.closest?.("#rakaInput"); if (!ta) return;
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); ta.form.requestSubmit(); }
  }
  function onInput(e) { const ta = e.target.closest?.("#rakaInput"); if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 140) + "px"; } }

  /* Tombol melayang "Tanya RAKA" di semua halaman, kecuali halaman RAKA dan layar login. */
  function ensureFab() {
    if (fab) return fab;
    fab = document.createElement("button");
    fab.id = "rakaFab"; fab.type = "button"; fab.className = "raka-fab"; fab.hidden = true;
    fab.setAttribute("aria-label", "Tanya RAKA");
    fab.innerHTML = `${ic("chat")}<span>Tanya RAKA</span>`;
    fab.addEventListener("click", () => APP()?.go("raka"));
    document.body.append(fab); return fab;
  }
  function onPage(page) { ensureFab().hidden = page === "raka" || page === "login"; }

  function open() {
    root = document.getElementById("rakaRoot"); if (!root) return;
    if (!root.dataset.ready) {
      root.dataset.ready = "1";
      root.addEventListener("click", onClick); root.addEventListener("submit", onSubmit); root.addEventListener("change", onChange);
      root.addEventListener("keydown", onKey); root.addEventListener("input", onInput);
    }
    window.KP_KB?.load();
    render();
  }
  function reset() { S.msgs = []; S.convId = null; S.admin = false; S.adminData = null; S.showHistory = false; S.history = []; if (root) root.innerHTML = ""; }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", ensureFab, { once: true }) : ensureFab();
  window.KP_RAKA = { open, reset, onPage, refreshUser: () => { if (root?.dataset.ready && $("#page-raka")?.classList.contains("active")) render(); }, localContext, detectActions };
})();
