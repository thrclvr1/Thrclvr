/* ===================== V46.0: Kayıp Bilgeliğin Kütüphanesi — 4–12. sınıf, bütün üniteler =====================
   5. sınıf 2026 1. ünite bölümü (V41'de elle kurulan) olduğu gibi korunur. Diğer her ünite için bölüm, o ünitenin
   kendi kayıtlarından KURULUR (kopya oda yok):
     - Mühür odası  : konu tablosu (≥4 satır) ya da Klasik eşleştirme kaydı (≥4 çift)
     - Raf odası    : Klasik gruplandırma kaydı ya da konu tablosu (satır başlıkları raf olur)
     - Yazıt odası  : Klasik eksik kelime kaydı (≥2 cümle)
     - Şifreli kapı : ünitenin 3 sorusu (son odada ya da tek başına bir oda)
   Oda sayısı, oda türleri, sırası, nesneler, duvar dokuları ve anlatım dili üniteye ve sınıf düzeyine göre değişir.
   Notlar: kitapla doğrulanmış (A) anlatım paragrafları, kaynak denetimini geçmiş tablo satırı, karışan kavram, kodlama.
   Yalnız V45 kaynak sınıfı A/B olan kayıtlar kullanılır (C — editör kontrolü gereken — kullanılmaz). Kayıt yoksa oda kurulmaz.
   Kayıt: dk-oyun41 → oyunlar.kutuphane.<bölüm> (V41 ile aynı yapı; her ünite ayrı). */
(function () {
  if (typeof V41 === 'undefined' || !V41.oyunlar || !V41.oyunlar.kutuphane) return;
  const K = V41.oyunlar.kutuphane, KD = V45.KD;
  /* ---------- yardımcılar ---------- */
  const tohum = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return () => ((h = (Math.imul(h ^ (h >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296); };
  const karis = (A, r) => { A = A.slice(); for (let i = A.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [A[i], A[j]] = [A[j], A[i]]; } return A; };
  const duz = (p) => String(p == null ? '' : p).replace(/\*\*|__|`/g, '').replace(/\*/g, '').trim();
  const kisa = (s, n) => duz(s).length <= n;
  const satirOk = (t, i) => { const c = ((t.dogrulama && t.dogrulama.bolumler && t.dogrulama.bolumler.tablo) || '').charAt(i); return c === 'g' || c === 'o'; };
  const gOk = (g) => g && vis(g) && g.dogrulama && !KD.editorGerekli('games', g);
  const qOk = (q) => q && vis(q) && !KD.editorGerekli('questions', q);
  const bant = (g) => (g <= 5 ? 'k' : g <= 7 ? 'o' : g === 8 ? 'l' : 'a');
  const baslik = (s) => String(s || '').split(' ').map((w) => w.charAt(0) + w.slice(1).toLocaleLowerCase('tr')).join(' ');

  /* ---------- 1. bölüm listesi: bütün görünür üniteler (her iki program; liste seçili programa göre süzülür) ---------- */
  K.ESKI = '5-2026-U01';
  K.bidOf = (u) => `${u.grade}-${u.programYear}-U${String(u.order || 0).padStart(2, '0')}`;
  K.kur = function () {
    Store.all('units').filter((u) => vis(u) && u.grade >= 4 && u.grade <= 12).forEach((u) => { const b = K.bidOf(u); if (!K.BOL[b]) K.BOL[b] = {sinif: u.grade, program: String(u.programYear), unite: u.id}; });
  };

  /* ---------- 2. not adayları (bir konudan) ---------- */
  const notlar = (t) => {
    const L = [], S = t.sections || {};
    (Array.isArray(S.anlatim) ? S.anlatim : []).forEach((x, i) => { if (x && KD.blok(t, 'anlatim', i).kat === 'A' && duz(x.p).length > 60) L.push({tur: 'anlatim', b: duz(x.h) || t.title, m: duz(x.p), k: `${t.title} · Anlatım`}); });
    (Array.isArray(S.karisanlar) ? S.karisanlar : []).forEach((x, i) => { if (x && x.a && x.b && x.fark && KD.blok(t, 'karisanlar', i).kat !== 'C') L.push({tur: 'kar', b: `${duz(x.a)} ↔ ${duz(x.b)}`, m: duz(x.fark) + (x.ipucu ? ' İpucu: ' + duz(x.ipucu) : ''), k: `${t.title} · Karıştırılanlar`}); });
    const kd = S.kodlama; if (kd && kd.p && KD.blok(t, 'kodlama', 0).kat !== 'C') L.push({tur: 'kod', b: 'Kodlama: ' + duz(kd.h || ''), m: duz(kd.p), k: `${t.title} · Kodlama`});
    const tb = S.tablo; if (tb && Array.isArray(tb.rows) && Array.isArray(tb.head) && tb.head[0]) { const R = tb.rows.map((r, i) => [r, i]).filter(([r, i]) => r && r.length >= 2 && satirOk(t, i)).slice(0, 3); if (R.length >= 2) L.push({tur: 'tablo', b: duz(tb.baslik || 'Tablo'), m: R.map(([r]) => r.map((c, j) => (tb.head[j] ? tb.head[j] + ': ' : '') + duz(c)).join(' · ')).join(' | '), k: `${t.title} · Tablo`}); }
    return L;
  };

  /* ---------- 3. bulmaca adayları ---------- */
  const muhurlar = (T, G) => {
    const L = [];
    T.forEach((t) => { const tb = t.sections && t.sections.tablo; if (!tb || !Array.isArray(tb.rows) || !Array.isArray(tb.head) || !tb.head[0] || tb.head.length < 2) return;
      const R = tb.rows.map((r, i) => [r, i]).filter(([r, i]) => r && r.length >= 2 && satirOk(t, i) && kisa(r[0], 28) && kisa(r[r.length - 1], 110) && duz(r[0]) && duz(r[r.length - 1])).map(([r]) => r);
      const u0 = new Set(R.map((r) => duz(r[0]))), u1 = new Set(R.map((r) => duz(r[r.length - 1])));
      if (R.length >= 4 && u0.size === R.length && u1.size === R.length) L.push({kaynak: 'tablo', t, tb, R}); });
    G.filter((g) => g.gameType === 'matching' && Array.isArray(g.pairs)).forEach((g) => { const P = g.pairs.filter((p) => p && kisa(p[0], 28) && kisa(p[1], 110) && duz(p[0]) && duz(p[1])); if (P.length >= 4 && new Set(P.map((p) => duz(p[0]))).size === P.length) L.push({kaynak: 'esles', g, P}); });
    return L;
  };
  const raflar = (T, G) => {
    const L = [];
    G.filter((g) => g.gameType === 'grouping' && Array.isArray(g.categories) && Array.isArray(g.items)).forEach((g) => { const C = g.categories.slice(0, 4), I = g.items.filter((x) => x && C.includes(x.cat) && kisa(x.text, 110)); if (C.length >= 2 && I.length >= 4 && C.every((c) => I.some((x) => x.cat === c))) L.push({kaynak: 'grup', g, C, I}); });
    T.forEach((t) => { const tb = t.sections && t.sections.tablo; if (!tb || !Array.isArray(tb.rows) || !Array.isArray(tb.head) || !tb.head[0] || tb.head.length < 3) return;
      const R = tb.rows.map((r, i) => [r, i]).filter(([r, i]) => r && r.length >= 3 && satirOk(t, i) && kisa(r[0], 28) && duz(r[0])).map(([r]) => r).slice(0, 4);
      const kit = [], gor = new Set(); R.forEach((r) => r.slice(1).forEach((c) => { const m = duz(c); if (m && m.length <= 110 && !gor.has(m)) { gor.add(m); kit.push({m, raf: duz(r[0])}); } }));
      if (R.length >= 3 && kit.length >= 6) L.push({kaynak: 'tablo', t, tb, R, kit}); });
    return L;
  };
  const yazitlar = (G) => G.filter((g) => g.gameType === 'eksik' && Array.isArray(g.items)).map((g) => ({g, I: g.items.filter((x) => x && /_____/.test(x.text || '') && Array.isArray(x.options) && x.options.includes(x.answer))})).filter((x) => x.I.length >= 2);

  /* ---------- 4. sınıf düzeyine göre dil ve görünüm ---------- */
  const AD = {
    muhur: {k: 'Mühürlü Kapı Odası', o: 'Mühür Salonu', l: 'Eşleştirme Salonu', a: 'Belge Mühürleri Odası'},
    raf: {k: 'Renkli Raflar Odası', o: 'Dağınık Arşiv', l: 'Kategori Salonu', a: 'Tasnif Odası'},
    yazit: {k: 'Bilmece Taşı Odası', o: 'Yazıt Galerisi', l: 'Boşluk Salonu', a: 'Kırık Kitabe Odası'},
    kadran: {k: 'Şifreli Kapı Odası', o: 'Kadranlı Kapı', l: 'Deneme Kapısı', a: 'Şifreli Kapı'}
  };
  const GOREV = {
    muhur: {k: 'Notları oku, sonra her mührü doğru yuvaya taşı.', o: 'Odadaki notları incele; mühürleri doğru yuvalara yerleştir.', l: 'Notlardan yararlanarak dört eşleştirmeyi tamamla.', a: 'Belgeleri incele; her mührü ilişkili olduğu ifadenin yuvasına yerleştir.'},
    raf: {k: 'Dağılan kitapları doğru renkli rafa diz.', o: 'Arşivi düzenle: kitapları ait oldukları raflara yerleştir.', l: 'Kitapları doğru kategoriye yerleştir.', a: 'Kaynakları doğru başlıklar altında tasnif et.'},
    yazit: {k: 'Taşın üstündeki bilmecedeki boşlukları doldur.', o: 'Kırık yazıtın eksik taşlarını tamamla.', l: 'Cümlelerdeki boşlukları doğru kavramla doldur.', a: 'Kitabedeki eksik kavramları tamamla.'},
    kadran: {k: 'Kapının üç kadranını doğru cevaba çevir.', o: 'Şifreli kapının üç kadranını çöz.', l: 'Üç soruluk kapı denemesini çöz.', a: 'Üç kadranı doğru yanıta getirerek kapıyı aç.'}
  };
  const GIRIS = {
    k: 'Kütüphanenin çocuk kanadındasın. Renkli raflar, bilmeceli taşlar ve mühürlü kapılar seni bekliyor. Her odada notları oku, sonra bulmacayı çöz.',
    o: 'Kütüphanenin elyazmaları kanadı yıllardır kapalıydı. Odaları gez, notları Defter’ine yaz ve her odanın kilidini çöz.',
    l: 'Kütüphanenin sınav kanadına hoş geldin. Odalardaki notlar ünitenin özeti gibidir; kilitler ise ünite sorularıyla açılır.',
    a: 'Kütüphanenin araştırma kanadındasın. Belgeleri incele, kavramları tasnif et ve kanadın kilitlerini kaynaklara dayanarak çöz.'
  };
  const DUVAR = {k: ['duvar_cocuk', 'duvar_duzen', 'duvar_arsiv'], o: ['duvar_arsiv', 'duvar_harita', 'duvar_yazit'], l: ['duvar_harita', 'duvar_arsiv', 'duvar_yazit'], a: ['duvar_cini', 'duvar_arsiv', 'duvar_yazit']};
  const ZEMIN = {k: 'zemin_ahsap', o: 'zemin_tas', l: 'zemin_ahsap', a: 'zemin_tas'};
  const CIZIM = {anlatim: {k: ['kursu', 'kandil', 'kitapSehpa'], o: ['tomar', 'kursu', 'levha'], l: ['kitapSehpa', 'levha', 'kursu'], a: ['kitapSehpa', 'tasLevha', 'tomar']}, kar: ['tomar'], kod: ['notKagit'], tablo: ['levha', 'tasLevha']};
  const BOY = {kursu: [150, 260], kitapSehpa: [160, 250], kandil: [120, 270], tomar: [120, 250], levha: [170, 200], tasLevha: [150, 220], sandik: [170, 200], notKagit: [110, 120]};
  const NAD = {kursu: 'Okuma kürsüsü', kitapSehpa: 'Açık kitap', kandil: 'Kandil yanındaki not', tomar: 'Tomar', levha: 'Levha', tasLevha: 'Taş levha', sandik: 'Sandık', notKagit: 'Not kâğıdı'};
  const YER = [[-230, -430], [230, -430], [-360, -90], [360, -90], [-200, -650], [200, -650]];

  /* ---------- 5. bölümü kur ---------- */
  K.genel = function (bid) {
    const B = K.BOL[bid], y = {tamam: false, neden: '', odalar: [], kazanim: [], konular: [], durum: ''};
    try {
      if (!B) throw new Error('bölüm');
      const u = Store.get('units', B.unite); if (!u || String(u.programYear) !== B.program || u.grade !== B.sinif) throw new Error('ünite');
      const T = Store.all('topics').filter((t) => t.unitId === u.id && vis(t) && t.sections && String(t.programYear) === B.program).sort((a, b) => (a.order || 0) - (b.order || 0));
      if (!T.length) throw new Error('içerikli konu yok');
      const tid = new Set(T.map((t) => t.id)), G = Store.all('games').filter((g) => (g.unitId === u.id || tid.has(g.topicId)) && gOk(g));
      const r = tohum(bid), bn = bant(B.sinif), Tm = Object.fromEntries(T.map((t) => [t.id, t]));
      const aday = {muhur: karis(muhurlar(T, G), r), raf: karis(raflar(T, G), r), yazit: karis(yazitlar(G), r)};
      const Q = karis(Store.all('questions').filter((q) => tid.has(q.topicId) && qOk(q) && Array.isArray(q.options) && q.options.length >= 3 && q.options.length <= 5 && typeof q.answer === 'number' && q.options.every((o) => kisa(o, 70)) && kisa(q.text, 260)), r).slice(0, 3);
      let turler = karis(Object.keys(aday).filter((k) => aday[k].length), r);
      // şifreli kapı son odadaysa son odanın kendi bulmacası kapıda olmamalı (mühür kapıdadır)
      if (Q.length === 3 && turler.length > 1 && turler[turler.length - 1] === 'muhur') { turler.splice(turler.indexOf('muhur'), 1); turler.unshift('muhur'); }
      const kullanilan = new Set();
      const notSec = (t0, n) => { const L = []; const ekle = (t) => notlar(t).forEach((x) => { if (L.length < n && !kullanilan.has(x.b + x.m.slice(0, 40))) { kullanilan.add(x.b + x.m.slice(0, 40)); L.push(Object.assign({t}, x)); } }); if (t0) ekle(t0); T.forEach((t) => { if (L.length < Math.min(n, 3)) ekle(t); }); return L; };
      const odaKur = (tur, b, t0, kz, i) => {
        const nt = notSec(t0, tur === 'kadran' ? 4 : 5); if (nt.length < 2) return null;
        const yer = karis(YER, r), nes = nt.map((x, j) => { const ad = (x.tur === 'anlatim' ? CIZIM.anlatim[bn] : CIZIM[x.tur])[j % (x.tur === 'anlatim' ? 3 : CIZIM[x.tur].length)], [w, h] = BOY[ad]; return {id: 'n' + j, ad: NAD[ad] + (x.tur === 'kar' ? ' · karşılaştırma' : x.tur === 'tablo' ? ' · tablo' : ''), cizim: ad, x: yer[j][0], z: yer[j][1], w, h, yer: ad === 'notKagit' ? 1 : 0, not: {b: x.b, m: x.m, k: x.k}}; });
        return {id: tur, ad: AD[tur][bn], konu: t0 || T[0], kz: kz && kz.length ? kz : (t0 || T[0]).outcomeIds || [], gorev: GOREV[tur][bn] + (t0 ? ` (${t0.title})` : ''), esik: Math.min(2, nes.length), nes, bulmaca: b, doku: [DUVAR[bn][i % 3], ZEMIN[bn], 'hali', 'tavan']};
      };
      const bul = {
        muhur(c) { if (c.kaynak === 'tablo') { const h = c.tb.head, son = h.length - 1, P = karis(c.R, r).slice(0, 4).map((x) => ({id: duz(x[0]), sol: duz(x[0]), sag: duz(x[x.length - 1]), gozlem: x.slice(1, -1).map(duz).join(' · ')}));
            return {b: {tur: 'muhur', nesne: 'kapi', ad: 'Mühürlü kapı', genel: 1, kz: c.t.outcomeIds, ciftler: P, aciklama: `Kapıda dört yuva var. Her yuvada “${duz(h[son])}” yazıyor. Her mührü (${duz(h[0])}) doğru yuvaya yerleştir. Sürükle ya da önce mühre, sonra yuvaya dokun.`, ara: h.slice(1, -1).map(duz).join(' · '), kaynak: `${c.t.title} · Tablo: ${duz(c.tb.baslik || '')}`, tablo: {rows: P.map((p) => [p.sol, p.gozlem || '—', p.sag])}}, t: c.t};
          }
          const P = karis(c.P, r).slice(0, 4).map((p) => ({id: duz(p[0]), sol: duz(p[0]), sag: duz(p[1]), gozlem: ''})), t = Tm[c.g.topicId];
          return {b: {tur: 'muhur', nesne: 'kapi', ad: 'Mühürlü kapı', genel: 1, kz: c.g.outcomeIds, ciftler: P, aciklama: 'Kapıda dört yuva var. Her mührü, yuvada yazan açıklamayla eşleştir. Sürükle ya da önce mühre, sonra yuvaya dokun.', kaynak: `Klasik oyun: ${c.g.title}`, tablo: {rows: P.map((p) => [p.sol, '—', p.sag])}}, t};
        },
        raf(c) { if (c.kaynak === 'grup') { const I = karis(c.I, r).slice(0, 8); return {b: {tur: 'raf', nesne: 'araba', ad: 'Dağılmış kitaplar', genel: 1, kz: c.g.outcomeIds, raflar: c.C.filter((x) => I.some((k) => k.cat === x)), kitaplar: I.map((x, i) => ({id: 'k' + i, metin: duz(x.text), raf: x.cat})), anlam: {}, aciklama: 'Kitapların sırtındaki bilgileri oku ve her kitabı ait olduğu rafa yerleştir.', kaynak: `Klasik oyun: ${c.g.title}`}, t: Tm[c.g.topicId]}; }
          const I = karis(c.kit, r).slice(0, 8), RF = [...new Set(I.map((x) => x.raf))];
          return {b: {tur: 'raf', nesne: 'araba', ad: 'Dağılmış kitaplar', genel: 1, kz: c.t.outcomeIds, raflar: RF, kitaplar: I.map((x, i) => ({id: 'k' + i, metin: x.m, raf: x.raf})), anlam: {}, aciklama: `Her kitabın sırtında “${duz(c.tb.baslik || 'tablo')}” tablosundan bir bilgi var. Kitabı ait olduğu satırın rafına (${duz(c.tb.head[0])}) yerleştir.`, kaynak: `${c.t.title} · Tablo: ${duz(c.tb.baslik || '')}`}, t: c.t};
        },
        yazit(c) { const I = karis(c.I, r).slice(0, 3); return {b: {tur: 'yazit', nesne: 'yazit', ad: 'Kırık yazıt', genel: 1, kz: c.g.outcomeIds, cumleler: I.map((x, i) => ({id: 'c' + i, metin: x.text, cevap: x.answer, secenek: x.options.slice(), tam: x.full || x.text.replace('_____', x.answer), ref: x.ref})), kaynak: `Klasik oyun: ${c.g.title}`}, t: Tm[c.g.topicId]}; }
      };
      const kadran = Q.length === 3 ? {tur: 'kadran', nesne: 'kapi', ad: 'Şifreli kapı', genel: 1, sorular: Q.map((q) => ({id: q.id, metin: q.text, secenek: q.options.slice(), cevap: q.answer, not: (q.optionNotes || []).slice(), aciklama: q.explanation || '', kz: q.outcomeIds || [], konu: q.topicId})), kaynak: 'Sorular: ' + [...new Set(Q.map((q) => (Tm[q.topicId] || {}).title).filter(Boolean))].join(' · ')} : null;
      turler.forEach((tur, i) => { const c = aday[tur][0], s = bul[tur](c), o = odaKur(tur, s.b, s.t, s.b.kz, i); if (o) y.odalar.push(o); });
      if (kadran) {
        const son = y.odalar[y.odalar.length - 1];
        if (son && son.bulmaca.nesne !== 'kapi') { son.bulmaca2 = kadran; son.gorev += ' Sonra şifreli kapının üç kadranını çöz.'; }
        else { const o = odaKur('kadran', kadran, Tm[Q[0].topicId], [...new Set(Q.flatMap((q) => q.outcomeIds || []))], y.odalar.length); if (o) y.odalar.push(o); }
      }
      if (!y.odalar.length) throw new Error('bu ünitede oda kurmaya yetecek kaynak kaydı yok (tablo, eşleştirme, gruplandırma, eksik kelime ya da 3 soru)');
      const kz = new Set(); y.odalar.forEach((o) => { (o.kz || []).forEach((x) => kz.add(x)); if (o.bulmaca2) o.bulmaca2.sorular.forEach((q) => q.kz.forEach((x) => kz.add(x))); if (o.bulmaca.tur === 'kadran') o.bulmaca.sorular.forEach((q) => q.kz.forEach((x) => kz.add(x))); });
      y.kazanim = [...kz].map((o) => Store.get('outcomes', o)).filter(Boolean).map((o) => Object.assign({}, o, {title: o.title || o.text || ''}));
      y.konular = [...new Set(y.odalar.map((o) => o.konu))];
      y.giris = GIRIS[bn]; y.sonMetin = `${baslik(u.title)} kanadının ${y.odalar.length} kilidini de çözdün.`;
      y.kisa = !(y.odalar.length >= 2 && kadran); y.tamam = true;
    } catch (e) { y.neden = 'Bu ünite için oyun kurulamadı: ' + e.message + '. Kaynakta veri bulunmuyor.'; }
    return y;
  };

  /* ---------- 6. bölüm listesi, envanter ---------- */
  K.bolumler = function () {
    K.kur();
    return Object.keys(K.BOL).map((id) => { const B = K.BOL[id], ic = K.icerik(id), u = Store.get('units', B.unite), n = ic.odalar ? ic.odalar.length : 0;
      return {id, sinif: B.sinif, program: B.program, ad: `${B.sinif}. sınıf · ${u ? baslik(u.title) : '—'}`, alt: `${V39.pyName(B.program).replace(/ \(.*/, '')} · ${n} oda${ic.kisa ? ' · kısa bölüm' : ''}`, odaSay: n || 3, hazir: !!ic.tamam, kisa: !!ic.kisa, neden: ic.neden, uyari: ic.durum, sira: u ? u.order : 0}; })
      .filter((b) => String(V39.pv(b.sinif)) === b.program).sort((a, b) => a.sinif - b.sinif || a.sira - b.sira);
  };
  K.envanter = function () {
    K.kur();
    return Object.keys(K.BOL).map((id) => { const B = K.BOL[id], ic = K.icerik(id), u = Store.get('units', B.unite);
      return {id, sinif: B.sinif, program: B.program, unite: u ? u.title : B.unite, durum: !ic.tamam ? 'eksik' : ic.kisa ? 'kismen' : 'hazir', odalar: (ic.odalar || []).map((o) => o.bulmaca.tur + (o.bulmaca2 ? '+kadran' : '')), neden: ic.neden || ''}; })
      .sort((a, b) => a.sinif - b.sinif || a.program.localeCompare(b.program) || a.id.localeCompare(b.id));
  };

  /* ---------- 7. bölüm seçimi (sayfa gibi kayar) ---------- */
  K.secim = function (kok, g) {
    K.kur(); const L = K.bolumler(), gr = [...new Set(L.map((b) => b.sinif))].sort((a, b) => a - b);
    let s = g || K._sg || (V39.ilr && (V39.ilr().sonSinif)) || 5; if (!gr.includes(+s)) s = gr[0]; K._sg = +s;
    const B = L.filter((b) => b.sinif === +s), kay = (id) => V41.bolumKayit(K.id, id), yld = (k) => (k && k.yildiz ? Object.values(k.yildiz).reduce((a, x) => a + x, 0) : 0);
    kok.classList.remove('o41-tam');
    kok.innerHTML = `<div class="g44-ekran k46-sec"><header class="g44-ust"><button type="button" class="g44-ib" onclick="go('poyun')" aria-label="Oyun merkezine dön">${V41.svg('sol', 18)}<span>Merkez</span></button><div class="g44-ub"><small>Oyun Dünyası</small><b>Kayıp Bilgeliğin Kütüphanesi</b></div></header>
<div class="g44-ic"><p class="g44-mut">Her ünite kütüphanenin bir kanadı. Odalar ünitenin kendi tablolarından, etkinliklerinden ve sorularından kurulur.</p>
<div class="k46-gr" role="group" aria-label="Sınıf seç">${gr.map((x) => `<button type="button" class="k46-c ${x === +s ? 'on' : ''}" aria-pressed="${x === +s}" onclick="V41.oyunlar.kutuphane.secim(document.getElementById('o41'),${x})">${x}. sınıf</button>`).join('')}</div>
<p class="g44-mut k46-pr">${s}. sınıf · ${esc(V39.pyName(V39.pv(+s)))}</p>
<ul class="k46-l">${B.map((b) => { const k = kay(b.id), y = yld(k), dev = k && k.giris && !k.bitti; return `<li><div class="k46-b ${b.hazir ? '' : 'yok'}"><div class="k46-bt"><b>${esc(b.ad.replace(/^\d+\. sınıf · /, ''))}</b><small>${b.hazir ? esc(b.alt) : esc(b.neden)}</small>${b.hazir ? `<span class="k46-y" aria-label="${y} / ${b.odaSay * 3} yıldız">★ ${y} / ${b.odaSay * 3}${k && k.bitti ? ' · tamamlandı' : ''}</span>` : '<span class="k46-dur">Eksik</span>'}</div>
${b.hazir ? `<div class="k46-bb">${dev ? `<button type="button" class="g44-b p" onclick="go('poyna',{oyn:'kutuphane',obol:'${b.id}',odevam:1})">Devam et</button>` : ''}<button type="button" class="g44-b ${dev ? '' : 'p'}" onclick="go('poyna',{oyn:'kutuphane',obol:'${b.id}',odevam:0})">${dev ? 'Baştan' : k && k.bitti ? 'Yeniden oyna' : 'Oyna'}</button></div>` : ''}</div></li>`; }).join('')}</ul></div></div>`;
  };

  /* ---------- 8. ek oda dokuları (V41 çizim yardımcılarıyla) ---------- */
  const A = K.ARAC || {};
  if (A.ahsap) K.DOKU_EK = {
    duvar_cocuk: [512, 1024, (x) => { x.scale(512 / 400, 1024 / 800); A.tasDoku(x, 400, 800, ['#f1e3c6', '#e6d3ae']); A.ahsap(x, 0, 0, 400, 46, {yatay: true, c1: '#7d5130', c2: '#9a6a3c'}); A.altin(x, 0, 42, 400, 4);
      x.save(); x.beginPath(); x.arc(200, 250, 110, 0, 7); x.clip(); const g = x.createLinearGradient(0, 140, 0, 360); g.addColorStop(0, '#8fc4ea'); g.addColorStop(1, '#d9eefb'); x.fillStyle = g; x.fillRect(90, 140, 220, 220); x.fillStyle = '#fff8e8'; [[150, 230, 26], [182, 222, 32], [214, 232, 24]].forEach(([a, b, c]) => { x.beginPath(); x.arc(a, b, c, 0, 7); x.fill(); }); x.restore();
      x.lineWidth = 10; x.strokeStyle = '#7d5130'; x.beginPath(); x.arc(200, 250, 110, 0, 7); x.stroke(); x.lineWidth = 3; x.strokeStyle = '#e4c07a'; x.beginPath(); x.arc(200, 250, 118, 0, 7); x.stroke();
      ['#c8553d', '#2e86ab', '#f2b134', '#4f9d69'].forEach((c, i) => { A.ahsap(x, 10 + i * 97, 430, 90, 150, {c1: '#7d5130', c2: '#9a6a3c'}); x.fillStyle = c; x.globalAlpha = .35; x.fillRect(16 + i * 97, 436, 78, 138); x.globalAlpha = 1; A.kitaplar(x, 18 + i * 97, 446, 74, 60); A.kitaplar(x, 18 + i * 97, 512, 74, 60); });
      A.ahsap(x, 0, 600, 400, 200, {c1: '#7d5130', c2: '#9a6a3c'}); A.altin(x, 0, 596, 400, 6); x.fillStyle = '#4a3d34'; x.fillRect(0, 772, 400, 28); A.altin(x, 0, 770, 400, 3); A.isik(x, 200, 250, 220, .16); }],
    duvar_harita: [512, 1024, (x) => { x.scale(512 / 400, 1024 / 800); A.tasDoku(x, 400, 800, ['#d6c3a0', '#c8b18a']); A.ahsap(x, 0, 0, 400, 46, {yatay: true, c1: '#6d4425', c2: '#8f5e33'}); A.altin(x, 0, 42, 400, 4);
      A.ahsap(x, 40, 110, 320, 330, {c1: '#6a3f22', c2: '#8a5830'}); x.fillStyle = '#efe0bc'; x.fillRect(56, 126, 288, 298); x.fillStyle = 'rgba(120,150,110,.55)';
      [[120, 200, 48, 30, .3], [210, 250, 70, 40, -.2], [290, 190, 40, 26, .5], [160, 330, 54, 34, .1], [280, 340, 36, 22, -.4]].forEach(([a, b, c, d, e]) => { x.beginPath(); x.ellipse(a, b, c, d, e, 0, 7); x.fill(); });
      x.strokeStyle = 'rgba(150,60,40,.8)'; x.setLineDash([6, 6]); x.lineWidth = 2.4; x.beginPath(); x.moveTo(110, 210); x.quadraticCurveTo(200, 160, 215, 250); x.quadraticCurveTo(240, 320, 290, 335); x.stroke(); x.setLineDash([]);
      x.strokeStyle = 'rgba(90,60,30,.35)'; x.lineWidth = 1; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(56, 126 + i * 50); x.lineTo(344, 126 + i * 50); x.stroke(); x.beginPath(); x.moveTo(56 + i * 58, 126); x.lineTo(56 + i * 58, 424); x.stroke(); }
      A.yildizYol(x, 320, 150, 16, 6, 4); x.fillStyle = '#8f5f34'; x.fill();
      A.ahsap(x, 0, 560, 400, 240, {c1: '#73442a', c2: '#8d5a31'}); A.altin(x, 0, 556, 400, 6); x.fillStyle = '#4a3d34'; x.fillRect(0, 772, 400, 28); A.altin(x, 0, 770, 400, 3); A.isik(x, 200, 270, 230, .12); }],
    duvar_cini: [512, 1024, (x) => { x.scale(512 / 400, 1024 / 800); A.tasDoku(x, 400, 800, ['#e2d6bd', '#d4c5a6']); A.ahsap(x, 0, 0, 400, 46, {yatay: true, c1: '#5f3a20', c2: '#7d5029'}); A.altin(x, 0, 42, 400, 4);
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const X0 = c * 50, Y0 = 70 + r * 50; x.fillStyle = (r + c) % 2 ? '#e8f1f7' : '#dfeaf2'; x.fillRect(X0 + 1, Y0 + 1, 48, 48); A.yildizYol(x, X0 + 25, Y0 + 25, 18, 9, 8); x.fillStyle = (r + c) % 2 ? '#2f6f9f' : '#1f5580'; x.fill(); x.beginPath(); x.arc(X0 + 25, Y0 + 25, 5, 0, 7); x.fillStyle = '#c8553d'; x.fill(); }
      x.strokeStyle = '#2f6f9f'; x.lineWidth = 4; x.strokeRect(0, 70, 400, 400); A.altin(x, 0, 470, 400, 6);
      A.ahsap(x, 0, 560, 400, 240, {c1: '#6a3f22', c2: '#8a5830'}); A.altin(x, 0, 556, 400, 6); x.fillStyle = '#4a3d34'; x.fillRect(0, 772, 400, 28); A.altin(x, 0, 770, 400, 3); A.isik(x, 200, 260, 240, .1); }]
  };
  K.kur();
})();
