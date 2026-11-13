/* K-Pedia — sumber "Informasi penting" di Beranda.
   Hanya berisi informasi yang benar adanya. Tidak ada gangguan operasional contoh.
   Cara memperbarui otomatis: isi remoteUrl dengan alamat JSON (skema di docs/ARSITEKTUR-DATA-ADMIN.md);
   K-Pedia akan mengambilnya saat dibuka, menyimpan salinan 30 menit, dan menggabungkannya dengan daftar di bawah.
   Kategori: pengumuman | gangguan | layanan | promo | pembaruan.  */
window.KP_ANNOUNCEMENTS = {
  remoteUrl: "",
  items: [
    { id: "kp-8-0", category: "pembaruan", title: "K-Pedia 8.0: ruang kerja digital baru",
      desc: "Beranda kini menjadi launcher tools. Tambahan baru: jam dan kalender WIB dengan hari libur nasional, cuaca stasiun (Open-Meteo), kalkulator termasuk tanggal, dan RAKA 3D. Tools yang menunggu data (Update Info Koordinasi, TOKA, Jadwal KRL) tampil sebagai rancangan dan belum bisa dicari.",
      date: "2026-11-11", source: "Tim K-Pedia", notify: true },
    { id: "poster-nama-kereta", category: "layanan", title: "Nama kereta resmi berganti",
      desc: "Mulai 1 Oktober 2026, sejumlah kereta api memakai identitas nama baru (contoh pada poster: KA Muria). Cek nama dan nomor KA terbaru sebelum memesan tiket.",
      image: "assets/info/poster-1.webp", effective: "2026-10-01", source: "Poster resmi KAI (kurasi admin)" },
    { id: "poster-railpoin", category: "layanan", title: "Railpoin bisa dipakai di KAI Services",
      desc: "Railpoin dapat digunakan langsung sebagai metode pembayaran atau potongan transaksi di Loko Cafe, Restorasi Kereta Api, dan Dining Car Whoosh.",
      image: "assets/info/poster-2.webp", source: "Poster resmi KAI (kurasi admin)" },
    { id: "poster-entertrain", category: "promo", title: "Perjalanan jauh, tetap seru",
      desc: "Hiburan enterTrain menemani perjalanan jauhmu lewat Access by KAI. Unduh aplikasinya dan coba sendiri.",
      image: "assets/info/poster-3.webp", link: "https://access.kai.id", linkLabel: "Buka Access by KAI", source: "Poster resmi KAI (kurasi admin)" },
    { id: "poster-giveaway", category: "promo", title: "KAI Giveaway 3 Day Pass",
      desc: "Tiket 3 Day Pass Synchronize Fest 2026 untuk 20 pemenang. Syarat dan ketentuan berlaku; periksa masa berlaku pada poster sebelum menyampaikannya ke pelanggan.",
      image: "assets/info/poster-4.webp", source: "Poster resmi KAI (kurasi admin)" },
    { id: "poster-gempa", category: "layanan", title: "Kereta api dan gempa",
      desc: "Kenapa kereta api harus berhenti ketika atau setelah gempa? Simak infografis keselamatan perjalanannya.",
      image: "assets/info/poster-5.webp", source: "Poster resmi KAI (kurasi admin)" }
  ]
};
