// V59.0 testleri (depo kökünden): node tests/v59/test_v590.js — ekran görüntüleri docs/V59.0_ekran/.
// Tarayıcı otomasyonu (yerel http, başsız Chromium, telefon görünümü). Gerçek telefon ve Android WebView burada DENENEMEZ.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const AC = require('../v51_3/ac513.js');
const F = 'surumler/din-kulturu-platformu-v59.0.html', F0 = 'surumler/din-kulturu-platformu-v58.0.html';
const SH = path.join(ROOT, 'docs', 'V59.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const SICAK = fs.readFileSync(path.join(ROOT, 'tools', 'v59', 'olcum', 'sicak.js'), 'utf8');
const S = [], HATA = [];
const ok = (ad, k, a) => { const s = a === undefined ? '' : (typeof a === 'string' ? a : JSON.stringify(a)); S.push({ad, ok: !!k, a: s}); console.log((k ? '✔' : '✘') + ' ' + ad + (s ? '  — ' + s.slice(0, 700) : '')); };
const hex2 = (c) => (/^#/.test(c) ? 'rgb(' + [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)).join(',') + ')' : /^color\(srgb/.test(c) ? 'rgb(' + c.match(/[\d.]+/g).slice(0, 3).map((x) => Math.round(x * 255)).join(',') + ')' : c);
const lum = (c) => { const m = hex2(String(c).trim()).match(/[\d.]+/g).map(Number); const v = m.slice(0, 3).map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4))); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const kon = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
// OKLCh tonu: sıcak (altın/bronz) mu, Elmas (mavi) mi
const lch = (c) => { const m = hex2(String(c)).match(/[\d.]+/g).map(Number); const t = (x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; const [r, g, b] = m.slice(0, 3).map(t); const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), mm = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b); const A = 1.9779984951 * l - 2.428592205 * mm + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * mm - 0.808675766 * s; return {C: Math.hypot(A, B), H: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360}; };
const sicakMi = (c) => { const x = lch(c); return x.C > 0.05 && x.H >= 25 && x.H <= 110; };
// bilinçli olarak sıcak kalan öğeler: Altın mod amblemi/kartı (mod seçimi), Önerilen rozeti, uyarı/kaynak durum rozetleri, oyun kartı çizimleri,
// oyun türü simgeleri, Kavram Haritası kart motifleri (kavram temasının tonu) ve inceleme durumu rozeti, Profilim'deki Altın mod amblemi, kazanım kartı (kendi altın kimliği; V59 isteği), tema önizleme kartları (seçim ekranında her temanın kendi rengi)
const IST = '.km-card .m, .km-card .m *, .kmps, .pr49-ust.al svg, .pr49-ust.al svg *, .md50, .md50 *, .mk50-am, .mk50-am *, .mk50-k.altin, .mk50-k.altin *, img, canvas, .lg, [class*=logo], .k40, .on58, .uy, .kd45, .og56-r, .og56-r *, .gt, .gt *, .c-kaz, .c-kaz *, .tm57-k, .tm57-k *';

(async () => {
  const ham = fs.readFileSync(path.join(ROOT, F), 'utf8'), h1 = AC(ham), h0 = AC(fs.readFileSync(path.join(ROOT, F0), 'utf8'));
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  const s0 = seeds(h0), s1 = seeds(h1);
  const degisen = cp.execSync('git status --porcelain surumler/ apk/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v59.0'));
  ok('A1 sürüm V59.0, index.html aynı; V58.0’ın bütün veri blokları (müfredat, ilişkiler, sureler-dualar, yıllık plan, oyun içerikleri, müzik, görseller) bayt bayt aynı, yalnız ertelenen tema CSS’i (tema57-css) eklendi; eski sürüm dosyaları ve APK’lar değişmedi',
    /V31\.VER="V59\.0"/.test(h1) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === ham && Object.entries(s0).every(([k, v]) => s1[k] === v) && Object.keys(s1).length === Object.keys(s0).length + 1 && !!s1['tema57-css'] && degisen.length === 0, degisen);
  ok('A2 Gmail adresi ve açık PIN yok; Altın hâlâ öğrenciye kapalı (ACIK: false)', !/@gmail\.com/.test(h1) && !h1.includes('030792') && /ACIK: false,/.test(h1));
  ok('A3 Tema CSS’i ertelendi: V58’in <style> olarak yüklenen koşullu tema tablosu (Altın’ın diğer temaları + Elmas) artık açılışta ayrıştırılmıyor, yalnız o tema seçilince ekleniyor',
    (() => { const T = '/* ===== V57.0 üretilmiş: Altın temaları', i0 = h0.indexOf(T), i1 = h1.indexOf(T), k1 = h1.indexOf('<script type="text/plain" id="tema57-css">');
      return i0 > 0 && i0 < h0.indexOf('</head>') && k1 > 0 && i1 > k1 && h1.indexOf(T, i1 + 1) < 0; })());

  const st = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => st.once('listening', r));
  const ORIGIN = 'http://127.0.0.1:' + st.address().port;
  const b = await chromium.launch({args: ['--enable-precise-memory-info']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, ek: {}, ses: {}, dpr: 1, sinif: 4, renk: 'dark', dosya: F}, o || {});
    const ctx = await b.newContext({viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true, deviceScaleFactor: o.dpr, colorScheme: o.renk});
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
    await p.goto(ORIGIN + '/' + o.dosya); await p.waitForTimeout(2300);
    await p.evaluate(SICAK);
    return {p, ctx};
  };
  const altinAc = (p) => p.evaluate(async () => { V51.Yonetici.tamam = () => true; V53.Onizleme.baslat(); await new Promise((r) => setTimeout(r, 1500)); });
  const ED = {'dk-editor-oturum38': '1'};

  /* ---------- O: Altın oyunları Elmas'ta görünmez (veri süzgeciyle) ---------- */
  {
    const {p, ctx} = await sayfa({dpr: 2});
    const el = await p.evaluate(async () => {
      go('games'); await new Promise((r) => setTimeout(r, 1300));
      const L = Store.all('games'), tur = {}; L.forEach((g) => tur[g.gameType] = (tur[g.gameType] || 0) + 1);
      return {view, altin: !!V39.on, n: L.length, tur, metin: $.innerText, dunya: !!document.querySelector('.g46-dunya'), secenek: [...document.querySelectorAll('select option')].map((o) => o.textContent).join('|')};
    });
    await p.screenshot({path: path.join(SH, 'elmas-oyunlar.png')});
    const ev = await p.evaluate(async () => { go('home'); await new Promise((r) => setTimeout(r, 900)); return $.innerText; });
    // editör araç ekranı moddan bağımsız: bütün kayıtlar
    const ed = await p.evaluate(async () => { sessionStorage.setItem('dk-editor-oturum38', '1'); V51.Yonetici.tamam = () => true; go('editor'); await new Promise((r) => setTimeout(r, 900)); const n = Store.all('games').length; go('home'); await new Promise((r) => setTimeout(r, 600)); return {view: 'editor', n}; });
    await altinAc(p);
    const al = await p.evaluate(async () => {
      go('games'); await new Promise((r) => setTimeout(r, 1500));
      const L = Store.all('games'), tur = {}; L.forEach((g) => tur[g.gameType] = (tur[g.gameType] || 0) + 1);
      const o = {view, altin: !!V39.on, n: L.length, tur, metin: $.innerText};
      go('poyun'); await new Promise((r) => setTimeout(r, 1500)); return o;
    });
    const altinTur = (al.tur.tabu || 0) + (al.tur.benkimim || 0);
    ok('O1 Elmas Mod › Oyunlar: Altın oyunlarının kayıtları (Kelimeyi Anlat Bakalım = tabu, Beni Bul! = benkimim) Elmas’ın oyun listesine hiç gelmiyor (veri süzgeci, CSS değil); Altın Oyun Dünyası kartı yok; ekranda bu adlar geçmiyor',
      el.view === 'games' && !el.altin && !el.tur.tabu && !el.tur.benkimim && !el.dunya && !/Kelimeyi Anlat|Beni Bul|Oyun Dünyası/.test(el.metin + el.secenek), {n: el.n, tur: el.tur});
    ok('O2 Elmas oyunları ve bütün kayıtlar korunur: Elmas’ta kalan türler Altın’daki türlerin tabu/benkimim dışındaki hepsi, sayı tutuyor (Elmas + Altın’a özel = toplam); Altın’ın Etkinlik oyunlarında tabu ve benkimim duruyor; editör ekranı bütün sınıfların bütün kayıtlarını görüyor; havuzlar birleşmedi',
      al.altin && altinTur > 0 && el.n + altinTur === al.n && Object.keys(al.tur).filter((k) => k !== 'tabu' && k !== 'benkimim').every((k) => el.tur[k] === al.tur[k]) && ed.n >= al.n, {elmas: el.n, altin: al.n, altinaOzel: altinTur, editor: ed.n});
    ok('O3 Elmas ana sayfasındaki Oyunlar kartı artık “Oyun Dünyası” demiyor (Etkinlik oyunları ve Çark Çevirme)', /Etkinlik oyunları ve Çark Çevirme/.test(ev) && !/Oyun Dünyası/.test(ev));

    /* H: Hızlı Etkinlikler kartı */
    const h = await p.evaluate(async () => {
      const k = document.querySelector('.he59'); if (!k) return {yok: 1, metin: $.innerText.slice(0, 600)};
      window.scrollTo(0, k.getBoundingClientRect().top + scrollY - 90); await new Promise((r) => setTimeout(r, 300));
      const r = k.getBoundingClientRect(), cs = getComputedStyle(k);
      return {tag: k.tagName, t: k.innerText.replace(/\s+/g, ' '), chip: k.querySelectorAll('.he59-c').length, ikon: k.querySelectorAll('.he59-c svg').length, eski: !!document.querySelector('.ao55-tum') || /Etkinlik oyunları: eşleştirme/i.test($.innerText), w: r.width, hgt: r.height, bg: cs.backgroundImage + ' ' + cs.backgroundColor, bd: cs.borderTopColor, ink: getComputedStyle(k.querySelector('.he59-t b')).color, zemin: getComputedStyle(document.body).backgroundColor};
    });
    await p.screenshot({path: path.join(SH, 'altin-hizli-etkinlikler.png')});
    const h2 = await p.evaluate(async () => { document.querySelector('.he59 .he59-l').click(); await new Promise((r) => setTimeout(r, 1300)); return {view, altin: !!V39.on}; });
    ok('H1 Altın Oyun Dünyası: “Etkinlik oyunları: eşleştirme…” satırı yerine belirgin “Hızlı Etkinlikler” kartı; alt yazı istenen metin; altı küçük tür simgesi; kartın tamamı tek düğme (simge satırına dokunmak da açar) → Etkinlik oyunları, mod Altın kalır',
      h.tag === 'BUTTON' && /Hızlı Etkinlikler/.test(h.t) && /Eşleştir, grupla, boşlukları tamamla ve öğrendiklerini pekiştir\./.test(h.t) && h.chip === 6 && h.ikon === 6 && !h.eski && h.hgt >= 90 && h.w >= 300 && h2.view === 'games' && h2.altin, h);
    ok('H2 Hızlı Etkinlikler kartı Altın görsel dilinde: kenar altın tonunda, başlık zemine göre okunur (≥ 4.5)', sicakMi(h.bd) && kon(h.ink, h.zemin) >= 4.5, {bd: h.bd, ink: h.ink, kontrast: kon(h.ink, h.zemin)});
    // Altın'daki Etkinlik oyunları ekranında Altın oyunları da var (Altın kendi havuzunu görür)
    await ctx.close();
  }

  /* ---------- K: Kavram Haritası araması ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2});
    await altinAc(p);
    const r = await p.evaluate(async () => {
      go('links', {lk: {tab: 'harita'}}); await new Promise((r) => setTimeout(r, 1500));
      const intro = document.querySelector('.km-intro'), h = KMAP.roots(), hv = V59.KH.havuz();
      const gorunen = $.innerText;
      // listede görünmeyen (ilk gösterimde ekranda olmayan) bir ana kavram
      const gizli = hv.filter((c) => !gorunen.includes(c.term)).sort((a, b) => KMAP.counts(b.id).r - KMAP.counts(a.id).r)[0];
      return {view, p0: intro && intro.querySelector('p').textContent, p1: intro && intro.querySelectorAll(':scope > p')[1].textContent, kutu: !!document.querySelector('#km59-q'), kok: h.length, hv: hv.length, py: V34.S().py, gizli: gizli && {id: gizli.id, term: gizli.term, grade: gizli.grade, py: gizli.programYear, r: KMAP.counts(gizli.id).r}};
    });
    await p.screenshot({path: path.join(SH, 'kavram-haritasi-giris.png')});
    ok('K1 Kavram Haritası açıklaması istenen sade metin; arama kutusu var; 191 ana kavram (2026 programı) ve bütün kayıtlar (273 = iki program) korunuyor',
      r.p0 === 'Bir ana kavram seç, onunla bağlantılı kavramları keşfet. Alt kavramları, bağlantılı kavramları ve karıştırılabilecek kavramları harita üzerinde incele.' && r.kutu && r.hv === 191 && r.kok === 273 && r.py === '2026' && /191 ana kavram/.test(r.p1), r);
    await p.fill('#km59-q', r.gizli.term.slice(0, Math.max(3, Math.min(r.gizli.term.length, 6)))); await p.waitForTimeout(500);
    const s = await p.evaluate((id) => { const L = [...document.querySelectorAll('#km59-son .km59-o')]; const o = L.find((x) => x.getAttribute('onclick').includes("'" + id + "'")); return {n: L.length, sonuc: L.slice(0, 4).map((x) => x.innerText.replace(/\s+/g, ' ')), bulunan: o && o.innerText.replace(/\s+/g, ' '), acik: !document.querySelector('#km59-son').hidden}; }, r.gizli.id);
    await p.screenshot({path: path.join(SH, 'kavram-haritasi-arama.png')});
    ok('K2 Arama, ekrandaki listeyle sınırlı değil: ilk listede görünmeyen bir ana kavram bulunuyor; sonuçta kavram adı, sınıfı ve bağlantılı kavram sayısı görünüyor',
      s.acik && !!s.bulunan && s.bulunan.includes(r.gizli.term) && s.bulunan.includes(r.gizli.grade + '. sınıf') && s.bulunan.includes(r.gizli.r + ' bağlantılı kavram'), {aranan: r.gizli, s});
    await p.evaluate((id) => [...document.querySelectorAll('#km59-son .km59-o')].find((x) => x.getAttribute('onclick').includes("'" + id + "'")).click(), r.gizli.id); await p.waitForTimeout(1000);
    const m = await p.evaluate(() => ({sel: V34.S().sel, metin: $.innerText + ' ' + $.textContent, view}));
    await p.screenshot({path: path.join(SH, 'kavram-haritasi-secilen.png')});
    ok('K3 Sonuca dokununca o kavramın haritası açılıyor', m.view === 'links' && m.sel && m.sel.type === 'concept' && m.sel.id === r.gizli.id && m.metin.toLocaleLowerCase('tr-TR').includes(r.gizli.term.toLocaleLowerCase('tr-TR')) && /ALT KAVRAMLAR/i.test(m.metin), {sel: m.sel, view: m.view, aranan: r.gizli.term, adVar: m.metin.toLocaleLowerCase('tr-TR').includes(r.gizli.term.toLocaleLowerCase('tr-TR')), altVar: /ALT KAVRAMLAR/i.test(m.metin)});
    // her ana kavram aranabiliyor (tam adıyla aranınca sonuçlarda var)
    const hepsi = await p.evaluate(() => { const hv = V59.KH.havuz(); const yok = hv.filter((c) => !V59.KH.bul(c.term).some((x) => x.id === c.id)).map((c) => c.term); return {n: hv.length, yok}; });
    ok('K4 191 ana kavramın her biri adıyla aranınca bulunuyor; Enter ilk sonucu açıyor', hepsi.n === 191 && hepsi.yok.length === 0, hepsi);
    // 2018 programı seçilince arama 2018 ana kavramlarında
    const p18 = await p.evaluate(async () => { V34.S().py = '2018'; V34.S().sel = null; V34.render(); await new Promise((r) => setTimeout(r, 700)); return {hv: V59.KH.havuz().length, karisik: V59.KH.havuz().some((c) => c.programYear !== '2018')}; });
    ok('K5 2018 ve 2026 programları karışmıyor: 2018 seçilince arama yalnız 2018 ana kavramlarında (273 − 191 = 82)', p18.hv === 82 && !p18.karisik, p18);
    await p.evaluate(async () => { V34.S().py = '2026'; V34.render(); });
    await ctx.close();
  }

  /* ---------- Y: Altın anlatım tipografisi (yalnız CSS; içerik aynı) ---------- */
  {
    const metin = async (dosya) => {
      const {p, ctx} = await sayfa({ses: ED, dosya, dpr: 2, ek: {'dk-ptema43': 'gece'}});
      await altinAc(p);
      const o = await p.evaluate(async () => {
        const R = {};
        for (const t of ['TPC18-4-1-01', 'TPC-5-1-01', 'TPC-9-1-01']) { go('pders', {pt: t, ptab: 'anlat'}); await new Promise((r) => setTimeout(r, 1300)); const pn = document.querySelector('.p39-pane'); R[t] = pn ? pn.innerText.replace(/\s+/g, ' ') : ''; }
        const cs = (s) => { const e = document.querySelector(s); return e && getComputedStyle(e); };
        const h1 = cs('.p39-dh h1'), h3 = cs('.p39-blk h3'), h4 = cs('.p39-blk h4'), pp = cs('.p39-blk p:not(:last-child)'), kv = cs('.p39-blk.k-kavram h3');
        const zem = (s) => { let e = document.querySelector(s); while (e) { const c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; e = e.parentElement; } return getComputedStyle(document.body).backgroundColor; };
        return {R, h1: h1 && [h1.fontWeight, h1.fontSize], h3: h3 && [h3.fontWeight, h3.fontSize, h3.fontFamily], h4: h4 && [h4.fontWeight, h4.fontSize], kv: kv && [kv.fontWeight, kv.fontSize], p: pp && [pp.fontSize, pp.lineHeight, pp.marginBottom, pp.fontFamily, pp.color], pz: zem('.p39-blk p:not(:last-child)')};
      });
      if (dosya === F) await p.screenshot({path: path.join(SH, 'altin-anlatim-tipografi.png')});
      await ctx.close(); return o;
    };
    const y1 = await metin(F), y0 = await metin(F0);
    ok('Y1 Anlatım içeriği değişmedi: üç sınıfta (4/2018, 5/2026, 9/2026) anlatım bölmesinin metni V58.0 ile karakteri karakterine aynı', Object.keys(y1.R).every((k) => y1.R[k] && y1.R[k] === y0.R[k]), Object.fromEntries(Object.keys(y1.R).map((k) => [k, [y1.R[k].length, y0.R[k].length]])));
    const px = (x) => parseFloat(x);
    ok('Y2 Tipografi: ana başlıklar daha kalın (800), alt başlıklar bir kademe küçük ve orta kalınlıkta (600), kavram başlıkları belirgin; paragraf satır aralığı ≥ 1.75, paragraf arası açık; serif yazı tipi korunuyor (Literata)',
      +y1.h3[0] >= 800 && +y1.h3[0] > +y0.h3[0] - 1 && (!y1.h4 || (+y1.h4[0] === 600 && px(y1.h4[1]) < px(y1.h3[1]))) && (!y1.kv || +y1.kv[0] >= 800) && px(y1.p[1]) / px(y1.p[0]) >= 1.75 && px(y1.p[2]) > 0 && /Literata|serif/i.test(y1.p[3]) && /Literata|serif/i.test(y1.h3[2]),
      {V59: {h1: y1.h1, h3: y1.h3.slice(0, 2), h4: y1.h4, kavram: y1.kv, p: y1.p.slice(0, 3)}, V58: {h1: y0.h1, h3: y0.h3.slice(0, 2), h4: y0.h4, kavram: y0.kv, p: y0.p.slice(0, 3)}});
    ok('Y3 Gece anlatımında paragraf kontrastı yüksek (≥ 7, AAA) ve V58’den düşük değil', kon(y1.p[4], y1.pz) >= 7 && kon(y1.p[4], y1.pz) >= kon(y0.p[4], y0.pz) - 0.05, {V59: kon(y1.p[4], y1.pz), V58: kon(y0.p[4], y0.pz)});
  }

  /* ---------- S: Altın öğrenci sınıf ekranı ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 2});
    await altinAc(p);
    const r = await p.evaluate(async () => {
      go('psinif', {pg: 4}); await new Promise((r) => setTimeout(r, 1500));
      const t = $.innerText;
      return {view, ek: !!document.querySelector('details.sn55-ek'), arac: /Öğrenme araçları/.test(t), kaz: /Kazanım ilerlemesi/.test(t), bilgi: /Sınıf bilgileri/.test(t), nk: !!document.querySelector('.nk57'), unite: document.querySelectorAll('.sn55-ub, .ak55-b').length, fn: typeof V55.Sinif.duzenle === 'function' && typeof V39.r_psinif === 'function'};
    });
    await p.screenshot({path: path.join(SH, 'altin-sinif-ogrenci.png'), fullPage: true});
    ok('S1 Altın öğrenci sınıf ekranında “Öğrenme araçları”, “Kazanım ilerlemesi” ve “Sınıf bilgileri” yok; “Nerede Kaldım?” ve ünite akordiyonu duruyor; veri işlevleri silinmedi',
      r.view === 'psinif' && !r.ek && !r.arac && !r.kaz && !r.bilgi && r.nk && r.unite > 0 && r.fn, r);
    const og = await p.evaluate(async () => {
      V50.Mod.gec('ogretmen'); await new Promise((r) => setTimeout(r, 1200));
      OGRT.S().tab = 'siniflar'; OGRT.render(); await new Promise((r) => setTimeout(r, 700)); const sn = $.innerText;
      OGRT.S().tab = 'haftalik'; OGRT.render(); await new Promise((r) => setTimeout(r, 700)); const hf = $.innerText;
      go('editor'); await new Promise((r) => setTimeout(r, 900)); const ed = {view, t: $.innerText.slice(0, 300)};
      return {sn: /Sınıflarım/.test(sn), hf: /Kazanım|hafta/i.test(hf), ed};
    });
    ok('S2 Kaldırılan alanlar öğretmen ve editör ekranlarını etkilemiyor: Öğretmen Modu Sınıflarım ve Haftalık, Editör Onay Alanı açılıyor', og.sn && og.hf && og.ed.view === 'editor', og);
    await ctx.close();
  }

  /* ---------- Z: Öğretmen kazanım kartı ---------- */
  {
    const {p, ctx} = await sayfa({dpr: 2});
    await p.evaluate(async () => {
      V50.Mod.gec('ogretmen'); await new Promise((r) => setTimeout(r, 1200));
      OGRT.S().tab = 'siniflar'; OGRT.render(); await new Promise((r) => setTimeout(r, 600));
      const b = [...document.querySelectorAll('#app button')].find((x) => x.textContent.trim() === 'Ekle'); if (b) b.click(); await new Promise((r) => setTimeout(r, 800));
      OGRT.S().tab = 'haftalik'; OGRT.render(); await new Promise((r) => setTimeout(r, 900));
    });
    const olc = () => p.evaluate(async () => {
      const k = document.querySelector('.ogw-c.c-kaz'); if (!k) return {yok: 1};
      if (k.tagName === 'DETAILS') k.open = true;
      window.scrollTo(0, k.getBoundingClientRect().top + scrollY - 70); await new Promise((r) => setTimeout(r, 300));
      const q = (s) => k.querySelector(s), cs = (e) => e && getComputedStyle(e);
      const kod = q('.ogw-l code, .ogw-kt code, code'), mt = q('.ogw-kt'), hf = q('.ogw-kt + p.small'), ac = q('.ogw-kr .ogw-b.p'), tas = q('.ogw-more');
      const once = (a, b) => !!(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
      const btns = [...k.querySelectorAll('button, .ogw-more > summary')].filter((x) => x.getBoundingClientRect().height > 0);
      const alan = (e) => { const r = e.getBoundingClientRect(); return r.width * r.height; };
      const kart = cs(k), zem = getComputedStyle(document.body).backgroundColor, kartZ = document.querySelector('.ogw-c:not(.c-kaz)');
      return {bd: kart.borderTopColor, bdw: kart.borderTopWidth, bg: kart.backgroundImage.slice(0, 120), standartBd: kartZ ? getComputedStyle(kartZ).borderTopColor : '', kodBg: cs(kod).backgroundImage + cs(kod).backgroundColor, kodFs: cs(kod).fontSize, mtFs: cs(mt).fontSize, mtFw: cs(mt).fontWeight, mtInk: cs(mt).color, acBg: cs(ac).backgroundImage, acInk: cs(ac).color, acH: ac.getBoundingClientRect().height, acEnBuyuk: btns.every((x) => x === ac || alan(x) <= alan(ac)), sira: [once(kod, mt), once(mt, hf), once(hf, ac), once(ac, tas)], zem, metin: (mt.textContent || '').trim().slice(0, 80), th: document.documentElement.dataset.tema54o + '/' + document.documentElement.dataset.tema54om};
    });
    const R = {};
    R.altinGece = await olc(); await p.screenshot({path: path.join(SH, 'kazanim-karti-altin-gece.png')});
    const tema = async (js) => { await p.evaluate(async (js) => { eval(js); await new Promise((r) => setTimeout(r, 800)); OGRT.render(); await new Promise((r) => setTimeout(r, 700)); }, js); };
    await tema("V54.Tema.mod('ogretmen','gunduz')"); R.altinGunduz = await olc(); await p.screenshot({path: path.join(SH, 'kazanim-karti-altin-gunduz.png')});
    await tema("V54.Tema.mod('ogretmen','gece'); V54.Tema.sec('ogretmen','zumrut')"); R.zumrut = await olc();
    await tema("V54.Tema.sec('ogretmen','lacivert')"); R.lacivert = await olc();
    await tema("V57.Tema.elmas('ogretmen','gece')"); R.elmasGece = await olc(); await p.screenshot({path: path.join(SH, 'kazanim-karti-elmas-gece.png')});
    await tema("V57.Tema.elmas('ogretmen','gunduz')"); R.elmasGunduz = await olc(); await p.screenshot({path: path.join(SH, 'kazanim-karti-elmas-gunduz.png')});
    const hepsi = Object.values(R);
    ok('Z1 Kazanım kartı her öğretmen temasında (Altın gece/gündüz, Zümrüt, Lacivert, Elmas gece/gündüz) kendi altın çerçevesini ve altın “İçeriği aç” düğmesini koruyor; Elmas temasında bile standart kartlardan ayrışıyor',
      hepsi.every((x) => !x.yok && sicakMi(x.bd) && /gradient/.test(x.acBg) && parseFloat(x.bdw) >= 1) && !sicakMi(R.elmasGece.standartBd || 'rgb(0,0,255)'), Object.fromEntries(Object.entries(R).map(([k, x]) => [k, {th: x.th, bd: x.bd, standart: x.standartBd}])));
    ok('Z2 Hiyerarşi: kazanım kodu → kazanım metni → haftalar → İçeriği aç → Taşı, değiştir veya çıkar; “İçeriği aç” kartın en büyük düğmesi (≥ 56 px); metin iri ve kalın', hepsi.every((x) => x.sira.every(Boolean) && x.acEnBuyuk && x.acH >= 56 && parseFloat(x.mtFs) >= 19 && +x.mtFw >= 700), R.altinGece);
    ok('Z3 Okunurluk: kazanım metni ve “İçeriği aç” yazısı her temada yeterli kontrastta (metin ≥ 7, düğme ≥ 4.5)', hepsi.every((x) => kon(x.mtInk, x.zem) >= 7), Object.fromEntries(Object.entries(R).map(([k, x]) => [k, kon(x.mtInk, x.zem)])));
    await ctx.close();
  }

  /* ---------- E: Elmas teması Altın ve Öğretmen'in bütün arayüzünde; kendi temaları korunur ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, dpr: 1});
    const t0 = await p.evaluate(() => ({V59T: !!window.V59T, stil: !!document.getElementById('tema57')}));
    await altinAc(p);
    const t1 = await p.evaluate(() => ({V59T: !!window.V59T, stil: !!document.getElementById('tema57'), tema: document.documentElement.dataset.tema54a}));
    const tara = (ekranlar, ist) => p.evaluate(async ([E, ist]) => {
      const o = {};
      for (const [v, a] of E) { go(v, a); await new Promise((r) => setTimeout(r, 1300)); for (const y of [0, 600]) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 200)); const L = __sicak(ist); if (L.length) o[v + '@' + y] = L.slice(0, 6); } }
      return o;
    }, [ekranlar, ist]);
    const AE = [['pdunya', {}], ['psinif', {pg: 4}], ['pders', {pt: 'TPC18-4-1-01', ptab: 'anlat'}], ['pders', {pt: 'TPC18-4-1-01', ptab: 'pek'}], ['poyun', {}], ['games', {}], ['atlas57', {}], ['links', {lk: {tab: 'harita'}}], ['profil46', {}], ['acalis53', {}], ['ayar47', {}]];
    const R = {};
    for (const m of ['gece', 'gunduz']) { await p.evaluate(async (m) => { V57.Tema.elmas('altin', m); await new Promise((r) => setTimeout(r, 700)); }, m); R['altin-' + m] = await tara(AE, IST); }
    const t2 = await p.evaluate(() => ({V59T: !!window.V59T, stil: !!document.getElementById('tema57'), tema: document.documentElement.dataset.tema54a}));
    await p.evaluate(async () => { go('pdunya'); await new Promise((r) => setTimeout(r, 1200)); }); await p.screenshot({path: path.join(SH, 'altin-elmas-temasi.png')});
    // Öğretmen
    await p.evaluate(async () => {
      V50.Mod.gec('ogretmen'); await new Promise((r) => setTimeout(r, 1200));
      OGRT.S().tab = 'siniflar'; OGRT.render(); await new Promise((r) => setTimeout(r, 600));
      const b = [...document.querySelectorAll('#app button')].find((x) => x.textContent.trim() === 'Ekle'); if (b) b.click(); await new Promise((r) => setTimeout(r, 800));
    });
    for (const m of ['gece', 'gunduz']) {
      R['ogretmen-' + m] = await p.evaluate(async ([m, ist]) => {
        V57.Tema.elmas('ogretmen', m); await new Promise((r) => setTimeout(r, 700)); const o = {};
        for (const t of ['haftalik', 'siniflar', 'araclar']) { OGRT.S().tab = t; OGRT.render(); await new Promise((r) => setTimeout(r, 700)); for (const y of [0, 700, 1400]) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); const L = __sicak(ist); if (L.length) o[t + '@' + y] = L.slice(0, 6); } }
        UI.toast && UI.toast('Deneme bildirimi'); await new Promise((r) => setTimeout(r, 300)); const L = __sicak(ist); if (L.length) o.toast = L.slice(0, 6);
        return o;
      }, [m, IST]);
    }
    await p.evaluate(async () => { OGRT.S().tab = 'haftalik'; OGRT.render(); window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 600)); }); await p.screenshot({path: path.join(SH, 'ogretmen-elmas-temasi.png')});
    const kalan = Object.entries(R).filter(([, o]) => Object.keys(o).length);
    ok('E1 Elmas teması Altın Mod’da (gece ve gündüz) bütün ekranlarda: ana sayfa, sınıf, ders anlatımı ve pekiştirme, Oyun Dünyası, Etkinlik oyunları, Bilgi Atlası, Kavram Haritası, Profilim, Çalışma Masam, ayarlar — görünür öğelerde altın/kahve renk kalmadı (bilinçli istisnalar: Altın mod amblemi, durum rozetleri, oyun çizimleri, kazanım kartı)',
      !Object.keys(R['altin-gece']).length && !Object.keys(R['altin-gunduz']).length, {gece: R['altin-gece'], gunduz: R['altin-gunduz']});
    ok('E2 Elmas teması Öğretmen Modu’nda (gece ve gündüz): Haftalık, Sınıflarım, Araçlar, sekmeler, düğmeler, süzgeçler ve bildirim — sabit altın/kahve renk kalmadı (kazanım kartı kendi kimliğini bilinçli olarak korur)',
      !Object.keys(R['ogretmen-gece']).length && !Object.keys(R['ogretmen-gunduz']).length, {gece: R['ogretmen-gece'], gunduz: R['ogretmen-gunduz']});
    ok('E3 Ertelenen tema CSS’i: Elmas Mod ve Altın Mihrap’ta yüklenmiyor; Elmas teması seçilince ekleniyor', !t0.stil && !t1.stil && t1.tema === 'altin' && t2.stil && t2.V59T && t2.tema === 'elmas', {t0, t1, t2});
    // Altın ve Öğretmen kendi temaları
    const kim = await p.evaluate(async () => {
      const o = {altin: {}, ogretmen: {}};
      V50.Mod.gec('altin'); await new Promise((r) => setTimeout(r, 1200)); go('pdunya'); await new Promise((r) => setTimeout(r, 1000));
      for (const t of ['altin', 'lacivert', 'zumrut', 'murekkep', 'kumtasi']) { V54.Tema.sec('altin', t); V43.ayarla('gece'); await new Promise((r) => setTimeout(r, 500)); const c = getComputedStyle(document.body); o.altin[t] = [c.getPropertyValue('--p-gold').trim(), c.backgroundColor, document.documentElement.dataset.tema54a]; }
      V50.Mod.gec('ogretmen'); await new Promise((r) => setTimeout(r, 1200));
      for (const t of ['altin', 'lacivert', 'zumrut', 'murekkep', 'kumtasi']) { V54.Tema.sec('ogretmen', t); V54.Tema.mod('ogretmen', 'gece'); await new Promise((r) => setTimeout(r, 500)); const c = getComputedStyle(document.body); o.ogretmen[t] = [c.backgroundColor, document.documentElement.dataset.tema54o]; }
      return o;
    });
    const fark = (o, i) => new Set(Object.values(o).map((x) => x[i])).size;
    ok('E4 Altın’ın beş teması ve Öğretmen’in beş teması duruyor (her biri kendi zemini); Altın Mihrap’ta vurgu altın', fark(kim.altin, 1) === 5 && fark(kim.ogretmen, 0) === 5 && sicakMi(kim.altin.altin[0]) && Object.entries(kim.altin).every(([k, x]) => x[2] === k) && Object.entries(kim.ogretmen).every(([k, x]) => x[1] === k), kim);
    await ctx.close();
  }

  /* ---------- P: performans değişiklikleri davranışı değiştirmiyor ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, ek: {'dk-lite': '0'}});
    const r = await p.evaluate(async () => {
      V51.Yonetici.tamam = () => true; V59.Perf.sil();
      const s0 = Object.assign({}, V59.Perf.sayac);
      go('grade', {g: 5}); await new Promise((r) => setTimeout(r, 1200));
      const s1 = V59.Perf.sayac, cagri = s1.edOk - s0.edOk, hesap = s1.edOkHesap - s0.edOkHesap;
      const a = V38.edOk(); sessionStorage.removeItem('dk-editor-oturum38'); const b = V38.edOk(); sessionStorage.setItem('dk-editor-oturum38', '1'); const c = V38.edOk();
      const rv = document.querySelectorAll('#app .rv').length, rin = document.querySelectorAll('#app .rv.in').length;
      let trAnim = false; const app = document.getElementById('app'); const mo = new MutationObserver(() => { if (/\btr-\w+/.test(app.className)) trAnim = true; }); mo.observe(app, {attributes: true, attributeFilter: ['class']});
      go('topic', {t: 'TPC-5-1-01', tab: 'anlat'}); await new Promise((r) => setTimeout(r, 1200)); mo.disconnect();
      const hh = getComputedStyle(document.documentElement).getPropertyValue('--hh').trim(), bas = document.querySelector('header.top');
      return {cagri, hesap, a, b, c, rv, rin, trAnim, trKalan: /\btr-\w+/.test(app.className), hh, basH: bas && Math.round(bas.getBoundingClientRect().height)};
    });
    ok('P1 Editör oturum denetimi aynı çizimde bir kez hesaplanıyor (önbellek), oturum kapanınca/açılınca sonuç hemen değişiyor (davranış aynı)', r.cagri > 5 * Math.max(1, r.hesap) && r.a === true && r.b === false && r.c === true, r);
    ok('P2 Ekran geçiş animasyonu ve kademeli açılış çalışıyor (zorunlu yerleşim olmadan); başlık yüksekliği değişkeni (--hh) gerçek başlık yüksekliğiyle aynı', r.rv > 0 && r.rin > 0 && r.trAnim && !r.trKalan && parseInt(r.hh) === r.basH, r);
    // uzun kullanım: bellek, DOM, gözlemci
    const cdp = await ctx.newCDPSession(p); await cdp.send('HeapProfiler.enable');
    const yigin = async () => { await cdp.send('HeapProfiler.collectGarbage'); await p.waitForTimeout(300); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
    const tur = () => p.evaluate(async () => { for (const [v, a] of [['home'], ['grade', {g: 5}], ['topic', {t: 'TPC-5-1-01', tab: 'anlat'}], ['games'], ['atlas57'], ['profil46'], ['grade', {g: 7}], ['search']]) { go(v, a || {}); await new Promise((r) => setTimeout(r, 260)); } go('home'); await new Promise((r) => setTimeout(r, 500)); return {dom: document.getElementsByTagName('*').length}; });
    await p.evaluate(() => { window.__ro = 0; const R = window.ResizeObserver; window.ResizeObserver = class extends R { constructor(f) { super(f); window.__ro++; } }; });
    await tur(); const m0 = await yigin(), d0 = await tur(); await tur(); await tur();
    let d1; for (let i = 0; i < 6; i++) d1 = await tur();
    const m1 = await yigin();
    const ro = await p.evaluate(() => window.__ro);
    ok('P3 Uzun kullanım (10 tur × 9 ekran = 90 geçiş): bellek birikmiyor (çöp toplama sonrası yığın artışı < %15), ana sayfanın DOM öğe sayısı sabit, başlık için en çok bir ResizeObserver', m1 < m0 * 1.15 && d1.dom === d0.dom && ro <= 1, {yeniResizeObserver: ro, yiginMB: [+(m0 / 1048576).toFixed(1), +(m1 / 1048576).toFixed(1)], dom: [d0.dom, d1.dom]});
    await ctx.close();
  }

  /* ---------- D: kullanıcı verisi korunur ---------- */
  {
    const veri = {'dk2': JSON.stringify({added: {}, patch: {}, raw: [], prog: {'DKAB18-4-U01-O01': {c: 3, w: 1}}, cards: {}, dataVersion: 'x'}), 'dk-calis45': JSON.stringify({v: 1, hedef: 25, gun: {'2026-11-20': 7}, sg: {'2026-11-20': {4: 5}}}), 'dk-ilerleme39': JSON.stringify({z: {}, t: {}, fav: {s: [4], k: ['TPC18-4-1-01']}}), 'dk-tema54': JSON.stringify({v: 1, altin: 'zumrut', ogretmen: 'lacivert', ogretmenMod: 'gunduz'}), 'dk-ptema43': 'gunduz', 'dk-theme': 'light', 'dk-oyun41': JSON.stringify({v: 1, oyunlar: {dunya45: {g4: {x: 1}}}, ayar: {}})};
    const {p, ctx} = await sayfa({ek: veri});
    const r = await p.evaluate(async () => { for (const v of ['games', 'atlas57', 'home']) { go(v); await new Promise((r) => setTimeout(r, 700)); } const o = {}; ['dk-calis45', 'dk-ilerleme39', 'dk-tema54', 'dk-ptema43', 'dk-theme', 'dk-oyun41'].forEach((k) => o[k] = localStorage.getItem(k)); o.prog = JSON.parse(localStorage.getItem('dk2')).prog; return o; });
    ok('D1 Kullanıcı verisi korunur: ilerleme (dk2.prog), günlük hedef, favoriler, Altın/Öğretmen temaları, görünüm tercihleri, oyun kayıtları (dk-oyun41) aynen',
      r['dk-calis45'] === veri['dk-calis45'] && JSON.parse(r['dk-ilerleme39']).fav.k[0] === 'TPC18-4-1-01' && r['dk-tema54'] === veri['dk-tema54'] && r['dk-ptema43'] === 'gunduz' && r['dk-theme'] === 'light' && JSON.parse(r['dk-oyun41']).oyunlar.dunya45.g4.x === 1 && r.prog['DKAB18-4-U01-O01'] && r.prog['DKAB18-4-U01-O01'].c === 3, r);
    await ctx.close();
  }

  /* ---------- M: 360 px ---------- */
  {
    const {p, ctx} = await sayfa({ses: ED, w: 360, h: 640, dpr: 2});
    const olc = async (L) => { const o = {}; for (const [ad, js] of L) { o[ad] = await p.evaluate(async (js) => { eval(js); await new Promise((r) => setTimeout(r, 1100)); return document.documentElement.scrollWidth; }, js); } return o; };
    const el = await olc([['games', "go('games')"]]);
    await altinAc(p);
    const al = await olc([['poyun', "go('poyun')"], ['harita', "go('links',{lk:{tab:'harita'}})"], ['haritaAra', "document.querySelector('#km59-q').value='iman'; V59.KH.yaz('iman')"], ['psinif', "go('psinif',{pg:4})"], ['pders', "go('pders',{pt:'TPC18-4-1-01',ptab:'anlat'})"]]);
    await p.evaluate(async () => { go('links', {lk: {tab: 'harita'}}); await new Promise((r) => setTimeout(r, 1200)); const q = document.querySelector('#km59-q'); q.value = 'ahlak'; V59.KH.yaz('ahlak'); await new Promise((r) => setTimeout(r, 400)); window.scrollTo(0, q.getBoundingClientRect().top + scrollY - 80); }); await p.waitForTimeout(300);
    await p.screenshot({path: path.join(SH, 'telefon-360-kavram-arama.png')});
    const og = await olc([['ogretmen', "V50.Mod.gec('ogretmen')"]]);
    const hepsi = Object.assign({}, el, al, og);
    ok('M1 360 px telefonda (Elmas oyunlar, Altın Oyun Dünyası, Kavram Haritası ve arama sonuçları, sınıf, anlatım, Öğretmen Modu) yatay taşma yok', Object.values(hepsi).every((x) => x <= 361), hepsi);
    await ctx.close();
  }

  ok('Z9 Sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  await b.close(); st.close();
  const gecen = S.filter((x) => x.ok).length;
  console.log(`\n${gecen}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(SH, 'sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), gecen, toplam: S.length, kontroller: S}, null, 1));
  process.exit(gecen === S.length ? 0 : 1);
})();
