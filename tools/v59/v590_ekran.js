/* ===================== V59.0 (3/3): Kavram Haritası araması, Hızlı Etkinlikler, Altın tipografi, öğrenci sınıf ekranı, oyun ayrımı =====================
   • Kavram Haritası (Bağlantılar › Kavram Haritası): sade açıklama + belirgin arama kutusu. Arama bütün ana kavramlarda
     (KMAP.roots(), ekranda listelenenlerle sınırlı değil; sınıf/program süzgecinden bağımsız). Sonuçta kavramın adı, sınıfı ve
     bağlantılı kavram sayısı (KMAP.counts — haritadaki sayıyla aynı); seçince doğrudan o kavramın haritası (V34.sel) açılır.
     Alt / bağlantılı / karıştırılan kavram ayrımı ve veri ilişkileri aynen.
   • Altın Oyun Dünyası: “Etkinlik oyunları: …” satırı yerine “Hızlı Etkinlikler” kartı (mevcut etkinlik oyunlarına gider; tür,
     soru havuzu ve işleyiş aynı).
   • Altın konu anlatımı: yalnız tipografi (CSS) — başlık hiyerarşisi, önemli kavram başlığı, paragraf aralığı ve satır yüksekliği.
     Hiçbir metin değiştirilmez.
   • Altın öğrenci sınıf ekranı: “Daha fazla: araçlar, kazanımlar ve sınıf bilgileri” (öğrenme araçları, kazanım ilerlemesi,
     sınıf bilgileri) öğrenci ekranında gösterilmez; işlevler ve veriler (V39/V55) silinmedi, öğretmen/editör altyapısı aynen.
   • Altın oyunları Elmas'ta listelenmez: Elmas'ta oyun listesi (Store.all('games')) Altın oyunlarının etkinlik kayıtlarını
     (Kelimeyi Anlat Bakalım = tabu, Beni Bul! = benkimim) içermez. Kayıtlar, ilerleme ve Altın'daki oyunlar aynen. */
(function () {
  const V59 = window.V59 = window.V59 || {};
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const altin = () => { try { return !!V39.on; } catch (x) { return false; } };

  /* ---------- 1. Altın oyunları yalnız Altın'da ---------- */
  const O = V59.Oyun = {ALTIN_TUR: new Set(['tabu', 'benkimim'])};
  O.elmasta = () => !altin();
  // editör/öğretmen araç ekranları moddan bağımsızdır: bütün oyun kayıtlarını görmeye devam eder (yalnız öğrenci ekranları süzülür)
  O.YONETIM = /^(editor|admin|icerik54|bildirim48|ogretmen|ogara|book)$/;
  try {
    const a0 = Store.all;
    Store.all = function (c) {
      const r = a0.apply(this, arguments);
      if (c !== 'games') return r;
      try { if (altin() || view === 'game' || O.YONETIM.test(view)) return r; return r.filter((g) => !O.ALTIN_TUR.has(g.gameType)); } catch (x) { return r; }
    };
  } catch (x) { console.warn('[V59] oyun ayrımı', x); }

  /* ---------- 2. Kavram Haritası: açıklama + arama ---------- */
  const KH = V59.KH = {};
  KH.fold = (s) => (typeof V34 !== 'undefined' && V34.fold ? V34.fold(s) : String(s || '').toLocaleLowerCase('tr-TR'));
  // arama havuzu: seçili programın BÜTÜN ana kavramları (2018 ve 2026 karıştırılmaz; sınıf/ünite süzgeci ve “Daha fazla” sınırı aramayı daraltmaz)
  KH.havuz = () => { const py = (typeof V34 !== 'undefined' && V34.S().py) || ''; return KMAP.roots().filter((c) => !py || c.programYear === py); };
  KH.bul = function (q) {
    const f = KH.fold(q).trim(); if (!f) return [];
    const L = KH.havuz().map((c) => ({c, t: KH.fold(c.term)})).filter((x) => x.t.includes(f));
    L.sort((a, b) => (a.t.startsWith(f) ? 0 : 1) - (b.t.startsWith(f) ? 0 : 1) || a.c.grade - b.c.grade || String(a.c.term).localeCompare(b.c.term, 'tr'));
    return L.map((x) => x.c);
  };
  KH.sonuc = function (q) {
    const kap = document.getElementById('km59-son'); if (!kap) return;
    const R = KH.bul(q); KH._R = R;
    if (!String(q || '').trim()) { kap.innerHTML = ''; kap.hidden = true; return; }
    kap.hidden = false;
    kap.innerHTML = R.length ? `<p class="km59-n">${R.length} ana kavram bulundu${(V34.S().py ? '' : ' (bütün programlar)')}</p>` + R.slice(0, 12).map((c, i) => { const n = KMAP.counts(c.id); return `<button type="button" role="option" class="km59-o" data-i="${i}" onclick="V59.KH.ac('${e(c.id)}')"><b>${e(c.term)}</b><small>${c.grade}. sınıf · ${c.programYear === '2018' ? '2018 programı' : '2026 programı'}</small><em>${n.r} bağlantılı kavram</em></button>`; }).join('') + (R.length > 12 ? `<p class="km59-n">İlk 12 sonuç gösteriliyor; aramayı daralt.</p>` : '')
      : `<p class="km59-bos">“${e(q)}” adında bir ana kavram yok. Kavram adını farklı yazmayı dene.</p>`;
  };
  KH.yaz = function (v) { clearTimeout(KH._t); KH._t = setTimeout(() => KH.sonuc(v), 120); };
  KH.tus = function (ev, el) { if (ev.key === 'Enter') { ev.preventDefault(); const R = KH.bul(el.value); if (R[0]) KH.ac(R[0].id); } };
  KH.ac = function (id) { V34.sel('concept', id); try { window.scrollTo({top: 0}); } catch (x) {} };
  if (typeof KMAP !== 'undefined' && KMAP.picker) {
    const pk = KMAP.picker;
    KMAP.picker = function (b) {
      const r = pk.apply(this, arguments);
      try {
        const S = V34.S(); if (S.t) return r;
        const intro = b.querySelector('.km-intro'); if (!intro || intro.querySelector('.km59')) return r;
        const tum = KH.havuz().length, p = intro.querySelectorAll(':scope > p');
        if (p[0]) p[0].textContent = 'Bir ana kavram seç, onunla bağlantılı kavramları keşfet. Alt kavramları, bağlantılı kavramları ve karıştırılabilecek kavramları harita üzerinde incele.';
        const say = (p[1] && (p[1].textContent.match(/^(\d+) ana kavram/) || [])[1]) || tum;
        if (p[1]) p[1].textContent = `${say} ana kavram${+say !== tum ? ` bu süzgeçte · arama ${tum} ana kavramın hepsinde yapılır` : ''}`;
        const h2 = intro.querySelector('h2');
        const kutu = `<div class="km59" role="search"><label class="km59-k"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="km59-q" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" placeholder="Kavram ara: iman, abdest, ahlak…" aria-label="Kavram Haritası’nda ara (bütün ana kavramlar)" aria-controls="km59-son" oninput="V59.KH.yaz(this.value)" onkeydown="V59.KH.tus(event,this)"></label><div id="km59-son" class="km59-son" role="listbox" aria-label="Arama sonuçları" hidden></div></div>`;
        if (h2) h2.insertAdjacentHTML('afterend', kutu); else intro.insertAdjacentHTML('afterbegin', kutu);
        // kutuyu açıklamanın altına taşı (başlık → açıklama → arama)
        const k = intro.querySelector('.km59'); if (p[0] && k) p[0].after(k);
      } catch (x) { console.warn('[V59] kavram haritası', x); }
      return r;
    };
  }

  /* ---------- 3. Altın Oyun Dünyası: Hızlı Etkinlikler ---------- */
  const IK = {
    esles: '<path d="M4 7h6M4 17h6M14 7h6M14 17h6"/><path d="M10 7c2 0 2 10 4 10M10 17c2 0 2-10 4-10"/>',
    grupla: '<rect x="3" y="4" width="8" height="7" rx="2"/><rect x="13" y="4" width="8" height="7" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/>',
    eksik: '<path d="M3 12h4M17 12h4"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke-dasharray="2 2"/>',
    sirala: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    dogru: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
    hata: '<path d="M12 4 3 19h18z"/><path d="M12 10v4M12 17h.01"/>'
  };
  const SVG = (p) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  O.HIZLI = [['esles', 'Eşleştir'], ['grupla', 'Grupla'], ['eksik', 'Boşluk doldur'], ['sirala', 'Sırala'], ['dogru', 'Doğru cevap'], ['hata', 'Hata avcısı']];
  O.kart = () => `<button type="button" class="he59" onclick="go('games')" aria-label="Hızlı Etkinlikler: eşleştir, grupla, boşlukları tamamla ve öğrendiklerini pekiştir"><span class="he59-u"><span class="he59-i" aria-hidden="true">${SVG('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>')}</span><span class="he59-t"><b>Hızlı Etkinlikler</b><small>Eşleştir, grupla, boşlukları tamamla ve öğrendiklerini pekiştir.</small></span><span class="he59-ok" aria-hidden="true">${SVG('<path d="M9 6l6 6-6 6"/>')}</span></span><span class="he59-l" aria-hidden="true">${O.HIZLI.map(([k, ad]) => `<span class="he59-c">${SVG(IK[k])}${ad}</span>`).join('')}</span></button>`;
  try {
    if (window.V55 && V55.Oyun && V55.Oyun.html) {
      const h0 = V55.Oyun.html;
      V55.Oyun.html = function () { return String(h0.apply(this, arguments)).replace(/<button type="button" class="ao55-tum"[\s\S]*?<\/button>/, O.kart()); };
    }
  } catch (x) { console.warn('[V59] hızlı etkinlikler', x); }

  // Elmas › Etkinlik oyunları: tür kutucukları sabit tür tablosundan (GT) çizilir; Altın'a özel türler (kayıtları yukarıda süzüldü,
  // sayıları 0) Elmas ekranında gösterilmez. Elmas'ta kalmış bir Altın türü süzgeci de bırakılır.
  O.ekran = function () {
    if (altin() || (view !== 'games' && view !== 'home')) return;
    try { if (typeof G !== 'undefined' && G.gf && O.ALTIN_TUR.has(G.gf.ty)) { G.gf.ty = ''; } } catch (x) {}
    $.querySelectorAll('.gh-types .gt[data-t]').forEach((b) => { if (O.ALTIN_TUR.has(b.dataset.t)) b.remove(); });
  };

  /* ---------- 4. Altın öğrenci sınıf ekranı ---------- */
  V59.sinif = function () {
    if (view !== 'psinif' || !altin()) return;
    try { if (window.V51 && V51.Gorunum && V51.Gorunum.kip && V51.Gorunum.kip() === 'ogretmen') return; } catch (x) {}
    $.querySelectorAll('details.sn55-ek').forEach((d) => d.remove());
  };

  /* ---------- 5. stiller ---------- */
  try {
    const st = document.createElement('style'); st.id = 'v59-ekran-css';
    st.textContent = `
/* Kavram Haritası araması */
.km59{position:relative;margin:12px 0 6px}
.km59-k{display:flex;align-items:center;gap:10px;min-height:54px;padding:0 16px;border-radius:16px;border:1.5px solid color-mix(in srgb,var(--p-gold,var(--pri)) 55%,var(--p-line,var(--line)));background:var(--p-card2,var(--surface2,var(--surface)));color:var(--p-mut,var(--mut));box-shadow:0 8px 22px -14px rgba(0,0,0,.55);transition:border-color .2s,box-shadow .2s}
.km59-k:focus-within{border-color:var(--p-gold,var(--pri));box-shadow:0 0 0 3px color-mix(in srgb,var(--p-gold,var(--pri)) 25%,transparent),0 8px 22px -14px rgba(0,0,0,.55)}
.km59-k input{flex:1;min-width:0;height:52px;border:0;outline:0;background:transparent;color:var(--p-ink,var(--ink));font:inherit;font-size:1.02rem}
.km59-son{display:grid;gap:6px;margin-top:8px;max-height:min(60vh,460px);overflow-y:auto;overscroll-behavior:contain}
.km59-son[hidden]{display:none}
.km59-o{display:grid;grid-template-columns:1fr auto;grid-template-areas:"b e" "s e";align-items:center;gap:2px 10px;width:100%;min-height:56px;padding:9px 14px;border-radius:14px;border:1px solid var(--p-line,var(--line));background:var(--p-card,var(--surface));color:var(--p-ink,var(--ink));font:inherit;text-align:left;cursor:pointer}
.km59-o b{grid-area:b;font-size:1rem}.km59-o small{grid-area:s;color:var(--p-mut,var(--mut));font-size:.82rem}
.km59-o em{grid-area:e;font-style:normal;font-size:.78rem;font-weight:700;padding:4px 10px;border-radius:999px;color:var(--p-gold-t,var(--pri));background:color-mix(in srgb,var(--p-gold,var(--pri)) 14%,transparent);white-space:nowrap}
.km59-o:active{transform:scale(.99)}
.km59-n,.km59-bos{margin:2px 4px;color:var(--p-mut,var(--mut));font-size:.84rem}
/* Hızlı Etkinlikler (Altın Oyun Dünyası) */
.he59{display:grid;gap:12px;width:100%;margin:14px 0 4px;padding:16px;border-radius:20px;cursor:pointer;text-align:left;font:inherit;color:var(--p-ink);
 border:1px solid color-mix(in srgb,var(--p-gold) 50%,var(--p-line));background:radial-gradient(110% 120% at 0% 0%,color-mix(in srgb,var(--p-gold) 18%,var(--p-card2)),var(--p-card) 65%);
 box-shadow:0 1px 0 color-mix(in srgb,var(--p-gold) 30%,transparent) inset,0 16px 34px -20px rgba(0,0,0,.65);transition:transform .2s ease,box-shadow .2s ease}
.he59-u{display:flex;align-items:center;gap:12px}
.he59-i{display:inline-grid;place-items:center;width:48px;height:48px;flex:none;border-radius:15px;color:var(--p-on-gold,#1a120a);background:linear-gradient(145deg,color-mix(in srgb,var(--p-gold) 85%,#fff),var(--p-gold));box-shadow:0 8px 18px -8px color-mix(in srgb,var(--p-gold) 70%,#000)}
.he59-i svg{width:24px;height:24px}
.he59-t{display:grid;gap:2px;flex:1;min-width:0}.he59-t b{font:700 1.12rem/1.25 Literata,Georgia,serif}.he59-t small{color:var(--p-mut);font-size:.88rem;line-height:1.4}
.he59-ok{display:inline-grid;place-items:center;width:34px;height:34px;flex:none;border-radius:50%;border:1px solid color-mix(in srgb,var(--p-gold) 45%,var(--p-line));color:var(--p-gold-t,var(--p-gold))}
.he59-l{display:flex;flex-wrap:wrap;gap:6px}
.he59-c{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;font-size:.8rem;font-weight:600;color:var(--p-ink);background:color-mix(in srgb,var(--p-ink) 6%,transparent);border:1px solid var(--p-line)}
.he59-c svg{width:15px;height:15px;color:var(--p-gold-t,var(--p-gold))}
@media (hover:hover){.he59:hover{transform:translateY(-2px);box-shadow:0 1px 0 color-mix(in srgb,var(--p-gold) 30%,transparent) inset,0 22px 40px -20px rgba(0,0,0,.7)}}
.he59:active{transform:scale(.99)}.he59:focus-visible{outline:3px solid var(--p-gold);outline-offset:3px}
/* Altın konu anlatımı: tipografi (yalnız stil) */
body[data-prem39] .p39-dh h1{font-size:clamp(1.5rem,5.4vw,1.85rem);font-weight:800;line-height:1.2;letter-spacing:-.005em}
body[data-prem39] .p39-dh .p39-ey{letter-spacing:.09em}
body[data-prem39] .p39-ders .p39-blk{margin-bottom:1.15em}
body[data-prem39] .p39-ders .p39-blk h3{font-size:1.24rem;font-weight:800;line-height:1.32;margin:.1em 0 .5em;letter-spacing:.002em}
body[data-prem39] .p39-ders .p39-blk h4,body[data-prem39] .p39-ders .p39-kv h4{font-size:1.06rem;font-weight:600;line-height:1.4;margin:.6em 0 .35em}
body[data-prem39] .p39-ders .p39-blk.k-kavram h3{font-size:1.3rem;font-weight:800}
body[data-prem39] .p39-ders .p39-blk .blk-lab{font-size:.74rem;letter-spacing:.11em;margin-bottom:8px}
body[data-prem39] .p39-ders .p39-blk.k-kavram{border-left-width:5px}
body[data-prem39] .p39-ders .p39-blk p{font-size:1.07rem;line-height:1.8;margin:0 0 .95em}
body[data-prem39] .p39-ders .p39-blk p:last-child{margin-bottom:0}
html[data-pt43="gece"] body[data-prem39] .p39-ders .p39-blk p{color:var(--p-ink)}
`;
    document.head.appendChild(st);
  } catch (x) {}

  const dr0 = draw;
  window.draw = draw = function () { const r = dr0.apply(this, arguments); try { V59.sinif(); O.ekran(); } catch (x) { console.warn('[V59] ekran', x); } return r; };
})();
