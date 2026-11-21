/* ===================== V51.2: öğrenci / öğretmen içerik görünümleri ve yayın kuralı =====================
   GÖRÜNÜM BAĞLAMI (V51.Gorunum.kip): yalnız gerçek oturumdan hesaplanır, ekran parametresinden değil.
     'editor'   — editör oturumu açık (V38.edOk(), ayrı editör PIN'i)
     'ogretmen' — konu/ders ekranında G.okip==='ogretmen' VE öğretmen oturumu açık (V36.ok())
     'onizleme' — öğretmenin “Öğrenci görünümünü ön izle” seçimi (öğretmen oturumu gerekir)
     'ogrenci'  — diğer bütün durumlar. G.okip elle verilse bile öğretmen oturumu yoksa öğrenci görünümü çizilir.
   ÖĞRENCİ GÖRÜNÜMÜ (Elmas ve Altın aynı kural): üretim etiketleri (anlatım taslağı, taslak hazır, kısmi, kaynak
     bekliyor, hazırlanıyor, inceleme/editör bekliyor…) ve MEB kazanımları (kazanım kodları, açıklamaları, süreç
     bileşenleri) üretildikleri işlevlerde çıkarılır: trow (konu satırı), grade (sınıf/ünite), topic (Elmas konu),
     V39.r_punite / V39.r_pders (Altın ünite/ders). Veri katmanına dokunulmaz (kazanım–konu ilişkileri, kodlar, süreç
     bileşenleri aynen durur).
   ÖĞRETMEN GÖRÜNÜMÜ: öğretmen panelinde “İçeriği aç” → aynı konu ekranı + öğretmen çubuğu (panele dön, Öğretmen
     görünümü / Öğrenci görünümünü ön izle) + öğretmen kartı (sınıf, program, ünite, yalnız o sınıf ve programa ait MEB
     kazanımları, kodları, süreç bileşenleri, aynı kazanıma bağlı diğer konular). Öğretmenin önizlemesi öğrencinin
     “kaldığın yer” kaydını değiştirmez.
   YAYIN KURALI (kullanıcı kararı V51.2: “Kural hazır, editör açsın”):
     editörün inceleme kayıtlarına giren içerik (konu, soru, kart, kazanım–kitap eşleşmesi):
       - Reddedildi, Düzeltme bekliyor, Yayından kaldırıldı → öğrenciye HİÇBİR ZAMAN gösterilmez
       - Sıkı yayın kapalı (geçiş dönemi) → diğerleri bugünkü gibi görünür (öğrenci ekranı boş kalmaz)
       - Sıkı yayın açık → yalnız Yayında (editörün tek tek ya da toplu yayımladığı) içerik
     müfredat kayıtları (ünite, kazanım, kavram, kişi/eser…) yayın kuralına bağlı değildir; arşivlenmemişse görünür.
     (V51.0'da sıkı yayın açılınca ünite ve kazanımlar da gizleniyordu; düzeltildi.) */
(function () {
  if (typeof V30 === 'undefined') return;
  const V51 = window.V51 = window.V51 || {};
  const GV = V51.Gorunum = {};
  const edOk = () => { try { return typeof V38 !== 'undefined' && V38.edOk(); } catch (e) { return false; } };
  const ogrOk = () => { try { return V36.ok(); } catch (e) { return false; } };
  const KONU = ['topic', 'pders'];
  GV.kip = function () {
    if (edOk()) return 'editor';
    if (G.okip && ogrOk() && KONU.includes(view)) return G.okip === 'onizleme' ? 'onizleme' : 'ogretmen';
    return 'ogrenci';
  };
  GV.kazanimGizli = () => ['ogrenci', 'onizleme'].includes(GV.kip());
  GV.uretimGizli = () => GV.kip() !== 'editor';

  /* ---------- 1. kaynağında: konu satırı (Elmas) — üretim etiketi yok ---------- */
  if (typeof trow === 'function') {
    const trow0 = trow;
    trow = function (t) {
      const h = trow0.apply(this, arguments);
      if (!GV.uretimGizli()) return h;
      let s = h.replace(/<span class="tst">[\s\S]*?<\/span>/, '');
      if (t && t.reviewFlag) s = s.replace(`<small>${esc(t.reviewFlag)}</small>`, '');
      return s;
    };
  }

  /* ---------- 2. öğrenci görünümünden kazanım ve üretim bilgisini çıkaran ortak işlem ---------- */
  const URETIM = /^(anlatım taslağı|taslak hazır|taslak|kısmi|hazırlanıyor|kaynak bekl(iyor|eniyor))$|([İi]nceleme|[Ee]ditör onayı|[Ee]ditör kontrolü|[Ee]ditör doğrulaması|[Kk]aynak kontrolü)\s*(bekl|öneril|gerekli)|editör onayı değil|^taslak:/i;
  const KOD = /^(DKAB\.)?\d{1,2}\.\d{1,2}\.\d{1,2}\.?(\s*\(\d{4}\))?/;
  GV.temizle = function (kok) {
    kok = kok || document.querySelector('main') || document.body; if (!kok) return 0;
    let n = 0; const sil = (e) => { if (e && e.parentNode) { e.remove(); n++; } };
    if (GV.uretimGizli()) {
      kok.querySelectorAll('.tst').forEach(sil);
      kok.querySelectorAll('.p39-st.uy').forEach((e) => { if (/hazırlanmadı|taslak|bekl/i.test(e.textContent)) sil(e); });
      kok.querySelectorAll('.p39-dh .p39-tags span:not(:first-child)').forEach(sil);
      kok.querySelectorAll('.p39-empty').forEach((e) => { if (/henüz hazırlanmadı/.test(e.textContent)) { e.textContent = 'Bu konunun içeriği henüz yayında değil.'; n++; } });
      // kısa etiketler: üretim/inceleme durumu (anlatım taslağı, inceleme/editör onayı bekliyor, kaynak bekliyor…)
      kok.querySelectorAll('span, small, em, i, .tag, .kmps, .d43, .hk-w').forEach((e) => {
        if (!e.isConnected || e.querySelector('button, a, input, h1, h2, h3')) return; const t = e.textContent.trim(); if (!t || t.length > 120) return;
        if (URETIM.test(t)) sil(e);
      });
      kok.querySelectorAll('.p39-st.bekle').forEach((e) => { e.childNodes.forEach((x) => { if (x.nodeType === 3 && /bekliyor/.test(x.nodeValue)) { x.nodeValue = x.nodeValue.replace('bekliyor', 'başlanmadı'); n++; } }); });
    }
    if (GV.kazanimGizli()) {
      kok.querySelectorAll('details').forEach((d) => { const s = d.querySelector(':scope > summary'); if (s && /^(Kazanımlar \(MEB|Ünitenin kazanımları|Süreç bileşenleri)/.test(s.textContent.trim())) sil(d); });
      kok.querySelectorAll('.p39-kzb, .tc-kz, .c48-kz .mc').forEach(sil);
      kok.querySelectorAll('.hero .chips .tag, .p39-dh code').forEach((e) => { if (KOD.test(e.textContent.trim())) sil(e); });
      kok.querySelectorAll('div.mut, p.mut, p').forEach((e) => { const t = e.textContent.trim(); if ((KOD.test(t) && /\s[—–-]\s/.test(t) && t.length < 400) || /kazanımı için .* ders kitabı henüz sistemde yok/.test(t)) sil(e); });
      kok.querySelectorAll('.p39-sema p').forEach((p) => { if ([...p.querySelectorAll('span')].some((s) => KOD.test(s.textContent.trim()))) sil(p); });
      kok.querySelectorAll('.p39-sema').forEach((f) => { if (!f.querySelector('p')) sil(f); });
    }
    return n;
  };
  // V51.Yayin.suz her çizimden ve ekran içi değişiklikten sonra çalışır: aynı noktaya bağlan
  if (V51.Yayin && V51.Yayin.suz) {
    const suz0 = V51.Yayin.suz;
    V51.Yayin.suz = function (k) { const r = suz0.apply(this, arguments); try { if (!['editor', 'admin', 'bildirim48', 'ogretmen'].includes(view)) GV.temizle(k); } catch (e) { console.warn('[V51.2] görünüm', e); } return r; };
  }

  /* ---------- 3. kaynağında: sınıf/ünite (Elmas grade) ---------- */
  if (typeof grade === 'function') {
    const grade0 = grade;
    grade = function () { const r = grade0.apply(this, arguments); try { GV.temizle($); } catch (e) {} return r; };
  }

  /* ---------- 4. öğretmen görünümü: konu ekranı (Elmas topic) ve ders ekranı (Altın pders) ---------- */
  GV.bar = function () {
    const k = GV.kip();
    return `<div class="ogv51-bar" role="region" aria-label="Öğretmen görünümü"><button type="button" class="ogv51-geri" onclick="V51.Gorunum.panele()">${typeof ico === 'function' ? ico('back', 18) : ''} Öğretmen paneli</button>
<div class="ogv51-sec" role="group" aria-label="Görünüm"><button type="button" aria-pressed="${k === 'ogretmen'}" class="${k === 'ogretmen' ? 'on' : ''}" onclick="V51.Gorunum.kipSec('ogretmen')">Öğretmen görünümü</button><button type="button" aria-pressed="${k === 'onizleme'}" class="${k === 'onizleme' ? 'on' : ''}" onclick="V51.Gorunum.kipSec('onizleme')">Öğrenci görünümünü ön izle</button></div>
${k === 'onizleme' ? '<p class="ogv51-not">Öğrencinin gördüğü haliyle ön izliyorsun: kazanım ve süreç bileşenleri öğrenciye gösterilmez.</p>' : ''}</div>`;
  };
  const pyAd = (py) => (py === '2018' ? '2018 programı' : py === '2026' ? '2026 programı (Türkiye Yüzyılı Maarif Modeli)' : 'Program bilgisi: Kaynakta veri bulunmuyor.');
  GV.kazanimlar = function (t) {
    const ids = t.outcomeIds || [], O = ids.map((id) => Store.get('outcomes', id)).filter(Boolean);
    const uygun = O.filter((o) => +o.grade === +t.grade && o.programYear === t.programYear);   // 2018 / 2026 karışmaz
    return {uygun, disari: O.length - uygun.length, eksik: ids.length - O.length};
  };
  GV.kartHTML = function (t) {
    const u = Store.get('units', t.unitId) || {}, K = GV.kazanimlar(t);
    const bagli = (o) => (typeof OGRT !== 'undefined' && OGRT.topicsOf ? OGRT.topicsOf(o.id) : []).filter((x) => x.id !== t.id && x.programYear === t.programYear);
    return `<section class="ogv51-k" aria-labelledby="ogv51h"><h2 id="ogv51h">Öğretmen bilgisi</h2>
<dl class="ogv51-dl"><div><dt>Sınıf</dt><dd>${esc(String(t.grade))}. sınıf</dd></div><div><dt>Program</dt><dd>${esc(pyAd(t.programYear))}</dd></div><div><dt>Ünite</dt><dd>${u.title ? esc((u.order ? u.order + '. ' : '') + u.title) : 'Kaynakta veri bulunmuyor.'}</dd></div></dl>
<h3>MEB kazanımları</h3>${K.uygun.length ? K.uygun.map((o) => `<div class="ogv51-o"><p><code>${esc(o.code || o.id)}</code> ${esc(o.title || '')}</p>
<details ${K.uygun.length === 1 ? 'open' : ''}><summary>Süreç bileşenleri</summary>${(o.subProcesses || []).length ? `<ul>${o.subProcesses.map((x) => `<li>${x.key && x.key !== '•' ? `<b>${esc(x.key)})</b> ` : ''}${esc(x.text)}</li>`).join('')}</ul>` : '<p class="mut small">Programda bu kazanım için süreç bileşeni maddesi yok.</p>'}</details>
${bagli(o).length ? `<p class="small">Aynı kazanımla ilişkili konular: ${bagli(o).map((x) => `<button type="button" class="ogv51-l" onclick="V51.Gorunum.ac('${x.id}')">${esc(x.title)}</button>`).join(' · ')}</p>` : ''}</div>`).join('') : '<p class="mut">Bu konu için kazanım eşleşmesi: Kaynakta veri bulunmuyor.</p>'}
${K.disari ? `<p class="small mut">Bu konuya bağlı ${K.disari} kazanım farklı sınıf ya da programa ait olduğu için gösterilmedi (2018 ve 2026 programları karıştırılmaz).</p>` : ''}</section>`;
  };
  GV.yerlestir = function () {
    const k = GV.kip(); if (k !== 'ogretmen' && k !== 'onizleme') return;
    const t = Store.get('topics', view === 'pders' ? G.pt : G.t); if (!t || $.querySelector('.ogv51-bar')) return;
    const hero = $.querySelector('.p39-dh') || $.querySelector('.hero.topic') || $.querySelector('.hero');
    if (hero) { hero.insertAdjacentHTML('beforebegin', GV.bar()); if (k === 'ogretmen') hero.insertAdjacentHTML('afterend', GV.kartHTML(t)); }
    else $.insertAdjacentHTML('afterbegin', GV.bar() + (k === 'ogretmen' ? GV.kartHTML(t) : ''));
  };
  // öğretmenin önizlemesi öğrencinin “kaldığın yer” / ziyaret kayıtlarını değiştirmez
  const koru = (fn) => function () {
    const k = GV.kip(); if (k !== 'ogretmen' && k !== 'onizleme') return fn.apply(this, arguments);
    const last0 = Store.ov.last; let ilr0 = null; try { ilr0 = localStorage.getItem('dk-ilerleme39'); } catch (e) {}
    const r = fn.apply(this, arguments);
    try { if (Store.ov.last !== last0) { Store.ov.last = last0; Store.save(); } if (ilr0 !== null && localStorage.getItem('dk-ilerleme39') !== ilr0) localStorage.setItem('dk-ilerleme39', ilr0); } catch (e) {}
    return r;
  };
  if (typeof topic === 'function') {
    const topic0 = koru(topic);
    topic = function () { const r = topic0.apply(this, arguments); try { GV.temizle($); GV.yerlestir(); } catch (e) { console.warn('[V51.2] konu', e); } return r; };
  }
  if (typeof V39 !== 'undefined') {
    if (V39.r_pders) { const p0 = koru(V39.r_pders); V39.r_pders = function () { const r = p0.apply(this, arguments); try { GV.temizle($); GV.yerlestir(); } catch (e) { console.warn('[V51.2] ders', e); } return r; }; }
    if (V39.r_punite) { const u0 = V39.r_punite; V39.r_punite = function () { const r = u0.apply(this, arguments); try { GV.temizle($); } catch (e) {} return r; }; }
    if (V39.r_psinif) { const s0 = V39.r_psinif; V39.r_psinif = function () { const r = s0.apply(this, arguments); try { GV.temizle($); } catch (e) {} return r; }; }
  }
  // öğretmen görünümü bağlamı yalnız aynı konuda sürer; başka ekrana geçince kendiliğinden kapanır
  const go0 = go;
  go = function (v, a) {
    try {
      if (a && a.okip) { if (ogrOk()) G.okip = a.okip; else { delete G.okip; a = Object.assign({}, a); delete a.okip; arguments[1] = a; } }
      else { const ayni = (v === 'topic' && a && a.t && a.t === G.t) || (v === 'pders' && a && a.pt && a.pt === G.pt); if (!ayni) delete G.okip; }
    } catch (e) {}
    return go0.call(this, v, a);
  };
  GV.ac = function (tid) {
    if (!ogrOk()) { UI.toast('Öğretmen görünümü yalnız öğretmen modunda açılır.'); return; }
    try { if (view === 'ogretmen') GV.donus = {y: scrollY, tab: OGRT.S().tab}; } catch (e) {}
    try { UI.close(); } catch (e) {}
    go('topic', {t: tid, tab: 'anlat', okip: 'ogretmen'});
  };
  GV.kipSec = function (k) { if (!ogrOk()) { delete G.okip; draw(); return; } G.okip = k === 'onizleme' ? 'onizleme' : 'ogretmen'; draw(); scrollTo(0, 0); };
  GV.panele = function () {
    delete G.okip; const d = GV.donus || {};
    if (!ogrOk()) { go('home'); return; }
    try { if (d.tab) OGRT.S().tab = d.tab; } catch (e) {}
    go('ogretmen'); if (d.y) requestAnimationFrame(() => setTimeout(() => scrollTo(0, d.y), 60));
  };
  // öğretmen panelindeki “İçeriği aç” → öğretmen görünümü
  if (typeof OGRT !== 'undefined' && OGRT.W) {
    OGRT.W.content = function (oid) {
      const T = OGRT.topicsOf(oid); if (!T.length) return;
      if (T.length === 1) return GV.ac(T[0].id);
      UI.sheet({title: 'İçeriği aç', body: () => `<p class="small">Bu kazanım birden fazla konuyla ilişkili:</p>${T.map((t) => `<button type="button" class="og-tb ${t.sections ? 'p' : ''}" onclick="V51.Gorunum.ac('${t.id}')">${esc(t.title)}<small>${t.sections ? 'Öğretmen görünümünde aç' : 'İçerik henüz yok'}</small></button>`).join('')}`, footer: () => '<button onclick="UI.close()">Kapat</button>'});
    };
  }
  // öğretmen görünümünde mod düğmesi öğretmen modunu gösterir
  if (window.V50 && V50.Mod && V50.Mod.aktif) { const a0 = V50.Mod.aktif; V50.Mod.aktif = function () { const k = GV.kip(); return (k === 'ogretmen' || k === 'onizleme') ? 'ogretmen' : a0.apply(this, arguments); }; }

  /* ---------- 5. yayın kuralı ---------- */
  const EDC = ['topics', 'questions', 'flashcards', 'outcomeLinks'];
  const kayit = (x) => { try { if (typeof V38 === 'undefined' || !V38.mem || !V38.mem.ed) return null; for (const c of EDC) { const it = V38.mem.ed.items[c + ':' + x.id]; if (it) return it; } } catch (e) {} return null; };
  const koleksiyon = (x) => { if (x.outcomeId && x.textbookId) return 'outcomeLinks'; try { return V45.KD.colOf(x); } catch (e) { return ''; } };
  GV.ogrenciyeAcik = function (x, siki) {   // editör kontrol ekranı ve kural için tek kaynak (öğrenci kuralı)
    if (!x || x.status === 'archived') return false;
    if (!EDC.includes(koleksiyon(x))) return true;   // müfredat kayıtları
    const it = kayit(x), d = V51.Yayin ? V51.Yayin.durum(x) : '';
    if (d === 'reddedildi' || d === 'kaldirildi' || (it && it.state === 'duzeltme')) return false;
    return siki ? d === 'yayinda' : true;
  };
  if (typeof V45 !== 'undefined' && V45.yayinaUygun && V45.KD) {
    V45.yayinaUygun = function (x) {
      if (!x) return false;
      const siki = !!(V51.Yayin && V51.Yayin.siki());
      if (!edOk()) return GV.ogrenciyeAcik(x, siki);
      // editör: kendi önizleme anahtarı kapalıyken V45 A/B kuralını görür; reddedilen/kaldırılan yine gizli
      if (EDC.includes(koleksiyon(x)) && !GV.ogrenciyeAcik(x, siki)) return false;
      return V45.KD.yayinaUygun(V45.KD.colOf(x), x);
    };
  }

  /* ---------- 6. editör: sıkı yayın öncesi kontrol ekranı ---------- */
  if (V51.Yayin) {
    const Y = V51.Yayin, AD = {topics: 'Konular', questions: 'Sorular', flashcards: 'Bilgi kartları', outcomeLinks: 'Kazanım–kitap eşleşmeleri'};
    Y.kontrol = function () {
      const R = {};
      EDC.forEach((c) => { const m = {simdi: 0, siki: 0, onayli: 0, bekleyen: 0, gizli: 0, toplam: 0}; Store.all(c).forEach((x) => { if (x.status === 'archived') return; m.toplam++; const d = Y.durum(x), it = kayit(x); if (GV.ogrenciyeAcik(x, false)) m.simdi++; if (GV.ogrenciyeAcik(x, true)) m.siki++; if (d === 'onaylandi') m.onayli++; else if (d === 'reddedildi' || d === 'kaldirildi' || (it && it.state === 'duzeltme')) m.gizli++; else if (d !== 'yayinda') m.bekleyen++; }); R[c] = m; });
      const eksik = []; const G0 = [...new Set(Store.all('topics').map((t) => t.grade))].sort((a, b) => a - b);
      G0.forEach((g) => ['2018', '2026'].forEach((py) => { const T = Store.all('topics').filter((t) => t.grade === g && t.programYear === py && t.status !== 'archived'); if (!T.length) return; const s = T.filter((t) => GV.ogrenciyeAcik(t, true)).length; if (s < T.length) eksik.push({g, py, toplam: T.length, siki: s, simdi: T.filter((t) => GV.ogrenciyeAcik(t, false)).length}); }));
      return {R, eksik};
    };
    Y.html = function () {
      const siki = Y.siki(), K = Y.kontrol(), n = Y.sayim();
      return `${V38.edHead('Yayın durumu', 'İçerik durumları, öğrencinin ne gördüğü ve sıkı yayın öncesi kontrol', "V38.edGo({k:'',cid:'',mode:''})")}
<section class="ed38-info yy51"><h2>Öğrenciye gösterim kuralı</h2>
<p><b>Şu an: ${siki ? 'Sıkı yayın açık' : 'Geçiş dönemi (sıkı yayın kapalı)'}.</b> ${siki ? 'Öğrenciler yalnız editörün yayımladığı (tek tek ya da toplu) içeriği görür.' : 'Öğrenciler mevcut içeriği görmeye devam eder; öğrenci ekranı boş kalmaz.'}</p>
<ul class="small"><li>Reddedilen, düzeltme bekleyen ve yayından kaldırılan içerik öğrenciye <b>her zaman</b> gizlidir.</li><li>Onaylanan içerik kendiliğinden yayımlanmaz; sıkı yayında yalnız “Yayında” olan görünür.</li><li>Ünite, kazanım, kavram, kişi/eser gibi müfredat kayıtları bu kurala bağlı değildir; silinmez, gizlenmez.</li><li>Taslak, onay bekliyor, kaynak kontrolü gibi durumlar öğrenci ekranlarında gösterilmez.</li></ul>
<div class="og-acts">${siki ? '<button type="button" onclick="V51.Yayin.sikiOnayla(false)">Sıkı yayını kapat (geçiş dönemine dön)</button>' : '<button type="button" class="p" onclick="V51.Yayin.sikiOnayla(true)">Sıkı yayını aç…</button>'}</div></section>
<section class="ed38-info"><h2>Sıkı yayın öncesi kontrol</h2><div class="og-tw"><table class="og-t yy51-t"><thead><tr><th>Kayıt</th><th>Öğrenci şu an görüyor</th><th>Sıkı yayında görecek</th><th>Onaylı, yayımlanmamış<br><small>(toplu yayımla)</small></th><th>Onay / kaynak bekleyen</th><th>Gizli (ret, düzeltme, kaldırıldı)</th></tr></thead><tbody>
${EDC.map((c) => `<tr><td>${AD[c]}</td><td>${K.R[c].simdi}</td><td><b>${K.R[c].siki}</b></td><td>${K.R[c].onayli}</td><td>${K.R[c].bekleyen}</td><td>${K.R[c].gizli}</td></tr>`).join('')}</tbody></table></div>
<div class="og-acts"><button type="button" onclick="V38.edGo({k:'onay',cid:'',mode:''})">Onaylı içerikleri aç (toplu yayımla)</button><button type="button" onclick="V38.edGo({k:'bekleyen',cid:'',mode:''})">Onay bekleyenleri aç</button><button type="button" onclick="V38.edGo({k:'kaynak',cid:'',mode:''})">Kaynak kontrolü bekleyenler</button></div>
<h3>Sıkı yayında eksik kalacak sınıflar</h3>${K.eksik.length ? `<div class="og-tw"><table class="og-t"><thead><tr><th>Sınıf · program</th><th>Konu</th><th>Şu an görünen</th><th>Sıkı yayında</th></tr></thead><tbody>${K.eksik.map((x) => `<tr class="${x.siki ? '' : 'yy51-bos'}"><td>${x.g}. sınıf · ${x.py === '2018' ? '2018' : '2026 TYMM'}</td><td>${x.toplam}</td><td>${x.simdi}</td><td><b>${x.siki}</b>${x.siki ? '' : ' — öğrenci bu sınıfta konu göremez'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="small">Bütün sınıflarda konuların hepsi yayında.</p>'}</section>
<section class="ed38-info"><h2>Durumlar</h2><div class="og-tw"><table class="og-t yy51-t"><thead><tr><th>Kayıt</th>${Object.values(Y.AD).map((a) => `<th>${a}</th>`).join('')}</tr></thead><tbody>${EDC.map((c) => `<tr><td>${AD[c]}</td>${Object.keys(Y.AD).map((k) => `<td>${n[c][k]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
<p class="small mut">Bu ayar bu cihazdaki tarayıcıda saklanır; merkezi yayın için sunucu gerekir.</p></section>`;
    };
    Y.sikiOnayla = function (on) {
      if (!edOk()) { UI.toast('Bu ayarı yalnız editör değiştirebilir.'); return; }
      if (!on) { V38.confirm({title: 'Sıkı yayını kapat', text: 'Geçiş dönemine dönülecek: öğrenciler mevcut içeriği yeniden görür. Reddedilen, düzeltme bekleyen ve yayından kaldırılan içerik gizli kalır.', ok: 'Kapat', onOk: () => Y.sikiAyarla(false)}); return; }
      const K = Y.kontrol(), T = K.R.topics, Q = K.R.questions, F = K.R.flashcards, bos = K.eksik.filter((x) => !x.siki).length;
      V38.confirm({title: 'Sıkı yayını aç', danger: T.siki === 0,
        text: `Sıkı yayın açılınca öğrenciler yalnız yayımlanmış içeriği görür:<br>Konu <b>${T.siki}</b> (şu an ${T.simdi}) · Soru <b>${Q.siki}</b> (şu an ${Q.simdi}) · Kart <b>${F.siki}</b> (şu an ${F.simdi}).${T.onayli + Q.onayli + F.onayli ? `<br>${T.onayli + Q.onayli + F.onayli} onaylı kayıt henüz yayımlanmadı (Onay Arşivi › Seçilenleri yayımla).` : ''}${bos ? `<br><b>${bos} sınıf/programda öğrenci hiç konu göremez.</b>` : ''}${T.siki === 0 ? '<br><b>Uyarı: yayında hiç konu yok; öğrenci konu listeleri boş görünür.</b>' : ''}<br>İçerikler silinmez; sıkı yayını istediğin zaman kapatabilirsin.`,
        ok: 'Sıkı yayını aç', onOk: () => Y.sikiAyarla(true)});
    };
  }
})();
