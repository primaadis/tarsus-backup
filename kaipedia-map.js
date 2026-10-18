/* =========================================================
   KAIPEDIA GEOSPATIAL MAP ENGINE (LEAFLET GIS)
   ========================================================= */

(function(){
  let mapInstance = null;
  let stationMarkersGroup = null;
  let activeBaseLayer = null;
  let baseLayers = {};
  let currentCategory = 'all';
  let currentRegion = 'ALL';
  let currentSearchQuery = '';

  // Inisialisasi Peta saat pertama kali tab dibuka
  window.initGisMap = function() {
    if (mapInstance) {
      setTimeout(() => mapInstance.invalidateSize(), 150);
      return;
    }

    const container = document.getElementById('gisMap');
    if (!container) return;

    // Default view: Pulau Jawa
    mapInstance = L.map('gisMap', {
      zoomControl: false,
      attributionControl: false
    }).setView([-7.25, 110.0], 7);

    // Kustom posisi zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

    // Definisi Tiles Kartografi
    baseLayers.dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    });
    baseLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });
    baseLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    });

    // Default: Dark Mode
    activeBaseLayer = baseLayers.dark;
    activeBaseLayer.addTo(mapInstance);

    stationMarkersGroup = L.layerGroup().addTo(mapInstance);

    // Render Pin Stasiun
    renderStationPins();
  };

  // Warna & Ikon Pin berdasarkan Kategori
  function getPinColor(category) {
    switch (category) {
      case 'whoosh': return '#ef4444'; // Red Crimson
      case 'bandara': return '#f59e0b'; // Amber Gold
      case 'commuter': return '#06b6d4'; // Cyan Neon
      case 'heritage': return '#b45309'; // Bronze Sejarah
      default: return '#3b82f6'; // Antarkota Sapphire
    }
  }

  // Render Marker Stasiun ke Peta
  function renderStationPins() {
    if (!stationMarkersGroup) return;
    stationMarkersGroup.clearLayers();

    const stations = window.KP_STATIONS || [];
    if (!Array.isArray(stations) || stations.length === 0) return;

    stations.forEach(st => {
      // Filter Kategori
      if (currentCategory !== 'all' && st.category !== currentCategory) return;
      
      // Filter Daop / Divre
      if (currentRegion !== 'ALL' && st.daop !== currentRegion) return;

      // Filter Pencarian Teks
      if (currentSearchQuery) {
        const query = currentSearchQuery.toLowerCase();
        const matchName = (st.name || '').toLowerCase().includes(query);
        const matchCode = (st.code || '').toLowerCase().includes(query);
        const matchCity = (st.city || '').toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchCity) return;
      }

      const lat = parseFloat(st.lat);
      const lng = parseFloat(st.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const pinColor = getPinColor(st.category);

      const customIcon = L.divIcon({
        className: 'custom-station-pin',
        html: `
          <div style="
            width: 24px; height: 24px;
            background: ${pinColor};
            border: 2px solid #ffffff;
            border-radius: 50%;
            display: grid;
            place-items: center;
            box-shadow: 0 4px 14px rgba(0,0,0,0.5);
            color: #fff;
            font-size: 10px;
          ">
            <i class="fa-solid fa-train"></i>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      
      marker.on('click', () => {
        openGisDrawer(st);
        mapInstance.flyTo([lat, lng], 13, { duration: 1 });
      });

      marker.addTo(stationMarkersGroup);
    });
  }

  // Buka Drawer Detail Stasiun
  window.openGisDrawer = function(station) {
    const drawer = document.getElementById('gisDrawer');
    if (!drawer) return;

    document.getElementById('gisDrawerName').textContent = station.name + (station.code ? ` (${station.code})` : '');
    document.getElementById('gisDrawerCity').textContent = `${station.city || 'Indonesia'} • Elevasi: ${station.elevation || '-'}`;
    document.getElementById('gisDrawerType').textContent = (station.category || 'Antarkota').toUpperCase();
    document.getElementById('gisDrawerStatus').textContent = (station.status || 'Aktif').toUpperCase();

    // Gambar Stasiun (dengan Fallback aman)
    const imgElem = document.getElementById('gisDrawerImg');
    if (imgElem) {
      imgElem.src = station.image || `assets/images/stations/${(station.code || '').toLowerCase()}.jpg`;
      imgElem.onerror = function() {
        this.src = 'assets/background.jpg';
      };
    }

    // Deskripsi & Sejarah
    document.getElementById('gisDrawerDesc').textContent = station.description || station.history || 'Stasiun strategis yang melayani mobilitas masyarakat serta angkutan barang di wilayah operasional KAI.';

    // Fasilitas
    const facBox = document.getElementById('gisDrawerFacilities');
    facBox.innerHTML = '';
    const facilities = station.facilities || ['Loket Tiket', 'Ruang Tunggu Ber-AC', 'Toilet Ramah Difabel', 'Musholla', 'Area Parkir', 'Charging Station'];
    facilities.forEach(fac => {
      const span = document.createElement('span');
      span.className = 'facility-pill';
      span.textContent = fac;
      facBox.appendChild(span);
    });

    // Panduan Boarding & Akses
    document.getElementById('gisDrawerGuide').textContent = station.layoutGuide || 'Tersedia fasilitas Face Recognition Boarding Gate pada pintu masuk utama stasiun.';
    
    // Tautan Google Maps
    const gmapsLink = document.getElementById('gisDrawerGmaps');
    if (gmapsLink) {
      gmapsLink.href = `https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lng}`;
    }

    drawer.classList.add('open');
  };

  window.closeGisDrawer = function() {
    const drawer = document.getElementById('gisDrawer');
    if (drawer) drawer.classList.remove('open');
  };

  // Filter Kategori Layanan
  window.filterMapCategory = function(cat, button) {
    currentCategory = cat;
    document.querySelectorAll('.map-cat-pill').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');
    renderStationPins();
  };

  // Filter Daop / Wilayah
  window.filterMapRegion = function(region) {
    currentRegion = region;
    renderStationPins();
  };

  // Pencarian Stasiun di Peta
  window.searchMapStations = function(query) {
    currentSearchQuery = query;
    renderStationPins();
  };

  // Ganti Layer Mode Peta
  window.setMapBaseLayer = function(type) {
    if (!mapInstance || !baseLayers[type]) return;
    mapInstance.removeLayer(activeBaseLayer);
    activeBaseLayer = baseLayers[type];
    activeBaseLayer.addTo(mapInstance);

    document.querySelectorAll('.layer-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-layer-${type}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Tutup panel layer setelah memilih
    document.getElementById('mapLayerDropdown').hidden = true;
  };

  window.toggleMapLayerMenu = function() {
    const menu = document.getElementById('mapLayerDropdown');
    if (menu) menu.hidden = !menu.hidden;
  };
})();
