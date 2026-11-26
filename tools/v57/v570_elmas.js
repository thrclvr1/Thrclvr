/* ===================== V57.0 (2/4): Elmas — sade Profilim ve Çalışmam, Bilgi Atlası =====================
   • Profilim: “İlerlemem” bölümü Elmas'ta gösterilmez (aynı bilgiler Çalışmam'da). Hesaplar ve veriler aynı.
   • Çalışmam: “Tekrar yok / Hepsi öğrenildi / Yanlışın yok / 10 soru” kutuları ve “Tekrar zamanı gelenler” bölümü kaldırıldı
     (tekrar verisi ve algoritması aynı). Yerine “Hızlı karma test” kartı: Kendi sınıfıma göre · Bütün sınıflara göre.
     Başka sınıftan çözülen sorular günlük hedefi ve sınıf başarısını etkilemez (V56: sınıf, kazanım kimliğinden).
   • Ana sayfa: Sureler ve Dualar + Bilgi Atlası (Kavramlar · Kişiler · Eserler · Diğer kayıtlar alt sekmeleri; rota atlas57).
     Kavram/kişi/eser kayıtları ve sözlük ekranları (KV) aynen; yalnız erişim ve sunum değişti.
   • Bağlantılar: Elmas'ta öğrenci için kaldırıldı (Altın'da duruyor; editör erişimi korunur). */
(function () {
  if (typeof V39 === 'undefined' || typeof KV === 'undefined') return;
  const V57 = window.V57 = window.V57 || {};
  const E = V57.Elmas = {};
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const elmas = () => { try { return !V39.on; } catch (x) { return true; } };
  const editor = () => { try { return typeof V38 !== 'undefined' && !!V38.edOk(); } catch (x) { return false; } };
  const sinif = () => { try { return (V53.Hesap && +V53.Hesap.sinif()) || 0; } catch (x) { return 0; } };
  const IKON = (p, s) => `<svg width="${s || 24}" height="${s || 24}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

  /* ---------- 1. Hızlı karma test: iki kapsam ---------- */
  try {
    const HV = V53.Hesap && V53.Hesap.HAVUZ;
    if (HV) Object.defineProperty(HV, 'calis45', {configurable: true, enumerable: true, get: () => (E._tum ? null : ['questions', 'flashcards'])});
  } catch (x) {}
  E.karma = function (kapsam) {
    const s = sinif();
    G.tq = {mode: 'karma', g: kapsam === 'sinif' && s ? s : '', u: '', t: '', n: 10, kapsam57: kapsam};
    E._tum = kapsam === 'tum';
    try { V30.tqStart(); } finally { E._tum = false; }
  };
  E.karmaHTML = function () {
    const s = sinif();
    return `<section class="kt57" aria-labelledby="kt57-h"><div class="kt57-b"><span class="kt57-i" aria-hidden="true">${IKON('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>', 26)}</span><div><h2 id="kt57-h">Hızlı karma test</h2><p>Karışık sorularla kısa bir test. Kapsamı seç:</p></div></div>
<div class="kt57-s"><button type="button" class="kt57-d" ${s ? '' : 'disabled'} onclick="V57.Elmas.karma('sinif')"><b>Kendi sınıfıma göre</b><small>${s ? s + '. sınıfın soruları' : 'Önce sınıfını seç'}</small></button>
<button type="button" class="kt57-d" onclick="V57.Elmas.karma('tum')"><b>Bütün sınıflara göre</b><small>4–12. sınıflardan karışık</small></button></div>
<p class="kt57-n">${s ? `Başka sınıflardan çözdüğün sorular ${s}. sınıf günlük hedefine ve başarına sayılmaz; “Genel çalışmam”da görünür.` : ''}</p></section>`;
  };
  E.calis = function () {
    if (view !== 'calis45' || !elmas() || $.querySelector('.kt57')) return;
    $.querySelectorAll('.c48-sg').forEach((x) => x.remove());
    $.querySelectorAll('details.c48-d').forEach((d) => { const s = d.querySelector(':scope > summary'); if (s && /Tekrar zamanı gelenler/.test(s.textContent)) d.remove(); });
    const ust = $.querySelector('.c48-ust');
    if (ust) ust.insertAdjacentHTML('afterend', E.karmaHTML()); else { const k = $.querySelector('.c48'); if (k) k.insertAdjacentHTML('beforeend', E.karmaHTML()); }
  };

  /* ---------- 2. Profilim: İlerlemem Elmas'ta yok ---------- */
  E.profil = function () { if (view !== 'profil46' || !elmas()) return; $.querySelectorAll('section.pr49-ilr').forEach((x) => x.remove()); };

  /* ---------- 3. Ana sayfa: Sureler ve Dualar + Bilgi Atlası ---------- */
  E.ana = function () {
    if (view !== 'home' || !elmas()) return;
    const g = $.querySelector('.m47-g'); if (!g || g.dataset.v57) return; g.dataset.v57 = '1';
    const kv = g.querySelector('.m47-k[data-k="kavram"]');
    if (kv) {
      kv.setAttribute('onclick', "go('atlas57')"); kv.dataset.k = 'atlas';
      const b = kv.querySelector('b'), sm = kv.querySelector('small');
      if (b) b.textContent = 'Bilgi Atlası'; if (sm) sm.textContent = 'Kavramlar · Kişiler · Eserler';
      kv.setAttribute('aria-label', 'Bilgi Atlası: kavramlar, kişiler ve eserler');
    }
    g.querySelectorAll('.m47-k[data-k="kisi"], .m47-k[data-k="bag"]').forEach((x) => x.remove());
    const h = $.querySelector('#m47-h'); if (h) h.textContent = 'Keşif';
  };

  /* ---------- 4. Bilgi Atlası (rota atlas57) ---------- */
  const A = V57.Atlas = {};
  A.SEK = [['kavram', 'Kavramlar'], ['kisi', 'Kişiler'], ['eser', 'Eserler'], ['diger', 'Diğer kayıtlar']];
  A.say = function () {
    const E2 = Store.all('entities');
    return {kavram: Store.all('concepts').length, kisi: E2.filter((x) => x.type === 'kisi').length, eser: E2.filter((x) => x.type === 'eser').length, diger: E2.filter((x) => !['kisi', 'eser'].includes(x.type)).length};
  };
  A.git = function (k) { G.atl = k; if (k === 'diger') { const s = KV.st.entities; if (s.t === 'kisi' || s.t === 'eser') s.t = ''; s.n = 80; } draw(); };
  V30.routes.atlas57 = function () {
    const k = A.SEK.some((x) => x[0] === G.atl) ? G.atl : 'kavram';
    if (k === 'kavram') KV.page('concepts');
    else { const s = KV.st.entities; if (k === 'kisi' || k === 'eser') s.t = k; KV.page('entities'); }
    const n = A.say(), hero = $.querySelector('section.hero');
    if (hero) {
      const ey = hero.querySelector('.eyebrow'), h1 = hero.querySelector('h1'), ld = hero.querySelector('.lead');
      if (ey) ey.textContent = 'Keşif'; if (h1) h1.textContent = 'Bilgi Atlası';
      if (ld) ld.textContent = ({kavram: 'Ders kitaplarındaki kavramlar, alfabetik. Bir kavramı açıp bağlı konuya gidebilirsin.', kisi: 'Kişiler; hangi konuda geçtiği ve kitap sayfası ile birlikte.', eser: 'Eserler; hangi konuda geçtiği ve kitap sayfası ile birlikte.', diger: 'Sure, olay, kurum, yer ve diğer kayıtlar.'})[k];
      hero.insertAdjacentHTML('afterend', `<div class="ba57" role="tablist" aria-label="Bilgi Atlası">${A.SEK.map(([x, ad]) => `<button type="button" role="tab" aria-selected="${x === k}" class="${x === k ? 'on' : ''}" onclick="V57.Atlas.git('${x}')">${ad} <small>${n[x]}</small></button>`).join('')}</div>`);
    }
    if (k === 'kisi' || k === 'eser') $.querySelectorAll('.sfilt label.sf').forEach((l) => { const s = l.querySelector('select'); if (s && /KV\.set\('entities','t'/.test(s.getAttribute('onchange') || '')) l.remove(); });
    const bk = $.querySelector('button.back'); if (bk) bk.setAttribute('onclick', "go('home')");
  };
  try { if (window.V55 && V55.Duzen) { V55.Duzen.ELMAS.atlas57 = 'home'; V55.Duzen.ALT.atlas57 = 'kor'; } } catch (x) {}

  /* ---------- 5. yönlendirmeler: Elmas'ta sözlükler Bilgi Atlası'nda; Bağlantılar yalnız Altın (ve editör) ---------- */
  const go0 = go;
  window.go = go = function (v, a) {
    try {
      if (elmas()) {
        if (v === 'kavram') { G.atl = 'kavram'; v = 'atlas57'; }
        else if (v === 'kisi') { G.atl = 'kisi'; v = 'atlas57'; }
        else if (v === 'links' && !editor()) { try { UI.toast('Bağlantılar Altın Öğrenme Alanı’nda.'); } catch (x) {} G.atl = 'kavram'; v = 'atlas57'; a = undefined; }
      }
    } catch (x) {}
    return go0.call(this, v, a);
  };

  try {
    const st = document.createElement('style'); st.id = 'v57-elmas-css';
    st.textContent = `
.kt57{margin:16px 0;padding:16px;border-radius:18px;border:1px solid var(--line);background:var(--surface);display:grid;gap:12px}
.kt57-b{display:flex;align-items:center;gap:12px}.kt57-b h2{margin:0;font-size:1.05rem}.kt57-b p{margin:2px 0 0;color:var(--mut);font-size:.88rem}
.kt57-i{display:inline-grid;place-items:center;width:46px;height:46px;flex:none;border-radius:14px;background:linear-gradient(135deg,#F59E0B,#F97316);color:#fff}
.kt57-s{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.kt57-d{display:flex;flex-direction:column;align-items:flex-start;gap:3px;min-height:72px;padding:12px;border-radius:14px;border:1px solid var(--line);background:var(--surface2,var(--surface));color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.kt57-d b{font-size:.95rem}.kt57-d small{color:var(--mut);font-size:.78rem}.kt57-d:disabled{opacity:.55;cursor:default}
.kt57-d:not(:disabled):active{transform:translateY(1px)}
.kt57-n{margin:0;color:var(--mut);font-size:.82rem;line-height:1.45}
@media (max-width:359px){.kt57-s{grid-template-columns:1fr}}
.ba57{display:flex;gap:6px;margin:12px 0;padding:4px;border-radius:999px;background:var(--surface2,var(--surface));border:1px solid var(--line);overflow-x:auto;scrollbar-width:none}
.ba57::-webkit-scrollbar{display:none}
.ba57 button{flex:1 0 auto;min-height:42px;padding:6px 14px;border-radius:999px;border:0;background:none;color:var(--mut);font:inherit;font-weight:650;white-space:nowrap;cursor:pointer}
.ba57 button small{font-weight:600;opacity:.8}
.ba57 button.on{background:var(--surface);color:var(--ink);box-shadow:0 0 0 1px var(--line) inset,0 2px 8px -3px rgba(0,0,0,.3)}
.ba57 button.on small{color:var(--pri)}
`;
    document.head.appendChild(st);
  } catch (x) {}

  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try { E.calis(); E.profil(); E.ana(); } catch (x) { console.warn('[V57] Elmas', x); }
    return r;
  };
})();
