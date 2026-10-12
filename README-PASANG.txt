TARSUS FINDER — REVISI LANJUTAN 4.8.0
====================================

Paket ini melanjutkan revisi UI/UX berbasis source code yang kamu kirim. Mesin
pencarian dan data.js dipertahankan; perubahan berfokus pada pengalaman mobile,
Pusat Bantuan, panduan tour, dan halaman Tentang Aplikasi.

PERUBAHAN TAMBAHAN PADA VERSI INI
---------------------------------
- Pusat Bantuan kini memiliki FAQ, panduan tertulis per fitur, dan tautan email.
- Ditambahkan tour interaktif dengan langkah, progress, tombol lanjut/lewati,
  pilihan tour seluruh aplikasi atau tour fitur tertentu.
- Tour pengenalan ditawarkan setelah login prototipe pertama pada perangkat itu.
  Status penyelesaian disimpan lokal di browser.
- Halaman Tentang Aplikasi dipisahkan dari Pusat Bantuan.
- Foto pengembang dibuat bulat dan halaman Tentang memuat deskripsi aplikasi,
  profil pengembang, tautan Instagram, serta tautan LinkedIn sementara.
- Foto/logo avatar di navigasi samping dan badge jumlah favorit ditambahkan.
- Service worker menggunakan nama cache versi baru untuk memicu pembaruan aset.
- Tema visual tambahan untuk FAQ, kartu bantuan, panduan, dan tour responsif.

CARA MEMASANG
-------------
1. Simpan backup repository dan data lokal yang perlu dipertahankan.
2. Ekstrak ZIP ini.
3. Unggah ISI folder tarsus-backup-main ke root repository GitHub Pages, bukan
   folder pembungkusnya sebagai subfolder tambahan.
4. Pastikan seluruh folder assets ikut terunggah.
5. Commit perubahan dan tunggu deployment GitHub Pages selesai.
6. Uji di browser HP. Jika aplikasi PWA terpasang, tutup sepenuhnya lalu buka lagi
   agar service worker dan cache baru aktif.

YANG MASIH PERLU DISELESAIKAN / DIKONFIRMASI
--------------------------------------------
- Tautan LinkedIn pada halaman Tentang masih berupa halaman umum. Ganti dengan URL
  profil yang benar sebelum rilis.
- Background yang disertakan masih bisa diganti dengan foto portrait 1080x1920.
- FAQ ini berisi petunjuk penggunaan umum, bukan pengganti ketentuan resmi tarif.
  Tambahkan dokumen/sumber resmi untuk menjelaskan aturan tarif secara akurat.
- Tour ini merupakan panduan bertahap berbentuk modal, belum melakukan penyorotan
  elemen halaman secara langsung. Jika ingin spotlight yang mengikuti elemen UI,
  tahap berikutnya adalah mengembangkan tour anchor/spotlight.
- Pendaftaran/login akun sungguhan belum aman: autentikasi pada source awal masih
  prototipe sisi browser. Kredensial demo dapat dibaca dari source code publik.
  Jangan memakai ini untuk melindungi data atau password kerja. Backend autentikasi
  yang disetujui organisasi harus dipilih sebelum aplikasi dipakai sebagai sistem
  akun sungguhan. Tautan pengajuan akses hanya membuka email, bukan membuat akun.
- Penutupan tab/browser oleh JavaScript tidak dijamin browser. Tombol Keluar Aplikasi
  mencoba menutup jendela dan memberi penjelasan jika browser menolak; Keluar dari
  Akun adalah tindakan terpisah.
- Kunci orientasi portrait di manifest adalah permintaan untuk PWA; browser tertentu
  dapat mengabaikannya. Layout tetap harus diuji pada orientasi dan ukuran berbeda.

PENGUJIAN SEBELUM DIGUNAKAN
---------------------------
- Login prototipe, logout, refresh pada beberapa halaman, dan pemulihan setelah gagal.
- Pencarian dengan hasil, tanpa hasil, serta saat sumber data tidak terjangkau.
- Favorit, badge jumlah favorit, riwayat, hapus satu/semua bila tersedia.
- Pusat Bantuan: FAQ buka/tutup, panduan tertulis, tautan email, semua jenis tour.
- Tour otomatis untuk login pertama dan tidak muncul berulang setelah selesai.
- Tema terang/gelap, ukuran teks, banner manual/otomatis, sidebar, serta layar kecil.
- Cocokkan hasil tarif dengan sumber data resmi/internal sebelum dipakai operasional.

PENTING
-------
Paket ini belum menyelesaikan seluruh 18 poin sebagai produk final. Khususnya,
spotlight tour, autentikasi backend, pengujian bug blank screen pada perangkat
nyata, dan penyempurnaan desain beberapa kartu masih memerlukan tahap lanjutan.


CATATAN PENTING REVISI 4.8.0
- Service worker memakai strategi network-first untuk HTML, CSS, JavaScript, dan manifest agar perubahan kode tidak tertahan cache lama.
- Jika koneksi ke Google Sheets gagal, aplikasi menampilkan status gagal dan mencoba kembali saat koneksi kembali tersedia.
- Orientasi portrait diminta melalui manifest; browser biasa tetap dapat mengabaikan penguncian orientasi.
- Tombol Keluar mencoba menutup jendela, tetapi browser dapat melarang penutupan otomatis. Dalam kondisi itu sesi UI diakhiri dan petunjuk ditampilkan.
- Login saat ini MASIH prototipe browser (kredensial demo dapat dilihat di app.js), bukan autentikasi aman. Jangan masukkan password kerja sungguhan atau gunakan untuk data rahasia. Untuk produksi dibutuhkan backend autentikasi dan pendaftaran akun.
- Tour saat ini berbentuk panduan langkah bertahap; spotlight interaktif pada tiap elemen masih perlu diuji/dikembangkan.
- Paket ini belum diuji menyeluruh pada semua perangkat. Uji alur login, refresh, pencarian, favorit, riwayat, tour, dan kondisi koneksi sebelum dipakai operasional.
