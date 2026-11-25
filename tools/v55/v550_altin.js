/* ===================== V55.0 (2/3): Altın — sade ana sayfa, sınıf merkezi, Çalışma Masam, tema seçimi =====================
   Tasarım ölçütü: Altın'ın kalitesi kart sayısıyla ölçülmez; daha gelişmiş ama daha karmaşık değil.
   • Ana sayfa (koridor altı) .ah55: tek ana kart (kaldığın yer / sıradaki konu + günlük hedef halkası + “Devam et”), üç kısa
     yol (Derslerim · Oyun Dünyası · Çalışma Masam), tek “Keşif” bölümü (Sureler ve Dualar, Kavramlar, Kişiler ve Eserler,
     Bağlantılar, Öğrenme araçları). V47 .s47 şeridi ve V54 .ah54 tekrarları Altın ana sayfasında gösterilmez (kod duruyor).
     Editör önizleme notu yalnız editör oturumunda, en altta küçük bir satır.
   • Sınıf merkezi (psinif) V55.Sinif: “Nereden başlamalıyım?” kartı (kaldığın konu ya da sıradaki konu), tek ilerleme satırı,
     ünite akordiyonu (başta kapalı, tek ünite açık, konu durumları), oyun dünyası; program seçimi, ders kitabı, kazanım
     ilerlemesi ve öğrenme araçları “Daha fazla” altında (kapalı).
   • Çalışma Masam (acalis53) V55.Masa: ilk ekran üç soruyu yanıtlar (Bugün ne çalışmalıyım? / Hangi konularda eksiğim var? /
     Şimdi hangi çalışmayı yapmalıyım?); sonra plan, hedefler (aşılan hedef açıkça: 30/20 · +10), yanlışlar ve tekrar kartları;
     ayrıntılı gelişim ve geçmiş en altta. Bütün sayılar bu cihazdaki gerçek kayıtlardan; veri yoksa açıkça yazar.
   • Tema: renkler derlemede üretilir (tools/v55/build550.py). Altın'da seçim/odak göstergeleri temanın vurgu rengiyle (mavi değil). */
(function () {
  if (typeof V39 === 'undefined' || !window.V53 || !V53.Calis || !window.V54 || !V54.AltinAna) return;
  const V55 = window.V55 = window.V55 || {};
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const altin = () => { try { return !!V39.on; } catch (x) { return false; } };
  const editor = () => { try { return typeof V38 !== 'undefined' && !!V38.edOk(); } catch (x) { return false; } };
  const ls = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } };
  const CM = V53.Calis, O = V53.Onizleme;
  const SV = (p, s) => `<svg width="${s || 22}" height="${s || 22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
  const IK = {
    kitap: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    oyun: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15.5 12h.01M18 13.5h.01"/>',
    masa: '<path d="M3 20V9h18v11"/><path d="M3 13h18M8 9V5h8v4"/>',
    sure: '<path d="M12 3c-4 3-6 6-6 9a6 6 0 0 0 12 0c0-3-2-6-6-9z"/><path d="M12 9v6"/>',
    kavram: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    kisi: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    bag: '<circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="m8.7 10.6 6.6-3.2M8.7 13.4l6.6 3.2"/>',
    arac: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    ok: '<path d="m9 6 6 6-6 6"/>',
    tik: '<path d="m5 12 5 5 9-10"/>',
    hedef: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>'
  };
  const tarih = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  /* ---------- ortak: sıradaki konu ---------- */
  const A = V55.Altin = {};
  A.sinif = () => { try { return CM.sinif() || +(V39.ilr().sonSinif || 0) || 0; } catch (x) { return 0; } };
  A.konular = function (g) { try { const py = V39.pv(g); return V39.units(g, py).flatMap((u) => V39.tops(u.id).map((t) => ({t, u}))); } catch (x) { return []; } };
  A.sonraki = function (g) {
    if (!g) return null;
    const L = A.konular(g); if (!L.length) return null;
    let sonId = ''; try { sonId = V39.ilr().son[g] || ''; } catch (x) {}
    try { const r = ls('dk-son54'); if (!sonId && r && r.s && r.s[g]) sonId = r.s[g]; } catch (x) {}
    const son = L.find((x) => x.t.id === sonId);
    if (son && V39.tst(son.t).k !== 'tamam') return {t: son.t, u: son.u, tur: 'devam'};
    const bas = sonId ? L.findIndex((x) => x.t.id === sonId) : -1;
    const sira = L.slice(bas + 1).concat(L.slice(0, bas + 1));
    const s = sira.find((x) => V39.tst(x.t).k !== 'tamam');
    return s ? {t: s.t, u: s.u, tur: V39.tst(s.t).k === 'bekle' && !sonId ? 'basla' : 'sonraki'} : {t: null, tur: 'bitti'};
  };
  A.bugun = function () {
    let cal = {gun: {}, hedef: 20}; try { cal = V45.Calis.oku(); } catch (x) {}
    const hedef = +cal.hedef || 20, n = (cal.gun || {})[tarih(new Date())] || 0;
    return {n, hedef, asti: n > hedef, fazla: Math.max(0, n - hedef), kalan: Math.max(0, hedef - n), tamam: n >= hedef};
  };
  A.halka = function (b, cls) {
    const y = Math.min(100, Math.round(100 * b.n / b.hedef));
    return `<span class="${cls || 'ah55-hl'} ${b.tamam ? 'tm' : ''}" style="--y:${y}" role="img" aria-label="Günlük hedef: ${b.n} / ${b.hedef} cevap${b.asti ? ', hedef ' + b.fazla + ' cevap aşıldı' : ''}"><b>${b.n}</b><small>/${b.hedef}</small></span>`;
  };

  /* ---------- 1. Altın ana sayfa ---------- */
  const AH = V55.AltinAna = {};
  AH.html = function () {
    const s = A.sinif(), b = A.bugun(), x = s ? A.sonraki(s) : null;
    let ust, alt, dugme, js;
    if (!s) { ust = 'Başlamak için'; alt = 'Sınıfını seç'; dugme = 'Sınıf seç'; js = 'V53.Hesap.sinifAc(true)'; }
    else if (x && x.t) { ust = x.tur === 'devam' ? 'Kaldığın yerden devam et' : x.tur === 'basla' ? `${s}. sınıf · ilk konu` : `${s}. sınıf · sıradaki konu`; alt = x.t.title; dugme = x.tur === 'devam' ? 'Devam et' : 'Başla'; js = `go('pders',{pt:'${e(x.t.id)}',ptab:''})`; }
    else if (x && x.tur === 'bitti') { ust = `${s}. sınıf`; alt = 'Bütün konuları tamamladın'; dugme = 'Tekrar planı'; js = "go('acalis53')"; }
    else { ust = `${s}. sınıf`; alt = 'Sınıf merkezine gir'; dugme = 'Aç'; js = `go('psinif',{pg:${s}})`; }
    const hz = (ik, ad, alt2, f) => `<button type="button" class="ah55-k" onclick="${f}"><span class="ah55-ki">${SV(IK[ik], 22)}</span><b>${ad}</b><small>${alt2}</small></button>`;
    const kf = (ik, ad, alt2, f) => `<button type="button" class="ah55-r" onclick="${f}"><span class="ah55-ki">${SV(IK[ik], 20)}</span><span><b>${ad}</b><small>${alt2}</small></span>${SV(IK.ok, 18)}</button>`;
    return `<section class="ah55" aria-label="Altın ana sayfa">
<article class="ah55-hero"><div class="ah55-ht"><small>${e(ust)}</small><b>${e(alt)}</b>${x && x.u ? `<span>${e(x.u.title)}</span>` : ''}<button type="button" class="ah55-dv" onclick="${js}">${e(dugme)} ${SV(IK.ok, 18)}</button></div>
<button type="button" class="ah55-hd" onclick="go('acalis53')" aria-label="Günlük hedef ayrıntıları">${A.halka(b)}<small>${b.asti ? `Hedef aşıldı · +${b.fazla}` : b.tamam ? 'Hedef tamam' : 'Günlük hedef'}</small></button></article>
<nav class="ah55-hz" aria-label="Kısa yollar">${hz('kitap', 'Derslerim', s ? s + '. sınıf' : '4–12. sınıflar', s ? `go('psinif',{pg:${s}})` : "go('pdunya')")}${hz('oyun', 'Oyun Dünyası', 'Oyunlar ve görevler', "go('poyun')")}${hz('masa', 'Çalışma Masam', 'Planın ve eksiklerin', "go('acalis53')")}</nav>
<section class="ah55-kf" aria-labelledby="ah55-kf"><h2 id="ah55-kf">Keşif</h2><div class="ah55-kl">
${kf('sure', 'Sureler ve Dualar', 'Oku, dinle', "go('sd')")}${kf('kavram', 'Kavramlar', 'Sözlük', "go('kavram')")}${kf('kisi', 'Kişiler ve Eserler', 'Şahsiyetler, mekânlar', "go('kisi')")}${kf('bag', 'Bağlantılar', 'Kavram haritası', "go('links',{lk:{tab:'harita'}})")}${s ? kf('arac', 'Öğrenme araçları', s + '. sınıf: özet, kart, test', "V47.Tasarim.git('arac')") : ''}</div></section>
${O.acik() ? `<p class="ah55-ed" role="note">Editör önizlemesi · Altın öğrencilere açık değil <button type="button" onclick="V53.Onizleme.bitir()">Önizlemeden çık</button></p>` : ''}</section>`;
  };
  AH.yerlestir = function () {
    if (view !== 'pdunya' || !altin() || $.querySelector('.ah55')) return;
    $.querySelectorAll('.ah54, .c48-masa').forEach((x) => x.remove());
    const s47 = $.querySelector('.s47');
    if (s47) { s47.classList.add('s47-gizli55'); s47.insertAdjacentHTML('afterend', AH.html()); } else $.insertAdjacentHTML('beforeend', AH.html());
  };
  V54.AltinAna.yerlestir = AH.yerlestir;   // V54 çizim sarmalayıcısı bunu çağırır

  /* ---------- 2. sınıf merkezi ---------- */
  const SN = V55.Sinif = {};
  SN.acik = () => { try { return sessionStorage.getItem('dk-ak55p') || ''; } catch (x) { return ''; } };
  SN.cevir = function (b) {
    const k = b.closest('.sn55-u'); if (!k) return; const ac = !k.classList.contains('ac');
    if (ac) $.querySelectorAll('.sn55-u.ac').forEach((x) => { if (x !== k) SN.ayarla(x, false); });
    SN.ayarla(k, ac);
    try { ac ? sessionStorage.setItem('dk-ak55p', k.dataset.u) : sessionStorage.removeItem('dk-ak55p'); } catch (x) {}
  };
  SN.ayarla = (k, ac) => { k.classList.toggle('ac', ac); const b = k.querySelector('.sn55-ub'), g = k.querySelector('.sn55-g'); if (b) b.setAttribute('aria-expanded', String(ac)); if (g) { g.toggleAttribute('inert', !ac); g.setAttribute('aria-hidden', String(!ac)); } };
  SN.duzenle = function () {
    if (view !== 'psinif' || !altin() || $.querySelector('.sn55')) return;
    const kok = $.querySelector('.p39-pg'); if (!kok) return;
    const g = +G.pg || 4, py = V39.pv(g), S = V39.gstat(g, py), x = A.sonraki(g), acik = SN.acik();
    const hero = kok.querySelector('.p39-hero'), prg = kok.querySelector('.p39-prg'), kitap = hero && hero.querySelector('.p39-mut');
    // ileri bilgiler “Daha fazla” altına
    const ek = document.createElement('details'); ek.className = 'p39-card sn55-ek';
    ek.innerHTML = `<summary>Daha fazla: araçlar, kazanımlar ve sınıf bilgileri</summary><div class="sn55-eki"></div>`;
    const eki = ek.querySelector('.sn55-eki');
    const ar = kok.querySelector('details.d46a'); if (ar) { ar.open = false; eki.appendChild(ar); }
    const two = kok.querySelector('.p39-two'); const kz = two && two.querySelector('section.p39-card'); if (kz) eki.appendChild(kz);
    const bil = document.createElement('section'); bil.className = 'p39-card sn55-bil';
    bil.innerHTML = `<h2>Sınıf bilgileri</h2><p class="p39-mut">${S.U.length} ünite · ${S.T.length} konu · ${S.O.length} kazanım</p>`;
    if (prg) { const l = document.createElement('p'); l.className = 'p39-mut'; l.textContent = 'Öğretim programı'; bil.appendChild(l); bil.appendChild(prg); }
    if (kitap) bil.appendChild(kitap);
    eki.appendChild(bil);
    if (two) two.remove();
    kok.querySelectorAll('.p39-sts, .p39-h2, .p39-ug, section.g46h').forEach((y) => y.remove());
    // başlangıç kartı
    const yuzde = S.T.length ? Math.round(100 * S.tam / S.T.length) : 0;
    const bas = x && x.t ? `<button type="button" class="sn55-dv" onclick="go('pders',{pt:'${e(x.t.id)}',ptab:''})"><small>${x.tur === 'devam' ? 'Kaldığın yerden devam et' : x.tur === 'basla' ? 'Buradan başla' : 'Sıradaki konu'}</small><b>${e(x.t.title)}</b><span>${e(x.u.order + '. ünite · ' + x.u.title)}</span><em>${x.tur === 'devam' ? 'Devam et' : 'Başla'} ${SV(IK.ok, 18)}</em></button>`
      : x && x.tur === 'bitti' ? `<button type="button" class="sn55-dv" onclick="go('acalis53')"><small>Tebrikler</small><b>Bu sınıfın bütün konularını tamamladın</b><em>Tekrar planı ${SV(IK.ok, 18)}</em></button>` : '<p class="p39-mut">Bu sınıf ve program için konu verisi bulunmuyor.</p>';
    const ust = `<section class="sn55" aria-label="Nereden başlamalıyım?"><h2 class="sn55-h">Nereden başlamalıyım?</h2>${bas}
<div class="sn55-il"><span><b>${S.tam}</b> / ${S.T.length} konu tamamlandı</span><span class="p39-bar sm" aria-hidden="true"><i style="width:${yuzde}%"></i></span></div></section>`;
    const uni = `<section class="sn55-us" aria-labelledby="sn55-uh"><h2 class="p39-h2" id="sn55-uh">Üniteler</h2>${S.U.length ? S.U.map((u) => {
      const T = V39.tops(u.id), st = T.map(V39.tst), tm = st.filter((y) => y.k === 'tamam').length, ac = acik === u.id, gid = 'sn55-g-' + u.id.replace(/[^\w-]/g, '');
      const ana = T.filter((t) => !t.parentId);
      const satir = (t, alt) => { const d = V39.tst(t); return `<li class="${alt ? 'alt' : ''}"><button type="button" onclick="go('pders',{pt:'${e(t.id)}',ptab:''})"><i class="sn55-d ${d.k}" aria-hidden="true">${d.k === 'tamam' ? SV(IK.tik, 12) : ''}</i><span>${e(t.title)}</span><small>${e(d.l)}</small></button></li>`; };
      return `<article class="sn55-u ${ac ? 'ac' : ''}" data-u="${e(u.id)}"><button type="button" class="sn55-ub" aria-expanded="${ac}" aria-controls="${gid}" onclick="V55.Sinif.cevir(this)"><span class="un-ic">${V39.uic(u.order, 22)}</span><span class="sn55-ut"><small>${u.order}. ünite</small><b>${e(u.title)}</b><span>${T.length} konu · ${tm}/${T.length} tamamlandı</span><span class="p39-bar sm" aria-hidden="true"><i style="width:${T.length ? Math.round(100 * tm / T.length) : 0}%"></i></span></span>${SV('<path d="m6 9 6 6 6-6"/>', 20).replace('<svg', '<svg class="sn55-c"')}</button>
<div class="sn55-g" id="${gid}" ${ac ? '' : 'inert aria-hidden="true"'}><div class="sn55-gi"><ol class="sn55-tl">${ana.map((t) => satir(t, false) + T.filter((s) => s.parentId === t.id).map((s) => satir(s, true)).join('')).join('')}</ol><button type="button" class="sn55-ua" onclick="go('punite',{pg:${g},pu:'${e(u.id)}'})">Ünite sayfası: özet ve kazanımlar ${SV(IK.ok, 16)}</button></div></div></article>`;
    }).join('') : '<p class="p39-empty">Bu sınıf ve program için ünite verisi bulunmuyor.</p>'}</section>`;
    if (hero) hero.insertAdjacentHTML('afterend', ust); else kok.insertAdjacentHTML('beforeend', ust);
    const sn = kok.querySelector('.sn55'), ban = kok.querySelector('.d45-banner');
    if (ban) sn.after(ban);
    (ban || sn).insertAdjacentHTML('afterend', uni);
    kok.querySelector('.sn55-us').after(ek);
  };

  /* ---------- 3. Çalışma Masam ---------- */
  const MS = V55.Masa = {};
  // V53 CM.veri sınıf süzgeci yalnız 2026 kimliklerini (DKAB-<s>-) tanıyordu; 2018 kimlikleri (DKAB18-<s>-) dışarıda kalıyordu.
  const yz = (d, y) => (d + y ? Math.round(100 * d / (d + y)) : null);
  CM.veri = function () {
    const ov = (typeof Store !== 'undefined' && Store.ov) || {}, prog = ov.prog || {}, s = CM.sinif();
    const sinifta = (id) => !s || new RegExp('^DKAB(?:18)?-' + s + '-').test(id);
    const konuOf = {}; try { Store.all('topics').forEach((t) => (t.outcomeIds || []).forEach((o) => { if (!konuOf[o]) konuOf[o] = t; })); } catch (x) {}
    try { Store.all('questions').forEach((q) => (q.outcomeIds || []).forEach((o) => { if (!konuOf[o]) { const t = Store.get('topics', q.topicId); if (t) konuOf[o] = t; } })); } catch (x) {}
    const konular = {}, uniteler = {};
    Object.entries(prog).forEach(([oid, p]) => {
      if (!p || !sinifta(oid)) return; const d = +p.correct || 0, y = +p.wrong || 0; if (!(d + y)) return;
      const t = konuOf[oid]; if (t) { const k = konular[t.id] || (konular[t.id] = {t, d: 0, y: 0}); k.d += d; k.y += y; }
      const u = (oid.match(/^(DKAB(?:18)?-\d+-U\d+)/) || [])[1]; if (u) { const x = uniteler[u] || (uniteler[u] = {id: u, d: 0, y: 0}); x.d += d; x.y += y; }
    });
    const zayif = Object.values(konular).filter((k) => k.y > 0).map((k) => Object.assign(k, {o: yz(k.d, k.y)})).sort((a, b) => a.o - b.o || b.y - a.y);
    const unite = Object.values(uniteler).map((u) => Object.assign(u, {o: yz(u.d, u.y), ad: ((Store.get('units', u.id) || {}).title || u.id)})).sort((a, b) => a.id.localeCompare(b.id, 'tr', {numeric: true}));
    const yanlis = Object.keys(ov.wrong || {}).filter((q) => { const x = Store.get('questions', q); return x && (!s || +x.grade === s); });
    const simdi = Date.now(); let tekrar = 0, kart = 0;
    Object.entries(ov.cards || {}).forEach(([id, c]) => { const f = Store.get('flashcards', id); if (!f || (s && +f.grade !== s)) return; kart++; const due = c && (c.due || c.next); if ((due && new Date(due).getTime() <= simdi) || (!due && (+c.box || 0) < 3)) tekrar++; });
    let cal = {gun: {}, hedef: 20}; try { cal = V45.Calis.oku(); } catch (x) {}
    const gunler = []; for (let i = 6; i >= 0; i--) { const d = new Date(simdi - i * 864e5); gunler.push({k: tarih(d), n: (cal.gun || {})[tarih(d)] || 0, ad: d.toLocaleDateString('tr-TR', {weekday: 'short'})}); }
    return {s, zayif, unite, yanlis, tekrar, kart, cal, gunler, hafta: gunler.reduce((a, g) => a + g.n, 0)};
  };
  MS.veri = function () {
    const V = CM.veri(), s = V.s, mt = (Store.ov && Store.ov.mt) || {}, simdi = Date.now();
    const tamam = Object.entries(mt).map(([id, r]) => ({t: Store.get('topics', id), r})).filter((y) => y.t && (!s || +y.t.grade === s) && y.r && y.r.n && y.r.ok / y.r.n >= 0.7).sort((a, b) => String(b.r.at || '').localeCompare(String(a.r.at || '')));
    let son = []; try { const z = V39.ilr().z || {}; son = Object.entries(z).map(([id, t]) => ({t: Store.get('topics', id), at: typeof t === 'number' ? t : (t && t.t) || 0})).filter((y) => y.t && (!s || +y.t.grade === s)).sort((a, b) => b.at - a.at).slice(0, 5); } catch (x) {}
    const haftalar = [3, 2, 1, 0].map((hf) => { let n = 0; for (let i = 0; i < 7; i++) n += (V.cal.gun || {})[tarih(new Date(simdi - (hf * 7 + i) * 864e5))] || 0; return n; });
    const testler = ((Store.ov && Store.ov.tests) || []).slice(0, 5);
    const zayif = V.zayif.filter((k) => k.o < 70);
    return Object.assign(V, {tamam, son, haftalar, testler, zayif70: zayif, b: A.bugun(), sir: s ? A.sonraki(s) : null});
  };
  MS.oneri = function (V) {
    if (V.zayif70[0]) { const k = V.zayif70[0]; return {ad: `${k.t.title} konusunu tekrar et`, neden: `Bu konudaki cevaplarında başarın %${k.o} (${k.d} doğru, ${k.y} yanlış).`, dugme: 'Konuyu tekrar et', js: `go('pders',{pt:'${e(k.t.id)}',ptab:''})`}; }
    if (V.yanlis.length) return {ad: `${V.yanlis.length} yanlış soruyu yeniden çöz`, neden: 'Yanlış yaptığın sorular tekrar bekliyor.', dugme: 'Yanlışlarımı çöz', js: "go('yanlis')"};
    if (V.tekrar) return {ad: `${V.tekrar} bilgi kartını tekrar et`, neden: 'Tekrar zamanı gelen kartların var.', dugme: 'Kartlara git', js: "go('pek')"};
    if (V.sir && V.sir.t) return {ad: V.sir.tur === 'devam' ? `${V.sir.t.title} konusuna devam et` : `Yeni konu: ${V.sir.t.title}`, neden: V.sir.tur === 'devam' ? 'Kaldığın konu henüz tamamlanmadı.' : 'Eksik ya da tekrar gerektiren konu bulunmadı; sıradaki konuya geçebilirsin.', dugme: V.sir.tur === 'devam' ? 'Devam et' : 'Başla', js: `go('pders',{pt:'${e(V.sir.t.id)}',ptab:''})`};
    if (V.s) return {ad: 'Bütün konuları tamamladın', neden: 'Kendini denemek için karma bir test çözebilirsin.', dugme: 'Kendini dene', js: "go('dene')"};
    return {ad: 'Önce sınıfını seç', neden: 'Önerilerin sınıfına göre hazırlanır.', dugme: 'Sınıf seç', js: 'V53.Hesap.sinifAc(true)'};
  };
  MS.ciz = function () {
    const V = MS.veri(), b = V.b, o = MS.oneri(V), bos = (m) => `<p class="ac53-bos">${m}</p>`;
    const hHedef = b.hedef * 7, maks = Math.max(b.hedef, ...V.gunler.map((y) => y.n), 1), mx4 = Math.max(1, ...V.haftalar);
    const eylem = (ad, alt, js, n, kapali) => `<button type="button" class="ms55-e ${kapali ? 'bos' : ''}" onclick="${js}"><b>${ad}</b><small>${alt}</small>${n != null ? `<em>${n}</em>` : ''}</button>`;
    const plan = [];
    plan.push({ok: b.tamam, m: b.tamam ? `Günlük hedef tamam (${b.n}/${b.hedef})` : `Günlük hedef: ${b.kalan} cevap daha`});
    if (V.zayif70[0]) plan.push({ok: false, m: `${e(V.zayif70[0].t.title)} konusunu tekrar et`});
    plan.push({ok: !V.yanlis.length, m: V.yanlis.length ? `${V.yanlis.length} yanlış soruyu yeniden çöz` : 'Bekleyen yanlış soru yok'});
    if (V.kart) plan.push({ok: !V.tekrar, m: V.tekrar ? `${V.tekrar} kartı tekrar et` : 'Kart tekrarı güncel'});
    const hd = (b.asti ? `<p class="ms55-as"><span>${SV(IK.tik, 18)} Hedefini aştın:</span> <b>${b.n}/${b.hedef}</b> <span class="ms55-ar">+${b.fazla} cevap</span></p>` : b.tamam ? `<p class="ms55-as">${SV(IK.tik, 18)} Bugünkü hedefini tamamladın: <b>${b.n}/${b.hedef}</b></p>` : `<p>Hedefe <b>${b.kalan}</b> cevap kaldı (<b>${b.n}/${b.hedef}</b>).</p>`);
    return `<section class="ac53 ms55"><header class="ac53-b"><small>Altın · Çalışma Masam</small><h1>Çalışma Masam</h1><p>${V.s ? V.s + '. sınıf · ' : ''}Sayılar bu cihazdaki gerçek cevaplarından hesaplanır.</p></header>
<article class="ms55-bugun"><div class="ms55-bt"><h2>Bugün ne çalışmalıyım?</h2><b class="ms55-o">${e(o.ad)}</b><p>${e(o.neden)}</p><button type="button" class="ac53-d" onclick="${o.js}">${e(o.dugme)}</button></div>
<div class="ms55-hd">${A.halka(b, 'ah55-hl buyuk')}${hd}</div></article>
<div class="ms55-iki">
<article class="ac53-k"><h2>Hangi konularda eksiğim var?</h2>${V.zayif70.length ? `<ul class="ac53-l">${V.zayif70.slice(0, 3).map((k) => `<li><button type="button" onclick="go('pders',{pt:'${e(k.t.id)}',ptab:''})"><span>${e(k.t.title)}</span><b>%${k.o}</b></button><span class="ac53-bar"><i style="width:${k.o}%"></i></span></li>`).join('')}</ul>${V.zayif70.length > 3 ? `<p class="ac53-bos">+${V.zayif70.length - 3} konu daha aşağıda, “Bütün eksik konular”da.</p>` : ''}` : bos(V.zayif.length ? 'Cevap verdiğin konuların hepsinde başarın %70 ve üstü.' : 'Henüz yanlış cevap yok; eksik konu bulunamadı. Soru çözdükçe burada görünür.')}</article>
<article class="ac53-k"><h2>Şimdi hangi çalışmayı yapmalıyım?</h2><div class="ms55-eg">
${eylem('Yanlışlarımı çöz', V.yanlis.length ? 'Tekrar bekleyen sorular' : 'Bekleyen yanlış yok', "go('yanlis')", V.yanlis.length, !V.yanlis.length)}
${eylem('Tekrar kartları', V.kart ? 'Zamanı gelen kartlar' : 'Henüz kart çalışmadın', "go('pek')", V.tekrar, !V.tekrar)}
${eylem('Kendini dene', 'Karma mini test', "go('dene')", null, false)}</div></article></div>
<h2 class="ms55-b">Planın ve hedeflerin</h2>
<div class="ac53-g">
<article class="ac53-k ms55-plan"><h2>Bugünkü planın</h2><ul>${plan.map((p) => `<li class="${p.ok ? 'ok' : ''}"><i aria-hidden="true">${p.ok ? SV(IK.tik, 14) : ''}</i><span>${p.m}</span></li>`).join('')}</ul></article>
<article class="ac53-k"><h2>Hedefler</h2><div class="ac53-h"><span><b class="${b.asti ? 'ms55-asb' : ''}">${b.n}/${b.hedef}</b><small>Bugün${b.asti ? ' · +' + b.fazla : ''}</small></span><span><b class="${V.hafta > hHedef ? 'ms55-asb' : ''}">${V.hafta}/${hHedef}</b><small>Bu hafta${V.hafta > hHedef ? ' · +' + (V.hafta - hHedef) : ''}</small></span></div>
<label class="ms55-hs">Günlük hedef <select onchange="V45.Calis.hedefAyarla(this.value)" aria-label="Günlük cevap hedefi">${[10, 20, 30, 50].concat([b.hedef]).filter((n, i, L) => L.indexOf(n) === i).sort((x, y) => x - y).map((n) => `<option value="${n}" ${n === b.hedef ? 'selected' : ''}>${n} cevap</option>`).join('')}</select></label></article>
</div>
<h2 class="ms55-b">Ayrıntılı gelişim ve geçmiş</h2>
<div class="ac53-g">
<article class="ac53-k"><h2>Son 7 gün</h2>${V.hafta ? `<div class="ac53-gr" role="img" aria-label="Son 7 günde verilen cevaplar">${V.gunler.map((y) => `<span class="${y.n >= b.hedef ? 'tm' : ''}"><i style="height:${Math.round(100 * y.n / maks)}%"></i><small>${e(y.ad)}</small><em>${y.n}</em></span>`).join('')}</div>` : bos('Son 7 günde cevap kaydı yok.')}</article>
<article class="ac53-k"><h2>Son 4 hafta</h2>${V.haftalar.some((n) => n) ? `<div class="ac53-gr ah54-4" role="img" aria-label="Son 4 haftada verilen cevaplar">${V.haftalar.map((n, i) => `<span><i style="height:${Math.round(100 * n / mx4)}%"></i><small>${i === 3 ? 'Bu hafta' : (3 - i) + ' hf önce'}</small><em>${n}</em></span>`).join('')}</div>` : bos('Henüz cevap kaydı yok.')}</article>
<article class="ac53-k"><h2>Ünite gelişimi</h2>${V.unite.length ? `<ul class="ac53-l">${V.unite.map((u) => `<li><span>${e(u.ad)}</span><b>%${u.o}</b><span class="ac53-bar"><i style="width:${u.o}%"></i></span><small>${u.d} doğru · ${u.y} yanlış</small></li>`).join('')}</ul>` : bos('Henüz ünite başarısı hesaplanacak cevap yok.')}</article>
${V.zayif70.length > 3 ? `<article class="ac53-k"><h2>Bütün eksik konular</h2><ul class="ac53-l">${V.zayif70.map((k) => `<li><button type="button" onclick="go('pders',{pt:'${e(k.t.id)}',ptab:''})"><span>${e(k.t.title)}</span><b>%${k.o}</b></button></li>`).join('')}</ul></article>` : ''}
<article class="ac53-k"><h2>Tamamlanan konular</h2>${V.tamam.length ? `<p><b>${V.tamam.length}</b> konuyu mini testte %70 ve üstüyle tamamladın.</p><ul class="ac53-l">${V.tamam.slice(0, 5).map((y) => `<li><span>${e(y.t.title)}</span><b>%${Math.round(100 * y.r.ok / y.r.n)}</b></li>`).join('')}</ul>` : bos('Henüz tamamlanan konu yok. Bir konunun mini testinde %70 ve üstü yaptığında burada görünür.')}</article>
<article class="ac53-k"><h2>Son çalıştığın konular</h2>${V.son.length ? `<ul class="ac53-l">${V.son.map((y) => `<li><button type="button" onclick="go('pders',{pt:'${e(y.t.id)}',ptab:''})"><span>${e(y.t.title)}</span><b>›</b></button></li>`).join('')}</ul>` : bos('Henüz konu açmadın.')}</article>
<article class="ac53-k"><h2>Öğrenme geçmişi</h2>${V.testler.length ? `<ul class="ac53-l">${V.testler.map((t) => { const n = +t.n || (t.total || 0), d = +t.ok || +t.correct || 0; return `<li><span>${e(t.title || t.name || 'Test')}</span><b>${n ? '%' + Math.round(100 * d / n) : ''}</b><small>${e(String(t.at || t.date || '').slice(0, 10))}</small></li>`; }).join('')}</ul>` : bos('Henüz test geçmişi yok.')}</article>
</div></section>`;
  };
  CM.ciz = MS.ciz;

  /* ---------- 4. tema seçimi: örnekler üretilen paletten; seçim göstergeleri temanın renginde ---------- */
  const ORNEK = /*{{TEMA55_ORNEK}}*/null;
  const TM = V54.Tema;
  V55.Tema = {ORNEK};
  if (TM && ORNEK) {
    TM.LISTE.forEach((t) => { const o = ORNEK[t[0]]; if (o) { t[3] = [o.gece[0], o.gece[2], o.gece[1]]; t[4] = [o.gunduz[0], o.gunduz[2], o.gunduz[1]]; } });
    const ic0 = TM.icerik;
    TM.icerik = function (yer) {
      if (yer !== 'altin') return ic0.apply(this, arguments);
      const r = TM.oku(), a = r.altin || 'altin', md = TM.modu('altin');
      return `<div class="gg54" role="group" aria-label="Gündüz ya da gece"><button type="button" aria-pressed="${md === 'gunduz'}" onclick="V54.Tema.mod('altin','gunduz')">☀ Gündüz</button><button type="button" aria-pressed="${md === 'gece'}" onclick="V54.Tema.mod('altin','gece')">☾ Gece</button></div>
<div class="tm54" role="radiogroup" aria-label="Tema">${TM.LISTE.map(([k, ad, ack, g, d]) => { const c = md === 'gunduz' ? d : g; return `<button type="button" role="radio" aria-checked="${k === a}" class="tm54-k tm55-k ${k === a ? 'on' : ''}" onclick="V54.Tema.sec('altin','${k}')"><span class="tm55-o" style="background:${c[0]}"><i style="background:${c[2] || c[0]}"></i><b style="background:${c[1]}"></b></span><span><b>${ad}</b><small>${ack}</small></span>${k === a ? `<span class="tm55-s">${SV(IK.tik, 18)}</span>` : ''}</button>`; }).join('')}</div>`;
    };
  }

  /* ---------- 5. rehber seçicileri (V51.7 kuralı: yeni ekran → R.BOLUM) ---------- */
  try {
    const R = V51.Rehber;
    if (R && R.BOLUM) {
      R.BOLUM['altin.derslerim'] = {ad: 'Sınıf merkezi', adim: [{s: ['#app .sn55-dv'], m: 'Nereden başlayacağını burada görürsün: kaldığın konu ya da sıradaki konu.'}, {s: ['#app .sn55-ub'], m: 'Üniteye dokununca konuları açılır; tekrar dokununca kapanır.'}, {s: ['#app .sn55-ek > summary'], m: 'Öğrenme araçları, kazanımlar ve program seçimi “Daha fazla” altında.'}]};
      R.BOLUM['altin.calis'] = {ad: 'Çalışma Masam', adim: [{s: ['#app .ms55-bugun'], m: 'Bugün ne çalışman gerektiğini ve günlük hedefini burada görürsün.'}, {s: ['#app .ms55-iki'], m: 'Eksik konuların ve hemen yapabileceğin çalışmalar.'}]};
    }
  } catch (x) {}

  /* ---------- 6. stiller ---------- */
  try {
    const st = document.createElement('style'); st.id = 'v55-altin-css';
    st.textContent = `
body[data-prem39]{--glow:0 0 0 1px color-mix(in srgb,var(--p-gold) 55%,transparent),0 2px 16px color-mix(in srgb,var(--p-gold) 26%,transparent);-webkit-tap-highlight-color:transparent;accent-color:var(--p-gold)}
body[data-prem39] :is(button,a,select,input,textarea,summary,[tabindex]):focus-visible{outline:3px solid color-mix(in srgb,var(--p-gold) 75%,transparent)!important;outline-offset:2px}
body[data-prem39] .tm54-k.on,body[data-prem39] .gg54 button[aria-pressed="true"]{border-color:var(--p-gold);box-shadow:0 0 0 2px var(--p-gold) inset;background:color-mix(in srgb,var(--p-gold) 16%,var(--p-card))}
.tm55-k{position:relative}.tm55-o{position:relative;display:block;width:58px;height:42px;flex:none;border-radius:10px;overflow:hidden;border:1px solid rgba(127,127,127,.35)}
.tm55-o i{position:absolute;left:8px;right:8px;bottom:6px;height:14px;border-radius:5px}.tm55-o b{position:absolute;right:8px;top:6px;width:12px;height:12px;border-radius:50%}
.tm55-s{margin-left:auto;display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--p-gold,var(--pri));color:var(--p-on-gold,#fff)}
.s47.s47-gizli55{display:none!important}
.ah55{display:grid;gap:14px;margin:14px max(16px,env(safe-area-inset-left)) 28px max(16px,env(safe-area-inset-right))}
.ah55-hero{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;padding:18px;border-radius:20px;border:1px solid var(--p-line);background:linear-gradient(150deg,var(--p-card2),var(--p-card));color:var(--p-ink)}
.ah55-ht{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0}.ah55-ht small{color:var(--p-gold-t,var(--p-gold));font-weight:700;font-size:.82rem;letter-spacing:.02em}
.ah55-ht b{font:600 1.16rem/1.3 Literata,Georgia,serif}.ah55-ht>span{color:var(--p-mut);font-size:.86rem}
.ah55-dv{display:inline-flex;align-items:center;gap:6px;margin-top:8px;min-height:44px;padding:8px 18px;border-radius:999px;border:0;background:var(--p-gold);color:var(--p-on-gold,#1a120a);font:inherit;font-weight:700;cursor:pointer}
.ah55-hd{display:flex;flex-direction:column;align-items:center;gap:6px;padding:4px;border:0;background:none;color:var(--p-mut);font:inherit;cursor:pointer}.ah55-hd>small{font-size:.76rem;max-width:96px;text-align:center}
.ah55-hl{position:relative;display:flex;align-items:baseline;justify-content:center;width:72px;height:72px;border-radius:50%;padding-top:22px;background:conic-gradient(var(--p-gold) calc(var(--y)*1%),color-mix(in srgb,var(--p-ink) 14%,transparent) 0)}
.ah55-hl::before{content:"";position:absolute;inset:7px;border-radius:50%;background:var(--p-card)}.ah55-hl b,.ah55-hl small{position:relative;color:var(--p-ink)}.ah55-hl b{font-size:1.2rem}.ah55-hl small{font-size:.72rem;color:var(--p-mut)}
.ah55-hl.buyuk{width:96px;height:96px;padding-top:32px}.ah55-hl.buyuk b{font-size:1.5rem}
.ah55-hl.tm{background:conic-gradient(var(--p-gold) 100%,transparent 0)}
.ah55-hz{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.ah55-k{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-height:104px;padding:12px;border-radius:16px;border:1px solid var(--p-line);background:var(--p-card);color:var(--p-ink);font:inherit;text-align:left;cursor:pointer}
.ah55-k b{font-size:.95rem;line-height:1.25}.ah55-k small{color:var(--p-mut);font-size:.76rem;line-height:1.3}
.ah55-ki{display:inline-grid;place-items:center;width:38px;height:38px;flex:none;border-radius:12px;background:color-mix(in srgb,var(--p-gold) 14%,transparent);color:var(--p-gold-t,var(--p-gold))}
.ah55-kf h2{margin:4px 2px 8px;font-size:1rem;color:var(--p-ink)}
.ah55-kl{display:grid;gap:8px}
.ah55-r{display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 12px;border-radius:14px;border:1px solid var(--p-line);background:var(--p-card);color:var(--p-ink);font:inherit;text-align:left;cursor:pointer}
.ah55-r>span:nth-child(2){flex:1;display:flex;flex-direction:column}.ah55-r small{color:var(--p-mut);font-size:.8rem}.ah55-r>svg{color:var(--p-mut)}
.ah55-ed{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin:0;padding:8px 12px;border-radius:12px;border:1px dashed var(--p-line);color:var(--p-mut);font-size:.82rem}
.ah55-ed button{min-height:36px;padding:4px 12px;border-radius:999px;border:1px solid var(--p-line);background:none;color:var(--p-ink);font:inherit;font-weight:600;cursor:pointer}
@media (min-width:720px){.ah55-kl{grid-template-columns:1fr 1fr}}
@media (max-width:359px){.ah55-hz{grid-template-columns:1fr 1fr}.ah55-hero{grid-template-columns:1fr}}
.sn55{display:grid;gap:12px;margin:0 0 16px}.sn55-h{margin:4px 0 0;font:600 1.1rem Literata,Georgia,serif;color:var(--p-ink)}
.sn55-dv{display:flex;flex-direction:column;align-items:flex-start;gap:4px;width:100%;padding:16px 18px;border-radius:18px;border:1px solid var(--p-line);background:linear-gradient(150deg,var(--p-card2),var(--p-card));color:var(--p-ink);font:inherit;text-align:left;cursor:pointer}
.sn55-dv small{color:var(--p-gold-t,var(--p-gold));font-weight:700}.sn55-dv b{font:600 1.12rem/1.3 Literata,Georgia,serif}.sn55-dv>span{color:var(--p-mut);font-size:.86rem}
.sn55-dv em{display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:8px 16px;min-height:40px;border-radius:999px;background:var(--p-gold);color:var(--p-on-gold,#1a120a);font-style:normal;font-weight:700}
.sn55-il{display:grid;gap:6px;color:var(--p-mut);font-size:.9rem}.sn55-il b{color:var(--p-ink)}
.sn55-us{display:grid;gap:10px;margin:16px 0}
.sn55-u{border-radius:18px;border:1px solid var(--p-line);background:var(--p-card);overflow:hidden}
.sn55-ub{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 14px;border:0;background:none;color:var(--p-ink);font:inherit;text-align:left;cursor:pointer}
.sn55-ub .un-ic{display:inline-grid;place-items:center;width:42px;height:42px;flex:none;border-radius:12px;border:1px solid var(--p-line);color:var(--p-gold-t,var(--p-gold))}
.sn55-ut{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.sn55-ut small{color:var(--p-gold-t,var(--p-gold));font-weight:700;font-size:.76rem;text-transform:uppercase;letter-spacing:.05em}
.sn55-ut b{font:600 1rem/1.3 Literata,Georgia,serif}.sn55-ut>span{color:var(--p-mut);font-size:.8rem}.sn55-ut .p39-bar{margin-top:4px}
.sn55-c{flex:none;color:var(--p-mut);transition:transform .28s ease}.sn55-u.ac .sn55-c{transform:rotate(180deg)}
.sn55-g{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .3s ease,opacity .3s ease}.sn55-u.ac .sn55-g{grid-template-rows:1fr;opacity:1}
.sn55-gi{min-height:0;overflow:hidden}.sn55-g[inert] .sn55-gi{visibility:hidden;transition:visibility 0s .3s}
.sn55-tl{list-style:none;margin:0;padding:0 12px 4px;display:grid;gap:4px}
.sn55-tl button{display:flex;align-items:center;gap:10px;width:100%;min-height:48px;padding:8px 10px;border-radius:12px;border:1px solid transparent;background:color-mix(in srgb,var(--p-ink) 4%,transparent);color:var(--p-ink);font:inherit;text-align:left;cursor:pointer}
.sn55-tl li.alt button{margin-left:18px;width:calc(100% - 18px);font-size:.92rem}
.sn55-tl button span{flex:1}.sn55-tl button small{color:var(--p-mut);font-size:.76rem;white-space:nowrap}
.sn55-d{display:inline-grid;place-items:center;width:20px;height:20px;flex:none;border-radius:50%;border:2px solid var(--p-line)}
.sn55-d.calis{border-color:var(--p-gold);background:color-mix(in srgb,var(--p-gold) 30%,transparent)}.sn55-d.tamam{border-color:var(--p-gold);background:var(--p-gold);color:var(--p-on-gold,#1a120a)}
.sn55-ua{display:flex;align-items:center;gap:6px;margin:6px 12px 14px;min-height:44px;padding:6px 12px;border-radius:12px;border:1px solid var(--p-line);background:none;color:var(--p-gold-t,var(--p-gold));font:inherit;font-weight:600;cursor:pointer}
.sn55-ek{margin-top:12px}.sn55-ek>summary{min-height:48px;display:flex;align-items:center;cursor:pointer;font-weight:700;color:var(--p-ink)}
.sn55-eki{display:grid;gap:12px;margin-top:12px}.sn55-bil .p39-prg{margin:6px 0}
@media (prefers-reduced-motion:reduce){.sn55-g,.sn55-c{transition:none}}
.ms55-bugun{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;margin:0 0 14px;padding:18px;border-radius:20px;border:1px solid var(--p-line,var(--line));background:linear-gradient(150deg,var(--p-card2,var(--surface)),var(--p-card,var(--surface)))}
.ms55-bt h2{margin:0 0 6px;font-size:.95rem;color:var(--p-gold-t,var(--pri))}.ms55-o{display:block;font:600 1.18rem/1.3 Literata,Georgia,serif}.ms55-bt p{margin:6px 0 10px;color:var(--p-mut,var(--mut))}
.ms55-hd{display:flex;flex-direction:column;align-items:center;gap:8px;max-width:150px;text-align:center;font-size:.85rem}.ms55-hd p{margin:0;color:var(--p-mut,var(--mut))}
.ms55-as{display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--p-gold-t,var(--pri))!important;font-weight:700}
.ms55-asb{color:var(--p-gold-t,var(--pri))}.ms55-as span{display:inline-flex;align-items:center;gap:4px}.ms55-as b{font-size:1.15rem}.ms55-ar{padding:2px 10px;border-radius:999px;background:color-mix(in srgb,var(--p-gold,var(--pri)) 22%,transparent)}
.ms55-iki{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));margin-bottom:6px}
.ms55-eg{display:grid;gap:8px}
.ms55-e{display:grid;grid-template-columns:1fr auto;align-items:center;gap:2px 10px;min-height:56px;padding:10px 14px;border-radius:14px;border:1px solid var(--p-line,var(--line));background:var(--p-card2,var(--surface2));color:var(--p-ink,var(--ink));font:inherit;text-align:left;cursor:pointer}
.ms55-e small{grid-column:1;color:var(--p-mut,var(--mut));font-size:.8rem}.ms55-e em{grid-row:1/3;grid-column:2;font-style:normal;font-weight:800;font-size:1.2rem;color:var(--p-gold-t,var(--pri))}.ms55-e.bos em{color:var(--p-mut,var(--mut))}
.ms55-b{margin:22px 2px 10px;font-size:1.02rem}
.ms55-plan ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}.ms55-plan li{display:flex;align-items:center;gap:10px}
.ms55-plan li i{display:inline-grid;place-items:center;width:22px;height:22px;flex:none;border-radius:50%;border:2px solid var(--p-line,var(--line))}
.ms55-plan li.ok i{background:var(--p-gold,var(--pri));border-color:var(--p-gold,var(--pri));color:var(--p-on-gold,#fff)}.ms55-plan li.ok span{color:var(--p-mut,var(--mut))}
.ms55-hs{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px;color:var(--p-mut,var(--mut))}.ms55-hs select{min-height:44px;border-radius:10px;padding:4px 10px;font:inherit;background:var(--p-card2,var(--surface2));color:var(--p-ink,var(--ink));border:1px solid var(--p-line,var(--line))}
.ac53-gr span.tm i{background:var(--p-gold-t,var(--pri))}
@media (max-width:420px){.ms55-bugun{grid-template-columns:1fr}.ms55-hd{flex-direction:row;max-width:none;text-align:left}.ms55-as{align-items:flex-start}}
`;
    document.head.appendChild(st);
  } catch (x) {}

  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try { if (altin()) { AH.yerlestir(); SN.duzenle(); } } catch (x) { console.warn('[V55] Altın', x); }
    return r;
  };
})();
