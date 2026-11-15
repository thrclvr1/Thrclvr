/* ===================== V36.0: öğretmen PIN oturumu · açılış ekranı ===================== */
const V36={VER:"V36.0",SK:"dk-ogrt-oturum",AK:"dk-ogrt-deneme",PK:"dk-ogretmen-pin",MAX:5,LOCK:30000,
 /* Varsayılan PIN açık metin olarak saklanmaz; yalnızca tuzlu SHA-256 özeti tutulur. */
 DEF:{salt:"v36-varsayilan",h:"__DEF_HASH__"}};
/* Küçük SHA-256 (FIPS 180-4). crypto.subtle file:// ve bazı WebView'larda kullanılamadığı için yerel uygulama. */
V36.sha256=function(str){const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 const b=Array.from(new TextEncoder().encode(str)),l=b.length*8;b.push(0x80);while(b.length%64!==56)b.push(0);for(let i=7;i>=0;i--)b.push(Math.floor(l/Math.pow(2,8*i))&255);
 let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];const r=(x,n)=>(x>>>n)|(x<<(32-n)),w=new Array(64);
 for(let o=0;o<b.length;o+=64){for(let i=0;i<16;i++)w[i]=(b[o+4*i]<<24)|(b[o+4*i+1]<<16)|(b[o+4*i+2]<<8)|b[o+4*i+3];
  for(let i=16;i<64;i++){const s0=r(w[i-15],7)^r(w[i-15],18)^(w[i-15]>>>3),s1=r(w[i-2],17)^r(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0}
  let[a,bb,c,d,e,f,g,h]=H;for(let i=0;i<64;i++){const S1=r(e,6)^r(e,11)^r(e,25),ch=(e&f)^(~e&g),t1=(h+S1+ch+K[i]+w[i])|0,S0=r(a,2)^r(a,13)^r(a,22),mj=(a&bb)^(a&c)^(bb&c),t2=(S0+mj)|0;h=g;g=f;f=e;e=(d+t1)|0;d=c;c=bb;bb=a;a=(t1+t2)|0}
  H=[H[0]+a,H[1]+bb,H[2]+c,H[3]+d,H[4]+e,H[5]+f,H[6]+g,H[7]+h].map(x=>x|0)}
 return H.map(x=>(x>>>0).toString(16).padStart(8,"0")).join("")};
V36.hash=(salt,pin)=>V36.sha256("dkab36|"+salt+"|"+pin);
V36.rec=function(){try{const o=JSON.parse(localStorage.getItem(V36.PK)||"null");if(o&&o.v===1&&typeof o.salt==="string"&&/^[0-9a-f]{64}$/.test(o.h||""))return o}catch(e){}return V36.DEF};
V36.ss=(k,v)=>{try{if(v===undefined)return sessionStorage.getItem(k);if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v)}catch(e){return null}};
/* Oturum: sessionStorage (sekme/uygulama örneği kapanınca silinir; yenileme, arka plana geçiş ve ekran kilidinde korunur). Kalıcı depoya yazılmaz. */
V36.ok=()=>V36.ss(V36.SK)==="1";
V36.att=function(){try{return Object.assign({n:0,until:0},JSON.parse(V36.ss(V36.AK)||"{}"))}catch(e){return{n:0,until:0}}};
V36.check=function(pin){const a=V36.att(),now=Date.now();if(a.until>now)return{ok:false,lock:Math.ceil((a.until-now)/1000)};
 const R=V36.rec();if(/^\d{4}$/.test(pin)&&V36.hash(R.salt,pin)===R.h){V36.ss(V36.AK,null);V36.ss(V36.SK,"1");return{ok:true}}
 a.n++;if(a.n>=V36.MAX){a.until=now+V36.LOCK;a.n=0;V36.ss(V36.AK,JSON.stringify(a));return{ok:false,lock:Math.ceil(V36.LOCK/1000)}}
 V36.ss(V36.AK,JSON.stringify(a));return{ok:false,left:V36.MAX-a.n}};
V36.logout=function(){V36.ss(V36.SK,null);try{UI.close()}catch(e){}UI.toast("Öğretmen oturumu kapatıldı.");go("home")};
V36.pinView=function(){const a=V36.att(),lock=a.until>Date.now();
 $.innerHTML=`<section class="pin36" aria-labelledby="pin36-h"><div class="pin36-c"><span class="pin36-i" aria-hidden="true">${ico("ogrt",28)}</span><h1 id="pin36-h">Öğretmen Paneli</h1><p class="mut">Devam etmek için 4 haneli öğretmen PIN'ini gir.</p>
 <form onsubmit="return V36.submit(event)" autocomplete="off"><label for="pin36-in" class="sr36">PIN</label><input id="pin36-in" name="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="go" aria-describedby="pin36-msg" ${lock?"disabled":""} oninput="this.value=this.value.replace(/\\D/g,'').slice(0,4);V36.dots(this.value.length);if(this.value.length===4)this.form.requestSubmit()">
 <div class="pin36-d" aria-hidden="true"><i></i><i></i><i></i><i></i></div><button class="pin36-b" type="submit" ${lock?"disabled":""}>Giriş</button></form>
 <p id="pin36-msg" class="pin36-m" role="alert">${lock?`Çok fazla hatalı deneme. ${Math.ceil((a.until-Date.now())/1000)} saniye sonra tekrar dene.`:""}</p>
 <p class="small mut">Öğrenci ekranları PIN gerektirmez. Bu, cihaz üzerinde basit bir erişim ayrımıdır; sunucu tabanlı güvenlik değildir.</p><button class="pin36-x" onclick="go('home')">Ana sayfaya dön</button></div></section>`;
 const i=document.getElementById("pin36-in");if(i&&!lock)try{i.focus({preventScroll:true})}catch(e){}
 if(lock){clearTimeout(V36._lt);V36._lt=setTimeout(()=>{if(view==="ogretmen"&&!V36.ok())V36.pinView()},Math.max(500,a.until-Date.now()+50))}};
V36.dots=n=>document.querySelectorAll(".pin36-d i").forEach((d,k)=>d.classList.toggle("on",k<n));
V36.submit=function(ev){ev.preventDefault();const i=document.getElementById("pin36-in"),m=document.getElementById("pin36-msg"),r=V36.check(i.value);
 if(r.ok){UI.toast("Öğretmen oturumu açıldı.");OGRT.render();return false}
 i.value="";V36.dots(0);if(r.lock){V36.pinView();return false}
 m.textContent=`PIN hatalı. Kalan deneme: ${r.left}.`;i.classList.remove("err36");void i.offsetWidth;i.classList.add("err36");try{i.focus()}catch(e){}return false};
/* Bütün giriş yolları: rota (ana sayfa kartı, alt menü, geri/ileri), OGRT.render ve haftalık ekranın kendi çizimi. */
(function(){const R=V30.routes.ogretmen;V30.routes.ogretmen=function(){if(!V36.ok())return V36.pinView();return R.apply(this,arguments)};
 const OR=OGRT.render;OGRT.render=function(){if(!V36.ok()){if(view==="ogretmen")V36.pinView();return}return OR.apply(this,arguments)};
 const WR=OGRT.W.render;OGRT.W.render=function(){if(!V36.ok()){if(view==="ogretmen")V36.pinView();return}return WR.apply(this,arguments)}})();
/* PIN değiştirme (Diğer › Yedekleme sayfasında) */
V36.pinForm=()=>`<section class="og-sec pin36-s"><h3>Öğretmen PIN'i</h3><p class="small">PIN yalnızca bu cihazda, özet (hash) olarak saklanır; JSON yedeğine eklenmez. PIN unutulursa bu cihazda öğretmen paneli açılamaz; kayıtlar silinmez.</p>
 <form class="og-form" onsubmit="return V36.change(event)" autocomplete="off"><div class="og-fr"><label>Mevcut PIN<input name="a" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]*" autocomplete="off" required></label><label>Yeni PIN<input name="b" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]*" autocomplete="off" required></label><label>Yeni PIN (tekrar)<input name="c" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]*" autocomplete="off" required></label></div>
 <div class="og-acts"><button class="p" type="submit">PIN'i değiştir</button></div><p class="small bad og-err" role="alert"></p></form></section>`;
V36.change=function(ev){ev.preventDefault();const f=ev.target,v=n=>f.elements[n].value.trim(),err=t=>{f.querySelector(".og-err").textContent=t;return false},R=V36.rec();
 if(V36.hash(R.salt,v("a"))!==R.h)return err("Mevcut PIN hatalı.");if(!/^\d{4}$/.test(v("b")))return err("Yeni PIN 4 rakam olmalı.");if(v("b")!==v("c"))return err("Yeni PIN'ler aynı değil.");
 const salt=Array.from(crypto.getRandomValues?crypto.getRandomValues(new Uint8Array(8)):[Date.now()%256]).map(x=>x.toString(16).padStart(2,"0")).join("");
 try{localStorage.setItem(V36.PK,JSON.stringify({v:1,salt,h:V36.hash(salt,v("b")),at:new Date().toISOString()}))}catch(e){return err("PIN kaydedilemedi: tarayıcı depolaması kullanılamıyor.")}
 f.reset();UI.toast("PIN değiştirildi.");return false};
(function(){const Y=OGRT.vYedek;OGRT.vYedek=function(){return Y.apply(this,arguments)+V36.pinForm()}})();
/* Oturumu kapat düğmesi: panel başlığında */
(function(){const OR=OGRT.render;OGRT.render=function(){const r=OR.apply(this,arguments);if(V36.ok()){const t=document.querySelector(".og-top");if(t&&!t.querySelector(".og-out")){const b=document.createElement("button");b.className="og-out";b.type="button";b.textContent="Oturumu kapat";b.onclick=V36.logout;t.appendChild(b)}}return r}})();
/* Açılış ekranı: ilk çizim bitince kaldırılır (bkz. dosya sonundaki draw();V36.boot();) */
V36.boot=function(){const b=document.getElementById("boot36");if(!b)return;requestAnimationFrame(()=>{b.classList.add("out");setTimeout(()=>b.remove(),180)})};
V31.VER="V36.0";
