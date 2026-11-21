// V51.7 rehber testleri (depo kökünden): node tests/v51_7/test_v517.js
// Yerel http sunucusu + başsız Chromium. Ekran görüntüleri: docs/V51.7_ekran/. Tarayıcı otomasyonu gerçek cihaz testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v51.7.html', F0 = 'surumler/din-kulturu-platformu-v51.6.html';
const SH = path.join(ROOT, 'docs', 'V51.7_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 380) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const W = 'const W=(ms)=>new Promise((r)=>setTimeout(r,ms));';

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = 'http://127.0.0.1:' + srv.address().port + '/' + F;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  // o.mod: 'yeni' (hiç seçim yok) | 'normal' | 'premium'; o.rehber: dk-rehber517 başlangıç değeri
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, mod: 'yeni', rehber: null, ek: null}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1'); if (o.mod !== 'yeni') localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); if (o.rehber) localStorage.setItem('dk-rehber517', JSON.stringify(o.rehber)); if (o.ek) for (const k in o.ek) localStorage.setItem(k, o.ek[k]); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL); await p.waitForTimeout(1900);
    return {p, ctx};
  };
  const durum = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('dk-rehber517') || 'null'));
  const modal = (p) => p.evaluate(() => { const m = document.getElementById('rh517-m'); if (!m) return null; const k = m.querySelector('.rh517-k'); return {tema: (k.className.match(/rh517-(genel|elmas|altin)/) || [])[1], say: (m.querySelector('.rh517-say') || {}).textContent, b: (m.querySelector('h2') || {}).textContent, nok: m.querySelectorAll('.rh517-nok i').length}; });
  const tikla = (p, a) => p.evaluate((a) => { const x = document.querySelector('#rh517-m [data-a="' + a + '"], #rh517-bal [data-a="' + a + '"]'); if (x) x.click(); return !!x; }, a);
  const bal = (p) => p.evaluate(() => { const b = document.getElementById('rh517-bal'), h = document.getElementById('rh517-h'); if (!b) return null; const r = b.getBoundingClientRect(), q = h.getBoundingClientRect(), vh = window.visualViewport ? visualViewport.height : innerHeight; const nav = [...document.querySelectorAll('nav.bnav, #bn50')].filter((n) => n.offsetParent && getComputedStyle(n).display !== 'none').map((n) => n.getBoundingClientRect()); const kes = (a, c) => a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top; return {id: V51.Rehber._b && V51.Rehber._b.id, m: b.querySelector('p').textContent, ad: b.querySelector('.rh517-bb b').textContent, icinde: r.left >= 0 && r.right <= innerWidth + 0.5 && r.top >= 0 && r.bottom <= vh + 0.5, hedefiKapatmaz: !kes(r, q), navKapatmaz: nav.every((n) => !kes(r, n)), ring: {w: q.width, h: q.height}, tema: (b.className.match(/rh517-(elmas|altin|ogretmen|editor)/) || [])[1]}; });

  /* ---------- A. derleme ---------- */
  const h1 = AC(fs.readFileSync(path.join(ROOT, F), 'utf8')), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  ok('A1 sürüm V51.7, index.html aynı; veri blokları V51.6 ile bayt bayt aynı; önceki sürüm dosyaları ve V51.6 APK’sı değişmedi', /V31\.VER="V51\.7"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === fs.readFileSync(path.join(ROOT, F), 'utf8') && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && cp.execSync('git status --porcelain surumler/ apk/din-kulturu-v51.6.apk apk/din-kulturu-v36.0.apk', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v51.7')).length === 0);
  ok('A2 Rehber sistemi harici kütüphane/ağ kaynağı kullanmaz (rehber kodunda http adresi yok)', !/https?:\/\//.test(fs.readFileSync(path.join(ROOT, 'tools/v51_7/v517_rehber.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')));

  /* ---------- 1–2. ilk açılış tanıtımı ---------- */
  {
    const {p, ctx} = await sayfa({});
    const m1 = await modal(p), uye = await p.evaluate(() => !!document.getElementById('uye39'));
    await p.screenshot({path: path.join(SH, 'ilk-acilis-tanitim-1.png')});
    const adimlar = [m1.b];
    for (let i = 0; i < 3; i++) { await tikla(p, 'sonraki'); await bek(120); adimlar.push((await modal(p)).b); }
    await p.screenshot({path: path.join(SH, 'ilk-acilis-tanitim-4.png')});
    await tikla(p, 'onceki'); await bek(100); const geri = (await modal(p)).say;
    await tikla(p, 'sonraki'); await tikla(p, 'bitir'); await bek(400);
    const d = await durum(p), sonra = await p.evaluate(() => ({m: !!document.getElementById('rh517-m'), uye: !!document.getElementById('uye39')}));
    ok('T1 İlk kurulumda genel tanıtım gösterilir (seçim ekranının üstünde): 4 kısa adım, ilerleme göstergesi, Önceki/Sonraki, Başla', m1 && m1.tema === 'genel' && m1.say === '1 / 4' && m1.nok === 4 && uye && adimlar.length === 4 && new Set(adimlar).size === 4 && geri === '3 / 4' && !sonra.m && sonra.uye && d.r.genel.d === 'tamam', {adimlar});
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({});
    await tikla(p, 'atla'); await bek(400);
    const once = await p.evaluate(() => ({m: !!document.getElementById('rh517-m'), uye: !!document.getElementById('uye39')}));
    await p.click('#uye39 .uye39-b.cn'); await bek(1500);
    const r = await p.evaluate(() => ({view, mod: V50.Mod.aktif(), d: JSON.parse(localStorage.getItem('dk-rehber517')).r.genel.d}));
    ok('T2 Tanıtım atlanınca uygulama normal açılır: seçim ekranı kullanılabilir, Elmas seçilip ana sayfa açılır; durum “atlandi”', !once.m && once.uye && r.view === 'home' && r.mod === 'elmas' && r.d === 'atlandi', r);
    const mm = await modal(p);
    ok('T4 Elmas moduna ilk girişte Elmas rehberi (Elmas renkleriyle) gösterilir', mm && mm.tema === 'elmas' && /Elmas/.test(mm.b), mm);
    await p.screenshot({path: path.join(SH, 'elmas-mod-rehberi.png')});
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'premium', rehber: {v: 1, otomatik: true, r: {genel: {d: 'tamam'}}}});
    const mm = await modal(p);
    await p.screenshot({path: path.join(SH, 'altin-mod-rehberi.png')});
    const metin = await p.evaluate(async () => { const T = []; for (let i = 0; i < 8; i++) { const m = document.getElementById('rh517-m'); if (!m) break; T.push(m.querySelector('h2').textContent + ': ' + m.querySelector('p').textContent); const s = m.querySelector('[data-a="sonraki"]'); if (!s) break; s.click(); await new Promise((r) => setTimeout(r, 80)); } return T; });
    ok('T3 Altın moduna ilk girişte Altın rehberi (Altın renkleriyle) gösterilir; Altın’a özel oyunlar ve Etkinlik Oyunları ayrı anlatılır', mm && mm.tema === 'altin' && metin.length === 7 && metin.some((x) => /Altın’a özel oyunlar/.test(x) && /Kütüphane/.test(x)) && metin.some((x) => /^Etkinlik Oyunları/.test(x)), metin.map((x) => x.split(':')[0]));
    await tikla(p, 'bitir'); await bek(300);
    // T5: Altın tamam → Elmas'a geç → Elmas rehberi yine çıkar; Altın durumu değişmez
    await p.evaluate(() => V50.Mod.gec('elmas')); await bek(1500);
    const mm2 = await modal(p), d = await durum(p);
    ok('T5 Altın ve Elmas rehberleri bağımsız: Altın tamamlandıktan sonra Elmas’a ilk girişte Elmas rehberi ayrıca çıkar; Altın’ın durumu değişmez', mm2 && mm2.tema === 'elmas' && d.r['mod.altin'].d === 'tamam' && !d.r['mod.elmas'], {mm2, altin: d.r['mod.altin'], elmas: d.r['mod.elmas'] || null});
    await ctx.close();
  }

  /* ---------- 6. bölüm baloncukları ---------- */
  const TAMAM = {v: 1, otomatik: true, r: {genel: {d: 'tamam'}, 'mod.elmas': {d: 'tamam'}, 'mod.altin': {d: 'tamam'}}};
  {
    const {p, ctx} = await sayfa({mod: 'normal', rehber: TAMAM});
    await bek(400);
    const b1 = await bal(p);
    await p.screenshot({path: path.join(SH, 'elmas-ana-baloncuk-arama.png')});
    const adim = [b1 && b1.m];
    for (let i = 0; i < 6; i++) { const t = await p.evaluate(() => { const x = document.querySelector('#rh517-bal [data-a="sonraki"]'); if (x) { x.click(); return 1; } return 0; }); if (!t) break; await bek(450); const x = await bal(p); adim.push(x && x.m); if (i === 1) await p.screenshot({path: path.join(SH, 'elmas-ana-baloncuk-oyunlar.png')}); }
    const sonB = await bal(p);
    await tikla(p, 'tamam'); await bek(300);
    ok('T6a Elmas ana sayfa: arama alanı ve alt menü (Derslerim, Oyunlar, Çalışmam, Profilim) sırayla vurgulanır; kutu ekranda, hedefi ve alt menüyü kapatmaz', b1 && b1.id === 'elmas.ana' && /arayabilirsin/.test(b1.m) && b1.icinde && b1.hedefiKapatmaz && adim.some((x) => /Derslerim/.test(x || '')) && adim.some((x) => /Oyunlar/.test(x || '')) && adim.some((x) => /Çalışmam/.test(x || '')) && adim.some((x) => /Profilim/.test(x || '')) && sonB.icinde && sonB.hedefiKapatmaz, {adim, b1: b1 && {icinde: b1.icinde, k: b1.hedefiKapatmaz, nav: b1.navKapatmaz}});
    await p.evaluate(() => go('classes')); await bek(1100); const b2 = await bal(p);
    await tikla(p, 'tamam'); await p.evaluate(() => go('games')); await bek(1100); const b3 = await bal(p);
    await p.screenshot({path: path.join(SH, 'elmas-oyunlar-baloncuk.png')});
    ok('T6b Derslerim ve Oyunlar bölümlerine ilk girişte kendi baloncukları çıkar (gerçek öğeleri işaretler); alt menünün üstüne binmez', b2 && b2.id === 'elmas.derslerim' && b2.icinde && b2.hedefiKapatmaz && b2.navKapatmaz && b3 && b3.id === 'elmas.oyun' && /Etkinlik Oyunları/.test(b3.m) && b3.navKapatmaz, {b2: b2 && b2.id, b3: b3 && b3.id});
    // Bana tekrar göster
    await tikla(p, 'tekrar'); await bek(200); const dt = (await durum(p)).r['elmas.oyun'].d;
    await p.evaluate(() => go('home')); await bek(1100); await tikla(p, 'kapat'); await p.evaluate(() => go('games')); await bek(1100); const b4 = await bal(p);
    ok('T6c “Bana tekrar göster”: rehber bir sonraki girişte yeniden çıkar', dt === 'tekrar' && b4 && b4.id === 'elmas.oyun', {dt, b4: b4 && b4.id});
    // 9: bir daha gösterme + yeniden başlatma
    await tikla(p, 'kapali'); await bek(200);
    await p.reload(); await p.waitForTimeout(1900);
    await p.evaluate(() => go('games')); await bek(1200); const b5 = await bal(p);
    await p.evaluate(() => go('calis45')); await bek(1200); const b6 = await bal(p);
    ok('T9 “Bir daha gösterme” uygulama yeniden açılınca korunur (Oyunlar baloncuğu çıkmaz); diğer bölümün (Çalışmam) rehberi etkilenmez', !b5 && b6 && b6.id === 'elmas.calis', {b5: b5 && b5.id, b6: b6 && b6.id});
    // oyun ekranı ve öğretmen görünümünde öğrenci baloncuğu yok
    await tikla(p, 'kapat');
    const yok = await p.evaluate(async () => { const W = (ms) => new Promise((r) => setTimeout(r, ms)); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: true, r: {genel: {d: 'tamam'}, 'mod.elmas': {d: 'tamam'}}})); go('games'); await W(400); document.querySelector('#rh517-bal [data-a="kapat"]') && document.querySelector('#rh517-bal [data-a="kapat"]').click(); document.querySelector('#app [onclick^="playGame"]').click(); await W(1300); const oyun = !!document.getElementById('rh517-bal'); V36.ss(V36.SK, '1'); V51.Gorunum.ac('TPC-5-1-01'); await W(1300); return {oyun, ogrGorunum: V51.Rehber._b ? V51.Rehber._b.id : null, kip: V51.Gorunum.kip()}; });
    ok('T6d Oyun oynarken ve öğretmen görünümünde öğrenci baloncukları çıkmaz', !yok.oyun && !(yok.ogrGorunum || '').startsWith('elmas') && yok.kip === 'ogretmen', yok);
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'premium', rehber: TAMAM});
    await bek(500); const b1 = await bal(p);
    await p.screenshot({path: path.join(SH, 'altin-koridor-baloncuk.png')});
    await tikla(p, 'kapat');
    await p.evaluate(() => V39.ara()); await bek(1200); const b2 = await bal(p);
    await p.screenshot({path: path.join(SH, 'altin-arama-baloncuk.png')});
    await tikla(p, 'kapat'); await p.evaluate(() => UI.close()); await bek(500);
    await p.evaluate(() => go('poyun')); await bek(1200); const b3 = await bal(p);
    ok('T6e Altın: koridorda arama düğmesi Altın renkli baloncukla vurgulanır; arama penceresinde arama alanı; Oyun Dünyası’nda Altın’a özel oyunlar', b1 && b1.id === 'altin.ana' && b1.tema === 'altin' && b1.icinde && b2 && b2.id === 'altin.arama' && b2.icinde && b3 && b3.id === 'altin.oyun' && /Altın’a özel/.test(b3.m), {b1: b1 && b1.id, b2: b2 && b2.id, b3: b3 && b3.id});
    await ctx.close();
  }

  /* ---------- 7–8. öğretmen ve editör ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'normal', rehber: TAMAM});
    const r = await p.evaluate(async () => {
      const W = (ms) => new Promise((r) => setTimeout(r, ms)), id = () => (V51.Rehber._b ? V51.Rehber._b.id : null), kapat = () => { const x = document.querySelector('#rh517-bal [data-a="kapat"]'); if (x) x.click(); };
      const R = {}; await W(500); kapat();
      R.ogrenciMerkez = V51.Rehber.gorunurGruplar().map((g) => g.k);
      go('editor'); await W(1200); R.pinEkrani = id();
      V36.ss(V36.SK, '1'); go('home'); await W(1200); R.ogrOturumOgrenciEkrani = id(); kapat();
      go('ogretmen'); await W(1300); R.ogretmen = id(); R.ogrTema = (document.getElementById('rh517-bal') || {}).className; R.yb = !!document.querySelector('.og-top .rh517-yb');
      R.ogrMerkez = V51.Rehber.gorunurGruplar().map((g) => g.k);
      return R;
    });
    await p.screenshot({path: path.join(SH, 'ogretmen-paneli-baloncuk.png')});
    const r2 = await p.evaluate(async () => {
      const W = (ms) => new Promise((r) => setTimeout(r, ms)), id = () => (V51.Rehber._b ? V51.Rehber._b.id : null);
      const R = {}; const ad = []; for (let i = 0; i < 6; i++) { const x = document.querySelector('#rh517-bal [data-a="sonraki"], #rh517-bal [data-a="tamam"]'); if (!x) break; ad.push(document.querySelector('#rh517-bal p').textContent.slice(0, 30)); x.click(); await W(500); }
      R.panelAdim = ad; await W(800); R.sonraki = id();
      const sek = [...document.querySelectorAll('#app .og-main [role=tab]')].find((x) => /Araçlar/.test(x.textContent)); sek.click(); await W(1200); R.araclar = id();
      sessionStorage.setItem('dk-editor-oturum38', '1'); for (let i = 0; i < 60 && !V38.isReady; i++) await W(100); go('editor'); await W(1300); R.editor = id(); R.edTema = (document.getElementById('rh517-bal') || {}).className; R.edMerkez = V51.Rehber.gorunurGruplar().map((g) => g.k);
      return R;
    });
    await p.screenshot({path: path.join(SH, 'editor-paneli-baloncuk.png')});
    ok('T7 Öğretmen rehberi yalnız öğretmen alanında: öğrenci ekranında çıkmaz, öğretmen panelinde çıkar (öğretmen teması, “Rehber” düğmesi); öğrenci rehber merkezinde öğretmen/editör yok', r.ogretmen === 'ogretmen.panel' && /rh517-ogretmen/.test(r.ogrTema) && r.yb && !String(r.ogrOturumOgrenciEkrani || '').startsWith('ogretmen') && !r.ogrenciMerkez.includes('ogretmen') && !r.ogrenciMerkez.includes('editor') && r.ogrMerkez.includes('ogretmen') && !r.ogrMerkez.includes('editor') && r2.araclar && /^ogretmen\.(araclar|hata)$/.test(r2.araclar), {r, panelAdim: r2.panelAdim, araclar: r2.araclar});
    ok('T8 Editör rehberi yalnız editör alanında ve oturumla: PIN ekranında çıkmaz, editör panelinde çıkar (editör teması); merkezde editör rehberi yalnız editör oturumunda', !r.pinEkrani && r2.editor === 'editor.ana' && /rh517-editor/.test(r2.edTema) && r2.edMerkez.includes('editor'), {pin: r.pinEkrani, ed: r2.editor});
    // editör alt ekranları: toplu işlemler, kaynak ve onay
    const r3 = await p.evaluate(async () => {
      const W = (ms) => new Promise((r) => setTimeout(r, ms)), id = () => (V51.Rehber._b ? V51.Rehber._b.id : null), kapat = () => { const x = document.querySelector('#rh517-bal [data-a="tamam"], #rh517-bal [data-a="kapat"]'); if (x) x.click(); };
      const R = {}; kapat(); V38.edGo({k: 'bekleyen', cid: '', mode: ''}); await W(1300); R.liste = id(); kapat(); await W(1200); R.liste2 = id();
      kapat(); document.querySelector('#app .ed38-row').click(); await W(1400); R.kayit = id(); kapat(); await W(1200); R.kayit2 = id(); return R;
    });
    ok('T8b Editör: inceleme listesi → içerik inceleme ve toplu işlemler; kayıt ekranı → kaynak/doğrulama ve onay/düzeltme rehberleri', r3.liste === 'editor.inceleme' && r3.liste2 === 'editor.toplu' && r3.kayit === 'editor.kaynak' && r3.kayit2 === 'editor.onay', r3);
    await ctx.close();
  }

  /* ---------- 10–11. rehber merkezi ve sıfırlama ---------- */
  {
    const ek = {dk2: JSON.stringify({patch: {}, added: {}, prog: {'DKAB-5-U01-O01': {correct: 4, wrong: 1, mastery: 0.8}}, cards: {'FC-1': {box: 3}}, wrong: {}, gscore: {g1: {best: 90}}}), 'dk-ilerleme39': JSON.stringify({fav: {s: [5], k: ['TPC-5-1-01']}, ipucu40: 1, t: {'TPC-5-1-01': {s: 3}}}), 'dk-editor-gecmis515': JSON.stringify({v: 1, liste: [{t: '2026-11-01', o: 'giris'}]}), 'dk-oyun41': JSON.stringify({v: 1, oyunlar: {kutuphane: {b1: {yildiz: 3}}}})};
    const {p, ctx} = await sayfa({mod: 'normal', rehber: {v: 1, otomatik: true, r: {genel: {d: 'tamam'}, 'mod.elmas': {d: 'tamam'}, 'elmas.ana': {d: 'tamam'}, 'elmas.profil': {d: 'tamam'}, 'elmas.oyun': {d: 'kapali'}}}, ek});
    await p.evaluate(() => go('profil46')); await bek(1200);
    const kart = await p.evaluate(() => !!document.querySelector('#app .rh517-prof'));
    await p.evaluate(() => V51.Rehber.merkez()); await bek(600);
    const merkez = await p.evaluate(() => ({gruplar: [...document.querySelectorAll('.rh517-lis li')].map((li) => li.querySelector('b').textContent + ' — ' + li.querySelector('small').textContent), oto: !!document.querySelector('.rh517-oto input:checked')}));
    await p.screenshot({path: path.join(SH, 'kullanim-rehberi-merkezi.png')});
    await p.evaluate(() => V51.Rehber.goster('oyun')); await bek(1500);
    const yeniden = await bal(p);
    await tikla(p, 'kapat');
    await p.evaluate(() => V51.Rehber.goster('genel')); await bek(800); const tanit = await modal(p); await tikla(p, 'atla'); await bek(200);
    ok('T10 Profilim’de “Kullanım Rehberi”; merkezde istenen başlıklar; “Bir daha gösterme” denmiş Oyunlar rehberi “Göster” ile yeniden açılır; tanıtım yeniden izlenebilir', kart && ['Uygulamayı tanı', 'Altın Sınıfı rehberi', 'Elmas Sınıfı rehberi', 'Dersler ve konu anlatımları', 'Arama kullanımı', 'Oyunlar ve etkinlikler', 'Çalışma takibi'].every((x) => merkez.gruplar.some((g) => g.startsWith(x))) && merkez.oto && yeniden && yeniden.id === 'elmas.oyun' && tanit && tanit.tema === 'genel', {merkez: merkez.gruplar, yeniden: yeniden && yeniden.id});
    const once = await p.evaluate(() => { const o = {}; Object.keys(localStorage).filter((k) => k !== 'dk-rehber517').forEach((k) => { o[k] = localStorage.getItem(k); }); return o; });
    await p.evaluate(async () => { V51.Rehber.merkez(); await new Promise((r) => setTimeout(r, 500)); document.querySelector('.rh517-sif').click(); await new Promise((r) => setTimeout(r, 500)); document.querySelector('#v38-cok').click(); await new Promise((r) => setTimeout(r, 600)); });
    const sonra = await p.evaluate(() => { const o = {}; Object.keys(localStorage).filter((k) => k !== 'dk-rehber517').forEach((k) => { o[k] = localStorage.getItem(k); }); return {o, r: JSON.parse(localStorage.getItem('dk-rehber517'))}; });
    const fark = Object.keys(Object.assign({}, once, sonra.o)).filter((k) => once[k] !== sonra.o[k] && !/^(dk-mod50|dk2)$/.test(k));
    const dk2ok = JSON.parse(sonra.o.dk2).prog['DKAB-5-U01-O01'].correct === 4 && JSON.parse(sonra.o.dk2).cards['FC-1'].box === 3 && JSON.parse(sonra.o.dk2).gscore.g1.best === 90;
    ok('T11 “Tüm rehberleri yeniden başlat” yalnız rehber tercihlerini sıfırlar: ders ilerlemesi, kart kutuları, oyun puanları, favoriler, oyun kayıtları ve editör kayıtları aynı', Object.keys(sonra.r.r).length === 0 && sonra.r.otomatik === true && fark.length === 0 && dk2ok, {fark, r: sonra.r});
    await ctx.close();
  }

  /* ---------- 12. Android ekranları ve klavye ---------- */
  for (const [w, hh] of [[360, 640], [412, 915], [915, 412]]) {
    const {p, ctx} = await sayfa({w, h: hh});
    const m = await p.evaluate(() => { const k = document.querySelector('#rh517-m .rh517-k').getBoundingClientRect(); const B = [...document.querySelectorAll('#rh517-m button')].map((b) => b.getBoundingClientRect()); return {icinde: k.left >= 0 && k.right <= innerWidth && k.top >= 0 && k.bottom <= innerHeight + 0.5, tas: document.documentElement.scrollWidth - innerWidth, dugme: B.every((r) => r.height >= 40)}; });
    if (w === 360) await p.screenshot({path: path.join(SH, 'android-360-tanitim.png')});
    await tikla(p, 'atla'); await p.click('#uye39 .uye39-b.cn'); await bek(1300); await tikla(p, 'atla'); await bek(1300);
    const b1 = await bal(p);
    if (w === 360) await p.screenshot({path: path.join(SH, 'android-360-baloncuk.png')});
    ok(`T12 ${w}×${hh}: tanıtım penceresi ekrana sığar, düğmeler ≥ 40 px, yatay taşma yok; baloncuk ekranda, hedefi ve alt menüyü kapatmaz`, m.icinde && m.tas <= 1 && m.dugme && b1 && b1.icinde && b1.hedefiKapatmaz && b1.navKapatmaz, {m, b1});
    await ctx.close();
  }
  {
    // klavye açık: görünür alan küçülünce pencere kaydırılabilir ve düğmelere ulaşılır
    const {p, ctx} = await sayfa({w: 360, h: 640});
    await p.setViewportSize({width: 360, height: 300}); await bek(400);
    const r = await p.evaluate(async () => { const k = document.querySelector('#rh517-m .rh517-k'); const q = k.getBoundingClientRect(); k.scrollTop = 9999; await new Promise((r) => setTimeout(r, 100)); const btn = k.querySelector('.rh517-p').getBoundingClientRect(); return {sigar: q.top >= 0 && q.bottom <= innerHeight + 0.5, kaydir: k.scrollHeight > k.clientHeight, dugme: btn.bottom <= innerHeight && btn.top >= 0}; });
    ok('T12b Klavye açıkken (görünür alan 300 px) tanıtım penceresi ekranda kalır, içinde kaydırılır ve düğmelere ulaşılır', r.sigar && r.dugme, r);
    await ctx.close();
  }

  /* ---------- 13. internetsiz ---------- */
  {
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(() => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: true, r: {genel: {d: 'tamam'}}})); });
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message));
    await p.goto(URL); await p.waitForTimeout(600);
    await ctx.setOffline(true); const istek = []; p.on('request', (q) => { if (!q.url().startsWith('data:') && !q.url().startsWith('blob:')) istek.push(q.url()); });
    await bek(1500);
    const mm = await modal(p); await tikla(p, 'bitir'); for (let i = 0; i < 6; i++) await tikla(p, 'sonraki'); await tikla(p, 'bitir'); await bek(1200);
    const b1 = await bal(p);
    ok('T13 İnternet bağlantısı yokken rehberler çalışır (mod rehberi ve baloncuk açılır, ağ isteği yapılmaz)', mm && mm.tema === 'elmas' && b1 && b1.id === 'elmas.ana' && istek.length === 0, {istek: istek.slice(0, 3)});
    await ctx.close();
  }
  {
    // rehber hatası uygulamayı durdurmaz; otomatik kapalıyken hiçbir şey kendiliğinden çıkmaz
    const {p, ctx} = await sayfa({mod: 'normal', rehber: {v: 1, otomatik: false}});
    const r = await p.evaluate(async () => { const W = (ms) => new Promise((r) => setTimeout(r, ms)); const a = !!document.getElementById('rh517-m') || !!document.getElementById('rh517-bal'); V51.Rehber.bolumler = () => { throw new Error('deneme'); }; go('classes'); await W(1200); return {a, view, kart: document.querySelectorAll('#app .gc3').length}; });
    ok('T14 “Rehberleri kendiliğinden göster” kapalıyken hiçbir rehber çıkmaz; rehber kodu hata verse de gezinme sürer', !r.a && r.view === 'classes' && r.kart >= 9, r);
    await ctx.close();
  }

  ok('Z Sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); srv.close();
  const g = S.filter((x) => x.ok).length;
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify(S, null, 1));
  console.log(`\n${g}/${S.length} kontrol geçti`);
  if (g !== S.length) { console.log('KALDI: ' + S.filter((x) => !x.ok).map((x) => x.ad).join(' | ')); process.exitCode = 1; }
})().catch((e) => { console.error(e); process.exit(1); });
