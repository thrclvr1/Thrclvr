// V52.1 testleri (depo kökünden): node tests/v52_1/test_v521.js
// APK benzetimi: sayfa https://appassets.androidplatform.net/assets/index.html adresinden açılır; Android köprüsü (DKAndroid) sahte:
// {tur:'hesap-sec'} gelince telefonun hesap seçicisinden dönmüş gibi window.__eposta (yoksa 'iptal') yanıtlanır.
// Gerçek Android hesap seçicisi burada DENENEMEZ. Ekran görüntüleri: docs/V52.1_ekran/.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v52.1.html', F0 = 'surumler/din-kulturu-platformu-v52.0.html';
const SH = path.join(ROOT, 'docs', 'V52.1_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const APK = 'https://appassets.androidplatform.net';
const YON = 'yonetici.deneme@example.com', OGR = 'ogrenci.deneme@example.com';

(async () => {
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v52.1'));
  ok('A1 sürüm V52.1, index.html aynı; veri/müzik/görsel blokları V52.0 ile bayt bayt aynı; önceki sürüm dosyaları ve APK’lar değişmedi', /V31\.VER="V52\.1"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && degisen.length === 0, degisen);
  const java = fs.readFileSync(path.join(ROOT, 'android/app/src/main/java/tr/dkab/platform/MainActivity.java'), 'utf8');
  ok('A2 HTML’de Gmail adresi ve açık PIN yok; Android tarafı “hesap-sec” köprüsünü telefonun hesap seçicisiyle (yalnız com.google) karşılıyor', !/[A-Za-z0-9._%+-]+@gmail\.com/.test(h1) && !h1.includes('030792') && /"hesap-sec"\.equals\(tur\)/.test(java) && /newChooseAccountIntent\(null, null, new String\[\]\{"com\.google"\}/.test(java) && /KEY_ACCOUNT_NAME/.test(java));

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const html = fs.readFileSync(path.join(ROOT, F));
  const b = await chromium.launch();
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, mod: 'normal', apk: true, dosya: F}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.route('https://accounts.google.com/**', (r) => r.abort());
    await ctx.route('https://www.googleapis.com/**', (r) => r.abort());
    if (o.apk) await ctx.route(APK + '/assets/index.html', (r) => r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: html}));
    await ctx.addInitScript(([o]) => {
      if (!localStorage.getItem('__s')) {
        localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1');
        if (o.mod !== 'yeni') localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true}));
        localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false}));
      }
      if (!o.apk) return;
      const dinleyici = []; window.__giden = [];
      window.DKAndroid = {postMessage(m) { window.__giden.push(m); const x = JSON.parse(m); if (x.tur !== 'hesap-sec') return; setTimeout(() => { const y = window.__eposta ? {tur: 'hesap-sec', ok: true, eposta: window.__eposta} : {tur: 'hesap-sec', ok: false, hata: 'iptal'}; dinleyici.forEach((f) => f({data: JSON.stringify(y)})); }, 80); }, addEventListener(t, f) { if (t === 'message') dinleyici.push(f); }};
    }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (er) => HATA.push(er.message));
    await p.goto(o.apk ? APK + '/assets/index.html' : ORIGIN + '/' + o.dosya); await p.waitForTimeout(1900);
    return {p, ctx};
  };
  const D = (p) => p.evaluate(() => { const c = document.querySelector('#app .pin37-c'); const o = V46.Hesap.oku(); return {view, edOk: V38.edOk(), adim1: !!document.querySelector('#app .yn519'), pin: !!document.querySelector('#app #ed38-in'), ed: !!document.querySelector('#app .ed38-cats, #app .ed38-cat, #app .ed38-info'), metin: c ? c.innerText.replace(/\s+/g, ' ').slice(0, 900) : '', mod: o.mod, cihaz: o.cihaz, ad: (o.kullanici || {}).ad, sheet: !!document.querySelector('.v-ov'), giden: (window.__giden || []).map((m) => JSON.parse(m).tur)}; });
  const pinGir = (p, pin) => p.evaluate(async (pin) => { for (const k of pin) V38.edKey(k); await new Promise((r) => setTimeout(r, 700)); return {ok: V38.edOk(), view}; }, pin);

  /* ---------- K1. öğrenci: açılış ekranında Google → telefonun hesap listesi → giriş ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'yeni'});
    await p.evaluate((x) => { window.__eposta = x; }, OGR);
    await p.screenshot({path: path.join(SH, 'acilis.png')});
    await p.click('#uye39 .hs46-g'); await bek(1200);
    const d = await D(p), depo = await p.evaluate(() => localStorage.getItem('dk-hesap46'));
    if (await p.$('#uye39 .uye39-b.cn')) { await p.click('#uye39 .uye39-b.cn'); await bek(1400); }
    await p.evaluate(() => go('profil46')); await bek(700);
    const kart = await p.evaluate(() => (document.querySelector('.h46-hesap') || {}).innerText || '');
    await p.screenshot({path: path.join(SH, 'ogrenci-profilim.png')});
    ok('K1 APK: “Google ile giriş”e basınca ara pencere olmadan doğrudan telefonun Google hesap seçicisi istenir; seçilen hesapla giriş yapılır; Profilim “Telefondaki Google hesabınla giriş yapıldı”; kurulum bölümü yok',
      d.giden.includes('hesap-sec') && !d.giden.includes('google') && d.mod === 'google' && d.cihaz === 1 && d.ad === OGR && /Telefondaki Google hesabınla/.test(kart) && kart.includes(OGR) && !/kurulumu|istemci/i.test(kart) && /"o":"[0-9a-f]{64}"/.test(depo), {d, kart: kart.slice(0, 200)});
    await ctx.close();
  }
  /* ---------- K2. vazgeçme ---------- */
  {
    const {p, ctx} = await sayfa({});
    await p.evaluate(() => go('profil46')); await bek(600);
    await p.click('.h46-hesap button.p'); await bek(900);
    const d = await D(p);
    ok('K2 Hesap seçici kapatılırsa (vazgeç) misafir olarak kalınır, hata yok; ikinci denemede giriş yapılır', d.mod !== 'google' && d.giden.filter((x) => x === 'hesap-sec').length === 1, d);
    await p.evaluate((x) => { window.__eposta = x; }, OGR); await p.click('.h46-hesap button.p'); await bek(1200);
    const d2 = await D(p);
    ok('K2b İkinci denemede seçilen hesapla giriş', d2.mod === 'google' && d2.ad === OGR, d2.ad);
    await ctx.close();
  }
  /* ---------- K3. yönetici: telefondaki Google hesabı + PIN ---------- */
  {
    const {p, ctx} = await sayfa({});
    await p.evaluate(() => go('editor')); await bek(1000);
    const d0 = await D(p);
    await p.screenshot({path: path.join(SH, 'yonetici-adim1.png')});
    await p.evaluate((x) => { window.__eposta = x; }, YON);
    await p.click('#app .yn519-g'); await bek(1500);
    const d1 = await D(p);
    await p.screenshot({path: path.join(SH, 'yonetici-ilk-kayit.png')});
    await p.click('#app .pin37-b'); await bek(600);
    const d2 = await D(p);
    const yanlis = await pinGir(p, '111111'); const kayit0 = await p.evaluate(() => localStorage.getItem('dk-yonetici52'));
    await p.evaluate(() => { V38.EP.pv.buf = ''; }); const pr = await pinGir(p, '030792'); await bek(600);
    const d3 = await D(p), kayit = await p.evaluate(() => localStorage.getItem('dk-yonetici52'));
    await p.screenshot({path: path.join(SH, 'yonetici-editor-alani.png')});
    ok('K3 Yönetici: kurulum/geçiş ekranı yok, “Telefondaki Google hesabınla doğrula” → hesap seçici → “kayıtlı değil” → “Bu hesabı yönetici yap (PIN ile)” → yanlış PIN kaydetmez → doğru PIN → Editör Onay Alanı; kayıtta e-posta yok',
      d0.adim1 && /Telefondaki Google hesabınla doğrula/.test(d0.metin) && !/kurulmadı|Geçiş dönemi/.test(d0.metin) && d1.view === 'editor' && /kayıtlı değil/.test(d1.metin) && d2.pin && !yanlis.ok && kayit0 === null && pr.ok && d3.ed && kayit && !kayit.includes('@') && /"o":"[0-9a-f]{64}"/.test(kayit),
      {d2: d2.metin.slice(0, 200), d2pin: d2.pin, yanlis, kayit0, pr, d3ed: d3.ed, kayit: (kayit || '').slice(0, 90)});
    await p.evaluate(() => V38.edLogout()); await bek(400);
    await p.evaluate(() => go('editor')); await bek(1200);
    const d4 = await D(p); const pr2 = await pinGir(p, '030792'); await bek(400);
    ok('K4 Kayıtlı yönetici hesabı: yeniden girişte doğrudan “Adım 2/2 · Editör PIN’i”', d4.pin && pr2.ok, d4.metin.slice(0, 120));
    await p.evaluate(async () => { await V46.Hesap.cikis(); }); await bek(500);
    const kap = await p.evaluate(() => V38.edOk());
    await p.evaluate((x) => { window.__eposta = x; go('editor'); }, OGR); await bek(900);
    await p.click('#app .yn519-g'); await bek(1500);
    const d5 = await D(p);
    ok('K5 Google hesabından çıkınca yönetici oturumu kapanır; telefondaki başka bir hesap yönetici alanını açamaz', !kap && /kayıtlı değil/.test(d5.metin) && !d5.pin && !d5.edOk, d5.metin.slice(0, 120));
    await ctx.close();
  }
  /* ---------- K6. tarayıcı (APK değil): V52.0 ile aynı ---------- */
  {
    const {p, ctx} = await sayfa({apk: false});
    await p.evaluate(() => go('editor')); await bek(900);
    const d = await D(p);
    const mi = await p.evaluate(() => V52.Cihaz.mi());
    ok('K6 Tarayıcıda (APK dışında) telefon hesap seçicisi yolu kapalı; V52.0 davranışı aynen (kurulum açıklaması + geçiş dönemi)', !mi && /henüz kurulmadı/.test(d.metin) && /Geçiş dönemi/.test(d.metin), d.metin.slice(0, 140));
    await ctx.close();
  }
  /* ---------- K7. öğrenci/öğretmen ekranları V52.0 ile aynı (APK) ---------- */
  {
    const R = [['home', null], ['classes', null], ['grade', {g: 5}], ['topic', {t: 'TPC-5-2-01', tab: 'anlat'}], ['search', {q: 'namaz'}], ['games', null], ['calis45', null]];
    const al = async (dosya) => { const bd = fs.readFileSync(path.join(ROOT, dosya)); const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}); await ctx.route(APK + '/assets/index.html', (r) => r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: bd})); await ctx.addInitScript(() => { if (!localStorage.getItem('__s')) { localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); } window.DKAndroid = {postMessage() {}, addEventListener() {}}; }); const p = await ctx.newPage(); p.on('pageerror', (er) => HATA.push(er.message)); await p.goto(APK + '/assets/index.html'); await p.waitForTimeout(1900); const o = {}; for (const [v, a] of R) { await p.evaluate(([v, a]) => go(v, a), [v, a]); await bek(600); o[v] = await p.evaluate(() => $.innerHTML.replace(/V5[12]\.[0-9]/g, 'V5x').replace(/blob:[^"]+/g, 'blob:')); } await p.evaluate(() => { V36.ss(V36.SK, '1'); go('ogretmen'); }); await bek(900); o.ogretmen = await p.evaluate(() => $.innerHTML.replace(/V5[12]\.[0-9]/g, 'V5x').replace(/blob:[^"]+/g, 'blob:')); await ctx.close(); return o; };
    const a = await al(F0), c = await al(F), fark = Object.keys(a).filter((k) => a[k] !== c[k]);
    ok('K7 Öğrenci (Elmas) ve öğretmen ekranları V52.0 ile birebir aynı (APK adresinde)', fark.length === 0, fark);
  }
  ok('K8 Bütün senaryolarda JavaScript hatası yok', HATA.length === 0, HATA.slice(0, 5));
  const gc = S.filter((x) => x.ok).length;
  console.log(`\n${gc}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen: gc, toplam: S.length, kontroller: S}, null, 1));
  await b.close(); st.close(); process.exit(gc === S.length ? 0 : 1);
})().catch((er) => { console.error(er); process.exit(2); });
