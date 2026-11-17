// V43.0 testleri. Çalıştırma (depo kökünden): node tests/v43/test_v430.js
// Yerel http sunucusu + başsız Chromium. ÖNEMLİ: “hafif mod” (dk-lite) her testte açıkça ayarlanır; V42 testleri yalnızca hafif modda
// (≤4 çekirdekli test makinesinde kendiliğinden açılır) çalıştığı için telefondaki cam yüzey hatasını göremedi.
// Ekran görüntüleri: docs/V43.0_ekran/   Sonuç: tests/v43/son_sonuc.json
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const F43 = 'surumler/din-kulturu-platformu-v43.0.html', F42 = 'surumler/din-kulturu-platformu-v42.0.html';
const SH = path.join(ROOT, 'docs', 'V43.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
const S = []; const HATA = [];
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 400) : '')); };
const lum = (c) => { const v = c.match(/[\d.]+/g).slice(0, 3).map((x) => { x = +x / 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
const oran = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = (f) => 'http://127.0.0.1:' + srv.address().port + '/' + (f || F43);
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, kt: 'light', pt: null, lite: '0', mod: 'premium', cs: 'dark', f: F43}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: o.w < 700, hasTouch: true, colorScheme: o.cs});
    await ctx.addInitScript(([o]) => {
      if (!localStorage.getItem('__ilk')) { localStorage.setItem('__ilk', '1'); localStorage.setItem('dk-theme', o.kt); localStorage.setItem('dk-lite', o.lite); if (o.pt) localStorage.setItem('dk-ptema43', o.pt); else localStorage.removeItem('dk-ptema43'); if (o.mod) localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); }
      // ilk boyama kaydı: data-pt43 <body>'den önce mi kuruldu?
      window.__ilkBoya = null;
      const mo = new MutationObserver(() => { const de = document.documentElement; if (de && document.body && window.__ilkBoya === null) { window.__ilkBoya = {pt: de.dataset.pt43 || '', th: de.dataset.theme || ''}; mo.disconnect(); } });
      mo.observe(document, {childList: true, subtree: true});
    }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message));
    await p.goto(URL(o.f)); await p.waitForTimeout(1400); return {p, ctx};
  };
  const durum = (p) => p.evaluate(() => ({pt: document.documentElement.dataset.pt43 || '', th: document.documentElement.dataset.theme, lite: document.documentElement.classList.contains('lite'), pref: localStorage.getItem('dk-ptema43'), kt: localStorage.getItem('dk-theme'), view}));

  /* ---------- A. Derleme ve veri ---------- */
  const h43 = fs.readFileSync(path.join(ROOT, F43), 'utf8'), h42 = fs.readFileSync(path.join(ROOT, F42), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  ok('A1 sürüm V43.0 (V31.VER ve <meta name="app-version">), index.html aynı dosya', /V31\.VER="V43\.0"/.test(h43) && /<meta name="app-version" content="V43\.0">/.test(h43) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === h43);
  ok('A2 müfredat/ilişki/sure-dua/yıllık plan ve 7 müzik bloğu V42.0 ile bayt bayt aynı', JSON.stringify(seeds(h43)) === JSON.stringify(seeds(h42)), Object.keys(seeds(h43)).length + ' blok');
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v43.0'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı', deg.length === 0, deg.join(';') || 'yalnız v43.0');

  /* ---------- B. Kök neden: telefondaki koşullar (hafif mod kapalı, Klasik açık tema, Premium Gece) ---------- */
  {
    const {p, ctx} = await sayfa({kt: 'light', lite: '0', pt: 'gece'});
    const R = [];
    for (const [ad, js] of [['profil', () => V40.profil()], ['ses', () => V37.sndOpen()], ['degistir', () => V42.degistir()], ['arama', () => V39.ara()]]) {
      await p.evaluate(js); await p.waitForTimeout(450);
      R.push(await p.evaluate((ad) => { const s = document.querySelector('.v-sheet'), h = s.querySelector('.v-sh h2'), cs = getComputedStyle(s); return {ad, lite: document.documentElement.classList.contains('lite'), bg: cs.backgroundColor, bf: cs.backdropFilter, baslik: getComputedStyle(h).color}; }, ad));
      await p.evaluate(() => UI.close()); await p.waitForTimeout(350);
    }
    const kotu = R.filter((r) => r.lite || /rgba\(.*, 0\.\d+\)$/.test(r.bg) || lum(r.bg) > .05 || oran(r.baslik, r.bg) < 7);
    ok('B1 Gece + Klasik açık + hafif mod kapalı: profil, ses, deneyim, arama panelleri opak koyu, başlık oranı ≥ 7 (V42’de 1.0–1.6 idi)', kotu.length === 0, R.map((r) => `${r.ad}:${r.bg}/${oran(r.baslik, r.bg).toFixed(1)}`).join(' '));
    const t = await p.evaluate(() => { const s = getComputedStyle(document.body); return {gl3: s.getPropertyValue('--gl3').trim(), sf: s.getPropertyValue('--surface').trim()}; });
    ok('B2 türetilmiş cam değişkeni (--gl3) Premium’da <body> düzeyinde, Premium yüzeyiyle hesaplanıyor', /var\(--surface\)/.test(t.gl3) || /#1E1710/i.test(t.gl3), t);
    await ctx.close();
  }

  /* ---------- C. Tema sistemi ---------- */
  {
    const {p, ctx} = await sayfa({kt: 'light', pt: null});
    const d0 = await durum(p);
    ok('C1 varsayılan Premium teması Gece; Klasik tercihi açık olsa da Premium’da data-theme=dark', d0.pt === 'gece' && d0.th === 'dark' && d0.kt === 'light', d0);
    const t = await p.evaluate(() => { const b = document.querySelector('.ust40 .t43'); const r = b.getBoundingClientRect(); return {w: r.width, h: r.height, l: b.getAttribute('aria-label')}; });
    ok('C2 koridorda güneş/ay düğmesi (≥44 px, erişilebilir ad)', t.w >= 44 && t.h >= 44 && /Gündüz moduna geç/.test(t.l), t);
    await p.click('.ust40 .t43'); await p.waitForTimeout(500);
    const d1 = await durum(p);
    ok('C3 düğmeyle Gündüz: data-pt43=gunduz, data-theme=light, tercih kalıcı; Klasik tercihi (dk-theme) değişmedi', d1.pt === 'gunduz' && d1.th === 'light' && d1.pref === 'gunduz' && d1.kt === 'light', d1);
    await p.screenshot({path: path.join(SH, 'koridor-gunduz-390.png')});
    await p.reload(); await p.waitForTimeout(1300);
    const ib = await p.evaluate(() => window.__ilkBoya);
    ok('C4 yeniden açılışta Gündüz, <body> çizilmeden önce uygulanıyor (beyaz/siyah parlama yok)', ib && ib.pt === 'gunduz' && ib.th === 'light', ib);
    await p.evaluate(() => V42.gec('normal')); await p.waitForTimeout(600);
    const d2 = await durum(p);
    ok('C5 Klasik’e geçince Premium teması bırakılır, Klasik kendi tercihini kullanır (light)', d2.pt === '' && d2.th === 'light' && d2.view === 'home', d2);
    await p.evaluate(() => localStorage.setItem('dk-theme', 'dark')); await p.evaluate(() => V42.gec('premium')); await p.waitForTimeout(800);
    const d3 = await durum(p);
    ok('C6 Klasik tercihi koyu iken Premium’a dönüş: Premium Gündüz korunur (tercihler bağımsız)', d3.pt === 'gunduz' && d3.th === 'light' && d3.kt === 'dark', d3);
    await p.evaluate(() => V40.profil()); await p.waitForTimeout(400);
    const seg = await p.evaluate(() => [...document.querySelectorAll('.t43-seg [role=radio]')].map((x) => x.textContent.trim() + ':' + x.getAttribute('aria-checked')));
    ok('C7 profil: Gündüz / Gece / Otomatik seçici', seg.length === 3 && seg[0] === 'Gündüz:true', seg);
    await p.screenshot({path: path.join(SH, 'profil-gunduz-390.png')});
    await p.click('.t43-seg [role=radio] >> nth=2'); await p.waitForTimeout(500);
    await p.emulateMedia({colorScheme: 'light'}); await p.waitForTimeout(300);
    const o1 = await durum(p);
    await p.emulateMedia({colorScheme: 'dark'}); await p.waitForTimeout(300);
    const o2 = await durum(p);
    ok('C8 Otomatik: cihaz teması açıkken Gündüz, koyuya dönünce anında Gece', o1.pref === 'oto' && o1.pt === 'gunduz' && o2.pt === 'gece', {o1: o1.pt, o2: o2.pt});
    await ctx.close();
  }
  for (const w of [360, 390, 420]) { // üst çubuk çakışma / taşma
    const {p, ctx} = await sayfa({w, kt: 'light', pt: 'gece'});
    const r = [];
    for (const v of ['pdunya', 'psinif', 'pders', 'games']) {
      await p.evaluate((v) => go(v, {pg: 5, pt: 'TPC-5-1-01', ptab: 'anlat'}), v); await p.waitForTimeout(v === 'pdunya' ? 1200 : 500);
      r.push(await p.evaluate((v) => { const B = [...document.querySelectorAll('.p39-top > *, .ust40 > *, .ust40 .yuz43 > *, #p39bar > *')].filter((e) => { const q = e.getBoundingClientRect(); return q.width > 0 && !e.classList.contains('p39-sp') && !e.classList.contains('sp40') && !e.classList.contains('yuz43'); }).map((e) => e.getBoundingClientRect());
        let cak = 0; for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) { const a = B[i], c = B[j]; if (a.left < c.right - 1 && a.right > c.left + 1 && a.top < c.bottom - 1 && a.bottom > c.top + 1) cak++; }
        const t = document.querySelector('.t43'); return {v, iw: innerWidth, cak, t43: !!t, kucuk: B.filter((q) => q.height < 40).length}; }, v));
    }
    const kotu = r.filter((x) => x.iw !== w || x.cak || !x.t43);
    ok(`C9 ${w} px: üst çubuklarda tema ve Klasik düğmeleri var, çakışma ve taşma yok`, kotu.length === 0, kotu.length ? kotu : 'tamam');
    if (w === 360) { await p.evaluate(() => go('psinif', {pg: 5})); await p.waitForTimeout(400); await p.screenshot({path: path.join(SH, 'sinif-gece-360.png')}); }
    await ctx.close();
  }

  /* ---------- D. Krem ders sayfası (bütün sekmeler; Gece ve Gündüz) ---------- */
  for (const pt of ['gece', 'gunduz']) {
    const {p, ctx} = await sayfa({kt: 'dark', pt});
    const tabs = await p.evaluate(() => V39.av(Store.get('topics', 'TPC-5-1-01')).map((x) => x[0]));
    const R = [];
    for (const tb of tabs) {
      await p.evaluate((tb) => go('pders', {pt: 'TPC-5-1-01', ptab: tb}), tb); await p.waitForTimeout(350);
      R.push(await p.evaluate((tb) => { const e = document.querySelector('.p39-pane'); const s = getComputedStyle(e); const h = [...e.querySelectorAll('p,li')].sort((a, b) => b.textContent.length - a.textContent.length)[0]; /* gövde yazısı: en uzun paragraf */ return {tb, kagit: e.classList.contains('p43-kagit'), bg: s.backgroundColor, ink: h ? getComputedStyle(h).color : s.color}; }, tb));
    }
    const kotu = R.filter((r) => !r.kagit || lum(r.bg) < .8 || oran(r.ink, r.bg) < 7);
    ok(`D ${pt}: ders ekranının bütün sekmeleri (${tabs.join(', ')}) krem kitap sayfasında, gövde yazısı koyu kahve (oran ≥ 7)`, kotu.length === 0, kotu.length ? kotu : R.map((r) => r.tb + ':' + oran(r.ink, r.bg).toFixed(1)).join(' '));
    await p.evaluate(() => go('pders', {pt: 'TPC-5-1-01', ptab: 'anlat'})); await p.waitForTimeout(400); await p.screenshot({path: path.join(SH, `ders-anlatim-${pt}.png`)});
    await p.evaluate(() => go('pders', {pt: 'TPC-5-1-01', ptab: 'ozet'})); await p.waitForTimeout(400); await p.screenshot({path: path.join(SH, `ders-ozet-${pt}.png`)});
    await ctx.close();
  }

  /* ---------- E. Oyun ve sınav kartları ---------- */
  for (const pt of ['gece', 'gunduz']) {
    const {p, ctx} = await sayfa({kt: 'light', pt});
    await p.evaluate(() => { G.gf = Object.assign({}, G.gf || {}, {g: 5, t: 'TPC-5-1-01'}); go('games'); }); await p.waitForTimeout(700);
    const k = await p.evaluate(() => { const L = [...document.querySelectorAll('.kart43')]; const e = L[0]; if (!e) return {n: 0}; e.scrollIntoView({block: 'center'}); const g = (s) => { const x = e.querySelector(s); return x ? x.textContent.trim() : ''; };
      const parca = ['.k43-ust', '.k43-bas', '.k43-konu', '.k43-ac', '.k43-say', '.k43-git'].map((s) => !!e.querySelector(s)); const bg = getComputedStyle(e).backgroundColor;
      return {n: L.length, ust: g('.k43-ust'), bas: g('.k43-bas'), konu: g('.k43-konu'), say: g('.k43-say'), durum: [...e.querySelectorAll('.d43')].map((x) => x.textContent.trim()), parca, bg, renk: ['.k43-bas', '.k43-konu', '.k43-ac', '.k43-say', '.k43-ust'].map((s) => getComputedStyle(e.querySelector(s)).color)}; });
    const oranlar = k.n ? k.renk.map((c) => +oran(c, k.bg).toFixed(2)) : [];
    ok(`E ${pt}: oyun kartı katmanları (sınıf·kapsam, başlık, konu, açıklama, öğe sayısı, kaynak durumu, giriş işareti) ayrı ve okunur (≥4.5)`, k.n > 0 && k.parca.every(Boolean) && oranlar.every((x) => x >= 4.5) && k.durum.length >= 1, Object.assign({}, k, {renk: undefined, oranlar}));
    await p.screenshot({path: path.join(SH, `oyun-kartlari-${pt}.png`)});
    await p.evaluate(() => go('dene')); await p.waitForTimeout(500);
    const d = await p.evaluate(() => [...document.querySelectorAll('.hb')].map((e) => { const bg = getComputedStyle(e).backgroundColor; return [e.querySelector('b'), e.querySelector('.d'), e.querySelector('.n')].filter(Boolean).map((x) => [getComputedStyle(x).color, getComputedStyle(x).backgroundColor === 'rgba(0, 0, 0, 0)' ? bg : getComputedStyle(x).backgroundColor]); }).flat());
    const dk = d.filter(([c, z]) => oran(c, z) < 4.5);
    ok(`E ${pt}: sınav (Kendini Dene) kartlarında başlık, açıklama ve sayı ≥ 4.5`, d.length >= 8 && dk.length === 0, dk.length ? dk : d.length + ' yazı');
    await p.screenshot({path: path.join(SH, `sinav-kartlari-${pt}.png`)});
    await ctx.close();
  }
  { const {p, ctx} = await sayfa({mod: 'normal', kt: 'light'}); await p.evaluate(() => { G.gf = Object.assign({}, G.gf || {}, {g: 5, t: 'TPC-5-1-01'}); go('games'); }); await p.waitForTimeout(600);
    const k = await p.evaluate(() => ({yeni: document.querySelectorAll('.kart43').length, eski: document.querySelectorAll('.gcd30,.gcd').length}));
    ok('E Klasik oyun kartları değişmedi (yeni kart düzeni yalnız Premium’da)', k.yeni === 0 && k.eski > 0, k); await ctx.close(); }

  /* ---------- F. Ses paneli ---------- */
  for (const pt of ['gece', 'gunduz']) {
    const {p, ctx} = await sayfa({kt: 'light', pt});
    await p.evaluate(() => V37.sndOpen()); await p.waitForTimeout(300); await p.evaluate(() => V42.muzikCal('esik')); await p.waitForTimeout(2200);
    const r = await p.evaluate(() => { const on = document.querySelector('.m42-m.on'), np = document.querySelector('.snd37-np b'), pp = document.querySelector('.snd37-c .pp'), o = getComputedStyle(on);
      const diger = document.querySelector('.m42-m:not(.on)'); return {ad: np.textContent, onKenar: o.borderTopWidth + ' ' + o.borderTopColor, digerKenar: getComputedStyle(diger).borderTopWidth, rozet: (on.querySelector('.snd37-now') || {}).textContent, ppBg: getComputedStyle(pp).backgroundImage.slice(0, 30), ppRenk: getComputedStyle(pp).color, t: ATM.rt.nodes.m42_esik && ATM.rt.nodes.m42_esik.el.currentTime}; });
    ok(`F ${pt}: çalan parça adı belirgin, aktif satır altın 2 px kenar + “Çalıyor” rozeti, oynat/duraklat altın ve koyu simgeli, müzik çalıyor`, r.ad === 'Kutsal Eşikte' && /^2px/.test(r.onKenar) && r.digerKenar === '1px' && r.rozet === 'Çalıyor' && /gradient/.test(r.ppBg) && lum(r.ppRenk) < .05 && r.t > .5, r);
    await p.screenshot({path: path.join(SH, `ses-${pt}.png`)});
    await ctx.close();
  }

  /* ---------- G. Arama ve klavye ---------- */
  for (const pt of ['gece', 'gunduz']) for (const w of [360, 412]) {
    const {p, ctx} = await sayfa({w, h: 800, kt: 'light', pt});
    await p.evaluate(() => { go('psinif', {pg: 5}); setTimeout(() => V39.ara(), 200); }); await p.waitForTimeout(700);
    await p.focus('#p39q'); await p.keyboard.type('de', {delay: 20});
    await p.setViewportSize({width: w, height: 430}); await p.waitForTimeout(600);
    await p.evaluate(() => { const b = document.querySelector('.v-sb'); b.scrollTop = b.scrollHeight; }); await p.waitForTimeout(300);
    const r = await p.evaluate(() => { const i = document.getElementById('p39q'), R = i.getBoundingClientRect(), h = document.querySelector('.v-sh h2').getBoundingClientRect(), x = document.querySelector('.v-sh [data-x]').getBoundingClientRect(), b = document.querySelector('.v-sb');
      return {deger: i.value, odak: document.activeElement === i, girdi: R.top >= 0 && R.bottom <= innerHeight, baslik: h.top >= 0 && h.bottom <= innerHeight, kapat: x.top >= 0 && x.bottom <= innerHeight && x.height >= 44, kaydi: b.scrollTop > 0, sonuc: document.querySelectorAll('.p39-ri').length, renk: getComputedStyle(i).color, bg: getComputedStyle(i).backgroundColor}; });
    ok(`G ${pt} ${w} px klavye benzetimi: başlık + kapat + giriş alanı görünür (sonuçlar kaydırılırken giriş sabit), yazılan okunur, uzun liste kayar`, r.deger === 'de' && r.odak && r.girdi && r.baslik && r.kapat && r.kaydi && r.sonuc > 5 && oran(r.renk, r.bg) >= 7, Object.assign(r, {oran: oran(r.renk, r.bg).toFixed(1)}));
    if (w === 360) await p.screenshot({path: path.join(SH, `arama-klavye-${pt}-360.png`)});
    await ctx.close();
  }

  /* ---------- H. Geçiş, geri tuşu, dokunma alanları ---------- */
  {
    const {p, ctx} = await sayfa({kt: 'light', pt: 'gunduz'});
    await p.evaluate(() => go('psinif', {pg: 5})); await p.waitForTimeout(400);
    await p.evaluate(() => go('pders', {pt: 'TPC-5-1-01', ptab: 'anlat'})); await p.waitForTimeout(400);
    await p.evaluate(() => V42.gec('normal')); await p.waitForTimeout(600);
    const a = await durum(p);
    await p.goBack(); await p.waitForTimeout(600); const g1 = await durum(p);
    await p.goBack(); await p.waitForTimeout(600); const g2 = await durum(p);
    ok('H1 Premium ders → Klasik (konu, Klasik teması) → geri: Premium ders Gündüz’de → geri: sınıf merkezi', a.view === 'topic' && a.pt === '' && g1.view === 'pders' && g1.pt === 'gunduz' && g1.th === 'light' && g2.view === 'psinif', {a: a.view + '/' + a.th, g1: g1.view + '/' + g1.pt, g2: g2.view});
    await p.evaluate(() => V40 && V39.secim(true)); await p.waitForTimeout(300); await p.goBack(); await p.waitForTimeout(500);
    ok('H2 seçim ekranı açıkken geri: yalnız seçim ekranı kapanır', await p.evaluate(() => !document.getElementById('uye39') && view === 'psinif'));
    const t = await p.evaluate(() => { const L = [...document.querySelectorAll('.t43, .dg42, .p39-ib, .t43-seg button, .kart43, .snd37-m')].filter((e) => e.getBoundingClientRect().width > 0); return L.filter((e) => { const r = e.getBoundingClientRect(); return r.height < 44 || r.width < 40; }).map((e) => e.className + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)); });
    ok('H3 yeni ve güncellenen düğmelerin dokunma alanı ≥ 44 px (yükseklik)', t.length === 0, t);
    await ctx.close();
  }

  /* ---------- I. WCAG AA denetimi (tools/v43/denetim.js; bu derlemenin çıktısı) ---------- */
  {
    const f = path.join(ROOT, 'tools', 'v43', 'denetim_sonuc.json');
    let d = null; try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) {}
    const md5 = crypto.createHash('md5').update(fs.readFileSync(path.join(ROOT, F43))).digest('hex');
    ok('I denetim v2 (tam kaydırma; hafif mod açık/kapalı; Klasik açık/koyu; Premium Gündüz/Gece) bu derleme için: AA altı 0', d && d.md5 === md5 && d.aaAlti === 0, d ? {md5Eslesir: d.md5 === md5, baglam: d.baglam, yazi: d.yazi, aaAlti: d.aaAlti} : 'denetim çıktısı yok: node tools/v43/denetim.js ' + F43 + ' tools/v43/denetim_sonuc.json');
  }
  ok('J sayfa hatası (JS) yok', HATA.length === 0, HATA.slice(0, 5));

  const g = S.filter((x) => x.ok).length;
  console.log(`\n${g} / ${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen: g, toplam: S.length, kontroller: S}, null, 1));
  await b.close(); srv.close(); process.exit(g === S.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
