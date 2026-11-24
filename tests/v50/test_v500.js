// V50.0 testleri (depo kökünden): node tests/v50/test_v500.js
// Yerel http sunucusu + başsız Chromium. Hafif mod (dk-lite) açıkça ayarlanır. Ekran görüntüleri: docs/V50.0_ekran/
// Geri tuşu gerçek tarayıcı geçmişiyle (page.goBack). Tarayıcı otomasyonu gerçek cihaz testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const F50 = 'surumler/din-kulturu-platformu-v50.0.html', F49 = 'surumler/din-kulturu-platformu-v49.0.html';
const SH = path.join(ROOT, 'docs', 'V50.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [];
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = () => 'http://127.0.0.1:' + srv.address().port + '/' + F50;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, lite: '1', mod: 'normal', tema: 'light', pt: 'gece', sec: false, ek: null}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', o.lite); localStorage.setItem('dk-theme', o.tema); localStorage.setItem('dk-ptema43', o.pt); if (!o.sec) localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1, fav: {s: [7], k: ['TPC-5-1-01']}, sonSinif: 7})); if (o.ek) Object.entries(o.ek).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL()); await p.waitForTimeout(1500);
    return {p, ctx};
  };
  const tasma = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const durum = (p) => p.evaluate(() => ({mod: V50.Mod.aktif(), v: view, on: !!V39.on, prem: document.body.hasAttribute('data-prem39'), ogrt: document.body.hasAttribute('data-ogrt37'), ogrOturum: V36.ok(), tema: document.documentElement.dataset.theme, eski: !!document.querySelector('.h30-hello') && !document.querySelector('.h46'), son: JSON.parse(localStorage.getItem('dk-mod50') || 'null'), deneyim: JSON.parse(localStorage.getItem('dk-deneyim39') || '{}').son, bn: !!document.querySelector('#bn50:not([hidden])')}));
  const gec = async (p, k) => { await p.evaluate((k) => V50.Mod.gec(k), k); await bek(1100); };
  const tutarli = (d) => (d.mod === 'altin' ? d.on && (d.prem || ['ogretmen'].includes(d.v) === false) : d.mod === 'elmas' ? !d.on && !d.prem : d.ogrt && d.ogrtOturum !== false) && !d.eski;

  /* A. Derleme ve veri güvenliği */
  const h50 = fs.readFileSync(path.join(ROOT, F50), 'utf8'), h49 = fs.readFileSync(path.join(ROOT, F49), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s49 = seeds(h49), s50 = seeds(h50);
  ok('A1 sürüm V50.0, index.html aynı dosya; V49.0 yedek dosyası duruyor', /V31\.VER="V50\.0"/.test(h50) && /content="V50\.0"/.test(h50) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === h50 && fs.existsSync(path.join(ROOT, F49)));
  ok('A2 içerik, kazanım, kimlik ve müzik blokları V49.0 ile bayt bayt aynı; yalnız iki görsel bloğu eklendi', Object.entries(s49).every(([k, v]) => s50[k] === v) && Object.keys(s50).filter((k) => !s49[k]).sort().join() === 'g50-altin,g50-elmas', Object.keys(s50).length + ' blok');
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v50.0'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı (V49.0 dahil)', deg.length === 0, deg.join(';') || 'yalnız v50.0');
  // gömülü görsel = depodaki WebP = orijinalden yalnız boyutu küçültülmüş kopya
  const webp = (ad) => fs.readFileSync(path.join(ROOT, 'tools', 'v50', 'gorsel', ad + '.webp')).toString('base64');
  ok('A4 gömülü görseller depodaki WebP dosyalarıyla aynı (kaynak: kaynaklar/v50-gorsel/*.png)', h50.includes(`id="g50-elmas">${webp('elmas')}<`) && h50.includes(`id="g50-altin">${webp('altin')}<`) && fs.existsSync(path.join(ROOT, 'kaynaklar', 'v50-gorsel', 'elmas-kutuphane.png')) && fs.existsSync(path.join(ROOT, 'kaynaklar', 'v50-gorsel', 'altin-kutuphane.png')));

  /* G. Görseller (madde 10, 11) */
  {
    const {p, ctx} = await sayfa({sec: true, tema: 'dark'});
    await p.waitForSelector('#uye39 .o42-k'); await bek(500);
    const g = await p.evaluate(() => { const i = (sel) => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); return {src: e.src.slice(0, 5), w: e.naturalWidth, h: e.naturalHeight, filtre: c.filter, fit: c.objectFit, yuk: e.complete && e.naturalWidth > 0, radius: getComputedStyle(e.parentElement).borderRadius}; }; return {elmas: i('.o42-kn .o42-gor img.g50-elmas'), altin: i('.o42-kp .o42-gor img.g50-altin'), capraz: !!document.querySelector('.o42-kn .g50-altin, .o42-kp .g50-elmas'), ortu: [...document.querySelectorAll('.o42-isik')].filter((e) => getComputedStyle(e).display !== 'none').length, yazi: document.querySelectorAll('.o42-gor text').length}; });
    ok('G1 Elmas kütüphane görseli Elmas kartında, Altın kütüphane görseli Altın kartında (yüklendi, 1280×720)', g.elmas && g.altin && g.elmas.yuk && g.altin.yuk && g.elmas.w === 1280 && g.altin.w === 1280 && !g.capraz, g);
    ok('G2 görsellerde filtre ve üst örtü yok; köşeler yuvarlatılmış; üzerinde yazı yok', g.elmas.filtre === 'none' && g.altin.filtre === 'none' && g.ortu === 0 && g.yazi === 0 && parseFloat(g.elmas.radius) >= 12, g);
    await p.screenshot({path: path.join(SH, 'secim-ekrani.png'), fullPage: true});
    const olc = {};
    for (const [w, h] of [[360, 760], [390, 844], [820, 1180], [1280, 800]]) { await p.setViewportSize({width: w, height: h}); await bek(300); olc[w] = await p.evaluate(() => [...document.querySelectorAll('.o42-gor')].map((e) => { const r = e.getBoundingClientRect(), i = e.querySelector('img').getBoundingClientRect(); return {oran: +(r.width / r.height).toFixed(3), tam: Math.abs(i.width - r.width) < 3 && Math.abs(i.height - r.height) < 3 && Math.abs(i.width / i.height - 1.778) < 0.02}; })); olc[w].tas = await tasma(p); }
    ok('G3 360 / 390 / 820 / 1280 px’te görsel çerçevesi görselin kendi oranında (16:9 → kırpılmaz, bozulmaz), taşma yok', Object.values(olc).every((L) => L.tas <= 0 && L.every((x) => Math.abs(x.oran - 1.778) < 0.02 && x.tam)), olc);
    await p.setViewportSize({width: 820, height: 1180}); await bek(200); await p.screenshot({path: path.join(SH, 'secim-tablet.png')});
    await ctx.close();
  }

  /* M. Mod geçişleri (madde 1–6) */
  {
    const {p, ctx} = await sayfa({tema: 'dark'});
    const iz = [];
    await gec(p, 'ogretmen'); iz.push(['Elmas→Öğretmen', await durum(p)]);
    await gec(p, 'altin'); iz.push(['Öğretmen→Altın', await durum(p)]);
    await gec(p, 'elmas'); iz.push(['Altın→Elmas', await durum(p)]);
    await gec(p, 'altin'); iz.push(['Elmas→Altın', await durum(p)]);
    await gec(p, 'ogretmen'); iz.push(['Altın→Öğretmen', await durum(p)]);
    await gec(p, 'elmas'); iz.push(['Öğretmen→Elmas', await durum(p)]);
    const d = Object.fromEntries(iz);
    ok('M1 Öğretmen → Altın: Altın açılır, öğretmen oturumu kapanır, renkler Altın', d['Öğretmen→Altın'].mod === 'altin' && d['Öğretmen→Altın'].on && d['Öğretmen→Altın'].prem && !d['Öğretmen→Altın'].ogrt && !d['Öğretmen→Altın'].ogrOturum, d['Öğretmen→Altın']);
    ok('M2 Öğretmen → Elmas: Elmas açılır, Elmas teması (koyu) geri gelir', d['Öğretmen→Elmas'].mod === 'elmas' && !d['Öğretmen→Elmas'].on && !d['Öğretmen→Elmas'].prem && !d['Öğretmen→Elmas'].ogrt && d['Öğretmen→Elmas'].tema === 'dark' && !d['Öğretmen→Elmas'].eski, d['Öğretmen→Elmas']);
    ok('M3 Altın → Elmas', d['Altın→Elmas'].mod === 'elmas' && !d['Altın→Elmas'].prem && d['Altın→Elmas'].v === 'home' && d['Altın→Elmas'].tema === 'dark', d['Altın→Elmas']);
    ok('M4 Elmas → Altın (ve Elmas/Altın → Öğretmen)', d['Elmas→Altın'].mod === 'altin' && d['Elmas→Altın'].prem && d['Elmas→Öğretmen'].mod === 'ogretmen' && d['Elmas→Öğretmen'].ogrt && d['Altın→Öğretmen'].mod === 'ogretmen', {a: d['Elmas→Altın'], b: d['Elmas→Öğretmen']});
    ok('M5 son mod tercihi her geçişte kaydedilir (dk-mod50; Elmas/Altın için dk-deneyim39 da)', iz.every(([, x]) => x.son && x.son.son === x.mod) && d['Altın→Elmas'].deneyim === 'normal' && d['Elmas→Altın'].deneyim === 'premium', iz.map(([a, x]) => a + ':' + (x.son || {}).son));
    await ctx.close();
    // Profilim üzerinden (madde 5)
    const pr = [];
    for (const [bas, k] of [['normal', 'altin'], ['premium', 'elmas'], ['normal', 'ogretmen']]) {
      const P = await sayfa({mod: bas}); await P.p.evaluate(() => go('profil46')); await bek(500);
      const kart = await P.p.evaluate(() => ({var: !!document.querySelector('.md50-p .mk50'), n: document.querySelectorAll('.md50-p .mk50-k').length, on: (document.querySelector('.md50-p .mk50-k.on b') || {}).textContent, satir: [...document.querySelectorAll('.a47-oz')].some((b) => /at:'alan'/.test(b.getAttribute('onclick') || ''))}));
      if (bas === 'normal' && k === 'altin') await P.p.screenshot({path: path.join(SH, 'profil-ogrenme-modum.png'), fullPage: true});
      await P.p.click(`.md50-p .mk50-k.${k}`); await bek(1100);
      pr.push({bas, k, kart, d: await durum(P.p)}); await P.ctx.close();
    }
    ok('M6 Profilim › Öğrenme Modum: üç mod kartı, etkin mod işaretli; tıklayınca o moda geçer; Görünüm’deki ayrı “Öğrenme alanı” satırı kaldırıldı', pr.every((x) => x.kart.var && x.kart.n === 3 && !x.kart.satir && x.d.mod === x.k) && pr[0].kart.on === 'Elmas Sınıfı' && pr[1].kart.on === 'Altın Sınıfı', pr.map((x) => x.bas + '→' + x.k + ':' + x.d.mod + ' etkin=' + x.kart.on));
    // üst menü üzerinden (madde 6)
    const um = [];
    for (const [bas, js, sec, k] of [['normal', "go('home')", 'header.top .md50', 'altin'], ['premium', "go('pdunya')", '.ust40 .md50', 'elmas'], ['premium', "go('psinif',{pg:7})", '.p39-top .md50', 'ogretmen'], ['normal', "go('ogretmen')", '.og-top .md50', 'altin']]) {
      const P = await sayfa({mod: bas}); await P.p.evaluate(js); await bek(700);
      const dug = await P.p.evaluate((sec) => { const L = [...document.querySelectorAll('.md50')].filter((e) => e.getBoundingClientRect().width > 0); const e = document.querySelector(sec); return {n: L.length, var: !!e, etiket: e && e.getAttribute('aria-label'), boy: e && Math.round(e.getBoundingClientRect().height)}; }, sec);
      await P.p.click(sec); await bek(500);
      const panel = await P.p.evaluate(() => ({kart: document.querySelectorAll('.mk50-sheet .mk50-k').length, on: (document.querySelector('.mk50-sheet .mk50-k.on b') || {}).textContent, aciklama: [...document.querySelectorAll('.mk50-sheet .mk50-k small')].every((s) => s.textContent.length > 20)}));
      if (bas === 'normal' && js === "go('home')") await P.p.screenshot({path: path.join(SH, 'mod-paneli-elmas.png')});
      if (js === "go('psinif',{pg:7})") await P.p.screenshot({path: path.join(SH, 'mod-paneli-altin.png')});
      await P.p.click(`.mk50-sheet .mk50-k.${k}`); await bek(1100);
      um.push({bas, js, dug, panel, d: await durum(P.p), k}); await P.ctx.close();
    }
    ok('M7 her modun üst menüsünde tek bir mod düğmesi (Elmas üst çubuğu, Altın koridoru ve sınıf merkezi, öğretmen paneli); ≥40 px', um.every((x) => x.dug.var && x.dug.n === 1 && x.dug.boy >= 40 && /Mod değiştir/.test(x.dug.etiket)), um.map((x) => x.js + ' n=' + x.dug.n + ' ' + x.dug.boy));
    ok('M8 düğme ortak paneli açar: üç mod kartı, açıklamalar, etkin mod işaretli; seçilen moda geçilir', um.every((x) => x.panel.kart === 3 && x.panel.aciklama && x.d.mod === x.k) && um[0].panel.on === 'Elmas Sınıfı' && um[1].panel.on === 'Altın Sınıfı' && um[3].panel.on === 'Öğretmen Modu', um.map((x) => x.panel.on + '→' + x.d.mod));
    // ayarlar da aynı bileşen
    const A = await sayfa({}); await A.p.evaluate(() => go('ayar47', {at: 'alan'})); await bek(500);
    const ay = await A.p.evaluate(() => ({n: document.querySelectorAll('#a47b .mk50-k').length, eski: document.querySelectorAll('#a47b .a47-dk').length}));
    ok('M9 Görünüm ve ses › Öğrenme alanı aynı ortak mod kartlarını kullanır (ayrı mod yönetimi yok)', ay.n === 3 && ay.eski === 0, ay);
    await A.ctx.close();
  }

  /* N. Geri tuşu, yenileme, veriler (madde 7–9) */
  {
    const {p, ctx} = await sayfa({mod: 'normal', tema: 'dark', ek: {'dk2': {prog: {'DKAB-7-U01-O01': {userId: 'local', outcomeId: 'DKAB-7-U01-O01', mastery: 0.5, correct: 1, wrong: 1}}, wrong: {'Q-DKAB-5-0001': {n: 1}}}, 'dk-calis45': {v: 1, hedef: 30, gun: {}}}});
    await p.evaluate(() => go('grade', {g: 7})); await bek(500);
    await gec(p, 'altin'); const a1 = await durum(p); const sinif = await p.evaluate(() => ({v: view, pg: G.pg}));
    ok('N1 seçili sınıf korunur: Elmas 7. sınıf → Altın 7. Sınıf Merkezi', sinif.v === 'psinif' && +sinif.pg === 7 && a1.mod === 'altin', sinif);
    const geri = [];
    await p.goBack(); await bek(1200); geri.push(await durum(p));
    ok('N2 Android geri tuşu: mod değişmez (Altın kalır); aynı ekrana denk gelen kayıt (7. sınıf) atlanır, bir önceki ekran (ana sayfa) Altın karşılığıyla (koridor) açılır; eski arayüz yok', geri.every((x) => x.mod === 'altin' && x.on && x.v === 'pdunya' && !x.eski), geri.map((x) => x.v + ':' + x.mod + ':' + x.prem));
    await gec(p, 'ogretmen'); await p.goBack(); await bek(900); const g2 = await durum(p);
    await gec(p, 'elmas'); await p.goBack(); await bek(900); const g3 = await durum(p);
    ok('N3 öğretmen modundan ve Elmas’a geçtikten sonra geri: önceki mod etkinleşmez, tema doğru', g3.mod === 'elmas' && !g3.prem && !g3.ogrt && g3.tema === 'dark' && !g3.eski, {g2, g3});
    await p.evaluate(() => go('calis45')); await bek(400); await p.evaluate(() => scrollTo(0, 500)); await bek(200);
    await gec(p, 'altin'); const ortak = await p.evaluate(() => ({v: view, y: scrollY}));
    ok('N4 ortak ekranlar (Çalışma Merkezim, Profilim, ayarlar) mod değişince aynı ekranda ve konumda kalır', ortak.v === 'calis45' && ortak.y > 300, ortak);
    const veri = await p.evaluate(() => ({prog: Store.ov.prog['DKAB-7-U01-O01'].correct, wrong: Object.keys(Store.ov.wrong).length, hedef: V45.Calis.oku().hedef, fav: JSON.stringify(V39.ilr().fav), son: V39.ilr().sonSinif}));
    ok('N5 ilerleme, yanlışlar, günlük hedef, favoriler ve son sınıf bütün geçişlerden sonra korunur', veri.prog === 1 && veri.wrong === 1 && veri.hedef === 30 && /TPC-5-1-01/.test(veri.fav) && +veri.son === 7, veri);
    await ctx.close();
    // yenileme
    const Y = [];
    for (const k of ['altin', 'elmas', 'ogretmen']) { const P = await sayfa({mod: 'normal', tema: 'dark'}); await gec(P.p, k); await P.p.reload(); await bek(1800); Y.push({k, d: await durum(P.p)}); await P.ctx.close(); }
    ok('N6 sayfa yenilenince son mod korunur (Altın, Elmas; öğretmen oturumu sürüyorsa Öğretmen Modu)', Y.every((x) => x.d.mod === x.k) && Y[0].d.prem && !Y[1].d.prem && Y[1].d.tema === 'dark' && Y[2].d.ogrt, Y.map((x) => x.k + '→' + x.d.mod + ':' + x.d.v));
  }

  /* T. Animasyon, Altın alt menüsü, tasarım (madde 10) */
  {
    const {p, ctx} = await sayfa({lite: '0'});
    const an = await p.evaluate(async () => { V50.Mod.gec('altin'); await new Promise((r) => setTimeout(r, 300)); const o = document.getElementById('gc50'); const s = o && {sinif: o.className, op: getComputedStyle(o).opacity}; await new Promise((r) => setTimeout(r, 900)); return {s, son: document.getElementById('gc50').className}; });
    ok('T1 geçiş animasyonu: Altın’a sıcak altın ışık katmanı kısa sürede gelip gider (toplam < 1 sn)', an.s && /altin/.test(an.s.sinif) && an.son === 'gc50', an);
    await ctx.close();
    const R = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, reducedMotion: 'reduce'});
    await R.addInitScript(() => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); });
    const rp = await R.newPage(); await rp.goto(URL()); await bek(1500);
    const rz = await rp.evaluate(async () => { V50.Mod.gec('altin'); await new Promise((r) => setTimeout(r, 300)); const o = document.getElementById('gc50'); return {katman: !!o && /gir|cik/.test(o.className), mod: V50.Mod.aktif()}; });
    ok('T2 “hareketi azalt” açıkken animasyon yapılmaz, geçiş anında olur', !rz.katman && rz.mod === 'altin', rz);
    await R.close();
    const A = await sayfa({mod: 'premium', tema: 'dark'});
    const nv = [];
    for (const [js, k] of [["go('psinif',{pg:5})", 'sinif'], ["go('poyun')", 'oyun'], ["go('calis45')", 'calis'], ["go('profil46')", 'profil'], ["go('pdunya')", null], ["go('poyna',{oyn:'kutuphane',obol:'',odevam:0})", 'oyun']]) { await A.p.evaluate(js); await bek(700); nv.push({js, k, n: await A.p.evaluate(() => { const n = document.getElementById('bn50'); return n && !n.hidden ? {on: (n.querySelector('.on') || {dataset: {}}).dataset.k, adet: n.querySelectorAll('button').length} : null; })}); }
    ok('T3 Altın alt menüsü (Koridor · Sınıfım · Oyunlar · Çalışmam · Profilim) sınıf, oyun, çalışma ve profil ekranlarında; koridorda gizli; etkin sekme doğru', nv.slice(0, 4).every((x) => x.n && x.n.adet === 5 && x.n.on === x.k) && nv[4].n === null, nv.map((x) => x.js.slice(0, 20) + ':' + JSON.stringify(x.n)));
    await A.p.evaluate(() => go('psinif', {pg: 5})); await bek(500); await A.p.click('#bn50 [data-k=calis]'); await bek(600);
    const nvg = await A.p.evaluate(() => view);
    await A.p.evaluate(() => go('calis45')); await bek(300); await A.p.evaluate(() => scrollTo(0, 1e6)); await bek(400);
    const ust = await A.p.evaluate(() => { const n = document.getElementById('bn50').getBoundingClientRect(), L = [...document.querySelectorAll('#app button,#app p')].filter((e) => e.offsetParent), son = L[L.length - 1].getBoundingClientRect(); return {nav: Math.round(n.top), son: Math.round(son.bottom)}; });
    ok('T4 Altın alt menüsü çalışır ve sayfa sonundaki içeriğin üstünü kapatmaz', nvg === 'calis45' && ust.son <= ust.nav + 1, {nvg, ust});
    await A.p.evaluate(() => go('profil46')); await bek(400); await A.p.screenshot({path: path.join(SH, 'altin-profil-alt-menu.png')});
    await A.ctx.close();
    // mobil / tablet taşma
    const ts = [];
    for (const [w, h] of [[360, 760], [820, 1180]]) for (const mod of ['normal', 'premium']) {
      const P = await sayfa({mod, w, h});
      for (const js of ["go('profil46')", "V50.Mod.ac()", mod === 'normal' ? "go('home')" : "go('psinif',{pg:5})", "go('ogretmen')"]) { await P.p.evaluate(js); await bek(500); ts.push(`${w}/${mod}/${js.slice(0, 18)}:${await tasma(P.p)}`); await P.p.evaluate(() => { try { UI.close(); } catch (e) {} }); await bek(200); }
      if (w === 820 && mod === 'premium') { await P.p.evaluate(() => go('profil46')); await bek(400); await P.p.screenshot({path: path.join(SH, 'tablet-altin-profil.png')}); }
      await P.ctx.close();
    }
    ok('T5 360 px telefon ve 820 px tablette (Elmas/Altın) profil, mod paneli, ana ekran ve öğretmen paneli taşmıyor', ts.every((x) => /:(0|-\d+)$/.test(x)), ts.filter((x) => !/:(0|-\d+)$/.test(x)));
  }

  /* R. Önceki özellikler */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    const yer = [];
    for (const [ad, js] of [['siniflar', "go('classes')"], ['konu', "go('topic',{t:'TPC-5-1-01',tab:'anlat'})"], ['oyunlar', "go('games')"], ['test', "G.tq={mode:'mini',g:5,u:'',t:'TPC-5-1-01',n:5};V30.tqStart()"], ['calis', "go('calis45')"], ['editor', "go('editor')"], ['ses', "go('ayar47',{at:'ses'})"]]) { await p.evaluate(js); await bek(500); yer.push(ad + ':' + (await p.evaluate(() => document.getElementById('app').innerText.length > 60)) + ':' + (await tasma(p))); }
    ok('R1 önceki ekranlar açılır (sınıflar, konu, oyunlar, test, çalışma, editör, ses), taşma yok', yer.every((x) => /:true:(0|-\d+)$/.test(x)), yer);
    const f = await p.evaluate(() => ({hesap: ['googleGiris', 'misafir', 'esitle'].every((k) => typeof V46.Hesap[k] === 'function'), bildir: typeof V48.Bildir.ac === 'function', ses: typeof V48.SesPanel.html === 'function', duzelt: typeof V49.Duzelt.uyum === 'function'}));
    ok('R2 hesap (Google/misafir), bildirim, ses paneli ve V49 karışma düzeltmesi yerinde', Object.values(f).every(Boolean), f);
    await ctx.close();
  }

  ok('P0 testler boyunca sayfada JavaScript hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); srv.close();
  const g = S.filter((x) => x.ok).length; console.log(`\nToplam: ${g}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), sonuc: S}, null, 1));
  process.exitCode = g === S.length ? 0 : 1;
})().catch((e) => { console.error(e); process.exit(1); });
