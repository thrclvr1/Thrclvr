// V52.0 testleri (depo kökünden): node tests/v52/test_v520.js
// Sunucusuz Google girişi: kimlik belgesi UYGULAMADA doğrulanır. Google'ın anahtar adresi (googleapis.com/oauth2/v3/certs) ve
// Google penceresi (accounts.google.com/gsi/client) Playwright ile taklit edilir; belgeler test RSA anahtarıyla imzalanır.
// APK benzetimi: sayfa https://appassets.androidplatform.net/assets/index.html adresinden açılır, Android köprüsü (DKAndroid) sahte.
// Gerçek Google hesabıyla giriş burada DENENEMEZ (gerçek istemci kimliği yok). Ekran görüntüleri: docs/V52.0_ekran/.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v52.0.html', F0 = 'surumler/din-kulturu-platformu-v51.9.html';
const SH = path.join(ROOT, 'docs', 'V52.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const CID = '123456789012-testistemci.apps.googleusercontent.com', APK = 'https://appassets.androidplatform.net';
const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
const sahteAnahtar = crypto.generateKeyPairSync('rsa', {modulusLength: 2048}).privateKey;
const jwk = Object.assign(publicKey.export({format: 'jwk'}), {kid: 'k520', alg: 'RS256', use: 'sig'});
const b64u = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const belge = (y, anahtar) => { const t = Math.floor(Date.now() / 1000); const g = b64u({alg: 'RS256', kid: 'k520', typ: 'JWT'}) + '.' + b64u(Object.assign({iss: 'https://accounts.google.com', aud: CID, sub: '1110001', email: 'ogrenci@example.com', email_verified: true, name: 'Ayşe Öğrenci', iat: t, exp: t + 600}, y)); return g + '.' + crypto.sign('RSA-SHA256', Buffer.from(g), anahtar || privateKey).toString('base64url'); };
const YON = {sub: '9990009', email: 'yonetici@example.com', name: 'Platform Yöneticisi'};
const SAHTE_GIS = `window.google={accounts:{id:{initialize(c){window.__gis=c},renderButton(el){const b=document.createElement('button');b.type='button';b.className='gis-sahte';b.textContent='Google ile oturum aç (test)';b.onclick=()=>window.__gis.callback({credential:window.__belge});el.appendChild(b)},disableAutoSelect(){},prompt(){}}}};`;

(async () => {
  /* ---------- A. derleme ---------- */
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v52.0'));
  ok('A1 sürüm V52.0, index.html aynı; veri/müzik/görsel blokları V51.9 ile bayt bayt aynı; önceki sürüm dosyaları ve APK’lar değişmedi', /V31\.VER="V52\.0"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && degisen.length === 0, degisen);
  const js = fs.readFileSync(path.join(ROOT, 'tools/v52/v520_google.js'), 'utf8');
  ok('A2 HTML’de Gmail/yönetici e-postası, açık PIN, client secret yok; istemci kimliği derlemede boş (uygulama içinden girilir)', !/[A-Za-z0-9._%+-]+@gmail\.com/.test(h1) && !h1.includes('030792') && !/client_secret/i.test(h1) && /ISTEMCI: '',/.test(js));

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const html = fs.readFileSync(path.join(ROOT, F));
  const b = await chromium.launch();
  let jwksSay = 0;
  // o.istemci: dk-google52'ye yazılır (null: girilmemiş) ; o.apk: APK benzetimi
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, mod: 'normal', istemci: CID, apk: false, ek: null, dosya: F}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.route('https://accounts.google.com/gsi/client', (r) => r.fulfill({status: 200, contentType: 'text/javascript', body: SAHTE_GIS}));
    await ctx.route('https://www.googleapis.com/oauth2/v3/certs', (r) => { jwksSay++; r.fulfill({status: 200, contentType: 'application/json', headers: {'access-control-allow-origin': '*'}, body: JSON.stringify({keys: [jwk]})}); });
    if (o.apk) await ctx.route(APK + '/assets/index.html', (r) => r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: html}));
    await ctx.addInitScript(([o]) => {
      if (!localStorage.getItem('__s')) {
        localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1');
        if (o.mod !== 'yeni') localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true}));
        localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false}));
        if (o.istemci) localStorage.setItem('dk-google52', JSON.stringify({v: 1, istemci: o.istemci}));
        if (o.ek) for (const k in o.ek) localStorage.setItem(k, o.ek[k]);
      }
      if (!o.apk) return;
      const dinleyici = []; window.__giden = [];
      window.DKAndroid = {postMessage(m) { window.__giden.push(m); const x = JSON.parse(m); if (x.tur !== 'google') return; setTimeout(() => { const y = window.__belge ? {tur: 'google', ok: true, idToken: window.__belge} : {tur: 'google', ok: false, hata: 'iptal'}; dinleyici.forEach((f) => f({data: JSON.stringify(y)})); }, 50); }, addEventListener(t, f) { if (t === 'message') dinleyici.push(f); }};
    }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message));
    await p.goto(o.apk ? APK + '/assets/index.html' : ORIGIN + '/' + o.dosya); await p.waitForTimeout(1900);
    return {p, ctx};
  };
  const D = (p) => p.evaluate(() => { const c = document.querySelector('#app .pin37-c'); const o = V46.Hesap.oku(); return {view, edOk: V38.edOk(), adim1: !!document.querySelector('#app .yn519'), pin: !!document.querySelector('#app #ed38-in'), ed: !!document.querySelector('#app .ed38-cats, #app .ed38-cat, #app .ed38-info'), metin: c ? c.innerText.replace(/\s+/g, ' ').slice(0, 900) : '', mod: o.mod, yerel: o.yerel, ad: (o.kullanici || {}).ad}; });
  const pencereGiris = async (p, bel, sec) => { await p.evaluate((bel) => { window.__belge = bel; }, bel); await p.click(sec); await bek(800); const g = await p.$('.gis-sahte'); if (g) { await g.click(); } else { await p.click('.an516-g'); } await bek(1500); };
  const pinGir = (p, pin) => p.evaluate(async (pin) => { for (const k of pin) V38.edKey(k); await new Promise((r) => setTimeout(r, 700)); return {ok: V38.edOk(), view}; }, pin);

  /* ---------- T1. istemci kimliği yok ---------- */
  {
    const {p, ctx} = await sayfa({istemci: null});
    await p.evaluate(() => go('editor')); await bek(900);
    const d = await D(p);
    await p.screenshot({path: path.join(SH, 'kurulum-yok-yonetici.png')});
    await p.evaluate(() => go('profil46')); await bek(700);
    const kart = await p.evaluate(() => (document.querySelector('.h46-hesap') || {}).innerText || '');
    ok('T1 İstemci kimliği girilmemişken: yönetici ekranı “Google girişi henüz kurulmadı” + “Google istemci kimliğini gir” + geçiş dönemi; Profilim’de “Google girişi kurulumu”', /henüz kurulmadı/.test(d.metin) && /istemci kimliğini gir/i.test(d.metin) && /Geçiş dönemi/.test(d.metin) && /Google girişi kurulumu/.test(kart), {d: d.metin.slice(0, 160), kart: kart.slice(-200)});
    // istemci kimliğini uygulama içinden gir
    await p.evaluate(() => V52.Google.ayar()); await bek(700);
    await p.fill('#g52i', 'yanlis-kimlik'); await p.click('.g52-ayar .p'); await bek(300);
    const hata = await p.evaluate(() => (document.getElementById('g52d') || {}).textContent);
    await p.screenshot({path: path.join(SH, 'istemci-kimligi-girisi.png')});
    await p.fill('#g52i', CID); await p.click('.g52-ayar .p'); await bek(900);
    const r = await p.evaluate(() => ({ist: V52.Google.istemci(), yerel: V52.Google.yerelMi(), gecis: V51.Yonetici.gecisIzinli()}));
    ok('T1b İstemci kimliği uygulama içinden girilir: yanlış biçim reddedilir; doğru kimlikle sunucusuz Google girişi etkinleşir ve yalnız-PIN geçiş dönemi kapanır', /googleusercontent/.test(hata || '') && r.ist === CID && r.yerel && !r.gecis, {hata, r});
    await ctx.close();
  }

  /* ---------- T2. öğrenci: tarayıcıda Google ile giriş (uygulamada doğrulama) ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'yeni'});
    await pencereGiris(p, belge({}), '#uye39 .hs46-g');
    const d = await D(p);
    const depo = await p.evaluate(() => localStorage.getItem('dk-hesap46'));
    if (await p.$('#uye39 .uye39-b.cn')) { await p.click('#uye39 .uye39-b.cn'); await bek(1400); }
    await p.evaluate(() => go('profil46')); await bek(700);
    const kart = await p.evaluate(() => (document.querySelector('.h46-hesap') || {}).innerText || '');
    await p.screenshot({path: path.join(SH, 'ogrenci-google-giris-profilim.png')});
    ok('T2 Öğrenci açılış ekranından Google ile girer: belge uygulamada doğrulanır (sunucu yok), hesap bu cihazda kaydedilir; Profilim “Google ile giriş yapıldı (bu cihaz)”; Google kimliği yalnız özet olarak saklanır', d.mod === 'google' && d.yerel === 1 && d.ad === 'Ayşe Öğrenci' && /bu cihaz/.test(kart) && /Ayşe Öğrenci/.test(kart) && !depo.includes('1110001') && jwksSay > 0, {d, kart: kart.slice(0, 160)});
    await ctx.close();
  }

  /* ---------- T3. sahte / yanlış belgeler reddedilir ---------- */
  {
    const {p, ctx} = await sayfa({});
    const r = await p.evaluate(async (B) => { const o = {}; for (const [k, bel] of Object.entries(B)) { try { await V46.Hesap.girisBelgesi(bel); o[k] = 'KABUL'; } catch (e) { o[k] = e.message; } } o.mod = V46.Hesap.oku().mod; return o; },
      {imza: belge({}, sahteAnahtar), aud: belge({aud: '999999999999-baska.apps.googleusercontent.com'}), sure: belge({exp: Math.floor(Date.now() / 1000) - 3600}), iss: belge({iss: 'https://kotu.example'}), eposta: belge({email_verified: false}), bozuk: 'abc.def'});
    ok('T3 Sahte imza, başka uygulamanın belgesi (aud), süresi dolmuş belge, Google dışı yayıncı, doğrulanmamış e-posta ve bozuk belge reddedilir; hiçbiri giriş yaptırmaz', Object.entries(r).filter(([k]) => k !== 'mod').every(([, v]) => v !== 'KABUL') && r.mod !== 'google', r);
    await ctx.close();
  }

  /* ---------- T4. yönetici: ilk kez Google → PIN ile yönetici yap → editör ---------- */
  {
    const {p, ctx} = await sayfa({});
    await p.evaluate(() => go('editor')); await bek(900);
    const d0 = await D(p);
    await pencereGiris(p, belge(YON), '#app .yn519-g');
    const d1 = await D(p);
    await p.screenshot({path: path.join(SH, 'yonetici-ilk-kayit.png')});
    await p.click('#app .pin37-b'); await bek(600);
    const d2 = await D(p);
    await p.screenshot({path: path.join(SH, 'yonetici-kayit-pin.png')});
    const yanlis = await pinGir(p, '111111'); await bek(300);
    const kayit0 = await p.evaluate(() => localStorage.getItem('dk-yonetici52'));
    await p.evaluate(() => { V38.EP.pv.buf = ''; }); const pr = await pinGir(p, '030792'); await bek(600);
    const d3 = await D(p), kayit = await p.evaluate(() => localStorage.getItem('dk-yonetici52'));
    await p.screenshot({path: path.join(SH, 'yonetici-editor-alani.png')});
    ok('T4 Yönetici ilk kez: Google ile giriş → “bu cihazda yönetici olarak kayıtlı değil” → “Bu hesabı yönetici yap (PIN ile)” → yanlış PIN kaydetmez → doğru PIN ile hesap yönetici olur ve Editör Onay Alanı açılır; kayıtta e-posta/Google kimliği yok, yalnız özet',
      d0.adim1 && /Google ile doğrula/.test(d0.metin) && /kayıtlı değil/.test(d1.metin) && d2.pin && /yönetici yapmak için/.test(d2.metin) && !yanlis.ok && kayit0 === null && pr.ok && d3.ed && kayit && !kayit.includes('example.com') && !kayit.includes('9990009') && /"o":"[0-9a-f]{64}"/.test(kayit),
      {d1: d1.metin.slice(0, 120), d2: d2.metin.slice(0, 120), kayit: (kayit || '').slice(0, 120)});
    // T5: editörden çıkıp yeniden gir → Google oturumu sürüyor → doğrudan PIN (adım 2)
    await p.evaluate(() => V38.edLogout()); await bek(500);
    await p.evaluate(() => go('editor')); await bek(1200);
    const d4 = await D(p);
    const pr2 = await pinGir(p, '030792'); await bek(500);
    ok('T5 Kayıtlı yönetici hesabı: editörden çıkıp yeniden girince Google oturumu sürdüğü için doğrudan “Adım 2/2 · Editör PIN’i” gelir ve PIN ile açılır', d4.pin && /Google ile doğrulandı/.test(d4.metin) && pr2.ok, d4.metin.slice(0, 120));
    // T6: başka Google hesabı → yönetici değil; Google'dan çıkınca yönetici oturumu kapanır
    await p.evaluate(async () => { await V46.Hesap.cikis(); }); await bek(600);
    const kap = await p.evaluate(() => V38.edOk());
    await p.evaluate(() => go('editor')); await bek(900);
    await pencereGiris(p, belge({sub: '5550005', email: 'baska@example.com', name: 'Başka Kişi'}), '#app .yn519-g');
    const d5 = await D(p);
    ok('T6 Google hesabından çıkınca yönetici oturumu kapanır; kayıtlı olmayan başka bir Google hesabı yönetici alanını açamaz (yalnız PIN ile onaylayarak kaydedilebilir)', !kap && /kayıtlı değil/.test(d5.metin) && !d5.pin && !d5.edOk, d5.metin.slice(0, 120));
    await ctx.close();
  }

  /* ---------- T7. APK benzetimi: Android köprüsüyle Google ---------- */
  {
    const {p, ctx} = await sayfa({apk: true});
    const mi = await p.evaluate(() => V51.Android.mi());
    await p.evaluate(() => go('profil46')); await bek(700);
    await p.evaluate((bel) => { window.__belge = bel; }, belge({}));
    await p.evaluate(() => V46.Hesap.googleGiris()); await bek(700);
    const pencere = await p.evaluate(() => ({dugme: !!document.querySelector('.an516-g'), gis: !!document.querySelector('script[src*="gsi/client"]')}));
    await p.click('.an516-g'); await bek(1500);
    const d = await D(p), giden = await p.evaluate(() => window.__giden.map((m) => JSON.parse(m)));
    await p.screenshot({path: path.join(SH, 'apk-google-giris.png')});
    // yönetici APK'da
    await p.evaluate(async () => { await V46.Hesap.cikis(); }); await bek(500);
    await p.evaluate((bel) => { window.__belge = bel; go('editor'); }, belge(YON)); await bek(900);
    await p.click('#app .yn519-g'); await bek(700); await p.click('.an516-g'); await bek(1500);
    const d2 = await D(p);
    await p.click('#app .pin37-b'); await bek(500); const pr = await pinGir(p, '030792'); await bek(500);
    const d3 = await D(p);
    ok('T7 APK benzetimi: Google girişi Android’in kendi hesap seçicisine (köprü) gider, istemci kimliğiyle; belge uygulamada doğrulanır; öğrenci girişi ve yönetici kaydı + PIN APK’da da çalışır',
      mi && pencere.dugme && !pencere.gis && giden.some((m) => m.tur === 'google' && m.istemci === CID) && d.mod === 'google' && d.yerel === 1 && /kayıtlı değil/.test(d2.metin) && pr.ok && d3.ed, {mi, pencere, d: {mod: d.mod, ad: d.ad}, d2: d2.metin.slice(0, 80)});
    await ctx.close();
  }

  /* ---------- T8. öğrenci/öğretmen ekranları V51.9 ile aynı ---------- */
  {
    const R = [['home', null], ['classes', null], ['grade', {g: 5}], ['topic', {t: 'TPC-5-2-01', tab: 'anlat'}], ['search', {q: 'namaz'}], ['games', null], ['calis45', null]];
    const al = async (dosya) => { const {p, ctx} = await sayfa({dosya, istemci: null}); const o = {}; for (const [v, a] of R) { await p.evaluate(([v, a]) => go(v, a), [v, a]); await bek(600); o[v] = await p.evaluate(() => $.innerHTML.replace(/V5[12]\.[0-9]/g, 'V5x').replace(/blob:[^"]+/g, 'blob:')); } await p.evaluate(() => { V36.ss(V36.SK, '1'); go('ogretmen'); }); await bek(900); o.ogretmen = await p.evaluate(() => $.innerHTML.replace(/V5[12]\.[0-9]/g, 'V5x').replace(/blob:[^"]+/g, 'blob:')); await ctx.close(); return o; };
    const a = await al(F0), c = await al(F), fark = Object.keys(a).filter((k) => a[k] !== c[k]);
    ok('T8 Öğrenci (Elmas) ve öğretmen ekranları V51.9 ile birebir aynı (ana sayfa, sınıflar, konu, arama, oyunlar, Çalışmam, öğretmen paneli)', fark.length === 0, fark);
  }

  ok('T9 Bütün senaryolarda JavaScript hatası yok', HATA.length === 0, HATA.slice(0, 5));
  const gc = S.filter((x) => x.ok).length;
  console.log(`\n${gc}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen: gc, toplam: S.length, kontroller: S}, null, 1));
  await b.close(); st.close(); process.exit(gc === S.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
