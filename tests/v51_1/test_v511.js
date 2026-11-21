// V51.1 testleri (depo kökünden): node tests/v51_1/test_v511.js
// Yerel http sunucusu + başsız Chromium; bildirim gönderimi için gerçek sunucu/sunucu.js yerel test kimliğiyle (V48 sunucu
// testindeki yöntem: yerel JWKS + test anahtarı) çalıştırılır. Ekran görüntüleri: docs/V51.1_ekran/.
// Tarayıcı otomasyonu gerçek cihaz testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..');
const F = 'surumler/din-kulturu-platformu-v51.1.html', F0 = 'surumler/din-kulturu-platformu-v51.0.html';
const SH = path.join(ROOT, 'docs', 'V51.1_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
const S = [], HATA = [];
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
// sunucu (yerel test kimliği)
const CID = 'test-istemci.apps.googleusercontent.com';
const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
const jwk = Object.assign(publicKey.export({format: 'jwk'}), {kid: 'k511', alg: 'RS256', use: 'sig'});
const b64u = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const belge = (y) => { const t = Math.floor(Date.now() / 1000); const g = b64u({alg: 'RS256', kid: 'k511', typ: 'JWT'}) + '.' + b64u(Object.assign({iss: 'https://accounts.google.com', aud: CID, sub: '1001', email: 'ogrenci@example.com', email_verified: true, name: 'Ayşe Öğrenci', iat: t, exp: t + 600}, y)); return g + '.' + crypto.sign('RSA-SHA256', Buffer.from(g), privateKey).toString('base64url'); };

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const KOKEN = 'http://127.0.0.1:' + srv.address().port, URL = (f) => KOKEN + '/' + (f || F);
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, lite: '1', mod: 'normal', tema: 'light', ek: null}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', o.lite); localStorage.setItem('dk-theme', o.tema); localStorage.setItem('dk-ptema43', 'gece'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); if (o.ek) Object.entries(o.ek).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL(o.f)); await p.waitForTimeout(1500);
    return {p, ctx};
  };
  const editor = async (p, k) => { await p.evaluate(async (k) => { sessionStorage.setItem('dk-editor-oturum38', '1'); for (let i = 0; i < 60 && !V38.isReady; i++) await new Promise((r) => setTimeout(r, 100)); V38.edGo({k, cid: '', mode: ''}); }, k); await bek(500); };
  const kapat = (p) => p.evaluate(() => { while (UI._stack && UI._stack.length) UI.close(); });

  /* ---------- A. derleme ve veri ---------- */
  const h1 = fs.readFileSync(path.join(ROOT, F), 'utf8'), h0 = fs.readFileSync(path.join(ROOT, F0), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  ok('A1 sürüm V51.1, index.html aynı dosya; V51.0 yedek dosyası duruyor', /V31\.VER="V51\.1"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === h1 && fs.existsSync(path.join(ROOT, F0)));
  ok('A2 bütün veri, müzik ve görsel blokları V51.0 ile bayt bayt aynı', Object.keys(s0).length === Object.keys(s1).length && Object.entries(s0).every(([k, v]) => s1[k] === v), Object.keys(s1).length + ' blok');
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v51.1'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı', deg.length === 0, deg.join(';') || 'yalnız v51.1');

  /* ---------- 1–3. seçim ---------- */
  {
    const {p, ctx} = await sayfa({});
    const tek = {};
    for (const k of ['bekleyen', 'kaynak', 'eslesme', 'duzeltme', 'red', 'onay', 'arsiv51']) {
      await editor(p, k);
      tek[k] = await p.evaluate(() => { const C = [...document.querySelectorAll('.tp51-cb input')]; if (!C.length) return {bos: true, bar: !!document.querySelector('#tp51'), is: [...document.querySelectorAll('.tp51-is')].map((b) => b.dataset.is)}; C[0].click(); if (C[1]) C[1].click(); const a = V51.Toplu.set.size; C[0].click(); return {a, b: V51.Toplu.set.size, yazi: document.getElementById('tp51-n').textContent, is: [...document.querySelectorAll('.tp51-is')].map((b) => b.dataset.is)}; });
    }
    // boş kategorilerde tekli seçimi denemek için kayıt hazırla: 2 düzeltme, 2 ret, 2 onay, 2 arşiv
    await p.evaluate(() => { const ED = V38.ED, L = ED.all().filter((x) => x.k === 'bekleyen' && x.c === 'topics').slice(0, 8); L.slice(0, 2).forEach((x) => ED.mark(x.c, x.r.id, 'duzeltme', 'test')); L.slice(2, 4).forEach((x) => ED.mark(x.c, x.r.id, 'red', 'test')); L.slice(4, 6).forEach((x) => ED.approve(x.c, x.r.id, 'test')); L.slice(6, 8).forEach((x) => { const it = ED.ensure(x.c, x.r); it.kuyrukDisi51 = {at: 'x', not: 'test'}; }); });
    for (const k of ['duzeltme', 'red', 'onay', 'arsiv51']) { await editor(p, k); tek[k] = await p.evaluate(() => { const C = [...document.querySelectorAll('.tp51-cb input')]; C[0].click(); C[1].click(); const a = V51.Toplu.set.size; C[0].click(); return {a, b: V51.Toplu.set.size, yazi: document.getElementById('tp51-n').textContent, is: [...document.querySelectorAll('.tp51-is')].map((b) => b.dataset.is)}; }); }
    ok('T1 Her editör kategorisinde tekli seçim çalışır (seç, birden fazla seç, kaldır) ve seçili sayı görünür', Object.values(tek).every((x) => x.a === 2 && x.b === 1 && /1 içerik seçildi/.test(x.yazi)), tek);
    ok('T1b Kategoriye göre işlemler sınırlı: kaynak bekleyende onay yok; onay arşivinde yayımla/yayından kaldır var, onayla yok; arşivde yalnız geri al', !tek.kaynak.is.includes('onayla') && tek.kaynak.is.includes('kaynak') && tek.onay.is.includes('yayimla') && tek.onay.is.includes('yayindanKaldir') && !tek.onay.is.includes('onayla') && tek.arsiv51.is.join() === 'kuyruga' && tek.bekleyen.is.includes('onayla'), Object.fromEntries(Object.entries(tek).map(([k, v]) => [k, v.is])));
    await editor(p, 'bekleyen');
    const tum = await p.evaluate(async () => { const T = V51.Toplu; T.temizle(); T.tumu(); const n = T.set.size, R = V38.edRows().length, hepsiBu = [...T.set].every((cid) => { const [c, id] = V38.edSplit(cid); return V38.ED.cat(c, Store.get(c, id)) === 'bekleyen'; }); V38.ES().f.g = '5'; V38.ES().n = 30; V38.edView(); await new Promise((r) => setTimeout(r, 200)); const ns = T.set.size; T.temizle(); T.tumu(); const n5 = T.set.size, R5 = V38.edRows().length, sinif5 = [...T.set].every((cid) => { const [c, id] = V38.edSplit(cid); return V38.ED.ctx(c, Store.get(c, id)).g === 5; }); T.temizle(); const t0 = T.set.size, gor = [...document.querySelectorAll('.tp51-cb input')].filter((x) => x.checked).length; V38.ES().f.g = ''; return {n, R, hepsiBu, ns, n5, R5, sinif5, t0, gor, yazi: document.getElementById('tp51-n').textContent}; });
    await p.screenshot({path: path.join(SH, 'editor-toplu-secim.png')});
    ok('T2 Tümünü seç yalnız o kategoriyi (215 onay bekleyen) ve etkin süzgeci (5. sınıf) seçer; süzgeç değişince süzgeç dışı seçim düşer', tum.n === tum.R && tum.hepsiBu && tum.ns === tum.R5 && tum.n5 === tum.R5 && tum.sinif5 && tum.R5 < tum.R, tum);
    ok('T3 Seçimi temizle: seçim 0, kutular boş, “Seçili içerik yok.”', tum.t0 === 0 && tum.gor === 0 && /Seçili içerik yok/.test(tum.yazi), tum);
    await ctx.close();
  }

  /* ---------- 4–9. toplu işlemler ---------- */
  {
    const {p, ctx} = await sayfa({});
    await editor(p, 'kaynak');
    // 4. toplu onay: kaynak bekleyen kayıt onaylanamaz (işlem yok + doğrudan çağrı atlar); onay bekleyenden uygun olanlar onaylanır
    const k4 = await p.evaluate(async () => { const T = V51.Toplu, ED = V38.ED; T.tumu(); const kaynakN = T.set.size, K = T.onKontrol('onayla'); const cid = [...T.set][0]; T.temizle();
      V38.edGo({k: 'bekleyen', cid: '', mode: ''}); await new Promise((r) => setTimeout(r, 300)); T.tumu();
      // bir kaydın içeriğini boşalt (içerik hazırlanmamış): uygun değil sayılmalı
      const L = [...T.set], icsiz = L.find((x) => x.startsWith('topics:')); const r0 = Store.get(...V38.edSplit(icsiz)), sec0 = r0.sections; r0.sections = null;
      const K2 = T.onKontrol('onayla'); const res = await T.calistir('onayla', [...K2.uy.slice(0, 30).map((x) => x.cid), cid], 'Toplu onay notu', K2.ret); UI.close(); r0.sections = sec0;
      const ilk = V38.edSplit(res.sonuc.ok[0]), it = ED.it(...ilk);
      return {kaynakN, kaynakUy: K.uy.length, kaynakRet: K.ret.length, ret2: K2.ret.map((x) => x.neden), ok: res.op.sayi.ok, atla: res.sonuc.atla.map((x) => x.neden), durum: it.state, yay: !!it.published, h: it.history[it.history.length - 1], approved: !!it.approved, kaynakKayitDurum: (ED.it(...V38.edSplit(cid)) || {}).state || 'bekliyor'}; });
    ok('T4 Toplu onay yalnız uygun kayıtları onaylar: kaynak kontrolü eksik ve içeriği olmayan kayıtlar atlanır (nedenleriyle); not ve tarih her kayda', k4.kaynakUy === 0 && k4.kaynakRet === k4.kaynakN && k4.ok === 30 && k4.atla.some((x) => /kategori|Kaynak/i.test(x)) && k4.ret2.some((x) => /hazırlanmamış|Onaylanacak metin yok/.test(x)) && k4.durum === 'onay' && k4.h.note === 'Toplu onay notu' && !!k4.h.at && k4.kaynakKayitDurum !== 'onay', k4);
    ok('T9 Onaylanan içerikler otomatik yayımlanmaz', k4.yay === false && k4.approved, {yay: k4.yay});
    // 5. ret gerekçesi zorunlu (arayüz): boş notla onaylanamaz
    await editor(p, 'bekleyen');
    const r5 = await p.evaluate(async () => { const T = V51.Toplu; T.temizle(); [...document.querySelectorAll('.tp51-cb input')].slice(0, 3).forEach((c) => c.click()); T.baslat('reddet'); await new Promise((r) => setTimeout(r, 400)); const kutu = document.querySelector('.v38-modal'); const baslik = kutu.querySelector('h2').textContent; kutu.querySelector('#v38-cok').click(); await new Promise((r) => setTimeout(r, 300)); const hata = (document.querySelector('.v38-ce') || {}).textContent || ''; const hala = !!document.querySelector('.v38-modal #v38-cok'); document.querySelector('#v38-cn').value = 'Kaynakla uyuşmuyor'; document.querySelector('#v38-cok').click(); await new Promise((r) => setTimeout(r, 900)); UI.close(); await new Promise((r) => setTimeout(r, 300)); const op = V38.mem.ed.toplu51[0]; const H = op.kayit.map((k) => { const it = V38.ED.it(...V38.edSplit(k.cid)); return {s: it.state, n: it.history[it.history.length - 1].note, t: it.history[it.history.length - 1].toplu51}; }); return {baslik, hata, hala, op: op.is, H}; });
    ok('T5 Toplu ret gerekçesi zorunlu; ortak gerekçe her kaydın geçmişine ayrı yazılır, kayıtlar Reddedilenler’e geçer', /reddet/i.test(r5.baslik) && /açıklama yazmalısın/.test(r5.hata) && r5.hala && r5.op === 'reddet' && r5.H.length === 3 && r5.H.every((x) => x.s === 'red' && x.n === 'Kaynakla uyuşmuyor' && x.t), r5);
    // 6. toplu düzeltme: açıklama her kayda
    const r6 = await p.evaluate(async () => { const T = V51.Toplu; V38.edGo({k: 'bekleyen', cid: '', mode: ''}); await new Promise((r) => setTimeout(r, 300)); T.temizle(); T.tumu(); const K = T.onKontrol('duzeltme'); const res = await T.calistir('duzeltme', K.uy.slice(0, 4).map((x) => x.cid), 'Örnekler eksik', K.ret); UI.close(); return res.sonuc.ok.map((cid) => { const it = V38.ED.it(...V38.edSplit(cid)); return {s: it.state, n: it.history[it.history.length - 1].note}; }); });
    ok('T6 Toplu düzeltme: açıklama her kayda ayrı kaydedilir, durum “düzeltme bekliyor”', r6.length === 4 && r6.every((x) => x.s === 'duzeltme' && x.n === 'Örnekler eksik'), r6);
    // 7. kuyruktan kaldır: veri silinmez, geri alınır
    const r7 = await p.evaluate(async () => { const T = V51.Toplu, ED = V38.ED; V38.edGo({k: 'bekleyen', cid: '', mode: ''}); await new Promise((r) => setTimeout(r, 300)); T.temizle(); T.tumu(); const K = T.onKontrol('arsiv'); const sec = K.uy.slice(0, 5).map((x) => x.cid); const once = sec.map((cid) => { const [c, id] = V38.edSplit(cid); return JSON.stringify(Store.get(c, id)); }); const n0 = ED.counts(); const res = await T.calistir('arsiv', sec, 'Bu dönem işlenmeyecek', K.ret); UI.close(); const n1 = ED.counts(); const sonra = sec.map((cid) => { const [c, id] = V38.edSplit(cid); return JSON.stringify(Store.get(c, id)); }); const it = ED.it(...V38.edSplit(sec[0])); const vis1 = vis(Store.get(...V38.edSplit(sec[0]))); const g = await T.geriAl(res.op.id, true); const n2 = ED.counts(); return {ok: res.op.sayi.ok, b0: n0.bekleyen, b1: n1.bekleyen, a1: n1.arsiv51, b2: n2.bekleyen, a2: n2.arsiv51, ayni: once.every((x, i) => x === sonra[i]), surum: it.versions.length >= 1, hist: it.history.map((h) => h.a), vis1, geri: g.ok}; });
    ok('T7 Toplu kaldırma kalıcı silmez: kayıtlar arşive geçer, içerik/sürüm/geçmiş aynen, öğrenci görünürlüğü değişmez; geri alınca kuyruğa döner', r7.ok === 5 && r7.b1 === r7.b0 - 5 && r7.a1 === r7.a2 + 5 && r7.b2 === r7.b0 && r7.ayni && r7.surum && r7.vis1 && r7.geri === 5 && r7.hist.includes('Kuyruktan çıkarıldı (arşiv)'), r7);
    // 8. işlem geçmişi kayıt bazında ayrı + toplu işlem geçmişi ekranı
    await editor(p, 'toplu51');
    const r8 = await p.evaluate(() => ({n: (V38.mem.ed.toplu51 || []).length, ekran: document.querySelectorAll('.tp51-gc li').length, log: V38.mem.ed.log.filter((l) => l.a === 'Toplu işlem').length}));
    await p.screenshot({path: path.join(SH, 'editor-toplu-gecmis.png'), fullPage: true});
    ok('T8 İşlem geçmişi her kayıt için ayrı (T5/T6’da kayıt başına satır) + toplu işlem geçmişi ekranı ve editör günlüğü', r8.n >= 4 && r8.ekran === r8.n && r8.log >= 4, r8);
    // 1.9 toplu yayımlama: uygunluk kontrolü (değişen içerik), yayın, geri alma
    const r9 = await p.evaluate(async () => { const T = V51.Toplu, ED = V38.ED; V38.edGo({k: 'onay', cid: '', mode: ''}); await new Promise((r) => setTimeout(r, 300)); T.temizle(); T.tumu();
      const L = [...T.set]; const [c, id] = V38.edSplit(L[0]); const it = ED.it(c, id); it.versions.push(Object.assign({}, ED.last(it), {vid: 'v99', n: 99})); // onaydan sonra içerik değişmiş
      const K = T.onKontrol('yayimla'); const res = await T.calistir('yayimla', K.uy.map((x) => x.cid), 'Toplu yayın', K.ret); UI.close();
      const pc = res.sonuc.ok[0], [c2, id2] = V38.edSplit(pc), it2 = ED.it(c2, id2), h = it2.history[it2.history.length - 1];
      const veri = JSON.parse(localStorage.getItem('dk2')).patch[id2];
      const g = await T.geriAl(res.op.id, true); const sonra = JSON.parse(localStorage.getItem('dk2')).patch[id2];
      return {sec: L.length, uy: K.uy.length, ret: K.ret.map((x) => x.neden), ok: res.op.sayi.ok, yay: !!it2.published === false, h: {a: h.a, vid: h.vid, at: !!h.at}, veri: veri && veri.status, geri: g.ok, sonra: !!sonra, yayindaSonra: !!it2.published}; });
    ok('T9b Toplu yayımla: onaydan sonra değişen kayıt yayımlanmaz (nedeniyle); uygunlar yayımlanır (tarih, sürüm, kayıt bazında geçmiş); geri alınınca öğrenci ekranı önceki içeriğe döner', r9.uy === r9.sec - 1 && r9.ret.some((x) => /yeniden onay/.test(x)) && r9.ok === r9.uy && r9.h.a === 'Yayımlandı' && r9.h.vid && r9.h.at && r9.veri === 'published' && r9.geri === r9.ok && !r9.sonra && !r9.yayindaSonra, r9);
    await editor(p, 'bekleyen');
    await p.evaluate(() => { [...document.querySelectorAll('.tp51-cb input')].slice(0, 2).forEach((c) => c.click()); V51.Toplu.baslat('onayla'); }); await bek(500);
    await p.screenshot({path: path.join(SH, 'editor-toplu-onay-penceresi.png')});
    await kapat(p); await ctx.close();
  }

  /* ---------- 10–13. bildirim ---------- */
  const js = http.createServer((q, r) => { r.writeHead(200, {'Content-Type': 'application/json'}); r.end(JSON.stringify({keys: [jwk]})); }).listen(0);
  await new Promise((r) => js.once('listening', r));
  const port = 19100 + Math.floor(Math.random() * 300), dbd = fs.mkdtempSync(path.join(os.tmpdir(), 'dkab511-')), U = 'http://127.0.0.1:' + port;
  const env = Object.assign({}, process.env, {PORT: port, GOOGLE_CLIENT_ID: CID, IZINLI_KOKENLER: KOKEN, VERITABANI: path.join(dbd, 'v.sqlite'), GOOGLE_JWKS_URL: 'http://127.0.0.1:' + js.address().port + '/', EDITOR_EPOSTALARI: 'editor@example.com', OGRETMEN_EPOSTALARI: 'ogretmen@example.com', NODE_NO_WARNINGS: '1'});
  const sunucuBaslat = async () => { const sv = cp.spawn(process.execPath, [path.join(ROOT, 'sunucu', 'sunucu.js')], {env, stdio: ['ignore', 'pipe', 'pipe']}); await new Promise((r) => sv.stdout.on('data', (d) => { if (/sunucusu/.test(d)) r(); })); return sv; };
  let sv = await sunucuBaslat();
  const istek = async (yol, yontem, govde, t) => { const r = await fetch(U + yol, {method: yontem || 'GET', headers: Object.assign({'Content-Type': 'application/json', Origin: KOKEN}, t ? {Authorization: 'Bearer ' + t} : {}), body: govde ? JSON.stringify(govde) : undefined}); let j = {}; try { j = await r.json(); } catch (e) {} return {d: r.status, j}; };
  const tok = (await istek('/api/giris', 'POST', {credential: belge({})})).j.oturum, edTok = (await istek('/api/giris', 'POST', {credential: belge({sub: '3003', email: 'editor@example.com', name: 'Editör'})})).j.oturum;
  try {
    // sunucusuz: bu cihazda kayıtlı
    {
      const {p, ctx} = await sayfa({mod: 'premium', tema: 'dark'});
      await p.evaluate(async () => { go('pders', {pt: 'TPC-5-1-01', ptab: 'anlat'}); await new Promise((r) => setTimeout(r, 400)); V48.Bildir.ac('icerik', 'TPC-5-1-01', '', 'anlat'); }); await bek(500);
      const g = await p.evaluate(() => { const bt = document.querySelector('.v-sf button.p'), r = bt.getBoundingClientRect(), e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return {ust: e === bt || bt.contains(e), alt: r.bottom <= innerHeight, bn: getComputedStyle(document.getElementById('bn50')).display}; });
      await p.screenshot({path: path.join(SH, 'altin-bildir-penceresi.png')});
      // klavye: görünür alan küçülür (yazılım klavyesi benzetimi)
      await p.click('.b48-kat button[data-k="Yanlış bilgi"]'); await p.click('.b48-a textarea'); await p.fill('.b48-a textarea', 'Gece-gündüz açıklamasında eksik var.');
      await p.setViewportSize({width: 390, height: 470}); await bek(500);
      const kl = await p.evaluate(() => { const bt = document.querySelector('.v-sf button.p'), r = bt.getBoundingClientRect(), e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return {ust: e === bt || bt.contains(e), alt: r.bottom <= innerHeight + 1, ih: innerHeight}; });
      await p.screenshot({path: path.join(SH, 'altin-bildir-klavye.png')});
      await p.click('.v-sf button.p'); await bek(600);
      const s13 = await p.evaluate(() => { const L = V48.Bildir.oku().liste; return {n: L.length, d: L[0] && L[0].durum, acik: !!document.querySelector('.v-ov'), toast: [...document.querySelectorAll('.v-toast')].map((t) => t.textContent).join('|')}; });
      ok('T10 Bildir düğmesi mobilde (Altın, 390×844) görünür ve alt menünün arkasında kalmaz; pencere açıkken alt menü gizli', g.ust && g.alt && g.bn === 'none', g);
      ok('T11 Klavye açıkken (görünür alan 470 px) Bildir düğmesi görünür ve basılabilir; gönderim yapıldı', kl.ust && kl.alt && s13.n === 1, {kl, n: s13.n});
      ok('T13 Sunucu yoksa “bu cihazda kayıtlı” gösterilir, “gönderildi” denmez', s13.d === 'taslak' && /bu cihazda kayıtlı/i.test(s13.toast) && !/gönderildi\./i.test(s13.toast) && !s13.acik, s13);
      await p.setViewportSize({width: 390, height: 844});
      await p.evaluate(() => go('profil46')); await bek(600);
      const pr = await p.evaluate(() => (document.querySelector('.b48-p') || {}).textContent || '');
      ok('T13b Profilim › Bildirimlerim: “Bu cihazda kayıtlı” durumu açıkça görünür', /Bu cihazda kayıtlı/.test(pr), pr.slice(0, 200));
      await ctx.close();
    }
    // sunucu ile: gerçekten gönderilir; bağlantı hatasında kaybolmaz, yeniden gönderilir, çift kayıt olmaz
    {
      const hesap = {v: 1, mod: 'google', sunucu: U, oturum: tok, kullanici: {ad: 'Ayşe Öğrenci', roller: []}, surum: 0, son: '', hata: ''};
      const {p, ctx} = await sayfa({mod: 'normal', ek: {'dk-hesap46': hesap}});
      await p.evaluate(async () => { go('topic', {t: 'TPC-5-1-01', tab: 'anlat'}); await new Promise((r) => setTimeout(r, 400)); V48.Bildir.ac('icerik', 'TPC-5-1-01', '', 'anlat'); }); await bek(400);
      await p.click('.b48-kat button[data-k="Eksik bilgi"]'); await p.fill('.b48-a textarea', 'Mevsimler eksik anlatılmış.');
      // çift dokunma: tek kayıt
      await p.evaluate(() => { const b = document.querySelector('.v-sf button.p'); b.click(); b.click(); });
      await bek(1500);
      const g1 = await p.evaluate(() => { const L = V48.Bildir.oku().liste; return {n: L.length, d: L[0] && L[0].durum, acik: !!document.querySelector('.v-ov'), toast: [...document.querySelectorAll('.v-toast')].map((t) => t.textContent).join('|')}; });
      const sl = await istek('/api/bildirim', 'GET', null, edTok);
      ok('T12 Bildirim sunucuya gerçekten gönderilir (sunucuda kayıt var, istemcide “gönderildi”); çift dokunmada tek kayıt', g1.n === 1 && g1.d === 'gonderildi' && /gönderildi/.test(g1.toast) && sl.j.liste.length === 1 && sl.j.liste[0].kategori === 'Eksik bilgi', {g1, sunucu: sl.j.liste.length});
      // bağlantı hatası: sunucu kapalı
      sv.kill('SIGTERM'); await new Promise((r) => sv.once('exit', r));
      await p.evaluate(() => V48.Bildir.ac('icerik', 'TPC-5-1-01', '', 'anlat')); await bek(400);
      await p.click('.b48-kat button[data-k="Yazım hatası"]'); await p.fill('.b48-a textarea', 'Bir sözcük yanlış yazılmış.');
      await p.click('.v-sf button.p'); await bek(1500);
      const g2 = await p.evaluate(() => { const L = V48.Bildir.oku().liste; return {n: L.length, d: L[0].durum, acik: !!document.querySelector('.v-ov'), kat: (document.querySelector('.b48-kat button.on') || {}).textContent, ack: (document.querySelector('.b48-a textarea') || {}).value, dugme: (document.querySelector('.v-sf button.p') || {}).textContent, h: (document.getElementById('b48-h') || {}).textContent}; });
      await p.screenshot({path: path.join(SH, 'bildir-baglanti-hatasi.png')});
      ok('T12b Bağlantı hatasında bildirim kaybolmaz: pencere açık, kategori ve açıklama duruyor, “Tekrar dene”; cihazda “bu cihazda kayıtlı”', g2.n === 2 && g2.d === 'taslak' && g2.acik && g2.kat === 'Yazım hatası' && g2.ack === 'Bir sözcük yanlış yazılmış.' && /Tekrar dene/.test(g2.dugme) && /bu cihazda kayıtlı/.test(g2.h), g2);
      sv = await sunucuBaslat();
      await p.click('.v-sf button.p'); await bek(1500);
      const g3 = await p.evaluate(() => { const L = V48.Bildir.oku().liste; return {n: L.length, d: L.map((x) => x.durum), acik: !!document.querySelector('.v-ov')}; });
      const sl2 = await istek('/api/bildirim', 'GET', null, edTok);
      ok('T12c “Tekrar dene” ile aynı bildirim gönderilir; çift kayıt oluşmaz', g3.n === 2 && g3.d.every((x) => x === 'gonderildi') && !g3.acik && sl2.j.liste.length === 2, {g3, sunucu: sl2.j.liste.length});
      await ctx.close();
    }
  } finally { try { sv.kill(); } catch (e) {} js.close(); }

  /* ---------- 14–18. öğretmen paneli ve ayrım ---------- */
  {
    const ek = {'dk-ogretmen-v1': JSON.stringify({v: 1, app: 'dkab-ogretmen', classes: [{g: 5, py: '2026'}], active: '5|2026', status: {'DKAB-5-U01-O01': 'isl'}, plans: [{id: 'P1', g: 5, py: '2026', oid: 'DKAB-5-U01-O01', date: '2026-09-15', time: '09:00', dur: 40, goal: 'Gözlem etkinliği', method: 'Anlatım'}], updatedAt: null}),
      dk2: JSON.stringify({patch: {}, added: {}, prog: {'DKAB-5-U01-O01': {correct: 3, wrong: 1, mastery: 0.75}}, cards: {}, wrong: {}}), 'dk-ogretmen-pin': JSON.stringify({v: 2, salt: 'x', h: 'y', len: 4})};
    const {p, ctx} = await sayfa({ek});
    const o1 = await p.evaluate(() => ['dk2', 'dk-ogretmen-v1', 'dk-ogretmen-pin', 'dk-ilerleme39'].map((k) => localStorage.getItem(k)));
    await p.evaluate(async () => { V36.ss(V36.SK, '1'); go('ogretmen'); await new Promise((r) => setTimeout(r, 400)); OGRT.W.go(1); });
    await bek(400);
    const h = await p.evaluate(() => ({ders: [...document.querySelectorAll('.ogw button')].some((b) => /Ders hazırla/.test(b.textContent)), kr: [...document.querySelectorAll('.ogw-kr button')].map((b) => b.textContent.trim()), plan: (document.querySelector('.ogw-pl') || {}).innerText || '', planVeri: OGRT.d.plans.length, prep: typeof OGRT.W.prep}));
    await p.screenshot({path: path.join(SH, 'ogretmen-haftalik-kart.png')});
    ok('T14 Ders hazırla düğmesi haftalık karttan kalktı; kartta yalnız “İçeriği aç”', !h.ders && h.kr.join() === 'İçeriği aç', h);
    await p.evaluate(() => OGRT.editPlan('P1')); await bek(400); const duz = await p.evaluate(() => !!document.querySelector('.v-ov form, .v-ov textarea, .v-ov input')); await kapat(p);
    ok('T15 Önceki ders planları korunur: kayıt duruyor, haftada listeleniyor ve düzenlenebiliyor', h.planVeri === 1 && /Ders planı/.test(h.plan) && /Düzenle/.test(h.plan) && duz, {plan: h.plan.slice(0, 120), duz});
    const sek = {};
    for (const t of ['hafta', 'sinif', 'diger']) { await p.evaluate((t) => { OGRT.S().tab = t; OGRT.render(); }, t); await bek(250); sek[t] = await p.evaluate(() => { const m = document.querySelector('main').innerText; return {editor: /Editör|editör|PIN|Yönetici|yönetici|Onay alanı|Veri yönetimi/.test(m), ap: !!document.querySelector('.ap51'), sekmeler: [...document.querySelectorAll('.og-main button')].map((b) => b.textContent.trim()).join('|'), sorun: /Sorun Bildir/.test(m)}; }); }
    await p.screenshot({path: path.join(SH, 'ogretmen-ana-panel.png')});
    ok('T16 Öğretmen panelinde (Haftalık, Sınıflarım, Araçlar) editör onayı, editör girişi, PIN ya da yönetim açıklaması yok; Araçlar’da Sorun Bildir', Object.values(sek).every((x) => !x.editor && !x.ap && x.sekmeler === 'Haftalık|Sınıflarım|Araçlar') && sek.diger.sorun, sek);
    // ayrı editör alanı: Mod paneli › Yönetici / Editör girişi → PIN; oturumla editör merkezi ve bütün araçlar
    await p.evaluate(() => V50.Mod.ac()); await bek(400);
    const gir = await p.evaluate(() => (document.querySelector('.ed51-giris') || {}).textContent || '');
    await p.screenshot({path: path.join(SH, 'mod-paneli-editor-girisi.png')});
    await p.click('.ed51-giris'); await bek(700);
    const pin = await p.evaluate(() => ({v: view, liste: !!document.querySelector('.ed38-cats'), girdi: !!document.querySelector('input[type=password], input[inputmode=numeric]')}));
    await editor(p, '');
    const ed = await p.evaluate(() => { const t = document.querySelector('main').innerText; return {kat: [...document.querySelectorAll('.ed38-cat b')].map((b) => b.textContent), cik: /Editör alanından çık/.test(t), ogrt: [...document.querySelectorAll('main button')].some((b) => b.textContent.trim() === 'Öğretmen paneli')}; });
    await p.screenshot({path: path.join(SH, 'editor-ana.png'), fullPage: true});
    ok('T17 Yönetici/editör işlemleri ayrı alanda: Mod paneli › Yönetici / Editör girişi → editör PIN ekranı; oturumla onay kuyrukları, arşiv, işlem geçmişi, yıllık plan, yayın durumu, veri yönetimi, bildirimler, toplu işlem geçmişi', /Yönetici \/ Editör girişi/.test(gir) && pin.v === 'editor' && !pin.liste && pin.girdi && ['Onay bekleyen içerikler', 'Kaynak kontrolü bekleyenler', 'Kazanım eşleşmesi incelemeleri', 'Düzenleme bekleyen içerikler', 'Reddedilen içerikler', 'Onaylanan içerikler (Onay Arşivi)', 'Kuyruktan çıkarılanlar (geri alınabilir)', 'Son yapılan editör işlemleri', 'Yıllık planlar', 'Yayın durumu', 'Veri yönetimi', 'Hata ve geri bildirim', 'Toplu işlem geçmişi'].every((k) => ed.kat.includes(k)) && ed.cik && !ed.ogrt, {gir, pin, ed});
    await p.evaluate(() => sessionStorage.removeItem('dk-editor-oturum38'));
    for (const js of ["go('home')", "go('grade',{g:5})", "go('topic',{t:'TPC-5-1-01',tab:'anlat'})", "go('profil46')"]) { await p.evaluate(js); await bek(350); }
    const o2 = await p.evaluate(() => ['dk2', 'dk-ogretmen-v1', 'dk-ogretmen-pin', 'dk-ilerleme39'].map((k) => localStorage.getItem(k)));
    const og = await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('dk-ogretmen-v1')); return {status: o.status, plans: o.plans.length, prog: Store.ov.prog['DKAB-5-U01-O01'], sayi: ['topics', 'questions', 'flashcards', 'outcomes'].map((c) => Store.all(c).filter(vis).length)}; });
    ok('T18 Öğrenci ve öğretmen kayıtları korunur (ilerleme, PIN kaydı, ders planı, durum kayıtları; öğrencinin gördüğü içerik V51.0 ile aynı)', o1[0] === o2[0] || JSON.parse(o1[0]).prog['DKAB-5-U01-O01'].correct === og.prog.correct, og);
    ok('T18b Öğrenci içeriği V51.0 ile aynı sayıda (246 konu, 723 soru, 672 kart, 238 kazanım) ve öğretmen kayıtları tam', og.sayi.join() === '246,723,672,238' && og.status['DKAB-5-U01-O01'] === 'isl' && og.plans === 1 && o1[2] === o2[2], og);
    await ctx.close();
  }
  // mobil taşma (editör listesi, bildirim, öğretmen)
  {
    const tas = {};
    for (const w of [360, 412]) {
      const {p, ctx} = await sayfa({w});
      await editor(p, 'bekleyen'); tas[w + ' editör'] = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      await p.evaluate(() => { V36.ss(V36.SK, '1'); OGRT.d.classes = [{g: 5, py: '2026'}]; OGRT.d.active = '5|2026'; OGRT.save(); go('ogretmen'); }); await bek(500); tas[w + ' öğretmen'] = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      await ctx.close();
    }
    ok('T19 Mobil (360/412 px): editör listesi ve öğretmen panelinde yatay taşma yok', Object.values(tas).every((x) => x <= 0), tas);
  }

  ok('Z1 sayfa hatası (pageerror) yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); srv.close();
  const g = S.filter((x) => x.ok).length; console.log(`\nToplam: ${g}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), sonuc: S}, null, 1));
  process.exitCode = g === S.length ? 0 : 1;
})().catch((e) => { console.error(e); process.exit(1); });
