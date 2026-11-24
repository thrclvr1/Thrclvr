// DKAB sunucusu — editör PIN'i: e-posta doğrulamalı sıfırlama ve sunucu taraflı PIN doğrulama altyapısı (V51.5).
// Bağımlılık yok (node:crypto, node:net, node:tls, node:fs). sunucu.js bu modülü yükler.
//
// Gizli bilgiler YALNIZ sunucu ortam değişkenlerindedir; HTML'e hiçbiri yazılmaz:
//   EDITOR_SIFIRLAMA_EPOSTASI  kodun gönderileceği editör e-posta adresi
//   EPOSTA_SAGLAYICI           smtp | resend | dosya (dosya = yalnız yerel test; gerçek e-posta göndermez)
//   EPOSTA_GONDEREN            gönderen adresi (ör. "DKAB <no-reply@alanadiniz.com>")
//   SMTP_SUNUCU, SMTP_PORT (465), SMTP_KULLANICI, SMTP_PAROLA, SMTP_GUVENLI (1 = TLS; 0 yalnız yerel test)
//   RESEND_API_ANAHTARI
//   EPOSTA_DOSYA_DIZINI        (dosya sağlayıcısı) e-postaların JSON olarak yazılacağı dizin
//   EP_KOD_SURE_SN             kod geçerlilik süresi (varsayılan 600 sn = 10 dk)
//
// Uç noktalar (hepsi /api/editor-pin/…; Google oturumu gerektirmez — PIN'ini unutan editör giriş yapamaz):
//   GET  durum     → {sifirlama, saglayici, test, pinSunucuda, kodDakika}
//   POST talep     → tek kullanımlık 6 haneli kod üretir, editör e-postasına gönderir → {talepId, bitis, test}
//   POST dogrula   {talepId, kod}  → en çok 5 deneme; süre dolunca geçersiz; doğruysa → {jeton} (10 dk, tek kullanımlık)
//   POST tamamla   {jeton, pin}    → yeni PIN'i (scrypt) sunucuda saklar, PIN sürümünü artırır, eski editör oturumlarını kapatır
//   POST giris     {pin}           → sunucu taraflı PIN doğrulama (kademeli kilit) → {oturum, pinSurumu}  [üretim altyapısı]
//   GET  gecmis    (X-Editor-Oturum) → işlem geçmişi
'use strict';
const crypto = require('node:crypto'), net = require('node:net'), tls = require('node:tls'), fs = require('node:fs'), path = require('node:path');

const KILIT_SN = [60, 300, 900, 3600, 21600];
const env = (k, d) => (process.env[k] === undefined ? d : process.env[k]);

function ayar() {
  const s = String(env('EPOSTA_SAGLAYICI', '')).toLowerCase().trim();
  const E = {
    alici: String(env('EDITOR_SIFIRLAMA_EPOSTASI', '')).trim(), saglayici: s, gonderen: String(env('EPOSTA_GONDEREN', '')).trim(),
    smtp: {host: env('SMTP_SUNUCU', ''), port: +env('SMTP_PORT', 465), kullanici: env('SMTP_KULLANICI', ''), parola: env('SMTP_PAROLA', ''), guvenli: env('SMTP_GUVENLI', '1') !== '0'},
    resend: env('RESEND_API_ANAHTARI', ''), dizin: env('EPOSTA_DOSYA_DIZINI', ''), kodSn: Math.max(1, +env('EP_KOD_SURE_SN', 600))
  };
  E.hazir = !!E.alici && (
    (s === 'smtp' && !!E.gonderen && !!E.smtp.host && !!E.smtp.kullanici && !!E.smtp.parola) ||
    (s === 'resend' && !!E.gonderen && !!E.resend) ||
    (s === 'dosya' && !!E.dizin));
  return E;
}

/* ---------- e-posta gönderimi ---------- */
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const adresYalin = (a) => { const m = /<([^>]+)>/.exec(a); return (m ? m[1] : a).trim(); };
function mesaj(E, konu, metin) {
  const govde = b64(metin).replace(/.{1,76}/g, '$&\r\n');
  return [`From: ${E.gonderen}`, `To: ${E.alici}`, `Subject: =?UTF-8?B?${b64(konu)}?=`, `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomBytes(12).toString('hex')}@dkab>`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64', '', govde].join('\r\n');
}
function smtpGonder(E, konu, metin) {
  return new Promise((ok, red) => {
    const o = E.smtp, s = o.guvenli ? tls.connect({host: o.host, port: o.port, servername: o.host}) : net.connect({host: o.host, port: o.port});
    let tampon = '', bitti = false;
    const adimlar = [
      [220, null], [250, 'EHLO dkab.local'], [334, 'AUTH LOGIN'], [334, b64(o.kullanici)], [235, b64(o.parola)],
      [250, `MAIL FROM:<${adresYalin(E.gonderen)}>`], [[250, 251], `RCPT TO:<${adresYalin(E.alici)}>`], [354, 'DATA'],
      [250, mesaj(E, konu, metin).replace(/^\./gm, '..') + '\r\n.'], [221, 'QUIT']];
    let i = 0;
    const son = (h) => { if (bitti) return; bitti = true; clearTimeout(z); try { s.end(); } catch (e) {} h ? red(h) : ok(); };
    const z = setTimeout(() => son(new Error('SMTP zaman aşımı')), 20000);
    const gonder = () => { const a = adimlar[i]; if (a && a[1] !== null) s.write(a[1] + '\r\n'); };
    s.on('data', (d) => {
      tampon += d.toString('utf8');
      let m; while ((m = /^(\d{3})([ -])(.*)\r?\n/m.exec(tampon))) {
        tampon = tampon.slice(m.index + m[0].length);
        if (m[2] === '-') continue; // çok satırlı yanıt sürüyor
        const bekle = adimlar[i][0], kod = +m[1];
        if (!(Array.isArray(bekle) ? bekle.includes(kod) : kod === bekle)) return son(new Error('SMTP ' + kod + ' ' + m[3].slice(0, 120)));
        i++; if (i >= adimlar.length) return son(); gonder();
      }
    });
    s.on('error', (e) => son(e)); s.on('close', () => { if (!bitti) son(new Error('SMTP bağlantısı kapandı')); });
  });
}
async function epostaGonder(E, konu, metin) {
  if (E.saglayici === 'smtp') return smtpGonder(E, konu, metin);
  if (E.saglayici === 'resend') {
    const r = await fetch('https://api.resend.com/emails', {method: 'POST', headers: {Authorization: 'Bearer ' + E.resend, 'Content-Type': 'application/json'}, body: JSON.stringify({from: E.gonderen, to: [E.alici], subject: konu, text: metin})});
    if (!r.ok) throw new Error('Resend ' + r.status);
    return;
  }
  if (E.saglayici === 'dosya') { // YALNIZ YEREL TEST: gerçek e-posta göndermez
    fs.mkdirSync(E.dizin, {recursive: true});
    fs.writeFileSync(path.join(E.dizin, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + '.json'), JSON.stringify({alici: E.alici, konu, metin}));
    return;
  }
  throw new Error('E-posta sağlayıcısı yok');
}

/* ---------- modül ---------- */
module.exports = function kur(db, yardim) {
  const {yanit, govdeOku, hizSiniri, ozet} = yardim;
  db.exec(`CREATE TABLE IF NOT EXISTS ep_talep(id TEXT PRIMARY KEY, kod_ozet TEXT NOT NULL, bitis INTEGER NOT NULL, deneme INTEGER NOT NULL DEFAULT 0, durum TEXT NOT NULL, olusturma TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ep_jeton(ozet TEXT PRIMARY KEY, talep_id TEXT, bitis INTEGER NOT NULL, kullanildi INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS ep_pin(id INTEGER PRIMARY KEY CHECK(id=1), salt TEXT NOT NULL, ozet TEXT NOT NULL, surum INTEGER NOT NULL, guncelleme TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ep_kilit(id INTEGER PRIMARY KEY CHECK(id=1), hatali INTEGER NOT NULL, kilit_sayisi INTEGER NOT NULL, bitis INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS ep_oturum(ozet TEXT PRIMARY KEY, surum INTEGER NOT NULL, bitis INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS ep_gecmis(id INTEGER PRIMARY KEY AUTOINCREMENT, olay TEXT NOT NULL, ayrinti TEXT, ip_ozet TEXT, tarih TEXT NOT NULL);`);
  const Q = {
    tEkle: db.prepare('INSERT INTO ep_talep(id,kod_ozet,bitis,deneme,durum,olusturma) VALUES(?,?,?,0,?,?)'),
    tAl: db.prepare('SELECT * FROM ep_talep WHERE id=?'),
    tDurum: db.prepare('UPDATE ep_talep SET durum=? WHERE id=?'),
    tDeneme: db.prepare('UPDATE ep_talep SET deneme=deneme+1 WHERE id=?'),
    tIptal: db.prepare("UPDATE ep_talep SET durum='iptal' WHERE durum='bekliyor'"),
    jEkle: db.prepare('INSERT INTO ep_jeton(ozet,talep_id,bitis,kullanildi) VALUES(?,?,?,0)'),
    jAl: db.prepare('SELECT * FROM ep_jeton WHERE ozet=?'),
    jKullan: db.prepare('UPDATE ep_jeton SET kullanildi=1 WHERE ozet=? AND kullanildi=0'),
    pAl: db.prepare('SELECT * FROM ep_pin WHERE id=1'),
    pYaz: db.prepare('INSERT INTO ep_pin(id,salt,ozet,surum,guncelleme) VALUES(1,?,?,?,?) ON CONFLICT(id) DO UPDATE SET salt=excluded.salt, ozet=excluded.ozet, surum=excluded.surum, guncelleme=excluded.guncelleme'),
    kAl: db.prepare('SELECT * FROM ep_kilit WHERE id=1'),
    kYaz: db.prepare('INSERT INTO ep_kilit(id,hatali,kilit_sayisi,bitis) VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET hatali=excluded.hatali, kilit_sayisi=excluded.kilit_sayisi, bitis=excluded.bitis'),
    oEkle: db.prepare('INSERT INTO ep_oturum(ozet,surum,bitis) VALUES(?,?,?)'),
    oAl: db.prepare('SELECT * FROM ep_oturum WHERE ozet=? AND bitis>?'),
    oHepsiSil: db.prepare('DELETE FROM ep_oturum'),
    gEkle: db.prepare('INSERT INTO ep_gecmis(olay,ayrinti,ip_ozet,tarih) VALUES(?,?,?,?)'),
    gListe: db.prepare('SELECT olay, ayrinti, tarih FROM ep_gecmis ORDER BY id DESC LIMIT 200')
  };
  const simdi = () => new Date().toISOString();
  const gecmis = (olay, ayrinti, ip) => Q.gEkle.run(olay, ayrinti || '', ip ? ozet('ip|' + ip).slice(0, 16) : '', simdi());
  const kodOzet = (talepId, kod) => ozet('ep-kod|' + talepId + '|' + kod);
  const esit = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
  const pinOzet = (salt, pin) => crypto.scryptSync(String(pin), salt, 32).toString('hex');

  return async function isleEP(req, res, yol, ip, cors) {
    const E = ayar(), alt = yol.slice('/api/editor-pin/'.length);
    if (alt === 'durum' && req.method === 'GET') return yanit(res, 200, {sifirlama: E.hazir, saglayici: E.hazir ? E.saglayici : '', test: E.hazir && E.saglayici === 'dosya', pinSunucuda: !!Q.pAl.get(), kodDakika: Math.round(E.kodSn / 60)}, cors);
    if (req.method !== 'POST' && alt !== 'gecmis') return yanit(res, 405, {hata: 'Yöntem desteklenmiyor.'}, cors);

    if (alt === 'talep') {
      if (!E.hazir) return yanit(res, 503, {kod: 'yapilandirilmadi', hata: 'Editör PIN sıfırlaması bu sunucuda yapılandırılmadı (e-posta servisi ya da editör e-postası tanımlı değil). E-posta gönderilmedi.'}, cors);
      if (!hizSiniri(ip, 'ep-talep', 3, 15 * 60e3) || !hizSiniri('*', 'ep-talep-genel', 10, 60 * 60e3)) { gecmis('talep-hiz-siniri', '', ip); return yanit(res, 429, {kod: 'hiz', hata: 'Çok fazla sıfırlama isteği. 15 dakika sonra yeniden deneyin.'}, cors); }
      Q.tIptal.run();
      const id = crypto.randomBytes(18).toString('base64url'), kod = String(crypto.randomInt(0, 1e6)).padStart(6, '0'), bitis = Date.now() + E.kodSn * 1000;
      Q.tEkle.run(id, kodOzet(id, kod), bitis, 'bekliyor', simdi());
      const dk = Math.round(E.kodSn / 60) || 1;
      try {
        await epostaGonder(E, 'DKAB editör PIN sıfırlama kodu', `DKAB Din Kültürü platformu editör PIN sıfırlama kodunuz: ${kod}\n\nKod ${dk} dakika geçerlidir ve yalnız bir kez kullanılabilir.\nBu isteği siz yapmadıysanız bu e-postayı yok sayın; editör PIN'i değişmez.\n`);
      } catch (e) { Q.tDurum.run('gonderilemedi', id); gecmis('talep-gonderilemedi', String(e.message).slice(0, 120), ip); return yanit(res, 502, {kod: 'gonderilemedi', hata: 'E-posta gönderilemedi. Sıfırlama kodu oluşturulmadı.'}, cors); }
      gecmis('talep', E.saglayici, ip);
      return yanit(res, 200, {talepId: id, bitis, test: E.saglayici === 'dosya'}, cors);
    }

    if (alt === 'dogrula') {
      if (!hizSiniri(ip, 'ep-dogrula', 20, 15 * 60e3)) return yanit(res, 429, {kod: 'hiz', hata: 'Çok fazla deneme. Biraz bekleyin.'}, cors);
      const g = await govdeOku(req), t = typeof g.talepId === 'string' && Q.tAl.get(g.talepId), kod = typeof g.kod === 'string' ? g.kod : '';
      if (!t) return yanit(res, 400, {kod: 'yok', hata: 'Sıfırlama isteği bulunamadı. Yeni kod isteyin.'}, cors);
      if (t.durum !== 'bekliyor') return yanit(res, 400, {kod: t.durum === 'kullanildi' ? 'kullanildi' : t.durum === 'kilitlendi' ? 'cok-deneme' : 'gecersiz', hata: t.durum === 'kullanildi' ? 'Bu kod daha önce kullanıldı. Yeni kod isteyin.' : t.durum === 'kilitlendi' ? 'Çok fazla hatalı deneme; bu kod geçersiz. Yeni kod isteyin.' : 'Bu kod artık geçerli değil. Yeni kod isteyin.'}, cors);
      if (t.bitis <= Date.now()) { Q.tDurum.run('suresi-doldu', t.id); gecmis('kod-suresi-doldu', '', ip); return yanit(res, 400, {kod: 'suresi-doldu', hata: 'Kodun süresi doldu. Yeni kod isteyin.'}, cors); }
      if (!/^\d{6}$/.test(kod) || !esit(kodOzet(t.id, kod), t.kod_ozet)) {
        Q.tDeneme.run(t.id); const n = t.deneme + 1;
        if (n >= 5) { Q.tDurum.run('kilitlendi', t.id); gecmis('kod-cok-deneme', '', ip); return yanit(res, 400, {kod: 'cok-deneme', kalan: 0, hata: 'Çok fazla hatalı deneme; bu kod geçersiz. Yeni kod isteyin.'}, cors); }
        gecmis('kod-hatali', String(n), ip); return yanit(res, 400, {kod: 'hatali', kalan: 5 - n, hata: `Kod hatalı. Kalan deneme: ${5 - n}.`}, cors);
      }
      Q.tDurum.run('kullanildi', t.id);
      const j = crypto.randomBytes(32).toString('base64url'), bitis = Date.now() + 10 * 60e3; Q.jEkle.run(ozet(j), t.id, bitis);
      gecmis('kod-dogrulandi', '', ip);
      return yanit(res, 200, {jeton: j, bitis}, cors);
    }

    if (alt === 'tamamla') {
      const g = await govdeOku(req), pin = g.pin;
      if (typeof pin !== 'string' || !/^\d{6}$/.test(pin)) return yanit(res, 400, {kod: 'pin', hata: 'PIN tam olarak 6 rakam olmalı.'}, cors);
      const jo = typeof g.jeton === 'string' ? ozet(g.jeton) : '', j = jo && Q.jAl.get(jo);
      if (!j || j.kullanildi || j.bitis <= Date.now()) return yanit(res, 400, {kod: 'jeton', hata: 'Doğrulama geçerli değil ya da süresi doldu. Sıfırlamayı baştan başlatın.'}, cors);
      if (!Q.jKullan.run(jo).changes) return yanit(res, 400, {kod: 'jeton', hata: 'Doğrulama zaten kullanıldı.'}, cors);
      const eski = Q.pAl.get(), surum = (eski ? eski.surum : 0) + 1, salt = crypto.randomBytes(16).toString('hex');
      Q.pYaz.run(salt, pinOzet(salt, pin), surum, simdi());
      Q.oHepsiSil.run(); Q.kYaz.run(0, 0, 0);
      gecmis('pin-degisti', 'surum ' + surum, ip); gecmis('oturumlar-kapatildi', '', ip);
      return yanit(res, 200, {ok: true, pinSurumu: surum}, cors);
    }

    if (alt === 'giris') { // sunucu taraflı doğrulama (üretim altyapısı)
      const p = Q.pAl.get(); if (!p) return yanit(res, 404, {kod: 'pin-yok', hata: 'Sunucuda editör PIN\'i tanımlı değil.'}, cors);
      const k = Q.kAl.get() || {hatali: 0, kilit_sayisi: 0, bitis: 0};
      if (k.bitis > Date.now()) return yanit(res, 423, {kod: 'kilitli', kalanSn: Math.ceil((k.bitis - Date.now()) / 1000), hata: 'Çok fazla hatalı deneme. Giriş geçici olarak kilitli.'}, cors);
      const g = await govdeOku(req), pin = typeof g.pin === 'string' ? g.pin : '';
      if (/^\d{6}$/.test(pin) && esit(pinOzet(p.salt, pin), p.ozet)) {
        Q.kYaz.run(0, 0, 0);
        const t = crypto.randomBytes(32).toString('base64url'); Q.oEkle.run(ozet(t), p.surum, Date.now() + 12 * 3600e3);
        gecmis('giris', '', ip); return yanit(res, 200, {oturum: t, pinSurumu: p.surum}, cors);
      }
      let hatali = k.hatali + 1, ks = k.kilit_sayisi, bitis = 0;
      if (hatali >= 5) { bitis = Date.now() + KILIT_SN[Math.min(ks, KILIT_SN.length - 1)] * 1000; ks++; hatali = 0; gecmis('kilit', String(Math.round((bitis - Date.now()) / 1000)), ip); }
      Q.kYaz.run(hatali, ks, bitis); gecmis('giris-hatali', '', ip);
      return yanit(res, bitis ? 423 : 401, bitis ? {kod: 'kilitli', kalanSn: Math.ceil((bitis - Date.now()) / 1000), hata: 'Çok fazla hatalı deneme. Giriş geçici olarak kilitli.'} : {kod: 'hatali', kalan: 5 - hatali, hata: 'PIN hatalı.'}, cors);
    }

    if (alt === 'gecmis' && req.method === 'GET') {
      const h = String(req.headers['x-editor-oturum'] || ''), o = h && Q.oAl.get(ozet(h), Date.now()), p = Q.pAl.get();
      if (!o || !p || o.surum !== p.surum) return yanit(res, 401, {hata: 'Editör oturumu yok ya da kapatıldı.'}, cors);
      return yanit(res, 200, {liste: Q.gListe.all()}, cors);
    }
    return yanit(res, 404, {hata: 'Bulunamadı'}, cors);
  };
};
module.exports.ayar = ayar;
module.exports.smtpGonder = smtpGonder;
