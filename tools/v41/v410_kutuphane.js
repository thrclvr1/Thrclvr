/* ===================== V41.0: Kayıp Bilgeliğin Kütüphanesi =====================
   İlk bölüm: 5. sınıf · 2026 programı (TYMM) · 1. ünite “Allah İnancı” — üç oda.
   Oynanış döngüsü (her oda): sahneyi döndürerek keşfet → nesnelere dokunup incele (bilgi Defter'e yazılır) →
   odanın kilidini bir bulmacayla aç → kapı açılır, sonraki odaya geçilir.
   Bütün bulmaca içeriği mevcut Store kayıtlarından okunur (konu tabloları, karıştırılan kavramlar, anlatım,
   Klasik oyun kayıtları, sorular ve seçenek açıklamaları). Yeni dinî/akademik içerik üretilmez; kayıt yoksa
   bölüm “Kaynakta veri bulunmuyor.” diyerek kapalı kalır. Hikâye metni yalnızca oyun çerçevesidir. */
(function(){
const G3=V41.G3;
const K={id:"kutuphane",ad:"Kayıp Bilgeliğin Kütüphanesi",durum:"hazir",
 ozet:"Yüzyıllardır kapalı bir bilgelik kütüphanesi. Odaları keşfet, ipuçlarını Defterine yaz, mühürleri, rafları, yazıtları ve şifreli kapıları çöz.",
 afis:"background:radial-gradient(ellipse 60% 70% at 50% 100%,rgba(255,214,140,.55),transparent 70%),linear-gradient(180deg,#3a2614,#1d130b)"};

/* ---------- 1. Bölüm tanımı ve içerik bağdaştırıcı ---------- */
K.BOL={"5-2026-U01":{sinif:5,program:"2026",unite:"DKAB-5-U01"}};
const T=id=>{const t=Store.get("topics",id);return t&&vis(t)&&t.sections?t:null};
const satir=(t,i)=>t&&t.sections.tablo&&t.sections.tablo.rows&&t.sections.tablo.rows[i];
const anl=(t,h)=>t&&(t.sections.anlatim||[]).find(x=>x&&x.h===h);
const kar=(t,a)=>t&&(t.sections.karisanlar||[]).find(x=>x&&x.a===a);
const kaynak=(t,b)=>t?`${t.title} · ${b}`:"";
K.icerik=function(bid){if(K._ic&&K._ic[bid])return K._ic[bid];const B=K.BOL[bid],ek=[];const y={tamam:false,neden:"",odalar:[]};
 try{const u=Store.get("units",B.unite);if(!u||u.programYear!==B.program||u.grade!==B.sinif)throw new Error("ünite");
  const t1=T("TPC-5-1-01"),t2=T("TPC-5-1-02"),t3=T("TPC-5-1-03"),t4=T("TPC-5-1-04");if(!t1||!t2||!t3||!t4)throw new Error("konu");
  [t1,t2,t3,t4].forEach(t=>{if(t.programYear!==B.program||t.grade!==B.sinif)throw new Error("program")});
  const O=id=>Store.get("outcomes",id);
  /* Oda 1 · Düzen Salonu — TPC-5-1-01 tablosu (Alan · Gözlem · Düzenin işareti) */
  const r1=[0,1,2,3].map(i=>satir(t1,i));if(r1.some(r=>!r||r.length<3))throw new Error("tablo 1");
  const k1=kar(t1,"Gece-gündüz"),k1b=kar(t1,"Düzen");
  const oda1={id:"duzen",ad:"Düzen Salonu",konu:t1,kz:t1.outcomeIds,gorev:"Mühürlü kapıyı aç: gözlem aletlerini incele, sonra her mührü doğru yuvaya yerleştir.",esik:2,
   nes:[{id:"gok",ad:"Gök küresi",cizim:"gokKuresi",x:-230,z:-430,w:170,h:300,r:r1[0]},{id:"su",ad:"Su saati",cizim:"suSaati",x:230,z:-430,w:150,h:290,r:r1[1]},
    {id:"bitki",ad:"Herbaryum masası",cizim:"herbaryum",x:-360,z:-60,w:190,h:230,r:r1[2]},{id:"beden",ad:"Anatomi kitabı",cizim:"kitapSehpa",x:360,z:-60,w:160,h:250,r:r1[3]},
    k1?{id:"kursu",ad:"Okuma kürsüsü",cizim:"kursu",x:-190,z:-640,w:150,h:260,kar:k1,kaynak:kaynak(t1,"Karıştırılanlar")}:null].filter(Boolean),
   bulmaca:{tur:"muhur",nesne:"kapi",ad:"Mühürlü kapı",kz:t1.outcomeIds,ciftler:r1.map(r=>({id:r[0],sol:r[0],sag:r[2],gozlem:r[1]})),ek:k1b,kaynak:kaynak(t1,"Tablo: "+t1.sections.tablo.baslik),tablo:t1.sections.tablo}};
  oda1.nes.forEach(n=>{if(n.r)n.not={b:n.r[0],m:`Gözlem: ${n.r[1]}. Düzenin işareti: ${n.r[2]}.`,k:kaynak(t1,"Tablo")};if(n.kar)n.not={b:`${n.kar.a} ↔ ${n.kar.b}`,m:n.kar.fark+(n.kar.ipucu?" İpucu: "+n.kar.ipucu:""),k:n.kaynak}});
  /* Oda 2 · İsimler Arşivi — TPC-5-1-03 tablosu (İsim · Anlamı · Örnek) + Klasik gruplandırma kaydı */
  const gr=Store.get("games","GM28-TPC-5-1-03-grup");if(!gr||!gvis(gr)||!gr.categories||!gr.items)throw new Error("gruplandırma");
  const r2=(t3.sections.tablo.rows||[]).filter(r=>r&&r.length>=3);if(r2.length<4)throw new Error("tablo 3");
  const ad2=["kursuAcik","tomar","sandik","levha","kandil","levha2"],xz2=[[-240,-450],[240,-450],[-380,-90],[380,-90],[-200,-650],[200,-650]];
  const k2=kar(t3,"Rahmân");
  const oda2={id:"isimler",ad:"İsimler Arşivi",konu:t3,kz:t3.outcomeIds,gorev:"Arşivi düzenle: isim levhalarını incele, dağılmış kitapları doğru raflara yerleştir.",esik:2,
   nes:r2.slice(0,6).map((r,i)=>({id:"isim"+i,ad:r[0]+" levhası",cizim:ad2[i],x:xz2[i][0],z:xz2[i][1],w:i<2?160:i<4?170:120,h:i<2?260:i<4?200:270,not:{b:r[0],m:`Anlamı: ${r[1]}. Hangi durumda aklımıza gelir: ${r[2]}.`,k:kaynak(t3,"Tablo")}})),
   bulmaca:{tur:"raf",nesne:"araba",ad:"Dağılmış kitaplar",kz:gr.outcomeIds&&gr.outcomeIds.length?gr.outcomeIds:t3.outcomeIds,raflar:gr.categories.slice(),kitaplar:gr.items.map((x,i)=>({id:"k"+i,metin:x.text,raf:x.cat})),
    anlam:Object.fromEntries(r2.map(r=>[r[0],r[1]])),kaynak:kaynak(t3,"Tablo: "+t3.sections.tablo.baslik)+" · Klasik oyun: "+gr.title,tablo:t3.sections.tablo}};
  if(k2)oda2.nes.push({id:"not2",ad:"Arşivci notu",cizim:"notKagit",x:0,z:-180,w:110,h:120,yer:1,not:{b:`${k2.a} ↔ ${k2.b}`,m:k2.fark+(k2.ipucu?" İpucu: "+k2.ipucu:""),k:kaynak(t3,"Karıştırılanlar")}});
  if(oda2.bulmaca.kitaplar.some(b=>!oda2.bulmaca.raflar.includes(b.raf)))throw new Error("raf eşleşmesi");
  /* Oda 3 · Yazıt Odası — eksik kelime kaydı + şifreli kapı (sorular ve seçenek açıklamaları) */
  const ek3=Store.get("games","GM30-TPC-5-1-01-eksik");if(!ek3||!gvis(ek3)||!ek3.items||ek3.items.length<2)throw new Error("eksik kelime");
  const Q=["Q-DKAB-5-0008","Q-DKAB-5-0046","Q-DKAB-5-0048"].map(id=>Store.get("questions",id)).filter(q=>q&&vis(q));if(Q.length<3)throw new Error("soru");
  const a31=anl(t1,"Evren ve kâinat"),a32=anl(t4,"İhlâs ne demek?"),kd=t2.sections.kodlama,r4=[0,1].map(i=>satir(t4,i)),k4=kar(t4,"Ehad"),k2t=kar(t2,"Tevhit");
  const n3=[a31?{id:"evren",ad:"Evren levhası",cizim:"tasLevha",x:-360,z:-150,w:150,h:220,not:{b:a31.h,m:a31.p,k:kaynak(t1,"Anlatım")}}:null,
   kd?{id:"tek",ad:"Duvar yazısı",cizim:"duvarYazi",x:360,z:-150,w:170,h:200,not:{b:"Kodlama: "+kd.h,m:kd.p,k:kaynak(t2,"Kodlama")}}:null,
   k2t?{id:"tevhit",ad:"Karşılaştırma tomarı",cizim:"tomar",x:-200,z:-650,w:120,h:250,not:{b:`${k2t.a} ↔ ${k2t.b}`,m:k2t.fark+(k2t.ipucu?" İpucu: "+k2t.ipucu:""),k:kaynak(t2,"Karıştırılanlar")}}:null,
   r4[0]&&r4[1]?{id:"ihlas",ad:"İhlâs suresi levhası",cizim:"levha",x:200,z:-650,w:170,h:200,not:{b:"İhlâs suresi: 1. ve 2. ayet",m:`${r4[0][0]}. ayet: ${r4[0][1]} (${r4[0][2]}). ${r4[1][0]}. ayet: ${r4[1][1]} (${r4[1][2]}).`,k:kaynak(t4,"Tablo")}}:null,
   a32?{id:"ihlas2",ad:"Okuma kürsüsü",cizim:"kursu",x:240,z:-450,w:150,h:260,not:{b:a32.h,m:a32.p,k:kaynak(t4,"Anlatım")}}:null,
   k4?{id:"ehad",ad:"Not defteri",cizim:"kitapSehpa",x:-240,z:-450,w:160,h:250,not:{b:`${k4.a} ↔ ${k4.b}`,m:k4.fark+(k4.ipucu?" İpucu: "+k4.ipucu:""),k:kaynak(t4,"Karıştırılanlar")}}:null].filter(Boolean);
  const oda3={id:"yazit",ad:"Yazıt Odası",konu:t1,kz:[...new Set([].concat(ek3.outcomeIds||[],...Q.map(q=>q.outcomeIds||[])))],gorev:"Kırık yazıtı tamamla, sonra şifreli kapının üç kadranını doğru konuma getir.",esik:2,nes:n3,
   bulmaca:{tur:"yazit",nesne:"yazit",ad:"Kırık yazıt",kz:ek3.outcomeIds||t1.outcomeIds,cumleler:ek3.items.map((x,i)=>({id:"c"+i,metin:x.text,cevap:x.answer,secenek:x.options.slice(),tam:x.full,ref:x.ref})),kaynak:kaynak(t1,"Anlatım")+" · Klasik oyun: "+ek3.title},
   bulmaca2:{tur:"kadran",nesne:"kapi",ad:"Şifreli kapı",sorular:Q.map(q=>({id:q.id,metin:q.text,secenek:q.options.slice(),cevap:q.answer,not:(q.optionNotes||[]).slice(),aciklama:q.explanation||"",kz:q.outcomeIds||[],konu:q.topicId})),kaynak:"Sorular: "+Q.map(q=>{const t=Store.get("topics",q.topicId);return t?t.title:""}).filter(Boolean).join(" · ")}};
  y.odalar=[oda1,oda2,oda3];y.kazanim=[...new Set([].concat(t1.outcomeIds,t2.outcomeIds,t3.outcomeIds,t4.outcomeIds))].map(O).filter(Boolean);
  y.konular=[t1,t2,t3,t4];y.durum=[t1,t2,t3,t4].some(t=>t.status!=="published")?"İçerik mevcut konu kayıtlarından alınır; kayıtlar henüz editör onayından geçmedi.":"";y.tamam=true}
 catch(e){y.neden="Bu bölüm için gereken kayıt bulunamadı ("+e.message+"). Kaynakta veri bulunmuyor.";V41.uyar("Kütüphane içeriği kurulamadı",e)}
 (K._ic=K._ic||{})[bid]=y;return y};
K.bolumler=()=>Object.keys(K.BOL).map(id=>{const B=K.BOL[id],ic=K.icerik(id),u=Store.get("units",B.unite);return{id,ad:`${B.sinif}. sınıf · ${u?u.title.split(" ").map(w=>w.charAt(0)+w.slice(1).toLocaleLowerCase("tr")).join(" "):"—"}`,alt:`${V39.pyName(B.program)} · 3 oda · ${ic.kazanim?ic.kazanim.map(o=>o.code).join(", "):""}`,odaSay:3,hazir:ic.tamam,neden:ic.neden,uyari:ic.durum}});

/* ---------- 2. Durum ve kayıt ---------- */
let S=null,D=null,IC=null,R=null,KAM=null,KOK=null,SAY=0;
const yeniDurum=()=>({v:1,giris:false,oda:0,kesif:{},cozum:{},yildiz:{},puan:{},sure:0,bitti:false,bas:new Date().toISOString(),ilk:{},kz:{}});
const kaydet=()=>{if(S&&D)V41.bolumYaz(K.id,S,D)};
const oda=()=>IC.odalar[D.oda];
const kesifSay=o=>o.nes.filter(n=>D.kesif[o.id+":"+n.id]).length;
/* ilk deneme kaydı: kazanım raporu ve mevcut kazanım ilerlemesi (Prog.rec — Klasik oyunlarla aynı) */
const ilkDeneme=(anahtar,kz,dogru)=>{if(anahtar in D.ilk)return;D.ilk[anahtar]=dogru?1:0;(kz||[]).forEach(o=>{const z=D.kz[o]||(D.kz[o]={d:0,y:0});z.d++;if(dogru)z.y++});try{if(kz&&kz.length)Prog.rec(kz,dogru)}catch(e){V41.uyar("kazanım ilerlemesi yazılamadı",e)}};
const bulmacaPuan=c=>Math.max(20,100-10*(c.hata||0)-15*(c.ipucu||0));
const yildizHesap=p=>p>=90?3:p>=60?2:1;

/* ---------- 3. Çizim yardımcıları (canvas 2B; aydınlık, sıcak) ---------- */
let sd=41007;const rn=()=>(sd=(sd*16807)%2147483647,(sd-1)/2147483646);
const CV=(w,h)=>{const c=document.createElement("canvas");c.width=w;c.height=h;return c};
const ahsap=(x,X0,Y0,W,H,o)=>{o=o||{};x.save();x.beginPath();x.rect(X0,Y0,W,H);x.clip();const yat=!!o.yatay,g=yat?x.createLinearGradient(0,Y0,0,Y0+H):x.createLinearGradient(X0,0,X0+W,0);g.addColorStop(0,o.c1||"#7a4926");g.addColorStop(.5,o.c2||"#96602f");g.addColorStop(1,o.c1||"#7a4926");x.fillStyle=g;x.fillRect(X0,Y0,W,H);
 const uz=yat?W:H,en=yat?H:W,n=Math.max(6,Math.round(en*(o.sik||.3)));for(let l=0;l<n;l++){const p=rn()*en,a=1+rn()*3.5,k=1+(rn()*3|0),ph=rn()*6.28;x.beginPath();for(let s=0;s<=uz;s+=10){const q=p+Math.sin(s*k*Math.PI/Math.max(100,uz)+ph)*a;yat?(s?x.lineTo(X0+s,Y0+q):x.moveTo(X0+s,Y0+q)):(s?x.lineTo(X0+q,Y0+s):x.moveTo(X0+q,Y0+s))}
  x.strokeStyle=rn()<.5?`rgba(58,28,10,${.12+rn()*.18})`:`rgba(232,180,116,${.08+rn()*.12})`;x.lineWidth=.5+rn()*1.3;x.stroke()}x.restore()};
const altin=(x,X0,Y0,W,H)=>{const g=x.createLinearGradient(0,Y0,0,Y0+H);g.addColorStop(0,"#f6dfa2");g.addColorStop(.5,"#d4aa5e");g.addColorStop(1,"#a77b37");x.fillStyle=g;x.fillRect(X0,Y0,W,H)};
const isik=(x,cx,cy,r,a,renk)=>{x.save();x.globalCompositeOperation="lighter";const g=x.createRadialGradient(cx,cy,0,cx,cy,r),c=renk||"255,214,150";g.addColorStop(0,`rgba(${c},${a})`);g.addColorStop(.5,`rgba(${c},${a*.35})`);g.addColorStop(1,`rgba(${c},0)`);x.fillStyle=g;x.fillRect(cx-r,cy-r,2*r,2*r);x.restore()};
const yuvarlak=(x,X0,Y0,W,H,r)=>{x.beginPath();if(x.roundRect)x.roundRect(X0,Y0,W,H,r);else x.rect(X0,Y0,W,H)};
const kemer=(x,x0,y0,x1,y1)=>{const r=(x1-x0)/2;x.beginPath();x.moveTo(x0,y1);x.lineTo(x0,y0+r);x.arc((x0+x1)/2,y0+r,r,Math.PI,0);x.lineTo(x1,y1);x.closePath()};
const yildizYol=(x,cx,cy,R1,r1,n)=>{x.beginPath();for(let k=0;k<2*n;k++){const a=-Math.PI/2+k*Math.PI/n,r=k%2?r1:R1;k?x.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):x.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a))}x.closePath()};
const kafesDesen=(x,renk,s)=>{const c=CV(Math.round(40*s),Math.round(40*s)),k=c.getContext("2d");k.scale(s,s);k.strokeStyle=renk;k.lineWidth=1.5;yildizYol(k,20,20,16,9,8);k.stroke();[[0,0,8.7,8.7],[40,0,31.3,8.7],[0,40,8.7,31.3],[40,40,31.3,31.3]].forEach(q=>{k.beginPath();k.moveTo(q[0],q[1]);k.lineTo(q[2],q[3]);k.stroke()});return x.createPattern(c,"repeat")};
const kitaplar=(x,X0,Y0,W,H)=>{const R=["#9c4a36","#c9a056","#3f6478","#7a5230","#b8873f","#5d7a52","#8a3f4a","#d9b877","#6b4f7a","#a8603a"];let px=X0;while(px<X0+W-4){const w=7+rn()*12,h=H*(.72+rn()*.26),c=R[(rn()*R.length)|0];x.fillStyle=c;x.fillRect(px,Y0+H-h,w-1.4,h);x.fillStyle="rgba(255,236,190,.55)";x.fillRect(px+1,Y0+H-h+h*.18,w-3.4,2);x.fillRect(px+1,Y0+H-h*.25,w-3.4,1.5);x.fillStyle="rgba(0,0,0,.12)";x.fillRect(px+w-3,Y0+H-h,1.6,h);px+=w;if(rn()<.06)px+=10}};
const rafDolap=(x,X0,Y0,W,H,kat)=>{ahsap(x,X0,Y0,W,H,{c1:"#6a3f22",c2:"#8a5830"});const ic=X0+14,iw=W-28,kh=(H-40)/kat;for(let i=0;i<kat;i++){const y=Y0+20+i*kh;x.fillStyle="#4a2b16";x.fillRect(ic,y,iw,kh-10);const g=x.createLinearGradient(0,y,0,y+kh);g.addColorStop(0,"rgba(255,220,160,.18)");g.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=g;x.fillRect(ic,y,iw,kh-10);kitaplar(x,ic+4,y+6,iw-8,kh-18);ahsap(x,ic-6,y+kh-12,iw+12,10,{yatay:true,c1:"#7a4926",c2:"#9a6332"});altin(x,ic-6,y+kh-13,iw+12,2)}
 altin(x,X0,Y0,W,6);altin(x,X0,Y0+H-6,W,6)};
const tasDoku=(x,W,H,c)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,c?c[0]:"#d8c6a4");g.addColorStop(1,c?c[1]:"#cbb792");x.fillStyle=g;x.fillRect(0,0,W,H);for(let i=0;i<W*H/220;i++){x.fillStyle=rn()<.5?`rgba(120,96,62,${rn()*.08})`:`rgba(255,250,235,${rn()*.1})`;x.fillRect(rn()*W,rn()*H,1+rn()*3,1+rn()*3)}
 x.strokeStyle="rgba(110,86,54,.4)";x.lineWidth=1.5;let s=0;for(let y=0;y<H;y+=80,s++){x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();for(let xx=s%2?90:0;xx<=W;xx+=180){x.beginPath();x.moveTo(xx,y);x.lineTo(xx,y+80);x.stroke()}}};
/* oda dokuları: 1024 px; duvar karosu 400×800 dünya birimi */
const DOKU={
 duvar_duzen:[512,1024,x=>{x.scale(512/400,1024/800);tasDoku(x,400,800);ahsap(x,0,0,400,46,{yatay:true,c1:"#6d4425",c2:"#8f5e33"});altin(x,0,42,400,4);
  /* kemerli pencere: gece göğü ve takımyıldız çizgileri (gözlem salonu) */ x.save();kemer(x,90,130,310,560);x.clip();const g=x.createLinearGradient(0,130,0,560);g.addColorStop(0,"#2c3e66");g.addColorStop(1,"#6a7fa8");x.fillStyle=g;x.fillRect(90,130,220,430);for(let i=0;i<60;i++){x.fillStyle=`rgba(255,250,230,${.4+rn()*.6})`;x.beginPath();x.arc(90+rn()*220,130+rn()*430,.6+rn()*1.5,0,7);x.fill()}x.restore();
  x.lineWidth=9;x.strokeStyle="#6b4224";kemer(x,90,130,310,560);x.stroke();x.lineWidth=2;x.strokeStyle="#e4c07a";kemer(x,84,124,316,560);x.stroke();x.strokeStyle="rgba(107,66,36,.9)";x.lineWidth=4;x.beginPath();x.moveTo(200,130);x.lineTo(200,560);x.moveTo(90,345);x.lineTo(310,345);x.stroke();
  ahsap(x,0,560,400,240,{c1:"#73442a",c2:"#8d5a31"});altin(x,0,556,400,6);for(let xx=10;xx<400;xx+=130){x.strokeStyle="rgba(60,32,12,.5)";x.lineWidth=2;x.strokeRect(xx,585,110,170);x.strokeStyle="rgba(236,196,124,.55)";x.lineWidth=1.2;x.strokeRect(xx+5,590,100,160)}
  x.fillStyle="#4a3d34";x.fillRect(0,772,400,28);altin(x,0,770,400,3);isik(x,200,300,260,.12)}],
 duvar_arsiv:[512,1024,x=>{x.scale(512/400,1024/800);tasDoku(x,400,800,["#d4c09c","#c7b08a"]);rafDolap(x,10,40,380,720,6);ahsap(x,0,0,400,40,{yatay:true,c1:"#6d4425",c2:"#8f5e33"});altin(x,0,36,400,4);x.fillStyle="#4a3d34";x.fillRect(0,772,400,28);altin(x,0,770,400,3)}],
 duvar_yazit:[512,1024,x=>{x.scale(512/400,1024/800);tasDoku(x,400,800,["#ddcaa6","#cdb68e"]);ahsap(x,0,0,400,46,{yatay:true,c1:"#6d4425",c2:"#8f5e33"});altin(x,0,42,400,4);
  /* oyma kuşak ve kemerli niş, kandil */ x.fillStyle=kafesDesen(x,"rgba(120,84,40,.55)",.9);x.fillRect(0,70,400,56);x.strokeStyle="rgba(110,80,40,.6)";x.lineWidth=2;x.strokeRect(0,70,400,56);
  x.save();kemer(x,120,190,280,520);x.clip();const g=x.createRadialGradient(200,360,10,200,380,200);g.addColorStop(0,"#f8e2b4");g.addColorStop(.6,"#cf9c5c");g.addColorStop(1,"#8f5f34");x.fillStyle=g;x.fillRect(120,190,160,330);x.restore();x.lineWidth=6;x.strokeStyle="#6b4224";kemer(x,120,190,280,520);x.stroke();
  x.fillStyle="#8c6431";x.fillRect(190,440,20,60);const k=x.createRadialGradient(200,420,2,200,420,26);k.addColorStop(0,"#fffbe9");k.addColorStop(.5,"#ffd890");k.addColorStop(1,"rgba(255,200,120,0)");x.fillStyle=k;x.beginPath();x.arc(200,420,26,0,7);x.fill();isik(x,200,400,170,.25);
  ahsap(x,0,600,400,200,{c1:"#73442a",c2:"#8d5a31"});altin(x,0,596,400,6);x.fillStyle="#4a3d34";x.fillRect(0,772,400,28);altin(x,0,770,400,3)}],
 zemin_ahsap:[1024,1024,x=>{x.scale(1024/600,1024/600);for(let r=0;r<20;r++)for(let c=0;c<10;c++){const X0=c*60,Y0=r*30+(c%2?15:0);ahsap(x,X0,Y0-30,60,30,{yatay:true,c1:(r+c)%2?"#a06b3c":"#b07a46",c2:(r+c)%2?"#b88550":"#c08d58",sik:.2});x.strokeStyle="rgba(70,40,16,.45)";x.lineWidth=1;x.strokeRect(X0,Y0-30,60,30)}
  const g=x.createRadialGradient(300,300,40,300,300,420);g.addColorStop(0,"rgba(255,232,190,.18)");g.addColorStop(1,"rgba(60,30,10,.12)");x.fillStyle=g;x.fillRect(0,0,600,600)}],
 zemin_tas:[1024,1024,x=>{x.scale(1024/600,1024/600);x.fillStyle="#d9c9a8";x.fillRect(0,0,600,600);for(let r=0;r<6;r++)for(let c=0;c<6;c++){const g=x.createLinearGradient(c*100,r*100,c*100+100,r*100+100);g.addColorStop(0,(r+c)%2?"#e3d4b4":"#d2bf98");g.addColorStop(1,(r+c)%2?"#d8c7a3":"#c9b48c");x.fillStyle=g;x.fillRect(c*100+2,r*100+2,96,96)}
  for(let i=0;i<1400;i++){x.fillStyle=`rgba(120,96,62,${rn()*.07})`;x.fillRect(rn()*600,rn()*600,1+rn()*3,1+rn()*3)}}],
 hali:[512,1024,x=>{x.fillStyle="#7a2e24";x.fillRect(0,0,512,1024);x.strokeStyle="#d9b064";x.lineWidth=10;x.strokeRect(20,20,472,984);x.lineWidth=3;x.strokeRect(42,42,428,940);x.fillStyle="#2f4a5a";x.fillRect(48,48,416,928);x.fillStyle="#7a2e24";x.fillRect(64,64,384,896);
  x.fillStyle=kafesDesen(x,"rgba(230,190,110,.55)",1.6);x.fillRect(64,64,384,896);[[256,250],[256,512],[256,774]].forEach(([cx,cy])=>{yildizYol(x,cx,cy,110,70,8);x.fillStyle="#e3c07a";x.fill();yildizYol(x,cx,cy,64,40,8);x.fillStyle="#2f4a5a";x.fill()});
  for(let i=0;i<3000;i++){x.fillStyle=`rgba(0,0,0,${rn()*.06})`;x.fillRect(rn()*512,rn()*1024,2,2)}}],
 tavan:[1024,1024,x=>{x.scale(1024/600,1024/600);ahsap(x,0,0,600,600,{c1:"#8a5a32",c2:"#a06c3c",sik:.15});for(let r=0;r<3;r++)for(let c=0;c<3;c++){const px=c*200+16,py=r*200+16;ahsap(x,px,py,168,168,{c1:"#b98a55",c2:"#c99a64",sik:.12});x.strokeStyle="rgba(70,40,16,.55)";x.lineWidth=3;x.strokeRect(px,py,168,168);x.strokeStyle="rgba(246,216,152,.75)";x.lineWidth=1.4;x.strokeRect(px+8,py+8,152,152);
   yildizYol(x,px+84,py+84,40,26,8);x.fillStyle="rgba(240,206,130,.8)";x.fill()}isik(x,300,300,300,.18)}],
 /* nesneler (saydam arka plan) */
 gokKuresi:[256,512,x=>{x.scale(256/170,512/300);const cx=85;ahsap(x,cx-8,170,16,110,{c1:"#6a3f22",c2:"#8a5830"});ahsap(x,cx-46,272,92,20,{yatay:true,c1:"#6a3f22",c2:"#8a5830"});altin(x,cx-46,270,92,3);
  const g=x.createRadialGradient(cx-18,82,6,cx,100,70);g.addColorStop(0,"#d6e4f2");g.addColorStop(.6,"#6f8db8");g.addColorStop(1,"#34507a");x.fillStyle=g;x.beginPath();x.arc(cx,100,62,0,7);x.fill();
  x.strokeStyle="#e8c47c";x.lineWidth=4;x.beginPath();x.ellipse(cx,100,72,22,-.4,0,7);x.stroke();x.beginPath();x.ellipse(cx,100,22,72,.3,0,7);x.stroke();x.lineWidth=5;x.beginPath();x.arc(cx,100,74,0,7);x.stroke();
  for(let i=0;i<18;i++){x.fillStyle="rgba(255,248,220,.9)";x.beginPath();x.arc(cx-50+rn()*100,50+rn()*100,1.4,0,7);x.fill()}isik(x,cx,100,90,.18)}],
 suSaati:[256,512,x=>{x.scale(256/150,512/290);ahsap(x,10,262,130,24,{yatay:true,c1:"#6a3f22",c2:"#8a5830"});altin(x,10,260,130,3);ahsap(x,20,40,10,224,{c1:"#6a3f22",c2:"#8a5830"});ahsap(x,120,40,10,224,{c1:"#6a3f22",c2:"#8a5830"});ahsap(x,10,30,130,14,{yatay:true});altin(x,10,28,130,3);
  const kase=(y,dol)=>{x.fillStyle="rgba(220,236,246,.55)";x.strokeStyle="#c9a056";x.lineWidth=3;x.beginPath();x.moveTo(36,y);x.quadraticCurveTo(75,y+70,114,y);x.closePath();x.fill();x.stroke();x.fillStyle="rgba(74,140,190,.8)";x.beginPath();x.moveTo(44+dol,y+8+dol*.6);x.quadraticCurveTo(75,y+64,106-dol,y+8+dol*.6);x.closePath();x.fill()};
  kase(60,4);kase(160,14);x.strokeStyle="rgba(74,140,190,.85)";x.lineWidth=3;x.beginPath();x.moveTo(75,124);x.lineTo(75,170);x.stroke();for(let i=0;i<4;i++){x.fillStyle="rgba(120,180,220,.9)";x.beginPath();x.arc(75,132+i*10,2.4,0,7);x.fill()}}],
 herbaryum:[256,384,x=>{x.scale(256/190,384/230);ahsap(x,0,120,190,18,{yatay:true,c1:"#6a3f22",c2:"#8a5830"});altin(x,0,118,190,3);ahsap(x,14,138,12,90,{});ahsap(x,164,138,12,90,{});
  x.fillStyle="#f3e7cc";x.beginPath();x.moveTo(30,116);x.lineTo(92,104);x.lineTo(96,120);x.lineTo(34,124);x.closePath();x.fill();x.beginPath();x.moveTo(96,104);x.lineTo(158,112);x.lineTo(156,124);x.lineTo(96,120);x.closePath();x.fill();
  x.strokeStyle="#5c8a44";x.lineWidth=2;x.beginPath();x.moveTo(60,118);x.quadraticCurveTo(64,96,70,90);x.stroke();x.fillStyle="#6a9a4c";x.beginPath();x.ellipse(66,98,8,4,-.6,0,7);x.fill();x.beginPath();x.ellipse(72,92,7,3.5,.5,0,7);x.fill();
  x.fillStyle="#a8703a";x.beginPath();x.moveTo(128,118);x.lineTo(168,118);x.lineTo(162,80);x.lineTo(134,80);x.closePath();x.fill();altin(x,130,78,36,5);[[146,30,-.2],[152,40,.4],[140,46,-.7],[156,56,.8],[146,60,0]].forEach(([a,b,r])=>{x.fillStyle=r>0?"#5c8a44":"#6a9a4c";x.beginPath();x.ellipse(a,b,7,20,r,0,7);x.fill()})}],
 kitapSehpa:[256,384,x=>{x.scale(256/160,384/250);ahsap(x,74,120,12,124,{});ahsap(x,40,238,80,10,{yatay:true});altin(x,40,236,80,2);x.save();x.translate(80,92);x.rotate(-.08);ahsap(x,-66,-34,132,58,{yatay:true,c1:"#6a3f22",c2:"#8a5830"});x.fillStyle="#f6ecd2";x.fillRect(-60,-30,58,48);x.fillRect(2,-30,58,48);
  x.fillStyle="rgba(120,90,50,.55)";for(let i=0;i<7;i++){x.fillRect(-54,-24+i*6,46*(.6+rn()*.4),1.6);x.fillRect(8,-24+i*6,46*(.6+rn()*.4),1.6)}x.strokeStyle="#c79a52";x.lineWidth=1.4;x.strokeRect(-60,-30,120,48);x.restore();isik(x,80,90,80,.12)}],
 kursu:[256,512,x=>{x.scale(256/150,512/260);ahsap(x,64,110,22,140,{c1:"#6a3f22",c2:"#8a5830"});ahsap(x,30,240,90,14,{yatay:true});altin(x,30,238,90,3);x.save();x.translate(75,96);x.rotate(-.12);ahsap(x,-60,-26,120,40,{yatay:true,c1:"#6a3f22",c2:"#8a5830"});altin(x,-60,12,120,3);
  x.fillStyle="#f6ecd2";x.fillRect(-52,-38,50,30);x.fillRect(2,-38,50,30);x.fillStyle="rgba(120,90,50,.5)";for(let i=0;i<4;i++){x.fillRect(-48,-33+i*6,40,1.5);x.fillRect(6,-33+i*6,40,1.5)}x.restore();x.fillStyle="#f3e2bb";x.save();x.translate(98,64);x.rotate(.2);x.fillRect(0,0,28,34);x.fillStyle="rgba(140,96,50,.6)";for(let i=0;i<4;i++)x.fillRect(4,6+i*6,20,1.4);x.restore()}],
 kursuAcik:[256,512,x=>{DOKU.kursu[2](x)}],
 tomar:[256,512,x=>{x.scale(256/120,512/250);ahsap(x,52,120,16,124,{});ahsap(x,22,236,76,10,{yatay:true});altin(x,22,234,76,2);x.fillStyle="#f1e2bf";x.fillRect(22,20,76,104);x.fillStyle="rgba(140,96,50,.55)";for(let i=0;i<10;i++)x.fillRect(30,30+i*9,60*(.6+rn()*.4),1.8);
  [[12],[108]].forEach(([cx])=>{ahsap(x,cx-6,10,12,124,{c1:"#7a4926",c2:"#a06c3c"});altin(x,cx-8,6,16,6);altin(x,cx-8,128,16,6)})}],
 sandik:[256,256,x=>{x.scale(256/170,256/200);ahsap(x,10,80,150,110,{yatay:true,c1:"#6a3f22",c2:"#8f5d32"});x.save();x.beginPath();x.moveTo(10,80);x.quadraticCurveTo(85,20,160,80);x.closePath();x.clip();ahsap(x,10,20,150,60,{yatay:true,c1:"#7a4926",c2:"#9a6332"});x.restore();
  altin(x,10,78,150,6);altin(x,26,80,8,110);altin(x,136,80,8,110);x.fillStyle="#d4aa5e";x.fillRect(74,100,22,26);x.fillStyle="#5a3a18";x.beginPath();x.arc(85,110,4,0,7);x.fill();x.fillRect(83,110,4,9);
  x.fillStyle="#f3e2bb";x.save();x.translate(46,64);x.rotate(-.25);x.fillRect(0,0,40,26);x.restore()}],
 levha:[256,384,x=>{x.scale(256/170,384/200);ahsap(x,8,8,154,184,{c1:"#6a3f22",c2:"#8a5830"});altin(x,8,8,154,4);altin(x,8,188,154,4);x.fillStyle="#efe0bc";x.fillRect(22,24,126,150);x.fillStyle=kafesDesen(x,"rgba(184,135,63,.35)",.7);x.fillRect(22,24,126,150);
  x.fillStyle="rgba(110,70,30,.75)";for(let i=0;i<6;i++)x.fillRect(34,44+i*20,102*(.55+rn()*.45),3);yildizYol(x,85,174,10,6,8);x.fillStyle="#c9a056";x.fill()}],
 levha2:[256,384,x=>{DOKU.levha[2](x)}],
 kandil:[256,512,x=>{x.scale(256/120,512/270);ahsap(x,54,90,12,170,{});ahsap(x,24,256,72,10,{yatay:true});altin(x,24,254,72,2);x.fillStyle="#f1e2bf";x.fillRect(26,120,68,90);x.fillStyle="rgba(140,96,50,.55)";for(let i=0;i<7;i++)x.fillRect(32,130+i*10,56*(.6+rn()*.4),1.8);
  altin(x,44,60,32,18);const k=x.createRadialGradient(60,48,2,60,48,30);k.addColorStop(0,"#fffbe9");k.addColorStop(.5,"#ffd890");k.addColorStop(1,"rgba(255,200,120,0)");x.fillStyle=k;x.beginPath();x.arc(60,48,30,0,7);x.fill()}],
 notKagit:[256,256,x=>{x.scale(256/110,256/120);ahsap(x,6,70,98,46,{yatay:true,c1:"#6a3f22",c2:"#8a5830"});altin(x,6,68,98,3);x.save();x.translate(30,22);x.rotate(-.12);x.fillStyle="#f6ecd2";x.fillRect(0,0,56,52);x.fillStyle="rgba(140,96,50,.6)";for(let i=0;i<6;i++)x.fillRect(6,8+i*7,44*(.6+rn()*.4),1.5);x.restore()}],
 tasLevha:[256,384,x=>{x.scale(256/150,384/220);x.fillStyle="#cdb791";yuvarlak(x,10,6,130,200,14);x.fill();x.strokeStyle="#8f7650";x.lineWidth=4;x.stroke();x.fillStyle="rgba(110,86,54,.65)";for(let i=0;i<8;i++)x.fillRect(26,30+i*20,98*(.6+rn()*.4),3);x.fillStyle="#a88b5e";x.fillRect(0,200,150,20)}],
 duvarYazi:[256,384,x=>{x.scale(256/170,384/200);x.fillStyle="#e6d4ae";x.fillRect(6,6,158,188);x.strokeStyle="#9b7238";x.lineWidth=5;x.strokeRect(6,6,158,188);x.fillStyle="#6b4224";x.font="700 64px Literata, Georgia, serif";x.textAlign="center";x.fillText("T·E·K",85,112);x.fillStyle="rgba(110,70,30,.6)";for(let i=0;i<3;i++)x.fillRect(30,140+i*14,110*(.6+rn()*.4),3)}],
 araba:[512,256,x=>{x.scale(512/260,256/150);ahsap(x,10,60,240,60,{yatay:true,c1:"#6a3f22",c2:"#8f5d32"});altin(x,10,58,240,4);[[40],[220]].forEach(([cx])=>{x.fillStyle="#5a3a1c";x.beginPath();x.arc(cx,126,18,0,7);x.fill();x.strokeStyle="#d4aa5e";x.lineWidth=3;x.stroke()});
  for(let i=0;i<5;i++){x.save();x.translate(40+i*42,58);x.rotate(-.3+rn()*.6);const R=["#9c4a36","#3f6478","#c9a056","#5d7a52","#8a3f4a"];x.fillStyle=R[i];x.fillRect(-14,-46,28,46);x.fillStyle="rgba(255,236,190,.6)";x.fillRect(-12,-36,24,2);x.restore()}}],
 yazitTasi:[512,512,x=>{x.scale(512/300,512/300);x.fillStyle="#cbb48b";kemer(x,20,10,280,290);x.fill();x.strokeStyle="#8f7650";x.lineWidth=6;x.stroke();x.fillStyle=kafesDesen(x,"rgba(140,110,70,.35)",1);kemer(x,40,30,260,90);x.fill();
  x.fillStyle="rgba(110,86,54,.7)";for(let i=0;i<7;i++){const w=180*(.55+rn()*.45);x.fillRect(60,110+i*22,w,4)}x.strokeStyle="rgba(80,56,30,.8)";x.lineWidth=2;x.beginPath();x.moveTo(150,96);x.lineTo(170,150);x.lineTo(140,200);x.lineTo(166,262);x.stroke();
  x.fillStyle="#b39a70";x.beginPath();x.moveTo(236,270);x.lineTo(262,250);x.lineTo(272,290);x.closePath();x.fill()}],
 /* kapı üstü mühür yuvası ve mühür */
 yuva:[128,128,x=>{const g=x.createRadialGradient(64,64,10,64,64,60);g.addColorStop(0,"#3a2412");g.addColorStop(1,"#6a4224");x.fillStyle=g;x.beginPath();x.arc(64,64,56,0,7);x.fill();x.strokeStyle="#e0b866";x.lineWidth=6;x.stroke();x.strokeStyle="rgba(224,184,102,.5)";x.lineWidth=2;x.beginPath();x.arc(64,64,40,0,7);x.stroke()}],
 muhur:[128,128,x=>{const g=x.createRadialGradient(54,50,6,64,64,60);g.addColorStop(0,"#e07a5e");g.addColorStop(.6,"#a83a2a");g.addColorStop(1,"#7a2418");x.fillStyle=g;x.beginPath();for(let k=0;k<20;k++){const a=k*Math.PI/10,r=k%2?58:54;x.lineTo(64+r*Math.cos(a),64+r*Math.sin(a))}x.closePath();x.fill();
  yildizYol(x,64,64,34,22,8);x.fillStyle="rgba(255,220,180,.55)";x.fill();x.strokeStyle="rgba(90,20,10,.6)";x.lineWidth=2;x.stroke();isik(x,64,64,60,.15)}],
 kilitPlaka:[128,128,x=>{altin(x,24,40,80,70);x.strokeStyle="#6b4224";x.lineWidth=4;x.strokeRect(24,40,80,70);x.beginPath();x.arc(64,42,26,Math.PI,0);x.stroke();x.fillStyle="#3a2412";x.beginPath();x.arc(64,70,9,0,7);x.fill();x.fillRect(60,70,8,22)}],
 kadranKapi:[512,1024,x=>{x.scale(512/250,1024/470);ahsap(x,0,0,250,470,{c1:"#5f3a20",c2:"#7d5029"});x.fillStyle="#8f7650";x.fillRect(10,10,230,450);const g=x.createLinearGradient(0,0,250,0);g.addColorStop(0,"#9c8a6a");g.addColorStop(.5,"#c4b08a");g.addColorStop(1,"#9c8a6a");x.fillStyle=g;x.fillRect(16,16,218,438);
  for(let i=0;i<3;i++){const cy=110+i*125;x.fillStyle="#6b4224";x.beginPath();x.arc(125,cy,46,0,7);x.fill();altin(x,79,cy-3,92,6);x.strokeStyle="#e0b866";x.lineWidth=5;x.beginPath();x.arc(125,cy,46,0,7);x.stroke();x.fillStyle="#3a2412";x.beginPath();x.arc(125,cy,20,0,7);x.fill();
   for(let k=0;k<12;k++){const a=k*Math.PI/6;x.strokeStyle="#e0b866";x.lineWidth=2;x.beginPath();x.moveTo(125+36*Math.cos(a),cy+36*Math.sin(a));x.lineTo(125+44*Math.cos(a),cy+44*Math.sin(a));x.stroke()}}
  for(let i=0;i<14;i++){altin(x,20,20+i*32,6,6);altin(x,224,20+i*32,6,6)}}],
 isikIc:[256,512,x=>{const g=x.createRadialGradient(128,300,10,128,280,320);g.addColorStop(0,"#fffdf4");g.addColorStop(.5,"#ffeec6");g.addColorStop(1,"#f2c98a");x.fillStyle=g;x.fillRect(0,0,256,512)}]};
/* kapı dokuları V40.2 koridorundaki kapıyla aynı çizimden (tutarlı görünüm) */
const koridorDoku=ad=>{try{const U=V40.GL&&V40.GL.URET&&V40.GL.URET[ad];return U||null}catch(e){return null}};
K.dokuHazirla=function(r,adlar,q){adlar.forEach(ad=>{if(r.T[ad])return;let tanim=DOKU[ad]||koridorDoku(ad);if(!tanim){V41.uyar("doku tanımı yok: "+ad);return}const [w,h,fn]=tanim,c=CV(Math.round(w*q),Math.round(h*q)),x=c.getContext("2d");if(!x)throw new Error("2B çizim bağlamı yok");x.scale(q,q);x.save();fn(x);x.restore();G3.doku(r,ad,c);c.width=c.height=1})};

/* ---------- 4. Oda sahnesi (WebGL) ---------- */
const RX=460,FY=300,CY=-480,ZA=-760,ZO=420,KAMZ=250;
const ODA_DOKU=[["duvar_duzen","zemin_ahsap","hali","tavan"],["duvar_arsiv","zemin_ahsap","hali","tavan"],["duvar_yazit","zemin_tas","hali","tavan"]];
const yonKamera=(x,z)=>Math.atan2(x-0,z-KAMZ)+Math.PI; /* nesne yüzü kameranın başlangıç noktasına döner */
K.sahneKur=function(){const o=oda(),[duv,zem,hal,tav]=ODA_DOKU[D.oda],B={};const ek=(t,p,uv,l)=>G3.dort(B[t]||(B[t]=[]),p,uv,l);
 ek(zem,[-RX,FY,ZO, RX,FY,ZO, RX,FY,ZA, -RX,FY,ZA],[0,0,2*RX/600,(ZO-ZA)/600]);ek(tav,[-RX,CY,ZA, RX,CY,ZA, RX,CY,ZO, -RX,CY,ZO],[0,0,2*RX/600,(ZO-ZA)/600]);
 const H=FY-CY;ek(duv,[-RX,CY,ZO, -RX,CY,ZA, -RX,FY,ZA, -RX,FY,ZO],[0,0,(ZO-ZA)/400,H/800*1.0]);ek(duv,[RX,CY,ZA, RX,CY,ZO, RX,FY,ZO, RX,FY,ZA],[0,0,(ZO-ZA)/400,H/800]);
 ek(duv,[-RX,CY,ZA, RX,CY,ZA, RX,FY,ZA, -RX,FY,ZA],[-.15,0,2*RX/400-.15,H/800]);ek(duv,[RX,CY,ZO, -RX,CY,ZO, -RX,FY,ZO, RX,FY,ZO],[0,0,2*RX/400,H/800]);
 ek(hal,[-190,FY-1,140, 190,FY-1,140, 190,FY-1,-560, -190,FY-1,-560],[0,0,1,1]);
 /* nesneler */ o.nes.forEach(n=>{const a=yonKamera(n.x,n.z);n._q=G3.dikey(n.x,n.z,n.yer?FY-150:FY-2,n.w,n.h,a);ek(n.cizim,n._q,[0,0,1,1],1)});
 const b=o.bulmaca;if(b.nesne==="araba"){b._q=G3.dikey(0,-300,FY-2,260,150,0);ek("araba",b._q,[0,0,1,1],1)}
 if(b.nesne==="yazit"){b._q=G3.dikey(-RX+4,-420,FY-60,300,300,Math.PI/2);ek("yazitTasi",b._q,[0,0,1,1],1)}
 G3.statik(R,B)};
/* kapı: arka duvarın ortasında; kanatlar koridordaki gibi menteşeden açılır */
const KW=250,KH=470,KAR=125,KY=FY-KH-6;
const kapiE={O:[-KW/2,KY,ZA+1],ux:[1,0,0],n:[0,0,1]},W3=(lx,ly,lz)=>[kapiE.O[0]+lx,kapiE.O[1]+ly,kapiE.O[2]+lz];
const kare=(x0,y0,x1,y1,z)=>[].concat(W3(x0,y0,z),W3(x1,y0,z),W3(x1,y1,z),W3(x0,y1,z));
K.dinamik=function(){const o=oda(),A={},ek=(t,p,l,uv)=>G3.dort(A[t]||(A[t]=[]),p,uv||[0,0,1,1],l==null?1:l),aci=KAM.kapi*Math.PI/180,c=Math.cos(aci),s=Math.sin(aci),son=D.oda===2;
 ek(son?"isikIc":"ic",kare(0,KAR,KW,KH,1.5),1+.3*Math.min(1,KAM.kapi/60));
 if(son&&KAM.kapi<1)ek("kadranKapi",kare(0,0,KW,KH,4));
 else{const kn=(hx,yon)=>{const a=W3(hx,KAR,5),d=W3(hx,KH,5),ex=hx+yon*125*c,ez=5+125*s;ek(son?"kadranKapi":"kanat",[].concat(a,W3(ex,KAR,ez),W3(ex,KH,ez),d),1+.1*s,son?(yon>0?[0,.266,.5,1]:[1,.266,.5,1]):[0,0,1,1])};kn(0,1);kn(KW,-1);ek("kasa",kare(-40,-48,290,KH,16))}
 if(D.oda===0){const b=o.bulmaca,yer=(D.cozum.muhur&&D.cozum.muhur.yer)||{};b.ciftler.forEach((p,i)=>{const cx=30+i*63,cy=KAR+70,r=26;ek("yuva",kare(cx-r+1,cy-r,cx+r+1,cy+r,6.5));if(Object.values(yer).includes(p.id)&&KAM.kapi<5)ek("muhur",kare(cx-r+4,cy-r+3,cx+r-2,cy+r-3,7.5))})}
 if(D.oda===1&&!(D.cozum.raf&&D.cozum.raf.bitti))ek("kilitPlaka",kare(KW/2-30,KAR+120,KW/2+30,KAR+180,7));
 return Object.keys(A).map(t=>({t,v:A[t],k:.5}))};
const kamPoz=()=>({x:KAM.x,y:0,z:KAM.z,yaw:KAM.yaw,P:KAM.P,W:KAM.W,H:KAM.H,oy:.48,sis:.1});
K.olc=function(){const st=KOK&&KOK.querySelector(".o41-sahne");if(!st)return;const W=st.clientWidth||390,H=st.clientHeight||700,kal=V41.kalite(),dpr=Math.min(window.devicePixelRatio||1,kal==="sade"?1:kal==="dengeli"?1.5:2);KAM.W=W;KAM.H=H;KAM.P=Math.round(Math.max(H*.62,W*.52));
 if(R){const w=Math.round(W*dpr),h=Math.round(H*dpr);if(R.cv.width!==w||R.cv.height!==h){R.cv.width=w;R.cv.height=h}}};
K.ciz=function(){if(!KAM)return;K.olc();if(R)G3.ciz(R,kamPoz(),K.dinamik(),[.86,.76,.6]);K.dugmeler()};
/* nesne düğmelerini her karede çizimin üstüne yerleştir */
K.dugmeler=function(){const c=kamPoz(),liste=K._dugme||[];let sol=0,sag=0;liste.forEach(({el,q})=>{const k=q&&G3.kutu(c,q);if(!k||k.w<14){el.classList.add("gz");if(q&&(el.classList.contains("yeni")||(el.dataset.b&&!el.classList.contains("ok")&&!el.classList.contains("kilitli")))){const mx=(q[0]+q[3])/2,mz=(q[2]+q[5])/2,yw=Math.atan2(mx,-(mz-KAMZ))*180/Math.PI;if(yw<KAM.yaw)sol++;else sag++}return}el.classList.remove("gz");const s=el.style;s.zIndex=String(Math.max(1,Math.round(5000-k.d)));s.left=k.l.toFixed(1)+"px";s.top=k.t.toFixed(1)+"px";s.width=k.w.toFixed(1)+"px";s.height=k.h.toFixed(1)+"px"});
 /* ekran dışında incelenmemiş nesne varsa kenarda yön oku */ const ks=KOK&&KOK.querySelector(".o41-kenar.sol"),kg=KOK&&KOK.querySelector(".o41-kenar.sag");if(ks){ks.hidden=!sol||KAM.yaw<=-57;ks.setAttribute("aria-label",`Sola dön: ${sol} incelenecek nesne`)}if(kg){kg.hidden=!sag||KAM.yaw>=57;kg.setAttribute("aria-label",`Sağa dön: ${sag} incelenecek nesne`)}};
K.don=function(y){if(!KAM||KAM.anim)return;K.git({yaw:Math.max(-58,Math.min(58,KAM.yaw+y))},380)};
/* kamera animasyonu: hedef poza yumuşak geçiş */
K.git=function(h,ms,bitis){const a=Object.assign({},KAM),t0=performance.now(),d=V40.red&&V40.red()?1:ms;KAM.anim=1;
 V41.tik(function f(){const k=Math.min(1,(performance.now()-t0)/d),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;["x","z","yaw","kapi"].forEach(p=>{if(h[p]!=null)KAM[p]=a[p]+(h[p]-a[p])*e});K.ciz();if(k>=1){KAM.anim=0;if(bitis)setTimeout(bitis,0);return false}return true})};

/* ---------- 5. Ekran ---------- */
const sv=V41.svg;
K.baslat=function(kok,bid,o){K.temizle();KOK=kok;S=bid;IC=K.icerik(bid);if(!IC.tamam){kok.innerHTML=`<div class="o41-hata"><h2>Bölüm açılamadı</h2><p>${esc(IC.neden)}</p><button class="o41-b p" onclick="go('poyun')">Oyun merkezine dön</button></div>`;return}
 D=(o&&o.devam&&V41.bolumKayit(K.id,bid))||yeniDurum();if(!o||!o.devam){V41.bolumYaz(K.id,bid,D)}if(D.bitti&&o&&o.devam)D=yeniDurum();
 SAY=setInterval(()=>{if(!V41.durdu&&!document.hidden&&D&&!D.bitti&&D.giris){D.sure++;if(D.sure%5===0)kaydet()}},1000);
 if(!D.giris)K.giris();else K.odaAc()};
K.giris=function(){const B=K.BOL[S],u=Store.get("units",B.unite);KOK.innerHTML=`<div class="o41-giris"><div class="o41-gkapi" aria-hidden="true"><i></i></div><div class="o41-gkart">
 <p class="o41-ust">${B.sinif}. sınıf · ${esc(V39.pyName(B.program))} · Ünite: ${esc(u?u.title:"")}</p><h1>Kayıp Bilgeliğin Kütüphanesi</h1>
 <p>Yüzyıllardır kapalı duran bilgelik kütüphanesinin kapısı aralandı. Eşikteki yazıta göre kütüphanenin her kanadı bir ünitenin bilgisini saklıyor ve kanadın odaları birer kilitle korunuyor.</p>
 <p>Bu kanatta üç oda var. Her odada eşyaları incele, öğrendiklerini <b>Defter</b>'ine yaz ve odanın kilidini çöz. Takılırsan <b>İpucu</b> iste; ama her ipucu yıldızından biraz götürür.</p>
 <ol class="o41-odal">${IC.odalar.map((o,i)=>`<li><b>${i+1}. ${esc(o.ad)}</b><span>${esc(o.gorev)}</span></li>`).join("")}</ol>
 <details class="o41-kz"><summary>Bu bölümün kazanımları</summary><ul>${IC.kazanim.map(o=>`<li><code>${esc(o.code)}</code> ${esc(o.title)}</li>`).join("")}</ul>${IC.durum?`<p class="o41-mut">${esc(IC.durum)}</p>`:""}</details>
 <div class="o41-bb"><button class="o41-b p" onclick="V41.oyunlar.kutuphane.girisBitti()">${sv("oyna",18)} Kütüphaneye gir</button><button class="o41-b" onclick="go('poyun')">Oyun merkezi</button></div></div></div>`;
 setTimeout(()=>{const b=KOK&&KOK.querySelector(".o41-b.p");if(b)b.focus({preventScroll:true})},40)};
K.girisBitti=function(){D.giris=true;kaydet();K.odaAc()};
K.odaAc=function(){const o=oda();KAM={x:0,z:KAMZ,yaw:0,kapi:0,W:390,H:700,P:600};
 KOK.innerHTML=`<div class="o41-oyun-ekran"><section class="o41-sahne" id="o41s" tabindex="0" aria-roledescription="oyun sahnesi" aria-label="${esc(o.ad)}. Sağa-sola kaydırarak etrafına bak; nesnelere dokunarak incele.">
  <canvas class="o41-cv" aria-hidden="true"></canvas><div class="o41-nesler"></div><button class="o41-kenar sol" hidden onclick="V41.oyunlar.kutuphane.don(-40)">${sv("sol",26)}</button><button class="o41-kenar sag" hidden onclick="V41.oyunlar.kutuphane.don(40)">${sv("sag",26)}</button><i class="o41-perde" aria-hidden="true"></i></section>
  <header class="o41-hud"><button class="o41-ib" onclick="V41.duraklat('kullanici')" aria-label="Duraklat">${sv("dur",20)}</button><div class="o41-baslik"><small>Oda ${D.oda+1} / 3</small><b>${esc(o.ad)}</b></div>
   <span class="o41-puan" id="o41p" aria-live="polite"></span><button class="o41-ib" onclick="V41.oyunlar.kutuphane.defter()" aria-label="Defter">${sv("defter",20)}<i class="o41-rozet" id="o41d"></i></button></header>
  <div class="o41-gorev" id="o41g" aria-live="polite"></div>
  <nav class="o41-yol" aria-label="Bölüm ilerlemesi">${IC.odalar.map((x,i)=>`<i class="${i<D.oda?"ok":i===D.oda?"on":""}" title="${esc(x.ad)}"></i>`).join("")}</nav></div>`;
 const st=KOK.querySelector(".o41-sahne"),cv=st.querySelector("canvas"),kal=V41.kalite();
 try{if(!R||R.cv!==cv){G3.birak(R);R=G3.olustur(cv,kal)}K.dokuHazirla(R,["kasa","kanat","ic"].concat(ODA_DOKU[D.oda],oda().nes.map(n=>n.cizim),["araba","yazitTasi","yuva","muhur","kilitPlaka","kadranKapi","isikIc"]),kal==="sade"?.5:kal==="dengeli"?.75:1);K.sahneKur()}
 catch(e){V41.uyar("oda WebGL ile çizilemedi; basit görünüm kullanılıyor",e);G3.birak(R);R=null;st.classList.add("basit")}
 K.dugmeKur();K.etkilesim(st);K.gorevYaz();K.ciz();addEventListener("resize",K._rz=()=>{clearTimeout(K._rzt);K._rzt=setTimeout(()=>K.ciz(),120)});
 const gel=KOK.querySelector(".o41-perde");if(K._gecis){gel.classList.add("on","an0");requestAnimationFrame(()=>requestAnimationFrame(()=>{gel.classList.remove("an0","on")}));K._gecis=0}
 if(o.bulmaca.tur==="muhur"&&D.cozum.muhur&&D.cozum.muhur.bitti||K.odaBitti())K.kapiAcikGoster()};
K.odaBitti=()=>{const o=oda();return o.bulmaca2?!!(D.cozum.kadran&&D.cozum.kadran.bitti):!!(D.cozum[o.bulmaca.tur]&&D.cozum[o.bulmaca.tur].bitti)};
K.kapiAcikGoster=function(){KAM.kapi=102;K.ciz()};
/* nesne düğmeleri */
K.dugmeKur=function(){const o=oda(),k=KOK.querySelector(".o41-nesler"),L=[];let h="";
 o.nes.forEach(n=>{const ok=!!D.kesif[o.id+":"+n.id];h+=`<button class="o41-nes ${ok?"ok":"yeni"}" data-n="${n.id}" aria-label="${esc(n.ad)}${ok?" (incelendi)":" — incele"}"><span>${esc(n.ad)}</span></button>`});
 const b=o.bulmaca;h+=`<button class="o41-nes bul" data-b="1" aria-label="${esc(b.ad)} — bulmaca"><span>${esc(b.ad)}</span></button>`;
 h+=`<button class="o41-nes kapi" data-k="1" aria-label="${o.bulmaca2?esc(o.bulmaca2.ad):"Kapı"}"><span>${o.bulmaca2?esc(o.bulmaca2.ad):"Kapı"}</span></button>`;
 k.innerHTML=h;k.querySelectorAll(".o41-nes").forEach(el=>{let q=null;if(el.dataset.n){const n=o.nes.find(x=>x.id===el.dataset.n);q=n._q}else if(el.dataset.b)q=b.nesne==="kapi"?kare(-40,-48,290,KH,16):b._q;else q=kare(-40,-48,290,KH,16);L.push({el,q});el.addEventListener("click",()=>K.dokun(el))});
 if(b.nesne==="kapi"){k.querySelector('[data-k="1"]').remove();L.splice(L.findIndex(x=>x.el.dataset.k),1)}
 K._dugme=L;K.durumGuncelle()};
K.durumGuncelle=function(){const o=oda(),sayi=kesifSay(o),kilitli=sayi<o.esik,b=o.bulmaca,bb=D.cozum[b.tur]&&D.cozum[b.tur].bitti;
 (K._dugme||[]).forEach(({el})=>{if(el.dataset.b){el.classList.toggle("kilitli",kilitli);el.classList.toggle("ok",!!bb);el.setAttribute("aria-label",`${b.ad} — ${bb?"çözüldü":kilitli?`önce odayı incele (${sayi}/${o.esik})`:"bulmaca"}`)}
  if(el.dataset.k){const b2=o.bulmaca2,k2=b2&&!bb;el.classList.toggle("kilitli",!!k2);el.classList.toggle("ok",K.odaBitti())}});
 const d=document.getElementById("o41d");if(d){const n=Object.keys(D.kesif).length;d.textContent=n||"";d.hidden=!n}K.puanYaz()};
K.puanYaz=function(){const p=document.getElementById("o41p");if(!p)return;const top=Object.values(D.puan).reduce((a,x)=>a+x,0),y=Object.values(D.yildiz).reduce((a,x)=>a+x,0);p.innerHTML=`${sv("yildiz",14)} ${y} · ${top} puan`};
K.gorevYaz=function(){const g=document.getElementById("o41g");if(!g)return;const o=oda(),sayi=kesifSay(o),b=o.bulmaca,bb=D.cozum[b.tur]&&D.cozum[b.tur].bitti;let m;
 if(K.odaBitti())m=D.oda<2?"Kapı açıldı. Sonraki odaya geçmek için kapıya dokun.":"Şifreli kapı açıldı. Bilgelik odasına gir.";
 else if(sayi<o.esik)m=`Görev: Odayı incele — parlayan nesnelere dokun (${sayi}/${o.esik}).`;else if(!bb)m=`Görev: ${b.ad} (${o.gorev})`;else m=`Görev: ${o.bulmaca2.ad} — kadranları doğru konuma getir.`;
 g.innerHTML=`<span>${esc(m)}</span><small>${sayi}/${o.nes.length} nesne incelendi</small>`};
/* sahne etkileşimi: yatay sürükleme etrafa bakar, ok tuşları da */
K.etkilesim=function(st){let d=null;st.addEventListener("pointerdown",e=>{if(e.button>0||e.target.closest(".o41-nes"))return;d={x:e.clientX,y0:KAM.yaw,id:e.pointerId,m:false}});
 st.addEventListener("pointermove",e=>{if(!d||e.pointerId!==d.id||KAM.anim)return;const dx=e.clientX-d.x;if(!d.m&&Math.abs(dx)<8)return;d.m=true;try{st.setPointerCapture(e.pointerId)}catch(_){}KAM.yaw=Math.max(-58,Math.min(58,d.y0-dx*.16));KAM.x=0;K.ciz()});
 const bit=e=>{if(d&&e.pointerId===d.id)d=null};st.addEventListener("pointerup",bit);st.addEventListener("pointercancel",bit);
 st.addEventListener("keydown",e=>{if(e.target!==st)return;if(e.key==="ArrowLeft"){K.git({yaw:Math.max(-58,KAM.yaw-20)},260);e.preventDefault()}else if(e.key==="ArrowRight"){K.git({yaw:Math.min(58,KAM.yaw+20)},260);e.preventDefault()}})};
/* nesneye dokun: kamera döner ve yaklaşır, sonra panel açılır */
K.bak=function(q,yakin,f){if(!q){f();return}const mx=(q[0]+q[3])/2,mz=(q[2]+q[5])/2,ya=Math.atan2(mx,-(mz-KAMZ))*180/Math.PI,yaw=Math.max(-62,Math.min(62,ya)),dz=yakin?Math.max(-120,Math.min(KAMZ,mz+380)):KAMZ;K.git({yaw,z:dz,x:0},420,f)};
K.geriDon=function(){if(!KAM)return;K.git({yaw:0,z:KAMZ,x:0},380)};
K.dokun=function(el){if(KAM.anim||document.querySelector(".o41-panel"))return;const o=oda(),q=(K._dugme.find(x=>x.el===el)||{}).q;
 if(el.dataset.n){const n=o.nes.find(x=>x.id===el.dataset.n);K.bak(q,true,()=>K.incele(n));return}
 if(el.dataset.b){const sayi=kesifSay(o);if(sayi<o.esik){K.bilgi(`${o.bulmaca.ad} henüz kullanılamıyor`,`Önce odadaki nesneleri incele ve Defter'ine ipucu topla (${sayi}/${o.esik}). Parlayan nesnelere dokun.`);return}
  if(K.odaBitti()&&o.bulmaca.nesne==="kapi"){K.sonrakiOda();return}if(D.cozum[o.bulmaca.tur]&&D.cozum[o.bulmaca.tur].bitti){K.bilgi(o.bulmaca.ad,"Bu bulmacayı çözdün.");return}K.bak(q,true,()=>K.bulmacaAc(o.bulmaca));return}
 if(el.dataset.k){if(K.odaBitti()){K.sonrakiOda();return}if(o.bulmaca2){if(!(D.cozum[o.bulmaca.tur]&&D.cozum[o.bulmaca.tur].bitti)){K.bilgi(o.bulmaca2.ad,`Kadranlar karanlık. Önce “${o.bulmaca.ad}” bulmacasını çöz.`);return}K.bak(q,true,()=>K.bulmacaAc(o.bulmaca2));return}
  K.bilgi("Kapı kilitli",`Kapının kilidi “${o.bulmaca.ad}” bulmacası çözülünce açılır.`)}};
K.incele=function(n){const o=oda(),k=o.id+":"+n.id,yeni=!D.kesif[k];D.kesif[k]={b:n.not.b,m:n.not.m,k:n.not.k,o:o.ad};kaydet();
 K.panel(`<div class="o41-incele"><p class="o41-ust">${esc(n.ad)}${yeni?" · Defter'e yazıldı":""}</p><h2>${esc(n.not.b)}</h2><p class="o41-metin">${esc(n.not.m)}</p><p class="o41-kay">${sv("kitap",14)} Kaynak: ${esc(n.not.k)}</p>
  <div class="o41-bb"><button class="o41-b p" data-kapat>Tamam</button></div></div>`,()=>{const el=KOK.querySelector(`[data-n="${n.id}"]`);if(el){el.classList.remove("yeni");el.classList.add("ok")}K.durumGuncelle();K.gorevYaz();K.geriDon()})};
K.bilgi=function(b,m){K.panel(`<div class="o41-incele"><h2>${esc(b)}</h2><p class="o41-metin">${esc(m)}</p><div class="o41-bb"><button class="o41-b p" data-kapat>Tamam</button></div></div>`)};
K.panel=function(html,kapaninca,sinif){K.panelKapat(true);const p=document.createElement("div");p.className="o41-panel "+(sinif||"");p.setAttribute("role","dialog");p.setAttribute("aria-modal","true");p.innerHTML=`<div class="o41-pk">${html}</div>`;KOK.querySelector(".o41-oyun-ekran").appendChild(p);
 K._kap=kapaninca||null;p.addEventListener("click",e=>{if(e.target.closest("[data-kapat]"))K.panelKapat()});p.addEventListener("keydown",e=>{if(e.key==="Escape"){K.panelKapat();e.stopPropagation()}});setTimeout(()=>{const h=p.querySelector("h2");if(h){h.tabIndex=-1;h.focus({preventScroll:true})}},40);return p};
K.panelKapat=function(sessiz){const p=KOK&&KOK.querySelector(".o41-panel");if(p)p.remove();const f=K._kap;K._kap=null;if(f&&!sessiz)f();else if(!sessiz)K.geriDon();const st=KOK&&KOK.querySelector(".o41-sahne");if(st&&!sessiz)st.focus({preventScroll:true})};
K.defter=function(){const E=Object.entries(D.kesif);K.panel(`<div class="o41-defter"><h2>${sv("defter",20)} Defter</h2>${E.length?IC.odalar.map(o=>{const L=E.filter(([k])=>k.startsWith(o.id+":"));return L.length?`<h3>${esc(o.ad)}</h3>${L.map(([k,v])=>`<article><b>${esc(v.b)}</b><p>${esc(v.m)}</p><small>${esc(v.k)}</small></article>`).join("")}`:""}).join(""):`<p class="o41-mut">Defterin boş. Odadaki parlayan nesnelere dokunarak ipucu topla.</p>`}
 <div class="o41-bb"><button class="o41-b p" data-kapat>Kapat</button></div></div>`,null,"genis")};

/* ---------- 6. Bulmacalar ---------- */
const cozum=t=>D.cozum[t]||(D.cozum[t]={yer:{},hata:0,ipucu:0,bitti:false});
/* sürükle-bırak + dokun-seç: kaynak ve hedefler düğmedir (klavye ile de çalışır) */
const surukle=function(kok,kaySel,hedSel,birak){let sec=null,d=null,hayalet=null,bastir=false;
 const temizSec=()=>{if(sec)sec.classList.remove("sec");sec=null;kok.classList.remove("secili")};
 kok.addEventListener("click",e=>{if(bastir){bastir=false;return}const k=e.target.closest(kaySel),h=e.target.closest(hedSel);if(k&&!k.disabled){if(sec===k){temizSec();return}temizSec();sec=k;k.classList.add("sec");kok.classList.add("secili");return}if(h&&sec){const s=sec;temizSec();birak(s,h)}});
 kok.addEventListener("pointerdown",e=>{const k=e.target.closest(kaySel);if(!k||k.disabled||e.button>0)return;d={k,x:e.clientX,y:e.clientY,id:e.pointerId,m:false}});
 kok.addEventListener("pointermove",e=>{if(!d||e.pointerId!==d.id)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.m){if(Math.hypot(dx,dy)<8)return;d.m=true;temizSec();const r=d.k.getBoundingClientRect();hayalet=d.k.cloneNode(true);hayalet.classList.add("o41-hayalet");hayalet.style.width=r.width+"px";hayalet.style.left=r.left+"px";hayalet.style.top=r.top+"px";d.ox=e.clientX-r.left;d.oy=e.clientY-r.top;document.body.appendChild(hayalet);d.k.classList.add("tasiniyor");try{kok.setPointerCapture(e.pointerId)}catch(_){}}
  hayalet.style.left=(e.clientX-d.ox)+"px";hayalet.style.top=(e.clientY-d.oy)+"px";e.preventDefault();
  /* hedef görünmüyorsa: parmak panelin üst/alt kenarında durdukça panel kayar */ const pk=kok.closest(".o41-pk");if(pk){const r=pk.getBoundingClientRect(),v=e.clientY<r.top+70?-12:e.clientY>r.bottom-70?12:0;clearInterval(d.kay);if(v)d.kay=setInterval(()=>{pk.scrollTop+=v},30)}});
 const bit=e=>{if(!d||e.pointerId!==d.id)return;const dd=d;d=null;clearInterval(dd.kay);if(!dd.m)return;bastir=true;setTimeout(()=>bastir=false,50);if(hayalet){hayalet.remove();hayalet=null}dd.k.classList.remove("tasiniyor");const el=document.elementFromPoint(e.clientX,e.clientY),h=el&&el.closest(hedSel);if(h&&kok.contains(h))birak(dd.k,h)};
 kok.addEventListener("pointerup",bit);kok.addEventListener("pointercancel",e=>{if(hayalet){hayalet.remove();hayalet=null}if(d){clearInterval(d.kay);d.k.classList.remove("tasiniyor")}d=null})};
const geriBildirim=(p,tur,b,m)=>{const g=p.querySelector(".o41-gb");if(!g)return;g.className="o41-gb "+tur;g.innerHTML=`<b>${esc(b)}</b>${m?`<p>${esc(m)}</p>`:""}`;g.hidden=false;if(tur!=="iyi")try{g.scrollIntoView({block:"nearest",behavior:V40.red&&V40.red()?"auto":"smooth"})}catch(e){}};
const sars=el=>{el.classList.remove("sars");void el.offsetWidth;el.classList.add("sars")};
const ipucuSatiri=(c,tur)=>`<div class="o41-ipucu"><button class="o41-b" data-ipucu ${c.ipucu>=3?"disabled":""}>${sv("ipucu",18)} İpucu (${3-Math.min(3,c.ipucu)} kaldı)</button><span class="o41-mut">Her ipucu −15 puan · her hata −10 puan</span></div>`;
K.bulmacaAc=function(b){({muhur:K.muhur,raf:K.raf,yazit:K.yazit,kadran:K.kadran})[b.tur](b)};
K.bulmacaBitti=function(tur,p){const c=cozum(tur);c.bitti=true;c.puan=bulmacaPuan(c);const o=oda(),turler=[o.bulmaca.tur].concat(o.bulmaca2?[o.bulmaca2.tur]:[]);
 if(turler.every(t=>D.cozum[t]&&D.cozum[t].bitti)){const pu=Math.round(turler.reduce((a,t)=>a+D.cozum[t].puan,0)/turler.length);D.puan[D.oda]=turler.reduce((a,t)=>a+D.cozum[t].puan,0);D.yildiz[D.oda]=yildizHesap(pu)}kaydet();
 const y=K.odaBitti()?D.yildiz[D.oda]:0;setTimeout(()=>{K.panelKapat(true);K.durumGuncelle();K.gorevYaz();
  if(K.odaBitti()){K.kapiAc(y)}else{K.geriDon();K.bilgi(`${o.bulmaca.ad} çözüldü`,`+${c.puan} puan. Şimdi “${o.bulmaca2.ad}” seni bekliyor.`)}},p?900:0)};
K.kapiAc=function(y){K.git({yaw:0,z:KAMZ-60,x:0},420,()=>K.git({kapi:102},900,()=>{K.durumGuncelle();K.gorevYaz();const o=oda();
 K.panel(`<div class="o41-incele o41-odason"><p class="o41-ust">${esc(o.ad)} tamamlandı</p><h2>Kapı açıldı</h2><div class="o41-yildizlar" aria-label="${y} / 3 yıldız">${[1,2,3].map(i=>`<i class="${i<=y?"on":""}">${sv("yildiz",34)}</i>`).join("")}</div>
  <p>${D.puan[D.oda]} puan · ${["muhur","raf","yazit","kadran"].filter(t=>o.bulmaca.tur===t||(o.bulmaca2&&o.bulmaca2.tur===t)).map(t=>`${D.cozum[t].hata} hata, ${D.cozum[t].ipucu} ipucu`).join(" · ")}</p>
  <div class="o41-bb"><button class="o41-b p" data-ileri>${D.oda<2?"Sonraki odaya geç":"Bilgelik odasına gir"}</button><button class="o41-b" data-kapat>Odada kal</button></div></div>`,()=>{});
 const p=KOK.querySelector(".o41-panel");p.querySelector("[data-ileri]").addEventListener("click",()=>{K.panelKapat(true);K.sonrakiOda()})}))};
K.sonrakiOda=function(){if(KAM.anim)return;const pd=KOK.querySelector(".o41-perde");K.git({kapi:102,yaw:0,x:0},200,()=>{K.git({z:ZA+40},900);setTimeout(()=>{if(pd)pd.classList.add("on")},450)});
 setTimeout(()=>{if(!D)return;if(D.oda<2){D.oda++;kaydet();K._gecis=1;K.odaAc()}else{D.bitti=true;D.bitis=new Date().toISOString();kaydet();K.sonEkran()}},1250)};

/* 6a. Mühürlü kapı: her mühür (alan) doğru “düzenin işareti” yuvasına */
K.muhur=function(b){const c=cozum("muhur"),sira=c.sira||(c.sira=V41.kar(b.ciftler.map(x=>x.id))),ys=c.ysira||(c.ysira=V41.kar(b.ciftler.map(x=>x.id)));kaydet();
 const yerlesen=id=>Object.values(c.yer).includes(id);
 const p=K.panel(`<div class="o41-bul o41-muhur"><p class="o41-ust">Bulmaca · ${esc(oda().ad)}</p><h2>${esc(b.ad)}</h2><p>Kapıda dört yuva var. Her yuvada “düzenin işareti” yazıyor. Her mührü, gösterdiği alanın işaretine yerleştir. Sürükle ya da önce mühre, sonra yuvaya dokun.</p>
  <div class="o41-yuvalar">${ys.map(id=>{const x=b.ciftler.find(q=>q.id===id),dolu=c.yer[id];return `<button class="o41-yuva ${dolu?"dolu":""}" data-y="${esc(id)}" ${dolu?"disabled":""} aria-label="Yuva: ${esc(x.sag)}${dolu?" — dolu":""}"><span class="o41-ym">${dolu?`<i class="o41-mh yer">${esc(dolu)}</i>`:"<i class='bos'></i>"}</span><span>${esc(x.sag)}</span></button>`}).join("")}</div>
  <div class="o41-muhurler" aria-label="Mühürler">${sira.filter(id=>!yerlesen(id)).map(id=>`<button class="o41-mh" data-m="${esc(id)}" aria-label="Mühür: ${esc(id)}">${esc(id)}</button>`).join("")}</div>
  <div class="o41-gb" hidden aria-live="polite"></div>${ipucuSatiri(c)}<p class="o41-kay">${sv("kitap",14)} Kaynak: ${esc(b.kaynak)}</p><div class="o41-bb"><button class="o41-b" data-kapat>Bulmacayı kapat</button></div></div>`,null,"genis");
 const yerlestir=(mid,yid)=>{c.yer[yid]=mid;const y=p.querySelector(`[data-y="${CSS.escape(yid)}"]`);y.classList.add("dolu");y.disabled=true;y.querySelector(".o41-ym").innerHTML=`<i class="o41-mh yer">${esc(mid)}</i>`;const m=p.querySelector(`[data-m="${CSS.escape(mid)}"]`);if(m)m.remove();K.ciz()};
 surukle(p.querySelector(".o41-muhur"),".o41-mh[data-m]",".o41-yuva:not(.dolu)",(mEl,yEl)=>{const mid=mEl.dataset.m,yid=yEl.dataset.y,dogru=mid===yid,x=b.ciftler.find(q=>q.id===mid),hedef=b.ciftler.find(q=>q.id===yid);
  ilkDeneme("muhur:"+mid,b.kz,dogru);if(dogru){yerlestir(mid,yid);geriBildirim(p,"iyi","Doğru yuva!",`${x.sol}: ${x.gozlem} → ${x.sag}.`)}
  else{c.hata++;sars(mEl);sars(yEl);geriBildirim(p,"yanlis",`Bu mühür bu yuvaya ait değil.`,`“${hedef.sag}” işareti ${hedef.sol} alanına aittir (gözlem: ${hedef.gozlem}). ${x.sol} alanında ise şunu gözlemleriz: ${x.gozlem}.`)}
  kaydet();if(Object.keys(c.yer).length===b.ciftler.length)K.bulmacaBitti("muhur",p)});
 p.querySelector("[data-ipucu]").addEventListener("click",function(){if(c.ipucu>=3)return;c.ipucu++;const kalan=b.ciftler.filter(x=>!c.yer[x.id]);if(!kalan.length)return;const x=kalan[0];
  if(c.ipucu===1)geriBildirim(p,"ipucu","İpucu 1",`Defterine bak: ${x.sol} alanında “${x.gozlem}” gözlenir. Bu gözlem hangi düzen işaretine uyar?`);
  else if(c.ipucu===2){yerlestir(x.id,x.id);geriBildirim(p,"ipucu","İpucu 2",`“${x.sol}” mührünü senin için yerine koydum.`);if(Object.keys(c.yer).length===b.ciftler.length){kaydet();K.bulmacaBitti("muhur",p);return}}
  else geriBildirim(p,"ipucu","İpucu 3 · Kaynak tablo",b.tablo.rows.map(r=>`${r[0]} — ${r[1]} — ${r[2]}`).join(" | "));
  this.innerHTML=`${sv("ipucu",18)} İpucu (${3-c.ipucu} kaldı)`;this.disabled=c.ipucu>=3;kaydet()})};

/* 6b. Raf düzeni: kitapları isim raflarına */
K.raf=function(b){const c=cozum("raf"),sira=c.sira||(c.sira=V41.kar(b.kitaplar.map(x=>x.id)));kaydet();
 const rafHTML=r=>`<button class="o41-raf" data-r="${esc(r)}" aria-label="${esc(r)} rafı"><span class="o41-rl">${esc(r)}</span><span class="o41-rk">${b.kitaplar.filter(k=>c.yer[k.id]===r).map(k=>`<i class="o41-sirt" title="${esc(k.metin)}"></i>`).join("")}</span></button>`;
 const p=K.panel(`<div class="o41-bul o41-arsiv"><p class="o41-ust">Bulmaca · ${esc(oda().ad)}</p><h2>${esc(b.ad)}</h2><p>Her kitabın sırtında bir anlam ya da durum yazıyor. Kitabı, ilgili ismin rafına yerleştir.</p>
  <div class="o41-raflar">${b.raflar.map(rafHTML).join("")}</div><div class="o41-kitaplar" aria-label="Kitap arabası">${sira.filter(id=>!c.yer[id]).map(id=>{const k=b.kitaplar.find(x=>x.id===id);return `<button class="o41-kt" data-k="${id}">${esc(k.metin)}</button>`}).join("")}</div>
  <div class="o41-gb" hidden aria-live="polite"></div>${ipucuSatiri(c)}<p class="o41-kay">${sv("kitap",14)} Kaynak: ${esc(b.kaynak)}</p><div class="o41-bb"><button class="o41-b" data-kapat>Bulmacayı kapat</button></div></div>`,null,"genis");
 const koy=(kid,r)=>{c.yer[kid]=r;const el=p.querySelector(`[data-k="${kid}"]`);if(el)el.remove();const rf=p.querySelector(`[data-r="${CSS.escape(r)}"]`);rf.outerHTML=rafHTML(r);const yeni=p.querySelector(`[data-r="${CSS.escape(r)}"]`);yeni.classList.add("parla")};
 surukle(p.querySelector(".o41-arsiv"),".o41-kt",".o41-raf",(kEl,rEl)=>{const k=b.kitaplar.find(x=>x.id===kEl.dataset.k),r=rEl.dataset.r,dogru=k.raf===r;ilkDeneme("raf:"+k.id,b.kz,dogru);
  if(dogru){koy(k.id,r);geriBildirim(p,"iyi","Doğru raf!",`${r}: ${b.anlam[r]||""}`)}else{c.hata++;sars(kEl);sars(rEl);geriBildirim(p,"yanlis",`Bu kitap ${r} rafına ait değil.`,`${r}: ${b.anlam[r]||"Kaynakta veri bulunmuyor."} Bu kitap ise ${k.raf} ismiyle ilgilidir: ${b.anlam[k.raf]||""}`)}
  kaydet();if(Object.keys(c.yer).length===b.kitaplar.length)K.bulmacaBitti("raf",p)});
 p.querySelector("[data-ipucu]").addEventListener("click",function(){if(c.ipucu>=3)return;c.ipucu++;const kalan=b.kitaplar.filter(x=>!c.yer[x.id]);if(!kalan.length)return;const k=kalan[0];
  if(c.ipucu===1)geriBildirim(p,"ipucu","İpucu 1",`“${k.metin}” — Defterindeki isim levhalarına bak: bu, ${b.raflar.map(r=>`${r} (${b.anlam[r]||"?"})`).join(", ")} isimlerinden hangisiyle ilgili?`);
  else if(c.ipucu===2){koy(k.id,k.raf);geriBildirim(p,"ipucu","İpucu 2",`“${k.metin}” kitabını ${k.raf} rafına koydum.`);if(Object.keys(c.yer).length===b.kitaplar.length){kaydet();K.bulmacaBitti("raf",p);return}}
  else geriBildirim(p,"ipucu","İpucu 3 · Kaynak tablo",b.tablo.rows.map(r=>`${r[0]}: ${r[1]} (${r[2]})`).join(" | "));
  this.innerHTML=`${sv("ipucu",18)} İpucu (${3-c.ipucu} kaldı)`;this.disabled=c.ipucu>=3;kaydet()})};

/* 6c. Kırık yazıt: eksik taşı yerine koy */
K.yazit=function(b){const c=cozum("yazit");c.i=c.i||0;c.ele=c.ele||{};kaydet();
 const ciz=()=>{const x=b.cumleler[c.i];if(!x){K.bulmacaBitti("yazit",p);return}const sec=V41.kar(x.secenek).filter(s=>!(c.ele[x.id]||[]).includes(s));
  p.querySelector(".o41-tablet").innerHTML=`<p class="o41-ust">Satır ${c.i+1} / ${b.cumleler.length}</p><p class="o41-satir">${esc(x.metin).replace("_____",`<button class="o41-bosluk" data-h="1" aria-label="Boşluk">?</button>`)}</p>`;
  p.querySelector(".o41-taslar").innerHTML=sec.map(s=>`<button class="o41-tas" data-t="${esc(s)}">${esc(s)}</button>`).join("")};
 const p=K.panel(`<div class="o41-bul o41-yazit"><p class="o41-ust">Bulmaca · ${esc(oda().ad)}</p><h2>${esc(b.ad)}</h2><p>Yazıtın taşları dökülmüş. Her satırdaki boşluğa doğru taşı yerleştir.</p>
  <div class="o41-tablet"></div><div class="o41-taslar" aria-label="Taşlar"></div><div class="o41-gb" hidden aria-live="polite"></div>${ipucuSatiri(c)}<p class="o41-kay">${sv("kitap",14)} Kaynak: ${esc(b.kaynak)}</p><div class="o41-bb"><button class="o41-b" data-kapat>Bulmacayı kapat</button></div></div>`,null,"genis");
 const ilerle=x=>{c.i++;kaydet();geriBildirim(p,"iyi","Satır tamamlandı!",x.tam);setTimeout(()=>{if(document.body.contains(p))ciz()},c.i<b.cumleler.length?1100:600)};
 surukle(p.querySelector(".o41-yazit"),".o41-tas",".o41-bosluk",(tEl)=>{const x=b.cumleler[c.i];if(!x)return;const s=tEl.dataset.t,dogru=s===x.cevap;ilkDeneme("yazit:"+x.id,b.kz,dogru);
  if(dogru){const h=p.querySelector(".o41-bosluk");h.textContent=s;h.classList.add("dolu");h.disabled=true;p.querySelectorAll(".o41-tas").forEach(t=>t.disabled=true);ilerle(x)}
  else{c.hata++;sars(tEl);(c.ele[x.id]=c.ele[x.id]||[]).push(s);tEl.disabled=true;tEl.classList.add("elendi");geriBildirim(p,"yanlis",`“${s}” bu boşluğa uymuyor.`,`Cümleyi baştan oku ve Defter'indeki “${(oda().nes[0]||{}).ad||"levha"}” notuna bak. Bu satır şu kaynaktan: ${b.kaynak.split(" · Klasik")[0]}.`)}
  kaydet()});
 p.querySelector("[data-ipucu]").addEventListener("click",function(){if(c.ipucu>=3)return;const x=b.cumleler[c.i];if(!x)return;c.ipucu++;
  if(c.ipucu===1){const n=Object.values(D.kesif).find(v=>v.o===oda().ad&&/evren|kâinat/i.test(v.m));geriBildirim(p,"ipucu","İpucu 1",n?`Defterindeki “${n.b}” notu: ${n.m}`:"Odadaki “Evren levhası”nı incele; cümlelerin cevabı orada.")}
  else if(c.ipucu===2){const yanlis=x.secenek.filter(s=>s!==x.cevap&&!(c.ele[x.id]||[]).includes(s)).slice(0,2);(c.ele[x.id]=c.ele[x.id]||[]).push(...yanlis);ciz();geriBildirim(p,"ipucu","İpucu 2","İki yanlış taşı kaldırdım.")}
  else{const h=p.querySelector(".o41-bosluk");ilkDeneme("yazit:"+x.id,b.kz,false);if(h){h.textContent=x.cevap;h.classList.add("dolu")}geriBildirim(p,"ipucu","İpucu 3",`Doğru taş: “${x.cevap}”.`);ilerle(x)}
  this.innerHTML=`${sv("ipucu",18)} İpucu (${3-c.ipucu} kaldı)`;this.disabled=c.ipucu>=3;kaydet()});
 ciz()};

/* 6d. Şifreli kapı: üç kadran, her biri bir soru; doğru konuma çevrilen kadran kilitlenir */
K.kadran=function(b){const c=cozum("kadran");if(!c.sira){c.sira=b.sorular.map(q=>V41.kar(q.secenek.map((_,k)=>k)));c.deger=b.sorular.map((q,i)=>c.sira[i].find(k=>k!==q.cevap));c.kilit=b.sorular.map(()=>false);c.ele=b.sorular.map(()=>[])}kaydet();
 const p=K.panel(`<div class="o41-bul o41-kasa"><p class="o41-ust">Bulmaca · ${esc(oda().ad)}</p><h2>${esc(b.ad)}</h2><p>Kapıda üç kadran var. Her kadranı oklarla çevirip doğru yanıta getir, sonra “Kilidi çevir”e bas.</p>
  <div class="o41-kadranlar">${b.sorular.map((q,i)=>`<section class="o41-kd" data-i="${i}"><h3>${i+1}. kadran</h3><p class="o41-soru">${esc(q.metin)}</p><div class="o41-cevir"><button class="o41-ok" data-y="-1" aria-label="Önceki seçenek">${sv("sol",20)}</button><output class="o41-pen" aria-live="polite"></output><button class="o41-ok" data-y="1" aria-label="Sonraki seçenek">${sv("sag",20)}</button></div></section>`).join("")}</div>
  <div class="o41-gb" hidden aria-live="polite"></div><div class="o41-bb"><button class="o41-b p" data-cevir>${sv("acik",18)} Kilidi çevir</button></div>${ipucuSatiri(c)}<p class="o41-kay">${sv("kitap",14)} Kaynak: ${esc(b.kaynak)}</p><div class="o41-bb"><button class="o41-b" data-kapat>Bulmacayı kapat</button></div></div>`,null,"genis");
 const goster=()=>{b.sorular.forEach((q,i)=>{const s=p.querySelector(`.o41-kd[data-i="${i}"]`),v=c.deger[i];s.classList.toggle("kilit",c.kilit[i]);s.querySelector(".o41-pen").textContent=q.secenek[v];s.querySelectorAll(".o41-ok").forEach(o=>o.disabled=c.kilit[i]);s.querySelector(".o41-pen").classList.toggle("elendi",c.ele[i].includes(v))})};
 p.querySelectorAll(".o41-kd").forEach(s=>s.addEventListener("click",e=>{const o=e.target.closest(".o41-ok");if(!o)return;const i=+s.dataset.i,sr=c.sira[i],n=sr.length;let j=sr.indexOf(c.deger[i]);for(let t=0;t<n;t++){j=(j+(+o.dataset.y)+n)%n;if(!c.ele[i].includes(sr[j]))break}c.deger[i]=sr[j];goster();kaydet()}));
 p.querySelector("[data-cevir]").addEventListener("click",()=>{const yanlis=[];b.sorular.forEach((q,i)=>{if(c.kilit[i])return;const dogru=c.deger[i]===q.cevap;ilkDeneme("kadran:"+q.id,q.kz,dogru);if(dogru)c.kilit[i]=true;else yanlis.push(i)});
  if(!yanlis.length){goster();geriBildirim(p,"iyi","Kilit döndü!","Üç kadran da doğru konumda.");kaydet();K.bulmacaBitti("kadran",p);return}
  c.hata+=yanlis.length;goster();yanlis.forEach(i=>sars(p.querySelector(`.o41-kd[data-i="${i}"]`)));const i=yanlis[0],q=b.sorular[i];
  geriBildirim(p,"yanlis",`${yanlis.length} kadran yanlış konumda (${yanlis.map(x=>x+1).join(", ")}).`,`${i+1}. kadran — “${q.secenek[c.deger[i]]}”: ${q.not[c.deger[i]]||"Bu seçenek doğru değil."}`);kaydet()});
 p.querySelector("[data-ipucu]").addEventListener("click",function(){if(c.ipucu>=3)return;const i=c.kilit.findIndex(x=>!x);if(i<0)return;const q=b.sorular[i];c.ipucu++;
  if(c.ipucu===1){const n=Object.values(D.kesif).filter(v=>v.o===oda().ad);geriBildirim(p,"ipucu","İpucu 1",`${i+1}. kadran için Defter'indeki notlara bak: ${n.map(v=>v.b).join(", ")||"önce odadaki levhaları incele"}.`)}
  else if(c.ipucu===2){const y=q.secenek.map((_,k)=>k).filter(k=>k!==q.cevap&&!c.ele[i].includes(k)).slice(0,2);c.ele[i].push(...y);if(c.ele[i].includes(c.deger[i]))c.deger[i]=q.cevap===c.deger[i]?c.deger[i]:q.secenek.map((_,k)=>k).find(k=>!c.ele[i].includes(k));goster();geriBildirim(p,"ipucu","İpucu 2",`${i+1}. kadrandan iki yanlış seçeneği çıkardım.`)}
  else{c.deger[i]=q.cevap;c.kilit[i]=true;ilkDeneme("kadran:"+q.id,q.kz,false);goster();geriBildirim(p,"ipucu","İpucu 3",`${i+1}. kadranı doğru konuma çevirdim: “${q.secenek[q.cevap]}”. ${q.aciklama}`);if(c.kilit.every(Boolean)){kaydet();K.bulmacaBitti("kadran",p);return}}
  this.innerHTML=`${sv("ipucu",18)} İpucu (${3-c.ipucu} kaldı)`;this.disabled=c.ipucu>=3;kaydet()});
 goster()};

/* ---------- 7. Bölüm sonu ve kazanım raporu ---------- */
K.sonEkran=function(){K.sahneBirak();const y=Object.values(D.yildiz).reduce((a,x)=>a+x,0),pu=Object.values(D.puan).reduce((a,x)=>a+x,0),hata=Object.values(D.cozum).reduce((a,c)=>a+(c.hata||0),0),ip=Object.values(D.cozum).reduce((a,c)=>a+(c.ipucu||0),0),dk=Math.floor(D.sure/60),sn=D.sure%60;
 const satir=IC.kazanim.map(o=>{const z=D.kz[o.id]||{d:0,y:0};return{o,z,p:z.d?Math.round(100*z.y/z.d):null}});const zayif=satir.filter(s=>s.p!=null&&s.p<75).sort((a,b)=>a.p-b.p)[0];const konu=zayif&&IC.konular.find(t=>(t.outcomeIds||[]).includes(zayif.o.id));
 KOK.innerHTML=`<div class="o41-son"><div class="o41-skart"><p class="o41-ust">Kanat tamamlandı</p><h1>Bilgelik Odası açıldı</h1><p>Allah İnancı kanadının üç kilidini de çözdün.</p>
  <div class="o41-yildizlar buyuk" aria-label="${y} / 9 yıldız">${[0,1,2].map(i=>`<div><small>${esc(IC.odalar[i].ad)}</small><span>${[1,2,3].map(k=>`<i class="${k<=(D.yildiz[i]||0)?"on":""}">${sv("yildiz",22)}</i>`).join("")}</span></div>`).join("")}</div>
  <dl class="o41-ozet"><div><dt>Puan</dt><dd>${pu}</dd></div><div><dt>Yıldız</dt><dd>${y} / 9</dd></div><div><dt>Süre</dt><dd>${dk} dk ${sn} sn</dd></div><div><dt>Hata · İpucu</dt><dd>${hata} · ${ip}</dd></div></dl>
  <h2>Kazanım raporu</h2><p class="o41-mut">İlk denemede doğru yerleştirdiğin ya da çevirdiğin parçalara göre.</p><table class="o41-tab"><thead><tr><th>Kazanım</th><th>İlk denemede doğru</th></tr></thead><tbody>${satir.map(s=>`<tr><td><code>${esc(s.o.code)}</code> ${esc(s.o.title)}</td><td>${s.p==null?"Bu bölümde ölçülmedi":`${s.z.y} / ${s.z.d} <span class="o41-bar"><i style="width:${s.p}%"></i></span>`}</td></tr>`).join("")}</tbody></table>
  ${konu?`<p class="o41-oneri">Tekrar önerisi: <b>${esc(konu.title)}</b> konusunu bir kez daha gözden geçir.</p>`:`<p class="o41-oneri">Bütün ölçülen kazanımlarda ilk denemede %75 ve üzeri başarı.</p>`}
  <div class="o41-bb">${konu?`<button class="o41-b" onclick="go('pders',{pt:'${konu.id}',ptab:''})">${sv("kitap",18)} Konuya dön</button>`:""}<button class="o41-b p" onclick="go('poyna',{oyn:'kutuphane',obol:'${S}',odevam:0})">Yeniden oyna</button><button class="o41-b" onclick="go('poyun')">Oyun merkezi</button></div></div></div>`};

/* ---------- 8. Yaşam döngüsü ---------- */
K.sahneBirak=function(){if(K._rz)removeEventListener("resize",K._rz);K._rz=null;G3.birak(R);R=null;KAM=null;K._dugme=null};
K.duraklat=function(){kaydet()};K.surdur=function(){if(KAM)K.ciz()};
K.yenidenBaslat=function(){V41.bolumYaz(K.id,S,null);const b=S;K.baslat(KOK,b,{devam:false})};
K.kaliteDegisti=function(){if(KAM&&D&&!D.bitti){K.sahneBirak();K.odaAc()}};
K.temizle=function(){clearInterval(SAY);SAY=0;if(D&&S)kaydet();K.sahneBirak();document.querySelectorAll(".o41-hayalet").forEach(e=>e.remove());D=null;S=null;KOK=null};
K.bitir=function(){if(D){D.bitti=true;kaydet()}};
K._test={durum:()=>D,icerik:()=>IC,kam:()=>KAM,r:()=>R};
V41.kaydol(K);
V41.kaydol({id:"zaman",ad:"Zamanın İzinde",durum:"yakinda",ozet:"Tarihî bir harita üzerinde yolculuk: olayları sırala, kişileri ve yerleri eşleştir.",afis:"background:linear-gradient(160deg,#2f4a5a,#1d2a33)"});
V41.kaydol({id:"lab",ad:"Bilgi Laboratuvarı",durum:"yakinda",ozet:"Kısa ve tekrar oynanabilir görevler: sınıflandır, sırala, parçaları birleştir.",afis:"background:linear-gradient(160deg,#36504a,#1c2b28)"});
})();
