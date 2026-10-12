TARSUS FINDER — REVISI 5.0.0

Penyempurnaan ini meneruskan source aplikasi dan mesin pencarian yang sudah ada. Fokus revisi adalah navigasi bawah mobile yang konsisten dengan mockup UI/UX dan pola aplikasi perjalanan modern.

PERUBAHAN VERSI 5.0.0
- Menambahkan navigasi bawah untuk layar mobile: Beranda, Cari Tarif, Kereta, Favorit, dan Lainnya.
- Navigasi bawah tersinkron dengan menu samping, sehingga status halaman aktif tetap konsisten.
- Tombol Lainnya membuka drawer untuk Direktori Stasiun, Riwayat, Pusat Bantuan, Tentang, dan Pengaturan.
- Badge jumlah favorit ditampilkan pada tab Favorit saat ada item tersimpan.
- Menambahkan jarak aman di bawah konten agar tidak tertutup navigasi bawah dan memperhatikan safe area perangkat.
- Tema awal pengguna baru menjadi terang, sesuai arah mockup; pilihan tema yang sudah tersimpan tetap dihormati.
- Cache service worker dinaikkan ke versi 5.0.0 agar browser mengambil aset terbaru.
- Logika pencarian tarif dan pemetaan data.js tidak diubah.

CARA MEMASANG
1. Backup repository yang sedang aktif.
2. Ekstrak ZIP dan unggah ISI folder tarsus-backup-main ke root repository GitHub Pages.
3. Pastikan folder assets dan seluruh file ikut terunggah.
4. Commit perubahan dan tunggu deployment selesai.
5. Tutup lalu buka ulang PWA/browser agar cache versi baru aktif.

CATATAN PENTING
- Login saat ini masih prototipe sisi browser, bukan autentikasi aman. Jangan gunakan untuk melindungi kredensial atau data sensitif sebelum backend autentikasi resmi tersedia.
- Tautan LinkedIn di halaman Tentang masih perlu diganti dengan URL profil yang benar.
- Pengujian sintaks JavaScript, service worker, dan manifest dilakukan. Uji browser otomatis tidak dapat dijalankan pada lingkungan ini karena browser menolak akses lokal; tetap lakukan uji perangkat setelah deploy.
