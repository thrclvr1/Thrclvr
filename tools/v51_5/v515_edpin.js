/* ===================== V51.5: editör PIN'i — ilk PIN, kademeli kilit, e-posta doğrulamalı sıfırlama =====================
   V51.EdPin — yalnız editör girişini etkiler (öğretmen PIN'i / V36 / V37'ye dokunulmaz).

   GÜVENLİK SINIRI (açıkça):
   • Bu dosya tarayıcıda çalışan tek bir HTML'dir. İlk editör PIN'i (geçiş/test aşaması) burada yalnız TUZLU SHA-256
     ÖZETİ olarak durur, açık metin olarak yazılmaz; yine de 6 haneli bir PIN'in özeti 1.000.000 olasılık denenerek
     saniyeler içinde bulunabilir. Yani bu GERÇEK GÜVENLİK DEĞİLDİR; yalnız yerel bir erişim ayrımıdır.
   • Hatalı deneme sayacı ve kilit tarayıcıda (localStorage) tutulur: uygulama kapatılıp açılınca korunur, ancak
     tarayıcı verisini silen ya da geliştirici araçlarını kullanan biri sayacı sıfırlayabilir. Gerçek saldırı koruması değildir.
   • Üretim: PIN sunucuda doğrulanmalı. Altyapı hazır: sunucu/editor_pin.js → POST /api/editor-pin/giris (scrypt özeti,
     sunucu taraflı kademeli kilit, PIN sürümüyle oturum kapatma). İstemcide anahtar: V51.EdPin.SUNUCU_DOGRULAMA.
   • E-posta adresi, e-posta servisi anahtarı / SMTP parolası bu dosyada YOKTUR; yalnız sunucu ortam değişkenlerindedir.
   • Sıfırlama: sunucu kayıtlı editör e-postasına tek kullanımlık, süreli 6 haneli kod gönderir; kod en çok 5 kez denenir;
     doğrulanmadan yeni PIN kaydedilmez. Sunucu/e-posta yapılandırılmamışsa bu açıkça yazılır; “gönderildi” denmez.

   Kayıtlar (localStorage; anahtarlar V38'den):
   • dk-editor-pin38   = {v:2, salt, h, surum, kaynak:'sifirlama', sunucuSurumu, at}   (yoksa ilk PIN geçerlidir)
     V38 biçimindeki eski {v:1} kayıt silinmez: dk-editor-pin38-v1-yedek515 anahtarına taşınır.
   • dk-editor-kilit38 = {n, until, r}  (r = art arda kilit sayısı; başarılı girişte silinir)
   • dk-editor-gecmis515 = {v:1, liste:[{t, o, a}]}  (bu cihazdaki giriş/sıfırlama geçmişi, en çok 300)
   • sessionStorage dk-editor-oturum38 ('1') + dk-editor-oturum515 (oturumun PIN sürümü). PIN sıfırlanınca sürüm artar;
     eski sürümle açılmış oturumlar (diğer sekmeler dahil) geçersiz olur. */
(function () {
  'use strict';
  if (typeof V38 === 'undefined' || !V38.EP) return;
  const V51 = window.V51 || (window.V51 = {});
  const EP = V38.EP, P5 = V51.EdPin = {};
  // İlk editör PIN'i (geçiş/test): yalnız tuzlu özet. Bkz. yukarıdaki güvenlik sınırı.
  P5.ILK = {v: 2, salt: '9698b7dae1ed5fd56a337b166df4e885', h: '42258e302d4e06c01218f24b6842bc10e21fdbd0b34a82ff50f19fd3bfa8b2e8', surum: 0, kaynak: 'ilk'};
  P5.K = {gecmis: 'dk-editor-gecmis515', yedek: 'dk-editor-pin38-v1-yedek515', oturum: 'dk-editor-oturum515'};
  P5.KILIT_SN = [60, 300, 900, 3600, 21600];
  P5.SUNUCU_DOGRULAMA = false; // üretimde true: giriş /api/editor-pin/giris ile sunucuda doğrulanır
  const e = (s) => esc(String(s == null ? '' : s));

  P5.log = function (o, a) {
    try { const g = JSON.parse(localStorage.getItem(P5.K.gecmis) || 'null') || {v: 1, liste: []}; g.liste.unshift({t: new Date().toISOString(), o, a: a || ''}); g.liste = g.liste.slice(0, 300); localStorage.setItem(P5.K.gecmis, JSON.stringify(g)); } catch (er) {}
  };
  P5.gecmis = () => { try { return (JSON.parse(localStorage.getItem(P5.K.gecmis) || 'null') || {liste: []}).liste; } catch (er) { return []; } };

  /* eski (V38) kullanıcı PIN'i silinmez, yedeğe taşınır; bundan sonra ilk PIN ya da e-postayla sıfırlanan PIN geçerlidir */
  try {
    const o = JSON.parse(localStorage.getItem(EP.PK) || 'null');
    if (o && o.v === 1) { if (!localStorage.getItem(P5.K.yedek)) localStorage.setItem(P5.K.yedek, JSON.stringify(Object.assign({tasindi: new Date().toISOString()}, o))); localStorage.removeItem(EP.PK); P5.log('v1-pin-yedeklendi'); }
  } catch (er) {}

  V38.edRec = function () { try { const o = JSON.parse(localStorage.getItem(EP.PK) || 'null'); if (o && o.v === 2 && typeof o.salt === 'string' && /^[0-9a-f]{64}$/.test(o.h || '')) return o; } catch (er) {} return P5.ILK; };
  P5.surum = () => V38.edRec().surum || 0;
  const ok0 = V38.edOk;
  V38.edOk = function () { if (!ok0()) return false; let s = null; try { s = sessionStorage.getItem(P5.K.oturum); } catch (er) {} return String(s == null ? 0 : s) === String(P5.surum()); };
  P5.att = () => { try { return Object.assign({n: 0, until: 0, r: 0}, JSON.parse(localStorage.getItem(EP.LK) || '{}')); } catch (er) { return {n: 0, until: 0, r: 0}; } };
  V38.edAtt = P5.att;
  V38.edLock = () => { const a = P5.att(); return a.until > Date.now() ? Math.ceil((a.until - Date.now()) / 1000) : 0; };
  P5.sure = (sn) => (sn >= 3600 ? Math.floor(sn / 3600) + ' sa ' + Math.ceil((sn % 3600) / 60) + ' dk' : sn >= 60 ? Math.floor(sn / 60) + ' dk ' + (sn % 60) + ' sn' : sn + ' sn');
  P5.kilitMetni = (l) => `Çok fazla hatalı deneme. Giriş geçici olarak kilitli; kalan süre: ${P5.sure(l)}.`;

  /* ---------- sunucu ---------- */
  P5.adres = () => { try { return String((V46.Hesap.oku() || {}).sunucu || '').replace(/\/+$/, ''); } catch (er) { return ''; } };
  P5.istek = async function (yol, govde) {
    const u = P5.adres(); if (!u) throw Object.assign(new Error('Sunucu adresi girilmedi.'), {kod: 'adres'});
    let r; try { r = await fetch(u + '/api/editor-pin/' + yol, govde === undefined ? {} : {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(govde)}); } catch (er) { throw Object.assign(new Error('Sunucuya ulaşılamadı.'), {kod: 'ag'}); }
    let j = {}; try { j = await r.json(); } catch (er) {}
    if (!r.ok) throw Object.assign(new Error(j.hata || ('Sunucu yanıtı: ' + r.status)), {kod: j.kod || ('http' + r.status), j});
    return j;
  };

  /* ---------- ekran ---------- */
  const pad = (dis) => `<form class="pin37-f" onsubmit="event.preventDefault();return false" autocomplete="off"><label for="ed38-in" class="sr36">Editör PIN'i</label><input id="ed38-in" class="pin37-in" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" ${dis} oninput="V38.edTyped(this)"><span id="ed38-cnt" class="sr36" aria-live="polite"></span>
  <div class="pin37-d" aria-hidden="true">${Array.from({length: 6}, (_, k) => `<i class="${k < EP.pv.buf.length ? 'on' : ''}"></i>`).join('')}</div>
  <div class="pin37-k" role="group" aria-label="Sayı tuşları">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" ${dis} onclick="V38.edKey('${n}')">${n}</button>`).join('')}<span></span><button type="button" ${dis} onclick="V38.edKey('0')">0</button><button type="button" class="pin37-del" ${dis} onclick="V38.edKey('del')" aria-label="Son rakamı sil">⌫</button></div></form>`;
  const DURUM_MET = {
    adres: 'Editör PIN sıfırlaması henüz yapılandırılmadı. E-postayla sıfırlama için bir sunucu kurulmalı ve adresi uygulamaya girilmelidir (Profilim › Hesap › Sunucu ayarı; kurulum: sunucu/README.md). Şu an e-posta gönderilemez.',
    ag: 'Sunucuya ulaşılamadı. İnternet bağlantısını ya da sunucuyu kontrol edin. E-posta gönderilmedi.',
    yapilandirilmadi: 'Sunucu bağlı, ancak e-posta servisi ya da editör e-posta adresi sunucuda yapılandırılmadı. Şu an e-posta gönderilemez.'
  };
  P5.govde = function (P) {
    const ms = P.mesgul ? 'disabled' : '';
    const uy = P.uyari ? `<p class="ed515-uyari" role="alert">${e(P.uyari)}</p>` : '';
    if (P.mode === 'reset') return uy + P5.govdeReset(P, ms);
    return P5.govdeDiger(P, ms);
  };
  P5.govdeReset = function (P, ms) {
      if (P.durum === '?' || !P.durum) return `<div class="pin37-rs"><p>Sıfırlama servisinin durumu denetleniyor…</p></div>`;
      if (P.durum !== 'hazir') return `<div class="pin37-rs ed515-yok" data-durum="${e(P.durum)}"><p><b>Sıfırlama kullanılamıyor.</b> ${e(DURUM_MET[P.durum] || DURUM_MET.ag)}</p><p class="small">PIN'i bilmeden editör alanı açılamaz. Onay kayıtları, içerikler ve ilerleme etkilenmez.</p><div class="pin37-acts">${P.durum === 'ag' ? `<button class="pin37-b" type="button" onclick="V51.EdPin.denetle()">Yeniden dene</button>` : ''}<button class="pin37-x" type="button" onclick="V51.EdPin.giriseDon()">Girişe dön</button></div></div>`;
      return `<div class="pin37-rs ed515-hazir"><p>Kayıtlı editör e-posta adresine <b>tek kullanımlık 6 haneli bir kod</b> gönderilecek. Kod ${e(P.kodDk || 10)} dakika geçerlidir ve en çok 5 kez denenebilir. Kod doğrulanmadan PIN değiştirilemez.</p>${P.test ? '<p class="ed515-test"><b>Test modu:</b> bu sunucu gerçek e-posta göndermiyor; kod sunucudaki test dizinine yazılır.</p>' : ''}<p class="small">Sıfırlama yalnız editör PIN'ini değiştirir; onay kayıtları, sürümler, yayımlanmış içerikler ve öğretmen PIN'i olduğu gibi kalır.</p><div class="pin37-acts"><button class="pin37-b" type="button" ${ms} onclick="V51.EdPin.talep()">${P.mesgul ? 'Gönderiliyor…' : 'Sıfırlama kodu gönder'}</button><button class="pin37-x" type="button" onclick="V51.EdPin.giriseDon()">Vazgeç</button></div></div>`;
  };
  P5.govdeDiger = function (P, ms) {
    if (P.mode === 'kod') {
      const saat = P.bitis ? new Date(P.bitis).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'}) : '';
      return `<div class="pin37-rs"><p>${P.test ? '<b>Test modu:</b> kod sunucudaki test dizinine yazıldı; gerçek e-posta gönderilmedi.' : 'Kod, kayıtlı editör e-posta adresine gönderildi.'}${saat ? ` Kod saat ${e(saat)}'e kadar geçerli.` : ''}</p>
      <form onsubmit="return V51.EdPin.dogrula(event)" autocomplete="off"><label for="ed515-kod">E-postadaki 6 haneli kod</label><input id="ed515-kod" class="ed515-kod" name="kod" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="one-time-code" ${ms} required><div class="pin37-acts"><button class="pin37-b" type="submit" ${ms}>${P.mesgul ? 'Doğrulanıyor…' : 'Kodu doğrula'}</button><button class="pin37-x" type="button" ${ms} onclick="V51.EdPin.yeniKod()">Yeni kod iste</button><button class="pin37-x" type="button" onclick="V51.EdPin.giriseDon()">Vazgeç</button></div></form></div>`;
    }
    if (P.mode === 'yeni' || P.mode === 'yeni2') return P.mesgul ? `<div class="pin37-rs"><p>Yeni PIN sunucuya kaydediliyor…</p></div>` : pad('');
    return pad(V38.edLock() ? 'disabled' : '');
  };
  V38.edPinView = function () {
    const P = EP.pv;
    if (!['reset', 'kod', 'yeni', 'yeni2'].includes(P.mode)) { if (P.mode !== 'login') { P.mode = 'login'; P.buf = ''; P.first = ''; } }
    const lock = P.mode === 'login' ? V38.edLock() : 0;
    const T = {login: ['Editör Onay Alanı', "6 haneli editör PIN'ini gir."], reset: ["Editör PIN'ini sıfırla", 'E-posta doğrulamasıyla.'], kod: ['Doğrulama kodu', ''], yeni: ["Yeni editör PIN'i", '6 rakamdan oluşan yeni bir editör PIN\'i belirle. Öğretmen PIN\'inden farklı olmalı.'], yeni2: ["Yeni PIN'i doğrula", "Aynı PIN'i bir kez daha gir."]}[P.mode];
    const g = P.mode === 'login' ? P5.gecmis().slice(0, 8) : [];
    $.innerHTML = `<section class="pin37 ed38-pin" aria-labelledby="ed38-h" data-ed515="${e(P.mode)}"><div class="pin37-c"><span class="pin37-i" aria-hidden="true">${V38.svg('shield', 26)}</span>${P.mode === 'yeni' ? '<p class="pin37-st">Adım 1 / 2</p>' : P.mode === 'yeni2' ? '<p class="pin37-st">Adım 2 / 2</p>' : ''}<h1 id="ed38-h">${T[0]}</h1>${T[1] ? `<p class="pin37-p">${T[1]}</p>` : ''}${P5.govde(P)}
  <p id="ed38-msg" class="pin37-m" role="alert">${lock ? P5.kilitMetni(lock) : e(P.msg || '')}</p>
  <div class="pin37-ft">${P.mode === 'login' ? `<button class="pin37-x" type="button" onclick="V51.EdPin.sifirlamaAc()">Editör PIN'imi unuttum</button>` : ''}<button class="pin37-x" type="button" onclick="V38.EP.pv.msg='';V51.EdPin.giriseDon(true);go('home')">Editör girişinden çık</button></div>
  <p class="pin37-note">Öğretmen PIN'i bu alanı açmaz. 5 hatalı denemede giriş geçici olarak kilitlenir; süre her kilitte uzar. Editör erişimi, bu HTML dosyasında <b>yalnızca yerel bir erişim ayrımıdır</b>; deneme sayacı da bu cihazda tutulur. Gerçek güvenlik sunucu taraflı doğrulama ister.</p>
  ${g.length ? `<details class="ed515-g"><summary>Bu cihazdaki editör giriş geçmişi</summary><ul>${g.map((x) => `<li><time>${e(new Date(x.t).toLocaleString('tr-TR'))}</time> ${e(P5.OLAY[x.o] || x.o)}${x.a && x.o === 'kilit' ? ' (' + e(P5.sure(+x.a)) + ')' : ''}</li>`).join('')}</ul></details>` : ''}</div></section>`;
    P.msg = '';
    const i = document.getElementById(P.mode === 'kod' ? 'ed515-kod' : 'ed38-in');
    if (i && !lock && !P.mesgul && (P.mode === 'kod' || !V37.coarse())) try { i.focus({preventScroll: true}); } catch (er) {}
    clearInterval(P5._tik); clearTimeout(V38._elt);
    if (lock) P5._tik = setInterval(() => { if (view !== 'editor' || V38.edOk()) { clearInterval(P5._tik); return; } const l = V38.edLock(); if (!l) { clearInterval(P5._tik); V38.edPinView(); return; } const m = document.getElementById('ed38-msg'); if (m) m.textContent = P5.kilitMetni(l); }, 1000);
    if (P.mode === 'reset' && (!P.durum || P.durum === '?') && !P5._den) P5.denetle();
  };
  P5.OLAY = {'giris': 'Başarılı giriş', 'hatali': 'Hatalı PIN', 'kilit': 'Geçici kilit', 'sifirlama-talep': 'Sıfırlama kodu istendi', 'kod-dogrulandi': 'Kod doğrulandı', 'kod-hatali': 'Hatalı kod', 'pin-degisti': "PIN değiştirildi", 'oturumlar-kapatildi': 'Eski oturumlar kapatıldı', 'v1-pin-yedeklendi': 'Eski editör PIN kaydı yedeklendi', 'cikis': 'Çıkış'};

  P5.giriseDon = function (sessiz) { clearInterval(P5._tik); Object.assign(EP.pv, {mode: 'login', buf: '', first: '', jeton: '', talepId: '', mesgul: 0, durum: '', uyari: ''}); if (!sessiz) V38.edPinView(); };
  P5.sifirlamaAc = function () { Object.assign(EP.pv, {mode: 'reset', buf: '', first: '', msg: '', durum: '?', jeton: '', talepId: '', mesgul: 0, uyari: ''}); V38.edPinView(); };
  P5.denetle = async function () {
    const P = EP.pv; P5._den = 1; P.durum = '?';
    try { const d = await P5.istek('durum'); P.durum = d.sifirlama ? 'hazir' : 'yapilandirilmadi'; P.test = !!d.test; P.kodDk = d.kodDakika || 10; }
    catch (er) { P.durum = er.kod === 'adres' ? 'adres' : 'ag'; }
    P5._den = 0; if (P.mode === 'reset' && view === 'editor') V38.edPinView();
  };
  P5.talep = async function () {
    const P = EP.pv; if (P.mesgul) return; P.mesgul = 1; P.uyari = ''; V38.edPinView();
    try { const j = await P5.istek('talep', {}); Object.assign(P, {talepId: j.talepId, bitis: j.bitis, test: !!j.test, mode: 'kod'}); P5.log('sifirlama-talep'); }
    catch (er) { if (er.kod === 'yapilandirilmadi') P.durum = 'yapilandirilmadi'; else if (er.kod === 'adres' || er.kod === 'ag') P.durum = er.kod; P.msg = er.message; }
    P.mesgul = 0; if (view === 'editor') V38.edPinView();
  };
  P5.yeniKod = function () { Object.assign(EP.pv, {mode: 'reset', talepId: '', msg: ''}); P5.talep(); };
  P5.dogrula = function (ev) {
    ev.preventDefault(); const P = EP.pv, kod = String(ev.target.elements.kod.value || '').trim();
    if (!/^\d{6}$/.test(kod)) { const m = document.getElementById('ed38-msg'); if (m) m.textContent = 'Kod 6 rakam olmalı.'; return false; }
    (async () => {
      P.mesgul = 1; V38.edPinView();
      try { const j = await P5.istek('dogrula', {talepId: P.talepId, kod}); Object.assign(P, {jeton: j.jeton, mode: 'yeni', buf: '', first: '', msg: 'Kod doğrulandı. Yeni editör PIN\'ini belirle.'}); P5.log('kod-dogrulandi'); }
      catch (er) { P.msg = er.message; P5.log('kod-hatali', er.kod || ''); }
      P.mesgul = 0; if (view === 'editor') V38.edPinView();
    })();
    return false;
  };
  P5.tamamla = async function (pin) {
    const P = EP.pv; P.mesgul = 1; V38.edPinView();
    try {
      const j = await P5.istek('tamamla', {jeton: P.jeton, pin: String(pin)});
      const salt = V37.salt(), R0 = V38.edRec();
      const kayit = {v: 2, salt, h: V38.edHash(salt, String(pin)), surum: Math.max((R0.surum || 0) + 1, j.pinSurumu || 0), kaynak: 'sifirlama', sunucuSurumu: j.pinSurumu || null, at: new Date().toISOString()};
      localStorage.setItem(EP.PK, JSON.stringify(kayit)); localStorage.removeItem(EP.LK);
      try { sessionStorage.removeItem(EP.SK); sessionStorage.removeItem(P5.K.oturum); } catch (er) {}
      P5.log('pin-degisti', 'surum ' + kayit.surum); P5.log('oturumlar-kapatildi');
      Object.assign(P, {mode: 'login', buf: '', first: '', jeton: '', talepId: '', mesgul: 0, msg: ''});
      UI.toast("Editör PIN'i değiştirildi. Eski editör oturumları kapatıldı; yeni PIN ile giriş yap.");
    } catch (er) { Object.assign(P, {mesgul: 0, jeton: '', mode: 'reset', durum: '?', buf: '', first: '', uyari: er.message + " PIN değiştirilmedi."}); }
    if (view === 'editor') V38.edPinView();
  };

  /* ---------- PIN girişi ---------- */
  V38.edDone = function () {
    const P = EP.pv, pin = String(P.buf);
    if (P.mode === 'yeni') {
      if (!/^\d{6}$/.test(pin)) return V38.edErr('PIN tam olarak 6 rakam olmalı.');
      const T = V36.rec(); if (T && T.len === 6 && V36.hash(T.salt, pin) === T.h) return V38.edErr("Editör PIN'i öğretmen PIN'iyle aynı olamaz.");
      if (V38.edHash(P5.ILK.salt, pin) === P5.ILK.h) return V38.edErr("Yeni PIN, ilk (geçiş) editör PIN'iyle aynı olamaz.");
      P.first = pin; P.buf = ''; P.mode = 'yeni2'; return V38.edPinView();
    }
    if (P.mode === 'yeni2') { if (pin !== P.first) { P.mode = 'yeni'; P.first = ''; return V38.edErr("PIN'ler eşleşmedi. Yeni PIN'i yeniden gir."); } P.buf = ''; return P5.tamamla(pin); }
    if (P.mode !== 'login') return;
    if (V38.edLock()) { P.buf = ''; return V38.edPinView(); }
    const R = V38.edRec();
    if (/^\d{6}$/.test(pin) && V38.edHash(R.salt, pin) === R.h) {
      try { sessionStorage.setItem(EP.SK, '1'); sessionStorage.setItem(P5.K.oturum, String(R.surum || 0)); localStorage.removeItem(EP.LK); } catch (er) {}
      P5.log('giris'); P.mode = ''; P.buf = ''; UI.toast('Editör oturumu açıldı.'); return V38.edView();
    }
    const a = P5.att(); a.n = (a.n || 0) + 1; P5.log('hatali', String(a.n));
    if (a.n >= 5) { const sn = P5.KILIT_SN[Math.min(a.r || 0, P5.KILIT_SN.length - 1)]; a.until = Date.now() + sn * 1000; a.r = (a.r || 0) + 1; a.n = 0; P5.log('kilit', String(sn)); }
    try { localStorage.setItem(EP.LK, JSON.stringify(a)); } catch (er) {}
    if (a.until > Date.now()) { P.buf = ''; return V38.edPinView(); }
    V38.edErr(`PIN hatalı. Kilitlenmeden önce kalan deneme: ${5 - a.n}.`);
  };
  /* eski “SIFIRLA yaz → PIN silinsin” akışı kaldırıldı: doğrulamasız sıfırlama yok */
  V38.edReset = function (ev) { if (ev && ev.preventDefault) ev.preventDefault(); P5.sifirlamaAc(); return false; };
  const lo0 = V38.edLogout;
  V38.edLogout = function () { try { sessionStorage.removeItem(P5.K.oturum); } catch (er) {} P5.log('cikis'); return lo0.apply(this, arguments); };
})();
