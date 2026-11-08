/* K-PEDIA 6.2 — Maskot login "Si Loko": mata mengikuti kursor/jari, menutup mata saat sandi diketik, berangkat saat berhasil masuk. */
"use strict";
(function () {
  const $ = (s, p = document) => p.querySelector(s);
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = -1, b = 1) => Math.min(b, Math.max(a, v));
  const eye = (id, cx) => `<clipPath id="${id}"><ellipse cx="${cx}" cy="94" rx="15" ry="17"/></clipPath><g clip-path="url(#${id})"><ellipse cx="${cx}" cy="94" rx="15" ry="17" fill="#fff"/><g class="pupil"><circle cx="${cx}" cy="96" r="8" fill="#0b1b36"/><circle cx="${cx + 3}" cy="92" r="2.6" fill="#fff"/></g><rect class="lid" x="${cx - 18}" y="74" width="36" height="40" fill="#0b1b36"/></g>`;
  const SVG = `<svg viewBox="0 0 200 190" aria-hidden="true">
<defs><linearGradient id="mBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b82ff"/><stop offset="1" stop-color="#0b3fb5"/></linearGradient><clipPath id="mClip"><rect x="30" y="40" width="140" height="124" rx="36"/></clipPath></defs>
<path d="M8 178H192" stroke="rgba(255,255,255,.35)" stroke-width="3" stroke-linecap="round"/>
<circle class="puff p1" cx="154" cy="16" r="6"/><circle class="puff p2" cx="154" cy="16" r="6"/><circle class="puff p3" cx="154" cy="16" r="6"/>
<g class="m-body">
<rect x="146" y="26" width="16" height="24" rx="4" fill="#0b3fb5"/><rect x="143" y="22" width="22" height="7" rx="3.5" fill="#ff8a1f"/>
<ellipse cx="66" cy="170" rx="15" ry="8" fill="#0b1b36"/><ellipse cx="134" cy="170" rx="15" ry="8" fill="#0b1b36"/>
<rect x="30" y="40" width="140" height="124" rx="36" fill="url(#mBody)"/>
<g clip-path="url(#mClip)"><rect x="30" y="132" width="140" height="13" fill="#ff8a1f"/></g>
<rect x="46" y="60" width="108" height="66" rx="24" fill="#0b1b36"/><path d="M58 68q40-10 84 0" stroke="#fff" stroke-opacity=".18" stroke-width="3" fill="none" stroke-linecap="round"/>
${eye("mEyeL", 78)}${eye("mEyeR", 122)}
<circle cx="60" cy="114" r="5" fill="#ff7a9c" opacity=".55"/><circle cx="140" cy="114" r="5" fill="#ff7a9c" opacity=".55"/>
<path class="mouth smile" d="M88 114q12 11 24 0" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round"/>
<path class="mouth sad" d="M88 121q12-10 24 0" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round"/>
<ellipse class="mouth oh" cx="100" cy="118" rx="6" ry="7" fill="#fff"/>
<rect x="48" y="148" width="104" height="14" rx="7" fill="#dfe7f5"/><circle class="lamp" cx="66" cy="155" r="5" fill="#ffd23f"/><circle class="lamp" cx="134" cy="155" r="5" fill="#ffd23f"/>
<path d="M64 44q36-34 72 0z" fill="#0b1b36"/><rect x="60" y="40" width="80" height="9" rx="4.5" fill="#ff8a1f"/><circle cx="100" cy="32" r="5.5" fill="#ffd23f"/>
</g>
<g class="hand hl"><ellipse cx="22" cy="146" rx="13" ry="15" fill="#fff"/></g><g class="hand hr"><ellipse cx="178" cy="146" rx="13" ry="15" fill="#fff"/></g>
</svg>`;

  function start() {
    const panel = $(".login-panel"), screen = $("#loginScreen"), U = $("#agentId"), PW = $("#agentPassword");
    if (!panel || !screen || !U || !PW) return;
    const root = document.createElement("div"); root.className = "mascot"; root.dataset.state = "idle";
    root.innerHTML = `<div class="m-wrap" role="button" tabindex="0" aria-label="Maskot Si Loko. Ketuk untuk membunyikan klakson.">${SVG}</div><p class="m-say" aria-live="polite"></p>`;
    panel.prepend(root);
    const glow = document.createElement("i"); glow.className = "login-glow"; glow.setAttribute("aria-hidden", "true"); ($(".login-shade") || screen.firstChild).after(glow);

    const state = () => root.dataset.state, set = s => { root.dataset.state = s; };
    const free = () => state() === "idle" || state() === "user";
    const covered = () => state() === "pass" || state() === "peek";
    const say = t => { const el = $(".m-say", root); el.textContent = t; el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; };
    const look = (dx, dy) => { root.style.setProperty("--px", dx * 6 + "px"); root.style.setProperty("--py", dy * 7 + "px"); root.style.setProperty("--tilt", dx * 4 + "deg"); };
    const hello = () => { const h = new Date().getHours(), k = h >= 4 && h < 11 ? "pagi" : h >= 11 && h < 15 ? "siang" : h >= 15 && h < 18 ? "sore" : "malam"; say(`Selamat ${k}! Aku Loko. Ayo masuk, keretanya siap berangkat.`); };

    let hold = 0, raf = 0;
    addEventListener("pointermove", e => {
      if (screen.hidden || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0; hold = Date.now();
        const r = root.getBoundingClientRect();
        if (free() && state() !== "user") look(clamp((e.clientX - r.left - r.width / 2) / (innerWidth * .35)), clamp((e.clientY - r.top - r.height / 2) / (innerHeight * .35)));
        if (e.pointerType === "mouse" && !reduce()) {
          const px = clamp((e.clientX / innerWidth - .5) * 2), py = clamp((e.clientY / innerHeight - .5) * 2);
          panel.style.transform = `perspective(900px) rotateX(${-py * 3}deg) rotateY(${px * 4}deg)`;
          const v = $(".login-video"); if (v) v.style.transform = `translate(${-px * 10}px,${-py * 8}px) scale(1.06)`;
          screen.style.setProperty("--lx", e.clientX + "px"); screen.style.setProperty("--ly", e.clientY + "px");
        }
      });
    }, { passive: true });
    screen.addEventListener("mouseleave", () => { panel.style.transform = ""; });

    U.addEventListener("focus", () => { set("user"); say("Tulis akunmu ya, aku ikut membaca."); });
    U.addEventListener("input", () => look(clamp(-.7 + Math.min(U.value.length, 18) / 18 * 1.4), .7));
    U.addEventListener("blur", () => { if (state() === "user") { set("idle"); look(0, 0); } });
    PW.addEventListener("focus", () => { set(PW.type === "text" ? "peek" : "pass"); say(PW.type === "text" ? "Aku intip sedikit ya." : "Aku tutup mata. Kata sandimu aman."); });
    PW.addEventListener("blur", e => { if (covered() && !e.relatedTarget?.closest?.("#togglePassword")) set("idle"); });
    $("#togglePassword")?.addEventListener("click", () => set(PW.type === "text" ? "peek" : "pass"));
    document.addEventListener("pointerdown", e => { if (covered() && !e.target.closest("#agentPassword,#togglePassword")) set("idle"); });

    window.KP_MASCOT = {
      react(type) {
        if (type === "lock") { set("lock"); say("Aku ngantuk dulu… tunggu sebentar ya."); }
        else { set("bad"); say("Wah, belum cocok. Coba lagi ya."); }
        setTimeout(() => { if (state() === "bad" || state() === "lock") set("idle"); }, type === "lock" ? 4000 : 1400);
      },
      depart() {
        set("ok"); say("Tuut tuut! Selamat jalan."); navigator.vibrate?.(30);
        return new Promise(res => setTimeout(() => { root.classList.add("leave"); setTimeout(res, reduce() ? 0 : 600); }, reduce() ? 250 : 650));
      }
    };

    const toot = () => { if (!free()) return; set("ok"); say("Tuuut! Tuuut!"); navigator.vibrate?.(20); setTimeout(() => { if (state() === "ok") { set("idle"); hello(); } }, 1300); };
    const wrap = $(".m-wrap", root);
    wrap.addEventListener("click", toot);
    wrap.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toot(); } });

    setInterval(() => { if (screen.hidden || reduce() || state() !== "idle" || Date.now() - hold < 3500) return; look(Math.random() * 1.6 - .8, Math.random() * 1.2 - .6); }, 3200);
    new MutationObserver(() => { if (!screen.hidden) { root.classList.remove("leave"); set("idle"); look(0, 0); hello(); } }).observe(screen, { attributes: true, attributeFilter: ["hidden"] });
    hello();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start, { once: true }) : start();
})();
