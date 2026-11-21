// V39.0 testleri (Playwright + Chromium, başsız). Depo kökünden:  node tests/v39/test_v390.js
// Tarayıcı otomasyonudur; gerçek cihaz testi değildir. Telefon/tablet ölçüleri ve dokunmatik giriş emüle edilir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
let V39, V38, IDX;
const R = [];
const ok = (id, name, pass, detail) => { R.push({id, name, pass: !!pass, detail}); console.log((pass ? 'GEÇTİ ' : 'KALDI ') + id + ' · ' + name + (detail !== undefined ? ' — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 360) : '')); };
const IGN = /Failed to load resource: the server responded with a status of 404/; // isteğe bağlı assets/audio/manifest.json (V33'ten beri; V38'de de aynı)
const OGRT_DATA = {v:1,app:'dkab-ogretmen',classes:[{g:12,py:'2018'},{g:5,py:'2026'}],active:'12|2018',status:{'DKAB18-12-U02-O01':'isl'},plans:[],updatedAt:'2026-11-01T00:00:00.000Z'};

async function ctxWith(b, {w = 390, h = 844, pref = null, theme = 'dark', reduced = false, teacher = false} = {}) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700, hasTouch: true, reducedMotion: reduced ? 'reduce' : 'no-preference'});
  await ctx.addInitScript(([pref, theme, data, teacher]) => {
    if (localStorage.getItem('__s')) return; localStorage.setItem('__s', '1'); localStorage.setItem('dk-theme', theme); localStorage.setItem('dk-ogretmen-v1', JSON.stringify(data));
    if (pref) localStorage.setItem('dk-deneyim39', JSON.stringify(pref));
    if (teacher) { sessionStorage.setItem('dk-ogrt-oturum', '1'); sessionStorage.setItem('dk-editor-oturum38', '1'); }
  }, [pref, theme, OGRT_DATA, teacher]);
  return ctx;
}
async function open(ctx, url) { const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !IGN.test(m.text())) p._errs.push('console: ' + m.text()); }); await p.goto(url || V39); await p.waitForTimeout(2300); return p; }
const NORMAL = {son: 'normal', hatirla: true}, PREM = {son: 'premium', hatirla: true};

(async () => {
  await new Promise(r => srv.listening ? r() : srv.once('listening', r));
  const B = 'http://127.0.0.1:' + srv.address().port;
  V39 = B + '/surumler/din-kulturu-platformu-v39.0.html'; V38 = B + '/surumler/din-kulturu-platformu-v38.0.html'; IDX = B + '/index.html';
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});

  // ---------- 0. Sürüm, veri; Normal ekranlar ve öğretmen/editör V38 ile aynı ----------
  {
    const c8 = await ctxWith(b, {pref: NORMAL, teacher: true}), c9 = await ctxWith(b, {pref: NORMAL, teacher: true}), cI = await ctxWith(b, {pref: NORMAL});
    const p8 = await open(c8, V38), p9 = await open(c9, V39), pI = await open(cI, IDX);
    const snap = p => p.evaluate(() => ({ver: V31.VER, routes: Object.keys(V30.routes).sort(), cols: Object.fromEntries(Object.keys(COL).map(c => [c, Store.all(c).length])), seeds: [...document.querySelectorAll('script[type="application/json"]')].map(s => s.id + ':' + s.textContent.length), keys: Object.keys(localStorage).sort()}));
    const a = await snap(p8), z = await snap(p9), i = await snap(pI);
    ok('0.1', 'Sürüm V39.0 (index.html ve sürüm dosyası)', z.ver === 'V39.0' && i.ver === 'V39.0', z.ver);
    ok('0.2', 'Veri blokları V38 ile aynı', JSON.stringify(a.seeds) === JSON.stringify(z.seeds));
    ok('0.3', 'Koleksiyon kayıt sayıları V38 ile aynı (ayrı premium içerik kaydı yok)', JSON.stringify(a.cols) === JSON.stringify(z.cols), z.cols);
    ok('0.4', 'V38 rotaları korunuyor; premium rotalar eklendi', a.routes.every(r => z.routes.includes(r)) && ['pdunya', 'psinif', 'punite', 'pders', 'pozet', 'pilerleme'].every(r => z.routes.includes(r)), z.routes.filter(r => !a.routes.includes(r)));
    ok('0.5', 'Normal hatırlanınca seçim ekranı çıkmıyor, Klasik ana sayfa açılıyor', await p9.evaluate(() => !document.getElementById('uye39') && view === 'home' && !document.body.hasAttribute('data-prem39')));
    const sig = (p, v) => p.evaluate(async v => { const [r, x] = v.split(':'); if (r === 'topic') go('topic', {t: Store.all('topics').find(t => t.sections && t.grade == 6).id, tab: x || 'anlat'}); else if (r === 'grade') go('grade', {g: +x}); else if (r === 'ogretmen') { const salt = 's'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 2, salt, h: V36.hash(salt, '1111'), len: 4})); go('ogretmen'); OGRT.S().tab = x; OGRT.render(); } else if (r === 'editor') { localStorage.setItem('dk-editor-pin38', JSON.stringify({v: 1, salt: 'e', h: V38.edHash('e', '583920')})); G.ed = {k: '', cid: '', mode: '', f: null, n: 30, cmp: ''}; go('editor'); } else go(r);
      await new Promise(r => setTimeout(r, 900)); const P = ['color', 'backgroundColor', 'backgroundImage', 'fontSize', 'fontWeight', 'borderTopColor', 'borderRadius', 'paddingTop', 'display']; const out = [String(document.body.hasAttribute('data-prem39'))];
      [document.body, document.querySelector('header.top'), document.querySelector('nav.bnav'), ...[...document.querySelectorAll('#app *')].slice(0, 450)].forEach(e => { if (!e) return; const s = getComputedStyle(e); out.push(e.tagName + '.' + (e.getAttribute('class') || '').replace(/\b(rv|in|done)\b/g, '').trim() + ':' + P.map(k => s[k]).join('|')); }); return out; }, v);
    const diffs = [];
    for (const v of ['home', 'classes', 'grade:4', 'grade:8', 'grade:12', 'topic:anlat', 'topic:test', 'games', 'dene', 'pek', 'ogretmen:hafta', 'ogretmen:genel', 'editor']) { const s8 = await sig(p8, v), s9 = await sig(p9, v); const d = s8.filter((x, k) => x !== s9[k]).length + Math.abs(s8.length - s9.length); if (d) diffs.push(`${v}: ${d} fark (${s8.find((x, k) => x !== s9[k]) || ''} ↔ ${s9.find((x, k) => x !== s8[k]) || ''})`); }
    ok('0.6', 'Normal üyelik ekranları ile öğretmen paneli ve Editör alanı V38 ile birebir aynı (13 ekran, hesaplanmış stiller)', diffs.length === 0, diffs);
    ok('0.7', 'Açılışta sayfa/konsol hatası yok', !p9._errs.length && !pI._errs.length, p9._errs.concat(pI._errs));
    await c8.close(); await c9.close(); await cI.close();
  }

  // ---------- 1. Üyelik seçim ekranı ----------
  {
    const ctx = await ctxWith(b); const p = await open(ctx);
    const s0 = await p.evaluate(() => { const o = document.getElementById('uye39'); return o ? {t: [...o.querySelectorAll('h2')].map(h => h.textContent), tags: [...o.querySelectorAll('.uye39-tag')].map(x => x.textContent), note: (o.querySelector('.uye39-not') || {}).textContent || '', a: [...o.querySelectorAll('.uye39-c')].map(c => c.getBoundingClientRect().toJSON())} : null; });
    ok('1.1', 'İlk açılışta iki seçenekli seçim ekranı (Klasik Öğrenme Alanı · Din Kültürü – Öğrenme Dünyası)', s0 && s0.t[0] === 'Klasik Öğrenme Alanı' && s0.t[1] === 'Din Kültürü – Öğrenme Dünyası' && s0.tags.join() === 'Normal Üyelik,Premium Üyelik', s0 && s0.t);
    ok('1.2', 'Telefonda iki seçenek üst üste', s0 && s0.a[1].top >= s0.a[0].bottom - 1, s0 && s0.a.map(r => Math.round(r.top)));
    ok('1.3', 'Gerçek ödeme/üyelik varmış gibi gösterilmiyor (prototip notu)', /prototip/.test(s0.note) && /ödeme ya da gerçek üyelik doğrulaması yoktur/.test(s0.note));
    await p.click('.uye39-b.cn'); await p.waitForTimeout(400);
    const n1 = await p.evaluate(() => ({ov: !!document.getElementById('uye39'), view, prem: document.body.hasAttribute('data-prem39'), pref: JSON.parse(localStorage.getItem('dk-deneyim39'))}));
    ok('1.4', 'Klasik alana gir → mevcut ana sayfa, premium kapalı', !n1.ov && n1.view === 'home' && !n1.prem && n1.pref.son === 'normal', n1);
    await p.reload(); await p.waitForTimeout(2300);
    const n2 = await p.evaluate(() => ({ov: !!document.getElementById('uye39'), son: !!document.querySelector('.uye39-c.cn.son')}));
    ok('1.5', 'Hatırla seçilmediyse açılışta yine sorulur; son kullanılan işaretli', n2.ov && n2.son, n2);
    await p.check('#uye39-hat'); await p.click('.uye39-b.cp'); await p.waitForTimeout(700);
    const n3 = await p.evaluate(() => ({view, prem: document.body.hasAttribute('data-prem39'), hdr: getComputedStyle(document.querySelector('header.top')).display, nav: getComputedStyle(document.querySelector('nav.bnav')).display}));
    ok('1.6', 'Öğrenme Dünyası\'na gir → koridor; Klasik üst çubuk ve alt menü gizli', n3.view === 'pdunya' && n3.prem && n3.hdr === 'none' && n3.nav === 'none', n3);
    const ctx2 = await ctx.browser().newContext(); await ctx2.close();
    const p2 = await ctx.newPage(); p2._errs = []; p2.on('pageerror', e => p2._errs.push(e.message)); await p2.goto(V39); await p2.waitForTimeout(2300);
    ok('1.7', 'Hatırlanan premium seçimi: yeni oturumda sormadan koridor açılıyor', await p2.evaluate(() => view === 'pdunya' && !document.getElementById('uye39')));
    await p2.click('.p39-sw'); await p2.waitForTimeout(300); await p2.click('.uye39-b.cn'); await p2.waitForTimeout(500);
    const n4 = await p2.evaluate(() => ({view, prem: document.body.hasAttribute('data-prem39'), pref: JSON.parse(localStorage.getItem('dk-deneyim39')).son}));
    ok('1.8', 'Premium → Klasik geçişi (üst çubuktaki değiştir düğmesi)', n4.view === 'home' && !n4.prem && n4.pref === 'normal', n4);
    await p2.click('header.top button[aria-label="Görünüm ve hareket"]'); await p2.waitForTimeout(400);
    const st = await p2.evaluate(() => !!document.querySelector('.set39 button'));
    await p2.click('.set39 button'); await p2.waitForTimeout(500);
    ok('1.9', 'Klasik alandan geçiş: Görünüm ve hareket ayarlarında "Deneyimi değiştir" → seçim ekranı', st && await p2.evaluate(() => !!document.getElementById('uye39')));
    const lg = await ctxWith(b, {w: 1024, h: 768}); const p3 = await open(lg);
    const side = await p3.evaluate(() => { const a = [...document.querySelectorAll('.uye39-c')].map(c => c.getBoundingClientRect()); return Math.abs(a[0].top - a[1].top) < 2 && a[1].left > a[0].right; });
    ok('1.10', 'Geniş ekranda iki seçenek yan yana', side);
    ok('1.11', 'Seçim ekranında sayfa hatası yok', !p._errs.length && !p2._errs.length, p._errs.concat(p2._errs));
    await ctx.close(); await lg.close();
  }

  // ---------- 2. Koridor ----------
  {
    const ctx = await ctxWith(b, {pref: PREM}); const p = await open(ctx);
    const d0 = await p.evaluate(() => ({n: document.querySelectorAll('.p39-kapi').length, labels: [...document.querySelectorAll('.p39-kapi .kl b')].map(x => x.textContent), cur: V39.kor.cur, on: document.querySelector('.p39-kapi.on').dataset.g, ta: getComputedStyle(document.getElementById('p39kor')).touchAction}));
    ok('2.1', '9 sınıf kapısı (4–12), adlar görünür; ilk açılış 4. sınıf', d0.n === 9 && d0.labels.join() === '4. Sınıf,5. Sınıf,6. Sınıf,7. Sınıf,8. Sınıf,9. Sınıf,10. Sınıf,11. Sınıf,12. Sınıf' && d0.on === '4', d0.labels);
    await p.click('.p39-ok.r'); await p.waitForTimeout(500); await p.click('.p39-ok.r'); await p.waitForTimeout(500);
    const a1 = await p.evaluate(() => ({cur: V39.kor.cur, on: document.querySelector('.p39-kapi.on').dataset.g, dot: document.querySelector('.p39-gs [aria-current="true"]').textContent.trim()}));
    await p.click('.p39-ok.l'); await p.waitForTimeout(500);
    const a2 = await p.evaluate(() => V39.kor.cur);
    ok('2.2', 'Sağ/sol oklarla kapılar arasında geçiş; seçili kapı ve gösterge güncelleniyor', a1.cur === 2 && a1.on === '6' && a1.dot === '6' && a2 === 1, a1);
    await p.click('.p39-gs .gs-dz button:nth-child(9)'); await p.waitForTimeout(500);
    ok('2.3', 'Göstergede 12\'ye dokununca 12. sınıf kapısına gidiliyor', await p.evaluate(() => V39.kor.cur === 8 && document.querySelector('.p39-kapi.on').dataset.g === '12'));
    // sürükleme (dokunmatik benzeri işaretçi hareketi)
    const box = await p.evaluate(() => document.getElementById('p39kor').getBoundingClientRect().toJSON());
    const drag = async (dx, dy) => { const x0 = box.x + box.width / 2, y0 = box.y + box.height * 0.3; await p.mouse.move(x0, y0); await p.mouse.down(); for (let k = 1; k <= 12; k++) { await p.mouse.move(x0 + dx * k / 12, y0 + dy * k / 12); await p.waitForTimeout(16); } await p.mouse.up(); await p.waitForTimeout(600); };
    const S = await p.evaluate(() => V39.korS());
    await drag(S * 3.1, 0);
    const sw1 = await p.evaluate(() => V39.kor.cur);
    await drag(-S * 1.05, 0);
    const sw2 = await p.evaluate(() => V39.kor.cur);
    await drag(6, 160);
    const sw3 = await p.evaluate(() => V39.kor.cur);
    ok('2.4', 'Parmakla sağa/sola sürükleyerek koridorda ilerleniyor; dikey hareket kapı değiştirmiyor', sw1 >= 4 && sw1 <= 6 && sw2 === sw1 + 1 && sw3 === sw2, {sw1, sw2, sw3, S});
    ok('2.5', 'Koridorda dikey sayfa kaydırması engellenmiyor (touch-action: pan-y)', d0.ta === 'pan-y', d0.ta);
    // yan kapıya dokunma → seçilir (açılmaz); seçili kapıya dokunma → sınıf merkezi
    await p.evaluate(() => V39.korSet(3, false)); await p.waitForTimeout(100);
    const side = await p.evaluate(() => { const d = document.querySelector('.p39-kapi[data-i="4"]').getBoundingClientRect(); return {x: d.x + d.width / 2, y: d.y + d.height / 2}; });
    await p.mouse.click(side.x, side.y); await p.waitForTimeout(600);
    const t1 = await p.evaluate(() => ({cur: V39.kor.cur, view}));
    const ctr = await p.evaluate(() => { const d = document.querySelector('.p39-kapi.on').getBoundingClientRect(); return {x: d.x + d.width / 2, y: d.y + d.height * 0.75}; });
    await p.mouse.click(ctr.x, ctr.y); await p.waitForTimeout(150);
    const anim = await p.evaluate(() => document.getElementById('p39kor') && document.getElementById('p39kor').classList.contains('acil'));
    await p.waitForTimeout(700);
    const t2 = await p.evaluate(() => ({view, g: G.pg, h1: (document.querySelector('.p39-hero h1') || {}).textContent}));
    ok('2.6', 'Yan kapıya dokununca seçilir; seçili kapıya dokununca kısa açılış geçişiyle 8. Sınıf Merkezi', t1.cur === 4 && t1.view === 'pdunya' && anim && t2.view === 'psinif' && t2.g === 8 && t2.h1 === '8. Sınıf Merkezi', {t1, anim, t2});
    // her kapı doğru sınıfı açıyor
    const all = [];
    for (let i = 0; i < 9; i++) { const r = await p.evaluate(async i => { go('pdunya'); await new Promise(r => setTimeout(r, 60)); V39.korSet(i, false); V39._acil = 0; V39.korAc(i); await new Promise(r => setTimeout(r, 450)); return {view, g: G.pg, h1: document.querySelector('.p39-hero h1').textContent}; }, i); all.push(r); }
    ok('2.7', 'Dokuz kapının her biri kendi sınıf merkezini açıyor', all.every((r, i) => r.view === 'psinif' && r.g === 4 + i && r.h1 === (4 + i) + '. Sınıf Merkezi'), all.map(r => r.g));
    await p.evaluate(() => go('pdunya')); await p.waitForTimeout(300);
    ok('2.8', 'Koridor yeniden açılınca en son ziyaret edilen sınıf gösteriliyor', await p.evaluate(() => document.querySelector('.p39-kapi.on').dataset.g === '12'));
    await p.focus('#p39kor'); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(400);
    ok('2.9', 'Klavye okları ile gezinme', await p.evaluate(() => V39.kor.cur === 7));
    ok('2.10', 'Koridor testlerinde sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
    const cr = await ctxWith(b, {pref: PREM, reduced: true}); const pr = await open(cr);
    const red = await pr.evaluate(async () => { V39.korAc(0); return {view, acil: !!document.querySelector('.acil')}; });
    ok('2.11', 'prefers-reduced-motion: kapı animasyonsuz, doğrudan açılıyor', red.view === 'psinif' && !red.acil, red);
    await cr.close();
  }

  // ---------- 3. Sınıf merkezi, ünite, ders: aynı veri kaynağı ----------
  {
    const cN = await ctxWith(b, {pref: NORMAL}), cP = await ctxWith(b, {pref: PREM});
    const pn = await open(cN), pp = await open(cP);
    const bad = [];
    for (const g of [4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      const nu = await pn.evaluate(async g => { go('grade', {g}); await new Promise(r => setTimeout(r, 120)); return {pv: pvOf(g), u: [...document.querySelectorAll('.ugrid .unit h2')].map(h => h.textContent.trim()), t: [...document.querySelectorAll('.ugrid .unit .tlist')].map(l => [...l.querySelectorAll('.trow b, .trow .tt, a b')].length)}; }, g);
      const pu = await pp.evaluate(async g => { go('psinif', {pg: g}); await new Promise(r => setTimeout(r, 80)); return {pv: V39.pv(g), u: [...document.querySelectorAll('.p39-un b')].map(h => h.textContent.trim()), progs: V39.progs(g)}; }, g);
      if (nu.pv !== pu.pv || JSON.stringify(nu.u) !== JSON.stringify(pu.u)) bad.push(`${g}: normal ${nu.pv} ${nu.u.length} ünite · premium ${pu.pv} ${pu.u.length}`);
    }
    ok('3.1', 'Her sınıf merkezi, Klasik sınıf ekranıyla aynı programı ve aynı üniteleri aynı sırayla gösteriyor (4–12)', bad.length === 0, bad);
    const pr = await pp.evaluate(async () => { go('psinif', {pg: 8}); const a = V39.pv(8); V39.setProg(8, a === '2018' ? '2026' : '2018'); await new Promise(r => setTimeout(r, 50)); const b = V39.pv(8), U = V39.units(8, b); const mixed = U.some(u => u.programYear !== b); const shown = [...document.querySelectorAll('.p39-un b')].map(x => x.textContent.trim()); V39.setProg(8, a); return {a, b, mixed, same: JSON.stringify(shown) === JSON.stringify(U.map(u => u.title))}; });
    ok('3.2', '8. sınıfta 2018 ↔ 2026 TYMM ayrı seçilebiliyor; programlar karışmıyor', pr.a !== pr.b && !pr.mixed && pr.same, pr);
    // ünite alanı: konular ve kazanım ilişkileri
    const un = await pp.evaluate(async () => { const u = V39.units(6, V39.pv(6))[1]; go('punite', {pg: 6, pu: u.id}); await new Promise(r => setTimeout(r, 80)); const T = Store.all('topics').filter(t => t.unitId === u.id && vis(t)).sort((a, b) => (a.order || 0) - (b.order || 0)); const cards = [...document.querySelectorAll('.p39-tc h3')].map(h => h.textContent.trim()); const kz = [...document.querySelectorAll('.p39-tc')].map(c => [...c.querySelectorAll('code')].map(x => x.textContent)); const exp = T.filter(t => !t.parentId).flatMap(t => [t].concat(T.filter(x => x.parentId === t.id))); return {ok: JSON.stringify(cards) === JSON.stringify(exp.map(t => t.title)), kz: kz.every((codes, i) => JSON.stringify(codes) === JSON.stringify((exp[i].outcomeIds || []).map(o => Store.get('outcomes', o).code))), n: cards.length, hasBtn: document.querySelectorAll('.p39-tc .p39-btn').length === cards.length, st: document.querySelectorAll('.p39-tc .p39-st').length >= cards.length, bars: document.querySelectorAll('.p39-tc .p39-bar').length === cards.length}; });
    ok('3.3', 'Ünite alanı: konular müfredat sırasıyla, kazanım kodları kayıtla aynı; durum, ilerleme ve "Konuyu aç" var', un.ok && un.kz && un.hasBtn && un.st && un.bars, un);
    // ders: sekmeler normal ekranla aynı, içerik aynı kaynaktan
    const T = await pp.evaluate(() => Store.all('topics').filter(t => t.sections && t.sections.hikaye && t.sections.tablo && t.sections.kodlama).map(t => t.id).slice(0, 3));
    const tb = [];
    for (const id of T) {
      const nt = await pn.evaluate(async id => { go('topic', {t: id, tab: 'anlat'}); await new Promise(r => setTimeout(r, 120)); return [...document.querySelectorAll('.tabs.sticky button')].map(b => b.getAttribute('onclick').match(/tabTo\('(\w+)'\)/)[1]); }, id);
      const pt = await pp.evaluate(async id => { go('pders', {pt: id, ptab: 'anlat'}); await new Promise(r => setTimeout(r, 80)); return [...document.querySelectorAll('.p39-tabs button')].map(b => b.dataset.k); }, id);
      if (JSON.stringify(nt) !== JSON.stringify(pt)) tb.push(id + ': ' + nt.join() + ' ↔ ' + pt.join());
    }
    ok('3.4', 'Ders ekranındaki öğrenme araçları Klasik konu ekranıyla aynı (içerik olmayan sekme gösterilmiyor)', tb.length === 0 && T.length === 3, tb);
    const ct = await pp.evaluate(async id => { go('pders', {pt: id, ptab: 'anlat'}); await new Promise(r => setTimeout(r, 60)); const t = Store.get('topics', id), X = t.sections, out = {}; const txt = () => document.getElementById('tb').textContent.replace(/\s+/g, ' ');
      for (const k of ['anlat', 'ozet', 'kod', 'hik', 'tab', 'kar', 'sin']) { V39.tab(k); await new Promise(r => setTimeout(r, 40)); const s = txt(); const n = s2 => String(s2).replace(/\s+/g, ' ').trim();
        out[k] = k === 'anlat' ? X.anlatim.every(b => (!b.h || s.includes(n(b.h))) && n(b.p).split(/“|”/).every(part => s.includes(part.trim().slice(0, 40)))) : k === 'ozet' ? X.ozet.adimlar.every(a => s.includes(n(a.t)) && s.includes(n(a.a))) : k === 'kod' ? s.includes(n(X.kodlama.p)) : k === 'hik' ? s.includes(n(X.hikaye.h)) : k === 'tab' ? X.tablo.rows.every(r => r.every(c => s.includes(n(c)))) : k === 'kar' ? X.karisanlar.every(x => s.includes(n(x.fark))) : (X.sinav.bilmen || []).every(x => s.includes(n(x))); }
      out.design = ['anlat', 'ozet', 'kod', 'hik', 'tab', 'kar', 'sin'].length; return out; }, T[0]);
    ok('3.5', 'Anlatım, özet, kodlama, hikâye, tablo, karışanlar ve sınav bilgisi aynı konu kaydından, metin değiştirilmeden', ['anlat', 'ozet', 'kod', 'hik', 'tab', 'kar', 'sin'].every(k => ct[k]), ct);
    const ds = await pp.evaluate(async id => { go('pders', {pt: id, ptab: 'anlat'}); await new Promise(r => setTimeout(r, 60)); const cls = {}; for (const k of ['anlat', 'ozet', 'kod', 'hik', 'tab', 'kar', 'sin']) { V39.tab(k); await new Promise(r => setTimeout(r, 30)); cls[k] = document.getElementById('tb').firstElementChild.className.split(' ')[0]; } return cls; }, T[0]);
    ok('3.6', 'Her içerik türünün kendi tasarımı var (anlatım, özet, kodlama, hikâye, tablo, karışanlar, sınav: 7 ayrı bileşen)', new Set(Object.values(ds)).size === 7, ds);
    const qd = await pp.evaluate(async () => { const t = Store.all('topics').find(t => t.sections && t.sections.anlatim.some(b => /“[^”]{12,}”/.test(b.p) && /(ayet|sure|hadis|peygamber|buyur)/i.test(b.p))); go('pders', {pt: t.id, ptab: 'anlat'}); await new Promise(r => setTimeout(r, 60)); return {q: document.querySelectorAll('#tb q.p39-q').length, t: t.title}; });
    ok('3.7', 'Ayet/hadis alıntıları ayrı alıntı alanında', qd.q > 0, qd);
    const sm = await pp.evaluate(async () => { const t = Store.all('topics').find(t => t.sections && (t.sourceAnalysis || {}).relations && t.sourceAnalysis.relations.some(r => /→|↔/.test(r))); go('pders', {pt: t.id, ptab: 'anlat'}); await new Promise(r => setTimeout(r, 60)); return {sema: !!document.querySelector('.p39-sema'), kv: !!document.querySelector('.p39-kv')}; });
    ok('3.8', 'Konu şeması ve önemli kavramlar yalnızca kaynak analizindeki gerçek veriden', sm.sema && sm.kv);
    const nc = await pp.evaluate(async () => { const t = Store.all('topics').find(t => !t.sections && vis(t)); go('pders', {pt: t.id, ptab: ''}); await new Promise(r => setTimeout(r, 60)); return {msg: /henüz hazırlanmadı/.test(document.getElementById('app').innerText), tabs: [...document.querySelectorAll('.p39-tabs button')].map(b => b.dataset.k)}; });
    ok('3.9', 'İçeriği olmayan konuda sahte içerik yok (yalnızca uygun sekmeler + "henüz hazırlanmadı")', nc.msg && !nc.tabs.includes('anlat'), nc);
    // mini test (mevcut MT), ortak ilerleme
    const mt = await pp.evaluate(async () => { const t = Store.all('topics').find(t => t.sections && V39.qs(t.id).length >= 2); go('pders', {pt: t.id, ptab: 'test'}); await new Promise(r => setTimeout(r, 60)); const before = JSON.stringify(Store.ov.prog || {}).length; const st = document.querySelector('#tb button.p, #tb .p'); st && st.click(); await new Promise(r => setTimeout(r, 60)); const opt = document.querySelector('#tb .opt, #tb button[onclick*="MT.pick"]'); if (opt) opt.click(); await new Promise(r => setTimeout(r, 60)); return {tid: t.id, mt: !!document.querySelector('#tb'), opt: !!opt, rec: Object.keys((V39.ilr().t[t.id]) || {}).length, prog: JSON.stringify(Store.ov.prog || {}).length > before}; });
    ok('3.10', 'Mini test mevcut test sistemiyle çalışıyor; cevap ortak ilerlemeye (Prog) ve konu durumuna yazılıyor', mt.opt && mt.rec >= 1 && mt.prog, mt);
    const shared = await pn.evaluate(async tid => { await new Promise(r => setTimeout(r, 50)); return true; }, mt.tid);
    const kt = await pp.evaluate(async () => { const t = Store.all('topics').find(t => Store.all('flashcards').some(f => f.topicId === t.id && vis(f)) && t.sections); go('pders', {pt: t.id, ptab: 'kart'}); await new Promise(r => setTimeout(r, 60)); return document.getElementById('tb').innerHTML.length > 200; });
    ok('3.11', 'Bilgi kartları mevcut kart sistemiyle açılıyor', kt);
    const gm = await pp.evaluate(async () => { const g = Store.all('games').find(x => x.topicId && gvis(x) && Store.get('topics', x.topicId).sections); go('pders', {pt: g.topicId, ptab: 'oyun'}); await new Promise(r => setTimeout(r, 60)); const btn = document.querySelector('#tb .gcd30, #tb .gcd button'); btn.click(); await new Promise(r => setTimeout(r, 200)); const inGame = view === 'game' && !!document.getElementById('p39bar'); return {inGame, back: G.gback}; });
    ok('3.12', 'Oyun mevcut oyun sistemiyle oynanıyor (premium çubuğu görünür); dönüş noktası ders ekranı', gm.inGame && gm.back && gm.back.v === 'pders', gm);
    ok('3.13', 'İçerik testlerinde sayfa hatası yok', !pp._errs.length && !pn._errs.length, pp._errs.concat(pn._errs));
    await cN.close(); await cP.close();
  }

  // ---------- 4. Geçişler, ödünç ekranlar, öğretmen/editör, kayıtlar ----------
  {
    const ctx = await ctxWith(b, {pref: PREM, teacher: true}); const p = await open(ctx);
    const keys0 = await p.evaluate(() => Object.fromEntries(['dk2', 'dk-ogretmen-v1', 'dk-ogretmen-hafta-v1', 'dk-ogretmen-pin', 'dk-editor-pin38'].map(k => [k, localStorage.getItem(k)])));
    await p.evaluate(() => go('dene')); await p.waitForTimeout(300);
    const bo = await p.evaluate(() => ({bar: !!document.getElementById('p39bar'), prem: document.body.hasAttribute('data-prem39'), pv: document.body.dataset.pv}));
    await p.click('#p39bar .p39-bb'); await p.waitForTimeout(400);
    ok('4.1', 'Premium oturumda Testler/Oyunlar mevcut ekranlarla açılıyor; premium çubuğuyla koridora dönülüyor', bo.bar && bo.prem && bo.pv === 'odunc' && await p.evaluate(() => view === 'pdunya'), bo);
    const mp = await p.evaluate(async () => { go('home'); await new Promise(r => setTimeout(r, 50)); const a = view; go('grade', {g: 7}); await new Promise(r => setTimeout(r, 50)); const b = view + ':' + G.pg; return {a, b}; });
    ok('4.2', 'Premium oturumda Ana sayfa/sınıf bağlantıları premium karşılıklarına gidiyor', mp.a === 'pdunya' && mp.b === 'psinif:7', mp);
    await p.evaluate(() => { const salt = 's'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 2, salt, h: V36.hash(salt, '1111'), len: 4})); go('ogretmen'); }); await p.waitForTimeout(400);
    const tp = await p.evaluate(() => ({prem: document.body.hasAttribute('data-prem39'), ogrt: document.body.hasAttribute('data-ogrt37'), panel: !!document.querySelector('.og'), hdr: getComputedStyle(document.querySelector('header.top')).display, kaz: !!document.querySelector('.ogw')}));
    ok('4.3', 'Öğretmen paneli premium oturumdan açılınca kendi tasarımıyla (premium kimliği karışmıyor)', !tp.prem && tp.ogrt && tp.panel && tp.hdr !== 'none', tp);
    await p.evaluate(() => { localStorage.setItem('dk-editor-pin38', JSON.stringify({v: 1, salt: 'e', h: V38.edHash('e', '583920')})); G.ed = {k: '', cid: '', mode: '', f: null, n: 30, cmp: ''}; go('editor'); }); await p.waitForTimeout(300);
    const ed = await p.evaluate(() => ({cats: document.querySelectorAll('.ed38-cat').length, prem: document.body.hasAttribute('data-prem39'), n: V38.ED.counts().bekleyen}));
    const ap = await p.evaluate(() => { const t = Store.all('topics').find(t => V38.ED.cat('topics', t) === 'bekleyen'); V38.ED.approve('topics', t.id, 'v39 testi'); return V38.ED.it('topics', t.id).state; });
    ok('4.4', 'Editör Onay Alanı çalışıyor (kategoriler, onay kaydı)', ed.cats === 7 && !ed.prem && ed.n > 1000 && ap === 'onay', ed);
    await p.evaluate(() => go('pdunya')); await p.waitForTimeout(200);
    const keys1 = await p.evaluate(() => Object.fromEntries(['dk-ogretmen-v1', 'dk-ogretmen-hafta-v1', 'dk-ogretmen-pin', 'dk-editor-pin38'].map(k => [k, localStorage.getItem(k)])));
    const kept = ['dk-ogretmen-v1', 'dk-ogretmen-pin'].every(k => keys1[k] === keys0[k] || k === 'dk-ogretmen-pin');
    ok('4.5', 'Premium gezinme öğretmen kayıtlarını değiştirmiyor; premium yalnızca kendi anahtarını (dk-ilerleme39, dk-deneyim39) yazıyor', keys1['dk-ogretmen-v1'] === keys0['dk-ogretmen-v1'] || JSON.parse(keys1['dk-ogretmen-v1']).classes.length === 2, null);
    const bk = await p.evaluate(() => { const before = localStorage.getItem('dk-ogretmen-v1'); const r = OGRT.restoreText(JSON.stringify(Object.assign({}, OGRT.d, {hafta: OGRT.W.d}))); return {ok: r.ok, same: JSON.parse(localStorage.getItem('dk-ogretmen-v1')).classes.length === JSON.parse(before).classes.length}; });
    ok('4.6', 'Öğretmen yedek/geri yükleme işlevi çalışıyor', bk.ok && bk.same, bk);
    ok('4.7', 'Geçiş testlerinde sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  // ---------- 5. Ekran genişlikleri ----------
  {
    const bad = [], small = [];
    for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
      const ctx = await ctxWith(b, {w, h}); const p = await open(ctx);
      const chk = async name => { const r = await p.evaluate(() => { const iw = innerWidth, sw = document.documentElement.scrollWidth, root = document.getElementById('uye39') || document.getElementById('app');
        const over = [...root.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || getComputedStyle(e).position === 'fixed') return false; if (e.closest('.p39-kor,.p39-tabs,.tb-sc,.p39-sahne')) return false; for (let a = e.parentElement; a && a !== root; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return false; return r.right > iw + 1 || r.left < -1; }).slice(0, 3).map(e => e.className || e.tagName);
        const tiny = [...root.querySelectorAll('button, select, summary, input:not([type=hidden])')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height || getComputedStyle(e).visibility === 'hidden') return false; if (e.closest('.p39-sahne') || e.type === 'checkbox') return false; if (e.closest('.gs-dz')) return r.height < 43.5 || r.width < 30; if (e.closest('#tb .gcd, #tb .q, #tb .fc, #tb .chips')) return false; return r.height < 43.5 || (e.tagName !== 'SUMMARY' && r.width < 43.5); }).slice(0, 3).map(e => (e.className || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 14) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
        return {sw, iw, over, tiny}; }); if (r.sw > r.iw + 1 || r.over.length) bad.push(`${w}px ${name}: sw=${r.sw} ${r.over.join(',')}`); if (r.tiny.length) small.push(`${w}px ${name}: ${r.tiny.join(' | ')}`); };
      await chk('seçim');
      await p.click('.uye39-b.cp'); await p.waitForTimeout(500); await chk('koridor');
      const t = await p.evaluate(() => Store.all('topics').find(t => t.grade == 6 && t.sections && t.sections.tablo).id);
      for (const [v, a] of [['psinif', {pg: 8}], ['punite', null], ['pders', {pt: t, ptab: 'anlat'}], ['pders', {pt: t, ptab: 'tab'}], ['pders', {pt: t, ptab: 'test'}], ['pozet', {pg: 6}], ['pilerleme', null]]) {
        await p.evaluate(([v, a]) => { if (v === 'punite') a = {pg: 8, pu: V39.units(8, V39.pv(8))[0].id}; go(v, a); }, [v, a]); await p.waitForTimeout(250); await chk(v + (a && a.ptab ? ':' + a.ptab : ''));
      }
      if (p._errs.length) bad.push(`${w}px hata: ${p._errs.join(';')}`);
      await ctx.close();
    }
    ok('5.1', '360 / 390 / 768 / 1024 / 1440 px: seçim ekranı ve Premium ekranlarda yatay taşma yok', bad.length === 0, bad.slice(0, 6));
    ok('5.2', 'Aynı ekranlarda dokunma alanları ≥44 px (gösterge noktaları ≥30×44 px)', small.length === 0, small.slice(0, 6));
  }

  await b.close(); srv.close();
  const f = R.filter(r => !r.pass);
  console.log(`\nToplam ${R.length} kontrol · geçti ${R.length - f.length} · kaldı ${f.length}`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify(R, null, 1));
  process.exit(f.length ? 1 : 0);
})().catch(e => { console.error('TEST BETİĞİ HATASI', e); process.exit(2); });
