const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs');
// V58: V57.0'ın tarayıcıdaki Store verisini (gizlenen kayıtlar hariç) oyun içerik üreticisi için yazar. node tools/v58/veri58.js
const ROOT = path.resolve(__dirname, '..', '..');
(async () => {
  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const b = await chromium.launch(); const ctx = await b.newContext();
  await ctx.addInitScript(() => { localStorage.setItem('dk-lite', '1'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: 4}}})); });
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:' + st.address().port + '/surumler/din-kulturu-platformu-v57.0.html'); await p.waitForTimeout(2500);
  const d = await p.evaluate(() => { const o = {}; for (const c of ['topics', 'games', 'concepts', 'entities', 'questions', 'units', 'outcomes', 'flashcards']) o[c] = Store.all(c); o.visTopics = Store.all('topics').filter((t) => vis(t)).map((t) => t.id); return o; });
  fs.mkdirSync(__dirname + '/.veri', {recursive: true}); fs.writeFileSync(__dirname + '/.veri/store57.json', JSON.stringify(d));
  console.log(Object.entries(d).map(([k, v]) => k + ':' + v.length).join(' '));
  await b.close(); st.close();
})();
