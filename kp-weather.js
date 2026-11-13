/* K-Pedia — Cuaca stasiun (Open-Meteo, https://open-meteo.com).
   Tanpa kunci API. Koordinat diambil dari data stasiun (KP_STATIONS); wilayah lain lewat Open-Meteo Geocoding.
   Cache 15 menit per lokasi + penggabungan permintaan yang sedang berjalan agar API tidak dipanggil berlebihan.
   Bila API gagal: salinan tersimpan (diberi label) atau status "tidak tersedia". Tidak pernah menampilkan data karangan.
   Catatan penggunaan: Open-Meteo gratis untuk penggunaan non-komersial (CC BY 4.0). Untuk peringatan resmi gunakan BMKG. */
"use strict";
(function () {
  const API = "https://api.open-meteo.com/v1/forecast", GEO = "https://geocoding-api.open-meteo.com/v1/search";
  const TTL = 15 * 60 * 1000, LOC_KEY = "kp:weather:loc", DEFAULT = { name: "Gambir", sub: "Jakarta Pusat", lat: -6.1767, lon: 106.8306 };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const inflight = new Map(); let loc = null, chipTimer = 0;
  const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  /** Kode cuaca WMO -> label Indonesia, ikon Phosphor, tingkat (ok | warn | bad). */
  function wmo(code, day = 1) {
    const d = !!day;
    if (code === 0) return { t: "Cerah", i: d ? "sun" : "moon", s: "ok" };
    if (code === 1) return { t: "Cerah berawan", i: d ? "cloud-sun" : "cloud-moon", s: "ok" };
    if (code === 2) return { t: "Berawan sebagian", i: d ? "cloud-sun" : "cloud-moon", s: "ok" };
    if (code === 3) return { t: "Mendung", i: "cloud", s: "ok" };
    if (code === 45 || code === 48) return { t: "Berkabut", i: "cloud-fog", s: "warn" };
    if (code >= 51 && code <= 57) return { t: "Gerimis", i: "cloud-rain", s: "warn" };
    if (code === 61 || code === 63 || code === 66) return { t: "Hujan", i: "cloud-rain", s: "warn" };
    if (code === 65 || code === 67) return { t: "Hujan lebat", i: "cloud-rain", s: "bad" };
    if (code >= 71 && code <= 77) return { t: "Salju", i: "cloud-snow", s: "warn" };
    if (code === 80 || code === 81) return { t: "Hujan lokal", i: "cloud-rain", s: "warn" };
    if (code === 82) return { t: "Hujan sangat deras", i: "cloud-rain", s: "bad" };
    if (code === 85 || code === 86) return { t: "Hujan salju", i: "cloud-snow", s: "warn" };
    if (code === 95) return { t: "Badai petir", i: "cloud-lightning", s: "bad" };
    if (code === 96 || code === 99) return { t: "Badai petir dan es", i: "cloud-lightning", s: "bad" };
    return { t: "Tidak diketahui", i: "cloud", s: "ok" };
  }
  const compass = deg => ["U", "TL", "T", "TG", "S", "BD", "B", "BL"][Math.round(((deg % 360) / 45)) % 8];
  const key = l => `kp:wx:${l.lat.toFixed(2)},${l.lon.toFixed(2)}`;
  const params = l => `${API}?latitude=${l.lat}&longitude=${l.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=7&wind_speed_unit=kmh`;

  function getLoc() {
    if (loc) return loc;
    try { const s = JSON.parse(localStorage.getItem(LOC_KEY) || "null"); if (s && isFinite(s.lat) && isFinite(s.lon)) return (loc = s); } catch (_) {}
    const g = (window.KP_STATIONS || []).find(s => s.nama === "Gambir" && s.koordinat && s.koordinat.length === 2);
    return (loc = g ? { name: g.nama, sub: g.kota || g.region || "", lat: g.koordinat[0], lon: g.koordinat[1] } : DEFAULT);
  }
  function setLoc(l) { loc = l; try { localStorage.setItem(LOC_KEY, JSON.stringify(l)); } catch (_) {} }

  /** Ambil data: cache segar -> jaringan -> salinan lama (diberi tanda) -> galat. */
  async function load(l, force) {
    const k = key(l); let saved = null;
    try { saved = JSON.parse(localStorage.getItem(k) || "null"); } catch (_) {}
    if (!force && saved && Date.now() - saved.at < TTL) return { data: saved.data, at: saved.at, from: "cache" };
    if (inflight.has(k)) return inflight.get(k);
    const p = (async () => {
      try {
        const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 9000);
        const r = await fetch(params(l), { signal: ctl.signal }); clearTimeout(t);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const data = await r.json(); if (!data || !data.current) throw new Error("Respons tidak lengkap");
        const at = Date.now(); try { localStorage.setItem(k, JSON.stringify({ at, data })); } catch (_) {}
        return { data, at, from: "net" };
      } catch (e) {
        if (saved) return { data: saved.data, at: saved.at, from: "stale" };
        throw e;
      }
    })().finally(() => inflight.delete(k));
    inflight.set(k, p); return p;
  }

  /* ---------- Chip di Beranda ---------- */
  async function paintChip(force) {
    const chip = document.getElementById("weatherChip"); if (!chip) return;
    const l = getLoc(), t = document.getElementById("wxChipTemp"), pl = document.getElementById("wxChipPlace"), ic = document.getElementById("wxChipIc");
    try {
      const r = await load(l, force), c = r.data.current, w = wmo(c.weather_code, c.is_day);
      t.textContent = Math.round(c.temperature_2m) + "°C"; pl.textContent = `${w.t} · ${l.name}`; ic.innerHTML = `<i class="ph ph-${w.i} ic"></i>`;
      chip.classList.remove("is-off");
    } catch (_) {
      t.textContent = "Cuaca"; pl.textContent = "Data tidak tersedia"; ic.innerHTML = '<i class="ph ph-cloud-slash ic"></i>'; chip.classList.add("is-off");
    }
  }
  function startChip() { paintChip(); clearInterval(chipTimer); chipTimer = setInterval(() => { if (!document.hidden) paintChip(); }, TTL); }

  /* ---------- Panel cuaca ---------- */
  function hourLabel(iso) { return iso.slice(11, 16); }
  function renderData(box, l, r) {
    const d = r.data, c = d.current, w = wmo(c.weather_code, c.is_day), cur = c.time;
    const idx = Math.max(0, d.hourly.time.findIndex(t => t >= cur.slice(0, 13) + ":00"));
    const hours = d.hourly.time.slice(idx, idx + 12).map((t, i) => { const j = idx + i, h = wmo(d.hourly.weather_code[j], d.hourly.is_day[j]); return `<div class="wx-hour"><small>${i === 0 ? "Sekarang" : hourLabel(t)}</small><i class="ph ph-${h.i} ic"></i><b>${Math.round(d.hourly.temperature_2m[j])}°</b><em>${d.hourly.precipitation_probability[j] ?? 0}%</em></div>`; }).join("");
    const days = d.daily.time.map((t, i) => { const dt = new Date(t + "T00:00:00Z"), h = wmo(d.daily.weather_code[i], 1); return `<div class="wx-day"><b>${i === 0 ? "Hari ini" : DAYS[dt.getUTCDay()] + ", " + dt.getUTCDate()}</b><i class="ph ph-${h.i} ic"></i><span class="cn">${h.t}</span><span class="tr">${Math.round(d.daily.temperature_2m_max[i])}° <span>/ ${Math.round(d.daily.temperature_2m_min[i])}°</span></span><span class="pp">${d.daily.precipitation_probability_max[i] ?? 0}%</span></div>`; }).join("");
    const upd = new Date(r.at), hm = upd.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
    const status = r.from === "stale" ? `Data tersimpan (diperbarui ${hm}); koneksi ke Open-Meteo gagal.` : `Diperbarui ${hm} · waktu stasiun ${hourLabel(cur)} (${d.timezone_abbreviation || d.timezone})`;
    box.innerHTML = `<div class="wx-now"><div><div class="wx-big"><i class="ph ph-${w.i} ic"></i><div class="wx-temp">${Math.round(c.temperature_2m)}°</div></div><div class="wx-cond">${w.t}</div><div class="wx-sub">Terasa ${Math.round(c.apparent_temperature)}°C · ${esc(l.name)}</div><span class="wx-badge ${w.s}"><i class="ph ph-${w.s === "ok" ? "check-circle" : "warning"}"></i>${w.s === "ok" ? "Kondisi baik" : w.s === "warn" ? "Waspada" : "Cuaca ekstrem"}</span></div>
      <div class="wx-stats"><div class="wx-stat"><i class="ph ph-drop"></i><span>Kelembapan</span><b>${Math.round(c.relative_humidity_2m)}%</b></div><div class="wx-stat"><i class="ph ph-wind"></i><span>Angin</span><b>${Math.round(c.wind_speed_10m)} km/j ${compass(c.wind_direction_10m)}</b></div><div class="wx-stat"><i class="ph ph-cloud-rain"></i><span>Curah hujan</span><b>${(c.precipitation ?? 0).toFixed(1)} mm</b></div><div class="wx-stat"><i class="ph ph-thermometer-simple"></i><span>Terasa</span><b>${Math.round(c.apparent_temperature)}°C</b></div></div></div>
      <h3 class="wx-h2">12 jam ke depan</h3><div class="wx-h">${hours}</div><h3 class="wx-h2">7 hari ke depan</h3><div class="wx-days">${days}</div>
      <p class="wx-foot">${esc(status)} Sumber: Open-Meteo.com (CC BY 4.0). Untuk peringatan dini resmi, rujuk BMKG.</p>`;
  }
  function open() {
    const panel = window.KP_UI.openPanel({ id: "weather", title: "Cuaca stasiun", icon: "cloud", from: document.getElementById("weatherChip") });
    const body = panel.body; let l = getLoc(), searching = false;
    body.innerHTML = `<div class="wx-top"><button type="button" class="wx-loc" id="wxLoc" aria-expanded="false"><i class="ph ph-map-pin ic"></i><span id="wxLocName"></span><i class="ph ph-caret-down ic ic-sm"></i></button><button type="button" class="btn ghost" id="wxRefresh"><i class="ph ph-arrow-clockwise ic"></i> Segarkan</button></div>
      <div class="wx-search" id="wxSearch" hidden><div class="field-box"><i class="ph ph-magnifying-glass ic"></i><input id="wxInput" type="search" placeholder="Cari stasiun atau wilayah" autocomplete="off" aria-label="Cari stasiun atau wilayah"></div><div class="wx-results" id="wxResults" role="listbox"></div></div><div id="wxBody"></div>`;
    const $ = id => body.querySelector("#" + id), out = $("wxBody");
    const name = () => { $("wxLocName").textContent = l.sub ? `${l.name} · ${l.sub}` : l.name; };
    async function show(force) {
      name(); out.innerHTML = '<div class="wx-skel"></div><div class="wx-skel" style="margin-top:12px;height:96px"></div>';
      try { const r = await load(l, force); renderData(out, l, r); paintChip(); }
      catch (e) { out.innerHTML = `<div class="wx-err"><i class="ph ph-cloud-slash ic"></i><strong>Data cuaca tidak tersedia</strong><p>Layanan cuaca tidak dapat dijangkau dan belum ada salinan tersimpan untuk lokasi ini. Tidak ada data yang ditampilkan.</p><button class="btn primary" type="button" id="wxRetry"><i class="ph ph-arrow-clockwise ic"></i> Coba lagi</button></div>`; $("wxRetry").onclick = () => show(true); }
    }
    function stationMatches(q) {
      const n = q.toLowerCase(); return (window.KP_STATIONS || []).filter(s => s.koordinat && s.koordinat.length === 2 && ([s.nama, s.kota, s.region, ...(s.alias || [])].filter(Boolean).join(" ").toLowerCase().includes(n))).slice(0, 8)
        .map(s => ({ name: s.nama, sub: s.kota || s.region || "", lat: s.koordinat[0], lon: s.koordinat[1], tag: "Stasiun" }));
    }
    let gTimer = 0, gSeq = 0;
    function list(items, geoLoading) {
      $("wxResults").innerHTML = (items.length ? `<div class="grp">Hasil</div>` + items.map((o, i) => `<button type="button" class="wx-opt" role="option" data-i="${i}"><i class="ph ph-${o.tag === "Stasiun" ? "train" : "map-pin"} ic"></i>${esc(o.name)}<small>${esc(o.sub || o.tag)}</small></button>`).join("") : `<div class="grp">${geoLoading ? "Mencari…" : "Tidak ada hasil"}</div>`);
      $("wxResults")._items = items;
    }
    function popular() { return ["Gambir", "Bandung", "Yogyakarta", "Surabaya Gubeng", "Semarang Tawang", "Malang"].map(n => (window.KP_STATIONS || []).find(s => s.nama === n)).filter(Boolean).map(s => ({ name: s.nama, sub: s.kota || s.region || "", lat: s.koordinat[0], lon: s.koordinat[1], tag: "Stasiun" })); }
    $("wxLoc").onclick = () => { searching = !searching; $("wxSearch").hidden = !searching; $("wxLoc").setAttribute("aria-expanded", searching); if (searching) { list(popular()); $("wxInput").focus(); } };
    $("wxRefresh").onclick = () => show(true);
    $("wxInput").addEventListener("input", e => {
      const q = e.target.value.trim(); clearTimeout(gTimer); if (q.length < 2) { list(popular()); return; }
      const local = stationMatches(q); list(local, true);
      gTimer = setTimeout(async () => {
        const seq = ++gSeq;
        try {
          const r = await fetch(`${GEO}?name=${encodeURIComponent(q)}&count=6&language=id&countryCode=ID`); const j = await r.json(); if (seq !== gSeq) return;
          const geo = (j.results || []).map(g => ({ name: g.name, sub: [g.admin2, g.admin1].filter(Boolean).join(", "), lat: g.latitude, lon: g.longitude, tag: "Wilayah" }));
          list([...local, ...geo.filter(g => !local.some(s => Math.abs(s.lat - g.lat) < .02 && Math.abs(s.lon - g.lon) < .02))]);
        } catch (_) { if (seq === gSeq) list(local); }
      }, 350);
    });
    $("wxResults").addEventListener("click", e => {
      const b = e.target.closest("[data-i]"); if (!b) return; const o = $("wxResults")._items[+b.dataset.i];
      l = { name: o.name, sub: o.sub, lat: o.lat, lon: o.lon }; setLoc(l); searching = false; $("wxSearch").hidden = true; $("wxLoc").setAttribute("aria-expanded", "false"); show(false); paintChip();
    });
    show(false);
  }

  window.KP_WEATHER = { open, startChip, load, wmo, getLoc, _parse: { wmo, compass } };
})();
