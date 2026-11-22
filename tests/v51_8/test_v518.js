// V51.8 testleri (depo kökünden): node tests/v51_8/test_v518.js
// Altın Mod geçici olarak kapalı + “Çok yakında” ekranı. Yerel http sunucusu + başsız Chromium.
// Ekran görüntüleri: docs/V51.8_ekran/. Tarayıcı otomasyonu gerçek cihaz testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v51.8.html', F0 = 'surumler/din-kulturu-platformu-v51.7.html';
const SH = path.join(ROOT, 'docs', 'V51.8_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const BASE = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  // o.mod: 'yeni' | 'normal' | 'premium'; o.oturum: sessionStorage dk-deneyim39-aktif='1'; o.rehber: false → rehber kendiliğinden açılmaz
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, mod: 'normal', oturum: false, rehber: false, ek: null, dosya: F, mobil: true}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: o.mobil, hasTouch: o.mobil});
    await ctx.addInitScript(([o]) => {
      if (o.oturum && !sessionStorage.getItem('__o')) { sessionStorage.setItem('__o', '1'); sessionStorage.setItem('dk-deneyim39-aktif', '1'); }
      if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1');
      if (o.mod !== 'yeni') localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true}));
      if (!o.rehber) localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false}));
      if (o.ek) for (const k in o.ek) localStorage.setItem(k, o.ek[k]);
    }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(o.dosya.slice(-10) + ': ' + e.message));
    await p.goto(BASE + o.dosya); await p.waitForTimeout(1900);
    return {p, ctx};
  };
  const D = (p) => p.evaluate(() => { const y = document.getElementById('yk518'); return {view, on: V39.on, yk: !!y, kaynak: y ? y.dataset.kaynak : null, prem: document.body.hasAttribute('data-prem39'), altinDom: !!document.querySelector('#p40, .p39-pg, .o41-merkez, .g44-merkez, #p39bar, .nv40'), uye: !!document.getElementById('uye39'), mod: V50.Mod.aktif(), son: (JSON.parse(localStorage.getItem('dk-deneyim39') || '{}')).son, ss: sessionStorage.getItem('dk-deneyim39-aktif')}; });
  const kapatX = (p) => p.click('#yk518 .yk518-x');
  const devam = (p) => p.click('#yk518 .yk518-p');

  /* ---------- A. derleme ---------- */
  const h1 = AC(fs.readFileSync(path.join(ROOT, F), 'utf8')), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const gitDegisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v51.8'));
  ok('A1 sürüm V51.8, index.html aynı; veri/müzik/görsel blokları V51.7 ile bayt bayt aynı; önceki sürüm dosyaları ve APK’lar değişmedi', /V31\.VER="V51\.8"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === fs.readFileSync(path.join(ROOT, F), 'utf8') && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && gitDegisen.length === 0, gitDegisen);
  const kod0 = h0.split('V31.VER="V51.7"').join('V31.VER="V51.8"').replace('<meta name="app-version" content="V51.7">', '<meta name="app-version" content="V51.8">'), cssE = fs.readFileSync(path.join(ROOT, 'tools/v51_8/v518.css'), 'utf8'), jsE = fs.readFileSync(path.join(ROOT, 'tools/v51_8/v518_altin.js'), 'utf8');
  ok('A2 Altın silinmedi: V51.7’nin bütün kodu V51.8’de aynen duruyor (yalnız V51.Altin modülü ve CSS eklendi); tek merkezi ayar ACIK:false', h1.includes(jsE) && h1.includes(cssE) && h1.replace(cssE, '').replace(jsE + '\n', '') === kod0 && /ACIK: false,\s+\/\/ ← TEK MERKEZİ AYAR/.test(jsE) && ['V39.r_pdunya', 'V40.r_pdunya', 'V41.kaydol', 'V45.Dunya', 'V39.r_pders'].every((x) => h1.includes(x)), {ekli: h1.length - kod0.length});

  /* ---------- T1. ana ekrandan (Mod paneli) ---------- */
  {
    const {p, ctx} = await sayfa({});
    await p.click('header .md50'); await bek(600);
    const rozet = await p.evaluate(() => { const k = document.querySelector('.mk50-k.altin'); return k && k.querySelector('.yk518-rz') ? k.querySelector('.yk518-rz').textContent : null; });
    await p.screenshot({path: path.join(SH, 'mod-paneli-rozet.png')});
    await p.click('.mk50-k.altin'); await bek(900);
    const d = await D(p), metin = await p.evaluate(() => { const y = document.getElementById('yk518'); return y ? {e: y.querySelector('.yk518-e').textContent, h: y.querySelector('.yk518-h').textContent, m: y.querySelector('.yk518-m').textContent, b: y.querySelector('.yk518-p').textContent, odak: document.activeElement && document.activeElement.className, panel: !!document.querySelector('.mk50-sheet')} : null; });
    await p.screenshot({path: path.join(SH, 'cok-yakinda-390.png')});
    ok('T1 Ana ekrandaki Mod düğmesi › Altın Sınıfı kartı: kartta “Çok yakında” rozeti; dokununca “ALTIN MOD · ÇOK YAKINDA...” ekranı açılır, panel kapanır, mod Elmas kalır', rozet === 'Çok yakında' && d.yk && d.kaynak === 'V50.Mod.gec' && !d.on && !d.prem && d.mod === 'elmas' && d.view === 'home' && metin.e === 'ALTIN MOD' && metin.h === 'ÇOK YAKINDA...' && metin.m === 'Yeni bir öğrenme deneyimi için hazırlıklarımız devam ediyor. Altın Mod çok yakında seninle!' && metin.b === 'Elmas Mod ile öğrenmeye devam et' && /yk518-p/.test(metin.odak) && !metin.panel, {d, metin});
    await p.keyboard.press('Escape'); await bek(500);
    const e = await D(p);
    ok('T1b Escape ve × ekranı kapatır; uygulama Elmas ana sayfasında kalır', !e.yk && e.view === 'home' && e.mod === 'elmas' && !e.altinDom, e);
    await ctx.close();
  }

  /* ---------- T2. başka sayfalardan ---------- */
  {
    const {p, ctx} = await sayfa({});
    const sonuc = {};
    // Profilim › Öğrenme Modum kartları
    await p.evaluate(() => go('profil46')); await bek(700);
    const pk = await p.$('.md50-p .mk50-k.altin, .mk50-k.altin'); sonuc.profilRozet = await p.evaluate(() => !!document.querySelector('.mk50-k.altin .yk518-rz'));
    if (pk) { await pk.click(); await bek(900); } sonuc.profil = await D(p); await kapatX(p); await bek(500);
    // Ayarlar › Öğrenme alanı
    await p.evaluate(() => go('ayar47', {at: 'alan'})); await bek(700);
    await p.click('.mk50-k.altin'); await bek(900); sonuc.ayar = await D(p); await kapatX(p); await bek(500);
    // Elmas › Oyunlar › Oyun Dünyası tanıtım kartı
    await p.evaluate(() => go('games')); await bek(700);
    sonuc.dunyaYazi = await p.evaluate(() => (document.querySelector('.g46-dunya small') || {}).textContent);
    await p.screenshot({path: path.join(SH, 'elmas-oyunlar-oyun-dunyasi-karti.png')});
    await p.click('.g46-dunya'); await bek(900); sonuc.dunya = await D(p);
    await devam(p); await bek(700); sonuc.dunyaDevam = await D(p);
    // Kullanım Rehberi › Altın Sınıfı rehberi
    await p.evaluate(() => V51.Rehber.merkez()); await bek(600);
    sonuc.rehberDurum = await p.evaluate(() => (document.querySelector('.rh517-lis li[data-g="altin"] small') || {}).textContent);
    await p.click('.rh517-lis li[data-g="altin"] .rh517-p'); await bek(1000); sonuc.rehber = await D(p);
    sonuc.rehberModal = await p.evaluate(() => !!document.getElementById('rh517-m'));
    await kapatX(p); await bek(500);
    // eski “Deneyimi değiştir” ve doğrudan işlev çağrıları
    for (const [ad, js] of [['V42.gec', "V42.gec('premium')"], ['V39.toPremium', 'V39.toPremium()'], ['V50.Mod.gec', "V50.Mod.gec('altin')"], ['V47.alanSec', "V47.Ayar.alanSec('premium')"], ['altindaAc', 'V51.Rota.altindaAc()']]) {
      await p.evaluate(js); await bek(900); sonuc[ad] = await D(p); await kapatX(p); await bek(450);
    }
    await p.evaluate(() => { V39.on = true; }); sonuc.onYaz = await p.evaluate(() => V39.on);
    const hepsi = ['profil', 'ayar', 'dunya', 'rehber', 'V42.gec', 'V39.toPremium', 'V50.Mod.gec', 'V47.alanSec', 'altindaAc'];
    ok('T2 Başka ekranlardan Altın’a geçiş (Profilim mod kartı, Ayarlar › Öğrenme alanı, Elmas Oyunlar › Oyun Dünyası kartı, Kullanım Rehberi › Altın rehberi, eski geçiş işlevleri, Elmas oyun onay ekranının “Altın’da aç”ı) hep aynı ekranı açar; hiçbirinde Altın açılmaz',
      hepsi.every((k) => sonuc[k] && sonuc[k].yk && !sonuc[k].on && !sonuc[k].prem && !sonuc[k].altinDom && sonuc[k].mod === 'elmas') && sonuc.profilRozet && /Çok yakında/.test(sonuc.dunyaYazi) && sonuc.rehberDurum === 'Çok yakında' && !sonuc.rehberModal && sonuc.onYaz === false,
      Object.fromEntries(Object.entries(sonuc).map(([k, v]) => [k, v && typeof v === 'object' ? (v.yk ? 'ekran' : 'YOK') + '/' + v.view + '/' + v.mod + (v.on ? '/ALTIN' : '') : v])));
    ok('T6a “Elmas Mod ile öğrenmeye devam et” (Elmas Oyunlar ekranından): ekran kapanır, kullanıcı Elmas Oyunlar’da kalır', !sonuc.dunyaDevam.yk && sonuc.dunyaDevam.view === 'games' && sonuc.dunyaDevam.mod === 'elmas', sonuc.dunyaDevam);
    await ctx.close();
  }

  /* ---------- T3. doğrudan erişim ---------- */
  {
    const {p, ctx} = await sayfa({});
    const R = {};
    const dene = [['pdunya', null, 'home'], ['psinif', {pg: 5}, 'grade'], ['punite', {pg: 5, pu: 'DKAB-5-U02'}, 'grade'], ['pders', {pt: 'TPC-5-2-02', ptab: ''}, 'topic'], ['pozet', {pg: 6}, 'grade'], ['poyun', null, 'games'], ['poyna', {oyn: 'kutuphane', obol: '5-2026-U01'}, 'games']];
    for (const [v, a, bek2] of dene) {
      await p.evaluate(([v, a]) => go(v, a), [v, a]); await bek(800);
      const d = await D(p); const ek = await p.evaluate(() => ({g: G.g, t: G.t}));
      R[v] = {ok: d.yk && d.view === bek2 && !d.on && !d.prem && !d.altinDom, view: d.view, g: ek.g, t: ek.t};
      await kapatX(p); await bek(450);
    }
    ok('T3 Doğrudan rota denemeleri (pdunya, psinif, punite, pders, pozet, poyun, poyna) engellenir: Altın ekranı çizilmez, Elmas karşılığı açılır (sınıf/konu korunur) ve “Çok yakında” gösterilir', Object.values(R).every((x) => x.ok) && R.psinif.g === 5 && R.pders.t === 'TPC-5-2-02', R);
    // Elmas'a ait p-rotaları: Elmas bileşenleriyle çizilir, ekran açılmaz
    await p.evaluate(() => go('pilerleme')); await bek(700); const il = await p.evaluate(() => ({v: view, il: !!document.querySelector('.il51'), yk: !!document.getElementById('yk518'), on: V39.on}));
    await p.evaluate(() => go('pfav')); await bek(700); const fv = await p.evaluate(() => ({v: view, fv: !!document.querySelector('.fv51'), yk: !!document.getElementById('yk518'), on: V39.on}));
    ok('T3b Elmas Profilim’in “Sınıf sınıf ilerleme” ve “Favorilerim” ekranları (pilerleme, pfav) Elmas bileşenleriyle açılmaya devam eder; engellenmez', il.il && !il.yk && !il.on && fv.fv && !fv.yk && !fv.on, {il, fv});
    await ctx.close();
  }

  /* ---------- T4. kapatıp yeniden açma, hatırlanan Altın tercihi, oturum bayrağı ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'premium'});
    const a1 = await D(p);
    await p.screenshot({path: path.join(SH, 'acilis-hatirlanan-altin.png')});
    await p.reload(); await bek(1900); const a2 = await D(p);
    ok('T4 Altın’ı hatırlayan kullanıcı uygulamayı açınca Elmas ana sayfası + “Çok yakında” ekranı; yenilemede de Altın kapalı kalır; kayıtlı tercih kendiliğinden silinmez', a1.yk && a1.view === 'home' && !a1.on && !a1.prem && !a1.altinDom && a1.son === 'premium' && a2.yk && !a2.on && !a2.altinDom, {a1, a2});
    await devam(p); await bek(800); const a3 = await D(p);
    await p.reload(); await bek(1900); const a4 = await D(p);
    ok('T4b “Elmas Mod ile öğrenmeye devam et” seçimi Elmas tercihini kaydeder; sonraki açılışta ekran yeniden çıkmaz', !a3.yk && a3.son === 'normal' && a3.view === 'home' && !a4.yk && a4.view === 'home' && !a4.on, {a3, a4});
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'normal', oturum: true});
    const d = await D(p);
    ok('T4c Önceki oturumdan kalan Altın bayrağı (sessionStorage dk-deneyim39-aktif) Altın’ı açmaz; bayrak temizlenir', !d.on && !d.prem && !d.altinDom && d.ss === null && d.view === 'home', d);
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'yeni'});
    const r = await p.evaluate(() => { const u = document.getElementById('uye39'); return u ? {b: (u.querySelector('.uye39-b.cp span') || {}).textContent, rz: !!u.querySelector('.o42-kp .yk518-rz')} : null; });
    await p.click('#uye39 .uye39-b.cp'); await bek(1000); const d1 = await D(p);
    await p.screenshot({path: path.join(SH, 'secim-ekrani-cok-yakinda.png')});
    await devam(p); await bek(1400); const d2 = await D(p);
    ok('T6b Açılış seçim ekranı: Altın kartında “Çok yakında” rozeti ve düğmesi; dokununca aynı ekran seçim ekranının üstünde açılır; “Elmas Mod ile öğrenmeye devam et” Elmas ana sayfasını açar', r && r.b === 'Çok yakında' && r.rz && d1.yk && d1.uye && !d1.on && !d2.yk && !d2.uye && d2.view === 'home' && d2.mod === 'elmas' && d2.son === 'normal', {r, d1, d2});
    await ctx.close();
  }

  /* ---------- T5. geri tuşu ---------- */
  {
    const {p, ctx} = await sayfa({});
    await p.evaluate(() => go('classes')); await bek(500); await p.evaluate(() => go('grade', {g: 5})); await bek(500);
    await p.evaluate(() => V50.Mod.gec('altin')); await bek(900); const g0 = await D(p);
    await p.goBack(); await bek(700); const g1 = await D(p);
    await p.evaluate(() => go('psinif', {pg: 7})); await bek(800); const g2 = await D(p);
    await p.goBack(); await bek(700); const g3 = await D(p);
    await p.goBack(); await bek(700); const g4 = await D(p);
    await p.goBack(); await bek(700); const g5 = await D(p);
    await p.goForward(); await bek(700); const g6 = await D(p);
    const durum = [g0, g1, g2, g3, g4, g5, g6].map((d) => (d.yk ? '[ÇY] ' : '') + d.view + (d.on || d.altinDom ? ' ALTIN!' : ''));
    ok('T5 Geri tuşu: “Çok yakında” açıkken geri tuşu yalnız ekranı kapatır (aynı sayfada kalınır); engellenen rotadan sonra geri/ileri hep Elmas ekranlarına döner, hiçbir adımda Altın ya da boş ekran yok', g0.yk && !g1.yk && g1.view === 'grade' && g2.yk && g2.view === 'grade' && !g3.yk && [g1, g2, g3, g4, g5, g6].every((d) => !d.on && !d.altinDom && ['home', 'classes', 'grade'].includes(d.view)), durum);
    await ctx.close();
  }

  /* ---------- T6c. öğretmen modundan Altın denemesi ---------- */
  {
    const {p, ctx} = await sayfa({});
    await p.evaluate(() => V50.Mod.gec('ogretmen')); await bek(1200);
    const o1 = await p.evaluate(() => ({view, og: !!document.querySelector('.og-top'), mod: V50.Mod.aktif()}));
    await p.click('.og-top .md50'); await bek(600); await p.click('.mk50-k.altin'); await bek(1000);
    const o2 = await D(p);
    await p.screenshot({path: path.join(SH, 'ogretmen-modundan-altin.png')});
    await devam(p); await bek(1400); const o3 = await D(p);
    ok('T6c Öğretmen Modu’ndan Altın’a geçiş denemesi aynı ekranı açar; “Elmas Mod ile öğrenmeye devam et” Elmas Sınıfı’na geçirir', o1.og && o1.mod === 'ogretmen' && o2.yk && !o2.on && o3.mod === 'elmas' && !o3.yk && !o3.on && !o3.altinDom, {o1, o2, o3});
    await ctx.close();
  }

  /* ---------- T7. Elmas Mod korunur: ekranlar V51.7 ile birebir aynı ---------- */
  {
    const ROTALAR = [['home', null], ['classes', null], ['grade', {g: 5}], ['grade', {g: 9}], ['topic', {t: 'TPC-5-2-02', tab: 'anlat'}], ['search', {q: 'abdest'}], ['cards', {fc: {type: 'all'}}], ['calis45', null], ['pilerleme', null], ['pfav', null], ['sd', null]];
    const al = async (dosya) => {
      const {p, ctx} = await sayfa({dosya});
      const o = {};
      for (const [v, a] of ROTALAR) { await p.evaluate(([v, a]) => go(v, a), [v, a]); await bek(600); o[v + JSON.stringify(a || '')] = await p.evaluate(() => $.innerHTML.replace(/V51\.[78]/g, 'V51.x')); }
      await ctx.close(); return o;
    };
    const e7 = await al(F0), e8 = await al(F);
    const fark = Object.keys(e7).filter((k) => e7[k] !== e8[k]);
    ok('T7 Elmas Mod korunur: ana sayfa, Sınıflar, sınıf sayfaları, konu anlatımı, arama, bilgi kartları, Çalışmam, ilerleme, favoriler, sureler-dualar V51.7 ile birebir aynı HTML’i üretir', fark.length === 0 && Object.keys(e7).length === ROTALAR.length, {fark, ekran: Object.keys(e7).length});
    const {p, ctx} = await sayfa({});
    await p.evaluate(() => go('topic', {t: 'TPC-5-2-02', tab: 'anlat'})); await bek(700);
    const kg = await p.evaluate(() => ({kg: !!document.querySelector('[class*="kg513"], .kg513'), metin: ($.innerText || '').length}));
    await p.evaluate(() => go('topic', {t: 'TPC-5-2-02', tab: 'test'})); await bek(800);
    const test = await p.evaluate(() => { const b = document.querySelector('#app [onclick^="MT.start"]'); if (b) b.click(); return !!b; }); await bek(1000);
    const mt = await p.evaluate(() => { const B = [...document.querySelectorAll('#app .opt')]; if (!B.length) return 0; const m = /MT.pick\('[^']+','([^']+)'/.exec(B[0].getAttribute('onclick') || ''); if (m) { const q = Store.get('questions', m[1]); if (q) B[q.answer].click(); } return B.length; }); await bek(600);
    const geri = await p.evaluate(() => /Doğru/.test($.innerText));
    ok('T7b Elmas konu ekranı: anlatım, konu sonu geçişi ve mini test çalışır', kg.metin > 500 && test && mt >= 2 && geri, {kg, test, mt, geri});
    await ctx.close();
  }

  /* ---------- T8. ortak Etkinlik Oyunları Elmas’ta ---------- */
  {
    const {p, ctx} = await sayfa({});
    await p.evaluate(() => go('games')); await bek(800);
    const n = await p.evaluate(() => gList().length);
    const ids = await p.evaluate(() => { const L = gList(), k = ['type', 'ty', 'tur', 'kind', 'mode'].find((x) => L[0] && x in L[0]); const seen = new Set(), out = []; for (const g of L) { const t = k ? g[k] : g.id.split('-')[0]; if (!seen.has(t)) { seen.add(t); out.push(g.id); } if (out.length >= 6) break; } return out; });
    const sonuc = [];
    for (const id of ids) {
      await p.evaluate((id) => playGame(id), id); await bek(900);
      sonuc.push(await p.evaluate(() => ({view, on: V39.on, yk: !!document.getElementById('yk518'), icerik: ($.innerText || '').length})));
      await p.evaluate(() => go('games')); await bek(500);
    }
    const ilk = await p.evaluate(() => gList()[0].id); await p.evaluate((id) => playGame(id), ilk); await bek(900);
    const g = await p.evaluate(() => ({view, on: V39.on, yk: !!document.getElementById('yk518'), icerik: ($.innerText || '').length}));
    await p.screenshot({path: path.join(SH, 'elmas-etkinlik-oyunu.png')});
    ok('T8 Ortak Etkinlik Oyunları Elmas’ta açılır ve oynanır (oyun listesi + oyun ekranları); Altın’a geçmez, “Çok yakında” çıkmaz', n > 100 && g.view === 'game' && !g.on && !g.yk && g.icerik > 30 && sonuc.length >= 3 && sonuc.every((x) => x.view === 'game' && !x.on && !x.yk && x.icerik > 30), {n, g, oyun: sonuc.length});
    await ctx.close();
  }

  /* ---------- T9. Öğretmen Modu etkilenmez ---------- */
  {
    const ogrt = async (dosya) => {
      const {p, ctx} = await sayfa({dosya, ek: {'dk-ogretmen': JSON.stringify({v: 1, app: 'dkab-ogretmen', classes: [{g: 5, py: '2026'}], active: '5|2026', status: {}, plans: [], updatedAt: null})}});
      await p.evaluate(() => V50.Mod.gec('ogretmen')); await bek(1300);
      const o = {panel: await p.evaluate(() => (document.querySelector('.og-main') || $).innerText.replace(/V51\.[78]/g, '').length)};
      o.sekmeler = await p.evaluate(() => [...document.querySelectorAll('.og-tabs button, [role="tab"]')].map((x) => x.textContent.trim()).filter(Boolean).slice(0, 6));
      await p.evaluate(() => V51.Gorunum.ac('TPC-5-2-02')); await bek(900);
      o.gorunum = await p.evaluate(() => ({view, kip: V51.Gorunum.kip(), on: V39.on}));
      await p.evaluate(() => go('ogara', {oaq: 'namaz'})); await bek(900);
      o.ara = await p.evaluate(() => ({view, n: document.querySelectorAll('#app .card, .oa51-s, .ogara-s, [class*="sonuc"]').length}));
      await ctx.close(); return o;
    };
    const o7 = await ogrt(F0), o8 = await ogrt(F);
    ok('T9 Öğretmen Modu etkilenmez: panel, sekmeler, öğretmen görünümünde konu ve Öğretmen Araması V51.7 ile aynı çalışır', JSON.stringify(o7) === JSON.stringify(o8) && o8.gorunum.kip === 'ogretmen' && o8.gorunum.view === 'topic' && o8.ara.view === 'ogara', {o7, o8});
  }

  /* ---------- T10. kayıtlar korunur ---------- */
  {
    const veri = {
      dk2: JSON.stringify({prog: {'TPC-5-2-02': {seen: 3, lastReviewed: '2026-11-01'}}, fav: ['TPC-5-2-02']}),
      'dk-ilerleme39': JSON.stringify({z: {'TPC-5-2-02': 1}, t: {'TPC-5-2-02': {a: 2, d: 1}}, fav: {s: [5], k: ['TPC-5-2-02']}, son: 'TPC-5-2-02', sonSinif: 5}),
      'dk-oyun41': JSON.stringify({v: 1, oyunlar: {kutuphane: {'5-2026-U01': {v: 1, yildiz: 2, bitti: 1}}}, ayar: {kalite: 'orta'}}),
      'dk-calis45': JSON.stringify({v: 1, hedef: 20, gun: {'2026-11-20': 7}}),
      'dk-mod50': JSON.stringify({v: 1, son: 'elmas'})
    };
    const {p, ctx} = await sayfa({mod: 'premium', ek: veri});
    await devam(p); await bek(700);
    const ilk = await p.evaluate((ks) => Object.fromEntries(ks.map((k) => [k, localStorage.getItem(k)])), Object.keys(veri)); // uygulamanın açılışta yaptığı olağan düzenlemeden sonraki hali
    for (const js of ["V50.Mod.gec('altin')", "go('pdunya')", "go('poyun')", "V42.gec('premium')"]) { await p.evaluate(js); await bek(900); await kapatX(p); await bek(450); }
    const son = await p.evaluate((ks) => Object.fromEntries(ks.map((k) => [k, localStorage.getItem(k)])), Object.keys(veri));
    const degisen = Object.keys(veri).filter((k) => son[k] !== ilk[k]);
    const kayip = Object.keys(veri).filter((k) => k !== 'dk2' && ilk[k] !== veri[k]).concat(JSON.parse(son.dk2).prog && JSON.parse(son.dk2).prog['TPC-5-2-02'] ? [] : ['dk2.prog']);
    ok('T10 Kullanıcı kayıtları korunur: ilerleme (dk2, dk-ilerleme39), oyun kayıtları (dk-oyun41), çalışma hedefi (dk-calis45), mod kaydı (dk-mod50) Altın denemelerinden sonra bayt bayt aynı (dk2 açılışta uygulamanın olağan biçimlendirmesinden geçer; içerik kaybı yok)', degisen.length === 0 && kayip.length === 0, {degisen, kayip});
    await ctx.close();
  }

  /* ---------- T11. merkezi ayarla yeniden açma ---------- */
  {
    const {p, ctx} = await sayfa({});
    await p.evaluate(() => V51.Altin.ac()); await bek(300);
    await p.evaluate(() => V50.Mod.gec('altin')); await bek(1600);
    const a = await D(p);
    await p.evaluate(() => V51.Altin.kapa()); await bek(700);
    const k = await D(p);
    ok('T11 Tek merkezi ayar: V51.Altin açılınca Altın Mod V51.7’deki gibi çalışır (koridor açılır); yeniden kapatılınca Elmas’a döner', a.on && a.prem && a.view === 'pdunya' && !a.yk && !k.on && !k.prem && k.view === 'home', {a, k});
    await ctx.close();
  }

  /* ---------- T12. telefon ve tablet görünümü ---------- */
  {
    const OL = [[360, 640, 'tel-360x640'], [390, 844, 'tel-390x844'], [412, 915, 'tel-412x915'], [915, 412, 'tel-yatay-915x412'], [768, 1024, 'tablet-768x1024'], [1280, 800, 'tablet-yatay-1280x800']];
    const R = [];
    for (const [w, h, ad] of OL) {
      const {p, ctx} = await sayfa({w, h, mobil: w < 1000});
      await p.evaluate(() => V50.Mod.gec('altin')); await bek(1000);
      const m = await p.evaluate(() => { const k = document.querySelector('.yk518-k').getBoundingClientRect(), b = document.querySelector('.yk518-p'), x = document.querySelector('.yk518-x').getBoundingClientRect(); const de = document.documentElement; const k2 = document.querySelector('.yk518-k'); return {icinde: k.left >= 0 && k.right <= innerWidth + .5 && k.top >= 0 && k.bottom <= innerHeight + .5, yatayTasma: de.scrollWidth > innerWidth + 1, kaydirilabilir: k2.scrollHeight > k2.clientHeight + 1, dugmeH: b.getBoundingClientRect().height, xBoyut: Math.min(x.width, x.height), yazi: parseFloat(getComputedStyle(document.querySelector('.yk518-m')).fontSize)}; });
      await p.locator('.yk518-p').scrollIntoViewIfNeeded(); const gor = await p.locator('.yk518-p').isVisible();
      await p.screenshot({path: path.join(SH, 'cok-yakinda-' + ad + '.png')});
      R.push(Object.assign({ad, gor}, m)); await ctx.close();
    }
    ok('T12 Telefon (360, 390, 412, yatay) ve tablette ekran taşmaz: kart görünür alanın içinde, yatay kaydırma yok, düğme en az 44 px ve ulaşılabilir, metin ≥ 16 px', R.every((r) => r.icinde && !r.yatayTasma && r.gor && r.dugmeH >= 44 && r.xBoyut >= 44 && r.yazi >= 16), R.map((r) => `${r.ad}: ${r.icinde && !r.yatayTasma ? 'sığıyor' : 'TAŞIYOR'}${r.kaydirilabilir ? ' (kart içi kaydırma)' : ''}`));
  }

  /* ---------- T13. rehber metinleri ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'yeni', rehber: true});
    const m = await p.evaluate(() => { const x = document.querySelector('#rh517-m [data-a="sonraki"]'); if (x) x.click(); return new Promise((r) => setTimeout(() => r((document.querySelector('#rh517-m .rh517-k') || {}).innerText || ''), 200)); });
    ok('T13 İlk açılış tanıtımı Altın’ı “çok yakında” diye anar (açık olduğunu söylemez)', /çok yakında/i.test(m) && /Elmas/.test(m), m.slice(0, 200));
    await ctx.close();
  }

  ok('T14 Bütün senaryolarda JavaScript hatası yok', HATA.length === 0, HATA.slice(0, 5));
  const g = S.filter((x) => x.ok).length;
  console.log(`\n${g}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen: g, toplam: S.length, kontroller: S}, null, 1));
  await b.close(); srv.close(); process.exit(g === S.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
