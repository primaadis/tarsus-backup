/* K-PEDIA 6.5 — RAKA: maskot manusia 3D untuk login dan respons interaksi. */
"use strict";
(function () {
  const $ = (s, p = document) => p.querySelector(s);
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = -1, b = 1) => Math.min(b, Math.max(a, v));

  function start() {
    const panel = $(".login-panel"), screen = $("#loginScreen"), U = $("#agentId"), PW = $("#agentPassword");
    if (!panel || !screen || !U || !PW) return;
    const root = document.createElement("div");
    root.className = "mascot raka-login"; root.dataset.state = "idle";
    root.innerHTML = `<div class="raka-login-stage"><img class="raka-login-portrait" src="assets/raka-portrait.webp" alt="RAKA, asisten AI K-Pedia" width="234" height="539"><span class="raka-login-spark" aria-hidden="true">✦</span></div><p class="m-say" aria-live="polite">Halo! Aku RAKA. Selamat datang di K-Pedia.</p>`;
    panel.prepend(root);
    const state = () => root.dataset.state;
    const set = value => { root.dataset.state = value; };
    const say = value => { const el = $(".m-say", root); el.textContent = value; };
    const look = (dx, dy) => { root.style.setProperty("--raka-x", `${dx * 3}px`); root.style.setProperty("--raka-y", `${dy * 3}px`); };
    const hello = () => { const h = new Date().getHours(); const part = h >= 4 && h < 11 ? "pagi" : h >= 11 && h < 15 ? "siang" : h >= 15 && h < 18 ? "sore" : "malam"; say(`Selamat ${part}! Aku RAKA. Siap bantu perjalanan informasimu.`); };
    let raf = 0;
    screen.addEventListener("pointermove", e => {
      if (reduce() || raf || screen.hidden || e.pointerType !== "mouse") return;
      raf = requestAnimationFrame(() => { raf = 0; const r = root.getBoundingClientRect(); look(clamp((e.clientX-r.left-r.width/2)/(innerWidth*.4)), clamp((e.clientY-r.top-r.height/2)/(innerHeight*.4))); });
    }, { passive: true });
    U.addEventListener("focus", () => { set("listening"); say("Silakan masukkan akunmu. Aku siap menunggu."); });
    U.addEventListener("blur", () => { if (state() === "listening") { set("idle"); look(0,0); } });
    PW.addEventListener("focus", () => { set("secure"); say("Tenang, masukkan kata sandimu dengan aman."); });
    PW.addEventListener("blur", () => { if (state() === "secure") set("idle"); });
    $("#togglePassword")?.addEventListener("click", () => { if (document.activeElement === PW) { set("secure"); say("Aku tetap di sini, lanjutkan ya."); } });
    window.KP_MASCOT = {
      react(type) { if (type === "lock") { set("lock"); say("Kita istirahat sebentar, lalu coba lagi ya."); } else { set("error"); say("Sepertinya belum cocok. Periksa lagi, ya!"); } },
      depart() { set("success"); say("Berhasil! Selamat datang di K-Pedia."); return new Promise(resolve => setTimeout(resolve, reduce() ? 0 : 350)); }
    };
    new MutationObserver(() => { if (!screen.hidden) { set("idle"); look(0,0); hello(); } }).observe(screen, { attributes: true, attributeFilter: ["hidden"] });
    hello();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start, { once: true }) : start();
})();
