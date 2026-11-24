/* ===================== V52.1: Telefondaki Google hesabıyla giriş (kurulum gerektirmez) =====================
   APK'da “Google ile giriş” Android'in kendi hesap seçicisini açar (AccountManager.newChooseAccountIntent, tür com.google):
   telefonda kayıtlı Google hesapları listelenir, biri seçilir, giriş tamamdır. Google Cloud ayarı, istemci kimliği, sunucu gerekmez.
   Köprü: sayfa → DKAndroid.postMessage({tur:'hesap-sec'}) ; uygulama → {tur:'hesap-sec', ok, eposta | hata('iptal')}.
   Seçilen hesap cihazda tutulur (dk-hesap46: mod 'google', yerel 1, cihaz 1, oturum ''); hesabın tanıtıcısı yalnız SHA-256 özeti
   (o = SHA-256('dkab521|' + e-posta küçük harf)). Yönetici kaydı (dk-yonetici52) ve “Bu hesabı yönetici yap (PIN ile)” V52.0 ile aynı.
   Bu yol yalnız APK'da ve sunucu adresi / istemci kimliği yokken etkindir; ikisinden biri varsa V51.9 / V52.0 yolu aynen çalışır.
   Tarayıcıda telefonun hesap listesine erişilemez: orada Google girişi yine istemci kimliği ister. */
(function () {
  if (!window.V52 || !V52.Google || !window.V51 || !V51.Yonetici || !V51.Android) return;
  const G = V52.Google, H = V46.Hesap, Y = V51.Yonetici, AN = V51.Android;
  const C = V52.Cihaz = {};
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);

  C.mi = () => AN.mi() && !Y.adres() && !G.istemci();          // telefondaki hesap seçicisi yolu etkin mi
  const ym0 = G.yerelMi;
  G.yerelMi = () => C.mi() || ym0();                             // V52.0'daki bütün “cihazda giriş” denetimleri bu yolu da kapsar
  const gi0 = Y.gecisIzinli;
  Y.gecisIzinli = function () { return !C.mi() && gi0.apply(this, arguments); };   // Google girişi kullanılabilirken yalnız-PIN kapalı

  C.ozet = async (eposta) => { const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('dkab521|' + String(eposta).trim().toLowerCase())); return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join(''); };

  /* ---------- köprü: hesap seçici ---------- */
  C._bek = null;
  try {
    window.DKAndroid.addEventListener('message', (ev) => {
      let o; try { o = JSON.parse(ev.data); } catch (x) { return; }
      if (o && o.tur === 'hesap-sec' && C._bek) { const b = C._bek; C._bek = null; b(o); }
    });
  } catch (x) {}
  C.sec = () => new Promise((ok, red) => {
    if (C._bek) return red(new Error('Hesap seçici zaten açık.'));
    C._bek = (o) => { if (o.ok && o.eposta) ok(String(o.eposta)); else red(Object.assign(new Error(o.hata === 'iptal' ? 'Giriş iptal edildi.' : (o.hata || 'Google hesabı seçilemedi.')), {iptal: o.hata === 'iptal'})); };
    try { window.DKAndroid.postMessage(JSON.stringify({tur: 'hesap-sec'})); } catch (x) { C._bek = null; red(new Error('Uygulama köprüsüne ulaşılamadı.')); }
  });

  C.giris = async function () {
    if (C._calisiyor) return; C._calisiyor = 1;
    try {
      const eposta = await C.sec();
      const o = H.oku(); o.mod = 'google'; o.yerel = 1; o.cihaz = 1; o.oturum = ''; o.hata = ''; o.misafir = 0;
      o.kullanici = {ad: eposta, eposta, roller: ['ogrenci'], o: await C.ozet(eposta)}; o.son = new Date().toISOString(); H.yaz(o);
      try { Y.durum.asama = 'bekle'; Y.durum.mesaj = ''; } catch (x) {}
      try { UI.close(); } catch (x) {}
      UI.toast('Google hesabıyla giriş yapıldı.');
      go('profil46');                                            // yönetici akışından gelindiyse V51.9 yönlendirmesi editöre döndürür
    } catch (er) {
      if (!er.iptal) UI.toast(er.message);
      Y._bekliyor = 0; Y._donus = 0;
    } finally { C._calisiyor = 0; }
  };

  const gg0 = H.googleGiris;
  H.googleGiris = function () {
    if (C.mi()) { Y._bekliyor = 0; return C.giris(); }          // ara pencere yok: doğrudan telefonun hesap listesi
    return gg0.apply(this, arguments);
  };

  /* ---------- yönetici kaydına e-posta yazılmaz (bu yolda hesap adı e-postadır; kayıtta yalnız özet kalır) ---------- */
  const dn0 = V38.edDone;
  V38.edDone = function () {
    const r = dn0.apply(this, arguments);
    try {
      const k = localStorage.getItem(G.K.yonetici);
      if (k && k.includes('@')) { const j = JSON.parse(k); j.hesaplar = (j.hesaplar || []).map((h) => (String(h.ad || '').includes('@') ? Object.assign({}, h, {ad: ''}) : h)); localStorage.setItem(G.K.yonetici, JSON.stringify(j)); }
    } catch (x) {}
    return r;
  };

  /* ---------- metinler: sunucu/istemci kimliği anlatımı bu yolda geçerli değil ---------- */
  const ek0 = Y.ekran;
  Y.ekran = function () {
    // V52.0'ın “henüz kurulmadı” ekranı bekleme durumlarını da yakalar; bu yolda Google hazır olduğundan durum hemen belirlenir
    // (Y.denetle eşzamanlı çalışır: giris / kaydet / tamam yazar ve V38.edPinView ile ekranı yeniden çizer)
    if (C.mi() && ['kurulmadi', 'bekle', 'denetleniyor', 'tamam'].includes(Y.durum.asama)) { Y.durum.asama = 'bekle'; Y.denetle(); return; }
    const r = ek0.apply(this, arguments);
    if (C.mi()) {
      try {
        const n = document.querySelector('#app .yn519 .pin37-note');
        if (n) n.textContent = 'Yönetici girişi iki adımlıdır: önce telefondaki Google hesabın, sonra editör PIN\'i. Yönetici hesabın bu cihazda yalnız geri çözülemeyen bir özetle tanınır, e-posta adresin kayda yazılmaz. Bu ekran uygulama içi bir erişim ayrımıdır.';
        const p = document.querySelector('#app .yn519 .pin37-p');
        if (p && /denetleniyor/.test(p.textContent)) p.textContent = 'Google hesabın denetleniyor…';
        if (p && /tanımlı Google hesabınla/.test(p.textContent)) p.textContent = 'Telefondaki Google hesabınla doğrula.';
      } catch (x) {}
    }
    return r;
  };
  const kart0 = H.kart;
  H.kart = function () {
    let h = kart0.apply(this, arguments);
    if (C.mi()) {
      h = h.replace(/<details class="p46-d"><summary>Google girişi kurulumu<\/summary>[\s\S]*?<\/details>/, '');
      h = h.replace('Google ile giriş yapıldı (bu cihaz).', 'Telefondaki Google hesabınla giriş yapıldı.');
      const u = H.oku().kullanici || {};
      if (u.eposta && u.ad === u.eposta) h = h.replace(`<br><span class="small mut">${e(u.eposta)}</span>`, '');
    }
    return h;
  };
})();
