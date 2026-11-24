/* ===================== V47.0: Ders Atmosferi kataloğu =====================
   Derleme (build470.py) V33'te listeden çıkarılmış sentez seslerinin (ney, kanun, koro, ezgi, ışık damlaları, ambient,
   derin odak) katalog kayıtlarını, üreticilerini ve onlara bağlı hazır karışımları koddan siler.
   Burada: kaydı olmayan kategori listede gösterilmez (ör. lisanslı enstrüman kaydı yoksa o başlık görünmez) ve
   kullanıcının eski kayıtlarındaki (favori, kayıtlı karışım, oynatma sırası, son karışım) artık bulunmayan sesler temizlenir. */
(function () {
  if (typeof ATM === 'undefined') return;
  const V47 = window.V47 = window.V47 || {};
  const S = V47.Ses = {};
  // kaydı olan kategoriler
  S.kategoriler = () => ATM.CAT.filter((c) => ATM.S.some((s) => s.cat === c.id));
  const tb0 = ATM.tabBody;
  ATM.tabBody = function () { const C = ATM.CAT; ATM.CAT = S.kategoriler(); try { return tb0.apply(this, arguments); } finally { ATM.CAT = C; } };
  // eski kayıtlarda bozuk bağlantı bırakma
  S.temizle = function () {
    try {
      const j0 = JSON.stringify(ATM.st);
      if (typeof V33 !== 'undefined' && V33.sanAtm) V33.sanAtm();
      else { const ok = (id) => !!ATM.byId(id); ATM.st.L = ATM.st.L.filter((l) => ok(l.id)); ATM.st.fav = ATM.st.fav.filter(ok); }
      if (JSON.stringify(ATM.st) !== j0) ATM.save();
    } catch (e) { console.warn('[V47] ses kaydı temizliği', e); }
  };
  S.temizle();
  // durum özeti (ayar merkezi ve Profilim için)
  S.durum = function () {
    const R = ATM.rt, L = ATM.st.L.map((l) => ({id: l.id, s: ATM.byId(l.id), on: l.on !== false, v: l.v})).filter((x) => x.s);
    return {calisiyor: !!R.playing, duraklatildi: !!R.paused, katman: L, ad: ATM.st.name || '', ses: ATM.st.vol, kalan: R.tEnd ? Math.max(0, Math.round((R.tEnd - Date.now()) / 60000)) : 0};
  };
})();
