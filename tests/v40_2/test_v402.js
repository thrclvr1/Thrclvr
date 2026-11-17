// V40.2 testleri (Playwright + Chromium, başsız). Depo kökünden:  node tests/v40_2/test_v402.js
// Koridorun tek WebGL yüzeyine taşınması: karanlık alan ölçümü (ekran görüntüsünden, Python PIL), kapı eşleşmeleri ve kamera
// pozlarının V40.1 ile aynılığı, gezinme, sade görünüm, WebGL olmayan cihazda CSS yedeği, ekran boyutları, kayıtlar.
// Başsız Chromium'da WebGL yazılımla (SwiftShader) çalışır. Tarayıcı otomasyonudur; gerçek cihaz testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
let V401, V402, IDX;
const R = [];
const ok = (id, name, pass, detail) => { R.push({id, name, pass: !!pass, detail}); console.log((pass ? 'GEÇTİ ' : 'KALDI ') + id + ' · ' + name + (detail !== undefined ? ' — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 400) : '')); };
const IGN = /Failed to load resource: the server responded with a status of 404|GPU stall due to ReadPixels|Automatic fallback to software WebGL/;
const OGRT_DATA = {v: 1, app: 'dkab-ogretmen', classes: [{g: 12, py: '2018'}], active: '12|2018', status: {}, plans: [], updatedAt: '2026-11-01T00:00:00.000Z'};
const PREM = {son: 'premium', hatirla: true};
const SHOT = path.join(ROOT, 'docs', 'V40.2_ekran'); fs.mkdirSync(SHOT, {recursive: true});
const TMP = path.join(__dirname, '.tmp'); fs.mkdirSync(TMP, {recursive: true});

async function ctxWith(b, {w = 390, h = 844, lite = null, init = null, teacher = false, fav = null} = {}) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700, hasTouch: true});
  await ctx.addInitScript(([data, lite, teacher, fav]) => {
    if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-theme', 'dark'); localStorage.setItem('dk-ogretmen-v1', JSON.stringify(data));
    localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'premium', hatirla: true})); const o = {z: {a: '1'}, t: {}, prog: {}, son: {}, ipucu40: 1}; if (lite !== null) o.lite40 = lite; if (fav) o.fav = fav; localStorage.setItem('dk-ilerleme39', JSON.stringify(o));
    if (teacher) { sessionStorage.setItem('dk-ogrt-oturum', '1'); sessionStorage.setItem('dk-editor-oturum38', '1'); }
  }, [OGRT_DATA, lite, teacher, fav]);
  if (init) await ctx.addInitScript(init);
  return ctx;
}
async function open(ctx, url) { const p = await ctx.newPage(); p._errs = []; p._warn = []; p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !IGN.test(m.text())) p._errs.push('console: ' + m.text()); if (m.type() === 'warning') p._warn.push(m.text()); }); await p.goto(url || IDX); await p.waitForFunction(() => window.V40 && (V40.GL && (V40.GL.hazir || V40.GL.durum.kaynak === 'css') || !V40.GL), null, {timeout: 15000}).catch(() => {}); await p.waitForTimeout(900); return p; }
// sahne alanı (arayüz gizli) parlaklık analizi: ortalama, çok koyu (<40) piksel oranı, en büyük koyu dikdörtgen bölge yaklaşığı
async function sahne(p, file) {
  const box = await p.evaluate(() => { const r = document.getElementById('s40').getBoundingClientRect(); return {x: 0, y: Math.max(0, r.y), width: innerWidth, height: Math.min(r.height, innerHeight - Math.max(0, r.y))}; });
  const f = file || path.join(TMP, 's.png'); fs.writeFileSync(f, await p.screenshot({clip: box}));
  return JSON.parse(cp.execSync(`python3 -c "
from PIL import Image, ImageStat
import json
im=Image.open('${f}').convert('L');W,H=im.size;s=ImageStat.Stat(im);h=im.histogram();n=sum(h)
# 24x24 hücrelerin kaçı tamamen koyu (ortalama<40): büyük siyah bölge göstergesi
c=0;t=0
for y in range(0,H-23,24):
  for x in range(0,W-23,24):
    t+=1
    if ImageStat.Stat(im.crop((x,y,x+24,y+24))).mean[0]<40:c+=1
print(json.dumps({'ort':round(s.mean[0],1),'koyu':round(100*sum(h[:40])/n,2),'koyuHucre':round(100*c/max(1,t),2)}))"`).toString());
}
const UIHIDE = '.ust40,.alt40,.yrd40,.ipu40,.hava40{visibility:hidden!important}';

(async () => {
  await new Promise(r => srv.listening ? r() : srv.once('listening', r));
  const B = 'http://127.0.0.1:' + srv.address().port;
  V401 = B + '/surumler/din-kulturu-platformu-v40.1.html'; V402 = B + '/surumler/din-kulturu-platformu-v40.2.html'; IDX = B + '/index.html';
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});

  // ---------- 0. Koruma: sürüm, veri, kapı eşleşmesi, kamera pozları, diğer ekranlar ----------
  {
    const c1 = await ctxWith(b, {teacher: true}), c2 = await ctxWith(b, {teacher: true}), cI = await ctxWith(b);
    const p1 = await open(c1, V401), p2 = await open(c2, V402), pI = await open(cI, IDX);
    const snap = p => p.evaluate(() => ({ver: V31.VER, routes: Object.keys(V30.routes).sort(), cols: Object.fromEntries(Object.keys(COL).map(c => [c, Store.all(c).length])), seeds: [...document.querySelectorAll('script[type="application/json"]')].map(s => s.id + ':' + s.textContent.length),
      kap: JSON.stringify(V40.kapilar()), dugme: [...document.querySelectorAll('.k40')].map(k => k.dataset.g + '|' + k.dataset.i + '|' + k.getAttribute('aria-label')),
      poz: [-1, 0, 1, 3, 5, 8].map(i => JSON.stringify([V40.durak(i), i >= 0 ? V40.odak(i) : 0, i >= 0 ? V40.giris(i) : 0, V40.yolPoz(i + .5)])), P: V40.P, fd: V40.fd, yawS: V40.yawS, gl: !!(V40.GL && V40.GL.aktif), cv: document.querySelectorAll('#s40 canvas').length}));
    const a = await snap(p1), z = await snap(p2), i = await snap(pI);
    ok('0.1', 'Sürüm V40.2 (index.html ve sürüm dosyası); koridor WebGL ile çiziliyor (tek canvas)', z.ver === 'V40.2' && i.ver === 'V40.2' && z.gl && z.cv === 1, {ver: z.ver, gl: z.gl, cv: z.cv});
    ok('0.2', 'Veri blokları, kayıt sayıları ve rotalar V40.1 ile aynı', JSON.stringify(a.seeds) === JSON.stringify(z.seeds) && JSON.stringify(a.cols) === JSON.stringify(z.cols) && JSON.stringify(a.routes) === JSON.stringify(z.routes));
    ok('0.3', '9 kapının dünya konumu, sınıf eşleşmesi ve erişilebilir adı V40.1 ile birebir aynı', a.kap === z.kap && JSON.stringify(a.dugme) === JSON.stringify(z.dugme) && z.dugme.length === 9, z.dugme.map(d => d.split('|')[0]).join());
    ok('0.4', 'Kamera pozları (durak, odak, giriş, ara noktalar), odak uzaklığı ve bakış açısı V40.1 ile aynı', JSON.stringify(a.poz) === JSON.stringify(z.poz) && a.P === z.P && a.fd === z.fd && a.yawS === z.yawS);
    const sig = (p, v) => p.evaluate(async v => { const [r, x] = v.split(':'); if (r === 'topic') go('pders', {pt: Store.all('topics').find(t => t.sections && t.grade == 6).id, ptab: 'anlat'}); else if (r === 'psinif') go('psinif', {pg: +x}); else if (r === 'ogretmen') { const salt = 's'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 2, salt, h: V36.hash(salt, '1111'), len: 4})); go('ogretmen'); } else if (r === 'klasik') { V39.on = false; sessionStorage.removeItem('dk-deneyim39-aktif'); go(x); } else go(r);
      await new Promise(r => setTimeout(r, 800)); const P = ['color', 'backgroundColor', 'backgroundImage', 'fontSize', 'borderTopColor', 'borderRadius', 'display']; const out = [];
      [document.body, ...[...document.querySelectorAll('#app *')].slice(0, 400)].forEach(e => { const s = getComputedStyle(e); out.push(e.tagName + '.' + (e.getAttribute('class') || '').replace(/\b(rv|in|done|p40-gel)\b/g, '').trim() + ':' + P.map(k => s[k]).join('|')); }); return out; }, v);
    const diffs = [];
    for (const v of ['psinif:8', 'topic', 'pfav', 'pilerleme', 'games', 'ogretmen', 'klasik:home', 'klasik:classes', 'klasik:dene']) { const s1 = await sig(p1, v), s2 = await sig(p2, v); const d = s1.filter((x, k) => x !== s2[k]).length + Math.abs(s1.length - s2.length); if (d) diffs.push(`${v}: ${d} fark (${s1.find((x, k) => x !== s2[k]) || ''})`); }
    ok('0.5', 'Koridor dışındaki ekranlar (sınıf merkezi, ders, favoriler, ilerleme, oyunlar, öğretmen paneli, Klasik ana sayfa/sınıflar/kendini dene) V40.1 ile aynı', diffs.length === 0, diffs);
    ok('0.6', 'Sayfa/konsol hatası yok', !p2._errs.length && !pI._errs.length, p2._errs.concat(pI._errs));
    await c1.close(); await c2.close(); await cI.close();
  }

  // ---------- 1. Karanlık alan ve aydınlık ölçümü (tam ve sade görünüm, telefon ve yatay tablet) ----------
  for (const [w, h] of [[390, 844], [1024, 768]]) for (const lite of [0, 1]) {
    const ctx = await ctxWith(b, {w, h, lite}); const p = await open(ctx); await p.addStyleTag({content: UIHIDE});
    const poses = []; for (let s = -1; s <= 8; s += .5) poses.push(['s', s]); for (let i = 0; i < 9; i++) poses.push(['o', i]);
    const res = [];
    for (const [t, v] of poses) { await p.evaluate(([t, v]) => { V40.tw = null; V40.uygula(t === 's' ? V40.yolPoz(v) : V40.odak(v)); }, [t, v]); await p.waitForTimeout(60); res.push([t + v, await sahne(p)]); }
    const d = await p.evaluate(() => ({kaynak: V40.GL.durum.kaynak, q: V40.GL.durum.q, lite: !!document.querySelector('#p40.lite'), dpr: V40.GL.cv.width / V40.GL.W}));
    const enKoyu = res.slice().sort((a, b) => b[1].koyu - a[1].koyu)[0], enKoyuHucre = Math.max(...res.map(r => r[1].koyuHucre)), enDusuk = Math.min(...res.map(r => r[1].ort));
    const id = '1.' + (w === 390 ? 1 : 3) + (lite ? 1 : 0);
    ok(`${id}`, `${w}×${h} ${lite ? 'sade' : 'tam'} görünüm, 28 kamera konumu: çok koyu piksel ≤%3, tamamen koyu 24 px hücre yok, ortalama parlaklık ≥120`, enKoyu[1].koyu <= 3 && enKoyuHucre === 0 && enDusuk >= 120 && d.kaynak === 'webgl' && d.lite === !!lite && (!lite || d.q === .5), {enKoyu, enKoyuHucre, enDusuk, d});
    if (!lite) { await p.evaluate(() => { V40.tw = null; V40.uygula(V40.yolPoz(-1)); }); await p.waitForTimeout(80); await p.screenshot({path: path.join(SHOT, `${w}x${h}_giris_sahne.png`)}); }
    await ctx.close();
  }
  // hareket sırasında (animasyon karelerinde) ve arayüz görünürken: alt bilgi kartı içeriğiyle çiziliyor
  {
    const ctx = await ctxWith(b); const p = await open(ctx);
    const kareler = [];
    await p.evaluate(() => V40.git(0)); await p.waitForTimeout(1300);
    const gz = await p.addStyleTag({content: UIHIDE});
    await p.evaluate(() => V40.git(6));
    for (let k = 0; k < 6; k++) { await p.waitForTimeout(170); kareler.push(await sahne(p)); }
    await gz.evaluate(e => e.remove());
    await p.waitForTimeout(1200);
    const kart = await p.evaluate(() => { const b = document.getElementById('b40'), r = b.getBoundingClientRect(); return {txt: b.innerText.replace(/\s+/g, ' ').trim(), btn: !!b.querySelector('.gir40'), h: Math.round(r.height), vis: getComputedStyle(b).visibility, bg: getComputedStyle(b).backgroundColor, bd: getComputedStyle(b).backdropFilter}; });
    await p.screenshot({path: path.join(SHOT, '390_yuru_10.png')});
    ok('1.5', 'Kamera yürürken (6 animasyon karesi): sahnede çok koyu piksel ≤%3, tamamen koyu bölge yok', kareler.every(k => k.koyuHucre === 0 && k.koyu <= 3 && k.ort >= 120), kareler);
    ok('1.6', 'Alt bilgi kartı içeriğiyle birlikte görünüyor (sınıf adı, sayılar, Sınıfa Gir); bulanıklık filtresi kaldırıldı', /10\. Sınıf/.test(kart.txt) && /ünite/.test(kart.txt) && kart.btn && kart.bd === 'none', kart);
    await ctx.close();
  }

  // ---------- 2. Etkileşim: dokunarak seçme, giriş, dönüş, sürükleme, klavye, gösterge ----------
  {
    const ctx = await ctxWith(b); const p = await open(ctx);
    const st = () => p.evaluate(() => ({s: +V40.s.toFixed(2), z: Math.round(V40.cam.z), mode: V40.mode, g: V40.sel >= 0 ? V39.GR[V40.sel] : 0}));
    const sb = await p.evaluate(() => { const r = document.getElementById('s40').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height * .55}; });
    const s0 = await st();
    await p.mouse.move(sb.x + 140, sb.y); await p.mouse.down(); for (let k = 1; k <= 12; k++) { await p.mouse.move(sb.x + 140 - k * 22, sb.y); await p.waitForTimeout(16); } await p.mouse.up(); await p.waitForTimeout(1300);
    const s1 = await st();
    ok('2.1', 'Sola sürükleme kamerayı ileri yürütüyor ve durağa oturtuyor', s1.s > s0.s && Number.isInteger(s1.s) && s1.z < s0.z, {s0, s1});
    await p.evaluate(() => V40.git(2)); await p.waitForTimeout(1500);
    const kut = await p.evaluate(() => { const b = document.querySelector('.k40[data-g="6"]'), r = b.getBoundingClientRect(); return {gz: b.classList.contains('gz'), x: r.x + r.width / 2, y: r.y + r.height * .6, w: Math.round(r.width), h: Math.round(r.height)}; });
    await p.mouse.click(kut.x, kut.y); await p.waitForTimeout(1600);
    const s2 = await p.evaluate(() => ({mode: V40.mode, g: V39.GR[V40.sel], kis: document.querySelectorAll('.k40.kis').length, gl: V40.GL.kap[2].g}));
    ok('2.2', 'Kapıya dokununca (WebGL üstündeki saydam düğme) kamera kapıya dönüyor, kapı seçiliyor, altın hale çiziliyor', !kut.gz && kut.w > 40 && s2.mode === 'odak' && s2.g === 6 && s2.kis === 8 && s2.gl > .9, {kut, s2});
    await p.screenshot({path: path.join(SHOT, '390_kapi_secili.png')});
    const kut2 = await p.evaluate(() => { const r = document.querySelector('.k40[data-g="6"]').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height * .6}; });
    await p.mouse.click(kut2.x, kut2.y); await p.waitForTimeout(700);
    const ac = await p.evaluate(() => ({acik: document.querySelector('.k40[data-g="6"]').classList.contains('acik'), a: Math.round(V40.GL.kap[2].a), view}));
    await p.screenshot({path: path.join(SHOT, '390_kapi_aciliyor.png')});
    await p.waitForTimeout(2300);
    const gir = await p.evaluate(() => ({view, pg: G.pg}));
    ok('2.3', 'İkinci dokunuşta kanatlar menteşeden açılıyor (çizicide açı > 40°) ve 6. sınıf merkezine giriliyor', ac.acik && ac.a > 40 && gir.view === 'psinif' && gir.pg === 6, {ac, gir});
    await p.click('.p39-cr button'); await p.waitForTimeout(1800);
    const don = await p.evaluate(() => ({view, mode: V40.mode, g: V39.GR[V40.sel], a: Math.round(V40.GL.kap[2].a), acik: document.querySelectorAll('.k40.acik').length}));
    ok('2.4', 'Koridora dönünce aynı kapının önünde duruluyor, kanatlar kapanıyor', don.view === 'pdunya' && don.mode === 'odak' && don.g === 6 && don.acik === 0 && don.a === 0, don);
    await p.evaluate(() => V40.geriCekil()); await p.waitForTimeout(1300);
    await p.focus('#s40'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1100); const k1 = await st();
    await p.keyboard.press('Tab'); await p.waitForTimeout(1600); const kb = await p.evaluate(() => ({f: document.activeElement && document.activeElement.className, mode: V40.mode, g: V39.GR[V40.sel]}));
    await p.keyboard.press('Enter'); await p.waitForTimeout(2800); const kv = await p.evaluate(() => ({view, pg: G.pg}));
    ok('2.5', 'Klavye: ok tuşu yürütüyor; Tab kapıya odaklanıp kamerayı çeviriyor; Enter kapıyı açıp sınıfa giriyor', k1.s === 3 && /k40/.test(kb.f) && kb.mode === 'odak' && kv.view === 'psinif' && kv.pg === kb.g, {k1, kb, kv});
    await p.evaluate(() => go('pdunya')); await p.waitForTimeout(1500);
    await p.click('.gs40 button[data-i="8"]'); await p.waitForTimeout(2000); const g8 = await st();
    ok('2.6', 'Alttaki göstergeden 12. sınıfa (koridor sonu) gidiliyor', g8.s === 8, g8);
    ok('2.7', 'Sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  // ---------- 3. WebGL olmayan cihaz: V40.1 CSS koridoru yedek olarak çalışıyor ----------
  {
    const ctx = await ctxWith(b, {init: () => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, a) { return /webgl/.test(t) ? null : o.call(this, t, a); }; }}); const p = await open(ctx);
    const d = await p.evaluate(() => ({gl: V40.GL.aktif, kaynak: V40.GL.durum.kaynak, z40: document.querySelectorAll('.z40').length, kn: document.querySelectorAll('.k40-kn').length, cv: document.querySelectorAll('#s40 canvas').length}));
    await p.evaluate(() => V40.sec(3)); await p.waitForTimeout(1600); const s = await p.evaluate(() => ({mode: V40.mode, g: V39.GR[V40.sel]}));
    ok('3.1', 'WebGL alınamazsa CSS koridoruna düşülüyor, konsola uyarı yazılıyor, ekranda teknik mesaj yok, kapılar çalışıyor', !d.gl && d.z40 > 50 && d.kn === 18 && d.cv === 0 && p._warn.some(w => /\[V40\.2\] WebGL kullanılamıyor/.test(w)) && !/WebGL/.test(await p.evaluate(() => document.body.innerText)) && s.mode === 'odak' && s.g === 7 && !p._errs.length, {d, s, warn: p._warn.slice(0, 2)});
    await ctx.close();
  }

  // ---------- 4. Ekran boyutları, dokunma alanları ----------
  {
    const bad = [], small = [];
    for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [820, 1180], [1024, 768], [1180, 820], [1440, 900]]) {
      const ctx = await ctxWith(b, {w, h}); const p = await open(ctx);
      const chk = async name => { const r = await p.evaluate(() => { const iw = innerWidth, sw = document.documentElement.scrollWidth, s = document.getElementById('s40'), c = s && s.querySelector('canvas'), sr = s && s.getBoundingClientRect(), cr = c && c.getBoundingClientRect();
        const tiny = [...document.querySelectorAll('#s40 button:not(.k40)')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || getComputedStyle(e).visibility === 'hidden') return false; if (e.closest('.gs40')) return r.height < 43.5 || r.width < 30; return r.height < 43.5 || r.width < 43.5; }).map(e => e.className + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
        return {sw, iw, tiny, fit: !c || (Math.abs(cr.width - sr.width) < 1 && Math.abs(cr.height - sr.height) < 1 && c.width >= cr.width)}; });
        if (r.sw > r.iw + 1 || !r.fit) bad.push(`${w}px ${name}: sw=${r.sw} fit=${r.fit}`); if (r.tiny.length) small.push(`${w}px ${name}: ${r.tiny.slice(0, 3).join(' | ')}`); };
      await chk('giriş'); await p.evaluate(() => V40.sec(4)); await p.waitForTimeout(1600); await chk('odak');
      const gz = await p.addStyleTag({content: UIHIDE}); const s = await sahne(p); await gz.evaluate(e => e.remove()); if (s.koyuHucre > .5 || s.koyu > 3) bad.push(`${w}px odak: koyu bölge %${s.koyuHucre} / koyu piksel %${s.koyu}`);
      if ([360, 820, 1440].includes(w)) await p.screenshot({path: path.join(SHOT, `${w}x${h}_odak.png`)});
      await p.evaluate(() => V40.git(5)); await p.waitForTimeout(1800); if ([768, 1180, 1440].includes(w)) await p.screenshot({path: path.join(SHOT, `${w}x${h}_yuru.png`)});
      if (p._errs.length) bad.push(`${w}px hata: ${p._errs.join(';')}`);
      await ctx.close();
    }
    ok('4.1', '360 / 390 / 768 / 820×1180 / 1024×768 / 1180×820 / 1440×900: yatay taşma yok, çizim yüzeyi sahneyle aynı boyutta, odakta koyu bölge yok (koyu bronz sınıf tabelası tek hücre doldurabilir: ≤%0,5)', bad.length === 0, bad.slice(0, 6));
    ok('4.2', 'Koridor arayüzünde dokunma alanları ≥44 px (gösterge ≥30×44 px)', small.length === 0, small.slice(0, 6));
  }

  // ---------- 5. Kayıtlar ----------
  {
    const ctx = await ctxWith(b, {teacher: true, fav: {s: [7], k: []}}); const p = await open(ctx);
    const k0 = await p.evaluate(() => Object.fromEntries(['dk2', 'dk-ogretmen-v1', 'dk-ogretmen-pin', 'dk-deneyim39'].map(k => [k, localStorage.getItem(k)])));
    await p.evaluate(async () => { for (const i of [0, 4, 8]) { V40.sec(i); await new Promise(r => setTimeout(r, 400)); } V40.gir(8); await new Promise(r => setTimeout(r, 2600)); go('pdunya'); await new Promise(r => setTimeout(r, 400)); });
    const k1 = await p.evaluate(() => Object.fromEntries(['dk2', 'dk-ogretmen-v1', 'dk-ogretmen-pin', 'dk-deneyim39'].map(k => [k, localStorage.getItem(k)])));
    const il = await p.evaluate(() => JSON.parse(localStorage.getItem('dk-ilerleme39')));
    ok('5.1', 'Gezinti dk2, öğretmen kayıtları, PIN ve üyelik tercihini değiştirmiyor; favoriler ve eski ilerleme alanları korunuyor', JSON.stringify(k0) === JSON.stringify(k1) && il.fav.s.includes(7) && il.z.a === '1' && il.sonSinif === 12, {fav: il.fav, son: il.sonSinif});
    await p.evaluate(() => { const salt = 's'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 2, salt, h: V36.hash(salt, '1111'), len: 4})); go('ogretmen'); }); await p.waitForTimeout(500);
    ok('5.2', 'Öğretmen paneli premium oturumdan kendi tasarımıyla açılıyor', await p.evaluate(() => !document.body.hasAttribute('data-prem39') && document.body.hasAttribute('data-ogrt37') && !!document.querySelector('.og')));
    ok('5.3', 'Sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  await b.close(); srv.close(); fs.rmSync(TMP, {recursive: true, force: true});
  const f = R.filter(r => !r.pass);
  console.log(`\nToplam ${R.length} kontrol · geçti ${R.length - f.length} · kaldı ${f.length}`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify(R, null, 1));
  process.exit(f.length ? 1 : 0);
})().catch(e => { console.error('TEST BETİĞİ HATASI', e); process.exit(2); });
