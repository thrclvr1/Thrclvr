// V59.1 testleri (depo kökünden): node tests/v59_1/test_v591.js — ekran görüntüleri docs/V59.1_ekran/.
// Tarayıcı otomasyonu (yerel http, başsız Chromium, telefon görünümü). Gerçek telefon ve Android WebView burada DENENEMEZ.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v59.1.html', F0 = 'surumler/din-kulturu-platformu-v59.0.html';
const SH = path.join(ROOT, 'docs', 'V59.1_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 700) : '')); };
const rgb = (c) => { c = String(c); if (/^#/.test(c)) return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const n = c.match(/[\d.]+/g).map(Number); return /^color\(srgb/.test(c) ? n.slice(0, 3).map((x) => x * 255) : n.slice(0, 3); };
const lum = (c) => { const v = rgb(c).map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4))); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const kon = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const ton = (c) => { const [r, g, b] = rgb(c).map((x) => x / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return -1; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };

(async () => {
  const h1 = AC(fs.readFileSync(path.join(ROOT, F), 'utf8')), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v59.1'));
  ok('A1 sürüm V59.1, index.html aynı; bütün veri blokları V59.0 ile bayt bayt aynı; eski sürüm dosyaları ve APK’lar değişmedi; açık PIN/e-posta yok; Altın öğrenciye kapalı',
    /V31\.VER="V59\.1"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === fs.readFileSync(path.join(ROOT, F), 'utf8') && JSON.stringify(s0) === JSON.stringify(s1) && degisen.length === 0 && !/@gmail\.com/.test(h1) && !h1.includes('030792') && /ACIK: false,/.test(h1), degisen);

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const b = await chromium.launch();
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, ses: {}, dpr: 1}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true, deviceScaleFactor: o.dpr, colorScheme: 'dark'});
    await ctx.route('https://**/*', (r) => r.abort());
    await ctx.addInitScript(([o]) => {
      if (!localStorage.getItem('__s')) { localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1'); localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true})); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); localStorage.setItem('dk-gorunum54', JSON.stringify({v: 1, altin: 1})); localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: 6}}})); }
      for (const k in o.ses) sessionStorage.setItem(k, o.ses[k]);
      try { const iv = setInterval(() => { if (window.V51 && V51.Yonetici) { V51.Yonetici.tamam = () => true; clearInterval(iv); } }, 5); } catch (e) {}
    }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (er) => HATA.push(er.message));
    await p.goto(ORIGIN + '/' + F); await p.waitForTimeout(2300);
    return {p, ctx};
  };
  const ED = {'dk-editor-oturum38': '1'};
  const LINK = `[onclick*="go('links'"], [onclick*='go("links"'], [onclick*="V34.see"], [onclick*="seeConcept"], .v34f, .lk-see`;

  /* ---------- B: Bağlantılar Elmas'ta yok ---------- */
  for (const [ad, ses] of [['öğrenci', {}], ['editör', ED]]) {
    const {p, ctx} = await sayfa({ses, dpr: 2});
    const vahiy = await p.evaluate(() => (Store.all('concepts').find((c) => /^vahiy$/i.test(c.term) && V34.of('concept', c.id).length) || Store.all('concepts').find((c) => V34.of('concept', c.id).length)).id);
    const r = await p.evaluate(async ([vahiy, LINK]) => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 900)), o = {altin: !!V39.on, ekran: {}};
      for (const [v, a] of [['home'], ['grade', {g: 6}], ['topic', {t: 'TPC-6-1-01', tab: 'anlat'}], ['atlas57'], ['search'], ['profil46'], ['games']]) { go(v, a || {}); await bk(); o.ekran[v] = [...document.querySelectorAll(LINK)].filter((e) => !/yonetim/.test(e.getAttribute('onclick') || '')).length; }
      V30.rec('concepts', vahiy); await bk(700); const sh = document.querySelector('.v-ov') || document.body;
      o.sheet = {acik: !!document.querySelector('.v-ov'), harita: /Kavram haritasında gör/.test(sh.innerText), dugme: sh.querySelectorAll(LINK).length, anlatim: /Anlatımda göster/.test(sh.innerText)};
      UI.close(); await bk(500);
      go('links', {lk: {tab: 'harita'}}); await bk(); o.git1 = view;
      try { V34.seeConcept(vahiy); } catch (e) {} await bk(); o.git2 = view;
      try { V34.see('TPC-6-1-01'); } catch (e) {} await bk(); o.git3 = view;
      return o;
    }, [vahiy, LINK]);
    if (ad === 'editör') await p.screenshot({path: path.join(SH, 'elmas-kavram-penceresi-editor.png')});
    ok(`B1 Elmas (${ad}): hiçbir ekranda ve kavram penceresinde Bağlantılar/Kavram Haritası düğmesi yok (editörün Yönetim bağlantıları hariç) (“Kavram haritasında gör” yok; “Anlatımda göster” duruyor); go('links'), V34.seeConcept, V34.see → Bilgi Atlası`,
      !r.altin && Object.values(r.ekran).every((n) => n === 0) && r.sheet.acik && !r.sheet.harita && r.sheet.dugme === 0 && r.sheet.anlatim && r.git1 === 'atlas57' && r.git2 === 'atlas57' && r.git3 === 'atlas57', r);
    if (ad === 'editör') {
      const y = await p.evaluate(async () => {
        const bk = (ms) => new Promise((r) => setTimeout(r, ms || 900)), o = {};
        go('admin'); await bk(); G.at = 'baglanti'; draw(); await bk(500); o.adminDugme = !!document.querySelector(`[onclick*="tab:'yonetim'"]`);
        go('links', {lk: {tab: 'yonetim'}}); await bk(); o.view = view; o.tab = V34.S().tab; o.sekmeler = [...document.querySelectorAll('#app .lk-tabs button')].map((x) => x.textContent.trim());
        try { V34.sel('concept', Store.all('concepts')[0].id); } catch (e) {} await bk(); o.sonra = {view, tab: V34.S().tab};
        return o;
      });
      ok('B2 Elmas (editör): yönetim ekranındaki “Bağlantılar › Yönetim” girişi açık; Bağlantılar yalnız Yönetim sekmesiyle açılır, Kavram Haritası sekmesi yok, haritaya geçilemez', y.view === 'links' && y.tab === 'yonetim' && y.sekmeler.every((t) => /Yönetim/.test(t)) && y.sonra.tab === 'yonetim', y);
      // Altın'da aynen
      const al = await p.evaluate(async (vahiy) => {
        const bk = (ms) => new Promise((r) => setTimeout(r, ms || 1200)), o = {};
        V53.Onizleme.baslat(); await bk(1500); o.altin = !!V39.on;
        go('links', {lk: {tab: 'harita'}}); await bk(); o.view = view; o.arama = !!document.querySelector('#km59-q');
        V30.rec('concepts', vahiy); await bk(700); o.harita = /Kavram haritasında gör/.test((document.querySelector('.v-ov') || document.body).innerText); UI.close(); await bk(500);
        V34.seeConcept(vahiy); await bk(); o.sec = {view, sel: V34.S().sel};
        go('pdunya'); await bk(2000); o.bg58 = !!document.querySelector('.bg58');
        return o;
      }, vahiy);
      await p.screenshot({path: path.join(SH, 'altin-baglantilar-karti.png')});
      ok('B3 Altın’da Bağlantılar aynen: Kavram Haritası ve araması açılıyor, kavram penceresinde “Kavram haritasında gör” var ve haritayı açıyor, Keşif’teki Bağlantılar kartı duruyor',
        al.altin && al.view === 'links' && al.arama && al.harita && al.sec.view === 'links' && al.sec.sel && al.sec.sel.id === vahiy && al.bg58, al);
    }
    await ctx.close();
  }

  /* ---------- K: kazanım kartı temaya göre ---------- */
  {
    const {p, ctx} = await sayfa({dpr: 2});
    await p.evaluate(async () => { V50.Mod.gec('ogretmen'); await new Promise((r) => setTimeout(r, 1200)); OGRT.S().tab = 'siniflar'; OGRT.render(); await new Promise((r) => setTimeout(r, 600)); const bb = [...document.querySelectorAll('#app button')].find((x) => x.textContent.trim() === 'Ekle'); if (bb) bb.click(); await new Promise((r) => setTimeout(r, 800)); OGRT.S().tab = 'haftalik'; OGRT.render(); await new Promise((r) => setTimeout(r, 900)); });
    const R = {};
    for (const t of ['altin', 'lacivert', 'zumrut', 'murekkep', 'kumtasi', 'elmas']) for (const m of ['gunduz', 'gece']) {
      R[t + '/' + m] = await p.evaluate(async ([t, m]) => {
        if (t === 'elmas') V57.Tema.elmas('ogretmen', m); else { V54.Tema.sec('ogretmen', t); V54.Tema.mod('ogretmen', m); } await new Promise((r) => setTimeout(r, 500)); OGRT.render(); await new Promise((r) => setTimeout(r, 600));
        const k = document.querySelector('.ogw-c.c-kaz'); if (k.tagName === 'DETAILS') k.open = true; window.scrollTo(0, k.getBoundingClientRect().top + scrollY - 70); await new Promise((r) => setTimeout(r, 250));
        const c = getComputedStyle(k), d = getComputedStyle(document.documentElement), bd = getComputedStyle(document.body), z = c.getPropertyValue('--kz59-z1').trim(), z2 = c.getPropertyValue('--kz59-z2').trim();
        const ac = k.querySelector('.ogw-kr .ogw-b.p'), mt = k.querySelector('.ogw-kt'), sb = k.parentElement.querySelector('.ogw-c:not(.c-kaz)') || document.querySelector('.ogw-c:not(.c-kaz)');
        const kod = k.querySelector('.ogw-l code, .ogw-kt code, code');
        return {th: document.documentElement.dataset.tema54o + '/' + document.documentElement.dataset.tema54om, z, z2, bg: bd.backgroundColor, std: sb ? getComputedStyle(sb).backgroundColor : '', ink: getComputedStyle(mt).color, acBg: getComputedStyle(ac).backgroundImage, acInk: getComputedStyle(ac).color, g2: c.getPropertyValue('--kz59-g2').trim(), kodBg: getComputedStyle(kod).backgroundImage, bdr: c.borderTopColor, metin: mt.textContent.trim()};
      }, [t, m]);
      if (m === 'gunduz' || t === 'elmas') { const box = await p.evaluate(() => { const r = document.querySelector('.ogw-c.c-kaz').getBoundingClientRect(); return {x: 0, y: Math.max(0, r.top - 8), width: 390, height: Math.min(r.height + 16, 800)}; }); await p.screenshot({path: path.join(SH, `kazanim-${t}-${m}.png`), clip: box}); }
    }
    const L = Object.entries(R);
    ok('K1 Kazanım kartı her temada o temanın kendi tonunda: 12 görünümün (6 tema × gündüz/gece) hepsinde kart zemini farklı; gündüzde kart, standart kartlardan ve sayfa zemininden daha koyu',
      new Set(L.map(([, x]) => x.z)).size === 12 && L.filter(([k]) => /gunduz/.test(k)).every(([, x]) => lum(x.z) < lum(x.bg) && lum(x.z) < lum(x.std || '#fff')), Object.fromEntries(L.map(([k, x]) => [k, [x.z, x.bg, x.std]])));
    const tonu = (k) => ton(R[k].z);
    ok('K2 Ton temaya ait: Altın Mihrap/Kum Taşı sıcak (kahve), Lacivert ve Elmas mavi, Zümrüt yeşil, Mürekkep mor; Elmas’ta “İçeriği aç” ve kod rozeti mavi, diğer temalarda temanın altın vurgusu',
      ['altin/gunduz', 'kumtasi/gunduz', 'altin/gece', 'kumtasi/gece'].every((k) => tonu(k) >= 20 && tonu(k) <= 50) && ['lacivert/gunduz', 'elmas/gunduz', 'lacivert/gece', 'elmas/gece'].every((k) => tonu(k) >= 200 && tonu(k) <= 235) && ['zumrut/gunduz', 'zumrut/gece'].every((k) => tonu(k) >= 130 && tonu(k) <= 170) && ['murekkep/gunduz', 'murekkep/gece'].every((k) => tonu(k) >= 270 && tonu(k) <= 310) && ton(R['elmas/gece'].g2) > 200 && ton(R['elmas/gunduz'].g2) > 200 && ton(R['lacivert/gunduz'].g2) < 60,
      Object.fromEntries(L.map(([k, x]) => [k, Math.round(ton(x.z))])));
    ok('K3 Okunurluk: kazanım metni kart zemininde ≥ 7 (AAA), “İçeriği aç” yazısı düğme renginde ≥ 4.5; metin aynen', L.every(([, x]) => kon(x.ink, x.z) >= 7 && kon(x.ink, x.z2) >= 7 && kon(x.acInk, x.g2) >= 4.5 && x.metin === R['altin/gunduz'].metin),
      Object.fromEntries(L.map(([k, x]) => [k, [kon(x.ink, x.z), kon(x.acInk, x.g2)]])));
    await ctx.close();
  }

  ok('Z9 Sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); st.close();
  const gecen = S.filter((x) => x.ok).length;
  console.log(`\n${gecen}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen, toplam: S.length, kontroller: S}, null, 1));
  process.exit(gecen === S.length ? 0 : 1);
})();
