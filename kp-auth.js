/* K-Pedia — akun tunggal (masuk + daftar dalam satu layar).
   Menggantikan login lama (satu kata sandi bersama yang hanya diperiksa di browser).
   Akun disimpan di Cloudflare Worker `kpedia-ai`; admin menyetujui pendaftaran.
   Dipakai bersama oleh seluruh aplikasi dan RAKA (window.KP_AUTH). */
"use strict";
(function () {
  const API = "https://kpedia-ai.kaiproject121.workers.dev";
  const TK = "kpedia:token", OLD_TK = "kpedia:raka:token";
  const POLL_MS = 15000;

  const A = { token: null, user: null, tab: "login", view: "boot", msg: "", ok: false, busy: false };
  let poll = 0;

  const $ = (s, p = document) => p.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = n => window.phIcon(n);
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) {} }
  };

  /* ---------- API (dipakai juga oleh RAKA) ---------- */
  async function api(method, path, body) {
    let res, data;
    try {
      res = await fetch(API + path, {
        method,
        headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(A.token ? { Authorization: "Bearer " + A.token } : {}) },
        body: body ? JSON.stringify(body) : undefined
      });
      data = await res.json();
    } catch (_) {
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.");
    }
    if (res.status === 401 && A.token && !path.startsWith("/api/auth/login")) { expire(); throw new Error("Sesi berakhir. Silakan masuk lagi."); }
    if (!res.ok || data.success === false) throw new Error(data.message || "Terjadi kesalahan. Coba lagi.");
    return data;
  }

  /* ---------- Layar ---------- */
  const view = () => $("#authView");
  const field = (id, label, attrs, extra = "", icon = "user") => `<div class="af"><label class="sr-only" for="${id}">${label}</label><div class="af-box">${ic(icon)}<input id="${id}" name="${id.replace("auth", "").toLowerCase()}" ${attrs}>${extra}</div></div>`;
  const eye = `<button type="button" class="af-eye" data-auth="eye" aria-label="Tampilkan kata sandi">${ic("eye")}</button>`;

  function html() {
    if (A.view === "boot") return `<div class="auth-wait"><span class="auth-spin" aria-hidden="true"></span><p>Memeriksa sesi…</p></div>`;
    if (A.view === "pending") return `<div class="auth-state">
        <span class="auth-state-ic" aria-hidden="true">${ic("clock")}</span>
        <h1>Menunggu persetujuan</h1>
        <p>Akun <b>${esc(A.user.email)}</b> sudah terdaftar. Admin sudah diberi tahu dan akan menyetujuinya. Halaman ini akan otomatis terbuka begitu akunmu aktif.</p>
        <div class="auth-actions"><button class="btn primary" type="button" data-auth="check">Periksa status</button><button class="btn ghost" type="button" data-auth="logout">Keluar</button></div>
        <p class="auth-msg ${A.ok ? "ok" : ""}" id="authMsg" role="status" aria-live="polite">${esc(A.msg)}</p></div>`;
    const login = A.tab === "login";
    return `<div class="auth-head"><h1>${login ? "Login ke K-Pedia" : "Buat akun K-Pedia"}</h1><p>${login ? "Masuk untuk mengakses seluruh fitur." : "Cukup sekali. Setelah admin menyetujui, akunmu langsung bisa dipakai."}</p></div>
      <form id="authForm" class="auth-form" novalidate>
        ${login ? "" : field("authName", "Nama", 'autocomplete="name" maxlength="60" placeholder="Nama lengkap" required', "", "user")}
        ${field("authEmail", "Email atau username", 'type="email" autocomplete="email" autocapitalize="none" spellcheck="false" maxlength="120" placeholder="Username atau Email" required', "", "user")}
        ${field("authPassword", "Kata sandi", `type="password" autocomplete="${login ? "current-password" : "new-password"}" maxlength="100" placeholder="${login ? "Password" : "Password (minimal 10 karakter)"}" required`, eye, "lock")}
        <button class="login-btn" type="submit" id="authSubmit" ${A.busy ? "disabled" : ""}><span class="btn-label">${A.busy ? "Memproses…" : login ? "Masuk" : "Daftar dan masuk"}</span>${ic("caret-right")}</button>
        ${login ? `<div class="auth-divider"><span>atau</span></div>
        <button class="sso-btn" type="button" data-auth="soon" data-feature="Masuk dengan Google" aria-label="Sign in with Google (segera hadir)">${ic("google")}<span>Sign in with Google</span><small>Segera</small></button>` : ""}
        <p class="auth-msg ${A.ok ? "ok" : ""}" id="authMsg" role="status" aria-live="polite">${esc(A.msg)}</p>
        <div class="auth-links">
          ${login ? `<button type="button" class="auth-link" data-auth="soon" data-feature="Reset kata sandi">Lupa password?</button>` : ""}
          <span>${login ? "Belum punya akun?" : "Sudah punya akun?"} <button type="button" class="auth-link" data-auth="tab" data-v="${login ? "register" : "login"}">${login ? "Daftar" : "Masuk"}</button></span>
        </div>
      </form>`;
  }
  function render() {
    const v = view(); if (!v) return;
    v.innerHTML = html();
    const first = A.view === "auth" ? $(A.tab === "login" ? "#authEmail" : "#authName") : null;
    if (first && !matchMedia("(pointer: coarse)").matches) first.focus({ preventScroll: true });
  }
  function showScreen() {
    document.body.classList.add("login-active");
    const shell = $("#appShell"); if (shell) shell.hidden = true;
    const s = $("#loginScreen"); if (s) { s.hidden = false; s.classList.remove("login-leave"); }
  }

  /* ---------- Alur ---------- */
  function migrateLocal(uid) {
    // Data lokal lama (favorit, riwayat) tersimpan di kunci "admin". Salin ke akun pertama di perangkat ini.
    if (store.get("kpedia:migrated:v7")) return;
    for (const kind of ["favorites", "history"]) {
      const to = `tarsus:${kind}:${encodeURIComponent(uid)}`, from = `tarsus:${kind}:admin`;
      if (store.get(from) && !store.get(to)) store.set(to, store.get(from));
    }
    store.set("kpedia:migrated:v7", "1");
  }
  function enter(user) {
    A.user = user; clearInterval(poll);
    if (user.status === "active") {
      const uid = "u" + user.id;
      try { state.uid = uid; } catch (_) {}
      migrateLocal(uid);
      A.view = "app"; A.msg = "";
      const sm = $(".side-role"); if (sm) sm.textContent = user.role === "admin" ? "Administrator" : user.email;
      window.showApp(user.name, user.name);
      window.dispatchEvent(new CustomEvent("kp:auth", { detail: user }));
      return;
    }
    A.view = "pending"; A.msg = ""; showScreen(); render();
    poll = setInterval(() => check(true), POLL_MS);
  }
  function expire() { clearInterval(poll); A.token = null; A.user = null; store.set(TK, null); A.view = "auth"; A.tab = "login"; A.msg = ""; showScreen(); render(); }

  async function check(silent) {
    try {
      const r = await api("GET", "/api/auth/me");
      if (r.user.status === "active") enter(r.user);
      else if (!silent) { A.msg = "Akunmu masih menunggu persetujuan."; A.ok = false; render(); }
    } catch (e) { if (!silent) { A.msg = e.message; A.ok = false; render(); } }
  }
  function setMsg(t, ok) { A.msg = t; A.ok = !!ok; const el = $("#authMsg"); if (el) { el.textContent = t; el.classList.toggle("ok", !!ok); } }
  function setBusy(b) {
    A.busy = b;
    const btn = $("#authForm button[type=submit]"); if (!btn) return;
    btn.disabled = b; const lb = btn.querySelector(".btn-label"); if (lb) lb.textContent = b ? "Memproses…" : A.tab === "login" ? "Masuk" : "Daftar dan masuk";
  }
  async function submit(e) {
    e.preventDefault(); if (A.busy) return;
    const f = e.target, v = n => (f.elements[n]?.value || "").trim(), login = A.tab === "login";
    const email = v("email").toLowerCase(), password = f.elements.password.value, name = v("name");
    if (!login && name.length < 2) return setMsg("Nama minimal 2 karakter.");
    if (!/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setMsg("Email belum benar.");
    if (!password) return setMsg("Kata sandi belum diisi.");
    if (!login && password.length < 10) return setMsg("Kata sandi minimal 10 karakter.");
    setBusy(true); setMsg("");
    try {
      if (!login) await api("POST", "/api/auth/register", { name, email, password });
      const r = await api("POST", "/api/auth/login", { email, password });
      A.token = r.token; store.set(TK, r.token);
      A.busy = false;
      const m = window.KP_MOTION;
      if (r.user.status === "active" && m && m.canLoginCinematic()) await m.loginSuccess($("#authSubmit"), () => enter(r.user)); else enter(r.user);
    } catch (err) {
      setBusy(false); setMsg(err.message);
      const panel = $("#authCard"); panel?.classList.remove("shake"); void panel?.offsetWidth; panel?.classList.add("shake");
    }
  }
  async function logout() {
    try { if (A.token) await api("POST", "/api/auth/logout"); } catch (_) {}
    clearInterval(poll); A.token = null; A.user = null; store.set(TK, null);
    try { state.uid = null; state.user = null; } catch (_) {}
    A.view = "auth"; A.tab = "login"; A.msg = ""; showScreen(); render();
  }
  function onClick(e) {
    const b = e.target.closest("[data-auth]"); if (!b) return;
    const a = b.dataset.auth;
    if (a === "tab") { A.tab = b.dataset.v; A.msg = ""; render(); }
    else if (a === "eye") { const i = $("#authPassword"), show = i.type === "password"; i.type = show ? "text" : "password"; b.setAttribute("aria-label", show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"); b.innerHTML = ic(show ? "eye-off" : "eye"); }
    else if (a === "check") check(false);
    else if (a === "soon") { const t = b.dataset.feature || "Fitur ini"; setMsg(t + " belum tersedia. Gunakan email dan kata sandi, atau hubungi administrator.", false); window.toast?.(t + " belum tersedia.", "info"); }
    else if (a === "logout") logout();
  }

  async function start() {
    const card = $("#authCard");
    if (card && !card.dataset.ready) { card.dataset.ready = "1"; card.addEventListener("click", onClick); card.addEventListener("submit", submit); }
    A.token = store.get(TK) || store.get(OLD_TK);
    if (!A.token) { A.view = "auth"; showScreen(); render(); return; }
    store.set(TK, A.token); store.set(OLD_TK, null);
    A.view = "boot"; showScreen(); render();
    try { const r = await api("GET", "/api/auth/me"); enter(r.user); }
    catch (e) { if (A.token) { A.view = "auth"; A.msg = e.message; A.ok = false; showScreen(); render(); } }
  }

  window.KP_AUTH = { start, logout, api, get user() { return A.user; }, get token() { return A.token; } };
})();
