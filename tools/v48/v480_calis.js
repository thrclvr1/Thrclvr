/* ===================== V48.0: Çalışma Merkezim — yeni görünüm (rota: calis45) =====================
   Veri ve hesaplar V45.Calis'ten (dk-calis45, Store.ov.prog, FC, MT.W, V39.ilr); yalnız ekran yeniden tasarlandı.
   Korunan özellikler: günlük hedef ve ilerleme · tekrar kartları · öğrenilmemiş kartlar · yanlışlarım · hızlı karma test ·
   önerilenler · zayıf kazanımlar · tekrar zamanı gelenler · konu başarı durumu · öğrendiklerim.
   Elmas: sade ve aydınlık. Altın: aynı veri, atmosferik görünüm (zümrüt, metalik altın). Altın koridorda ayrı
   “Çalışma masası” girişi (araç şeridine 7. kart eklenmez; Oyun Dünyası'ndan ayrı). */
(function () {
  if (typeof V45 === 'undefined' || !V45.Calis) return;
  const V48 = window.V48 = window.V48 || {};
  const C = V45.Calis, K = V48.Calis = {};
  const altin = () => !!(typeof V39 !== 'undefined' && V39.on);
  const tarih = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const IK = {
    kart: '<rect x="3" y="6" width="13" height="15" rx="2.5"/><path d="M8 3h10.5A2.5 2.5 0 0 1 21 5.5V17"/><path d="M7 11h5M7 15h3"/>',
    kitap: '<path d="M12 6.5C10 5 6.5 4.5 3 5.2v13.3c3.5-.7 7 0 9 1.5 2-1.5 5.5-2.2 9-1.5V5.2c-3.5-.7-7-.2-9 1.3z"/><path d="M12 6.5V20"/>',
    yanlis: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    simsek: '<path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z"/>',
    alev: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.2 1.2-3.3 2-4.5.4 1.3 1.2 2 2 2 0-3 .2-5 1-7.5z"/>',
    tamam: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.6 2.6L16.5 9"/>',
    hedef: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
    ok: '<path d="M9 6l6 6-6 6"/>', isik: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    grafik: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', saat: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.6 2"/>'
  };
  const ik = (k, s) => `<svg width="${s || 22}" height="${s || 22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[k]}</svg>`;
  K.ik = ik;

  // günlük hedef halkası (SVG): r=52, çevre 326.7
  K.halka = function (bg, hedef, boy) {
    const y = Math.max(0, Math.min(1, hedef ? bg / hedef : 0)), cv = 2 * Math.PI * 52, s = boy || 148;
    return `<svg class="c48-hlk" width="${s}" height="${s}" viewBox="0 0 120 120" role="img" aria-label="Günlük hedef: ${bg} / ${hedef} cevap"><defs><linearGradient id="c48g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="c48-g1"/><stop offset="1" class="c48-g2"/></linearGradient></defs>
<circle cx="60" cy="60" r="52" class="c48-iz" fill="none" stroke-width="10"/>${[...Array(8)].map((_, i) => { const a = (i * 45 - 90) * Math.PI / 180; return `<circle cx="${(60 + 52 * Math.cos(a)).toFixed(1)}" cy="${(60 + 52 * Math.sin(a)).toFixed(1)}" r="1.4" class="c48-nk"/>`; }).join('')}
<circle cx="60" cy="60" r="52" fill="none" stroke="url(#c48g)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(cv * y).toFixed(1)} ${cv.toFixed(1)}" transform="rotate(-90 60 60)" class="c48-dl"/>
<text x="60" y="58" text-anchor="middle" class="c48-hs">${bg}</text><text x="60" y="78" text-anchor="middle" class="c48-ha">/ ${hedef} cevap</text></svg>`;
  };
  // son 7 günün cevap sayıları
  K.hafta = function (o) {
    const d = new Date(), G = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'], L = [];
    for (let i = 6; i >= 0; i--) { const k = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i); L.push({g: G[k.getDay()], n: o.gun[tarih(k)] || 0, bugun: i === 0}); }
    const mx = Math.max(o.hedef, ...L.map((x) => x.n));
    return `<div class="c48-hft" role="img" aria-label="Son 7 gün: ${L.map((x) => x.g + ' ' + x.n).join(', ')}">${L.map((x) => `<span class="${x.n >= o.hedef ? 'tam' : ''} ${x.bugun ? 'bg' : ''}"><i style="height:${Math.max(6, Math.round(100 * x.n / mx))}%"></i><small>${x.g}</small></span>`).join('')}</div>`;
  };
  // istatistik kartı: sıfır değerde boş “0” yerine anlamlı durum ve yine bir eylem
  const kart = (k, ic, n, ad, bosAd, bosAlt, f, bosF) => n > 0
    ? `<button type="button" class="c48-sk" data-k="${k}" onclick="${f}"><span class="c48-si">${ik(ic, 24)}</span><span class="c48-st"><b>${n}</b><span>${ad}</span></span>${ik('ok', 18)}</button>`
    : `<button type="button" class="c48-sk tm" data-k="${k}" onclick="${bosF || f}"><span class="c48-si">${ik('tamam', 24)}</span><span class="c48-st"><b class="y">${bosAd}</b><span>${bosAlt}</span></span>${ik('ok', 18)}</button>`;
  const bar = (y, cls) => `<span class="c48-bar ${cls || ''}" aria-hidden="true"><i style="width:${Math.round(y * 100)}%"></i></span>`;
  const kz = (p, M) => {
    const o = Store.get('outcomes', p.outcomeId), T = M[p.outcomeId] || [], d = p.correct || 0, y = p.wrong || 0, n = d + y, m = p.mastery || 0;
    return `<div class="c48-kz ${m < 0.4 ? 'cz' : m < 0.6 ? 'z' : m < 0.8 ? 'o' : 'i'}"><div class="c48-kzu"><span class="mc">${esc(o.code || p.outcomeId)}</span><b>%${Math.round(m * 100)}</b></div>${bar(m)}<p>${esc(o.title || o.text || '')}</p>
<div class="c48-kza"><span class="c48-dy"><i class="d"></i>${d} doğru</span><span class="c48-dy"><i class="y"></i>${y} yanlış</span><span class="mut">${n} cevap</span>${T.length ? `<button type="button" onclick="V44.icerikAc('${T[0].id}','anlat')">Konuya git ${ik('ok', 16)}</button>` : '<small class="mut">Bağlı görünür konu yok.</small>'}</div></div>`;
  };
  const NEDEN_IK = (x) => /yanlış/.test(x.neden) ? 'yanlis' : /zayıf/.test(x.neden) ? 'hedef' : 'grafik';

  V30.routes.calis45 = function () {
    const o = C.oku(), bg = o.gun[tarih(new Date())] || 0, KZ = C.kazanimlar(), M = C.okon(), st = V30.stats();
    const fc = Store.all('flashcards').filter(vis), og = fc.filter((c) => FC.st(c.id) === 'tekrar').length, seri = C.seri(), kalan = Math.max(0, o.hedef - bg);
    const sonT = Store.get('topics', Store.ov.last), g = G.c45g || (sonT && sonT.grade) || 5, TP = gTopics(g).filter((t) => t.sections);
    const U = {}; Store.all('units').forEach((u) => (U[u.id] = u));
    const byU = {}; TP.forEach((t) => (byU[t.unitId] = byU[t.unitId] || []).push(t));
    const D = {yok: 0, zayif: 0, orta: 0, iyi: 0}; TP.forEach((t) => D[C.duzey(C.konuSkor(t.id))]++);
    const OE = C.oneriler(), AL = altin();
    let hesap = false; try { const h = V46.Hesap.oku(); hesap = h.mod === 'google' && !!h.oturum; } catch (e) {}
    const devam = sonT && vis(sonT) ? `<div class="c48-oe dv"><span class="c48-oi">${ik('kitap', 22)}</span><span class="c48-ot"><small>Kaldığın yer · ${sonT.grade}. sınıf</small><b>${esc(sonT.title)}</b><em>Öneri için birkaç soru çözmen yeterli; o zamana kadar kaldığın yerden devam edebilirsin.</em></span><button type="button" class="p" onclick="V44.icerikAc('${sonT.id}','anlat')">Devam et</button></div>` : '';
    $.innerHTML = `<div class="c48 ${AL ? 'al' : 'el'}">
<button class="back" onclick="go('${AL ? 'pdunya' : 'home'}')">${ico('back', 18)} ${AL ? 'Koridor' : 'Ana sayfa'}</button>
<section class="hero slim c48-hero"><p class="eyebrow">Öğrenme ve tekrar</p><h1>Çalışma Merkezim</h1><p class="lead">Bugünkü hedefin, tekrar edeceklerin ve sana özel öneriler.</p></section>
<nav class="r46 c48-kis" aria-label="Kısayollar"><button type="button" onclick="go('pek')"><b>Pekiştir</b><small>Kartlar, kodlama, tablo</small></button><button type="button" onclick="go('dene')"><b>Kendini Dene</b><small>Testler ve yanlışlarım</small></button><button type="button" onclick="go('exams')"><b>Sınavlar</b><small>LGS ve YKS</small></button></nav>
<section class="c48-ust" aria-label="Günlük hedef">
 <div class="c48-hd"><div class="c48-hdu"><div class="c48-hdl">${K.halka(bg, o.hedef, 132)}</div>
  <div class="c48-hdr"><h2>Günlük hedef</h2>
   <p class="c48-dm">${bg >= o.hedef ? `${ik('tamam', 18)} Bugünkü hedefini tamamladın.` : `Hedefe <b>${kalan}</b> cevap kaldı.`}</p>
   <div class="c48-seri ${seri > 0 ? 'on' : ''}">${ik('alev', 18)}<span>${seri > 0 ? `<b>${seri} gün</b> üst üste hedef` : 'Hedefi tamamla, seri başlasın'}</span></div></div></div>
  <div class="c48-say"><span><b>${bg}</b><small>Tamamlanan</small></span><span><b>${kalan}</b><small>Kalan</small></span><span><b>${o.hedef}</b><small>Hedef</small></span></div>
  <label class="c48-hs">Günlük hedef <select onchange="V45.Calis.hedefAyarla(this.value)" aria-label="Günlük cevap hedefi">${[10, 20, 30, 50].map((n) => `<option value="${n}" ${n === o.hedef ? 'selected' : ''}>${n} cevap</option>`).join('')}${[10, 20, 30, 50].includes(o.hedef) ? '' : `<option selected value="${o.hedef}">${o.hedef} cevap</option>`}</select></label>
  <div class="c48-hfk"><small>Son 7 gün</small>${K.hafta(o)}</div></div>
 <div class="c48-sg">
  ${kart('tekrar', 'kart', st.due, 'kart bugün tekrarda', 'Tekrar yok', 'Bugünkü kart tekrarın bitti · kartlara göz at', 'V30.startDue()', "go('cards',{fc:{type:'all'}})")}
  ${kart('ogren', 'kitap', og, 'öğrenilmemiş kart', fc.length ? 'Hepsi öğrenildi' : 'Kart yok', fc.length ? 'Kartların hepsi öğrenildi olarak işaretli' : 'Kaynakta kart bulunmuyor', "go('cards',{fc:{type:'all'}})")}
  ${kart('yanlis', 'yanlis', st.wrong, 'soru tekrar listemde', 'Yanlışın yok', 'Test çöz; yanlışların burada toplanır', "go('yanlis')", "go('dene')")}
  <button type="button" class="c48-sk hz" data-k="test" onclick="V30.quickTest()"><span class="c48-si">${ik('simsek', 24)}</span><span class="c48-st"><b>10 soru</b><span>Hızlı karma test</span></span>${ik('ok', 18)}</button>
 </div></section>
<div class="c48-bas"><h2>${ik('isik', 20)} Sana önerilenler</h2><span>${OE.length || ''}</span></div>
${OE.length ? `<div class="c48-on">${OE.map((x) => `<div class="c48-oe"><span class="c48-oi">${ik(NEDEN_IK(x), 22)}</span><span class="c48-ot"><small>${x.t.grade}. sınıf · ${esc((Store.get('units', x.t.unitId) || {}).title || '')}</small><b>${esc(x.t.title)}</b><em>Neden: ${esc(x.neden)}</em></span><button type="button" class="p" onclick="${x.eylem}">${x.eAd}</button></div>`).join('')}</div>` : (devam || `<p class="c48-ip">${ik('isik', 20)} Birkaç test ya da mini test çözdükçe burada sana özel tekrar önerileri çıkar.</p>`)}
<div class="c48-bas"><h2>${ik('hedef', 20)} Zayıf kazanımlar</h2><span>${KZ.zayif.length || ''}</span></div>
${KZ.zayif.length ? `<div class="c48-kzl">${KZ.zayif.slice(0, 8).map((p) => kz(p, M)).join('')}</div>${KZ.zayif.length > 8 ? `<details class="c48-d"><summary>${KZ.zayif.length - 8} kazanım daha</summary><div class="c48-kzl">${KZ.zayif.slice(8).map((p) => kz(p, M)).join('')}</div></details>` : ''}` : `<p class="c48-ip">${ik('tamam', 20)} Zayıf kazanımın yok. En az 2 cevap verilmiş ve başarısı %60 altında kalan kazanımlar burada, doğru/yanlış sayılarıyla listelenir.</p>`}
<details class="c48-d" ${KZ.vakit.length ? '' : ''}><summary>${ik('saat', 20)} Tekrar zamanı gelenler <span>${KZ.vakit.length}</span></summary>${KZ.vakit.length ? `<div class="c48-kzl">${KZ.vakit.slice(0, 20).map((p) => kz(p, M)).join('')}</div>` : '<p class="small mut">Tekrar günü gelmiş kazanım yok. Doğru cevaplanan kazanım 3 gün, yanlış cevaplanan 1 gün sonra buraya gelir.</p>'}</details>
<div class="c48-bas"><h2>${ik('grafik', 20)} Konu başarı durumu</h2><span>${g}. sınıf</span></div>
${FE.chips([4, 5, 6, 7, 8, 9, 10, 11, 12].map((x) => [x, x + '. sınıf']), g, 'V45.Calis.sinifSec')}
${TP.length ? `<div class="c48-dag" role="img" aria-label="Konu dağılımı: ${['iyi', 'orta', 'zayif', 'yok'].map((d) => C.DUZ[d] + ' ' + D[d]).join(', ')}">${['iyi', 'orta', 'zayif', 'yok'].map((d) => D[d] ? `<i class="${d}" style="flex:${D[d]}"></i>` : '').join('')}</div>` : ''}
<p class="c45-lej">${['iyi', 'orta', 'zayif', 'yok'].map((d) => `<span><i class="c45-d ${d}"></i>${C.DUZ[d]} · ${D[d]}</span>`).join('')}</p>
${TP.length ? Object.entries(byU).sort((a, b) => ((U[a[0]] || {}).order || 0) - ((U[b[0]] || {}).order || 0)).map(([uid, L]) => `<details class="c48-u" ${L.some((t) => t.id === (sonT && sonT.id)) ? 'open' : ''}><summary><b>${esc((U[uid] || {}).title || uid)}</b><span>${L.filter((t) => C.duzey(C.konuSkor(t.id)) === 'iyi').length}/${L.length} iyi</span></summary><div class="c48-hr">${L.map((t) => { const s = C.konuSkor(t.id), d = C.duzey(s), y = s.n ? s.ok / s.n : 0; return `<button type="button" class="c48-k ${d}" onclick="V44.icerikAc('${t.id}','anlat')" aria-label="${esc(t.title)}: ${C.DUZ[d]}${s.n ? `, ${s.ok} doğru / ${s.n - s.ok} yanlış` : ''}"><span>${esc(t.title)}</span>${bar(y, d)}<small>${s.n ? `%${Math.round(100 * y)} · ${s.ok} doğru · ${s.n - s.ok} yanlış` : 'Henüz çalışılmadı'}</small></button>`; }).join('')}</div></details>`).join('') : '<p class="c48-ip">Bu sınıfta içerikli konu bulunmuyor. Kaynakta veri bulunmuyor.</p>'}
<details class="c48-d"><summary>${ik('tamam', 20)} Öğrendiklerim <span>${KZ.ogrenilen.length}</span></summary>${KZ.ogrenilen.length ? `<div class="c48-kzl">${KZ.ogrenilen.map((p) => kz(p, M)).join('')}</div>` : '<p class="small mut">Henüz öğrenildi sayılan kazanım yok (en az 2 cevap ve %80 başarı).</p>'}</details>
<p class="small mut c48-not">${hesap ? 'Bu veriler hesabınla eşitlenir; aynı hesapla girdiğin cihazlarda da görünür.' : 'Bu veriler bu cihazda saklanır. Google ile giriş yaparsan (Profilim) başka cihazlarla eşitlenebilir.'}</p></div>`;
  };

  /* ---------- Altın koridor: “Çalışma masası” girişi (araç şeridinden ayrı) ---------- */
  K.masaSVG = () => `<svg class="c48-msv" viewBox="0 0 120 80" aria-hidden="true" focusable="false"><defs><linearGradient id="c48m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4a22"/><stop offset="1" stop-color="#3e2410"/></linearGradient><radialGradient id="c48m2" cx="50%" cy="20%" r="70%"><stop offset="0" stop-color="#ffe4a0" stop-opacity=".75"/><stop offset="1" stop-color="#ffe4a0" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="60" cy="30" rx="56" ry="30" fill="url(#c48m2)"/><path d="M8 52h104l-8 8H16z" fill="url(#c48m1)"/><path d="M8 52h104" stroke="#e2b765" stroke-width="1.4"/><path d="M20 60v16M100 60v16" stroke="#3e2410" stroke-width="4"/>
<path d="M34 50c8-5 18-5 26 0 8-5 18-5 26 0v-20c-8-5-18-5-26 0-8-5-18-5-26 0z" fill="#f4e7c8" stroke="#b98a3e" stroke-width="1.2"/><path d="M60 30v20" stroke="#b98a3e"/><path d="M40 36h14M40 41h12M66 36h14M66 41h12" stroke="#b98a3e" stroke-width="1" opacity=".7"/>
<path d="M94 50V22l-10-8" fill="none" stroke="#c9a35a" stroke-width="2"/><path d="M76 12l14-2 4 9z" fill="#d6a84a"/><circle cx="87" cy="17" r="5" fill="#ffe9b3" opacity=".6"/></svg>`;
  K.masa = function () {
    if (typeof view === 'undefined' || view !== 'pdunya') return; const p = document.getElementById('p40'); if (!p || p.querySelector('.c48-masa')) return;
    const yer = p.querySelector('.s47') || p.querySelector('.sahne40'); if (!yer) return;
    const o = C.oku(), bg = o.gun[tarih(new Date())] || 0; let st = {due: 0, wrong: 0}; try { st = V30.stats(); } catch (e) {}
    yer.insertAdjacentHTML('afterend', `<section class="c48-masa" aria-labelledby="c48m-h"><button type="button" class="c48-mb" onclick="go('calis45')"><span class="c48-mg">${K.masaSVG()}</span><span class="c48-mt"><small>Okuma salonu</small><b id="c48m-h">Çalışma Masası</b><span>Çalışma Merkezim · bugün ${bg}/${o.hedef} cevap${st.due ? ` · ${st.due} kart tekrarda` : ''}${st.wrong ? ` · ${st.wrong} yanlış` : ''}</span></span><span class="c48-mh">${K.halka(bg, o.hedef, 58)}</span></button></section>`);
  };
  const d0 = draw;
  draw = function () { const r = d0.apply(this, arguments); try { K.masa(); } catch (e) { console.warn('[V48] masa', e); } return r; };
})();
