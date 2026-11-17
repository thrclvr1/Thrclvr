/* ===================== V45.0: Çalışma Merkezim (öğrenme ve tekrar) — rota: calis45 =====================
   Yalnız cihazdaki gerçek kayıtlardan hesaplanır; yeni içerik üretilmez.
   - Zayıf kazanımlar      : Store.ov.prog (en az 2 cevap, başarı < %60)
   - Tekrar zamanı gelenler: Store.ov.prog[..].nextReview geçmiş kazanımlar (aralıklı tekrar: doğruda 3 gün, yanlışta 1 gün sonra)
   - Kartlar               : FC.due (bugün tekrar), FC.st = 'tekrar' (öğrenilmemiş)
   - Tekrar listesi        : Store.ov.wrong (yanlış sorular; doğru çözülünce çıkar)
   - Konu başarı haritası  : V39.ilr().t (soru bazında son cevap) + Store.ov.mt (mini test)
   - Günlük hedef          : yeni anahtar dk-calis45 = {v:1, hedef, gun:{'YYYY-AA-GG': cevap sayısı}} (son 30 gün tutulur)
   - Öneriler              : yanlışı en çok olan konular, başarısı %70 altında kalan konular, zayıf kazanımların konuları */
(function () {
  const C = V45.Calis = {};
  const KEY = 'dk-calis45', gun = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  C.oku = () => { let o = null; try { o = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {} if (!o || o.v !== 1) o = {v: 1, hedef: 20, gun: {}}; o.gun = o.gun || {}; return o; };
  C.yaz = (o) => { const k = Object.keys(o.gun).sort(); k.slice(0, Math.max(0, k.length - 30)).forEach((x) => delete o.gun[x]); try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
  // her cevap (test, mini test, kart, oyun) günlük sayaca bir eklenir
  const r0 = Prog.rec;
  Prog.rec = function () { const r = r0.apply(this, arguments); try { const o = C.oku(), g = gun(); o.gun[g] = (o.gun[g] || 0) + 1; C.yaz(o); } catch (e) {} return r; };
  C.hedefAyarla = (n) => { const o = C.oku(); o.hedef = Math.max(5, Math.min(200, +n || 20)); C.yaz(o); draw(); };
  C.seri = () => { const o = C.oku(); let n = 0; const d = new Date(); for (let i = 0; i < 30; i++) { const k = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i), s = k.getFullYear() + '-' + String(k.getMonth() + 1).padStart(2, '0') + '-' + String(k.getDate()).padStart(2, '0'); if ((o.gun[s] || 0) >= o.hedef) n++; else if (i > 0) break; } return n; };

  // kazanım → konu eşlemesi (görünür, içerikli konular)
  C.okon = function () { if (C._ok && C._okv === Store._v) return C._ok; const M = {}; Store.all('topics').forEach((t) => { if (!vis(t)) return; (t.outcomeIds || []).forEach((o) => (M[o] = M[o] || []).push(t)); }); C._okv = Store._v; return C._ok = M; };
  C.kazanimlar = function () {
    const P = Object.values(Store.ov.prog || {}).filter((p) => Store.get('outcomes', p.outcomeId)), now = Date.now();
    const n = (p) => (p.correct || 0) + (p.wrong || 0);
    return {
      zayif: P.filter((p) => n(p) >= 2 && p.mastery < 0.6).sort((a, b) => a.mastery - b.mastery || n(b) - n(a)),
      vakit: P.filter((p) => p.nextReview && Date.parse(p.nextReview) <= now && !(n(p) >= 2 && p.mastery < 0.6)),
      ogrenilen: P.filter((p) => n(p) >= 2 && p.mastery >= 0.8),
      toplam: P.length
    };
  };
  C.konuSkor = function (tid) {
    const t = (V39.ilr().t || {})[tid] || {}, v = Object.values(t), mt = (Store.ov.mt || {})[tid];
    if (v.length) return {n: v.length, ok: v.reduce((a, x) => a + (x ? 1 : 0), 0)};
    if (mt && mt.n) return {n: mt.n, ok: mt.ok};
    return {n: 0, ok: 0};
  };
  C.duzey = (s) => (!s.n ? 'yok' : s.ok / s.n >= 0.7 ? 'iyi' : s.ok / s.n >= 0.5 ? 'orta' : 'zayif');
  C.DUZ = {yok: 'Henüz çalışılmadı', zayif: 'Zayıf (%50 altı)', orta: 'Gelişiyor (%50–69)', iyi: 'İyi (%70 ve üstü)'};
  C.oneriler = function () {
    const L = [], W = MT.W(), by = {};
    Object.entries(W).forEach(([id, w]) => { const q = Store.get('questions', id); if (q && vis(q)) by[q.topicId] = (by[q.topicId] || 0) + 1; });
    Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([tid, n]) => { const t = Store.get('topics', tid); if (t) L.push({t, neden: `${n} yanlış sorun var`, eylem: `V30.yStart('${tid}')`, eAd: 'Yanlışlarını çöz'}); });
    const sk = Store.all('topics').filter((t) => vis(t) && !by[t.id]).map((t) => ({t, s: C.konuSkor(t.id)})).filter((x) => x.s.n >= 3 && x.s.ok / x.s.n < 0.7).sort((a, b) => a.s.ok / a.s.n - b.s.ok / b.s.n).slice(0, 3);
    sk.forEach(({t, s}) => L.push({t, neden: `başarın %${Math.round(100 * s.ok / s.n)} (${s.ok}/${s.n})`, eylem: `V44.icerikAc('${t.id}','anlat')`, eAd: 'Konuyu tekrar et'}));
    const M = C.okon(), zt = new Set(L.map((x) => x.t.id));
    C.kazanimlar().zayif.slice(0, 4).forEach((p) => { const t = (M[p.outcomeId] || [])[0]; if (t && !zt.has(t.id)) { zt.add(t.id); const o = Store.get('outcomes', p.outcomeId); L.push({t, neden: `zayıf kazanım: ${o.code || p.outcomeId}`, eylem: `V44.icerikAc('${t.id}','anlat')`, eAd: 'Konuyu aç'}); } });
    return L.slice(0, 6);
  };
  C.sinifSec = (g) => { G.c45g = +g || ''; draw(); };

  const kz = (p, M) => { const o = Store.get('outcomes', p.outcomeId), T = M[p.outcomeId] || [], n = (p.correct || 0) + (p.wrong || 0);
    return `<div class="c45-kz"><div class="c45-kzu"><span class="mc">${esc(o.code || p.outcomeId)}</span><span class="c45-y">%${Math.round(p.mastery * 100)} · ${p.correct || 0} doğru / ${n}</span></div><p>${esc(o.text || o.title || '')}</p>${T.length ? `<button type="button" onclick="V44.icerikAc('${T[0].id}','anlat')">${esc(T[0].title)} — konuyu aç</button>` : '<small class="mut">Bu kazanıma bağlı görünür konu yok.</small>'}</div>`; };

  V30.routes.calis45 = function () {
    const o = C.oku(), bg = o.gun[gun()] || 0, K = C.kazanimlar(), M = C.okon(), st = V30.stats(), fc = Store.all('flashcards').filter(vis), og = fc.filter((c) => FC.st(c.id) === 'tekrar').length, seri = C.seri();
    const sonT = Store.get('topics', Store.ov.last), g = G.c45g || (sonT && sonT.grade) || 5, TP = gTopics(g).filter((t) => t.sections);
    const U = {}; Store.all('units').forEach((u) => (U[u.id] = u));
    const byU = {}; TP.forEach((t) => (byU[t.unitId] = byU[t.unitId] || []).push(t));
    const D = {yok: 0, zayif: 0, orta: 0, iyi: 0}; TP.forEach((t) => D[C.duzey(C.konuSkor(t.id))]++);
    const OE = C.oneriler(), yuz = Math.min(100, Math.round(100 * bg / o.hedef));
    $.innerHTML = `<button class="back" onclick="go('home')">${ico('back', 18)} Ana sayfa</button><section class="hero slim"><p class="eyebrow">Öğrenme ve tekrar</p><h1>Çalışma Merkezim</h1><p class="lead">Zayıf kazanımların, tekrar zamanı gelenler ve sana özel öneriler. Hepsi bu cihazdaki kendi cevaplarından hesaplanır.</p></section>
<section class="c45-ust" aria-label="Günlük hedef ve tekrar"><div class="c45-hd card"><div class="c45-hdu"><b>Günlük hedef</b><span>${bg} / ${o.hedef} cevap</span></div><div class="v-prog" role="progressbar" aria-valuemin="0" aria-valuemax="${o.hedef}" aria-valuenow="${Math.min(bg, o.hedef)}" aria-label="Günlük hedef ilerlemesi"><i style="width:${yuz}%"></i></div><p class="small">${bg >= o.hedef ? 'Bugünkü hedefini tamamladın.' : `Hedefe ${o.hedef - bg} cevap kaldı.`}${seri > 1 ? ` · ${seri} gündür hedefini tutturuyorsun.` : ''}</p><label class="c45-hs">Hedef <select onchange="V45.Calis.hedefAyarla(this.value)" aria-label="Günlük cevap hedefi">${[10, 20, 30, 50].map((n) => `<option value="${n}" ${n === o.hedef ? 'selected' : ''}>${n} cevap</option>`).join('')}</select></label></div>
<div class="c45-sc"><button class="h30-sc" onclick="V30.startDue()"><b>${st.due}</b><span>Bugün tekrar edilecek kart</span></button><button class="h30-sc" onclick="go('cards',{fc:{type:'all'}})"><b>${og}</b><span>Öğrenilmemiş kart</span></button><button class="h30-sc" onclick="go('yanlis')"><b>${st.wrong}</b><span>Tekrar listem (yanlışlar)</span></button><button class="h30-sc" onclick="V30.quickTest()"><b>10</b><span>Hızlı karma test</span></button></div></section>
<div class="h30-sec"><h2>Sana önerilenler</h2></div>${OE.length ? `<div class="c45-on">${OE.map((x) => `<div class="card c45-oe"><small>${x.t.grade}. sınıf · ${esc(x.neden)}</small><b>${esc(x.t.title)}</b><button type="button" class="p" onclick="${x.eylem}">${x.eAd}</button></div>`).join('')}</div>` : '<p class="card mut">Öneri için henüz yeterli cevap yok. Birkaç test ya da mini test çözdükçe burada sana özel tekrar önerileri çıkar.</p>'}
<div class="h30-sec"><h2>Zayıf kazanımlar</h2><span>${K.zayif.length}</span></div>${K.zayif.length ? K.zayif.slice(0, 8).map((p) => kz(p, M)).join('') + (K.zayif.length > 8 ? `<p class="small mut">… ve ${K.zayif.length - 8} kazanım daha.</p>` : '') : '<p class="card mut">Zayıf kazanım yok. (En az 2 cevap verilmiş ve başarısı %60 altında kalan kazanımlar burada listelenir.)</p>'}
<div class="h30-sec"><h2>Tekrar zamanı gelenler</h2><span>${K.vakit.length}</span></div>${K.vakit.length ? `<details class="card"><summary>${K.vakit.length} kazanımın tekrar günü geldi</summary>${K.vakit.slice(0, 20).map((p) => kz(p, M)).join('')}</details>` : '<p class="card mut">Tekrar günü gelmiş kazanım yok. Doğru cevaplanan kazanım 3 gün, yanlış cevaplanan 1 gün sonra tekrar listesine gelir.</p>'}
<div class="h30-sec"><h2>Konu başarı haritası</h2><span>${g}. sınıf</span></div>${FE.chips([4, 5, 6, 7, 8, 9, 10, 11, 12].map((x) => [x, x + '. sınıf']), g, 'V45.Calis.sinifSec')}
<p class="c45-lej">${['iyi', 'orta', 'zayif', 'yok'].map((d) => `<span><i class="c45-d ${d}"></i>${C.DUZ[d]} · ${D[d]}</span>`).join('')}</p>
${TP.length ? Object.entries(byU).sort((a, b) => ((U[a[0]] || {}).order || 0) - ((U[b[0]] || {}).order || 0)).map(([uid, L]) => `<div class="h30-unit">${esc((U[uid] || {}).title || uid)}</div><div class="c45-hr">${L.map((t) => { const s = C.konuSkor(t.id), d = C.duzey(s); return `<button type="button" class="c45-k ${d}" onclick="V44.icerikAc('${t.id}','anlat')" aria-label="${esc(t.title)}: ${C.DUZ[d]}${s.n ? `, ${s.ok}/${s.n} doğru` : ''}"><span>${esc(t.title)}</span><small>${s.n ? `%${Math.round(100 * s.ok / s.n)} · ${s.ok}/${s.n}` : '—'}</small></button>`; }).join('')}</div>`).join('') : '<p class="card mut">Bu sınıfta içerikli konu bulunmuyor. Kaynakta veri bulunmuyor.</p>'}
<div class="h30-sec"><h2>Öğrendiklerim</h2><span>${K.ogrenilen.length} kazanım</span></div>${K.ogrenilen.length ? `<details class="card"><summary>%80 ve üstü başarıyla öğrenilen kazanımlar</summary>${K.ogrenilen.map((p) => kz(p, M)).join('')}</details>` : '<p class="card mut">Henüz öğrenildi sayılan kazanım yok (en az 2 cevap ve %80 başarı).</p>'}
<p class="small mut c45-not">Bu ekrandaki veriler yalnız bu cihazda saklanır. Hesap ve eşitleme olmadığı için başka cihazdaki çalışmalar burada görünmez.</p>`;
  };

  // giriş noktaları: Klasik ana sayfa “Çalışma kısayolları” ve Premium İlerleme / sınıf merkezi
  C.giris = function () {
    try {
      if (view === 'home') { const s = $.querySelector('.h30-short'); if (s && !s.querySelector('.c45-gir')) { const o = C.oku(), b = document.createElement('button'); b.className = 'h30-sc c45-gir'; b.setAttribute('onclick', "go('calis45')"); b.innerHTML = `<b>${o.gun[gun()] || 0}/${o.hedef}</b><span>Çalışma Merkezim</span>`; s.prepend(b); } }
      if (view === 'pilerleme') { const h = $.querySelector('.p39-h1'); if (h && !$.querySelector('.c45-pgir')) h.insertAdjacentHTML('afterend', `<button type="button" class="p39-btn c45-pgir" onclick="go('calis45')">Çalışma Merkezim: zayıf kazanımlar, tekrar ve günlük hedef</button>`); }
    } catch (e) {}
  };
  const d0 = draw;
  draw = function () { const r = d0.apply(this, arguments); C.giris(); return r; };
})();
