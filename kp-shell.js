/* K-Pedia — penyempurnaan cangkang: tombol tema cepat, menu navigasi bawah, bayangan topbar, intro sekali per sesi. */
"use strict";
(function () {
  const $ = (s, p = document) => p.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  /* Menu akun: nama, Pengaturan, Keluar. Muncul dari sudut tombolnya (transform-origin) dan menutup dengan Escape atau klik di luar. */
  function initAccountMenu() {
    const btn = $("#accountButton"); if (!btn) return;
    const host = btn.parentElement; host.style.position = "relative";
    const menu = document.createElement("div");
    menu.className = "acct-menu"; menu.hidden = true; menu.setAttribute("role", "menu"); menu.setAttribute("aria-label", "Menu akun");
    host.append(menu);
    btn.setAttribute("aria-haspopup", "menu"); btn.setAttribute("aria-expanded", "false");
    let timer = 0;
    const isOpen = () => !menu.hidden && menu.classList.contains("in");
    const close = (focusBtn) => {
      if (!isOpen()) return;
      menu.classList.remove("in"); btn.setAttribute("aria-expanded", "false");
      clearTimeout(timer); timer = setTimeout(() => { menu.hidden = true; }, 160);
      if (focusBtn) btn.focus();
    };
    const open = () => {
      const u = window.KP_AUTH?.user;
      menu.innerHTML = `<div class="acct-who"><strong>${esc(u?.name || "Akun")}</strong><small>${esc(u?.email || "")}</small></div>
        <button type="button" role="menuitem" data-acct="settings">${ic("sliders")}<span>Pengaturan</span></button>
        <button type="button" role="menuitem" data-acct="out" class="out">${ic("logout")}<span>Keluar</span></button>`;
      clearTimeout(timer); menu.hidden = false; void menu.offsetWidth; menu.classList.add("in"); btn.setAttribute("aria-expanded", "true");
      menu.querySelector("[role=menuitem]")?.focus({ preventScroll: true });
    };
    btn.addEventListener("click", e => { e.preventDefault(); e.stopImmediatePropagation(); isOpen() ? close() : open(); }, true);
    menu.addEventListener("click", e => {
      const b = e.target.closest("[data-acct]"); if (!b) return;
      close();
      if (b.dataset.acct === "settings") window.navigate?.("settings");
      else if (typeof window.doLogout === "function") window.doLogout();
    });
    document.addEventListener("pointerdown", e => { if (isOpen() && !host.contains(e.target)) close(); });
    document.addEventListener("keydown", e => {
      if (!isOpen()) return;
      if (e.key === "Escape") { e.preventDefault(); close(true); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); const items = [...menu.querySelectorAll("[role=menuitem]")], i = items.indexOf(document.activeElement);
        items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
      }
    });
  }

  function init() {
    initAccountMenu();
    $("#themeQuick")?.addEventListener("click", () => {
      const dark = document.body.dataset.theme === "dark";
      if (typeof window.applyTheme === "function") window.applyTheme(dark ? "light" : "dark");
    });
    $("#bnMenu")?.addEventListener("click", () => $("#openSidebar")?.click());
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { $(".topbar")?.classList.toggle("is-scrolled", window.scrollY > 6); ticking = false; });
    }, { passive: true });
    window.addEventListener("kp:auth", () => {
      try {
        if (sessionStorage.getItem("kp-intro")) return;
        sessionStorage.setItem("kp-intro", "1");
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        document.body.classList.add("kp-intro");
        setTimeout(() => document.body.classList.remove("kp-intro"), 1500);
      } catch (_) {}
    });
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
