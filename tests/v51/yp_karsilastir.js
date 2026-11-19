// Yıllık plan Excel okuyucusunu (tools/v51/v510_yp.js) depodaki 9 Excel dosyasında çalıştırır ve sonucu uygulamaya gömülü
// yıllık plan verisiyle (seed-yp, V35'ten beri) karşılaştırır. Kullanım: node tests/v51/yp_karsilastir.js [html]
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
require(path.join(ROOT, 'tools/v51/v510_yp.js'));
const Y = globalThis.V51.YP;
const html = fs.readFileSync(process.argv[2] || path.join(ROOT, 'surumler/din-kulturu-platformu-v50.0.html'), 'utf8');
const blok = (id) => JSON.parse(new RegExp('<script type="application/json" id="' + id + '">([\\s\\S]*?)</script>').exec(html)[1]);
const YP = blok('seed-yp').plans, CUR = blok('seed-curriculum');
const bul = (g, py, kod) => { const o = CUR.outcomes.find((x) => x.code === kod && x.grade === g && x.programYear === py); return o ? o.id : null; };
const nz = (s) => String(s || '').replace(/\s+/g, ' ').trim();
(async () => {
  const dir = path.join(ROOT, 'kaynaklar/yillik-plan-2026-2027'); const sonuc = []; let tamam = true;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.xlsx')).sort()) {
    const buf = fs.readFileSync(path.join(dir, f));
    const T = await Y.oku(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    const R = Y.donustur(T, {dosya: f, bul});
    if (R.hata && R.hata.length) { tamam = false; sonuc.push({f, hata: R.hata}); continue; }
    const ck = R.g + '|' + R.py, S = YP[ck];
    const d = {f, ck, sy: R.sy, hafta: R.plan.weeks.length, tatil: R.plan.hols.length, uyari: R.uyari, yapisal: [], metin: []};
    if (!S) { d.yapisal.push('gömülü plan yok'); tamam = false; sonuc.push(d); continue; }
    if (S.sy !== R.sy) d.yapisal.push('eğitim yılı ' + S.sy + ' ≠ ' + R.sy);
    if (JSON.stringify(S.hols) !== JSON.stringify(R.plan.hols)) d.yapisal.push('tatiller farklı: ' + JSON.stringify(R.plan.hols));
    if (S.weeks.length !== R.plan.weeks.length) d.yapisal.push('hafta sayısı ' + S.weeks.length + ' ≠ ' + R.plan.weeks.length);
    S.weeks.forEach((a, i) => { const b = R.plan.weeks[i] || {};
      ['no', 'start', 'end', 'saat', 'ozel'].forEach((k) => { if (a[k] !== b[k]) d.yapisal.push(`${a.no}. hafta ${k}: ${JSON.stringify(a[k])} ≠ ${JSON.stringify(b[k])}`); });
      if (JSON.stringify(a.oids) !== JSON.stringify(b.oids)) d.yapisal.push(`${a.no}. hafta kazanım: ${a.oids} ≠ ${b.oids}`);
      ['unite', 'konu', 'ac'].forEach((k) => { if (nz(a[k]) !== nz(b[k])) d.metin.push(`${a.no}. hafta ${k}: «${nz(a[k]).slice(0, 70)}» ≠ «${nz(b[k]).slice(0, 70)}»`); });
      (a.kt || []).forEach((t, j) => { if (nz(t) !== nz((b.kt || [])[j])) d.metin.push(`${a.no}. hafta kazanım metni: «${nz(t).slice(0, 60)}» ≠ «${nz((b.kt || [])[j]).slice(0, 60)}»`); });
    });
    if (nz(S.title) !== nz(R.plan.title)) d.metin.push('başlık: ' + S.title + ' ≠ ' + R.plan.title);
    if (nz(S.star) !== nz(R.plan.star)) d.metin.push('yıldızlı not farklı');
    if (d.yapisal.length) tamam = false;
    sonuc.push(d);
  }
  sonuc.forEach((d) => { console.log(`\n== ${d.f} → ${d.ck || ''} ${d.sy || ''} · ${d.hafta || 0} hafta, ${d.tatil || 0} tatil`); (d.hata || []).forEach((x) => console.log('  HATA', x)); (d.uyari || []).forEach((x) => console.log('  uyarı', x)); (d.yapisal || []).slice(0, 12).forEach((x) => console.log('  YAPISAL', x)); (d.metin || []).slice(0, 8).forEach((x) => console.log('  metin', x)); if (d.metin && d.metin.length > 8) console.log('  … metin farkı', d.metin.length); });
  console.log('\nYAPISAL UYUM (hafta no, tarih, ders saati, özel hafta, kazanım kimlikleri, tatiller):', tamam ? 'TAMAM — 9 dosyanın hepsi gömülü planla aynı' : 'FARK VAR');
  fs.writeFileSync(path.join(__dirname, 'yp_karsilastir_sonuc.json'), JSON.stringify(sonuc, null, 1));
  process.exit(tamam ? 0 : 1);
})();
