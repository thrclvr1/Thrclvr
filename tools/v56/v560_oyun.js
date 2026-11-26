/* ===================== V56.0 (4/4): oyunlar — çizimli kartlar, Çark Çevirme ekranı, önce filtre =====================
   • Altın Oyun Dünyası: V55 gruplu düzen aynı; her oyun kartı kendi çizimini taşır (Beni Bul! büyüteç ve ipucu, Gizemli Şahsiyet
     siluet, Harf Halkası harf halkası, Harf Avı harf ızgarası, Çark Çevirme çark, Zirve Yarışı basamaklar ve bayrak, Bilgi Arenası
     kürsü ve kupa, Kelimeyi Anlat Bakalım konuşma balonları, Gizli Bilgin maske; hikâyeli oyunlar bahçe/kitaplık/kum saati/deney şişesi).
   • Çark Çevirme kartı artık Etkinlik Oyunları listesine değil, kendi ekranına (rota cark56) gider: öğrencinin sınıfındaki çark
     oyunları (kaynakta 4., 5., 7. ve 12. sınıf için var), önerilen çark (kaldığın ünite) “Çarkı çevir” ile doğrudan açılır; başka
     ünitelerin ve sınıfların çarkları seçilebilir. Oyun mekaniği aynı (V33 Çark Çevirme, playGame). Etkinlik Oyunları ayrı giriş.
   • Oyun listesi (rota games, iki modda): ilk açılışta uzun “Tüm oyunlar” listesi gösterilmez. Önce “Oyun bul” paneli: Sınıfım /
     Tüm sınıflar, oyun türü, ünite ve konu. Tür ya da ünite/konu seçilince yalnız ilgili oyunlar listelenir; “Seçimi temizle”.
     Mevcut filtre işlevleri (gSet, V33.tapType: ikinci dokunuş başlatır) aynı. */
(function () {
  if (typeof V39 === 'undefined' || !window.V55 || !V55.Oyun) return;
  const V56 = window.V56 = window.V56 || {};
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const OK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  const sinif = () => { try { return (V53.Hesap && +V53.Hesap.sinif()) || 0; } catch (x) { return 0; } };

  /* ---------- 1. oyun çizimleri (96×64; renkler temaya uyar: --og ton, --p-gold vurgu) ---------- */
  const SC = (ic) => `<svg class="og56-s" viewBox="0 0 96 64" aria-hidden="true" focusable="false">${ic}</svg>`;
  const IL = {
    benibul: '<circle cx="40" cy="30" r="15" class="f"/><circle cx="40" cy="30" r="15"/><path d="M51 41l12 12" class="k"/><path d="M36 26a5 5 0 1 1 6 5v3" class="a"/><circle cx="42" cy="38" r="1.4" class="d"/><path d="M68 14l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" class="d"/>',
    gizemli: '<circle cx="48" cy="24" r="10" class="f"/><path d="M28 56c2-11 10-17 20-17s18 6 20 17" class="f"/><circle cx="48" cy="24" r="10"/><path d="M28 56c2-11 10-17 20-17s18 6 20 17"/><path d="M45 20a3.5 3.5 0 1 1 4 3.5V26" class="a"/><circle cx="49" cy="30" r="1.2" class="d"/><path d="M18 18h8M70 18h8M14 28h6M76 28h6" class="i"/>',
    halka: '<circle cx="48" cy="32" r="22" class="f"/>' + Array.from({length: 10}, (_, i) => { const a = (i * 36 - 90) * Math.PI / 180; return `<circle cx="${(48 + 22 * Math.cos(a)).toFixed(1)}" cy="${(32 + 22 * Math.sin(a)).toFixed(1)}" r="4.6" class="${i === 0 ? 'dd' : 'b'}"/>`; }).join('') + '<text x="48" y="37" text-anchor="middle" class="t">A</text>',
    harf: Array.from({length: 12}, (_, i) => `<rect x="${22 + (i % 4) * 14}" y="${12 + Math.floor(i / 4) * 14}" width="11" height="11" rx="2.5" class="${[1, 6, 11].includes(i) ? 'dd' : 'b'}"/>`).join('') + '<path d="M26 18l42 28" class="a"/>',
    cark: '<circle cx="48" cy="34" r="22" class="f"/>' + Array.from({length: 8}, (_, i) => { const a = (i * 45 - 90) * Math.PI / 180, b = ((i + 1) * 45 - 90) * Math.PI / 180; return `<path d="M48 34L${(48 + 22 * Math.cos(a)).toFixed(1)} ${(34 + 22 * Math.sin(a)).toFixed(1)}A22 22 0 0 1 ${(48 + 22 * Math.cos(b)).toFixed(1)} ${(34 + 22 * Math.sin(b)).toFixed(1)}Z" class="${i % 2 ? 'b' : 'dd'}"/>`; }).join('') + '<circle cx="48" cy="34" r="4" class="d"/><path d="M43 7h10l-5 7z" class="d"/>',
    zirve: '<path d="M16 54h14V44h14V34h14V24h14V54z" class="f"/><path d="M16 54h14V44h14V34h14V24h14v30" /><path d="M72 24V8" /><path d="M72 9h12l-4 4 4 4H72" class="d"/><circle cx="24" cy="48" r="3" class="dd"/>',
    arena: '<path d="M12 54c6-16 20-24 36-24s30 8 36 24" class="f"/><path d="M12 54c6-16 20-24 36-24s30 8 36 24M22 54c4-10 14-16 26-16s22 6 26 16"/><path d="M40 10h16v6a8 8 0 0 1-16 0z" class="d"/><path d="M48 24v6M43 32h10" /><path d="M40 12h-5a4 4 0 0 0 5 5M56 12h5a4 4 0 0 1-5 5"/>',
    anlat: '<path d="M14 14h36a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H30l-10 8v-8h-6a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6z" class="f"/><path d="M14 14h36a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H30l-10 8v-8h-6a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6z"/><path d="M50 26h24a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6h-2v7l-8-7H56a6 6 0 0 1-6-6z" class="dd"/><path d="M18 24h20M18 30h12" class="a"/><path d="M60 36l10 6M70 36l-10 6" class="k"/>',
    gizli: '<path d="M18 26c10-8 50-8 60 0-2 12-10 18-18 18-6 0-8-6-12-6s-6 6-12 6c-8 0-16-6-18-18z" class="f"/><path d="M18 26c10-8 50-8 60 0-2 12-10 18-18 18-6 0-8-6-12-6s-6 6-12 6c-8 0-16-6-18-18z"/><ellipse cx="34" cy="30" rx="6" ry="4" class="d"/><ellipse cx="62" cy="30" rx="6" ry="4" class="d"/><circle cx="20" cy="56" r="4" class="b"/><circle cx="48" cy="56" r="4" class="dd"/><circle cx="76" cy="56" r="4" class="b"/>',
    dunya: '<path d="M8 56c14-10 28-12 40-8s26 4 40-6v14H8z" class="f"/><path d="M8 56c14-10 28-12 40-8s26 4 40-6"/><path d="M30 46V30" /><circle cx="30" cy="24" r="8" class="dd"/><path d="M64 44V34"/><circle cx="64" cy="28" r="7" class="b"/><circle cx="78" cy="12" r="5" class="d"/>',
    kutuphane: '<path d="M22 56V22a26 22 0 0 1 52 0v34" class="f"/><path d="M22 56V22a26 22 0 0 1 52 0v34M18 56h60"/><path d="M30 30h36M30 42h36" /><path d="M33 30v-8M38 30v-6M44 30v-8M50 42v-8M56 42v-6M61 42v-8" class="d"/><path d="M33 42v-7M39 42v-8" class="dd"/>',
    zaman: '<path d="M34 8h28M34 56h28M38 8c0 14 20 16 20 24S38 42 38 56M58 8c0 14-20 16-20 24s20 10 20 24" /><path d="M42 20c4 6 12 6 12 0z" class="d"/><path d="M40 54c3-6 13-6 16 0z" class="d"/><path d="M70 22a14 14 0 1 1 0 20" class="i"/>',
    lab: '<path d="M40 8h16M43 8v18L28 52a4 4 0 0 0 4 6h32a4 4 0 0 0 4-6L53 26V8" class="f"/><path d="M40 8h16M43 8v18L28 52a4 4 0 0 0 4 6h32a4 4 0 0 0 4-6L53 26V8"/><path d="M33 44h30" /><circle cx="42" cy="50" r="3" class="d"/><circle cx="54" cy="48" r="2" class="dd"/><circle cx="66" cy="16" r="3" class="dd"/><circle cx="74" cy="24" r="2" class="d"/>'
  };
  // her oyunun tonu (hue) — kartlar birbirinin kopyası olmasın; doygunluk düşük, temaya karışır
  const TON = {benibul: 205, gizemli: 265, halka: 30, harf: 150, cark: 335, zirve: 45, arena: 10, anlat: 185, gizli: 290, dunya: 120, kutuphane: 35, zaman: 220, lab: 170};
  const OM = V55.Oyun;
  OM.GRUP56 = () => {
    const s = sinif(), d = (window.V45 && V45.Dunya && V45.Dunya.D && V45.Dunya.D[s]) || null;
    return [
      ['Kısa bilgi ve kelime oyunları', [['benibul', 'Beni Bul!', 'İpuçlarından şahsiyet, yer ya da kavramı bul.', "V54.Oyun.git('benibul')"], ['gizemli', 'Gizemli Şahsiyet', 'Yalnız şahsiyetler: kim olduğunu bul.', "V54.Oyun.git('gizemli')"], ['halka', 'Harf Halkası', 'Her harf için bir soru; süre ve pas.', "V54.Oyun.git('halka')"], ['harf', 'Harf Avı', 'İpucundan kavramı harf harf bul.', "V54.Oyun.git('harf')"], ['cark', 'Çark Çevirme', 'Çarkı çevir, çıkan soruyu yanıtla.', "go('cark56')"]]],
      ['Yarışma oyunları', [['zirve', 'Zirve Yarışı', 'Kolaydan zora 10 soru, iki joker.', "V54.Oyun.git('zirve')"], ['arena', 'Bilgi Arenası', 'Kategori ve zorluk seç, yarış.', "V54.Oyun.git('arena')"]]],
      ['Takım oyunları', [['anlat', 'Kelimeyi Anlat Bakalım', 'İki takım, yasaklı kelimeler, süre.', "V54.Oyun.git('anlat')"], ['gizli', 'Gizli Bilgin', 'Aynı cihazda 3–8 kişi: bilmeyeni bulun.', "V54.Oyun.git('gizli')"]]],
      ['Hikâyeli ve keşif oyunları', [['dunya', d ? d.ad : 'Sınıf Dünyaları', d ? `${s}. sınıfın dünyası: keşfet, kapıyı aç.` : 'Her sınıfın kendi dünyası.', d ? `go('poyna',{oyn:'dunya45',obol:'g${s}',odevam:0})` : "go('poyna',{oyn:'dunya45',obol:'',odevam:0})"], ['kutuphane', 'Kayıp Bilgeliğin Kütüphanesi', 'Ünite ünite mühürleri çöz.', "go('poyna',{oyn:'kutuphane',obol:'',odevam:0})"], ['zaman', 'Zamanın İzinde', 'Tarihî olayları doğru sıraya koy.', "go('poyna',{oyn:'zaman',obol:'',odevam:0})"], ['lab', 'Bilgi Laboratuvarı', 'Sınıflandır, eşleştir, yanlışı bul.', "go('poyna',{oyn:'lab',obol:'',odevam:0})"]]]
    ];
  };
  OM.html = () => `<section class="ao55 ao56" aria-labelledby="ao55-h"><h2 id="ao55-h" class="ao55-bh">Oyunlar</h2>${OM.GRUP56().map(([ad, L], i) => `<section class="ao55-g" aria-labelledby="ao55-g${i}"><h3 id="ao55-g${i}">${ad}</h3><div class="ao55-l ao56-l">${L.map(([k, a, b, f]) => `<button type="button" class="ao55-k ao56-k" data-og="${k}" style="--oh:${TON[k] || 40}" onclick="${f}"><span class="og56-r">${SC(IL[k] || '')}</span><span class="og56-t"><b>${e(a)}</b><small>${e(b)}</small></span></button>`).join('')}</div></section>`).join('')}
<button type="button" class="ao55-tum" onclick="go('games')">Etkinlik oyunları: eşleştirme, gruplandırma, eksik kelime… ${OK}</button></section>`;
  V56.oyunCizim = (k) => SC(IL[k] || '');

  /* ---------- 2. Çark Çevirme ekranı (rota cark56) ---------- */
  const CK = V56.Cark = {};
  CK.liste = () => { try { return Store.all('games').filter((x) => x.gameType === 'wheel' && (typeof vis !== 'function' || vis(x))); } catch (x) { return []; } };
  CK.render = function () {
    const W = CK.liste(), s = sinif(), grs = [...new Set(W.map((x) => +x.grade))].sort((a, b) => a - b);
    const hedef = +(G.ck56 || 0) || s, g = grs.includes(hedef) ? hedef : 0;
    const L = W.filter((x) => +x.grade === g).sort((a, b) => String(a.unitId).localeCompare(String(b.unitId), 'tr', {numeric: true}) || String(a.topicId || '').localeCompare(String(b.topicId || ''), 'tr', {numeric: true}));
    let oner = null;
    try { const x = V55.Altin && V55.Altin.sonraki ? V55.Altin.sonraki(g) : null; if (x && x.t) oner = L.find((w) => w.topicId === x.t.id) || L.find((w) => w.unitId === x.t.unitId && !w.topicId) || L.find((w) => w.unitId === x.t.unitId); } catch (x) {}
    oner = oner || L[0] || null;
    const uAd = (id) => { const u = Store.get('units', id); return u ? (V55.Dunya && V55.Dunya.adBicim ? V55.Dunya.adBicim(u.title) : u.title) : ''; };
    const ad = (w) => String(w.title || '').replace(/\s*·\s*(Çarkıfelek|Çark Çevirme|Ünite çarkı)\s*$/i, '').trim() || uAd(w.unitId);
    const gruplar = {}; L.forEach((w) => (gruplar[w.unitId] = gruplar[w.unitId] || []).push(w));
    const AL = !!V39.on;
    const bas = AL ? `<div class="p39 p39-pg ck56-al">${V39.crumb([['Koridor', "go('pdunya')"], ['Oyun Dünyası', "go('poyun')"], ['Çark Çevirme', '']])}` : `<button class="back" onclick="go('games')">‹ Oyunlar</button>`;
    $.innerHTML = `${bas}<section class="ck56" aria-labelledby="ck56-h"><header class="ck56-b"><span class="ck56-il" style="--oh:${TON.cark}">${SC(IL.cark)}</span><div><small>Oyun</small><h1 id="ck56-h">Çark Çevirme</h1><p>Çarkı çevir, çıkan soruyu yanıtla. Sorular bilgi kartlarından gelir.</p></div></header>
<div class="ck56-sn" role="group" aria-label="Sınıf">${grs.map((x) => `<button type="button" class="${x === g ? 'on' : ''}" aria-pressed="${x === g}" onclick="G.ck56=${x};draw()">${x}. sınıf${x === s ? ' · Sınıfım' : ''}</button>`).join('')}</div>
${!grs.length ? '<p class="ck56-y">Kaynakta veri bulunmuyor: çark oyunu kaydı yok.</p>' : !g ? `<p class="ck56-y">${hedef ? `${hedef}. sınıf için kaynakta çark oyunu yok.` : 'Sınıfını seçmedin.'} Çark oyunu olan sınıflardan birini seçebilirsin.</p>` : `
${oner ? `<article class="ck56-o"><div><small>${oner.topicId ? 'Önerilen konu' : 'Önerilen ünite'}</small><b>${e(ad(oner))}</b><span>${e(uAd(oner.unitId))} · ${(oner.cardIds || []).length} soru</span></div><button type="button" class="ck56-cv" onclick="playGame('${e(oner.id)}')">Çarkı çevir ${OK}</button></article>` : ''}
<h2 class="ck56-h2">Bütün çarklar · ${g}. sınıf</h2>
${Object.entries(gruplar).map(([u, Lw]) => `<section class="ck56-u"><h3>${e(uAd(u))}</h3><div class="ck56-l">${Lw.map((w) => `<button type="button" onclick="playGame('${e(w.id)}')"><span><b>${e(w.topicId ? ad(w) : 'Ünite çarkı')}</b><small>${(w.cardIds || []).length} soru</small></span>${OK}</button>`).join('')}</div></section>`).join('')}`}
</section>${AL ? '</div>' : ''}`;
  };
  V30.routes.cark56 = function () { CK.render(); };
  try { if (V55.Duzen) { V55.Duzen.ALT.cark56 = 'oyun'; V55.Duzen.ELMAS.cark56 = 'games'; } } catch (x) {}

  /* ---------- 3. oyun listesi: önce filtre ---------- */
  try {
    const HV = V53.Hesap && V53.Hesap.HAVUZ;
    if (HV) Object.defineProperty(HV, 'games', {configurable: true, enumerable: true, get: () => ((G.gf || {}).tum56 ? null : ['games', 'questions'])});
  } catch (x) {}
  const F = V56.OyunFiltre = {};
  F.secili = () => { const f = G.gf || {}; return !!(f.ty || f.u || f.t); };
  F.sinifSec = function (tum) { const f = G.gf = Object.assign({g: '', u: '', t: '', ty: '', timed: 0, n: 30}, G.gf || {}); f.tum56 = tum ? 1 : 0; gSet('g', tum ? '' : (sinif() || '')); };
  F.temizle = function () { const f = G.gf = Object.assign({}, G.gf || {}); f.ty = ''; f.u = ''; f.t = ''; f.n = 30; draw(); };
  F.duzenle = function () {
    if (view !== 'games' || $.querySelector('.gf56')) return;
    const f = G.gf || {}, s = sinif(), tum = !!f.tum56, sec = F.secili();
    let L = []; try { L = gList(); } catch (x) {}
    const gg = f.g ? +f.g : (tum ? 0 : s);
    const us = gg ? [...new Map(L.filter((x) => +x.grade === gg).map((x) => [x.unitId, Store.get('units', x.unitId)])).values()].filter(Boolean) : [];
    const ts = f.u ? [...new Map(L.filter((x) => x.unitId === f.u && x.topicId).map((x) => [x.topicId, Store.get('topics', x.topicId)])).values()].filter(Boolean) : [];
    const grs = [...new Set(L.map((x) => +x.grade))].sort((a, b) => a - b);
    const sel = (k, ops, lab) => `<label class="gf56-s"><span>${lab}</span><select onchange="${k === 'g' ? "gSet('g',this.value)" : `gSet('${k}',this.value)`}">${ops.map(([v, t]) => `<option value="${e(v)}" ${String(f[k] || '') === String(v) ? 'selected' : ''}>${e(t)}</option>`).join('')}</select></label>`;
    const n = (() => { try { return gFilterList(L, f).length; } catch (x) { return 0; } })();
    const panel = `<section class="gf56" aria-labelledby="gf56-h"><h2 id="gf56-h">Oyun bul</h2>
<div class="gf56-a"><span class="gf56-l">Sınıf</span><div class="gf56-sn" role="group" aria-label="Sınıf">${s ? `<button type="button" class="${!tum ? 'on' : ''}" aria-pressed="${!tum}" onclick="V56.OyunFiltre.sinifSec(false)">Sınıfım · ${s}. sınıf</button>` : ''}<button type="button" class="${tum || !s ? 'on' : ''}" aria-pressed="${tum || !s}" onclick="V56.OyunFiltre.sinifSec(true)">Tüm sınıflar</button></div></div>
${tum || !s ? `<div class="gf56-a">${sel('g', [['', 'Bütün sınıflar']].concat(grs.map((x) => [x, x + '. sınıf'])), 'Hangi sınıf?')}</div>` : ''}
${us.length ? `<div class="gf56-a gf56-iki">${sel('u', [['', 'Bütün üniteler']].concat(us.map((u) => [u.id, u.title])), 'Ünite')}${f.u && ts.length ? sel('t', [['', 'Bütün konular']].concat(ts.map((t) => [t.id, t.title])), 'Konu') : ''}</div>` : ''}
<p class="gf56-n">${sec ? `<b>${n}</b> oyun bulundu. <button type="button" class="gf56-tz" onclick="V56.OyunFiltre.temizle()">Seçimi temizle</button>` : 'Aşağıdan bir <b>oyun türü</b> seç ya da <b>ünite/konu</b> seç; yalnız ilgili oyunlar listelenir. Bir türe ikinci kez dokunursan o türden rastgele bir oyun başlar.'}</p></section>`;
    const tip = $.querySelector('.gh-types');
    if (tip) { tip.insertAdjacentHTML('beforebegin', panel); tip.insertAdjacentHTML('beforebegin', '<h3 class="gf56-th">Oyun türleri</h3>'); }
    else { const h = $.querySelector('.gh-hero, section.hero'); if (h) h.insertAdjacentHTML('afterend', panel); else $.insertAdjacentHTML('afterbegin', panel); }
    $.querySelectorAll('.gh-bar, .gh-mix').forEach((x) => x.classList.add('gf56-gz'));
    if (!sec) {
      $.querySelectorAll('.gh-sec, .gcd30, .kart43, .gh-row').forEach((x) => x.classList.add('gf56-gz'));
      [...$.querySelectorAll('button.p')].filter((b) => /Daha fazla göster/.test(b.textContent)).forEach((b) => b.classList.add('gf56-gz'));
    } else { const h = $.querySelector('.gh-sec h2'); if (h) h.textContent = 'Seçtiğin oyunlar'; }
  };

  /* ---------- 4. stiller ---------- */
  try {
    const st = document.createElement('style'); st.id = 'v56-oyun-css';
    st.textContent = `
.ao56-l{grid-template-columns:repeat(auto-fill,minmax(min(100%,150px),1fr))!important;gap:10px!important}
.ao56-k{padding:0!important;min-height:0!important;overflow:hidden;border-radius:18px!important;gap:0!important;box-shadow:var(--a56-sh,0 6px 18px -10px rgba(0,0,0,.4));transition:transform .2s ease,border-color .2s ease}
.ao56-k>svg{display:none}
.og56-r{display:grid;place-items:center;width:100%;height:84px;background:radial-gradient(120% 140% at 30% 0%,hsl(var(--oh) 55% 50% / .30),transparent 60%),linear-gradient(180deg,hsl(var(--oh) 40% 45% / .16),hsl(var(--oh) 40% 45% / .05));border-bottom:1px solid color-mix(in srgb,var(--p-line,var(--line)) 80%,transparent)}
.og56-s{width:96px;height:64px;fill:none;stroke:hsl(var(--oh) 45% 72%);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
html[data-pt43="gunduz"] .og56-s,html[data-theme="light"] body:not([data-prem39]) .og56-s{stroke:hsl(var(--oh) 45% 32%)}
.og56-s .f{fill:hsl(var(--oh) 50% 55% / .16);stroke:none}.og56-s .d{stroke:var(--p-gold,var(--pri));fill:color-mix(in srgb,var(--p-gold,var(--pri)) 35%,transparent)}
.og56-s .dd{fill:hsl(var(--oh) 55% 55% / .55);stroke:hsl(var(--oh) 45% 72%)}.og56-s .b{fill:hsl(var(--oh) 40% 50% / .18)}.og56-s .a{stroke:var(--p-gold,var(--pri));stroke-width:2.4}.og56-s .k{stroke-width:4}.og56-s .i{stroke-dasharray:2 4;opacity:.7}
.og56-s .t{fill:var(--p-gold,var(--pri));stroke:none;font:800 15px var(--sans,sans-serif)}
html[data-pt43="gunduz"] .og56-s .dd{stroke:hsl(var(--oh) 45% 32%)}
.og56-t{display:flex;flex-direction:column;gap:3px;padding:10px 12px 12px;text-align:left}.og56-t b{font-size:.95rem;line-height:1.25}.og56-t small{color:var(--p-mut,var(--mut));font-size:.76rem;line-height:1.3}
@media (hover:hover){.ao56-k:hover{transform:translateY(-2px)}}
.ao56-k:active{transform:translateY(1px) scale(.99)}
.ck56{display:grid;gap:14px;margin:6px 0 24px}
.ck56-b{display:flex;align-items:center;gap:14px;padding:16px;border-radius:22px;border:1px solid var(--p-line,var(--line));background:linear-gradient(160deg,hsl(var(--oh,335) 50% 50% / .14),var(--p-card,var(--surface)) 60%)}
.ck56-b small{color:var(--p-gold-t,var(--pri));font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:.72rem}.ck56-b h1{margin:2px 0 4px;font-size:1.5rem}.ck56-b p{margin:0;color:var(--p-mut,var(--mut));font-size:.9rem}
.ck56-il{--oh:335;display:grid;place-items:center;width:96px;height:72px;flex:none;border-radius:18px;background:hsl(var(--oh) 45% 45% / .14)}
.ck56-sn,.gf56-sn{display:flex;flex-wrap:wrap;gap:8px}
.ck56-sn button,.gf56-sn button{min-height:42px;padding:6px 14px;border-radius:999px;border:1px solid var(--p-line,var(--line));background:var(--p-card,var(--surface));color:var(--p-ink,var(--ink));font:inherit;font-weight:600;cursor:pointer}
.ck56-sn button.on,.gf56-sn button.on{border-color:var(--p-gold,var(--pri));box-shadow:0 0 0 1.5px var(--p-gold,var(--pri)) inset;background:color-mix(in srgb,var(--p-gold,var(--pri)) 12%,var(--p-card,var(--surface)))}
.ck56-o{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:16px;border-radius:20px;border:1px solid color-mix(in srgb,var(--p-gold,var(--pri)) 40%,var(--p-line,var(--line)));background:var(--p-card2,var(--surface2))}
.ck56-o div{display:flex;flex-direction:column;gap:3px}.ck56-o small{color:var(--p-gold-t,var(--pri));font-weight:700}.ck56-o b{font-size:1.08rem}.ck56-o span{color:var(--p-mut,var(--mut));font-size:.84rem}
.ck56-cv{display:inline-flex;align-items:center;gap:6px;min-height:48px;padding:8px 20px;border-radius:999px;border:0;background:var(--p-gold,var(--pri));color:var(--p-on-gold,#fff);font:inherit;font-weight:800;cursor:pointer}
.ck56-h2{margin:6px 2px 0;font-size:1rem}.ck56-u h3{margin:8px 2px 6px;font-size:.88rem;color:var(--p-mut,var(--mut))}
.ck56-l{display:grid;gap:8px}.ck56-l button{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:54px;padding:8px 14px;border-radius:14px;border:1px solid var(--p-line,var(--line));background:var(--p-card,var(--surface));color:var(--p-ink,var(--ink));font:inherit;text-align:left;cursor:pointer}
.ck56-l button span{display:flex;flex-direction:column}.ck56-l small{color:var(--p-mut,var(--mut));font-size:.78rem}.ck56-y{color:var(--p-mut,var(--mut))}
.gf56{margin:12px 0;padding:16px;border-radius:20px;border:1px solid var(--p-line,var(--line));background:var(--p-card,var(--surface));display:grid;gap:12px}
.gf56 h2{margin:0;font-size:1.05rem}.gf56-a{display:grid;gap:6px}.gf56-l{font-size:.8rem;font-weight:700;color:var(--p-mut,var(--mut))}
.gf56-iki{grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:10px}
.gf56-s{display:grid;gap:4px;min-width:0}.gf56-s span{font-size:.8rem;font-weight:700;color:var(--p-mut,var(--mut))}
.gf56-s select{width:100%;min-height:46px;padding:6px 10px;border-radius:12px;border:1px solid var(--p-line,var(--line));background:var(--p-card2,var(--surface2));color:var(--p-ink,var(--ink));font:inherit;text-overflow:ellipsis}
.gf56-n{margin:0;color:var(--p-mut,var(--mut));font-size:.88rem;line-height:1.45}.gf56-n b{color:var(--p-ink,var(--ink))}
.gf56-tz{min-height:36px;margin-left:6px;padding:2px 12px;border-radius:999px;border:1px solid var(--p-line,var(--line));background:none;color:var(--p-ink,var(--ink));font:inherit;font-weight:600;cursor:pointer}
.gf56-th{margin:14px 2px 6px;font-size:.95rem}
.gf56-gz{display:none!important}
`;
    document.head.appendChild(st);
  } catch (x) {}

  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try { F.duzenle(); } catch (x) { console.warn('[V56] oyun filtresi', x); }
    return r;
  };
})();
