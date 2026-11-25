/* ===================== V53.0 (1/3): hesap ve profil, hesaplar arası veri ayrımı, sınıf seçimi, mod paneli =====================
   • Hesap kimliği  V53.Hesap.id()  = 'g:<özet>' (Google; cihazda ya da sunuculu) | 'misafir'.
   • Profil  dk-profil53 = {v:1, h:{<id>:{takma, sinif, t}}}  — takma ad ve sınıf hesap başına; gerçek hesap bilgisinden bağımsız.
   • Veri ayrımı  dk-kasa53 = {v:1, aktif:<id>, h:{<id>: H.paket()}}  — hesap değişince önceki hesabın ilerlemesi kasaya,
     yeni hesabınki ekrana konur (V46 H.paket/H.uygula). Misafir → Google: misafir ilerlemesi hesaba taşınır (kayıtlı ilerleme varsa
     V46 H.birlestir.hepsi ile birleştirilir; üzerine yazılmaz). İlk açılışta mevcut veri o anki hesabın sayılır (geçiş).
   • Sınıf seçimi  #sn53 “Hangi sınıfta okuyorsun?” (4–12) — hesabın sınıfı yoksa öğrenme alanında açılır (yönetici/öğretmen
     ekranlarında açılmaz). Seçilen sınıf: Derslerim → o sınıfın sayfası (“Bütün sınıflar” ile diğerleri), ana sayfada “Sınıfım”
     kartı, Etkinlik oyunları ve Çalışma Merkezi o sınıfın oyun/soru/kart havuzuyla. Sınıf değişince eski ilerleme silinmez
     (kayıtlar konu/kazanım kimliğiyle sınıfa bağlıdır). */
(function () {
  if (typeof V46 === 'undefined' || !V46.Hesap || !window.V52) return;
  const V53 = window.V53 = window.V53 || {};
  const H = V46.Hesap;
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const ls = {al: (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } }, yaz: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }};
  const P = V53.Hesap = {K: {profil: 'dk-profil53', kasa: 'dk-kasa53', tum: 'dk-tum53'}, SINIFLAR: [4, 5, 6, 7, 8, 9, 10, 11, 12]};

  /* ---------- 1. hesap kimliği ve profil ---------- */
  P.google = () => { const o = H.oku(); return o.mod === 'google' && !!o.kullanici && !!(o.oturum || o.yerel); };
  P.id = () => { if (!P.google()) return 'misafir'; const u = H.oku().kullanici || {}; return 'g:' + (u.o || u.id || u.sub || u.eposta || 'hesap'); };
  P.tum = () => { const r = ls.al(P.K.profil); return r && r.v === 1 && r.h ? r : {v: 1, h: {}}; };
  P.profil = (id) => P.tum().h[id || P.id()] || {};
  P.kaydet = (yama, id) => { const r = P.tum(), k = id || P.id(); r.h[k] = Object.assign({}, r.h[k] || {}, yama, {t: new Date().toISOString()}); ls.yaz(P.K.profil, r); };
  P.sinif = () => { const s = +P.profil().sinif; return P.SINIFLAR.includes(s) ? s : 0; };
  P.gorunenAd = () => {
    const pr = P.profil(), u = (H.oku().kullanici || {});
    if (pr.takma) return pr.takma;
    if (!P.google()) return 'Misafir öğrenci';
    return u.ad && u.ad !== u.eposta ? u.ad : (u.eposta || 'Google hesabı');
  };

  /* ---------- 2. hesaplar arası veri ayrımı ---------- */
  const DK2 = ['prog', 'cards', 'wrong', 'mt', 'tests', 'gscore', 'last'];
  P.BOS = () => ({'dk2': {prog: {}, cards: {}, wrong: {}, mt: {}, tests: [], gscore: {}, last: null}, 'dk-ilerleme39': {z: {}, t: {}, prog: {}}, 'dk-oyun41': {v: 1, oyunlar: {}}, 'dk-calis45': {v: 1, hedef: 20, gun: {}}});
  P.kasa = () => { const r = ls.al(P.K.kasa); return r && r.v === 1 ? Object.assign({h: {}}, r) : null; };
  P.yukle = function (p) {
    const b = P.BOS(); p = p || b;
    const tam = {'dk2': Object.assign({}, b.dk2, p.dk2 || {}), 'dk-ilerleme39': p['dk-ilerleme39'] || b['dk-ilerleme39'], 'dk-oyun41': p['dk-oyun41'] || b['dk-oyun41'], 'dk-calis45': p['dk-calis45'] || b['dk-calis45']};
    H.uygula(tam);
    try { DK2.forEach((k) => { Store.ov[k] = tam.dk2[k]; }); } catch (x) {}
    try { V39._ilr = null; } catch (x) {}
  };
  P._gec = 0;
  P.denetle = function () {
    if (P._gec) return false;
    const yeni = P.id(); let k = P.kasa();
    if (!k) { ls.yaz(P.K.kasa, {v: 1, aktif: yeni, h: {}}); return false; }          // ilk açılış: mevcut veri bu hesabın
    if (k.aktif === yeni) return false;
    P._gec = 1;
    try {
      const eski = k.aktif, simdi = H.paket();
      if (eski === 'misafir' && yeni !== 'misafir') {
        const kayitli = k.h[yeni];
        P.yukle(kayitli ? H.birlestir.hepsi(simdi, kayitli) : simdi);                  // misafir ilerlemesi hesaba taşınır
        k.h.misafir = P.BOS();
        const mp = P.profil('misafir'); if (mp.sinif && !P.profil(yeni).sinif) P.kaydet({sinif: mp.sinif}, yeni);   // misafirken seçilen sınıf da taşınır
      } else {
        k.h[eski] = simdi;                                                              // önceki hesabın verisi kasaya
        P.yukle(k.h[yeni] || null);                                                      // yeni hesabın verisi (yoksa boş)
      }
      delete k.h[yeni]; k.aktif = yeni; ls.yaz(P.K.kasa, k);
      try { if (typeof V52 !== 'undefined' && V52.Yedek && V52.Yedek.planla) V52.Yedek.planla(); } catch (x) {}
    } finally { P._gec = 0; }
    return true;
  };
  const yz0 = H.yaz;
  H.yaz = function () { const r = yz0.apply(this, arguments); try { if (P.denetle()) setTimeout(() => { try { draw(); } catch (x) {} }, 0); } catch (x) {} return r; };
  try { P.denetle(); } catch (x) {}

  /* ---------- 3. Profilim: ad, takma ad, sınıf ---------- */
  const IK = {kisi: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>', g: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 4v5h-5"/>', bulut: '<path d="M7 18a4.5 4.5 0 1 1 .9-8.9A6 6 0 0 1 19.5 11 3.5 3.5 0 0 1 18 18z"/>', kalem: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', okul: '<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11v5c3 2 7 2 10 0v-5"/>'};
  const ik = (k, s) => `<svg width="${s || 18}" height="${s || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[k]}</svg>`;
  if (window.V49 && V49.Profil && V49.Profil.ust) {
    const ust0 = V49.Profil.ust;
    V49.Profil.ust = function () {
      let h = ust0.apply(this, arguments);
      try {
        const g = P.google(), o = H.oku(), yerel = !!o.yerel, s = P.sinif();
        const cip = g ? (yerel ? 'Google hesabı · bu cihazda' : 'Google hesabı · eşitleniyor') : 'Misafir · bu cihazda';
        h = h.replace(/<b>[^<]*<\/b><span class="pr49-cip">/, `<b>${e(P.gorunenAd())}</b><span class="pr49-cip">`)
          .replace(/<i class="(ok)?">(<svg[\s\S]*?<\/svg>)(Hesapla eşitleniyor|Misafir · bu cihazda)<\/i>/, `<i class="${g ? 'ok' : ''}">$2${cip}</i>`)
          .replace('</span></span>\n<span class="pr49-amb"', `${s ? `<i>${s}. sınıf</i>` : ''}</span></span>\n<span class="pr49-amb"`);
        h += P.profilKart();
      } catch (x) {}
      return h;
    };
  }
  P.profilKart = function () {
    const g = P.google(), u = H.oku().kullanici || {}, pr = P.profil(), s = P.sinif();
    return `<section class="card p46-s pr53" aria-labelledby="pr53-h"><h2 id="pr53-h">Profil bilgilerim</h2>
<dl class="pr53-l">
<div><dt>${ik('kisi')} Hesap türü</dt><dd>${g ? 'Google hesabı' : 'Misafir (hesapsız)'}</dd></div>
${g && u.eposta ? `<div><dt>${ik('bulut')} E-posta</dt><dd class="pr53-ep">${e(u.eposta)}</dd></div>` : ''}
<div><dt>${ik('kalem')} Takma ad</dt><dd>${pr.takma ? e(pr.takma) : '<span class="mut">Belirlenmedi</span>'} <button type="button" class="pr53-b" onclick="V53.Hesap.takmaAc()">${pr.takma ? 'Değiştir' : 'Belirle'}</button></dd></div>
<div><dt>${ik('okul')} Sınıfım</dt><dd>${s ? s + '. sınıf' : '<span class="mut">Seçilmedi</span>'} <button type="button" class="pr53-b" onclick="V53.Hesap.sinifAc(true)">${s ? 'Değiştir' : 'Seç'}</button></dd></div>
</dl>${g ? '' : '<p class="small mut">Misafir olarak bu cihazda devam ediyorsun. Google ile giriş yaparsan bu ilerleme hesabına taşınır.</p>'}</section>`;
  };
  P.takmaAc = function () {
    UI.sheet({title: 'Takma ad', body: () => `<div class="hs46"><p class="small">Uygulamada görünecek adını yaz. Google hesabındaki adın değişmez.</p>
<label class="hs46-l">Takma ad<input id="pr53-t" type="text" maxlength="24" autocomplete="off" value="${e(P.profil().takma || '')}"></label><p class="small mut" id="pr53-d" aria-live="polite"></p></div>`,
      footer: () => '<button onclick="UI.close()">Vazgeç</button>' + (P.profil().takma ? '<button onclick="V53.Hesap.takmaKaydet(true)">Kaldır</button>' : '') + '<button class="p" onclick="V53.Hesap.takmaKaydet()">Kaydet</button>'});
  };
  P.takmaKaydet = function (sil) {
    const i = document.getElementById('pr53-t'), v = sil ? '' : String(i && i.value || '').replace(/\s+/g, ' ').trim();
    if (!sil && (v.length < 2 || v.length > 24)) { const d = document.getElementById('pr53-d'); if (d) d.textContent = 'Takma ad 2–24 karakter olmalı.'; return; }
    if (!sil && /[<>@]/.test(v)) { const d = document.getElementById('pr53-d'); if (d) d.textContent = 'Takma adda <, > ve @ kullanılamaz.'; return; }
    P.kaydet({takma: v}); UI.close(); UI.toast(sil ? 'Takma ad kaldırıldı.' : 'Takma ad kaydedildi.'); setTimeout(() => { try { draw(); } catch (x) {} }, 250);
  };

  /* ---------- 4. sınıf seçimi ---------- */
  const CSS = `
html.sn53-acik{overflow:hidden}
html.sn53-acik body>*:not(#sn53):not(#gir523):not(script):not(style){visibility:hidden!important}
html.sn53-acik body>#sn53.sn53:not(#sn53-a):not(#sn53-b):not(#sn53-c){visibility:visible!important}
#sn53{position:fixed;inset:0;z-index:9700;display:flex;align-items:center;justify-content:center;padding:max(20px,env(safe-area-inset-top)) 16px max(20px,env(safe-area-inset-bottom));background:var(--bg,#0f1420);color:var(--ink,#eef2f8);overflow:auto;outline:none}
#sn53 .sn53-k{width:100%;max-width:440px;text-align:center}
#sn53 h1{font-size:1.5rem;margin:0 0 6px}
#sn53 p{margin:0 0 18px;color:var(--mut,#9aa6b8)}
#sn53 .sn53-g{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
#sn53 .sn53-s{min-height:72px;border-radius:16px;border:1px solid var(--line,#2c3546);background:var(--surface,#171d29);color:var(--ink,#eef2f8);font:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
#sn53 .sn53-s b{font-size:1.5rem;line-height:1}
#sn53 .sn53-s small{font-size:.8rem;color:var(--mut,#9aa6b8)}
#sn53 .sn53-s.on{border-color:var(--pri,#3b82f6);box-shadow:0 0 0 2px var(--pri,#3b82f6) inset}
#sn53 .sn53-s:focus-visible{outline:3px solid var(--pri,#3b82f6);outline-offset:2px}
#sn53 .sn53-x{margin-top:16px;background:none;border:0;color:var(--mut,#9aa6b8);font:inherit;text-decoration:underline;cursor:pointer;min-height:44px}
.sn53-ev{display:flex;align-items:center;gap:12px;margin:0 0 14px;padding:14px 16px;border-radius:16px;border:1px solid var(--line);background:var(--surface);color:var(--ink);width:100%;font:inherit;text-align:left;cursor:pointer}
.sn53-ev b{font-size:1.05rem}.sn53-ev small{display:block;color:var(--mut)}.sn53-ev .sn53-n{font-size:1.6rem;font-weight:800;min-width:2.4ch;text-align:center;color:var(--pri)}
.sn53-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 12px;font-size:.92rem;color:var(--mut)}
.sn53-bar button{min-height:40px;padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;cursor:pointer}
.pr53 .pr53-l{margin:0;display:grid;gap:10px}.pr53 .pr53-l>div{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 12px;padding:10px 0;border-bottom:1px solid var(--line)}
.pr53 dt{display:flex;align-items:center;gap:8px;color:var(--mut)}.pr53 dd{margin:0;display:flex;align-items:center;gap:10px;font-weight:600;word-break:break-word}
.pr53 .pr53-b{min-height:40px;padding:6px 14px;border-radius:999px;border:1px solid var(--line);background:var(--surface2,var(--surface));color:var(--ink);font:inherit;font-weight:600;cursor:pointer}
.v-ov .mk50-giris.mk53-ust{display:flex;width:100%;align-items:center;justify-content:center;gap:8px;min-height:52px;margin:0 0 12px;border-radius:14px;border:1px solid var(--pri);background:var(--pri);color:#fff;font-weight:700;font-size:1.02rem}
`;
  try { const st = document.createElement('style'); st.id = 'v53-hesap-css'; st.textContent = CSS; document.head.appendChild(st); } catch (x) {}

  P.YASAK = ['editor', 'ogretmen', 'ogara', 'bildirim48'];
  P.gerekli = function () {
    if (P.sinif()) return false;
    try { if (typeof V52 !== 'undefined' && V52.Giris && V52.Giris.gerekli()) return false; } catch (x) {}
    try { if (P.YASAK.includes(view)) return false; if (typeof V38 !== 'undefined' && V38.edOk()) return false; } catch (x) {}
    return true;
  };
  P.sinifAc = function (degistir) {
    if (document.getElementById('sn53')) return;
    const s = P.sinif();
    const d = document.createElement('div'); d.id = 'sn53'; d.className = 'sn53'; d.tabIndex = -1;
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'sn53-h');
    d.innerHTML = `<div class="sn53-k"><h1 id="sn53-h">Hangi sınıfta okuyorsun?</h1><p>Derslerin, oyunların ve çalışma merkezin sınıfına göre hazırlanır. ${degistir ? 'Önceki sınıflardaki ilerlemen silinmez.' : 'Sonra Profilim’den değiştirebilirsin.'}</p>
<div class="sn53-g" role="list">${P.SINIFLAR.map((n) => `<button type="button" role="listitem" class="sn53-s ${n === s ? 'on' : ''}" aria-pressed="${n === s}" onclick="V53.Hesap.sinifSec(${n})"><b>${n}</b><small>sınıf</small></button>`).join('')}</div>
${degistir ? '<button type="button" class="sn53-x" onclick="V53.Hesap.sinifKapat()">Vazgeç</button>' : ''}</div>`;
    document.body.appendChild(d); document.documentElement.classList.add('sn53-acik');
    setTimeout(() => { try { d.focus({preventScroll: true}); } catch (x) {} }, 30);
  };
  P.sinifKapat = function () { const d = document.getElementById('sn53'); if (d) d.remove(); document.documentElement.classList.remove('sn53-acik'); };
  P.sinifSec = function (n) {
    if (!P.SINIFLAR.includes(+n)) return;
    const once = P.sinif();
    P.kaydet({sinif: +n});
    try { const o = V39.ilr(); o.sonSinif = +n; V39.ilrSave ? V39.ilrSave(o) : localStorage.setItem('dk-ilerleme39', JSON.stringify(o)); V39._ilr = null; } catch (x) {}
    try { sessionStorage.removeItem(P.K.tum); } catch (x) {}
    P.sinifKapat();
    UI.toast(once && once !== +n ? `${n}. sınıfa geçtin. ${once}. sınıftaki ilerlemen korunuyor.` : `${n}. sınıf seçildi.`);
    try { if (view === 'classes' || view === 'grade' || view === 'profil46' || view === 'games' || view === 'calis45' || view === 'home') draw(); } catch (x) {}
  };
  P.tumSiniflar = function (ac) { try { ac ? sessionStorage.setItem(P.K.tum, '1') : sessionStorage.removeItem(P.K.tum); } catch (x) {} go(ac ? 'classes' : 'grade', ac ? undefined : {g: P.sinif()}); };
  P.tumMu = () => { try { return sessionStorage.getItem(P.K.tum) === '1'; } catch (x) { return false; } };

  // Derslerim → seçilen sınıf
  if (typeof go === 'function') {
    const go0 = go;
    window.go = go = function (v, a) {
      try { if (v === 'classes' && P.sinif() && !P.tumMu() && !(typeof V39 !== 'undefined' && V39.on)) { v = 'grade'; a = Object.assign({}, a || {}, {g: P.sinif()}); } } catch (x) {}
      return go0.call(this, v, a);
    };
  }
  // sınıfın havuzu: Etkinlik oyunları ve Çalışma Merkezi
  P.HAVUZ = {games: ['games', 'questions'], calis45: ['questions', 'flashcards']};
  if (typeof Store !== 'undefined' && Store.all) {
    const all0 = Store.all;
    Store.all = function (k) {
      const r = all0.apply(this, arguments);
      try {
        const s = P.sinif(), L = P.HAVUZ[view];
        if (s && L && L.includes(k) && Array.isArray(r)) { const f = r.filter((x) => !x || x.grade == null || +x.grade === s); if (f.length) return f; }
      } catch (x) {}
      return r;
    };
  }
  // çizimden sonra: sınıf kartı / çubuğu ve gerekirse sınıf seçimi
  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try {
      const s = P.sinif();
      if (s && view === 'home' && !(typeof V39 !== 'undefined' && V39.on) && !$.querySelector('.sn53-ev')) {
        const yer = $.querySelector('section, .card, h1'); const html = `<button type="button" class="sn53-ev" onclick="go('grade',{g:${s}})"><span class="sn53-n">${s}</span><span><b>Sınıfım: ${s}. sınıf</b><small>Derslerime git · sınıfını Profilim’den değiştirebilirsin</small></span></button>`;
        if (yer && yer.parentNode === $) yer.insertAdjacentHTML('beforebegin', html); else $.insertAdjacentHTML('afterbegin', html);
      }
      if (s && (view === 'grade' || view === 'games' || view === 'calis45') && !(typeof V39 !== 'undefined' && V39.on) && !$.querySelector('.sn53-bar')) {
        const g = (typeof G !== 'undefined' && G && +G.g) || s;
        const bar = view === 'grade'
          ? (g === s ? `<div class="sn53-bar"><span>Sınıfım: <b>${s}. sınıf</b></span><button type="button" onclick="V53.Hesap.tumSiniflar(true)">Bütün sınıflar</button></div>` : `<div class="sn53-bar"><span>${g}. sınıfa bakıyorsun.</span><button type="button" onclick="V53.Hesap.tumSiniflar(false)">Kendi sınıfıma dön (${s}.)</button></div>`)
          : `<div class="sn53-bar"><span>${view === 'games' ? 'Oyunlar' : 'Sorular ve kartlar'} <b>${s}. sınıfa</b> göre</span><button type="button" onclick="V53.Hesap.sinifAc(true)">Sınıfımı değiştir</button></div>`;
        $.insertAdjacentHTML('afterbegin', bar);
      }
      if (P.gerekli()) P.sinifAc(false);
    } catch (x) {}
    return r;
  };
  document.addEventListener('focusin', (ev) => { const d = document.getElementById('sn53'); if (d && !d.contains(ev.target) && !document.getElementById('gir523')) { try { d.focus({preventScroll: true}); } catch (x) {} } }, true);
  // giriş ekranından çıkınca sınıf sorusu
  try { if (V52.Giris) { const k0 = V52.Giris.kapat; V52.Giris.kapat = function () { const r = k0.apply(this, arguments); setTimeout(() => { try { if (P.gerekli()) P.sinifAc(false); } catch (x) {} }, 60); return r; }; } } catch (x) {}
  setTimeout(() => { try { if (P.gerekli()) P.sinifAc(false); } catch (x) {} }, 0);

  /* ---------- 5. Mod paneli: “Giriş ekranını aç” en üstte ---------- */
  if (typeof V50 !== 'undefined' && V50.Mod && V50.Mod.ac) {
    const ac0 = V50.Mod.ac;
    V50.Mod.ac = function () {
      const r = ac0.apply(this, arguments);
      const tasi = () => { try { const b = V50.Mod._ac && V50.Mod._ac.box; const g = b && b.querySelector('.mk50-giris'); const k = b && b.querySelector('.mk50'); if (g && k && !g.classList.contains('mk53-ust')) { g.classList.add('mk53-ust'); k.parentNode.insertBefore(g, b.querySelector('.mk50-ust') || k); } } catch (x) {} };
      tasi(); setTimeout(tasi, 0);
      return r;
    };
  }
})();
