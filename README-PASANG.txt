TARSUS FINDER — PAKET PEMBARUAN UI v1.1.1

ISI PAKET
- index.html
- style.css
- app.js
- data.js
- manifest.json
- sw.js

CARA MEMASANG
1. Ekstrak ZIP ini.
2. Salin keenam file ke folder utama repository tarsus-backup di GitHub.
3. Timpa file lama dengan file dari paket ini.
4. JANGAN hapus folder assets yang sudah ada di repository.
   Pastikan file berikut tetap tersedia:
   assets/logo.png
   assets/background.jpg
5. Commit perubahan, lalu tunggu GitHub Pages selesai memperbarui situs.
6. Jika aplikasi masih menampilkan tampilan lama, tutup aplikasi/PWA sepenuhnya lalu buka kembali. Service worker pada paket ini memakai cache baru.

PERUBAHAN
- Saran stasiun hanya menampilkan nama stasiun, tanpa Daop, nomor urut, atau panah tambahan.
- Notifikasi pop-up rutin dan pesan sukses database dihilangkan agar tidak mengganggu.
- Pesan kesalahan yang perlu ditindaklanjuti tetap ditampilkan dekat kolom pencarian.
- Navigasi bawah dihapus sepenuhnya. Semua navigasi tetap melalui panel samping agar area pencarian dan hasil lebih luas di layar ponsel.
- Versi aplikasi dinaikkan ke 1.1.1 dan cache PWA diperbarui.
- Logika pencarian tarif dan data.js dipertahankan.

- Ruang layar ponsel tidak lagi dipotong oleh bar bawah.
