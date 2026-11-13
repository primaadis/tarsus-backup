/* K-Pedia — Kalkulator: hitung umum (tanpa eval) dan tambah/kurang/selisih tanggal. */
"use strict";
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- Evaluator ekspresi (shunting-yard) ---------- */
  function tokenize(src) {
    const s = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/,/g, ".").replace(/\s+/g, "");
    const out = []; let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (/[0-9.]/.test(ch)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; const t = s.slice(i, j); if ((t.match(/\./g) || []).length > 1 || t === ".") throw new Error("Angka tidak valid"); out.push({ n: parseFloat(t) }); i = j; }
      else if ("+-*/()%".includes(ch)) { out.push({ o: ch }); i++; }
      else throw new Error("Karakter tidak dikenal");
    }
    return out;
  }
  function evaluate(src) {
    const toks = tokenize(src); if (!toks.length) throw new Error("Kosong");
    const prec = { "+": 1, "-": 1, "*": 2, "/": 2, u: 3 }, outq = [], st = []; let prev = null;
    for (const t of toks) {
      if (t.n !== undefined) { outq.push(t); prev = "n"; continue; }
      const o = t.o;
      if (o === "(") { st.push("("); prev = "("; }
      else if (o === ")") { while (st.length && st[st.length - 1] !== "(") outq.push({ o: st.pop() }); if (!st.length) throw new Error("Kurung tidak seimbang"); st.pop(); prev = ")"; }
      else if (o === "%") { if (prev !== "n" && prev !== ")") throw new Error("Persen tidak valid"); outq.push({ o: "%" }); prev = "n"; }
      else {
        const unary = (o === "-" || o === "+") && (prev === null || prev === "(" || prev === "o");
        const op = unary ? (o === "-" ? "u" : "p") : o;
        if (op === "p") { prev = "o"; continue; }
        while (st.length && st[st.length - 1] !== "(" && (prec[st[st.length - 1]] > prec[op] || (prec[st[st.length - 1]] === prec[op] && op !== "u"))) outq.push({ o: st.pop() });
        st.push(op); prev = "o";
      }
    }
    while (st.length) { const o = st.pop(); if (o === "(") throw new Error("Kurung tidak seimbang"); outq.push({ o }); }
    const v = [];
    for (const t of outq) {
      if (t.n !== undefined) { v.push(t.n); continue; }
      if (t.o === "u") { if (!v.length) throw new Error("Ekspresi tidak lengkap"); v.push(-v.pop()); continue; }
      if (t.o === "%") { if (!v.length) throw new Error("Ekspresi tidak lengkap"); v.push(v.pop() / 100); continue; }
      if (v.length < 2) throw new Error("Ekspresi tidak lengkap"); const b = v.pop(), a = v.pop();
      v.push(t.o === "+" ? a + b : t.o === "-" ? a - b : t.o === "*" ? a * b : (() => { if (b === 0) throw new Error("Tidak bisa dibagi nol"); return a / b; })());
    }
    if (v.length !== 1 || !isFinite(v[0])) throw new Error("Hasil tidak valid");
    return Math.round(v[0] * 1e12) / 1e12;
  }
  const fmtNum = n => { const s = Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-9 && n !== 0) ? n.toExponential(6) : new Intl.NumberFormat("id-ID", { maximumFractionDigits: 10 }).format(n); return s; };

  /* ---------- Tanggal ---------- */
  const U = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
  function addMonths(date, n) {
    const y = date.getUTCFullYear(), m = date.getUTCMonth() + n, d = date.getUTCDate();
    const ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12, dim = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
    return new Date(Date.UTC(ty, tm, Math.min(d, dim)));
  }
  function shift(date, sign, amt, unit) {
    const a = sign * amt;
    if (unit === "hari") return new Date(date.getTime() + a * 864e5);
    if (unit === "minggu") return new Date(date.getTime() + a * 7 * 864e5);
    if (unit === "bulan") return addMonths(date, a);
    return addMonths(date, a * 12);
  }
  function diffParts(a, b) { // a <= b
    let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
    let m = addMonths(a, months); if (m > b) { months--; m = addMonths(a, months); }
    return { years: Math.floor(months / 12), months: months % 12, days: Math.round((b - m) / 864e5) };
  }
  const iso = d => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  const parseISO = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? U(+m[1], +m[2], +m[3]) : null; };
  const longDate = d => `${["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][d.getUTCDay()]}, ${d.getUTCDate()} ${["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][d.getUTCMonth()]} ${d.getUTCFullYear()}`;

  /* ---------- UI ---------- */
  let built = false, expr = "", result = "0", justEq = false, hist = [];
  const HK = "kp:calc:hist";
  function build() {
    if (built) return; built = true;
    try { hist = JSON.parse(localStorage.getItem(HK) || "[]").slice(0, 12); } catch (_) {}
    const keys = [["AC", "fn", "ac"], ["⌫", "fn", "bs"], ["%", "op", "%"], ["÷", "op", "÷"], ["7"], ["8"], ["9"], ["×", "op", "×"], ["4"], ["5"], ["6"], ["−", "op", "−"], ["1"], ["2"], ["3"], ["+", "op", "+"], ["( )", "fn", "par"], ["0"], [",", "", ","], ["=", "eq", "="]];
    document.getElementById("calcMath").innerHTML = `<div class="calc-card glass"><div class="calc-screen" aria-live="polite"><div class="calc-expr" id="cExpr">&nbsp;</div><div class="calc-out" id="cOut">0</div></div>
      <div class="calc-keys">${keys.map(k => `<button type="button" class="ck ${k[1] || ""}" data-k="${k[2] || k[0]}" aria-label="${({ ac: "Hapus semua", bs: "Hapus satu", par: "Kurung", "÷": "Bagi", "×": "Kali", "−": "Kurang", "+": "Tambah", "=": "Sama dengan", "%": "Persen", ",": "Koma desimal" })[k[2] || k[0]] || k[0]}">${k[0]}</button>`).join("")}</div></div>
      <div class="calc-hist glass"><h2>Riwayat hitung</h2><div id="cHist"></div></div>`;
    const dv = document.getElementById("calcDate"), t = iso(U(...(window.KP_TIME ? ((n) => [n.y, n.m, n.d])(window.KP_TIME.now()) : [new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, new Date().getUTCDate()])));
    dv.innerHTML = `<div class="dcalc glass"><h2>Tambah atau kurang tanggal</h2>
      <div class="row-2"><label class="fld"><span>Tanggal awal</span><input class="date-input" type="date" id="dStart" value="${t}"></label>
      <div class="fld"><span>Operasi</span><div class="seg-mini" role="group" aria-label="Operasi"><button type="button" class="active" data-op="1">Tambah</button><button type="button" data-op="-1">Kurang</button></div></div></div>
      <div class="row-2"><label class="fld"><span>Jumlah</span><input class="date-input" type="number" id="dAmt" min="0" step="1" value="30" inputmode="numeric"></label>
      <label class="fld"><span>Satuan</span><select class="setting-select" id="dUnit"><option>hari</option><option>minggu</option><option>bulan</option><option>tahun</option></select></label></div>
      <div class="dres" id="dRes" aria-live="polite"></div></div>
      <div class="dcalc glass"><h2>Selisih dua tanggal</h2><div class="row-2"><label class="fld"><span>Dari</span><input class="date-input" type="date" id="eA" value="${t}"></label><label class="fld"><span>Sampai</span><input class="date-input" type="date" id="eB" value="${t}"></label></div><div class="dres" id="eRes" aria-live="polite"></div></div>`;
    renderHist(); paintMath(); wireDate();
    document.getElementById("calcMath").addEventListener("click", e => {
      const k = e.target.closest("[data-k]"), h = e.target.closest("[data-h]");
      if (k) press(k.dataset.k); else if (h) { const it = hist[+h.dataset.h]; expr = it.r.replace(/\./g, "").replace(",", "."); justEq = false; paintMath(); }
    });
    document.addEventListener("keydown", e => {
      const page = document.getElementById("page-kalkulator"); if (!page || !page.classList.contains("active") || document.getElementById("calcMath").hidden) return;
      if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      const k = e.key; if (/^[0-9]$/.test(k)) press(k); else if (["+", "-", "*", "/", "%", "(", ")"].includes(k)) press(k === "*" ? "×" : k === "/" ? "÷" : k === "-" ? "−" : k); else if (k === "," || k === ".") press(","); else if (k === "Enter" || k === "=") { e.preventDefault(); press("="); } else if (k === "Backspace") press("bs"); else if (k === "Escape") press("ac");
    });
    document.querySelectorAll("[data-calc-tab]").forEach(b => b.addEventListener("click", () => {
      document.querySelectorAll("[data-calc-tab]").forEach(x => { const on = x === b; x.classList.toggle("active", on); x.setAttribute("aria-selected", on); });
      document.getElementById("calcMath").hidden = b.dataset.calcTab !== "math"; document.getElementById("calcDate").hidden = b.dataset.calcTab !== "date";
    }));
  }
  function press(k) {
    if (k === "ac") { expr = ""; result = "0"; justEq = false; }
    else if (k === "bs") { expr = expr.slice(0, -1); justEq = false; }
    else if (k === "par") { const o = (expr.match(/\(/g) || []).length, c = (expr.match(/\)/g) || []).length; expr += (o > c && /[0-9)%]$/.test(expr)) ? ")" : (/[0-9)%]$/.test(expr) ? "×(" : "("); justEq = false; }
    else if (k === "=") { if (!expr) return; try { const r = fmtNum(evaluate(expr)); hist.unshift({ e: expr.replace(/\./g, ","), r }); hist = hist.slice(0, 12); try { localStorage.setItem(HK, JSON.stringify(hist)); } catch (_) {} renderHist(); expr = String(evaluate(expr)); result = r; justEq = true; paintMath(); return; } catch (err) { setOut(err.message, true); return; } }
    else {
      const isOp = "+−×÷%".includes(k);
      if (justEq && !isOp && k !== "(" ) expr = ""; justEq = false;
      if (k === ",") { const lastNum = expr.split(/[+−×÷\-*/()%]/).pop(); if (lastNum.includes(".")) return; expr += lastNum === "" ? "0." : "."; }
      else if (isOp && k !== "%" && /[+−×÷\-*/]$/.test(expr)) expr = expr.slice(0, -1) + k;
      else if (isOp && k !== "%" && !expr) { if (k === "−") expr = "−"; }
      else expr += k;
    }
    paintMath();
  }
  function paintMath() {
    const ex = document.getElementById("cExpr"); if (!ex) return;
    ex.textContent = expr ? expr.replace(/\./g, ",") : "\u00a0";
    if (!expr) { setOut("0"); return; }
    try { const r = evaluate(expr.replace(/[+−×÷\-*/]$/, "")); setOut(justEq ? result : fmtNum(r)); } catch (_) { setOut(justEq ? result : "…"); }
  }
  function setOut(t, err) { const o = document.getElementById("cOut"); o.textContent = t; o.classList.toggle("err", !!err); }
  function renderHist() {
    const h = document.getElementById("cHist"); if (!h) return;
    h.innerHTML = hist.length ? hist.map((x, i) => `<button type="button" class="hist-row" data-h="${i}"><small>${esc(x.e)} =</small><b>${esc(x.r)}</b></button>`).join("") : '<p style="color:var(--muted);font-size:.9rem">Belum ada perhitungan. Hasil terakhir akan tersimpan di perangkat ini.</p>';
  }
  function wireDate() {
    let op = 1; const g = id => document.getElementById(id);
    const run = () => {
      const s = parseISO(g("dStart").value), a = parseInt(g("dAmt").value, 10);
      if (!s || !isFinite(a) || a < 0) { g("dRes").innerHTML = "<small>Isi tanggal awal dan jumlah (0 atau lebih).</small>"; return; }
      const r = shift(s, op, a, g("dUnit").value), h = window.KP_TIME ? window.KP_TIME.holidayOn(iso(r)) : [];
      g("dRes").innerHTML = `<small>${op > 0 ? "Setelah" : "Sebelum"} ${a} ${g("dUnit").value}</small><b>${longDate(r)}</b><small>${h.length ? "Bertepatan dengan: " + esc(h.map(x => x.name).join(", ")) : "Bukan hari libur nasional yang dikenal."}</small>`;
      if (window.KP_TIME) window.KP_TIME.loadHolidays(r.getUTCFullYear()).then(() => { const h2 = window.KP_TIME.holidayOn(iso(r)); if (h2.length !== h.length) run(); });
    };
    const diff = () => {
      let a = parseISO(g("eA").value), b = parseISO(g("eB").value); if (!a || !b) { g("eRes").innerHTML = "<small>Isi kedua tanggal.</small>"; return; }
      const neg = b < a; if (neg) [a, b] = [b, a]; const days = Math.round((b - a) / 864e5), p = diffParts(a, b);
      g("eRes").innerHTML = `<b>${new Intl.NumberFormat("id-ID").format(days)} hari${neg ? " (mundur)" : ""}</b><small>${Math.floor(days / 7)} minggu ${days % 7} hari · ${p.years} tahun ${p.months} bulan ${p.days} hari</small>`;
    };
    document.querySelectorAll("#calcDate [data-op]").forEach(b => b.addEventListener("click", () => { op = +b.dataset.op; document.querySelectorAll("#calcDate [data-op]").forEach(x => x.classList.toggle("active", x === b)); run(); }));
    ["dStart", "dAmt", "dUnit"].forEach(id => g(id).addEventListener("input", run)); ["eA", "eB"].forEach(id => g(id).addEventListener("input", diff)); run(); diff();
  }
  window.KP_CALC = { build, evaluate, shift, addMonths, diffParts, fmtNum, iso, parseISO, U };
})();
