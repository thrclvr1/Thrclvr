// V46.0 testleri (depo kökünden): node tests/v46/test_v460.js
// Yerel http sunucusu + başsız Chromium (SwiftShader WebGL). Hafif mod (dk-lite) açıkça ayarlanır. Ekran görüntüleri: docs/V46.0_ekran/
// Kaydırma GERÇEK dokunma olaylarıyla ölçülür (CDP Input.dispatchTouchEvent; programla scrollTo değil).
// Google girişi: gerçek Google'a bağlanılmaz; test RSA anahtarıyla imzalanmış kimlik belgesi, yerel sunucunun (sunucu/sunucu.js)
// gerçek doğrulama kodundan geçer. Google'ın açılır penceresi ve gerçek hesap TEST EDİLMEDİ.
const {chromium, devices} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), crypto = require('crypto'), cp = require('child_process'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..');
const F46 = 'surumler/din-kulturu-platformu-v46.0.html', F45 = 'surumler/din-kulturu-platformu-v45.0.html';
const SH = path.join(ROOT, 'docs', 'V46.0_ekran'); fs.mkdirSync(SH, {recursive: true});
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); fs.createReadStream(f).pipe(r); }).listen(0);
const S = [], HATA = [];
const ok = (ad, kosul, ayr) => { const a = ayr === undefined ? '' : (typeof ayr === 'string' ? ayr : JSON.stringify(ayr)); S.push({ad, ok: !!kosul, ayr: a}); console.log((kosul ? '✔' : '✘') + ' ' + ad + (a ? '  — ' + a.slice(0, 420) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));

/* test kimlik belgesi */
const CID = 'test-istemci.apps.googleusercontent.com';
const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
const JWK = Object.assign(publicKey.export({format: 'jwk'}), {kid: 'k1', alg: 'RS256', use: 'sig'});
const b64u = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const belge = (y) => { const s = Math.floor(Date.now() / 1000), g = b64u({alg: 'RS256', kid: 'k1', typ: 'JWT'}) + '.' + b64u(Object.assign({iss: 'https://accounts.google.com', aud: CID, sub: '5001', email: 'ogrenci@example.com', email_verified: true, name: 'Deneme Öğrenci', iat: s, exp: s + 3600}, y || {})); return g + '.' + crypto.sign('RSA-SHA256', Buffer.from(g), privateKey).toString('base64url'); };

(async () => {
  await new Promise((r) => srv.once('listening', r));
  const KOK = 'http://127.0.0.1:' + srv.address().port, URL = () => KOK + '/' + F46;
  const b = await chromium.launch({args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const sayfa = async (o) => {
    o = Object.assign({w: 390, h: 844, lite: '0', mod: 'premium', cihaz: null, sec: false}, o || {});
    const ctx = await b.newContext(o.cihaz ? Object.assign({}, devices[o.cihaz]) : {viewport: {width: o.w, height: o.h}, isMobile: true, hasTouch: true});
    await ctx.addInitScript(([o]) => { if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-lite', o.lite); localStorage.setItem('dk-ptema43', 'gece'); if (!o.sec) localStorage.setItem('dk-deneyim39', JSON.stringify({son: o.mod, hatirla: true})); localStorage.setItem('dk-ilerleme39', JSON.stringify({ipucu40: 1})); }, [o]);
    const p = await ctx.newPage(); p.on('pageerror', (e) => HATA.push(e.message)); await p.goto(URL()); await p.waitForTimeout(1500);
    const cdp = await ctx.newCDPSession(p); return {p, ctx, cdp};
  };
  // gerçek dokunma ile sürükleme
  const surukle = async (cdp, x0, y0, x1, y1) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0}]}); for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: Math.round(x0 + (x1 - x0) * i / 10), y: Math.round(y0 + (y1 - y0) * i / 10)}]}); await bek(16); } await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await bek(120); };
  const sonOge = (p) => p.evaluate(() => { const L = [...document.querySelectorAll('#app button, #app p, #app li, #app h2, #app h3')].filter((e) => e.offsetParent && e.getBoundingClientRect().height); const e = L[L.length - 1]; return e ? Math.round(e.getBoundingClientRect().bottom) : 0; });

  /* A. Derleme ve veri güvenliği */
  const h46 = fs.readFileSync(path.join(ROOT, F46), 'utf8'), h45 = fs.readFileSync(path.join(ROOT, F45), 'utf8');
  const seeds = (s) => { const o = {}; for (const m of s.matchAll(/<script type="(?:application\/json|text\/plain)" id="([^"]+)">([\s\S]*?)<\/script>/g)) o[m[1]] = crypto.createHash('sha256').update(m[2]).digest('hex'); return o; };
  ok('A1 sürüm V46.0, index.html aynı dosya; V45.0 yedek dosyası duruyor', /V31\.VER="V46\.0"/.test(h46) && /content="V46\.0"/.test(h46) && fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === h46 && fs.existsSync(path.join(ROOT, F45)));
  ok('A2 içerik kayıtları ve kimlikleri (veri ve müzik blokları) V45.0 ile bayt bayt aynı', JSON.stringify(seeds(h46)) === JSON.stringify(seeds(h45)), Object.keys(seeds(h46)).length + ' blok');
  const deg = cp.execSync('git status --porcelain surumler/', {cwd: ROOT}).toString().split('\n').filter((x) => x.trim() && !x.includes('v46.0'));
  ok('A3 önceki sürüm dosyalarına dokunulmadı', deg.length === 0, deg.join(';') || 'yalnız v46.0');
  const kod46 = h46.replace(/<script type="(?:application\/json|text\/plain)" id="[^"]+">[\s\S]*?<\/script>/g, '');
  ok('A4 HTML kodunda gizli bilgi yok (client secret, istemci kimliği, oturum belirteci); veri blokları hariç tarandı', !/client_secret|GOCSPX-|\d{6,}-[a-z0-9]{20,}\.apps\.googleusercontent\.com/.test(kod46) && kod46.length > 1e6);

  /* B. Kaydırma: gerçek dokunma olayları, Samsung telefon ve tablet */
  {
    const EK = [['dunya-secim', "go('poyna',{oyn:'dunya45',obol:'',odevam:0})"], ['dunya-bolge', "go('poyna',{oyn:'dunya45',obol:'g5',odevam:0});setTimeout(()=>V45.Dunya.bolge(V45.Dunya.uniteler(5)[0].id),300)"],
      ['dunya-harita', "go('poyna',{oyn:'dunya45',obol:'g7',odevam:0})"], ['lab-bolum', "go('poyna',{oyn:'lab',obol:'',odevam:0})"], ['zaman-giris', "go('poyna',{oyn:'zaman',obol:V41.oyunlar.zaman.bolumler()[0].id,odevam:0})"],
      ['kutuphane-secim', "go('poyna',{oyn:'kutuphane',obol:'',odevam:0})"], ['kutuphane-giris', "go('poyna',{oyn:'kutuphane',obol:'9-2026-U03',odevam:0})"], ['oyun-merkezi', "go('poyun')"]];
    const R = [];
    for (const cihaz of ['Galaxy S9+', 'Galaxy Tab S4', 'Galaxy S9+ landscape']) {
      const {p, ctx, cdp} = await sayfa({cihaz}); const vp = p.viewportSize();
      for (const [ad, js] of EK) {
        await p.evaluate(js); await p.waitForTimeout(900); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100);
        const once = await sonOge(p), gerek = once > vp.height + 4;
        for (let k = 0; k < 14 && gerek; k++) { await surukle(cdp, Math.round(vp.width / 2), Math.round(vp.height * .8), Math.round(vp.width / 2), Math.round(vp.height * .2)); if (await sonOge(p) <= vp.height + 2) break; }
        const son = await sonOge(p), y = await p.evaluate(() => scrollY);
        R.push({cihaz, ad, gerek, ulasti: !gerek || son <= vp.height + 2, y});
        if (cihaz === 'Galaxy S9+' && ad === 'dunya-bolge') await p.screenshot({path: path.join(SH, 'kaydirma-dunya-bolge-sonu.png')});
      }
      await ctx.close();
    }
    const kotu = R.filter((x) => !x.ulasti), gerekli = R.filter((x) => x.gerek).length;
    ok('B1 oyun ekranları parmakla kaydırılınca içeriğin sonuna ulaşılır (Galaxy S9+, Galaxy Tab S4, yatay telefon; 8 ekran)', !kotu.length && gerekli >= 10, kotu.length ? kotu : `${R.length} ölçüm, ${gerekli} ekranda kaydırma gerekti`);
    // 3B oda sahnesi: yatay sürükleme kamerayı çevirir, sayfa kaymaz; panel kendi içinde kayar
    const {p, ctx, cdp} = await sayfa({cihaz: 'Galaxy S9+'}); const vp = p.viewportSize();
    await p.evaluate(() => go('poyna', {oyn: 'kutuphane', obol: '7-2026-U03', odevam: 0})); await p.waitForTimeout(900);
    await p.evaluate(() => V41.oyunlar.kutuphane.girisBitti()); await p.waitForTimeout(1500);
    const y0 = await p.evaluate(() => V41.oyunlar.kutuphane._test.kam().yaw);
    const yy = await p.evaluate(([w, h]) => { for (let f = .4; f < .95; f += .03) { const y = Math.round(h * f), a = document.elementFromPoint(Math.round(w * .75), y), b = document.elementFromPoint(Math.round(w * .25), y); if (a && b && a.classList.contains('o41-cv') && b.classList.contains('o41-cv')) return y; } return Math.round(h * .55); }, [vp.width, vp.height]);
    await surukle(cdp, Math.round(vp.width * .75), yy, Math.round(vp.width * .25), yy);
    const s1 = await p.evaluate(() => ({yaw: V41.oyunlar.kutuphane._test.kam().yaw, y: scrollY, tam: document.getElementById('o41').classList.contains('o41-tam'), h: document.getElementById('o41').getBoundingClientRect().height}));
    ok('B2 3B oda sahnesinde yatay sürükleme etrafa baktırır, sayfa kaymaz (sahne ekran yüksekliğine sabit)', Math.abs(s1.yaw - y0) > 5 && s1.y === 0 && s1.tam && Math.abs(s1.h - vp.height) < 2, {y0, s1});
    await p.evaluate(() => V41.oyunlar.kutuphane.defter()); await p.waitForTimeout(300);
    await p.evaluate(() => { const K = V41.oyunlar.kutuphane, I = K._test.icerik(); const D = K._test.durum(); I.odalar.forEach((o) => o.nes.forEach((n) => { D.kesif[o.id + ':' + n.id] = {b: n.not.b, m: n.not.m, k: n.not.k, o: o.ad}; })); K.panelKapat(true); K.defter(); });
    await p.waitForTimeout(300);
    const pk0 = await p.evaluate(() => { const k = document.querySelector('.o41-pk'); return {sh: k.scrollHeight, ch: k.clientHeight, st: k.scrollTop}; });
    await surukle(cdp, Math.round(vp.width / 2), Math.round(vp.height * .75), Math.round(vp.width / 2), Math.round(vp.height * .3));
    const pk1 = await p.evaluate(() => ({st: document.querySelector('.o41-pk').scrollTop, y: scrollY}));
    ok('B3 sahne üstündeki panel (Defter) kendi içinde parmakla kayar, arkadaki sayfa kaymaz', pk0.sh > pk0.ch && pk1.st > 0 && pk1.y === 0, {pk0, pk1});
    await ctx.close();
  }

  /* C. Kütüphane 4–12 */
  {
    const {p, ctx} = await sayfa({lite: '1'});
    const e = await p.evaluate(() => { const K = V41.oyunlar.kutuphane, E = K.envanter(), L = K.bolumler(); return {E, L: L.map((b) => ({id: b.id, sinif: b.sinif, program: b.program, hazir: b.hazir, oda: b.odaSay}))}; });
    const say = {}; e.E.forEach((x) => (say[x.durum] = (say[x.durum] || 0) + 1));
    fs.writeFileSync(path.join(__dirname, 'kutuphane_envanter.json'), JSON.stringify(e.E, null, 1));
    const sinif = [...new Set(e.L.map((b) => b.sinif))].join();
    ok('C1 envanter: 60 ünite (iki program) hazır / kısmen / eksik olarak çıkarıldı', e.E.length === 60 && say.hazir + say.kismen + say.eksik === 60, say);
    ok('C2 seçili programa göre 4–12. sınıflarda bölüm var; listedeki bütün bölümler oynanabilir', sinif === '4,5,6,7,8,9,10,11,12' && e.L.every((b) => b.hazir), {n: e.L.length, sinif});
    const v = await p.evaluate(() => { const K = V41.oyunlar.kutuphane, err = [], tur = new Set(), sekil = new Set(); let n = 0;
      K.bolumler().forEach((B) => { if (B.id === K.ESKI) return; const ic = K.icerik(B.id); n++; const sk = ic.odalar.map((o) => o.bulmaca.tur + (o.bulmaca2 ? '+k' : '')).join(','); sekil.add(sk);
        ic.konular.forEach((t) => { if (String(t.programYear) !== B.program || t.grade !== B.sinif) err.push(B.id + ' program/sınıf karışık ' + t.id); });
        ic.odalar.forEach((o) => { tur.add(o.ad);
          o.nes.forEach((nn) => { if (!nn.not.k) err.push(B.id + ' kaynaksız not'); });
          const b = o.bulmaca; [b, o.bulmaca2].filter(Boolean).forEach((x) => { if (x.tur === 'kadran') x.sorular.forEach((q) => { const Q = Store.get('questions', q.id); if (!Q || V45.KD.editorGerekli('questions', Q) || Q.answer !== q.cevap) err.push(B.id + ' soru ' + q.id); if (Store.get('topics', Q.topicId).unitId !== Store.get('units', K.BOL[B.id].unite).id) err.push(B.id + ' başka ünite sorusu'); }); });
          if (b.tur === 'yazit') b.cumleler.forEach((c) => { if (!c.secenek.includes(c.cevap)) err.push(B.id + ' yazıt'); });
          if (b.tur === 'raf') b.kitaplar.forEach((k) => { if (!b.raflar.includes(k.raf)) err.push(B.id + ' raf'); });
          if (b.tur === 'muhur' && b.ciftler.length !== 4) err.push(B.id + ' mühür sayısı'); }); });
      return {err: err.slice(0, 8), nerr: err.length, n, tur: [...tur], sekil: [...sekil]}; });
    ok('C3 bölümler yalnız kendi sınıf/program/ünite kayıtlarından kurulur; sorular ünitenin kaynak denetimli (A/B) sorularıdır; 2018 ile 2026 karışmaz', v.nerr === 0 && v.n === 44, v);
    ok('C4 odalar çeşitli: farklı oda türleri ve oda dizilimleri (aynı üç oda kopyalanmadı)', v.tur.length >= 12 && v.sekil.length >= 8, {odaAdlari: v.tur.length, dizilim: v.sekil});
    const es = await p.evaluate(() => { const ic = V41.oyunlar.kutuphane.icerik('5-2026-U01'); return ic.odalar.map((o) => o.ad).join(','); });
    ok('C5 5. sınıf 1. ünitenin elle kurulmuş bölümü (V41) aynen korunuyor', es === 'Düzen Salonu,İsimler Arşivi,Yazıt Odası', es);
    await ctx.close();
    // baştan sona oynanış: üç odalı genel bölüm ve tek odalı (yalnız şifreli kapı) bölüm
    const oyna = async (p, bid, ad) => {
      const K = 'V41.oyunlar.kutuphane';
      const animBit = () => p.waitForFunction((K) => { const k = eval(K)._test.kam(); return !k || !k.anim; }, K, {timeout: 6000}).catch(() => {});
      const tikla = async (sel) => { await animBit(); await p.evaluate((s) => { const e = document.querySelector(s); if (!e) throw new Error('yok: ' + s); e.click(); }, sel); };
      await p.evaluate((b) => go('poyna', {oyn: 'kutuphane', obol: b, odevam: 0}), bid); await p.waitForTimeout(900);
      await p.evaluate((K) => eval(K).girisBitti(), K); await p.waitForTimeout(1300);
      const n = await p.evaluate((K) => eval(K)._test.icerik().odalar.length, K);
      for (let r = 0; r < n; r++) {
        const o = await p.evaluate((K) => { const I = eval(K)._test.icerik(), o = I.odalar[eval(K)._test.durum().oda]; return JSON.parse(JSON.stringify({esik: o.esik, nes: o.nes.map((x) => x.id), b: o.bulmaca, b2: o.bulmaca2 || null}, (k, v) => (k === '_q' || k === 'konu' || k === 'tablo' ? undefined : v))); }, K);
        for (const id of o.nes.slice(0, o.esik)) { await tikla(`.o41-nes[data-n="${id}"]`); await p.waitForSelector('.o41-panel [data-kapat]', {timeout: 5000}); await p.click('.o41-panel [data-kapat]'); await p.waitForTimeout(500); }
        const coz = async (bb) => {
          await p.waitForSelector('.o41-panel .o41-bul', {timeout: 5000});
          if (bb.tur === 'muhur') for (const c of bb.ciftler) { await p.evaluate((id) => { document.querySelector(`.o41-mh[data-m="${CSS.escape(id)}"]`).click(); document.querySelector(`.o41-yuva[data-y="${CSS.escape(id)}"]`).click(); }, c.id); await p.waitForTimeout(80); }
          if (bb.tur === 'raf') for (const k of bb.kitaplar) { await p.evaluate(([id, r]) => { document.querySelector(`.o41-kt[data-k="${id}"]`).click(); document.querySelector(`.o41-raf[data-r="${CSS.escape(r)}"]`).click(); }, [k.id, k.raf]); await p.waitForTimeout(80); }
          if (bb.tur === 'yazit') for (const c of bb.cumleler) { await p.waitForSelector('.o41-tas', {timeout: 4000}); await p.evaluate((t) => { [...document.querySelectorAll('.o41-tas')].find((x) => x.dataset.t === t).click(); document.querySelector('.o41-bosluk').click(); }, c.cevap); await p.waitForTimeout(1300); }
          if (bb.tur === 'kadran') { for (let i = 0; i < bb.sorular.length; i++) for (let t = 0; t < 7; t++) { const v = await p.evaluate(([K, i]) => eval(K)._test.durum().cozum.kadran.deger[i], [K, i]); if (v === bb.sorular[i].cevap) break; await p.click(`.o41-kd[data-i="${i}"] .o41-ok[data-y="1"]`); } await p.click('[data-cevir]'); }
        };
        await tikla('.o41-nes[data-b]'); await coz(o.b);
        if (o.b2) { await p.waitForFunction(() => !document.querySelector('.o41-bul'), null, {timeout: 6000}); await p.waitForSelector('.o41-panel [data-kapat]', {timeout: 6000}); await p.click('.o41-panel [data-kapat]'); await p.waitForTimeout(600); await tikla('.o41-nes[data-k]'); await coz(o.b2); }
        await p.waitForSelector('.o41-panel [data-ileri]', {timeout: 9000}); if (r === 0) await p.screenshot({path: path.join(SH, `kutuphane-${ad}-kapi.png`)});
        await p.click('.o41-panel [data-ileri]'); await p.waitForTimeout(r < n - 1 ? 2200 : 1800);
      }
      return p.evaluate((b) => ({son: !!document.querySelector('.o41-son'), kayit: V41.bolumKayit('kutuphane', b), metin: (document.querySelector('.o41-son') || {}).innerText || ''}), bid);
    };
    const P2 = await sayfa({lite: '0'});
    await P2.p.evaluate(() => go('poyna', {oyn: 'kutuphane', obol: '7-2026-U03', odevam: 0})); await P2.p.waitForTimeout(900); await P2.p.screenshot({path: path.join(SH, 'kutuphane-7-giris.png')});
    const r1 = await oyna(P2.p, '7-2026-U03', '7');
    await P2.p.screenshot({path: path.join(SH, 'kutuphane-7-son.png')});
    ok('C6 7. sınıf “İslam Düşüncesinde Yorumlar” bölümü baştan sona oynandı (3 oda + şifreli kapı): yıldızlar ve kayıt', r1.son && r1.kayit.bitti && Object.keys(r1.kayit.yildiz).length === 3, {yildiz: r1.kayit.yildiz, puan: r1.kayit.puan});
    const r2 = await oyna(P2.p, '10-2026-U01', '10');
    ok('C7 10. sınıf kısa bölüm (yalnız şifreli kapı odası) baştan sona oynandı', r2.son && r2.kayit.bitti, {yildiz: r2.kayit.yildiz});
    const ky = await P2.p.evaluate(() => Object.keys((JSON.parse(localStorage.getItem('dk-oyun41')).oyunlar || {}).kutuphane || {}));
    ok('C8 her ünitenin kaydı ayrı (dk-oyun41.oyunlar.kutuphane.<bölüm>)', ky.includes('7-2026-U03') && ky.includes('10-2026-U01'), ky);
    await P2.p.evaluate(() => go('poyna', {oyn: 'kutuphane', obol: '', odevam: 0})); await P2.p.waitForTimeout(500); await P2.p.evaluate(() => V41.oyunlar.kutuphane.secim(document.getElementById('o41'), 7)); await P2.p.waitForTimeout(300);
    await P2.p.screenshot({path: path.join(SH, 'kutuphane-secim-7.png'), fullPage: true});
    ok('C9 bölüm seçimi: tamamlanan bölüm yıldızıyla görünür', await P2.p.evaluate(() => /tamamlandı/.test(document.querySelector('.k46-l').innerText)));
    // bütün sınıflarda oyunlar açılıyor
    const ac = [];
    for (let g = 4; g <= 12; g++) {
      const bid = await P2.p.evaluate((g) => (V41.oyunlar.kutuphane.bolumler().find((b) => b.sinif === g) || {}).id, g);
      await P2.p.evaluate((b) => go('poyna', {oyn: 'kutuphane', obol: b, odevam: 0}), bid); await P2.p.waitForTimeout(600); await P2.p.evaluate(() => V41.oyunlar.kutuphane.girisBitti()); await P2.p.waitForTimeout(900);
      const k = await P2.p.evaluate(() => ({sahne: !!document.querySelector('.o41-sahne'), nes: document.querySelectorAll('.o41-nes').length}));
      await P2.p.evaluate((g) => go('poyna', {oyn: 'dunya45', obol: 'g' + g, odevam: 0}), g); await P2.p.waitForTimeout(500);
      const d = await P2.p.evaluate(() => document.querySelectorAll('.d45-bolge').length);
      ac.push({g, bid, sahne: k.sahne, nes: k.nes, dunya: d});
      if (g === 4 || g === 11) await P2.p.screenshot({path: path.join(SH, `kutuphane-oda-${g}.png`)});
    }
    ok('C10 4–12 her sınıfta Kütüphane odası ve Sınıf Dünyası açılıyor', ac.every((x) => x.sahne && x.nes >= 3 && x.dunya >= 1), ac.map((x) => `${x.g}:${x.bid}:${x.nes}/${x.dunya}`).join(' '));
    await P2.ctx.close();
  }

  /* D. Sadeleştirme */
  {
    const {p, ctx} = await sayfa({mod: 'normal'});
    const h = await p.evaluate(() => ({kut: [...document.querySelectorAll('.h46 .h46-k b')].map((x) => x.textContent), nav: [...document.querySelectorAll('nav.bnav button')].map((x) => x.textContent.trim()), dugme: document.querySelectorAll('#app button').length}));
    ok('D1 Klasik ana sayfa: dört ana giriş (Derslerim, Oyunlar, Çalışmam, Profilim); alt menü beş düğme', h.kut.join() === 'Derslerim,Oyunlar,Çalışmam,Profilim' && h.nav.join() === 'Ana sayfa,Derslerim,Oyunlar,Çalışmam,Profilim' && h.dugme <= 10, h);
    await p.screenshot({path: path.join(SH, 'klasik-ana.png')});
    await p.evaluate(() => go('topic', {t: 'TPC-5-1-01', tab: 'anlat'})); await p.waitForTimeout(500);
    const t1 = await p.evaluate(() => ({seg: [...document.querySelectorAll('.seg46 button')].map((x) => x.textContent), gor: [...document.querySelectorAll('.tabs46 button[role=tab]:not(.g46h)')].map((x) => x.textContent.trim()), hepsi: document.querySelectorAll('.tabs46 button[role=tab]').length, kay: !!document.querySelector('.d46k')}));
    await p.click('.seg46 button[data-g="dene"]'); await p.waitForTimeout(500);
    const t2 = await p.evaluate(() => ({gor: [...document.querySelectorAll('.tabs46 button[role=tab]:not(.g46h)')].map((x) => x.textContent.trim()), on: (document.querySelector('.tabs46 button.on') || {}).textContent}));
    ok('D2 konu ekranı: Öğren / Pekiştir / Kendini Dene; yalnız seçili grubun sekmeleri görünür, hiçbir sekme silinmedi; kaynak etiketleri açılır bölümde', t1.seg.join() === 'Öğren,Pekiştir,Kendini Dene' && t1.gor.length < t1.hepsi && t1.hepsi >= 11 && t1.kay && /Mini Test/.test(t2.on) && t2.gor.every((x) => /Mini Test|Sınav|Oyun/.test(x)), {t1, t2});
    await p.screenshot({path: path.join(SH, 'klasik-konu.png')});
    await p.evaluate(() => go('classes')); await p.waitForTimeout(400);
    const c = await p.evaluate(() => [...document.querySelectorAll('.r46 b')].map((x) => x.textContent));
    await p.evaluate(() => go('calis45')); await p.waitForTimeout(400);
    const ca = await p.evaluate(() => [...document.querySelectorAll('.r46 b')].map((x) => x.textContent));
    ok('D3 taşınan bölümler ulaşılabilir: Derslerim → Sureler ve Dualar, Kavramlar, Kişiler, Bağlantılar; Çalışmam → Pekiştir, Kendini Dene, Sınavlar', c.join() === 'Sureler ve Dualar,Kavramlar,Kişiler ve eserler,Bağlantılar' && ca.join() === 'Pekiştir,Kendini Dene,Sınavlar', {c, ca});
    await p.evaluate(() => go('profil46')); await p.waitForTimeout(400);
    const pr = await p.evaluate(() => ({h: [...document.querySelectorAll('#app h2, #app summary')].map((x) => x.textContent.trim()), google: !!document.querySelector('.h46-hesap button.p')}));
    ok('D4 Profilim: Hesap (misafir + Google ile giriş), İlerlemem, Görünüm, program sürümü, öğretmen ve editör', ['Hesap', 'İlerlemem', 'Görünüm', 'Öğretmen ve editör'].every((x) => pr.h.includes(x)) && pr.google, pr.h);
    await p.screenshot({path: path.join(SH, 'klasik-profil.png'), fullPage: true});
    // içerik silinmedi: rotalar çalışıyor
    const R = []; for (const r of ['pek', 'dene', 'yanlis', 'cards', 'kavram', 'kisi', 'sd', 'exams', 'links', 'games', 'search']) { await p.evaluate((r) => go(r), r); await p.waitForTimeout(250); R.push(r + ':' + (await p.evaluate(() => view + ':' + document.getElementById('app').children.length))); }
    ok('D5 eski ekranların hepsi (Pekiştir, Kendini Dene, Yanlışlarım, Kartlar, Sözlük, Sureler, Sınavlar, Bağlantılar, Oyunlar, Arama) hâlâ açılıyor', R.every((x) => !/:0$/.test(x)), R.join(' '));
    // öğretmen: PIN yok
    await p.evaluate(() => go('ogretmen')); await p.waitForTimeout(600);
    const o = await p.evaluate(() => ({panel: !!document.querySelector('.og-tabs'), pin: !!document.querySelector('#app input[type=password], #app input[inputmode=numeric], .pin36, .pin37'), sekme: [...document.querySelectorAll('.og-tabs button')].map((x) => x.textContent.trim()), nav: [...document.querySelectorAll('nav.bnav button')].map((x) => x.dataset.k), sub: OGRT.SUB.map((x) => x[0])}));
    ok('D6 öğretmen paneli PIN istemeden açılıyor; editör onayı öğretmen panelinde değil (ayrı alan)', o.panel && !o.pin && !o.sub.includes('editor') && o.sekme.includes('Araçlar'), o);
    await p.screenshot({path: path.join(SH, 'ogretmen-pinsiz.png')});
    await p.click('.og-out'); await p.waitForTimeout(500);
    const o2 = await p.evaluate(() => ({view, nav: [...document.querySelectorAll('nav.bnav button')].map((x) => x.dataset.k), ok: V36.ok()}));
    ok('D7 öğretmen düğmesi yalnız öğretmen modunda; “Öğretmen modundan çık” sonrası öğrenci ekranında yok', o.nav.includes('ogretmen') && !o2.nav.includes('ogretmen') && !o2.ok && o2.view === 'home', {o: o.nav, o2});
    await p.evaluate(() => go('editor')); await p.waitForTimeout(500);
    ok('D8 editör alanı ayrı kalıyor (kendi PIN ekranı)', await p.evaluate(() => /editör PIN/i.test(document.getElementById('app').innerText)));
    // Klasik ↔ Premium geçişi
    await p.evaluate(() => go('grade', {g: 6})); await p.waitForTimeout(300); await p.evaluate(() => V42.gec('premium')); await p.waitForTimeout(900);
    const g1 = await p.evaluate(() => ({view, pg: G.pg, prem: document.body.hasAttribute('data-prem39')}));
    await p.evaluate(() => V42.gec('normal')); await p.waitForTimeout(900);
    const g2 = await p.evaluate(() => ({view, g: G.g, prem: document.body.hasAttribute('data-prem39'), nav: document.querySelectorAll('nav.bnav button').length}));
    ok('D9 Klasik ↔ Premium geçişi kaldığı yeri koruyor (6. sınıf)', g1.view === 'psinif' && +g1.pg === 6 && g1.prem && g2.view === 'grade' && +g2.g === 6 && !g2.prem && g2.nav === 5, {g1, g2});
    await ctx.close();
    const P = await sayfa();
    await P.p.evaluate(() => go('pdunya')); await P.p.waitForTimeout(900);
    const pn = await P.p.evaluate(() => ({nav: [...document.querySelectorAll('.nv40 button')].map((x) => x.textContent.trim()), hz: getComputedStyle(document.querySelector('.hz40') || document.body).display}));
    await P.p.screenshot({path: path.join(SH, 'premium-koridor.png')});
    await P.p.evaluate(() => go('psinif', {pg: 5})); await P.p.waitForTimeout(600);
    const ps = await P.p.evaluate(() => ({ar: !!document.querySelector('details.d46a .p40-ar'), acik: (document.querySelector('details.d46a') || {}).open}));
    await P.p.screenshot({path: path.join(SH, 'premium-sinif.png')});
    await P.p.evaluate(() => go('pders', {pt: 'TPC-5-1-01', ptab: 'anlat'})); await P.p.waitForTimeout(600);
    const pd = await P.p.evaluate(() => ({seg: document.querySelectorAll('.seg46 button').length, gizli: document.querySelectorAll('.p39-tabs .g46h').length, kay: !!document.querySelector('.d46k .kd45')}));
    await P.p.screenshot({path: path.join(SH, 'premium-ders.png')});
    ok('D10 Premium: koridor menüsü aynı dört alan; tekrar eden Hızlı Erişim yok; sınıf merkezinde araçlar açılır bölümde; ders ekranında üç ana sekme', pn.nav.join() === 'Derslerim,Oyunlar,Çalışmam,Profilim' && pn.hz === 'none' && ps.ar && !ps.acik && pd.seg === 3 && pd.gizli > 0 && pd.kay, {pn, ps, pd});
    await P.ctx.close();
  }

  /* E. Hesap: misafir, Google girişi (yerel sunucu), iki cihaz, birleştirme */
  {
    const js = http.createServer((q, r) => { r.writeHead(200, {'Content-Type': 'application/json'}); r.end(JSON.stringify({keys: [JWK]})); }).listen(0); await new Promise((r) => js.once('listening', r));
    const port = 18900 + Math.floor(Math.random() * 90), dbd = fs.mkdtempSync(path.join(os.tmpdir(), 'dkab46-'));
    const sv = cp.spawn(process.execPath, [path.join(ROOT, 'sunucu', 'sunucu.js')], {env: Object.assign({}, process.env, {PORT: port, GOOGLE_CLIENT_ID: CID, IZINLI_KOKENLER: KOK, VERITABANI: path.join(dbd, 'v.sqlite'), GOOGLE_JWKS_URL: 'http://127.0.0.1:' + js.address().port + '/', NODE_NO_WARNINGS: '1'}), stdio: ['ignore', 'pipe', 'pipe']});
    await new Promise((r) => sv.stdout.on('data', (d) => { if (/sunucusu/.test(d)) r(); }));
    const SU = 'http://127.0.0.1:' + port;
    try {
      const C1 = await sayfa({sec: true});
      const s0 = await C1.p.evaluate(() => ({blok: !!document.querySelector('#uye39 .hs46-sec'), g: !!document.querySelector('.hs46-g'), m: !!document.querySelector('.hs46-m')}));
      await C1.p.screenshot({path: path.join(SH, 'acilis-giris.png')});
      await C1.p.click('.hs46-m'); await C1.p.waitForTimeout(300); await C1.p.click('.uye39-b.cn'); await C1.p.waitForTimeout(700);
      const s1 = await C1.p.evaluate(() => ({mod: V46.Hesap.oku().mod, misafir: V46.Hesap.oku().misafir, view}));
      ok('E1 açılış: “Google ile giriş” ve “Misafir olarak devam et”; misafir seçilince hesapsız girilir (ilerleme cihazda)', s0.blok && s0.g && s0.m && s1.mod === 'misafir' && s1.misafir === 1, {s0, s1});
      // sunucu yokken Google girişi dürüst uyarı verir
      await C1.p.evaluate(() => V46.Hesap.googleGiris()); await C1.p.waitForTimeout(400);
      const u0 = await C1.p.evaluate(() => (document.querySelector('.v-ov, .sheet, [role=dialog]') || document.body).innerText);
      ok('E2 sunucu adresi yokken Google girişi bulut kaydı varmış gibi davranmaz: sunucu adresi ister', /sunucu adresini gir/i.test(u0), u0.slice(0, 120));
      await C1.p.fill('#hs46u', SU); await C1.p.evaluate(() => V46.Hesap.adresKaydet()); await C1.p.waitForTimeout(800);
      ok('E3 sunucu adresi profilde kaydediliyor ve sunucu deneniyor (/api/saglik)', await C1.p.evaluate((s) => V46.Hesap.oku().sunucu === s, SU));
      // misafirken ilerleme
      await C1.p.evaluate(() => { const Q = Store.all('questions').filter((q) => vis(q) && q.topicId === 'TPC-6-1-01'); Q.slice(0, 2).forEach((q) => MT.rec(q, q.answer)); MT.rec(Q[2], (Q[2].answer + 1) % Q[2].options.length); Store.save(); const k = V41.kayit(); V41.bolumYaz('kutuphane', '6-2026-U01', {v: 1, giris: true, oda: 1, kesif: {}, cozum: {}, yildiz: {0: 2}, puan: {0: 80}, sure: 10, bitti: false, t: '2026-01-01'}); });
      const once = await C1.p.evaluate(() => ({prog: JSON.stringify(Store.ov.prog), w: Object.keys(Store.ov.wrong || {}).length}));
      // Google girişi: GIS'in vereceği kimlik belgesi (test anahtarıyla imzalı) uygulamanın giriş işlevine verilir
      const g1 = await C1.p.evaluate((t) => V46.Hesap.girisBelgesi(t), belge());
      const sv1 = await fetch(SU + '/api/giris', {method: 'POST', headers: {'Content-Type': 'application/json', Origin: KOK}, body: JSON.stringify({credential: belge()})}).then((r) => r.json());
      const bulut = await fetch(SU + '/api/veri', {headers: {Authorization: 'Bearer ' + sv1.oturum, Origin: KOK}}).then((r) => r.json());
      ok('E4 giriş: sunucu kimlik belgesini doğruladı; misafir ilerlemesi hesaba aktarıldı (kazanım, yanlış, oyun kaydı)', g1.ok && bulut.surum >= 1 && JSON.stringify(bulut.veri.dk2.prog) === once.prog && Object.keys(bulut.veri.dk2.wrong).length === once.w && bulut.veri['dk-oyun41'].oyunlar.kutuphane['6-2026-U01'].oda === 1, {g1, surum: bulut.surum});
      await C1.p.evaluate(() => go('profil46')); await C1.p.waitForTimeout(400); await C1.p.screenshot({path: path.join(SH, 'profil-google.png')});
      const g2 = await C1.p.evaluate(() => V46.Hesap.esitle()); const g3 = await C1.p.evaluate(() => V46.Hesap.esitle());
      const iki = await C1.p.evaluate(() => ({prog: JSON.stringify(Store.ov.prog), tests: (Store.ov.tests || []).length}));
      ok('E5 aynı veri tekrar eşitlenince iki kez eklenmez (kazanım sayıları değişmez)', g2.ok && g3.ok && iki.prog === once.prog, {once: once.prog.slice(0, 80), iki: iki.prog.slice(0, 80)});
      // ikinci cihaz
      const C2 = await sayfa({mod: 'normal'});
      await C2.p.evaluate((s) => { const o = V46.Hesap.oku(); o.sunucu = s; V46.Hesap.yaz(o); }, SU);
      const r2 = await C2.p.evaluate((t) => V46.Hesap.girisBelgesi(t), belge());
      const c2 = await C2.p.evaluate(() => ({prog: JSON.stringify(Store.ov.prog), oyun: (JSON.parse(localStorage.getItem('dk-oyun41')).oyunlar.kutuphane || {})['6-2026-U01']}));
      ok('E6 başka cihazdan aynı hesapla giriş: ilerleme ve oyun kaydı geri yüklendi (kaldığı yerden)', r2.ok && c2.prog === once.prog && c2.oyun && c2.oyun.oda === 1, {r2});
      // ikinci cihazda ilerleme → birinci cihaz eşitler → birleşik
      await C2.p.evaluate(() => { const Q = Store.all('questions').filter((q) => vis(q) && q.topicId === 'TPC-7-1-01'); MT.rec(Q[0], Q[0].answer); Store.save(); V41.bolumYaz('kutuphane', '6-2026-U01', {v: 1, giris: true, oda: 2, kesif: {}, cozum: {}, yildiz: {0: 2, 1: 3}, puan: {0: 80, 1: 100}, sure: 50, bitti: false, t: '2026-01-02'}); });
      const e2 = await C2.p.evaluate(() => V46.Hesap.esitle());
      const e1 = await C1.p.evaluate(() => V46.Hesap.esitle());
      const c1 = await C1.p.evaluate(() => ({o71: Object.keys(Store.ov.prog).some((o) => /DKAB-7-U01/.test(o)), oyun: JSON.parse(localStorage.getItem('dk-oyun41')).oyunlar.kutuphane['6-2026-U01'].oda}));
      ok('E7 iki cihazın ilerlemesi birleşir: ikinci cihazdaki yeni kazanım ve daha ileri oyun kaydı birinci cihaza geldi', e2.ok && e1.ok && c1.o71 && c1.oyun === 2, c1);
      await C1.p.evaluate(() => V46.Hesap.cikis(false)); await C1.p.waitForTimeout(500);
      const cx = await C1.p.evaluate(() => ({mod: V46.Hesap.oku().mod, prog: Object.keys(Store.ov.prog).length}));
      ok('E8 çıkış yapınca misafir moduna dönülür; bu cihazdaki ilerleme silinmez (istenirse “cihazı temizle”)', cx.mod === 'misafir' && cx.prog > 0, cx);
      await C1.ctx.close(); await C2.ctx.close();
    } finally { sv.kill(); js.close(); }
  }

  ok('F1 sayfa hatası yok', HATA.length === 0, HATA.slice(0, 5));
  const g = S.filter((x) => x.ok).length;
  console.log(`\nToplam: ${g}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), md5: crypto.createHash('md5').update(h46).digest('hex'), sonuc: S, hata: HATA}, null, 1));
  await b.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
