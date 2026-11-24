/* ===================== V49.0: Elmas / Altın arayüz karışması düzeltmesi =====================
   KÖK NEDEN (V42–V48): Geri tuşu için her ekrandan çıkarken bir “anlık kayıt” (V30.snap) alınır; V42 bu kayda
   o ekranın deneyimini (m42 = Altın mı) ekler. Ancak deneyim değiştirilirken (V42.gec, V39.toNormal, V39.toPremium)
   önce V39.on bayrağı değiştiriliyor, SONRA go() çağrılıp çıkılan ekranın kaydı alınıyordu. Böylece örneğin Elmas ana
   sayfasının kaydı “Altın” olarak yazılıyor; geri tuşuna basınca Elmas ana sayfası Altın oturumunda çiziliyordu.
   V46'nın yeni ana sayfası yalnız Elmas'ta uygulandığından ortaya V31'den kalma eski ana sayfa (Altın renkleri ve
   “Koridor” çubuğuyla) çıkıyordu. Ters yönde de (Altın koridoru → Elmas → geri) koridor Elmas oturumunda çizilebiliyordu.
   ÇÖZÜM:
   1. Kayıttaki deneyim, ekranın ÇİZİLDİĞİ andaki deneyimdir (son çizimde saklanır), değişim anındaki bayrak değil.
   2. Güvenlik ağı: çizimden hemen önce rota deneyimle uyuşmuyorsa karşılığına çevrilir
      (Altın: home/classes → koridor, grade → sınıf merkezi, topic → ders; Elmas: koridor → ana sayfa, sınıf merkezi /
      ünite → sınıf, ders → konu). Kullanıcı kayıtlarına ve tercihlerine dokunulmaz. */
(function () {
  if (typeof V30 === 'undefined' || typeof V39 === 'undefined') return;
  const V49 = window.V49 = window.V49 || {};
  const D = V49.Duzelt = {sayac: 0, son: null};
  let cizilen = !!V39.on;
  D.uyum = function () {
    try {
      const on = !!V39.on, v = view;
      if (on && (v === 'home' || v === 'classes')) { view = 'pdunya'; }
      else if (on && v === 'grade') { G.pg = G.pg || G.g || 5; view = 'psinif'; }
      else if (on && v === 'topic' && G.t) { G.pt = G.t; G.ptab = G.ptab || G.tab || ''; view = 'pders'; }
      else if (!on && v === 'pdunya') { view = 'home'; }
      else if (!on && (v === 'psinif' || v === 'punite')) { G.g = G.g || G.pg || 5; view = 'grade'; }
      else if (!on && v === 'pders' && G.pt) { G.t = G.pt; G.tab = G.tab || G.ptab || ''; view = 'topic'; }
      if (view !== v) { D.sayac++; D.son = v + ' → ' + view + (on ? ' (Altın)' : ' (Elmas)'); try { V39.attr(); } catch (e) {} }
    } catch (e) {}
  };
  const d0 = draw;
  // arka plan deseni için alan işareti (html[data-alan49] = elmas | altin | ogretmen)
  D.alan = function () { try { const a = document.body && document.body.hasAttribute('data-ogrt37') ? 'ogretmen' : (V39.on ? 'altin' : 'elmas'); if (document.documentElement.dataset.alan49 !== a) document.documentElement.dataset.alan49 = a; } catch (e) {} };
  draw = function () { D.uyum(); const r = d0.apply(this, arguments); cizilen = !!V39.on; D.alan(); return r; };
  D.alan();
  const sn0 = V30.snap;
  V30.snap = function () { const s = sn0.apply(this, arguments); s.m42 = cizilen ? 1 : 0; return s; };
  D.cizilen = () => cizilen;
})();
