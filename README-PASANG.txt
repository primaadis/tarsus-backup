TARSUS FINDER — REBUILD 3.0.0

ISI PAKET
- index.html     : struktur aplikasi baru
- style.css      : tampilan responsif, cinematic, mode terang/gelap
- app.js         : interaksi antarmuka dan pencarian
- data.js        : mesin database Google Sheets dan aturan pencarian sebelumnya
- manifest.json  : konfigurasi PWA
- sw.js          : service worker dengan cache versi baru
- icon.svg       : ikon aplikasi

DATABASE YANG DIPERTAHANKAN
Google Sheets ID: 1a4Ln_wASazV35F2M3MKZcJHEmiAV8G-0WmkMmU4Csls
Sheet: MASTER_KA, MASTER_TARIF, MASTER_STASIUN
Header tarif yang digunakan: ID_TARIF, ID_KA, ARAH, POLA_RELASI, STASIUN_1 sampai STASIUN_15, EKS, BIS, EKO, STATUS.

ATURAN PENTING
- Tarif diambil dari Google Sheets, bukan data contoh lokal.
- Relasi pulang-pergi dapat dicari dari kedua arah.
- Relasi searah mengikuti urutan stasiun pada data tarif.
- Hasil dikelompokkan berdasarkan nama kereta; tarif terendah menjadi tarif utama, sisanya alternatif.
- Tarif Eksekutif, Bisnis, Ekonomi tetap ditampilkan jika tersedia.
- Saran stasiun hanya menampilkan nama stasiun.
- Mode terang/gelap disimpan di perangkat.
- PWA dan cache memakai versi baru agar file lama tidak terus digunakan.

CARA MEMASANG DI GITHUB PAGES
1. Simpan/cadangkan repository yang lama terlebih dahulu.
2. Ekstrak ZIP ini.
3. Unggah isi folder ini ke root repository tarsus-backup (jangan mengunggah folder pembungkus TARSUS-Finder-Rebuild sebagai satu folder).
4. Jangan hapus folder assets lama. Jika di repository lama ada assets/logo.png atau assets/background.jpg, pertahankan keduanya; versi ini tidak bergantung pada file tersebut agar tetap berjalan jika aset tidak tersedia.
5. Commit perubahan ke branch yang dipakai GitHub Pages.
6. Setelah deployment, buka situs lalu lakukan hard refresh. Bila aplikasi terpasang sebagai PWA, tutup sepenuhnya lalu buka kembali.

CATATAN PENGUJIAN
File statis dan sintaks dapat diperiksa lokal. Pemuatan Google Sheets perlu diuji pada browser dengan koneksi internet dan izin akses sheet yang benar. Jika database gagal dimuat, pastikan ketiga sheet dapat dibaca melalui tautan CSV Google Sheets.
