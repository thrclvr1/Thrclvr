// V51.0 testleri (depo kökünden): node tests/v51/test_v510.js
// Yerel http sunucusu + başsız Chromium. Hafif mod (dk-lite) açıkça ayarlanır. Ekran görüntüleri: docs/V51.0_ekran/
// Geri tuşu gerçek tarayıcı geçmişiyle (page.goBack). Tarayıcı otomasyonu gerçek cihaz testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..');
const F51 = 'surumler/din-kulturu-platformu-v51.0.html', F50 = 'surumler/din-kulturu-platformu-v50.0.html';
const SH = path.join(ROOT, 'docs', 'V51.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [];
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
// öğrenme alanında görünmemesi gereken editoryal / teknik bilgi kalıpları
const EDITORYAL = /künye|ISBN|yayınevi|\.pdf\b|PDF s\.|SRC-|basılı sayfa|sayfa eşleş|kaynak güveni|güven: (high|medium|low)|\((high|medium|low)|incelemede|taslak hazır|taslak içerik|Taslakları göster|editör kontrolü|editör (doğrulaması|onayı) bekl|Kaynakla doğrulandı|Kaynaktan türetildi|Kaynak yetersiz|Kaynak kontrolünden geçti|Program sürümü|CV-TYMM|CV-2018|uyumlu \(MEB|Editör alanı/i;

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = (f) => 'http://127.0.0.1:' + srv.address().port + '/' + (f || F51);
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, lite: '1', mod: 'normal', tema: 'light', pt: 'gece', ek: null, f: F51}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', o.lite); localStorage.setItem('dk-theme', o.tema); localStorage.setItem('dk-ptema43', o.pt); localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1, fav: {s: [7], k: ['TPC-5-1-01']}, sonSinif: 7})); if (o.ek) Object.entries(o.ek).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL(o.f)); await p.waitForTimeout(1500);
    return {p, ctx};
  };
  const tasma = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const durum = (p) => p.evaluate(() => ({mod: V50.Mod.aktif(), v: view, on: !!V39.on, ss: sessionStorage.getItem('dk-deneyim39-aktif'), prem: document.body.hasAttribute('data-prem39'), alan: document.documentElement.dataset.alan49, deneyim: JSON.parse(localStorage.getItem('dk-deneyim39') || '{}').son, nav: (document.querySelector('nav.bnav button.on') || {}).dataset?.k || '', bn50: !!document.querySelector('#bn50:not([hidden])')}));
  const metin = (p) => p.evaluate(() => (document.querySelector('main') || document.body).innerText);
  const ogretmenAc = async (p, siniflar) => { await p.evaluate(async (sn) => { V36.ss(V36.SK, '1'); OGRT.d.classes = sn; OGRT.d.active = OGRT.ck(sn[0].g, sn[0].py); OGRT.save(); go('ogretmen'); await new Promise((r) => setTimeout(r, 300)); }, siniflar || [{g: 5, py: '2026'}, {g: 8, py: '2018'}]); };
  const sekme = async (p, t) => { await p.evaluate((t) => { OGRT.S().tab = t; OGRT.render(); }, t); await bek(250); };

  /* ---------- A. derleme ve veri güvenliği ---------- */
  const h51 = fs.readFileSync(path.join(ROOT, F51), 'utf8'), h50 = fs.readFileSync(path.join(ROOT, F50), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s50 = seeds(h50), s51 = seeds(h51);
  ok('A1 sürüm V51.0, index.html aynı dosya; V50.0 yedek dosyası duruyor', /V31\.VER="V51\.0"/.test(h51) && /content="V51\.0"/.test(h51) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === h51 && fs.existsSync(path.join(ROOT, F50)));
  ok('A2 bütün veri, müzik ve görsel blokları V50.0 ile bayt bayt aynı (veri silinmedi, değişmedi)', Object.keys(s50).length === Object.keys(s51).length && Object.entries(s50).every(([k, v]) => s51[k] === v), Object.keys(s51).length + ' blok');
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v51.0'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı (V50.0 dahil)', deg.length === 0, deg.join(';') || 'yalnız v51.0');

  /* ---------- 1–2. üst çubuk simgeleri ---------- */
  {
    const olc = {};
    for (const [mod, w] of [['normal', 360], ['normal', 390], ['premium', 360], ['premium', 390], ['premium', 412]]) {
      const {p, ctx} = await sayfa({mod, w, h: 780, tema: mod === 'normal' ? 'light' : 'dark'});
      if (mod === 'premium') { await p.evaluate(() => go('psinif', {pg: 5})); await bek(600); }
      olc[mod + w] = await p.evaluate(() => {
        const btn = document.querySelector('header.top .md50, .p39-top .md50'); if (!btn) return null;
        const r = btn.getBoundingClientRect(), i = btn.querySelector('.md50-i'), ir = i.getBoundingClientRect(), sv = i.querySelector('svg'), sr = sv.getBoundingClientRect(), cs = getComputedStyle(i);
        const bar = btn.parentElement.getBoundingClientRect();
        const ust = document.elementFromPoint(sr.left + sr.width / 2, sr.top + sr.height / 2);
        return {mod: btn.dataset.md50, para: sv.classList.contains('ap51'), btn: [Math.round(r.left), Math.round(r.right)], vw: innerWidth, ikon: [Math.round(sr.width), Math.round(sr.height)], daire: [Math.round(ir.width), Math.round(ir.height)], icinde: sr.left >= ir.left - 1 && sr.right <= ir.right + 1 && sr.top >= ir.top - 1 && sr.bottom <= ir.bottom + 1, gorunur: !!ust && (ust === sv || sv.contains(ust) || i.contains(ust)), hiza: Math.abs((sr.top + sr.height / 2) - (r.top + r.height / 2)) <= 2, ortaUst: Math.abs((r.top + r.height / 2) - (bar.top + bar.height / 2)) <= 4, tasma: document.documentElement.scrollWidth - innerWidth};
      });
      if (mod === 'premium' && w === 360) { const el = await p.$('.p39-top'); if (el) await el.screenshot({path: path.join(SH, 'altin-ust-cubuk-360.png')}); }
      if (mod === 'normal' && w === 360) { const el = await p.$('header.top'); if (el) await el.screenshot({path: path.join(SH, 'elmas-ust-cubuk-360.png')}); }
      await ctx.close();
    }
    const E = [olc.normal360, olc.normal390], A = [olc.premium360, olc.premium390, olc.premium412];
    ok('T1 Elmas üst çubuğu: mod düğmesinde lacivert daire içinde elmas (değişmedi), ekranda, kırpılmadan, hizalı (360/390 px)', E.every((x) => x && x.mod === 'elmas' && !x.para && x.btn[1] <= x.vw && x.icinde && x.gorunur && x.hiza && x.tasma <= 0), E);
    ok('T2 Altın üst çubuğu: altın para simgesi dairenin içinde tam görünür, Mod düğmesiyle hizalı, küçük ekranda kırpılmaz (360/390/412 px)', A.every((x) => x && x.mod === 'altin' && x.para && x.ikon[0] >= 22 && x.btn[1] <= x.vw && x.icinde && x.gorunur && x.hiza && x.tasma <= 0), A);
  }

  /* ---------- 3–5. Sınıf sınıf ilerleme modu korur, geri tuşu ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    await p.evaluate(() => go('profil46')); await bek(500);
    await p.click('.pr49-h[data-k="sinif"]'); await bek(700);
    const d1 = await durum(p), t1 = await p.evaluate(() => ({kart: document.querySelectorAll('.il51-k').length, p39: !!document.querySelector('.p39'), baslik: (document.querySelector('main h1') || {}).textContent}));
    await p.screenshot({path: path.join(SH, 'elmas-sinif-sinif-ilerleme.png')});
    await p.goBack(); await bek(700); const d2 = await durum(p);
    await p.evaluate(() => go('pfav')); await bek(500); const d3 = await durum(p), fav = await p.evaluate(() => document.querySelectorAll('.fv51 .il51-k').length);
    await p.goBack(); await bek(600); const d4 = await durum(p);
    ok('T3 Elmas: Profilim › Sınıf sınıf ilerleme Elmas’ta açılır (mod, oturum, palet, alt menü değişmez)', d1.v === 'pilerleme' && d1.mod === 'elmas' && !d1.on && d1.ss === null && !d1.prem && d1.alan === 'elmas' && d1.nav === 'profil' && !d1.bn50 && d1.deneyim === 'normal' && t1.kart === 9 && !t1.p39, {d1, t1});
    ok('T3b Elmas: Favorilerim de Elmas’ta açılır; geri tuşu modu değiştirmez', d3.v === 'pfav' && d3.mod === 'elmas' && !d3.on && fav >= 2 && d2.v === 'profil46' && d2.mod === 'elmas' && !d2.on && d4.mod === 'elmas' && !d4.on, {d2, d3, d4, fav});
    // Oyun Dünyası (3B, yalnız Altın): Elmas’ta onay ekranı; onay vermeden mod değişmez
    await p.evaluate(() => go('poyun')); await bek(500); const d5 = await durum(p), onay = await p.evaluate(() => !!document.querySelector('.oy51-k'));
    await p.click('.oy51-bb button.p'); await bek(1400); const d6 = await durum(p);
    ok('T3c Elmas’ta Oyun Dünyası: açık onay ekranı, mod kendiliğinden değişmez; “Altın Sınıfı’na geç ve aç” ile Altın’da oyun merkezi açılır', d5.v === 'poyun' && d5.mod === 'elmas' && !d5.on && onay && d6.mod === 'altin' && d6.v === 'poyun' && d6.on, {d5, d6});
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'premium', tema: 'dark'});
    await p.evaluate(() => go('profil46')); await bek(500);
    await p.evaluate(() => go('pilerleme')); await bek(600);
    const d1 = await durum(p), p39 = await p.evaluate(() => !!document.querySelector('.p39'));
    await p.goBack(); await bek(700); const d2 = await durum(p);
    await p.screenshot({path: path.join(SH, 'altin-profil-geri.png')});
    ok('T4 Altın: Sınıf sınıf ilerleme Altın’da açılır (Altın bileşenleri)', d1.v === 'pilerleme' && d1.mod === 'altin' && d1.on && d1.prem && p39, d1);
    ok('T5 Geri tuşu: ilerleme ekranından geri dönünce önceki ekran aynı modda (Altın kalır)', d2.v === 'profil46' && d2.mod === 'altin' && d2.on, d2);
    await ctx.close();
  }

  /* ---------- 6–11. öğretmen paneli ---------- */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    await p.evaluate(() => { OGRT.d = OGRT.load(); OGRT.d.status = {'DKAB-5-U01-O01': 'isl', 'DKAB-5-U01-O02': 'tek'}; OGRT.save(); });
    await ogretmenAc(p);
    await p.evaluate(() => OGRT.W.go(1)); await bek(300);
    const h = await p.evaluate(() => ({sekmeler: [...document.querySelectorAll('.og-main button')].map((b) => b.textContent.trim()), hafta: document.querySelectorAll('.ogw-wk').length, kart: !!document.querySelector('.ogw-c.c-kaz'), ders: !!document.querySelector('.ogw-kr .ogw-b'), qa: document.querySelectorAll('.v38-qa').length, yeniden: [...document.querySelectorAll('button')].filter((b) => /Yıllık plana göre (yeniden )?kur/.test(b.textContent)).length, not: !!document.querySelector('.ogw-notes h3'), notBaslik: (document.querySelector('.ogw-notes h3') || {}).textContent, select: document.querySelectorAll('.ogw-st, .ogw-stl').length, chip: document.querySelectorAll('.ogw-chip').length, durumMetni: /Başlanmadı|Planlandı|İşlendi|Tekrar edilmeli/.test(document.querySelector('.ogw').innerText), dosya: /\.xlsx/.test(document.querySelector('.ogw').innerText)}));
    await p.screenshot({path: path.join(SH, 'ogretmen-haftalik.png'), fullPage: true});
    // not ekleme ve ders hazırla
    await p.evaluate(() => OGRT.W.nEdit('new')); await bek(200); await p.fill('.ogw-nfm textarea', 'Kavram haritası etkinliği'); await p.click('.ogw-nfm button[type=submit]'); await bek(300);
    const not = await p.evaluate(() => { const k = Object.keys(OGRT.W.d.notes).find((x) => x.startsWith('5|2026|')); return k ? OGRT.W.d.notes[k].map((n) => n.text) : []; });
    ok('T6 Haftalık çalışır ve sadeleşti: hafta şeridi, kazanım kartı, Ders hazırla, not; tekrarlanan hızlı kartlar yok, “yeniden kur” tek, dosya adı görünmez', h.sekmeler.join('|') === 'Haftalık|Sınıflarım|Araçlar' && h.hafta >= 37 && h.kart && h.ders && h.qa === 0 && h.yeniden === 1 && h.notBaslik.includes('Haftalık notlarım') && not.includes('Kavram haritası etkinliği') && !h.dosya, h);
    const st = await p.evaluate(() => ({st: OGRT.d.status, fn: typeof OGRT.setSt === 'function' && typeof OGRT.st === 'function', kayit: JSON.parse(localStorage.getItem('dk-ogretmen-v1')).status}));
    ok('T11 Kazanım kartında durum menüsü (Başlanmadı/Planlandı/İşlendi/Tekrar edilmeli) yok; kayıtlı durumlar ve işlevleri korunur', h.select === 0 && h.chip === 0 && !h.durumMetni && st.fn && st.kayit['DKAB-5-U01-O01'] === 'isl' && st.kayit['DKAB-5-U01-O02'] === 'tek', {h: {select: h.select, chip: h.chip, durumMetni: h.durumMetni}, st});
    // Araçlar = yalnız Sorun Bildir
    await sekme(p, 'diger');
    const a = await p.evaluate(() => ({sub: OGRT.SUB.map((x) => x[1]), subNav: !!document.querySelector('.og-sub'), baslik: (document.querySelector('#og-body h2') || {}).textContent, eski: /Hızlı Arama|Son İşlemler|Veri Yönetimi|Kazanımlar|Editör Onay Alanı/.test(document.querySelector('#og-body').innerText), alan: [...document.querySelectorAll('.sb51-f select, .sb51-f textarea')].map((e) => e.name)}));
    await p.click('.sb51-f button[type=submit]'); await bek(150); const hata1 = await p.textContent('.sb51-h');
    await p.selectOption('.sb51-f select[name=bolum]', 'Haftalık plan'); await p.selectOption('.sb51-f select[name=sinif]', '5'); await bek(200);
    await p.evaluate(() => { const s = document.querySelector('.sb51-f select[name=konu]'); s.value = 'TPC-5-1-01'; s.dispatchEvent(new Event('change')); });
    await p.fill('.sb51-f textarea[name=ack]', '3. haftadaki kazanım iki kez görünüyor.'); await p.fill('.sb51-f textarea[name=not]', 'Tablette fark ettim.'); await p.click('.sb51-f button[type=submit]'); await bek(500);
    const sb = await p.evaluate(() => { const L = V48.Bildir.oku().liste.filter((k) => k.tur === 'genel'); return {n: L.length, k: L[0] && {kat: L[0].kategori, sinif: L[0].baglam.sinif, konu: L[0].baglam.konuId, ack: L[0].aciklama, durum: L[0].durum, kaynak: L[0].kaynak}, liste: (document.querySelector('.sb51-l') || {}).innerText}; });
    await p.screenshot({path: path.join(SH, 'ogretmen-araclar-sorun-bildir.png'), fullPage: true});
    ok('T9 Araçlar’da yalnız Sorun Bildir: bölüm, sınıf/konu, açıklama, ek not; eski araçlar menüde yok', a.sub.join() === 'Sorun Bildir' && !a.subNav && /Sorun Bildir/.test(a.baslik) && !a.eski && a.alan.join() === 'bolum,sinif,konu,ack,not', a);
    ok('T9b Sorun Bildir doğrular, kaydeder; öğretmen kaydın alındığını görür (sunucu yok → “Bu cihazda kayıtlı”, gönderildi denmez)', /bölüm/.test(hata1) && sb.n === 1 && sb.k.kat === 'Haftalık plan' && sb.k.sinif === 5 && sb.k.konu === 'TPC-5-1-01' && /Ek not: Tablette/.test(sb.k.ack) && sb.k.durum === 'taslak' && sb.k.kaynak === 'ogretmen' && /Bu cihazda kayıtlı/.test(sb.liste) && !/Editöre gönderildi/.test(sb.liste), sb);
    // Editör onayı yalnız Ana Panel’de, yalnız editör yetkisiyle
    const ap = await p.evaluate(() => ({ana: !!document.querySelector('.og-top .ap51'), giris: (document.querySelector('.ap51-bb') || {}).innerText, araclarda: [...document.querySelectorAll('#og-body button')].some((b) => /Editör/.test(b.textContent))}));
    await p.click('.ap51-bb button'); await bek(500);
    const pin = await p.evaluate(() => ({v: view, pin: !!document.querySelector('.ed38, .v36-pin, input[type=password], input[inputmode=numeric]'), liste: !!document.querySelector('.ed38-cats'), edOk: V38.edOk()}));
    await p.evaluate(() => go('profil46')); await bek(500);
    const pr = await p.evaluate(() => ({editorDugme: [...document.querySelectorAll('main button')].some((b) => /^Editör alanı$/.test(b.textContent.trim()))}));
    await p.evaluate(() => V44.giris()); await bek(300); const gs = await p.evaluate(() => document.querySelector('.sheet, .ui-sheet, [role=dialog]')?.innerText || ''); await p.evaluate(() => UI.close()); await bek(300);
    ok('T10 Editör onayı yalnız Ana Panel’de: Araçlar’da, Profilim’de ve “Öğretmen modu” penceresinde editör girişi yok; normal öğretmen PIN’siz onay alanına giremez', ap.ana && /Editör girişi/.test(ap.giris) && !ap.araclarda && pin.v === 'editor' && !pin.liste && !pin.edOk && !pr.editorDugme && !/Editör alanı/.test(gs), {ap, pin, pr, gs: gs.slice(0, 160)});
    await p.evaluate(async () => { sessionStorage.setItem('dk-editor-oturum38', '1'); go('ogretmen'); await new Promise((r) => setTimeout(r, 400)); });
    const ap2 = await p.evaluate(() => (document.querySelector('.ap51') || {}).innerText || '');
    await p.screenshot({path: path.join(SH, 'ogretmen-ana-panel-editor.png')});
    await p.evaluate(async () => { go('editor'); await new Promise((r) => setTimeout(r, 400)); });
    const ed = await p.evaluate(() => ({liste: !!document.querySelector('.ed38-cats'), araclar: (document.querySelector('.ed51-ara') || {}).innerText || ''}));
    ok('T10b Editör yetkisiyle Ana Panel onay alanını açar; Yıllık planlar, Yayın durumu, Veri yönetimi editör alanında', /Onay alanını aç/.test(ap2) && /Yıllık planlar/.test(ap2) && ed.liste && /Yıllık planlar/.test(ed.araclar) && /Yayın durumu/.test(ed.araclar) && /Veri yönetimi/.test(ed.araclar), {ap2: ap2.slice(0, 200), ed: ed.araclar.slice(0, 200)});
    await ctx.close();
  }

  /* ---------- 7–8. yıllık plan dağılımı ve öğretmen düzenlemelerinin korunması ---------- */
  {
    const yp = cp.spawnSync(process.execPath, [path.join(__dirname, 'yp_karsilastir.js'), path.join(ROOT, F51)], {encoding: 'utf8'});
    const son = (yp.stdout || '').trim().split('\n').pop();
    ok('T7a Excel okuyucu: 9 yıllık plan dosyasının hafta, tarih, ders saati, tatil, özel hafta ve kazanım dağılımı gömülü planla aynı', yp.status === 0 && /TAMAM/.test(son), son);
    const {p, ctx} = await sayfa({mod: 'normal'});
    const r = await p.evaluate(async () => {
      V36.ss(V36.SK, '1'); const W = OGRT.W, sy = '2026-2027', sonuc = {};
      for (const ck of Object.keys(W.YP)) {
        const [g, py] = ck.split('|'); OGRT.d.classes = [{g: +g, py}]; OGRT.d.active = ck; OGRT.save(); W.ensure({g: +g, py}, sy);
        const P = W.YP[ck], M = W.srcMap(+g, py, sy) || {}, Y = (W.d.weeks[ck] || {})[sy] || {};
        let ayni = true; Object.entries(M).forEach(([n, x]) => { if ((x.oids || []).length && JSON.stringify(Y[n] || []) !== JSON.stringify(x.oids)) ayni = false; });
        const yanlisProg = Object.values(Y).flat().filter((id) => { const o = Store.get('outcomes', id); return !o || o.programYear !== py || o.grade !== +g; }).length;
        sonuc[ck] = {ayni, hafta: Object.keys(Y).length, yanlisProg, planHafta: P.weeks.filter((w) => w.oids.length).length};
      }
      // planı olmayan sınıf/program: dağılım üretilmez
      OGRT.d.classes = [{g: 5, py: '2018'}]; OGRT.d.active = '5|2018'; OGRT.save(); W.ensure({g: 5, py: '2018'}, sy);
      sonuc.plansiz = {hafta: Object.keys(((W.d.weeks['5|2018'] || {})[sy]) || {}).length, src: !!W.src(5, '2018', sy)};
      go('ogretmen'); await new Promise((r) => setTimeout(r, 300)); OGRT.S().tab = 'hafta'; OGRT.render(); sonuc.plansiz.not = (document.querySelector('.ogw-auto') || {}).textContent || '';
      return sonuc;
    });
    const tum = Object.entries(r).filter(([k]) => k !== 'plansiz');
    ok('T7 Yıllık plan otomatik dağılımı: 9 sınıf/program için haftalar planla birebir; her sınıf kendi planı, 2018/2026 karışmaz', tum.length === 9 && tum.every(([, x]) => x.ayni && x.yanlisProg === 0 && x.hafta === x.planHafta), r);
    ok('T7b Planı olmayan sınıf/program (5. sınıf 2018) için uydurma dağılım yapılmaz, açık bilgi gösterilir', r.plansiz.hafta === 0 && !r.plansiz.src && /yıllık planı yok/.test(r.plansiz.not), r.plansiz);
    await ctx.close();
  }
  {
    // değiştirilmiş Excel: 5. sınıfta 4. ve 6. hafta kazanımları yer değiştirmiş
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dkab51-')), xl = path.join(tmp, '2026-2027dkab5_TYMM.xlsx'), xl6 = path.join(tmp, '2026-2027dkab6_TYMM.xlsx');
    const py = cp.spawnSync('python3', ['-c', `import openpyxl,sys
for src,dst,a,b in [(sys.argv[1],sys.argv[2],'G7','G9'),(sys.argv[3],sys.argv[4],'G6','G8')]:
    wb=openpyxl.load_workbook(src); ws=wb.active; x,y=ws[a].value,ws[b].value; ws[a].value=y; ws[b].value=x; wb.save(dst)`, path.join(ROOT, 'kaynaklar/yillik-plan-2026-2027/2026-2027dkab5_TYMM.xlsx'), xl, path.join(ROOT, 'kaynaklar/yillik-plan-2026-2027/2026-2027dkab6_TYMM.xlsx'), xl6], {encoding: 'utf8'});
    if (py.status !== 0) console.log('python:', py.stderr);
    const {p, ctx} = await sayfa({mod: 'normal'});
    const once = await p.evaluate(async () => {
      V36.ss(V36.SK, '1'); const W = OGRT.W, sy = '2026-2027'; OGRT.d.classes = [{g: 5, py: '2026'}, {g: 6, py: '2026'}]; OGRT.d.active = '5|2026'; OGRT.save();
      W.ensure({g: 5, py: '2026'}, sy); W.ensure({g: 6, py: '2026'}, sy);
      const id = W.list(5, '2026', sy, 1)[0]; W.unplace(5, '2026', sy, 1, id); W.place(5, '2026', sy, 2, id);   // öğretmen düzenlemesi
      return {w1: W.list(5, '2026', sy, 1), w2: W.list(5, '2026', sy, 2), ed5: W.ar(5, '2026', sy).edited, ed6: W.ar(6, '2026', sy).edited, w4_6: W.list(6, '2026', sy, 4)};
    });
    await p.evaluate(() => { sessionStorage.setItem('dk-editor-oturum38', '1'); V38.edGo({k: 'yp51', cid: '', mode: ''}); }); await bek(600);
    await p.setInputFiles('.yp51-f input[type=file]', xl); await bek(1500);
    const on = await p.innerText('#yp51-on'); await p.screenshot({path: path.join(SH, 'editor-yillik-plan-onizleme.png'), fullPage: true});
    await p.click('text=Planı kaydet ve kullan'); await bek(400);
    await p.setInputFiles('.yp51-f input[type=file]', xl6); await bek(1500); await p.click('text=Planı kaydet ve kullan'); await bek(400);
    await p.evaluate(() => sessionStorage.removeItem('dk-editor-oturum38'));
    const sonra = await p.evaluate(async () => {
      go('ogretmen'); await new Promise((r) => setTimeout(r, 300)); OGRT.S().tab = 'hafta'; OGRT.d.active = '5|2026'; OGRT.render(); await new Promise((r) => setTimeout(r, 300));
      const W = OGRT.W, sy = '2026-2027', uy = (document.querySelector('.yp51-c') || {}).innerText || '';
      const r5 = {w1: W.list(5, '2026', sy, 1), w2: W.list(5, '2026', sy, 2), w4: W.list(5, '2026', sy, 4), kaynak4: W.YP['5|2026'].weeks[3].oids, uy};
      OGRT.pick('6|2026', 'hafta'); await new Promise((r) => setTimeout(r, 300));
      const r6 = {w4: W.list(6, '2026', sy, 4), kaynak4: W.YP['6|2026'].weeks[3].oids, bilgi: (document.querySelector('.yp51-b') || {}).innerText || '', ypv: W.ar(6, '2026', sy).ypv};
      return {r5, r6, kayit: Object.keys(JSON.parse(localStorage.getItem('dk-yp51')).plans)};
    });
    await p.evaluate(() => { OGRT.pick('5|2026', 'hafta'); }); await bek(300); await p.screenshot({path: path.join(SH, 'ogretmen-yillik-plan-guncellendi.png')});
    ok('T8a Editör Excel yükler: önizleme (sınıf, program, hafta, eşleşen kazanım, fark) gösterilir, onayla kaydedilir', /5\. sınıf · 2026 programı \(TYMM\)/.test(on) && /37 hafta/.test(on) && /dağılım farklı/.test(on) && sonra.kayit.sort().join() === '5|2026,6|2026', on.slice(0, 260));
    ok('T8 Yeniden yüklemede öğretmenin düzenlemesi sessizce silinmez: plan korunur, açık bilgi + fark + onay seçenekleri gösterilir', JSON.stringify(sonra.r5.w1) === JSON.stringify(once.w1) && JSON.stringify(sonra.r5.w2) === JSON.stringify(once.w2) && JSON.stringify(sonra.r5.w4) !== JSON.stringify(sonra.r5.kaynak4) && /düzenlemelerin korunuyor/.test(sonra.r5.uy) && /Farkları gör/.test(sonra.r5.uy), sonra.r5);
    ok('T8b Düzenlenmemiş öğretmen planı (6. sınıf) yeni plana kendiliğinden geçer ve bilgi verilir', JSON.stringify(sonra.r6.w4) === JSON.stringify(sonra.r6.kaynak4) && /güncellendi/.test(sonra.r6.bilgi) && /^yukleme-/.test(sonra.r6.ypv) && once.ed6 === false, sonra.r6);
    // onayla yeniden kurma: düzenleme yerine yeni plan; notlar ve durumlar silinmez
    const kur = await p.evaluate(async () => { const W = OGRT.W, sy = '2026-2027'; const k = '5|2026|' + sy + '|1'; W.d.notes[k] = [{id: 'Ntest', text: 'not', created: '', updated: ''}]; W.save(); OGRT.d.status['DKAB-5-U01-O03'] = 'plan'; OGRT.save(); W.yp51Fark(); await new Promise((r) => setTimeout(r, 300)); const fark = document.querySelectorAll('.yp51-t tbody tr').length; W.regen(); await new Promise((r) => setTimeout(r, 300)); return {fark, w4: W.list(5, '2026', sy, 4), kaynak4: W.YP['5|2026'].weeks[3].oids, not: (W.d.notes[k] || []).length, st: OGRT.d.status['DKAB-5-U01-O03'], durum: V51.YP.durum({g: 5, py: '2026'}, sy)}; });
    ok('T8c Öğretmen onaylarsa yeni plana göre kurulur (fark listesi gösterilir); haftalık notlar ve kazanım durumları silinmez', kur.fark >= 1 && JSON.stringify(kur.w4) === JSON.stringify(kur.kaynak4) && kur.not === 1 && kur.st === 'plan' && kur.durum === '', kur);
    await ctx.close();
  }

  /* ---------- 12–13. ilerleme ve kayıtların korunması, mobil ---------- */
  {
    const ek = {'dk2': JSON.stringify({patch: {}, added: {}, prog: {'DKAB-5-U01-O01': {correct: 3, wrong: 1, mastery: 0.75}}, cards: {}, wrong: {}}), 'dk-ogretmen-pin': JSON.stringify({v: 2, salt: 'x', h: 'y', len: 4}), 'dk-ogretmen-v1': JSON.stringify({v: 1, app: 'dkab-ogretmen', classes: [{g: 5, py: '2026'}], active: '5|2026', status: {'DKAB-5-U01-O01': 'isl'}, plans: [{id: 'P1', g: 5, py: '2026', oid: 'DKAB-5-U01-O01', date: '2026-09-15', dur: 40, goal: 'Gözlem'}], updatedAt: null})};
    const {p, ctx} = await sayfa({mod: 'normal', ek});
    const anahtar = ['dk2', 'dk-ogretmen-pin', 'dk-ilerleme39', 'dk-deneyim39'];
    const o1 = await p.evaluate((A) => Object.fromEntries(A.map((k) => [k, localStorage.getItem(k)])), anahtar);
    for (const js of ["go('home')", "go('grade',{g:5})", "go('topic',{t:'TPC-5-1-01',tab:'anlat'})", "go('pilerleme')", "go('profil46')", "go('calis45')"]) { await p.evaluate(js); await bek(350); }
    await ogretmenAc(p, [{g: 5, py: '2026'}]); await sekme(p, 'sinif'); await sekme(p, 'diger'); await sekme(p, 'hafta');
    const o2 = await p.evaluate((A) => Object.fromEntries(A.map((k) => [k, localStorage.getItem(k)])), anahtar);
    const og = await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('dk-ogretmen-v1')); return {status: o.status, plans: o.plans.length, prog: Store.ov.prog['DKAB-5-U01-O01']}; });
    const sayi = await p.evaluate(() => Object.fromEntries(['topics', 'questions', 'flashcards', 'outcomes', 'units', 'concepts', 'entities'].map((c) => [c, Store.all(c).filter(vis).length])));
    const ilr = (o) => { const x = JSON.parse(o['dk-ilerleme39'] || '{}'); return JSON.stringify([x.fav, x.ipucu40]); }, dk2 = (o) => JSON.stringify(JSON.parse(o.dk2 || '{}').prog);
    ok('T12 İlerleme ve kayıtlar korunur: dk2 ilerlemesi, öğretmen PIN kaydı, ders planı, durum kayıtları, favoriler ve deneyim aynen (yalnız ziyaret alanları güncellenir)', o1['dk-ogretmen-pin'] === o2['dk-ogretmen-pin'] && o1['dk-deneyim39'] === o2['dk-deneyim39'] && ilr(o1) === ilr(o2) && dk2(o1) === dk2(o2) && og.status['DKAB-5-U01-O01'] === 'isl' && og.plans === 1 && og.prog && og.prog.correct === 3, og);
    ok('T12b Öğrencinin gördüğü içerik V50 ile aynı (geçiş dönemi: 246 konu, 723 soru, 672 kart, 238 kazanım, 629 kavram, 378 kişi/eser)', sayi.topics === 246 && sayi.questions === 723 && sayi.flashcards === 672 && sayi.outcomes === 238 && sayi.concepts === 629 && sayi.entities === 378, sayi);
    await ctx.close();
    const tas = {};
    for (const w of [360, 390, 412, 480]) {
      for (const [mod, js] of [['normal', "go('home')"], ['normal', "go('pilerleme')"], ['premium', "go('psinif',{pg:5})"], ['premium', "go('pilerleme')"], ['normal', 'OGR:hafta'], ['normal', 'OGR:sinif'], ['normal', 'OGR:diger']]) {
        const {p, ctx} = await sayfa({mod, w, h: 780});
        if (js.startsWith('OGR:')) { await ogretmenAc(p, [{g: 5, py: '2026'}]); await sekme(p, js.slice(4)); } else { await p.evaluate(js); await bek(600); }
        tas[w + ' ' + mod + ' ' + js] = await p.evaluate(() => ({t: document.documentElement.scrollWidth - innerWidth, kesik: [...document.querySelectorAll('#bn50:not([hidden]) span, nav.bnav span, .og-main button, .md50')].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent.trim()).slice(0, 4)}));
        if (w === 360 && js === "go('psinif',{pg:5})") await p.screenshot({path: path.join(SH, 'altin-360.png')});
        await ctx.close();
      }
    }
    const kotu = Object.entries(tas).filter(([, x]) => x.t > 0 || x.kesik.length);
    ok('T13 Mobil (360/390/412/480 px): Elmas, Altın, öğretmen ekranlarında yatay taşma yok; alt menü ve sekme yazıları kesilmez', kotu.length === 0, kotu.length ? kotu : Object.keys(tas).length + ' ekran');
  }

  /* ---------- E. öğrenme alanı / editör ayrımı ---------- */
  const tara = async (p, liste) => { const o = {}; for (const [ad, js] of liste) { await p.evaluate(js); await bek(600); const t = await metin(p); const m = t.match(EDITORYAL); o[ad] = m ? m[0] + ' … ' + t.slice(Math.max(0, m.index - 40), m.index + 60).replace(/\n/g, ' ') : ''; } return o; };
  const ELMAS = [['ana', "go('home')"], ['sinif4', "go('grade',{g:4})"], ['sinif9', "go('grade',{g:9})"], ['konu', "go('topic',{t:'TPC-5-1-01',tab:'anlat'})"], ['konu4', "go('topic',{t:Store.all('topics').find(t=>t.grade==4).id,tab:'anlat'})"], ['kaynaklar', "go('topic',{t:'TPC-5-1-01',tab:'kay'})"], ['kavram', "go('kavram')"], ['kisi', "go('kisi')"], ['sd', "go('sd')"], ['oyunlar', "go('games')"], ['profil', "go('profil46')"]];
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    const r = await tara(p, ELMAS);
    const kay = await p.evaluate(() => ({tab: G.tab, dugme: !!document.querySelector('[onclick*="tabTo(\'kay\')"]')}));
    await p.evaluate(() => go('grade', {g: 4})); await bek(500); await p.screenshot({path: path.join(SH, 'elmas-4-sinif-ogrenci.png')});
    ok('E1 Öğrenci Elmas: sınıf, konu, kavram, kişi, sure-dua, oyun, Profilim ekranlarında künye/ISBN/PDF/kaynak kodu/doğrulama/taslak bilgisi yok; Kaynaklar sekmesi yok', Object.values(r).every((x) => !x) && !kay.dugme, Object.entries(r).filter(([, x]) => x));
    const kz = await p.evaluate(async () => { go('grade', {g: 5}); await new Promise((r) => setTimeout(r, 400)); const t = document.querySelector('main').innerText; return {kazanim: /Kazanımlar|öğrenme çıktı/i.test(t), unite: document.querySelectorAll('main .unum, main h3, main h2').length}; });
    ok('E1b Eğitsel içerik korunur: ünite başlıkları, konular, kazanımlar ve açıklamalar görünür', kz.kazanim && kz.unite >= 3, kz);
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'premium', tema: 'dark'});
    const r = await tara(p, [['sinif', "go('psinif',{pg:4})"], ['unite', "go('punite',{pg:4,pu:Store.all('units').find(u=>u.grade==4&&u.programYear=='2018').id})"], ['ders', "go('pders',{pt:'TPC-5-1-01',ptab:''})"], ['kaynak', "go('pders',{pt:'TPC-5-1-01',ptab:'kay'})"], ['ozet', "go('pozet',{pg:5})"]]);
    const kay = await p.evaluate(() => ({ptab: G.ptab, dugme: [...document.querySelectorAll('main button')].some((b) => /^Kaynaklar$/.test(b.textContent.trim()))}));
    ok('E2 Öğrenci Altın: sınıf merkezi, ünite, ders, özet ekranlarında editoryal/teknik bilgi yok; Kaynaklar sekmesi yok', Object.values(r).every((x) => !x) && !kay.dugme && kay.ptab !== 'kay', {r, kay});
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    await p.evaluate(() => V36.ss(V36.SK, '1')); await bek(100);
    const r = await tara(p, ELMAS.slice(1, 6));
    await p.evaluate(() => { const b = Store.all('textbooks').find((t) => t.grade == 4); go('book', {b: b.id}); }); await bek(500);
    const kitap = await p.evaluate(() => ({uyari: !!document.querySelector('.ue51'), metin: document.querySelector('main').innerText}));
    await p.screenshot({path: path.join(SH, 'erisim-uyarisi-kitap.png')});
    await p.evaluate(() => go('admin')); await bek(500); const adm = await p.evaluate(() => ({uyari: !!document.querySelector('.ue51'), t: document.querySelector('main').innerText.slice(0, 120)}));
    await p.evaluate(() => go('editor')); await bek(500); const edr = await p.evaluate(() => ({liste: !!document.querySelector('.ed38-cats'), edOk: V38.edOk()}));
    await p.evaluate(() => go('bildirim48')); await bek(500); const bil = await p.evaluate(() => ({merkez: !!document.querySelector('.b48-merkez, .b48-e'), t: document.querySelector('main').innerText.slice(0, 80)}));
    const deg = await p.evaluate(() => { const r0 = Store.get('topics', 'TPC-5-1-01'); V51.Yayin.sikiAyarla(true); return {siki: V51.Yayin.siki(), vis: vis(r0)}; });
    ok('E3 Normal öğretmen (öğrenme alanında) künye/doğrulama bilgisini görmez; editör alanını PIN’siz açamaz', Object.values(r).every((x) => !x) && !edr.liste && !edr.edOk, {r, edr});
    ok('E4 Doğrudan rota: kitap (künye/program sürümü) ve yönetim ekranı erişim uyarısı verir, veri gösterilmez; bildirim merkezi kapalı; yayın kuralını değiştiremez', kitap.uyari && !/ISBN|Künye|Yayınevi/.test(kitap.metin) && adm.uyari && !bil.merkez && deg.siki === false && deg.vis === true, {kitap: kitap.metin.slice(0, 100), adm, bil, deg});
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    await p.evaluate(() => sessionStorage.setItem('dk-editor-oturum38', '1'));
    await p.evaluate(() => go('grade', {g: 4})); await bek(500); const g4 = await metin(p);
    await p.evaluate(() => { const b = Store.all('textbooks').find((t) => t.grade == 4); go('book', {b: b.id}); }); await bek(600); const kt = await metin(p);
    await p.screenshot({path: path.join(SH, 'editor-kitap-kunye.png')});
    await p.evaluate(() => V38.edGo({k: 'yayin51', cid: '', mode: ''})); await bek(600); const yy = await metin(p);
    await p.screenshot({path: path.join(SH, 'editor-yayin-durumu.png'), fullPage: true});
    await p.evaluate(() => V38.edGo({k: 'veri51', cid: '', mode: ''})); await bek(500); const vv = await metin(p);
    ok('E5 Editör her şeyi görür ve kullanır: kitap künyesi, program sürümü, doğrulama; Yayın durumu ve Veri yönetimi ekranları', /Künye/.test(kt) && /ISBN/.test(kt) && /Program sürümü/.test(kt) && /taslak/i.test(g4) && /Yayından kaldırıldı/.test(yy) && /Sıkı yayın/.test(yy) && /yedekle/i.test(vv), {kt: kt.slice(0, 120), yy: yy.slice(0, 120)});
    // durum modeli ve görünürlük
    const r = await p.evaluate(() => {
      const ED = V38.ED, Y = V51.Yayin, T = Store.all('topics').filter((t) => t.status !== 'archived').slice(0, 6), it = (t) => ED.ensure('topics', t);
      it(T[0]).state = 'red'; it(T[1]).state = 'onay'; it(T[2]).state = 'onay'; it(T[2]).published = {vid: 'v1', at: 'x'}; it(T[3]).state = 'onay'; it(T[3]).kaldirildi51 = {at: 'x'}; it(T[4]).state = 'duzeltme';
      const d = T.map((t) => Y.durum(t));
      sessionStorage.removeItem('dk-editor-oturum38');
      const v0 = T.map((t) => vis(t));
      localStorage.setItem('dk-yayin51', JSON.stringify({v: 1, siki: true})); const v1 = T.map((t) => vis(t));
      localStorage.setItem('dk-yayin51', JSON.stringify({v: 1, siki: false}));
      return {d, v0, v1, taslak: Y.durum({status: 'draft'}), inc: Y.durum({status: 'review'})};
    });
    ok('E6 Yayın durumu: Reddedildi / Onaylandı / Yayında / Yayından kaldırıldı / İnceleme / Taslak doğru türetilir (onaylandı ≠ yayında)', r.d.slice(0, 5).join() === 'reddedildi,onaylandi,yayinda,kaldirildi,inceleme' && r.taslak === 'taslak' && r.inc === 'inceleme', r.d);
    ok('E7 Geçiş dönemi: reddedilen ve yayından kaldırılan öğrenciden hemen gizlenir, diğerleri görünür; sıkı yayında yalnız “Yayında” görünür', r.v0.join() === 'false,true,true,false,true,true' && r.v1.join() === 'false,false,true,false,false,false', {v0: r.v0, v1: r.v1});
    await ctx.close();
  }

  ok('Z1 sayfa hatası (pageerror) yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); srv.close();
  const g = S.filter((x) => x.ok).length; console.log(`\nToplam: ${g}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), sonuc: S}, null, 1));
  process.exitCode = g === S.length ? 0 : 1;
})().catch((e) => { console.error(e); process.exit(1); });
