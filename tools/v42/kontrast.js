// WCAG AA kontrast denetimi. Kullanım (depo kökünden): node tools/v42/kontrast.js [sürüm-dosyası] [çıktı.json]
// Her ekranda görünen her yazı öğesi için: yazı rengi (opaklık zinciri dahil) ile gerçek arka plan (yazılar gizlenip
// alınan ekran görüntüsünden, öğenin kutusundaki piksellerin medyanı) arasındaki oran hesaplanır.
// Eşik: normal yazı 4.5, büyük yazı (≥24 px ya da ≥18.66 px kalın) 3.0. Devre dışı öğeler hariç tutulur.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const DOSYA = process.argv[2] || 'index.html', CIKTI = process.argv[3] || path.join(__dirname, 'kontrast_sonuc.json');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
const TMP = path.join(__dirname, '.k'); fs.mkdirSync(TMP, {recursive: true});
const EKRANLAR = [
  ['secim', null, () => V39.secim(true)],
  ['k:home', 'normal', () => go('home')], ['k:classes', 'normal', () => go('classes')], ['k:grade5', 'normal', () => go('grade', {g: 5})],
  ['k:konu', 'normal', () => go('topic', {t: 'TPC-5-1-01', tab: 'anlat'})], ['k:konu-test', 'normal', () => go('topic', {t: 'TPC-5-1-01', tab: 'test'})], ['k:games', 'normal', () => go('games')], ['k:dene', 'normal', () => go('dene')], ['k:pek', 'normal', () => go('pek')], ['k:sd', 'normal', () => go('sd')],
  ['k:ayarlar', 'normal', () => { go('home'); setTimeout(() => V30.settings(), 300); }], ['k:arama', 'normal', () => { go('home'); setTimeout(() => (typeof searchSheet === 'function' ? searchSheet() : null), 300); }],
  ['k:ses', 'normal', () => { go('home'); setTimeout(() => V37.sndOpen(), 300); }],
  ['p:koridor', 'premium', () => go('pdunya')], ['p:sinif', 'premium', () => go('psinif', {pg: 5})], ['p:unite', 'premium', () => go('punite', {pg: 5, pu: 'DKAB-5-U01'})], ['p:ders', 'premium', () => go('pders', {pt: 'TPC-5-1-01', ptab: 'anlat'})], ['p:ders-test', 'premium', () => go('pders', {pt: 'TPC-5-1-01', ptab: 'test'})],
  ['p:ozet', 'premium', () => go('pozet', {pg: 5})], ['p:ilerleme', 'premium', () => go('pilerleme')], ['p:fav', 'premium', () => go('pfav')], ['p:oyun-merkezi', 'premium', () => go('poyun')], ['p:odunc-games', 'premium', () => go('games')],
  ['p:arama', 'premium', () => { go('psinif', {pg: 5}); setTimeout(() => { V39.ara(); setTimeout(() => { const i = document.getElementById('p39q'); if (i) { i.value = 'düzen'; i.dispatchEvent(new Event('input')); } }, 200); }, 300); }],
  ['p:profil', 'premium', () => { go('pdunya'); setTimeout(() => V40.profil(), 400); }], ['p:yardim', 'premium', () => { go('pdunya'); setTimeout(() => V40.yardim(), 400); }], ['p:ses', 'premium', () => { go('pdunya'); setTimeout(() => V37.sndOpen(), 400); }],
  ['p:oyun-giris', 'premium', () => go('poyna', {oyn: 'kutuphane', obol: '5-2026-U01', odevam: 0})],
  ['p:degistir', 'premium', () => { go('psinif', {pg: 5}); setTimeout(() => window.V42 && V42.degistir && V42.degistir(), 300); }],
  ['k:degistir', 'normal', () => { go('grade', {g: 5}); setTimeout(() => window.V42 && V42.degistir && V42.degistir(), 300); }],
  ['p:oyun-menu', 'premium', () => { go('poyna', {oyn: 'kutuphane', obol: '5-2026-U01', odevam: 0}); setTimeout(() => { try { V41.oyunlar.kutuphane.girisBitti(); setTimeout(() => V41.duraklat('kullanici'), 800); } catch (e) {} }, 600); }],
  ['k:tumsesler', 'normal', () => { go('home'); setTimeout(() => ATM.open(), 300); }],
  ['secim-masaustu', null, () => V39.secim(true), {width: 1280, height: 800}],
];
(async () => {
  await new Promise(r => srv.once('listening', r));
  const U = 'http://127.0.0.1:' + srv.address().port + '/' + DOSYA;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const sonuc = [];
  for (const tema of ['dark', 'light']) for (const [ad, mod, fn, vp] of EKRANLAR) {
    const ctx = await b.newContext({viewport: vp || {width: 390, height: 844}, isMobile: !vp, hasTouch: true});
    await ctx.addInitScript(([tema, mod]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-theme', tema); if (mod) localStorage.setItem('dk-deneyim39', JSON.stringify({son: mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); }, [tema, mod]);
    const p = await ctx.newPage(); await p.goto(U); await p.waitForTimeout(1600);
    try { await p.evaluate(fn); } catch (e) {}
    await p.waitForTimeout(1500);
    // görünür yazı öğeleri
    const els = await p.evaluate(() => {
      const out = [], vw = innerWidth, vh = innerHeight; let n = 0;
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      while (tw.nextNode()) { const t = tw.currentNode; if (!t.nodeValue.trim()) continue; const e = t.parentElement; if (!e || seen.has(e)) continue; seen.add(e);
        if (e.closest('script,style,svg,canvas,[aria-hidden="true"],.v-toast,#v-toasts')) continue;
        const r = document.createRange(); r.selectNodeContents(t); const bb = r.getBoundingClientRect(); if (bb.width < 4 || bb.height < 6 || bb.bottom < 0 || bb.top > vh || bb.right < 0 || bb.left > vw) continue;
        const s = getComputedStyle(e); if (s.visibility === 'hidden') continue; const cx = Math.min(vw - 1, Math.max(0, (bb.left + bb.right) / 2)), cy = Math.min(vh - 1, Math.max(0, (bb.top + bb.bottom) / 2)), ust = document.elementFromPoint(cx, cy); if (!ust || !(e.contains(ust) || ust.contains(e))) continue;
        let op = 1; for (let a = e; a; a = a.parentElement) op *= +getComputedStyle(a).opacity; if (op < .05) continue;
        const dis = !!e.closest('button:disabled,[aria-disabled="true"],.elendi,input:disabled');
        e.setAttribute('data-k42', n); out.push({i: n++, metin: t.nodeValue.trim().slice(0, 40), sel: e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''), renk: s.color, op, fs: parseFloat(s.fontSize), fw: +s.fontWeight || 400, dis, kutu: [Math.max(0, bb.left), Math.max(0, bb.top), Math.min(vw, bb.right), Math.min(vh, bb.bottom)]}); }
      return out; });
    // yazıları gizle, arka planı fotoğrafla
    await p.addStyleTag({content: '[data-k42]{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important} [data-k42] *{color:transparent!important;-webkit-text-fill-color:transparent!important}'});
    await p.waitForTimeout(250);
    const f = path.join(TMP, 'a.png'); await p.screenshot({path: f});
    const js = path.join(TMP, 'e.json'); fs.writeFileSync(js, JSON.stringify(els));
    const res = JSON.parse(cp.execSync(`python3 -c "
import json
from PIL import Image
im=Image.open('${f}').convert('RGB');W,H=im.size;px=im.load()
E=json.load(open('${js}'));out=[]
def rgb(s):
  sr=s.startswith('color(')
  s=s[s.index('(')+1:s.index(')')].replace('srgb','').replace('/',' ').replace(',',' ').split();v=[float(x) for x in s if x.strip()]
  if sr: v=[x*255 for x in v[:3]]+v[3:]
  return v+[1.0]*(4-len(v))
def L(c):
  r=[]
  for x in c[:3]:
    x/=255;r.append(x/12.92 if x<=.03928 else ((x+.055)/1.055)**2.4)
  return .2126*r[0]+.7152*r[1]+.0722*r[2]
for e in E:
  x0,y0,x1,y1=[int(round(v)) for v in e['kutu']]
  if x1-x0<2 or y1-y0<2: continue
  P=[px[x,y] for y in range(y0,min(H,y1),max(1,(y1-y0)//8)) for x in range(x0,min(W,x1),max(1,(x1-x0)//12))]
  if not P: continue
  P.sort(key=lambda c:sum(c));bg=P[len(P)//2]
  c=rgb(e['renk']);a=c[3]*e['op']
  fg=[c[k]*a+bg[k]*(1-a) for k in range(3)]
  l1,l2=L(fg),L(bg);oran=(max(l1,l2)+.05)/(min(l1,l2)+.05)
  buyuk=e['fs']>=24 or (e['fs']>=18.66 and e['fw']>=700)
  esik=3.0 if buyuk else 4.5
  out.append(dict(e,bg=bg,fg=[round(v) for v in fg],oran=round(oran,2),esik=esik))
print(json.dumps(out))"`).toString());
    const kotu = res.filter(r => !r.dis && r.oran < r.esik);
    sonuc.push({tema, ekran: ad, n: res.length, kotu: kotu.map(r => ({m: r.metin, s: r.sel, oran: r.oran, esik: r.esik, fg: r.fg, bg: r.bg}))});
    console.log(`${tema.padEnd(5)} ${ad.padEnd(16)} ${String(res.length).padStart(3)} yazı · AA altı: ${kotu.length}` + (kotu.length ? '  ← ' + kotu.slice(0, 3).map(k => `"${k.metin}" ${k.oran}`).join(' | ') : ''));
    await ctx.close();
  }
  fs.writeFileSync(CIKTI, JSON.stringify(sonuc, null, 1));
  const top = sonuc.reduce((a, s) => a + s.kotu.length, 0), tn = sonuc.reduce((a, s) => a + s.n, 0);
  console.log(`\nToplam ${tn} yazı öğesi · AA altında ${top}`);
  await b.close(); srv.close(); fs.rmSync(TMP, {recursive: true, force: true});
})().catch(e => { console.error(e); process.exit(2); });
