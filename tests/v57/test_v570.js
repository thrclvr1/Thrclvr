// V57.0 testleri (depo kökünden): node tests/v57/test_v570.js — ekran görüntüleri docs/V57.0_ekran/.
// Tarayıcı otomasyonu (yerel http, başsız Chromium, telefon görünümü). Gerçek telefon burada DENENEMEZ.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v57.0.html', F0 = 'surumler/din-kulturu-platformu-v56.0.html';
const SH = path.join(ROOT, 'docs', 'V57.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 700) : '')); };
const hex2 = (c) => (/^#/.test(c) ? 'rgb(' + [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)).join(',') + ')' : c);
const lum = (c) => { const m = hex2(String(c).trim()).match(/[\d.]+/g).map(Number); const v = m.slice(0, 3).map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4))); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const kon = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const rgb = (c) => hex2(c).match(/[\d.]+/g).slice(0, 3).map(Number);
const yakin = (c, hex, t) => { const a = rgb(c), b = rgb(hex); return a.every((x, i) => Math.abs(x - b[i]) <= (t || 4)); };

(async () => {
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v57.0'));
  ok('A1 sürüm V57.0, index.html aynı; veri blokları V56.0 ile bayt bayt aynı (içerik silinmedi); eski sürüm dosyaları ve APK’lar değişmedi', /V31\.VER="V57\.0"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && degisen.length === 0, degisen);
  ok('A2 Gmail adresi ve açık PIN yok; Altın hâlâ kapalı (ACIK: false); V56 ortak tema modülü çıkarıldı, birleşik tema üretimi var', !/@gmail\.com/.test(h1) && !h1.includes('030792') && /ACIK: false,/.test(h1) && !h1.includes('V56.Tema = {}') && h1.includes('V57.0 üretilmiş: Altın temaları'));

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const b = await chromium.launch();
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, ek: {}, ses: {}, dpr: 1, sinif: 4}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true, deviceScaleFactor: o.dpr});
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
  const BK = (ms) => `await new Promise((r) => setTimeout(r, ${ms || 700}));`;

  /* ---------- T: temalar ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2});
    await altinAc(p);
    const t = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 600)), cs = (s) => getComputedStyle(document.querySelector(s)), o = {};
      go('profil46'); await bk(800);
      const g = document.getElementById('pr54-gor'); o.secenek = g ? [...g.querySelectorAll('.tm57-k b')].map((x) => x.textContent) : []; o.mod = g ? [...g.querySelectorAll('.tm57-m button')].map((x) => x.textContent.trim()) : [];
      o.renk = {};
      for (const k of ['altin', 'lacivert', 'zumrut', 'murekkep', 'kumtasi']) for (const m of ['gece', 'gunduz']) {
        V54.Tema.sec('altin', k); V54.Tema.mod('altin', m); await bk(550); go('psinif', {pg: 4}); await bk(500);
        o.renk[k + ':' + m] = {bg: getComputedStyle(document.body).backgroundColor, kart: cs('.sn55-u').backgroundColor, yazi: cs('.sn55-ut b').color, soluk: cs('.sn55-ut > span').color, btn: cs('.nk57-d').backgroundColor, btnYazi: cs('.nk57-d').color, pt: document.documentElement.dataset.pt43, ta: document.documentElement.dataset.tema54a};
      }
      for (const m of ['gunduz', 'gece']) { V57.Tema.elmas('altin', m); await bk(700); go('psinif', {pg: 4}); await bk(500); o.renk['elmas:' + m] = {bg: getComputedStyle(document.body).backgroundColor, kart: cs('.sn55-u').backgroundColor, yazi: cs('.sn55-ut b').color, soluk: cs('.sn55-ut > span').color, btn: cs('.nk57-d').backgroundColor, btnYazi: cs('.nk57-d').color, pt: document.documentElement.dataset.pt43, ta: document.documentElement.dataset.tema54a}; }
      V57.Tema.elmas('altin', 'oto'); await bk(600); o.oto = {tercih: V43.tercih(), pt: document.documentElement.dataset.pt43};
      o.elmasKayit = [localStorage.getItem('dk-theme'), localStorage.getItem('dk-tema47')];
      // Gece Lacivert: bütün ekranlarda aynı zemin
      V54.Tema.sec('altin', 'lacivert'); V54.Tema.mod('altin', 'gece'); await bk(600);
      o.ekran = {};
      for (const [v, a] of [['pdunya', {}], ['psinif', {pg: 4}], ['pders', {pt: 'TPC18-4-1-01', ptab: ''}], ['acalis53', {}], ['poyun', {}], ['profil46', {}], ['games', {}]]) { go(v, a); await bk(700); o.ekran[v] = getComputedStyle(document.body).backgroundColor; }
      V54.Tema.ac('altin'); await bk(500); o.pencere = getComputedStyle(document.querySelector('.v-ov .sheet, .v-ov [role=dialog], .v-ov > div') || document.body).backgroundColor; UI.close(); await bk(400);
      o.kayit = JSON.parse(localStorage.getItem('dk-tema54')); o.ptema = localStorage.getItem('dk-ptema43');
      return o;
    });
    await p.screenshot({path: path.join(SH, 'tema-lacivert-oyun.png')});
    await p.evaluate(async () => { go('profil46'); await new Promise((r) => setTimeout(r, 800)); V54.Tema.ac('altin'); await new Promise((r) => setTimeout(r, 700)); const l = document.querySelector('.v-ov .tm57-el'); if (l) l.scrollIntoView({block: 'end'}); });
    await p.screenshot({path: path.join(SH, 'altin-tema-secenekleri.png')});
    await p.evaluate(async () => { UI.close(); await new Promise((r) => setTimeout(r, 400)); });
    ok('T1 Altın tema seçenekleri korunur ve genişler: 5 Altın teması (Altın Mihrap, Gece Lacivert, Zümrüt Kütüphane, Mürekkep ve Bakır, Kum Taşı) + Elmas temaları (Açık, Koyu, Otomatik); görünüm Gündüz/Gece/Otomatik',
      ['Altın Mihrap', 'Gece Lacivert', 'Zümrüt Kütüphane', 'Mürekkep ve Bakır', 'Kum Taşı', 'Elmas · Açık', 'Elmas · Koyu', 'Elmas · Otomatik'].every((x) => t.secenek.includes(x)) && t.mod.length === 3, {secenek: t.secenek, mod: t.mod});
    const R = t.renk, mavi = (c) => { const m = rgb(c); return m[2] > m[0] + 20; }, yesil = (c) => { const m = rgb(c); return m[1] > m[0]; };
    ok('T2 Her tema kendi renklerini uygular: Gece Lacivert lacivert, Zümrüt yeşil, Elmas Açık #F3F5FA / Elmas Koyu #0B1020 (Elmas paleti); 12 görünümün yüzeyleri birbirinden farklı',
      mavi(R['lacivert:gece'].kart) && yesil(R['zumrut:gece'].kart) && yakin(R['elmas:gunduz'].bg, '#F3F5FA') && yakin(R['elmas:gece'].bg, '#0B1020') && yakin(R['altin:gece'].bg, '#130E0A', 6) && new Set(Object.values(R).map((x) => x.kart)).size === 12 && R['elmas:gunduz'].ta === 'elmas' && R['elmas:gunduz'].pt === 'gunduz', Object.fromEntries(Object.entries(R).map(([k, v]) => [k, v.bg + ' / ' + v.kart])));
    const kn = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, {yazi: kon(v.yazi, v.kart), soluk: kon(v.soluk, v.kart), btn: kon(v.btnYazi, v.btn)}]));
    ok('T3 Okunurluk 6 tema × gündüz/gece: başlık/kart ≥ 7, soluk yazı ≥ 4,5, düğme yazısı ≥ 4,5', Object.values(kn).every((x) => x.yazi >= 7 && x.soluk >= 4.5 && x.btn >= 4.5), kn);
    ok('T4 Seçilen tema Altın’ın bütün ekranlarına uygulanır (koridor, sınıf merkezi, konu, Çalışma Masam, Oyun Dünyası, Profilim, etkinlik oyunları, açılır pencere): Gece Lacivert zemini her yerde aynı',
      Object.values(t.ekran).every((c) => c === t.ekran.psinif) && mavi(t.ekran.psinif), t.ekran);
    ok('T5 Kayıtlar korunur: Altın teması dk-tema54.altin, görünüm dk-ptema43 (V54/V43 anahtarları); Altın teması Elmas’ın tercihini (dk-theme) değiştirmez; Elmas · Otomatik = cihaz teması',
      t.kayit && t.kayit.altin === 'lacivert' && t.ptema === 'gece' && t.oto.tercih === 'oto' && ['gunduz', 'gece'].includes(t.oto.pt) && t.elmasKayit[1] !== 'oto', {kayit: t.kayit, ptema: t.ptema, oto: t.oto, elmas: t.elmasKayit});
    await p.reload(); await p.waitForTimeout(2300); await altinAc(p);
    const yk = await p.evaluate(async () => { go('psinif', {pg: 4}); await new Promise((r) => setTimeout(r, 800)); return {ta: document.documentElement.dataset.tema54a, pt: document.documentElement.dataset.pt43}; });
    ok('T6 Yeniden açılışta Altın teması ve görünümü korunur', yk.ta === 'lacivert' && yk.pt === 'gece', yk);
    // Öğretmen
    const og = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 600)), o = {};
      V53.Onizleme.bitir(); await bk(800); V50.Mod.gec('ogretmen'); await bk(1200);
      document.querySelector('.og54-tm').click(); await bk(600);
      o.secenek = [...document.querySelectorAll('.tm57-k b')].map((x) => x.textContent); UI.close(); await bk(400);
      o.renk = {};
      for (const [k, m] of [['lacivert', 'gece'], ['zumrut', 'gunduz'], ['elmas', 'gunduz'], ['elmas', 'gece']]) {
        V54.Tema.sec('ogretmen', k); V54.Tema.mod('ogretmen', m); await bk(600); const b = getComputedStyle(document.body);
        o.renk[k + ':' + m] = {bg: b.backgroundColor, ink: b.getPropertyValue('--t37-ink').trim(), card: b.getPropertyValue('--t37-card').trim(), mut: b.getPropertyValue('--t37-mut').trim(), act: b.getPropertyValue('--t37-act').trim(), on: b.getPropertyValue('--t37-on').trim()};
      }
      V57.Tema.elmas('ogretmen', 'oto'); await bk(500); o.oto = [document.documentElement.dataset.tema54om, JSON.parse(localStorage.getItem('dk-tema54')).ogretmenMod];
      o.elmas = document.documentElement.dataset.theme;
      return o;
    });
    await p.evaluate(async () => { V57.Tema.elmas('ogretmen', 'gece'); await new Promise((r) => setTimeout(r, 700)); });
    await p.screenshot({path: path.join(SH, 'ogretmen-elmas-koyu.png')});
    await p.evaluate(async () => { V54.Tema.sec('ogretmen', 'zumrut'); V54.Tema.mod('ogretmen', 'gunduz'); await new Promise((r) => setTimeout(r, 700)); });
    await p.screenshot({path: path.join(SH, 'ogretmen-zumrut-gunduz.png')});
    const ko = Object.fromEntries(Object.entries(og.renk).map(([k, v]) => [k, {ink: kon(v.ink, v.card), mut: kon(v.mut, v.card), act: kon(v.on, v.act)}]));
    ok('T7 Öğretmen Modu: mevcut 5 tema korunur + Elmas temaları (Açık, Koyu, Otomatik); Elmas Açık/Koyu zemini #F3F5FA/#0B1020; okunurluk ≥ 7 / 4,5 / 4,5; Otomatik cihaz temasına çözülür',
      ['Altın Mihrap', 'Gece Lacivert', 'Zümrüt Kütüphane', 'Mürekkep ve Bakır', 'Kum Taşı', 'Elmas · Açık', 'Elmas · Koyu', 'Elmas · Otomatik'].every((x) => og.secenek.includes(x)) && yakin(og.renk['elmas:gunduz'].bg, '#F3F5FA') && yakin(og.renk['elmas:gece'].bg, '#0B1020') && og.renk['lacivert:gece'].bg !== og.renk['zumrut:gunduz'].bg && Object.values(ko).every((x) => x.ink >= 7 && x.mut >= 4.5 && x.act >= 4.5) && og.oto[1] === 'oto' && ['gunduz', 'gece'].includes(og.oto[0]), {secenek: og.secenek, renk: og.renk, ko, oto: og.oto});
    await ctx.close();
  }

  /* ---------- E: Elmas ---------- */
  {
    const {p, ctx} = await sayfa({dpr: 2});
    const e1 = await p.evaluate(async () => {
      go('home'); await new Promise((r) => setTimeout(r, 700));
      return {kart: [...document.querySelectorAll('.m47-k')].map((b) => (b.querySelector('b') || b).textContent), bag: /Bağlantılar/.test(($.querySelector('.m47') || {}).innerText || '')};
    });
    await p.evaluate(() => document.querySelector('.m47') && document.querySelector('.m47').scrollIntoView({block: 'center'}));
    await p.screenshot({path: path.join(SH, 'elmas-kesif.png')});
    ok('E1 Elmas ana sayfa Keşif: yalnız “Sureler ve Dualar” ve “Bilgi Atlası”; Kavramlar/Kişiler ve Eserler/Bağlantılar ayrı kartları yok', JSON.stringify(e1.kart) === '["Sureler ve Dualar","Bilgi Atlası"]' && !e1.bag, e1);
    const at = await p.evaluate(async () => {
      const bk = () => new Promise((r) => setTimeout(r, 700)), o = {veri: {kavram: Store.all('concepts').length, varlik: Store.all('entities').length}};
      document.querySelector('.m47-k[data-k="atlas"]').click(); await bk(); o.view = view; o.sekme = [...document.querySelectorAll('.ba57 button')].map((x) => x.textContent.trim());
      o.kavram = document.querySelectorAll('details.cp').length;
      V57.Atlas.git('kisi'); await bk(); o.kisi = [...document.querySelectorAll('details.cp summary')].map((s) => s.textContent).every((t) => /Kişi/.test(t)); o.kisiN = (document.querySelector('.note') || {}).textContent;
      V57.Atlas.git('eser'); await bk(); o.eser = [...document.querySelectorAll('details.cp summary')].map((s) => s.textContent).every((t) => /Eser/.test(t)); o.eserN = (document.querySelector('.note') || {}).textContent;
      V57.Atlas.git('diger'); await bk(); o.diger = (document.querySelector('.note') || {}).textContent; o.digerTur = !!document.querySelector('.sfilt select[onchange*="entities"]');
      V57.Atlas.git('kavram'); await bk(); const s = document.querySelector('.search input'); s.value = 'abdest'; s.dispatchEvent(new Event('change')); await bk(); o.ara = document.querySelectorAll('details.cp').length;
      go('kisi'); await bk(); o.kisiYonlen = [view, G.atl];
      go('links'); await bk(); o.links = view;
      sessionStorage.setItem('dk-editor-oturum38', '1'); V51.Yonetici.tamam = () => true; go('links'); await bk(); o.linksEd = view; sessionStorage.removeItem('dk-editor-oturum38');
      return o;
    });
    await p.evaluate(async () => { G.atl = 'kisi'; go('atlas57'); await new Promise((r) => setTimeout(r, 700)); });
    await p.screenshot({path: path.join(SH, 'elmas-bilgi-atlasi.png')});
    ok('E2 Bilgi Atlası: Kavramlar · Kişiler · Eserler · Diğer kayıtlar alt sekmeleri; Kişiler yalnız kişi, Eserler yalnız eser; arama çalışıyor; kayıt sayıları aynı (veri kaybı yok)',
      at.view === 'atlas57' && at.sekme.length === 4 && /Kavramlar/.test(at.sekme[0]) && at.kavram > 0 && at.kisi && at.eser && /51 kayıt/.test(at.kisiN) && /17 kayıt/.test(at.eserN) && at.digerTur && at.ara >= 1 && at.veri.kavram === 629 && at.kisiYonlen[0] === 'atlas57' && at.kisiYonlen[1] === 'kisi', at);
    ok('E3 Bağlantılar Elmas’ta öğrenciye kapalı (Bilgi Atlası’na yönlenir); editör erişimi korunur', at.links === 'atlas57' && at.linksEd === 'links', {links: at.links, ed: at.linksEd});
    const c = await p.evaluate(async () => {
      const bk = () => new Promise((r) => setTimeout(r, 700)), o = {};
      go('calis45'); await bk(); const t = $.innerText;
      o.yok = ['Tekrar yok', 'Hepsi öğrenildi', 'Yanlışın yok', '10 soru', 'Tekrar zamanı gelenler'].filter((x) => t.includes(x)); o.kart = !!$.querySelector('.kt57'); o.dugme = [...$.querySelectorAll('.kt57-d b')].map((x) => x.textContent);
      o.tekrarVeri = typeof V45.Calis.kazanimlar === 'function' && Array.isArray(V45.Calis.kazanimlar().vakit);
      const h0 = V56.Hedef.bugun().n;
      V57.Elmas.karma('sinif'); await bk(); o.sinif = {view, g: [...new Set(V30.tq.ids.map((i) => Store.get('questions', i).grade))], n: V30.tq.ids.length};
      go('calis45'); await bk(); V57.Elmas.karma('tum'); await bk(); o.tum = {view, g: [...new Set(V30.tq.ids.map((i) => Store.get('questions', i).grade))].sort((a, b) => a - b), n: V30.tq.ids.length};
      const q5 = V30.tq.ids.map((i) => Store.get('questions', i)).find((q) => +q.grade !== 4) || Store.all('questions').find((q) => +q.grade === 5);
      Prog.rec(q5.outcomeIds, true); o.hedef = {once: h0, sonra: V56.Hedef.bugun().n, genel: V56.Hedef.genel().bugun};
      go('profil46'); await bk(); o.profil = {ilr: !!$.querySelector('.pr49-ilr'), metin: /İlerlemem/.test($.innerText)};
      return o;
    });
    await p.evaluate(async () => { go('calis45'); await new Promise((r) => setTimeout(r, 700)); window.scrollTo(0, 0); });
    await p.screenshot({path: path.join(SH, 'elmas-calismam.png')});
    ok('E4 Elmas Çalışmam: “Tekrar yok”, “Hepsi öğrenildi”, “Yanlışın yok”, “10 soru” kutuları ve “Tekrar zamanı gelenler” yok; tekrar verisi/algoritması yerinde; Hızlı karma test kartında iki kapsam', !c.yok.length && c.kart && JSON.stringify(c.dugme) === '["Kendi sınıfıma göre","Bütün sınıflara göre"]' && c.tekrarVeri, {yok: c.yok, dugme: c.dugme});
    ok('E5 Hızlı karma test: “Kendi sınıfıma göre” yalnız 4. sınıf soruları; “Bütün sınıflara göre” birden çok sınıftan; başka sınıftan doğru cevap 4. sınıf günlük hedefini artırmaz, genel çalışmayı artırır',
      c.sinif.view === 'test' && JSON.stringify(c.sinif.g) === '[4]' && c.sinif.n === 10 && c.tum.view === 'test' && c.tum.g.length > 1 && c.tum.n === 10 && c.hedef.sonra === c.hedef.once && c.hedef.genel >= 1, {sinif: c.sinif, tum: c.tum, hedef: c.hedef});
    ok('E6 Elmas Profilim’de “İlerlemem” bölümü yok (bilgiler Çalışmam’da)', !c.profil.ilr && !c.profil.metin, c.profil);
    await ctx.close();
  }

  /* ---------- A: Altın ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2});
    await altinAc(p);
    const s = await p.evaluate(async () => {
      const bk = () => new Promise((r) => setTimeout(r, 800)), o = {};
      go('psinif', {pg: 4}); await bk(); o.ilk = {nk: !!$.querySelector('.nk57'), metin: ($.querySelector('.nk57') || {}).innerText || '', ban: !!$.querySelector('.d45-banner'), nereden: /Nereden başlamalıyım/.test($.innerText)};
      const t = V39.units(4, V39.pv(4))[1], tp = V39.tops(t.id)[0]; go('pders', {pt: tp.id, ptab: ''}); await bk();
      go('psinif', {pg: 4}); await bk(); o.son = {metin: ($.querySelector('.nk57') || {}).innerText || '', tid: tp.title};
      $.querySelector('.nk57-d').click(); await bk(); o.devam = [view, G.pt === tp.id];
      return o;
    });
    await p.evaluate(async () => { go('psinif', {pg: 4}); await new Promise((r) => setTimeout(r, 800)); });
    await p.screenshot({path: path.join(SH, 'altin-nerede-kaldim.png')});
    ok('S1 Altın sınıf merkezi: oyun dünyası kartı ve “Nereden başlamalıyım?” yok; “Nerede Kaldım?” son konuyu, ünitesini ve konu ilerlemesini gösterir; düğme kaldığı konuyu açar',
      s.ilk.nk && !s.ilk.ban && !s.ilk.nereden && /Nerede Kaldım\?/.test(s.son.metin) && s.son.metin.includes(s.son.tid) && /2\. ünite/.test(s.son.metin) && /%\d+/.test(s.son.metin) && s.devam[0] === 'pders' && s.devam[1], s);
    const tb = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 600)), o = {};
      go('pders', {pt: 'TPC18-4-1-01', ptab: ''}); await bk(800);
      const sg = $.querySelector('.seg46'); o.seg = sg.classList.contains('seg57'); o.i0 = sg.style.getPropertyValue('--i'); o.n = sg.style.getPropertyValue('--n');
      o.alt0 = [...$.querySelectorAll('nav.tabs46 button')].filter((b) => getComputedStyle(b).display !== 'none').map((b) => b.textContent.trim());
      const bt = [...sg.querySelectorAll('button')]; bt[1].click(); await bk(); const sg2 = $.querySelector('.seg46');
      o.i1 = sg2.style.getPropertyValue('--i'); o.alt1 = [...$.querySelectorAll('nav.tabs46 button')].filter((b) => getComputedStyle(b).display !== 'none').map((b) => b.textContent.trim());
      [...$.querySelectorAll('.seg46 button')][0].click(); await bk();
      const oz = [...$.querySelectorAll('nav.tabs46 button')].find((b) => /Özet/.test(b.textContent)); oz.click(); await bk();
      o.ozet = {on: ($.querySelector('nav.tabs46 button.on') || {}).textContent, ptab: G.ptab};
      const on = $.querySelector('.seg46 button.on'); o.stil = {renk: getComputedStyle(on).color, onceki: getComputedStyle($.querySelector('.seg46'), '::before').transform, alt: getComputedStyle($.querySelector('nav.tabs46 button.on')).borderTopColor};
      return o;
    });
    await p.screenshot({path: path.join(SH, 'altin-konu-sekmeleri.png')});
    ok('S2 Altın konu sekmeleri: Öğren/Pekiştir/Kendini Dene segmentli (kayan vurgu --i ile değişir), alt sekmeler hap biçiminde; sekme sırası ve işlevi aynı (Pekiştir’de alt sekmeler değişir, Özet açılır)',
      tb.seg && tb.n === '3' && tb.i0 === '0' && tb.i1 === '1' && tb.alt0.includes('Anlatım') && JSON.stringify(tb.alt0) !== JSON.stringify(tb.alt1) && /Özet/.test(tb.ozet.on || '') && tb.ozet.ptab === 'ozet', tb);
    const hh = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 600)), o = {};
      V54.Oyun.git('halka'); await bk(900);
      const ring = $.querySelector('.hr57'), R = ring.getBoundingClientRect(), cx = R.left + R.width / 2, cy = R.top + R.height / 2;
      const H = [...ring.querySelectorAll('.hr57-h')], P = H.map((h) => { const r = h.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, t: h.textContent, c: h.className}; });
      o.harf = P.map((x) => x.t).join(''); o.n = P.length;
      const d = P.map((x) => Math.hypot(x.x - cx, x.y - cy)); o.yaricap = [Math.min(...d), Math.max(...d)].map(Math.round);
      let min = 1e9; for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) if (!/su/.test(P[i].c) && !/su/.test(P[j].c)) min = Math.min(min, Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y) - (P[i].w + P[j].w) / 2);
      o.bosluk = Math.round(min * 10) / 10; o.boy = Math.round(Math.min(...P.map((x) => x.w)));
      o.su = (ring.querySelector('.hr57-h.su') || {}).textContent; o.orta = (ring.querySelector('.hr57-c') || {}).textContent; o.sure = (document.getElementById('hh54-z') || {}).textContent;
      const d0 = V54.Oyun.d, x = d0.harfler[d0.sira[d0.k]]; const inp = document.getElementById('hh54-i'); inp.value = x.ad; inp.form.requestSubmit(); await bk();
      o.dogru = {h: x.h, sinif: ($.querySelector(`.hr57-h[aria-label^="${x.h}:"]`) || {}).className, puan: V54.Oyun.d.puan};
      const bek = [...$.querySelectorAll('.hr57-h.bk')]; const hedef = bek[bek.length - 1].textContent; bek[bek.length - 1].click(); await bk();
      o.sec = {hedef, su: ($.querySelector('.hr57-h.su') || {}).textContent};
      const ps = ($.querySelector('.hr57-h.su') || {}).textContent; [...$.querySelectorAll('.hh54-k button')].find((b) => /Pas/.test(b.textContent)).click(); await bk();
      o.pas = {once: ps, sonra: ($.querySelector('.hr57-h.su') || {}).textContent};
      await bk(1200); o.sure2 = (document.getElementById('hh54-z') || {}).textContent;
      return o;
    });
    await p.screenshot({path: path.join(SH, 'harf-halkasi.png')});
    ok('H1 Harf Halkası: 29 harf Türk alfabesi sırasıyla gerçek bir halkada (merkeze uzaklık eşit), harfler üst üste binmiyor, dokunulabilir boyutta; ortada sıradaki harf ve süre',
      hh.harf === 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ' && hh.n === 29 && hh.yaricap[1] - hh.yaricap[0] <= 3 && hh.bosluk >= 1 && hh.boy >= 28 && hh.su && hh.su === hh.orta && /sn/.test(hh.sure), hh);
    ok('H2 Harf Halkası oynanış: doğru cevap harfi yeşile çevirir ve 10 puan ekler; bekleyen harfe dokununca o harfe geçilir; Pas sıradaki harfe geçirir; süre işliyor',
      /dg/.test(hh.dogru.sinif || '') && hh.dogru.puan === 10 && hh.sec.su === hh.sec.hedef && hh.pas.sonra && hh.pas.sonra !== hh.pas.once && parseInt(hh.sure2) < parseInt(hh.sure), {dogru: hh.dogru, sec: hh.sec, pas: hh.pas, sure: [hh.sure, hh.sure2]});
    const sc = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 600)), o = {};
      clearInterval(V54.Oyun._t); G.gf = {}; go('games'); await bk(900);
      o.sistem = [...$.querySelectorAll('.gf56 select')].every((s) => getComputedStyle(s).opacity === '0'); o.dugme = $.querySelectorAll('.gf56 .sc57-b').length;
      $.querySelector('.gf56 .sc57-b').click(); await bk();
      const L = [...document.querySelectorAll('.sc57-o')], k = document.querySelector('.sc57-k').getBoundingClientRect();
      o.secenek = L.length; o.min = Math.round(Math.min(...L.map((x) => x.getBoundingClientRect().height))); o.secili = (document.querySelector('.sc57-o.on') || {}).textContent; o.icinde = k.top >= 0 && k.bottom <= innerHeight + 1 && k.left >= 0 && k.right <= innerWidth + 1;
      L[1].click(); await bk(800); o.u = G.gf.u; o.liste = [...$.querySelectorAll('.kart43, .gcd30')].filter((x) => x.getBoundingClientRect().height > 0).length; o.etiket = $.querySelector('.gf56 .sc57-b').textContent.trim();
      return o;
    });
    ok('P1 Oyun bul seçimi (Altın): sistem açılır listesi gizli; tasarıma uygun seçim penceresi ekranda, seçenekler ≥ 52 px, seçili seçenek işaretli; seçim süzgeci çalıştırır (ünite seçilince oyunlar listelenir)',
      sc.sistem && sc.dugme >= 1 && sc.secenek >= 2 && sc.min >= 50 && /Bütün üniteler/.test(sc.secili) && sc.icinde && sc.u && sc.liste > 0 && sc.etiket.length > 3, sc);
    await ctx.close();
  }

  /* ---------- P2: Elmas uzun liste (tüm sınıflar) kaydırılır ---------- */
  {
    const {p, ctx} = await sayfa({w: 360, h: 640});
    const r = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 700)), o = {};
      G.gf = {}; go('games'); await bk(900); V56.OyunFiltre.sinifSec(true); await bk();
      document.querySelector('.gf56 .sc57-b').click(); await bk();
      const l = document.querySelector('.sc57-l'); o.kaydirma = l.scrollHeight > l.clientHeight; const k = document.querySelector('.sc57-k').getBoundingClientRect(); o.icinde = k.top >= 0 && k.bottom <= innerHeight + 1; o.nav = getComputedStyle(document.querySelector('nav.bnav')).visibility;
      const L = [...document.querySelectorAll('.sc57-o')]; L.find((x) => /7\. sınıf/.test(x.textContent)).click(); await bk(); o.g = G.gf.g; o.gen = document.documentElement.scrollWidth;
      return o;
    });
    await p.screenshot({path: path.join(SH, 'elmas-oyun-bul.png')});
    ok('P2 Elmas seçim penceresi küçük telefonda (360×640): uzun liste kendi içinde kayar, pencere ekran içinde, alt menü arkada gizli; “7. sınıf” seçimi uygulanır; yatay taşma yok', r.kaydirma && r.icinde && r.nav === 'hidden' && String(r.g) === '7' && r.gen <= 361, r);
    await ctx.close();
  }

  /* ---------- M: telefonda yerleşim ---------- */
  {
    const {p, ctx} = await sayfa({w: 360, h: 740, ses: ED});
    const olc = (L, nav) => p.evaluate(async ([L, nav]) => {
      const o = {};
      for (const [v, a, f] of L) { if (f) eval(f); else go(v, a); await new Promise((r) => setTimeout(r, 900)); window.scrollTo({top: 1e7, behavior: 'instant'}); await new Promise((r) => setTimeout(r, 400)); const n = document.querySelector(nav), son = Math.max(...[...$.querySelectorAll('*')].filter((x) => !x.children.length && x.getBoundingClientRect().height > 0 && getComputedStyle(x).visibility !== 'hidden' && !x.closest('[inert],[hidden],.gf56-gz,.sc57-gizli,details:not([open]) > :not(summary)')).map((x) => x.getBoundingClientRect().bottom)); o[v] = {son: Math.round(son), nav: n && !n.hidden && n.getBoundingClientRect().height && getComputedStyle(n).display !== 'none' ? Math.round(n.getBoundingClientRect().top) : null, gen: document.documentElement.scrollWidth}; }
      return o;
    }, [L, nav]);
    const el = await olc([['home', {}], ['atlas57', {}], ['calis45', {}], ['profil46', {}], ['games', {}]], 'nav.bnav');
    await altinAc(p);
    const al = await olc([['psinif', {pg: 4}], ['pders', {pt: 'TPC18-4-1-01', ptab: ''}], ['aoyun53', null, "V54.Oyun.git('halka')"], ['profil46', {}]], '#bn50');
    await p.evaluate(async () => { V54.Oyun.git('halka'); await new Promise((r) => setTimeout(r, 700)); });
    await p.screenshot({path: path.join(SH, 'telefon-360-harf-halkasi.png')});
    const hepsi = Object.assign({}, el, al), okM = Object.values(hepsi).every((x) => x.gen <= 361 && (x.nav == null || x.son <= x.nav + 2));
    ok('M1 360 px telefonda (Elmas ana sayfa, Bilgi Atlası, Çalışmam, Profilim, Oyunlar; Altın sınıf merkezi, konu, Harf Halkası, Profilim) yatay taşma yok, alt menü içeriği kapatmıyor', okM, hepsi);
    await ctx.close();
  }

  ok('Z1 Sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); st.close();
  const gecen = S.filter((x) => x.ok).length;
  console.log(`\n${gecen}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen, toplam: S.length, kontroller: S}, null, 1));
  process.exit(gecen === S.length ? 0 : 1);
})();
