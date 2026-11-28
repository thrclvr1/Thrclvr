// node tools/v60/olcum/atlas_arama.js A.html B.html [tur] : Bilgi Atlası'na ikinci giriş ve harf harf arama (4× yavaş işlemci), dönüşümlü, ortanca
const {chromium} = require('playwright'); const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..', '..'), DOS = [process.argv[2], process.argv[3]], TUR = +(process.argv[4] || 6);
(async () => {
  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const b = await chromium.launch(); const S = [{}, {}];
  for (let t = 0; t < TUR; t++) for (const i of (t % 2 ? [1, 0] : [0, 1])) {
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(() => { if (!localStorage.getItem('__s')) { localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '0'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: 5}}})); } });
    const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
    await p.goto('http://127.0.0.1:' + st.address().port + '/' + DOS[i]); await p.waitForFunction(() => !document.getElementById('boot36') && typeof draw === 'function', null, {timeout: 120000}); await p.waitForTimeout(1200);
    await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
    const r = await p.evaluate(async () => {
      const raf = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))), bk = (ms) => new Promise((r) => setTimeout(r, ms)), o = {};
      go('atlas57'); await raf(); await bk(400); go('home'); await raf(); await bk(400);
      let a = performance.now(); go('atlas57'); await raf(); o.atlas2 = performance.now() - a; await bk(400);
      let top = 0; for (const q of ['p', 'pe', 'pey', 'peyg', 'peyga', 'pey', 'pe', 'p', '']) { a = performance.now(); V58.Atlas.ara(q); await raf(); top += performance.now() - a; await bk(150); }
      o.arama9 = top; return o;
    });
    for (const k in r) (S[i][k] = S[i][k] || []).push(r[k]);
    await ctx.close();
  }
  const med = (L) => { const s = L.slice().sort((x, y) => x - y); return Math.round(s[Math.floor(s.length / 2)]); };
  const o = {}; for (const k in S[0]) o[k] = [med(S[0][k]), med(S[1][k]), Math.round((med(S[1][k]) / med(S[0][k]) - 1) * 100) + '%'];
  console.log(JSON.stringify({DOS, tur: TUR, ortanca: o, ham: S}));
  await b.close(); st.close();
})();
