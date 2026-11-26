/* ===================== V57.0 (4/4): Oyun bul — modern seçim penceresi =====================
   “Oyun bul” panelindeki (.gf56) sistem açılır listeleri (koyu gri, küçük) yerine uygulamanın tasarım diliyle seçim penceresi:
   alt kenardan açılan kart, büyük dokunma alanları (≥ 52 px), seçili seçenek vurgulu ve işaretli, uzun listeler kendi içinde
   kaydırılır, ekran dışına taşmaz. Asıl <select> sayfada (gizli) kalır; seçim onun değerini değiştirip “change” olayını tetikler,
   böylece mevcut süzgeç işlevleri (gSet) aynen çalışır. Kapatma: dışarı dokunma, Kapat, Escape; yeni çizimde kendiliğinden kapanır. */
(function () {
  const V57 = window.V57 = window.V57 || {};
  const SC = V57.Secici = {};
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const CHEV = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const TIK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
  let sayac = 0;
  SC.bagla = function (kok) {
    (kok || document).querySelectorAll('.gf56 select').forEach((s) => {
      if (s.dataset.sc57) return;
      const id = 'sc57-' + (++sayac); s.dataset.sc57 = id; s.classList.add('sc57-gizli'); s.tabIndex = -1; s.setAttribute('aria-hidden', 'true');
      const lab = (s.closest('label') && s.closest('label').querySelector('span')) ? s.closest('label').querySelector('span').textContent.trim() : 'Seç';
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'sc57-b'; b.id = id; b.setAttribute('aria-haspopup', 'listbox');
      const yaz = () => { const o = s.options[s.selectedIndex]; b.innerHTML = `<span class="sc57-v">${e(o ? o.text : '')}</span>${CHEV}`; b.setAttribute('aria-label', `${lab}: ${o ? o.text : ''}`); b.classList.toggle('dolu', !!(o && o.value)); };
      yaz(); b.onclick = () => SC.ac(s, lab, b);
      s.insertAdjacentElement('afterend', b);
    });
  };
  SC.kapat = function () { const o = document.getElementById('sc57-ov'); if (o) o.remove(); document.documentElement.classList.remove('sc57-acik'); if (SC._d) { try { SC._d.focus({preventScroll: true}); } catch (x) {} SC._d = null; } };
  SC.ac = function (s, lab, dugme) {
    SC.kapat(); SC._d = dugme;
    const ov = document.createElement('div'); ov.id = 'sc57-ov'; ov.className = 'sc57-ov';
    const opts = [...s.options].map((o, i) => ({i, v: o.value, t: o.text, on: i === s.selectedIndex}));
    ov.innerHTML = `<div class="sc57-k" role="dialog" aria-modal="true" aria-labelledby="sc57-h"><div class="sc57-tut" aria-hidden="true"></div><div class="sc57-bas"><h3 id="sc57-h">${e(lab)}</h3><button type="button" class="sc57-x" aria-label="Kapat">Kapat</button></div>
<ul class="sc57-l" role="listbox" aria-label="${e(lab)}">${opts.map((o) => `<li role="option" aria-selected="${o.on}"><button type="button" class="sc57-o ${o.on ? 'on' : ''}" data-i="${o.i}"><span>${e(o.t)}</span>${o.on ? TIK : ''}</button></li>`).join('')}</ul></div>`;
    ov.addEventListener('click', (ev) => { if (ev.target === ov || ev.target.closest('.sc57-x')) { SC.kapat(); return; } const o = ev.target.closest('.sc57-o'); if (!o) return; const i = +o.dataset.i; SC.kapat(); if (i !== s.selectedIndex) { s.selectedIndex = i; s.dispatchEvent(new Event('change', {bubbles: true})); } });
    ov.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') SC.kapat(); });
    document.body.appendChild(ov); document.documentElement.classList.add('sc57-acik');
    const sec = ov.querySelector('.sc57-o.on') || ov.querySelector('.sc57-o');
    if (sec) { try { sec.scrollIntoView({block: 'center'}); sec.focus({preventScroll: true}); } catch (x) {} }
  };
  try {
    const st = document.createElement('style'); st.id = 'v57-secici-css';
    st.textContent = `
.sc57-gizli{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden}
.sc57-b{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:50px;padding:8px 14px;border-radius:14px;border:1px solid var(--p-line,var(--line));background:var(--p-card2,var(--surface2,var(--surface)));color:var(--p-ink,var(--ink));font:inherit;font-weight:600;text-align:left;cursor:pointer;transition:border-color .2s ease,box-shadow .2s ease}
.sc57-b.dolu{border-color:color-mix(in srgb,var(--p-gold,var(--pri)) 55%,var(--p-line,var(--line)));box-shadow:0 0 0 1px color-mix(in srgb,var(--p-gold,var(--pri)) 30%,transparent) inset}
.sc57-b .sc57-v{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sc57-b svg{flex:none;color:var(--p-mut,var(--mut))}
.sc57-ov{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-end;justify-content:center;background:rgba(5,8,16,.55);animation:sc57a .2s ease both}
.sc57-k{width:min(100%,560px);max-height:min(78vh,640px);display:flex;flex-direction:column;padding:8px 14px calc(14px + env(safe-area-inset-bottom));border-radius:24px 24px 0 0;border:1px solid var(--p-line,var(--line));border-bottom:0;background:var(--p-card,var(--surface));color:var(--p-ink,var(--ink));box-shadow:0 -14px 40px -16px rgba(0,0,0,.6);animation:sc57b .26s cubic-bezier(.2,.8,.2,1) both}
.sc57-tut{width:44px;height:5px;margin:2px auto 8px;border-radius:99px;background:color-mix(in srgb,var(--p-ink,var(--ink)) 22%,transparent)}
.sc57-bas{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 4px 10px;border-bottom:1px solid var(--p-line,var(--line))}
.sc57-bas h3{margin:0;font-size:1.05rem}.sc57-x{min-height:40px;padding:4px 14px;border-radius:999px;border:1px solid var(--p-line,var(--line));background:none;color:var(--p-ink,var(--ink));font:inherit;font-weight:600;cursor:pointer}
.sc57-l{list-style:none;margin:8px 0 0;padding:0 2px;display:grid;gap:6px;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.sc57-o{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:52px;padding:10px 14px;border-radius:14px;border:1px solid transparent;background:color-mix(in srgb,var(--p-ink,var(--ink)) 4%,transparent);color:var(--p-ink,var(--ink));font:inherit;font-size:.98rem;text-align:left;line-height:1.35;cursor:pointer}
.sc57-o span{flex:1;min-width:0;overflow-wrap:anywhere}
.sc57-o.on{background:color-mix(in srgb,var(--p-gold,var(--pri)) 16%,var(--p-card2,var(--surface2,var(--surface))));border-color:color-mix(in srgb,var(--p-gold,var(--pri)) 60%,transparent);font-weight:700}
.sc57-o.on svg{color:var(--p-gold-t,var(--pri))}
.sc57-o:active{transform:scale(.99)}
html.sc57-acik #bn50,html.sc57-acik nav.bnav{visibility:hidden}
@keyframes sc57a{from{opacity:0}to{opacity:1}}@keyframes sc57b{from{transform:translateY(24px);opacity:.6}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.sc57-ov,.sc57-k{animation:none}}
`;
    document.head.appendChild(st);
  } catch (x) {}
  if (typeof draw === 'function') {
    const dr0 = draw;
    window.draw = draw = function () {
      SC.kapat();
      const r = dr0.apply(this, arguments);
      try { SC.bagla($); } catch (x) { console.warn('[V57] seçici', x); }
      return r;
    };
  }
})();
