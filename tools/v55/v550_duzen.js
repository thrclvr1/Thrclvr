/* ===================== V55.0 (1/3): düzen — gerçek akordiyon, alt menü seçili durumu, Elmas çalışma sadeliği, Dinleme Merkezi, editör bilgisi =====================
   • Derslerim (Elmas `grade`) ünite akordiyonu: V54'te .tlist[hidden] CSS'teki display kuralı yüzünden görünür kalıyordu (kök neden).
     Artık ünite kartının tamamı akordiyon: başlık (numara, ad, “N konu”, ilerleme) her zaman görünür, gövde (kartlar, açıklama,
     etiketler, konu listesi) grid satırı animasyonuyla açılır/kapanır; aynı anda tek ünite açık; ilk açılışta hepsi kapalı.
     Dönüşte son açılan ünite oturumda hatırlanır (sessionStorage dk-ak55, tek kimlik). Kapalı gövde `inert` (odak/okuyucu almaz).
   • Alt menü seçili durumu: Altın #bn50 ve Elmas nav.bnav her çizimden sonra V55 eşlemesiyle düzeltilir (acalis53/aoyun53/poyna/
     icerik54 vb. V50 eşlemesinde yoktu → “Çalışmam” seçili görünmüyordu).
   • Elmas Çalışma Merkezim sade: günlük hedef, Pekiştir/Kendini Dene/Sınavlar, tekrar/yanlış/hızlı test kutuları, temel ilerleme
     (tamamlanan konular, genel kazanım başarısı), Öğrendiklerim. Gelişmiş analiz (zayıf kazanımlar, öneriler, 7 günlük grafik,
     ünite ünite başarı) Elmas'tan kaldırıldı; Altın Çalışma Masam'da.
   • Sureler ve Dualar › Dinleme Merkezi: tek düğme “Duaları Dinleyelim” (veri kaynağındaki oynatma listesi adresi); oynatıcı,
     “Oynatıcıyı yenile” ve teknik hata metinleri yok. Eşleştirme durumu yalnız editöre.
   • “İçeriği hazır konu” ve “N konunun içeriği hazır” gibi editoryal bilgiler yalnız editör oturumunda görünür. */
(function () {
  if (typeof V39 === 'undefined' || typeof V54 === 'undefined' || !V54.Duzen) return;
  const V55 = window.V55 = window.V55 || {};
  const D = V55.Duzen = {};
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const altin = () => { try { return !!V39.on; } catch (x) { return false; } };
  const editor = () => { try { return typeof V38 !== 'undefined' && !!V38.edOk(); } catch (x) { return false; } };
  const CHEV = '<svg class="ak55-c" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  /* ---------- 1. ünite akordiyonu (Elmas Derslerim) ---------- */
  D.acik = () => { try { return sessionStorage.getItem('dk-ak55') || ''; } catch (x) { return ''; } };
  D.ayarla = (a, ac) => {
    a.classList.toggle('ak55-ac', ac);
    const b = a.querySelector('.ak55-b'), g = a.querySelector('.ak55-g');
    if (b) b.setAttribute('aria-expanded', String(ac));
    if (g) { g.toggleAttribute('inert', !ac); g.setAttribute('aria-hidden', String(!ac)); }
    const tl = a.querySelector('.tlist'); if (tl) tl.hidden = false;
  };
  D.cevir = function (b) {
    const a = b.closest('article.ak55'); if (!a) return;
    const ac = !a.classList.contains('ak55-ac');
    if (ac) $.querySelectorAll('article.ak55.ak55-ac').forEach((x) => { if (x !== a) D.ayarla(x, false); });
    D.ayarla(a, ac);
    try { ac ? sessionStorage.setItem('dk-ak55', a.dataset.u) : (D.acik() === a.dataset.u && sessionStorage.removeItem('dk-ak55')); } catch (x) {}
    if (ac) setTimeout(() => { try { const r = a.getBoundingClientRect(); if (r.top < 60 || r.top > innerHeight * 0.6) a.scrollIntoView({block: 'start', behavior: (V30.off && V30.off()) ? 'auto' : 'smooth'}); } catch (x) {} }, 300);
  };
  D.akordiyon = function () {
    const son = D.acik();
    $.querySelectorAll('article.card.unit').forEach((a, i) => {
      if (a.classList.contains('ak55')) return;
      const tl = a.querySelector(':scope > .tlist'), hd = a.querySelector(':scope > .uhead'); if (!tl || !hd) return;
      a.querySelectorAll(':scope > .ak54').forEach((x) => x.remove());   // V54 yarım akordiyon düğmesi
      const id = (a.querySelector('.fx-ub') && ((a.querySelector('.fx-ub').getAttribute('onclick') || '').match(/id:'([^']+)'/) || [])[1]) || ('u' + i);
      const R = [...tl.querySelectorAll('.trow')], n = R.length || tl.children.length, mt = (Store.ov && Store.ov.mt) || {};
      const tam = R.filter((r) => { const t = ((r.getAttribute('onclick') || '').match(/t:'([^']+)'/) || [])[1], x = t && mt[t]; return x && x.n && x.ok / x.n >= 0.7; }).length;
      a.classList.add('ak55'); a.dataset.u = id;
      // gövde: başlık ve ilerleme çubuğu dışındaki her şey
      const g = document.createElement('div'); g.className = 'ak55-g'; g.id = 'ak55-' + i;
      const ic = document.createElement('div'); ic.className = 'ak55-i'; g.appendChild(ic);
      [...a.children].filter((c) => c !== hd && !c.classList.contains('bar')).forEach((c) => ic.appendChild(c));
      a.appendChild(g);
      const bilgi = hd.querySelector('p.mut');
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ak55-b'; b.setAttribute('aria-controls', g.id);
      b.setAttribute('aria-label', `${(hd.querySelector('h2') || {}).textContent || 'Ünite'} — ${n} konu`);
      b.innerHTML = `<span class="ak55-n">${n} konu${tam ? ` · ${tam} tamam` : ''}</span>${CHEV}`;
      b.onclick = (ev) => { ev.stopPropagation(); D.cevir(b); };
      hd.appendChild(b); hd.classList.add('ak55-h');
      hd.onclick = () => D.cevir(b);
      if (bilgi && !bilgi.classList.contains('ak55-s')) bilgi.classList.add('ak55-s');
      D.ayarla(a, son === id);
    });
  };
  V54.Duzen.akordiyon = D.akordiyon;   // V54 draw sarmalayıcısı bunu çağırır

  /* ---------- 2. alt menü seçili durumu ---------- */
  D.ALT = {pdunya: 'kor', psinif: 'sinif', punite: 'sinif', pders: 'sinif', pozet: 'sinif', grade: 'sinif', topic: 'sinif', classes: 'sinif',
    poyun: 'oyun', poyna: 'oyun', aoyun53: 'oyun', games: 'oyun', game: 'oyun',
    calis45: 'calis', acalis53: 'calis', pek: 'calis', pekbol: 'calis', dene: 'calis', yanlis: 'calis', test: 'calis', cards: 'calis', exams: 'calis', exam: 'calis',
    profil46: 'profil', ayar47: 'profil', pfav: 'profil', pilerleme: 'profil'};
  D.ELMAS = {home: 'home', classes: 'classes', grade: 'classes', topic: 'classes', book: 'classes', games: 'games', game: 'games',
    calis45: 'calis', pek: 'calis', pekbol: 'calis', dene: 'calis', yanlis: 'calis', test: 'calis', cards: 'calis', exams: 'calis', exam: 'calis',
    profil46: 'profil', ayar47: 'profil', pfav: 'profil', pilerleme: 'profil'};
  D.altMenu = function () {
    const n = document.getElementById('bn50');
    if (n && !n.hidden) {
      const k = D.ALT[view] || '';
      n.querySelectorAll('button[data-k]').forEach((b) => { const on = b.dataset.k === k; b.classList.toggle('on', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); });
    }
    const el = document.querySelector('nav.bnav');
    if (el && !altin()) {
      const ks = [...el.querySelectorAll('button[data-k]')].map((b) => b.dataset.k), k = D.ELMAS[view];
      if (k && ks.includes(k)) el.querySelectorAll('button[data-k]').forEach((b) => { const on = b.dataset.k === k; b.classList.toggle('on', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); });
    }
  };
  if (window.V50 && V50.Nav && V50.Nav.ciz) { const c0 = V50.Nav.ciz; V50.Nav.ciz = function () { const r = c0.apply(this, arguments); try { D.altMenu(); } catch (x) {} return r; }; }

  /* ---------- 3. Elmas Çalışma Merkezim: sade ---------- */
  D.temel = function () {
    let s = 0; try { s = (V53.Hesap && V53.Hesap.sinif()) || 0; } catch (x) {}
    const ov = Store.ov || {}, mt = ov.mt || {}, prog = ov.prog || {};
    let TP = []; try { TP = Store.all('topics').filter((t) => (!s || +t.grade === s) && vis(t) && !t.parentId && (typeof pvOf !== 'function' || t.programYear === pvOf(+t.grade))); } catch (x) {}
    const tam = TP.filter((t) => { const r = mt[t.id]; return r && r.n && r.ok / r.n >= 0.7; }).length;
    let d = 0, y = 0;
    Object.entries(prog).forEach(([oid, p]) => { if (!p) return; const m = oid.match(/^DKAB(?:18)?-(\d+)-/); if (s && (!m || +m[1] !== s)) return; d += +p.correct || 0; y += +p.wrong || 0; });
    return {s, TP: TP.length, tam, d, y, oran: d + y ? Math.round(100 * d / (d + y)) : null};
  };
  D.elmasCalis = function () {
    if (view !== 'calis45' || altin() || $.querySelector('.ec55')) return;
    const k = $.querySelector('.c48'); if (!k) return;
    // gelişmiş bölümler Elmas'tan kalkar (Altın Çalışma Masam'da)
    const kaldir = (el) => { if (el) el.remove(); };
    [...k.querySelectorAll(':scope > .c48-bas')].forEach((b) => {
      const t = b.textContent || '';
      if (/Sana önerilenler|Zayıf kazanımlar|Konu başarı durumu/.test(t)) {
        let n = b.nextElementSibling;
        while (n && !n.classList.contains('c48-bas') && !(n.tagName === 'DETAILS' && n.classList.contains('c48-d')) && !n.classList.contains('c48-not')) { const m = n.nextElementSibling; kaldir(n); n = m; }
        kaldir(b);
      }
    });
    k.querySelectorAll('.c48-hfk').forEach(kaldir);   // 7 günlük grafik
    const T = D.temel();
    const html = `<section class="ec55" aria-labelledby="ec55-h"><h2 id="ec55-h">Temel ilerlemem</h2><div class="ec55-g">
<div class="ec55-k"><b>${T.tam}<small>/${T.TP}</small></b><span>Tamamlanan konu${T.s ? ` · ${T.s}. sınıf` : ''}</span><i class="ec55-bar"><i style="width:${T.TP ? Math.round(100 * T.tam / T.TP) : 0}%"></i></i></div>
<div class="ec55-k"><b>${T.oran == null ? '—' : '%' + T.oran}</b><span>Genel kazanım başarısı</span><small>${T.d + T.y ? `${T.d} doğru · ${T.y} yanlış cevap` : 'Henüz cevap yok. Test çözdükçe hesaplanır.'}</small></div></div>
<p class="ec55-a">Bir konunun mini testinde %70 ve üstü yaptığında konu tamamlanmış sayılır.</p></section>`;
    const ust = k.querySelector('.c48-ust');
    if (ust) ust.insertAdjacentHTML('afterend', html); else k.insertAdjacentHTML('beforeend', html);
  };

  /* ---------- 4. Dinleme Merkezi: tek düğme ---------- */
  D.dinleUrl = () => { try { const u = String((SD.ld().playlist || {}).url || ''); return /^https:\/\/(www\.)?youtube\.com\/playlist\?list=[\w-]+$/.test(u) ? u : ''; } catch (x) { return ''; } };
  D.dugme = () => { const u = D.dinleUrl(); return u ? `<a class="sd-btn yt sd55-dl" href="${e(u)}" target="_blank" rel="noopener noreferrer">Duaları Dinleyelim</a>` : ''; };
  if (typeof SD !== 'undefined') {
    SD.dinle = function () {
      const pl = SD.ld().playlist || {}, u = D.dinleUrl();
      return `<section class="sd-sec sd55"><h2>Dinleme Merkezi</h2>${u ? `<p class="sd-mut">${e(pl.title || 'Sureler ve dualar')} oynatma listesi YouTube'da açılır.</p><div class="sd-row">${D.dugme()}</div>` : '<p class="sd-mut">Kaynakta veri bulunmuyor.</p>'}</section>
${editor() ? `<details class="card"><summary>Eşleştirme durumu (${SD.ld().items.length} kayıt) · yalnız editör</summary><ul class="sd-st">${SD.ld().items.map((i) => `<li>${e(i.title)} — ${i.audio && i.audio.videoId ? 'eşleşti' : 'eşleştirilmedi'}</li>`).join('')}</ul></details>` : ''}`;
    };
    SD.loadPl = function () {};
    const det0 = SD.detail;
    SD.detail = function (i) {
      const r = det0.apply(this, arguments);
      try {
        const s = [...$.querySelectorAll('.sd-det .sd-sec')].find((x) => /Dinle ve Öğren/.test((x.querySelector('h2') || {}).textContent || ''));
        if (s) s.innerHTML = D.dinleUrl() ? `<h2>Dinle</h2><p class="sd-mut">Sure ve duaları dinlemek için oynatma listesini aç.</p><div class="sd-row">${D.dugme()}</div>` : '<h2>Dinle</h2><p class="sd-mut">Kaynakta veri bulunmuyor.</p>';
      } catch (x) {}
      return r;
    };
  }

  /* ---------- 5. editoryal bilgi yalnız editöre ---------- */
  D.editoryal = function () {
    if (editor()) return;
    $.querySelectorAll('.pr49-k, .p46-pg').forEach((k) => { if (/İçeriği hazır/i.test(k.textContent || '')) k.remove(); });
    $.querySelectorAll('.p39-un small, .ak55-s, .hero .lead, p.mut').forEach((s) => {
      const t = s.textContent || '';
      if (/içeriği hazır|taslak içeriği|taslak hazır/i.test(t)) s.textContent = t.replace(/\s*·?\s*\d+\s*(?:\/\s*\d+\s*)?konunun (?:taslak )?içeriği hazır(?: \(taslak\))?/gi, '').replace(/\s*·\s*\d+\/\d+ taslak hazır/gi, '').replace(/^\s*·\s*/, '').trim();
    });
  };

  /* ---------- 6. stiller ---------- */
  try {
    const st = document.createElement('style'); st.id = 'v55-duzen-css';
    st.textContent = `
article.card.unit.ak55{padding-bottom:12px}
article.ak55>.uhead.ak55-h{cursor:pointer;display:flex;align-items:center;gap:12px;-webkit-tap-highlight-color:transparent}
article.ak55>.uhead.ak55-h>div{flex:1;min-width:0}
.ak55-b{display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:2px;flex:none;min-width:64px;min-height:48px;margin:0;padding:6px 8px;border:1px solid var(--line);border-radius:12px;background:var(--surface2,var(--surface));color:var(--ink);font:inherit;cursor:pointer}
.ak55-b .ak55-n{font-size:.8rem;font-weight:700;color:var(--mut);white-space:nowrap}
.ak55-c{transition:transform .28s ease}.ak55.ak55-ac .ak55-c{transform:rotate(180deg)}
.ak55-g{display:grid;grid-template-rows:0fr;transition:grid-template-rows .3s ease,opacity .3s ease;opacity:0}
.ak55.ak55-ac .ak55-g{grid-template-rows:1fr;opacity:1}
.ak55-i{min-height:0;overflow:hidden}
.ak55-i>.tlist,.ak55-i>.tlist[hidden]{display:block!important;margin-top:10px}
.ak55-g[inert] .ak55-i{visibility:hidden;transition:visibility 0s .3s}
.ak55.ak55-ac .ak55-i{visibility:visible}
@media (prefers-reduced-motion:reduce){.ak55-g,.ak55-c{transition:none}}
.ec55{margin:16px 0;padding:16px;border-radius:18px;border:1px solid var(--line);background:var(--surface)}
.ec55 h2{margin:0 0 12px;font-size:1.05rem}.ec55-g{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ec55-k{display:flex;flex-direction:column;gap:4px;padding:12px;border-radius:14px;background:var(--surface2,var(--surface));border:1px solid var(--line)}
.ec55-k b{font-size:1.5rem}.ec55-k b small{font-size:.85rem;color:var(--mut)}.ec55-k span{font-weight:600}.ec55-k>small{color:var(--mut);font-size:.8rem}
.ec55-bar{display:block;height:6px;border-radius:99px;background:var(--line);overflow:hidden}.ec55-bar i{display:block;height:100%;background:var(--pri)}
.ec55-a{margin:10px 0 0;color:var(--mut);font-size:.85rem}
.sd55-dl{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:10px 22px;font-weight:700}
`;
    document.head.appendChild(st);
  } catch (x) {}

  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try { D.elmasCalis(); } catch (x) { console.warn('[V55] çalışma', x); }
    try { D.editoryal(); } catch (x) {}
    try { D.altMenu(); } catch (x) {}
    return r;
  };
})();
