const stationsData = [
  { id: "gmr", code: "GMR", name: "Stasiun Gambir", city: "Jakarta", lat: -6.1767, lng: 106.8306 },
  { id: "pse", code: "PSE", name: "Stasiun Pasar Senen", city: "Jakarta", lat: -6.1744, lng: 106.8444 },
  { id: "bd", code: "BD", name: "Stasiun Bandung", city: "Bandung", lat: -6.9147, lng: 107.6025 },
  { id: "cn", code: "CN", name: "Stasiun Cirebon", city: "Cirebon", lat: -6.7053, lng: 108.5553 },
  { id: "yk", code: "YK", name: "Stasiun Yogyakarta", city: "Yogyakarta", lat: -7.7892, lng: 110.3633 },
  { id: "sgu", code: "SGU", name: "Stasiun Surabaya Gubeng", city: "Surabaya", lat: -7.2653, lng: 112.7522 }
];
if (typeof window !== "undefined") { window.stationsData = stationsData; }