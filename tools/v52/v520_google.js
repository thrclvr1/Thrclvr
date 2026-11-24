
/* ===================== V52.0: Sunucusuz Google ile giriş (öğrenci + yönetici) =====================
   Sunucu (Render) kurulmadan, yalnız Google Cloud'daki ücretsiz OAuth “Web istemci kimliği” ile Google girişi:
   - Tarayıcıda Google penceresi (GIS), APK'da Android'in Google hesap seçicisi (V51.6 köprüsü) kimlik belgesini (ID token) verir.
   - Belge UYGULAMANIN İÇİNDE doğrulanır: Google'ın açık anahtarları (https://www.googleapis.com/oauth2/v3/certs) indirilir,
     RS256 imzası WebCrypto ile denetlenir; yayıncı (iss), hedef kitle (aud = istemci kimliği), süre (exp) ve e-posta doğrulaması kontrol edilir.
   - Giriş bu cihazda tutulur (dk-hesap46: mod 'google', yerel 1, oturum ''). İlerleme bu cihazda kalır; cihazlar arası taşıma sunucu ister.
   İstemci kimliği: G.ISTEMCI (derlemede) ya da uygulama içinden girilen dk-google52 = {v:1, istemci}. Gizli bilgi değildir.
   Yönetici: ilk Google girişinde “Bu hesabı bu cihazda yönetici yap” → mevcut editör PIN'i ile onay → hesabın Google kimliğinin
   SHA-256 özeti dk-yonetici52 = {v:1, hesaplar:[{o, ad, t}]} kaydına eklenir (e-posta saklanmaz). Sonraki girişlerde Google → PIN.
   Sunucu adresi girilmişse (V46/V51.9 sunuculu yol) bu modül devre dışıdır; sunucu kendi doğrulamasını yapar. */
(function () {
  if (typeof V46 === 'undefined' || !V46.Hesap || !window.V51 || !V51.Yonetici) return;
  const V52 = window.V52 = window.V52 || {};
  const H = V46.Hesap, Y = V51.Yonetici;
  const G = V52.Google = {
    ISTEMCI: '',                                           // ← Web istemci kimliği (…apps.googleusercontent.com); boşsa uygulama içinden girilir
    JWKS: 'https://www.googleapis.com/oauth2/v3/certs',
    K: {ayar: 'dk-google52', yonetici: 'dk-yonetici52', anahtar: 'dk-google52-jwks'},
    DESEN: /^[0-9]{6,}-[a-z0-9]+\.apps\.googleusercontent\.com$/
  };
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const ls = {al: (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } }, yaz: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }};
  const ss = {al: (k) => { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (x) { return null; } }, yaz: (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }};

  G.istemci = () => { if (G.DESEN.test(G.ISTEMCI)) return G.ISTEMCI; const a = ls.al(G.K.ayar); return a && a.v === 1 && G.DESEN.test(a.istemci || '') ? a.istemci : ''; };
  G.yerelMi = () => !!G.istemci() && !Y.adres();                 // sunucusuz yol etkin mi
  G.yerelGiris = () => { const o = H.oku(); return o.mod === 'google' && o.yerel === 1 && !!(o.kullanici && o.kullanici.o); };

  /* ---------- 1. kimlik belgesini uygulamada doğrulama ---------- */
  const b64 = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  const metin = (u) => new TextDecoder().decode(u);
  G.anahtarlar = async function (yenile) {
    const c = ls.al(G.K.anahtar);
    if (!yenile && c && c.keys && Date.now() - (c.t || 0) < 6 * 3600e3) return c.keys;
    const r = await fetch(G.JWKS, {cache: 'no-store'}); if (!r.ok) throw new Error('Google anahtarları alınamadı (' + r.status + ').');
    const j = await r.json(); ls.yaz(G.K.anahtar, {t: Date.now(), keys: j.keys || []}); return j.keys || [];
  };
  G.dogrula = async function (belge) {
    const p = String(belge || '').split('.'); if (p.length !== 3) throw new Error('Kimlik belgesi biçimi geçersiz.');
    let bas, yuk; try { bas = JSON.parse(metin(b64(p[0]))); yuk = JSON.parse(metin(b64(p[1]))); } catch (x) { throw new Error('Kimlik belgesi okunamadı.'); }
    if (bas.alg !== 'RS256' || !bas.kid) throw new Error('Kimlik belgesinin imza türü geçersiz.');
    let ks; try { ks = await G.anahtarlar(); } catch (x) { throw new Error('Google anahtarları alınamadı; internet bağlantısını kontrol et.'); }
    let k = ks.find((x) => x.kid === bas.kid); if (!k) { ks = await G.anahtarlar(true); k = ks.find((x) => x.kid === bas.kid); }
    if (!k) throw new Error('Kimlik belgesi tanınmayan bir anahtarla imzalanmış.');
    const ak = await crypto.subtle.importKey('jwk', {kty: 'RSA', n: k.n, e: k.e, alg: 'RS256', ext: true}, {name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256'}, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', ak, b64(p[2]), new TextEncoder().encode(p[0] + '.' + p[1]));
    if (!ok) throw new Error('Kimlik belgesinin imzası doğrulanamadı.');
    const simdi = Math.floor(Date.now() / 1000);
    if (!['accounts.google.com', 'https://accounts.google.com'].includes(yuk.iss)) throw new Error('Kimlik belgesi Google tarafından verilmemiş.');
    if (yuk.aud !== G.istemci()) throw new Error('Kimlik belgesi bu uygulama için verilmemiş.');
    if (!(yuk.exp > simdi - 30)) throw new Error('Kimlik belgesinin süresi dolmuş; yeniden giriş yap.');
    if (yuk.iat && yuk.iat > simdi + 300) throw new Error('Kimlik belgesinin zamanı geçersiz.');
    if (!yuk.sub) throw new Error('Kimlik belgesinde hesap kimliği yok.');
    if (yuk.email && yuk.email_verified === false) throw new Error('Google hesabının e-postası doğrulanmamış.');
    return yuk;
  };
  G.ozet = async (sub) => { const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('dkab52|' + G.istemci() + '|' + sub)); return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join(''); };

  /* ---------- 2. giriş: belge → cihazdaki hesap kaydı ---------- */
  const gb0 = H.girisBelgesi;
  H.girisBelgesi = async function (belge) {
    if (!G.yerelMi()) return gb0.apply(this, arguments);
    const y = await G.dogrula(belge);
    const o = H.oku(); o.mod = 'google'; o.yerel = 1; o.oturum = ''; o.hata = ''; o.misafir = 0;
    o.kullanici = {ad: y.name || '', eposta: y.email || '', roller: ['ogrenci'], o: await G.ozet(y.sub)}; o.son = new Date().toISOString(); H.yaz(o);
    try { Y.durum.asama = 'bekle'; Y.durum.mesaj = ''; } catch (x) {}
    return {ok: true, yerel: true};
  };
  const tamam = () => { UI.close(); UI.toast('Google ile giriş yapıldı.'); go('profil46'); };
  const durumYaz = (m) => { const d = document.getElementById('gis46d'); if (d) d.textContent = m; };
  G.androidGiris = async function () {
    const b = document.querySelector('.an516-g'); if (b) b.disabled = true;
    durumYaz('Google hesabı seçiliyor…');
    try { const belge = await V51.Android.googleBelge(G.istemci()); durumYaz('Doğrulanıyor…'); await H.girisBelgesi(belge); tamam(); }
    catch (er) { durumYaz(er.message); if (b) b.disabled = false; }
  };
  const gg0 = H.googleGiris;
  H.googleGiris = async function () {
    if (!G.yerelMi()) return gg0.apply(this, arguments);
    Y._bekliyor = 0;
    const metin1 = '<p class="small">Google hesabınla giriş yap. Bu cihazda giriş yapmış olursun; ilerlemen bu cihazda saklanır.</p>';
    if (V51.Android && V51.Android.mi()) {
      UI.sheet({title: 'Google ile giriş', body: () => `<div class="hs46">${metin1}<button type="button" class="p an516-g" onclick="V52.Google.androidGiris()">Google hesabını seç</button><p class="small mut" id="gis46d" aria-live="polite"></p></div>`});
      return;
    }
    if (location.protocol === 'file:') { UI.toast('Google girişi dosyadan (file://) açılan sayfada çalışmaz; uygulamayı web adresinden ya da APK ile aç.'); return; }
    UI.sheet({title: 'Google ile giriş', body: () => `<div class="hs46">${metin1}<div id="gis46" class="gis46"><p class="small mut">Google düğmesi yükleniyor…</p></div><p class="small mut" id="gis46d" aria-live="polite"></p></div>`});
    try {
      await H.gisYukle();
      google.accounts.id.initialize({client_id: G.istemci(), ux_mode: 'popup', callback: async (c) => { durumYaz('Doğrulanıyor…'); try { await H.girisBelgesi(c.credential); tamam(); } catch (er) { durumYaz(er.message); } }});
      const k = document.getElementById('gis46'); if (k) { k.innerHTML = ''; google.accounts.id.renderButton(k, {theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill', locale: 'tr'}); }
    } catch (er) { durumYaz('Google penceresi yüklenemedi: ' + er.message); }
  };

  /* ---------- 3. istemci kimliği ayarı (uygulama içinden; gizli değildir) ---------- */
  G.ayar = function () {
    try { UI.close(); } catch (x) {}
    setTimeout(() => UI.sheet({title: 'Google girişi kurulumu', body: () => `<div class="hs46 g52-ayar"><p class="small">Google Cloud'da oluşturduğun <b>Web uygulaması</b> türündeki OAuth istemci kimliğini yapıştır. Bu kimlik gizli bilgi değildir (şifre ya da “client secret” değildir). Rehber: docs/KURULUM_SUNUCU_VE_APK.md › Adım 1.</p>
<label class="hs46-l">Web istemci kimliği<input id="g52i" type="text" inputmode="url" autocomplete="off" spellcheck="false" placeholder="123456789012-abc….apps.googleusercontent.com" value="${e(G.istemci())}"></label><p class="small mut" id="g52d" aria-live="polite"></p>
<div class="p46-bb"><button type="button" class="p" onclick="V52.Google.ayarKaydet()">Kaydet</button>${ls.al(G.K.ayar) ? '<button type="button" onclick="V52.Google.ayarKaydet(true)">Kimliği kaldır</button>' : ''}</div></div>`}), 260);
  };
  G.ayarKaydet = function (sil) {
    const i = document.getElementById('g52i'), d = document.getElementById('g52d'), v = sil ? '' : String(i && i.value || '').trim();
    if (!sil && !G.DESEN.test(v)) { if (d) d.textContent = 'Kimlik “…apps.googleusercontent.com” ile biten bir Web istemci kimliği olmalı.'; return; }
    ls.yaz(G.K.ayar, sil ? null : {v: 1, istemci: v, t: new Date().toISOString()});
    try { Y.durum = {asama: 'bekle', mesaj: '', ad: ''}; } catch (x) {}
    UI.close(); UI.toast(sil ? 'Google istemci kimliği kaldırıldı.' : 'Google girişi etkinleştirildi.');
    setTimeout(() => { try { draw(); } catch (x) {} }, 300);
  };

  /* ---------- 4. yönetici: Google hesabı (özet) + editör PIN'i ---------- */
  G.yoneticiler = () => { const r = ls.al(G.K.yonetici); return r && r.v === 1 && Array.isArray(r.hesaplar) ? r.hesaplar : []; };
  G.yoneticiMi = () => { const u = H.oku().kullanici || {}; return !!u.o && G.yoneticiler().some((h) => h.o === u.o); };
  const go0 = Y.googleOturumu;
  Y.googleOturumu = function () { return G.yerelMi() ? G.yerelGiris() : go0.apply(this, arguments); };
  const gi0 = Y.gecisIzinli;
  Y.gecisIzinli = function () { return !G.istemci() && gi0.apply(this, arguments); };   // Google girişi kurulunca yalnız-PIN kapanır
  const ta0 = Y.tamam;
  Y.tamam = function () {
    if (!G.yerelMi()) return ta0.apply(this, arguments);
    const r = Y.kayit(), u = H.oku().kullanici || {}; if (!r || !G.yerelGiris()) return false;
    if (r.yol === 'google') return r.o === u.o && G.yoneticiMi();
    if (r.yol === 'kaydet') return r.o === u.o;                 // yalnız PIN ekranını açar; PIN doğruysa hesap yönetici listesine eklenir
    return false;
  };
  const de0 = Y.denetle;
  Y.denetle = async function () {
    if (!G.yerelMi()) return de0.apply(this, arguments);
    const D = Y.durum, u = H.oku().kullanici || {};
    if (!G.yerelGiris()) D.asama = 'giris';
    else if (G.yoneticiMi()) { ss.yaz(Y.K.oturum, {v: 1, yol: 'google', o: u.o, t: Date.now()}); ls.yaz(Y.K.kalici, {v: 1, google: 1, t: new Date().toISOString()}); D.asama = 'tamam'; D.ad = u.ad || ''; try { V51.EdPin.log('google-dogrulandi'); } catch (x) {} }
    else { D.asama = 'kaydet'; D.ad = u.ad || ''; }
    if (view === 'editor') V38.edPinView();
  };
  G.kaydetBasla = function () { const u = H.oku().kullanici || {}; if (!u.o) return; ss.yaz(Y.K.oturum, {v: 1, yol: 'kaydet', o: u.o, t: Date.now()}); V38.EP.pv.mode = 'login'; V38.edPinView(); };
  const dn0 = V38.edDone;
  V38.edDone = function () {
    const r = dn0.apply(this, arguments);
    try {
      const k = Y.kayit(), u = H.oku().kullanici || {};
      if (k && k.yol === 'kaydet' && V38.edOk() && u.o === k.o) {
        const L = G.yoneticiler().filter((h) => h.o !== u.o); L.push({o: u.o, ad: u.ad || '', t: new Date().toISOString()});
        ls.yaz(G.K.yonetici, {v: 1, hesaplar: L}); ss.yaz(Y.K.oturum, {v: 1, yol: 'google', o: u.o, t: Date.now()}); ls.yaz(Y.K.kalici, {v: 1, google: 1, t: new Date().toISOString()});
        try { V51.EdPin.log('yonetici-kaydedildi'); UI.toast('Bu Google hesabı bu cihazda yönetici olarak kaydedildi.'); } catch (x) {}
      }
    } catch (x) {}
    return r;
  };
  try { V51.EdPin.OLAY['yonetici-kaydedildi'] = 'Google hesabı yönetici olarak kaydedildi'; } catch (x) {}

  const KART = (ic) => `<section class="pin37 ed38-pin yn519" aria-labelledby="yn519-h"><div class="pin37-c"><span class="pin37-i" aria-hidden="true">${V38.svg('shield', 26)}</span>
<p class="pin37-st">Adım 1 / 2 · Google doğrulaması</p><h1 id="yn519-h">Yönetici girişi</h1>${ic}
<div class="pin37-ft"><button class="pin37-x" type="button" onclick="V51.EdPin.giriseDon(true);go('home')">Yönetici girişinden çık</button></div>
<p class="pin37-note">Yönetici girişi iki adımlıdır: önce Google hesabın, sonra editör PIN'i. Google girişi bu cihazda doğrulanır; yönetici hesabın bu cihazda yalnız geri çözülemeyen bir özetle tanınır, e-posta adresin saklanmaz. Bu ekran uygulama içi bir erişim ayrımıdır.</p></div></section>`;
  const ek0 = Y.ekran;
  Y.ekran = function () {
    const D = Y.durum, u = H.oku().kullanici || {};
    if (G.yerelMi() && D.asama === 'kaydet') {
      $.innerHTML = KART(`<p class="yn519-ok">✓ Google ile giriş yapıldı${u.ad ? ': ' + e(u.ad) : ''}</p>
<p class="pin37-p">Bu Google hesabı bu cihazda henüz yönetici olarak kayıtlı değil.</p>
<div class="yn519-k"><p>Bu hesap senin yönetici hesabınsa <b>editör PIN'inle onayla</b>. Onaydan sonra bu cihazda yönetici girişi her zaman <b>bu Google hesabı + PIN</b> ile yapılır.</p></div>
<div class="pin37-acts"><button class="pin37-b" type="button" onclick="V52.Google.kaydetBasla()">Bu hesabı yönetici yap (PIN ile)</button><button class="pin37-x" type="button" onclick="V51.Yonetici.baskaHesap()">Başka Google hesabıyla giriş</button></div>`);
      return;
    }
    if (!G.istemci() && !Y.adres() && (D.asama === 'kurulmadi' || D.asama === 'bekle' || D.asama === 'denetleniyor')) {
      if (D.asama !== 'kurulmadi') { D.asama = 'kurulmadi'; }
      $.innerHTML = KART(`<p class="pin37-p">Google girişi bu uygulamada henüz kurulmadı.</p>
<div class="yn519-k"><p>Google Cloud'dan aldığın <b>Web istemci kimliğini</b> girdiğinde yönetici girişi <b>Google hesabın + PIN</b> ile yapılır; öğrenciler de Google ile girebilir. Rehber: <b>docs/KURULUM_SUNUCU_VE_APK.md › Adım 1</b>.</p></div>
<div class="pin37-acts"><button class="pin37-b" type="button" onclick="V52.Google.ayar()">Google istemci kimliğini gir</button></div>
${Y.gecisIzinli() ? `<div class="yn519-gecis" role="note"><p><b>Geçiş dönemi.</b> Google girişi kurulana kadar bu cihazda yalnız PIN ile girebilirsin. Kimlik girildiğinde bu seçenek kapanır.</p></div><div class="pin37-acts"><button class="pin37-x" type="button" onclick="V51.Yonetici.gecisle()">Geçiş dönemi: PIN ile devam et</button></div>` : ''}`);
      return;
    }
    return ek0.apply(this, arguments);
  };
  // PIN ekranı: “kaydet” adımında başlık açıklaması
  const pv0 = V38.edPinView;
  V38.edPinView = function () {
    const r = pv0.apply(this, arguments);
    try {
      const k = Y.kayit(), u = H.oku().kullanici || {};
      if (G.yerelMi() && k && k.yol === 'kaydet') {
        const n = document.querySelector('#app .ed38-pin .yn519-gecis-u, #app .ed38-pin .yn519-ok');
        if (n) n.outerHTML = `<p class="yn519-ok">✓ Google: ${e(u.ad || 'hesap')} — bu hesabı yönetici yapmak için editör PIN'ini gir</p>`;
      }
    } catch (x) {}
    return r;
  };
  // geri sayım: Google oturumundan çıkınca yönetici kaydı (bu sekme) kapanır — V51.9 H.cikis sarmalayıcısı yapar

  /* ---------- 5. Profilim hesap kartı ve açılış ekranı (cihazdaki Google girişi) ---------- */
  const kart0 = H.kart;
  H.kart = function () {
    const o = H.oku();
    if (G.yerelGiris() && !Y.adres()) {
      const u = o.kullanici || {};
      return `<section class="card p46-s h46-hesap"><h2>Hesap</h2><p><b>${e(u.ad || 'Google hesabı')}</b><br><span class="small mut">${e(u.eposta || '')}</span></p>
<p class="small">Google ile giriş yapıldı (bu cihaz). İlerlemen bu cihazda saklanır; başka cihaza taşımak için hesap sunucusu gerekir.</p>
<div class="p46-bb"><button type="button" onclick="V46.Hesap.cikis(false)">Çıkış yap</button></div></section>`;
    }
    let h = kart0.apply(this, arguments);
    if (!Y.adres()) h = h.replace('</section>', `<details class="p46-d"><summary>Google girişi kurulumu</summary><p class="small">${G.istemci() ? 'Google girişi etkin (sunucusuz).' : 'Google girişi henüz kurulmadı.'}</p><div class="p46-bb"><button type="button" onclick="V52.Google.ayar()">${G.istemci() ? 'İstemci kimliğini değiştir' : 'İstemci kimliğini gir'}</button></div></details></section>`);
    return h;
  };
  const sb0 = H.secimBlok;
  if (sb0) H.secimBlok = function () {
    const u = document.getElementById('uye39');
    if (u && !u.querySelector('.hs46-sec') && G.yerelGiris() && !Y.adres()) {
      const yer = u.querySelector('.o42-bas') || u.firstElementChild; const k = H.oku().kullanici || {};
      if (yer) { yer.insertAdjacentHTML('afterend', `<section class="hs46-sec" aria-label="Giriş"><p><b>Giriş yapıldı:</b> ${e(k.ad || 'Google hesabı')}. İlerlemen bu cihazda saklanıyor.</p></section>`); return; }
    }
    return sb0.apply(this, arguments);
  };
})();
