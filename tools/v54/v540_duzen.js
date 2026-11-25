/* ===================== V54.0 (1/3): düzen — ana sayfa, Derslerim, sınıf sorusu, ünite akordiyonu, Bağlantılar yetkisi, oyun adları =====================
   • Elmas ana sayfa: alt menüde zaten olan “Çalışmam” ve “Profilim” kartları kaldırıldı; “Kaldığın yerden devam et” (seçili sınıfın son konusu)
     ve günlük hedef satırı eklendi. Son konu sınıf başına: localStorage dk-son54 = {v:1, s:{<sınıf>:<konu kimliği>}}.
   • Derslerim: 4–12 bütün sınıflar görünür (V53'teki yönlendirme kapalı); öğrencinin sınıfı “Sınıfım” rozetiyle başta. Başka sınıfın
     konusuna bakmak sınıfı ve “devam et”i değiştirmez.
   • Sınıf sorusu açılışta zorunlu değil: öğrenci öğrenme bölümlerine (Derslerim, Oyunlar, Çalışmam) girerken sorulur; “Şimdilik geç” var.
     Öğretmen ve editör oturumunda sorulmaz.
   • Ünite kartlarındaki konu listesi akordiyon (.ak54): başta kapalı; açık üniteler sessionStorage dk-ak54'te.
   • Bağlantılar › Yönetim sekmesi yalnız editör oturumunda (düğme kaldırılır, V34.render ve V34.tabYonetim yetki denetler).
   • Oyun adları (yalnız görünen metin; oyun kimlikleri ve kayıtlar aynı): Ben Kimim → Beni Bul!, Tabu → Kelimeyi Anlat Bakalım,
     Eşleştirme → Kavram Köprüsü, Kelime avı → Zihin Sandığı, Sıralama / Olayı Sırala → Zaman Yolculuğu, Çarkıfelek → Çark Çevirme.
     Ben Kimim ipuçlarından teknik bilgiler (sınıf, sayfa, “Konu:”) bellekte ayıklanır (veri bloğu değişmez). */
(function () {
  if (typeof V30 === 'undefined' || !window.V53 || !V53.Hesap) return;
  const V54 = window.V54 = window.V54 || {};
  const P = V53.Hesap;
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const ls = {al: (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } }, yaz: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }};
  const D = V54.Duzen = {};
  const ogretmenMi = () => { try { return !!(typeof V36 !== 'undefined' && V36.ok()); } catch (x) { return false; } };
  const editorMu = () => { try { return !!(typeof V38 !== 'undefined' && V38.edOk()); } catch (x) { return false; } };
  const altin = () => { try { return typeof V39 !== 'undefined' && !!V39.on; } catch (x) { return false; } };

  /* ---------- 0. sayfa geçiş animasyonu: art arda geçişte atlanan animasyon yakalanmamış hata bırakmasın ---------- */
  try {
    if (document.startViewTransition && !document.startViewTransition._v54) {
      const vt0 = document.startViewTransition.bind(document);
      document.startViewTransition = function () { const t = vt0.apply(document, arguments); try { ['ready', 'finished', 'updateCallbackDone'].forEach((k) => t && t[k] && t[k].catch(() => {})); } catch (x) {} return t; };
      document.startViewTransition._v54 = 1;
    }
  } catch (x) {}

  /* ---------- 1. sınıf sorusu: öğrenme bölümüne girerken ---------- */
  D.SOR = ['classes', 'grade', 'topic', 'games', 'calis45', 'acalis53', 'aoyun53', 'psinif', 'punite', 'pders', 'poyun', 'pdunya'];
  D.gec = () => { try { return sessionStorage.getItem('dk-sinifgec54') === '1'; } catch (x) { return false; } };
  P.gerekli = function () {
    if (P.sinif() || D.gec()) return false;
    try { if (typeof V52 !== 'undefined' && V52.Giris && V52.Giris.gerekli()) return false; } catch (x) {}
    if (ogretmenMi() || editorMu()) return false;
    return D.SOR.includes(view);
  };
  P.tumMu = () => true;                                                                 // Derslerim artık bütün sınıfları gösterir
  const sa0 = P.sinifAc;
  P.sinifAc = function (degistir) {
    const r = sa0.apply(this, arguments);
    try {
      const k = document.querySelector('#sn53 .sn53-k');
      if (k && !degistir && !k.querySelector('.sn54-gec')) k.insertAdjacentHTML('beforeend', '<button type="button" class="sn53-x sn54-gec" onclick="V54.Duzen.simdilikGec()">Şimdilik geç</button>');
      const p = document.querySelector('#sn53 p'); if (p && !degistir) p.textContent = 'Kişisel ilerlemen ve çalışma önerilerin bu sınıfa göre tutulur. Derslerim’de bütün sınıflara yine göz atabilirsin.';
    } catch (x) {}
    return r;
  };
  D.simdilikGec = function () { try { sessionStorage.setItem('dk-sinifgec54', '1'); } catch (x) {} P.sinifKapat(); };

  /* ---------- 2. son konu (sınıf başına) ---------- */
  D.sonKaydet = function (tid) {
    try { const t = Store.get('topics', tid); if (!t) return; const s = P.sinif(); if (!s || +t.grade !== s) return; const r = ls.al('dk-son54') || {v: 1, s: {}}; r.s[s] = tid; ls.yaz('dk-son54', r); } catch (x) {}
  };
  D.son = function () { const s = P.sinif(); if (!s) return null; const r = ls.al('dk-son54'); const tid = r && r.s && r.s[s]; return tid ? Store.get('topics', tid) : null; };
  if (typeof go === 'function') {
    const go0 = go;
    window.go = go = function (v, a) { try { if (v === 'topic' && a && a.t && !(typeof V51 !== 'undefined' && V51.Gorunum && a.okip)) D.sonKaydet(a.t); if (v === 'pders' && a && a.pt) D.sonKaydet(a.pt); } catch (x) {} return go0.apply(this, arguments); };
  }

  /* ---------- 3. Bağlantılar › Yönetim yalnız editör ---------- */
  if (typeof V34 !== 'undefined' && V34.render) {
    const r0 = V34.render;
    V34.render = function () {
      try { const s = V34.S(); if (s.tab === 'yonetim' && !editorMu()) s.tab = 'harita'; } catch (x) {}
      const r = r0.apply(this, arguments);
      try { if (!editorMu()) document.querySelectorAll('#app button[onclick*="tab=\'yonetim\'"]').forEach((b) => b.remove()); } catch (x) {}
      return r;
    };
    if (V34.tabYonetim) { const ty0 = V34.tabYonetim; V34.tabYonetim = function (b) { if (!editorMu()) { if (b) b.innerHTML = '<p class="mut">Bu bölüm yalnız editör içindir.</p>'; return; } return ty0.apply(this, arguments); }; }
  }

  /* ---------- 4. oyun adları ve Ben Kimim ipuçlarının ayıklanması ---------- */
  D.ADLAR = [[/Ben Kimim\??/g, 'Beni Bul!'], [/\bTabu\b/g, 'Kelimeyi Anlat Bakalım'], [/Kelime avı/g, 'Zihin Sandığı'], [/Olayı Sırala/g, 'Zaman Yolculuğu'], [/Çarkıfelek/g, 'Çark Çevirme']];
  D.ADLAR_OYUN = [[/\bEşleştirme\b/g, 'Kavram Köprüsü'], [/(^|[·\s])Sıralama\b/g, '$1Zaman Yolculuğu']];
  D.OYUN_VIEW = ['games', 'game', 'topic', 'poyun', 'aoyun53', 'pders', 'calis45'];
  D.adlar = function (kok) {
    if (!kok || ogretmenMi() && view === 'ogretmen' || view === 'editor') return;
    const L = D.OYUN_VIEW.includes(view) ? D.ADLAR.concat(D.ADLAR_OYUN) : D.ADLAR;
    try {
      const w = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { let v = n.nodeValue, y = v; for (const [re, s] of L) y = y.replace(re, s); if (y !== v) n.nodeValue = y; }
    } catch (x) {}
  };
  D.TEKNIK = /müfredatında geçiyor|Ders kitabında \d+\.? ?sayfa|^\s*Konu\s*:|sayfada yer alıyor/i;
  D.ayikla = function () {
    try {
      Store.all('games').forEach((g) => {
        if (g.gameType !== 'benkimim' || g._ayik54) return; g._ayik54 = 1;
        (g.items || []).forEach((it) => {
          it.hints = (it.hints || []).map((h) => String(h).replace(/^(Bir [^ ]+?) ve \d+\. sınıf müfredatında geçiyor\.?$/i, '$1.')).filter((h) => !D.TEKNIK.test(h));
        });
      });
    } catch (x) {}
  };

  /* ---------- 5. ana sayfa, Derslerim, akordiyon ---------- */
  D.akAcik = () => { try { return new Set(JSON.parse(sessionStorage.getItem('dk-ak54') || '[]')); } catch (x) { return new Set(); } };
  D.akCevir = function (b) {
    const art = b.closest('article.unit'), tl = art && art.querySelector('.tlist'); if (!tl) return;
    const ac = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(ac)); tl.hidden = !ac;
    const id = b.dataset.u, S = D.akAcik(); ac ? S.add(id) : S.delete(id); try { sessionStorage.setItem('dk-ak54', JSON.stringify([...S])); } catch (x) {}
  };
  D.akordiyon = function () {
    const S = D.akAcik();
    $.querySelectorAll('article.card.unit').forEach((a, i) => {
      const tl = a.querySelector(':scope > .tlist'); if (!tl || a.querySelector('.ak54')) return;
      const n = tl.querySelectorAll('.trow').length, u = ((a.querySelector('.fx-ub') || {}).getAttribute ? (a.querySelector('.fx-ub').getAttribute('onclick') || '').match(/id:'([^']+)'/) : null);
      const id = (u && u[1]) || ('u' + i + '-' + ((a.querySelector('h2') || {}).textContent || ''));
      const ac = S.has(id); tl.hidden = !ac; tl.id = tl.id || ('ak54-' + i);
      tl.insertAdjacentHTML('beforebegin', `<button type="button" class="ak54" data-u="${e(id)}" aria-expanded="${ac}" aria-controls="${tl.id}" onclick="V54.Duzen.akCevir(this)"><span>Konular <small>(${n})</small></span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>`);
    });
  };
  D.anaSayfa = function () {
    // alt menüde olan kartlar ana sayfadan kalkar
    $.querySelectorAll('.h46-k').forEach((k) => { const o = k.getAttribute('onclick') || ''; if (/go\('(calis45|profil46)'/.test(o)) k.remove(); });
    const s = P.sinif(), t = D.son();
    $.querySelectorAll('.sn53-ev').forEach((x) => x.remove());                         // sınıf bilgisi tek kartta
    let cal = {gun: {}, hedef: 20}; try { cal = V45.Calis.oku(); } catch (x) {}
    const d = new Date(), bk = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'), bugun = (cal.gun || {})[bk] || 0, hd = cal.hedef || 20;
    if (!$.querySelector('.dv54')) {
      const ust = s ? `Sınıfım: ${s}. sınıf` : 'Kişisel öğrenme alanın';
      const ana = t ? `<button type="button" class="dv54-d" onclick="V44.icerikAc ? V44.icerikAc('${e(t.id)}','anlat') : go('topic',{t:'${e(t.id)}',tab:'anlat'})"><small>${ust} · kaldığın yerden devam et</small><b>${e(t.title)}</b></button>`
        : (s ? `<button type="button" class="dv54-d" onclick="go('grade',{g:${s}})"><small>${ust}</small><b>${s}. sınıf derslerine başla</b></button>` : `<button type="button" class="dv54-d" onclick="V53.Hesap.sinifAc(true)"><small>${ust}</small><b>Sınıfını seç</b></button>`);
      const html = `<section class="dv54" aria-label="Kaldığın yer">${ana}<button type="button" class="dv54-h" onclick="go('calis45')" aria-label="Günlük hedef: ${bugun} / ${hd} cevap"><span><i style="width:${Math.min(100, Math.round(100 * bugun / hd))}%"></i></span><small>Bugün ${bugun}/${hd} cevap</small></button></section>`;
      const h = $.querySelector('.h46-k'), kap = h && h.parentElement;
      if (kap) kap.insertAdjacentHTML('beforebegin', html); else $.insertAdjacentHTML('afterbegin', html);
    }
  };
  D.derslerim = function () {
    const s = P.sinif(); if (!s) return;
    $.querySelectorAll('[onclick*="go(\'grade\'"]').forEach((b) => { const m = (b.getAttribute('onclick') || '').match(/g:\s*(\d+)/); if (m && +m[1] === s && !b.querySelector('.sn54-rz')) { b.classList.add('sn54-ben'); b.insertAdjacentHTML('beforeend', '<span class="sn54-rz">Sınıfım</span>'); } });
    if (!$.querySelector('.sn54-ust')) $.insertAdjacentHTML('afterbegin', `<div class="sn53-bar sn54-ust"><span>Kişisel ilerlemen: <b>${s}. sınıf</b> · diğer sınıflara da göz atabilirsin</span><button type="button" onclick="go('grade',{g:${s}})">Sınıfıma git</button><button type="button" onclick="V53.Hesap.sinifAc(true)">Değiştir</button></div>`);
  };

  const CSS = `
.ak54{display:flex;width:100%;align-items:center;justify-content:space-between;gap:10px;min-height:48px;margin-top:10px;padding:8px 14px;border-radius:12px;border:1px solid var(--line);background:var(--surface2,var(--surface));color:var(--ink);font:inherit;font-weight:700;cursor:pointer}
.ak54 small{font-weight:500;color:var(--mut)}.ak54 svg{transition:transform .2s ease}.ak54[aria-expanded="true"] svg{transform:rotate(180deg)}
.ak54+.tlist{margin-top:8px}
.dv54{display:grid;gap:8px;margin:0 0 14px}
.dv54-d{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;padding:14px 16px;border-radius:16px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;text-align:left;cursor:pointer;min-height:64px}
.dv54-d small{color:var(--pri);font-weight:700}.dv54-d b{font-size:1.05rem}
.dv54-h{display:flex;align-items:center;gap:10px;width:100%;padding:6px 4px;border:0;background:none;color:var(--mut);font:inherit;cursor:pointer;min-height:40px}
.dv54-h span{flex:1;height:8px;border-radius:99px;background:var(--line);overflow:hidden}.dv54-h i{display:block;height:100%;background:var(--pri)}
.sn54-ben{position:relative;box-shadow:0 0 0 2px var(--pri) inset}
.sn54-rz{position:absolute;top:8px;right:8px;padding:2px 8px;border-radius:99px;background:var(--pri);color:#fff;font-size:.72rem;font-weight:700}
#app{padding-bottom:max(var(--pb54,0px),calc(96px + env(safe-area-inset-bottom)))}
`;
  try { const st = document.createElement('style'); st.id = 'v54-duzen-css'; st.textContent = CSS; document.head.appendChild(st); } catch (x) {}

  const dr0 = draw;
  window.draw = draw = function () {
    D.ayikla();
    const r = dr0.apply(this, arguments);
    try {
      if (view === 'home' && !altin()) D.anaSayfa();
      if (view === 'classes' && !altin()) D.derslerim();
      if (view === 'grade') D.akordiyon();
      if (view === 'links' && !editorMu()) document.querySelectorAll('#app button[onclick*="tab=\'yonetim\'"]').forEach((b) => b.remove());
      D.adlar(document.getElementById('app'));
    } catch (x) {}
    return r;
  };
  try { new MutationObserver((m) => { if (view === 'editor' || view === 'ogretmen') return; for (const x of m) for (const n of x.addedNodes) if (n.nodeType === 1) D.adlar(n); }).observe(document.body, {childList: true, subtree: true}); } catch (x) {}
  D.ayikla();
})();
