// V45.0 testleri. Çalıştırma (depo kökünden): node tests/v45/test_v450.js
// Yerel http sunucusu + başsız Chromium. Hafif mod (dk-lite) her testte açıkça ayarlanır. Ekran görüntüleri: docs/V45.0_ekran/
// Not: tarayıcı otomasyonu gerçek telefon/tablet testi değildir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const F45 = 'surumler/din-kulturu-platformu-v45.0.html', F44 = 'surumler/din-kulturu-platformu-v44.0.html';
const SH = path.join(ROOT, 'docs', 'V45.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [];
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 400) : '')); };

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = () => 'http://127.0.0.1:' + srv.address().port + '/' + F45;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, kt: 'light', pt: 'gece', lite: '0', mod: 'premium', ed: false}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: o.w < 1000, hasTouch: true, colorScheme: 'dark'});
    await ctx.addInitScript(([o]) => { if (sessionStorage.getItem('__i')) return; sessionStorage.setItem('__i', '1'); if (o.ed) sessionStorage.setItem('dk-editor-oturum38', '1');
      if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-theme', o.kt); localStorage.setItem('dk-lite', o.lite); localStorage.setItem('dk-ptema43', o.pt); if (o.mod) localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL()); await p.waitForTimeout(1400); return {p, ctx};
  };
  const tasma = (p) => p.evaluate(() => { const w = document.documentElement.clientWidth; return {sw: document.documentElement.scrollWidth, w, tas: [...document.querySelectorAll('#app *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > w + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.v-chips,.h30-hs,.p39-tabs,[style*="overflow"]'); }).slice(0, 4).map((e) => e.className || e.tagName)}; });

  /* A. Derleme ve veri güvenliği */
  const h45 = fs.readFileSync(path.join(ROOT, F45), 'utf8'), h44 = fs.readFileSync(path.join(ROOT, F44), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  ok('A1 sürüm V45.0 (V31.VER ve app-version), index.html aynı dosya', /V31\.VER="V45\.0"/.test(h45) && /<meta name="app-version" content="V45\.0">/.test(h45) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === h45);
  ok('A2 müfredat/ilişki/sure-dua/yıllık plan ve müzik blokları V44.0 ile bayt bayt aynı (hiçbir kaydın durumu topluca değiştirilmedi)', JSON.stringify(seeds(h45)) === JSON.stringify(seeds(h44)), Object.keys(seeds(h45)).length + ' blok');
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v45.0'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı (V44.0 yedek olarak duruyor)', deg.length === 0 && fs.existsSync(path.join(ROOT, F44)), deg.join(';') || 'yalnız v45.0');

  /* B. Kaynak doğrulama sınıflandırması */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    const r = await p.evaluate(() => { const s = V45.KD.sayim(); return {s, yay: Store.all('topics').filter((t) => t.status === 'published').length, st: [...new Set(Store.all('questions').map((q) => q.status))]}; });
    const t = r.s.topics.bloklar, q = r.s.questions;
    ok('B1 sınıflandırma sayıları: konu bölümleri A/B/C ve sorular (kaynakla doğrulanan / türetilen / editör gereken)', t.A === 816 && t.B === 1860 && t.C === 699 && q.C === 130 && q.B === 593 && r.s.flashcards.C === 109 && r.s.games.C === 5, {t, q: [q.B, q.C], fc: r.s.flashcards.C, g: r.s.games.C});
    ok('B2 kayıtların status alanı değişmedi (yayın durumu topluca “published” yapılmadı)', r.yay === 0 && r.st.every((x) => x !== 'published'), r);
    const v = await p.evaluate(() => { S.prev = false; const T = Store.all('topics'), A = T.filter((x) => x.sections && V45.KD.konu(x).kat !== 'C'); const Qc = Store.all('questions').filter((x) => V45.KD.editorGerekli('questions', x)), Qb = Store.all('questions').filter((x) => !V45.KD.editorGerekli('questions', x));
      const r = {konuGor: A.filter(vis).length, konuTop: A.length, qcGor: Qc.filter(vis).length, qbGor: Qb.filter(vis).length, qb: Qb.length}; S.prev = true; return r; });
    ok('B3 önizleme kapalıyken (yayın kipi) kaynakla doğrulanan/türetilen içerik görünür, editör kontrolü gereken soru görünmez', v.qcGor === 0 && v.qbGor === v.qb && v.qb > 500, v);
    const e = await p.evaluate(() => { const C = ['topics', 'questions', 'flashcards', 'games']; const o = {}; C.forEach((c) => { const L = Store.all(c); o[c] = {bek: L.filter((x) => ['bekleyen', 'kaynak'].includes(V38.ED.cat(c, x))).length, gerek: L.filter((x) => V45.KD.editorGerekli(c, x)).length}; }); return o; });
    ok('B4 editör kuyruğu yalnız gerçekten kontrol gerektiren (C) kayıtları içerir', Object.values(e).every((x) => x.bek <= x.gerek) && e.questions.bek > 0 && e.questions.bek <= 130, e);
    await p.evaluate(() => go('topic', {t: 'TPC-5-1-01', tab: 'anlat'})); await p.waitForTimeout(500);
    const k = await p.evaluate(() => { const t = Store.get('topics', 'TPC-5-1-01'), n = t.sections.anlatim.filter((x, i) => V45.KD.blok(t, 'anlatim', i).kat === 'C').length; return {dvb: document.querySelectorAll('#app .dvb').length, n, kd: [...document.querySelectorAll('#app .kd45')].map((x) => x.textContent), bek: /editör onayı bekliyor/i.test(document.getElementById('app').textContent)}; });
    ok('B5 konu sayfası: editör notu yalnız C paragraflarda; başlıkta kaynak etiketi; “editör onayı bekliyor” yazısı yok', k.dvb === k.n && k.kd.length > 0 && !k.bek, k);
    await p.screenshot({path: path.join(SH, 'konu-kaynak.png')});
    await p.evaluate(() => go('topic', {t: 'TPC-5-1-01', tab: 'oyun'})); await p.waitForTimeout(400);
    const g = await p.evaluate(() => ({bek: /editör onayı bekliyor/i.test(document.getElementById('app').textContent), tur: /Kaynaktan türetildi|kaynaktan türetildi/.test(document.getElementById('app').textContent)}));
    ok('B6 oyun kartları: “editör onayı bekliyor” yerine gerçek durum (kaynaktan türetildi / editör kontrolü gerekli)', !g.bek && g.tur, g);
    await ctx.close();
  }

  /* C. Sınıf dünyaları */
  {
    const {p, ctx} = await sayfa();
    const d = await p.evaluate(() => { const D = V45.Dunya.D, gr = Object.keys(D).map(Number); return {gr, ad: new Set(gr.map((g) => D[g].ad)).size, sahne: new Set(gr.map((g) => D[g].sahne)).size, tip: new Set(gr.map((g) => D[g].tip.join() + D[g].mod + !!D[g].kanit)).size, kisi: gr.flatMap((g) => [D[g].kahraman, D[g].rehber]),
      hazir: gr.map((g) => { const U = V45.Dunya.uniteler(g); return U.filter((u) => V45.Dunya.noktalar(g, u.id).length >= 3 && V45.Dunya.kapiSorulari(g, u.id).length >= 3).length + '/' + U.length; }) }; });
    ok('C1 dokuz sınıfa (4–12) ayrı dünya: farklı ad, sahne ve görev karışımı', d.gr.join() === '4,5,6,7,8,9,10,11,12' && d.ad === 9 && d.sahne === 9 && d.tip >= 8, d);
    const yasak = /muhammed|ibrahim|musa|isa\b|nuh|yusuf peygamber|ebu bekir|ömer|osman|ali\b|hatice|aişe|ayşe annemiz|hz\./i;
    ok('C2 karakterler kurgusal: peygamber, sahabe ya da dinî şahsiyet karakterleştirilmemiş', d.kisi.every((k) => !yasak.test(k) || /Konsey sözcüsü Yusuf/.test(k)), d.kisi);
    ok('C3 her sınıfta bütün ünitelerde en az 3 keşif noktası ve en az 3 soruluk bölge kapısı var', d.hazir.every((x) => { const [a, b] = x.split('/'); return a === b && +b > 0; }), d.hazir);
    const kaynak = await p.evaluate(() => { let kotu = 0, top = 0; Object.keys(V45.Dunya.D).forEach((g) => V45.Dunya.uniteler(+g).forEach((u) => { V45.Dunya.noktalar(+g, u.id).forEach((x) => { top++; if (x.tur === 'not') { const [tid, i] = x.veri.id.split('#'); if (V45.KD.blok(Store.get('topics', tid), 'anlatim', +i).kat !== 'A') kotu++; } if (x.tur === 'karakter' && V45.KD.editorGerekli('questions', x.veri)) kotu++; if (x.tur === 'bulmaca' && V45.KD.editorGerekli('games', x.veri)) kotu++; if (x.tur === 'kanit' && x.veri.some((c) => V45.KD.editorGerekli('flashcards', c))) kotu++; }); V45.Dunya.kapiSorulari(+g, u.id).forEach((q) => { top++; if (V45.KD.editorGerekli('questions', q)) kotu++; }); })); return {kotu, top}; });
    ok('C4 bütün oyun içeriği kaynak kayıtlarından: notlar kitapla doğrulanmış (A) paragraf, sorular/etkinlikler editör kontrolü gerektirmeyen (A/B) kayıt', kaynak.kotu === 0 && kaynak.top > 300, kaynak);
    await p.evaluate(() => go('poyun')); await p.waitForTimeout(500);
    ok('C5 oyun merkezinde “Sınıf Dünyaları” kartı hibrit görevlerde', await p.evaluate(() => { const c = document.querySelector('.d45-hub'); return !!c && c.dataset.kat === 'hibrit'; }));
    await p.evaluate(() => go('poyna', {oyn: 'dunya45', obol: 'g6', odevam: 0})); await p.waitForTimeout(500);
    await p.screenshot({path: path.join(SH, 'dunya6-harita.png')});
    const u0 = await p.evaluate(() => V45.Dunya.uniteler(6).map((u) => u.id));
    const ac = await p.evaluate(() => [...document.querySelectorAll('.d45-bolge')].map((b) => !b.disabled));
    ok('C6 harita: ilk bölge açık, diğerleri kilitli (önceki bölge tamamlanınca açılır)', ac[0] && ac.slice(1).every((x) => !x), ac);
    await p.click('.d45-bolge:not([disabled])'); await p.waitForTimeout(400);
    const N = await p.evaluate(() => document.querySelectorAll('.d45-nb:not(.kapi)').length);
    for (let i = 0; i < N; i++) {
      await p.locator('.d45-nb:not(.kapi)').nth(i).click(); await p.waitForTimeout(250);
      for (let k = 0; k < 30; k++) {
        if (await p.$('#d45p > .g44-ara .p, #d45p .d45-not .g44-ara .p')) break;
        const cev = await p.evaluate(() => { const t = document.querySelector('#d45p .g44-tal'); const Q = t && Store.all('questions').find((x) => x.text === t.textContent); return Q ? Q.answer : null; });
        if (cev !== null && await p.$('#d45p [data-i]')) { await p.click(`#d45p [data-i="${cev}"]`); await p.waitForTimeout(150); continue; }
        await p.click('#d45p [data-ip]'); await p.waitForTimeout(200);
        const kont = await p.$('#d45p [data-k=kontrol]:not([disabled])'); if (kont) { await kont.click(); await p.waitForTimeout(800); }
      }
      await p.waitForTimeout(700);
      if (i === 2) await p.screenshot({path: path.join(SH, 'dunya6-nokta.png'), fullPage: true});
      const dv = await p.$('#d45p .g44-ara .p'); if (dv) { await dv.click(); await p.waitForTimeout(250); }
    }
    const tm = await p.evaluate(() => [...document.querySelectorAll('.d45-nb:not(.kapi)')].every((b) => b.classList.contains('tamam')) && !document.querySelector('.d45-nb.kapi').disabled);
    ok('C7 bölgedeki bütün noktalar (not, diyalog, bulmaca) çözülebilir; hepsi bitince bölge kapısı açılır', tm, N + ' nokta');
    // kapıyı önce hepsi yanlış: geçemez, yanlışlar tekrar listesine
    const w0 = await p.evaluate(() => Object.keys(MT.W()).length);
    await p.click('.d45-nb.kapi'); await p.waitForTimeout(300);
    for (let i = 0; i < 10; i++) { const cev = await p.evaluate(() => { const t = document.querySelector('#d45p .g44-tal'); const Q = t && Store.all('questions').find((x) => x.text === t.textContent); return Q ? Q.answer : null; }); if (cev === null) break; await p.locator(`#d45p [data-i]:not([data-i="${cev}"])`).first().click(); await p.waitForTimeout(120); const n = await p.$('#d45n'); if (n) { await n.click(); await p.waitForTimeout(150); } }
    const y = await p.evaluate((u) => ({son: (document.querySelector('.d45-son') || {}).textContent || '', bitti: !!(V45.Dunya.kayit(6).bolge[u] || {}).bitti, w: Object.keys(MT.W()).length}), u0[0]);
    ok('C8 bölge kapısı %70 altında açılmaz; yanlış sorular tekrar listesine (Yanlışlarım) eklenir', /henüz açılmadı/.test(y.son) && !y.bitti && y.w > w0, {y, w0});
    await p.click('#d45p .g44-ara .p'); await p.waitForTimeout(300);
    for (let i = 0; i < 10; i++) { const cev = await p.evaluate(() => { const t = document.querySelector('#d45p .g44-tal'); const Q = t && Store.all('questions').find((x) => x.text === t.textContent); return Q ? Q.answer : null; }); if (cev === null) break; await p.click(`#d45p [data-i="${cev}"]`); await p.waitForTimeout(120); const n = await p.$('#d45n'); if (n) { await n.click(); await p.waitForTimeout(150); } }
    await p.waitForTimeout(600); await p.screenshot({path: path.join(SH, 'dunya6-kapi-sonuc.png')});
    const k = await p.evaluate((u) => ({son: (document.querySelector('.d45-son') || {}).textContent || '', kayit: V45.Dunya.kayit(6).bolge[u], ham: JSON.parse(localStorage.getItem('dk-oyun41')).oyunlar.dunya45.g6}), u0[0]);
    ok('C9 kapı geçilince ödül ve yıldız; kayıt dk-oyun41.oyunlar.dunya45.g6 (v:1, bölge, günce)', /açıldı/.test(k.son) && k.kayit.bitti && k.kayit.kapi.yildiz >= 1 && k.ham.v === 1 && k.ham.gunce.length >= 1, k.kayit);
    await p.reload(); await p.waitForTimeout(1500);
    await p.evaluate(() => go('poyna', {oyn: 'dunya45', obol: 'g6', odevam: 0})); await p.waitForTimeout(500);
    const ac2 = await p.evaluate(() => [...document.querySelectorAll('.d45-bolge')].map((b) => !b.disabled));
    ok('C10 sayfa yeniden açılınca ilerleme korunur, ikinci bölge açılır', ac2[0] && ac2[1] && !ac2[2], ac2);
    await p.evaluate(() => V45.Dunya.gunce()); await p.waitForTimeout(300);
    ok('C11 Günce: bulunan notlar kaynak bilgisiyle listelenir', await p.evaluate(() => document.querySelectorAll('.d45-not').length >= 1 && /Kaynak:/.test(document.querySelector('.d45-not').textContent)));
    // 8. sınıf süreli kapı ve duraklatma
    await p.evaluate(() => { const g = 8, u = V45.Dunya.uniteler(8)[0].id, k = V45.Dunya.kayit(8), B = V45.Dunya.bolgeDurum(8, u, k); V45.Dunya.noktalar(8, u).forEach((x) => B.n[x.id] = 1); V45.Dunya.yaz(8, k); go('poyna', {oyn: 'dunya45', obol: 'g8', odevam: 0}); });
    await p.waitForTimeout(500); await p.evaluate(() => V45.Dunya.bolge(V45.Dunya.uniteler(8)[0].id)); await p.waitForTimeout(200);
    await p.evaluate(() => V45.Dunya.kapi()); await p.waitForTimeout(2200);
    const s1 = await p.evaluate(() => +document.getElementById('d45s').textContent.match(/\d+/)[0]);
    await p.evaluate(() => V41.duraklat('kullanici')); await p.waitForTimeout(2200);
    const s2 = await p.evaluate(() => +document.getElementById('d45s').textContent.match(/\d+/)[0]);
    await p.evaluate(() => V41.surdur()); await p.waitForTimeout(1300);
    const s3 = await p.evaluate(() => +document.getElementById('d45s').textContent.match(/\d+/)[0]);
    ok('C12 8. sınıf LGS Kulesi: kat sınavı süreli; Menü ile duraklatınca süre durur, devam edince işler', s1 < 320 && s1 === s2 && s3 < s2, {s1, s2, s3});
    await p.evaluate(() => go('psinif', {pg: 9})); await p.waitForTimeout(500);
    ok('C13 sınıf merkezinde o sınıfın dünyasına giriş (9. sınıf: Akademi Arşivi)', await p.evaluate(() => /Akademi Arşivi/.test((document.querySelector('.d45-banner') || {}).textContent || '')));
    await ctx.close();
  }

  /* D. Çalışma Merkezim */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    ok('D1 Klasik ana sayfada “Çalışma Merkezim” girişi', await p.evaluate(() => !!document.querySelector('.h30-short .c45-gir')));
    const r = await p.evaluate(() => { const q = Store.all('questions').filter((x) => vis(x) && x.topicId === 'TPC-5-1-01' && typeof x.answer === 'number'); q.slice(0, 3).forEach((x) => MT.rec(x, (x.answer + 1) % x.options.length)); Store.save(); go('calis45'); const o = JSON.parse(localStorage.getItem('dk-calis45')); return {gun: Object.values(o.gun)[0], oc: q[0].outcomeIds}; });
    await p.waitForTimeout(500);
    const c = await p.evaluate((oc) => ({zayif: [...document.querySelectorAll('.c45-kz .mc')].map((x) => x.textContent), oneri: [...document.querySelectorAll('.c45-oe b')].map((x) => x.textContent), harita: document.querySelectorAll('.c45-k.zayif').length, kod: oc.map((o) => (Store.get('outcomes', o) || {}).code)}), r.oc);
    ok('D2 günlük hedef sayacı her cevabı sayar (dk-calis45)', r.gun === 3, r);
    ok('D3 yanlış cevaplanan kazanım “Zayıf kazanımlar”da, konusu “Sana önerilenler”de, konu başarı haritasında zayıf', c.zayif.some((x) => c.kod.includes(x)) && c.oneri.includes('Evrendeki Düzeni Fark Etmek') && c.harita >= 1, c);
    await p.screenshot({path: path.join(SH, 'calis-klasik.png'), fullPage: true});
    const t = await tasma(p); ok('D4 Çalışma Merkezim 390 px’te yatay taşma yok', t.sw <= t.w && !t.tas.length, t);
    await p.evaluate(() => { const q = Store.all('questions').filter((x) => vis(x) && x.topicId === 'TPC-5-1-01' && typeof x.answer === 'number'); q.slice(0, 3).forEach((x) => MT.rec(x, x.answer)); Store.save(); draw(); });
    ok('D5 doğru çözülen soru tekrar listesinden çıkar (yanlışlar 0)', await p.evaluate(() => Object.keys(MT.W()).length === 0));
    await ctx.close();
    const P2 = await sayfa();
    await P2.p.evaluate(() => go('pilerleme')); await P2.p.waitForTimeout(400);
    ok('D6 Premium İlerlemem ekranında Çalışma Merkezim girişi', await P2.p.evaluate(() => !!document.querySelector('.c45-pgir')));
    await P2.p.click('.c45-pgir'); await P2.p.waitForTimeout(500);
    await P2.p.screenshot({path: path.join(SH, 'calis-premium.png')});
    ok('D7 Premium oturumda Çalışma Merkezim açılır (Premium kabuğunda)', await P2.p.evaluate(() => view === 'calis45' && document.body.hasAttribute('data-prem39')));
    await P2.ctx.close();
  }

  /* E. Mobil / tablet / yatay: yeni ekranlarda taşma ve dokunma alanları */
  {
    const EK = [['dunya-secim', "go('poyna',{oyn:'dunya45',obol:'',odevam:0})"], ['dunya-harita', "go('poyna',{oyn:'dunya45',obol:'g12',odevam:0})"], ['dunya-bolge', "go('poyna',{oyn:'dunya45',obol:'g10',odevam:0});setTimeout(()=>V45.Dunya.bolge(V45.Dunya.uniteler(10)[0].id),300)"], ['calis', "go('calis45')"]];
    const R = [];
    for (const [w, h, ad] of [[360, 740, 'tel360'], [800, 1280, 'tablet'], [780, 360, 'yatay']]) {
      const {p, ctx} = await sayfa({w, h});
      for (const [e, js] of EK) { await p.evaluate(js); await p.waitForTimeout(700); const t = await tasma(p); const kucuk = await p.evaluate(() => [...document.querySelectorAll('.d45-nk,.d45-nb,.d45-bolge,.d45-gk,.c45-k,.c45-oe button,.g44-ib')].filter((x) => { const r = x.getBoundingClientRect(); return r.width && (r.width < 44 || r.height < 44); }).length); R.push({ad, e, sw: t.sw, w: t.w, tas: t.tas, kucuk}); if (ad !== 'tablet' && e === 'dunya-bolge') await p.screenshot({path: path.join(SH, `${e}-${ad}.png`)}); }
      await ctx.close();
    }
    const kotu = R.filter((x) => x.sw > x.w || x.tas.length || x.kucuk);
    ok('E1 yeni ekranlar 360 px telefon, 800×1280 tablet, 780×360 yatay: taşma yok, dokunma alanları ≥ 44 px', !kotu.length, kotu.length ? kotu : R.length + ' ölçüm');
  }

  /* F. Hata */
  ok('F1 sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  const g = S.filter((x) => x.ok).length;
  console.log(`\nToplam: ${g}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), md5: crypto.createHash('md5').update(h45).digest('hex'), sonuc: S, hata: HATA}, null, 1));
  await b.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
