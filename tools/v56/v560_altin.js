/* ===================== V56.0 (3/4): Altın — premium ana sayfa ve Çalışma Masam =====================
   Yerleşim V55 ile aynı (kaldığın yer + hedef, Derslerim · Oyun Dünyası · Çalışma Masam, Keşif); görsel dil yeniden:
   • Özgün çizgi-illüstrasyon ikonlar (inline SVG, altın degrade), madalyon biçimli ikon yuvaları, katmanlı yüzeyler (iç ışık çizgisi,
     ince altın kenar, yumuşak gölge), Literata başlıklar, ölçülü giriş animasyonu (hareket azaltma tercihine uyar).
   • Çalışma Masam: “Bugün” sahnesi (masa lambası çizimi, öneri, hedef halkası), “Eksiklerim” ve “Şimdi ne yapmalıyım?” (her eylemin
     kendi ikonu ve renk tonu), plan + hedef kartı (7 günlük küçük grafik ve hedef çizgisi), “Gelişimim” sekmeli kartı (7 gün · 4 hafta ·
     Üniteler · Genel), “Geçmişim” sekmeli kartı (Tamamlanan · Son çalıştığın · Testler). Bütün sayılar V55.Masa.veri()'den (gerçek kayıt);
     veri yoksa açık “henüz yok” durumu. Günlük hedef yalnız seçili sınıfı sayar (V56.Hedef). */
(function () {
  if (!window.V55 || !V55.AltinAna || !V55.Masa || !window.V53 || !V53.Calis) return;
  const V56 = window.V56 = window.V56 || {};
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const A = V55.Altin, AH = V55.AltinAna, MS = V55.Masa, O = V53.Onizleme;
  const gid = (() => { let n = 0; return () => 'g56i' + (++n); })();
  // altın degradeli çizgi ikon (madalyon içinde)
  const DEG = (id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--p-gold2,#B8873F)"/><stop offset=".55" stop-color="var(--p-gold,#E2B765)"/><stop offset="1" stop-color="var(--p-gold-t,#EBCB8B)"/></linearGradient></defs>`;
  const IL = {
    kitap: '<path d="M6 10c5-2 10-2 18 2 8-4 13-4 18-2v26c-5-2-10-2-18 2-8-4-13-4-18-2z"/><path d="M24 12v26"/><path d="M33 9v10l3-2 3 2V9" class="d"/>',
    oyun: '<rect x="5" y="15" width="38" height="20" rx="10"/><path d="M14 22v6M11 25h6"/><circle cx="31" cy="23" r="1.6" class="d"/><circle cx="35" cy="27" r="1.6" class="d"/><path d="M24 9l1.4 2.8 3.1.5-2.2 2.2.5 3.1-2.8-1.5-2.8 1.5.5-3.1-2.2-2.2 3.1-.5z" class="d"/>',
    masa: '<path d="M6 38h36M10 38V26h28v12"/><path d="M14 26l6-14 8 4" /><path d="M26 14l5-3 2 5-5 2z" class="d"/><path d="M16 31h8" class="d"/>',
    sure: '<path d="M12 40V22a12 12 0 0 1 24 0v18z"/><path d="M8 40h32"/><path d="M27 18a5 5 0 1 1-4.5-5 4 4 0 1 0 4.5 5z" class="d"/>',
    kavram: '<path d="M24 7a11 11 0 0 1 6 20v4H18v-4a11 11 0 0 1 6-20z"/><path d="M19 35h10M20 39h8"/><path d="M24 14v6l3 2" class="d"/>',
    kisi: '<circle cx="24" cy="16" r="7"/><path d="M10 40c2-8 7-12 14-12s12 4 14 12"/><path d="M33 30l6-2v10l-6 2z" class="d"/>',
    bag: '<circle cx="12" cy="24" r="5"/><circle cx="36" cy="12" r="5"/><circle cx="36" cy="36" r="5"/><path d="M16.5 21.5l15-7M16.5 26.5l15 7" class="d"/>',
    arac: '<path d="M10 8h20l8 8v24H10z"/><path d="M30 8v8h8"/><path d="M16 22h16M16 28h16M16 34h10" class="d"/>',
    lamba: '<path d="M8 42h32"/><path d="M14 42l4-12 12-10"/><path d="M28 14l10-4 2 9-10 3z"/><path d="M33 23l-3 6" class="d"/><path d="M22 36h12v6H22z" class="d"/>',
    hedef: '<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="2.5" class="d"/><path d="M24 24l12-12M33 12h3v3" class="d"/>',
    eksik: '<path d="M24 6l16 6v12c0 9-7 15-16 18-9-3-16-9-16-18V12z"/><path d="M24 16v10" class="d"/><circle cx="24" cy="31" r="1.6" class="d"/>',
    yanlis: '<rect x="8" y="8" width="32" height="32" rx="8"/><path d="M17 17l14 14M31 17L17 31" class="d"/>',
    kart: '<rect x="12" y="10" width="26" height="30" rx="5"/><path d="M8 15v24a4 4 0 0 0 4 4h20"/><path d="M18 20h14M18 26h10" class="d"/>',
    test: '<path d="M14 6h20v36H14z"/><path d="M19 14l2 2 4-4M19 24l2 2 4-4M19 34l2 2 4-4" class="d"/><path d="M28 15h3M28 25h3M28 35h3"/>',
    grafik: '<path d="M8 40h32"/><rect x="12" y="24" width="5" height="16" rx="1.5"/><rect x="22" y="16" width="5" height="24" rx="1.5" class="d"/><rect x="32" y="10" width="5" height="30" rx="1.5"/>',
    gecmis: '<circle cx="24" cy="24" r="16"/><path d="M24 14v10l7 4" class="d"/><path d="M8 24H4M24 4v4"/>',
    plan: '<rect x="10" y="8" width="28" height="34" rx="5"/><path d="M17 18l2 2 4-4M17 28l2 2 4-4" class="d"/><path d="M27 19h5M27 29h5"/>',
    ok: '<path d="M18 12l12 12-12 12"/>', tik: '<path d="M12 25l8 8 16-18"/>'
  };
  const ik = (k, s, cls) => { const id = gid(); return `<svg class="ik56 ${cls || ''}" width="${s || 28}" height="${s || 28}" viewBox="0 0 48 48" fill="none" stroke="url(#${id})" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${DEG(id)}${IL[k] || ''}</svg>`; };
  const ok = (s) => `<svg width="${s || 16}" height="${s || 16}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IL.ok}</svg>`;
  const tik = (s) => `<svg width="${s || 14}" height="${s || 14}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IL.tik}</svg>`;
  V56.ik = ik;
  // hedef halkası (SVG, altın degrade, aşılınca tam halka + rozet)
  const halka = (b, boy) => {
    const r = 42, c = 2 * Math.PI * r, y = Math.min(1, b.n / (b.hedef || 1)), id = gid();
    return `<span class="hl56 ${b.tamam ? 'tm' : ''}" style="--hl:${boy || 96}px" role="img" aria-label="Günlük hedef: ${b.n} / ${b.hedef} cevap${b.asti ? ', ' + b.fazla + ' fazla' : ''}"><svg viewBox="0 0 100 100" aria-hidden="true">${DEG(id)}<circle cx="50" cy="50" r="${r}" class="hl56-z"/><circle cx="50" cy="50" r="${r}" class="hl56-d" stroke="url(#${id})" stroke-dasharray="${(c * y).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 50 50)"/></svg><span class="hl56-i"><b>${b.n}</b><small>/${b.hedef}</small></span>${b.asti ? `<em class="hl56-r">+${b.fazla}</em>` : ''}</span>`;
  };
  V56.halka = halka;

  /* ---------- 1. Altın ana sayfa ---------- */
  AH.html = function () {
    const s = A.sinif(), b = A.bugun(), x = s ? A.sonraki(s) : null;
    let ust, alt, dugme, js;
    if (!s) { ust = 'Başlamak için'; alt = 'Sınıfını seç'; dugme = 'Sınıf seç'; js = 'V53.Hesap.sinifAc(true)'; }
    else if (x && x.t) { ust = x.tur === 'devam' ? 'Kaldığın yerden devam et' : x.tur === 'basla' ? `${s}. sınıf · ilk konu` : `${s}. sınıf · sıradaki konu`; alt = x.t.title; dugme = x.tur === 'devam' ? 'Devam et' : 'Başla'; js = `go('pders',{pt:'${e(x.t.id)}',ptab:''})`; }
    else if (x && x.tur === 'bitti') { ust = `${s}. sınıf`; alt = 'Bütün konuları tamamladın'; dugme = 'Tekrar planı'; js = "go('acalis53')"; }
    else { ust = `${s}. sınıf`; alt = 'Sınıf merkezine gir'; dugme = 'Aç'; js = `go('psinif',{pg:${s}})`; }
    const uad = x && x.u ? (window.V55 && V55.Dunya && V55.Dunya.adBicim ? V55.Dunya.adBicim(x.u.title) : x.u.title) : '';
    const kisa = (k, ad, a2, f, i) => `<button type="button" class="ah56-k" style="--i:${i}" onclick="${f}"><span class="md56">${ik(k, 30)}</span><b>${ad}</b><small>${a2}</small></button>`;
    const kesif = (k, ad, a2, f, i) => `<button type="button" class="ah56-r" style="--i:${i}" onclick="${f}"><span class="md56 kc">${ik(k, 24)}</span><span class="ah56-rt"><b>${ad}</b><small>${a2}</small></span><span class="ah56-ro">${ok(16)}</span></button>`;
    return `<section class="ah55 ah56" aria-label="Altın ana sayfa">
<article class="ah56-hero"><span class="ah56-hz" aria-hidden="true"><svg viewBox="0 0 120 120"><path d="M20 120V58a40 40 0 0 1 80 0v62" /><path d="M34 120V62a26 26 0 0 1 52 0v58"/><path d="M60 14v-8M54 10h12"/></svg></span>
<div class="ah56-ht"><small class="ah56-ey">${e(ust)}</small><b class="ah56-tt">${e(alt)}</b>${uad ? `<span class="ah56-un">${e(uad)}</span>` : ''}<button type="button" class="ah56-dv" onclick="${js}">${e(dugme)} ${ok(16)}</button></div>
<button type="button" class="ah56-hd" onclick="go('acalis53')" aria-label="Günlük hedef ayrıntıları">${halka(b, 88)}<small>${s ? s + '. sınıf hedefi' : 'Günlük hedef'}</small></button></article>
<nav class="ah56-hz2" aria-label="Kısa yollar">${kisa('kitap', 'Derslerim', s ? s + '. sınıf' : '4–12. sınıflar', s ? `go('psinif',{pg:${s}})` : "go('pdunya')", 1)}${kisa('oyun', 'Oyun Dünyası', 'Oyunlar ve görevler', "go('poyun')", 2)}${kisa('masa', 'Çalışma Masam', 'Planın, eksiklerin', "go('acalis53')", 3)}</nav>
<section class="ah56-kf" aria-labelledby="ah56-kf"><h2 id="ah56-kf"><span>Keşif</span></h2><div class="ah56-kl">
${kesif('sure', 'Sureler ve Dualar', 'Oku, dinle', "go('sd')", 1)}${kesif('kavram', 'Kavramlar', 'Sözlük', "go('kavram')", 2)}${kesif('kisi', 'Kişiler ve Eserler', 'Şahsiyetler, mekânlar', "go('kisi')", 3)}${kesif('bag', 'Bağlantılar', 'Kavram haritası', "go('links',{lk:{tab:'harita'}})", 4)}${s ? kesif('arac', 'Öğrenme araçları', s + '. sınıf: özet, kart, test', "V47.Tasarim.git('arac')", 5) : ''}</div></section>
${O.acik() ? `<p class="ah55-ed" role="note">Editör önizlemesi · Altın öğrencilere açık değil <button type="button" onclick="V53.Onizleme.bitir()">Önizlemeden çık</button></p>` : ''}</section>`;
  };

  /* ---------- 2. Çalışma Masam ---------- */
  MS.sekme = function (b) {
    const k = b.closest('.ms56-tb'); if (!k) return;
    k.querySelectorAll('[role="tab"]').forEach((x) => { const on = x === b; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
    k.querySelectorAll('[role="tabpanel"]').forEach((p) => { p.hidden = p.id !== b.getAttribute('aria-controls'); });
  };
  const sekmeli = (ad, ikon, L) => { const id = gid(); return `<article class="ms56-c ms56-tb"><header class="ms56-ch"><span class="md56 sm">${ik(ikon, 22)}</span><h2>${ad}</h2></header><div class="ms56-tl" role="tablist" aria-label="${ad}">${L.map(([t], i) => `<button type="button" role="tab" id="${id}-t${i}" aria-controls="${id}-p${i}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}" onclick="V55.Masa.sekme(this)">${t}</button>`).join('')}</div>${L.map(([, h], i) => `<div role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}" ${i ? 'hidden' : ''}>${h}</div>`).join('')}</article>`; };
  const bos = (m) => `<p class="ms56-bos">${m}</p>`;
  const cubuk = (L, hedef, gun) => { const mx = Math.max(hedef || 1, ...L.map((x) => x.n), 1); return `<div class="ms56-gr ${gun ? 'g7' : 'g4'}" role="img" aria-label="${L.map((x) => x.ad + ' ' + x.n).join(', ')}">${hedef ? `<i class="ms56-hc" style="bottom:calc(${Math.round(100 * hedef / mx)}% * .78 + 22px)"><em>hedef ${hedef}</em></i>` : ''}${L.map((x) => `<span class="${x.bugun ? 'bg' : ''} ${hedef && x.n >= hedef ? 'tm' : ''}"><em>${x.n}</em><i style="height:${Math.max(2, Math.round(78 * x.n / mx))}%"></i><small>${e(x.ad)}</small></span>`).join('')}</div>`; };
  MS.ciz = function () {
    const V = MS.veri(), b = V.b, o = MS.oneri(V), s = V.s, g = (window.V56 && V56.Hedef) ? V56.Hedef.genel() : null;
    const hHedef = b.hedef * 7;
    const eylem = (cls, ikon, ad, alt, js, n) => `<button type="button" class="ms56-e ${cls} ${n === 0 ? 'bos' : ''}" onclick="${js}"><span class="md56 sm">${ik(ikon, 24)}</span><span class="ms56-et"><b>${ad}</b><small>${alt}</small></span>${n != null ? `<em>${n}</em>` : `<span class="ms56-eo">${ok(16)}</span>`}</button>`;
    const plan = [];
    plan.push({ok: b.tamam, m: b.tamam ? `Günlük hedef tamam (${b.n}/${b.hedef})` : `Günlük hedef: ${b.kalan} cevap daha`});
    if (V.zayif70[0]) plan.push({ok: false, m: `${e(V.zayif70[0].t.title)} konusunu tekrar et`});
    plan.push({ok: !V.yanlis.length, m: V.yanlis.length ? `${V.yanlis.length} yanlış soruyu yeniden çöz` : 'Bekleyen yanlış soru yok'});
    if (V.kart) plan.push({ok: !V.tekrar, m: V.tekrar ? `${V.tekrar} kartı tekrar et` : 'Kart tekrarı güncel'});
    const gun7 = V.gunler.map((x, i) => ({ad: x.ad, n: x.n, bugun: i === 6}));
    const hf4 = V.haftalar.map((n, i) => ({ad: i === 3 ? 'Bu hafta' : (3 - i) + ' hf önce', n, bugun: i === 3}));
    const hedefMetin = b.asti ? `<p class="ms56-as"><span class="ms56-rz">${tik(14)} Hedefini aştın</span><b>${b.n}/${b.hedef}</b><span class="ms56-ar">+${b.fazla} cevap</span></p>` : b.tamam ? `<p class="ms56-as"><span class="ms56-rz">${tik(14)} Hedef tamam</span><b>${b.n}/${b.hedef}</b></p>` : `<p class="ms56-hk">Hedefe <b>${b.kalan}</b> cevap kaldı</p>`;
    const eksik = V.zayif70.length ? `<ul class="ms56-ek">${V.zayif70.slice(0, 3).map((k) => `<li><button type="button" onclick="go('pders',{pt:'${e(k.t.id)}',ptab:''})"><span class="ms56-ekt">${e(k.t.title)}</span><span class="ms56-ekb" aria-hidden="true"><i style="width:${k.o}%"></i></span><b>%${k.o}</b></button></li>`).join('')}</ul>${V.zayif70.length > 3 ? `<p class="ms56-bos">+${V.zayif70.length - 3} konu daha “Gelişimim › Üniteler”de.</p>` : ''}` : bos(V.zayif.length ? 'Cevap verdiğin konuların hepsinde başarın %70 ve üstü.' : 'Henüz yanlış cevap yok; eksik konu bulunamadı. Soru çözdükçe burada görünür.');
    const genelH = g ? `<div class="ms56-gn"><div><b>${g.bugun}</b><span>bugün (bütün sınıflar)</span></div><div><b>${g.hafta}</b><span>son 7 gün</span></div><div><b>${g.oran == null ? '—' : '%' + g.oran}</b><span>genel başarı</span></div></div><p class="ms56-bos">${g.bugun ? `Bugün: ${e(V56.Hedef.dagilimMetni(g))}. ` : ''}${s ? `Günlük hedefin yalnız ${s}. sınıf cevaplarını sayar; başka sınıflarda çözdüklerin burada görünür.` : ''}</p>` : bos('Kaynakta veri bulunmuyor.');
    return `<section class="ac53 ms55 ms56"><header class="ms56-bas"><small>Altın · Çalışma Masam</small><h1>Çalışma Masam</h1><p>${s ? s + '. sınıf · ' : ''}Sayılar bu cihazdaki gerçek cevaplarından hesaplanır.</p></header>
<article class="ms55-bugun ms56-bugun"><span class="ms56-il" aria-hidden="true">${ik('lamba', 112, 'buyuk')}</span><div class="ms55-bt ms56-bt"><h2>Bugün ne çalışmalıyım?</h2><b class="ms55-o">${e(o.ad)}</b><p>${e(o.neden)}</p><button type="button" class="ac53-d ms56-cta" onclick="${o.js}">${e(o.dugme)} ${ok(16)}</button></div>
<div class="ms55-hd ms56-hd">${halka(b, 104)}<small class="ms56-hs">${s ? s + '. sınıf hedefi' : 'Günlük hedef'}</small>${hedefMetin}</div></article>
<div class="ms55-iki ms56-iki">
<article class="ms56-c ms56-eks"><header class="ms56-ch"><span class="md56 sm">${ik('eksik', 22)}</span><h2>Hangi konularda eksiğim var?</h2></header>${eksik}</article>
<article class="ms56-c ms56-sim"><header class="ms56-ch"><span class="md56 sm">${ik('hedef', 22)}</span><h2>Şimdi hangi çalışmayı yapmalıyım?</h2></header><div class="ms55-eg ms56-eg">
${eylem('yn', 'yanlis', 'Yanlışlarımı çöz', V.yanlis.length ? 'Tekrar bekleyen sorular' : 'Bekleyen yanlış yok', "go('yanlis')", V.yanlis.length)}
${eylem('kr', 'kart', 'Tekrar kartları', V.kart ? 'Zamanı gelen kartlar' : 'Henüz kart çalışmadın', "go('pek')", V.tekrar)}
${eylem('ts', 'test', 'Kendini dene', 'Karma mini test', "go('dene')", null)}</div></article></div>
<h2 class="ms55-b ms56-b">Planın ve hedeflerin</h2>
<div class="ms56-ph">
<article class="ms56-c ms55-plan ms56-plan"><header class="ms56-ch"><span class="md56 sm">${ik('plan', 22)}</span><h2>Bugünkü planın</h2><small>${plan.filter((p) => p.ok).length}/${plan.length}</small></header><ul>${plan.map((p) => `<li class="${p.ok ? 'ok' : ''}"><i aria-hidden="true">${p.ok ? tik(12) : ''}</i><span>${p.m}</span></li>`).join('')}</ul></article>
<article class="ms56-c ms56-hdf"><header class="ms56-ch"><span class="md56 sm">${ik('hedef', 22)}</span><h2>Hedefler</h2></header><div class="ac53-h ms56-h2"><span><b class="${b.asti ? 'ms55-asb' : ''}">${b.n}/${b.hedef}</b><small>Bugün${b.asti ? ' · +' + b.fazla : ''}</small></span><span><b class="${V.hafta > hHedef ? 'ms55-asb' : ''}">${V.hafta}/${hHedef}</b><small>Bu hafta${V.hafta > hHedef ? ' · +' + (V.hafta - hHedef) : ''}</small></span></div>
${V.hafta ? cubuk(gun7, b.hedef, true) : bos('Son 7 günde bu sınıfta cevap yok.')}
<label class="ms55-hs ms56-hs2">Günlük hedef <select onchange="V45.Calis.hedefAyarla(this.value)" aria-label="Günlük cevap hedefi">${[10, 20, 30, 50].concat([b.hedef]).filter((n, i, L) => L.indexOf(n) === i).sort((p, q) => p - q).map((n) => `<option value="${n}" ${n === b.hedef ? 'selected' : ''}>${n} cevap</option>`).join('')}</select></label></article></div>
<h2 class="ms55-b ms56-b">Gelişimim ve geçmişim</h2>
<div class="ms56-ph">
${sekmeli('Gelişimim', 'grafik', [
    ['4 hafta', V.haftalar.some((n) => n) ? cubuk(hf4, 0, false) : bos('Henüz cevap kaydı yok.')],
    ['Üniteler', V.unite.length ? `<ul class="ms56-un">${V.unite.map((u) => `<li><span>${e(window.V55 && V55.Dunya && V55.Dunya.adBicim ? V55.Dunya.adBicim(u.ad) : u.ad)}</span><b>%${u.o}</b><span class="ms56-ekb" aria-hidden="true"><i style="width:${u.o}%"></i></span><small>${u.d} doğru · ${u.y} yanlış</small></li>`).join('')}</ul>` : bos('Henüz ünite başarısı hesaplanacak cevap yok.')],
    ['Genel', genelH]])}
${sekmeli('Geçmişim', 'gecmis', [
    ['Tamamlanan', V.tamam.length ? `<p class="ms56-ozet"><b>${V.tamam.length}</b> konuyu mini testte %70 ve üstüyle tamamladın.</p><ul class="ms56-ls">${V.tamam.slice(0, 6).map((y) => `<li><span>${e(y.t.title)}</span><b>%${Math.round(100 * y.r.ok / y.r.n)}</b></li>`).join('')}</ul>` : bos('Henüz tamamlanan konu yok. Bir konunun mini testinde %70 ve üstü yaptığında burada görünür.')],
    ['Son çalıştığın', V.son.length ? `<ul class="ms56-ls">${V.son.map((y) => `<li><button type="button" onclick="go('pders',{pt:'${e(y.t.id)}',ptab:''})"><span>${e(y.t.title)}</span>${ok(14)}</button></li>`).join('')}</ul>` : bos('Henüz konu açmadın.')],
    ['Testler', V.testler.length ? `<ul class="ms56-ls">${V.testler.map((t) => { const n = +t.n || (t.total || 0), d = +t.ok || +t.correct || 0; return `<li><span>${e(t.title || t.name || 'Test')}<small>${e(String(t.at || t.date || '').slice(0, 10))}</small></span><b>${n ? '%' + Math.round(100 * d / n) : ''}</b></li>`; }).join('')}</ul>` : bos('Henüz test geçmişi yok.')]])}
</div></section>`;
  };
  V53.Calis.ciz = MS.ciz;

  /* ---------- 3. stiller (renkler --p-*: ortak temaya uyar) ---------- */
  try {
    const st = document.createElement('style'); st.id = 'v56-altin-css';
    st.textContent = `
body[data-prem39]{--a56-sh:0 1px 0 color-mix(in srgb,#fff 6%,transparent) inset,0 10px 28px -12px rgba(0,0,0,.45),0 2px 6px -2px rgba(0,0,0,.25);--a56-kn:color-mix(in srgb,var(--p-gold) 28%,var(--p-line))}
html[data-pt43="gunduz"] body[data-prem39]{--a56-sh:0 1px 0 #fff inset,0 12px 26px -14px rgba(20,30,60,.28),0 2px 6px -3px rgba(20,30,60,.16)}
html[data-pt43] body[data-prem39] .pr49-ust.al{color:#F0F3FA!important;background:radial-gradient(90% 120% at 100% 0%,rgba(226,183,101,.28),transparent 60%),linear-gradient(140deg,#19243A,#0B1020 65%)!important;border:1px solid rgba(226,183,101,.35)}
.ik56{display:block;flex:none}.ik56 .d{stroke-width:2.8}
.md56{position:relative;display:inline-grid;place-items:center;width:54px;height:54px;flex:none;border-radius:16px;background:radial-gradient(120% 120% at 30% 20%,color-mix(in srgb,var(--p-gold) 22%,var(--p-card2)),var(--p-card) 70%);border:1px solid var(--a56-kn);box-shadow:0 1px 0 color-mix(in srgb,#fff 10%,transparent) inset,0 6px 14px -8px rgba(0,0,0,.5)}
.md56.sm{width:42px;height:42px;border-radius:13px}.md56.kc{width:44px;height:44px;border-radius:14px}
@keyframes a56g{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.ah56>*,.ms56>*{animation:a56g .45s cubic-bezier(.2,.7,.2,1) both}.ah56>*:nth-child(2),.ms56>*:nth-child(2){animation-delay:.05s}.ah56>*:nth-child(3),.ms56>*:nth-child(3){animation-delay:.1s}.ah56>*:nth-child(4),.ms56>*:nth-child(4){animation-delay:.14s}
@media (prefers-reduced-motion:reduce){.ah56>*,.ms56>*{animation:none}.hl56-d{transition:none}}
.ah56{gap:16px}
.ah56-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:20px 18px;border-radius:24px;border:1px solid var(--a56-kn);background:linear-gradient(160deg,color-mix(in srgb,var(--p-gold) 9%,var(--p-card2)),var(--p-card) 62%);box-shadow:var(--a56-sh);color:var(--p-ink)}
.ah56-hero::before{content:"";position:absolute;left:18px;right:18px;top:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--p-gold) 70%,transparent),transparent)}
.ah56-hz{position:absolute;right:-18px;bottom:-26px;width:150px;height:150px;opacity:.13;pointer-events:none}.ah56-hz svg{width:100%;height:100%;fill:none;stroke:var(--p-gold);stroke-width:2}
.ah56-ht{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:5px;min-width:0}
.ah56-ey{font-size:.74rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--p-gold-t,var(--p-gold))}
.ah56-tt{font:600 1.22rem/1.28 Literata,Georgia,serif;letter-spacing:-.005em}
.ah56-un{color:var(--p-mut);font-size:.84rem}
.ah56-dv{display:inline-flex;align-items:center;gap:6px;margin-top:10px;min-height:46px;padding:8px 20px;border-radius:999px;border:0;background:linear-gradient(180deg,color-mix(in srgb,var(--p-gold) 88%,#fff),var(--p-gold));color:var(--p-on-gold,#1a120a);font:inherit;font-weight:700;cursor:pointer;box-shadow:0 1px 0 color-mix(in srgb,#fff 40%,transparent) inset,0 6px 16px -6px color-mix(in srgb,var(--p-gold) 70%,transparent);transition:transform .18s ease,box-shadow .18s ease}
.ah56-dv:active,.ah56-k:active,.ah56-r:active,.ms56-e:active{transform:translateY(1px) scale(.99)}
.ah56-hd{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;border:0;background:none;color:var(--p-mut);font:inherit;cursor:pointer;padding:0}.ah56-hd>small{font-size:.74rem;text-align:center;max-width:100px}
.hl56{position:relative;display:inline-grid;place-items:center;width:var(--hl);height:var(--hl)}.hl56 svg{position:absolute;inset:0;width:100%;height:100%}
.hl56-z{fill:none;stroke:color-mix(in srgb,var(--p-ink) 12%,transparent);stroke-width:8}.hl56-d{fill:none;stroke-width:8;stroke-linecap:round;transition:stroke-dasharray .8s cubic-bezier(.2,.7,.2,1)}
.hl56-i{position:relative;display:flex;align-items:baseline;gap:1px;color:var(--p-ink)}.hl56-i b{font-size:calc(var(--hl)*.24);font-weight:800}.hl56-i small{font-size:.74rem;color:var(--p-mut)}
.hl56-r{position:absolute;right:-6px;top:-4px;padding:2px 8px;border-radius:999px;background:var(--p-gold);color:var(--p-on-gold,#1a120a);font-style:normal;font-weight:800;font-size:.72rem;box-shadow:0 3px 8px -3px rgba(0,0,0,.4)}
.ah56-hz2{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.ah56-k{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-height:132px;padding:14px 12px;border-radius:20px;border:1px solid var(--p-line);background:linear-gradient(180deg,var(--p-card2),var(--p-card));color:var(--p-ink);font:inherit;text-align:left;cursor:pointer;box-shadow:var(--a56-sh);transition:transform .2s ease,border-color .2s ease}
.ah56-k::after{content:"";position:absolute;left:12px;right:12px;bottom:0;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--p-gold) 55%,transparent),transparent);opacity:.7}
.ah56-k b{margin-top:4px;font:600 .98rem/1.2 Literata,Georgia,serif}.ah56-k small{color:var(--p-mut);font-size:.76rem;line-height:1.3}
.ah56-kf h2{display:flex;align-items:center;gap:10px;margin:6px 2px 10px;font:600 1.05rem Literata,Georgia,serif;color:var(--p-ink)}
.ah56-kf h2::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--a56-kn),transparent)}
.ah56-kl{display:grid;gap:8px}
.ah56-r{display:flex;align-items:center;gap:12px;min-height:64px;padding:10px 12px;border-radius:18px;border:1px solid var(--p-line);background:var(--p-card);color:var(--p-ink);font:inherit;text-align:left;cursor:pointer;transition:transform .2s ease,border-color .2s ease}
.ah56-rt{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}.ah56-rt b{font-weight:650}.ah56-rt small{color:var(--p-mut);font-size:.8rem}
.ah56-ro{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:color-mix(in srgb,var(--p-gold) 12%,transparent);color:var(--p-gold-t,var(--p-gold))}
@media (hover:hover){.ah56-k:hover,.ah56-r:hover,.ms56-e:hover{transform:translateY(-2px);border-color:var(--a56-kn)}}
@media (min-width:720px){.ah56-kl{grid-template-columns:1fr 1fr}}
@media (max-width:359px){.ah56-hz2{grid-template-columns:1fr 1fr}.ah56-hero{grid-template-columns:1fr}}
.ms56{padding-bottom:28px}
.ms56-bas small{color:var(--p-gold-t,var(--p-gold));font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:.74rem}.ms56-bas h1{margin:4px 0 2px;font:600 1.7rem Literata,Georgia,serif}.ms56-bas p{margin:0 0 14px;color:var(--p-mut)}
.ms56-bugun{position:relative;overflow:hidden;grid-template-columns:1fr auto;border-radius:24px!important;border:1px solid var(--a56-kn)!important;background:linear-gradient(160deg,color-mix(in srgb,var(--p-gold) 10%,var(--p-card2)),var(--p-card) 65%)!important;box-shadow:var(--a56-sh)}
.ms56-bugun::before{content:"";position:absolute;left:20px;right:20px;top:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--p-gold) 70%,transparent),transparent)}
.ms56-il{position:absolute;left:-14px;bottom:-18px;opacity:.12;pointer-events:none}
.ms56-bt{position:relative}.ms56-bt h2{font-size:.74rem!important;letter-spacing:.08em;text-transform:uppercase}.ms56-bt .ms55-o{font-size:1.25rem}
.ms56-cta{display:inline-flex!important;align-items:center;gap:6px;border-radius:999px!important;padding:8px 20px!important;box-shadow:0 6px 16px -6px color-mix(in srgb,var(--p-gold) 70%,transparent)}
.ms56-hd{position:relative;max-width:160px!important}.ms56-hs{color:var(--p-mut);font-size:.76rem}.ms56-hk{margin:0;color:var(--p-mut);font-size:.84rem}.ms56-hk b{color:var(--p-ink)}
.ms56-as{display:flex;flex-direction:column;align-items:center;gap:4px;margin:0}.ms56-as b{font-size:1.1rem;color:var(--p-ink)}
.ms56-rz{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;background:var(--p-gold);color:var(--p-on-gold,#1a120a);font-weight:800;font-size:.76rem}
.ms56-ar{color:var(--p-gold-t,var(--p-gold));font-weight:800;font-size:.86rem}
.ms56-c{position:relative;padding:16px;border-radius:20px;border:1px solid var(--p-line);background:var(--p-card);box-shadow:var(--a56-sh)}
.ms56-ch{display:flex;align-items:center;gap:12px;margin:0 0 12px}.ms56-ch h2{flex:1;margin:0;font:600 1.02rem/1.25 Literata,Georgia,serif}.ms56-ch small{color:var(--p-mut);font-weight:700}
.ms56-eks{--a56-t:#C2604F}.ms56-sim{--a56-t:var(--p-gold)}
.ms56-eks::before,.ms56-sim::before,.ms56-plan::before,.ms56-hdf::before{content:"";position:absolute;left:0;top:18px;bottom:18px;width:3px;border-radius:0 3px 3px 0;background:var(--a56-t,var(--p-gold))}
.ms56-plan{--a56-t:var(--p-gold)}.ms56-hdf{--a56-t:var(--p-gold2,var(--p-gold))}
.ms56-ek{list-style:none;margin:0;padding:0;display:grid;gap:8px}.ms56-ek button{display:grid;grid-template-columns:1fr auto;gap:6px 12px;align-items:center;width:100%;padding:10px 12px;border-radius:14px;border:1px solid var(--p-line);background:color-mix(in srgb,#C2604F 6%,var(--p-card2));color:var(--p-ink);font:inherit;text-align:left;cursor:pointer}
.ms56-ekt{font-weight:600}.ms56-ek b{color:var(--p-ink)}.ms56-ekb{grid-column:1/-1;display:block;height:6px;border-radius:99px;background:color-mix(in srgb,var(--p-ink) 10%,transparent);overflow:hidden}.ms56-ekb i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#C2604F,var(--p-gold))}
.ms56-eg{gap:10px!important}
.ms56-e{display:flex!important;align-items:center;gap:12px;min-height:64px;padding:10px 12px!important;border-radius:16px!important;transition:transform .2s ease,border-color .2s ease}
.ms56-e.yn{background:color-mix(in srgb,#C08A2A 8%,var(--p-card2))!important}.ms56-e.kr{background:color-mix(in srgb,#3F8F86 9%,var(--p-card2))!important}.ms56-e.ts{background:color-mix(in srgb,#5B6FB8 9%,var(--p-card2))!important}
.ms56-et{flex:1;display:flex;flex-direction:column;text-align:left}.ms56-e{text-align:left;color:var(--p-ink)}.ms56-e em{min-width:36px;padding:4px 10px;border-radius:999px;background:var(--p-gold);color:var(--p-on-gold,#1a120a);font-style:normal;font-weight:800;text-align:center}.ms56-e.bos em{background:color-mix(in srgb,var(--p-ink) 10%,transparent);color:var(--p-mut)}
.ms56-eo{color:var(--p-gold-t,var(--p-gold))}
.ms56-b{display:flex;align-items:center;gap:10px;font:600 1.08rem Literata,Georgia,serif!important}.ms56-b::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--a56-kn),transparent)}
.ms56-ph{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))}
.ms56-plan ul{gap:10px!important}.ms56-plan li{padding:8px 10px;border-radius:12px;background:color-mix(in srgb,var(--p-ink) 4%,transparent)}
.ms56-h2{margin-bottom:6px!important}.ms56-h2 b{font-size:1.35rem!important}
.ms56-gr{position:relative;display:grid;gap:6px;height:150px;align-items:end;margin:8px 0 4px;padding-top:18px}.ms56-gr.g7{grid-template-columns:repeat(7,1fr)}.ms56-gr.g4{grid-template-columns:repeat(4,1fr)}
.ms56-gr>span{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:3px;min-width:0}
.ms56-gr>span i{display:block;width:62%;min-height:2px;border-radius:7px 7px 3px 3px;background:linear-gradient(180deg,color-mix(in srgb,var(--p-gold) 55%,var(--p-card2)),color-mix(in srgb,var(--p-gold) 30%,var(--p-card2)))}
.ms56-gr>span.tm i{background:linear-gradient(180deg,var(--p-gold),var(--p-gold2,var(--p-gold)))}.ms56-gr>span.bg i{box-shadow:0 0 0 2px var(--p-gold)}
.ms56-gr em{font-style:normal;font-size:.72rem;font-weight:700;color:var(--p-ink)}.ms56-gr small{font-size:.7rem;color:var(--p-mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.ms56-hc{position:absolute;left:0;right:0;height:0;border-top:1.5px dashed color-mix(in srgb,var(--p-gold) 70%,transparent);pointer-events:none}.ms56-hc em{position:absolute;right:0;top:-16px;font-size:.66rem;color:var(--p-gold-t,var(--p-gold));font-weight:700}
.ms56-hs2{margin-top:10px}
.ms56-tl{display:flex;gap:6px;margin:0 0 12px;padding:4px;border-radius:999px;background:color-mix(in srgb,var(--p-ink) 6%,transparent);overflow-x:auto}
.ms56-tl button{flex:1;min-height:38px;padding:4px 12px;border-radius:999px;border:0;background:none;color:var(--p-mut);font:inherit;font-weight:650;white-space:nowrap;cursor:pointer}
.ms56-tl button[aria-selected="true"]{background:var(--p-card2);color:var(--p-ink);box-shadow:0 0 0 1px var(--a56-kn) inset,0 2px 6px -2px rgba(0,0,0,.3)}
.ms56-un,.ms56-ls{list-style:none;margin:0;padding:0;display:grid;gap:10px}.ms56-un li{display:grid;grid-template-columns:1fr auto;gap:4px 10px}.ms56-un small{grid-column:1/-1;color:var(--p-mut);font-size:.78rem}
.ms56-ls li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:12px;background:color-mix(in srgb,var(--p-ink) 4%,transparent)}.ms56-ls li span small{display:block;color:var(--p-mut);font-size:.74rem}
.ms56-ls button{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;border:0;background:none;color:var(--p-ink);font:inherit;text-align:left;cursor:pointer;min-height:36px;padding:0}
.ms56-gn{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ms56-gn div{display:flex;flex-direction:column;gap:2px;padding:10px;border-radius:12px;background:color-mix(in srgb,var(--p-ink) 5%,transparent)}.ms56-gn b{font-size:1.2rem}.ms56-gn span{color:var(--p-mut);font-size:.74rem}
.ms56-bos{margin:6px 0 0;color:var(--p-mut);font-size:.88rem;line-height:1.45}.ms56-ozet{margin:0 0 10px}
@media (max-width:420px){.ms56-bugun{grid-template-columns:1fr!important}.ms56-hd{flex-direction:row!important;max-width:none!important;flex-wrap:wrap;justify-content:flex-start;text-align:left}.ms56-as{align-items:flex-start}}
`;
    document.head.appendChild(st);
  } catch (x) {}
})();
