/* KAIPEDIA extension: information hub, map directory, encyclopedia, and rotating editorial ads. */
(() => {
"use strict";
const $ = (s, r=document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const glossary = [
["Access by KAI","Aplikasi resmi untuk mencari jadwal, memesan tiket, dan mengelola perjalanan kereta api." ,"Tiket","Pemesanan"],
["Antarkota","Layanan kereta api yang menghubungkan kota atau wilayah berbeda, umumnya dengan pemesanan tempat duduk." ,"Layanan","KA"],
["Boarding","Proses pemeriksaan tiket dan identitas sebelum penumpang memasuki area keberangkatan atau naik kereta." ,"Operasional","Stasiun"],
["Daop","Daerah Operasi, unit wilayah operasional perkeretaapian di Pulau Jawa." ,"Organisasi","Wilayah"],
["Divre","Divisi Regional, unit wilayah operasional KAI yang digunakan terutama di Sumatra." ,"Organisasi","Wilayah"],
["GAPEKA","Grafik Perjalanan Kereta Api, pedoman pengaturan perjalanan kereta dalam periode tertentu." ,"Operasional","Jadwal"],
["KRL","Kereta Rel Listrik, layanan komuter yang menggunakan tenaga listrik dari sistem elektrifikasi." ,"Layanan","Komuter"],
["KLB","Kereta Luar Biasa, perjalanan kereta yang dijalankan di luar perjalanan reguler sesuai kebutuhan operasional." ,"Operasional","Perjalanan"],
["Lokomotif","Kendaraan rel bermesin yang digunakan untuk menarik atau mendorong rangkaian kereta." ,"Sarana","Rangkaian"],
["Manifest","Daftar data perjalanan atau penumpang yang digunakan untuk keperluan operasional sesuai kewenangan." ,"Operasional","Penumpang"],
["Railfans","Sebutan umum untuk penggemar kereta api dan dunia perkeretaapian." ,"Komunitas","Umum"],
["Rangkaian","Susunan kendaraan rel yang digabungkan untuk membentuk satu perjalanan kereta." ,"Sarana","Kereta"],
["Reservasi","Proses pemesanan tempat atau tiket untuk perjalanan kereta." ,"Tiket","Pemesanan"],
["Tiket elektronik","Bukti tiket digital yang memuat informasi perjalanan dan data pemesanan." ,"Tiket","Digital"],
["Tarif khusus","Tarif tertentu yang dapat tersedia pada perjalanan/rute dan kondisi yang ditetapkan. Ketersediaan dapat berubah." ,"Tarif","Pemesanan"],
["Trainset","Satu kesatuan rangkaian kereta yang disusun untuk beroperasi sebagai satu unit layanan." ,"Sarana","Rangkaian"],
["UIC","Union Internationale des Chemins de fer, organisasi internasional yang mengembangkan standar dan kerja sama perkeretaapian." ,"Standar","Internasional"],
["Whoosh","Layanan kereta cepat Jakarta–Bandung yang dioperasikan KCIC." ,"Layanan","Kereta cepat"],
["Pembatalan tiket","Permohonan pembatalan mengikuti kanal, batas waktu, biaya, dan ketentuan resmi yang berlaku pada jenis tiket." ,"Tiket","Layanan"],
["Refund","Pengembalian dana sesuai syarat dan proses pembatalan yang berlaku." ,"Tiket","Layanan"],
["Kondektur","Petugas awak sarana yang menjalankan tugas pelayanan dan operasional di dalam kereta sesuai tanggung jawabnya." ,"Profesi","Operasional"],
["Prama/Prami","Sebutan yang digunakan untuk petugas pelayanan di atas kereta pada layanan tertentu." ,"Profesi","Pelayanan"],
["Kereta ekonomi","Kelas layanan kereta dengan konfigurasi dan fasilitas sesuai produk perjalanan yang ditawarkan." ,"Kelas","Layanan"],
["Kereta eksekutif","Kelas layanan kereta dengan konfigurasi tempat duduk dan fasilitas sesuai produk perjalanan yang ditawarkan." ,"Kelas","Layanan"]
];
const articles = [
["Cara memesan tiket KA antarkota","1. Buka Access by KAI atau kanal resmi yang tersedia. 2. Masukkan stasiun asal, tujuan, tanggal, dan jumlah penumpang. 3. Pilih perjalanan dan kelas yang sesuai. 4. Isi data penumpang dengan benar. 5. Periksa ringkasan lalu selesaikan pembayaran sebelum batas waktu." ,"Pemesanan"],
["Cara membatalkan tiket KA antarkota","Buka menu tiket/pesanan pada aplikasi atau kanal resmi yang digunakan, pilih perjalanan, lalu ikuti alur pembatalan yang tersedia. Ketentuan biaya, batas waktu, kanal, dan estimasi pengembalian dapat berubah; konfirmasi pada ketentuan resmi sebelum menyetujui." ,"Pembatalan"],
["Tiket KRL dan layanan komuter","Metode pembayaran dan akses dapat berbeda menurut operator serta wilayah. Periksa informasi resmi operator untuk kartu uang elektronik, kartu multi-trip, QR, atau metode lain yang berlaku. Jangan menganggap prosedur KRL sama dengan tiket KA antarkota." ,"Komuter"],
["Pembatalan layanan lokal/komuter","Aturan pembatalan, pengembalian saldo, dan perubahan perjalanan bergantung pada operator serta jenis tiket. Cek ketentuan resmi pada aplikasi/kanal yang dipakai dan simpan bukti transaksi." ,"Pembatalan"],
["Mengenal jenis rangkaian","Rangkaian dapat berupa lokomotif dengan kereta penumpang, rangkaian rel listrik (KRL), rangkaian diesel/DMU, kereta bandara, atau kereta cepat. Susunan dan fasilitas berbeda menurut layanan dan periode operasi." ,"Sarana"],
["Tarif khusus: hal yang perlu diketahui","Tarif khusus tidak menjamin kursi selalu tersedia. Tarif, relasi, kelas, waktu penjualan, serta syaratnya dapat berubah. Gunakan hasil pencarian sebagai referensi awal dan verifikasi ketersediaan serta harga final di Access by KAI." ,"Tarif"]
];
const ads = [
{title:"Temukan informasi perkeretaapian",desc:"Jelajahi tarif, stasiun, istilah, dan panduan dalam satu pusat informasi.",img:"assets/iklan-1.jpg",label:"Jelajahi KAIPEDIA"},
{title:"Kenali stasiun sebelum berangkat",desc:"Cari nama stasiun dan pelajari wilayah operasional, sejarah, serta fasilitas yang tersedia.",img:"assets/iklan-2.jpg",label:"Direktori stasiun"},
{title:"Periksa tarif khusus dengan cermat",desc:"Bandingkan tarif normal dan tarif khusus untuk memahami potensi penghematan.",img:"assets/iklan-3.jpg",label:"Cari tarif khusus"},
{title:"Rencanakan perjalanan dari kanal resmi",desc:"Gunakan Access by KAI untuk memeriksa jadwal, ketersediaan, dan pemesanan tiket.",img:"assets/iklan-4.jpg",label:"Buka Access by KAI",url:"https://booking.kai.id/"},
{title:"Ensiklopedia kereta api",desc:"Kenali istilah operasional, sarana, layanan, dan panduan dasar perkeretaapian.",img:"assets/iklan-5.jpg",label:"Baca ensiklopedia"}
];
function addNav(page,label,icon="✦") {
 const nav=$(".side-nav"); if(!nav || $(`[data-page="${page}"]`,nav)) return;
 const b=document.createElement("button"); b.className="nav-link"; b.dataset.page=page;
 b.innerHTML=`<span class="kp-nav-icon">${icon}</span><span>${label}</span>`; nav.append(b);
}
function addPage(id,html) {
 const main=$("#mainContent"); if(!main || $("#page-"+id)) return;
 const s=document.createElement("section"); s.className="page"; s.id="page-"+id; s.innerHTML=html; main.insertBefore(s,$(".app-footer",main));
}
function card(title,desc,icon,action,tag="") { return `<button class="kp-feature" data-go="${action}"><span class="kp-feature-icon">${icon}</span><span><strong>${title}</strong><small>${desc}</small></span><span class="kp-arrow">↗</span>${tag?`<em>${tag}</em>`:""}</button>`; }
function installPages() {
 addNav("search","Tarif Khusus","↔");
 addNav("map","Peta Jalur Kereta Api","⌁");
 addNav("stations","Peta & Daftar Stasiun","⌖");
 addNav("encyclopedia","Ensiklopedia KAI","▤");
 const stationsBtn=$('[data-page="stations"]', $(".side-nav"));
 if(stationsBtn) { const spans=stationsBtn.querySelectorAll("span"); if(spans.length) spans[spans.length-1].textContent="Peta & Daftar Stasiun"; }
 addPage("map",`<header class="kp-page-head"><div><p class="kp-eyebrow">JARINGAN REL</p><h1>Peta jalur kereta api</h1><p>Jelajahi data jalur dan stasiun dari dataset yang disertakan. Cakupan dan status data perlu diverifikasi sebelum dipakai sebagai informasi operasional.</p></div></header><div class="kp-glass kp-map-intro"><div class="kp-map-art"> <span>JAWA</span><i></i><b></b><i></i><b></b><i></i><span>SUMATRA</span></div><div><h3>Jaringan rel Indonesia</h3><p>Peta skematik ringkas di bawah menampilkan kelompok layanan dan wilayah. Ini bukan peta navigasi real-time atau representasi geospasial resmi.</p></div></div><div class="kp-section-head"><h2>Kelompok jalur & layanan</h2><span>Data lokal</span></div><div id="kpMapGroups" class="kp-grid"></div><div class="kp-note">Catatan: data awal berasal dari paket railmap yang Anda kirim. Validasi rute, status aktif, koordinat, dan kelengkapan jalur sebelum publikasi sebagai sumber resmi.</div>`);
 addPage("encyclopedia",`<header class="kp-page-head"><div><p class="kp-eyebrow">KNOWLEDGE BASE</p><h1>Ensiklopedia KAI</h1><p>Kamus istilah, sarana, layanan, dan panduan praktis perkeretaapian. Konten awal dapat diedit dari file database.</p></div></header><label class="kp-search"><span>⌕</span><input id="kpKnowledgeSearch" placeholder="Cari istilah, layanan, atau panduan…"></label><div class="kp-chips" id="kpKnowledgeFilters"><button class="active" data-kind="all">Semua</button><button data-kind="Istilah">Istilah</button><button data-kind="Pemesanan">Pemesanan</button><button data-kind="Pembatalan">Pembatalan</button><button data-kind="Sarana">Sarana</button><button data-kind="Tarif">Tarif</button><button data-kind="Komuter">Komuter</button></div><div id="kpKnowledgeResults" class="kp-knowledge-list"></div><div class="kp-note">Panduan bersifat edukatif. Syarat, tarif, jadwal, dan prosedur operasional dapat berubah; utamakan kanal resmi untuk keputusan perjalanan.</div>`);
 // add a compact hub block to the existing home without replacing fare-search functionality
 const home=$("#page-home");
 if(home && !$("#kpHomeHub")) {
  const hub=document.createElement("section"); hub.id="kpHomeHub"; hub.className="kp-home-hub";
  hub.innerHTML=`<div class="kp-hub-heading"><div><p class="kp-eyebrow">PUSAT INFORMASI PERKERETAAPIAN</p><h2>Jelajahi KAIPEDIA</h2><p>Satu pintu untuk menemukan informasi kereta api.</p></div></div><label class="kp-search"><span>⌕</span><input id="kpHomeSearch" placeholder="Apa yang ingin kamu cari? contoh: stasiun, tarif khusus, GAPEKA…"><button id="kpHomeSearchBtn">Cari</button></label><div class="kp-grid">${card("Tarif Khusus","Cari berdasarkan stasiun atau nama kereta","↔","search")}${card("Peta Jalur Kereta Api","Jelajahi jaringan dan kelompok layanan","⌁","map")}${card("Peta & Daftar Stasiun","Cari stasiun berdasarkan nama dan Daop/Divre","⌖","stations")}${card("Ensiklopedia KAI","Istilah, rangkaian, pemesanan, pembatalan","▤","encyclopedia")}</div><div class="kp-section-head"><h2>Info pilihan</h2><span>Berputar otomatis · 3 detik</span></div><div id="kpAdCarousel" class="kp-ad-carousel" aria-live="polite"></div>`;
  home.prepend(hub);
 }
 // Enhance the existing stations page with data from railmap dataset
 const st=$("#page-stations");
 if(st && !$("#kpStationExplorer")) {
  const panel=document.createElement("div"); panel.id="kpStationExplorer"; panel.className="kp-glass kp-station-explorer";
  panel.innerHTML=`<div class="kp-section-head"><div><p class="kp-eyebrow">DIREKTORI STASIUN</p><h2>Jelajahi stasiun</h2></div><span id="kpStationCount"></span></div><label class="kp-search"><span>⌕</span><input id="kpStationSearch" placeholder="Cari nama, kode, kota, atau wilayah…"></label><div class="kp-chips" id="kpStationFilters"><button class="active" data-cat="all">Semua</button><button data-cat="whoosh">Kereta cepat</button><button data-cat="antarkota">Antarkota</button><button data-cat="commuter">Komuter/lokal</button><button data-cat="bandara">Bandara</button><button data-cat="heritage">Sejarah</button></div><div id="kpStationCards" class="kp-grid"></div><div id="kpStationDetail" class="kp-detail" hidden></div>`;
  st.prepend(panel);
 }
}
let adIndex=0, adTimer=null, stationCat="all", knowledgeKind="all";
function renderAds() {
 const root=$("#kpAdCarousel"); if(!root)return;
 const ad=ads[adIndex%ads.length];
 root.innerHTML=`<div class="kp-ad-copy"><span class="kp-ad-kicker">INFORMASI PILIHAN · ${String(adIndex+1).padStart(2,"0")} / ${ads.length}</span><h3>${ad.title}</h3><p>${ad.desc}</p><button data-go="${ad.url?'external':'search'}" ${ad.url?`data-url="${ad.url}"`:""}>${ad.label} <span>↗</span></button><div class="kp-ad-dots">${ads.map((_,i)=>`<button aria-label="Iklan ${i+1}" data-ad-index="${i}" class="${i===adIndex?'active':''}"></button>`).join("")}</div></div><div class="kp-ad-image" style="background-image:linear-gradient(0deg,rgba(4,14,27,.2),rgba(4,14,27,.05)),url('${ad.img}')"></div>`;
}
function renderStations() {
 const root=$("#kpStationCards"); if(!root)return;
 const all=Array.isArray(window.KP_STATIONS)?window.KP_STATIONS:[];
 const q=($("#kpStationSearch")?.value||"").toLowerCase().trim();
 const list=all.filter(s=>(stationCat==="all"||s.category===stationCat)&&[s.name,s.id,s.city,s.region,s.category].some(v=>String(v||"").toLowerCase().includes(q)));
 $("#kpStationCount").textContent=`${list.length} stasiun`;
 root.innerHTML=list.length?list.slice(0,120).map((s,i)=>`<button class="kp-station-card" data-station-id="${esc(s.id)}"><span class="kp-station-code">${esc(s.id||"KA")}</span><span><strong>${esc(s.name)}</strong><small>${esc(s.city||s.region||"Wilayah belum dicantumkan")} · ${esc((s.category||"").replace(/^\w/,c=>c.toUpperCase()))}</small></span><b>↗</b></button>`).join(""):`<div class="kp-empty">Tidak ada stasiun yang cocok dengan pencarian.</div>`;
}
function stationDetail(id) {
 const s=(window.KP_STATIONS||[]).find(x=>String(x.id)===String(id)); if(!s)return;
 const root=$("#kpStationDetail"); root.hidden=false;
 root.innerHTML=`<button class="kp-back" id="kpStationBack">← Kembali ke daftar</button><div class="kp-detail-hero"><span class="kp-station-code">${esc(s.id)}</span><div><p class="kp-eyebrow">PROFIL STASIUN</p><h2>${esc(s.name)}</h2><p>${esc(s.city||"Lokasi belum dicantumkan")} · ${esc(s.region||"Wilayah belum dicantumkan")}</p></div></div><div class="kp-detail-grid"><article><h3>Ringkasan</h3><p>${esc(s.description||s.name+" merupakan bagian dari basis data stasiun KAIPEDIA. Deskripsi editorial rinci belum tersedia pada data awal.")}</p></article><article><h3>Informasi dasar</h3><p><b>Kategori:</b> ${esc(s.category||"Belum dicantumkan")}<br><b>Status data:</b> ${esc(s.status||"Belum diverifikasi")}<br><b>Ketinggian:</b> ${esc(s.elevation||"Belum tersedia")}<br><b>Periode:</b> ${esc(s.years||"Belum tersedia")}</p></article><article><h3>Fasilitas</h3><p>${esc(s.facilities||"Data fasilitas belum diisi. Periksa sumber resmi atau tambahkan data terverifikasi pada basis data.")}</p></article><article><h3>Sejarah & catatan</h3><p>${esc(s.history||"Riwayat dan catatan sejarah belum tersedia pada data awal.")}</p></article></div>`;
 root.scrollIntoView({behavior:"smooth",block:"start"});
}
function renderKnowledge() {
 const root=$("#kpKnowledgeResults");if(!root)return;
 const q=($("#kpKnowledgeSearch")?.value||"").toLowerCase().trim();
 const items=[...glossary.map(([title,desc,cat,tag])=>({title,desc,cat,tag})),...articles.map(([title,desc,cat])=>({title,desc,cat,tag:"Panduan"}))].filter(x=>(knowledgeKind==="all"||x.cat===knowledgeKind||x.tag===knowledgeKind)&&(!q||[x.title,x.desc,x.cat,x.tag].join(" ").toLowerCase().includes(q)));
 root.innerHTML=items.map((x,i)=>`<details class="kp-knowledge-item"><summary><span class="kp-knowledge-icon">${x.tag==="Panduan"?"↗":"Aa"}</span><span><strong>${esc(x.title)}</strong><small>${esc(x.cat)} · ${esc(x.tag)}</small></span><b>＋</b></summary><div class="kp-knowledge-body"><p>${esc(x.desc)}</p><button class="kp-copy" data-copy="${esc(x.title+"\\n\\n"+x.desc)}">Salin ringkasan</button></div></details>`).join("")||`<div class="kp-empty">Tidak ditemukan. Coba kata kunci lain.</div>`;
}
function searchHub(q) {
 q=String(q||"").trim().toLowerCase(); if(!q)return;
 if(/tarif|tarsus|harga|hemat/.test(q)) go("search");
 else if(/stasiun|daop|divre|halte/.test(q)) {go("stations"); const input=$("#kpStationSearch");if(input){input.value=q.replace(/stasiun/g,"").trim();renderStations();}}
 else if(/peta|jalur|lintas/.test(q))go("map");
 else {go("encyclopedia");const input=$("#kpKnowledgeSearch");if(input){input.value=q;renderKnowledge();}}
}
function go(page) {
 if(typeof window.navigate==="function") window.navigate(page);
 else {
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page));
  document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
 }
}
function bind() {
 document.addEventListener("click",e=>{
  const goBtn=e.target.closest("[data-go]"); if(goBtn){if(goBtn.dataset.go==="external"){window.open(goBtn.dataset.url,"_blank","noopener,noreferrer");return;}go(goBtn.dataset.go);return;}
  const adDot=e.target.closest("[data-ad-index]");if(adDot){adIndex=Number(adDot.dataset.adIndex);renderAds();return;}
  const mapFilter=e.target.closest("[data-map-filter]");if(mapFilter){stationCat=mapFilter.dataset.mapFilter;go("stations");$("#kpStationFilters")?.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.cat===stationCat));renderStations();return;}
  const station=e.target.closest("[data-station-id]");if(station){stationDetail(station.dataset.stationId);return;}
  if(e.target.closest("#kpStationBack")){$("#kpStationDetail").hidden=true;$("#kpStationCards").scrollIntoView({behavior:"smooth",block:"start"});return;}
  const filter=e.target.closest("#kpStationFilters [data-cat]");if(filter){stationCat=filter.dataset.cat;$("#kpStationFilters").querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===filter));renderStations();return;}
  const kind=e.target.closest("#kpKnowledgeFilters [data-kind]");if(kind){knowledgeKind=kind.dataset.kind;$("#kpKnowledgeFilters").querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===kind));renderKnowledge();return;}
  const copy=e.target.closest("[data-copy]");if(copy){navigator.clipboard?.writeText(copy.dataset.copy).then(()=>toast("Ringkasan disalin.","success")).catch(()=>{});}
 });
 document.addEventListener("input",e=>{if(e.target.id==="kpStationSearch")renderStations();if(e.target.id==="kpKnowledgeSearch")renderKnowledge();});
 $("#kpHomeSearchBtn")?.addEventListener("click",()=>searchHub($("#kpHomeSearch").value));
 $("#kpHomeSearch")?.addEventListener("keydown",e=>{if(e.key==="Enter")searchHub(e.target.value);});
 renderAds();renderStations();renderKnowledge();
 if(adTimer)clearInterval(adTimer);adTimer=setInterval(()=>{adIndex=(adIndex+1)%ads.length;renderAds();},3000);
}
function loadData() {
 const groups=new Map();
 (window.KP_STATIONS||[]).forEach(s=>{const key=s.category||"Lainnya";groups.set(key,(groups.get(key)||0)+1);});
 const labels={whoosh:"Kereta cepat",antarkota:"KA antarkota",commuter:"Komuter & lokal",bandara:"Kereta bandara",heritage:"Jalur/stasiun bersejarah"};
 const root=$("#kpMapGroups");if(root)root.innerHTML=[...groups.entries()].map(([k,n])=>`<article class="kp-map-group"><span class="kp-feature-icon">⌁</span><h3>${esc(labels[k]||k)}</h3><p>${n} entri dalam dataset lokal. Gunakan direktori untuk mencari stasiun pada kategori ini.</p><button data-map-filter="${esc(k)}">Lihat stasiun ↗</button></article>`).join("");
}
document.addEventListener("DOMContentLoaded",()=>{installPages();bind();loadData();});
})();