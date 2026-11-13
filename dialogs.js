/* K-Pedia — dialog & notifikasi bergaya clay (pengganti confirm/alert bawaan browser). */
"use strict";
(function () {
  const svg = n => window.phIcon(n in window.PH_MAP ? n : "info");
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
