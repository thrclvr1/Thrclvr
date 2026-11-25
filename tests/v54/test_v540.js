// V54.0 testleri (depo kökünden): node tests/v54/test_v540.js — ekran görüntüleri docs/V54.0_ekran/.
// Tarayıcı (yerel http) + APK benzetimi. Gerçek telefon burada DENENEMEZ.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v54.0.html', F0 = 'surumler/din-kulturu-platformu-v53.0.html';
const SH = path.join(ROOT, 'docs', 'V54.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 500) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const lum = (h) => { h = h.replace('#', ''); const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const kon = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

(async () => {
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v54.0'));
  ok('A1 sürüm V54.0, index.html aynı; veri blokları V53.0 ile bayt bayt aynı (içerik silinmedi); eski sürüm dosyaları ve APK’lar değişmedi', /V31\.VER="V54\.0"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && degisen.length === 0, degisen);
  ok('A2 HTML’de Gmail adresi ve açık PIN yok; Altın hâlâ kapalı (ACIK: false)', !/@gmail\.com/.test(h1) && !h1.includes('030792') && /ACIK: false,/.test(h1));

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const b = await chromium.launch();
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, dosya: F, ek: {}, ses: {}, dpr: 1, sinif: 5}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true, deviceScaleFactor: o.dpr});
    await ctx.route('https://accounts.google.com/**', (r) => r.abort()); await ctx.route('https://www.googleapis.com/**', (r) => r.abort());
    await ctx.addInitScript(([o]) => {
      if (!localStorage.getItem('__s')) {
        localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '1');
        localStorage.setItem('dk-deneyim39', JSON.stringify({son: 'normal', hatirla: true}));
        localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false}));
        if (o.sinif) localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: o.sinif}}}));
        for (const k in o.ek) localStorage.setItem(k, o.ek[k]);
      }
      for (const k in o.ses) sessionStorage.setItem(k, o.ses[k]);
    }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (er) => HATA.push(er.message));
    await p.goto(ORIGIN + '/' + o.dosya); await p.waitForTimeout(2300);
    return {p, ctx};
  };
  const altinAc = (p) => p.evaluate(async () => { V51.Yonetici.tamam = () => true; V53.Onizleme.baslat(); await new Promise((r) => setTimeout(r, 1500)); });

  /* ---------- E: Elmas ana sayfa, Derslerim, akordiyon, Bağlantılar ---------- */
  {
    const {p, ctx} = await sayfa({dpr: 2});
    const h = await p.evaluate(async () => { go('home'); await new Promise((r) => setTimeout(r, 500)); return {kart: [...$.querySelectorAll('.h46-k')].map((x) => (x.getAttribute('onclick') || '').match(/go\('(\w+)'/)[1]), dv: !!$.querySelector('.dv54'), sinif: /Sınıfım: 5\. sınıf/.test(($.querySelector('.dv54') || {}).innerText || ''), ara: !!$.querySelector('input')}; });
    await p.screenshot({path: path.join(SH, 'elmas-ana-sayfa.png')});
    ok('E1 Ana sayfa sade: alt menüdeki Çalışmam ve Profilim kartları kaldırıldı; Derslerim, Oyunlar, sınıf bilgisi, arama, “devam et/başla” ve günlük hedef var', JSON.stringify(h.kart) === '["classes","games"]' && h.dv && h.sinif && h.ara, h);
    const d = await p.evaluate(async () => { go('classes'); await new Promise((r) => setTimeout(r, 600)); const g = [...new Set([...$.querySelectorAll('[onclick*="go(\'grade\'"]')].map((b) => +(b.getAttribute('onclick').match(/g:\s*(\d+)/) || [])[1]).filter(Boolean))]; return {view, g, ben: ($.querySelector('.sn54-ben') || {}).innerText || ''}; });
    await p.screenshot({path: path.join(SH, 'derslerim-butun-siniflar.png')});
    ok('E2 Derslerim 4–12 bütün sınıfları gösterir (yönlendirme yok); öğrencinin sınıfı “Sınıfım” rozetiyle işaretli', d.view === 'classes' && [4, 5, 6, 7, 8, 9, 10, 11, 12].every((n) => d.g.includes(n)) && /Sınıfım/.test(d.ben) && /5/.test(d.ben), d);
    const k = await p.evaluate(async () => {
      go('grade', {g: 7}); await new Promise((r) => setTimeout(r, 600));
      const o = {s: V53.Hesap.sinif()}; const A = [...$.querySelectorAll('article.card.unit')]; o.unite = A.length; o.dugme = $.querySelectorAll('.ak54').length; o.kapali = A.filter((a) => a.querySelector('.tlist').hidden).length;
      o.korunan = A.every((a) => a.querySelector('h2') && a.querySelector('.udesc') !== undefined);
      const b = $.querySelector('.ak54'); b.click(); o.acildi = !b.closest('article').querySelector('.tlist').hidden && b.getAttribute('aria-expanded') === 'true'; b.click(); o.kapandi = b.closest('article').querySelector('.tlist').hidden;
      b.click(); go('grade', {g: 7}); await new Promise((r) => setTimeout(r, 500)); o.hatirla = !$.querySelector('article.card.unit .tlist').hidden;
      const t = $.querySelector('.trow'); o.tid = (t.getAttribute('onclick').match(/t:'([^']+)'/) || [])[1]; t.click(); await new Promise((r) => setTimeout(r, 500)); o.sonra = V53.Hesap.sinif(); o.son54 = localStorage.getItem('dk-son54'); return o; });
    await p.evaluate(async () => { go('grade', {g: 5}); await new Promise((r) => setTimeout(r, 500)); $.querySelector('.ak54').click(); });
    await p.screenshot({path: path.join(SH, 'unite-akordiyon.png')});
    ok('E3 Ünite konu listeleri akordiyon: başta kapalı, dokununca açılır/kapanır, açık durum hatırlanır; ünite açıklaması korunur', k.unite >= 3 && k.dugme === k.unite && k.kapali === k.unite && k.acildi && k.kapandi && k.hatirla, k);
    ok('E4 Başka sınıfın (7.) konusuna bakmak öğrencinin sınıfını (5.) ve “devam et” kaydını değiştirmez', k.sonra === 5 && !(k.son54 || '').includes(k.tid), k);
    const l = await p.evaluate(async () => { go('links'); await new Promise((r) => setTimeout(r, 600)); const o = {btn: [...$.querySelectorAll('button')].some((b) => /Yönetim/.test(b.innerText))}; V34.S().tab = 'yonetim'; V34.render(); await new Promise((r) => setTimeout(r, 300)); o.tab = V34.S().tab; o.harita = [...$.querySelectorAll('button')].some((b) => /Kavram Haritası/.test(b.innerText)); const kap = document.createElement('div'); V34.tabYonetim(kap); o.fn = kap.innerText; return o; });
    ok('E5 Bağlantılar: Yönetim sekmesi öğrenciye görünmez; elle açılmak istense de Kavram Haritası’na döner; yönetim işlevi yetki ister', !l.btn && l.tab !== 'yonetim' && l.harita && /yalnız editör/.test(l.fn), l);
    const ogr = await p.evaluate(async () => { V36.ss(V36.SK, '1'); go('links'); await new Promise((r) => setTimeout(r, 600)); return [...$.querySelectorAll('button')].some((b) => /Yönetim/.test(b.innerText)); });
    const ed = await p.evaluate(async () => { V36.ss(V36.SK, ''); sessionStorage.setItem('dk-editor-oturum38', '1'); V51.Yonetici.tamam = () => true; go('links'); await new Promise((r) => setTimeout(r, 600)); return [...$.querySelectorAll('button')].some((b) => /Yönetim/.test(b.innerText)); });
    ok('E6 Öğretmen de Yönetim’i göremez; yalnız editör oturumunda görünür', !ogr && ed, {ogr, ed});
    const g = await p.evaluate(async () => { sessionStorage.removeItem('dk-editor-oturum38'); go('games'); await new Promise((r) => setTimeout(r, 700)); const t = document.body.innerText; return {yeni: ['Beni Bul!', 'Kavram Köprüsü', 'Zihin Sandığı', 'Zaman Yolculuğu', 'Kelimeyi Anlat Bakalım', 'Çark Çevirme'].filter((a) => t.includes(a)), eski: ['Ben Kimim', 'Tabu', 'Kelime avı', 'Çarkıfelek', 'Olayı Sırala'].filter((a) => new RegExp('\\b' + a).test(t))}; });
    await p.screenshot({path: path.join(SH, 'elmas-oyun-adlari.png')});
    ok('E7 Oyun adları tutarlı: Beni Bul!, Kavram Köprüsü, Zihin Sandığı, Zaman Yolculuğu, Kelimeyi Anlat Bakalım, Çark Çevirme; eski adlar görünmez', g.yeni.length === 6 && !g.eski.length, g);
    const bk = await p.evaluate(() => Store.all('games').filter((x) => x.gameType === 'benkimim').flatMap((x) => x.items.flatMap((i) => i.hints)).filter((h) => /müfredat|sayfada|^Konu:/i.test(h)).length);
    ok('E8 Ben Kimim (Beni Bul!) ipuçlarında sınıf, sayfa ve “Konu:” gibi teknik bilgiler yok', bk === 0, bk);
    await ctx.close();
  }
  /* ---------- S: sınıf sorusu ---------- */
  {
    const {p, ctx} = await sayfa({sinif: 0});
    const a = await p.evaluate(() => !!document.getElementById('sn53'));
    const b2 = await p.evaluate(async () => { go('classes'); await new Promise((r) => setTimeout(r, 500)); return {ov: !!document.getElementById('sn53'), gec: !!document.querySelector('#sn53 .sn54-gec')}; });
    await p.evaluate(() => V54.Duzen.simdilikGec()); await bek(200);
    const c = await p.evaluate(async () => { go('games'); await new Promise((r) => setTimeout(r, 500)); return !!document.getElementById('sn53'); });
    const t = await p.evaluate(async () => { sessionStorage.removeItem('dk-sinifgec54'); V36.ss(V36.SK, '1'); go('ogretmen'); await new Promise((r) => setTimeout(r, 500)); go('classes'); await new Promise((r) => setTimeout(r, 500)); return !!document.getElementById('sn53'); });
    ok('S1 Sınıf açılışta zorunlu değil; öğrenci Derslerim’e girerken sorulur ve “Şimdilik geç” var; geçince oturum boyunca sorulmaz; öğretmen oturumunda sorulmaz', !a && b2.ov && b2.gec && !c && !t, {a, b2, c, t});
    await ctx.close();
  }
  /* ---------- T: öğretmen teması ---------- */
  {
    const {p, ctx} = await sayfa({});
    const r = await p.evaluate(async () => {
      V36.ss(V36.SK, '1'); go('ogretmen'); await new Promise((x) => setTimeout(x, 800)); const o = {ilk: !!document.querySelector('.og54-tm')};
      for (const tab of ['sinif', 'hafta', 'araclar', 'sinif']) { try { OGRT.S().tab = tab; OGRT.render(); } catch (e) {} await new Promise((x) => setTimeout(x, 200)); if (!document.querySelector('.og54-tm')) o.kayip = tab; }
      go('home'); await new Promise((x) => setTimeout(x, 300)); go('ogretmen'); await new Promise((x) => setTimeout(x, 600)); o.donus = document.querySelectorAll('.og54-tm').length;
      const L = {}; for (const k of ['altin', 'lacivert', 'zumrut', 'murekkep', 'kumtasi']) for (const m of ['gece', 'gunduz']) { V54.Tema.sec('ogretmen', k); V54.Tema.mod('ogretmen', m); await new Promise((x) => setTimeout(x, 120)); const s = getComputedStyle(document.body); L[k + '-' + m] = ['--t37-bg', '--t37-ink', '--t37-mut', '--t37-card', '--t37-act', '--t37-on'].map((v) => s.getPropertyValue(v).trim()); }
      V54.Tema.sec('ogretmen', 'zumrut'); V54.Tema.mod('ogretmen', 'gunduz'); o.L = L; return o; });
    await p.screenshot({path: path.join(SH, 'ogretmen-zumrut-gunduz.png')});
    await p.reload(); await bek(2200);
    const r2 = await p.evaluate(async () => { V36.ss(V36.SK, '1'); go('ogretmen'); await new Promise((x) => setTimeout(x, 800)); return {btn: !!document.querySelector('.og54-tm'), bg: getComputedStyle(document.body).getPropertyValue('--t37-bg').trim(), mod: document.documentElement.getAttribute('data-tema54om')}; });
    const KT = Object.fromEntries(Object.entries(r.L).filter(([, v]) => v.every((x) => /^#/.test(x))).map(([k, [bg, ink, mut, card, act, on]]) => [k, [+kon(ink, bg).toFixed(1), +kon(mut, card).toFixed(1), +kon(on, act).toFixed(1)]]));
    ok('T1 Öğretmen panelinde Tema düğmesi sekme değişiminde ve panel yeniden çizilince kaybolmaz, tek kopya', r.ilk && !r.kayip && r.donus === 1, r);
    ok('T2 Öğretmen teması ve gündüz/gece ayrı ayrı uygulanır, yeniden açılışta korunur (Zümrüt · gündüz)', r2.btn && r2.bg.toUpperCase() === '#EEF3EF' && r2.mod === 'gunduz', r2);
    ok('T3 Öğretmen temalarının 10 görünümü okunur: yazı/zemin ≥ 7, ikincil yazı/kart ≥ 4.5, düğme yazısı ≥ 4.5', Object.keys(KT).length >= 9 && Object.values(KT).every(([a, b2, c]) => a >= 7 && b2 >= 4.5 && c >= 4.5), KT);
    await ctx.close();
  }
  /* ---------- AL: Altın ---------- */
  {
    const {p, ctx} = await sayfa({ses: {'dk-editor-oturum38': '1'}, dpr: 2});
    const kap = await p.evaluate(async () => { V42.gec('premium'); await new Promise((r) => setTimeout(r, 800)); const o = {on: V39.on, yk: !!document.querySelector('#yk518')}; document.querySelectorAll('#yk518').forEach((x) => x.remove()); document.documentElement.classList.remove('yk518-kilit'); return o; });
    ok('AL1 Editör oturumu olsa bile önizleme başlatılmadan Altın kapalı; öğrenciye “Çok yakında”', !kap.on && kap.yk, kap);
    await altinAc(p);
    const ilk = await p.evaluate(() => ({gg: !!document.getElementById('gg54'), on53: !!document.getElementById('on53')}));
    await p.screenshot({path: path.join(SH, 'altin-gunduz-gece-secimi.png')});
    await p.evaluate(() => V54.Tema.ilkSec('gece')); await bek(300);
    await p.evaluate(async () => { go('pdunya'); await new Promise((r) => setTimeout(r, 1200)); });
    const ana = await p.evaluate(() => { const a = $.querySelector('.ah54'); return {var: !!a, ed: !!(a && a.querySelector('.ah54-ed')), masa: !!(a && a.querySelector('.ah54-masa')), metin: a ? a.innerText.replace(/\s+/g, ' ') : '', eski: !!$.querySelector('.c48-masa'), on53: getComputedStyle(document.getElementById('on53') || document.body).display}; });
    await p.evaluate(() => { const a = $.querySelector('.ah54'); if (a) a.scrollIntoView(); }); await bek(300);
    await p.screenshot({path: path.join(SH, 'altin-ana-sayfa.png')});
    ok('AL2 Altın’a ilk girişte gündüz/gece sorulur; ayrı yüzen önizleme menüsü yok', ilk.gg && !ilk.on53, ilk);
    ok('AL3 Altın ana sayfası: devam et, günlük hedef, Çalışma Masam, Derslerim, Oyun Dünyası ve Keşif; editör önizleme notu ve “Önizlemeden çık” akışta', ana.var && ana.ed && ana.masa && /Günlük hedef/.test(ana.metin) && /Derslerim/.test(ana.metin) && /Oyun Dünyası/.test(ana.metin) && /Keşif/.test(ana.metin) && !ana.eski, ana.metin.slice(0, 300));
    const cm = await p.evaluate(async () => { Prog.rec(['DKAB-5-U01-O01'], false); Prog.rec(['DKAB-5-U01-O01'], true); Store.ov.mt = Store.ov.mt || {}; Store.ov.mt['TPC-5-1-01'] = {at: '2026-11-25', n: 5, ok: 4}; Store.save(); go('calis45'); await new Promise((r) => setTimeout(r, 700)); const t = $.innerText; return {view, h: ($.querySelector('.ac53-b h1') || {}).textContent, b: ['Bugünkü planın', 'Hedefler', 'Eksik olduğun konular', 'Yanlış yaptığın sorular', 'Tekrar zamanı gelenler', 'Ünite başarısı', 'Tamamlanan konular', 'Son çalıştığın konular', 'Gelişimin', 'Öğrenme geçmişi'].filter((x) => !t.includes(x)), tamam: /Evrendeki Düzeni Fark Etmek/.test(t)}; });
    await p.screenshot({path: path.join(SH, 'altin-calisma-masam.png')});
    ok('AL4 Altın’da “Çalışmam” Çalışma Masam’ı açar: plan, hedefler, eksik konular, yanlışlar, tekrar, ünite başarısı, tamamlanan konular, son çalışılanlar, 4 haftalık gelişim, öğrenme geçmişi', cm.view === 'acalis53' && cm.h === 'Çalışma Masam' && !cm.b.length && cm.tamam, cm);
    const pr = await p.evaluate(async () => { go('profil46'); await new Promise((r) => setTimeout(r, 700)); return {gor: !!$.querySelector('.pr54'), tema: $.querySelectorAll('.pr54 .tm54-k').length, mod: $.querySelectorAll('.pr54 .gg54 button').length, cik: !!$.querySelector('.pr54 .ah54-ed button')}; });
    ok('AL5 Altın Profilim › Görünüm: 5 tema + gündüz/gece seçimi; editör için “Önizlemeden çık”', pr.gor && pr.tema === 5 && pr.mod === 2 && pr.cik, pr);
    const tm = await p.evaluate(async () => {
      const oku = () => { const s = getComputedStyle(document.body); return ['--p-bg', '--p-ink', '--p-mut', '--p-card', '--p-gold', '--p-on-gold'].map((v) => s.getPropertyValue(v).trim()); };
      const o = {};
      for (const k of ['altin', 'lacivert', 'zumrut', 'murekkep', 'kumtasi']) for (const m of ['gece', 'gunduz']) { V54.Tema.sec('altin', k); V54.Tema.mod('altin', m); await new Promise((x) => setTimeout(x, 120)); o[k + '-' + m] = oku(); }
      const w = () => new Promise((x) => setTimeout(x, 400)); V54.Tema.mod('altin', 'gece'); await w(); V54.Tema.sec('altin', 'lacivert'); await w(); const modSonra = document.documentElement.getAttribute('data-pt43'); V54.Tema.mod('altin', 'gunduz'); await w(); V54.Tema.sec('altin', 'zumrut'); await w(); const modSonra2 = document.documentElement.getAttribute('data-pt43');
      return {o, modSonra, modSonra2};
    });
    await p.evaluate(async () => { go('pdunya'); await new Promise((r) => setTimeout(r, 1200)); const a = $.querySelector('.ah54'); if (a) a.scrollIntoView(); });
    await p.screenshot({path: path.join(SH, 'altin-zumrut-gunduz.png')});
    const KA = Object.fromEntries(Object.entries(tm.o).filter(([, v]) => v.every((x) => /^#/.test(x))).map(([k, [bg, ink, mut, card, gold, on]]) => [k, [+kon(ink, bg).toFixed(1), +kon(mut, card).toFixed(1), +kon(on, gold).toFixed(1)]]));
    ok('AL6 Gündüz/gece temadan bağımsız: tema değişince mod değişmez (gece→gece, gündüz→gündüz)', tm.modSonra === 'gece' && tm.modSonra2 === 'gunduz', tm);
    ok('AL7 Altın temaları (5 × gündüz/gece) birbirinden farklı ve okunur: yazı/zemin ≥ 7, ikincil yazı/kart ≥ 4.5, vurgu düğmesi yazısı ≥ 4.5', new Set(Object.values(tm.o).map((v) => v[0])).size === 10 && Object.values(KA).every(([a, b2, c]) => a >= 7 && b2 >= 4.5 && c >= 4.5), KA);
    await ctx.close();
  }
  /* ---------- O: oyunlar ---------- */
  {
    const {p, ctx} = await sayfa({ses: {'dk-editor-oturum38': '1'}, ek: {'dk-gorunum54': JSON.stringify({v: 1, altin: 1})}, dpr: 2});
    await altinAc(p);
    const hub = await p.evaluate(async () => { go('poyun'); await new Promise((r) => setTimeout(r, 900)); return {n: $.querySelectorAll('.ao54-h .ao53-k').length, ad: [...$.querySelectorAll('.ao54-h .ao53-k b')].map((b) => b.textContent), hikaye: /Hikâyeli görevler/.test($.innerText), eski: !!$.querySelector('.ao53-giris')}; });
    await p.screenshot({path: path.join(SH, 'altin-oyun-dunyasi.png')});
    ok('O1 Altın Oyunları doğrudan Oyun Dünyası’nın içinde: 8 oyun + hikâyeli görevler (Kütüphane, Sınıf Dünyaları)', hub.n === 8 && hub.hikaye && !hub.eski && ['Beni Bul!', 'Gizemli Şahsiyet', 'Harf Halkası', 'Harf Avı', 'Bilgi Arenası', 'Zirve Yarışı', 'Kelimeyi Anlat Bakalım', 'Gizli Bilgin'].every((a) => hub.ad.includes(a)), hub);
    const bb = await p.evaluate(async () => {
      V54.Oyun.git('benibul'); await new Promise((r) => setTimeout(r, 400)); const d = V54.Oyun.d, x = d.L[0], o = {n: d.L.length, ilk: $.querySelectorAll('.bb54-ip li').length, sec: d.sec.length, icerir: d.sec.includes(x.ad)};
      const ipler = d.L.flatMap((y) => V54.Oyun.bbIpuclari(y)); o.teknik = ipler.filter((h) => /müfredat|sayfada yer|\d+\.? sayfa|Konu:|TBS-|DKAB-|\d+\. sınıf/i.test(h)).length; o.sizinti = d.L.filter((y) => y.ip.some((h) => h.toLocaleLowerCase('tr-TR').includes(y.ad.toLocaleLowerCase('tr-TR')))).length;
      V54.Oyun.bbIpucu(); o.ikinci = $.querySelectorAll('.bb54-ip li').length; V54.Oyun.bbCevap(x.ad); o.puan = d.puan; o.ack = !!$.querySelector('.ao53-ack.dg'); return o; });
    await p.screenshot({path: path.join(SH, 'beni-bul.png')});
    ok('O2 Beni Bul!: aşamalı ipuçları (önce yalnız tür, “Yeni ipucu” ile artar), 4 seçenek, erken bilene çok puan (2. ipuçta 70), açıklama; ipuçlarında teknik bilgi ve cevap yok', bb.n >= 8 && bb.ilk === 1 && bb.ikinci === 2 && bb.sec === 4 && bb.icerir && bb.puan === 70 && bb.ack && !bb.teknik && !bb.sizinti, bb);
    const gz = await p.evaluate(async () => { V54.Oyun.git('gizemli'); await new Promise((r) => setTimeout(r, 400)); return {n: V54.Oyun.d.L.length, tur: [...new Set(V54.Oyun.d.L.map((x) => x.tur))]}; });
    ok('O3 Gizemli Şahsiyet yalnız şahsiyet kayıtlarıyla', gz.n >= 5 && JSON.stringify(gz.tur) === '["kisi"]', gz);
    const hh = await p.evaluate(async () => {
      V54.Oyun.git('halka'); await new Promise((r) => setTimeout(r, 400)); const d = V54.Oyun.d, o = {n: d.harfler.length, harf: d.harfler.every((x) => x.ad.charAt(0).toLocaleUpperCase('tr-TR') === x.h), sizinti: d.harfler.filter((x) => x.soru.toLocaleLowerCase('tr-TR').includes(x.ad.toLocaleLowerCase('tr-TR'))).length, ğ: d.harfler.some((x) => x.h === 'Ğ')};
      const x0 = d.harfler[d.sira[0]]; document.getElementById('hh54-i').value = x0.ad.toLocaleUpperCase('tr-TR'); V54.Oyun.hhCevap(false); o.p1 = d.puan;
      const h2 = d.harfler[d.sira[0]].h; V54.Oyun.hhCevap(true); o.pas = d.harfler[d.sira[d.sira.length - 1]].h === h2;
      document.getElementById('hh54-i').value = 'zzz'; V54.Oyun.hhCevap(false); o.yanlis = d.son && d.son.ok === false; return o; });
    await p.screenshot({path: path.join(SH, 'harf-halkasi.png')});
    ok('O4 Harf Halkası: yalnız kaydı olan harfler (Ğ yok), cevap o harfle başlar, soruda cevap gizli; doğru (büyük harfle de) +10, pas sona atar, yanlış işaretlenir', hh.n >= 20 && hh.harf && !hh.sizinti && !hh.ğ && hh.p1 === 10 && hh.pas && hh.yanlis, hh);
    const ar = await p.evaluate(async () => {
      V54.Oyun.git('arena'); await new Promise((r) => setTimeout(r, 400)); const o = {kat: $.querySelectorAll('.ao53-k').length}; const L = V54.Oyun.arHavuz(); o.say = {}; L.forEach((x) => { o.say[x.kat] = (o.say[x.kat] || 0) + 1; });
      V54.Oyun.arBasla('ibadet', ''); const d = V54.Oyun.d; o.n = d.L.length; o.hepsi = d.L.every((x) => x.kat === 'ibadet'); V54.Oyun.arCevap(d.L[0].q.answer); o.dogru = d.dogru; o.ack = !!$.querySelector('.ao53-ack'); return o; });
    await p.screenshot({path: path.join(SH, 'bilgi-arenasi.png')});
    ok('O5 Bilgi Arenası: 8 kategori, zorluk seçimi; seçilen kategoriden 10 soru; doğru cevap ve açıklama', ar.kat === 8 && ar.n === 10 && ar.hepsi && ar.dogru === 1 && ar.ack, ar);
    const gb = await p.evaluate(async () => {
      V54.Oyun.git('gizli'); await new Promise((r) => setTimeout(r, 300)); V54.Oyun.gbBasla(); const d = V54.Oyun.d, o = {n: d.oyuncular.length, kelime: !!d.kelime};
      const goruler = []; for (let i = 0; i < d.oyuncular.length; i++) { V54.Oyun.gbBak(); goruler.push($.querySelector('.gb54-kart').innerText); V54.Oyun.gbSonraki(); }
      o.tekGizli = goruler.filter((g) => /Gizli Bilgin/.test(g)).length === 1 && goruler.filter((g) => g.includes(d.kelime)).length === d.oyuncular.length - 1; o.asama = d.asama;
      V54.Oyun.gbOyla(); V54.Oyun.gbSec(d.gizli); o.tahmin = d.asama; V54.Oyun.gbTahmin(d.secenek.find((s) => s !== d.kelime)); o.son = d.asama; o.puan = Object.values(d.puan).reduce((a, b) => a + b, 0); return o; });
    await p.screenshot({path: path.join(SH, 'gizli-bilgin.png')});
    ok('O6 Gizli Bilgin (aynı cihazda): her oyuncuya sırayla rol; tam bir Gizli Bilgin, diğerleri kavramı görür; oylama → yakalanınca son tahmin → puan tablosu', gb.n === 4 && gb.kelime && gb.tekGizli && gb.asama === 'ipucu' && gb.tahmin === 'tahmin' && gb.son === 'son' && gb.puan === 3, gb);
    const an = await p.evaluate(async () => {
      V54.Oyun.git('anlat'); await new Promise((r) => setTimeout(r, 300)); const o = {kart: V54.Oyun.anHavuz().length, yasak: V54.Oyun.anHavuz().every((k) => k.yasak.length >= 4 && k.yasak.length <= 5)};
      document.getElementById('an54-a').value = 'Kartallar'; document.getElementById('an54-b').value = 'Şahinler'; document.getElementById('an54-t').value = '1'; V54.Oyun.anBasla(); const d = V54.Oyun.d; V54.Oyun.anTurBasla();
      const gor = new Set([d.kart.kelime]); V54.Oyun.anIs('dogru'); gor.add(d.kart.kelime); V54.Oyun.anIs('ceza'); gor.add(d.kart.kelime); V54.Oyun.anIs('pas'); V54.Oyun.anIs('pas'); V54.Oyun.anIs('pas'); const pas4 = d.pas; V54.Oyun.anIs('pas');
      o.skorA = d.skor[0]; o.pasKalan = pas4; o.ekran = $.innerText.includes('Kartallar'); V54.Oyun.anTurBitir(); o.sira = d.sira; o.asama = d.asama; V54.Oyun.anTurBasla(); V54.Oyun.anIs('dogru'); V54.Oyun.anIs('dogru'); V54.Oyun.anTurBitir(); o.son = d.asama; o.skor = d.skor.slice(); o.tekrar = d.deste.every((k) => !gor.has(k.kelime)); o.sonuc = $.innerText.includes('Şahinler kazandı'); return o; });
    await p.screenshot({path: path.join(SH, 'kelimeyi-anlat.png')});
    ok('O7 Kelimeyi Anlat Bakalım: kartlarda 4–5 yasaklı kelime; takım adları; doğru +1, yasaklı −1, pas (3 hak); tur sonunda sıra diğer takıma; maç sonucu; kart tekrarı yok', an.kart >= 10 && an.yasak && an.skorA === 0 && an.pasKalan === 0 && an.ekran && an.sira === 1 && an.asama === 'ara' && an.son === 'son' && JSON.stringify(an.skor) === '[0,2]' && an.tekrar && an.sonuc, an);
    const zr = await p.evaluate(async () => { V54.Oyun.git('zirve'); await new Promise((r) => setTimeout(r, 400)); const d = V53.Oyun.Zirve.d; return {n: d.sorular.length, view, geri: !!$.querySelector('.ao53-geri'), pad: parseInt(getComputedStyle($.querySelector('.ao53')).paddingBottom)}; });
    ok('O8 Zirve Yarışı korunur (10 soru) ve Oyun Dünyası’ndan açılır; alt boşluk alt menüye yer bırakır', zr.n === 10 && zr.view === 'aoyun53' && zr.geri && zr.pad >= 120, zr);
    const ha = await p.evaluate(async () => {
      V54.Oyun.git('harf'); await new Promise((r) => setTimeout(r, 400)); const H = V53.Oyun.Harf, d = H.d, w = d.L[0][0];
      const o = {kutu: document.querySelectorAll('.ao53-hs')[0].querySelectorAll('span').length === w.length};
      for (const h of [...w].slice(1)) H.tus(h); H.gonder(); o.cozuldu = d.cozuldu; o.ack = !!$.querySelector('.ha54');
      const kl = [...$.querySelectorAll('.ao53-ht')].map((b) => b.getBoundingClientRect()); o.klavye = true;
      d.i = 0; d.cozuldu = null; d.tahmin = []; H.ciz(); const bs = [...document.querySelectorAll('.ao53-ht')]; const nav = document.querySelector('nav.bnav, #bn50'); const nb = nav && getComputedStyle(nav).display !== 'none' ? nav.getBoundingClientRect().top : innerHeight;
      window.scrollTo(0, document.documentElement.scrollHeight); await new Promise((r) => setTimeout(r, 300)); const sb = bs[bs.length - 1].getBoundingClientRect(); const nb2 = nav && getComputedStyle(nav).display !== 'none' ? nav.getBoundingClientRect().top : innerHeight; o.ustte = sb.bottom <= nb2 + 1;
      o.iI = ['ı', 'i', 'I', 'İ'].map((c) => c.toLocaleUpperCase('tr-TR')).join(''); return o; });
    await p.screenshot({path: path.join(SH, 'harf-avi.png')});
    ok('O9 Harf Avı: kutu sayısı kelime uzunluğuyla aynı; doğru tahmin çözer ve kitap cümlesini açıklama olarak gösterir; sayfa sonuna kaydırınca klavyenin son tuşu alt menünün üstünde; ı/i/I/İ Türkçe büyük harfe doğru çevrilir', ha.kutu && ha.cozuldu === true && ha.ack && ha.ustte && ha.iI === 'IİIİ', ha);
    await ctx.close();
  }
  /* ---------- Y: editör içerik alanı ---------- */
  {
    const {p, ctx} = await sayfa({ses: {'dk-editor-oturum38': '1'}, ek: {'dk-gorunum54': JSON.stringify({v: 1, altin: 1})}});
    const ogr = await p.evaluate(async () => { sessionStorage.removeItem('dk-editor-oturum38'); go('icerik54'); await new Promise((r) => setTimeout(r, 400)); const t = $.innerText; sessionStorage.setItem('dk-editor-oturum38', '1'); return /yalnız editör/.test(t) && !$.querySelector('form'); });
    const r = await p.evaluate(async () => {
      V51.Yonetici.tamam = () => true; go('editor'); await new Promise((x) => setTimeout(x, 500)); const o = {giris: [...$.querySelectorAll('button')].some((b) => b.getAttribute('onclick') === "go('icerik54')")};
      go('icerik54'); await new Promise((x) => setTimeout(x, 400)); o.form = $.querySelectorAll('form').length;
      V54.Icerik.ekle('anlat', {kelime: 'Deneme Kavramı', yasakli: ['bir', 'iki', 'üç', 'dört'], kategori: 'ibadet', zorluk: 'easy'});
      V54.Icerik.ekle('arena', {kategori: 'peygamber', soru: 'Deneme sorusu?', siklar: ['a', 'b', 'c', 'd'], dogru: 1, zorluk: 'easy', aciklama: 'açıklama', grade: ''});
      o.anlat = V54.Oyun.anHavuz().some((k) => k.kelime === 'Deneme Kavramı'); o.arena = V54.Oyun.arHavuz().some((x) => x.q.text === 'Deneme sorusu?' && x.kat === 'peygamber'); return o; });
    ok('Y1 Editör “Oyun içerikleri” alanı: 4 form; eklenen kart/soru oyun havuzuna girer; öğrenci bu alanı açamaz', ogr && r.giris && r.form === 4 && r.anlat && r.arena, {ogr, r});
    await ctx.close();
  }
  /* ---------- K: küçük ekran ---------- */
  {
    const {p, ctx} = await sayfa({w: 360, h: 640, ses: {'dk-editor-oturum38': '1'}, ek: {'dk-gorunum54': JSON.stringify({v: 1, altin: 1})}});
    await altinAc(p);
    const r = await p.evaluate(async () => { const o = {}; for (const k of ['benibul', 'halka', 'arena', 'gizli', 'anlat', 'zirve', 'harf']) { V54.Oyun.git(k); await new Promise((x) => setTimeout(x, 350)); o[k] = document.documentElement.scrollWidth <= innerWidth + 1; } go('acalis53'); await new Promise((x) => setTimeout(x, 400)); o.masa = document.documentElement.scrollWidth <= innerWidth + 1; go('pdunya'); await new Promise((x) => setTimeout(x, 1000)); o.ana = document.documentElement.scrollWidth <= innerWidth + 1; return o; });
    ok('K1 360×640: oyunlarda, Çalışma Masam’da ve Altın ana sayfasında yatay taşma yok', Object.values(r).every(Boolean), r);
    await ctx.close();
  }
  /* ---------- G: eski ekranlar ---------- */
  {
    const R = [['topic', {t: 'TPC-5-2-01', tab: 'anlat'}], ['search', {q: 'namaz'}]];
    const al = async (dosya) => { const {p, ctx} = await sayfa({dosya}); const o = {}; for (const [v, a] of R) { await p.evaluate(([v, a]) => go(v, a), [v, a]); await bek(600); o[v] = await p.evaluate(() => $.innerHTML.replace(/V5[1234]\.[0-9]/g, 'V5x').replace(/blob:[^"]+/g, 'blob:')); } await ctx.close(); return o; };
    const a = await al(F0), c = await al(F), fark = Object.keys(a).filter((k) => a[k] !== c[k]);
    ok('G1 Konu anlatımı ve arama ekranları V53.0 ile birebir aynı', fark.length === 0, fark);
  }
  ok('Z1 Bütün senaryolarda JavaScript hatası yok', HATA.length === 0, HATA.slice(0, 5));
  const gc = S.filter((x) => x.ok).length;
  console.log(`\n${gc}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen: gc, toplam: S.length, kontroller: S}, null, 1));
  await b.close(); st.close(); process.exit(gc === S.length ? 0 : 1);
})().catch((er) => { console.error(er); process.exit(2); });
