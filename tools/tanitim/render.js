// Tanıtım videosunu kare kare çizer ve ffmpeg ile MP4'e dönüştürür.
// Kullanım (depo kökünden):
//   node tools/tanitim/render.js yatay            → docs/tanitim/dkab-tanitim-v51.7-16x9.mp4 (1920×1080, 30 fps, 90 sn)
//   node tools/tanitim/render.js dikey            → docs/tanitim/dkab-tanitim-v51.7-9x16.mp4 (1080×1920, 30 fps, 42 sn)
//   node tools/tanitim/render.js yatay --onizle 3,12.5,40   → tools/tanitim/.kare/onizle_yatay_<t>.jpg (tek tek kareler)
// Önce: node tools/tanitim/kayit.js (gerçek ekranlar) ve python3 tools/tanitim/muzik.py (müzik).
// Video 2 (V51.8): --v2 → sahne2.html + kurgu2.js, .kayit2/, muzik2_*.wav. --dpr 2 ile yatay video 3840×2160 (4K) çizilir;
//   node tools/tanitim/render.js yatay --v2 --dpr 2   → docs/tanitim/dkab-tanitim-v51.8-16x9-4k.mp4 (+ 1080p sürümü ffmpeg ile küçültülür)
//   node tools/tanitim/render.js dikey --v2           → docs/tanitim/dkab-tanitim-v51.8-9x16.mp4
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), {spawn} = require('child_process');
const KOK = __dirname, DEPO = path.resolve(KOK, '..', '..');
const yon = process.argv[2] === 'dikey' ? 'dikey' : 'yatay';
const oi = process.argv.indexOf('--onizle'), onizle = oi > 0 ? process.argv[oi + 1].split(',').map(Number) : null;
const W = yon === 'dikey' ? 1080 : 1920, H = yon === 'dikey' ? 1920 : 1080, FPS = 30;
const V2 = process.argv.includes('--v2'), di = process.argv.indexOf('--dpr'), DPR = di > 0 ? +process.argv[di + 1] : 1;
const TUR = {'.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.js': 'text/javascript'};
const srv = http.createServer((q, r) => {
  const f = path.join(KOK, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(KOK) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, {'Content-Type': TUR[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r);
}).listen(0);

(async () => {
  const b = await chromium.launch({args: ['--disable-gpu-vsync', '--force-color-profile=srgb']});
  const p = await (await b.newContext({viewport: {width: W, height: H}, deviceScaleFactor: DPR})).newPage();
  p.setDefaultTimeout(180000);
  p.on('pageerror', (e) => console.log('sayfa hatası:', e.message));
  p.on('console', (m) => { if (m.type() === 'error') console.log('konsol:', m.text()); });
  await p.goto(`http://127.0.0.1:${srv.address().port}/${V2 ? 'sahne2' : 'sahne'}.html?yon=${yon}`);
  await p.evaluate(() => window.hazir);
  const SURE = await p.evaluate(() => window.SURE);
  const kareDir = path.join(KOK, '.kare'); fs.mkdirSync(kareDir, {recursive: true});
  if (onizle) {
    for (const t of onizle) { await p.evaluate((t) => window.ciz(t), t); await p.screenshot({path: path.join(kareDir, `onizle${V2 ? '2' : ''}_${yon}_${t}.jpg`), type: 'jpeg', quality: 88}); console.log('✓', t); }
    await b.close(); srv.close(); return;
  }
  const out = path.join(DEPO, 'docs', 'tanitim', V2 ? `dkab-tanitim-v51.8-${yon === 'dikey' ? '9x16' : '16x9'}${DPR >= 2 ? '-4k' : ''}.mp4` : `dkab-tanitim-v51.7-${yon === 'dikey' ? '9x16' : '16x9'}.mp4`);
  fs.mkdirSync(path.dirname(out), {recursive: true});
  const ses = path.join(KOK, '.ses', (V2 ? 'muzik2' : 'muzik') + (yon === 'dikey' ? '_9x16.wav' : '_16x9.wav'));
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', ses,
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', DPR >= 2 ? 'medium' : 'slow', '-crf', DPR >= 2 ? '20' : '19', ...(DPR >= 2 ? ['-level', '5.1'] : []), '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS),
    '-g', String(FPS * 2), '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000',
    '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9', '-shortest', '-metadata', 'title=DKAB Öğrenme Platformu — tanıtım', out], {stdio: ['pipe', 'inherit', 'inherit']});
  const N = Math.round(SURE * FPS), t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await p.evaluate((t) => window.ciz(t), i / FPS);
    const buf = await p.screenshot({type: 'jpeg', quality: 95});
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`kare ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)} sn`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('✓', path.relative(DEPO, out), (fs.statSync(out).size / 1e6).toFixed(1), 'MB');
  if (V2 && DPR >= 2 && yon === 'yatay') {   // 1080p sürümü: 4K karelerden yüksek kaliteli küçültme
    const o2 = out.replace('-4k.mp4', '.mp4');
    await new Promise((r) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-c:a', 'copy', o2], {stdio: 'inherit'}).on('close', r));
    console.log('✓', path.relative(DEPO, o2), (fs.statSync(o2).size / 1e6).toFixed(1), 'MB');
  }
  await b.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
