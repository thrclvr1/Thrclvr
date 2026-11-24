// V51.5 editör PIN testleri (depo kökünden): node tests/v51_5/test_v515.js
// Yerel http sunucusu + başsız Chromium + gerçek sunucu/sunucu.js (“dosya” test e-posta sağlayıcısı; gerçek e-posta gönderilmez).
// Ekran görüntüleri: docs/V51.5_ekran/. Tarayıcı otomasyonu gerçek cihaz testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), os = require('os'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v51.5.html', F0 = 'surumler/din-kulturu-platformu-v51.4.html';
const SH = path.join(ROOT, 'docs', 'V51.5_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 380) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const ALICI = 'editor-test@example.invalid';
const OGRT_PIN = JSON.stringify({v: 2, salt: 'abcd', h: 'x'.repeat(64), len: 6}); // öğretmen PIN kaydı: değişmemeli

async function apiSunucu(ek) {
  const port = 19900 + Math.floor(Math.random() * 90), d = fs.mkdtempSync(path.join(os.tmpdir(), 'dkab515b-'));
  const env = Object.assign({}, process.env, {PORT: port, GOOGLE_CLIENT_ID: 'test.apps.googleusercontent.com', IZINLI_KOKENLER: 'http://127.0.0.1:' + srv.address().port, VERITABANI: path.join(d, 'v.sqlite'), NODE_NO_WARNINGS: '1'}, ek || {});
  const sv = cp.spawn(process.execPath, [path.join(ROOT, 'sunucu', 'sunucu.js')], {env, stdio: ['ignore', 'pipe', 'pipe']});
  await new Promise((r) => sv.stdout.on('data', (x) => { if (/sunucusu/.test(x)) r(); }));
  return {sv, U: 'http://127.0.0.1:' + port};
}
const sonKod = (dir) => { const L = fs.readdirSync(dir).sort(); const m = JSON.parse(fs.readFileSync(path.join(dir, L[L.length - 1]), 'utf8')); return (/kodunuz: (\d{6})/.exec(m.metin) || [])[1]; };

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = 'http://127.0.0.1:' + srv.address().port + '/' + F;
  const b = await chromium.launch();
  const baglam = async (o) => {
    o = Object.assign({w: 390, h: 844, sunucu: '', ek: null}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); if (o.sunucu) localStorage.setItem('dk-hesap46', JSON.stringify({v: 1, mod: 'misafir', sunucu: o.sunucu, oturum: '', kullanici: null, surum: 0, son: '', hata: ''})); if (o.ek) for (const k in o.ek) localStorage.setItem(k, o.ek[k]); }, [o]);
    return ctx;
  };
  const sayfa = async (ctx) => { const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL); await p.waitForTimeout(1300); return p; };
  const pinGir = (p, pin) => p.evaluate(async (pin) => { for (const k of pin) V38.edKey(k); await new Promise((r) => setTimeout(r, 400)); return {ok: V38.edOk(), view, msg: (document.getElementById('ed38-msg') || {}).textContent || '', mode: V38.EP.pv.mode}; }, pin);
  const editorAc = (p) => p.evaluate(async () => { go('editor'); await new Promise((r) => setTimeout(r, 400)); });

  /* A. derleme ve güvenlik */
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  ok('A1 sürüm V51.5, index.html aynı; veri blokları V51.4 ile bayt bayt aynı; önceki sürüm dosyalarına dokunulmadı', /V31\.VER="V51\.5"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v51.5')).length === 0);
  ok('A2 HTML’de açık metin PIN (030792), e-posta adresi, SMTP parolası/e-posta API anahtarı yok; ilk PIN yalnız tuzlu özet', !h1.includes('030792') && !/[A-Za-z0-9._%+-]+@(gmail|hotmail|outlook|yahoo)\.com/i.test(h1) && !/SMTP_PAROLA\s*[:=]\s*['"][^'"]+/.test(h1) && !/re_[A-Za-z0-9]{20,}/.test(h1) && /P5\.ILK = \{v: 2, salt: '[0-9a-f]{32}', h: '[0-9a-f]{64}'/.test(h1));

  /* B. giriş, hatalı deneme, kilit */
  {
    const ctx = await baglam({ek: {'dk-ogretmen-pin': OGRT_PIN}}); let p = await sayfa(ctx);
    await editorAc(p);
    await p.screenshot({path: path.join(SH, 'editor-pin-giris.png')});
    const r1 = await pinGir(p, '030792');
    ok('B1 030792 ile başarılı giriş (PIN metin olarak; baştaki 0 korunur); editör alanı açılır', r1.ok && r1.view === 'editor' && await p.evaluate(() => sessionStorage.getItem('dk-editor-oturum38') === '1' && sessionStorage.getItem('dk-editor-oturum515') === '0'), r1);
    const say = await p.evaluate(() => { V38.edLogout(); return true; }); await bek(400);
    await editorAc(p);
    const r2 = await pinGir(p, '30792' + '0'); // 307920: baştaki sıfır olmadan
    const att = await p.evaluate(() => JSON.parse(localStorage.getItem('dk-editor-kilit38')));
    ok('B2 Yanlış PIN (ör. 307920) ile giriş başarısız; hata ve kalan deneme gösterilir; hatalı giriş kaydedilir', !r2.ok && /PIN hatalı/.test(r2.msg) && /4/.test(r2.msg) && att.n === 1 && await p.evaluate(() => V51.EdPin.gecmis().some((x) => x.o === 'hatali')), {msg: r2.msg, att});
    for (const pin of ['111111', '222222', '333333']) await pinGir(p, pin);
    const r5 = await pinGir(p, '444444');
    const kl = await p.evaluate(() => ({lock: V38.edLock(), dis: document.getElementById('ed38-in').disabled, tus: [...document.querySelectorAll('.pin37-k button')].every((b) => b.disabled), att: JSON.parse(localStorage.getItem('dk-editor-kilit38'))}));
    await p.screenshot({path: path.join(SH, 'editor-pin-kilit.png')});
    ok('B3 Beş yanlış girişten sonra kilit: PIN alanı ve tuşlar kullanılamaz, kalan süre yazılır (ilk kilit 1 dk)', kl.lock > 50 && kl.lock <= 60 && kl.dis && kl.tus && /kilitli; kalan süre/.test(r5.msg), {kl, msg: r5.msg});
    const r6 = await p.evaluate(async () => { V38.EP.pv.buf = '030792'; V38.edDone(); await new Promise((r) => setTimeout(r, 300)); return V38.edOk(); });
    ok('B4 Kilit süresince doğru PIN de kabul edilmez', !r6);
    await p.close(); p = await sayfa(ctx); await editorAc(p);
    const yeni = await p.evaluate(() => ({lock: V38.edLock(), dis: document.getElementById('ed38-in').disabled, msg: document.getElementById('ed38-msg').textContent}));
    ok('B5 Uygulama kapatılıp açılınca kilit korunur (deneme sayacı sıfırlanmaz)', yeni.lock > 40 && yeni.dis && /kilitli/.test(yeni.msg), yeni);
    // kilit süresi geçmiş gibi: yeni 5 hatalı deneme → daha uzun kilit (kademeli)
    await p.evaluate(() => { const a = JSON.parse(localStorage.getItem('dk-editor-kilit38')); a.until = Date.now() - 1000; localStorage.setItem('dk-editor-kilit38', JSON.stringify(a)); V38.edPinView(); });
    for (const pin of ['111111', '222222', '333333', '444444', '555555']) await pinGir(p, pin);
    const k2 = await p.evaluate(() => ({lock: V38.edLock(), r: JSON.parse(localStorage.getItem('dk-editor-kilit38')).r}));
    ok('B6 Tekrarlanan hatalı denemelerde kilit süresi kademeli artar (1 dk → 5 dk)', k2.lock > 240 && k2.lock <= 300 && k2.r === 2, k2);
    await p.evaluate(() => { const a = JSON.parse(localStorage.getItem('dk-editor-kilit38')); a.until = Date.now() - 1000; localStorage.setItem('dk-editor-kilit38', JSON.stringify(a)); V38.edPinView(); });
    await pinGir(p, '999999'); const r7 = await pinGir(p, '030792');
    const sonra = await p.evaluate(() => localStorage.getItem('dk-editor-kilit38'));
    ok('B7 Kilit bitince doğru PIN ile giriş; başarılı girişte hatalı deneme sayacı ve kilit kademesi sıfırlanır', r7.ok && sonra === null, {sonra});
    ok('B8 Öğretmen PIN kaydı (dk-ogretmen-pin) değişmedi; editör PIN’i öğretmen oturumu açmaz', await p.evaluate((o) => localStorage.getItem('dk-ogretmen-pin') === o && !V36.ok(), OGRT_PIN));
    await ctx.close();
  }

  /* C. sıfırlama: sunucu yok / yapılandırılmamış */
  {
    const ctx = await baglam({}); const p = await sayfa(ctx); await editorAc(p);
    await p.evaluate(() => V51.EdPin.sifirlamaAc()); await bek(600);
    const r = await p.evaluate(() => ({t: document.querySelector('.pin37-c').innerText, d: (document.querySelector('.ed515-yok') || {}).dataset}));
    await p.screenshot({path: path.join(SH, 'editor-pin-sifirlama-yapilandirilmadi.png')});
    ok('C1 Sunucu adresi yokken: “sıfırlama henüz yapılandırılmadı” açıkça yazar; e-posta gönderildi denmez; PIN değişmez', /henüz yapılandırılmadı/.test(r.t) && !/gönderildi\b/i.test(r.t) && r.d && r.d.durum === 'adres' && await p.evaluate(() => localStorage.getItem('dk-editor-pin38') === null), r.t.slice(0, 200));
    await ctx.close();
    const {sv, U} = await apiSunucu({});
    const ctx2 = await baglam({sunucu: U}); const p2 = await sayfa(ctx2); await editorAc(p2);
    await p2.evaluate(() => V51.EdPin.sifirlamaAc()); await bek(800);
    const r2 = await p2.evaluate(() => ({t: document.querySelector('.pin37-c').innerText, d: (document.querySelector('.ed515-yok') || {}).dataset}));
    ok('C2 Sunucu bağlı ama e-posta servisi yapılandırılmamışsa bu açıkça yazar; gönder düğmesi yok', /sunucuda yapılandırılmadı/.test(r2.t) && r2.d && r2.d.durum === 'yapilandirilmadi' && !/Sıfırlama kodu gönder/.test(r2.t), r2.t.slice(0, 200));
    await ctx2.close(); sv.kill();
  }

  /* D. sıfırlama: yapılandırılmış sunucu (test e-posta sağlayıcısı) */
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dkab515b-posta-'));
  const {sv, U} = await apiSunucu({EDITOR_SIFIRLAMA_EPOSTASI: ALICI, EPOSTA_SAGLAYICI: 'dosya', EPOSTA_DOSYA_DIZINI: dir});
  const dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'dkab515b-posta2-'));
  const {sv: svK, U: UK} = await apiSunucu({EDITOR_SIFIRLAMA_EPOSTASI: ALICI, EPOSTA_SAGLAYICI: 'dosya', EPOSTA_DOSYA_DIZINI: dir2, EP_KOD_SURE_SN: '2'});
  try {
    // süresi dolmuş kod
    {
      const ctx = await baglam({sunucu: UK}); const p = await sayfa(ctx); await editorAc(p);
      await p.evaluate(() => V51.EdPin.sifirlamaAc()); await bek(700);
      await p.evaluate(() => V51.EdPin.talep()); await bek(700);
      const kod = sonKod(dir2); await bek(2300);
      await p.fill('#ed515-kod', kod); await p.click('.pin37-rs button[type=submit]'); await bek(800);
      const r = await p.evaluate(() => ({m: document.getElementById('ed38-msg').textContent, mode: V38.EP.pv.mode}));
      ok('D1 Süresi dolmuş doğrulama kodu reddedilir; PIN ekranına geçilmez', /süresi doldu/.test(r.m) && r.mode === 'kod', r);
      await ctx.close();
    }
    const ctx = await baglam({sunucu: U, ek: {'dk-ogretmen-pin': OGRT_PIN, 'dk2': JSON.stringify({patch: {'TPC-5-1-01': {status: 'published'}}, added: {}, prog: {'DKAB-5-U01-O01': {correct: 3, wrong: 1, mastery: 0.75}}, cards: {}, wrong: {}}), 'dk-ilerleme39': JSON.stringify({fav: {s: [5], k: ['TPC-5-1-01']}, ipucu40: 1})}});
    const p = await sayfa(ctx);
    // ikinci sekme: sıfırlamadan önce editör oturumu açık
    const p2 = await sayfa(ctx); await editorAc(p2); await pinGir(p2, '030792');
    const once = await p.evaluate(async () => { for (let i = 0; i < 60 && !V38.isReady; i++) await new Promise((r) => setTimeout(r, 100)); V38.ED.setNote('topics', 'TPC-5-1-01', 'V51.5 test: editör notu (sıfırlamadan önce)'); await new Promise((r) => setTimeout(r, 600)); const idb = () => new Promise((ok) => { const q = indexedDB.open('dk38'); q.onsuccess = () => { try { const t = q.result.transaction('kv', 'readonly').objectStore('kv').get('ed'); t.onsuccess = () => ok(JSON.stringify(t.result === undefined ? localStorage.getItem('dk38-ed') : t.result)); t.onerror = () => ok('hata'); } catch (e) { ok('yok:' + localStorage.getItem('dk38-ed')); } }; q.onerror = () => ok('acilamadi'); }); const ls = {}; Object.keys(localStorage).filter((k) => !/^dk-editor-(pin38|kilit38|gecmis515)$/.test(k)).forEach((k) => { ls[k] = localStorage.getItem(k); }); return {ls, ed: await idb()}; });
    await editorAc(p);
    await p.evaluate(() => V51.EdPin.sifirlamaAc()); await bek(800);
    await p.screenshot({path: path.join(SH, 'editor-pin-sifirlama-hazir.png')});
    const hz = await p.evaluate(() => document.querySelector('.pin37-c').innerText);
    await p.evaluate(() => V51.EdPin.talep()); await bek(800);
    const kodEkrani = await p.evaluate(() => ({mode: V38.EP.pv.mode, t: document.querySelector('.pin37-c').innerText}));
    await p.screenshot({path: path.join(SH, 'editor-pin-kod.png')});
    ok('D2 E-posta sıfırlama talebi: sunucu kodu kayıtlı editör adresine yazar (test modu açıkça bildirilir); kod ekranı açılır', /Test modu/.test(hz) && kodEkrani.mode === 'kod' && /Test modu/.test(kodEkrani.t) && /^\d{6}$/.test(sonKod(dir) || ''), kodEkrani.t.slice(0, 160));
    const kod = sonKod(dir), yanlis = kod === '000000' ? '111111' : '000000';
    await p.fill('#ed515-kod', yanlis); await p.click('.pin37-rs button[type=submit]'); await bek(800);
    const h = await p.evaluate(() => ({m: document.getElementById('ed38-msg').textContent, mode: V38.EP.pv.mode, pin: localStorage.getItem('dk-editor-pin38')}));
    ok('D3 Hatalı doğrulama kodu reddedilir, kalan deneme yazar; PIN değiştirilemez', /Kod hatalı/.test(h.m) && /4/.test(h.m) && h.mode === 'kod' && h.pin === null, h);
    const atla = await p.evaluate(async () => { V38.EP.pv.mode = 'yeni'; V38.EP.pv.jeton = 'sahte-jeton-' + 'x'.repeat(30); V38.edPinView(); for (const k of '135790135790') V38.edKey(k); await new Promise((r) => setTimeout(r, 900)); await new Promise((r) => setTimeout(r, 600)); return {pin: localStorage.getItem('dk-editor-pin38'), m: document.querySelector('.pin37-c').innerText, mode: V38.EP.pv.mode}; });
    ok('D4 Doğrulama olmadan (sahte jetonla) yeni PIN kaydedilmez; sunucu reddeder ve bu ekranda kalıcı yazılır', atla.pin === null && /PIN değiştirilmedi/.test(atla.m) && atla.mode === 'reset', {pin: atla.pin, mode: atla.mode, m: (atla.m.match(/[^\n]*PIN değiştirilmedi[^\n]*/) || [''])[0]});
    await p.evaluate(async () => { V51.EdPin.sifirlamaAc(); await new Promise((r) => setTimeout(r, 600)); await V51.EdPin.talep(); }); await bek(500);
    const kod2 = sonKod(dir);
    await p.fill('#ed515-kod', kod2); await p.click('.pin37-rs button[type=submit]'); await bek(900);
    const yn = await p.evaluate(async () => { const a = V38.EP.pv.mode; for (const k of '030792') V38.edKey(k); await new Promise((r) => setTimeout(r, 300)); const m1 = document.getElementById('ed38-msg').textContent; return {a, m1, mode: V38.EP.pv.mode}; });
    const ogr = await p.evaluate(async () => { V38.EP.pv.mode = 'yeni'; V38.EP.pv.buf = ''; V38.edPinView(); const T = V36.rec(); return !!T; });
    await p.screenshot({path: path.join(SH, 'editor-pin-yeni.png')});
    const bitir = await p.evaluate(async () => { for (const k of '048291') V38.edKey(k); await new Promise((r) => setTimeout(r, 200)); for (const k of '048291') V38.edKey(k); await new Promise((r) => setTimeout(r, 1200)); return {mode: V38.EP.pv.mode, kayit: JSON.parse(localStorage.getItem('dk-editor-pin38') || 'null'), oturum: V38.edOk()}; });
    ok('D5 Kod doğrulanınca yeni PIN adımı açılır; yeni PIN ilk (geçiş) PIN’iyle aynı olamaz', yn.a === 'yeni' && /ilk \(geçiş\)/.test(yn.m1), yn);
    ok('D6 Başarılı PIN sıfırlama: yeni PIN (048291, baştaki 0 korunur) kaydedilir, PIN sürümü artar, bu sekmedeki oturum kapalı', bitir.mode === 'login' && bitir.kayit && bitir.kayit.v === 2 && bitir.kayit.surum === 1 && bitir.kayit.kaynak === 'sifirlama' && !bitir.oturum, bitir);
    const p2ok = await p2.evaluate(() => V38.edOk());
    ok('D7 PIN sıfırlanınca eski editör oturumları kapanır (sıfırlamadan önce açılmış ikinci sekme artık editör değil)', p2ok === false);
    const eskiPin = await pinGir(p, '030792'); const yeniPin = await pinGir(p, '048291');
    ok('D8 Sıfırlamadan sonra eski PIN (030792) çalışmaz, yeni PIN çalışır', !eskiPin.ok && yeniPin.ok, {eski: eskiPin.msg});
    const sonra = await p.evaluate(async () => { const idb = () => new Promise((ok) => { const q = indexedDB.open('dk38'); q.onsuccess = () => { try { const t = q.result.transaction('kv', 'readonly').objectStore('kv').get('ed'); t.onsuccess = () => ok(JSON.stringify(t.result === undefined ? localStorage.getItem('dk38-ed') : t.result)); t.onerror = () => ok('hata'); } catch (e) { ok('yok:' + localStorage.getItem('dk38-ed')); } }; q.onerror = () => ok('acilamadi'); }); const ls = {}; Object.keys(localStorage).filter((k) => !/^dk-editor-(pin38|kilit38|gecmis515)$/.test(k)).forEach((k) => { ls[k] = localStorage.getItem(k); }); return {ls, ed: await idb()}; });
    const fark = Object.keys(Object.assign({}, once.ls, sonra.ls)).filter((k) => once.ls[k] !== sonra.ls[k] && !/^(dk-mod50|dk-ilerleme39)$/.test(k));
    ok('D9 PIN sıfırlanınca diğer veriler korunur: editör kayıtları (IndexedDB dk38 “ed”, sıfırlamadan önce yazılan not dahil), dk2 (yamalar, ilerleme), favoriler, öğretmen kaydı aynı', fark.length === 0 && once.ed === sonra.ed && /editör notu/.test(sonra.ed) && sonra.ls['dk-ogretmen-pin'] === OGRT_PIN && JSON.parse(sonra.ls.dk2).prog['DKAB-5-U01-O01'].correct === 3, {fark, ed: once.ed === sonra.ed, not: /editör notu/.test(sonra.ed), op: sonra.ls['dk-ogretmen-pin'], dk2: (sonra.ls.dk2 || '').slice(0, 200)});
    const gecmis = await p.evaluate(() => V51.EdPin.gecmis().map((x) => x.o));
    ok('D10 İşlem tarihçesi (bu cihaz): sıfırlama talebi, hatalı kod, kod doğrulandı, PIN değişti, oturumlar kapatıldı, giriş', ['sifirlama-talep', 'kod-hatali', 'kod-dogrulandi', 'pin-degisti', 'oturumlar-kapatildi', 'giris'].every((o) => gecmis.includes(o)), gecmis.slice(0, 12));
    // öğretmen PIN'i editör PIN'i olarak seçilemez (gerçek öğretmen PIN kaydıyla)
    await ctx.close();
  } finally { sv.kill(); svK.kill(); }
  {
    // yeni editör PIN'i öğretmen PIN'iyle aynı olamaz + öğretmen modu etkilenmez
    const ctx = await baglam({}); const p = await sayfa(ctx);
    const r = await p.evaluate(async () => {
      const salt = 'tst', T = {v: 2, salt, h: V36.hash(salt, '246810'), len: 6}; localStorage.setItem('dk-ogretmen-pin', JSON.stringify(T));
      go('editor'); await new Promise((r) => setTimeout(r, 300)); V38.EP.pv.mode = 'yeni'; V38.EP.pv.jeton = 'x'; V38.edPinView(); for (const k of '246810') V38.edKey(k); await new Promise((r) => setTimeout(r, 300));
      const m = document.getElementById('ed38-msg').textContent;
      V38.EP.pv.mode = 'login'; V38.edPinView(); for (const k of '246810') V38.edKey(k); await new Promise((r) => setTimeout(r, 300));
      const ed = V38.edOk(); V36.ss(V36.SK, '1'); go('ogretmen'); await new Promise((r) => setTimeout(r, 400));
      return {m, ed, ogr: view === 'ogretmen' && V36.ok(), pinAyni: JSON.stringify(T) === localStorage.getItem('dk-ogretmen-pin')};
    });
    ok('E1 Öğretmen PIN sistemi etkilenmez: öğretmen PIN’i editör alanını açmaz, yeni editör PIN’i olarak seçilemez; öğretmen paneli açılır, kayıt aynı', /öğretmen PIN'iyle aynı olamaz/.test(r.m) && !r.ed && r.ogr && r.pinAyni, r);
    await ctx.close();
  }
  {
    // V38 biçimindeki eski kullanıcı PIN'i silinmez, yedeğe taşınır; ilk PIN geçerli
    const v1 = JSON.stringify({v: 1, salt: 'eski', h: 'a'.repeat(64), at: '2026-01-01'});
    const ctx = await baglam({ek: {'dk-editor-pin38': v1}}); const p = await sayfa(ctx); await editorAc(p);
    const r = await pinGir(p, '030792');
    const y = await p.evaluate(() => ({y: JSON.parse(localStorage.getItem('dk-editor-pin38-v1-yedek515')), a: localStorage.getItem('dk-editor-pin38')}));
    ok('E2 Eski (V38) editör PIN kaydı silinmez, dk-editor-pin38-v1-yedek515’e taşınır; ilk PIN 030792 geçerli', r.ok && y.y && y.y.h === 'a'.repeat(64) && y.a === null, y);
    await ctx.close();
  }
  {
    // eski testlerin editör oturumu (sessionStorage '1') PIN sürümü 0 iken geçerli; mobil 360×640 görünüm
    const ctx = await baglam({w: 360, h: 640}); const p = await sayfa(ctx);
    const r = await p.evaluate(async () => { sessionStorage.setItem('dk-editor-oturum38', '1'); return V38.edOk(); });
    await p.evaluate(async () => { sessionStorage.clear(); go('editor'); await new Promise((r) => setTimeout(r, 300)); });
    const t = await p.evaluate(() => ({tas: document.documentElement.scrollWidth - innerWidth, tus: [...document.querySelectorAll('.pin37-k button')].every((b) => b.getBoundingClientRect().height >= 44)}));
    await p.screenshot({path: path.join(SH, 'editor-pin-360.png')});
    ok('E3 Mevcut editör oturum/çıkış mekanizması korunur (V38 oturum anahtarı geçerli); 360×640’ta taşma yok, tuşlar ≥ 44 px', r && t.tas <= 1 && t.tus, t);
    await ctx.close();
  }
  ok('Z Sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); srv.close();
  const g = S.filter((x) => x.ok).length;
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify(S, null, 1));
  console.log(`\n${g}/${S.length} kontrol geçti`);
  if (g !== S.length) { console.log('KALDI: ' + S.filter((x) => !x.ok).map((x) => x.ad).join(' | ')); process.exitCode = 1; }
})().catch((e) => { console.error(e); process.exit(1); });
