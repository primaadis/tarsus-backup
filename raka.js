/* K-Pedia — RAKA (Railway Assistant KAI)
   Modul terpisah: tidak mengubah fitur lama. Dipanggil dari app.js lewat window.KP_RAKA.open().
   Alur: pertanyaan -> cari di data lokal (ensiklopedia, FAQ, stasiun, tarif) di browser
   -> kirim ke Worker -> AI menjawab dari data itu; bila tidak ada, Worker mencari di internet
   (hanya domain resmi) dan menandai jawabannya. */
"use strict";
(function () {
  const API = "https://kpedia-ai.kaiproject121.workers.dev";
  const TK = "kpedia:raka:token";
  const SUGGEST = ["Berapa batas bagasi gratis?", "Cara membatalkan tiket", "Apakah bayi perlu tiket?", "Tarif kereta dari Bandung ke Yogyakarta"];

  const S = { token: null, user: null, view: "boot", tab: "login", msgs: [], convId: null, busy: false, showHistory: false, history: [], admin: false, adminTab: "users", adminData: null };
  let root = null;

  const $ = (s, p = document) => p.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const toast = (m, t = "info") => (window.kpToast ? window.kpToast(m, t) : null);
  const safeUrl = u => (/^https:\/\//i.test(u || "") ? u : "#");
  const getToken = () => { try { return localStorage.getItem(TK); } catch (_) { return null; } };
  const setToken = t => { try { t ? localStorage.setItem(TK, t) : localStorage.removeItem(TK); } catch (_) {} };

  /* ---------- API ---------- */
  async function api(method, path, body) {
    let res, data;
    try {
      res = await fetch(API + path, {
        method,
        headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(S.token ? { Authorization: "Bearer " + S.token } : {}) },
        body: body ? JSON.stringify(body) : undefined
      });
      data = await res.json();
    } catch (_) {
      throw new Error("Tidak dapat terhubung ke server RAKA. Periksa koneksi internet lalu coba lagi.");
    }
    if (res.status === 401 && S.token && !path.startsWith("/api/auth/login")) { logoutLocal(); render(); throw new Error("Sesi berakhir. Silakan masuk lagi."); }
    if (!res.ok || data.success === false) throw new Error(data.message || "Terjadi kesalahan. Coba lagi.");
    return data;
  }
  function logoutLocal() { S.token = null; S.user = null; S.msgs = []; S.convId = null; S.admin = false; S.view = "auth"; setToken(null); }

  /* ---------- Pencarian data lokal (di browser) ---------- */
  const normQ = s => " " + String(s || "").toLocaleLowerCase("id-ID").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim() + " ";
  const clip = (t, n) => String(t || "").replace(/\s+\n/g, "\n").trim().slice(0, n);

  function wikiSection(entry, heading) {
    const body = String(entry.isi || entry.ISI || "");
    if (heading) {
      const parts = body.split(/^##\s+/m).slice(1);
      const hit = parts.find(p => p.split("\n")[0].trim() === heading);
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
  const localContext = q => [...tariffContext(q), ...stationContext(q), ...wikiContext(q)].slice(0, 6);

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
  const TAGS = { local: ["local", "Dari data K-Pedia"], web: ["web", "Dari internet · sumber resmi"], none: ["none", "Belum ditemukan"] };
  function botHTML(m) {
    if (m.loading) return `<div class="raka-row bot"><div class="raka-bubble" aria-live="polite"><span class="raka-dots" aria-label="RAKA sedang mencari"><i></i><i></i><i></i></span></div></div>`;
    if (m.error) return `<div class="raka-row bot"><div class="raka-bubble"><p class="raka-err">${esc(m.error)}</p></div></div>`;
    const parts = (m.parts || []).map(p => {
      const tag = TAGS[p.origin];
      return `<div class="raka-part">${tag ? `<span class="raka-tag ${tag[0]}">${tag[1]}</span>` : ""}${fmt(p.text)}</div>`;
    }).join("");
    const src = (m.sources || []).map(s => /^https:\/\//i.test(s.url || "") ? `<a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>` : `<span>${esc(s.label || s.title)}</span>`).join("");
    return `<div class="raka-row bot"><div class="raka-bubble">${parts}${src ? `<div class="raka-src">${src}</div>` : ""}</div></div>`;
  }
  const msgHTML = m => m.role === "user" ? `<div class="raka-row user"><div class="raka-bubble"><p>${esc(m.text)}</p></div></div>` : botHTML(m);

  /* ---------- Layar ---------- */
  function head(extra = "") {
    return `<div class="raka-head"><span class="raka-avatar" aria-hidden="true">${ic("train")}</span><div class="raka-title"><strong>RAKA</strong><small>Railway Assistant KAI</small></div>${extra}</div>`;
  }
  function viewAuth() {
    const login = S.tab === "login";
    return `<div class="raka-wrap">${head()}
      <div class="raka-card"><div class="raka-tabs" role="tablist"><button type="button" data-act="tab" data-v="login" class="${login ? "active" : ""}">Masuk</button><button type="button" data-act="tab" data-v="register" class="${login ? "" : "active"}">Daftar</button></div>
      <form data-form="${login ? "login" : "register"}" novalidate>
        <div class="raka-card" style="padding:0;box-shadow:none;background:none">
          <p>${login ? "Masuk dengan akun RAKA untuk mulai bertanya." : "Pendaftaran akan diperiksa administrator sebelum RAKA bisa dipakai."}</p>
          ${login ? "" : `<label>Nama<input name="name" autocomplete="name" maxlength="60" required></label>`}
          <label>Email<input name="email" type="email" autocomplete="email" maxlength="120" required></label>
          <label>Kata sandi<input name="password" type="password" autocomplete="${login ? "current-password" : "new-password"}" maxlength="100" ${login ? "" : 'placeholder="Minimal 10 karakter"'} required></label>
          <button class="clay-btn primary" type="submit">${login ? "Masuk" : "Kirim pendaftaran"}</button>
          <p class="raka-msg" id="rakaMsg" aria-live="polite"></p>
        </div></form></div></div>`;
  }
  function viewPending() {
    return `<div class="raka-wrap">${head()}<div class="raka-card"><h2>Menunggu persetujuan</h2>
      <p>Akun <b>${esc(S.user.email)}</b> sudah terdaftar dan sedang diperiksa administrator. RAKA bisa dipakai setelah akun disetujui.</p>
      <div class="raka-tools"><button class="clay-btn primary" data-act="refresh" type="button">Periksa status</button><button class="clay-btn ghost" data-act="logout" type="button">Keluar</button></div><p class="raka-msg" id="rakaMsg" aria-live="polite"></p></div></div>`;
  }
  function viewChat() {
    const tools = `<div class="raka-tools"><button class="clay-btn ghost" data-act="new" type="button">Percakapan baru</button><button class="clay-btn ghost" data-act="history" type="button">Riwayat</button>${S.user.role === "admin" ? `<button class="clay-btn ghost" data-act="admin" type="button">Admin</button>` : ""}<button class="clay-btn ghost" data-act="logout" type="button">Keluar</button></div>`;
    const hist = S.showHistory ? `<div class="raka-card"><h2>Riwayat percakapan</h2><div class="raka-list">${S.history.length ? S.history.map(h => `<div class="raka-item"><div><strong>${esc(h.title)}</strong><small>${new Date(h.updated_at * 1000).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</small></div><div class="acts"><button class="go" data-act="open" data-id="${esc(h.id)}" type="button">Buka</button><button class="bad" data-act="del" data-id="${esc(h.id)}" type="button">Hapus</button></div></div>`).join("") : "<p>Belum ada percakapan.</p>"}</div></div>` : "";
    const empty = `<div class="raka-empty"><span class="raka-avatar" aria-hidden="true">${ic("train")}</span><h2>Tanya apa saja soal kereta api</h2><p>RAKA mencari di data K-Pedia lebih dulu. Bila belum ada, RAKA memberi tahu dan mencari di sumber resmi di internet.</p><div class="suggest-row">${SUGGEST.map(s => `<button type="button" data-act="suggest" data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div></div>`;
    return `<div class="raka-wrap">${head(tools)}${hist}
      <div class="raka-msgs" id="rakaMsgs" aria-live="polite">${S.msgs.length ? S.msgs.map(msgHTML).join("") : empty}</div>
      <form class="raka-composer" data-form="ask"><textarea id="rakaInput" rows="1" maxlength="1000" placeholder="Tanya soal kereta api…" aria-label="Pertanyaan untuk RAKA"></textarea><button class="clay-btn primary" type="submit" ${S.busy ? "disabled" : ""}>Kirim</button></form>
      <p class="raka-note">RAKA bukan layanan resmi KAI. Tarif dan aturan dapat berubah; pastikan ke KAI 121 atau Access by KAI.</p></div>`;
  }

  /* ---------- Panel admin ---------- */
  const ADMIN_TABS = [["users", "Pengguna"], ["cand", "Kandidat internet"], ["kb", "Pengetahuan"], ["set", "Pengaturan"]];
  function viewAdmin() {
    const d = S.adminData, t = S.adminTab;
    let body = `<p>Memuat…</p>`;
    if (d) {
      if (t === "users") body = `<div class="raka-list">${d.users.length ? d.users.map(u => `<div class="raka-item"><div><strong>${esc(u.name)}</strong><small>${esc(u.email)} · ${esc(u.status)}${u.role === "admin" ? " · admin" : ""}</small></div><div class="acts">${u.role === "admin" ? "" : u.status === "pending" ? `<button class="go" data-act="ua" data-a="approve" data-id="${u.id}" type="button">Setujui</button><button class="bad" data-act="ua" data-a="reject" data-id="${u.id}" type="button">Tolak</button>` : u.status === "active" ? `<button class="bad" data-act="ua" data-a="suspend" data-id="${u.id}" type="button">Tangguhkan</button>` : `<button data-act="ua" data-a="reactivate" data-id="${u.id}" type="button">Aktifkan</button>`}</div></div>`).join("") : "<p>Belum ada pengguna.</p>"}</div>`;
      if (t === "cand") body = `<p>Jawaban dari internet yang menunggu keputusan Anda. “Tambahkan” memasukkannya ke pengetahuan RAKA; “Lewati” membuangnya.</p><div class="raka-list">${d.cand.length ? d.cand.map(c => `<div class="raka-item" style="align-items:flex-start;flex-wrap:wrap"><div><strong>${esc(c.topic)}</strong><small>${esc(clip(c.answer, 420))}</small><div class="raka-src" style="margin-top:6px">${c.sources.map(s => `<a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`).join("")}</div></div><div class="acts"><button class="go" data-act="ca" data-a="approve" data-id="${c.id}" type="button">Tambahkan</button><button class="bad" data-act="ca" data-a="reject" data-id="${c.id}" type="button">Lewati</button></div></div>`).join("") : "<p>Tidak ada kandidat.</p>"}</div>`;
      if (t === "kb") body = `<form data-form="kb" class="raka-card" style="padding:0;box-shadow:none;background:none"><label>Judul<input name="title" maxlength="120" required></label><label>Isi (teks)<textarea name="content" maxlength="6000" required></textarea></label><label>Sumber (opsional)<input name="source" maxlength="300"></label><button class="clay-btn primary" type="submit">Simpan pengetahuan</button><p class="raka-msg" id="rakaMsg" aria-live="polite"></p></form><div class="raka-list">${d.kb.map(k => `<div class="raka-item"><div><strong>${esc(k.title)}</strong><small>${esc(k.origin === "web" ? "dari internet" : "admin")} · ${esc(k.status)} · ${esc(clip(k.content, 100))}</small></div><div class="acts"><button class="bad" data-act="kdel" data-id="${k.id}" type="button">Hapus</button></div></div>`).join("")}</div>`;
      if (t === "set") { const s = d.set; body = `<div class="raka-list">${[["ai_enabled", "RAKA / AI aktif"], ["registration_enabled", "Pendaftaran dibuka"], ["raka_web_enabled", "Cari di internet bila data lokal tidak ada"]].map(([k, l]) => `<label class="raka-switch"><span>${l}</span><input type="checkbox" data-act="toggle" data-k="${k}" ${s[k] === "true" ? "checked" : ""}></label>`).join("")}</div>
        <form data-form="domains" class="raka-card" style="padding:0;box-shadow:none;background:none"><label>Domain sumber tepercaya (pisahkan koma)<input name="domains" value="${esc(s.trusted_domains)}"></label><button class="clay-btn primary" type="submit">Simpan domain</button><p class="raka-msg" id="rakaMsg" aria-live="polite"></p></form>`; }
    }
    return `<div class="raka-wrap">${head(`<div class="raka-tools"><button class="clay-btn ghost" data-act="back" type="button">Kembali ke chat</button></div>`)}
      <div class="raka-card"><h2>Panel admin</h2><div class="raka-tabs">${ADMIN_TABS.map(([k, l]) => `<button type="button" data-act="atab" data-v="${k}" class="${k === t ? "active" : ""}">${l}</button>`).join("")}</div>${body}</div></div>`;
  }
  async function loadAdmin() {
    try {
      const [u, c, k, s] = await Promise.all([api("GET", "/api/admin/users"), api("GET", "/api/admin/candidates"), api("GET", "/api/admin/knowledge"), api("GET", "/api/admin/settings")]);
      S.adminData = { users: u.users, cand: c.items, kb: k.items, set: s.settings };
    } catch (e) { toast(e.message, "error"); }
    if (S.admin) render();
  }

  /* ---------- Render & aksi ---------- */
  function render() {
    if (!root) return;
    const v = S.view === "chat" ? (S.admin ? viewAdmin() : viewChat()) : S.view === "pending" ? viewPending() : S.view === "auth" ? viewAuth() : `<div class="raka-wrap">${head()}<p>Memeriksa sesi…</p></div>`;
    root.innerHTML = v;
    const box = $("#rakaMsgs", root); if (box && S.msgs.length) window.scrollTo({ top: document.body.scrollHeight, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function enter(user) { S.user = user; S.view = user.status === "active" ? "chat" : "pending"; render(); }
  const say = (t, ok) => { const el = $("#rakaMsg", root); if (el) { el.textContent = t; el.classList.toggle("ok", !!ok); } };

  async function ask(q) {
    q = String(q || "").trim(); if (!q || S.busy) return;
    S.busy = true; S.msgs.push({ role: "user", text: q }); S.msgs.push({ role: "bot", loading: true }); render();
    try {
      const r = await api("POST", "/api/raka/ask", { message: q, conversation_id: S.convId || undefined, local_context: localContext(q) });
      S.convId = r.conversation_id; S.msgs[S.msgs.length - 1] = { role: "bot", parts: r.parts, sources: r.sources };
    } catch (e) { S.msgs[S.msgs.length - 1] = { role: "bot", error: e.message }; }
    S.busy = false; render(); $("#rakaInput", root)?.focus();
  }
  async function openConv(id) {
    try {
      const r = await api("GET", "/api/conversations/" + encodeURIComponent(id));
      S.convId = id; S.showHistory = false;
      S.msgs = r.messages.map(m => m.role === "user" ? { role: "user", text: m.content } : { role: "bot", parts: m.meta?.parts || [{ origin: "plain", text: m.content }], sources: m.meta?.sources || [] });
      render();
    } catch (e) { toast(e.message, "error"); }
  }
  async function confirmDo(o) { return window.kpConfirm ? window.kpConfirm(o) : Promise.resolve(window.confirm(o.message)); }

  async function onSubmit(e) {
    const f = e.target.closest("[data-form]"); if (!f) return; e.preventDefault();
    const kind = f.dataset.form, fd = Object.fromEntries(new FormData(f));
    const btn = f.querySelector("button[type=submit]");
    try {
      if (kind === "ask") { const ta = $("#rakaInput", root); const q = ta.value; ta.value = ""; ta.style.height = "auto"; await ask(q); return; }
      btn && (btn.disabled = true);
      if (kind === "login") { const r = await api("POST", "/api/auth/login", { email: fd.email, password: fd.password }); S.token = r.token; setToken(r.token); enter(r.user); }
      else if (kind === "register") { const r = await api("POST", "/api/auth/register", { name: fd.name, email: fd.email, password: fd.password }); f.reset(); say(r.message + " Setelah disetujui, silakan masuk.", true); }
      else if (kind === "kb") { await api("POST", "/api/admin/knowledge", { title: fd.title, content: fd.content, source: fd.source }); toast("Pengetahuan disimpan", "success"); await loadAdmin(); }
      else if (kind === "domains") { await api("PUT", "/api/admin/settings", { trusted_domains: fd.domains }); toast("Domain disimpan", "success"); await loadAdmin(); }
    } catch (err) { say(err.message); toast(err.message, "error"); }
    finally { btn && (btn.disabled = false); }
  }

  async function onClick(e) {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const a = el.dataset.act, id = el.dataset.id;
    try {
      if (a === "tab") { S.tab = el.dataset.v; render(); }
      else if (a === "logout") { try { await api("POST", "/api/auth/logout"); } catch (_) {} logoutLocal(); render(); }
      else if (a === "refresh") { const r = await api("GET", "/api/auth/me"); enter(r.user); if (r.user.status !== "active") say("Akun masih menunggu persetujuan."); }
      else if (a === "new") { S.msgs = []; S.convId = null; S.showHistory = false; render(); }
      else if (a === "history") { S.showHistory = !S.showHistory; if (S.showHistory) { const r = await api("GET", "/api/conversations"); S.history = r.conversations; } render(); }
      else if (a === "open") await openConv(id);
      else if (a === "del") { if (await confirmDo({ title: "Hapus percakapan?", message: "Percakapan ini dihapus permanen.", tone: "danger", confirmText: "Hapus" })) { await api("DELETE", "/api/conversations/" + encodeURIComponent(id)); if (S.convId === id) { S.msgs = []; S.convId = null; } S.history = S.history.filter(h => h.id !== id); render(); } }
      else if (a === "suggest") await ask(el.dataset.q);
      else if (a === "admin") { S.admin = true; S.adminData = null; render(); loadAdmin(); }
      else if (a === "back") { S.admin = false; render(); }
      else if (a === "atab") { S.adminTab = el.dataset.v; render(); }
      else if (a === "ua") { await api("POST", `/api/admin/users/${id}/${el.dataset.a}`); toast("Tersimpan", "success"); await loadAdmin(); }
      else if (a === "ca") { await api("POST", `/api/admin/candidates/${id}/${el.dataset.a}`); toast(el.dataset.a === "approve" ? "Ditambahkan ke pengetahuan" : "Dilewati", "success"); await loadAdmin(); }
      else if (a === "kdel") { if (await confirmDo({ title: "Hapus pengetahuan?", message: "Data ini tidak akan dipakai RAKA lagi.", tone: "danger", confirmText: "Hapus" })) { await api("DELETE", "/api/admin/knowledge/" + id); await loadAdmin(); } }
    } catch (err) { toast(err.message, "error"); say(err.message); }
  }
  async function onChange(e) {
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

  async function open() {
    root = document.getElementById("rakaRoot"); if (!root) return;
    if (!root.dataset.ready) {
      root.dataset.ready = "1";
      root.addEventListener("click", onClick); root.addEventListener("submit", onSubmit); root.addEventListener("change", onChange);
      root.addEventListener("keydown", onKey); root.addEventListener("input", onInput);
    }
    S.token = S.token || getToken();
    if (S.user) { render(); return; }
    if (!S.token) { S.view = "auth"; render(); return; }
    S.view = "boot"; render();
    try { const r = await api("GET", "/api/auth/me"); enter(r.user); }
    catch (e) { if (S.token) { S.view = "auth"; render(); say(e.message); } }
  }

  window.KP_RAKA = { open, localContext };
})();
