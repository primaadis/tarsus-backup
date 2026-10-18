document.addEventListener("DOMContentLoaded", () => {
  const bootScreen = document.getElementById("bootScreen");
  const loginScreen = document.getElementById("loginScreen");
  const appShell = document.getElementById("appShell");
  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");

  const currentAgent = localStorage.getItem("kp_agent_id");

  setTimeout(() => {
    if (bootScreen) {
      bootScreen.classList.add("fade-out");
      setTimeout(() => { bootScreen.style.display = "none"; }, 400);
    }
    if (currentAgent) {
      grantAccess(currentAgent);
    } else {
      if (loginScreen) { loginScreen.hidden = false; loginScreen.style.display = "flex"; }
    }
  }, 1200);

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("agentId").value.trim();
      const pass = document.getElementById("agentPassword").value;
      if (id.toLowerCase() === "admin" && pass === "Paskai121") {
        grantAccess(id);
      } else {
        loginMessage.textContent = "ID Petugas atau kata sandi tidak valid.";
      }
    });
  }

  const sForm = document.getElementById("searchForm");
  if (sForm) {
    sForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const o = document.getElementById("origin").value.trim();
      const d = document.getElementById("destination").value.trim();
      const res = window.KP_DATA ? window.KP_DATA.searchTarif(o, d) : [];
      const out = document.getElementById("results");
      if (res.length === 0) {
        out.innerHTML = "<p>Tidak ada tarif khusus ditemukan.</p>";
      } else {
        out.innerHTML = res.map(r => `<div style="padding: 14px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 8px;"><strong>${r.nama_ka}</strong> (${r.kelas}): <span style="color:#ff7a18; font-weight: bold;">Rp ${r.harga.toLocaleString('id-ID')}</span></div>`).join("");
      }
    });
  }
});

function grantAccess(agentId) {
  localStorage.setItem("kp_agent_id", agentId);
  const loginScreen = document.getElementById("loginScreen");
  const appShell = document.getElementById("appShell");
  if (loginScreen) { loginScreen.hidden = true; loginScreen.style.display = "none"; }
  if (appShell) { appShell.hidden = false; appShell.style.display = "flex"; }
}

window.logoutAgent = function() {
  localStorage.removeItem("kp_agent_id");
  window.location.reload();
};

window.navigatePage = function(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const t = document.getElementById("page-" + pageId);
  if (t) t.classList.add("active");
  if (pageId === "map" && window.kpMap) {
    setTimeout(() => { window.kpMap.invalidateSize(); }, 200);
  }
};

window.closeAdModal = function() {
  const m = document.getElementById("adModal");
  if (m) { m.hidden = true; m.style.display = "none"; }
};