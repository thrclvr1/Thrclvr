/* ===================== V58.0 (2/4): Bilgi Atlası (Altın'da da) + bütün kategorilerde arama + Altın'da Bağlantılar kartı =====================
   • Altın ana sayfa Keşif: “Kavramlar” ve “Kişiler ve Eserler” ayrı kartları tek “Bilgi Atlası” kartında birleşir (rota atlas57, V57).
     Bilgi Atlası'nın altyapısı aynı (V57.Atlas + KV sözlük kayıtları); yeni sistem yok.
   • Arama (Elmas ve Altın): Bilgi Atlası'ndaki arama kutusu yalnız açık sekmede değil, Kavramlar · Kişiler · Eserler · Diğer kayıtlar
     hepsinde arar. Sonuçlar kategorilere göre gruplanır; üstteki sekmeler arama sırasında kategori süzgecidir (Tümü + kategoriler).
     Sınıf ve program süzgeçleri bütün kategorilere birlikte uygulanır. Kayıt listesi KV.items ile alınır: gizlenen kayıtlar
     (V34) ve yayın kuralları eskisi gibi uygulanır. Kayıt kartı aynı (KV.card).
   • Altın ana sayfa: Bağlantılar özelliği aynen; yalnız sunumu öne çıkar (.bg58): öğrencinin sınıfından gerçek bir kavram ve
     ders metninde onunla birlikte geçen kavramlar (KV.rel — Bağlantılar'daki “bağlantılı kavramlar” ile aynı ölçüt) küçük bir
     harita olarak çizilir. Dokununca mevcut Bağlantılar › Kavram Haritası açılır. */
(function () {
  if (typeof KV === 'undefined' || !window.V57 || !V57.Atlas || typeof V30 === 'undefined') return;
  const V58 = window.V58 = window.V58 || {};
  const A = V58.Atlas = {};
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const altin = () => { try { return !!V39.on; } catch (x) { return false; } };
  const sinif = () => { try { return (V53.Hesap && +V53.Hesap.sinif()) || 0; } catch (x) { return 0; } };
  A.KAT = [['kavram', 'Kavramlar', 'concepts', ''], ['kisi', 'Kişiler', 'entities', 'kisi'], ['eser', 'Eserler', 'entities', 'eser'], ['diger', 'Diğer kayıtlar', 'entities', '']];
  A.N = 12;

  /* ---------- arama: bütün kategoriler ---------- */
  A.sonuc = function (q) {
    const o = {}, st = KV.st, yedek = {c: Object.assign({}, st.concepts), e: Object.assign({}, st.entities)};
    try {
      st.concepts.q = q; st.concepts.t = ''; o.kavram = KV.items('concepts');
      st.entities.q = q; st.entities.t = ''; const E = KV.items('entities');
      o.kisi = E.filter((x) => x.type === 'kisi'); o.eser = E.filter((x) => x.type === 'eser'); o.diger = E.filter((x) => x.type !== 'kisi' && x.type !== 'eser');
    } finally { Object.assign(st.concepts, yedek.c); Object.assign(st.entities, yedek.e); }
    return o;
  };
  A.ara = function (v) { G.atlq = String(v || '').trim(); G.atlf = 'tum'; G.atln = {}; draw(); };
  A.filtre = function (k) { G.atlf = k; draw(); };
  A.daha = function (k) { G.atln = G.atln || {}; G.atln[k] = (G.atln[k] || A.N) + 40; draw(); };
  A.sec = function (alan, v) { KV.st.concepts[alan] = v; KV.st.entities[alan] = v; KV.st.concepts.n = 80; KV.st.entities.n = 80; draw(); };
  A.temizle = function () { G.atlq = ''; draw(); };

  const r0 = V30.routes.atlas57;
  V30.routes.atlas57 = function () {
    // “İlgili kavramlar” bağlantısı KV.set('concepts','q',…) ile gelir: genel aramaya taşınır
    if (KV.st.concepts.q) { G.atlq = KV.st.concepts.q; G.atlf = 'tum'; KV.st.concepts.q = ''; }
    if (KV.st.entities.q) { G.atlq = KV.st.entities.q; G.atlf = 'tum'; KV.st.entities.q = ''; }
    const r = r0.apply(this, arguments);
    const q = String(G.atlq || '');
    // arama kutusu: bütün kategorilerde
    const inp = $.querySelector('section.hero .search input');
    if (inp) {
      inp.value = q; inp.placeholder = 'Kavram, kişi ya da eser ara…'; inp.setAttribute('aria-label', 'Bilgi Atlası’nda ara: kavramlar, kişiler, eserler');
      inp.setAttribute('onchange', 'V58.Atlas.ara(this.value)'); inp.setAttribute('enterkeyhint', 'search');
      inp.addEventListener('search', () => A.ara(inp.value));
      const kap = inp.closest('.search');
      if (kap && !kap.querySelector('.ar58-n')) kap.insertAdjacentHTML('afterend', `<p class="ar58-n">Arama bütün kategorilerde yapılır${q ? ` · <button type="button" class="ar58-x" onclick="V58.Atlas.temizle()">Aramayı temizle</button>` : ''}</p>`);
    }
    // sınıf/program süzgeci bütün kategorilere
    $.querySelectorAll('.sfilt select').forEach((s) => { const m = (s.getAttribute('onchange') || '').match(/KV\.set\('(?:concepts|entities)','(g|p)'/); if (m) s.setAttribute('onchange', `V58.Atlas.sec('${m[1]}',this.value)`); });
    if (!q) return r;
    // arama sonuçları: kategorilere göre
    const S = A.sonuc(q), f = A.KAT.some((x) => x[0] === G.atlf) ? G.atlf : 'tum', top = A.KAT.reduce((a, [k]) => a + S[k].length, 0);
    const ba = $.querySelector('.ba57');
    if (ba) ba.innerHTML = [['tum', 'Tümü']].concat(A.KAT.map((x) => [x[0], x[1]])).map(([k, ad]) => { const n = k === 'tum' ? top : S[k].length; return `<button type="button" role="tab" aria-selected="${k === f}" class="${k === f ? 'on' : ''}" ${n || k === 'tum' ? '' : 'disabled'} onclick="V58.Atlas.filtre('${k}')">${ad} <small>${n}</small></button>`; }).join('');
    // eski liste (tek kategori) kaldırılır; Tür süzgeci arama sırasında gereksiz
    $.querySelectorAll('h3.alpha, details.card.cp, .card.mut').forEach((x) => x.remove());
    $.querySelectorAll('p.note').forEach((x) => { if (/kayıt ·/.test(x.textContent)) x.remove(); });
    $.querySelectorAll('button.p').forEach((x) => { if (/Daha fazla göster/.test(x.textContent)) x.remove(); });
    $.querySelectorAll('.sfilt label.sf').forEach((l) => { const s = l.querySelector('select'); if (s && /'t'/.test(s.getAttribute('onchange') || '')) l.remove(); });
    const grup = A.KAT.filter(([k]) => (f === 'tum' || f === k) && S[k].length).map(([k, ad, c]) => {
      const n = (G.atln && G.atln[k]) || (f === 'tum' ? 6 : A.N), L = S[k];
      return `<section class="ar58-g" aria-label="${ad}: ${L.length} sonuç"><h3 class="ar58-h">${ad} <small>${L.length}</small></h3>${L.slice(0, n).map((x) => KV.card(c, x)).join('')}${L.length > n ? `<button type="button" class="ar58-d" onclick="${f === 'tum' ? `V58.Atlas.filtre('${k}')` : `V58.Atlas.daha('${k}')`}">${f === 'tum' ? `${ad}: tümünü göster (${L.length})` : 'Daha fazla göster'}</button>` : ''}</section>`;
    }).join('');
    const ld = $.querySelector('section.hero .lead'); if (ld) ld.textContent = 'Arama sonuçları: kavramlar, kişiler, eserler ve diğer kayıtlar birlikte. Üstteki sekmelerle kategoriye göre daraltabilirsin.';
    const yer = $.querySelector('.sfilt') || $.querySelector('.ba57');
    const html = `<div class="ar58" role="region" aria-live="polite"><p class="ar58-oz"><b>“${e(q)}”</b> için ${top} sonuç${f !== 'tum' ? ' · ' + A.KAT.find((x) => x[0] === f)[1] : ''}</p>${grup || '<div class="card mut">Bu aramayla eşleşen kayıt yok. Sınıf ya da program süzgecini genişletmeyi dene.</div>'}</div>`;
    if (yer) yer.insertAdjacentHTML('afterend', html); else $.insertAdjacentHTML('beforeend', html);
    return r;
  };

  /* ---------- Altın: kavram/kişi sayfaları da Bilgi Atlası'nda (V57 bunu Elmas'ta yapıyordu) ---------- */
  const go0 = go;
  window.go = go = function (v, a) {
    try { if (altin() && (v === 'kavram' || v === 'kisi')) { G.atl = v === 'kisi' ? 'kisi' : 'kavram'; G.atlq = ''; v = 'atlas57'; } } catch (x) {}
    if (v === 'atlas57' || v === 'kavram' || v === 'kisi') { G.atlq = (a && a.atlq) || ''; G.atlf = 'tum'; G.atln = {}; }   // sayfaya her girişte arama boş başlar
    return go0.call(this, v, a);
  };

  /* ---------- Altın ana sayfa: Keşif ---------- */
  A.merkez = function () {
    // merkez: öğrencinin sınıfında, program kavramlarından ders metninde en çok kavramla birlikte geçen (KV.rel)
    const s = sinif(), L = Store.all('concepts').filter((c) => (!s || +c.grade === s) && (c.topicIds || []).length && c.term && c.term.length <= 16);
    let en = null, rel = [], eniyi = -1;
    const P = L.filter((c) => c.kind === 'program-kavramı'), aday = (P.length >= 3 ? P : L).slice().sort((a, b) => (b.topicIds || []).length - (a.topicIds || []).length).slice(0, 40);
    for (const c of aday) { const r = KV.rel(c); const p = r.length * 10 + (c.topicIds || []).length; if (r.length >= 3 && p > eniyi) { eniyi = p; en = c; rel = r.slice(0, 4); } }
    return en ? {c: en, rel} : null;
  };
  A.kart = function () {
    const m = A.merkez(), s = sinif();
    const P = [[50, 50], [18, 22], [82, 20], [86, 78], [16, 80]];
    const ad = (t) => { const x = String(t || ''); return x.charAt(0).toLocaleUpperCase('tr-TR') + x.slice(1); };
    const dugum = m ? [m.c].concat(m.rel).map((c, i) => `<span class="bg58-n ${i ? '' : 'm'}" style="left:${P[i][0]}%;top:${P[i][1]}%;--d:${i * 0.35}s">${e(ad(c.term))}</span>`).join('') : '';
    const cizgi = m ? m.rel.map((_, i) => `<line x1="50" y1="50" x2="${P[i + 1][0]}" y2="${P[i + 1][1]}" style="--d:${i * 0.35}s"/>`).join('') : '';
    return `<button type="button" class="bg58" onclick="go('links',{lk:{tab:'harita'}})" aria-label="Bağlantılar: kavramlar, konular ve sınıflar arasındaki ilişkileri keşfet">
<span class="bg58-h" aria-hidden="true"><svg class="bg58-s" viewBox="0 0 100 100" preserveAspectRatio="none">${cizgi}</svg>${dugum}</span>
<span class="bg58-t"><small class="bg58-e">Bağlantılar</small><b>Kavramlar birbirine nasıl bağlanıyor?</b><span>${m ? `“${e(ad(m.c.term))}” ${s ? s + '. sınıfta ' : ''}ders metinlerinde ${m.rel.length} kavramla birlikte geçiyor. Haritada konuları, kavramları ve sınıfları birbirine bağlayan yolları gör.` : 'Konular, kavramlar, kazanımlar ve sınıflar arasındaki ilişkileri kavram haritasında gör.'}</span><em class="bg58-d">Haritayı keşfet <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></em></span></button>`;
  };
  A.altinAna = function () {
    if (view !== 'pdunya' || !altin()) return;
    const kl = $.querySelector('.ah56-kl'); if (!kl || kl.dataset.v58) return; kl.dataset.v58 = '1';
    const kv = kl.querySelector('.ah56-r[onclick*="go(\'kavram\')"]');
    if (kv) {
      kv.setAttribute('onclick', "go('atlas57')"); kv.setAttribute('aria-label', 'Bilgi Atlası: kavramlar, kişiler ve eserler');
      const b = kv.querySelector('.ah56-rt b'), sm = kv.querySelector('.ah56-rt small'); if (b) b.textContent = 'Bilgi Atlası'; if (sm) sm.textContent = 'Kavramlar · Kişiler · Eserler';
    }
    kl.querySelectorAll('.ah56-r[onclick*="go(\'kisi\')"]').forEach((x) => x.remove());
    const bg = kl.querySelector('.ah56-r[onclick*="go(\'links\'"]');
    if (bg) bg.remove();
    kl.insertAdjacentHTML('beforebegin', A.kart());
  };

  try {
    const st = document.createElement('style'); st.id = 'v58-atlas-css';
    st.textContent = `
.ar58-n{margin:6px 2px 0;color:var(--mut);font-size:.8rem}
.ar58-x{margin-left:4px;padding:2px 10px;min-height:30px;border-radius:999px;border:1px solid var(--line);background:none;color:var(--ink);font:inherit;font-size:.8rem;cursor:pointer}
.ar58{margin-top:8px}
.ar58-oz{margin:6px 2px 10px;color:var(--mut);font-size:.9rem}.ar58-oz b{color:var(--ink)}
.ar58-g{margin:0 0 18px}
.ar58-h{display:flex;align-items:center;gap:8px;margin:10px 2px 8px;font-size:1rem}
.ar58-h small{padding:1px 8px;border-radius:999px;background:color-mix(in srgb,var(--pri) 16%,transparent);color:var(--pri);font-size:.75rem}
.ar58-d{display:block;width:100%;min-height:46px;margin-top:8px;border-radius:14px;border:1px dashed var(--line);background:none;color:var(--pri);font:inherit;font-weight:650;cursor:pointer}
.ba57 button:disabled{opacity:.45;cursor:default}
body[data-prem39] .ar58-h small{background:color-mix(in srgb,var(--p-gold) 18%,transparent);color:var(--p-gold-t,var(--p-gold))}
body[data-prem39] .ar58-d{color:var(--p-gold-t,var(--p-gold));border-color:var(--p-line)}
/* Altın: Bağlantılar kartı */
.bg58{position:relative;display:grid;grid-template-rows:auto auto;width:100%;margin:0 0 12px;padding:0;border-radius:22px;overflow:hidden;isolation:isolate;cursor:pointer;text-align:left;font:inherit;color:var(--p-ink);
 border:1px solid color-mix(in srgb,var(--p-gold) 45%,var(--p-line));
 background:radial-gradient(120% 90% at 50% 0%,color-mix(in srgb,var(--p-gold) 20%,var(--p-card2)) 0%,var(--p-card) 62%),var(--p-card);
 box-shadow:0 1px 0 color-mix(in srgb,var(--p-gold) 30%,transparent) inset,0 18px 40px -22px rgba(0,0,0,.65),0 0 0 1px rgba(0,0,0,.08);transition:transform .25s ease,box-shadow .25s ease}
.bg58::after{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(60% 55% at 50% 30%,color-mix(in srgb,var(--p-gold) 16%,transparent),transparent 70%);pointer-events:none}
.bg58-h{position:relative;display:block;height:150px;margin:6px 8px 0}
.bg58-s{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.bg58-s line{stroke:var(--p-gold);stroke-width:.7;stroke-linecap:round;vector-effect:non-scaling-stroke;opacity:.85;stroke-dasharray:4 5;animation:bg58a 3.2s linear infinite;animation-delay:var(--d)}
.bg58-n{position:absolute;transform:translate(-50%,-50%);max-width:44%;padding:5px 11px;border-radius:999px;font-size:.76rem;font-weight:650;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--p-ink);
 background:color-mix(in srgb,var(--p-card2) 88%,var(--p-gold));border:1px solid color-mix(in srgb,var(--p-gold) 50%,var(--p-line));box-shadow:0 6px 16px -8px rgba(0,0,0,.6);animation:bg58b 3.2s ease-in-out infinite;animation-delay:var(--d)}
.bg58-n.m{padding:8px 16px;font-size:.92rem;font-weight:800;color:var(--p-on-gold,#1a120a);background:linear-gradient(135deg,color-mix(in srgb,var(--p-gold) 80%,#fff),var(--p-gold));border-color:transparent;box-shadow:0 0 0 6px color-mix(in srgb,var(--p-gold) 18%,transparent),0 10px 24px -10px color-mix(in srgb,var(--p-gold) 70%,#000)}
.bg58-t{display:grid;gap:4px;padding:6px 18px 16px}
.bg58-e{font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--p-gold-t,var(--p-gold))}
.bg58-t>b{font:600 1.18rem/1.25 Literata,Georgia,serif;color:var(--p-ink)}
.bg58-t>span{color:var(--p-mut);font-size:.88rem;line-height:1.45}
.bg58-d{display:inline-flex;align-items:center;gap:6px;justify-self:start;margin-top:8px;padding:9px 16px;min-height:42px;border-radius:999px;font-style:normal;font-weight:700;font-size:.9rem;color:var(--p-on-gold,#1a120a);background:var(--p-gold)}
@media (hover:hover){.bg58:hover{transform:translateY(-2px);box-shadow:0 1px 0 color-mix(in srgb,var(--p-gold) 30%,transparent) inset,0 24px 48px -22px rgba(0,0,0,.7)}}
.bg58:active{transform:scale(.99)}
.bg58:focus-visible{outline:3px solid var(--p-gold);outline-offset:3px}
@keyframes bg58a{to{stroke-dashoffset:-18}}
@keyframes bg58b{0%,100%{box-shadow:0 6px 16px -8px rgba(0,0,0,.6)}50%{box-shadow:0 0 0 3px color-mix(in srgb,var(--p-gold) 22%,transparent),0 6px 16px -8px rgba(0,0,0,.6)}}
@media (prefers-reduced-motion:reduce){.bg58-s line,.bg58-n{animation:none}}
@media (min-width:720px){.bg58{grid-template-columns:1.1fr 1fr;grid-template-rows:none;align-items:center}.bg58-h{height:170px;order:2}.bg58-t{padding:18px 8px 18px 22px}}
`;
    document.head.appendChild(st);
  } catch (x) {}

  const dr0 = draw;
  window.draw = draw = function () { const r = dr0.apply(this, arguments); try { A.altinAna(); } catch (x) { console.warn('[V58] atlas', x); } return r; };
})();
