/* ===================== V51.0: yıllık plan yükleme (editör) ve otomatik haftalık dağılım =====================
   Birincil kaynak yıllık plan Excel dosyalarıdır (CLAUDE.md kural 4). Uygulama kendi dağılımını HESAPLAMAZ:
   haftalar, tarihler, ders saatleri, üniteler, konular ve kazanımlar dosyadan aynen okunur; yalnız kazanım kodları
   uygulamadaki kazanım kimlikleriyle eşlenir (2026: “DKAB.5.1.1.” → DKAB.5.1.1; 2018: ünite no + kazanım no →
   “4.1.1 (2018)”). 2018 ve 2026 (TYMM) programları ayrı tutulur: dosyanın programı başlıktan/sütunlardan bulunur ve
   kazanımlar yalnız o sınıf + programın kayıtlarında aranır.
   Okuyucu: .xlsx bir ZIP arşividir; tarayıcıdaki DecompressionStream('deflate-raw') ile açılır, XML düz metin olarak
   ayrıştırılır (ek kütüphane yok). Birleştirilmiş hücreler sol üst hücrenin değerini alır (Excel'de görünen budur).
   Kayıt: localStorage dk-yp51 = {v:1, plans:{"<sınıf>|<program>": plan}, gecmis:[...]} — yalnız editör yazar.
   Gömülü planlar (seed-yp) değişmez; editörün yüklediği plan aynı sınıf/program için onların yerine kullanılır,
   “Gömülü plana dön” ile geri alınır.
   Öğretmen tarafı: hiç düzenlenmemiş haftalık plan yeni plana kendiliğinden geçer; öğretmenin düzenlediği plan
   SESSİZCE DEĞİŞTİRİLMEZ — Haftalık ekranında açık bilgi + fark özeti + onayla yeniden kurma seçeneği gösterilir. */
(function () {
  const V51 = (typeof window !== 'undefined' ? (window.V51 = window.V51 || {}) : (globalThis.V51 = globalThis.V51 || {}));
  const Y = V51.YP = V51.YP || {};
  Y.KEY = 'dk-yp51';

  /* ---------- 1. ZIP (yalnız okuma) ---------- */
  Y.unzip = async function (buf) {
    const u8 = new Uint8Array(buf), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    let e = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
    if (e < 0) throw new Error('Dosya bir Excel (.xlsx) arşivi değil.');
    const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true);
    const F = {}, td = new TextDecoder('utf-8');
    for (let i = 0; i < n; i++) {
      if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('Excel arşivinin içindekiler okunamadı.');
      const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
      F[td.decode(u8.subarray(p + 46, p + 46 + nl))] = {method, csize, lho};
      p += 46 + nl + xl + cl;
    }
    const oku = async (ad) => {
      const f = F[ad]; if (!f) return null;
      const s = f.lho + 30 + dv.getUint16(f.lho + 26, true) + dv.getUint16(f.lho + 28, true), d = u8.subarray(s, s + f.csize);
      if (f.method === 0) return td.decode(d);
      if (f.method !== 8) throw new Error('Desteklenmeyen sıkıştırma yöntemi.');
      if (typeof DecompressionStream === 'undefined') throw new Error('Bu tarayıcı Excel dosyasını açamıyor (DecompressionStream yok).');
      const st = new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return td.decode(new Uint8Array(await new Response(st).arrayBuffer()));
    };
    return {adlar: Object.keys(F), oku};
  };

  /* ---------- 2. XLSX → hücre tablosu ---------- */
  const ENT = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"};
  const cozum = (s) => String(s).replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (m, k) => k[0] === '#' ? String.fromCodePoint(k[1] === 'x' || k[1] === 'X' ? parseInt(k.slice(2), 16) : +k.slice(1)) : ENT[k.toLowerCase()]);
  const metin = (xml) => { let t = ''; xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, '').replace(/<t\b[^>]*?(?:\/>|>([\s\S]*?)<\/t>)/g, (m, x) => { t += x ? cozum(x) : ''; return m; }); return t; };
  const sutun = (ref) => { const m = /^([A-Z]+)(\d+)$/.exec(ref); let c = 0; for (const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64; return [+m[2], c]; };
  Y.oku = async function (buf) {
    const z = await Y.unzip(buf);
    const ss = [], ssx = await z.oku('xl/sharedStrings.xml');
    if (ssx) ssx.replace(/<si>([\s\S]*?)<\/si>|<si\/>/g, (m, x) => { ss.push(x ? metin(x) : ''); return m; });
    const wb = await z.oku('xl/workbook.xml'), rels = await z.oku('xl/_rels/workbook.xml.rels');
    if (!wb) throw new Error('Excel çalışma kitabı bulunamadı.');
    const ilk = /<sheet\b[^>]*?name="([^"]*)"[^>]*?r:id="([^"]+)"/.exec(wb) || /<sheet\b[^>]*?r:id="([^"]+)"[^>]*?name="([^"]*)"/.exec(wb);
    let hedef = 'xl/worksheets/sheet1.xml', ad = '';
    if (ilk && rels) {
      const rid = /name=/.test(ilk[0].split('r:id')[0]) ? ilk[2] : ilk[1]; ad = cozum(/name="([^"]*)"/.exec(ilk[0])[1]);
      const r = new RegExp('<Relationship\\b[^>]*?Id="' + rid + '"[^>]*?Target="([^"]+)"').exec(rels) || new RegExp('<Relationship\\b[^>]*?Target="([^"]+)"[^>]*?Id="' + rid + '"').exec(rels);
      if (r) hedef = r[1].startsWith('/') ? r[1].slice(1) : 'xl/' + r[1].replace(/^\.\//, '');
    }
    const sx = await z.oku(hedef); if (!sx) throw new Error('Excel sayfası okunamadı.');
    const H = new Map(); let maxR = 0, maxC = 0;
    sx.replace(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, (m, at, ic) => {
      const r = /\br="([A-Z]+\d+)"/.exec(at); if (!r || !ic) return m;
      const t = (/\bt="([^"]+)"/.exec(at) || [])[1] || '', v = /<v>([\s\S]*?)<\/v>/.exec(ic);
      let val = '';
      if (t === 's') val = v ? (ss[+v[1]] || '') : '';
      else if (t === 'inlineStr') val = metin((/<is>([\s\S]*?)<\/is>/.exec(ic) || [])[1] || '');
      else val = v ? cozum(v[1]) : '';
      if (val === '') return m;
      const [rr, cc] = sutun(r[1]); H.set(rr + ',' + cc, val); maxR = Math.max(maxR, rr); maxC = Math.max(maxC, cc); return m;
    });
    // birleşik hücreler: sol üst değer bütün alana
    (sx.match(/<mergeCell\b[^>]*?ref="([A-Z]+\d+):([A-Z]+\d+)"/g) || []).forEach((m) => {
      const [, a, b] = /ref="([A-Z]+\d+):([A-Z]+\d+)"/.exec(m), [r1, c1] = sutun(a), [r2, c2] = sutun(b), v = H.get(r1 + ',' + c1);
      if (v === undefined) return;
      for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) if (!H.has(r + ',' + c)) H.set(r + ',' + c, v);
    });
    return {ad, H, maxR, maxC, hucre: (r, c) => H.get(r + ',' + c) || ''};
  };

  /* ---------- 3. tablo → yıllık plan (seed-yp biçimi) ---------- */
  const AYLAR = {ocak: 1, şubat: 2, mart: 3, nisan: 4, mayıs: 5, haziran: 6, temmuz: 7, ağustos: 8, eylül: 9, ekim: 10, kasım: 11, aralık: 12};
  const kucuk = (s) => String(s).replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
  const tek = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const p2 = (n) => String(n).padStart(2, '0');
  const tarih = (y, m, d) => y + '-' + p2(m) + '-' + p2(d);
  const pazartesi = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 1; };
  // “14-18 Eylül”, “28 Eylül - 2 Ekim”, “25 Ocak - 5 Şubat 2027”
  Y.aralik = function (txt, y0) {
    const m = /(\d{1,2})\s*([A-Za-zÇĞİÖŞÜçğıöşü]+)?\s*[-–]\s*(\d{1,2})\s*([A-Za-zÇĞİÖŞÜçğıöşü]+)\s*(\d{4})?/.exec(txt || '');
    if (!m) return null;
    const a2 = AYLAR[kucuk(m[4])], a1 = m[2] ? AYLAR[kucuk(m[2])] : a2; if (!a1 || !a2) return null;
    const yil = (a) => (m[5] ? (+m[5] - (a > a2 ? 1 : 0)) : (a >= 8 ? y0 : y0 + 1));
    const y2 = m[5] ? +m[5] : (a2 >= 8 ? y0 : y0 + 1);
    return {start: tarih(m[5] ? yil(a1) : (a1 >= 8 ? y0 : y0 + 1), a1, +m[1]), end: tarih(y2, a2, +m[3])};
  };
  const BAS = [['hafta', /^HAFTA$/], ['saat', /^DERS\s*SAAT/], ['unite', /^ÜNİTE$/], ['konu', /^KONU/], ['kaz', /ÖĞRENME\s*ÇIKTI|^KAZANIM$/], ['ac', /SÜREÇ\s*BİLEŞEN|KAZANIM\s*AÇIKLAMA/]];
  const OZEL = /OKUL\s*TEMELL|SOSYAL\s*ETK/;
  /* bul(g, py, kod) → kazanım kimliği (tarayıcıda Store'dan; testte dışarıdan verilir) */
  Y.donustur = function (T, o) {
    o = o || {};
    const hata = [], uyari = [], dosya = o.dosya || '';
    // başlık ve başlık satırı
    let baslik = '', bas = 0, K = {};
    for (let r = 1; r <= Math.min(T.maxR, 12) && !bas; r++) {
      const sat = []; for (let c = 1; c <= T.maxC; c++) sat.push(tek(T.hucre(r, c)).toLocaleUpperCase('tr-TR'));
      if (!baslik) { const b = sat.find((x) => /SINIF/.test(x) && /PLAN/.test(x)); if (b) baslik = tek(T.hucre(r, sat.indexOf(b) + 1)); }
      if (sat.some((x) => x === 'HAFTA')) { bas = r; BAS.forEach(([k, re]) => { const i = sat.findIndex((x) => re.test(x)); if (i >= 0) K[k] = i + 1; }); }
    }
    if (!bas) return {hata: ['Başlık satırı (AY / HAFTA / DERS SAATİ …) bulunamadı. Dosya bir DKAB yıllık plan şablonu gibi görünmüyor.'], uyari};
    ['hafta', 'saat', 'unite', 'kaz'].forEach((k) => { if (!K[k]) hata.push('Sütun bulunamadı: ' + {hafta: 'HAFTA', saat: 'DERS SAATİ', unite: 'ÜNİTE', kaz: 'ÖĞRENME ÇIKTILARI / KAZANIM'}[k]); });
    const B = baslik.toLocaleUpperCase('tr-TR');
    const gm = /(\d{1,2})\s*\.\s*SINIF/.exec(B), g = gm ? +gm[1] : 0;
    if (!g || g < 4 || g > 12) hata.push('Sınıf düzeyi plan başlığından okunamadı.');
    const tymm = /MAARİF\s*MODEL/.test(B) || /ÖĞRENME\s*ÇIKTI/.test(T.hucre(bas, K.kaz || 0).toLocaleUpperCase('tr-TR'));
    const py = tymm ? '2026' : '2018';
    if (o.py && o.py !== py) hata.push(`Dosya ${py === '2026' ? '2026 (TYMM)' : '2018'} programına ait; seçilen program ${o.py}. Programlar karıştırılmaz.`);
    if (o.g && g && o.g !== g) hata.push(`Dosya ${g}. sınıfa ait; seçilen sınıf ${o.g}.`);
    if (hata.length) return {hata, uyari, g, py};
    // satırlar
    const ham = [];
    let yildiz = '';
    for (let r = bas + 1; r <= T.maxR; r++) {
      const hf = tek(T.hucre(r, K.hafta));
      for (let c = 1; c <= T.maxC && !yildiz; c++) { const sat = String(T.hucre(r, c)).split(/\n/).map(tek).find((x) => /^\*\s*\S/.test(x) && x.length > 30); if (sat) yildiz = sat; }
      const hm = /^(\d+)\s*\.\s*Hafta\s*:?\s*(.*)$/i.exec(hf);
      if (hm) { ham.push({r, no: +hm[1], tt: hm[2]}); continue; }
      if (/TAT[İI]L/i.test(hf)) { const [l, ...d] = hf.split(':'); ham.push({r, tatil: tek(l), tt: d.join(':')}); }
    }
    if (!ham.some((x) => x.no)) return {hata: ['Hafta satırı bulunamadı (ör. “1. Hafta: 14-18 Eylül”).'], uyari, g, py};
    // eğitim yılı: adaylar (dosya adı, başlık); 1. haftanın pazartesiye denk geldiği yıl seçilir
    const aday = []; [dosya, baslik].forEach((s) => { const m = /(\d{4})\s*-\s*(\d{4})/.exec(s || ''); if (m && +m[2] === +m[1] + 1 && !aday.includes(+m[1])) aday.push(+m[1]); });
    if (o.y0) aday.unshift(o.y0);
    const ilk = ham.find((x) => x.no);
    let y0 = aday.find((y) => { const a = Y.aralik(ilk.tt, y); return a && pazartesi(a.start); });
    if (!y0) { y0 = aday[0]; if (y0) uyari.push('Hafta tarihleri pazartesiye denk gelmiyor; eğitim yılı dosya adından/başlıktan alındı.'); }
    if (!y0) return {hata: ['Eğitim yılı dosya adından veya plan başlığından okunamadı.'], uyari, g, py};
    if (aday.length > 1 && aday[0] !== y0) uyari.push(`Plan başlığındaki yıl ile tarihler uyuşmuyor; tarihlerin uyduğu ${y0}-${y0 + 1} eğitim yılı kullanıldı.`);
    const sy = y0 + '-' + (y0 + 1);
    const weeks = [], hols = [], gorulen = new Set(), eslesmeyen = [];
    ham.forEach((x) => {
      const a = Y.aralik(x.tt, y0);
      if (x.tatil) { if (a) hols.push({label: x.tatil, start: a.start, end: a.end}); else uyari.push(`Tatil tarihi okunamadı: “${x.tatil}”.`); return; }
      if (!a) { hata.push(`${x.no}. haftanın tarihi okunamadı: “${x.tt}”.`); return; }
      if (gorulen.has(x.no)) { hata.push(`${x.no}. hafta iki kez yazılmış.`); return; } gorulen.add(x.no);
      if (!pazartesi(a.start)) uyari.push(`${x.no}. haftanın başlangıcı (${a.start}) pazartesi değil.`);
      const H = (k) => (K[k] ? T.hucre(x.r, K[k]) : '');
      const unite = tek(H('unite')), kazH = String(H('kaz') || ''), konu = tek(H('konu')), ac = String(H('ac') || '').trim();
      const w = {no: x.no, start: a.start, end: a.end, saat: tek(H('saat')), unite, konu, ozel: '', oids: [], kt: [], ac};
      const parca = [];
      if (py === '2026') {
        const re = /DKAB\s*\.\s*(\d+)\s*\.\s*(\d+)\s*\.\s*(\d+)\s*\.?/g; let m; const yer = [];
        while ((m = re.exec(kazH))) yer.push({i: m.index, son: re.lastIndex, kod: `DKAB.${m[1]}.${m[2]}.${m[3]}`, gg: +m[1]});
        yer.forEach((y, i) => parca.push({kod: y.kod, gg: y.gg, kt: tek(kazH.slice(y.son, i + 1 < yer.length ? yer[i + 1].i : undefined))}));
      } else {
        const un = /^(\d+)\s*[.\-–]/.exec(unite);
        String(kazH).split(/\n+/).map((s) => s.trim()).filter(Boolean).forEach((s) => { const m = /^(\d+)\s*\.\s*(.*)$/.exec(s); if (m && un) parca.push({kod: `${g}.${un[1]}.${m[1]} (2018)`, gg: g, kt: tek(m[2])}); else if (parca.length) parca[parca.length - 1].kt = tek(parca[parca.length - 1].kt + ' ' + s); });
      }
      if (!parca.length && OZEL.test(unite.toLocaleUpperCase('tr-TR'))) { w.ozel = unite; w.konu = unite; w.ac = unite; }
      parca.forEach((p) => {
        if (p.gg !== g) { hata.push(`${x.no}. haftada başka sınıfın kazanımı var: ${p.kod}.`); return; }
        const id = o.bul ? o.bul(g, py, p.kod) : null;
        if (!id) { eslesmeyen.push(`${x.no}. hafta: ${p.kod}`); return; }
        if (!w.oids.includes(id)) { w.oids.push(id); w.kt.push(p.kt); }
      });
      weeks.push(w);
    });
    if (eslesmeyen.length) uyari.push(`Uygulamada karşılığı bulunmayan ${eslesmeyen.length} kazanım kodu (bu haftalara o kazanım eklenmedi): ${eslesmeyen.slice(0, 6).join('; ')}${eslesmeyen.length > 6 ? ' …' : ''}`);
    weeks.sort((a, b) => a.no - b.no);
    const plan = {file: dosya, title: baslik, star: yildiz, sy, hols, weeks};
    return {plan, g, py, sy, hata, uyari, ozet: {hafta: weeks.length, kazanimli: weeks.filter((w) => w.oids.length).length, ozel: weeks.filter((w) => w.ozel).length, tatil: hols.length, kazanim: new Set(weeks.flatMap((w) => w.oids)).size, eslesmeyen: eslesmeyen.length}};
  };

  if (typeof window === 'undefined' || typeof OGRT === 'undefined' || !OGRT.W) return;   // Node testinde yalnız ayrıştırıcı

  /* ---------- 4. kayıt ve uygulama ---------- */
  const W = OGRT.W;
  Y.SEED = Object.assign({}, W.YP);   // gömülü planlar (değişmez)
  Y.bul = (g, py, kod) => { const o = Store.all('outcomes').find((x) => x.code === kod && x.grade === +g && x.programYear === py); return o ? o.id : null; };
  Y.oku51 = () => { try { const o = JSON.parse(localStorage.getItem(Y.KEY) || 'null'); if (o && o.v === 1 && o.plans && typeof o.plans === 'object') return o; } catch (e) {} return {v: 1, plans: {}, gecmis: []}; };
  Y.yaz51 = (o) => { try { localStorage.setItem(Y.KEY, JSON.stringify(o)); return true; } catch (e) { UI.toast('Kayıt yapılamadı: tarayıcı depolaması dolu ya da kapalı.'); return false; } };
  Y.uygula = function () { const o = Y.oku51(); Object.keys(W.YP).forEach((k) => { if (!Y.SEED[k]) delete W.YP[k]; }); Object.assign(W.YP, Y.SEED); Object.entries(o.plans).forEach(([k, p]) => { if (p && Array.isArray(p.weeks)) W.YP[k] = p; }); };
  Y.surum = (ck) => { const p = W.YP[ck]; return (p && p.surum) || 'gomulu'; };
  Y.uygula();

  // otomatik kurulumda planın sürümünü not et (öğretmen kaydına isteğe bağlı yeni alan; eski kayıtlar 'gomulu' sayılır)
  const gen0 = W.gen;
  W.gen = function (g, py, sy) { const r = gen0.apply(this, arguments); if (r) { const a = W.ar(g, py, sy); if (a) a.ypv = Y.surum(OGRT.ck(g, py)); } return r; };
  // yeni dağılımı (kaydetmeden) hesapla: W.gen ile aynı kural
  Y.yeniDagilim = function (g, py, sy) { const m = W.srcMap(g, py, sy); if (!m) return null; const M = {}; Object.entries(m).forEach(([n, x]) => { if (x.oids && x.oids.length) M[n] = x.oids.slice(); }); return M; };
  Y.fark = function (c, sy) {
    const yeni = Y.yeniDagilim(c.g, c.py, sy) || {}, eski = ((W.d.weeks[OGRT.ck(c.g, c.py)] || {})[sy]) || {};
    const ns = [...new Set([...Object.keys(yeni), ...Object.keys(eski)])].map(Number).sort((a, b) => a - b);
    return ns.filter((n) => JSON.stringify((eski[n] || []).slice().sort()) !== JSON.stringify((yeni[n] || []).slice().sort())).map((n) => ({n, eski: eski[n] || [], yeni: yeni[n] || []}));
  };
  // öğretmen planı ↔ yüklenen plan uyumu
  Y.durum = function (c, sy) {
    const a = W.ar(c.g, c.py, sy), v = Y.surum(OGRT.ck(c.g, c.py));
    if (!a || a.basis !== 'yillik-plan' || !W.src(c.g, c.py, sy)) return '';
    if ((a.ypv || 'gomulu') === v) return '';
    return a.edited ? (a.ypGor === v ? 'korundu' : 'cakisma') : 'guncelle';
  };
  const en0 = W.ensure;
  W.ensure = function (c, sy) {
    en0.apply(this, arguments);
    try {
      if (Y.durum(c, sy) === 'guncelle' && W.gen(c.g, c.py, sy)) { W.save(); Y._bilgi = `${c.g}. sınıf haftalık planı, editörün yüklediği yeni yıllık plana göre güncellendi (senin düzenlemen yoktu).`; }
    } catch (e) { console.warn('[V51] yıllık plan uyumu', e); }
  };
  Y.bildirimHTML = function (c, sy) {
    const d = Y.durum(c, sy), p = W.src(c.g, c.py, sy);
    let h = '';
    if (Y._bilgi) { h += `<p class="yp51-b ok" role="status">${esc(Y._bilgi)}</p>`; Y._bilgi = ''; }
    if (d === 'cakisma') {
      const F = Y.fark(c, sy);
      h += `<section class="yp51-c" role="alert"><h3>Yıllık plan güncellendi</h3><p>Editör ${c.g}. sınıf ${c.py === '2026' ? '2026 (TYMM)' : '2018'} yıllık planını ${p && p.yuklendi ? esc(new Date(p.yuklendi).toLocaleDateString('tr-TR')) + ' tarihinde ' : ''}yeniledi. <b>Senin haftalık düzenlemelerin korunuyor;</b> yeni plan kendiliğinden uygulanmadı.</p>
<p class="small">${F.length ? `${F.length} haftada senin yerleşimin yeni plandan farklı.` : 'Kazanım yerleşimin yeni planla aynı.'}</p>
<div class="ogw-acts"><button class="ogw-b p" onclick="OGRT.W.yp51Fark()">Farkları gör</button><button class="ogw-b" onclick="OGRT.W.yp51Koru()">Düzenlemelerimi koru</button></div></section>`;
    }
    return h;
  };
  W.yp51Koru = function () { const {c, s} = W.ctx(), a = W.ar(c.g, c.py, s.sy); if (a) { a.ypGor = Y.surum(OGRT.ck(c.g, c.py)); W.save(); } UI.toast('Düzenlemelerin korunuyor. Yeni planı istediğin zaman “Yıllık plana göre yeniden kur” ile uygulayabilirsin.'); W.render(true); };
  W.yp51Fark = function () {
    const {c, s} = W.ctx(), F = Y.fark(c, s.sy), kod = (L) => L.length ? L.map((id) => { const o = Store.get('outcomes', id); return o ? W.short(o.code) : id; }).join(', ') : '—';
    UI.sheet({title: 'Yeni yıllık plan ile farklar', body: () => `<p class="small"><b>${c.g}. sınıf · ${c.py} programı · ${esc(s.sy)}</b></p>${F.length ? `<div class="og-tw"><table class="og-t yp51-t"><thead><tr><th>Hafta</th><th>Senin planın</th><th>Yeni yıllık plan</th></tr></thead><tbody>${F.map((x) => `<tr><td>${W.no(c, s.sy, x.n) || 'tatil'}.</td><td>${esc(kod(x.eski))}</td><td>${esc(kod(x.yeni))}</td></tr>`).join('')}</tbody></table></div>` : '<p>Kazanım yerleşimi aynı.</p>'}
<p class="og-warn small"><b>Yeni plana göre yeniden kurarsan</b> bu sınıfın haftalık kazanım yerleşimi yeni plana göre yeniden oluşturulur; senin taşıma/ekleme/çıkarma düzenlemelerin bu yıl için değişir. Haftalık notların, ders planların ve kazanım durum kayıtların <b>silinmez</b>.</p>`,
      footer: () => `<button class="p" onclick="OGRT.W.regen()">Yeni plana göre yeniden kur</button><button onclick="UI.close();OGRT.W.yp51Koru()">Düzenlemelerimi koru</button><button onclick="UI.close()">Kapat</button>`});
  };

  /* ---------- 5. editör: yükleme ekranı (editör oturumu gerekir) ---------- */
  Y.bekleyen = null;
  const PYAD = (py) => (py === '2026' ? '2026 programı (TYMM)' : '2018 programı');
  Y.html = function () {
    const o = Y.oku51(), sat = Object.keys(Object.assign({}, Y.SEED, o.plans)).sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b));
    return `${V38.edHead('Yıllık planlar', 'Excel yıllık planı yükle; öğretmenlerin haftalık planı sınıf ve programa göre kendiliğinden oluşur', "V38.edGo({k:'',cid:'',mode:''})")}
<section class="ed38-info yp51"><h2>Yeni yıllık plan yükle</h2>
<p class="small">MEB çerçeve yıllık plan şablonundaki <b>.xlsx</b> dosyasını seç. Sınıf, program (2018 / 2026 TYMM), eğitim yılı, haftalar, tatiller ve kazanımlar dosyadan okunur; uygulama kendi dağılımını hesaplamaz. Önce önizleme gösterilir, onaylamadan hiçbir şey kaydedilmez.</p>
<label class="yp51-f"><span>Excel dosyası (.xlsx)</span><input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onchange="V51.YP.sec(this)"></label>
<div id="yp51-on" aria-live="polite"></div></section>
<section class="ed38-info"><h2>Sınıf ve programlara göre planlar</h2><div class="og-tw"><table class="og-t yp51-t"><thead><tr><th>Sınıf · program</th><th>Kullanılan plan</th><th>Hafta</th><th></th></tr></thead><tbody>
${sat.map((k) => { const [g, py] = k.split('|'), p = W.YP[k], y = o.plans[k]; return `<tr><td>${g}. sınıf · ${PYAD(py)}</td><td>${y ? `<b>Editör yüklemesi</b><br><small>${esc(y.file)} · ${esc(new Date(y.yuklendi).toLocaleString('tr-TR'))}</small>` : `Uygulamaya gömülü plan<br><small>${esc(p ? p.file : '')}</small>`}</td><td>${p ? p.weeks.length : 0}</td><td>${y && Y.SEED[k] ? `<button class="v38-b" onclick="V51.YP.gomuluyeDon('${k}')">Gömülü plana dön</button>` : y ? `<button class="v38-b" onclick="V51.YP.gomuluyeDon('${k}')">Kaldır</button>` : ''}</td></tr>`; }).join('')}
</tbody></table></div><p class="small mut">Planı olmayan sınıf/program için haftalık dağılım üretilmez; öğretmen kazanımları kendisi ekler.</p></section>
${o.gecmis.length ? `<section class="ed38-info"><h2>Yükleme geçmişi</h2><ul class="v38-ul">${o.gecmis.slice(0, 30).map((x) => `<li><b>${esc(x.ck.replace('|', '. sınıf · '))}</b> · ${esc(x.islem)} · ${esc(x.file || '')} <small>${esc(new Date(x.t).toLocaleString('tr-TR'))}</small></li>`).join('')}</ul></section>` : ''}`;
  };
  Y.sec = async function (inp) {
    const f = inp.files && inp.files[0], on = document.getElementById('yp51-on'); if (!f || !on) return;
    if (!V38.edOk()) { UI.toast('Bu işlem editör yetkisi gerektirir.'); return; }
    on.innerHTML = '<p class="small">Dosya okunuyor…</p>';
    try {
      if (f.size > 8 * 1024 * 1024) throw new Error('Dosya çok büyük (en fazla 8 MB).');
      const T = await Y.oku(await f.arrayBuffer()), R = Y.donustur(T, {dosya: f.name, bul: Y.bul});
      if (R.hata && R.hata.length) { Y.bekleyen = null; on.innerHTML = `<div class="og-warn"><b>Plan yüklenemedi.</b><ul>${R.hata.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`; return; }
      const ck = OGRT.ck(R.g, R.py);
      if (!OGRT.units(R.g, R.py).length) { on.innerHTML = `<div class="og-warn"><b>Plan yüklenemedi.</b> ${R.g}. sınıf ${PYAD(R.py)} için uygulamada müfredat kaydı yok.</div>`; return; }
      Y.bekleyen = {ck, plan: R.plan};
      const es = W.YP[ck], ayni = es && JSON.stringify(es.weeks.map((w) => [w.no, w.start, w.oids])) === JSON.stringify(R.plan.weeks.map((w) => [w.no, w.start, w.oids]));
      on.innerHTML = `<div class="yp51-on"><h3>Önizleme: ${R.g}. sınıf · ${PYAD(R.py)} · ${esc(R.sy)}</h3><p class="small">${esc(R.plan.title)}</p>
<ul class="small"><li>${R.ozet.hafta} hafta (${R.ozet.kazanimli} haftada kazanım, ${R.ozet.ozel} özel hafta), ${R.ozet.tatil} tatil</li><li>${R.ozet.kazanim} farklı kazanım eşlendi${R.ozet.eslesmeyen ? `, <b>${R.ozet.eslesmeyen} kod eşleşmedi</b>` : ''}</li>
${es ? `<li>Şu an kullanılan plan: ${esc(es.file)}${ayni ? ' — <b>haftalık kazanım dağılımı aynı</b>' : ' — dağılım farklı'}</li>` : '<li>Bu sınıf/program için şu an plan yok.</li>'}</ul>
${R.uyari.length ? `<div class="og-warn small"><b>Uyarılar</b><ul>${R.uyari.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
<div class="og-tw"><table class="og-t yp51-t"><thead><tr><th>Hafta</th><th>Tarih</th><th>Kazanım</th></tr></thead><tbody>${R.plan.weeks.slice(0, 40).map((w) => `<tr><td>${w.no}.</td><td>${esc(w.start.slice(5).split('-').reverse().join('.'))}–${esc(w.end.slice(5).split('-').reverse().join('.'))}</td><td>${w.oids.length ? esc(w.oids.map((id) => { const o = Store.get('outcomes', id); return o ? W.short(o.code) : id; }).join(', ')) : esc(w.ozel || '—')}</td></tr>`).join('')}</tbody></table></div>
<p class="small">Kaydedince: düzenlemesi olmayan öğretmen planları bu plana kendiliğinden geçer; düzenlenmiş planlar <b>değiştirilmez</b>, öğretmene bilgi ve onay seçeneği gösterilir. Diğer sınıfların planları değişmez.</p>
<div class="og-acts"><button class="p" onclick="V51.YP.kaydet()">Planı kaydet ve kullan</button><button onclick="V51.YP.bekleyen=null;document.getElementById('yp51-on').innerHTML=''">Vazgeç</button></div></div>`;
    } catch (e) { Y.bekleyen = null; on.innerHTML = `<div class="og-warn"><b>Dosya okunamadı.</b> ${esc(e.message || String(e))}</div>`; }
  };
  Y.kaydet = function () {
    if (!V38.edOk()) { UI.toast('Bu işlem editör yetkisi gerektirir.'); return; }
    const b = Y.bekleyen; if (!b) return;
    const o = Y.oku51(), t = new Date().toISOString();
    b.plan.yuklendi = t; b.plan.surum = 'yukleme-' + t; b.plan.kaynak = 'editor';
    o.plans[b.ck] = b.plan; o.gecmis.unshift({ck: b.ck, islem: 'Yüklendi', file: b.plan.file, t, surum: b.plan.surum}); o.gecmis.length = Math.min(o.gecmis.length, 100);
    if (!Y.yaz51(o)) return;
    Y.bekleyen = null; Y.uygula();
    try { V38.logT && V38.logT('Yıllık plan yüklendi', b.ck + ' · ' + b.plan.file); } catch (e) {}
    UI.toast('Yıllık plan kaydedildi. Öğretmen planları buna göre güncellenir.'); V38.edView();
  };
  Y.gomuluyeDon = function (ck) {
    if (!V38.edOk()) { UI.toast('Bu işlem editör yetkisi gerektirir.'); return; }
    V38.confirm({title: 'Editör yüklemesini kaldır', text: Y.SEED[ck] ? 'Bu sınıf/program yeniden uygulamaya gömülü yıllık planı kullanacak. Öğretmen düzenlemeleri yine sessizce değişmez.' : 'Bu sınıf/program için yıllık plan kalmayacak; yeni dağılım üretilmez, öğretmenin mevcut haftalık planı olduğu gibi kalır.', ok: 'Kaldır', onOk: () => {
      const o = Y.oku51(), p = o.plans[ck]; delete o.plans[ck]; o.gecmis.unshift({ck, islem: 'Kaldırıldı (gömülü plana dönüldü)', file: p ? p.file : '', t: new Date().toISOString()}); Y.yaz51(o); Y.uygula(); V38.edView();
    }});
  };
  window.addEventListener('storage', (e) => { if (e.key === Y.KEY) { Y.uygula(); if (view === 'ogretmen') OGRT.render(); } });
})();
