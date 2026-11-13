/* K-Pedia — Arsitektur pencarian Jadwal KRL (belum ada data jadwal, jadi tidak ada jadwal di sini).
   Modul ini hanya algoritma murni. Saat data resmi tersedia, administrator mengisi KP_KRL.dataset sesuai
   data-contracts/krl-dataset.schema.json dan halaman Jadwal KRL baru boleh mengaktifkan pencarian.

   Contoh transit Depok -> Manggarai -> Jatinegara:
   1. cari perjalanan Depok-Manggarai;  2. ambil waktu tiba di Manggarai;
   3. cari perjalanan lanjutan Manggarai-Jatinegara yang berangkat >= waktu tiba + waktu transit minimum;
   4. periksa kelayakan transit;  5. tampilkan keberangkatan awal dan kedatangan akhir.                */
"use strict";
(function () {
  const toMin = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ""); return m ? (+m[1]) * 60 + (+m[2]) : null; };
  const fmt = n => `${String(Math.floor(n / 60) % 24).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  const ready = ds => !!(ds && Array.isArray(ds.trips) && ds.trips.length);

  /** Segmen perjalanan dari stasiun a ke b (urutan berhenti harus a sebelum b). */
  function segments(trips, a, b) {
    const out = [];
    for (const t of trips) {
      const i = t.stops.findIndex(s => s.station === a), j = t.stops.findIndex(s => s.station === b);
      if (i < 0 || j <= i) continue;
      const dep = toMin(t.stops[i].dep ?? t.stops[i].arr), arr = toMin(t.stops[j].arr ?? t.stops[j].dep);
      if (dep == null || arr == null || arr < dep) continue;
      out.push({ trip: t.id, line: t.line, from: a, to: b, dep, arr });
    }
    return out;
  }
  /**
   * @param {object} o  { dataset, from, to, after="00:00", before="23:59", fullDay=false, minTransit=3, maxTransfers=1 }
   * @returns {{status:"no-data"|"ok"|"none", journeys:Array}}
   */
  function plan(o) {
    const ds = o && o.dataset; if (!ready(ds)) return { status: "no-data", journeys: [] };
    const min = o.minTransit ?? ds.minTransitMinutes ?? 3, after = o.fullDay ? 0 : toMin(o.after || "00:00"), before = o.fullDay ? 1439 : toMin(o.before || "23:59");
    const inWin = s => s.dep >= after && s.dep <= before;
    const res = [];
    segments(ds.trips, o.from, o.to).filter(inWin).forEach(s => res.push({ legs: [s], transfers: [], dep: s.dep, arr: s.arr }));
    if ((o.maxTransfers ?? 1) >= 1) {
      const vias = new Set(); ds.trips.forEach(t => t.stops.forEach(s => { if (s.station !== o.from && s.station !== o.to) vias.add(s.station); }));
      for (const v of vias) {
        const first = segments(ds.trips, o.from, v).filter(inWin);
        if (!first.length) continue; const second = segments(ds.trips, v, o.to);
        for (const a of first) for (const b of second) {
          if (a.trip === b.trip) continue;
          const wait = b.dep - a.arr; if (wait < min) continue;               // transit tidak layak
          if (wait > (ds.maxTransitMinutes ?? 60)) continue;                   // menunggu terlalu lama
          res.push({ legs: [a, b], transfers: [{ station: v, arrive: a.arr, depart: b.dep, wait, ok: true }], dep: a.dep, arr: b.arr });
        }
      }
    }
    // buang perjalanan transit yang kalah dari perjalanan langsung/lebih cepat dengan keberangkatan sama
    const best = new Map(); res.forEach(r => { const k = r.legs[0].trip + "@" + r.dep + "|" + r.legs.length; const c = best.get(k); if (!c || r.arr < c.arr) best.set(k, r); });
    const journeys = [...best.values()].sort((x, y) => x.dep - y.dep || x.arr - y.arr).map(r => ({ ...r, duration: r.arr - r.dep, depText: fmt(r.dep), arrText: fmt(r.arr) }));
    return { status: journeys.length ? "ok" : "none", journeys };
  }
  window.KP_KRL = { dataset: null, ready: () => ready(window.KP_KRL.dataset), plan, toMin, fmt };
})();
