/* ===================== V40.0: Öğrenme Dünyası — etkileşimli 3B okul koridoru =====================
   Yöntem: CSS 3D (perspective + preserve-3d) ile gerçek bir dünya. Zemin, tavan ve iki duvar 300 px'lik
   bölümlerden oluşur; kapılar duvara yerleşik, derin kasalı, menteşeden açılan çift kanatlı nesnelerdir.
   Kamera dünyanın içinde ilerler ve döner (tek transform); kameranın arkasında / görüş dışında kalan bölümler gizlenir.
   Dokular (mermer, ceviz, kireçtaşı) açılışta canvas ile bir kez üretilir; dışarıdan görsel yüklenmez.
   İçerik ve ilerleme V39 ile aynı kaynaktan gelir (Store, dk-ilerleme39). Mevcut alanlar değiştirilmez;
   yalnızca dk-ilerleme39 içine isteğe bağlı yeni alanlar eklenir: fav (favoriler), lite40 (sade görünüm), ipucu40. */
const V40={VER:"V40.0",X:480,FY:300,CY:-470,L:4800,ZS:600,DW:250,DH:470,AR:125,SEG:300,Z0:900,DZ:440,
 cam:{x:0,z:320,yaw:0},mode:"yuru",s:-1,sel:-1,P:600,yawS:24,fd:520,tw:null,raf:0,drag:null,items:[],bb:[],_kb:false};
V40.H=V40.FY-V40.CY;V40.G=3;V40.ES=12; /* düzlemler arası boşluk; kapının zeminden yüksekliği (eşik) */
V40.kapilar=function(){if(V40._k)return V40._k;V40._k=V39.GR.map((g,i)=>i<8?{i,g,side:i%2?1:-1,z:-(V40.Z0+i*V40.DZ)}:{i,g,side:0,z:-V40.L});return V40._k};

/* ---------- 1. Kamera pozları ---------- */
/* durak: kapıya yaklaşırken koridorda durulan yer (kapı ve koridorun derinliği birlikte görünür)
   odak: kameranın kapıya döndüğü yer; giris: kapı eşiği. s=-1 koridorun girişi. */
V40.durak=function(i){if(i<0)return{x:0,z:320,yaw:0};const k=V40.kapilar()[i];if(!k.side)return{x:0,z:-V40.L+1050,yaw:0};return{x:-k.side*120,z:k.z+600,yaw:k.side*V40.yawS}};
V40.odak=function(i){const k=V40.kapilar()[i];if(!k.side)return{x:0,z:-V40.L+V40.fd+40,yaw:0};return{x:k.side*(V40.X-V40.fd),z:k.z,yaw:k.side*90}};
V40.giris=function(i){const k=V40.kapilar()[i];if(!k.side)return{x:0,z:-V40.L+26,yaw:0};return{x:k.side*(V40.X-26),z:k.z,yaw:k.side*90}};
V40.yolPoz=function(s){s=Math.max(-1,Math.min(8,s));const a=Math.min(7,Math.floor(s)),t=s-a,A=V40.durak(a),B=V40.durak(a+1),e=t*t*(3-2*t);return{x:A.x+(B.x-A.x)*e,z:A.z+(B.z-A.z)*t,yaw:A.yaw+(B.yaw-A.yaw)*e}};
V40.olc=function(){const st=document.getElementById("s40");if(!st)return;const W=st.clientWidth||390,H=st.clientHeight||700;
 V40.P=Math.round(Math.max(H*.6,W*.5));const th=W/2/V40.P;V40.yawS=Math.max(12,Math.min(32,45-Math.atan(.55*th)*180/Math.PI));
 /* odak mesafesi: kapı genişliği ekranın ~%55'ini geçmesin; kapı + tabela üst çubuk ile alt panel arasına sığsın */
 const P=V40.P,ust=Math.max(40,.46*H-74),alt=Math.max(60,.54*H-(W<700?180:150)),tep=V40.FY-V40.ES-V40.DH-112,dip=V40.FY-V40.ES;
 V40.fd=Math.round(Math.max(360,Math.min(1100,Math.max(-tep*P/ust,dip*P/alt,V40.DW*P/(.55*W)))));V40.tanH=th*1.12;st.style.setProperty("--P",V40.P+"px")};

/* ---------- 2. Dokular: canvas ile bir kez (WebP; desteklenmezse PNG) ---------- */
V40.uret=function(){if(V40.tex)return V40.tex;let seed=40400;const R=()=>(seed=(seed*16807)%2147483647,(seed-1)/2147483646),T={},
 cv=(w,h)=>{const c=document.createElement("canvas");c.width=w;c.height=h;return c},out=c=>{try{const u=c.toDataURL("image/webp",.82);return u.indexOf("data:image/webp")===0?u:c.toDataURL("image/png")}catch(e){return""}};
 try{let c=cv(512,512),x=c.getContext("2d"),g=x.createLinearGradient(0,0,512,512);g.addColorStop(0,"#ede6da");g.addColorStop(.5,"#f6f1e8");g.addColorStop(1,"#e6dccc");x.fillStyle=g;x.fillRect(0,0,512,512);
  for(let n=0;n<1800;n++){x.fillStyle=`rgba(${150+R()*60|0},${138+R()*50|0},${118+R()*40|0},${R()*.07})`;x.fillRect(R()*512,R()*512,2+R()*7,2+R()*7)}
  for(let v=0;v<10;v++){x.beginPath();let px=R()*512,py=R()*512;x.moveTo(px,py);for(let s=0;s<14;s++){const qx=px+(R()-.5)*50,qy=py+(R()-.5)*50;px+=(R()-.3)*70;py+=(R()-.5)*70;x.quadraticCurveTo(qx,qy,px,py)}x.strokeStyle=v%3?`rgba(120,108,96,${.16+R()*.2})`:`rgba(178,134,64,${.2+R()*.2})`;x.lineWidth=.6+R()*1.8;x.stroke()}
  T.mermer=out(c);
  c=cv(256,256);x=c.getContext("2d");x.fillStyle="#2b2420";x.fillRect(0,0,256,256);for(let n=0;n<700;n++){x.fillStyle=`rgba(255,238,215,${R()*.05})`;x.fillRect(R()*256,R()*256,2+R()*4,2+R()*4)}
  for(let v=0;v<6;v++){x.beginPath();let px=R()*256,py=R()*256;x.moveTo(px,py);for(let s=0;s<10;s++){px+=(R()-.5)*60;py+=(R()-.3)*60;x.lineTo(px,py)}x.strokeStyle=`rgba(212,178,118,${.14+R()*.2})`;x.lineWidth=.6+R();x.stroke()}
  T.koyu=out(c);
  c=cv(256,512);x=c.getContext("2d");g=x.createLinearGradient(0,0,256,0);g.addColorStop(0,"#3a2011");g.addColorStop(.5,"#5b331a");g.addColorStop(1,"#3c2113");x.fillStyle=g;x.fillRect(0,0,256,512);
  for(let l=0;l<80;l++){const bx=R()*256,a=2+R()*6,f=.01+R()*.03,ph=R()*6;x.beginPath();for(let y=0;y<=512;y+=8){const xx=bx+Math.sin(y*f+ph)*a;y?x.lineTo(xx,y):x.moveTo(xx,y)}x.strokeStyle=R()<.5?`rgba(18,8,2,${.12+R()*.2})`:`rgba(165,104,52,${.06+R()*.12})`;x.lineWidth=.5+R()*1.6;x.stroke()}
  T.ceviz=out(c);
  c=cv(512,512);x=c.getContext("2d");x.fillStyle="#d3c5ad";x.fillRect(0,0,512,512);for(let n=0;n<2200;n++){x.fillStyle=`rgba(${120+R()*80|0},${100+R()*70|0},${70+R()*60|0},${R()*.07})`;x.beginPath();x.arc(R()*512,R()*512,1+R()*5,0,7);x.fill()}
  x.strokeStyle="rgba(92,72,46,.16)";x.lineWidth=1.2;for(let y=0;y<512;y+=128){x.beginPath();x.moveTo(0,y);x.lineTo(512,y);x.stroke();for(let xx=(y/128)%2?128:0;xx<512;xx+=256){x.beginPath();x.moveTo(xx,y);x.lineTo(xx,y+128);x.stroke()}}
  T.tas=out(c)}catch(e){}
 return V40.tex=T};
V40.texUygula=function(){const el=document.getElementById("p40");if(!el)return;const T=V40.uret(),u=k=>T[k]?`url("${T[k]}")`:"none";["mermer","koyu","ceviz","tas"].forEach(k=>el.style.setProperty("--t-"+k,u(k)));el.classList.add("doku")};

/* ---------- 3. Simgeler (V39.svg'de olmayanlar) ---------- */
V40.ic=(k,s)=>`<svg class="p39-i" width="${s||20}" height="${s||20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 star:'<path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
 hand:'<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-1.5a1.5 1.5 0 0 1 3 0V12m0-.5a1.5 1.5 0 0 1 3 0v3.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.6-2.2L4 15.5a1.6 1.6 0 0 1 2.4-2.1L8 15"/>',
 enter:'<path d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"/>',
 pen:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',code:'<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12"/>',tbl:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
 mix:'<path d="M4 7h4l8 10h4M4 17h4l2.5-3M14 9.5 16 7h4M18 5l2 2-2 2M18 15l2 2-2 2"/>',cards:'<rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/>',
 story:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',exam:'<path d="M9 4h6l1 2h3v15H5V6h3z"/><path d="M9 12l2 2 4-4"/>',
 sum:'<path d="M5 5h14M5 10h14M5 15h9M5 20h6"/>',lite:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="4"/>'
})[k]||""}</svg>`;
V40.aic=(k,s)=>k==="book"||k==="game"?V39.svg(k,s):V40.ic(k,s);

/* ---------- 4. Sahne ---------- */
V40.kapiHTML=function(k){const g=k.g,st=V39.stage(g),pv=V39.pv(g),W=V40.DW,H=V40.DH,AR=V40.AR;
 return `<button class="k40" data-i="${k.i}" data-g="${g}" style="width:${W}px;height:${H}px" aria-label="${g}. Sınıf kapısı, ${st}, ${esc(V39.pyName(pv))}. Seçmek için dokun; seçiliyken tekrar dokunursan kapı açılır ve sınıf merkezine girersin.">
  <span class="k40-ic" aria-hidden="true"><i class="pen a"></i><i class="pen b"></i><i class="raf"></i><i class="isik"></i></span>
  <span class="k40-tr" aria-hidden="true" style="height:${AR}px"></span>
  <span class="k40-kn l" aria-hidden="true" style="top:${AR}px;height:${H-AR}px"><i class="pa"></i><i class="pb"></i><i class="ku"></i></span>
  <span class="k40-kn r" aria-hidden="true" style="top:${AR}px;height:${H-AR}px"><i class="pa"></i><i class="pb"></i><i class="ku"></i></span>
  <span class="k40-cer" aria-hidden="true"><i class="jl"></i><i class="jr"></i></span>
  <span class="k40-tab"><i>${g}</i><b>${g}. Sınıf</b><small>${st}</small></span>
  <span class="k40-hl" aria-hidden="true"></span><span class="k40-dim" aria-hidden="true"></span></button>`};
V40.sahneHTML=function(){const X=V40.X,FY=V40.FY,CY=V40.CY,L=V40.L,ZS=V40.ZS,H=V40.H,S=V40.SEG,DW=V40.DW,DH=V40.DH,K=V40.kapilar(),n=Math.ceil((L+ZS)/S);
 let w="";V40.items=[];V40.bb=[];
 const it=(cls,pts)=>{V40.items.push({cls,pts});return ` data-c="${V40.items.length-1}"`};
 /* duvar süslemeleri (derinlik d=-z): kapı yanı aplikler, karşı kapı hizasında kemerli nişler, pilastrlar */
 const dec={"-1":[],"1":[]};
 [-1,1].forEach(sd=>{const D=K.filter(k=>k.side===sd).map(k=>-k.z),O=K.filter(k=>k.side===-sd).map(k=>-k.z);
  D.forEach(d=>{dec[sd].push({t:"ap",d:d-DW/2-78},{t:"ap",d:d+DW/2+78},{t:"pil",d:d-DW/2-170},{t:"pil",d:d+DW/2+170})});
  O.concat(sd<0?[]:[V40.Z0-V40.DZ]).forEach(d=>{dec[sd].push({t:"nis",d})});
  [V40.Z0-V40.DZ*1.5,V40.Z0+V40.DZ*7.5+380].forEach(d=>dec[sd].push({t:"pil",d}))});
 /* Düzlemler birbirine kenarıyla değmez (zemin–duvar–tavan arasında g px boşluk); aynı düzlemdeki bölümler 2 px üst üste biner.
    Kenarı başka bir düzlemin üzerinde duran ya da onu delen yüzeyler, Chromium'un 3B sıralamasında (BSP) parça kaybına yol açıyordu. */
 const g=V40.G,yOf=yw=>yw-CY-g,zEnd=-L+g,boy=z0=>Math.min(S+2,z0-zEnd);
 const decHTML=(sd,j,len)=>{const a=j*S-ZS,b=a+len;return dec[sd].filter(o=>o.d>=a-130&&o.d<b+130).map(o=>{const u=sd<0?o.d-a:b-o.d; /* bölüm sınırını aşan süsler iki bölüme de yazılır; taşan kısım overflow ile kesilir */
  if(o.t==="ap")return `<i class="ap40" style="left:${u-16}px;top:${yOf(-70)}px"></i><i class="apg" style="left:${u-110}px;top:${yOf(-200)}px"></i>`;
  if(o.t==="nis")return `<i class="nis40" style="left:${u-95}px;top:${yOf(-330)}px"></i><i class="sk40" style="left:${u-80}px;top:${yOf(FY-150)}px"></i>`;
  return `<i class="pil40" style="left:${u-18}px"></i>`}).join("")};
 for(let j=0;j<n;j++){const z0=ZS-j*S,ln=boy(z0),z1=z0-ln;if(ln<=0)break;
  w+=`<div class="z40 zem"${it("zem",[[-X,z0],[X,z0],[-X,z1],[X,z1]])} style="width:${2*X-2*g}px;height:${ln}px;transform:translate3d(${-X+g}px,${FY}px,${z0}px) rotateX(-90deg)"><i class="kosu"></i>${j%2?"":'<i class="mad"></i>'}</div>`;
  w+=`<div class="z40 tav${j%3===1?" sky":""}"${it("tav",[[-X,z0],[X,z0],[-X,z1],[X,z1]])} style="width:${2*X-2*g}px;height:${ln}px;transform:translate3d(${-X+g}px,${CY}px,${z0}px) rotateX(-90deg)"><i class="kir"></i>${j%3===1?'<i class="isk"></i>':""}</div>`;
  w+=`<div class="z40 dv sol"${it("dv",[[-X,z0],[-X,z1]])} style="width:${ln}px;height:${H-2*g}px;transform:translate3d(${-X}px,${CY+g}px,${z0}px) rotateY(90deg)"><i class="lam"></i><i class="kor"></i>${decHTML(-1,j,ln)}</div>`;
  w+=`<div class="z40 dv sag"${it("dv",[[X,z0],[X,z1]])} style="width:${ln}px;height:${H-2*g}px;transform:translate3d(${X}px,${CY+g}px,${z1}px) rotateY(-90deg)"><i class="lam"></i><i class="kor"></i>${decHTML(1,j,ln)}</div>`}
 /* kapılar: duvara yerleşik (sol: yüzü +x, sağ: yüzü -x, 12: uç duvar) */
 K.forEach(k=>{let tr,pts;if(k.side<0){tr=`translate3d(${-X}px,${FY-DH-V40.ES}px,${k.z+DW/2}px) rotateY(90deg)`;pts=[[-X,k.z+DW/2+40],[-X+140,k.z],[-X,k.z-DW/2-40]]}
  else if(k.side>0){tr=`translate3d(${X}px,${FY-DH-V40.ES}px,${k.z-DW/2}px) rotateY(-90deg)`;pts=[[X,k.z+DW/2+40],[X-140,k.z],[X,k.z-DW/2-40]]}
  else{tr=`translate3d(${-DW/2}px,${FY-DH-V40.ES}px,${-L}px)`;pts=[[-DW/2-40,-L],[DW/2+40,-L]]}
  w+=`<div class="k40-yer"${it("kapi",pts)} style="width:${DW}px;height:${DH}px;transform:${tr}">${V40.kapiHTML(k)}</div>`;
  /* zeminde kapının sıcak ışık yansıması */
  if(k.side)w+=`<i class="yan40 ${k.side<0?"l":"r"}"${it("yan",[[k.side*X,k.z+130],[k.side*(X-220),k.z],[k.side*X,k.z-130]])} style="transform:translate3d(${k.side<0?-X+3:X-223}px,${FY-1}px,${k.z+125}px) rotateX(-90deg)"></i>`;
  else w+=`<i class="yan40 uc"${it("yan",[[-130,-L+220],[130,-L]])} style="transform:translate3d(-125px,${FY-1}px,${-L+223}px) rotateX(-90deg)"></i>`});
 /* uç duvar: büyük kemerli odak, kafes pencere, iki sütun */
 w+=`<div class="z40 uc40"${it("uc",[[-X,-L],[X,-L]])} style="width:${2*X-2*g}px;height:${H-2*g}px;transform:translate3d(${-X+g}px,${CY+g}px,${-L}px)"><i class="lam"></i><i class="kor"></i><i class="kem"></i><i class="kaf"></i><i class="sut l"></i><i class="sut r"></i><i class="ap40" style="left:${X-g-DW/2-110}px;top:${yOf(-70)}px"></i><i class="ap40" style="left:${X-g+DW/2+78}px;top:${yOf(-70)}px"></i></div>`;
 /* bitkiler: duvar diplerinde, kameraya dönük düzlemler */
 const bit=(x,z)=>{V40.bb.push(V40.items.length);return `<i class="bit40"${it("bit",[[x-40,z],[x+40,z]])} data-x="${x}" data-z="${z}" style="transform:translate3d(${x}px,${FY-174}px,${z}px)"></i>`};
 K.filter(k=>k.side).forEach(k=>{w+=bit(k.side*(X-58),k.z+DW/2+120)});[-1,1].forEach(sd=>{w+=bit(sd*(X-70),-L+90)});
 return w};

/* ---------- 5. Ekran ---------- */
V40.lite=function(){const o=V39.ilr();if(o.lite40===1)return true;if(o.lite40===0)return false;try{return !!((navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2))}catch(e){return false}};
V40.favs=function(){const o=V39.ilr();o.fav=o.fav&&typeof o.fav==="object"?o.fav:{};o.fav.s=Array.isArray(o.fav.s)?o.fav.s:[];o.fav.k=Array.isArray(o.fav.k)?o.fav.k:[];return o.fav};
V40.isFav=(t,id)=>V40.favs()[t].includes(t==="s"?+id:id);
V40.favTik=function(t,id){const F=V40.favs(),v=t==="s"?+id:id,i=F[t].indexOf(v);if(i>=0)F[t].splice(i,1);else F[t].push(v);V39.ilrSave();const on=i<0;
 document.querySelectorAll(`[data-fav="${t}:${v}"]`).forEach(b=>{b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});try{UI.toast(on?"Favorilere eklendi.":"Favorilerden çıkarıldı.")}catch(e){}};
V40.favBtn=(t,id,cls)=>{const on=V40.isFav(t,id);return `<button class="fav40 ${cls||""}${on?" on":""}" data-fav="${t}:${t==="s"?+id:id}" aria-pressed="${on}" aria-label="${t==="s"?id+". sınıfı":"Konuyu"} favorilere ekle / çıkar" onclick="event.stopPropagation();V40.favTik('${t}','${id}')">${V40.ic("star",20)}</button>`};
V40.ustHTML=()=>`<header class="ust40"><button class="mk40" onclick="V40.git(-1)" aria-label="Öğrenme Dünyası: koridorun girişine dön">${V39.emb(36)}<span><b>Din Kültürü</b><small>Öğrenme Dünyası</small></span></button>
 <nav class="nv40" aria-label="Öğrenme Dünyası menüsü"><button class="on" aria-current="page" onclick="V40.git(-1)">${V39.svg("home",20)}<span>Ana Panel</span></button><button onclick="go('pilerleme')">${V39.svg("chart",20)}<span>İlerleme</span></button><button onclick="go('pfav')">${V40.ic("star",20)}<span>Favoriler</span></button><button onclick="go('pekbol',{pk:{k:'plan',g:''}})">${V40.ic("cal",20)}<span>Planım</span></button></nav>
 <span class="sp40"></span><button class="ib40" onclick="V39.ara()" aria-label="Ara">${V39.svg("search",20)}</button><button class="ib40 ses" onclick="V37.sndOpen()" aria-label="Ses kontrolü">${V39.svg("vol",20)}</button><button class="ib40 pr" onclick="V40.profil()" aria-label="Profil, yardım ve ayarlar">${V40.ic("user",20)}</button></header>`;
V40.r_pdunya=function(){const o=V39.ilr(),last=o.sonSinif&&V39.GR.includes(+o.sonSinif)?+o.sonSinif:0,lite=V40.lite();
 $.innerHTML=`<div class="p39 p40${lite?" lite":""}" id="p40">
 <section class="sahne40" id="s40" tabindex="0" aria-roledescription="3B okul koridoru" aria-label="Okul koridoru: sağa-sola kaydırarak ya da İleri / Geri düğmeleriyle yürü; bir kapıya dokunarak seç, tekrar dokunarak gir. Klavye: ok tuşları yürür, Enter kapıyı açar, Esc geri çekilir.">
  <div class="vp40"><div class="kam40" id="k40">${V40.sahneHTML()}</div></div><i class="hava40" aria-hidden="true"></i><i class="perde40" id="pd40" aria-hidden="true"></i>
  ${V40.ustHTML()}
  <div class="ipu40" id="ip40" hidden><i>${V40.ic("hand",22)}</i><span><b>Kaydırarak yürü</b><small>Kapıya dokun, sonra “Sınıfa Gir”.</small></span></div>
  <div class="alt40">
   <button class="yon40 geri" id="y40g" onclick="V40.adim(-1)" aria-label="Geri: önceki kapı">${V39.svg("left",22)}<span>Geri</span></button>
   <div class="bil40" id="b40" aria-live="polite"></div>
   <button class="yon40 ileri" id="y40i" onclick="V40.adim(1)" aria-label="İleri: sonraki kapı">${V39.svg("right",22)}<span>İleri</span></button>
   <nav class="gs40" aria-label="Sınıf göstergesi: doğrudan bir kapıya git">${V39.GR.map((g,i)=>`<button data-i="${i}" onclick="V40.git(${i})" aria-label="${g}. sınıf kapısına git"><i></i><small>${g}</small></button>`).join("")}</nav>
  </div>
  <button class="yrd40" onclick="V40.yardim()" aria-label="Koridorda nasıl gezinirim?">?</button>
 </section>
 <section class="hz40" aria-label="Hızlı erişim"><h2>Hızlı Erişim</h2><div>${[["book","Derslerim","V39.hz('ders')"],["layers","Özetler","V39.hz('ozet')"],["test","Testler","V39.hz('test')"],["game","Oyunlar","V39.hz('oyun')"],["chart","İlerlemem","go('pilerleme')"]].map(([i,n,f])=>`<button onclick="${f}">${V39.svg(i,22)}<span>${n}</span></button>`).join("")}</div>
  <p class="nt40">İçerik Klasik alanla aynı kayıtlardan gelir; ilerlemen iki deneyimde ortaktır.${V39.Uyelik.premium().kaynak==="prototip"?" Üyelik bu sürümde prototiptir (gerçek ödeme / doğrulama yok).":""}</p></section></div>`;
 const gel=V40._gelis;V40._gelis=0;V40.init(last?V39.GR.indexOf(last):-1,gel)};
V39.r_pdunya=V40.r_pdunya;
V40.cur=()=>V40.mode==="odak"?V40.sel:Math.max(0,Math.min(8,Math.round(V40.s)));
V39.hz=function(k){const g=V39.GR[V40.cur()]||4;if(k==="ders")return go("psinif",{pg:g});if(k==="ozet")return go("pozet",{pg:g});if(k==="test")return go("dene");if(k==="oyun")return go("games")};

/* ---------- 6. Kamera uygulama ve ayıklama (culling) ---------- */
/* Çizim yöntemi: ortak 3B bağlam (preserve-3d) yok. Her yüzey kamera + dünya dönüşümünü kendi taşır ve .kam40'ın
   perspektifiyle tek başına izdüşürülür; çizim sırası ressam algoritmasıyla belirlenir. Koridor kabuğu (zemin, tavan,
   duvarlar, uç duvar) dışbükeydir, içeriden bakınca birbirini örtmez; kapılar ve bitkiler uzaktan yakına sıralanır.
   (Ortak 3B bağlamda Chromium'un çokgen bölme/BSP adımı çok sayıda dik düzlemde parça kaybettiriyordu.) */
V40.uygula=function(c){const cam=V40._cam;if(!cam)return;V40.cam=c;const y=c.yaw*Math.PI/180,sn=Math.sin(y),cs=Math.cos(y),t=V40.tanH||1,
 C=`translateZ(${V40.P}px) rotateY(${c.yaw.toFixed(3)}deg) translate3d(${(-c.x).toFixed(2)}px,0px,${(-c.z).toFixed(2)}px) `,dyn=[];
 /* görüş piramidi testi: tüm noktalar aynı yarım-uzayın dışındaysa öğe gizlenir (sol, sağ, yakın düzlem) */
 const E=V40._els;for(let i=0;i<E.length;i++){const P=V40.items[i].pts;let ol=0,or=0,on_=0,dsum=0;
  for(let j=0;j<P.length;j++){const dx=P[j][0]-c.x,dz=P[j][1]-c.z,xc=dx*cs+dz*sn,zc=-dx*sn+dz*cs;if(xc<t*zc)ol++;if(xc>-t*zc)or++;if(zc>-2)on_++;dsum+=dx*dx+dz*dz}
  const on=!(ol===P.length||or===P.length||on_===P.length),el=E[i];
  if(el._v!==on){el._v=on;el.style.visibility=on?"":"hidden"}
  if(on){el.style.transform=C+el._w+(el._bb?` rotateY(${(-c.yaw).toFixed(2)}deg) translateX(-45px)`:"");if(el._dy){el._d=dsum/P.length;dyn.push(el)}}}
 dyn.sort((a,b)=>b._d-a._d);dyn.forEach((el,k)=>{const zi=String(10+k);if(el.style.zIndex!==zi)el.style.zIndex=zi})};
V40.ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
V40.dongu=function(){if(V40.raf)return;let last=performance.now();const f=now=>{V40.raf=0;if(view!=="pdunya"||!V40._cam)return;const dt=Math.min(64,Math.max(1,now-last));last=now;let dv=false;
  if(V40.tw){const T=V40.tw,k=Math.min(1,(now-T.t0)/T.d),e=(T.e||V40.ease)(k);if(T.s!=null){V40.s=T.s0+(T.s-T.s0)*e;V40.uygula(V40.yolPoz(V40.s))}else{const A=T.a,B=T.b;V40.uygula({x:A.x+(B.x-A.x)*e,z:A.z+(B.z-A.z)*e,yaw:A.yaw+(B.yaw-A.yaw)*e})}
   if(k>=1){V40.tw=null;V40.durum();if(T.f)T.f()}else dv=true}
  else if(V40.drag&&V40.drag.moved){const tg=V40.yolPoz(V40.s),c=V40.cam,a=1-Math.exp(-dt/80);V40.uygula({x:c.x+(tg.x-c.x)*a,z:c.z+(tg.z-c.z)*a,yaw:c.yaw+(tg.yaw-c.yaw)*a});dv=true}
  V40.yakin();if(dv||V40.tw)V40.raf=requestAnimationFrame(f)};V40.raf=requestAnimationFrame(f)};
V40.tween=function(o){V40.tw=Object.assign({t0:performance.now()},o);if(o.s!=null)V40.tw.s0=V40.s;else V40.tw.a=Object.assign({},V40.cam);V40.dongu()};
V40.red=()=>V39.reduced();

/* ---------- 7. Gezinme: yürüme, seçme, giriş ---------- */
V40.durum=function(){const n=V40.cur(),ent=V40.mode==="yuru"&&V40.s<-.5,K=V40._kap||[];
 K.forEach((b,i)=>{const sec=V40.mode==="odak"&&i===V40.sel;b.classList.toggle("sec",sec);b.classList.toggle("kis",V40.mode==="odak"&&!sec);b.setAttribute("aria-pressed",sec?"true":"false")});
 document.querySelectorAll(".gs40 button").forEach((b,i)=>{const on=!ent&&i===n;b.classList.toggle("on",on);b.setAttribute("aria-current",on?"true":"false")});
 const gb=document.getElementById("y40g"),ib=document.getElementById("y40i");if(gb)gb.disabled=V40.mode==="yuru"&&V40.s<=-.95;if(ib)ib.disabled=n>=8&&(V40.mode==="odak"||V40.s>=7.95);
 const key=(ent?"e":n)+V40.mode;if(V40._bk!==key){V40._bk=key;V40.bilgi(ent?-1:n)}
 const st=document.getElementById("s40");if(st)st.dataset.mod=V40.mode};
V40.yakin=function(){const n=V40.mode==="yuru"&&Math.abs(V40.s-Math.round(V40.s))<.3&&V40.s>-.5?Math.round(V40.s):-1;if(V40._yk===n)return;V40._yk=n;(V40._kap||[]).forEach((b,i)=>b.classList.toggle("yak",i===n))};
V40.bilgi=function(i){const b=document.getElementById("b40");if(!b)return;
 if(i<0){b.innerHTML=`<div class="bt40"><b>Öğrenme Dünyası</b><small>${V39.GR.length} sınıf kapısı · ${V39.GR[0]}–${V39.GR[8]}. sınıf</small><span>İleri kaydır ya da İleri’ye bas.</span></div>`;return}
 const g=V39.GR[i],py=V39.pv(g),U=V39.units(g,py),T=U.reduce((a,u)=>a+V39.tops(u.id).length,0);
 b.innerHTML=`<div class="bt40"><b>${g}. Sınıf</b><small>${V39.stage(g)} · ${esc(V39.pyName(py))}</small><span>${U.length?`${U.length} ünite · ${T} konu`:"Bu program için ünite verisi bulunmuyor."}</span></div>
  <div class="ba40">${V40.favBtn("s",g)}<button class="gir40" onclick="V40.gir(${i})">${V40.ic("enter",18)}<span>Sınıfa Gir</span></button></div>`};
V40.git=function(i){if(V40._acil)return;i=Math.max(-1,Math.min(8,i));V40.ipucuKapat();
 if(V40.red()){V40.mode="yuru";V40.s=i;V40.sel=-1;V40.tw=null;V40.uygula(V40.durak(i));V40.durum();return}
 if(V40.mode==="odak"){const d=Math.abs(i-V40.sel);V40.mode="yuru";V40.sel=-1;V40.s=i;V40.durum();V40.tween({b:V40.durak(i),d:Math.min(1500,560+d*170)});return}
 const d=Math.abs(i-V40.s);V40.tween({s:i,d:Math.min(1500,Math.max(380,320+d*230))})};
V40.adim=function(d){if(V40._acil)return;if(V40.mode==="odak"){V40.git(V40.sel+d);return}const s=V40.tw&&V40.tw.s!=null?V40.tw.s:V40.s,t=d>0?Math.floor(s+.05)+1:Math.ceil(s-.05)-1;V40.git(t)};
V40.sec=function(i,hizli){if(V40._acil||i<0||i>8)return;V40.ipucuKapat();V40.mode="odak";V40.sel=i;V40.s=i;V40.durum();
 const o=V39.ilr(),g=V39.GR[i];if(o.sonSinif!==g){o.sonSinif=g;V39.ilrSave()}
 const to=V40.odak(i);if(V40.red()||hizli){V40.tw=null;V40.uygula(to);return}const c=V40.cam,dist=Math.hypot(to.x-c.x,to.z-c.z);
 V40.tween({b:to,d:Math.min(1400,Math.max(520,360+dist*.35+Math.abs(to.yaw-c.yaw)*3))})};
V40.tik=function(i){if(V40.mode==="odak"&&V40.sel===i)V40.gir(i);else V40.sec(i)};
V40.geriCekil=function(){if(V40.mode==="odak")V40.git(V40.sel)};
V40.gir=function(i){if(V40._acil)return;const g=V39.GR[i],b=(V40._kap||[])[i],pd=document.getElementById("pd40");V40.ipucuKapat();V40._girdi=g;
 const bit=()=>{V40._acil=0;V40._gelis=g;go("psinif",{pg:g})};
 if(V40.red()||!b){bit();return}
 const ac=()=>{V40._acil=1;b.classList.add("acik");setTimeout(()=>{if(pd)pd.classList.add("on");V40.tween({b:V40.giris(i),d:720,e:t=>t*t*(2.2-1.2*t),f:()=>setTimeout(bit,40)})},560)};
 const to=V40.odak(i),c=V40.cam;if(V40.mode==="odak"&&V40.sel===i&&!V40.tw&&Math.abs(c.x-to.x)+Math.abs(c.z-to.z)+Math.abs(c.yaw-to.yaw)<2)ac();
 else{V40.sec(i);V40._acil=1;if(V40.tw)V40.tw.f=ac;else ac()}};
/* kapıdan çıkış: sınıf merkezinden koridora dönünce kamera kapı eşiğinden geri çekilir, kanatlar kapanır */
V40.cikis=function(i){const b=(V40._kap||[])[i];V40.mode="odak";V40.sel=i;V40.s=i;V40.durum();
 if(V40.red()||!b){V40.uygula(V40.odak(i));return}b.classList.add("acik","an0");V40.uygula(V40.giris(i));const pd=document.getElementById("pd40");if(pd)pd.classList.add("on","an0");
 requestAnimationFrame(()=>requestAnimationFrame(()=>{b.classList.remove("an0");if(pd)pd.classList.remove("an0","on");V40.tween({b:V40.odak(i),d:760,f:()=>b.classList.remove("acik")})}))};

/* ---------- 8. Etkileşim ---------- */
V40.init=function(i0,gel){const st=document.getElementById("s40"),cam=document.getElementById("k40");if(!st||!cam)return;
 V40._cam=cam;V40._els=[...cam.querySelectorAll("[data-c]")].sort((a,b)=>a.dataset.c-b.dataset.c);V40._els.forEach(e=>{e._v=true;e._w=e.style.transform;e._bb=e.classList.contains("bit40");e._dy=e._bb||e.classList.contains("k40-yer")});
 V40._kap=[...cam.querySelectorAll(".k40")].sort((a,b)=>a.dataset.i-b.dataset.i);V40.tw=null;V40.drag=null;V40._acil=0;V40._bk=null;V40._yk=null;cancelAnimationFrame(V40.raf);V40.raf=0;
 V40.olc();
 if(gel&&i0>=0&&V39.GR[i0]===gel)V40.cikis(i0);else if(i0>=0){V40.mode="odak";V40.sel=i0;V40.s=i0;V40.uygula(V40.odak(i0));V40.durum()}else{V40.mode="yuru";V40.sel=-1;V40.s=-1;V40.uygula(V40.durak(-1));V40.durum()}
 if(!document.querySelector("#p40.lite"))setTimeout(()=>{if(view==="pdunya")V40.texUygula()},30);
 const o=V39.ilr();if(!o.ipucu40){const ip=document.getElementById("ip40");if(ip){ip.hidden=false;V40._ipT=setTimeout(V40.ipucuKapat,9000)}}
 const ui=e=>e.target.closest&&e.target.closest(".ust40,.alt40,.ipu40,.yrd40");
 st.addEventListener("pointerdown",e=>{if(e.button>0||ui(e)||V40._acil)return;V40.drag={x:e.clientX,y:e.clientY,s0:V40.mode==="odak"?V40.sel:V40.s,moved:false,far:false,id:e.pointerId,lx:e.clientX,lt:performance.now(),v:0}});
 st.addEventListener("pointermove",e=>{const d=V40.drag;if(!d||e.pointerId!==d.id)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)>10||Math.abs(dy)>10)d.far=true;
  if(!d.moved){if(Math.abs(dx)<9||Math.abs(dx)<Math.abs(dy)*1.2)return;d.moved=true;d.x=e.clientX;V40.tw=null;V40.ipucuKapat();if(V40.mode==="odak"){V40.mode="yuru";V40.sel=-1}st.classList.add("drag");try{st.setPointerCapture(e.pointerId)}catch(_){}}
  const now=performance.now(),pps=Math.max(150,st.clientWidth*.42),ddx=e.clientX-d.x;d.v=.6*d.v+.4*((e.clientX-d.lx)/Math.max(1,now-d.lt));d.lx=e.clientX;d.lt=now;V40.s=Math.max(-1.25,Math.min(8.25,d.s0-ddx/pps));V40.durum();V40.dongu()});
 const end=e=>{const d=V40.drag;if(!d||e.pointerId!==d.id)return;V40.drag=null;st.classList.remove("drag");
  if(!d.moved){if(d.far||e.type!=="pointerup")return;const b=e.target.closest&&e.target.closest(".k40");if(b)V40.tik(+b.dataset.i);return}
  const pps=Math.max(150,st.clientWidth*.42),fl=Math.max(-1.6,Math.min(1.6,-d.v*260/pps)),t=Math.max(-1,Math.min(8,Math.round(V40.s+fl)));V40.s=t;V40.durum();V40.tween({b:V40.durak(t),d:Math.min(900,300+Math.abs(t-V40.s)*260)})};
 st.addEventListener("pointerup",end);st.addEventListener("pointercancel",end);
 /* klavyeyle kapı düğmesinde Enter/Boşluk: click olayı detail=0 gelir */
 st.addEventListener("click",e=>{const b=e.target.closest(".k40");if(b&&e.detail===0){e.preventDefault();V40.tik(+b.dataset.i)}});
 st.addEventListener("focusin",e=>{const b=e.target.closest&&e.target.closest(".k40");if(b&&V40._kb&&!(V40.mode==="odak"&&V40.sel===+b.dataset.i))V40.sec(+b.dataset.i)});
 const kilit=function(){if(this.scrollTop||this.scrollLeft){this.scrollTop=0;this.scrollLeft=0}};st.addEventListener("scroll",kilit);cam.parentNode.addEventListener("scroll",kilit);
 st.addEventListener("keydown",e=>{if(e.target.closest(".ust40,.alt40"))return;const k=e.key;
  if(k==="ArrowRight"||k==="ArrowUp"){V40.adim(1);e.preventDefault()}else if(k==="ArrowLeft"||k==="ArrowDown"){V40.adim(-1);e.preventDefault()}
  else if(k==="Enter"&&!e.target.closest(".k40")){if(V40.mode==="odak")V40.gir(V40.sel);else if(V40.s>-.5)V40.sec(V40.cur());e.preventDefault()}
  else if(k==="Escape"&&V40.mode==="odak"){V40.geriCekil();e.preventDefault()}});
 st.addEventListener("wheel",e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)*1.5&&Math.abs(e.deltaX)>4){e.preventDefault();clearTimeout(V40._wt);V40._wa=(V40._wa||0)+e.deltaX;V40._wt=setTimeout(()=>{const d=V40._wa;V40._wa=0;if(Math.abs(d)>30)V40.adim(d>0?1:-1)},90)}},{passive:false});
 if(!V40._glob){V40._glob=1;
  addEventListener("keydown",e=>{if(e.key==="Tab"||e.key.indexOf("Arrow")===0)V40._kb=true},true);addEventListener("pointerdown",()=>{V40._kb=false},true);
  addEventListener("resize",()=>{clearTimeout(V40._rz);V40._rz=setTimeout(()=>{if(view!=="pdunya"||!V40._cam||!document.getElementById("s40"))return;V40.olc();if(V40.tw)return;V40.uygula(V40.mode==="odak"?V40.odak(V40.sel):V40.yolPoz(V40.s))},120)})}};
V40.ipucuKapat=function(){clearTimeout(V40._ipT);const ip=document.getElementById("ip40");if(ip&&!ip.hidden){ip.hidden=true;const o=V39.ilr();o.ipucu40=1;V39.ilrSave()}};

/* ---------- 9. Yardım ve profil ---------- */
V40.yardim=function(){UI.sheet({title:"Koridorda nasıl gezinirim?",body:()=>`<ol class="yd40">
 <li><b>Yürü:</b> Koridoru parmağınla sağdan sola kaydır (ileri) ya da soldan sağa kaydır (geri). Alttaki <b>İleri / Geri</b> düğmeleri de aynı işi yapar.</li>
 <li><b>Kapıyı seç:</b> Bir kapıya dokun. Kamera kapıya döner, kapı altın ışıkla belirginleşir, alt panelde sınıf bilgisi görünür.</li>
 <li><b>Gir:</b> Seçili kapıya tekrar dokun ya da <b>Sınıfa Gir</b>’e bas. Kapı açılır, sınıf merkezine geçersin. Koridora döndüğünde aynı kapının önünde olursun.</li>
 <li><b>Klavye:</b> Ok tuşları yürür, Tab ile kapılar arasında gezilir, Enter kapıyı açar, Esc kapıdan geri çekilir.</li>
 <li><b>Doğrudan git:</b> Alttaki 4–12 göstergesinden bir sınıfa dokun.</li></ol>`})};
V40.profil=function(){const U=V39.Uyelik.premium(),lite=!!document.querySelector("#p40.lite");UI.sheet({title:"Profil ve ayarlar",body:()=>`<div class="pf40">
 <p class="p39-mut small">Bu cihazda yerel kullanım: hesap sistemi yoktur; ilerleme ve favoriler yalnızca bu tarayıcıda saklanır.</p>
 <p class="small"><b>Üyelik:</b> ${esc(U.aciklama||"Üyelik bilgisi bulunmuyor.")}</p>
 <div class="pf40-g">
  <button onclick="UI.close();setTimeout(()=>V40.setLite(${lite?0:1}),180)">${V40.ic("lite",20)}<span>${lite?"Tam görünüme geç":"Sade görünüme geç"}</span><small>${lite?"Dokular, ışıklar ve bitkiler geri gelir.":"Zayıf cihazlar için doku, ışık ve süsleri azaltır."}</small></button>
  <button onclick="UI.close();setTimeout(V40.yardim,200)">${V39.svg("door",20)}<span>Koridor yardımı</span><small>Kaydırma, kapı seçme ve giriş</small></button>
  <button onclick="UI.close();setTimeout(()=>V37.sndOpen(),200)">${V39.svg("vol",20)}<span>Ses</span><small>Ortam sesleri ve ses düzeyi</small></button>
  <button onclick="UI.close();setTimeout(()=>go('pfav'),220)">${V40.ic("star",20)}<span>Favorilerim</span><small>Sınıflar ve konular</small></button>
  <button onclick="UI.close();setTimeout(()=>V39.secim(true),220)">${V39.svg("swap",20)}<span>Deneyimi değiştir</span><small>Klasik Öğrenme Alanı’na geç</small></button>
  <button onclick="UI.close();setTimeout(()=>go('ogretmen'),220)">${V39.svg("teach",20)}<span>Öğretmen Paneli</span><small>Öğretmen PIN’i ile açılır</small></button>
 </div></div>`})};
V40.setLite=function(v){const o=V39.ilr();o.lite40=v?1:0;V39.ilrSave();if(view==="pdunya")draw();try{UI.toast(v?"Sade görünüm açık.":"Tam görünüm açık.")}catch(e){}};

/* ---------- 10. Favoriler ekranı (yeni Öğrenme Dünyası rotası) ---------- */
V39.ROUTES.push("pfav");
V30.routes.pfav=function(){if(!V39.on){V39.on=true;try{sessionStorage.setItem(V39.SK,"1")}catch(e){}}V39.attr();V39.r_pfav()};
V39.r_pfav=function(){const F=V40.favs(),S=F.s.filter(g=>V39.GR.includes(g)).sort((a,b)=>a-b),K=F.k.map(id=>Store.get("topics",id)).filter(t=>t&&vis(t));
 $.innerHTML=`<div class="p39 p39-pg p40-fav">${V39.top("","Favoriler")}${V39.crumb([["Koridor","go('pdunya')"],["Favoriler",""]])}
 <h1 class="p40-h1">Favorilerim</h1><p class="p39-mut">Koridordaki kapı bilgisinde, sınıf merkezinde ve ders ekranında yıldıza dokunarak ekleyebilirsin. Favoriler bu cihazda saklanır.</p>
 <h2 class="p39-h2">Sınıflar</h2>${S.length?`<div class="fv40">${S.map(g=>{const py=V39.pv(g),U=V39.units(g,py);return `<div class="fv40-k"><button class="fv40-a" onclick="go('psinif',{pg:${g}})"><span class="fv40-n">${g}</span><span><b>${g}. Sınıf</b><small>${V39.stage(g)} · ${esc(V39.pyName(py))} · ${U.length} ünite</small></span></button>${V40.favBtn("s",g)}</div>`}).join("")}</div>`:`<p class="p39-empty">Henüz favori sınıf eklemedin.</p>`}
 <h2 class="p39-h2">Konular</h2>${K.length?`<div class="fv40">${K.map(t=>{const u=Store.get("units",t.unitId)||{};return `<div class="fv40-k"><button class="fv40-a" onclick="go('pders',{pt:'${t.id}',ptab:''})"><span class="fv40-n">${t.grade}</span><span><b>${esc(t.title)}</b><small>${t.grade}. sınıf · ${esc(u.title||"")} · ${esc(V39.pyName(t.programYear))}</small></span></button>${V40.favBtn("k",t.id)}</div>`}).join("")}</div>`:`<p class="p39-empty">Henüz favori konu eklemedin.</p>`}</div>`};

/* ---------- 11. Sınıf merkezi: öğrenme araçları + favori; ders ekranında favori ---------- */
V40.ARAC=[["anlat","Anlatım","book"],["ozet","Özet","sum"],["kod","Kodlama","code"],["hik","Hikâye","story"],["tab","Tablo","tbl"],["kar","Karışanlar","mix"],["test","Mini Test","exam"],["kart","Kartlar","cards"],["oyun","Oyunlar","game"],["sin","Sınav Odaklı","pen"]];
V40.arac=function(g,py){const T=V39.units(g,py).flatMap(u=>V39.tops(u.id)),son=Store.get("topics",V39.ilr().son[g]),M={};
 T.forEach(t=>{V39.av(t).forEach(([k])=>{(M[k]=M[k]||[]).push(t)})});
 return V40.ARAC.map(([k,n,ic])=>{const L=M[k]||[],hed=L.find(t=>son&&t.id===son.id)||L[0];return{k,n,ic,say:L.length,hed}})};
(function(){const r=V39.r_psinif;V39.r_psinif=function(){r.apply(this,arguments);try{const g=+G.pg||4,py=V39.pv(g),A=V40.arac(g,py),sts=document.querySelector(".p39-sts"),hero=document.querySelector(".p39-hero");
 if(hero&&!hero.querySelector(".fav40")){const d=document.createElement("div");d.className="p40-hf";d.innerHTML=V40.favBtn("s",g,"lg");hero.appendChild(d)}
 if(sts){const s=document.createElement("section");s.className="p40-ar";s.setAttribute("aria-label","Öğrenme araçları");
  s.innerHTML=`<h2 class="p39-h2">Öğrenme araçları</h2><div class="ar40"><button onclick="V40.unitelere()"><span class="ar40-i">${V39.svg("layers",22)}</span><b>Üniteler</b><small>${V39.units(g,py).length} ünite</small></button>${A.map(a=>a.say?`<button onclick="go('pders',{pt:'${a.hed.id}',ptab:'${a.k}'})"><span class="ar40-i">${V40.aic(a.ic,22)}</span><b>${a.n}</b><small>${a.say} konuda</small></button>`:`<button disabled aria-disabled="true"><span class="ar40-i">${V40.aic(a.ic,22)}</span><b>${a.n}</b><small>Kaynakta veri bulunmuyor.</small></button>`).join("")}</div>`;
  sts.after(s)}
 const pg=document.querySelector(".p39-pg");if(pg&&V40._girdi===g&&!V40.red())pg.classList.add("p40-gel");V40._girdi=0}catch(e){}}})();
V40.unitelere=function(){const h=[...document.querySelectorAll(".p39-h2")].find(x=>x.textContent.trim()==="Üniteler");if(h)h.scrollIntoView({behavior:V40.red()?"auto":"smooth",block:"start"})};
(function(){const r=V39.r_pders;V39.r_pders=function(){r.apply(this,arguments);try{const t=Store.get("topics",G.pt),h=document.querySelector(".p39-dh h1");if(t&&h&&!document.querySelector(".p39-dh .fav40"))h.insertAdjacentHTML("afterend",`<div class="p40-df">${V40.favBtn("k",t.id)}<span>Favori konu</span></div>`)}catch(e){}}})();
