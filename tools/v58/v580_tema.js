/* ===================== V58.0 (1/4): tema — Öğretmen Modu gündüz/gece düzeltmesi, “Önerilen” işaretleri =====================
   Kök neden (V57'de bulunan hata): Öğretmen Modu ekranlarında üst çubuktaki güneş/ay düğmesi taban “theme()” işlevine bağlıydı;
   Elmas'ın tercihini (dk-theme) değiştiriyor ve <html data-theme>'i çeviriyordu. data-theme'e bağlı eski öğretmen kuralları
   (V37/V38) da bu yüzden öğretmen sayfasını geçici olarak gündüze/geceye çeviriyor, ama Öğretmen Modu'nun kendi kaydı
   (dk-tema54.ogretmenMod) değişmiyordu: Tema penceresi “Gece” derken ekran gündüz görünüyor, Elmas'a dönünce Elmas'ın teması
   da bozulmuş oluyordu. Ayrıca Öğretmen Modu'nda data-theme hep Elmas'ın tercihini izlediği için iki ayar çakışıyordu.
   Düzeltme:
   • Öğretmen Modu açıkken <html data-theme> Öğretmen Modu'nun görünümünü izler (Altın'da V43'ün yaptığı gibi); Elmas'ın tercihi
     (dk-theme) yalnız okunur, değiştirilmez. Öğretmen Modu'ndan çıkınca V43 data-theme'i Elmas tercihine geri koyar.
   • Öğretmen Modu'nda üst çubuktaki güneş/ay düğmesi Öğretmen Modu'nun gündüz/gece ayarını değiştirir (dk-tema54.ogretmenMod).
   • Otomatik: cihaz teması değişince Öğretmen Modu da anında güncellenir.
   • Altın'ın gündüz/gece ayarı (dk-ptema43) ve Elmas'ın tercihi bu düğmelerden etkilenmez.
   “Önerilen”: yalnız tema seçim ekranlarında — Altın temaları arasında Altın Mihrap, Elmas temaları arasında Elmas · Koyu
   (Elmas Öğrenme Alanı'nın kendi seçim ekranında “Koyu”). */
(function () {
  if (!window.V54 || !V54.Tema || typeof V43 === 'undefined' || !window.V57 || !V57.Tema) return;
  const V58 = window.V58 = window.V58 || {};
  const TM = V54.Tema, T = V58.Tema = {};
  const de = document.documentElement;
  T.ogrAktif = () => { try { return !!(window.V50 && V50.Mod && V50.Mod.aktif() === 'ogretmen'); } catch (x) { return false; } };
  T.ogrMod = () => { try { return V57.Tema.cozum((TM.oku().ogretmenMod) || 'gece'); } catch (x) { return 'gece'; } };
  T.esitle = function () {
    if (!T.ogrAktif()) return;
    const m = T.ogrMod(), th = m === 'gunduz' ? 'light' : 'dark';
    if (de.dataset.theme !== th) de.dataset.theme = th;
    if (de.getAttribute('data-tema54om') !== m) de.setAttribute('data-tema54om', m);
    try { const mt = document.querySelector('meta[name="theme-color"]'); if (mt) mt.content = m === 'gunduz' ? '#F3F5FA' : '#0B1020'; } catch (x) {}
    T.dugme();
  };
  T.dugme = function () {
    if (!T.ogrAktif()) return;
    const m = T.ogrMod();
    document.querySelectorAll('[data-themebtn]').forEach((b) => {
      try { if (typeof ico === 'function') b.innerHTML = ico(m === 'gece' ? 'sun' : 'moon', 20); } catch (x) {}
      const l = m === 'gece' ? 'Öğretmen Modu: gündüz görünümüne geç' : 'Öğretmen Modu: gece görünümüne geç';
      b.setAttribute('aria-label', l); b.title = l;
    });
  };
  // V43.uygula her çizimde çalışır: Öğretmen Modu'nda data-theme'i öğretmen ayarına eşitle
  const u0 = V43.uygula;
  V43.uygula = function () { const r = u0.apply(this, arguments); try { T.esitle(); } catch (x) {} return r; };
  const tu0 = TM.uygula;
  TM.uygula = function () { const r = tu0.apply(this, arguments); try { if (T.ogrAktif()) T.esitle(); } catch (x) {} return r; };
  // Öğretmen Modu'nda güneş/ay düğmesi = Öğretmen Modu gündüz/gece
  document.addEventListener('click', (ev) => {
    const b = ev.target && ev.target.closest && ev.target.closest('[data-themebtn],[onclick="theme()"]');
    if (!b || !T.ogrAktif()) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    const yeni = T.ogrMod() === 'gunduz' ? 'gece' : 'gunduz';
    TM.mod('ogretmen', yeni); T.esitle();
    try { UI.toast('Öğretmen Modu: ' + (yeni === 'gunduz' ? 'Gündüz' : 'Gece') + ' görünümü'); } catch (x) {}
  }, true);
  try { matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { try { T.esitle(); } catch (x) {} }); } catch (x) {}

  /* ---------- “Önerilen” işaretleri (yalnız tema seçim ekranlarında) ---------- */
  const YILDIZ = '<svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
  T.rozet = (ek) => `<span class="on58 ${ek || ''}" aria-label="Önerilen tema">${YILDIZ}Önerilen</span>`;
  const ic0 = TM.icerik;
  TM.icerik = function (yer) {
    let h = ic0.apply(this, arguments);
    if (yer === 'altin') h = h.replace('<b>Altın Mihrap</b>', '<b>Altın Mihrap</b>' + T.rozet('al'));
    h = h.replace('<b>Elmas · Koyu</b>', '<b>Elmas · Koyu</b>' + T.rozet('el'));
    return h;
  };
  // Elmas Öğrenme Alanı'nın kendi tema seçimi (Görünüm ve ses › Tema): “Koyu”
  T.elmasEkran = function () {
    document.querySelectorAll('button.a47-to[onclick*="elmasSec(\'koyu\')"]').forEach((b) => { if (!b.querySelector('.on58')) b.querySelector('b') && b.querySelector('b').insertAdjacentHTML('afterend', T.rozet('el')); });
  };
  try {
    const st = document.createElement('style'); st.id = 'v58-tema-css';
    st.textContent = `
.on58{display:inline-flex;align-items:center;gap:3px;margin-left:8px;padding:2px 8px 2px 6px;border-radius:999px;font:700 .68rem/1.3 var(--sans,system-ui);letter-spacing:.02em;vertical-align:middle;white-space:nowrap}
.on58 svg{flex:none}
.on58.al{color:#3a2706;background:linear-gradient(135deg,#F3D98B,#D9A946);box-shadow:0 0 0 1px rgba(255,236,180,.45) inset,0 2px 8px -3px rgba(217,169,70,.6)}
.on58.el{color:#fff;background:linear-gradient(135deg,#6E8FFF,#3B63E0);box-shadow:0 0 0 1px rgba(255,255,255,.25) inset,0 2px 8px -3px rgba(59,99,224,.6)}
.a47-to .on58{margin:4px 0 0}
.tm57-k b+.on58{margin-left:0;margin-top:3px}
.tm57-k span>b{display:inline}
.tm57-k span:has(>.on58){display:flex;flex-direction:column;align-items:flex-start}
`;
    document.head.appendChild(st);
  } catch (x) {}
  const dr0 = draw;
  window.draw = draw = function () { const r = dr0.apply(this, arguments); try { T.esitle(); T.elmasEkran(); } catch (x) { console.warn('[V58] tema', x); } return r; };
  try { T.esitle(); } catch (x) {}
})();
