// V52.3 testleri (depo kökünden): node tests/v52_3/test_v523.js
// APK benzetimi (appassets kökeni + sahte DKAndroid: 'hesap-sec' → window.__eposta; 'yedek-yaz'/'yedek-oku' → Node'daki tek “dosya”).
// Yönetici özeti testte deneme adresinin özetiyle değiştirilir (gerçek adres testte yok). Gerçek telefon burada DENENEMEZ.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v52.3.html', F0 = 'surumler/din-kulturu-platformu-v52.2.html';
const SH = path.join(ROOT, 'docs', 'V52.3_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const APK = 'https://appassets.androidplatform.net';
const YON = 'yonetici.deneme@example.com', OGR = 'ogrenci.deneme@example.com';
const OZ = (e) => crypto.createHash('sha256').update('dkab521|' + e.trim().toLowerCase()).digest('hex');
let DOSYA = null;

(async () => {
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v52.3'));
  ok('A1 sürüm V52.3, index.html aynı; veri/müzik/görsel blokları V52.2 ile bayt bayt aynı; önceki sürüm dosyaları ve APK’lar değişmedi', /V31\.VER="V52\.3"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && degisen.length === 0, degisen);
  ok('A2 HTML’de Gmail adresi ve açık PIN yok', !/@gmail\.com/.test(h1) && !h1.includes('030792'));

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const b = await chromium.launch();
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, apk: true, dosya: F, ek: null, dpr: 1}, o || {});
    const html = fs.readFileSync(path.join(ROOT, o.dosya));
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true, deviceScaleFactor: o.dpr});
    await ctx.route('https://accounts.google.com/**', (r) => r.abort());
    await ctx.route('https://www.googleapis.com/**', (r) => r.abort());
    await ctx.exposeFunction('__dosyaYaz', (v) => { DOSYA = v; return true; });
    await ctx.exposeFunction('__dosyaOku', () => DOSYA);
    if (o.apk) await ctx.route(APK + '/assets/index.html', (r) => r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: html}));
    await ctx.addInitScript(([o, oz]) => {
      if (!localStorage.getItem('__s')) {
        localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1');
        localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false}));
        if (o.ek) for (const k in o.ek) localStorage.setItem(k, o.ek[k]);
      }
      let t = 0; const iv = setInterval(() => { if (window.V52 && V52.Tek) { V52.Tek.YONETICI = [oz]; V52.Tek.gizle(); clearInterval(iv); } if (++t > 400) clearInterval(iv); }, 5);
      if (!o.apk) return;
      const dinleyici = []; window.__giden = [];
      const yan = (y) => setTimeout(() => dinleyici.forEach((f) => f({data: JSON.stringify(y)})), 60);
      window.DKAndroid = {postMessage(m) {
        const x = JSON.parse(m); window.__giden.push(x.tur);
        if (x.tur === 'hesap-sec') yan(window.__eposta ? {tur: 'hesap-sec', ok: true, eposta: window.__eposta} : {tur: 'hesap-sec', ok: false, hata: 'iptal'});
        if (x.tur === 'yedek-yaz') window.__dosyaYaz(x.veri);
        if (x.tur === 'yedek-oku') window.__dosyaOku().then((v) => yan(v ? {tur: 'yedek-oku', ok: true, veri: v} : {tur: 'yedek-oku', ok: false}));
      }, addEventListener(t, f) { if (t === 'message') dinleyici.push(f); }};
    }, [o, OZ(YON)]);
    const p = await ctx.newPage(); p.on('pageerror', (er) => HATA.push(er.message));
    await p.goto(o.apk ? APK + '/assets/index.html' : ORIGIN + '/' + o.dosya); await p.waitForTimeout(2300);
    return {p, ctx};
  };
  const K = (p) => p.evaluate(() => {
    const g = document.getElementById('gir523');
    const gor = [...document.body.children].filter((x) => x.id !== 'gir523' && getComputedStyle(x).visibility === 'visible' && getComputedStyle(x).display !== 'none' && x.getBoundingClientRect().height > 0 && x.getBoundingClientRect().width > 0).map((x) => x.id || x.className || x.tagName);
    const ust = g ? document.elementFromPoint(innerWidth / 2, innerHeight / 2) : null;
    return {gate: !!g, gor, ustte: !!(g && ust && g.contains(ust)), metin: g ? g.innerText.replace(/\s+/g, ' ') : '', dugme: g ? g.querySelectorAll('button').length : 0, view, mod: V46.Hesap.oku().mod, ed: !!document.querySelector('#app .ed38-pin'), edMetin: (document.querySelector('#app .pin37-c') || {}).innerText || '', uye: !!document.getElementById('uye39'), hsGor: (() => { const h = document.querySelector('#uye39 .hs46-sec'); return !!h && getComputedStyle(h).display !== 'none'; })(), giden: window.__giden || []};
  });

  /* G1 */
  {
    DOSYA = null;
    const {p, ctx} = await sayfa({dpr: 2});
    const k = await K(p);
    await p.screenshot({path: path.join(SH, 'giris-ekrani.png')});
    ok('G1 APK ilk açılış: ayrı giriş ekranı en üstte; arkadaki uygulama içeriği görünmez; yalnız iki düğme (Google ile giriş, Misafir); e-posta/hesap/şifre gösterilmez',
      k.gate && k.ustte && k.gor.length === 0 && k.dugme === 2 && /Google ile giriş/.test(k.metin) && /Misafir olarak devam et/.test(k.metin) && !/@/.test(k.metin) && !/şifre|PIN/i.test(k.metin), k);
    await p.evaluate(() => go('classes')); await bek(500);
    const k2 = await K(p);
    ok('G1b Giriş ekranı açıkken gezinme denense de (geri tuşu/rota) ekran kalkmaz, içerik görünmez', k2.gate && k2.gor.length === 0 && k2.ustte, k2.gor);
    // vazgeç
    await p.click('#gir523 .g523-g'); await bek(600);
    const k3 = await K(p);
    ok('G2 Google hesap seçici kapatılırsa (vazgeç) giriş ekranında kalınır; hata yazısı yok', k3.gate && k3.giden.includes('hesap-sec') && !/hata|başarısız/i.test(k3.metin) && k3.mod !== 'google', k3.giden);
    await ctx.close();
  }
  /* G3: öğrenci Google */
  {
    DOSYA = null;
    const {p, ctx} = await sayfa({});
    await p.evaluate((e) => { window.__eposta = e; }, OGR);
    await p.click('#gir523 .g523-g'); await bek(1300);
    const k = await K(p);
    await p.screenshot({path: path.join(SH, 'ogrenci-giris-sonrasi.png')});
    if (k.uye && await p.$('#uye39 .uye39-b.cn')) { await p.click('#uye39 .uye39-b.cn'); await bek(1200); }
    await p.reload(); await bek(2300);
    const k2 = await K(p);
    ok('G3 Öğrenci: Google’a basınca doğrudan telefonun hesap listesi; hesap seçilince giriş ekranı kalkar, uygulama açılır (seçim ekranındaki eski giriş kutusu gösterilmez); uygulama yeniden açılınca giriş ekranı tekrar gelmez',
      !k.gate && k.mod === 'google' && !k.hsGor && !k2.gate && k2.mod === 'google', {k: {gate: k.gate, mod: k.mod, uye: k.uye, hsGor: k.hsGor}, k2: {gate: k2.gate}});
    await p.evaluate(async () => { await V46.Hesap.cikis(); }); await bek(700);
    const k3 = await K(p);
    await p.screenshot({path: path.join(SH, 'cikis-sonrasi.png')});
    ok('G4 Çıkış yapınca giriş ekranı geri gelir', k3.gate && k3.gor.length === 0, k3.gate);
    await ctx.close();
  }
  /* G5: misafir */
  {
    DOSYA = null;
    const {p, ctx} = await sayfa({});
    await p.click('#gir523 .g523-m'); await bek(800);
    const k = await K(p);
    await p.reload(); await bek(2300);
    const k2 = await K(p);
    ok('G5 Misafir: giriş ekranı kalkar, uygulama açılır; yeniden açılışta giriş ekranı tekrar gelmez', !k.gate && !k2.gate && k2.mod !== 'google', {k: k.gate, k2: k2.gate});
    await ctx.close();
  }
  /* G6: yönetici */
  {
    DOSYA = null;
    const {p, ctx} = await sayfa({});
    await p.evaluate((e) => { window.__eposta = e; }, YON);
    await p.click('#gir523 .g523-g'); await bek(1500);
    const k = await K(p);
    await p.screenshot({path: path.join(SH, 'yonetici-giris-sonrasi.png')});
    ok('G6 Yönetici hesabı seçilince giriş ekranı kalkar ve doğrudan “Yönetici şifreni belirle” ekranı açılır', !k.gate && k.view === 'editor' && k.ed && /Yönetici şifreni belirle/.test(k.edMetin) && !k.uye, {view: k.view, ed: k.edMetin.slice(0, 80)});
    await ctx.close();
  }
  /* G7: yeniden kurulum → yedekten geri gelince giriş ekranı gelmez */
  {
    DOSYA = null;
    const a = await sayfa({});
    await a.p.evaluate((e) => { window.__eposta = e; }, OGR);
    await a.p.click('#gir523 .g523-g'); await bek(1300);
    await a.p.evaluate(() => { localStorage.setItem('dk-deneme523', '1'); }); await bek(5200);
    await a.ctx.close();
    const c = await sayfa({}); await bek(2500);
    const k = await K(c.p);
    ok('G7 Uygulama yeniden kurulup Google yedeği geri gelince aynı hesapla açılır; giriş ekranı tekrar sorulmaz', !k.gate && k.mod === 'google' && DOSYA && JSON.parse(DOSYA).ls['dk-giris523'], {gate: k.gate, mod: k.mod});
    await c.ctx.close();
  }
  /* G8: küçük ekran */
  {
    DOSYA = null;
    const {p, ctx} = await sayfa({w: 360, h: 640});
    const r = await p.evaluate(() => { const bs = [...document.querySelectorAll('#gir523 button')].map((x) => x.getBoundingClientRect()); return {tasma: document.getElementById('gir523').scrollWidth > innerWidth, icinde: bs.every((q) => q.left >= 0 && q.right <= innerWidth && q.bottom <= innerHeight), yuk: bs.map((q) => Math.round(q.height))}; });
    await p.screenshot({path: path.join(SH, 'giris-ekrani-360.png')});
    ok('G8 360×640 ekranda yatay taşma yok, iki düğme de ekranda ve en az 48 px yüksek', !r.tasma && r.icinde && r.yuk.every((y) => y >= 48), r);
    await ctx.close();
  }
  /* G9: tarayıcı */
  {
    DOSYA = null;
    const {p, ctx} = await sayfa({apk: false});
    const k = await K(p);
    ok('G9 Tarayıcıda (APK dışı) giriş ekranı yok; davranış V52.2 ile aynı', !k.gate, k.gate);
    await ctx.close();
  }
  /* G10: öğrenci/öğretmen ekranları V52.2 ile aynı (misafir) */
  {
    const R = [['home', null], ['classes', null], ['grade', {g: 5}], ['topic', {t: 'TPC-5-2-01', tab: 'anlat'}], ['search', {q: 'namaz'}], ['games', null], ['calis45', null]];
    const ek = {'dk-giris523': JSON.stringify({v: 1, tur: 'misafir'}), 'dk-deneyim39': JSON.stringify({son: 'normal', hatirla: true})};
    const al = async (dosya) => { DOSYA = null; const {p, ctx} = await sayfa({dosya, ek}); const o = {}; for (const [v, a] of R) { await p.evaluate(([v, a]) => go(v, a), [v, a]); await bek(600); o[v] = await p.evaluate(() => $.innerHTML.replace(/V5[12]\.[0-9]/g, 'V5x').replace(/blob:[^"]+/g, 'blob:')); } await p.evaluate(() => { V36.ss(V36.SK, '1'); go('ogretmen'); }); await bek(900); o.ogretmen = await p.evaluate(() => $.innerHTML.replace(/V5[12]\.[0-9]/g, 'V5x').replace(/blob:[^"]+/g, 'blob:')); await ctx.close(); return o; };
    const a = await al(F0), c = await al(F), fark = Object.keys(a).filter((k) => a[k] !== c[k]);
    ok('G10 Giriş sonrası öğrenci (Elmas) ve öğretmen ekranları V52.2 ile birebir aynı', fark.length === 0, fark);
  }
  ok('G11 Bütün senaryolarda JavaScript hatası yok', HATA.length === 0, HATA.slice(0, 5));
  const gc = S.filter((x) => x.ok).length;
  console.log(`\n${gc}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen: gc, toplam: S.length, kontroller: S}, null, 1));
  await b.close(); st.close(); process.exit(gc === S.length ? 0 : 1);
})().catch((er) => { console.error(er); process.exit(2); });
