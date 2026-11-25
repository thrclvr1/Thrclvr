// V53.0 testleri (depo kökünden): node tests/v53/test_v530.js
// Tarayıcı (yerel http) ve APK benzetimi (appassets kökeni + sahte DKAndroid: 'hesap-sec' → window.__eposta; yedek köprüsü sahte).
// Gerçek telefon, gerçek Google hesabı ve gerçek Android yedeği burada DENENEMEZ. Ekran görüntüleri: docs/V53.0_ekran/.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v53.0.html', F0 = 'surumler/din-kulturu-platformu-v52.3.html';
const SH = path.join(ROOT, 'docs', 'V53.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 500) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const APK = 'https://appassets.androidplatform.net';
const A_EP = 'ayse.deneme@example.com', B_EP = 'baris.deneme@example.com', C_EP = 'cem.deneme@example.com';

(async () => {
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v53.0'));
  ok('A1 sürüm V53.0, index.html aynı; veri/müzik/görsel blokları V52.3 ile bayt bayt aynı (içerik, müfredat, soru havuzu silinmedi); eski sürüm dosyaları ve APK’lar değişmedi', /V31\.VER="V53\.0"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && degisen.length === 0, degisen);
  ok('A2 HTML’de Gmail adresi ve açık PIN yok; Altın merkezi ayarı hâlâ kapalı (ACIK: false)', !/@gmail\.com/.test(h1) && !h1.includes('030792') && /ACIK: false,/.test(h1));

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const b = await chromium.launch();
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, apk: false, dosya: F, ek: null, dpr: 1}, o || {});
    const html = fs.readFileSync(path.join(ROOT, o.dosya));
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true, deviceScaleFactor: o.dpr});
    await ctx.route('https://accounts.google.com/**', (r) => r.abort()); await ctx.route('https://www.googleapis.com/**', (r) => r.abort());
    if (o.apk) await ctx.route(APK + '/assets/index.html', (r) => r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: html}));
    await ctx.addInitScript(([o]) => {
      if (!localStorage.getItem('__s')) {
        localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1');
        localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true}));
        localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false}));
        if (o.ek) for (const k in o.ek) localStorage.setItem(k, o.ek[k]);
      }
      if (o.ses) for (const k in o.ses) sessionStorage.setItem(k, o.ses[k]);
      if (!o.apk) return;
      const dinleyici = []; window.__giden = [];
      const yan = (y) => setTimeout(() => dinleyici.forEach((f) => f({data: JSON.stringify(y)})), 50);
      window.DKAndroid = {postMessage(m) { const x = JSON.parse(m); window.__giden.push(x.tur); if (x.tur === 'hesap-sec') yan(window.__eposta ? {tur: 'hesap-sec', ok: true, eposta: window.__eposta} : {tur: 'hesap-sec', ok: false, hata: 'iptal'}); if (x.tur === 'yedek-oku') yan({tur: 'yedek-oku', ok: false}); }, addEventListener(t, f) { if (t === 'message') dinleyici.push(f); }};
    }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (er) => HATA.push(er.message));
    await p.goto(o.apk ? APK + '/assets/index.html' : ORIGIN + '/' + o.dosya); await p.waitForTimeout(2300);
    return {p, ctx};
  };
  const sinifSec = (p, n) => p.evaluate((n) => V53.Hesap.sinifSec(n), n);
  const googleGir = async (p, ep) => { await p.evaluate((ep) => { window.__eposta = ep; V46.Hesap.googleGiris(); }, ep); await bek(900); };
  const profil = async (p) => { await p.evaluate(() => go('profil46')); await bek(700); return p.evaluate(() => ({ust: ((document.querySelector('.pr49-ust') || {}).innerText || '').replace(/\s+/g, ' '), kart: ((document.querySelector('.pr53') || {}).innerText || '').replace(/\s+/g, ' ')})); };
  const ilerleme = (p) => p.evaluate(() => Object.keys(Store.ov.prog || {}).length);

  /* ---------- H: hesap ve profil ---------- */
  {
    const {p, ctx} = await sayfa({apk: true, ek: {'dk-giris523': JSON.stringify({v: 1, tur: 'misafir'})}});
    await sinifSec(p, 8); await bek(300);
    const m = await profil(p);
    ok('H1 Misafir: profil kartında “Misafir öğrenci” ve “Misafir · bu cihazda”; hesap türü “Misafir”', /Misafir öğrenci/.test(m.ust) && /Misafir · bu cihazda/.test(m.ust) && /Misafir \(hesapsız\)/.test(m.kart), m);
    // misafir ilerlemesi → Google hesabına taşınır
    await p.evaluate(() => { Prog.rec(['DKAB-8-U01-O01'], true); Prog.rec(['DKAB-8-U01-O02'], false); Store.save(); });
    const once = await ilerleme(p);
    await googleGir(p, A_EP);
    const g = await profil(p);
    await p.screenshot({path: path.join(SH, 'profil-google.png')});
    ok('H2 Google ile giriş yapan kullanıcı artık “Misafir öğrenci” görünmez: adı (yoksa e-postası) ve “Google hesabı · bu cihazda”; e-posta hesap bilgilerinde', !/Misafir öğrenci/.test(g.ust) && g.ust.includes(A_EP) && /Google hesabı · bu cihazda/.test(g.ust) && g.kart.includes(A_EP) && /Google hesabı/.test(g.kart), g);
    const tasindi = await ilerleme(p);
    ok('H3 Misafirken yapılan ilerleme Google hesabına taşınır (kaybolmaz)', once === 2 && tasindi === 2, {once, tasindi});
    await p.evaluate(() => { V53.Hesap.takmaAc(); }); await bek(400);
    await p.fill('#pr53-t', 'Ayşe Nur'); await p.evaluate(() => V53.Hesap.takmaKaydet()); await bek(600);
    const t = await profil(p);
    await p.screenshot({path: path.join(SH, 'profil-takma-ad.png')});
    const hes = await p.evaluate(() => V46.Hesap.oku().kullanici);
    ok('H4 Takma ad belirlenir ve profilde görünür; Google hesap bilgisi (ad/e-posta) değişmez', /Ayşe Nur/.test(t.ust) && /Ayşe Nur/.test(t.kart) && hes.eposta === 'ayse.deneme@example.com' && hes.ad === 'ayse.deneme@example.com', {ust: t.ust.slice(0, 120)});
    // hesap değiştirme: A → çıkış → B → A
    await p.evaluate(async () => { await V46.Hesap.cikis(); }); await bek(500);
    const misafirSonra = await ilerleme(p);
    await p.evaluate(() => { V52.Giris.misafir(); }); await bek(300);
    await googleGir(p, B_EP);
    const bIlk = await ilerleme(p), bProf = await profil(p);
    await p.evaluate(() => { Prog.rec(['DKAB-9-U01-O01'], true); Store.save(); });
    await p.evaluate(async () => { await V46.Hesap.cikis(); }); await bek(500);
    await p.evaluate(() => { V52.Giris.misafir(); }); await bek(300);
    await googleGir(p, A_EP);
    const aGeri = await p.evaluate(() => Object.keys(Store.ov.prog || {}).sort()), aProf = await profil(p);
    ok('H5 Hesaplar karışmaz: A çıkınca cihaz boş misafire döner; B kendi (boş) ilerlemesiyle başlar, A’nın takma adını görmez; A geri girince yalnız kendi ilerlemesi ve takma adı gelir',
      misafirSonra === 0 && bIlk === 0 && !/Ayşe Nur/.test(bProf.ust) && bProf.ust.includes(B_EP) && JSON.stringify(aGeri) === JSON.stringify(['DKAB-8-U01-O01', 'DKAB-8-U01-O02']) && /Ayşe Nur/.test(aProf.ust), {misafirSonra, bIlk, aGeri});
    await ctx.close();
  }
  /* ---------- S: sınıf seçimi ---------- */
  {
    const {p, ctx} = await sayfa({apk: true, dpr: 2});
    const g0 = await p.evaluate(() => !!document.getElementById('gir523'));
    await p.click('#gir523 .g523-m'); await bek(500);
    const s0 = await p.evaluate(() => ({ov: !!document.getElementById('sn53'), gor: [...document.body.children].filter((x) => !['sn53', 'gir523'].includes(x.id) && getComputedStyle(x).visibility === 'visible' && x.getBoundingClientRect().height > 0).length, btn: document.querySelectorAll('#sn53 .sn53-s').length}));
    await p.screenshot({path: path.join(SH, 'sinif-secimi.png')});
    ok('S1 İlk açılış: giriş ekranından sonra “Hangi sınıfta okuyorsun?” (4–12, 9 seçenek); seçmeden içerik görünmez', g0 && s0.ov && s0.gor === 0 && s0.btn === 9, s0);
    await p.click('#sn53 .sn53-s:nth-child(5)'); await bek(800);
    if (await p.$('#uye39 .uye39-b.cn')) { await p.click('#uye39 .uye39-b.cn'); await bek(1200); }
    const s1 = await p.evaluate(async () => { const r = {}; r.s = V53.Hesap.sinif(); go('classes'); await new Promise((x) => setTimeout(x, 600)); r.view = view; r.g = G.g; r.bar = !!$.querySelector('.sn53-bar'); go('home'); await new Promise((x) => setTimeout(x, 600)); r.ev = (($.querySelector('.sn53-ev') || {}).innerText || '').replace(/\s+/g, ' '); go('games'); await new Promise((x) => setTimeout(x, 700)); r.gameGr = [...new Set(Store.all('games').map((g) => g.grade))]; r.qGr = [...new Set(Store.all('questions').map((g) => g.grade))]; return r; });
    await p.evaluate(() => go('home')); await bek(500); await p.screenshot({path: path.join(SH, 'ana-sayfa-sinifim.png')});
    ok('S2 8. sınıf seçilince: Derslerim 8. sınıf sayfasını açar; ana sayfada “Sınıfım: 8. sınıf”; Etkinlik oyunlarında yalnız 8. sınıf oyun ve soruları', s1.s === 8 && s1.view === 'grade' && +s1.g === 8 && s1.bar && /Sınıfım: 8\. sınıf/.test(s1.ev) && JSON.stringify(s1.gameGr) === '[8]' && JSON.stringify(s1.qGr) === '[8]', s1);
    await p.evaluate(() => { Prog.rec(['DKAB-8-U01-O01'], true); Store.save(); });
    await p.evaluate(() => V53.Hesap.sinifAc(true)); await bek(300); await p.click('#sn53 .sn53-s:nth-child(6)'); await bek(600);
    const s2 = await p.evaluate(async () => ({s: V53.Hesap.sinif(), eski: !!(Store.ov.prog || {})['DKAB-8-U01-O01'], son: V39.ilr().sonSinif}));
    const bt = await p.evaluate(async () => { V53.Hesap.tumSiniflar(true); await new Promise((x) => setTimeout(x, 600)); const r = {view, kart: $.querySelectorAll('.gc3, .grade-card, a.gcard, button.gc').length, metin: $.innerText.includes('12')}; return r; });
    ok('S3 Sınıf 9’a değiştirilince 8. sınıftaki ilerleme silinmez; “Bütün sınıflar” ile diğer sınıflar açılabilir', s2.s === 9 && s2.eski && +s2.son === 9 && bt.view === 'classes', {s2, bt});
    await ctx.close();
  }
  /* ---------- M: mod paneli ---------- */
  {
    const {p, ctx} = await sayfa({ek: {'dk-profil53': JSON.stringify({v: 1, h: {misafir: {sinif: 5}}})}});
    await p.evaluate(() => V50.Mod.ac()); await bek(600);
    const m = await p.evaluate(() => { const b = V50.Mod._ac.box, g = b.querySelector('.mk50-giris'), k = b.querySelector('.mk50'); return {ilk: !!g && !!k && (g.compareDocumentPosition(k) & Node.DOCUMENT_POSITION_FOLLOWING) > 0, ust: g ? g.getBoundingClientRect().top < k.getBoundingClientRect().top : false}; });
    await p.screenshot({path: path.join(SH, 'mod-paneli.png')});
    ok('M1 Mod panelinde “Giriş ekranını aç” en üstte (Elmas/Altın/Öğretmen kartlarından önce)', m.ilk && m.ust, m);
    await ctx.close();
  }
  /* ---------- Y: Altın erişimi ---------- */
  {
    const {p, ctx} = await sayfa({ek: {'dk-profil53': JSON.stringify({v: 1, h: {misafir: {sinif: 7}}})}});
    const ogr = await p.evaluate(async () => { V42.gec('premium'); await new Promise((r) => setTimeout(r, 800)); const r = {on: V39.on, yk: !!document.querySelector('#yk518')}; try { V51.Altin.kapatYakinda && V51.Altin.kapatYakinda(); } catch (e) {} document.querySelectorAll('#yk518').forEach((x) => x.remove()); return r; });
    const ogrt = await p.evaluate(async () => { V36.ss(V36.SK, '1'); go('ogretmen'); await new Promise((r) => setTimeout(r, 600)); V42.gec('premium'); await new Promise((r) => setTimeout(r, 800)); const r = {on: V39.on, ed: V38.edOk(), yk: !!document.querySelector('#yk518')}; document.querySelectorAll('#yk518').forEach((x) => x.remove()); go('aoyun53'); await new Promise((r) => setTimeout(r, 600)); r.view = view; r.aoyun = !!$.querySelector('.ao53-kartlar'); return r; });
    ok('Y1 Altın normal öğrenciye ve öğretmene kapalı: “Çok yakında” açılır; öğretmen oturumu editör yetkisi vermez; Altın Oyunları adresi doğrudan açılmaz', !ogr.on && ogr.yk && !ogrt.on && !ogrt.ed && ogrt.yk && !ogrt.aoyun, {ogr, ogrt});
    const ed = await p.evaluate(async () => { V36.ss(V36.SK, ''); sessionStorage.setItem('dk-editor-oturum38', '1'); V51.Yonetici.tamam = () => true; go('editor'); await new Promise((r) => setTimeout(r, 700)); const btn = !!$.querySelector('.ed53-alb'); V53.Onizleme.baslat(); await new Promise((r) => setTimeout(r, 1500)); return {btn, on: V39.on, view, serit: !!document.getElementById('on53')}; });
    await p.screenshot({path: path.join(SH, 'editor-altin-onizleme.png')});
    ok('Y2 Editör, Editör Onay Alanı’ndaki “Altın’ı önizle” ile Altın’a girer; üstte “Editör önizlemesi” şeridi', ed.btn && ed.on && ed.serit && /^p/.test(ed.view), ed);
    const cm = await p.evaluate(async () => { Prog.rec(['DKAB-7-U01-O01'], false); Prog.rec(['DKAB-7-U01-O01'], true); Prog.rec(['DKAB-7-U02-O01'], false); Store.save(); go('acalis53'); await new Promise((r) => setTimeout(r, 700)); return {view, t: $.innerText.replace(/\s+/g, ' ').slice(0, 900), plan: $.querySelectorAll('.ac53-plan li').length, kod: /DKAB-\d/.test($.innerText)}; });
    await p.screenshot({path: path.join(SH, 'altin-calisma-merkezi.png')});
    ok('Y3 Altın Gelişmiş Çalışma Merkezi gerçek cevaplardan: eksik konular, ünite başarısı, hedefler ve bugünkü plan; öğrenciye kazanım kodu gösterilmez', cm.view === 'acalis53' && /Eksik olduğun konular/.test(cm.t) && /%\d+/.test(cm.t) && cm.plan >= 1 && /Ünite başarısı/.test(cm.t) && !cm.kod, cm.t.slice(0, 300));
    const bos = await p.evaluate(async () => { const k = Store.ov.prog; Store.ov.prog = {}; go('acalis53'); await new Promise((r) => setTimeout(r, 500)); const t = $.innerText; Store.ov.prog = k; return /Henüz/.test(t) && !/%\d/.test(t.split('Ünite başarısı')[1] || ''); });
    ok('Y4 Veri yokken uydurma yüzde gösterilmez; “Henüz … yok” yazar', bos);
    const cik = await p.evaluate(async () => { V38.edLogout(); await new Promise((r) => setTimeout(r, 900)); return {on: V39.on, acik: V51.Altin.acikMi(), serit: !!document.getElementById('on53')}; });
    ok('Y5 Editör çıkışında Altın önizlemesi kapanır (Altın yine herkese kapalı)', !cik.on && !cik.acik && !cik.serit, cik);
    await ctx.close();
  }
  /* ---------- T: temalar ---------- */
  {
    const {p, ctx} = await sayfa({ek: {'dk-profil53': JSON.stringify({v: 1, h: {misafir: {sinif: 6}}})}, ses: {'dk-editor-oturum38': '1', 'dk-altin-onizleme53': '1'}});
    const r = await p.evaluate(async () => {
      V51.Yonetici.tamam = () => true; V42.gec('premium'); await new Promise((x) => setTimeout(x, 1200));
      const oku = (k) => getComputedStyle(document.body).getPropertyValue(k).trim();
      const o = {r0: oku('--p-bg')}; V53.Tema.sec('altin', 'ocean'); await new Promise((x) => setTimeout(x, 400)); o.ocean = oku('--p-bg'); o.bg = getComputedStyle(document.body).backgroundColor;
      V53.Tema.sec('altin', 'emerald'); await new Promise((x) => setTimeout(x, 400)); o.emerald = oku('--p-bg'); o.altinKayit = JSON.parse(localStorage.getItem('dk-tema53')).altin;
      return o; });
    await p.screenshot({path: path.join(SH, 'altin-tema-emerald.png')});
    ok('T1 Altın teması değişir (arka plan ve kart değişkenleri; Royal → Ocean → Emerald) ve tercih saklanır', r.r0.toUpperCase() === '#130E0A' && r.ocean.toUpperCase() === '#0A1220' && r.emerald.toUpperCase() === '#08140F' && r.altinKayit === 'emerald', r);
    await p.reload(); await bek(2300);
    const r2 = await p.evaluate(async () => { V51.Yonetici.tamam = () => true; V42.gec('premium'); await new Promise((x) => setTimeout(x, 1200)); return getComputedStyle(document.body).getPropertyValue('--p-bg').trim(); });
    ok('T2 Uygulama yeniden açılınca seçilen tema korunur', r2.toUpperCase() === '#08140F', r2);
    const o = await p.evaluate(async () => { V42.gec('normal'); await new Promise((x) => setTimeout(x, 600)); V36.ss(V36.SK, '1'); go('ogretmen'); await new Promise((x) => setTimeout(x, 800)); const b = !!document.querySelector('.og53-tm'); const L = {}; for (const k of ['royal', 'ocean', 'emerald', 'amethyst', 'pearl', 'crimson']) { V53.Tema.sec('ogretmen', k); await new Promise((x) => setTimeout(x, 350)); const s = getComputedStyle(document.body); L[k] = [s.getPropertyValue('--t37-bg').trim(), s.getPropertyValue('--t37-ink').trim(), s.getPropertyValue('--t37-mut').trim(), s.getPropertyValue('--t37-card').trim(), s.getPropertyValue('--t37-act').trim(), s.getPropertyValue('--t37-on').trim()]; } return {b, L}; });
    await p.screenshot({path: path.join(SH, 'ogretmen-tema-crimson.png')});
    const lum = (h) => { h = h.replace('#', ''); const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const kon = (a, b2) => { const x = lum(a), y = lum(b2); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const KT = Object.fromEntries(Object.entries(o.L).map(([k, [bg, ink, mut, card, act, on]]) => [k, {ink: +kon(ink, bg).toFixed(1), mutKart: +kon(mut, card).toFixed(1), dugme: +kon(on, act).toFixed(1)}]));
    ok('T3 Öğretmen Modu’nda “Tema” düğmesi; 6 temanın hepsi uygulanıyor ve okunur (yazı/zemin ≥ 7, ikincil yazı ≥ 4.5, düğme yazısı ≥ 4.5)', o.b && new Set(Object.values(o.L).map((x) => x[0])).size === 6 && Object.values(KT).every((x) => x.ink >= 7 && x.mutKart >= 4.5 && x.dugme >= 4.5), KT);
    await ctx.close();
  }
  /* ---------- O: oyunlar ---------- */
  {
    const {p, ctx} = await sayfa({ek: {'dk-profil53': JSON.stringify({v: 1, h: {misafir: {sinif: 8}}})}, ses: {'dk-editor-oturum38': '1', 'dk-altin-onizleme53': '1'}});
    const g = await p.evaluate(async () => { go('games'); await new Promise((r) => setTimeout(r, 700)); return {cark: /Çark Çevirme/.test($.innerText), eski: /Çarkıfelek/.test(document.body.innerText)}; });
    ok('O1 Elmas Etkinlik oyunlarında “Çarkıfelek” yerine “Çark Çevirme” yazar (oyun aynı)', g.cark && !g.eski, g);
    const z = await p.evaluate(async () => {
      V51.Yonetici.tamam = () => true; V42.gec('premium'); await new Promise((r) => setTimeout(r, 1200)); go('aoyun53'); await new Promise((r) => setTimeout(r, 500));
      const r = {hub: $.querySelectorAll('.ao53-k').length}; V53.Oyun.ac('zirve'); await new Promise((x) => setTimeout(x, 300));
      const d = V53.Oyun.Zirve.d; r.n = d.sorular.length; r.zor = d.sorular.map((q) => q.difficulty); r.gr = [...new Set(d.sorular.map((q) => q.grade))]; r.tekil = new Set(d.sorular.map((q) => q.id)).size;
      V53.Oyun.Zirve.joker50(); await new Promise((x) => setTimeout(x, 100)); r.gizli = $.querySelectorAll('.ao53-s[aria-hidden="true"]').length; r.kalan = $.querySelectorAll('.ao53-s:not([aria-hidden])').length;
      let adim = 0; while (!V53.Oyun.Zirve.d.bitti && adim < 12) { const q = V53.Oyun.Zirve.d.sorular[V53.Oyun.Zirve.d.i]; V53.Oyun.Zirve.cevapla(q.answer); r.ack = r.ack || !!$.querySelector('.ao53-ack.dg'); V53.Oyun.Zirve.ileri(); adim++; }
      r.kazanc = V53.Oyun.Zirve.d.kazanc; r.son = $.innerText.replace(/\s+/g, ' ').slice(0, 120); return r; });
    ok('O2 Zirve Yarışı: 10 farklı soru (8. sınıf, kolaydan zora), %50 jokeri yanlışları gizler, 2 şık bırakır, doğru cevaplarla zirve 32.000 puan; cevaptan sonra açıklama', z.hub === 2 && z.n === 10 && z.tekil === 10 && JSON.stringify(z.gr) === '[8]' && z.kalan === 2 && z.gizli >= 2 && z.kazanc === 32000 && z.ack && z.zor[0] === 'easy' && z.zor[9] === 'hard', z);
    const z2 = await p.evaluate(async () => { V53.Oyun.ac('zirve'); const d = V53.Oyun.Zirve.d; for (let i = 0; i < 6; i++) { V53.Oyun.Zirve.cevapla(d.sorular[d.i].answer); V53.Oyun.Zirve.ileri(); } const q = d.sorular[d.i]; V53.Oyun.Zirve.cevapla((q.answer + 1) % q.options.length); V53.Oyun.Zirve.ileri(); return {bitti: d.bitti, kazanc: d.kazanc}; });
    ok('O3 Zirve Yarışı: barajı geçtikten sonra yanlış cevapta baraj puanı (1.000) kalır', z2.bitti && z2.kazanc === 1000, z2);
    await p.evaluate(() => { go('aoyun53'); }); await bek(300); await p.evaluate(() => V53.Oyun.ac('zirve')); await bek(300); await p.screenshot({path: path.join(SH, 'zirve-yarisi.png')});
    const h = await p.evaluate(async () => {
      V53.Oyun.ac('harf'); await new Promise((x) => setTimeout(x, 300)); const d = V53.Oyun.Harf.d, r = {n: d.L.length};
      r.uygun = d.L.every(([w, c]) => /^[ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ]{4,7}$/.test(w) && +c.grade === 8);
      r.ipucu = $.querySelector('.ao53-ip').innerText; const w = d.L[0][0]; r.gizli = !r.ipucu.toLocaleUpperCase('tr-TR').includes(w); r.teknik = /TBS-|TBU-|DKAB-|TPC|s\. ?\d|sayfa \d|\d+\. sınıf|object/i.test(r.ipucu);
      // yanlış tahmin + doğru tahmin
      const yanlis = w[0] + [...'ZZZZZZZ'].slice(0, w.length - 1).join(''); for (const h of [...yanlis].slice(1)) V53.Oyun.Harf.tus(h); V53.Oyun.Harf.gonder();
      r.renk = [...document.querySelectorAll('.ao53-hs')[0].querySelectorAll('span')].map((s) => s.className); for (const h of [...w].slice(1)) V53.Oyun.Harf.tus(h); V53.Oyun.Harf.gonder(); r.cozuldu = d.cozuldu; r.puan = d.puan; return r; });
    await p.screenshot({path: path.join(SH, 'harf-avi.png')});
    ok('O4 Harf Avı: kelimeler ders kitabı kavramlarından (8. sınıf, 4–7 harf, Türkçe harfler); ipucunda kavram gizli ve teknik bilgi yok; ilk harf yeşil, doğru tahmin çözer ve puan verir', h.n === 5 && h.uygun && h.gizli && !h.teknik && h.renk[0] === 'dg' && h.cozuldu === true && h.puan === 50, h);
    await ctx.close();
  }
  /* ---------- G: eski ekranlar ---------- */
  {
    const R = [['home', null], ['grade', {g: 5}], ['topic', {t: 'TPC-5-2-01', tab: 'anlat'}], ['search', {q: 'namaz'}], ['links', null]];
    const al = async (dosya) => { const {p, ctx} = await sayfa({dosya, ek: {'dk-profil53': JSON.stringify({v: 1, h: {misafir: {sinif: 5}}})}}); const o = {}; for (const [v, a] of R) { await p.evaluate(([v, a]) => go(v, a), [v, a]); await bek(600); o[v] = await p.evaluate(() => { const c = $.cloneNode(true); c.querySelectorAll('.sn53-ev,.sn53-bar').forEach((x) => x.remove()); return c.innerHTML.replace(/V5[123]\.[0-9]/g, 'V5x').replace(/blob:[^"]+/g, 'blob:'); }); } await p.evaluate(() => { V36.ss(V36.SK, '1'); go('ogretmen'); }); await bek(900); o.ogretmen = await p.evaluate(() => { const c = $.cloneNode(true); c.querySelectorAll('.og53-tm').forEach((x) => x.remove()); return c.innerHTML.replace(/V5[123]\.[0-9]/g, 'V5x').replace(/blob:[^"]+/g, 'blob:'); }); await ctx.close(); return o; };
    const a = await al(F0), c = await al(F), fark = Object.keys(a).filter((k) => a[k] !== c[k]);
    ok('G1 Konu anlatımı, sınıf sayfası, arama, bağlantılar ve öğretmen paneli V52.3 ile birebir aynı (yeni eklenen sınıf kartı/çubuğu ve Tema düğmesi dışında)', fark.length === 0, fark);
  }
  /* ---------- K: küçük ekran ---------- */
  {
    const {p, ctx} = await sayfa({w: 360, h: 640, apk: true, ek: {'dk-giris523': JSON.stringify({v: 1, tur: 'misafir'})}});
    const r = await p.evaluate(() => ({tasma: document.documentElement.scrollWidth > innerWidth, yuk: [...document.querySelectorAll('#sn53 .sn53-s')].map((b) => Math.round(b.getBoundingClientRect().height)), icinde: [...document.querySelectorAll('#sn53 .sn53-s')].every((b) => b.getBoundingClientRect().right <= innerWidth)}));
    ok('K1 360×640: sınıf seçiminde taşma yok, düğmeler ≥ 48 px', !r.tasma && r.yuk.length === 9 && r.yuk.every((y) => y >= 48) && r.icinde, r);
    await ctx.close();
  }
  ok('Z1 Bütün senaryolarda JavaScript hatası yok', HATA.length === 0, HATA.slice(0, 5));
  const gc = S.filter((x) => x.ok).length;
  console.log(`\n${gc}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen: gc, toplam: S.length, kontroller: S}, null, 1));
  await b.close(); st.close(); process.exit(gc === S.length ? 0 : 1);
})().catch((er) => { console.error(er); process.exit(2); });
