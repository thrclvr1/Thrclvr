// V40.1 testleri (Playwright + Chromium, başsız). Depo kökünden:  node tests/v40_1/test_v401.js
// Kapı aydınlatma düzeltmesi: parlaklık ölçümleri (V40.0 ile karşılaştırmalı), doku üretimi ve hata durumu, sade/tam görünüm,
// farklı ekranlar, kapı konumu / gezinme gerilemesi. Parlaklık ekran görüntüsünden ölçülür (Python PIL).
// Tarayıcı otomasyonudur; gerçek cihaz testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
let V400, V401, IDX;
const R = [];
const ok = (id, name, pass, detail) => { R.push({id, name, pass: !!pass, detail}); console.log((pass ? 'GEÇTİ ' : 'KALDI ') + id + ' · ' + name + (detail !== undefined ? ' — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 380) : '')); };
const IGN = /Failed to load resource: the server responded with a status of 404/;
const OGRT_DATA = {v: 1, app: 'dkab-ogretmen', classes: [{g: 12, py: '2018'}], active: '12|2018', status: {}, plans: [], updatedAt: '2026-11-01T00:00:00.000Z'};
const PREM = {son: 'premium', hatirla: true}, NORMAL = {son: 'normal', hatirla: true};
const SHOT = path.join(ROOT, 'docs', 'V40.1_ekran'); fs.mkdirSync(SHOT, {recursive: true});
const TMP = path.join(__dirname, '.tmp'); fs.mkdirSync(TMP, {recursive: true});

async function ctxWith(b, {w = 390, h = 844, pref = PREM, lite = null, init = null, teacher = false} = {}) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700, hasTouch: true});
  await ctx.addInitScript(([pref, data, lite, teacher]) => {
    if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-theme', 'dark'); localStorage.setItem('dk-ogretmen-v1', JSON.stringify(data));
    localStorage.setItem('dk-deneyim39', JSON.stringify(pref)); const o = {z: {}, t: {}, prog: {}, son: {}, ipucu40: 1}; if (lite !== null) o.lite40 = lite; localStorage.setItem('dk-ilerleme39', JSON.stringify(o));
    if (teacher) { sessionStorage.setItem('dk-ogrt-oturum', '1'); sessionStorage.setItem('dk-editor-oturum38', '1'); }
  }, [pref, OGRT_DATA, lite, teacher]);
  if (init) await ctx.addInitScript(init);
  return ctx;
}
async function open(ctx, url) { const p = await ctx.newPage(); p._errs = []; p._warn = []; p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !IGN.test(m.text())) p._errs.push('console: ' + m.text()); if (m.type() === 'warning') p._warn.push(m.text()); }); await p.goto(url || IDX); await p.waitForTimeout(1700); return p; }
// Bir öğenin ekrandaki kutusunun iç kısmında (kenarlardan %pad içeride) parlaklık: ortalama, standart sapma, çok koyu piksel oranı
async function lum(p, sel, pad = .18) {
  const box = await p.evaluate(([sel, pad]) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); const x = Math.max(0, r.x + r.width * pad), y = Math.max(0, r.y + r.height * pad), w = Math.min(innerWidth, r.right - r.width * pad) - x, h = Math.min(innerHeight, r.bottom - r.height * pad) - y; return w > 3 && h > 3 ? {x, y, width: w, height: h} : null; }, [sel, pad]);
  if (!box) return null;
  const f = path.join(TMP, 'l.png'); fs.writeFileSync(f, await p.screenshot({clip: box}));
  return JSON.parse(cp.execSync(`python3 -c "
from PIL import Image, ImageStat
import json
im=Image.open('${f}').convert('L');s=ImageStat.Stat(im);h=im.histogram();n=sum(h)
print(json.dumps({'ort':round(s.mean[0],1),'ss':round(s.stddev[0],1),'koyu':round(100*sum(h[:40])/n,1)}))"`).toString());
}
const hideUI = p => p.addStyleTag({content: '.hava40x{}.ust40,.alt40,.yrd40,.ipu40{visibility:hidden!important}'});
const D = g => `.k40[data-g="${g}"]`;

(async () => {
  await new Promise(r => srv.listening ? r() : srv.once('listening', r));
  const B = 'http://127.0.0.1:' + srv.address().port;
  V400 = B + '/surumler/din-kulturu-platformu-v40.0.html'; V401 = B + '/surumler/din-kulturu-platformu-v40.1.html'; IDX = B + '/index.html';
  const b = await chromium.launch();

  // ---------- 0. Sürüm, veri; kapı konumları, pozlar ve diğer ekranlar V40.0 ile aynı ----------
  {
    const c0 = await ctxWith(b, {teacher: true}), c1 = await ctxWith(b, {teacher: true}), cI = await ctxWith(b);
    const p0 = await open(c0, V400), p1 = await open(c1, V401), pI = await open(cI, IDX);
    const snap = p => p.evaluate(() => ({ver: V31.VER, v40: V40.VER, routes: Object.keys(V30.routes).sort(), cols: Object.fromEntries(Object.keys(COL).map(c => [c, Store.all(c).length])), seeds: [...document.querySelectorAll('script[type="application/json"]')].map(s => s.id + ':' + s.textContent.length),
      doors: [...document.querySelectorAll('.k40')].map(k => k.dataset.g + '|' + k.dataset.i + '|' + k.closest('.k40-yer')._w + '|' + k.querySelector('.k40-tab').textContent), poz: [-1, 0, 3, 8].map(i => JSON.stringify([V40.durak(i), i >= 0 ? V40.odak(i) : 0, i >= 0 ? V40.giris(i) : 0])), yuzey: V40._els.map(e => e._w).join(';').length, n: V40._els.length}));
    const a = await snap(p0), z = await snap(p1), i = await snap(pI);
    ok('0.1', 'Sürüm V40.1 (index.html ve sürüm dosyası)', z.ver === 'V40.1' && i.ver === 'V40.1' && z.v40 === 'V40.1', z.ver);
    ok('0.2', 'Veri blokları, kayıt sayıları ve rotalar V40.0 ile aynı', JSON.stringify(a.seeds) === JSON.stringify(z.seeds) && JSON.stringify(a.cols) === JSON.stringify(z.cols) && JSON.stringify(a.routes) === JSON.stringify(z.routes));
    ok('0.3', '9 kapının konumu, sınıf eşleşmesi ve tabelası V40.0 ile birebir aynı', a.doors.length === 9 && JSON.stringify(a.doors) === JSON.stringify(z.doors), z.doors.map(d => d.split('|')[0]).join());
    ok('0.4', 'Kamera pozları (durak, odak, giriş) ve yüzey dönüşümleri V40.0 ile aynı', JSON.stringify(a.poz) === JSON.stringify(z.poz) && a.yuzey === z.yuzey && a.n === z.n);
    const sig = (p, v) => p.evaluate(async v => { const [r, x] = v.split(':'); if (r === 'topic') go('pders', {pt: Store.all('topics').find(t => t.sections && t.grade == 6).id, ptab: 'anlat'}); else if (r === 'psinif') go('psinif', {pg: +x}); else if (r === 'ogretmen') { const salt = 's'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 2, salt, h: V36.hash(salt, '1111'), len: 4})); go('ogretmen'); } else if (r === 'klasik') { V39.on = false; sessionStorage.removeItem('dk-deneyim39-aktif'); go(x); } else go(r);
      await new Promise(r => setTimeout(r, 800)); const P = ['color', 'backgroundColor', 'backgroundImage', 'fontSize', 'borderTopColor', 'borderRadius', 'display']; const out = [];
      [document.body, ...[...document.querySelectorAll('#app *')].slice(0, 400)].forEach(e => { const s = getComputedStyle(e); out.push(e.tagName + '.' + (e.getAttribute('class') || '').replace(/\b(rv|in|done|p40-gel)\b/g, '').trim() + ':' + P.map(k => s[k]).join('|')); }); return out; }, v);
    const diffs = [];
    for (const v of ['psinif:8', 'topic', 'pfav', 'pilerleme', 'games', 'ogretmen', 'klasik:home', 'klasik:classes']) { const s0 = await sig(p0, v), s1 = await sig(p1, v); const d = s0.filter((x, k) => x !== s1[k]).length + Math.abs(s0.length - s1.length); if (d) diffs.push(`${v}: ${d} fark (${s0.find((x, k) => x !== s1[k]) || ''})`); }
    ok('0.5', 'Koridor dışındaki ekranlar (sınıf merkezi, ders, favoriler, ilerleme, oyunlar, öğretmen paneli, Klasik ana sayfa ve sınıflar) V40.0 ile aynı', diffs.length === 0, diffs);
    ok('0.6', 'Sayfa/konsol hatası yok', !p1._errs.length && !pI._errs.length, p1._errs.concat(pI._errs));
    await c0.close(); await c1.close(); await cI.close();
  }

  // ---------- 1. Parlaklık: tam ve sade görünümde V40.0 ↔ V40.1 ----------
  const olc = async (url, lite) => {
    const ctx = await ctxWith(b, {lite}); const p = await open(ctx, url); await hideUI(p); const o = {};
    await p.evaluate(() => V40.git(2)); await p.waitForTimeout(1500);
    o.yuru = await lum(p, D(6) + ' .k40-kn.l .pb'); o.yuruKafes = await lum(p, D(6) + ' .k40-kn.l .pa');
    await p.evaluate(() => V40._kap[2].classList.add('kis')); await p.waitForTimeout(700); o.kisik = await lum(p, D(6) + ' .k40-kn.l .pb'); await p.evaluate(() => V40._kap[2].classList.remove('kis'));
    await p.evaluate(() => V40.sec(2)); await p.waitForTimeout(1600);
    o.odak = await lum(p, D(6) + ' .k40-kn.l .pb'); o.odakSag = await lum(p, D(6) + ' .k40-kn.r .pb'); o.kafes = await lum(p, D(6) + ' .k40-kn.r .pa'); o.kol = await lum(p, D(6) + ' .k40-kn.l .ku', .2); o.ust = await lum(p, D(6) + ' .k40-tr', .25); o.kapi = await lum(p, D(6) + ' .k40-ic', .04);
    o.kasa = await p.evaluate(() => getComputedStyle(document.querySelector('.k40.sec .k40-cer')).borderTopColor);
    await p.evaluate(() => { document.querySelector('.k40.sec .k40-hl').style.visibility = 'hidden'; }); await p.waitForTimeout(150); o.odakHalesiz = await lum(p, D(6) + ' .k40-kn.l .pb'); o.kapiHalesiz = await lum(p, D(6) + ' .k40-ic', .04);
    await p.evaluate(() => { document.querySelector('.k40.sec .k40-hl').style.visibility = ''; });
    o.bg = await p.evaluate(() => getComputedStyle(document.querySelector('.k40-kn')).backgroundImage.replace(/data:image\/(\w+)[^"]*/g, 'data:image/$1…').slice(0, 400));
    o.doku = await p.evaluate(() => ({durum: V40.texDurum || null, ds: document.getElementById('p40').dataset.doku || '', cls: document.getElementById('p40').className}));
    o.p = p; o.ctx = ctx; return o;
  };
  const A = await olc(V400, 0), Z = await olc(V401, 0);
  ok('1.1', 'Tam görünüm, yürüme durağı: kanat yüzeyi V40.0’dan belirgin biçimde aydınlık (ortalama parlaklık ≥85 ve en az +25)', Z.yuru.ort >= 85 && Z.yuru.ort >= A.yuru.ort + 25, {v400: A.yuru, v401: Z.yuru});
  ok('1.2', 'Tam görünüm, kapıya dönükken: iki kanat da aydınlık (≥85; damar farkı dışında birbirine yakın, fark ≤15) ve V40.0’dan en az +25', Z.odak.ort >= 85 && Z.odakSag.ort >= 85 && Math.abs(Z.odak.ort - Z.odakSag.ort) <= 15 && Z.odak.ort >= A.odak.ort + 25 && Z.odakSag.ort >= A.odakSag.ort + 25, {v400: [A.odak.ort, A.odakSag.ort], v401: [Z.odak.ort, Z.odakSag.ort]});
  ok('1.3', 'Ahşap damarı görünür (düz renk değil): panel içinde parlaklık dağılımı var', Z.odak.ss >= 3 && Z.yuru.ss >= 2, {odak: Z.odak, yuru: Z.yuru});
  ok('1.4', 'Kapının bütününde siyaha yakın piksel oranı çok düşük (≤%3)', Z.kapi.koyu <= 3 && Z.yuru.koyu <= 1 && Z.odak.koyu <= 1, {kapi: Z.kapi, v400: A.kapi});
  ok('1.5', 'Ayrıntılar seçiliyor: kafes süsü (kontrast), kapı kolu (kanattan ≥40 parlak), üst pencere (≥120), kasa rengi kanattan ayrı', Z.kafes.ss >= 8 && Z.kol.ort >= Z.odak.ort + 40 && Z.ust.ort >= 120 && Z.kasa === 'rgb(108, 65, 36)', {kafes: Z.kafes, kol: Z.kol, ust: Z.ust, kasa: Z.kasa});
  ok('1.6', 'Seçim ışığı kapı yüzeyini örtmüyor: hale açık/kapalı kanat parlaklığı farkı ≤3, kapı bütününde ≤4', Math.abs(Z.odak.ort - Z.odakHalesiz.ort) <= 3 && Math.abs(Z.kapi.ort - Z.kapiHalesiz.ort) <= 4, {hale: Z.odak.ort, halesiz: Z.odakHalesiz.ort, kapi: [Z.kapi.ort, Z.kapiHalesiz.ort]});
  ok('1.7', 'Seçili olmayan (kısılan) kapı siyaha gömülmüyor: parlaklık ≥60 (V40.0’da daha koyuydu)', Z.kisik.ort >= 60 && Z.kisik.ort > A.kisik.ort + 20, {v400: A.kisik, v401: Z.kisik});
  await Z.p.screenshot({path: path.join(SHOT, '390_tam_odak.png')});
  // açılış: iki kanat, ön/arka yüz
  await Z.p.evaluate(() => V40._kap[2].classList.add('acik')); await Z.p.waitForTimeout(900); // kanatlar açık, kamera sabit: iki kanadın görünen yüzü ölçülür
  const ac = {l: await lum(Z.p, D(6) + ' .k40-kn.l', .1), r: await lum(Z.p, D(6) + ' .k40-kn.r', .1), ic: await lum(Z.p, D(6) + ' .k40-ic', .2), m: await Z.p.evaluate(() => [...document.querySelectorAll('.k40.acik .k40-kn')].map(e => getComputedStyle(e).transform.slice(0, 8) + '|' + getComputedStyle(e).backfaceVisibility + '|' + getComputedStyle(e, '::after').opacity))};
  await Z.p.screenshot({path: path.join(SHOT, '390_tam_acik.png')});
  ok('1.8', 'Kapı açıkken iki kanadın görünen (arka) yüzü de aydınlık (≥85), iç mekân aydınlık; kanatlar 3B dönmüş', ac.l && ac.r && ac.l.ort >= 85 && ac.r.ort >= 85 && ac.l.koyu <= 3 && ac.r.koyu <= 3 && ac.ic.ort >= 120 && ac.m.length === 2 && ac.m.every(x => x.startsWith('matrix3d') && x.includes('visible')), ac);
  await Z.p.evaluate(() => V40._kap[2].classList.remove('acik')); await Z.p.waitForTimeout(800);
  await Z.p.evaluate(() => V40.gir(2)); await Z.p.waitForTimeout(2600);
  ok('1.9', 'Açılış animasyonu sınıf merkezine ulaşıyor', await Z.p.evaluate(() => view === 'psinif' && G.pg === 6));
  await A.ctx.close(); await Z.ctx.close();
  {
    const A2 = await olc(V400, 1), Z2 = await olc(V401, 1);
    ok('1.10', 'Sade görünüm: kanatlar aydınlık (yürürken ve kapıya dönükken ≥85) ve V40.0 sade görünümünden en az +25', Z2.yuru.ort >= 85 && Z2.odak.ort >= 85 && Z2.odakSag.ort >= 85 && Z2.odak.ort >= A2.odak.ort + 25 && Z2.doku.cls.includes('lite'), {v400: [A2.yuru.ort, A2.odak.ort], v401: [Z2.yuru.ort, Z2.odak.ort]});
    ok('1.11', 'Sade görünümde de ahşap damarı var (yedek doku), kafes ve kol seçiliyor, kısılan kapı ≥60', Z2.odak.ss >= 2.5 && /svg/.test(Z2.bg) && Z2.kafes.ss >= 8 && Z2.kol.ort >= Z2.odak.ort + 40 && Z2.kisik.ort >= 60, {odak: Z2.odak, kafes: Z2.kafes, kisik: Z2.kisik, bg: Z2.bg.slice(0, 160)});
    await Z2.p.screenshot({path: path.join(SHOT, '390_sade_odak.png')});
    await Z2.p.evaluate(() => V40.git(2)); await Z2.p.waitForTimeout(1500); await Z2.p.screenshot({path: path.join(SHOT, '390_sade_yuru.png')});
    await A2.ctx.close(); await Z2.ctx.close();
  }

  // ---------- 2. Doku üretimi: doğrulama, hata durumu, yedek ----------
  {
    const ctx = await ctxWith(b, {lite: 0}); const p = await open(ctx);
    const t = await p.evaluate(() => ({d: V40.texDurum, ds: document.getElementById('p40').dataset.doku, vars: ['mermer', 'koyu', 'ceviz', 'tas'].map(k => document.getElementById('p40').style.getPropertyValue('--t-' + k).slice(0, 22)), kn: getComputedStyle(document.querySelector('.k40-kn')).backgroundImage.includes('data:image/webp') || getComputedStyle(document.querySelector('.k40-kn')).backgroundImage.includes('data:image/png'), lam: /data:image\/(webp|png)/.test(getComputedStyle(document.querySelector('.z40 .lam')).backgroundImage), zem: /data:image\/(webp|png)/.test(getComputedStyle(document.querySelector('.z40.zem')).backgroundImage), kb: Math.round(Object.values(V40.tex).reduce((a, u) => a + u.length, 0) / 1024)}));
    ok('2.1', 'Dört doku canvas ile üretildi, doğrulandı ve CSS değişkenlerine uygulandı (kanat, lambri, zemin hesaplanmış stilinde)', t.d.kaynak === 'canvas' && t.d.ok.length === 4 && !t.d.hata.length && t.ds === 'canvas' && t.vars.every(v => v.startsWith('url("data:image/')) && t.kn && t.lam && t.zem, {durum: t.d, kb: t.kb});
    ok('2.2', 'Normal durumda konsolda doku uyarısı ve sayfa hatası yok', !p._warn.some(w => /V40\.1/.test(w)) && !p._errs.length, p._warn.concat(p._errs));
    await ctx.close();
  }
  for (const [id, ad, init, bekle] of [
    ['2.3', 'toDataURL hata veriyor', () => { HTMLCanvasElement.prototype.toDataURL = function () { throw new Error('test: toDataURL engelli'); }; }, h => h.length === 4 && h.every(x => /toDataURL engelli/.test(x.mesaj))],
    ['2.4', 'canvas 2B bağlamı yok', () => { HTMLCanvasElement.prototype.getContext = function () { return null; }; }, h => h.length === 1 && h[0].ad === 'canvas'],
    ['2.5', 'canvas çıktısı bozuk (boş veri)', () => { HTMLCanvasElement.prototype.toDataURL = function () { return 'data:,'; }; }, h => h.length === 4 && h.every(x => /geçersiz doku çıktısı/.test(x.mesaj))]]) {
    const ctx = await ctxWith(b, {lite: 0, init}); const p = await open(ctx); await hideUI(p);
    await p.evaluate(() => V40.sec(2)); await p.waitForTimeout(1600);
    const t = await p.evaluate(() => ({d: V40.texDurum, ds: document.getElementById('p40').dataset.doku, v: document.getElementById('p40').style.getPropertyValue('--t-ceviz'), kn: getComputedStyle(document.querySelector('.k40-kn')).backgroundImage.includes('data:image/svg+xml'), txt: /doku üretilemedi|Error|hata/i.test(document.getElementById('s40').innerText), toast: (document.getElementById('v-toasts') || {}).textContent || ''}));
    const l = await lum(p, D(6) + ' .k40-kn.l .pb'), kp = await lum(p, D(6) + ' .k40-ic', .04);
    if (id === '2.3') await p.screenshot({path: path.join(SHOT, '390_doku_hatasi_yedek.png')});
    ok(id, `Doku hatası (${ad}): hata kaydedildi ve konsola yazıldı, kullanıcıya teknik mesaj yok, aydınlık yedek ceviz dokusu kullanıldı (parlaklık ≥85, koyu piksel ≤%3)`, t.d.kaynak === 'yedek' && bekle(t.d.hata) && p._warn.filter(w => /\[V40\.1\] doku üretilemedi/.test(w)).length === t.d.hata.length && !p._errs.length && t.v === '' && t.kn && !t.txt && !t.toast && l.ort >= 85 && l.ss >= 2.5 && kp.koyu <= 3, {hata: t.d.hata.slice(0, 2), uyarı: p._warn.length, l, kp});
    await ctx.close();
  }

  // ---------- 3. Ekran boyutları ve bakış açıları ----------
  {
    const rows = [], bad = [];
    for (const [w, h] of [[360, 740], [390, 844], [820, 1180], [1024, 768], [1180, 820], [1440, 900]]) {
      const ctx = await ctxWith(b, {w, h, lite: 0}); const p = await open(ctx); await hideUI(p);
      for (const [i, g] of [[0, 4], [5, 9], [8, 12]]) {
        await p.evaluate(i => V40.git(i), i); await p.waitForTimeout(1900); const y = await lum(p, D(g) + ' .k40-kn.l .pb');
        await p.evaluate(i => V40.sec(i), i); await p.waitForTimeout(1600); const o = await lum(p, D(g) + ' .k40-kn.r .pb'), k = await lum(p, D(g) + ' .k40-ic', .04);
        rows.push([w, g, y && y.ort, o && o.ort, k && k.koyu]); if (!y || !o || y.ort < 80 || o.ort < 85 || k.koyu > 3) bad.push([w, g, y, o, k]);
        if ((w === 1440 && g === 9) || (w === 820 && g === 4) || (w === 1024 && g === 12)) await p.screenshot({path: path.join(SHOT, `${w}x${h}_odak_${g}.png`)});
        if (w === 1440 && g === 9) { await p.evaluate(() => V40.git(5)); await p.waitForTimeout(1500); await p.screenshot({path: path.join(SHOT, '1440x900_yuru.png')}); }
      }
      // girişten bakış: uzaktaki kapılar da okunur
      await p.evaluate(() => V40.git(-1)); await p.waitForTimeout(2000); const far = await lum(p, D(4) + ' .k40-kn.l', .25); rows.push([w, 'giriş', far && far.ort]); if (!far || far.ort < 75) bad.push([w, 'giriş', far]);
      if (w === 390) await p.screenshot({path: path.join(SHOT, '390_giris.png')});
      if (p._errs.length) bad.push([w, 'hata', p._errs]);
      await ctx.close();
    }
    ok('3.1', '360 / 390 / 820×1180 / 1024×768 / 1180×820 / 1440×900: 4, 9 ve 12. sınıf kapıları yürürken (≥80) ve kapıya dönükken (≥85) aydınlık; girişten bakışta ≥75; koyu piksel ≤%3', bad.length === 0, bad.length ? bad.slice(0, 4) : rows.slice(0, 8));
  }

  // ---------- 4. Gezinme gerilemesi (özet; ayrıntılı gezinme testleri tests/v40) ----------
  {
    const ctx = await ctxWith(b, {lite: 0}); const p = await open(ctx);
    const sb = await p.evaluate(() => { const r = document.getElementById('s40').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height * .55}; });
    await p.mouse.move(sb.x + 140, sb.y); await p.mouse.down(); for (let k = 1; k <= 12; k++) { await p.mouse.move(sb.x + 140 - k * 22, sb.y); await p.waitForTimeout(16); } await p.mouse.up(); await p.waitForTimeout(1300);
    const d1 = await p.evaluate(() => ({s: V40.s, mode: V40.mode}));
    await p.evaluate(() => V40.git(3)); await p.waitForTimeout(1500);
    const c = await p.evaluate(() => { const r = document.querySelector('.k40[data-g="7"] .k40-ic').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height * .6}; });
    await p.mouse.click(c.x, c.y); await p.waitForTimeout(1600); const s1 = await p.evaluate(() => ({mode: V40.mode, g: V39.GR[V40.sel], kis: document.querySelectorAll('.k40.kis').length}));
    await p.click('.gir40'); await p.waitForTimeout(2600); const e1 = await p.evaluate(() => ({view, pg: G.pg}));
    await p.click('.p39-cr button'); await p.waitForTimeout(1700); const r1 = await p.evaluate(() => ({view, mode: V40.mode, g: V39.GR[V40.sel], acik: document.querySelectorAll('.k40.acik').length}));
    ok('4.1', 'Sürükleyerek yürüme, kapı seçimi, kapıdan giriş ve aynı kapıya dönüş V40.0’daki gibi çalışıyor', d1.s >= 0 && d1.mode === 'yuru' && s1.mode === 'odak' && s1.g === 7 && s1.kis === 8 && e1.view === 'psinif' && e1.pg === 7 && r1.view === 'pdunya' && r1.g === 7 && r1.acik === 0, {d1, s1, e1, r1});
    ok('4.2', 'Sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  await b.close(); srv.close(); fs.rmSync(TMP, {recursive: true, force: true});
  const f = R.filter(r => !r.pass);
  console.log(`\nToplam ${R.length} kontrol · geçti ${R.length - f.length} · kaldı ${f.length}`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify(R, null, 1));
  process.exit(f.length ? 1 : 0);
})().catch(e => { console.error('TEST BETİĞİ HATASI', e); process.exit(2); });
