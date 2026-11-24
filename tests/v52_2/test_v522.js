// V52.2 testleri (depo kökünden): node tests/v52_2/test_v522.js
// APK benzetimi (appassets kökeni + sahte DKAndroid). Sahte köprü: 'hesap-sec' → window.__eposta; 'yedek-yaz'/'yedek-oku' →
// Node tarafında tutulan tek “dosya” (uygulamanın files/dkab-yedek.json'u yerine; bağlamlar arasında kalır = yeniden kurulum benzetimi).
// Gerçek yönetici adresi testte YOK: yönetici özeti çalışırken deneme adresinin özetiyle değiştirilir (gömülü özetin biçimi ayrıca denetlenir).
// Android'in gerçek otomatik yedeği (Google hesabına yükleme/geri yükleme) burada DENENEMEZ. Ekran görüntüleri: docs/V52.2_ekran/.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v52.2.html', F0 = 'surumler/din-kulturu-platformu-v52.1.html';
const SH = path.join(ROOT, 'docs', 'V52.2_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const APK = 'https://appassets.androidplatform.net';
const YON = 'yonetici.deneme@example.com', OGR = 'ogrenci.deneme@example.com';
const OZ = (e) => crypto.createHash('sha256').update('dkab521|' + e.trim().toLowerCase()).digest('hex');
let DOSYA = null, YAZ = 0;

(async () => {
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v52.2'));
  ok('A1 sürüm V52.2, index.html aynı; veri/müzik/görsel blokları V52.1 ile bayt bayt aynı; önceki sürüm dosyaları ve APK’lar değişmedi', /V31\.VER="V52\.2"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && degisen.length === 0, degisen);
  const js = fs.readFileSync(path.join(ROOT, 'tools/v52_2/v522_tek.js'), 'utf8');
  const gom = (js.match(/YONETICI: \[([^\]]*)\]/) || [])[1] || '';
  const java = fs.readFileSync(path.join(ROOT, 'android/app/src/main/java/tr/dkab/platform/MainActivity.java'), 'utf8');
  const man = fs.readFileSync(path.join(ROOT, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
  const kur = fs.readFileSync(path.join(ROOT, 'android/app/src/main/res/xml/yedek_kurallari.xml'), 'utf8');
  ok('A2 HTML’de e-posta adresi ve açık PIN yok; yönetici yalnız tek bir 64 haneli özetle gömülü; Android: yedek dosyası köprüsü + yalnız bu dosyayı içeren otomatik yedek kuralları',
    !/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/.test(js) && !/@gmail\.com/.test(h1) && !h1.includes('030792') && /^'[0-9a-f]{64}'$/.test(gom.trim()) &&
    /"yedek-yaz"\.equals\(tur\)/.test(java) && /BackupManager\(this\)\.dataChanged\(\)/.test(java) && /dataExtractionRules="@xml\/yedek_kurallari"/.test(man) && /fullBackupContent="@xml\/yedek_kurallari_eski"/.test(man) && /<cloud-backup>\s*<include domain="file" path="dkab-yedek\.json"/.test(kur), gom.slice(0, 20));

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const b = await chromium.launch();
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, mod: 'normal', apk: true, dosya: F, yon: true}, o || {});
    const html = fs.readFileSync(path.join(ROOT, o.dosya));
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.route('https://accounts.google.com/**', (r) => r.abort());
    await ctx.route('https://www.googleapis.com/**', (r) => r.abort());
    await ctx.exposeFunction('__dosyaYaz', (v) => { DOSYA = v; YAZ++; return true; });
    await ctx.exposeFunction('__dosyaOku', () => DOSYA);
    if (o.apk) await ctx.route(APK + '/assets/index.html', (r) => r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: html}));
    await ctx.addInitScript(([o, oz]) => {
      if (!localStorage.getItem('__s')) {
        localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1');
        if (o.mod !== 'yeni') localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true}));
        localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false}));
      }
      if (o.yon) { let t = 0; const iv = setInterval(() => { if (window.V52 && V52.Tek) { V52.Tek.YONETICI = [oz]; V52.Tek.gizle(); clearInterval(iv); } if (++t > 400) clearInterval(iv); }, 5); }
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
    await p.goto(o.apk ? APK + '/assets/index.html' : ORIGIN + '/' + o.dosya); await p.waitForTimeout(2200);
    return {p, ctx};
  };
  const D = (p) => p.evaluate(() => { const c = document.querySelector('#app .pin37-c'); const o = V46.Hesap.oku(); return {view, edOk: V38.edOk(), adim1: !!document.querySelector('#app .yn519'), pin: !!document.querySelector('#app #ed38-in'), ed: !!document.querySelector('#app .ed38-cats, #app .ed38-cat, #app .ed38-info'), mode: V38.EP.pv.mode, metin: c ? c.innerText.replace(/\s+/g, ' ').slice(0, 900) : '', mod: o.mod, ad: (o.kullanici || {}).ad, gizli: document.documentElement.hasAttribute('data-yon522')}; });
  const pin = (p, s) => p.evaluate(async (s) => { for (const k of s) V38.edKey(k); await new Promise((r) => setTimeout(r, 600)); return {ok: V38.edOk(), mode: V38.EP.pv.mode, msg: (document.getElementById('ed38-msg') || {}).textContent || ''}; }, s);
  const giris = async (p, e) => { await p.evaluate((e) => { window.__eposta = e; V46.Hesap.googleGiris(); }, e); await bek(1200); };
  const modPaneli = async (p) => { await p.evaluate(() => V50.Mod.ac()); await bek(600); const r = await p.evaluate(() => { const b = document.querySelector('.ed51-giris'); return !!b && getComputedStyle(b).display !== 'none'; }); await p.evaluate(() => UI.close()); await bek(400); return r; };

  /* ---------- Y1–Y2: yönetici düğmeleri yalnız yöneticiye ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'yeni'});
    const acilis = await p.evaluate(() => { const l = document.querySelector('#uye39 .yn519-l'); return !!l && getComputedStyle(l).display !== 'none'; });
    await p.screenshot({path: path.join(SH, 'acilis-yonetici-dugmesi-yok.png')});
    if (await p.$('#uye39 .uye39-b.cn')) { await p.click('#uye39 .uye39-b.cn'); await bek(1200); }
    const m0 = await modPaneli(p);
    await giris(p, OGR);
    const m1 = await modPaneli(p);
    await p.evaluate(() => go('editor')); await bek(1000);
    const d = await D(p);
    await p.screenshot({path: path.join(SH, 'ogrenci-yonetici-degil.png')});
    ok('Y1 Girişsizken ve öğrenci hesabıyla: açılış ekranında ve Mod panelinde “Yönetici girişi” düğmesi görünmez', !acilis && !m0 && !m1 && d.gizli, {acilis, m0, m1});
    ok('Y2 Öğrenci hesabı yönetici alanına doğrudan gitse de “yönetici değil” görür; şifre ekranı ve “Bu hesabı yönetici yap” yok', /tanımlı değil/.test(d.metin) && /tek bir yönetici/.test(d.metin) && !d.pin && !d.edOk && !/yönetici yap/i.test(d.metin), d.metin.slice(0, 220));
    await ctx.close();
  }
  /* ---------- Y3–Y6: yönetici kendi şifresini belirler ---------- */
  {
    DOSYA = null;
    const {p, ctx} = await sayfa({});
    await giris(p, YON);
    const gor = await modPaneli(p);
    await p.evaluate(() => go('editor')); await bek(1200);
    const d0 = await D(p);
    await p.screenshot({path: path.join(SH, 'yonetici-sifre-belirle.png')});
    const ilk = await pin(p, '030792');
    await p.evaluate(() => { V38.EP.pv.buf = ''; });
    const a1 = await pin(p, '482915'); const d1 = await D(p);
    await p.screenshot({path: path.join(SH, 'yonetici-sifre-tekrar.png')});
    const a2 = await pin(p, '482915'); await bek(500); const d2 = await D(p);
    const kayit = await p.evaluate(() => JSON.parse(localStorage.getItem('dk-editor-pin38') || 'null'));
    await p.screenshot({path: path.join(SH, 'yonetici-editor-alani.png')});
    ok('Y3 Yönetici hesabıyla giriş: “Yönetici girişi” düğmesi görünür; ilk kez yönetici alanında “Yönetici şifreni belirle”; eski ortak PIN kabul edilmez; şifre iki kez girilip kaydedilir ve alan açılır',
      gor && !d0.gizli && d0.mode === 'yeni' && /Yönetici şifreni belirle/.test(d0.metin) && !ilk.ok && /ilk/.test(ilk.msg) && d1.mode === 'yeni2' && a2.ok && d2.ed && kayit && kayit.kaynak === 'yonetici' && !JSON.stringify(kayit).includes('482915'), {d0: d0.metin.slice(0, 160), ilk, a2});
    await p.evaluate(() => V38.edLogout()); await bek(300); await p.evaluate(() => go('editor')); await bek(1200);
    const d3 = await D(p);
    const y = await pin(p, '111111'); await p.evaluate(() => { V38.EP.pv.buf = ''; }); const dg = await pin(p, '482915');
    ok('Y4 Sonraki girişte “Yönetici şifresi” sorulur; yanlış şifre açmaz, doğru şifre açar', d3.mode === 'login' && /Yönetici şifresi/.test(d3.metin) && !y.ok && dg.ok, d3.metin.slice(0, 120));
    await p.evaluate(() => V38.edLogout()); await bek(300); await p.evaluate(() => go('editor')); await bek(1000);
    await p.evaluate(() => V51.EdPin.sifirlamaAc()); await bek(500);
    const d4 = await D(p);
    await p.screenshot({path: path.join(SH, 'sifremi-unuttum.png')});
    await pin(p, '735190'); const s2 = await pin(p, '735190'); await bek(400);
    await p.evaluate(() => V38.edLogout()); await bek(300); await p.evaluate(() => go('editor')); await bek(1000);
    const eski = await pin(p, '482915'); await p.evaluate(() => { V38.EP.pv.buf = ''; }); const yeni = await pin(p, '735190');
    ok('Y5 “Şifremi unuttum”: yönetici Google hesabıyla girildiği için e-posta istemeden yeni şifre belirlenir; eski şifre artık açmaz, yenisi açar', d4.mode === 'yeni' && !/e-posta/i.test(d4.metin) && s2.ok && !eski.ok && yeni.ok, d4.metin.slice(0, 160));
    await p.evaluate(async () => { await V46.Hesap.cikis(); }); await bek(500);
    const kap = await p.evaluate(() => ({ed: V38.edOk(), gizli: document.documentElement.hasAttribute('data-yon522')}));
    ok('Y6 Yönetici Google hesabından çıkınca yönetici alanı kapanır ve yönetici düğmesi yeniden gizlenir', !kap.ed && kap.gizli, kap);
    await ctx.close();
  }
  /* ---------- Y7: yedek → yeniden kurulum → geri yükleme ---------- */
  {
    DOSYA = null; YAZ = 0;
    const a = await sayfa({});
    await giris(a.p, OGR);
    await a.p.evaluate(() => { Prog.rec(['TEST-KAZANIM-522'], true); Store.save(); localStorage.setItem('dk-deneme522', 'kalici'); });
    await bek(5200);
    const yaz1 = YAZ, d1 = DOSYA ? JSON.parse(DOSYA) : null;
    const once = await a.p.evaluate(() => ({prog: localStorage.getItem('dk2'), hesap: localStorage.getItem('dk-hesap46')}));
    await a.ctx.close();
    const b2 = await sayfa({});          // yeni bağlam = uygulama silinip yeniden kurulmuş / yeni telefon; “dosya” Google yedeğinden gelmiş
    await bek(2500);
    const sonra = await b2.p.evaluate(() => ({prog: localStorage.getItem('dk2'), hesap: localStorage.getItem('dk-hesap46'), deneme: localStorage.getItem('dk-deneme522'), isaret: JSON.parse(localStorage.getItem('dk-yedek522') || 'null'), toast: (document.querySelector('.toast, #toast, .ui-toast') || {}).textContent || ''}));
    const d = await D(b2.p);
    await b2.p.evaluate(() => go('profil46')); await bek(700);
    await b2.p.screenshot({path: path.join(SH, 'geri-yukleme-sonrasi-profilim.png')});
    ok('Y7 Veriler yedek dosyasına yazılır (hesap, ilerleme, ayarlar); yeniden kurulumda ilk açılışta geri konur ve uygulama aynı hesapla, aynı ilerlemeyle açılır',
      yaz1 > 0 && d1 && d1.v === 1 && d1.ls['dk-deneme522'] === 'kalici' && sonra.deneme === 'kalici' && sonra.prog === once.prog && sonra.hesap === once.hesap && d.mod === 'google' && d.ad === OGR && sonra.isaret && sonra.isaret.geri, {yaz1, isaret: sonra.isaret});
    await b2.ctx.close();
    DOSYA = null;
    const c = await sayfa({});
    const ilk = await c.p.evaluate(() => ({isaret: JSON.parse(localStorage.getItem('dk-yedek522') || 'null'), giden: window.__giden}));
    ok('Y7b Yedek yokken ilk açılış: veri silinmez, işaret konur, ilk yedek yazılır', ilk.isaret && ilk.isaret.t && ilk.giden.includes('yedek-oku') && ilk.giden.includes('yedek-yaz') && DOSYA, ilk);
    await c.ctx.close();
  }
  /* ---------- Y8: tarayıcı (APK dışı) ---------- */
  {
    const {p, ctx} = await sayfa({apk: false});
    const r = await p.evaluate(() => ({gizli: document.documentElement.hasAttribute('data-yon522'), hazir: V52.Yedek.hazir, isaret: localStorage.getItem('dk-yedek522')}));
    await p.evaluate(() => go('editor')); await bek(900); const d = await D(p);
    ok('Y8 Tarayıcıda (APK dışı) V52.1 ile aynı: düğme gizleme ve yedek devre dışı; yönetici ekranı V52.0/V52.1 kurulum açıklaması', !r.gizli && !r.hazir && !r.isaret && /henüz kurulmadı/.test(d.metin), r);
    await ctx.close();
  }
  /* ---------- Y9: öğrenci/öğretmen ekranları V52.1 ile aynı (APK) ---------- */
  {
    const R = [['home', null], ['classes', null], ['grade', {g: 5}], ['topic', {t: 'TPC-5-2-01', tab: 'anlat'}], ['search', {q: 'namaz'}], ['games', null], ['calis45', null]];
    const al = async (dosya) => { const {p, ctx} = await sayfa({dosya, yon: false}); const o = {}; for (const [v, a] of R) { await p.evaluate(([v, a]) => go(v, a), [v, a]); await bek(600); o[v] = await p.evaluate(() => $.innerHTML.replace(/V5[12]\.[0-9]/g, 'V5x').replace(/blob:[^"]+/g, 'blob:')); } await p.evaluate(() => { V36.ss(V36.SK, '1'); go('ogretmen'); }); await bek(900); o.ogretmen = await p.evaluate(() => $.innerHTML.replace(/V5[12]\.[0-9]/g, 'V5x').replace(/blob:[^"]+/g, 'blob:')); await ctx.close(); return o; };
    const a = await al(F0), c = await al(F), fark = Object.keys(a).filter((k) => a[k] !== c[k]);
    ok('Y9 Öğrenci (Elmas) ve öğretmen ekranları V52.1 ile birebir aynı (APK adresinde)', fark.length === 0, fark);
  }
  ok('Y10 Bütün senaryolarda JavaScript hatası yok', HATA.length === 0, HATA.slice(0, 5));
  const gc = S.filter((x) => x.ok).length;
  console.log(`\n${gc}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen: gc, toplam: S.length, kontroller: S}, null, 1));
  await b.close(); st.close(); process.exit(gc === S.length ? 0 : 1);
})().catch((er) => { console.error(er); process.exit(2); });
