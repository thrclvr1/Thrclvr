// V55.0 testleri (depo kökünden): node tests/v55/test_v550.js — ekran görüntüleri docs/V55.0_ekran/.
// Tarayıcı otomasyonu (yerel http, başsız Chromium). Gerçek telefon burada DENENEMEZ.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v55.0.html', F0 = 'surumler/din-kulturu-platformu-v54.0.html';
const SH = path.join(ROOT, 'docs', 'V55.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 600) : '')); };
const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); const v = m.slice(0, 3).map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4))); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const kon = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const BEK = 'await new Promise((r) => setTimeout(r, 600));';

(async () => {
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v55.0'));
  ok('A1 sürüm V55.0, index.html aynı; veri blokları V54.0 ile bayt bayt aynı (içerik silinmedi); eski sürüm dosyaları ve APK’lar değişmedi', /V31\.VER="V55\.0"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && degisen.length === 0, degisen);
  ok('A2 HTML’de Gmail adresi ve açık PIN yok; Altın hâlâ kapalı (ACIK: false)', !/@gmail\.com/.test(h1) && !h1.includes('030792') && /ACIK: false,/.test(h1));

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const b = await chromium.launch();
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, ek: {}, ses: {}, dpr: 1, sinif: 4, gorunum: true}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true, deviceScaleFactor: o.dpr});
    await ctx.route('https://accounts.google.com/**', (r) => r.abort()); await ctx.route('https://www.googleapis.com/**', (r) => r.abort()); await ctx.route('https://www.youtube.com/**', (r) => r.abort());
    await ctx.addInitScript(([o]) => {
      if (!localStorage.getItem('__s')) {
        localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1');
        localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true}));
        localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false}));
        if (o.sinif) localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: o.sinif}}}));
        if (o.gorunum) localStorage.setItem('dk-gorunum54', JSON.stringify({v: 1, altin: 1}));
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

  /* ---------- E: Elmas ---------- */
  {
    const {p, ctx} = await sayfa({dpr: 2});
    const a = await p.evaluate(async () => {
      go('grade', {g: 4}); await new Promise((r) => setTimeout(r, 700));
      const A = [...$.querySelectorAll('article.card.unit')], H = () => A.map((x) => Math.round(x.querySelector('.ak55-g').getBoundingClientRect().height));
      const o = {unite: A.length, hepsiAk55: A.every((x) => x.classList.contains('ak55')), bas: H(), inert: A.every((x) => x.querySelector('.ak55-g').hasAttribute('inert')),
        sayi: A.map((x) => (x.querySelector('.ak55-b .ak55-n') || {}).textContent || ''), gorunenKonu: A.reduce((n, x) => n + [...x.querySelectorAll('.trow')].filter((t) => t.getBoundingClientRect().height > 0 && getComputedStyle(t).visibility !== 'hidden').length, 0)};
      A[0].querySelector('.ak55-b').click(); await new Promise((r) => setTimeout(r, 600)); o.bir = H(); o.tikla = A[0].querySelectorAll('.trow').length;
      A[1].querySelector('.uhead').click(); await new Promise((r) => setTimeout(r, 600)); o.iki = H();
      A[1].querySelector('.ak55-b').click(); await new Promise((r) => setTimeout(r, 600)); o.kapandi = H(); o.aria = A[1].querySelector('.ak55-b').getAttribute('aria-expanded');
      A[2].querySelector('.ak55-b').click(); await new Promise((r) => setTimeout(r, 600)); return o;
    });
    await p.screenshot({path: path.join(SH, 'elmas-akordiyon.png')});
    ok('E1 Derslerim akordiyonu gerçek: başta bütün üniteler kapalı (gövde yüksekliği 0, inert, hiçbir konu görünmez), başlıkta “N konu”; dokununca yalnız o ünite açılır, başka üniteye dokununca önceki kapanır, tekrar dokununca kapanır',
      a.unite >= 4 && a.hepsiAk55 && a.bas.every((x) => x === 0) && a.inert && a.gorunenKonu === 0 && a.sayi.every((x) => /\d+ konu/.test(x)) && a.bir[0] > 100 && a.bir.slice(1).every((x) => x === 0) && a.iki[0] === 0 && a.iki[1] > 100 && a.kapandi.every((x) => x === 0) && a.aria === 'false', a);
    // alt menü (Elmas): gece ve gündüz
    const nav = await p.evaluate(async () => {
      const o = {};
      for (const tm of ['dark', 'light']) {
        document.documentElement.dataset.theme = tm; localStorage.setItem('dk-theme', tm);
        for (const [v, a] of [['home', {}], ['grade', {g: 4}], ['games', {}], ['calis45', {}], ['profil46', {}], ['pek', {}]]) { go(v, a); await new Promise((r) => setTimeout(r, 450)); o[tm + ':' + v] = [...document.querySelectorAll('nav.bnav button.on')].map((x) => x.dataset.k).join(',') + '|' + ([...document.querySelectorAll('nav.bnav button[aria-current="page"]')].length); }
      }
      return o;
    });
    const navBek = {home: 'home', grade: 'classes', games: 'games', calis45: 'calis', profil46: 'profil', pek: 'calis'};
    ok('E2 Elmas alt menü: Ana sayfa, Derslerim, Oyunlar, Çalışmam, Profilim seçili durumu gece ve gündüzde doğru (tek seçili + aria-current)', Object.entries(nav).every(([k, v]) => v === navBek[k.split(':')[1]] + '|1'), nav);
    const c = await p.evaluate(async () => {
      Store.ov.prog = Object.assign(Store.ov.prog || {}, {'DKAB18-4-U01-O01': {correct: 3, wrong: 1, mastery: 0.75}, 'DKAB-5-U01-O01': {correct: 0, wrong: 5}});
      go('calis45'); await new Promise((r) => setTimeout(r, 700));
      const t = $.innerText;
      return {yok: ['Sana önerilenler', 'Zayıf kazanımlar', 'Konu başarı durumu', 'Son 7 gün'].filter((x) => t.includes(x)), ec: !!$.querySelector('.ec55'), oran: ($.querySelector('.ec55') || {}).innerText || '', var: ['Günlük hedef', 'Pekiştir', 'Kendini Dene', 'Tamamlanan konu', 'Genel kazanım başarısı'].filter((x) => t.includes(x)), hfk: !!$.querySelector('.c48-hfk')};
    });
    await p.screenshot({path: path.join(SH, 'elmas-calisma.png'), fullPage: true});
    ok('E3 Elmas Çalışmam sade: temel ilerleme (tamamlanan konu, genel kazanım başarısı) + günlük hedef + tekrar/test erişimi; gelişmiş analiz (öneriler, zayıf kazanımlar, konu başarı tablosu, 7 günlük grafik) yok; başarı gerçek kayıttan (%75, yalnız 4. sınıf)', !c.yok.length && c.ec && c.var.length === 5 && !c.hfk && /%75/.test(c.oran) && /3 doğru · 1 yanlış/.test(c.oran), c);
    const sd = await p.evaluate(async () => {
      go('sd', {sdTab: 'dinle', sdId: ''}); await new Promise((r) => setTimeout(r, 600));
      const A = [...$.querySelectorAll('a,button')].filter((x) => x.getAttribute('role') !== 'tab' && /Dinle|Oynatıcı|YouTube/i.test(x.textContent));
      const o = {dugmeler: A.map((x) => x.textContent.trim()), href: (A[0] || {}).href, iframe: !!$.querySelector('iframe'), metin: /Oynatıcı|hata verirse|yüklenemez|eşleştirilmedi/i.test($.innerText)};
      go('sd', {sdTab: 'sure', sdId: SD.items('sure')[0].id}); await new Promise((r) => setTimeout(r, 600));
      const B = [...$.querySelectorAll('a,button')].filter((x) => /Dinle|Oynatıcı|YouTube/i.test(x.textContent)); o.detay = B.map((x) => x.textContent.trim()); o.detayMetin = /Oynatıcı|eşleştirmesi yok|Dinleme Merkezi’nde/i.test($.innerText); return o;
    });
    await p.evaluate(async () => { go('sd', {sdTab: 'dinle', sdId: ''}); await new Promise((r) => setTimeout(r, 500)); });
    await p.screenshot({path: path.join(SH, 'dinleme-merkezi.png')});
    ok('E4 Dinleme Merkezi: “Oynatıcıyı yenile” ve oynatıcı yok; tek düğme “Duaları Dinleyelim” (veri kaynağındaki YouTube oynatma listesi); teknik hata metni yok; sure sayfasında da aynı tek düğme', JSON.stringify(sd.dugmeler) === '["Duaları Dinleyelim"]' && /^https:\/\/www\.youtube\.com\/playlist\?list=[\w-]+$/.test(sd.href || '') && !sd.iframe && !sd.metin && JSON.stringify(sd.detay) === '["Duaları Dinleyelim"]' && !sd.detayMetin, sd);
    const pr = await p.evaluate(async () => { go('profil46'); await new Promise((r) => setTimeout(r, 700)); const o = {ogr: /İçeriği hazır|içeriği hazır/.test($.innerText)}; sessionStorage.setItem('dk-editor-oturum38', '1'); V51.Yonetici.tamam = () => true; go('home'); await new Promise((r) => setTimeout(r, 300)); go('profil46'); await new Promise((r) => setTimeout(r, 700)); o.ed = /İçeriği hazır/.test($.innerText); sessionStorage.removeItem('dk-editor-oturum38'); return o; });
    ok('E5 “İçeriği hazır konu” gibi editör bilgisi öğrencinin Profilim ekranında yok; editör oturumunda görünür', !pr.ogr && pr.ed, pr);
    const g = await p.evaluate(async () => { go('games'); await new Promise((r) => setTimeout(r, 700)); const L = [...document.querySelectorAll('.gh-types button b, .gh-types button strong, .gh-types button')].map((x) => (x.querySelector('b,strong') || x).textContent.trim()); const t = document.body.innerText; return {zaman: (t.match(/Zaman Yolculuğu/g) || []).length, var: ['Çark Çevirme', 'Beni Bul!', 'Kelimeyi Anlat Bakalım', 'Kavram Köprüsü', 'Sıralama'].filter((a) => t.includes(a)), eski: ['Ben Kimim', 'Tabu', 'Çarkıfelek'].filter((a) => t.includes(a))}; });
    ok('E6 Elmas oyun adları tutarlı: Çark Çevirme, Beni Bul!, Kelimeyi Anlat Bakalım; iki ayrı oyun aynı adı (“Zaman Yolculuğu”) taşımıyor; eski adlar yok', g.zaman === 1 && g.var.length === 5 && !g.eski.length, g);
    await ctx.close();
  }

  /* ---------- R: roller ---------- */
  {
    const {p, ctx} = await sayfa();
    const r = await p.evaluate(async () => {
      const o = {acik: V51.Altin.acikMi()}; go('pdunya'); await new Promise((r) => setTimeout(r, 700)); o.ogrView = view; o.yakinda = !!document.getElementById('yk518'); o.ah55 = !!document.querySelector('.ah55');
      try { V51.Altin.kapat && V51.Altin.kapat(); } catch (x) {} document.getElementById('yk518') && document.getElementById('yk518').remove();
      V36.ss(V36.SK, '1'); o.ogrt = V36.ok(); o.ogrtEd = V38.edOk(); go('editor'); await new Promise((r) => setTimeout(r, 700)); o.edEkran = !!document.querySelector('.ed38-top'); o.ogrtAltin = V51.Altin.acikMi();
      return o;
    });
    ok('R1 Öğrenci Altın’a giremez (“Çok yakında”), Altın ana sayfası çizilmez; öğretmen oturumunda editör yetkisi ve Altın erişimi yok', !r.acik && r.ogrView !== 'pdunya' && r.yakinda && !r.ah55 && r.ogrt && !r.ogrtEd && !r.edEkran && !r.ogrtAltin, r);
    await ctx.close();
  }

  /* ---------- AL: Altın (editör önizlemesi) ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2});
    await altinAc(p);
    const a = await p.evaluate(async () => {
      go('pdunya'); await new Promise((r) => setTimeout(r, 900));
      const ah = $.querySelector('.ah55'), s47 = $.querySelector('.s47');
      const L = [...ah.querySelectorAll('button')].map((x) => (x.querySelector('b') || x).textContent.trim());
      const kor = document.querySelector('.alt40, .yon40, .nok40'), r1 = ah.getBoundingClientRect();
      return {ah: !!ah, ah54: !!$.querySelector('.ah54'), s47gizli: !s47 || getComputedStyle(s47).display === 'none', kesif: ah.querySelectorAll('.ah55-kf').length, L, tekil: new Set(L).size === L.length, ed: !!ah.querySelector('.ah55-ed'), hero: (ah.querySelector('.ah55-hero') || {}).innerText || '',
        kartSay: ah.querySelectorAll('button').length, bosluk: Math.round(r1.top - (($.querySelector('.s47') && $.querySelector('.s47').previousElementSibling) ? $.querySelector('.s47').previousElementSibling.getBoundingClientRect().bottom : r1.top))};
    });
    await p.evaluate(() => window.scrollTo(0, document.querySelector('.ah55').getBoundingClientRect().top + scrollY - 120));
    await p.screenshot({path: path.join(SH, 'altin-ana-sayfa.png')});
    ok('AL1 Altın ana sayfa sade: tek ana kart (devam/başla + günlük hedef), üç kısa yol (Derslerim, Oyun Dünyası, Çalışma Masam), tek Keşif bölümü; tekrarlanan kart yok (V47 şeridi ve V54 kutuları gösterilmez); editör notu yalnız editörde, en altta', a.ah && !a.ah54 && a.s47gizli && a.kesif === 1 && a.tekil && a.ed && /Başla|Devam et/.test(a.hero) && /Günlük hedef|Hedef/.test(a.hero) && a.kartSay <= 12 && ['Derslerim', 'Oyun Dünyası', 'Çalışma Masam', 'Sureler ve Dualar', 'Kavramlar', 'Kişiler ve Eserler', 'Bağlantılar'].every((x) => a.L.includes(x)) && Math.abs(a.bosluk) < 60, a);
    const s = await p.evaluate(async () => {
      go('psinif', {pg: 4}); await new Promise((r) => setTimeout(r, 900));
      const ek = $.querySelector('.sn55-ek'), gor = (el) => el && el.getBoundingClientRect().height > 0 && !el.closest('details:not([open])');
      const U = [...$.querySelectorAll('.sn55-u')], H = () => U.map((x) => Math.round(x.querySelector('.sn55-g').getBoundingClientRect().height));
      const o = {bas: ($.querySelector('.sn55-dv') || {}).innerText || '', prgGor: gor($.querySelector('.p39-prg')), kitapGor: /Ders kitabı/.test([...$.querySelectorAll('.p39-mut')].filter(gor).map((x) => x.textContent).join(' ')), kazanimGor: [...$.querySelectorAll('.p39-card')].filter(gor).some((x) => /Kazanım ilerlemesi/.test(x.textContent)), stsYok: !$.querySelector('.p39-sts'), hazir: /içeriği hazır/i.test($.innerText), ekKapali: ek && !ek.open, ekIc: ek ? ['p39-prg', 'd46a'].filter((c) => ek.querySelector('.' + c)) : [], uSay: U.length, ilk: H()};
      U[0].querySelector('.sn55-ub').click(); await new Promise((r) => setTimeout(r, 600)); o.ac1 = H(); o.konu = U[0].querySelectorAll('.sn55-tl button').length;
      U[1].querySelector('.sn55-ub').click(); await new Promise((r) => setTimeout(r, 600)); o.ac2 = H();
      U[1].querySelector('.sn55-ub').click(); await new Promise((r) => setTimeout(r, 600)); o.kap = H(); U[0].querySelector('.sn55-ub').click(); await new Promise((r) => setTimeout(r, 600));
      return o;
    });
    await p.screenshot({path: path.join(SH, 'altin-sinif-merkezi.png')});
    ok('AL2 Altın sınıf merkezi: “Nereden başlamalıyım?” kartı; program, ders kitabı ve kazanım bilgisi önde değil (“Daha fazla” altında, kapalı); “içeriği hazır” yok; üniteler akordiyon (başta kapalı, tek ünite açık, kapanabilir)',
      /Buradan başla|Sıradaki konu|Kaldığın yerden/.test(s.bas) && !s.prgGor && !s.kitapGor && !s.kazanimGor && s.stsYok && !s.hazir && s.ekKapali && s.ekIc.length === 2 && s.uSay >= 4 && s.ilk.every((x) => x === 0) && s.ac1[0] > 80 && s.konu >= 2 && s.ac2[0] === 0 && s.ac2[1] > 80 && s.kap.every((x) => x === 0), s);
    // alt menü (Altın) gece/gündüz
    const nav = await p.evaluate(async () => {
      const o = {};
      for (const m of ['gece', 'gunduz']) {
        V54.Tema.mod('altin', m); await new Promise((r) => setTimeout(r, 500));
        for (const [v, a] of [['psinif', {pg: 4}], ['punite', {pg: 4, pu: V39.units(4, V39.pv(4))[0].id}], ['poyun', {}], ['acalis53', {}], ['profil46', {}], ['pek', {}]]) { go(v, a); await new Promise((r) => setTimeout(r, 450)); const n = document.getElementById('bn50'); o[m + ':' + v] = n && !n.hidden ? [...n.querySelectorAll('button.on')].map((x) => x.dataset.k).join(',') + '|' + n.querySelectorAll('[aria-current="page"]').length : 'gizli'; }
        V54.Oyun.git('zirve'); await new Promise((r) => setTimeout(r, 500)); const n = document.getElementById('bn50'); o[m + ':aoyun53'] = [...n.querySelectorAll('button.on')].map((x) => x.dataset.k).join(',') + '|' + n.querySelectorAll('[aria-current="page"]').length;
        o[m + ':renk'] = getComputedStyle(n.querySelector('button.on')).backgroundColor + ' / ' + getComputedStyle(n.querySelector('button.on')).color;
      }
      V54.Tema.mod('altin', 'gece'); await new Promise((r) => setTimeout(r, 400));
      return o;
    });
    const navA = {psinif: 'sinif', punite: 'sinif', poyun: 'oyun', acalis53: 'calis', profil46: 'profil', pek: 'calis', aoyun53: 'oyun'};
    ok('AL3 Altın alt menü: Sınıfım, Oyunlar, Çalışmam (Çalışma Masam dahil), Profilim seçili durumu gece ve gündüzde doğru; Altın oyunlarında Oyunlar seçili', Object.entries(nav).filter(([k]) => !k.endsWith(':renk')).every(([k, v]) => v === navA[k.split(':')[1]] + '|1'), nav);
    await p.evaluate(async () => { go('acalis53'); await new Promise((r) => setTimeout(r, 500)); });
    await p.screenshot({path: path.join(SH, 'altin-alt-menu-calismam.png')});
    // Çalışma Masam: boş veri
    const bos = await p.evaluate(async () => { localStorage.removeItem('dk-calis45'); go('acalis53'); await new Promise((r) => setTimeout(r, 600)); const t = $.innerText; return {h: [...$.querySelectorAll('.ms55 h2')].map((x) => x.textContent.trim()).slice(0, 4), eksik: /Henüz yanlış cevap yok/.test(t), sifir: /0\/20/.test(t), sahteYuzde: /%\d+/.test(($.querySelector('.ms55-iki') || {}).innerText || '')}; });
    ok('AL4 Çalışma Masam (veri yok): ilk ekran üç soruyu yanıtlar (Bugün ne çalışmalıyım? / Hangi konularda eksiğim var? / Şimdi hangi çalışmayı yapmalıyım?); sahte istatistik yok, boş durum açıkça yazılı', JSON.stringify(bos.h.slice(0, 3)) === '["Bugün ne çalışmalıyım?","Hangi konularda eksiğim var?","Şimdi hangi çalışmayı yapmalıyım?"]' && bos.eksik && bos.sifir && !bos.sahteYuzde, bos);
    // Çalışma Masam: gerçek veri (2018 kazanım kimlikleri; hedef aşıldı)
    const dolu = await p.evaluate(async () => {
      const t = new Date(), k = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
      localStorage.setItem('dk-calis45', JSON.stringify({v: 1, hedef: 20, gun: {[k]: 30}}));
      const Q = Store.all('questions').filter((q) => +q.grade === 4 && (q.outcomeIds || []).length).slice(0, 3);
      Store.ov.prog = {}; Q.forEach((q, i) => { Store.ov.prog[q.outcomeIds[0]] = {correct: i, wrong: 3, mastery: 0.2}; });
      Store.ov.wrong = {}; Q.forEach((q) => { Store.ov.wrong[q.id] = {at: t.toISOString()}; });
      go('acalis53'); await new Promise((r) => setTimeout(r, 700));
      const V = V55.Masa.veri();
      return {oneri: ($.querySelector('.ms55-o') || {}).textContent || '', hedef: ($.querySelector('.ms55-hd') || {}).innerText || '', eksik: [...$.querySelectorAll('.ms55-iki .ac53-l li')].map((x) => x.innerText.replace(/\n/g, ' ')), yanlis: V.yanlis.length, zayif: V.zayif70.map((z) => z.t.title + ' %' + z.o), eylem: [...$.querySelectorAll('.ms55-e')].map((x) => x.innerText.replace(/\n/g, ' ')), hafta: ($.querySelector('.ac53-h') || {}).innerText || ''};
    });
    await p.screenshot({path: path.join(SH, 'altin-calisma-masam.png')});
    await p.screenshot({path: path.join(SH, 'altin-calisma-masam-tam.png'), fullPage: true});
    ok('AL5 Çalışma Masam (gerçek kayıt, 2018 programı): öneri en zayıf konuyu tekrar ettirir; eksik konular yüzdeyle; yanlış sayısı gerçek; aşılan hedef açıkça “Hedefini aştın: 30/20 · +10”', /tekrar et/.test(dolu.oneri) && /Hedefini aştın/.test(dolu.hedef) && /30\/20/.test(dolu.hedef) && /\+10/.test(dolu.hedef) && dolu.eksik.length >= 1 && dolu.eksik.every((x) => /%\d+/.test(x)) && dolu.yanlis === 3 && dolu.eylem.some((x) => /Yanlışlarımı çöz.*3/.test(x)) && /\+10/.test(dolu.hafta), dolu);
    // temalar × gündüz/gece: kontrast ve renk uyumu
    const tm = await p.evaluate(async () => {
      const o = {};
      for (const k of ['altin', 'lacivert', 'zumrut', 'murekkep', 'kumtasi']) for (const m of ['gece', 'gunduz']) {
        V54.Tema.sec('altin', k); V54.Tema.mod('altin', m); await new Promise((r) => setTimeout(r, 500));
        go('psinif', {pg: 4}); await new Promise((r) => setTimeout(r, 500));
        const cs = (s) => { const e = $.querySelector(s); return e ? getComputedStyle(e) : null; };
        const kart = cs('.sn55-u'), dv = cs('.sn55-dv em'), bas = cs('.sn55-ut b'), alt = cs('.sn55-ut > span'), bd = getComputedStyle(document.body), un = cs('.sn55-ub .un-ic');
        o[k + ':' + m] = {bg: bd.backgroundColor, kart: kart.backgroundColor, yazi: bas.color, soluk: alt.color, btn: dv.backgroundColor, btnYazi: dv.color, ikon: un.color, pri: bd.getPropertyValue('--pri').trim(), pt: document.documentElement.dataset.pt43};
      }
      V54.Tema.sec('altin', 'altin'); V54.Tema.mod('altin', 'gece'); await new Promise((r) => setTimeout(r, 400));
      return o;
    });
    const tmS = {}; let tmOk = true;
    for (const [k, v] of Object.entries(tm)) {
      const x = {yazi: +kon(v.yazi, v.kart).toFixed(2), soluk: +kon(v.soluk, v.kart).toFixed(2), btn: +kon(v.btnYazi, v.btn).toFixed(2), pt: v.pt};
      tmS[k] = x; if (x.yazi < 7 || x.soluk < 4.5 || x.btn < 4.5 || x.pt !== k.split(':')[1]) tmOk = false;
    }
    const mavi = (c) => { const m = c.match(/[\d.]+/g).map(Number); return m[2] > m[0] + 25; };
    const ton = {lac: mavi(tm['lacivert:gece'].kart), alt: !mavi(tm['altin:gece'].kart), zum: (() => { const m = tm['zumrut:gece'].kart.match(/[\d.]+/g).map(Number); return m[1] > m[0]; })(), farkli: new Set(Object.values(tm).map((v) => v.kart)).size === 10};
    ok('AL6 Beş tema × gündüz/gece: kart yüzeyi temanın tonunda (Lacivert mavi, Zümrüt yeşil, on farklı yüzey); başlık/kart kontrastı ≥ 7, soluk yazı ≥ 4,5, düğme yazısı ≥ 4,5; gündüz/gece temadan bağımsız', tmOk && ton.lac && ton.alt && ton.zum && ton.farkli, {tmS, ton});
    // tema seçim ekranı: seçim göstergesi temanın renginde (mavi değil)
    const sec = await p.evaluate(async () => {
      V54.Tema.sec('altin', 'zumrut'); V54.Tema.ac('altin'); await new Promise((r) => setTimeout(r, 600));
      const on = document.querySelector('.tm54-k.on'), gb = document.querySelector('.gg54 button[aria-pressed="true"]'), gold = getComputedStyle(document.body).getPropertyValue('--p-gold').trim();
      const o = {onKenar: getComputedStyle(on).borderTopColor, ggKenar: getComputedStyle(gb).borderTopColor, gold}; UI.close(); await new Promise((r) => setTimeout(r, 400));
      V54.Tema.sec('altin', 'altin'); return o;
    });
    await p.evaluate(async () => { V54.Tema.sec('altin', 'lacivert'); V54.Tema.ac('altin'); await new Promise((r) => setTimeout(r, 600)); });
    await p.screenshot({path: path.join(SH, 'altin-tema-secimi.png')});
    await p.evaluate(async () => { UI.close(); await new Promise((r) => setTimeout(r, 300)); go('psinif', {pg: 4}); await new Promise((r) => setTimeout(r, 600)); });
    await p.screenshot({path: path.join(SH, 'tema-lacivert-gece.png')});
    await p.evaluate(async () => { V54.Tema.mod('altin', 'gunduz'); await new Promise((r) => setTimeout(r, 600)); go('acalis53'); await new Promise((r) => setTimeout(r, 600)); });
    await p.screenshot({path: path.join(SH, 'tema-lacivert-gunduz.png')});
    await p.evaluate(async () => { V54.Tema.sec('altin', 'zumrut'); V54.Tema.mod('altin', 'gece'); await new Promise((r) => setTimeout(r, 600)); go('poyun'); await new Promise((r) => setTimeout(r, 700)); });
    await p.screenshot({path: path.join(SH, 'tema-zumrut-gece.png')});
    await p.evaluate(async () => { V54.Tema.sec('altin', 'murekkep'); V54.Tema.mod('altin', 'gunduz'); await new Promise((r) => setTimeout(r, 600)); go('pdunya'); await new Promise((r) => setTimeout(r, 900)); window.scrollTo(0, document.querySelector('.ah55').getBoundingClientRect().top + scrollY - 100); });
    await p.screenshot({path: path.join(SH, 'tema-murekkep-gunduz.png')});
    await p.evaluate(async () => { V54.Tema.sec('altin', 'altin'); V54.Tema.mod('altin', 'gece'); await new Promise((r) => setTimeout(r, 500)); });
    const rgbEsit = (a, b) => { const x = a.match(/\d+/g).slice(0, 3).join(','), h = b.replace('#', ''); return x === [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(','); };
    ok('AL7 Tema seçim ekranında seçili tema ve gündüz/gece göstergesi temanın vurgu renginde (mavi değil)', rgbEsit(sec.onKenar, sec.gold) && rgbEsit(sec.ggKenar, sec.gold) && !mavi(sec.onKenar), sec);
    // mavi seçim taraması
    const bl = await p.evaluate(async () => {
      const L = [];
      const tara = (ad) => document.querySelectorAll('body *').forEach((el) => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('.mk50-am,.kd45,.o41-afis,svg')) return; for (const pr of ['borderTopColor', 'outlineColor', 'boxShadow', 'backgroundColor']) { for (const m of (cs[pr] || '').match(/rgba?\([^)]*\)/g) || []) { const n = m.match(/[\d.]+/g).map(Number); if ((n.length > 3 ? n[3] : 1) > 0.15 && n[2] > n[0] + 40 && n[2] > n[1] + 10) L.push(ad + ':' + (el.className && el.className.baseVal === undefined ? String(el.className).split(' ')[0] : el.tagName) + ':' + pr + ':' + m); } } });
      for (const [v, a] of [['pdunya', {}], ['psinif', {pg: 4}], ['acalis53', {}], ['poyun', {}], ['profil46', {}], ['games', {}]]) { go(v, a); await new Promise((r) => setTimeout(r, 800)); tara(v); }
      V54.Tema.ac('altin'); await new Promise((r) => setTimeout(r, 500)); tara('tema'); UI.close(); await new Promise((r) => setTimeout(r, 300));
      return [...new Set(L)];
    });
    ok('AL8 Altın ekranlarında (koridor altı, sınıf merkezi, Çalışma Masam, Oyun Dünyası, Profilim, etkinlik oyunları, tema seçimi) mavi seçim/kenar/gölge rengi yok', bl.length === 0, bl.slice(0, 12));
    await ctx.close();
  }

  /* ---------- G: Altın gündüz/gece ilk açılış ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, gorunum: false});
    await altinAc(p);
    const g = await p.evaluate(async () => { go('pdunya'); await new Promise((r) => setTimeout(r, 900)); const o = {soru: !!document.getElementById('gg54')}; V54.Tema.ilkSec('gunduz'); await new Promise((r) => setTimeout(r, 600)); o.pt = document.documentElement.dataset.pt43; o.kayit = localStorage.getItem('dk-gorunum54'); o.ptema = localStorage.getItem('dk-ptema43'); V54.Tema.sec('altin', 'lacivert'); await new Promise((r) => setTimeout(r, 400)); o.sonraPt = document.documentElement.dataset.pt43; return o; });
    await p.reload(); await p.waitForTimeout(2300); await altinAc(p);
    const g2 = await p.evaluate(async () => { go('pdunya'); await new Promise((r) => setTimeout(r, 900)); return {soru: !!document.getElementById('gg54'), pt: document.documentElement.dataset.pt43, tema: document.documentElement.dataset.tema54a}; });
    ok('G1 Altın’a ilk girişte gündüz/gece sorulur; seçim kaydedilir, yeniden açılışta korunur ve sorulmaz; tema değiştirmek gündüz/geceyi değiştirmez', g.soru && g.pt === 'gunduz' && /"altin":1/.test(g.kayit || '') && g.sonraPt === 'gunduz' && !g2.soru && g2.pt === 'gunduz' && g2.tema === 'lacivert', {g, g2});
    await ctx.close();
  }

  /* ---------- O: oyunlar ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2});
    await altinAc(p);
    const h = await p.evaluate(async () => {
      go('poyun'); await new Promise((r) => setTimeout(r, 900));
      const ao = $.querySelector('.ao55'), bas = $.querySelector('.o41-bas');
      return {ao: !!ao, sira: !!(bas && ao && (bas.compareDocumentPosition(ao) & Node.DOCUMENT_POSITION_FOLLOWING)), ao54: !!document.querySelector('.ao54-h'), gruplar: [...ao.querySelectorAll('.ao55-g h3')].map((x) => x.textContent.trim()), adlar: [...ao.querySelectorAll('.ao55-k b')].map((x) => x.textContent.trim()), eskiGizli: [...$.querySelectorAll('.o41-oyunlar')].every((x) => getComputedStyle(x).display === 'none')};
    });
    await p.screenshot({path: path.join(SH, 'altin-oyun-merkezi.png')});
    const ADLAR = ['Çark Çevirme', 'Zirve Yarışı', 'Beni Bul!', 'Gizemli Şahsiyet', 'Harf Halkası', 'Harf Avı', 'Bilgi Arenası', 'Gizli Bilgin', 'Kelimeyi Anlat Bakalım'];
    ok('O1 Oyun Dünyası tek gruplu merkez: Kısa bilgi ve kelime oyunları / Yarışma oyunları / Takım oyunları / Hikâyeli ve keşif oyunları; dokuz oyun adı tutarlı; başlık çubuğunun altında; V54 kutusu ve uzun tekrar listeleri yok', h.ao && h.sira && !h.ao54 && JSON.stringify(h.gruplar) === '["Kısa bilgi ve kelime oyunları","Yarışma oyunları","Takım oyunları","Hikâyeli ve keşif oyunları"]' && ADLAR.every((a) => h.adlar.includes(a)) && h.adlar.includes('Işık Bahçesi') && h.eskiGizli, h);
    const oy = await p.evaluate(async () => {
      const o = {};
      for (const k of ['zirve', 'benibul', 'gizemli', 'halka', 'harf', 'arena', 'anlat', 'gizli']) {
        go('poyun'); await new Promise((r) => setTimeout(r, 300)); V54.Oyun.git(k); await new Promise((r) => setTimeout(r, 700));
        const t = $.innerText; o[k] = {view, uzunluk: t.length, dugme: $.querySelectorAll('button').length, bos: /Kaynakta veri bulunmuyor|yeterli içerik yok/i.test(t), basl: ($.querySelector('h1,h2') || {}).textContent || ''};
        const bas = [...$.querySelectorAll('button')].find((b) => /^(Başla|Oyunu başlat|Yarışa başla|Başlat)/.test(b.textContent.trim())); if (bas) { bas.click(); await new Promise((r) => setTimeout(r, 500)); o[k].basladi = $.innerText.length > 40; }
      }
      clearInterval(V54.Oyun._t);
      V55.Oyun.cark(); await new Promise((r) => setTimeout(r, 1200)); o.cark = {view, ty: (G.gf || {}).ty, metin: /Çark Çevirme/.test(document.body.innerText)};
      return o;
    });
    const oyOk = ['zirve', 'benibul', 'gizemli', 'halka', 'harf', 'arena', 'anlat', 'gizli'].every((k) => oy[k].view === 'aoyun53' && oy[k].uzunluk > 60 && oy[k].dugme >= 2);
    ok('O2 Her Altın oyunu açılıyor (Zirve Yarışı, Beni Bul!, Gizemli Şahsiyet, Harf Halkası, Harf Avı, Bilgi Arenası, Kelimeyi Anlat Bakalım, Gizli Bilgin) ve Çark Çevirme etkinlik oyunlarında çark türüyle açılıyor', oyOk && oy.cark.view === 'games' && oy.cark.ty === 'wheel' && oy.cark.metin, oy);
    // Işık Bahçesi
    const d = await p.evaluate(async () => {
      const D = V45.Dunya, U = D.uniteler(4), o = {bolge: U.length, adlar: {}, tekrarNot: 0};
      U.forEach((u) => { const N = D.noktalar(4, u.id); o.adlar[u.order] = N.map((x) => x.yer); const nt = N.filter((x) => x.tur === 'not').map((x) => x.veri.baslik + '|' + x.veri.metin.slice(0, 80)); if (new Set(nt).size !== nt.length) o.tekrarNot++; if (new Set(N.map((x) => x.yer)).size !== N.length) o.tekrarNot++; });
      go('poyna', {oyn: 'dunya45', obol: 'g4', odevam: 0}); await new Promise((r) => setTimeout(r, 900));
      o.harita = !!document.querySelector('.d55-hr'); o.haritaCta = (document.querySelector('.d55-hr .d55-cta') || {}).textContent || '';
      document.querySelector('.d55-hr .d55-cta').click(); await new Promise((r) => setTimeout(r, 600));
      const N = D.noktalar(4, U[0].id);
      o.isaret = document.querySelectorAll('.d55-nk').length; o.yol = !!document.querySelector('.d55-yol'); o.anlatim = (document.querySelector('.d55-dy p') || {}).textContent || ''; o.ilkSira = (document.querySelector('.d55-nk.sira em') || {}).textContent || '';
      o.ilerleme0 = (document.querySelector('.d55-il b') || {}).textContent;
      // 1. görev (not): sıradaki görev düğmesiyle
      document.querySelector('.d55-cta').click(); await new Promise((r) => setTimeout(r, 500));
      o.notBaslik = (document.querySelector('.d45-not small') || {}).textContent || '';
      o.ilerleme1 = (document.querySelector('.d55-il b') || {}).textContent; o.liste1 = (document.querySelector('.d55-nl li .d55-dr') || {}).textContent;
      o.sonraki = (document.querySelector('.d55-son p') || {}).textContent || '';
      // sıradaki görevlere ilerle: karakter → doğru cevap, bulmaca/kanıt → çözüldü olarak işaretle (bulmaca bileşenleri V44 testlerinde ayrıca sınanır)
      for (let i = 0; i < 8; i++) {
        const btn = [...document.querySelectorAll('.d55-son .g44-b.p')].find((b) => /Sıradaki görev/.test(b.textContent)); if (!btn) break;
        btn.click(); await new Promise((r) => setTimeout(r, 500));
        const k = D.kayit(4), B = D.bolgeDurum(4, U[0].id, k), x = D.noktalar(4, U[0].id).find((y) => !B.n[y.id]); if (!x) break;
        if (x.tur === 'karakter') { const dogru = document.querySelector(`#d45p [data-i="${x.veri.answer}"]`); if (dogru) dogru.click(); await new Promise((r) => setTimeout(r, 400)); }
        else D._ic.isaretle(x, () => document.getElementById('d45p').insertAdjacentHTML('beforeend', D.devamHTML(x.id)));
        await new Promise((r) => setTimeout(r, 300));
      }
      const k = D.kayit(4), B = D.bolgeDurum(4, U[0].id, k);
      o.hepsi = N.every((x) => B.n[x.id]); o.ilerlemeSon = (document.querySelector('.d55-il b') || {}).textContent; o.kapiHazir = !document.querySelector('.d55-nl .d45-nb.kapi').disabled;
      D.bolge(U[0].id); await new Promise((r) => setTimeout(r, 400)); o.cta = (document.querySelector('.d55-cta') || {}).textContent || ''; o.kapiDurum = (document.querySelector('.d55-ks') || {}).textContent || '';
      return o;
    });
    await p.screenshot({path: path.join(SH, 'isik-bahcesi-bolge.png')});
    await p.evaluate(async () => { V45.Dunya.harita(); await new Promise((r) => setTimeout(r, 500)); });
    await p.screenshot({path: path.join(SH, 'isik-bahcesi-harita.png')});
    ok('O3 Işık Bahçesi: aynı adlı “Bulunan not” kartı yok, her keşif noktasının ayrı yeri var; harita üzerinde numaralı yol ve “sıradaki” işareti; rehberin anlatımıyla görev akışı', d.bolge >= 4 && d.tekrarNot === 0 && Object.values(d.adlar).every((L) => L.length >= 2) && d.isaret >= 3 && d.yol && /hoş geldin/.test(d.anlatim) && d.ilkSira === 'Yaşlı Çınar' && /Yaşlı Çınar · Keşif notu/.test(d.notBaslik) && d.harita, d);
    ok('O4 Işık Bahçesi oynanış: görev bitince liste ve ilerleme anında güncellenir (0 → 1, “Tamamlandı”), “Sıradaki görev” sonraki noktayı açar; bütün görevler bitince kapı hazır olur ve ana düğme kapı mücadelesine yönlendirir', d.ilerleme0.startsWith('0/') && d.ilerleme1.startsWith('1/') && d.liste1 === 'Tamamlandı' && /Sıradaki durak/.test(d.sonraki) && d.hepsi && d.kapiHazir && /mücadeleye başla/.test(d.cta) && /hazır/.test(d.kapiDurum), d);
    await ctx.close();
  }

  /* ---------- M: telefonda üst üste binme ---------- */
  {
    const {p, ctx} = await sayfa({w: 360, h: 740, ses: ED});
    const el = await p.evaluate(async () => {
      const o = {};
      for (const [v, a] of [['grade', {g: 4}], ['calis45', {}], ['games', {}], ['sd', {sdTab: 'dinle', sdId: ''}]]) { go(v, a); await new Promise((r) => setTimeout(r, 700)); window.scrollTo({top: 1e7, behavior: 'instant'}); await new Promise((r) => setTimeout(r, 400)); const n = document.querySelector('nav.bnav'), son = {getBoundingClientRect: () => ({bottom: Math.max(...[...$.querySelectorAll('*')].filter((x) => !x.children.length && x.getBoundingClientRect().height > 0 && getComputedStyle(x).visibility !== 'hidden' && !x.closest('[inert],[hidden],details:not([open]) > :not(summary)')).map((x) => x.getBoundingClientRect().bottom))})}; o[v] = {son: Math.round(son.getBoundingClientRect().bottom), nav: n ? Math.round(n.getBoundingClientRect().top) : null, gen: document.documentElement.scrollWidth}; }
      return o;
    });
    await altinAc(p);
    const al = await p.evaluate(async () => {
      const o = {};
      for (const [v, a] of [['psinif', {pg: 4}], ['acalis53', {}], ['poyun', {}], ['profil46', {}]]) { go(v, a); await new Promise((r) => setTimeout(r, 800)); window.scrollTo({top: 1e7, behavior: 'instant'}); await new Promise((r) => setTimeout(r, 400)); const n = document.getElementById('bn50'), son = {getBoundingClientRect: () => ({bottom: Math.max(...[...$.querySelectorAll('*')].filter((x) => !x.children.length && x.getBoundingClientRect().height > 0 && getComputedStyle(x).visibility !== 'hidden' && !x.closest('[inert],[hidden],details:not([open]) > :not(summary)')).map((x) => x.getBoundingClientRect().bottom))})}; o[v] = {son: Math.round(son.getBoundingClientRect().bottom), nav: n && !n.hidden ? Math.round(n.getBoundingClientRect().top) : null, gen: document.documentElement.scrollWidth}; }
      go('pdunya'); await new Promise((r) => setTimeout(r, 900)); o.pdunya = {gen: document.documentElement.scrollWidth}; return o;
    });
    await p.evaluate(async () => { go('acalis53'); await new Promise((r) => setTimeout(r, 600)); window.scrollTo(0, 1e7); });
    await p.screenshot({path: path.join(SH, 'telefon-360-alt-kenar.png')});
    const hepsi = Object.assign({}, el, al), okM = Object.values(hepsi).every((x) => x.gen <= 361 && (x.nav == null || x.son == null || x.son <= x.nav + 2));
    ok('M1 360 px telefonda (Elmas Derslerim/Çalışmam/Oyunlar/Dinleme; Altın sınıf merkezi/Çalışma Masam/Oyun Dünyası/Profilim/koridor) son içerik alt menünün altında kalmıyor; yatay taşma yok', okM, hepsi);
    await ctx.close();
  }

  ok('Z1 Sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); st.close();
  const gecen = S.filter((x) => x.ok).length;
  console.log(`\n${gecen}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen, toplam: S.length, kontroller: S}, null, 1));
  process.exit(gecen === S.length ? 0 : 1);
})();
