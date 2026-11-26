/* ===================== V56.0 (2/4): ortak tema altyapısı =====================
   Üç ayrı tema sistemi (Elmas açık/koyu, Altın gündüz/gece + 5 palet, Öğretmen 5 palet + gündüz/gece) yerine TEK tercih:
     Açık · Koyu · Otomatik (cihaz teması) — Elmas'ın mevcut tema sistemi.
   • Kayıt: Elmas'ın anahtarları (dk-theme = light|dark, dk-tema47 = 'oto'); Altın'ın V43 anahtarı (dk-ptema43) eşzamanlı yazılır
     (açılış betiği ve eski kod için). V54 tema kaydı (dk-tema54) silinmez, artık okunmaz.
   • Elmas: değişmedi. Altın: Elmas paletinin Altın tasarım diline uyarlanmış hâli (derlemede üretilir: lacivert/beyaz yüzeyler,
     Altın'ın altın vurguları, logo ve amblemler aynı). Öğretmen Modu: --t37 ve --t38 değişkenleri Elmas paletinden (açık/koyu).
   • Bütün tema düğmeleri aynı tercihi değiştirir: Elmas üst çubuk, Altın üst çubuk (.t43), Profilim › Görünüm, Görünüm ve ses ›
     Tema, Öğretmen Modu “Tema” düğmesi.
   • Altın'a ilk girişte ayrıca gündüz/gece sorulmaz (V54): tema zaten bütün modlarda ortak. */
(function () {
  if (typeof V43 === 'undefined' || !window.V54 || !V54.Tema) return;
  const V56 = window.V56 = window.V56 || {};
  const T = V56.Tema = {};
  const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: light)') : {matches: false};
  const ls = {al: (k) => { try { return localStorage.getItem(k); } catch (x) { return null; } }, yaz: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (x) {} }};
  T.AD = {acik: 'Açık', koyu: 'Koyu', oto: 'Otomatik'};
  T.tercih = () => (ls.al('dk-tema47') === 'oto' ? 'oto' : (ls.al('dk-theme') === 'light' ? 'acik' : 'koyu'));
  T.cozum = () => { const t = T.tercih(); return t === 'oto' ? (mq.matches ? 'acik' : 'koyu') : t; };
  T.kaydet = function (v) {
    ls.yaz('dk-tema47', v === 'oto' ? 'oto' : null);
    const c = v === 'oto' ? (mq.matches ? 'acik' : 'koyu') : v;
    ls.yaz('dk-theme', c === 'acik' ? 'light' : 'dark');
    ls.yaz('dk-ptema43', v === 'oto' ? 'oto' : (c === 'acik' ? 'gunduz' : 'gece'));
  };
  T._sus = false;
  T.uygula = function () {
    const de = document.documentElement, c = T.cozum(), th = c === 'acik' ? 'light' : 'dark';
    try { de.setAttribute('data-tema54a', 'altin'); de.setAttribute('data-tema54o', 'ortak56'); de.setAttribute('data-tema54om', c === 'acik' ? 'gunduz' : 'gece'); } catch (x) {}
    try { T._sus = true; V43.uygula(); V43.boya(); } catch (x) {} finally { T._sus = false; }
    if (!(V39.on && de.hasAttribute('data-pt43')) && de.dataset.theme !== th) de.dataset.theme = th;
    try { themeBtns(); } catch (x) {}
  };
  T.sec = function (v) {
    if (!T.AD[v]) return;
    T.kaydet(v);
    const de = document.documentElement, f = () => T.uygula();
    const az = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !az) { try { const p = document.startViewTransition(f); p && p.finished && p.finished.catch(() => {}); p && p.ready && p.ready.catch(() => {}); } catch (x) { f(); } } else f();
    try { UI.toast(T.AD[v] + ' tema' + (v === 'oto' ? ' (cihaz: ' + T.AD[T.cozum()] + ')' : '') + ' · bütün modlarda'); } catch (x) {}
    T.yenile();
  };
  T.cevir = () => T.sec(T.cozum() === 'acik' ? 'koyu' : 'acik');
  // eski giriş noktaları ortak tercihe bağlanır
  V43.tercih = () => ({acik: 'gunduz', koyu: 'gece', oto: 'oto'})[T.tercih()];
  V43.klasikTema = () => (T.cozum() === 'acik' ? 'light' : 'dark');
  V43.ayarla = (v) => T.sec(({gunduz: 'acik', gece: 'koyu', oto: 'oto'})[v] || 'koyu');
  V43.cevir = () => T.cevir();
  // satır içi onclick="theme()" kullanan bütün düğmeler (Elmas üst çubuk, editör, ayar) ortak tercihe yönlendirilir
  document.addEventListener('click', (ev) => { const b = ev.target && ev.target.closest && ev.target.closest('[onclick*="theme()"]'); if (b && !b.closest('[data-themebtn]')) { ev.preventDefault(); ev.stopPropagation(); T.cevir(); } }, true);
  // Elmas üst çubuk düğmesi (const theme() yalnız Elmas'ı çevirirdi): her çizimde ortak tercihe bağlanır
  T.dugmeler = () => document.querySelectorAll('[data-themebtn]').forEach((b) => { if (!b._t56) { b._t56 = 1; b.removeAttribute('onclick'); b.onclick = null; b.addEventListener('click', (ev) => { ev.preventDefault(); T.cevir(); }); } });
  if (window.V47 && V47.Ayar) {
    if (V47.Ayar.elmasSec) V47.Ayar.elmasSec = function (v) { T.sec(v); try { V47.Ayar.ciz(); } catch (x) {} };
    V47.Ayar.elmasTema = () => T.tercih();
  }
  const TM = V54.Tema;
  TM.uygula = () => T.uygula();
  TM.mod = (yer, m) => T.sec(m === 'gunduz' ? 'acik' : 'koyu');
  TM.sec = () => {};
  TM.ilkSor = () => {};
  TM.icerik = () => T.html();
  TM.ac = (yer) => T.ac(yer);
  if (window.V53 && V53.Tema) { V53.Tema.uygula = () => T.uygula(); V53.Tema.ac = (y) => T.ac(y); }
  try { mq.addEventListener('change', () => { if (T.tercih() === 'oto') { T.kaydet('oto'); T.uygula(); } }); } catch (x) {}

  /* ---------- arayüz: tek seçim ---------- */
  T.ORNEK = {acik: ['#F3F5FA', '#FFFFFF', '#0B1020'], koyu: ['#0B1020', '#131A2D', '#F0F3FA'], oto: null};
  T.html = function () {
    const t = T.tercih();
    return `<div class="tm56" role="radiogroup" aria-label="Tema">${['acik', 'koyu', 'oto'].map((k) => { const o = T.ORNEK[k]; return `<button type="button" role="radio" aria-checked="${t === k}" class="tm56-k ${t === k ? 'on' : ''}" onclick="V56.Tema.sec('${k}')"><span class="tm56-o ${k}" aria-hidden="true">${o ? `<i style="background:${o[0]}"></i><i style="background:${o[1]}"></i><b style="background:${o[2]}"></b>` : '<i class="a"></i><i class="k"></i>'}</span><b>${T.AD[k]}</b></button>`; }).join('')}</div>
<p class="tm56-n">Tema bütün modlarda ortaktır (Elmas, Altın, Öğretmen Modu). Altın'ın altın vurguları ve amblemleri her temada korunur.</p>`;
  };
  T.ac = function () { T._s = UI.sheet({title: 'Tema', body: () => `<div id="tm56-kap">${T.html()}</div>`, footer: () => '<button onclick="UI.close()">Kapat</button>'}); };
  T.yenile = function () {
    document.querySelectorAll('#tm56-kap, #pr54-gor').forEach((k) => { k.innerHTML = T.html(); });
    try { const L = UI._stack[UI._stack.length - 1]; if (L && L.refresh && L.box && L.box.querySelector('.a47-tm, .t43-seg')) L.refresh(); } catch (x) {}
    try { if (view === 'ayar47' && window.V47 && V47.Ayar && V47.Ayar.ciz) V47.Ayar.ciz(); } catch (x) {}
  };
  // Görünüm ve ses › Tema: tek liste (Elmas/Altın ayrı listeleri yerine)
  T.ayarTema = function () { if (view !== 'ayar47' || (G.at || 'alan') !== 'tema') return; const b = document.getElementById('a47b'); if (b && !b.querySelector('.tm56')) b.innerHTML = `<h3 class="a47-h">Tema</h3>${T.html()}`; };
  if (window.V47 && V47.Ayar && V47.Ayar.ciz) { const c0 = V47.Ayar.ciz; V47.Ayar.ciz = function () { const r = c0.apply(this, arguments); try { T.ayarTema(); } catch (x) {} return r; }; }
  V43.secici = () => `<div class="t43-k"><b>Tema</b><div id="tm56-kap">${T.html()}</div></div>`;

  /* ---------- Öğretmen Modu: Elmas paletinden ---------- */
  const OGR = {
    acik: {'t37-bg': '#F3F5FA', 't37-card': '#FFFFFF', 't37-card2': '#F5F7FB', 't37-line': '#DCE2EE', 't37-line2': '#C3CCDD', 't37-ink': '#0B1020', 't37-mut': '#4A5670', 't37-act': '#2E54C8', 't37-on': '#FFFFFF', 't37-steel': '#2E54C8', 't37-steel2': '#3B63E0', 't37-soft': '#E8EEFC', 't37-bas': '#4A5670', 't37-plan': '#2646B0', 't37-ok': '#15803D', 't37-tek': '#92400E', 't37-kz-bg': '#EEF3FE', 't37-kz-line': '#3B63E0', 't37-kz-ink': '#0B1020', 't37-kz-code': '#DCE6FB', 't38-g1': '#3B63E0', 't38-g2': '#2646B0', 't38-gt': '#FFFFFF', 't38-gold': '#3B63E0', 't38-ring': 'rgba(59,99,224,.28)', 't38-sh': '0 1px 2px rgba(15,23,42,.06),0 6px 18px rgba(15,23,42,.08)'},
    koyu: {'t37-bg': '#0B1020', 't37-card': '#131A2D', 't37-card2': '#19243A', 't37-line': '#26324D', 't37-line2': '#34446A', 't37-ink': '#F0F3FA', 't37-mut': '#A4AEC2', 't37-act': '#9DB6FF', 't37-on': '#0B1020', 't37-steel': '#9DB6FF', 't37-steel2': '#7B9BFF', 't37-soft': '#1A2645', 't37-bas': '#A4AEC2', 't37-plan': '#9DB6FF', 't37-ok': '#4ADE80', 't37-tek': '#F6D58B', 't37-kz-bg': '#141E36', 't37-kz-line': '#7B9BFF', 't37-kz-ink': '#F0F3FA', 't37-kz-code': '#22305A', 't38-g1': '#4F7CFF', 't38-g2': '#3E69F0', 't38-gt': '#FFFFFF', 't38-gold': '#7B9BFF', 't38-ring': 'rgba(79,124,255,.3)', 't38-sh': '0 1px 2px rgba(0,0,0,.4),0 8px 22px rgba(0,0,0,.3)'}
  };
  const B5 = 'body[data-ogrt37][data-ogrt37][data-ogrt37][data-ogrt37][data-ogrt37]';
  let css = Object.entries(OGR).map(([k, m]) => `html[data-theme="${k === 'acik' ? 'light' : 'dark'}"] ${B5}{${Object.entries(m).map(([a, b]) => `--${a}:${b}`).join(';')}}`).join('\n');
  css += `
.tm56{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.tm56-k{display:flex;flex-direction:column;align-items:center;gap:8px;min-height:104px;padding:12px 8px;border-radius:16px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;cursor:pointer}
.tm56-k.on{border-color:var(--pri);box-shadow:0 0 0 2px var(--pri) inset}
body[data-prem39] .tm56-k.on{border-color:var(--p-gold);box-shadow:0 0 0 2px var(--p-gold) inset;background:color-mix(in srgb,var(--p-gold) 12%,var(--p-card))}
.tm56-o{position:relative;display:block;width:60px;height:44px;border-radius:10px;overflow:hidden;border:1px solid rgba(127,127,127,.35)}
.tm56-o i{position:absolute;inset:0}.tm56-o i+i{inset:10px 8px 8px 8px;border-radius:6px}.tm56-o b{position:absolute;left:14px;right:22px;top:16px;height:4px;border-radius:2px}
.tm56-o.oto i.a{background:linear-gradient(135deg,#F3F5FA 50%,#0B1020 50%);inset:0;border-radius:0}.tm56-o.oto i.k{display:none}
.tm56-n{margin:10px 0 0;color:var(--mut);font-size:.84rem;line-height:1.45}
#gg54{display:none!important}
`;
  // öğretmen başlığındaki silüet ve motif (V38 bronz) temanın vurgu rengine
  try { const cs = getComputedStyle(document.documentElement); [['t38-sil', '%235B7CEB'], ['t38-mt', '%235B7CEB']].forEach(([v, r]) => { const d = cs.getPropertyValue('--' + v); if (d && /B8894A/i.test(d)) css += `${B5}{--${v}:${d.trim().replace(/%23B8894A/gi, r)}}\n`; }); } catch (x) {}
  try { const st = document.createElement('style'); st.id = 'v56-tema-css'; st.textContent = css; document.head.appendChild(st); } catch (x) {}

  T.uygula();
  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try { T.ayarTema(); T.dugmeler(); } catch (x) {}
    try { const p = document.getElementById('pr54-gor'); if (p && !p.querySelector('.tm56')) p.innerHTML = T.html(); const h = document.getElementById('pr54-h'); if (h) h.textContent = 'Tema'; } catch (x) {}
    return r;
  };
})();
