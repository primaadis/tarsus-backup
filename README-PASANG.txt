TARSUS FINDER — CINEMATIC UI 4.1.0
==================================

FILE DALAM PAKET
- index.html      Struktur layar, beranda, sidebar, login UI, dan halaman fitur
- style.css       Desain cinematic blue glass dan responsif HP/tablet/PC
- app.js          Navigasi, login UI prototype, pencarian, favorit, riwayat, direktori
- data.js         Mesin data tarif lama dengan tambahan API daftar KA dan tarif per KA
- manifest.json   Konfigurasi PWA
- sw.js           Service worker dan cache versi baru

CARA MEMASANG DI GITHUB PAGES
1. Unduh ZIP ini lalu ekstrak.
2. Unggah ISI folder hasil ekstrak ke root repository yang menerbitkan situs https://primaadis.github.io/tarsus/ (repo tarsus).
3. Pertahankan folder assets milikmu yang sudah ada, khususnya:
   assets/background.jpg
   assets/logo.png
   Jangan menimpa atau menghapus kedua file tersebut.
4. Jangan mengubah ID Google Sheets dan nama sheet MASTER_KA, MASTER_TARIF,
   MASTER_STASIUN. data.js di paket ini mempertahankan koneksi lama.
5. Commit perubahan, tunggu GitHub Pages selesai deploy, lalu buka aplikasi.
6. Jika versi lama masih tampil, tutup aplikasi/PWA sepenuhnya lalu buka ulang.

CATATAN PENTING TENTANG LOGIN
Layar login pada paket ini masih berupa PROTOTIPE ANTARMUKA. ID petugas dipakai
untuk memisahkan favorit dan riwayat di penyimpanan lokal perangkat. Kata sandi
belum diverifikasi oleh server, sehingga login ini TIDAK mengamankan situs publik.
Karena aplikasi ditujukan untuk internal, jangan memasukkan kata sandi kerja yang
sebenarnya dan jangan menganggap aplikasi sudah privat. Sebelum penggunaan internal
produksi, integrasikan autentikasi server (misalnya Firebase Authentication atau
backend perusahaan) dan batasi akses data dengan aturan server yang sesuai.

PENYIMPANAN FAVORIT & RIWAYAT
Disimpan lokal per ID petugas dan per browser/perangkat. Belum disinkronkan antar
perangkat. Menghapus data browser dapat menghapus favorit dan riwayat lokal.

DATABASE
Google Sheets harus dapat dibaca oleh aplikasi. Mesin pencarian tarif yang lama
tetap digunakan; penambahan API hanya membuka daftar kereta dan tarif untuk halaman
baru. Kebenaran hasil tetap mengikuti isi dan status pada spreadsheet.

ASSET
Paket ini sengaja tidak membawa ulang gambar logo/background. Gunakan aset asli
milikmu di assets/logo.png dan assets/background.jpg. Jika path repository-mu
berbeda, sesuaikan path di index.html dan style.css.


VERSI 4.1.0 — FOKUS MOBILE
- UI mobile disusun ulang dengan tab bar bawah dan drawer menu lengkap.
- Pengaturan: mode warna, ukuran teks, kurangi animasi, getaran sentuh, halaman awal, hapus data lokal.
- Bantuan terhubung ke email primaadis46@gmail.com; Instagram pengembang @prima_adis.
- Rating bintang disimpan lokal dan dapat membuka email apresiasi; donasi diarahkan ke email untuk meminta informasi metode dukungan.
- Manifest menggunakan assets/logo.png agar ikon aplikasi mengikuti logo yang dipakai di dalam aplikasi. Pastikan aset tersebut ada di repository.
- Login tetap prototipe UI, bukan autentikasi server.
- Optimasi CSS/animasi tidak menjamin 60–90 FPS di semua perangkat; hasil bergantung perangkat dan ukuran aset.
