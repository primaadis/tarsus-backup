# K-Pedia 5.0

Platform pencarian informasi perkeretaapian (sebelumnya **TARSUS Finder**).
Versi ini berfokus pada pencarian tarif khusus kereta api dengan dua mode: **berdasarkan rute** (stasiun asal dan tujuan) dan **berdasarkan nama kereta**.

Aplikasi statis (HTML, CSS, JavaScript biasa) tanpa proses build dan tanpa dependensi baru.

## Isi paket

| Berkas | Fungsi |
|---|---|
| `index.html` | Struktur layar: login, beranda, navigasi, halaman fitur |
| `style.css` | Gaya. Lapisan **K-Pedia 5.0** ada di bagian paling bawah (token warna terang/gelap, beranda, mode pencarian, kartu hasil) |
| `app.js` | Tampilan dan interaksi (navigasi, tema, pencarian, favorit, riwayat) |
| `data.js` | Mesin data dan aturan tarif. **Tidak diubah** dari versi sebelumnya |
| `manifest.json`, `sw.js` | Konfigurasi PWA dan service worker |
| `assets/` | Logo, latar, video login, poster informasi, foto pengembang |
| `README-PASANG.txt` | Catatan versi lama (riwayat), dipertahankan |

## Menjalankan secara lokal

```
python3 -m http.server 8000
```

Buka `http://localhost:8000/`. Jangan membuka `index.html` langsung dari berkas (service worker dan data Google Sheets memerlukan http).
Catatan: dua aturan CSS lama memakai path `/tarsus-backup/assets/background-boot.jpg` (untuk GitHub Pages). Saat dijalankan di root lokal, gambar latar boot itu tidak termuat; ini perilaku versi sebelumnya dan tidak memengaruhi fungsi.

## Menerapkan ke GitHub Pages

1. Ekstrak ZIP, lalu unggah **isi** folder `K-Pedia` ke root repository `tarsus-backup` (timpa berkas lama, pertahankan folder `assets`).
2. Commit dan tunggu GitHub Pages selesai deploy.
3. Jika tampilan lama masih muncul, tutup aplikasi/PWA sepenuhnya lalu buka lagi. Cache lama (`tarsus-mobile-v4.5.2`) otomatis dihapus oleh service worker baru (`tarsus-mobile-v5.0.0`).
4. Sebelum menimpa produksi, sebaiknya coba dulu di branch atau repository terpisah.

## Yang diubah

- **Identitas:** nama tampil menjadi K-Pedia (judul, meta, login, sidebar, breadcrumb, footer, manifest, pesan). Identifier teknis sengaja tidak diganti: `TARSUS_DATA`, kunci `localStorage` (`tarsus:*`, `tarsus-pref:*`), ID Google Sheets, nama sheet, nama repository, dan awalan cache `tarsus-`.
- **Beranda:** dua mode pencarian langsung terlihat (sebelumnya harus mengetuk "Mulai pencarian"); pintasan Direktori stasiun, Favorit, Riwayat; poster informasi dipindah ke bawah dan teks placeholder dihapus.
- **Navigasi:** menu "Navigasi cepat" yang dilipat diratakan; tombol segmented Rute / Kereta di kedua halaman pencarian; lencana jumlah Favorit.
- **Tema:** token warna terpisah untuk terang dan gelap, permukaan polos di dalam aplikasi (foto latar hanya di login), kontras terukur. Tema default kini mengikuti perangkat; pilihan manual tetap disimpan dan tidak ditimpa. Tema diterapkan sebelum render pertama (tanpa kilatan).
- **Tipografi:** Playfair Display dihapus (DM Sans + Manrope), label kapital dan label berbahasa Inggris dihapus, teks minimum 12 px.
- **Perbaikan bug:** `updateFavoriteCount()` melempar error karena elemen `#favoriteCount` tidak ada (terjadi setiap login). `sw.js` merujuk `icon.svg` yang tidak ada; diganti `icon.png`. Teks arah ganda "Searah · SEARAH" dirapikan.
- **Teks:** salinan khusus internal KAI Contact Center 121 dan catatan "konten contoh" dihapus dari tampilan.

## Pengujian

**Sudah dijalankan** (Chrome headless 131, data Google Sheets **ditiru** hanya untuk uji dan tidak disertakan di paket):
login benar/salah; pencarian rute (urutan termurah, alternatif, validasi asal = tujuan); pencarian nama kereta (daftar, filter, detail); favorit dan riwayat; pergantian tema, persistensi setelah reload, default mengikuti perangkat; pendaftaran service worker dan isi cache; nol error JavaScript; tidak ada horizontal overflow pada 9 halaman x lebar 320, 360, 390, 430, 768, 1366, 1440 px x tema terang dan gelap; tinjauan screenshot pada 320, 390, dan 1366 px.

**Pemeriksaan statis:** sintaks JS dan JSON, `data.js` identik dengan versi awal, semua berkas yang dirujuk ada, tidak ada ID yang dipakai JS tetapi hilang dari HTML (kecuali elemen opsional yang dijaga `?.`), rasio kontras palet (teks 5,0:1 ke atas).

**Belum dapat diverifikasi:** data Google Sheets asli, perangkat Android nyata (termasuk keyboard virtual), instalasi PWA dan perilaku offline di perangkat, tampilan di Safari/Firefox.

## Catatan keamanan penting

Login masih **prototipe di sisi browser**: ID dan kata sandi tertulis langsung di `app.js` dan terlihat siapa pun yang membuka sumber halaman. Mekanisme ini sengaja tidak diubah, tetapi tidak mengamankan akses. Untuk penggunaan publik atau internal yang sebenarnya, gunakan autentikasi server (misalnya Google Apps Script atau Firebase Authentication) dan ganti kredensial yang sudah terlanjur terpublikasi.
K-Pedia bukan aplikasi resmi KAI; logo KAI tidak dipakai.
