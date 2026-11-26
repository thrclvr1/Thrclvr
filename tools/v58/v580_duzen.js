/* ===================== V58.0 (3/4): anlatım ekranı (Altın gece) ve APK üst boşluğu =====================
   1) Anlatım ekranındaki yan beyazlık — kök neden: V43, Altın konu ekranındaki bütün sekme bölmelerine (.p39-pane) “krem kâğıt”
      sınıfını (p43-kagit) gündüz/gece ayırmadan ekliyordu. Bu sınıf bölmenin içini gündüz paletine çevirir; gece görünümünde
      koyu sayfanın ortasında beyaz bir blok kalıyor, bölmenin iç kenar boşlukları metnin iki yanında beyaz şeritler gibi
      görünüyordu. Düzeltme: krem kâğıt yalnız GÜNDÜZ görünümünde; gece görünümünde bölme temanın kendi gece renklerini kullanır
      (yazı tipleri, içerik sırası ve düzen aynı). Gündüz/gece değişince bölme hemen güncellenir.
   2) APK üst boşluğu — kök neden: Android sarmalayıcısı (MainActivity) durum çubuğu kadar üst boşluğu kendisi ekliyor
      (root.setPadding) ama pencere kenar bilgisini (WindowInsets) tüketmeden WebView'a da iletiyordu. Kenar bilgisini alan WebView
      sürümlerinde sayfadaki env(safe-area-inset-top) da durum çubuğu yüksekliğini veriyor ve body'nin padding-top'u aynı
      boşluğu İKİNCİ kez ekliyordu (Elmas ve Altın'da üstte boş şerit). Düzeltme: MainActivity boşluğu uyguladıktan sonra
      kenar bilgisini tüketir (WebView'a 0 gider); ayrıca APK içinde sayfa tarafında da üst güvenli alan boşluğu eklenmez
      (html[data-apk58]) — durum çubuğu boşluğunu yalnız uygulama verir. Tarayıcıda (APK dışı) davranış aynı. */
(function () {
  if (typeof V43 === 'undefined') return;
  const V58 = window.V58 = window.V58 || {};
  const D = V58.Duzen = {};
  D.gece = () => { try { return V43.premAktif() && V43.cozum() === 'gece'; } catch (x) { return false; } };
  D.kagit = function () {
    const g = D.gece();
    document.querySelectorAll('.p39-ders .p39-pane').forEach((p) => { if (g) p.classList.remove('p43-kagit'); else if (V43.premAktif()) p.classList.add('p43-kagit'); p.classList.toggle('gc58', g); });
  };
  const k0 = V43.kagit;
  V43.kagit = function () { const r = k0.apply(this, arguments); try { D.kagit(); } catch (x) {} return r; };
  const u0 = V43.uygula;
  V43.uygula = function () { const r = u0.apply(this, arguments); try { D.kagit(); } catch (x) {} return r; };
  // V39.tab sekme bölmesini yeniden çizer
  try { if (window.V39 && V39.tab) { const t0 = V39.tab; V39.tab = function () { const r = t0.apply(this, arguments); try { D.kagit(); } catch (x) {} return r; }; } } catch (x) {}

  // APK: üst güvenli alanı yalnız uygulama verir
  D.apk = () => { try { return !!(window.V51 && V51.Android && V51.Android.mi()); } catch (x) { return false; } };
  if (D.apk()) document.documentElement.setAttribute('data-apk58', '');

  try {
    const st = document.createElement('style'); st.id = 'v58-duzen-css';
    st.textContent = `
html[data-apk58] body{padding-top:0!important}
html[data-pt43="gece"] body[data-prem39] .p39-ders .p39-pane.gc58{background:linear-gradient(180deg,color-mix(in srgb,var(--p-card2) 70%,var(--p-card)),var(--p-card));color:var(--p-ink);border-color:var(--p-line)}
html[data-pt43="gece"] body[data-prem39] .p39-ders .p39-pane.gc58 .p39-read{max-width:none;margin:0;padding:0;background:transparent;box-shadow:none;border-radius:0;color:var(--p-ink)}
html[data-pt43="gece"] body[data-prem39] .p39-ders .p39-pane.gc58 .p39-blk h3{color:var(--p-ink)}
html[data-pt43="gece"] body[data-prem39] .p39-ders .p39-pane.gc58 .p39-blk .blk-lab{color:var(--p-gold-t,var(--p-gold))}
html[data-pt43="gece"] body[data-prem39] .p39-ders .p39-pane.gc58 .p39-blk.k-kavram{background:color-mix(in srgb,var(--p-gold) 13%,var(--p-card2));border-left-color:var(--p-gold)}
html[data-pt43="gece"] body[data-prem39] .p39-ders .p39-pane.gc58 :is(.p39-blk.k-ornek,.p39-blk.k-gunluk){background:color-mix(in srgb,var(--p-ink) 6%,var(--p-card2))}
html[data-pt43="gece"] body[data-prem39] .p39-ders .p39-pane.gc58 .p39-blk.k-dusun{background:color-mix(in srgb,#5b7aa8 18%,var(--p-card2));border-left-color:#8aa6d4}
@media (max-width:480px){body[data-prem39] .p39-ders{padding-left:10px;padding-right:10px}body[data-prem39] .p39-pane{padding-left:14px;padding-right:14px}}
`;
    document.head.appendChild(st);
  } catch (x) {}
  const dr0 = draw;
  window.draw = draw = function () { const r = dr0.apply(this, arguments); try { D.kagit(); } catch (x) {} return r; };
})();
