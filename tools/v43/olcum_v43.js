// Açılış ölçümü (V42.0 ve V43.0): yerel sunucu, başsız Chromium, 390×844, 5'er açılış; hızlandırılmamış ağ.
// Kullanım (depo kökünden): node tools/v43/olcum_v43.js
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
(async () => {
  await new Promise(r => srv.once('listening', r));
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const out = {};
  for (const v of ['42.0', '43.0']) {
    const F = 'surumler/din-kulturu-platformu-v' + v + '.html', R = [];
    for (let i = 0; i < 6; i++) {
      const ctx = await b.newContext({viewport: {width: 390, height: 844}});
      await ctx.addInitScript(() => localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})));
      const p = await ctx.newPage(); const t0 = Date.now();
      await p.goto('http://127.0.0.1:' + srv.address().port + '/' + F, {waitUntil: 'load'});
      await p.waitForFunction(() => !document.getElementById('boot36') && document.querySelector('#app *'));
      const m = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return {dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null}; });
      m.hazir = Date.now() - t0; if (i) R.push(m); await ctx.close();
    }
    const med = k => { const a = R.map(x => x[k]).sort((x, y) => x - y); return a[a.length >> 1]; };
    out[v] = {boyutMB: +(fs.statSync(path.join(ROOT, F)).size / 1048576).toFixed(1), domContentLoaded: med('dcl'), load: med('load'), ekranHazir: med('hazir'), jsHeapMB: med('heap')};
    console.log('V' + v, JSON.stringify(out[v]));
  }
  fs.writeFileSync(path.join(__dirname, 'olcum_sonuc.json'), JSON.stringify(out, null, 1));
  await b.close(); srv.close();
})();
