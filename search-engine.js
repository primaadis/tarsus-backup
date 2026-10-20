/* K-Pedia — mesin pencarian bahasa natural (berjalan di browser, tanpa server/AI eksternal).
   Cara kerja: normalisasi + stemmer Indonesia ringan + sinonim + toleransi salah ketik + peringkat
   BM25 pada tingkat BAGIAN halaman + deteksi maksud (berapa / cara / boleh) + pencocokan FAQ.
   Sinonim bisa ditambah di objek SYN di bawah. */
"use strict";
(function () {
  const STOP = new Set(("a abis acara adalah adakah agar akan aku anda apa apabila apakah atau ayo bagaimana bagi bahwa bapak banyak bila bisa bisakah boleh buat bukan butuh cara dah dan dapat dari dengan di dong dulu gak gimana harus hendak ingin itu jadi jika juga kah kalau kalo kami kamu kan kapan karena ke kenapa kita lah lagi lalu lewat mau maka mana masih mesti minta mungkin nya oleh pada para pernah pun saja saya sama sampai sebagai sebelum sedang sehingga sekali selama seperti serta setelah siapa sih suatu sudah supaya tanya tapi telah tentang tolong tuh untuk kereta api ka udah waktu yang yah ya").split(" "));
  const SYN = [
    ["batal", "batalkan", "pembatalan", "cancel", "refund", "kembali uang", "pengembalian", "balikin", "hangus"],
    ["jadwal ulang", "reschedule", "ubah jadwal", "ganti jadwal", "geser", "pindah jadwal", "tukar jadwal"],
    ["bayi", "balita", "infant", "pangku", "anak kecil"],
    ["hamil", "bumil", "kehamilan", "mengandung"],
    ["bagasi", "koper", "barang bawaan", "bawaan", "overbagasi", "kelebihan berat"],
    ["hewan", "kucing", "anjing", "peliharaan", "binatang", "kelinci", "burung"],
    ["sepeda", "bike", "sepeda lipat"],
    ["dilarang", "terlarang", "larangan", "tidak boleh", "ilegal"],
    ["karcis", "tiket"],
    ["booking", "pesan", "beli", "pemesanan", "memesan", "membeli"],
    ["mitra", "agen", "traveloka", "tiket.com", "tokopedia", "indomaret", "alfamart", "alfamidi", "ota", "marketplace"],
    ["tarif", "harga", "biaya", "ongkos"],
    ["denda", "bea", "potongan"],
    ["krl", "commuter", "commuterline", "jabodetabek"],
    ["kmt", "kartu multi trip", "kartu krl"],
    ["whoosh", "kereta cepat", "kcic", "kcjb"],
    ["lrt", "light rail", "kereta ringan"],
    ["hilang", "tertinggal", "ketinggalan", "lupa", "lost found", "kehilangan"],
    ["kontak", "hubungi", "telepon", "call center", "wa", "whatsapp", "cs", "email", "nomor"],
    ["wajah", "face recognition", "scan wajah", "pindai wajah", "fr"],
    ["boarding", "check in", "cetak", "naik kereta", "masuk peron", "barcode", "e-boarding"],
    ["identitas", "ktp", "nik", "kia", "sim", "paspor", "kartu keluarga", "kk"],
    ["sejarah", "asal usul", "pertama", "dulu", "awal"],
    ["kelas", "eksekutif", "ekonomi", "bisnis", "luxury", "sleeper", "priority", "panoramic", "suite"],
    ["bandara", "airport", "kualanamu", "soetta", "soekarno hatta", "yia"],
    ["daop", "divre", "wilayah", "daerah operasi"],
    ["aplikasi", "app", "access", "access by kai", "kai access"]
  ];
  const norm = s => String(s ?? "").toLocaleLowerCase("id-ID").replace(/[’']/g, "").replace(/[^a-z0-9\u00c0-\u024f.\s-]/g, " ").replace(/(\s|^)[.-]+|[.-]+(\s|$)/g, " ").replace(/\s+/g, " ").trim();
  function stem(w) {
    if (w.length <= 4 || /\d/.test(w)) return w;
    let s = w.replace(/(lah|kah|pun)$/, "").replace(/nya$/, "");
    if (s.length > 5) s = s.replace(/in$/, "");
    s = s.replace(/(kan|an|i)$/, m => (s.length - m.length >= 4 ? "" : m));
    s = s.replace(/^(meny|meng|mem|men|me|peny|peng|pem|pen|per|pe|ber|ter|di|ke|se)(?=[a-z]{4,})/, "");
    return s.length >= 3 ? s : w;
  }
  const tok = s => norm(s).split(" ").filter(Boolean);
  const terms = s => tok(s).filter(w => !STOP.has(w)).map(stem);
  const synMap = new Map(); // stem -> Set(stem)
  SYN.forEach(g => {
    const stems = g.map(p => terms(p)).filter(a => a.length);
    stems.forEach(a => a.forEach(t => { if (!synMap.has(t)) synMap.set(t, new Set()); stems.forEach(b => b.forEach(u => u !== t && synMap.get(t).add(u))); }));
  });
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let best = i;
      for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); best = Math.min(best, cur[j]); }
      if (best > max) return max + 1; prev = cur;
    }
    return prev[b.length];
  }
  const slug = s => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const IDX = { docs: [], df: new Map(), vocab: [], avg: 1, faq: [], entries: new Map() };

  function splitSections(e) {
    const secs = []; let cur = { heading: "", body: [] };
    String(e.isi || "").split("\n").forEach(l => {
      const m = /^##\s+(.*)/.exec(l);
      if (m) { secs.push(cur); cur = { heading: m[1].trim(), body: [] }; } else cur.body.push(l);
    });
    secs.push(cur);
    return secs.filter(s => s.heading || s.body.join("").trim()).map(s => ({ heading: s.heading || "Ringkasan", anchor: slug(s.heading || "ringkasan"), text: s.body.join("\n").trim() }));
  }
  function build(entries, faq) {
    IDX.docs = []; IDX.df = new Map(); IDX.entries = new Map(); IDX.faq = [];
    const addDoc = d => {
      d.f = { title: terms(d.title), head: terms(d.heading), tag: terms(d.tag), body: terms(d.text) };
      d.len = d.f.body.length + d.f.head.length * 2 + 1; IDX.docs.push(d);
      new Set([...d.f.title, ...d.f.head, ...d.f.tag, ...d.f.body]).forEach(t => IDX.df.set(t, (IDX.df.get(t) || 0) + 1));
    };
    entries.forEach(e => {
      IDX.entries.set(e.id, e);
      splitSections(e).forEach(s => addDoc({ kind: "sec", id: e.id, title: e.judul + " " + e.ringkasan, entryTitle: e.judul, heading: s.heading, anchor: s.anchor, text: s.text, tag: e.tag || "", cat: e.kategori }));
    });
    (faq || []).forEach(f => addDoc({ kind: "faq", id: f.topik, title: f.pertanyaan, entryTitle: "", heading: f.bagian || "", anchor: slug(f.bagian || ""), text: f.jawaban, tag: f.kata_kunci || "", faq: f }));
    IDX.avg = IDX.docs.reduce((a, d) => a + d.len, 0) / Math.max(1, IDX.docs.length);
    IDX.vocab = [...IDX.df.keys()];
  }
  function expand(q) {
    const base = terms(q), out = new Map();
    const put = (t, w) => out.set(t, Math.max(out.get(t) || 0, w));
    base.forEach(t => {
      if (IDX.df.has(t)) put(t, 1);
      else if (t.length >= 4) { // toleransi salah ketik
        const max = t.length > 7 ? 2 : 1; let best = null, bd = max + 1;
        IDX.vocab.forEach(v => { if (Math.abs(v.length - t.length) <= max) { const d = lev(t, v, max); if (d < bd) { bd = d; best = v; } } });
        if (best) put(best, 0.75);
      }
      (synMap.get(t) || []).forEach(s => IDX.df.has(s) && put(s, 0.4));
    });
    // frasa dua kata (mis. "kartu multi trip")
    return { map: out, base };
  }
  const idf = t => { const n = IDX.docs.length, df = IDX.df.get(t) || 0; return Math.log(1 + (n - df + .5) / (df + .5)); };
  function scoreDoc(d, ex, intent) {
    let s = 0, hit = 0;
    ex.map.forEach((w, t) => {
      const tf = d.f.body.filter(x => x === t).length, th = d.f.head.includes(t) ? 1 : 0, tt = d.f.title.includes(t) ? 1 : 0, tg = d.f.tag.includes(t) ? 1 : 0;
      const raw = tf / (tf + 1.2 * (0.25 + 0.75 * d.len / IDX.avg)) * 2.2 + th * 2.4 + tt * 1.4 + tg * 1.6;
      if (raw > 0) { hit++; s += raw * idf(t) * w; }
    });
    if (!hit) return 0;
    s *= 0.6 + 0.4 * (hit / Math.max(1, ex.map.size));        // beri bonus bila banyak kata cocok
    if (intent.howmuch && /(rp\s?\d|\d+\s?%|\d+\s?(kg|km|jam|menit|hari|tahun|minggu))/i.test(d.text)) s *= 1.35;
    if (intent.how && /^\s*\d+[.)]\s/m.test(d.text)) s *= 1.3;
    if (intent.may && /(boleh|dilarang|wajib|syarat|tidak boleh)/i.test(d.text)) s *= 1.15;
    if (d.kind === "faq") {
      s *= 1.15;
      if (intent.how && /\bcara\b/i.test(d.title)) s *= 1.35;
      if (intent.howmuch && /\b(berapa|biaya|bea|tarif|harga)\b/i.test(d.title)) s *= 1.2;
    }
    return s;
  }
  function snippet(text, ex) {
    const lines = text.split("\n").map(l => l.replace(/^[-•]\s+|^\d+[.)]\s+/, "").trim()).filter(Boolean);
    let best = lines[0] || "", bs = -1;
    lines.forEach(l => { const tt = new Set(terms(l)); let sc = 0; ex.map.forEach((w, t) => tt.has(t) && (sc += w)); if (sc > bs) { bs = sc; best = l; } });
    return best.length > 190 ? best.slice(0, 187).trimEnd() + "…" : best;
  }
  function query(q, opt = {}) {
    const text = norm(q); if (!text || !IDX.docs.length) return { faq: [], topics: [], empty: true };
    const ex = expand(q);
    if (!ex.map.size) return { faq: [], topics: [] };
    const intent = {
      howmuch: /\b(berapa|biaya|harga|tarif|denda|bea|potongan|persen|ongkos|maksimal|batas)\b/.test(text),
      how: /\b(cara|langkah|bagaimana|gimana|prosedur|caranya)\b/.test(text),
      may: /\b(boleh|bolehkah|apakah|dilarang|syarat|wajib|bisakah|bisa)\b/.test(text)
    };
    const per = new Map(), faqHits = [];
    IDX.docs.forEach(d => {
      const s = scoreDoc(d, ex, intent); if (s <= 0) return;
      if (d.kind === "faq") { faqHits.push({ s, f: d.faq, d }); }
      const cur = per.get(d.id) || { id: d.id, best: null, sum: 0 };
      if (!cur.best || s > cur.best.s) cur.best = { s, d };
      cur.sum += s * 0.15; per.set(d.id, cur);
    });
    const topics = [...per.values()].map(c => {
      const e = IDX.entries.get(c.id); if (!e) return null;
      const titleHit = [...ex.map.keys()].filter(t => terms(e.judul).includes(t)).length;
      const sec = c.best.d.kind === "sec" ? c.best.d : IDX.docs.find(x => x.kind === "sec" && x.id === c.id && x.anchor === c.best.d.anchor) || c.best.d;
      return { id: c.id, entry: e, score: c.best.s + c.sum + titleHit * 1.5, section: { heading: sec.heading, anchor: sec.anchor, snippet: sec.kind === "sec" ? snippet(sec.text, ex) : snippet(sec.text || "", ex) } };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
    faqHits.sort((a, b) => b.s - a.s);
    const top = topics[0]?.score || 0, ftop = faqHits[0]?.s || 0;
    const faq = faqHits.filter(h => h.s >= Math.max(0.8, ftop * 0.6) && h.s >= top * 0.15).slice(0, opt.faqLimit || 2)
      .map(h => ({ q: h.f.pertanyaan, a: h.f.jawaban, topic: h.f.topik, section: slug(h.f.bagian || ""), sectionName: h.f.bagian || "", score: h.s }));
    return { faq, topics: topics.filter(t => t.score >= top * 0.25).slice(0, opt.limit || 8), terms: [...ex.map.keys()] };
  }
  function highlight(html, terms) { return html; }
  window.KP_SEARCH = { build, query, slug, norm, terms };
})();
