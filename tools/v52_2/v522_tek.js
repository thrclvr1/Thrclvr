/* ===================== V52.2: Tek yönetici + kişinin kendi Google hesabına yedek =====================
   1) TEK YÖNETİCİ (APK, telefondaki Google hesabı yolu — V52.1):
      - Yönetici hesabı uygulamaya yalnız SHA-256 özetiyle gömülüdür (T.YONETICI; o = SHA-256('dkab521|' + e-posta küçük harf)).
        E-posta adresi HTML'de yoktur.
      - Yönetici girişi düğmeleri (açılış ekranı .yn519-l, Mod paneli .ed51-giris) YALNIZ bu hesapla giriş yapılmışken görünür.
      - Başka hesaplar yönetici olamaz (“Bu hesabı yönetici yap” adımı yok; ekranda “yönetici değil”).
      - Yönetici şifresini KENDİ belirler: telefonda kendi şifresi yoksa ilk (geçiş) PIN kabul edilmez, 6 haneli şifre iki kez girilir.
        “Şifremi unuttum”: Google adımı (yönetici hesabı) tamamlandığı için yeni şifre doğrudan belirlenir (e-posta gerekmez).
   2) YEDEK (APK): uygulama verisi (localStorage + editör kayıtları IndexedDB dk38) uygulamanın dosya alanına tek bir dosya olarak
      yazılır (köprü {tur:'yedek-yaz', veri}); Android otomatik yedeği bu dosyayı kişinin kendi Google hesabına yedekler.
      Uygulama yeniden kurulunca / yeni telefonda dosya geri gelir; ilk açılışta {tur:'yedek-oku'} ile okunur ve veriler geri konur.
      İşaret: localStorage dk-yedek522 = {v:1, t | geri}. Sunucu ya da Google Cloud ayarı gerekmez. */
(function () {
  if (!window.V52 || !V52.Cihaz || !V52.Google || !window.V51 || !V51.Yonetici || !V51.EdPin || typeof V38 === 'undefined') return;
  const C = V52.Cihaz, G = V52.Google, H = V46.Hesap, Y = V51.Yonetici, P5 = V51.EdPin, EP = V38.EP, AN = V51.Android;
  const T = V52.Tek = {
    YONETICI: ['c52d9fe8ee575c200695836253adca403aa41b870218d701b08710d3ad174b37']   // tek yönetici hesabının özeti (adres değil)
  };

  /* ---------- 1. tek yönetici ---------- */
  T.yoneticiHesap = () => { const u = H.oku().kullanici || {}; return C.mi() && G.yerelGiris() && T.YONETICI.includes(u.o); };
  const ym0 = G.yoneticiMi;
  G.yoneticiMi = function () { return C.mi() ? T.yoneticiHesap() : ym0.apply(this, arguments); };
  const de0 = Y.denetle;
  Y.denetle = async function () {
    if (C.mi() && G.yerelGiris() && !T.yoneticiHesap()) {
      Y.durum.asama = 'yetkisiz'; Y.durum.ad = (H.oku().kullanici || {}).ad || '';
      if (view === 'editor') V38.edPinView();
      return;
    }
    return de0.apply(this, arguments);
  };
  T.kendiSifre = () => { const R = V38.edRec(); return !!R && R !== P5.ILK && R.kaynak !== 'ilk'; };
  T.adim1 = () => C.mi() && T.yoneticiHesap() && Y.tamam();

  const ek0 = Y.ekran;
  Y.ekran = function () {
    const r = ek0.apply(this, arguments);
    if (C.mi() && Y.durum.asama === 'yetkisiz') {
      try {
        const k = document.querySelector('#app .yn519 .pin37-c');
        const s = k && [...k.querySelectorAll('p.small')].find((p) => /sunucu/i.test(p.textContent));
        if (s) s.textContent = 'Bu uygulamanın tek bir yönetici hesabı vardır. Öğrenme alanını misafir olarak ya da kendi Google hesabınla kullanabilirsin.';
        const a = k && k.querySelector('.pin37-acts');
        if (a && !a.querySelector('.yn522-don')) a.insertAdjacentHTML('beforeend', '<button class="pin37-x yn522-don" type="button" onclick="go(\'home\')">Öğrenme alanına dön</button>');
      } catch (x) {}
    }
    return r;
  };

  const pv0 = V38.edPinView;
  V38.edPinView = function () {
    const P = EP.pv;
    if (T.adim1() && !V38.edOk()) {
      if (!T.kendiSifre() && !['yeni', 'yeni2'].includes(P.mode)) Object.assign(P, {mode: 'yeni', buf: '', first: '', msg: P.msg || ''});
      if (P.mode === 'reset' || P.mode === 'kod') Object.assign(P, {mode: 'yeni', buf: '', first: '', msg: ''});
    }
    const r = pv0.apply(this, arguments);
    if (T.adim1()) {
      try {
        const k = document.querySelector('#app .ed38-pin .pin37-c'); if (!k) return r;
        const h = k.querySelector('h1'), p = k.querySelector('h1 + p, .pin37-p');
        const st = k.querySelector('.pin37-st'); if (st) st.textContent = 'Adım 2 / 2 · Yönetici şifresi';
        if (P.mode === 'yeni' || P.mode === 'yeni2') {
          if (h) h.textContent = P.mode === 'yeni' ? 'Yönetici şifreni belirle' : 'Şifreni yeniden gir';
          if (p) p.textContent = P.mode === 'yeni' ? '6 rakamdan oluşan kendi şifreni belirle. Bu şifreyi yalnız sen bileceksin; yönetici girişi bundan sonra Google hesabın + bu şifre ile yapılır.' : 'Aynı 6 haneli şifreyi bir kez daha gir.';
        } else if (h) h.textContent = 'Yönetici şifresi';
        k.querySelectorAll('.pin37-ft .pin37-x').forEach((b) => { if (/unuttum/i.test(b.textContent)) b.textContent = 'Şifremi unuttum'; });
        const n = k.querySelector('.pin37-note');
        if (n) n.textContent = 'Yönetici girişi iki adımlıdır: telefondaki yönetici Google hesabı ve senin belirlediğin şifre. Şifreni unutursan, yönetici Google hesabınla girdiğin için yenisini burada belirleyebilirsin. 5 hatalı denemede giriş geçici olarak kilitlenir. Bu uygulama içi bir erişim ayrımıdır.';
      } catch (x) {}
    }
    return r;
  };
  const tm0 = P5.tamamla;
  P5.tamamla = async function (pin) {
    if (!T.adim1()) return tm0.apply(this, arguments);
    const salt = V37.salt(), R0 = V38.edRec();
    const kayit = {v: 2, salt, h: V38.edHash(salt, String(pin)), surum: (R0.surum || 0) + 1, kaynak: 'yonetici', at: new Date().toISOString()};
    localStorage.setItem(EP.PK, JSON.stringify(kayit)); localStorage.removeItem(EP.LK);
    try { sessionStorage.setItem(EP.SK, '1'); sessionStorage.setItem(P5.K.oturum, String(kayit.surum)); } catch (x) {}
    P5.log('pin-degisti', 'surum ' + kayit.surum);
    Object.assign(EP.pv, {mode: '', buf: '', first: '', msg: '', jeton: '', talepId: '', mesgul: 0, uyari: ''});
    UI.toast('Yönetici şifren kaydedildi. Yönetici alanı açıldı.');
    return V38.edView();
  };

  // yönetici girişi düğmeleri yalnız yönetici hesabında görünür
  T.gizle = () => { try { document.documentElement.toggleAttribute('data-yon522', C.mi() && !T.yoneticiHesap()); } catch (x) {} };
  const yz0 = H.yaz;
  H.yaz = function () { const r = yz0.apply(this, arguments); T.gizle(); return r; };
  T.gizle();
  try { const st = document.createElement('style'); st.textContent = 'html[data-yon522] .yn519-l,html[data-yon522] .ed51-giris{display:none!important}'; document.head.appendChild(st); } catch (x) {}

  /* ---------- 2. kişinin kendi Google hesabına yedek (Android otomatik yedeği) ---------- */
  const B = V52.Yedek = {K: 'dk-yedek522', hazir: 0, _z: 0};
  B.haric = (k) => !k || k.startsWith('__') || k === 'dk-google52-jwks';
  B.topla = function () {
    const ls = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!B.haric(k)) ls[k] = localStorage.getItem(k); }
    let idb = null;
    try { if (V38.db && V38.KEYS) { idb = {}; V38.KEYS.forEach((k) => { idb[k] = V38.mem[k]; }); } } catch (x) { idb = null; }
    return JSON.stringify({v: 1, t: new Date().toISOString(), ls, idb});
  };
  B.yaz = function () {
    clearTimeout(B._z); B._z = 0;
    if (!B.hazir || !AN.mi()) return false;
    try { window.DKAndroid.postMessage(JSON.stringify({tur: 'yedek-yaz', veri: B.topla()})); B.son = Date.now(); return true; } catch (x) { return false; }
  };
  B.planla = function () { if (!B.hazir) return; clearTimeout(B._z); B._z = setTimeout(B.yaz, 4000); };
  // değişiklikleri yakala: localStorage yazımları ve editör kayıtları (IndexedDB)
  try {
    const sp = Storage.prototype, s0 = sp.setItem, r0 = sp.removeItem, c0 = sp.clear;
    sp.setItem = function () { const x = s0.apply(this, arguments); if (this === window.localStorage && B.hazir) B.planla(); return x; };
    sp.removeItem = function () { const x = r0.apply(this, arguments); if (this === window.localStorage && B.hazir) B.planla(); return x; };
    sp.clear = function () { const x = c0.apply(this, arguments); if (this === window.localStorage && B.hazir) B.planla(); return x; };
  } catch (x) {}
  try { const pu0 = V38.put; V38.put = function () { const x = pu0.apply(this, arguments); B.planla(); return x; }; } catch (x) {}
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && B._z) B.yaz(); });
  window.addEventListener('pagehide', () => { if (B._z) B.yaz(); });

  B._bek = null;
  try {
    if (AN.mi()) window.DKAndroid.addEventListener('message', (ev) => {
      let o; try { o = JSON.parse(ev.data); } catch (x) { return; }
      if (o && o.tur === 'yedek-oku' && B._bek) { const f = B._bek; B._bek = null; f(o); }
    });
  } catch (x) {}
  B.oku = () => new Promise((ok) => {
    const z = setTimeout(() => { B._bek = null; ok(''); }, 6000);
    B._bek = (o) => { clearTimeout(z); ok(o && o.ok && typeof o.veri === 'string' ? o.veri : ''); };
    try { window.DKAndroid.postMessage(JSON.stringify({tur: 'yedek-oku'})); } catch (x) { clearTimeout(z); B._bek = null; ok(''); }
  });
  B.isaret = () => { try { const m = JSON.parse(localStorage.getItem(B.K) || 'null'); return m && m.v === 1 ? m : null; } catch (x) { return null; } };
  B.geriYukle = async function (j) {
    Object.entries(j.ls || {}).forEach(([k, v]) => { if (!B.haric(k) && typeof v === 'string') try { localStorage.setItem(k, v); } catch (x) {} });
    if (j.idb && V38.KEYS) {
      try { await V38.ready; } catch (x) {}
      for (const k of V38.KEYS) if (j.idb[k] != null) { V38.mem[k] = j.idb[k]; try { await V38.put(k); } catch (x) {} }
    }
    localStorage.setItem(B.K, JSON.stringify({v: 1, geri: new Date().toISOString()}));
    try { sessionStorage.setItem('dk-yedek522-geri', '1'); } catch (x) {}
  };
  B.basla = async function () {
    if (!AN.mi()) return;
    if (B.isaret()) { B.hazir = 1; B.planla(); return; }
    let j = null; try { const v = await B.oku(); j = v ? JSON.parse(v) : null; } catch (x) { j = null; }
    if (j && j.v === 1 && j.ls && Object.keys(j.ls).some((k) => !B.haric(k) && k !== B.K)) {
      await B.geriYukle(j);
      location.reload();
      return;
    }
    localStorage.setItem(B.K, JSON.stringify({v: 1, t: new Date().toISOString()}));
    B.hazir = 1; B.yaz();
  };
  try { if (sessionStorage.getItem('dk-yedek522-geri') === '1') { sessionStorage.removeItem('dk-yedek522-geri'); setTimeout(() => UI.toast('Verilerin Google yedeğinden geri yüklendi.'), 1500); } } catch (x) {}
  B.basla();
})();
