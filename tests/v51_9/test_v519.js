// V51.9 testleri (depo kökünden): node tests/v51_9/test_v519.js
// Yönetici girişi = Google doğrulaması + editör PIN'i; öğrenci Google ya da misafir.
// GERÇEK sunucu/sunucu.js yerel JWKS ile çalıştırılır (kimlik belgeleri test RSA anahtarıyla imzalanır). Google'ın kendi penceresi
// (accounts.google.com/gsi/client) sahte bir betikle taklit edilir: düğmeye basınca test belgesi uygulamanın callback'ine verilir.
// Gerçek Google hesabıyla giriş burada DENENEMEZ (istemci kimliği ve yayındaki sunucu yok). Ekran görüntüleri: docs/V51.9_ekran/.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), os = require('os'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v51.9.html', F0 = 'surumler/din-kulturu-platformu-v51.8.html';
const SH = path.join(ROOT, 'docs', 'V51.9_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const CID = 'test-istemci.apps.googleusercontent.com', YON = 'yonetici@example.com';
const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
const jwk = Object.assign(publicKey.export({format: 'jwk'}), {kid: 'k519', alg: 'RS256', use: 'sig'});
const b64u = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const belge = (y) => { const t = Math.floor(Date.now() / 1000); const g = b64u({alg: 'RS256', kid: 'k519', typ: 'JWT'}) + '.' + b64u(Object.assign({iss: 'https://accounts.google.com', aud: CID, sub: '5001', email: 'ogrenci@example.com', email_verified: true, name: 'Ayşe Öğrenci', iat: t, exp: t + 600}, y)); return g + '.' + crypto.sign('RSA-SHA256', Buffer.from(g), privateKey).toString('base64url'); };
const B_OGRENCI = () => belge({}), B_YONETICI = () => belge({sub: '9009', email: YON, name: 'Platform Yöneticisi'});
const SAHTE_GIS = `window.google={accounts:{id:{initialize(c){window.__gis=c},renderButton(el){const b=document.createElement('button');b.type='button';b.className='gis-sahte';b.textContent='Google ile oturum aç (test)';b.onclick=()=>window.__gis.callback({credential:window.__belge});el.appendChild(b)},disableAutoSelect(){},prompt(){}}}};`;

(async () => {
  /* ---------- A. derleme ---------- */
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v51.9'));
  ok('A1 sürüm V51.9, index.html aynı; veri/müzik/görsel blokları V51.8 ile bayt bayt aynı; önceki sürüm dosyaları ve APK’lar değişmedi', /V31\.VER="V51\.9"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && degisen.length === 0, degisen);
  const js = fs.readFileSync(path.join(ROOT, 'tools/v51_9/v519_yonetici.js'), 'utf8');
  ok('A2 HTML’de yönetici e-postası, Gmail adresi, açık PIN ya da gizli anahtar yok; geçiş ayarı GECIS:true, varsayılan sunucu boş', !/[A-Za-z0-9._%+-]+@gmail\.com/.test(h1) && !h1.includes('030792') && !/client_secret|SMTP_PAROLA\s*[:=]\s*['"][^'"]+/.test(h1) && /GECIS: true,/.test(js) && /SUNUCU: '',/.test(js));

  /* ---------- sunucu (gerçek sunucu.js, yerel JWKS) ---------- */
  const jw = http.createServer((q, r) => { r.writeHead(200, {'Content-Type': 'application/json'}); r.end(JSON.stringify({keys: [jwk]})); }).listen(0);
  await new Promise((r) => jw.once('listening', r));
  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port, URL = ORIGIN + '/' + F;
  const port = 18000 + Math.floor(Math.random() * 2000), dbd = fs.mkdtempSync(path.join(os.tmpdir(), 'v519-'));
  const sv = cp.spawn(process.execPath, [path.join(ROOT, 'sunucu', 'sunucu.js')], {env: Object.assign({}, process.env, {PORT: port, GOOGLE_CLIENT_ID: CID, IZINLI_KOKENLER: ORIGIN, VERITABANI: path.join(dbd, 'v.sqlite'), GOOGLE_JWKS_URL: 'http://127.0.0.1:' + jw.address().port + '/', EDITOR_EPOSTALARI: YON, NODE_NO_WARNINGS: '1'}), stdio: ['ignore', 'pipe', 'pipe']});
  const SUN = 'http://127.0.0.1:' + port;
  for (let i = 0; i < 50; i++) { try { const r = await fetch(SUN + '/api/saglik'); if (r.ok) break; } catch (x) {} await bek(100); }

  const b = await chromium.launch();
  // o.sunucu: dk-hesap46.sunucu ; o.ek: ek localStorage ; o.ssEk: ek sessionStorage
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, mod: 'normal', sunucu: SUN, ek: null, ssEk: null, dosya: F}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.route('https://accounts.google.com/gsi/client', (r) => r.fulfill({status: 200, contentType: 'text/javascript', body: SAHTE_GIS}));
    await ctx.addInitScript(([o]) => {
      if (o.ssEk && !sessionStorage.getItem('__o')) { sessionStorage.setItem('__o', '1'); for (const k in o.ssEk) sessionStorage.setItem(k, o.ssEk[k]); }
      if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1');
      if (o.mod !== 'yeni') localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true}));
      localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false}));
      if (o.sunucu !== null) localStorage.setItem('dk-hesap46', JSON.stringify({v: 1, mod: 'misafir', sunucu: o.sunucu, oturum: '', kullanici: null, surum: 0, son: '', hata: ''}));
      if (o.ek) for (const k in o.ek) localStorage.setItem(k, o.ek[k]);
    }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message));
    await p.goto(ORIGIN + '/' + o.dosya); await p.waitForTimeout(1900);
    return {p, ctx};
  };
  const D = (p) => p.evaluate(() => { const c = document.querySelector('#app .pin37-c'); return {view, edOk: V38.edOk(), adim1: !!document.querySelector('#app .yn519'), pin: !!document.querySelector('#app #ed38-in'), ed: !!document.querySelector('#app .ed38-cats, #app .ed38-cat, #app .ed38-info'), metin: c ? c.innerText.replace(/\s+/g, ' ').slice(0, 260) : '', kayit: sessionStorage.getItem('dk-yonetici519'), hesap: (JSON.parse(localStorage.getItem('dk-hesap46') || '{}')).mod}; });
  const googleIle = async (p, bel) => { await p.evaluate((bel) => { window.__belge = bel; }, bel); await p.click('#app .yn519-g'); await bek(700); await p.click('.gis-sahte'); await bek(1600); };
  const pinGir = (p, pin) => p.evaluate(async (pin) => { for (const k of pin) V38.edKey(k); await new Promise((r) => setTimeout(r, 600)); return {ok: V38.edOk(), view}; }, pin);

  /* ---------- T1. yönetici: Google + PIN ---------- */
  {
    const {p, ctx} = await sayfa({});
    await p.evaluate(() => go('editor')); await bek(900);
    const d0 = await D(p);
    await p.screenshot({path: path.join(SH, 'yonetici-adim1-google.png')});
    await googleIle(p, B_YONETICI());
    const d1 = await D(p);
    await p.screenshot({path: path.join(SH, 'yonetici-adim2-pin.png')});
    const pr = await pinGir(p, '030792'); await bek(600);
    const d2 = await D(p);
    await p.screenshot({path: path.join(SH, 'yonetici-editor-alani.png')});
    ok('T1 Yönetici girişi iki adım: önce “Google ile doğrula” (PIN tuş takımı yok), yönetici hesabıyla doğrulanınca “Adım 2/2 · Editör PIN’i” ve “Google ile doğrulandı”; PIN sonrası Editör Onay Alanı açılır',
      d0.adim1 && !d0.pin && /(Adım|ADIM) 1 \/ 2/.test(d0.metin) && !d0.edOk && d1.pin && /(Adım|ADIM) 2 \/ 2/.test(d1.metin) && /Google ile doğrulandı/.test(d1.metin) && !d1.edOk && pr.ok && d2.edOk && d2.ed, {d0: d0.metin.slice(0, 80), d1: d1.metin.slice(0, 120), d2: {edOk: d2.edOk, ed: d2.ed}});
    // T4: Google oturumu kapanınca yönetici oturumu da kapanır
    await p.evaluate(async () => { await V46.Hesap.cikis(); }); await bek(700);
    const d3 = await p.evaluate(() => ({edOk: V38.edOk(), kayit: sessionStorage.getItem('dk-yonetici519')}));
    await p.evaluate(() => go('editor')); await bek(800); const d4 = await D(p);
    ok('T4 Google hesabından çıkılınca yönetici (editör) oturumu da kapanır; editör alanı yeniden Google doğrulaması ister', !d3.edOk && d3.kayit === null && d4.adim1 && !d4.pin, {d3, d4: d4.metin.slice(0, 60)});
    await ctx.close();
  }

  /* ---------- T2. yönetici olmayan Google hesabı ---------- */
  {
    const {p, ctx} = await sayfa({});
    await p.evaluate(() => go('editor')); await bek(900);
    await googleIle(p, B_OGRENCI());
    const d1 = await D(p);
    await p.screenshot({path: path.join(SH, 'yonetici-yetkisiz-hesap.png')});
    const z = await p.evaluate(async () => { V51.EdPin.sifirlamaAc(); await new Promise((r) => setTimeout(r, 400)); return {adim1: !!document.querySelector('#app .yn519'), reset: !!document.querySelector('#app [data-ed515="reset"]')}; });
    await p.evaluate((bel) => { window.__belge = bel; }, B_YONETICI());
    await p.click('#app .pin37-b'); await bek(700); await p.click('.gis-sahte'); await bek(1600);
    const d2 = await D(p);
    ok('T2 Yönetici listesinde olmayan Google hesabı: “yönetici olarak tanımlı değil”, PIN ve PIN sıfırlama açılmaz; “Başka Google hesabıyla giriş” ile yönetici hesabına geçilince PIN adımı gelir',
      /tanımlı değil/.test(d1.metin) && !d1.pin && !d1.edOk && z.adim1 && !z.reset && d2.pin && /Google ile doğrulandı/.test(d2.metin), {d1: d1.metin.slice(0, 120), z, d2: d2.metin.slice(0, 100)});
    await ctx.close();
  }

  /* ---------- T3. yalnız PIN oturumu artık yetmez ---------- */
  {
    const {p, ctx} = await sayfa({ssEk: {'dk-editor-oturum38': '1'}});
    const d = await p.evaluate(() => ({edOk: V38.edOk()})); await p.evaluate(() => go('editor')); await bek(900); const d1 = await D(p);
    ok('T3 Eski (yalnız PIN) editör oturumu Google doğrulaması olmadan editör alanını açmaz', !d.edOk && d1.adim1 && !d1.ed, {d, d1: d1.metin.slice(0, 60)});
    await ctx.close();
  }

  /* ---------- T5. geçiş dönemi (sunucu adresi yok) ---------- */
  {
    const {p, ctx} = await sayfa({sunucu: null});
    await p.evaluate(() => go('editor')); await bek(900);
    const d0 = await D(p);
    await p.screenshot({path: path.join(SH, 'yonetici-gecis-donemi.png')});
    await p.evaluate(() => V51.Yonetici.gecisle()); await bek(500);
    const d1 = await D(p);
    const pr = await pinGir(p, '030792'); await bek(500); const d2 = await D(p);
    await p.evaluate(() => { const o = V46.Hesap.oku(); o.sunucu = 'http://127.0.0.1:9'; V46.Hesap.yaz(o); });
    const d3 = await p.evaluate(() => ({edOk: V38.edOk(), izin: V51.Yonetici.gecisIzinli()}));
    ok('T5 Geçiş dönemi: sunucu adresi girilmemiş cihazda “henüz kurulmadı” açıklaması ve “PIN ile devam et”; PIN ekranında geçiş uyarısı; sunucu adresi girildiği anda yalnız-PIN oturumu geçersizleşir',
      /henüz kurulmadı/.test(d0.metin) && /Geçiş dönemi/.test(d0.metin) && d1.pin && /Geçiş dönemi/.test(d1.metin) && pr.ok && d2.ed && !d3.edOk && !d3.izin, {d0: d0.metin.slice(0, 120), d1: d1.metin.slice(0, 120), d3});
    await ctx.close();
  }

  /* ---------- T6. bir kez Google doğrulaması yapılan cihazda geçiş kapanır ---------- */
  {
    const {p, ctx} = await sayfa({sunucu: null, ek: {'dk-yonetici519-k': JSON.stringify({v: 1, google: 1})}});
    await p.evaluate(() => go('editor')); await bek(900); const d = await D(p);
    const izin = await p.evaluate(() => V51.Yonetici.gecisIzinli());
    ok('T6 Bu cihazda daha önce Google ile yönetici doğrulaması yapıldıysa geçiş dönemi (yalnız PIN) seçeneği görünmez', !izin && d.adim1 && !/PIN ile devam et/.test(d.metin), d.metin.slice(0, 160));
    await ctx.close();
  }

  /* ---------- T7. sunucuya ulaşılamıyor ---------- */
  {
    const {p, ctx} = await sayfa({sunucu: 'http://127.0.0.1:9', ek: null});
    await p.evaluate(() => { const o = V46.Hesap.oku(); o.mod = 'google'; o.oturum = 'x'.repeat(43); V46.Hesap.yaz(o); go('editor'); }); await bek(1500);
    const d = await D(p);
    ok('T7 Sunucuya ulaşılamazsa yönetici alanı açılmaz (PIN ve geçiş seçeneği yok); “Yeniden dene” sunulur', d.adim1 && !d.pin && /ulaşılamadı/.test(d.metin) && /Yeniden dene/.test(d.metin) && !/PIN ile devam/.test(d.metin), d.metin.slice(0, 160));
    await ctx.close();
  }

  /* ---------- T8. öğrenci: Google ya da misafir ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'yeni', sunucu: null});
    const s = await p.evaluate(() => { const u = document.getElementById('uye39'); return u ? {g: !!u.querySelector('.hs46-g'), m: !!u.querySelector('.hs46-m'), y: (u.querySelector('.yn519-l') || {}).textContent} : null; });
    await p.screenshot({path: path.join(SH, 'acilis-google-misafir-yonetici.png')});
    await p.click('#uye39 .hs46-g'); await bek(700);
    const yok = await p.evaluate(() => { const b = document.querySelector('.v-ov'); return b ? b.innerText.replace(/\s+/g, ' ') : ''; });
    await p.screenshot({path: path.join(SH, 'ogrenci-google-henuz-acik-degil.png')});
    await p.evaluate(() => UI.close()); await bek(500);
    await p.click('#uye39 .hs46-m'); await bek(300); await p.click('#uye39 .uye39-b.cn'); await bek(1500);
    const m = await p.evaluate(() => ({view, uye: !!document.getElementById('uye39'), mod: V46.Hesap.oku().mod, misafir: V46.Hesap.oku().misafir}));
    ok('T8a Açılış ekranında “Google ile giriş”, “Misafir olarak devam et” ve “Yönetici girişi (Google + PIN)” var; sunucu kurulmadıysa Google düğmesi öğrenciden adres istemez, “henüz açılmadı, misafir olarak devam edebilirsin” der; misafir olarak Elmas açılır',
      s && s.g && s.m && /Yönetici girişi/.test(s.y || '') && /henüz açılmadı/.test(yok) && !/Sunucu adresi/.test(yok) && m.view === 'home' && !m.uye && m.misafir === 1, {s, yok: yok.slice(0, 140), m});
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'yeni'});
    await p.evaluate((bel) => { window.__belge = bel; }, B_OGRENCI());
    await p.click('#uye39 .hs46-g'); await bek(1200);
    const ust = await p.evaluate(() => { const o = document.querySelector('.v-ov'), u = document.getElementById('uye39'); return o && u ? +getComputedStyle(o).zIndex > +getComputedStyle(u).zIndex : false; });
    await p.click('.gis-sahte'); await bek(1800);
    const g = await p.evaluate(() => ({mod: V46.Hesap.oku().mod, ad: (V46.Hesap.oku().kullanici || {}).ad, roller: (V46.Hesap.oku().kullanici || {}).roller, edOk: V38.edOk()}));
    await p.screenshot({path: path.join(SH, 'ogrenci-google-giris-sonrasi.png')});
    if (await p.$('#uye39 .uye39-b.cn')) { await p.click('#uye39 .uye39-b.cn'); await bek(1500); }
    await p.evaluate(() => go('editor')); await bek(1500); const d = await D(p);
    ok('T8b Açılış ekranında “Google ile giriş” penceresi açılış ekranının ÜSTÜNDE görünür (V51.8 ve öncesinde arkasında kalıyordu); öğrenci Google ile giriş yapar (sunucu belgeyi doğrular); öğrenci hesabı yönetici alanını açamaz', ust && g.mod === 'google' && g.ad === 'Ayşe Öğrenci' && JSON.stringify(g.roller) === '["ogrenci"]' && !g.edOk && /tanımlı değil/.test(d.metin) && !d.pin, {ust, g, d: d.metin.slice(0, 80)});
    await ctx.close();
  }

  /* ---------- T9. giriş noktaları ---------- */
  {
    const {p, ctx} = await sayfa({});
    await p.click('header .md50'); await bek(600);
    const et = await p.evaluate(() => (document.querySelector('.ed51-giris') || {}).textContent || '');
    await p.click('.ed51-giris'); await bek(900); const d = await D(p);
    ok('T9 Mod paneli › “Yönetici / Editör girişi (Google + PIN)” yönetici girişinin 1. adımını açar', /Google \+ PIN/.test(et) && d.view === 'editor' && d.adim1, {et, d: d.metin.slice(0, 60)});
    await ctx.close();
  }

  /* ---------- T10. Elmas ve öğretmen ekranları V51.8 ile aynı ---------- */
  {
    const R = [['home', null], ['classes', null], ['grade', {g: 5}], ['topic', {t: 'TPC-5-2-01', tab: 'anlat'}], ['search', {q: 'namaz'}], ['games', null], ['calis45', null], ['profil46', null]];
    const al = async (dosya) => { const {p, ctx} = await sayfa({dosya}); const o = {}; for (const [v, a] of R) { await p.evaluate(([v, a]) => go(v, a), [v, a]); await bek(600); o[v] = await p.evaluate(() => $.innerHTML.replace(/V51\.[89]/g, 'V51.x').replace(/blob:[^"]+/g, 'blob:')); } await p.evaluate(() => { V36.ss(V36.SK, '1'); go('ogretmen'); }); await bek(900); o.ogretmen = await p.evaluate(() => $.innerHTML.replace(/V51\.[89]/g, 'V51.x').replace(/blob:[^"]+/g, 'blob:')); await ctx.close(); return o; };
    const a = await al(F0), c = await al(F), fark = Object.keys(a).filter((k) => a[k] !== c[k]);
    ok('T10 Öğrenci (Elmas) ve öğretmen ekranları V51.8 ile birebir aynı HTML’i üretir (ana sayfa, sınıflar, konu, arama, oyunlar, Çalışmam, Profilim, öğretmen paneli)', fark.length === 0, fark);
  }

  /* ---------- T11. sunucu: yönetici yetkisi sunucuda da denetlenir ---------- */
  {
    const g = async (bel) => (await (await fetch(SUN + '/api/giris', {method: 'POST', headers: {'Content-Type': 'application/json', Origin: ORIGIN}, body: JSON.stringify({credential: bel})})).json()).oturum;
    const ty = await g(B_YONETICI()), to = await g(B_OGRENCI());
    const ist = async (t) => (await fetch(SUN + '/api/bildirim?durum=yeni', {headers: {Authorization: 'Bearer ' + t, Origin: ORIGIN}})).status;
    const ben = await (await fetch(SUN + '/api/ben', {headers: {Authorization: 'Bearer ' + ty, Origin: ORIGIN}})).json();
    const sahte = await fetch(SUN + '/api/giris', {method: 'POST', headers: {'Content-Type': 'application/json', Origin: ORIGIN}, body: JSON.stringify({credential: B_YONETICI().replace(/.$/, 'A')})});
    ok('T11 Sunucu: yönetici hesabının rolü “editor”; yönetici uç noktası yöneticiye 200, öğrenciye 403; imzası bozuk belge reddedilir (401)', (ben.kullanici.roller || []).includes('editor') && await ist(ty) === 200 && await ist(to) === 403 && sahte.status === 401, {roller: ben.kullanici.roller});
  }

  /* ---------- T12. telefon görünümü ---------- */
  {
    const R = [];
    for (const [w, h] of [[360, 640], [412, 915], [768, 1024]]) {
      const {p, ctx} = await sayfa({w, h}); await p.evaluate(() => go('editor')); await bek(900);
      const m = await p.evaluate(() => { const c = document.querySelector('#app .pin37-c').getBoundingClientRect(), b = document.querySelector('#app .yn519-g').getBoundingClientRect(); return {tasma: document.documentElement.scrollWidth > innerWidth + 1, icinde: c.left >= 0 && c.right <= innerWidth + .5, dugme: b.height}; });
      if (w === 360) await p.screenshot({path: path.join(SH, 'yonetici-adim1-360.png')});
      R.push(Object.assign({w}, m)); await ctx.close();
    }
    ok('T12 Yönetici giriş ekranı 360, 412 ve 768 genişlikte taşmaz; düğme en az 44 px', R.every((r) => !r.tasma && r.icinde && r.dugme >= 44), R);
  }

  ok('T13 Bütün senaryolarda JavaScript hatası yok', HATA.length === 0, HATA.slice(0, 5));
  const gc = S.filter((x) => x.ok).length;
  console.log(`\n${gc}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen: gc, toplam: S.length, kontroller: S}, null, 1));
  await b.close(); sv.kill(); jw.close(); st.close(); fs.rmSync(dbd, {recursive: true, force: true}); process.exit(gc === S.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
