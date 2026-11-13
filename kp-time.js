/* K-Pedia — Jam, kalender, dan hari libur nasional.
   Zona utama: Asia/Jakarta (WIB), dihitung lewat Intl (bukan jam statis atau zona perangkat).
   Hari libur: lima libur berdasarkan tanggal tetap sudah tertanam. Libur keagamaan dan cuti bersama
   (ditetapkan tiap tahun lewat SKB 3 Menteri) diambil dari sumber daring bila tersedia, disimpan 7 hari,
   dan diberi keterangan sumber. Bila gagal, hanya libur tetap yang tampil beserta catatan. */
"use strict";
(function () {
  const TZ = "Asia/Jakarta";
  const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const FIXED = { "01-01": "Tahun Baru Masehi", "05-01": "Hari Buruh Internasional", "06-01": "Hari Lahir Pancasila", "08-17": "Hari Kemerdekaan RI", "12-25": "Hari Raya Natal" };
  const SOURCES = [
    { name: "api-harilibur.vercel.app", url: y => `https://api-harilibur.vercel.app/api?year=${y}` },
    { name: "libur.deno.dev", url: y => `https://libur.deno.dev/api?year=${y}` }
  ];
  const TTL = 7 * 864e5;
  const pad = n => String(n).padStart(2, "0");
  const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const fmtCache = {};
  function parts(date, tz, opts) {
    const key = tz + JSON.stringify(opts); const f = fmtCache[key] || (fmtCache[key] = new Intl.DateTimeFormat("id-ID", { timeZone: tz, hourCycle: "h23", ...opts }));
    const o = {}; f.formatToParts(date).forEach(p => { o[p.type] = p.value; }); return o;
  }
  /** Tanggal dan jam sekarang di zona tertentu (default WIB). */
  function now(tz = TZ, d = new Date()) {
    const p = parts(d, tz, { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const y = +p.year, m = +p.month, day = +p.day;
    return { y, m, d: day, hh: pad(+p.hour % 24), mm: pad(+p.minute), ss: pad(+p.second), dow: new Date(Date.UTC(y, m - 1, day)).getUTCDay(), date: ymd(y, m, day) };
  }
  const longDate = (y, m, d) => `${DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}, ${d} ${MONTHS[m - 1]} ${y}`;
  function offsetLabel(tz, d = new Date()) {
    const p = parts(d, tz, { timeZoneName: "shortOffset" }); return (p.timeZoneName || "").replace("GMT", "UTC") || "UTC";
  }
  function isoWeek(y, m, d) {
    const dt = new Date(Date.UTC(y, m - 1, d)); const day = dt.getUTCDay() || 7; dt.setUTCDate(dt.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1)); return Math.ceil(((dt - y0) / 864e5 + 1) / 7);
  }
  const dayOfYear = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 864e5);

  /* ---------- Hari libur ---------- */
  const H = { cache: {}, meta: {}, pending: {} };
  function fixedFor(y) { return Object.entries(FIXED).map(([md, name]) => ({ date: `${y}-${md}`, name, type: "libur", fixed: true })); }
  function parseList(json) {
    const arr = Array.isArray(json) ? json : (json && (json.data || json.holidays)) || [];
    const out = [];
    arr.forEach(it => {
      const raw = it.holiday_date || it.date || it.tanggal; const name = it.holiday_name || it.name || it.keterangan || it.summary;
      if (!raw || !name) return;
      const m = String(raw).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if (!m) return;
      if (it.is_national_holiday === false) return;
      out.push({ date: ymd(+m[1], +m[2], +m[3]), name: String(name), type: /cuti\s*bersama/i.test(name) ? "cuti" : "libur" });
    });
    return out;
  }
  function merge(y, remote) {
    const map = new Map(); fixedFor(y).forEach(h => map.set(h.date + h.name, h));
    const dates = new Set(fixedFor(y).map(h => h.date));
    (remote || []).forEach(h => { if (h.date.startsWith(y + "-") && !(dates.has(h.date) && h.type === "libur")) map.set(h.date + h.name, h); });
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }
  async function fetchRemote(y) {
    for (const s of SOURCES) {
      try {
        const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 6000);
        const r = await fetch(s.url(y), { signal: ctl.signal, headers: { Accept: "application/json" } }); clearTimeout(t);
        if (!r.ok) continue; const list = parseList(await r.json()); if (list.length) return { list, source: s.name };
      } catch (_) { /* coba sumber berikutnya */ }
    }
    return null;
  }
  async function loadHolidays(y) {
    if (H.cache[y]) return H.cache[y];
    if (H.pending[y]) return H.pending[y];
    H.pending[y] = (async () => {
      const key = "kp:holidays:" + y; let saved = null;
      try { saved = JSON.parse(localStorage.getItem(key) || "null"); } catch (_) {}
      if (saved && Date.now() - saved.at < TTL) { H.meta[y] = { source: saved.source, at: saved.at, cached: true }; return (H.cache[y] = merge(y, saved.list)); }
      const r = await fetchRemote(y);
      if (r) { try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), source: r.source, list: r.list })); } catch (_) {} H.meta[y] = { source: r.source, at: Date.now() }; return (H.cache[y] = merge(y, r.list)); }
      if (saved) { H.meta[y] = { source: saved.source, at: saved.at, stale: true }; return (H.cache[y] = merge(y, saved.list)); }
      H.meta[y] = { failed: true }; return (H.cache[y] = merge(y, []));
    })().finally(() => { delete H.pending[y]; });
    return H.pending[y];
  }
  const holidayOn = (date) => { const y = +date.slice(0, 4); return (H.cache[y] || fixedFor(y)).filter(h => h.date === date); };

  /* ---------- Jam di Beranda ---------- */
  let timer = 0;
  function paintChip() {
    const n = now(), t = document.getElementById("clockTime"), d = document.getElementById("clockDate");
    if (t) t.innerHTML = `${n.hh}<i style="font-style:normal;opacity:.55">:</i>${n.mm}<small style="font-size:.5em;margin-left:5px;color:#ffb347">WIB</small>`;
    if (d) d.textContent = longDate(n.y, n.m, n.d);
    const g = document.getElementById("homeGreeting"); if (g) { const h = +n.hh; g.textContent = h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam"; }
  }
  function startChip() {
    paintChip(); clearInterval(timer);
    timer = setInterval(() => { if (!document.hidden) paintChip(); }, 1000);
  }

  /* ---------- Panel kalender ---------- */
  function open() {
    const n0 = now(); let view = { y: n0.y, m: n0.m }, sel = n0.date, tick = 0, body;
    const zones = [["WIB", "Asia/Jakarta", "Waktu Indonesia Barat"], ["WITA", "Asia/Makassar", "Tengah"], ["WIT", "Asia/Jayapura", "Timur"]];
    const devTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const panel = window.KP_UI.openPanel({ id: "calendar", title: "Kalender dan waktu", icon: "calendar", from: document.getElementById("clockChip"), onClose: () => clearInterval(tick) });
    body = panel.body;
    body.innerHTML = `<div class="cal-layout"><div><div class="clock-card"><div class="clock-time" id="pClock"></div><div class="clock-date" id="pDate"></div>
      <div class="tz-list" id="pZones"></div><div class="clock-meta" id="pMeta"></div></div></div><div id="pCal"></div></div>`;
    const el = id => body.querySelector("#" + id);
    function paintClock() {
      const n = now();
      el("pClock").innerHTML = `${n.hh}:${n.mm}<small>:${n.ss} WIB</small>`;
      el("pDate").textContent = longDate(n.y, n.m, n.d);
      el("pZones").innerHTML = zones.map(([k, tz, label], i) => { const z = now(tz); return `<div class="tz-row ${i ? "" : "main"}"><span>${k} · ${label.replace("Waktu Indonesia ", "")}</span><b>${z.hh}:${z.mm}</b></div>`; }).join("")
        + (devTz && devTz !== TZ && !zones.some(z => z[1] === devTz) ? `<div class="tz-row"><span>Perangkat · ${esc(devTz)}</span><b>${(() => { const z = now(devTz); return z.hh + ":" + z.mm; })()}</b></div>` : "");
      el("pMeta").innerHTML = `<div>Pekan ke-<b>${isoWeek(n.y, n.m, n.d)}</b></div><div>Hari ke-<b>${dayOfYear(n.y, n.m, n.d)}</b> tahun ini</div><div>Selisih UTC<b>${offsetLabel(TZ)}</b></div><div>Zona utama<b>WIB</b></div>`;
    }
    function monthCells(y, m) {
      const first = new Date(Date.UTC(y, m - 1, 1)); const lead = (first.getUTCDay() + 6) % 7; const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const cells = []; for (let i = lead; i > 0; i--) { const d = new Date(Date.UTC(y, m - 1, 1 - i)); cells.push({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), out: true }); }
      for (let d = 1; d <= dim; d++) cells.push({ y, m, d });
      while (cells.length % 7) { const k = cells.length - lead - dim + 1; const d = new Date(Date.UTC(y, m, k)); cells.push({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), out: true }); }
      return cells;
    }
    async function paintCal() {
      const today = now().date; await Promise.all([loadHolidays(view.y), view.m === 1 ? loadHolidays(view.y - 1) : 0, view.m === 12 ? loadHolidays(view.y + 1) : 0].filter(Boolean));
      const cells = monthCells(view.y, view.m), dow = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      const hols = (H.cache[view.y] || []).filter(h => +h.date.slice(5, 7) === view.m);
      const meta = H.meta[view.y] || {};
      el("pCal").innerHTML = `<div class="cal-head"><h3>${MONTHS[view.m - 1]} ${view.y}</h3><div class="cal-nav"><button type="button" data-c="-1" aria-label="Bulan sebelumnya"><i class="ph ph-caret-left"></i></button><button type="button" data-c="0">Hari ini</button><button type="button" data-c="1" aria-label="Bulan berikutnya"><i class="ph ph-caret-right"></i></button></div></div>
        <div class="cal-grid" role="grid" aria-label="${MONTHS[view.m - 1]} ${view.y}">${dow.map((d, i) => `<div class="cal-dow ${i === 6 ? "sun" : ""}" role="columnheader">${d}</div>`).join("")}
        ${cells.map(c => { const ds = ymd(c.y, c.m, c.d), hs = holidayOn(ds), sun = new Date(Date.UTC(c.y, c.m - 1, c.d)).getUTCDay() === 0;
          return `<button type="button" role="gridcell" class="cal-day ${c.out ? "out" : ""} ${sun ? "sun" : ""} ${hs.some(h => h.type === "libur") ? "hol" : ""} ${ds === today ? "today" : ""} ${ds === sel ? "sel" : ""}" data-d="${ds}" aria-label="${longDate(c.y, c.m, c.d)}${hs.length ? ", " + esc(hs[0].name) : ""}" ${ds === today ? 'aria-current="date"' : ""}>${c.d}${hs.length ? '<i class="hdot"></i>' : ""}</button>`; }).join("")}</div>
        <div class="cal-detail"><div id="pSel"></div><div class="hol-list">${hols.length ? hols.map(h => `<div class="hol-item ${h.type}"><span class="hd">${+h.date.slice(8)} ${MONTHS[view.m - 1].slice(0, 3)}</span>${esc(h.name)}<small>${h.type === "cuti" ? "Cuti bersama" : "Libur nasional"}</small></div>`).join("") : '<div class="hol-item">Tidak ada hari libur nasional pada bulan ini.</div>'}</div>
        ${meta.failed ? `<div class="cal-note">Libur keagamaan dan cuti bersama belum dapat dimuat (perlu koneksi). Yang tampil hanya libur bertanggal tetap. Rujuk SKB 3 Menteri untuk daftar resmi.</div>` : ""}
        <div class="cal-src">${meta.source ? `Sumber libur: ${esc(meta.source)}${meta.stale ? " (salinan lama)" : meta.cached ? " (tersimpan)" : ""}. Data komunitas; pastikan sesuai SKB 3 Menteri.` : "Libur tetap: Tahun Baru, Hari Buruh, Hari Lahir Pancasila, Kemerdekaan RI, Natal."}</div></div>`;
      paintSel();
    }
    function paintSel() {
      const [y, m, d] = sel.split("-").map(Number), hs = holidayOn(sel), box = el("pSel"); if (!box) return;
      box.innerHTML = `<div class="hol-item" style="background:var(--accent-soft)"><span class="hd" style="color:var(--accent-fg)">Dipilih</span>${longDate(y, m, d)}<small>${hs.length ? esc(hs.map(h => h.name).join(", ")) : "Hari biasa"}</small></div>`;
    }
    body.addEventListener("click", e => {
      const nav = e.target.closest("[data-c]"), day = e.target.closest("[data-d]");
      if (nav) { const v = +nav.dataset.c; if (!v) { const n = now(); view = { y: n.y, m: n.m }; sel = n.date; } else { let m = view.m + v, y = view.y; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } view = { y, m }; } paintCal(); }
      else if (day) { sel = day.dataset.d; const [y, m] = sel.split("-").map(Number); if (y !== view.y || m !== view.m) { view = { y, m }; paintCal(); } else { body.querySelectorAll(".cal-day.sel").forEach(x => x.classList.remove("sel")); day.classList.add("sel"); paintSel(); } }
    });
    paintClock(); tick = setInterval(paintClock, 1000); paintCal();
  }

  window.KP_TIME = { TZ, now, longDate, loadHolidays, holidayOn, startChip, open, MONTHS, DAYS, ymd, pad };
})();
