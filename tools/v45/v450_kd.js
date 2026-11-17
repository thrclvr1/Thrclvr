/* ===================== V45.0: kaynak doğrulama sınıflandırması (editör onayı yalnızca gerekli içerikte) =====================
   Kayıtların status alanları DEĞİŞTİRİLMEZ (toplu “published” yapılmaz). Sınıf, kayıtlarda zaten bulunan doğrulama kanıtından
   her açılışta hesaplanır (V28/V31 otomatik kaynak denetimi: ders kitabının ilgili sayfa aralığıyla sözcük kökü örtüşmesi ve
   sayı kontrolü; bölüm/paragraf kodları g=geçti, y=yetersiz, e=editöre ayrıldı, k=kurgu, o=ölçme notu).
     A  kaynakla doğrulandı      — anlatım paragrafı kitap sayfasıyla eşleşti; risk işareti yok; kavram/kişi kaydı kitap sayfasıyla
     B  kaynaktan türetildi      — özet, kodlama, tablo, karışanlar, sınav notu, hikâyeleştirme, soru, kart, oyun; kaynak denetimini geçti
     C  editör kontrolü gerekli  — kaynakta yeterince bulunamadı / önceki denetimde editöre ayrıldı (ayet, hüküm) / kitapta geçmeyen
                                   ayet künyesi / hadis kaynağı adı / mezhep hükmü / doğrulama kaydı yok
   A ve B için editör onayı ZORUNLU DEĞİLDİR; C editör kuyruğunda kalır. Not: denetim anlam doğrulaması değildir; ders kitabı PDF'leri
   bu ortamda bulunmadığından yeniden anlam karşılaştırması yapılamadı (rapor V45.0). */
window.V45 = window.V45 || {};
(function () {
  const HADIS = /Buh[âa]r[îi]|\bM[üu]slim\b|Tirmiz[îi]|Eb[ûu] D[âa]v[ûu]d|[İI]bn M[âa]ce|Nes[âa][îi]|Muvatta|M[üu]sned/i;
  // mezhep hükmü: fıkıh mezhebi adı ya da “mezhep” sözcüğü bir hüküm sözcüğüyle birlikte (tanım olarak geçen “mezhep” değil)
  const MEZHEP_AD = /Hanef[îi]|Ş[âa]fi[îi]|M[âa]lik[îi]|Hanbel[îi]|Cafer[îi]/i, MEZHEP = /mezhep|mezheb/i, HUKUM = /\bfarz|v[âa]cip|s[üu]nnet|m[üu]stehap|mekruh|haram|helal|hüküm|hükm|caiz|bozar|bozmaz|şart[ıi]/i;
  const mezhepHukmu = (s) => MEZHEP_AD.test(s) || (MEZHEP.test(s) && HUKUM.test(s));
  // ayet künyesi: “Enbiyâ suresi 22. ayet”, “(Bakara, 255)”, “(Bakara suresi, 2/255)”
  const KUNYE = /(?:([A-ZÂÎÛÇŞĞÖÜİ][a-zâîûçşğöüı’'\-]+)\s+suresi(?:nin|nde|nin)?\s+(\d{1,3})\.\s*ayet|\(([A-ZÂÎÛÇŞĞÖÜİ][a-zâîûçşğöüı’'\-]+)(?:\s+suresi)?,\s*(?:\d{1,3}\s*\/\s*)?(\d{1,3})\))/g;
  const kat = (t) => String(t || '').toLocaleLowerCase('tr-TR').replace(/[âàá]/g, 'a').replace(/[îì]/g, 'i').replace(/[ûù]/g, 'u').replace(/[^a-zçşğöüı0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const metin = (x) => typeof x === 'string' ? x : JSON.stringify(x || '');
  const kunyeler = (s) => { const L = []; let m; KUNYE.lastIndex = 0; while ((m = KUNYE.exec(s))) L.push({sure: kat(m[1] || m[3]), no: m[2] || m[4]}); return L; };
  const kitapKunye = (t) => (t && t.sourceAnalysis && t.sourceAnalysis.verseRefs || []).map((v) => { const m = /^(.+?)\s+(\d{1,3})/.exec(String(v)); return m ? {sure: kat(m[1]), no: m[2]} : null; }).filter(Boolean);
  // metindeki her künye kitapta geçen künyelerden biri mi?
  const kunyeSorunu = (s, t) => { const L = kunyeler(s); if (!L.length) return false; const K = kitapKunye(t); return L.some((k) => !K.some((x) => x.no === k.no && (x.sure.startsWith(k.sure.slice(0, 4)) || k.sure.startsWith(x.sure.slice(0, 4))))); };
  const risk = (s, t) => HADIS.test(s) ? 'hadis' : mezhepHukmu(s) ? 'mezhep' : kunyeSorunu(s, t) ? 'kunye' : '';
  const NEDEN = {'kaynak-eksik': 'Kaynakta (ders kitabının ilgili sayfalarında) yeterince bulunamadı', 'editor': 'Ayet, hadis ya da dinî hüküm içeriyor; önceki denetimde editöre ayrıldı', 'kunye': 'Ders kitabında geçmeyen bir ayet künyesi içeriyor', 'hadis': 'Hadis kaynağı adı geçiyor; künye kontrolü gerekir', 'mezhep': 'Mezheplere göre farklılık gösterebilen hüküm içeriyor', 'kaynaksiz': 'Doğrulama kaydı yok', 'duzeltme': 'Önceki denetimde düzeltme gerekli bulundu', 'icerik-yok': 'Konunun içeriği hazırlanmamış'};
  const AD = {A: 'Kaynakla doğrulandı', B: 'Kaynaktan türetildi', C: 'Editör kontrolü gerekli'};
  V45.KD = {NEDEN, AD};
  const sayfa = (t) => (t && t.dogrulama && t.dogrulama.kaynak) || '';
  // konu bölümü / paragrafı
  V45.KD.blok = function (t, sec, i) {
    const b = t && t.dogrulama && t.dogrulama.bolumler && t.dogrulama.bolumler[sec]; const c = b ? b.charAt(i) : '';
    const S = t && t.sections && t.sections[sec], x = Array.isArray(S) ? S[i] : S, s = metin(x);
    if (c === 'y') return {kat: 'C', alt: 'kaynak-eksik'};
    if (c === 'e') return {kat: 'C', alt: 'editor'};
    if (c === 'd') return {kat: 'C', alt: 'duzeltme'};
    if (c === 'k') return {kat: 'B', alt: 'kurgu'};
    if (c !== 'g' && c !== 'o') return {kat: 'C', alt: 'kaynaksiz'};
    const r = risk(s, t); if (r) return {kat: 'C', alt: r};
    return {kat: sec === 'anlatim' && c === 'g' ? 'A' : 'B', alt: sec === 'anlatim' ? 'dogrulandi' : c === 'o' ? 'olcme' : 'turetilmis'};
  };
  V45.KD.konu = function (t) {
    if (!t) return null; if (t._kd45) return t._kd45;
    const r = {kat: 'C', alt: 'icerik-yok', A: 0, B: 0, C: 0, neden: {}, sayfa: sayfa(t), bloklar: 0};
    const b = t.sections && t.dogrulama && t.dogrulama.bolumler;
    if (t.sections && b) {
      Object.entries(b).forEach(([sec, kod]) => { for (let i = 0; i < kod.length; i++) { const k = V45.KD.blok(t, sec, i); r[k.kat]++; r.bloklar++; if (k.kat === 'C') r.neden[k.alt] = (r.neden[k.alt] || 0) + 1; } });
      r.kat = r.A + r.B === 0 ? 'C' : r.C ? 'AB+C' : (r.A ? 'A' : 'B'); r.alt = r.C ? 'kismi' : 'dogrulandi';
    } else if (t.sections) { r.kat = 'C'; r.alt = 'kaynaksiz'; }
    Object.defineProperty(t, '_kd45', {value: r, enumerable: false, configurable: true}); return r;
  };
  // soru, kart, oyun, kavram, kişi
  V45.KD.kayit = function (col, x) {
    if (!x) return null; if (x._kd45) return x._kd45;
    let r;
    if (col === 'concepts' || col === 'entities') {
      const sf = (x.pageRefs && x.pageRefs.length) || x.page; r = sf && x.confidence !== 'low' ? {kat: 'A', alt: 'dogrulandi'} : {kat: 'C', alt: 'kaynaksiz'};
    } else if (col === 'units' || col === 'outcomes') {
      r = (x.sourceIds || []).some((s) => /^SRC-MEB/.test(s)) ? {kat: 'A', alt: 'resmi'} : {kat: 'C', alt: 'kaynaksiz'};
    } else {
      const d = x.dogrulama, du = d && (d.durum || ''); const t = x.topicId && Store.get('topics', x.topicId);
      if (!d) r = {kat: 'C', alt: 'kaynaksiz'};
      else if (du === 'kaynak-yetersiz') r = {kat: 'C', alt: 'kaynak-eksik'};
      else if (du === 'editor-onayi-bekliyor') r = {kat: 'C', alt: 'editor'};
      else if (du === 'duzeltme-gerekiyor') r = {kat: 'C', alt: 'duzeltme'};
      else if (du === 'kaynak-kontrolunden-gecti' || du === 'gecti') { const rk = risk(metin([x.text, x.options, x.explanation, x.question, x.answer, x.optionNotes, x.items, x.pairs, x.rounds]), t); r = rk ? {kat: 'C', alt: rk} : {kat: 'B', alt: 'turetilmis'}; }
      else r = {kat: 'C', alt: 'kaynaksiz'};
    }
    r.sayfa = x.topicId ? sayfa(Store.get('topics', x.topicId)) : ((x.pageRefs || []).length ? 's. ' + x.pageRefs.slice(0, 3).join(', ') : '');
    Object.defineProperty(x, '_kd45', {value: r, enumerable: false, configurable: true}); return r;
  };
  V45.KD.editorGerekli = (col, x) => { if (col === 'topics') { const k = V45.KD.konu(x); return !k || k.kat === 'C' || k.C > 0; } const k = V45.KD.kayit(col, x); return !k || k.kat === 'C'; };
  V45.KD.yayinaUygun = (col, x) => { if (!x || x.status === 'archived') return false; if (col === 'topics') { const k = V45.KD.konu(x); return !!k && (k.A + k.B) > 0; } const k = V45.KD.kayit(col, x); return !!k && (k.kat === 'A' || k.kat === 'B'); };
  // vis() için: hangi koleksiyondan geldiği bilinmeyen kayıt
  V45.KD.colOf = (x) => x.sections !== undefined || x.contentStatus !== undefined ? 'topics' : x.gameType ? 'games' : x.options ? 'questions' : x.question !== undefined ? 'flashcards' : x.canonicalTerm !== undefined ? 'concepts' : x.type && x.name ? 'entities' : x.code !== undefined ? 'outcomes' : 'units';
  V45.yayinaUygun = (x) => V45.KD.yayinaUygun(V45.KD.colOf(x), x);
  // toplu sayım (rapor ve editör alanı)
  V45.KD.sayim = function () {
    const O = {}, C = ['topics', 'questions', 'flashcards', 'games', 'concepts', 'entities'];
    C.forEach((c) => { const L = Store.all(c).filter((x) => x.status !== 'archived'); const o = O[c] = {toplam: L.length, A: 0, B: 0, C: 0, 'AB+C': 0, neden: {}};
      L.forEach((x) => { const k = c === 'topics' ? V45.KD.konu(x) : V45.KD.kayit(c, x); o[k.kat] = (o[k.kat] || 0) + 1; if (c === 'topics') Object.entries(k.neden || {}).forEach(([a, n]) => { o.neden[a] = (o.neden[a] || 0) + n; }); else if (k.kat === 'C') o.neden[k.alt] = (o.neden[k.alt] || 0) + 1; });
      if (c === 'topics') { o.bloklar = {A: 0, B: 0, C: 0}; L.forEach((x) => { const k = V45.KD.konu(x); o.bloklar.A += k.A; o.bloklar.B += k.B; o.bloklar.C += k.C; }); o.icerikYok = L.filter((x) => !x.sections).length; }
    });
    return O;
  };
  // ---------- arayüz: etiketler ----------
  V45.KD.etiket = function (k) {
    if (!k) return '';
    if (k.kat === 'C' && k.alt === 'icerik-yok') return '<span class="kd45 c">İçerik hazırlanmadı</span>';
    if (k.kat === 'AB+C') return `${k.A ? `<span class="kd45 a">${AD.A} · ${k.A} bölüm</span>` : ''}${k.B ? `<span class="kd45 b">${AD.B} · ${k.B} bölüm</span>` : ''}<span class="kd45 c">${AD.C} · ${k.C} bölüm</span>`;
    return `<span class="kd45 ${k.kat.toLowerCase()}">${AD[k.kat] || ''}${k.alt === 'kurgu' ? ' (hikâyeleştirme)' : ''}</span>`;
  };
  V45.KD.soruNotu = function (q) {
    const k = V45.KD.kayit('questions', q); if (!k) return '';
    return `<p class="mut small dvq">${V45.KD.etiket(k)} <span>${k.kat === 'C' ? esc(NEDEN[k.alt] || '') + '.' : 'Kaynak: ' + esc(k.sayfa || 'ders kitabı') + ' (otomatik kaynak denetimi).'}</span></p>`;
  };
  V45.KD.oyunNotu = function (B) {
    const L = (B && (B.kaynak ? [B.kaynak] : B.oyunlar)) || [], C = L.filter((g) => V45.KD.editorGerekli('games', g)).length;
    return C ? `${L.length - C} etkinlik kaynaktan türetildi · ${C} etkinlik editör kontrolünde` : 'Kaynaktan türetildi · otomatik kaynak denetimini geçti (ders kitabı sayfa aralığı ile örtüşme). Editör onayı gerekmiyor.';
  };
})();
