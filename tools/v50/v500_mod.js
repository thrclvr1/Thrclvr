/* ===================== V50.0: ortak mod geçiş sistemi (Öğretmen Modu · Altın Sınıfı · Elmas Sınıfı) =====================
   Tek yönetim noktası V50.Mod; bütün girişler aynı işlevleri kullanır:
     - üst menüdeki küçük mod düğmesi (Elmas üst çubuğu, Altın üst çubuğu ve koridor, öğretmen paneli) → V50.Mod.ac()
     - Profilim › “Öğrenme Modum” kartı ve Görünüm ve ses › Öğrenme alanı bölümü → V50.Mod.kartlar()
     - eski “Deneyimi değiştir” düğmeleri (V42.degistir) → V50.Mod.ac()
   Geçiş: V50.Mod.gec('elmas' | 'altin' | 'ogretmen'). Elmas/Altın arasında mevcut V42.gec kullanılır (dk-deneyim39 aynı);
   öğretmen modu mevcut öğretmen oturumunu (sessionStorage dk-ogrt-oturum) açar, öğrenci moduna geçince kapatır.
   Son mod: localStorage dk-mod50 = {v:1, son}. Yenilemede öğretmen oturumu sürüyorsa öğretmen paneli yeniden açılır.
   Geri tuşu modu DEĞİŞTİRMEZ: geçmişteki ekran o anki modda (karşılığına çevrilerek) açılır; aynı ekrana denk gelirse bir
   adım daha geri gidilir. Böylece önceki mod yanlışlıkla etkinleşmez, renkler karışmaz. Kullanıcı verisine dokunulmaz. */
(function () {
  if (typeof V30 === 'undefined' || typeof V39 === 'undefined' || typeof V42 === 'undefined') return;
  const V50 = window.V50 = window.V50 || {};
  const M = V50.Mod = {};
  const KEY = 'dk-mod50', OGR = ['ogretmen', 'editor', 'admin', 'bildirim48'];
  const ORTAK = ['calis45', 'profil46', 'ayar47', 'pfav', 'pilerleme', 'yanlis', 'pek', 'pekbol', 'dene', 'cards', 'exams', 'sd', 'kavram', 'kisi', 'links', 'search'];
  const oku = () => { try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); return o && o.v === 1 ? o : null; } catch (e) { return null; } };
  const yaz = (son) => { try { const o = oku(); if (!o || o.son !== son) localStorage.setItem(KEY, JSON.stringify({v: 1, son, t: Date.now()})); } catch (e) {} };
  const ogrOk = () => { try { return V36.ok(); } catch (e) { return false; } };
  M.ADLAR = {elmas: 'Elmas Sınıfı', altin: 'Altın Sınıfı', ogretmen: 'Öğretmen Modu'};
  M.ACK = {
    elmas: 'Ferah, sade ve hızlı: sınıflar, konular, kartlar ve testler düzenli ekranlarda.',
    altin: 'Sıcak ve keşif dolu: 3B okul koridoru, sınıf merkezleri ve Oyun Dünyası.',
    ogretmen: 'Sade ve profesyonel: haftalık plan, sınıf takibi ve içerik araçları.'
  };
  M.aktif = () => (OGR.includes(view) && ogrOk()) ? 'ogretmen' : (V39.on ? 'altin' : 'elmas');

  /* ---------- simgeler ---------- */
  const SWAP = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/></svg>';
  const OGR_IK = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.2V16c1.5 1.4 3.2 2 5 2s3.5-.6 5-2v-4.8"/><path d="M21 9v5"/></svg>`;
  M.amblem = (k, s) => { const G = window.V48 && V48.Gorsel; if (k === 'altin') return G && G.altinAmblem ? G.altinAmblem(s, 'ma50' + s) : ''; if (k === 'elmas') return G && G.elmasAmblem ? G.elmasAmblem(s, 'me50' + s) : ''; return OGR_IK(s); };
  const OGR_GORSEL = `<svg class="g50 g50-ogretmen" viewBox="0 0 320 180" aria-hidden="true" focusable="false"><defs><linearGradient id="og50a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9eef6"/><stop offset="1" stop-color="#cdd8e8"/></linearGradient></defs><rect width="320" height="180" fill="url(#og50a)"/>
<rect x="34" y="28" width="160" height="124" rx="12" fill="#ffffff" stroke="#9fb1c9"/><rect x="50" y="46" width="70" height="8" rx="4" fill="#2f4a73"/><rect x="50" y="64" width="128" height="6" rx="3" fill="#c3cfdf"/><rect x="50" y="78" width="110" height="6" rx="3" fill="#c3cfdf"/>
<g fill="#4a6fa5"><rect x="56" y="118" width="14" height="22" rx="3"/><rect x="78" y="106" width="14" height="34" rx="3"/><rect x="100" y="96" width="14" height="44" rx="3"/><rect x="122" y="110" width="14" height="30" rx="3"/><rect x="144" y="100" width="14" height="40" rx="3"/></g>
<rect x="208" y="40" width="80" height="100" rx="10" fill="#2f4a73"/><path d="M222 64l8 8 16-16M222 92l8 8 16-16" stroke="#cfe0f6" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="254" y="66" width="22" height="5" rx="2.5" fill="#9fb6d6"/><rect x="254" y="94" width="22" height="5" rx="2.5" fill="#9fb6d6"/><rect x="222" y="118" width="54" height="6" rx="3" fill="#9fb6d6"/></svg>`;
  M.gorsel = (k) => (k === 'ogretmen' ? OGR_GORSEL : (window.V48 && V48.Gorsel ? (k === 'altin' ? V48.Gorsel.altin('mg50a') : V48.Gorsel.elmas('mg50e')) : ''));

  /* ---------- mod kartları (panel, Profilim, ayarlar aynı bileşeni kullanır) ---------- */
  M.kartlar = function (yer) {
    const a = M.aktif();
    return `<div class="mk50 ${yer || ''}" role="radiogroup" aria-label="Öğrenme modu">${['elmas', 'altin', 'ogretmen'].map((k) => `<button type="button" role="radio" aria-checked="${k === a}" class="mk50-k ${k} ${k === a ? 'on' : ''}" onclick="V50.Mod.gec('${k}')">
<span class="mk50-g" aria-hidden="true">${M.gorsel(k)}</span><span class="mk50-t"><span class="mk50-ad"><span class="mk50-am">${M.amblem(k, 22)}</span><b>${M.ADLAR[k]}</b></span><small>${M.ACK[k]}</small>${k === a ? '<em class="mk50-on">Şu an kullanılıyor</em>' : `<em class="mk50-gec">${M.ADLAR[k]}’na geç ${SWAP}</em>`}</span></button>`).join('')}</div>`;
  };
  M.ac = function () {
    if (M._ac && M._ac.ov && M._ac.ov.isConnected) return;
    M._ac = UI.sheet({title: 'Öğrenme modu', body: () => `<p class="mk50-ust">Şu an: <b>${M.ADLAR[M.aktif()]}</b>. İlerlemen, favorilerin ve seçtiğin sınıf her modda korunur.</p>${M.kartlar('panel')}<button type="button" class="mk50-giris" onclick="UI.close();setTimeout(()=>V39.secim(true),220)">Giriş ekranını aç</button>`,
      footer: () => '<button onclick="UI.close()">Kapat</button>', onClose: () => { M._ac = null; }});
    try { M._ac.box.classList.add('mk50-sheet'); } catch (e) {}
  };

  /* ---------- geçiş animasyonu ---------- */
  M.animasyon = function (k, fn) {
    const az = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.classList.contains('nomotion');
    if (az) { fn(); return; }
    let o = document.getElementById('gc50'); if (!o) { o = document.createElement('div'); o.id = 'gc50'; o.setAttribute('aria-hidden', 'true'); document.body.appendChild(o); }
    o.className = 'gc50 ' + k; void o.offsetWidth; o.classList.add('gir');
    setTimeout(() => { try { fn(); } finally { o.classList.remove('gir'); o.classList.add('cik'); setTimeout(() => { o.className = 'gc50'; }, 420); } }, 170);
  };

  /* ---------- geçiş ---------- */
  M.gec = function (k) {
    if (!M.ADLAR[k]) return;
    const a = M.aktif();
    try { if (UI._stack && UI._stack.length) UI.close(); } catch (e) {}
    if (k === a) { UI.toast('Zaten ' + M.ADLAR[k] + '’ndasın.'); return; }
    const y = ORTAK.includes(view) ? scrollY : 0, v0 = view;
    setTimeout(() => M.animasyon(k, () => {
      yaz(k);
      if (k === 'ogretmen') { try { V36.ss(V36.SK, '1'); } catch (e) {} go('ogretmen'); return; }
      if (a === 'ogretmen') { try { V36.ss(V36.SK, null); } catch (e) {} }
      V42.gec(k === 'altin' ? 'premium' : 'normal');
      if (view === v0 && y) requestAnimationFrame(() => scrollTo(0, y));
      try { UI.toast(M.ADLAR[k] + ' açıldı.'); } catch (e) {}
    }), 230);
  };
  // ortak ekranlar (Çalışma Merkezim, Profilim, ayarlar…) mod değişince aynı ekranda kalır; sınıf/konu V42.hedef ile eşlenir
  const h0 = V42.hedef;
  V42.hedef = function (mod) { if (ORTAK.includes(view)) return {v: view, a: null, t: 'Aynı ekran'}; if (OGR.includes(view)) return mod === 'normal' ? {v: 'home', a: null, t: 'Ana sayfa'} : {v: 'pdunya', a: null, t: 'Okul koridoru'}; return h0.apply(this, arguments); };
  // eski “Deneyimi değiştir” düğmeleri de ortak paneli açar
  V42.degistir = function () { M.ac(); };

  /* ---------- geri tuşu: mod değişmez ---------- */
  const PREM = {pdunya: 'home', psinif: 'grade', punite: 'grade', pders: 'topic'};
  const karsilik = (v, on) => { if (on) return ({home: 'pdunya', classes: 'pdunya', grade: 'psinif', topic: 'pders'})[v] || v; return PREM[v] || v; };
  const anahtar = (v, g) => [v, g.pg || g.g || '', g.pt || g.t || '', g.pu || '', g.oyn || '', g.obol || ''].join('|');
  const rs0 = V30.restore;
  V30.restore = function (s) {
    if (s) {
      s = Object.assign({}, s, {G: Object.assign({}, s.G || {})});
      const on = !!V39.on;
      if (OGR.includes(s.view) && !ogrOk()) { s.view = on ? 'pdunya' : 'home'; s.G = {}; }
      s.m42 = on ? 1 : 0;
      const hedef = karsilik(s.view, on);
      const Gh = Object.assign({}, s.G); if (hedef === 'psinif' && !Gh.pg) Gh.pg = Gh.g; if (hedef === 'pders' && !Gh.pt) Gh.pt = Gh.t; if (hedef === 'grade' && !Gh.g) Gh.g = Gh.pg; if (hedef === 'topic' && !Gh.t) Gh.t = Gh.pt;
      if (hedef !== s.view || s._mod50 !== undefined) M._son = s.view + ' → ' + hedef;
      if (anahtar(hedef, Gh) === anahtar(view, G) && V30.hist.length) { M.atla = (M.atla || 0) + 1; setTimeout(() => history.back(), 0); return; }
    }
    return rs0.call(this, s);
  };
  // anlık kayıt: hangi modda alındığı (bilgi amaçlı)
  const sn0 = V30.snap;
  V30.snap = function () { const s = sn0.apply(this, arguments); s._mod50 = M.aktif(); return s; };

  /* ---------- üst menü düğmesi ---------- */
  M.dugmeHTML = () => { const a = M.aktif(); return `<span class="md50-i" aria-hidden="true">${M.amblem(a, 18)}</span>${SWAP}<span class="md50-t">Mod</span>`; };
  M.dugmeler = function () {
    try {
      const a = M.aktif(), etiket = 'Mod değiştir — şu an: ' + M.ADLAR[a];
      document.querySelectorAll('header.top .dg42, .p39-top .dg42, #p39bar .dg42').forEach((b) => { if (b.dataset.md50 !== a) { b.dataset.md50 = a; b.classList.add('md50'); b.innerHTML = M.dugmeHTML(); b.setAttribute('aria-label', etiket); b.title = etiket; } });
      const u = document.querySelector('#p40 .ust40'); if (u && !u.querySelector('.md50')) { const ib = u.querySelector('.ib40'); const b = document.createElement('button'); b.type = 'button'; b.className = 'md50 dg42 ust'; b.dataset.md50 = a; b.setAttribute('aria-label', etiket); b.title = etiket; b.setAttribute('onclick', 'V50.Mod.ac()'); b.innerHTML = M.dugmeHTML(); if (ib) ib.before(b); else u.appendChild(b); }
      const og = document.querySelector('.og-top'); if (og && !og.querySelector('.md50')) { const b = document.createElement('button'); b.type = 'button'; b.className = 'md50 og'; b.dataset.md50 = 'ogretmen'; b.setAttribute('aria-label', 'Mod değiştir — şu an: Öğretmen Modu'); b.title = 'Mod değiştir'; b.setAttribute('onclick', 'V50.Mod.ac()'); b.innerHTML = `<span class="md50-i" aria-hidden="true">${OGR_IK(18)}</span>${SWAP}<span class="md50-t">Mod</span>`; const cik = og.querySelector('.og-out'); if (cik) cik.before(b); else og.appendChild(b); }
    } catch (e) { console.warn('[V50] mod düğmeleri', e); }
  };

  /* ---------- Profilim: Öğrenme Modum (Görünüm’deki ayrı “Öğrenme alanı” satırı bu kartla birleşir) ---------- */
  M.profil = function () {
    if (view !== 'profil46' || $.querySelector('.md50-p')) return;
    const ust = $.querySelector('.pr49-ust') || $.querySelector('section.hero');
    const h = `<section class="card p46-s pr49-s md50-p" aria-labelledby="md50-ph"><div class="pr49-bas"><h2 id="md50-ph">Öğrenme Modum</h2><span class="pr49-not">Tek dokunuşla geç</span></div>${M.kartlar('profil')}</section>`;
    if (ust) ust.insertAdjacentHTML('afterend', h); else $.insertAdjacentHTML('afterbegin', h);
    $.querySelectorAll('.a47-oz').forEach((b) => { if (/at:'alan'/.test(b.getAttribute('onclick') || '')) b.remove(); });
  };

  /* ---------- çizim sonrası ---------- */
  let ilk = true; const acilis = oku();
  const d0 = draw;
  draw = function () {
    const r = d0.apply(this, arguments);
    try {
      M.dugmeler(); M.profil();
      if (ilk) { ilk = false; if (acilis && acilis.son === 'ogretmen' && ogrOk() && !OGR.includes(view) && !document.getElementById('uye39')) { setTimeout(() => { V30.noPush = 1; try { go('ogretmen'); } finally { V30.noPush = 0; } }, 0); return r; } }
      if (!document.getElementById('uye39')) yaz(M.aktif());
    } catch (e) { console.warn('[V50] mod', e); }
    return r;
  };
})();
