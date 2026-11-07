/* K-Pedia 6.6 — Akun tunggal.
   Satu akun untuk seluruh website (termasuk RAKA). Daftar dan masuk dilakukan sekali di layar login;
   token yang sama dipakai RAKA, jadi tidak ada proses masuk kedua.
   Backend: Cloudflare Worker `kpedia-ai` (endpoint /api/auth/*). */
"use strict";
(function () {
  const API = "https://kpedia-ai.kaiproject121.workers.dev";
  const TK = "kpedia:raka:token";   /* kunci lama dipertahankan agar sesi yang sudah ada tetap berlaku */
  const UK = "kpedia:user";

  const rd = k => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const wr = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) {} };

  let token = rd(TK), user = null;
  try { user = JSON.parse(rd(UK) || "null"); } catch (_) { user = null; }

  function save(t, u) { token = t; user = u; wr(TK, t); wr(UK, u ? JSON.stringify(u) : null); }
  function clear() { save(null, null); }

  async function api(method, path, body) {
    let res, data;
    try {
      res = await fetch(API + path, {
        method,
        headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: body ? JSON.stringify(body) : undefined
      });
      data = await res.json();
    } catch (_) {
      const e = new Error("Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.");
      e.network = true; throw e;
    }
    if (res.status === 401 && token && !path.startsWith("/api/auth/login")) {
      clear(); window.dispatchEvent(new CustomEvent("kp-auth-expired"));
      const e = new Error("Sesi berakhir. Silakan masuk lagi."); e.expired = true; throw e;
    }
    if (!res.ok || data.success === false) throw new Error(data.message || "Terjadi kesalahan. Coba lagi.");
    return data;
  }

  const KP_AUTH = {
    api,
    get token() { return token; },
    get user() { return user; },
    get isAdmin() { return user?.role === "admin"; },
    get isActive() { return user?.status === "active"; },

    async login(email, password) {
      const r = await api("POST", "/api/auth/login", { email: String(email).trim(), password });
      save(r.token, r.user); return r.user;
    },

    /* Daftar sekali, lalu langsung masuk dengan data yang sama. */
    async register(name, email, password) {
      email = String(email).trim();
      const r = await api("POST", "/api/auth/register", { name: String(name).trim(), email, password });
      try { return { user: await KP_AUTH.login(email, password), message: r.message }; }
      catch (e) { if (e.network) throw e; const err = new Error(r.message || "Pendaftaran berhasil. Silakan masuk setelah akun disetujui."); err.registered = true; throw err; }
    },

    async me() { const r = await api("GET", "/api/auth/me"); save(token, r.user); return r.user; },

    async logout() { try { await api("POST", "/api/auth/logout"); } catch (_) {} clear(); }
  };

  window.KP_AUTH = KP_AUTH;
})();
