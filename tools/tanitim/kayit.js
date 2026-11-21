// Tanıtım videosu için GERÇEK uygulama ekranlarını kaydeder (V51.7, index.html).
// Kullanım (depo kökünden): node tools/tanitim/kayit.js [bölüm ...]   → tools/tanitim/.kayit/ (depoya eklenmez)
// Telefon ekranları 390×844 CSS px, 2× piksel yoğunluğu (780×1688); öğretmen/editör 1280×800, 1,5×.
// Yeni profil: hesap girişi yok, kişisel veri yok; rehber baloncukları kapalı. Canlı akışlar Playwright sahte saatiyle
// kare kare (30 fps) yakalanır. Hiçbir ekran yeniden çizilmez/değiştirilmez; yalnız uygulamanın kendi işlevleri çağrılır.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, '.kayit'); fs.mkdirSync(OUT, {recursive: true});
const TUR = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp'};
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': TUR[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(0);
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const SECIM = process.argv.slice(2);
const istendi = (ad) => !SECIM.length || SECIM.some((s) => ad.startsWith(s));
let b;
const OGRT = JSON.stringify({v: 1, app: 'dkab-ogretmen', classes: [{g: 5, py: '2026'}, {g: 8, py: '2018'}], active: '5|2026', status: {}, plans: [], updatedAt: null});

async function sayfa(o) {
  o = Object.assign({mod: 'normal', tema: 'light', w: 390, h: 844, dpr: 2, ek: null, mobil: true, lite: '0'}, o || {});
  const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, deviceScaleFactor: o.dpr, isMobile: o.mobil, hasTouch: o.mobil, locale: 'tr-TR', timezoneId: 'Europe/Istanbul'});
  await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', o.lite); localStorage.setItem('dk-theme', o.tema); localStorage.setItem('dk-ptema43', 'gece'); localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); if (o.mod !== 'yeni') localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); if (o.ek) for (const k in o.ek) localStorage.setItem(k, o.ek[k]); }, [o]);
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('  sayfa hatası:', e.message));
  await p.goto('http://127.0.0.1:' + srv.address().port + '/index.html'); await p.waitForTimeout(2200);
  return {p, ctx};
}
const js = (p, kod, ms) => p.evaluate(kod).then(() => bek(ms == null ? 700 : ms));
const cek = async (p, ad, o) => { await p.screenshot(Object.assign({path: path.join(OUT, ad + '.png')}, o || {})); console.log('✓', ad); };
// kare dizisi: sahte saatle 30 fps
async function dizi(p, ad, sure, adim, hazirla) {
  const d = path.join(OUT, ad); fs.rmSync(d, {recursive: true, force: true}); fs.mkdirSync(d, {recursive: true});
  const n = Math.round(sure * 30);
  for (let i = 0; i < n; i++) {
    if (adim) await adim(i, n);
    await p.clock.runFor(1000 / 30);
    await p.screenshot({path: path.join(d, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 90});
  }
  console.log('✓', ad, n, 'kare');
}
// gerçek kaydırma dizisi: sayfa adım adım kaydırılır, her adımda görünür alan kaydedilir (sabit alt menü yerinde kalır)
async function kaydir(p, ad, y1, n) {
  const d = path.join(OUT, ad); fs.rmSync(d, {recursive: true, force: true}); fs.mkdirSync(d, {recursive: true});
  const enfazla = await p.evaluate(() => document.scrollingElement.scrollHeight - innerHeight);
  for (let i = 0; i < n; i++) {
    const y = Math.round(Math.min(y1, enfazla) * i / (n - 1));
    await p.evaluate((y) => document.scrollingElement.scrollTo({top: y, behavior: 'instant'}), y); await bek(60);
    await p.screenshot({path: path.join(d, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 90});
  }
  await p.evaluate(() => scrollTo(0, 0)); console.log('✓', ad, n, 'kare');
}
// gerçek zamanlı kare dizisi (yazma, dokunma) — her kare kendi süresiyle (sn)
async function adimli(p, ad, L) {
  const d = path.join(OUT, ad); fs.rmSync(d, {recursive: true, force: true}); fs.mkdirSync(d, {recursive: true});
  const meta = [];
  for (let i = 0; i < L.length; i++) { const [is, sure, bekle] = L[i]; if (is) await p.evaluate(is); await bek(bekle == null ? 450 : bekle); const f = String(i).padStart(4, '0') + '.jpg'; await p.screenshot({path: path.join(d, f), type: 'jpeg', quality: 92}); meta.push({f, sure}); }
  fs.writeFileSync(path.join(d, 'meta.json'), JSON.stringify(meta)); console.log('✓', ad, L.length, 'adım');
}

(async () => {
  await new Promise((r) => srv.once('listening', r));
  b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist']});

  /* ---------- Elmas (açık tema) ---------- */
  if (istendi('e_')) {
    const {p, ctx} = await sayfa({mod: 'normal', tema: 'light'});
    await js(p, "go('home');scrollTo(0,0)"); await cek(p, 'e_ana');
    await kaydir(p, 'e_ana_kaydir', 600, 60);
    await js(p, "go('classes')"); await cek(p, 'e_siniflar');
    await js(p, "go('grade',{g:5});scrollTo(0,0)"); await cek(p, 'e_sinif5');
    await js(p, "go('grade',{g:5});scrollTo(0,520)"); await cek(p, 'e_sinif5_unite');
    await js(p, "go('topic',{t:'TPC-5-2-02',tab:'anlat'});scrollTo(0,0)", 900); await cek(p, 'e_konu');
    await js(p, "scrollTo(0,560)"); await cek(p, 'e_konu_metin');
    await js(p, "document.querySelector('.kg513').scrollIntoView({block:'center'})"); await cek(p, 'e_konu_gecis');
    await js(p, "go('topic',{t:'TPC-5-2-02',tab:'kart'});scrollTo(0,0)", 900); await js(p, "document.querySelector('.fx-card').scrollIntoView({block:'center'})"); await cek(p, 'e_kart_on');
    await js(p, "document.querySelector('.fx-card').click()", 900); await cek(p, 'e_kart_arka');
    await js(p, "go('games');scrollTo(0,0)", 900); await cek(p, 'e_oyunlar');
    await js(p, "go('calis45');scrollTo(0,0)", 900); await cek(p, 'e_calis');
    await js(p, "go('profil46');scrollTo(0,0)", 900); await cek(p, 'e_profil');
    await js(p, "go('home');scrollTo(0,0)"); await js(p, "V50.Mod.ac()", 900); await cek(p, 'e_mod_paneli'); await js(p, 'UI.close()');
    // arama: “abdest” harf harf (gerçek zamanlı)
    await js(p, "go('search',{q:''});scrollTo(0,0)", 800);
    const L = [[null, 0.5]]; let q = '';
    for (const h of 'abdest') { q += h; L.push([`(()=>{const i=document.getElementById('q2');i.value=${JSON.stringify(q)};i.dispatchEvent(new Event('input',{bubbles:true}));V30.sq(${JSON.stringify(q)})})()`, 0.18, 380]); }
    L.push([null, 1.4, 300]);
    await adimli(p, 'e_arama', L);
    // mini test: başlat → cevapla
    await js(p, "go('topic',{t:'TPC-5-2-02',tab:'test'});scrollTo(0,0)", 900);
    await adimli(p, 'e_test', [
      [null, 0.8],
      ["(()=>{document.querySelector('#app [onclick^=\"MT.start\"]').click()})()", 0.1, 900],
      ["(()=>{const o=document.querySelector('#app .opt');const r=o.getBoundingClientRect();scrollBy(0,r.top-330)})()", 1.6, 600],
      ["(()=>{const B=[...document.querySelectorAll('#app .opt')];const m=/MT.pick\\('[^']+','([^']+)'/.exec(B[0].getAttribute('onclick'));const q=Store.get('questions',m[1]);B[q.answer].click()})()", 2.0, 900]
    ]);
    await ctx.close();
  }
  /* ---------- Altın (gece) ---------- */
  if (istendi('a_')) {
    const {p, ctx} = await sayfa({mod: 'premium', tema: 'dark'});
    await js(p, "go('pdunya')", 1800); await cek(p, 'a_koridor');
    // koridorda yürüyüş (WebGL; sahte saat)
    await p.clock.install();
    await dizi(p, 'a_koridor_yuru', 4.0, async (i) => { if (i === 2) await p.evaluate(() => V40.adim(1)); if (i === 50) await p.evaluate(() => V40.adim(1)); });
    await p.clock.resume();
    await js(p, "go('psinif',{pg:5});scrollTo(0,0)", 1200); await cek(p, 'a_sinif5');
    await js(p, "scrollTo(0,640)"); await cek(p, 'a_sinif5_uniteler');
    await js(p, "go('punite',{pg:5,pu:'DKAB-5-U02'});scrollTo(0,0)", 1000); await cek(p, 'a_unite');
    await js(p, "go('pders',{pt:'TPC-5-2-02',ptab:''});scrollTo(0,0)", 1000); await cek(p, 'a_ders');
    await js(p, "scrollTo(0,620)"); await cek(p, 'a_ders_metin');
    await js(p, "go('poyun');scrollTo(0,0)", 1200); await cek(p, 'a_oyun_dunyasi');
    await kaydir(p, 'a_oyun_kaydir', 560, 60);
    await js(p, "go('games');scrollTo(0,0)", 900); await cek(p, 'a_etkinlik');
    await js(p, "go('pilerleme');scrollTo(0,0)", 1000); await cek(p, 'a_ilerleme');
    await js(p, "go('pdunya')", 1500); await js(p, "V39.ara()", 600);
    await js(p, "(()=>{const i=document.getElementById('p39q');i.value='abdest';V39.araSonuc('abdest')})()", 900); await cek(p, 'a_arama');
    await js(p, 'UI.close()', 600);
    await ctx.close();
  }
  /* ---------- Altın: 3B oyunlar ---------- */
  if (istendi('o_')) {
    const {p, ctx} = await sayfa({mod: 'premium', tema: 'dark'});
    await js(p, "go('poyna',{oyn:'kutuphane',obol:'5-2026-U01'})", 3500); await cek(p, 'o_kutuphane');
    await js(p, "V41.oyunlar.kutuphane.girisBitti()", 4000); await cek(p, 'o_kutuphane_oda');
    await p.clock.install();
    await dizi(p, 'o_kutuphane_don', 3.4, async (i) => { if (i === 3) await p.evaluate(() => V41.oyunlar.kutuphane.don(40)); if (i === 52) await p.evaluate(() => V41.oyunlar.kutuphane.don(-40)); });
    await p.clock.resume(); await bek(800);
    await js(p, "(()=>{const n=[...document.querySelectorAll('#app .o41-nes')].find(x=>x.offsetParent&&!x.classList.contains('gz'));n&&n.click()})()", 1500); await cek(p, 'o_kutuphane_nesne');
    await js(p, "go('poyna',{oyn:'dunya45',obol:'g5'})", 3500); await cek(p, 'o_dunya');
    await js(p, "go('games');scrollTo(0,0)", 900);
    await js(p, "(()=>{const b=[...document.querySelectorAll('#app [onclick^=\"playGame\"]')].find(x=>/Doğru cevabı bul|doğru/i.test(x.textContent))||document.querySelector('#app [onclick^=\"playGame\"]');b.click()})()", 1200);
    await cek(p, 'o_etkinlik_oyun');
    await js(p, "(()=>{const B=[...document.querySelectorAll('#app button')].filter(x=>x.offsetParent&&/^[A-D]/.test(x.textContent.trim()));(B[0]||{}).click&&B[0].click()})()", 900);
    await cek(p, 'o_etkinlik_oyun_cevap');
    await ctx.close();
  }
  /* ---------- Öğretmen ve editör (tablet, yatay) ---------- */
  if (istendi('t_')) {
    const {p, ctx} = await sayfa({mod: 'normal', tema: 'light', w: 1280, h: 800, dpr: 1.5, mobil: false, ek: {'dk-ogretmen-v1': OGRT}});
    await js(p, "V36.ss(V36.SK,'1');go('ogretmen')", 1000);
    await js(p, "(()=>{[...document.querySelectorAll('#app .og-main [role=tab]')].find(x=>/Haftalık/.test(x.textContent)).click()})()", 700);
    await js(p, "(()=>{const b=[...document.querySelectorAll('.ogw-wk')].find(x=>/^10\\. Hafta/.test(x.textContent.trim()));b&&b.click()})()", 900); await cek(p, 't_haftalik');
    await js(p, "(()=>{[...document.querySelectorAll('#app .og-main [role=tab]')].find(x=>/Sınıflarım/.test(x.textContent)).click()})()", 900); await cek(p, 't_siniflar');
    await js(p, "(()=>{[...document.querySelectorAll('#app .og-main [role=tab]')].find(x=>/Araçlar/.test(x.textContent)).click()})()", 900); await cek(p, 't_araclar');
    await js(p, "go('ogara',{});V51.Ara.ogrQ('namaz');document.getElementById('ar514-q').value='namaz'", 1000); await cek(p, 't_arama');
    await js(p, "sessionStorage.setItem('dk-editor-oturum38','1');V36.ss(V36.SK,null)", 300);
    await p.evaluate(async () => { for (let i = 0; i < 60 && !V38.isReady; i++) await new Promise((r) => setTimeout(r, 100)); });
    await js(p, "go('editor')", 1000); await cek(p, 'ed_ana');
    await js(p, "V38.edGo({k:'bekleyen',cid:'',mode:''})", 1000); await cek(p, 'ed_liste');
    await js(p, "document.querySelector('#app .ed38-row').click()", 1100); await cek(p, 'ed_kayit');
    await js(p, "V38.edGo({k:'yayin51',cid:'',mode:''})", 1000); await cek(p, 'ed_yayin');
    await ctx.close();
  }
  /* ---------- açılış: mod seçim ekranı ---------- */
  if (istendi('s_')) {
    const {p, ctx} = await sayfa({mod: 'yeni', tema: 'dark'});
    await bek(800); await cek(p, 's_secim');
    // uygulamanın kendi amblemi (V31.EMB.s512) — açılış ve kapanış logosu için
    const emb = await p.evaluate(() => V31.EMB && V31.EMB.s512);
    if (emb) { fs.writeFileSync(path.join(OUT, 'emb.png'), Buffer.from(emb.split(',')[1], 'base64')); console.log('✓ emb'); }
    await ctx.close();
  }
  await b.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
