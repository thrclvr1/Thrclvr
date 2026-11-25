/* ===================== V55.0 (3/3): oyunlar — gruplu oyun merkezi, tutarlı adlar, Sınıf Dünyaları (Işık Bahçesi) =====================
   • Altın Oyun Dünyası (poyun) başında tek, gruplu merkez .ao55: Kısa bilgi ve kelime oyunları · Yarışma oyunları ·
     Takım oyunları · Hikâyeli ve keşif oyunları. Kısa kartlar; her kart oyunu doğrudan açar. V54 “Altın Oyunları” kutusu
     (başlık çubuğunun üstüne yerleşiyordu) ve V44 uzun listeler yerine; oyun puanları/görevler aşağıda kalır.
   • Ad tutarlılığı: Elmas etkinlik listesinde iki farklı oyun “Zaman Yolculuğu” adını taşıyordu (V54: Sıralama + Olayı Sırala).
     Sıralama türü “Sıralama” adıyla kalır; “Zaman Yolculuğu” yalnız tarihî olay sıralaması.
   • Sınıf Dünyaları (V45; 4. sınıf Işık Bahçesi): her keşif noktasının kendi yeri ve görevi var (aynı adlı “Bulunan not”
     kartları yok; aynı not iki kez seçilmez); harita üzerinde numaralı yol, tamamlanan/sıradaki işaretleri; bölge ilerleme
     çubuğu; rehberin anlatımıyla görev akışı (giriş → görevler → kapı); her görevden sonra “Sıradaki görev” düğmesi;
     dünya haritasında genel ilerleme ve “Devam et”. İçerik yine yalnız kaynakla doğrulanmış kayıtlardan (V45 kuralı). */
(function () {
  if (typeof V39 === 'undefined') return;
  const V55 = window.V55 = window.V55 || {};
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const SV = (p, s) => `<svg width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
  const TIK = '<path d="m5 12 5 5 9-10"/>', OK = '<path d="m9 6 6 6-6 6"/>';

  /* ---------- 1. ad tutarlılığı ---------- */
  try { if (window.V54 && V54.Duzen && V54.Duzen.ADLAR_OYUN) V54.Duzen.ADLAR_OYUN = V54.Duzen.ADLAR_OYUN.filter(([r]) => !/Sıralama/.test(String(r))); } catch (x) {}

  /* ---------- 2. gruplu oyun merkezi (Altın) ---------- */
  const OM = V55.Oyun = {};
  OM.sinif = () => { try { return (V55.Altin && V55.Altin.sinif()) || 0; } catch (x) { return 0; } };
  OM.cark = function () { go('games'); setTimeout(() => { try { if ((G.gf || {}).ty !== 'wheel') V33.tapType('wheel'); } catch (x) {} }, 350); };
  OM.GRUP = () => {
    const s = OM.sinif(), d = (window.V45 && V45.Dunya && V45.Dunya.D && V45.Dunya.D[s]) || null;
    return [
      ['Kısa bilgi ve kelime oyunları', [
        ['Beni Bul!', 'İpuçlarından şahsiyet, yer ya da kavramı bul.', "V54.Oyun.git('benibul')"],
        ['Gizemli Şahsiyet', 'Yalnız şahsiyetler: kim olduğunu bul.', "V54.Oyun.git('gizemli')"],
        ['Harf Halkası', 'Her harf için bir soru; süre ve pas.', "V54.Oyun.git('halka')"],
        ['Harf Avı', 'İpucundan kavramı harf harf bul.', "V54.Oyun.git('harf')"],
        ['Çark Çevirme', 'Çarkı çevir, çıkan soruyu yanıtla.', 'V55.Oyun.cark()']]],
      ['Yarışma oyunları', [
        ['Zirve Yarışı', 'Kolaydan zora 10 soru, iki joker.', "V54.Oyun.git('zirve')"],
        ['Bilgi Arenası', 'Kategori ve zorluk seç, yarış.', "V54.Oyun.git('arena')"]]],
      ['Takım oyunları', [
        ['Kelimeyi Anlat Bakalım', 'İki takım, yasaklı kelimeler, süre.', "V54.Oyun.git('anlat')"],
        ['Gizli Bilgin', 'Aynı cihazda 3–8 kişi: bilmeyeni bulun.', "V54.Oyun.git('gizli')"]]],
      ['Hikâyeli ve keşif oyunları', [
        [d ? d.ad : 'Sınıf Dünyaları', d ? `${s}. sınıfın dünyası: keşfet, konuş, kapıyı aç.` : 'Her sınıfın kendi dünyası.', d ? `go('poyna',{oyn:'dunya45',obol:'g${s}',odevam:0})` : "go('poyna',{oyn:'dunya45',obol:'',odevam:0})"],
        ['Kayıp Bilgeliğin Kütüphanesi', 'Ünite ünite mühürleri çöz.', "go('poyna',{oyn:'kutuphane',obol:'',odevam:0})"],
        ['Zamanın İzinde', 'Tarihî olayları doğru sıraya koy.', "go('poyna',{oyn:'zaman',obol:'',odevam:0})"],
        ['Bilgi Laboratuvarı', 'Sınıflandır, eşleştir, yanlışı bul.', "go('poyna',{oyn:'lab',obol:'',odevam:0})"]]]
    ];
  };
  OM.html = () => `<section class="ao55" aria-labelledby="ao55-h"><h2 id="ao55-h" class="ao55-bh">Oyunlar</h2>${OM.GRUP().map(([ad, L], i) => `<section class="ao55-g" aria-labelledby="ao55-g${i}"><h3 id="ao55-g${i}">${ad}</h3><div class="ao55-l">${L.map(([a, b, f]) => `<button type="button" class="ao55-k" onclick="${f}"><b>${e(a)}</b><small>${e(b)}</small>${SV(OK, 18)}</button>`).join('')}</div></section>`).join('')}
<button type="button" class="ao55-tum" onclick="go('games')">Bütün etkinlik oyunları (eşleştirme, gruplandırma, eksik kelime…) ${SV(OK, 16)}</button></section>`;
  OM.yerlestir = function () {
    if (view !== 'poyun' || !V39.on || $.querySelector('.ao55')) return;
    $.querySelectorAll('.ao54-h, .ao53-giris').forEach((x) => x.remove());
    const bas = $.querySelector('.o41-bas'); if (!bas) return;
    bas.insertAdjacentHTML('afterend', OM.html());
    // eski uzun listeler (bütün oyunlar yukarıdaki kartlarda) gizlenir; puanlar ve görevler aşağıda kalır
    $.querySelectorAll('h2.g44-kat, .o41-oyunlar').forEach((x) => x.classList.add('ao55-gizli'));
    const pr = $.querySelector('.g44-prof'), gv = $.querySelector('.g44-gorev'), son = $.querySelector('.ao55');
    if (pr || gv) { const h = document.createElement('h2'); h.className = 'ao55-bh ao55-pb'; h.textContent = 'Puanların ve görevlerin'; son.after(h); let y = h; [pr, gv].forEach((n) => { if (n) { y.after(n); y = n; } }); }
  };

  /* ---------- 3. Sınıf Dünyaları: yerler, harita yolu, görev akışı ---------- */
  const D = window.V45 && V45.Dunya;
  if (D && D._ic) {
    const I = D._ic;
    V55.Dunya = D;
    D.YER = {
      4: ['Yaşlı Çınar', 'Fısıldayan Çeşme', 'Gül Çardağı', 'Taş Köprü', 'Işık Fidanlığı', 'Kuş Yuvası'],
      5: ['Teleskop Odası', 'Yıldız Haritası', 'Gözlem Defteri', 'Saat Kulesi', 'Pusula Masası', 'Işık Penceresi'],
      6: ['Kuyu Başı', 'Han Avlusu', 'Çarşı Kapısı', 'Vaha', 'Köprü Başı', 'Yol Taşı'],
      7: ['Kum Saati', 'Mühürlü Kapı', 'Takvim Duvarı', 'Saat Çarkı', 'Eski Harita', 'Sarkaç'],
      8: ['Merdiven Başı', 'Kat Kütüphanesi', 'Sınav Salonu', 'Not Panosu', 'Pencere Kenarı', 'Çalışma Masası'],
      9: ['Belge Rafı', 'Mühür Masası', 'Okuma Salonu', 'Katalog Dolabı', 'Harita Çekmecesi', 'Defter Kutusu'],
      10: ['Kuzey Paftası', 'Liman', 'Dağ Geçidi', 'Nehir Kıyısı', 'Eski Şehir', 'Çöl Yolu'],
      11: ['Kürsü', 'Tartışma Masası', 'Kanıt Dolabı', 'Gerekçe Panosu', 'Dinleyici Sırası', 'Karar Defteri'],
      12: ['Fikir Panosu', 'Araştırma Masası', 'Sunum Salonu', 'Kaynak Rafı', 'Taslak Defteri', 'Danışma Odası']
    };
    D.GOREV = {not: ['Keşif notu', 'Saklı notu bul ve oku; Günce’ne eklenir.'], karakter: ['Karakterle konuş', 'Sorusunu doğru yanıtla.'], bulmaca: ['Bulmaca', 'Parçaları doğru yerleştir.'], kanit: ['Kanıt eşleştir', 'Soruları doğru açıklamalarla eşleştir.']};
    const n0 = D.noktalar;
    D.noktalar = function (g, uid) {
      const L = n0.apply(this, arguments), gor = new Set(), out = [];
      L.forEach((x) => {
        if (x.tur === 'not') { const k = (String(x.veri.baslik || '') + '|' + String(x.veri.metin || '').slice(0, 80)).toLocaleLowerCase('tr-TR'); if (gor.has(k) || gor.has(x.veri.id)) return; gor.add(k); gor.add(x.veri.id); }
        out.push(x);
      });
      const Y = D.YER[g] || D.YER[4];
      out.forEach((x, j) => { x.yer = Y[j % Y.length]; x.sira = j + 1; x.gad = (D.GOREV[x.tur] || ['Görev'])[0]; x.gack = x.tur === 'bulmaca' ? `${x.ad}: parçaları doğru yerleştir.` : x.tur === 'karakter' ? (x.ad === (D.D[g] || {}).kahraman ? `${x.ad} ile birlikte soruyu çöz.` : `${x.ad} ile konuş; sorusunu yanıtla.`) : (D.GOREV[x.tur] || ['', ''])[1]; });
      return out;
    };
    // harita üzerindeki konumlar (yüzde): yol soldan sağa kıvrılarak ilerler
    D.YOL = [[10, 74], [27, 46], [45, 70], [62, 40], [78, 66], [90, 34]];
    const ad = (t) => { t = String(t || ''); return t === t.toLocaleUpperCase('tr-TR') ? t.toLocaleLowerCase('tr-TR').replace(/(^|[\s’'(])(\S)/g, (m, a, b) => a + b.toLocaleUpperCase('tr-TR')) : t; };
    D.adBicim = ad;
    // görev bitince listeyi ve haritayı yerinde güncelle (panel açık kalır)
    D.guncelle = function () {
      const kok = I.kok; if (!kok || !I.u) return;
      const g = I.g, k = D.kayit(g), B = D.bolgeDurum(g, I.u, k), N = D.noktalar(g, I.u), sira = N.find((x) => !B.n[x.id]), yap = N.filter((x) => B.n[x.id]).length;
      const L = kok.querySelectorAll('.d55-nl li > .d45-nb:not(.kapi)'), M = kok.querySelectorAll('.d55-nk');
      N.forEach((x, j) => { const t = !!B.n[x.id], s = x === sira;
        [L[j], M[j]].forEach((el) => { if (el) { el.classList.toggle('tamam', t); el.classList.toggle('sira', s); } });
        if (L[j]) { const no = L[j].querySelector('.d55-no'), dr = L[j].querySelector('.d55-dr'); if (no) no.innerHTML = t ? SV(TIK, 14) : x.sira; if (dr) dr.textContent = t ? 'Tamamlandı' : s ? 'Sıradaki' : 'Bekliyor'; }
        if (M[j]) { const sp = M[j].querySelector('span'); if (sp) sp.innerHTML = t ? SV(TIK, 16) : x.sira; } });
      const il = kok.querySelector('.d55-il b'); if (il) il.textContent = yap + '/' + N.length;
      const br = kok.querySelector('.d55-il .d55-bar i'); if (br) br.style.width = (N.length ? Math.round(100 * yap / N.length) : 0) + '%';
      const kp = kok.querySelector('.d55-nl .d45-nb.kapi'); if (kp && N.every((x) => B.n[x.id])) { kp.disabled = false; const dr = kp.querySelector('.d55-dr'); if (dr && !B.kapi) dr.textContent = 'Hazır'; }
      const cta = kok.querySelector('.d55-cta'); if (cta) cta.hidden = true;
    };
    D.metin = function (c, u, N, B) {
      const yap = N.filter((x) => B.n[x.id]).length, sira = N.find((x) => !B.n[x.id]);
      if (!N.length) return `${c.rehber}: “Bu bölgede kaynakla doğrulanmış görev bulamadım.”`;
      if (!yap) return `${c.rehber}: “${ad(u.title)} bölgesine hoş geldin, ${c.kahraman}! Burada ${N.length} görev var. İlk durağımız ${sira.yer}.”`;
      if (sira) return `${c.rehber}: “Harika gidiyorsun! ${yap} görev tamam. Sıradaki durak ${sira.yer} (${sira.gad.toLocaleLowerCase('tr-TR')}).”`;
      return `${c.rehber}: “Bütün görevleri tamamladın! ${c.kapi} seni bekliyor.”`;
    };
    D.bolge = function (uid) {
      I.durSay(); I.u = uid;
      const g = I.g, c = D.D[g], k = D.kayit(g), U = D.uniteler(g), i = U.findIndex((u) => u.id === uid), u = U[i]; if (!u) return D.harita();
      const B = D.bolgeDurum(g, uid, k), N = D.noktalar(g, uid), yap = N.filter((x) => B.n[x.id]).length, hepsi = N.every((x) => B.n[x.id]), kS = D.kapiSorulari(g, uid).length, sira = N.find((x) => !B.n[x.id]);
      const yuzde = N.length ? Math.round(100 * yap / N.length) : 0, P = N.map((x, j) => D.YOL[j % D.YOL.length]);
      const yol = P.length > 1 ? `<svg class="d55-yol" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${P.map((p) => p.join(',')).join(' ')}" class="d55-y0"/><polyline points="${P.slice(0, Math.max(1, N.findIndex((x) => !B.n[x.id]) < 0 ? N.length : N.findIndex((x) => !B.n[x.id]) + 1)).map((p) => p.join(',')).join(' ')}" class="d55-y1"/></svg>` : '';
      const isaret = N.map((x, j) => { const t = !!B.n[x.id], s = x === sira; return `<button type="button" class="d45-nk d55-nk ${t ? 'tamam' : ''} ${s ? 'sira' : ''}" style="left:${P[j][0]}%;top:${P[j][1]}%" onclick="V45.Dunya.nokta('${x.id}')" aria-label="${x.sira}. durak: ${e(x.yer)} — ${e(x.gad)}${t ? ' (tamamlandı)' : s ? ' (sıradaki)' : ''}"><span>${t ? SV(TIK, 16) : x.sira}</span><em>${e(x.yer)}</em></button>`; }).join('');
      const cta = sira ? `<button type="button" class="g44-b p d55-cta" onclick="V45.Dunya.nokta('${sira.id}')">Sıradaki görev: ${e(sira.yer)} ${SV(OK, 16)}</button>`
        : (!B.bitti && N.length ? `<button type="button" class="g44-b p d55-cta" onclick="V45.Dunya.kapi()">${e(c.kapi)}: mücadeleye başla ${SV(OK, 16)}</button>` : `<button type="button" class="g44-b p d55-cta" onclick="V45.Dunya.harita()">Haritaya dön ${SV(OK, 16)}</button>`);
      I.ekran(`${I.ust(u.title, c.ad + ' · ' + u.order + '. bölge')}<div class="d45-sahne d55-sahne">${D.sahne(g, i)}${yol}${isaret}</div>
<div class="g44-ic"><div class="d55-il" role="group" aria-label="Bölge ilerlemesi"><span><b>${yap}/${N.length}</b> görev tamamlandı</span><span class="d55-bar" aria-hidden="true"><i style="width:${yuzde}%"></i></span><span class="d55-ks ${B.bitti ? 'ok' : hepsi ? 'hz' : ''}">${B.bitti ? `${e(c.kapi)} açıldı` : hepsi ? `${e(c.kapi)} hazır` : `${e(c.kapi)}: kilitli`}</span></div>
<div class="d45-dy d55-dy"><div class="d45-av" aria-hidden="true">${e(c.rehber.charAt(0))}</div><p>${e(D.metin(c, u, N, B))}</p></div>${N.length ? cta : ''}
<h3 class="d55-h">Görevler</h3><ol class="d45-nl d55-nl">${N.map((x) => { const t = !!B.n[x.id], s = x === sira; return `<li><button type="button" class="d45-nb ${t ? 'tamam' : ''} ${s ? 'sira' : ''}" onclick="V45.Dunya.nokta('${x.id}')"><i class="d55-no" aria-hidden="true">${t ? SV(TIK, 14) : x.sira}</i><span><b>${e(x.yer)}</b><small>${e(x.gad)} · ${e(x.gack)}</small></span><em class="d55-dr">${t ? 'Tamamlandı' : s ? 'Sıradaki' : 'Bekliyor'}</em></button></li>`; }).join('')}
<li><button type="button" class="d45-nb kapi ${B.kapi ? 'tamam' : ''}" ${hepsi ? '' : 'disabled'} onclick="V45.Dunya.kapi()"><i class="d55-no" aria-hidden="true">${B.kapi ? SV(TIK, 14) : '★'}</i><span><b>${e(c.kapi)}</b><small>${kS >= 3 ? (hepsi ? `${kS} soruluk bölge sonu mücadelesi${c.mod === 'sureli' ? ' · süreli' : ''}` : 'Önce bütün görevleri tamamla.') : 'Kaynak verisi eksik: mücadele sorusu yetersiz; görevler bitince bölge tamamlanır.'}</small></span><em class="d55-dr">${B.kapi ? 'Açıldı' : hepsi ? 'Hazır' : 'Kilitli'}</em></button></li></ol>
${N.length ? '' : '<p class="g44-mut">Bu ünitede kaynakla doğrulanmış not, soru ya da etkinlik bulunamadı. Kaynakta veri bulunmuyor.</p>'}
<div class="d45-panel" id="d45p" aria-live="polite"></div></div>`, 'bolge');
      try { const P = document.getElementById('d45p'); if (P) new MutationObserver(() => { if (P.querySelector('.d55-son')) D.guncelle(); }).observe(P, {childList: true, subtree: true}); } catch (y) {}
    };
    // görev bitince: kısa anlatım + sıradaki görev (derleme yamasıyla V45 D.nokta “Devam” yerine çağrılır)
    D.devamHTML = function (nid) {
      const g = I.g, c = D.D[g], k = D.kayit(g), B = D.bolgeDurum(g, I.u, k), N = D.noktalar(g, I.u), x = N.find((y) => y.id === nid);
      const kalan = N.filter((y) => !B.n[y.id] && y.id !== nid), sonraki = kalan[0];
      const soz = x ? (x.tur === 'not' ? `${c.kahraman} notu Günce’ye ekledi.` : x.tur === 'karakter' ? `${c.rehber}: “Doğru yoldasın!”` : 'Bulmaca çözüldü; yol biraz daha aydınlandı.') : '';
      return `<div class="g44-ara d55-son"><p>${e(soz)} ${sonraki ? `Sıradaki durak: <b>${e(sonraki.yer)}</b>.` : `Bütün görevler tamam; <b>${e(c.kapi)}</b> hazır.`}</p>
${sonraki ? `<button type="button" class="g44-b p" onclick="V45.Dunya.bolge('${I.u}');V45.Dunya.nokta('${sonraki.id}')">Sıradaki görev ${SV(OK, 16)}</button>` : `<button type="button" class="g44-b p" onclick="V45.Dunya.bolge('${I.u}');V45.Dunya.kapi()">${e(c.kapi)} ${SV(OK, 16)}</button>`}<button type="button" class="g44-b" onclick="V45.Dunya.bolge('${I.u}')">Bölgeye dön</button></div>`;
    };
    // dünya haritası: genel ilerleme + devam
    const h0 = D.harita;
    D.harita = function () {
      const r = h0.apply(this, arguments);
      try {
        const kok = I.kok; if (!kok) return r;
        const g = I.g, c = D.D[g], k = D.kayit(g), U = D.uniteler(g);
        let top = 0, yap = 0; U.forEach((u) => { const N = D.noktalar(g, u.id), B = k.bolge[u.id] || {n: {}}; top += N.length; yap += N.filter((x) => B.n && B.n[x.id]).length; });
        const sira = U.findIndex((u, i) => D.acikMi(g, i, k) && !(k.bolge[u.id] && k.bolge[u.id].bitti));
        const ic = kok.querySelector('.g44-ic');
        if (ic && !ic.querySelector('.d55-hr')) ic.insertAdjacentHTML('afterbegin', `<div class="d55-hr"><div class="d55-il"><span><b>${yap}/${top}</b> görev · <b>${U.filter((u) => k.bolge[u.id] && k.bolge[u.id].bitti).length}/${U.length}</b> bölge</span><span class="d55-bar" aria-hidden="true"><i style="width:${top ? Math.round(100 * yap / top) : 0}%"></i></span></div>
${sira >= 0 ? `<button type="button" class="g44-b p d55-cta" onclick="V45.Dunya.bolge('${U[sira].id}')">${yap ? 'Devam et' : 'Maceraya başla'}: ${e(U[sira].title)} ${SV(OK, 16)}</button>` : U.length ? `<p class="d55-tm">${SV(TIK, 18)} Bütün bölgeleri tamamladın; ${e(c.odul)} koleksiyonun tamam.</p>` : ''}</div>`);
      } catch (x) {}
      return r;
    };
  }

  /* ---------- 4. stiller ---------- */
  try {
    const st = document.createElement('style'); st.id = 'v55-oyun-css';
    st.textContent = `
.ao55{display:grid;gap:16px;margin:4px 0 20px}.ao55-bh{margin:6px 0 0;font:600 1.15rem Literata,Georgia,serif}
.ao55-g h3{margin:0 0 8px;font-size:.92rem;color:var(--p-gold-t,var(--pri));letter-spacing:.02em}
.ao55-l{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,160px),1fr));gap:8px}
.ao55-k{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:3px;min-height:76px;padding:12px 30px 12px 12px;border-radius:14px;border:1px solid var(--p-line,var(--line));background:var(--p-card,var(--surface));color:var(--p-ink,var(--ink));font:inherit;text-align:left;cursor:pointer}
.ao55-k b{font-size:.95rem;line-height:1.25}.ao55-k small{color:var(--p-mut,var(--mut));font-size:.78rem;line-height:1.3}.ao55-k>svg{position:absolute;right:8px;top:50%;transform:translateY(-50%);color:var(--p-mut,var(--mut))}
.ao55-tum{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:8px 14px;border-radius:14px;border:1px dashed var(--p-line,var(--line));background:none;color:var(--p-ink,var(--ink));font:inherit;text-align:left;cursor:pointer}
.ao55-gizli{display:none!important}.ao55-pb{margin-top:10px}
.d55-sahne{position:relative}.d55-yol{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}
.d55-yol polyline{fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.d55-y0{stroke:rgba(255,255,255,.55);stroke-width:4;stroke-dasharray:2 8}.d55-y1{stroke:#fff6c8;stroke-width:5}
.d55-nk{z-index:2;display:flex;flex-direction:column;align-items:center;gap:2px;transform:translate(-50%,-50%);background:none!important;border:0!important;box-shadow:none!important;width:auto!important;height:auto!important;padding:0!important}
.d55-nk>span{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#fffdf3;color:#1f3d2c;border:3px solid var(--d45a,#2f6b4f);font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.d55-nk em{font-style:normal;font-size:.7rem;font-weight:700;color:#fff;background:rgba(0,0,0,.55);padding:1px 6px;border-radius:999px;white-space:nowrap;max-width:110px;overflow:hidden;text-overflow:ellipsis}
.d55-nk.tamam>span{background:var(--d45a,#2f6b4f);color:#fff;border-color:#fff6c8}
.d55-nk.sira>span{animation:d55n 1.6s ease-in-out infinite;border-color:#ffd54a}
@keyframes d55n{0%,100%{box-shadow:0 0 0 0 rgba(255,213,74,.7)}50%{box-shadow:0 0 0 10px rgba(255,213,74,0)}}
@media (prefers-reduced-motion:reduce){.d55-nk.sira>span{animation:none}}
.d55-il{display:grid;grid-template-columns:1fr;gap:6px;margin:0 0 12px}.d55-bar{display:block;height:10px;border-radius:99px;background:rgba(127,127,127,.25);overflow:hidden}.d55-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--d45a,#2f6b4f),var(--d45b,#bfe3a3))}
.d55-ks{font-size:.82rem;font-weight:700;opacity:.8}.d55-ks.hz{color:#b7791f;opacity:1}.d55-ks.ok{color:#2f8f62;opacity:1}
.d55-dy{align-items:center;margin:0 0 12px}.d55-dy p{margin:0;line-height:1.5}
.d55-cta{width:100%;justify-content:center;min-height:52px;margin:0 0 6px;display:flex;align-items:center;gap:8px}
.d55-h{margin:16px 0 8px;font-size:1rem}
.d55-nl .d45-nb{display:flex;align-items:center;gap:10px;width:100%;text-align:left}.d55-nl .d45-nb>span{flex:1;display:flex;flex-direction:column}
.d55-no{display:inline-grid;place-items:center;width:28px;height:28px;flex:none;border-radius:50%;border:2px solid currentColor;font-style:normal;font-weight:800;font-size:.85rem}
.d55-nl .d45-nb.tamam .d55-no{background:var(--d45a,#2f6b4f);border-color:var(--d45a,#2f6b4f);color:#fff}
.d55-nl .d45-nb.sira{outline:2px solid #e0a800;outline-offset:1px}
.d55-dr{font-style:normal;font-size:.75rem;font-weight:700;white-space:nowrap;opacity:.85}
.d55-son{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.d55-son p{flex-basis:100%;margin:6px 0}
.d55-hr{margin:0 0 14px}.d55-tm{display:flex;align-items:center;gap:8px;font-weight:700;color:#2f8f62}
`;
    document.head.appendChild(st);
  } catch (x) {}

  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try { OM.yerlestir(); } catch (x) { console.warn('[V55] oyun merkezi', x); }
    return r;
  };
})();
