/* Uji unit (Node >= 18): node tests/run-unit.js
   Data sintetis HANYA di berkas uji ini; tidak pernah dimuat oleh aplikasi. */
"use strict";
const fs = require("fs"), vm = require("vm"), path = require("path"), assert = require("assert");
const load = (f, extra = {}) => { const w = { localStorage: { getItem() { return null; }, setItem() {} }, document: { addEventListener() {}, getElementById() { return null; }, querySelectorAll() { return []; } }, matchMedia: () => ({ matches: false }), ...extra }; w.window = w; vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", f), "utf8"), w, { filename: f }); return w; };
let pass = 0; const t = (n, fn) => { try { fn(); pass++; console.log("LOLOS ", n); } catch (e) { console.log("GAGAL ", n, "\n   ", e.message); process.exitCode = 1; } };

const calc = load("kp-calc.js").KP_CALC;
t("kalkulator: prioritas operator & kurung", () => { assert.strictEqual(calc.evaluate("2+3×4"), 14); assert.strictEqual(calc.evaluate("(2+3)×4"), 20); assert.strictEqual(calc.evaluate("-5+2"), -3); });
t("kalkulator: persen, desimal koma, bagi nol", () => { assert.strictEqual(calc.evaluate("200+10%"), 200.1); assert.strictEqual(calc.evaluate("0,1+0,2"), 0.3); assert.throws(() => calc.evaluate("1÷0"), /bagi nol/); });
t("kalkulator: menolak kode (tanpa eval)", () => { assert.throws(() => calc.evaluate("alert(1)"), /tidak dikenal/); assert.throws(() => calc.evaluate("2+"), /tidak lengkap/); assert.throws(() => calc.evaluate("(2"), /Kurung/); });
t("tanggal: akhir bulan dan kabisat", () => { const { U, shift, iso } = calc; assert.strictEqual(iso(shift(U(2026, 1, 31), 1, 1, "bulan")), "2026-02-28"); assert.strictEqual(iso(shift(U(2028, 2, 29), 1, 1, "tahun")), "2029-02-28"); assert.strictEqual(iso(shift(U(2026, 12, 25), 1, 30, "hari")), "2027-01-24"); });
t("tanggal: selisih", () => { const d = calc.diffParts(calc.U(2026, 1, 15), calc.U(2026, 3, 20)); assert.deepStrictEqual([d.years, d.months, d.days], [0, 2, 5]); });

const krl = load("krl-planner.js").KP_KRL;
const FIX = { minTransitMinutes: 3, trips: [
  { id: "T1", line: "A", stops: [{ station: "Depok", dep: "06:00" }, { station: "Manggarai", arr: "06:40" }] },
  { id: "T2", line: "B", stops: [{ station: "Manggarai", dep: "06:45" }, { station: "Jatinegara", arr: "06:55" }] },
  { id: "T3", line: "B", stops: [{ station: "Manggarai", dep: "06:41" }, { station: "Jatinegara", arr: "06:52" }] } ] };
t("KRL: tanpa data => no-data (pencarian tetap nonaktif)", () => { assert.strictEqual(krl.plan({ dataset: null, from: "Depok", to: "Jatinegara" }).status, "no-data"); assert.strictEqual(krl.ready(), false); });
t("KRL: transit Depok→Manggarai→Jatinegara memeriksa waktu transit minimum", () => {
  const r = krl.plan({ dataset: FIX, from: "Depok", to: "Jatinegara" }); assert.strictEqual(r.status, "ok"); assert.strictEqual(r.journeys.length, 1);
  const j = r.journeys[0]; assert.strictEqual(j.legs[1].trip, "T2"); assert.strictEqual(j.depText, "06:00"); assert.strictEqual(j.arrText, "06:55"); assert.strictEqual(j.transfers[0].wait, 5);
  const loose = krl.plan({ dataset: FIX, from: "Depok", to: "Jatinegara", minTransit: 0 }); assert.strictEqual(loose.journeys.length, 1); assert.strictEqual(loose.journeys[0].arrText, "06:52"); /* hanya yang tercepat dipertahankan */ });
t("KRL: jendela waktu & tidak ada hasil", () => { assert.strictEqual(krl.plan({ dataset: FIX, from: "Depok", to: "Jatinegara", after: "07:00" }).status, "none"); assert.strictEqual(krl.plan({ dataset: FIX, from: "Depok", to: "Jatinegara", fullDay: true }).status, "ok"); });
t("KRL: langsung tanpa transit", () => { const r = krl.plan({ dataset: FIX, from: "Depok", to: "Manggarai" }); assert.strictEqual(r.journeys[0].legs.length, 1); assert.strictEqual(r.journeys[0].duration, 40); });

const wx = load("kp-weather.js", { KP_STATIONS: [] }).KP_WEATHER._parse;
t("cuaca: kode WMO ke label & tingkat", () => { assert.strictEqual(wx.wmo(0, 1).t, "Cerah"); assert.strictEqual(wx.wmo(0, 0).i, "moon"); assert.strictEqual(wx.wmo(95).s, "bad"); assert.strictEqual(wx.wmo(61).s, "warn"); assert.strictEqual(wx.compass(200), "S"); });

const time = load("kp-time.js", { Intl, window: undefined });
console.log(`\n${pass} uji lolos${process.exitCode ? " (ada yang gagal)" : ""}`);
