// V47 WCAG AA denetimi (V46 denetimi + V47 ekranları: Elmas ana sayfa modülleri, Sınıflar, Altın koridor araç şeridi, Görünüm ve ses ayarlarının beş bölümü, Ders Atmosferi). Kullanım (depo kökünden): node tools/v47/denetim.js [html] [çıktı.json] [süzgeç]
// V42 denetiminden farkları:
//  - Ekranın TAMAMI ölçülür: pencere, sayfanın ya da açık panelin içerik yüksekliğine uzatılır (kaydırınca görünen kısımlar dahil).
//  - Cam efektli yol da ölçülür: “hafif mod” (html.lite; ≤4 çekirdek/≤4 GB cihazda kendiliğinden açılır ve cam yüzeyleri
//    opak yapar) KAPALI iken de ölçülür. V42 testleri yalnızca hafif modda çalıştığı için telefondaki sorunu göremedi.
//  - Premium ekranlar Gündüz ve Gece modunda, Klasik temanın açık/koyu durumuyla birlikte ölçülür.
// Yöntem: yazı rengi (opaklık zinciri dahil) ile yazılar gizlenip alınan ekran görüntüsündeki gerçek zemin (kutudaki piksellerin
// medyanı) karşılaştırılır. Eşik: normal 4.5, büyük yazı (≥24 px ya da ≥18.66 px kalın) 3.0. Devre dışı öğeler hariç.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const DOSYA = process.argv[2] || 'index.html', CIKTI = process.argv[3] || path.join(__dirname, 'denetim_sonuc.json'), SUZ = process.argv[4] ? new RegExp(process.argv[4]) : null;
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
const TMP = path.join(__dirname, '.d'); fs.mkdirSync(TMP, {recursive: true});
const T = (t) => `go('pders',{pt:'TPC-5-1-01',ptab:'${t}'})`;
const P = [ // Premium ekranları
  ['koridor', "go('pdunya')"], ['profil', "go('pdunya');setTimeout(()=>V40.profil(),300)"], ['yardim', "go('pdunya');setTimeout(()=>V40.yardim(),300)"],
  ['ses', "go('pdunya');setTimeout(()=>V37.sndOpen(),300)"], ['ses-calar', "go('pdunya');setTimeout(()=>{V37.sndOpen();setTimeout(()=>V42.muzikCal('esik'),200)},300)"],
  ['tum-sesler', "go('pdunya');setTimeout(()=>ATM.open(),300)"], ['arama', "go('psinif',{pg:5});setTimeout(()=>{V39.ara();setTimeout(()=>{const i=document.getElementById('p39q');i.value='düzen';i.dispatchEvent(new Event('input'))},200)},300)"],
  ['degistir', "go('pdunya');setTimeout(()=>V42.degistir(),300)"], ['sinif', "go('psinif',{pg:5})"], ['unite', "go('punite',{pg:5,pu:'DKAB-5-U01'})"],
  ['ders-anlat', T('anlat')], ['ders-ozet', T('ozet')], ['ders-otuz', T('otuz')], ['ders-kod', T('kod')], ['ders-hik', T('hik')], ['ders-tab', T('tab')], ['ders-kar', T('kar')], ['ders-sin', T('sin')], ['ders-test', T('test')],
  ['ozet', "go('pozet',{pg:5})"], ['ilerleme', "go('pilerleme')"], ['favoriler', "go('pfav')"], ['oyun-merkezi', "go('poyun')"],
  ['oyun-giris', "go('poyna',{oyn:'kutuphane',obol:'5-2026-U01',odevam:0})"], ['oyun-menu', "go('poyna',{oyn:'kutuphane',obol:'5-2026-U01',odevam:0});setTimeout(()=>{V41.oyunlar.kutuphane.girisBitti();setTimeout(()=>V41.duraklat('kullanici'),900)},500)"],
  ['oyunlar', "go('games')"], ['oyun-listesi', "G.gf=Object.assign({},G.gf||{},{g:5,t:'TPC-5-1-01'});go('games')"], ['dene', "go('dene')"], ['mini-test-kur', "G.tq={mode:'mini',g:5,u:'',t:'TPC-5-1-01',n:5};go('test')"],
  ['oyun-merkezi-44', "go('poyun')"], ['zaman-bolum', "go('poyna',{oyn:'zaman',obol:'',odevam:0})"],
  ['zaman-giris', "go('poyna',{oyn:'zaman',obol:V41.oyunlar.zaman.bolumler()[0].id,odevam:0})"],
  ['zaman-sira', "go('poyna',{oyn:'zaman',obol:V41.oyunlar.zaman.bolumler()[0].id,odevam:0});setTimeout(()=>document.querySelector('[data-sev=kolay]').click(),400)"],
  ['lab-bolum', "go('poyna',{oyn:'lab',obol:'',odevam:0})"],
  ['lab-gorev', "go('poyna',{oyn:'lab',obol:V41.oyunlar.lab.bolumler().find(b=>b.hazir).id,odevam:0});setTimeout(()=>document.querySelector('[data-sev=kolay]').click(),400)"],
  ['giris-44', "go('pdunya');setTimeout(()=>V44.giris(),300)"],
  ['dunya-secim', "go('poyna',{oyn:'dunya45',obol:'',odevam:0})"], ['dunya-harita', "go('poyna',{oyn:'dunya45',obol:'g8',odevam:0})"],
  ['dunya-bolge', "go('poyna',{oyn:'dunya45',obol:'g5',odevam:0});setTimeout(()=>V45.Dunya.bolge(V45.Dunya.uniteler(5)[0].id),400)"],
  ['dunya-not', "go('poyna',{oyn:'dunya45',obol:'g4',odevam:0});setTimeout(()=>{V45.Dunya.bolge(V45.Dunya.uniteler(4)[0].id);setTimeout(()=>V45.Dunya.nokta('not0'),200)},400)"],
  ['dunya-soru', "go('poyna',{oyn:'dunya45',obol:'g11',odevam:0});setTimeout(()=>{V45.Dunya.bolge(V45.Dunya.uniteler(11)[0].id);setTimeout(()=>V45.Dunya.nokta('kar0'),200)},400)"],
  ['dunya-bulmaca', "go('poyna',{oyn:'dunya45',obol:'g9',odevam:0});setTimeout(()=>{V45.Dunya.bolge(V45.Dunya.uniteler(9)[0].id);setTimeout(()=>V45.Dunya.nokta('bul0'),200)},400)"],
  ['dunya-kapi', "go('poyna',{oyn:'dunya45',obol:'g8',odevam:0});setTimeout(()=>{const u=V45.Dunya.uniteler(8)[0].id,k=V45.Dunya.kayit(8),B=V45.Dunya.bolgeDurum(8,u,k);V45.Dunya.noktalar(8,u).forEach(x=>B.n[x.id]=1);V45.Dunya.yaz(8,k);V45.Dunya.bolge(u);setTimeout(()=>{V45.Dunya.kapi();V41.duraklat&&0},200)},400)"],
  ['calis', "go('calis45')"],
  ['ayar-alan', "go('ayar47',{at:'alan'})"], ['ayar-tema', "go('ayar47',{at:'tema'})"], ['ayar-hareket', "go('ayar47',{at:'hareket'})"], ['ayar-ses', "go('ayar47',{at:'ses'})"], ['ayar-atmosfer', "go('ayar47',{at:'atmosfer'})"],
  ['profil', "go('profil46')"], ['acilis-giris', "go('pdunya');setTimeout(()=>V39.secim(true),300)"],
  ['kut-secim', "go('poyna',{oyn:'kutuphane',obol:'',odevam:0})"], ['kut-giris', "go('poyna',{oyn:'kutuphane',obol:'9-2026-U03',odevam:0})"],
  ['kut-bulmaca', "go('poyna',{oyn:'kutuphane',obol:'7-2026-U03',odevam:0});setTimeout(()=>{const K=V41.oyunlar.kutuphane;K.girisBitti();setTimeout(()=>K.bulmacaAc(K._test.icerik().odalar[0].bulmaca),900)},500)"],
  ['hesap-sunucu', "go('profil46');setTimeout(()=>V46.Hesap.ayarlar('Google ile giriş için önce sunucu adresini gir.'),300)"],
  ['mini-test-soru', "G.tq={mode:'mini',g:5,u:'',t:'TPC-5-1-01',n:5};V30.tqStart()"], ['sinav-rehberi', "go('pekbol',{pk:{k:'sin',g:''}})"], ['pekistir', "go('pek')"]
].map(([a, j]) => ['p:' + a, 'premium', j]);
const K = [ // Klasik ekranları
  ['ana', "go('home')"], ['siniflar', "go('classes')"], ['sinif5', "go('grade',{g:5})"], ['konu', "go('topic',{t:'TPC-5-1-01',tab:'anlat'})"], ['konu-test', "go('topic',{t:'TPC-5-1-01',tab:'test'})"],
  ['oyunlar', "go('games')"], ['dene', "go('dene')"], ['pek', "go('pek')"], ['sd', "go('sd')"], ['ayarlar', "go('home');setTimeout(()=>V30.settings(),300)"], ['ses', "go('home');setTimeout(()=>V37.sndOpen(),300)"],
  ['ogretmen-ana', "go('ogretmen');setTimeout(()=>{const b=[...document.querySelectorAll('button')].find(b=>/^(Diğer|Araçlar)$/.test(b.textContent.trim()));if(b)b.click()},300)"],
  ['veri-yetki', "go('admin')"],
  ['calis', "go('calis45')"], ['ayar-alan', "go('ayar47',{at:'alan'})"], ['ayar-tema', "go('ayar47',{at:'tema'})"], ['ayar-hareket', "go('ayar47',{at:'hareket'})"], ['ayar-ses', "go('ayar47',{at:'ses'})"], ['ayar-atmosfer', "go('ayar47',{at:'atmosfer'})"], ['atmosfer', "go('home');setTimeout(()=>ATM.open(),300)"], ['profil', "go('profil46')"], ['hesap-sunucu', "go('profil46');setTimeout(()=>V46.Hesap.ayarlar(),300)"],
  ['arama', "go('search');setTimeout(()=>{const i=document.getElementById('q2');if(i){i.value='düzen';i.dispatchEvent(new Event('input'))}},300)"], ['degistir', "go('grade',{g:5});setTimeout(()=>V42.degistir(),300)"]
].map(([a, j]) => ['k:' + a, 'normal', j]);
const BAG = [];
for (const [ad, mod, js] of P) for (const pt of ['gece', 'gunduz']) for (const [kt, lite] of [['light', '0'], ['dark', '1']]) BAG.push({ad, mod, js, pt, kt, lite});
for (const [ad, mod, js] of K) for (const [kt, lite] of [['light', '0'], ['dark', '0'], ['light', '1']]) BAG.push({ad, mod, js, pt: 'gece', kt, lite});
const IS = SUZ ? BAG.filter((b) => SUZ.test(`${b.ad} ${b.pt} ${b.kt} ${b.lite}`)) : BAG;

async function olc(b, U, x, n) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, colorScheme: 'dark'});
  await ctx.addInitScript(([x]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-theme', x.kt); localStorage.setItem('dk-ptema43', x.pt); localStorage.setItem('dk-lite', x.lite); localStorage.setItem('dk-deneyim39', JSON.stringify({son: x.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); }, [x]);
  const p = await ctx.newPage(); const hata = []; p.on('pageerror', (e) => hata.push(e.message));
  await p.goto(U); await p.waitForTimeout(1400);
  try { await p.evaluate(x.js); } catch (e) { hata.push(String(e)); }
  await p.waitForTimeout(1500);
  // müzik çalan ekran: çalma başlayıp panel yeniden çizilene kadar bekle (ölçüm sırasında yerleşim değişmesin)
  if (/kut-bulmaca/.test(x.ad)) await p.waitForFunction(() => document.querySelector('.o41-panel .o41-bul'), null, {timeout: 10000}).then(() => p.waitForTimeout(700)).catch(() => {}); // V47: panel açılmadan ya da geçişin ortasında ölçülmesin
  if (/calar/.test(x.ad)) await p.waitForFunction(() => ATM.rt.playing && !Object.values(ATM.rt.nodes).some((n) => n.loading), null, {timeout: 8000}).then(() => p.waitForTimeout(1200)).catch(() => {});
  // canlı yenilenen panel: ölçüm boyunca yeniden çizimi dondur (işaretlenen yazılar ekran görüntüsüne kadar aynı kalsın)
  if (/calar/.test(x.ad)) await p.evaluate(() => { try { ATM.paint = () => {}; V37.sndPaint = () => {}; } catch (e) {} });
  await p.evaluate(() => { try { document.getAnimations().forEach((a) => { try { a.finish(); } catch (e) {} }); } catch (e) {} });
  // tam yükseklik: açık panel varsa onun içeriği, yoksa sayfa
  const yuk = await p.evaluate(() => { const s = document.querySelector('.v-sheet,.v-modal'); if (s) { const bd = s.querySelector('.v-sb'); return bd ? Math.ceil(bd.scrollHeight - bd.clientHeight + innerHeight + 40) : innerHeight; } return Math.max(innerHeight, document.documentElement.scrollHeight); });
  if (yuk > 850) { await p.setViewportSize({width: 390, height: Math.min(6000, yuk)}); await p.waitForTimeout(600); await p.evaluate(() => { try { document.getAnimations().forEach((a) => { try { a.finish(); } catch (e) {} }); } catch (e) {} }); }
  const els = await p.evaluate(() => {
    const out = [], vw = innerWidth, vh = innerHeight; let n = 0; const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), seen = new Set();
    while (tw.nextNode()) { const t = tw.currentNode; if (!t.nodeValue.trim()) continue; const e = t.parentElement; if (!e || seen.has(e)) continue; seen.add(e);
      if (e.closest('script,style,svg,canvas,[aria-hidden="true"],.v-toast,#v-toasts,#boot36')) continue;
      const r = document.createRange(); r.selectNodeContents(t); const bb = r.getBoundingClientRect(); if (bb.width < 4 || bb.height < 6 || bb.bottom < 0 || bb.top > vh || bb.right < 0 || bb.left > vw) continue;
      const s = getComputedStyle(e); if (s.visibility === 'hidden') continue; const cx = Math.min(vw - 1, Math.max(0, (bb.left + bb.right) / 2)), cy = Math.min(vh - 1, Math.max(0, (bb.top + bb.bottom) / 2)), ust = document.elementFromPoint(cx, cy); if (!ust || !(e.contains(ust) || ust.contains(e))) continue;
      let op = 1; for (let a = e; a; a = a.parentElement) op *= +getComputedStyle(a).opacity; if (op < .05) continue;
      const dis = !!e.closest('button:disabled,[aria-disabled="true"],.elendi,input:disabled');
      e.setAttribute('data-k43', n); out.push({i: n++, metin: t.nodeValue.trim().slice(0, 40), sel: e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''), renk: s.color, op, fs: parseFloat(s.fontSize), fw: +s.fontWeight || 400, dis, kutu: [Math.max(0, bb.left), Math.max(0, bb.top), Math.min(vw, bb.right), Math.min(vh, bb.bottom)]}); }
    return {out, lite: document.documentElement.classList.contains('lite'), pt: document.documentElement.dataset.pt43 || '', th: document.documentElement.dataset.theme};
  });
  await p.addStyleTag({content: '[data-k43]{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important} [data-k43] *{color:transparent!important;-webkit-text-fill-color:transparent!important} input::placeholder{color:transparent!important}'});
  await p.waitForTimeout(250);
  const f = path.join(TMP, n + '.png'), js = path.join(TMP, n + '.json');
  await p.screenshot({path: f}); fs.writeFileSync(js, JSON.stringify(els.out));
  const res = JSON.parse(cp.execSync(`python3 ${path.join(__dirname, 'olc.py')} ${f} ${js}`, {maxBuffer: 64 << 20}).toString());
  await ctx.close();
  const kotu = res.filter((r) => !r.dis && r.oran < r.esik);
  return {ekran: x.ad, pt: x.mod === 'premium' ? x.pt : '-', kt: x.kt, lite: els.lite, durum: {pt: els.pt, th: els.th}, n: res.length, hata, kotu: kotu.map((r) => ({m: r.metin, s: r.sel, oran: r.oran, esik: r.esik, fg: r.fg, bg: r.bg}))};
}
(async () => {
  await new Promise((r) => srv.once('listening', r));
  const U = 'http://127.0.0.1:' + srv.address().port + '/' + DOSYA;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const sonuc = []; let i = 0;
  const isci = async () => { while (i < IS.length) { const k = i++, x = IS[k]; let r; try { r = await olc(b, U, x, k); } catch (e) { r = {ekran: x.ad, pt: x.pt, kt: x.kt, lite: x.lite, n: 0, hata: [String(e).slice(0, 200)], kotu: []}; } sonuc[k] = r;
    console.log(`${r.ekran.padEnd(17)} ${String(r.pt).padEnd(6)} klasik:${r.kt.padEnd(5)} hafif:${r.lite ? 'açık ' : 'kapalı'} ${String(r.n).padStart(4)} yazı · AA altı: ${r.kotu.length}` + (r.kotu.length ? '  ← ' + r.kotu.slice(0, 3).map((q) => `"${q.m}" ${q.oran}`).join(' | ') : '') + (r.hata.length ? '  HATA: ' + r.hata[0].slice(0, 100) : '')); } };
  await Promise.all([isci(), isci(), isci(), isci()]);
  // Paralel yükte yerleşimi geç oturan ekranlar yanlış ölçülebilir (ör. çalarken yenilenen ses paneli).
  // Hata bulunan her bağlam yük olmadan tek başına yeniden ölçülür; ilk ölçüm de “ilkOlcum” alanında saklanır.
  for (let k = 0; k < IS.length; k++) if (sonuc[k] && sonuc[k].kotu.length) {
    const ilk = sonuc[k]; let r; try { r = await olc(b, U, IS[k], 'y' + k); } catch (e) { continue; }
    r.ilkOlcum = {n: ilk.n, kotu: ilk.kotu}; sonuc[k] = r;
    console.log(`yeniden ölçüm (tek başına): ${r.ekran} ${r.pt} klasik:${r.kt} → ${r.n} yazı · AA altı: ${r.kotu.length} (ilk ölçüm: ${ilk.n} yazı, ${ilk.kotu.length} AA altı)`);
  }
  const md5 = require('crypto').createHash('md5').update(fs.readFileSync(path.join(ROOT, DOSYA))).digest('hex');
  fs.writeFileSync(CIKTI, JSON.stringify({dosya: DOSYA, md5, tarih: new Date().toISOString(), baglam: sonuc.length, yazi: sonuc.reduce((a, s) => a + s.n, 0), aaAlti: sonuc.reduce((a, s) => a + s.kotu.length, 0), sonuc}, null, 1));
  const top = sonuc.reduce((a, s) => a + s.kotu.length, 0), tn = sonuc.reduce((a, s) => a + s.n, 0), hs = sonuc.filter((s) => s.hata.length).length;
  console.log(`\n${sonuc.length} ekran-bağlam · ${tn} yazı öğesi · AA altında ${top} · sayfa hatası olan bağlam ${hs}`);
  await b.close(); srv.close(); fs.rmSync(TMP, {recursive: true, force: true});
})().catch((e) => { console.error(e); process.exit(2); });
