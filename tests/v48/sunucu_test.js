// V48 sunucu testleri — hata ve geri bildirim uç noktaları (depo kökünden): node tests/v48/sunucu_test.js
// Gerçek Google'a bağlanılmaz: V46 testindeki yöntemle yerel JWKS + test anahtarıyla imzalı kimlik belgeleri kullanılır.
// Hesap/eşitleme uç noktaları için ayrıca: node tests/v46/sunucu_test.js
'use strict';
const http = require('node:http'), crypto = require('node:crypto'), cp = require('node:child_process'), path = require('node:path'), fs = require('node:fs'), os = require('node:os');
const ROOT = path.resolve(__dirname, '..', '..');
const S = [];
const ok = (ad, k, a) => { S.push({ad, ok: !!k}); console.log((k ? '✔' : '✘') + ' ' + ad + (a !== undefined ? '  — ' + (typeof a === 'string' ? a : JSON.stringify(a)).slice(0, 300) : '')); };
const CID = 'test-istemci.apps.googleusercontent.com', KOKEN = 'http://127.0.0.1:9';
const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
const KID = 'test-anahtar-48', jwk = Object.assign(publicKey.export({format: 'jwk'}), {kid: KID, alg: 'RS256', use: 'sig'});
const b64u = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const belge = (y) => { const simdi = Math.floor(Date.now() / 1000); const yuk = Object.assign({iss: 'https://accounts.google.com', aud: CID, sub: '1001', email: 'ogrenci@example.com', email_verified: true, name: 'Ayşe Öğrenci', iat: simdi, exp: simdi + 600}, y);
  const g = b64u({alg: 'RS256', kid: KID, typ: 'JWT'}) + '.' + b64u(yuk); return g + '.' + crypto.sign('RSA-SHA256', Buffer.from(g), privateKey).toString('base64url'); };

(async () => {
  const js = http.createServer((q, r) => { r.writeHead(200, {'Content-Type': 'application/json'}); r.end(JSON.stringify({keys: [jwk]})); }).listen(0);
  await new Promise((r) => js.once('listening', r));
  const dbd = fs.mkdtempSync(path.join(os.tmpdir(), 'dkab48-')), port = 18900 + Math.floor(Math.random() * 200);
  const env = Object.assign({}, process.env, {PORT: port, GOOGLE_CLIENT_ID: CID, IZINLI_KOKENLER: KOKEN, VERITABANI: path.join(dbd, 'v.sqlite'), GOOGLE_JWKS_URL: 'http://127.0.0.1:' + js.address().port + '/', EDITOR_EPOSTALARI: 'editor@example.com', OGRETMEN_EPOSTALARI: 'ogretmen@example.com', NODE_NO_WARNINGS: '1'});
  const sv = cp.spawn(process.execPath, [path.join(ROOT, 'sunucu', 'sunucu.js')], {env, stdio: ['ignore', 'pipe', 'pipe']});
  await new Promise((r) => sv.stdout.on('data', (d) => { if (/sunucusu/.test(d)) r(); }));
  const U = 'http://127.0.0.1:' + port;
  const istek = async (yol, yontem, govde, t) => { const r = await fetch(U + yol, {method: yontem || 'GET', headers: Object.assign({'Content-Type': 'application/json', Origin: KOKEN}, t ? {Authorization: 'Bearer ' + t} : {}), body: govde ? JSON.stringify(govde) : undefined}); let j = {}; try { j = await r.json(); } catch (e) {} return {d: r.status, j, h: r.headers}; };
  const gir = async (y) => (await istek('/api/giris', 'POST', {credential: belge(y)})).j.oturum;
  const BG = {sinif: 5, programYili: '2026', uniteId: 'DKAB-5-U01', unite: '1. ALLAH İNANCI', konuId: 'TPC-5-1-01', konu: 'Evrendeki Düzeni Fark Etmek', kazanim: ['DKAB.5.1.1'], soruId: 'Q-DKAB-5-0001', bolum: 'test', bolumAd: 'Mini Test'};
  const bil = (o) => Object.assign({id: crypto.randomUUID(), tur: 'soru', kategori: 'Doğru cevap hatalı', aciklama: 'B şıkkı da doğru görünüyor.', anonim: false, kaynak: 'ogrenci', baglam: BG, tarih: new Date().toISOString(), surum: 'V48.0'}, o);
  try {
    const og = await gir({}), ed = await gir({sub: '3003', email: 'editor@example.com', name: 'Editör Bey'}), ogr = await gir({sub: '4004', email: 'ogretmen@example.com', name: 'Öğretmen Hanım'}), og2 = await gir({sub: '5005', email: 'diger@example.com', name: 'Başka Öğrenci'});
    ok('B1 oturumsuz bildirim reddedilir (401)', (await istek('/api/bildirim', 'POST', bil())).d === 401);
    const k1 = bil(); const r1 = await istek('/api/bildirim', 'POST', k1, og);
    ok('B2 öğrenci soru bildirimi gönderir: benzersiz kimlikle kaydedilir, durum “yeni”', r1.d === 201 && r1.j.id === k1.id && r1.j.durum === 'yeni', r1.j);
    const r1b = await istek('/api/bildirim', 'POST', k1, og);
    ok('B3 aynı bildirim yeniden gönderilirse çift kayıt oluşmaz (idempotent, 200)', r1b.d === 200 && r1b.j.yeni === false, r1b.j);
    const r1c = await istek('/api/bildirim', 'POST', k1, og2);
    ok('B4 başka kullanıcı aynı kimliği kullanamaz (409)', r1c.d === 409, r1c.d);
    const kotu = [bil({kategori: 'Uydurma'}), bil({tur: 'x'}), bil({id: 'a b'}), bil({tur: 'soru', baglam: Object.assign({}, BG, {soruId: ''})}), bil({baglam: null})];
    const kd = []; for (const k of kotu) kd.push((await istek('/api/bildirim', 'POST', k, og)).d);
    ok('B5 geçersiz tür/kategori/kimlik/bağlam reddedilir (400)', kd.every((d) => d === 400), kd);
    const k2 = bil({tur: 'icerik', kategori: 'Ayet veya hadis referansı hatalı', anonim: true, baglam: Object.assign({}, BG, {soruId: '', bolum: 'anlat', bolumAd: 'Anlatım'})});
    await istek('/api/bildirim', 'POST', k2, og);
    const k3 = bil({kaynak: 'ogretmen', kategori: 'Birden fazla doğru cevap'}); await istek('/api/bildirim', 'POST', k3, ogr);
    const k4 = bil({kaynak: 'ogretmen'}); await istek('/api/bildirim', 'POST', k4, og2);
    const lo = await istek('/api/bildirim', 'GET', null, og);
    ok('B6 öğrenci tüm bildirimleri listeleyemez (403); yalnız kendi durumlarını görür', lo.d === 403 && (await istek('/api/bildirim/benim', 'GET', null, og)).j.liste.length === 2, lo.d);
    const le = await istek('/api/bildirim', 'GET', null, ed); const L = le.j.liste || [];
    const a2 = L.find((x) => x.id === k2.id), a1 = L.find((x) => x.id === k1.id);
    ok('B7 editör listeyi alır; anonim bildirimde ad yok, diğerinde yalnız ad (e-posta hiç gönderilmez)', le.d === 200 && L.length === 4 && a2.kullaniciAd === '' && a1.kullaniciAd === 'Ayşe Öğrenci' && !JSON.stringify(L).includes('@example.com'), {n: L.length, a2: a2 && a2.kullaniciAd, a1: a1 && a1.kullaniciAd});
    ok('B8 kaynak sunucuda doğrulanır: öğretmen rolü olan hesap “öğretmen”, olmayan “öğrenci” sayılır', L.find((x) => x.id === k3.id).kaynak === 'ogretmen' && L.find((x) => x.id === k4.id).kaynak === 'ogrenci');
    ok('B9 otomatik alanlar saklanır (sınıf, müfredat, ünite, konu, kazanım, soru kimliği, bölüm, tarih, sürüm) ve benzerler aynı hedefte', a1.baglam.sinif === 5 && a1.baglam.programYili === '2026' && a1.baglam.kazanim[0] === 'DKAB.5.1.1' && a1.baglam.soruId === 'Q-DKAB-5-0001' && a1.surum === 'V48.0' && a1.hedef === 'soru:Q-DKAB-5-0001' && L.filter((x) => x.hedef === a1.hedef).length === 3, a1.hedef);
    const pOg = await istek('/api/bildirim/' + k1.id, 'PATCH', {durum: 'duzeltildi'}, og);
    ok('B10 öğrenci bildirimin durumunu değiştiremez (403)', pOg.d === 403, pOg.d);
    const p1 = await istek('/api/bildirim/' + k1.id, 'PATCH', {durum: 'inceleniyor', not: 'Cevap anahtarı kitapla karşılaştırılacak.'}, ed);
    ok('B11 editör incelemeye alır ve iç not ekler (not ve durum geçmişi saklanır)', p1.d === 200 && p1.j.durum === 'inceleniyor' && p1.j.notlar.length === 2 && p1.j.notlar[0].editor === 'Editör Bey', p1.j.notlar);
    const p2 = await istek('/api/bildirim/' + k2.id, 'PATCH', {durum: 'gecersiz'}, ed);
    const p3 = await istek('/api/bildirim/' + k2.id, 'PATCH', {durum: 'gecersiz', gerekce: 'Ayet numarası mushafla doğrulandı; doğru.'}, ed);
    ok('B12 gerekçesiz “geçersiz” reddedilir; gerekçeyle kapatılır', p2.d === 400 && p3.d === 200 && p3.j.durum === 'gecersiz' && /mushaf/.test(p3.j.gerekce), [p2.d, p3.d]);
    const p4 = await istek('/api/bildirim/' + k1.id, 'PATCH', {durum: 'duzeltildi'}, ed);
    const bn = await istek('/api/bildirim/benim', 'GET', null, og);
    ok('B13 öğrenci kendi bildirimlerinin güncel durumunu görür (düzeltildi / geçersiz + gerekçe)', p4.d === 200 && bn.j.liste.find((x) => x.id === k1.id).durum === 'duzeltildi' && bn.j.liste.find((x) => x.id === k2.id).gerekce.length > 5);
    const fl = await istek('/api/bildirim?durum=yeni', 'GET', null, ed);
    ok('B14 editör duruma göre süzer', fl.d === 200 && fl.j.liste.every((x) => x.durum === 'yeni') && fl.j.liste.length === 2, fl.j.liste.length);
    const op = await fetch(U + '/api/bildirim/' + k1.id, {method: 'OPTIONS', headers: {Origin: KOKEN}});
    ok('B15 CORS ön isteği PATCH yöntemine izin verir', op.status === 204 && /PATCH/.test(op.headers.get('access-control-allow-methods') || ''));
    sv.kill('SIGTERM'); await new Promise((r) => sv.once('exit', r));
    const sv2 = cp.spawn(process.execPath, [path.join(ROOT, 'sunucu', 'sunucu.js')], {env, stdio: ['ignore', 'pipe', 'pipe']});
    await new Promise((r) => sv2.stdout.on('data', (d) => { if (/sunucusu/.test(d)) r(); }));
    const ed2 = await gir({sub: '3003', email: 'editor@example.com', name: 'Editör Bey'}); const kalici = await istek('/api/bildirim', 'GET', null, ed2);
    ok('B16 sunucu yeniden başlayınca bildirimler ve durumlar kaybolmaz (SQLite)', kalici.j.liste.length === 4 && kalici.j.liste.find((x) => x.id === k1.id).durum === 'duzeltildi');
    sv2.kill();
  } finally { try { sv.kill(); } catch (e) {} js.close(); }
  const g = S.filter((x) => x.ok).length; console.log(`\nToplam: ${g}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'sunucu_sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), sonuc: S}, null, 1));
  process.exitCode = g === S.length ? 0 : 1;
})().catch((e) => { console.error(e); process.exit(1); });
