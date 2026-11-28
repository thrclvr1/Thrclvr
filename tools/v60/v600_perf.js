/* ===================== V60.0: performans — Bilgi Atlası / arama kartları =====================
   Ölçüm (4× yavaş işlemci, CPU profili; tools/v59/olcum/cpu_profili.js atlas57): ekranın en pahalı işlevi V51.4'ün
   A.temizle'siydi (~200 ms). Her kavram/kişi kartının HTML'ini <template>'e ayrıştırıp seçicilerle tarıyor ve yeniden
   yazıyordu; kartların çoğunda temizlenecek hiçbir şey yoktu. Arama kutusuna her harf yazıldığında aynı kartlar yeniden işleniyordu.
   Düzeltme (çıktı birebir aynı):
     1) Hızlı yol: temizlenecek kalıpların hiçbiri metinde yoksa (paragraf/satır sonu/“Kitap s.”/kaynak-doğrulama sözcükleri)
        HTML olduğu gibi döner — eski yol da bu durumda içeriği değiştirmiyordu.
     2) Önbellek: aynı (seviye, HTML) için sonuç bir kez hesaplanır (en çok 1500 kayıt; dolunca sıfırlanır). */
(function () {
  if (typeof V51 === 'undefined' || !V51.Ara || !V51.Ara.temizle) return;
  const V60 = window.V60 = window.V60 || {};
  const P = V60.Perf = {sayac: {cagri: 0, hizli: 0, onbellek: 0, hesap: 0}};
  const A = V51.Ara, t0 = A.temizle, M = new Map();
  P.eski = t0;   // testler: bütün kayıtlarda yeni yol = eski yol
  const DOG = /doğrula|editör|kontrol bekl|kaynak bekl|otomatik tespit|eşleşme|mevcut bağlantı|konu aralığında|sayfa aralığında/i;
  const PKAL = /Kaynak|sd-wait|arama bağlantısıdır|Bu ad konu anlatımında/;
  P.dokunulmaz = function (h, sev) {
    if (h.indexOf('Kitap') >= 0) return false;
    if (h.indexOf('<br') >= 0) return false;
    if (h.indexOf('<p') >= 0 && (PKAL.test(h) || DOG.test(h))) return false;
    return true;
  };
  A.temizle = function (html, sev) {
    P.sayac.cagri++;
    if (sev === 'editor' || typeof html !== 'string') return t0.apply(this, arguments);
    if (P.dokunulmaz(html, sev)) { P.sayac.hizli++; return html; }
    const k = sev + '\u0001' + html, v = M.get(k);
    if (v !== undefined) { P.sayac.onbellek++; return v; }
    P.sayac.hesap++;
    const r = t0.apply(this, arguments);
    if (M.size > 1500) M.clear();
    M.set(k, r);
    return r;
  };
  P.temizleOnbellek = () => M.clear();
})();
