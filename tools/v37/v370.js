/* ===================== V37.0: öğretmen renk kimliği · kişisel PIN · üst çubuktan ses kontrolü ===================== */
const V37={VER:"V37.0",LK:"dk-ogrt-kilit37"};

/* ---------- 1. Öğretmen modu: <body data-ogrt37> (renk sistemi CSS'te; öğrenci ekranlarına dönünce kalkar) ---------- */
V37.mode=function(){try{const on=typeof view!=="undefined"&&view==="ogretmen";if(document.body.hasAttribute("data-ogrt37")!==on)document.body.toggleAttribute("data-ogrt37",on)}catch(e){}};
(function(){const d=draw;draw=function(){V37.mode();const r=d.apply(this,arguments);V37.mode();try{V37.sndBtn()}catch(e){}return r}})();

/* ---------- 2. Kişisel PIN ----------
   Sabit varsayılan PIN yok. Kayıt yoksa ilk girişte öğretmen 4 veya 6 haneli PIN oluşturur.
   Saklama: localStorage "dk-ogretmen-pin" içinde yalnızca tuzlu SHA-256 özeti ({v:2,salt,h,len}).
   V36'da kullanıcının kendi belirlediği 4 haneli PIN ({v:1,...}) aynen geçerli kalır.
   Bu, öğrencilerin yanlışlıkla öğretmen paneline girmesini önleyen cihaz içi bir ayrımdır; gerçek kimlik doğrulama değildir. */
V36.rec=function(){try{const o=JSON.parse(localStorage.getItem(V36.PK)||"null");if(o&&typeof o.salt==="string"&&/^[0-9a-f]{64}$/.test(o.h||"")){if(o.v===1)return{v:1,salt:o.salt,h:o.h,len:4};if(o.v===2&&(o.len===4||o.len===6))return o}}catch(e){}return null};
V37.salt=()=>Array.from(crypto.getRandomValues?crypto.getRandomValues(new Uint8Array(12)):Array.from({length:12},()=>Math.random()*256|0)).map(x=>(x&255).toString(16).padStart(2,"0")).join("");
V37.setPin=function(pin){const salt=V37.salt();localStorage.setItem(V36.PK,JSON.stringify({v:2,salt,h:V36.hash(salt,pin),len:pin.length,at:new Date().toISOString()}))};
/* Hatalı deneme sayacı: localStorage (sekme kapatılınca sıfırlanmasın). 5 hatada 30 sn, sonraki her 5 hatada süre iki katı (en çok 5 dk).
   Bu yalnızca JavaScript tarafında bir bekletmedir; cihaz depolamasına erişen biri bunu atlayabilir. */
V37.att=function(){try{return Object.assign({n:0,until:0,r:0},JSON.parse(localStorage.getItem(V37.LK)||"{}"))}catch(e){return{n:0,until:0,r:0}}};
V37.attSave=a=>{try{a?localStorage.setItem(V37.LK,JSON.stringify(a)):localStorage.removeItem(V37.LK)}catch(e){}};
V37.lockLeft=()=>{const a=V37.att();return a.until>Date.now()?Math.ceil((a.until-Date.now())/1000):0};
V36.check=function(pin){const R=V36.rec();if(!R)return{ok:false,none:true};const left=V37.lockLeft();if(left)return{ok:false,lock:left};
 if(new RegExp("^\\d{"+R.len+"}$").test(pin)&&V36.hash(R.salt,pin)===R.h){V37.attSave(null);V36.ss(V36.AK,null);V36.ss(V36.SK,"1");return{ok:true}}
 const a=V37.att();a.n++;if(a.n>=V36.MAX){const ms=Math.min(300000,V36.LOCK*Math.pow(2,a.r||0));a.until=Date.now()+ms;a.n=0;a.r=(a.r||0)+1;V37.attSave(a);return{ok:false,lock:Math.ceil(ms/1000)}}
 V37.attSave(a);return{ok:false,left:V36.MAX-a.n}};

V37.pv={mode:"",len:4,first:"",buf:"",msg:""};
V37.coarse=()=>{try{return matchMedia("(pointer:coarse)").matches}catch(e){return false}};
V36.pinView=function(){const R=V36.rec(),P=V37.pv;
 if(P.mode!=="reset"){const want=R?"login":(P.mode==="new2"?"new2":"new");if(P.mode!==want){P.mode=want;P.buf="";P.first="";if(want==="new")P.len=P.len===6?6:4}}
 if(P.mode==="login")P.len=R.len;
 V37.pinPaint()};
V37.pinPaint=function(){const P=V37.pv,lock=P.mode==="login"?V37.lockLeft():0,dis=lock?"disabled":"";
 const T={login:["Öğretmen Paneli",`Devam etmek için ${P.len} haneli PIN'ini gir.`],new:["Öğretmen PIN'i oluştur","Bu cihazda öğretmen paneli için kendi PIN'ini belirle."],new2:["PIN'i doğrula","Aynı PIN'i bir kez daha gir."],reset:["PIN'i sıfırla",""]}[P.mode];
 const len=P.mode==="new"?`<div class="pin37-len" role="radiogroup" aria-label="PIN uzunluğu">${[4,6].map(n=>`<button type="button" role="radio" aria-checked="${P.len===n}" class="${P.len===n?"on":""}" onclick="V37.setLen(${n})">${n} haneli</button>`).join("")}</div>`:"";
 const step=P.mode==="new"?`<p class="pin37-st">Adım 1 / 2</p>`:P.mode==="new2"?`<p class="pin37-st">Adım 2 / 2</p>`:"";
 let body;
 if(P.mode==="reset")body=`<div class="pin37-rs"><p>PIN yalnızca bu cihazda saklanır ve <b>geri getirilemez</b>. Sıfırlarsan <b>yalnızca PIN silinir</b>; sınıfların, kazanım durumların, haftalık planın, notların, ders planların ve yedeklerin olduğu gibi kalır. Ardından yeni PIN oluşturursun.</p>
  <form onsubmit="return V37.doReset(event)" autocomplete="off"><label for="pin37-rw">Onaylamak için <b>SIFIRLA</b> yaz</label><input id="pin37-rw" name="w" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" required>
  <div class="pin37-acts"><button class="pin37-b" type="submit">PIN'i sıfırla</button><button class="pin37-x" type="button" onclick="V37.pv.mode='';V36.pinView()">Vazgeç</button></div></form></div>`;
 else body=`${len}<form class="pin37-f" onsubmit="return V37.submit(event)" autocomplete="off"><label for="pin37-in" class="sr36">PIN</label>
  <input id="pin37-in" class="pin37-in" name="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="${P.len}" autocomplete="${P.mode==="login"?"current-password":"new-password"}" enterkeyhint="done" aria-describedby="pin37-msg" value="" ${dis} oninput="V37.typed(this)">
  <span id="pin37-cnt" class="sr36" aria-live="polite"></span><div class="pin37-d" aria-hidden="true">${Array.from({length:P.len},(_,k)=>`<i class="${k<P.buf.length?"on":""}"></i>`).join("")}</div>
  <div class="pin37-k" role="group" aria-label="Sayı tuşları">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" ${dis} onclick="V37.key('${n}')">${n}</button>`).join("")}<span></span><button type="button" ${dis} onclick="V37.key('0')">0</button><button type="button" class="pin37-del" ${dis} onclick="V37.key('del')" aria-label="Son rakamı sil">⌫</button></div></form>`;
 $.innerHTML=`<section class="pin37" aria-labelledby="pin37-h"><div class="pin37-c"><span class="pin37-i" aria-hidden="true">${ico("ogrt",26)}</span>${step}<h1 id="pin37-h">${T[0]}</h1>${T[1]?`<p class="pin37-p">${T[1]}</p>`:""}
  ${body}<p id="pin37-msg" class="pin37-m" role="alert">${lock?`Çok fazla hatalı deneme. ${lock} saniye sonra tekrar dene.`:esc(P.msg||"")}</p>
  <div class="pin37-ft">${P.mode==="login"?`<button class="pin37-x" type="button" onclick="V37.pv.mode='reset';V37.pv.msg='';V37.pinPaint()">PIN'imi unuttum</button>`:""}${P.mode==="new2"?`<button class="pin37-x" type="button" onclick="V37.pv.mode='new';V37.pv.buf='';V37.pv.first='';V37.pv.msg='';V37.pinPaint()">Baştan başla</button>`:""}<button class="pin37-x" type="button" onclick="V37.pv.msg='';go('home')">Ana sayfaya dön</button></div>
  <p class="pin37-note">Öğrenci ekranları PIN gerektirmez. Bu PIN, öğrencilerin öğretmen paneline yanlışlıkla girmesini önleyen <b>cihaz içi basit bir ayrımdır</b>; gerçek kimlik doğrulama ya da sunucu tabanlı güvenlik değildir.</p></div></section>`;
 P.msg="";
 const i=document.getElementById(P.mode==="reset"?"pin37-rw":"pin37-in");if(i&&!lock&&(!V37.coarse()||P.mode==="reset"))try{i.focus({preventScroll:true})}catch(e){}
 clearTimeout(V37._lt);if(lock)V37._lt=setTimeout(()=>{if(view==="ogretmen"&&!V36.ok())V37.pinPaint()},Math.max(500,lock*1000+50))};
V37.setLen=function(n){const P=V37.pv;if(P.mode!=="new")return;P.len=n;P.buf="";V37.pinPaint()};
V37.dots=function(){const P=V37.pv;document.querySelectorAll(".pin37-d i").forEach((d,k)=>d.classList.toggle("on",k<P.buf.length));const c=document.getElementById("pin37-cnt");if(c)c.textContent=`${P.buf.length} / ${P.len} rakam girildi`};
V37.typed=function(inp){const P=V37.pv;inp.value=inp.value.replace(/\D/g,"").slice(0,P.len);P.buf=inp.value;V37.dots();if(P.buf.length===P.len)V37.done()};
V37.key=function(k){const P=V37.pv,inp=document.getElementById("pin37-in");if(!inp||inp.disabled)return;if(k==="del")P.buf=P.buf.slice(0,-1);else if(P.buf.length<P.len)P.buf+=k;inp.value=P.buf;V37.dots();if(P.buf.length===P.len)V37.done()};
V37.submit=function(ev){ev.preventDefault();const P=V37.pv;if(P.buf.length===P.len)V37.done();else{const m=document.getElementById("pin37-msg");if(m)m.textContent=`PIN ${P.len} rakam olmalı.`}return false};
V37.err=function(t){const P=V37.pv;P.buf="";P.msg=t;V37.pinPaint();const i=document.getElementById("pin37-in");if(i){i.classList.add("err36");setTimeout(()=>i.classList.remove("err36"),600)}};
V37.done=function(){const P=V37.pv,pin=P.buf;
 if(P.mode==="new"){P.first=pin;P.buf="";P.mode="new2";V37.pinPaint();return}
 if(P.mode==="new2"){if(pin!==P.first){P.mode="new";P.first="";return V37.err("PIN'ler eşleşmedi. Yeniden oluştur.")}
  try{V37.setPin(pin)}catch(e){P.mode="new";P.first="";return V37.err("PIN kaydedilemedi: tarayıcı depolaması kullanılamıyor.")}
  V37.attSave(null);V36.ss(V36.SK,"1");P.mode="";P.buf="";P.first="";UI.toast("PIN oluşturuldu. Öğretmen oturumu açıldı.");OGRT.render();return}
 const r=V36.check(pin);if(r.ok){P.mode="";P.buf="";UI.toast("Öğretmen oturumu açıldı.");OGRT.render();return}
 if(r.none)return V36.pinView();
 if(r.lock){P.buf="";return V37.pinPaint()}
 V37.err(`PIN hatalı. Kalan deneme: ${r.left}.`)};
V37.doReset=function(ev){ev.preventDefault();const w=(ev.target.elements.w.value||"").trim().toLocaleUpperCase("tr-TR");
 if(w!=="SIFIRLA"){const m=document.getElementById("pin37-msg");if(m)m.textContent="Onay sözcüğü hatalı. PIN sıfırlanmadı.";return false}
 try{localStorage.removeItem(V36.PK)}catch(e){}V37.attSave(null);V36.ss(V36.SK,null);const P=V37.pv;P.mode="new";P.len=4;P.buf="";P.first="";P.msg="";
 UI.toast("PIN sıfırlandı. Öğretmen kayıtların korunuyor.");V37.pinPaint();return false};

/* PIN değiştirme (Diğer › Yedekleme) — 4 veya 6 hane */
V36.pinForm=function(){const R=V36.rec();return `<section class="og-sec pin36-s"><h3>Öğretmen PIN'i</h3><p class="small">PIN yalnızca bu cihazda, özet (hash) olarak saklanır; JSON yedeğine eklenmez. PIN değiştirmek ya da sıfırlamak öğretmen kayıtlarını silmez. Bu, cihaz içi basit bir erişim ayrımıdır; gerçek güvenlik değildir.</p>
 <form class="og-form" onsubmit="return V36.change(event)" autocomplete="off"><div class="og-fr"><label>Mevcut PIN<input name="a" type="password" inputmode="numeric" maxlength="6" pattern="[0-9]*" autocomplete="current-password" required></label>
 <label>Yeni PIN uzunluğu<select name="n"><option value="4" ${R&&R.len===6?"":"selected"}>4 haneli</option><option value="6" ${R&&R.len===6?"selected":""}>6 haneli</option></select></label>
 <label>Yeni PIN<input name="b" type="password" inputmode="numeric" maxlength="6" pattern="[0-9]*" autocomplete="new-password" required></label><label>Yeni PIN (tekrar)<input name="c" type="password" inputmode="numeric" maxlength="6" pattern="[0-9]*" autocomplete="new-password" required></label></div>
 <div class="og-acts"><button class="p" type="submit">PIN'i değiştir</button></div><p class="small bad og-err" role="alert"></p></form></section>`};
V36.change=function(ev){ev.preventDefault();const f=ev.target,v=n=>f.elements[n].value.trim(),err=t=>{f.querySelector(".og-err").textContent=t;return false},R=V36.rec(),n=+v("n");
 if(!R||V36.hash(R.salt,v("a"))!==R.h)return err("Mevcut PIN hatalı.");if(!new RegExp("^\\d{"+n+"}$").test(v("b")))return err(`Yeni PIN ${n} rakam olmalı.`);if(v("b")!==v("c"))return err("Yeni PIN'ler aynı değil.");
 try{V37.setPin(v("b"))}catch(e){return err("PIN kaydedilemedi: tarayıcı depolaması kullanılamıyor.")}
 f.reset();f.querySelector(".og-err").textContent="";UI.toast("PIN değiştirildi.");return false};
V36.logout=function(){V36.ss(V36.SK,null);V37.pv.mode="";try{UI.close()}catch(e){}UI.toast("Öğretmen oturumu kapatıldı.");go("home")};

/* ---------- 3. Ses: içerik üzerinde yüzen oynatıcı yok; kontrol üst çubuktaki ses simgesinden ----------
   Ses (Web Audio) gezinmeden bağımsız çalışır; sayfa/alt sekme değişince ve bu panel açılıp kapanınca kesilmez. */
ATM.fab=function(){const f=document.getElementById("atm-fab");if(f)f.remove()};
ATM.bar=function(){const b=document.getElementById("atm-bar");if(b)b.remove();try{V37.sndPaint()}catch(e){}};
V37.SPK='<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>';
V37.sndIco=function(){const R=ATM.rt;return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${V37.SPK}${R.playing?'<path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.5 7.5 0 0 1 0 10.4"/>':R.paused?'<path d="M16 9.5v5M19 9.5v5"/>':'<path d="M16 10l4 4M20 10l-4 4"/>'}</svg>`};
V37.sndLabel=()=>{const R=ATM.rt,n=ATM.st.name||"Ders Atmosferi";return R.playing?`Ses kontrolü — çalıyor: ${n}`:R.paused?`Ses kontrolü — duraklatıldı: ${n}`:"Ses kontrolü — ses kapalı"};
V37.sndBtn=function(){const h=document.querySelector("header.top");if(!h)return null;let b=document.getElementById("snd37");
 if(!b){b=document.createElement("button");b.id="snd37";b.type="button";b.className="iconbtn snd37";b.setAttribute("aria-haspopup","dialog");b.onclick=()=>V37.sndOpen();
  const first=[...h.querySelectorAll(".iconbtn")][0];if(first)first.before(b);else h.appendChild(b);b.dataset.s="";}
 const R=ATM.rt,s=R.playing?"play":R.paused?"pause":"off";if(b.dataset.s!==s){b.dataset.s=s;b.innerHTML=V37.sndIco()+'<i class="snd37-dot" aria-hidden="true"></i>'}
 const l=V37.sndLabel();if(b.getAttribute("aria-label")!==l){b.setAttribute("aria-label",l);b.title=l}return b};
V37.sndBody=function(){const R=ATM.rt,st=ATM.st,n=st.L.length,tl=ATM.left(),cur=st.name||"";
 const stat=R.err&&!R.playing?"Ses başlatılamadı":R.playing?"Çalıyor":R.paused?"Duraklatıldı":(n?"Hazır":"Ses kapalı");
 const M=ATM.allMixes(),Q=ATM.qMixes();
 const row=m=>{const on=cur===m.n&&ATM.live();return `<li><button class="snd37-m${on?" on":""}" aria-pressed="${on}" onclick="V37.sndPick('${m.id}')"><b>${esc(m.n)}</b><small>${esc(m.L.map(x=>(ATM.byId(x[0])||{}).n).filter(Boolean).join(" + "))}</small>${on?`<span class="snd37-now">${R.playing?"Çalıyor":"Duraklatıldı"}</span>`:""}</button></li>`};
 return `<div class="snd37-p"><div class="snd37-np" aria-live="polite"><span class="snd37-ic" aria-hidden="true">${V37.sndIco()}</span><div class="grow"><b>${esc(cur||"Ses seçilmedi")}</b><small>${stat}${n?` · ${n} ses`:""}${tl?` · kalan ${ATM.fmt(tl)}`:""}</small></div></div>
  <div class="snd37-c" role="group" aria-label="Oynatma"><button onclick="ATM.step(-1)" aria-label="Önceki ses">${ATM.icon("prev",20)}</button><button class="pp" ${n?"":"disabled"} onclick="ATM.toggle()" aria-label="${R.playing?"Duraklat":"Devam ettir"}">${ATM.icon(R.playing?"pause":"play",24)}</button><button onclick="ATM.step(1)" aria-label="Sonraki ses">${ATM.icon("next",20)}</button></div>
  <label class="snd37-v"><span>Ses seviyesi</span><input type="range" min="0" max="1" step="0.01" value="${st.vol}" oninput="ATM.setMaster(+this.value)"></label>
  <button class="snd37-off" ${ATM.live()?"":"disabled"} onclick="ATM.stopAll()">Sesi tamamen kapat</button>
  ${Q.length?`<h3>Oynatma listesi</h3><ul class="snd37-l">${Q.map(row).join("")}</ul>`:""}
  <h3>Ses seç</h3><ul class="snd37-l">${M.filter(m=>!Q.includes(m)).map(row).join("")}</ul>
  <button class="snd37-all" onclick="V37.sndFull()">Tüm sesler, karışım ve zamanlayıcı</button></div>`};
V37.sndPick=function(id){const m=ATM.allMixes().find(x=>x.id===id);if(!m)return;if(ATM.st.name===m.n&&ATM.live()){ATM.toggle();return}const q=ATM.qMixes();let i=q.indexOf(m);if(i<0)i=ATM.allMixes().indexOf(m);ATM.rt.qi=i;ATM.loadMix(m.L,m.n,true)};
V37.sndOpen=function(){if(V37.sp&&V37.sp.ov&&V37.sp.ov.isConnected)return;
 V37.sp=UI.sheet({title:"Ses",body:()=>V37.sndBody(),footer:()=>`<button class="p" onclick="UI.close()">Kapat</button>`,onClose:()=>{V37.sp=null;try{const b=document.getElementById("snd37");if(b)b.focus({preventScroll:true})}catch(e){}}});
 try{V37.sp.box.classList.add("snd37-sheet")}catch(e){}};
V37.sndFull=function(){try{UI.close()}catch(e){}setTimeout(()=>ATM.open(),60)};
V37.sndPaint=function(){V37.sndBtn();const L=V37.sp;if(L&&L.ov&&L.ov.isConnected){const sc=L.body.scrollTop,ae=document.activeElement,rng=ae&&ae.type==="range"&&L.box.contains(ae);if(rng)return;L.refresh();L.body.scrollTop=sc}};
setInterval(()=>{if(ATM.rt.tEnd&&V37.sp&&V37.sp.ov&&V37.sp.ov.isConnected)V37.sndPaint()},1000);

V31.VER="V37.0";
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{try{V37.sndBtn();ATM.bar();ATM.fab();V37.mode()}catch(e){}});else setTimeout(()=>{try{V37.sndBtn();ATM.bar();ATM.fab();V37.mode()}catch(e){}},0);
