/* K-Pedia — dialog & notifikasi bergaya clay (pengganti confirm/alert bawaan browser). */
"use strict";
(function () {
  const IC = {
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
    logout: '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    auto: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    warn: '<path d="M12 4 3 20h18L12 4ZM12 10v4M12 17h.01"/>',
    text: '<path d="M4 7V5h16v2M9 19h6M12 5v14"/>'
  };
  const svg = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || IC.info}</svg>`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let open = null;

  function kpConfirm(o = {}) {
    if (open) open.close(false);
    return new Promise(resolve => {
      const tone = o.tone || "default";
      const root = document.createElement("div");
      root.className = "kp-dialog";
      root.innerHTML = `<div class="kp-dialog-scrim" data-x></div>
        <div class="kp-dialog-card" role="alertdialog" aria-modal="true" aria-labelledby="kdT" aria-describedby="kdM">
          <div class="kp-dialog-badge tone-${tone}">${svg(o.icon || (tone === "danger" ? "trash" : "info"))}</div>
          <h2 id="kdT">${esc(o.title || "Konfirmasi")}</h2>
          <p id="kdM">${esc(o.message || "")}</p>
          <div class="kp-dialog-actions">
            <button type="button" class="clay-btn ghost" data-no>${esc(o.cancelText || "Batal")}</button>
            <button type="button" class="clay-btn ${tone === "danger" ? "danger" : "primary"}" data-yes>${esc(o.confirmText || "Lanjutkan")}</button>
          </div>
        </div>`;
      const prev = document.activeElement;
      const close = v => {
        if (!open) return; open = null;
        root.classList.add("out"); document.removeEventListener("keydown", onKey, true);
        document.body.classList.remove("dialog-open");
        setTimeout(() => { root.remove(); prev?.focus?.(); }, 200);
        resolve(v);
      };
      const onKey = e => {
        if (e.key === "Escape") { e.preventDefault(); close(false); }
        else if (e.key === "Tab") {
          const f = [...root.querySelectorAll("button")]; const i = f.indexOf(document.activeElement);
          e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
        }
      };
      root.addEventListener("click", e => { if (e.target.closest("[data-yes]")) close(true); else if (e.target.closest("[data-no],[data-x]")) close(false); });
      document.addEventListener("keydown", onKey, true);
      document.body.append(root); document.body.classList.add("dialog-open");
      open = { close };
      requestAnimationFrame(() => { root.classList.add("in"); root.querySelector(tone === "danger" ? "[data-no]" : "[data-yes]").focus(); });
    });
  }

  function kpToast(message, type = "info", opt = {}) {
    const region = document.getElementById("toastRegion"); if (!region) return;
    while (region.children.length >= 3) region.firstElementChild.remove();
    const el = document.createElement("div");
    el.className = `toast toast-${type}`; el.setAttribute("role", type === "error" ? "alert" : "status");
    const ic = opt.icon || (type === "success" ? "check" : type === "error" ? "warn" : "info");
    el.innerHTML = `<span class="t-ic">${svg(ic)}</span><span class="t-msg">${esc(message)}</span>`;
    region.append(el);
    requestAnimationFrame(() => el.classList.add("show"));
    const ms = opt.ms || 3200;
    const kill = () => { el.classList.remove("show"); setTimeout(() => el.remove(), 260); };
    const t = setTimeout(kill, ms);
    el.addEventListener("click", () => { clearTimeout(t); kill(); });
  }
  window.kpConfirm = kpConfirm; window.kpToast = kpToast;
})();
