document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("gisMap") && typeof L !== "undefined") {
    window.kpMap = L.map("gisMap", { center: [-7.25, 110.15], zoom: 7 });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png").addTo(window.kpMap);
    if (window.stationsData) {
      window.stationsData.forEach(s => {
        L.marker([s.lat, s.lng]).bindPopup(`<b>${s.name}</b><br>${s.city}`).addTo(window.kpMap);
      });
    }
  }
});