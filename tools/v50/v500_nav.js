/* ===================== V50.0: Altın Sınıfı alt menüsü (Elmas ile aynı yapı) =====================
   Elmas’ta her ekranda alt menü vardı (Ana sayfa · Derslerim · Oyunlar · Çalışmam · Profilim); Altın’da yalnız koridorda
   üst sekmeler vardı. Altın sayfalarında aynı beş girişli alt menü gösterilir (Altın tonlarında):
     Koridor · Sınıfım (son sınıf merkezi) · Oyunlar · Çalışmam · Profilim
   Koridorda (kendi üst menüsü var), 3B oyun ekranında, öğretmen alanında ve seçim ekranı açıkken gösterilmez. */
(function () {
  if (typeof V39 === 'undefined') return;
  const V50 = window.V50 = window.V50 || {};
  const N = V50.Nav = {};
  const IK = (k) => (window.V46 && V46.ik ? V46.ik(k, 22) : '');
  const sinif = () => { try { const s = +(G.pg || V39.ilr().sonSinif); return (V39.GR || []).includes(s) ? s : 0; } catch (e) { return 0; } };
  const OGE = () => [['kor', 'Koridor', 'home', "go('pdunya')"], ['sinif', 'Sınıfım', 'ders', sinif() ? `go('psinif',{pg:${sinif()}})` : "go('pdunya')"], ['oyun', 'Oyunlar', 'oyun', "go('poyun')"], ['calis', 'Çalışmam', 'calis', "go('calis45')"], ['profil', 'Profilim', 'profil', "go('profil46')"]];
  const ANAHTAR = {pdunya: 'kor', psinif: 'sinif', punite: 'sinif', pders: 'sinif', pozet: 'sinif', poyun: 'oyun', games: 'oyun', game: 'oyun', calis45: 'calis', pek: 'calis', pekbol: 'calis', dene: 'calis', yanlis: 'calis', test: 'calis', cards: 'calis', exams: 'calis', exam: 'calis', profil46: 'profil', ayar47: 'profil', pfav: 'profil', pilerleme: 'profil'};
  const GIZLI = ['pdunya', 'poyna', 'ogretmen', 'editor', 'admin', 'bildirim48'];
  N.goster = () => !!V39.on && !GIZLI.includes(view) && !document.getElementById('uye39');
  N.ciz = function () {
    let n = document.getElementById('bn50');
    if (!N.goster()) { if (n) n.hidden = true; document.body.removeAttribute('data-bn50'); return; }
    if (!n) { n = document.createElement('nav'); n.id = 'bn50'; n.className = 'bn50'; n.setAttribute('aria-label', 'Altın Sınıfı menüsü'); document.body.appendChild(n); }
    const k = ANAHTAR[view] || '', imza = k + '|' + sinif();
    if (n.dataset.i !== imza) { n.dataset.i = imza; n.innerHTML = OGE().map(([x, t, i, f]) => `<button type="button" data-k="${x}" class="${x === k ? 'on' : ''}" ${x === k ? 'aria-current="page"' : ''} onclick="${f}" aria-label="${t}">${IK(i)}<span>${t}</span></button>`).join(''); }
    n.hidden = false; document.body.setAttribute('data-bn50', '');
  };
  const d0 = draw;
  draw = function () { const r = d0.apply(this, arguments); try { N.ciz(); } catch (e) { console.warn('[V50] alt menü', e); } return r; };
  // seçim ekranı kapanınca/açılınca da güncelle
  if (V39.secim) { const s0 = V39.secim; V39.secim = function () { const r = s0.apply(this, arguments); try { N.ciz(); } catch (e) {} return r; }; }
})();
