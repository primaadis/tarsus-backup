/* K-Pedia 6.6 — RAKA 12-state expression and interaction controller. */
"use strict";
(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const reduce = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const expressions = {
    greeting: { frame: 1, title: "Halo, aku RAKA!", message: "Selamat datang di K-Pedia. Ada yang bisa kubantu?" },
    happy: { frame: 2, title: "Senang bertemu kamu!", message: "Yuk, cari informasi perjalanan bersama." },
    thinking: { frame: 3, title: "Sebentar, ya…", message: "Aku sedang memahami pertanyaanmu." },
    searching: { frame: 4, title: "Sedang mencari", message: "Aku sedang mencari informasi yang paling relevan…" },
    explaining: { frame: 5, title: "Ini yang kutemukan", message: "Coba lihat hasil pencarian yang tersedia." },
    confused: { frame: 6, title: "Belum ketemu", message: "Kata kuncinya bisa kita ubah sedikit." },
    surprised: { frame: 7, title: "Wah!", message: "Ada hal menarik yang perlu kamu tahu." },
    apologetic: { frame: 8, title: "Maaf, ya", message: "Sepertinya ada yang belum sesuai. Coba periksa kembali." },
    success: { frame: 9, title: "Berhasil!", message: "Mantap! Kita sudah menyelesaikan langkah ini." },
    listening: { frame: 10, title: "Aku mendengarkan", message: "Silakan ketik pertanyaanmu. Aku siap membantu." },
    encouraging: { frame: 11, title: "Semangat!", message: "Pelan-pelan, kita temukan jawabannya bersama." },
    idle: { frame: 12, title: "RAKA siap menemani", message: "Asisten AI K-Pedia. Ada yang bisa kubantu hari ini?" }
  };
  const framePath = n => `assets/raka/${String(n).padStart(2,"0")}.webp`;
  Object.values(expressions).forEach(x => { const im = new Image(); im.src = framePath(x.frame); });

  function createView(host, login = false) {
    let stage = login ? null : $(".raka-stage", host);
    if (!stage) {
      stage = document.createElement("div");
      stage.className = login ? "raka-login-stage raka-stage-login" : "raka-stage";
      stage.setAttribute("aria-hidden", "true");
      stage.innerHTML = `<img class="raka-frame is-active" data-frame="a" src="${framePath(12)}" alt="" width="600" height="600"><img class="raka-frame" data-frame="b" src="${framePath(12)}" alt="" width="600" height="600">`;
      if (login && $(".m-say", host)) host.insertBefore(stage, $(".m-say", host));
      else host.append(stage);
    }
    const imgs = [$('[data-frame="a"]', stage), $('[data-frame="b"]', stage)];
    let active = 0;
    function show(name) {
      const item = expressions[name] || expressions.idle;
      const next = 1 - active;
      imgs[next].src = framePath(item.frame);
      imgs[next].classList.add("is-active");
      imgs[active].classList.remove("is-active");
      active = next;
      return item;
    }
    return { show };
  }

  function startHome() {
    const root = $("#homeRaka"), search = $("#globalSearch");
    if (!root || !search) return;
    const view = createView(root);
    const title = $("#rakaHomeTitle"), message = $("#rakaHomeMessage");
    let idleTimer = 0;
    function setState(name) {
      const item = expressions[name] || expressions.idle;
      root.dataset.state = name;
      view.show(name);
      if (title) title.textContent = item.title;
      if (message) message.textContent = item.message;
      clearTimeout(idleTimer);
      if (!["idle","listening","searching"].includes(name) && !reduce()) idleTimer = setTimeout(() => setState("idle"), 4200);
    }
    root.addEventListener("click", e => {
      const btn = e.target.closest("[data-raka-action]"); if (!btn) return;
      const action = btn.dataset.rakaAction;
      if (action === "ask") { setState("listening"); search.focus({preventScroll:true}); search.scrollIntoView({behavior:reduce()?"auto":"smooth",block:"center"}); }
      else if (action === "greeting") setState("greeting");
      else if (action === "encourage") setState("encouraging");
    });
    search.addEventListener("focus", () => setState("listening"));
    search.addEventListener("input", () => setState(search.value.trim() ? "searching" : "listening"));
    search.addEventListener("keydown", e => { if (e.key === "Enter" && search.value.trim()) setState("thinking"); });
    search.addEventListener("blur", () => { if (!search.value.trim()) setState("idle"); });
    const results = $("#globalResults");
    if (results) new MutationObserver(() => {
      if (results.hidden) return;
      const hasRows = Boolean($(".gr-item", results));
      setState(hasRows ? "explaining" : "confused");
    }).observe(results, { childList:true, subtree:true, attributes:true, attributeFilter:["hidden"] });
    root.addEventListener("mouseenter", () => { if (root.dataset.state === "idle") setState("greeting"); });
    root.addEventListener("mouseleave", () => { if (root.dataset.state === "greeting") setState("idle"); });
    let raf = 0;
    root.addEventListener("pointermove", e => {
      if (reduce() || e.pointerType !== "mouse" || raf) return;
      raf = requestAnimationFrame(() => { raf = 0; const r = root.getBoundingClientRect(); root.style.setProperty("--raka-x", `${Math.max(-5,Math.min(5,(e.clientX-r.left-r.width/2)/35))}px`); root.style.setProperty("--raka-y", `${Math.max(-4,Math.min(4,(e.clientY-r.top-r.height/2)/45))}px`); });
    }, {passive:true});
    root.addEventListener("pointerleave", () => { root.style.setProperty("--raka-x","0px"); root.style.setProperty("--raka-y","0px"); });
    setState("idle");
    window.KP_RAKA = { setState };
  }

  function startLogin() {
    const panel = $(".login-panel"), screen = $("#loginScreen"), user = $("#agentId"), pass = $("#agentPassword");
    if (!panel || !screen || !user || !pass) return;
    const root = document.createElement("div"); root.className = "mascot raka-login"; root.dataset.state = "idle";
    root.innerHTML = `<p class="m-say" aria-live="polite">Halo! Aku RAKA. Selamat datang di K-Pedia.</p>`;
    panel.prepend(root);
    const view = createView(root, true);
    const say = text => { const el = $(".m-say",root); if (el) el.textContent = text; };
    const set = (state, text) => { root.dataset.state=state; view.show(state); if(text) say(text); };
    user.addEventListener("focus",()=>set("listening","Aku mendengarkan. Silakan masukkan akunmu."));
    pass.addEventListener("focus",()=>set("listening","Tenang, masukkan kata sandimu dengan aman."));
    user.addEventListener("input",()=>set("thinking","Oke, aku menunggu langkah berikutnya."));
    pass.addEventListener("input",()=>set("listening","Aku tetap di sini. Lanjutkan, ya."));
    $("#loginForm")?.addEventListener("submit",()=>set("thinking","Sedang memeriksa data masuk…"));
    window.KP_MASCOT = {
      react(type) { if(type === "lock") set("apologetic","Akun terkunci sementara. Kita coba lagi sebentar, ya."); else set("apologetic","Sepertinya akun atau kata sandi belum cocok. Periksa lagi, ya!"); },
      depart() { set("success","Berhasil! Selamat datang di K-Pedia."); return new Promise(resolve=>setTimeout(resolve,reduce()?0:520)); }
    };
    set("greeting","Halo! Aku RAKA. Selamat datang di K-Pedia.");
    new MutationObserver(()=>{ if(!screen.hidden) set("greeting","Selamat datang kembali! Aku siap membantu."); }).observe(screen,{attributes:true,attributeFilter:["hidden"]});
  }
  function init(){ startHome(); startLogin(); }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded",init,{once:true}) : init();
})();
