// node perf.js <html yolu> [etiket]  — 4x CPU yavaşlatma, telefon görünümü; açılış, ekran geçişleri, bellek, zamanlayıcılar
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..', '..'), F = process.argv[2], ET = process.argv[3] || F, TEKRAR = +(process.argv[4] || 3);
(async () => {
  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const b = await chromium.launch({args: ['--enable-precise-memory-info', '--js-flags=--expose-gc']});
  const sonuc = [];
  for (let k = 0; k < TEKRAR; k++) {
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(() => {
      if (!localStorage.getItem('__s')) { localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '0'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: 5}}})); localStorage.setItem('dk-gorunum54', JSON.stringify({v: 1, altin: 1})); }
      sessionStorage.setItem('dk-editor-oturum38', '1');
      window.__olc = {iv: 0, to: 0, ls: 0, lsB: 0, raf: 0};
      const si = setInterval, stt = setTimeout, raf = requestAnimationFrame;
      window.setInterval = function () { __olc.iv++; return si.apply(this, arguments); };
      window.setTimeout = function () { __olc.to++; return stt.apply(this, arguments); };
      window.requestAnimationFrame = function () { __olc.raf++; return raf.apply(this, arguments); };
      const sI = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (this === localStorage) { __olc.ls++; __olc.lsB += String(v).length; } return sI.apply(this, arguments); };
      window.__t0 = performance.now();
    });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4}); await cdp.send('Performance.enable');
    const t0 = Date.now();
    await p.goto('http://127.0.0.1:' + st.address().port + '/' + F);
    await p.waitForFunction(() => !document.getElementById('boot36') && typeof draw === 'function', null, {timeout: 120000});
    const acilis = Date.now() - t0;
    const nav = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return {dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd)}; });
    await p.waitForTimeout(1500);
    // ekran geçişleri: draw süresi (go → çizim tamam), uzun görevler
    const gecis = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms)), o = {};
      const olc = async (ad, f) => { const a = performance.now(); try { f(); } catch (e) { o[ad] = 'yok'; return; } await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); o[ad] = Math.round(performance.now() - a); await bk(400); };
      await olc('home', () => go('home'));
      await olc('grade', () => go('grade', {g: 5}));
      await olc('topic', () => go('topic', {t: 'TPC-5-1-01', tab: 'anlat'}));
      await olc('games', () => go('games'));
      await olc('calis45', () => go('calis45'));
      await olc('profil46', () => go('profil46'));
      await olc('atlas57', () => go('atlas57'));
      await olc('home2', () => go('home'));
      // Altın
      try { V51.Yonetici.tamam = () => true; } catch (e) {}
      if (!(window.V53 && V53.Onizleme)) return o; const a = performance.now(); V53.Onizleme.baslat(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); o.altinGecis = Math.round(performance.now() - a); await bk(1500);
      await olc('pdunya', () => go('pdunya')); await bk(600);
      await olc('psinif', () => go('psinif', {pg: 5}));
      await olc('pders', () => go('pders', {pt: 'TPC-5-1-01', ptab: 'anlat'}));
      await olc('poyun', () => go('poyun'));
      await olc('aprofil', () => go('profil46'));
      await olc('acalis', () => go('acalis53'));
      await olc('pdunya2', () => go('pdunya')); await bk(600);
      const b2 = performance.now(); V50.Mod.gec('ogretmen'); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); o.ogretmenGecis = Math.round(performance.now() - b2); await bk(800);
      const c2 = performance.now(); V50.Mod.gec('elmas'); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); o.elmasGecis = Math.round(performance.now() - c2); await bk(800);
      return o;
    });
    // uzun kullanım: 40 geçiş sonrası bellek ve DOM
    const m0 = await cdp.send('Performance.getMetrics');
    await p.evaluate(async () => { for (let i = 0; i < 20; i++) { go('grade', {g: 4 + (i % 9)}); await new Promise((r) => setTimeout(r, 120)); go('home'); await new Promise((r) => setTimeout(r, 120)); } });
    // tam çöp toplama (window.gc() yalnız JS yığınını toplar; kopuk DOM düğümleri sayaçta kalabiliyordu)
    await cdp.send('HeapProfiler.collectGarbage'); await p.waitForTimeout(1500); await cdp.send('HeapProfiler.collectGarbage');
    const m1 = await cdp.send('Performance.getMetrics');
    const M = (m) => Object.fromEntries(m.metrics.filter((x) => ['JSHeapUsedSize', 'Nodes', 'JSEventListeners', 'LayoutCount', 'RecalcStyleCount', 'TaskDuration', 'ScriptDuration'].includes(x.name)).map((x) => [x.name, x.name.endsWith('Size') ? Math.round(x.value / 1048576 * 10) / 10 : Math.round(x.value * 100) / 100]));
    const say = await p.evaluate(() => Object.assign({}, __olc, {lsAnahtar: Object.keys(localStorage).length}));
    sonuc.push({acilis, nav, gecis, bellekOnce: M(m0), bellek40: M(m1), sayac: say});
    await ctx.close();
  }
  const ort = (f) => { const L = sonuc.map(f); return L.some((x) => typeof x !== 'number') ? L[0] : Math.round(L.reduce((a, b) => a + b, 0) / L.length); };
  const ozet = {etiket: ET, tekrar: TEKRAR, acilis: ort((x) => x.acilis), dcl: ort((x) => x.nav.dcl), gecis: Object.fromEntries(Object.keys(sonuc[0].gecis).map((k) => [k, ort((x) => x.gecis[k])])), bellekOnce: sonuc[0].bellekOnce, bellek40: sonuc[0].bellek40, sayac: sonuc[0].sayac};
  console.log(JSON.stringify(ozet));
  fs.writeFileSync(__dirname + '/sonuc/perf-' + ET.replace(/\W+/g, '_') + '.json', JSON.stringify({ozet, sonuc}, null, 1));
  await b.close(); st.close();
})();
