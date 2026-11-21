/* ===================== V39.0: çift deneyim — Klasik Öğrenme Alanı (Normal) + Öğrenme Dünyası (Premium) =====================
   İki deneyim aynı veri kaynağını kullanır (Store: units, outcomes, topics, questions, flashcards, games).
   Premium için ayrı içerik kaydı yoktur; yalnızca arayüz ve gezinme farklıdır. Normal ekranların koduna dokunulmaz. */
const V39={VER:"V39.0",K:"dk-deneyim39",PK:"dk-ilerleme39",SK:"dk-deneyim39-aktif",GR:[4,5,6,7,8,9,10,11,12],
 ROUTES:["pdunya","psinif","punite","pders","pozet","pilerleme"],on:false};

/* ---------- 1. Üyelik (prototip) — ileride sunucu/ödeme sağlayıcısı takılabilecek arayüz ----------
   Bu sürümde erişim kararı cihazdaki bir prototip sağlayıcıdan gelir; HTML/tarayıcı verisi değiştirilerek aşılabilir.
   Gerçek üyelik için: V39.Uyelik.kullan({ad, premium: () => ({izin, kaynak, aciklama, bitis}) }) ile sunucu doğrulamalı bir sağlayıcı bağlanır. */
V39.Uyelik=(function(){let P={ad:"yerel-prototip",premium:()=>({izin:true,kaynak:"prototip",aciklama:"Bu sürümde Öğrenme Dünyası bir arayüz prototipidir; ödeme ya da gerçek üyelik doğrulaması yoktur. Erişim bu cihazda serbesttir."})};
 return{saglayici:()=>P.ad,kullan(p){if(p&&typeof p.premium==="function")P=p},premium(){try{const r=P.premium();return Object.assign({izin:false,kaynak:P.ad,aciklama:""},r)}catch(e){return{izin:false,kaynak:"hata",aciklama:"Üyelik bilgisi okunamadı."}}}}})();
/* ---------- 2. Tercih ve ortak ilerleme ---------- */
V39.pref=function(){try{return Object.assign({son:"",hatirla:false},JSON.parse(localStorage.getItem(V39.K)||"{}"))}catch(e){return{son:"",hatirla:false}}};
V39.setPref=function(o){try{localStorage.setItem(V39.K,JSON.stringify(Object.assign(V39.pref(),o)))}catch(e){}};
V39.ilr=function(){if(V39._ilr)return V39._ilr;let o=null;try{o=JSON.parse(localStorage.getItem(V39.PK)||"null")}catch(e){}o=o&&typeof o==="object"?o:{};o.z=o.z||{};o.t=o.t||{};o.prog=o.prog||{};o.son=o.son||{};return V39._ilr=o};
V39.ilrSave=function(){try{localStorage.setItem(V39.PK,JSON.stringify(V39.ilr()))}catch(e){}};
V39.visit=function(tid){const o=V39.ilr(),t=Store.get("topics",tid);if(!t)return;o.z[tid]=new Date().toISOString();o.son[t.grade]=tid;V39.ilrSave()};
/* Mini test cevapları konu bazında (iki deneyimde de) kaydedilir; mevcut kayıt (Prog, yanlışlar) aynen sürer. */
(function(){const r=MT.rec;MT.rec=function(q,j){const x=r.apply(this,arguments);try{const o=V39.ilr(),T=o.t[q.topicId]=o.t[q.topicId]||{};T[q.id]=j===q.answer?1:0;V39.ilrSave()}catch(e){}return x}})();
(function(){const tv=topicV2;topicV2=function(t){try{V39.visit(t.id)}catch(e){}return tv.apply(this,arguments)}})();
V39.qs=tid=>Store.all("questions").filter(x=>x.topicId===tid&&vis(x));
V39.tst=function(t){const Q=V39.qs(t.id),A=V39.ilr().t[t.id]||{},n=Q.filter(q=>q.id in A).length,ok=Q.filter(q=>A[q.id]===1).length,z=!!V39.ilr().z[t.id];
 if(Q.length&&n>=Q.length)return{k:"tamam",l:"Tamamlandı",p:100,n,ok,q:Q.length};if(n||z)return{k:"calis",l:Q.length?"Çalışılıyor":"Açıldı",p:Q.length?Math.round(100*n/Q.length):(z?100:0),n,ok,q:Q.length};return{k:"bekle",l:"Başlanmadı",p:0,n,ok,q:Q.length}};
/* program: Normal alanla aynı kural (pvOf); sınıfta iki program varsa ayrı ayrı seçilebilir, birbirine karıştırılmaz */
V39.progs=g=>[...new Set(Store.all("units").filter(u=>u.grade==g&&vis(u)).map(u=>u.programYear))].sort();
V39.pv=function(g){const P=V39.progs(g),s=V39.ilr().prog[g];if(s&&P.includes(s))return s;const d=pvOf(g);return P.includes(d)?d:(P.includes("2026")?"2026":P[0])};
V39.pyName=py=>py==="2018"?"2018 programı":py==="2026"?"2026 programı (Türkiye Yüzyılı Maarif Modeli)":"Program bilgisi: Kaynakta veri bulunmuyor.";
V39.units=(g,py)=>Store.all("units").filter(u=>u.grade==g&&u.programYear===py&&vis(u)).sort((a,b)=>a.order-b.order);
V39.tops=uid=>Store.all("topics").filter(t=>t.unitId===uid&&vis(t)).sort((a,b)=>(a.order||0)-(b.order||0));
V39.stage=g=>g<=4?"İlkokul":g<=8?"Ortaokul":"Ortaöğretim";

/* ---------- 3. Deneyim geçişi ve yönlendirme ---------- */
V39.toPremium=function(){const u=V39.Uyelik.premium();if(!u.izin){UI.toast(u.aciklama||"Öğrenme Dünyası'na erişim yok.");return}V39.on=true;try{sessionStorage.setItem(V39.SK,"1")}catch(e){}V39.setPref({son:"premium"});V39.secim(false);go("pdunya")};
V39.toNormal=function(){V39.on=false;try{sessionStorage.removeItem(V39.SK)}catch(e){}V39.setPref({son:"normal"});V39.secim(false);V39.attr();go("home")};
/* Premium oturumunda mevcut ekranlara giden ortak bağlantılar Öğrenme Dünyası karşılıklarına yönlenir (Normal oturumda hiçbir şey değişmez). */
(function(){const g0=go;go=function(v,a){if(V39.on){if(v==="home"||v==="classes"){v="pdunya";a=null}else if(v==="grade"){v="psinif";a={pg:(a&&a.g)||G.g}}else if(v==="topic"){v="pders";a={pt:(a&&a.t)||G.t,ptab:(a&&a.tab)||""}}}return g0.call(this,v,a)}})();
V39.NOPREM=["ogretmen","editor","admin"];
V39.attr=function(){const b=document.body;if(!b)return;const p=V39.on&&!V39.NOPREM.includes(view),own=p&&V39.ROUTES.includes(view);if(b.hasAttribute("data-prem39")!==p)b.toggleAttribute("data-prem39",p);const pv=own?view:p?"odunc":"";if((b.dataset.pv||"")!==pv){if(pv)b.dataset.pv=pv;else delete b.dataset.pv}
 let bar=document.getElementById("p39bar");if(p&&!own){if(!bar){bar=document.createElement("div");bar.id="p39bar";bar.className="p39-bar";document.body.prepend(bar)}const g=G.pg;bar.innerHTML=`<button class="p39-bb" onclick="go('pdunya')">${V39.svg("door",18)}<span>Koridor</span></button>${g?`<button class="p39-bb" onclick="go('psinif',{pg:${+g}})"><span>${+g}. Sınıf Merkezi</span></button>`:""}<span class="p39-bt">Öğrenme Dünyası</span>`}else if(bar)bar.remove()};
(function(){const d=draw;draw=function(){V39.attr();const r=d.apply(this,arguments);V39.attr();return r}})();
V39.ROUTES.forEach(r=>{V30.routes[r]=function(){if(!V39.on){V39.on=true;try{sessionStorage.setItem(V39.SK,"1")}catch(e){}}V39.attr();V39["r_"+r]()}});
(function(){const nk=navKey;navKey=function(){return V39.ROUTES.includes(view)?"home":nk.apply(this,arguments)}})();

/* ---------- 4. Üyelik seçim ekranı ---------- */
V39.svg=(k,s)=>`<svg class="p39-i" width="${s||20}" height="${s||20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({door:'<path d="M6 21V8a6 6 0 0 1 12 0v13"/><path d="M4 21h16M14.5 13.5v1"/>',book:'<path d="M3 5.5C5.5 4 9 4 12 6c3-2 6.5-2 9-.5V19c-2.5-1.5-6-1.5-9 .5-3-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/>',layers:'<path d="M12 3 2.5 8 12 13l9.5-5z"/><path d="M2.5 12.5 12 17.5l9.5-5M2.5 17 12 22l9.5-5"/>',test:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8.5 12l2 2 4-4M8 7h8"/>',game:'<rect x="3" y="7" width="18" height="11" rx="4"/><path d="M8 10.5v4M6 12.5h4"/><circle cx="16" cy="12" r=".8"/><circle cx="17.8" cy="14" r=".8"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',swap:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',left:'<path d="M15 6l-6 6 6 6"/>',right:'<path d="M9 6l6 6-6 6"/>',up:'<path d="M6 15l6-6 6 6"/>',home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>',vol:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',star:'<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',quote:'<path d="M7 7h4v4c0 3-1.5 5-4 6M14 7h4v4c0 3-1.5 5-4 6"/>',list:'<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',teach:'<path d="M3 8.5 12 4l9 4.5-9 4.5z"/><path d="M7 10.6V15c0 1.4 2.2 2.6 5 2.6s5-1.2 5-2.6v-4.4"/>'})[k]||""}</svg>`;
V39.emb=s=>{try{return V31.EMB?`<img src="${V31.EMB.s128}" width="${s}" height="${s}" alt="" decoding="async">`:""}catch(e){return""}};
V39.secim=function(show){let o=document.getElementById("uye39");if(!show){if(o)o.remove();try{document.documentElement.classList.remove("uye39-acik")}catch(e){}return}
 const P=V39.pref(),u=V39.Uyelik.premium();if(!o){o=document.createElement("div");o.id="uye39";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-labelledby","uye39-h");document.body.appendChild(o)}
 document.documentElement.classList.add("uye39-acik");
 o.innerHTML=`<div class="uye39-in"><div class="uye39-head">${V39.emb(64)}<div><p class="uye39-k">Din Kültürü ve Ahlak Bilgisi</p><h1 id="uye39-h">Nasıl öğrenmek istersin?</h1></div></div>
 <div class="uye39-opts">
  <section class="uye39-c cn${P.son==="normal"?" son":""}"><div class="uye39-pv cn" aria-hidden="true"><i></i><i></i><i></i><b></b></div><span class="uye39-tag">Normal Üyelik</span><h2>Klasik Öğrenme Alanı</h2><p>Mevcut Din Kültürü öğrenme platformunu kullanmaya devam et.</p>${P.son==="normal"?`<small class="uye39-son">Son kullandığın</small>`:""}<button class="uye39-b cn" onclick="V39.sec('normal')">Klasik alana gir</button></section>
  <section class="uye39-c cp${P.son==="premium"?" son":""}"><div class="uye39-pv cp" aria-hidden="true"><span class="dd"></span><span class="dd dm"></span><span class="dd"></span></div><span class="uye39-tag cp">Premium Üyelik</span><h2>Din Kültürü – Öğrenme Dünyası</h2><p>Sınıfların, derslerin ve öğrenme alanlarının bulunduğu farklı bir eğitim deneyimine adım at.</p>${P.son==="premium"?`<small class="uye39-son">Son kullandığın</small>`:""}<button class="uye39-b cp" onclick="V39.sec('premium')">Öğrenme Dünyası'na gir</button><p class="uye39-not">${esc(u.aciklama||"")}</p></section>
 </div>
 <label class="uye39-h"><input type="checkbox" id="uye39-hat" ${P.hatirla?"checked":""}> Seçimimi hatırla; bir dahaki açılışta sormadan aç</label>
 <p class="uye39-alt">İki alan aynı içerikleri kullanır; istediğin zaman geçiş yapabilirsin. · <button class="uye39-lnk" onclick="V39.secim(false);go('ogretmen')">Öğretmen Paneli</button></p></div>`;
 try{o.querySelector(P.son==="premium"?".uye39-b.cp":".uye39-b.cn").focus({preventScroll:true})}catch(e){}};
V39.sec=function(k){const h=document.getElementById("uye39-hat");V39.setPref({hatirla:!!(h&&h.checked)});if(k==="premium")V39.toPremium();else V39.toNormal()};
/* Normal alanda geçiş: "Görünüm ve hareket" ayarlarına eklenir (ana ekranlar değişmez) */
(function(){const st=V30.settings;V30.settings=function(){const r=st.apply(this,arguments);try{const L=UI._stack[UI._stack.length-1];if(L&&L.o){const ob=L.o.body;L.o.body=(...a)=>(typeof ob==="function"?ob(...a):ob)+V39.setHTML();L.refresh()}}catch(e){}return r}})();
V39.setHTML=()=>{const P=V39.pref();return `<div class="set39"><b>Öğrenme deneyimi</b><p class="mut small">Şu an: ${V39.on?"Öğrenme Dünyası (Premium)":"Klasik Öğrenme Alanı (Normal)"}${P.hatirla?" · açılışta sormadan açılıyor":""}</p><button class="p" onclick="UI.close();setTimeout(()=>V39.secim(true),220)">Deneyimi değiştir</button></div>`};

/* ---------- 5. Öğrenme Dünyası: ortak üst çubuk ---------- */
V39.top=(t,sub)=>`<header class="p39-top"><button class="p39-brand" onclick="go('pdunya')" aria-label="Koridora dön">${V39.emb(40)}<span><b>Din Kültürü</b><small>${esc(sub||"Öğrenme Dünyası")}</small></span></button><span class="p39-sp"></span>
 <button class="p39-ib" onclick="V39.ara()" aria-label="Ara">${V39.svg("search",20)}</button><button class="p39-ib" onclick="go('pilerleme')" aria-label="İlerlemem">${V39.svg("chart",20)}</button><button class="p39-ib" onclick="V37.sndOpen()" aria-label="Ses kontrolü">${V39.svg("vol",20)}</button><button class="p39-ib p39-sw" onclick="V39.secim(true)" aria-label="Deneyimi değiştir (Klasik alana geç)">${V39.svg("swap",20)}<span>Klasik</span></button></header>`;
V39.crumb=L=>`<nav class="p39-cr" aria-label="Konum">${L.map((x,i)=>i<L.length-1?`<button onclick="${x[1]}">${esc(x[0])}</button><i aria-hidden="true">›</i>`:`<span aria-current="page">${esc(x[0])}</span>`).join("")}</nav>`;

/* ---------- 6. Koridor (CSS/SVG; kapılar gerçek düğmeler) ---------- */
V39.kor={pos:0,cur:0};
V39.DOOR=g=>'<svg class="kd" viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="kw'+g+'" x1="0" x2="1"><stop offset="0" style="stop-color:var(--w2)"/><stop offset=".5" style="stop-color:var(--w1)"/><stop offset="1" style="stop-color:var(--w2)"/></linearGradient></defs><path d="M6 160V48Q6 6 50 6t44 42v112z" fill="url(#kw'+g+')"/><g fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.6"><path d="M16 74V52Q16 18 50 18t34 34v22z"/><rect x="16" y="84" width="68" height="30" rx="3"/><rect x="16" y="122" width="68" height="30" rx="3"/></g><g fill="none" stroke="rgba(255,226,170,.16)" stroke-width="1"><path d="M17 73V52Q17 19 50 19t33 33v21"/></g><circle cx="78" cy="104" r="2.6" fill="#E7C27A"/></svg>';
V39.r_pdunya=function(){const o=V39.ilr(),last=o.sonSinif&&V39.GR.includes(+o.sonSinif)?+o.sonSinif:4,i0=V39.GR.indexOf(last);
 $.innerHTML=`<div class="p39 p39-dunya">${V39.top("","Öğrenme Dünyası")}
 <section class="p39-kor" id="p39kor" tabindex="0" aria-label="Sınıf koridoru: kapılar arasında sağa sola kaydırarak ilerle" aria-roledescription="koridor">
  <div class="p39-amb" aria-hidden="true"><div class="tv"><span class="kb"></span></div><div class="dv l"><i class="fn"></i><i class="fn b"></i></div><div class="dv r"><i class="fn"></i><i class="fn b"></i></div><div class="zm"><span class="ok1"></span><span class="ok2"></span><span class="yd"></span></div><div class="uc"><span></span></div></div>
  <div class="p39-sahne" id="p39s">${V39.GR.map((g,i)=>`<button class="p39-kapi" data-i="${i}" data-g="${g}" style="--h:${(g-4)*9}" aria-label="${g}. sınıf kapısı · ${V39.stage(g)}"><span class="kc">${V39.DOOR(g)}<span class="kl"><span class="ki">${V39.svg("book",16)}</span><b>${g}. Sınıf</b></span><span class="ks">${V39.stage(g)}</span></span></button>`).join("")}</div>
  <button class="p39-ok l" onclick="V39.korGit(V39.kor.cur-1)" aria-label="Önceki sınıf">${V39.svg("left",26)}</button><button class="p39-ok r" onclick="V39.korGit(V39.kor.cur+1)" aria-label="Sonraki sınıf">${V39.svg("right",26)}</button>
  <button class="p39-gir" onclick="V39.korAc(V39.kor.cur)" aria-label="Seçili sınıfa gir">${V39.svg("up",28)}<span id="p39gl">Sınıfa gir</span></button>
 </section>
 <nav class="p39-gs" aria-label="Sınıf göstergesi"><span class="gs-u">4. Sınıf</span><div class="gs-dz">${V39.GR.map((g,i)=>`<button data-i="${i}" onclick="V39.korGit(${i})" aria-label="${g}. sınıf"><i></i><small>${g}</small></button>`).join("")}</div><span class="gs-u">12. Sınıf</span></nav>
 <section class="p39-hz" aria-label="Hızlı erişim"><h2>Hızlı Erişim</h2><div>${[["book","Derslerim","V39.hz('ders')"],["layers","Özetler","V39.hz('ozet')"],["test","Testler","V39.hz('test')"],["game","Oyunlar","V39.hz('oyun')"],["chart","İlerlemem","go('pilerleme')"]].map(([i,n,f])=>`<button onclick="${f}">${V39.svg(i,22)}<span>${n}</span></button>`).join("")}</div></section></div>`;
 V39.korInit(i0)};
V39.reduced=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches||(V30.off&&V30.off())}catch(e){return false}};
V39.korS=()=>{const w=Math.min(innerWidth,1440),d=V39._doors&&V39._doors[0],dw=d&&d.offsetWidth||Math.max(124,Math.min(w*.36,innerHeight*.25,210));return Math.max(dw*1.02,Math.min(w*.26,280))};
V39.korLay=function(pos){const D=V39._doors||[],S=V39.korS();D.forEach((d,i)=>{const o=i-pos,a=Math.abs(o),sg=o<0?-1:1;const x=sg*Math.min(a,1)*S*0.92+sg*Math.max(0,a-1)*S*0.6,z=-Math.min(a,4.5)*170,ry=-sg*Math.min(a*52,64);
  d.style.transform=`translate3d(calc(-50% + ${x.toFixed(1)}px),0,${z.toFixed(0)}px) rotateY(${ry.toFixed(1)}deg)`;d.style.opacity=a>3.4?"0":a>2.4?(3.4-a).toFixed(2):"1";d.style.zIndex=String(100-Math.round(a*10));d.style.visibility=a>3.5?"hidden":"visible";
  const on=a<.5;if(d.classList.contains("on")!==on){d.classList.toggle("on",on);d.tabIndex=on?0:-1}})};
V39.korSet=function(i,anim){i=Math.max(0,Math.min(8,i));const st=document.getElementById("p39s");if(!st)return;st.classList.toggle("an",!!anim&&!V39.reduced());V39.kor.cur=i;V39.kor.pos=i;V39.korLay(i);
 document.querySelectorAll(".p39-gs .gs-dz button").forEach((b,k)=>{const on=k===i;b.classList.toggle("on",on);b.setAttribute("aria-current",on?"true":"false")});
 const g=V39.GR[i],gl=document.getElementById("p39gl");if(gl)gl.textContent=g+". Sınıfa gir";const o=V39.ilr();if(o.sonSinif!==g){o.sonSinif=g;V39.ilrSave()}
 const L=document.querySelector(".p39-ok.l"),R=document.querySelector(".p39-ok.r");if(L)L.disabled=i===0;if(R)R.disabled=i===8};
V39.korGit=i=>V39.korSet(i,true);
V39.korInit=function(i0){const k=document.getElementById("p39kor"),st=document.getElementById("p39s");if(!k||!st)return;V39._doors=[...st.querySelectorAll(".p39-kapi")];V39.korSet(i0,false);
 let d=null;const S=()=>V39.korS();
 k.addEventListener("pointerdown",e=>{if(e.button>0||e.target.closest(".p39-ok,.p39-gir"))return;d={x:e.clientX,y:e.clientY,p:V39.kor.pos,t:performance.now(),moved:false,id:e.pointerId,lx:e.clientX,lt:performance.now(),v:0}});
 k.addEventListener("pointermove",e=>{if(!d||e.pointerId!==d.id)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)>10||Math.abs(dy)>10)d.far=true;if(!d.moved){if(Math.abs(dx)<8||Math.abs(dx)<Math.abs(dy))return;d.moved=true;st.classList.remove("an");st.classList.add("drag");try{k.setPointerCapture(e.pointerId)}catch(_){}}
  const now=performance.now();d.v=(e.clientX-d.lx)/Math.max(1,now-d.lt);d.lx=e.clientX;d.lt=now;const pos=Math.max(-.45,Math.min(8.45,d.p-dx/S()));V39.kor.pos=pos;V39.korLay(pos)});
 const end=e=>{if(!d||e.pointerId!==d.id)return;const was=d;d=null;st.classList.remove("drag");if(!was.moved){if(was.far)return;const b=e.target.closest&&e.target.closest(".p39-kapi");if(b&&e.type==="pointerup")V39.kapiTik(+b.dataset.i);return}
  const tgt=Math.round(V39.kor.pos-was.v*120/S());V39.korSet(Math.max(0,Math.min(8,tgt)),true)};
 k.addEventListener("pointerup",end);k.addEventListener("pointercancel",end);
 st.addEventListener("click",e=>{if(e.detail===0){const b=e.target.closest(".p39-kapi");if(b)V39.kapiTik(+b.dataset.i)}});
 k.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"){V39.korGit(V39.kor.cur-1);e.preventDefault()}else if(e.key==="ArrowRight"){V39.korGit(V39.kor.cur+1);e.preventDefault()}});
 clearTimeout(V39._rz);if(!V39._rzOn){V39._rzOn=1;addEventListener("resize",()=>{clearTimeout(V39._rz);V39._rz=setTimeout(()=>{if(view==="pdunya")V39.korLay(V39.kor.pos)},120)})}};
V39.kapiTik=function(i){if(i!==V39.kor.cur)V39.korGit(i);else V39.korAc(i)};
V39.korAc=function(i){const g=V39.GR[i],k=document.getElementById("p39kor"),d=V39._doors&&V39._doors[i];if(V39._acil)return;
 if(V39.reduced()||!k||!d){go("psinif",{pg:g});return}V39._acil=1;k.classList.add("acil");d.classList.add("acil");setTimeout(()=>{V39._acil=0;go("psinif",{pg:g})},360)};
V39.hz=function(k){const g=V39.GR[V39.kor.cur]||4;if(k==="ders")return go("psinif",{pg:g});if(k==="ozet")return go("pozet",{pg:g});if(k==="test")return go("dene");if(k==="oyun")return go("games")};

/* ---------- 7. Sınıf merkezi ---------- */
V39.UIC=['<path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>','<path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>','<path d="M4 20V9l8-5 8 5v11zM9 20v-6h6v6"/>','<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16 5 5 0 0 1 0-16z"/>','<path d="M3 5.5C5.5 4 9 4 12 6c3-2 6.5-2 9-.5V19c-2.5-1.5-6-1.5-9 .5-3-2-6.5-2-9-.5z"/>','<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>','<path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-5a3 3 0 0 1 6 0v5"/>','<path d="M4 12h16M12 4l8 8-8 8"/>'];
V39.uic=(n,s)=>`<svg class="p39-i" width="${s||22}" height="${s||22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${V39.UIC[(n-1)%V39.UIC.length]}</svg>`;
V39.gstat=function(g,py){const U=V39.units(g,py),T=U.flatMap(u=>V39.tops(u.id)),O=Store.all("outcomes").filter(o=>U.some(u=>u.id===o.unitId)&&vis(o)),P=Store.ov.prog||{};
 const st=T.map(V39.tst),cal=O.filter(o=>P[o.id]).length,ust=O.filter(o=>P[o.id]&&P[o.id].mastery>=.8&&(P[o.id].correct||0)>=2).length;
 return{U,T,O,st,tam:st.filter(x=>x.k==="tamam").length,cl:st.filter(x=>x.k==="calis").length,bek:st.filter(x=>x.k==="bekle").length,cal,ust}};
V39.r_psinif=function(){const g=+G.pg||4,P=V39.progs(g),py=V39.pv(g),S=V39.gstat(g,py),bk=Store.all("textbooks").filter(t=>t.grade==g),son=Store.get("topics",V39.ilr().son[g]),sonOk=son&&son.programYear===py;
 const pct=S.O.length?Math.round(100*S.cal/S.O.length):0;
 $.innerHTML=`<div class="p39 p39-pg">${V39.top("",g+". Sınıf Merkezi")}${V39.crumb([["Koridor","go('pdunya')"],[g+". Sınıf Merkezi",""]])}
 <section class="p39-hero"><div class="p39-emb" aria-hidden="true"><svg viewBox="0 0 60 80"><path d="M4 80V26Q4 4 30 4t26 22v54z" fill="none" stroke="currentColor" stroke-width="2.2"/></svg><b>${g}</b></div><div><p class="p39-ey">${V39.stage(g)}</p><h1>${g}. Sınıf Merkezi</h1>
  <div class="p39-prg" role="group" aria-label="Öğretim programı">${P.map(x=>`<button class="${x===py?"on":""}" aria-pressed="${x===py}" onclick="V39.setProg(${g},'${x}')">${esc(V39.pyName(x))}</button>`).join("")}</div>
  <p class="p39-mut">Ders kitabı: ${bk.length?bk.map(t=>esc(t.title||t.id)).join(" · "):"Ders kitabında veri bulunmuyor."}</p></div></section>
 <section class="p39-sts"><div><b>${S.U.length}</b><span>Ünite</span></div><div><b>${S.T.length}</b><span>Konu</span></div><div><b>${S.O.length}</b><span>Kazanım</span></div><div><b>${S.tam}</b><span>Tamamlanan konu</span></div></section>
 <div class="p39-two"><section class="p39-card"><h2>${V39.svg("chart",18)} Kazanım ilerlemesi</h2><div class="p39-bar"><i style="width:${pct}%"></i></div><p>${S.cal}/${S.O.length} kazanımda soru çözülmüş · ${S.ust} kazanımda başarı %80 ve üzeri</p><p class="p39-mut small">Mini test ve oyunlardaki cevaplarından hesaplanır (iki deneyimde ortak).</p></section>
 <section class="p39-card"><h2>${V39.svg("book",18)} Son çalışılan konu</h2>${sonOk?`<button class="p39-last" onclick="go('pders',{pt:'${son.id}',ptab:''})"><b>${esc(son.title)}</b><small>${esc((Store.get("units",son.unitId)||{}).title||"")}</small></button>`:`<p class="p39-mut">Bu sınıfta henüz konu açmadın.</p>`}
  <p class="small"><span class="p39-st tamam">✓ ${S.tam} tamamlandı</span> <span class="p39-st calis">◔ ${S.cl} çalışılıyor</span> <span class="p39-st bekle">○ ${S.bek} bekliyor</span></p></section></div>
 <h2 class="p39-h2">Üniteler</h2>${S.U.length?`<div class="p39-ug">${S.U.map(u=>{const T=V39.tops(u.id),st=T.map(V39.tst),tm=st.filter(x=>x.k==="tamam").length,rd=T.filter(t=>t.sections).length;return `<button class="p39-un" onclick="go('punite',{pg:${g},pu:'${u.id}'})"><span class="un-ic">${V39.uic(u.order,24)}</span><span class="un-no">${u.order}. Ünite</span><b>${esc(u.title)}</b><small>${T.length} konu · ${rd} konunun içeriği hazır${u.hours?` · ${esc(String(u.hours))} ders saati`:""}</small><span class="p39-bar sm"><i style="width:${T.length?Math.round(100*tm/T.length):0}%"></i></span><small>${tm}/${T.length} konu tamamlandı</small></button>`}).join("")}</div>`:`<p class="p39-empty">Bu sınıf ve program için ünite verisi bulunmuyor.</p>`}
 <section class="p39-card"><h2>${V39.svg("list",18)} Konular</h2>${S.U.map(u=>`<details class="p39-dt"><summary>${u.order}. ${esc(u.title)}</summary><ol>${V39.tops(u.id).filter(t=>!t.parentId).map(t=>`<li><button onclick="go('pders',{pt:'${t.id}',ptab:''})">${esc(t.title)}</button> <span class="p39-st ${V39.tst(t).k}">${V39.tst(t).l}</span></li>`).join("")}</ol></details>`).join("")}</section></div>`};
V39.setProg=function(g,py){const o=V39.ilr();o.prog[g]=py;V39.ilrSave();draw()};
/* ---------- 8. Ünite alanı ---------- */
V39.r_punite=function(){const u=Store.get("units",G.pu);if(!u){go("psinif",{pg:G.pg||4});return}const g=u.grade,T=V39.tops(u.id),main=T.filter(t=>!t.parentId),O=Store.all("outcomes").filter(o=>o.unitId===u.id&&vis(o)).sort((a,b)=>a.order-b.order);
 const card=(t,sub)=>{const s=V39.tst(t),oc=(t.outcomeIds||[]).map(o=>Store.get("outcomes",o)).filter(Boolean);return `<article class="p39-tc${sub?" tc-sub":""}"><div class="tc-tt"><span class="p39-st ${s.k}">${s.k==="tamam"?"✓":s.k==="calis"?"◔":"○"} ${s.l}</span>${t.sections?"":`<span class="p39-st uy">İçerik henüz hazırlanmadı</span>`}</div><h3>${esc(t.title)}</h3>${oc.length?`<p class="tc-kz">${oc.map(o=>`<code>${esc(o.code)}</code> ${esc(o.title)}`).join("<br>")}</p>`:`<p class="tc-kz p39-mut">Kazanım: Kaynakta veri bulunmuyor.</p>`}
  <div class="p39-bar sm" role="img" aria-label="İlerleme %${s.p}"><i style="width:${s.p}%"></i></div><p class="p39-mut small">${s.q?`Mini test: ${s.n}/${s.q} soru cevaplandı${s.n?` · ${s.ok} doğru`:""}`:"Bu konuda mini test sorusu yok."}</p><button class="p39-btn" onclick="go('pders',{pt:'${t.id}',ptab:''})">${V39.svg("book",18)} Konuyu aç</button></article>`};
 $.innerHTML=`<div class="p39 p39-pg">${V39.top("",g+". Sınıf · "+u.order+". Ünite")}${V39.crumb([["Koridor","go('pdunya')"],[g+". Sınıf","go('psinif',{pg:"+g+"})"],[u.order+". Ünite",""]])}
 <section class="p39-hero u"><div class="p39-emb u" aria-hidden="true">${V39.uic(u.order,34)}</div><div><p class="p39-ey">${u.order}. Ünite · ${esc(V39.pyName(u.programYear))}</p><h1>${esc(u.title)}</h1>${u.description?`<p class="p39-mut">${esc(u.description)}</p>`:""}</div></section>
 <div class="p39-tg">${main.length?main.map(t=>card(t)+T.filter(x=>x.parentId===t.id).map(x=>card(x,1)).join("")).join(""):`<p class="p39-empty">Bu ünite için konu kaydı yok.</p>`}</div>
 <details class="p39-card p39-dt"><summary>Ünitenin kazanımları (${O.length})</summary>${O.map(o=>`<p><code>${esc(o.code)}</code> ${esc(o.title)}</p>`).join("")||`<p class="p39-mut">Kaynakta veri bulunmuyor.</p>`}</details></div>`};

/* ---------- 9. Ders ekranı: aynı konu kaydı, farklı tasarım ---------- */
V39.T2=T2;V39.AL={anlat:"Anlatım",ozet:"Özet",otuz:"30 Saniyede",video:"Video",hik:"Hikâye",kod:"Kodlama",tab:"Tablo",kar:"Karışanlar",kart:"Kartlar",test:"Mini Test",sin:"Sınav Odaklı",oyun:"Oyunlar",kay:"Kaynaklar"};
V39.av=function(t){const X=t.sections,Q=V39.qs(t.id),F=Store.all("flashcards").filter(x=>x.topicId===t.id&&vis(x)),EV=Store.all("games").filter(x=>x.topicId===t.id&&gvis(x)).length,VD=Store.all("videos").filter(x=>x.topicId===t.id&&vis(x)&&(typeof vOK!=="function"||vOK(x))).length;
 return T2.filter(([k])=>X?!(k==="hik"&&!X.hikaye)&&!(k==="tab"&&!X.tablo)&&!(k==="ozet"&&!X.ozet)&&!(k==="otuz"&&!X.otuz)&&!(k==="kod"&&!X.kodlama&&!X.kodlamaNot)&&!(k==="kar"&&!(X.karisanlar||[]).length)&&!(k==="sin"&&!X.sinav)&&!(k==="test"&&!Q.length)&&!(k==="kart"&&!F.length)&&!(k==="oyun"&&!EV)&&!(k==="video"&&!VD):(k==="kay"||(k==="video"&&VD>0)||(k==="oyun"&&EV>0)))};
V39.QRX=/(ayet|âyet|sure|hadis|peygamber|resul|buyur|kur.?an)/i;
V39.para=function(p){p=String(p||"");if(/(^|\s)1\)\s/.test(p)&&/\s2\)\s/.test(p)&&/\s3\)\s/.test(p)){const parts=p.split(/\s(?=\d\)\s)/),intro=/^1\)/.test(parts[0])?"":parts.shift();return(intro?`<p>${V39.q(intro)}</p>`:"")+`<ol class="p39-ol">${parts.map(x=>`<li>${V39.q(x.replace(/^\d\)\s*/,""))}</li>`).join("")}</ol>`}return `<p>${V39.q(p)}</p>`};
/* Ayet ve hadisler: metindeki tırnaklı alıntı (“…”) ve ayet/hadis bağlamı varsa zarif alıntı alanında gösterilir. Metin değiştirilmez. */
V39.q=function(p){const e=esc(p);if(!V39.QRX.test(p)||!/“[^”]{12,}”/.test(p))return e;return e.replace(/“([^”]{12,})”(\s*\([^)]{2,60}\))?/g,(m,a,ref)=>`<q class="p39-q${a.length>70?" b":""}">${a}${ref?`<cite>${ref.trim()}</cite>`:""}</q>`)};
V39.KK={kavram:"Önemli kavram",ornek:"Örnek",gunluk:"Günlük hayat",dusun:"Düşün",baglanti:"Bağlantı",karsilastirma:"Karşılaştırma",neden:"Neden-sonuç",aciklama:"Açıklama"};
V39.R={
 anlat:(t,X)=>{const sa=t.sourceAnalysis||{},rel=(sa.relations||[]).filter(r=>/→|↔/.test(r));
  return `<div class="p39-read">${X.anlatim.map((x,i)=>`<article class="p39-blk${x.k&&V39.KK[x.k]?" k-"+x.k:""}">${x.k&&V39.KK[x.k]?`<span class="blk-lab">${V39.KK[x.k]}</span>`:""}${x.h?`<h3>${esc(x.h)}</h3>`:""}${V39.para(x.p)}${typeof dvb==="function"?dvb(t,"anlatim",i):""}</article>`).join("")}</div>
  ${rel.length?`<figure class="p39-sema"><figcaption>${V39.svg("layers",18)} Konu şeması <small>(kaynak analizindeki ilişkilerden)</small></figcaption><div>${rel.map(r=>{const s=r.includes("↔")?"↔":"→";return `<p>${r.split(s).map(x=>`<span>${esc(x.trim())}</span>`).join(`<i>${s}</i>`)}</p>`}).join("")}</div></figure>`:""}
  ${(sa.concepts||[]).length?`<aside class="p39-kv"><h4>${V39.svg("key",16)} Önemli kavramlar</h4><div>${sa.concepts.map(c=>`<span>${esc(c)}</span>`).join("")}</div></aside>`:""}`},
 ozet:(t,X)=>`<div class="p39-oz"><h3>${esc(X.ozet.baslik)}</h3><ol>${X.ozet.adimlar.map((s,i)=>`<li><span>${i+1}</span><div><b>${esc(s.t)}</b><p>${esc(s.a)}</p></div></li>`).join("")}</ol></div>`,
 otuz:(t,X)=>{const ul=a=>(a||[]).map(x=>`<li>${esc(x)}</li>`).join("");return `<div class="p39-30"><div class="c3"><h4>Bil</h4><ul>${ul(X.otuz.bil)}</ul></div>${(X.otuz.karisma||[]).length?`<div class="c3 k3"><h4>Karıştırma</h4><ul>${ul(X.otuz.karisma)}</ul></div>`:""}<div class="c3 d3"><h4>Dikkat</h4><p>${esc(X.otuz.dikkat)}</p></div></div>`},
 kod:(t,X)=>X.kodlama?`<div class="p39-kod"><span class="kd-ic">${V39.svg("key",28)}</span><p class="kd-ey">Hafıza kodu</p><h3>${esc(X.kodlama.h)}</h3><p class="kd-kt">${esc(X.kodlama.p)}</p></div>`:`<p class="p39-empty">${esc(X.kodlamaNot||"Bu konuda özel bir kodlama gerekli değil.")}</p>`,
 hik:(t,X)=>{const H=X.hikaye,L=H.etiket||(H.tur==="kurgu"?"Kurgu hikâye":"Hadis rivayeti özeti");return `<div class="p39-hk"><div class="hk-tg"><span>${esc(L)}</span>${H.inceleme?`<span class="hk-w">İnceleme bekliyor</span>`:""}</div><h3>${esc(H.h)}</h3><div class="hk-bd">${String(H.p).split(/\n\n+/).map(x=>`<p>${V39.q(x)}</p>`).join("")}</div>${(H.dusun||[]).length?`<div class="hk-dq"><h4>Düşün</h4><ol>${H.dusun.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></div>`:""}${H.hatirla?`<p class="hk-ht"><b>Hatırla:</b> ${esc(H.hatirla)}</p>`:""}${H.not_?`<p class="p39-mut small">${esc(H.not_)}</p>`:""}${H.inceleme?`<p class="p39-mut small"><b>Editör notu:</b> ${esc(H.inceleme)}</p>`:""}</div>`},
 tab:(t,X)=>`<div class="p39-tb"><h3>${esc(X.tablo.baslik)}</h3>${X.tablo.neden?`<p class="p39-mut">${esc(X.tablo.neden)}</p>`:""}<div class="tb-sc"><table><thead><tr>${X.tablo.head.map(h=>`<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${X.tablo.rows.map(r=>`<tr>${r.map((c,i)=>i?`<td>${esc(c)}</td>`:`<th scope="row">${esc(c)}</th>`).join("")}</tr>`).join("")}</tbody></table></div></div>`,
 kar:(t,X)=>`<div class="p39-kr">${X.karisanlar.map(x=>{const g=(x.grup&&x.grup.length)?x.grup:null,nm=g?g.map(i=>i.ad):[x.a,x.b];return `<article><div class="kr-vh">${nm.map(n=>`<span>${esc(n)}</span>`).join(`<i>↔</i>`)}</div>${g?`<div class="kr-vg">${g.map(i=>`<div><b>${esc(i.ad)}</b><p>${esc(i.ac)}</p></div>`).join("")}</div>`:""}<p><b>Temel fark:</b> ${esc(x.fark)}</p>${x.ipucu?`<p class="kr-ip">${V39.svg("star",16)} <span><b>Akılda tut:</b> ${esc(x.ipucu)}</span></p>`:""}</article>`}).join("")}</div>`,
 sin:(t,X)=>{const S=X.sinav,sec=(h,a,c)=>(a&&a.length)?`<section class="${c}"><h4>${h}</h4><ul>${a.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>`:"";return `<div class="p39-sn">${sec("Bilmen gereken",S.bilmen,"sn-b")}${sec("Sık karıştırılan",S.karisan,"sn-k")}${sec("Dikkat edilmesi gereken",S.dikkat,"sn-d")}${sec("Soruda nasıl karşına çıkabilir?",S.soru,"sn-s")}${sec("Kavramı nasıl ölçebilirler?",S.olcme,"sn-s")}${sec("Hangi ayrıntı önemli?",S.ayrinti,"sn-s")}<p class="p39-mut small">Bu liste soru biçimlerine örnektir; hangi sorunun çıkacağına dair bir tahmin değildir.</p></div>`},
 test:t=>MT.html(t.id),kart:t=>FC.html(t.id),
 oyun:t=>`<div class="p39-oy">${Store.all("games").filter(x=>x.topicId===t.id&&gvis(x)).map(gCard).join("")}</div><p class="p39-mut small">Oyunlar Klasik alandaki oyun sistemiyle oynanır; bitince bu derse dönersin.</p>`,
 video:t=>Store.all("videos").filter(x=>x.topicId===t.id&&vis(x)&&(typeof vOK!=="function"||vOK(x))).map(vCard).join(""),
 kay:t=>srcView(t)};
V39.r_pders=function(){const t=Store.get("topics",G.pt);if(!t){go("pdunya");return}const u=Store.get("units",t.unitId)||{title:"",order:""},g=t.grade,av=V39.av(t);let tab=G.ptab;if(!av.some(x=>x[0]===tab))tab=av[0][0];G.ptab=tab;
 Store.ov.last=t.id;Store.save();V39.visit(t.id);const ix=av.findIndex(x=>x[0]===tab),pv_=av[ix-1],nx=av[ix+1],oc=(t.outcomeIds||[]).map(o=>Store.get("outcomes",o)).filter(Boolean);
 $.innerHTML=`<div class="p39 p39-pg p39-ders">${V39.top("",g+". Sınıf · Ders")}${V39.crumb([["Koridor","go('pdunya')"],[g+". Sınıf","go('psinif',{pg:"+g+"})"],[u.order+". Ünite","go('punite',{pg:"+g+",pu:'"+u.id+"'})"],[t.title,""]])}
 <header class="p39-dh"><p class="p39-ey">${esc(u.title)}</p><h1>${esc(t.title)}</h1>${t.subtitle?`<p class="ld">${esc(t.subtitle)}</p>`:""}
  <div class="p39-kzb">${V39.svg("check",18)}<div>${oc.length?oc.map(o=>`<p><code>${esc(o.code)}</code> ${esc(o.title)}</p>`).join(""):`<p class="p39-mut">Kazanım: Kaynakta veri bulunmuyor.</p>`}</div></div>
  <div class="p39-tags"><span>${esc(V39.pyName(t.programYear))}</span><span>${esc((typeof TR!=="undefined"&&TR[t.status])||t.status)}</span>${t.dogrulama&&typeof DVL!=="undefined"&&DVL[t.dogrulama.durum]?`<span>${esc(DVL[t.dogrulama.durum])}</span>`:""}${t.reviewFlag?`<span class="uy">${esc(t.reviewFlag)}</span>`:""}</div></header>
 ${t.sections?"":`<p class="p39-empty">Bu konunun özgün içeriği henüz hazırlanmadı. Ders kitabında veri bulunmuyor. Kaynak bağlantıları aşağıda.</p>`}
 <nav class="p39-tabs" role="tablist" aria-label="Öğrenme araçları">${av.map(([k])=>`<button role="tab" aria-selected="${k===tab}" class="${k===tab?"on":""}" data-k="${k}" onclick="V39.tab('${k}')">${esc(V39.AL[k]||k)}</button>`).join("")}</nav>
 <div id="tb" class="p39-pane t-${tab}" role="tabpanel">${V39.R[tab](t,t.sections)}</div>
 <div class="p39-pager">${pv_?`<button onclick="V39.tab('${pv_[0]}')">${V39.svg("left",18)} ${esc(V39.AL[pv_[0]])}</button>`:"<span></span>"}${nx?`<button class="p" onclick="V39.tab('${nx[0]}')">${esc(V39.AL[nx[0]])} ${V39.svg("right",18)}</button>`:""}</div></div>`;
 const on=document.querySelector(".p39-tabs .on");if(on)try{on.scrollIntoView({inline:"center",block:"nearest"})}catch(e){}};
V39.tab=function(k){G.ptab=k;draw();const e=document.querySelector(".p39-tabs");if(e){const y=e.getBoundingClientRect().top+scrollY-64;if(scrollY>y)scrollTo({top:y})}};
/* ---------- 10. Özetler, İlerlemem, arama ---------- */
V39.r_pozet=function(){const g=+G.pg||4,py=V39.pv(g),U=V39.units(g,py);
 $.innerHTML=`<div class="p39 p39-pg">${V39.top("",g+". Sınıf · Özetler")}${V39.crumb([["Koridor","go('pdunya')"],[g+". Sınıf","go('psinif',{pg:"+g+"})"],["Özetler",""]])}<h1 class="p39-h1">${g}. Sınıf Özetleri</h1><p class="p39-mut">${esc(V39.pyName(py))}</p>
 ${U.map(u=>{const T=V39.tops(u.id).filter(t=>t.sections&&t.sections.ozet);return `<section class="p39-card"><h2>${u.order}. ${esc(u.title)}</h2>${T.length?`<ul class="p39-ul">${T.map(t=>`<li><button onclick="go('pders',{pt:'${t.id}',ptab:'ozet'})"><b>${esc(t.title)}</b><small>${esc(t.sections.ozet.baslik||"")}</small></button></li>`).join("")}</ul>`:`<p class="p39-mut">Bu ünitede özeti hazırlanmış konu yok.</p>`}</section>`}).join("")}</div>`};
V39.r_pilerleme=function(){const W=MT.W(),wn=Object.keys(W).length;
 $.innerHTML=`<div class="p39 p39-pg">${V39.top("","İlerlemem")}${V39.crumb([["Koridor","go('pdunya')"],["İlerlemem",""]])}<h1 class="p39-h1">İlerlemem</h1><p class="p39-mut">Klasik alan ve Öğrenme Dünyası aynı ilerleme kaydını kullanır.</p>
 <div class="p39-ig">${V39.GR.map(g=>{const py=V39.pv(g),S=V39.gstat(g,py);return `<button class="p39-ic" onclick="go('psinif',{pg:${g}})"><b>${g}. Sınıf</b><small>${esc(py==="2018"?"2018 programı":"2026 TYMM")}</small><span class="p39-bar sm"><i style="width:${S.T.length?Math.round(100*S.tam/S.T.length):0}%"></i></span><small>${S.tam}/${S.T.length} konu tamamlandı · ${S.cl} çalışılıyor</small><small>${S.cal}/${S.O.length} kazanımda soru çözüldü</small></button>`}).join("")}</div>
 <section class="p39-card"><h2>${V39.svg("test",18)} Yanlışlarım</h2><p>${wn} soru tekrar bekliyor.</p>${wn?`<button class="p39-btn" onclick="go('yanlis')">Yanlışlarımı çöz</button>`:""}</section></div>`};
V39.ara=function(){UI.sheet({title:"Öğrenme Dünyası'nda ara",body:()=>`<input id="p39q" class="p39-in" type="search" placeholder="Konu adı veya kazanım kodu" aria-label="Ara" oninput="V39.araSonuc(this.value)"><div id="p39r" class="p39-rs" aria-live="polite"></div>`});setTimeout(()=>{const i=document.getElementById("p39q");if(i)i.focus()},120)};
V39.araSonuc=function(q){const r=document.getElementById("p39r");if(!r)return;q=(q||"").trim().toLocaleLowerCase("tr-TR");if(q.length<2){r.innerHTML="";return}
 const L=Store.all("topics").filter(t=>vis(t)&&t.programYear===V39.pv(t.grade)&&((t.title||"").toLocaleLowerCase("tr-TR").includes(q)||(t.outcomeIds||[]).some(o=>((Store.get("outcomes",o)||{}).code||"").toLowerCase().includes(q)))).slice(0,40);
 r.innerHTML=L.length?L.map(t=>`<button class="p39-ri" onclick="UI.close();go('pders',{pt:'${t.id}',ptab:''})"><b>${esc(t.title)}</b><small>${t.grade}. sınıf · ${esc((Store.get("units",t.unitId)||{}).title||"")}</small></button>`).join(""):`<p class="p39-mut">Sonuç yok. (Her sınıfta seçili programın konularında arar.)</p>`};

/* ---------- 11. Açılış ---------- */
V39.init=function(){const P=V39.pref();let act=null;try{act=sessionStorage.getItem(V39.SK)}catch(e){}
 if(act==="1"||(P.hatirla&&P.son==="premium"&&V39.Uyelik.premium().izin)){V39.on=true;try{sessionStorage.setItem(V39.SK,"1")}catch(e){}if(view==="home")view="pdunya"}
 else if(!(P.hatirla&&P.son==="normal"))V39.secim(true)};
try{V39.init()}catch(e){console.error("V39.init",e)}
V31.VER="V39.0";
