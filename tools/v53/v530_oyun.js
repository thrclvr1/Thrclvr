/* ===================== V53.0 (3/3): oyunlar =====================
   • Elmas: “Çarkıfelek” görünen adı “Çark Çevirme” (oyun mekaniği aynı; yalnız görünen metin).
   • Altın Oyunları rota 'aoyun53' (yalnız Altın açıkken — şimdilik editör önizlemesi):
       – Zirve Yarışı: kolaydan zora 10 soru, ödül basamakları (5. basamak baraj), iki joker (%50, Soru değiştir), çekilme.
         Sorular yalnız uygulamadaki soru bankasından (questions; seçilen sınıf, yetmezse bütün sınıflar); açıklama cevaptan sonra.
       – Harf Avı: ders kitabındaki kavram adlarından (concepts.term; tek sözcük, 4–7 harf) kelime tahmini; ilk harf verilir,
         6 hak, doğru harf/doğru yer geri bildirimi; ipucu kavramın ders kitabındaki geçtiği cümledir (kavram gizlenir).
         Sınıf/ünite/sayfa gibi teknik bilgi gösterilmez.
     Cevaplar Prog.rec ile ortak ilerlemeye yazılır. En iyi skorlar dk-oyun53 = {v:1, zirve:{enIyi}, harf:{enIyi}}. */
(function () {
  if (!window.V51 || !V51.Altin || typeof V30 === 'undefined') return;
  const V53 = window.V53 = window.V53 || {};
  const A = V51.Altin;
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const ls = {al: (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } }, yaz: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }};
  const OY = V53.Oyun = {K: 'dk-oyun53'};
  OY.kayit = () => { const r = ls.al(OY.K); return r && r.v === 1 ? r : {v: 1, zirve: {}, harf: {}}; };
  OY.enIyi = (oy, p) => { const r = OY.kayit(); r[oy] = r[oy] || {}; if (!(r[oy].enIyi >= p)) { r[oy].enIyi = p; ls.yaz(OY.K, r); return true; } return false; };
  const karistir = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  OY.sinif = () => { try { return (V53.Hesap && V53.Hesap.sinif()) || +(V39.ilr().sonSinif || 0) || 0; } catch (x) { return 0; } };
  const yayinda = (x) => { try { return typeof V45 === 'undefined' || !V45.yayinaUygun || V45.yayinaUygun(x); } catch (y) { return true; } };
  const kaydet = (oids, ok) => { try { if (oids && oids.length) { Prog.rec(oids, ok); Store.save(); } } catch (x) {} };

  /* ---------- 1. Çark Çevirme (yalnız görünen ad) ---------- */
  OY.adDegistir = function (kok) {
    try {
      const w = document.createTreeWalker(kok || document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = w.nextNode())) if (n.nodeValue.includes('Çarkıfelek')) n.nodeValue = n.nodeValue.replace(/Çarkıfelek/g, 'Çark Çevirme');
      (kok || document.body).querySelectorAll('[aria-label*="Çarkıfelek"],[title*="Çarkıfelek"]').forEach((x) => { ['aria-label', 'title'].forEach((a) => { const v = x.getAttribute(a); if (v) x.setAttribute(a, v.replace(/Çarkıfelek/g, 'Çark Çevirme')); }); });
    } catch (x) {}
  };

  /* ---------- 2. Zirve Yarışı ---------- */
  const Z = OY.Zirve = {ODUL: [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000], BARAJ: 4, PLAN: ['easy', 'easy', 'easy', 'easy', 'medium', 'medium', 'medium', 'medium', 'hard', 'hard']};
  Z.havuz = function () {
    const s = OY.sinif(), uygun = (q) => q && Array.isArray(q.options) && q.options.length >= 3 && Number.isInteger(q.answer) && q.options[q.answer] != null && q.text && yayinda(q);
    let L = Store.all('questions').filter(uygun);
    const S = s ? L.filter((q) => +q.grade === s) : L;
    return S.length >= 12 ? S : L;
  };
  Z.sec = function (zor, haric) {
    const L = Z.havuz().filter((q) => !haric.has(q.id)), sira = {easy: ['easy', 'medium', 'hard'], medium: ['medium', 'easy', 'hard'], hard: ['hard', 'medium', 'easy']}[zor];
    for (const d of sira) { const a = L.filter((q) => q.difficulty === d); if (a.length) return a[Math.floor(Math.random() * a.length)]; }
    return L[0] || null;
  };
  Z.basla = function () {
    const kul = new Set(), sorular = [];
    for (const d of Z.PLAN) { const q = Z.sec(d, kul); if (!q) break; kul.add(q.id); sorular.push(q); }
    Z.d = {sorular, kul, i: 0, j50: true, jdeg: true, gizli: [], cevap: null, bitti: false, kazanc: 0};
    Z.ciz();
  };
  Z.ciz = function () {
    const d = Z.d;
    if (!d || !d.sorular.length) { $.innerHTML = OY.kabuk('Zirve Yarışı', '<p class="ao53-bos">Bu sınıf için yeterli soru bulunmuyor.</p>'); return; }
    if (d.bitti) {
      const yeni = OY.enIyi('zirve', d.kazanc);
      $.innerHTML = OY.kabuk('Zirve Yarışı', `<div class="ao53-son"><p>${e(d.mesaj)}</p><b class="ao53-puan">${d.kazanc.toLocaleString('tr-TR')} puan</b>${yeni && d.kazanc ? '<p class="ao53-rek">Yeni rekor!</p>' : ''}<p class="small mut">En iyi: ${(OY.kayit().zirve.enIyi || 0).toLocaleString('tr-TR')}</p><div class="ao53-bb"><button type="button" class="ao53-p" onclick="V53.Oyun.Zirve.basla()">Yeniden oyna</button><button type="button" onclick="go('aoyun53')">Altın Oyunları</button></div></div>`);
      return;
    }
    const q = d.sorular[d.i], hedef = Z.ODUL[d.i], c = d.cevap;
    const sik = q.options.map((o, k) => {
      const gz = d.gizli.includes(k), cls = c == null ? '' : (k === q.answer ? 'dg' : (k === c ? 'yn' : ''));
      return `<button type="button" class="ao53-s ${cls}" ${gz || c != null ? 'disabled' : ''} ${gz ? 'aria-hidden="true" style="visibility:hidden"' : ''} onclick="V53.Oyun.Zirve.cevapla(${k})"><i>${'ABCDEF'[k]}</i>${e(o)}</button>`;
    }).join('');
    $.innerHTML = OY.kabuk('Zirve Yarışı', `<div class="ao53-z">
<ol class="ao53-merdiven" aria-label="Ödül basamakları">${Z.ODUL.map((p, k) => `<li class="${k === d.i ? 'su' : ''} ${k < d.i ? 'gc' : ''} ${k === Z.BARAJ || k === Z.ODUL.length - 1 ? 'br' : ''}"><span>${k + 1}</span><b>${p.toLocaleString('tr-TR')}</b></li>`).reverse().join('')}</ol>
<div class="ao53-soru"><p class="ao53-ad">Soru ${d.i + 1}/${d.sorular.length} · ${hedef.toLocaleString('tr-TR')} puan için</p><h2>${e(q.text)}</h2><div class="ao53-sk">${sik}</div>
${c != null ? `<div class="ao53-ack ${c === q.answer ? 'dg' : 'yn'}" role="status"><b>${c === q.answer ? 'Doğru!' : 'Yanlış.'}</b> ${q.explanation ? e(q.explanation) : ''}</div><div class="ao53-bb"><button type="button" class="ao53-p" onclick="V53.Oyun.Zirve.ileri()">${c === q.answer && d.i < d.sorular.length - 1 ? 'Sonraki soru' : 'Sonucu gör'}</button></div>`
    : `<div class="ao53-bb"><button type="button" ${d.j50 ? '' : 'disabled'} onclick="V53.Oyun.Zirve.joker50()">%50 jokeri</button><button type="button" ${d.jdeg ? '' : 'disabled'} onclick="V53.Oyun.Zirve.jokerDegis()">Soruyu değiştir</button><button type="button" onclick="V53.Oyun.Zirve.cekil()">Çekil (${(d.i ? Z.ODUL[d.i - 1] : 0).toLocaleString('tr-TR')})</button></div>`}
</div></div>`);
  };
  Z.cevapla = function (k) { const d = Z.d, q = d.sorular[d.i]; if (d.cevap != null) return; d.cevap = k; kaydet(q.outcomeIds, k === q.answer); Z.ciz(); };
  Z.ileri = function () {
    const d = Z.d, q = d.sorular[d.i];
    if (d.cevap === q.answer) {
      d.kazanc = Z.ODUL[d.i];
      if (d.i >= d.sorular.length - 1) { d.bitti = true; d.mesaj = 'Zirveye ulaştın!'; }
      else { d.i++; d.cevap = null; d.gizli = []; }
    } else { d.bitti = true; d.kazanc = d.i > Z.BARAJ ? Z.ODUL[Z.BARAJ] : 0; d.mesaj = d.kazanc ? 'Yanlış cevap; baraj puanını aldın.' : 'Yanlış cevap. Bir dahaki sefere!'; }
    Z.ciz();
  };
  Z.joker50 = function () { const d = Z.d, q = d.sorular[d.i]; if (!d.j50) return; d.j50 = false; d.gizli = karistir(q.options.map((o, k) => k).filter((k) => k !== q.answer)).slice(0, Math.max(0, q.options.length - 2)); Z.ciz(); };
  Z.jokerDegis = function () { const d = Z.d; if (!d.jdeg) return; const y = Z.sec(Z.PLAN[d.i], d.kul); if (!y) { UI.toast('Değiştirilecek başka soru yok.'); return; } d.jdeg = false; d.kul.add(y.id); d.sorular[d.i] = y; d.gizli = []; Z.ciz(); };
  Z.cekil = function () { const d = Z.d; d.kazanc = d.i ? Z.ODUL[d.i - 1] : 0; d.bitti = true; d.mesaj = 'Çekildin; kazandığın puanı korudun.'; Z.ciz(); };

  /* ---------- 3. Harf Avı ---------- */
  const HA = OY.Harf = {HARF: 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ', HAK: 6, TUR: 5};
  const buyuk = (s) => String(s).toLocaleUpperCase('tr-TR');
  HA.havuz = function () {
    const s = OY.sinif(), re = new RegExp('^[' + HA.HARF + ']{4,7}$');
    const al = (L) => { const g = new Map(); L.forEach((c) => { const w = buyuk(String(c.term || '').trim()); if (re.test(w) && !g.has(w)) g.set(w, c); }); return [...g.entries()]; };
    const tum = Store.all('concepts').filter((c) => c && c.term && yayinda(c));
    const S = s ? al(tum.filter((c) => +c.grade === s)) : al(tum);
    return S.length >= HA.TUR ? S : al(tum);
  };
  HA.ipucu = function (c, w) {
    const sn = c.snippet && typeof c.snippet === 'object' ? c.snippet.text : c.snippet; let t = String(sn || '').replace(/\s+/g, ' ').trim(); if (!t) return '';
    const re = new RegExp(String(c.term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu');
    const i = t.search(re); if (i > 70) t = '…' + t.slice(i - 60);
    if (t.length > 180) t = t.slice(0, 180) + '…';
    return t.replace(re, '▢'.repeat(w.length));
  };
  HA.basla = function () {
    const L = karistir(HA.havuz()).slice(0, HA.TUR);
    HA.d = {L, i: 0, puan: 0, tahmin: [], yazi: '', bitti: false, cozuldu: null};
    HA.ciz();
  };
  HA.renk = function (t, w) {
    const r = Array(w.length).fill('yok'), kalan = {};
    for (let k = 0; k < w.length; k++) { if (t[k] === w[k]) r[k] = 'dg'; else kalan[w[k]] = (kalan[w[k]] || 0) + 1; }
    for (let k = 0; k < w.length; k++) if (r[k] !== 'dg' && kalan[t[k]] > 0) { r[k] = 'yr'; kalan[t[k]]--; }
    return r;
  };
  HA.ciz = function () {
    const d = HA.d;
    if (!d || !d.L.length) { $.innerHTML = OY.kabuk('Harf Avı', '<p class="ao53-bos">Bu sınıf için uygun kavram bulunmuyor.</p>'); return; }
    if (d.bitti) {
      const yeni = OY.enIyi('harf', d.puan);
      $.innerHTML = OY.kabuk('Harf Avı', `<div class="ao53-son"><p>${d.L.length} kelimelik tur bitti.</p><b class="ao53-puan">${d.puan} puan</b>${yeni && d.puan ? '<p class="ao53-rek">Yeni rekor!</p>' : ''}<div class="ao53-bb"><button type="button" class="ao53-p" onclick="V53.Oyun.Harf.basla()">Yeniden oyna</button><button type="button" onclick="go('aoyun53')">Altın Oyunları</button></div></div>`);
      return;
    }
    const [w, c] = d.L[d.i], n = w.length, ip = HA.ipucu(c, w);
    const satir = (t, r) => `<div class="ao53-hs" style="--n:${n}">${[...Array(n)].map((_, k) => `<span class="${r ? r[k] : ''}">${e(t[k] || '')}</span>`).join('')}</div>`;
    const satirlar = d.tahmin.map((t) => satir(t, HA.renk(t, w))).join('') + (d.cozuldu == null ? satir(w[0] + d.yazi.slice(1), null) : '') + [...Array(Math.max(0, HA.HAK - d.tahmin.length - (d.cozuldu == null ? 1 : 0)))].map(() => satir('', null)).join('');
    const durum = {}; d.tahmin.forEach((t) => { const r = HA.renk(t, w); [...t].forEach((h, k) => { const o = {dg: 3, yr: 2, yok: 1}[r[k]]; if (!(durum[h] >= o)) durum[h] = o; }); });
    const kl = [...HA.HARF].map((h) => `<button type="button" class="ao53-ht ${['', 'yok', 'yr', 'dg'][durum[h] || 0]}" ${d.cozuldu != null ? 'disabled' : ''} onclick="V53.Oyun.Harf.tus('${h}')">${h}</button>`).join('');
    $.innerHTML = OY.kabuk('Harf Avı', `<div class="ao53-h"><p class="ao53-ad">Kelime ${d.i + 1}/${d.L.length} · ${n} harf · ${d.puan} puan</p>
${ip ? `<p class="ao53-ip"><b>İpucu:</b> ${e(ip)}</p>` : '<p class="ao53-ip">Ders kitabındaki bir kavram.</p>'}
<div class="ao53-iz">${satirlar}</div>
${d.cozuldu != null ? `<div class="ao53-ack ${d.cozuldu ? 'dg' : 'yn'}" role="status"><b>${d.cozuldu ? 'Bildin!' : 'Bulamadın.'}</b> Kelime: <b>${e(w)}</b></div><div class="ao53-bb"><button type="button" class="ao53-p" onclick="V53.Oyun.Harf.sonraki()">${d.i < d.L.length - 1 ? 'Sonraki kelime' : 'Sonucu gör'}</button></div>`
    : `<div class="ao53-kl" aria-label="Harfler">${kl}<button type="button" class="ao53-ht gn" onclick="V53.Oyun.Harf.sil()">Sil</button><button type="button" class="ao53-ht gn ao53-p" onclick="V53.Oyun.Harf.gonder()">Tahmin et</button></div><p class="small mut ao53-ac">Yeşil: doğru harf, doğru yer · Sarı: harf var, yeri farklı · Gri: harf yok.</p>`}</div>`);
  };
  HA.tus = function (h) { const d = HA.d, n = d.L[d.i][0].length; if (d.cozuldu != null) return; if (!d.yazi) d.yazi = d.L[d.i][0][0]; if (d.yazi.length < n) d.yazi += h; HA.ciz(); };
  HA.sil = function () { const d = HA.d; if (d.yazi.length > 1) d.yazi = d.yazi.slice(0, -1); HA.ciz(); };
  HA.gonder = function () {
    const d = HA.d, [w, c] = d.L[d.i]; let t = d.yazi || w[0];
    if (t.length !== w.length) { UI.toast(`${w.length} harf yazmalısın.`); return; }
    d.tahmin.push(t); d.yazi = '';
    if (t === w) { d.cozuldu = true; d.puan += (HA.HAK - d.tahmin.length + 1) * 10; kaydet(c.outcomeIds, true); }
    else if (d.tahmin.length >= HA.HAK) { d.cozuldu = false; kaydet(c.outcomeIds, false); }
    HA.ciz();
  };
  HA.sonraki = function () { const d = HA.d; if (d.i >= d.L.length - 1) d.bitti = true; else { d.i++; d.tahmin = []; d.yazi = ''; d.cozuldu = null; } HA.ciz(); };
  document.addEventListener('keydown', (ev) => {
    if (view !== 'aoyun53' || !HA.d || OY.aktif !== 'harf' || HA.d.cozuldu != null || HA.d.bitti) return;
    if (ev.target && /INPUT|TEXTAREA/.test(ev.target.tagName)) return;
    const k = buyuk(ev.key);
    if (ev.key === 'Enter') { ev.preventDefault(); HA.gonder(); } else if (ev.key === 'Backspace') { ev.preventDefault(); HA.sil(); } else if (k.length === 1 && HA.HARF.includes(k)) { ev.preventDefault(); HA.tus(k); }
  });

  /* ---------- 4. Altın Oyunları merkezi ---------- */
  OY.kabuk = (ad, ic) => `<section class="ao53"><div class="ao53-ust"><button type="button" class="ao53-geri" onclick="go('aoyun53')">‹ Altın Oyunları</button><h1>${e(ad)}</h1></div>${ic}</section>`;
  OY.merkez = function () {
    const r = OY.kayit();
    $.innerHTML = `<section class="ao53"><div class="ao53-ust"><small>Altın · Oyunlar</small><h1>Altın Oyunları</h1><p class="mut">Sorular ve kavramlar uygulamadaki soru bankasından ve ders kitabından gelir${OY.sinif() ? ` (${OY.sinif()}. sınıf)` : ''}.</p></div>
<div class="ao53-kartlar">
<button type="button" class="ao53-k" onclick="V53.Oyun.ac('zirve')"><b>Zirve Yarışı</b><small>Kolaydan zora 10 soru, ödül basamakları, iki joker.</small><em>En iyi: ${(r.zirve.enIyi || 0).toLocaleString('tr-TR')}</em></button>
<button type="button" class="ao53-k" onclick="V53.Oyun.ac('harf')"><b>Harf Avı</b><small>İpucundan kavramı bul; harf harf ipucu al.</small><em>En iyi: ${r.harf.enIyi || 0}</em></button>
</div>
<p class="small mut">Gelecek sürümlerde: Beni Bul!, Harf Halkası, Bilgi Arenası, Gizli Bilgin, Kelimeyi Anlat Bakalım ve hikâyeli görevler.</p></section>`;
  };
  OY.ac = function (k) { OY.aktif = k; if (k === 'zirve') Z.basla(); else if (k === 'harf') HA.basla(); };
  V30.routes.aoyun53 = function () {
    if (!A.acikMi()) { A.yakinda && A.yakinda('aoyun53'); OY.aktif = null; return V30.routes.games ? V30.routes.games.apply(this, arguments) : go('games'); }
    if (OY.aktif === 'zirve' && Z.d) return Z.ciz();
    if (OY.aktif === 'harf' && HA.d) return HA.ciz();
    OY.merkez();
  };
  const go0 = go;
  window.go = go = function (v) { if (v === 'aoyun53' && view === 'aoyun53') OY.aktif = null; return go0.apply(this, arguments); };

  try {
    const st = document.createElement('style'); st.id = 'v53-oyun-css';
    st.textContent = `.ao53{padding-bottom:28px}.ao53-ust small{color:var(--p-gold,var(--pri));font-weight:700}.ao53-ust h1{margin:4px 0 8px}
.ao53-geri{min-height:40px;padding:4px 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;cursor:pointer}
.ao53-kartlar{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))}
.ao53-k{display:flex;flex-direction:column;gap:6px;text-align:left;padding:18px;border-radius:18px;border:1px solid var(--p-gold,var(--line));background:var(--surface);color:var(--ink);font:inherit;cursor:pointer;min-height:120px}
.ao53-k b{font-size:1.2rem}.ao53-k small{color:var(--mut)}.ao53-k em{font-style:normal;color:var(--p-gold,var(--pri));font-weight:700;margin-top:auto}
.ao53-z{display:grid;gap:14px;grid-template-columns:minmax(0,1fr)}@media(min-width:760px){.ao53-z{grid-template-columns:180px 1fr}}
.ao53-merdiven{list-style:none;margin:0;padding:8px;border-radius:14px;border:1px solid var(--line);background:var(--surface);display:grid;gap:2px;font-size:.86rem}
@media(max-width:759px){.ao53-merdiven{grid-template-columns:repeat(5,1fr);order:2}.ao53-merdiven li span{display:none}}
.ao53-merdiven li{display:flex;justify-content:space-between;gap:6px;padding:4px 8px;border-radius:8px;color:var(--mut)}.ao53-merdiven li.br{font-weight:700}.ao53-merdiven li.gc{color:var(--ink)}
.ao53-merdiven li.su{background:var(--p-gold,var(--pri));color:var(--p-on-gold,#fff)}
.ao53-ad{color:var(--mut);margin:0 0 6px}.ao53-soru h2{font-size:1.15rem;line-height:1.45;margin:0 0 14px}
.ao53-sk{display:grid;gap:10px}.ao53-s{display:flex;align-items:center;gap:12px;min-height:54px;padding:10px 14px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.ao53-s i{font-style:normal;font-weight:800;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--line);flex:none}
.ao53-s.dg{border-color:#3FA877;background:rgba(63,168,119,.16)}.ao53-s.yn{border-color:#D9574B;background:rgba(217,87,75,.14)}.ao53-s[disabled]{cursor:default}
.ao53-ack{margin:12px 0;padding:12px 14px;border-radius:12px;border:1px solid var(--line)}.ao53-ack.dg{border-color:#3FA877}.ao53-ack.yn{border-color:#D9574B}
.ao53-bb{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.ao53-bb button{min-height:46px;padding:8px 14px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:600;cursor:pointer}
.ao53-bb button[disabled]{opacity:.45;cursor:default}.ao53-p{background:var(--p-gold,var(--pri))!important;color:var(--p-on-gold,#fff)!important;border-color:transparent!important}
.ao53-son{text-align:center;padding:24px 8px}.ao53-puan{display:block;font-size:2rem;margin:8px 0}.ao53-rek{color:var(--p-gold,var(--pri));font-weight:700}.ao53-son .ao53-bb{justify-content:center}
.ao53-ip{padding:10px 12px;border-radius:12px;background:var(--surface);border:1px solid var(--line);line-height:1.5}
.ao53-iz{display:grid;gap:6px;margin:12px auto;max-width:360px}.ao53-hs{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:6px}
.ao53-hs span{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:10px;border:2px solid var(--line);font-weight:800;font-size:1.25rem;background:var(--surface)}
.ao53-hs span.dg{background:#2F8F62;border-color:#2F8F62;color:#fff}.ao53-hs span.yr{background:#B8892A;border-color:#B8892A;color:#fff}.ao53-hs span.yok{background:#4A4A50;border-color:#4A4A50;color:#fff}
.ao53-kl{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;max-width:520px;margin:0 auto}
.ao53-ht{min-width:36px;min-height:44px;padding:0 6px;border-radius:9px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:700;cursor:pointer}
.ao53-ht.dg{background:#2F8F62;color:#fff;border-color:#2F8F62}.ao53-ht.yr{background:#B8892A;color:#fff;border-color:#B8892A}.ao53-ht.yok{opacity:.45}.ao53-ht.gn{padding:0 14px}
.ao53-ac{text-align:center}.ao53-bos{color:var(--mut)}`;
    document.head.appendChild(st);
  } catch (x) {}

  /* ---------- 5. çizim sonrası: ad değişikliği, Altın oyun merkezine kart ---------- */
  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try {
      OY.adDegistir(document.getElementById('app') || document.body);
      if (view === 'poyun' && A.acikMi() && !$.querySelector('.ao53-giris')) $.insertAdjacentHTML('afterbegin', '<button type="button" class="ao53-k ao53-giris" onclick="go(\'aoyun53\')"><b>Altın Oyunları</b><small>Zirve Yarışı ve Harf Avı</small></button>');
    } catch (x) {}
    return r;
  };
  try { new MutationObserver((m) => { for (const x of m) for (const n of x.addedNodes) if (n.nodeType === 1 && /Çarkıfelek/.test(n.textContent || '')) OY.adDegistir(n); }).observe(document.body, {childList: true, subtree: true}); } catch (x) {}
})();
