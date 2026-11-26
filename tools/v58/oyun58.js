/* V58.0 — mevcut oyunlar için kaynaktan türetilmiş yeni içerikler (yeni oyun türü YOK).
   Çalıştırma (depo kökünden):
     node tools/v58/veri58.js                 → V57.0'ın Store verisini tools/v58/.veri/store57.json'a yazar (tarayıcıda, gizlenen kayıtlar hariç)
     node tools/v58/oyun58.js                 → tools/v58/oyun58.json (derleme bunu gömer) + tools/v58/oyun58_ozet.json (sınıf kapsamı)
   İlkeler:
   • Her öğe ders kitabı içeriğinden (konu anlatımı cümlesi, tablo satırı, karıştırılanlar kutusu, bilgi kartı, anlatım başlığı) aynen
     alınır ya da yalnız kısaltılır; yeni bilgi üretilmez. Her öğe kaynağını taşır (ref: "anlatim:<blok>", "kart:<id>", …).
   • Mevcut oyunların kullandığı cümleler/kartlar yeniden kullanılmaz; bir cümle ya da kart yalnız BİR yeni oyunda yer alır.
   • Kayıtlar mevcut oyun türlerinin biçimindedir (eksik, hata, wheel, tabu, benkimim, matching, olay); oynanış kodu değişmez.
   • dogrulama: {durum:'gecti', kapsam:'V58 …', editor:'bekliyor'} — insan editör onayı değildir (mevcut GM30 kayıtlarıyla aynı düzey). */
const fs = require('fs'), path = require('path');
const HERE = __dirname;
const D = JSON.parse(fs.readFileSync(path.join(HERE, '.veri', 'store57.json'), 'utf8'));
const TR = 'tr-TR', low = (s) => String(s || '').toLocaleLowerCase(TR), up1 = (s) => s.charAt(0).toLocaleUpperCase(TR) + s.slice(1);
const norm = (s) => low(s).replace(/[âà]/g, 'a').replace(/[îì]/g, 'i').replace(/[ûù]/g, 'u').replace(/[’'`]/g, "'").replace(/\s+/g, ' ').trim();
// tohumlu karıştırma: aynı veriden her derlemede aynı çıktı
const tohum = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (s) => { let a = tohum(s); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const kar = (a, s) => { const r = rng(s); a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const T = D.topics.filter((t) => t.sections && Array.isArray(t.sections.anlatim) && t.sections.anlatim.length);
const TOP = new Map(D.topics.map((t) => [t.id, t]));
const UNIT = new Map(D.units.map((u) => [u.id, u]));
const CON = new Map(D.concepts.map((c) => [c.id, c]));
const G0 = D.games;
const tarih = '2026-11-26';
const DOG = (k) => ({durum: 'gecti', kapsam: 'V58: ' + k + ' (kaynak metinden türetildi; yeni bilgi eklenmedi); insan editör onayı değildir', editor: 'bekliyor'});
const kayit = (o, t, kaynakTur) => Object.assign({
  topicId: t ? t.id : null, grade: o.grade, course: 'DKAB', programYear: o.programYear, curriculumVersion: o.curriculumVersion || (t && t.curriculumVersion) || 'DATA_PENDING',
  unitId: o.unitId, outcomeIds: o.outcomeIds || [], sourceIds: o.sourceIds || [], status: 'review', dogrulama: DOG(kaynakTur),
  createdAt: tarih, version: 1, academicYear: 'DATA_PENDING', v58: {kaynak: kaynakTur}
}, o);

/* ---------- kullanılmış cümle/kart kümeleri (mevcut oyunlar + bu üretimde kullanılanlar) ---------- */
const KULLANILDI = new Set(), KART = new Set();
const isaret = (s) => norm(s).replace(/_+/g, '_');
G0.forEach((g) => {
  (g.items || []).forEach((x) => { if (typeof x === 'object') { ['full', 'text', 'hint'].forEach((k) => x[k] && KULLANILDI.add(isaret(x[k]))); (x.hints || []).forEach((h) => KULLANILDI.add(isaret(h))); } });
  (g.rounds || []).forEach((r) => (r.cards || []).forEach((c) => c.id && KART.add(c.id)));
  (g.cardIds || []).forEach((id) => KART.add(id));
});

/* ---------- cümleler ---------- */
const cumleler = (p) => String(p || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-ZÇĞİÖŞÜÂÎÛ“"(])/).map((s) => s.trim()).filter((s) => s.length >= 40 && s.length <= 210 && /[.!?]$/.test(s) && !/^[a-zçğıöşü]/.test(s) && !/[:;]$/.test(s));
const konuCumleleri = (t) => { const L = []; (t.sections.anlatim || []).forEach((b, i) => cumleler(b.p).forEach((c) => L.push({c, ref: 'anlatim:' + i}))); return L; };
const kacir = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// terimin sözcük olarak geçtiği yer (Türkçe büyük/küçük harf duyarsız; ardından harf gelmez — “zekâtı” sayılmaz, “Allah'ın” sayılır)
const bul = (cumle, terim) => {
  const re = new RegExp('(^|[^\\p{L}])(' + kacir(terim) + ')(?![\\p{L}])', 'giu'); const M = [];
  let m; const lc = low(cumle), lt = low(terim);
  // RegExp i bayrağı Türkçe İ/ı'yı doğru eşlemez; konumları küçük harf metinde ararız
  let i = -1; while ((i = lc.indexOf(lt, i + 1)) !== -1) { const o = lc[i - 1], s = lc[i + lt.length]; if ((!o || !/\p{L}/u.test(o)) && (!s || !/\p{L}/u.test(s))) M.push(i); }
  void re; void m; return M;
};
const sizar = (metin, terim) => { const l = low(metin), t = low(terim); let i = -1; while ((i = l.indexOf(t, i + 1)) !== -1) { const o = l[i - 1]; if (!o || !/\p{L}/u.test(o)) return true; } return false; };
const maskele0 = (cumle, terim) => { const M = bul(cumle, terim); if (M.length !== 1) return null; const i = M[0]; return {metin: cumle.slice(0, i) + '_____' + cumle.slice(i + terim.length), cevap: cumle.slice(i, i + terim.length)}; };
const maskele = (cumle, terim) => { const m = maskele0(cumle, terim); return m && !sizar(m.metin, terim) ? m : null; };

/* ---------- yardımcı: konu/ünite kavramları ---------- */
const konuKavram = (t) => (t.conceptIds || []).map((id) => CON.get(id)).filter((c) => c && c.term && c.term.length >= 3 && c.term.length <= 26 && !/\d/.test(c.term));
const uniteKonulari = (uid) => T.filter((t) => t.unitId === uid).sort((a, b) => (a.order || 0) - (b.order || 0));
const sinifKavram = (g, p) => D.concepts.filter((c) => +c.grade === +g && String(c.programYear) === String(p) && c.term && c.term.length >= 3 && c.term.length <= 26);
const OUT = [], OZ = {};
const say = (g, tur, n) => { OZ[g] = OZ[g] || {}; OZ[g][tur] = (OZ[g][tur] || 0) + (n || 1); };
const var_ = (tur, f) => G0.some((g) => g.gameType === tur && f(g));

/* ---------- 1. Eksik Kelime (eksik) — konu anlatımı cümlesi + o konunun kavramı ---------- */
T.forEach((t) => {
  if (var_('eksik', (g) => g.topicId === t.id)) return;
  const K = konuKavram(t); if (K.length < 2) return;
  const havuz = [...new Map(uniteKonulari(t.unitId).flatMap(konuKavram).concat(sinifKavram(t.grade, t.programYear)).map((c) => [norm(c.term), c.term])).values()];
  const items = [], cevaplar = new Set();
  for (const {c, ref} of konuCumleleri(t)) {
    if (items.length >= 6) break;
    for (const k of K) {
      if (cevaplar.has(norm(k.term))) continue;
      const m = maskele(c, k.term); if (!m) continue;
      if (KULLANILDI.has(isaret(c)) || KULLANILDI.has(isaret(m.metin))) continue;
      const bas = m.metin.startsWith('_____');
      const ciz = (x) => (bas ? up1(x) : (/^\p{Lu}/u.test(x) && !/^\p{Lu}/u.test(m.cevap) ? x : (/^\p{Lu}/u.test(m.cevap) ? up1(x) : x)));
      const yan = kar(havuz.filter((x) => norm(x) !== norm(k.term) && !bul(c, x).length), t.id + c).slice(0, 3);
      if (yan.length < 3) continue;
      const cevap = m.cevap;
      const opts = kar([cevap].concat(yan.map(ciz)), c);
      if (new Set(opts.map(norm)).size !== 4) continue;
      items.push({text: m.metin, answer: cevap, options: opts, ref, full: c});
      cevaplar.add(norm(k.term)); KULLANILDI.add(isaret(c)); break;
    }
  }
  if (items.length < 3) return;
  OUT.push(kayit({id: `GM58-${t.id}-eksik`, gameType: 'eksik', title: `${t.title} · Eksik Kelime`, grade: t.grade, programYear: t.programYear, curriculumVersion: t.curriculumVersion, unitId: t.unitId, outcomeIds: t.outcomeIds || [], sourceIds: t.sourceIds || [], items, itemRefs: items.map((x) => x.ref)}, t, 'konu anlatımı cümlesi, kavram boşluğu'));
  say(t.grade, 'eksik'); say(t.grade, 'eksik_oge', items.length);
});

/* ---------- 2. Hata Avcısı (hata) ve 3. Çark Çevirme (wheel) — bilgi kartları; bir kart yalnız bir oyunda ---------- */
const KARTLAR = D.flashcards.filter((f) => f.question && f.answer && f.topicId && TOP.get(f.topicId));
const uniteler = [...new Set(T.map((t) => t.unitId))];
const kartSay = (uid) => { const ids = new Set(uniteKonulari(uid).map((t) => t.id)); return KARTLAR.filter((f) => ids.has(f.topicId) && !KART.has(f.id) && f.answer.length <= 170 && f.question.length <= 120).length; };
const CARK_ONCE = new Set();
[...new Set(T.map((t) => +t.grade))].forEach((g) => {
  if (G0.some((x) => x.gameType === 'wheel' && +x.grade === g)) return;
  const L = [...new Set(T.filter((t) => +t.grade === g).map((t) => t.unitId))].map((u) => [u, kartSay(u)]).filter((x) => x[1] >= 6).sort((a, b) => b[1] - a[1]);
  if (L.length) CARK_ONCE.add(L[0][0]);
});
uniteler.forEach((uid) => {
  const u = UNIT.get(uid), konular = uniteKonulari(uid), ids = new Set(konular.map((t) => t.id)); if (!konular.length) return;
  const t0 = konular[0];
  let C = KARTLAR.filter((f) => ids.has(f.topicId) && !KART.has(f.id) && f.answer.length <= 170 && f.question.length <= 120);
  C = kar(C, uid);
  const ad = (u && u.title) || t0.title;
  // Hata Avcısı: ünitede yoksa; 4 kartlık turlar, yanlış cevap aynı ünitenin başka bir turundaki karttan
  const carkOnce = CARK_ONCE.has(uid) && C.length < 11;
  if (!carkOnce && !var_('hata', (g) => g.unitId === uid) && C.length >= 6) {
    const H = C.splice(0, Math.min(12, C.length >= 11 ? C.length - 6 : C.length));
    const turlar = []; for (let i = 0; i + 4 <= H.length; i += 4) turlar.push(H.slice(i, i + 4));
    if (H.length % 4 >= 2 && turlar.length) { /* artan kartlar yanlış cevap kaynağı */ }
    const yedek = H.slice(turlar.length * 4);
    const rounds = turlar.map((L, ti) => {
      const r = rng(uid + ti), w = Math.floor(r() * 4), kaynak = (yedek[ti] || turlar[(ti + 1) % turlar.length][(w + 1) % 4]);
      if (!kaynak || kaynak.id === L[w].id || norm(kaynak.answer) === norm(L[w].answer)) return null;
      return {cards: L.map((f, i) => ({q: f.question, a: i === w ? kaynak.answer : f.answer, id: f.id})), wrong: w, correct: L[w].answer, refs: L.map((f) => 'kart:' + f.id).concat(['yanlış cevap kaynağı kart:' + kaynak.id])};
    }).filter(Boolean);
    if (turlar.length >= 2 || (turlar.length === 1 && yedek.length)) {
      if (rounds.length) {
        H.forEach((f) => KART.add(f.id));
        OUT.push(kayit({id: `GM58-${uid}-hata`, gameType: 'hata', scope: 'unit', title: `${ad} · Hata Avcısı`, grade: t0.grade, programYear: t0.programYear, curriculumVersion: t0.curriculumVersion, unitId: uid, outcomeIds: [...new Set(H.flatMap((f) => f.outcomeIds || []))], sourceIds: t0.sourceIds || [], rounds, topicIds: [...new Set(H.map((f) => f.topicId))]}, null, 'bilgi kartları; yanlış kart başka bir kartın cevabıyla kurulur'));
        say(t0.grade, 'hata'); say(t0.grade, 'hata_tur', rounds.length);
      }
    }
  }
  // Çark Çevirme: ünitede çark yoksa, kalan kartlardan (en az 6)
  C = C.filter((f) => !KART.has(f.id));
  if (!var_('wheel', (g) => g.unitId === uid || ids.has(g.topicId)) && C.length >= 6) {
    const W = C.slice(0, 10); W.forEach((f) => KART.add(f.id));
    OUT.push(kayit({id: `GM58-${uid}-cark`, gameType: 'wheel', scope: 'unit', title: `${ad} · Çarkıfelek`, grade: t0.grade, programYear: t0.programYear, curriculumVersion: t0.curriculumVersion, unitId: uid, outcomeIds: [...new Set(W.flatMap((f) => f.outcomeIds || []))], sourceIds: t0.sourceIds || [], cardIds: W.map((f) => f.id), topicIds: [...new Set(W.map((f) => f.topicId))]}, null, 'bilgi kartları'));
    say(t0.grade, 'cark'); say(t0.grade, 'cark_soru', W.length);
  }
});

/* ---------- 4. Kelimeyi Anlat Bakalım (tabu) — kavram + aynı konunun 4 kavramı yasak + maskeli kitap cümlesi ---------- */
uniteler.forEach((uid) => {
  if (var_('tabu', (g) => g.unitId === uid)) return;
  const konular = uniteKonulari(uid); if (!konular.length) return; const t0 = konular[0], u = UNIT.get(uid);
  const items = [], kul = new Set();
  for (const t of konular) {
    const K = konuKavram(t); if (K.length < 5) continue;
    for (const k of K) {
      if (items.length >= 8 || kul.has(norm(k.term))) continue;
      const B = (t.sections.anlatim || []).map((b) => String(b.p || ''));
      // yasaklılar: konu anlatımında geçen kavramlar; terimle aynı blokta geçenler önce (ilgili sözcükler)
      const birlikte = (x) => B.filter((p) => bul(p, k.term).length && bul(p, x.term).length).length, gecer = (x) => B.filter((p) => bul(p, x.term).length).length;
      const yasak = K.filter((x) => x !== k && norm(x.term) !== norm(k.term) && !norm(x.term).includes(norm(k.term)) && !norm(k.term).includes(norm(x.term))).map((x) => [x.term, birlikte(x), gecer(x)]).filter((x) => x[2] > 0).sort((a, b) => b[1] - a[1] || b[2] - a[2]).slice(0, 4).map((x) => x[0]);
      if (yasak.length < 4) continue;
      let ipucu = null, ref = null;
      for (const {c, ref: r} of konuCumleleri(t)) { const m = maskele(c, k.term); if (m && !KULLANILDI.has(isaret(c)) && !yasak.some((y) => bul(m.metin, y).length)) { ipucu = m.metin; ref = r; KULLANILDI.add(isaret(c)); break; } }
      if (!ipucu) continue;
      items.push({term: k.term, forbidden: yasak, ref: ref + '@' + t.id, hint: ipucu}); kul.add(norm(k.term));
    }
  }
  if (items.length < 3) return;
  OUT.push(kayit({id: `GM58-${uid}-tabu`, gameType: 'tabu', scope: 'unit', title: `${(u && u.title) || t0.title} · Tabu`, grade: t0.grade, programYear: t0.programYear, curriculumVersion: t0.curriculumVersion, unitId: uid, outcomeIds: [...new Set(konular.flatMap((t) => t.outcomeIds || []))], sourceIds: t0.sourceIds || [], items, itemRefs: items.map((x) => x.ref)}, null, 'konu kavramları; yasaklı sözcükler aynı konunun kavramları; ipucu kitap cümlesi'));
  say(t0.grade, 'tabu'); say(t0.grade, 'tabu_kart', items.length);
});

/* ---------- 5. Ben Kimim? (benkimim) — kişi/yer kayıtları + o sınıfın kitap cümleleri (ad gizli) ---------- */
const sinifProg = [...new Set(T.map((t) => t.grade + '|' + t.programYear))];
sinifProg.forEach((sp) => {
  const [g, p] = sp.split('|');
  if (var_('benkimim', (x) => +x.grade === +g && String(x.programYear) === p)) return;
  const konular = T.filter((t) => +t.grade === +g && String(t.programYear) === p);
  const C = konular.flatMap((t) => konuCumleleri(t).map((x) => Object.assign({t}, x)));
  const E = [...new Map(D.entities.filter((e) => +e.grade === +g && String(e.programYear) === p && ['kisi', 'yer'].includes(e.type) && e.name && e.name.length >= 3).map((e) => [norm(e.name), e])).values()];
  const items = [];
  E.forEach((e) => {
    const H = [], R = [];
    for (const x of C) { if (H.length >= 4) break; const m = maskele(x.c, e.name); if (!m || KULLANILDI.has(isaret(x.c))) continue; if (E.some((o) => o !== e && bul(m.metin, o.name).length && norm(o.name).includes(norm(e.name)))) continue; H.push(m.metin); R.push(x.ref + '@' + x.t.id); }
    if (H.length >= 2) { H.forEach((h, i) => KULLANILDI.add(isaret(h))); items.push({name: e.name, etype: e.type, hints: H, refs: R, entityId: e.id}); }
  });
  if (items.length < 3) return;
  const t0 = konular[0];
  OUT.push(kayit({id: `GM58-BK-${g}-${p}`, gameType: 'benkimim', title: `${g}. sınıf · Ben Kimim?`, grade: +g, programYear: p, curriculumVersion: t0.curriculumVersion, unitId: null, outcomeIds: [], sourceIds: t0.sourceIds || [], items}, null, 'kişi/yer kayıtları; ipuçları kitap cümleleri, ad gizli'));
  say(g, 'benkimim'); say(g, 'benkimim_oge', items.length);
});

/* ---------- 6. Eşleştirme (matching) — “karıştırılanlar” kutusundaki kavram ↔ açıklama ---------- */
uniteler.forEach((uid) => {
  if (var_('matching', (g) => g.unitId === uid)) return;
  const konular = uniteKonulari(uid); if (!konular.length) return; const t0 = konular[0], u = UNIT.get(uid);
  const P = [], R = [], ad = new Set(), ac = new Set();
  konular.forEach((t) => (t.sections.karisanlar || []).forEach((k, ki) => (k.grup || []).forEach((x, xi) => {
    if (!x || !x.ad || !x.ac || x.ad.length > 42 || x.ac.length > 120 || x.ac.length < 12) return;
    if (ad.has(norm(x.ad)) || ac.has(norm(x.ac)) || bul(x.ac, x.ad).length) return;
    if (k.durum === 'taslak' || /editör kontrol/i.test(x.ac)) return;
    P.push([x.ad, x.ac.replace(/\.$/, '')]); R.push(`karisanlar:${ki}.${xi}@${t.id}`); ad.add(norm(x.ad)); ac.add(norm(x.ac));
  })));
  if (P.length < 4) return;
  const n = Math.min(P.length, 8);
  OUT.push(kayit({id: `GM58-${uid}-esles`, gameType: 'matching', scope: 'unit', title: `${(u && u.title) || t0.title} · Ünite eşleştirme`, grade: t0.grade, programYear: t0.programYear, curriculumVersion: t0.curriculumVersion, unitId: uid, outcomeIds: [...new Set(konular.flatMap((t) => t.outcomeIds || []))], sourceIds: t0.sourceIds || [], pairs: P.slice(0, n), itemRefs: R.slice(0, n), topicIds: konular.map((t) => t.id)}, null, '“karıştırılanlar” kutusu: kavram ↔ kitaptaki açıklaması'));
  say(t0.grade, 'eslestirme'); say(t0.grade, 'eslestirme_cift', n);
});

/* ---------- 7. Zamanın İzinde (olay) — kitaptaki olay sırası (anlatım başlıkları / tablo satırları) ya da kitapta verilen yıllar ----------
   Seçim elle yapılır (hangi başlıkların olay olduğu); metinler kitaptaki başlık/satırın kendisidir ya da kitap cümlesinden kısaltılır.
   Sıra kuralı: “kitap” = kitaptaki anlatım sırası (kıssa/siyer anlatımı kronolojiktir), “yıl” = kitapta yazılı yıl/tarih. */
const ZAMAN = [
  {t: 'TPC-5-4-02c', ad: 'Hz. Musa’nın kıssası', kural: 'kitap', bas: [1, 2, 3, 4]},
  {t: 'TPC-6-4-02', ad: 'Hz. Muhammed’in (sav) ailesi ve çocukluğu', kural: 'kitap', bas: [2, 3, 4, 5, 6]},
  {t: 'TPC-7-4-01', ad: 'Hz. Muhammed’in (sav) çocukluğundan ilk vahye', kural: 'yas', olay: [
    ['Sütannesi Halime’nin yanında geçen ilk yıllar', 'çocukluğunun ilk yılları'], ['Annesiyle yaşaması', 'dört yaşından sonra'],
    ['Annesinin vefatı', 'altı yaşında'], ['Dedesi Abdülmuttalib’in vefatı', 'sekiz yaşında'], ['Hira’da ilk vahiy', '610 yılı Ramazan ayı']]},
  {t: 'TPC18-8-2-04', ad: 'Hz. Şuayb’ın kıssası', kural: 'kitap', bas: [2, 3, 4, 5]},
  {t: 'TPC-11-5-01', ad: 'Yahudilik tarihi', kural: 'yil', olay: [
    ['Babillilerin Yehuda Krallığı’nı yıkması ve sürgün', 'MÖ 586–538'], ['Perslerin izniyle dönüş ve yeni mabet', 'MÖ 515'],
    ['Haşmonay Hanedanı’nın bağımsızlığı sağlaması', 'MÖ 143–63'], ['Mabedin Romalılarca ikinci kez yıkılması', 'MS 70'],
    ['İlk Siyonist kongrenin toplanması', '1897'], ['Balfour Deklarasyonu', '1917'], ['İsrail Devleti’nin kurulması', '1948']]},
  {t: 'TPC18-12-3-03', ad: 'Tasavvufi yolların kurucuları', kural: 'yil', olay: [
    ['Abdülkadir Geylani — Kadirilik', '1077–1166'], ['Ahmed er-Rıfai — Rifailik', 'ö. 1182'], ['Mevlana Celaleddin Rumi — Mevlevilik', '1207–1273'], ['Bahaeddin Nakşibend — Nakşibendilik', '1318–1389']]},
  {t: 'TPC18-12-1-04', ad: 'Kütüb-i Sitte müelliflerinin vefatı', kural: 'yil', olay: [
    ['Buhârî', 'ö. 870'], ['Müslim', 'ö. 875'], ['İbn Mâce', 'ö. 887'], ['Ebû Dâvûd', 'ö. 889'], ['Tirmizî', 'ö. 892'], ['Nesâî', 'ö. 915']]},
  {t: 'TPC18-12-5-03', ad: 'Doğu dinlerinin kurucu dönemleri', kural: 'yil', konular: ['TPC18-12-5-01', 'TPC18-12-5-04', 'TPC18-12-5-02', 'TPC18-12-5-03'], olay: [
    ['Arilerin Hint Yarımadası’na yerleşmesi (Hinduizmin oluşum dönemi)', 'MÖ 2000’lerin ortası'], ['Lao-Tzu’nun Taoizmi kurması', 'MÖ 604'],
    ['Gautama’nın (Buda) doğumu', 'MÖ 563'], ['Konfüçyüs’ün doğumu', 'MÖ 551']]}
];
ZAMAN.forEach((z) => {
  const t = TOP.get(z.t); if (!t || !t.sections) { console.warn('ZAMAN: konu yok', z.t); return; }
  let items, refs;
  if (z.bas) { const A = t.sections.anlatim; items = z.bas.map((i) => A[i] && A[i].h); refs = z.bas.map((i) => 'anlatim:' + i + '.h'); }
  else if (z.tablo) { const R = t.sections.tablo.rows; items = z.tablo.map((i) => R[i] && R[i][0]); refs = z.tablo.map((i) => 'tablo:' + i); }
  else { items = z.olay.map((x) => x[0]); refs = z.olay.map((x) => 'yıl: ' + x[1]); }
  if (items.some((x) => !x)) { console.warn('ZAMAN: eksik öğe', z.t); return; }
  // yıl kuralında kitap metninde yılın gerçekten geçtiğini denetle
  if (z.kural === 'yas') { const metin = JSON.stringify(t.sections.anlatim); z.olay.forEach(([, y]) => { if (!low(metin).includes(low(y.split(' ')[0]))) throw new Error('yaş/yıl kitapta yok: ' + z.t + ' ' + y); }); }
  if (z.kural === 'yil') { const metin = (z.konular || [z.t]).map((id) => JSON.stringify(TOP.get(id).sections.anlatim)).join(' '); z.olay.forEach(([, y]) => { const n = (y.match(/\d+/g) || []); if (!n.every((d) => metin.includes(d))) throw new Error('yıl kitapta yok: ' + z.t + ' ' + y); }); }
  OUT.push(kayit({id: `GM58-${z.t}-zaman`, gameType: 'olay', zaman58: true, zaman58Ad: z.ad, title: `${z.ad} · Olayı Sırala`, prompt: z.kural === 'kitap' ? 'Kitaptaki sıraya göre diz' : 'Kitapta verilen yaş ve tarihlere göre önce olandan sonra olana diz',
    grade: t.grade, programYear: t.programYear, curriculumVersion: t.curriculumVersion, unitId: t.unitId, outcomeIds: t.outcomeIds || [], sourceIds: t.sourceIds || [],
    items: items.map((x, i) => `${i + 1} – ${x}`), itemRefs: refs, siraKurali: z.kural, aciklama: z.kural !== 'kitap' ? z.olay.map((x) => x[0] + ': ' + x[1]) : null}, t, z.kural === 'kitap' ? 'kitaptaki anlatım sırası' : 'kitapta yazılı yaş ve tarihler'));
  say(t.grade, 'zaman'); say(t.grade, 'zaman_olay', items.length);
});

fs.writeFileSync(path.join(HERE, 'oyun58.json'), JSON.stringify(OUT));
const ozet = {uretim: tarih, toplam: OUT.length, tur: OUT.reduce((a, g) => (a[g.gameType] = (a[g.gameType] || 0) + 1, a), {}), sinif: OZ};
fs.writeFileSync(path.join(HERE, 'oyun58_ozet.json'), JSON.stringify(ozet, null, 1));
console.log(JSON.stringify(ozet));
