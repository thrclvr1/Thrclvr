// V41.0 testleri (Playwright + Chromium, başsız). Depo kökünden:  node tests/v41/test_v410.js
// Oyun altyapısı ve Kayıp Bilgeliğin Kütüphanesi (5. sınıf · Allah İnancı). Tarayıcı otomasyonudur; gerçek cihaz testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
let V402, V410, IDX;
const R = [];
const ok = (id, name, pass, detail) => { R.push({id, name, pass: !!pass, detail}); console.log((pass ? 'GEÇTİ ' : 'KALDI ') + id + ' · ' + name + (detail !== undefined ? ' — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 420) : '')); };
const IGN = /Failed to load resource: the server responded with a status of 404|GPU stall due to ReadPixels|Automatic fallback to software WebGL/;
const OGRT_DATA = {v: 1, app: 'dkab-ogretmen', classes: [{g: 12, py: '2018'}], active: '12|2018', status: {}, plans: [], updatedAt: '2026-11-01T00:00:00.000Z'};
const SHOT = path.join(ROOT, 'docs', 'V41.0_ekran'); fs.mkdirSync(SHOT, {recursive: true});
const BOL = '5-2026-U01', KX = 'V41.oyunlar.kutuphane';

async function ctxWith(b, {w = 390, h = 844, init = null, teacher = false} = {}) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700, hasTouch: true});
  await ctx.addInitScript(([data, teacher]) => {
    if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-theme', 'dark'); localStorage.setItem('dk-ogretmen-v1', JSON.stringify(data));
    localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'premium', hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({z: {a: '1'}, t: {}, prog: {}, son: {}, ipucu40: 1, fav: {s: [7], k: []}}));
    if (teacher) { sessionStorage.setItem('dk-ogrt-oturum', '1'); sessionStorage.setItem('dk-editor-oturum38', '1'); }
  }, [OGRT_DATA, teacher]);
  if (init) await ctx.addInitScript(init);
  return ctx;
}
async function open(ctx, url) { const p = await ctx.newPage(); p._errs = []; p._warn = []; p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !IGN.test(m.text())) p._errs.push('console: ' + m.text()); if (m.type() === 'warning') p._warn.push(m.text()); }); await p.goto(url || IDX); await p.waitForTimeout(1800); return p; }
const D = p => p.evaluate(K => { const d = eval(K)._test.durum(); return d && JSON.parse(JSON.stringify(d)); }, KX);
const IC = p => p.evaluate(K => JSON.parse(JSON.stringify(eval(K)._test.icerik(), (k, v) => k === 'konu' || k === 'konular' || k === '_q' ? undefined : v)), KX);
const basla = async (p, devam) => { await p.evaluate(([b, d]) => go('poyna', {oyn: 'kutuphane', obol: b, odevam: d}), [BOL, devam ? 1 : 0]); await p.waitForTimeout(700); };
const incele = async (p, id) => { await p.waitForFunction(K => !eval(K)._test.kam().anim && !document.querySelector('.o41-panel'), KX, {timeout: 5000}); for (let t = 0; t < 4 && await p.evaluate(id => document.querySelector(`.o41-nes[data-n="${id}"]`).classList.contains('gz'), id); t++) { const yon = await p.evaluate(([id, K]) => { const n = eval(K)._test.icerik().odalar[eval(K)._test.durum().oda].nes.find(x => x.id === id); return n.x < 0 ? 'sol' : 'sag'; }, [id, KX]); await p.click(`.o41-kenar.${yon}`); await p.waitForTimeout(600); } await p.click(`.o41-nes[data-n="${id}"]`, {force: true}); if (!await p.waitForSelector('.o41-panel', {timeout: 3000}).catch(() => null)) { const tani = await p.evaluate(([id, K]) => { const b = document.querySelector(`.o41-nes[data-n="${id}"]`), r = b.getBoundingClientRect(), e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return {cls: b.className, r: [r.x, r.y, r.width, r.height].map(Math.round), ust: e && e.className, kam: eval(K)._test.kam()}; }, [id, KX]); console.log('TANI incele', id, JSON.stringify(tani)); await p.evaluate(id => document.querySelector(`.o41-nes[data-n="${id}"]`).click(), id); await p.waitForSelector('.o41-panel', {timeout: 5000}); } await p.waitForTimeout(150); const r = await p.evaluate(() => { const pk = document.querySelector('.o41-panel'); return pk && pk.innerText; }); await p.click('.o41-panel [data-kapat]'); await p.waitForTimeout(500); return r; };
const tikla = async (p, sel) => { await p.waitForFunction(K => { const k = eval(K)._test.kam(); return !k || !k.anim; }, KX, {timeout: 5000}).catch(() => {}); await p.evaluate(s => document.querySelector(s).click(), sel); };

(async () => {
  await new Promise(r => srv.listening ? r() : srv.once('listening', r));
  const B = 'http://127.0.0.1:' + srv.address().port;
  V402 = B + '/surumler/din-kulturu-platformu-v40.2.html'; V410 = B + '/surumler/din-kulturu-platformu-v41.0.html'; IDX = B + '/index.html';
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});

  // ---------- 0. Koruma ----------
  {
    const c1 = await ctxWith(b, {teacher: true}), c2 = await ctxWith(b, {teacher: true}), cI = await ctxWith(b);
    const p1 = await open(c1, V402), p2 = await open(c2, V410), pI = await open(cI, IDX);
    const snap = p => p.evaluate(() => ({ver: V31.VER, routes: Object.keys(V30.routes).sort(), cols: Object.fromEntries(Object.keys(COL).map(c => [c, Store.all(c).length])), seeds: [...document.querySelectorAll('script[type="application/json"]')].map(s => s.id + ':' + s.textContent.length), kap: JSON.stringify(V40.kapilar()), gl: !!(V40.GL && V40.GL.aktif)}));
    const a = await snap(p1), z = await snap(p2), i = await snap(pI);
    ok('0.1', 'Sürüm V41.0 (index.html ve sürüm dosyası); koridor V40.2 gibi WebGL ile', z.ver === 'V41.0' && i.ver === 'V41.0' && z.gl, z.ver);
    ok('0.2', 'Veri blokları ve kayıt sayıları V40.2 ile aynı; yalnızca oyun rotaları (poyun, poyna) eklendi; kapı eşleşmeleri aynı', JSON.stringify(a.seeds) === JSON.stringify(z.seeds) && JSON.stringify(a.cols) === JSON.stringify(z.cols) && z.routes.filter(r => !a.routes.includes(r)).sort().join() === 'poyna,poyun' && a.routes.every(r => z.routes.includes(r)) && a.kap === z.kap, z.routes.filter(r => !a.routes.includes(r)));
    const sig = (p, v) => p.evaluate(async v => { const [r, x] = v.split(':'); if (r === 'topic') go('pders', {pt: Store.all('topics').find(t => t.sections && t.grade == 6).id, ptab: 'anlat'}); else if (r === 'psinif') go('psinif', {pg: +x}); else if (r === 'ogretmen') { const salt = 's'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 2, salt, h: V36.hash(salt, '1111'), len: 4})); go('ogretmen'); } else if (r === 'klasik') { V39.on = false; sessionStorage.removeItem('dk-deneyim39-aktif'); go(x); } else go(r);
      await new Promise(r => setTimeout(r, 800)); const P = ['color', 'backgroundColor', 'backgroundImage', 'fontSize', 'borderTopColor', 'borderRadius', 'display']; const out = [];
      [document.body, ...[...document.querySelectorAll('#app *')].slice(0, 400)].forEach(e => { const s = getComputedStyle(e); out.push(e.tagName + '.' + (e.getAttribute('class') || '').replace(/\b(rv|in|done|p40-gel)\b/g, '').trim() + ':' + P.map(k => s[k]).join('|')); }); return out; }, v);
    const diffs = [];
    for (const v of ['psinif:5', 'topic', 'pfav', 'pilerleme', 'games', 'ogretmen', 'klasik:home', 'klasik:games', 'klasik:dene']) { const s1 = await sig(p1, v), s2 = await sig(p2, v); const d = s1.filter((x, k) => x !== s2[k]).length + Math.abs(s1.length - s2.length); if (d) diffs.push(`${v}: ${d} fark (${s1.find((x, k) => x !== s2[k]) || ''})`); }
    ok('0.3', 'Mevcut ekranlar (sınıf merkezi, ders, favoriler, ilerleme, Klasik oyun merkezi, öğretmen paneli, Klasik ana sayfa/oyunlar/kendini dene) V40.2 ile aynı', diffs.length === 0, diffs);
    const hz = await p2.evaluate(async () => { go('pdunya'); await new Promise(r => setTimeout(r, 900)); V39.hz('oyun'); await new Promise(r => setTimeout(r, 300)); const a = view; V39.hz('ders'); await new Promise(r => setTimeout(r, 200)); return [a, view]; });
    ok('0.4', 'Öğrenme Dünyası “Oyunlar” girişi yeni Oyun Dünyası’na gidiyor; diğer hızlı erişimler aynı', hz[0] === 'poyun' && hz[1] === 'psinif', hz);
    ok('0.5', 'Sayfa/konsol hatası yok', !p2._errs.length && !pI._errs.length, p2._errs.concat(pI._errs));
    await c1.close(); await c2.close(); await cI.close();
  }

  // ---------- 1. Oyun merkezi ----------
  {
    const ctx = await ctxWith(b); const p = await open(ctx);
    await p.evaluate(() => go('poyun')); await p.waitForTimeout(500);
    const m = await p.evaluate(() => ({oy: [...document.querySelectorAll('.o41-oyun h2')].map(h => h.textContent), yak: [...document.querySelectorAll('.o41-oyun.yakinda .o41-etk')].map(e => e.textContent), oyna: [...document.querySelectorAll('.o41-oyun:not(.yakinda):not(.klasik) .o41-b')].map(b => b.textContent.trim()), bol: (document.querySelector('.o41-bol') || {}).innerText || ''}));
    await p.screenshot({path: path.join(SHOT, '390_oyun_merkezi.png')});
    ok('1.1', 'Oyun merkezi: Kütüphane oynanabilir; Zamanın İzinde ve Bilgi Laboratuvarı “Geliştiriliyor” (oynanamaz); Klasik oyunlar girişi var', m.oy.join('|') === 'Kayıp Bilgeliğin Kütüphanesi|Zamanın İzinde|Bilgi Laboratuvarı|Klasik oyunlar' && m.yak.length === 2 && m.yak.every(t => /Geliştiriliyor/.test(t)) && m.oyna.some(t => /Oyna/.test(t)), m);
    ok('1.2', 'Bölüm kartında sınıf, program (2026 TYMM), kazanım kodları ve içerik onay durumu açıkça yazıyor', /5\. sınıf · Allah İnancı/.test(m.bol) && /2026 programı/.test(m.bol) && /DKAB\.5\.1\.1/.test(m.bol) && /editör onayından geçmedi/.test(m.bol), m.bol);
    await p.click('.o41-oyun.klasik .o41-b'); await p.waitForTimeout(500);
    ok('1.3', 'Klasik oyunlar girişi mevcut oyun merkezini açıyor (mevcut oyunlar çalışıyor)', await p.evaluate(() => view === 'games' && document.querySelectorAll('#app button').length > 5));
    await ctx.close();
  }

  // ---------- 2. İçerik kaynak kayıtlarla birebir ----------
  {
    const ctx = await ctxWith(b); const p = await open(ctx); await basla(p, 0);
    const v = await p.evaluate(K => { const ic = eval(K)._test.icerik(), t = id => Store.get('topics', id), err = [];
      const [o1, o2, o3] = ic.odalar; const tb = t('TPC-5-1-01').sections.tablo.rows;
      o1.bulmaca.ciftler.forEach((c, i) => { if (c.sol !== tb[i][0] || c.sag !== tb[i][2] || c.gozlem !== tb[i][1]) err.push('mühür ' + i); });
      const gr = Store.get('games', 'GM28-TPC-5-1-03-grup'); if (JSON.stringify(o2.bulmaca.raflar) !== JSON.stringify(gr.categories) || o2.bulmaca.kitaplar.some((k, i) => k.metin !== gr.items[i].text || k.raf !== gr.items[i].cat)) err.push('raf');
      const ek = Store.get('games', 'GM30-TPC-5-1-01-eksik'); if (o3.bulmaca.cumleler.some((c, i) => c.metin !== ek.items[i].text || c.cevap !== ek.items[i].answer || JSON.stringify(c.secenek) !== JSON.stringify(ek.items[i].options))) err.push('yazıt');
      o3.bulmaca2.sorular.forEach(q => { const s = Store.get('questions', q.id); if (s.text !== q.metin || s.answer !== q.cevap || JSON.stringify(s.options) !== JSON.stringify(q.secenek) || JSON.stringify(s.optionNotes) !== JSON.stringify(q.not)) err.push('soru ' + q.id); });
      const top = [t('TPC-5-1-01'), t('TPC-5-1-02'), t('TPC-5-1-03'), t('TPC-5-1-04'), gr, ek, ...o3.bulmaca2.sorular.map(q => Store.get('questions', q.id))];
      const prog = top.every(x => x.programYear === '2026' && x.grade === 5);
      const notlar = ic.odalar.flatMap(o => o.nes.map(n => n.not));
      const metinler = JSON.stringify(Store.all('topics').filter(x => x.grade === 5).map(x => x.sections)) + JSON.stringify(Store.all('topics').filter(x => x.grade === 5).map(x => x.title));
      const notKaynak = notlar.every(n => n.m.split(/(?:Gözlem: |Düzenin işareti: |Anlamı: |Hangi durumda aklımıza gelir: | İpucu: |\. \d\. ayet: |\d\. ayet: )/).map(s => s.replace(/^[\s.]+|[\s.()]+$/g, '').replace(/\s*\([^)]*\)$/, '')).filter(s => s.length > 3).every(s => metinler.includes(s.split(' (')[0])));
      return {err, prog, notKaynak, nNot: notlar.length, kz: ic.kazanim.map(o => o.code)}; }, KX);
    ok('2.1', 'Mühür, raf, yazıt ve şifreli kapı içeriği kaynak kayıtlarla birebir aynı (konu tablosu, Klasik oyun kayıtları, sorular ve seçenek açıklamaları)', !v.err.length, v.err);
    ok('2.2', 'Bütün kaynaklar 5. sınıf · 2026 programından (2018 karışmıyor); kazanımlar DKAB.5.1.1–5.1.4', v.prog && v.kz.join() === 'DKAB.5.1.1,DKAB.5.1.2,DKAB.5.1.3,DKAB.5.1.4', v);
    ok('2.3', `Defter notlarının (${v.nNot}) metinleri ders kayıtlarındaki metinlerden oluşuyor (uydurma içerik yok)`, v.notKaynak, v);
    await ctx.close();
  }

  // ---------- 3. Baştan sona oynanış (telefon, dokunma) ----------
  {
    const ctx = await ctxWith(b); const p = await open(ctx);
    const dk0 = await p.evaluate(() => JSON.parse(localStorage.getItem('dk2') || '{}'));
    await basla(p, 0);
    const gr = await p.evaluate(() => ({h: document.querySelector('.o41-gkart h1').textContent, kz: document.querySelectorAll('.o41-kz li').length, odalar: document.querySelectorAll('.o41-odal li').length}));
    await p.screenshot({path: path.join(SHOT, '390_giris_hikaye.png')});
    ok('3.1', 'Giriş: hikâye, üç oda görevi ve kazanımlar', gr.h === 'Kayıp Bilgeliğin Kütüphanesi' && gr.kz === 4 && gr.odalar === 3, gr);
    await p.click('.o41-gkart .o41-b.p'); await p.waitForTimeout(2200);
    const s1 = await p.evaluate(K => ({gl: !!eval(K)._test.r(), nes: [...document.querySelectorAll('.o41-nes')].map(b => b.dataset.n || 'bulmaca'), gor: document.getElementById('o41g').innerText, vis: [...document.querySelectorAll('.o41-nes:not(.gz)')].length}), KX);
    await p.screenshot({path: path.join(SHOT, '390_oda1.png')});
    ok('3.2', '1. oda (Düzen Salonu) WebGL ile çiziliyor; 5 incelenebilir nesne + mühürlü kapı; görev metni gösteriliyor', s1.gl && s1.nes.length === 6 && /Odayı incele/.test(s1.gor) && s1.vis >= 3, s1);
    // keşif kapısı: 2 ipucu olmadan bulmaca açılmıyor
    await tikla(p, '.o41-nes[data-b]'); await p.waitForTimeout(500); const kilit = await p.evaluate(() => document.querySelector('.o41-panel').innerText); await p.click('.o41-panel [data-kapat]'); await p.waitForTimeout(500);
    ok('3.3', 'Bulmaca keşiften önce açılmıyor (en az 2 ipucu gerekli)', /henüz kullanılamıyor/.test(kilit) && /0\/2/.test(kilit), kilit.slice(0, 120));
    const n1 = await incele(p, 'gok'); await incele(p, 'su');
    const d1 = await D(p);
    ok('3.4', 'Nesneye dokununca kamera yaklaşıyor, bilgi kartı (kaynaklı) açılıyor ve Defter’e yazılıyor', /Gökyüzü/.test(n1) && /Kaynak: Evrendeki Düzeni Fark Etmek/.test(n1) && Object.keys(d1.kesif).length === 2, n1.slice(0, 160));
    await tikla(p, '.o41-nes[data-b]'); await p.waitForTimeout(800); await p.screenshot({path: path.join(SHOT, '390_muhur.png')});
    // yanlış
    const yn = await p.evaluate(() => { const m = document.querySelector('.o41-mh[data-m]'), y = [...document.querySelectorAll('.o41-yuva:not(.dolu)')].find(y => y.dataset.y !== m.dataset.m); m.click(); y.click(); return {m: m.dataset.m, y: y.dataset.y}; });
    await p.waitForTimeout(400); const gb = await p.evaluate(() => { const g = document.querySelector('.o41-gb'); return {c: g.className, t: g.innerText}; });
    await p.screenshot({path: path.join(SHOT, '390_muhur_yanlis.png')});
    ok('3.5', 'Yanlış yerleştirmede kırmızı ekran yok; neden yanlış olduğunu açıklayan geri bildirim (doğru alan ve gözlem, kaynaktan)', /yanlis/.test(gb.c) && gb.t.includes(yn.y) && /alanına aittir/.test(gb.t), gb.t.slice(0, 200));
    await tikla(p, '[data-ipucu]'); await p.waitForTimeout(300); const ip1 = await p.evaluate(() => document.querySelector('.o41-gb').innerText);
    await tikla(p, '[data-ipucu]'); await p.waitForTimeout(400); const ip2 = await D(p);
    ok('3.6', 'İpucu sistemi: 1. ipucu Defter’e yönlendiriyor, 2. ipucu bir mührü yerine koyuyor; ipucu sayısı kaydediliyor', /Defterine bak/.test(ip1) && Object.keys(ip2.cozum.muhur.yer).length === 1 && ip2.cozum.muhur.ipucu === 2, {ip1: ip1.slice(0, 80), yer: ip2.cozum.muhur.yer});
    for (let i = 0; i < 4; i++) { const ok2 = await p.evaluate(() => { const m = document.querySelector('.o41-mh[data-m]'); if (!m) return false; document.querySelector(`.o41-yuva[data-y="${CSS.escape(m.dataset.m)}"]`); m.click(); document.querySelector(`.o41-yuva[data-y="${CSS.escape(m.dataset.m)}"]`).click(); return true; }); if (!ok2) break; await p.waitForTimeout(250); }
    await p.waitForTimeout(3200); const o1 = await p.evaluate(K => ({d: eval(K)._test.durum(), kapi: eval(K)._test.kam().kapi, panel: (document.querySelector('.o41-panel') || {}).innerText || ''}), KX);
    await p.screenshot({path: path.join(SHOT, '390_oda1_kapi_acildi.png')});
    ok('3.7', 'Mühürler tamamlanınca kapı menteşeden açılıyor (çizicide 102°); puan 100 − 10×hata − 15×ipucu; yıldız', o1.kapi > 100 && o1.d.cozum.muhur.puan === 100 - 10 * o1.d.cozum.muhur.hata - 15 * o1.d.cozum.muhur.ipucu && o1.d.yildiz[0] >= 1 && /Kapı açıldı/.test(o1.panel), {puan: o1.d.cozum.muhur.puan, hata: o1.d.cozum.muhur.hata, ipucu: o1.d.cozum.muhur.ipucu, yildiz: o1.d.yildiz});
    await tikla(p, '[data-ileri]'); await p.waitForTimeout(2700);
    const s2 = await p.evaluate(K => ({oda: eval(K)._test.durum().oda, ad: document.querySelector('.o41-baslik b').textContent, yol: [...document.querySelectorAll('.o41-yol i')].map(i => i.className).join(',')}), KX);
    await p.screenshot({path: path.join(SHOT, '390_oda2.png')});
    ok('3.8', 'Kapıdan geçilip 2. odaya (İsimler Arşivi) giriliyor; ilerleme çubuğu güncelleniyor', s2.oda === 1 && s2.ad === 'İsimler Arşivi' && s2.yol === 'ok,on,', s2);
    for (const id of ['isim0', 'isim1']) await incele(p, id);
    await tikla(p, '.o41-nes[data-b]'); await p.waitForTimeout(800);
    const ic = await IC(p), kit = ic.odalar[1].bulmaca.kitaplar, rf = ic.odalar[1].bulmaca.raflar;
    // sürükle-bırak (fare/dokunma) ile yanlış ve doğrular
    const sur = async (kid, raf) => { await p.evaluate(() => { document.querySelector('.o41-pk').scrollTop = 0; }); await p.waitForTimeout(150); const el = p.locator(`.o41-kt[data-k="${kid}"]`); if (!await el.count()) return; await el.scrollIntoViewIfNeeded(); const A = await el.boundingBox(), H = await p.locator(`.o41-raf[data-r="${raf}"]`).boundingBox();
      await p.mouse.move(A.x + A.width / 2, A.y + A.height / 2); await p.mouse.down(); for (let s = 1; s <= 10; s++) { await p.mouse.move(A.x + A.width / 2 + (H.x + H.width / 2 - A.x - A.width / 2) * s / 10, A.y + A.height / 2 + (H.y + H.height / 2 - A.y - A.height / 2) * s / 10); await p.waitForTimeout(16); } await p.mouse.up(); await p.waitForTimeout(700); };
    await sur(kit[0].id, rf.find(r => r !== kit[0].raf)); const g2 = await p.evaluate(() => document.querySelector('.o41-gb').innerText);
    await p.screenshot({path: path.join(SHOT, '390_raf_yanlis.png')});
    for (const k of kit) await sur(k.id, k.raf);
    await p.waitForTimeout(3300); const o2 = await D(p);
    ok('3.9', 'Raf düzeni sürükle-bırak ile çalışıyor; yanlışta ismin anlamı açıklanıyor; bütün kitaplar yerleşince oda tamamlanıyor', /rafına ait değil/.test(g2) && o2.cozum.raf.bitti && Object.keys(o2.cozum.raf.yer).length === kit.length && o2.yildiz[1] >= 1, {g2: g2.slice(0, 140), yildiz: o2.yildiz});
    await tikla(p, '[data-ileri]'); await p.waitForTimeout(2700); await p.screenshot({path: path.join(SHOT, '390_oda3.png')});
    for (const id of ['evren', 'tek']) await incele(p, id);
    await tikla(p, '.o41-nes[data-k]'); await p.waitForTimeout(600); const kadranKilit = await p.evaluate(() => document.querySelector('.o41-panel').innerText); await p.click('.o41-panel [data-kapat]'); await p.waitForTimeout(500);
    ok('3.10', 'Şifreli kapı, yazıt çözülmeden açılmıyor (bölüm içi ilerleme sırası)', /Önce “Kırık yazıt”/.test(kadranKilit), kadranKilit.slice(0, 100));
    await tikla(p, '.o41-nes[data-b]'); await p.waitForTimeout(800); await p.screenshot({path: path.join(SHOT, '390_yazit.png')});
    const cm = ic.odalar[2].bulmaca.cumleler;
    const yz = await p.evaluate(s => { document.querySelector(`.o41-tas[data-t="${s}"]`).click(); document.querySelector('.o41-bosluk').click(); return document.querySelector('.o41-gb').innerText; }, cm[0].secenek.find(s => s !== cm[0].cevap));
    for (const c of cm) { await p.waitForTimeout(300); await p.evaluate(s => { document.querySelector(`.o41-tas[data-t="${s}"]`).click(); document.querySelector('.o41-bosluk').click(); }, c.cevap); await p.waitForTimeout(1300); }
    await p.waitForTimeout(1300); const o3 = await D(p);
    ok('3.11', 'Yazıt tamamlama: yanlış taş elenip açıklama gösteriliyor; üç satır tamamlanınca bulmaca bitiyor', /bu boşluğa uymuyor/.test(yz) && o3.cozum.yazit.bitti && o3.cozum.yazit.i === cm.length, yz.slice(0, 120));
    await p.evaluate(() => { const k = document.querySelector('.o41-panel [data-kapat]'); if (k) k.click(); }); await p.waitForTimeout(600);
    await tikla(p, '.o41-nes[data-k]'); await p.waitForTimeout(900); await p.screenshot({path: path.join(SHOT, '390_sifreli_kapi.png')});
    const qs = ic.odalar[2].bulmaca2.sorular; const bas = await D(p);
    ok('3.12', 'Şifreli kapı: kadranlar karışık sırada ve hiçbiri doğru konumda başlamıyor', bas.cozum.kadran.deger.every((v, i) => v !== qs[i].cevap) && bas.cozum.kadran.sira.length === 3, bas.cozum.kadran);
    await p.click('[data-cevir]'); await p.waitForTimeout(400); const kg = await p.evaluate(() => document.querySelector('.o41-gb').innerText);
    for (let i = 0; i < qs.length; i++) for (let t = 0; t < 6; t++) { const v = await p.evaluate(i => V41.oyunlar.kutuphane._test.durum().cozum.kadran.deger[i], i); if (v === qs[i].cevap) break; await p.click(`.o41-kd[data-i="${i}"] .o41-ok[data-y="1"]`); await p.waitForTimeout(60); }
    await p.click('[data-cevir]'); await p.waitForTimeout(3600);
    const nt = qs[0].not.find((n, k) => k !== qs[0].cevap && kg.includes(n));
    ok('3.13', 'Yanlış kadranda seçeneğe özel açıklama (sorunun kendi seçenek notu) gösteriliyor; doğru konumda kilit açılıyor', /yanlış konumda/.test(kg) && !!nt && (await D(p)).cozum.kadran.bitti, kg.slice(0, 200));
    await tikla(p, '[data-ileri]'); await p.waitForTimeout(2800);
    const son = await p.evaluate(() => ({t: (document.querySelector('.o41-son') || {}).innerText || '', kz: document.querySelectorAll('.o41-tab tbody tr').length}));
    await p.screenshot({path: path.join(SHOT, '390_bolum_sonu.png'), fullPage: false});
    const kayit = await p.evaluate(() => JSON.parse(localStorage.getItem('dk-oyun41'))), d = kayit.oyunlar.kutuphane[BOL];
    ok('3.14', 'Bölüm tamamlama ekranı: yıldızlar, puan, süre, hata/ipucu ve kazanım raporu (4 kazanım); kayıt “bitti”', /Bilgelik Odası açıldı/.test(son.t) && /Kazanım raporu/.test(son.t) && son.kz === 4 && d.bitti && Object.keys(d.yildiz).length === 3, son.t.slice(0, 160));
    const dk1 = await p.evaluate(() => JSON.parse(localStorage.getItem('dk2') || '{}'));
    const fark = Object.keys(Object.assign({}, dk0, dk1)).filter(k => JSON.stringify(dk0[k]) !== JSON.stringify(dk1[k]));
    const progK = Object.keys((dk1.prog || {})).filter(o => /^DKAB-5-U01-O0[1-4]$/.test(o));
    ok('3.15', 'Cevaplar mevcut kazanım ilerlemesine (dk2.prog, Klasik oyunlarla aynı yol) işleniyor; dk2’de başka alan değişmiyor', fark.every(k => k === 'prog') && progK.length === 4, {fark, progK});
    ok('3.16', 'Oynanış boyunca sayfa/konsol hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  // ---------- 4. Duraklatma, sürdürme, yeniden başlatma, kaldığı yerden devam, arka plan ----------
  {
    const ctx = await ctxWith(b); const p = await open(ctx); await basla(p, 0); await p.click('.o41-gkart .o41-b.p'); await p.waitForTimeout(2000);
    await incele(p, 'gok'); await p.waitForTimeout(2200);
    const t0 = (await D(p)).sure; await p.click('.o41-hud .o41-ib'); await p.waitForTimeout(2300);
    const m = await p.evaluate(() => ({menu: !!document.getElementById('o41m'), dur: V41.durdu}));
    const t1 = (await D(p)).sure; await p.waitForTimeout(1500); const t2 = (await D(p)).sure;
    await p.click('#o41m .o41-b.p'); await p.waitForTimeout(2300); const t3 = (await D(p)).sure;
    ok('4.1', 'Duraklat: menü açılıyor, süre duruyor; Devam et: süre yeniden işliyor', m.menu && m.dur && t2 === t1 && t3 > t2 && t0 >= 1, {t0, t1, t2, t3});
    await p.click('.o41-hud .o41-ib'); await p.waitForTimeout(300); await p.click('#o41m .o41-kal button:nth-of-type(3)'); await p.waitForTimeout(1600);
    const q = await p.evaluate(() => ({k: V41.kalite(), kay: JSON.parse(localStorage.getItem('dk-oyun41')).ayar.kalite, cv: document.querySelector('.o41-cv').width}));
    await p.click('#o41m .o41-b.p'); await p.waitForTimeout(400);
    ok('4.2', 'Grafik kalitesi (Yüksek / Dengeli / Sade) seçilip kaydediliyor ve sahne yeniden kuruluyor', q.k === 'sade' && q.kay === 'sade' && q.cv > 0, q);
    // ikinci nesne + sekme gizlenince otomatik duraklama
    await incele(p, 'su');
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, get: () => true}); document.dispatchEvent(new Event('visibilitychange')); }); await p.waitForTimeout(300);
    const ar = await p.evaluate(() => ({dur: V41.durdu, menu: !!document.getElementById('o41m')}));
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, get: () => false}); document.dispatchEvent(new Event('visibilitychange')); });
    ok('4.3', 'Sekme/uygulama arka plana geçince oyun kendiliğinden duraklıyor', ar.dur && ar.menu, ar);
    await p.click('#o41m .o41-b.p'); await p.waitForTimeout(300);
    // sayfayı yeniden yükle → merkezde “Devam et” → kaldığı yer
    await p.reload(); await p.waitForTimeout(1800); await p.evaluate(() => go('poyun')); await p.waitForTimeout(500);
    const dv = await p.evaluate(() => [...document.querySelectorAll('.o41-bol .o41-b')].map(b => b.textContent.trim()));
    await basla(p, 1); await p.waitForTimeout(1800);
    const dd = await p.evaluate(K => ({oda: eval(K)._test.durum().oda, kes: Object.keys(eval(K)._test.durum().kesif), giris: !!document.querySelector('.o41-giris'), ok: [...document.querySelectorAll('.o41-nes.ok')].map(b => b.dataset.n)}), KX);
    ok('4.4', 'Sayfa yeniden açılınca “Devam et” ile kaldığı yerden sürüyor (incelenen nesneler işaretli, hikâye tekrar gösterilmiyor)', dv.some(t => /Devam et/.test(t)) && dd.kes.length === 2 && !dd.giris && dd.ok.includes('gok') && dd.ok.includes('su'), {dv, dd});
    await p.click('.o41-hud .o41-ib'); await p.waitForTimeout(300); await p.click('#o41m .o41-b:nth-of-type(2)'); await p.waitForTimeout(800);
    const yb = await p.evaluate(K => ({d: eval(K)._test.durum(), giris: !!document.querySelector('.o41-giris')}), KX);
    ok('4.5', 'Bölümü baştan başlat: ilerleme sıfırlanıyor ve hikâye girişi yeniden açılıyor', yb.giris && Object.keys(yb.d.kesif).length === 0 && yb.d.oda === 0, yb.d && yb.d.oda);
    await p.evaluate(() => go('poyun')); await p.waitForTimeout(300);
    ok('4.6', 'Oyundan çıkınca oyun temizleniyor (döngü ve sahne bırakılıyor)', await p.evaluate(() => !V41.aktif && !V41._raf && !document.querySelector('.o41-cv')));
    ok('4.7', 'Sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  // ---------- 5. Hata sınırı ve WebGL olmayan cihaz ----------
  {
    const ctx = await ctxWith(b); const p = await open(ctx);
    await p.evaluate(() => { V41.oyunlar.kutuphane._bozuk = V41.oyunlar.kutuphane.baslat; V41.oyunlar.kutuphane.baslat = () => { throw new Error('test: bilinçli hata'); }; });
    await basla(p, 0);
    const h = await p.evaluate(() => ({kart: (document.querySelector('.o41-hata') || {}).innerText || '', aktif: !!V41.aktif}));
    await p.click('.o41-hata .o41-b'); await p.waitForTimeout(400);
    ok('5.1', 'Hata sınırı: oyun hata verirse yalnızca oyun kapanıyor, anlaşılır kart gösteriliyor, oyun merkezine dönülüyor', /Oyun açılamadı/.test(h.kart) && !/bilinçli hata/.test(h.kart) && !h.aktif && await p.evaluate(() => view === 'poyun') && p._warn.some(w => /\[V41\].*bilinçli hata/.test(w)), h);
    await ctx.close();
    const c2 = await ctxWith(b, {init: () => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, a) { return /webgl/.test(t) ? null : o.call(this, t, a); }; }}); const q = await open(c2);
    await basla(q, 0); await q.click('.o41-gkart .o41-b.p'); await q.waitForTimeout(1200);
    const bs = await q.evaluate(() => ({basit: !!document.querySelector('.o41-sahne.basit'), n: [...document.querySelectorAll('.o41-nes')].filter(b => b.getBoundingClientRect().width > 40).length}));
    await q.click('.o41-nes[data-n="gok"]'); await q.waitForTimeout(500); const pn = await q.evaluate(() => !!document.querySelector('.o41-panel'));
    await q.screenshot({path: path.join(SHOT, '390_webgl_yok_basit.png')});
    ok('5.2', 'WebGL olmayan cihazda “basit görünüm”: nesneler düğme olarak listeleniyor, oyun oynanabiliyor, uyarı konsolda', bs.basit && bs.n >= 6 && pn && q._warn.some(w => /\[V41\] oda WebGL ile çizilemedi/.test(w)) && !q._errs.length, bs);
    await c2.close();
  }

  // ---------- 6. Ekran boyutları ve dokunma alanları ----------
  {
    const bad = [], small = [];
    for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
      const ctx = await ctxWith(b, {w, h}); const p = await open(ctx);
      const chk = async ad => { const r = await p.evaluate(() => { const iw = innerWidth, sw = document.documentElement.scrollWidth;
        const tiny = [...document.querySelectorAll('#app button, .o41-panel button')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || getComputedStyle(e).visibility === 'hidden' || e.classList.contains('o41-nes') || e.classList.contains('o41-sirt')) return false; return r.height < 43.5 || r.width < 43.5; }).map(e => e.className + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
        const pk = document.querySelector('.o41-pk'); const pr = pk && pk.getBoundingClientRect();
        return {sw, iw, tiny, pk: !pk || (pr.left >= -1 && pr.right <= iw + 1 && pr.top >= -1)}; });
        if (r.sw > r.iw + 1 || !r.pk) bad.push(`${w}px ${ad}: sw=${r.sw} panel=${r.pk}`); if (r.tiny.length) small.push(`${w}px ${ad}: ${r.tiny.slice(0, 3).join(' | ')}`); };
      await p.evaluate(() => go('poyun')); await p.waitForTimeout(400); await chk('merkez');
      await basla(p, 0); await chk('giriş'); await p.click('.o41-gkart .o41-b.p'); await p.waitForTimeout(1800); await chk('oda');
      if ([768, 1440].includes(w)) await p.screenshot({path: path.join(SHOT, `${w}x${h}_oda1.png`)});
      await p.evaluate(K => { const k = eval(K); k._test.durum().kesif = {'duzen:gok': {b: 'x', m: 'x', k: 'x', o: 'Düzen Salonu'}, 'duzen:su': {b: 'x', m: 'x', k: 'x', o: 'Düzen Salonu'}}; k.durumGuncelle(); }, KX);
      await tikla(p, '.o41-nes[data-b]'); await p.waitForTimeout(900); await chk('mühür paneli');
      if ([360, 1024].includes(w)) await p.screenshot({path: path.join(SHOT, `${w}x${h}_muhur.png`)});
      if (p._errs.length) bad.push(`${w}px hata: ${p._errs.join(';')}`);
      await ctx.close();
    }
    ok('6.1', '360 / 390 / 768 / 1024 / 1440 px: oyun merkezi, giriş, oda ve bulmaca paneli yatay taşmasız; panel ekranda', bad.length === 0, bad.slice(0, 6));
    ok('6.2', 'Düğmeler ve sürüklenen parçalar ≥44 px dokunma alanı', small.length === 0, small.slice(0, 6));
  }

  // ---------- 7. Kayıtlar ----------
  {
    const ctx = await ctxWith(b, {teacher: true}); const p = await open(ctx);
    const keys = () => p.evaluate(() => Object.fromEntries(['dk-ogretmen-v1', 'dk-ogretmen-pin', 'dk-deneyim39', 'dk-ilerleme39', 'dk-editor-pin38'].map(k => [k, localStorage.getItem(k)])));
    const k0 = await keys(); await basla(p, 0); await p.click('.o41-gkart .o41-b.p'); await p.waitForTimeout(1500); await incele(p, 'gok'); await p.evaluate(() => go('poyun')); await p.waitForTimeout(300); const k1 = await keys();
    const yeni = await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('dk-oyun41')); return {v: o.v, oy: Object.keys(o.oyunlar), bol: Object.keys(o.oyunlar.kutuphane || {})}; });
    ok('7.1', 'Oyun yalnızca kendi sürümlü anahtarını (dk-oyun41, v:1) yazıyor; öğretmen kayıtları, PIN, üyelik tercihi, favoriler ve ilerleme değişmiyor', JSON.stringify(k0) === JSON.stringify(k1) && yeni.v === 1 && yeni.bol.includes(BOL), yeni);
    await p.evaluate(() => { const salt = 's'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 2, salt, h: V36.hash(salt, '1111'), len: 4})); go('ogretmen'); }); await p.waitForTimeout(500);
    ok('7.2', 'Öğretmen paneli kendi tasarımıyla açılıyor', await p.evaluate(() => !document.body.hasAttribute('data-prem39') && document.body.hasAttribute('data-ogrt37') && !!document.querySelector('.og')));
    ok('7.3', 'Sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  await b.close(); srv.close();
  const f = R.filter(r => !r.pass);
  console.log(`\nToplam ${R.length} kontrol · geçti ${R.length - f.length} · kaldı ${f.length}`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify(R, null, 1));
  process.exit(f.length ? 1 : 0);
})().catch(e => { console.error('TEST BETİĞİ HATASI', e); process.exit(2); });
