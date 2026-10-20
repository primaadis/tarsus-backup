/* K-PEDIA — DATA ENSIKLOPEDIA KAI (bawaan). Dibuat dari K-Pedia-Ensiklopedia.xlsx (sheet WIKI, WIKI_KATEGORI, WIKI_FAQ). Edit spreadsheet lalu minta dibuatkan ulang, atau sambungkan ke Google Sheets lewat content.js. */
"use strict";
window.KP_WIKI = {
 "categories": [
  {
   "id": "pemesanan",
   "nama": "Cara pemesanan tiket",
   "deskripsi": "Cara memesan, mitra penjualan, check-in, dan boarding.",
   "ikon": "ticket",
   "urutan": 1
  },
  {
   "id": "pembatalan",
   "nama": "Pembatalan & perubahan",
   "deskripsi": "Pembatalan, refund, dan ubah jadwal tiket.",
   "ikon": "refund",
   "urutan": 2
  },
  {
   "id": "aturan",
   "nama": "Aturan & ketentuan penumpang",
   "deskripsi": "Bagasi, barang terlarang, anak, bayi, dan ibu hamil.",
   "ikon": "check",
   "urutan": 3
  },
  {
   "id": "rangkaian",
   "nama": "Kelas & jenis layanan",
   "deskripsi": "Kelas kereta, KRL, LRT, Whoosh, KA Bandara, dan rangkaian.",
   "ikon": "train",
   "urutan": 4
  },
  {
   "id": "layanan",
   "nama": "Layanan & bantuan",
   "deskripsi": "Kontak, barang tertinggal, aplikasi, dan tips aman.",
   "ikon": "help",
   "urutan": 5
  },
  {
   "id": "istilah",
   "nama": "Istilah KAI",
   "deskripsi": "Kamus istilah tiket dan perkeretaapian.",
   "ikon": "book",
   "urutan": 6
  },
  {
   "id": "umum",
   "nama": "Sejarah & profil KAI",
   "deskripsi": "Sejarah, organisasi, dan dasar hukum.",
   "ikon": "landmark",
   "urutan": 7
  }
 ],
 "entries": [
  {
   "id": "cara-pesan-antarkota",
   "kategori": "pemesanan",
   "judul": "Cara memesan tiket KA antar kota",
   "ringkasan": "Kanal pemesanan resmi, langkah di Access by KAI, kapan tiket dibuka, batas waktu beli, dan data yang perlu disiapkan.",
   "isi": "## Kanal pemesanan resmi\n- Aplikasi Access by KAI (Android dan iOS) serta situs resmi KAI.\n- Contact Center KAI 121.\n- Mitra penjualan resmi, misalnya agen perjalanan online, minimarket, dan kantor pos (lihat topik Mitra dan kanal penjualan tiket).\n- Loket stasiun hanya melayani penjualan go-show, yaitu mulai 3 jam sebelum jadwal keberangkatan.\n\n## Langkah memesan di Access by KAI\n1. Buka Access by KAI, lalu masuk atau daftar akun.\n2. Pilih stasiun asal, stasiun tujuan, tanggal berangkat, dan jumlah penumpang, lalu tekan Cari.\n3. Pilih kereta, kelas, dan jam yang sesuai.\n4. Isi data setiap penumpang sesuai identitas, lalu pilih kursi.\n5. Baca dan setujui syarat dan ketentuan, termasuk aturan bagasi, lalu lakukan pembayaran sebelum batas waktunya.\n6. Setelah lunas, tiket tampil di menu Tiket. Simpan kode booking.\n\n## Kapan tiket mulai dijual\n- Di luar masa angkutan Lebaran, penjualan tiket KA jarak jauh umumnya dibuka 30 hari sebelum keberangkatan.\n- Pada masa angkutan Lebaran 2023, tiket dibuka 45 hari sebelum keberangkatan. Jadwal buka dapat berbeda di setiap musim libur, jadi ikuti pengumuman KAI.\n\n## Batas waktu pemesanan\n- Lewat mitra penjualan, tiket dapat dipesan sampai 1 jam sebelum keberangkatan, dengan batas pembayaran paling lambat 30 menit setelah transaksi (berlaku sejak 21 Desember 2023, sebelumnya 3 jam).\n\n## Data yang perlu disiapkan\n- Nama dan nomor identitas (NIK) penumpang sesuai KTP atau identitas resmi.\n- Untuk anak, NIK pada Kartu Keluarga (KK) atau Kartu Identitas Anak (KIA).\n- Jangan membagikan kode booking atau bukti pembelian kepada orang lain.\n\n## Tips\n- Cek ketersediaan secara berkala. Tiket yang dibatalkan atau diubah jadwalnya muncul kembali untuk dijual.\n- Pastikan koneksi stabil, terutama saat musim libur ketika pengunjung membludak.\n- Tiket yang dibeli di kanal lain dapat ditambahkan ke Access by KAI lewat menu Cek dan Tambah Tiket.",
   "tag": "pesan tiket, beli tiket, booking, access by kai, kai access, antar kota, jarak jauh, go show, h-30, mudik, lebaran, kode booking, nik",
   "sumber": "Tiket Kereta Lebaran 2023 Sudah Bisa Dipesan Sekarang, Simak Syarat dan Ketentuannya! — Good News from Indonesia, 27 Feb 2023 — https://www.goodnewsfromindonesia.id/2023/02/27/tiket-kereta-lebaran-2023-sudah-bisa-dipesan-sekarang-simak-syarat-dan-ketentuannya\nKAI Perpanjang Batas Waktu Pemesanan Tiket Melalui Channel Mitra Penjualan — Kontan, 21 Des 2023 — https://industri.kontan.co.id/news/kai-perpanjang-batas-waktu-pemesanan-tiket-melalui-channel-mitra-penjualan\n7 Tips Membeli Tiket KA di Masa Nataru — detikJabar, (Nataru 2023/2024) — https://www.detik.com/jabar/bisnis/d-7036010/7-tips-membeli-tiket-ka-di-masa-nataru\nSyarat Naik Kereta Api dan Ketentuan Mudik Lebaran 2024 — Bisnis.com, 21 Mar 2024 — https://ekonomi.bisnis.com/read/20240321/98/1750208/syarat-naik-kereta-api-dan-ketentuan-mudik-lebaran-2024\nNaik Kereta Api Bisa Bawa Sepeda Lipat, Ini Syaratnya! — Bisnis.com, 2 Sep 2020 — https://ekonomi.bisnis.com/read/20200902/98/1286426/naik-kereta-api-bisa-bawa-sepeda-lipat-ini-syaratnya\nCatatan: Langkah aplikasi disusun dari alur yang dilaporkan media. Tampilan menu dapat berubah mengikuti pembaruan aplikasi.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 1
  },
  {
   "id": "mitra-penjualan",
   "kategori": "pemesanan",
   "judul": "Mitra dan kanal penjualan tiket KAI",
   "ringkasan": "Daftar kanal resmi: aplikasi KAI, agen online (Traveloka, tiket.com, Tokopedia), minimarket, kantor pos, serta kanal tiket Whoosh.",
   "isi": "## Kanal milik KAI\n- Aplikasi Access by KAI dan situs resmi KAI.\n- Contact Center 121.\n- Loket stasiun (khusus go-show, mulai 3 jam sebelum berangkat).\n\n## Mitra penjualan online (OTA)\nMitra yang tercatat pada pemberitaan resmi KAI dan penelitian:\n- Traveloka (menjual tiket KAI sejak awal 2017)\n- tiket.com\n- Tokopedia\n- Misteraladin\n- Pegipegi, Oke Tiket, dan beberapa agen lain yang tercatat pada data lama\n\n## Mitra offline dan payment point\n- Minimarket: Indomaret, Alfamart, Alfamidi.\n- Kantor Pos Indonesia.\n- Beberapa bank dan penyedia payment point (data lama mencatat CIMB Niaga, Jatelindo, dan lainnya).\n- Pada 2017, KAI menyebut bekerja sama dengan 31 kanal eksternal. Sebuah penelitian mencatat 26 mitra bisnis. Jumlah dan nama mitra berubah dari waktu ke waktu.\n\n## Kanal resmi tiket Whoosh\nKereta cepat Whoosh dikelola KCIC dan menjual tiket lewat kanal tersendiri:\n- Aplikasi Whoosh dan situs ticket.kcic.co.id.\n- Mitra resmi: Access by KAI, Livin' by Mandiri, BRImo, Wondr by BNI, tiket.com, Traveloka, dan Trip.com.\n- Loket dan vending machine di stasiun Whoosh.\n\n## Hal yang perlu diperhatikan\n- Aturan bagasi dan ketentuan tiket dari mitra tercantum pada e-tiket yang dikirim ke email.\n- Tiket dari mitra bisa diubah jadwalnya lewat Access by KAI selama belum dicetak sebagai boarding pass dan sudah terhubung ke akun Access.\n- Waspada penipuan. KCIC menegaskan tidak menjual tiket lewat nomor pribadi atau rekening perorangan. Jangan memberikan NIK kepada pihak di luar kanal resmi.",
   "tag": "mitra, agen, traveloka, tiket.com, tokopedia, indomaret, alfamart, alfamidi, pos indonesia, ota, beli di mana, kanal resmi, penipuan, whoosh, livin, brimo, wondr",
   "sumber": "KAI Perpanjang Batas Waktu Pemesanan Tiket Melalui Channel Mitra Penjualan — Kontan, 21 Des 2023 — https://industri.kontan.co.id/news/kai-perpanjang-batas-waktu-pemesanan-tiket-melalui-channel-mitra-penjualan\nKAI targetkan tiket 70% dari gerai eksternal — Kontan, 8 Mar 2017 — https://industri.kontan.co.id/news/kai-targetkan-tiket-70-dari-gerai-eksternal\nTraveloka layani pemesanan tiket KAI — Kontan, 8 Mar 2017 — https://industri.kontan.co.id/news/traveloka-layani-pemesanan-tiket-kai\nImplementasi E-Commerce pada Penjualan Tiket Online Berbasis Rail Ticket System di PT KAI Daop 8 Surabaya Gubeng (daftar 26 mitra bisnis, data lama) — Repository Universitas Jember, (tanpa tanggal) — https://repository.unej.ac.id/xmlui/handle/123456789/87440\nMarak Modus Penipuan Whoosh, KCIC Tegaskan Tiket Hanya Dijual Lewat Kanal Resmi — Kompas TV, 2026 — https://www.kompas.tv/ekonomi/652993/marak-modus-penipuan-whoosh-kcic-tegaskan-tiket-hanya-dijual-lewat-kanal-resmi\nHeboh, Penumpang Kereta Keluhkan Aturan Bagasi Maksimal 20 Kg, Begini Klarifikasi KAI — JatimTIMES, 30 Jan 2024 — https://jatimtimes.com/baca/304933/20240130/110600/privacy\nMudah! Ini Cara Reschedule Tiket Kereta Api Lewat HP — Metro TV News, (tanpa tanggal di hasil pencarian) — https://www.metrotvnews.com/read/kELCnOax-mudah-ini-cara-reschedule-tiket-kereta-api-lewat-hp\nCatatan: Daftar mitra bisa berubah. Cek daftar terbaru di Access by KAI atau situs resmi KAI.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 2
  },
  {
   "id": "check-in-boarding",
   "kategori": "pemesanan",
   "judul": "Check-in, boarding pass, dan face recognition",
   "ringkasan": "Cara naik kereta jarak jauh: boarding pass digital dan cetak, mesin check-in mandiri, serta boarding dengan pemindai wajah.",
   "isi": "## Boarding pass\n- E-boarding pass berupa barcode di aplikasi Access by KAI. Menurut panduan yang beredar, barcode muncul mulai sekitar 2 jam sebelum keberangkatan.\n- Boarding pass fisik bisa dicetak di mesin Check-In Counter (CIC) mandiri di stasiun.\n- Tiket yang dibeli di kanal eksternal dapat di-check-in lewat mesin check-in mandiri, misalnya yang tersedia di Stasiun Pasar Senen, menggunakan kode booking.\n- Siapkan identitas asli yang sesuai dengan data tiket karena identitas penumpang diverifikasi.\n\n## Face Recognition Boarding Gate\n- Fasilitas boarding dengan pemindai wajah, tanpa perlu menunjukkan boarding pass atau KTP.\n- Pertama diuji di Stasiun Bandung pada 28 September 2022.\n- Pada November 2023 tercatat di sekitar 9 sampai 10 stasiun. Pada Desember 2025, KAI menyebut 22 stasiun dengan total 67 line.\n- Contoh stasiun: Bandung, Gambir, Cirebon, Semarang Tawang, Yogyakarta, Solo Balapan, Surabaya Gubeng, Surabaya Pasar Turi, dan Malang.\n- Pendaftaran hanya sekali: lewat menu registrasi wajah di Access by KAI, atau di stasiun lewat mesin CIC, vending machine, atau petugas layanan pelanggan.\n- Setelah terdaftar, langsung menuju gate saat waktu boarding sudah dibuka. Sebagian stasiun tetap menyediakan boarding manual bagi yang belum mendaftar.\n\n## Catatan masa berlaku\nLaporan 2023 menyebut pendaftaran berlaku sampai satu tahun, sedangkan laporan Desember 2025 menyebut cukup sekali daftar dan berlaku di semua stasiun yang memiliki gate. Cek masa berlaku terbaru di Access by KAI.",
   "tag": "boarding, check in, cetak tiket, e-boarding pass, cic, mesin check-in, face recognition, scan wajah, pindai wajah, gate, frbg",
   "sumber": "Stasiun Solo Balapan Sudah Dilengkapi Fasilitas Pintu Pengenal Wajah — investortrust.id, 25 Nov 2023 — https://investortrust.id/business/8553/stasiun-solo-balapan-sudah-dilengkapi-fasilitas-pintu-pengenal-wajah\nCara Daftar Face Recognition KAI via Aplikasi Access, Boarding Cuma 5 Detik — Selular.ID, Des 2025 — https://selular.id/2025/12/cara-daftar-face-recognition-kai-via-aplikasi-access-boarding-cuma-5-detik/\nCara Daftar Face Recognition KAI dan Daftar Stasiun untuk Boarding Scan Wajah — Kompas TV, (tanpa tanggal di hasil pencarian) — https://www.kompas.tv/info-publik/442440/cara-daftar-face-recognition-kai-dan-daftar-stasiun-untuk-boarding-scan-wajah\nStasiun Pasar Senen dukung program KLH kurangi sampah (check-in mandiri, e-ticketing, face recognition) — ANTARA, 7 Apr 2025 — https://m.antaranews.com/amp/berita/4755625/stasiun-pasar-senen-dukung-program-klh-kurangi-sampah\nCara Cetak Tiket Kereta Api Terbaru 2025 (Boarding Pass & Face Recognition) — Situs Universitas Negeri Surabaya (bukan sumber resmi KAI), 2025 — https://pendidikan-matematika.fmipa.unesa.ac.id/post/cara-cetak-tiket-kereta-api-terbaru-2025-boarding-pass-face-recognition\nCatatan: Waktu muncul e-boarding pass bersumber dari situs akademik, bukan pengumuman resmi KAI. Verifikasi di Access by KAI.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 3
  },
  {
   "id": "pembatalan-tiket",
   "kategori": "pembatalan",
   "judul": "Pembatalan dan refund tiket KA antar kota",
   "ringkasan": "Bea pembatalan 25%, batas waktu, cara batal di aplikasi dan loket, lama pengembalian dana, serta jika KAI yang membatalkan perjalanan.",
   "isi": "## Ketentuan utama\n- Bea pembatalan 25% dari harga tiket, di luar bea pesan.\n- Di Access by KAI, pembatalan paling lambat 2 jam sebelum keberangkatan dan kode booking berstatus Paid.\n- Di loket stasiun yang melayani pembatalan, paling lambat 30 menit sebelum keberangkatan.\n- Sisa dana dikembalikan paling lambat 7 hari setelah tanggal pembatalan (berlaku sejak 1 Juni 2024, sebelumnya 30 sampai 45 hari).\n- Pengembalian lewat transfer bank atau e-wallet. Pengembalian tunai di stasiun tertentu hanya berlaku pada masa transisi.\n- Dana yang tidak diambil dalam 1 tahun sejak pembatalan menjadi milik perusahaan.\n\n## Cara membatalkan di Access by KAI\n1. Buka Access by KAI, masuk ke menu Tiket.\n2. Pilih kode booking perjalanan yang akan dibatalkan.\n3. Tekan tombol Pembatalan.\n4. Baca dan centang syarat dan ketentuan, lalu Lanjut.\n5. Pilih metode pengembalian dan selesaikan proses.\n\n## Cara membatalkan di stasiun\n1. Datang ke stasiun yang melayani pembatalan sebelum batas waktu.\n2. Bawa bukti pemesanan dan identitas asli (KTP, SIM, paspor, atau kartu pelajar bagi penumpang di bawah 17 tahun).\n3. Isi formulir pembatalan dua rangkap yang memuat data tiket, data penumpang, dan keterangan pengambilan dana.\n4. Jika diwakilkan, bawa surat kuasa bermeterai dari pemilik tiket, identitas asli pemilik, dan fotokopinya.\n\n## Jika KAI yang membatalkan perjalanan\n- Penumpang terdampak berhak atas pengembalian bea tiket 100% di luar bea pesan.\n- Pengajuan lewat Access by KAI, loket stasiun, atau Contact Center 121.\n- Batas pengajuan diumumkan KAI pada setiap kejadian. Pada pengumuman 2026, batasnya 7x24 jam sejak tanggal keberangkatan yang tertera di tiket.\n\n## KA lokal dan KRL\n- KRL memakai sistem bayar saat tap in dan tap out, jadi tidak ada tiket per perjalanan yang dibatalkan. Jika saldo bermasalah, bawa kartu dan bukti transaksi ke petugas stasiun atau layanan pelanggan KAI Commuter.\n- Untuk KA lokal, ketentuan dapat berbeda dan umumnya diproses di stasiun. Tanyakan ke petugas stasiun.\n\n## Perlu diperhatikan\nBeberapa artikel lama menyebut batas 3 jam di aplikasi dan pengembalian 30 hari. Itu ketentuan sebelum pembaruan, jadi gunakan angka di atas dan cek ulang saat membatalkan.",
   "tag": "batal tiket, pembatalan, refund, pengembalian dana, uang kembali, cancel, bea batal 25 persen, hangus, kai batalkan, perjalanan dibatalkan, surat kuasa",
   "sumber": "Pengembalian Uang Tiket KAI Kini Hanya 7 Hari, Simak Ketentuannya — Bisnis.com, 29 Mei 2024 — https://ekonomi.bisnis.com/read/20240529/98/1769521/pengembalian-uang-tiket-kai-kini-hanya-7-hari-simak-ketentuannya\nDipercepat, Dana Pembatalan Tiket KA Dikembalikan Maksimal 7 Hari Mulai 1 Juni 2024 — Kontan, Mei 2024 — https://industri.kontan.co.id/news/dipercepat-dana-pembatalan-tiket-ka-dikembalikan-maksimal-7-hari-mulai-1-juni-2024\nRefund Tiket KAI Kini Diberikan Dalam 7 Hari, Pahami Syarat dan Ketentuannya — Good News from Indonesia, 2 Jun 2024 — https://www.goodnewsfromindonesia.id/2024/06/02/refund-tiket-kai-kini-diberikan-dalam-7-hari-pahami-syarat-dan-ketentuannya\nBegini Syarat dan Cara Refund Tiket Kereta Api Secara Online & Offline — CNN Indonesia, 11 Des 2024 — https://www.cnnindonesia.com/edukasi/20241211110702-561-1176098/begini-syarat-dan-cara-refund-tiket-kereta-api-secara-online-offline\nCara Refund Tiket Kereta Api Via Platform Online dan Loket Stasiun — Fortune IDN, (tanpa tanggal di hasil pencarian) — https://www.fortuneidn.com/news/cara-refund-tiket-kereta-api-secara-online-dan-loket-stasiun-00-my5jv-kcn7gn\nKAI kembalikan bea tiket 100% bagi penumpang tanpa hasil tes COVID-19 (surat kuasa bermeterai untuk pembatalan diwakilkan) — ANTARA Jabar, 6 Apr 2022 — https://jabar.antaranews.com/berita/370249/kai-kembalikan-bea-tiket-100-bagi-penumpang-tanpa-hasil-tes-covid-19?page=all\nCara Melakukan Pembatalan Tiket Kereta di Loket Stasiun dan Aplikasi KAI Access (memuat ketentuan lama: 3 jam dan 30 hari) — Kontan Moms Money, (tanpa tanggal; ketentuan lama) — https://momsmoney.kontan.co.id/news/cara-melakukan-pembatalan-tiket-kereta-di-loket-stasiun-dan-aplikasi-kai-access-1\nVersi sebelumnya dari spreadsheet K-Pedia (isi dipertahankan, belum diverifikasi ulang) — K-Pedia, 18 Okt 2026\nCatatan: Bagian 'Jika KAI yang membatalkan perjalanan' dan 'KA lokal dan KRL' berasal dari versi sebelumnya (Bisnis.com 19 Jan 2026, Kontan 28 Apr 2026) dan belum diverifikasi ulang.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 4
  },
  {
   "id": "ubah-jadwal",
   "kategori": "pembatalan",
   "judul": "Ubah jadwal (reschedule) tiket",
   "ringkasan": "Biaya 25%, syarat, batas waktu, dan langkah mengubah jadwal di Access by KAI atau loket stasiun.",
   "isi": "## Ketentuan utama\n- Biaya perubahan 25% dari tarif kereta di luar bea pesan, dibulatkan ke atas pada kelipatan Rp1.000.\n- Bisa untuk kereta yang sama atau kereta yang berbeda, selama kursi pengganti masih tersedia.\n- Pemohon adalah penumpang yang bersangkutan, atau salah satu penumpang yang datanya terdaftar di Access by KAI dan memakai akunnya sendiri.\n- Batas perubahan jadwal yang dilaporkan adalah 30 menit sebelum keberangkatan tiket lama. Jika lewat dari batas online, perubahan dilakukan di loket stasiun.\n\n## Tiket dari kanal lain\nTiket yang dibeli di platform online lain bisa diubah jadwalnya lewat Access by KAI, dengan syarat belum dicetak sebagai boarding pass dan kode bookingnya sudah masuk ke menu Tiket, dengan nama penumpang yang terdaftar sebagai pengguna Access.\n\n## Langkah di Access by KAI\n1. Buka menu Tiket, lalu pilih kode booking yang akan diubah. Tombol Ubah Jadwal hanya muncul jika pemesanan sudah lunas.\n2. Tekan Ubah Jadwal.\n3. Pilih nama penumpang yang akan diubah, baca dan centang syarat dan ketentuan.\n4. Pilih tanggal dan kereta baru lewat Cari Tiket.\n5. Periksa ringkasan, centang syarat dan ketentuan, lalu selesaikan.\n\n## Langkah di loket stasiun\n- Sampaikan permohonan perubahan kepada petugas loket.\n- Jika diwakilkan, bawa identitas asli dan surat kuasa bermeterai Rp10.000 dari pemilik tiket.\n\n## Tips\nLakukan perubahan sesegera mungkin setelah rencana berubah, lalu periksa lagi data penumpang, jadwal baru, dan rincian pembayaran sebelum menyelesaikan.",
   "tag": "reschedule, ubah jadwal, ganti jadwal, geser jadwal, pindah jadwal, ganti tanggal, ganti kereta, biaya ubah jadwal",
   "sumber": "Mudah! Ini Cara Reschedule Tiket Kereta Api Lewat HP — Metro TV News, (tanpa tanggal di hasil pencarian) — https://www.metrotvnews.com/read/kELCnOax-mudah-ini-cara-reschedule-tiket-kereta-api-lewat-hp\nCara Reschedule Tiket Kereta (mengutip situs KAI Access) — OCBC Indonesia, 4 Nov 2024 — https://www.ocbc.id/id/article/2024/11/04/cara-reschedule-tiket-kereta\nCara Mengganti Jadwal Tiket Kereta Api dari Aplikasi — Selular.ID, Mar 2025 — https://selular.id/2025/03/cara-mengganti-jadwal-tiket-kereta-api-dari-aplikasi/\nAnti Ribet, Ini Cara Reschedule Tiket Kereta di Loket Stasiun dan Aplikasi KAI Access (mengutip Contact Center KAI) — Kontan Moms Money, (tanpa tanggal di hasil pencarian) — https://momsmoney.kontan.co.id/news/anti-ribet-ini-cara-reschedule-tiket-kereta-di-loket-stasiun-dan-aplikasi-kai-access\nCatatan: Batas 30 menit hanya dilaporkan oleh satu sumber (Selular.ID). Verifikasi di aplikasi saat mengubah jadwal.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 5
  },
  {
   "id": "aturan-bagasi",
   "kategori": "aturan",
   "judul": "Aturan bagasi dan barang bawaan",
   "ringkasan": "Batas bagasi gratis 20 kg, tarif kelebihan, bagasi berbayar, sepeda lipat, dan barang yang terlalu besar.",
   "isi": "## Bagasi tanpa bea\n- Berat maksimum 20 kg.\n- Volume maksimum 100 dm³, dimensi maksimal 70 x 48 x 30 cm.\n- Paling banyak 4 koli (item bagasi).\n- Letakkan di rak bagasi di atas tempat duduk atau tempat lain yang tidak mengganggu dan tidak membahayakan penumpang lain.\n\n## Kelebihan bagasi\nSaat boarding, kelebihan bagasi dikenai bea per kg:\n- Kelas Eksekutif: Rp10.000 per kg.\n- Kelas Bisnis: Rp6.000 per kg.\n- Kelas Ekonomi: Rp2.000 per kg.\nContoh: membawa 45 kg di kelas eksekutif berarti 25 kg kelebihan, sehingga membayar Rp250.000.\n\n## Batas atas\n- Bagasi berbayar paling banyak 40 kg dengan volume sampai 200 dm³ (sekitar 70 x 48 x 60 cm).\n- Lebih dari itu tidak boleh masuk kabin. Gunakan jasa ekspedisi seperti KAI Logistik.\n\n## Sepeda\n- Hanya sepeda lipat yang boleh masuk kabin: berat maksimal 20 kg dan ukuran roda maksimal 22 inci.\n- Tidak boleh disimpan di kereta makan atau di sambungan antar kereta.\n- Bagasi sepeda dapat dipesan lewat Access by KAI, khusus kereta antar kota.\n- Sepeda jenis lain (mountain bike, road bike) dikirim lewat layanan angkutan barang kereta api.\n\n## Catatan\n- Syarat dan ketentuan bagasi tampil saat memesan di Access by KAI dan tercantum di e-tiket jika membeli lewat mitra.\n- Ketentuan denda lama (2023) memakai perhitungan per 5 kg. Pemberitaan 2024 sampai 2026 memakai tarif per kg di atas.\n- Barang bawaan menjadi tanggung jawab masing-masing penumpang.",
   "tag": "bagasi, barang bawaan, koper, 20 kg, kelebihan bagasi, overbagasi, denda bagasi, sepeda lipat, dm3, koli, ekspedisi, kai logistik",
   "sumber": "KAI Ingatkan Penumpang soal Aturan Bagasi, Maksimal 20 Kg — IDX Channel, 26 Jan 2024 — https://www.idxchannel.com/economics/kai-ingatkan-penumpang-soal-aturan-bagasi-maksimal-20-kg\nKAI Tebar Diskon Tiket Kereta Api! 1,3 Juta Kursi Ludes Terjual (memuat ketentuan bagasi) — Bisnis.com, 24 Jun 2025 — https://ekonomi.bisnis.com/read/20250624/98/1887702/kai-tebar-diskon-tiket-kereta-api-13-juta-kursi-ludes-terjual\nAngkutan Lebaran 2026, Bagasi Penumpang Kereta Api Maksimal Berbobot 20 Kilogram — Bisnis.com, 11 Mar 2026 — https://ekonomi.bisnis.com/read/20260311/98/1959632/angkutan-lebaran-2026-bagasi-penumpang-kereta-api-maksimal-berbobot-20-kilogram\nPuncak Arus Mudik, KAI Ingatkan Aturan Bagasi Penumpang Kereta Api (ketentuan denda lama) — Bisnis.com, 20 Apr 2023 — https://ekonomi.bisnis.com/read/20230420/98/1648809/puncak-arus-mudik-kai-ingatkan-aturan-bagasi-penumpang-kereta-api\nKAI Daop 4 Semarang ingatkan penumpang patuhi aturan kapasitas bagasi — ANTARA, (akhir tahun; masa Nataru) — https://megapolitan.antaranews.com/berita/330870/kai-daop-4-semarang-ingatkan-penumpang-patuhi-aturan-kapasitas-bagasi\nHeboh, Penumpang Kereta Keluhkan Aturan Bagasi Maksimal 20 Kg, Begini Klarifikasi KAI — JatimTIMES, 30 Jan 2024 — https://jatimtimes.com/baca/304933/20240130/110600/privacy\nNaik Kereta Api Bisa Bawa Sepeda Lipat, Ini Syaratnya! — Bisnis.com, 2 Sep 2020 — https://ekonomi.bisnis.com/read/20200902/98/1286426/naik-kereta-api-bisa-bawa-sepeda-lipat-ini-syaratnya\nKAI: Ini Aturan Bawa Sepeda Lipat dan Hewan Peliharaan di Kereta — Bisnis.com, 30 Okt 2021 — https://ekonomi.bisnis.com/read/20211030/98/1460017/kai-ini-aturan-bawa-sepeda-lipat-dan-hewan-peliharaan-di-kereta",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 6
  },
  {
   "id": "barang-dilarang",
   "kategori": "aturan",
   "judul": "Barang dan hewan yang dilarang di kereta",
   "ringkasan": "Daftar barang yang tidak boleh dibawa ke kereta penumpang, ketentuan membawa hewan, dan aturan di kereta petani-pedagang.",
   "isi": "## Barang yang tidak boleh dibawa\n- Narkotika, psikotropika, dan zat adiktif lainnya.\n- Senjata api dan senjata tajam.\n- Benda yang mudah terbakar atau meledak.\n- Benda berbau busuk, amis, atau menyengat, serta benda yang dapat mengganggu atau merusak kesehatan dan kenyamanan penumpang lain.\n- Barang yang dilarang peraturan perundang-undangan.\n- Barang lain yang menurut pertimbangan petugas boarding tidak pantas diangkut sebagai bagasi karena keadaan dan ukurannya.\n\n## Hewan peliharaan\n- Hewan tidak boleh dibawa ke kereta penumpang.\n- Pengangkutan hewan dilayani lewat kereta bagasi atau layanan angkutan barang.\n- Ketentuannya: bukan hewan yang dilarang pemerintah, memakai kandang khusus, dan penumpang menyiapkan makanan dan minuman selama perjalanan.\n\n## Kereta petani dan pedagang (sejak 1 Desember 2025)\nLayanan khusus yang dirangkaikan pada KA Lokal Commuter Line Merak ini melarang barang berbau menyengat, barang mudah terbakar, hewan ternak, serta senjata tajam atau senjata api. Bawaan maksimal 2 koli per orang.\n\n## Mengapa penting\nKAI mengingatkan larangan ini secara berkala, termasuk setelah kejadian keamanan di stasiun. Petugas dapat memeriksa bawaan saat boarding.",
   "tag": "barang terlarang, dilarang, senjata, narkoba, mudah terbakar, durian, bau, hewan, kucing, anjing, peliharaan, binatang, petani, pedagang",
   "sumber": "KAI: Ini Aturan Bawa Sepeda Lipat dan Hewan Peliharaan di Kereta — Bisnis.com, 30 Okt 2021 — https://ekonomi.bisnis.com/read/20211030/98/1460017/kai-ini-aturan-bawa-sepeda-lipat-dan-hewan-peliharaan-di-kereta\nKAI ingatkan larangan barang menyusul penangkapan terduga teroris di Stasiun Solo Balapan — ANTARA, 1 Agu 2024 — https://megapolitan.antaranews.com/berita/301039/kai-ingatkan-larangan-barang-menyusul-penangkapan-terduga-teroris-di-stasiun-solo-balapan\nAngkutan Lebaran 2026, Bagasi Penumpang Kereta Api Maksimal Berbobot 20 Kilogram — Bisnis.com, 11 Mar 2026 — https://ekonomi.bisnis.com/read/20260311/98/1959632/angkutan-lebaran-2026-bagasi-penumpang-kereta-api-maksimal-berbobot-20-kilogram\nDeretan Barang yang Dilarang Dibawa di Kereta Khusus Petani-Pedagang — detikFinance, 30 Nov 2025 — https://finance.detik.com/infrastruktur/d-8236173/deretan-barang-yang-dilarang-dibawa-di-kereta-khusus-petani-pedagang\nCatatan: Daftar mengikuti pernyataan KAI yang dikutip media. Durian dan makanan berbau tidak disebut satu per satu, tetapi masuk kategori benda berbau menyengat.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 7
  },
  {
   "id": "syarat-penumpang",
   "kategori": "aturan",
   "judul": "Syarat penumpang: identitas, anak, bayi, dan ibu hamil",
   "ringkasan": "Aturan identitas, tiket anak dan bayi, serta ketentuan usia kehamilan dan pendamping untuk KA jarak jauh.",
   "isi": "## Identitas\n- Data penumpang pada tiket harus sesuai identitas resmi (NIK).\n- Verifikasi identitas dilakukan saat boarding, jadi bawa identitas asli (KTP, SIM, paspor, atau kartu pelajar bagi penumpang di bawah 17 tahun).\n- Untuk anak, NIK dicatat dari Kartu Keluarga (KK) atau Kartu Identitas Anak (KIA).\n\n## Anak dan bayi\n- Anak usia 3 tahun ke atas wajib memiliki tiket sendiri.\n- Anak di bawah 3 tahun (infant) boleh dipangku tanpa membeli kursi. Pada KA jarak jauh tetap dibuatkan tiket infant dengan harga Rp0.\n- Usia dihitung pada tanggal keberangkatan. Menurut panduan komunitas, jumlah infant tidak boleh melebihi jumlah penumpang dewasa.\n- Tiket infant dipesan bersama tiket dewasa lewat Access by KAI. Jika terlambat, urus di loket stasiun yang melayani, sekitar 1 jam sebelum berangkat, dengan menunjukkan Kartu Keluarga.\n\n## Ibu hamil\n- Usia kehamilan 14 sampai 28 minggu boleh naik KA jarak jauh dan wajib didampingi minimal satu orang pendamping.\n- Di luar rentang 14 sampai 28 minggu, wajib menyertakan surat keterangan sehat terbaru dari dokter kandungan atau bidan.\n- Laporkan kondisi saat boarding agar petugas dapat memprioritaskan keselamatan. Jika butuh bantuan di perjalanan, hubungi kondektur. Nomor telepon kondektur terpasang di ujung depan setiap kabin.\n- Aturan ini berlaku sejak 31 Maret 2017 dan ditegaskan kembali dalam syarat naik KA 2026.\n\n## Catatan\nSyarat dapat berubah mengikuti kebijakan pemerintah, seperti pada masa pandemi. Cek ketentuan terbaru di Access by KAI sebelum berangkat.",
   "tag": "syarat naik kereta, ktp, identitas, nik, kia, kartu keluarga, anak, bayi, balita, infant, dipangku, 3 tahun, ibu hamil, bumil, kehamilan, surat dokter, pendamping",
   "sumber": "Mau Naik Kereta Api Jarak Jauh? Ini Syarat Terbaru di 2026 — Metro TV News, 15 Feb 2026 — https://www.metrotvnews.com/read/kpLCQBpm-mau-naik-kereta-api-jarak-jauh-ini-syarat-terbaru-di-2026\nSyarat Naik Kereta Api dan Ketentuan Mudik Lebaran 2024 — Bisnis.com, 21 Mar 2024 — https://ekonomi.bisnis.com/read/20240321/98/1750208/syarat-naik-kereta-api-dan-ketentuan-mudik-lebaran-2024\nKAI akan berlakukan aturan penumpang hamil — ANTARA Sumut, 24 Feb 2017 — https://sumut.antaranews.com/berita/164480/kai-akan-berlakukan-aturan-penumpang-hamil\nSimak Ketentuan Naik Kereta Api Bagi Ibu Hamil — Kontan Moms Money, (tanpa tanggal di hasil pencarian) — https://momsmoney.kontan.co.id/news/simak-ketentuan-naik-kereta-api-bagi-ibu-hamil\nAnak Usia Dibawah 3 Tahun Belum Dikenakan Tarif Tiket Kereta Api — keretaapikita.com (blog komunitas, bukan sumber resmi), (tanpa tanggal) — https://keretaapikita.com/anak-usia-dibawah-3-tahun-belum-dikenakan-tarif-tiket-kereta-api/\nCatatan: Bagian jumlah infant dan urus di loket 1 jam sebelum berangkat berasal dari blog komunitas, bukan sumber resmi.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 8
  },
  {
   "id": "kelas-kereta",
   "kategori": "rangkaian",
   "judul": "Kelas kereta api jarak jauh",
   "ringkasan": "Eksekutif, Ekonomi, Priority, Luxury, Panoramic, Suite Class, nasib kelas Bisnis di Jawa, dan arti subkelas pada tiket.",
   "isi": "## Kelas yang ada saat ini\n- Eksekutif: kelas utama untuk perjalanan jauh. Versi stainless steel New Generation memakai kursi lebih nyaman, stop kontak dan port USB di setiap kursi, serta layar informasi.\n- Ekonomi: dibagi menjadi Ekonomi komersial dan Ekonomi PSO (bersubsidi, Public Service Obligation). KAI terus memperbaiki kelas ini, termasuk kursi yang bisa disandarkan dan diputar seperti eksekutif, dan rangkaian Ekonomi New Generation.\n- Priority: kelas di atas eksekutif, diluncurkan sejak 2017.\n- Luxury (sering disebut Sleeper): kelas paling mewah, mulai beroperasi 12 Juni 2018 pada KA Argo Bromo Anggrek, kini juga ada pada KA seperti Gajayana, Taksaka, Sembrani, Argo Lawu, dan Argo Dwipangga pada jadwal tertentu.\n- Panoramic: kereta berjendela lebar agar penumpang menikmati pemandangan. Dioperasikan pada KA tertentu.\n- Suite Class Kompartemen: layanan mewah berprivasi tinggi yang diluncurkan pertengahan Oktober 2023.\n\n## Kelas Bisnis\nPada 15 Juli 2025, KA Gumarang mulai memakai rangkaian stainless steel New Generation. Sejak itu seluruh KA jarak jauh KAI di Pulau Jawa melayani kelas Eksekutif, Ekonomi komersial, dan Ekonomi PSO. KAI tetap mempertimbangkan kelas Bisnis untuk perjalanan fakultatif pada momen tertentu seperti Natal, Tahun Baru, dan Lebaran.\n\n## Subkelas (huruf pada tiket)\nSelain kelas, tiket memuat subkelas berupa huruf, misalnya pada Ekonomi: CA, C, P, S, dan Q. Menurut penjelasan yang mengutip kai.id, perbedaan antar subkelas dalam satu kelas terutama pada harga tiket, sedangkan fasilitas dalam kelas yang sama setara. Subkelas murah biasanya habis lebih dulu, jadi pesanlah jauh hari.\n\n## Fasilitas umum\nPada perjalanan jarak jauh umumnya tersedia AC, toilet, stop kontak, dan layanan makanan dan minuman. Rincian bergantung pada kereta dan kelas, jadi cek deskripsi kereta saat memesan.",
   "tag": "kelas kereta, eksekutif, ekonomi, bisnis, priority, prioritas, luxury, sleeper, panoramic, suite, compartment, new generation, subkelas, pso, komersial",
   "sumber": "KAI Umumkan Penghapusan Kereta Kelas Bisnis di Pulau Jawa, Apa Penggantinya? — Kontan, 17 Jul 2025 — https://industri.kontan.co.id/news/kai-umumkan-penghapusan-kereta-kelas-bisnis-di-pulau-jawa-apa-penggantinya\nKenyamanan Sekelas Pesawat, Ini Kelebihan Layanan KA Suite Class — Bisnis.com, 4 Okt 2023 — https://ekonomi.bisnis.com/read/20231004/98/1700957/kenyamanan-sekelas-pesawat-ini-kelebihan-layanan-ka-suite-class\nKereta Api Punya 6 Kelas, Ini Beda Kelas Ekonomi sampai Sleeper — CNN Indonesia, 29 Agu 2022 — https://www.cnnindonesia.com/gaya-hidup/20220829123136-269-840294/kereta-api-punya-6-kelas-ini-beda-kelas-ekonomi-sampai-sleeper/2\nKAI Modifikasi Kursi KA Ekonomi, Bisa Disandarkan dan Diputar seperti Kelas Eksekutif — Kompas TV, (tanpa tanggal di hasil pencarian) — https://www.kompas.tv/article/410054/hore-kai-modifikasi-kursi-ka-ekonomi-bisa-disandarkan-dan-diputar-seperti-kelas-eksekutif\nKAI Obral Diskon 25% Tiket Kereta Eksekutif hingga Luxury, Ini Daftarnya — Bisnis.com, 26 Des 2025 — https://ekonomi.bisnis.com/read/20251226/98/1939706/kai-obral-diskon-25-tiket-kereta-eksekutif-hingga-luxury-ini-daftarnya\nPerbedaan Sub Kelas Kereta Api, Cek di Sini! (mengutip kai.id) — kumparan, (tanpa tanggal di hasil pencarian) — https://kumparan.com/jendela-dunia/1zv47epCY3N\nCatatan: Daftar KA yang memakai kelas Luxury berdasarkan diskon Nataru 2025/2026 dan dapat berubah.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 9
  },
  {
   "id": "krl-commuter-line",
   "kategori": "rangkaian",
   "judul": "KRL Commuter Line",
   "ringkasan": "Tarif, Kartu Multi Trip (KMT), cara bayar dan tap in tap out, lintas Jabodetabek, serta kereta petani-pedagang.",
   "isi": "## Tarif\n- Rp3.000 untuk 25 km pertama, lalu tambahan Rp1.000 setiap 10 km berikutnya (Keputusan Menteri Perhubungan Nomor 354 Tahun 2020).\n- KAI Commuter sempat mengusulkan penyesuaian tarif ke Kemenhub, tetapi tarif di atas tetap berlaku pada pemberitaan terbaru yang kami temukan. Cek ulang bila ada pengumuman baru.\n\n## Cara membayar dan naik\n1. Siapkan kartu: Kartu Multi Trip (KMT), uang elektronik bank (e-money, Flazz, Brizzi, dan sejenisnya), atau QRIS lewat aplikasi mitra seperti GoPay.\n2. Tap in di gate stasiun asal, lalu tap out di stasiun tujuan. Tarif dihitung dari jarak.\n3. Pastikan saldo cukup sebelum masuk.\n\n## Kartu Multi Trip (KMT)\n- Diterbitkan PT Kereta Commuter Indonesia (KAI Commuter).\n- Harga Rp30.000, sudah termasuk saldo Rp10.000.\n- Dijual di stasiun KRL dan gerai mitra.\n- Top up dengan tunai di vending machine (masukkan uang pas, tidak ada kembalian) atau dengan QRIS.\n- Pada semester I 2024, 49,42% transaksi KRL memakai KMT.\n\n## Lintas KRL Jabodetabek\nBogor (merah), Lingkar Cikarang (biru), Rangkasbitung (hijau), Tangerang (cokelat), dan Merak (hijau tua). Ada juga KRL Yogyakarta–Solo. Rute dapat berubah, misalnya ada relasi yang dihapus atau digabung.\n\n## Kereta petani dan pedagang\nMulai 1 Desember 2025, gerbong khusus petani dan pedagang dirangkaikan pada KA Lokal Commuter Line Merak dengan 73 tempat duduk. Tiketnya Rp3.000 untuk orang dan barang bawaannya, daftar dengan identitas dan formulir di loket, maksimal 2 koli.\n\n## Lain-lain\n- KRL tidak ada pembatalan tiket per perjalanan karena sistem tap in dan tap out.\n- Lihat juga topik Aturan bagasi dan Barang dan hewan yang dilarang.",
   "tag": "krl, commuter line, commuterline, kai commuter, kmt, kartu multi trip, tarif krl, tap in, tap out, jabodetabek, qris, top up, jogja solo, petani pedagang",
   "sumber": "Rute KRL Jabodetabek Terbaru 2026 Beserta Harga Tiketnya — Fortune IDN, 2026 — https://www.fortuneidn.com/news/rute-krl-jabodetabek-00-z4fpb-jtrts9\nSubsidi NIK Tarif KRL Ditunda, Mulai Diterapkan 2025 — Kabar Bursa, 2024 — https://www.kabarbursa.com/makro/subsidi-nik-tarif-krl-ditunda-mulai-diterapkan-2025\nCara Cek Saldo KRL (memuat harga KMT dan cara top up) — OCBC Indonesia, 28 Mei 2024 — https://www.ocbc.id/id/article/2024/05/28/cara-cek-saldo-krl\nBayar KRL Bisa Pakai QRIS Loh, Begini Caranya! — OCBC Indonesia, 10 Jan 2025 — https://www.ocbc.id/id/article/2025/01/10/bayar-krl-pakai-qris\nDeretan Barang yang Dilarang Dibawa di Kereta Khusus Petani-Pedagang — detikFinance, 30 Nov 2025 — https://finance.detik.com/infrastruktur/d-8236173/deretan-barang-yang-dilarang-dibawa-di-kereta-khusus-petani-pedagang\nVersi sebelumnya dari spreadsheet K-Pedia (isi dipertahankan, belum diverifikasi ulang) — K-Pedia, 18 Okt 2026\nCatatan: Bagian 'KRL tidak ada pembatalan tiket' berasal dari versi sebelumnya dan belum diverifikasi ulang.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 10
  },
  {
   "id": "lrt-jabodebek",
   "kategori": "rangkaian",
   "judul": "LRT Jabodebek",
   "ringkasan": "Tarif berdasarkan KM 67/2023, 18 stasiun, cara bayar, dan keterhubungan dengan KRL, Whoosh, dan KA Bandara.",
   "isi": "## Tarif\n- Rp5.000 untuk 1 km pertama, lalu tambahan Rp700 setiap km berikutnya (Keputusan Menteri Perhubungan Nomor KM 67 Tahun 2023).\n- Pada awal beroperasi ada promo tarif flat Rp5.000 (diskon 78%) sampai akhir September 2023, lalu tarif promo maksimal Rp20.000 sampai akhir Februari 2024.\n- Pemberitaan 2025 menyebut pada jam sibuk tarif maksimal Rp20.000, sedangkan di luar jam sibuk tertinggi Rp10.000. Cek tarif berjalan sebelum bepergian.\n\n## Stasiun (18 stasiun)\nDukuh Atas, Setiabudi, Rasuna Said, Kuningan, Pancoran, Cikoko, Ciliwung, Cawang, TMII, Kampung Rambutan, Ciracas, Harjamukti, Halim, Jatibening Baru, Cikunir I, Cikunir II, Bekasi Barat, dan Jati Mulya.\n\n## Cara membayar\nPembayaran nontunai: kartu uang elektronik bank, Kartu Multi Trip (KMT), QRIS, LinkAja, KAI Pay, dan pembelian lewat Access by KAI. Disarankan saldo kartu minimal Rp10.000. Tersedia vending machine untuk top up di stasiun.\n\n## Integrasi\nSeluruh stasiun terhubung dengan moda lain. Misalnya Dukuh Atas terhubung dengan Commuter Line, MRT Jakarta, Transjakarta, dan KA Bandara. Stasiun Halim terhubung dengan Whoosh. Satu rangkaian terdiri dari 6 kereta.",
   "tag": "lrt, lrt jabodebek, light rail transit, kereta ringan, tarif lrt, dukuh atas, halim, cawang, bekasi, bogor, depok, km 67",
   "sumber": "Tarif LRT Jabodebek Mulai dari Rp5.000, Begini Detailnya (KM 67 Tahun 2023) — Bisnis.com, 18 Jul 2023 — https://ekonomi.bisnis.com/read/20230718/98/1676064/tarif-lrt-jabodebek-mulai-dari-rp5000-begini-detailnya\nStasiun LRT Jabodebek yang Terhubung dengan Whoosh, KRL, dan Kereta Bandara Soetta — Kompas TV, 2025 — https://www.kompas.tv/info-publik/616047/stasiun-lrt-jabodebek-yang-terhubung-dengan-whoosh-krl-dan-kereta-bandara-soetta\nPromo LRT Jabodebek: Diskon 78 Persen dan Tarif Maksimal Rp20 Ribu — Kompas TV, 28 Agu 2023 — https://www.kompas.tv/regional/438701/promo-lrt-jabodebek-diskon-78-persen-dan-tarif-maksimal-rp20-ribu-simak-waktunya?page=all\nIni Cara Beli Tiket LRT Jabodebek via Access by KAI — Kompas TV, 30 Agu 2023 — https://www.kompas.tv/ekonomi/439127/ini-cara-beli-tiket-lrt-jabodebek-via-access-by-kai-tarif-flat-5-000-sampai-akhir-september-2023",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 11
  },
  {
   "id": "whoosh",
   "kategori": "rangkaian",
   "judul": "Whoosh (Kereta Cepat Jakarta-Bandung)",
   "ringkasan": "Operator KCIC, stasiun, kelas dan kisaran tarif, kartu Frequent Whoosher, serta kanal pembelian resmi.",
   "isi": "## Profil singkat\n- Dioperasikan PT Kereta Cepat Indonesia China (KCIC), perusahaan patungan pembangun kereta cepat. Pemancangan awal 21 Januari 2016, Whoosh diresmikan 2 Oktober 2023.\n- Jalur 142,3 km, kecepatan hingga 350 km/jam, 13 gerbong pada pemberitaan.\n- Empat stasiun: Halim (Jakarta), Karawang, Padalarang, dan Tegalluar Summarecon (Bandung). Halim ke Karawang sekitar 15 menit dan Karawang ke Padalarang atau Tegalluar sekitar 20 menit.\n- Penumpang relasi Padalarang dapat memakai KA Feeder ke Stasiun Bandung dan Cimahi.\n\n## Kelas dan tarif\n- Premium Economy: mulai sekitar Rp75.000 sampai Rp350.000 (bergantung relasi dan waktu). Halim–Padalarang atau Tegalluar mulai Rp175.000 pada beberapa daftar harga.\n- Business Class: Rp450.000.\n- First Class: Rp600.000.\n- Tarif memakai dynamic pricing, mengikuti permintaan dan strategi promo. Periode libur tarif normal bisa mencapai Rp350.000, dan KCIC kerap membuat promo (contoh Isra Miraj 2026 mulai Rp200.000).\n\n## Frequent Whoosher Card\nRp1.750.000 untuk 10 perjalanan Premium Economy tarif flat Rp175.000 per perjalanan, termasuk jam sibuk dan akhir pekan. Dibeli di loket stasiun Halim, Karawang, Padalarang, dan Tegalluar. Tiket dari penukaran kuota tidak dapat dibatalkan atau diubah jadwal.\n\n## Cara membeli\nAplikasi Whoosh, situs ticket.kcic.co.id, mitra resmi (Access by KAI, Livin' by Mandiri, BRImo, Wondr by BNI, tiket.com, Traveloka, Trip.com), serta loket dan vending machine di stasiun. KCIC tidak menjual lewat nomor pribadi.",
   "tag": "whoosh, kereta cepat, kcic, jakarta bandung, halim, padalarang, tegalluar, karawang, premium economy, business class, first class, frequent whoosher, tarif whoosh",
   "sumber": "Berapa Harga Tiket Kereta Cepat Whoosh? — Metro TV News, (tanpa tanggal di hasil pencarian) — https://www.metrotvnews.com/read/kELCz9Gy-berapa-harga-tiket-kereta-cepat-whoosh-ini%20rinciannya\nHight Speed Train (WHOOSH) — halaman tiket.com — tiket.com, 2026 — https://www.tiket.com/kereta-api/kcic\nLibur Isra Miraj, Whoosh Obral Tiket Long Weekend Mulai Rp200.000 — Bisnis.com, 15 Jan 2026 — https://ekonomi.bisnis.com/read/20260115/98/1944419/libur-isra-miraj-whoosh-obral-tiket-long-weekend-mulai-rp200000\nPakai Kartu Frequent Whoosher, Naik Kereta Cepat Cuma Bayar Rp175.000 — Pasardana.id, 9 Jan 2025 — https://pasardana.id/news/2025/1/9/pakai-kartu-frequent-whoosher-naik-kereta-cepat-cuma-bayar-rp175000\nHarga Tiket dan Jadwal Kereta Cepat Whoosh ke Stasiun Karawang, Sudah Bisa Dipesan — Kontan, 22 Des 2024 — https://industri.kontan.co.id/news/harga-tiket-dan-jadwal-kereta-cepat-whoosh-ke-stasiun-karawang-sudah-bisa-dipesan?page=all\nHarga Tiket Kereta Cepat Rp150.000 lewat Aplikasi Whoosh (dynamic pricing) — investortrust.id, Okt 2023 — https://investortrust.id/business/17838/pengumuman-harga-tiket-kereta-cepat-rp-150000-lewat-aplikasi-whoosh\nMarak Modus Penipuan Whoosh, KCIC Tegaskan Tiket Hanya Dijual Lewat Kanal Resmi — Kompas TV, 2026 — https://www.kompas.tv/ekonomi/652993/marak-modus-penipuan-whoosh-kcic-tegaskan-tiket-hanya-dijual-lewat-kanal-resmi\nSejarah Perkeretaapian Indonesia — Direktorat Jenderal Perkeretaapian, Kemenhub, (situs resmi) — https://djka.kemenhub.go.id/sejarah-perkeretaapian-indonesia?lang=en_\nCatatan: Tarif Whoosh berubah-ubah (dynamic pricing). Rentang di atas adalah contoh dari pemberitaan, bukan harga pasti.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 12
  },
  {
   "id": "ka-bandara",
   "kategori": "rangkaian",
   "judul": "KA Bandara",
   "ringkasan": "Layanan kereta menuju bandara: Kualanamu, Soekarno-Hatta, dan Yogyakarta International Airport.",
   "isi": "## Layanan\n- KA Bandara menghubungkan pusat kota dengan stasiun yang terintegrasi bandara, antara lain Bandara Kualanamu (Medan), Bandara Internasional Yogyakarta (YIA), dan Bandara Soekarno-Hatta.\n- KA Bandara Kualanamu mulai beroperasi 25 Juli 2013, dioperasikan PT Railink, anak usaha KAI bersama Angkasa Pura II.\n- KA Bandara Soekarno-Hatta di Jakarta berhenti di Stasiun Sudirman Baru, dan terhubung dengan LRT Jabodebek di Dukuh Atas. Jalur alternatif: KRL dari Cawang ke Manggarai, lalu berganti ke kereta bandara.\n\n## Pemesanan\nTiket KA Bandara dapat dibeli lewat Access by KAI. Cek kanal resmi untuk jadwal dan tarif terbaru karena dapat berubah.",
   "tag": "ka bandara, kereta bandara, railink, kualanamu, soekarno hatta, soetta, yia, bandara, sudirman baru, airport train",
   "sumber": "Sejarah Perkeretaapian Indonesia — Direktorat Jenderal Perkeretaapian, Kemenhub, (situs resmi) — https://djka.kemenhub.go.id/sejarah-perkeretaapian-indonesia?lang=en_\nStasiun LRT Jabodebek yang Terhubung dengan Whoosh, KRL, dan Kereta Bandara Soetta — Kompas TV, 2025 — https://www.kompas.tv/info-publik/616047/stasiun-lrt-jabodebek-yang-terhubung-dengan-whoosh-krl-dan-kereta-bandara-soetta\nIni Cara Beli Tiket LRT Jabodebek via Access by KAI (fitur Access by KAI) — Kompas TV, 30 Agu 2023 — https://www.kompas.tv/ekonomi/439127/ini-cara-beli-tiket-lrt-jabodebek-via-access-by-kai-tarif-flat-5-000-sampai-akhir-september-2023\nVersi sebelumnya dari spreadsheet K-Pedia (isi dipertahankan, belum diverifikasi ulang) — K-Pedia, 18 Okt 2026\nCatatan: Bagian daftar bandara dari versi sebelumnya dan belum diverifikasi ulang. Jadwal dan tarif tidak dicantumkan karena sering berubah.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 13
  },
  {
   "id": "lokomotif-rangkaian",
   "kategori": "rangkaian",
   "judul": "Lokomotif, kereta pembangkit, dan stamformasi",
   "ringkasan": "Dasar membaca kode lokomotif BB dan CC, fungsi kereta pembangkit, serta arti stamformasi rangkaian.",
   "isi": "## Lokomotif\nLokomotif menarik rangkaian kereta penumpang dan barang. Kode huruf menunjukkan susunan gandar: BB berarti dua bogie dengan dua gandar, CC berarti dua bogie dengan tiga gandar. Seri yang umum ditemui pada KA penumpang antara lain CC 201, CC 203, CC 204, dan CC 206.\n\n## Kereta pembangkit\nKereta Pembangkit (P) membawa generator yang memasok listrik untuk AC dan penerangan seluruh rangkaian. Ada pula Kereta Makan Pembangkit (KMP) yang menggabungkan fungsi restorasi dan pembangkit.\n\n## Stamformasi\nStamformasi adalah susunan rangkaian dalam satu perjalanan, yaitu urutan lokomotif dan kereta (eksekutif, ekonomi, restorasi, pembangkit, dan lain-lain). Susunan dapat berubah mengikuti kebutuhan operasional.\n\n## Armada KRL\nArmada KRL Commuter Line terdiri dari beberapa seri rangkaian. Sebagian besar didatangkan dari Jepang, misalnya seri JR 205, JR 203, Tokyo Metro 6000 dan 7000, serta Tokyu 8000 dan 8500, dan ada rangkaian buatan dalam negeri. Daftar armada dapat berubah mengikuti pengadaan dan pensiun rangkaian.",
   "tag": "lokomotif, cc 201, cc 203, cc 206, bb, kereta pembangkit, kmp, stamformasi, rangkaian, armada krl, jr 205, tokyo metro",
   "sumber": "Versi sebelumnya dari spreadsheet K-Pedia (isi dipertahankan, belum diverifikasi ulang) — K-Pedia, 18 Okt 2026\nPengetahuan umum perkeretaapian (tanpa sumber tunggal) — mohon verifikasi ke kai.id atau peraturan terkait — K-Pedia, 19 Okt 2026\nCatatan: Isi berasal dari versi sebelumnya (pengetahuan umum) dan belum diverifikasi ke sumber resmi. Perlu verifikasi sebelum dipublikasikan.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 14
  },
  {
   "id": "kontak-kai",
   "kategori": "layanan",
   "judul": "Kontak dan bantuan KAI",
   "ringkasan": "Nomor Contact Center 121, WhatsApp, email, chat di Access by KAI, dan cara melapor barang tertinggal.",
   "isi": "## Kanal resmi\n- Contact Center 121 (telepon), beroperasi 24 jam setiap hari di seluruh wilayah operasi KAI.\n- WhatsApp resmi: 0811-2223-3121.\n- Email: cs@kai.id.\n- Chat langsung di aplikasi Access by KAI, bisa melampirkan foto bukti.\n- Media sosial resmi @KAI121.\n\n## Catatan nomor WhatsApp\nArtikel lama menyebut nomor 08111-2111-121 dan 0811-1211-1121. Pemberitaan Oktober 2025 menyebut nomor resmi 0811-2223-3121. Gunakan yang terbaru dan cek juga di aplikasi atau situs resmi.\n\n## Waspada penipuan\nKAI mengimbau hanya memakai nomor dan kanal resmi, serta mewaspadai pihak yang mengatasnamakan KAI.",
   "tag": "kontak, call center, 121, whatsapp, wa, email, cs, hubungi kai, bantuan, keluhan, pengaduan, customer service",
   "sumber": "Call Center KAI: Layanan 24 Jam untuk Keluhan Barang Tertinggal — Metro TV News, Okt 2025 (data Jan–Okt 2025) — https://www.metrotvnews.com/read/NrWC8wpg-call-center-kai-layanan-24-jam-untuk-keluhan-barang-tertinggal\nKAI Jember maksimalkan layanan Lost and Found saat angkutan Lebaran — ANTARA, Apr 2025 — https://www.antaranews.com/berita/4745885/kai-jember-maksimalkan-layanan-lost-and-found-saat-angkutan-lebaran\nCara Temukan Barang Hilang di Stasiun atau di Kereta Api — Fortune IDN, (data 2022) — https://www.fortuneidn.com/news/cara-temukan-barang-hilang-di-stasiun-atau-di-atas-kereta-api-00-my5jv-mlrzrx\nCatatan: Nomor WhatsApp berbeda antar artikel dan antar tahun. Verifikasi sebelum dipublikasikan.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 15
  },
  {
   "id": "lost-and-found",
   "kategori": "layanan",
   "judul": "Barang tertinggal (Lost and Found)",
   "ringkasan": "Cara melapor dan mengambil barang yang tertinggal di kereta atau stasiun, tanpa biaya.",
   "isi": "## Cara melapor\n- Lapor ke kondektur atau petugas pengamanan, ke Customer Service stasiun, atau hubungi Contact Center 121.\n- Siapkan ciri-ciri barang dan kode booking jika tertinggal di kereta.\n- Laporan lewat 121 mendapat kabar status lewat telepon, email, atau pesan langsung.\n\n## Cara mengambil\n- Barang yang ditemukan diumumkan lewat pengeras suara, disimpan di pos pengamanan stasiun, lalu dicatat di sistem Lost and Found KAI.\n- Bawa dokumen identitas saat mengambil, lalu tunjukkan kepada polisi khusus kereta api (Polsuska) untuk diverifikasi.\n- Pengembalian tidak dipungut biaya.\n\n## Angka\n- Sepanjang Januari 2025, KAI mengamankan 957 barang tertinggal senilai sekitar Rp1,19 miliar.\n- Januari sampai Oktober 2025 tercatat 11.670 laporan, dan 85 persen berhasil dikembalikan.\n- Barang yang lama tidak diambil dapat diserahkan ke lembaga atau yayasan sosial.\n\n## Tips\nSimpan tiket perjalanan sampai barang dinyatakan aman, dan segera hubungi 121 saat sadar ada yang tertinggal.",
   "tag": "barang tertinggal, ketinggalan barang, hilang, lost and found, kehilangan, dompet, hp, tas, polsuska",
   "sumber": "KAI Jember maksimalkan layanan Lost and Found saat angkutan Lebaran — ANTARA, Apr 2025 — https://www.antaranews.com/berita/4745885/kai-jember-maksimalkan-layanan-lost-and-found-saat-angkutan-lebaran\nKAI Amankan 957 Barang Tertinggal Senilai Rp1,1 Miliar — Metro TV News, Feb 2025 — https://www.metrotvnews.com/read/kBVC9y1w-kai-amankan-957-barang-tertinggal-senilai-rp1-1-miliar\nTak Perlu Panik saat Barang Tertinggal di Kereta, Begini Cara Mengambil Barang di Lost and Found KAI — JawaPos.com, 26 Agu 2025 — https://www.jawapos.com/travelling/2508260583/tak-perlu-panik-saat-barang-tertinggal-di-kereta-begini-cara-mengambil-barang-di-lost-and-found-kai\nCara Temukan Barang Hilang di Stasiun atau di Kereta Api — Fortune IDN, (data 2022) — https://www.fortuneidn.com/news/cara-temukan-barang-hilang-di-stasiun-atau-di-atas-kereta-api-00-my5jv-mlrzrx\nCall Center KAI: Layanan 24 Jam untuk Keluhan Barang Tertinggal — Metro TV News, Okt 2025 (data Jan–Okt 2025) — https://www.metrotvnews.com/read/NrWC8wpg-call-center-kai-layanan-24-jam-untuk-keluhan-barang-tertinggal",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 16
  },
  {
   "id": "access-by-kai",
   "kategori": "layanan",
   "judul": "Access by KAI (aplikasi resmi)",
   "ringkasan": "Fitur aplikasi untuk memesan tiket KA, KRL, LRT, KA Bandara, dan Whoosh, mengubah atau membatalkan tiket, serta chat bantuan.",
   "isi": "## Fungsi utama\n- Memesan tiket KA antar kota, KA lokal, Commuter Line, KA Bandara, LRT Jabodebek, dan kereta cepat.\n- Menu Tiket untuk melihat tiket, e-boarding pass, pembatalan, dan ubah jadwal.\n- Cek dan Tambah Tiket untuk memasukkan tiket yang dibeli di kanal lain.\n- Registrasi face recognition untuk boarding tanpa tiket cetak.\n- Pembayaran memakai uang elektronik KAIPay pada pembelian tiket LRT.\n- Chat bantuan dan Pusat Bantuan.\n\n## Catatan\nNama aplikasi dulu KAI Access. Tampilan dan fitur dapat berubah, jadi cek pembaruan di toko aplikasi.",
   "tag": "access by kai, kai access, aplikasi kai, kai pay, kaipay, aplikasi resmi",
   "sumber": "Ini Cara Beli Tiket LRT Jabodebek via Access by KAI (fitur Access by KAI) — Kompas TV, 30 Agu 2023 — https://www.kompas.tv/ekonomi/439127/ini-cara-beli-tiket-lrt-jabodebek-via-access-by-kai-tarif-flat-5-000-sampai-akhir-september-2023\nCara Daftar Face Recognition KAI via Aplikasi Access, Boarding Cuma 5 Detik — Selular.ID, Des 2025 — https://selular.id/2025/12/cara-daftar-face-recognition-kai-via-aplikasi-access-boarding-cuma-5-detik/\nVersi sebelumnya dari spreadsheet K-Pedia (isi dipertahankan, belum diverifikasi ulang) — K-Pedia, 18 Okt 2026",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 17
  },
  {
   "id": "waspada-penipuan",
   "kategori": "layanan",
   "judul": "Tips aman membeli tiket dan waspada penipuan",
   "ringkasan": "Kebiasaan aman: pakai kanal resmi, jaga kode booking, dan kenali modus penipuan tiket.",
   "isi": "## Kebiasaan aman\n- Beli lewat kanal resmi: Access by KAI, situs resmi KAI, Contact Center 121, loket stasiun, atau mitra resmi.\n- Hindari kanal yang menarik biaya jasa tidak wajar.\n- Jangan membagikan kode booking atau bukti pembelian tiket.\n- Pastikan koneksi stabil saat berburu tiket musim libur.\n\n## Modus yang perlu diwaspadai (tiket Whoosh)\n- Penawaran lewat nomor pribadi.\n- Promo harga tertentu di luar kanal resmi.\n- Permintaan transfer ke rekening perorangan.\n- Permintaan NIK atau data pribadi dari pihak yang mengaku petugas.\nJika ragu, konfirmasi lewat Contact Center resmi.",
   "tag": "penipuan, scam, hoax, calo, tiket palsu, aman, kanal resmi, share kode booking",
   "sumber": "7 Tips Membeli Tiket KA di Masa Nataru — detikJabar, (Nataru 2023/2024) — https://www.detik.com/jabar/bisnis/d-7036010/7-tips-membeli-tiket-ka-di-masa-nataru\nMarak Modus Penipuan Whoosh, KCIC Tegaskan Tiket Hanya Dijual Lewat Kanal Resmi — Kompas TV, 2026 — https://www.kompas.tv/ekonomi/652993/marak-modus-penipuan-whoosh-kcic-tegaskan-tiket-hanya-dijual-lewat-kanal-resmi\nCall Center KAI: Layanan 24 Jam untuk Keluhan Barang Tertinggal — Metro TV News, Okt 2025 (data Jan–Okt 2025) — https://www.metrotvnews.com/read/NrWC8wpg-call-center-kai-layanan-24-jam-untuk-keluhan-barang-tertinggal",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 18
  },
  {
   "id": "istilah-tiket",
   "kategori": "istilah",
   "judul": "Istilah seputar tiket dan perjalanan",
   "ringkasan": "Arti KAJJ, KA lokal, KRL, relasi, tarif khusus, kode booking, boarding pass, bea pesan, subkelas, dan istilah tiket lain.",
   "isi": "## KAJJ (KA Jarak Jauh)\nKAJJ atau KA antar kota melayani perjalanan antar kota dengan jarak jauh. Tiket dipesan lewat Access by KAI atau loket stasiun, dan data identitas penumpang harus sesuai.\n\nKelas yang umum ditemui: Eksekutif dan Ekonomi (kelas Bisnis sudah dihapus di Jawa sejak 2025), ditambah varian seperti Ekonomi Premium atau Luxury pada kereta tertentu.\n\n## KA Lokal\nKA Lokal melayani perjalanan jarak pendek sampai menengah, biasanya dalam satu wilayah atau antar kota yang berdekatan. Tarif umumnya tetap sesuai relasi.\n\nKetentuan pembelian dan pembatalan tiket dapat berbeda dari KA antar kota. Untuk pembatalan, KA lokal umumnya diproses di stasiun.\n\n## KRL Commuter Line\nKRL (Kereta Rel Listrik) Commuter Line melayani perjalanan harian di wilayah perkotaan seperti Jabodetabek dan Yogyakarta-Solo. Penumpang tidak memesan tiket per perjalanan, tetapi membayar saat masuk (tap in) dan keluar (tap out) stasiun.\n\nLihat juga: Cara naik KRL.\n\n## Relasi\nRelasi menyebut rute perjalanan sebuah kereta api, misalnya Gambir - Surabaya Pasarturi.\n\nPada K-Pedia, relasi tarif khusus menunjukkan pasangan stasiun yang tercakup tarif khusus, lengkap dengan arah perjalanannya (searah atau pulang pergi).\n\n## Tarif khusus\nTarif khusus adalah tarif pada relasi, kereta, dan kelas tertentu yang nilainya berbeda dari tarif normal. Besarnya mengikuti data tarif yang berlaku.\n\nGunakan menu Tarif Khusus di K-Pedia untuk mencarinya berdasarkan stasiun asal-tujuan atau nama kereta. Tarif dan relasi dapat berubah, jadi pastikan lagi ke sumber resmi.\n\n## Kode booking\nKode booking dibuat saat pemesanan tiket berhasil. Kode ini dipakai untuk melihat detail pesanan, melakukan pembatalan, dan sebagai rujukan saat menghubungi layanan pelanggan.\n\nTiket yang dibeli lewat kanal lain dapat ditambahkan ke Access by KAI lewat menu Cek & Tambah Tiket menggunakan kode booking.\n\n## Boarding pass\nBoarding pass adalah bukti yang diperlukan untuk naik kereta api. Penumpang KA antar kota perlu menyiapkan boarding pass (termasuk e-boarding pass) dan identitas yang sesuai dengan data pemesanan.\n\nTiket yang sudah dicetak sebagai boarding pass tidak dapat dibatalkan lewat aplikasi.\n\n## Bea tiket & bea pesan\nBea tiket adalah harga perjalanan yang dibayar penumpang. Bea pesan adalah biaya layanan pemesanan yang terpisah dari bea tiket.\n\nDalam ketentuan pembatalan, potongan dihitung dari bea tiket dan tidak termasuk bea pesan.\n\n## Subkelas\nDalam satu kelas layanan, tiket dapat dibagi lagi menjadi beberapa subkelas yang ditandai kode huruf. Subkelas dapat memengaruhi harga dan ketersediaan kursi.\n\nKarena itu, harga pada satu kereta dan kelas yang sama bisa berbeda pada tanggal atau subkelas yang berbeda.\n\n## Go-show\nPembelian tiket langsung di loket stasiun menjelang keberangkatan. Loket KAI melayani penjualan go-show mulai 3 jam sebelum jadwal berangkat.\n\n## Koli dan dm³\nKoli adalah satuan item bagasi, dengan batas bagasi gratis 4 koli. dm³ (desimeter kubik) adalah satuan volume, batas bagasi gratis 100 dm³ atau sekitar 70 x 48 x 30 cm.\n\n## Infant\nPenumpang di bawah 3 tahun yang dipangku. Pada KA jarak jauh tetap dibuatkan tiket infant dengan harga Rp0.\n\n## CIC dan KMT\nCIC (Check-In Counter) adalah mesin check-in mandiri untuk mencetak boarding pass atau mendaftar face recognition. KMT (Kartu Multi Trip) adalah kartu uang elektronik KAI Commuter untuk KRL dan LRT.\n\n## Bea tiket\nBiaya yang dikenakan atas tiket. Pada pembatalan dan perubahan jadwal, bea yang dipotong dihitung 25% dari tarif di luar bea pesan.",
   "tag": "istilah, kajj, ka lokal, krl, relasi, tarif khusus, kode booking, boarding pass, bea pesan, subkelas, go show, koli, infant, cic, kmt, kamus",
   "sumber": "Versi sebelumnya dari spreadsheet K-Pedia (isi dipertahankan, belum diverifikasi ulang) — K-Pedia, 18 Okt 2026\nKAI Perpanjang Batas Waktu Pemesanan Tiket Melalui Channel Mitra Penjualan — Kontan, 21 Des 2023 — https://industri.kontan.co.id/news/kai-perpanjang-batas-waktu-pemesanan-tiket-melalui-channel-mitra-penjualan\nKAI Ingatkan Penumpang soal Aturan Bagasi, Maksimal 20 Kg — IDX Channel, 26 Jan 2024 — https://www.idxchannel.com/economics/kai-ingatkan-penumpang-soal-aturan-bagasi-maksimal-20-kg\nMau Naik Kereta Api Jarak Jauh? Ini Syarat Terbaru di 2026 — Metro TV News, 15 Feb 2026 — https://www.metrotvnews.com/read/kpLCQBpm-mau-naik-kereta-api-jarak-jauh-ini-syarat-terbaru-di-2026\nCara Reschedule Tiket Kereta (mengutip situs KAI Access) — OCBC Indonesia, 4 Nov 2024 — https://www.ocbc.id/id/article/2024/11/04/cara-reschedule-tiket-kereta\nCatatan: Sebagian istilah (KAJJ, KA lokal, KRL, relasi, tarif khusus, kode booking, boarding pass, bea pesan, subkelas) berasal dari versi sebelumnya (pengetahuan umum) dan perlu verifikasi.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 19
  },
  {
   "id": "istilah-operasional",
   "kategori": "istilah",
   "judul": "Istilah operasional dan petugas",
   "ringkasan": "Arti peron dan jalur, emplasemen, PPKA, masinis, kondektur, stamformasi, langsir, semboyan, serta jalur tunggal dan ganda.",
   "isi": "## Peron & jalur\nPeron adalah bagian stasiun tempat penumpang naik dan turun. Jalur adalah rel tempat kereta berhenti atau lewat, diberi nomor agar mudah dirujuk.\n\nSatu peron dapat melayani lebih dari satu jalur.\n\n## Emplasemen\nEmplasemen adalah area stasiun yang mencakup jalur rel, peron, bangunan, dan fasilitas operasional lainnya.\n\nIstilah ini sering muncul pada deskripsi stasiun bersejarah, misalnya emplasemen yang masih utuh atau sudah beralih fungsi.\n\n## PPKA\nPPKA (Pengatur Perjalanan Kereta Api) adalah petugas stasiun yang mengatur dan mengendalikan perjalanan kereta api di wilayah stasiunnya, termasuk izin berangkat dan masuk.\n\n## Masinis & asisten masinis\nMasinis mengemudikan kereta api dan bertanggung jawab atas keselamatan perjalanan dari sisi pengemudian. Dalam pengoperasiannya, masinis dibantu asisten masinis.\n\n## Kondektur & petugas KA\nKondektur memeriksa tiket dan membantu penumpang selama perjalanan. Pada KA antar kota, ada pula petugas pengamanan di dalam kereta.\n\n## Stamformasi\nStamformasi adalah susunan rangkaian dalam satu perjalanan, yaitu urutan lokomotif dan kereta (eksekutif, bisnis, ekonomi, restorasi, pembangkit, dan lain-lain).\n\nStamformasi dapat berubah mengikuti kebutuhan operasional.\n\n## Langsir\nLangsir adalah pergerakan lokomotif atau kereta di area stasiun untuk menyusun, memisahkan, atau memindahkan rangkaian. Kegiatan ini bukan perjalanan penumpang.\n\n## Semboyan\nSemboyan adalah isyarat yang dipakai untuk mengatur keselamatan perjalanan kereta api, misalnya sinyal, bendera, atau bunyi peluit, dan dipahami oleh petugas operasional.\n\n## Jalur tunggal & jalur ganda\nPada jalur tunggal, kereta dari dua arah memakai satu jalur sehingga perlu bersilang di stasiun. Pada jalur ganda, setiap arah punya jalurnya sendiri sehingga kapasitas lebih besar.",
   "tag": "istilah operasional, peron, jalur, emplasemen, ppka, masinis, kondektur, stamformasi, langsir, semboyan, jalur ganda, jalur tunggal, petugas",
   "sumber": "Versi sebelumnya dari spreadsheet K-Pedia (isi dipertahankan, belum diverifikasi ulang) — K-Pedia, 18 Okt 2026\nPengetahuan umum perkeretaapian (tanpa sumber tunggal) — mohon verifikasi ke kai.id atau peraturan terkait — K-Pedia, 19 Okt 2026\nCatatan: Isi berasal dari versi sebelumnya (pengetahuan umum) dan belum diverifikasi ke sumber resmi. Perlu verifikasi sebelum dipublikasikan.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 20
  },
  {
   "id": "sejarah-ka",
   "kategori": "umum",
   "judul": "Sejarah perkeretaapian Indonesia",
   "ringkasan": "Linimasa dari jalur pertama 1864, perebutan Kantor Pusat KA Bandung 1945, sampai perubahan bentuk perusahaan menjadi PT KAI.",
   "isi": "## Era kolonial\n- 17 Juni 1864: pencangkulan pertama pembangunan jalur dari Semarang menuju Vorstenlanden (Solo dan Yogyakarta) oleh Nederlandsch-Indische Spoorweg Maatschappij (NISM). Segmen awal Semarang–Tanggung sepanjang sekitar 25 sampai 26 km.\n- 10 Februari 1870: jalur ke Surakarta selesai. Jalur ini kemudian menyambung sampai Yogyakarta (Stasiun Lempuyangan).\n- Perusahaan kereta api lain pada masa itu antara lain Staatsspoorwegen (SS), Verenigde Spoorwegbedrijf, Deli Spoorweg, Semarang-Joana Stoomtram, dan Semarang-Cheribon Stoomtram.\n- Indonesia tercatat sebagai negara Asia kedua setelah India yang memiliki jaringan kereta api tertua.\n\n## Masa Jepang dan kemerdekaan\n- 1942 sampai 1945: pengelolaan kereta api oleh Jepang (Rikuyu Sokyoku).\n- 28 September 1945: Angkatan Muda Kereta Api merebut Kantor Pusat Kereta Api di Bandung dari Jepang. Pada hari yang sama dibentuk Djawatan Kereta Api Repoeblik Indonesia (DKARI). Tanggal ini diperingati sebagai Hari Kereta Api.\n\n## Perubahan bentuk perusahaan\n- 1950: DKARI dan SS/VS bergabung menjadi Djawatan Kereta Api (DKA).\n- 25 Mei 1963: menjadi Perusahaan Negara Kereta Api (PNKA).\n- 1971: menjadi Perusahaan Jawatan Kereta Api (PJKA).\n- 1991: menjadi Perusahaan Umum Kereta Api (Perumka). Perumka meluncurkan kelas eksekutif Argo Bromo.\n- 1998: menjadi PT Kereta Api (Persero). Sumber lain mencatat akta pendirian bertanggal 1 Juni 1999.\n- Sekitar 2010: memakai nama PT Kereta Api Indonesia (Persero), disingkat KAI.\n\n## Tonggak modern\n- 12 Agustus 2008: PT KAI Commuter Jabodetabek (KCJ) dibentuk untuk mengelola KRL.\n- 25 Juli 2013: KA Bandara Kualanamu beroperasi.\n- 21 Januari 2016: pemancangan awal kereta cepat Jakarta–Bandung oleh KCIC.\n- Agustus 2023: LRT Jabodebek beroperasi komersial.\n- 2 Oktober 2023: Whoosh diresmikan.\n\n## Catatan perbedaan sumber\nBeberapa media menulis kereta pertama langsung berjalan pada 17 Juni 1864, sedangkan sumber lain menyebut tanggal itu sebagai pencangkulan pertama. Tahun perubahan bentuk perusahaan juga berbeda antar sumber (misalnya PT Kereta Api pada 1998 atau 1999). Rujuk situs resmi KAI untuk tanggal baku.",
   "tag": "sejarah, kereta api pertama, 1864, nism, semarang, tanggung, hari kereta api, 28 september, dkari, pnka, pjka, perumka, kai, 1945, kolonial",
   "sumber": "Sejarah Perkeretaapian Indonesia — Direktorat Jenderal Perkeretaapian, Kemenhub, (situs resmi) — https://djka.kemenhub.go.id/sejarah-perkeretaapian-indonesia?lang=en_\n28 September Hari Kereta Api hingga Hari Pertambangan dan Energi Nasional — Kompas TV, 28 Sep 2025 — https://www.kompas.tv/info-publik/619996/28-september-hari-kereta-api-hingga-hari-pertambangan-dan-energi-nasional\nSejarah Singkat PT Kereta Api Indonesia (Persero) — BAB II — Eprints Universitas Diponegoro, (skripsi/laporan) — https://eprints2.undip.ac.id/id/eprint/34100/3/BAB%20II.pdf\nProfil PT Kereta Api Indonesia (Persero) — BAB II — Eprints Universitas Diponegoro, (skripsi/laporan) — https://eprints2.undip.ac.id/31034/3/BAB%20II%20%288%29.pdf\nSejarah Singkat Perusahaan (PT KAI Daop 1 Jakarta) — BAB II — Repository Universitas Multimedia Nusantara, (skripsi/laporan) — https://kc.umn.ac.id/id/eprint/29952/4/BAB%20II.pdf\nJelajah Kereta Api: Stasiun Tugu Bagian Memori Rindu di Yogyakarta — Bisnis.com, 28 Jul 2021 — https://ekonomi.bisnis.com/read/20210728/98/1423210/jelajah-kereta-api-stasiun-tugu-bagian-memori-rindu-di-yogyakarta\nCatatan: Tanggal peresmian operasi pertama Semarang–Tanggung (1867) umum disebut buku sejarah tetapi tidak ditemukan pada sumber yang dikutip, jadi tidak ditulis di sini.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 21
  },
  {
   "id": "organisasi-kai",
   "kategori": "umum",
   "judul": "Organisasi KAI: Daop, Divre, dan anak perusahaan",
   "ringkasan": "Pembagian wilayah operasi Daop dan Divre, anak perusahaan KAI, serta jalur utama lintas Jawa.",
   "isi": "## Wilayah operasi di Jawa (Daop)\nDaop adalah Daerah Operasi, pembagian wilayah kerja KAI di Pulau Jawa yang mengelola perjalanan kereta, stasiun, dan prasarana. Daftar yang umum dirujuk:\n- Daop 1 Jakarta\n- Daop 2 Bandung\n- Daop 3 Cirebon\n- Daop 4 Semarang\n- Daop 5 Purwokerto\n- Daop 6 Yogyakarta\n- Daop 7 Madiun\n- Daop 8 Surabaya\n- Daop 9 Jember\n\n## Wilayah operasi di Sumatera (Divre)\nDivre adalah Divisi Regional, setara Daop di Pulau Sumatera: Divre I Sumatera Utara, Divre II Sumatera Barat, Divre III Sumatera Selatan, dan Divre IV Tanjungkarang (Lampung). Selain itu ada divisi khusus, misalnya Divisi LRT Jabodebek.\n\n## Anak perusahaan dan afiliasi\n- KAI Commuter (PT Kereta Commuter Indonesia): KRL dan Commuter Line.\n- KAI Services: layanan penunjang di kereta dan stasiun.\n- KAI Wisata: kereta wisata dan layanan perjalanan.\n- KAI Logistik: ekspedisi dan angkutan barang.\n- Railink: KA Bandara bersama Angkasa Pura II.\n- KCIC: perusahaan patungan yang mengoperasikan Whoosh (bukan anak perusahaan KAI sepenuhnya).\n\n## Lintas utama Jawa\n- Lintas utara (Pantura) menghubungkan Jakarta, Cirebon, Semarang, dan Surabaya.\n- Lintas selatan menghubungkan Bandung, Banjar, Kroya, Yogyakarta, Solo, Madiun, dan Surabaya.\nKedua lintas ini menjadi jalur utama KA antar kota di Jawa.",
   "tag": "daop, divre, daerah operasi, divisi regional, anak perusahaan, kai commuter, kai services, kai wisata, kai logistik, railink, kcic, lintas utara, lintas selatan, pantura",
   "sumber": "Sejarah Singkat PT Kereta Api Indonesia (Persero) — BAB II — Eprints Universitas Diponegoro, (skripsi/laporan) — https://eprints2.undip.ac.id/id/eprint/34100/3/BAB%20II.pdf\nSejarah Perkeretaapian Indonesia — Direktorat Jenderal Perkeretaapian, Kemenhub, (situs resmi) — https://djka.kemenhub.go.id/sejarah-perkeretaapian-indonesia?lang=en_\nKAI Jember maksimalkan layanan Lost and Found saat angkutan Lebaran — ANTARA, Apr 2025 — https://www.antaranews.com/berita/4745885/kai-jember-maksimalkan-layanan-lost-and-found-saat-angkutan-lebaran\nVersi sebelumnya dari spreadsheet K-Pedia (isi dipertahankan, belum diverifikasi ulang) — K-Pedia, 18 Okt 2026\nPengetahuan umum perkeretaapian (tanpa sumber tunggal) — mohon verifikasi ke kai.id atau peraturan terkait — K-Pedia, 19 Okt 2026\nCatatan: Daftar Daop dan Divre ditulis dari pengetahuan umum yang dicocokkan dengan penyebutan di pemberitaan (Daop 1, 4, 8, 9, Divre I dan II). Verifikasi daftar lengkap di kai.id.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 22
  },
  {
   "id": "dasar-hukum",
   "kategori": "umum",
   "judul": "Dasar hukum dan regulasi yang sering dirujuk",
   "ringkasan": "Peraturan yang mendasari tarif KRL, tarif LRT, dan layanan kereta api.",
   "isi": "## Yang tercantum pada sumber\n- Keputusan Menteri Perhubungan Nomor 354 Tahun 2020: tarif KRL Commuter Line Jabodetabek (Rp3.000 untuk 25 km pertama, Rp1.000 tiap 10 km berikutnya).\n- Keputusan Menteri Perhubungan Nomor KM 67 Tahun 2023: tarif LRT Jabodebek untuk melaksanakan kewajiban pelayanan publik (Rp5.000 untuk 1 km pertama, Rp700 tiap km berikutnya).\n\n## Dasar umum\n- Undang-Undang Nomor 23 Tahun 2007 tentang Perkeretaapian menjadi dasar penyelenggaraan perkeretaapian nasional.\n\n## Catatan\nAturan teknis seperti syarat angkutan penumpang dan bagasi dapat diterbitkan sebagai peraturan menteri atau ketentuan perusahaan. Untuk teks resmi, buka basis data peraturan pemerintah atau situs resmi KAI.",
   "tag": "dasar hukum, regulasi, undang-undang, uu 23 2007, km 354, km 67, peraturan menteri, kemenhub",
   "sumber": "Rute KRL Jabodetabek Terbaru 2026 Beserta Harga Tiketnya — Fortune IDN, 2026 — https://www.fortuneidn.com/news/rute-krl-jabodetabek-00-z4fpb-jtrts9\nTarif LRT Jabodebek Mulai dari Rp5.000, Begini Detailnya (KM 67 Tahun 2023) — Bisnis.com, 18 Jul 2023 — https://ekonomi.bisnis.com/read/20230718/98/1676064/tarif-lrt-jabodebek-mulai-dari-rp5000-begini-detailnya\nPengetahuan umum perkeretaapian (tanpa sumber tunggal) — mohon verifikasi ke kai.id atau peraturan terkait — K-Pedia, 19 Okt 2026\nCatatan: UU 23/2007 ditulis dari pengetahuan umum dan belum dicek pada hasil pencarian. Verifikasi di peraturan.go.id sebelum dipublikasikan.",
   "diperbarui": "2026-10-19",
   "aktif": "Ya",
   "urutan": 23
  }
 ],
 "faq": [
  {
   "pertanyaan": "Berapa potongan atau bea kalau membatalkan tiket kereta?",
   "jawaban": "Bea pembatalan 25% dari harga tiket, di luar bea pesan. Sisanya dikembalikan.",
   "topik": "pembatalan-tiket",
   "bagian": "Ketentuan utama",
   "kata_kunci": "batal refund potongan persen berapa",
   "sumber": "Pengembalian Uang Tiket KAI Kini Hanya 7 Hari, Simak Ketentuannya — Bisnis.com, 29 Mei 2024 — https://ekonomi.bisnis.com/read/20240529/98/1769521/pengembalian-uang-tiket-kai-kini-hanya-7-hari-simak-ketentuannya\nBegini Syarat dan Cara Refund Tiket Kereta Api Secara Online & Offline — CNN Indonesia, 11 Des 2024 — https://www.cnnindonesia.com/edukasi/20241211110702-561-1176098/begini-syarat-dan-cara-refund-tiket-kereta-api-secara-online-offline",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Sampai kapan tiket kereta bisa dibatalkan?",
   "jawaban": "Di Access by KAI paling lambat 2 jam sebelum berangkat (status Paid). Di loket stasiun paling lambat 30 menit sebelum berangkat.",
   "topik": "pembatalan-tiket",
   "bagian": "Ketentuan utama",
   "kata_kunci": "batas waktu batal jam sebelum",
   "sumber": "Pengembalian Uang Tiket KAI Kini Hanya 7 Hari, Simak Ketentuannya — Bisnis.com, 29 Mei 2024 — https://ekonomi.bisnis.com/read/20240529/98/1769521/pengembalian-uang-tiket-kai-kini-hanya-7-hari-simak-ketentuannya\nBegini Syarat dan Cara Refund Tiket Kereta Api Secara Online & Offline — CNN Indonesia, 11 Des 2024 — https://www.cnnindonesia.com/edukasi/20241211110702-561-1176098/begini-syarat-dan-cara-refund-tiket-kereta-api-secara-online-offline",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Berapa lama uang refund tiket kereta kembali?",
   "jawaban": "Paling lambat 7 hari setelah tanggal pembatalan, berlaku sejak 1 Juni 2024. Sebelumnya 30 sampai 45 hari.",
   "topik": "pembatalan-tiket",
   "bagian": "Ketentuan utama",
   "kata_kunci": "refund lama berapa hari uang kembali",
   "sumber": "Pengembalian Uang Tiket KAI Kini Hanya 7 Hari, Simak Ketentuannya — Bisnis.com, 29 Mei 2024 — https://ekonomi.bisnis.com/read/20240529/98/1769521/pengembalian-uang-tiket-kai-kini-hanya-7-hari-simak-ketentuannya\nRefund Tiket KAI Kini Diberikan Dalam 7 Hari, Pahami Syarat dan Ketentuannya — Good News from Indonesia, 2 Jun 2024 — https://www.goodnewsfromindonesia.id/2024/06/02/refund-tiket-kai-kini-diberikan-dalam-7-hari-pahami-syarat-dan-ketentuannya",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Bagaimana cara membatalkan tiket kereta lewat aplikasi?",
   "jawaban": "Buka Access by KAI, menu Tiket, pilih kode booking, tekan Pembatalan, centang syarat dan ketentuan, lalu Lanjut.",
   "topik": "pembatalan-tiket",
   "bagian": "Cara membatalkan di Access by KAI",
   "kata_kunci": "cara langkah batal aplikasi",
   "sumber": "Begini Syarat dan Cara Refund Tiket Kereta Api Secara Online & Offline — CNN Indonesia, 11 Des 2024 — https://www.cnnindonesia.com/edukasi/20241211110702-561-1176098/begini-syarat-dan-cara-refund-tiket-kereta-api-secara-online-offline\nCara Refund Tiket Kereta Api Via Platform Online dan Loket Stasiun — Fortune IDN, (tanpa tanggal di hasil pencarian) — https://www.fortuneidn.com/news/cara-refund-tiket-kereta-api-secara-online-dan-loket-stasiun-00-my5jv-kcn7gn",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Bisakah pembatalan tiket diwakilkan orang lain?",
   "jawaban": "Bisa di loket stasiun dengan surat kuasa bermeterai dari pemilik tiket, identitas asli pemilik, dan fotokopinya.",
   "topik": "pembatalan-tiket",
   "bagian": "Cara membatalkan di stasiun",
   "kata_kunci": "wakil kuasa orang lain",
   "sumber": "KAI kembalikan bea tiket 100% bagi penumpang tanpa hasil tes COVID-19 (surat kuasa bermeterai untuk pembatalan diwakilkan) — ANTARA Jabar, 6 Apr 2022 — https://jabar.antaranews.com/berita/370249/kai-kembalikan-bea-tiket-100-bagi-penumpang-tanpa-hasil-tes-covid-19?page=all",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Bagaimana kalau KAI yang membatalkan perjalanan?",
   "jawaban": "Penumpang terdampak berhak pengembalian bea tiket 100% di luar bea pesan. Ajukan lewat Access by KAI, loket stasiun, atau 121 sesuai batas waktu pengumuman KAI.",
   "topik": "pembatalan-tiket",
   "bagian": "Jika KAI yang membatalkan perjalanan",
   "kata_kunci": "kereta batal gangguan bencana banjir longsor dibatalkan kai cuaca",
   "sumber": "Versi sebelumnya dari spreadsheet K-Pedia (isi dipertahankan, belum diverifikasi ulang) — K-Pedia, 18 Okt 2026",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Berapa biaya ubah jadwal tiket kereta?",
   "jawaban": "25% dari tarif kereta di luar bea pesan, dibulatkan ke atas pada kelipatan Rp1.000.",
   "topik": "ubah-jadwal",
   "bagian": "Ketentuan utama",
   "kata_kunci": "reschedule biaya ganti jadwal",
   "sumber": "Cara Reschedule Tiket Kereta (mengutip situs KAI Access) — OCBC Indonesia, 4 Nov 2024 — https://www.ocbc.id/id/article/2024/11/04/cara-reschedule-tiket-kereta\nMudah! Ini Cara Reschedule Tiket Kereta Api Lewat HP — Metro TV News, (tanpa tanggal di hasil pencarian) — https://www.metrotvnews.com/read/kELCnOax-mudah-ini-cara-reschedule-tiket-kereta-api-lewat-hp",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Sampai kapan boleh mengubah jadwal tiket?",
   "jawaban": "Menurut laporan Selular.ID, paling lambat 30 menit sebelum keberangkatan tiket lama. Jika lewat batas online, ubah di loket stasiun. Cek lagi di aplikasi.",
   "topik": "ubah-jadwal",
   "bagian": "Ketentuan utama",
   "kata_kunci": "batas reschedule",
   "sumber": "Cara Mengganti Jadwal Tiket Kereta Api dari Aplikasi — Selular.ID, Mar 2025 — https://selular.id/2025/03/cara-mengganti-jadwal-tiket-kereta-api-dari-aplikasi/",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Apakah tiket dari Traveloka atau tiket.com bisa di-reschedule di Access by KAI?",
   "jawaban": "Bisa, selama belum dicetak sebagai boarding pass dan kode booking sudah masuk ke menu Tiket dengan nama penumpang terdaftar di akun Access.",
   "topik": "ubah-jadwal",
   "bagian": "Tiket dari kanal lain",
   "kata_kunci": "traveloka tiket.com mitra ota reschedule",
   "sumber": "Mudah! Ini Cara Reschedule Tiket Kereta Api Lewat HP — Metro TV News, (tanpa tanggal di hasil pencarian) — https://www.metrotvnews.com/read/kELCnOax-mudah-ini-cara-reschedule-tiket-kereta-api-lewat-hp",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Berapa batas bagasi gratis di kereta api?",
   "jawaban": "20 kg, maksimal 100 dm³ (70 x 48 x 30 cm), dan paling banyak 4 koli.",
   "topik": "aturan-bagasi",
   "bagian": "Bagasi tanpa bea",
   "kata_kunci": "berat koper maksimal",
   "sumber": "KAI Ingatkan Penumpang soal Aturan Bagasi, Maksimal 20 Kg — IDX Channel, 26 Jan 2024 — https://www.idxchannel.com/economics/kai-ingatkan-penumpang-soal-aturan-bagasi-maksimal-20-kg\nKAI Tebar Diskon Tiket Kereta Api! 1,3 Juta Kursi Ludes Terjual (memuat ketentuan bagasi) — Bisnis.com, 24 Jun 2025 — https://ekonomi.bisnis.com/read/20250624/98/1887702/kai-tebar-diskon-tiket-kereta-api-13-juta-kursi-ludes-terjual",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Berapa biaya kelebihan bagasi kereta?",
   "jawaban": "Rp10.000 per kg di Eksekutif, Rp6.000 per kg di Bisnis, dan Rp2.000 per kg di Ekonomi.",
   "topik": "aturan-bagasi",
   "bagian": "Kelebihan bagasi",
   "kata_kunci": "denda overbagasi tarif kg",
   "sumber": "KAI Ingatkan Penumpang soal Aturan Bagasi, Maksimal 20 Kg — IDX Channel, 26 Jan 2024 — https://www.idxchannel.com/economics/kai-ingatkan-penumpang-soal-aturan-bagasi-maksimal-20-kg\nKAI Tebar Diskon Tiket Kereta Api! 1,3 Juta Kursi Ludes Terjual (memuat ketentuan bagasi) — Bisnis.com, 24 Jun 2025 — https://ekonomi.bisnis.com/read/20250624/98/1887702/kai-tebar-diskon-tiket-kereta-api-13-juta-kursi-ludes-terjual",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Boleh membawa sepeda ke kereta?",
   "jawaban": "Sepeda lipat boleh di kabin (maks 20 kg, roda maks 22 inci). Sepeda lain dikirim lewat angkutan barang kereta api.",
   "topik": "aturan-bagasi",
   "bagian": "Sepeda",
   "kata_kunci": "sepeda lipat mtb road bike",
   "sumber": "Naik Kereta Api Bisa Bawa Sepeda Lipat, Ini Syaratnya! — Bisnis.com, 2 Sep 2020 — https://ekonomi.bisnis.com/read/20200902/98/1286426/naik-kereta-api-bisa-bawa-sepeda-lipat-ini-syaratnya\nKAI: Ini Aturan Bawa Sepeda Lipat dan Hewan Peliharaan di Kereta — Bisnis.com, 30 Okt 2021 — https://ekonomi.bisnis.com/read/20211030/98/1460017/kai-ini-aturan-bawa-sepeda-lipat-dan-hewan-peliharaan-di-kereta",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Boleh bawa kucing atau anjing naik kereta?",
   "jawaban": "Tidak boleh ke kereta penumpang. Hewan diangkut lewat kereta bagasi atau angkutan barang, dengan kandang khusus dan bukan hewan yang dilarang pemerintah.",
   "topik": "barang-dilarang",
   "bagian": "Hewan peliharaan",
   "kata_kunci": "hewan peliharaan kucing anjing binatang",
   "sumber": "KAI: Ini Aturan Bawa Sepeda Lipat dan Hewan Peliharaan di Kereta — Bisnis.com, 30 Okt 2021 — https://ekonomi.bisnis.com/read/20211030/98/1460017/kai-ini-aturan-bawa-sepeda-lipat-dan-hewan-peliharaan-di-kereta",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Barang apa saja yang dilarang dibawa ke kereta?",
   "jawaban": "Narkotika, senjata api dan tajam, benda mudah terbakar atau meledak, benda berbau busuk atau amis, serta barang yang dilarang undang-undang.",
   "topik": "barang-dilarang",
   "bagian": "Barang yang tidak boleh dibawa",
   "kata_kunci": "larangan barang terlarang",
   "sumber": "KAI: Ini Aturan Bawa Sepeda Lipat dan Hewan Peliharaan di Kereta — Bisnis.com, 30 Okt 2021 — https://ekonomi.bisnis.com/read/20211030/98/1460017/kai-ini-aturan-bawa-sepeda-lipat-dan-hewan-peliharaan-di-kereta\nKAI ingatkan larangan barang menyusul penangkapan terduga teroris di Stasiun Solo Balapan — ANTARA, 1 Agu 2024 — https://megapolitan.antaranews.com/berita/301039/kai-ingatkan-larangan-barang-menyusul-penangkapan-terduga-teroris-di-stasiun-solo-balapan",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Anak umur berapa harus punya tiket kereta?",
   "jawaban": "Anak 3 tahun ke atas wajib tiket sendiri. Di bawah 3 tahun dipangku dengan tiket infant Rp0 pada KA jarak jauh.",
   "topik": "syarat-penumpang",
   "bagian": "Anak dan bayi",
   "kata_kunci": "bayi balita infant pangku gratis",
   "sumber": "Mau Naik Kereta Api Jarak Jauh? Ini Syarat Terbaru di 2026 — Metro TV News, 15 Feb 2026 — https://www.metrotvnews.com/read/kpLCQBpm-mau-naik-kereta-api-jarak-jauh-ini-syarat-terbaru-di-2026\nSyarat Naik Kereta Api dan Ketentuan Mudik Lebaran 2024 — Bisnis.com, 21 Mar 2024 — https://ekonomi.bisnis.com/read/20240321/98/1750208/syarat-naik-kereta-api-dan-ketentuan-mudik-lebaran-2024",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Apakah ibu hamil boleh naik kereta jarak jauh?",
   "jawaban": "Boleh pada usia kehamilan 14 sampai 28 minggu dengan satu pendamping. Di luar rentang itu wajib surat keterangan dokter kandungan atau bidan.",
   "topik": "syarat-penumpang",
   "bagian": "Ibu hamil",
   "kata_kunci": "hamil bumil kandungan surat dokter",
   "sumber": "Mau Naik Kereta Api Jarak Jauh? Ini Syarat Terbaru di 2026 — Metro TV News, 15 Feb 2026 — https://www.metrotvnews.com/read/kpLCQBpm-mau-naik-kereta-api-jarak-jauh-ini-syarat-terbaru-di-2026\nKAI akan berlakukan aturan penumpang hamil — ANTARA Sumut, 24 Feb 2017 — https://sumut.antaranews.com/berita/164480/kai-akan-berlakukan-aturan-penumpang-hamil",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Bayi di bawah 3 tahun perlu tiket?",
   "jawaban": "Pada KA jarak jauh tetap dibuatkan tiket infant dengan harga Rp0, tanpa kursi sendiri. Pesan bersama tiket dewasa lewat Access by KAI.",
   "topik": "syarat-penumpang",
   "bagian": "Anak dan bayi",
   "kata_kunci": "bayi tiket infant",
   "sumber": "Anak Usia Dibawah 3 Tahun Belum Dikenakan Tarif Tiket Kereta Api — keretaapikita.com (blog komunitas, bukan sumber resmi), (tanpa tanggal) — https://keretaapikita.com/anak-usia-dibawah-3-tahun-belum-dikenakan-tarif-tiket-kereta-api/\nMau Naik Kereta Api Jarak Jauh? Ini Syarat Terbaru di 2026 — Metro TV News, 15 Feb 2026 — https://www.metrotvnews.com/read/kpLCQBpm-mau-naik-kereta-api-jarak-jauh-ini-syarat-terbaru-di-2026",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Identitas apa yang dipakai untuk anak yang belum punya KTP?",
   "jawaban": "NIK dari Kartu Keluarga (KK) atau Kartu Identitas Anak (KIA).",
   "topik": "syarat-penumpang",
   "bagian": "Identitas",
   "kata_kunci": "anak kia kk nik",
   "sumber": "Syarat Naik Kereta Api dan Ketentuan Mudik Lebaran 2024 — Bisnis.com, 21 Mar 2024 — https://ekonomi.bisnis.com/read/20240321/98/1750208/syarat-naik-kereta-api-dan-ketentuan-mudik-lebaran-2024",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Kapan tiket kereta mulai dijual?",
   "jawaban": "Umumnya 30 hari sebelum keberangkatan. Pada masa angkutan Lebaran 2023 dibuka 45 hari sebelumnya. Ikuti pengumuman KAI tiap musim libur.",
   "topik": "cara-pesan-antarkota",
   "bagian": "Kapan tiket mulai dijual",
   "kata_kunci": "h-30 buka penjualan mudik lebaran",
   "sumber": "Tiket Kereta Lebaran 2023 Sudah Bisa Dipesan Sekarang, Simak Syarat dan Ketentuannya! — Good News from Indonesia, 27 Feb 2023 — https://www.goodnewsfromindonesia.id/2023/02/27/tiket-kereta-lebaran-2023-sudah-bisa-dipesan-sekarang-simak-syarat-dan-ketentuannya",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Beli tiket kereta di mana saja?",
   "jawaban": "Access by KAI, situs KAI, Contact Center 121, mitra resmi (Traveloka, tiket.com, Tokopedia, Indomaret, Alfamart, Pos Indonesia), dan loket stasiun untuk go-show.",
   "topik": "mitra-penjualan",
   "bagian": "Mitra penjualan online (OTA)",
   "kata_kunci": "kanal resmi beli di mana",
   "sumber": "KAI Perpanjang Batas Waktu Pemesanan Tiket Melalui Channel Mitra Penjualan — Kontan, 21 Des 2023 — https://industri.kontan.co.id/news/kai-perpanjang-batas-waktu-pemesanan-tiket-melalui-channel-mitra-penjualan\nKAI targetkan tiket 70% dari gerai eksternal — Kontan, 8 Mar 2017 — https://industri.kontan.co.id/news/kai-targetkan-tiket-70-dari-gerai-eksternal",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Sampai jam berapa bisa beli tiket lewat mitra?",
   "jawaban": "Sampai 1 jam sebelum keberangkatan, dengan pembayaran paling lambat 30 menit setelah transaksi (sejak 21 Desember 2023).",
   "topik": "cara-pesan-antarkota",
   "bagian": "Batas waktu pemesanan",
   "kata_kunci": "mitra batas beli mendadak",
   "sumber": "KAI Perpanjang Batas Waktu Pemesanan Tiket Melalui Channel Mitra Penjualan — Kontan, 21 Des 2023 — https://industri.kontan.co.id/news/kai-perpanjang-batas-waktu-pemesanan-tiket-melalui-channel-mitra-penjualan",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Loket stasiun jual tiket kapan?",
   "jawaban": "Loket melayani penjualan go-show mulai 3 jam sebelum jadwal keberangkatan.",
   "topik": "cara-pesan-antarkota",
   "bagian": "Kanal pemesanan resmi",
   "kata_kunci": "loket go show",
   "sumber": "KAI Perpanjang Batas Waktu Pemesanan Tiket Melalui Channel Mitra Penjualan — Kontan, 21 Des 2023 — https://industri.kontan.co.id/news/kai-perpanjang-batas-waktu-pemesanan-tiket-melalui-channel-mitra-penjualan\nTiket Kereta Lebaran 2023 Sudah Bisa Dipesan Sekarang, Simak Syarat dan Ketentuannya! — Good News from Indonesia, 27 Feb 2023 — https://www.goodnewsfromindonesia.id/2023/02/27/tiket-kereta-lebaran-2023-sudah-bisa-dipesan-sekarang-simak-syarat-dan-ketentuannya",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Kapan e-boarding pass muncul di aplikasi?",
   "jawaban": "Menurut panduan yang beredar, barcode e-boarding pass muncul sekitar 2 jam sebelum keberangkatan. Cek di Access by KAI.",
   "topik": "check-in-boarding",
   "bagian": "Boarding pass",
   "kata_kunci": "barcode cetak tiket",
   "sumber": "Cara Cetak Tiket Kereta Api Terbaru 2025 (Boarding Pass & Face Recognition) — Situs Universitas Negeri Surabaya (bukan sumber resmi KAI), 2025 — https://pendidikan-matematika.fmipa.unesa.ac.id/post/cara-cetak-tiket-kereta-api-terbaru-2025-boarding-pass-face-recognition",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Bagaimana cara mendaftar face recognition KAI?",
   "jawaban": "Lewat menu registrasi wajah di Access by KAI, atau di stasiun lewat mesin CIC, vending machine, atau petugas layanan pelanggan. Daftar sekali.",
   "topik": "check-in-boarding",
   "bagian": "Face Recognition Boarding Gate",
   "kata_kunci": "scan wajah daftar fr",
   "sumber": "Cara Daftar Face Recognition KAI via Aplikasi Access, Boarding Cuma 5 Detik — Selular.ID, Des 2025 — https://selular.id/2025/12/cara-daftar-face-recognition-kai-via-aplikasi-access-boarding-cuma-5-detik/\nStasiun Solo Balapan Sudah Dilengkapi Fasilitas Pintu Pengenal Wajah — investortrust.id, 25 Nov 2023 — https://investortrust.id/business/8553/stasiun-solo-balapan-sudah-dilengkapi-fasilitas-pintu-pengenal-wajah\nCara Daftar Face Recognition KAI dan Daftar Stasiun untuk Boarding Scan Wajah — Kompas TV, (tanpa tanggal di hasil pencarian) — https://www.kompas.tv/info-publik/442440/cara-daftar-face-recognition-kai-dan-daftar-stasiun-untuk-boarding-scan-wajah",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Stasiun mana yang punya gate face recognition?",
   "jawaban": "Antara lain Bandung, Gambir, Cirebon, Semarang Tawang, Yogyakarta, Solo Balapan, Surabaya Gubeng, Surabaya Pasar Turi, dan Malang. Pada Desember 2025 tercatat 22 stasiun.",
   "topik": "check-in-boarding",
   "bagian": "Face Recognition Boarding Gate",
   "kata_kunci": "stasiun face recognition daftar",
   "sumber": "Stasiun Solo Balapan Sudah Dilengkapi Fasilitas Pintu Pengenal Wajah — investortrust.id, 25 Nov 2023 — https://investortrust.id/business/8553/stasiun-solo-balapan-sudah-dilengkapi-fasilitas-pintu-pengenal-wajah\nCara Daftar Face Recognition KAI via Aplikasi Access, Boarding Cuma 5 Detik — Selular.ID, Des 2025 — https://selular.id/2025/12/cara-daftar-face-recognition-kai-via-aplikasi-access-boarding-cuma-5-detik/",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Berapa tarif KRL Commuter Line?",
   "jawaban": "Rp3.000 untuk 25 km pertama, lalu tambah Rp1.000 setiap 10 km berikutnya (KM 354/2020).",
   "topik": "krl-commuter-line",
   "bagian": "Tarif",
   "kata_kunci": "harga krl ongkos",
   "sumber": "Rute KRL Jabodetabek Terbaru 2026 Beserta Harga Tiketnya — Fortune IDN, 2026 — https://www.fortuneidn.com/news/rute-krl-jabodetabek-00-z4fpb-jtrts9\nSubsidi NIK Tarif KRL Ditunda, Mulai Diterapkan 2025 — Kabar Bursa, 2024 — https://www.kabarbursa.com/makro/subsidi-nik-tarif-krl-ditunda-mulai-diterapkan-2025",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Berapa harga Kartu Multi Trip (KMT)?",
   "jawaban": "Rp30.000, sudah termasuk saldo Rp10.000.",
   "topik": "krl-commuter-line",
   "bagian": "Kartu Multi Trip (KMT)",
   "kata_kunci": "kartu kmt harga kartu multi trip",
   "sumber": "Cara Cek Saldo KRL (memuat harga KMT dan cara top up) — OCBC Indonesia, 28 Mei 2024 — https://www.ocbc.id/id/article/2024/05/28/cara-cek-saldo-krl\nRute KRL Jabodetabek Terbaru 2026 Beserta Harga Tiketnya — Fortune IDN, 2026 — https://www.fortuneidn.com/news/rute-krl-jabodetabek-00-z4fpb-jtrts9",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Bayar KRL pakai apa saja?",
   "jawaban": "KMT, uang elektronik bank (e-money, Flazz, Brizzi), dan QRIS lewat aplikasi mitra seperti GoPay. Tap in saat masuk, tap out saat keluar.",
   "topik": "krl-commuter-line",
   "bagian": "Cara membayar dan naik",
   "kata_kunci": "bayar krl qris tap",
   "sumber": "Rute KRL Jabodetabek Terbaru 2026 Beserta Harga Tiketnya — Fortune IDN, 2026 — https://www.fortuneidn.com/news/rute-krl-jabodetabek-00-z4fpb-jtrts9\nBayar KRL Bisa Pakai QRIS Loh, Begini Caranya! — OCBC Indonesia, 10 Jan 2025 — https://www.ocbc.id/id/article/2025/01/10/bayar-krl-pakai-qris",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Berapa tarif LRT Jabodebek?",
   "jawaban": "Rp5.000 untuk 1 km pertama, lalu Rp700 setiap km berikutnya (KM 67/2023). Pemberitaan 2025 menyebut maksimal Rp20.000 pada jam sibuk.",
   "topik": "lrt-jabodebek",
   "bagian": "Tarif",
   "kata_kunci": "harga lrt ongkos",
   "sumber": "Tarif LRT Jabodebek Mulai dari Rp5.000, Begini Detailnya (KM 67 Tahun 2023) — Bisnis.com, 18 Jul 2023 — https://ekonomi.bisnis.com/read/20230718/98/1676064/tarif-lrt-jabodebek-mulai-dari-rp5000-begini-detailnya\nStasiun LRT Jabodebek yang Terhubung dengan Whoosh, KRL, dan Kereta Bandara Soetta — Kompas TV, 2025 — https://www.kompas.tv/info-publik/616047/stasiun-lrt-jabodebek-yang-terhubung-dengan-whoosh-krl-dan-kereta-bandara-soetta",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Berapa harga tiket Whoosh?",
   "jawaban": "Bergantung relasi dan waktu (dynamic pricing). Premium Economy kisaran Rp175.000 sampai Rp350.000, Business Rp450.000, First Class Rp600.000, serta promo kadang mulai Rp200.000.",
   "topik": "whoosh",
   "bagian": "Kelas dan tarif",
   "kata_kunci": "tarif kereta cepat harga",
   "sumber": "Berapa Harga Tiket Kereta Cepat Whoosh? — Metro TV News, (tanpa tanggal di hasil pencarian) — https://www.metrotvnews.com/read/kELCz9Gy-berapa-harga-tiket-kereta-cepat-whoosh-ini%20rinciannya\nLibur Isra Miraj, Whoosh Obral Tiket Long Weekend Mulai Rp200.000 — Bisnis.com, 15 Jan 2026 — https://ekonomi.bisnis.com/read/20260115/98/1944419/libur-isra-miraj-whoosh-obral-tiket-long-weekend-mulai-rp200000\nHarga Tiket dan Jadwal Kereta Cepat Whoosh ke Stasiun Karawang, Sudah Bisa Dipesan — Kontan, 22 Des 2024 — https://industri.kontan.co.id/news/harga-tiket-dan-jadwal-kereta-cepat-whoosh-ke-stasiun-karawang-sudah-bisa-dipesan?page=all",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Beli tiket Whoosh di mana?",
   "jawaban": "Aplikasi Whoosh, ticket.kcic.co.id, Access by KAI, Livin' by Mandiri, BRImo, Wondr by BNI, tiket.com, Traveloka, Trip.com, serta loket dan vending machine di stasiun.",
   "topik": "whoosh",
   "bagian": "Cara membeli",
   "kata_kunci": "kereta cepat beli tiket",
   "sumber": "Marak Modus Penipuan Whoosh, KCIC Tegaskan Tiket Hanya Dijual Lewat Kanal Resmi — Kompas TV, 2026 — https://www.kompas.tv/ekonomi/652993/marak-modus-penipuan-whoosh-kcic-tegaskan-tiket-hanya-dijual-lewat-kanal-resmi",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Apa itu Frequent Whoosher Card?",
   "jawaban": "Kartu langganan Rp1.750.000 untuk 10 perjalanan Premium Economy, Rp175.000 per perjalanan. Tiketnya tidak bisa dibatalkan atau diubah jadwal.",
   "topik": "whoosh",
   "bagian": "Frequent Whoosher Card",
   "kata_kunci": "kartu langganan whoosh fwc",
   "sumber": "Pakai Kartu Frequent Whoosher, Naik Kereta Cepat Cuma Bayar Rp175.000 — Pasardana.id, 9 Jan 2025 — https://pasardana.id/news/2025/1/9/pakai-kartu-frequent-whoosher-naik-kereta-cepat-cuma-bayar-rp175000",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Apa nomor kontak resmi KAI?",
   "jawaban": "Contact Center 121 (24 jam), WhatsApp 0811-2223-3121, email cs@kai.id, dan chat di Access by KAI.",
   "topik": "kontak-kai",
   "bagian": "Kanal resmi",
   "kata_kunci": "nomor telepon wa call center hubungi",
   "sumber": "Call Center KAI: Layanan 24 Jam untuk Keluhan Barang Tertinggal — Metro TV News, Okt 2025 (data Jan–Okt 2025) — https://www.metrotvnews.com/read/NrWC8wpg-call-center-kai-layanan-24-jam-untuk-keluhan-barang-tertinggal",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Barang saya tertinggal di kereta, harus bagaimana?",
   "jawaban": "Lapor ke petugas stasiun atau Customer Service, atau hubungi 121 dengan ciri barang dan kode booking. Pengembalian tidak dipungut biaya.",
   "topik": "lost-and-found",
   "bagian": "Cara melapor",
   "kata_kunci": "ketinggalan hilang dompet hp",
   "sumber": "KAI Jember maksimalkan layanan Lost and Found saat angkutan Lebaran — ANTARA, Apr 2025 — https://www.antaranews.com/berita/4745885/kai-jember-maksimalkan-layanan-lost-and-found-saat-angkutan-lebaran\nKAI Amankan 957 Barang Tertinggal Senilai Rp1,1 Miliar — Metro TV News, Feb 2025 — https://www.metrotvnews.com/read/kBVC9y1w-kai-amankan-957-barang-tertinggal-senilai-rp1-1-miliar\nCara Temukan Barang Hilang di Stasiun atau di Kereta Api — Fortune IDN, (data 2022) — https://www.fortuneidn.com/news/cara-temukan-barang-hilang-di-stasiun-atau-di-atas-kereta-api-00-my5jv-mlrzrx",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Apakah kelas Bisnis masih ada di kereta api Jawa?",
   "jawaban": "Tidak lagi sebagai layanan reguler sejak 2025. KAI hanya mempertimbangkan mengoperasikannya kembali pada perjalanan fakultatif seperti libur besar.",
   "topik": "kelas-kereta",
   "bagian": "Kelas Bisnis",
   "kata_kunci": "kelas bisnis dihapus",
   "sumber": "KAI Umumkan Penghapusan Kereta Kelas Bisnis di Pulau Jawa, Apa Penggantinya? — Kontan, 17 Jul 2025 — https://industri.kontan.co.id/news/kai-umumkan-penghapusan-kereta-kelas-bisnis-di-pulau-jawa-apa-penggantinya",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Apa bedanya kelas Luxury dengan Eksekutif?",
   "jawaban": "Luxury (sleeper) adalah kelas paling mewah dengan kursi dan fasilitas lebih lega, mulai beroperasi 12 Juni 2018, sedangkan Eksekutif kelas utama jarak jauh di bawahnya.",
   "topik": "kelas-kereta",
   "bagian": "Kelas yang ada saat ini",
   "kata_kunci": "luxury sleeper priority",
   "sumber": "Kereta Api Punya 6 Kelas, Ini Beda Kelas Ekonomi sampai Sleeper — CNN Indonesia, 29 Agu 2022 — https://www.cnnindonesia.com/gaya-hidup/20220829123136-269-840294/kereta-api-punya-6-kelas-ini-beda-kelas-ekonomi-sampai-sleeper/2\nKAI Obral Diskon 25% Tiket Kereta Eksekutif hingga Luxury, Ini Daftarnya — Bisnis.com, 26 Des 2025 — https://ekonomi.bisnis.com/read/20251226/98/1939706/kai-obral-diskon-25-tiket-kereta-eksekutif-hingga-luxury-ini-daftarnya",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Kapan Hari Kereta Api Indonesia?",
   "jawaban": "28 September, memperingati perebutan Kantor Pusat Kereta Api Bandung dari Jepang pada 1945.",
   "topik": "sejarah-ka",
   "bagian": "Masa Jepang dan kemerdekaan",
   "kata_kunci": "hari ka tanggal",
   "sumber": "28 September Hari Kereta Api hingga Hari Pertambangan dan Energi Nasional — Kompas TV, 28 Sep 2025 — https://www.kompas.tv/info-publik/619996/28-september-hari-kereta-api-hingga-hari-pertambangan-dan-energi-nasional",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Kapan kereta api pertama dibangun di Indonesia?",
   "jawaban": "Pembangunan jalur Semarang–Tanggung oleh NISM dimulai dengan pencangkulan pertama pada 17 Juni 1864.",
   "topik": "sejarah-ka",
   "bagian": "Era kolonial",
   "kata_kunci": "kereta pertama 1864",
   "sumber": "28 September Hari Kereta Api hingga Hari Pertambangan dan Energi Nasional — Kompas TV, 28 Sep 2025 — https://www.kompas.tv/info-publik/619996/28-september-hari-kereta-api-hingga-hari-pertambangan-dan-energi-nasional\nSejarah Singkat PT Kereta Api Indonesia (Persero) — BAB II — Eprints Universitas Diponegoro, (skripsi/laporan) — https://eprints2.undip.ac.id/id/eprint/34100/3/BAB%20II.pdf",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Apa itu Daop dan Divre?",
   "jawaban": "Daop (Daerah Operasi) adalah wilayah kerja KAI di Jawa, Divre (Divisi Regional) wilayah kerja setara di Sumatera.",
   "topik": "organisasi-kai",
   "bagian": "Wilayah operasi di Jawa (Daop)",
   "kata_kunci": "daerah operasi divisi regional",
   "sumber": "Sejarah Singkat PT Kereta Api Indonesia (Persero) — BAB II — Eprints Universitas Diponegoro, (skripsi/laporan) — https://eprints2.undip.ac.id/id/eprint/34100/3/BAB%20II.pdf\nPengetahuan umum perkeretaapian (tanpa sumber tunggal) — mohon verifikasi ke kai.id atau peraturan terkait — K-Pedia, 19 Okt 2026",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Apa itu kode booking?",
   "jawaban": "Kode unik pemesanan tiket untuk melihat, mengubah, membatalkan, atau mencetak tiket. Jangan dibagikan ke orang lain.",
   "topik": "istilah-tiket",
   "bagian": "Kode booking",
   "kata_kunci": "arti kode booking",
   "sumber": "Versi sebelumnya dari spreadsheet K-Pedia (isi dipertahankan, belum diverifikasi ulang) — K-Pedia, 18 Okt 2026\n7 Tips Membeli Tiket KA di Masa Nataru — detikJabar, (Nataru 2023/2024) — https://www.detik.com/jabar/bisnis/d-7036010/7-tips-membeli-tiket-ka-di-masa-nataru",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Apa itu go-show?",
   "jawaban": "Pembelian tiket langsung di loket stasiun menjelang keberangkatan, mulai 3 jam sebelum jadwal.",
   "topik": "istilah-tiket",
   "bagian": "Go-show",
   "kata_kunci": "arti go show",
   "sumber": "KAI Perpanjang Batas Waktu Pemesanan Tiket Melalui Channel Mitra Penjualan — Kontan, 21 Des 2023 — https://industri.kontan.co.id/news/kai-perpanjang-batas-waktu-pemesanan-tiket-melalui-channel-mitra-penjualan",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Apa itu kereta petani dan pedagang?",
   "jawaban": "Gerbong khusus pada KA Lokal Commuter Line Merak sejak 1 Desember 2025, tiket Rp3.000 untuk orang dan bawaan, maksimal 2 koli.",
   "topik": "krl-commuter-line",
   "bagian": "Kereta petani dan pedagang",
   "kata_kunci": "kereta petani merak",
   "sumber": "Deretan Barang yang Dilarang Dibawa di Kereta Khusus Petani-Pedagang — detikFinance, 30 Nov 2025 — https://finance.detik.com/infrastruktur/d-8236173/deretan-barang-yang-dilarang-dibawa-di-kereta-khusus-petani-pedagang",
   "aktif": "Ya"
  },
  {
   "pertanyaan": "Apakah boleh membagikan kode booking ke orang lain?",
   "jawaban": "Tidak disarankan. KAI mengimbau pelanggan tidak membagikan kode booking atau bukti pembelian tiket.",
   "topik": "waspada-penipuan",
   "bagian": "Kebiasaan aman",
   "kata_kunci": "share kode booking aman",
   "sumber": "7 Tips Membeli Tiket KA di Masa Nataru — detikJabar, (Nataru 2023/2024) — https://www.detik.com/jabar/bisnis/d-7036010/7-tips-membeli-tiket-ka-di-masa-nataru",
   "aktif": "Ya"
  }
 ]
};
