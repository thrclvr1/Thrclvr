// V60.0 testleri (depo kökünden, önce python3 tools/v60/build600.py): node tests/v60/test_v600.js — ekran görüntüleri docs/V60.0_ekran/.
// Tarayıcı otomasyonu (yerel http, başsız Chromium, telefon görünümü). Gerçek telefon ve Android WebView burada DENENEMEZ.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v60.0.html', F0 = 'surumler/din-kulturu-platformu-v59.1.html';
const SH = path.join(ROOT, 'docs', 'V60.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 700) : '')); };

(async () => {
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = {h: crypto.createHash('sha256').update(m[2]).digest('hex'), v: m[2]}; return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisenBlok = Object.keys(s0).filter((k) => !s1[k] || s1[k].h !== s0[k].h);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v60.0'));
  ok('A1 sürüm V60.0, index.html aynı; müfredat, ilişki, sureler-dualar, yıllık plan, oyun ve görsel veri blokları V59.1 ile bayt bayt aynı (yalnız 7 müzik bloğu yeni biçimde); eski sürüm dosyaları ve APK’lar değişmedi; açık PIN/e-posta yok; Altın öğrenciye kapalı',
    /V31\.VER="V60\.0"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === Object.keys(s0).length && degisenBlok.length === 7 && degisenBlok.every((k) => k.startsWith('m42-')) && degisen.length === 0 && !/@gmail\.com/.test(h1) && !h1.includes('030792') && /ACIK: false,/.test(h1), {degisenBlok, degisen});
  const gr = fs.readFileSync(path.join(ROOT, 'android', 'app', 'build.gradle.kts'), 'utf8'), pg = fs.readFileSync(path.join(ROOT, 'android', 'app', 'proguard-rules.pro'), 'utf8');
  ok('A2 Android: APK’ya kökteki index.html girer (web ile aynı dosya); R8 kod küçültme ve kaynak küçültme açık; uygulama kodu, WebView köprüsü ve Google giriş sınıfları korunuyor; simgeler kayıpsız WebP',
    /val webIndex = rootProject\.file\("\.\.\/index\.html"\)/.test(gr) && /isMinifyEnabled = true/.test(gr) && /isShrinkResources = true/.test(gr) && /-keep class tr\.dkab\.platform\.\*\*/.test(pg) && /-keep class androidx\.webkit\.\*\*/.test(pg) && /-keep class androidx\.credentials\.\*\*/.test(pg) && fs.readdirSync(path.join(ROOT, 'android/app/src/main/res/mipmap-xxxhdpi')).every((f) => f.endsWith('.webp')));
  // müzik: Opus/WebM, süreler özgün kayıtlarla aynı
  const MUZ = {esik: 'before_the_sacred_threshold', sessizdua: 'sessiz_dua', neynefes: 'the_reed_s_breath', neydua: 'the_prayer_of_the_reed', isik: 'where_the_light_rests', kubbe: 'the_vaulted_study', cam: 'rain_on_the_pane'};
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'm60-')); const mz = {};
  for (const [id, ad] of Object.entries(MUZ)) {
    const b = Buffer.from(s1['m42-' + id].v.trim(), 'base64'), f = path.join(tmp, id + '.webm'); fs.writeFileSync(f, b);
    const sure = (x) => +cp.execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${x}"`).toString().trim();
    const kod = cp.execSync(`ffprobe -v error -show_entries stream=codec_name,channels -of csv=p=0 "${f}"`).toString().trim();
    mz[id] = {webm: b.slice(0, 4).toString('hex') === '1a45dfa3', kod, sure: sure(f), ozgun: sure(path.join(ROOT, 'kaynaklar', 'muzik', ad + '.mp3')), kB: Math.round(b.length / 1024), eskiKB: Math.round(Buffer.from(s0['m42-' + id].v.trim(), 'base64').length / 1024)};
  }
  ok('A3 Yedi müzik Opus (WebM, stereo); her birinin süresi özgün kayıtla aynı (±0,1 sn); toplam boyut küçüldü', Object.values(mz).every((x) => x.webm && /^opus,2/.test(x.kod) && Math.abs(x.sure - x.ozgun) < 0.1) && Object.values(mz).reduce((a, x) => a + x.kB, 0) < Object.values(mz).reduce((a, x) => a + x.eskiKB, 0) * 0.8, mz);

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, ses: {}, ek: {}, dpr: 1, dosya: F, sinif: 6}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true, deviceScaleFactor: o.dpr, colorScheme: 'dark'});
    await ctx.route('https://**/*', (r) => r.abort());
    await ctx.addInitScript(([o]) => {
      if (!localStorage.getItem('__s')) { localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); localStorage.setItem('dk-gorunum54', JSON.stringify({v: 1, altin: 1})); localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: o.sinif}}})); for (const k in o.ek) localStorage.setItem(k, o.ek[k]); }
      for (const k in o.ses) sessionStorage.setItem(k, o.ses[k]);
      try { const iv = setInterval(() => { if (window.V51 && V51.Yonetici) { V51.Yonetici.tamam = () => true; clearInterval(iv); } }, 5); } catch (e) {}
    }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (er) => HATA.push(er.message));
    await p.goto(ORIGIN + '/' + o.dosya); await p.waitForTimeout(2400);
    return {p, ctx};
  };
  const ED = {'dk-editor-oturum38': '1'};
  const altinAc = (p) => p.evaluate(async () => { V53.Onizleme.baslat(); await new Promise((r) => setTimeout(r, 1500)); });
  const bk = (p, ms) => p.waitForTimeout(ms);

  /* ---------- K: koridor zemini ---------- */
  {
    const zemin = async (dosya) => {
      const {p, ctx} = await sayfa({ses: ED, dosya});
      await altinAc(p);
      const r = await p.evaluate(async () => {
        go('pdunya'); await new Promise((r) => setTimeout(r, 2500));
        const U = V40.GL.URET.zemin, c = document.createElement('canvas'); c.width = U[0]; c.height = U[1]; const x = c.getContext('2d'); U[2](x);
        // yolluğun ortası (dokuda 330–630 x, merkez 480,300): açık renkli (yıldız) piksel sayısı
        const sx = U[0] / 960, sy = U[1] / 600, d = x.getImageData(Math.round(380 * sx), Math.round(200 * sy), Math.round(200 * sx), Math.round(200 * sy)).data;
        let acik = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 450) acik++;
        return {acik, kaynak: V40.GL.durum.kaynak, mad: getComputedStyle(document.createElement('i')).display};
      });
      if (dosya === F) { await p.evaluate(() => { V43.ayarla('gunduz'); }); await bk(p, 1500); await p.screenshot({path: path.join(SH, 'koridor-zemin.png')}); }
      await ctx.close(); return r;
    };
    const z1 = await zemin(F), z0 = await zemin(F0);
    ok('K1 Koridor zemini: yolluğun ortasındaki yıldız madalyon kalktı (dokuda açık renkli yıldız pikseli V59.1’de var, V60’ta yok); koridor WebGL ile çiziliyor; CSS yedeğinde madalyon gizli',
      z0.acik > 500 && z1.acik === 0 && z1.kaynak === 'webgl' && /\.z40\.zem \.mad\{display:none!important/.test(h1), {V591: z0.acik, V60: z1.acik, kaynak: z1.kaynak});
  }

  /* ---------- J: bağlantıdan derse ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2});
    await altinAc(p);
    const j1 = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms));
      go('links', {lk: {tab: 'kavram'}}); await bk(800); V34.sel('concept', 'CON-DKAB-6-ezan'); await bk(1200);
      const btn = [...document.querySelectorAll('.kjr-a button')].find((b) => /4\. sınıf dersine git/.test(b.textContent)); btn.click(); await bk(1800);
      const k = document.querySelector('mark.km60-k'), hl = [...document.querySelectorAll('mark.km-hl')].map((m) => m.textContent).join(''), r = k && k.getBoundingClientRect();
      return {view, pt: G.pt, altin: !!V39.on, son: V60.Bag.son, terim: k && k.textContent, cumle: hl, gorunur: !!r && r.top > 60 && r.bottom < innerHeight - 60};
    });
    await p.screenshot({path: path.join(SH, 'baglanti-ezan-vurgu.png')});
    const sonra = await p.evaluate(async () => { await new Promise((r) => setTimeout(r, 6800)); return {k: document.querySelectorAll('mark.km60-k').length, hl: document.querySelectorAll('mark.km-hl').length}; });
    ok('J1 Bağlantılar › “4. sınıf dersine git” (ezan): Altın’da 4. sınıf dersi açılır, kaydın cümlesi (“Her namaz vaktinde minarelerden okunan ezan…”) bulunur, “ezan” kelimesi ayrıca vurgulanır ve ekranın ortasına kaydırılır; vurgu birkaç saniye sonra kaybolur',
      j1.view === 'pders' && j1.altin && j1.pt === 'TPC18-4-1-01a' && j1.son.found && /ezan/i.test(j1.terim || '') && /minarelerden okunan ezan/.test(j1.cumle) && j1.gorunur && sonra.k === 0 && sonra.hl === 0, {j1, sonra});
    // “İlgili derse git” (harita düğüm penceresi) — 273 ana kavramın hepsi (iki program, bütün sınıflar)
    const j2 = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms)), sade = (x) => x.toLocaleLowerCase('tr-TR').replace(/[âîû]/g, (m) => ({â: 'a', î: 'i', û: 'u'})[m]);
      const o = {n: 0, bulunan: 0, terim: 0, yanlisKelime: [], hatali: [], terimsiz: []};
      for (const c of KMAP.roots()) {
        const occ = KMAP.firstOcc(c.id); if (!occ) continue; o.n++;
        KMAP.goLesson(occ[0], occ[1], occ[2], occ[3], [c.id]); await bk(420);
        const s = V60.Bag.son || {};
        if (view === 'pders' && G.pt === occ[0] && s.found) o.bulunan++; else o.hatali.push(c.id);
        const k = document.querySelector('mark.km60-k');
        if (s.terim && k) { o.terim++; if (sade(k.textContent).slice(0, -1) !== sade(c.term).slice(0, -1)) o.yanlisKelime.push(c.term + '→' + k.textContent); } else o.terimsiz.push(c.term);
        KMAP.clearHL();
      }
      return o;
    });
    ok('J2 “İlgili derse git” 273 ana kavramın hepsinde (iki program, bütün sınıflar) Altın’da doğru ders açılır ve kayıtlı cümle bulunup vurgulanır; kavram kelimesi cümlede ayrıca vurgulanır (en az %95; hiçbirinde yanlış kelime vurgulanmaz)', j2.n === 273 && j2.bulunan === j2.n && j2.terim >= j2.n * 0.95 && j2.yanlisKelime.length === 0, {n: j2.n, bulunan: j2.bulunan, terim: j2.terim, terimsiz: j2.terimsiz, hatali: j2.hatali.slice(0, 5), yanlis: j2.yanlisKelime});
    // Altın'da tıklanabilir kavramlar = Elmas ile aynı altyapı (aynı konu → aynı kayıtlar)
    const x = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms));
      KMAP.clearHL(); go('pders', {pt: 'TPC-6-1-01', ptab: 'anlat'}); await bk(1500);
      const al = [...document.querySelectorAll('#tb a.xl')].map((a) => a.dataset.id).sort();
      const a0 = document.querySelector('#tb a.xl[data-col="concepts"]'); const ad = a0 && a0.textContent; a0 && a0.click(); await bk(800);
      const sh = document.querySelector('.v-ov'); const o = {al, sheet: sh && sh.innerText.slice(0, 200), ad, renk: a0 && getComputedStyle(a0).color};
      UI.close(); await bk(600); return o;
    });
    await p.screenshot({path: path.join(SH, 'altin-kavram-baglantilari.png')});
    await ctx.close();
    const {p: pe, ctx: ce} = await sayfa({});
    const el = await pe.evaluate(async () => { go('topic', {t: 'TPC-6-1-01', tab: 'anlat'}); await new Promise((r) => setTimeout(r, 1500)); return [...document.querySelectorAll('#tb a.xl')].map((a) => a.dataset.id).sort(); });
    await ce.close();
    ok('X1 Altın ders anlatımında kavramlar tıklanabilir: Elmas’la aynı altyapı (aynı konuda aynı kavram/kişi kayıtları işaretlenir), dokununca kavram penceresi açılır', x.al.length > 0 && JSON.stringify(x.al) === JSON.stringify(el) && x.sheet && x.sheet.length > 10, {altin: x.al.length, elmas: el.length, ad: x.ad, sheet: (x.sheet || '').slice(0, 80)});
  }

  /* ---------- J3: Elmas (editör yönetim ekranı yolu) ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED});
    const r = await p.evaluate(async () => {
      const occ = KMAP.firstOcc('CON-DKAB-6-vahiy'); KMAP.goLesson(occ[0], occ[1], occ[2], occ[3], ['CON-DKAB-6-vahiy']); await new Promise((r) => setTimeout(r, 1500));
      return {view, t: G.t, altin: !!V39.on, son: V60.Bag.son};
    });
    ok('J3 Elmas’ta (editör, yönetimden) aynı ortak atlama Elmas ders ekranında çalışır; mod değişmez', r.view === 'topic' && !r.altin && r.son && r.son.found, r);
    await ctx.close();
  }

  /* ---------- U: Altın üst çubuk, arama ve ses; Önerilen ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2, ek: {'dk-theme': 'light'}});
    await altinAc(p);
    const r = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms));
      V43.ayarla('gece'); go('pdunya'); await bk(2500);
      const u = document.querySelector('.ust40'), a = document.querySelector('#app .ara60'), sh = document.querySelector('#app .sahne40');
      const o = {ara: !!u.querySelector('[onclick*="V39.ara"]'), ses: !!u.querySelector('.ses'), tema: !!u.querySelector('.t60'), alan: !!a, sonra: !!(sh && sh.nextElementSibling === a)};
      const t0 = {theme: localStorage.getItem('dk-theme'), tema54: localStorage.getItem('dk-tema54')};
      u.querySelector('.t60').click(); await bk(700); o.pt1 = document.documentElement.dataset.pt43; u.querySelector('.t60') && document.querySelector('.ust40 .t60').click(); await bk(700); o.pt2 = document.documentElement.dataset.pt43;
      o.digerleri = localStorage.getItem('dk-theme') === t0.theme && localStorage.getItem('dk-tema54') === t0.tema54;
      a.querySelector('.ara60-k').click(); await bk(900); const inp = document.querySelector('input[type=search], .v-ov input, #p39-ara input, input'); o.aramaAcik = !!inp && inp.getBoundingClientRect().height > 0;
      try { UI.close(); } catch (x) {} document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})); await bk(600); go('pdunya'); await bk(1500);
      document.querySelector('#app .ara60-s').click(); await bk(800); o.sesAcik = !!document.querySelector('.v-ov') && /Ses|ses|Müzik/.test(document.querySelector('.v-ov').innerText); try { UI.close(); } catch (x) {} await bk(500);
      return o;
    });
    await p.evaluate(async () => { go('pdunya'); await new Promise((r) => setTimeout(r, 2000)); window.scrollTo(0, 420); }); await bk(p, 400);
    await p.screenshot({path: path.join(SH, 'altin-ust-cubuk-arama.png')});
    ok('U1 Altın koridor üst çubuğu: Ara ve Ses çubuktan alındı, yerine gündüz/gece düğmesi; arama alanı ve ses düğmesi koridorun hemen altında; gündüz/gece çalışır (Elmas ve Öğretmen tercihleri değişmez); arama alanı mevcut Altın aramasını, ses düğmesi ses panelini açar',
      !r.ara && !r.ses && r.tema && r.alan && r.sonra && r.pt1 === 'gunduz' && r.pt2 === 'gece' && r.digerleri && r.aramaAcik && r.sesAcik, r);
    const o = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms));
      const oku = () => [...document.querySelectorAll('.v-ov .tm57-k')].map((k) => ((k.querySelector(':scope > span:last-child > b') || {}).textContent || '') + (k.querySelector('.on58') ? ' ★' + k.querySelector('.on58').textContent : ''));
      V54.Tema.ac('altin'); await bk(700); const a = oku(); UI.close(); await bk(500);
      V54.Tema.sec('altin', 'zumrut'); V54.Tema.ac('altin'); await bk(700); const a2 = oku(); UI.close(); await bk(500); V54.Tema.sec('altin', 'altin');
      V50.Mod.gec('ogretmen'); await bk(1200); V54.Tema.ac('ogretmen'); await bk(700); const og = oku(); UI.close(); await bk(400);
      return {a, a2, og};
    });
    const yildizli = (L) => L.filter((x) => /★/.test(x));
    ok('O1 Önerilen: Altın’da Altın Mihrap (gündüz ve gece), Elmas · Açık ve Elmas · Koyu; Öğretmen’de yalnız Altın Mihrap (gündüz); başka tema seçiliyken de işaretler aynı yerde',
      JSON.stringify(yildizli(o.a)) === JSON.stringify(['Altın Mihrap ★Önerilengündüz ve gece', 'Elmas · Açık ★Önerilen', 'Elmas · Koyu ★Önerilen']) && JSON.stringify(yildizli(o.a2)) === JSON.stringify(yildizli(o.a)) && JSON.stringify(yildizli(o.og)) === JSON.stringify(['Altın Mihrap ★Önerilengündüz']), o);
    await ctx.close();
  }

  /* ---------- M: müzik çalıyor ---------- */
  {
    const {p, ctx} = await sayfa({});
    const r = await p.evaluate(async () => {
      const o = {destek: V60.Muzik.destek('audio/webm; codecs="opus"'), parca: {}};
      for (const m of V42.MUZ) {
        const url = await V42.muzikURL(m.id); const a = new Audio(); a.src = url; a.muted = true;
        o.parca[m.id] = await new Promise((r) => { a.onloadedmetadata = () => r(+a.duration.toFixed(1)); a.onerror = () => r('hata'); setTimeout(() => r('zaman aşımı'), 8000); });
      }
      return o;
    });
    ok('M1 Müzikler tarayıcıda açılıyor (Opus desteği var); her parçanın süresi okunuyor (çalınabilir)', r.destek && Object.values(r.parca).every((x) => typeof x === 'number' && x > 50), r);
    await ctx.close();
  }

  /* ---------- D + E: veri ve ekranlar ---------- */
  {
    const veri = {'dk2': JSON.stringify({added: {}, patch: {}, raw: [], prog: {'DKAB18-4-U01-O01': {c: 3, w: 1}}, cards: {}, dataVersion: 'x'}), 'dk-calis45': JSON.stringify({v: 1, hedef: 25, gun: {'2026-11-20': 7}, sg: {'2026-11-20': {4: 5}}}), 'dk-tema54': JSON.stringify({v: 1, altin: 'zumrut', ogretmen: 'lacivert', ogretmenMod: 'gunduz'}), 'dk-ptema43': 'gunduz', 'dk-theme': 'light', 'dk-oyun41': JSON.stringify({v: 1, oyunlar: {dunya45: {g4: {x: 1}}}, ayar: {}})};
    const {p, ctx} = await sayfa({ek: veri});
    const r = await p.evaluate(async () => { for (const v of ['games', 'atlas57', 'home', 'profil46']) { go(v); await new Promise((r) => setTimeout(r, 700)); } const o = {}; ['dk-calis45', 'dk-tema54', 'dk-ptema43', 'dk-theme', 'dk-oyun41'].forEach((k) => o[k] = localStorage.getItem(k)); o.prog = JSON.parse(localStorage.getItem('dk2')).prog; return o; });
    ok('D1 Kullanıcı verisi korunur: ilerleme, günlük hedef, temalar, görünüm tercihleri, oyun kayıtları aynen', r['dk-calis45'] === veri['dk-calis45'] && r['dk-tema54'] === veri['dk-tema54'] && r['dk-ptema43'] === 'gunduz' && r['dk-theme'] === 'light' && r['dk-oyun41'] === veri['dk-oyun41'] && r.prog['DKAB18-4-U01-O01'].c === 3, r);
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({ses: ED, w: 360, h: 640, dpr: 2});
    const el = await p.evaluate(async () => { const o = {Z513: window.Z513 && window.Z513.ok, konu: Store.all('topics').length}; for (const v of ['home', 'games', 'atlas57']) { go(v); await new Promise((r) => setTimeout(r, 900)); o[v] = document.documentElement.scrollWidth; } return o; });
    await altinAc(p);
    const al = await p.evaluate(async () => { const o = {}; for (const [v, a] of [['pdunya', {}], ['pders', {pt: 'TPC-6-1-01', ptab: 'anlat'}], ['links', {lk: {tab: 'kavram'}}]]) { go(v, a); await new Promise((r) => setTimeout(r, 1500)); o[v] = document.documentElement.scrollWidth; } return o; });
    const og = await p.evaluate(async () => { V50.Mod.gec('ogretmen'); await new Promise((r) => setTimeout(r, 1300)); return {ogretmen: document.documentElement.scrollWidth, view}; });
    await p.evaluate(async () => { V50.Mod.gec('altin'); await new Promise((r) => setTimeout(r, 1200)); go('pdunya'); await new Promise((r) => setTimeout(r, 2000)); window.scrollTo(0, 380); }); await bk(p, 400);
    await p.screenshot({path: path.join(SH, 'telefon-360-altin-ana.png')});
    const hepsi = Object.assign({}, el, al, {ogretmen: og.ogretmen});
    ok('E1 Her üç mod açılıyor ve çalışıyor (Elmas, Altın, Öğretmen); veri paketi açıldı; 360 px’te yatay taşma yok', el.Z513 === true && el.konu > 100 && og.view === 'ogretmen' && ['home', 'games', 'atlas57', 'pdunya', 'pders', 'links', 'ogretmen'].every((k) => hepsi[k] <= 361), hepsi);
    await ctx.close();
  }

  ok('Z9 Sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); st.close();
  const gecen = S.filter((x) => x.ok).length;
  console.log(`\n${gecen}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen, toplam: S.length, kontroller: S}, null, 1));
  process.exit(gecen === S.length ? 0 : 1);
})();
