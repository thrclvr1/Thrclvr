// V48.0 testleri (depo kökünden): node tests/v48/test_v480.js
// Yerel http sunucusu + başsız Chromium (SwiftShader WebGL). Hafif mod (dk-lite) açıkça ayarlanır. Ekran görüntüleri: docs/V48.0_ekran/
// Kaydırma gerçek dokunma olaylarıyla (CDP Input.dispatchTouchEvent). Tarayıcı otomasyonu gerçek cihaz testi değildir.
const {chromium, devices} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const F48 = 'surumler/din-kulturu-platformu-v48.0.html', F47 = 'surumler/din-kulturu-platformu-v47.0.html';
const SH = path.join(ROOT, 'docs', 'V48.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [];
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const DOGA = ['Hafif yağmur', 'Cam üzerine yağmur', 'Orman ve kuşlar', 'Dere ve akan su', 'Deniz ve dalga', 'Hafif rüzgâr', 'Şömine ve çıtırtı', 'Gece doğası', 'Hafif kuş cıvıltıları'];

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const URL = () => 'http://127.0.0.1:' + srv.address().port + '/' + F48;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, lite: '0', mod: 'premium', tema: 'light', pt: 'gece', cihaz: null, sec: false, ek: null, az: false}, o || {});
    const ctx = await b.newContext(Object.assign(o.cihaz ? Object.assign({}, devices[o.cihaz]) : {viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true}, o.az ? {reducedMotion: 'reduce'} : {}));
    await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', o.lite); localStorage.setItem('dk-theme', o.tema); localStorage.setItem('dk-ptema43', o.pt); if (!o.sec) localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); if (o.ek) Object.entries(o.ek).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL()); await p.waitForTimeout(1500);
    return {p, ctx, cdp: await ctx.newCDPSession(p)};
  };
  const surukle = async (cdp, x0, y0, x1, y1) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0}]}); for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: Math.round(x0 + (x1 - x0) * i / 10), y: Math.round(y0 + (y1 - y0) * i / 10)}]}); await bek(16); } await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await bek(150); };
  const tasma = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  // altı kat simetri taraması: DOM'daki çokgenler ve CSS arka plan SVG'leri
  const altiKat = (p) => p.evaluate(() => {
    const kontrol = (pts) => { const n = pts.length; if (n !== 6 && n !== 12) return false; const cx = pts.reduce((a, q) => a + q[0], 0) / n, cy = pts.reduce((a, q) => a + q[1], 0) / n; const A = pts.map((q) => Math.atan2(q[1] - cy, q[0] - cx)).sort((a, b) => a - b); const d = A.map((a, i) => ((i ? a - A[i - 1] : a - A[n - 1] + 2 * Math.PI) * 180 / Math.PI)); const hedef = 360 / n; return d.every((x) => Math.abs(x - hedef) < 4); };
    const oku = (s) => (s || '').trim().split(/[\s,]+/).map(Number).reduce((a, v, i, L) => (i % 2 ? a : a.concat([[v, L[i + 1]]])), []);
    const bul = []; document.querySelectorAll('polygon').forEach((e) => { if (kontrol(oku(e.getAttribute('points')))) bul.push('dom:' + (e.closest('[class]') || {}).className); });
    const css = [getComputedStyle(document.body, '::after').backgroundImage, ...[...document.querySelectorAll('#uye39,body')].map((e) => getComputedStyle(e).backgroundImage)].join(' ');
    css.split('url(').map((u) => { try { return decodeURIComponent(u); } catch (e) { return u.replace(/%27/g, "'").replace(/%20/g, ' ').replace(/%2C/gi, ','); } }).join(' ').replace(/points='([^']+)'/g, (m, q) => { if (kontrol(oku(q))) bul.push('css'); return m; });
    return bul;
  });

  /* A. Derleme ve veri güvenliği */
  const h48 = fs.readFileSync(path.join(ROOT, F48), 'utf8'), h47 = fs.readFileSync(path.join(ROOT, F47), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  ok('A1 sürüm V48.0, index.html aynı dosya; V47.0 yedek dosyası duruyor', /V31\.VER="V48\.0"/.test(h48) && /content="V48\.0"/.test(h48) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === h48 && fs.existsSync(path.join(ROOT, F47)));
  ok('A2 içerik kayıtları ve müzik blokları V47.0 ile bayt bayt aynı', JSON.stringify(seeds(h48)) === JSON.stringify(seeds(h47)), Object.keys(seeds(h48)).length + ' blok');
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v48.0'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı', deg.length === 0, deg.join(';') || 'yalnız v48.0');
  const kod = h48.replace(/<script type="(?:application\/json|text\/plain)" id="[^"]+">[\s\S]*?<\/script>/g, '');
  ok('A4 HTML içinde gizli bilgi yok (istemci sırrı, özel anahtar, parola)', !/client_secret|GOCSPX-|BEGIN (RSA )?PRIVATE KEY|"password"\s*:/.test(kod));

  /* M. Motifler ve görseller */
  {
    const E = await sayfa({mod: 'normal', sec: true, tema: 'dark'});
    await E.p.waitForSelector('#uye39 .o42-k'); await E.p.waitForTimeout(400);
    const sec = await E.p.evaluate(() => { const kn = document.querySelector('.o42-kn .o42-gor svg.g48'), kp = document.querySelector('.o42-kp .o42-gor svg.g48'); const etk = [...document.querySelectorAll('.o42-etk')].map((e) => ({t: e.textContent.trim(), am: !!e.querySelector('svg.am48'), gunes: !!e.querySelector('circle[r="4.5"]')})); return {kn: !!kn, kp: !!kp, img: document.querySelectorAll('#uye39 .o42-gor img').length, etk, bg: /data:image\/svg/.test(getComputedStyle(document.getElementById('uye39')).backgroundImage), gecme: !!document.querySelector('#uye39 .gc48')}; });
    ok('M1 seçim ekranında yeni görseller: Elmas kristal-platin kütüphane, Altın zümrüt-altın kemerli salon (vektör, dosya indirmez)', sec.kn && sec.kp && sec.img === 0, sec);
    ok('M2 “Altın” yanındaki güneş simgesi yok; yerinde metalik altın madalyon; Elmas’ta kristal amblem', sec.etk.length === 2 && sec.etk.every((x) => x.am && !x.gunes) && /Altın/.test(sec.etk[1].t), sec.etk);
    const a1 = await altiKat(E.p);
    ok('M3 seçim ekranında altı köşeli yıldız / altıgen yok (DOM çokgenleri ve CSS arka planı taranır); girih arka plan ve geçme bordür var', a1.length === 0 && sec.bg && sec.gecme, a1);
    await E.p.screenshot({path: path.join(SH, 'secim-ekrani.png')});
    const gen = {};
    for (const [w, h] of [[360, 760], [390, 844], [820, 1180]]) { await E.p.setViewportSize({width: w, height: h}); await bek(250); gen[w] = await tasma(E.p); }
    await E.p.setViewportSize({width: 820, height: 1180}); await bek(200); await E.p.screenshot({path: path.join(SH, 'secim-tablet.png')});
    ok('M4 seçim ekranı 360 / 390 / 820 px genişlikte yatay taşma yok', Object.values(gen).every((x) => x <= 0), gen);
    await E.ctx.close();
    const P = await sayfa({mod: 'normal'});
    const km = await P.p.evaluate(() => { const ids = Store.all('concepts').map((c) => c.id), d = document.createElement('div'); d.innerHTML = ids.map((i) => KMAP.motif(i, 40)).join(''); document.body.appendChild(d); return ids.length; });
    const a2 = await altiKat(P.p);
    const bg = await P.p.evaluate(() => getComputedStyle(document.body, '::after').backgroundImage);
    ok('M5 bütün kavram motifleri (' + km + ') ve Elmas arka planı taranır: 6 kat simetrik çokgen yok; arka plan 8 köşeli yıldızlı girih', a2.length === 0 && /data:image\/svg/.test(bg) && km > 100, a2.slice(0, 4));
    await P.p.evaluate(() => { document.body.lastElementChild.remove(); go('home'); }); await bek(400); await P.p.screenshot({path: path.join(SH, 'elmas-ana.png')});
    await P.p.evaluate(() => go('ayar47', {at: 'alan'})); await bek(500);
    const on = await P.p.evaluate(() => document.querySelectorAll('.a47-on svg.g48.k').length);
    ok('M6 Profilim › Görünüm › Öğrenme alanı önizlemeleri yeni Elmas/Altın görselleri', on === 2, on);
    await P.p.screenshot({path: path.join(SH, 'ayar-ogrenme-alani.png')});
    await P.ctx.close();
    const A = await sayfa({tema: 'dark'});
    await A.p.evaluate(() => go('psinif', {pg: 5})); await bek(500);
    const abg = await A.p.evaluate(() => getComputedStyle(document.body, '::after').backgroundImage);
    const a3 = await altiKat(A.p);
    ok('M7 Altın alan arka planı zümrüt-altın girih (gece ve gündüz ayrı tonda); altı kat simetri yok', /data:image\/svg/.test(abg) && a3.length === 0, a3);
    await A.p.screenshot({path: path.join(SH, 'altin-sinif-gece.png')});
    await A.p.evaluate(() => V43.ayarla('gunduz')); await bek(300);
    const abg2 = await A.p.evaluate(() => getComputedStyle(document.body, '::after').backgroundImage);
    ok('M8 Altın gündüz modunda girih farklı (bronz) tonda', abg2 !== abg && /data:image\/svg/.test(abg2));
    await A.p.screenshot({path: path.join(SH, 'altin-sinif-gunduz.png')});
    await A.ctx.close();
  }

  /* S. Ders Atmosferi: doğa sesleri kaldırıldı, ses paneli */
  {
    const eski = {vol: .6, L: [{id: 'yagmur', v: .5, on: true}, {id: 'brown', v: .4, on: true}], name: 'Yağmur + Kahverengi', saved: [{id: 'u1', n: 'Benim', L: [['yagmur', .5], ['white', .3]]}, {id: 'u2', n: 'Sadece doğa', L: [['orman', .5], ['kus', .3]]}], fav: ['yagmur', 'brown', 'kus'], favMix: ['p1', 'p3', 'u2'], queue: ['p2', 'p3'], rep: 'one', segMin: 15, tab: 'sesler'};
    const {p, ctx} = await sayfa({mod: 'normal', ek: {'dk-atm': eski}});
    const k = await p.evaluate((D) => ({ids: ATM.S.map((s) => s.id), adlar: ATM.S.map((s) => s.n), pre: ATM.PRE.map((m) => m.n + ':' + m.L.map((x) => x[0]).join('+')), kat: JSON.stringify(ATM.CAT), gen: Object.keys(ATM_GEN()), doga: D.filter((n) => JSON.stringify(ATM.S).includes(n))}), DOGA);
    ok('S1 9 doğa sesi katalogda ve üreticilerde yok; kahverengi ve beyaz gürültü duruyor', k.doga.length === 0 && k.ids.includes('brown') && k.ids.includes('white') && k.gen.join() === 'brown,white' && !/doga|Doğa/.test(k.kat), k);
    ok('S2 hazır karışımlar yalnız kalan seslerle (bozuk karışım yok)', k.pre.length >= 1 && k.pre.every((x) => /:(brown|white)(\+(brown|white))*$/.test(x)), k.pre);
    const st = await p.evaluate(() => JSON.parse(localStorage.getItem('dk-atm')));
    ok('S3 eski favori/karışım/sıra kayıtlarında silinen sesler temizlendi; kalan sesler korundu', JSON.stringify(st.fav) === '["brown"]' && st.L.map((x) => x.id).join() === 'brown' && st.saved.length === 1 && st.saved[0].L.map((x) => x[0]).join() === 'white' && !st.favMix.includes('p1') && st.favMix.includes('p3') && !st.favMix.includes('u2') && st.queue.join() === 'p3', st);
    const g = await p.evaluate(() => { const G = ATM_GEN(), o = {}; ['brown', 'white'].forEach((k) => { const x = G[k](22050); let s = 0, bad = 0; for (let i = 0; i < x.length; i++) { if (!Number.isFinite(x[i])) bad++; s += x[i] * x[i]; } o[k] = {n: x.length, rms: +Math.sqrt(s / x.length).toFixed(4), bad}; }); return o; });
    ok('S4 kalan odak sesleri (22050 Hz) sayısal olarak sağlam ses üretir', Object.values(g).every((x) => x.bad === 0 && x.rms > 0.01 && x.n > 22050 * 10), g);
    await p.evaluate(() => ATM.open()); await bek(500);
    const at = [];
    for (const t of ['sesler', 'karisim', 'hazir', 'sure', 'kaynak']) { await p.evaluate((t) => { try { ATM.st.tab = t; ATM.paint(); } catch (e) {} }, t); await bek(150); at.push(await p.evaluate(() => (document.querySelector('.v-ov') || document.body).innerText)); }
    const kal = DOGA.filter((n) => at.join(' ').includes(n)).concat(/doğa ses/i.test(at.join(' ')) ? ['“doğa sesleri” ifadesi'] : []);
    ok('S5 Ders Atmosferi panelinin hiçbir sekmesinde silinen sesler ve “doğa sesleri” ifadesi geçmiyor', kal.length === 0, kal);
    await p.screenshot({path: path.join(SH, 'ders-atmosferi.png')});
    await p.evaluate(() => { UI.close(); go('ayar47', {at: 'ses'}); }); await bek(600);
    const pn = await p.evaluate(() => ({pp: !!document.querySelector('.sp48 .sp48-pp'), dalga: document.querySelectorAll('.sp48-dalga i').length, rng: !!document.querySelector('.sp48-vol input[type=range]'), mute: !!document.querySelector('.sp48-mute'), zm: document.querySelectorAll('.sp48-zmb button').length, eskiDugme: [...document.querySelectorAll('#a47b button')].some((b) => /Zamanlayıcı ve ayrıntılar/.test(b.textContent))}));
    ok('S6 Ses ve müzik: büyük oynat/duraklat, dalga, ses sürgüsü, ayrı sessize alma, zamanlayıcı kartı; eski “Zamanlayıcı ve ayrıntılar” düğmesi yok', pn.pp && pn.dalga === 7 && pn.rng && pn.mute && pn.zm >= 4 && !pn.eskiDugme, pn);
    await p.screenshot({path: path.join(SH, 'ses-paneli.png')});
    await p.evaluate(() => ATM.stopAll()); await p.evaluate(() => { ATM.st.L = []; ATM.save(); V48.SesPanel.tazele(true); }); await bek(200);
    await p.click('.sp48-pp'); await bek(1800);
    const c1 = await p.evaluate(() => ({cal: ATM.rt.playing, L: ATM.st.L.map((x) => x.id), ad: ATM.st.name, on: document.querySelector('.sp48').classList.contains('on'), np: document.querySelector('.sp48-bil b').textContent, cip: document.querySelectorAll('.sp48-c').length}));
    ok('S7 Oynat: ses seçili değilken Derin Odak (kahverengi gürültü) başlar; şimdi çalan ve etkin ses göstergesi güncellenir', c1.cal && c1.L.join() === 'brown' && c1.on && /Derin Odak/.test(c1.np) && c1.cip === 1, c1);
    await p.evaluate(() => V48.SesPanel.seviye(0.4)); const v1 = await p.evaluate(() => ATM.st.vol);
    await p.click('.sp48-mute'); await bek(200); const m1 = await p.evaluate(() => ({vol: ATM.st.vol, bas: document.querySelector('.sp48-mute').getAttribute('aria-pressed'), k: JSON.parse(localStorage.getItem('dk-ses48'))}));
    await p.click('.sp48-mute'); await bek(200); const m2 = await p.evaluate(() => ATM.st.vol);
    ok('S8 ses sürgüsü seviyeyi değiştirir; sessize alma 0 yapar ve önceki seviyeye (%40) geri döner', v1 === 0.4 && m1.vol === 0 && m1.bas === 'true' && m1.k.sessiz === true && m2 === 0.4, {v1, m1, m2});
    await p.evaluate(() => V48.SesPanel.zaman(25)); await bek(1200);
    const z = await p.evaluate(() => ({kalan: ATM.left(), t: document.querySelector('.sp48-kalan').textContent, on: [...document.querySelectorAll('.sp48-zmb button.on')].map((b) => b.textContent)}));
    ok('S9 zamanlayıcı 25 dk kurulur, kalan süre kartta görünür', z.kalan > 24 * 60 && z.kalan <= 25 * 60 && /Kalan 2[45]:/.test(z.t) && z.on.join() === '25 dk', z);
    await p.click('.sp48-pp'); await bek(500); const d1 = await p.evaluate(() => ({cal: ATM.rt.playing, dur: ATM.rt.paused}));
    await p.evaluate(() => V48.SesPanel.zaman(0)); await p.click('.sp48-dur'); await bek(400); const d2 = await p.evaluate(() => ({live: ATM.live(), tEnd: ATM.rt.tEnd}));
    ok('S10 duraklat ve “Sesi tamamen kapat” çalışır', !d1.cal && d1.dur && !d2.live, {d1, d2});
    const M = await p.evaluate(async () => { const m = V42.MUZ.filter(V42.var)[0]; V42.muzikCal(m.id); await new Promise((r) => setTimeout(r, 2500)); return {id: m.id, n: m.n, has: ATM.has('m42_' + m.id), cal: ATM.rt.playing, err: ATM.rt.err}; });
    ok('S11 kayıtlı müzik çalar (müzikler kaldı)', M.has && M.cal, M);
    await p.evaluate(() => { ATM.stopAll(); V37.sndOpen(); }); await bek(500);
    const hz = await p.evaluate(() => ({sp: !!document.querySelector('.snd37-sheet .sp48[data-yer=hizli]'), eski: !!document.querySelector('.snd37-sheet .snd37-np'), muz: /Müzikler/.test(document.querySelector('.snd37-sheet').textContent), ad: document.querySelectorAll('.snd37-sheet .sp48-ad').length}));
    ok('S12 üst çubuktaki hızlı ses paneli aynı modern bileşeni kullanır (önceki/sonraki dahil), müzik listesi duruyor', hz.sp && !hz.eski && hz.muz && hz.ad === 2, hz);
    await p.screenshot({path: path.join(SH, 'hizli-ses-paneli.png')});
    await ctx.close();
    const R = await sayfa({mod: 'normal', az: true});
    await R.p.evaluate(() => { ATM.loadMix([['brown', .4]], 'Derin Odak', true); go('ayar47', {at: 'ses'}); }); await bek(1500);
    const an = await R.p.evaluate(() => [...document.querySelectorAll('.sp48-dalga i, .sp48-hl')].map((e) => getComputedStyle(e).animationName));
    ok('S13 “hareketi azalt” açıkken ses paneli animasyonsuz', an.length && an.every((x) => x === 'none'), an.slice(0, 3));
    await R.ctx.close();
  }

  /* C. Çalışma Merkezim */
  const veriYukle = (p) => p.evaluate(() => { for (let i = 0; i < 3; i++) Prog.rec(['DKAB-5-U01-O01'], false); Prog.rec(['DKAB-5-U01-O01'], true); for (let i = 0; i < 4; i++) Prog.rec(['DKAB-5-U01-O02'], true); Store.ov.wrong = Object.assign(Store.ov.wrong || {}, {'Q-DKAB-5-0001': {n: 1, t: Date.now()}, 'Q-DKAB-5-0002': {n: 1, t: Date.now()}}); Store.ov.last = 'TPC-5-1-01'; Store.save(); });
  {
    const {p, ctx, cdp} = await sayfa({mod: 'normal'});
    await p.evaluate(() => go('calis45')); await bek(500);
    const bos = await p.evaluate(() => ({halka: !!document.querySelector('.c48-hlk'), say: [...document.querySelectorAll('.c48-say b')].map((b) => b.textContent), kart: [...document.querySelectorAll('.c48-sk')].map((b) => ({k: b.dataset.k, b: b.querySelector('.c48-st b').textContent, f: b.getAttribute('onclick')})), seri: !!document.querySelector('.c48-seri'), hafta: document.querySelectorAll('.c48-hft span').length}));
    ok('C1 büyük hedef halkası; tamamlanan / kalan / hedef; seri; son 7 gün', bos.halka && bos.say.length === 3 && bos.seri && bos.hafta === 7, bos.say);
    ok('C2 dört çalışma kartı, her biri bir ekrana gider; değer 0 iken boş “0” yerine anlamlı durum yazar', bos.kart.length === 4 && bos.kart.every((x) => x.f && x.b !== '0'), bos.kart.map((x) => x.k + ':' + x.b));
    await veriYukle(p); await p.evaluate(() => go('calis45')); await bek(500);
    const dolu = await p.evaluate(() => ({oe: [...document.querySelectorAll('.c48-on .c48-oe')].map((e) => ({neden: (e.querySelector('em') || {}).textContent, f: (e.querySelector('button') || {getAttribute: () => ''}).getAttribute('onclick')})), kz: [...document.querySelectorAll('.c48-kzl .c48-kz')].slice(0, 2).map((e) => e.innerText.replace(/\s+/g, ' ')), bar: document.querySelectorAll('.c48-kz .c48-bar i').length, yanlis: document.querySelector('.c48-sk[data-k=yanlis] .c48-st b').textContent}));
    ok('C3 öneriler neden göstergesiyle (ör. “Neden: 2 yanlış sorun var”) ve doğrudan konu bağlantısıyla', dolu.oe.length > 0 && dolu.oe.every((x) => /^Neden: /.test(x.neden) && /icerikAc|yStart/.test(x.f)), dolu.oe);
    ok('C4 zayıf kazanımlar yüzde, doğru/yanlış sayısı ve ilerleme çubuğuyla', dolu.kz.length > 0 && /%25/.test(dolu.kz[0]) && /1 doğru/.test(dolu.kz[0]) && /3 yanlış/.test(dolu.kz[0]) && dolu.bar > 0, dolu.kz);
    await p.screenshot({path: path.join(SH, 'calisma-elmas.png'), fullPage: true});
    const y0 = await p.evaluate(() => scrollY); await surukle(cdp, 200, 700, 200, 200); await bek(400); const y1 = await p.evaluate(() => scrollY);
    ok('C5 Çalışma Merkezim gerçek dokunma ile kaydırılır', y1 > y0 + 200, {y0, y1});
    const git = [];
    for (const k of ['yanlis', 'ogren']) { await p.evaluate(() => { go('calis45'); scrollTo(0, 0); }); await bek(300); await p.click(`.c48-sk[data-k=${k}]`); await bek(500); git.push(k + '→' + await p.evaluate(() => view)); }
    ok('C6 kartlar ilgili ekranı açar (yanlışlarım, kartlar)', git[0] === 'yanlis→yanlis' && git[1] === 'ogren→cards', git);
    await p.evaluate(() => go('calis45')); await bek(300); await p.setViewportSize({width: 360, height: 760}); await bek(300);
    const t360 = await tasma(p);
    const alt = await p.evaluate(() => { scrollTo(0, 1e6); const n = document.querySelector('nav.bnav, .bnav, nav.nv46'); const son = document.querySelector('.c48-not'); return n && son ? {nav: Math.round(n.getBoundingClientRect().top), son: Math.round(son.getBoundingClientRect().bottom)} : null; });
    await bek(300);
    await p.evaluate(() => scrollTo({top: 1e6, behavior: 'instant'})); await bek(700);
    const alt2 = await p.evaluate(() => { const n = [...document.querySelectorAll('nav')].find((e) => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().top > innerHeight / 2); const son = document.querySelector('.c48-not'); return {nav: n ? Math.round(n.getBoundingClientRect().top) : null, son: Math.round(son.getBoundingClientRect().bottom)}; });
    ok('C7 360 px’te yatay taşma yok; en alttaki içerik alt menünün altında kalmıyor', t360 <= 0 && (alt2.nav === null || alt2.son <= alt2.nav + 1), {t360, alt, alt2});
    await ctx.close();
    const A = await sayfa({tema: 'dark'});
    await veriYukle(A.p);
    await A.p.evaluate(() => go('pdunya')); await bek(1200);
    const kr = await A.p.evaluate(() => ({masa: !!document.querySelector('#p40 .c48-masa .c48-mb'), serit: document.querySelectorAll('#p40 .s47 .s47-k').length, ayri: !document.querySelector('.s47 .c48-masa'), oyun: /Oyun/.test((document.querySelector('.c48-masa') || {}).textContent || '')}));
    ok('C8 Altın koridorda ayrı “Çalışma Masası” girişi; araç şeridi yine 6 kart (7. kart yok); Oyun Merkezi’nden ayrı', kr.masa && kr.serit === 6 && kr.ayri && !kr.oyun, kr);
    await A.p.evaluate(() => { const e = document.querySelector('.c48-masa'); e.scrollIntoView({block: 'center'}); }); await bek(400);
    await A.p.screenshot({path: path.join(SH, 'altin-koridor-calisma-masasi.png')});
    await A.p.click('.c48-mb'); await bek(700);
    const ac = await A.p.evaluate(() => ({v: view, al: !!document.querySelector('.c48.al'), on: document.querySelectorAll('.c48-on .c48-oe').length, kart: document.querySelectorAll('.c48-sk').length, halka: !!document.querySelector('.c48-hlk')}));
    ok('C9 Altın’da Çalışma Merkezim tam işlevli: aynı veri (öneriler, kartlar, halka) atmosferik görünümle', ac.v === 'calis45' && ac.al && ac.on > 0 && ac.kart === 4 && ac.halka, ac);
    await A.p.screenshot({path: path.join(SH, 'calisma-altin.png'), fullPage: true});
    await A.ctx.close();
  }

  /* B. Hata ve geri bildirim */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    await p.evaluate(() => go('topic', {t: 'TPC-5-1-01', tab: 'anlat'})); await bek(700);
    const ic = await p.evaluate(() => { const e = document.querySelector('#tb > .b48-ic'); return e ? {son: e === document.getElementById('tb').lastElementChild, t: e.innerText} : null; });
    ok('B1 konu içeriğinin sonunda “Bu içerikte bir hata mı fark ettin?” + “İçerik hatası bildir”', ic && ic.son && /hata mı fark ettin/.test(ic.t) && /İçerik hatası bildir/.test(ic.t), ic);
    await p.evaluate(() => document.querySelector('.b48-ic').scrollIntoView({block: 'center'})); await bek(200);
    await p.screenshot({path: path.join(SH, 'icerik-hatasi-dugmesi.png')});
    await p.click('.b48-ib'); await bek(500);
    const form = await p.evaluate(() => ({kat: [...document.querySelectorAll('.b48-kat button')].map((b) => b.textContent), ta: !!document.querySelector('.b48-a textarea'), an: !!document.querySelector('.b48-an input')}));
    ok('B2 içerik bildirimi kategorileri (7) ve isteğe bağlı açıklama, anonim seçeneği', form.kat.join('|') === 'Yanlış bilgi|Eksik bilgi|Ayet veya hadis referansı hatalı|Kaynak hatası|Açıklama yetersiz|Yazım hatası|Diğer' && form.ta && form.an, form.kat);
    await p.click('.v-sf button.p'); await bek(200);
    const uy = await p.evaluate(() => document.getElementById('b48-h').textContent);
    await p.click('.b48-kat button >> nth=2'); await p.fill('.b48-a textarea', 'Ayet numarası yanlış yazılmış.'); await p.check('.b48-an input');
    await p.screenshot({path: path.join(SH, 'icerik-hatasi-formu.png')});
    await p.click('.v-sf button.p'); await bek(600);
    const t1 = await p.evaluate(() => ({k: V48.Bildir.oku().liste[0], toast: (document.querySelector('.v-toast, .toast, [role=status]') || {}).textContent || ''}));
    const bg = t1.k.baglam;
    ok('B3 tür seçilmeden gönderilmez; gönderilen bildirim otomatik alanlarla saklanır (sınıf, müfredat, ünite, konu, kazanım, bölüm, tür, tarih, sürüm)', /bildirim türü seç/.test(uy) && t1.k.kategori === 'Ayet veya hadis referansı hatalı' && bg.sinif === 5 && bg.programYili === '2026' && /ALLAH/.test(bg.unite) && bg.konuId === 'TPC-5-1-01' && bg.kazanim.length > 0 && bg.bolum === 'anlat' && t1.k.surum === 'V48.0' && t1.k.tarih && t1.k.anonim === true && t1.k.kaynak === 'ogrenci', t1.k);
    ok('B4 sunucu bağlı değilken “gönderildi” denmez: taslak olarak cihazda kalır ve bu açıkça söylenir', t1.k.durum === 'taslak' && /sunucu bağlı olmadığı/.test(t1.toast), t1.toast);
    await p.evaluate(() => go('topic', {t: 'TPC-5-1-01', tab: 'test'})); await bek(700);
    await p.evaluate(() => { const b = [...document.querySelectorAll('#tb button')].find((x) => /Teste başla/.test(x.textContent)); b && b.click(); }); await bek(700);
    const q = await p.evaluate(() => { const d = document.querySelector('.b48-q'); const pick = d && d.parentElement.querySelector('[onclick*="MT.pick("]'); return {d: d && d.dataset.b48q, pick: pick && /MT\.pick\('[^']*','([^']+)'/.exec(pick.getAttribute('onclick'))[1], ic: !!document.querySelector('#tb > .b48-ic')}; });
    ok('B5 mini testte “Soruyu bildir” doğru soru kimliğiyle; test sekmesinde içerik düğmesi tekrarlanmaz', q.d && q.d === q.pick && !q.ic, q);
    await p.click('.b48-q'); await bek(400);
    const sk = await p.evaluate(() => [...document.querySelectorAll('.b48-kat button')].map((b) => b.textContent).join('|'));
    await p.click('.b48-kat button >> nth=0'); await p.click('.v-sf button.p'); await bek(500);
    const t2 = await p.evaluate(() => V48.Bildir.oku().liste[0]);
    ok('B6 soru bildirimi kategorileri (7) ve otomatik soru kimliği', sk === 'Doğru cevap hatalı|Soru kökü hatalı|Birden fazla doğru cevap|Şıklar hatalı|Açıklama hatalı|Kaynak veya kazanım eşleşmesi yanlış|Diğer' && t2.tur === 'soru' && t2.baglam.soruId === q.d && t2.baglam.bolum === 'test', t2.baglam);
    await p.evaluate(() => { Store.ov.wrong = {'Q-DKAB-5-0003': {n: 1}}; Store.save(); go('yanlis'); }); await bek(600);
    const yq = await p.evaluate(() => [...document.querySelectorAll('.b48-q')].map((x) => x.dataset.b48q));
    ok('B7 Yanlışlarım ekranındaki sorularda da “Soruyu bildir”', yq.includes('Q-DKAB-5-0003'), yq);
    // öğretmen kaynağı
    await p.evaluate(() => { sessionStorage.setItem('dk-ogrt-oturum', '1'); V48.Bildir.ac('icerik', 'TPC-5-1-02', '', 'ozet'); }); await bek(300);
    await p.click('.b48-kat button >> nth=1'); await p.click('.v-sf button.p'); await bek(400);
    const t3 = await p.evaluate(() => { sessionStorage.removeItem('dk-ogrt-oturum'); return V48.Bildir.oku().liste[0]; });
    ok('B8 öğretmen de bildirebilir; kaynak “öğretmen” olarak kaydedilir', t3.kaynak === 'ogretmen' && t3.baglam.konuId === 'TPC-5-1-02', t3.kaynak);
    // sunucu benzetimi: çevrimdışı taslak → sonra gönderim, çift kayıt yok
    const gelen = []; let acik = false;
    await p.route('https://sunucu.test/**', async (r) => { if (!acik) return r.abort('internetdisconnected'); const g = JSON.parse(r.request().postData() || '{}'); const yeni = !gelen.some((x) => x.id === g.id); if (yeni) gelen.push(g); await r.fulfill({status: yeni ? 201 : 200, contentType: 'application/json', headers: {'Access-Control-Allow-Origin': '*'}, body: JSON.stringify({id: g.id, durum: 'yeni', yeni})}); });
    await p.evaluate(() => localStorage.setItem('dk-hesap46', JSON.stringify({v: 1, mod: 'google', sunucu: 'https://sunucu.test', oturum: 'test-oturum-belirteci-123456', kullanici: {ad: 'Test', roller: ['ogrenci']}, surum: 0, son: '', hata: ''})));
    const n0 = await p.evaluate(() => V48.Bildir.gonderBekleyen());
    const tas0 = await p.evaluate(() => V48.Bildir.oku().liste.filter((x) => x.durum === 'taslak').length);
    acik = true;
    const n1 = await p.evaluate(() => V48.Bildir.gonderBekleyen()); const n2 = await p.evaluate(() => V48.Bildir.gonderBekleyen());
    const son = await p.evaluate(() => V48.Bildir.oku().liste.map((x) => x.durum));
    ok('B9 bağlantı yokken taslaklar kaybolmaz; bağlantı gelince gönderilir, tekrar denemede çift gönderim olmaz', n0 === 0 && tas0 === 3 && n1 === 3 && n2 === 0 && gelen.length === 3 && son.every((x) => x === 'gonderildi'), {n0, tas0, n1, n2, gelen: gelen.length});
    ok('B10 sunucuya giden bildirimde kimlik bilgisi yok (ad/e-posta istemciden gönderilmez; anonim işareti taşınır)', gelen.every((g) => !('kullanici' in g) && !('eposta' in g) && typeof g.anonim === 'boolean' && g.baglam && g.id), Object.keys(gelen[0] || {}));
    await p.evaluate(() => { localStorage.removeItem('dk-hesap46'); go('profil46'); }); await bek(500);
    const pr = await p.evaluate(() => { const s = document.querySelector('.b48-p'); return s ? s.innerText : ''; });
    ok('B11 Profilim › Bildirimlerim: liste, durum ve dışa aktarma', /Bildirimlerim/.test(pr) && /Dışa aktar/.test(pr) && /3 bildirim/.test(pr), pr.slice(0, 160));
    // editör merkezi
    const icerik0 = await p.evaluate(() => JSON.stringify(Store.get('questions', 'Q-DKAB-5-0001')) + JSON.stringify(Store.get('topics', 'TPC-5-1-01')));
    await p.evaluate(() => go('bildirim48')); await bek(500);
    const kilit = await p.evaluate(() => ({liste: !!document.querySelector('.b48-m'), pin: /PIN/i.test(document.getElementById('app').innerText)}));
    ok('B12 Hata ve Geri Bildirim Merkezi editör oturumu ister (öğrenci/öğretmen yönetemez)', !kilit.liste && kilit.pin, kilit);
    await p.evaluate(() => { sessionStorage.setItem('dk-editor-oturum38', '1'); go('editor'); }); await bek(600);
    const gir = await p.evaluate(() => !!document.querySelector('.b48-gir'));
    await p.click('.b48-gir'); await bek(500);
    await p.evaluate(() => { const L = V48.Bildir.oku(); const k = JSON.parse(JSON.stringify(L.liste.find((x) => x.tur === 'soru'))); k.id = 'ikinci-bildirim-0001'; k.kategori = 'Şıklar hatalı'; L.liste.push(k); V48.Bildir.yaz(L); V48.Bildir.Ed.ciz(); }); await bek(300);
    const ed = await p.evaluate(() => ({sek: [...document.querySelectorAll('.b48-sek button')].map((b) => b.textContent), gr: [...document.querySelectorAll('.b48-gr')].map((x) => x.textContent), n: document.querySelectorAll('.b48-e').length}));
    ok('B13 editör ana ekranında merkez girişi; Yeni / İnceleniyor / Düzeltildi / Geçersiz sekmeleri; benzer bildirimler gruplanır', gir && ed.sek.length === 4 && /Yeni/.test(ed.sek[0]) && ed.gr.some((x) => /2 benzer/.test(x)), ed);
    const id = await p.evaluate(() => V48.Bildir.oku().liste.find((x) => x.tur === 'icerik' && x.anonim).id);
    await p.evaluate((id) => V48.Bildir.Ed.secAc(id), id); await bek(300);
    await p.screenshot({path: path.join(SH, 'editor-bildirim-merkezi.png'), fullPage: true});
    await p.evaluate((id) => V48.Bildir.Ed.islem(id, 'incele'), id); await bek(200);
    await p.evaluate((id) => { G.b48.f = 'inceleniyor'; G.b48.sec = id; V48.Bildir.Ed.ciz(); }, id); await bek(200);
    await p.fill('#b48-not', 'Mushafla karşılaştırılacak.'); await p.evaluate((id) => V48.Bildir.Ed.islem(id, 'not'), id); await bek(200);
    await p.evaluate((id) => V48.Bildir.Ed.islem(id, 'gecersiz'), id); await bek(200);
    const ger0 = await p.evaluate((id) => V48.Bildir.Ed.liste().find((x) => x.id === id).edDurum, id);
    await p.fill('#b48-ger', 'Ayet numarası doğrulandı, hata yok.'); await p.evaluate((id) => V48.Bildir.Ed.islem(id, 'gecersiz'), id); await bek(200);
    const e1 = await p.evaluate((id) => { const k = V48.Bildir.Ed.liste().find((x) => x.id === id); return {d: k.edDurum, g: k.gerekce, n: k.notlar.map((x) => x.metin)}; }, id);
    ok('B14 incelemeye al → iç not → gerekçesiz kapatma reddedilir → gerekçeyle “Geçersiz / Reddedildi”', ger0 === 'inceleniyor' && e1.d === 'gecersiz' && /doğrulandı/.test(e1.g) && e1.n.includes('Mushafla karşılaştırılacak.'), e1);
    const sid = await p.evaluate(() => V48.Bildir.oku().liste.find((x) => x.tur === 'soru').id);
    await p.evaluate((id) => V48.Bildir.Ed.islem(id, 'duzeltildi'), sid); await bek(200);
    await p.evaluate((id) => V48.Bildir.Ed.git(id), sid); await bek(400);
    const sg = await p.evaluate(() => ({d: document.querySelector('.v-sheet, .v-modal') ? document.querySelector('.v-sheet, .v-modal').innerText : ''}));
    await p.evaluate(() => UI.close()); await bek(300);
    await p.evaluate((id) => V48.Bildir.Ed.git(id), id); await bek(900);
    const kg = await p.evaluate(() => ({v: view, t: G.t, tab: G.tab}));
    const icerik1 = await p.evaluate(() => JSON.stringify(Store.get('questions', 'Q-DKAB-5-0001')) + JSON.stringify(Store.get('topics', 'TPC-5-1-01')));
    ok('B15 “Soruyu gör” soruyu ve kayıtlı cevabı gösterir; “İçeriğe git” doğru konu ve bölümü açar; bildirim işlemleri içeriği değiştirmez', /Soru Q-DKAB-5-\d+/.test(sg.d) && /kayıtlı doğru cevap/.test(sg.d) && kg.v === 'topic' && kg.t === 'TPC-5-1-01' && kg.tab === 'anlat' && icerik0 === icerik1, {kg, eq: icerik0 === icerik1});
    await p.evaluate(() => go('bildirim48')); await p.setViewportSize({width: 360, height: 760}); await bek(300);
    ok('B16 bildirim formu ve editör merkezi 360 px’te taşmıyor', (await tasma(p)) <= 0);
    await ctx.close();
    const A = await sayfa({tema: 'dark'});
    await A.p.evaluate(() => go('topic', {t: 'TPC-5-1-01', tab: 'anlat'})); await bek(800);
    const aic = await A.p.evaluate(() => ({v: view, b: !!document.querySelector('#tb.p39-pane > .b48-ic')}));
    await A.p.evaluate(() => document.querySelector('.b48-ic').scrollIntoView({block: 'center'})); await bek(200);
    await A.p.screenshot({path: path.join(SH, 'altin-icerik-hatasi.png')});
    ok('B17 Altın ders ekranında da içerik ve soru bildirimi', aic.v === 'pders' && aic.b, aic);
    await A.ctx.close();
  }

  /* H. Hesap, ilerleme, yetkiler, önceki özellikler */
  {
    const prog = {'DKAB-5-U01-O01': {userId: 'local', outcomeId: 'DKAB-5-U01-O01', mastery: 0.5, correct: 1, wrong: 1}};
    const {p, ctx} = await sayfa({mod: 'normal', ek: {'dk2': {prog, wrong: {'Q-DKAB-5-0001': {n: 1}}}, 'dk-calis45': {v: 1, hedef: 30, gun: {}}, 'dk-oyun41': {v: 1, oyunlar: {kutuphane: {'5-2026-U01': {oda: 2}}}, ayar: {kalite: 'dengeli'}}}});
    const h = await p.evaluate(() => ({prog: Store.ov.prog['DKAB-5-U01-O01'], wr: Object.keys(Store.ov.wrong), hedef: V45.Calis.oku().hedef, oyun: JSON.parse(localStorage.getItem('dk-oyun41')).oyunlar.kutuphane['5-2026-U01'].oda, hesap: V46.Hesap.oku().mod, fns: ['googleGiris', 'misafir', 'esitle', 'cikis', 'paket', 'uygula'].every((f) => typeof V46.Hesap[f] === 'function'), birles: typeof V46.Hesap.birlestir}));
    ok('H1 ilerleme kayıtları (dk2, dk-calis45, dk-oyun41) V48 açılışında aynen korunur', h.prog.correct === 1 && h.prog.wrong === 1 && h.wr.includes('Q-DKAB-5-0001') && h.hedef === 30 && h.oyun === 2, h);
    ok('H2 Google / misafir giriş ve eşitleme modülü değişmeden yerinde (varsayılan misafir)', h.hesap === 'misafir' && h.fns, h);
    await p.evaluate(() => go('ogretmen')); await bek(700);
    const og = await p.evaluate(() => ({pin: !!document.querySelector('input[inputmode=numeric], .pin36, .v36-pin'), ok: V36.ok(), v: view}));
    ok('H3 öğretmen girişi PIN istemez; editör alanı ayrı PIN ister', og.v === 'ogretmen' && !og.pin, og);
    await p.evaluate(() => go('editor')); await bek(500);
    const edp = await p.evaluate(() => ({ok: V38.edOk(), t: document.getElementById('app').innerText.slice(0, 200)}));
    ok('H4 editör oturumu öğretmen oturumundan ayrı (PIN ekranı)', !edp.ok && /PIN/i.test(edp.t), edp.t.slice(0, 80));
    const kd = await p.evaluate(() => { const L = Store.all('topics').filter((t) => t.sections).slice(0, 40).map((t) => V45.KD.konu(t).kat); const kuyruk = V38.ED.cat ? 1 : 0; return {L: [...new Set(L)], kuyruk}; });
    ok('H5 V45 A/B/C kaynak doğrulama sınıflandırması çalışıyor', kd.L.every((x) => ['A', 'B', 'C', 'AB+C'].includes(x)) && kd.L.length > 0, kd);
    const yer = [];
    for (const [ad, js] of [['siniflar', "go('classes')"], ['sinif', "go('grade',{g:5})"], ['oyunlar', "go('games')"], ['sureler', "go('sd')"], ['kavram', "go('kavram')"], ['baglanti', "go('links',{lk:{tab:'harita'}})"], ['profil', "go('profil46')"], ['pek', "go('pek')"], ['dene', "go('dene')"]]) { await p.evaluate(js); await bek(450); yer.push(ad + ':' + (await p.evaluate(() => document.getElementById('app').innerText.length > 80)) + ':' + (await tasma(p))); }
    ok('H6 önceki ekranlar açılıyor ve 390 px’te taşmıyor (sınıflar, sınıf, oyunlar, sureler, kavramlar, bağlantılar, profil, pekiştir, kendini dene)', yer.every((x) => /:true:(0|-\d+)$/.test(x)), yer);
    await ctx.close();
    const A = await sayfa({tema: 'dark'});
    const ay = [];
    for (const [ad, js] of [['koridor', "go('pdunya')"], ['sinif', "go('psinif',{pg:7})"], ['unite', "go('punite',{pg:5,pu:'DKAB-5-U01'})"], ['oyun', "go('poyun')"], ['ilerleme', "go('pilerleme')"]]) { await A.p.evaluate(js); await bek(700); ay.push(ad + ':' + (await A.p.evaluate(() => view)) + ':' + (await tasma(A.p))); }
    ok('H7 Altın alan ekranları (koridor, sınıf, ünite, Oyun Dünyası, ilerleme) açılıyor, taşma yok', ay.every((x) => /:(0|-\d+)$/.test(x)), ay);
    await A.ctx.close();
  }

  ok('P1 testler boyunca sayfada JavaScript hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); srv.close();
  const g = S.filter((x) => x.ok).length; console.log(`\nToplam: ${g}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), sonuc: S}, null, 1));
  process.exitCode = g === S.length ? 0 : 1;
})().catch((e) => { console.error(e); process.exit(1); });
