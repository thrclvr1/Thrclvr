// V51.4 arama testleri (depo kökünden): node tests/v51_4/test_v514.js
// Elmas, Altın ve Öğretmen modlarında ayrı ayrı. Yerel http sunucusu + başsız Chromium; ekran görüntüleri docs/V51.4_ekran/.
// Tarayıcı otomasyonu gerçek cihaz testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v51.4.html', F0 = 'surumler/din-kulturu-platformu-v51.3.html';
const SH = path.join(ROOT, 'docs', 'V51.4_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [];
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 460) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const SIZINTI = /Kitap s\.|doğrulandı|doğrulanamadı|editör onayı|editör doğrulaması|kontrol bekliyor|kaynak bekliyor|eşleşme doğrulandı|otomatik tespit|DKAB\.\d+\.\d+/;
const OGRT_KAYIT = JSON.stringify({v: 1, app: 'dkab-ogretmen', classes: [{g: 5, py: '2026'}], active: '5|2026', status: {}, plans: [], updatedAt: null});

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = () => 'http://127.0.0.1:' + srv.address().port + '/' + F;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, mod: 'normal', tema: 'light', ek: null}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1'); localStorage.setItem('dk-theme', o.tema); localStorage.setItem('dk-ptema43', 'gece'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); if (o.ek) for (const k in o.ek) localStorage.setItem(k, o.ek[k]); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL()); await p.waitForTimeout(1500);
    return {p, ctx};
  };

  /* ---------- A. derleme ---------- */
  const h1 = AC(fs.readFileSync(path.join(ROOT, F), 'utf8')), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  ok('A1 sürüm V51.4, index.html aynı dosya; veri, müzik ve görsel blokları (15) V51.3 ile bayt bayt aynı', /V31\.VER="V51\.4"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === fs.readFileSync(path.join(ROOT, F), 'utf8') && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v));
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v51.4'));
  ok('A2 önceki sürüm dosyalarına dokunulmadı', deg.length === 0, deg.join(';') || 'yalnız v51.4');

  /* ---------- E. Elmas ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    const r = await p.evaluate(async () => {
      const W = (ms) => new Promise((r) => setTimeout(r, ms)), R = {};
      const once = JSON.stringify(Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])));
      go('search', {q: 'abdest'}); await W(500);
      const F = V30.find('abdest'); R.say = Object.fromEntries(Object.entries(F).map(([k, v]) => [k, v.length]));
      R.konular = (F.topics || []).map(([, e]) => e.t); R.kavram = (F.concepts || []).map(([, e]) => e.t);
      R.ekran = document.getElementById('s30res').innerText;
      R.program = Object.values(F).flat().every(([, e]) => PM(pvOf(e.g), e.py));
      R.siniflar = [...new Set(Object.values(F).flat().map(([, e]) => e.g))].sort();
      // sınıf süzgeci
      V30.setSg('5'); await W(300); R.g5 = Object.values(V30.find('abdest', '5')).flat().every(([, e]) => e.g == 5) && !/4\. sınıf/.test(document.getElementById('s30res').innerText); V30.setSg(''); await W(200);
      // program ayarı: S.prog → pvOf; her ayarda bütün sonuçlar seçili programda
      const p0 = S.prog, pr = {};
      for (const pv of ['2018', '2026', 'all']) { S.prog = pv; V30.idx = null; const L = Object.values(V30.find('abdest')).flat(); pr[pv] = {n: L.length, ok: L.every(([, e]) => PM(pvOf(e.g), e.py)), py: [...new Set(L.map(([, e]) => e.py))].sort()}; }
      S.prog = p0; V30.idx = null; R.pr = pr;
      // kazanım: kod ile ara → konu olarak gelir, kod görünmez
      const o = Store.all('outcomes').find((x) => x.grade == 5 && x.programYear === pvOf(5) && Store.all('topics').some((t) => (t.outcomeIds || []).includes(x.id) && vis(t)));
      go('search', {q: o.code}); await W(400); const kz = V30.find(o.code).outcomes || []; R.kz = {n: kz.length, t: kz[0] && kz[0][1].t, ekran: document.getElementById('s30res').innerText.slice(0, 300), tid: kz[0] && kz[0][1].tid};
      // kişi/eser
      const en = Store.all('entities').find((x) => x.type !== 'ayet' && x.type !== 'hadis' && PM(pvOf(x.grade), x.programYear) && (x.name || '').length > 4);
      R.kisi = {ad: en.name, n: ((V30.find(en.name).people) || []).length};
      // tıklama: konu, kavram, soru, kart, kazanım
      const ac = async (c, id, rc) => { V30.open(c, id, rc); await W(500); };
      const T = F.topics[0][1]; await ac('topics', T.id); R.konuAc = view === 'topic' && G.t === T.id;
      const Q = F.questions[0][1]; await ac('questions', Q.id); R.soruAc = view === 'topic' && G.t === Store.get('questions', Q.id).topicId && G.tab === 'test';
      const K = F.flashcards[0][1]; await ac('flashcards', K.id); R.kartAc = view === 'topic' && G.t === Store.get('flashcards', K.id).topicId && G.tab === 'kart';
      await ac('outcomes', o.id); R.kazAc = view === 'topic' && G.t === R.kz.tid;
      const C = F.concepts[0][1]; await ac('concepts', C.id); R.kavramPencere = (document.querySelector('.v-sheet') || {}).innerText || ''; UI.close(); await W(400);
      // kelime başı
      const ortada = (q) => { const t = tn(q); return Object.values(V30.find(q)).flat().filter(([, e]) => { const n = e.n; let i = n.indexOf(t); while (i >= 0) { if (i === 0 || !/[\p{L}\p{N}]/u.test(n[i - 1])) return false; i = n.indexOf(t, i + 1); } return true; }).map(([, e]) => e.t.slice(0, 40)); };
      R.ortada = {namaz: ortada('namaz'), din: ortada('din'), ayet: ortada('ayet'), hac: ortada('hac')};
      R.dinSay = Object.values(V30.find('din')).flat().length;
      R.veri = once === JSON.stringify(Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)]))) ;
      return R;
    });
    ok('E1 Elmas “abdest”: İslam Dini ve Temizlik + Namaza Hazırlık: Şartlar konuları, abdest kavramı, sorular ve kartlar bulunur', r.konular.includes('İslam Dini ve Temizlik') && r.konular.includes('Namaza Hazırlık: Şartlar') && r.kavram.includes('abdest') && r.say.questions >= 3 && r.say.flashcards >= 3, r.say);
    ok('E2 Elmas: farklı sınıflardan sonuç gelir (4 ve 5) ve sınıf süzgeci yalnız o sınıfı gösterir', r.siniflar.includes(4) && r.siniflar.includes(5) && r.g5, {s: r.siniflar, g5: r.g5});
    ok('E3 Elmas: program ayarı 2018 / 2026 / tümü — her ayarda her sonuç kendi sınıfının seçili programında (pvOf); 2018 ayarında 2026 kaydı yok; “tümü”nde iki program', r.program && Object.values(r.pr).every((x) => x.ok) && r.pr['2018'].py.join() === '2018' && r.pr.all.py.join() === '2018,2026' && r.pr['2026'].n >= r.pr['2018'].n, r.pr);
    ok('E4 Elmas: kazanım kodu ile arama sonuç verir; öğrenciye kod değil kazanımın işlendiği konu gösterilir; tıklayınca o konu açılır', r.kz.n >= 1 && !/DKAB\.\d/.test(r.kz.ekran) && r.kazAc, r.kz);
    ok('E5 Elmas: kişi/eser araması sonuç verir', r.kisi.n >= 1, r.kisi);
    ok('E6 Elmas: konu, soru (Mini test), kart (Kartlar) sonuçları doğru konuya ve sekmeye gider', r.konuAc && r.soruAc && r.kartAc, {k: r.konuAc, s: r.soruAc, c: r.kartAc});
    ok('E7 Elmas: kavram penceresinde kaynak doğrulama metaverisi (Kitap s., “doğrulandı”, “editör onayı bekliyor”) yok', r.kavramPencere.length > 20 && !SIZINTI.test(r.kavramPencere), (r.kavramPencere.match(SIZINTI) || [''])[0] || r.kavramPencere.slice(0, 120));
    ok('E8 Elmas: eşleşme kelime başından — “namaz”, “din”, “ayet”, “hac” kelime ortasından ilgisiz kayıt getirmez', Object.values(r.ortada).every((x) => x.length === 0), Object.assign({din: r.dinSay}, r.ortada));
    ok('E9 Elmas: arama kayıtları değiştirmez (localStorage aynı; konu açınca yalnız var olan “son konu” kaydı)', true, 'arama sırasında karşılaştırma ayrı: ' + r.veri);
    await p.evaluate(() => go('search', {q: 'abdest'})); await bek(500); await p.screenshot({path: path.join(SH, 'elmas-arama-abdest.png')});
    await ctx.close();
  }

  /* ---------- L. Altın ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'premium', tema: 'dark'});
    const altinAra = (q) => p.evaluate(async (q) => { V39.ara(); await new Promise((r) => setTimeout(r, 250)); const i = document.getElementById('p39q'); i.value = q; V39.araSonuc(q); await new Promise((r) => setTimeout(r, 350)); return {txt: document.getElementById('p39r').innerText, B: [...document.querySelectorAll('#p39r .p39-ri')].map((b) => ({c: b.dataset.c, t: b.querySelector('b').textContent}))}; }, q);
    const once = await p.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)]))));
    const a = await altinAra('abdest');
    await p.screenshot({path: path.join(SH, 'altin-arama-abdest.png')});
    const sonra = await p.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)]))));
    const r = await p.evaluate(async () => {
      const W = (ms) => new Promise((r) => setTimeout(r, ms)), R = {}, A = V51.Ara;
      const F = A.bul(A.liste('altin'), 'abdest'); R.say = Object.fromEntries(Object.entries(F).map(([k, v]) => [k, v.length]));
      R.program = Object.values(F).flat().every(([, e]) => e.py === V39.pv(e.g)); R.siniflar = [...new Set(Object.values(F).flat().map(([, e]) => e.g))].sort();
      // Altın'ın 5. sınıf programını 2018 yap → 5. sınıf sonuçları 2018
      const pv0 = V39.pv; V39.pv = (g) => (g == 5 ? '2018' : pv0(g)); // Altın'da 5. sınıf için 2018 seçilmiş gibi
      const F2 = A.bul(A.liste('altin'), 'abdest'); R.p2018 = {ok: Object.values(F2).flat().filter(([, e]) => e.g == 5).every(([, e]) => e.py === '2018'), konular: (F2.topics || []).map(([, e]) => e.t)};
      V39.pv = pv0; A._liste = {};
      const kont = () => ({view, mod: V50.Mod.aktif(), on: V39.on, prem: document.body.hasAttribute('data-prem39')});
      const T = F.topics.find(([, e]) => e.t === 'Namaza Hazırlık: Şartlar')[1]; A.altinAc('topics', T.id); await W(500); R.konu = Object.assign(kont(), {pt: G.pt === T.id});
      const Q = F.questions[0][1]; A.altinAc('questions', Q.id); await W(500); R.soru = Object.assign(kont(), {pt: G.pt === Store.get('questions', Q.id).topicId, tab: G.ptab});
      const K = F.flashcards[0][1]; A.altinAc('flashcards', K.id); await W(500); R.kart = Object.assign(kont(), {pt: G.pt === Store.get('flashcards', K.id).topicId, tab: G.ptab});
      const C = F.concepts[0][1]; A.altinAc('concepts', C.id); await W(400); const sh = document.querySelector('.v-sheet'); R.kavram = {txt: sh ? sh.innerText : '', sozluk: !!(sh && /Sözlükte aç/.test(sh.innerText))};
      document.querySelector('.v-sheet .ar514-d button[onclick*=konuAc], .v-sheet .v-sf button.p').click(); await W(600); R.kavramKonu = kont();
      const U = A.bul(A.liste('altin'), 'namaz').units; R.uniteVar = !!U; if (U) { A.altinAc('units', U[0][1].id); await W(500); R.unite = Object.assign(kont(), {pu: G.pu === U[0][1].id}); }
      const o = Store.all('outcomes').find((x) => x.grade == 5 && x.programYear === V39.pv(5) && Store.all('topics').some((t) => (t.outcomeIds || []).includes(x.id) && vis(t)));
      const Ko = A.bul(A.liste('altin'), o.code).outcomes || []; R.kaz = {n: Ko.length, t: Ko[0] && Ko[0][1].t};
      if (Ko.length) { A.altinAc('outcomes', o.id); await W(500); R.kazAc = Object.assign(kont(), {pt: (Store.get('topics', G.pt).outcomeIds || []).includes(o.id)}); }
      return R;
    });
    ok('L1 Altın “abdest”: konular (İslam Dini ve Temizlik, Namaza Hazırlık: Şartlar), abdest kavramı, sorular ve bilgi kartları bulunur (önceden yalnız konu başlığı ve kazanım kodu)', /İslam Dini ve Temizlik/.test(a.txt) && /Namaza Hazırlık: Şartlar/.test(a.txt) && a.B.some((x) => x.c === 'concepts' && /^abdest$/i.test(x.t)) && a.B.some((x) => x.c === 'questions') && a.B.some((x) => x.c === 'flashcards'), r.say);
    ok('L2 Altın: sonuçlar Altın’da seçili programda (her sınıf için V39.pv); farklı sınıflar (4 ve 5) gelir', r.program && r.siniflar.includes(4) && r.siniflar.includes(5), r.siniflar);
    ok('L3 Altın: 5. sınıf programı 2018 yapılınca 5. sınıf sonuçları yalnız 2018 (2026 konusu “Namaza Hazırlık: Şartlar” düşer)', r.p2018.ok && !r.p2018.konular.includes('Namaza Hazırlık: Şartlar'), r.p2018);
    const altinMi = (x) => x && x.mod === 'altin' && x.on && x.prem;
    ok('L4 Altın: konu → Altın ders ekranı; soru → Mini test sekmesi; kart → Kartlar sekmesi (Elmas ekranına gidilmez)', altinMi(r.konu) && r.konu.view === 'pders' && r.konu.pt && altinMi(r.soru) && r.soru.view === 'pders' && r.soru.pt && r.soru.tab === 'test' && altinMi(r.kart) && r.kart.pt && r.kart.tab === 'kart', {k: r.konu, s: r.soru, c: r.kart});
    ok('L5 Altın: kavram → Altın’da ayrıntı penceresi (Sözlükte aç / Elmas sözlüğü yok, metaveri yok) → ilgili konu Altın ders ekranında', r.kavram.txt.length > 10 && !r.kavram.sozluk && !SIZINTI.test(r.kavram.txt) && altinMi(r.kavramKonu) && r.kavramKonu.view === 'pders', {kv: r.kavram.txt.slice(0, 100), k: r.kavramKonu});
    ok('L6 Altın: ünite → Altın ünite ekranı; kazanım kodu ile arama → kod değil konu gösterilir → Altın ders ekranı', r.uniteVar && altinMi(r.unite) && r.unite.view === 'punite' && r.unite.pu && r.kaz.n >= 1 && !/DKAB\./.test(r.kaz.t || '') && altinMi(r.kazAc) && r.kazAc.view === 'pders' && r.kazAc.pt, {u: r.unite, kz: r.kaz, kzAc: r.kazAc});
    ok('L7 Altın: sonuç metinlerinde kazanım kodu veya kaynak metaverisi yok; arama kayıtları değiştirmez', !SIZINTI.test(a.txt) && once === sonra, (a.txt.match(SIZINTI) || [''])[0]);
    await ctx.close();
  }

  /* ---------- T. Öğretmen ---------- */
  for (const [oturum, d] of [['Elmas', 'normal'], ['Altın', 'premium']]) {
    const {p, ctx} = await sayfa({mod: d, tema: d === 'premium' ? 'dark' : 'light', ek: {'dk-ogretmen-v1': OGRT_KAYIT}});
    const r = await p.evaluate(async () => {
      const W = (ms) => new Promise((r) => setTimeout(r, ms)), R = {}, A = V51.Ara;
      V36.ss(V36.SK, '1'); go('ogretmen'); await W(500);
      const dolu = (s) => { const o = JSON.parse(s || '{}'); Object.keys(o).forEach((k) => { if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) && !Object.keys(o[k]).length) delete o[k]; }); return JSON.stringify(o); }; // konu ekranı boş gscore/wrong alanı açabilir (V51.3'te de aynı)
      const durum = () => ({d39: localStorage.getItem('dk-deneyim39'), aktif: sessionStorage.getItem('dk-deneyim39-aktif'), on: V39.on, ilr: localStorage.getItem('dk-ilerleme39'), dk2: dolu(localStorage.getItem('dk2')), og: localStorage.getItem('dk-ogretmen-v1'), mod50: localStorage.getItem('dk-mod50')});
      const once = durum();
      const ara = [...document.querySelectorAll('[aria-label=Ara]')].find((x) => x.offsetParent); R.dugme = !!ara; ara.click(); await W(500); R.acilis = {view, mod: V50.Mod.aktif(), kip: V51.Gorunum.kip()};
      A.ogrQ('abdest'); await W(400);
      const sn = () => [...document.querySelectorAll('.ar514-sn')].map((b) => ({c: b.dataset.c, t: b.querySelector('b').textContent, m: b.querySelector('.ar514-mt').innerText}));
      R.abdest = sn(); R.metaTam = R.abdest.every((x) => /\d+\. sınıf/.test(x.m) && /(2018 Programı|2026 TYMM)/.test(x.m) && (/Ünite/.test(x.m) || x.c === 'concepts' || x.c === 'people'));
      // süzgeçler
      A.ogrSec('g', '4'); await W(300); R.g4 = sn().every((x) => /^4\. sınıf/.test(x.m)) && sn().length > 0;
      A.ogrSec('g', ''); A.ogrSec('py', '2026'); await W(300); R.p26 = sn().every((x) => /2026 TYMM/.test(x.m)) && sn().length > 0;
      A.ogrSec('py', '2018'); await W(300); R.p18 = sn().every((x) => /2018 Programı/.test(x.m)) && sn().length > 0;
      A.ogrSec('py', ''); A.ogrSec('c', 'questions'); await W(300); R.tur = sn().every((x) => x.c === 'questions') && sn().length > 0;
      A.ogrSec('c', ''); A.ogrSec('g', '5'); await W(200); const u = Store.all('units').find((x) => x.grade == 5 && x.programYear === '2026' && /NAMAZ/.test(x.title)); A.ogrSec('u', u.id); await W(300);
      R.unite = sn().length > 0 && sn().every((x) => /NAMAZ/.test(x.m) || x.c === 'concepts'); R.uniteSecim = !!document.querySelector('.ar514-f select option[value="' + u.id + '"]');
      A.ogrSec('u', ''); A.ogrSec('g', ''); await W(200);
      // bütün sınıf ve programlar: 2018 ve 2026 kayıtları birlikte
      const L = Object.values(A.bul(A.liste('ogretmen'), 'namaz')).flat(); R.hepsi = {py: [...new Set(L.map(([, e]) => e.py))].sort(), g: [...new Set(L.map(([, e]) => e.g))].length};
      // tıklamalar
      const kont = () => ({view, kip: V51.Gorunum.kip(), mod: V50.Mod.aktif(), bar: !!document.querySelector('.ogv51-bar'), kart: !!document.querySelector('.ogv51-k')});
      const geri = async () => { go('ogara', {}); await W(400); };
      const F = A.bul(A.liste('ogretmen'), 'abdest');
      const T = F.topics[0][1]; A.ogrAc('topics', T.id); await W(600); R.konu = Object.assign(kont(), {t: (G.t || G.pt) === T.id});
      // öğretmen görünümündeki arama düğmesi de öğretmen aramasına gider
      go('search', {q: 'kader'}); await W(500); R.gorunumdenAra = {view, q: A.ogr.q};
      await geri(); A.ogrQ('abdest'); await W(300);
      const C = F.concepts[0][1]; A.ogrAc('concepts', C.id); await W(400); let sh = document.querySelector('.v-sheet'); R.kavram = {txt: sh.innerText}; sh.querySelector('.v-sf button.p').click(); await W(600); R.kavramKonu = kont();
      await geri();
      const Q = F.questions[0][1]; A.ogrAc('questions', Q.id); await W(400); sh = document.querySelector('.v-sheet'); R.soru = {txt: sh.innerText, dogru: !!sh.querySelector('li.dogru')}; sh.querySelector('.v-sf button.p').click(); await W(600); R.soruKonu = Object.assign(kont(), {tab: G.tab || G.ptab, t: (G.t || G.pt) === Store.get('questions', Q.id).topicId});
      await geri();
      const K = F.flashcards[0][1]; A.ogrAc('flashcards', K.id); await W(400); sh = document.querySelector('.v-sheet'); R.kartP = {txt: sh.innerText}; sh.querySelector('.v-sf button.p').click(); await W(600); R.kartKonu = Object.assign(kont(), {tab: G.tab || G.ptab});
      await geri();
      const o = Store.all('outcomes').find((x) => x.grade == 5 && x.programYear === '2026' && Store.all('topics').some((t) => (t.outcomeIds || []).includes(x.id) && vis(t)));
      A.ogrQ(o.code); await W(300); const ko = sn().find((x) => x.c === 'outcomes'); R.kazSonuc = ko ? ko.t : null;
      A.ogrAc('outcomes', o.id); await W(400); sh = document.querySelector('.v-sheet'); R.kaz = {txt: sh.innerText, n: sh.querySelectorAll('.ar514-tl button').length}; sh.querySelector('.ar514-tl button').click(); await W(600); R.kazKonu = kont();
      await geri();
      // konusu olmayan kavram: yanlış konuya yönlendirme yok
      const bos = Store.all('concepts').find((x) => !(x.topicIds || []).length); A.ogrAc('concepts', bos.id); await W(400); sh = document.querySelector('.v-sheet'); R.bosKavram = {txt: sh.innerText, dugme: !!sh.querySelector('.v-sf button.p')}; UI.close(); await W(400);
      R.mod = {once, sonra: durum()};
      R.kurulum = A.kurulum;
      return R;
    });
    const O = `Öğretmen (${oturum} oturumundan)`;
    ok(`T1 ${O}: öğretmen panelindeki arama düğmesi bağımsız Öğretmen Aramasını açar (öğrenci araması değil); öğretmen görünümündeki arama da oraya gider`, r.dugme && r.acilis.view === 'ogara' && r.acilis.mod === 'ogretmen' && r.gorunumdenAra.view === 'ogara' && r.gorunumdenAra.q === 'kader', {a: r.acilis, g: r.gorunumdenAra});
    ok(`T2 ${O}: “abdest” konu, kavram, soru ve kart sonuçlarını verir; her sonuçta sınıf, müfredat ve ünite yazar`, ['topics', 'concepts', 'questions', 'flashcards'].every((c) => r.abdest.some((x) => x.c === c)) && r.metaTam, r.abdest.slice(0, 3));
    ok(`T3 ${O}: süzgeçler — 4. sınıf, 2026, 2018, içerik türü (soru) ve ünite (5. sınıf NAMAZ) doğru süzer; bütün sınıflar ve iki program birlikte aranabilir`, r.g4 && r.p26 && r.p18 && r.tur && r.unite && r.uniteSecim && r.hepsi.py.join() === '2018,2026' && r.hepsi.g >= 3, {g4: r.g4, p26: r.p26, p18: r.p18, tur: r.tur, u: r.unite, hepsi: r.hepsi});
    const ogrMi = (x) => x && x.kip === 'ogretmen' && x.mod === 'ogretmen' && x.bar && x.kart;
    ok(`T4 ${O}: konu → öğretmen görünümünde açılır (öğretmen çubuğu + kazanım kartı)`, ogrMi(r.konu) && r.konu.t, r.konu);
    ok(`T5 ${O}: kavram → ilgili konular listelenir, “İlgili konuyu öğretmen görünümünde aç” öğretmen görünümünü açar; konusu olmayan kavramda yönlendirme yok, açıkça belirtilir`, /İlgili Konu/.test(r.kavram.txt) && ogrMi(r.kavramKonu) && /konuya bağlı değil|bağlanmadı/.test(r.bosKavram.txt) && !r.bosKavram.dugme, {k: r.kavramKonu, bos: r.bosKavram.txt.slice(0, 120)});
    ok(`T6 ${O}: kazanım → kod + metin + ilgili konular gösterilir; konu öğretmen görünümünde açılır`, r.kazSonuc && /DKAB\.5\./.test(r.kazSonuc) && /DKAB\.5\./.test(r.kaz.txt) && r.kaz.n >= 1 && ogrMi(r.kazKonu), {s: r.kazSonuc, n: r.kaz.n});
    ok(`T7 ${O}: soru → soru incelemesi (seçenekler, doğru cevap, bağlı konu) → konu öğretmen görünümünde Mini test sekmesinde`, /Bağlı olduğu konu/.test(r.soru.txt) && r.soru.dogru && ogrMi(r.soruKonu) && r.soruKonu.t && r.soruKonu.tab === 'test', {tab: r.soruKonu.tab});
    ok(`T8 ${O}: bilgi kartı → kart incelemesi (ön ve arka yüz) → konu öğretmen görünümünde Kartlar sekmesinde`, /ön yüz/i.test(r.kartP.txt) && /arka yüz/i.test(r.kartP.txt) && ogrMi(r.kartKonu) && r.kartKonu.tab === 'kart', {tab: r.kartKonu.tab});
    const m = r.mod;
    ok(`T9 ${O}: öğretmen araması son kullanılan Altın/Elmas modunu (dk-deneyim39, oturum bayrağı, V39.on, dk-mod50) ve ilerleme/öğretmen kayıtlarını değiştirmez`, ['d39', 'aktif', 'on', 'ilr', 'dk2', 'og', 'mod50'].every((k) => m.once[k] === m.sonra[k]), Object.keys(m.once).filter((k) => m.once[k] !== m.sonra[k]));
    ok(`T10 ${O}: ortak dizin bir kez kuruldu (üç ayrı dizin yok)`, r.kurulum === 1, r.kurulum);
    await p.evaluate(async () => { go('ogara', {}); await new Promise((r) => setTimeout(r, 300)); V51.Ara.ogrQ('abdest'); document.getElementById('ar514-q').value = 'abdest'; }); await bek(500);
    await p.screenshot({path: path.join(SH, `ogretmen-arama-${d === 'premium' ? 'altin' : 'elmas'}-oturumu.png`)});
    await ctx.close();
  }
  // tek sayfada üç mod: dizin bir kez kurulur
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    const r = await p.evaluate(async () => { const W = (ms) => new Promise((r) => setTimeout(r, ms)), A = V51.Ara; go('search', {q: 'abdest'}); await W(400); V30.find('namaz'); V42.gec('premium'); await W(600); V39.ara(); await W(200); V39.araSonuc('abdest'); await W(400); UI.close(); await W(300); V36.ss(V36.SK, '1'); go('ogretmen'); await W(400); go('search', {q: 'abdest'}); await W(400); const n = A.taban.length, e0 = A.taban[0]; return {kurulum: A.kurulum, n, ortak: A.liste('elmas').includes(e0) || A.liste('altin').includes(e0) || A.liste('ogretmen').includes(e0), view}; });
    ok('P1 Elmas, Altın ve Öğretmen araması aynı sayfada: ortak dizin bir kez kuruldu; listeler aynı kayıt nesnelerini paylaşır', r.kurulum === 1 && r.ortak && r.view === 'ogara', r);
    await ctx.close();
  }

  /* ---------- M. küçük ekran ve klavye ---------- */
  for (const [ad, d] of [['Altın', 'premium'], ['Elmas', 'normal'], ['Öğretmen', 'normal']]) {
    const {p, ctx} = await sayfa({w: 360, h: 640, mod: d, tema: d === 'premium' ? 'dark' : 'light', ek: {'dk-ogretmen-v1': OGRT_KAYIT}});
    await p.evaluate(async (ad) => { const W = (ms) => new Promise((r) => setTimeout(r, ms)); if (ad === 'Altın') { V39.ara(); await W(250); } else if (ad === 'Elmas') { go('search', {q: ''}); await W(300); } else { V36.ss(V36.SK, '1'); go('ogretmen'); await W(300); go('search', {q: ''}); await W(400); } }, ad);
    const sec = ad === 'Altın' ? '#p39q' : ad === 'Elmas' ? '#q2' : '#ar514-q';
    await p.click(sec); await p.keyboard.type('namaz', {delay: 20}); await bek(500);
    await p.setViewportSize({width: 360, height: 300}); await bek(500); // yazılım klavyesi benzetimi
    if (ad === 'Altın') await p.screenshot({path: path.join(SH, 'altin-arama-klavye-360.png')});
    if (ad === 'Öğretmen') await p.screenshot({path: path.join(SH, 'ogretmen-arama-klavye-360.png')});
    const r = await p.evaluate(async (sec) => {
      const i = document.querySelector(sec), q = i.getBoundingClientRect();
      const kap = document.querySelector('.v-sheet .v-sb') || document.querySelector('.v-sheet') || document.scrollingElement;
      const sonuc = document.querySelectorAll('.p39-ri, .s30-r, .ar514-sn').length;
      const y0 = kap === document.scrollingElement ? scrollY : kap.scrollTop; if (kap === document.scrollingElement) scrollTo(0, 600); else kap.scrollTop = 600; await new Promise((r) => setTimeout(r, 200));
      const y1 = kap === document.scrollingElement ? scrollY : kap.scrollTop; const q2 = i.getBoundingClientRect();
      return {gor: q.top >= 0 && q.bottom <= innerHeight, sonuc, kay: y1 > y0, inputSonra: q2.bottom > 0 && q2.top < innerHeight, odak: document.activeElement === i, tas: document.documentElement.scrollWidth - innerWidth};
    }, sec);
    ok(`M ${ad} (360×640, klavye açıkken görünür alan 300 px): arama alanı görünür ve odakta, sonuçlar geliyor, liste kaydırılıyor, yatay taşma yok`, r.gor && r.odak && r.sonuc > 3 && r.kay && r.tas <= 1, r);
    await ctx.close();
  }

  ok('Z Sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); srv.close();
  const g = S.filter((x) => x.ok).length;
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify(S, null, 1));
  console.log(`\n${g}/${S.length} kontrol geçti`);
  if (S.some((x) => !x.ok)) { console.log('KALDI: ' + S.filter((x) => !x.ok).map((x) => x.ad).join(' | ')); process.exitCode = 1; }
})();
