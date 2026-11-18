// V47.0 testleri (depo kökünden): node tests/v47/test_v470.js
// Yerel http sunucusu + başsız Chromium (SwiftShader WebGL). Hafif mod (dk-lite) açıkça ayarlanır. Ekran görüntüleri: docs/V47.0_ekran/
// Kaydırma gerçek dokunma olaylarıyla (CDP Input.dispatchTouchEvent). Tarayıcı otomasyonu gerçek cihaz testi değildir.
const {chromium, devices} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const F47 = 'surumler/din-kulturu-platformu-v47.0.html', F46 = 'surumler/din-kulturu-platformu-v46.0.html';
const SH = path.join(ROOT, 'docs', 'V47.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [];
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = () => 'http://127.0.0.1:' + srv.address().port + '/' + F47;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, lite: '0', mod: 'premium', tema: 'light', cihaz: null, sec: false, atm: null}, o || {});
    const ctx = await b.newContext(o.cihaz ? Object.assign({}, devices[o.cihaz]) : {viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', o.lite); localStorage.setItem('dk-theme', o.tema); localStorage.setItem('dk-ptema43', 'gece'); if (!o.sec) localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); if (o.atm) localStorage.setItem('dk-atm', JSON.stringify(o.atm)); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL()); await p.waitForTimeout(1500);
    return {p, ctx, cdp: await ctx.newCDPSession(p)};
  };
  const surukle = async (cdp, x0, y0, x1, y1) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0}]}); for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: Math.round(x0 + (x1 - x0) * i / 10), y: Math.round(y0 + (y1 - y0) * i / 10)}]}); await bek(16); } await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await bek(150); };
  // görünen metin + erişilebilirlik adları (içerik bölmeleri hariç: ders metni kaynak verisidir)
  const metin = (p) => p.evaluate(() => { const kok = [document.getElementById('app'), document.getElementById('uye39'), ...document.querySelectorAll('.v-ov, [role=dialog], header.top, nav.bnav')].filter(Boolean); const parca = []; kok.forEach((k) => { const w = document.createTreeWalker(k, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const e = n.parentElement; if (!e || e.closest('.pane, .p39-pane, .tq-ex, .card .note') || getComputedStyle(e).display === 'none') continue; parca.push(n.textContent); } k.querySelectorAll('[aria-label],[title]').forEach((e) => parca.push(e.getAttribute('aria-label') || '', e.getAttribute('title') || '')); }); return parca.join(' '); });

  /* A. Derleme ve veri güvenliği */
  const h47 = fs.readFileSync(path.join(ROOT, F47), 'utf8'), h46 = fs.readFileSync(path.join(ROOT, F46), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  ok('A1 sürüm V47.0, index.html aynı dosya; V46.0 yedek dosyası duruyor', /V31\.VER="V47\.0"/.test(h47) && /content="V47\.0"/.test(h47) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === h47 && fs.existsSync(path.join(ROOT, F46)));
  ok('A2 içerik kayıtları ve müzik blokları V46.0 ile bayt bayt aynı', JSON.stringify(seeds(h47)) === JSON.stringify(seeds(h46)), Object.keys(seeds(h47)).length + ' blok');
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v47.0'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı', deg.length === 0, deg.join(';') || 'yalnız v47.0');

  /* B. Adlar: Elmas / Altın Öğrenme Alanı */
  {
    const yasak = /Klasik|Premium|Öğrenme Dünyası|Üyelik|ödeme/;
    const bul = [];
    const tara = async (p, ad) => { const t = await metin(p); const m = t.match(new RegExp('.{0,30}(' + yasak.source + ').{0,30}')); if (m) bul.push(ad + ': ' + m[0]); return t; };
    const E = await sayfa({mod: 'normal'});
    for (const [ad, js] of [['ana', "go('home')"], ['siniflar', "go('classes')"], ['sinif', "go('grade',{g:5})"], ['oyunlar', "go('games')"], ['calis', "go('calis45')"], ['profil', "go('profil46')"], ['ayar-alan', "go('ayar47',{at:'alan'})"], ['ayar-tema', "go('ayar47',{at:'tema'})"], ['ayar-hareket', "go('ayar47',{at:'hareket'})"], ['ayar-ses', "go('ayar47',{at:'ses'})"], ['ayar-atm', "go('ayar47',{at:'atmosfer'})"], ['degistir', "go('home');setTimeout(()=>V42.degistir(),200)"], ['giris', "go('profil46');setTimeout(()=>V44.giris(),200)"]]) { await E.p.evaluate(js); await E.p.waitForTimeout(600); await tara(E.p, 'Elmas ' + ad); await E.p.evaluate(() => { try { UI.close(); } catch (e) {} }); await E.p.waitForTimeout(250); }
    await E.p.evaluate(() => V39.secim(true)); await E.p.waitForTimeout(500);
    const sec = await tara(E.p, 'seçim ekranı');
    ok('B1 seçim ekranında iki deneyim: “Elmas Öğrenme Alanı” ve “Altın Öğrenme Alanı”; üyelik/ödeme dili yok', /Elmas Öğrenme Alanı/.test(sec) && /Altın Öğrenme Alanı/.test(sec) && !/Üyelik|ödeme/.test(sec));
    await E.p.screenshot({path: path.join(SH, 'secim-elmas-altin.png')});
    await E.ctx.close();
    const P = await sayfa({tema: 'dark'});
    for (const [ad, js] of [['koridor', "go('pdunya')"], ['sinif', "go('psinif',{pg:5})"], ['unite', "go('punite',{pg:5,pu:'DKAB-5-U01'})"], ['oyun', "go('poyun')"], ['ilerleme', "go('pilerleme')"], ['profil', "go('profil46')"], ['ayar', "go('ayar47',{at:'alan'})"], ['kutuphane', "go('poyna',{oyn:'kutuphane',obol:'',odevam:0})"], ['eski-profil', "go('pdunya');setTimeout(()=>V40.profil(),300)"], ['ara', "go('pdunya');setTimeout(()=>V39.ara(),300)"], ['degistir', "go('pdunya');setTimeout(()=>V42.degistir(),300)"]]) { await P.p.evaluate(js); await P.p.waitForTimeout(700); await tara(P.p, 'Altın ' + ad); await P.p.evaluate(() => { try { UI.close(); } catch (e) {} }); await P.p.waitForTimeout(250); }
    const ust = await P.p.evaluate(() => { go('psinif', {pg: 5}); return 1; }); await P.p.waitForTimeout(500);
    const dg = await P.p.evaluate(() => [...document.querySelectorAll('.dg42, .p39-sw')].map((x) => x.textContent.trim() + '|' + (x.getAttribute('aria-label') || '')));
    await P.ctx.close();
    ok('B2 uygulamanın 24 ekranında ve panelinde “Klasik”, “Premium”, “Öğrenme Dünyası”, “Üyelik” görünmüyor (iki alanda da)', bul.length === 0, bul.slice(0, 6));
    ok('B3 deneyim değiştirme düğmeleri yeni adlarla (Altın alanında “Elmas”)', dg.length > 0 && dg.every((x) => /Elmas/.test(x)), dg);
  }

  /* C. Elmas ana sayfa ve Sınıflar */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    await p.evaluate(() => { Store.ov.last = 'TPC-5-1-01'; Store.save(); go('classes'); }); await p.waitForTimeout(300); await p.evaluate(() => go('home')); await p.waitForTimeout(600);
    const s = await p.evaluate(() => { const L = [...document.querySelectorAll('#app .h30-cont, #app .h46-k, #app .m47-k')].map((e) => e.classList.contains('h30-cont') ? 'devam' : (e.querySelector('b') || e).textContent.trim()); const hedef = {}; document.querySelectorAll('#app [onclick]').forEach((e) => { const m = (e.getAttribute('onclick') || '').match(/go\('(\w+)'/); if (m) hedef[m[1]] = (hedef[m[1]] || 0) + 1; }); return {L, hedef}; });
    ok('C1 Elmas ana sayfa sırası: Kaldığın yerden devam → Derslerim, Oyunlar, Çalışmam, Profilim → 4 hızlı erişim modülü', s.L.join(',') === 'devam,Derslerim,Oyunlar,Çalışmam,Profilim,Sureler ve Dualar,Kavramlar,Kişiler ve Eserler,Bağlantılar', s.L);
    ok('C2 ana sayfada hiçbir araç iki kez yok (her hedefe tek kısayol)', ['sd', 'kavram', 'kisi', 'links', 'classes', 'games', 'calis45', 'profil46'].every((k) => (s.hedef[k] || 0) === 1), s.hedef);
    await p.screenshot({path: path.join(SH, 'elmas-ana.png')});
    const yon = []; for (const [k, v] of [['sd', 'sd'], ['kavram', 'kavram'], ['kisi', 'kisi'], ['bag', 'links']]) { await p.evaluate(() => go('home')); await p.waitForTimeout(300); await p.click(`.m47-k[data-k="${k}"]`); await p.waitForTimeout(400); yon.push(await p.evaluate(() => view) === v); }
    ok('C3 dört modül doğru ekranı açıyor (Sureler ve Dualar, Kavramlar, Kişiler ve Eserler, Bağlantılar)', yon.every(Boolean), yon);
    await p.evaluate(() => go('classes')); await p.waitForTimeout(500);
    const c = await p.evaluate(() => { const app = document.getElementById('app'), ilk = [...app.children].find((e) => !e.classList.contains('hero') && getComputedStyle(e).display !== 'none'); return {r46: !!app.querySelector('.r46'), lead: !!app.querySelector('.hero .lead'), prog: [...app.querySelectorAll('summary')].some((x) => /Program sürümü/.test(x.textContent)), ilk: ilk && ilk.className, kart: app.querySelectorAll('.g30-grid > *').length}; });
    ok('C4 Sınıflar ekranı doğrudan 4–12 sınıf kartlarıyla başlıyor; araç kutuları ve tekrar eden ayar yok', !c.r46 && !c.lead && !c.prog && /g30-grid/.test(c.ilk) && c.kart === 9, c);
    await p.screenshot({path: path.join(SH, 'elmas-siniflar.png')});
    await p.evaluate(() => go('profil46')); await p.waitForTimeout(400);
    ok('C5 program sürümü ayarı tek yerde (Profilim)', await p.evaluate(() => [...document.querySelectorAll('#app summary')].some((x) => /Program sürümü/.test(x.textContent))));
    await ctx.close();
  }

  /* D. Altın: koridor altındaki 3B araç şeridi */
  {
    const {p, ctx, cdp} = await sayfa({w: 412, h: 915});
    await p.evaluate(() => go('pdunya')); await p.waitForTimeout(1200);
    const s = await p.evaluate(() => { const r = document.querySelector('.s47-r'); return {n: document.querySelectorAll('.s47-k').length, ad: [...document.querySelectorAll('.s47-k b')].map((x) => x.textContent), kay: r.scrollWidth > r.clientWidth, ust: document.querySelector('.s47').getBoundingClientRect().top, sahneAlt: document.querySelector('.sahne40').getBoundingClientRect().bottom}; });
    ok('D1 Altın koridorun altında 6 araçlı yatay 3B şerit (Üniteler ve Konular, Sureler ve Dualar, Kavramlar, Kişiler ve Eserler, Bağlantılar, Öğrenme Araçları)', s.n === 6 && s.ad.join() === 'Üniteler ve Konular,Sureler ve Dualar,Kavramlar,Kişiler ve Eserler,Bağlantılar,Öğrenme Araçları' && s.kay && Math.abs(s.ust - s.sahneAlt) < 2, s);
    // sayfayı parmakla kaydır → şerit görünür; şeridi yana kaydır → koridor yürümez
    const vp = p.viewportSize();
    for (let i = 0; i < 4; i++) await surukle(cdp, 30, Math.round(vp.height * .95), 30, Math.round(vp.height * .35));
    const k0 = await p.evaluate(() => ({alt: document.querySelector('.s47-r').getBoundingClientRect().bottom, s: V40.s, y: scrollY}));
    const ry = await p.evaluate(() => { const r = document.querySelector('.s47-r').getBoundingClientRect(); return Math.round(r.top + r.height / 2); });
    await surukle(cdp, Math.round(vp.width * .85), ry, Math.round(vp.width * .15), ry);
    const k1 = await p.evaluate(() => ({sl: document.querySelector('.s47-r').scrollLeft, s: V40.s}));
    await p.screenshot({path: path.join(SH, 'altin-koridor-serit.png')});
    ok('D2 şerit parmakla açılır (sayfa kayar) ve yana kaydırılır; koridor bu sırada yürümez', k0.y > 0 && k0.alt <= vp.height + 2 && k1.sl > 20 && k1.s === k0.s, {k0, k1});
    await p.evaluate(() => { V40.git(3); }); await p.waitForTimeout(1500);
    const g = await p.evaluate(() => document.querySelector('.s47 [data-alt="unite"]').textContent);
    await p.evaluate(() => document.querySelector('.s47-k[data-k="unite"]').click()); await p.waitForTimeout(700);
    const u = await p.evaluate(() => ({view, pg: G.pg}));
    await p.evaluate(() => go('pdunya')); await p.waitForTimeout(1200); await p.evaluate(() => V40.git(3)); await p.waitForTimeout(1500);
    await p.evaluate(() => document.querySelector('.s47-k[data-k="arac"]').click()); await p.waitForTimeout(800);
    const a = await p.evaluate(() => ({view, pg: G.pg, acik: (document.querySelector('details.d46a') || {}).open}));
    const R = []; for (const [k, v] of [['sd', 'sd'], ['kavram', 'kavram'], ['kisi', 'kisi'], ['bag', 'links']]) { await p.evaluate(() => go('pdunya')); await p.waitForTimeout(900); await p.evaluate((k) => document.querySelector(`.s47-k[data-k="${k}"]`).click(), k); await p.waitForTimeout(500); R.push(await p.evaluate(() => view) === v); }
    ok('D3 şerit kartları doğru ekrana gider; “Üniteler ve Konular” ve “Öğrenme Araçları” koridorda seçili sınıfa (7. sınıf) gider, araçlar açık gelir', /^7\. sınıf/.test(g) && u.view === 'psinif' && +u.pg === 7 && a.view === 'psinif' && +a.pg === 7 && a.acik === true && R.every(Boolean), {g, u, a, R});
    const dok = await p.evaluate(() => { go('pdunya'); return 1; }); await p.waitForTimeout(900);
    const kucuk = await p.evaluate(() => [...document.querySelectorAll('.s47-k')].filter((e) => { const r = e.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).length);
    ok('D4 şerit kartları dokunma alanı ≥ 44 px', kucuk === 0, kucuk);
    await ctx.close();
  }

  /* E. Profilim › Görünüm ve ses */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    await p.evaluate(() => go('profil46')); await p.waitForTimeout(500);
    const oz = await p.evaluate(() => [...document.querySelectorAll('.a47-oz span')].map((x) => x.textContent));
    ok('E1 Profilim: “Görünüm ve ses” özeti beş satır (öğrenme alanı, tema, animasyonlar, ses ve müzik, Ders Atmosferi)', oz.join() === 'Öğrenme alanı,Tema,Animasyonlar,Ses ve müzik,Ders Atmosferi', oz);
    await p.screenshot({path: path.join(SH, 'profil-gorunum.png'), fullPage: true});
    await p.click('.a47-oz'); await p.waitForTimeout(400);
    const e2 = await p.evaluate(() => ({view, sek: [...document.querySelectorAll('.a47-sek button')].map((x) => x.textContent), kart: [...document.querySelectorAll('.a47-dk')].map((x) => x.querySelector('b').textContent + (x.classList.contains('on') ? '*' : ''))}));
    ok('E2 ayar ekranı beş bölüm; öğrenme alanı iki büyük kart, etkin olan işaretli', e2.view === 'ayar47' && e2.sek.length === 5 && e2.kart.join() === 'Elmas Öğrenme Alanı*,Altın Öğrenme Alanı', e2);
    await p.screenshot({path: path.join(SH, 'ayar-ogrenme-alani.png'), fullPage: true});
    await p.click('.a47-dk.al'); await p.waitForTimeout(1200);
    const e3 = await p.evaluate(() => ({view, prem: document.body.hasAttribute('data-prem39'), son: JSON.parse(localStorage.getItem('dk-deneyim39')).son, kart: [...document.querySelectorAll('.a47-dk.on b')].map((x) => x.textContent)}));
    ok('E3 kartla Altın alana geçiliyor; tercih eski anahtarda aynı değerle (dk-deneyim39.son = "premium")', e3.view === 'ayar47' && e3.prem && e3.son === 'premium' && e3.kart.join() === 'Altın Öğrenme Alanı', e3);
    await p.click('.a47-dk.el'); await p.waitForTimeout(1200);
    // tema: Elmas otomatik (cihaz teması)
    await p.evaluate(() => { G.at = 'tema'; V47.Ayar.sekme(); }); await p.waitForTimeout(200);
    await p.emulateMedia({colorScheme: 'light'}); await p.click('.a47-to:nth-child(3)'); await p.waitForTimeout(300);
    const t1 = await p.evaluate(() => ({th: document.documentElement.dataset.theme, k: localStorage.getItem('dk-tema47')}));
    await p.emulateMedia({colorScheme: 'dark'}); await p.waitForTimeout(400);
    const t2 = await p.evaluate(() => document.documentElement.dataset.theme);
    await p.click('.a47-tm .a47-to:nth-child(1)'); await p.waitForTimeout(200);
    const t3 = await p.evaluate(() => ({th: document.documentElement.dataset.theme, k: localStorage.getItem('dk-tema47'), dk: localStorage.getItem('dk-theme')}));
    ok('E4 Elmas tema: Açık / Koyu / Otomatik; Otomatik cihaz temasını izliyor; açık seçimi dk-theme anahtarına yazılıyor', t1.th === 'light' && t1.k === 'oto' && t2 === 'dark' && t3.th === 'light' && t3.k === null && t3.dk === 'light', {t1, t2, t3});
    await p.screenshot({path: path.join(SH, 'ayar-tema.png'), fullPage: true});
    // hareket
    await p.evaluate(() => { G.at = 'hareket'; V47.Ayar.sekme(); }); await p.waitForTimeout(200);
    const h0 = await p.evaluate(() => ({fx: V30.pref.get().fx, lite: localStorage.getItem('dk-lite')}));
    await p.click('.a47-anh[aria-label="Animasyonlar"]'); await p.click('.a47-anh[aria-label="Düşük donanım modu"]'); await p.waitForTimeout(200);
    const h1 = await p.evaluate(() => ({fx: V30.pref.get().fx, nomo: document.documentElement.classList.contains('nomotion'), lite: localStorage.getItem('dk-lite'), lc: document.documentElement.classList.contains('lite'), sw: [...document.querySelectorAll('.a47-anh')].map((x) => x.getAttribute('aria-checked'))}));
    ok('E5 hareket: animasyonlar ve düşük donanım modu anahtarları çalışıyor ve mevcut ayarlara yazıyor', h0.fx && h0.lite === '0' && !h1.fx && h1.nomo && h1.lite === '1' && h1.lc && h1.sw[0] === 'false' && h1.sw[1] === 'true', {h0, h1});
    await p.screenshot({path: path.join(SH, 'ayar-hareket.png'), fullPage: true});
    await p.click('.a47-anh[aria-label="Animasyonlar"]'); await p.click('.a47-anh[aria-label="Düşük donanım modu"]');
    await p.evaluate(() => V30.settings()); await p.waitForTimeout(400);
    const so = await p.evaluate(() => ({view, at: G.at}));
    ok('E6 üst çubuktaki ayar düğmesi aynı ekrana (Hareket) gider; ayrı bir ayar yeri yok', so.view === 'ayar47' && so.at === 'hareket', so);
    // ses
    await p.evaluate(() => { G.at = 'ses'; V47.Ayar.sekme(); }); await p.waitForTimeout(200);
    await p.evaluate(() => { const r = document.querySelector('.a47-rng'); r.value = .4; r.dispatchEvent(new Event('input', {bubbles: true})); });
    await p.click('.a47-mz button'); await p.waitForTimeout(1200);
    const s1 = await p.evaluate(() => ({vol: JSON.parse(localStorage.getItem('dk-atm')).vol, L: ATM.st.L.map((x) => x.id), dur: (document.querySelector('.a47-dur') || {}).textContent}));
    ok('E7 ses: seviye kaydediliyor (dk-atm), müzik listeden başlatılıyor', Math.abs(s1.vol - .4) < .01 && s1.L.join() === 'm42_esik', s1);
    await p.screenshot({path: path.join(SH, 'ayar-ses.png'), fullPage: true});
    await p.evaluate(() => ATM.stopAll());
    // atmosfer
    await p.evaluate(() => { G.at = 'atmosfer'; V47.Ayar.sekme(); }); await p.waitForTimeout(200);
    await p.click('.a47-krs button'); await p.waitForTimeout(1500);
    const a1 = await p.evaluate(() => ({L: ATM.st.L.map((x) => x.id), k: document.querySelector('.a47-atm-k').textContent, d: document.querySelector('.a47-atm .a47-dur').textContent}));
    ok('E8 Ders Atmosferi kartı: hazır karışım başlatılıyor; etkin sesler ve durum kartta görünüyor', a1.L.join() === 'yagmur,kus' && /Hafif yağmur/.test(a1.k) && /Çalıyor|Duraklatıldı/.test(a1.d), a1);
    await p.screenshot({path: path.join(SH, 'ayar-atmosfer.png'), fullPage: true});
    await p.evaluate(() => ATM.stopAll());
    await ctx.close();
  }

  /* F. Ders Atmosferi kataloğu */
  {
    const eskiAtm = {vol: .7, L: [{id: 'ney', v: .6, on: true}, {id: 'yagmur', v: .5, on: true}], name: '', saved: [{id: 'u1', n: 'Eski karışım', L: [['ney', .7], ['kanun', .5], ['dere', .4]]}, {id: 'u2', n: 'Yalnız ney', L: [['ney', .7]]}], fav: ['ney', 'koro', 'yagmur'], favMix: ['u2', 'p1'], queue: ['u2', 'u1'], rep: 'one', segMin: 15, tab: 'sesler'};
    const {p, ctx} = await sayfa({mod: 'normal', atm: eskiAtm});
    const k = await p.evaluate(() => ({S: ATM.S.map((s) => s.id), cat: ATM.CAT.map((c) => c.id + ':' + c.n), gen: Object.keys(ATM_GEN()), pre: ATM.PRE.every((m) => m.L.every((x) => ATM.byId(x[0]))), kodda: ['neyNote', 'padVoice', 'G.ney', 'G.koro', 'kanunNey', 'doguEzgi'].filter((w) => ATM_GEN.toString().includes(w))}));
    const kalan = ['yagmur', 'cam', 'orman', 'dere', 'deniz', 'ruzgar', 'somine', 'gece', 'kus', 'brown', 'white'];
    ok('F1 katalog: 9 doğa + 2 odak sesi + 7 kayıtlı müzik; sentez ney/kanun/koro/ezgi/ışık/ambient/derin odak kayıtları ve üreticileri koddan silindi', JSON.stringify(k.S.filter((x) => !x.startsWith('m42_'))) === JSON.stringify(kalan) && k.S.filter((x) => x.startsWith('m42_')).length === 7 && k.gen.length === 11 && kalan.length === 11 && !k.kodda.length && k.pre, k);
    const st = await p.evaluate(() => ATM.st);
    ok('F2 eski kayıtlardaki silinmiş sesler temizlendi (favori, son karışım, kayıtlı karışım, sıra); geçerli olanlar korundu', st.fav.join() === 'yagmur' && st.L.map((x) => x.id).join() === 'yagmur' && st.saved.length === 1 && st.saved[0].L.map((x) => x[0]).join() === 'dere' && !st.queue.includes('u2') && st.queue.includes('u1') && !st.favMix.includes('u2'), {fav: st.fav, L: st.L, saved: st.saved, queue: st.queue, favMix: st.favMix});
    await p.evaluate(() => ATM.open()); await p.waitForTimeout(500);
    const pan = await p.evaluate(() => ({h: [...document.querySelectorAll('.atm-h')].map((x) => x.textContent), t: document.querySelector('.atm-body').innerText}));
    ok('F3 Ders Atmosferi listesinde kaydı olmayan “enstrüman” bölümü ve ney/kanun yazısı yok; kategoriler: Favoriler, Müzikler, Doğa sesleri, Odak sesleri', !pan.h.some((x) => /enstrüman/i.test(x)) && !/[Nn]ey,|kanun/.test(pan.t) && ['Müzikler', 'Doğa sesleri', 'Odak sesleri'].every((x) => pan.h.includes(x)), pan.h);
    await p.screenshot({path: path.join(SH, 'ders-atmosferi.png')});
    const ur = await p.evaluate(() => { const G = ATM_GEN(), o = {}; Object.keys(G).forEach((k) => { const x = G[k](22050); let s = 0, nan = 0; for (let i = 0; i < x.length; i += 7) { if (!isFinite(x[i])) nan++; s += x[i] * x[i]; } o[k] = {n: x.length, rms: Math.sqrt(s / (x.length / 7)), nan}; }); return o; });
    ok('F4 kalan 11 sesin üreticisi çalışıyor (sessiz değil, geçersiz örnek yok)', Object.values(ur).every((x) => x.n > 8000 && x.rms > 1e-4 && !x.nan), Object.fromEntries(Object.entries(ur).map(([k, v]) => [k, +v.rms.toFixed(4)])));
    await p.evaluate(() => { UI.close(); ATM.toggleSound('dere'); ATM.favSound('orman'); }); await p.waitForTimeout(200);
    const f = await p.evaluate(() => ({L: ATM.st.L.map((x) => x.id), fav: ATM.st.fav}));
    ok('F5 ses seçme ve favori işlevleri korunuyor', f.L.includes('dere') && f.fav.includes('orman'), f);
    await ctx.close();
  }

  /* G. Telefon / tablet: taşma, dokunma alanı, alt menü çakışması */
  {
    const R = [];
    for (const [cihaz, o] of [['320', {w: 320, h: 640}], ['Galaxy S9+', {cihaz: 'Galaxy S9+'}], ['Galaxy Tab S4', {cihaz: 'Galaxy Tab S4'}]]) {
      for (const mod of ['normal', 'premium']) {
        const {p, ctx, cdp} = await sayfa(Object.assign({mod, lite: '1'}, o));
        for (const [ad, js] of [['ana', mod === 'normal' ? "go('home')" : "go('pdunya')"], ['siniflar', mod === 'normal' ? "go('classes')" : "go('psinif',{pg:6})"], ['profil', "go('profil46')"], ['ayar', "go('ayar47',{at:'alan'})"], ['ayar-ses', "go('ayar47',{at:'ses'})"]]) {
          await p.evaluate(js); await p.waitForTimeout(700);
          const r = await p.evaluate(() => { const w = document.documentElement.clientWidth; const tas = [...document.querySelectorAll('#app *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > w + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.s47-r,.v-chips,.h30-hs,.p39-tabs,.sahne40,[style*="overflow"]'); }).slice(0, 3).map((e) => e.className || e.tagName);
            const kucuk = [...document.querySelectorAll('.m47-k,.s47-k,.a47-sek button,.a47-anh,.a47-dk,.a47-to,.a47-oz,.a47-mz button,.a47-krs button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.width < 44 || r.height < 44); }).length;
            return {sw: document.documentElement.scrollWidth, w, tas, kucuk}; });
          // sona kadar kaydır: son öğe alt menünün üstünde kalmalı
          const vp = p.viewportSize(); for (let i = 0; i < 12; i++) await surukle(cdp, 20, Math.round(vp.height * .85), 20, Math.round(vp.height * .2));
          const c = await p.evaluate(() => { const nv = document.querySelector('nav.bnav'), gor = nv && getComputedStyle(nv).display !== 'none' && nv.getBoundingClientRect().height; if (!gor) return 'menü yok'; const L = [...document.querySelectorAll('#app button, #app a, #app p, #app li')].filter((e) => e.offsetParent && e.getBoundingClientRect().height); const son = L[L.length - 1]; return son ? Math.round(son.getBoundingClientRect().bottom - nv.getBoundingClientRect().top) : 0; });
          R.push({cihaz, mod, ad, sw: r.sw, w: r.w, tas: r.tas, kucuk: r.kucuk, cakisma: c});
        }
        await ctx.close();
      }
    }
    const kotu = R.filter((x) => x.sw > x.w || x.tas.length || x.kucuk || (typeof x.cakisma === 'number' && x.cakisma > 2));
    ok('G1 320 px telefon, Galaxy S9+, Galaxy Tab S4 × Elmas/Altın × 5 ekran: yatay taşma yok, dokunma alanları ≥ 44 px, sayfa sonunda içerik alt menünün altında kalmıyor', !kotu.length, kotu.length ? kotu : R.length + ' ölçüm');
  }

  ok('H1 sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  const g = S.filter((x) => x.ok).length;
  console.log(`\nToplam: ${g}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), md5: crypto.createHash('md5').update(h47).digest('hex'), sonuc: S, hata: HATA}, null, 1));
  await b.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
