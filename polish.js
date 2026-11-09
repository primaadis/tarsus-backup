/* K-PEDIA 6.1 — polesan interaksi: sapaan waktu, jam, bottom nav, efek. Hapus file ini + script-nya bila tak diperlukan. */
"use strict";
(function () {
  const $ = (s, p = document) => p.querySelector(s);
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const P = d => `<svg class="ic" aria-hidden="true" viewBox="0 0 24 24"><path d="${d}"/></svg>`;
  const ICON = {
    pagi: P("M12 4v3M4.9 9.9l1.8 1.8M19.1 9.9l-1.8 1.8M2 18h20M7 18a5 5 0 0 1 10 0M9 22h6"),
    siang: '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg>',
    sore: P("M12 9V5M4.9 12.9l1.8 1.8M19.1 12.9l-1.8 1.8M2 19h20M7 19a5 5 0 0 1 10 0M10 3l2 2 2-2"),
    malam: '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg>'
  };
  const SAPA = {
    pagi:  ["Selamat pagi",  "Mulai harimu dengan rencana perjalanan yang tepat."],
    siang: ["Selamat siang", "Waktu yang pas untuk mengecek tarif perjalananmu."],
    sore:  ["Selamat sore",  "Rencanakan perjalanan esok hari dari sekarang."],
    malam: ["Selamat malam", "Istirahat dulu, informasi perjalananmu sudah siap."]
  };
  const tod = (d = new Date()) => { const h = d.getHours(); return h >= 4 && h < 11 ? "pagi" : h >= 11 && h < 15 ? "siang" : h >= 15 && h < 18 ? "sore" : "malam"; };
  const who = () => { try { const u = state.user; return u ? u.charAt(0).toUpperCase() + u.slice(1) : ""; } catch (_) { return ""; } };

  /* --- Hero: sapaan + jam yang diperbarui otomatis --- */
  let ic, clock, greet, lastTod = "";
  function buildHero() {
    greet = $("#homeGreeting"); if (!greet || $(".hero-meta")) return;
    const meta = document.createElement("div"); meta.className = "hero-meta";
    ic = document.createElement("span"); ic.className = "tod-ic"; ic.setAttribute("aria-hidden", "true");
    clock = document.createElement("div"); clock.className = "hero-clock"; clock.setAttribute("aria-hidden", "true");
    greet.parentNode.insertBefore(meta, greet); meta.append(ic, greet, clock);
  }
  function tick() {
    const d = new Date(), k = tod(d);
    document.body.dataset.tod = k;
    if (greet) {
      greet.textContent = SAPA[k][0] + (who() ? ", " + who() : "");
      if (k !== lastTod) { ic.innerHTML = ICON[k]; lastTod = k; }
      const hh = String(d.getHours()).padStart(2, "0"), mm = String(d.getMinutes()).padStart(2, "0");
      clock.innerHTML = `<b>${hh}<i>:</i>${mm}</b><small>${d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</small>`;
    }
  }

  /* --- Sapaan layar penuh saat masuk (sekali per sesi) --- */
  function welcome() {
    try { if (sessionStorage.getItem("kp-welcomed")) return; sessionStorage.setItem("kp-welcomed", "1"); } catch (_) {}
    const k = tod(), el = document.createElement("div");
    el.className = "kp-welcome"; el.setAttribute("role", "status");
    el.innerHTML = `<div><span class="w-ic">${ICON[k]}</span><h2><span>${SAPA[k][0]}${who() ? "," : ""}</span> ${who() ? `<span>${who()}</span>` : ""}</h2><p>${SAPA[k][1]}</p><i class="w-line"></i></div>`;
    document.body.append(el);
    const close = () => { if (el.classList.contains("out")) return; el.classList.add("out"); setTimeout(() => el.remove(), 600); };
    el.addEventListener("click", close); setTimeout(close, reduce() ? 1400 : 2800);
  }
  function watchShell() {
    const shell = $("#appShell"); if (!shell) return;
    const check = () => {
      if (shell.hidden) { try { sessionStorage.removeItem("kp-welcomed"); } catch (_) {} return; }
      const wait = () => document.getElementById("bootScreen") ? setTimeout(wait, 250) : (tick(), welcome());
      wait();
    };
    new MutationObserver(check).observe(shell, { attributes: true, attributeFilter: ["hidden"] });
    check();
  }

  /* --- Progres gulir, sorotan kursor, riak, getar --- */
  function effects() {
    const bar = document.createElement("div"); bar.className = "kp-progress"; bar.setAttribute("aria-hidden", "true"); document.body.append(bar);
    let raf = 0;
    addEventListener("scroll", () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const m = document.documentElement.scrollHeight - innerHeight; bar.style.setProperty("--sp", m > 0 ? Math.min(1, scrollY / m) : 0); }); }, { passive: true });
    document.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      const c = e.target.closest(".menu-tile,.kp-mode,.wiki-card,.directory-card,.guide-card"); if (!c) return;
      const r = c.getBoundingClientRect(); c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });
    document.addEventListener("pointerdown", e => {
      const b = e.target.closest(".primary-button,.secondary-button,.setting-action"); if (!b || reduce()) return;
      const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), x = document.createElement("span");
      x.className = "kp-ripple"; x.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
      b.append(x); setTimeout(() => x.remove(), 650);
    });
    document.addEventListener("click", e => {
      const f = e.target.closest("[data-favorite]"); if (!f) return;
      navigator.vibrate?.(14); f.classList.remove("kp-pop"); void f.offsetWidth; f.classList.add("kp-pop");
    });
    document.addEventListener("keydown", e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
      if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        if (!state.user) return; e.preventDefault(); if (state.page !== "home") navigate("home"); $("#globalSearch")?.focus();
      }
    });
  }

  function trap() {
    document.addEventListener("keydown", e => {
      if (e.key !== "Tab") return;
      const box = [...document.querySelectorAll("#stationSheet .sheet-panel,#adModal .ad-modal-panel")].find(b => !b.closest("[hidden]")) || $("#sidebar.open");
      if (!box) return;
      const f = [...box.querySelectorAll('a[href],button:not([disabled]),input,select,[tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function start() {
    trap();
    buildHero(); effects(); tick(); watchShell();
    setInterval(tick, 20000);
    ["visibilitychange", "focus", "online"].forEach(ev => addEventListener(ev, tick));
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start, { once: true }) : start();
})();
