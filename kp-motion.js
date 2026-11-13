/* K-Pedia — gerak (GSAP 3). Semua animasi memakai transform/opacity dan punya cadangan tanpa GSAP.
   Isi: transisi login sinematik, transisi halaman, hover/klik menu, parallax hero, RAKA 3D, tombol tema. */
"use strict";
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasG = () => !!window.gsap && !reduced();
  const fine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
  const M = { busy: false, raka: null };

  /* ---------- Latar sinematik beranda (SVG prosedural: lintasan, tiang listrik, cahaya) ---------- */
  function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  function vista() {
    const W = 1600, H = 720, VX = 1060, VY = 330, r = rng(7), o = [];
    o.push(`<svg class="vista" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>
      <linearGradient id="vSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040c24"/><stop offset=".55" stop-color="#0b2a6b"/><stop offset="1" stop-color="#2a5fd0"/></linearGradient>
      <radialGradient id="vGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd9a3" stop-opacity=".95"/><stop offset=".25" stop-color="#ff9a2e" stop-opacity=".55"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></radialGradient>
      <linearGradient id="vGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14346f"/><stop offset=".25" stop-color="#0a1f4d"/><stop offset="1" stop-color="#050f2c"/></linearGradient>
      <linearGradient id="vRail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fc0ff" stop-opacity=".9"/><stop offset="1" stop-color="#dfeaff" stop-opacity=".35"/></linearGradient>
      <linearGradient id="vStreak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffb347" stop-opacity="0"/><stop offset=".5" stop-color="#ffd08a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#vSky)"/>`);
    // bintang/bokeh halus
    o.push('<g class="pl pl-far">');
    for (let i = 0; i < 46; i++) o.push(`<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * 250).toFixed(0)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="#fff" opacity="${(0.15 + r() * 0.5).toFixed(2)}"/>`);
    // siluet kota/stasiun jauh
    let x = -20; while (x < W + 40) { const w = 26 + r() * 70, h = 20 + r() * 90; o.push(`<rect x="${x.toFixed(0)}" y="${(VY - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="#0a2263" opacity="${(0.55 + r() * 0.3).toFixed(2)}"/>`); if (r() > .55) for (let k = 0; k < 4; k++) o.push(`<rect x="${(x + 4 + r() * (w - 10)).toFixed(0)}" y="${(VY - h + 6 + r() * (h - 14)).toFixed(0)}" width="3" height="3" fill="${r() > .5 ? "#ffcf8a" : "#cfe0ff"}" opacity=".75"/>`); x += w + 3 + r() * 14; }
    o.push('<path d="M120 ' + VY + 'Q 420 ' + (VY - 90) + ' 760 ' + (VY - 40) + ' T 1400 ' + VY + ' L1400 ' + VY + 'Z" fill="#0b2766" opacity=".6"/></g>');
    o.push(`<rect y="${VY}" width="${W}" height="${H - VY}" fill="url(#vGround)"/>`);
    o.push(`<circle class="glow-core" cx="${VX}" cy="${VY}" r="260" fill="url(#vGlow)"/><circle cx="${VX}" cy="${VY}" r="9" fill="#fff3dd"/>`);
    // lintasan (3 jalur konvergen ke titik hilang)
    const rails = [], ties = [], poles = [], Hb = H - VY;
    const tracks = [-380, 330, 1060, 1790, 2500]; // posisi x di dasar (y=H)
    const sx = (xb, y) => VX + (xb - VX) * (y - VY) / Hb;
    const gw = 70; // setengah lebar sepur di dasar
    for (const xb of tracks) { for (const sgn of [-1, 1]) rails.push(`<line x1="${VX}" y1="${VY}" x2="${xb + sgn * gw}" y2="${H}" stroke="url(#vRail)" stroke-width="2.4"/>`); }
    for (let i = 1; i < 34; i++) { const t = Math.pow(i / 34, 2.1), y = VY + t * Hb; for (const xb of tracks) { const cx = sx(xb, y), w = gw * (y - VY) / Hb * 1.5; ties.push(`<line x1="${(cx - w).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(cx + w).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#6f93dd" stroke-width="${(0.6 + t * 3).toFixed(1)}" opacity="${(0.18 + t * 0.4).toFixed(2)}"/>`); } }
    o.push('<g class="pl pl-mid">' + ties.join("") + rails.join("") + "</g>");
    // tiang listrik aliran atas (kiri kanan jalur tengah)
    for (let i = 2; i < 16; i++) { const t = Math.pow(i / 16, 2.0), y = VY + t * Hb, h = 14 + t * 330, sc = 0.2 + t * 1.9; for (const xb of [tracks[1] + 255, tracks[2] - 255]) { const cx = sx(xb, y), top = y - h; poles.push(`<g opacity="${(0.35 + t * 0.55).toFixed(2)}"><line x1="${cx.toFixed(1)}" y1="${y.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${top.toFixed(1)}" stroke="#7fa6ee" stroke-width="${(1 + sc * 2.4).toFixed(1)}"/><line x1="${(cx - 55 * sc).toFixed(1)}" y1="${(top + 6 * sc).toFixed(1)}" x2="${(cx + 55 * sc).toFixed(1)}" y2="${(top + 6 * sc).toFixed(1)}" stroke="#7fa6ee" stroke-width="${(0.8 + sc * 1.6).toFixed(1)}"/><circle cx="${(cx + 40 * sc).toFixed(1)}" cy="${(top + 10 * sc).toFixed(1)}" r="${(1.5 + sc * 2.2).toFixed(1)}" fill="#ffcf8a"/></g>`); } }
    o.push('<g class="pl pl-near">' + poles.join("") + "</g>");
    // kabel lintas
    o.push(`<path d="M${VX} ${VY - 8}L${tracks[1] + 255 > 0 ? 0 : 0} ${VY - 190}M${VX} ${VY - 8}L${W} ${VY - 220}" stroke="#7fa6ee" stroke-width="1" opacity=".35" fill="none"/>`);
    // jejak cahaya kereta
    o.push(`<rect class="streak" x="${VX - 520}" y="${VY + 26}" width="460" height="3" rx="2" fill="url(#vStreak)"/><rect class="streak" x="${VX - 80}" y="${VY + 52}" width="520" height="2.5" rx="2" fill="url(#vStreak)"/>`);
    // bokeh hangat
    o.push('<g class="pl pl-bokeh">'); for (let i = 0; i < 16; i++) o.push(`<circle cx="${(500 + r() * 1000).toFixed(0)}" cy="${(220 + r() * 300).toFixed(0)}" r="${(6 + r() * 20).toFixed(0)}" fill="${r() > .5 ? "#ffb347" : "#6ea2ff"}" opacity="${(0.05 + r() * 0.12).toFixed(2)}"/>`); o.push("</g></svg>");
    return o.join("");
  }
  function mountHero() {
    const bg = $("#heroBg"); if (!bg || bg.dataset.ready) return; bg.dataset.ready = "1"; bg.innerHTML = vista();
    const hero = $("#hero");
    if (hasG() && fine()) {
      const layers = [[".pl-far", 10], [".pl-bokeh", 22], [".pl-mid", 18], [".pl-near", 32]].map(([s, k]) => ({ el: $(s, bg), k, x: gsap.quickTo($(s, bg), "x", { duration: .9, ease: "power3.out" }), y: gsap.quickTo($(s, bg), "y", { duration: .9, ease: "power3.out" }) }));
      hero.addEventListener("pointermove", e => { const r = hero.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5; layers.forEach(l => { l.x(-nx * l.k); l.y(-ny * l.k * .5); }); }, { passive: true });
      hero.addEventListener("pointerleave", () => layers.forEach(l => { l.x(0); l.y(0); }));
    }
    const host = $("#heroRaka");
    if (host && window.KPRaka3D) M.raka = KPRaka3D.mount(host, { greetDelay: 1200 });
  }

  /* ---------- Menu tools: hover dan klik (GSAP) ---------- */
  function wireTiles() {
    const grid = $("#toolGrid"); if (!grid || grid.dataset.wired) return; grid.dataset.wired = "1";
    grid.addEventListener("pointermove", e => { const t = e.target.closest(".tool-tile"); if (!t || e.pointerType === "touch") return; const r = t.getBoundingClientRect(); t.style.setProperty("--mx", (e.clientX - r.left) + "px"); t.style.setProperty("--my", (e.clientY - r.top) + "px"); }, { passive: true });
    if (!window.gsap) return;
    grid.addEventListener("pointerover", e => { const t = e.target.closest(".tool-tile"); if (!t || e.pointerType === "touch" || t.contains(e.relatedTarget) || !hasG()) return; gsap.to(t, { y: -5, duration: .35, ease: "power3.out", overwrite: "auto" }); gsap.to($(".tool-ic", t), { rotate: -7, scale: 1.08, duration: .4, ease: "back.out(2)", overwrite: "auto" }); });
    grid.addEventListener("pointerout", e => { const t = e.target.closest(".tool-tile"); if (!t || t.contains(e.relatedTarget) || !hasG()) return; gsap.to(t, { y: 0, duration: .4, ease: "power3.out", overwrite: "auto" }); gsap.to($(".tool-ic", t), { rotate: 0, scale: 1, duration: .4, ease: "power3.out", overwrite: "auto" }); });
    grid.addEventListener("pointerdown", e => { const t = e.target.closest(".tool-tile"); if (t && hasG()) gsap.to(t, { scale: .97, duration: .12, ease: "power2.out", overwrite: "auto" }); });
    const release = e => { const t = e.target.closest?.(".tool-tile"); if (t && hasG()) gsap.to(t, { scale: 1, duration: .6, ease: "elastic.out(1,.45)", overwrite: "auto" }); };
    grid.addEventListener("pointerup", release); grid.addEventListener("pointercancel", release);
    grid.addEventListener("click", e => { const t = e.target.closest(".tool-tile"); if (!t || !hasG()) return; M.raka?.react?.(); gsap.fromTo($(".tool-go, .soon-tag", t), { scale: .6 }, { scale: 1, duration: .5, ease: "back.out(3)" }); });
  }

  /* ---------- Transisi halaman ---------- */
  function pageEnter(el) {
    if (!hasG()) return false;
    const kids = [...el.children].filter(c => !c.hidden && c.offsetParent !== null);
    gsap.killTweensOf(kids); gsap.fromTo(kids.slice(0, 8), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .5, ease: "power3.out", stagger: .06, clearProps: "opacity,visibility,transform" });
    if (el.id === "page-home") { mountHero(); wireTiles(); gsap.from(".hero-copy > *", { y: 22, autoAlpha: 0, duration: .6, ease: "power3.out", stagger: .07, clearProps: "all" }); gsap.from(".tool-tile", { y: 24, autoAlpha: 0, duration: .5, ease: "power3.out", stagger: .045, delay: .25, clearProps: "opacity,visibility,transform" }); }
    return true;
  }

  /* ---------- Transisi login sinematik ---------- */
  const canLoginCinematic = () => hasG() && !M.busy;
  function loginSuccess(btn, onEnter) {
    return new Promise(resolve => {
      if (!canLoginCinematic() || !btn || !btn.isConnected) { onEnter(); return resolve(); }
      M.busy = true;
      const shell = $("#appShell"), login = $("#loginScreen"), r = btn.getBoundingClientRect(), vw = innerWidth, vh = innerHeight, D = Math.round(r.height);
      const veil = document.createElement("div"); veil.className = "kp-veil";
      const morph = document.createElement("div"); morph.className = "kp-morph"; morph.innerHTML = '<span class="m-label">Masuk</span><img src="assets/logo.png" alt="">';
      Object.assign(morph.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", borderRadius: r.height / 2 + "px" });
      document.body.append(veil, morph); btn.style.visibility = "hidden";
      const cx = vw / 2, cy = Math.max(52, Math.min(vh * .13, 96)), S = 1.18, R0 = D * S / 2, Rmax = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) + 60;
      const proxy = { r: R0 }, img = $("img", morph), label = $(".m-label", morph);
      gsap.set(img, { scale: .4 });
      let finished = false;
      const cleanup = () => {
        if (finished) return; finished = true;
        shell.style.clipPath = ""; shell.classList.remove("app-reveal"); document.body.classList.remove("kp-cinema");
        login.hidden = true; login.classList.remove("login-leave"); veil.remove(); morph.remove(); btn.style.visibility = ""; M.busy = false;
        $$(".login-float").forEach(x => gsap.killTweensOf(x)); gsap.killTweensOf("#loginRaka, #loginBubble");
        const home = $("#page-home"); if (home && home.classList.contains("active")) { mountHero(); wireTiles(); gsap.from(".hero-copy > *", { y: 26, autoAlpha: 0, duration: .7, ease: "power3.out", stagger: .08, clearProps: "all" }); gsap.from(".tool-tile, .info-section", { y: 28, autoAlpha: 0, duration: .6, ease: "power3.out", stagger: .05, delay: .2, clearProps: "opacity,visibility,transform" }); }
        resolve();
      };
      const tl = gsap.timeline({ defaults: { ease: "power3.inOut" }, onComplete: cleanup });
      tl.to(veil, { opacity: .84, duration: .3, ease: "power1.out" })                                              // 2. sekitar menggelap
        .to(morph, { boxShadow: "0 0 0 12px rgba(255,154,46,.28), 0 24px 64px -6px rgba(251,131,18,.95)", duration: .26, ease: "power2.out" }, 0.04) // 3. fokus pada tombol
        .to(label, { autoAlpha: 0, duration: .12 }, .2)                                                              // 5. tulisan Masuk hilang
        .to(morph, { width: D, left: r.left + r.width / 2 - D / 2, borderRadius: D / 2, duration: .36 }, .2)       // 4. tombol menjadi lingkaran
        .to(morph, { backgroundImage: "none", backgroundColor: "#ffffff", duration: .2, ease: "none" }, .3)
        .to(img, { opacity: 1, scale: 1, duration: .26, ease: "back.out(2)" }, .36)                                  // 5. logo K muncul
        .to(morph, { left: cx - D / 2, top: cy - D / 2, scale: S, duration: .5 }, .66)                               // 6. pindah ke atas halaman
        .add(() => { shell.classList.add("app-reveal"); document.body.classList.add("kp-cinema"); shell.style.clipPath = `circle(${R0}px at ${cx}px ${cy}px)`; onEnter(); window.scrollTo(0, 0); }, 1.16)
        .to(proxy, { r: Rmax, duration: .78, ease: "power2.inOut", onUpdate: () => { if (finished) return; shell.style.clipPath = `circle(${proxy.r.toFixed(1)}px at ${cx}px ${cy}px)`; } }, 1.2) // 7-8. lingkaran membesar = reveal beranda
        .to(morph, { autoAlpha: 0, duration: .24, ease: "power1.out" }, 1.2)
        .to(veil, { opacity: 0, duration: .5, ease: "power1.out" }, 1.3);
      setTimeout(() => { if (!finished) { try { tl.kill(); } catch (_) {} onEnter(); cleanup(); } }, 5200 * (window.__kpTimeScale || 1)); // pengaman
    });
  }

  /* ---------- Adegan login: RAKA duduk menyapa ---------- */
  function loginScene() {
    const raka = $("#loginRaka"), bub = $("#loginBubble"), card = $("#authCard"); if (!raka || !window.gsap || reduced() || raka.dataset.on) return; raka.dataset.on = "1";
    gsap.fromTo(raka, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, ease: "power3.out", delay: .1, onComplete: () => gsap.to(raka, { y: -7, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 }) });
    gsap.fromTo(bub, { scale: .4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .6, ease: "back.out(2.2)", delay: .7, onComplete: () => gsap.to(bub, { y: -4, rotate: -1.2, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 }) });
    gsap.from(".login-right > *", { y: 18, autoAlpha: 0, duration: .55, ease: "power3.out", stagger: .06, delay: .25, clearProps: "all" });
    if (fine()) { const x = gsap.quickTo(raka, "x", { duration: .8, ease: "power3.out" }); card.addEventListener("pointermove", e => { const rr = card.getBoundingClientRect(); x(((e.clientX - rr.left) / rr.width - .5) * -14); }, { passive: true }); }
  }
  function watchLogin() {
    const l = $("#loginScreen"); if (!l) return;
    const run = () => { if (!l.hidden) { document.body.classList.add("login-active"); loginScene(); } else { const r = $("#loginRaka"); if (r) { delete r.dataset.on; window.gsap?.killTweensOf?.(r); } } };
    new MutationObserver(run).observe(l, { attributes: true, attributeFilter: ["hidden"] }); run();
  }

  /* ---------- Tema, avatar, progres gulir ---------- */
  function toggleTheme(btn) {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark", apply = () => window.applyTheme(next, true, false);
    if (!document.startViewTransition || reduced()) { apply(); return; }
    const r = btn.getBoundingClientRect(); document.documentElement.style.setProperty("--tx", ((r.left + r.width / 2) / innerWidth * 100).toFixed(1) + "%"); document.documentElement.style.setProperty("--ty", ((r.top + r.height / 2) / innerHeight * 100).toFixed(1) + "%");
    document.startViewTransition(apply);
  }
  function init() {
    if (window.gsap) document.documentElement.classList.add("has-gsap");
    document.addEventListener("click", e => { const b = e.target.closest("[data-theme-toggle]"); if (b) toggleTheme(b); });
    const nm = $("#topAccountName"); if (nm) { const paint = () => { const ch = (nm.textContent || "P").trim().charAt(0) || "P"; ["topAvatar", "sideAvatar"].forEach(id => { const a = document.getElementById(id); if (a) a.textContent = ch; }); }; new MutationObserver(paint).observe(nm, { childList: true, characterData: true, subtree: true }); paint(); }
    const bar = document.createElement("div"); bar.className = "kp-progress"; document.body.appendChild(bar);
    let tick = false; addEventListener("scroll", () => { if (tick) return; tick = true; requestAnimationFrame(() => { const h = document.documentElement; bar.style.setProperty("--sp", (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)).toFixed(3)); tick = false; }); }, { passive: true });
    watchLogin();
    const shell = $("#appShell"); const onShow = () => { if (!shell.hidden && $("#page-home").classList.contains("active") && !M.busy) { mountHero(); wireTiles(); } };
    new MutationObserver(onShow).observe(shell, { attributes: true, attributeFilter: ["hidden"] }); onShow();
    const stylesheet = document.createElement("style"); stylesheet.textContent = "body.kp-cinema .app-shell{position:relative;z-index:1520;background:var(--bg)}"; document.head.appendChild(stylesheet);
  }
  Object.assign(M, { canLoginCinematic, loginSuccess, pageEnter, vista, mountHero });
  window.KP_MOTION = M;
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init, { once: true }) : init();
})();
