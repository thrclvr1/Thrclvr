// node kars.js A.html B.html <tur> : dönüşümlü ölçüm (4x yavaş işlemci). Açılış + geçişler; her tur A,B sırası değişir. Ortanca + çeyrekler.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..', '..'), DOS = [process.argv[2], process.argv[3]], TUR = +(process.argv[4] || 8);
const GEC = [['home', "go('home')"], ['grade', "go('grade',{g:5})"], ['topic', "go('topic',{t:'TPC-5-1-01',tab:'anlat'})"], ['games', "go('games')"], ['atlas57', "go('atlas57')"], ['profil46', "go('profil46')"]];
const AGEC = [['pdunya', "go('pdunya')"], ['psinif', "go('psinif',{pg:5})"], ['pders', "go('pders',{pt:'TPC-5-1-01',ptab:'anlat'})"], ['poyun', "go('poyun')"]];
(async () => {
  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const b = await chromium.launch();
  const S = DOS.map(() => ({}));
  const ekle = (i, k, v) => { (S[i][k] = S[i][k] || []).push(v); };
  for (let t = 0; t < TUR; t++) {
    const sira = t % 2 ? [1, 0] : [0, 1];
    for (const i of sira) {
      const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
      await ctx.addInitScript(() => { if (!localStorage.getItem('__s')) { localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '0'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: 5}}})); localStorage.setItem('dk-gorunum54', JSON.stringify({v: 1, altin: 1})); } sessionStorage.setItem('dk-editor-oturum38', '1'); });
      const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
      const t0 = Date.now(); await p.goto('http://127.0.0.1:' + st.address().port + '/' + DOS[i], {waitUntil: 'commit'});
      await p.waitForFunction(() => !document.getElementById('boot36') && typeof draw === 'function', null, {timeout: 120000, polling: 20});
      ekle(i, 'acilis', Date.now() - t0);
      await p.waitForTimeout(1200);
      const g = await p.evaluate(async ([GEC, AGEC]) => {
        const o = {}, bk = (ms) => new Promise((r) => setTimeout(r, ms));
        const olc = async (L) => { for (const [ad, js] of L) { const a = performance.now(); eval(js); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); o[ad] = performance.now() - a; await bk(350); } };
        await olc(GEC);
        V51.Yonetici.tamam = () => true; const a = performance.now(); V53.Onizleme.baslat(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); o.altinGecis = performance.now() - a; await bk(1800);
        await olc(AGEC);
        return o;
      }, [GEC, AGEC]);
      for (const [k, v] of Object.entries(g)) ekle(i, k, v);
      await ctx.close();
    }
  }
  const ort = (L) => { L = L.slice().sort((a, b) => a - b); const m = L.length; return Math.round(m % 2 ? L[(m - 1) / 2] : (L[m / 2 - 1] + L[m / 2]) / 2); };
  const sonuc = {};
  for (const k of Object.keys(S[0])) sonuc[k] = [ort(S[0][k]), ort(S[1][k]), Math.round((ort(S[1][k]) - ort(S[0][k])) / ort(S[0][k]) * 100) + '%'];
  console.log(JSON.stringify({A: DOS[0], B: DOS[1], tur: TUR, ortanca: sonuc}));
  fs.writeFileSync(__dirname + '/sonuc/kars-' + Date.now() + '.json', JSON.stringify({DOS, S, sonuc}, null, 1));
  await b.close(); st.close();
})();
