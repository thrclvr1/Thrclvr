// V40.0 testleri (Playwright + Chromium, başsız). Depo kökünden:  node tests/v40/test_v400.js
// Tarayıcı otomasyonudur; gerçek cihaz testi değildir. Telefon/tablet ölçüleri ve dokunmatik giriş emüle edilir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
let V39, V40, IDX;
const R = [];
const ok = (id, name, pass, detail) => { R.push({id, name, pass: !!pass, detail}); console.log((pass ? 'GEÇTİ ' : 'KALDI ') + id + ' · ' + name + (detail !== undefined ? ' — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 360) : '')); };
const IGN = /Failed to load resource: the server responded with a status of 404/; // isteğe bağlı assets/audio/manifest.json (V33'ten beri)
const OGRT_DATA = {v: 1, app: 'dkab-ogretmen', classes: [{g: 12, py: '2018'}, {g: 5, py: '2026'}], active: '12|2018', status: {'DKAB18-12-U02-O01': 'isl'}, plans: [], updatedAt: '2026-11-01T00:00:00.000Z'};
const ILR_OLD = {z: {}, t: {}, prog: {}, son: {}, sonSinif: 0, ipucu40: 1};
const NORMAL = {son: 'normal', hatirla: true}, PREM = {son: 'premium', hatirla: true};
const SHOT = path.join(ROOT, 'docs', 'V40.0_ekran'); fs.mkdirSync(SHOT, {recursive: true});
const TMP = path.join(__dirname, '.tmp'); fs.mkdirSync(TMP, {recursive: true});

async function ctxWith(b, {w = 390, h = 844, pref = null, reduced = false, teacher = false, ilr = ILR_OLD} = {}) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700, hasTouch: true, reducedMotion: reduced ? 'reduce' : 'no-preference'});
  await ctx.addInitScript(([pref, data, teacher, ilr]) => {
    if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-theme', 'dark'); localStorage.setItem('dk-ogretmen-v1', JSON.stringify(data));
    if (pref) localStorage.setItem('dk-deneyim39', JSON.stringify(pref));
    if (ilr) localStorage.setItem('dk-ilerleme39', JSON.stringify(ilr));
    if (teacher) { sessionStorage.setItem('dk-ogrt-oturum', '1'); sessionStorage.setItem('dk-editor-oturum38', '1'); }
  }, [pref, OGRT_DATA, teacher, ilr]);
  return ctx;
}
async function open(ctx, url) { const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !IGN.test(m.text())) p._errs.push('console: ' + m.text()); }); await p.goto(url || IDX); await p.waitForTimeout(1600); return p; }
const settle = (p, ms = 1700) => p.waitForTimeout(ms);
// sahne alanında arka plan rengi (#140d08) oranı: çizilmemiş bölge ölçüsü
async function bosOran(p) {
  const box = await p.evaluate(() => { const r = document.getElementById('s40').getBoundingClientRect(); return {x: r.x, y: Math.max(0, r.y), width: r.width, height: Math.min(r.height, innerHeight - Math.max(0, r.y))}; });
  const f = path.join(TMP, 'bos.png'); fs.writeFileSync(f, await p.screenshot({clip: box}));
  return +cp.execSync(`python3 -c "
from PIL import Image
im=Image.open('${f}').convert('RGB');W,H=im.size;px=im.load();n=t=0
for y in range(0,H,3):
  for x in range(0,W,3):
    t+=1;r,g,b=px[x,y]
    if abs(r-20)<=3 and abs(g-13)<=3 and abs(b-8)<=3:n+=1
print(round(100*n/t,2))"`).toString().trim();
}

(async () => {
  await new Promise(r => srv.listening ? r() : srv.once('listening', r));
  const B = 'http://127.0.0.1:' + srv.address().port;
  V39 = B + '/surumler/din-kulturu-platformu-v39.0.html'; V40 = B + '/surumler/din-kulturu-platformu-v40.0.html'; IDX = B + '/index.html';
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});

  // ---------- 0. Sürüm, veri; Normal ekranlar, öğretmen/editör ve diğer Premium ekranlar V39 ile aynı ----------
  {
    const c9 = await ctxWith(b, {pref: NORMAL, teacher: true}), c0 = await ctxWith(b, {pref: NORMAL, teacher: true}), cI = await ctxWith(b, {pref: NORMAL});
    const p9 = await open(c9, V39), p0 = await open(c0, V40), pI = await open(cI, IDX);
    const snap = p => p.evaluate(() => ({ver: V31.VER, routes: Object.keys(V30.routes).sort(), cols: Object.fromEntries(Object.keys(COL).map(c => [c, Store.all(c).length])), seeds: [...document.querySelectorAll('script[type="application/json"]')].map(s => s.id + ':' + s.textContent.length)}));
    const a = await snap(p9), z = await snap(p0), i = await snap(pI);
    ok('0.1', 'Sürüm V40.0 (index.html ve sürüm dosyası)', z.ver === 'V40.0' && i.ver === 'V40.0', z.ver);
    ok('0.2', 'Veri blokları V39 ile aynı', JSON.stringify(a.seeds) === JSON.stringify(z.seeds));
    ok('0.3', 'Koleksiyon kayıt sayıları V39 ile aynı (ayrı premium içerik kaydı yok)', JSON.stringify(a.cols) === JSON.stringify(z.cols), z.cols);
    ok('0.4', 'V39 rotaları korunuyor; yalnızca Favoriler (pfav) eklendi', a.routes.every(r => z.routes.includes(r)) && z.routes.filter(r => !a.routes.includes(r)).join() === 'pfav', z.routes.filter(r => !a.routes.includes(r)));
    const sig = (p, v) => p.evaluate(async v => { const [r, x] = v.split(':'); if (r === 'topic') go('topic', {t: Store.all('topics').find(t => t.sections && t.grade == 6).id, tab: x || 'anlat'}); else if (r === 'grade') go('grade', {g: +x}); else if (r === 'ogretmen') { const salt = 's'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 2, salt, h: V36.hash(salt, '1111'), len: 4})); go('ogretmen'); OGRT.S().tab = x; OGRT.render(); } else if (r === 'editor') { localStorage.setItem('dk-editor-pin38', JSON.stringify({v: 1, salt: 'e', h: V38.edHash('e', '583920')})); G.ed = {k: '', cid: '', mode: '', f: null, n: 30, cmp: ''}; go('editor'); } else if (r === 'punite') go('punite', {pg: 8, pu: V39.units(8, V39.pv(8))[0].id}); else if (r === 'pozet') go('pozet', {pg: 6}); else go(r);
      await new Promise(r => setTimeout(r, 900)); const P = ['color', 'backgroundColor', 'backgroundImage', 'fontSize', 'fontWeight', 'borderTopColor', 'borderRadius', 'paddingTop', 'display']; const out = [String(document.body.hasAttribute('data-prem39'))];
      [document.body, document.querySelector('header.top'), document.querySelector('nav.bnav'), ...[...document.querySelectorAll('#app *')].slice(0, 450)].forEach(e => { if (!e) return; const s = getComputedStyle(e); out.push(e.tagName + '.' + (e.getAttribute('class') || '').replace(/\b(rv|in|done)\b/g, '').trim() + ':' + P.map(k => s[k]).join('|')); }); return out; }, v);
    const diffs = [];
    for (const v of ['home', 'classes', 'grade:4', 'grade:8', 'grade:12', 'topic:anlat', 'topic:test', 'games', 'dene', 'pek', 'ogretmen:hafta', 'ogretmen:genel', 'editor']) { const s9 = await sig(p9, v), s0 = await sig(p0, v); const d = s9.filter((x, k) => x !== s0[k]).length + Math.abs(s9.length - s0.length); if (d) diffs.push(`${v}: ${d} fark (${s9.find((x, k) => x !== s0[k]) || ''} ↔ ${s0.find((x, k) => x !== s9[k]) || ''})`); }
    ok('0.5', 'Normal üyelik ekranları ile öğretmen paneli ve Editör alanı V39 ile birebir aynı (13 ekran, hesaplanmış stiller)', diffs.length === 0, diffs);
    const d2 = [];
    for (const v of ['punite', 'pozet', 'pilerleme']) { const s9 = await sig(p9, v), s0 = await sig(p0, v); const d = s9.filter((x, k) => x !== s0[k]).length + Math.abs(s9.length - s0.length); if (d) d2.push(`${v}: ${d} fark`); }
    ok('0.6', 'Değiştirilmeyen Premium ekranları (ünite, özet, ilerleme) V39 ile aynı', d2.length === 0, d2);
    ok('0.7', 'Açılışta ve ekran geçişlerinde sayfa/konsol hatası yok', !p0._errs.length && !pI._errs.length, p0._errs.concat(pI._errs));
    await c9.close(); await c0.close(); await cI.close();
  }

  // ---------- 1. Koridor yerleşimi: 9 kapı, sol/sağ, derinlik ----------
  {
    const ctx = await ctxWith(b, {pref: PREM}); const p = await open(ctx);
    const L = await p.evaluate(() => {
      const D = [...document.querySelectorAll('.k40')].map(k => { const y = k.closest('.k40-yer'), tr = y._w || y.style.transform; const m = tr.match(/translate3d\(([-\d.]+)px, ?([-\d.]+)px, ?([-\d.]+)px\)/); return {g: +k.dataset.g, x: +m[1], z: +m[3], rot: (tr.match(/rotateY\(([-\d.]+)deg\)/) || [0, '0'])[1], tab: k.querySelector('.k40-tab b').textContent, st: k.querySelector('.k40-tab small').textContent}; });
      return {view, n: D.length, D, GR: V39.GR, stages: V39.GR.map(V39.stage), mode: V40.mode, s: V40.s, pre3d: getComputedStyle(document.getElementById('k40')).transformStyle, per: getComputedStyle(document.getElementById('k40')).perspective};
    });
    ok('1.1', 'Premium açılışında koridor (pdunya) ve 9 kapı; sıra ve sınıf adları gerçek veriden (V39.GR, aşama)', L.view === 'pdunya' && L.n === 9 && L.D.map(d => d.g).join() === L.GR.join() && L.D.every((d, i) => d.tab === d.g + '. Sınıf' && d.st === L.stages[i]), L.D.map(d => d.tab + '/' + d.st));
    const left = L.D.filter(d => d.rot === '90'), right = L.D.filter(d => d.rot === '-90'), end = L.D.filter(d => d.rot === '0');
    ok('1.2', 'Kapılar iki duvarda dengeli: 4-6-8-10 sol duvar, 5-7-9-11 sağ duvar, 12 koridorun sonundaki odak duvarında', left.map(d => d.g).join() === '4,6,8,10' && right.map(d => d.g).join() === '5,7,9,11' && end.map(d => d.g).join() === '12' && left.every(d => d.x === -480) && right.every(d => d.x === 480), {sol: left.map(d => d.g), sag: right.map(d => d.g), uc: end.map(d => d.g)});
    const zs = L.D.map(d => d.rot === '90' ? d.z - 125 : d.rot === '-90' ? d.z + 125 : d.z), zsSide = zs.slice(0, 8); // kapı merkezleri
    ok('1.3', 'Kapılar koridor boyunca derinlikte sıralı (sınıf büyüdükçe uzaklaşıyor), birbirinin üstüne binmiyor', zs.every((z, i) => !i || z < zs[i - 1]) && zsSide.every((z, i) => !i || zsSide[i - 1] - z >= 400), zs);
    const sz = await p.evaluate(() => [...document.querySelectorAll('.k40-ic')].map(e => { const r = e.getBoundingClientRect(); return Math.round(r.height); }));
    ok('1.4', 'Perspektif: girişten bakınca yakın kapı büyük, uzak kapı küçük görünüyor (gerçek izdüşüm)', sz[0] > sz[2] && sz[2] > sz[4] && sz[4] > sz[6] && sz[0] > 2 * sz[6], sz);
    ok('1.5', 'Ortak 3B bağlam yok (her yüzey kendi perspektifiyle çiziliyor); açılış konumu koridor girişi', L.pre3d === 'flat' && /px/.test(L.per) && L.mode === 'yuru' && L.s === -1, L);
    await p.screenshot({path: path.join(SHOT, '390_giris.png')});
    ok('1.6', 'Sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  // ---------- 2. Kamera: sürükleme, düğmeler, klavye, dikey kaydırma ----------
  {
    const ctx = await ctxWith(b, {pref: PREM}); const p = await open(ctx);
    const st = () => p.evaluate(() => ({s: +V40.s.toFixed(2), x: +V40.cam.x.toFixed(1), z: +V40.cam.z.toFixed(1), yaw: +V40.cam.yaw.toFixed(1), mode: V40.mode, sel: V40.sel, floor: (() => { const r = document.querySelector('.z40.zem:not([style*="hidden"])').getBoundingClientRect(); return Math.round(r.top); })(), cur: [...document.querySelectorAll('.gs40 button')].findIndex(b => b.classList.contains('on'))}));
    const s0 = await st();
    const sb = await p.evaluate(() => { const r = document.getElementById('s40').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height * .55, w: r.width}; });
    await p.mouse.move(sb.x + 140, sb.y); await p.mouse.down(); for (let k = 1; k <= 12; k++) { await p.mouse.move(sb.x + 140 - k * 22, sb.y); await p.waitForTimeout(16); }
    const mid = await st(); await p.mouse.up(); await settle(p, 1200); const s1 = await st();
    ok('2.1', 'Sola sürükleme kamerayı koridorda ileri yürütüyor (dünya hareket ediyor; kamera z azalıyor, bakış açısı değişiyor)', mid.s > s0.s && mid.z < s0.z - 100 && s1.s >= 0 && Number.isInteger(s1.s) && s1.yaw !== s0.yaw, {s0, mid, s1});
    await p.mouse.move(sb.x - 140, sb.y); await p.mouse.down(); for (let k = 1; k <= 12; k++) { await p.mouse.move(sb.x - 140 + k * 22, sb.y); await p.waitForTimeout(16); } await p.mouse.up(); await settle(p, 1200);
    const s2 = await st();
    ok('2.2', 'Sağa sürükleme geri yürütüyor; bırakınca en yakın durağa oturuyor', s2.s < s1.s && Number.isInteger(s2.s), {s1, s2});
    await p.evaluate(() => V40.git(0)); await settle(p, 900);
    await p.click('#y40i'); await settle(p, 1100); const b1 = await st(); await p.click('#y40i'); await settle(p, 1100); const b2 = await st(); await p.click('#y40g'); await settle(p, 1100); const b3 = await st();
    ok('2.3', 'İleri / Geri düğmeleri bir kapı ileri-geri yürüyor; gösterge güncelleniyor', b1.s === 1 && b2.s === 2 && b3.s === 1 && b3.cur === 1 && b2.z < b1.z, [b1, b2, b3]);
    await p.focus('#s40'); await p.keyboard.press('ArrowRight'); await settle(p, 1000); const k1 = await st(); await p.keyboard.press('ArrowLeft'); await settle(p, 1000); const k2 = await st();
    ok('2.4', 'Klavye: sağ/sol ok tuşları yürütüyor', k1.s === 2 && k2.s === 1, [k1, k2]);
    const ta = await p.evaluate(() => getComputedStyle(document.getElementById('s40')).touchAction);
    const v0 = await st(); await p.mouse.move(sb.x, sb.y + 60); await p.mouse.down(); for (let k = 1; k <= 8; k++) { await p.mouse.move(sb.x + 2, sb.y + 60 - k * 18); await p.waitForTimeout(16); } await p.mouse.up(); await settle(p, 500); const v1 = await st();
    ok('2.5', 'Dikey hareket kamerayı yürütmüyor; sayfanın dikey kaydırması açık (touch-action: pan-y)', ta === 'pan-y' && v1.s === v0.s && v1.mode === v0.mode, {ta, v0: v0.s, v1: v1.s});
    await p.click('.gs40 button[data-i="7"]'); await settle(p, 1800); const g7 = await st();
    ok('2.6', 'Alttaki 4–12 göstergesinden doğrudan bir kapıya gidiliyor', g7.s === 7 && g7.cur === 7, g7);
    ok('2.7', 'Sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  // ---------- 3. Kapı seçimi, açılış, sınıf merkezine giriş, dönüş ----------
  {
    const ctx = await ctxWith(b, {pref: PREM}); const p = await open(ctx);
    await p.evaluate(() => V40.git(2)); await settle(p, 1500);
    const ctr = await p.evaluate(() => { const r = document.querySelector('.k40[data-g="6"] .k40-ic').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height * .6}; });
    await p.mouse.click(ctr.x, ctr.y); await settle(p, 1600);
    const se = await p.evaluate(() => { const g = 6, py = V39.pv(g), U = V39.units(g, py), T = U.reduce((a, u) => a + V39.tops(u.id).length, 0); return {mode: V40.mode, sel: V40.sel, yaw: Math.round(V40.cam.yaw), sec: document.querySelector('.k40.sec').dataset.g, kis: document.querySelectorAll('.k40.kis').length, hl: getComputedStyle(document.querySelector('.k40.sec .k40-hl')).opacity, info: document.getElementById('b40').textContent.replace(/\s+/g, ' '), want: `${U.length} ünite · ${T} konu`, pv: V39.pyName(py)}; });
    ok('3.1', 'Kapıya dokununca kamera kapıya dönüyor, kapı altın ışıkla seçiliyor, diğerleri kısılıyor', se.mode === 'odak' && se.sel === 2 && se.yaw === -90 && se.sec === '6' && se.kis === 8 && se.hl === '1', se);
    ok('3.2', 'Alt panelde sınıf adı, aşama, program ve gerçek ünite/konu sayısı', se.info.includes('6. Sınıf') && se.info.includes('Ortaokul') && se.info.includes(se.want) && se.info.includes(se.pv), se.info);
    await p.screenshot({path: path.join(SHOT, '390_kapi_secili.png')});
    const ctr2 = await p.evaluate(() => { const r = document.querySelector('.k40[data-g="6"] .k40-ic').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height * .6}; });
    await p.mouse.click(ctr2.x, ctr2.y); await p.waitForTimeout(420);
    const op = await p.evaluate(() => ({acik: document.querySelector('.k40[data-g="6"]').classList.contains('acik'), l: getComputedStyle(document.querySelector('.k40[data-g="6"] .k40-kn.l')).transform, r: getComputedStyle(document.querySelector('.k40[data-g="6"] .k40-kn.r')).transform, view}));
    await p.screenshot({path: path.join(SHOT, '390_kapi_aciliyor.png')});
    await p.waitForTimeout(500); const pd = await p.evaluate(() => ({perde: document.getElementById('pd40') && document.getElementById('pd40').classList.contains('on'), z: Math.round(V40.cam.x)}));
    ok('3.3', 'İkinci dokunuşta kapı kanatları menteşe ekseninde dönerek açılıyor (3B dönüş, yalnızca saydamlık değil)', op.acik && op.l.startsWith('matrix3d') && op.r.startsWith('matrix3d') && op.view === 'pdunya', op);
    await settle(p, 1500);
    const cc = await p.evaluate(() => ({view, pg: G.pg, tools: [...document.querySelectorAll('.ar40 button b')].map(x => x.textContent), gel: !!document.querySelector('.p40-gel'), son: V39.ilr().sonSinif}));
    ok('3.4', 'Kamera kapıdan içeri geçiyor (sıcak ışık geçişi) ve doğru sınıf merkezi açılıyor', pd.perde && cc.view === 'psinif' && cc.pg === 6 && cc.son === 6, {pd, cc});
    ok('3.5', 'Sınıf merkezinde öğrenme araçları: Üniteler, Anlatım, Özet, Kodlama, Hikâye, Tablo, Karışanlar, Mini Test, Kartlar, Oyunlar, Sınav Odaklı', cc.tools.join() === 'Üniteler,Anlatım,Özet,Kodlama,Hikâye,Tablo,Karışanlar,Mini Test,Kartlar,Oyunlar,Sınav Odaklı', cc.tools);
    const ac = await p.evaluate(() => { const g = 6, py = V39.pv(g), T = V39.units(g, py).flatMap(u => V39.tops(u.id)), M = {}; T.forEach(t => V39.av(t).forEach(([k]) => M[k] = (M[k] || 0) + 1)); const shown = Object.fromEntries([...document.querySelectorAll('.ar40 button')].slice(1).map((b, i) => [V40.ARAC[i][0], b.disabled ? 0 : parseInt(b.querySelector('small').textContent)])); const dis = [...document.querySelectorAll('.ar40 button:disabled small')].map(s => s.textContent); return {M, shown, dis}; });
    ok('3.6', 'Araç sayıları gerçek kayıtlardan (V39.av ile aynı); verisi olmayan araç “Kaynakta veri bulunmuyor.” diyor', Object.keys(ac.shown).every(k => (ac.M[k] || 0) === ac.shown[k]) && ac.dis.every(t => t === 'Kaynakta veri bulunmuyor.'), ac);
    await p.screenshot({path: path.join(SHOT, '390_sinif_merkezi.png'), fullPage: false});
    await p.click('.ar40 button:nth-child(2)'); await settle(p, 600);
    const tl = await p.evaluate(() => ({view, tab: G.ptab, g: Store.get('topics', G.pt).grade, py: Store.get('topics', G.pt).programYear, pv: V39.pv(6)}));
    ok('3.7', '“Anlatım” aracı aynı sınıf/programdaki bir konunun Anlatım sekmesini açıyor', tl.view === 'pders' && tl.tab === 'anlat' && tl.g === 6 && tl.py === tl.pv, tl);
    await p.evaluate(() => go('psinif', {pg: 6})); await settle(p, 400);
    await p.click('.p39-cr button'); await p.waitForTimeout(250);
    const rt0 = await p.evaluate(() => ({view, acik: document.querySelector('.k40[data-g="6"]').classList.contains('acik')}));
    await settle(p, 1400);
    const rt = await p.evaluate(() => ({view, mode: V40.mode, sel: V40.sel, g: V39.GR[V40.sel], acik: document.querySelector('.k40[data-g="6"]').classList.contains('acik'), cur: [...document.querySelectorAll('.gs40 button')].findIndex(b => b.classList.contains('on'))}));
    ok('3.8', 'Koridora dönünce geldiği kapının önünde (6. sınıf) duruluyor; kanatlar kapanıyor', rt.view === 'pdunya' && rt.mode === 'odak' && rt.g === 6 && !rt.acik && rt.cur === 2, {rt0, rt});
    await p.evaluate(() => { V40.geriCekil(); }); await settle(p, 1300);
    await p.focus('#s40'); await p.keyboard.press('Tab'); await settle(p, 1500);
    const kb = await p.evaluate(() => ({f: document.activeElement && document.activeElement.className, mode: V40.mode, sel: V40.sel}));
    await p.keyboard.press('Enter'); await settle(p, 2600);
    const kv = await p.evaluate(() => ({view, pg: G.pg}));
    ok('3.9', 'Klavye: Tab kapıya odaklanıp kamerayı çeviriyor, Enter kapıyı açıp sınıfa giriyor', /k40/.test(kb.f) && kb.mode === 'odak' && kv.view === 'psinif' && kv.pg === V39_GR(kb.sel), {kb, kv});
    ok('3.10', 'Sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  // ---------- 4. Üst çubuk, favoriler, Planım, profil, sade görünüm, yardım, azaltılmış hareket ----------
  {
    const ctx = await ctxWith(b, {pref: PREM, ilr: {z: {a: '1'}, t: {x: {q: 1}}, prog: {9: '2018'}, son: {}}}); const p = await open(ctx);
    const top = await p.evaluate(() => ({nav: [...document.querySelectorAll('.nv40 button span')].map(s => s.textContent), cur: document.querySelector('.nv40 [aria-current="page"] span').textContent, ip: !document.getElementById('ip40').hidden}));
    ok('4.1', 'Cam üst çubuk: Ana Panel (etkin), İlerleme, Favoriler, Planım; ilk ziyarette gezinme ipucu', top.nav.join() === 'Ana Panel,İlerleme,Favoriler,Planım' && top.cur === 'Ana Panel' && top.ip, top);
    await p.evaluate(() => V40.sec(5)); await settle(p, 1500);
    await p.click('#b40 .fav40'); await p.waitForTimeout(200);
    const f1 = await p.evaluate(() => ({fav: V39.ilr().fav, raw: JSON.parse(localStorage.getItem('dk-ilerleme39'))}));
    ok('4.2', 'Kapı bilgisindeki yıldız sınıfı favorilere ekliyor; dk-ilerleme39 içindeki eski alanlar (z, t, prog) korunuyor', f1.raw.fav && f1.raw.fav.s.includes(9) && f1.raw.z.a === '1' && f1.raw.t.x.q === 1 && f1.raw.prog[9] === '2018', f1.raw);
    await p.click('.nv40 button:nth-child(3)'); await settle(p, 500);
    const fv = await p.evaluate(() => ({view, items: [...document.querySelectorAll('.fv40-a b')].map(b => b.textContent), empty: [...document.querySelectorAll('.p39-empty')].map(e => e.textContent)}));
    ok('4.3', 'Favoriler ekranı favori sınıfı listeliyor; boş konu listesi açıkça belirtiliyor', fv.view === 'pfav' && fv.items.includes('9. Sınıf') && fv.empty.some(t => /favori konu/.test(t)), fv);
    await p.evaluate(() => go('pdunya')); await settle(p, 400);
    await p.click('.nv40 button:nth-child(4)'); await settle(p, 500);
    const pl = await p.evaluate(() => ({view, k: G.pk && G.pk.k, bar: !!document.getElementById('p39bar')}));
    ok('4.4', 'Planım mevcut Tekrar Planı ekranını açıyor (premium çubuğuyla)', pl.view === 'pekbol' && pl.k === 'plan' && pl.bar, pl);
    await p.evaluate(() => go('pdunya')); await settle(p, 400);
    await p.click('.nv40 button:nth-child(2)'); await settle(p, 400);
    const il = await p.evaluate(() => view);
    await p.evaluate(() => go('pdunya')); await settle(p, 400);
    await p.click('.ust40 .ib40.pr'); await settle(p, 500);
    const pf = await p.evaluate(() => ({t: [...document.querySelectorAll('.pf40-g span')].map(s => s.textContent), note: (document.querySelector('.pf40') || {}).textContent || ''}));
    ok('4.5', 'İlerleme düğmesi ve profil paneli (sade görünüm, yardım, ses, favoriler, deneyim, öğretmen paneli; hesap sistemi olmadığı açıkça yazıyor)', il === 'pilerleme' && pf.t.length === 6 && /hesap sistemi yoktur/.test(pf.note), {il, pf: pf.t});
    await p.click('.pf40-g button:nth-child(1)'); await settle(p, 900);
    const lt = await p.evaluate(() => ({lite: !!document.querySelector('#p40.lite'), st: JSON.parse(localStorage.getItem('dk-ilerleme39')).lite40, bit: getComputedStyle(document.querySelector('.bit40')).display}));
    ok('4.6', 'Sade görünüm açılıyor ve hatırlanıyor (bitki, yansıma, doku gibi süsler kapanıyor)', lt.lite && lt.st === 1 && lt.bit === 'none', lt);
    await p.evaluate(() => V40.setLite(0)); await settle(p, 600);
    await p.click('.yrd40'); await settle(p, 400);
    const yd = await p.evaluate(() => document.querySelectorAll('.yd40 li').length);
    ok('4.7', '“?” düğmesi koridor yardımını açıyor', yd === 5, yd);
    ok('4.8', 'Sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
    const cr = await ctxWith(b, {pref: PREM, reduced: true}); const q = await open(cr);
    await q.evaluate(() => V40.git(3)); await q.waitForTimeout(80); const rs = await q.evaluate(() => ({s: V40.s, tw: !!V40.tw}));
    await q.evaluate(() => V40.gir(3)); await q.waitForTimeout(150); const rv = await q.evaluate(() => ({view, pg: G.pg}));
    ok('4.9', 'Azaltılmış hareket tercihinde kamera atlamalı gidiyor, kapı animasyonsuz açılıyor', rs.s === 3 && !rs.tw && rv.view === 'psinif' && rv.pg === 7, {rs, rv});
    await cr.close();
  }

  // ---------- 5. Çizim bütünlüğü: tüm kamera konumlarında boş (çizilmemiş) bölge yok ----------
  {
    const worst = [];
    for (const [w, h] of [[390, 844], [1024, 768]]) {
      const ctx = await ctxWith(b, {w, h, pref: PREM}); const p = await open(ctx);
      await p.addStyleTag({content: '.hava40,.ust40,.alt40,.yrd40,.ipu40{display:none!important}'});
      const poses = []; for (let s = -1; s <= 8; s += .5) poses.push(['s', s]); for (let i = 0; i < 9; i++) poses.push(['o', i]);
      for (const [t, v] of poses) { await p.evaluate(([t, v]) => { V40.tw = null; V40.uygula(t === 's' ? V40.yolPoz(v) : V40.odak(v)); }, [t, v]); await p.waitForTimeout(120); const o = await bosOran(p); worst.push([w + 'px ' + t + v, o]); }
      await ctx.close();
    }
    worst.sort((a, b) => b[1] - a[1]);
    ok('5.1', 'Telefon ve yatay tablette 38 kamera konumunda çizilmemiş alan ≤ %1,5 (yalnızca bilinçli bırakılan ince eşik/boşluk çizgileri)', worst[0][1] <= 1.5, worst.slice(0, 4));
  }

  // ---------- 6. Ekran genişlikleri, dokunma alanları, kayıtlar ----------
  {
    const bad = [], small = [];
    for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [820, 1180], [1024, 768], [1180, 820], [1440, 900]]) {
      const ctx = await ctxWith(b, {w, h, pref: PREM}); const p = await open(ctx);
      const chk = async name => { const r = await p.evaluate(() => { const iw = innerWidth, sw = document.documentElement.scrollWidth, root = document.getElementById('app');
        const over = [...root.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || getComputedStyle(e).position === 'fixed') return false; if (e.closest('.kam40,.p39-tabs,.tb-sc')) return false; for (let a = e.parentElement; a && a !== root; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return false; return r.right > iw + 1 || r.left < -1; }).slice(0, 3).map(e => e.className || e.tagName);
        const tiny = [...root.querySelectorAll('button, select, summary, input:not([type=hidden])')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height || getComputedStyle(e).visibility === 'hidden' || e.closest('.kam40')) return false; if (e.closest('.gs40')) return r.height < 43.5 || r.width < 30; if (e.closest('#tb .gcd, #tb .q, #tb .fc, #tb .chips')) return false; return r.height < 43.5 || (e.tagName !== 'SUMMARY' && r.width < 43.5); }).slice(0, 3).map(e => (e.className || e.tagName) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
        const s = document.getElementById('s40'); const st = s ? s.getBoundingClientRect() : null;
        return {sw, iw, over, tiny, fit: st ? st.width <= iw + 1 : true}; }); if (r.sw > r.iw + 1 || r.over.length || !r.fit) bad.push(`${w}px ${name}: sw=${r.sw} ${r.over.join(',')}`); if (r.tiny.length) small.push(`${w}px ${name}: ${r.tiny.join(' | ')}`); };
      await chk('koridor-giris'); await p.evaluate(() => V40.sec(4)); await settle(p, 1500); await chk('koridor-odak');
      // odak görünümünde tabela ve kapı üst çubuk ile alt panel arasında
      const fitD = await p.evaluate(() => { const tb = document.querySelector('.k40.sec .k40-tab').getBoundingClientRect(), dr = document.querySelector('.k40.sec .k40-ic').getBoundingClientRect(), u = document.querySelector('.ust40').getBoundingClientRect(), a = document.querySelector('.bil40').getBoundingClientRect(); return {ok: tb.top >= u.bottom - 2 && dr.left >= -1 && dr.right <= innerWidth + 1, tb: Math.round(tb.top), u: Math.round(u.bottom)}; });
      if (!fitD.ok) bad.push(`${w}px odak: tabela/kapı sığmıyor ${JSON.stringify(fitD)}`);
      if (w === 390 || w === 1024 || w === 1440 || w === 820) await p.screenshot({path: path.join(SHOT, `${w}x${h}_odak.png`)});
      await p.evaluate(() => V40.git(-1)); await settle(p, 1600); if (w === 1440 || w === 768) await p.screenshot({path: path.join(SHOT, `${w}x${h}_giris.png`)});
      for (const [v, a] of [['psinif', {pg: 8}], ['pfav', null]]) { await p.evaluate(([v, a]) => go(v, a), [v, a]); await p.waitForTimeout(300); await chk(v); }
      if (p._errs.length) bad.push(`${w}px hata: ${p._errs.join(';')}`);
      await ctx.close();
    }
    ok('6.1', '360 / 390 / 768 / 820 dikey / 1024 / 1180 yatay / 1440 px: koridor, sınıf merkezi, favoriler yatay taşmasız; odakta tabela ve kapı görünür alanda', bad.length === 0, bad.slice(0, 6));
    ok('6.2', 'Koridor arayüzünde dokunma alanları ≥44 px (gösterge ≥30×44 px)', small.length === 0, small.slice(0, 6));
  }
  {
    const ctx = await ctxWith(b, {pref: PREM, teacher: true}); const p = await open(ctx);
    const k0 = await p.evaluate(() => Object.fromEntries(['dk2', 'dk-ogretmen-v1', 'dk-ogretmen-pin', 'dk-deneyim39'].map(k => [k, localStorage.getItem(k)])));
    await p.evaluate(async () => { for (const i of [0, 3, 8]) { V40.sec(i); await new Promise(r => setTimeout(r, 300)); } V40.gir(8); await new Promise(r => setTimeout(r, 2600)); go('pdunya'); await new Promise(r => setTimeout(r, 300)); V40.favTik('s', 4); V40.favTik('s', 4); });
    const k1 = await p.evaluate(() => Object.fromEntries(['dk2', 'dk-ogretmen-v1', 'dk-ogretmen-pin', 'dk-deneyim39'].map(k => [k, localStorage.getItem(k)])));
    ok('6.3', 'Koridor gezintisi dk2, öğretmen kayıtları, öğretmen PIN’i ve üyelik tercihini değiştirmiyor', JSON.stringify(k0) === JSON.stringify(k1));
    await p.evaluate(() => { const salt = 's'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 2, salt, h: V36.hash(salt, '1111'), len: 4})); go('ogretmen'); }); await p.waitForTimeout(400);
    const tp = await p.evaluate(() => ({prem: document.body.hasAttribute('data-prem39'), ogrt: document.body.hasAttribute('data-ogrt37'), panel: !!document.querySelector('.og')}));
    ok('6.4', 'Öğretmen paneli premium oturumdan açılınca kendi tasarımıyla', !tp.prem && tp.ogrt && tp.panel, tp);
    ok('6.5', 'Sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  await b.close(); srv.close(); fs.rmSync(TMP, {recursive: true, force: true});
  const f = R.filter(r => !r.pass);
  console.log(`\nToplam ${R.length} kontrol · geçti ${R.length - f.length} · kaldı ${f.length}`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify(R, null, 1));
  process.exit(f.length ? 1 : 0);
})().catch(e => { console.error('TEST BETİĞİ HATASI', e); process.exit(2); });
function V39_GR(i) { return [4, 5, 6, 7, 8, 9, 10, 11, 12][i]; }
