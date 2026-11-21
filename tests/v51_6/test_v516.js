// V51.6 testleri (depo kökünden): node tests/v51_6/test_v516.js
// APK içindeki sayfa benzetimi: sayfa https://appassets.androidplatform.net/assets/index.html adresinden açılır
// (Playwright yönlendirmesi), Android köprüsü (DKAndroid) sahte nesneyle taklit edilir; kimlik belgesi test RSA anahtarıyla
// imzalanır ve GERÇEK sunucu/sunucu.js (yerel JWKS) doğrular. Android'in kendi Google penceresi burada ÇALIŞTIRILAMAZ
// (emülatör yok); o kısım gerçek cihazda denenmelidir. Ayrıca APK dosyası (imza, paket, içerik) denetlenir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), os = require('os'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v51.6.html', F0 = 'surumler/din-kulturu-platformu-v51.5.html', APK = 'apk/din-kulturu-v51.6.apk';
const SH = path.join(ROOT, 'docs', 'V51.6_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 360) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const CID = 'test-istemci.apps.googleusercontent.com', ORIGIN = 'https://appassets.androidplatform.net';
const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
const jwk = Object.assign(publicKey.export({format: 'jwk'}), {kid: 'k516', alg: 'RS256', use: 'sig'});
const b64u = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const belge = (y) => { const t = Math.floor(Date.now() / 1000); const g = b64u({alg: 'RS256', kid: 'k516', typ: 'JWT'}) + '.' + b64u(Object.assign({iss: 'https://accounts.google.com', aud: CID, azp: 'android-istemci.apps.googleusercontent.com', sub: '2001', email: 'ogrenci-apk@example.com', email_verified: true, name: 'APK Öğrenci', iat: t, exp: t + 600}, y)); return g + '.' + crypto.sign('RSA-SHA256', Buffer.from(g), privateKey).toString('base64url'); };

(async () => {
  /* A. sürüm ve APK dosyası */
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  ok('A1 sürüm V51.6, index.html aynı; veri blokları V51.5 ile bayt bayt aynı; önceki sürüm dosyalarına dokunulmadı', /V31\.VER="V51\.6"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && cp.execSync('git status --porcelain surumler/ apk/din-kulturu-v36.0.apk', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v51.6')).length === 0);
  const SDK = process.env.ANDROID_SDK || '/tmp/claude-0/-home-user-Thrclvr/d5acdd0b-a03d-5076-9d0c-10c2bdb531c9/scratchpad/android-sdk';
  if (fs.existsSync(path.join(ROOT, APK)) && fs.existsSync(SDK)) {
    const bt = path.join(SDK, 'build-tools', '35.0.0');
    const imza = cp.execSync(`"${bt}/apksigner" verify --print-certs "${path.join(ROOT, APK)}" 2>/dev/null`).toString();
    const badge = cp.execSync(`"${bt}/aapt2" dump badging "${path.join(ROOT, APK)}" 2>/dev/null`).toString();
    const ic = cp.execSync(`unzip -p "${path.join(ROOT, APK)}" assets/index.html | sha256sum`).toString().split(' ')[0], dis = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, F))).digest('hex');
    const dex = cp.execSync(`unzip -p "${path.join(ROOT, APK)}" classes.dex | strings | grep -c -E "GetSignInWithGoogleOption|GoogleIdTokenCredential" || true`).toString().trim();
    ok('A2 APK: V36 ile aynı imza sertifikası (SHA-256 48226315…), paket tr.dkab.platform, sürüm 51.6 (5106), yalnız INTERNET izni', /SHA-256 digest: 48226315954bf037baac87386ab608850cdf0c952ddbeeeac98c87830684a6ea/.test(imza) && /name='tr\.dkab\.platform' versionCode='5106' versionName='51\.6'/.test(badge) && (badge.match(/uses-permission/g) || []).length === 1, (imza.match(/SHA-1 digest: \S+/) || [''])[0]);
    ok('A3 APK içindeki assets/index.html, V51.6 dosyasıyla birebir aynı; Google oturum açma (Credential Manager) kodu APK’da', ic === dis && +dex >= 1, {ic: ic.slice(0, 12), dex});
  } else ok('A2 APK dosyası veya Android SDK yok — APK denetimi yapılamadı', false);

  /* B. sunucu (yerel JWKS) */
  const js = http.createServer((q, r) => { r.writeHead(200, {'Content-Type': 'application/json'}); r.end(JSON.stringify({keys: [jwk]})); }).listen(0);
  await new Promise((r) => js.once('listening', r));
  const port = 19700 + Math.floor(Math.random() * 200), dbd = fs.mkdtempSync(path.join(os.tmpdir(), 'dkab516-'));
  const sv = cp.spawn(process.execPath, [path.join(ROOT, 'sunucu', 'sunucu.js')], {env: Object.assign({}, process.env, {PORT: port, GOOGLE_CLIENT_ID: CID, IZINLI_KOKENLER: 'https://thrclvr1.github.io,' + ORIGIN, VERITABANI: path.join(dbd, 'v.sqlite'), GOOGLE_JWKS_URL: 'http://127.0.0.1:' + js.address().port + '/', NODE_NO_WARNINGS: '1'}), stdio: ['ignore', 'pipe', 'pipe']});
  await new Promise((r) => sv.stdout.on('data', (d) => { if (/sunucusu/.test(d)) r(); }));
  const U = 'http://127.0.0.1:' + port, SUN = 'https://dkab-sunucu.example'; // telefondaki gibi HTTPS sunucu adresi; istekler yerel gerçek sunucuya aktarılır
  const b = await chromium.launch();
  const html = fs.readFileSync(path.join(ROOT, F));
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, kopru: 'ok', sunucu: SUN}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.route(ORIGIN + '/assets/index.html', (r) => r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: html}));
    await ctx.route(SUN + '/**', async (r) => { const q = r.request(); try { const x = await fetch(q.url().replace(SUN, U), {method: q.method(), headers: Object.assign({}, q.headers(), {origin: ORIGIN}), body: q.postData() || undefined}); const h = {}; x.headers.forEach((v, k) => { h[k] = v; }); await r.fulfill({status: x.status, headers: h, body: Buffer.from(await x.arrayBuffer())}); } catch (e) { await r.abort(); } });
    await ctx.addInitScript(([o]) => {
      if (!localStorage.getItem('__s')) { localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); if (o.sunucu) localStorage.setItem('dk-hesap46', JSON.stringify({v: 1, mod: 'misafir', sunucu: o.sunucu, oturum: '', kullanici: null, surum: 0, son: '', hata: ''})); localStorage.setItem('dk2', JSON.stringify({patch: {}, added: {}, prog: {'DKAB-5-U01-O01': {correct: 2, wrong: 1, mastery: 0.6}}, cards: {}, wrong: {}})); }
      if (!o.kopru) return;
      // Android WebMessageListener köprüsünün taklidi: postMessage → (yerel pencere) → message olayı
      const dinleyici = []; window.__giden = [];
      window.DKAndroid = {postMessage(m) { window.__giden.push(m); const x = JSON.parse(m); if (x.tur !== 'google') return; setTimeout(() => { const y = window.__yanit ? window.__yanit(x) : {tur: 'google', ok: false, hata: 'iptal'}; dinleyici.forEach((f) => f({data: JSON.stringify(y)})); }, 50); }, addEventListener(t, f) { if (t === 'message') dinleyici.push(f); }};
    }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message));
    await p.goto(ORIGIN + '/assets/index.html'); await p.waitForTimeout(1500);
    return {p, ctx};
  };
  try {
    /* C. APK benzetimi: Google ile giriş yerel pencereyle */
    {
      const {p, ctx} = await sayfa();
      await p.exposeFunction('__belge', () => belge());
      await p.evaluate(() => { window.__yanit = () => ({tur: 'google', ok: true, idToken: window.__hazirBelge}); });
      await p.evaluate(async () => { window.__hazirBelge = await window.__belge(); });
      const r0 = await p.evaluate(() => ({mi: V51.Android.mi(), gis: !!document.querySelector('script[src*="accounts.google.com/gsi"]')}));
      await p.evaluate(async () => { go('profil46'); await new Promise((r) => setTimeout(r, 400)); V46.Hesap.googleGiris(); await new Promise((r) => setTimeout(r, 400)); });
      const pencere = await p.evaluate(() => ({t: (document.querySelector('.v-sheet') || {}).innerText || '', dugme: !!document.querySelector('.an516-g'), gis: !!document.getElementById('gis46')}));
      await p.screenshot({path: path.join(SH, 'apk-google-giris-penceresi.png')});
      await p.evaluate(async () => { document.querySelector('.an516-g').click(); await new Promise((r) => setTimeout(r, 2500)); });
      const r = await p.evaluate(() => ({h: V46.Hesap.oku(), giden: window.__giden.map((m) => JSON.parse(m)), view, gis: !!document.querySelector('script[src*="accounts.google.com/gsi"]')}));
      await p.screenshot({path: path.join(SH, 'apk-google-giris-sonrasi.png')});
      ok('C1 APK içinde (appassets.androidplatform.net + DKAndroid köprüsü) Google girişi Android’in kendi penceresine yönlenir; Google’ın web betiği (GIS) yüklenmez', r0.mi && pencere.dugme && !pencere.gis && !r.gis && r.giden.some((m) => m.tur === 'google' && m.istemci === CID), {pencere: pencere.t.slice(0, 120), giden: r.giden});
      ok('C2 Yerel pencereden gelen kimlik belgesi gerçek sunucuda doğrulanır: oturum açılır (mod google, kullanıcı adı) ve ilerleme eşitlenir', r.h.mod === 'google' && r.h.oturum && r.h.kullanici && r.h.kullanici.ad === 'APK Öğrenci' && r.h.surum >= 1 && !r.h.hata, {mod: r.h.mod, ad: r.h.kullanici && r.h.kullanici.ad, surum: r.h.surum, hata: r.h.hata});
      const sv2 = await fetch(U + '/api/veri', {headers: {Authorization: 'Bearer ' + r.h.oturum, Origin: ORIGIN}}).then((x) => x.json());
      ok('C3 Sunucudaki bulut kaydı telefondaki ilerlemeyi içerir (dk2.prog)', sv2.veri && sv2.veri.dk2 && sv2.veri.dk2.prog && sv2.veri.dk2.prog['DKAB-5-U01-O01'] && sv2.veri.dk2.prog['DKAB-5-U01-O01'].correct === 2, sv2.surum);
      await p.evaluate(async () => { await V46.Hesap.cikis(false); await new Promise((r) => setTimeout(r, 400)); });
      const c = await p.evaluate(() => ({h: V46.Hesap.oku().mod, giden: window.__giden.map((m) => JSON.parse(m).tur)}));
      ok('C4 Çıkışta oturum kapanır ve Android’e “google-cikis” iletilir (bir sonraki girişte hesap yeniden seçilir)', c.h === 'misafir' && c.giden.includes('google-cikis'), c);
      await ctx.close();
    }
    {
      // iptal, sahte/yanlış kitleli belge, sunucuya ulaşılamaması, sunucu adresi yok
      const {p, ctx} = await sayfa();
      const iptal = await p.evaluate(async () => { window.__yanit = () => ({tur: 'google', ok: false, hata: 'iptal'}); V46.Hesap.googleGiris(); await new Promise((r) => setTimeout(r, 300)); document.querySelector('.an516-g').click(); await new Promise((r) => setTimeout(r, 800)); return {m: document.getElementById('gis46d').textContent, mod: V46.Hesap.oku().mod, dugme: !document.querySelector('.an516-g').disabled}; });
      ok('C5 Kullanıcı Google penceresini kapatırsa “Giriş iptal edildi” yazar; giriş yapıldı denmez; yeniden denenebilir', /iptal edildi/.test(iptal.m) && iptal.mod === 'misafir' && iptal.dugme, iptal);
      await p.exposeFunction('__yanlisBelge', () => belge({aud: 'baska-istemci.apps.googleusercontent.com'}));
      const yanlis = await p.evaluate(async () => { const t = await window.__yanlisBelge(); window.__yanit = () => ({tur: 'google', ok: true, idToken: t}); document.querySelector('.an516-g').click(); await new Promise((r) => setTimeout(r, 1500)); return {m: document.getElementById('gis46d').textContent, mod: V46.Hesap.oku().mod}; });
      ok('C6 Başka bir uygulamaya verilmiş (aud yanlış) belge sunucuda reddedilir; giriş yapılmaz', /doğrulanamadı|aud/i.test(yanlis.m) && yanlis.mod === 'misafir', yanlis);
      const ulasilamaz = await p.evaluate(async () => { const o = V46.Hesap.oku(); o.sunucu = 'http://127.0.0.1:1'; V46.Hesap.yaz(o); document.querySelector('.an516-g').click(); await new Promise((r) => setTimeout(r, 1500)); return {m: document.getElementById('gis46d').textContent, mod: V46.Hesap.oku().mod}; });
      ok('C7 Sunucuya ulaşılamazsa açıkça yazar, giriş yapılmaz', /ulaşılamadı/.test(ulasilamaz.m) && ulasilamaz.mod === 'misafir', ulasilamaz);
      const adresYok = await p.evaluate(async () => { UI.close(); await new Promise((r) => setTimeout(r, 300)); const o = V46.Hesap.oku(); o.sunucu = ''; V46.Hesap.yaz(o); V46.Hesap.googleGiris(); await new Promise((r) => setTimeout(r, 400)); return (document.querySelector('.v-sheet') || {}).innerText || ''; });
      ok('C8 Sunucu adresi yoksa önce sunucu adresi istenir (giriş denemesi yapılmaz)', /sunucu adresini gir/i.test(adresYok), adresYok.slice(0, 120));
      await ctx.close();
    }
    {
      // tarayıcıda (köprü yok) eski akış değişmedi
      const {p, ctx} = await sayfa({kopru: null});
      const r = await p.evaluate(async () => { const mi = V51.Android.mi(); V46.Hesap.googleGiris(); await new Promise((r) => setTimeout(r, 600)); return {mi, gis: !!document.getElementById('gis46'), an: !!document.querySelector('.an516-g')}; });
      ok('C9 Tarayıcıda (Android köprüsü yokken) eski Google akışı aynen kalır (GIS düğmesi alanı)', !r.mi && r.gis && !r.an, r);
      await ctx.close();
    }
  } finally { sv.kill(); js.close(); }
  ok('Z Sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close();
  const g = S.filter((x) => x.ok).length;
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify(S, null, 1));
  console.log(`\n${g}/${S.length} kontrol geçti`);
  if (g !== S.length) { console.log('KALDI: ' + S.filter((x) => !x.ok).map((x) => x.ad).join(' | ')); process.exitCode = 1; }
})().catch((e) => { console.error(e); process.exit(1); });
