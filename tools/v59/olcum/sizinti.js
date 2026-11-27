const {chromium} = require('playwright'); const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..', '..'), F = process.argv[2];
(async () => {
  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  await ctx.addInitScript(() => { if (!localStorage.getItem('__s')) { localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '0'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: 5}}})); } sessionStorage.setItem('dk-editor-oturum38', '1'); });
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:' + st.address().port + '/' + F); await p.waitForTimeout(3000);
  const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable'); await cdp.send('HeapProfiler.enable');
  const m = async (ad) => { await cdp.send('HeapProfiler.collectGarbage'); await p.waitForTimeout(1500); await cdp.send('HeapProfiler.collectGarbage'); const x = (await cdp.send('Performance.getMetrics')).metrics; const g = (n) => x.find((y) => y.name === n).value; console.log(ad, 'Nodes', g('Nodes'), 'L', g('JSEventListeners'), 'dom', await p.evaluate(() => document.getElementsByTagName('*').length)); };
  const tur = (n) => p.evaluate(async (n) => { for (let i = 0; i < n; i++) { go('grade', {g: 4 + (i % 9)}); await new Promise((r) => setTimeout(r, 120)); go('home'); await new Promise((r) => setTimeout(r, 120)); } }, n);
  await m('0'); await tur(20); await m('40'); await tur(20); await m('80'); await tur(20); await m('120');
  if (process.argv[3]) { await p.evaluate(process.argv[3]); await m('sonra:' + process.argv[3]); }
  await b.close(); st.close();
})();
