// V38.0 testleri (Playwright + Chromium, başsız). Depo kökünden:  node tests/v38/test_v380.js
// Tarayıcı otomasyonudur; gerçek cihaz testi değildir. Telefon/tablet ölçüleri emüle edilir.
const {chromium} = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
let V38, V37, IDX;
const R = [];
const ok = (id, name, pass, detail) => { R.push({id, name, pass: !!pass, detail}); console.log((pass ? 'GEÇTİ ' : 'KALDI ') + id + ' · ' + name + (detail !== undefined ? ' — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 400) : '')); };
const OGRT_DATA = {v:1,app:'dkab-ogretmen',classes:[{g:12,py:'2018'},{g:5,py:'2026'}],active:'12|2018',status:{'DKAB18-12-U02-O01':'isl'},plans:[{id:'Ptest1',g:12,py:'2018',unitId:'DKAB18-12-U02',oid:'DKAB18-12-U02-O01',date:'2026-11-16',time:'09:00',dur:40,goal:'Deneme hedefi',method:'',notes:'Not',sy:null,wk:null,updated:'2026-11-01T00:00:00.000Z',created:'2026-11-01T00:00:00.000Z'}],updatedAt:'2026-11-01T00:00:00.000Z'};
const IGN = /assets\/audio\/manifest\.json|Failed to load resource: the server responded with a status of 404/; // V33'ten beri: isteğe bağlı ses klasörü yoksa 404 (V37'de de aynı)

async function ctxWith(b, {w = 390, h = 844, theme = 'dark', teacher = true, seed = true} = {}) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700, hasTouch: true, acceptDownloads: true});
  await ctx.addInitScript(([t, seed, data, teacher]) => {
    if (!localStorage.getItem('__seeded')) { localStorage.setItem('__seeded', '1'); localStorage.setItem('dk-theme', t); if (seed) localStorage.setItem('dk-ogretmen-v1', JSON.stringify(data)); }
    if (teacher && !sessionStorage.getItem('__t')) { sessionStorage.setItem('__t', '1'); sessionStorage.setItem('dk-ogrt-oturum', '1'); }
  }, [theme, seed, OGRT_DATA, teacher]);
  return ctx;
}
async function open(ctx, url) { const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !IGN.test(m.text())) p._errs.push('console: ' + m.text()); }); await p.goto(url || V38); await p.waitForFunction(() => typeof V38 !== 'undefined' && V38.isReady, null, {timeout: 15000}); await p.waitForTimeout(600); return p; }
const setTeacherPin = p => p.evaluate(() => { const salt = 's'; localStorage.setItem('dk-ogretmen-pin', JSON.stringify({v: 2, salt, h: V36.hash(salt, '1111'), len: 4})); });
const keypad = async (p, d) => { for (const x of d) await p.click(`.pin37-k button:text-is("${x}")`); await p.waitForTimeout(200); };
const edLogin = async (p, pin = '583920', create = true) => { await p.evaluate(() => go('editor')); await p.waitForTimeout(300); await keypad(p, pin); if (create) await keypad(p, pin); await p.waitForTimeout(400); };
const confirmDlg = async (p, note) => { await p.waitForSelector('#v38-cok'); if (note !== undefined) await p.fill('#v38-cn', note); await p.click('#v38-cok'); await p.waitForTimeout(500); };

(async () => {
  await new Promise(r => srv.listening ? r() : srv.once('listening', r));
  const B = 'http://127.0.0.1:' + srv.address().port;
  V38 = B + '/surumler/din-kulturu-platformu-v38.0.html'; V37 = B + '/surumler/din-kulturu-platformu-v37.0.html'; IDX = B + '/index.html';
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});

  // ---------- 0. Sürüm, veri ve özellik koruma ----------
  {
    const c7 = await ctxWith(b, {seed: false, teacher: false}), c8 = await ctxWith(b, {seed: false, teacher: false}), cI = await ctxWith(b, {seed: false, teacher: false});
    const p7 = await c7.newPage(); await p7.goto(V37); await p7.waitForTimeout(2200);
    const p8 = await open(c8, V38), pI = await open(cI, IDX);
    const snap = p => p.evaluate(() => ({ver: V31.VER, routes: Object.keys(V30.routes).sort(), cols: Object.fromEntries(Object.keys(COL).map(c => [c, Store.all(c).length])), ogrt: Object.keys(OGRT).filter(k => typeof OGRT[k] === 'function').sort(), w: Object.keys(OGRT.W).filter(k => typeof OGRT.W[k] === 'function').sort(), seeds: [...document.querySelectorAll('script[type="application/json"]')].map(s => s.id + ':' + s.textContent.length), atm: typeof ATM.open, snd: !!document.getElementById('snd37')}));
    const a = await snap(p7), z = await snap(p8), i = await snap(pI);
    ok('0.1', 'Sürüm V38.0 (index.html ve sürüm dosyası)', z.ver === 'V38.0' && i.ver === 'V38.0', z.ver);
    ok('0.2', 'Veri blokları V37 ile aynı', JSON.stringify(a.seeds) === JSON.stringify(z.seeds), z.seeds.join(' '));
    ok('0.3', 'Koleksiyon kayıt sayıları V37 ile aynı (müfredat, soru, kart, oyun…)', JSON.stringify(a.cols) === JSON.stringify(z.cols), z.cols);
    ok('0.4', 'V37 rotaları korunuyor (+ yeni editor rotası)', a.routes.every(r => z.routes.includes(r)) && z.routes.includes('editor'), z.routes);
    ok('0.5', 'Öğretmen paneli işlevleri korunuyor', a.ogrt.every(f => z.ogrt.includes(f)) && a.w.every(f => z.w.includes(f)), `${z.ogrt.length} + ${z.w.length}`);
    ok('0.6', 'Ders Atmosferi ve üst çubuk ses kontrolü duruyor', z.atm === 'function' && z.snd);
    ok('0.7', 'Açılışta sayfa/konsol hatası yok', !p8._errs.length && !pI._errs.length, p8._errs.concat(pI._errs));
    // öğrenci ekranları: hesaplanmış stiller V37 ile aynı
    const sig = async (p, v) => p.evaluate(async v => { if (v === 'topic') go('topic', {t: Store.all('topics').find(t => t.sections).id, tab: 'anlat'}); else go(v); await new Promise(r => setTimeout(r, 900)); const out = [document.body.hasAttribute('data-ogrt37') ? 'OGRT' : 'ogrenci']; const P = ['color', 'backgroundColor', 'backgroundImage', 'fontSize', 'fontWeight', 'borderTopColor', 'borderRadius', 'paddingTop', 'boxShadow']; [document.body, document.querySelector('header.top'), document.querySelector('nav.bnav'), ...[...document.querySelectorAll('#app *')].slice(0, 400)].forEach(e => { if (!e) return; const s = getComputedStyle(e); out.push(e.tagName + '.' + (e.getAttribute('class') || '').replace(/\b(rv|in|done)\b/g, '').trim() + ':' + P.map(k => s[k]).join('|')); }); return out; }, v);
    const diffs = [];
    for (const v of ['home', 'classes', 'topic', 'games', 'dene']) { const s7 = await sig(p7, v), s8 = await sig(p8, v); const d = s7.filter((x, k) => x !== s8[k]).length + Math.abs(s7.length - s8.length); if (d) diffs.push(`${v}: ${d} fark (ilk: ${s7.find((x, k) => x !== s8[k]) || ''} ↔ ${s8.find((x, k) => x !== s7[k]) || ''})`); if (s8[0] !== 'ogrenci') diffs.push(v + ': öğretmen modu açık'); }
    ok('0.8', 'Öğrenci ekranlarının tasarımı değişmedi (ana sayfa, sınıflar, konu, oyunlar, kendini dene: hesaplanmış stiller V37 ile aynı)', diffs.length === 0, diffs);
    await c7.close(); await c8.close(); await cI.close();
  }

  // ---------- 1. Editör erişimi ----------
  {
    const ctx = await ctxWith(b); const p = await open(ctx); await setTeacherPin(p);
    await p.evaluate(() => go('editor')); await p.waitForTimeout(300);
    const s0 = await p.evaluate(() => ({h: document.querySelector('#ed38-h')?.textContent, dots: document.querySelectorAll('.pin37-d i').length, ed: !!document.querySelector('.ed38')}));
    ok('1.1', 'Öğretmen oturumu açıkken bile editör alanı ayrı editör PIN\'i istiyor (ilk girişte oluşturma, 6 hane)', s0.h === "Editör PIN'i oluştur" && s0.dots === 6 && !s0.ed, s0);
    await keypad(p, '111111'); await keypad(p, '222222');
    const mm = await p.evaluate(() => ({h: document.querySelector('#ed38-h')?.textContent, m: document.querySelector('#ed38-msg')?.textContent, rec: localStorage.getItem('dk-editor-pin38')}));
    ok('1.2', 'Eşleşmeyen editör PIN\'i kaydedilmiyor', mm.h === "Editör PIN'i oluştur" && /eşleşmedi/.test(mm.m) && mm.rec === null, mm.m);
    await keypad(p, '583920'); await keypad(p, '583920'); await p.waitForTimeout(300);
    const s1 = await p.evaluate(() => ({ed: !!document.querySelector('.ed38-cats'), rec: JSON.parse(localStorage.getItem('dk-editor-pin38') || 'null'), sess: sessionStorage.getItem('dk-editor-oturum38')}));
    ok('1.3', 'Editör PIN\'i oluşturuldu, ayrı oturum açıldı; PIN açık metin saklanmıyor', s1.ed && s1.rec && /^[0-9a-f]{64}$/.test(s1.rec.h) && !JSON.stringify(s1.rec).includes('583920') && s1.sess === '1');
    await p.click('text=Editör oturumunu kapat'); await p.waitForTimeout(300); await p.evaluate(() => go('editor')); await p.waitForTimeout(300);
    const s2 = await p.evaluate(() => ({h: document.querySelector('#ed38-h')?.textContent, t: sessionStorage.getItem('dk-ogrt-oturum')}));
    ok('1.4', 'Editör oturumu kapatılınca editör PIN\'i tekrar isteniyor; öğretmen oturumu etkilenmiyor', s2.h === 'Editör Onay Alanı' && s2.t === '1', s2);
    const tp = await p.evaluate(() => { V36.logout(); return {t: sessionStorage.getItem('dk-ogrt-oturum'), chk: V38.edHash(V38.edRec().salt, '1111') === V38.edRec().h}; });
    ok('1.5', 'Öğretmen PIN\'i (1111) editör PIN\'i olarak kabul edilmiyor', !tp.chk);
    await p.evaluate(() => go('editor')); await p.waitForTimeout(300);
    for (let i = 0; i < 5; i++) await keypad(p, '000000');
    const lk = await p.evaluate(() => ({dis: document.querySelector('.pin37-k button').disabled, m: document.querySelector('#ed38-msg').textContent}));
    ok('1.6', '5 hatalı editör PIN\'inden sonra bekleme', lk.dis && /saniye sonra/.test(lk.m), lk.m);
    await p.evaluate(() => { localStorage.removeItem('dk-editor-kilit38'); V38.edPinView(); }); await keypad(p, '583920');
    ok('1.7', 'Doğru editör PIN\'i ile giriş', await p.evaluate(() => !!document.querySelector('.ed38-cats')));
    // Editör PIN'i sıfırlama: yalnızca PIN silinir
    await p.evaluate(() => { V38.ED.approve('questions', Store.all('questions').find(q => V38.ED.cat('questions', q) === 'bekleyen').id, 'sıfırlama öncesi'); });
    await p.evaluate(() => V38.edLogout()); await p.evaluate(() => go('editor')); await p.waitForTimeout(300);
    await p.click('text=Editör PIN\'imi unuttum'); await p.fill('#ed38-rw', 'sıfırla'); await p.click('.pin37-rs button[type=submit]'); await p.waitForTimeout(300);
    const rs = await p.evaluate(() => ({pin: localStorage.getItem('dk-editor-pin38'), h: document.querySelector('#ed38-h')?.textContent, items: Object.keys(V38.mem.ed.items).length}));
    ok('1.8', 'Editör PIN\'ini sıfırlama yalnızca PIN\'i siliyor, onay kayıtları kalıyor', rs.pin === null && rs.h === "Editör PIN'i oluştur" && rs.items === 1, rs);
    ok('1.9', 'Editör erişim testlerinde sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  // ---------- 2–6. Kuyruklar, inceleme, onay, düzenleme, yayımlama, geri alma ----------
  let edBackupPath = null;
  {
    const ctx = await ctxWith(b); const p = await open(ctx); await setTeacherPin(p); await edLogin(p);
    const cnt = await p.evaluate(() => { const n = V38.ED.counts(), A = V38.ED.all(), by = {}; A.forEach(x => by[x.k] = (by[x.k] || 0) + 1); const tiles = Object.fromEntries([...document.querySelectorAll('.ed38-cat .n')].map(e => [e.dataset.n, +e.textContent])); const total = V38.ED.COLS.reduce((s, c) => s + Store.all(c).filter(r => V38.ED.cat(c, r)).length, 0); return {n, by, tiles, total, A: A.length}; });
    const consistent = ['bekleyen', 'kaynak', 'eslesme', 'duzeltme', 'red', 'onay'].every(k => (cnt.by[k] || 0) === cnt.n[k] && cnt.tiles[k] === cnt.n[k]);
    ok('2.1', 'Kategori sayıları gerçek kayıtlardan hesaplanıyor ve kutucuklar, listeler ile aynı', consistent && cnt.total === cnt.A && cnt.n.bekleyen > 0 && cnt.n.kaynak > 0 && cnt.n.eslesme > 0, cnt.n);
    // liste sayısı = kutucuk sayısı (her kategori)
    const lst = {};
    for (const k of ['bekleyen', 'kaynak', 'eslesme']) { await p.evaluate(k => V38.edGo({k, cid: '', mode: '', f: {tur: '', g: '', py: '', q: ''}}), k); lst[k] = await p.evaluate(() => +document.querySelector('[data-n="liste"]').textContent); }
    ok('2.2', 'Liste ekranındaki kayıt sayısı kategori sayısıyla aynı', lst.bekleyen === cnt.n.bekleyen && lst.kaynak === cnt.n.kaynak && lst.eslesme === cnt.n.eslesme, lst);
    // inceleme ekranı
    const T = await p.evaluate(() => { const t = Store.all('topics').find(t => V38.ED.cat('topics', t) === 'bekleyen' && t.sections && t.sections.anlatim && t.sections.anlatim[0] && t.sections.anlatim[0].p); return {id: t.id, p0: t.sections.anlatim[0].p, before: JSON.stringify(Store.ov.patch[t.id] || null)}; });
    await p.evaluate(id => V38.edOpen('topics', id), T.id); await p.waitForTimeout(300);
    const det = await p.evaluate(() => { const t = document.querySelector('.ed38').innerText; return {A: /A\. İçerik bilgileri/.test(t) && /Sınıf/.test(t) && /Program yılı/.test(t) && /Ünite/.test(t) && /Konu/.test(t) && /Kazanım/.test(t) && /İçerik türü/.test(t), B: /B\. İncelenecek içerik/.test(t) && /Anlatım/.test(t), C: /C\. Kaynak bilgileri/.test(t), D: /D\. Karşılaştırma/.test(t), E: /E\. Editör notu/.test(t), acts: ['Onayla', 'Düzenle', 'Düzeltme bekliyor', 'Reddet'].every(x => [...document.querySelectorAll('.ed38-acts button')].some(b => b.textContent.includes(x)))}; });
    ok('3.1', 'İnceleme ekranında A–E bölümleri ve 4 işlem aynı ekranda', Object.values(det).every(Boolean), det);
    const noSrc = await p.evaluate(() => V38.ED.srcHTML('questions', {sourceIds: [], dogrulama: {}}));
    ok('3.2', 'Kaynak yoksa "Kaynak bulunmuyor" yazıyor (uydurma kaynak yok)', /Kaynak bulunmuyor\./.test(noSrc));
    // not
    await p.fill('#ed38-note', 'Kontrol notu 1'); await p.click('text=Notu kaydet'); await p.waitForTimeout(300);
    // onay
    await p.click('.ed38-acts button:has-text("Onayla")'); await confirmDlg(p, 'ilk onay');
    const ap = await p.evaluate(id => { const it = V38.ED.it('topics', id); return {st: it.state, ap: it.approved, pub: it.published, stud: Store.get('topics', id).status, n: V38.ED.counts()}; }, T.id);
    ok('4.1', 'Onayla: kayıt onaylandı, öğrenci içeriği değişmedi (onay ≠ yayım)', ap.st === 'onay' && ap.ap && ap.ap.vid === 'v1' && !ap.pub && ap.stud !== 'published' && ap.n.onay === cnt.n.onay + 1 && ap.n.bekleyen === cnt.n.bekleyen - 1, {st: ap.st, stud: ap.stud});
    // düzenleme
    await p.click('.ed38-acts button:has-text("Düzenle")'); await p.waitForTimeout(300);
    const newText = 'EDİTÖR DÜZELTMESİ: ' + T.p0.slice(0, 40);
    await p.fill('textarea[data-p="sections.anlatim.0.p"]', newText); await p.fill('.ed38-ed input[name=note]', 'yazım düzeltmesi'); await p.click('.ed38-ed button[type=submit]'); await p.waitForTimeout(400);
    const ed = await p.evaluate(id => { const it = V38.ED.it('topics', id); return {n: it.versions.length, st: it.state, v1: it.versions[0].fields.sections.anlatim[0].p, v2: it.versions[1].fields.sections.anlatim[0].p, diff: document.querySelector('.ed38-diff')?.innerHTML || '', stud: Store.get('topics', id).sections.anlatim[0].p}; }, T.id);
    ok('4.2', 'Düzenle: yeni sürüm (v2) oluştu, v1 korundu, onay düştü, öğrenci içeriği değişmedi', ed.n === 2 && ed.v1 === T.p0 && ed.v2 === newText && ed.st === 'bekliyor' && ed.stud === T.p0, {n: ed.n, st: ed.st});
    ok('4.3', 'Karşılaştırma: eklenen/çıkarılan ifadeler işaretli', /<ins>/.test(ed.diff) && /<del>/.test(ed.diff) && /Değiştirildi/.test(ed.diff));
    // düzeltme bekliyor: not zorunlu
    await p.click('.ed38-acts button:has-text("Düzeltme bekliyor")'); await p.click('#v38-cok'); await p.waitForTimeout(200);
    const reqd = await p.evaluate(() => document.querySelector('.v38-ce')?.textContent);
    await p.fill('#v38-cn', 'Başlık kitaptakiyle karşılaştırılmalı'); await p.click('#v38-cok'); await p.waitForTimeout(500);
    const dz = await p.evaluate(id => V38.ED.it('topics', id).state, T.id);
    ok('4.4', 'Düzeltme bekliyor: açıklama zorunlu, durum kaydedildi', /açıklama yazmalısın/.test(reqd) && dz === 'duzeltme', dz);
    // yeniden onay + yayımla
    await p.click('.ed38-acts button:has-text("Onayla")'); await confirmDlg(p, 'düzeltildi');
    await p.click('button:has-text("Yayımla")'); await confirmDlg(p, '');
    const pub = await p.evaluate(id => { const it = V38.ED.it('topics', id), r = Store.get('topics', id); return {pub: it.published && it.published.vid, stud: r.sections.anlatim[0].p, st: r.status, ed: (r.dogrulama || {}).editorOnayi}; }, T.id);
    ok('5.1', 'Yayımla: onaylı sürüm öğrenci içeriğine aktarıldı (durum: Yayında)', pub.pub === 'v2' && pub.stud === newText && pub.st === 'published' && pub.ed === 'onaylandi', pub);
    // öğrenci ekranında görünüyor mu?
    const shown = await p.evaluate(async id => { go('topic', {t: id, tab: 'anlat'}); await new Promise(r => setTimeout(r, 600)); return document.getElementById('app').innerText; }, T.id);
    ok('5.2', 'Yayımlanan metin öğrenci konu ekranında görünüyor', shown.includes('EDİTÖR DÜZELTMESİ'));
    // yenileme sonrası kalıcılık (IndexedDB + dk2)
    await p.reload(); await p.waitForFunction(() => typeof V38 !== 'undefined' && V38.isReady); await p.waitForTimeout(400);
    const per = await p.evaluate(id => { const it = V38.ED.it('topics', id); return {st: it && it.state, n: it && it.versions.length, pub: it && it.published && it.published.vid, note: it && it.note, stud: Store.get('topics', id).sections.anlatim[0].p, hist: it && it.history.length, store: V38.store}; }, T.id);
    ok('5.3', 'Yenilemeden sonra onay, sürümler, not, geçmiş ve yayın kalıcı (IndexedDB)', per.st === 'onay' && per.n === 2 && per.pub === 'v2' && per.note === 'Kontrol notu 1' && per.hist >= 6 && per.stud === newText && per.store === 'IndexedDB', per);
    // yayından kaldır → öğrenci içeriği birebir geri
    await p.evaluate(id => V38.edGo({cid: 'topics:' + id, mode: ''}), T.id); await p.waitForTimeout(300);
    const edOk = await p.evaluate(() => V38.edOk());
    if (!edOk) { await keypad(p, '583920'); }
    await p.click('button:has-text("Yayından kaldır")'); await confirmDlg(p, '');
    const un = await p.evaluate(id => ({stud: Store.get('topics', id).sections.anlatim[0].p, patch: JSON.stringify(Store.ov.patch[id] || null), st: Store.get('topics', id).status, ap: V38.ED.it('topics', id).state}), T.id);
    ok('5.4', 'Yayından kaldır: öğrenci içeriği ve yama katmanı yayım öncesine birebir döndü; onay korunuyor', un.stud === T.p0 && un.patch === T.before && un.st !== 'published' && un.ap === 'onay', {st: un.st});
    // eski sürüme dön
    await p.click('.ed38-vers button:has-text("Bu sürüme dön")'); await confirmDlg(p, '');
    const rv = await p.evaluate(id => { const it = V38.ED.it('topics', id); return {n: it.versions.length, last: it.versions[it.versions.length - 1], st: it.state}; }, T.id);
    ok('5.5', 'Eski sürüme dön: v1 içeriği v3 olarak eklendi, sürümler silinmedi, yeniden onay gerekiyor', rv.n === 3 && rv.last.kind === 'geri-donus' && rv.last.fields.sections.anlatim[0].p === T.p0 && rv.st === 'bekliyor', {n: rv.n, st: rv.st});
    // onayı geri çek: önce onayla, yayımla, sonra geri çek → yayından kalkar, geçmiş kalır
    await p.click('.ed38-acts button:has-text("Onayla")'); await confirmDlg(p, '');
    await p.click('button:has-text("Yayımla")'); await confirmDlg(p, '');
    const hBefore = await p.evaluate(id => V38.ED.it('topics', id).history.length, T.id);
    await p.click('button:has-text("Onayı geri çek")'); await confirmDlg(p, 'yeniden incelenecek');
    const wd = await p.evaluate(id => { const it = V38.ED.it('topics', id); return {st: it.state, pub: it.published, h: it.history.length, stud: Store.get('topics', id).sections.anlatim[0].p, patch: JSON.stringify(Store.ov.patch[id] || null)}; }, T.id);
    ok('5.6', 'Onayı geri çek: yayından da kaldırıldı, geçmiş silinmedi (yalnızca eklendi)', wd.st === 'bekliyor' && !wd.pub && wd.h > hBefore && wd.stud === T.p0 && wd.patch === T.before, {st: wd.st, h: wd.h, hBefore});
    // reddet
    await p.click('.ed38-acts button:has-text("Reddet")'); await confirmDlg(p, 'kaynakla çelişiyor');
    const rj = await p.evaluate(id => ({st: V38.ED.it('topics', id).state, stud: Store.get('topics', id).sections.anlatim[0].p, n: V38.ED.counts().red}), T.id);
    ok('5.7', 'Reddet: gerekçeyle kaydedildi, öğrenci içeriği silinmedi', rj.st === 'red' && rj.stud === T.p0 && rj.n === 1);
    // kaynak kapısı
    const K = await p.evaluate(() => { const t = Store.all('topics').find(t => V38.ED.cat('topics', t) === 'kaynak' && t.sections); return t && t.id; });
    await p.evaluate(id => V38.edOpen('topics', id), K); await p.waitForTimeout(300);
    const g0 = await p.evaluate(() => ({dis: document.querySelector('.ed38-acts button.p:not([onclick*=kaynak])')?.disabled, can: V38.ED.canPublish('topics', V38.edSplit(V38.ES().cid)[1])}));
    await p.click('button:has-text("Kaynak kontrolünü tamamla")'); await confirmDlg(p, 'Ders kitabı s.62–66 ile karşılaştırıldı');
    const g1 = await p.evaluate(id => ({cat: V38.ED.cat('topics', Store.get('topics', id)), dis: [...document.querySelectorAll('.ed38-acts button')].find(b => b.textContent.includes('Onayla')).disabled}), K);
    await p.click('.ed38-acts button:has-text("Onayla")'); await confirmDlg(p, ''); await p.click('button:has-text("Yayımla")'); await confirmDlg(p, '');
    const g2 = await p.evaluate(id => { const r = Store.get('topics', id); return {st: r.status, d: r.dogrulama.durum, prev: r.dogrulama.oncekiDurum, note: r.dogrulama.editorKaynakNotu}; }, K);
    ok('6.1', 'Kaynak kontrolü bekleyen içerik onaylanamıyor/yayımlanamıyor; kaynak kontrolü kaydedilince yayımlanabiliyor', g0.dis === true && /Yalnızca onaylanmış|Kaynak/.test(g0.can) && g1.cat === 'bekleyen' && g1.dis === false && g2.st === 'published' && g2.d === 'kaynak-kontrolunden-gecti' && g2.prev === 'kaynak-yetersiz' && /s\.62/.test(g2.note), {g0, g1, g2});
    // içerik hazırlanmamış konu onaylanamıyor
    const E0 = await p.evaluate(() => { const t = Store.all('topics').find(t => !t.sections); return V38.ED.canApprove('topics', t); });
    ok('6.2', 'İçeriği hazırlanmamış konu onaylanamıyor ("veri bulunmuyor")', /veri bulunmuyor/i.test(E0), E0);
    // kazanım eşleşmesi: onay + yayım → link durumu
    const Lk = await p.evaluate(() => { const l = Store.all('outcomeLinks').find(l => V38.ED.cat('outcomeLinks', l) === 'eslesme'); V38.ED.approve('outcomeLinks', l.id, 'sayfa doğru'); V38.ED.publish('outcomeLinks', l.id, ''); const r = Store.get('outcomeLinks', l.id); return {st: r.status, by: r.matchedBy, cat: V38.ED.cat('outcomeLinks', r)}; });
    ok('6.3', 'Kazanım eşleşmesi incelemesi: onay + yayım → eşleşme "onaylandı", kuyruktan arşive', Lk.st === 'onaylandı' && Lk.by === 'editor' && Lk.cat === 'onay', Lk);
    // son işlemler
    const lg = await p.evaluate(() => ({n: V38.mem.ed.log.length, a: V38.mem.ed.log.slice(0, 3).map(l => l.a)}));
    ok('6.4', 'Son yapılan editör işlemleri kaydediliyor', lg.n >= 15, lg);
    // onay arşivi: açılabiliyor, sürümler ve karşılaştırma var
    await p.evaluate(() => V38.edGo({k: 'onay', cid: '', mode: ''})); await p.waitForTimeout(300);
    const arc = await p.evaluate(() => ({n: document.querySelectorAll('.ed38-row').length, c: V38.ED.counts().onay}));
    ok('6.5', 'Onay Arşivi listesi sayıyla tutarlı', arc.n === arc.c && arc.c >= 2, arc);
    // editör yedeği
    const [dl] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => V38.edBackup())]);
    edBackupPath = path.join(os.tmpdir(), 'v38-ed-yedek-' + Date.now() + '.json'); await dl.saveAs(edBackupPath);
    const bj = JSON.parse(fs.readFileSync(edBackupPath, 'utf8'));
    ok('7.1', 'Editör yedeği: kayıtlar, sürümler, geçmiş ve günlük JSON\'da', bj.app === 'dkab-editor' && Object.keys(bj.items).length >= 3 && bj.items['topics:' + T.id].versions.length === 3 && bj.log.length >= 15);
    ok('7.0', 'Onay akışında sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }
  // editör yedeğini boş cihaza geri yükle, iki kez (tekrar oluşmamalı), hatalı dosya
  {
    const ctx = await ctxWith(b); const p = await open(ctx); await setTeacherPin(p); await edLogin(p, '777777');
    const bad = path.join(os.tmpdir(), 'v38-bozuk.json'); fs.writeFileSync(bad, '{"app":"dkab-editor","v":1,'); const wrong = path.join(os.tmpdir(), 'v38-yanlis.json'); fs.writeFileSync(wrong, JSON.stringify({app: 'baska', v: 1, items: {}}));
    await p.setInputFiles('.ed38-info input[type=file]', bad); await p.waitForTimeout(400);
    const e1 = await p.evaluate(() => ({m: document.getElementById('ed38-rerr').textContent, n: Object.keys(V38.mem.ed.items).length}));
    await p.setInputFiles('.ed38-info input[type=file]', wrong); await p.waitForTimeout(400);
    const e2 = await p.evaluate(() => ({m: document.getElementById('ed38-rerr').textContent, n: Object.keys(V38.mem.ed.items).length}));
    ok('7.2', 'Hatalı / yanlış editör yedeği reddediliyor, kayıtlar değişmiyor', /geçerli JSON değil/.test(e1.m) && e1.n === 0 && /Editör Onay yedeği değil/.test(e2.m) && e2.n === 0, [e1.m, e2.m]);
    await p.setInputFiles('.ed38-info input[type=file]', edBackupPath); await p.waitForTimeout(600);
    const r1 = await p.evaluate(() => { const I = V38.mem.ed.items; return {n: Object.keys(I).length, v: Object.values(I).reduce((s, i) => s + i.versions.length, 0), h: Object.values(I).reduce((s, i) => s + i.history.length, 0), log: V38.mem.ed.log.length, pub: Object.values(I).filter(i => i.published).length}; });
    await p.setInputFiles('.ed38-info input[type=file]', edBackupPath); await p.waitForTimeout(600);
    const r2 = await p.evaluate(() => { const I = V38.mem.ed.items; return {n: Object.keys(I).length, v: Object.values(I).reduce((s, i) => s + i.versions.length, 0), h: Object.values(I).reduce((s, i) => s + i.history.length, 0), log: V38.mem.ed.log.length}; });
    const bj = JSON.parse(fs.readFileSync(edBackupPath, 'utf8'));
    ok('7.3', 'Editör yedeği geri yüklendi; ikinci kez yüklemede kayıt/sürüm/geçmiş tekrarlanmadı; yayın durumu otomatik uygulanmadı', r1.n === Object.keys(bj.items).length && r2.n === r1.n && r2.v === r1.v && r2.h === r1.h && r2.log === r1.log && r1.pub === 0, {r1, r2});
    await p.reload(); await p.waitForFunction(() => typeof V38 !== 'undefined' && V38.isReady);
    ok('7.4', 'Geri yüklenen editör kayıtları yenilemeden sonra da duruyor', await p.evaluate(n => Object.keys(V38.mem.ed.items).length === n, r1.n));
    await ctx.close();
  }

  // ---------- 8. Öğretmen araçları + öğretmen yedeği ----------
  let tBackup = null;
  {
    const ctx = await ctxWith(b); const p = await open(ctx); await setTeacherPin(p);
    await p.evaluate(() => { go('ogretmen'); OGRT.S().tab = 'diger'; OGRT.render(); }); await p.waitForTimeout(400);
    const gb = await p.evaluate(() => ({tab: OGRT.S().tab, tiles: document.querySelectorAll('.v38-tile').length, labels: [...document.querySelectorAll('.og-sub button')].map(b => b.textContent.trim())}));
    const need = ['Genel Bakış', 'Kazanımlar', 'Ders Planlarım', 'Ajanda ve Takvim', 'Raporlar', 'Notlar ve Taslaklar', 'Test ve Soru Bankası', 'Şablonlar', 'Hızlı Arama', 'Son İşlemler', 'Veri Yönetimi', 'Ayarlar', 'Editör Onay Alanı'];
    ok('8.1', 'Diğer → Genel Bakış ve 13 bölüm menüsü (Haftalık ve Sınıflarım ana sekmelerde)', gb.tab === 'genel' && gb.tiles === 12 && need.every(n => gb.labels.some(l => l.includes(n))), gb.labels);
    // her bölüm açılıyor, boş sayfa değil
    const views = await p.evaluate(() => { const o = {}; OGRT.SUB.forEach(([k]) => { OGRT.S().tab = k; OGRT.render(); const b = document.getElementById('og-body'); o[k] = b ? b.innerText.trim().length : 0; }); return o; });
    ok('8.2', 'Bütün bölümler içerikle açılıyor', Object.values(views).every(n => n > 40), views);
    // not defteri
    await p.evaluate(() => { OGRT.S().tab = 'notlar'; V38.NS().ed = 'new'; OGRT.render(); });
    await p.fill('.v38-nf input[name=title]', 'Veli toplantısı'); await p.fill('.v38-nf textarea[name=text]', '12-A için hazırlık listesi'); await p.check('.v38-nf input[name=taslak]'); await p.click('.v38-nf button[type=submit]'); await p.waitForTimeout(300);
    const nt = await p.evaluate(() => ({n: V38.mem.notlar.length, t: V38.mem.notlar[0] && V38.mem.notlar[0].taslak, shown: document.getElementById('og-body').innerText.includes('Veli toplantısı')}));
    ok('8.3', 'Not defteri: not/taslak eklendi ve listeleniyor', nt.n === 1 && nt.t && nt.shown, nt);
    // sınav hazırlama: yalnızca mevcut soru bankası
    await p.evaluate(() => { OGRT.S().tab = 'sinav'; OGRT.render(); });
    const oid = await p.evaluate(() => { const [g, py] = V38.SV().cls.split('|'); const o = OGRT.allOuts(+g, py).find(o => V38.qOf(+g, py, [o.id]).length >= 2); return o.id; });
    await p.evaluate(oid => V38.svOut(oid, true), oid); await p.click('text=Tümünü seç'); await p.fill('.v38-sv form input[name=title]', 'Deneme sınavı'); await p.click('.v38-sv form button[type=submit]'); await p.waitForTimeout(300);
    const sv = await p.evaluate(oid => { const s = V38.mem.sinavlar[0], Q = s.qids.map(id => Store.get('questions', id)); return {n: s.qids.length, allBank: Q.every(q => q && (q.outcomeIds || []).includes(oid)), title: s.title}; }, oid);
    ok('8.4', 'Sınav hazırlama: sorular yalnızca mevcut soru bankasından ve seçilen kazanımdan', sv.n >= 2 && sv.allBank, sv);
    const [d2] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => V38.svTxt(V38.mem.sinavlar[0].id))]);
    const txt = fs.readFileSync(await d2.path(), 'utf8');
    ok('8.5', 'Sınav metin dosyası soruları ve cevap anahtarını içeriyor', /CEVAP ANAHTARI/.test(txt) && /^1\. /m.test(txt));
    // raporlar
    await p.evaluate(() => { OGRT.S().tab = 'ilerleme'; OGRT.render(); });
    const rp = await p.evaluate(() => { const rows = V38.raporRows(12, '2018'), p = OGRT.prog(12, '2018'); return {sumT: rows.reduce((s, r) => s + r.t, 0), sumI: rows.reduce((s, r) => s + r.c.isl, 0), t: p.t, i: p.c.isl, pl: rows.reduce((s, r) => s + r.pl, 0), table: !!document.querySelector('.v38-rp table')}; });
    ok('8.6', 'Raporlar: ünite tablosu kazanım ve plan verisiyle tutarlı', rp.table && rp.sumT === rp.t && rp.sumI === rp.i && rp.pl === 1, rp);
    // şablon → ders planı formu
    await p.evaluate(() => OGRT.editPlan('Ptest1')); await p.waitForTimeout(300);
    await p.selectOption('.v38-tplsel select', 'T-std40'); await p.waitForTimeout(300); const askd = await p.$('#v38-cok'); if (askd) await confirmDlg(p);
    const tp = await p.evaluate(() => document.querySelector('.v-sheet textarea[name=method]').value);
    ok('8.7', 'Şablon ders planı formuna uygulanıyor (dolu alan varsa önce onay soruluyor)', /Giriş \(5 dk\)/.test(tp) && !!askd);
    await p.evaluate(() => UI.close()); await p.waitForTimeout(300);
    // hızlı arama
    await p.evaluate(() => { OGRT.S().tab = 'ara'; V38.AS().q = '12.2.1'; OGRT.render(); });
    const ar = await p.evaluate(() => [...document.querySelectorAll('.v38-res li')].map(l => l.innerText));
    ok('8.8', 'Hızlı arama kazanım kodunu buluyor', ar.some(x => /12\.2\.1/.test(x)), ar.slice(0, 2));
    // toplu kazanım işlemleri
    await p.evaluate(() => { OGRT.S().tab = 'kaz'; OGRT.S().open = []; OGRT.render(); document.querySelectorAll('.og-u').forEach(d => d.open = true); V38.bulkDecor(); });
    await p.click('.v38-ua >> nth=0'); await p.waitForTimeout(200);
    const sel = await p.evaluate(() => [...V38.bulk]);
    await p.selectOption('#v38-bst', 'tek'); await p.click('#v38-bulk .p'); await confirmDlg(p);
    const bk = await p.evaluate(sel => ({all: sel.every(o => OGRT.st(o) === 'tek'), log: V38.mem.log.filter(l => l.a === 'Toplu kazanım işlemi').length, per: V38.mem.log.filter(l => l.a === 'Kazanım durumu').length}), sel);
    ok('8.9', 'Toplu kazanım işlemi: ünitedeki tüm kazanımlar güncellendi, günlüğe tek kayıt', sel.length > 1 && bk.all && bk.log === 1 && bk.per === 0, {n: sel.length, ...bk});
    // son işlemler
    await p.evaluate(() => OGRT.setSt('DKAB18-12-U02-O01', 'plan'));
    const lg = await p.evaluate(() => V38.mem.log.slice(0, 6).map(l => l.a));
    const need10 = await p.evaluate(() => ['Kazanım durumu', 'Toplu kazanım işlemi', 'Sınav kaydedildi', 'Not eklendi'].every(a => V38.mem.log.some(l => l.a === a)));
    ok('8.10', 'Son işlemler: kazanım durumu, not, sınav ve toplu işlem kayıtlı', need10 && lg[0] === 'Kazanım durumu', lg);
    // öğretmen yedeği (v38 dahil)
    const [d3] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => OGRT.backup())]);
    tBackup = path.join(os.tmpdir(), 'v38-ogrt-yedek-' + Date.now() + '.json'); await d3.saveAs(tBackup);
    const tj = JSON.parse(fs.readFileSync(tBackup, 'utf8'));
    ok('8.11', 'Öğretmen yedeği: eski alanlar + haftalık plan + V38 (not, sınav, şablon, günlük)', tj.app === 'dkab-ogretmen' && tj.hafta && tj.v38 && tj.v38.notlar.length === 1 && tj.v38.sinavlar.length === 1 && Array.isArray(tj.v38.log) && tj.plans.length === 1);
    ok('8.12', 'Öğretmen araçlarında sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }
  {
    const ctx = await ctxWith(b, {seed: false}); const p = await open(ctx); await setTeacherPin(p);
    await p.evaluate(() => { localStorage.setItem('dk-ogretmen-v1', JSON.stringify({v: 1, app: 'dkab-ogretmen', classes: [{g: 7, py: '2026'}], active: '7|2026', status: {}, plans: [], updatedAt: null})); OGRT.d = OGRT.load(); V38.mem.notlar = [{id: 'NTyerel', title: 'Yerel not', text: 'silinmemeli', updated: '2026-01-01'}]; V38.put('notlar'); go('ogretmen'); OGRT.S().tab = 'yedek'; OGRT.render(); });
    const txt = fs.readFileSync(tBackup, 'utf8');
    const r1 = await p.evaluate(t => { const r = OGRT.restoreText(t); return {ok: r.ok, notes: V38.mem.notlar.map(n => n.id), cls: OGRT.d.classes.length, snap: !!localStorage.getItem('dk38-geri-yukleme-oncesi')}; }, txt);
    const r2 = await p.evaluate(t => { OGRT.restoreText(t); return {notes: V38.mem.notlar.length, ex: V38.mem.sinavlar.length, log: V38.mem.log.length}; }, txt);
    const r2b = await p.evaluate(t => { OGRT.restoreText(t); return {notes: V38.mem.notlar.length, ex: V38.mem.sinavlar.length}; }, txt);
    ok('8.13', 'Öğretmen yedeği geri yüklendi; yerel not korundu; tekrar yüklemede not/sınav tekrarlanmadı; öncesinin kopyası alındı', r1.ok && r1.notes.includes('NTyerel') && r1.notes.length === 2 && r1.cls === 2 && r1.snap && r2b.notes === 2 && r2b.ex === 1, {r1, r2b});
    const bad = await p.evaluate(() => { const before = localStorage.getItem('dk-ogretmen-v1'), n = V38.mem.notlar.length; const a = OGRT.restoreText('{"app":"dkab-ogretmen",'), c = OGRT.restoreText(JSON.stringify({app: 'dkab-ogretmen', v: 1, classes: 'x'})); return {a: a.ok, c: c.ok, same: localStorage.getItem('dk-ogretmen-v1') === before && V38.mem.notlar.length === n}; });
    ok('8.14', 'Hatalı/eksik yedek dosyası kayıtları değiştirmiyor', !bad.a && !bad.c && bad.same, bad);
    const old = await p.evaluate(() => { const n = V38.mem.notlar.length; const r = OGRT.restoreText(JSON.stringify({v: 1, app: 'dkab-ogretmen', classes: [{g: 4, py: '2018'}], active: '4|2018', status: {}, plans: [], updatedAt: null})); return {ok: r.ok, cls: OGRT.d.classes.map(c => c.g), notes: V38.mem.notlar.length === n}; });
    ok('8.15', 'V37 biçimindeki (v38 alanı olmayan) eski yedek geri yükleniyor; V38 kayıtları korunuyor', old.ok && old.cls.join() === '4' && old.notes, old);
    await p.evaluate(() => { OGRT.S().tab = 'yedek'; OGRT.render(); }); await p.click('text=Son geri yüklemeyi geri al'); await confirmDlg(p);
    const und = await p.evaluate(() => OGRT.d.classes.map(c => c.g).join());
    ok('8.16', 'Son geri yüklemeyi geri al: önceki kayıtlara dönüldü', und === '12,5', und);
    await p.reload(); await p.waitForFunction(() => typeof V38 !== 'undefined' && V38.isReady);
    ok('8.17', 'Not ve sınav kayıtları yenilemeden sonra kalıcı', await p.evaluate(() => V38.mem.notlar.length >= 1 && V38.mem.sinavlar.length === 1));
    await ctx.close();
  }

  // ---------- 9. Gündüz / gece: palet, kazanım kartı, kontrast ----------
  const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  for (const theme of ['light', 'dark']) {
    const ctx = await ctxWith(b, {theme}); const p = await open(ctx); await setTeacherPin(p);
    await p.evaluate(() => { go('ogretmen'); OGRT.S().tab = 'hafta'; OGRT.render(); for (let i = 0; i < 6 && !document.querySelector('.ogw-c.c-kaz'); i++) OGRT.W.step(-1); document.querySelectorAll('.ogw-c').forEach(d => d.open = true); });
    await p.waitForTimeout(300);
    const c = await p.evaluate(() => {
      const kz = document.querySelector('.ogw-c.c-kaz'), un = document.querySelector('.ogw-c.c-unite'), cs = e => getComputedStyle(e);
      const bgOf = e => { let x = e, bg; while (x) { bg = cs(x).backgroundColor; if (!/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg; x = x.parentElement; } return cs(document.body).backgroundColor; };
      const pairs = ['.og-top h1', '.c-kaz .ogw-kt', '.ogw-c.c-kaz .ogw-ch b', '.v38-ks', '.ogw-dt', '.ogw-pt', '.ogw-c.c-unite .ogw-cv', '.v38-qa button b', '.c-kaz .ogw-kr .ogw-b:not(.p)'].map(s => { const e = document.querySelector(s); return e ? [s, cs(e).color, bgOf(e)] : [s, null]; });
      const filled = document.querySelector('.c-kaz .ogw-kr .ogw-b.p'), code = document.querySelector('.c-kaz .ogw-kt code');
      return {mode: document.body.hasAttribute('data-ogrt37'), bodyBg: cs(document.body).backgroundColor, kz: {bg: cs(kz).backgroundImage, bd: cs(kz).borderTopColor}, un: {bg: cs(un).backgroundColor, bgi: cs(un).backgroundImage, bd: cs(un).borderTopColor}, motif: !!kz.querySelector('.v38-mt') && !!kz.querySelector('.v38-rb') && !!kz.querySelector('.v38-dv'), unMotif: !!un.querySelector('.v38-mt'), filled: {bg: cs(filled).backgroundImage, c: cs(filled).color}, code: {bg: cs(code).backgroundImage, c: cs(code).color}, pairs,
        st: Object.fromEntries(['bas', 'plan', 'isl', 'tek'].map(k => [k, getComputedStyle(document.body).getPropertyValue('--t37-' + (k === 'isl' ? 'ok' : k)).trim()]))};
    });
    const low = c.pairs.filter(x => x[1] && ratio(x[1], x[2]) < 4.5).map(x => x[0] + ' ' + ratio(x[1], x[2]).toFixed(2));
    const T = theme === 'light' ? 'Gündüz' : 'Gece';
    ok(`9.${theme}.1`, `${T}: öğretmen modu, ${theme === 'light' ? 'fildişi/şampanya zemin, bronz' : 'obsidyen zemin, altın'} vurgular`, c.mode && (theme === 'light' ? lum(c.bodyBg) > .8 : lum(c.bodyBg) < .02) && /gradient/.test(c.filled.bg), {bodyBg: c.bodyBg, filled: c.filled.bg.slice(0, 80)});
    ok(`9.${theme}.2`, `${T}: kazanım kartı özel (degrade zemin, motif, şerit, ayırıcı); diğer kartlar sade`, /gradient/.test(c.kz.bg) && c.motif && !c.unMotif && c.un.bgi === 'none' && c.kz.bd !== c.un.bd, {kz: c.kz.bd, un: c.un.bd});
    ok(`9.${theme}.3`, `${T}: metin kontrastı ≥ 4.5:1 (ölçülen öğeler)`, low.length === 0, low.length ? low : c.pairs.filter(x => x[1]).map(x => x[0] + ' ' + ratio(x[1], x[2]).toFixed(1)).join(', '));
    ok(`9.${theme}.4`, `${T}: durum renkleri ayrı (füme · lacivert · zümrüt · kehribar)`, new Set(Object.values(c.st)).size === 4, c.st);
    await p.screenshot({path: path.join(os.tmpdir(), `v38-test-${theme}.png`)});
    ok(`9.${theme}.5`, `${T}: sayfa hatası yok`, !p._errs.length, p._errs);
    await ctx.close();
  }

  // ---------- 10. Ekran genişlikleri: taşma ve dokunma alanları ----------
  {
    const bad = [], small = [];
    for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
      const ctx = await ctxWith(b, {w, h, theme: w % 2 ? 'light' : 'dark'}); const p = await open(ctx); await setTeacherPin(p);
      await p.evaluate(() => { localStorage.setItem('dk-editor-pin38', JSON.stringify({v: 1, salt: 'e', h: V38.edHash('e', '583920')})); sessionStorage.setItem('dk-editor-oturum38', '1'); const t = Store.all('topics').find(t => t.sections); V38.ED.addVersion('topics', t.id, Object.assign(V38.clone(V38.ED.snapF('topics', t)), {title: t.title + ' (düzenlendi)'}), 'duzenleme', 'test'); });
      const views = [['ogretmen', 'hafta'], ['ogretmen', 'genel'], ['ogretmen', 'kaz'], ['ogretmen', 'sinav'], ['ogretmen', 'notlar'], ['ogretmen', 'ilerleme'], ['ogretmen', 'yedek'], ['ogretmen', 'ara'], ['editor', ''], ['editor', 'bekleyen'], ['editor', 'detay'], ['editor', 'edit']];
      for (const [v, t] of views) {
        const r = await p.evaluate(([v, t]) => {
          if (v === 'ogretmen') { go('ogretmen'); OGRT.S().tab = t; OGRT.render(); document.querySelectorAll('.og details').forEach(d => d.open = true); }
          else { const tp = Store.all('topics').find(x => V38.ED.it('topics', x.id)); G.ed = {k: t === 'bekleyen' ? 'bekleyen' : '', cid: t === 'detay' || t === 'edit' ? 'topics:' + tp.id : '', mode: t === 'edit' ? 'edit' : '', f: {tur: '', g: '', py: '', q: ''}, n: 30, cmp: ''}; go('editor'); }
          const iw = innerWidth, sw = document.documentElement.scrollWidth;
          const over = [...document.querySelectorAll('#app *')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || getComputedStyle(e).position === 'fixed') return false; for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return false; return r.right > iw + 1 || r.left < -1; }).slice(0, 3).map(e => e.className || e.tagName);
          const tiny = [...document.querySelectorAll('#app button, #app select, #app summary, #app input:not([type=hidden]):not([type=file]), #app label.v38-file')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height || getComputedStyle(e).visibility === 'hidden') return false; if (e.closest('.pin37-in')) return false; if (e.type === 'checkbox') return false; return r.height < 43.5 || (e.tagName !== 'SUMMARY' && r.width < 43.5); }).slice(0, 4).map(e => (e.className || e.tagName) + ':' + (e.textContent || e.value || '').trim().slice(0, 18) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
          return {sw, iw, over, tiny};
        }, [v, t]);
        if (r.sw > r.iw + 1 || r.over.length) bad.push(`${w}px ${v}/${t} sw=${r.sw} ${r.over.join(',')}`);
        if (r.tiny.length) small.push(`${w}px ${v}/${t}: ${r.tiny.join(' | ')}`);
      }
      if (p._errs.length) bad.push(`${w}px hata: ${p._errs.join(';')}`);
      await ctx.close();
    }
    ok('10.1', '360 / 390 / 768 / 1024 / 1440 px: öğretmen paneli ve editör ekranlarında yatay taşma yok', bad.length === 0, bad.slice(0, 8));
    ok('10.2', 'Aynı ekranlarda 44 px altında dokunma alanı yok', small.length === 0, small.slice(0, 8));
  }

  // ---------- 11. V37 gerilemesi: öğretmen PIN'i, ses, alt menü ----------
  {
    const ctx = await ctxWith(b, {teacher: false}); const p = await open(ctx);
    await p.evaluate(() => go('ogretmen')); await p.waitForTimeout(300); await keypad(p, '4826'); await keypad(p, '4826');
    const t1 = await p.evaluate(() => !!document.querySelector('.og') && JSON.parse(localStorage.getItem('dk-ogretmen-pin')).v === 2);
    await p.evaluate(() => go('topic', {t: Store.all('topics').find(t => t.sections).id, tab: 'anlat'})); await p.click('#snd37'); await p.waitForTimeout(300); await p.click('.snd37-m >> nth=0'); await p.waitForTimeout(1500);
    await p.evaluate(() => UI.close()); await p.waitForTimeout(300); for (const k of ['games', 'home']) { await p.click(`nav.bnav button[data-k="${k}"]`); await p.waitForTimeout(300); }
    const s = await p.evaluate(() => ({playing: ATM.rt.playing, fab: document.querySelectorAll('#atm-bar,#atm-fab').length}));
    ok('11.1', 'V37 öğretmen PIN\'i oluşturma/giriş ve üst çubuk ses kontrolü çalışıyor; yüzen oynatıcı yok', t1 && s.playing && s.fab === 0, s);
    ok('11.2', 'Gerileme testinde sayfa hatası yok', !p._errs.length, p._errs);
    await ctx.close();
  }

  await b.close(); srv.close();
  const f = R.filter(r => !r.pass);
  console.log(`\nToplam ${R.length} kontrol · geçti ${R.length - f.length} · kaldı ${f.length}`);
  fs.writeFileSync(path.join(__dirname, 'son_sonuc.json'), JSON.stringify(R, null, 1));
  process.exit(f.length ? 1 : 0);
})().catch(e => { console.error('TEST BETİĞİ HATASI', e); process.exit(2); });
