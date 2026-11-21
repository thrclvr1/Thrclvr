// V46 sunucu testleri (depo kökünden): node tests/v46/sunucu_test.js
// Gerçek Google'a bağlanılmaz: test için bir RSA anahtar çifti üretilir, açık anahtar yerel bir JWKS adresinden sunulur
// (GOOGLE_JWKS_URL), kimlik belgeleri bu anahtarla imzalanır. Sunucunun doğrulama kodu gerçek akıştakiyle aynıdır.
'use strict';
const http = require('node:http'), crypto = require('node:crypto'), cp = require('node:child_process'), path = require('node:path'), fs = require('node:fs'), os = require('node:os');
const ROOT = path.resolve(__dirname, '..', '..');
const S = [];
const ok = (ad, k, a) => { S.push({ad, ok: !!k}); console.log((k ? '✔' : '✘') + ' ' + ad + (a !== undefined ? '  — ' + (typeof a === 'string' ? a : JSON.stringify(a)).slice(0, 300) : '')); };
const CID = 'test-istemci.apps.googleusercontent.com', KOKEN = 'http://127.0.0.1:9';
const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
const KID = 'test-anahtar-1', jwk = Object.assign(publicKey.export({format: 'jwk'}), {kid: KID, alg: 'RS256', use: 'sig'});
const b64u = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const belge = (y, o) => { o = o || {}; const bas = {alg: 'RS256', kid: o.kid || KID, typ: 'JWT'}, simdi = Math.floor(Date.now() / 1000); const yuk = Object.assign({iss: 'https://accounts.google.com', aud: CID, sub: '1001', email: 'ogrenci@example.com', email_verified: true, name: 'Test Öğrenci', iat: simdi, exp: simdi + 3600}, y); const g = b64u(bas) + '.' + b64u(yuk); return g + '.' + crypto.sign('RSA-SHA256', Buffer.from(g), o.anahtar || privateKey).toString('base64url'); };
module.exports = {belge, CID};

async function main() {
  const js = http.createServer((q, r) => { r.writeHead(200, {'Content-Type': 'application/json'}); r.end(JSON.stringify({keys: [jwk]})); }).listen(0);
  await new Promise((r) => js.once('listening', r));
  const dbd = fs.mkdtempSync(path.join(os.tmpdir(), 'dkab-')), port = 18700 + Math.floor(Math.random() * 200);
  const env = Object.assign({}, process.env, {PORT: port, GOOGLE_CLIENT_ID: CID, IZINLI_KOKENLER: KOKEN, VERITABANI: path.join(dbd, 'v.sqlite'), GOOGLE_JWKS_URL: 'http://127.0.0.1:' + js.address().port + '/', EDITOR_EPOSTALARI: 'editor@example.com', NODE_NO_WARNINGS: '1'});
  const sv = cp.spawn(process.execPath, [path.join(ROOT, 'sunucu', 'sunucu.js')], {env, stdio: ['ignore', 'pipe', 'pipe']});
  await new Promise((r) => sv.stdout.on('data', (d) => { if (/sunucusu/.test(d)) r(); }));
  const U = 'http://127.0.0.1:' + port, H = (t, ek) => Object.assign({'Content-Type': 'application/json', Origin: KOKEN}, t ? {Authorization: 'Bearer ' + t} : {}, ek || {});
  const istek = async (yol, yontem, govde, t, ek) => { const r = await fetch(U + yol, {method: yontem || 'GET', headers: H(t, ek), body: govde ? JSON.stringify(govde) : undefined}); let j = {}; try { j = await r.json(); } catch (e) {} return {d: r.status, j, h: r.headers}; };
  try {
    const y = await istek('/api/yapilandirma'); ok('S1 yapılandırma yalnız istemci kimliğini verir (gizli bilgi yok)', y.d === 200 && y.j.googleClientId === CID && Object.keys(y.j).join() === 'googleClientId,veriAnahtarlari', y.j);
    const yb = await istek('/api/yapilandirma', 'GET', null, null, {Origin: 'https://kotu.example'}); ok('S2 izinli olmayan kökenden gelen istek reddedilir (CORS)', yb.d === 403, yb.d);
    const g1 = await istek('/api/giris', 'POST', {credential: belge({})}); ok('S3 geçerli Google kimlik belgesiyle giriş: oturum ve kullanıcı', g1.d === 200 && g1.j.oturum && g1.j.kullanici.eposta === 'ogrenci@example.com' && g1.j.kullanici.roller.join() === 'ogrenci', g1.j.kullanici);
    const kotu = [['yanlış hedef kitle (aud)', belge({aud: 'baska'})], ['süresi dolmuş', belge({exp: Math.floor(Date.now() / 1000) - 3600})], ['yanlış yayıncı', belge({iss: 'https://kotu.example'})], ['bilinmeyen anahtarla imza', belge({}, {anahtar: crypto.generateKeyPairSync('rsa', {modulusLength: 2048}).privateKey})], ['doğrulanmamış e-posta', belge({email_verified: false})], ['bozuk belge', 'a.b.c']];
    const sonuc = []; for (const [ad, b] of kotu) { const r = await istek('/api/giris', 'POST', {credential: b}); sonuc.push(ad + ':' + r.d); }
    ok('S4 geçersiz belgeler reddedilir (hedef kitle, süre, yayıncı, imza, e-posta doğrulaması, biçim)', sonuc.every((x) => x.endsWith(':401')), sonuc);
    const t = g1.j.oturum;
    ok('S5 oturumsuz veri isteği reddedilir', (await istek('/api/veri')).d === 401);
    const v0 = await istek('/api/veri', 'GET', null, t); ok('S6 yeni kullanıcının bulut verisi boş (sürüm 0)', v0.d === 200 && v0.j.surum === 0, v0.j);
    const veri = {'dk2': {prog: {O1: {correct: 2, wrong: 1}}}, 'dk-oyun41': {v: 1, oyunlar: {}}};
    const p1 = await istek('/api/veri', 'PUT', {temelSurum: 0, veri}, t); ok('S7 veri kaydedilir (sürüm 1)', p1.d === 200 && p1.j.surum === 1, p1.j);
    const p2 = await istek('/api/veri', 'PUT', {temelSurum: 0, veri}, t); ok('S8 eski sürümle yazma çakışma (409) döner ve güncel veriyi verir', p2.d === 409 && p2.j.surum === 1 && p2.j.veri.dk2.prog.O1.correct === 2, p2.d);
    const p3 = await istek('/api/veri', 'PUT', {temelSurum: 1, veri: {kotu: {}}}, t); ok('S9 izin verilmeyen anahtar içeren veri reddedilir', p3.d === 400, p3.d);
    const g2 = await istek('/api/giris', 'POST', {credential: belge({})}); const v2 = await istek('/api/veri', 'GET', null, g2.j.oturum);
    ok('S10 aynı Google hesabıyla ikinci cihazdan giriş: aynı veri geri gelir', v2.d === 200 && v2.j.surum === 1 && v2.j.veri.dk2.prog.O1.correct === 2, v2.j.surum);
    const g3 = await istek('/api/giris', 'POST', {credential: belge({sub: '2002', email: 'editor@example.com'})}); const v3 = await istek('/api/veri', 'GET', null, g3.j.oturum);
    ok('S11 başka hesap başkasının verisini görmez; rol sunucuda e-posta listesinden (editör)', v3.j.surum === 0 && g3.j.kullanici.roller.includes('editor'), {surum: v3.j.surum, roller: g3.j.kullanici.roller});
    const c = await istek('/api/cikis', 'POST', null, t); const c2 = await istek('/api/veri', 'GET', null, t); ok('S12 çıkıştan sonra oturum belirteci geçersiz', c.d === 200 && c2.d === 401);
    const db = fs.readFileSync(path.join(dbd, 'v.sqlite')).toString('latin1'); ok('S13 oturum belirteci veritabanında açık metin tutulmaz (yalnız SHA-256 özeti)', !db.includes(g2.j.oturum));
    const buyuk = await fetch(U + '/api/veri', {method: 'PUT', headers: H(g2.j.oturum), body: JSON.stringify({temelSurum: 1, veri: {'dk2': {x: 'a'.repeat(3 * 1024 * 1024)}}})}).then((r) => r.status).catch(() => 'kesildi');
    ok('S14 2 MB üstü gövde 413 ile reddedilir', buyuk === 413, buyuk);
  } finally { sv.kill(); js.close(); }
  const g = S.filter((x) => x.ok).length; console.log(`\nToplam: ${g}/${S.length} kontrol geçti`);
  fs.writeFileSync(path.join(__dirname, 'sunucu_sonuc.json'), JSON.stringify({tarih: new Date().toISOString(), sonuc: S}, null, 1));
  process.exitCode = g === S.length ? 0 : 1;
}
if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
