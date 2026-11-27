const {chromium} = require('playwright'); const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..', '..'), F = process.argv[2];
(async () => {
  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  await ctx.addInitScript(() => { if (!localStorage.getItem('__s')) { localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '0'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: 5}}})); } sessionStorage.setItem('dk-editor-oturum38', '1'); });
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:' + st.address().port + '/' + F); await p.waitForTimeout(3000);
  await p.evaluate(async () => { for (let i = 0; i < 6; i++) { go('grade', {g: 4 + i}); await new Promise((r) => setTimeout(r, 150)); go('home'); await new Promise((r) => setTimeout(r, 150)); } });
  const cdp = await ctx.newCDPSession(p); await cdp.send('HeapProfiler.enable'); await cdp.send('HeapProfiler.collectGarbage');
  let chunks = []; cdp.on('HeapProfiler.addHeapSnapshotChunk', (e) => chunks.push(e.chunk));
  await cdp.send('HeapProfiler.takeHeapSnapshot', {reportProgress: false});
  const s = JSON.parse(chunks.join('')); const m = s.snapshot.meta, nf = m.node_fields.length, ni = m.node_fields.indexOf('name'), ti = m.node_fields.indexOf('type');
  const say = {}; for (let i = 0; i < s.nodes.length; i += nf) { const n = s.strings[s.nodes[i + ni]]; if (/^Detached /.test(n)) say[n] = (say[n] || 0) + 1; }
  const top = Object.entries(say).sort((a, b) => b[1] - a[1]); console.log(F, 'detached toplam', top.reduce((a, x) => a + x[1], 0), top.slice(0, 8));
  await b.close(); st.close();
})();
