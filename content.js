/* =========================================================
   K-PEDIA — KONTEN YANG MUDAH DIEDIT
   Ubah teks, tautan, dan iklan di sini tanpa menyentuh app.js.
   Panduan lengkap ada di README.md.
========================================================= */
"use strict";

window.KP_CONTENT = {

  /* ---------- Tautan penting ---------- */
  links: {
    access:   "https://access.kai.id",          // Access by KAI (cek ketersediaan / pesan tiket)
    whatsapp: "https://wa.me/6281122233121",    // WhatsApp KAI 0811-2223-3121 — verifikasi sebelum dipublikasikan
    call:     "tel:121",                         // Contact Center KAI
    email:    "mailto:cs@kai.id"
  },

  /* ---------- Akun masuk ----------
     Disimpan sebagai hash SHA-256 (bukan kata sandi asli). Tetap verifikasi di sisi browser,
     jadi hanya penghalang tampilan. Membuat hash baru: buka Console browser lalu jalankan
     crypto.subtle.digest("SHA-256", new TextEncoder().encode("kpedia.v1:AKUN:KATASANDI")).then(b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join(""))
     (AKUN huruf kecil). Tempel hasilnya ke "hash". */
  auth: { salt: "kpedia.v1", hash: "8264e9021115238b47819d8c6b7e8f71923eb838aec5683530d9445e605316fe" },

  /* ---------- Iklan / informasi di beranda ----------
     Berganti otomatis tiap 3 detik. Gambar: assets/iklan-N.jpg (rasio poster portrait).
     link  : (opsional) tombol "Selengkapnya". Kosongkan "" bila tidak ada.   */
  adIntervalMs: 3000,
  ads: [
    { image: "assets/iklan-1.jpg", title: "Nama kereta resmi berganti",
      desc: "Mulai 1 Oktober 2026, sejumlah kereta api memakai identitas nama baru (contoh pada poster: KA Muria). Cek nama dan nomor KA terbaru sebelum memesan tiket.",
      link: "", linkLabel: "" },
    { image: "assets/iklan-2.jpg", title: "Railpoin bisa dipakai di KAI Services",
      desc: "Railpoin dapat digunakan langsung sebagai metode pembayaran atau potongan transaksi di Loko Cafe, Restorasi Kereta Api, dan Dining Car Whoosh.",
      link: "", linkLabel: "" },
    { image: "assets/iklan-3.jpg", title: "Perjalanan jauh, tetap seru",
      desc: "Hiburan enterTrain menemani perjalanan jauhmu lewat Access by KAI. Unduh aplikasinya dan coba sendiri.",
      link: "https://access.kai.id", linkLabel: "Buka Access by KAI" },
    { image: "assets/iklan-4.jpg", title: "KAI Giveaway 3 Day Pass",
      desc: "Tiket 3 Day Pass Synchronize Fest 2026 untuk 20 pemenang. Syarat dan ketentuan berlaku, lihat poster untuk detailnya.",
      link: "", linkLabel: "" },
    { image: "assets/iklan-5.jpg", title: "Kereta api dan gempa",
      desc: "Kenapa kereta api harus berhenti ketika atau setelah gempa? Simak infografis keselamatan perjalanannya.",
      link: "", linkLabel: "" }
  ],

  /* ---------- Menu Tarif Khusus ---------- */
  tarsus: {
    terms: [
      { t: "Berlaku pada relasi tertentu", d: "Tarif khusus hanya berlaku pada kereta, relasi, dan kelas yang tercantum di hasil pencarian." },
      { t: "Perhatikan arah perjalanan",   d: "Sebagian relasi berlaku searah, sebagian pulang pergi. Keterangannya tertulis pada setiap kartu tarif." },
      { t: "Kursi tidak dijamin tersedia", d: "Ada tarif belum tentu ada kursi. Cek ketersediaan di Access by KAI sebelum menyampaikan ke pelanggan." },
      { t: "Tarif dapat berubah",          d: "Tarif dan relasi dapat berubah sewaktu-waktu. Pastikan kembali ke sumber resmi dan ketentuan yang berlaku." },
      { t: "Referensi, bukan ketentuan resmi", d: "Informasi di K-Pedia membantu pencarian dan tidak menggantikan ketentuan resmi KAI." }
    ],
    steps: [
      { t: "Pilih cara mencari",   d: "Cari berdasarkan rute (stasiun asal dan tujuan) atau berdasarkan nama kereta." },
      { t: "Isi pencarian",        d: "Pilih nama stasiun dari saran yang muncul, atau pilih nama kereta dari daftar." },
      { t: "Baca hasilnya",        d: "Lihat relasi tarif khusus, arah perjalanan, dan harga per kelas." },
      { t: "Hitung hematnya",      d: "Masukkan tarif normal dan tarif khusus di simulasi untuk melihat selisihnya." },
      { t: "Cek tiket",            d: "Lanjut ke Access by KAI untuk memastikan kursi tersedia atau memesan tiket." }
    ]
  },

  /* ---------- Ensiklopedia ----------
     Isi sheetId dengan ID Google Sheets setelah spreadsheet siap, lalu minta
     perubahan sambungan database. Selama kosong, data bawaan wiki-data.js dipakai. */
  wiki: { sheetId: "", sheetEntries: "WIKI", sheetCategories: "WIKI_KATEGORI" }
};
