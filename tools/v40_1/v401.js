/* ===================== V40.1: koridor kapıları — aydınlatma düzeltmesi, doku üretiminde hata yönetimi =====================
   V40.0'da kapılar koyu kalıyordu: (1) ceviz dokusunun kendisi koyuydu ve üstüne siyah katmanlar biniyordu,
   (2) sade görünümde ve doku üretilemediğinde kanatlar düz, koyu bir renge düşüyordu (--t-ceviz "none" yapılıyordu),
   (3) doku üretimindeki hatalar sessizce yutuluyordu. Bu modül yalnızca dokuları ve uygulanmalarını değiştirir;
   kapı konumları, sınıf eşleşmeleri, kamera ve animasyon kodu V40.0 ile aynıdır.
   Hata ayıklama: V40.texDurum = {ok:[...], hata:[{ad,mesaj}], kaynak:"canvas"|"kısmi"|"yedek"}; ayrıca konsolda uyarı.
   Kullanıcıya teknik hata gösterilmez; eksik doku yerine CSS'teki aydınlık yedek doku (--ceviz-yedek) kalır. */
V40.VER="V40.1";
V40.texDurum={ok:[],hata:[],kaynak:"bekliyor"};
V40.texHata=function(ad,e){const m=String((e&&e.message)||e);V40.texDurum.hata.push({ad,mesaj:m});try{console.warn("[V40.1] doku üretilemedi: "+ad+" — "+m+" (yedek doku kullanılıyor)")}catch(_){}};
V40.DOKU={
 mermer(cv,R){const c=cv(512,512),x=c.getContext("2d"),g=x.createLinearGradient(0,0,512,512);g.addColorStop(0,"#ede6da");g.addColorStop(.5,"#f6f1e8");g.addColorStop(1,"#e6dccc");x.fillStyle=g;x.fillRect(0,0,512,512);
  for(let n=0;n<1800;n++){x.fillStyle=`rgba(${150+R()*60|0},${138+R()*50|0},${118+R()*40|0},${R()*.07})`;x.fillRect(R()*512,R()*512,2+R()*7,2+R()*7)}
  for(let v=0;v<10;v++){x.beginPath();let px=R()*512,py=R()*512;x.moveTo(px,py);for(let s=0;s<14;s++){const qx=px+(R()-.5)*50,qy=py+(R()-.5)*50;px+=(R()-.3)*70;py+=(R()-.5)*70;x.quadraticCurveTo(qx,qy,px,py)}x.strokeStyle=v%3?`rgba(120,108,96,${.16+R()*.2})`:`rgba(178,134,64,${.2+R()*.2})`;x.lineWidth=.6+R()*1.8;x.stroke()}
  return c},
 koyu(cv,R){const c=cv(256,256),x=c.getContext("2d");x.fillStyle="#2b2420";x.fillRect(0,0,256,256);for(let n=0;n<700;n++){x.fillStyle=`rgba(255,238,215,${R()*.05})`;x.fillRect(R()*256,R()*256,2+R()*4,2+R()*4)}
  for(let v=0;v<6;v++){x.beginPath();let px=R()*256,py=R()*256;x.moveTo(px,py);for(let s=0;s<10;s++){px+=(R()-.5)*60;py+=(R()-.3)*60;x.lineTo(px,py)}x.strokeStyle=`rgba(212,178,118,${.14+R()*.2})`;x.lineWidth=.6+R();x.stroke()}
  return c},
 /* ceviz: açık-sıcak taban, geniş ton dalgaları, görünür damarlar (512 px'de kendini tekrarlar), gözenekler */
 ceviz(cv,R){const c=cv(256,512),x=c.getContext("2d"),g=x.createLinearGradient(0,0,256,0);g.addColorStop(0,"#7a4926");g.addColorStop(.5,"#96602f");g.addColorStop(1,"#7d4b27");x.fillStyle=g;x.fillRect(0,0,256,512);
  for(let b=0;b<7;b++){const bx=R()*256,w=14+R()*30,col=R()<.5?"70,36,14":"214,160,96",gg=x.createLinearGradient(bx-w,0,bx+w,0);gg.addColorStop(0,`rgba(${col},0)`);gg.addColorStop(.5,`rgba(${col},${.08+R()*.1})`);gg.addColorStop(1,`rgba(${col},0)`);x.fillStyle=gg;x.fillRect(bx-w,0,2*w,512)}
  for(let l=0;l<90;l++){const bx=R()*256,a=1.5+R()*6,k=1+(R()*3|0),ph=R()*6.283;x.beginPath();for(let y=0;y<=512;y+=8){const xx=bx+Math.sin(y*k*Math.PI/256+ph)*a;y?x.lineTo(xx,y):x.moveTo(xx,y)}x.strokeStyle=R()<.5?`rgba(58,28,10,${.14+R()*.22})`:`rgba(226,172,108,${.08+R()*.14})`;x.lineWidth=.5+R()*1.5;x.stroke()}
  for(let n=0;n<420;n++){x.fillStyle=`rgba(52,24,8,${.1+R()*.16})`;x.fillRect(R()*256,R()*512,.8,3+R()*7)}
  return c},
 tas(cv,R){const c=cv(512,512),x=c.getContext("2d");x.fillStyle="#d3c5ad";x.fillRect(0,0,512,512);for(let n=0;n<2200;n++){x.fillStyle=`rgba(${120+R()*80|0},${100+R()*70|0},${70+R()*60|0},${R()*.07})`;x.beginPath();x.arc(R()*512,R()*512,1+R()*5,0,7);x.fill()}
  x.strokeStyle="rgba(92,72,46,.16)";x.lineWidth=1.2;for(let y=0;y<512;y+=128){x.beginPath();x.moveTo(0,y);x.lineTo(512,y);x.stroke();for(let xx=(y/128)%2?128:0;xx<512;xx+=256){x.beginPath();x.moveTo(xx,y);x.lineTo(xx,y+128);x.stroke()}}
  return c}};
V40.uret=function(){if(V40.tex)return V40.tex;const T={},D=V40.texDurum;D.ok=[];D.hata=[];let seed=40400;
 const R=()=>(seed=(seed*16807)%2147483647,(seed-1)/2147483646),cv=(w,h)=>{const c=document.createElement("canvas");c.width=w;c.height=h;return c};
 /* önce canvas'ın gerçekten çizip geri okunabildiğini doğrula (bazı gizlilik ayarları canvas çıktısını bozar) */
 let hazir=true;try{const c=cv(4,4),x=c.getContext("2d");if(!x)throw new Error("2B çizim bağlamı alınamadı");x.fillStyle="rgb(125,76,40)";x.fillRect(0,0,4,4);const d=x.getImageData(1,1,1,1).data;
  if(Math.abs(d[0]-125)>8||Math.abs(d[1]-76)>8||Math.abs(d[2]-40)>8||d[3]<250)throw new Error("canvas çıktısı beklenen renkte değil ("+[d[0],d[1],d[2],d[3]].join(",")+")")}catch(e){hazir=false;V40.texHata("canvas",e)}
 if(hazir)for(const ad of Object.keys(V40.DOKU)){try{const c=V40.DOKU[ad](cv,R);let u=c.toDataURL("image/webp",.82);if(typeof u!=="string"||u.indexOf("data:image/webp")!==0)u=c.toDataURL("image/png");
   if(typeof u!=="string"||u.indexOf("data:image/")!==0||u.length<600)throw new Error("geçersiz doku çıktısı ("+(u?u.length:0)+" karakter)");T[ad]=u;D.ok.push(ad)}catch(e){V40.texHata(ad,e)}}
 D.kaynak=D.ok.length===Object.keys(V40.DOKU).length?"canvas":D.ok.length?"kısmi":"yedek";
 return V40.tex=T};
/* Üretilen doku varsa CSS değişkenine yazılır; yoksa değişken kaldırılır ve CSS'teki yedek (aydınlık) doku devreye girer. */
V40.texUygula=function(){const el=document.getElementById("p40");if(!el)return;const T=V40.uret();
 ["mermer","koyu","ceviz","tas"].forEach(k=>{if(T[k])el.style.setProperty("--t-"+k,`url("${T[k]}")`);else el.style.removeProperty("--t-"+k)});
 el.classList.toggle("doku",!!T.ceviz);el.dataset.doku=V40.texDurum.kaynak};
