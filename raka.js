/* K-Pedia — RAKA (Railway Assistant KAI)
   Modul terpisah. Memakai akun tunggal K-Pedia (window.KP_AUTH); dipanggil lewat window.KP_RAKA.open().
   Alur: pertanyaan -> cari di data lokal di browser (ensiklopedia, FAQ, stasiun, tarif, panduan)
   -> Worker + AI menjawab. Pertanyaan sulit dijawab dengan mode teliti (rencana, cari, baca sumber, bandingkan).
   Jawaban ditutup "Sudah sesuai?": Sesuai -> jawaban dari internet masuk database lokal (belum diverifikasi admin);
   Kurang sesuai -> RAKA mengajak diskusi / mencari sumber lain.
   Lampiran: foto (dikecilkan di browser), PDF, DOCX, dan berkas teks (dibaca di browser). */
"use strict";
(function () {
  const MAX_FILES = 3, MAX_BYTES = 8 * 1024 * 1024;
  const ACCEPT = "image/*,.pdf,.docx,.txt,.md,.csv,.tsv,.json";
  const SUGGEST = ["Cara pakai K-Pedia", "Berapa batas bagasi gratis?", "Cara membatalkan tiket", "Bantu tulis pesan ke KAI soal barang tertinggal"];
  const WEB_ORIGINS = ["local", "web", "mixed"];

  /* Adapter gambar: disiapkan, BELUM aktif. Mode "Teks + gambar" baru dibuka bila ada sumber gambar yang sah
     (database lokal, internet dengan lisensi jelas, atau API pembuat gambar yang sudah terintegrasi). Tanpa gambar, jawaban tetap teks. */
  const IMAGE_ADAPTER = { enabled: false, sources: ["db-lokal", "web-berlisensi", "image-api"], resolve: async () => null };
  const S = { msgs: [], convId: null, busy: false, showHistory: false, history: [], admin: false, adminTab: "users", adminData: null, files: [], prepping: 0, queue: null, refine: null, draft: "" };
  let root = null, waitTimer = 0;

  const $ = (s, p = document) => p.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = n => window.phIcon(n);
  const toast = (m, t = "info") => (window.kpToast ? window.kpToast(m, t) : null);
  const isHttps = u => /^https:\/\//i.test(u || "");
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const api = (m, p, b) => window.KP_AUTH.api(m, p, b);
  const me = () => window.KP_AUTH.user;

  /* ---------- Perintah navigasi (tanpa AI, tanpa token) ---------- */
  const NAV = [
    [/\b(tarif|tarif khusus)\b/, "tarsus", "Tarif Khusus"],
    [/\b(peta|jalur)\b/, "peta", "Peta & Stasiun"],
    [/\bstasiun\b/, "stasiun", "Nama Stasiun"],
    [/\b(ensiklopedia|wiki)\b/, "wiki", "Ensiklopedia KAI"],
    [/\bfavorit\b/, "favorites", "Favorit"],
    [/\briwayat\b/, "history", "Riwayat Pencarian"],
    [/\b(pengaturan|setelan)\b/, "settings", "Pengaturan"],
    [/\bpanduan\b/, "guide", "Panduan Penggunaan"],
    [/\b(kritik|saran)\b/, "help", "Kritik dan Saran"],
    [/\b(beranda|home)\b/, "home", "Beranda"]
  ];
  function intent(text) {
    const t = String(text || "").toLowerCase().trim();
    if (!/^(tolong\s+)?(buka(kan)?|tampilkan|bawa( aku)? ke|pergi ke|ke halaman|menuju|lihat halaman|ke menu)\b/.test(t)) return null;
    for (const [re, page, label] of NAV) if (re.test(t)) return { page, label };
    return null;
  }
  const go = page => { try { window.navigate(page); } catch (_) {} };


  /* ---------- Pencarian data lokal (di browser) ---------- */
  const normQ = s => " " + String(s || "").toLocaleLowerCase("id-ID").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim() + " ";
  const clip = (t, n) => String(t || "").replace(/\s+\n/g, "\n").trim().slice(0, n);

  const GUIDE_RE = /(cara|gimana|bagaimana|panduan|fitur|menu).*(pakai|pake|menggunakan|k-?pedia|website|situs|aplikasi|raka)|\bk-?pedia\b|\bfitur\b|\braka\b|(apa saja|bisa apa).*(aplikasi|website|situs)/i;
  const APP_GUIDE = [
    { title: "Cara memakai K-Pedia: menu", source: "Panduan K-Pedia", text:
`- Beranda: kotak pencarian utama (ketik nama kereta, stasiun, istilah, atau menu; hasilnya langsung membuka halaman yang sesuai), kartu RAKA untuk ngobrol atau minta bantuan, tiga menu pintas, dan informasi terbaru.
- Tarif Khusus: cari tarif per rute (stasiun asal dan tujuan) atau per nama kereta, bandingkan dengan tarif normal untuk menghitung hematnya, lalu cek tiket di Access by KAI.
- Peta & Stasiun: peta jalur kereta api (butuh internet) dan daftar nama stasiun; buka satu stasiun untuk membaca ulasan, fasilitas, dan sejarahnya.
- Ensiklopedia KAI: pencarian manual tanpa AI untuk panduan pemesanan, pembatalan, aturan penumpang, kelas kereta, istilah, dan sejarah. Bisa mengetik dengan kalimat biasa.
- Favorit: menyimpan relasi penting supaya cepat ditemukan lagi. Riwayat Pencarian: pencarian tarif sebelumnya, tersimpan di perangkat ini.
- Pengaturan: mode warna (terang, gelap, ikuti perangkat) dan ukuran teks. Panduan Penggunaan menjelaskan menu; Kritik dan Saran untuk mengirim masukan ke pengembang.` },
    { title: "Cara memakai RAKA", source: "Panduan K-Pedia", text:
`- RAKA bisa menjawab pertanyaan soal kereta api: dicari dulu di data K-Pedia, kalau belum ada RAKA mencari di internet dan memberi tahu asalnya.
- Setelah menjawab, RAKA bertanya "Sudah sesuai?". Kalau sesuai, jawaban dari internet disimpan ke database K-Pedia. Kalau kurang sesuai, RAKA mengajak diskusi atau mencari sumber lain.
- RAKA juga bisa membantu menulis, merangkum, menjelaskan cara memakai K-Pedia, dan membaca foto atau dokumen (PDF, DOCX, teks) yang dilampirkan.
- Perintah singkat seperti "buka peta" atau "buka tarif khusus" langsung memberi tombol pintasan.
- RAKA butuh akun RAKA yang disetujui administrator (terpisah dari login petugas di K-Pedia).` }
  ];

  function wikiSection(entry, heading) {
    const body = String(entry.isi || entry.ISI || "");
    if (heading) {
      const hit = body.split(/^##\s+/m).slice(1).find(p => p.split("\n")[0].trim() === heading);
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
  function tariffContext(q) {
    const out = [], D = window.TARSUS_DATA; if (!D) return out;
    const text = normQ(q);
    try {
      const names = (D.stations() || []).map(s => s.namaStasiun).filter(n => n && n.length >= 4);
      const found = names.map(n => ({ n, i: text.indexOf(normQ(n)) })).filter(x => x.i >= 0).sort((a, b) => a.i - b.i);
      const uniq = [...new Map(found.map(x => [x.n.toLowerCase(), x.n])).values()];
      if (uniq.length >= 2) {
        let res = D.search(uniq[0], uniq[1]), dir = `${uniq[0]} ke ${uniq[1]}`;
        if (!res.length) { res = D.search(uniq[1], uniq[0]); dir = `${uniq[1]} ke ${uniq[0]}`; }
        if (res.length) out.push({
          title: `Tarif khusus ${dir}`,
          text: res.slice(0, 6).map(r => `${r.namaKA}: ${fareText(r.main)}${r.totalTarif > 1 ? ` (${r.totalTarif} relasi tarif tercatat)` : ""}`).join("\n") + "\nTarif dapat berubah; cek ketersediaan di Access by KAI.",
          source: "Database Tarif Khusus K-Pedia"
        });
      }
      (D.trains() || []).filter(t => t.namaKA && text.includes(normQ(t.namaKA))).slice(0, 2).forEach(t => {
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
  function stationContext(q) {
    const text = normQ(q), out = [];
    (window.KP_STATIONS || []).forEach(s => {
      if (out.length >= 2) return;
      if ([s.nama, ...(s.alias || [])].some(n => n && n.length >= 4 && text.includes(normQ(n)))) {
        const lines = [`Kategori: ${s.kategori || "-"}`, `Wilayah: ${[s.region, s.kota, s.provinsi].filter(Boolean).join(", ")}`, s.elevasi ? `Elevasi: ${s.elevasi} m` : "", s.periode ? `Periode: ${s.periode}` : "",
          s.ulasan, s.deskripsi, s.sejarah ? "Sejarah: " + s.sejarah : "", s.fasilitas ? "Fasilitas: " + (Array.isArray(s.fasilitas) ? s.fasilitas.join(", ") : s.fasilitas) : ""].filter(Boolean);
        out.push({ title: "Stasiun " + s.nama, text: clip(lines.join("\n"), 1300), source: "Informasi Stasiun K-Pedia" });
      }
    });
    return out;
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
  const guideContext = q => (GUIDE_RE.test(q) ? APP_GUIDE.map(g => ({ ...g })) : []);
  const localContext = q => [...guideContext(q), ...tariffContext(q), ...stationContext(q), ...wikiContext(q)].slice(0, 6);


  /* ---------- Lampiran: foto, PDF, DOCX, teks ---------- */
  async function shrinkImage(file) {
    let bmp;
    try { bmp = await createImageBitmap(file); } catch (_) { throw new Error(`${file.name}: formatnya belum bisa dibaca browser. Coba foto JPG atau PNG ya.`); }
    let max = 1280, q = 0.72, url = "";
    for (let i = 0; i < 4; i++) {
      const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
      const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
      url = c.toDataURL("image/jpeg", q);
      if (url.length <= 850000) break;
      max = Math.round(max * 0.75); q = Math.max(0.5, q - 0.08);
    }
    bmp.close?.();
    if (url.length > 850000) throw new Error(`${file.name}: fotonya terlalu besar, coba yang lebih kecil ya.`);
    return url;
  }
  const base = () => document.baseURI;
  async function pdfText(file) {
    let pdfjs;
    try {
      pdfjs = await import(new URL("vendor/pdf.min.mjs", base()).href);
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("vendor/pdf.worker.min.mjs", base()).href;
    } catch (_) { throw new Error("Browsermu belum bisa membaca PDF. Coba kirim sebagai foto atau teks ya."); }
    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    let out = "";
    for (let i = 1; i <= Math.min(doc.numPages, 15) && out.length < 12000; i++) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      out += `\n[Halaman ${i}]\n` + tc.items.map(x => x.str).join(" ");
    }
    out = out.replace(/[ \t]+/g, " ").trim();
    if (out.replace(/\[Halaman \d+\]/g, "").trim().length < 20) throw new Error(`${file.name}: PDF ini sepertinya hasil scan (tidak ada teks). Coba kirim sebagai foto ya.`);
    return out.slice(0, 12000);
  }
  function loadScript(src) {
    return new Promise((ok, bad) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => bad(new Error("gagal memuat " + src)); document.head.append(s); });
  }
  async function docxText(file) {
    try { if (!window.JSZip) await loadScript(new URL("vendor/jszip.min.js", base()).href); } catch (_) { throw new Error("Browsermu belum bisa membaca DOCX. Coba simpan sebagai PDF atau teks ya."); }
    let zip;
    try { zip = await window.JSZip.loadAsync(await file.arrayBuffer()); } catch (_) { throw new Error(`${file.name}: berkas DOCX-nya tidak bisa dibuka.`); }
    const xml = await zip.file("word/document.xml")?.async("string");
    if (!xml) throw new Error(`${file.name}: isi DOCX tidak ditemukan.`);
    const dom = new DOMParser().parseFromString(xml, "application/xml");
    const out = [...dom.getElementsByTagName("w:p")].map(p => [...p.getElementsByTagName("w:t")].map(t => t.textContent).join("")).filter(Boolean).join("\n");
    if (!out.trim()) throw new Error(`${file.name}: dokumennya kosong atau isinya berupa gambar.`);
    return out.slice(0, 12000);
  }
  async function prepFile(file) {
    const name = file.name || "lampiran", ext = name.split(".").pop().toLowerCase();
    if (file.size > MAX_BYTES) throw new Error(`${name} terlalu besar (maksimal 8 MB).`);
    if (file.type.startsWith("image/")) return { kind: "image", name, data_url: await shrinkImage(file) };
    if (ext === "pdf") return { kind: "text", name, text: await pdfText(file) };
    if (ext === "docx") return { kind: "text", name, text: await docxText(file) };
    if (["txt", "md", "csv", "tsv", "json"].includes(ext) || file.type.startsWith("text/")) {
      const t = (await file.text()).trim(); if (!t) throw new Error(`${name} kosong.`);
      return { kind: "text", name, text: t.slice(0, 12000) };
    }
    throw new Error(`Format ${name} belum didukung. Coba foto, PDF, DOCX, atau berkas teks ya.`);
  }
  async function addFiles(list, store, after) {
    const files = [...list];
    for (const f of files) {
      if (store.length >= MAX_FILES) { toast(`Maksimal ${MAX_FILES} lampiran sekali kirim ya.`, "error"); break; }
      const item = { name: f.name, loading: true }; store.push(item); S.prepping++; after();
      try { item.data = await prepFile(f); item.loading = false; }
      catch (e) { store.splice(store.indexOf(item), 1); toast(e.message, "error"); }
      S.prepping--; after();
    }
  }


  /* ---------- Tampilan teks ---------- */
  const inline = s => s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
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
  const TAGS = { local: ["local", "Dari data K-Pedia"], web: ["web", "Dari internet"], mixed: ["web", "Data K-Pedia + internet"], none: ["none", "Belum ditemukan"], assist: ["assist", "Bantuan RAKA"], ask: ["assist", "RAKA bertanya"] };
  function botHTML(m, i, last) {
    if (m.loading) return `<div class="raka-row bot"><div class="raka-bubble raka-loading" aria-live="polite"><span class="raka-dots" aria-label="RAKA sedang mencari"><i></i><i></i><i></i></span><span class="raka-wait" id="rakaWait">RAKA sedang mencari…</span></div></div>`;
    if (m.error) return `<div class="raka-row bot"><div class="raka-bubble"><p class="raka-err">${esc(m.error)}</p></div></div>`;
    const parts = (m.parts || []).map(p => {
      const tag = TAGS[p.origin];
      return `<div class="raka-part">${tag ? `<span class="raka-tag ${tag[0]}">${tag[1]}</span>` : ""}${fmt(p.text)}</div>`;
    }).join("");
    const src = (m.sources || []).map(s => isHttps(s.url) ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${s.n ? `<b>${s.n}</b> ` : ""}${esc(s.title)}</a>` : `<span>${esc(s.label || s.title)}</span>`).join("");
    const steps = (m.steps || []).length ? `<details class="raka-steps"><summary>Langkah RAKA<span>${m.steps.length} langkah</span></summary><ol>${m.steps.map(x => `<li>${esc(x)}</li>`).join("")}</ol></details>` : "";
    const acts = (m.actions || []).map(a => `<button type="button" class="raka-pill go" data-act="goto" data-page="${esc(a.page)}">${esc(a.label)}</button>`).join("");
    const fb = last && m.canFeedback && !m.feedback && m.id ? `<div class="raka-fb"><span>Sudah sesuai?</span><button type="button" class="raka-pill go" data-act="fb" data-v="sesuai" data-i="${i}" ${m.fbBusy ? "disabled" : ""}>Sesuai</button><button type="button" class="raka-pill" data-act="fb" data-v="kurang" data-i="${i}" ${m.fbBusy ? "disabled" : ""}>Kurang sesuai</button></div>` : "";
    const fu = last && m.followup ? `<div class="raka-fb"><button type="button" class="raka-pill go" data-act="again" data-i="${i}">Cari sumber lain</button><button type="button" class="raka-pill" data-act="explain" data-i="${i}">Aku jelasin dulu</button></div>` : "";
    return `<div class="raka-row bot"><div class="raka-bubble">${steps}${parts}${src ? `<div class="raka-src">${src}</div>` : ""}${acts ? `<div class="raka-fb">${acts}</div>` : ""}${fb}${fu}</div></div>`;
  }
  const userHTML = m => `<div class="raka-row user"><div class="raka-bubble"><p>${esc(m.text)}</p>${(m.files || []).length ? `<div class="raka-src">${m.files.map(f => `<span>${esc(f)}</span>`).join("")}</div>` : ""}</div></div>`;
  const msgHTML = (m, i, n) => (m.role === "user" ? userHTML(m) : botHTML(m, i, i === n - 1));


  /* ---------- Layar ---------- */
  function head(extra = "") {
    return `<div class="raka-head"><div class="raka-title"><span class="raka-avatar" aria-hidden="true">${ic("train")}</span><div><strong>RAKA</strong><small>Railway Assistant KAI</small></div></div>${extra}</div>`;
  }
  function composerHTML() {
    const chips = S.files.map((f, i) => `<span class="raka-chip ${f.loading ? "loading" : ""}">${esc(f.name)}${f.loading ? " · membaca…" : ""}<button type="button" data-act="rmfile" data-i="${i}" aria-label="Hapus lampiran ${esc(f.name)}">×</button></span>`).join("");
    const modeBar = `<div class="raka-mode" role="group" aria-label="Mode jawaban"><span>Mode jawaban</span><button type="button" class="rm-opt on" aria-pressed="true">Teks saja <em>Direkomendasikan</em></button><button type="button" class="rm-opt" disabled aria-disabled="true" title="Belum aktif: butuh sumber gambar yang sah (database lokal, internet legal, atau API pembuat gambar)">Teks + gambar <em class="soon">Segera</em></button></div>`;
    return `<form class="raka-composer" data-form="ask">${modeBar}${chips ? `<div class="raka-files">${chips}</div>` : ""}
      <div class="raka-compose-row"><button type="button" class="icon-btn" data-act="attach" aria-label="Lampirkan foto atau dokumen">${ic("clip")}</button>
      <textarea id="rakaInput" rows="1" maxlength="1000" placeholder="${S.refine ? "Ceritakan bagian yang kurang pas…" : "Tanya apa saja, atau minta bantuan…"}" aria-label="Pesan untuk RAKA"></textarea>
      <button class="btn primary" type="submit" ${S.busy || S.prepping ? "disabled" : ""}>Kirim</button></div>
      <input id="rakaFile" type="file" hidden multiple accept="${ACCEPT}"></form>`;
  }
  function viewChat() {
    const tools = `<div class="raka-tools"><button class="btn ghost" data-act="new" type="button">Obrolan baru</button><button class="btn ghost" data-act="history" type="button">Riwayat</button>${me().role === "admin" ? `<button class="btn ghost" data-act="admin" type="button">Admin</button>` : ""}</div>`;
    const hist = S.showHistory ? `<div class="raka-card"><h2>Riwayat obrolan</h2><div class="raka-list">${S.history.length ? S.history.map(h => `<div class="raka-item"><div><strong>${esc(h.title)}</strong><small>${new Date(h.updated_at * 1000).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</small></div><div class="acts"><button class="go" data-act="open" data-id="${esc(h.id)}" type="button">Buka</button><button class="bad" data-act="del" data-id="${esc(h.id)}" type="button">Hapus</button></div></div>`).join("") : "<p>Belum ada obrolan.</p>"}</div></div>` : "";
    const empty = `<div class="raka-empty"><span class="raka-avatar lg" aria-hidden="true">${ic("train")}</span><h2>Halo, aku RAKA</h2><p>Tanya soal kereta api, minta dibantu menulis, atau kirim foto dan dokumen biar kubaca. Aku cari di data K-Pedia dulu; kalau belum ada, aku cari ke internet dan kuberi tahu sumbernya.</p><div class="suggest-row">${SUGGEST.map(s => `<button type="button" data-act="suggest" data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div></div>`;
    return `<div class="raka-wrap">${head(tools)}${hist}
      <div class="raka-msgs" id="rakaMsgs" aria-live="polite">${S.msgs.length ? S.msgs.map((m, i) => msgHTML(m, i, S.msgs.length)).join("") : empty}</div>
      ${composerHTML()}
      <p class="raka-note">RAKA bukan layanan resmi KAI dan bisa keliru. Tarif dan aturan dapat berubah, jadi pastikan ke KAI 121 atau Access by KAI.</p></div>`;
  }

  /* ---------- Panel admin ---------- */
  const ADMIN_TABS = [["users", "Pengguna"], ["kb", "Pengetahuan"], ["set", "Pengaturan"]];
  function viewAdmin() {
    const d = S.adminData, t = S.adminTab;
    let body = `<p>Memuat…</p>`;
    if (d) {
      if (t === "users") body = `<div class="raka-list">${d.users.length ? d.users.map(u => `<div class="raka-item"><div><strong>${esc(u.name)}</strong><small>${esc(u.email)} · ${esc(u.status)}${u.role === "admin" ? " · admin" : ""}</small></div><div class="acts">${u.role === "admin" ? "" : u.status === "pending" ? `<button class="go" data-act="ua" data-a="approve" data-id="${u.id}" type="button">Setujui</button><button class="bad" data-act="ua" data-a="reject" data-id="${u.id}" type="button">Tolak</button>` : u.status === "active" ? `<button class="bad" data-act="ua" data-a="suspend" data-id="${u.id}" type="button">Tangguhkan</button>` : `<button data-act="ua" data-a="reactivate" data-id="${u.id}" type="button">Aktifkan</button>`}</div></div>`).join("") : "<p>Belum ada pengguna.</p>"}</div>`;
      if (t === "kb") body = `<p>Pengetahuan dari internet yang dikonfirmasi pengguna berstatus <b>belum diverifikasi</b> sampai Anda memeriksanya.</p>
        <form data-form="kb" class="raka-form"><label>Judul<input name="title" maxlength="120" required></label><label>Isi (teks)<textarea name="content" maxlength="6000" required></textarea></label><label>Sumber (opsional)<input name="source" maxlength="300"></label><button class="btn primary" type="submit">Simpan pengetahuan</button><p class="raka-msg" id="rakaMsg" aria-live="polite"></p></form>
        <div class="raka-list">${d.kb.map(k => `<div class="raka-item" style="align-items:flex-start"><div><strong>${esc(k.title)}</strong><small>${k.verified ? "terverifikasi" : "belum diverifikasi"} · ${esc(k.origin === "web_user" ? "dikonfirmasi pengguna" : k.origin === "web" ? "dari internet" : "admin")} · ${esc(k.status)}</small><small>${esc(clip(k.content, 160))}</small></div><div class="acts">${k.verified ? "" : `<button class="go" data-act="kver" data-id="${k.id}" type="button">Verifikasi</button>`}<button class="bad" data-act="kdel" data-id="${k.id}" type="button">Hapus</button></div></div>`).join("")}</div>`;
      if (t === "set") { const s = d.set; const sel = (k, opts) => `<select data-act="sel" data-k="${k}">${opts.map(([v, l]) => `<option value="${v}" ${s[k] === v ? "selected" : ""}>${l}</option>`).join("")}</select>`;
        body = `<div class="raka-list">${[["ai_enabled", "RAKA aktif"], ["registration_enabled", "Pendaftaran dibuka"], ["raka_web_enabled", "Cari di internet bila data lokal tidak ada"]].map(([k, l]) => `<label class="raka-switch"><span>${l}</span><input type="checkbox" data-act="toggle" data-k="${k}" ${s[k] === "true" ? "checked" : ""}></label>`).join("")}
        <label class="raka-switch"><span>Pencarian internet</span>${sel("raka_web_scope", [["open", "Seluruh web"], ["trusted", "Hanya domain tepercaya"]])}</label>
        <label class="raka-switch"><span>Ketelitian berpikir</span>${sel("raka_reasoning", [["fast", "Cepat saja"], ["auto", "Teliti otomatis"], ["always", "Selalu teliti"]])}</label></div>
        <form data-form="domains" class="raka-form"><label>Domain tepercaya (diutamakan di hasil; dibatasi bila mode tepercaya)<input name="domains" value="${esc(s.trusted_domains)}"></label><button class="btn primary" type="submit">Simpan domain</button><p class="raka-msg" id="rakaMsg" aria-live="polite"></p></form>
        <div class="raka-form"><label>Notifikasi email admin</label><div><button class="btn ghost" data-act="notify" type="button">Kirim email uji</button></div></div>`; }
    }
    return `<div class="raka-wrap">${head(`<div class="raka-tools"><button class="btn ghost" data-act="back" type="button">Kembali ke chat</button></div>`)}
      <div class="raka-card"><h2>Panel admin</h2><div class="raka-tabs">${ADMIN_TABS.map(([k, l]) => `<button type="button" data-act="atab" data-v="${k}" class="${k === t ? "active" : ""}">${l}</button>`).join("")}</div>${body}</div></div>`;
  }
  async function loadAdmin() {
    try {
      const [u, k, s] = await Promise.all([api("GET", "/api/admin/users"), api("GET", "/api/admin/knowledge"), api("GET", "/api/admin/settings")]);
      S.adminData = { users: u.users, kb: k.items, set: s.settings };
    } catch (e) { toast(e.message, "error"); }
    if (S.admin) render();
  }

  /* ---------- Render & aksi ---------- */
  function render() {
    if (!root || !me()) return;
    const prev = $("#rakaInput", root);
    if (prev) S.draft = prev.value;
    const hadFocus = prev && document.activeElement === prev;
    root.innerHTML = S.admin ? viewAdmin() : viewChat();
    const ta = $("#rakaInput", root);
    if (ta) { ta.value = S.draft || ""; if (S.draft) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 140) + "px"; } if (hadFocus) ta.focus(); }
    if ($("#rakaMsgs", root) && S.msgs.length) window.scrollTo({ top: document.body.scrollHeight, behavior: reduced() ? "auto" : "smooth" });
  }
  const say = (t, ok) => { const el = $("#rakaMsg", root); if (el) { el.textContent = t; el.classList.toggle("ok", !!ok); } };
  const urlsOf = list => (list || []).map(s => s.url).filter(isHttps);

  async function ask(q, opt = {}) {
    q = String(q || "").trim();
    if ((!q && !S.files.some(f => f.data)) || S.busy || S.prepping) return;
    if (!opt.silent && !S.files.length && !opt.forceWeb && !S.refine) {
      const it = intent(q);
      if (it) { S.msgs.push({ role: "user", text: q }, { role: "bot", parts: [{ origin: "assist", text: `Siap, aku bukakan ${it.label}.` }], actions: [{ page: it.page, label: `Buka ${it.label}` }] }); S.draft = ""; render(); return; }
    }
    const files = S.files.filter(f => f.data).map(f => f.data), names = S.files.map(f => f.name);
    const refine = S.refine; S.refine = null; S.draft = "";
    S.busy = true; if (!opt.silent) S.msgs.push({ role: "user", text: q || "Tolong baca lampiran ini", files: names });
    S.msgs.push({ role: "bot", loading: true }); S.files = []; render();
    clearTimeout(waitTimer);
    waitTimer = setTimeout(() => { const w = $("#rakaWait", root); if (w) w.textContent = "Pertanyaan ini perlu ditelusuri lebih teliti, sebentar ya…"; }, 4500);
    try {
      const body = { message: q || "Tolong baca lampiran ini", conversation_id: S.convId || undefined };
      if (opt.forceWeb) { body.force_web = true; body.exclude_urls = opt.exclude || []; }
      else if (refine) { body.refine_of = refine.of; body.exclude_urls = refine.exclude || []; }
      else body.local_context = localContext(q);
      if (files.length) body.attachments = files;
      const r = await api("POST", "/api/raka/ask", body);
      S.convId = r.conversation_id;
      const question = opt.forceWeb ? opt.q : refine ? refine.of : q;
      S.msgs[S.msgs.length - 1] = { role: "bot", parts: r.parts, sources: r.sources, steps: r.mode === "teliti" ? r.steps : [], id: r.message_id, q: question, canFeedback: r.can_feedback, exclude: [...(opt.exclude || []), ...(refine ? refine.exclude || [] : []), ...urlsOf(r.sources)] };
    } catch (e) { S.msgs[S.msgs.length - 1] = { role: "bot", error: e.message }; }
    clearTimeout(waitTimer);
    S.busy = false; render(); $("#rakaInput", root)?.focus();
  }
  async function feedback(i, verdict) {
    const m = S.msgs[i]; if (!m || m.feedback || m.fbBusy) return;
    m.fbBusy = true; render();
    try {
      const r = await api("POST", "/api/raka/feedback", { message_id: m.id, verdict });
      m.feedback = verdict;
      if (verdict === "sesuai") S.msgs.push({ role: "bot", parts: [{ origin: "assist", text: r.saved ? "Makasih sudah konfirmasi. Jawaban ini kusimpan ke database K-Pedia supaya bisa membantu pengguna lain; statusnya masih menunggu diperiksa admin." : "Makasih sudah konfirmasi." }] });
      else S.msgs.push({ role: "bot", parts: [{ origin: "assist", text: "Makasih sudah bilang. Berarti jawabanku belum pas. Mau kucarikan sumber lain, atau kamu jelaskan dulu bagian mana yang kurang?" }], followup: true, q: m.q, exclude: m.exclude || [] });
    } catch (e) { toast(e.message, "error"); }
    m.fbBusy = false; render();
  }
  async function openConv(id) {
    try {
      const r = await api("GET", "/api/conversations/" + encodeURIComponent(id));
      S.convId = id; S.showHistory = false; S.msgs = []; let lastUser = "";
      r.messages.forEach((m, i) => {
        if (m.role === "user") { lastUser = m.content; S.msgs.push({ role: "user", text: m.content }); return; }
        const meta = m.meta || {}, isLast = i === r.messages.length - 1;
        S.msgs.push({ role: "bot", parts: meta.parts || [{ origin: "plain", text: m.content }], sources: meta.sources || [], steps: meta.mode === "teliti" ? meta.steps || [] : [], id: m.id, q: lastUser, feedback: meta.feedback || null, canFeedback: isLast && WEB_ORIGINS.includes(meta.origin), exclude: urlsOf(meta.sources) });
      });
      render();
    } catch (e) { toast(e.message, "error"); }
  }
  const confirmDo = o => (window.kpConfirm ? window.kpConfirm(o) : Promise.resolve(window.confirm(o.message)));

  async function onSubmit(e) {
    const f = e.target.closest("[data-form]"); if (!f) return; e.preventDefault();
    const kind = f.dataset.form, fd = Object.fromEntries(new FormData(f));
    const btn = f.querySelector("button[type=submit]");
    try {
      if (kind === "ask") { const ta = $("#rakaInput", root); const q = ta.value; ta.value = ""; ta.style.height = "auto"; S.draft = ""; await ask(q); return; }
      btn && (btn.disabled = true);
      if (kind === "kb") { await api("POST", "/api/admin/knowledge", { title: fd.title, content: fd.content, source: fd.source }); toast("Pengetahuan disimpan", "success"); await loadAdmin(); }
      else if (kind === "domains") { await api("PUT", "/api/admin/settings", { trusted_domains: fd.domains }); toast("Domain disimpan", "success"); await loadAdmin(); }
    } catch (err) { say(err.message); toast(err.message, "error"); }
    finally { btn && (btn.disabled = false); }
  }
  async function onClick(e) {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const a = el.dataset.act, id = el.dataset.id, i = Number(el.dataset.i);
    try {
      if (a === "new") { S.msgs = []; S.convId = null; S.showHistory = false; S.refine = null; render(); }
      else if (a === "history") { S.showHistory = !S.showHistory; if (S.showHistory) { const r = await api("GET", "/api/conversations"); S.history = r.conversations; } render(); }
      else if (a === "open") await openConv(id);
      else if (a === "del") { if (await confirmDo({ title: "Hapus obrolan ini?", message: "Obrolannya dihapus permanen.", tone: "danger", confirmText: "Hapus" })) { await api("DELETE", "/api/conversations/" + encodeURIComponent(id)); if (S.convId === id) { S.msgs = []; S.convId = null; } S.history = S.history.filter(h => h.id !== id); render(); } }
      else if (a === "suggest") await ask(el.dataset.q);
      else if (a === "attach") $("#rakaFile", root)?.click();
      else if (a === "rmfile") { S.files.splice(i, 1); render(); }
      else if (a === "goto") go(el.dataset.page);
      else if (a === "fb") await feedback(i, el.dataset.v);
      else if (a === "again") { const m = S.msgs[i]; m.followup = false; await ask(m.q, { forceWeb: true, silent: true, q: m.q, exclude: m.exclude }); }
      else if (a === "explain") { const m = S.msgs[i]; m.followup = false; S.refine = { of: m.q, exclude: m.exclude || [] }; render(); $("#rakaInput", root)?.focus(); }
      else if (a === "admin") { S.admin = true; S.adminData = null; render(); loadAdmin(); }
      else if (a === "back") { S.admin = false; render(); }
      else if (a === "atab") { S.adminTab = el.dataset.v; render(); }
      else if (a === "ua") { await api("POST", `/api/admin/users/${id}/${el.dataset.a}`); toast("Tersimpan", "success"); await loadAdmin(); }
      else if (a === "kver") { await api("PUT", "/api/admin/knowledge/" + id, { verified: 1 }); toast("Terverifikasi", "success"); await loadAdmin(); }
      else if (a === "kdel") { if (await confirmDo({ title: "Hapus pengetahuan?", message: "Data ini tidak akan dipakai RAKA lagi.", tone: "danger", confirmText: "Hapus" })) { await api("DELETE", "/api/admin/knowledge/" + id); await loadAdmin(); } }
      else if (a === "notify") { el.disabled = true; try { await api("POST", "/api/admin/notify-test"); toast("Email uji terkirim. Periksa kotak masuk Anda.", "success"); } finally { el.disabled = false; } }
    } catch (err) { toast(err.message, "error"); say(err.message); }
  }
  async function onChange(e) {
    if (e.target.id === "rakaFile") { const list = e.target.files; await addFiles(list, S.files, render); e.target.value = ""; return; }
    const sel = e.target.closest("[data-act=sel]");
    if (sel) { try { await api("PUT", "/api/admin/settings", { [sel.dataset.k]: sel.value }); toast("Pengaturan disimpan", "success"); await loadAdmin(); } catch (err) { toast(err.message, "error"); } return; }
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

  function consumeQueue() {
    if (!S.queue || !me() || S.admin) return;
    const q = S.queue; S.queue = null; S.files = q.files || [];
    ask(q.text);
  }
  function open() {
    root = document.getElementById("rakaRoot"); if (!root) return;
    if (!root.dataset.ready) {
      root.dataset.ready = "1";
      root.addEventListener("click", onClick); root.addEventListener("submit", onSubmit); root.addEventListener("change", onChange);
      root.addEventListener("keydown", onKey); root.addEventListener("input", onInput);
    }
    render(); consumeQueue();
  }
  window.addEventListener("kp:auth", () => { S.msgs = []; S.convId = null; S.admin = false; S.files = []; S.refine = null; S.showHistory = false; });

  /* ---------- Kartu RAKA di Beranda ---------- */
  function initHome() {
    const form = document.getElementById("rakaHomeForm"); if (!form) return;
    const input = $("#rakaHomeInput"), fileIn = $("#rakaHomeFile"), box = $("#rakaHomeFiles");
    const H = { files: [] };
    const draw = () => {
      box.hidden = !H.files.length;
      box.innerHTML = H.files.map((f, i) => `<span class="raka-chip ${f.loading ? "loading" : ""}">${esc(f.name)}${f.loading ? " · membaca…" : ""}<button type="button" data-hrm="${i}" aria-label="Hapus lampiran ${esc(f.name)}">×</button></span>`).join("");
    };
    const send = text => {
      text = String(text || "").trim();
      if (!text && !H.files.some(f => f.data)) { input.focus(); return; }
      if (S.prepping) { toast("Tunggu sebentar, lampirannya masih dibaca.", "info"); return; }
      const it = !H.files.length ? intent(text) : null;
      if (it) { input.value = ""; go(it.page); return; }
      S.queue = { text: text || "Tolong baca lampiran ini", files: H.files.filter(f => f.data) };
      H.files = []; draw(); input.value = "";
      go("raka");
    };
    form.addEventListener("submit", e => { e.preventDefault(); send(input.value); });
    box.addEventListener("click", e => { const b = e.target.closest("[data-hrm]"); if (b) { H.files.splice(Number(b.dataset.hrm), 1); draw(); } });
    $("#rakaHomeAttach").addEventListener("click", () => fileIn.click());
    fileIn.addEventListener("change", async () => { const l = fileIn.files; await addFiles(l, H.files, draw); fileIn.value = ""; });
    document.querySelectorAll("[data-raka-q]").forEach(b => b.addEventListener("click", () => send(b.dataset.rakaQ)));
    document.querySelector("[data-raka-attach]")?.addEventListener("click", () => fileIn.click());
  }

  window.KP_RAKA = { open, localContext, intent };
  initHome();
})();
