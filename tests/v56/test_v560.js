// V56.0 testleri (depo kökünden): node tests/v56/test_v560.js — ekran görüntüleri docs/V56.0_ekran/.
// Tarayıcı otomasyonu (yerel http, başsız Chromium, telefon görünümü). Gerçek telefon burada DENENEMEZ.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v56.0.html', F0 = 'surumler/din-kulturu-platformu-v55.0.html';
const SH = path.join(ROOT, 'docs', 'V56.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 700) : '')); };
const hex2 = (c) => (/^#/.test(c) ? 'rgb(' + [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)).join(',') + ')' : c);
const lum = (c) => { const m = hex2(String(c).trim()).match(/[\d.]+/g).map(Number); const v = m.slice(0, 3).map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4))); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const kon = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const rgb = (c) => c.match(/[\d.]+/g).slice(0, 3).map(Number);
const yakin = (c, hex, t) => { const a = rgb(c), b = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); return a.every((x, i) => Math.abs(x - b[i]) <= (t || 4)); };

(async () => {
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v56.0'));
  ok('A1 sürüm V56.0, index.html aynı; veri blokları V55.0 ile bayt bayt aynı (içerik silinmedi); eski sürüm dosyaları ve APK’lar değişmedi', /V31\.VER="V56\.0"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.keys(s1).length === 15 && Object.entries(s0).every(([k, v]) => s1[k] === v) && degisen.length === 0, degisen);
  ok('A2 HTML’de Gmail adresi ve açık PIN yok; Altın hâlâ kapalı (ACIK: false); V55’in beş ayrı tema CSS’i yok, ortak tema üretimi var', !/@gmail\.com/.test(h1) && !h1.includes('030792') && /ACIK: false,/.test(h1) && !h1.includes('V55.0 üretilmiş: Altın temaları') && h1.includes('V56.0 üretilmiş: Altın renkleri Elmas'));

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const b = await chromium.launch();
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, ek: {}, ses: {}, dpr: 1, sinif: 4}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true, deviceScaleFactor: o.dpr, reducedMotion: o.az ? 'reduce' : 'no-preference'});
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
  const bugunK = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  /* ---------- H: sınıf bazlı günlük hedef ---------- */
  {
    const eski = JSON.stringify({v: 1, hedef: 20, gun: {'2026-11-01': 7}});
    const {p, ctx} = await sayfa({ses: ED, ek: {'dk-calis45': eski}, dpr: 2});
    const h = await p.evaluate(async () => {
      const Q4 = Store.all('questions').filter((q) => +q.grade === 4 && (q.outcomeIds || []).length).slice(0, 9), Q5 = Store.all('questions').filter((q) => +q.grade === 5 && (q.outcomeIds || []).length).slice(0, 10);
      Q4.forEach((q) => Prog.rec(q.outcomeIds, true)); Q5.forEach((q) => Prog.rec(q.outcomeIds, false)); Store.save();
      const o = {b4: V56.Hedef.bugun(), g: V56.Hedef.genel(), ham: JSON.parse(localStorage.getItem('dk-calis45')), oku: V45.Calis.oku()};
      go('home'); await new Promise((r) => setTimeout(r, 600)); o.ev = (document.querySelector('.dv54') || {}).innerText || '';
      go('calis45'); await new Promise((r) => setTimeout(r, 700)); o.cal = ($.querySelector('.c48-ust') || {}).innerText || ''; o.gn = ($.querySelector('.gn56') || {}).innerText || '';
      go('profil46'); await new Promise((r) => setTimeout(r, 700)); o.pr = ($.querySelector('.pr49-ilr') || {}).innerText || '';
      return o;
    });
    await p.evaluate(() => window.scrollTo(0, document.querySelector('.pr49-ilr').getBoundingClientRect().top + scrollY - 80));
    await p.screenshot({path: path.join(SH, 'profil-sinifim-genel.png')});
    ok('H1 Günlük hedef yalnız seçili sınıfı sayar: 4. sınıftan 9, 5. sınıftan 10 cevap → 4. sınıf hedefi 9/20; genel çalışma 19 (4. sınıf 9 · 5. sınıf 10)', h.b4.n === 9 && h.b4.hedef === 20 && h.g.bugun === 19 && h.g.dagilim[4] === 9 && h.g.dagilim[5] === 10 && h.ham.sg[Object.keys(h.ham.sg)[0]][4] === 9, {b4: h.b4, g: h.g});
    ok('H2 Eski kayıt korunur ve yanlış sınıfa taşınmaz: önceki günün 7 cevabı genel sayaçta kalır, 4. sınıf görünümünde yer almaz', h.ham.gun['2026-11-01'] === 7 && !('2026-11-01' in h.oku.gun) && h.oku.genel['2026-11-01'] === 7, {gun: h.ham.gun, oku: h.oku.gun});
    ok('H3 Bütün ekranlar aynı ayrımı gösterir: Elmas ana sayfa ve Çalışmam halkası 9/20; Çalışmam’da ayrı “Genel çalışmam” (19 bugün); Profilim’de Sınıfım (başarı %100, 9 doğru) ve Genel çalışmam (19, %47) ayrı',
      /9\s*\/\s*20|9\/20/.test(h.ev.replace(/\s+/g, '')) && /9/.test(h.cal) && /\/ 20|\/20/.test(h.cal) && /19/.test(h.gn) && /5\. sınıf 10/.test(h.gn) && /Sınıfım · 4\. sınıf/.test(h.pr) && /%100/.test(h.pr) && /Genel çalışmam/.test(h.pr) && /%47/.test(h.pr), {ev: h.ev.slice(0, 160), cal: h.cal.slice(0, 120), gn: h.gn, pr: h.pr.slice(0, 400)});
    const h4 = await p.evaluate(async () => {
      await altinAc0(); go('pdunya'); await new Promise((r) => setTimeout(r, 900));
      const o = {ah: (document.querySelector('.ah56-hd') || {}).innerText || ''}; go('acalis53'); await new Promise((r) => setTimeout(r, 700)); o.ms = (document.querySelector('.ms56-hd') || {}).innerText || '';
      const P = JSON.parse(localStorage.getItem('dk-profil53')); P.h.misafir.sinif = 5; localStorage.setItem('dk-profil53', JSON.stringify(P)); go('acalis53'); await new Promise((r) => setTimeout(r, 700)); o.ms5 = (document.querySelector('.ms56-hd') || {}).innerText || ''; o.b5 = V56.Hedef.bugun();
      P.h.misafir.sinif = 4; localStorage.setItem('dk-profil53', JSON.stringify(P)); return o;
      async function altinAc0() { V51.Yonetici.tamam = () => true; V53.Onizleme.baslat(); await new Promise((r) => setTimeout(r, 1500)); }
    });
    ok('H4 Altın’da da aynı: ana sayfa ve Çalışma Masam “4. sınıf hedefi” 9/20; sınıf 5 seçilince hedef 10/20 olur (sınıf değiştirmek kayıtları taşımaz)', /9\s*\/20/.test(h4.ah) && /4\. sınıf hedefi/.test(h4.ah) && /9\s*\/20/.test(h4.ms) && /10\s*\/20/.test(h4.ms5) && h4.b5.n === 10, h4);
    await ctx.close();
  }

  /* ---------- T: ortak tema ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED});
    const t = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 600)), cs = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e) : null; }, o = {};
      V56.Tema.sec('acik'); await bk(); o.elmasAcik = document.documentElement.dataset.theme;
      document.querySelector('[data-themebtn]').click(); await bk(); o.dugme = [document.documentElement.dataset.theme, localStorage.getItem('dk-ptema43'), localStorage.getItem('dk-theme')];
      V51.Yonetici.tamam = () => true; V53.Onizleme.baslat(); await bk(1500); go('psinif', {pg: 4}); await bk(800);
      o.altinKoyu = [document.documentElement.dataset.pt43, getComputedStyle(document.body).backgroundColor, cs('.sn55-u').backgroundColor];
      document.querySelector('.t43').click(); await bk(900);
      o.altinAcik = [document.documentElement.dataset.pt43, getComputedStyle(document.body).backgroundColor, cs('.sn55-u').backgroundColor, localStorage.getItem('dk-theme')];
      o.kontrast = {}; for (const m of ['acik', 'koyu']) { V56.Tema.sec(m); await bk(700); go('psinif', {pg: 4}); await bk(600); o.kontrast[m] = {kart: cs('.sn55-u').backgroundColor, yazi: cs('.sn55-ut b').color, soluk: cs('.sn55-ut > span').color, btn: cs('.sn55-dv em').backgroundColor, btnYazi: cs('.sn55-dv em').color}; }
      go('profil46'); await bk(800); o.profilTema = !!document.querySelector('#pr54-gor .tm56') && !document.querySelector('.tm54-k');
      go('ayar47', {at: 'tema'}); await bk(800); o.ayar = document.querySelectorAll('#a47b .tm56-k').length;
      V53.Onizleme.bitir(); await bk(800); V50.Mod.gec('ogretmen'); await bk(1200);
      o.ogr = {}; for (const m of ['acik', 'koyu']) { V56.Tema.sec(m); await bk(700); const b = getComputedStyle(document.body); o.ogr[m] = {th: document.documentElement.dataset.theme, bg: b.backgroundColor, ink: b.getPropertyValue('--t37-ink').trim(), card: b.getPropertyValue('--t37-card').trim(), mut: b.getPropertyValue('--t37-mut').trim(), act: b.getPropertyValue('--t37-act').trim(), on: b.getPropertyValue('--t37-on').trim()}; }
      const tb = document.querySelector('.og54-tm'); if (tb) { tb.click(); await bk(600); o.ogrSheet = document.querySelectorAll('.tm56-k').length; UI.close(); await bk(400); }
      return o;
    });
    await p.screenshot({path: path.join(SH, 'ogretmen-koyu.png')});
    await p.evaluate(async () => { V56.Tema.sec('acik'); await new Promise((r) => setTimeout(r, 800)); });
    await p.screenshot({path: path.join(SH, 'ogretmen-acik.png')});
    ok('T1 Tek tema tercihi: Elmas üst çubuk düğmesi, Altın üst çubuk düğmesi ve V56.Tema aynı ayarı değiştirir; Altın, Elmas’ın açık/koyu seçimini izler',
      t.elmasAcik === 'light' && t.dugme[0] === 'dark' && t.dugme[1] === 'gece' && t.dugme[2] === 'dark' && t.altinKoyu[0] === 'gece' && t.altinAcik[0] === 'gunduz' && t.altinAcik[3] === 'light', {elmasAcik: t.elmasAcik, dugme: t.dugme, altinKoyu: t.altinKoyu, altinAcik: t.altinAcik});
    ok('T2 Altın temel renkleri Elmas paletinden: koyu zemin #0B1020 ve kart #131A2D (Elmas koyu), açık zemin #F3F5FA ve beyaz kart (Elmas açık); altın vurgular korunur',
      yakin(t.altinKoyu[1], '#0B1020') && yakin(t.altinKoyu[2], '#131A2D', 6) && yakin(t.altinAcik[1], '#F3F5FA') && yakin(t.altinAcik[2], '#FFFFFF', 6) && !yakin(t.kontrast.koyu.btn, '#4F7CFF', 40), {koyu: t.altinKoyu, acik: t.altinAcik, btn: t.kontrast.koyu.btn});
    const kn = Object.fromEntries(Object.entries(t.kontrast).map(([m, v]) => [m, {yazi: kon(v.yazi, v.kart), soluk: kon(v.soluk, v.kart), btn: kon(v.btnYazi, v.btn)}]));
    const ko = Object.fromEntries(Object.entries(t.ogr).map(([m, v]) => [m, {ink: kon(v.ink, v.card), mut: kon(v.mut, v.card), act: kon(v.on, v.act)}]));
    ok('T3 Okunurluk: Altın açık/koyu başlık ≥ 7, soluk yazı ≥ 4,5, altın düğme yazısı ≥ 4,5; Öğretmen Modu açık/koyu yazı ≥ 7, ikincil ≥ 4,5, ana düğme ≥ 4,5', Object.values(kn).every((x) => x.yazi >= 7 && x.soluk >= 4.5 && x.btn >= 4.5) && Object.values(ko).every((x) => x.ink >= 7 && x.mut >= 4.5 && x.act >= 4.5), {altin: kn, ogretmen: ko});
    ok('T4 Öğretmen Modu ortak temayı kullanır: açık/koyu Elmas paleti (zemin #F3F5FA / #0B1020), Tema düğmesi aynı üç seçeneği açar; Profilim ve Görünüm ve ses › Tema’da yalnız Açık/Koyu/Otomatik (eski 5 palet yok)',
      t.ogr.acik.th === 'light' && t.ogr.koyu.th === 'dark' && yakin(t.ogr.acik.bg, '#F3F5FA') && yakin(t.ogr.koyu.bg, '#0B1020') && t.ogrSheet === 3 && t.profilTema && t.ayar === 3, {ogr: t.ogr, sheet: t.ogrSheet, profil: t.profilTema, ayar: t.ayar});
    await ctx.close();
  }

  /* ---------- AL: Altın ana sayfa, Çalışma Masam, profil, oyunlar ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2});
    await altinAc(p);
    const a = await p.evaluate(async () => {
      go('pdunya'); await new Promise((r) => setTimeout(r, 900));
      const ah = $.querySelector('.ah56'), L = [...ah.querySelectorAll('button')].map((x) => (x.querySelector('b') || x).textContent.trim());
      const ikon = [...ah.querySelectorAll('.md56 svg')].map((s) => s.innerHTML.replace(/id="[^"]+"|url\(#[^)]+\)/g, ''));
      return {var: !!ah, hero: !!ah.querySelector('.ah56-hero .hl56 svg'), kisa: ah.querySelectorAll('.ah56-k .md56 svg').length, kesif: ah.querySelectorAll('.ah56-r .md56 svg').length, tekil: new Set(L).size === L.length, ikonFarkli: new Set(ikon).size === ikon.length, ed: !!ah.querySelector('.ah55-ed'), golge: getComputedStyle(ah.querySelector('.ah56-k')).boxShadow !== 'none', anim: getComputedStyle(ah.querySelector('.ah56-hero')).animationName, L};
    });
    await p.evaluate(() => window.scrollTo(0, document.querySelector('.ah56').getBoundingClientRect().top + scrollY - 90));
    await p.screenshot({path: path.join(SH, 'altin-ana-sayfa-koyu.png')});
    await p.evaluate(async () => { V56.Tema.sec('acik'); await new Promise((r) => setTimeout(r, 900)); window.scrollTo(0, document.querySelector('.ah56').getBoundingClientRect().top + scrollY - 90); });
    await p.screenshot({path: path.join(SH, 'altin-ana-sayfa-acik.png')});
    await p.evaluate(async () => { V56.Tema.sec('koyu'); await new Promise((r) => setTimeout(r, 700)); });
    ok('AL1 Altın ana sayfa premium ve sade: aynı yerleşim (kaldığın yer + hedef halkası, Derslerim/Oyun Dünyası/Çalışma Masam, Keşif); her girişin kendi çizgi ikonu (hepsi farklı), katmanlı yüzey (gölge), ölçülü giriş animasyonu; tekrar yok',
      a.var && a.hero && a.kisa === 3 && a.kesif === 5 && a.tekil && a.ikonFarkli && a.golge && a.anim === 'a56g' && ['Derslerim', 'Oyun Dünyası', 'Çalışma Masam', 'Sureler ve Dualar', 'Kavramlar', 'Kişiler ve Eserler', 'Bağlantılar'].every((x) => a.L.includes(x)), a);
    const m = await p.evaluate(async () => {
      const k = new Date(), g = k.getFullYear() + '-' + String(k.getMonth() + 1).padStart(2, '0') + '-' + String(k.getDate()).padStart(2, '0');
      localStorage.setItem('dk-calis45', JSON.stringify({v: 1, hedef: 20, gun: {[g]: 41}, sg: {[g]: {4: 30, 5: 11}}}));
      const Q = Store.all('questions').filter((q) => +q.grade === 4 && (q.outcomeIds || []).length).slice(0, 3);
      Store.ov.prog = {}; Q.forEach((q, i) => { Store.ov.prog[q.outcomeIds[0]] = {correct: i, wrong: 3, mastery: 0.2}; }); Store.ov.wrong = {}; Q.forEach((q) => { Store.ov.wrong[q.id] = {at: k.toISOString()}; });
      go('acalis53'); await new Promise((r) => setTimeout(r, 800));
      const ms = $.querySelector('.ms56'), o = {};
      o.bolum = [...ms.querySelectorAll('.ms56-ch h2, .ms56-bt h2')].map((x) => x.textContent.trim());
      o.eylem = [...ms.querySelectorAll('.ms56-e')].map((x) => x.className.split(' ').find((c) => ['yn', 'kr', 'ts'].includes(c)));
      o.eylemRenk = [...ms.querySelectorAll('.ms56-e')].map((x) => getComputedStyle(x).backgroundColor);
      o.hedef = (ms.querySelector('.ms56-hd') || {}).innerText || ''; o.oneri = (ms.querySelector('.ms55-o') || {}).textContent || '';
      o.eksik = [...ms.querySelectorAll('.ms56-ek li')].map((x) => x.innerText.replace(/\s+/g, ' '));
      o.grafik = !!ms.querySelector('.ms56-gr.g7 .ms56-hc'); o.sekme = ms.querySelectorAll('.ms56-tb').length;
      const tb = ms.querySelector('.ms56-tb'), t2 = tb.querySelectorAll('[role="tab"]')[1]; t2.click(); await new Promise((r) => setTimeout(r, 200));
      o.sekmeGecis = [...tb.querySelectorAll('[role="tabpanel"]')].map((x) => x.hidden).join(',');
      const t3 = tb.querySelectorAll('[role="tab"]')[2]; t3.click(); await new Promise((r) => setTimeout(r, 200)); o.genel = [...tb.querySelectorAll('[role="tabpanel"]')].find((x) => !x.hidden).innerText;
      tb.querySelectorAll('[role="tab"]')[0].click();
      return o;
    });
    await p.screenshot({path: path.join(SH, 'altin-calisma-masam.png')});
    await p.screenshot({path: path.join(SH, 'altin-calisma-masam-tam.png'), fullPage: true});
    ok('AL2 Çalışma Masam yeniden tasarlandı: “Bugün” sahnesi, Eksiklerim, Şimdi ne yapmalıyım (her eylemin kendi ikonu ve tonu), plan, hedefler (7 gün grafiği ve hedef çizgisi), sekmeli Gelişimim ve Geçmişim (sekmeler çalışıyor)',
      ['Bugün ne çalışmalıyım?', 'Hangi konularda eksiğim var?', 'Şimdi hangi çalışmayı yapmalıyım?', 'Bugünkü planın', 'Hedefler', 'Gelişimim', 'Geçmişim'].every((x) => m.bolum.includes(x)) && m.eylem.join() === 'yn,kr,ts' && new Set(m.eylemRenk).size === 3 && m.grafik && m.sekme === 2 && m.sekmeGecis === 'true,false,true', m);
    ok('AL3 Çalışma Masam gerçek kayıttan: öneri en zayıf konu; eksik konular yüzdeyle; 4. sınıf hedefi aşıldı “30/20 · +10” (genel 41 cevaptan yalnız 4. sınıfın 30’u); Genel sekmesinde 41 ve sınıf dağılımı',
      /tekrar et/.test(m.oneri) && m.eksik.length >= 1 && m.eksik.every((x) => /%\d+/.test(x)) && /Hedefini aştın/.test(m.hedef) && /30\s*\/\s*20/.test(m.hedef) && /\+10/.test(m.hedef) && /41/.test(m.genel) && /4\. sınıf 30/.test(m.genel) && /5\. sınıf 11/.test(m.genel), {oneri: m.oneri, hedef: m.hedef, eksik: m.eksik, genel: m.genel});
    const pr = await p.evaluate(async () => {
      go('profil46'); await new Promise((r) => setTimeout(r, 800)); const t = $.innerText;
      return {hazir: /İçeriği hazır|içeriği hazır|190\/190/.test(t), og: [...$.querySelectorAll('summary')].some((s) => /Öğretmen ve editör|Öğretmen modu/i.test(s.textContent)), modPanel: (() => { try { V50.Mod.ac(); return true; } catch (x) { return false; } })()};
    });
    await p.waitForTimeout(500);
    const mp = await p.evaluate(async () => { const t = (document.querySelector('.v-ov') || {}).innerText || ''; UI.close(); await new Promise((r) => setTimeout(r, 400)); return {ogretmen: /Öğretmen Modu/.test(t), yonetici: /Yönetici|Editör/i.test(t)}; });
    await p.evaluate(async () => { go('profil46'); await new Promise((r) => setTimeout(r, 700)); });
    await p.screenshot({path: path.join(SH, 'altin-profilim.png'), fullPage: true});
    ok('AL4 Altın Profilim sade: “İçeriği hazır konu / 190/190” ve “Öğretmen ve editör” kartı yok; öğretmen ve yönetici girişi Mod panelinde duruyor', !pr.hazir && !pr.og && mp.ogretmen && mp.yonetici, {pr, mp});
    const o = await p.evaluate(async () => {
      go('poyun'); await new Promise((r) => setTimeout(r, 900));
      const K = [...$.querySelectorAll('.ao56-k')], o = {sayi: K.length, cizim: K.every((k) => k.querySelector('.og56-s')), tekil: new Set(K.map((k) => k.querySelector('.og56-s').innerHTML)).size === K.length, ton: new Set(K.map((k) => k.style.getPropertyValue('--oh'))).size, gruplar: [...$.querySelectorAll('.ao55-g h3')].map((x) => x.textContent)};
      [...K].find((k) => k.dataset.og === 'cark').click(); await new Promise((r) => setTimeout(r, 800));
      o.cark = {view, baslik: ($.querySelector('#ck56-h') || {}).textContent, oner: !!$.querySelector('.ck56-cv'), cubuk: document.querySelectorAll('.p39-top').length};
      const nav = document.getElementById('bn50'); o.navOn = nav ? [...nav.querySelectorAll('button.on')].map((x) => x.dataset.k).join() : '';
      return o;
    });
    await p.screenshot({path: path.join(SH, 'cark-cevirme.png')});
    const o2 = await p.evaluate(async () => { $.querySelector('.ck56-cv').click(); await new Promise((r) => setTimeout(r, 900)); const r = {view, tur: GP.g && GP.g.gameType, cark: [...$.querySelectorAll('button')].some((b) => /Çarkı çevir/.test(b.textContent)) && !!$.querySelector('svg text')}; G.ck56 = 6; go('cark56'); await new Promise((r) => setTimeout(r, 500)); r.alti = ($.querySelector('.ck56') || {}).innerText.slice(0, 400); G.ck56 = 0; return r; });
    ok('O1 Altın Oyun Dünyası: dört grup korunur; 13 kartın her biri kendi çizimini ve renk tonunu taşır (birbirinin kopyası değil)', o.sayi === 13 && o.cizim && o.tekil && o.ton >= 12 && o.gruplar.length === 4, o);
    ok('O2 Çark Çevirme kartı Etkinlik Oyunları’na değil kendi ekranına gider (tek üst çubuk; Oyunlar sekmesi seçili); “Çarkı çevir” çark oyununu açar; çark kaydı olmayan sınıfta açık uyarı',
      o.cark.view === 'cark56' && o.cark.baslik === 'Çark Çevirme' && o.cark.oner && o.cark.cubuk === 0 && o.navOn === 'oyun' && o2.view === 'game' && o2.tur === 'wheel' && o2.cark && /6\. sınıf için kaynakta çark oyunu yok/.test(o2.alti), {cark: o.cark, navOn: o.navOn, o2});
    const oy = await p.evaluate(async () => {
      const r = {};
      for (const k of ['zirve', 'benibul', 'gizemli', 'halka', 'harf', 'arena', 'anlat', 'gizli']) { go('poyun'); await new Promise((x) => setTimeout(x, 300)); V54.Oyun.git(k); await new Promise((x) => setTimeout(x, 600)); r[k] = view === 'aoyun53' && $.innerText.length > 60; }
      clearInterval(V54.Oyun._t); return r;
    });
    ok('O3 Diğer sekiz Altın oyunu (Zirve Yarışı, Beni Bul!, Gizemli Şahsiyet, Harf Halkası, Harf Avı, Bilgi Arenası, Kelimeyi Anlat Bakalım, Gizli Bilgin) kendi ekranlarını açar', Object.values(oy).every(Boolean), oy);
    const fa = await p.evaluate(async () => {
      G.gf = {}; go('games'); await new Promise((r) => setTimeout(r, 900));
      const gor = () => [...$.querySelectorAll('.gcd30, .kart43')].filter((x) => x.getBoundingClientRect().height > 0).length;
      const o = {panel: !!$.querySelector('.gf56'), liste0: gor()}; V33.tapType('quiz'); await new Promise((r) => setTimeout(r, 700)); o.liste1 = gor(); return o;
    });
    ok('F2 Altın’daki etkinlik oyunları sayfası da önce filtre gösterir; tür seçilince liste açılır', fa.panel && fa.liste0 === 0 && fa.liste1 > 0, fa);
    await ctx.close();
  }

  /* ---------- F: Elmas oyun listesi önce filtre ---------- */
  {
    const {p, ctx} = await sayfa({dpr: 2});
    const f = await p.evaluate(async () => {
      const bk = (ms) => new Promise((r) => setTimeout(r, ms || 700)), gor = () => [...$.querySelectorAll('.gcd30')].filter((x) => x.getBoundingClientRect().height > 0);
      go('games'); await bk(900);
      const o = {panel: !!$.querySelector('.gf56'), turler: $.querySelectorAll('.gh-types .gt').length, liste0: gor().length, tumBaslik: [...$.querySelectorAll('h2')].some((h) => /Tüm oyunlar/.test(h.textContent) && h.getBoundingClientRect().height > 0), ipucu: (($.querySelector('.gf56-n') || {}).textContent || '').length > 40};
      V33.tapType('wheel'); await bk(); const L = gor(); o.tur = {n: L.length, hepsiCark: L.every((x) => /Çark/.test(x.textContent))};
      V56.OyunFiltre.temizle(); await bk(); o.temiz = gor().length;
      const us = $.querySelector('.gf56 select'); o.uniteSec = !!us; us.value = us.options[1].value; us.dispatchEvent(new Event('change')); await bk(); o.unite = {n: gor().length, f: G.gf.u};
      V56.OyunFiltre.temizle(); await bk();
      const n4 = (() => { G.gf.ty = 'quiz'; return 0; })(); draw(); await bk(); o.sinifim = gor().length + (G.gf.n < 999 ? 0 : 0); o.sinifimHepsi4 = gor().every((x) => /4\. sınıf/.test(x.textContent));
      V56.OyunFiltre.sinifSec(true); await bk(); G.gf.ty = 'quiz'; draw(); await bk(); o.tum = {sayi: gFilterList(gList(), G.gf).length, sinif: [...new Set(gList().map((x) => x.grade))].length};
      V56.OyunFiltre.sinifSec(false); await bk();
      const nav = [...document.querySelectorAll('nav.bnav button.on')].map((x) => x.dataset.k).join(); o.nav = nav;
      G.gf.ty = ''; G.gf.u = ''; G.gf.t = ''; draw(); await bk();
      return o;
    });
    await p.screenshot({path: path.join(SH, 'elmas-oyun-filtre.png')});
    ok('F1 Elmas oyunlar: ilk açılışta uzun liste yok, “Oyun bul” paneli (Sınıfım/Tüm sınıflar, ünite/konu) ve oyun türleri var; tür ya da ünite seçince yalnız ilgili oyunlar; temizleyince liste kapanır; Tüm sınıflar bütün sınıfların oyunlarını açar',
      f.panel && f.turler >= 10 && f.liste0 === 0 && !f.tumBaslik && f.ipucu && f.tur.n > 0 && f.tur.hepsiCark && f.temiz === 0 && f.uniteSec && f.unite.n > 0 && f.sinifimHepsi4 && f.tum.sinif > 1 && f.tum.sayi > f.sinifim, f);
    const pr = await p.evaluate(async () => { go('profil46'); await new Promise((r) => setTimeout(r, 800)); return {hazir: /İçeriği hazır|içeriği hazır/.test($.innerText), og: [...$.querySelectorAll('summary')].some((s) => /Öğretmen ve editör|Öğretmen modu/i.test(s.textContent))}; });
    ok('P1 Elmas Profilim’de de içerik hazırlık bilgisi ve öğretmen/editör kısayol kartları yok', !pr.hazir && !pr.og, pr);
    await ctx.close();
  }

  /* ---------- R: roller ---------- */
  {
    const {p, ctx} = await sayfa();
    const r = await p.evaluate(async () => {
      const o = {acik: V51.Altin.acikMi()}; go('pdunya'); await new Promise((r) => setTimeout(r, 700)); o.ogrView = view; o.yakinda = !!document.getElementById('yk518');
      document.getElementById('yk518') && document.getElementById('yk518').remove();
      V36.ss(V36.SK, '1'); o.ogrt = V36.ok(); o.ogrtEd = V38.edOk(); go('editor'); await new Promise((r) => setTimeout(r, 700)); o.edEkran = !!document.querySelector('.ed38-top'); o.ogrtAltin = V51.Altin.acikMi();
      return o;
    });
    ok('R1 Öğrenci Altın’a giremez (“Çok yakında”); öğretmen oturumunda editör yetkisi ve Altın erişimi yok', !r.acik && r.ogrView !== 'pdunya' && r.yakinda && r.ogrt && !r.ogrtEd && !r.edEkran && !r.ogrtAltin, r);
    await ctx.close();
  }

  /* ---------- M: telefonda yerleşim ---------- */
  {
    const {p, ctx} = await sayfa({w: 360, h: 740, ses: ED});
    const olc = (L, nav) => p.evaluate(async ([L, nav]) => {
      const o = {};
      for (const [v, a] of L) { go(v, a); await new Promise((r) => setTimeout(r, 800)); window.scrollTo({top: 1e7, behavior: 'instant'}); await new Promise((r) => setTimeout(r, 400)); const n = document.querySelector(nav), son = Math.max(...[...$.querySelectorAll('*')].filter((x) => !x.children.length && x.getBoundingClientRect().height > 0 && getComputedStyle(x).visibility !== 'hidden' && !x.closest('[inert],[hidden],.gf56-gz,details:not([open]) > :not(summary)')).map((x) => x.getBoundingClientRect().bottom)); o[v] = {son: Math.round(son), nav: n && !n.hidden && n.getBoundingClientRect().height ? Math.round(n.getBoundingClientRect().top) : null, gen: document.documentElement.scrollWidth}; }
      return o;
    }, [L, nav]);
    const el = await olc([['home', {}], ['games', {}], ['calis45', {}], ['profil46', {}]], 'nav.bnav');
    await altinAc(p);
    const al = await olc([['pdunya', {}], ['psinif', {pg: 4}], ['acalis53', {}], ['poyun', {}], ['cark56', {}], ['profil46', {}]], '#bn50');
    await p.evaluate(async () => { go('acalis53'); await new Promise((r) => setTimeout(r, 600)); window.scrollTo({top: 1e7, behavior: 'instant'}); });
    await p.screenshot({path: path.join(SH, 'telefon-360-masa-alt.png')});
    const hepsi = Object.assign({}, el, al), okM = Object.values(hepsi).every((x) => x.gen <= 361 && (x.nav == null || x.son <= x.nav + 2));
    ok('M1 360 px telefonda (Elmas ana sayfa/oyunlar/Çalışmam/Profilim; Altın koridor/sınıf merkezi/Çalışma Masam/Oyun Dünyası/Çark Çevirme/Profilim) son içerik alt menünün altında kalmıyor, yatay taşma yok', okM, hepsi);
    await ctx.close();
  }

  ok('Z1 Sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); st.close();
  const gecen = S.filter((x) => x.ok).length;
  console.log(`\n${gecen}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen, toplam: S.length, kontroller: S}, null, 1));
  process.exit(gecen === S.length ? 0 : 1);
})();
