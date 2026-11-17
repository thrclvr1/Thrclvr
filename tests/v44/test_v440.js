// V44.0 testleri. Çalıştırma (depo kökünden): node tests/v44/test_v440.js
// Yerel http sunucusu + başsız Chromium. Hafif mod (dk-lite) her testte açıkça ayarlanır. Ekran görüntüleri: docs/V44.0_ekran/
// Not: tarayıcı otomasyonu gerçek telefon testi değildir (mobil adres çubuğu kayması, gerçek dokunma, Android geri tuşu benzetilir).
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const F44 = 'surumler/din-kulturu-platformu-v44.0.html', F43 = 'surumler/din-kulturu-platformu-v43.0.html';
const SH = path.join(ROOT, 'docs', 'V44.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
const S = [], HATA = [];
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 380) : '')); };

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = () => 'http://127.0.0.1:' + srv.address().port + '/' + F44;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, kt: 'light', pt: 'gece', lite: '0', mod: 'premium', ogr: false, ed: false}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true, colorScheme: 'dark'});
    await ctx.addInitScript(([o]) => { if (sessionStorage.getItem('__i')) return; sessionStorage.setItem('__i', '1'); if (o.ogr) sessionStorage.setItem('dk-ogrt-oturum', '1'); if (o.ed) sessionStorage.setItem('dk-editor-oturum38', '1');
      if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-theme', o.kt); localStorage.setItem('dk-lite', o.lite); localStorage.setItem('dk-ptema43', o.pt); if (o.mod) localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL()); await p.waitForTimeout(1400); return {p, ctx};
  };

  /* A. Derleme */
  const h44 = fs.readFileSync(path.join(ROOT, F44), 'utf8'), h43 = fs.readFileSync(path.join(ROOT, F43), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  ok('A1 sürüm V44.0 (V31.VER ve app-version), index.html aynı dosya', /V31\.VER="V44\.0"/.test(h44) && /<meta name="app-version" content="V44\.0">/.test(h44) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === h44);
  ok('A2 müfredat/ilişki/sure-dua/yıllık plan ve müzik blokları V43.0 ile bayt bayt aynı', JSON.stringify(seeds(h44)) === JSON.stringify(seeds(h43)), Object.keys(seeds(h44)).length + ' blok');
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v44.0'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı', deg.length === 0, deg.join(';') || 'yalnız v44.0');

  /* B. Seçim ekranı */
  {
    const {p, ctx} = await sayfa({mod: null});
    const r = await p.evaluate(() => { const o = document.getElementById('uye39'); const gizli = [...document.body.children].filter((e) => e !== o && !/SCRIPT/.test(e.tagName) && !e.classList.contains('v-ov')).map((e) => getComputedStyle(e).visibility);
      return {amb: !!o.querySelector('.o44-amb img'), motif: !!o.querySelector('.o42-motif'), logo: getComputedStyle(o.querySelector('.o42-logo') || document.body).display, gizli: [...new Set(gizli)], htmlBg: getComputedStyle(document.documentElement).backgroundColor, ogr: (o.querySelector('.o42-ogr') || {}).textContent, ed: !!o.querySelector('.o44-edb')}; });
    ok('B1 seçim ekranı: başlık altında uygulama amblemi (geometrik süs kaldırıldı, sol üst tekrarı gizli); öğretmen ve editör girişleri ayrı', r.amb && !r.motif && r.logo === 'none' && /Öğretmen girişi/.test(r.ogr) && r.ed, r);
    ok('B2 seçim ekranı açıkken arkadaki sayfa gizli, sayfa zemini obsidyen (adres çubuğu kayarken açılan şeritte başka ekran görünmez)', r.gizli.length === 1 && r.gizli[0] === 'hidden' && r.htmlBg === 'rgb(9, 12, 11)', r);
    await p.screenshot({path: path.join(SH, 'secim-amblem.png')});
    await p.click('.uye39-b.cn'); await p.waitForTimeout(700);
    await p.evaluate(() => { go('grade', {g: 5}); }); await p.waitForTimeout(400); await p.evaluate(() => scrollTo(0, 600)); await p.waitForTimeout(200);
    const y0 = await p.evaluate(() => scrollY);
    await p.evaluate(() => V39.secim(true)); await p.waitForTimeout(300); await p.evaluate(() => document.getElementById('uye39').scrollTo(0, 900)); await p.waitForTimeout(200);
    await p.goBack(); await p.waitForTimeout(500);
    const r2 = await p.evaluate(() => ({acik: !!document.getElementById('uye39'), y: scrollY, gor: getComputedStyle(document.getElementById('app')).visibility, view}));
    ok('B3 seçim ekranı geri tuşuyla kapanınca önceki sayfa görünür ve kaydırma konumu korunur', !r2.acik && r2.gor === 'visible' && Math.abs(r2.y - y0) < 4 && r2.view === 'grade', {y0, r2});
    await ctx.close();
  }

  /* C. Roller ve yetki */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    const r = await p.evaluate(() => ({roller: V44.Yetki.roller(), veri: V44.Yetki.izin('veri.yonetimi'), yok: V44.Yetki.izin('tanimsiz.eylem'), ogrenme: V44.Yetki.izin('ogren'), kilit: getComputedStyle(document.querySelector("header.top .iconbtn[onclick=\"go('admin')\"]")).display, kart: !!document.querySelector('.og-home')}));
    ok('C1 öğrenci: yalnız öğrenci rolü; tanımsız eylem ve veri yönetimi REDDEDİLİR; öğrenme izinli', r.roller.join() === 'ogrenci' && !r.veri && !r.yok && r.ogrenme, r);
    ok('C2 öğrenci ekranında yönetim araçları yok (üst çubuk “Yönetim” kilidi ve ana sayfa öğretmen kartı)', r.kilit === 'none' && !r.kart, r);
    await p.evaluate(() => go('admin')); await p.waitForTimeout(400);
    const a = await p.evaluate(() => ({kapi: /yalnızca yönetici\/editör rolüyle/.test(document.getElementById('app').textContent), duzen: !!document.querySelector('#app textarea,#app .adm')}));
    ok('C3 veri yönetimi rotası öğrencide yetki kapısı gösterir (içerik düzenleme açılmaz)', a.kapi, a);
    await p.evaluate(() => V30.settings()); await p.waitForTimeout(400);
    ok('C4 Klasik ayarlarda yalnız “Öğretmen / editör girişi” bağlantısı', await p.evaluate(() => !!document.querySelector('.g44-ay button')));
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'premium'});
    await p.evaluate(() => V40.profil()); await p.waitForTimeout(400);
    const t = await p.evaluate(() => document.querySelector('.pf40-g').textContent);
    ok('C5 Premium profil: “Öğretmen Paneli” aracı yok, “Öğretmen / editör girişi” var', !/Öğretmen PanelıÖğretmen PIN’i ile açılır|Öğretmen PIN’i ile açılır/.test(t) && /Öğretmen \/ editör girişi/.test(t), t.slice(0, 200));
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'normal', ed: true});
    const r = await p.evaluate(() => { go('admin'); return {roller: V44.Yetki.roller(), veri: V44.Yetki.izin('veri.yonetimi'), ogrPanel: V44.Yetki.izin('ogretmen.panel'), kapi: /yalnızca yönetici\/editör rolüyle/.test(document.getElementById('app').textContent), kilit: getComputedStyle(document.querySelector("header.top .iconbtn[onclick=\"go('admin')\"]")).display}; });
    ok('C6 editör oturumu: veri yönetimi açılır, kilit görünür; editör yetkisi öğretmen paneli yetkisi vermez', r.roller.includes('editor') && r.veri && !r.ogrPanel && !r.kapi && r.kilit !== 'none', r);
    await ctx.close();
  }

  /* D. Öğretmen paneli */
  {
    const {p, ctx} = await sayfa({mod: 'normal', ogr: true});
    await p.evaluate(() => go('ogretmen')); await p.waitForTimeout(500);
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Diğer'); if (b) b.click(); }); await p.waitForTimeout(500);
    const r = await p.evaluate(() => ({tiles: [...document.querySelectorAll('.v38-tile b')].map((x) => x.textContent), ek: document.querySelectorAll('.v38-row2').length, bnav: getComputedStyle(document.querySelector('nav.bnav')).display, kodVar: typeof OGRT.EXT.plan === 'function' || !!OGRT.SUB43.find((x) => x[0] === 'plan')}));
    ok('D1 öğretmen Ana Panel: yalnız altı bölüm (Kazanımlar ilk ve geniş), öğrenci alt menüsü yok; diğer modüllerin kodu duruyor', r.tiles.join('|') === 'Kazanımlar|Hızlı Arama|Son İşlemler|Veri Yönetimi|Ayarlar|Editör Onayı' && r.ek === 0 && r.bnav === 'none' && r.kodVar, r);
    await p.screenshot({path: path.join(SH, 'ogretmen-ana-panel.png'), fullPage: true});
    await ctx.close();
  }

  /* E. İçerik açma */
  for (const mod of ['normal', 'premium']) {
    const {p, ctx} = await sayfa({mod, ogr: true});
    const oid = await p.evaluate(() => { const o = Store.all('outcomes').find((o) => OGRT.topicsOf(o.id).length >= 3 && /Namaz/i.test(o.title || '')); return o.id; });
    const T = await p.evaluate((o) => OGRT.topicsOf(o).map((t) => t.id), oid), R = [];
    for (let i = 0; i < T.length; i++) {
      await p.evaluate(() => go('ogretmen')); await p.waitForTimeout(350); await p.evaluate((o) => OGRT.W.content(o), oid); await p.waitForTimeout(400);
      await (await p.$$('.v-sheet .og-tb'))[i].click(); await p.waitForTimeout(900);
      R.push(await p.evaluate(() => ({v: view, t: G.t || G.pt, ui: UI._stack.length})));
    }
    const hedef = mod === 'premium' ? 'pders' : 'topic';
    ok(`E1 ${mod}: çok konulu kazanımda her konu “İçeriği aç”la doğru ekranda açılır, panel kapanır (V43’te hiçbiri açılmıyordu)`, R.every((r, i) => r.v === hedef && r.t === T[i] && r.ui === 0), R);
    await p.goBack(); await p.waitForTimeout(500);
    ok(`E2 ${mod}: konudan geri tuşu öğretmen paneline döner`, await p.evaluate(() => view === 'ogretmen'));
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    const bos = await p.evaluate(() => { const t = Store.all('topics').find((t) => vis(t) && !t.sections); return t && t.id; });
    await p.evaluate((id) => V44.icerikAc(id, 'anlat'), bos); await p.waitForTimeout(500);
    const r = await p.evaluate(() => ({view, panel: document.querySelector('.v-sheet') && document.querySelector('.v-sheet').textContent}));
    ok('E3 içeriği hazırlanmamış konu tamamlanmış gibi açılmaz; açık uyarı verilir', bos && r.view !== 'topic' && /henüz hazırlanmadı|Ders kitabında veri bulunmuyor/.test(r.panel || ''), {bos, r});
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'premium'});
    await p.evaluate(() => go('psinif', {pg: 5})); await p.waitForTimeout(300); await p.evaluate(() => V39.ara()); await p.waitForTimeout(300);
    await p.fill('#p39q', 'namaz'); await p.waitForTimeout(300); await p.click('.p39-ri'); await p.waitForTimeout(900);
    ok('E4 Premium aramada sonuca dokununca ders açılır (aynı panel-kapanma yarışı; ortak düzeltme)', await p.evaluate(() => view === 'pders' && UI._stack.length === 0));
    await ctx.close();
  }

  /* F. Oyunlar */
  const coz = async (p) => { // ipucu + kontrol + seçeneklerle bitir
    for (let k = 0; k < 120; k++) {
      if (await p.evaluate(() => !!document.querySelector('.g44-son'))) return true;
      const r = await p.evaluate(() => { const b = document.querySelector('[data-ip]'); if (!b) return 'yok'; b.click(); return document.querySelector('.g44-bil').textContent; }); await p.waitForTimeout(160);
      const k2 = await p.$('.g44-alan [data-k=kontrol]:not(:disabled)'); if (k2) { await k2.click(); await p.waitForTimeout(800); continue; }
      if (/başka ipucu yok/.test(r)) { const s = await p.$('.g44-alan [data-s]:not(:disabled)'); if (s) { await s.click(); await p.waitForTimeout(950); } }
    }
    return false;
  };
  for (const pt of ['gece', 'gunduz']) {
    const {p, ctx} = await sayfa({mod: 'premium', pt});
    const bl = await p.evaluate(() => ({z: V41.oyunlar.zaman.bolumler().map((b) => ({id: b.id, ad: b.ad, s: b.sinif, h: b.hazir})), l: V41.oyunlar.lab.bolumler().filter((b) => b.hazir).length, lt: V41.oyunlar.lab.bolumler().length,
      arayuz: ['zaman', 'lab', 'kutuphane'].map((id) => V44.Motor.ARAYUZ.every((m) => typeof V41.oyunlar[id][m] === 'function')), kaynak: V41.oyunlar.zaman.bolumler().concat(V41.oyunlar.lab.bolumler()).every((b) => (b.kaynak ? [b.kaynak] : b.oyunlar || []).every((g) => g.dogrulama))}));
    if (pt === 'gece') {
      ok('F1 Zamanın İzinde: 3 bölüm (4. sınıf 2018 ×2, Hicret 7. sınıf 2026); Bilgi Laboratuvarı: ünite bölümleri', bl.z.length === 3 && bl.z.some((x) => /HİCRET/.test(x.ad) && x.s === 7) && bl.l >= 10, {z: bl.z.map((x) => x.ad), lab: bl.l + '/' + bl.lt});
      ok('F2 üç oyun da ortak motor arayüzünü (initialize…destroy) sağlıyor; bütün bölüm kaynakları kaynak kontrolünden geçmiş kayıtlar', bl.arayuz.every(Boolean) && bl.kaynak, bl.arayuz);
    }
    const z = bl.z[0].id;
    await p.evaluate((id) => go('poyna', {oyn: 'zaman', obol: id, odevam: 0}), z); await p.waitForTimeout(500);
    const kilit = await p.evaluate(() => [...document.querySelectorAll('[data-sev]')].map((b) => b.dataset.sev + ':' + b.disabled));
    await p.click('[data-sev=kolay]'); await p.waitForTimeout(400);
    await p.screenshot({path: path.join(SH, `zaman-kronoloji-${pt}.png`)});
    // duraklat / sürdür
    await p.click('.g44-ust .g44-ib'); await p.waitForTimeout(300);
    const dur = await p.evaluate(() => ({durdu: V41.durdu, menu: !!document.getElementById('o41m')}));
    await p.evaluate(() => V41.surdur()); await p.waitForTimeout(200);
    // ilk görevi bitir, çık, devam et
    for (let k = 0; k < 12; k++) { const r = await p.evaluate(() => { const b = document.querySelector('[data-ip]'); b.click(); return document.querySelector('.g44-bil').textContent; }); await p.waitForTimeout(120); if (/başka ipucu yok/.test(r)) break; }
    const k2 = await p.$('.g44-alan [data-k=kontrol]:not(:disabled)'); if (k2) await k2.click(); await p.waitForTimeout(1000);
    const adim = await p.evaluate((id) => (V41.bolumKayit('zaman', id).aktif || {}).adim, z);
    await p.evaluate(() => go('poyun')); await p.waitForTimeout(500);
    const merkez = await p.evaluate(() => ({kat: [...document.querySelectorAll('.g44-kat')].map((x) => x.firstChild.textContent.trim()), devam: [...document.querySelectorAll('.g44-ok .o41-b')].some((b) => /Devam et/.test(b.textContent))}));
    await p.reload(); await p.waitForTimeout(1400);
    await p.evaluate((id) => go('poyna', {oyn: 'zaman', obol: id, odevam: 1}), z); await p.waitForTimeout(500);
    const dv = await p.evaluate(() => document.querySelector('.g44-gb small') && document.querySelector('.g44-gb small').textContent);
    const bitti = await coz(p);
    const kay = await p.evaluate((id) => V41.bolumKayit('zaman', id), z);
    await p.screenshot({path: path.join(SH, `zaman-sonuc-${pt}.png`)});
    ok(`F3 ${pt}: Zamanın İzinde — Orta/Zor kilitli başlar; Menü duraklatır; görev bitince kaydedilir; çıkıp sayfa yenilenince “Devam et” aynı görevden sürer; seviye biter, yıldız ve puan kaydedilir; Orta açılır`,
      kilit.join() === 'kolay:false,orta:true,zor:true' && dur.durdu && dur.menu && adim === 1 && merkez.devam && /Görev 2/.test(dv || '') && bitti && kay.seviyeler.kolay && kay.yildiz.kolay >= 1 && !kay.aktif,
      {kilit, dur, adim, dv, bitti, kayit: kay && kay.seviyeler});
    if (pt === 'gece') ok('F4 oyun merkezi: Öğrenme oyunları / Hibrit görevler / Macera oyunları (macera “Geliştiriliyor”, oynanabilir gösterilmiyor)', merkez.kat.join('|') === 'Öğrenme oyunları|Hibrit görevler|Macera oyunları', merkez);
    // Bilgi Laboratuvarı
    const lb = await p.evaluate(() => V41.oyunlar.lab.bolumler().find((b) => b.hazir && b.sinif === 5).id);
    await p.evaluate((id) => go('poyna', {oyn: 'lab', obol: id, odevam: 0}), lb); await p.waitForTimeout(500); await p.click('[data-sev=kolay]'); await p.waitForTimeout(400);
    await p.screenshot({path: path.join(SH, `lab-gorev-${pt}.png`)});
    const lbit = await coz(p), lk = await p.evaluate((id) => V41.bolumKayit('lab', id), lb);
    await p.evaluate((id) => go('poyna', {oyn: 'lab', obol: id, odevam: 0}), lb); await p.waitForTimeout(400);
    const orta = await p.evaluate(() => !document.querySelector('[data-sev=orta]').disabled);
    ok(`F5 ${pt}: Bilgi Laboratuvarı — Kolay seviye istasyonları biter, kaydedilir, Orta seviye açılır`, lbit && lk.seviyeler.kolay && orta, {lbit, sev: lk.seviyeler});
    await p.evaluate(() => go('poyun')); await p.waitForTimeout(400);
    const prof = await p.evaluate(() => V44.profil());
    if (pt === 'gece') ok('F6 oyun profili: öğrenme yıldızları/puanı hibrit ve macera puanlarından ayrı; günlük görev ve başarım güncellenir', prof.ogrenme.yildiz >= 2 && prof.macera.puan === 0 && prof.gunluk.ok && prof.basarim.find((x) => x[0] === 'İlk adım')[2], {og: prof.ogrenme, gunluk: prof.gunluk});
    if (pt === 'gece') await p.screenshot({path: path.join(SH, 'oyun-merkezi.png'), fullPage: true});
    await ctx.close();
  }
  { // Kütüphane bozulmadı
    const {p, ctx} = await sayfa({mod: 'premium'});
    await p.evaluate(() => go('poyna', {oyn: 'kutuphane', obol: '5-2026-U01', odevam: 0})); await p.waitForTimeout(900);
    const a = await p.evaluate(() => !!document.querySelector('.o41-giris'));
    await p.evaluate(() => V41.oyunlar.kutuphane.girisBitti()); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => ({oda: !!document.querySelector('.o41-oyun-ekran'), nes: document.querySelectorAll('.o41-nesler button').length, kayit: !!V41.bolumKayit('kutuphane', '5-2026-U01')}));
    ok('F7 Kayıp Bilgeliğin Kütüphanesi: hikâye girişi ve oda açılıyor, nesneler ve kayıt yerinde', a && r.oda && r.nes > 0 && r.kayit, r);
    await ctx.close();
  }

  /* G. Denetim */
  {
    let d = null; try { d = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'v44', 'denetim_sonuc.json'), 'utf8')); } catch (e) {}
    const md5 = crypto.createHash('md5').update(fs.readFileSync(path.join(ROOT, F44))).digest('hex');
    ok('G WCAG AA denetimi (tam kaydırma; hafif mod açık/kapalı; Klasik açık/koyu; Premium Gündüz/Gece; V44 ekranları dahil) bu derleme için AA altı 0', d && d.md5 === md5 && d.aaAlti === 0, d ? {md5Eslesir: d.md5 === md5, baglam: d.baglam, yazi: d.yazi, aaAlti: d.aaAlti} : 'çıktı yok');
  }
  ok('H sayfa hatası (JS) yok', HATA.length === 0, HATA.slice(0, 5));
  const g = S.filter((x) => x.ok).length;
  console.log(`\n${g} / ${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen: g, toplam: S.length, kontroller: S}, null, 1));
  await b.close(); srv.close(); process.exit(g === S.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
