// DKAB platformu — hesap, bulut kayıt ve hata/geri bildirim sunucusu (V46.0; bildirimler V48.0; editör PIN sıfırlama V51.5)
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
CREATE INDEX IF NOT EXISTS oturum_k ON oturum(kullanici_id);
CREATE TABLE IF NOT EXISTS bildirim(id TEXT PRIMARY KEY, kullanici_id INTEGER NOT NULL, anonim INTEGER NOT NULL, kaynak TEXT NOT NULL, tur TEXT NOT NULL, kategori TEXT NOT NULL, aciklama TEXT, baglam TEXT NOT NULL, hedef TEXT NOT NULL, istemci_tarih TEXT, surum TEXT, durum TEXT NOT NULL, notlar TEXT NOT NULL, gerekce TEXT, olusturma TEXT NOT NULL, guncelleme TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS bildirim_d ON bildirim(durum);
CREATE INDEX IF NOT EXISTS bildirim_k ON bildirim(kullanici_id);`);
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
  veriGun: db.prepare('UPDATE veri SET surum=surum+1, icerik=?, guncelleme=? WHERE kullanici_id=? AND surum=?'),
  bEkle: db.prepare('INSERT OR IGNORE INTO bildirim(id,kullanici_id,anonim,kaynak,tur,kategori,aciklama,baglam,hedef,istemci_tarih,surum,durum,notlar,gerekce,olusturma,guncelleme) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'),
  bAl: db.prepare('SELECT * FROM bildirim WHERE id=?'),
  bBenim: db.prepare('SELECT id, durum, gerekce, guncelleme FROM bildirim WHERE kullanici_id=? ORDER BY olusturma DESC LIMIT 500'),
  bHepsi: db.prepare('SELECT b.*, k.ad AS kullanici_ad FROM bildirim b LEFT JOIN kullanici k ON k.id=b.kullanici_id ORDER BY b.olusturma DESC LIMIT 2000'),
  bDurum: db.prepare('SELECT b.*, k.ad AS kullanici_ad FROM bildirim b LEFT JOIN kullanici k ON k.id=b.kullanici_id WHERE b.durum=? ORDER BY b.olusturma DESC LIMIT 2000'),
  bGun: db.prepare('UPDATE bildirim SET durum=?, notlar=?, gerekce=?, guncelleme=? WHERE id=?')
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
/* V51.5: editör PIN'i — e-posta doğrulamalı sıfırlama ve sunucu taraflı doğrulama (sunucu/editor_pin.js) */
const EPIN = require('./editor_pin.js')(db, {yanit, govdeOku, hizSiniri, ozet});
function oturumBul(req) { const m = /^Bearer ([A-Za-z0-9_-]{20,})$/.exec(req.headers.authorization || ''); if (!m) return null; const o = Q.otBul.get(ozet(m[1]), Date.now()); if (!o) return null; return {o, u: Q.kulId.get(o.kullanici_id), ham: m[1]}; }
function veriGecerli(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  return Object.keys(v).every((k) => VERI_ANAHTAR.includes(k) && v[k] && typeof v[k] === 'object');
}

/* ---------- hata ve geri bildirim (V48) ---------- */
const B_KAT = {
  icerik: ['Yanlış bilgi', 'Eksik bilgi', 'Ayet veya hadis referansı hatalı', 'Kaynak hatası', 'Açıklama yetersiz', 'Yazım hatası', 'Diğer'],
  soru: ['Doğru cevap hatalı', 'Soru kökü hatalı', 'Birden fazla doğru cevap', 'Şıklar hatalı', 'Açıklama hatalı', 'Kaynak veya kazanım eşleşmesi yanlış', 'Diğer'],
  // V51: öğretmen paneli › Araçlar › Sorun Bildir (kategori = hatanın bulunduğu bölüm; konu isteğe bağlı)
  genel: ['Haftalık plan', 'Yıllık plan dağılımı', 'Sınıflarım', 'Konu içeriği', 'Sorular ve testler', 'Bilgi kartları', 'Oyunlar', 'Görünüm ve gezinme', 'Diğer']
};
const B_DURUM = ['yeni', 'inceleniyor', 'duzeltildi', 'gecersiz'];
const kisa = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');
function bildirimTemiz(g) {
  if (!g || typeof g !== 'object') return null;
  if (typeof g.id !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(g.id)) return null;
  if (!B_KAT[g.tur] || !B_KAT[g.tur].includes(g.kategori)) return null;
  const b = g.baglam; if (!b || typeof b !== 'object' || Array.isArray(b)) return null;
  const baglam = {sinif: Number.isInteger(+b.sinif) ? +b.sinif : null, programYili: kisa(b.programYili, 12), uniteId: kisa(b.uniteId, 40), unite: kisa(b.unite, 160), konuId: kisa(b.konuId, 40), konu: kisa(b.konu, 200),
    kazanim: Array.isArray(b.kazanim) ? b.kazanim.slice(0, 12).map((x) => kisa(x, 40)) : [], soruId: kisa(b.soruId, 40), bolum: kisa(b.bolum, 20), bolumAd: kisa(b.bolumAd, 40)};
  if (g.tur !== 'genel' && !baglam.konuId && !baglam.soruId) return null;
  if (g.tur === 'genel' && g.kaynak !== 'ogretmen') return null;
  if (g.tur === 'soru' && !baglam.soruId) return null;
  return {id: g.id, tur: g.tur, kategori: g.kategori, aciklama: kisa(g.aciklama, 1000), anonim: g.anonim ? 1 : 0, kaynak: g.kaynak === 'ogretmen' ? 'ogretmen' : 'ogrenci', baglam, tarih: kisa(g.tarih, 40), surum: kisa(g.surum, 16)};
}
const bHedef = (b) => b.soruId ? 'soru:' + b.soruId : b.konuId ? 'konu:' + b.konuId + ':' + b.bolum : 'genel:' + (b.bolumAd || '') + ':' + (b.sinif || '');
// editöre giden kayıt: anonimse kimlik yok; değilse yalnız ad (e-posta gösterilmez)
const bEditorJSON = (r) => ({id: r.id, tur: r.tur, kategori: r.kategori, aciklama: r.aciklama || '', anonim: !!r.anonim, kaynak: r.kaynak, kullaniciAd: r.anonim ? '' : (r.kullanici_ad || ''), baglam: JSON.parse(r.baglam), hedef: r.hedef, tarih: r.olusturma, istemciTarih: r.istemci_tarih, surum: r.surum, durum: r.durum, notlar: JSON.parse(r.notlar), gerekce: r.gerekce || '', guncelleme: r.guncelleme});

/* ---------- uç noktalar ---------- */
async function isle(req, res) {
  const koken = req.headers.origin || '', izinli = A.kokenler.includes(koken);
  const cors = izinli ? {'Access-Control-Allow-Origin': koken, 'Vary': 'Origin', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Editor-Oturum', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS', 'Access-Control-Max-Age': '600'} : {};
  const url = new URL(req.url, 'http://x'), yol = url.pathname, ip = req.socket.remoteAddress || '';
  if (req.method === 'OPTIONS') return yanit(res, izinli ? 204 : 403, undefined, cors);
  if (yol === '/api/saglik') return yanit(res, 200, {ok: true}, cors);
  if (koken && !izinli) return yanit(res, 403, {hata: 'Bu adresten gelen isteklere izin verilmiyor.'});
  if (yol === '/api/yapilandirma' && req.method === 'GET') return yanit(res, 200, {googleClientId: A.clientId, veriAnahtarlari: VERI_ANAHTAR}, cors);
  if (yol.startsWith('/api/editor-pin/')) return EPIN(req, res, yol, ip, cors);
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
  if (yol === '/api/bildirim' && req.method === 'POST') {
    if (!hizSiniri(ip, 'bildirim:' + O.u.id, 30, 60e3)) return yanit(res, 429, {hata: 'Çok sık bildirim. Biraz bekleyin.'}, cors);
    const k = bildirimTemiz(await govdeOku(req)); if (!k) return yanit(res, 400, {hata: 'Geçersiz bildirim.'}, cors);
    const var0 = Q.bAl.get(k.id);
    if (var0) { if (var0.kullanici_id !== O.u.id) return yanit(res, 409, {hata: 'Bu kimlik başka bir bildirime ait.'}, cors); return yanit(res, 200, {id: k.id, durum: var0.durum, yeni: false}, cors); }
    if (k.tur === 'genel' && !roller(O.u).includes('ogretmen')) return yanit(res, 403, {hata: 'Sorun bildirimi öğretmen hesabı ister.'}, cors);
    const kaynak = k.kaynak === 'ogretmen' && roller(O.u).includes('ogretmen') ? 'ogretmen' : 'ogrenci', simdi = new Date().toISOString();
    Q.bEkle.run(k.id, O.u.id, k.anonim, kaynak, k.tur, k.kategori, k.aciklama, JSON.stringify(k.baglam), bHedef(k.baglam), k.tarih, k.surum, 'yeni', '[]', '', simdi, simdi);
    return yanit(res, 201, {id: k.id, durum: 'yeni', yeni: true}, cors);
  }
  if (yol === '/api/bildirim/benim' && req.method === 'GET') return yanit(res, 200, {liste: Q.bBenim.all(O.u.id)}, cors);
  if (yol === '/api/bildirim' && req.method === 'GET') {
    if (!roller(O.u).includes('editor')) return yanit(res, 403, {hata: 'Bu işlem için editör yetkisi gerekir.'}, cors);
    const d = url.searchParams.get('durum'); if (d && !B_DURUM.includes(d)) return yanit(res, 400, {hata: 'Geçersiz durum.'}, cors);
    return yanit(res, 200, {liste: (d ? Q.bDurum.all(d) : Q.bHepsi.all()).map(bEditorJSON)}, cors);
  }
  const bm = /^\/api\/bildirim\/([A-Za-z0-9_-]{8,64})$/.exec(yol);
  if (bm && req.method === 'PATCH') {
    if (!roller(O.u).includes('editor')) return yanit(res, 403, {hata: 'Bu işlem için editör yetkisi gerekir.'}, cors);
    const r = Q.bAl.get(bm[1]); if (!r) return yanit(res, 404, {hata: 'Bildirim bulunamadı.'}, cors);
    const g = await govdeOku(req), simdi = new Date().toISOString(), notlar = JSON.parse(r.notlar);
    if (g.durum !== undefined && !B_DURUM.includes(g.durum)) return yanit(res, 400, {hata: 'Geçersiz durum.'}, cors);
    const gerekce = kisa(g.gerekce, 500).trim();
    if (g.durum === 'gecersiz' && gerekce.length < 5) return yanit(res, 400, {hata: 'Geçersiz saymak için gerekçe yazılmalı.'}, cors);
    const not = kisa(g.not, 1000).trim();
    if (not) notlar.push({metin: not, zaman: simdi, editor: O.u.ad || 'Editör'});
    if (g.durum && g.durum !== r.durum) notlar.push({metin: 'Durum: ' + r.durum + ' → ' + g.durum + (gerekce ? ' — ' + gerekce : ''), zaman: simdi, editor: O.u.ad || 'Editör', sistem: 1});
    if (!not && !g.durum) return yanit(res, 400, {hata: 'Değişiklik yok.'}, cors);
    Q.bGun.run(g.durum || r.durum, JSON.stringify(notlar.slice(-200)), g.durum === 'gecersiz' ? gerekce : (g.durum ? '' : r.gerekce), simdi, r.id);
    return yanit(res, 200, bEditorJSON(Object.assign(Q.bAl.get(r.id), {kullanici_ad: (Q.kulId.get(r.kullanici_id) || {}).ad})), cors);
  }
  return yanit(res, 404, {hata: 'Bulunamadı'}, cors);
}
const sunucu = http.createServer((req, res) => { isle(req, res).catch((e) => { const k = req.headers.origin && A.kokenler.includes(req.headers.origin) ? {'Access-Control-Allow-Origin': req.headers.origin, 'Vary': 'Origin'} : {}; if (!res.headersSent) yanit(res, e.kod || 500, {hata: e.kod ? e.message : 'Sunucu hatası'}, k); if (!e.kod) console.error(e); }); });
if (require.main === module) sunucu.listen(A.port, () => console.log(`DKAB sunucusu :${A.port} · kökenler: ${A.kokenler.join(', ') || '(yok)'}`));
module.exports = {sunucu, dogrula, A};
