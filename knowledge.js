/* K-Pedia 6.6 — Basis pengetahuan RAKA dari SATU spreadsheet.
   Cara pakai: buat Google Sheets, bagikan "Siapa saja yang memiliki link: Pelihat", isi ID-nya di
   content.js (raka.sheetId). Sheet utama bernama RAKA_DATA dengan kolom:

     JUDUL | ISI | TIPE | URL | KATA_KUNCI | TAB | AKTIF

   TIPE (boleh kosong = teks):
     teks    ISI dibaca RAKA sebagai pengetahuan.
     link    URL halaman / file (PDF, Drive, dll). ISI = deskripsi singkat. RAKA menampilkan tombol buka.
     gambar  URL gambar. ISI = keterangan gambar (RAKA membaca keterangannya, lalu menampilkan gambarnya).
     sheet   URL spreadsheet lain (TAB = nama tab, boleh kosong). Semua barisnya dibaca sebagai pengetahuan.
     doc     URL Google Docs (dibagikan publik). Teksnya dibaca RAKA.
   AKTIF: isi Tidak untuk menonaktifkan baris. Perubahan di sheet muncul otomatis (cache 10 menit). */
"use strict";
(function () {
  const TTL = 10 * 60 * 1000, MAX_ROWS = 400, MAX_TEXT = 6000;
  const CK = id => "kp-raka-kb:" + id;

  const STOP = new Set(("yang dan di ke dari untuk dengan atau pada adalah itu ini saya aku kamu anda apa siapa kapan dimana mana bagaimana gimana kenapa mengapa berapa " +
    "bisa boleh ada tidak ga gak nggak tolong mohon dong deh ya sih kah nya kereta api kai tentang soal info informasi cara apakah saja lagi juga akan sudah belum mau ingin tahu").split(" "));
  const tok = s => String(s || "").toLocaleLowerCase("id-ID").replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
  const stem = w => w.replace(/(nya|kan|lah|kah|an|i)$/, "");

  function parseCSV(text) {
    const rows = []; let row = [], cur = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; }
      else cur += c;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(r => r.some(x => String(x).trim() !== ""));
  }
  function toObjects(csv) {
    const rows = parseCSV(csv); if (!rows.length) return [];
    const head = rows[0].map(h => String(h).trim().toUpperCase().replace(/\s+/g, "_"));
    return rows.slice(1).map(r => Object.fromEntries(head.map((h, i) => [h, String(r[i] ?? "").trim()])));
  }
  const sheetIdOf = u => (/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/.exec(u || "") || [])[1] || (/^[a-zA-Z0-9_-]{25,}$/.test(u || "") ? u : "");
  const docIdOf = u => (/\/document\/d\/([a-zA-Z0-9_-]+)/.exec(u || "") || [])[1] || "";
  const isOff = v => /^(tidak|no|false|0|nonaktif)$/i.test(String(v || "").trim());
  const httpsOnly = u => (/^https:\/\//i.test(u || "") ? u : "");

  async function getText(url, key) {
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 12000);
      let res; try { res = await fetch(url, { cache: "no-store", signal: ctl.signal }); } finally { clearTimeout(t); }
      if (!res.ok) throw new Error("HTTP " + res.status);
      const txt = await res.text();
      if (/<html[\s>]/i.test(txt) && /<body[\s>]/i.test(txt)) throw new Error("tidak dapat dibaca (izin akses)");
      try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), txt })); } catch (_) {}
      return txt;
    } catch (e) {
      try { const s = JSON.parse(localStorage.getItem(key) || "null"); if (s?.txt) return s.txt; } catch (_) {}
      throw e;
    }
  }
  function fresh(key) { try { const s = JSON.parse(localStorage.getItem(key) || "null"); return s && Date.now() - s.t < TTL ? s.txt : null; } catch (_) { return null; } }
  async function sheetCSV(id, tab) {
    const key = "kp-raka-csv:" + id + ":" + (tab || "");
    return fresh(key) ?? getText(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv${tab ? "&sheet=" + encodeURIComponent(tab) : ""}`, key);
  }
  async function docText(id) {
    const key = "kp-raka-doc:" + id;
    return fresh(key) ?? getText(`https://docs.google.com/document/d/${id}/export?format=txt`, key);
  }

  const KB = { entries: [], ready: false, loading: null, error: null, at: 0 };

  const mk = o => {
    const e = { title: o.title || "", text: String(o.text || "").slice(0, MAX_TEXT), type: o.type || "teks", url: httpsOnly(o.url), keys: o.keys || "", source: o.source || "Basis data RAKA" };
    e._t = new Set(tok(e.title).map(stem)); e._k = new Set(tok(e.keys).map(stem)); e._b = new Set(tok(e.text).map(stem));
    return e;
  };

  async function expandRow(r, out) {
    const type = (r.TIPE || "teks").toLowerCase(), title = r.JUDUL || "", url = r.URL || "";
    if (type === "sheet") {
      const id = sheetIdOf(url); if (!id) return;
      const rows = toObjects(await sheetCSV(id, r.TAB || "")).slice(0, MAX_ROWS);
      rows.forEach(o => {
        const vals = Object.entries(o).filter(([, v]) => v); if (!vals.length) return;
        out.push(mk({ title: title + (vals[0] ? " — " + vals[0][1].slice(0, 60) : ""), text: vals.map(([k, v]) => `${k.replace(/_/g, " ").toLowerCase()}: ${v}`).join("; "), keys: r.KATA_KUNCI, source: "Spreadsheet: " + (title || "data tambahan") }));
      });
    } else if (type === "doc") {
      const id = docIdOf(url); if (!id) return;
      out.push(mk({ title, text: await docText(id), keys: r.KATA_KUNCI, url, source: "Dokumen: " + title }));
    } else if (type === "gambar") {
      out.push(mk({ title, text: r.ISI || title, type: "gambar", url, keys: r.KATA_KUNCI }));
    } else if (type === "link" || type === "file") {
      out.push(mk({ title, text: r.ISI || title, type: "link", url, keys: r.KATA_KUNCI }));
    } else out.push(mk({ title, text: r.ISI, keys: r.KATA_KUNCI, url }));
  }

  async function load(force) {
    const cfg = window.KP_CONTENT?.raka || {}, id = sheetIdOf(cfg.sheetId);
    if (!id) { KB.entries = []; KB.ready = true; return KB; }
    if (KB.loading && !force) return KB.loading;
    KB.loading = (async () => {
      try {
        const rows = toObjects(await sheetCSV(id, cfg.tab || "RAKA_DATA")).filter(r => (r.JUDUL || r.ISI || r.URL) && !isOff(r.AKTIF));
        const out = [];
        await Promise.all(rows.map(r => expandRow(r, out).catch(e => console.warn("[RAKA] baris dilewati:", r.JUDUL, e.message))));
        KB.entries = out; KB.error = null; KB.at = Date.now();
      } catch (e) { KB.error = e.message; console.warn("[RAKA] spreadsheet pengetahuan tidak terbaca:", e.message); }
      KB.ready = true; KB.loading = null; return KB;
    })();
    return KB.loading;
  }

  /* Cari baris yang relevan. Judul dan kata kunci berbobot lebih besar daripada isi. */
  function query(q, limit = 3) {
    const qs = [...new Set(tok(q).map(stem))]; if (!qs.length || !KB.entries.length) return [];
    return KB.entries.map(e => {
      let s = 0;
      qs.forEach(w => { if (e._t.has(w)) s += 3; if (e._k.has(w)) s += 3; if (e._b.has(w)) s += 1; });
      return { e, s: s / Math.sqrt(qs.length) };
    }).filter(x => x.s >= 2).sort((a, b) => b.s - a.s).slice(0, limit).map(x => x.e);
  }

  window.KP_KB = { load, query, get entries() { return KB.entries; }, get error() { return KB.error; }, get ready() { return KB.ready; } };
})();
