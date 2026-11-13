# Arsitektur data dan pengelolaan administrator

Dokumen perancangan. **Belum ada backend baru** yang dibuat; tidak ada data operasional fiktif di aplikasi.
Semua kolom tersambung lewat berkas data atau Google Sheets yang sudah ada, dan setiap modul baru
membaca satu kontrak data (lihat `data-contracts/`).

| Modul | Sumber data sekarang | Status | Dikelola | Kontrak |
|---|---|---|---|---|
| Tarif Khusus | Google Sheets (`data.js`, `content.js`) | **Aktif** | Admin / pengembang | kolom sheet yang sudah ada |
| K-Pedia / Ensiklopedia KAI | `wiki-data.js` (+ sumber tiap artikel) | **Aktif** | Admin / pengembang | struktur `wiki-data.js` |
| Peta dan data stasiun | `stations-info.js`, Leaflet + OpenRailwayMap | **Aktif** | Admin / pengembang | struktur `stations-info.js` |
| Cuaca stasiun | Open-Meteo (API publik) | **Aktif** (perlu internet) | otomatis | tidak perlu |
| Jam, kalender, libur nasional | `Intl` (WIB) + libur tetap bawaan + sumber daring | **Aktif** | otomatis | tidak perlu |
| Kalkulator | lokal | **Aktif** | - | - |
| RAKA AI | Cloudflare Worker K-Pedia (`kp-auth.js`, `raka.js`) | **Aktif** (mode teks) | Admin RAKA | endpoint yang sudah ada |
| Informasi penting | `announcements.js` (+ `remoteUrl` opsional) | **Aktif** (data bawaan kecil) | Admin | `announcements.schema.json` |
| Update Info Koordinasi | belum ada | **Menunggu data** | Admin | `koordinasi.schema.json` |
| TOKA | belum ada | **Menunggu data** | Admin | `toka.schema.json` |
| Jadwal KRL | belum ada | **Menunggu data** | Admin | `krl-dataset.schema.json` + `krl-planner.js` |

## Pola yang sama untuk setiap modul baru
1. Administrator menyiapkan data sesuai kontrak (Google Sheets diekspor ke JSON, atau JSON langsung).
2. Berkas JSON ditaruh di hosting yang sama atau di URL publik, lalu alamatnya dicatat di konfigurasi modul
   (`announcements.js` → `remoteUrl`; modul lain akan memakai `KP_CONTENT.<modul>Url`).
3. Modul mengambil JSON, memvalidasi bentuknya, menyimpan salinan 30 menit di perangkat, dan **tetap nonaktif**
   bila data kosong atau tidak valid.
4. Setelah data ada, kontrol pada halaman rancangan diaktifkan (atribut `disabled` dihapus) dan hasil dirender.

## Informasi penting (otomatis berubah)
Isi `remoteUrl` dengan alamat JSON berisi `{ "items": [ ... ] }`. K-Pedia menggabungkannya dengan daftar bawaan,
mengutamakan yang bertanda `important`. Bila alamat tidak terjangkau, daftar bawaan dipakai dan diberi catatan.
Sumber otomatis dari berita atau media sosial resmi KAI **belum tersambung**: peramban tidak boleh membaca
situs lain langsung (CORS), jadi diperlukan penyalur di sisi server (misalnya tugas terjadwal di Worker yang
menulis JSON). Itu butuh keputusan dan akses dari pemilik server.

## Jadwal KRL (arsitektur transit)
`krl-planner.js` sudah berisi algoritma murni dan teruji (`node tests/run-unit.js`):
perjalanan langsung, satu kali transit, waktu transit minimum, batas tunggu, jendela waktu, dan satu hari penuh.
Yang belum ada hanya data. Perluasan ke lebih dari satu transit: naikkan `maxTransfers` dan tambahkan
pencarian berlapis pada `plan()`.

## RAKA AI membaca sumber lain
RAKA sudah menerima konteks lokal dari fungsi `localContext()` (`raka.js`). Untuk menambah sumber (koordinasi,
TOKA, jadwal KRL) tambahkan pencocokan di fungsi itu **setelah** datanya tersedia; sampai saat itu RAKA tidak
diberi koneksi ke sumber tersebut.
Mode **Teks + gambar**: UI dan `IMAGE_ADAPTER` sudah disiapkan tetapi nonaktif. Syarat aktif: sumber gambar sah
(database lokal, internet berlisensi, atau API pembuat gambar yang terintegrasi) dan dukungan di Worker.

## Ketentuan layanan pihak ketiga
- **Open-Meteo**: gratis untuk penggunaan non-komersial (CC BY 4.0). Bila K-Pedia dipakai operasional perusahaan,
  periksa paket komersial mereka atau pakai BMKG sebagai sumber resmi.
- **Hari libur nasional**: libur bertanggal tetap (Tahun Baru, Hari Buruh, Hari Lahir Pancasila, Kemerdekaan,
  Natal) tertanam. Libur keagamaan dan cuti bersama diambil dari API komunitas (`api-harilibur.vercel.app`,
  cadangan `libur.deno.dev`). Skema kedua API itu **belum diuji langsung** dari sandbox pengembangan. Rujukan
  resmi tetap SKB 3 Menteri; pertimbangkan menyalin daftar resmi ke JSON sendiri tiap akhir tahun.
