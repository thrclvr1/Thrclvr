/* ===================== V43.0: Premium tema sistemi (Gündüz / Gece / Otomatik), ders sayfası, kart düzeni =====================
   Tercih: localStorage "dk-ptema43" = "gunduz" | "gece" | "oto" (varsayılan "gece"). Klasik tema ("dk-theme") ayrı kalır.
   Premium açıkken <html data-pt43> ve <html data-theme> Premium temasını izler (Klasik'in açık/koyu kuralları Premium'a
   karışmasın diye); Premium'dan çıkınca data-theme Klasik tercihe döner. İlk boyama öncesi aynı karar <head>'de verilir. */
window.V43 = window.V43 || {};
(function () {
  const $id = (i) => document.getElementById(i);
  const SVG = (p, s) => `<svg width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  V43.IC = {
    gunes: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
    ay: '<path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7z"/>',
    oto: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17" /><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/>',
    ok: '<path d="M9 6l6 6-6 6"/>'
  };
  V43.svg = (k, s) => SVG(V43.IC[k] || '', s);
  V43.K = 'dk-ptema43';
  V43.AD = {gunduz: 'Gündüz', gece: 'Gece', oto: 'Otomatik'};
  V43.tercih = function () { try { const v = localStorage.getItem(V43.K); return V43.AD[v] ? v : 'gece'; } catch (e) { return 'gece'; } };
  V43.mq = window.matchMedia ? matchMedia('(prefers-color-scheme: light)') : {matches: false};
  V43.cozum = () => { const t = V43.tercih(); return t === 'oto' ? (V43.mq.matches ? 'gunduz' : 'gece') : t; };
  V43.klasikTema = () => { try { return localStorage.getItem('dk-theme') || 'dark'; } catch (e) { return 'dark'; } };
  V43.premAktif = () => !!V39.on && !(V39.NOPREM || []).includes(view);
  V43.RENK = {gunduz: '#F2EADB', gece: '#130E0A'};
  V43.uygula = function () {
    const de = document.documentElement, p = V43.premAktif();
    let th;
    if (p) { const m = V43.cozum(); if (de.dataset.pt43 !== m) de.dataset.pt43 = m; th = m === 'gunduz' ? 'light' : 'dark'; }
    else { if (de.hasAttribute('data-pt43')) de.removeAttribute('data-pt43'); th = V43.klasikTema(); }
    if (de.dataset.theme !== th) de.dataset.theme = th;
    try { const mt = document.querySelector('meta[name="theme-color"]'); const c = p ? V43.RENK[V43.cozum()] : (th === 'light' ? '#F5F7FB' : '#0B1020'); if (mt && mt.content !== c) mt.content = c; } catch (e) {}
  };
  V43.boya = function () {
    const m = V43.cozum();
    document.querySelectorAll('.t43').forEach((b) => { b.innerHTML = V43.svg(m === 'gunduz' ? 'ay' : 'gunes', 20); b.setAttribute('aria-label', m === 'gunduz' ? 'Gece moduna geç' : 'Gündüz moduna geç'); b.title = b.getAttribute('aria-label'); });
    try { const L = UI._stack[UI._stack.length - 1]; if (L && L.box && L.box.querySelector('.t43-seg')) L.refresh(); } catch (e) {}
  };
  V43.ayarla = function (v) {
    if (!V43.AD[v]) return;
    try { localStorage.setItem(V43.K, v); } catch (e) {}
    const de = document.documentElement, f = () => { V43.uygula(); V43.boya(); };
    de.classList.add('pt43-gecis');
    const az = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !az) { try { document.startViewTransition(f); } catch (e) { f(); } } else f();
    setTimeout(() => de.classList.remove('pt43-gecis'), 450);
    try { UI.toast(V43.AD[v] + ' modu' + (v === 'oto' ? ' (cihaz teması: ' + V43.AD[V43.cozum()] + ')' : '')); } catch (e) {}
  };
  V43.cevir = () => V43.ayarla(V43.cozum() === 'gunduz' ? 'gece' : 'gunduz');
  try { V43.mq.addEventListener('change', () => { if (V43.tercih() === 'oto') { V43.uygula(); V43.boya(); } }); } catch (e) {}
  V43.dugme = (cls) => { const m = V43.cozum(), l = m === 'gunduz' ? 'Gece moduna geç' : 'Gündüz moduna geç'; return `<button type="button" class="t43 ${cls || ''}" onclick="V43.cevir()" aria-label="${l}" title="${l}">${V43.svg(m === 'gunduz' ? 'ay' : 'gunes', 20)}</button>`; };
  V43.secici = () => { const t = V43.tercih(); return `<div class="t43-k"><b>Premium görünüm</b><div class="t43-seg" role="radiogroup" aria-label="Premium görünüm">${['gunduz', 'gece', 'oto'].map((k) => `<button type="button" role="radio" aria-checked="${t === k}" class="${t === k ? 'on' : ''}" onclick="V43.ayarla('${k}')">${V43.svg(k === 'gunduz' ? 'gunes' : k === 'gece' ? 'ay' : 'oto', 18)}<span>${V43.AD[k]}</span></button>`).join('')}</div><small>${t === 'oto' ? 'Cihazın sistem temasını izler; şu an ' + V43.AD[V43.cozum()].toLocaleLowerCase('tr-TR') + '.' : 'Otomatik seçilirse cihazın sistem temasını izler.'} Klasik alanın teması ayrıdır.</small></div>`; };

  // Üst çubuklar: tema düğmesi
  const top0 = V39.top;
  V39.top = function () { return top0.apply(this, arguments).replace('<button type="button" class="p39-ib p39-sw dg42"', V43.dugme('p39-ib') + '<button type="button" class="p39-ib p39-sw dg42"'); };
  if (typeof V40 !== 'undefined' && V40.ustHTML) {
    const u0 = V40.ustHTML;
    V40.ustHTML = function () { return u0.apply(this, arguments).replace(/(<button type="button" class="dg42 yuz"[\s\S]*?<\/button>)/, '<div class="yuz43">$1' + V43.dugme('yuz') + '</div>'); };
  }
  // Profil: Gündüz / Gece / Otomatik
  if (typeof V40 !== 'undefined' && V40.profil) {
    const p0 = V40.profil;
    V40.profil = function () { const r = p0.apply(this, arguments); try { const L = UI._stack[UI._stack.length - 1]; if (L && L.o) { const ob = L.o.body; L.o.body = (...a) => { const h = typeof ob === 'function' ? ob(...a) : ob; return h.replace('<div class="pf40-g">', V43.secici() + '<div class="pf40-g">'); }; L.refresh(); } } catch (e) {} return r; };
  }

  // Krem ders sayfası: ders sekmeleri ve sınıf özeti
  // Premium'a ödünç gelen Klasik ekranların şeridi (#p39bar): tema düğmesi
  V43.serit = function () { const bar = $id('p39bar'); if (bar && !bar.querySelector('.t43')) { const d = bar.querySelector('.dg42'); const t = document.createElement('div'); t.innerHTML = V43.dugme('bar'); if (d) d.before(t.firstChild); else bar.appendChild(t.firstChild); } };
  V43.kagit = function () {
    if (!V43.premAktif()) return;
    document.querySelectorAll('.p39-ders .p39-pane').forEach((e) => e.classList.add('p43-kagit'));
  };

  // Oyun kartı (Premium): başlık, sınıf · konu, açıklama, sayı, kaynak durumu, giriş işareti ayrı katmanlarda
  if (typeof gCard === 'function') {
    const g0 = gCard;
    gCard = function (g) {
      if (!V39.on) return g0.apply(this, arguments);
      try {
        const b = gsc()[g.id], u = Store.get('units', g.unitId), t = g.topicId ? Store.get('topics', g.topicId) : null, pc = b && b.max ? Math.round(100 * b.best / b.max) : 0;
        const ad = (GT && GT[g.gameType]) || g.title, parca = String(g.title || '').split(' · '), konu = t ? t.title : (parca.length > 1 ? parca[0] : (u ? u.title : ''));
        const dv = g.dogrulama ? (g.dogrulama.durum && DVL[g.dogrulama.durum] ? g.dogrulama.durum : 'kaynak-kontrolunden-gecti') : '';
        const dur = dv ? `<span class="d43 ${dv === 'kaynak-kontrolunden-gecti' ? 'ok' : dv === 'kaynak-yetersiz' ? 'uy' : dv === 'duzeltme-gerekiyor' ? 'kt' : 'bek'}">${esc(DVL[dv] || dv)}</span><span class="d43 bek">Editör onayı bekliyor</span>` : '';
        return `<button class="kart43" data-t="${esc(g.gameType)}" onclick="playGame('${g.id}')" aria-label="${esc(g.title)} oyununu aç"><span class="k43-ic">${gArt(g.gameType)}</span>
<span class="k43-ic2"><span class="k43-ust">${g.grade}. sınıf · ${esc(gScope(g))}${S.prog === 'all' ? ' · ' + esc(progLab(g.programYear)) : ''}</span><b class="k43-bas">${esc(ad)}</b>${konu ? `<span class="k43-konu">${esc(konu)}</span>` : ''}
<span class="k43-ac">${esc((GD && GD[g.gameType]) || '')}${u && konu !== u.title ? ' · ' + esc(u.title) : ''}</span>
<span class="k43-alt"><span class="k43-say">${gItems(g)} öğe</span>${b ? `<span class="k43-say en">En iyi: ${b.best}/${b.max} (%${pc})</span>` : ''}${dur}</span></span><span class="k43-git">${V43.svg('ok', 20)}</span></button>`;
      } catch (e) { return g0.apply(this, arguments); }
    };
  }

  // draw: önce tema (ekran doğru renklerle çizilsin), sonra ders sayfası sınıfı ve düğme durumları
  const d0 = draw;
  draw = function () { V43.uygula(); const r = d0.apply(this, arguments); V43.uygula(); V43.kagit(); V43.serit(); return r; };
  try { V43.uygula(); V43.kagit(); } catch (e) { console.warn('[V43] tema', e); }
})();
