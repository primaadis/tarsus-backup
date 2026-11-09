/* K-Pedia 7.1 — perilaku shell: tombol tema (lingkaran membesar dari tombol), inisial avatar.
   Memanggil applyTheme() milik app.js, jadi preferensi tema tetap tersimpan dengan kunci yang sama. */
"use strict";
(function () {
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function toggleTheme(btn) {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    const apply = () => window.applyTheme(next, true, false);
    if (!document.startViewTransition || reduce()) { apply(); return; }
    const r = btn.getBoundingClientRect();
    document.documentElement.style.setProperty("--tx", ((r.left + r.width / 2) / innerWidth * 100).toFixed(1) + "%");
    document.documentElement.style.setProperty("--ty", ((r.top + r.height / 2) / innerHeight * 100).toFixed(1) + "%");
    document.startViewTransition(apply);
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-theme-toggle]");
    if (b) toggleTheme(b);
  });

  function initials() {
    const el = document.getElementById("topAccountName");
    if (!el) return;
    const paint = () => {
      const ch = (el.textContent || "P").trim().charAt(0) || "P";
      ["topAvatar", "sideAvatar"].forEach(id => { const a = document.getElementById(id); if (a) a.textContent = ch; });
    };
    new MutationObserver(paint).observe(el, { childList: true, characterData: true, subtree: true });
    paint();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", initials, { once: true }) : initials();
})();
