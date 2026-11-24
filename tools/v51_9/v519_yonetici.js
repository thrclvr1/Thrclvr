
/* ===================== V51.9: Yönetici girişi = Google doğrulaması + editör PIN'i (iki adım); öğrenci: Google ya da misafir =====================
   Yönetici (Editör Onay Alanı) girişi iki adımdır:
     Adım 1 — Google: kullanıcı Google ile giriş yapar (V46.Hesap; tarayıcıda Google penceresi, APK'da Android köprüsü), sunucu kimlik belgesini
              Google anahtarlarıyla doğrular ve hesabın rollerini döndürür (/api/ben). Hesap sunucudaki EDITOR_EPOSTALARI listesindeyse
              ('editor' rolü) adım tamamlanır. Yönetici e-posta adresi YALNIZ sunucu ortam değişkenindedir; bu HTML'de yoktur.
     Adım 2 — mevcut 6 haneli editör PIN'i (V51.EdPin; kilit, e-postayla sıfırlama aynen).
   Oturum yalnız sessionStorage 'dk-yonetici519' = {v:1, yol:'google'|'gecis', t}; 12 saat geçerli. Google oturumu kapanınca
   (V46.Hesap.cikis) ya da editör çıkışında silinir. V38.edOk artık PIN oturumu + bu kaydı birlikte ister.
   GEÇİŞ DÖNEMİ (V51.Yonetici.GECIS): sunucu henüz kurulmadığı için, bu cihazda sunucu adresi hiç girilmemişse ve bu cihazda daha önce
   hiç Google ile yönetici doğrulaması yapılmamışsa, yalnız PIN ile girişe açıkça uyarılarak izin verilir. Sunucu adresi girildiği anda
   ya da bir kez Google doğrulaması yapıldığında (localStorage 'dk-yonetici519-k') bu cihazda geçiş kapanır. Sunucu kurulunca GECIS:false.
   Bu ayrım istemci tarafındadır (HTML değiştirilerek aşılabilir); sunucudaki işlemler (bildirim yönetimi vb.) sunucuda rolle denetlenir.
   Öğrenci: açılıştaki “Google ile giriş” / “Misafir olarak devam et” aynen; sunucu yoksa Google düğmesi öğrenciden adres istemez,
   anlaşılır bir “henüz açık değil, misafir olarak devam et” penceresi açar. Varsayılan sunucu adresi V51.Yonetici.SUNUCU (kurulumdan sonra). */
(function () {
  if (typeof V38 === 'undefined' || typeof V46 === 'undefined' || !V46.Hesap) return;
  const V51 = window.V51 = window.V51 || {};
  const H = V46.Hesap;
  const Y = V51.Yonetici = {
    GECIS: true,          // ← sunucu kurulana kadar: adres girilmemiş cihazda yalnız PIN ile girişe (uyarıyla) izin
    SUNUCU: '',           // ← kurulumdan sonra Render adresi (https://…onrender.com); öğrenciler adres girmek zorunda kalmaz
    SURE_SA: 12,
    K: {oturum: 'dk-yonetici519', kalici: 'dk-yonetici519-k'},
    durum: {asama: 'bekle', mesaj: '', ad: ''}
  };
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const ss = {al: (k) => { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (x) { return null; } }, yaz: (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }};
  const ls = {al: (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } }, yaz: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }};

  /* ---------- varsayılan sunucu adresi (merkezi ayar; kullanıcının girdiği adres her zaman önce gelir) ---------- */
  const oku0 = H.oku;
  H.oku = function () { const o = oku0.apply(this, arguments); if (!o.sunucu && Y.SUNUCU) o.sunucu = Y.SUNUCU; return o; };
  Y.adres = () => String((H.oku() || {}).sunucu || '').replace(/\/+$/, '');

  /* ---------- oturum kuralı ---------- */
  Y.kayit = () => { const r = ss.al(Y.K.oturum); return r && r.v === 1 && (Date.now() - (r.t || 0)) < Y.SURE_SA * 3600e3 ? r : null; };
  Y.gecisIzinli = () => Y.GECIS === true && !Y.adres() && !(ls.al(Y.K.kalici) || {}).google;
  Y.googleOturumu = () => { const o = H.oku(); return o.mod === 'google' && !!o.oturum; };
  Y.tamam = function () {
    const r = Y.kayit(); if (!r) return false;
    if (r.yol === 'google') return Y.googleOturumu();
    if (r.yol === 'gecis') return Y.gecisIzinli();
    return false;
  };
  const ok0 = V38.edOk;
  V38.edOk = function () { return ok0.apply(this, arguments) && Y.tamam(); };
  Y.bitir = function () { ss.yaz(Y.K.oturum, null); };

  /* ---------- adım 1: Google doğrulaması ---------- */
  Y.denetle = async function () {
    if (Y._den) return Y._den;
    const D = Y.durum;
    const is = (async () => {
      if (!Y.adres()) { D.asama = 'kurulmadi'; return; }
      if (!Y.googleOturumu()) { D.asama = 'giris'; return; }
      D.asama = 'denetleniyor'; Y.ciz();
      let r; try { r = await H.istek('/api/ben'); } catch (x) { D.asama = 'ag'; D.mesaj = 'Sunucuya ulaşılamadı.'; return; }
      if (r.durum === 401) { D.asama = 'giris'; D.mesaj = 'Google oturumunun süresi doldu; yeniden giriş yap.'; return; }
      if (r.durum !== 200) { D.asama = 'ag'; D.mesaj = (r.j && r.j.hata) || ('Sunucu yanıtı: ' + r.durum); return; }
      const k = r.j.kullanici || {}; D.ad = k.ad || '';
      if ((k.roller || []).includes('editor')) {
        ss.yaz(Y.K.oturum, {v: 1, yol: 'google', t: Date.now()}); ls.yaz(Y.K.kalici, {v: 1, google: 1, t: new Date().toISOString()});
        D.asama = 'tamam'; D.mesaj = '';
        try { V51.EdPin.log('google-dogrulandi'); } catch (x) {}
      } else { D.asama = 'yetkisiz'; }
    })();
    // (iş eşzamanlı biterse bayrak geride kalmasın diye bayrak işten SONRA kurulur ve ancak aynı işe aitse temizlenir)
    Y._den = is;
    try { await is; } finally { if (Y._den === is) Y._den = null; }
    if (view === 'editor') V38.edPinView();
  };
  Y.googleGiris = function () { Y._bekliyor = 1; Y._donus = Date.now(); H.googleGiris(); };
  // Google girişi bitince uygulama öğrenciyi Profilim'e götürür; yönetici akışından başlatıldıysa yönetici ekranına dönülür (yalnız bir kez)
  const go0 = go;
  go = function (v, a) {
    if (Y._donus) { const taze = Date.now() - Y._donus < 120e3; Y._donus = 0; if (taze && v === 'profil46') { v = 'editor'; a = null; } }
    return go0.call(this, v, a);
  };
  Y.baskaHesap = async function () {
    try { await H.istek('/api/cikis', 'POST'); } catch (x) {}
    const o = H.oku(); o.mod = 'misafir'; o.oturum = ''; o.kullanici = null; H.yaz(o);
    try { if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (x) {}
    Y.durum = {asama: 'giris', mesaj: '', ad: ''}; Y.googleGiris();
  };
  Y.gecisle = function () {
    if (!Y.gecisIzinli()) { Y.ciz(); return; }
    ss.yaz(Y.K.oturum, {v: 1, yol: 'gecis', t: Date.now()});
    try { V51.EdPin.log('gecis-pin'); } catch (x) {}
    V38.edPinView();
  };
  // Google girişi bitince (tarayıcı penceresi ya da Android köprüsü) yönetici ekranındaysak denetim yeniden yapılır
  const gb0 = H.girisBelgesi;
  H.girisBelgesi = async function () { const r = await gb0.apply(this, arguments); if (view === 'editor' && !V38.edOk()) { Y.durum.asama = 'bekle'; setTimeout(() => Y.denetle(), 50); } return r; };
  const ck0 = H.cikis;
  H.cikis = function () { Y.bitir(); return ck0.apply(this, arguments); };
  const lo0 = V38.edLogout;
  V38.edLogout = function () { Y.bitir(); Y.durum = {asama: 'bekle', mesaj: '', ad: ''}; return lo0.apply(this, arguments); };

  const KART = (ic) => `<section class="pin37 ed38-pin yn519" aria-labelledby="yn519-h"><div class="pin37-c"><span class="pin37-i" aria-hidden="true">${V38.svg('shield', 26)}</span>
<p class="pin37-st">Adım 1 / 2 · Google doğrulaması</p><h1 id="yn519-h">Yönetici girişi</h1>${ic}
<div class="pin37-ft"><button class="pin37-x" type="button" onclick="V51.EdPin.giriseDon(true);go('home')">Yönetici girişinden çık</button></div>
<p class="pin37-note">Yönetici girişi iki adımlıdır: önce yönetici olarak tanımlı Google hesabıyla doğrulama, sonra editör PIN'i. Yönetici e-posta adresi yalnız sunucuda tanımlıdır; bu uygulamada saklanmaz. Bu ekran uygulama içi bir erişim ayrımıdır; sunucudaki işlemler sunucuda ayrıca denetlenir.</p></div></section>`;
  Y.ekran = function () {
    const D = Y.durum, g = Y.googleOturumu(), u = (H.oku().kullanici || {});
    if (D.asama === 'tamam') D.asama = 'bekle';   // adım 1 tamamlanmışken oturum düştüyse yeniden denetle
    if (D.asama === 'bekle') { D.asama = 'denetleniyor'; setTimeout(() => Y.denetle(), 0); }
    let ic = '';
    if (D.asama === 'kurulmadi') {
      ic = `<p class="pin37-p">Google doğrulaması için hesap sunucusu henüz kurulmadı.</p>
<div class="yn519-k"><p>Kurulum tamamlanınca yönetici girişi <b>Google hesabı + PIN</b> ile yapılır. Kurulum adımları: <b>docs/KURULUM_SUNUCU_VE_APK.md</b>.</p></div>
${Y.gecisIzinli() ? `<div class="yn519-gecis" role="note"><p><b>Geçiş dönemi.</b> Sunucu kurulana kadar bu cihazda yalnız PIN ile girebilirsin. Sunucu adresi girildiğinde ya da bir kez Google ile doğrulama yapıldığında bu seçenek bu cihazda kendiliğinden kapanır.</p></div>
<div class="pin37-acts"><button class="pin37-b" type="button" onclick="V51.Yonetici.gecisle()">Geçiş dönemi: PIN ile devam et</button><button class="pin37-x" type="button" onclick="V46.Hesap.ayarlar('Yönetici girişi için hesap sunucusunun adresini gir.')">Sunucu adresini gir</button></div>`
  : `<div class="pin37-acts"><button class="pin37-b" type="button" onclick="V46.Hesap.ayarlar('Yönetici girişi için hesap sunucusunun adresini gir.')">Sunucu adresini gir</button></div>`}`;
    } else if (D.asama === 'giris' || (!g && D.asama !== 'denetleniyor')) {
      ic = `<p class="pin37-p">Yönetici olarak tanımlı Google hesabınla doğrula.</p>${D.mesaj ? `<p class="ed515-uyari" role="alert">${e(D.mesaj)}</p>` : ''}
<div class="pin37-acts"><button class="pin37-b yn519-g" type="button" onclick="V51.Yonetici.googleGiris()">${V51G} Google ile doğrula</button></div>`;
    } else if (D.asama === 'denetleniyor') {
      ic = `<p class="pin37-p" aria-live="polite">Google hesabın sunucuda denetleniyor…</p>`;
    } else if (D.asama === 'yetkisiz') {
      ic = `<p class="ed515-uyari" role="alert">Bu Google hesabı${u.ad ? ` (<b>${e(u.ad)}</b>)` : ''} yönetici olarak tanımlı değil.</p>
<p class="small">Yöneticiler sunucudaki yönetici listesinden belirlenir. Doğru hesapla giriş yap.</p>
<div class="pin37-acts"><button class="pin37-b" type="button" onclick="V51.Yonetici.baskaHesap()">Başka Google hesabıyla giriş</button></div>`;
    } else if (D.asama === 'ag') {
      ic = `<p class="ed515-uyari" role="alert">${e(D.mesaj || 'Sunucuya ulaşılamadı.')}</p><p class="small">Google doğrulaması yapılmadan yönetici alanı açılmaz. İnternet bağlantısını ya da sunucuyu kontrol et.</p>
<div class="pin37-acts"><button class="pin37-b" type="button" onclick="V51.Yonetici.durum.asama='bekle';V38.edPinView()">Yeniden dene</button></div>`;
    }
    $.innerHTML = KART(ic);
  };
  Y.ciz = function () { if (view === 'editor' && !Y.tamam()) Y.ekran(); };
  const V51G = '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/></svg>';

  /* ---------- adım 2: PIN ekranı — adım 1 tamamlanmadan açılmaz ---------- */
  const pv0 = V38.edPinView;
  V38.edPinView = function () {
    const P = V38.EP && V38.EP.pv;
    if (!Y.tamam()) { if (P) P.mode = 'login'; return Y.ekran(); }   // PIN, sıfırlama ve yeni PIN ekranları ancak adım 1'den sonra
    const r = pv0.apply(this, arguments);
    try {
      const c = document.querySelector('#app .ed38-pin .pin37-c'), h = c && c.querySelector('h1');
      if (c && h && !c.querySelector('.yn519-ad') && (!P || P.mode === 'login')) {
        const k = Y.kayit() || {}, u = H.oku().kullanici || {};
        h.insertAdjacentHTML('beforebegin', '<p class="pin37-st yn519-ad">Adım 2 / 2 · Editör PIN\'i</p>');
        h.insertAdjacentHTML('afterend', k.yol === 'google' ? `<p class="yn519-ok">✓ Google ile doğrulandı${u.ad ? ': ' + e(u.ad) : ''}</p>` : '<p class="yn519-gecis-u">Geçiş dönemi: Google doğrulaması henüz kurulmadı; yalnız PIN ile giriliyor.</p>');
      }
    } catch (x) {}
    return r;
  };

  /* ---------- öğrenci: sunucu yokken Google düğmesi adres sormaz ---------- */
  const gg0 = H.googleGiris;
  H.googleGiris = function () {
    if (!Y.adres() && !Y._bekliyor) {
      try {
        UI.sheet({title: 'Google ile giriş', body: () => `<div class="hs46 yn519-og"><p>Google ile giriş <b>henüz açılmadı</b>. Şimdilik misafir olarak devam edebilirsin; ilerlemen bu cihazda saklanır.</p><p class="small mut">Google girişi açıldığında hesabınla giriş yapıp ilerlemeni başka cihazlara taşıyabileceksin.</p></div>`,
          footer: () => '<button class="p" onclick="UI.close()">Tamam</button>'});
      } catch (x) {}
      return;
    }
    Y._bekliyor = 0;
    return gg0.apply(this, arguments);
  };

  /* ---------- giriş noktaları ---------- */
  // Açılış ekranı: “Nasıl devam etmek istersin?” kartına “Yönetici girişi” bağlantısı
  Y.baglanti = function () {
    try { const u = document.getElementById('uye39'), bb = u && u.querySelector('.hs46-bb'); if (bb && !u.querySelector('.yn519-l')) bb.insertAdjacentHTML('afterend', `<button type="button" class="yn519-l" onclick="V42.geriSonra(()=>{V39.secim(false);go('editor')})">${V38.svg('shield', 16)} Yönetici girişi <small>(Google + PIN)</small></button>`); } catch (x) {}
  };
  const sec0 = V39.secim;
  V39.secim = function () { const r = sec0.apply(this, arguments); Y.baglanti(); setTimeout(Y.baglanti, 0); return r; };
  // açılıştaki seçim ekranı bu modülden önce çizilmiş olabilir; hesap kartı da sonradan eklenebilir
  Y.baglanti(); setTimeout(Y.baglanti, 0); setTimeout(Y.baglanti, 600);
  try { new MutationObserver(() => { if (document.getElementById('uye39') && !document.querySelector('#uye39 .yn519-l')) Y.baglanti(); }).observe(document.body, {childList: true, subtree: false}); } catch (x) {}
  // Mod paneli › “Yönetici / Editör girişi” etiketi
  if (typeof V50 !== 'undefined' && V50.Mod) {
    const ac0 = V50.Mod.ac;
    V50.Mod.ac = function () { const r = ac0.apply(this, arguments); setTimeout(() => { document.querySelectorAll('.ed51-giris small').forEach((s) => { s.textContent = '(Google + PIN)'; }); }, 0); return r; };
  }
  try { V51.EdPin.OLAY['google-dogrulandi'] = 'Google ile yönetici doğrulandı'; V51.EdPin.OLAY['gecis-pin'] = 'Geçiş dönemi: yalnız PIN ile giriş'; } catch (x) {}
})();
