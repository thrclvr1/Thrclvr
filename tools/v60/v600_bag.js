/* ===================== V60.0 (1/3): bağlantıdan derse — doğru cümle ve kelime; Altın'da tıklanabilir kavramlar =====================
   Kök neden: Kavram Haritası'ndaki “İlgili derse git” bağlantının gerçek hedefini zaten taşıyordu (konu + anlatım bölümü + cümle
   konumu: KMAP.goLesson(t, bi, a, e)), ama hedefi yalnız Elmas ders ekranında (view 'topic', article.blk) arıyordu. V59.1'den beri
   Bağlantılar yalnız Altın'da olduğundan Altın ders ekranında (view 'pders', article.p39-blk) hiçbir şey vurgulanmıyordu.
   “N. sınıf dersine git” (sınıflar arası kavram yolculuğu) ise hiç hedef taşımadan dersi açıyordu.
   V60: tek ortak atlama (V60.Bag): iki modda aynı hedef verisi (KMAP.data().occ: kavram → [konu, bölüm, cümle başı, cümle sonu]),
   cümle işaretlenir, içindeki kavram kelimesi ayrıca vurgulanır, sayfa o kelimeye kaydırılır, vurgu birkaç saniye sonra yumuşakça
   kaybolur. Kelime araması rastgele eşleşme için kullanılmaz: önce kayıtlı cümle; kayıtlı cümle yoksa açıkça yazılır.
   Altın'da kavramlar: Elmas'ın V30.linkify altyapısı (konuya kayıtlı kavram/kişi kayıtları) Altın ders bölmesine de uygulanır. */
(function () {
  if (typeof KMAP === 'undefined') return;
  const V60 = window.V60 = window.V60 || {};
  const B = V60.Bag = {};
  const altin = () => { try { return !!V39.on; } catch (x) { return false; } };
  const tl = (s) => String(s || '').toLocaleLowerCase('tr-TR');

  /* ---------- 1. derse gitme: iki modda ---------- */
  KMAP.goLesson = function (t, bi, a, e, ids, tab) {
    KMAP.jump = {t, bi, a, e, ids: ids || [], tab: tab || 'anlat', root: G.kmap && G.kmap.root};
    try { V33.clear && V33.clear(); } catch (_) {}
    if (altin()) go('pders', {pt: t, ptab: (tab === 'kar') ? 'kav' : 'anlat'});
    else go('topic', {t, tab: tab || 'anlat'});
  };
  // hedefin cümlesi: kayıtlı konumlardan, kartta gösterilen alıntıyla eşleşen; yoksa o konudaki ilk geçerli cümle
  B.hedef = function (cid, tid) {
    const L = ((KMAP.data().occ || {})[cid] || []).filter((o) => (!tid || o[0] === tid) && KMAP.sent(o[0], o[1], o[2], o[3]));
    if (!L.length) return null;
    const c = Store.get('concepts', cid), sn = c && c.snippet && c.snippet.text ? tl(c.snippet.text).replace(/\s+/g, ' ') : '';
    if (sn) { const m = L.find((o) => { const s = tl(KMAP.sent(o[0], o[1], o[2], o[3])).replace(/\s+/g, ' '); return s.includes(sn.slice(0, 60)) || sn.includes(s.slice(0, 60)); }); if (m) return m; }
    return L[0];
  };
  B.dersine = function (cid, tid) {
    const o = B.hedef(cid, tid);
    if (o) KMAP.goLesson(o[0], o[1], o[2], o[3], [cid]);
    else KMAP.goLesson(tid, -1, -1, -1, [cid]);
  };

  /* ---------- 2. hedefi uygula (iki modda aynı) ---------- */
  // Cümle işaretleme: tırnak karakterlerinden bağımsız (Altın anlatımı “…” ifadelerini <q> öğesiyle, tırnaksız metinle gösterir)
  const TIRNAK = /[“”„"«»‘‚]/;
  KMAP.markText = function (root, s) {
    // boşluk ve tırnak karakterleri karşılaştırmaya girmez (iki modda metin aynı, yalnız biçimlendirme farklı)
    const sade = (x) => x.split('').filter((c) => !TIRNAK.test(c) && !/\s/.test(c)).join('');
    const ham = String(s || '').replace(/\s+/g, ' ').trim();
    if (ham.length < 8) return false;
    const W = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: (n) => n.parentElement.closest('h3,.lab,.blk-lab,script,style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
    let buf = '', map = [];
    while (W.nextNode()) { const nd = W.currentNode, v = nd.nodeValue; for (let i = 0; i < v.length; i++) { if (TIRNAK.test(v[i]) || /\s/.test(v[i])) continue; buf += v[i]; map.push([nd, i]); } }
    let want = sade(ham), at = buf.indexOf(want);
    if (at < 0) { const w2 = sade(ham.replace(/(^|\s)\d\)\s*/g, '$1')); at = buf.indexOf(w2); if (at >= 0) want = w2; }
    if (at < 0 || want.length < 6) return false;
    const segs = new Map();
    for (let j = at; j < at + want.length; j++) { const [nd, i] = map[j]; const g = segs.get(nd); if (!g) segs.set(nd, [i, i + 1]); else g[1] = i + 1; }
    // cümle sonraki düğümde sürüyorsa düğüm sonundaki / başındaki boşluk da vurguya girsin (kelimeler arasında boşluk kalmasın)
    const SG = [...segs.entries()];
    SG.forEach(([nd, g], x) => { const v = nd.nodeValue; if (x < SG.length - 1) while (g[1] < v.length && /\s/.test(v[g[1]])) g[1]++; if (x > 0) while (g[0] > 0 && /\s/.test(v[g[0] - 1])) g[0]--; });
    [...segs.entries()].reverse().forEach(([nd, [a, b]]) => { if (b <= a) return; const r = document.createRange(); r.setStart(nd, Math.min(a, nd.nodeValue.length)); r.setEnd(nd, Math.min(b, nd.nodeValue.length)); if (r.collapsed) return; const m = document.createElement('mark'); m.className = 'km-hl'; try { r.surroundContents(m); } catch (_) {} });
    return !!root.querySelector('mark.km-hl');
  };
  const ekranda = (J) => (view === 'topic' && G.t === J.t) || (view === 'pders' && G.pt === J.t);
  // kavram kelimesi deseni: şapkalı/şapkasız harf (ilahî ↔ ilahi) ve sondaki ünsüz yumuşaması (bilinç → bilinci, hak → hakkı değil: yalnız ç/k/p/t → c/ğ/b/d)
  B.desen = function (w) {
    const E = {a: '[aâ]', i: '[iî]', u: '[uû]', â: '[aâ]', î: '[iî]', û: '[uû]'};
    const k = [...String(w)].map((c) => E[c] || E[c.toLocaleLowerCase('tr-TR')] || c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const Y = {ç: '[çc]', k: '[kğ]', p: '[pb]', t: '[td]'}, son = String(w).slice(-1).toLocaleLowerCase('tr-TR');
    if (Y[son] && String(w).length > 3) k[k.length - 1] = Y[son];
    return new RegExp('(?<![\\p{L}])' + k.join(''), 'iu');
  };
  B.terim = function (kok, terimler) {
    // işaretli cümlenin (mark.km-hl) içinde kavram kelimesini bul ve ayrıca vurgula
    const L = terimler.filter(Boolean).sort((a, b) => b.length - a.length);
    for (const w of L) {
      const re = B.desen(w);
      const marks = [...kok.querySelectorAll('mark.km-hl')];
      for (const m of marks) {
        const W = document.createTreeWalker(m, NodeFilter.SHOW_TEXT);
        while (W.nextNode()) {
          const nd = W.currentNode, i = nd.nodeValue.search(re);
          if (i < 0) continue;
          const r = document.createRange(); r.setStart(nd, i); r.setEnd(nd, i + w.length);
          const k = document.createElement('mark'); k.className = 'km60-k'; try { r.surroundContents(k); return k; } catch (_) {}
        }
      }
    }
    return null;
  };
  B.solsun = function () {
    clearTimeout(B._t1); clearTimeout(B._t2);
    B._t1 = setTimeout(() => document.querySelectorAll('mark.km-hl, mark.km60-k').forEach((m) => m.classList.add('km60-sol')), 3800);
    B._t2 = setTimeout(() => { document.querySelectorAll('mark.km60-k').forEach((m) => m.replaceWith(...m.childNodes)); document.querySelectorAll('mark.km-hl.km60-sol').forEach((m) => m.replaceWith(...m.childNodes)); document.querySelectorAll('.km-blk').forEach((a) => a.classList.remove('km-blk')); }, 6200);
  };
  KMAP.applyJump = function () {
    const J = KMAP.jump; if (!J || !ekranda(J)) return; KMAP.jump = null;
    try { V60.Kavram.isaretle(); } catch (x) {}   // önce kavramlar işaretlenir (işaretleme metin düğümlerini böler; vurgu ondan sonra)
    const T = V34.TM(J.t); let found = false, art = null, msg = '';
    const kok = document.getElementById('tb') || document.getElementById('app');
    if (J.bi >= 0 && T && T.sections) {
      const b = (T.sections.anlatim || [])[J.bi], arts = [...kok.querySelectorAll('article.blk, article.p39-blk')];
      const h3 = (x) => (x.querySelector('h3') || {}).textContent;
      art = arts.find((x, i) => i === J.bi && h3(x) === b.h) || arts.find((x) => h3(x) === b.h) || null;
      if (art) { art.classList.add('km-blk'); if (J.a >= 0) { const s = V33.plain(b.p || '').slice(J.a, J.e); found = KMAP.markText(art, s); } if (!found && J.a >= 0) msg = 'Cümle bu sayfada bulunamadı; ilgili bölüm vurgulandı.'; }
      else msg = 'İlgili bölüm bu sayfada bulunamadı.';
    } else if (J.bi < 0) msg = 'Bu kavram için kayıtlı bir cümle konumu yok; ders açıldı.';
    const names = (J.ids || []).map((i) => (KMAP.C(i) || {}).term).filter(Boolean);
    KMAP.bar(names, msg, T && J.bi >= 0 ? KMAP.bh(J.t, J.bi) : null);
    const k = found ? B.terim(art || kok, names) : null;
    const tgt = k || document.querySelector('mark.km-hl') || art;
    B.son = {found, terim: !!k, msg, t: J.t, bi: J.bi};
    if (tgt) setTimeout(() => { try { tgt.scrollIntoView({block: 'center', behavior: (V30.off && V30.off()) ? 'auto' : 'smooth'}); } catch (_) {} }, 80);
    if (found) B.solsun();
  };
  // sınıflar arası kavram yolculuğu: “N. sınıf dersine git” artık o sınıftaki kaydın cümlesine gider
  try {
    const j0 = KMAP.jrHTML;
    KMAP.jrHTML = function () { return String(j0.apply(this, arguments)).replace(/onclick="go\('topic',\{t:'([^']+)',tab:'anlat'\}\)"/g, (m, tid) => `onclick="V60.Bag.dersine(V60.Bag.kjr(this),'${tid}')"`); };
  } catch (x) {}
  // düğmenin kartındaki kavram kimliği (kendi satırında “Bu sınıfın haritası” yoksa kartın kök kavramı)
  B.kjr = function (btn) {
    const li = btn.closest('li.kjr'); const s = li && li.querySelector('[onclick*="V34.sel(\'concept\'"]');
    const m = s && s.getAttribute('onclick').match(/V34\.sel\('concept','([^']+)'\)/);
    if (m) return m[1];
    try { return (G.kmap && G.kmap.root) || (V34.S().sel || {}).id || ''; } catch (x) { return ''; }
  };

  /* ---------- 3. Altın'da tıklanabilir kavramlar (Elmas ile aynı altyapı) ---------- */
  V60.Kavram = {};
  V60.Kavram.isaretle = function () {
    if (view !== 'pders' || !altin()) return 0;
    const tb = document.getElementById('tb'); if (!tb || tb.dataset.xl) return 0;
    const t0 = G.t; G.t = G.pt;
    try { V30.linkify(); } finally { G.t = t0; }
    return tb.querySelectorAll('a.xl').length;
  };
  const d0 = draw;
  window.draw = draw = function () {
    const r = d0.apply(this, arguments);
    try { V60.Kavram.isaretle(); } catch (x) { console.warn('[V60] kavram', x); }
    try { if (KMAP.jump) KMAP.applyJump(); } catch (x) { console.warn('[V60] atlama', x); }
    return r;
  };
  try { if (V39 && V39.tab) { const t0 = V39.tab; V39.tab = function () { const r = t0.apply(this, arguments); try { V60.Kavram.isaretle(); } catch (x) {} return r; }; } } catch (x) {}

  const css = `
mark.km60-k{background:color-mix(in srgb,var(--p-gold,#F5B400) 55%,transparent);color:inherit;border-radius:4px;padding:0 2px;box-shadow:0 0 0 2px color-mix(in srgb,var(--p-gold,#F5B400) 45%,transparent);animation:km60p 1.1s ease-out 2}
@keyframes km60p{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--p-gold,#F5B400) 70%,transparent)}100%{box-shadow:0 0 0 9px transparent}}
mark.km-hl,mark.km60-k{transition:background-color 2.2s ease,box-shadow 2.2s ease}
mark.km-hl.km60-sol,mark.km60-k.km60-sol{background-color:transparent!important;box-shadow:none!important}
body:not([data-prem39]) mark.km60-k{background:color-mix(in srgb,var(--pri,#3B63E0) 28%,transparent);box-shadow:0 0 0 2px color-mix(in srgb,var(--pri,#3B63E0) 40%,transparent)}
body[data-prem39] #tb a.xl{color:var(--p-gold-t,var(--p-gold));text-decoration:underline dotted;text-decoration-color:color-mix(in srgb,var(--p-gold) 70%,transparent);text-underline-offset:4px;text-decoration-thickness:1.5px;border-radius:4px;cursor:pointer}
html[data-pt43="gunduz"] body[data-prem39] #tb a.xl{color:var(--p-gold-t,#7a5212)}
body[data-prem39] #tb a.xl:hover,body[data-prem39] #tb a.xl:focus-visible{background:color-mix(in srgb,var(--p-gold) 16%,transparent);outline:none}
body[data-prem39] mark.km-hl{background:color-mix(in srgb,var(--p-gold) 20%,transparent);box-shadow:0 0 0 2px color-mix(in srgb,var(--p-gold) 32%,transparent)}
body[data-prem39] mark.km60-k{background:color-mix(in srgb,var(--p-gold) 62%,transparent);color:var(--p-ink);font-weight:700}
html[data-pt43="gunduz"] body[data-prem39] mark.km60-k{background:color-mix(in srgb,var(--p-gold) 45%,transparent)}
body[data-prem39] article.km-blk{box-shadow:0 0 0 2px color-mix(in srgb,var(--p-gold) 60%,transparent)}
body[data-prem39] #km-bar{background:color-mix(in srgb,var(--p-card) 96%,transparent);border-color:color-mix(in srgb,var(--p-gold) 45%,transparent);color:var(--p-ink)}
body[data-prem39] #km-bar small{color:var(--p-mut)}
body[data-prem39] #km-bar button{background:var(--p-card);border-color:color-mix(in srgb,var(--p-gold) 35%,transparent);color:var(--p-ink)}
body[data-prem39] #km-bar .p{background:linear-gradient(180deg,var(--p-gold),var(--p-gold2,var(--p-gold)));color:var(--p-bg,#1a1206);border-color:transparent}
@media (prefers-reduced-motion:reduce){mark.km60-k{animation:none}mark.km-hl,mark.km60-k{transition:none}}
`;
  try { const st = document.createElement('style'); st.id = 'v600-bag-css'; st.textContent = css; document.head.appendChild(st); } catch (x) {}
})();
