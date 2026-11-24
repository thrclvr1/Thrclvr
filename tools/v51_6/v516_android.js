/* ===================== V51.6: Android uygulamasında (APK) Google ile giriş =====================
   Google, WebView içinde Google hesabıyla OAuth girişine izin vermez (disallowed_useragent). APK'da giriş bu yüzden
   Android'in kendi “Google ile oturum aç” penceresiyle (Credential Manager) yapılır:
     sayfa → DKAndroid.postMessage({tur:'google', istemci: <sunucunun Google Web istemci kimliği>})
     uygulama → {tur:'google', ok:true, idToken} | {tur:'google', ok:false, hata}
   Kimlik belgesi (ID token) tarayıcıdaki akıştaki gibi sunucuya (/api/giris) gider; sunucu Google anahtarlarıyla
   doğrular (aud = Web istemci kimliği). Uygulamada ve HTML'de gizli anahtar yoktur.
   Tarayıcıda (GitHub Pages) eski akış (Google Identity Services düğmesi) aynen kalır.
   Sunucu yoksa ya da yapılandırılmamışsa giriş yapıldı denmez; hata olduğu gibi gösterilir. */
(function () {
  'use strict';
  if (typeof V46 === 'undefined' || !V46.Hesap) return;
  const V51 = window.V51 || (window.V51 = {});
  const AN = V51.Android = {}, H = V46.Hesap;
  AN.mi = () => { try { return !!window.DKAndroid && location.host === 'appassets.androidplatform.net'; } catch (e) { return false; } };
  AN._bek = null;
  try {
    if (window.DKAndroid && window.DKAndroid.addEventListener) window.DKAndroid.addEventListener('message', (ev) => {
      let o; try { o = JSON.parse(ev.data); } catch (e) { return; }
      if (o && o.tur === 'google' && AN._bek) { const b = AN._bek; AN._bek = null; b(o); }
    });
  } catch (e) {}
  AN.googleBelge = (istemci) => new Promise((ok, red) => {
    if (AN._bek) return red(new Error('Google giriş penceresi zaten açık.'));
    const z = setTimeout(() => { AN._bek = null; red(new Error('Google girişi yanıt vermedi.')); }, 180000);
    AN._bek = (o) => { clearTimeout(z); if (o.ok && o.idToken) ok(o.idToken); else red(Object.assign(new Error(o.hata === 'iptal' ? 'Giriş iptal edildi.' : (o.hata || 'Google girişi başarısız.')), {iptal: o.hata === 'iptal'})); };
    try { window.DKAndroid.postMessage(JSON.stringify({tur: 'google', istemci})); } catch (e) { clearTimeout(z); AN._bek = null; red(new Error('Uygulama köprüsüne ulaşılamadı.')); }
  });
  const yaz = (m) => { const d = document.getElementById('gis46d'); if (d) d.textContent = m; };
  AN.girisBaslat = async function () {
    const b = document.querySelector('.an516-g'); if (b) b.disabled = true;
    yaz('Google hesabı seçiliyor…');
    try {
      let y; try { y = await H.istek('/api/yapilandirma'); } catch (e) { throw new Error('Sunucuya ulaşılamadı. İnternet bağlantısını ve sunucu adresini kontrol et.'); }
      if (y.durum !== 200 || !y.j.googleClientId) throw new Error('Sunucu yapılandırması alınamadı (' + y.durum + ').');
      const belge = await AN.googleBelge(y.j.googleClientId);
      yaz('Doğrulanıyor…');
      let e; try { e = await H.girisBelgesi(belge); } catch (er) { if (er instanceof TypeError) throw new Error('Sunucuya ulaşılamadı; giriş yapılmadı.'); throw er; }
      UI.close(); UI.toast(e.ok ? 'Giriş yapıldı; ilerlemen eşitlendi.' : 'Giriş yapıldı; eşitleme yapılamadı: ' + e.neden); go('profil46');
    } catch (er) { yaz(er.message); if (b) b.disabled = false; }
  };
  const g0 = H.googleGiris;
  H.googleGiris = async function () {
    if (!AN.mi()) return g0.apply(this, arguments);
    const o = H.oku();
    if (!String(o.sunucu || '').trim()) { H.ayarlar('Google ile giriş için önce sunucu adresini gir. Sunucu kurulumu: sunucu/README.md'); return; }
    UI.sheet({title: 'Google ile giriş', body: () => `<div class="hs46"><p class="small">Google hesabınla giriş yaptığında ilerlemen sunucuda saklanır ve başka cihazda kaldığın yerden devam edebilirsin.</p><button type="button" class="p an516-g" onclick="V51.Android.girisBaslat()">Google hesabını seç</button><p class="small mut" id="gis46d" aria-live="polite"></p></div>`});
  };
  const c0 = H.cikis;
  H.cikis = function () { if (AN.mi()) { try { window.DKAndroid.postMessage(JSON.stringify({tur: 'google-cikis'})); } catch (e) {} } return c0.apply(this, arguments); };
})();
