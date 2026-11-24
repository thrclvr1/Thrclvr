/* ===================== V51.0: öğrenme alanı ile editör veri yönetimi arasındaki erişim ayrımı =====================
   1. Öğrenme alanında (Elmas, Altın; öğrenci ve normal öğretmen) editoryal/teknik bilgi gösterilmez:
      kitap künyesi, ISBN, yayınevi, PDF adı/sayfası, kaynak kodları, basılı/PDF sayfa eşleşmeleri, kaynak doğrulama
      kayıtları, güven/doğrulama dereceleri, program sürümü karşılaştırmaları, taslak/inceleme etiketleri, editör notları,
      üretim notları ve “Taslakları göster (önizleme)” anahtarı. Konunun “Kaynaklar” sekmesi (üretim notları, künye, PDF
      sayfaları) öğrenme alanında yoktur. Başlıklar, kazanımlar ve açıklamalar korunur. HİÇBİR VERİ SİLİNMEZ:
      bilgiler veride ve editör alanında (Editör Onay Alanı, kitap/veri ekranları) aynen durur.
      Uygulama: her çizimden ve ekran içi değişiklikten sonra çalışan, kurallı bir süzgeç (V51.Yayin.suz). Editör
      oturumu açıkken (V38.edOk) süzgeç çalışmaz: editör her şeyi görür.
   2. Doğrudan erişim denetimi: öğrenme alanındaki kullanıcı editör/veri ekranlarına (admin, book) rota ile gitse bile
      erişim uyarısı görür; durum değiştiremez. (editor rotası zaten editör PIN'i ister; bildirim48 editör oturumu ister.)
   3. Yayın durumu modeli (yalnız editör değiştirir; mevcut V38 editör kayıtlarından türetilir, veri değiştirilmez):
      Taslak · İnceleme bekliyor · Onaylandı · Reddedildi · Yayında · Yayından kaldırıldı. Onaylandı ≠ Yayında.
      Geçiş dönemi kuralı (kullanıcı kararı): editör “sıkı yayın”ı açana kadar öğrenciler bugünkü içeriği görmeye devam
      eder; Reddedildi ve Yayından kaldırıldı durumundaki içerik hemen gizlenir. Sıkı yayın açılınca yalnız Yayında olan
      içerik görünür. Ayar: localStorage dk-yayin51 = {v:1, siki:false}.
   GÜVENLİK SINIRI: Bütün veri HTML dosyasının içindedir; bu ayrım bir arayüz ayrımıdır. Dosyayı açan biri veriyi
   kaynak kodda görebilir. Gerçek gizlilik ve yetki için içerik sunucudan, yetkiye göre verilmelidir. */
(function () {
  if (typeof V30 === 'undefined') return;
  const V51 = window.V51 = window.V51 || {};
  const Y = V51.Yayin = {sayac: 0};
  const edOk = () => { try { return typeof V38 !== 'undefined' && V38.edOk(); } catch (e) { return false; } };
  Y.ALAN_DISI = ['editor', 'admin', 'bildirim48', 'ogretmen'];
  Y.aktif = () => !edOk() && !Y.ALAN_DISI.includes(view);

  /* ---------- 1. yayın durumu ---------- */
  Y.KEY = 'dk-yayin51';
  Y.ayar = () => { try { const o = JSON.parse(localStorage.getItem(Y.KEY) || 'null'); if (o && o.v === 1) return o; } catch (e) {} return {v: 1, siki: false}; };
  Y.siki = () => !!Y.ayar().siki;
  Y.AD = {taslak: 'Taslak', inceleme: 'İnceleme bekliyor', onaylandi: 'Onaylandı', reddedildi: 'Reddedildi', yayinda: 'Yayında', kaldirildi: 'Yayından kaldırıldı'};
  const COLS = ['topics', 'questions', 'flashcards', 'outcomeLinks'];
  const kayit = (id) => { try { if (typeof V38 === 'undefined' || !V38.mem || !V38.mem.ed) return null; for (const c of COLS) { const it = V38.mem.ed.items[c + ':' + id]; if (it) return it; } } catch (e) {} return null; };
  Y.durum = function (r) {
    if (!r) return 'taslak';
    const it = kayit(r.id);
    if (it) {
      if (it.published) return 'yayinda';
      if (it.state === 'red') return 'reddedildi';
      if (it.state === 'onay') return it.kaldirildi51 ? 'kaldirildi' : 'onaylandi';
      return 'inceleme';
    }
    if (r.status === 'published') return 'yayinda';
    if (r.status === 'archived') return 'kaldirildi';
    if (r.status === 'review') return 'inceleme';
    return 'taslak';
  };
  // ED.unpublish: editör “Yayından kaldır” dediğinde işaret (onay geri çekme / durum değişikliği kendi durumunu taşır)
  try {
    if (typeof V38 !== 'undefined' && V38.ED && V38.ED.unpublish) {
      const ED = V38.ED, up0 = ED.unpublish;
      ED.unpublish = function (c, id, note, oto) { const r = up0.apply(this, arguments); try { const it = ED.it(c, id); if (it && !oto && it.state === 'onay') { it.kaldirildi51 = {at: V38.now(), note: note || ''}; ED.save(); } } catch (e) {} return r; };
      const pb0 = ED.publish;
      ED.publish = function (c, id) { const r = pb0.apply(this, arguments); try { const it = ED.it(c, id); if (r && it && it.kaldirildi51) { delete it.kaldirildi51; ED.save(); } } catch (e) {} return r; };
    }
  } catch (e) {}
  // görünürlük: vis() → (status published değilse) V45.yayinaUygun
  if (typeof V45 !== 'undefined' && V45.yayinaUygun) {
    const y0 = V45.yayinaUygun;
    V45.yayinaUygun = function (x) {
      const d = Y.durum(x);
      if (d === 'reddedildi' || d === 'kaldirildi') return false;
      if (Y.siki()) return d === 'yayinda';
      // geçiş dönemi: V50'de öğrenci ekranında önizleme (S.prev) varsayılan olarak açıktı ve arşivlenmemiş her kayıt
      // görünüyordu. Önizleme anahtarı artık yalnız editörde; öğrencinin gördüğü içerik değişmesin diye aynı kural:
      if (!edOk()) return !!x && x.status !== 'archived';   // editör kendi önizleme anahtarıyla V45 A/B kuralını görebilir
      return y0.apply(this, arguments);
    };
  }
  Y.sikiAyarla = function (on) {
    if (!edOk()) { UI.toast('Bu ayarı yalnız editör değiştirebilir.'); return; }
    try { localStorage.setItem(Y.KEY, JSON.stringify({v: 1, siki: !!on, t: new Date().toISOString()})); } catch (e) {}
    try { V38.logT && V38.logT('Yayın kuralı', on ? 'Sıkı yayın açıldı' : 'Geçiş dönemi (sıkı yayın kapalı)'); } catch (e) {}
    try { if (typeof IDX !== 'undefined') IDX = null; } catch (e) {}
    UI.toast(on ? 'Sıkı yayın açık: öğrenciler yalnız yayımlanmış içeriği görür.' : 'Geçiş dönemi: öğrenciler mevcut içeriği görmeye devam eder.');
    V38.edView();
  };
  Y.sayim = function () {
    const n = {}; COLS.forEach((c) => { const m = {taslak: 0, inceleme: 0, onaylandi: 0, reddedildi: 0, yayinda: 0, kaldirildi: 0}; Store.all(c).forEach((r) => { m[Y.durum(r)]++; }); n[c] = m; }); return n;
  };
  Y.html = function () {
    const n = Y.sayim(), siki = Y.siki(), AD = {topics: 'Konular', questions: 'Sorular', flashcards: 'Bilgi kartları', outcomeLinks: 'Kazanım–kitap eşleşmeleri'};
    return `${V38.edHead('Yayın durumu', 'İçerik durumları ve öğrencinin ne gördüğü', "V38.edGo({k:'',cid:'',mode:''})")}
<section class="ed38-info"><h2>Durumlar</h2><p class="small">Taslak → İnceleme bekliyor → Onaylandı → <b>Yayında</b>. Reddedildi ve Yayından kaldırıldı ayrı durumlardır. <b>Onaylanan içerik kendiliğinden yayımlanmaz</b>; Yayımla ayrı adımdır (Editör Onay Alanı › kayıt › Yayımla).</p>
<div class="og-tw"><table class="og-t yy51-t"><thead><tr><th>Kayıt</th>${Object.values(Y.AD).map((a) => `<th>${a}</th>`).join('')}</tr></thead><tbody>${COLS.map((c) => `<tr><td>${AD[c]}</td>${Object.keys(Y.AD).map((k) => `<td>${n[c][k]}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>
<section class="ed38-info"><h2>Öğrenciye gösterim kuralı</h2>
<p class="small"><b>Şu an: ${siki ? 'Sıkı yayın' : 'Geçiş dönemi'}.</b> ${siki ? 'Öğrenciler yalnız “Yayında” olan içeriği görür.' : 'Henüz yayımlanmış içerik az olduğu için öğrenciler mevcut içeriği görmeye devam eder; “Reddedildi” ve “Yayından kaldırıldı” içerik hemen gizlenir.'}</p>
<label class="yy51-s"><input type="checkbox" ${siki ? 'checked' : ''} onchange="V51.Yayin.sikiAyarla(this.checked)"> Sıkı yayın (yalnız yayımlanmış içerik öğrenciye görünür)</label>
<p class="small mut">Uyarı: Sıkı yayını açmadan önce öğrencinin göreceği içeriği yayımla; şu an ${COLS.reduce((t, c) => t + n[c].yayinda, 0)} kayıt yayında. Bu ayar bu cihazdaki tarayıcıda saklanır; merkezi yayın için sunucu gerekir.</p></section>`;
  };

  /* ---------- 2. öğrenme alanı süzgeci ---------- */
  const SIL = ['.kd45', '[data-kd45]', 'details.d46k', '.dvb', '.tag.dv', 'span[class*="dv-kaynak"]', '[onclick*="tabTo(\'kay\')"]', '[onclick*="\'kay\'"]', '.v31-rv'];
  const KART = /^(Kaynak doğrulama|Künye|Program sürümü|Doğrulama)$/;
  const METIN_SIL = [/taslak içerik: editör/i, /editör kontrolü (önerilir|gerekli)/i, /kaynak güveni/i, /^Kitap: s\.\s*\d/, /\((high|medium|low), incelemede\)/,
    /kaynaktan türetildi; otomatik kaynak denetimini/i, /^Kaynak kontrolünden geçti$/, /^Kaynak: ders kitabı · s\./, /^Kitap s\. \d+ konu aralığında/, /güvenilir bir ilişki kurulamadı; bağlantı uydurulmadı/,
    /içeriği hazır \(taslak\)/, /·\s*ISBN\s/, /^Çıktı–sayfa eşleşmesi/, /^Bölüm: .*PDF s\./, /^Olası konular \(doğrulanmadı\)/, /^Bağlantı inceleme bekliyor$/];
  const ETIKET_SIL = /^(Taslak|Program sürümü farklı|anlatım taslağı|editör doğrulaması gerekli)$/i;
  const METIN_DEGIS = [[/\s*·\s*\d+\/\d+ taslak hazır/, ''], [/^(\d+)\/\d+ konunun taslak içeriği hazır$/, '$1 konu'], [/\s*·\s*PDF s\.\s*\d+(–\d+)?/, ''],
    [/\s*·\s*tanımlar kitap ve konu anlatımından alınmıştır; tüm kayıtlar editör doğrulaması bekliyor\./, ''], [/\s*Yalnızca kaynak kontrolünden geçmiş içerikten üretilir; editör onayı bekler\./, ''],
    [/\s*\(yalnızca editörün onayladığı hiyerarşi\),?/, ''], [/alt kavram = editör onaylı dal/, 'alt kavram = onaylı dal'],
    [/^Program sürümü ve taslak görünümü$/, 'Program seçimi'], [/^Öğretmen ve editör$/, 'Öğretmen modu']];
  Y.suz = function (kok) {
    if (!Y.aktif()) return 0;
    kok = kok || document.querySelector('main') || document.body; if (!kok) return 0;
    let n = 0;
    try {
      kok.querySelectorAll(SIL.join(',')).forEach((e) => { e.remove(); n++; });
      kok.querySelectorAll('.card > b:first-child').forEach((b) => { if (KART.test(b.textContent.trim())) { const c = b.closest('.card'); if (c) { c.remove(); n++; } } });
      kok.querySelectorAll('label').forEach((l) => { if (/Taslakları göster/.test(l.textContent)) { l.remove(); n++; } });
      kok.querySelectorAll('p.note, .card.mut').forEach((p) => { if (/Ders kitabı:.*uyumlu|içeriği hazır \(taslak\)/.test(p.textContent)) { p.remove(); n++; } });
      kok.querySelectorAll('.p46-bb button').forEach((b) => { if (/^Editör alanı$/.test(b.textContent.trim())) { b.remove(); n++; } });
      kok.querySelectorAll('span.tag, small, a').forEach((e) => { const t = e.textContent.trim(); if (ETIKET_SIL.test(t) || (e.tagName === 'A' && t === 'güven')) { e.remove(); n++; } });
      // metin düğümleri: tamamı editoryal olan öğe kaldırılır; karışık metinde yalnız editoryal parça çıkarılır
      const w = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT), T = []; let x; while ((x = w.nextNode())) T.push(x);
      T.forEach((tn) => {
        const t = tn.nodeValue.trim(); if (!t || t.length > 600 || !tn.parentNode) return;
        const el = tn.parentElement;
        if (METIN_SIL.some((r) => r.test(t))) { if (el && el !== kok && el.textContent.trim().length <= t.length + 4) el.remove(); else tn.remove(); n++; return; }
        for (const [r, y] of METIN_DEGIS) if (r.test(t)) { tn.nodeValue = tn.nodeValue.replace(r, y); n++; break; }
      });
      // içi boşalan “Bu konu hakkında” ve benzeri kapsayıcılar
      kok.querySelectorAll('details.card').forEach((d) => { const s = d.querySelector('summary'); const kalan = d.textContent.replace(s ? s.textContent : '', '').trim(); if (!kalan) { d.remove(); n++; } });
    } catch (e) { console.warn('[V51] süzgeç', e); }
    Y.sayac += n; return n;
  };

  /* ---------- 3. doğrudan erişim denetimi ---------- */
  Y.KORUMALI = ['admin', 'book'];
  Y.uyari = function () {
    $.innerHTML = `<section class="card ue51" role="alert" aria-labelledby="ue51h"><h1 id="ue51h">Bu sayfa editör alanına ait</h1>
<p>Ders kitabı künyeleri, kaynak listeleri, sayfa eşleştirmeleri, doğrulama ve veri yönetimi ekranları yalnız editör yetkisiyle açılır. Öğrenme alanında bu bilgiler gösterilmez; içerikteki durumları buradan değiştiremezsin.</p>
<p class="small mut">Editörsen: Öğretmen paneli › Ana Panel › Editör girişi (ayrı editör PIN’i).</p>
<div class="row"><button class="p" onclick="go('home')">Ana sayfaya dön</button></div></section>`;
  };
  const d0 = draw;
  draw = function () {
    try {
      if (!edOk()) {
        if (Y.KORUMALI.includes(view)) { Y.engel = (Y.engel || 0) + 1; let r; try { r = d0.apply(this, arguments); } catch (e) {} Y.uyari(); return r; }
        if (typeof S !== 'undefined' && S.prev && !Y.ALAN_DISI.includes(view)) S.prev = false;   // önizleme anahtarı yalnız editörde (kural V45.yayinaUygun'da)
        if (view === 'topic' && G.tab === 'kay') G.tab = 'anlat';
        if (view === 'pders' && G.ptab === 'kay') G.ptab = '';
      }
    } catch (e) {}
    const r = d0.apply(this, arguments);
    Y.suz();
    return r;
  };
  // ekran içi değişiklikler (sekme geçişi, açılır listeler) için: çizimden bağımsız güncellemeler
  let bekle = false;
  const mo = new MutationObserver(() => { if (bekle || !Y.aktif()) return; bekle = true; requestAnimationFrame(() => { bekle = false; Y.suz(); }); });
  const bagla = () => { const m = document.querySelector('main') || document.body; if (m) mo.observe(m, {childList: true, subtree: true}); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bagla); else bagla();
})();
