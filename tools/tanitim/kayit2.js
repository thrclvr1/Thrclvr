// Tanıtım videosu 2 (V51.8) için GERÇEK uygulama ekranlarını kaydeder.
// Kullanım (depo kökünden): node tools/tanitim/kayit2.js [bölüm ...]   → tools/tanitim/.kayit2/ (depoya eklenmez)
// Bölümler: e_ (Elmas telefon), k_ (konu: öğrenme yöntemleri), g_ (etkinlik oyunları), b_ (Elmas tablet), t_ (öğretmen tablet),
//           x_ (Altın Mod “çok yakında” duyurusu için: V51.8'in gerçek “Çok yakında” ekranı + V51.7'deki gerçek Altın oyun ekranları)
// Telefon 390×844 CSS px, 3× yoğunluk (1170×2532, 4K kurgu için); tablet 820×1180 ve 1280×800, 2×.
// Yeni profil: hesap yok, kişisel veri yok, rehber baloncukları kapalı. Yönetici/editör ekranı KAYDEDİLMEZ.
// Ekranlar değiştirilmez; yalnız uygulamanın kendi işlevleri çağrılır. Her kayıt için vurgu dikdörtgenleri (CSS px) olcu2.json'a yazılır.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, '.kayit2'); fs.mkdirSync(OUT, {recursive: true});
const V518 = '/index.html', V517 = '/surumler/din-kulturu-platformu-v51.7.html';
const TUR = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp'};
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': TUR[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(0);
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const SECIM = process.argv.slice(2);
const istendi = (ad) => !SECIM.length || SECIM.some((s) => ad.startsWith(s));
const OLCU_F = path.join(__dirname, 'olcu2.json');
const OLCU = fs.existsSync(OLCU_F) ? JSON.parse(fs.readFileSync(OLCU_F, 'utf8')) : {};
let b;
const OGRT = JSON.stringify({v: 1, app: 'dkab-ogretmen', classes: [{g: 5, py: '2026'}, {g: 8, py: '2018'}], active: '5|2026', status: {}, plans: [], updatedAt: null});

async function sayfa(o) {
  o = Object.assign({mod: 'normal', tema: 'light', w: 390, h: 844, dpr: 3, ek: null, mobil: true, dosya: V518}, o || {});
  const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, deviceScaleFactor: o.dpr, isMobile: o.mobil, hasTouch: o.mobil, locale: 'tr-TR', timezoneId: 'Europe/Istanbul'});
  await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', '0'); localStorage.setItem('dk-theme', o.tema); localStorage.setItem('dk-ptema43', 'gece'); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); if (o.ek) for (const k in o.ek) localStorage.setItem(k, o.ek[k]); }, [o]);
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('  sayfa hatası:', e.message));
  await p.goto('http://127.0.0.1:' + srv.address().port + o.dosya); await p.waitForTimeout(2300);
  return {p, ctx};
}
const js = (p, kod, ms) => p.evaluate(kod).then(() => bek(ms == null ? 700 : ms));
const cek = async (p, ad) => { await p.screenshot({path: path.join(OUT, ad + '.png')}); console.log('✓', ad); };
// vurgu dikdörtgenleri (CSS px): {ad: 'seçici' | {metin:'…', sec:'…'}}
async function olc(p, ad, H) {
  OLCU[ad] = await p.evaluate((H) => {
    const o = {};
    for (const [k, v] of Object.entries(H)) {
      let el = null;
      if (typeof v === 'string') el = [...document.querySelectorAll(v)].find((x) => x.offsetParent || x.getClientRects().length);
      else el = [...document.querySelectorAll(v.sec || '#app *')].find((x) => (x.offsetParent || x.getClientRects().length) && x.textContent.replace(/\s+/g, ' ').includes(v.metin));
      if (el) { const r = el.getBoundingClientRect(); o[k] = [r.left, r.top, r.width, r.height].map((n) => Math.round(n)); } else o[k] = null;
    }
    return o;
  }, H);
  fs.writeFileSync(OLCU_F, JSON.stringify(OLCU, null, 1));
}
async function dizi(p, ad, sure, adim) {
  const d = path.join(OUT, ad); fs.rmSync(d, {recursive: true, force: true}); fs.mkdirSync(d, {recursive: true});
  const n = Math.round(sure * 30);
  for (let i = 0; i < n; i++) { if (adim) await adim(i, n); await p.clock.runFor(1000 / 30); await p.screenshot({path: path.join(d, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 90}); }
  console.log('✓', ad, n, 'kare');
}
async function kaydir(p, ad, y1, n) {
  const d = path.join(OUT, ad); fs.rmSync(d, {recursive: true, force: true}); fs.mkdirSync(d, {recursive: true});
  const y0 = await p.evaluate(() => scrollY), enfazla = await p.evaluate(() => document.scrollingElement.scrollHeight - innerHeight);
  for (let i = 0; i < n; i++) {
    const y = Math.round(y0 + (Math.min(y1, enfazla) - y0) * i / (n - 1));
    await p.evaluate((y) => document.scrollingElement.scrollTo({top: y, behavior: 'instant'}), y); await bek(50);
    await p.screenshot({path: path.join(d, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 90});
  }
  console.log('✓', ad, n, 'kare');
}
async function adimli(p, ad, L) {
  const d = path.join(OUT, ad); fs.rmSync(d, {recursive: true, force: true}); fs.mkdirSync(d, {recursive: true});
  const meta = [];
  for (let i = 0; i < L.length; i++) { const [is, sure, bekle] = L[i]; if (is) await p.evaluate(is); await bek(bekle == null ? 450 : bekle); const f = String(i).padStart(4, '0') + '.jpg'; await p.screenshot({path: path.join(d, f), type: 'jpeg', quality: 92}); meta.push({f, sure}); }
  fs.writeFileSync(path.join(d, 'meta.json'), JSON.stringify(meta)); console.log('✓', ad, L.length, 'adım');
}
const KONU = 'TPC-5-2-01';  // “Namaz İbadeti ve Önemi”: anlatım, özet, 30 sn, hikâye, kodlama, tablo, karışanlar, kartlar, oyun, mini test, sınav
const sekme = (k) => `(()=>{go('topic',{t:'${KONU}',tab:'${k}'});scrollTo(0,0)})()`;
const tabUst = "(()=>{const e=document.querySelector('#app .seg46');if(e)scrollTo(0,e.getBoundingClientRect().top+scrollY-64)})()";

(async () => {
  await new Promise((r) => srv.once('listening', r));
  b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist']});

  /* ---------- Elmas: ana sayfa, sınıflar, arama, sözlükler, çalışma ---------- */
  if (istendi('e_')) {
    const {p, ctx} = await sayfa({});
    await js(p, "go('home');scrollTo(0,0)"); await cek(p, 'e_ana');
    await olc(p, 'e_ana', {ara: '#app .search', ders: {metin: 'Derslerim', sec: '#app button'}, oyun: {metin: 'Oyunlar', sec: '#app button'}, calis: {metin: 'Çalışmam', sec: '#app button'}, profil: {metin: 'Profilim', sec: '#app button'}, hizli: {metin: 'Sureler ve Dualar', sec: '#app button'}});
    await kaydir(p, 'e_ana_kaydir', 420, 45); await js(p, 'scrollTo(0,0)', 300);
    await js(p, "go('classes');scrollTo(0,0)"); await cek(p, 'e_siniflar');
    await olc(p, 'e_siniflar', {s5: {metin: '5', sec: '#app .gc3, #app .gcard, #app button'}});
    await js(p, "go('grade',{g:5});scrollTo(0,0)"); await cek(p, 'e_sinif5');
    await olc(p, 'e_sinif5', {hero: '#app .hero'});
    await js(p, "(()=>{const e=[...document.querySelectorAll('#app *')].find(x=>x.children.length<4&&/Namaz İbadeti ve Önemi/.test(x.textContent));if(e)scrollTo(0,e.getBoundingClientRect().top+scrollY-300)})()"); await cek(p, 'e_sinif5_unite');
    await olc(p, 'e_sinif5_unite', {konu: {metin: 'Namaz İbadeti ve Önemi', sec: '#app button, #app a, #app .trow'}});
    // arama: “namaz” yazılır
    await js(p, "go('search',{q:''});scrollTo(0,0)", 800);
    const L = [[null, 0.4]]; let q = '';
    for (const h of 'namaz') { q += h; L.push([`(()=>{const i=document.getElementById('q2');i.value=${JSON.stringify(q)};i.dispatchEvent(new Event('input',{bubbles:true}));V30.sq(${JSON.stringify(q)})})()`, 0.16, 380]); }
    L.push([null, 1.2, 300]);
    await adimli(p, 'e_arama', L);
    await olc(p, 'e_arama', {kutu: '#q2', sonuc: '#app .s30-r', cips: '#app .s30-f, #app .chips'});
    await js(p, "go('kavram');scrollTo(0,0)", 800); await cek(p, 'e_kavram');
    await js(p, "go('kisi');scrollTo(0,0)", 800); await cek(p, 'e_kisi');
    await js(p, "scrollTo(0,420)", 500); await cek(p, 'e_kisi_liste');
    await js(p, "go('pek');scrollTo(0,0)", 800); await cek(p, 'e_pek');
    await olc(p, 'e_pek', {kart: {metin: 'Bilgi Kartları', sec: '#app button'}, kod: {metin: 'Kodlama', sec: '#app button'}, hik: {metin: 'Hikâyeler', sec: '#app button'}});
    await js(p, "go('dene');scrollTo(0,0)", 800); await cek(p, 'e_dene');
    await olc(p, 'e_dene', {mini: {metin: 'Mini Test', sec: '#app button'}, karma: {metin: 'Karma Test', sec: '#app button'}, yanlis: {metin: 'Yanlışlarım', sec: '#app button'}, rehber: {metin: 'Sınav Rehberi', sec: '#app button'}});
    await js(p, "(()=>{const b=[...document.querySelectorAll('#app button')].find(x=>/Sınav Rehberi/.test(x.textContent));b&&b.click()})()", 900); await cek(p, 'e_sinav_rehberi');
    await js(p, "go('calis45');scrollTo(0,0)", 900); await cek(p, 'e_calis');
    await js(p, "go('pilerleme');scrollTo(0,0)", 900); await cek(p, 'e_ilerleme');
    await js(p, "go('games');scrollTo(0,0)", 900); await cek(p, 'e_oyunlar');
    await olc(p, 'e_oyunlar', {hero: '#app .hero, #app section'});
    await js(p, "scrollTo(0,330)", 500); await cek(p, 'e_oyunlar_turler');
    await ctx.close();
  }

  /* ---------- konu: öğrenme yöntemleri ---------- */
  if (istendi('k_')) {
    const {p, ctx} = await sayfa({});
    await js(p, sekme('anlat'), 900); await cek(p, 'k_anlat');
    await olc(p, 'k_anlat', {baslik: '#app h1', seg: '#app .seg46', tabs: '#app .tabs'});
    await kaydir(p, 'k_anlat_kaydir', 900, 60);
    for (const [k, ad] of [['ozet', 'k_ozet'], ['otuz', 'k_otuz'], ['hik', 'k_hik'], ['kod', 'k_kod'], ['tab', 'k_tablo'], ['kar', 'k_kar'], ['sin', 'k_sin']]) {
      await js(p, sekme(k), 900); await js(p, tabUst, 500); await cek(p, ad);
      await olc(p, ad, {sekme: '#app .tabs button.on, #app .tabs [aria-selected="true"], #app .tabs .on', seg: '#app .seg46'});
    }
    await js(p, sekme('kart'), 900); await js(p, "document.querySelector('.fx-card').scrollIntoView({block:'center'})"); await cek(p, 'k_kart_soru');
    await js(p, "document.querySelector('.fx-card').click()", 900); await cek(p, 'k_kart_cevap');
    // not: .fx-card ilk durumda hangi yüzün göründüğü uygulamaya bağlıdır; kurguda iki kare sırayla kullanılır
    await js(p, sekme('test'), 900);
    await adimli(p, 'k_test', [
      [null, 0.8],
      ["(()=>{document.querySelector('#app [onclick^=\"MT.start\"]').click()})()", 0.1, 900],
      ["(()=>{const o=document.querySelector('#app .opt');const r=o.getBoundingClientRect();scrollBy(0,r.top-330)})()", 1.6, 600],
      ["(()=>{const B=[...document.querySelectorAll('#app .opt')];const m=/MT.pick\\('[^']+','([^']+)'/.exec(B[0].getAttribute('onclick'));const q=Store.get('questions',m[1]);B[q.answer].click()})()", 2.0, 900]
    ]);
    await olc(p, 'k_test', {dogru: {metin: 'Doğru', sec: '#app .card, #app div'}});
    await js(p, sekme('anlat'), 900); await js(p, "document.querySelector('.kg513').scrollIntoView({block:'center'})"); await cek(p, 'k_gecis');
    await olc(p, 'k_gecis', {kg: '#app .kg513'});
    await ctx.close();
  }

  /* ---------- etkinlik oyunları (Elmas) ---------- */
  if (istendi('g_')) {
    const {p, ctx} = await sayfa({});
    const oyun = async (tur) => p.evaluate((tur) => { const g = gList().find((x) => x.gameType === tur && +x.grade === 5) || gList().find((x) => x.gameType === tur); playGame(g.id); return g.id; }, tur);
    // eşleştirme: soldan kavram, sağdan karşılığı
    const id = await oyun('matching'); await bek(900);
    const ciftler = await p.evaluate((id) => (gList().find((x) => x.id === id).pairs || []).slice(0, 3), id);
    const tik = (metin) => `(()=>{const t=${JSON.stringify(metin)};const B=[...document.querySelectorAll('#gp-body button')].filter(x=>x.offsetParent&&!x.disabled);const b=B.find(x=>x.textContent.trim()===t)||B.find(x=>x.textContent.includes(t));b&&b.click()})()`;
    const AD = [[null, 0.6]];
    for (const [a, c] of ciftler) { AD.push([tik(a), 0.35, 450]); AD.push([tik(c), 0.55, 650]); }
    await adimli(p, 'g_esles', AD);
    await olc(p, 'g_esles', {hud: '#app .gx-hud', govde: '#gp-body'});
    // doğru cevabı bul: doğru şık denenerek bulunur (yanlışsa oyun yeniden başlatılır)
    let bulundu = false;
    for (let i = 0; i < 4 && !bulundu; i++) {
      await oyun('quiz'); await bek(800);
      if (i === 0) await cek(p, 'g_quiz_soru');
      await p.evaluate((i) => { const B = [...document.querySelectorAll('#gp-body button')].filter((x) => x.offsetParent && /^[A-D]/.test(x.textContent.trim()) || x.classList.contains('gx-op')); (B[i] || B[0]).click(); }, i); await bek(700);
      bulundu = await p.evaluate(() => /Doğru|Tebrik|\+\d+/.test(document.getElementById('gp-body').innerText) && !/Yanlış/.test(document.getElementById('gp-body').innerText));
      if (bulundu) await cek(p, 'g_quiz_dogru');
    }
    if (!bulundu) await cek(p, 'g_quiz_dogru');
    await olc(p, 'g_quiz_dogru', {hud: '#app .gx-hud', govde: '#gp-body'});
    // çarkıfelek: çevir (sahte saat, 30 fps)
    await oyun('wheel'); await bek(900); await cek(p, 'g_cark');
    await p.clock.install();
    await dizi(p, 'g_cark_don', 3.0, async (i) => { if (i === 2) await p.evaluate(() => { const b = [...document.querySelectorAll('#gp-body button')].find((x) => /Çevir|çevir/.test(x.textContent)); b && b.click(); }); });
    await p.clock.resume(); await bek(400);
    await oyun('wordsearch'); await bek(900); await cek(p, 'g_kelime');
    await oyun('ordering'); await bek(900); await cek(p, 'g_sirala');
    await oyun('grouping'); await bek(900); await cek(p, 'g_grup');
    await ctx.close();
  }

  /* ---------- Elmas tablet (dikey ve yatay) ---------- */
  if (istendi('b_')) {
    {
      const {p, ctx} = await sayfa({w: 820, h: 1180, dpr: 2});
      await js(p, "go('home');scrollTo(0,0)"); await cek(p, 'b_ana');
      await js(p, sekme('anlat'), 900); await cek(p, 'b_konu');
      await js(p, "go('games');scrollTo(0,0)", 900); await cek(p, 'b_oyunlar');
      await ctx.close();
    }
    {
      const {p, ctx} = await sayfa({w: 1180, h: 820, dpr: 2});
      await js(p, sekme('ozet'), 900); await cek(p, 'b_ozet_yatay');
      await ctx.close();
    }
  }

  /* ---------- öğretmen (tablet, dikey 820×1180; 1180 px üstü yatay düzende konu ekranı daralıyor) — editör/yönetici ekranı yok ---------- */
  if (istendi('t_')) {
    const {p, ctx} = await sayfa({w: 820, h: 1180, dpr: 2, mobil: true, ek: {'dk-ogretmen-v1': OGRT}});
    await js(p, "V36.ss(V36.SK,'1');go('ogretmen')", 1000);
    await js(p, "(()=>{[...document.querySelectorAll('#app .og-main [role=tab]')].find(x=>/Haftalık/.test(x.textContent)).click()})()", 700);
    await js(p, "(()=>{const b=[...document.querySelectorAll('.ogw-wk')].find(x=>/^10\\. Hafta/.test(x.textContent.trim()));b&&b.click()})()", 900); await cek(p, 't_haftalik');
    await olc(p, 't_haftalik', {hafta: '.ogw-wk.on, .ogw-wk[aria-current], .ogw-wk.sec', serit: '.ogw-wk'});
    await olc(p, 't_haftalik_k', {kazanim: {metin: 'KAZANIM', sec: '#app section, #app article, #app .card, #app div'}});
    await js(p, "(()=>{const H=[...document.querySelectorAll('#app section,#app article,#app .card,#app div')].filter(x=>x.offsetParent&&/^\\s*KAZANIM/.test(x.textContent));const e=H[H.length-1];if(e)e.scrollIntoView({block:'center'})})()", 700); await cek(p, 't_kazanim');
    await olc(p, 't_kazanim', {kazanim: {metin: 'KAZANIM', sec: '#app section, #app article, #app .card'}});
    await js(p, "scrollTo(0,0);(()=>{[...document.querySelectorAll('#app .og-main [role=tab]')].find(x=>/Sınıflarım/.test(x.textContent)).click()})()", 900); await cek(p, 't_siniflar');
    await olc(p, 't_siniflar', {sinif5: {metin: 'Takvime göre geçilen', sec: '#app .card, #app article, #app div'}});
    await js(p, "V51.Gorunum.ac('" + KONU + "')", 1200); await cek(p, 't_gorunum');
    await olc(p, 't_gorunum', {bilgi: {metin: 'Öğretmen bilgisi', sec: '#app section, #app .card, #app article'}, kazanim: {metin: 'MEB kazanımları', sec: '#app section, #app .card, #app article'}});
    await ctx.close();
  }

  /* ---------- Altın Mod duyurusu: gerçek “Çok yakında” ekranı (V51.8) ve Altın'a özel oyunların gerçek ekranları (V51.7) ---------- */
  if (istendi('x_')) {
    {
      const {p, ctx} = await sayfa({tema: 'light'});
      await js(p, "V50.Mod.gec('altin')", 1500); await cek(p, 'x_yakinda');
      const emb = await p.evaluate(() => V31.EMB && V31.EMB.s512);
      if (emb) { fs.writeFileSync(path.join(OUT, 'emb.png'), Buffer.from(emb.split(',')[1], 'base64')); console.log('✓ emb'); }
      await ctx.close();
    }
    {
      const {p, ctx} = await sayfa({mod: 'premium', tema: 'dark', dosya: V517});
      await js(p, "go('pdunya')", 1800); await cek(p, 'x_koridor');
      await p.clock.install();
      await dizi(p, 'x_koridor_yuru', 2.4, async (i) => { if (i === 2) await p.evaluate(() => V40.adim(1)); });
      await p.clock.resume();
      await js(p, "go('poyun');scrollTo(0,0)", 1200); await cek(p, 'x_oyun_dunyasi');
      await js(p, "go('poyna',{oyn:'kutuphane',obol:'5-2026-U01'})", 3500); await js(p, 'V41.oyunlar.kutuphane.girisBitti()', 4000); await cek(p, 'x_kutuphane_oda');
      await p.clock.install();
      await dizi(p, 'x_kutuphane_don', 2.6, async (i) => { if (i === 3) await p.evaluate(() => V41.oyunlar.kutuphane.don(40)); });
      await p.clock.resume(); await bek(600);
      await js(p, "go('poyna',{oyn:'dunya45',obol:'g5'})", 3500); await cek(p, 'x_dunya');
      await ctx.close();
    }
  }
  await b.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
