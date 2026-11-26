// V58.0 testleri (depo kökünden): node tests/v58/test_v580.js — ekran görüntüleri docs/V58.0_ekran/.
// Tarayıcı otomasyonu (yerel http, başsız Chromium, telefon görünümü). Gerçek telefon ve Android WebView burada DENENEMEZ.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v58.0.html', F0 = 'surumler/din-kulturu-platformu-v57.0.html';
const SH = path.join(ROOT, 'docs', 'V58.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 700) : '')); };
const hex2 = (c) => (/^#/.test(c) ? 'rgb(' + [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)).join(',') + ')' : c);
const lum = (c) => { const m = hex2(String(c).trim()).match(/[\d.]+/g).map(Number); const v = m.slice(0, 3).map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4))); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const kon = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const koyu = (c) => lum(c) < 0.08, acik = (c) => lum(c) > 0.6;

(async () => {
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v58.0'));
  ok('A1 sürüm V58.0, index.html aynı; V57.0’ın bütün veri blokları bayt bayt aynı, yalnız yeni seed-oyun58 eklendi; eski sürüm dosyaları ve APK’lar değişmedi',
    /V31\.VER="V58\.0"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.entries(s0).every(([k, v]) => s1[k] === v) && Object.keys(s1).length === Object.keys(s0).length + 1 && !!s1['seed-oyun58'] && degisen.length === 0, degisen);
  const java = fs.readFileSync(path.join(ROOT, 'android/app/src/main/java/tr/dkab/platform/MainActivity.java'), 'utf8');
  ok('A2 Gmail adresi ve açık PIN yok; Altın hâlâ öğrenciye kapalı (ACIK: false); Android sarmalayıcısı üst boşluğu bir kez uygulayıp kenar bilgisini tüketiyor',
    !/@gmail\.com/.test(h1) && !h1.includes('030792') && /ACIK: false,/.test(h1) && /v\.setPadding\(l, t, r, b\);[\s\S]{0,400}return WindowInsets\.CONSUMED;[\s\S]{0,80}consumeSystemWindowInsets\(\)/.test(java));

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const b = await chromium.launch();
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, ek: {}, ses: {}, dpr: 1, sinif: 4, renk: 'dark'}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true, deviceScaleFactor: o.dpr, colorScheme: o.renk});
    await ctx.route('https://accounts.google.com/**', (r) => r.abort()); await ctx.route('https://www.googleapis.com/**', (r) => r.abort()); await ctx.route('https://www.youtube.com/**', (r) => r.abort());
    await ctx.addInitScript(([o]) => {
      if (!localStorage.getItem('__s')) {
        localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1');
        localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true}));
        localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false}));
        localStorage.setItem('dk-gorunum54', JSON.stringify({v: 1, altin: 1}));
        if (o.sinif) localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: o.sinif}}}));
        for (const k in o.ek) localStorage.setItem(k, o.ek[k]);
      }
      for (const k in o.ses) sessionStorage.setItem(k, o.ses[k]);
    }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (er) => HATA.push(er.message));
    await p.goto(ORIGIN + '/' + F); await p.waitForTimeout(2300);
    return {p, ctx};
  };
  const altinAc = (p) => p.evaluate(async () => { V51.Yonetici.tamam = () => true; V53.Onizleme.baslat(); await new Promise((r) => setTimeout(r, 1500)); });
  const ED = {'dk-editor-oturum38': '1'};

  /* ---------- T: Öğretmen Modu gündüz/gece, modlar arası bağımsızlık, Önerilen ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2, ek: {'dk-theme': 'dark', 'dk-ptema43': 'gece'}});
    const durum = `const d = document.documentElement, b = getComputedStyle(document.body); return {view, th: d.dataset.theme, om: d.dataset.tema54om, kayit: JSON.parse(localStorage.getItem('dk-tema54') || '{}'), dkTheme: localStorage.getItem('dk-theme'), ptema: localStorage.getItem('dk-ptema43'), bg: b.backgroundColor, ink: b.color};`;
    const t = await p.evaluate(async (durum) => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 700)), D = new Function(durum), o = {};
      V50.Mod.gec('ogretmen'); await bk(1200); o.ilk = D();
      document.querySelector('header.top [data-themebtn]').click(); await bk(); o.dugme1 = D(); o.etiket1 = document.querySelector('header.top [data-themebtn]').getAttribute('aria-label');
      document.querySelector('header.top [data-themebtn]').click(); await bk(); o.dugme2 = D();
      V54.Tema.ac('ogretmen'); await bk(); const btn = (r) => [...document.querySelectorAll('.tm57-m button')].find((x) => r.test(x.textContent));
      btn(/Gündüz/).click(); await bk(); o.sheetGunduz = D(); o.basili = [...document.querySelectorAll('.tm57-m button')].map((x) => x.getAttribute('aria-pressed'));
      btn(/Gece/).click(); await bk(); o.sheetGece = D();
      btn(/Otomatik/).click(); await bk(); o.sheetOto = D();
      UI.close(); await bk(400);
      return o;
    }, durum);
    ok('T1 Öğretmen Modu: üst çubuktaki güneş/ay düğmesi Öğretmen Modu’nun gündüz/gece ayarını değiştirir (kayıt ogretmenMod), ekran gerçekten açılır/kararır; Elmas’ın tercihi (dk-theme) ve Altın’ın ayarı (dk-ptema43) değişmez',
      t.ilk.view === 'ogretmen' && koyu(t.ilk.bg) && t.dugme1.kayit.ogretmenMod === 'gunduz' && t.dugme1.th === 'light' && acik(t.dugme1.bg) && t.dugme2.kayit.ogretmenMod === 'gece' && koyu(t.dugme2.bg) && t.dugme1.dkTheme === 'dark' && t.dugme2.dkTheme === 'dark' && t.dugme2.ptema === 'gece' && /Öğretmen Modu/.test(t.etiket1), t);
    ok('T2 Öğretmen Modu tema penceresi: Gündüz gerçekten gündüz, Gece gerçekten gece, Otomatik cihaz temasına göre (koyu cihaz → gece); seçili düğme doğru; Elmas/Altın ayarları değişmez',
      acik(t.sheetGunduz.bg) && t.sheetGunduz.th === 'light' && t.basili[0] === 'true' && koyu(t.sheetGece.bg) && t.sheetGece.th === 'dark' && t.sheetOto.kayit.ogretmenMod === 'oto' && t.sheetOto.om === 'gece' && koyu(t.sheetOto.bg) && t.sheetOto.dkTheme === 'dark' && t.sheetOto.ptema === 'gece', t);
    await p.screenshot({path: path.join(SH, 'ogretmen-gece.png')});
    // Otomatik + açık cihaz teması
    await p.emulateMedia({colorScheme: 'light'}); await p.waitForTimeout(700);
    const oto = await p.evaluate((durum) => new Function(durum)(), durum);
    await p.screenshot({path: path.join(SH, 'ogretmen-otomatik-acik-cihaz.png')});
    // modlar arası geçiş: her mod kendi tercihini korur
    const gec = await p.evaluate(async (durum) => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 900)), D = new Function(durum), o = {};
      V54.Tema.mod('ogretmen', 'gunduz'); await bk(500);
      V50.Mod.gec('elmas'); await bk(); o.elmas = D();
      V51.Yonetici.tamam = () => true; V53.Onizleme.baslat(); await bk(1500); go('psinif', {pg: 4}); await bk(); o.altin = Object.assign(D(), {pt: document.documentElement.dataset.pt43});
      V50.Mod.gec('ogretmen'); await bk(1200); o.ogr = D();
      return o;
    }, durum);
    ok('T3 Modlar arası geçiş: Öğretmen Otomatik açık cihazda gündüz; Öğretmen=Gündüz iken Elmas koyu kalır, Altın gece kalır, Öğretmen’e dönünce yine gündüz',
      oto.om === 'gunduz' && acik(oto.bg) && gec.elmas.th === 'dark' && koyu(gec.elmas.bg) && gec.altin.pt === 'gece' && koyu(gec.altin.bg) && gec.ogr.kayit.ogretmenMod === 'gunduz' && acik(gec.ogr.bg) && gec.ogr.dkTheme === 'dark', {oto, gec});
    await p.emulateMedia({colorScheme: 'dark'});
    await ctx.close();
  }
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2});
    await altinAc(p);
    const r = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 700)), o = {};
      const say = () => [...document.querySelectorAll('.on58')].map((x) => (x.previousElementSibling || {}).textContent);
      V54.Tema.ac('altin'); await bk(); o.altin = say(); o.altinGrup = [...document.querySelectorAll('.v-ov .tm54:not(.tm57-el) .on58')].length; UI.close(); await bk(400);
      go('pdunya'); await bk(); o.ana = document.querySelectorAll('.on58').length;
      V50.Mod.gec('ogretmen'); await bk(1200); V54.Tema.ac('ogretmen'); await bk(); o.ogretmen = say(); UI.close(); await bk(400);
      V50.Mod.gec('elmas'); await bk(1200); go('ayar47', {at: 'tema'}); await bk(900); o.elmasEkran = [...document.querySelectorAll('.a47-to .on58')].map((x) => x.closest('button').querySelector('b').textContent);
      go('home'); await bk(); o.elmasAna = document.querySelectorAll('.on58').length;
      return o;
    });
    ok('T4 “Önerilen”: Altın tema ekranında Altın Mihrap (Altın temaları arasında tek) ve Elmas · Koyu; Öğretmen ekranında Elmas · Koyu; Elmas’ın kendi tema seçiminde Koyu; ana sayfalarda işaret yok',
      JSON.stringify(r.altin) === JSON.stringify(['Altın Mihrap', 'Elmas · Koyu']) && r.altinGrup === 1 && JSON.stringify(r.ogretmen) === JSON.stringify(['Elmas · Koyu']) && JSON.stringify(r.elmasEkran) === JSON.stringify(['Koyu']) && r.ana === 0 && r.elmasAna === 0, r);
    await p.evaluate(async () => { V50.Mod.gec('elmas'); await new Promise((r) => setTimeout(r, 1000)); V51.Yonetici.tamam = () => true; V53.Onizleme.baslat(); await new Promise((r) => setTimeout(r, 1500)); V54.Tema.ac('altin'); await new Promise((r) => setTimeout(r, 700)); });
    await p.screenshot({path: path.join(SH, 'altin-tema-onerilen.png')});
    await ctx.close();
  }

  /* ---------- B: Altın ana sayfa Bilgi Atlası + Bağlantılar; Bilgi Atlası araması ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2});
    await altinAc(p);
    const a = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 900)), o = {};
      go('pdunya'); await bk(1200);
      o.kesif = [...document.querySelectorAll('.ah56-kl .ah56-r b')].map((x) => x.textContent);
      const bg = document.querySelector('.bg58'); o.bg = !!bg; o.dugum = bg ? [...bg.querySelectorAll('.bg58-n')].map((x) => x.textContent) : [];
      o.gercek = o.dugum.length ? (() => { const m = Store.all('concepts').find((c) => c.term && c.term.toLocaleLowerCase('tr-TR') === o.dugum[0].toLocaleLowerCase('tr-TR') && +c.grade === 4); return m ? KV.rel(m).map((x) => x.term.toLocaleLowerCase('tr-TR')) : null; })() : null;
      o.sira = bg ? [...bg.parentElement.children].indexOf(bg) : -1;
      const r = bg.getBoundingClientRect(), d = document.querySelector('.ah56-kl .ah56-r').getBoundingClientRect(); o.boy = [Math.round(r.height), Math.round(d.height)];
      return o;
    });
    await p.waitForTimeout(1500); await p.evaluate(() => { const k = document.querySelector('.bg58'); window.scrollTo(0, k.getBoundingClientRect().top + scrollY - 70); }); await p.waitForTimeout(400);
    await p.screenshot({path: path.join(SH, 'altin-kesif-baglantilar.png')});
    const a2 = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 900)), o = {};
      document.querySelector('.ah56-kl .ah56-r[onclick*="atlas57"]').click(); await bk(); o.atlas = view; o.sekme = [...document.querySelectorAll('.ba57 button')].map((x) => x.textContent.replace(/\s+\d+$/, '').trim());
      go('pdunya'); await bk(1100); document.querySelector('.bg58').click(); await bk(1100); o.bag = view; o.bagBaslik = (document.querySelector('h1') || {}).textContent;
      return o;
    });
    ok('B1 Altın ana sayfa Keşif: “Kavramlar” ve “Kişiler ve Eserler” ayrı kartları yok, tek “Bilgi Atlası” kartı (Kavramlar · Kişiler · Eserler sekmeli) var; Sureler ve Dualar duruyor',
      !a.kesif.includes('Kavramlar') && !a.kesif.includes('Kişiler ve Eserler') && a.kesif.includes('Bilgi Atlası') && a.kesif.includes('Sureler ve Dualar') && a2.atlas === 'atlas57' && ['Kavramlar', 'Kişiler', 'Eserler'].every((x) => a2.sekme.includes(x)), {a, a2});
    ok('B2 Altın ana sayfa Bağlantılar kartı öne çıkar: Keşif’in başında, diğer kartlardan büyük; haritadaki kavramlar gerçek kayıtlar (merkez + ders metninde birlikte geçtiği kavramlar); dokununca mevcut Bağlantılar › Kavram Haritası açılır',
      a.bg && a.sira >= 0 && a.boy[0] > a.boy[1] * 2 && a.dugum.length >= 4 && a.gercek && a.dugum.slice(1).every((x) => a.gercek.includes(x.toLocaleLowerCase('tr-TR'))) && a2.bag === 'links' && /Bağlantılar/.test(a2.bagBaslik), {a, a2});
    await ctx.close();
  }
  for (const [mod, ac] of [['Elmas', false], ['Altın', true]]) {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2});
    if (ac) await altinAc(p);
    const r = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 800)), o = {};
      const durum = () => ({sekme: [...document.querySelectorAll('.ba57 button')].map((x) => x.textContent.trim()), grup: [...document.querySelectorAll('.ar58-h')].map((x) => x.textContent.trim()), kart: document.querySelectorAll('.ar58 details.cp').length, oz: (document.querySelector('.ar58-oz') || {}).textContent});
      go('atlas57'); await bk(); V57.Atlas.git('eser'); await bk();
      const inp = document.querySelector('section.hero .search input'); inp.value = 'Musa'; inp.dispatchEvent(new Event('change', {bubbles: true})); await bk(); o.musa = durum();
      // beklenen (aynı kayıt listesi): KV.items ile
      const st = KV.st; const y = JSON.stringify(st); st.concepts.q = 'Musa'; st.concepts.t = ''; st.entities.q = 'Musa'; st.entities.t = ''; o.bek = {k: KV.items('concepts').length, e: KV.items('entities').length}; Object.assign(st, JSON.parse(y));
      V58.Atlas.filtre('kisi'); await bk(); o.kisi = durum();
      V58.Atlas.ara('abdest'); await bk(); o.abdest = durum();
      V58.Atlas.ara('Muhammed'); await bk(); o.muh = durum(); V58.Atlas.sec('g', '9'); await bk(); o.muh9 = durum(); o.muh9sinif = [...document.querySelectorAll('.ar58 details.cp summary .tag:first-of-type')].map((x) => x.textContent);
      V58.Atlas.sec('g', ''); V58.Atlas.temizle(); await bk(); o.temiz = {q: document.querySelector('section.hero .search input').value, liste: document.querySelectorAll('details.card.cp').length, ar: !!document.querySelector('.ar58')};
      return o;
    });
    const top = (x) => +((x.sekme[0] || '').match(/\d+/) || [0])[0];
    ok(`B3 ${mod}: Bilgi Atlası araması bütün kategorilerde (Eserler sekmesi açıkken “Musa” → Kişiler ve Diğer kayıtlar sonuçları), sonuçlar kategorilere göre gruplu; sayılar sözlük listesiyle aynı; kategori süzgeci daraltır`,
      top(r.musa) === r.bek.k + r.bek.e && r.musa.grup.some((g) => /^Kişiler/.test(g)) && r.musa.sekme[0].startsWith('Tümü') && r.kisi.grup.length === 1 && /^Kişiler/.test(r.kisi.grup[0]), r);
    ok(`B4 ${mod}: “abdest” kavramlarda bulunur; sınıf süzgeci (9. sınıf) bütün kategorilere uygulanır ve sonucu daraltır (“Muhammed”); arama temizlenince normal liste döner`,
      r.abdest.grup.some((g) => /^Kavramlar/.test(g)) && top(r.muh9) > 0 && top(r.muh9) < top(r.muh) && r.muh9sinif.every((x) => x === '9. sınıf') && r.temiz.q === '' && !r.temiz.ar && r.temiz.liste > 0, r);
    if (ac) { await p.evaluate(async () => { V58.Atlas.ara('Muhammed'); await new Promise((r) => setTimeout(r, 900)); window.scrollTo(0, 0); }); await p.screenshot({path: path.join(SH, 'altin-bilgi-atlasi-arama.png')}); }
    else { await p.evaluate(async () => { V58.Atlas.ara('Musa'); await new Promise((r) => setTimeout(r, 900)); }); await p.screenshot({path: path.join(SH, 'elmas-bilgi-atlasi-arama.png')}); }
    await ctx.close();
  }

  /* ---------- S: anlatım ekranı ve üst boşluk ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2, w: 360, h: 760});
    await altinAc(p);
    const olc = `const p = document.querySelector('.p39-ders .p39-pane'), r = p.querySelector('.p39-read'), y = r.querySelector('p') || r, cs = (e) => getComputedStyle(e);
      const zemin = cs(p).backgroundImage !== 'none' ? (cs(p).backgroundImage.match(/(rgb|color)\\([^)]*\\)/) || [cs(p).backgroundColor])[0] : cs(p).backgroundColor;
      const rr = r.getBoundingClientRect(), yy = y.getBoundingClientRect();
      return {kagit: p.classList.contains('p43-kagit'), pZemin: cs(p).backgroundColor, pResim: cs(p).backgroundImage.slice(0, 60), okuZemin: cs(r).backgroundColor, yazi: cs(y).color, govde: cs(document.body).backgroundColor, metinGen: Math.round(yy.width), ekran: innerWidth};`;
    const r = await p.evaluate(async (olc) => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 900)), O = new Function(olc), o = {};
      go('pders', {pt: 'TPC18-4-1-01', ptab: 'anlat'}); await bk(1200); o.gece = O();
      V43.ayarla('gunduz'); await bk(); o.gunduz = O();
      V43.ayarla('gece'); V54.Tema.sec('altin', 'lacivert'); await bk(); o.lacivert = O();
      V54.Tema.sec('altin', 'altin'); await bk(500);
      return o;
    }, olc);
    const pz = (x) => (x.okuZemin !== 'rgba(0, 0, 0, 0)' ? x.okuZemin : x.govde);
    ok('S1 Altın anlatım (gece): krem kâğıt yok, okuma alanı temanın koyu rengi; yazı/zemin karşıtlığı ≥ 7; metin ekran genişliğinin en az %80’i (360 px telefonda yan beyaz şerit yok)',
      !r.gece.kagit && r.gece.okuZemin === 'rgba(0, 0, 0, 0)' && koyu(r.gece.govde) && kon(r.gece.yazi, r.gece.govde) >= 7 && r.gece.metinGen >= r.gece.ekran * 0.8 && !r.lacivert.kagit && kon(r.lacivert.yazi, r.lacivert.govde) >= 7, r);
    ok('S2 Altın anlatım (gündüz): krem kâğıt korunur (okuma deneyimi aynı), yazı koyu, karşıtlık ≥ 7',
      r.gunduz.kagit && acik(r.gunduz.pZemin) && kon(r.gunduz.yazi, r.gunduz.pZemin) >= 7, r);
    await p.evaluate(async () => { const p = document.querySelector('.p39-pane'); window.scrollTo(0, p.getBoundingClientRect().top + scrollY - 120); }); await p.waitForTimeout(700);
    await p.screenshot({path: path.join(SH, 'altin-anlatim-gece-360.png')});
    // diğer sekmeler gece görünümünde okunur mu
    const tab = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 800)), o = {};
      for (const k of ['ozet', 'otuz', 'hikaye', 'kodlama', 'tablo']) { try { V39.tab(k); await bk(); const pn = document.querySelector('.p39-ders .p39-pane'); const t = [...pn.querySelectorAll('p,li,td,th,span,b,h3,h4')].filter((x) => x.textContent.trim() && x.getBoundingClientRect().width > 0).slice(0, 12); o[k] = {kagit: pn.classList.contains('p43-kagit')}; o[k].ciftler = t.map((x) => { let e = x, bg = 'rgba(0, 0, 0, 0)'; while (e && (bg = getComputedStyle(e).backgroundColor) === 'rgba(0, 0, 0, 0)' && getComputedStyle(e).backgroundImage === 'none') e = e.parentElement; return e && getComputedStyle(e).backgroundImage !== 'none' && bg === 'rgba(0, 0, 0, 0)' ? null : [getComputedStyle(x).color, bg]; }).filter(Boolean); } catch (e) { o[k] = 'HATA ' + e.message; } }
      return o;
    });
    const tabOk = Object.entries(tab).every(([k, v]) => typeof v === 'object' && !v.kagit && v.ciftler.every(([c, z]) => kon(c, z) >= 4.5));
    ok('S3 Altın gece: Özet, 30 Saniyede, Hikâye, Kodlama, Tablo sekmeleri de koyu temada ve okunur (yazı/zemin ≥ 4,5)', tabOk, Object.fromEntries(Object.entries(tab).map(([k, v]) => [k, typeof v === 'object' ? {kagit: v.kagit, en: Math.min(...v.ciftler.map(([c, z]) => kon(c, z)))} : v])));
    await ctx.close();
  }
  {
    // üst boşluk: tarayıcıda (APK dışı) davranış aynı; APK işaretiyle (data-apk58) sayfa ikinci kez boşluk eklemez
    const {p, ctx} = await sayfa({dpr: 1});
    const cdp = await ctx.newCDPSession(p);
    let destek = true;
    try { await cdp.send('Emulation.setSafeAreaInsetsOverride', {insets: {top: 40, topMax: 40, bottom: 0, bottomMax: 0, left: 0, leftMax: 0, right: 0, rightMax: 0}}); } catch (e) { destek = false; }
    await p.reload(); await p.waitForTimeout(2300);
    const r = await p.evaluate(async () => {
      const o = {}, olc = () => ({pad: getComputedStyle(document.body).paddingTop, ust: Math.round(document.querySelector('header.top').getBoundingClientRect().top)});
      o.tarayici = olc(); document.documentElement.setAttribute('data-apk58', ''); await new Promise((r) => setTimeout(r, 300)); o.apk = olc();
      return o;
    });
    ok('S4 Üst boşluk: güvenli alan 40 px benzetiminde tarayıcı davranışı aynı (body 40 px); APK’da (data-apk58) sayfa boşluğu ikinci kez eklemez (0 px — boşluğu yalnız Android uygulaması verir)',
      destek && r.tarayici.pad === '40px' && r.apk.pad === '0px' && r.apk.ust === 0, Object.assign({destek}, r));
    await ctx.close();
  }

  /* ---------- O: oyun içerikleri ---------- */
  const O58 = JSON.parse(h1.match(/<script type="application\/json" id="seed-oyun58">([\s\S]*?)<\/script>/)[1]);
  {
    // kaynak ve tekrar denetimi (dosya düzeyinde)
    const VF = path.join(ROOT, 'tools', 'v58', '.veri', 'store57.json');
    if (!fs.existsSync(VF)) cp.execSync('node tools/v58/veri58.js', {cwd: ROOT, stdio: 'inherit'});   // V57.0'ın Store verisi (karşılaştırma kaynağı)
    const st0 = JSON.parse(fs.readFileSync(VF, 'utf8'));
    const TOP = new Map(st0.topics.map((t) => [t.id, t])), FC = new Map(st0.flashcards.map((f) => [f.id, f]));
    const metin = (t) => JSON.stringify((t && t.sections) || {});
    const hatalar = [], cumle = new Map(), kart = new Map();
    const ekle = (m, k, id) => { const n = String(k).toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim(); if (m.has(n) && m.get(n) !== id) hatalar.push('tekrar: ' + k.slice(0, 60) + ' ' + id + ' / ' + m.get(n)); m.set(n, id); };
    const eski = new Set(); st0.games.forEach((g) => (g.items || []).forEach((x) => { if (x && typeof x === 'object') { if (x.full) eski.add(x.full); (x.hints || []).forEach((h) => eski.add(h)); } }));
    O58.forEach((g) => {
      const T = g.topicId ? [TOP.get(g.topicId)] : (g.topicIds || []).map((i) => TOP.get(i)).concat(st0.topics.filter((t) => t.unitId === g.unitId));
      const M = T.map(metin).join(' ');
      if (g.gameType === 'eksik') g.items.forEach((x) => { if (!M.includes(x.full.replace(/"/g, '\\"'))) hatalar.push('kaynakta yok: ' + g.id); if (x.text.replace('_____', x.answer) !== x.full) hatalar.push('boşluk: ' + g.id); if (eski.has(x.full)) hatalar.push('eski oyunda var: ' + g.id); ekle(cumle, x.full, g.id); });
      if (g.gameType === 'tabu') g.items.forEach((x) => { const tam = x.hint.replace('_____', x.term); if (!st0.topics.some((t) => metin(t).toLocaleLowerCase('tr-TR').includes(tam.toLocaleLowerCase('tr-TR').replace(/"/g, '\\"')))) hatalar.push('tabu kaynakta yok: ' + g.id + ' ' + x.term); ekle(cumle, tam, g.id); if (x.forbidden.length < 4) hatalar.push('yasak<4 ' + g.id); });
      if (g.gameType === 'hata') g.rounds.forEach((r) => r.cards.forEach((c, i) => { const f = FC.get(c.id); if (!f) hatalar.push('kart yok ' + c.id); else if (i !== r.wrong && f.answer !== c.a) hatalar.push('kart değişmiş ' + c.id); else if (i === r.wrong && f.answer !== r.correct) hatalar.push('doğru cevap yanlış ' + c.id); ekle(kart, c.id, g.id); }));
      if (g.gameType === 'wheel') g.cardIds.forEach((id) => { if (!FC.get(id)) hatalar.push('kart yok ' + id); ekle(kart, id, g.id); });
      if (g.gameType === 'matching') (g.itemRefs || []).forEach((ref, i) => { const [, , tid] = ref.match(/^karisanlar:(\d+\.\d+)@(.+)$/) || []; const t = TOP.get(tid); if (!t || !metin(t).includes(g.pairs[i][0])) hatalar.push('eşleştirme kaynakta yok ' + g.id); });
      if (g.gameType === 'olay' && !g.items.every((x, i) => x.startsWith((i + 1) + ' – '))) hatalar.push('olay sırası ' + g.id);
    });
    const sinif = [...new Set(O58.map((g) => +g.grade))].sort((a, b) => a - b);
    ok('O1 Yeni oyun içerikleri kaynaktan: her Eksik Kelime cümlesi konu anlatımında aynen var (boşluk doldurulunca aynı cümle), Kelimeyi Anlat ipuçları kitap cümlesi, Hata Avcısı/Çark kartları mevcut bilgi kartları (yanlış kart doğru cevabıyla birlikte), eşleştirmeler “karıştırılanlar” kutusundan; hiçbir cümle/kart iki oyunda ya da eski oyunlarda tekrar etmiyor; 4–12 her sınıfa yeni içerik',
      hatalar.length === 0 && JSON.stringify(sinif) === JSON.stringify([4, 5, 6, 7, 8, 9, 10, 11, 12]) && O58.length >= 90, {n: O58.length, hatalar: hatalar.slice(0, 8), sinif});
  }
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2});
    const r = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 800)), o = {};
      const sinifla = (L) => L.reduce((a, b) => { a[b.sinif] = a[b.sinif] || [0, 0]; a[b.sinif][0]++; if (b.hazir) a[b.sinif][1]++; return a; }, {});
      o.zaman = sinifla(V41.oyunlar.zaman.bolumler()); o.lab = sinifla(V41.oyunlar.lab.bolumler());
      o.yeniZaman = V41.oyunlar.zaman.bolumler().filter((b) => /^GM58-/.test(b.id)).map((b) => b.sinif + ': ' + b.ad);
      const N = Store.all('games').filter((g) => g.id.startsWith('GM58-')); o.n = N.length; o.gorunur = N.filter((g) => vis(g)).length; o.C = N.filter((g) => { const k = V45.KD.kayit('games', g); return k && k.kat === 'C'; }).map((g) => g.id);
      o.cark = Store.all('games').filter((g) => g.gameType === 'wheel' && vis(g)).reduce((a, g) => (a[g.grade] = (a[g.grade] || 0) + 1, a), {});
      o.tabu = Store.all('games').filter((g) => g.gameType === 'tabu').reduce((a, g) => (a[g.grade] = (a[g.grade] || 0) + 1, a), {});
      // Etkinlik oyunları: yeni Eksik Kelime oyunu açılır ve doğru cevap kabul edilir
      const g = Store.all('games').find((x) => x.id === 'GM58-TPC-9-5-02-eksik') || Store.all('games').find((x) => x.id.startsWith('GM58-') && x.gameType === 'eksik');
      playGame(g.id); await bk(1100); o.oyun = {view, id: g.id, metin: (($.querySelector('#app') || $).innerText || '').slice(0, 200)};
      const ilk = g.items[0], btn = [...document.querySelectorAll('#app button, main button, button')].find((x) => x.textContent.trim() === ilk.answer);
      if (btn) { btn.click(); await bk(600); } o.cevap = !!btn; o.sonra = (($.querySelector('#app') || $).innerText || '').slice(0, 300);
      await bk(300); o._ss = 1;
      return o;
    });
    await p.screenshot({path: path.join(SH, 'etkinlik-eksik-kelime.png')});
    await altinAc(p);
    Object.assign(r, await p.evaluate(async () => { const bk = (ms) => new Promise((r) => setTimeout(r, ms || 800)), o = {};
      // Zamanın İzinde: yeni bölümü baştan sona oyna (Kolay)
      go('poyna', {oyn: 'zaman', obol: 'GM58-TPC-5-4-02c-zaman', odevam: 0}); await bk(1200);
      o.giris = (document.querySelector('.g44-h1') || {}).textContent;
      document.querySelector('[data-sev="kolay"]').click(); await bk();
      for (let i = 0; i < 8; i++) { const h = [...document.querySelectorAll('[data-h]')].sort((a, b) => +a.dataset.h - +b.dataset.h)[0]; if (!h) break; h.click(); await bk(150); }
      const k = document.querySelector('[data-k=kontrol]'); if (k) k.click(); await bk(400);
      o.sira = (document.querySelector('.g44-bil') || {}).textContent;
      await bk(1200); o.sonraki = (document.querySelector('.g44-gb small') || document.querySelector('.g44-son') || {}).textContent;
      return o; }));
    await p.screenshot({path: path.join(SH, 'zamanin-izinde-yeni-bolum.png')});
    ok('O2 Zamanın İzinde: yeni bölümler 5, 6, 7, 8, 11 ve 12. sınıflarda (önceden yalnız 4 ve 7); yeni bölüm baştan oynanır, doğru sıra kabul edilir', ['5', '6', '8', '11', '12'].every((s) => r.zaman[s] && r.zaman[s][1] >= 1) && r.zaman['7'][1] >= 2 && /Sıra doğru/.test(r.sira || ''), r);
    ok('O3 Bilgi Laboratuvarı 10. ve 11. sınıfta açık bölüm var (önceden 0); Çark Çevirme 9, 10, 11. sınıflarda da; Kelimeyi Anlat 4–12 her sınıfta kayıt var; yeni kayıtların hepsi öğrenciye görünür (editör kontrolü gereken C kayıtları listede ayrı)',
      r.lab['10'][1] >= 1 && r.lab['11'][1] >= 1 && ['9', '10', '11'].every((s) => r.cark[s] >= 1) && [4, 5, 6, 7, 8, 9, 10, 11, 12].every((s) => r.tabu[s] >= 1) && r.gorunur === r.n, {lab: r.lab, cark: r.cark, tabu: r.tabu, n: r.n, C: r.C, yeniZaman: r.yeniZaman});
    ok('O4 Etkinlik oyunları: yeni Eksik Kelime oyunu mevcut oyun ekranında açılır; doğru seçenek seçilebilir', r.oyun.view === 'game' && r.cevap, {oyun: r.oyun, sonra: r.sonra.slice(0, 160)});
    await ctx.close();
  }

  /* ---------- D: kullanıcı verisi korunur ---------- */
  {
    const veri = {'dk2': JSON.stringify({added: {}, patch: {}, raw: [], prog: {'DKAB18-4-U01-O01': {c: 3, w: 1}}, cards: {}, dataVersion: 'x'}), 'dk-calis45': JSON.stringify({v: 1, hedef: 25, gun: {'2026-11-20': 7}, sg: {'2026-11-20': {4: 5}}}), 'dk-ilerleme39': JSON.stringify({z: {}, t: {}, fav: {s: [4], k: ['TPC18-4-1-01']}}), 'dk-tema54': JSON.stringify({v: 1, altin: 'zumrut', ogretmen: 'lacivert', ogretmenMod: 'gunduz'}), 'dk-ptema43': 'gunduz', 'dk-theme': 'light'};
    const {p, ctx} = await sayfa({ek: veri});
    const r = await p.evaluate(async () => { go('atlas57'); await new Promise((r) => setTimeout(r, 700)); go('home'); await new Promise((r) => setTimeout(r, 700)); const o = {}; ['dk-calis45', 'dk-ilerleme39', 'dk-tema54', 'dk-ptema43', 'dk-theme'].forEach((k) => o[k] = localStorage.getItem(k)); o.prog = JSON.parse(localStorage.getItem('dk2')).prog; return o; });
    ok('D1 Kullanıcı verisi korunur: ilerleme (dk2.prog), günlük hedef (dk-calis45), favoriler (dk-ilerleme39.fav), Altın/Öğretmen temaları (dk-tema54), Altın ve Elmas görünüm tercihleri aynen',
      r['dk-calis45'] === veri['dk-calis45'] && JSON.parse(r['dk-ilerleme39']).fav.k[0] === 'TPC18-4-1-01' && r['dk-tema54'] === veri['dk-tema54'] && r['dk-ptema43'] === 'gunduz' && r['dk-theme'] === 'light' && r.prog['DKAB18-4-U01-O01'] && r.prog['DKAB18-4-U01-O01'].c === 3, r);
    await ctx.close();
  }

  /* ---------- M: 360 px ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, w: 360, h: 640, dpr: 2});
    const olc = async (L) => { const o = {}; for (const [v, a, js] of L) { o[v] = await p.evaluate(async ([v, a, js]) => { if (js) eval(js); else go(v, a); await new Promise((r) => setTimeout(r, 900)); return {gen: document.documentElement.scrollWidth}; }, [v, a, js]); } return o; };
    const el = await olc([['atlas57', {}, null], ['ara', null, "V58.Atlas.ara('Musa')"]]);
    await altinAc(p);
    const al = await olc([['pdunya', {}, null], ['atlas57', {}, null], ['ara2', null, "V58.Atlas.ara('abdest')"], ['pders', {pt: 'TPC18-4-1-01', ptab: 'anlat'}, null]]);
    await p.evaluate(async () => { go('pdunya'); await new Promise((r) => setTimeout(r, 2500)); const k = document.querySelector('.bg58'); window.scrollTo(0, k.getBoundingClientRect().top + scrollY - 60); }); await p.waitForTimeout(400);
    await p.screenshot({path: path.join(SH, 'telefon-360-baglantilar.png')});
    const hepsi = Object.assign({}, el, al);
    ok('M1 360 px telefonda (Bilgi Atlası ve arama iki modda, Altın ana sayfa, anlatım) yatay taşma yok', Object.values(hepsi).every((x) => x.gen <= 361), hepsi);
    await ctx.close();
  }

  ok('Z1 Sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); st.close();
  const gecen = S.filter((x) => x.ok).length;
  console.log(`\n${gecen}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen, toplam: S.length, kontroller: S}, null, 1));
  process.exit(gecen === S.length ? 0 : 1);
})();
