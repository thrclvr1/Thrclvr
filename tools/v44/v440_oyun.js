/* ===================== V44.0: ortak oyun motoru, Zamanın İzinde, Bilgi Laboratuvarı, hibrit oyun merkezi =====================
   - V44.Motor: her oyun initialize/start/pause/resume/restart/save/load/finish/destroy arayüzünü sağlar; V41 çekirdeğine
     (duraklatma menüsü, hata sınırı, tek kayıt anahtarı dk-oyun41, otomatik duraklama) bağlanır. Bir oyunun hatası yalnız o oyunu kapatır.
   - İçerik: yalnızca Store'daki, otomatik kaynak kontrolünden geçmiş (dogrulama) ve görünür (vis) oyun kayıtları. Kaynak yoksa bölüm
     kapalı kalır; soru üretilmez. Editör onayı henüz verilmemiş kayıtlar platformun önizleme kuralıyla (S.prev) ve açık etiketle gösterilir.
   - Kayıt: dk-oyun41 → oyunlar.zaman / oyunlar.lab → <bölüm> = {v:1, seviyeler:{kolay|orta|zor:{yildiz,puan,sure,t}}, yildiz:{…}, aktif, bitti, t}
   - Cevaplar Prog.rec ile kazanım ilerlemesine işlenir (Klasik oyunlar ve Kütüphane ile aynı). */
(function () {
  if (typeof V41 === 'undefined') return;
  const $id = (i) => document.getElementById(i);
  const kar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const SV = (p, s) => `<svg width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const IC = {yildiz: '<path d="M12 2.8l2.2 4.4 4.9.7-3.5 3.4.8 4.9L12 13.9l-4.4 2.3.8-4.9-3.5-3.4 4.9-.7z"/>', menu: '<path d="M8 5v14M16 5v14"/>', ipucu: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/>', ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', sag: '<path d="M9 6l6 6-6 6"/>', kilit: '<rect x="5" y="11" width="14" height="9" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', zaman: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>', lab: '<path d="M9 3h6M10 3v6L4.5 18.5A1.6 1.6 0 0 0 5.9 21h12.2a1.6 1.6 0 0 0 1.4-2.5L14 9V3"/><path d="M7 15h10"/>'};
  const sv = (k, s) => SV(IC[k] || '', s);
  const okKayit = (g) => !!(g && g.dogrulama && vis(g));
  const SEV = [['kolay', 'Kolay'], ['orta', 'Orta'], ['zor', 'Zor']];
  const yildizOf = (p) => (p >= 90 ? 3 : p >= 60 ? 2 : 1);
  const puanOf = (h, i) => Math.max(20, 100 - 10 * h - 15 * i);
  const bugun = () => new Date().toISOString().slice(0, 10);

  /* ---------- 1. Ortak oyun motoru ---------- */
  V44.Motor = {
    ARAYUZ: ['initialize', 'start', 'pause', 'resume', 'restart', 'save', 'load', 'finish', 'destroy'],
    // Yeni oyun: arayüzü V41 yaşam döngüsüne bağlar
    kaydol(t) {
      const O = Object.assign({}, t, {
        durum: 'hazir',
        baslat(kok, bolum, o) { t.initialize(kok, bolum, o || {}); if (t.load) t.load(!!(o && o.devam)); t.start(); },
        duraklat(s) { t.pause && t.pause(s); }, surdur() { t.resume && t.resume(); }, yenidenBaslat() { t.restart && t.restart(); },
        bitir() { t.finish && t.finish(); }, temizle() { try { t.save && t.save(); } catch (e) {} t.destroy && t.destroy(); }
      });
      V41.kaydol(O); return O;
    },
    // Eski V41 oyunu (Kayıp Bilgeliğin Kütüphanesi): aynı adlarla çağrılabilir; oyunun kendisi değişmez
    uyarla(O, kategori) {
      if (!O) return; O.kategori = kategori;
      const e = {initialize: (k, b, o) => O.baslat(k, b, o || {}), start: () => {}, pause: (s) => O.duraklat && O.duraklat(s), resume: () => O.surdur && O.surdur(), restart: () => O.yenidenBaslat && O.yenidenBaslat(), save: () => {}, load: () => {}, finish: () => O.bitir && O.bitir(), destroy: () => O.temizle && O.temizle()};
      Object.keys(e).forEach((k) => { if (!O[k]) O[k] = e[k]; });
    }
  };
  try { V44.Motor.uyarla(V41.oyunlar.kutuphane, 'hibrit'); } catch (e) {}

  /* ---------- 2. Görevler (dokunmatik; klavye ile de kullanılabilir düğmeler) ---------- */
  // Her görev: kok içine çizer, cevaplarda Prog.rec yapar, bitince sonuc({hata, ipucu}) çağırır. ipucuIste() desteklerse İpucu düğmesi çalışır.
  const G = {};
  G.sira = function (kok, d, sonuc, ctx) {
    const dogru = d.items.slice(), n = dogru.length, yer = Array(n).fill(null), kilit = Array(n).fill(false); let hata = 0, ipucu = 0;
    let havuz = kar(dogru.map((x, i) => i)); if (havuz.every((x, i) => x === i) && n > 1) havuz = havuz.reverse();
    const ciz = () => {
      kok.innerHTML = `<p class="g44-tal">${esc(d.talimat)}</p><ol class="g44-sira">${yer.map((v, i) => `<li><span class="g44-no">${i + 1}</span>${v === null ? '<span class="g44-bos">boş</span>' : `<button type="button" class="g44-kart yer ${kilit[i] ? 'kilit' : ''} ${d.yanlis && d.yanlis.includes(i) ? 'yanlis' : ''}" ${kilit[i] ? 'disabled' : ''} data-y="${i}">${esc(dogru[v])}</button>`}</li>`).join('')}</ol>
<div class="g44-havuz" aria-label="Yerleştirilecek kartlar">${havuz.map((v) => `<button type="button" class="g44-kart" data-h="${v}">${esc(dogru[v])}</button>`).join('') || '<p class="g44-mut">Bütün kartlar yerleştirildi.</p>'}</div>
<div class="g44-ara"><button type="button" class="g44-b p" data-k="kontrol" ${yer.includes(null) ? 'disabled' : ''}>Kontrol et</button></div>`;
      kok.querySelectorAll('[data-h]').forEach((b) => b.onclick = () => { const v = +b.dataset.h, i = yer.indexOf(null); if (i < 0) return; yer[i] = v; havuz = havuz.filter((x) => x !== v); d.yanlis = null; ciz(); });
      kok.querySelectorAll('[data-y]').forEach((b) => b.onclick = () => { const i = +b.dataset.y; if (kilit[i]) return; havuz.push(yer[i]); yer[i] = null; d.yanlis = null; ciz(); });
      const k = kok.querySelector('[data-k=kontrol]'); if (k) k.onclick = () => {
        const Y = yer.map((v, i) => (v === i ? -1 : i)).filter((i) => i >= 0);
        try { Prog.rec(ctx.kazanim, !Y.length); } catch (e) {}
        if (!Y.length) { kilit.fill(true); ciz(); ctx.bildir('iyi', 'Sıra doğru.'); return setTimeout(() => sonuc({hata, ipucu}), 700); }
        hata++; Y.forEach((i) => { if (d.zor) return; havuz.push(yer[i]); yer[i] = null; }); yer.forEach((v, i) => { if (v === i) kilit[i] = true; });
        if (d.zor) { d.yanlis = null; ctx.bildir('uyari', `${Y.length} kart yanlış yerde. Hangileri olduğunu bulmaya çalış.`); } else ctx.bildir('uyari', `${Y.length} kart yanlış yerdeydi; havuza geri döndü. Doğru olanlar kilitlendi.`);
        ciz();
      };
    };
    ciz();
    return {ipucuIste() { const i = yer.findIndex((v, j) => v !== j); if (i < 0) return false; const v = i; if (yer[i] !== null) havuz.push(yer[i]); const eski = yer.indexOf(v); if (eski >= 0) yer[eski] = null; havuz = havuz.filter((x) => x !== v); yer[i] = v; kilit[i] = true; ipucu++; ciz(); ctx.bildir('bilgi', `${i + 1}. sıradaki kart yerleştirildi.`); return true; }};
  };
  G.esles = function (kok, d, sonuc, ctx) {
    const P = d.pairs, sag = kar(P.map((x, i) => i)), bitti = new Set(); let sec = null, hata = 0, ipucu = 0;
    const ciz = () => {
      kok.innerHTML = `<p class="g44-tal">${esc(d.talimat)}</p><div class="g44-es"><div class="g44-kol">${P.map((p, i) => `<button type="button" class="g44-kart ${bitti.has(i) ? 'kilit' : ''} ${sec === i ? 'sec' : ''}" data-l="${i}" ${bitti.has(i) ? 'disabled' : ''} aria-pressed="${sec === i}">${esc(p[0])}</button>`).join('')}</div>
<div class="g44-kol">${sag.map((i) => `<button type="button" class="g44-kart ${bitti.has(i) ? 'kilit' : ''}" data-r="${i}" ${bitti.has(i) ? 'disabled' : ''}>${esc(P[i][1])}</button>`).join('')}</div></div><p class="g44-mut small">Önce soldan bir kart, sonra sağdan karşılığını seç.</p>`;
      kok.querySelectorAll('[data-l]').forEach((b) => b.onclick = () => { sec = +b.dataset.l; ciz(); });
      kok.querySelectorAll('[data-r]').forEach((b) => b.onclick = () => {
        if (sec === null) { ctx.bildir('bilgi', 'Önce soldaki sütundan bir kart seç.'); return; }
        const r = +b.dataset.r, dogru = r === sec; try { Prog.rec(ctx.kazanim, dogru); } catch (e) {}
        if (dogru) { bitti.add(sec); sec = null; ciz(); if (bitti.size === P.length) { ctx.bildir('iyi', 'Bütün eşler doğru.'); setTimeout(() => sonuc({hata, ipucu}), 600); } }
        else { hata++; ctx.bildir('uyari', `“${P[sec][0]}” ile “${P[r][1]}” eş değil.`); sec = null; ciz(); }
      });
    };
    ciz();
    return {ipucuIste() { const i = P.findIndex((p, j) => !bitti.has(j)); if (i < 0) return false; bitti.add(i); ipucu++; ciz(); ctx.bildir('bilgi', `Eş: “${P[i][0]}” → “${P[i][1]}”.`); if (bitti.size === P.length) setTimeout(() => sonuc({hata, ipucu}), 600); return true; }};
  };
  G.grup = function (kok, d, sonuc, ctx) {
    const I = kar(d.items), yer = {}; let sec = null, hata = 0, ipucu = 0;
    const ciz = () => {
      const kalan = I.filter((x, i) => !(i in yer));
      kok.innerHTML = `<p class="g44-tal">${esc(d.talimat)}</p><div class="g44-havuz">${I.map((x, i) => i in yer ? '' : `<button type="button" class="g44-kart ${sec === i ? 'sec' : ''}" data-i="${i}" aria-pressed="${sec === i}">${esc(x.text)}</button>`).join('') || '<p class="g44-mut">Bütün ifadeler yerleştirildi.</p>'}</div>
<div class="g44-kutular">${d.categories.map((c, k) => `<button type="button" class="g44-kutu" data-c="${k}"><b>${esc(c)}</b>${I.map((x, i) => yer[i] === c ? `<span class="g44-etk">${esc(x.text)}</span>` : '').join('')}</button>`).join('')}</div>`;
      kok.querySelectorAll('[data-i]').forEach((b) => b.onclick = () => { sec = +b.dataset.i; ciz(); });
      kok.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => {
        if (sec === null) { ctx.bildir('bilgi', 'Önce bir ifade seç, sonra grubuna dokun.'); return; }
        const c = d.categories[+b.dataset.c], dogru = I[sec].cat === c; try { Prog.rec(ctx.kazanim, dogru); } catch (e) {}
        if (dogru) { yer[sec] = c; sec = null; ciz(); if (Object.keys(yer).length === I.length) { ctx.bildir('iyi', 'Bütün ifadeler doğru grupta.'); setTimeout(() => sonuc({hata, ipucu}), 600); } }
        else { hata++; ctx.bildir('uyari', `Bu ifade “${c}” grubuna ait değil.`); sec = null; ciz(); }
      });
      void kalan;
    };
    ciz();
    return {ipucuIste() { const i = I.findIndex((x, j) => !(j in yer)); if (i < 0) return false; yer[i] = I[i].cat; ipucu++; ciz(); ctx.bildir('bilgi', `“${I[i].text}” → ${I[i].cat}`); if (Object.keys(yer).length === I.length) setTimeout(() => sonuc({hata, ipucu}), 600); return true; }};
  };
  // tek tek sorular (boşluk doldurma, hatalı kart, kim/nerede)
  const soruSirasi = function (kok, sorular, sonuc, ctx, cizSoru) {
    let i = 0, hata = 0, ipucu = 0, elenen = new Set(), deneme = 0;
    const sonraki = () => { i++; elenen = new Set(); deneme = 0; if (i >= sorular.length) return setTimeout(() => sonuc({hata, ipucu}), 500); ciz(); };
    const ciz = () => {
      const s = sorular[i];
      kok.innerHTML = `<p class="g44-tal">${esc(ctx.talimat)} <span class="g44-mut">(${i + 1} / ${sorular.length})</span></p>` + cizSoru(s, elenen, deneme);
      kok.querySelectorAll('[data-s]').forEach((b) => b.onclick = () => {
        const v = b.dataset.s, dogru = v === String(s.dogru); try { Prog.rec(ctx.kazanim, dogru); } catch (e) {}
        if (dogru) { ctx.bildir('iyi', s.aciklama ? 'Doğru. ' + s.aciklama : 'Doğru.'); kok.querySelectorAll('[data-s]').forEach((x) => { x.disabled = true; if (x.dataset.s === v) x.classList.add('dogru'); }); setTimeout(sonraki, 900); }
        else { hata++; deneme++; elenen.add(v); ctx.bildir('uyari', s.yanlisNot ? s.yanlisNot(v) : 'Bu seçenek değil; bir daha dene.'); ciz(); }
      });
    };
    ciz();
    return {ipucuIste() { const s = sorular[i]; if (!s) return false; if (s.ipucuAc && s.ipucuAc(deneme)) { deneme++; ipucu++; ciz(); return true; } const yan = s.secenek.filter((x) => String(x.v) !== String(s.dogru) && !elenen.has(String(x.v))); if (yan.length <= 1) return false; elenen.add(String(yan[0].v)); ipucu++; ciz(); ctx.bildir('bilgi', 'Bir yanlış seçenek elendi.'); return true; }};
  };
  G.bosluk = (kok, d, sonuc, ctx) => soruSirasi(kok, d.items.map((x) => ({metin: x.text, dogru: x.answer, secenek: kar(x.options).map((o) => ({v: o, t: o})), aciklama: x.full})), sonuc, ctx,
    (s, el) => `<p class="g44-cumle">${esc(s.metin).replace('_____', '<span class="g44-bosl">?</span>')}</p><div class="g44-sec">${s.secenek.map((o) => `<button type="button" class="g44-kart" data-s="${esc(o.v)}" ${el.has(String(o.v)) ? 'disabled' : ''}>${esc(o.t)}</button>`).join('')}</div>`);
  G.hata = (kok, d, sonuc, ctx) => soruSirasi(kok, d.rounds.map((r) => ({dogru: String(r.wrong), secenek: r.cards.map((c, i) => ({v: String(i), t: c})), aciklama: r.correct ? 'Doğrusu: ' + r.correct : ''})), sonuc, ctx,
    (s, el) => `<div class="g44-hk">${s.secenek.map((o) => `<button type="button" class="g44-kart hk" data-s="${o.v}" ${el.has(o.v) ? 'disabled' : ''}><b>${esc(o.t.q)}</b><span>${esc(o.t.a)}</span></button>`).join('')}</div>`);
  G.kim = (kok, d, sonuc, ctx) => soruSirasi(kok, d.items.map((x) => { const bas = d.ilkIpucu; return {ad: x.name, dogru: x.name, ipucu: x.hints, acik: bas, secenek: kar([x.name].concat(kar(d.havuz.filter((n) => n !== x.name)).slice(0, 3))).map((n) => ({v: n, t: n})), ipucuAc(dn) { if (this.acik + dn < this.ipucu.length) return true; return false; }}; }), sonuc, ctx,
    (s, el, dn) => `<ul class="g44-ip">${s.ipucu.slice(0, Math.min(s.ipucu.length, s.acik + dn)).map((h) => `<li>${esc(h)}</li>`).join('')}</ul><div class="g44-sec">${s.secenek.map((o) => `<button type="button" class="g44-kart" data-s="${esc(o.v)}" ${el.has(String(o.v)) ? 'disabled' : ''}>${esc(o.t)}</button>`).join('')}</div>`);

  /* ---------- 3. Ortak oyun iskeleti (bölüm seçimi, seviye, görev akışı, sonuç, kayıt) ---------- */
  function iskelet(T) {
    let KOK = null, B = null, S = null, gorevler = [], gecerli = null, t0 = 0, sure = 0, durdu = false;
    const kayit = (b) => V41.bolumKayit(T.id, b) || {v: 1, seviyeler: {}, yildiz: {}, aktif: null, bitti: false};
    const yaz = () => { if (!B || !S) return; V41.bolumYaz(T.id, B.id, S); };
    const acik = (s, sev) => sev === 'kolay' || !!(s.seviyeler[sev === 'orta' ? 'kolay' : 'orta']);
    const ekran = (ic) => { KOK.innerHTML = `<div class="g44-ekran" data-oyun="${T.id}">${ic}</div>`; };
    const ust = (baslik, alt) => `<header class="g44-ust"><button type="button" class="g44-ib" onclick="V41.duraklat('kullanici')" aria-label="Menü — oyunu duraklat">${sv('menu', 18)}<span>Menü</span></button><div class="g44-ub"><small>${esc(alt || T.ad)}</small><b>${esc(baslik)}</b></div><button type="button" class="g44-ib" onclick="go('poyun')" aria-label="Oyun merkezine dön">Merkez</button></header>`;
    const bolumListe = () => {
      const L = T.bolumler(), gr = [...new Set(L.map((b) => b.sinif))].sort((a, b) => a - b);
      ekran(`${ust('Bölüm seç', T.ad)}<div class="g44-ic"><p class="g44-mut">${esc(T.ozet)}</p>${gr.map((g) => `<h2 class="g44-h2">${g}. sınıf</h2><div class="g44-bl">${L.filter((b) => b.sinif === g).map((b) => { const k = kayit(b.id), y = Object.values(k.yildiz || {}).reduce((a, x) => a + x, 0);
        return `<button type="button" class="g44-bol" ${b.hazir ? '' : 'disabled'} onclick="go('poyna',{oyn:'${T.id}',obol:'${b.id}',odevam:0})"><span class="g44-bt"><b>${esc(b.ad)}</b><small>${esc(b.alt)}</small>${b.hazir ? '' : `<small class="g44-uy">${esc(b.neden)}</small>`}</span><span class="g44-y">${sv('yildiz', 14)} ${y}/9</span></button>`; }).join('')}</div>`).join('') || '<p>Bu oyun için kaynak kontrolünden geçmiş içerik bulunamadı. Kaynakta veri bulunmuyor.</p>'}</div>`);
    };
    const giris = () => {
      const ic = B.icerik, k = S;
      ekran(`${ust(B.ad, T.ad + ' · ' + B.sinif + '. sınıf')}<div class="g44-ic">
<p class="g44-ey">${esc(V39.pyName(B.program))}</p><h1 class="g44-h1">${esc(B.ad)}</h1><p>${esc(T.giris)}</p>
<div class="g44-not"><b>Kaynak:</b> ${ic.kaynaklar.map((x) => esc(x)).join(' · ')}<br><small>Otomatik kaynak kontrolünden geçti · insan editör onayı bekliyor (önizleme).</small></div>
<details class="g44-kz"><summary>Kazanımlar (${ic.kazanim.length})</summary><ul>${ic.kazanim.map((o) => `<li><code>${esc(o.code)}</code> ${esc(o.title)}</li>`).join('') || '<li>Kaynakta veri bulunmuyor.</li>'}</ul></details>
<h2 class="g44-h2">Seviye seç</h2><div class="g44-sev">${SEV.map(([s, n]) => { const r = k.seviyeler[s], a = acik(k, s); return `<button type="button" class="g44-sv ${a ? '' : 'kapali'}" ${a ? '' : 'disabled'} data-sev="${s}"><b>${n}</b><small>${a ? (r ? `<span class="g44-ys" aria-label="${r.yildiz} / 3 yıldız">${[1, 2, 3].map((k) => `<i class="${k <= r.yildiz ? 'on' : ''}">${sv('yildiz', 14)}</i>`).join('')}</span> ${r.puan} puan` : T.sevAcik[s]) : 'Önce ' + (s === 'orta' ? 'Kolay' : 'Orta') + ' seviyeyi bitir'}</small>${a ? '' : sv('kilit', 16)}</button>`; }).join('')}</div>
${k.aktif ? `<div class="g44-ara"><button type="button" class="g44-b p" data-devam="1">${sv('sag', 16)} Kaldığın yerden devam et (${esc(SEV.find((x) => x[0] === k.aktif.seviye)[1])}, görev ${k.aktif.adim + 1})</button></div>` : ''}
<div class="g44-ara"><button type="button" class="g44-b" onclick="go('poyna',{oyn:'${T.id}',obol:'',odevam:0})">Başka bölüm</button></div></div>`);
      KOK.querySelectorAll('[data-sev]').forEach((b) => b.onclick = () => basla(b.dataset.sev, null));
      const dv = KOK.querySelector('[data-devam]'); if (dv) dv.onclick = () => basla(k.aktif.seviye, k.aktif);
    };
    const basla = (sev, dev) => {
      gorevler = T.gorevler(B, sev);
      if (!gorevler.length) { ekran(`${ust(B.ad)}<div class="g44-ic"><p>Bu seviye için kaynak kontrolünden geçmiş görev yok. Kaynakta veri bulunmuyor.</p></div>`); return; }
      S.aktif = dev && dev.seviye === sev ? dev : {seviye: sev, adim: 0, sonuclar: [], sure: 0}; t0 = Date.now(); sure = S.aktif.sure || 0; yaz(); gorevAc();
    };
    const gorevAc = () => {
      const A = S.aktif, g = gorevler[A.adim];
      if (!g) return bitir();
      ekran(`${ust(g.ad, `${B.ad} · ${SEV.find((x) => x[0] === A.seviye)[1]}`)}<nav class="g44-yol" aria-label="Görev ilerlemesi">${gorevler.map((x, i) => `<i class="${i < A.adim ? 'ok' : i === A.adim ? 'on' : ''}" title="${esc(x.ad)}"></i>`).join('')}</nav>
<div class="g44-ic"><div class="g44-gb"><small>Görev ${A.adim + 1} / ${gorevler.length} · ${esc(g.tur)}</small><span class="g44-kay">Kaynak: ${esc(g.kaynak)}</span></div><div class="g44-alan"></div><div class="g44-bil" aria-live="polite"></div>
<div class="g44-ara"><button type="button" class="g44-b" data-ip="1">${sv('ipucu', 16)} İpucu</button></div></div>`);
      const alan = KOK.querySelector('.g44-alan'), bil = KOK.querySelector('.g44-bil');
      const ctx = {kazanim: g.kazanim || [], talimat: g.talimat, bildir(t, m) { bil.className = 'g44-bil ' + t; bil.textContent = m; }};
      gecerli = G[g.tip](alan, g.veri, (r) => { if (KOK && gecerli) gorevBitti(r); }, ctx);
      const ip = KOK.querySelector('[data-ip]'); if (ip) ip.onclick = () => { if (!gecerli || !gecerli.ipucuIste || !gecerli.ipucuIste()) ctx.bildir('bilgi', 'Bu görevde başka ipucu yok.'); };
    };
    const gorevBitti = (r) => { const A = S.aktif; if (!A) return; const p = puanOf(r.hata, r.ipucu); A.sonuclar[A.adim] = {puan: p, yildiz: yildizOf(p), hata: r.hata, ipucu: r.ipucu}; A.adim++; A.sure = sure + (Date.now() - t0); yaz(); gecerli = null; gorevAc(); };
    const bitir = () => {
      const A = S.aktif; sure += Date.now() - t0; const Ls = A.sonuclar.filter(Boolean), puan = Math.round(Ls.reduce((a, x) => a + x.puan, 0) / Math.max(1, Ls.length)), y = yildizOf(puan);
      const eski = S.seviyeler[A.seviye]; if (!eski || puan >= eski.puan) S.seviyeler[A.seviye] = {yildiz: y, puan, sure: Math.round(sure / 1000), t: new Date().toISOString()};
      S.yildiz = Object.fromEntries(Object.entries(S.seviyeler).map(([k, v]) => [k, v.yildiz])); S.bitti = !!S.seviyeler.zor; S.t = new Date().toISOString(); S.aktif = null; yaz();
      const sev = A.seviye, sonraki = sev === 'kolay' ? 'orta' : sev === 'orta' ? 'zor' : null;
      ekran(`${ust('Seviye tamamlandı', B.ad)}<div class="g44-ic g44-son"><div class="g44-yz" aria-label="${y} / 3 yıldız">${[1, 2, 3].map((i) => `<i class="${i <= y ? 'on' : ''}">${sv('yildiz', 34)}</i>`).join('')}</div>
<p class="g44-puan"><b>${puan}</b> puan · ${Math.round(sure / 1000)} sn · ${Ls.reduce((a, x) => a + x.hata, 0)} hata · ${Ls.reduce((a, x) => a + x.ipucu, 0)} ipucu</p>
<ol class="g44-sl">${gorevler.map((g, i) => { const x = A.sonuclar[i]; return `<li><span>${esc(g.ad)}</span><span class="g44-ys" aria-label="${x ? x.yildiz : 0} / 3 yıldız">${x ? [1, 2, 3].map((k) => `<i class="${k <= x.yildiz ? 'on' : ''}">${sv('yildiz', 16)}</i>`).join('') : '—'}</span></li>`; }).join('')}</ol>
<div class="g44-ara">${sonraki ? `<button type="button" class="g44-b p" data-sev="${sonraki}">${SEV.find((x) => x[0] === sonraki)[1]} seviyeye geç</button>` : ''}<button type="button" class="g44-b" data-sev="${sev}">Tekrar oyna</button><button type="button" class="g44-b" onclick="go('poyna',{oyn:'${T.id}',obol:'',odevam:0})">Başka bölüm</button><button type="button" class="g44-b" onclick="go('poyun')">Oyun merkezi</button></div></div>`);
      KOK.querySelectorAll('[data-sev]').forEach((b) => b.onclick = () => basla(b.dataset.sev, null));
    };
    return V44.Motor.kaydol({
      id: T.id, ad: T.ad, kategori: 'ogrenme', ozet: T.ozet, afis: T.afis, sira: T.sira,
      bolumler: () => T.bolumler().map((b) => Object.assign({odaSay: 3}, b)),
      initialize(kok, bolum, o) { KOK = kok; durdu = false; B = bolum ? T.bolumler().find((x) => x.id === bolum) : null; S = B ? kayit(B.id) : null; if (B && !B.hazir) B = null; },
      load(devam) { if (B) { S = kayit(B.id); S._devam = devam; } },
      start() { if (!B) return bolumListe(); const dv = S._devam && S.aktif; delete S._devam; if (dv) basla(S.aktif.seviye, S.aktif); else giris(); },
      pause() { if (durdu) return; durdu = true; if (S && S.aktif) { sure += Date.now() - t0; S.aktif.sure = sure; yaz(); } },
      resume() { if (!durdu) return; durdu = false; t0 = Date.now(); },
      restart() { if (!B) return bolumListe(); if (S) { S.aktif = null; yaz(); } giris(); },
      save() { if (S && S.aktif && !durdu) { S.aktif.sure = sure + (Date.now() - t0); } yaz(); },
      finish() { if (S && S.aktif) bitir(); },
      destroy() { KOK = null; gecerli = null; }
    });
  }

  /* ---------- 4. Zamanın İzinde (kronoloji ve kim/nerede) ---------- */
  // Tarihî sıra içeren olay kayıtları (konu başlığına göre). Usul/işlem sıraları (namaz, temizlik, sure/dua) Bilgi Laboratuvarı'na gider.
  const TARIH = /hicret|doğumu|çocukluk|mekke ve medine|yılları|hayat[ıi]/i;
  const tarihMi = (g) => { const t = g.topicId && Store.get('topics', g.topicId); return TARIH.test(String((t && t.title) || g.title || '').toLocaleLowerCase('tr-TR')); };
  const temiz = (s) => String(s).replace(/^\s*\d+\s*[–-]\s*/, '');
  const kimHavuzu = (B) => { const L = Store.all('games').filter((g) => okKayit(g) && g.gameType === 'benkimim' && g.grade === B.sinif && g.programYear === B.program); const it = []; L.forEach((g) => (g.items || []).forEach((x) => { if ((x.etype === 'kisi' || x.etype === 'yer') && x.hints && x.hints.length >= 2) it.push(Object.assign({kaynakId: g.id, kaynakAd: g.title}, x)); })); return it; };
  const ZAMAN = {
    id: 'zaman', ad: 'Zamanın İzinde', sira: 2, afis: 'background:linear-gradient(160deg,#2f4a5a,#1d2a33)',
    ozet: 'Tarihî olayları kitaptaki sırasına diz; ipuçlarından kişiyi ve yeri bul. Bölümler ders kitabındaki gerçek olay kayıtlarından kurulur.',
    giris: 'Olayları doğru sıraya yerleştir, sonra ipuçlarından olaydaki kişiyi ya da yeri bul. Yanlış yerleştirdiğin kartlar havuza döner; takılırsan İpucu iste.',
    sevAcik: {kolay: '4 olay · ipucu bol', orta: 'Bütün olaylar', zor: 'Bütün olaylar · yanlışlar gösterilmez'},
    bolumler() {
      return Store.all('games').filter((g) => okKayit(g) && (g.gameType === 'olay' || g.gameType === 'ordering') && tarihMi(g)).map((g) => {
        const t = g.topicId && Store.get('topics', g.topicId), B = {id: g.id, sinif: g.grade, program: g.programYear, ad: (t && t.title) || g.title.replace(/ · .*$/, ''), kaynak: g, hazir: (g.items || []).length >= 4};
        const kim = kimHavuzu(B), oc = (g.outcomeIds || []).map((o) => Store.get('outcomes', o)).filter(Boolean);
        B.alt = `${(g.items || []).length} olay${kim.length >= 4 ? ' · kim/nerede ' + kim.length : ''} · ${V39.pyName(g.programYear).replace(/ \(.*/, '')}`; B.neden = B.hazir ? '' : 'Kaynakta yeterli olay kaydı bulunmuyor.';
        B.icerik = {kazanim: oc, kaynaklar: [g.title].concat(kim.length >= 4 ? [...new Set(kim.map((x) => x.kaynakAd))] : [])};
        return B;
      }).sort((a, b) => a.sinif - b.sinif || a.ad.localeCompare(b.ad, 'tr'));
    },
    gorevler(B, sev) {
      const g = B.kaynak, items = (g.items || []).map(temiz), L = [];
      let seq = items; if (sev === 'kolay' && items.length > 4) { const s = Math.floor(Math.random() * (items.length - 3)); seq = items.slice(s, s + 4); }
      L.push({tip: 'sira', ad: 'Kronoloji', tur: 'Olayları sırala', kaynak: g.title, kazanim: g.outcomeIds || [], talimat: 'Kartlara dokunarak olayları kitaptaki sırasına diz; yanlış yerleştirdiğine dokunursan havuza döner.', veri: {items: seq, talimat: sev === 'kolay' ? 'Bu dört olay arka arkaya gelir. Önce olanı 1. sıraya koy.' : 'Olayları baştan sona doğru sıraya diz.', zor: sev === 'zor'}});
      const kim = kimHavuzu(B);
      if (kim.length >= 4) {
        const n = sev === 'kolay' ? 2 : sev === 'orta' ? 3 : 4, sec = kar(kim).slice(0, n);
        L.push({tip: 'kim', ad: 'Kim? Nerede?', tur: 'İpuçlarından kişi ya da yer', kaynak: [...new Set(sec.map((x) => x.kaynakAd))].join(', '), kazanim: [], talimat: 'İpuçlarını oku ve kişiyi ya da yeri seç.', veri: {items: sec, havuz: [...new Set(kim.map((x) => x.name))], ilkIpucu: sev === 'kolay' ? 3 : sev === 'orta' ? 2 : 1}});
      }
      return L;
    }
  };

  /* ---------- 5. Bilgi Laboratuvarı (sınıflandır, sırala, eşleştir, birleştir, doğru/yanlış) ---------- */
  const LAB_TUR = {grouping: 'grup', matching: 'esles', ordering: 'sira', olay: 'sira', eksik: 'bosluk', hata: 'hata'};
  const LAB_AD = {grup: ['Sınıflandır', 'İfadeleri gruplarına ayır'], esles: ['Eşleştir', 'Kavramları karşılıklarıyla eşleştir'], sira: ['Sırala', 'Adımları doğru sıraya koy'], bosluk: ['Parçaları birleştir', 'Cümledeki eksik kavramı tamamla'], hata: ['Doğru mu, yanlış mı?', 'Bilgisi yanlış olan kartı bul']};
  const LAB = {
    id: 'lab', ad: 'Bilgi Laboratuvarı', sira: 3, afis: 'background:linear-gradient(160deg,#36504a,#1c2b28)',
    ozet: 'Her ünite bir laboratuvar: sınıflandır, sırala, eşleştir, eksik parçayı tamamla, yanlış bilgiyi yakala. Kolay, Orta ve Zor seviyeler sırayla açılır.',
    giris: 'Laboratuvardaki istasyonları sırayla tamamla. Her istasyon ünitedeki gerçek, kaynak kontrolünden geçmiş bir etkinlikten kurulur.',
    sevAcik: {kolay: '3 kısa istasyon', orta: '4 istasyon', zor: 'Bütün istasyonlar, tam setler'},
    _bol: null,
    bolumler() {
      if (this._bol) return this._bol;
      const U = {};
      Store.all('games').filter((g) => okKayit(g) && LAB_TUR[g.gameType] && g.unitId && !(g.gameType === 'olay' && tarihMi(g))).forEach((g) => {
        const tip = LAB_TUR[g.gameType], ok = tip === 'grup' ? (g.categories && (g.items || []).length >= 4) : tip === 'esles' ? (g.pairs || []).length >= 3 : tip === 'sira' ? (g.items || []).length >= 3 : tip === 'bosluk' ? (g.items || []).length >= 2 : tip === 'hata' ? (g.rounds || []).length >= 1 : false;
        if (!ok) return; (U[g.unitId] = U[g.unitId] || []).push(g);
      });
      return this._bol = Object.entries(U).map(([uid, L]) => {
        const u = Store.get('units', uid), tipler = [...new Set(L.map((g) => LAB_TUR[g.gameType]))], oc = [...new Set(L.flatMap((g) => g.outcomeIds || []))].map((o) => Store.get('outcomes', o)).filter(Boolean);
        return {id: 'U-' + uid, sinif: L[0].grade, program: L[0].programYear, ad: u ? u.title : uid, alt: `${tipler.length} istasyon türü · ${L.length} etkinlik · ${V39.pyName(L[0].programYear).replace(/ \(.*/, '')}`, hazir: tipler.length >= 2 && L.length >= 3, neden: 'Bu ünitede en az iki farklı türde kaynak kontrolünden geçmiş etkinlik bulunmuyor.', oyunlar: L, icerik: {kazanim: oc, kaynaklar: [...new Set(L.map((g) => g.title))].slice(0, 6).concat(L.length > 6 ? ['… +' + (L.length - 6)] : [])}};
      }).filter((b) => b.ad).sort((a, b) => a.sinif - b.sinif || String(a.program).localeCompare(String(b.program)) || a.ad.localeCompare(b.ad, 'tr'));
    },
    gorevler(B, sev) {
      const sinir = {kolay: {n: 3, grup: 4, esles: 4, sira: 4, bosluk: 2, hata: 1}, orta: {n: 4, grup: 6, esles: 5, sira: 5, bosluk: 3, hata: 2}, zor: {n: 9, grup: 99, esles: 99, sira: 99, bosluk: 99, hata: 99}}[sev];
      const sira = ['bosluk', 'esles', 'grup', 'hata', 'sira'], tipBas = {}; B.oyunlar.forEach((g) => { const t = LAB_TUR[g.gameType]; (tipBas[t] = tipBas[t] || []).push(g); });
      const L = []; let tur = 0;
      while (L.length < sinir.n && tur < 3) { sira.forEach((t) => { if (L.length >= sinir.n) return; const g = (tipBas[t] || [])[tur]; if (!g) return; L.push(this._gorev(t, g, sinir)); }); tur++; }
      return L;
    },
    _gorev(t, g, s) {
      const [ad, tur] = LAB_AD[t], base = {tip: t, ad, tur, kaynak: g.title, kazanim: g.outcomeIds || [], talimat: tur};
      if (t === 'grup') { const I = kar(g.items).slice(0, s.grup); const cats = g.categories.filter((c) => I.some((x) => x.cat === c)); return Object.assign(base, {veri: {categories: cats, items: I, talimat: g.prompt || 'Her ifadeyi ait olduğu gruba yerleştir.'}}); }
      if (t === 'esles') return Object.assign(base, {veri: {pairs: kar(g.pairs).slice(0, s.esles), talimat: g.prompt || 'Soldaki kavramı sağdaki karşılığıyla eşleştir.'}});
      if (t === 'sira') { const items = (g.items || []).map(temiz); let seq = items; if (items.length > s.sira) { const b = Math.floor(Math.random() * (items.length - s.sira + 1)); seq = items.slice(b, b + s.sira); } return Object.assign(base, {veri: {items: seq, talimat: (g.prompt || 'Adımları kitaptaki sıraya diz.') + (seq.length < items.length ? ' (Ardışık ' + seq.length + ' adım.)' : '')}}); }
      if (t === 'bosluk') return Object.assign(base, {talimat: 'Boşluğa gelecek kavramı seç.', veri: {items: kar(g.items).slice(0, s.bosluk)}});
      if (t === 'hata') return Object.assign(base, {talimat: 'Bilgisi yanlış olan kartı bul.', veri: {rounds: kar(g.rounds).slice(0, s.hata)}});
    }
  };
  V44.oyunZaman = iskelet(ZAMAN);
  V44.oyunLab = iskelet(LAB);
  // sıralama: Kütüphane, Zamanın İzinde, Bilgi Laboratuvarı
  V41.sira = ['kutuphane', 'zaman', 'lab'].filter((x) => V41.oyunlar[x]).concat(V41.sira.filter((x) => !['kutuphane', 'zaman', 'lab'].includes(x)));
  try { V41.oyunlar.kutuphane.kategori = 'hibrit'; } catch (e) {}

  /* ---------- 6. Oyun profili, başarımlar, görevler (kayıtlardan hesaplanır; yeni anahtar yok) ---------- */
  V44.profil = function () {
    const o = V41.kayit().oyunlar || {}, P = {ogrenme: {yildiz: 0, puan: 0, en: 0}, hibrit: {yildiz: 0, puan: 0, en: 0}, macera: {yildiz: 0, puan: 0, en: 0}, kayitlar: []};
    ['zaman', 'lab'].forEach((id) => { const O = V41.oyunlar[id]; if (!O) return; const B = O.bolumler(); P.ogrenme.en += B.filter((b) => b.hazir).length * 9; Object.entries(o[id] || {}).forEach(([bid, k]) => Object.entries(k.seviyeler || {}).forEach(([s, v]) => { P.ogrenme.yildiz += v.yildiz; P.ogrenme.puan += v.puan; P.kayitlar.push({oyun: id, bolum: bid, seviye: s, yildiz: v.yildiz, t: v.t}); })); });
    const ku = (o.kutuphane || {}); Object.values(ku).forEach((k) => { const y = k && k.yildiz ? Object.values(k.yildiz).reduce((a, x) => a + x, 0) : 0; P.hibrit.yildiz += y; P.hibrit.puan += (k && k.puan) ? Object.values(k.puan).reduce((a, x) => a + (+x || 0), 0) : 0; });
    try { P.hibrit.en = (V41.oyunlar.kutuphane.bolumler() || []).filter((b) => b.hazir).reduce((a, b) => a + b.odaSay * 3, 0); } catch (e) {}
    const gun = bugun(), hafta = Date.now() - 7 * 864e5;
    P.gunluk = {ad: 'Bugün bir seviye tamamla', ok: P.kayitlar.some((x) => x.t && x.t.slice(0, 10) === gun)};
    const hy = P.kayitlar.filter((x) => x.t && Date.parse(x.t) >= hafta).reduce((a, x) => a + x.yildiz, 0);
    P.haftalik = {ad: 'Son 7 günde 6 yıldız topla', ok: hy >= 6, ilerleme: Math.min(6, hy)};
    const kuBitti = Object.values(ku).some((k) => k && k.bitti), labUc = Object.values(o.lab || {}).some((k) => k.seviyeler && k.seviyeler.kolay && k.seviyeler.orta && k.seviyeler.zor);
    P.basarim = [['İlk adım', 'Bir seviyeyi bitir', P.kayitlar.length > 0], ['Zaman yolcusu', 'Zamanın İzinde’de bir bölümü Zor seviyede bitir', P.kayitlar.some((x) => x.oyun === 'zaman' && x.seviye === 'zor')], ['Laborant', 'Bilgi Laboratuvarı’nda bir ünitenin üç seviyesini bitir', labUc], ['Kütüphaneci', 'Kayıp Bilgeliğin Kütüphanesi bölümünü bitir', kuBitti], ['Yıldız avcısı', 'Öğrenme oyunlarında 20 yıldız topla', P.ogrenme.yildiz >= 20]];
    return P;
  };

  /* ---------- 7. Hibrit oyun merkezi ---------- */
  const kart = (O, kat) => {
    const B = (O.bolumler && O.bolumler()) || [], hz = B.filter((b) => b.hazir), k = V41.kayit().oyunlar[O.id] || {};
    const y = Object.values(k).reduce((a, x) => a + (x && x.yildiz ? Object.values(x.yildiz).reduce((p, q) => p + q, 0) : 0), 0), ym = hz.reduce((a, b) => a + (b.odaSay || 3) * 3, 0);
    const devam = Object.entries(k).find(([bid, x]) => x && (x.aktif || (O.id === 'kutuphane' && !x.bitti)));
    let butonlar;
    if (O.id === 'kutuphane') { const b = hz[0]; butonlar = b ? (devam ? `<button class="o41-b p" onclick="go('poyna',{oyn:'kutuphane',obol:'${b.id}',odevam:1})">Devam et</button><button class="o41-b" onclick="go('poyna',{oyn:'kutuphane',obol:'${b.id}',odevam:0})">Baştan başla</button>` : `<button class="o41-b p" onclick="go('poyna',{oyn:'kutuphane',obol:'${b.id}',odevam:0})">Oyna</button>`) : `<p class="o41-etk">${esc((B[0] && B[0].neden) || 'Kaynakta veri bulunmuyor.')}</p>`; }
    else butonlar = hz.length ? `${devam ? `<button class="o41-b p" onclick="go('poyna',{oyn:'${O.id}',obol:'${devam[0]}',odevam:1})">Devam et</button>` : ''}<button class="o41-b ${devam ? '' : 'p'}" onclick="go('poyna',{oyn:'${O.id}',obol:'',odevam:0})">Bölüm seç (${hz.length})</button>` : '<p class="o41-etk">Kaynak kontrolünden geçmiş içerik bulunmuyor.</p>';
    return `<section class="o41-oyun g44-ok" data-kat="${kat}" aria-labelledby="o44-${O.id}"><div class="o41-afis" style="${O.afis || ''}" aria-hidden="true"><i></i></div><div class="o41-ic"><h3 id="o44-${O.id}">${esc(O.ad)}</h3><p>${esc(O.ozet || '')}</p>
<p class="g44-oz"><span>${hz.length} bölüm</span><span>${sv('yildiz', 14)} ${y} / ${ym}</span></p><div class="o41-bb">${butonlar}</div></div></section>`;
  };
  V39.r_poyun = function () {
    const P = V44.profil(), O = V41.oyunlar;
    $.innerHTML = `<div class="p39 p39-pg o41-merkez g44-merkez">${V39.top('', 'Oyun Dünyası')}${V39.crumb([['Koridor', "go('pdunya')"], ['Oyun Dünyası', '']])}
<header class="o41-bas"><p class="p39-ey">Premium</p><h1>Oyun Dünyası</h1><p class="p39-mut">Öğrenme oyunları ders kayıtlarından kurulur; hibrit görevler hikâyeyi kazanımlarla birleştirir.</p></header>
<section class="g44-prof" aria-label="Oyun profili"><div class="g44-pk"><small>Öğrenme puanı</small><b>${P.ogrenme.puan}</b><span>${sv('yildiz', 14)} ${P.ogrenme.yildiz} / ${P.ogrenme.en}</span></div><div class="g44-pk"><small>Görev puanı (hibrit)</small><b>${P.hibrit.puan}</b><span>${sv('yildiz', 14)} ${P.hibrit.yildiz} / ${P.hibrit.en}</span></div><div class="g44-pk"><small>Macera puanı</small><b>${P.macera.puan}</b><span>Macera oyunları geliştiriliyor</span></div></section>
<section class="g44-gorev"><h2 class="g44-h2">Görevler</h2><ul><li class="${P.gunluk.ok ? 'ok' : ''}">${sv(P.gunluk.ok ? 'ok' : 'zaman', 16)} <b>Günlük:</b> ${P.gunluk.ad}</li><li class="${P.haftalik.ok ? 'ok' : ''}">${sv(P.haftalik.ok ? 'ok' : 'zaman', 16)} <b>Haftalık:</b> ${P.haftalik.ad} (${P.haftalik.ilerleme}/6)</li></ul>
<details class="g44-bas"><summary>Başarımlar (${P.basarim.filter((x) => x[2]).length} / ${P.basarim.length})</summary><ul>${P.basarim.map(([a, d, ok]) => `<li class="${ok ? 'ok' : ''}">${sv(ok ? 'yildiz' : 'kilit', 16)} <b>${esc(a)}</b> <small>${esc(d)}</small></li>`).join('')}</ul></details></section>
<h2 class="g44-kat">Öğrenme oyunları <small>Müfredata ve kazanımlara bağlı</small></h2><div class="o41-oyunlar">${['zaman', 'lab'].filter((x) => O[x]).map((x) => kart(O[x], 'ogrenme')).join('')}
<section class="o41-oyun klasik g44-ok" data-kat="ogrenme"><div class="o41-ic"><h3>Klasik oyunlar</h3><p>Eşleştirme, gruplandırma, kelime avı ve diğer 12 oyun türü.</p><div class="o41-bb"><button class="o41-b" onclick="go('games')">Klasik oyunlara git</button></div></div></section></div>
<h2 class="g44-kat">Hibrit görevler <small>Hikâye içinde gerçek kazanımlar</small></h2><div class="o41-oyunlar">${O.kutuphane ? kart(O.kutuphane, 'hibrit') : ''}</div>
<h2 class="g44-kat">Macera oyunları <small>Müfredattan bağımsız hikâye ve keşif</small></h2><div class="o41-oyunlar"><section class="o41-oyun yakinda g44-ok" data-kat="macera"><div class="o41-ic"><h3>Macera oyunları</h3><p>Bağımsız hikâye, keşif ve bulmaca oyunları bu bölümde yer alacak. Macera puanı öğrenme puanından ayrı tutulur.</p><p class="o41-etk">Geliştiriliyor — henüz oynanabilir oyun yok.</p></div></section></div></div>`;
  };
})();
