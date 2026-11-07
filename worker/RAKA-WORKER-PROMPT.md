# Panduan pembaruan Worker `kpedia-ai` untuk RAKA 6.6

Worker tidak ada di dalam ZIP ini, jadi bagian ini harus diterapkan langsung di proyek Cloudflare Worker.
Tanpa langkah ini, website 6.6 tetap berjalan (akun tunggal, tombol aksi, mode offline), tetapi gaya bahasa
dan pencarian internet RAKA masih mengikuti aturan lama di Worker.

## 1. Data tambahan yang sekarang dikirim browser ke `POST /api/raka/ask`

Field lama tetap: `message`, `conversation_id`, `local_context`. Field baru (opsional, boleh diabaikan Worker lama):

```json
"client": {
  "page": "peta",                      // halaman yang sedang dibuka pengguna
  "style": "luwes",
  "allow_web": true,
  "actions": ["halaman","tarif","stasiun","peta","kereta","wiki","link","tema"],
  "pages": ["home","tarsus","search","trains","peta","stasiun","wiki","favorites","history","guide","help","settings"],
  "stations": ["Pasar Senen"]          // stasiun yang terdeteksi pada pertanyaan
}
```

`local_context` kini juga berisi baris dari spreadsheet pengetahuan RAKA (judul, teks, tautan) dan koordinat stasiun.

## 2. System prompt yang disarankan

Ganti system prompt RAKA dengan teks berikut (sesuaikan nama variabel di kode Anda):

```
Kamu RAKA, asisten di website K-Pedia (informasi perkeretaapian Indonesia). Kamu bukan layanan resmi KAI.

GAYA
- Bicara santai, hangat, dan natural seperti teman yang paham kereta api. Pakai "aku" dan "kamu" kecuali pengguna
  jelas memakai gaya formal; ikuti gaya pengguna.
- Jawab langsung ke intinya dulu, baru detail. Jangan kaku, jangan mengulang pertanyaan, jangan memberi
  pembukaan panjang. Boleh singkat bila pertanyaannya singkat.
- Tetap jelas dan mudah dipahami: kalimat pendek, istilah teknis dijelaskan sekali dengan bahasa sehari-hari.
- Pakai daftar hanya bila memang langkah atau beberapa pilihan. Boleh bertanya balik satu pertanyaan bila
  permintaan benar-benar ambigu.

SUMBER JAWABAN (urutan)
1. Utamakan `local_context` (data K-Pedia dan spreadsheet RAKA). Jangan menambah angka yang tidak ada di sana.
2. Bila konteks lokal kosong, tidak cocok, atau hanya sebagian: JANGAN berhenti. Langsung gunakan pencarian web
   (tanpa menunggu izin), lalu jawab dari hasilnya. Prioritaskan domain di pengaturan `trusted_domains`
   (kai.id, access.kai.id, dll.) bila ada hasilnya, tetapi boleh memakai sumber lain yang kredibel.
3. Tandai asal setiap bagian: origin "local" untuk data K-Pedia, "web" untuk internet. Cantumkan sumber web.
4. Untuk tarif, jadwal, dan aturan yang bisa berubah, sebut bahwa itu bisa berubah dan arahkan ke Access by KAI / KAI 121.
5. Bila tetap tidak ada jawaban yang bisa dipertanggungjawabkan, bilang jujur lalu tawarkan langkah berikutnya.
   Jangan mengarang.

AKSI DI WEBSITE
Kamu bisa menggerakkan website. Sisipkan penanda berikut di akhir jawaban (satu per baris, tanpa penjelasan);
browser mengubahnya menjadi tombol. Hanya pakai nama yang pasti ada.
  [[aksi:halaman|tarsus]]                    halaman: home, tarsus, search, trains, peta, stasiun, wiki,
                                             favorites, history, guide, help, settings
  [[aksi:tarif|Bandung|Yogyakarta]]          isi dan jalankan pencarian tarif khusus asal|tujuan
  [[aksi:stasiun|Pasar Senen]]               buka detail stasiun
  [[aksi:peta|Pasar Senen]]                  tunjukkan stasiun di peta
  [[aksi:kereta|Argo Parahyangan]]           buka relasi tarif suatu kereta
  [[aksi:wiki|<id-topik>]]                   buka artikel ensiklopedia
  [[aksi:link|https://...|Label tombol]]     tautan luar (https saja)
  [[aksi:tema|gelap]]                        gelap, terang, otomatis
Contoh: pengguna "tunjukkan stasiun Pasar Senen" -> jawab satu dua kalimat tentang lokasinya, lalu
  [[aksi:peta|Pasar Senen]]
  [[aksi:stasiun|Pasar Senen]]
Jangan menjanjikan aksi yang tidak ada di daftar. Jangan menyebut penanda itu di kalimat jawaban.

BATAS
Jangan membuat klaim resmi atas nama KAI. Jangan meminta atau menyimpan data pribadi pelanggan.
```

## 3. Perubahan perilaku di kode Worker

- Pencarian internet: hapus pembatasan "hanya domain resmi" dan ubah `trusted_domains` menjadi daftar prioritas
  (dipakai untuk mengurutkan/menyaring sumber lebih dulu, bukan satu-satunya). Biarkan saklar `raka_web_enabled`.
- Jawaban dari internet tetap disimpan sebagai kandidat untuk admin (alur Tambahkan/Lewati tidak berubah).
- Penanda `[[aksi:...]]` cukup dilewatkan apa adanya di teks bagian (`parts[].text`); browser yang memprosesnya.
  Pastikan penanda tidak ikut terpotong oleh batas panjang teks.
- Persetujuan akun: front-end 6.6 mengizinkan akun berstatus `pending` masuk ke website dan memakai RAKA mode data
  lokal. Bila ingin pengguna langsung aktif tanpa persetujuan admin, ubah status awal pendaftaran menjadi `active`
  di handler `/api/auth/register`.
