/* ===================== V57.0 (1/4): tema seçenekleri birleştirildi =====================
   V56'da Altın ve Öğretmen temaları tek bir ortak temayla değiştirilmişti; bu YANLIŞTI. V57'de:
   • Altın: mevcut beş tema aynen (Altın Mihrap, Gece Lacivert, Zümrüt Kütüphane, Mürekkep ve Bakır, Kum Taşı) + Elmas temaları
     (Açık, Koyu, Otomatik). Görünüm: Gündüz · Gece · Otomatik. Kayıt: dk-tema54.altin + dk-ptema43 (V54/V43, değişmedi).
   • Öğretmen Modu: mevcut beş tema aynen + Elmas temaları (Açık, Koyu, Otomatik). Kayıt: dk-tema54.ogretmen + ogretmenMod (yeni değer
     'oto' = cihaz teması).
   • Elmas: değişmedi (Açık / Koyu / Otomatik; dk-theme, dk-tema47).
   • “Elmas” teması Altın'da: Altın'ın sabit renkleri Elmas paletine eşlenir (derlemede üretilir); Öğretmen'de: --t37/--t38 Elmas paleti.
   Seçilen tema o modun bütün ekranlarına uygulanır (Altın'da renkler değişkenlerle, sabit renkler derlemede üretilen tablolarla). */
(function () {
  if (!window.V54 || !V54.Tema || typeof V43 === 'undefined') return;
  const V57 = window.V57 = window.V57 || {};
  const TM = V54.Tema, T = V57.Tema = {};
  const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: light)') : {matches: false};
  const ls = {al: (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } }, yaz: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }};
  const ORN = (window.V55 && V55.Tema && V55.Tema.ORNEK) || {};
  T.ELMAS = {gece: ['#0B1020', '#4F7CFF', '#131A2D'], gunduz: ['#F3F5FA', '#3B63E0', '#FFFFFF']};
  if (!TM.LISTE.some((t) => t[0] === 'elmas')) TM.LISTE.push(['elmas', 'Elmas', 'Elmas Mod renkleri', ['#0B1020', '#E2B765', '#131A2D'], ['#F3F5FA', '#7A5012', '#FFFFFF']]);
  T.EL = [['gunduz', 'Açık', 'Elmas · açık'], ['gece', 'Koyu', 'Elmas · koyu'], ['oto', 'Otomatik', 'Cihaz temasına göre']];

  // görünüm (gündüz/gece/otomatik)
  T.mod = (yer) => (yer === 'altin' ? (V43.tercih ? V43.tercih() : 'gece') : ((TM.oku().ogretmenMod) || 'gece'));
  T.cozum = (m) => (m === 'oto' ? (mq.matches ? 'gunduz' : 'gece') : m);
  const uy0 = TM.uygula;
  TM.uygula = function () {
    const r = uy0.apply(this, arguments);
    try { const o = TM.oku(); if (o.ogretmenMod === 'oto') document.documentElement.setAttribute('data-tema54om', T.cozum('oto')); } catch (x) {}
    return r;
  };
  const mod0 = TM.mod;
  TM.mod = function (yer, m) {
    if (m !== 'oto') return mod0.apply(this, arguments);
    if (yer === 'altin') { try { V43.ayarla('oto'); } catch (x) {} const g = ls.al('dk-gorunum54') || {v: 1}; g.altin = 1; ls.yaz('dk-gorunum54', g); }
    else { const r = TM.oku(); r.ogretmenMod = 'oto'; ls.yaz(TM.K, r); TM.uygula(); }
    TM.yenile(yer);
  };
  try { mq.addEventListener('change', () => { try { TM.uygula(); } catch (x) {} }); } catch (x) {}
  T.elmas = function (yer, m) { TM.sec(yer, 'elmas'); TM.mod(yer, m); };

  const kutu = (c) => `<span class="tm57-o" aria-hidden="true" style="background:${c[0]}"><i style="background:${c[2] || c[0]}"></i><b style="background:${c[1]}"></b></span>`;
  TM.icerik = function (yer) {
    const r = TM.oku(), a = r[yer] || 'altin', m = T.mod(yer), c = T.cozum(m), oto = (m === 'oto');
    const modlar = `<div class="gg54 tm57-m" role="group" aria-label="Görünüm">${[['gunduz', '☀ Gündüz'], ['gece', '☾ Gece'], ['oto', '◐ Otomatik']].map(([k, ad]) => `<button type="button" aria-pressed="${m === k}" onclick="V54.Tema.mod('${yer}','${k}')">${ad}</button>`).join('')}</div>`;
    const kendi = TM.LISTE.filter((t) => t[0] !== 'elmas').map(([k, ad, ack, g, d]) => { const o = (ORN[k] && ORN[k][c]) || (c === 'gunduz' ? d : g); const on = k === a; return `<button type="button" role="radio" aria-checked="${on}" class="tm54-k tm57-k ${on ? 'on' : ''}" onclick="V54.Tema.sec('${yer}','${k}')">${kutu(o)}<span><b>${ad}</b><small>${ack}</small></span></button>`; }).join('');
    const elmas = T.EL.map(([k, ad, ack]) => { const on = a === 'elmas' && m === k, o = T.ELMAS[T.cozum(k)]; return `<button type="button" role="radio" aria-checked="${on}" class="tm54-k tm57-k ${on ? 'on' : ''}" onclick="V57.Tema.elmas('${yer}','${k}')">${k === 'oto' ? '<span class="tm57-o oto" aria-hidden="true"></span>' : kutu(o)}<span><b>Elmas · ${ad}</b><small>${ack}</small></span></button>`; }).join('');
    return `${modlar}<h4 class="tm57-h">${yer === 'altin' ? 'Altın temaları' : 'Öğretmen temaları'}</h4><div class="tm54" role="radiogroup" aria-label="${yer === 'altin' ? 'Altın temaları' : 'Öğretmen temaları'}">${kendi}</div>
<h4 class="tm57-h">Elmas temaları</h4><div class="tm54 tm57-el" role="radiogroup" aria-label="Elmas temaları">${elmas}</div>
<p class="tm57-n">Görünüm (gündüz/gece) ve tema ayrı ayrı saklanır. ${oto ? 'Otomatik: cihazın açık/koyu ayarını izler.' : ''}</p>`;
  };

  // Öğretmen Modu'nda Elmas teması: --t37/--t38 Elmas paletinden
  const OGR = {
    gunduz: {'t37-bg': '#F3F5FA', 't37-card': '#FFFFFF', 't37-card2': '#F5F7FB', 't37-line': '#DCE2EE', 't37-line2': '#C3CCDD', 't37-ink': '#0B1020', 't37-mut': '#4A5670', 't37-act': '#2E54C8', 't37-on': '#FFFFFF', 't37-steel': '#2E54C8', 't37-steel2': '#3B63E0', 't37-soft': '#E8EEFC', 't37-bas': '#4A5670', 't37-plan': '#2646B0', 't37-ok': '#15803D', 't37-tek': '#92400E', 't37-kz-bg': '#EEF3FE', 't37-kz-line': '#3B63E0', 't37-kz-ink': '#0B1020', 't37-kz-code': '#DCE6FB', 't38-g1': '#3B63E0', 't38-g2': '#2646B0', 't38-gt': '#FFFFFF', 't38-gold': '#3B63E0', 't38-ring': 'rgba(59,99,224,.28)', 't38-sh': '0 1px 2px rgba(15,23,42,.06),0 6px 18px rgba(15,23,42,.08)'},
    gece: {'t37-bg': '#0B1020', 't37-card': '#131A2D', 't37-card2': '#19243A', 't37-line': '#26324D', 't37-line2': '#34446A', 't37-ink': '#F0F3FA', 't37-mut': '#A4AEC2', 't37-act': '#9DB6FF', 't37-on': '#0B1020', 't37-steel': '#9DB6FF', 't37-steel2': '#7B9BFF', 't37-soft': '#1A2645', 't37-bas': '#A4AEC2', 't37-plan': '#9DB6FF', 't37-ok': '#4ADE80', 't37-tek': '#F6D58B', 't37-kz-bg': '#141E36', 't37-kz-line': '#7B9BFF', 't37-kz-ink': '#F0F3FA', 't37-kz-code': '#22305A', 't38-g1': '#4F7CFF', 't38-g2': '#3E69F0', 't38-gt': '#FFFFFF', 't38-gold': '#7B9BFF', 't38-ring': 'rgba(79,124,255,.3)', 't38-sh': '0 1px 2px rgba(0,0,0,.4),0 8px 22px rgba(0,0,0,.3)'}
  };
  const B5 = 'body[data-ogrt37][data-ogrt37][data-ogrt37][data-ogrt37][data-ogrt37]';
  let css = Object.entries(OGR).map(([m, v]) => `html[data-tema54o="elmas"][data-tema54om="${m}"] ${B5}{${Object.entries(v).map(([a, b]) => `--${a}:${b}`).join(';')}}`).join('\n');
  try { const cs = getComputedStyle(document.documentElement); ['t38-sil', 't38-mt'].forEach((v) => { const d = cs.getPropertyValue('--' + v); if (d && /B8894A/i.test(d)) css += `\nhtml[data-tema54o="elmas"] ${B5}{--${v}:${d.trim().replace(/%23B8894A/gi, '%235B7CEB')}}`; }); } catch (x) {}
  css += `
html[data-tema54o="elmas"][data-tema54om="gunduz"] body[data-ogrt37]{color-scheme:light}
html[data-pt43="gunduz"][data-tema54a="elmas"] body[data-prem39][data-prem39]{--p-on-gold:#FFFFFF}
.tm57-h{margin:14px 2px 8px;font-size:.88rem;color:var(--p-mut,var(--mut));letter-spacing:.02em}
.tm57-m{grid-template-columns:repeat(3,1fr)!important}
.tm57-k{position:relative}
.tm57-o{position:relative;display:block;width:58px;height:42px;flex:none;border-radius:10px;overflow:hidden;border:1px solid rgba(127,127,127,.35)}
.tm57-o i{position:absolute;left:8px;right:8px;bottom:6px;height:14px;border-radius:5px}.tm57-o b{position:absolute;right:8px;top:6px;width:12px;height:12px;border-radius:50%}
.tm57-o.oto{background:linear-gradient(135deg,#F3F5FA 50%,#0B1020 50%)}
.tm57-n{margin:10px 0 0;color:var(--p-mut,var(--mut));font-size:.84rem}
body[data-prem39] .tm57-k.on,body[data-prem39] .tm57-m button[aria-pressed="true"]{border-color:var(--p-gold);box-shadow:0 0 0 2px var(--p-gold) inset;background:color-mix(in srgb,var(--p-gold) 14%,var(--p-card))}
body[data-ogrt37] .tm57-k.on,body[data-ogrt37] .tm57-m button[aria-pressed="true"]{border-color:var(--t37-act);box-shadow:0 0 0 2px var(--t37-act) inset}
`;
  try { const st = document.createElement('style'); st.id = 'v57-tema-css'; st.textContent = css; document.head.appendChild(st); } catch (x) {}
  try { TM.uygula(); } catch (x) {}
})();
