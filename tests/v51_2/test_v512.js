// V51.2 testleri (depo kökünden): node tests/v51_2/test_v512.js
// Yerel http sunucusu + başsız Chromium. Ekran görüntüleri: docs/V51.2_ekran/. Tarayıcı otomasyonu gerçek cihaz testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const F = 'surumler/din-kulturu-platformu-v51.2.html', F0 = 'surumler/din-kulturu-platformu-v51.1.html';
const SH = path.join(ROOT, 'docs', 'V51.2_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [];
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const URETIM = /anlatım taslağı|taslak hazır|\bkısmi\b|kaynak bekl|hazırlanıyor|[İi]nceleme bekliyor|[Ee]ditör (onayı|kontrolü|doğrulaması) (bekl|öneril|gerekli)|Taslak:/;
const KAZANIM = /DKAB\.\d+\.\d+\.\d+|\b\d{1,2}\.\d{1,2}\.\d{1,2} \(2018\)|Süreç bileşen|Kazanımlar \(MEB|Ünitenin kazanımları/;

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = () => 'http://127.0.0.1:' + srv.address().port + '/' + F;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, mod: 'normal', tema: 'light', ek: null}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1'); localStorage.setItem('dk-theme', o.tema); localStorage.setItem('dk-ptema43', 'gece'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); if (o.ek) Object.entries(o.ek).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL()); await p.waitForTimeout(1500);
    return {p, ctx};
  };
  const metin = (p) => p.evaluate(() => (document.querySelector('main') || document.body).textContent);
  const ac = async (p, js, ms) => { await p.evaluate(js); await bek(ms || 600); };
  const bul = (t, re) => { const m = t.match(re); return m ? m[0] + ' … ' + t.slice(Math.max(0, m.index - 40), m.index + 50).replace(/\s+/g, ' ') : ''; };

  /* A. derleme ve veri */
  const h1 = fs.readFileSync(path.join(ROOT, F), 'utf8'), h0 = fs.readFileSync(path.join(ROOT, F0), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  ok('A1 sürüm V51.2, index.html aynı dosya; V51.1 yedek dosyası duruyor', /V31\.VER="V51\.2"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === h1 && fs.existsSync(path.join(ROOT, F0)));
  ok('A2 bütün veri blokları (müfredat, kazanım–konu ilişkileri, süreç bileşenleri, yıllık plan) V51.1 ile bayt bayt aynı', Object.keys(s0).length === Object.keys(s1).length && Object.entries(s0).every(([k, v]) => s1[k] === v), Object.keys(s1).length + ' blok');
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v51.2'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı', deg.length === 0, deg.join(';') || 'yalnız v51.2');

  /* 1–3, 11. öğrenci (Elmas ve Altın) */
  const ELMAS = [['4. sınıf', "go('grade',{g:4})"], ['9. sınıf', "go('grade',{g:9})"], ['5. sınıflar', "go('classes')"], ['konu anlatım', "go('topic',{t:'TPC-5-1-01',tab:'anlat'})"], ['konu hikâye', "go('topic',{t:'TPC-5-1-01',tab:'hik'})"], ['4. sınıf konu', "go('topic',{t:Store.all('topics').find(t=>t.grade==4).id,tab:'anlat'})"], ['oyunlar', "go('games')"], ['bağlantılar', "go('links')"], ['çalışma', "go('calis45')"]];
  const ALTIN = [['sınıf merkezi', "go('psinif',{pg:4})"], ['ünite', "go('punite',{pg:4,pu:Store.all('units').find(u=>u.grade==4&&u.programYear=='2018').id})"], ['ders', "go('pders',{pt:'TPC-5-1-01',ptab:''})"], ['ders hikâye', "go('pders',{pt:'TPC-5-1-01',ptab:'hik'})"], ['9. sınıf ünite', "go('punite',{pg:9,pu:Store.all('units').find(u=>u.grade==9).id})"]];
  const ogrTara = async (mod, L) => { const {p, ctx} = await sayfa({mod, tema: mod === 'premium' ? 'dark' : 'light'}); const r = {u: {}, k: {}}; for (const [ad, js] of L) { await ac(p, js); const t = await metin(p); r.u[ad] = bul(t, URETIM); r.k[ad] = bul(t, KAZANIM); } if (mod === 'normal') { await ac(p, "go('grade',{g:4})"); await p.screenshot({path: path.join(SH, 'ogrenci-elmas-4-sinif.png')}); } else { await ac(p, ALTIN[1][1]); await p.screenshot({path: path.join(SH, 'ogrenci-altin-unite.png')}); } await ctx.close(); return r; };
  const re = await ogrTara('normal', ELMAS), ra = await ogrTara('premium', ALTIN);
  const bos = (o) => Object.entries(o).filter(([, v]) => v);
  ok('T1 Öğrenci (Elmas) konu listelerinde “anlatım taslağı”, “taslak hazır”, “kısmi”, “hazırlanıyor”, “inceleme/editör onayı bekliyor” gibi üretim etiketi görmez', bos(re.u).length === 0, bos(re.u));
  ok('T2 Öğrenci (Elmas) sınıf, ünite ve konu ekranlarında MEB kazanım kodu ve “Kazanımlar (MEB öğrenme çıktıları)” görmez', bos(re.k).length === 0, bos(re.k));
  ok('T3 Öğrenci süreç bileşenlerini görmez (Elmas)', !Object.values(re.k).some((x) => /Süreç/.test(x)));
  ok('T11 Altın’da aynı kural: üretim etiketi, kazanım kodu, süreç bileşeni yok (sınıf merkezi, ünite, ders)', bos(ra.u).length === 0 && bos(ra.k).length === 0, {u: bos(ra.u), k: bos(ra.k)});

  /* 4–6. öğretmen görünümü */
  {
    const ek = {'dk-ogretmen-v1': JSON.stringify({v: 1, app: 'dkab-ogretmen', classes: [{g: 5, py: '2026'}, {g: 4, py: '2018'}], active: '5|2026', status: {'DKAB-5-U01-O01': 'isl'}, plans: [{id: 'P1', g: 5, py: '2026', oid: 'DKAB-5-U01-O01', date: '2026-09-15', dur: 40, goal: 'x'}], updatedAt: null}), dk2: JSON.stringify({patch: {}, added: {}, prog: {'DKAB-5-U01-O01': {correct: 2, wrong: 1, mastery: 0.66}}, cards: {}, wrong: {}, last: 'TPC-6-1-01'})};
    const {p, ctx} = await sayfa({ek});
    await p.evaluate(async () => { V36.ss(V36.SK, '1'); go('ogretmen'); await new Promise((r) => setTimeout(r, 400)); OGRT.W.go(2); }); await bek(400);
    await p.evaluate(() => scrollTo(0, 500)); await bek(200);
    const once = await p.evaluate(() => ({y: scrollY, wk: JSON.stringify(OGRT.S().wk), tab: OGRT.S().tab, last: Store.ov.last}));
    await p.click('.ogw-kr .ogw-b'); await bek(800);
    const t4 = await p.evaluate(() => { const t = Store.get('topics', G.t); const K = V51.Gorunum.kazanimlar(t); const kart = document.querySelector('.ogv51-k'); return {view, kip: V51.Gorunum.kip(), bar: !!document.querySelector('.ogv51-bar'), kart: !!kart, mod: V50.Mod.aktif(), t: t.id, kodlar: [...kart.querySelectorAll('.ogv51-o code')].map((c) => c.textContent), beklenen: K.uygun.map((o) => o.code), surec: [...kart.querySelectorAll('.ogv51-o')].map((d) => d.querySelectorAll('li').length), surecBek: K.uygun.map((o) => (o.subProcesses || []).length), dl: kart.querySelector('.ogv51-dl').textContent, sinifPy: [t.grade, t.programYear], last: Store.ov.last}; });
    await p.screenshot({path: path.join(SH, 'ogretmen-gorunumu.png')});
    ok('T4 Öğretmen panelinden “İçeriği aç” → öğretmen görünümü açılır (çubuk + öğretmen bilgisi; mod: öğretmen)', t4.view === 'topic' && t4.kip === 'ogretmen' && t4.bar && t4.kart && t4.mod === 'ogretmen', t4);
    ok('T5 Öğretmen görünümünde doğru MEB kazanımları, kodları ve süreç bileşenleri (konunun kazanım ilişkisinden, aynı sınıf ve program); sınıf ve program bilgisi', t4.kodlar.length > 0 && JSON.stringify(t4.kodlar) === JSON.stringify(t4.beklenen) && JSON.stringify(t4.surec) === JSON.stringify(t4.surecBek) && /5\. sınıf/.test(t4.dl) && /2026 programı/.test(t4.dl), t4);
    // 2018 konusu: yalnız 2018 kazanımları
    await p.evaluate(() => V51.Gorunum.ac(Store.all('topics').find((t) => t.grade === 4 && t.programYear === '2018' && (t.outcomeIds || []).length).id)); await bek(700);
    const t5b = await p.evaluate(() => { const t = Store.get('topics', G.t); return {py: t.programYear, kodlar: [...document.querySelectorAll('.ogv51-o code')].map((c) => c.textContent), hepsi2018: (t.outcomeIds || []).map((id) => Store.get('outcomes', id)).filter(Boolean).filter((o) => o.programYear === '2018' && o.grade === 4).map((o) => o.code)}; });
    ok('T5b 2018 konusu: yalnız 4. sınıf 2018 kazanımları gösterilir (2018/2026 karışmaz)', t5b.py === '2018' && t5b.kodlar.length > 0 && t5b.kodlar.every((k) => /\(2018\)/.test(k)) && JSON.stringify(t5b.kodlar) === JSON.stringify(t5b.hepsi2018), t5b);
    await p.click('.ogv51-sec button:nth-child(2)'); await bek(500);
    const t6 = await p.evaluate(() => { const t = document.querySelector('main').textContent; return {kip: V51.Gorunum.kip(), kart: !!document.querySelector('.ogv51-k'), bar: !!document.querySelector('.ogv51-bar'), kod: /DKAB\.\d|\(2018\)|Süreç bileşen/.test(t)}; });
    await p.screenshot({path: path.join(SH, 'ogretmen-ogrenci-onizleme.png')});
    await p.click('.ogv51-sec button:nth-child(1)'); await bek(400); const geriOgr = await p.evaluate(() => V51.Gorunum.kip());
    await p.click('.ogv51-geri'); await bek(800);
    const sonra = await p.evaluate(() => ({view, y: scrollY, wk: JSON.stringify(OGRT.S().wk), tab: OGRT.S().tab, okip: G.okip || '', last: Store.ov.last, prog: Store.ov.prog['DKAB-5-U01-O01']}));
    ok('T6 Öğretmen öğrenci ön izlemesine geçer (kazanım/süreç yok, çubuk duruyor) ve geri döner; “Öğretmen paneli” önceki konuma (aynı sekme ve hafta) döner', t6.kip === 'onizleme' && !t6.kart && t6.bar && !t6.kod && geriOgr === 'ogretmen' && sonra.view === 'ogretmen' && sonra.wk === once.wk && sonra.tab === once.tab && !sonra.okip && Math.abs(sonra.y - once.y) < 60, {t6, geriOgr, once, sonra});
    ok('T10 Öğretmenin önizlemesi öğrencinin “kaldığın yer” kaydını ve ilerlemesini değiştirmez', sonra.last === once.last && sonra.prog && sonra.prog.correct === 2, {once: once.last, sonra: sonra.last});
    // Altın'da öğretmen görünümü
    await p.evaluate(() => { V39.on = true; try { sessionStorage.setItem(V39.SK, '1'); } catch (e) {} }); await p.evaluate(() => V51.Gorunum.ac('TPC-5-1-01')); await bek(800);
    const altin = await p.evaluate(() => ({view, kip: V51.Gorunum.kip(), kart: !!document.querySelector('.ogv51-k'), kod: [...document.querySelectorAll('.ogv51-o code')].map((c) => c.textContent)}));
    await p.screenshot({path: path.join(SH, 'ogretmen-gorunumu-altin.png')});
    ok('T11b Altın’da da öğretmen görünümü aynı kuralla açılır (ders ekranı + öğretmen bilgisi)', altin.view === 'pders' && altin.kip === 'ogretmen' && altin.kart && altin.kod.includes('DKAB.5.1.1'), altin);
    await ctx.close();
  }

  /* 7–8. erişim */
  {
    const {p, ctx} = await sayfa({});
    await ac(p, "go('topic',{t:'TPC-5-1-01',tab:'anlat',okip:'ogretmen'})");
    const a = await p.evaluate(() => ({kip: V51.Gorunum.kip(), okip: G.okip || '', bar: !!document.querySelector('.ogv51-bar, .ogv51-k'), kod: /DKAB\.\d|Süreç bileşen/.test(document.querySelector('main').textContent)}));
    await p.evaluate(() => { G.okip = 'ogretmen'; draw(); }); await bek(400);
    const b2 = await p.evaluate(() => ({kip: V51.Gorunum.kip(), bar: !!document.querySelector('.ogv51-bar, .ogv51-k'), kod: /DKAB\.\d|Süreç bileşen/.test(document.querySelector('main').textContent)}));
    await p.evaluate(() => V51.Gorunum.ac('TPC-5-1-01')); await bek(400); const c = await p.evaluate(() => ({view, kip: V51.Gorunum.kip()}));
    ok('T7 Öğrenci öğretmen görünümüne doğrudan erişemez (ekran parametresi ya da G.okip elle verilse bile öğretmen oturumu yok → öğrenci görünümü)', a.kip === 'ogrenci' && !a.okip && !a.bar && !a.kod && b2.kip === 'ogrenci' && !b2.bar && !b2.kod && c.kip === 'ogrenci', {a, b2, c});
    const ed = {};
    for (const [rol, kur] of [['öğrenci', () => {}], ['öğretmen', () => V36.ss(V36.SK, '1')]]) {
      await p.evaluate(kur);
      await ac(p, "go('editor')"); const e1 = await p.evaluate(() => ({liste: !!document.querySelector('.ed38-cats'), edOk: V38.edOk()}));
      await ac(p, "go('bildirim48')"); const e2 = await p.evaluate(() => !!document.querySelector('.b48-e, .b48-merkez'));
      await ac(p, "go('book',{b:Store.all('textbooks')[0].id})"); const e3 = await p.evaluate(() => !!document.querySelector('.ue51'));
      await p.evaluate(() => V38.edGo({k: 'yayin51', cid: '', mode: ''})); await bek(400); const e4 = await p.evaluate(() => /Sıkı yayın öncesi kontrol/.test(document.querySelector('main').textContent));
      const e5 = await p.evaluate(() => { V51.Yayin.sikiOnayla(true); return !!document.querySelector('.v38-modal'); }); await p.evaluate(() => UI.close && UI.close());
      ed[rol] = {editorListe: e1.liste, edOk: e1.edOk, bildirim: e2, kitapUyari: e3, yayinEkrani: e4, sikiPenceresi: e5};
    }
    ok('T8 Editör alanları (onay alanı, bildirim merkezi, kitap/künye, yayın ayarı) öğrenci ve öğretmen tarafından açılamaz', Object.values(ed).every((x) => !x.editorListe && !x.edOk && !x.bildirim && x.kitapUyari && !x.yayinEkrani && !x.sikiPenceresi), ed);
    await ctx.close();
  }

  /* 9. yayın kuralı */
  {
    const {p, ctx} = await sayfa({});
    const r = await p.evaluate(async () => {
      sessionStorage.setItem('dk-editor-oturum38', '1'); for (let i = 0; i < 60 && !V38.isReady; i++) await new Promise((r) => setTimeout(r, 100));
      const ED = V38.ED, T = Store.all('topics').filter((t) => t.grade === 5 && t.programYear === '2026' && t.status !== 'archived').slice(0, 7), it = (t) => ED.ensure('topics', t);
      it(T[0]).state = 'red'; it(T[1]).state = 'duzeltme'; it(T[2]).state = 'onay'; it(T[2]).kaldirildi51 = {at: 'x'};
      ED.approve('topics', T[3].id, 'test'); ED.approve('topics', T[4].id, 'test'); ED.publish('topics', T[4].id, 'test');
      // T5: onay bekleyen (bekliyor); T6: kaydı yok (inceleme/taslak)
      const kontrol = V51.Yayin.kontrol();
      sessionStorage.removeItem('dk-editor-oturum38');
      const say = () => Object.fromEntries(['units', 'outcomes', 'concepts', 'entities'].map((c) => [c, Store.all(c).filter(vis).length]));
      const gec = T.map((t) => vis(Store.get('topics', t.id))), gecSay = say(), gecKonu = Store.all('topics').filter(vis).length;
      go('grade', {g: 5}); await new Promise((r) => setTimeout(r, 400)); const gecListe = document.querySelectorAll('.trow').length;
      localStorage.setItem('dk-yayin51', JSON.stringify({v: 1, siki: true}));
      const siki = T.map((t) => vis(Store.get('topics', t.id))), sikiSay = say(), sikiKonu = Store.all('topics').filter(vis).length;
      go('grade', {g: 5}); await new Promise((r) => setTimeout(r, 400)); const sikiListe = document.querySelectorAll('.trow').length;
      V39.on = true; go('psinif', {pg: 5}); await new Promise((r) => setTimeout(r, 400)); const altinSiki = document.querySelector('main').textContent;
      localStorage.setItem('dk-yayin51', JSON.stringify({v: 1, siki: false})); V39.on = false;
      return {gec, siki, gecSay, sikiSay, gecKonu, sikiKonu, gecListe, sikiListe, kontrol: kontrol.R.topics, eksik: kontrol.eksik.length, altinSiki: /Konu/.test(altinSiki)};
    });
    ok('T9 Geçiş dönemi (sıkı yayın kapalı): reddedilen, düzeltme bekleyen ve yayından kaldırılan konu öğrenciye gizli; diğerleri görünür (öğrenci ekranı boş kalmaz)', r.gec.join() === 'false,false,false,true,true,true,true' && r.gecKonu > 200 && r.gecListe > 20, {gec: r.gec, gecKonu: r.gecKonu, liste: r.gecListe});
    ok('T9b Sıkı yayın açık: yalnız gerçekten yayımlanmış konu görünür (onay bekleyen, onaylı-yayımlanmamış, taslak gizli); Elmas ve Altın aynı', r.siki.join() === 'false,false,false,false,true,false,false' && r.sikiKonu === 1 && r.sikiListe <= 1, {siki: r.siki, sikiKonu: r.sikiKonu, liste: r.sikiListe});
    ok('T9c Sıkı yayında bile müfredat kayıtları (ünite, kazanım, kavram, kişi/eser) gizlenmez ve bozulmaz (V51.0 hatası düzeltildi)', JSON.stringify(r.gecSay) === JSON.stringify(r.sikiSay) && r.sikiSay.units === 60 && r.sikiSay.outcomes === 238, {gec: r.gecSay, siki: r.sikiSay});
    ok('T9d Editör kontrol ekranı sayıları tutarlı: şu an görünen, sıkı yayında görecek (1), onaylı-yayımlanmamış (1), gizli (3), eksik sınıf listesi', r.kontrol.siki === 1 && r.kontrol.onayli === 1 && r.kontrol.gizli === 3 && r.eksik > 0, {k: r.kontrol, eksik: r.eksik});
    // kontrol ekranı ve onay penceresi
    await p.evaluate(async () => { sessionStorage.setItem('dk-editor-oturum38', '1'); V38.edGo({k: 'yayin51', cid: '', mode: ''}); }); await bek(600);
    await p.screenshot({path: path.join(SH, 'editor-siki-yayin-kontrol.png'), fullPage: true});
    await p.evaluate(() => V51.Yayin.sikiOnayla(true)); await bek(400);
    const pen = await p.evaluate(() => (document.querySelector('.v38-modal') || {}).textContent || '');
    await p.screenshot({path: path.join(SH, 'editor-siki-yayin-onay.png')});
    await p.click('#v38-cok'); await bek(600); const acik = await p.evaluate(() => V51.Yayin.siki());
    await p.evaluate(() => V51.Yayin.sikiAyarla(false)); await bek(300);
    ok('T9e Sıkı yayın yalnız editör kontrol penceresinden açılır; pencerede öğrencinin göreceği sayılar ve eksik sınıflar yazılır', /Konu\s*1/.test(pen.replace(/\s+/g, ' ')) && /sınıf\/programda öğrenci hiç konu göremez/.test(pen) && acik === true, pen.slice(0, 300));
    await ctx.close();
  }

  /* 10. kayıtlar */
  {
    const ek = {dk2: JSON.stringify({patch: {}, added: {}, prog: {'DKAB-5-U01-O01': {correct: 3, wrong: 1, mastery: 0.75}}, cards: {'FC-x': {box: 2}}, wrong: {'Q-DKAB-5-0001': 1}, mt: {'TPC-5-1-01': {s: 4, n: 5}}}), 'dk-ilerleme39': JSON.stringify({fav: {s: [5], k: ['TPC-5-1-01']}, ipucu40: 1}), 'dk-ogretmen-v1': JSON.stringify({v: 1, app: 'dkab-ogretmen', classes: [{g: 5, py: '2026'}], active: '5|2026', status: {}, plans: [{id: 'P1', g: 5, py: '2026', oid: 'DKAB-5-U01-O01', date: '2026-09-15', dur: 40, goal: 'x'}], updatedAt: null})};
    const {p, ctx} = await sayfa({ek});
    for (const js of ["go('grade',{g:5})", "go('topic',{t:'TPC-5-1-01',tab:'anlat'})", "go('pfav')", "V36.ss(V36.SK,'1');go('ogretmen')", "V51.Gorunum.ac('TPC-5-1-01')", "V51.Gorunum.panele()"]) await ac(p, js, 500);
    const k = await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('dk2')), i = JSON.parse(localStorage.getItem('dk-ilerleme39')), o = JSON.parse(localStorage.getItem('dk-ogretmen-v1')); return {prog: d.prog['DKAB-5-U01-O01'], cards: d.cards['FC-x'], wrong: d.wrong, mt: d.mt, fav: i.fav, plans: o.plans.length}; });
    ok('T10b İlerleme, favoriler, test sonuçları, yanlışlar, kartlar ve öğretmen planları korunur', k.prog.correct === 3 && k.cards.box === 2 && k.wrong['Q-DKAB-5-0001'] === 1 && k.mt['TPC-5-1-01'].s === 4 && k.fav.k[0] === 'TPC-5-1-01' && k.plans === 1, k);
    await ctx.close();
  }
  // mobil taşma
  {
    const tas = {};
    for (const w of [360, 412]) { const {p, ctx} = await sayfa({w}); await p.evaluate(() => V36.ss(V36.SK, '1')); await ac(p, "V51.Gorunum.ac('TPC-5-1-01')", 800); tas[w] = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); await ctx.close(); }
    ok('T12 Mobil (360/412 px): öğretmen görünümünde yatay taşma yok', Object.values(tas).every((x) => x <= 0), tas);
  }
  ok('Z1 sayfa hatası (pageerror) yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); srv.close();
  const g = S.filter((x) => x.ok).length; console.log(`\nToplam: ${g}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), sonuc: S}, null, 1));
  process.exitCode = g === S.length ? 0 : 1;
})().catch((e) => { console.error(e); process.exit(1); });
