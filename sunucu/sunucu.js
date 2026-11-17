// DKAB platformu — hesap ve bulut kayıt sunucusu (V46.0)
// Bağımlılık yok: Node.js 22.13+ (node:http, node:crypto, node:sqlite).
// Çalıştırma: GOOGLE_CLIENT_ID=... IZINLI_KOKENLER=https://thrclvr1.github.io node sunucu/sunucu.js
// Ayrıntı: sunucu/README.md
'use strict';
const http = require('node:http'), crypto = require('node:crypto'), fs = require('node:fs'), path = require('node:path');
const {DatabaseSync} = require('node:sqlite');

const A = {
  port: +(process.env.PORT || 8787),
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  kokenler: (process.env.IZINLI_KOKENLER || '').split(',').map((s) => s.trim()).filter(Boolean),
  db: process.env.VERITABANI || path.join(__dirname, 'veri', 'dkab.sqlite'),
  jwks: process.env.GOOGLE_JWKS_URL || 'https://www.googleapis.com/oauth2/v3/certs',
  ogretmen: (process.env.OGRETMEN_EPOSTALARI || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean),
  editor: (process.env.EDITOR_EPOSTALARI || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean),
  oturumGun: +(process.env.OTURUM_GUN || 30),
  enBuyukGovde: 2 * 1024 * 1024
};
const ISS = ['accounts.google.com', 'https://accounts.google.com'];
const VERI_ANAHTAR = ['dk2', 'dk-ilerleme39', 'dk-oyun41', 'dk-calis45'];

if (!A.clientId) { console.error('GOOGLE_CLIENT_ID tanımlı değil. sunucu/README.md'); process.exit(1); }
if (!A.kokenler.length) console.warn('Uyarı: IZINLI_KOKENLER boş; tarayıcıdan gelen hiçbir istek kabul edilmez.');
fs.mkdirSync(path.dirname(A.db), {recursive: true});
const db = new DatabaseSync(A.db);
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS kullanici(id INTEGER PRIMARY KEY, google_sub TEXT UNIQUE NOT NULL, eposta TEXT, ad TEXT, olusturma TEXT, son_giris TEXT);
CREATE TABLE IF NOT EXISTS oturum(ozet TEXT PRIMARY KEY, kullanici_id INTEGER NOT NULL, bitis INTEGER NOT NULL, olusturma TEXT);
CREATE TABLE IF NOT EXISTS veri(kullanici_id INTEGER PRIMARY KEY, surum INTEGER NOT NULL, icerik TEXT NOT NULL, guncelleme TEXT);
CREATE INDEX IF NOT EXISTS oturum_k ON oturum(kullanici_id);`);
const Q = {
  kulBul: db.prepare('SELECT * FROM kullanici WHERE google_sub=?'),
  kulEkle: db.prepare('INSERT INTO kullanici(google_sub,eposta,ad,olusturma,son_giris) VALUES(?,?,?,?,?)'),
  kulGun: db.prepare('UPDATE kullanici SET eposta=?, ad=?, son_giris=? WHERE id=?'),
  kulId: db.prepare('SELECT * FROM kullanici WHERE id=?'),
  otEkle: db.prepare('INSERT INTO oturum(ozet,kullanici_id,bitis,olusturma) VALUES(?,?,?,?)'),
  otBul: db.prepare('SELECT * FROM oturum WHERE ozet=? AND bitis>?'),
  otSil: db.prepare('DELETE FROM oturum WHERE ozet=?'),
  otTemiz: db.prepare('DELETE FROM oturum WHERE bitis<=?'),
  veriAl: db.prepare('SELECT surum, icerik, guncelleme FROM veri WHERE kullanici_id=?'),
  veriEkle: db.prepare('INSERT INTO veri(kullanici_id,surum,icerik,guncelleme) VALUES(?,?,?,?)'),
  veriGun: db.prepare('UPDATE veri SET surum=surum+1, icerik=?, guncelleme=? WHERE kullanici_id=? AND surum=?')
};

/* ---------- Google kimlik belgesi (ID token) doğrulama: RS256 + Google açık anahtarları ---------- */
let anahtarlar = {zaman: 0, ks: {}};
async function jwks() {
  if (Date.now() - anahtarlar.zaman < 3600e3 && Object.keys(anahtarlar.ks).length) return anahtarlar.ks;
  const r = await fetch(A.jwks); if (!r.ok) throw new Error('anahtarlar alınamadı');
  const j = await r.json(), ks = {};
  (j.keys || []).forEach((k) => { if (k.kty === 'RSA' && k.kid) ks[k.kid] = crypto.createPublicKey({key: k, format: 'jwk'}); });
  anahtarlar = {zaman: Date.now(), ks}; return ks;
}
const b64 = (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
async function dogrula(belge) {
  const p = String(belge || '').split('.'); if (p.length !== 3) throw new Error('belge biçimi');
  const bas = JSON.parse(b64(p[0]).toString()), yuk = JSON.parse(b64(p[1]).toString());
  if (bas.alg !== 'RS256' || !bas.kid) throw new Error('algoritma');
  let ks = await jwks(); if (!ks[bas.kid]) { anahtarlar.zaman = 0; ks = await jwks(); }
  const k = ks[bas.kid]; if (!k) throw new Error('bilinmeyen anahtar');
  const ok = crypto.verify('RSA-SHA256', Buffer.from(p[0] + '.' + p[1]), k, b64(p[2])); if (!ok) throw new Error('imza');
  const simdi = Math.floor(Date.now() / 1000);
  if (!ISS.includes(yuk.iss)) throw new Error('yayıncı');
  if (yuk.aud !== A.clientId) throw new Error('hedef kitle');
  if (!(yuk.exp > simdi - 30)) throw new Error('süresi dolmuş');
  if (yuk.iat && yuk.iat > simdi + 300) throw new Error('zaman');
  if (!yuk.sub) throw new Error('kimlik');
  if (yuk.email && yuk.email_verified === false) throw new Error('doğrulanmamış e-posta');
  return yuk;
}

/* ---------- yardımcılar ---------- */
const ozet = (t) => crypto.createHash('sha256').update(t).digest('hex');
const roller = (u) => { const e = String(u.eposta || '').toLowerCase(), r = ['ogrenci']; if (A.ogretmen.includes(e)) r.push('ogretmen'); if (A.editor.includes(e)) r.push('editor'); return r; };
const kulJSON = (u) => ({ad: u.ad || '', eposta: u.eposta || '', roller: roller(u)});
function yanit(res, kod, govde, ek) { res.writeHead(kod, Object.assign({'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}, ek || {})); res.end(govde === undefined ? '' : JSON.stringify(govde)); }
function govdeOku(req) {
  return new Promise((ok, red) => { let n = 0, fazla = false; const P = []; req.on('data', (c) => { n += c.length; if (n > A.enBuyukGovde) { fazla = true; P.length = 0; } else if (!fazla) P.push(c); });
    req.on('end', () => { if (fazla) return red(Object.assign(new Error('Veri çok büyük (en çok 2 MB).'), {kod: 413})); try { ok(P.length ? JSON.parse(Buffer.concat(P).toString('utf8')) : {}); } catch (e) { red(Object.assign(new Error('JSON'), {kod: 400})); } }); req.on('error', red); });
}
const sayac = new Map();
function hizSiniri(ip, ad, n, ms) { const k = ad + ':' + ip, s = Date.now(), L = (sayac.get(k) || []).filter((t) => s - t < ms); L.push(s); sayac.set(k, L); return L.length <= n; }
function oturumBul(req) { const m = /^Bearer ([A-Za-z0-9_-]{20,})$/.exec(req.headers.authorization || ''); if (!m) return null; const o = Q.otBul.get(ozet(m[1]), Date.now()); if (!o) return null; return {o, u: Q.kulId.get(o.kullanici_id), ham: m[1]}; }
function veriGecerli(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  return Object.keys(v).every((k) => VERI_ANAHTAR.includes(k) && v[k] && typeof v[k] === 'object');
}

/* ---------- uç noktalar ---------- */
async function isle(req, res) {
  const koken = req.headers.origin || '', izinli = A.kokenler.includes(koken);
  const cors = izinli ? {'Access-Control-Allow-Origin': koken, 'Vary': 'Origin', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS', 'Access-Control-Max-Age': '600'} : {};
  const url = new URL(req.url, 'http://x'), yol = url.pathname, ip = req.socket.remoteAddress || '';
  if (req.method === 'OPTIONS') return yanit(res, izinli ? 204 : 403, undefined, cors);
  if (yol === '/api/saglik') return yanit(res, 200, {ok: true}, cors);
  if (koken && !izinli) return yanit(res, 403, {hata: 'Bu adresten gelen isteklere izin verilmiyor.'});
  if (yol === '/api/yapilandirma' && req.method === 'GET') return yanit(res, 200, {googleClientId: A.clientId, veriAnahtarlari: VERI_ANAHTAR}, cors);
  if (yol === '/api/giris' && req.method === 'POST') {
    if (!hizSiniri(ip, 'giris', 20, 60e3)) return yanit(res, 429, {hata: 'Çok fazla deneme. Biraz bekleyin.'}, cors);
    const g = await govdeOku(req); let y;
    try { y = await dogrula(g.credential); } catch (e) { return yanit(res, 401, {hata: 'Google kimliği doğrulanamadı: ' + e.message}, cors); }
    const simdi = new Date().toISOString(); let u = Q.kulBul.get(y.sub);
    if (!u) { Q.kulEkle.run(y.sub, y.email || '', y.name || '', simdi, simdi); u = Q.kulBul.get(y.sub); } else { Q.kulGun.run(y.email || u.eposta, y.name || u.ad, simdi, u.id); u = Q.kulId.get(u.id); }
    Q.otTemiz.run(Date.now());
    const t = crypto.randomBytes(32).toString('base64url'); Q.otEkle.run(ozet(t), u.id, Date.now() + A.oturumGun * 864e5, simdi);
    return yanit(res, 200, {oturum: t, kullanici: kulJSON(u)}, cors);
  }
  const O = oturumBul(req);
  if (!O) return yanit(res, 401, {hata: 'Oturum yok ya da süresi doldu.'}, cors);
  if (yol === '/api/ben' && req.method === 'GET') return yanit(res, 200, {kullanici: kulJSON(O.u)}, cors);
  if (yol === '/api/cikis' && req.method === 'POST') { Q.otSil.run(ozet(O.ham)); return yanit(res, 200, {ok: true}, cors); }
  if (yol === '/api/veri' && req.method === 'GET') { const v = Q.veriAl.get(O.u.id); return yanit(res, 200, v ? {surum: v.surum, veri: JSON.parse(v.icerik), guncelleme: v.guncelleme} : {surum: 0, veri: {}, guncelleme: null}, cors); }
  if (yol === '/api/veri' && req.method === 'PUT') {
    if (!hizSiniri(ip, 'veri:' + O.u.id, 60, 60e3)) return yanit(res, 429, {hata: 'Çok sık kayıt.'}, cors);
    const g = await govdeOku(req); if (!veriGecerli(g.veri) || !Number.isInteger(g.temelSurum)) return yanit(res, 400, {hata: 'Geçersiz veri.'}, cors);
    const simdi = new Date().toISOString(), v = Q.veriAl.get(O.u.id), icerik = JSON.stringify(g.veri);
    if (!v) { if (g.temelSurum !== 0) return yanit(res, 409, {hata: 'Sürüm çakışması', surum: 0, veri: {}}, cors); Q.veriEkle.run(O.u.id, 1, icerik, simdi); return yanit(res, 200, {surum: 1, guncelleme: simdi}, cors); }
    const r = Q.veriGun.run(icerik, simdi, O.u.id, g.temelSurum);
    if (!r.changes) { const c = Q.veriAl.get(O.u.id); return yanit(res, 409, {hata: 'Sürüm çakışması', surum: c.surum, veri: JSON.parse(c.icerik), guncelleme: c.guncelleme}, cors); }
    return yanit(res, 200, {surum: g.temelSurum + 1, guncelleme: simdi}, cors);
  }
  return yanit(res, 404, {hata: 'Bulunamadı'}, cors);
}
const sunucu = http.createServer((req, res) => { isle(req, res).catch((e) => { const k = req.headers.origin && A.kokenler.includes(req.headers.origin) ? {'Access-Control-Allow-Origin': req.headers.origin, 'Vary': 'Origin'} : {}; if (!res.headersSent) yanit(res, e.kod || 500, {hata: e.kod ? e.message : 'Sunucu hatası'}, k); if (!e.kod) console.error(e); }); });
if (require.main === module) sunucu.listen(A.port, () => console.log(`DKAB sunucusu :${A.port} · kökenler: ${A.kokenler.join(', ') || '(yok)'}`));
module.exports = {sunucu, dogrula, A};
