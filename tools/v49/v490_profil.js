/* ===================== V49.0: Profilim (hesap ve ilerleme) yeni düzeni =====================
   Mevcut Profilim rotası (V46 + V47 Görünüm özeti + V48 Bildirimlerim) aynen çalışır; çizildikten sonra:
   - başlık → profil kartı (amblem, ad, hesap durumu, öğrenme alanı)
   - İlerlemem → istatistik kutuları (kazanım başarısı halkası, tamamlanan konu, içeriği hazır konu) + üç hızlı erişim kartı
     (Çalışma Merkezim, Sınıf sınıf ilerleme, Favorilerim)
   - Bildirimlerim → boş durumda simgeli, yönlendirici boş durum kartı
   - Görünüm ve ses → her satıra simge
   Hesap işlemleri (Google girişi, misafir, eşitleme, çıkış, sunucu ayarı), program sürümü ve öğretmen/editör bölümleri
   aynı düğmeleri ve işlevleri kullanır; yalnız görünümleri yenilenir. Veri ve anahtarlar değişmez. */
(function () {
  if (typeof V30 === 'undefined' || !V30.routes.profil46) return;
  const V49 = window.V49 = window.V49 || {};
  const Pr = V49.Profil = {};
  const AL = () => !!(typeof V39 !== 'undefined' && V39.on);
  const IK = {
    hedef: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
    kitap: '<path d="M12 6.5C10 5 6.5 4.5 3 5.2v13.3c3.5-.7 7 0 9 1.5 2-1.5 5.5-2.2 9-1.5V5.2c-3.5-.7-7-.2-9 1.3z"/><path d="M12 6.5V20"/>',
    onay: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.6 2.6L16.5 9"/>',
    grafik: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', yildiz: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/>',
    masa: '<path d="M3 13h18M5 13v7M19 13v7"/><path d="M7 13V9c2-1.4 4-1.4 5 0 1-1.4 3-1.4 5 0v4"/>',
    ok: '<path d="M9 6l6 6-6 6"/>', bayrak: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    tema: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', hareket: '<path d="M4 12h3l3-7 4 14 3-7h3"/>',
    ses: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.5 7.5 0 0 1 0 10.4"/>',
    atm: '<path d="M3 12h2M7 8v8M11 4v16M15 8v8M19 10v4"/>', kisi: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    bulut: '<path d="M7 18a4.5 4.5 0 1 1 .9-8.9A6 6 0 0 1 19.5 11 3.5 3.5 0 0 1 18 18z"/>'
  };
  const ik = (k, s) => `<svg width="${s || 22}" height="${s || 22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[k]}</svg>`;
  Pr.ik = ik;
  const halka = (y, metin, alt) => { const c = 2 * Math.PI * 30, d = y == null ? 0 : Math.max(0, Math.min(1, y / 100));
    return `<svg class="pr49-hl" viewBox="0 0 76 76" width="76" height="76" role="img" aria-label="${alt}"><circle cx="38" cy="38" r="30" class="pr49-hiz" fill="none" stroke-width="8"/><circle cx="38" cy="38" r="30" fill="none" class="pr49-hdl" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(c * d).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 38 38)"/><text x="38" y="43" text-anchor="middle" class="pr49-hs">${metin}</text></svg>`; };
  const tarih = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  Pr.ust = function () {
    let h = {mod: 'misafir'}; try { h = V46.Hesap.oku(); } catch (e) {}
    const g = h.mod === 'google' && h.oturum, ad = g ? ((h.kullanici && h.kullanici.ad) || 'Google hesabı') : 'Misafir öğrenci', al = AL();
    const amb = (window.V48 && V48.Gorsel) ? (al ? V48.Gorsel.altinAmblem(44, 'pra49') : V48.Gorsel.elmasAmblem(44, 'pre49')) : '';
    return `<section class="pr49-ust ${al ? 'al' : 'el'}" aria-label="Profil"><span class="pr49-av" aria-hidden="true">${ik('kisi', 30)}</span>
<span class="pr49-ad"><small>Profilim</small><b>${esc(ad)}</b><span class="pr49-cip"><i class="${g ? 'ok' : ''}">${ik(g ? 'bulut' : 'kisi', 14)}${g ? 'Hesapla eşitleniyor' : 'Misafir · bu cihazda'}</i><i>${al ? 'Altın Öğrenme Alanı' : 'Elmas Öğrenme Alanı'}</i></span></span>
<span class="pr49-amb" aria-hidden="true">${amb}</span></section>`;
  };
  Pr.ilerleme = function () {
    const st = V30.stats(), TP = (st.TP || []).length, pc = (a, b) => (b ? Math.min(100, Math.round(100 * a / b)) : 0);
    let cal = {gun: {}, hedef: 20}; try { cal = V45.Calis.oku(); } catch (e) {}
    const bg = cal.gun[tarih()] || 0; let fav = 0; try { const f = V39.ilr().fav || {}; fav = (f.s || []).length + (f.k || []).length; } catch (e) {}
    let son = ''; try { son = V39.ilr().sonSinif; } catch (e) {}
    return `<div class="pr49-bas"><h2>İlerlemem</h2><span class="pr49-not">Elmas ve Altın aynı kaydı kullanır</span></div>
<div class="pr49-ist">
 <div class="pr49-k pr49-k1">${halka(st.mast, st.mast == null ? '—' : '%' + st.mast, 'Kazanım başarısı ' + (st.mast == null ? 'henüz yok' : '%' + st.mast))}<span><b>Kazanım başarısı</b><small>${st.mast == null ? 'Soru çözdükçe hesaplanır' : 'Cevapladığın kazanımlarda'}</small></span></div>
 <div class="pr49-k"><span class="pr49-ki">${ik('onay', 20)}</span><b class="pr49-sy">${st.done}</b><span><b>Tamamlanan konu</b><small>Mini testte %70 ve üstü</small></span><span class="pr49-bar" aria-hidden="true"><i style="width:${pc(st.done, st.withC)}%"></i></span></div>
 <div class="pr49-k"><span class="pr49-ki">${ik('kitap', 20)}</span><b class="pr49-sy">${st.withC}<small>/${TP}</small></b><span><b>İçeriği hazır konu</b><small>%${pc(st.withC, TP)} hazır</small></span><span class="pr49-bar" aria-hidden="true"><i style="width:${pc(st.withC, TP)}%"></i></span></div>
</div>
<div class="pr49-hz" role="list">
 <button type="button" role="listitem" class="pr49-h" data-k="calis" onclick="go('calis45')"><span class="pr49-hi">${ik('masa', 22)}</span><span><b>Çalışma Merkezim</b><small>Bugün ${bg}/${cal.hedef} cevap</small></span>${ik('ok', 18)}</button>
 <button type="button" role="listitem" class="pr49-h" data-k="sinif" onclick="go('pilerleme')"><span class="pr49-hi">${ik('grafik', 22)}</span><span><b>Sınıf sınıf ilerleme</b><small>${son ? son + '. sınıfta kaldın' : '4–12. sınıflar'}</small></span>${ik('ok', 18)}</button>
 <button type="button" role="listitem" class="pr49-h" data-k="fav" onclick="go('pfav')"><span class="pr49-hi">${ik('yildiz', 22)}</span><span><b>Favorilerim</b><small>${fav ? fav + ' favori' : 'Henüz favori yok'}</small></span>${ik('ok', 18)}</button>
</div>`;
  };
  // Bildirimlerim: boş durum kartı (dolu liste V48 düzeniyle kalır)
  if (window.V48 && V48.Bildir && V48.Bildir.profilHTML) {
    const ph = V48.Bildir.profilHTML;
    V48.Bildir.profilHTML = function () {
      const L = V48.Bildir.oku().liste;
      if (L.length) return ph.apply(this, arguments).replace('<h2>Bildirimlerim</h2>', `<div class="pr49-bas"><h2>Bildirimlerim</h2><span class="pr49-sayi">${L.length}</span></div>`);
      return `<section class="card p46-s b48-p pr49-bos"><div class="pr49-bas"><h2>Bildirimlerim</h2></div><div class="pr49-bk"><span class="pr49-bi" aria-hidden="true">${ik('bayrak', 28)}</span><span><b>Henüz bildirim yok</b><small>Bir konuda ya da soruda hata görürsen, içeriğin sonundaki <em>İçerik hatası bildir</em> ve sorunun altındaki <em>Soruyu bildir</em> düğmeleriyle haber verebilirsin. Bildirimlerin ve durumları burada görünür.</small></span></div></section>`;
    };
  }
  const SATIR_IK = {alan: null, tema: 'tema', hareket: 'hareket', ses: 'ses', atmosfer: 'atm'};
  const pr0 = V30.routes.profil46;
  V30.routes.profil46 = function () {
    const r = pr0.apply(this, arguments);
    try {
      const hero = $.querySelector('section.hero'); if (hero) hero.outerHTML = Pr.ust();
      const S = [...$.querySelectorAll('section.p46-s')];
      const ilr = S.find((s) => /^İlerlemem$/.test(((s.querySelector('h2') || {}).textContent || '').trim()));
      if (ilr) { ilr.classList.add('pr49-ilr'); ilr.innerHTML = Pr.ilerleme(); }
      const hs = $.querySelector('.h46-hesap'); if (hs) hs.classList.add('pr49-hesap');
      $.querySelectorAll('.a47-oz').forEach((b) => { const k = ((b.getAttribute('onclick') || '').match(/at:'(\w+)'/) || [])[1]; if (!k || b.querySelector('.pr49-si')) return;
        const ic = k === 'alan' ? ((window.V48 && V48.Gorsel) ? (AL() ? V48.Gorsel.altinAmblem(20, 'prs49a') : V48.Gorsel.elmasAmblem(20, 'prs49e')) : '') : ik(SATIR_IK[k] || 'ok', 20);
        b.insertAdjacentHTML('afterbegin', `<span class="pr49-si" aria-hidden="true">${ic}</span>`); });
      $.querySelectorAll('section.p46-s, details.p46-s').forEach((s) => s.classList.add('pr49-s'));
      $.classList.add('pr49-sayfa');
    } catch (e) { console.warn('[V49] profil', e); }
    return r;
  };
  const d0 = draw;
  draw = function () { try { if (typeof view !== 'undefined' && view !== 'profil46') $.classList.remove('pr49-sayfa'); } catch (e) {} return d0.apply(this, arguments); };
})();
