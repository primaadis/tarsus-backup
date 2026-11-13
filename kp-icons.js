/* K-Pedia — ikon Phosphor (https://phosphoricons.com), memakai @phosphor-icons/web dari CDN.
   Nama lama (#i-xxx) dipetakan ke nama Phosphor agar seluruh templat JS cukup memanggil phIcon(). */
"use strict";
(function () {
  const MAP = {
    search: "magnifying-glass", close: "x", chevron: "caret-right", "chevron-down": "caret-down", train: "train", pin: "map-pin",
    star: "star", clock: "clock", info: "info", mail: "envelope-simple", sliders: "sliders-horizontal", sun: "sun", moon: "moon",
    logout: "sign-out", arrow: "arrow-right", back: "arrow-left", eye: "eye", "eye-off": "eye-slash", swap: "arrows-down-up",
    trash: "trash", copy: "copy", external: "arrow-square-out", menu: "list", ticket: "ticket", book: "book-open-text",
    map: "map-trifold", help: "question", refund: "arrow-counter-clockwise", layers: "stack", calc: "calculator", check: "check",
    phone: "phone", chat: "chat-circle-text", locate: "crosshair", plus: "plus", minus: "minus", landmark: "bank", bolt: "lightning",
    plane: "airplane-tilt", clip: "paperclip", home: "house", text: "text-aa", auto: "desktop", warn: "warning",
    bell: "bell", user: "user-circle", lock: "lock-simple", google: "google-logo", calendar: "calendar-blank", cloud: "cloud-sun",
    megaphone: "megaphone", contacts: "address-book", subway: "subway", sparkle: "sparkle", send: "paper-plane-tilt", shield: "shield-check",
    gear: "gear", image: "image", file: "file-text", alert: "warning-circle", rain: "cloud-rain", wind: "wind", drop: "drop",
    thermo: "thermometer-simple", pushpin: "push-pin", list: "list-bullets", filter: "funnel", sort: "arrows-down-up", flag: "flag",
    gift: "gift", newspaper: "newspaper", lightbulb: "lightbulb", tools: "wrench", chart: "chart-line-up", users: "users-three", hourglass: "hourglass-medium"
  };
  window.PH_MAP = MAP;
  window.phIcon = (name, cls = "") => `<i class="ph ph-${MAP[name] || name} ic ${cls}" aria-hidden="true"></i>`;
})();
