/* ===================== V45.0: sınıfa özel hibrit oyun dünyaları (4–12) =====================
   Her sınıfın kendi dünyası, hikâyesi, karakterleri, sahnesi ve görev karışımı vardır; ortak motor V44.Motor ile çalışır.
   - Bölge = sınıfın (seçili programdaki) bir ünitesi. Bölgede keşif noktaları:
       not      : kitapla doğrulanmış (A) anlatım paragrafı “bulunan not” olarak Günce'ye girer (sayfa bilgisiyle)
       karakter : kurgusal karakterle diyalog + kaynaktan türetilmiş (B) soru
       bulmaca  : ünitenin kaynak denetiminden geçmiş etkinliğinden görev (eşleştir, sınıflandır, sırala, tamamla, yanlışı bul)
       kanit    : (9–12) kart kayıtlarından kavram–açıklama eşleştirmesi
     Bölge kapısı (bölge sonu mücadelesi): B sorularından karma sınav; sınıfa göre süreli (8) ya da gerekçeli (11).
   - Karakterler kurgusaldır (öğrenciler ve rehberler); peygamber, sahabe ya da dinî şahsiyet karakterleştirilmez.
     Diyaloglar yalnız oyun anlatısıdır; dinî/akademik bilgi yalnız kaynak kayıtlarından gelir. Kaynak eksikse nokta kurulmaz ve yazılır.
   - Kayıt: dk-oyun41 → oyunlar.dunya45.g<sınıf> = {v:1, bolge:{<ünite>:{n:{<nokta>:1}, kapi:{puan,yildiz,t}, bitti}}, gunce:[], t} */
(function () {
  if (typeof V44 === 'undefined' || !V44.Motor || !V44.Gorev) return;
  const D = V45.Dunya = {};
  const kar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const duz = (p) => String(p || '').replace(/\*\*|__|`/g, '').replace(/\*/g, '');
  const SV = (p, s) => `<svg width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const IC = {not: '<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 13h6M9 17h4"/>', kisi: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', bulmaca: '<path d="M10 3h4v3a2 2 0 1 0 4 0V3h3v7h-3a2 2 0 1 0 0 4h3v7h-7v-3a2 2 0 1 0-4 0v3H3v-7h3a2 2 0 1 0 0-4H3V3z"/>', kanit: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>', kapi: '<path d="M6 21V8a6 6 0 0 1 12 0v13"/><path d="M4 21h16M14.5 13.5v1"/>', ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', kilit: '<rect x="5" y="11" width="14" height="9" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', yildiz: '<path d="M12 2.8l2.2 4.4 4.9.7-3.5 3.4.8 4.9L12 13.9l-4.4 2.3.8-4.9-3.5-3.4 4.9-.7z"/>', harita: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>', gunce: '<path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M8 4v16"/>', sure: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>'};
  const sv = (k, s) => SV(IC[k] || '', s);

  /* ---------- 1. Sınıf dünyaları (kurgu, karakterler, mekanik) ---------- */
  D.D = {
    4: {ad: 'Işık Bahçesi', alt: 'Keşif ve eşleştirme', renk: ['#2f6b4f', '#bfe3a3'], odul: 'Işık tohumu', kahraman: 'Elif', rehber: 'Bilge Baykuş', kapi: 'Bahçe kapısı', kapiN: 4, mod: 'normal', tip: ['esles', 'bosluk', 'grup'],
      hikaye: 'Okulun arkasındaki eski bahçede her köşe bir dersin bilgisini saklıyor. Elif ve Bilge Baykuş, solmuş bahçeyi canlandırmak için ışık tohumlarını topluyor.', sahne: 'bahce'},
    5: {ad: 'Gözlem Kubbesi', alt: 'Gözlem istasyonları, sınıflandırma ve sıralama', renk: ['#22305f', '#9fb8ff'], odul: 'Gözlem yıldızı', kahraman: 'Ada', rehber: 'Gözlemci Nehir Hoca', kapi: 'Kubbe kapağı', kapiN: 5, mod: 'normal', tip: ['grup', 'sira', 'hata'],
      hikaye: 'Okulun çatısındaki gözlem kubbesinde istasyonlar sırayla açılır. Ada, gözlem defterini doldurdukça kubbenin kapağı biraz daha aralanır.', sahne: 'kubbe'},
    6: {ad: 'Kervan Yolu', alt: 'Durak durak ilerleme', renk: ['#7a4a1c', '#f1c27d'], odul: 'Kervan mührü', kahraman: 'Can', rehber: 'Kervanbaşı Rüzgâr Usta', kapi: 'Han kapısı', kapiN: 5, mod: 'normal', tip: ['sira', 'esles', 'bosluk'],
      hikaye: 'Bir bilgi kervanı uzun bir yola çıkıyor. Her durakta Can, yolculuğa devam edebilmek için yükleri doğru bilgilerle düzenlemek zorunda.', sahne: 'kervan'},
    7: {ad: 'Zaman Kapıları', alt: 'Kronoloji ve kapı şifreleri', renk: ['#3b2a5c', '#c7a6ff'], odul: 'Zaman anahtarı', kahraman: 'Zeynep', rehber: 'Saatçi Kemal Dede', kapi: 'Zaman kapısı', kapiN: 6, mod: 'normal', tip: ['sira', 'bosluk', 'hata'],
      hikaye: 'Eski saat kulesinin dibinde birbirine açılan kapılar var. Zeynep her kapının şifresini, o bölümün bilgilerini doğru sıraya koyarak çözüyor.', sahne: 'kapilar'},
    8: {ad: 'LGS Kulesi', alt: 'Süreli kat sınavları', renk: ['#123c4a', '#7fd6e3'], odul: 'Kat arması', kahraman: 'Mert', rehber: 'Kule bekçisi Selin', kapi: 'Kat sınavı (süreli)', kapiN: 8, mod: 'sureli', sure: 40, tip: ['hata', 'bosluk', 'esles'],
      hikaye: 'LGS Kulesi\'nin her katı bir ünite. Mert, bir üst kata çıkmak için kat sınavını süre dolmadan geçmeli. Yanlışlar tekrar listesine düşer.', sahne: 'kule'},
    9: {ad: 'Akademi Arşivi', alt: 'Belge inceleme ve kanıt eşleştirme', renk: ['#3a3226', '#e2c48a'], odul: 'Arşiv belgesi', kahraman: 'Defne', rehber: 'Arşivci Tarık Hoca', kapi: 'Arşiv dairesi kapısı', kapiN: 6, mod: 'normal', tip: ['esles', 'hata', 'grup'], kanit: true,
      hikaye: 'Akademinin arşivinde dağılmış belgeler var. Defne her dairede belgeleri inceleyip kavramları doğru açıklamalarla eşleştirerek arşivi düzenliyor.', sahne: 'arsiv'},
    10: {ad: 'Medeniyet Atlası', alt: 'Bölge keşfi ve sınıflandırma', renk: ['#1f4d3a', '#9ee0bf'], odul: 'Atlas paftası', kahraman: 'Kerem', rehber: 'Haritacı Lale', kapi: 'Pafta mührü', kapiN: 6, mod: 'normal', tip: ['grup', 'esles', 'sira'], kanit: true,
      hikaye: 'Eski bir atlasın paftaları kaybolmuş. Kerem ve Haritacı Lale, her bölgenin bilgisini toplayıp paftaları yeniden birleştiriyor.', sahne: 'atlas'},
    11: {ad: 'Düşünce Konseyi', alt: 'Yanlış iddiayı bulma ve gerekçe', renk: ['#4a2430', '#f0a9b8'], odul: 'Konsey nişanı', kahraman: 'Ece', rehber: 'Konsey sözcüsü Yusuf', kapi: 'Konsey oturumu', kapiN: 6, mod: 'gerekce', tip: ['hata', 'esles', 'bosluk'], kanit: true,
      hikaye: 'Okulun düşünce konseyinde her oturum bir ünitenin konusunu tartışıyor. Ece, yanlış iddiaları ayıklayıp doğru gerekçeyi bularak oturumu kapatıyor.', sahne: 'konsey'},
    12: {ad: 'Mezuniyet Projesi', alt: 'Proje panoları ve sentez', renk: ['#24324f', '#f3d38a'], odul: 'Proje madalyası', kahraman: 'Deniz', rehber: 'Danışman Aslı Hoca', kapi: 'Proje sunumu', kapiN: 8, mod: 'normal', tip: ['sira', 'grup', 'esles'], kanit: true,
      hikaye: 'Mezuniyete az kaldı. Deniz, her üniteden bir proje panosu hazırlıyor; panolar tamamlandıkça sunum salonu açılıyor.', sahne: 'proje'}
  };
  // sahne: basit, hafif SVG (her sınıfa özgü); bölgeye göre ton kayar
  D.sahne = function (g, i) {
    const c = D.D[g], [k, a] = c.renk, h = (i || 0) * 23;
    const gok = `<defs><linearGradient id="dg${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${k}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs><rect width="400" height="220" fill="url(#dg${g})"/>`;
    const S = {
      bahce: `<circle cx="${320 - h}" cy="48" r="22" fill="#fff6c8" opacity=".9"/>${[0, 1, 2, 3, 4].map((j) => `<g transform="translate(${30 + j * 82},${150 - (j % 2) * 18})"><rect x="-4" y="0" width="8" height="40" fill="#5b3b1f"/><circle cx="0" cy="-8" r="${24 + (j % 3) * 4}" fill="${['#3f8f5a', '#5aa86e', '#2f7a4c'][j % 3]}"/></g>`).join('')}<rect y="190" width="400" height="30" fill="#3d6b3a"/>`,
      kubbe: `${Array.from({length: 26}, (_, j) => `<circle cx="${(j * 53 + h) % 400}" cy="${(j * 37) % 120 + 8}" r="${j % 3 ? 1.2 : 2}" fill="#fff"/>`).join('')}<path d="M90 200 Q200 40 310 200z" fill="#e8ecf8" opacity=".9"/><path d="M200 70v-30" stroke="#e8ecf8" stroke-width="4"/><rect y="196" width="400" height="24" fill="#2a355f"/>`,
      kervan: `<circle cx="70" cy="50" r="24" fill="#ffe0a3"/><path d="M0 180 Q100 150 200 175 T400 165 V220 H0z" fill="#d79a52"/>${[0, 1, 2].map((j) => `<g transform="translate(${150 + j * 70 - h % 30},150)"><ellipse cx="0" cy="0" rx="22" ry="12" fill="#8a5a2b"/><rect x="-14" y="8" width="5" height="16" fill="#6b4420"/><rect x="9" y="8" width="5" height="16" fill="#6b4420"/><rect x="-10" y="-18" width="20" height="10" rx="3" fill="#c0392b"/></g>`).join('')}`,
      kapilar: `${[0, 1, 2, 3].map((j) => `<g transform="translate(${40 + j * 92},70)"><path d="M0 130V40a30 30 0 0 1 60 0v90z" fill="#2a1d44" stroke="#c7a6ff" stroke-width="2"/><circle cx="30" cy="20" r="${6 + j}" fill="none" stroke="#e8dcff" stroke-width="1.5"/></g>`).join('')}<rect y="200" width="400" height="20" fill="#241a38"/>`,
      kule: `${[0, 1, 2, 3, 4, 5].map((j) => `<rect x="${150 + j * 2}" y="${190 - j * 30}" width="${100 - j * 4}" height="28" rx="3" fill="${j % 2 ? '#1d5566' : '#246b80'}" stroke="#7fd6e3" stroke-width="1"/>`).join('')}<path d="M170 20h60l-30-18z" fill="#7fd6e3"/><rect y="200" width="400" height="20" fill="#0f2f3a"/>`,
      arsiv: `${[0, 1, 2, 3, 4].map((j) => `<g transform="translate(${20 + j * 76},40)"><rect width="66" height="160" fill="#5a4630" stroke="#e2c48a" stroke-width="1"/>${[0, 1, 2, 3].map((r) => `<rect x="6" y="${10 + r * 38}" width="54" height="26" fill="${['#8a5a3c', '#3c5a7a', '#6b7a3c', '#7a3c5a'][(r + j) % 4]}"/>`).join('')}</g>`).join('')}`,
      atlas: `<path d="M20 40 L140 20 L260 40 L380 20 V190 L260 210 L140 190 L20 210z" fill="#efe6c8" stroke="#1f4d3a" stroke-width="2"/><path d="M60 80 Q120 50 170 90 T300 100 Q340 130 330 170" fill="none" stroke="#2e8f68" stroke-width="3" stroke-dasharray="6 6"/>${[0, 1, 2, 3].map((j) => `<circle cx="${80 + j * 80}" cy="${90 + (j % 2) * 50}" r="8" fill="#c0392b"/>`).join('')}`,
      konsey: `${[0, 1, 2, 3, 4].map((j) => `<path d="M${30 + j * 72} 200V80a30 30 0 0 1 60 0v120" fill="none" stroke="#f0a9b8" stroke-width="3"/>`).join('')}<ellipse cx="200" cy="190" rx="120" ry="16" fill="#6b3442"/><rect y="200" width="400" height="20" fill="#3a1c26"/>`,
      proje: `${[0, 1, 2].map((j) => `<g transform="translate(${30 + j * 120},40)"><rect width="100" height="120" rx="6" fill="#f7f1e3" stroke="#f3d38a" stroke-width="2"/><rect x="10" y="12" width="80" height="10" fill="#24324f"/><rect x="10" y="32" width="60" height="6" fill="#8a96b3"/><rect x="10" y="46" width="70" height="6" fill="#8a96b3"/><circle cx="50" cy="90" r="16" fill="none" stroke="#24324f" stroke-width="3"/></g>`).join('')}<path d="M330 30l12 8-12 8" fill="#f3d38a"/>`
    };
    return `<svg class="d45-sv" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${gok}${S[c.sahne] || ''}</svg>`;
  };

  /* ---------- 2. Veri (yalnız kaynak sınıfı A/B olan kayıtlar) ---------- */
  const ok = (col, x) => x && vis(x) && !V45.KD.editorGerekli(col, x);
  D.uniteler = (g) => { try { return V39.units(g, V39.pv(g)); } catch (e) { return []; } };
  D.veri = function (uid) {
    if (D._v && D._v[uid]) return D._v[uid];
    const T = Store.all('topics').filter((t) => t.unitId === uid && vis(t)), tid = new Set(T.map((t) => t.id));
    const notlar = [];
    T.forEach((t) => (t.sections && Array.isArray(t.sections.anlatim) ? t.sections.anlatim : []).forEach((x, i) => { const k = V45.KD.blok(t, 'anlatim', i); if (k.kat === 'A' && duz(x.p).length > 60) notlar.push({id: t.id + '#' + i, baslik: x.h || t.title, metin: duz(x.p), konu: t.title, tid: t.id, kaynak: (t.dogrulama && t.dogrulama.kaynak) || 'ders kitabı', oc: t.outcomeIds || []}); }));
    const sorular = Store.all('questions').filter((q) => tid.has(q.topicId) && ok('questions', q) && (q.options || []).length >= 3 && typeof q.answer === 'number');
    const oyunlar = Store.all('games').filter((x) => x.unitId === uid && x.dogrulama && ok('games', x));
    const kartlar = Store.all('flashcards').filter((c) => tid.has(c.topicId) && ok('flashcards', c) && String(c.answer || '').length < 120);
    return (D._v = D._v || {})[uid] = {T, notlar, sorular, oyunlar, kartlar};
  };
  const GOREV = {grouping: 'grup', matching: 'esles', ordering: 'sira', olay: 'sira', eksik: 'bosluk', hata: 'hata'};
  const GAD = {grup: 'Sınıflandır', esles: 'Eşleştir', sira: 'Sırala', bosluk: 'Eksik parçayı tamamla', hata: 'Yanlış bilgiyi bul'};
  D.bulmacaVerisi = function (tip, g) {
    if (tip === 'grup') { const I = kar(g.items || []).slice(0, 6); return {categories: (g.categories || []).filter((c) => I.some((x) => x.cat === c)), items: I, talimat: g.prompt || 'Her ifadeyi ait olduğu gruba yerleştir.'}; }
    if (tip === 'esles') return {pairs: kar(g.pairs || []).slice(0, 5), talimat: g.prompt || 'Soldaki kavramı sağdaki karşılığıyla eşleştir.'};
    if (tip === 'sira') { const it = (g.items || []).map((s) => String(s).replace(/^\s*\d+\s*[–-]\s*/, '')); const n = Math.min(5, it.length), b = Math.floor(Math.random() * (it.length - n + 1)); return {items: it.slice(b, b + n), talimat: (g.prompt || 'Doğru sıraya diz.') + (n < it.length ? ` (Ardışık ${n} adım.)` : '')}; }
    if (tip === 'bosluk') return {items: kar(g.items || []).slice(0, 3)};
    if (tip === 'hata') return {rounds: kar(g.rounds || []).slice(0, 2)};
  };
  // bölgenin noktaları (deterministik: bölge kimliğinden)
  D.noktalar = function (g, uid) {
    const c = D.D[g], v = D.veri(uid), L = [];
    const tohum = [...uid].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7), sec = (A, n) => { const B = A.slice().sort((x, y) => ((x.id || '') + tohum).localeCompare((y.id || '') + tohum)); return B.slice(0, n); };
    sec(v.notlar, 2).forEach((n, i) => L.push({id: 'not' + i, tur: 'not', ad: 'Bulunan not', veri: n}));
    if (v.sorular.length) L.push({id: 'kar0', tur: 'karakter', ad: c.rehber, veri: sec(v.sorular, 1)[0]});
    const tipler = c.tip, oy = v.oyunlar.filter((x) => GOREV[x.gameType]);
    const bul = tipler.map((t) => oy.find((x) => GOREV[x.gameType] === t)).filter(Boolean)[0] || oy[0];
    if (bul) L.push({id: 'bul0', tur: 'bulmaca', ad: GAD[GOREV[bul.gameType]], veri: bul});
    if (c.kanit && v.kartlar.length >= 4) L.push({id: 'kan0', tur: 'kanit', ad: 'Kanıt eşleştir', veri: sec(v.kartlar, 4)});
    if (v.sorular.length > 1) L.push({id: 'kar1', tur: 'karakter', ad: c.kahraman, veri: sec(v.sorular, 2)[1]});
    return L;
  };
  D.kapiSorulari = (g, uid) => kar(D.veri(uid).sorular).slice(0, D.D[g].kapiN);

  /* ---------- 3. Kayıt ---------- */
  const KID = 'dunya45';
  D.kayit = (g) => { const k = V41.bolumKayit(KID, 'g' + g); return k && k.v === 1 ? k : {v: 1, bolge: {}, gunce: [], t: ''}; };
  D.yaz = (g, k) => { k.t = new Date().toISOString(); V41.bolumYaz(KID, 'g' + g, k); };
  D.bolgeDurum = (g, uid, k) => { const B = (k.bolge[uid] = k.bolge[uid] || {n: {}, kapi: null, bitti: false}); return B; };
  D.acikMi = (g, i, k) => { if (i === 0) return true; const U = D.uniteler(g), onc = U[i - 1]; return !!(onc && k.bolge[onc.id] && k.bolge[onc.id].bitti); };

  /* ---------- 4. Ekranlar ---------- */
  let KOK = null, G_ = 0, U_ = null, sayac = null, kalan = 0, durdu = false;
  const ekran = (ic, cls) => { if (!KOK) return; KOK.innerHTML = `<div class="g44-ekran d45 d45-g${G_} ${cls || ''}" style="--d45a:${D.D[G_].renk[0]};--d45b:${D.D[G_].renk[1]}">${ic}</div>`; };
  const ust = (b, a) => `<header class="g44-ust"><button type="button" class="g44-ib" onclick="V41.duraklat('kullanici')" aria-label="Menü — oyunu duraklat">${SV('<path d="M8 5v14M16 5v14"/>', 18)}<span>Menü</span></button><div class="g44-ub"><small>${esc(a || '')}</small><b>${esc(b)}</b></div><button type="button" class="g44-ib" onclick="V45.Dunya.harita()" aria-label="Haritaya dön">${sv('harita', 18)}<span>Harita</span></button></header>`;
  D.secim = function () { // sınıf seçimi (bölüm listesi)
    const gr = Object.keys(D.D).map(Number);
    KOK.innerHTML = `<div class="g44-ekran d45 d45-sec">${`<header class="g44-ust"><button type="button" class="g44-ib" onclick="V41.duraklat('kullanici')">${SV('<path d="M8 5v14M16 5v14"/>', 18)}<span>Menü</span></button><div class="g44-ub"><small>Oyun Dünyası</small><b>Sınıf Dünyaları</b></div><button type="button" class="g44-ib" onclick="go('poyun')">Merkez</button></header>`}
<div class="g44-ic"><p class="g44-mut">Her sınıfın kendi dünyası var. Bölgeler ünitelerdir; noktaları keşfet, karakterlerle konuş, bulmacaları çöz ve bölge kapısını aç. Bilgiler ders kitabıyla doğrulanmış kayıtlardan gelir.</p>
<div class="d45-gr">${gr.map((g) => { const c = D.D[g], k = D.kayit(g), U = D.uniteler(g), b = U.filter((u) => k.bolge[u.id] && k.bolge[u.id].bitti).length; return `<button type="button" class="d45-gk" style="--d45a:${c.renk[0]};--d45b:${c.renk[1]}" onclick="go('poyna',{oyn:'dunya45',obol:'g${g}',odevam:0})"><span class="d45-gs">${D.sahne(g, 0)}</span><span class="d45-gt"><small>${g}. sınıf</small><b>${esc(c.ad)}</b><span>${esc(c.alt)}</span><em>${b} / ${U.length} bölge</em></span></button>`; }).join('')}</div></div></div>`;
  };
  D.harita = function () {
    if (!KOK) return; durSay(); U_ = null; const g = G_, c = D.D[g], k = D.kayit(g), U = D.uniteler(g);
    const toplam = U.length, bitti = U.filter((u) => k.bolge[u.id] && k.bolge[u.id].bitti).length;
    ekran(`${ust(c.ad, g + '. sınıf · ' + V39.pyName(V39.pv(g)).replace(/ \(.*/, ''))}<div class="d45-kapak">${D.sahne(g, 0)}<div class="d45-kt"><b>${esc(c.ad)}</b><span>${esc(c.hikaye)}</span></div></div>
<div class="g44-ic"><div class="d45-ozet"><span>${sv('harita', 16)} ${bitti} / ${toplam} bölge</span><span>${sv('yildiz', 16)} ${bitti} ${esc(c.odul)}</span><button type="button" class="g44-b" onclick="V45.Dunya.gunce()">${sv('gunce', 16)} Günce (${k.gunce.length})</button></div>
<ol class="d45-yol">${U.map((u, i) => { const B = k.bolge[u.id] || {n: {}}, ac = D.acikMi(g, i, k), N = D.noktalar(g, u.id), yap = N.filter((x) => B.n && B.n[x.id]).length; return `<li class="${B.bitti ? 'bitti' : ac ? 'acik' : 'kilitli'}"><button type="button" class="d45-bolge" ${ac ? '' : 'disabled'} onclick="V45.Dunya.bolge('${u.id}')"><span class="d45-no">${B.bitti ? sv('ok', 18) : ac ? u.order : sv('kilit', 16)}</span><span class="d45-bt"><b>${esc(u.title)}</b><small>${ac ? `${yap} / ${N.length} nokta · ${B.kapi ? `kapı ${'★'.repeat(B.kapi.yildiz)}` : c.kapi}` : 'Önceki bölgeyi tamamla'}</small></span></button></li>`; }).join('')}</ol>
${U.length ? '' : '<p>Bu sınıf için ünite verisi bulunmuyor. Kaynakta veri bulunmuyor.</p>'}</div>`, 'harita');
  };
  D.gunce = function () {
    const g = G_, k = D.kayit(g), L = k.gunce.map((id) => { const [tid, i] = id.split('#'); const t = Store.get('topics', tid), x = t && t.sections && t.sections.anlatim && t.sections.anlatim[+i]; return x ? {t, x} : null; }).filter(Boolean);
    ekran(`${ust('Günce', D.D[g].ad)}<div class="g44-ic"><p class="g44-mut">Keşfettiğin notlar burada. Her not ders kitabıyla doğrulanmış bir anlatım paragrafıdır.</p>${L.length ? L.map(({t, x}) => `<article class="d45-not"><small>${esc(t.title)}</small><h3>${esc(x.h || t.title)}</h3><p>${esc(duz(x.p))}</p><p class="d45-kay">Kaynak: ${esc((t.dogrulama && t.dogrulama.kaynak) || 'ders kitabı')}</p><button type="button" class="g44-b" onclick="V44.icerikAc('${t.id}','anlat')">Konuyu aç</button></article>`).join('') : '<p>Henüz not bulmadın. Bölgelerdeki not noktalarını keşfet.</p>'}<div class="g44-ara"><button type="button" class="g44-b" onclick="V45.Dunya.harita()">Haritaya dön</button></div></div>`);
  };
  D.bolge = function (uid) {
    durSay(); U_ = uid; const g = G_, c = D.D[g], k = D.kayit(g), U = D.uniteler(g), i = U.findIndex((u) => u.id === uid), u = U[i]; if (!u) return D.harita();
    const B = D.bolgeDurum(g, uid, k), N = D.noktalar(g, uid), hepsi = N.every((x) => B.n[x.id]), kS = D.kapiSorulari(g, uid).length;
    const yer = [[14, 58], [36, 30], [58, 62], [78, 34], [88, 70], [24, 80]];
    ekran(`${ust(u.title, c.ad + ' · ' + u.order + '. bölge')}<div class="d45-sahne">${D.sahne(g, i)}${N.map((x, j) => `<button type="button" class="d45-nk ${B.n[x.id] ? 'tamam' : ''}" style="left:${yer[j % 6][0]}%;top:${yer[j % 6][1]}%" onclick="V45.Dunya.nokta('${x.id}')" aria-label="${esc(x.ad)}${B.n[x.id] ? ' (tamamlandı)' : ''}">${sv(x.tur === 'not' ? 'not' : x.tur === 'karakter' ? 'kisi' : x.tur === 'kanit' ? 'kanit' : 'bulmaca', 20)}</button>`).join('')}</div>
<div class="g44-ic"><p class="d45-hik">${esc(c.kahraman)}: “${esc(D.repl(c, u))}”</p>
<ul class="d45-nl">${N.map((x) => `<li><button type="button" class="d45-nb ${B.n[x.id] ? 'tamam' : ''}" onclick="V45.Dunya.nokta('${x.id}')">${sv(B.n[x.id] ? 'ok' : x.tur === 'not' ? 'not' : x.tur === 'karakter' ? 'kisi' : x.tur === 'kanit' ? 'kanit' : 'bulmaca', 18)}<span><b>${esc(x.ad)}</b><small>${esc(D.NTUR[x.tur])}</small></span></button></li>`).join('')}
<li><button type="button" class="d45-nb kapi ${B.kapi ? 'tamam' : ''}" ${hepsi ? '' : 'disabled'} onclick="V45.Dunya.kapi()">${sv(B.kapi ? 'ok' : hepsi ? 'kapi' : 'kilit', 18)}<span><b>${esc(c.kapi)}</b><small>${kS >= 3 ? (hepsi ? `${kS} soruluk bölge sonu mücadelesi${c.mod === 'sureli' ? ' · süreli' : ''}` : 'Önce bütün noktaları tamamla') : 'Kaynak verisi eksik: bu ünitede yeterli doğrulanmış soru yok'}</small></span></button></li></ul>
${N.length ? '' : '<p class="g44-mut">Bu ünitede kaynakla doğrulanmış not, soru ya da etkinlik bulunamadı. Kaynakta veri bulunmuyor.</p>'}
<div class="d45-panel" id="d45p" aria-live="polite"></div></div>`, 'bolge');
  };
  D.NTUR = {not: 'Keşif: kitapla doğrulanmış not', karakter: 'Diyalog ve soru', bulmaca: 'Bulmaca', kanit: 'Kanıt eşleştirme'};
  D.repl = (c, u) => [`Bu bölgenin adı “${u.title}”. ${c.rehber} noktaların her birinde bir ipucu saklandığını söylüyor.`, `${c.kapi} ancak bütün noktalar tamamlanınca açılıyor. Hadi başlayalım.`][u.order % 2];
  const panel = () => document.getElementById('d45p');
  const isaretle = (x, sonra) => { const g = G_, k = D.kayit(g), B = D.bolgeDurum(g, U_, k); B.n[x.id] = 1; if (x.tur === 'not' && !k.gunce.includes(x.veri.id)) k.gunce.push(x.veri.id); D.yaz(g, k); if (sonra) sonra(); };
  D.nokta = function (nid) {
    const g = G_, c = D.D[g], x = D.noktalar(g, U_).find((n) => n.id === nid), P = panel(); if (!x || !P) return;
    const kapat = `<div class="g44-ara"><button type="button" class="g44-b p" onclick="V45.Dunya.bolge('${U_}')">Devam</button></div>`;
    if (x.tur === 'not') {
      const n = x.veri; P.innerHTML = `<article class="d45-not acil"><small>Bulunan not · ${esc(n.konu)}</small><h3>${esc(n.baslik)}</h3><p>${esc(n.metin)}</p><p class="d45-kay">Kaynak: ${esc(n.kaynak)} · kitapla doğrulandı</p>${kapat}</article>`;
      isaretle(x);
    } else if (x.tur === 'karakter') {
      const q = x.veri, sira = kar(q.options.map((o, i) => i));
      P.innerHTML = `<div class="d45-dy"><div class="d45-av" aria-hidden="true">${esc(x.ad.charAt(0))}</div><div><b>${esc(x.ad)}</b><p>“Yolun devamı için şu soruyu birlikte çözelim.”</p></div></div><p class="g44-tal">${esc(q.text)}</p><div class="g44-sec">${sira.map((i) => `<button type="button" class="g44-kart" data-i="${i}">${esc(q.options[i])}</button>`).join('')}</div><div class="g44-bil" aria-live="polite"></div>`;
      P.querySelectorAll('[data-i]').forEach((b) => b.onclick = () => { const i = +b.dataset.i, d = i === q.answer, bil = P.querySelector('.g44-bil'); try { MT.rec(q, i); Store.save(); } catch (e) {}
        if (d) { b.classList.add('dogru'); P.querySelectorAll('[data-i]').forEach((y) => y.disabled = true); bil.className = 'g44-bil iyi'; bil.textContent = 'Doğru. ' + (q.explanation || ''); isaretle(x, () => P.insertAdjacentHTML('beforeend', kapat)); }
        else { b.disabled = true; bil.className = 'g44-bil uyari'; bil.textContent = (q.optionNotes && q.optionNotes[i]) || 'Bu seçenek değil; bir daha dene.'; } });
    } else if (x.tur === 'bulmaca' || x.tur === 'kanit') {
      const tip = x.tur === 'kanit' ? 'esles' : GOREV[x.veri.gameType], veri = x.tur === 'kanit' ? {pairs: x.veri.map((cd) => [cd.question, cd.answer]), talimat: 'Her soruyu doğru açıklamayla eşleştir.'} : D.bulmacaVerisi(tip, x.veri);
      const kay = x.tur === 'kanit' ? 'Bilgi kartları (kaynaktan türetildi)' : x.veri.title;
      P.innerHTML = `<div class="g44-gb"><small>${esc(x.ad)}</small><span class="g44-kay">Kaynak: ${esc(kay)}</span></div><div class="g44-alan"></div><div class="g44-bil" aria-live="polite"></div><div class="g44-ara"><button type="button" class="g44-b" data-ip="1">İpucu</button></div>`;
      const ctx = {kazanim: x.tur === 'kanit' ? [...new Set(x.veri.flatMap((cd) => cd.outcomeIds || []))] : (x.veri.outcomeIds || []), talimat: tip === 'bosluk' ? 'Boşluğa gelecek kavramı seç.' : tip === 'hata' ? 'Bilgisi yanlış olan kartı bul.' : '', bildir(t, m) { const b = P.querySelector('.g44-bil'); if (b) { b.className = 'g44-bil ' + t; b.textContent = m; } }};
      const gorev = V44.Gorev[tip](P.querySelector('.g44-alan'), veri, () => { try { Store.save(); } catch (e) {} isaretle(x, () => { ctx.bildir('iyi', 'Bulmaca çözüldü.'); P.insertAdjacentHTML('beforeend', kapat); }); }, ctx);
      P.querySelector('[data-ip]').onclick = () => { if (!gorev || !gorev.ipucuIste || !gorev.ipucuIste()) ctx.bildir('bilgi', 'Başka ipucu yok.'); };
    }
    try { P.scrollIntoView({block: 'start', behavior: 'smooth'}); } catch (e) {}
  };
  // bölge sonu mücadelesi
  function durSay() { if (sayac) { clearInterval(sayac); sayac = null; } }
  D.kapi = function () {
    const g = G_, c = D.D[g], Q = D.kapiSorulari(g, U_); let i = 0, dogru = 0; const P = panel(); if (!P) return;
    if (Q.length < 3) { P.innerHTML = '<p>Kaynak verisi eksik: bu ünitede bölge sonu mücadelesi için yeterli kaynak doğrulamalı soru yok. Bölge noktaları tamamlanınca bölge tamamlanmış sayılır.</p>'; const k = D.kayit(g), B = D.bolgeDurum(g, U_, k); B.bitti = true; D.yaz(g, k); P.insertAdjacentHTML('beforeend', `<div class="g44-ara"><button type="button" class="g44-b p" onclick="V45.Dunya.harita()">Haritaya dön</button></div>`); return; }
    kalan = c.mod === 'sureli' ? c.sure * Q.length : 0;
    const ciz = () => {
      const q = Q[i], sira = kar(q.options.map((o, j) => j));
      P.innerHTML = `<div class="d45-dy"><div class="d45-av" aria-hidden="true">${esc(c.rehber.charAt(0))}</div><div><b>${esc(c.kapi)}</b><p>Soru ${i + 1} / ${Q.length}${c.mod === 'gerekce' ? ' · cevaptan sonra gerekçeyi oku' : ''}</p></div>${kalan ? `<span class="d45-sure" id="d45s">${sv('sure', 16)} ${kalan} sn</span>` : ''}</div><p class="g44-tal">${esc(q.text)}</p><div class="g44-sec">${sira.map((j) => `<button type="button" class="g44-kart" data-i="${j}">${esc(q.options[j])}</button>`).join('')}</div><div class="g44-bil" aria-live="polite"></div>`;
      P.querySelectorAll('[data-i]').forEach((b) => b.onclick = () => { const j = +b.dataset.i, d = j === q.answer, bil = P.querySelector('.g44-bil'); try { MT.rec(q, j); Store.save(); } catch (e) {} if (d) dogru++;
        P.querySelectorAll('[data-i]').forEach((y) => { y.disabled = true; if (+y.dataset.i === q.answer) y.classList.add('dogru'); });
        bil.className = 'g44-bil ' + (d ? 'iyi' : 'uyari'); bil.textContent = (d ? 'Doğru. ' : 'Yanlış. ') + (q.explanation || '') + (!d && q.optionNotes && q.optionNotes[j] ? ' · ' + q.optionNotes[j] : '');
        P.insertAdjacentHTML('beforeend', `<div class="g44-ara"><button type="button" class="g44-b p" id="d45n">${i + 1 < Q.length ? 'Sonraki soru' : 'Sonucu gör'}</button></div>`);
        document.getElementById('d45n').onclick = () => { i++; if (i < Q.length) ciz(); else bitir(); }; });
    };
    const bitir = (sureBitti) => {
      durSay(); const k = D.kayit(g), B = D.bolgeDurum(g, U_, k), oran = dogru / Q.length, puan = Math.round(100 * oran), y = oran >= 0.9 ? 3 : oran >= 0.7 ? 2 : oran >= 0.5 ? 1 : 0, gecti = oran >= 0.7;
      if (gecti) { if (!B.kapi || puan > B.kapi.puan) B.kapi = {puan, yildiz: Math.max(1, y), t: new Date().toISOString()}; B.bitti = true; D.yaz(g, k); }
      P.innerHTML = `<div class="d45-son ${gecti ? 'gecti' : ''}">${gecti ? `<div class="d45-odul" aria-hidden="true">${[0, 1, 2, 3, 4, 5].map((j) => `<i style="--r:${j * 60}deg"></i>`).join('')}${sv('yildiz', 44)}</div><h3>${esc(c.kapi)} açıldı</h3><p>${esc(c.odul)} kazandın · ${puan} puan</p>` : `<h3>${sureBitti ? 'Süre doldu' : 'Kapı henüz açılmadı'}</h3><p>${dogru} / ${Q.length} doğru (en az %70 gerekir). Yanlış soruların tekrar listende.</p>`}
<div class="g44-ara">${gecti ? `<button type="button" class="g44-b p" onclick="V45.Dunya.harita()">Haritaya dön</button>` : `<button type="button" class="g44-b p" onclick="V45.Dunya.kapi()">Tekrar dene</button><button type="button" class="g44-b" onclick="V45.Dunya.bolge('${U_}')">Bölgeye dön</button>`}</div></div>`;
    };
    if (kalan) sayac = setInterval(() => { if (durdu) return; kalan--; const s = document.getElementById('d45s'); if (s) s.lastChild.textContent = ' ' + kalan + ' sn'; if (kalan <= 0) bitir(true); }, 1000);
    ciz();
  };

  /* ---------- 5. Motor kaydı ---------- */
  V44.Motor.kaydol({
    id: KID, ad: 'Sınıf Dünyaları', kategori: 'hibrit', sira: 4, afis: 'background:linear-gradient(160deg,#2b3d5a,#1b2433)',
    ozet: 'Her sınıfın kendi dünyası: Işık Bahçesi’nden Mezuniyet Projesi’ne. Bölgeleri keşfet, karakterlerle konuş, bulmacaları çöz, bölge kapısını aç.',
    bolumler: () => Object.keys(D.D).map(Number).map((g) => { const U = D.uniteler(g); return {id: 'g' + g, sinif: g, program: V39.pv(g), ad: D.D[g].ad, alt: D.D[g].alt, hazir: U.length > 0, odaSay: U.length, neden: 'Ünite verisi bulunmuyor.'}; }),
    initialize(kok, bolum) { KOK = kok; durdu = false; G_ = bolum && /^g\d+$/.test(bolum) ? +bolum.slice(1) : 0; if (!D.D[G_]) G_ = 0; },
    load() {}, start() { if (!G_) D.secim(); else D.harita(); },
    pause() { durdu = true; }, resume() { durdu = false; },
    restart() { if (!G_ || !U_) { UI.toast('Bölge içinde “Bölgeyi baştan başlat” kullanılabilir.'); return; } const k = D.kayit(G_); k.bolge[U_] = {n: {}, kapi: null, bitti: false}; D.yaz(G_, k); D.bolge(U_); },
    save() {}, finish() {}, destroy() { durSay(); KOK = null; U_ = null; }
  });
  // hub: kayıtlardaki yıldız toplamı için dünya bölümlerinin yıldızı = tamamlanan bölge kapılarının yıldızı
  const prof0 = V44.profil;
  V44.profil = function () {
    const P = prof0.apply(this, arguments); let y = 0, en = 0;
    Object.keys(D.D).forEach((g) => { const k = D.kayit(+g); Object.values(k.bolge).forEach((b) => { if (b.kapi) y += b.kapi.yildiz; if (b.bitti && b.kapi) P.kayitlar.push({oyun: KID, bolum: 'g' + g, seviye: 'kapi', yildiz: b.kapi.yildiz, t: b.kapi.t}); }); en += D.uniteler(+g).length * 3; });
    P.hibrit.yildiz += y; P.hibrit.en += en; return P;
  };
})();
