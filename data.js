window.KP_DATA = (function() {
  const MASTER_TARIF = [
    { nama_ka: "Argo Bromo Anggrek", stasiun_asal: "Gambir", stasiun_tujuan: "Cirebon", kelas: "Eksekutif", harga: 190000 },
    { nama_ka: "Argo Bromo Anggrek", stasiun_asal: "Cirebon", stasiun_tujuan: "Gambir", kelas: "Eksekutif", harga: 190000 },
    { nama_ka: "Taksaka", stasiun_asal: "Gambir", stasiun_tujuan: "Cirebon", kelas: "Eksekutif", harga: 165000 },
    { nama_ka: "Taksaka", stasiun_asal: "Purwokerto", stasiun_tujuan: "Yogyakarta", kelas: "Eksekutif", harga: 110000 },
    { nama_ka: "Lodaya", stasiun_asal: "Bandung", stasiun_tujuan: "Tasikmalaya", kelas: "Eksekutif", harga: 110000 },
    { nama_ka: "Lodaya", stasiun_asal: "Bandung", stasiun_tujuan: "Tasikmalaya", kelas: "Ekonomi", harga: 75000 },
    { nama_ka: "Sancaka", stasiun_asal: "Yogyakarta", stasiun_tujuan: "Surabaya Gubeng", kelas: "Eksekutif", harga: 190000 },
    { nama_ka: "Sancaka", stasiun_asal: "Madiun", stasiun_tujuan: "Surabaya Gubeng", kelas: "Ekonomi", harga: 85000 }
  ];
  return {
    searchTarif: (o, d) => MASTER_TARIF.filter(t => t.stasiun_asal.toLowerCase().includes(o.toLowerCase()) && t.stasiun_tujuan.toLowerCase().includes(d.toLowerCase()))
  };
})();