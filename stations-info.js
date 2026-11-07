/* =========================================================
   K-PEDIA — INFORMASI STASIUN (Peta & Nama Stasiun)
   Sumber awal: data railmap yang kamu kirim (27 stasiun), sudah dirapikan.
   Cara menambah / mengubah stasiun: lihat README.md bagian "Mengisi informasi stasiun".

   Kolom:
   id        kode unik huruf kecil (juga nama file foto: assets/stations/<kode>.jpg)
   nama      nama stasiun, SAMA dengan NAMA_STASIUN di Google Sheets bila ada
   alias     nama lain untuk mencocokkan dengan Google Sheets dan pencarian
   kategori  antarkota | commuter | bandara | whoosh | heritage
   status    active | inactive
   koordinat [lintang, bujur] untuk pin di peta (kosongkan [] bila belum ada)
   ulasan / deskripsi / sejarah / fasilitas / denah  boleh dikosongkan; bagian kosong disembunyikan
========================================================= */
"use strict";
window.KP_STATIONS = [
 {
  "id": "hlm",
  "kode": "HLM",
  "nama": "Halim",
  "alias": [
   "Halim",
   "Halim Perdanakusuma",
   "Halim Whoosh"
  ],
  "subjudul": "Whoosh Central",
  "kategori": "whoosh",
  "status": "active",
  "region": "KCIC (Whoosh)",
  "provinsi": "DKI Jakarta",
  "kota": "Jakarta Timur",
  "elevasi": "28",
  "periode": "2023 - Sekarang",
  "koordinat": [
   -6.2464,
   106.8833
  ],
  "foto": "assets/stations/hlm.jpg",
  "ulasan": "Stasiun pusat pemberangkatan Kereta Cepat Jakarta-Bandung (Whoosh). Kecepatan operasional mencapai 350 km/jam. Terintegrasi langsung dengan LRT Jabodebek Stasiun Halim.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Lounge VIP Whoosh",
   "Skybridge LRT Jabodebek",
   "Boarding Gate Otomatis",
   "Pusat F&B Modern",
   "Parkir Inap Luas"
  ],
  "denah": "Lantai 2 untuk lobi komersial & tiket. Lantai 3 untuk peron keberangkatan Whoosh.",
  "maps": "Stasiun Kereta Cepat Halim"
 },
 {
  "id": "pdl-kc",
  "kode": "PDL",
  "nama": "Padalarang",
  "alias": [
   "Padalarang"
  ],
  "subjudul": "Whoosh Hub",
  "kategori": "whoosh",
  "status": "active",
  "region": "Daop 2 Bandung",
  "provinsi": "Jawa Barat",
  "kota": "Bandung Barat",
  "elevasi": "695",
  "periode": "2023 - Sekarang",
  "koordinat": [
   -6.8415,
   107.4975
  ],
  "foto": "assets/stations/pdl.jpg",
  "ulasan": "Stasiun integrasi utama Whoosh dengan KA Feeder menuju Stasiun Bandung Kota (durasi 18 menit). Memungkinkan penumpang transit cepat tanpa terjebak macet.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Peron Khusus KA Feeder",
   "Eskalator & Lift Difabel",
   "Ruang CS Whoosh",
   "Kantin & Minimarket"
  ],
  "denah": "Peron Whoosh berada di gedung baru yang terhubung jembatan layang ke peron KA Feeder KAI.",
  "maps": "Stasiun Kereta Cepat Padalarang"
 },
 {
  "id": "tgl",
  "kode": "TGL",
  "nama": "Tegalluar",
  "alias": [
   "Tegalluar",
   "Tegalluar Summarecon"
  ],
  "subjudul": "",
  "kategori": "whoosh",
  "status": "active",
  "region": "KCIC (Whoosh)",
  "provinsi": "Jawa Barat",
  "kota": "Kabupaten Bandung",
  "elevasi": "670",
  "periode": "2023 - Sekarang",
  "koordinat": [
   -6.9744,
   107.7212
  ],
  "foto": "assets/stations/tgl.jpg",
  "ulasan": "Stasiun terminus ujung timur Whoosh, terletak di dekat Stadion GBLA dan Masjid Raya Al-Jabbar. Terkoneksi shuttle bus menuju pusat kota Bandung dan Summarecon.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Lobi Mewah Ber-AC",
   "Drop-Off Shuttle Bus",
   "Layanan Penumpang CS",
   "Musholla Luas"
  ],
  "denah": "Gedung modern dengan akses peron langsung di lantai dasar dan fasilitas drop-off mobil di sayap timur.",
  "maps": "Stasiun Tegalluar"
 },
 {
  "id": "yia",
  "kode": "YIA",
  "nama": "Bandara YIA",
  "alias": [
   "Bandara YIA",
   "Bandara Internasional Yogyakarta",
   "YIA"
  ],
  "subjudul": "",
  "kategori": "bandara",
  "status": "active",
  "region": "Daop 6 Yogyakarta",
  "provinsi": "DI Yogyakarta",
  "kota": "Kulon Progo",
  "elevasi": "8",
  "periode": "2021 - Sekarang",
  "koordinat": [
   -7.9077,
   110.0575
  ],
  "foto": "assets/stations/yia.jpg",
  "ulasan": "Stasiun terminus KA Bandara YIA yang menghubungkan Bandara Kulon Progo ke pusat Kota Yogyakarta (Stasiun Tugu) dalam waktu 39 menit (reguler) atau 35 menit (ekspres).",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Koneksi Langsung Terminal Bandara",
   "E-Gate Scanner",
   "Ruang Tunggu Check-In",
   "AC Sentral"
  ],
  "denah": "Terhubung garbarata penyeberangan ber-AC langsung menuju lobi keberangkatan pesawat YIA.",
  "maps": "Stasiun KA Bandara YIA"
 },
 {
  "id": "kno",
  "kode": "KNO",
  "nama": "Bandara Kualanamu",
  "alias": [
   "Bandara Kualanamu",
   "Kualanamu"
  ],
  "subjudul": "",
  "kategori": "bandara",
  "status": "active",
  "region": "Divre I Sumatera Utara",
  "provinsi": "Sumatera Utara",
  "kota": "Deli Serdang",
  "elevasi": "8",
  "periode": "2013 - Sekarang",
  "koordinat": [
   3.6422,
   98.8853
  ],
  "foto": "assets/stations/kno.jpg",
  "ulasan": "Layanan kereta bandara pertama di Indonesia yang dioperasikan oleh KAI Bandara (Railink), menghubungkan Stasiun Medan ke Bandara Internasional Kualanamu.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "City Check-In Maskapai",
   "Lounge Eksekutif",
   "Koneksi Terminal Kedatangan",
   "CS Fast Response"
  ],
  "denah": "Terletak tepat di depan gedung terminal utama Bandara Kualanamu.",
  "maps": "Stasiun Kereta Bandara Kualanamu"
 },
 {
  "id": "cmi",
  "kode": "CMI",
  "nama": "Cimahi",
  "alias": [
   "Cimahi"
  ],
  "subjudul": "Transit Feeder",
  "kategori": "bandara",
  "status": "active",
  "region": "Daop 2 Bandung",
  "provinsi": "Jawa Barat",
  "kota": "Cimahi",
  "elevasi": "723",
  "periode": "1884 - Sekarang",
  "koordinat": [
   -6.8847,
   107.5414
  ],
  "foto": "assets/stations/cmi.jpg",
  "ulasan": "Stasiun persinggahan penting KA Feeder Whoosh antara Padalarang - Bandung, serta melayani KA Antarkota dan Commuter Line Bandung Raya.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Peron Feeder Whoosh",
   "Underpass Penyeberangan",
   "Ruang Tunggu",
   "Parkir Stasiun"
  ],
  "denah": "Peron 1 dan 2 melayani KA Feeder Whoosh dan KA Antarkota dengan jalur ganda elektrik.",
  "maps": "Stasiun Cimahi"
 },
 {
  "id": "mri",
  "kode": "MRI",
  "nama": "Manggarai",
  "alias": [
   "Manggarai"
  ],
  "subjudul": "Sentral Commuter",
  "kategori": "commuter",
  "status": "active",
  "region": "Daop 1 Jakarta",
  "provinsi": "DKI Jakarta",
  "kota": "Jakarta Selatan",
  "elevasi": "13",
  "periode": "1918 - Sekarang",
  "koordinat": [
   -6.2099,
   106.8502
  ],
  "foto": "assets/stations/mri.jpg",
  "ulasan": "Stasiun sentral transit tersibuk di Jabodetabek. Menghubungkan jalur Bogor Line, Cikarang Loop Line, dan KA Bandara Soekarno-Hatta dengan peron bertingkat.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Concourse Megah Lantai 2",
   "Lift Difabel & Eskalator",
   "Pos Medis CS 24 Jam",
   "ATM & Minimarket"
  ],
  "denah": "Lantai 1 untuk Bogor Line & Bandara. Lantai 2 concourse utama. Lantai 3 untuk Cikarang/Bekasi Line.",
  "maps": "Stasiun Manggarai"
 },
 {
  "id": "boo",
  "kode": "BOO",
  "nama": "Bogor",
  "alias": [
   "Bogor"
  ],
  "subjudul": "",
  "kategori": "commuter",
  "status": "active",
  "region": "Daop 1 Jakarta",
  "provinsi": "Jawa Barat",
  "kota": "Bogor",
  "elevasi": "246",
  "periode": "1881 - Sekarang",
  "koordinat": [
   -6.5956,
   106.7903
  ],
  "foto": "assets/stations/boo.jpg",
  "ulasan": "Stasiun terminus utama jalur KRL Commuter Line Bogor - Jakarta Kota. Melayani ratusan ribu komuter harian dan terintegrasi dengan Alun-alun Kota Bogor.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Akses Langsung Alun-alun Bogor",
   "Underpass Penyeberangan",
   "Layanan Penumpang CS",
   "Parkir Inap Sepeda Motor"
  ],
  "denah": "Pintu Timur menghadap Jl. Kapten Muslihat; Pintu Barat terhubung ke Jembatan Merah.",
  "maps": "Stasiun Bogor"
 },
 {
  "id": "thb",
  "kode": "THB",
  "nama": "Tanah Abang",
  "alias": [
   "Tanah Abang"
  ],
  "subjudul": "",
  "kategori": "commuter",
  "status": "active",
  "region": "Daop 1 Jakarta",
  "provinsi": "DKI Jakarta",
  "kota": "Jakarta Pusat",
  "elevasi": "9",
  "periode": "1899 - Sekarang",
  "koordinat": [
   -6.1856,
   106.8111
  ],
  "foto": "assets/stations/thb.jpg",
  "ulasan": "Stasiun transit komuter tersibuk menuju Rangkasbitung Line (Banten) dan Cikarang Line, serta sentral logistik tekstil Pasar Tanah Abang.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Jembatan Penyeberangan Multiguna (JPM)",
   "Pusat Informasi CS",
   "Loket Tiket KRL",
   "Musala"
  ],
  "denah": "Lantai atas terhubung jembatan layang langsung ke Pusat Grosir Blok G Pasar Tanah Abang.",
  "maps": "Stasiun Tanah Abang"
 },
 {
  "id": "gmr",
  "kode": "GMR",
  "nama": "Gambir",
  "alias": [
   "Gambir"
  ],
  "subjudul": "",
  "kategori": "antarkota",
  "status": "active",
  "region": "Daop 1 Jakarta",
  "provinsi": "DKI Jakarta",
  "kota": "Jakarta Pusat",
  "elevasi": "16",
  "periode": "1884 - Sekarang",
  "koordinat": [
   -6.1767,
   106.8306
  ],
  "foto": "assets/stations/gmr.jpg",
  "ulasan": "Pusat KA Antarkota kelas Eksekutif, Panoramic, dan Luxury. Catatan CS: Stasiun Gambir TIDAK melayani KRL Commuter Line reguler. Transit KRL terdekat via Stasiun Gondangdia / Juanda.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Lounge VIP & Luxury",
   "Rail Transit Hotel",
   "Face Recognition Gate",
   "Ruang Laktasi & Kursi Roda"
  ],
  "denah": "Pintu Selatan untuk drop-off & boarding; Pintu Utara untuk penjemputan. Peron ada di Lantai 3.",
  "maps": "Stasiun Gambir Jakarta"
 },
 {
  "id": "pse",
  "kode": "PSE",
  "nama": "Pasar Senen",
  "alias": [
   "Pasar Senen",
   "Pasarsenen"
  ],
  "subjudul": "",
  "kategori": "antarkota",
  "status": "active",
  "region": "Daop 1 Jakarta",
  "provinsi": "DKI Jakarta",
  "kota": "Jakarta Pusat",
  "elevasi": "4.7",
  "periode": "1886 - Sekarang",
  "koordinat": [
   -6.1748,
   106.8447
  ],
  "foto": "assets/stations/pse.jpg",
  "ulasan": "Terminus utama KA Jarak Jauh kelas Campuran & Ekonomi di Jakarta. Terkoneksi underpass langsung dengan KRL Commuter Line dan Halte Bus TransJakarta.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Underpass Ramah Difabel",
   "Ruang Tunggu Ber-AC Luas",
   "Layanan CS Counter",
   "Food Court 24 Jam"
  ],
  "denah": "Lobi Barat untuk KA Antarkota; sayap samping untuk gerbang tapping elektronik KRL.",
  "maps": "Stasiun Pasar Senen"
 },
 {
  "id": "bd",
  "kode": "BD",
  "nama": "Bandung",
  "alias": [
   "Bandung"
  ],
  "subjudul": "",
  "kategori": "antarkota",
  "status": "active",
  "region": "Daop 2 Bandung",
  "provinsi": "Jawa Barat",
  "kota": "Bandung",
  "elevasi": "709",
  "periode": "1884 - Sekarang",
  "koordinat": [
   -6.9125,
   107.6025
  ],
  "foto": "assets/stations/bd.jpg",
  "ulasan": "Stasiun induk Priangan terhubung langsung dengan KA Feeder Whoosh dan Commuter Line Bandung Raya.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Skybridge Modern",
   "Integrasi KA Feeder Whoosh",
   "Coworking Space",
   "Lounge Eksekutif"
  ],
  "denah": "Pintu Utara (Jl. Kebon Kawung) untuk Antarkota & Feeder; Pintu Selatan untuk KA Lokal.",
  "maps": "Stasiun Bandung"
 },
 {
  "id": "cn",
  "kode": "CN",
  "nama": "Cirebon",
  "alias": [
   "Cirebon",
   "Cirebon Kejaksan",
   "Kejaksan"
  ],
  "subjudul": "",
  "kategori": "antarkota",
  "status": "active",
  "region": "Daop 3 Cirebon",
  "provinsi": "Jawa Barat",
  "kota": "Cirebon",
  "elevasi": "4",
  "periode": "1912 - Sekarang",
  "koordinat": [
   -6.7053,
   108.5556
  ],
  "foto": "assets/stations/cn.jpg",
  "ulasan": "Stasiun persimpangan utama Lintas Pantura (arah Surabaya) dan Lintas Prupuk (arah Kroya/Yogyakarta).",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Ruang Tunggu VIP",
   "Layanan CS Fast Response",
   "Oleh-oleh Cirebon",
   "Toilet Ramah Lansia"
  ],
  "denah": "Peron sejajar dengan ruang tunggu lobi tiket tanpa jembatan penyeberangan curam.",
  "maps": "Stasiun Cirebon"
 },
 {
  "id": "smt",
  "kode": "SMT",
  "nama": "Semarang Tawang",
  "alias": [
   "Semarang Tawang",
   "Tawang"
  ],
  "subjudul": "",
  "kategori": "antarkota",
  "status": "active",
  "region": "Daop 4 Semarang",
  "provinsi": "Jawa Tengah",
  "kota": "Semarang",
  "elevasi": "2",
  "periode": "1868 - Sekarang",
  "koordinat": [
   -6.9644,
   110.4281
  ],
  "foto": "assets/stations/smt.jpg",
  "ulasan": "Stasiun cagar budaya tertua dan terbesar di Lintas Utara Jawa. Melayani KA kelas Eksekutif dan Luxury dengan polder penahan rob modern.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Monumen Water Wall",
   "Lounge Eksekutif VIP",
   "Piano Tunggu",
   "Face Recognition Gate"
  ],
  "denah": "Pintu utama menghadap danau buatan polder Kota Lama Semarang.",
  "maps": "Stasiun Semarang Tawang"
 },
 {
  "id": "smc",
  "kode": "SMC",
  "nama": "Semarang Poncol",
  "alias": [
   "Semarang Poncol",
   "Poncol"
  ],
  "subjudul": "",
  "kategori": "antarkota",
  "status": "active",
  "region": "Daop 4 Semarang",
  "provinsi": "Jawa Tengah",
  "kota": "Semarang",
  "elevasi": "3",
  "periode": "1914 - Sekarang",
  "koordinat": [
   -6.9727,
   110.415
  ],
  "foto": "assets/stations/smc.jpg",
  "ulasan": "Pusat KA Ekonomi Lintas Pantura (Airlangga, Tawang Jaya), KA Aglomerasi (Kaligung, Ambarawa Ekspres), dan KA Komuter Kedung Sepur.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Peron Tinggi Berkanopi",
   "Mesin Cetak Tiket",
   "CS Counter On Duty",
   "Pujasera Stasiun"
  ],
  "denah": "Pintu masuk utama berada di Jl. Imam Bonjol dengan lobi steril sebelum masuk peron 1-3.",
  "maps": "Stasiun Semarang Poncol"
 },
 {
  "id": "pwt",
  "kode": "PWT",
  "nama": "Purwokerto",
  "alias": [
   "Purwokerto"
  ],
  "subjudul": "",
  "kategori": "antarkota",
  "status": "active",
  "region": "Daop 5 Purwokerto",
  "provinsi": "Jawa Tengah",
  "kota": "Banyumas",
  "elevasi": "75",
  "periode": "1916 - Sekarang",
  "koordinat": [
   -7.4194,
   109.2217
  ],
  "foto": "assets/stations/pwt.jpg",
  "ulasan": "Stasiun induk Daop 5 di kaki Gunung Slamet. Dilengkapi Skybridge kaca modern penghubung lobi barat dan timur.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Skybridge Modern",
   "Executive Lounge",
   "Playground Anak",
   "Face Recognition Gate"
  ],
  "denah": "Lobi Timur (Jl. Kober) untuk boarding utama; Lobi Barat untuk akses penjemputan sekunder.",
  "maps": "Stasiun Purwokerto"
 },
 {
  "id": "yk",
  "kode": "YK",
  "nama": "Yogyakarta",
  "alias": [
   "Yogyakarta",
   "Tugu",
   "Yogyakarta Tugu"
  ],
  "subjudul": "",
  "kategori": "antarkota",
  "status": "active",
  "region": "Daop 6 Yogyakarta",
  "provinsi": "DI Yogyakarta",
  "kota": "Yogyakarta",
  "elevasi": "113",
  "periode": "1887 - Sekarang",
  "koordinat": [
   -7.7891,
   110.3635
  ],
  "foto": "assets/stations/yk.jpg",
  "ulasan": "Stasiun bersejarah jantung Malioboro. Melayani KA Antarkota, KA Bandara YIA Kulon Progo, dan KRL Commuter Line Yogya-Solo.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Akses Langsung Malioboro",
   "Peron Bandara YIA",
   "Lounge Anggrek VIP",
   "Shower & Locker"
  ],
  "denah": "Pintu Timur khusus KRL & drop-off Malioboro; Pintu Barat untuk KA Antarkota & KA Bandara.",
  "maps": "Stasiun Tugu Yogyakarta"
 },
 {
  "id": "sgu",
  "kode": "SGU",
  "nama": "Surabaya Gubeng",
  "alias": [
   "Surabaya Gubeng",
   "Gubeng"
  ],
  "subjudul": "",
  "kategori": "antarkota",
  "status": "active",
  "region": "Daop 8 Surabaya",
  "provinsi": "Jawa Timur",
  "kota": "Surabaya",
  "elevasi": "5",
  "periode": "1878 - Sekarang",
  "koordinat": [
   -7.2654,
   112.7521
  ],
  "foto": "assets/stations/sgu.jpg",
  "ulasan": "Stasiun terbesar di Jawa Timur dan gerbang Lintas Selatan. Dibagi dua sisi: Sisi Timur (Gubeng Baru) dan Sisi Barat (Gubeng Lama).",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Face Recognition Gate",
   "Executive Lounge",
   "Food Court Lengkap",
   "Koneksi Bus Trans Semanggi"
  ],
  "denah": "Sisi Timur untuk KA Eksekutif Antarkota; Sisi Barat untuk KA Ekonomi dan Kereta Lokal.",
  "maps": "Stasiun Surabaya Gubeng"
 },
 {
  "id": "mdn",
  "kode": "MDN",
  "nama": "Medan",
  "alias": [
   "Medan"
  ],
  "subjudul": "",
  "kategori": "antarkota",
  "status": "active",
  "region": "Divre I Sumatera Utara",
  "provinsi": "Sumatera Utara",
  "kota": "Medan",
  "elevasi": "22",
  "periode": "1886 - Sekarang",
  "koordinat": [
   3.5907,
   98.6784
  ],
  "foto": "assets/stations/mdn.jpg",
  "ulasan": "Stasiun modern tersibuk di Sumatera dengan jalur layang (elevated track) bebas macet dan integrasi KA Bandara Kualanamu.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "City Check-In Maskapai",
   "Elevated Platform",
   "Eskalator & Lift Difabel",
   "Terhubung Lapangan Merdeka"
  ],
  "denah": "Lantai 1 untuk loket dan KA Antarkota; Lantai 2 untuk peron KA Bandara Railink.",
  "maps": "Stasiun Kereta Medan"
 },
 {
  "id": "kpt",
  "kode": "KPT",
  "nama": "Kertapati",
  "alias": [
   "Kertapati"
  ],
  "subjudul": "",
  "kategori": "antarkota",
  "status": "active",
  "region": "Divre III Palembang",
  "provinsi": "Sumatera Selatan",
  "kota": "Palembang",
  "elevasi": "2",
  "periode": "1914 - Sekarang",
  "koordinat": [
   -3.0163,
   104.7573
  ],
  "foto": "assets/stations/kpt.jpg",
  "ulasan": "Stasiun terminus penumpang di Palembang tepi Sungai Ogan & Musi, melayani KA Sindang Marga dan KA Bukit Serelo.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Ruang Tunggu Antarkota",
   "Layanan Porter",
   "Musala & Toilet",
   "Check-in Mandiri KAI"
  ],
  "denah": "Pintu masuk dari Jl. Ki Merogan langsung menghadap ke peron keberangkatan penumpang.",
  "maps": "Stasiun Kertapati Palembang"
 },
 {
  "id": "tnk",
  "kode": "TNK",
  "nama": "Tanjung Karang",
  "alias": [
   "Tanjung Karang",
   "Tanjungkarang"
  ],
  "subjudul": "",
  "kategori": "antarkota",
  "status": "active",
  "region": "Divre IV Tanjungkarang",
  "provinsi": "Lampung",
  "kota": "Bandar Lampung",
  "elevasi": "96",
  "periode": "1914 - Sekarang",
  "koordinat": [
   -5.4057,
   105.2581
  ],
  "foto": "assets/stations/tnk.jpg",
  "ulasan": "Stasiun sentral utama di Lampung, menghubungkan pintu gerbang selatan Sumatera dengan Palembang via KA Rajabasa dan Kuala Stabas.",
  "deskripsi": "",
  "sejarah": "",
  "fasilitas": [
   "Ruang Tunggu Ber-AC",
   "Pos Medis CS",
   "ATM Center",
   "Pelataran Drop-Off"
  ],
  "denah": "Gedung penumpang di sisi timur rel kereta api dengan arus penjemputan teratur.",
  "maps": "Stasiun Tanjung Karang Lampung"
 },
 {
  "id": "abr",
  "kode": "ABR",
  "nama": "Ambarawa",
  "alias": [
   "Ambarawa"
  ],
  "subjudul": "Eks Willem I",
  "kategori": "heritage",
  "status": "inactive",
  "region": "Daop 4 Semarang",
  "provinsi": "Jawa Tengah",
  "kota": "Kabupaten Semarang",
  "elevasi": "474",
  "periode": "1873 - 1976 (Nonaktif Reguler)",
  "koordinat": [
   -7.265,
   110.4042
  ],
  "foto": "assets/stations/abr.jpg",
  "ulasan": "Tidak lagi melayani perjalanan reguler. Kunjungan umumnya sebagai wisata sejarah, jadi cek informasi resmi sebelum berkunjung.",
  "deskripsi": "",
  "sejarah": "Museum Kereta Api Indonesia. Dibangun Nederlandsch-Indische Spoorweg Maatschappij (NIS) untuk keperluan militer benteng Willem I. Menyimpan koleksi lokomotif uap legendaris dan melayani kereta wisata rel bergigi.",
  "fasilitas": [
   "Museum Lokomotif Uap Kuno",
   "Kereta Wisata Ambarawa-Tuntang",
   "Depo Pemeliharaan Bersejarah",
   "Diorama Kereta Api"
  ],
  "denah": "Emplasemen stasiun kini menjadi cagar budaya terbuka tempat dipamerkannya puluhan lokomotif uap bersejarah.",
  "maps": "Museum Kereta Api Ambarawa"
 },
 {
  "id": "bdn",
  "kode": "BDN",
  "nama": "Bedono",
  "alias": [
   "Bedono"
  ],
  "subjudul": "Jalur Gigi Pegunungan",
  "kategori": "heritage",
  "status": "inactive",
  "region": "Daop 4 Semarang",
  "provinsi": "Jawa Tengah",
  "kota": "Kabupaten Semarang",
  "elevasi": "711",
  "periode": "1905 - 1976 (Reguler)",
  "koordinat": [
   -7.3197,
   110.3475
  ],
  "foto": "assets/stations/bdn.jpg",
  "ulasan": "Tidak lagi melayani perjalanan reguler. Kunjungan umumnya sebagai wisata sejarah, jadi cek informasi resmi sebelum berkunjung.",
  "deskripsi": "",
  "sejarah": "Stasiun di lintasan rel bergigi terjal pegunungan Ambarawa - Secang - Magelang. Rel gerigi di tengah jalur memungkinkan lokomotif uap khusus (B25) mendaki lereng Gunung Ungaran dengan kemiringan ekstrem 65 permil.",
  "fasilitas": [
   "Sistem Rel Bergigi Asli",
   "Kran Pengisian Air Lokomotif Uap",
   "Panorama Pegunungan Kuno",
   "Tanda Semboyan Mekanik Lama"
  ],
  "denah": "Stasiun kecil di lereng bukit dengan satu jalur rel bergigi khusus yang masih dipertahankan untuk perjalanan wisata heritage.",
  "maps": "Stasiun Bedono"
 },
 {
  "id": "ckg",
  "kode": "CKG",
  "nama": "Cikajang",
  "alias": [
   "Cikajang"
  ],
  "subjudul": "Eks Stasiun Tertinggi RI",
  "kategori": "heritage",
  "status": "inactive",
  "region": "Daop 2 Bandung",
  "provinsi": "Jawa Barat",
  "kota": "Garut",
  "elevasi": "1.246",
  "periode": "1930 - 1982 (Nonaktif)",
  "koordinat": [
   -7.3758,
   107.7889
  ],
  "foto": "assets/stations/ckg.jpg",
  "ulasan": "Tidak lagi melayani perjalanan reguler. Kunjungan umumnya sebagai wisata sejarah, jadi cek informasi resmi sebelum berkunjung.",
  "deskripsi": "",
  "sejarah": "Pernah menjadi stasiun kereta api tertinggi di Indonesia dan Asia Tenggara pada masa Staatsspoorwegen (SS) dengan elevasi +1.246 meter di atas permukaan laut. Dahulu melayani angkutan teh dan kina dari perkebunan Garut Selatan.",
  "fasilitas": [
   "Pondasi Bekas Bangunan Kolonial",
   "Jalur Rute Wisata Alam Priangan",
   "Bekas Rumah Dinas PJKA",
   "Monumen Sejarah"
  ],
  "denah": "Terletak di dataran tinggi perkebunan Cikajang. Jalur rel dari Garut - Cikajang ditutup pada tahun 1982 karena kalah bersaing dengan moda darat.",
  "maps": "Bekas Stasiun Cikajang"
 },
 {
  "id": "pnd",
  "kode": "PND",
  "nama": "Pangandaran",
  "alias": [
   "Pangandaran"
  ],
  "subjudul": "Lintas Banjar-Cijulang",
  "kategori": "heritage",
  "status": "inactive",
  "region": "Daop 2 Bandung",
  "provinsi": "Jawa Barat",
  "kota": "Pangandaran",
  "elevasi": "6",
  "periode": "1921 - 1984 (Nonaktif)",
  "koordinat": [
   -7.6933,
   108.6508
  ],
  "foto": "assets/stations/pnd.jpg",
  "ulasan": "Tidak lagi melayani perjalanan reguler. Kunjungan umumnya sebagai wisata sejarah, jadi cek informasi resmi sebelum berkunjung.",
  "deskripsi": "",
  "sejarah": "Stasiun pantai di jalur legendaris Banjar - Pangandaran - Cijulang (82 km) yang melintasi mahakarya teknik sipil kolonial: Terowongan Wilhelmina (1.116 m) dan Jembatan Cikacepit yang megah menembus tebing Samudera Hindia.",
  "fasilitas": [
   "Bekas Emplasemen Tepi Pantai",
   "Reruntuhan Gudang Garam",
   "Akses Wisata Terowongan Kereta Api"
  ],
  "denah": "Sisa emplasemen kini berdekatan dengan kawasan wisata pantai Pangandaran.",
  "maps": "Eks Stasiun Pangandaran"
 },
 {
  "id": "ks",
  "kode": "KS",
  "nama": "Kudus",
  "alias": [
   "Kudus"
  ],
  "subjudul": "Eks Jalur Trem Uap SJS",
  "kategori": "heritage",
  "status": "inactive",
  "region": "Daop 4 Semarang",
  "provinsi": "Jawa Tengah",
  "kota": "Kudus",
  "elevasi": "16",
  "periode": "1884 - 1986 (Nonaktif)",
  "koordinat": [
   -6.8122,
   110.8406
  ],
  "foto": "assets/stations/ks.jpg",
  "ulasan": "Tidak lagi melayani perjalanan reguler. Kunjungan umumnya sebagai wisata sejarah, jadi cek informasi resmi sebelum berkunjung.",
  "deskripsi": "",
  "sejarah": "Pusat persimpangan trem uap Samarang-Joana Stoomtram Maatschappij (SJS) yang menghubungkan Semarang, Demak, Kudus, Pati, hingga Rembang dan Blora. Dahulu menjadi urat nadi pengangkutan komoditas gula dan rokok kretek.",
  "fasilitas": [
   "Bangunan Cagar Budaya",
   "Eks Emplasemen Percabangan Trem",
   "Pasar Tradisional Stasiun"
  ],
  "denah": "Gedung stasiun kolonial kini dialihfungsikan menjadi sentra niaga masyarakat namun fasad arsitektur atapnya masih utuh.",
  "maps": "Eks Stasiun Kudus"
 },
 {
  "id": "bkt",
  "kode": "BKT",
  "nama": "Bukittinggi",
  "alias": [
   "Bukittinggi"
  ],
  "subjudul": "Eks Lintas Lembah Anai",
  "kategori": "heritage",
  "status": "inactive",
  "region": "Divre II Sumatera Barat",
  "provinsi": "Sumatera Barat",
  "kota": "Bukittinggi",
  "elevasi": "920",
  "periode": "1891 - 1980-an (Nonaktif)",
  "koordinat": [
   -0.3089,
   100.3703
  ],
  "foto": "assets/stations/bkt.jpg",
  "ulasan": "Tidak lagi melayani perjalanan reguler. Kunjungan umumnya sebagai wisata sejarah, jadi cek informasi resmi sebelum berkunjung.",
  "deskripsi": "",
  "sejarah": "Stasiun ujung di dataran tinggi Minangkabau. Dahulu terhubung dengan jalur rel bergigi legendaris Lembah Anai dari Padang Panjang menuju Bukittinggi dan Payakumbuh untuk pengangkutan batu bara dan hasil bumi.",
  "fasilitas": [
   "Monumen Lokomotif Gigi E10",
   "Gedung Cagar Budaya Kolonial",
   "Taman Kota Bukittinggi"
  ],
  "denah": "Berada di pusat kota Bukittinggi; sisa jalurnya kini menjadi memorial perkeretaapian Sumatera Barat.",
  "maps": "Eks Stasiun Kereta Bukittinggi"
 }
];
