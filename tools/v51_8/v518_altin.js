
/* ===================== V51.8: Altın Mod geçici olarak kapalı — tek merkezi kapı ve “Çok yakında” ekranı =====================
   TEK AYAR: V51.Altin.ACIK  (false = Altın Mod kapalı, true = V51.7'deki gibi açık). Altın'ın kodu, ekranları ve içerikleri
   silinmedi; yalnız erişim bu kapıdan geçer. Açmak için derlemede ACIK:true yazmak (ya da çalışırken V51.Altin.ac()) yeterli.

   Altın'a giden bütün yollar birkaç ortak noktada birleşiyor; kapı bu noktalara takılır:
     1. V39.on (Altın açık mı?) — erişimci (getter/setter). Kapalıyken her zaman false okunur; true yazma denemeleri
        (V39.init hatırlanan tercih / oturum bayrağı, V42.gec, V39.toPremium, Altın rota işlevleri, geri tuşu kaydı m42)
        etkisiz kalır. Böylece Altın üst çubuğu, alt menüsü, yönlendirmeleri ve 3B koridor hiç devreye girmez.
     2. Mod geçiş işlevleri: V42.gec('premium'), V39.toPremium, V50.Mod.gec('altin'), V47.Ayar.alanSec('premium')
        → “Çok yakında” ekranı (seçim ekranı, Mod paneli, Profilim kartları, Ayarlar › Alan, Elmas oyun onay ekranı).
     3. Rotalar (doğrudan erişim, geri tuşu, eski oturum): pdunya, psinif, punite, pders, pozet, poyun, poyna.
        draw() en dışta sarılır: bu rotalardan biri çizilmek istenirse ekran Elmas karşılığına çevrilir
        (koridor → ana sayfa, sınıf merkezi/ünite/özet → sınıf sayfası, ders → konu, Oyun Dünyası → Oyunlar)
        ve “Çok yakında” ekranı açılır (geri tuşuyla geçmişten dönülürken yalnız çevrilir, ekran açılmaz).
        pilerleme ve pfav Elmas'ta V51.Rota ile Elmas bileşenleriyle çizilir; dokunulmadı.
     4. Kullanım Rehberi: “Altın Sınıfı rehberi” → “Çok yakında”; tanıtım metinleri Altın'ı “çok yakında” diye anar.
   Kullanıcı kaydı silinmez: dk-deneyim39'daki son tercih yalnız kullanıcı “Elmas Mod ile öğrenmeye devam et”e basınca
   'normal' yapılır (Elmas'a geçişin kendi davranışı). Oturum bayrağı dk-deneyim39-aktif (sessionStorage) kapalıyken silinir.
   İlerleme, puan, oyun ve editör kayıtlarına dokunulmaz. */
(function () {
  if (typeof V39 === 'undefined' || typeof V30 === 'undefined') return;
  const V51 = window.V51 = window.V51 || {};
  const A = V51.Altin = {
    ACIK: false,                                   // ← TEK MERKEZİ AYAR
    ROTALAR: ['pdunya', 'psinif', 'punite', 'pders', 'pozet', 'poyun', 'poyna'],
    sayac: {gecis: 0, rota: 0, on: 0, ekran: 0},
    son: null                                      // son engellenen deneme (tanılama)
  };
  A.acikMi = () => A.ACIK === true;

  /* ---------- 1. V39.on erişimcisi ---------- */
  let ic = !!V39.on;
  const acilistaAltin = (() => { let s = null; try { s = sessionStorage.getItem(V39.SK); } catch (e) {} return ic || s === '1'; })();
  Object.defineProperty(V39, 'on', {
    configurable: true, enumerable: true,
    get() { return A.acikMi() ? ic : false; },
    set(v) { if (A.acikMi()) { ic = !!v; return; } if (v) A.sayac.on++; ic = false; }
  });
  const oturumTemizle = () => { if (!A.acikMi()) { try { sessionStorage.removeItem(V39.SK); } catch (e) {} } };
  oturumTemizle();

  /* ---------- 2. “Çok yakında” ekranı ---------- */
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const KAPI = `<svg class="yk518-svg" viewBox="0 0 160 170" width="150" height="160" aria-hidden="true" focusable="false">
<defs><linearGradient id="yk518a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e3ad"/><stop offset=".45" stop-color="#d4a548"/><stop offset="1" stop-color="#8a6420"/></linearGradient>
<radialGradient id="yk518b" cx=".5" cy=".62" r=".6"><stop offset="0" stop-color="#fff3cf" stop-opacity=".95"/><stop offset=".45" stop-color="#f1c66a" stop-opacity=".55"/><stop offset="1" stop-color="#f1c66a" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="80" cy="104" rx="70" ry="62" fill="url(#yk518b)"/>
<path d="M36 160V74a44 44 0 0 1 88 0v86" fill="#140f08" stroke="url(#yk518a)" stroke-width="5"/>
<path d="M50 160V78a30 30 0 0 1 60 0v82" fill="none" stroke="url(#yk518a)" stroke-width="2" opacity=".75"/>
<path d="M80 52v108" stroke="url(#yk518a)" stroke-width="2" opacity=".7"/>
<path d="M58 160V96M102 160V96" stroke="#f1c66a" stroke-width="1.2" opacity=".35"/>
<rect x="76" y="104" width="8" height="34" rx="4" fill="#fff1c9" opacity=".9"/>
<path d="M26 160h108" stroke="url(#yk518a)" stroke-width="5" stroke-linecap="round"/>
<g fill="#f7e3ad"><circle cx="80" cy="36" r="3"/><path d="M80 18l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" opacity=".9"/></g></svg>`;
  const kivilcim = () => Array.from({length: 14}, (_, i) => `<i style="--x:${(i * 37) % 100}%;--y:${(i * 53 + 11) % 100}%;--g:${(i % 5) * 0.7}s;--b:${3 + (i % 3)}px"></i>`).join('');
  A.ekranAcik = () => !!document.getElementById('yk518');
  let oncekiOdak = null;
  const ac = (kaynak) => {
    if (A.ekranAcik()) return;
    A.sayac.ekran++; A.son = {kaynak, t: Date.now()};
    oncekiOdak = document.activeElement;
    const o = document.createElement('div'); o.id = 'yk518'; o.className = 'yk518';
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'yk518-h'); o.setAttribute('aria-describedby', 'yk518-m');
    o.dataset.kaynak = kaynak || '';
    o.innerHTML = `<div class="yk518-kv" aria-hidden="true">${kivilcim()}</div>
<div class="yk518-k">
 <button type="button" class="yk518-x" aria-label="Kapat">×</button>
 <div class="yk518-g">${KAPI}</div>
 <p class="yk518-e">ALTIN MOD</p>
 <h2 id="yk518-h" class="yk518-h">ÇOK YAKINDA...</h2>
 <p id="yk518-m" class="yk518-m">Yeni bir öğrenme deneyimi için hazırlıklarımız devam ediyor. Altın Mod çok yakında seninle!</p>
 <button type="button" class="yk518-p">Elmas Mod ile öğrenmeye devam et</button>
</div>`;
    document.body.appendChild(o);
    document.documentElement.classList.add('yk518-kilit');
    o.querySelector('.yk518-x').onclick = () => A.kapat(false);
    o.querySelector('.yk518-p').onclick = () => A.kapat(true);
    o.addEventListener('keydown', (ev) => {
      if (ev.key === 'Tab') { // odak pencerede kalır
        const f = [...o.querySelectorAll('button')]; const i = f.indexOf(document.activeElement);
        if (ev.shiftKey && i <= 0) { ev.preventDefault(); f[f.length - 1].focus(); } else if (!ev.shiftKey && i === f.length - 1) { ev.preventDefault(); f[0].focus(); }
      }
    });
    try { history.pushState({yk518: 1}, ''); } catch (x) {}
    const odak = () => { try { if (!o.contains(document.activeElement)) o.querySelector('.yk518-p').focus({preventScroll: true}); } catch (x) {} };
    odak(); setTimeout(odak, 120); setTimeout(odak, 400);   // kapanan alt pencere odağı geri verirse yeniden pencereye alınır
  };
  // ekran açıkken odak ve Escape pencereye bağlı kalır
  document.addEventListener('focusin', (ev) => { const o = document.getElementById('yk518'); if (o && !o.contains(ev.target)) { try { o.querySelector('.yk518-p').focus({preventScroll: true}); } catch (x) {} } }, true);
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && A.ekranAcik()) { ev.stopPropagation(); ev.preventDefault(); A.kapat(false); } }, true);
  // açık bir alt pencere (Mod paneli vb.) varsa önce kapanır; UI.close geçmişe gecikmeli geri adım bıraktığı için o bitince açılır
  A.yakinda = function (kaynak) {
    if (A.ekranAcik()) return;
    let n = 0;
    const dene = () => {
      const skip = typeof V29 !== 'undefined' && V29._skip;
      if ((skip || (UI._stack && UI._stack.length)) && n++ < 20) { if (!skip && UI._stack.length) { try { UI.close(); } catch (x) {} } setTimeout(dene, 80); return; }
      ac(kaynak);
    };
    setTimeout(dene, 0);
  };
  const kaldir = () => {
    const o = document.getElementById('yk518'); if (o) o.remove();
    document.documentElement.classList.remove('yk518-kilit');
    try { if (oncekiOdak && oncekiOdak.isConnected) oncekiOdak.focus({preventScroll: true}); } catch (x) {}
  };
  const elmasaDevam = () => {
    try { V39.setPref({son: 'normal'}); } catch (x) {}
    try { const m = JSON.parse(localStorage.getItem('dk-mod50') || 'null'); if (m && m.v === 1 && m.son === 'altin') localStorage.setItem('dk-mod50', JSON.stringify(Object.assign({}, m, {son: 'elmas'}))); } catch (x) {}
    const uye = document.getElementById('uye39');
    if (uye) { V39.sec('normal'); return; }                                   // açılış/seçim ekranı: Elmas ile girer
    let aktif = 'elmas'; try { aktif = V50.Mod.aktif(); } catch (x) {}
    if (aktif === 'ogretmen') { V50.Mod.gec('elmas'); return; }               // öğretmen modundan Elmas'a
    if (A.ROTALAR.includes(view)) go('home');                                 // (güvenlik ağı; normalde çevrilmiş olur)
    else draw();                                                              // zaten Elmas'ta: bulunduğu ekran kalır
  };
  A.kapat = function (devam) {
    if (!A.ekranAcik()) return;
    const sonra = () => { kaldir(); if (devam) elmasaDevam(); };
    if (history.state && history.state.yk518) { A._sonra = sonra; history.back(); A._sonraT = setTimeout(() => { if (A._sonra) { const f = A._sonra; A._sonra = null; f(); } }, 500); }
    else sonra();
  };
  addEventListener('popstate', () => {
    if (A._sonra) { clearTimeout(A._sonraT); const f = A._sonra; A._sonra = null; f(); return; }
    if (A.ekranAcik()) kaldir();                                              // geri tuşu ekranı kapatır, uygulamada kalınır
  });

  /* ---------- 3. Mod geçiş işlevleri ---------- */
  const engelle = (kaynak) => { A.sayac.gecis++; oturumTemizle(); A.yakinda(kaynak); };
  const g42 = V42.gec;
  V42.gec = function (mod) { if (mod === 'premium' && !A.acikMi()) { engelle('V42.gec'); return; } return g42.apply(this, arguments); };
  const tp = V39.toPremium;
  V39.toPremium = function () { if (!A.acikMi()) { engelle('V39.toPremium'); return; } return tp.apply(this, arguments); };
  if (typeof V50 !== 'undefined' && V50.Mod) {
    const mg = V50.Mod.gec;
    V50.Mod.gec = function (k) { if (k === 'altin' && !A.acikMi()) { engelle('V50.Mod.gec'); return; } return mg.apply(this, arguments); };
    const mk = V50.Mod.kartlar;  // Altın kartında “geç” yerine “Çok yakında” rozeti (kart ve tıklama aynı: kapıya gider)
    V50.Mod.kartlar = function () {
      const h = mk.apply(this, arguments); if (A.acikMi()) return h;
      return h.replace(/(<button[^>]*class="mk50-k altin[^"]*"[\s\S]*?)<em class="mk50-gec">[\s\S]*?<\/em>/, '$1<em class="mk50-gec yk518-rz">Çok yakında</em>');
    };
  }
  if (typeof V47 !== 'undefined' && V47.Ayar && V47.Ayar.alanSec) {
    const as = V47.Ayar.alanSec;
    V47.Ayar.alanSec = function (k) { if (k === 'premium' && !A.acikMi()) { engelle('V47.alanSec'); return; } return as.apply(this, arguments); };
  }

  /* ---------- 4. Rotalar: draw() en dışta ---------- */
  const karsilik = () => {
    const v = view, g = +(G.pg || G.g || 0);
    if (v === 'pdunya') return ['home', null];
    if (v === 'psinif' || v === 'punite' || v === 'pozet') return g ? ['grade', {g}] : ['home', null];
    if (v === 'pders') { const t = G.pt && Store.get('topics', G.pt); return t ? ['topic', {t: t.id, tab: G.ptab || 'anlat'}] : ['home', null]; }
    if (v === 'poyun' || v === 'poyna') return ['games', null];
    return ['home', null];
  };
  const d0 = draw;
  draw = function () {
    if (!A.acikMi() && A.ROTALAR.includes(view)) {
      const eski = view, [v, a] = karsilik();
      A.sayac.rota++; A.son = {kaynak: 'rota:' + eski, t: Date.now()};
      view = v; if (a) Object.assign(G, a);
      if (!V30.noPush) A.yakinda('rota:' + eski);                         // geri tuşuyla dönülürken ekran açılmaz
    }
    const r = d0.apply(this, arguments);
    if (!A.acikMi()) { try { isaretle(); } catch (x) {} }
    return r;
  };
  // açılışta Altın hatırlanmış/oturumda açıktıysa: Elmas açılır ve bilgilendirilir (koridor rotası ilk çizimde çevrilir)
  if (acilistaAltin && !A.acikMi() && !A.ROTALAR.includes(view)) A.yakinda('acilis');

  /* ---------- 5. Altın girişlerinde “Çok yakında” işaretleri (kartlar aynı yerde, tıklama kapıya gider) ---------- */
  function isaretle() {
    const d = document.querySelector('.g46-dunya small');                    // Elmas › Oyunlar › Oyun Dünyası kartı
    if (d && !d.dataset.yk518) { d.dataset.yk518 = '1'; d.innerHTML = 'Kayıp Bilgeliğin Kütüphanesi, Sınıf Dünyaları, Zamanın İzinde, Bilgi Laboratuvarı · Altın Öğrenme Alanı <em class="yk518-rz">Çok yakında</em>'; }
    const u = document.getElementById('uye39');                              // seçim ekranı
    if (u) {
      const b = u.querySelector('.uye39-b.cp span'); if (b && b.textContent !== 'Çok yakında') b.textContent = 'Çok yakında';
      const et = u.querySelector('.o42-kp .o42-etk.p'); if (et && !et.parentNode.querySelector('.yk518-rz')) et.insertAdjacentHTML('afterend', '<em class="yk518-rz">Çok yakında</em>');
    }
  }
  const s0 = V39.secim;
  V39.secim = function () { const r = s0.apply(this, arguments); if (!A.acikMi()) { try { isaretle(); } catch (x) {} } return r; };

  /* ---------- 6. Kullanım Rehberi ---------- */
  if (V51.Rehber) {
    const R = V51.Rehber, T = R.TANITIM || {};
    A._rehberOrj = {genel: T.genel && T.genel.adim[1] && T.genel.adim[1].m, elmas: T['mod.elmas'] && T['mod.elmas'].adim[4] && T['mod.elmas'].adim[4].m};
    const metin = () => {
      if (T.genel && T.genel.adim[1]) T.genel.adim[1].m = A.acikMi() ? A._rehberOrj.genel : 'Elmas Sınıfı sade ve hızlıdır: dersler, testler, bilgi kartları ve Etkinlik Oyunları burada. Altın Sınıfı (3B koridor ve oyun dünyası) çok yakında açılacak.';
      if (T['mod.elmas'] && T['mod.elmas'].adim[4]) T['mod.elmas'].adim[4].m = A.acikMi() ? A._rehberOrj.elmas : 'Elmas’ta oyunlar Oyunlar bölümündeki Etkinlik Oyunları’ndadır (eşleştirme, doğru cevabı bul, gruplandırma…). 3B Oyun Dünyası Altın Sınıfı’na özeldir; Altın Sınıfı çok yakında açılacak.';
    };
    A._rehberMetin = metin; metin();
    const go0 = R.goster;
    if (go0) R.goster = function (k) { if (k === 'altin' && !A.acikMi()) { try { UI.close(); } catch (x) {} A.yakinda('rehber'); return; } return go0.apply(this, arguments); };
    const ta0 = R.tanitim;
    if (ta0) R.tanitim = function (id) { if (id === 'mod.altin' && !A.acikMi()) { A.yakinda('rehber'); return; } return ta0.apply(this, arguments); };
    const gd0 = R.grupDurum;
    if (gd0) R.grupDurum = function (g) { if (g && g.k === 'altin' && !A.acikMi()) return 'Çok yakında'; return gd0.apply(this, arguments); };
  }

  /* ---------- 7. yeniden açma (ileride: derlemede ACIK:true yeterli; çalışırken de açılıp kapatılabilir) ---------- */
  const bayrak = () => document.documentElement.toggleAttribute('data-altin-kapali', !A.acikMi());
  A.ac = function () { A.ACIK = true; bayrak(); if (A._rehberMetin) A._rehberMetin(); try { draw(); } catch (x) {} };
  A.kapa = function () { A.ACIK = false; ic = false; bayrak(); oturumTemizle(); if (A._rehberMetin) A._rehberMetin(); try { draw(); } catch (x) {} };
  bayrak();
})();
