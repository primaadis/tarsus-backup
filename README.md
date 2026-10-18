# KAIPEDIA — Paket Redesign

Paket ini mengembangkan proyek TARSUS/K-Pedia yang Anda unggah menjadi hub informasi perkeretaapian. Fitur pencarian tarif khusus lama tetap dipertahankan; fitur informasi baru ditambahkan.

## Fitur dalam paket
- Boot screen: animasi logo dengan reveal/morph-style scale, blur, glow, dan pulse; menghormati `prefers-reduced-motion`.
- Glassmorphism: panel, navigasi, kartu, dan pencarian memakai latar transparan dengan blur; gambar latar memakai `assets/background.jpg`.
- Beranda: pencarian utama dan pintasan Tarif Khusus, Peta Jalur, Peta & Daftar Stasiun, Ensiklopedia; carousel editorial berganti setiap 3 detik dengan judul, deskripsi, gambar, dan tombol.
- Tarif Khusus: mesin dua mode yang sudah ada dipertahankan (pencarian berdasarkan rute/stasiun dan berdasarkan nama KA). Halaman lama, riwayat, favorit, panduan, dan pengaturan tetap ada.
- Peta Jalur Kereta Api: ringkasan skematik kategori data lokal dari paket `railmap-main`. Bukan peta geospasial real-time atau sumber operasional resmi.
- Peta & Daftar Stasiun: direktori filter kategori/nama/kode/kota/wilayah dan kartu detail. Dataset sumber awal disalin ke `railmap-data/data-stations.js`.
- Ensiklopedia KAI: kamus istilah dan panduan awal pemesanan/pembatalan/jenis rangkaian ditanam dalam `kaipedia.js` agar bisa dikembangkan.

## Menjalankan
1. Ekstrak ZIP.
2. Jalankan server lokal, misalnya `python -m http.server 8000` dari folder hasil ekstrak.
3. Buka `http://localhost:8000`.
4. Untuk GitHub Pages, unggah isi folder proyek ke root repository dan commit.
5. Setelah deploy, tutup PWA sepenuhnya dan buka kembali agar service worker mengambil versi baru.

## Struktur penting
- `index.html`: struktur aplikasi dan urutan pemuatan skrip.
- `style.css`: tema utama lama dan lapisan visual glassmorphism KAIPEDIA di bagian akhir.
- `app.js`, `data.js`: mesin aplikasi/tarif lama; koneksi data tarif yang sudah ada dipertahankan.
- `kaipedia.js`: beranda hub, carousel iklan, direktori stasiun, detail stasiun, ensiklopedia dan panduan awal.
- `railmap-data/data-stations.js`: dataset peta/stasiun dari ZIP railmap yang Anda berikan.
- `assets/`: latar, logo, video boot/login, dan poster.
- `KAIPEDIA-DATABASE-TEMPLATE.xlsx`: workbook template untuk rencana database online.

## Mengubah gambar dan iklan
- Latar utama: ganti `assets/background.jpg` dengan gambar 16:9/landscape yang tidak terlalu ramai. Pertahankan nama file agar tidak perlu mengubah CSS.
- Latar login: `assets/background-boot.jpg`; video login/boot: `assets/background-animation-boot.mp4`.
- Logo boot: `assets/logo-boot.png`; fallback/logo umum: `assets/logo.png`.
- Poster carousel saat ini: `assets/iklan-1.jpg` sampai `assets/iklan-5.jpg`. Ganti gambar dengan mempertahankan nama, atau ubah daftar `ads` di `kaipedia.js` untuk judul, deskripsi, gambar, label, dan URL.
- Carousel berganti tiap 3 detik. Untuk mengubah durasi, ubah `setInterval(...,3000)` di `kaipedia.js`.

## Mengelola konten ensiklopedia
Data contoh istilah dan artikel saat ini berada pada array `glossary` dan `articles` di bagian atas `kaipedia.js`. Tambahkan item sesuai bentuk data di sekitar item yang sudah ada. Konten contoh perlu diverifikasi sebelum dianggap sebagai kebijakan resmi. Jangan mempublikasikan instruksi operasional yang tidak bersumber.

## Workbook database
File `KAIPEDIA-DATABASE-TEMPLATE.xlsx` berisi sheet:
- `ISTILAH`: kamus istilah.
- `PANDUAN`: artikel/panduan.
- `STASIUN`: profil stasiun, fasilitas, sejarah, gambar, koordinat, dan sumber.
- `JALUR`: data jalur/lintas.
- `IKLAN`: judul, deskripsi, gambar, CTA, URL, dan periode aktif.
- `TARIF_KHUSUS`: contoh skema untuk pengelolaan tarif.
- `README`: petunjuk singkat.

**Penting:** workbook ini adalah template terpisah; kode saat ini belum membaca workbook tersebut secara otomatis. Saat Anda siap, unggah workbook ke Google Drive lalu konversi menjadi Google Sheets. Setelah itu, hubungkan tiap sheet melalui endpoint CSV publik yang sesuai atau Google Apps Script. Untuk tarif, pertahankan struktur/master data yang sudah terhubung pada `data.js`; jangan mengganti ID atau nama sheet lama sebelum memigrasikan dan menguji data. Jangan membuat sheet dapat diakses publik bila isinya memuat data internal/terbatas.

## Catatan kualitas data
- Dataset peta/stasiun dari ZIP sumber adalah dataset awal, bukan jaminan kelengkapan/akurasi terkini. Beberapa entri mungkin hanya punya nama, kategori, koordinat, atau status; kartu detail akan menyatakan data yang belum tersedia alih-alih mengarang fasilitas/sejarah.
- Detail stasiun menggunakan data `description`, `facilities`, dan `history` bila properti tersebut tersedia; bila tidak, tampil placeholder transparan.
- Tarif dan ketentuan harus dikonfirmasi melalui kanal resmi. CTA Access by KAI saat ini membuka `https://booking.kai.id/`; sesuaikan bila URL resmi yang ingin digunakan berbeda.
- Animasi berusaha ringan dan mengandalkan CSS transform/opacity. Performa 60 FPS tetap dipengaruhi perangkat, browser, ukuran gambar, dan video; kompres media besar jika diperlukan.
