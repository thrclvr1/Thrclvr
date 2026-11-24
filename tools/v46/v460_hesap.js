/* ===================== V46.0: hesap — Google ile giriş / misafir, bulut eşitleme istemcisi =====================
   Gerçek Google girişi = Google Identity Services (GIS) ile alınan kimlik belgesi (ID token) + DKAB sunucusunda doğrulama
   (sunucu/sunucu.js). HTML içinde hiçbir gizli bilgi yoktur: istemci kimliği (client ID) gizli değildir ve sunucudan alınır;
   uygulamaya yalnız sunucu adresi girilir (Profilim › Hesap). Sunucu adresi yoksa bulut kaydı YOKTUR ve öyle yazılır.
   Yerel anahtar: dk-hesap46 = {v:1, mod:'misafir'|'google', sunucu, oturum, kullanici:{ad,eposta,roller}, surum, son, hata}
   Eşitlenen kullanıcı verisi: dk2 (prog, cards, wrong, mt, tests, gscore, last), dk-ilerleme39, dk-oyun41, dk-calis45.
   Birleştirme kuralları “aynı veriyi iki kez ekleme”yi önler (toplama yok; en ileri kayıt ya da birleşim alınır). */
(function () {
  const V46 = window.V46 = window.V46 || {};
  const H = V46.Hesap = {};
  const KEY = 'dk-hesap46', DK2 = ['prog', 'cards', 'wrong', 'mt', 'tests', 'gscore', 'last'];
  const yerel = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  H.oku = () => { const o = yerel(KEY); return o && o.v === 1 ? o : {v: 1, mod: 'misafir', sunucu: '', oturum: '', kullanici: null, surum: 0, son: '', hata: ''}; };
  H.yaz = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
  const sun = (o) => String((o || H.oku()).sunucu || '').replace(/\/+$/, '');

  /* ---------- 1. birleştirme (saf fonksiyonlar; testte doğrudan denenir) ---------- */
  const ilerleme = (p) => (p ? (p.correct || 0) + (p.wrong || 0) : -1);
  const M = H.birlestir = {
    dk2(a, b) {
      a = a || {}; b = b || {}; const o = {};
      o.prog = {}; new Set([...Object.keys(a.prog || {}), ...Object.keys(b.prog || {})]).forEach((k) => { const x = (a.prog || {})[k], y = (b.prog || {})[k]; o.prog[k] = !x ? y : !y ? x : (ilerleme(y) > ilerleme(x) || (ilerleme(y) === ilerleme(x) && String(y.lastReviewed || '') > String(x.lastReviewed || ''))) ? y : x; });
      o.cards = {}; new Set([...Object.keys(a.cards || {}), ...Object.keys(b.cards || {})]).forEach((k) => { const x = (a.cards || {})[k], y = (b.cards || {})[k]; o.cards[k] = !x ? y : !y ? x : ((y.box || 0) > (x.box || 0) || ((y.box || 0) === (x.box || 0) && (y.due || 0) > (x.due || 0))) ? y : x; });
      o.wrong = Object.assign({}, b.wrong || {}, a.wrong || {});
      o.mt = {}; new Set([...Object.keys(a.mt || {}), ...Object.keys(b.mt || {})]).forEach((k) => { const x = (a.mt || {})[k], y = (b.mt || {})[k]; o.mt[k] = !x ? y : !y ? x : ((y.n || 0) > (x.n || 0) ? y : x); });
      const T = [...(a.tests || []), ...(b.tests || [])], g = new Set(); o.tests = T.filter((t) => { const k = JSON.stringify(t); if (g.has(k)) return false; g.add(k); return true; }).sort((x, y) => String(y.at || y.t || y.date || '').localeCompare(String(x.at || x.t || x.date || ''))).slice(0, 200);
      o.gscore = {}; new Set([...Object.keys(a.gscore || {}), ...Object.keys(b.gscore || {})]).forEach((k) => { const x = (a.gscore || {})[k] || {}, y = (b.gscore || {})[k] || {}; o.gscore[k] = Object.assign({}, y, x, {best: Math.max(x.best || 0, y.best || 0), plays: Math.max(x.plays || 0, y.plays || 0)}); });
      o.last = a.last || b.last || null;
      return o;
    },
    ilr(a, b) {
      a = a || {}; b = b || {}; const o = Object.assign({}, b, a);
      o.z = Object.assign({}, b.z || {}, a.z || {});
      o.t = {}; new Set([...Object.keys(a.t || {}), ...Object.keys(b.t || {})]).forEach((k) => { o.t[k] = Object.assign({}, (b.t || {})[k] || {}, (a.t || {})[k] || {}); });
      const fa = a.fav || {}, fb = b.fav || {}; if (a.fav || b.fav) o.fav = {s: [...new Set([...(fa.s || []), ...(fb.s || [])])], k: [...new Set([...(fa.k || []), ...(fb.k || [])])]};
      o.prog = Object.assign({}, b.prog || {}, a.prog || {});
      return o;
    },
    oyun(a, b) {
      a = a || {}; b = b || {}; const o = Object.assign({}, b, a, {oyunlar: {}});
      const puan = (k) => { if (!k) return -1; const y = k.yildiz && typeof k.yildiz === 'object' ? Object.values(k.yildiz).reduce((s, x) => s + (+x || 0), 0) : (+k.yildiz || 0); const sv = k.seviyeler ? Object.values(k.seviyeler).reduce((s, x) => s + (x.yildiz || 0), 0) : 0; const bl = k.bolge ? Object.values(k.bolge).reduce((s, x) => s + (x.bitti ? 10 : 0) + (x.kapi ? x.kapi.yildiz : 0) + Object.keys(x.n || {}).length, 0) : 0; return (k.bitti ? 1000 : 0) + 10 * (y + sv) + bl + (k.oda || 0); };
      const A = a.oyunlar || {}, B = b.oyunlar || {};
      new Set([...Object.keys(A), ...Object.keys(B)]).forEach((oy) => { const x = A[oy] || {}, y = B[oy] || {}; o.oyunlar[oy] = {}; new Set([...Object.keys(x), ...Object.keys(y)]).forEach((bl) => { const p = x[bl], q = y[bl]; o.oyunlar[oy][bl] = !p ? q : !q ? p : (puan(q) > puan(p) || (puan(q) === puan(p) && String(q.t || q.bitis || '') > String(p.t || p.bitis || ''))) ? q : p; }); });
      return o;
    },
    calis(a, b) {
      a = a || {}; b = b || {}; const o = Object.assign({v: 1, hedef: 20}, b, a, {gun: {}});
      new Set([...Object.keys(a.gun || {}), ...Object.keys(b.gun || {})]).forEach((d) => { o.gun[d] = Math.max((a.gun || {})[d] || 0, (b.gun || {})[d] || 0); });
      return o;
    },
    hepsi(a, b) { a = a || {}; b = b || {}; return {'dk2': M.dk2(a.dk2, b.dk2), 'dk-ilerleme39': M.ilr(a['dk-ilerleme39'], b['dk-ilerleme39']), 'dk-oyun41': M.oyun(a['dk-oyun41'], b['dk-oyun41']), 'dk-calis45': M.calis(a['dk-calis45'], b['dk-calis45'])}; }
  };

  /* ---------- 2. yerel veri paketi ---------- */
  H.paket = function () {
    try { Store.save(); } catch (e) {}
    const d = yerel('dk2') || {}, o = {}; DK2.forEach((k) => { if (d[k] !== undefined) o[k] = d[k]; });
    return {'dk2': o, 'dk-ilerleme39': yerel('dk-ilerleme39') || {}, 'dk-oyun41': yerel('dk-oyun41') || {v: 1, oyunlar: {}}, 'dk-calis45': yerel('dk-calis45') || {v: 1, hedef: 20, gun: {}}};
  };
  H.uygula = function (p) {
    const d = yerel('dk2') || {}; DK2.forEach((k) => { if (p.dk2 && p.dk2[k] !== undefined) d[k] = p.dk2[k]; });
    try { localStorage.setItem('dk2', JSON.stringify(d)); Object.assign(Store.ov, d); Store._v = (Store._v || 0) + 1; } catch (e) {}
    ['dk-ilerleme39', 'dk-oyun41', 'dk-calis45'].forEach((k) => { if (p[k]) try { localStorage.setItem(k, JSON.stringify(p[k])); } catch (e) {} });
    try { V39._ilr = null; } catch (e) {}
  };

  /* ---------- 3. sunucu ile konuşma ---------- */
  H.istek = async function (yol, yontem, govde) {
    const o = H.oku(), u = sun(o); if (!u) throw new Error('Sunucu adresi girilmedi.');
    const r = await fetch(u + yol, {method: yontem || 'GET', headers: Object.assign({'Content-Type': 'application/json'}, o.oturum ? {Authorization: 'Bearer ' + o.oturum} : {}), body: govde ? JSON.stringify(govde) : undefined});
    let j = {}; try { j = await r.json(); } catch (e) {}
    if (r.status === 401 && o.oturum && yol !== '/api/giris') { const x = H.oku(); x.oturum = ''; x.mod = 'misafir'; x.hata = 'Oturumun süresi doldu; yeniden giriş yap.'; H.yaz(x); }
    return {durum: r.status, j};
  };
  // eşitle: sunucudaki veriyi al, yerelle birleştir, yerele yaz, sunucuya gönder (çakışmada yeniden dene)
  H.esitle = async function () {
    const o = H.oku(); if (o.mod !== 'google' || !o.oturum) return {ok: false, neden: 'giriş yok'};
    if (H._esit) return H._esit;
    H._esit = (async () => {
      try {
        let g = await H.istek('/api/veri'); if (g.durum !== 200) throw new Error(g.j.hata || 'veri alınamadı (' + g.durum + ')');
        for (let i = 0; i < 3; i++) {
          const birlesik = M.hepsi(H.paket(), g.j.veri || {}); H.uygula(birlesik);
          const p = await H.istek('/api/veri', 'PUT', {temelSurum: g.j.surum || 0, veri: birlesik});
          if (p.durum === 200) { const x = H.oku(); x.surum = p.j.surum; x.son = new Date().toISOString(); x.hata = ''; H.yaz(x); try { draw(); } catch (e) {} return {ok: true, surum: p.j.surum}; }
          if (p.durum !== 409) throw new Error(p.j.hata || 'kaydedilemedi (' + p.durum + ')');
          g = {durum: 200, j: {surum: p.j.surum, veri: p.j.veri}};
        }
        throw new Error('sürüm çakışması çözülemedi');
      } catch (e) { const x = H.oku(); x.hata = e.message; H.yaz(x); return {ok: false, neden: e.message}; } finally { H._esit = null; }
    })();
    return H._esit;
  };
  H.planla = function () { const o = H.oku(); if (o.mod !== 'google' || !o.oturum) return; clearTimeout(H._t); H._t = setTimeout(() => H.esitle(), 20000); };
  try { const s0 = Store.save; Store.save = function () { const r = s0.apply(this, arguments); H.planla(); return r; }; } catch (e) {}
  document.addEventListener('visibilitychange', () => { if (document.hidden && H._t) { clearTimeout(H._t); H._t = null; H.esitle(); } });

  /* ---------- 4. Google ile giriş (GIS) ---------- */
  H.gisYukle = () => new Promise((ok, red) => { if (window.google && google.accounts && google.accounts.id) return ok(); const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = () => ok(); s.onerror = () => red(new Error('Google giriş betiği yüklenemedi (internet bağlantısı gerekir).')); document.head.appendChild(s); });
  H.girisBelgesi = async function (credential) { // GIS'in verdiği kimlik belgesi sunucuya gider; sunucu Google anahtarlarıyla doğrular
    const r = await H.istek('/api/giris', 'POST', {credential});
    if (r.durum !== 200) throw new Error(r.j.hata || 'Giriş başarısız (' + r.durum + ')');
    const o = H.oku(); o.mod = 'google'; o.oturum = r.j.oturum; o.kullanici = r.j.kullanici; o.hata = ''; H.yaz(o);
    const e = await H.esitle(); return e;
  };
  H.googleGiris = async function () {
    const o = H.oku();
    if (!sun(o)) { H.ayarlar('Google ile giriş için önce sunucu adresini gir. Sunucu kurulumu: sunucu/README.md'); return; }
    if (location.protocol === 'file:') { UI.toast('Google girişi dosyadan (file://) açılan sayfada çalışmaz; uygulamayı web adresinden aç.'); return; }
    UI.sheet({title: 'Google ile giriş', body: () => `<div class="hs46"><p class="small">Google hesabınla giriş yaptığında ilerlemen sunucuda saklanır ve başka cihazda kaldığın yerden devam edebilirsin.</p><div id="gis46" class="gis46"><p class="small mut">Google düğmesi yükleniyor…</p></div><p class="small mut" id="gis46d" aria-live="polite"></p></div>`});
    const yaz = (m) => { const d = document.getElementById('gis46d'); if (d) d.textContent = m; };
    try {
      const y = await H.istek('/api/yapilandirma'); if (y.durum !== 200 || !y.j.googleClientId) throw new Error('Sunucu yapılandırması alınamadı.');
      await H.gisYukle();
      google.accounts.id.initialize({client_id: y.j.googleClientId, ux_mode: 'popup', callback: async (c) => { yaz('Doğrulanıyor…'); try { const e = await H.girisBelgesi(c.credential); UI.close(); UI.toast(e.ok ? 'Giriş yapıldı; ilerlemen eşitlendi.' : 'Giriş yapıldı; eşitleme yapılamadı: ' + e.neden); go('profil46'); } catch (er) { yaz(er.message); } }});
      const k = document.getElementById('gis46'); if (k) { k.innerHTML = ''; google.accounts.id.renderButton(k, {theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill', locale: 'tr'}); }
    } catch (e) { yaz(e.message); }
  };
  H.cikis = async function (temizle) {
    try { await H.istek('/api/cikis', 'POST'); } catch (e) {}
    const o = H.oku(); o.mod = 'misafir'; o.oturum = ''; o.kullanici = null; o.surum = 0; H.yaz(o);
    try { if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (e) {}
    if (temizle) { ['dk-ilerleme39', 'dk-oyun41', 'dk-calis45'].forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} }); const d = yerel('dk2') || {}; DK2.forEach((k) => delete d[k]); try { localStorage.setItem('dk2', JSON.stringify(d)); } catch (e) {} location.reload(); return; }
    go('profil46');
  };
  H.ayarlar = function (not) {
    const o = H.oku();
    UI.sheet({title: 'Hesap sunucusu', body: () => `<div class="hs46">${not ? `<p class="small">${esc(not)}</p>` : ''}<label class="hs46-l">Sunucu adresi<input id="hs46u" type="url" inputmode="url" placeholder="https://…" value="${esc(o.sunucu || '')}" autocomplete="off"></label>
<p class="small mut">Bu adres gizli bilgi değildir. Google istemci kimliği sunucudan alınır; hiçbir şifre ya da anahtar uygulamaya girilmez.</p><div class="p46-bb"><button type="button" class="p" onclick="V46.Hesap.adresKaydet()">Kaydet</button><button type="button" onclick="UI.close()">Vazgeç</button></div><p class="small mut" id="hs46d" aria-live="polite"></p></div>`});
  };
  H.adresKaydet = async function () {
    const i = document.getElementById('hs46u'), d = document.getElementById('hs46d'), v = (i && i.value || '').trim().replace(/\/+$/, '');
    if (v && !/^https:\/\//.test(v) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(v)) { if (d) d.textContent = 'Adres https:// ile başlamalı (yerel deneme için http://localhost).'; return; }
    const o = H.oku(); o.sunucu = v; H.yaz(o);
    if (!v) { UI.close(); go('profil46'); return; }
    if (d) d.textContent = 'Sunucu deneniyor…';
    try { const r = await fetch(v + '/api/saglik'); if (!r.ok) throw new Error(r.status); UI.close(); UI.toast('Sunucu adresi kaydedildi.'); go('profil46'); } catch (e) { if (d) d.textContent = 'Sunucuya ulaşılamadı (' + e.message + '). Adres kaydedildi; bağlantı olunca yeniden dene.'; }
  };

  /* ---------- 5. Profilim › Hesap kartı ve açılış seçimi ---------- */
  H.kart = function () {
    const o = H.oku(), g = o.mod === 'google' && o.oturum;
    return `<section class="card p46-s h46-hesap"><h2>Hesap</h2>${g ? `<p><b>${esc((o.kullanici && o.kullanici.ad) || 'Google hesabı')}</b><br><span class="small mut">${esc((o.kullanici && o.kullanici.eposta) || '')}</span></p>
<p class="small">${o.son ? 'Son eşitleme: ' + new Date(o.son).toLocaleString('tr-TR') : 'Henüz eşitlenmedi.'}${o.hata ? ` <span class="h46-uy">Sorun: ${esc(o.hata)}</span>` : ''}</p>
<div class="p46-bb"><button type="button" onclick="V46.Hesap.esitle().then(r=>{UI.toast(r.ok?'Eşitlendi.':'Eşitlenemedi: '+r.neden);go('profil46')})">Şimdi eşitle</button><button type="button" onclick="V46.Hesap.cikis(false)">Çıkış yap</button><button type="button" onclick="if(confirm('Çıkış yapılsın ve bu cihazdaki ilerleme silinsin mi? (Sunucudaki kayıt kalır.)'))V46.Hesap.cikis(true)">Çıkış yap ve cihazı temizle</button></div>`
      : `<p>Misafir olarak kullanıyorsun. İlerlemen yalnız bu cihazda saklanır.</p><div class="p46-bb"><button type="button" class="p" onclick="V46.Hesap.googleGiris()">Google ile giriş</button></div>
<p class="small mut">Giriş yaptığında bu cihazdaki ilerlemen hesabına aktarılır; aynı kayıt iki kez eklenmez.</p>${o.hata ? `<p class="small h46-uy">${esc(o.hata)}</p>` : ''}`}
<details class="p46-d"><summary>Sunucu ayarı</summary><p class="small">${sun(o) ? 'Sunucu: ' + esc(sun(o)) : 'Sunucu adresi girilmedi: bulut kaydı kapalı.'}</p><div class="p46-bb"><button type="button" onclick="V46.Hesap.ayarlar()">Sunucu adresini ${sun(o) ? 'değiştir' : 'gir'}</button></div></details></section>`;
  };
  // açılış ekranında iki seçenek: Google ile giriş / Misafir olarak devam et (deneyim seçimi aşağıda aynen durur)
  H.secimBlok = function () {
    const u = document.getElementById('uye39'); if (!u || u.querySelector('.hs46-sec')) return;
    const yer = u.querySelector('.o42-bas') || u.firstElementChild; if (!yer) return;
    const o = H.oku(), g = o.mod === 'google' && o.oturum;
    yer.insertAdjacentHTML('afterend', `<section class="hs46-sec" aria-label="Giriş">${g ? `<p><b>Giriş yapıldı:</b> ${esc((o.kullanici && (o.kullanici.ad || o.kullanici.eposta)) || 'Google hesabı')}. İlerlemen hesabında saklanıyor.</p>`
      : `<p class="hs46-b">Nasıl devam etmek istersin?</p><div class="hs46-bb"><button type="button" class="hs46-g" onclick="V46.Hesap.googleGiris()"><b>Google ile giriş</b><small>İlerlemen hesabında saklanır; başka cihazda devam edersin</small></button><button type="button" class="hs46-m ${o.misafir ? 'on' : ''}" aria-pressed="${!!o.misafir}" onclick="V46.Hesap.misafir(this)"><b>Misafir olarak devam et</b><small>Hesap gerekmez; ilerleme bu cihazda kalır</small></button></div>`}</section>`);
  };
  H.misafir = function (b) { const o = H.oku(); o.misafir = 1; H.yaz(o); if (b) { b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); } const k = document.querySelector('#uye39 .o42-kartlar'); if (k) try { k.scrollIntoView({behavior: 'smooth', block: 'start'}); } catch (e) {} };
  if (typeof V39 !== 'undefined' && V39.secim) { const s0 = V39.secim; V39.secim = function () { const r = s0.apply(this, arguments); try { H.secimBlok(); } catch (e) {} return r; }; }
  setTimeout(() => { try { H.secimBlok(); } catch (e) {} }, 0);
  // açılışta: giriş yapılmışsa sessizce eşitle
  setTimeout(() => { const o = H.oku(); if (o.mod === 'google' && o.oturum && sun(o)) H.esitle(); }, 2500);
})();
