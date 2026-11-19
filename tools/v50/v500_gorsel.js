/* ===================== V50.0: Elmas ve Altın sınıfı görselleri (kullanıcının verdiği orijinal görseller) =====================
   Kaynak: kaynaklar/v50-gorsel/elmas-kutuphane.png, altin-kutuphane.png (1672×941). Uygulamaya oran ve renk değiştirilmeden
   yalnız boyutu küçültülmüş WebP kopyaları gömülür (1280×720): text/plain betik blokları g50-elmas ve g50-altin (base64).
   Görseller bir kez blob adresine çevrilir; seçim ekranı kartlarında, ayar önizlemelerinde ve mod panelinde kullanılır.
   Filtre, renk düzeltmesi ya da üzerine yazı/işaret eklenmez. Blob oluşturulamazsa V49 vektör görseli yedek olarak kalır. */
(function () {
  const V48 = window.V48 = window.V48 || {}, Gr = V48.Gorsel = V48.Gorsel || {};
  const V50 = window.V50 = window.V50 || {};
  const G = V50.Gorsel = {url: {}};
  const yedek = {elmas: Gr.elmas, altin: Gr.altin};
  G.adres = function (ad) {
    if (G.url[ad]) return G.url[ad];
    try {
      const el = document.getElementById('g50-' + ad); if (!el) return '';
      const b = atob(el.textContent.trim()), u = new Uint8Array(b.length);
      for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
      G.url[ad] = URL.createObjectURL(new Blob([u], {type: 'image/webp'}));
    } catch (e) { G.url[ad] = ''; }
    return G.url[ad];
  };
  const ALT = {elmas: 'Elmas Sınıfı: mavi ışıklı kristal kütüphane', altin: 'Altın Sınıfı: sıcak ışıklı altın kütüphane'};
  G.img = (ad, cls) => { const u = G.adres(ad); return u ? `<img class="g50 g50-${ad} ${cls || ''}" src="${u}" alt="${ALT[ad]}" width="1280" height="720" decoding="async" draggable="false">` : ''; };
  Gr.elmas = function (id) { return G.img('elmas') || (yedek.elmas ? yedek.elmas(id) : ''); };
  Gr.altin = function (id) { return G.img('altin') || (yedek.altin ? yedek.altin(id) : ''); };
  Gr.kucuk = (k) => '<span class="g48-kap" style="display:block;overflow:hidden;width:100%;height:100%;border-radius:10px">' + (k === 'premium' ? Gr.altin('gk50a') : Gr.elmas('gk50e')) + '</span>';
})();
