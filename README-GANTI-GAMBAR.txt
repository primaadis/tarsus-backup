CARA MENGGANTI LOGO DAN FOTO TARSUS

1. Di GitHub, buka folder proyek TARSUS.
2. Buat folder bernama assets jika belum ada, lalu upload logo.svg dan background.jpg ke dalamnya.
   (Paket ini sudah menyertakan assets/logo.svg sebagai logo sementara.)
3. Untuk foto background, beri nama persis: background.jpg.
4. Untuk logo, paling mudah gunakan SVG dan beri nama persis: logo.svg.
5. Upload/ganti index.html dan style.css dari paket ini. Data.js dan app.js tidak perlu diganti untuk urusan gambar.
6. Commit changes. Tunggu GitHub Pages memperbarui situs, lalu refresh. Jika masih gambar lama, refresh paksa (Ctrl+F5) atau hapus cache situs di HP.

MENGATUR EFEK FOTO
Buka style.css dan cari bagian: AREA EDIT FOTO & LOGO.
- blur background umum: cari body:before lalu ubah blur(13px).
- gelap/terang latar: cari body:after dan sesuaikan angka rgba.
- blur foto hero: cari .hero-section:before lalu ubah blur(3px).
- kekuatan foto hero: ubah opacity: .3.

JANGAN ubah data.js, app.js, ID Google Sheets, atau nama sheet untuk mengganti gambar.
