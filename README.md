# K-Pedia 8.0

## Yang baru di 8.0 — redesign premium

- **Sistem desain baru** (`kp-ui.css`): aksen merah sebagai identitas, tema **Terang** dan **Gelap** yang dirancang terpisah (bukan sekadar dibalik), huruf Bricolage Grotesque (judul) dan Plus Jakarta Sans (isi), permukaan konten solid dan terbaca.
- **Kaca (glassmorphism) selektif** hanya pada topbar, sidebar, navigasi bawah, panel pencarian, kartu dan kolom RAKA, dialog, dan menu akun.
- **Navigasi:** sidebar kaca dan topbar kaca di desktop; **navigasi bawah melayang** di HP (Beranda, Tarif, Peta, RAKA, Menu); **tombol tema** terang/gelap di topbar; **menu akun** (Pengaturan, Keluar).
- **Gerak** mengikuti prinsip desain interaksi: kurva kuat, durasi di bawah 300 ms, umpan balik saat ditekan, hover hanya di perangkat yang punya hover, animasi masuk berjenjang hanya sekali per sesi, dan menghormati `prefers-reduced-motion`.
- **Boot** (animasi logo) dipercepat sekitar 40 persen, bisa dilewati dengan ketuk atau tombol, dan tampil sekali per sesi.
- **RAKA** punya identitas visual sendiri: lambang kereta dengan lampu sinyal, dan indikator memuat berupa dua lampu sinyal bergantian.
- File baru: `kp-shell.js`. Diperbarui: `kp-ui.css`, `raka.css`, `index.html`, `app.js` (boot dan warna tema), `sw.js`.
- Catatan: set ikon yang ada sudah satu keluarga garis dan dipertahankan; ikon baru ditambahkan dengan gaya yang sama.

# K-Pedia 7.0

## Yang baru di 7.0

- **Akun tunggal.** Masuk dan Daftar dalam satu layar di awal; sekali proses. Menggantikan login lama (satu kata sandi bersama yang hanya diperiksa di browser). Akun disimpan di Worker `kpedia-ai`, admin menyetujui pendaftaran, dan halaman "Menunggu persetujuan" terbuka otomatis begitu akun disetujui. Favorit dan riwayat lokal lama disalin ke akun pertama yang masuk di perangkat.
- **RAKA** (Railway Assistant KAI) ada di Beranda dan di menu RAKA: mencari info (data K-Pedia dulu, lalu internet), menjelaskan cara memakai K-Pedia, membantu menulis, membaca foto/PDF/DOCX/teks. Pertanyaan sulit dijawab dengan **mode teliti** (rencana, cari, baca halaman sumber, bandingkan) dan menampilkan "Langkah RAKA". Setiap jawaban ditutup "Sudah sesuai?".
- **Notifikasi email ke admin** untuk pendaftaran baru dan pengetahuan baru yang menunggu verifikasi (lewat Resend; atur di Worker, lihat komentar di `worker.js`).
- **Desain baru** (`kp-ui.css`): permukaan datar, garis tipis, huruf Newsreader (judul) dan Plus Jakarta Sans (isi), warna dari logo (navy dan oranye). Layar sapaan penuh sesudah login dan maskot di layar login dinonaktifkan; layar boot logo tetap ada.
- Ensiklopedia KAI tetap ada sebagai pencarian manual tanpa AI dan menjadi database lokal RAKA.
- File baru: `kp-auth.js`, `kp-ui.css`, `raka.js`, `raka.css`, folder `vendor/` (pdf.js dan JSZip; lihat `vendor/LICENSES.txt`).
- Catatan keamanan: pembatasan akses di tampilan tidak melindungi data tarif di Google Sheets yang tautannya publik. Yang benar-benar diamankan di server adalah RAKA, akun, dan panel admin.

# K-Pedia 6.3

## Yang baru di 6.4 — tema Claymorphism

- Seluruh tampilan beralih dari glassmorphism ke claymorphism (`clay.css`, dimuat terakhir): permukaan lembut menggembung, sudut sangat bulat, bayangan ganda, tombol yang menekan saat disentuh, input cekung. Mode terang dan gelap sama-sama dirombak. Latar foto diganti warna clay polos.
- Font: Nunito (isi) dan Fredoka (judul), dimuat dari Google Fonts. Teks gradien pada judul dihapus. Tanpa internet, font cadangan sistem dipakai.
- `dialogs.js`: dialog konfirmasi kustom (keluar akun, hapus riwayat, hapus favorit) dan notifikasi toast beri ikon, menggantikan `confirm()` bawaan browser. Ada notifikasi saat mode tampilan diganti.
- Data dan konten tidak diubah. Untuk mengubah warna, edit variabel di bagian atas `clay.css`.

## Yang baru di 6.3

- **Ensiklopedia KAI lengkap**: 23 halaman tematik (pemesanan, mitra penjualan, check-in dan face recognition, pembatalan dan refund, ubah jadwal, bagasi, barang terlarang, syarat penumpang, kelas kereta, KRL, LRT, Whoosh, KA Bandara, kontak, barang tertinggal, sejarah, organisasi, dasar hukum, istilah). Topik yang berkaitan digabung dalam satu halaman dengan bagian ber-judul.
- **Sumber jelas**: setiap halaman mencantumkan judul, penerbit, tanggal, dan tautan sumber. Seluruh sumber tercatat di sheet `DAFTAR_SUMBER`. Bagian dari versi lama atau pengetahuan umum diberi catatan *perlu verifikasi*.
- **Pencarian bahasa natural** (`search-engine.js`): ketik seperti bertanya, misalnya "gimana cara batalin tiket" atau "bayi umur 2 tahun perlu tiket ga". Mesin memahami sinonim, salah ketik, dan maksud pertanyaan, lalu menampilkan *Jawaban cepat* (dari sheet `WIKI_FAQ`) dan topik yang cocok, langsung melompat ke bagian yang relevan. Berjalan di browser, tanpa server dan tanpa biaya. Menambah sinonim: objek `SYN` di `search-engine.js`.
- **Navigasi bawah dihapus**; menu memakai sidebar. Tampilan ensiklopedia dirapikan (kategori dapat digeser, daftar isi halaman, kartu lebih terbaca).
- Spreadsheet kini punya sheet `WIKI`, `WIKI_KATEGORI`, `WIKI_FAQ`, `DAFTAR_SUMBER`, `PETUNJUK`. Format isi: `## Judul bagian`, `- poin`, `1. langkah`.
- Saat tersambung ke Google Sheets, sheet `WIKI_FAQ` ikut dibaca (opsional; bila tidak ada, FAQ bawaan dipakai).

**Penting:** angka seperti bea 25%, batas 2 jam / 30 menit, bagasi 20 kg, tarif KRL/LRT/Whoosh, dan nomor WhatsApp berasal dari pemberitaan dan dapat berubah. Cocokkan dengan kai.id / Access by KAI sebelum dipublikasikan.

Pusat informasi perkeretaapian (dulu TARSUS Finder). Menu utama:

| Menu | Isi |
|---|---|
| **Beranda** | Pencarian utama (kereta, stasiun, istilah, menu), 3 menu, dan iklan otomatis tiap 3 detik |
| **Tarif Khusus** | Cari per rute atau nama kereta (tetap seperti sebelumnya), simulasi hemat, cek tiket Access by KAI, cara menggunakan, syarat dan ketentuan |
| **Peta & Stasiun** | Peta jalur kereta api dan daftar nama stasiun beserta detailnya |
| **Ensiklopedia KAI** | Istilah, jenis rangkaian, cara pemesanan dan pembatalan tiket |

Koneksi Google Sheets (`data.js`), PWA, login, favorit, dan riwayat tidak diubah.

## 1. Menjalankan dan memasang

- **GitHub Pages**: ganti seluruh isi repo `primaadis/tarsus-backup` dengan isi ZIP ini, lalu commit. Alamatnya tetap `https://primaadis.github.io/tarsus-backup/`.
- **Lokal**: buka folder ini di terminal, jalankan `python3 -m http.server 8000`, lalu buka `http://localhost:8000`.
- Setelah memperbarui file, buka aplikasi dua kali (atau hapus data situs) agar service worker memuat versi baru. Jika perubahan tidak muncul, naikkan angka `CACHE_NAME` di `sw.js`.

## 2. Struktur file

| File | Fungsi | Sering diedit? |
|---|---|---|
| `content.js` | Iklan, tautan Access by KAI, syarat dan cara pakai Tarif Khusus | Ya |
| `stations-info.js` | Informasi stasiun (peta + detail stasiun) | Ya |
| `wiki-data.js` | Data ensiklopedia bawaan (dibuat dari spreadsheet) | Jarang, lebih mudah lewat spreadsheet |
| `K-Pedia-Ensiklopedia.xlsx` | Database ensiklopedia yang mudah diedit | Ya |
| `data.js` | Koneksi dan aturan data tarif | Jangan diubah |
| `app.js`, `style.css`, `index.html` | Logika dan tampilan | Hanya bila mengubah fitur |
| `assets/` | Logo, latar, poster iklan, foto stasiun | Ya |

## 3. Tutorial pengisian

### 3.1 Mengubah iklan di beranda
1. Siapkan poster (disarankan rasio portrait 3:4, lebar minimal 800 px) dan simpan di `assets/`, misalnya `iklan-6.jpg`.
2. Buka `content.js`, cari `ads: [` lalu salin satu blok `{ image: ..., title: ..., desc: ..., link: ..., linkLabel: ... }`.
3. Isi `title` (judul singkat), `desc` (deskripsi 1 sampai 2 kalimat), dan `link` (kosongkan `""` jika tidak ada tombol).
4. Urutan di daftar = urutan tampil. Kecepatan ganti diatur `adIntervalMs` (3000 = 3 detik).
5. Tambahkan nama file gambar ke daftar `OPTIONAL_ASSETS` di `sw.js` agar tersedia offline.

### 3.2 Mengubah teks Tarif Khusus
Di `content.js`, bagian `tarsus`: `terms` untuk **Syarat dan ketentuan**, `steps` untuk **Cara menggunakan**. Tautan Access by KAI dan kontak ada di `links`. **Teks bawaan bersifat umum, cocokkan dengan ketentuan resmi sebelum dipublikasikan.**

### 3.3 Mengisi informasi stasiun (detail, foto, peta)
Buka `stations-info.js`. Satu stasiun = satu blok. Untuk **menambah stasiun**, salin satu blok lalu ubah:

| Kolom | Keterangan |
|---|---|
| `id` | kode unik huruf kecil, mis. `jat` |
| `nama` | nama stasiun, sama dengan `NAMA_STASIUN` di Google Sheets |
| `alias` | nama lain untuk pencocokan, mis. `["Jatinegara","Meester Cornelis"]` |
| `kategori` | `antarkota`, `commuter`, `bandara`, `whoosh`, atau `heritage` |
| `status` | `active` atau `inactive` |
| `region`, `provinsi`, `kota` | wilayah (samakan penulisan Daop/Divre dengan sheet agar filter rapi) |
| `koordinat` | `[lintang, bujur]`, ambil dari Google Maps (klik kanan pada lokasi). Kosongkan `[]` bila belum ada, stasiun tetap tampil di daftar namun tidak muncul di peta |
| `ulasan`, `deskripsi`, `sejarah`, `fasilitas`, `denah` | isi sesukamu. **Bagian yang kosong otomatis disembunyikan** |

**Foto**: simpan sebagai `assets/stations/<kode>.jpg` (kode = nilai `foto` di blok, mis. `assets/stations/jat.jpg`). Rasio 16:9, lebar 1200 px, di bawah 300 KB. Jika file belum ada, tampil gambar placeholder.

Stasiun yang ada di Google Sheets namun belum punya blok di sini tetap muncul di **Nama Stasiun** dengan data dasar dan daftar kereta tarif khusus yang melintas. Stasiun berbadge **Info** sudah punya detail.

> Data awal diambil dari ZIP railmap (27 stasiun) dan hanya dirapikan. Ulasan, tahun, dan fasilitas di dalamnya belum saya verifikasi, mohon cek sebelum dipublikasikan.

### 3.4 Peta
- Peta memakai Leaflet (dimuat dari internet saat menu Peta dibuka), dasar peta Esri/OSM, dan jalur rel dari OpenRailwayMap. **Peta butuh koneksi internet.**
- Pin hanya muncul untuk stasiun yang punya `koordinat`. Warna pin mengikuti `kategori`.
- Mengubah warna atau nama kategori: objek `CAT` di `app.js`.

### 3.5 Ensiklopedia (lewat spreadsheet)
1. Buka `K-Pedia-Ensiklopedia.xlsx` (bisa diunggah ke Google Sheets: Drive > Baru > Unggah file > Buka dengan Google Sheets). Baca sheet **PETUNJUK**.
2. Edit sheet **WIKI** (satu baris = satu topik) dan **WIKI_KATEGORI**. Teks biru boleh diubah. Format kolom `ISI`: baris kosong = paragraf baru, `- ` = poin, `1. ` = langkah.
3. **Sementara** (sebelum tersambung): salin perubahan ke `wiki-data.js`, atau minta saya membuatkan ulang `wiki-data.js` dari spreadsheet yang sudah kamu edit.
4. **Saat sudah tersambung ke Google Sheets**: bagikan sheet sebagai "Siapa saja yang memiliki link: Pelihat", isi `wiki.sheetId` di `content.js` dengan ID sheet (bagian antara `/d/` dan `/edit` pada URL). Kode penyambung sudah disiapkan; selama `sheetId` kosong, data bawaan dipakai. Nama sheet dan kolom harus persis seperti file ini.

Semua isi ensiklopedia bawaan adalah ringkasan umum dan sebagian bersumber dari pemberitaan (kolom `SUMBER`). **Baris bertanda "Perlu verifikasi" harus dicek ke sumber resmi KAI**. Ini mencakup ketentuan pembatalan (bea 25%, batas 2 jam dan 30 menit), nomor WhatsApp KAI, dan tarif KRL.

### 3.6 Latar belakang
Mode gelap memakai `assets/background.jpg` (senja), mode terang memakai `assets/background-boot.jpg` (siang). Ganti file dengan nama sama untuk mengubahnya (portrait, sekitar 900 x 1200 px, di bawah 400 KB). Tingkat kekaburan: `--blur` di `style.css`.

### 3.7 Logo boot screen
Animasi memakai bentuk vektor huruf K (`TARGET` di fungsi `runBoot`, `app.js`) dan `assets/logo-wordmark.png` untuk tulisan "-PEDIA by KAI". Jika logo diganti, bentuk vektor K perlu disesuaikan.

## 4. Catatan penting

- **Login** (`admin`) hanya penghalang tampilan di sisi browser (tidak aman). Jangan menyimpan data rahasia di aplikasi ini.
- Tidak ada klaim sebagai aplikasi resmi KAI. Tautan hanya mengarah ke Access by KAI.
- Tarif, relasi, dan ketentuan dapat berubah. Selalu pastikan ke sumber resmi.

## 5. Pembaruan 6.2

- **Login**: kata sandi tidak lagi tertulis di kode, hanya hash SHA-256 di `content.js` (`auth`). Tetap verifikasi di sisi browser. Cara mengganti akun ada di komentar `content.js`. Lima kali salah = jeda 30 detik.
- **Maskot Si Loko** (`mascot.js` + bagian LOGIN di `theme-pro.css`): mata mengikuti kursor/jari, tutup mata saat mengetik sandi, ketuk untuk klakson, berangkat saat berhasil masuk.
- **Data Google Sheets tetap terhubung.** Ganti `TARSUS_SHEET_ID` di `data.js` saat spreadsheet baru siap. Hasil terakhir disimpan di perangkat sehingga tetap terbaca saat offline (otomatis ikut kunci ID sheet, jadi sheet baru tidak bercampur data lama).
- Perbaikan: carousel tidak macet di HP, stasiun divalidasi sebelum pencarian, favorit memakai data terbaru, tombol Coba lagi saat data gagal, riwayat tidak ganda karena huruf besar/kecil, focus trap dialog.
