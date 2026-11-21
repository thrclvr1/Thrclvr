// V51.3 testleri (depo kökünden): node tests/v51_3/test_v513.js
// Yerel http sunucusu + başsız Chromium. Ekran görüntüleri: docs/V51.3_ekran/. Tarayıcı otomasyonu gerçek cihaz testi değildir.
// Toplu editör işlemleri, bildirim sunucusu, öğrenci/öğretmen/editör görünümleri: python3 tests/v51_3/gerileme.py (V51.2/V51.1/V51.0/V50 testleri V51.3'te).
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process'), zlib = require('zlib');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('./ac513.js');
const F = 'surumler/din-kulturu-platformu-v51.3.html', F0 = 'surumler/din-kulturu-platformu-v51.2.html';
const SH = path.join(ROOT, 'docs', 'V51.3_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [], OLC = {};
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const OGRT_KAYIT = JSON.stringify({v: 1, app: 'dkab-ogretmen', classes: [{g: 5, py: '2026'}, {g: 4, py: '2018'}], active: '5|2026', status: {'DKAB-5-U01-O01': 'isl'}, plans: [{id: 'P1', g: 5, py: '2026', oid: 'DKAB-5-U01-O01', date: '2026-09-15', dur: 40, goal: 'x'}], updatedAt: null});

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = (f) => 'http://127.0.0.1:' + srv.address().port + '/' + (f || F);
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, mod: 'normal', tema: 'light', ek: null, f: F, mobil: true}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: o.mobil, hasTouch: o.mobil});
    await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1'); localStorage.setItem('dk-theme', o.tema); localStorage.setItem('dk-ptema43', 'gece'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); if (o.ek) for (const k in o.ek) localStorage.setItem(k, o.ek[k]); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL(o.f)); await p.waitForTimeout(1500);
    return {p, ctx};
  };
  const ac = async (p, js, ms) => { await p.evaluate(js); await bek(ms || 500); };

  /* ---------- A. derleme, veri bütünlüğü, boyut ---------- */
  const ham1 = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham1), h0 = fs.readFileSync(path.join(ROOT, F0), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  ok('A1 sürüm V51.3, index.html aynı dosya; V51.2 dosyası duruyor', /V31\.VER="V51\.3"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham1 && fs.existsSync(path.join(ROOT, F0)));
  ok('A2 paket açılınca bütün veri, müzik ve görsel blokları (15) V51.2 ile bayt bayt aynı', Object.keys(s0).length === 15 && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v), Object.keys(s1).length);
  const deg = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v51.3'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı', deg.length === 0, deg.join(';') || 'yalnız v51.3');
  const b0 = fs.statSync(path.join(ROOT, F0)).size, b1 = fs.statSync(path.join(ROOT, F)).size;
  const gz = (s) => zlib.gzipSync(Buffer.from(s), {level: 9}).length;
  OLC.boyut = {v512: b0, v513: b1, okunur: Buffer.byteLength(h1), yuzde: +(100 * (b0 - b1) / b0).toFixed(1), gz512: gz(h0), gz513: gz(ham1)};
  ok('A4 HTML boyutu küçüldü (V51.2 → V51.3)', b1 < b0 * 0.7, OLC.boyut);

  /* tarayıcıda: açılan metin V51.2 ile aynı; açılış süresi */
  {
    const oku = async (f) => { const {p, ctx} = await sayfa({f}); const r = await p.evaluate(async () => { const o = {}; for (const e of document.querySelectorAll('script[id^=seed-]')) { const d = new TextEncoder().encode(e.textContent), hh = await crypto.subtle.digest('SHA-256', d); o[e.id] = [...new Uint8Array(hh)].map((x) => x.toString(16).padStart(2, '0')).join(''); } return {o, Z: window.Z513 || null, ust: !!document.querySelector('#app').children.length}; }); await ctx.close(); return r; };
    const r0 = await oku(F0), r1 = await oku(F);
    ok('A5 Tarayıcıda açılan veri metinleri V51.2 ile aynı (SHA-256), açıcı hatasız; uygulama açıldı', JSON.stringify(r0.o) === JSON.stringify(r1.o) && r1.Z && r1.Z.ok && r1.Z.bloklar === 5 && r1.ust, {Z: r1.Z, n: Object.keys(r1.o).length});
    OLC.acici = r1.Z;
  }

  /* ---------- K. konu sonu önceki/sonraki konu ---------- */
  const sira = async (p, mod) => p.evaluate(async (mod) => {
    const W = (ms) => new Promise((r) => setTimeout(r, ms)), R = {};
    for (const g of [4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      let ekr = [];
      if (mod === 'elmas') { go('grade', {g}); await W(120); ekr = [...document.querySelectorAll('#app .trow')].map((b) => (b.getAttribute('onclick').match(/t:'([^']+)'/) || [])[1]); }
      else { for (const u of V39.units(g, V39.pv(g))) { go('punite', {pg: g, pu: u.id}); await W(50); [...document.querySelectorAll('#app .p39-tc button[onclick*=pders]')].forEach((b) => ekr.push(b.getAttribute('onclick').match(/pt:'([^']+)'/)[1])); } }
      const L = ekr.length ? V51.KonuGecis.sira(Store.get('topics', ekr[0]), mod).map((x) => x.t.id) : [];
      R[g] = ekr.length && JSON.stringify(ekr) === JSON.stringify(L) ? ekr.length : 'FARKLI ' + ekr.length + '/' + L.length;
    }
    return R;
  }, mod);
  const gez = async (p, mod) => p.evaluate(async (mod) => {
    const W = (ms) => new Promise((r) => setTimeout(r, ms)), A = mod === 'altin', R = {};
    const L = V51.KonuGecis.sira(Store.all('topics').find((t) => t.grade == 6 && t.programYear === '2026' && !t.parentId && vis(t)), mod);
    const ac = (id) => (A ? go('pders', {pt: id, ptab: ''}) : go('topic', {t: id, tab: 'anlat'}));
    const tid = () => (A ? G.pt : G.t), tik = async (k) => { document.querySelector('.kg513 [data-kg=' + k + ']').click(); await W(300); };
    const once = {d39: localStorage.getItem('dk-deneyim39'), prog: JSON.stringify(JSON.parse(localStorage.getItem('dk2') || '{}').prog || {}), mt: JSON.stringify(JSON.parse(localStorage.getItem('dk2') || '{}').mt || {})};
    ac(L[0].t.id); await W(300);
    R.ilk = {var: !!document.querySelector('.kg513'), ilk: !!document.querySelector('[data-kg=ilk]'), onceYok: !document.querySelector('[data-kg=onceki]'), sonraki: !!document.querySelector('[data-kg=sonraki]')};
    await tik('sonraki'); R.ileri = {t: tid() === L[1].t.id, view, mod: V50.Mod.aktif(), on: V39.on};
    await tik('onceki'); R.geri = tid() === L[0].t.id;
    const i = L.findIndex((x, j) => j > 0 && x.u.id !== L[j - 1].u.id);
    ac(L[i - 1].t.id); await W(300); R.uniteMetni = (document.querySelector('[data-kg=sonraki]') || {}).textContent || '';
    await tik('sonraki'); R.unite = {t: tid() === L[i].t.id, u: Store.get('topics', tid()).unitId === L[i].u.id};
    await tik('onceki'); R.uniteGeri = tid() === L[i - 1].t.id;
    ac(L[L.length - 1].t.id); await W(300); R.son = {sinif: !!document.querySelector('[data-kg=sinif]'), sonrakiYok: !document.querySelector('[data-kg=sonraki]')};
    await tik('sinif'); R.sinifa = {view, g: A ? G.pg : G.g};
    // geri tuşu: konu A → sonraki B → history.back() → A, aynı mod
    ac(L[2].t.id); await W(300); await tik('sonraki'); history.back(); await W(700); R.geriTusu = {t: tid() === L[2].t.id, view, mod: V50.Mod.aktif()};
    // sekme değişince geçiş tek kez ve yerinde
    if (A) { V39.tab('ozet'); } else { tabTo('ozet'); } await W(250); R.sekme = document.querySelectorAll('.kg513').length;
    const sonra = {d39: localStorage.getItem('dk-deneyim39'), prog: JSON.stringify(JSON.parse(localStorage.getItem('dk2') || '{}').prog || {}), mt: JSON.stringify(JSON.parse(localStorage.getItem('dk2') || '{}').mt || {})};
    R.kayit = once.d39 === sonra.d39 && once.prog === sonra.prog && once.mt === sonra.mt;
    const bt = document.querySelector('.kg513 .kg513-b'); R.dokunma = bt ? Math.round(bt.getBoundingClientRect().height) : 0;
    R.n = L.length; R.alanSayisi = new Set(L.map((x) => x.t.programYear)).size;
    return R;
  }, mod);
  for (const [mod, d] of [['elmas', 'normal'], ['altin', 'premium']]) {
    const {p, ctx} = await sayfa({mod: d, tema: mod === 'altin' ? 'dark' : 'light', ek: {dk2: JSON.stringify({patch: {}, added: {}, prog: {'DKAB-5-U01-O01': {correct: 2, wrong: 1, mastery: 0.66}}, cards: {}, wrong: {}, mt: {'TPC-5-1-01': {s: 3, n: 4}}})}});
    const sr = await sira(p, mod);
    const AD = mod === 'elmas' ? 'Elmas' : 'Altın';
    ok(`K1 ${AD}: konu sırası 4–12. sınıfların hepsinde o modun sınıf/ünite ekranındaki sırayla birebir aynı`, Object.values(sr).every((x) => typeof x === 'number'), sr);
    const r = await gez(p, mod);
    ok(`K2 ${AD}: ilk konuda “önceki” yok (“ilk konusu” notu), “sonraki” var; ileri/geri doğru konuya gider`, r.ilk.var && r.ilk.ilk && r.ilk.onceYok && r.ilk.sonraki && r.ileri.t && r.geri, r);
    ok(`K3 ${AD}: ünite değişiminde sıradaki ünitenin ilk konusuna geçer (yeni ünite adı gösterilir) ve geri döner`, r.unite.t && r.unite.u && r.uniteGeri && /yeni ünite/.test(r.uniteMetni), {u: r.unite, m: r.uniteMetni.slice(0, 90)});
    ok(`K4 ${AD}: son konuda “sonraki” yerine “Sınıf sayfasına dön” çıkar ve doğru sınıfa döner`, r.son.sinif && r.son.sonrakiYok && r.sinifa.view === (mod === 'elmas' ? 'grade' : 'psinif') && +r.sinifa.g === 6, r.sinifa);
    ok(`K5 ${AD}: geçişte mod değişmez (${mod}); geri tuşu önceki konuya aynı modda döner`, r.ileri.mod === mod && r.ileri.view === (mod === 'elmas' ? 'topic' : 'pders') && r.ileri.on === (mod === 'altin') && r.geriTusu.t && r.geriTusu.mod === mod, {ileri: r.ileri, geri: r.geriTusu});
    ok(`K6 ${AD}: ilerleme, test sonuçları ve mod tercihi geçişten etkilenmez; sekme değişince geçiş bir kez görünür; düğme ≥ 44 px; tek program (2018/2026 karışmaz)`, r.kayit && r.sekme === 1 && r.dokunma >= 44 && r.alanSayisi === 1, {kayit: r.kayit, sekme: r.sekme, px: r.dokunma, n: r.n});
    await p.evaluate(async (A) => { const L = V51.KonuGecis.sira(Store.get('topics', 'TPC-6-1-01') || Store.all('topics').find((t) => t.grade == 6 && vis(t)), A ? 'altin' : 'elmas'); const i = L.findIndex((x, j) => j > 0 && x.u.id !== L[j - 1].u.id); if (A) go('pders', {pt: L[i].t.id, ptab: ''}); else go('topic', {t: L[i].t.id, tab: 'anlat'}); await new Promise((r) => setTimeout(r, 400)); document.querySelector('.kg513').scrollIntoView({block: 'center'}); }, mod === 'altin');
    await bek(300); await p.screenshot({path: path.join(SH, `${mod}-konu-gecisi.png`)});
    await ctx.close();
  }
  // öğretmen görünümünde geçiş öğretmen bağlamını korur
  {
    const {p, ctx} = await sayfa({ek: {'dk-ogretmen-v1': OGRT_KAYIT}});
    const r = await p.evaluate(async () => { V36.ss(V36.SK, '1'); V51.Gorunum.ac('TPC-5-1-01'); await new Promise((r) => setTimeout(r, 500)); const a = {kip: V51.Gorunum.kip(), kg: !!document.querySelector('.kg513')}; document.querySelector('[data-kg=sonraki]').click(); await new Promise((r) => setTimeout(r, 500)); return {a, kip: V51.Gorunum.kip(), okip: G.okip, t: G.t, bar: !!document.querySelector('.ogv51-bar'), mod: V50.Mod.aktif()}; });
    ok('K7 Öğretmen görünümünde “sonraki konu” öğretmen görünümünde kalır (öğretmen çubuğu ve bilgisi)', r.a.kip === 'ogretmen' && r.a.kg && r.kip === 'ogretmen' && r.okip === 'ogretmen' && r.bar && r.t !== 'TPC-5-1-01', r);
    const r2 = await p.evaluate(async () => { sessionStorage.removeItem('dk-ogrt-oturum'); go('topic', {t: 'TPC-5-1-01', tab: 'anlat', okip: 'ogretmen'}); await new Promise((r) => setTimeout(r, 400)); document.querySelector('[data-kg=sonraki]').click(); await new Promise((r) => setTimeout(r, 400)); return {kip: V51.Gorunum.kip(), okip: G.okip || null, bar: !!document.querySelector('.ogv51-bar')}; });
    ok('K8 Öğretmen oturumu yokken geçiş öğrenci görünümünde kalır (öğretmen bağlamı taşınmaz)', r2.kip === 'ogrenci' && !r2.okip && !r2.bar, r2);
    await ctx.close();
  }

  /* ---------- O. etkinlik oyunları ve moda özel oyunlar ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    const r = await p.evaluate(async () => { const W = (ms) => new Promise((r) => setTimeout(r, ms)); go('games'); await W(400); const h = (document.querySelector('#app h1') || {}).textContent; const n = document.querySelectorAll('#app [onclick*=playGame]').length; const k3 = /Kütüphane|Oyun Dünyası/.test(document.querySelector('#app').textContent); const oyn = [...document.querySelectorAll('#app [onclick*=playGame]')].some((b) => /poyna|dunya45|kutuphane/.test(b.getAttribute('onclick')));
      document.querySelector('#app [onclick*=playGame]').click(); await W(500); const oyun = {view, mod: V50.Mod.aktif(), on: V39.on};
      go('games'); await W(300); const d = document.querySelector('#app .g46-dunya, #app [onclick*=poyun]'); d.click(); await W(500); const dunya = {view, mod: V50.Mod.aktif(), onay: !!document.querySelector('.oy51'), on: V39.on};
      return {h, n, k3, oyn, oyun, dunya}; });
    await p.evaluate(() => go('games')); await bek(400); await p.screenshot({path: path.join(SH, 'elmas-etkinlik-oyunlari.png')});
    ok('O1 Elmas: “Etkinlik oyunları” açılır, oyunlar listelenir ve oyun Elmas’ta oynanır', h1Uy(r.h) && r.n > 20 && r.oyun.view === 'game' && r.oyun.mod === 'elmas' && !r.oyun.on, r);
    ok('O2 Elmas: 3B Oyun Dünyası yalnız bilgi kartı; dokununca onay ekranı açılır, mod değişmez; 3B oyunlar Elmas listesine kopyalanmamış', r.k3 && !r.oyn && r.dunya.onay && r.dunya.mod === 'elmas' && !r.dunya.on, r.dunya);
    await ctx.close();
  }
  function h1Uy(h) { return /Etkinlik oyunları/.test(h || ''); }
  {
    const {p, ctx} = await sayfa({mod: 'premium', tema: 'dark'});
    const r = await p.evaluate(async () => { const W = (ms) => new Promise((r) => setTimeout(r, ms)); go('poyun'); await W(500); const mt = document.querySelector('#app').textContent; const uc = {kut: /Kütüphane/.test(mt), dunya: /Dünya/.test(mt)};
      const b = [...document.querySelectorAll('button')].find((x) => /Etkinlik oyunlarına git/.test(x.textContent)); b.click(); await W(500);
      const e = {view, mod: V50.Mod.aktif(), prem: document.body.hasAttribute('data-prem39'), h: (document.querySelector('#app h1') || {}).textContent, n: document.querySelectorAll('#app [onclick*=playGame]').length, bg: getComputedStyle(document.querySelector('.gh-hero')).backgroundImage.slice(0, 120)};
      document.querySelector('#app [onclick*=playGame]').click(); await W(500); const o = {view, mod: V50.Mod.aktif(), on: V39.on};
      return {uc, e, o}; });
    await p.evaluate(() => go('games')); await bek(400); await p.screenshot({path: path.join(SH, 'altin-etkinlik-oyunlari.png')});
    ok('O3 Altın: Oyun Dünyası › “Etkinlik oyunlarına git” Altın tasarımında açılır; oyun Altın’da oynanır', r.e.view === 'games' && r.e.mod === 'altin' && r.e.prem && h1Uy(r.e.h) && r.e.n > 20 && r.o.view === 'game' && r.o.mod === 'altin' && r.o.on, r);
    ok('O4 Altın: 3B Oyun Dünyası (Kütüphane, sınıf dünyaları) Altın’da duruyor; Etkinlik oyunları başlığı altın tonda (mavi-mor değil)', r.uc.kut && r.uc.dunya && !/rgb\((6\d|7\d|8\d|9\d|1[0-3]\d), ?(9\d|1[0-3]\d), ?(2[0-5]\d)\)/.test(r.e.bg), {uc: r.uc, bg: r.e.bg});
    await ctx.close();
  }

  /* ---------- Ö. öğretmen paneli ---------- */
  {
    const {p, ctx} = await sayfa({ek: {'dk-ogretmen-v1': OGRT_KAYIT}, w: 360, h: 640});
    const r = await p.evaluate(async () => { const W = (ms) => new Promise((r) => setTimeout(r, ms)); V36.ss(V36.SK, '1'); go('ogretmen'); await W(500);
      const sek = [...document.querySelectorAll('#app .og-main [role=tab]')].map((b) => b.textContent.trim()); const tabs = {};
      for (const ad of sek) { const b = [...document.querySelectorAll('#app .og-main [role=tab]')].find((x) => x.textContent.trim() === ad); b.click(); await W(400); if (ad === 'Haftalık') { OGRT.W.go(2); await W(400); } tabs[ad] = document.querySelector('#app').innerText; }
      const serit = [...document.querySelectorAll('.ogw-wk i')].map((i) => i.textContent).join(' ');
      const sub = (typeof OGRT !== 'undefined' && OGRT.SUB || []).map((x) => x[1]);
      return {sek, sub, serit, hafta: tabs['Haftalık'] || '', arac: tabs['Araçlar'] || '', tum: Object.values(tabs).join('\n')}; });
    const yasak = /Ders hazırla|Başlanmadı|Başladı|İşlendi|İşlenmedi|Durum seç|editör|Editör|yönetici|Yönetici|Onay kuyru|Yayımla/;
    ok('Ö1 Öğretmen paneli yalnız “Haftalık · Sınıflarım · Araçlar”; Araçlar yalnız “Sorun Bildir”', JSON.stringify(r.sek) === JSON.stringify(['Haftalık', 'Sınıflarım', 'Araçlar']) && JSON.stringify(r.sub) === JSON.stringify(['Sorun Bildir']), {sek: r.sek, sub: r.sub});
    ok('Ö2 Haftalık kartlarda ve hafta şeridinde başlandı/işlendi durumu (✓), “Ders hazırla”, editör/yönetici işlevi yok; plan verisi duruyor', !yasak.test(r.tum) && !/✓/.test(r.serit) && /Hafta/.test(r.hafta) && /İçeriği aç|Bağlı içerik yok/.test(r.hafta), {yasak: (r.tum.match(yasak) || [''])[0], serit: r.serit.slice(0, 80), hafta: /İçeriği aç|Bağlı içerik yok/.test(r.hafta)});
    await p.evaluate(async () => { const b = [...document.querySelectorAll('#app .og-main [role=tab]')].find((x) => /Haftalık/.test(x.textContent)); b.click(); await new Promise((r) => setTimeout(r, 300)); OGRT.W.go(2); }); await bek(400);
    await p.screenshot({path: path.join(SH, 'ogretmen-haftalik-360.png')});
    const kayit = await p.evaluate(() => JSON.parse(localStorage.getItem('dk-ogretmen-v1')));
    ok('Ö3 Öğretmen kaydı (sınıflar, planlar, eski durum alanı) korunuyor', kayit.classes.length === 2 && kayit.plans.length === 1 && kayit.status['DKAB-5-U01-O01'] === 'isl');
    await ctx.close();
  }

  /* ---------- B. Hata Bildir: küçük ekran, klavye, sunucusuz gönderim, çift gönderim ---------- */
  for (const [w, hh, mod] of [[320, 568, 'normal'], [360, 640, 'premium'], [412, 915, 'normal']]) {
    const {p, ctx} = await sayfa({w, h: hh, mod, tema: mod === 'premium' ? 'dark' : 'light'});
    await p.evaluate(async (A) => { if (A) go('pders', {pt: 'TPC-5-1-01', ptab: 'anlat'}); else go('topic', {t: 'TPC-5-1-01', tab: 'anlat'}); await new Promise((r) => setTimeout(r, 400)); V48.Bildir.ac('icerik', 'TPC-5-1-01', '', 'anlat'); }, mod === 'premium'); await bek(500);
    const gor = () => p.evaluate(() => { const bt = document.querySelector('.v-sf button.p'); if (!bt) return {yok: 1}; const r = bt.getBoundingClientRect(), e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return {ust: e === bt || bt.contains(e), alt: r.bottom <= innerHeight + 1, h: Math.round(r.height), bn: (document.getElementById('bn50') && getComputedStyle(document.getElementById('bn50')).display) || '-', bnav: getComputedStyle(document.querySelector('nav.bnav')).display, ov513: document.body.classList.contains('ov513')}; });
    const g1 = await gor();
    await p.click('.b48-kat button[data-k="Yanlış bilgi"]'); await p.fill('.b48-a textarea', 'Deneme: açıklamada eksik var.');
    await p.setViewportSize({width: w, height: Math.round(hh * 0.55)}); await bek(500);
    const g2 = await gor();
    if (w === 360) await p.screenshot({path: path.join(SH, 'bildir-klavye-360.png')});
    await p.evaluate(() => { const bt = document.querySelector('.v-sf button.p'); bt.click(); bt.click(); }); await bek(900);
    const s = await p.evaluate(() => { const L = V48.Bildir.oku().liste; return {n: L.length, d: L[0] && L[0].durum, acik: !!document.querySelector('.v-ov'), toast: [...document.querySelectorAll('.v-toast')].map((t) => t.textContent).join('|')}; });
    ok(`B1 Bildir (${w}×${hh}${mod === 'premium' ? ', Altın' : ', Elmas'}): gönder düğmesi görünür, alt menünün arkasında değil (alt menü gizli), klavye açıkken de basılabilir; ≥ 44 px`, g1.ust && g1.alt && g1.bnav === 'none' && (g1.bn === 'none' || g1.bn === '-') && g2.ust && g2.alt && g1.h >= 44, {g1, g2});
    ok(`B2 Bildir (${w}): sunucu yokken çift dokunuş tek kayıt; “bu cihazda kayıtlı” denir, “gönderildi” denmez`, s.n === 1 && s.d === 'taslak' && /bu cihazda kayıtlı/i.test(s.toast) && !/gönderildi\./i.test(s.toast), s);
    await ctx.close();
  }

  /* ---------- Y. konu ekranları: boş içerik, iki modda açılış ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    const r = await p.evaluate(async () => { const W = (ms) => new Promise((r) => setTimeout(r, ms)); const T = Store.all('topics').filter((t) => vis(t)); const bos = T.filter((t) => !t.sections && !t.content);
      const ozet = {}; bos.forEach((t) => { const k = t.grade + '-' + t.programYear; (ozet[k] = ozet[k] || []).push(t.id + ' ' + t.title); });
      const hata = []; for (const t of bos.slice(0, 40)) { try { go('topic', {t: t.id, tab: 'anlat'}); await W(60); const m = document.querySelector('#app').textContent; if (!document.querySelector('#app h1') || !/henüz hazırlanmadı/.test(m) || /Kaynak bilgisi|MEB çıktısı|bölüm ve sayfa bağlantısı|İşaretli bilgiler/.test(m)) hata.push(t.id); } catch (e) { hata.push(t.id + ':' + e.message); } }
      return {toplam: T.length, bos: bos.length, ozet, hata}; });
    OLC.bosKonular = r;
    ok('Y1 İçeriği hazırlanmamış konular (Elmas) hata vermeden açılır, “henüz hazırlanmadı” der; öğrenci kaynak iskeletini (Kaynak bilgisi, MEB çıktısı, sayfa bağlantısı) görmez; içerik üretilmedi', r.hata.length === 0, {toplam: r.toplam, bos: r.bos, hata: r.hata.slice(0, 5)});
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'premium', tema: 'dark'});
    const r = await p.evaluate(async () => { const W = (ms) => new Promise((r) => setTimeout(r, ms)); const bos = Store.all('topics').filter((t) => vis(t) && !t.sections && !t.content); const hata = [];
      for (const t of bos.slice(0, 40)) { try { go('pders', {pt: t.id, ptab: ''}); await W(60); const m = document.querySelector('#app').textContent; if (view !== 'pders' || !/henüz hazırlanmadı/.test(m) || /Kaynak bilgisi|MEB çıktısı|bölüm ve sayfa bağlantısı|İşaretli bilgiler/.test(m)) hata.push(t.id); } catch (e) { hata.push(t.id + ':' + e.message); } } return {n: bos.length, hata}; });
    ok('Y2 İçeriği hazırlanmamış konular (Altın) hata vermeden açılır, Altın’da kalır; kaynak iskeleti öğrenciye görünmez', r.hata.length === 0, r);
    await ctx.close();
  }

  /* ---------- D. Android öncesi: ekran boyutları, döndürme, taşma, alt öğeler ---------- */
  const EKR = {elmas: [['ana', "go('home')"], ['sınıf', "go('grade',{g:7})"], ['konu', "go('topic',{t:'TPC-5-1-01',tab:'anlat'})"], ['oyunlar', "go('games')"], ['profil', "go('profil46')"]],
    altin: [['koridor', "go('pdunya')"], ['sınıf', "go('psinif',{pg:7})"], ['ders', "go('pders',{pt:'TPC-5-1-01',ptab:''})"], ['oyun dünyası', "go('poyun')"], ['etkinlik', "go('games')"]]};
  const tasma = {}, kapan = {};
  for (const [w, hh] of [[320, 568], [360, 640], [412, 915], [915, 412], [800, 1280]]) {
    for (const [mod, d] of [['elmas', 'normal'], ['altin', 'premium']]) {
      const {p, ctx} = await sayfa({w, h: hh, mod: d, tema: mod === 'altin' ? 'dark' : 'light'});
      for (const [ad, js] of EKR[mod]) {
        await ac(p, js, 450);
        const r = await p.evaluate(() => { const t = document.documentElement.scrollWidth - innerWidth; let k = null; const g = document.querySelector('.kg513'); if (g) { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, document.documentElement.scrollHeight); const alt = [...document.querySelectorAll('#bn50, nav.bnav')].filter((x) => { const q = x.getBoundingClientRect(); return getComputedStyle(x).display !== 'none' && q.height > 0 && q.bottom >= innerHeight - 4 && q.width > innerWidth * 0.5; }).map((x) => x.getBoundingClientRect().top); const ust = Math.min(innerHeight, ...alt); k = Math.round(g.getBoundingClientRect().bottom - ust); } return {t, k}; });
        if (r.t > 1) tasma[`${mod} ${ad} ${w}×${hh}`] = r.t;
        if (r.k !== null && r.k > 0) kapan[`${mod} ${ad} ${w}×${hh}`] = r.k;
      }
      if (w === 915) await p.screenshot({path: path.join(SH, `${mod}-yatay-915x412.png`)});
      await ctx.close();
    }
  }
  ok('D1 320×568, 360×640, 412×915, yatay 915×412 ve tablet 800×1280’de (Elmas ve Altın: ana, sınıf, konu, oyunlar) yatay taşma yok', Object.keys(tasma).length === 0, tasma);
  ok('D2 Konu geçişi en alta kaydırınca alt menünün arkasında kalmıyor (tüm boyutlarda)', Object.keys(kapan).length === 0, kapan);
  {
    const {p, ctx} = await sayfa({w: 412, h: 915, mod: 'premium', tema: 'dark'});
    await ac(p, "go('pders',{pt:'TPC-5-1-02',ptab:''})", 500);
    await p.setViewportSize({width: 915, height: 412}); await bek(400);
    const r = await p.evaluate(() => ({view, t: G.pt, tas: document.documentElement.scrollWidth - innerWidth, kg: !!document.querySelector('.kg513'), mod: V50.Mod.aktif()}));
    await p.setViewportSize({width: 412, height: 915}); await bek(400);
    const r2 = await p.evaluate(() => ({view, t: G.pt, tas: document.documentElement.scrollWidth - innerWidth, mod: V50.Mod.aktif()}));
    ok('D3 Döndürme benzetimi (412×915 ↔ 915×412): ders ekranı ve mod korunur, taşma yok', r.view === 'pders' && r2.view === 'pders' && r.t === 'TPC-5-1-02' && r2.t === 'TPC-5-1-02' && r.tas <= 1 && r2.tas <= 1 && r.mod === 'altin' && r2.mod === 'altin', {r, r2});
    // :has() yedeği: alt pencere açıkken body.ov513
    const ov = await p.evaluate(async () => { UI.sheet('<p>deneme</p>', 'Deneme'); await new Promise((r) => setTimeout(r, 300)); const a = document.body.classList.contains('ov513'); UI.close(); await new Promise((r) => setTimeout(r, 500)); return {a, b: document.body.classList.contains('ov513')}; });
    ok('D4 Alt pencere açıkken alt menü gizleme :has() desteklemeyen WebView için JS sınıfıyla da çalışır (body.ov513)', ov.a && !ov.b, ov);
    await ctx.close();
  }
  {
    // Elmas oyunu 360×640'ta: taşma yok, cevap düğmeleri ≥ 44 px
    const {p, ctx} = await sayfa({w: 360, h: 640, mod: 'normal'});
    const r = await p.evaluate(async () => { go('games'); await new Promise((r) => setTimeout(r, 300)); document.querySelector('#app [onclick*=playGame]').click(); await new Promise((r) => setTimeout(r, 600)); const B = [...document.querySelectorAll('#app button')].filter((b) => b.offsetParent); return {view, tas: document.documentElement.scrollWidth - innerWidth, kucuk: B.filter((b) => b.getBoundingClientRect().height < 40).map((b) => b.textContent.trim().slice(0, 20)).slice(0, 6)}; });
    await p.screenshot({path: path.join(SH, 'elmas-oyun-360.png')});
    ok('D5 Elmas etkinlik oyunu 360×640: taşma yok', r.view === 'game' && r.tas <= 1, r);
    await ctx.close();
  }

  ok('Z Sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); srv.close();
  const g = S.filter((x) => x.ok).length;
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({S, OLC}, null, 1));
  console.log(`\n${g}/${S.length} kontrol geçti`);
  if (S.some((x) => !x.ok)) { console.log('KALDI: ' + S.filter((x) => !x.ok).map((x) => x.ad).join(' | ')); process.exitCode = 1; }
})();
