// V49.0 testleri (depo kökünden): node tests/v49/test_v490.js
// Yerel http sunucusu + başsız Chromium (SwiftShader WebGL). Hafif mod (dk-lite) açıkça ayarlanır. Ekran görüntüleri: docs/V49.0_ekran/
// Geri tuşu gerçek tarayıcı geçmişiyle (page.goBack), kaydırma gerçek dokunma olaylarıyla. Tarayıcı otomasyonu gerçek cihaz testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const F49 = 'surumler/din-kulturu-platformu-v49.0.html', F48 = 'surumler/din-kulturu-platformu-v48.0.html';
const SH = path.join(ROOT, 'docs', 'V49.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [];
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = () => 'http://127.0.0.1:' + srv.address().port + '/' + F49;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, lite: '1', mod: 'premium', tema: 'light', pt: 'gece', sec: false, ek: null}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', o.lite); localStorage.setItem('dk-theme', o.tema); localStorage.setItem('dk-ptema43', o.pt); if (!o.sec) localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); if (o.ek) Object.entries(o.ek).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL()); await p.waitForTimeout(1500);
    return {p, ctx};
  };
  const tasma = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const durum = (p) => p.evaluate(() => ({v: view, on: !!V39.on, prem: document.body.hasAttribute('data-prem39'), eski: !!document.querySelector('.h30-hello') && !document.querySelector('.h46'), h46: !!document.querySelector('.h46'), tema: document.documentElement.dataset.theme}));
  // desen taraması: CSS arka plan SVG'lerinde altı kat simetrik çokgen, haç/artı çizgisi, eski girih
  const desen = (p, sec) => p.evaluate((sec) => {
    const kat = () => { const h = getComputedStyle(document.documentElement, '::before'), b = getComputedStyle(document.body, '::after'); return h.display !== 'none' ? h : (b.display !== 'none' ? b : null); };
    const css = [(kat() || {}).backgroundImage || '', ...[...document.querySelectorAll(sec)].map((e) => getComputedStyle(e).backgroundImage)].join(' ');
    const t = [...css.matchAll(/url\("([^"]+)"\)/g)].map((m) => { try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; } }).join(' ');
    const hac = /M[\d.]+ [\d.]+h[\d.]+M[\d.]+ [\d.]+v[\d.]+/.test(t);
    const roz = (t.match(/<use href='#y0' transform='rotate\(/g) || []).length;
    const poligon = (t.match(/<polygon/g) || []).length;
    return {svg: /data:image\/svg/.test(css), hac, roz, poligon, yildiz8: /points='[^']+'/.test(t)};
  }, sec);
  const altiKat = (p) => p.evaluate(() => {
    const kontrol = (pts) => { const n = pts.length; if (n !== 6 && n !== 12) return false; const cx = pts.reduce((a, q) => a + q[0], 0) / n, cy = pts.reduce((a, q) => a + q[1], 0) / n; const A = pts.map((q) => Math.atan2(q[1] - cy, q[0] - cx)).sort((a, b) => a - b); const d = A.map((a, i) => ((i ? a - A[i - 1] : a - A[n - 1] + 2 * Math.PI) * 180 / Math.PI)); return d.every((x) => Math.abs(x - 360 / n) < 4); };
    const oku = (s) => (s || '').trim().split(/[\s,]+/).map(Number).reduce((a, v, i, L) => (i % 2 ? a : a.concat([[v, L[i + 1]]])), []);
    return [...document.querySelectorAll('polygon')].filter((e) => kontrol(oku(e.getAttribute('points')))).length;
  });

  /* A. Derleme ve veri güvenliği */
  const h49 = fs.readFileSync(path.join(ROOT, F49), 'utf8'), h48 = fs.readFileSync(path.join(ROOT, F48), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  ok('A1 sürüm V49.0, index.html aynı dosya; V48.0 yedek dosyası duruyor', /V31\.VER="V49\.0"/.test(h49) && /content="V49\.0"/.test(h49) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === h49 && fs.existsSync(path.join(ROOT, F48)));
  ok('A2 içerikler, kazanımlar, kimlikler ve müzik blokları V48.0 ile bayt bayt aynı', JSON.stringify(seeds(h49)) === JSON.stringify(seeds(h48)), Object.keys(seeds(h49)).length + ' blok');
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v49.0'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı (V48.0 dahil)', deg.length === 0, deg.join(';') || 'yalnız v49.0');
  const kod = h49.replace(/<script type="(?:application\/json|text\/plain)" id="[^"]+">[\s\S]*?<\/script>/g, '');
  ok('A4 HTML içinde gizli bilgi yok', !/client_secret|GOCSPX-|BEGIN (RSA )?PRIVATE KEY/.test(kod));

  /* G. Amblemler ve büyük görseller */
  {
    const {p, ctx} = await sayfa({mod: 'normal', sec: true, tema: 'dark'});
    await p.waitForSelector('#uye39 .o42-k'); await p.waitForTimeout(400);
    const g = await p.evaluate(() => {
      const etk = [...document.querySelectorAll('.o42-etk')].map((e) => { const s = e.querySelector('svg.am48'); return {t: e.textContent.trim(), poli: s ? s.querySelectorAll('polygon').length : 0, kulce: s ? [...s.querySelectorAll('polygon')].filter((x) => /url\(#am48s[ouy]\)/.test(x.getAttribute('fill') || '')).length : 0, gunes: s ? s.querySelectorAll('circle[r="4.5"]').length : 0, mavi: s ? [...s.querySelectorAll('polygon')].filter((x) => /^#[0-9a-f]{6}$/i.test(x.getAttribute('fill') || '') && parseInt((x.getAttribute('fill') || '#000000').slice(5, 7), 16) > parseInt((x.getAttribute('fill') || '#000000').slice(1, 3), 16)).length : 0, en: s ? s.getBoundingClientRect().width : 0, boy: s ? s.getBoundingClientRect().height : 0}; });
      const kart = (sel) => { const s = document.querySelector(sel + ' .o42-gor svg.g49'); return s ? {poli: s.querySelectorAll('polygon').length, metin: s.querySelectorAll('text').length, img: document.querySelectorAll(sel + ' .o42-gor img').length, r: s.getBoundingClientRect().height / s.getBoundingClientRect().width} : null; };
      return {etk, kn: kart('.o42-kn'), kp: kart('.o42-kp')};
    });
    const [E, A] = g.etk;
    ok('G1 “Altın” yanında altın külçesi: üç yüzlü metalik prizma (ön, üst, yan yüz), güneş/çiçek simgesi yok', /Altın/.test(A.t) && A.kulce === 3 && A.gunes === 0 && A.boy >= 18, A);
    ok('G2 “Elmas” yanında pırlanta: çok yüzlü kesim (taç + köşk ≥ 20 yüzey), mavi-gümüş tonlar', /Elmas/.test(E.t) && E.poli >= 20 && E.mavi >= 8, E);
    ok('G3 iki büyük alan görseli yeni (V49 vektör kompozisyonları, üzerinde yazı yok, dosya indirmez)', g.kn && g.kp && g.kn.poli > 150 && g.kp.poli > 150 && g.kn.metin === 0 && g.kp.metin === 0 && g.kn.img === 0 && g.kp.img === 0, {kn: g.kn, kp: g.kp});
    await p.screenshot({path: path.join(SH, 'secim-ekrani.png'), fullPage: true});
    const olc = {};
    for (const [w, h] of [[360, 760], [390, 844], [820, 1180]]) { await p.setViewportSize({width: w, height: h}); await bek(300); olc[w] = await p.evaluate(() => [...document.querySelectorAll('.o42-gor')].map((e) => +(e.getBoundingClientRect().height / e.getBoundingClientRect().width).toFixed(3))).then((r) => ({oran: r, tas: 0})); olc[w].tas = await tasma(p); }
    ok('G4 görseller 360 / 390 / 820 px’te kırpılmadan (çerçeve oranı 640:374 = 0,584) ve taşmadan', Object.values(olc).every((x) => x.tas <= 0 && x.oran.every((r) => Math.abs(r - 0.584) < 0.02)), olc);
    await p.screenshot({path: path.join(SH, 'secim-tablet.png')});
    const d = await desen(p, '#uye39');
    ok('G5 açılış ekranı arka planı: sekiz kollu çiçek rozetleri; haç/artı çizgisi ve eski girih yok', d.svg && d.roz >= 8 && !d.hac && !d.yildiz8, d);
    ok('G6 açılış ekranında altı köşeli yıldız / altıgen yok (bütün çokgenler taranır)', (await altiKat(p)) === 0);
    await ctx.close();
  }

  /* M. Motif sistemi iki alanda */
  {
    const bg = {};
    for (const [ad, o, js] of [['elmas-acik', {mod: 'normal', tema: 'light'}, "go('home')"], ['elmas-koyu', {mod: 'normal', tema: 'dark'}, "go('home')"], ['altin-gece', {pt: 'gece'}, "go('psinif',{pg:5})"], ['altin-gunduz', {pt: 'gunduz'}, "go('psinif',{pg:5})"]]) {
      const {p, ctx} = await sayfa(o); await p.evaluate(js); await bek(600);
      bg[ad] = Object.assign(await desen(p, 'body'), {alti: await altiKat(p), gorunur: await p.evaluate(() => [getComputedStyle(document.documentElement, '::before'), getComputedStyle(document.body, '::after')].filter((c) => c.display !== 'none' && /data:image\/svg/.test(c.backgroundImage)).length === 1)});
      bg[ad].ham = await p.evaluate(() => [getComputedStyle(document.documentElement, '::before'), getComputedStyle(document.body, '::after')].filter((c) => c.display !== 'none').map((c) => c.backgroundImage).join('').slice(0, 4000));
      await p.screenshot({path: path.join(SH, 'motif-' + ad + '.png')}); await ctx.close();
    }
    ok('M1 dört görünümde (Elmas açık/koyu, Altın gece/gündüz) arka plan sekiz kollu çiçek rozetleri; haç/artı yok; 6 kat simetri yok', Object.values(bg).every((x) => x.gorunur && x.svg && x.roz >= 8 && !x.hac && x.alti === 0), Object.fromEntries(Object.entries(bg).map(([k, v]) => [k, {gorunur: v.gorunur, roz: v.roz, hac: v.hac, alti: v.alti}])));
    ok('M2 Elmas gümüş/kristal, Altın altın/bronz tonlarında; dört desen birbirinden farklı', new Set(Object.values(bg).map((x) => x.ham)).size === 4 && /%23e9eef5|#e9eef5/i.test(decodeURIComponent(bg['elmas-acik'].ham)) && /f1cf7f/i.test(decodeURIComponent(bg['altin-gece'].ham)));
  }

  /* P. Profilim */
  {
    for (const [ad, o] of [['elmas', {mod: 'normal'}], ['altin', {tema: 'dark'}]]) {
      const {p, ctx} = await sayfa(Object.assign({ek: {'dk-ilerleme39': {ipucu40: 1, fav: {s: [5], k: ['TPC-5-1-01']}, sonSinif: 7}}}, o));
      await p.evaluate(() => { Prog.rec(['DKAB-5-U01-O01'], true); Prog.rec(['DKAB-5-U01-O01'], false); go('profil46'); }); await bek(600);
      const r = await p.evaluate(() => ({ust: !!document.querySelector('.pr49-ust'), ad: (document.querySelector('.pr49-ad b') || {}).textContent, ist: document.querySelectorAll('.pr49-ist .pr49-k').length, halka: (document.querySelector('.pr49-hs') || {}).textContent, hz: [...document.querySelectorAll('.pr49-hz .pr49-h')].map((b) => b.getAttribute('onclick') + '|' + b.querySelector('small').textContent), bos: !!document.querySelector('.pr49-bos .pr49-bk'), sat: [...document.querySelectorAll('.a47-oz')].map((b) => !!b.querySelector('.pr49-si svg')), google: !!document.querySelector('.pr49-hesap button[onclick*="googleGiris"]'), sunucu: !!document.querySelector('.pr49-hesap details'), prog: [...document.querySelectorAll('details.p46-d summary')].map((s) => s.textContent.trim())}));
      ok(`P1 ${ad}: profil kartı, üç istatistik kutusu (kazanım halkası %50), üç hızlı erişim kartı`, r.ust && r.ist === 3 && r.halka === '%50' && r.hz.length === 3 && /calis45/.test(r.hz[0]) && /pilerleme/.test(r.hz[1]) && /7\. sınıf/.test(r.hz[1]) && /pfav/.test(r.hz[2]) && /2 favori/.test(r.hz[2]), r);
      ok(`P2 ${ad}: Bildirimlerim boş durum kartı; Görünüm ve ses satırları simgeli (5); hesap, sunucu, program ve öğretmen/editör bölümleri duruyor`, r.bos && r.sat.length === 5 && r.sat.every(Boolean) && r.google && r.sunucu && r.prog.some((x) => /Program sürümü/.test(x)) && r.prog.some((x) => /Öğretmen ve editör/.test(x)), r);
      const git = [];
      for (const k of ['calis', 'sinif', 'fav']) { await p.evaluate(() => go('profil46')); await bek(300); await p.click(`.pr49-h[data-k=${k}]`); await bek(500); git.push(await p.evaluate(() => view)); }
      ok(`P3 ${ad}: hızlı erişim kartları ilgili ekranları açar`, git.join() === 'calis45,pilerleme,pfav', git);
      await p.evaluate(() => go('profil46')); await bek(300);
      await p.screenshot({path: path.join(SH, 'profil-' + ad + '.png'), fullPage: true});
      await p.setViewportSize({width: 360, height: 760}); await bek(300);
      ok(`P4 ${ad}: Profilim 360 px’te taşmıyor`, (await tasma(p)) <= 0);
      await ctx.close();
    }
  }

  /* E. Eski arayüzün ortaya çıkması (kök neden ve düzeltme) */
  {
    const {p, ctx} = await sayfa({mod: 'normal', tema: 'dark'});
    await p.evaluate(() => go('home')); await bek(500);
    await p.evaluate(() => V42.gec('premium')); await bek(900);
    const a1 = await durum(p);
    await p.goBack(); await bek(900);
    const a2 = await durum(p);
    ok('E1 Elmas ana sayfa → Altın’a geç → geri tuşu: Elmas ana sayfası Elmas’ta açılır; eski (V31) ana sayfa görünmez', a1.v === 'pdunya' && a1.on && a2.v === 'home' && !a2.on && !a2.prem && a2.h46 && !a2.eski && a2.tema === 'dark', {a1, a2});
    await p.evaluate(() => V42.gec('premium')); await bek(900); await p.evaluate(() => go('psinif', {pg: 6})); await bek(600);
    await p.evaluate(() => V42.gec('normal')); await bek(900);
    const b1 = await durum(p); await p.goBack(); await bek(900); const b2 = await durum(p);
    ok('E2 ters yön: Altın sınıf merkezi → Elmas’a geç → geri: Altın sınıf merkezi Altın’da açılır', b1.on === false && b2.v === 'psinif' && b2.on && b2.prem, {b1, b2});
    const g1 = await p.evaluate(() => { V39.on = true; view = 'home'; draw(); return {v: view, d: V49.Duzelt.son}; }); await bek(400);
    const g2 = await p.evaluate(() => { V42.gec('normal'); return 1; }); await bek(700);
    const g3 = await p.evaluate(() => { view = 'pdunya'; draw(); return {v: view, on: !!V39.on, d: V49.Duzelt.son}; });
    ok('E3 güvenlik ağı: rota ile deneyim uyuşmazsa çizimden önce doğru karşılığa çevrilir (her iki yönde)', g1.v === 'pdunya' && g3.v === 'home' && !g3.on, {g1, g3});
    await ctx.close();
    // tema ve yenileme
    const T = await sayfa({mod: 'normal', tema: 'dark', pt: 'gunduz'});
    const t0 = await durum(T.p);
    await T.p.evaluate(() => V42.gec('premium')); await bek(800); const t1 = await durum(T.p);
    await T.p.evaluate(() => V43.ayarla('gece')); await bek(300); const t2 = await durum(T.p);
    await T.p.reload(); await bek(1600); const t3 = await durum(T.p);
    await T.p.evaluate(() => V42.gec('normal')); await bek(800); const t4 = await durum(T.p);
    await T.p.reload(); await bek(1600); const t5 = await durum(T.p);
    await T.p.evaluate(() => { theme(); }); await bek(300); const t6 = await durum(T.p);
    await T.p.evaluate(() => go('profil46')); await bek(300); await T.p.evaluate(() => go('home')); await bek(400); const t7 = await durum(T.p);
    ok('E4 tema değişimi ve yenilemede doğru arayüz korunur (Elmas koyu ↔ Altın gündüz/gece; yenileme; ana sayfaya dönüş)', t0.v === 'home' && t0.tema === 'dark' && t1.prem && t1.v === 'pdunya' && t1.tema === 'light' && t2.tema === 'dark' && t3.prem && t3.v === 'pdunya' && !t4.prem && t4.tema === 'dark' && t4.h46 && !t5.prem && t5.v === 'home' && t5.h46 && t6.tema === 'light' && !t6.prem && t7.h46 && !t7.eski, {t0, t1, t2, t3, t4, t5, t6, t7});
    await T.ctx.close();
    // Altın içinde gezinme ve geri tuşu: eski arayüz hiç görünmez
    const N = await sayfa({tema: 'light', pt: 'gunduz'});
    const iz = [];
    for (const js of ["go('psinif',{pg:5})", "go('pders',{pt:'TPC-5-1-01',ptab:'anlat'})", "go('profil46')", "go('calis45')", "go('home')", 'BACK', 'BACK', 'BACK', 'BACK']) { if (js === 'BACK') await N.p.goBack(); else await N.p.evaluate(js); await bek(700); const d = await durum(N.p); iz.push(d.v + (d.eski ? '!ESKI' : '') + (d.on ? '' : '!elmas')); }
    ok('E5 Altın’da sınıf, ders, profil, çalışma, ana sayfa ve dört geri adım: hep Altın arayüzü, eski ana sayfa yok', iz.every((x) => !/!/.test(x)), iz);
    await N.p.screenshot({path: path.join(SH, 'altin-gunduz-geri.png')});
    await N.ctx.close();
  }

  /* R. Önceki özellikler */
  {
    const prog = {'DKAB-5-U01-O01': {userId: 'local', outcomeId: 'DKAB-5-U01-O01', mastery: 0.5, correct: 1, wrong: 1}};
    const {p, ctx} = await sayfa({mod: 'normal', ek: {'dk2': {prog, wrong: {'Q-DKAB-5-0001': {n: 1}}}, 'dk-calis45': {v: 1, hedef: 30, gun: {}}, 'dk-atm': {vol: .5, L: [], fav: ['brown'], saved: [], favMix: [], queue: []}}});
    const h = await p.evaluate(() => ({prog: Store.ov.prog['DKAB-5-U01-O01'].correct, wr: Object.keys(Store.ov.wrong).length, hedef: V45.Calis.oku().hedef, fav: ATM.st.fav.join(), hesap: V46.Hesap.oku().mod, fn: ['googleGiris', 'misafir', 'esitle'].every((f) => typeof V46.Hesap[f] === 'function')}));
    ok('R1 ilerleme, favori ses ve hedef kayıtları korunur; Google/misafir giriş işlevleri yerinde', h.prog === 1 && h.wr === 1 && h.hedef === 30 && h.fav === 'brown' && h.hesap === 'misafir' && h.fn, h);
    const yer = [];
    for (const [ad, js] of [['ana', "go('home')"], ['siniflar', "go('classes')"], ['sinif', "go('grade',{g:5})"], ['konu', "go('topic',{t:'TPC-5-1-01',tab:'anlat'})"], ['oyunlar', "go('games')"], ['calis', "go('calis45')"], ['ayar', "go('ayar47',{at:'ses'})"], ['ogretmen', "go('ogretmen')"], ['test', "G.tq={mode:'mini',g:5,u:'',t:'TPC-5-1-01',n:5};V30.tqStart()"]]) { if (ad === 'test') { await p.evaluate(() => go('ogretmen')); await bek(500); var og = await p.evaluate(() => ({v: view, pin: !!document.querySelector('input[inputmode=numeric]')})); } await p.evaluate(js); await bek(500); yer.push(ad + ':' + (await p.evaluate(() => document.getElementById('app').innerText.length > 60)) + ':' + (await tasma(p))); }
    ok('R2 Elmas ekranları (ana, sınıflar, konu, oyunlar, çalışma, ayarlar, öğretmen paneli, test) açılır, taşma yok', yer.every((x) => /:true:(0|-\d+)$/.test(x)), yer);
    ok('R3 öğretmen paneli PIN istemeden açılıyor', og.v === 'ogretmen' && !og.pin, og);
    await ctx.close();
    const A = await sayfa({tema: 'dark'});
    const ay = [];
    for (const [ad, js] of [['koridor', "go('pdunya')"], ['sinif', "go('psinif',{pg:7})"], ['ders', "go('pders',{pt:'TPC-5-1-01',ptab:'test'})"], ['oyun', "go('poyun')"], ['kutuphane', "go('poyna',{oyn:'kutuphane',obol:'',odevam:0})"], ['ilerleme', "go('pilerleme')"]]) { await A.p.evaluate(js); await bek(800); ay.push(ad + ':' + (await A.p.evaluate(() => view)) + ':' + (await tasma(A.p))); }
    ok('R4 Altın ekranları (koridor, sınıf, ders, Oyun Dünyası, Kütüphane, ilerleme) açılır, taşma yok', ay.every((x) => /:(0|-\d+)$/.test(x)), ay);
    await A.p.evaluate(() => go('pdunya')); await bek(1000); await A.p.screenshot({path: path.join(SH, 'altin-koridor.png')});
    await A.ctx.close();
  }

  ok('P0 testler boyunca sayfada JavaScript hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); srv.close();
  const g = S.filter((x) => x.ok).length; console.log(`\nToplam: ${g}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), sonuc: S}, null, 1));
  process.exitCode = g === S.length ? 0 : 1;
})().catch((e) => { console.error(e); process.exit(1); });
