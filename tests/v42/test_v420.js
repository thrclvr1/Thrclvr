// V42.0 testleri. Çalıştırma (depo kökünden): node tests/v42/test_v420.js
// Yerel http sunucusu + başsız Chromium (WebGL için SwiftShader; ses için otomatik oynatma izni).
// Ekran görüntüleri: docs/V42.0_ekran/   Sonuç: tests/v42/son_sonuc.json
// Not: tarayıcı otomasyonu gerçek cihaz testi değildir; klavye, gerçek klavye açılmadan pencere/visualViewport küçültülerek benzetilir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const F42 = 'surumler/din-kulturu-platformu-v42.0.html', F41 = 'surumler/din-kulturu-platformu-v41.0.html';
const SH = path.join(ROOT, 'docs', 'V42.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
const S = []; let HATA = [];
const ok = (ad, kosul, ayr) => { S.push({ad, ok: !!kosul, ayr: ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr))}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (ayr !== undefined ? '  — ' + (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)) : '')); };
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = (f) => 'http://127.0.0.1:' + srv.address().port + '/' + f;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, tema: 'dark', mod: null, hat: true, f: F42}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: o.w < 700, hasTouch: true, deviceScaleFactor: 1});
    await ctx.addInitScript(([t, m, h, ek]) => { if (sessionStorage.getItem('__s')) return; sessionStorage.setItem('__s', '1'); if (localStorage.getItem('__ilk')) return; localStorage.setItem('__ilk', '1'); localStorage.setItem('dk-theme', t); if (m) localStorage.setItem('dk-deneyim39', JSON.stringify({son: m, hatirla: h})); localStorage.setItem('dk-ilerleme39', JSON.stringify(Object.assign({ipucu40: 1}, ek || {}))); }, [o.tema, o.mod, o.hat, o.ilr]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message));
    await p.goto(URL(o.f)); await p.waitForTimeout(1500); return {p, ctx};
  };

  /* ---------- A. Derleme ve veri ---------- */
  const h42 = fs.readFileSync(path.join(ROOT, F42), 'utf8'), h41 = fs.readFileSync(path.join(ROOT, F41), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="application\/json" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  ok('A1 sürüm etiketi V42.0 ve index.html aynı dosya', /V31\.VER="V42\.0"/.test(h42) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === h42);
  ok('A2 veri blokları (müfredat, ilişkiler, sureler-dualar, yıllık plan) V41.0 ile bayt bayt aynı', JSON.stringify(seeds(h42)) === JSON.stringify(seeds(h41)), Object.keys(seeds(h42)).join(','));
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v42.0'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı', deg.length === 0, deg.join(';') || 'yalnız v42.0');
  ok('A4 7 müzik kaydı gömülü ve ana betikten sonra', (h42.match(/<script type="text\/plain" id="m42-/g) || []).length === 7 && h42.indexOf('id="m42-esik"') > h42.indexOf('draw();try{V36.boot()'));

  /* ---------- B. Giriş ekranı ---------- */
  for (const [w, h, ad] of [[360, 740, 'tel360'], [390, 844, 'tel390'], [420, 900, 'tel420'], [820, 1180, 'tablet'], [1280, 800, 'masaustu']]) {
    const {p, ctx} = await sayfa({w, h});
    const r = await p.evaluate(() => {
      const o = document.getElementById('uye39'), k = [...o.querySelectorAll('.o42-k')].map((e) => e.getBoundingClientRect()), bt = [...o.querySelectorAll('.o42-b')].map((e) => e.getBoundingClientRect());
      const img = o.querySelector('.o42-kemer img');
      return {iw: innerWidth, var: !!o && o.classList.contains('o42'), n: k.length, k, bt, tasma: o.scrollWidth - o.clientWidth, sayfaTasma: document.documentElement.scrollWidth - innerWidth, img: img ? img.naturalWidth : 0,
        ogr: !!o.querySelector('.o42-ogr'), hat: !!o.querySelector('#uye39-hat'), not: /İstediğin zaman deneyimini değiştirebilirsin/.test(o.textContent), h1: o.querySelector('h1').textContent, odak: document.activeElement && document.activeElement.id};
    });
    const dikey = r.k[1].top >= r.k[0].bottom - 1, yan = Math.abs(r.k[1].top - r.k[0].top) < 2;
    ok(`B ${ad} (${w}×${h}): iki kart, yatay taşma ve uzaklaşma yok (innerWidth = ${w}), düğmeler ≥44 px, ${w < 700 ? 'kartlar alt alta' : 'kartlar yan yana'}`, r.iw === w && r.var && r.n === 2 && r.tasma <= 0 && r.sayfaTasma <= 0 && r.bt.every((x) => x.height >= 44 && x.width >= 200) && (w < 700 ? dikey : yan), {iw: r.iw, tasma: r.tasma, btH: r.bt.map((x) => Math.round(x.height)), dikey, yan});
    if (ad === 'tel390') ok('B görsel yüklü, öğretmen paneli düğmesi, “hatırla” seçeneği, “istediğin zaman değiştirebilirsin” notu, odak başlıkta', r.img > 0 && r.ogr && r.hat && r.not && r.odak === 'uye39-h', r);
    await p.screenshot({path: path.join(SH, `secim-${ad}.png`)});
    if (ad === 'tel390') { await p.evaluate(() => document.getElementById('uye39').scrollTo(0, 9999)); await p.waitForTimeout(200); await p.screenshot({path: path.join(SH, 'secim-tel390-alt.png')}); }
    await ctx.close();
  }
  { // açık tema: seçim ekranı yine koyu (marka ekranı), yazılar okunur
    const {p, ctx} = await sayfa({tema: 'light'});
    const bg = await p.evaluate(() => getComputedStyle(document.getElementById('uye39')).backgroundColor);
    ok('B açık temada seçim ekranı obsidyen zeminde (tema değişkenlerinden etkilenmez)', bg === 'rgb(9, 12, 11)', bg);
    await p.screenshot({path: path.join(SH, 'secim-acik-tema.png')}); await ctx.close();
  }
  { // seçim + hatırla → yeniden açılışta doğrudan Premium; geri tuşu açılış ekranına/Klasik'e düşmez
    const {p, ctx} = await sayfa();
    await p.check('#uye39-hat'); await p.click('.uye39-b.cp'); await p.waitForTimeout(1200);
    const a = await p.evaluate(() => ({view, on: V39.on, pref: JSON.parse(localStorage.getItem('dk-deneyim39')), hl: history.length, st: history.state}));
    ok('B Premium seçimi: koridor açılır, tercih kaydedilir, açılış seçimi geçmişin kökü olur', a.view === 'pdunya' && a.on && a.pref.son === 'premium' && a.pref.hatirla && a.st && a.st.v30 === 0, a);
    await p.reload(); await p.waitForTimeout(1600);
    const c = await p.evaluate(() => ({view, uye: !!document.getElementById('uye39')}));
    ok('B “hatırla” ile yeniden açılış: seçim ekranı sorulmadan koridor', c.view === 'pdunya' && !c.uye, c);
    await ctx.close();
  }

  /* ---------- C. Deneyim değiştirme düğmesi ---------- */
  {
    const {p, ctx} = await sayfa({w: 360, h: 760, mod: 'premium'});
    const PR = [['pdunya', null], ['psinif', {pg: 5}], ['punite', {pg: 5, pu: 'DKAB-5-U01'}], ['pders', {pt: 'TPC-5-1-01', ptab: 'anlat'}], ['pozet', {pg: 5}], ['pilerleme', null], ['pfav', null], ['poyun', null], ['games', null], ['pek', null], ['poyna', {oyn: 'kutuphane', obol: '5-2026-U01', odevam: 0}]];
    const sonuc = [];
    for (const [v, a] of PR) {
      await p.evaluate(([v, a]) => go(v, a), [v, a]); await p.waitForTimeout(v === 'pdunya' || v === 'poyna' ? 1500 : 500);
      sonuc.push(await p.evaluate((v) => { const e = [...document.querySelectorAll('.dg42')].find((x) => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0; }); if (!e) return {v, yok: 1}; const r = e.getBoundingClientRect(), t = e.textContent.trim(), ust = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return {v, iw: innerWidth, t, w: Math.round(r.width), h: Math.round(r.height), icinde: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, ustte: !!ust && (e === ust || e.contains(ust))}; }, v));
      if (['pdunya', 'pders', 'poyna'].includes(v)) await p.screenshot({path: path.join(SH, `dugme-360-${v}.png`)});
    }
    const kotu = sonuc.filter((x) => x.yok || x.iw !== 360 || !x.t || x.h < 40 || !x.icinde || !x.ustte);
    ok('C 360 px: Premium’un her ekranında (koridor, sınıf, ünite, ders, özet, ilerleme, favoriler, oyun merkezi, ödünç Klasik ekranlar, oyun) yazılı, görünür, dokunulabilir deneyim düğmesi', kotu.length === 0, kotu.length ? kotu : sonuc.map((x) => x.v + ':' + x.t).join(' '));
    // oyun: duraklatma menüsü ve yazılı Menü düğmesi
    await p.evaluate(() => V41.oyunlar.kutuphane.girisBitti()); await p.waitForTimeout(1200);
    const hud = await p.evaluate(() => { const b = document.querySelector('.o41-hud .o41-ib'); return b ? b.textContent.trim() : ''; });
    await p.evaluate(() => V41.duraklat('kullanici')); await p.waitForTimeout(300);
    const mn = await p.evaluate(() => [...document.querySelectorAll('#o41m .o41-b')].map((x) => x.textContent.trim()));
    ok('C oyun: duraklat düğmesi yazılı (“Menü”), menüde “Deneyimi değiştir”', hud === 'Menü' && mn.some((x) => /Deneyimi değiştir/.test(x)), {hud, mn});
    await p.screenshot({path: path.join(SH, 'oyun-menu-360.png')});
    await ctx.close();
  }
  for (const w of [360, 390, 420]) {
    const {p, ctx} = await sayfa({w, h: 780, mod: 'normal'});
    const r = [];
    for (const [v, a] of [['home', null], ['grade', {g: 5}], ['topic', {t: 'TPC-5-1-01', tab: 'anlat'}], ['games', null]]) {
      await p.evaluate(([v, a]) => go(v, a), [v, a]); await p.waitForTimeout(400);
      r.push(await p.evaluate((v) => { const e = document.getElementById('dg42k'); if (!e) return {v, yok: 1}; const R = e.getBoundingClientRect(); const ch = [...document.querySelector('header.top').children].filter((x) => x !== e && x.getBoundingClientRect().width > 0);
        const cak = ch.filter((x) => { const q = x.getBoundingClientRect(); const ic = [...x.querySelectorAll('*')].concat([x]).filter((y) => y.getBoundingClientRect().width > 0); return ic.some((y) => { const s = y.getBoundingClientRect(); return s.left < R.right - 1 && s.right > R.left + 1 && s.top < R.bottom - 1 && s.bottom > R.top + 1; }); }).map((x) => x.id || x.className);
        return {v, iw: innerWidth, t: e.textContent.trim(), h: Math.round(R.height), icinde: R.left >= 0 && R.right <= innerWidth, cak}; }, v));
    }
    const kotu = r.filter((x) => x.yok || x.iw !== w || x.t !== 'Premium' || !x.icinde || x.cak.length || x.h < 40);
    ok(`C Klasik ${w} px: üst çubukta yazılı “Premium” düğmesi, başka öğeyle çakışmıyor, sayfa taşmıyor/uzaklaşmıyor (ana sayfa, sınıf, konu, oyunlar)`, kotu.length === 0, kotu.length ? kotu : 'tamam');
    if (w === 360) await p.screenshot({path: path.join(SH, 'dugme-klasik-360.png')});
    await ctx.close();
  }
  { // geçiş eşlemesi ve veri koruma
    const {p, ctx} = await sayfa({mod: 'premium', ilr: {fav: {s: [7], k: ['TPC-5-1-01']}, sonSinif: 7}});
    await p.evaluate(() => { localStorage.setItem('dk-oyun41', JSON.stringify({v: 1, oyunlar: {kutuphane: {'5-2026-U01': {oda: 1}}}, ayar: {kalite: 'dengeli'}})); try { Prog.rec(['DKAB.5.1.1'], true); } catch (e) {} });
    const once = await p.evaluate(() => Object.fromEntries(['dk2', 'dk-ilerleme39', 'dk-oyun41', 'dk-atm', 'dk-ogretmen-pin', 'dk-theme'].map((k) => [k, localStorage.getItem(k)])));
    await p.evaluate(() => go('pders', {pt: 'TPC-5-1-01', ptab: 'anlat'})); await p.waitForTimeout(500);
    await p.evaluate(() => V42.degistir()); await p.waitForTimeout(400);
    const sh = await p.evaluate(() => document.querySelector('.dg42s') && document.querySelector('.dg42s').textContent);
    await p.screenshot({path: path.join(SH, 'degistir-paneli.png')});
    await p.click('.dg42-sec.kn'); await p.waitForTimeout(900);
    const a = await p.evaluate(() => ({view, t: G.t, on: V39.on, prem: document.body.hasAttribute('data-prem39'), ss: sessionStorage.getItem(V39.SK)}));
    ok('C Premium ders → Klasik: aynı konu açılır, Premium kapanır (panel hedefi gösterir)', /Açılacak yer: 5\. sınıf · /.test(sh || '') && a.view === 'topic' && a.t === 'TPC-5-1-01' && !a.on && !a.prem && !a.ss, a);
    await p.evaluate(() => go('grade', {g: 7})); await p.waitForTimeout(400);
    await p.evaluate(() => V42.degistir()); await p.waitForTimeout(400); await p.click('.dg42-sec.kp'); await p.waitForTimeout(900);
    const c = await p.evaluate(() => ({view, pg: G.pg, on: V39.on}));
    ok('C Klasik 7. sınıf → Premium: 7. Sınıf Merkezi açılır', c.view === 'psinif' && +c.pg === 7 && c.on, c);
    await p.evaluate(() => V42.degistir()); await p.waitForTimeout(400); await p.click('.dg42-sec:not(.kn):not(.kp)'); await p.waitForTimeout(700);
    const d = await p.evaluate(() => ({uye: !!document.getElementById('uye39'), geri: !!document.querySelector('.o42-geri')}));
    ok('C “Giriş ekranına dön” seçim ekranını açar (oturum içinde “Geri dön” düğmesiyle)', d.uye && d.geri, d);
    await p.click('.o42-geri'); await p.waitForTimeout(700);
    const e = await p.evaluate(() => ({uye: !!document.getElementById('uye39'), view}));
    ok('C seçim ekranındaki “Geri dön” ekranı kapatır, bulunulan ekran değişmez', !e.uye && e.view === 'psinif', e);
    const sonra = await p.evaluate(() => Object.fromEntries(['dk2', 'dk-ilerleme39', 'dk-oyun41', 'dk-atm', 'dk-ogretmen-pin', 'dk-theme'].map((k) => [k, localStorage.getItem(k)])));
    const prog = (x) => { try { return JSON.stringify(JSON.parse(x || '{}').prog || {}); } catch (e) { return x; } };
    // dk2: yalnız öğrenme ilerlemesi (prog) karşılaştırılır; dk2'nin “son ziyaret” gibi alanlarını konu açmak zaten günceller (geçişten bağımsız)
    const fark = Object.keys(once).filter((k) => k !== 'dk-ilerleme39' && (k === 'dk2' ? prog(once[k]) !== prog(sonra[k]) : once[k] !== sonra[k]));
    const dk2Alan = (() => { try { const a = JSON.parse(once.dk2 || '{}'), b = JSON.parse(sonra.dk2 || '{}'); return Object.keys(Object.assign({}, a, b)).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k])); } catch (e) { return []; } })();
    const i0 = JSON.parse(once['dk-ilerleme39'] || '{}'), i1 = JSON.parse(sonra['dk-ilerleme39'] || '{}');
    ok('C geçişler ilerleme, favori, oyun kaydı, ses ve tema kayıtlarını değiştirmez', !fark.length && JSON.stringify(i0.fav) === JSON.stringify(i1.fav) && JSON.stringify(i0.t || {}) === JSON.stringify(i1.t || {}), {fark, fav: i1.fav, dk2DegisenAlan: dk2Alan, prog: prog(sonra.dk2).slice(0, 80)});
    await ctx.close();
  }

  /* ---------- D. Geri tuşu (tarayıcı geçmişi; Android sarmalayıcı aynı geçmişi web.goBack() ile kullanır) ---------- */
  {
    const {p, ctx} = await sayfa({mod: null});
    const st = () => p.evaluate(() => ({view, on: V39.on, uye: !!document.getElementById('uye39'), ui: UI._stack.length, prem: document.body.hasAttribute('data-prem39')}));
    await p.click('.uye39-b.cp'); await p.waitForTimeout(1000);
    await p.evaluate(() => go('psinif', {pg: 5})); await p.waitForTimeout(400);
    await p.evaluate(() => go('pders', {pt: 'TPC-5-1-01', ptab: 'anlat'})); await p.waitForTimeout(400);
    await p.goBack(); await p.waitForTimeout(500); const s1 = await st();
    ok('D ders → geri → sınıf merkezi', s1.view === 'psinif' && s1.on, s1);
    await p.evaluate(() => V40 && V39.secim(true)); await p.waitForTimeout(300);
    await p.goBack(); await p.waitForTimeout(500); const s2 = await st();
    ok('D seçim ekranı açıkken geri: yalnız seçim ekranı kapanır (V41’de ekran açık kalıp arkadaki sayfa değişiyordu)', !s2.uye && s2.view === 'psinif', s2);
    await p.evaluate(() => V39.ara()); await p.waitForTimeout(400);
    await p.goBack(); await p.waitForTimeout(500); const s3 = await st();
    ok('D arama paneli açıkken geri: yalnız panel kapanır', s3.ui === 0 && s3.view === 'psinif', s3);
    await p.evaluate(() => V42.gec('normal')); await p.waitForTimeout(600);
    await p.evaluate(() => go('grade', {g: 6})); await p.waitForTimeout(400);
    await p.goBack(); await p.waitForTimeout(500); const s4 = await st();
    await p.goBack(); await p.waitForTimeout(500); const s5 = await st();
    ok('D Klasik’e geçtikten sonra geri: önce Klasik sınıf → sonra Premium sınıf merkezi, deneyim kaydıyla (Premium’da Klasik ana sayfa açılmaz)', s4.view === 'grade' && !s4.on && !s4.prem && s5.view === 'psinif' && s5.on && s5.prem, {s4, s5});
    await p.goBack(); await p.waitForTimeout(500); const s6 = await st();
    ok('D en başa kadar geri: Premium kökü (koridor), Klasik ana sayfaya düşmez', s6.view === 'pdunya' && s6.on, s6);
    await p.evaluate(() => go('poyun')); await p.waitForTimeout(400);
    await p.evaluate(() => go('poyna', {oyn: 'kutuphane', obol: '5-2026-U01', odevam: 0})); await p.waitForTimeout(900);
    await p.goBack(); await p.waitForTimeout(600); const s7 = await st();
    ok('D oyundan geri: oyun merkezi, oyun temizlenir', s7.view === 'poyun' && await p.evaluate(() => !V41.aktif), s7);
    await ctx.close();
  }

  /* ---------- E. Klavye ve arama ---------- */
  for (const [ad, mod, ac, inp] of [['Premium arama', 'premium', () => { go('psinif', {pg: 5}); setTimeout(() => V39.ara(), 200); }, '#p39q'], ['Klasik arama', 'normal', () => { go('search'); }, '#q2']]) {
    for (const w of [360, 412]) {
      const {p, ctx} = await sayfa({w, h: 800, mod});
      await p.evaluate(ac); await p.waitForTimeout(700);
      const sel = await p.evaluate((s) => { const e = document.querySelector(s); if (e) { e.focus(); e.setAttribute('data-t42', '1'); return true; } return false; }, inp);
      await p.keyboard.type('düzen', {delay: 20});
      // Android Chrome (resizes-content) ve WebView (adjustResize): klavye açılınca pencere küçülür
      await p.setViewportSize({width: w, height: 430}); await p.waitForTimeout(700);
      const r = await p.evaluate((SEL) => { const i = document.querySelector('[data-t42]') || document.querySelector(SEL), sh = document.querySelector('.v-sheet,.v-modal'), R = i.getBoundingClientRect(), Q = sh ? sh.getBoundingClientRect() : {top: 0, bottom: 0}; const bn = document.querySelector('.bnav');
        const sonuc = [...(sh || document.querySelector('#app') || document.body).querySelectorAll('button,a,li')].filter((x) => { const y = x.getBoundingClientRect(); return y.top > R.bottom && y.bottom < innerHeight && y.height > 20 && x.textContent.trim(); }).length;
        return {deger: i.value, odak: document.activeElement === i, inputGor: R.top >= 0 && R.bottom <= innerHeight, panel: Q.bottom <= innerHeight + 1 && Q.top >= -1, kb: document.documentElement.classList.contains('kb42'), bnav: bn ? getComputedStyle(bn).display : 'yok', sonuc}; }, inp);
      ok(`E ${ad} ${w} px, klavye benzetimi (pencere 430 px): yazı alanı odakta ve görünür, yazılan görünür, panel ekranda, alt menü gizli, sonuç görünür`, sel && r.deger === 'düzen' && r.odak && r.inputGor && r.panel && r.kb && r.bnav !== 'flex' && r.bnav !== 'block' && r.sonuc > 0, r);
      if (w === 360) await p.screenshot({path: path.join(SH, `klavye-${mod}-360.png`)});
      if (mod === 'normal') { await ctx.close(); continue; } // Klasik arama sayfa içinde (alt panel yok)
      // Chrome “resizes-visual” davranışı: pencere aynı, yalnız visualViewport küçülür → panel klavyenin üstüne taşınır
      await p.setViewportSize({width: w, height: 800}); await p.waitForTimeout(300);
      const v = await p.evaluate(() => { Object.defineProperty(window, 'visualViewport', {configurable: true, value: {height: 430, offsetTop: 0, width: innerWidth, addEventListener() {}}}); V42.vv(); const ov = document.querySelector('.v-ov'); return {kb: getComputedStyle(document.documentElement).getPropertyValue('--kb42').trim(), alt: getComputedStyle(ov).bottom, sh: Math.round(document.querySelector('.v-sheet,.v-modal').getBoundingClientRect().bottom)}; });
      ok(`E ${ad} ${w} px, visualViewport benzetimi: alt panel klavye yüksekliği kadar yukarıda`, v.kb === '370px' && v.alt === '370px' && v.sh <= 431, v);
      await ctx.close();
    }
  }

  /* ---------- F. Kayıtlı müzikler ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    const a = await p.evaluate(() => ({cat: ATM.CAT[0].id, n: ATM.S.filter((s) => s.m42).length}));
    await p.evaluate(() => V37.sndOpen()); await p.waitForTimeout(400);
    const L = await p.evaluate(() => [...document.querySelectorAll('.m42-m b')].map((e) => e.textContent));
    ok('F ses panelinde “Müzikler” listesi (7 kayıt) ve Tüm sesler’de ilk bölüm', a.cat === 'muzik42' && a.n === 7 && L.length === 7, L.join(' | '));
    await p.screenshot({path: path.join(SH, 'ses-muzikler.png')});
    await p.click('.m42-m >> nth=0'); await p.waitForTimeout(2500);
    const c = await p.evaluate(() => { const n = ATM.rt.nodes.m42_esik; if (!n || !n.el) return {yok: 1}; const d = new Uint8Array(n.an.fftSize); n.an.getByteTimeDomainData(d); let m = 0; d.forEach((v) => (m = Math.max(m, Math.abs(v - 128)))); return {t: +n.el.currentTime.toFixed(2), amp: m, ad: ATM.st.name}; });
    ok('F müzik çalıyor (süre ilerliyor, ses sinyali var)', c.t > 0.5 && c.amp > 2 && c.ad === 'Kutsal Eşikte', c);
    await p.evaluate(() => V42.muzikCal('neydua')); await p.waitForTimeout(1500);
    await p.evaluate(() => ATM.toggleSound('m42_kubbe')); await p.waitForTimeout(1200);
    const d = await p.evaluate(() => ATM.st.L.map((x) => x.id));
    ok('F aynı anda tek müzik', d.length === 1 && d[0] === 'm42_kubbe', d);
    await p.evaluate(() => ATM.toggleSound('yagmur')); await p.waitForTimeout(2000);
    const e = await p.evaluate(() => Object.keys(ATM.rt.nodes));
    ok('F müzik + doğa sesi karışımı', e.includes('m42_kubbe') && e.includes('yagmur'), e);
    await p.evaluate(() => ATM.pause()); await p.waitForTimeout(900);
    const f = await p.evaluate(() => ATM.rt.nodes.m42_kubbe.el.paused);
    await p.evaluate(() => ATM.stopAll()); await p.waitForTimeout(800);
    const g = await p.evaluate(() => Object.keys(ATM.rt.nodes).length);
    ok('F duraklat müziği durdurur; “sesi tamamen kapat” her şeyi kapatır', f && g === 0, {f, g});
    await p.evaluate(() => { UI.close(); setTimeout(() => { ATM.open(); setTimeout(() => { ATM.st.tab = 'kaynak'; ATM.paint(); }, 300); }, 300); }); await p.waitForTimeout(1200);
    const k = await p.evaluate(() => { const e = document.querySelector('.m42-kay'); return e ? [e.querySelectorAll('details').length, /Kaynakta veri bulunmuyor\./.test(e.textContent)] : null; });
    ok('F Kaynak sekmesi: 7 kayıt, lisans bilgisi için “Kaynakta veri bulunmuyor.”', k && k[0] === 7 && k[1], k);
    await ctx.close();
  }

  /* ---------- G. Tema ve genel ---------- */
  for (const tema of ['dark', 'light']) {
    const {p, ctx} = await sayfa({tema, mod: 'normal', w: 390});
    await p.evaluate(() => go('grade', {g: 5})); await p.waitForTimeout(500);
    await p.screenshot({path: path.join(SH, `klasik-sinif5-${tema}.png`)});
    await p.evaluate(() => go('home')); await p.waitForTimeout(400);
    await p.screenshot({path: path.join(SH, `klasik-ana-${tema}.png`)});
    await ctx.close();
  }
  ok('G sayfa hatası (JS) yok', HATA.length === 0, HATA.slice(0, 5));

  const g = S.filter((x) => x.ok).length;
  console.log(`\n${g} / ${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen: g, toplam: S.length, kontroller: S}, null, 1));
  await b.close(); srv.close(); process.exit(g === S.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
