/* ===================== V51.3: konu sonu önceki/sonraki konu geçişi + Android katman yedeği =====================
   V51.KonuGecis — konu ekranının sonunda (sekme düğmelerinin altında) önceki/sonraki konu.
   Sıra, o modun sınıf/ünite ekranında gösterilen sırayla aynıdır:
     Elmas: grade() — konunun sınıfı ve program yılı, görünür üniteler (kayıt sırası), her ana konu ve hemen ardından alt konuları;
     Altın: V39.units(g,py) (ünite sırası) + V39.tops(uid) — ana konu, ardından alt konuları.
   Geçiş modu değiştirmez: Elmas'ta go('topic'), Altın'da go('pders'); V42.gec / V50.Mod.gec çağrılmaz.
   Öğretmen görünümü (G.okip) açıksa geçişte korunur. İlerleme kaydına dokunulmaz (konu açılınca var olan
   kurallar çalışır: Store.ov.last, V39.visit). Veri değiştirilmez. */
(function () {
  'use strict';
  const V51 = window.V51 || (window.V51 = {});
  const KG = V51.KonuGecis = {};
  const ord = (a, b) => (a.order || 0) - (b.order || 0);
  const e = (s) => (typeof esc === 'function' ? esc(s) : String(s == null ? '' : s));
  const gor = (x) => { try { return typeof vis === 'function' ? vis(x) : true; } catch (er) { return true; } };

  /* modun sıralı konu listesi (yalnız konunun sınıfı + program yılı; 2018/2026 karışmaz) */
  KG.sira = function (t, mod) {
    if (!t) return [];
    const g = t.grade, py = t.programYear;
    let U = Store.all('units').filter((u) => u.grade == g && u.programYear === py && gor(u));
    if (mod === 'altin') U = U.slice().sort((a, b) => a.order - b.order);
    const T = Store.all('topics').filter((x) => x.grade == g && x.programYear === py && gor(x));
    const out = [];
    U.forEach((u) => {
      const tl = T.filter((x) => x.unitId === u.id);
      tl.filter((x) => !x.parentId).sort(ord).forEach((m) => {
        out.push({t: m, u});
        tl.filter((x) => x.parentId === m.id).sort(ord).forEach((s) => out.push({t: s, u}));
      });
    });
    return out;
  };
  KG.mod = () => (typeof view !== 'undefined' && view === 'pders' ? 'altin' : 'elmas');
  KG.komsu = function (tid, mod) {
    const t = Store.get('topics', tid); const L = KG.sira(t, mod); const i = L.findIndex((x) => x.t.id === tid);
    return {t, L, i, onceki: i > 0 ? L[i - 1] : null, sonraki: i >= 0 && i < L.length - 1 ? L[i + 1] : null, ilk: i === 0, son: i >= 0 && i === L.length - 1};
  };
  const ogrKip = () => { try { return G.okip && V51.Gorunum && /^(ogretmen|onizleme)$/.test(V51.Gorunum.kip()) ? G.okip : null; } catch (er) { return null; } };

  KG.git = function (tid) {
    const ok = ogrKip();
    if (KG.mod() === 'altin') { const a = {pt: tid, ptab: ''}; if (ok) a.okip = ok; go('pders', a); }
    else { const a = {t: tid, tab: 'anlat'}; if (ok) a.okip = ok; go('topic', a); }
    try { scrollTo(0, 0); } catch (er) {}
  };
  KG.sinifa = function (g) { if (KG.mod() === 'altin') go('psinif', {pg: g}); else go('grade', {g}); };

  const svg = (y) => `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${y === 'sol' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}"/></svg>`;
  const unAd = (u) => (u ? `${u.order}. Ünite: ${u.title}` : '');
  KG.html = function (tid, mod) {
    const k = KG.komsu(tid, mod); if (!k.t || k.i < 0) return '';
    const yeniU = (a) => a && a.u && k.L[k.i].u && a.u.id !== k.L[k.i].u.id;
    const sol = k.onceki
      ? `<button type="button" class="kg513-b onc" data-kg="onceki" onclick="V51.KonuGecis.git('${k.onceki.t.id}')">${svg('sol')}<span><small>Önceki konu${yeniU(k.onceki) ? ' · önceki ünite' : ''}</small><b>${e(k.onceki.t.title)}</b>${yeniU(k.onceki) ? `<i>${e(unAd(k.onceki.u))}</i>` : ''}</span></button>`
      : `<p class="kg513-uc" data-kg="ilk">Bu, ${k.t.grade}. sınıfın ilk konusu.</p>`;
    const sag = k.sonraki
      ? `<button type="button" class="kg513-b son" data-kg="sonraki" onclick="V51.KonuGecis.git('${k.sonraki.t.id}')"><span><small>Sonraki konu${yeniU(k.sonraki) ? ' · yeni ünite' : ''}</small><b>${e(k.sonraki.t.title)}</b>${yeniU(k.sonraki) ? `<i>${e(unAd(k.sonraki.u))}</i>` : ''}</span>${svg('sag')}</button>`
      : `<button type="button" class="kg513-b son bitis" data-kg="sinif" onclick="V51.KonuGecis.sinifa(${+k.t.grade})"><span><small>Bu, ${k.t.grade}. sınıfın son konusu</small><b>Sınıf sayfasına dön</b></span>${svg('sag')}</button>`;
    return `<nav class="kg513 ${mod === 'altin' ? 'kg513-a' : 'kg513-e'}" aria-label="Konu geçişi"><p class="kg513-bas">${k.i + 1} / ${k.L.length} · ${k.t.grade}. sınıf konuları</p><div class="kg513-ic">${sol}${sag}</div></nav>`;
  };
  KG.yerlestir = function (mod) {
    try {
      const app = document.getElementById('app'); if (!app) return;
      app.querySelectorAll('.kg513').forEach((x) => x.remove());
      const tid = mod === 'altin' ? G.pt : G.t; if (!tid) return;
      const h = KG.html(tid, mod); if (!h) return;
      const p = mod === 'altin' ? app.querySelector('.p39-ders .p39-pager') : app.querySelector('.pager');
      if (p) p.insertAdjacentHTML('afterend', h);
      else { const tb = app.querySelector('#tb'); if (tb) tb.insertAdjacentHTML('afterend', h); else app.insertAdjacentHTML('beforeend', h); }
    } catch (er) { console.warn('[V51.3] konu geçişi', er); }
  };
  // Elmas: global topic() (draw çekirdeği çağrı anında okur)
  if (typeof topic === 'function') {
    const t0 = topic;
    topic = function () { const r = t0.apply(this, arguments); if (typeof view === 'undefined' || view === 'topic') KG.yerlestir('elmas'); return r; };
  }
  if (typeof V39 !== 'undefined' && V39.r_pders) {
    const p0 = V39.r_pders;
    V39.r_pders = function () { const r = p0.apply(this, arguments); KG.yerlestir('altin'); return r; };
  }

  /* ---------- içeriği hazırlanmamış konu: öğrenci kaynak iskeletini görmez ----------
     İçeriği (sections/content) olmayan konuda tek sekme “kay” (srcView): “Kaynak bilgisi · yalnızca bölüm ve sayfa
     bağlantısı tutulur · MEB çıktısı · Ders kitabı · İşaretli bilgiler” gibi editoryal iskelet. Öğrenci görünümünde
     yerine sade bir bilgi kartı çizilir; öğretmen ve editör görünümü aynen kalır. Veri değişmez, içerik üretilmez. */
  if (typeof srcView === 'function') {
    const s0 = srcView;
    srcView = function (t) {
      let k = 'ogrenci'; try { k = V51.Gorunum.kip(); } catch (er) {}
      if (k !== 'ogrenci') return s0.apply(this, arguments);
      return `<div class="card bos513"><h3>Bu konunun anlatımı henüz hazırlanmadı</h3><p>Bu konu için öğrenme içeriği henüz uygulamaya eklenmedi.</p><p class="mut">Aşağıdaki “Sonraki konu” düğmesiyle devam edebilir ya da sınıf sayfasına dönebilirsin.</p></div>`;
    };
  }

  /* ---------- Android/eski WebView: alt pencere açıkken alt menüleri gizleme (:has() yedeği) ---------- */
  try {
    const b = document.body, guncelle = () => { b.classList.toggle('ov513', !!document.querySelector('body>.v-ov')); };
    new MutationObserver(guncelle).observe(b, {childList: true});
    guncelle();
  } catch (er) {}
})();
