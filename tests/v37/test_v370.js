// V37.0 testleri (Playwright + Chromium). Depo kökünden:  node tests/v37/test_v370.js
// Not: Tarayıcı otomasyonudur; gerçek cihaz testi değildir. Telefon/tablet ölçüleri emüle edilmiştir.
const {chromium} = require('playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
// Sayfalar yerel bir http sunucusundan açılır (GitHub Pages'e benzer; başsız Chromium'da file:// sayfalarında
// sekmeler/yenilemeler arasında localStorage eşitlemesi güvenilir değildi — V36'da da aynı kayıp görüldü).
const http = require('http'), fs = require('fs');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
const BASE = () => 'http://127.0.0.1:' + srv.address().port;
let V37, V36, IDX;

const R = [];
const ok = (id, name, pass, detail) => { R.push({id, name, pass: !!pass, detail}); console.log((pass ? 'GEÇTİ ' : 'KALDI ') + id + ' · ' + name + (detail !== undefined ? ' — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : '')); };

const OGRT_DATA = {v:1,app:'dkab-ogretmen',classes:[{g:12,py:'2018'},{g:5,py:'2026'}],active:'12|2018',status:{'DKAB18-12-U02-O01':'isl','DKAB18-12-U02-O02':'tek'},plans:[{id:'Ptest1',g:12,py:'2018',unitId:'DKAB18-12-U02',oid:'DKAB18-12-U02-O01',date:'2026-11-10',time:'09:00',dur:40,goal:'Deneme hedefi',method:'',notes:'Not',sy:null,wk:null,updated:'2026-11-01T00:00:00.000Z',created:'2026-11-01T00:00:00.000Z'}],updatedAt:'2026-11-01T00:00:00.000Z'};

async function ctxWith(b, {w = 390, h = 844, theme = 'dark', seed = true, extra = {}} = {}) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700, hasTouch: true});
  await ctx.addInitScript(([t, seed, data, extra]) => {
    if (localStorage.getItem('__seeded')) return;
    localStorage.setItem('__seeded', '1'); localStorage.setItem('dk-theme', t);
    if (seed) localStorage.setItem('dk-ogretmen-v1', JSON.stringify(data));
    for (const k in extra) localStorage.setItem(k, extra[k]);
  }, [theme, seed, OGRT_DATA, extra]);
  return ctx;
}
async function open(ctx, url = V37) { const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(e.message)); await p.goto(url); await p.waitForTimeout(2200); return p; }
const keypad = async (p, digits) => { for (const d of digits) await p.click(`.pin37-k button:text-is("${d}")`); await p.waitForTimeout(150); };
const teacherKeys = p => p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^dk-ogretmen-(v1|hafta-v1)$/.test(k)) o[k] = localStorage.getItem(k); } return o; });

(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  await new Promise(r => srv.listening ? r() : srv.once('listening', r));
  V37 = BASE() + '/surumler/din-kulturu-platformu-v37.0.html'; V36 = BASE() + '/surumler/din-kulturu-platformu-v36.0.html'; IDX = BASE() + '/index.html';

  // ---------- 0. Sürüm, veri ve özellik koruma ----------
  {
    const c36 = await ctxWith(b, {seed: false}), c37 = await ctxWith(b, {seed: false});
    const cI = await ctxWith(b, {seed: false});
    const p36 = await open(c36, V36), p37 = await open(c37, V37), pI = await open(cI, IDX);
    const snap = p => p.evaluate(() => ({ver: V31.VER, routes: Object.keys(V30.routes).sort(), cols: Object.fromEntries(Object.keys(COL).map(c => [c, Store.all(c).length])), ogrt: Object.keys(OGRT).filter(k => typeof OGRT[k] === 'function').sort(), w: Object.keys(OGRT.W).filter(k => typeof OGRT.W[k] === 'function').sort(), seeds: [...document.querySelectorAll('script[type="application/json"]')].map(s => s.id + ':' + s.textContent.length)}));
    const a = await snap(p36), z = await snap(p37), i = await snap(pI);
    ok('0.1', 'Sürüm etiketi V37.0 (index.html ve sürüm dosyası aynı)', z.ver === 'V37.0' && i.ver === 'V37.0', z.ver);
    ok('0.2', 'Veri blokları V36 ile aynı boyutta', JSON.stringify(a.seeds) === JSON.stringify(z.seeds), z.seeds.join(' '));
    ok('0.3', 'Koleksiyon kayıt sayıları V36 ile aynı', JSON.stringify(a.cols) === JSON.stringify(z.cols), z.cols);
    ok('0.4', 'Rotalar korunuyor', JSON.stringify(a.routes) === JSON.stringify(z.routes), z.routes.length + ' rota');
    ok('0.5', 'Öğretmen paneli işlevleri korunuyor', a.ogrt.every(f => z.ogrt.includes(f)) && a.w.every(f => z.w.includes(f)), z.ogrt.length + ' + ' + z.w.length + ' işlev');
    ok('0.6', 'Sayfa hatası yok', !p37._errs.length && !pI._errs.length, p37._errs.concat(pI._errs));
    await c36.close(); await c37.close(); await cI.close(); // açık bırakılan bağlam, sonraki bağlamda yenileme sonrası localStorage kaybına yol açıyordu (başsız Chromium; V36'da da görüldü)
  }

  // ---------- 1–3, 6–7. PIN ----------
  {
    const ctx = await ctxWith(b);
    const p = await open(ctx);
    const before = await teacherKeys(p);
    await p.evaluate(() => go('ogretmen')); await p.waitForTimeout(300);
    const s1 = await p.evaluate(() => ({h: document.querySelector('#pin37-h')?.textContent, len: document.querySelectorAll('.pin37-d i').length, hasLen: !!document.querySelector('.pin37-len'), panel: !!document.querySelector('.og')}));
    ok('1.1', 'İlk girişte PIN oluşturma ekranı açılıyor (sabit 1999 yok)', s1.h === "Öğretmen PIN'i oluştur" && !s1.panel && s1.hasLen, s1);
    await keypad(p, '1999');
    const s2 = await p.evaluate(() => document.querySelector('#pin37-h')?.textContent);
    await keypad(p, '1998');
    const s3 = await p.evaluate(() => ({h: document.querySelector('#pin37-h')?.textContent, msg: document.querySelector('#pin37-msg')?.textContent, rec: localStorage.getItem('dk-ogretmen-pin')}));
    ok('1.2', 'Doğrulama adımı var; eşleşmeyen PIN kaydedilmiyor', s2 === "PIN'i doğrula" && s3.h === "Öğretmen PIN'i oluştur" && /eşleşmedi/.test(s3.msg) && s3.rec === null, s3.msg);
    await keypad(p, '4826'); await keypad(p, '4826');
    const s4 = await p.evaluate(() => ({panel: !!document.querySelector('.og'), rec: JSON.parse(localStorage.getItem('dk-ogretmen-pin') || 'null'), sess: sessionStorage.getItem('dk-ogrt-oturum')}));
    ok('1.3', '4 haneli PIN oluşturuldu, oturum açıldı', s4.panel && s4.rec && s4.rec.v === 2 && s4.rec.len === 4 && s4.sess === '1', s4.rec && {v: s4.rec.v, len: s4.rec.len});
    ok('1.4', "PIN açık metin olarak saklanmıyor", s4.rec && !JSON.stringify(s4.rec).includes('4826') && /^[0-9a-f]{64}$/.test(s4.rec.h));
    const core = o => { const d = JSON.parse(o['dk-ogretmen-v1'] || 'null'); return d && JSON.stringify({c: d.classes, s: d.status, p: d.plans}); };
    const after1 = await teacherKeys(p);
    ok('7.1', 'PIN oluşturma öğretmen kayıtlarını (sınıflar, kazanım durumları, ders planları) değiştirmedi', core(after1) === core(before), 'not: paneli ilk açış, V36 ile aynı şekilde haftalık planı kurar ve updatedAt yazar');
    const base = after1;

    // 4. gezinmede oturum korunur
    for (const k of ['home', 'classes', 'games', 'dene']) { await p.evaluate(k => go(k), k); await p.waitForTimeout(150); }
    await p.evaluate(() => go('ogretmen')); await p.waitForTimeout(300);
    ok('4.1', 'Öğrenci ekranlarına geçip dönünce PIN yeniden istenmiyor', await p.evaluate(() => !!document.querySelector('.og') && !document.querySelector('.pin37')));
    // 5. arka plan / ekran kilidi (emülasyon) ve yenileme
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, get: () => true}); Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => 'hidden'}); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('pagehide')); window.dispatchEvent(new Event('blur')); });
    await p.waitForTimeout(300);
    await p.evaluate(() => { delete document.hidden; delete document.visibilityState; document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('pageshow')); window.dispatchEvent(new Event('focus')); go('home'); go('ogretmen'); });
    await p.waitForTimeout(300);
    const bg = await p.evaluate(() => !!document.querySelector('.og'));
    await p.reload(); await p.waitForTimeout(2200); await p.evaluate(() => go('ogretmen')); await p.waitForTimeout(300);
    const rl = await p.evaluate(() => !!document.querySelector('.og'));
    ok('5.1', 'Arka plana alma/geri dönme (olay emülasyonu) ve yenilemede oturum korunuyor', bg && rl, {arkaPlan: bg, yenileme: rl});
    // 6. Oturumu kapat → PIN
    await p.click('.og-out'); await p.waitForTimeout(300); await p.evaluate(() => go('ogretmen')); await p.waitForTimeout(300);
    const lo = await p.evaluate(() => ({h: document.querySelector('#pin37-h')?.textContent, panel: !!document.querySelector('.og'), dots: document.querySelectorAll('.pin37-d i').length, rec: (localStorage.getItem('dk-ogretmen-pin')||'YOK').slice(0,40), r: !!V36.rec(), keys: Object.keys(localStorage)}));
    ok('6.1', 'Oturumu kapatınca tekrar PIN isteniyor', lo.h === 'Öğretmen Paneli' && !lo.panel && lo.dots === 4, lo);
    // 2. doğrulama
    await keypad(p, '4826');
    ok('2.1', 'Doğru PIN ile giriş', await p.evaluate(() => !!document.querySelector('.og')));
    // 6.2 yeni uygulama oturumu (yeni sekme: sessionStorage boş)
    const p2 = await ctx.newPage(); await p2.goto(V37); await p2.waitForTimeout(2200); await p2.evaluate(() => go('ogretmen')); await p2.waitForTimeout(300);
    ok('6.2', 'Yeni uygulama oturumunda (yeni sekme) PIN isteniyor', await p2.evaluate(() => !!document.querySelector('.pin37') && !document.querySelector('.og')));
    // 3. yanlış denemeler
    const wrong = [];
    for (let i = 0; i < 5; i++) { await keypad(p2, '0000'); wrong.push(await p2.evaluate(() => document.querySelector('#pin37-msg')?.textContent)); }
    const lockState = await p2.evaluate(() => ({dis: document.querySelector('.pin37-k button').disabled, msg: document.querySelector('#pin37-msg').textContent}));
    const chk = await p2.evaluate(() => V36.check('4826'));
    ok('3.1', 'Yanlış PIN: kalan deneme sayısı gösteriliyor', /Kalan deneme: 4/.test(wrong[0]) && /Kalan deneme: 1/.test(wrong[3]), wrong.slice(0, 2));
    ok('3.2', '5 hatalı denemeden sonra bekleme; bu sürede doğru PIN de kabul edilmiyor', lockState.dis && /saniye sonra/.test(lockState.msg) && !chk.ok && chk.lock > 0, lockState.msg);
    const p3 = await ctx.newPage(); await p3.goto(V37); await p3.waitForTimeout(2200); await p3.evaluate(() => go('ogretmen')); await p3.waitForTimeout(300);
    ok('3.3', 'Bekleme yeni sekmede de sürüyor (localStorage)', await p3.evaluate(() => document.querySelector('.pin37-k button').disabled));
    await p3.evaluate(() => { const a = JSON.parse(localStorage.getItem('dk-ogrt-kilit37')); a.until = Date.now() - 1; localStorage.setItem('dk-ogrt-kilit37', JSON.stringify(a)); V36.pinView(); });
    await keypad(p3, '4826');
    ok('3.4', 'Bekleme bitince doğru PIN kabul ediliyor ve sayaç sıfırlanıyor', await p3.evaluate(() => !!document.querySelector('.og') && !localStorage.getItem('dk-ogrt-kilit37')));
    // PIN değiştirme (4 → 6)
    await p3.evaluate(() => { OGRT.S().tab = 'yedek'; OGRT.render(); });
    await p3.fill('.pin36-s input[name=a]', '4826'); await p3.selectOption('.pin36-s select[name=n]', '6'); await p3.fill('.pin36-s input[name=b]', '135790'); await p3.fill('.pin36-s input[name=c]', '135790');
    await p3.click('.pin36-s button[type=submit]'); await p3.waitForTimeout(200);
    const ch = await p3.evaluate(() => JSON.parse(localStorage.getItem('dk-ogretmen-pin')));
    ok('2.2', "PIN değiştirme (4 → 6 hane) çalışıyor", ch.len === 6 && ch.v === 2);
    await p3.evaluate(() => V36.logout()); await p3.waitForTimeout(200); await p3.evaluate(() => go('ogretmen')); await p3.waitForTimeout(300);
    const six = await p3.evaluate(() => document.querySelectorAll('.pin37-d i').length);
    await keypad(p3, '135790');
    ok('2.3', '6 haneli PIN ile giriş', six === 6 && await p3.evaluate(() => !!document.querySelector('.og')));
    // Unuttum → sıfırla
    await p3.evaluate(() => V36.logout()); await p3.evaluate(() => go('ogretmen')); await p3.waitForTimeout(200);
    await p3.click('text=PIN\'imi unuttum'); await p3.fill('#pin37-rw', 'yanlış'); await p3.click('.pin37-rs button[type=submit]');
    const notReset = await p3.evaluate(() => !!localStorage.getItem('dk-ogretmen-pin'));
    await p3.fill('#pin37-rw', 'sıfırla'); await p3.click('.pin37-rs button[type=submit]'); await p3.waitForTimeout(200);
    const rs = await p3.evaluate(() => ({rec: localStorage.getItem('dk-ogretmen-pin'), h: document.querySelector('#pin37-h')?.textContent}));
    ok('2.4', "PIN'imi unuttum: yanlış onayla sıfırlanmıyor, doğru onayla yalnızca PIN siliniyor ve yeni PIN isteniyor", notReset && rs.rec === null && rs.h === "Öğretmen PIN'i oluştur", rs.h);
    ok('7.2', 'PIN değiştirme ve sıfırlama sonrası öğretmen kayıtları (haftalık plan, notlar dahil) bayt bayt aynı', JSON.stringify(await teacherKeys(p3)) === JSON.stringify(base));
    // 6 haneli oluşturma
    await p3.click('.pin37-len button:text-is("6 haneli")'); await keypad(p3, '246810'); await keypad(p3, '246810');
    ok('1.5', '6 haneli PIN oluşturma', await p3.evaluate(() => !!document.querySelector('.og') && JSON.parse(localStorage.getItem('dk-ogretmen-pin')).len === 6));
    ok('0.7', 'PIN testlerinde sayfa hatası yok', ![p, p2, p3].some(x => x._errs && x._errs.length), [].concat(p._errs || []));
    await ctx.close();
  }
  // V36'da kullanıcının kendi belirlediği PIN (v:1) geçerli kalıyor; 1999 artık çalışmıyor
  {
    const ctx = await ctxWith(b); const p = await open(ctx);
    await p.evaluate(() => { const salt = 'abcd1234'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 1, salt, h: V36.hash(salt, '7531'), at: 'x'})); go('ogretmen'); });
    await p.waitForTimeout(200); await keypad(p, '7531');
    ok('7.3', "V36'da değiştirilmiş (kişisel) PIN V37'de aynen çalışıyor", await p.evaluate(() => !!document.querySelector('.og')));
    const d = await p.evaluate(() => ({def: V36.DEF, src: document.documentElement.outerHTML.includes('v36-varsayilan')}));
    ok('7.4', 'Sabit varsayılan PIN özeti dosyadan kaldırıldı', d.def === null && !d.src);
    await ctx.close();
  }

  // ---------- 8–9. Tema, renk, kazanım kartı, dokunma alanları ----------
  const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const isGreen = c => { const m = c.match(/[\d.]+/g).map(Number); return m[1] > m[0] + 25 && m[1] > m[2] + 15; };
  for (const theme of ['light', 'dark']) {
    const ctx = await ctxWith(b, {theme, extra: {}}); await ctx.addInitScript(() => sessionStorage.setItem('dk-ogrt-oturum', '1'));
    const p = await open(ctx);
    await p.evaluate(() => { const salt = 's'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 2, salt, h: V36.hash(salt, '1111'), len: 4})); go('ogretmen'); });
    await p.waitForTimeout(300);
    await p.evaluate(() => { for (let i = 0; i < 6 && !document.querySelector('.ogw-c.c-kaz'); i++) OGRT.W.step(-1); document.querySelectorAll('.ogw-c').forEach(d => d.open = true); });
    await p.waitForTimeout(300);
    const c = await p.evaluate(() => {
      const g = (s, pr) => { const e = document.querySelector(s); return e ? getComputedStyle(e)[pr] : null; };
      const accents = ['.og-tabs button.on', '.og-cls button.on', '.ogw-wk.on', '.ogw-b.p', '.ogw-prog i'].map(s => [s, g(s, 'backgroundColor'), g(s, 'borderTopColor'), g(s, 'color')]);
      const kz = document.querySelector('.ogw-c.c-kaz'), un = document.querySelector('.ogw-c.c-unite'), code = kz.querySelector('.ogw-kt code');
      const pairs = [['.og-top h1'], ['.ogw-kt'], ['.ogw-c.c-kaz .ogw-ch b'], ['.ogw-b.p'], ['.og-tabs button.on'], ['.ogw-dt'], ['.ogw-pt'], ['.ogw-chip']].map(([s]) => { const e = document.querySelector(s); if (!e) return [s, null]; let bg = 'rgba(0, 0, 0, 0)', x = e; while (x && /rgba\(0, 0, 0, 0\)|transparent/.test(bg)) { bg = getComputedStyle(x).backgroundColor; x = x.parentElement; } if (/rgba\(0, 0, 0, 0\)/.test(bg)) bg = getComputedStyle(document.body).backgroundColor; return [s, getComputedStyle(e).color, bg]; });
      return {mode: document.body.hasAttribute('data-ogrt37'), bodyBg: getComputedStyle(document.body).backgroundColor, accents, kz: {bg: getComputedStyle(kz).backgroundColor, bd: getComputedStyle(kz).borderTopColor, sh: getComputedStyle(kz).boxShadow}, un: {bg: getComputedStyle(un).backgroundColor, bd: getComputedStyle(un).borderTopColor}, code: {d: getComputedStyle(code).display, bg: getComputedStyle(code).backgroundColor, fw: getComputedStyle(code).fontWeight}, pairs};
    });
    const greens = c.accents.filter(a => a.slice(1).some(v => v && isGreen(v)));
    ok(`8.${theme}.1`, `${theme === 'light' ? 'Açık' : 'Koyu'} tema: öğretmen modu etkin, vurgu renklerinde yeşil yok`, c.mode && greens.length === 0, greens.length ? greens : c.accents.map(a => a[0] + ' ' + a[1]).slice(0, 3));
    const low = c.pairs.filter(x => x[1] && ratio(x[1], x[2]) < 4.5).map(x => x[0] + ' ' + ratio(x[1], x[2]).toFixed(2));
    ok(`8.${theme}.2`, `${theme === 'light' ? 'Açık' : 'Koyu'} tema: metin kontrastı ≥ 4.5:1 (ölçülen öğeler)`, low.length === 0, low.length ? low : c.pairs.filter(x => x[1]).map(x => x[0] + ' ' + ratio(x[1], x[2]).toFixed(1)).join(', '));
    ok(`9.${theme}`, `${theme === 'light' ? 'Açık' : 'Koyu'} tema: kazanım kartı diğer kartlardan belirgin (zemin + kenarlık + ayrı kod rozeti)`, c.kz.bg !== c.un.bg && c.kz.bd !== c.un.bd && /inset/.test(c.kz.sh) && c.code.d === 'table' && +c.code.fw >= 700, {kazanim: c.kz, unite: c.un});
    // dokunma alanları
    const small = await p.evaluate(() => { const out = []; for (const t of ['hafta', 'sinif', 'plan', 'ilerleme', 'takvim', 'yedek']) { OGRT.S().tab = t; OGRT.render(); document.querySelectorAll('.og details').forEach(d => d.open = true); document.querySelectorAll('.og button, .og select, .og summary, .og label.og-file, .og input:not([type=hidden]):not([type=file])').forEach(e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return; if (getComputedStyle(e).visibility === 'hidden') return; if (r.height < 43.5 || (e.tagName !== 'SUMMARY' && r.width < 43.5)) out.push(t + ':' + (e.className || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 24) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }); } OGRT.S().tab = 'hafta'; OGRT.render(); return [...new Set(out)]; });
    ok(`7.dokunma.${theme}`, 'Öğretmen panelinde 44 px altında dokunma alanı yok', small.length === 0, small.slice(0, 8));
    await ctx.close();
  }

  // ---------- 10–11. Ses ----------
  {
    const ctx = await ctxWith(b, {seed: false}); const p = await open(ctx);
    await p.evaluate(() => go('topic', {t: Store.all('topics').find(t => t.sections && t.sections.anlatim).id, tab: 'anlat'})); await p.waitForTimeout(300);
    const fab0 = await p.$$eval('#atm-fab,#atm-bar', e => e.length);
    await p.click('#snd37'); await p.waitForTimeout(300); await p.click('.snd37-m >> nth=0'); await p.waitForTimeout(2000);
    await p.click('.v-sheet .p, .sheet .p, button:text-is("Kapat")').catch(() => p.evaluate(() => UI.close())); await p.waitForTimeout(400);
    const t0 = await p.evaluate(() => ATM.rt.ctx.currentTime);
    const float = await p.evaluate(() => { const el = [...document.querySelectorAll('body *')].filter(e => { const s = getComputedStyle(e); return s.position === 'fixed' && e.offsetParent !== null || (s.position === 'fixed' && s.display !== 'none'); }).map(e => e.id || e.className).filter(x => /atm|player|ab-/.test(String(x))); return {el, n: document.querySelectorAll('#atm-fab,#atm-bar').length}; });
    for (const k of ['games', 'home', 'pek', 'links']) { await p.click(`nav.bnav button[data-k="${k}"]`); await p.waitForTimeout(400); }
    const s = await p.evaluate(() => ({playing: ATM.rt.playing, state: ATM.rt.ctx.state, t: ATM.rt.ctx.currentTime, btn: document.getElementById('snd37').dataset.s}));
    ok('10.1', 'Ses açıkken içerik üzerinde yüzen oynatıcı yok', fab0 === 0 && float.n === 0 && float.el.length === 0, float);
    ok('10.2', 'Panel kapanınca ve alt sekme değişince ses devam ediyor', s.playing && s.state === 'running' && s.t > t0 + 1, {sesZamanı: +s.t.toFixed(1), önce: +t0.toFixed(1)});
    await p.click('#snd37'); await p.waitForTimeout(300);
    const ui = await p.evaluate(() => ({name: document.querySelector('.snd37-np b')?.textContent, prev: !!document.querySelector('.snd37-c [aria-label="Önceki ses"]'), next: !!document.querySelector('.snd37-c [aria-label="Sonraki ses"]'), vol: !!document.querySelector('.snd37-v input[type=range]'), off: !!document.querySelector('.snd37-off'), list: document.querySelectorAll('.snd37-m').length}));
    await p.click('.snd37-c .pp'); await p.waitForTimeout(800); const paused = await p.evaluate(() => ATM.rt.paused && !ATM.rt.playing);
    await p.click('.snd37-c .pp'); await p.waitForTimeout(800); const resumed = await p.evaluate(() => ATM.rt.playing);
    const n0 = await p.evaluate(() => ATM.st.name); await p.click('.snd37-c [aria-label="Sonraki ses"]'); await p.waitForTimeout(1200); const n1 = await p.evaluate(() => ATM.st.name);
    await p.locator('.snd37-v input').fill('0.25'); const vol = await p.evaluate(() => ATM.st.vol);
    await p.click('.snd37-off'); await p.waitForTimeout(600); const off = await p.evaluate(() => !ATM.live() && document.getElementById('snd37').dataset.s === 'off');
    ok('11.1', 'Üst çubuk ses panelinde ad, önceki/sonraki, ses seviyesi, kapatma ve ses listesi var', ui.name && ui.prev && ui.next && ui.vol && ui.off && ui.list >= 4, ui);
    ok('11.2', 'Duraklat / devam / sonraki / ses seviyesi / tamamen kapat çalışıyor', paused && resumed && n1 !== n0 && vol === .25 && off, {paused, resumed, n0, n1, vol, off});
    ok('11.3', 'Ses testlerinde sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  // ---------- 12. Alt menü boşluğu ----------
  {
    const res = [];
    for (const inset of [0, 24, 48]) {
      const ctx = await ctxWith(b, {seed: false}); const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
      await cdp.send('Emulation.setSafeAreaInsetsOverride', {insets: {bottom: inset, bottomMax: inset}});
      await p.goto(V37); await p.waitForTimeout(2000);
      res.push(await p.evaluate(i => { const n = document.querySelector('nav.bnav').getBoundingClientRect(); return {inset: i, gap: Math.round(innerHeight - n.bottom)}; }, inset));
      await ctx.close();
    }
    ok('12.1', 'Alt menü sistem alanının üstünde; ek boşluk yok (inset 0 → 8 px, inset varsa = inset)', res[0].gap === 8 && res[1].gap === 24 && res[2].gap === 48, res);
  }

  // ---------- 14. Taşma: telefon ve tablet dikey/yatay ----------
  {
    const bad = [];
    for (const [w, h] of [[360, 740], [390, 844], [820, 1180], [1180, 820], [768, 1024], [1024, 768]]) {
      const ctx = await ctxWith(b, {w, h}); await ctx.addInitScript(() => sessionStorage.setItem('dk-ogrt-oturum', '1'));
      const p = await open(ctx);
      await p.evaluate(() => { const salt = 's'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 2, salt, h: V36.hash(salt, '1111'), len: 4})); });
      const views = [['home'], ['classes'], ['games'], ['links'], ['dene'], ['ogretmen', 'hafta'], ['ogretmen', 'sinif'], ['ogretmen', 'plan'], ['ogretmen', 'takvim'], ['ogretmen', 'yedek']];
      for (const [v, t] of views) {
        const r = await p.evaluate(([v, t]) => { if (t) { OGRT.S().tab = t; } go(v); if (t) OGRT.render(); document.querySelectorAll('.og details').forEach(d => d.open = true);
          const sw = document.documentElement.scrollWidth, iw = innerWidth; const over = [...document.querySelectorAll('#app *')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width) return false; for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o !== 'visible') return false; } if (getComputedStyle(e).position === 'fixed') return false; return r.right > iw + 1 || r.left < -1; }).slice(0, 3).map(e => e.className || e.tagName);
          return {sw, iw, over}; }, [v, t]);
        if (r.sw > r.iw + 1 || r.over.length) bad.push(`${w}x${h} ${v}${t ? '/' + t : ''} scrollWidth=${r.sw} ${r.over.join(',')}`);
      }
      await ctx.close();
    }
    ok('14.1', 'Telefon ve tablet (dikey/yatay) öğrenci ve öğretmen ekranlarında yatay taşma yok', bad.length === 0, bad.slice(0, 10));
  }

  await b.close(); srv.close();
  const f = R.filter(r => !r.pass);
  console.log(`\nToplam ${R.length} kontrol · geçti ${R.length - f.length} · kaldı ${f.length}`);
  require('fs').writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify(R, null, 1));
  process.exit(f.length ? 1 : 0);
})();
