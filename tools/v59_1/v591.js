/* ===================== V59.1: kazanım kartı temaya göre; Bağlantılar yalnız Altın =====================
   1) Öğretmen kazanım kartı: V59.0'da her temada aynı altın kart vardı. Artık her öğretmen temasında o temanın KENDİ renginin
      daha koyu tonuyla çizilir (Altın Mihrap: koyu altın-kahve, Lacivert: lacivert, Zümrüt: yeşil, Mürekkep: mor, Kum Taşı:
      kum, Elmas: mavi). Kod rozeti, “İçeriği aç” ve kurdele temanın vurgu rengini (beş temada altın, Elmas'ta mavi) kullanır.
      Hiyerarşi ve metinler V59.0 ile aynı.
   2) Bağlantılar (Kavram Haritası) yalnız Altın'da: Elmas'ta (editör dahil) go('links') Bilgi Atlası'na yönlenir; kavram
      penceresindeki “Kavram haritasında gör”, konu sayfasındaki harita düğmesi ve Bağlantılar'a giden bütün düğmeler Elmas'ta
      gösterilmez. Editörün yönetim ekranı (Yönetim › Bağlantılar › “Bağlantılar › Yönetim”) Elmas'ta da açılır, ama orada
      Kavram Haritası sekmesi yoktur. */
(function () {
  const V59 = window.V59 = window.V59 || {};
  const B = V59.Bag = {};
  const altin = () => { try { return !!V39.on; } catch (x) { return false; } };
  const editor = () => { try { return typeof V38 !== 'undefined' && V38.edOk(); } catch (x) { return false; } };
  B.yonetimMi = (a) => !!(a && a.lk && a.lk.tab === 'yonetim');
  B.SEC = `.v34f, .lk-see, [onclick*="go('links'"], [onclick*='go("links"'], [onclick*="V34.see"], [onclick*="seeConcept"], nav.bnav [data-k="links"]`;
  B.temizle = function (kok) {
    if (altin()) return;
    (kok || document).querySelectorAll(B.SEC).forEach((el) => {
      const oc = el.getAttribute('onclick') || '';
      if (/yonetim/.test(oc) && editor()) return;          // editörün yönetim girişi
      el.remove();
    });
  };
  // go: Elmas'ta Bağlantılar yok (editör yalnız Yönetim sekmesiyle)
  const g0 = go;
  window.go = go = function (v, a) {
    try {
      if (v === 'links' && !altin() && !(editor() && B.yonetimMi(a))) {
        try { UI.toast('Bağlantılar ve Kavram Haritası Altın Öğrenme Alanı’nda.'); } catch (x) {}
        try { G.atl = 'kavram'; } catch (x) {}
        return g0.call(this, 'atlas57');
      }
    } catch (x) {}
    return g0.apply(this, arguments);
  };
  // V34 içinden (sekme/seçim) haritaya geçiş: Elmas'ta yalnız Yönetim
  try {
    const r0 = V34.render;
    V34.render = function () {
      try { if (!altin() && view === 'links') { const S = V34.S(); if (!editor()) { setTimeout(() => go('atlas57')); return; } if (S.tab !== 'yonetim') S.tab = 'yonetim'; } } catch (x) {}
      const r = r0.apply(this, arguments);
      try { if (!altin() && view === 'links') document.querySelectorAll('#app .lk-tabs button').forEach((b) => { if (!/Yönetim/.test(b.textContent)) b.remove(); }); } catch (x) {}
      return r;
    };
  } catch (x) {}
  // kavram penceresi (V31.body): Elmas'ta “Kavram haritasında gör” eklenmez
  try {
    const b0 = V31.body;
    V31.body = function () { const s = b0.apply(this, arguments); return altin() ? s : String(s).replace(/<div class="v34f">[\s\S]*?<\/div>/g, ''); };
  } catch (x) {}
  // çizim sonrası ve sonradan açılan pencereler
  const d0 = draw;
  window.draw = draw = function () { const r = d0.apply(this, arguments); try { B.temizle(); } catch (x) {} return r; };
  try { new MutationObserver((L) => { if (altin()) return; for (const m of L) for (const n of m.addedNodes) if (n.nodeType === 1) { if (n.matches && n.matches(B.SEC)) B.temizle(n.parentNode || document); else if (n.querySelector && n.querySelector(B.SEC)) B.temizle(n); } }).observe(document.body, {childList: true, subtree: true}); } catch (x) {}

  /* ---------- kazanım kartı: tema paleti ---------- */
  // [tema, görünüm, üst zemin, alt zemin, kenar, yazı, ikincil yazı, vurgu1, vurgu2, vurgu yazısı]
  const P = [
    ['altin', 'gunduz', '#E6D3B2', '#F0E4CF', '#A97B37', '#241B10', '#4E3D27', '#9C6B2C', '#6F4518', '#FFFFFF'],
    ['altin', 'gece', '#2B1F0E', '#1C150B', '#C9A25E', '#F5EBD6', '#D9C9AC', '#E9C784', '#B58740', '#1A1206'],
    ['lacivert', 'gunduz', '#CFD9EA', '#E0E6F1', '#5E7299', '#16213A', '#3A4761', '#9C6B2C', '#6F4518', '#FFFFFF'],
    ['lacivert', 'gece', '#0F1D3A', '#0A1428', '#A8843F', '#EDF1F8', '#B9C4D6', '#E9C784', '#B58740', '#1A1206'],
    ['zumrut', 'gunduz', '#CCE0D4', '#DEEBE3', '#4F7D69', '#14261F', '#34503F', '#9C6B2C', '#6F4518', '#FFFFFF'],
    ['zumrut', 'gece', '#0C261C', '#081A12', '#A9883F', '#EEF5F1', '#B3C9BE', '#E9C784', '#B58740', '#1A1206'],
    ['murekkep', 'gunduz', '#E0D0E2', '#EBE0EC', '#80628A', '#23182A', '#4C3D54', '#9C6B2C', '#6F4518', '#FFFFFF'],
    ['murekkep', 'gece', '#25172F', '#190F21', '#AA6E44', '#F3EDF5', '#C6B8CB', '#E9C784', '#B58740', '#1A1206'],
    ['kumtasi', 'gunduz', '#E5D3BC', '#EFE3D2', '#A0784E', '#2A1F15', '#54442F', '#9C6B2C', '#6F4518', '#FFFFFF'],
    ['kumtasi', 'gece', '#2C2014', '#1E160E', '#A8733F', '#F5EEE6', '#CDBDAB', '#E9C784', '#B58740', '#1A1206'],
    ['elmas', 'gunduz', '#CCD9FA', '#DFE7FB', '#3B63E0', '#0B1020', '#2A3552', '#3B63E0', '#2646B0', '#FFFFFF'],
    ['elmas', 'gece', '#11214F', '#0B1638', '#7B9BFF', '#F0F3FA', '#B9C4E0', '#3B63E0', '#2646B0', '#FFFFFF']
  ];
  const K = 'body[data-ogrt37][data-ogrt37] .ogw-c.c-kaz';
  let css = P.map(([t, m, z1, z2, ln, ink, mut, g1, g2, gt]) => `html[data-tema54o="${t}"][data-tema54om="${m}"] ${K}{--kz59-z1:${z1};--kz59-z2:${z2};--kz59-line:${ln};--kz59-ink:${ink};--kz59-mut:${mut};--kz59-g1:${g1};--kz59-g2:${g2};--kz59-gt:${gt};--t37-kz-code:${g2}}`).join('\n');
  css += `
${K}{background:linear-gradient(170deg,var(--kz59-z1),var(--kz59-z2) 72%)!important;border:1.5px solid var(--kz59-line)!important;
 box-shadow:0 0 0 1px color-mix(in srgb,var(--kz59-line) 24%,transparent),0 12px 30px -14px color-mix(in srgb,var(--kz59-line) 60%,transparent)!important}
${K} .ogw-ch b,${K} .ogw-ch,${K} .ogw-kt{color:var(--kz59-ink)!important}
${K} .v38-ks,${K} .ogw-ch small{color:var(--kz59-mut)!important}
${K} .ogw-kt+p.small{background:color-mix(in srgb,var(--kz59-line) 18%,transparent);border-color:color-mix(in srgb,var(--kz59-line) 45%,transparent);color:var(--kz59-ink)}
${K} .ogw-l code,${K} .ogw-kt code{background:linear-gradient(180deg,var(--kz59-g1),var(--kz59-g2))!important;color:var(--kz59-gt)!important;border-color:transparent!important}
${K} .ogw-more>summary{background:color-mix(in srgb,var(--kz59-z2) 55%,var(--t37-card,#fff))!important;color:var(--kz59-ink)!important;border-color:color-mix(in srgb,var(--kz59-line) 40%,transparent)!important}
${K} .v38-dv{color:var(--kz59-line)}
`;
  try { const st = document.createElement('style'); st.id = 'v591-css'; st.textContent = css; document.head.appendChild(st); } catch (x) {}
})();
