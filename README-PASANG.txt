TARSUS FINDER — PAKET REVISI 4.6.0
====================================

Paket ini merupakan revisi awal berbasis source code yang kamu kirim. Mesin data
(data.js) dan sumber data tarif dipertahankan. Paket ini belum boleh dianggap
sebagai implementasi final seluruh daftar 18 poin; bagian tour interaktif lengkap,
akun/register aman, dan pemisahan halaman Tentang/Pusat Bantuan masih memerlukan
pekerjaan lanjutan setelah struktur dan kebutuhan datanya dikonfirmasi.

PERUBAHAN YANG SUDAH DITERAPKAN
-------------------------------
- Boot menggunakan assets/background-boot.jpg dengan lapisan gelap dan logo lebih
  besar; durasi boot dipersingkat.
- Login dibuat lebih ringkas dan kartu login diperkecil untuk layar mobile.
- Tombol login menjadi "Masuk". Tautan "Ajukan akses" membuka email permintaan akun.
- Sapaan waktu pada beranda menyesuaikan jam perangkat dan nama sesi.
- Banner informasi bergeser otomatis kira-kira setiap 4 detik serta tetap dapat
  digeser manual.
- Menu Tarif per Kereta tidak langsung menampilkan seluruh daftar; pengguna dapat
  menekan "Tampilkan semua kereta" atau mulai mengetik untuk menampilkan hasil.
- Kartu tarif diringkas, label harga terendah dan keterangan searah dihilangkan,
  relasi ditampilkan langsung, dan daftar relasi terlipat yang berulang di kartu
  dihilangkan.
- Dialog konfirmasi internal untuk operasi hapus dan keluar dari sesi menggantikan
  beberapa dialog bawaan browser.
- Service worker diberi versi cache baru, cache aset inti, dan strategi navigasi
  yang lebih aman untuk membantu mengurangi layar kosong setelah refresh.
- Manifest PWA meminta orientasi portrait. Browser tetap dapat mengabaikan
  penguncian orientasi pada kondisi tertentu.
- Ditambahkan failsafe agar boot tidak terus menutupi halaman apabila inisialisasi
  mengalami kegagalan.

YANG PERLU KAMU LAKUKAN
-----------------------
1. Sebelum mengganti repository, simpan backup repository yang sedang online.
2. Ekstrak ZIP ini. Unggah isi folder tarsus-backup-main ke root repository yang
   menerbitkan GitHub Pages. Jangan mengunggah folder pembungkusnya sebagai
   subfolder baru jika website sekarang menggunakan root repository.
3. Pastikan semua berkas assets ikut diunggah, khususnya:
   - assets/background-boot.jpg
   - assets/background.jpg
   - assets/logo.png
   - assets/logo-boot.png
   - assets/iklan-1.jpg sampai assets/iklan-5.jpg
   - assets/pengembang.jpg
4. background-boot.jpg yang disertakan saat ini berukuran persegi. Untuk hasil
   portrait yang lebih sinematik, kamu boleh menggantinya dengan foto 1080x1920
   (9:16), tanpa tulisan/logo, dengan subjek yang tidak terlalu ramai.
5. Commit dan tunggu GitHub Pages selesai deploy. Uji situs dengan refresh biasa,
   tutup/buka ulang tab, dan bila PWA terpasang, tutup/buka ulang PWA.
6. Karena cache browser bisa tertinggal, bila masih terlihat versi lama, tutup PWA
   sepenuhnya lalu buka kembali. Jika tetap lama, hapus data situs/cache aplikasi
   setelah memastikan data lokal favorit/riwayat yang ingin dipertahankan sudah
   dicatat.

PENGUJIAN YANG WAJIB DILAKUKAN
------------------------------
- Login, logout, refresh saat login, dan refresh saat berada di beranda.
- Pencarian relasi dengan hasil, tanpa hasil, serta saat koneksi data terputus.
- Pencarian kereta sebelum dan sesudah menekan "Tampilkan semua kereta".
- Favorit dan riwayat: simpan, hapus satu item jika tersedia, dan hapus semua.
- Buka/tutup sidebar, dialog konfirmasi, banner manual dan otomatis.
- Uji pada ukuran layar HP yang berbeda serta saat keyboard terbuka.
- Pastikan tarif yang tampil tetap sama dengan sumber data yang benar.

HAL PENTING TENTANG AKUN
------------------------
Kode sumber yang kamu kirim memakai autentikasi prototipe sisi browser dengan
kredensial yang ditulis langsung di JavaScript. Siapa pun yang dapat mengakses
situs publik dapat memeriksa source code dan membaca pemeriksaan tersebut.
Tautan "Ajukan akses" saat ini hanya membuka email; itu bukan pendaftaran akun
otomatis. Jangan gunakan mekanisme ini untuk melindungi data internal atau
password kerja sungguhan.

Agar pendaftaran/login sungguhan aman, kamu perlu memilih backend autentikasi
yang disetujui organisasi (misalnya layanan autentikasi yang sesuai kebijakan KAI
atau backend internal). Jangan mengirim password, token, atau secret ke chat.
Setelah backend dipilih, integrasi login dan register dapat dibuat dengan benar.

DATA DAN ASET YANG MASIH PERLU DILENGKAPI
-----------------------------------------
- URL LinkedIn profil pengembang yang benar (bukan halaman utama LinkedIn).
- Bio pengembang dan latar belakang aplikasi yang faktual, bila ingin mengganti
  deskripsi singkat saat ini.
- Materi FAQ resmi/terverifikasi seputar tarif khusus untuk isi Pusat Bantuan.
- Keputusan/akses backend autentikasi sebelum fitur register akun sungguhan dibuat.
- Jika ingin tour interaktif yang menyorot elemen aplikasi satu per satu, kita perlu
  menyelesaikan alur fitur dan memilih bagian mana saja yang wajib masuk tour awal.
  Tour lengkap belum diimplementasikan di paket ini.

CATATAN
-------
Jangan mengganti data.js atau konfigurasi sumber data tarif tanpa backup dan
pengujian. Paket ini mempertahankan mesin data yang dikirim, tetapi tetap lakukan
uji silang hasil pencarian terhadap referensi resmi/internal sebelum digunakan
dalam pekerjaan operasional.
