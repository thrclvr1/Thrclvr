/* ===================== V60.0 (2/3): Altın koridor üst çubuğu ve “Önerilen” etiketleri =====================
   1) Altın koridor (pdunya) üst çubuğu: Ara ve Ses simgeleri çubuktan alınır; koridorun hemen altına Elmas'taki gibi bir arama
      alanı (dokununca mevcut Altın araması V39.ara açılır — işlevi aynı) ve yanında ses düğmesi (V37.sndOpen) gelir.
      Üst çubukta boşalan yere gündüz/gece düğmesi (V43.cevir) konur.
   2) Tema seçim ekranındaki “Önerilen” işaretleri (yalnız işaret; seçili temadan bağımsız, kayıt/geçiş mekanizmasına dokunmaz):
      Altın: Altın Mihrap (gündüz ve gece), Elmas · Açık, Elmas · Koyu. Öğretmen: yalnız Altın Mihrap (gündüz). */
(function () {
  const V60 = window.V60 = window.V60 || {};
  const U = V60.Ust = {};
  const SVG = (p, s) => `<svg width="${s || 22}" height="${s || 22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const GUNES = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  const AY = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  const ARA = '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>';
  const SES = '<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>';
  U.gece = () => document.documentElement.getAttribute('data-pt43') !== 'gunduz';
  U.temaDugme = () => `<button type="button" class="ib40 t60" onclick="V60.Ust.cevir()" aria-label="${U.gece() ? 'Gündüz görünümüne geç' : 'Gece görünümüne geç'}" title="Gündüz / gece">${SVG(U.gece() ? GUNES : AY)}</button>`;
  U.cevir = function () {
    try { V43.cevir(); } catch (x) { try { V43.ayarla(U.gece() ? 'gunduz' : 'gece'); } catch (y) {} }
    document.querySelectorAll('.ust40 .t60').forEach((b) => b.outerHTML = U.temaDugme());
  };
  U.araHTML = () => `<section class="ara60" role="search" aria-label="Arama ve ses"><button type="button" class="ara60-k" onclick="V39.ara()" aria-label="Ara: konu, kavram, kişi, kazanım"><span>Konu, kavram, kişi ara…</span><i aria-hidden="true">${SVG(ARA, 20)}</i></button><button type="button" class="ara60-s" onclick="V37.sndOpen()" aria-label="Ses kontrolü">${SVG(SES, 22)}</button></section>`;
  U.duzenle = function () {
    if (view !== 'pdunya') return;
    const u = document.querySelector('.ust40'); if (!u || u.dataset.u60) return;
    u.dataset.u60 = '1';
    u.querySelectorAll('.ib40').forEach((b) => b.remove());
    u.insertAdjacentHTML('beforeend', U.temaDugme());
    const sh = document.querySelector('#app .sahne40');
    if (sh && !document.querySelector('#app .ara60')) sh.insertAdjacentHTML('afterend', U.araHTML());
  };
  const d0 = draw;
  window.draw = draw = function () { const r = d0.apply(this, arguments); try { U.duzenle(); } catch (x) { console.warn('[V60] üst çubuk', x); } return r; };
  try { const c0 = V43.uygula; if (c0) V43.uygula = function () { const r = c0.apply(this, arguments); try { document.querySelectorAll('.ust40 .t60').forEach((b) => b.outerHTML = U.temaDugme()); } catch (x) {} return r; }; } catch (x) {}

  /* ---------- Önerilen ---------- */
  const YILDIZ = '<svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
  U.rozet = (ek, alt) => `<span class="on58 on60 ${ek}" aria-label="Önerilen${alt ? ' (' + alt + ')' : ''}">${YILDIZ}Önerilen${alt ? `<i>${alt}</i>` : ''}</span>`;
  try {
    const TM = V54.Tema, ic0 = TM.icerik;
    TM.icerik = function (yer) {
      let h = String(ic0.apply(this, arguments)).replace(/<span class="on58[^"]*"[^>]*>[\s\S]*?Önerilen<\/span>/g, '');
      if (yer === 'altin') {
        h = h.replace('<b>Altın Mihrap</b>', '<b>Altın Mihrap</b>' + U.rozet('al', 'gündüz ve gece'));
        h = h.replace('<b>Elmas · Açık</b>', '<b>Elmas · Açık</b>' + U.rozet('el'));
        h = h.replace('<b>Elmas · Koyu</b>', '<b>Elmas · Koyu</b>' + U.rozet('el'));
      } else if (yer === 'ogretmen') {
        h = h.replace('<b>Altın Mihrap</b>', '<b>Altın Mihrap</b>' + U.rozet('al', 'gündüz'));
      }
      return h;
    };
  } catch (x) { console.warn('[V60] önerilen', x); }

  const css = `
.ust40 .t60{color:inherit}
.ara60{display:flex;gap:10px;align-items:center;margin:14px 16px 4px;position:relative;z-index:2}
.ara60-k{flex:1;min-width:0;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:54px;padding:0 6px 0 16px;border-radius:999px;border:1px solid color-mix(in srgb,var(--p-gold) 38%,transparent);background:color-mix(in srgb,var(--p-card) 92%,transparent);color:var(--p-mut);font:inherit;font-size:.92rem;text-align:left;box-shadow:0 8px 22px -14px rgba(0,0,0,.55),inset 0 1px 0 color-mix(in srgb,var(--p-gold) 14%,transparent);cursor:pointer}
.ara60-k span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ara60-k i{flex:none;display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:linear-gradient(180deg,var(--p-gold),var(--p-gold2,var(--p-gold)));color:var(--p-bg,#1a1206);font-style:normal;box-shadow:0 4px 12px -4px color-mix(in srgb,var(--p-gold) 70%,transparent)}
.ara60-s{flex:none;display:grid;place-items:center;width:54px;height:54px;border-radius:50%;border:1px solid color-mix(in srgb,var(--p-gold) 38%,transparent);background:color-mix(in srgb,var(--p-card) 92%,transparent);color:var(--p-gold);cursor:pointer;box-shadow:0 8px 22px -14px rgba(0,0,0,.55)}
.ara60-k:focus-visible,.ara60-s:focus-visible{outline:2px solid var(--p-gold);outline-offset:3px}
.on58.on60{gap:4px;padding:1px 8px 1px 6px;font-size:.64rem;font-weight:700;letter-spacing:.02em}
.on58.on60 i{font-style:normal;font-weight:600;opacity:.85;margin-left:2px}
.on58.on60 i::before{content:"· "}
`;
  try { const st = document.createElement('style'); st.id = 'v600-ust-css'; st.textContent = css; document.head.appendChild(st); } catch (x) {}
})();
