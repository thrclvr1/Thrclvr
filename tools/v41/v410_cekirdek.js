/* ===================== V41.0: Premium Oyun Dünyası — ortak altyapı =====================
   - Oyun kaydı: her oyun V41.kaydol({...}) ile eklenir; yönetici aynı yaşam döngüsünü uygular:
     baslat(kok, bolum, {devam}) · duraklat() · surdur() · yenidenBaslat() · bitir() · temizle()
   - Kayıt: ayrı, sürüm numaralı anahtar `dk-oyun41` = {v:1, oyunlar:{<oyun>:{<bölüm>:{...}}}, ayar:{kalite}}.
     Mevcut anahtarlar değiştirilmez; cevaplar yalnızca mevcut Prog.rec ile kazanım ilerlemesine işlenir (Klasik oyunlarla aynı).
   - Tek animasyon döngüsü: yalnızca oyun açık ve duraklatılmamışken çalışır; sekme arka plana geçince oyun duraklar.
   - Hata sınırı: bir oyun hata verirse yalnızca o oyun kapanır, oyun merkezi ve diğer ekranlar çalışmaya devam eder.
   - V41.G3: odalar için küçük WebGL çizici (V40.2 koridoruyla aynı yöntem: dokulu dörtgenler, derinlik tamponu). */
const V41={VER:"V41.0",K:"dk-oyun41",oyunlar:{},sira:[],aktif:null,durdu:false,_tik:new Set(),_raf:0,hatalar:[]};
V41.uyar=function(m,e){const s="[V41] "+m+(e?": "+((e&&e.message)||e):"");V41.hatalar.push(s);try{console.warn(s)}catch(_){}};

/* ---------- 1. Kayıt ---------- */
V41.kayit=function(){if(V41._k)return V41._k;let o=null;try{o=JSON.parse(localStorage.getItem(V41.K)||"null")}catch(e){V41.uyar("kayıt okunamadı",e)}
 if(!o||typeof o!=="object"||o.v!==1)o={v:1,oyunlar:{},ayar:{}};o.oyunlar=o.oyunlar||{};o.ayar=o.ayar||{};return V41._k=o};
V41.kaydet=function(){try{localStorage.setItem(V41.K,JSON.stringify(V41.kayit()))}catch(e){V41.uyar("kayıt yazılamadı",e)}};
V41.bolumKayit=function(oyun,bolum){const o=V41.kayit(),O=o.oyunlar[oyun]||(o.oyunlar[oyun]={});return O[bolum]||null};
V41.bolumYaz=function(oyun,bolum,d){const o=V41.kayit(),O=o.oyunlar[oyun]||(o.oyunlar[oyun]={});if(d==null)delete O[bolum];else O[bolum]=d;V41.kaydet()};
/* grafik kalitesi: yuksek | dengeli | sade. Seçilmemişse koridorun sade görünüm tercihi / cihaz algısı kullanılır. */
V41.kalite=function(){const a=V41.kayit().ayar.kalite;if(a==="yuksek"||a==="dengeli"||a==="sade")return a;try{return V40.lite()?"sade":"yuksek"}catch(e){return "dengeli"}};
V41.kaliteYaz=function(k){V41.kayit().ayar.kalite=k;V41.kaydet()};

/* ---------- 2. Oyun kaydı ve yaşam döngüsü ---------- */
V41.kaydol=function(t){V41.oyunlar[t.id]=t;if(!V41.sira.includes(t.id))V41.sira.push(t.id)};
V41.guvenli=function(ad,fn){try{return fn()}catch(e){V41.uyar(ad+" sırasında hata",e);V41.cokus(e);return undefined}};
V41.cokus=function(e){const O=V41.aktif;V41.aktif=null;V41.durdu=false;V41._tik.clear();try{O&&O.temizle&&O.temizle()}catch(_){}
 const k=document.getElementById("o41");if(k)k.innerHTML=`<div class="o41-hata" role="alert"><h2>Oyun açılamadı</h2><p>Bu oyunda beklenmeyen bir sorun oluştu. İlerlemen kayıtlı; oyun merkezine dönüp yeniden deneyebilirsin.</p><button class="o41-b p" onclick="go('poyun')">Oyun merkezine dön</button></div>`};
V41.baslat=function(oyunId,bolum,devam){const O=V41.oyunlar[oyunId],k=document.getElementById("o41");if(!O||!k)return;V41.durdu=false;V41.aktif=O;V41.guvenli("başlatma",()=>O.baslat(k,bolum,{devam:!!devam}))};
V41.duraklat=function(sebep){const O=V41.aktif;if(!O||V41.durdu)return;V41.durdu=true;V41.guvenli("duraklatma",()=>O.duraklat&&O.duraklat(sebep));V41.menu(true)};
V41.surdur=function(){const O=V41.aktif;if(!O||!V41.durdu)return;V41.durdu=false;V41.menu(false);V41.guvenli("sürdürme",()=>O.surdur&&O.surdur());V41.dongu()};
V41.yenidenBaslat=function(){const O=V41.aktif;if(!O)return;V41.menu(false);V41.durdu=false;V41.guvenli("yeniden başlatma",()=>O.yenidenBaslat())};
V41.cik=function(){V41.menu(false);go("poyun")};
V41.temizle=function(){const O=V41.aktif;V41.aktif=null;V41.durdu=false;V41._tik.clear();cancelAnimationFrame(V41._raf);V41._raf=0;if(O)V41.guvenli("temizleme",()=>O.temizle&&O.temizle())};
/* duraklatma menüsü (oyunun üstünde) */
V41.menu=function(ac){let m=document.getElementById("o41m");if(!ac){if(m)m.remove();return}if(m)return;const k=document.getElementById("o41");if(!k)return;const kal=V41.kalite();
 k.insertAdjacentHTML("beforeend",`<div class="o41-menu" id="o41m" role="dialog" aria-modal="true" aria-label="Oyun duraklatıldı"><div class="o41-kart"><h2>Oyun duraklatıldı</h2><p class="o41-mut">İlerlemen kaydedildi.</p>
 <button class="o41-b p" onclick="V41.surdur()">Devam et</button><button class="o41-b" onclick="V41.yenidenBaslat()">Bölümü baştan başlat</button>
 <div class="o41-kal" role="group" aria-label="Grafik kalitesi"><span>Grafik kalitesi</span>${[["yuksek","Yüksek"],["dengeli","Dengeli"],["sade","Sade"]].map(([a,b])=>`<button class="${kal===a?"on":""}" aria-pressed="${kal===a}" onclick="V41.kaliteSec('${a}')">${b}</button>`).join("")}</div>
 <button class="o41-b" onclick="V41.cik()">Oyun merkezine dön</button></div></div>`);setTimeout(()=>{const b=document.querySelector("#o41m .p");if(b)b.focus()},30)};
V41.kaliteSec=function(k){V41.kaliteYaz(k);const O=V41.aktif;V41.menu(false);if(O&&O.kaliteDegisti)V41.guvenli("kalite",()=>O.kaliteDegisti(k));if(V41.durdu)V41.menu(true)};

/* ---------- 3. Tek animasyon döngüsü ---------- */
V41.tik=function(fn,ac){if(ac===false)V41._tik.delete(fn);else{V41._tik.add(fn);V41.dongu()}};
V41.dongu=function(){if(V41._raf||!V41._tik.size||V41.durdu||document.hidden)return;let son=performance.now();const f=now=>{V41._raf=0;if(V41.durdu||document.hidden||!V41._tik.size)return;const dt=Math.min(64,now-son);son=now;
  for(const fn of [...V41._tik]){let devam=false;try{devam=fn(dt,now)}catch(e){V41.uyar("kare çiziminde hata",e);V41.cokus(e);return}if(!devam)V41._tik.delete(fn)}if(V41._tik.size)V41._raf=requestAnimationFrame(f)};V41._raf=requestAnimationFrame(f)};
document.addEventListener("visibilitychange",()=>{if(document.hidden&&V41.aktif&&view==="poyna")V41.duraklat("arka")});

/* ---------- 4. WebGL oda çizicisi ---------- */
const G3=V41.G3={};
G3.VS="attribute vec3 aP;attribute vec2 aT;attribute float aL;uniform vec3 uC;uniform vec2 uR;uniform vec4 uJ;varying vec2 vT;varying float vL;varying float vD;"+
 "void main(){vec3 d=aP-uC;float xc=d.x*uR.y+d.z*uR.x;float ds=d.x*uR.x-d.z*uR.y;vT=aT;vL=aL;vD=ds;gl_Position=vec4(xc*uJ.x,-d.y*uJ.y+uJ.z*ds,ds*1.0084-30.25,ds);}";
G3.FS="precision mediump float;varying vec2 vT;varying float vL;varying float vD;uniform sampler2D uS;uniform float uK;uniform float uE;uniform vec3 uF;uniform float uG;"+
 "void main(){vec4 c=texture2D(uS,vT);if(c.a<uK)discard;if(uE>0.5){gl_FragColor=vec4(c.rgb*c.a*vL,1.0);}else{float f=clamp((vD-700.0)/2600.0,0.0,uG);gl_FragColor=vec4(mix(c.rgb*vL,uF,f),1.0);}}";
G3.olustur=function(cv,kal){const o={alpha:false,antialias:kal!=="sade",depth:true,stencil:false,powerPreference:"default"};let g=null;try{g=cv.getContext("webgl",o)||cv.getContext("experimental-webgl",o)}catch(e){}
 if(!g)throw new Error("WebGL bağlamı alınamadı");const sh=(t,s)=>{const x=g.createShader(t);g.shaderSource(x,s);g.compileShader(x);if(!g.getShaderParameter(x,g.COMPILE_STATUS))throw new Error("gölgelendirici: "+g.getShaderInfoLog(x));return x};
 const p=g.createProgram();g.attachShader(p,sh(g.VERTEX_SHADER,G3.VS));g.attachShader(p,sh(g.FRAGMENT_SHADER,G3.FS));g.linkProgram(p);if(!g.getProgramParameter(p,g.LINK_STATUS))throw new Error("program: "+g.getProgramInfoLog(p));
 const r={cv,g,p,T:{},st:[],dyn:g.createBuffer(),a:{P:g.getAttribLocation(p,"aP"),T:g.getAttribLocation(p,"aT"),L:g.getAttribLocation(p,"aL")},u:{},an:g.getExtension("EXT_texture_filter_anisotropic")};
 ["uC","uR","uJ","uS","uK","uE","uF","uG"].forEach(n=>r.u[n]=g.getUniformLocation(p,n));return r};
G3.doku=function(r,ad,cv){const g=r.g,t=r.T[ad]||g.createTexture();g.bindTexture(g.TEXTURE_2D,t);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,cv);const pot=n=>(n&(n-1))===0;
 if(pot(cv.width)&&pot(cv.height)){g.generateMipmap(g.TEXTURE_2D);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR_MIPMAP_LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.REPEAT);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.REPEAT);if(r.an)g.texParameterf(g.TEXTURE_2D,r.an.TEXTURE_MAX_ANISOTROPY_EXT,4)}
 else{g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE)}
 g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);r.T[ad]=t};
/* dörtgen: köşeler sol-üst, sağ-üst, sağ-alt, sol-alt (12 sayı); uv [u0,v0,u1,v1]; l ışık çarpanı */
G3.dort=function(A,p,uv,l){const [u0,v0,u1,v1]=uv||[0,0,1,1],L=l==null?1:l;for(const [i,u,v] of [[0,u0,v0],[1,u1,v0],[2,u1,v1],[0,u0,v0],[2,u1,v1],[3,u0,v1]])A.push(p[i*3],p[i*3+1],p[i*3+2],u,v,L)};
/* dikey dörtgen: merkez (x,z), taban y, genişlik w, yükseklik h, yüzün baktığı yön açısı a (radyan; 0 = +z'ye bakar) */
G3.dikey=function(x,z,yTaban,w,h,a){const rx=Math.cos(a),rz=-Math.sin(a),hx=w/2*rx,hz=w/2*rz,yt=yTaban-h;return[x-hx,yt,z-hz, x+hx,yt,z+hz, x+hx,yTaban,z+hz, x-hx,yTaban,z-hz]};
G3.bagla=function(r,b){const g=r.g;g.bindBuffer(g.ARRAY_BUFFER,b);g.enableVertexAttribArray(r.a.P);g.vertexAttribPointer(r.a.P,3,g.FLOAT,false,24,0);g.enableVertexAttribArray(r.a.T);g.vertexAttribPointer(r.a.T,2,g.FLOAT,false,24,12);g.enableVertexAttribArray(r.a.L);g.vertexAttribPointer(r.a.L,1,g.FLOAT,false,24,20)};
/* statik: {doku:[sayılar]} → ekran kartına bir kez yüklenir */
G3.statik=function(r,B){const g=r.g;r.st.forEach(s=>g.deleteBuffer(s.b));r.st=Object.keys(B).filter(t=>B[t].length).map(t=>{const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array(B[t]),g.STATIC_DRAW);return{t,b,n:B[t].length/6}})};
/* kamera: {x,y,z,yaw(derece),P,W,H,oy(ufuk oranı)} ; dinamik: [{t, v:[...], k:alfaEşiği, e:eklemeli}] */
G3.ciz=function(r,c,dyn,sis){const g=r.g,y=c.yaw*Math.PI/180;g.viewport(0,0,r.cv.width,r.cv.height);const F=sis||[.9,.82,.68];g.clearColor(F[0],F[1],F[2],1);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);
 g.enable(g.DEPTH_TEST);g.depthFunc(g.LEQUAL);g.depthMask(true);g.disable(g.BLEND);g.disable(g.CULL_FACE);g.useProgram(r.p);
 g.uniform3f(r.u.uC,c.x,c.y||0,c.z);g.uniform2f(r.u.uR,Math.sin(y),Math.cos(y));g.uniform4f(r.u.uJ,c.P/(c.W/2),c.P/(c.H/2),1-2*c.oy,0);g.uniform3f(r.u.uF,F[0],F[1],F[2]);g.uniform1f(r.u.uG,c.sis==null?.12:c.sis);g.uniform1i(r.u.uS,0);g.uniform1f(r.u.uE,0);g.uniform1f(r.u.uK,.5);g.activeTexture(g.TEXTURE0);
 for(const s of r.st){if(!r.T[s.t])continue;g.bindTexture(g.TEXTURE_2D,r.T[s.t]);G3.bagla(r,s.b);g.drawArrays(g.TRIANGLES,0,s.n)}
 if(dyn&&dyn.length){const tum=[],ar=[];dyn.forEach(d=>{ar.push([d,tum.length/6,d.v.length/6]);for(let i=0;i<d.v.length;i++)tum.push(d.v[i])});G3.bagla(r,r.dyn);g.bufferData(g.ARRAY_BUFFER,new Float32Array(tum),g.DYNAMIC_DRAW);
  ar.sort((a,b)=>(a[0].e?1:0)-(b[0].e?1:0)).forEach(([d,o,n])=>{if(!n||!r.T[d.t])return;g.bindTexture(g.TEXTURE_2D,r.T[d.t]);if(d.e){g.enable(g.BLEND);g.blendFunc(g.ONE,g.ONE);g.depthMask(false);g.uniform1f(r.u.uE,1);g.uniform1f(r.u.uK,0)}else{g.uniform1f(r.u.uE,0);g.uniform1f(r.u.uK,d.k==null?.5:d.k)}g.drawArrays(g.TRIANGLES,o,n)});
  g.depthMask(true);g.disable(g.BLEND)}};
/* dünya noktasını ekrana iz düşür (CSS pikseli); d = derinlik */
G3.iz=function(c,x,y,z){const a=c.yaw*Math.PI/180,sn=Math.sin(a),cs=Math.cos(a),dx=x-c.x,dz=z-c.z,xc=dx*cs+dz*sn,ds=dx*sn-dz*cs,dy=y-(c.y||0);return{x:c.W/2+c.P*xc/ds,y:c.oy*c.H+c.P*dy/ds,d:ds}};
G3.kutu=function(c,p){const P=[0,1,2,3].map(i=>G3.iz(c,p[i*3],p[i*3+1],p[i*3+2]));if(P.some(q=>q.d<40))return null;const xs=P.map(q=>q.x),ys=P.map(q=>q.y),l=Math.min(...xs),r=Math.max(...xs),t=Math.min(...ys),b=Math.max(...ys);
 return r<0||l>c.W||b<0||t>c.H?null:{l,t,w:r-l,h:b-t,d:Math.min(...P.map(q=>q.d))}};
G3.birak=function(r){if(!r)return;try{const g=r.g;Object.values(r.T).forEach(t=>g.deleteTexture(t));r.st.forEach(s=>g.deleteBuffer(s.b));g.deleteBuffer(r.dyn);g.deleteProgram(r.p);const x=g.getExtension("WEBGL_lose_context");if(x)x.loseContext()}catch(e){}};

/* ---------- 5. Ortak yardımcılar ---------- */
V41.kar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
V41.svg=(k,s)=>`<svg width="${s||20}" height="${s||20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({
 dur:'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',defter:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6"/>',
 ipucu:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',yildiz:'<path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
 kilit:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',acik:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',goz:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>',ok:'<path d="M5 12l5 5L20 7"/>',sol:'<path d="M15 18l-6-6 6-6"/>',sag:'<path d="M9 18l6-6-6-6"/>',kupa:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',oyna:'<path d="M7 4v16l13-8z"/>',kitap:'<path d="M4 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4z"/><path d="M20 5h-6a3 3 0 0 0-3 3"/><path d="M20 5v13h-7"/>'
})[k]||""}</svg>`;

/* ---------- 6. Oyun merkezi (rota: poyun) ve oyun ekranı (rota: poyna) ---------- */
V39.ROUTES.push("poyun","poyna");
["poyun","poyna"].forEach(r=>{V30.routes[r]=function(){if(!V39.on){V39.on=true;try{sessionStorage.setItem(V39.SK,"1")}catch(e){}}V39.attr();V39["r_"+r]()}});
/* ekrandan çıkınca oyunu temizle (kayıt oyunun kendi kaydet() çağrısıyla her adımda yapılır) */
(function(){const d=draw;draw=function(){if(view!=="poyna"&&V41.aktif)V41.temizle();return d.apply(this,arguments)}})();
V39.r_poyun=function(){const K=V41.sira.map(id=>V41.oyunlar[id]);
 $.innerHTML=`<div class="p39 p39-pg o41-merkez">${V39.top("","Oyun Dünyası")}${V39.crumb([["Koridor","go('pdunya')"],["Oyun Dünyası",""]])}
 <header class="o41-bas"><p class="p39-ey">Premium</p><h1>Oyun Dünyası</h1><p class="p39-mut">Keşfet, ipuçlarını topla, bulmacaları çöz. Bulmacalar ders içeriğindeki gerçek kayıtlardan kurulur.</p></header>
 <div class="o41-oyunlar">${K.map(O=>{const B=(O.bolumler&&O.bolumler())||[];return `<section class="o41-oyun ${O.durum!=="hazir"?"yakinda":""}" aria-labelledby="o41-${O.id}">
  <div class="o41-afis" style="${O.afis||""}" aria-hidden="true"><i></i></div><div class="o41-ic"><h2 id="o41-${O.id}">${esc(O.ad)}</h2><p>${esc(O.ozet||"")}</p>
  ${O.durum!=="hazir"?`<p class="o41-etk">Geliştiriliyor — henüz oynanamaz.</p>`:B.map(b=>{const k=V41.bolumKayit(O.id,b.id),y=k&&k.yildiz?Object.values(k.yildiz).reduce((a,x)=>a+x,0):0,ym=b.odaSay*3;
   return `<div class="o41-bol"><div><b>${esc(b.ad)}</b><small>${esc(b.alt)}</small>${b.uyari?`<small class="o41-uy">${esc(b.uyari)}</small>`:""}<span class="o41-yz" aria-label="${y} / ${ym} yıldız">${V41.svg("yildiz",14)} ${y} / ${ym}${k&&k.bitti?" · tamamlandı":k?" · devam ediyor":""}</span></div>
   ${b.hazir?`<div class="o41-bb">${k&&!k.bitti?`<button class="o41-b p" onclick="go('poyna',{oyn:'${O.id}',obol:'${b.id}',odevam:1})">${V41.svg("oyna",18)} Devam et</button><button class="o41-b" onclick="go('poyna',{oyn:'${O.id}',obol:'${b.id}',odevam:0})">Baştan başla</button>`:`<button class="o41-b p" onclick="go('poyna',{oyn:'${O.id}',obol:'${b.id}',odevam:0})">${V41.svg("oyna",18)} ${k&&k.bitti?"Yeniden oyna":"Oyna"}</button>`}</div>`:`<p class="o41-etk">${esc(b.neden||"Kaynakta veri bulunmuyor.")}</p>`}</div>`}).join("")}</div></section>`}).join("")}
  <section class="o41-oyun klasik"><div class="o41-ic"><h2>Klasik oyunlar</h2><p>Eşleştirme, gruplandırma, kelime avı ve diğer 12 oyun türü (mevcut oyun merkezi).</p><div class="o41-bb"><button class="o41-b" onclick="go('games')">${V41.svg("oyna",18)} Klasik oyunlara git</button></div></div></section></div></div>`};
V39.r_poyna=function(){const O=V41.oyunlar[G.oyn];if(!O||O.durum!=="hazir"){go("poyun");return}
 $.innerHTML=`<div class="o41-ekran" id="o41" data-oyun="${esc(O.id)}"></div>`;V41.baslat(O.id,G.obol,!!G.odevam)};
/* Öğrenme Dünyası'ndaki “Oyunlar” girişleri yeni oyun merkezine gider (Klasik oyunlar oradan açılır) */
(function(){const hz=V39.hz;V39.hz=function(k){if(k==="oyun")return go("poyun");return hz.apply(this,arguments)}})();
