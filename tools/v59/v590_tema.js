/* ===================== V59.0 (2/3): Öğretmen kazanım kartı ve Elmas teması kalıntıları =====================
   1) Kazanım kartı (Öğretmen Modu › Haftalık): V38'in özel bileşeni (altın çerçeve, kurdele, altın kod rozeti, “İçeriği aç”).
      V57'de Öğretmen Modu'na eklenen Elmas teması kartın kendi değişkenlerini (--t37-kz-*, --t38-g1/g2) de maviye çeviriyordu;
      kart standart kartlardan ayrışmıyordu. Artık kart her temada kendi altın çerçevesini, kod rozetini ve “İçeriği aç”
      düğmesini korur; yüzeyi seçilen temanın gündüz/gece tonuna uyar.
      Hiyerarşi: kazanım kodu → kazanım metni → haftalar → İçeriği aç (en belirgin) → Taşı, değiştir veya çıkar.
      Metnin arkasındaki cami silueti kaldırıldı, köşe deseni hafifletildi (okunurluk). Metinler aynen.
   2) Elmas teması (Altın ve Öğretmen): derlemede yeniden üretilen renk tablosunun ulaşamadığı yerler — Altın arka plan deseni
      (SVG görseli) ve Öğretmen başlığındaki süsleme — Elmas tonuna çevrilir. */
(function () {
  const V59 = window.V59 = window.V59 || {};
  const K = 'body[data-ogrt37][data-ogrt37] .ogw-c.c-kaz';
  const css = `
/* kazanım kartı: kendi altın kimliği (bütün öğretmen temalarında) */
html[data-tema54om="gece"] ${K}{--kz59-g1:#E8C987;--kz59-g2:#B98A45;--kz59-gt:#1A1206;--kz59-line:#C9A25E;--kz59-ink:#F6EDDB;--kz59-mut:#D9CBB0;--kz59-z:var(--t37-card,#15120D)}
html[data-tema54om="gunduz"] ${K},html:not([data-tema54om]) ${K}{--kz59-g1:#A8752F;--kz59-g2:#7A4E14;--kz59-gt:#FFFFFF;--kz59-line:#B8894A;--kz59-ink:#2A1E11;--kz59-mut:#5C4A33;--kz59-z:var(--t37-card,#FFFFFF)}
${K}{--t37-kz-line:var(--kz59-line);--t37-kz-ink:var(--kz59-ink);--t37-kz-code:var(--kz59-g2);--t38-g1:var(--kz59-g1);--t38-g2:var(--kz59-g2);--t38-gt:var(--kz59-gt);--t38-gold:var(--kz59-line);
 border:1.5px solid var(--kz59-line)!important;background:linear-gradient(160deg,color-mix(in srgb,var(--kz59-z) 90%,var(--kz59-g1)),var(--kz59-z) 70%)!important;
 box-shadow:0 0 0 1px color-mix(in srgb,var(--kz59-line) 28%,transparent),0 10px 28px -14px color-mix(in srgb,var(--kz59-g2) 55%,transparent)!important}
${K} .v38-mt{opacity:.12;width:42%;height:110px}
${K} .ogw-k{background:none!important}
${K} .ogw-ch b{color:var(--kz59-ink)}
${K} .v38-ks{color:var(--kz59-mut)}
${K} .ogw-l code,${K} .ogw-kt code{font-size:1.06rem;padding:6px 16px}
${K} .ogw-kt{font-size:1.24rem;line-height:1.45;font-weight:750;color:var(--kz59-ink);margin:10px 0 8px;max-width:none}
${K} .ogw-kt+p.small{display:inline-flex;align-items:center;gap:6px;margin:2px 0 4px;padding:5px 12px;border-radius:999px;font-size:.9rem;font-weight:600;color:var(--kz59-ink);background:color-mix(in srgb,var(--kz59-line) 16%,transparent);border:1px solid color-mix(in srgb,var(--kz59-line) 40%,transparent)}
${K} .ogw-kr .ogw-b.p{min-height:58px;font-size:1.08rem;font-weight:800;letter-spacing:.01em;background:linear-gradient(180deg,var(--kz59-g1),var(--kz59-g2))!important;color:var(--kz59-gt)!important;border:0!important;box-shadow:0 10px 22px -10px color-mix(in srgb,var(--kz59-g2) 80%,transparent),0 0 0 1px color-mix(in srgb,var(--kz59-g1) 50%,transparent) inset}
${K} .ogw-kr .ogw-b.p:active{transform:translateY(1px)}
${K} .ogw-more>summary{font-weight:600}
/* Elmas teması: tablo dışında sabit renkli kalan Altın parçaları (koridor düğmeleri, bilgi şeridi, alt menü kenarı) */
html[data-tema54a="elmas"] body[data-prem39] :is(.yon40,.bil40){background:color-mix(in srgb,var(--p-card) 84%,transparent)!important;border-color:color-mix(in srgb,var(--p-gold) 45%,transparent)!important;color:var(--p-ink)!important}
html[data-tema54a="elmas"] body[data-prem39] #bn50{border-color:color-mix(in srgb,var(--p-gold) 45%,transparent)!important}
/* Öğretmen Modu Elmas teması: sabit bronz seçili düğme (Kazanım listesi “Tümü/…” süzgeci) */
html[data-tema54o="elmas"] body[data-ogrt37][data-ogrt37] .og-seg2 button.on{background:var(--t38-g1,#3B63E0)!important;color:var(--t38-gt,#fff)!important}
html[data-tema54o="elmas"] body[data-ogrt37][data-ogrt37] .og-seg2 button.on *{color:var(--t38-gt,#fff)!important}
/* Elmas teması: Sureler ve Dualar düğmesi (sabit altın kenar) ve Profilim başlık kartının altın ışığı (V57 Elmas kuralı) */
html[data-tema54a="elmas"] body[data-prem39] .sd-btn:not(.yt){border-color:color-mix(in srgb,var(--p-gold) 55%,transparent)!important;background:color-mix(in srgb,var(--p-gold) 12%,transparent)!important}
html[data-pt43][data-tema54a="elmas"] body[data-prem39] .pr49-ust.al{background:radial-gradient(90% 120% at 100% 0%,color-mix(in srgb,var(--p-gold) 28%,transparent),transparent 60%),linear-gradient(140deg,#19243A,#0B1020 65%)!important;border:1px solid color-mix(in srgb,var(--p-gold) 35%,transparent)!important}
/* Elmas teması: arka plan deseni ve öğretmen başlığı süslemesi */
html[data-tema54a="elmas"] body[data-prem39]::after{filter:hue-rotate(190deg) saturate(.75)}
html[data-tema54o="elmas"] body[data-ogrt37] .og-top::after,html[data-tema54o="elmas"] body[data-ogrt37] .og-top::before{filter:hue-rotate(190deg) saturate(.7)}
`;
  try { const st = document.createElement('style'); st.id = 'v59-tema-css'; st.textContent = css; document.head.appendChild(st); } catch (x) {}
})();
