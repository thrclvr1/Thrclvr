// V51.5 sunucu testi — editör PIN sıfırlama uç noktaları (node tests/v51_5/sunucu_test.js)
// Gerçek e-posta gönderilmez: “dosya” test sağlayıcısı ve yerel sahte SMTP sunucusu kullanılır.
const cp = require('child_process'), path = require('path'), fs = require('fs'), os = require('os'), net = require('net');
const ROOT = path.resolve(__dirname, '..', '..');
const S = [];
const ok = (ad, k, a) => { S.push({ad, ok: !!k}); console.log((k ? '✔' : '✘') + ' ' + ad + (a !== undefined ? '  — ' + JSON.stringify(a).slice(0, 300) : '')); };
const bek = (ms) => new Promise((r) => setTimeout(r, ms));
const ALICI = 'editor-test@example.invalid';
async function sunucu(ek) {
  const port = 19400 + Math.floor(Math.random() * 500), d = fs.mkdtempSync(path.join(os.tmpdir(), 'dkab515-'));
  const env = Object.assign({}, process.env, {PORT: port, GOOGLE_CLIENT_ID: 'test.apps.googleusercontent.com', IZINLI_KOKENLER: 'http://test.local', VERITABANI: path.join(d, 'v.sqlite'), NODE_NO_WARNINGS: '1'}, ek || {});
  const sv = cp.spawn(process.execPath, [path.join(ROOT, 'sunucu', 'sunucu.js')], {env, stdio: ['ignore', 'pipe', 'pipe']});
  await new Promise((r, j) => { sv.stdout.on('data', (x) => { if (/sunucusu/.test(x)) r(); }); sv.on('exit', (c) => j(new Error('çıktı ' + c))); });
  const U = 'http://127.0.0.1:' + port;
  const ist = async (yol, govde, h) => { const r = await fetch(U + '/api/editor-pin/' + yol, govde === undefined ? {headers: h || {}} : {method: 'POST', headers: Object.assign({'Content-Type': 'application/json'}, h || {}), body: JSON.stringify(govde)}); let j = {}; try { j = await r.json(); } catch (e) {} return {d: r.status, j}; };
  return {sv, ist, d};
}
const sonKod = (dir) => { const f = fs.readdirSync(dir).sort().pop(); const m = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); return {kod: (/kodunuz: (\d{6})/.exec(m.metin) || [])[1], m, n: fs.readdirSync(dir).length}; };

(async () => {
  /* 1. yapılandırılmamış sunucu */
  {
    const {sv, ist} = await sunucu({});
    const d = await ist('durum'), t = await ist('talep', {});
    ok('S1 E-posta servisi yapılandırılmamışsa durum “sifirlama:false”; talep 503 “yapilandirilmadi”, e-posta gönderildi denmez', d.j.sifirlama === false && t.d === 503 && t.j.kod === 'yapilandirilmadi' && !/gönderildi\b/i.test(t.j.hata) && /gönderilmedi/.test(t.j.hata), {d: d.j, t});
    const ep = await ist('talep', {}); ok('S1b Yapılandırılmamış sunucuda PIN giriş uç noktası PIN tanımlı değil der (404)', (await ist('giris', {pin: '030792'})).d === 404, ep.d);
    sv.kill();
  }
  /* 2. dosya (test) sağlayıcısı */
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dkab515-posta-'));
  {
    const {sv, ist} = await sunucu({EDITOR_SIFIRLAMA_EPOSTASI: ALICI, EPOSTA_SAGLAYICI: 'dosya', EPOSTA_DOSYA_DIZINI: dir});
    const d = await ist('durum');
    ok('S2 Durum: sıfırlama hazır, test modu açıkça bildirilir; e-posta adresi yanıtta yok', d.j.sifirlama === true && d.j.test === true && !JSON.stringify(d.j).includes('@'), d.j);
    const t1 = await ist('talep', {}); const k1 = sonKod(dir);
    ok('S3 Talep: tek kullanımlık 6 haneli kod üretilir ve yalnız sunucudaki editör adresine yazılır; yanıtta kod ve adres yok', t1.d === 200 && t1.j.talepId && /^\d{6}$/.test(k1.kod) && k1.m.alici === ALICI && !JSON.stringify(t1.j).includes(k1.kod) && !JSON.stringify(t1.j).includes('@'), {t: t1.d, bitis: t1.j.bitis - Date.now()});
    const yanlis = k1.kod === '000000' ? '111111' : '000000';
    const h1 = await ist('dogrula', {talepId: t1.j.talepId, kod: yanlis});
    ok('S4 Hatalı kod reddedilir, kalan deneme bildirilir', h1.d === 400 && h1.j.kod === 'hatali' && h1.j.kalan === 4, h1.j);
    for (let i = 0; i < 4; i++) await ist('dogrula', {talepId: t1.j.talepId, kod: yanlis});
    const h5 = await ist('dogrula', {talepId: t1.j.talepId, kod: k1.kod});
    ok('S5 5 hatalı denemeden sonra kod geçersiz: doğru kod bile kabul edilmez (tekrar tekrar denenemez)', h5.d === 400 && h5.j.kod === 'cok-deneme', h5.j);
    const t2 = await ist('talep', {}); const k2 = sonKod(dir);
    const eski = await ist('dogrula', {talepId: t1.j.talepId, kod: k1.kod});
    const d2 = await ist('dogrula', {talepId: t2.j.talepId, kod: k2.kod});
    ok('S6 Doğru kod → tek kullanımlık jeton', d2.d === 200 && typeof d2.j.jeton === 'string' && d2.j.jeton.length > 30 && eski.d === 400, {d2: d2.d, eski: eski.j.kod});
    const tekrar = await ist('dogrula', {talepId: t2.j.talepId, kod: k2.kod});
    ok('S7 Kod tek kullanımlık: ikinci kullanım reddedilir', tekrar.d === 400 && tekrar.j.kod === 'kullanildi', tekrar.j);
    const sayi = await ist('tamamla', {jeton: d2.j.jeton, pin: 482915});
    ok('S8 PIN metin olmalı ve 6 rakam: sayı olarak gönderilen PIN reddedilir', sayi.d === 400 && sayi.j.kod === 'pin', sayi.j);
    const tm = await ist('tamamla', {jeton: d2.j.jeton, pin: '048291'});
    const tm2 = await ist('tamamla', {jeton: d2.j.jeton, pin: '111222'});
    ok('S9 Doğrulamadan sonra PIN değişir (başında 0 olan PIN korunur), PIN sürümü artar; jeton ikinci kez kullanılamaz', tm.d === 200 && tm.j.pinSurumu === 1 && tm2.d === 400, {tm: tm.j, tm2: tm2.j.kod});
    const sahte = await ist('tamamla', {jeton: 'x'.repeat(43), pin: '123456'});
    ok('S10 Doğrulama olmadan (geçersiz jetonla) PIN değiştirilemez', sahte.d === 400 && sahte.j.kod === 'jeton', sahte.j);
    const g1 = await ist('giris', {pin: '048291'}), gh = await ist('giris', {pin: '048290'});
    ok('S11 Sunucu taraflı PIN doğrulama: doğru PIN → oturum; yanlış → 401 ve kalan deneme', g1.d === 200 && g1.j.oturum && g1.j.pinSurumu === 1 && gh.d === 401 && gh.j.kalan === 4, {g1: g1.d, gh: gh.j});
    const gc = await ist('gecmis', undefined, {'X-Editor-Oturum': g1.j.oturum});
    ok('S12 İşlem geçmişi tutulur (talep, hatalı kod, çok deneme, doğrulama, PIN değişti, oturumlar kapatıldı, giriş)', gc.d === 200 && ['talep', 'kod-hatali', 'kod-cok-deneme', 'kod-dogrulandi', 'pin-degisti', 'oturumlar-kapatildi', 'giris'].every((o) => gc.j.liste.some((x) => x.olay === o)), gc.j.liste && gc.j.liste.map((x) => x.olay));
    for (let i = 0; i < 4; i++) await ist('giris', {pin: '000001'});
    const kl = await ist('giris', {pin: '048291'});
    ok('S13 Sunucuda 5 hatalı PIN → kilit (423); kilitteyken doğru PIN de reddedilir', kl.d === 423 && kl.j.kod === 'kilitli' && kl.j.kalanSn > 50, kl.j);
    const t3 = await ist('talep', {}); const k3 = sonKod(dir); const d3 = await ist('dogrula', {talepId: t3.j.talepId, kod: k3.kod}); await ist('tamamla', {jeton: d3.j.jeton, pin: '765432'});
    const gc2 = await ist('gecmis', undefined, {'X-Editor-Oturum': g1.j.oturum}), g2 = await ist('giris', {pin: '765432'});
    ok('S14 PIN sıfırlanınca eski editör oturumları kapanır (401) ve kilit kalkar; yeni PIN ile giriş açılır', gc2.d === 401 && g2.d === 200 && g2.j.pinSurumu === 2, {gc2: gc2.d, g2: g2.j.pinSurumu});
    const t4 = await ist('talep', {});
    ok('S15 Talep hız sınırı: aynı adresten 15 dakikada 3 talepten sonrası 429', t4.d === 429 && t4.j.kod === 'hiz', t4.j);
    sv.kill();
  }
  /* 3. süresi dolan kod */
  {
    const dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'dkab515-posta2-'));
    const {sv, ist} = await sunucu({EDITOR_SIFIRLAMA_EPOSTASI: ALICI, EPOSTA_SAGLAYICI: 'dosya', EPOSTA_DOSYA_DIZINI: dir2, EP_KOD_SURE_SN: '2'});
    const t = await ist('talep', {}); const k = sonKod(dir2); await bek(2600);
    const d = await ist('dogrula', {talepId: t.j.talepId, kod: k.kod});
    ok('S16 Süresi dolan kod reddedilir (“suresi-doldu”), doğru olsa bile', d.d === 400 && d.j.kod === 'suresi-doldu', d.j);
    sv.kill();
  }
  /* 4. SMTP sağlayıcısı (yerel sahte SMTP sunucusu; şifresiz yalnız test için) */
  {
    const alinan = {komut: [], veri: ''};
    const smtp = net.createServer((s) => {
      let veriModu = false, tampon = '';
      s.write('220 sahte ESMTP\r\n');
      s.on('data', (d) => {
        tampon += d.toString();
        let i; while ((i = tampon.indexOf('\r\n')) >= 0) {
          const l = tampon.slice(0, i); tampon = tampon.slice(i + 2);
          if (veriModu) { if (l === '.') { veriModu = false; s.write('250 tamam\r\n'); } else alinan.veri += l + '\n'; continue; }
          alinan.komut.push(l);
          if (/^EHLO/.test(l)) s.write('250-sahte\r\n250 AUTH LOGIN\r\n');
          else if (l === 'AUTH LOGIN') s.write('334 VXNlcm5hbWU6\r\n');
          else if (alinan.komut.length === 3) s.write('334 UGFzc3dvcmQ6\r\n');
          else if (alinan.komut.length === 4) s.write('235 kimlik tamam\r\n');
          else if (/^MAIL FROM/.test(l) || /^RCPT TO/.test(l)) s.write('250 tamam\r\n');
          else if (l === 'DATA') { veriModu = true; s.write('354 gonder\r\n'); }
          else if (l === 'QUIT') { s.write('221 hosca kal\r\n'); s.end(); }
        }
      });
    }).listen(0);
    await new Promise((r) => smtp.once('listening', r));
    const {sv, ist} = await sunucu({EDITOR_SIFIRLAMA_EPOSTASI: ALICI, EPOSTA_SAGLAYICI: 'smtp', EPOSTA_GONDEREN: 'DKAB <no-reply@example.invalid>', SMTP_SUNUCU: '127.0.0.1', SMTP_PORT: String(smtp.address().port), SMTP_KULLANICI: 'kul', SMTP_PAROLA: 'gizli-parola', SMTP_GUVENLI: '0'});
    const d = await ist('durum'), t = await ist('talep', {});
    const govde = Buffer.from(alinan.veri.split('\n\n').slice(1).join('').replace(/\s/g, ''), 'base64').toString('utf8');
    ok('S17 SMTP: kimlik doğrulama (AUTH LOGIN), alıcı yalnız sunucudaki editör adresi, kod e-posta gövdesinde; test modu değil', d.j.sifirlama && !d.j.test && t.d === 200 && alinan.komut.includes('RCPT TO:<' + ALICI + '>') && Buffer.from(alinan.komut[3], 'base64').toString() === 'gizli-parola' && /kodunuz: \d{6}/.test(govde), {komut: alinan.komut.filter((x) => !/^[A-Za-z0-9+/=]+$/.test(x)), govde: govde.slice(0, 80)});
    smtp.close(); sv.kill();
    const {sv: sv2, ist: ist2} = await sunucu({EDITOR_SIFIRLAMA_EPOSTASI: ALICI, EPOSTA_SAGLAYICI: 'smtp', EPOSTA_GONDEREN: 'x@example.invalid', SMTP_SUNUCU: '127.0.0.1', SMTP_PORT: '1', SMTP_KULLANICI: 'k', SMTP_PAROLA: 'p', SMTP_GUVENLI: '0'});
    const t2 = await ist2('talep', {});
    ok('S18 E-posta gönderilemezse 502 “gönderilemedi”; başarı denmez', t2.d === 502 && t2.j.kod === 'gonderilemedi', t2.j);
    sv2.kill();
  }
  const g = S.filter((x) => x.ok).length; console.log(`\nToplam: ${g}/${S.length} kontrol geçti`); if (g !== S.length) process.exitCode = 1;
})().catch((e) => { console.error(e); process.exit(1); });
