/* ===================== V54.0 (3/3): Altın oyunları ve editör içerik alanı =====================
   Oyunlar (rota aoyun53; yalnız Altın açıkken — şimdilik editör önizlemesi), hepsi mevcut kayıtlardan; uydurma içerik yok:
   • Beni Bul!        — Ben Kimim kayıtları (teknik ipuçları ayıklanmış) + kişi/yer/olay/kurum/eser kayıtlarının ve kavramların ders kitabı
                        cümleleri (ad gizlenir). Aşamalı ipucu (tür → cümleler → harf sayısı/ilk harf), erken bilene çok puan, 4 seçenek.
   • Gizemli Şahsiyet — Beni Bul!'un yalnız şahsiyet (kişi) kayıtlarıyla oynanan biçimi.
   • Harf Halkası     — her harf için cevabı o harfle başlayan kayıt; soru = ders kitabı cümlesi (cevap gizli); boş harf sunulmaz; süre, pas.
   • Bilgi Arenası    — soru bankası; kategori = ünite/konu başlığından anahtar sözcükle (Kur'an, Siyer, İbadet, İslam tarihi, Ahlak,
                        Dinî kavramlar, Peygamberler, İnanç esasları); zorluk seçimi; açıklama.
   • Gizli Bilgin     — aynı cihazda sırayla (3–8 oyuncu); kavram = ders kitabı kavramı. Çoklu cihaz için sunucu gerekir (yok).
   • Kelimeyi Anlat Bakalım — Tabu kayıtları (kelime + 4 yasaklı) + editör kartları; iki takım, süre, tur, pas, ceza, skor, tekrar yok.
   Editör içerikleri  dk-icerik54 = {v:1, benibul:[], halka:[], arena:[], anlat:[]} — rota 'icerik54' (yalnız editör); bu cihazda hemen
   oyunlara girer; “Dışa aktar” ile sonraki sürüme gömülmek üzere JSON verilir. */
(function () {
  if (!window.V53 || !V53.Oyun || typeof V30 === 'undefined') return;
  const V54 = window.V54 = window.V54 || {};
  const A = V51.Altin, OY53 = V53.Oyun;
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const ls = {al: (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } }, yaz: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }};
  const kar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const kucuk = (s) => String(s || '').toLocaleLowerCase('tr-TR'), buyuk = (s) => String(s || '').toLocaleUpperCase('tr-TR');
  const norm = (s) => kucuk(s).replace(/[âà]/g, 'a').replace(/[îì]/g, 'i').replace(/[ûù]/g, 'u').replace(/['’`´.\-\s]/g, '');
  const yayinda = (x) => { try { return typeof V45 === 'undefined' || !V45.yayinaUygun || V45.yayinaUygun(x); } catch (y) { return true; } };
  const kaydet = (oids, ok) => { try { if (oids && oids.length) { Prog.rec(oids, ok); Store.save(); } } catch (x) {} };
  const sinif = () => OY53.sinif();
  const editor = () => { try { return !!V38.edOk(); } catch (x) { return false; } };
  const OY = V54.Oyun = {aktif: null, d: null};

  /* ---------- 0. editör içerikleri ---------- */
  const IC = V54.Icerik = {K: 'dk-icerik54', TUR: {benibul: 'Beni Bul! ipucu kartı', halka: 'Harf Halkası sorusu', arena: 'Bilgi Arenası sorusu', anlat: 'Kelimeyi Anlat Bakalım kartı'}};
  IC.oku = () => { const r = ls.al(IC.K); return r && r.v === 1 ? Object.assign({benibul: [], halka: [], arena: [], anlat: []}, r) : {v: 1, benibul: [], halka: [], arena: [], anlat: []}; };
  IC.ekle = (tur, x) => { const r = IC.oku(); r[tur].push(Object.assign({id: 'ED54-' + Date.now().toString(36), t: new Date().toISOString(), editor: 1}, x)); ls.yaz(IC.K, r); };
  IC.sil = (tur, id) => { const r = IC.oku(); r[tur] = r[tur].filter((x) => x.id !== id); ls.yaz(IC.K, r); if (view === 'icerik54') draw(); };

  /* ---------- 1. kategoriler (ünite/konu başlığından) ---------- */
  const KAT = OY.KAT = [['peygamber', 'Peygamberler', /peygamberler|nebi|resul|hz\.?\s*(ibrahim|musa|isa|nuh|yusuf|adem|âdem|davut|süleyman|yakup|yunus|eyüp|zekeriya|yahya|ismail|lut|hud|salih|şuayb)/], ['siyer', 'Siyer', /muhammed|peygamberimiz|siyer|hicret|mekke|medine|sünnet|hadis|veda/], ['kuran', "Kur'an", /kur.?an|sure|ayet|âyet|vahiy|tefsir|meal|tilavet/], ['ibadet', 'İbadet', /ibadet|namaz|oruç|ramazan|hac|umre|zek[âa]t|sadaka|abdest|temizlik|kurban|dua|cami/], ['ahlak', 'Ahlak', /ahlak|erdem|değer|davranış|sorumluluk|adalet|merhamet|dürüst|saygı|aile|komşu|yardımlaş/], ['inanc', 'İnanç esasları', /iman|inanç|allah|melek|ahiret|kader|kaza|tevhit|esma|kitap|kıyamet|cennet|cehennem/], ['tarih', 'İslam tarihi', /tarih|medeniyet|osmanlı|selçuklu|düşünce|mezhep|yorum|tasavvuf|kültür|sanat|bilim|alim|âlim|halife/], ['kavram', 'Dinî kavramlar', /./]];
  OY.kategori = function (x) {
    const t = x.topicId ? Store.get('topics', x.topicId) : null, u = (t && t.unitId) || x.unitId, un = u ? Store.get('units', u) : null;
    const m = kucuk(((un && un.title) || '') + ' ' + ((t && t.title) || '') + ' ' + (x.title || ''));
    return (KAT.find((k) => k[2].test(m)) || KAT[KAT.length - 1])[0];
  };

  /* ---------- 2. Beni Bul! / Gizemli Şahsiyet havuzu ---------- */
  const TUR = {kisi: 'Bir şahsiyet', yer: 'Bir mekân', olay: 'Bir olay', kurum: 'Bir kurum', eser: 'Bir eser', kavram: 'Bir dinî kavram', ibadet: 'Bir ibadet'};
  const maskele = (cumle, ad) => { const re = new RegExp(String(ad).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu'); return re.test(cumle) ? cumle.replace(re, '_____') : null; };
  const metin = (sn) => String((sn && typeof sn === 'object' ? sn.text : sn) || '').replace(/\s+/g, ' ').trim();
  OY.bbHavuz = function (sadeceKisi) {
    const s = sinif(), M = new Map(), ekle = (ad, tur, ipuclari, aciklama, grade, oids) => {
      const k = norm(ad); if (!ad || !ipuclari.length || ad.length < 2) return;
      const v = M.get(k); if (v) { ipuclari.forEach((i) => { if (!v.ip.includes(i) && v.ip.length < 4) v.ip.push(i); }); return; }
      M.set(k, {ad, tur, ip: ipuclari.slice(0, 4), aciklama, grade, oids: oids || []});
    };
    Store.all('games').filter((g) => g.gameType === 'benkimim').forEach((g) => (g.items || []).forEach((it) => {
      const cum = (it.hints || []).filter((h) => /_____/.test(h) && !/müfredat|sayfa|^Konu/i.test(h));
      if (cum.length) ekle(it.name, it.etype === 'kisi' ? 'kisi' : (it.etype || 'kavram'), cum, cum[0].replace(/_____/g, it.name), g.grade);
    }));
    Store.all('entities').filter((x) => ['kisi', 'yer', 'olay', 'kurum', 'eser'].includes(x.type) && yayinda(x)).forEach((x) => { const m = metin(x.snippet), k = m && maskele(m, x.name); if (k) ekle(x.name, x.type, [k], m, x.grade, x.outcomeIds); });
    if (!sadeceKisi) Store.all('concepts').filter((x) => yayinda(x)).forEach((x) => { const m = metin(x.snippet), ad = x.term && x.term.charAt(0).toLocaleUpperCase('tr-TR') + x.term.slice(1), k = m && maskele(m, x.term); if (k && ad.length <= 24) ekle(ad, 'kavram', [k], m, x.grade, x.outcomeIds); });
    IC.oku().benibul.forEach((x) => ekle(x.ad, x.tur || 'kavram', (x.ipuclari || []).filter(Boolean), x.aciklama || '', +x.grade || 0, []));
    let L = [...M.values()]; if (sadeceKisi) L = L.filter((x) => x.tur === 'kisi');
    const S = s ? L.filter((x) => !x.grade || +x.grade === s) : L;
    return S.length >= 8 ? S : L;
  };
  OY.bbBasla = function (kisi) {
    const H = OY.bbHavuz(kisi), L = kar(H).slice(0, 8);
    OY.d = {tip: kisi ? 'gizemli' : 'benibul', H, L, i: 0, acik: 1, puan: 0, cevap: null, sec: null, dogru: 0};
    OY.bbSecenek(); OY.ciz();
  };
  OY.bbSecenek = function () {
    const d = OY.d, x = d.L[d.i]; if (!x) return;
    const ayni = kar(d.H.filter((y) => y !== x && y.tur === x.tur)), diger = kar(d.H.filter((y) => y !== x && y.tur !== x.tur));
    d.sec = kar([x, ...ayni.concat(diger).slice(0, 3)]).map((y) => y.ad);
  };
  OY.bbIpuclari = (x) => [TUR[x.tur] || 'Bir dinî terim', ...x.ip, `${[...x.ad.replace(/\s/g, '')].length} harf; ilk harfi “${buyuk(x.ad[0])}”`];

  /* ---------- 3. Harf Halkası ---------- */
  OY.HARF = 'ABCÇDEFGHIİJKLMNOÖPRSŞTUÜVYZ';
  OY.hhBasla = function () {
    const s = sinif(), aday = [];
    const al = (ad, cumle, grade, oids) => { const m = metin(cumle), k = m && maskele(m, ad); if (k && ad.length >= 2 && ad.length <= 22) aday.push({ad, soru: k, aciklama: m, grade, oids}); };
    Store.all('concepts').filter(yayinda).forEach((c) => al(c.term, c.snippet, c.grade, c.outcomeIds));
    Store.all('entities').filter((x) => ['kisi', 'yer', 'olay', 'kurum', 'eser'].includes(x.type) && yayinda(x)).forEach((x) => al(x.name, x.snippet, x.grade, x.outcomeIds));
    IC.oku().halka.forEach((x) => aday.push({ad: x.cevap, soru: x.soru, aciklama: x.aciklama || '', grade: +x.grade || 0, oids: []}));
    const harfler = [];
    for (const h of OY.HARF) {
      const uy = aday.filter((a) => buyuk(a.ad[0]) === h), sn = s ? uy.filter((a) => +a.grade === s) : [];
      const sec = (sn.length ? sn : uy); if (sec.length) harfler.push(Object.assign({h, d: null}, sec[Math.floor(Math.random() * sec.length)]));
    }
    OY.d = {tip: 'halka', harfler, sira: harfler.map((_, i) => i), k: 0, puan: 0, bitis: Date.now() + 240e3, bitti: false, son: null};
    clearInterval(OY._t); OY._t = setInterval(() => { if (view !== 'aoyun53' || !OY.d || OY.d.tip !== 'halka') { clearInterval(OY._t); return; } const z = document.getElementById('hh54-z'); const kal = Math.max(0, Math.round((OY.d.bitis - Date.now()) / 1000)); if (z) z.textContent = kal + ' sn'; if (!kal && !OY.d.bitti) { OY.d.bitti = true; clearInterval(OY._t); OY.ciz(); } }, 500);
    OY.ciz();
  };
  OY.hhCevap = function (pas) {
    const d = OY.d; if (d.bitti) return; const i = d.sira[d.k], x = d.harfler[i], inp = document.getElementById('hh54-i');
    if (pas) { d.sira.push(d.sira.splice(d.k, 1)[0]); d.son = {pas: true, h: x.h}; }
    else { const v = inp ? inp.value : ''; if (!v.trim()) return; const ok = norm(v) === norm(x.ad); x.d = ok; if (ok) d.puan += 10; kaydet(x.oids, ok); d.son = {ok, x}; d.sira.splice(d.k, 1); }
    if (!d.sira.length) d.bitti = true; else if (d.k >= d.sira.length) d.k = 0;
    if (d.bitti) clearInterval(OY._t);
    OY.ciz();
  };

  /* ---------- 4. Bilgi Arenası ---------- */
  OY.arHavuz = function () {
    const s = sinif(), uygun = (q) => q && Array.isArray(q.options) && q.options.length >= 3 && Number.isInteger(q.answer) && q.text && yayinda(q);
    let L = Store.all('questions').filter(uygun).map((q) => ({q, kat: OY.kategori(q)}));
    IC.oku().arena.forEach((x) => L.push({q: {id: x.id, text: x.soru, options: x.siklar, answer: +x.dogru, explanation: x.aciklama, difficulty: x.zorluk || 'medium', grade: +x.grade || 0, outcomeIds: []}, kat: x.kategori || 'kavram'}));
    const S = s ? L.filter((x) => !x.q.grade || +x.q.grade === s) : L;
    return S.length >= 20 ? S : L;
  };
  OY.arBasla = function (kat, zor) {
    const L = OY.arHavuz().filter((x) => x.kat === kat && (!zor || x.q.difficulty === zor));
    OY.d = {tip: 'arena', kat, zor, L: kar(L).slice(0, 10), i: 0, dogru: 0, cevap: null}; OY.ciz();
  };

  /* ---------- 5. Gizli Bilgin (aynı cihazda) ---------- */
  OY.gbHavuz = function () { const s = sinif(); const L = Store.all('concepts').filter((c) => c.term && c.term.length <= 18 && yayinda(c)); const S = s ? L.filter((c) => +c.grade === s) : L; return (S.length >= 6 ? S : L).map((c) => c.term.charAt(0).toLocaleUpperCase('tr-TR') + c.term.slice(1)); };
  OY.gbKur = function () { OY.d = {tip: 'gizli', asama: 'kur', oyuncular: ['Oyuncu 1', 'Oyuncu 2', 'Oyuncu 3', 'Oyuncu 4'], puan: {}}; OY.ciz(); };
  OY.gbBasla = function () {
    const d = OY.d, ad = [...document.querySelectorAll('.gb54-ad')].map((i) => i.value.trim()).filter(Boolean);
    if (ad.length < 3) { UI.toast('En az 3 oyuncu gerekir.'); return; }
    const H = OY.gbHavuz(); d.oyuncular = ad; ad.forEach((a) => { if (d.puan[a] == null) d.puan[a] = 0; });
    d.kelime = H[Math.floor(Math.random() * H.length)]; d.gizli = Math.floor(Math.random() * ad.length); d.goster = 0; d.gordu = false; d.asama = 'rol'; d.secenek = kar([d.kelime, ...kar(H.filter((h) => h !== d.kelime)).slice(0, 3)]);
    OY.ciz();
  };

  /* ---------- 6. Kelimeyi Anlat Bakalım ---------- */
  OY.anHavuz = function () {
    const L = [];
    Store.all('games').filter((g) => g.gameType === 'tabu' && yayinda(g)).forEach((g) => (g.items || []).forEach((it) => { if (it.term && (it.forbidden || []).length >= 4) L.push({kelime: it.term, yasak: it.forbidden.slice(0, 5), kat: OY.kategori(g), zor: 'karisik', grade: g.grade}); }));
    IC.oku().anlat.forEach((x) => { const y = (x.yasakli || []).filter(Boolean); if (x.kelime && y.length >= 4) L.push({kelime: x.kelime, yasak: y.slice(0, 5), kat: x.kategori || 'kavram', zor: x.zorluk || 'karisik', grade: +x.grade || 0}); });
    return L;
  };
  OY.anKur = function () { OY.d = {tip: 'anlat', asama: 'kur'}; OY.ciz(); };
  OY.anBasla = function () {
    const v = (id) => (document.getElementById(id) || {}).value || '';
    const kat = v('an54-k'), L = OY.anHavuz().filter((x) => !kat || x.kat === kat);
    if (!L.length) { UI.toast('Bu kategoride kart yok.'); return; }
    OY.d = {tip: 'anlat', asama: 'hazir', takim: [v('an54-a').trim() || 'A Takımı', v('an54-b').trim() || 'B Takımı'], skor: [0, 0], sure: +v('an54-s') || 60, tur: +v('an54-t') || 2, sira: 0, oynanan: 0, deste: kar(L), kart: null, pas: 3, tsay: {dogru: 0, pas: 0, ceza: 0}};
    OY.ciz();
  };
  OY.anTurBasla = function () {
    const d = OY.d; d.asama = 'oyun'; d.pas = 3; d.tsay = {dogru: 0, pas: 0, ceza: 0}; d.bitis = Date.now() + d.sure * 1000; d.kart = d.deste.shift() || null;
    clearInterval(OY._t); OY._t = setInterval(() => { if (view !== 'aoyun53' || !OY.d || OY.d.tip !== 'anlat' || OY.d.asama !== 'oyun') { clearInterval(OY._t); return; } const kal = Math.max(0, Math.round((d.bitis - Date.now()) / 1000)); const z = document.getElementById('an54-z'); if (z) z.textContent = kal + ' sn'; if (!kal) { clearInterval(OY._t); OY.anTurBitir(); } }, 400);
    OY.ciz();
  };
  OY.anIs = function (ne) {
    const d = OY.d; if (d.asama !== 'oyun' || !d.kart) return;
    if (ne === 'pas') { if (d.pas <= 0) { UI.toast('Pas hakkın kalmadı.'); return; } d.pas--; d.tsay.pas++; }
    else if (ne === 'dogru') { d.skor[d.sira]++; d.tsay.dogru++; }
    else if (ne === 'ceza') { d.skor[d.sira]--; d.tsay.ceza++; }
    d.kart = d.deste.shift() || null; if (!d.kart) { clearInterval(OY._t); OY.anTurBitir(true); return; }
    OY.ciz();
  };
  OY.anTurBitir = function (bitti) {
    const d = OY.d; d.oynanan++; d.asama = 'ara'; d.desteBitti = !!bitti || !d.deste.length;
    if (d.oynanan >= d.tur * 2 || d.desteBitti) d.asama = 'son';
    else d.sira = 1 - d.sira;
    OY.ciz();
  };

  /* ---------- 7. çizim ---------- */
  const kabuk = (ad, ic) => `<section class="ao53 ao54"><div class="ao53-ust"><button type="button" class="ao53-geri" onclick="V54.Oyun.cik()">‹ Oyunlar</button><h1>${e(ad)}</h1></div>${ic}</section>`;
  OY.cik = function () { clearInterval(OY._t); OY.aktif = null; OY.d = null; OY53.aktif = null; go('poyun'); };
  OY.ciz = function () {
    const d = OY.d; if (!d) return;
    if (d.tip === 'benibul' || d.tip === 'gizemli') {
      const ad = d.tip === 'gizemli' ? 'Gizemli Şahsiyet' : 'Beni Bul!';
      if (!d.L.length) { $.innerHTML = kabuk(ad, '<p class="ao53-bos">Bu sınıf için yeterli kayıt bulunmuyor. Editör, Oyun içerikleri bölümünden kart ekleyebilir.</p>'); return; }
      if (d.i >= d.L.length) { $.innerHTML = kabuk(ad, `<div class="ao53-son"><p>${d.dogru}/${d.L.length} doğru</p><b class="ao53-puan">${d.puan} puan</b><div class="ao53-bb"><button type="button" class="ao53-p" onclick="V54.Oyun.ac('${d.tip}')">Yeniden oyna</button><button type="button" onclick="V54.Oyun.cik()">Oyunlar</button></div></div>`); return; }
      const x = d.L[d.i], ip = OY.bbIpuclari(x), c = d.cevap, puan = [100, 70, 40, 20][Math.min(3, d.acik - 1)];
      $.innerHTML = kabuk(ad, `<p class="ao53-ad">${d.i + 1}/${d.L.length} · ${d.puan} puan · şimdi bilirsen ${puan} puan</p>
<ol class="bb54-ip">${ip.slice(0, c ? ip.length : d.acik).map((h, k) => `<li class="${k === d.acik - 1 && !c ? 'yeni' : ''}">${e(h)}</li>`).join('')}</ol>
${c ? `<div class="ao53-ack ${c === x.ad ? 'dg' : 'yn'}" role="status"><b>${c === x.ad ? 'Bildin!' : 'Cevap: ' + e(x.ad)}</b>${x.aciklama ? '<br>' + e(x.aciklama) : ''}</div><div class="ao53-bb"><button type="button" class="ao53-p" onclick="V54.Oyun.bbIleri()">${d.i < d.L.length - 1 ? 'Sonraki' : 'Sonucu gör'}</button></div>`
  : `<div class="ao53-sk">${d.sec.map((s) => `<button type="button" class="ao53-s" onclick="V54.Oyun.bbCevap(${e(JSON.stringify(s))})">${e(s)}</button>`).join('')}</div><div class="ao53-bb">${d.acik < ip.length ? '<button type="button" onclick="V54.Oyun.bbIpucu()">Yeni ipucu</button>' : ''}</div>`}`);
      return;
    }
    if (d.tip === 'halka') {
      if (!d.harfler.length) { $.innerHTML = kabuk('Harf Halkası', '<p class="ao53-bos">Uygun kayıt bulunmuyor.</p>'); return; }
      const halka = `<div class="hh54-r" aria-label="Harfler">${d.harfler.map((x, i) => `<span class="${x.d === true ? 'dg' : x.d === false ? 'yn' : (d.sira[d.k] === i && !d.bitti ? 'su' : '')}">${x.h}</span>`).join('')}</div>`;
      if (d.bitti) { const dg = d.harfler.filter((x) => x.d === true).length; $.innerHTML = kabuk('Harf Halkası', `${halka}<div class="ao53-son"><p>${dg}/${d.harfler.length} harf doğru</p><b class="ao53-puan">${d.puan} puan</b><details class="hh54-oz"><summary>Cevaplar</summary><ul>${d.harfler.map((x) => `<li><b>${x.h}</b> ${e(x.ad)} ${x.d === true ? '✓' : x.d === false ? '✗' : '–'}</li>`).join('')}</ul></details><div class="ao53-bb"><button type="button" class="ao53-p" onclick="V54.Oyun.ac('halka')">Yeniden oyna</button><button type="button" onclick="V54.Oyun.cik()">Oyunlar</button></div></div>`); return; }
      const x = d.harfler[d.sira[d.k]], kal = Math.max(0, Math.round((d.bitis - Date.now()) / 1000));
      $.innerHTML = kabuk('Harf Halkası', `${halka}<p class="ao53-ad"><span id="hh54-z">${kal} sn</span> · ${d.puan} puan · kalan ${d.sira.length} harf</p>
${d.son ? `<p class="hh54-son ${d.son.pas ? '' : d.son.ok ? 'dg' : 'yn'}">${d.son.pas ? d.son.h + ' harfi sona bırakıldı.' : d.son.ok ? 'Doğru: ' + e(d.son.x.ad) : 'Yanlış. Doğrusu: ' + e(d.son.x.ad)}</p>` : ''}
<div class="hh54-k"><p class="hh54-h"><b>${x.h}</b> harfiyle başlıyor</p><p>${e(x.soru)}</p><form onsubmit="event.preventDefault();V54.Oyun.hhCevap(false)"><input id="hh54-i" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Cevap" placeholder="Cevabın"><div class="ao53-bb"><button type="submit" class="ao53-p">Cevapla</button><button type="button" onclick="V54.Oyun.hhCevap(true)">Pas</button></div></form></div>`);
      return;
    }
    if (d.tip === 'arena') {
      if (!d.kat) {
        const L = OY.arHavuz(), say = {}; L.forEach((x) => { say[x.kat] = (say[x.kat] || 0) + 1; });
        $.innerHTML = kabuk('Bilgi Arenası', `<p class="mut">Kategori ve zorluk seç. Kategoriler sorunun ünite/konu başlığına göre belirlenir.</p>
<label class="ar54-z">Zorluk <select id="ar54-z"><option value="">Karışık</option><option value="easy">Kolay</option><option value="medium">Orta</option><option value="hard">Zor</option></select></label>
<div class="ao53-kartlar">${KAT.map(([k, ad]) => `<button type="button" class="ao53-k" ${say[k] ? '' : 'disabled'} onclick="V54.Oyun.arBasla('${k}',document.getElementById('ar54-z').value)"><b>${ad}</b><small>${say[k] ? say[k] + ' soru' : 'Bu kategoride soru yok · editör ekleyebilir'}</small></button>`).join('')}</div>`);
        return;
      }
      if (!d.L.length) { $.innerHTML = kabuk('Bilgi Arenası', '<p class="ao53-bos">Bu kategori ve zorlukta soru bulunmuyor.</p><div class="ao53-bb"><button type="button" onclick="V54.Oyun.ac(\'arena\')">Başka kategori</button></div>'); return; }
      if (d.i >= d.L.length) { $.innerHTML = kabuk('Bilgi Arenası', `<div class="ao53-son"><p>${(KAT.find((k) => k[0] === d.kat) || [])[1]}</p><b class="ao53-puan">${d.dogru}/${d.L.length}</b><div class="ao53-bb"><button type="button" class="ao53-p" onclick="V54.Oyun.ac('arena')">Yeni yarışma</button><button type="button" onclick="V54.Oyun.cik()">Oyunlar</button></div></div>`); return; }
      const q = d.L[d.i].q, c = d.cevap;
      $.innerHTML = kabuk('Bilgi Arenası', `<p class="ao53-ad">${(KAT.find((k) => k[0] === d.kat) || [])[1]} · ${d.i + 1}/${d.L.length} · ${d.dogru} doğru</p><h2 class="ar54-s">${e(q.text)}</h2>
<div class="ao53-sk">${q.options.map((o, k) => `<button type="button" class="ao53-s ${c == null ? '' : k === q.answer ? 'dg' : k === c ? 'yn' : ''}" ${c != null ? 'disabled' : ''} onclick="V54.Oyun.arCevap(${k})"><i>${'ABCDEF'[k]}</i>${e(o)}</button>`).join('')}</div>
${c != null ? `<div class="ao53-ack ${c === q.answer ? 'dg' : 'yn'}"><b>${c === q.answer ? 'Doğru!' : 'Yanlış.'}</b> ${e(q.explanation || '')}</div><div class="ao53-bb"><button type="button" class="ao53-p" onclick="V54.Oyun.arIleri()">${d.i < d.L.length - 1 ? 'Sonraki soru' : 'Sonucu gör'}</button></div>` : ''}`);
      return;
    }
    if (d.tip === 'gizli') {
      const ust = '<p class="mut">Aynı cihazda sırayla oynanır. Birden çok telefonla oynamak için sunucu gerekir; bu sürümde yok.</p>';
      if (d.asama === 'kur') { $.innerHTML = kabuk('Gizli Bilgin', `${ust}<p>Herkese aynı dinî kavram gösterilir; yalnız bir kişi (Gizli Bilgin) kavramı bilmez. Sırayla kavramı ele vermeyen birer ipucu söyleyin, sonra Gizli Bilgin'i oylayın.</p><div class="gb54-l">${d.oyuncular.map((o, i) => `<input class="gb54-ad" value="${e(o)}" aria-label="Oyuncu ${i + 1} adı" maxlength="16">`).join('')}</div><div class="ao53-bb"><button type="button" onclick="V54.Oyun.gbOyuncu(1)">+ Oyuncu</button><button type="button" onclick="V54.Oyun.gbOyuncu(-1)">− Oyuncu</button><button type="button" class="ao53-p" onclick="V54.Oyun.gbBasla()">Başla</button></div>`); return; }
      if (d.asama === 'rol') {
        const o = d.oyuncular[d.goster];
        $.innerHTML = kabuk('Gizli Bilgin', `<div class="gb54-rol"><p>Telefonu <b>${e(o)}</b> alsın. Başkası bakmasın.</p>${d.gordu ? `<div class="gb54-kart">${d.goster === d.gizli ? '<b>Sen Gizli Bilgin\'sin!</b><small>Kavramı bilmiyorsun. Diğerlerinin ipuçlarından tahmin et ve belli etme.</small>' : `<small>Kavram</small><b>${e(d.kelime)}</b>`}</div><button type="button" class="ao53-p" onclick="V54.Oyun.gbSonraki()">Gizle ve sonraki oyuncuya ver</button>` : '<button type="button" class="ao53-p gb54-bak" onclick="V54.Oyun.gbBak()">Rolümü göster</button>'}</div>`);
        return;
      }
      if (d.asama === 'ipucu') { $.innerHTML = kabuk('Gizli Bilgin', `<p>Sırayla kavramla ilgili <b>tek kelimelik</b> bir ipucu söyleyin. Sıra: ${d.oyuncular.map((o) => e(o)).join(' → ')}</p><p class="mut">İpuçları bitince Gizli Bilgin'i oylayın.</p><div class="ao53-bb"><button type="button" class="ao53-p" onclick="V54.Oyun.gbOyla()">Oylamaya geç</button></div>`); return; }
      if (d.asama === 'oy') { $.innerHTML = kabuk('Gizli Bilgin', `<p>Sizce Gizli Bilgin kim? Çoğunluğun seçtiği kişiye dokunun.</p><div class="ao53-sk">${d.oyuncular.map((o, i) => `<button type="button" class="ao53-s" onclick="V54.Oyun.gbSec(${i})">${e(o)}</button>`).join('')}</div>`); return; }
      if (d.asama === 'tahmin') { $.innerHTML = kabuk('Gizli Bilgin', `<p><b>${e(d.oyuncular[d.gizli])}</b> yakalandı! Son şans: kavram hangisi?</p><div class="ao53-sk">${d.secenek.map((s) => `<button type="button" class="ao53-s" onclick="V54.Oyun.gbTahmin(${e(JSON.stringify(s))})">${e(s)}</button>`).join('')}</div>`); return; }
      if (d.asama === 'son') { $.innerHTML = kabuk('Gizli Bilgin', `<div class="ao53-ack ${d.kazanan === 'gizli' ? 'yn' : 'dg'}"><b>${e(d.sonuc)}</b><br>Kavram: <b>${e(d.kelime)}</b> · Gizli Bilgin: <b>${e(d.oyuncular[d.gizli])}</b></div><h3>Puan tablosu</h3><ol class="gb54-p">${Object.entries(d.puan).sort((a, b) => b[1] - a[1]).map(([o, p]) => `<li><span>${e(o)}</span><b>${p}</b></li>`).join('')}</ol><div class="ao53-bb"><button type="button" class="ao53-p" onclick="V54.Oyun.gbBasla2()">Yeni tur</button><button type="button" onclick="V54.Oyun.cik()">Bitir</button></div>`); return; }
    }
    if (d.tip === 'anlat') {
      if (d.asama === 'kur') {
        const L = OY.anHavuz(), say = {}; L.forEach((x) => { say[x.kat] = (say[x.kat] || 0) + 1; });
        $.innerHTML = kabuk('Kelimeyi Anlat Bakalım', `<p class="mut">${L.length} kart (uygulamadaki Tabu kartları${IC.oku().anlat.length ? ' + editör kartları' : ''}). Her kartta 4–5 yasaklı kelime var.</p>
<div class="an54-f"><label>1. takım<input id="an54-a" value="A Takımı" maxlength="18"></label><label>2. takım<input id="an54-b" value="B Takımı" maxlength="18"></label>
<label>Tur süresi<select id="an54-s"><option value="30">30 sn</option><option value="60" selected>60 sn</option><option value="90">90 sn</option></select></label>
<label>Her takıma tur<select id="an54-t"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label>
<label>Kategori<select id="an54-k"><option value="">Hepsi (${L.length})</option>${KAT.filter(([k]) => say[k]).map(([k, ad]) => `<option value="${k}">${ad} (${say[k]})</option>`).join('')}</select></label></div>
<p class="small mut">Doğru +1 · Pas 0 (tur başına 3) · Yasaklı kelime −1. Bir kart bir maçta tekrar gelmez.</p><div class="ao53-bb"><button type="button" class="ao53-p" onclick="V54.Oyun.anBasla()">Maçı başlat</button></div>`);
        return;
      }
      const tablo = `<div class="an54-t">${d.takim.map((t, i) => `<span class="${d.sira === i && d.asama !== 'son' ? 'su' : ''}"><small>${e(t)}</small><b>${d.skor[i]}</b></span>`).join('')}</div>`;
      if (d.asama === 'hazir' || d.asama === 'ara') { $.innerHTML = kabuk('Kelimeyi Anlat Bakalım', `${tablo}${d.asama === 'ara' ? `<p class="mut">Önceki tur: ${d.tsay.dogru} doğru, ${d.tsay.pas} pas, ${d.tsay.ceza} ceza.</p>` : ''}<p>Sıra <b>${e(d.takim[d.sira])}</b> takımında (${Math.floor(d.oynanan / 2) + 1}. tur). Anlatıcı telefonu alsın.</p><div class="ao53-bb"><button type="button" class="ao53-p" onclick="V54.Oyun.anTurBasla()">Turu başlat (${d.sure} sn)</button></div>`); return; }
      if (d.asama === 'son') { const k = d.skor[0] === d.skor[1] ? 'Berabere!' : (d.skor[0] > d.skor[1] ? d.takim[0] : d.takim[1]) + ' kazandı!'; $.innerHTML = kabuk('Kelimeyi Anlat Bakalım', `${tablo}<div class="ao53-son"><b class="ao53-puan">${e(k)}</b>${d.desteBitti ? '<p class="mut">Kartlar bitti; maç erken sona erdi.</p>' : ''}<div class="ao53-bb"><button type="button" class="ao53-p" onclick="V54.Oyun.ac('anlat')">Yeni maç</button><button type="button" onclick="V54.Oyun.cik()">Oyunlar</button></div></div>`); return; }
      const kal = Math.max(0, Math.round((d.bitis - Date.now()) / 1000));
      $.innerHTML = kabuk('Kelimeyi Anlat Bakalım', `${tablo}<p class="ao53-ad"><span id="an54-z">${kal} sn</span> · ${e(d.takim[d.sira])} anlatıyor · pas: ${d.pas}</p>
<div class="an54-kart"><b>${e(d.kart.kelime)}</b><small>Yasaklı kelimeler</small><ul>${d.kart.yasak.map((y) => `<li>${e(y)}</li>`).join('')}</ul></div>
<div class="an54-d"><button type="button" class="an54-ok" onclick="V54.Oyun.anIs('dogru')">Doğru +1</button><button type="button" onclick="V54.Oyun.anIs('pas')" ${d.pas ? '' : 'disabled'}>Pas</button><button type="button" class="an54-ce" onclick="V54.Oyun.anIs('ceza')">Yasaklı −1</button></div>`);
    }
  };
  OY.bbIpucu = function () { const d = OY.d; d.acik = Math.min(OY.bbIpuclari(d.L[d.i]).length, d.acik + 1); OY.ciz(); };
  OY.bbCevap = function (s) { const d = OY.d, x = d.L[d.i]; if (d.cevap) return; d.cevap = s; const ok = s === x.ad; if (ok) { d.puan += [100, 70, 40, 20][Math.min(3, d.acik - 1)]; d.dogru++; } kaydet(x.oids, ok); OY.ciz(); };
  OY.bbIleri = function () { const d = OY.d; d.i++; d.acik = 1; d.cevap = null; OY.bbSecenek(); OY.ciz(); };
  OY.arCevap = function (k) { const d = OY.d, q = d.L[d.i].q; if (d.cevap != null) return; d.cevap = k; if (k === q.answer) d.dogru++; kaydet(q.outcomeIds, k === q.answer); OY.ciz(); };
  OY.arIleri = function () { const d = OY.d; d.i++; d.cevap = null; OY.ciz(); };
  OY.gbOyuncu = function (n) { const d = OY.d; d.oyuncular = [...document.querySelectorAll('.gb54-ad')].map((i) => i.value); if (n > 0 && d.oyuncular.length < 8) d.oyuncular.push('Oyuncu ' + (d.oyuncular.length + 1)); if (n < 0 && d.oyuncular.length > 3) d.oyuncular.pop(); OY.ciz(); };
  OY.gbBak = function () { OY.d.gordu = true; OY.ciz(); };
  OY.gbSonraki = function () { const d = OY.d; d.gordu = false; d.goster++; if (d.goster >= d.oyuncular.length) d.asama = 'ipucu'; OY.ciz(); };
  OY.gbOyla = function () { OY.d.asama = 'oy'; OY.ciz(); };
  OY.gbSec = function (i) { const d = OY.d; if (i === d.gizli) d.asama = 'tahmin'; else { d.kazanan = 'gizli'; d.sonuc = 'Yanlış kişi seçildi; Gizli Bilgin kazandı!'; d.puan[d.oyuncular[d.gizli]] += 2; d.asama = 'son'; } OY.ciz(); };
  OY.gbTahmin = function (s) { const d = OY.d; if (s === d.kelime) { d.kazanan = 'gizli'; d.sonuc = 'Yakalandı ama kavramı bildi; Gizli Bilgin kazandı!'; d.puan[d.oyuncular[d.gizli]] += 2; } else { d.kazanan = 'grup'; d.sonuc = 'Gizli Bilgin yakalandı; grup kazandı!'; d.oyuncular.forEach((o, i) => { if (i !== d.gizli) d.puan[o] += 1; }); } d.asama = 'son'; OY.ciz(); };
  OY.gbBasla2 = function () { const d = OY.d; d.asama = 'kur'; OY.ciz(); setTimeout(() => OY.gbBasla(), 0); };

  /* ---------- 8. merkez ve yönlendirme ---------- */
  OY.LISTE = [['zirve', 'Zirve Yarışı', 'Kolaydan zora 10 soru, ödül basamakları, iki joker.'], ['benibul', 'Beni Bul!', 'Aşamalı ipuçlarıyla şahsiyet, mekân, olay ve kavramı bul.'], ['gizemli', 'Gizemli Şahsiyet', 'Yalnız şahsiyetler: ipuçlarından kim olduğunu bul.'], ['halka', 'Harf Halkası', 'Her harf için cevabı o harfle başlayan soru; süre ve pas.'], ['harf', 'Harf Avı', 'İpucundan kavramı bul; harf harf geri bildirim.'], ['arena', 'Bilgi Arenası', 'Kategori ve zorluk seç, yarış.'], ['anlat', 'Kelimeyi Anlat Bakalım', 'İki takım, yasaklı kelimeler, süre ve skor.'], ['gizli', 'Gizli Bilgin', 'Aynı cihazda 3–8 kişi: kavramı bilmeyeni bulun.']];
  OY.kartlar = () => `<section class="ao54-h" aria-labelledby="ao54-hh"><h2 id="ao54-hh">Altın Oyunları</h2><div class="ao53-kartlar">${OY.LISTE.map(([k, ad, ack]) => `<button type="button" class="ao53-k" onclick="V54.Oyun.git('${k}')"><b>${ad}</b><small>${ack}</small></button>`).join('')}</div><h3 class="ao54-hk">Hikâyeli görevler</h3><p class="mut ao54-hn">Kayıp Bilgeliğin Kütüphanesi ve Sınıf Dünyaları aşağıda; ünite ünite ilerleyen görev tabanlı oyunlardır.</p></section>`;
  OY.git = function (k) { OY.bekleyen = k; go('aoyun53'); };
  OY.ac = function (k) {
    clearInterval(OY._t); OY.aktif = k; OY53.aktif = null;
    if (k === 'zirve' || k === 'harf') { OY.aktif = null; OY53.ac(k); return; }
    if (k === 'benibul') OY.bbBasla(false); else if (k === 'gizemli') OY.bbBasla(true); else if (k === 'halka') OY.hhBasla();
    else if (k === 'arena') { OY.d = {tip: 'arena', kat: null}; OY.ciz(); } else if (k === 'gizli') OY.gbKur(); else if (k === 'anlat') OY.anKur();
  };
  const r0 = V30.routes.aoyun53;
  V30.routes.aoyun53 = function () {
    if (!A.acikMi()) return r0.apply(this, arguments);
    if (OY.bekleyen) { const k = OY.bekleyen; OY.bekleyen = null; return OY.ac(k); }
    if (OY.aktif && OY.d) return OY.ciz();
    if (OY53.aktif) return r0.apply(this, arguments);
    go('poyun');
  };
  OY53.merkez = function () { go('poyun'); };
  OY53.kabuk = (ad, ic) => `<section class="ao53 ao54"><div class="ao53-ust"><button type="button" class="ao53-geri" onclick="V54.Oyun.cik()">‹ Oyunlar</button><h1>${e(ad)}</h1></div>${ic}</section>`;
  // Harf Avı: kelimeden sonra kitap cümlesi; sonuçta kelime listesi
  const ha0 = OY53.Harf.ciz;
  OY53.Harf.ciz = function () {
    const r = ha0.apply(this, arguments); const d = OY53.Harf.d;
    try {
      if (d && !d.bitti && d.cozuldu != null) { const [, c] = d.L[d.i], m = metin(c.snippet); const a = $.querySelector('.ao53-ack'); if (a && m && !a.querySelector('.ha54')) a.insertAdjacentHTML('beforeend', `<br><span class="ha54">${e(m)}</span>`); d.ozet = d.ozet || []; if (!d.ozet.some((o) => o.w === d.L[d.i][0])) d.ozet.push({w: d.L[d.i][0], ok: d.cozuldu}); }
      if (d && d.bitti && d.ozet) { const s = $.querySelector('.ao53-son'); if (s && !s.querySelector('.ha54-oz')) s.insertAdjacentHTML('beforeend', `<ul class="ha54-oz">${d.ozet.map((o) => `<li>${e(o.w)} ${o.ok ? '✓' : '✗'}</li>`).join('')}</ul>`); }
    } catch (x) {}
    return r;
  };

  /* ---------- 9. editör: Oyun içerikleri ---------- */
  V30.routes.icerik54 = function () {
    if (!editor()) { $.innerHTML = '<section class="card"><h1>Oyun içerikleri</h1><p>Bu bölüm yalnız editör içindir.</p></section>'; return; }
    const r = IC.oku(), sat = (tur, x) => `<li><span>${e(x.ad || x.cevap || x.soru || x.kelime)}</span><button type="button" onclick="V54.Icerik.sil('${tur}','${e(x.id)}')">Sil</button></li>`;
    const sec = (id, L) => `<select id="${id}">${L.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select>`;
    const katSec = (id) => sec(id, KAT.map(([k, ad]) => [k, ad])), sinSec = (id) => sec(id, [['', 'Bütün sınıflar'], ...[4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => [n, n + '. sınıf'])]);
    $.innerHTML = `<section class="ic54"><button class="back" onclick="go('editor')">‹ Editör Onay Alanı</button><h1>Oyun içerikleri</h1><p class="mut">Buraya eklenen kartlar bu cihazda oyunlara hemen girer. Herkese ulaşması için “Dışa aktar” dosyasını bir sonraki sürüme eklenmek üzere gönderin. Yalnız kaynakla doğrulanmış bilgi ekleyin.</p>
<button type="button" class="ic54-d" onclick="V54.Icerik.disa()">Dışa aktar (JSON)</button>
<details class="card"><summary><b>${IC.TUR.benibul}</b> (${r.benibul.length})</summary><form onsubmit="return V54.Icerik.kaydet(event,'benibul')"><label>Cevap<input name="ad" required maxlength="40"></label><label>Tür${sec('bb-t', Object.entries(TUR).map(([k, v]) => [k, v]))}</label><label>İpuçları (her satıra bir; 2–4)<textarea name="ip" rows="3" required></textarea></label><label>Açıklama<textarea name="ac" rows="2"></textarea></label><label>Sınıf${sinSec('bb-s')}</label><button class="p">Ekle</button></form><ul class="ic54-l">${r.benibul.map((x) => sat('benibul', x)).join('')}</ul></details>
<details class="card"><summary><b>${IC.TUR.halka}</b> (${r.halka.length})</summary><form onsubmit="return V54.Icerik.kaydet(event,'halka')"><label>Cevap<input name="cevap" required maxlength="30"></label><label>Soru (cevabı içermesin)<textarea name="soru" rows="2" required></textarea></label><label>Açıklama<textarea name="ac" rows="2"></textarea></label><label>Sınıf${sinSec('hh-s')}</label><button class="p">Ekle</button></form><ul class="ic54-l">${r.halka.map((x) => sat('halka', x)).join('')}</ul></details>
<details class="card"><summary><b>${IC.TUR.arena}</b> (${r.arena.length})</summary><form onsubmit="return V54.Icerik.kaydet(event,'arena')"><label>Kategori${katSec('ar-k')}</label><label>Soru<textarea name="soru" rows="2" required></textarea></label>${[0, 1, 2, 3].map((i) => `<label>${'ABCD'[i]} şıkkı<input name="s${i}" required></label>`).join('')}<label>Doğru şık${sec('ar-d', [[0, 'A'], [1, 'B'], [2, 'C'], [3, 'D']])}</label><label>Zorluk${sec('ar-z', [['easy', 'Kolay'], ['medium', 'Orta'], ['hard', 'Zor']])}</label><label>Açıklama<textarea name="ac" rows="2" required></textarea></label><label>Sınıf${sinSec('ar-s')}</label><button class="p">Ekle</button></form><ul class="ic54-l">${r.arena.map((x) => sat('arena', x)).join('')}</ul></details>
<details class="card"><summary><b>${IC.TUR.anlat}</b> (${r.anlat.length})</summary><form onsubmit="return V54.Icerik.kaydet(event,'anlat')"><label>Kelime<input name="kelime" required maxlength="30"></label><label>Yasaklı kelimeler (virgülle; 4–5)<input name="yas" required></label><label>Kategori${katSec('an-k')}</label><label>Zorluk${sec('an-z', [['easy', 'Kolay'], ['medium', 'Orta'], ['hard', 'Zor']])}</label><button class="p">Ekle</button></form><ul class="ic54-l">${r.anlat.map((x) => sat('anlat', x)).join('')}</ul></details></section>`;
  };
  IC.kaydet = function (ev, tur) {
    ev.preventDefault(); const f = ev.target, v = (n) => (f.elements[n] ? String(f.elements[n].value).trim() : ''), s = (id) => (document.getElementById(id) || {}).value || '';
    if (tur === 'benibul') { const ip = v('ip').split('\n').map((x) => x.trim()).filter(Boolean); if (ip.length < 2) { UI.toast('En az 2 ipucu yazın.'); return false; } if (ip.some((i) => norm(i).includes(norm(v('ad'))))) { UI.toast('İpuçları cevabı açıkça içermemeli.'); return false; } IC.ekle(tur, {ad: v('ad'), tur: s('bb-t'), ipuclari: ip.slice(0, 4), aciklama: v('ac'), grade: s('bb-s')}); }
    if (tur === 'halka') { if (norm(v('soru')).includes(norm(v('cevap')))) { UI.toast('Soru cevabı içermemeli.'); return false; } IC.ekle(tur, {cevap: v('cevap'), soru: v('soru'), aciklama: v('ac'), grade: s('hh-s')}); }
    if (tur === 'arena') IC.ekle(tur, {kategori: s('ar-k'), soru: v('soru'), siklar: [0, 1, 2, 3].map((i) => v('s' + i)), dogru: +s('ar-d'), zorluk: s('ar-z'), aciklama: v('ac'), grade: s('ar-s')});
    if (tur === 'anlat') { const y = v('yas').split(',').map((x) => x.trim()).filter(Boolean); if (y.length < 4 || y.length > 5) { UI.toast('4 ya da 5 yasaklı kelime yazın.'); return false; } IC.ekle(tur, {kelime: v('kelime'), yasakli: y, kategori: s('an-k'), zorluk: s('an-z')}); }
    UI.toast('Eklendi.'); draw(); return false;
  };
  IC.disa = function () { try { V38.download('oyun-icerikleri-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(IC.oku(), null, 1)); } catch (x) { UI.toast('Dışa aktarılamadı.'); } };
  if (V38.edHomeHTML) { const h0 = V38.edHomeHTML; V38.edHomeHTML = function () { return h0.apply(this, arguments) + `<section class="ed53-al"><div><b>Oyun içerikleri</b><small>Beni Bul!, Harf Halkası, Bilgi Arenası ve Kelimeyi Anlat Bakalım için kaynakla doğrulanmış kart ekleyin.</small></div><button type="button" class="ed53-alb" onclick="go('icerik54')">Aç</button></section>`; }; }

  try {
    const st = document.createElement('style');
    st.textContent = `.ao54{padding-bottom:calc(130px + env(safe-area-inset-bottom))}.ao53{padding-bottom:calc(130px + env(safe-area-inset-bottom))}
.ao54-h{margin:12px max(16px,env(safe-area-inset-left)) 18px max(16px,env(safe-area-inset-right))}.ao54-h h2{margin:0 0 10px}.ao54-hk{margin:16px 0 4px;font-size:1rem}.ao54-hn{margin:0}
.bb54-ip{display:grid;gap:8px;padding-left:1.3em;margin:0 0 14px}.bb54-ip li{padding:8px 10px;border-radius:10px;background:var(--surface);border:1px solid var(--line);line-height:1.45}.bb54-ip li.yeni{border-color:var(--p-gold,var(--pri))}
.hh54-r{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:0 0 10px}.hh54-r span{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;border:2px solid var(--line);font-size:.85rem}
.hh54-r span.su{border-color:var(--p-gold,var(--pri));background:var(--p-gold,var(--pri));color:var(--p-on-gold,#fff)}.hh54-r span.dg{background:#2F8F62;border-color:#2F8F62;color:#fff}.hh54-r span.yn{background:#B4473E;border-color:#B4473E;color:#fff}
.hh54-k{padding:14px;border-radius:16px;border:1px solid var(--line);background:var(--surface)}.hh54-h{margin:0 0 6px}.hh54-h b{font-size:1.4rem}.hh54-k input,.an54-f input,.an54-f select,.gb54-ad,.ar54-z select{width:100%;min-height:48px;padding:8px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit}
.hh54-son{font-weight:600}.hh54-son.dg{color:#2F8F62}.hh54-son.yn{color:#C0564C}.hh54-oz ul{columns:2;padding-left:1em}
.ar54-z{display:flex;align-items:center;gap:10px;margin:0 0 12px}.ar54-z select{width:auto}.ar54-s{font-size:1.12rem;line-height:1.45}
.ao53-k[disabled]{opacity:.5;cursor:default}
.gb54-l{display:grid;gap:8px;margin:10px 0}.gb54-rol{text-align:center;padding:20px 0}.gb54-kart{display:flex;flex-direction:column;gap:6px;margin:16px auto;max-width:320px;padding:28px 18px;border-radius:20px;border:2px solid var(--p-gold,var(--pri));background:var(--surface)}.gb54-kart b{font-size:1.6rem}
.gb54-bak{min-height:72px!important;font-size:1.1rem!important;padding:12px 28px!important;border-radius:16px}.gb54-p{padding-left:1.2em}.gb54-p li{display:flex;justify-content:space-between;max-width:320px}
.an54-f{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr))}.an54-f label{display:grid;gap:4px;font-weight:600}
.an54-t{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 10px}.an54-t span{display:flex;flex-direction:column;align-items:center;padding:10px;border-radius:14px;border:1px solid var(--line);background:var(--surface)}.an54-t span.su{border-color:var(--p-gold,var(--pri));box-shadow:0 0 0 2px var(--p-gold,var(--pri)) inset}.an54-t b{font-size:1.6rem}
.an54-kart{display:flex;flex-direction:column;align-items:center;gap:6px;padding:22px 16px;border-radius:20px;border:2px solid var(--p-gold,var(--pri));background:var(--surface);text-align:center}.an54-kart>b{font-size:1.9rem}.an54-kart small{color:var(--mut)}.an54-kart ul{list-style:none;margin:0;padding:0;display:grid;gap:4px;color:#C0564C;font-weight:700}
.an54-d{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.an54-d button{min-height:60px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:800;cursor:pointer}.an54-ok{background:#2F8F62!important;color:#fff!important}.an54-ce{background:#B4473E!important;color:#fff!important}
.ha54{color:var(--mut);font-size:.92rem}.ha54-oz{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.ic54 form{display:grid;gap:8px;margin:10px 0}.ic54 label{display:grid;gap:4px}.ic54 input,.ic54 textarea,.ic54 select{min-height:44px;padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit}.ic54 details{margin:10px 0}
.ic54-l{list-style:none;padding:0;display:grid;gap:6px}.ic54-l li{display:flex;justify-content:space-between;gap:8px}.ic54-d{min-height:44px;padding:6px 14px;border-radius:10px}`;
    document.head.appendChild(st);
  } catch (x) {}

  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try {
      if (view === 'poyun' && A.acikMi()) { $.querySelectorAll('.ao53-giris').forEach((x) => x.remove()); if (!$.querySelector('.ao54-h')) $.insertAdjacentHTML('afterbegin', OY.kartlar()); }
      if (view !== 'aoyun53') { clearInterval(OY._t); }
    } catch (x) {}
    return r;
  };
})();
