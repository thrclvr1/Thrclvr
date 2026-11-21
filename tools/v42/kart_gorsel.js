// Seçim ekranındaki Premium kartı görseli: uygulamanın kendi WebGL koridorundan (V41.0) arayüzsüz bir kare alır.
// Kullanım (depo kökünden): node tools/v42/kart_gorsel.js   →  tools/v42/kart_premium.webp
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
(async () => {
  await new Promise(r => srv.once('listening', r));
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const ctx = await b.newContext({viewport: {width: 900, height: 620}, deviceScaleFactor: 1});
  await ctx.addInitScript(() => { localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'premium', hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:' + srv.address().port + '/surumler/din-kulturu-platformu-v41.0.html');
  await p.waitForTimeout(2500);
  await p.addStyleTag({content: '.ust40,.alt40,.ipu40,.yrd40,.bil40,.nok40,.ok40,.k40,.yrdb40,[class*="yrd"],#boot36{visibility:hidden!important}'});
  await p.evaluate(() => { try { V40.s = 1.2; V40.mode = 'yuru'; V40.uygula && V40.uygula(); } catch (e) {} });
  await p.waitForTimeout(1200);
  const png = path.join(__dirname, '.kart.png');
  await p.screenshot({path: png, clip: {x: 90, y: 40, width: 720, height: 420}});
  cp.execSync(`python3 -c "from PIL import Image;im=Image.open('${png}').convert('RGB').resize((640,374),Image.LANCZOS);im.save('${path.join(__dirname, 'kart_premium.webp')}','WEBP',quality=74,method=6)"`);
  fs.unlinkSync(png);
  console.log('kart_premium.webp', fs.statSync(path.join(__dirname, 'kart_premium.webp')).size, 'bayt');
  await b.close(); srv.close();
})();
