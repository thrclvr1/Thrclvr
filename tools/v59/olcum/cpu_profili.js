// node cpu.js <html> <adım>  : CPU profili, işlev bazında öz süre (4x yavaş)
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..', '..'), F = process.argv[2], ADIM = process.argv[3] || 'acilis';
(async () => {
  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  await ctx.addInitScript(() => { if (!localStorage.getItem('__s')) { localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '0'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: 5}}})); localStorage.setItem('dk-gorunum54', JSON.stringify({v: 1, altin: 1})); } sessionStorage.setItem('dk-editor-oturum38', '1'); });
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4}); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {interval: 200});
  const url = 'http://127.0.0.1:' + st.address().port + '/' + F;
  let prof;
  if (ADIM === 'acilis') { await cdp.send('Profiler.start'); await p.goto(url); await p.waitForFunction(() => !document.getElementById('boot36') && typeof draw === 'function', null, {timeout: 120000}); await p.waitForTimeout(500); prof = (await cdp.send('Profiler.stop')).profile; }
  else {
    await p.goto(url); await p.waitForFunction(() => !document.getElementById('boot36') && typeof draw === 'function', null, {timeout: 120000}); await p.waitForTimeout(1500);
    const on = {altin: "V51.Yonetici.tamam=()=>true;V53.Onizleme.baslat()", pdunya: "V51.Yonetici.tamam=()=>true;V53.Onizleme.baslat()", psinif: "V51.Yonetici.tamam=()=>true;V53.Onizleme.baslat()", poyun: "V51.Yonetici.tamam=()=>true;V53.Onizleme.baslat()"}[ADIM];
    if (on && ADIM !== 'altin') { await p.evaluate(on); await p.waitForTimeout(2500); }
    const js = {grade: "go('grade',{g:5})", games: "go('games')", atlas57: "go('atlas57')", altin: on, pdunya: "go('pdunya')", psinif: "go('psinif',{pg:5})", poyun: "go('poyun')", home: "go('home')"}[ADIM];
    await cdp.send('Profiler.start');
    await p.evaluate(async (js) => { for (let i = 0; i < 3; i++) { eval(js); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); if (i < 2) { go('home'); await new Promise((r) => setTimeout(r, 300)); } } }, js);
    prof = (await cdp.send('Profiler.stop')).profile;
  }
  const byId = new Map(prof.nodes.map((n) => [n.id, n])), self = new Map();
  const dt = prof.timeDeltas; prof.samples.forEach((id, i) => { const n = byId.get(id), cf = n.callFrame, k = (cf.functionName || '(anon)') + ' @' + cf.lineNumber + ':' + cf.columnNumber + (cf.url && !cf.url.includes('127.0.0.1') ? ' ' + cf.url : ''); self.set(k, (self.get(k) || 0) + (dt[i] || 0)); });
  const top = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 28).map(([k, v]) => Math.round(v / 1000) + 'ms  ' + k);
  const tot = Math.round([...self.values()].reduce((a, b) => a + b, 0) / 1000);
  console.log(ADIM, 'toplam', tot, 'ms\n' + top.join('\n'));
  await b.close(); st.close();
})();
