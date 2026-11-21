/* ===================== V51.0: mod koruma (rota kök nedeni) ve Altın para amblemi =====================
   KÖK NEDEN: V39'un Altın rotaları (pdunya, psinif, punite, pders, pozet, pilerleme), V40'ın pfav'ı ve V41'in poyun/poyna
   rotaları açılırken `if(!V39.on){V39.on=true; sessionStorage dk-deneyim39-aktif=1}` çalıştırıyordu. Elmas Profilim'deki
   “Sınıf sınıf ilerleme” (pilerleme) ve “Favorilerim” (pfav) bu rotaları kullandığı için Elmas'tan bu ekranlara geçmek
   modu sessizce Altın'a çeviriyordu (renk, alt menü ve oturum değişiyordu).
   ÇÖZÜM: Rota hiçbir koşulda modu değiştirmez. Mod yalnız V50.Mod.gec ile değişir.
     - Altın'da: rotalar eskisi gibi çalışır (Altın ekranı).
     - Elmas'ta: pilerleme ve pfav Elmas bileşenleriyle çizilir (aynı veri: V39.gstat, V40.favs).
       pdunya/psinif/punite/pders V49.Duzelt.uyum ile karşılıklarına çevrilir; pozet → sınıf sayfası.
       poyun/poyna (3B Oyun Dünyası yalnız Altın Sınıfı'nda) → Elmas'ta açık bir onay ekranı: “Altın Sınıfı'na geç ve aç”
       ya da “Elmas oyunlarına dön”. Kullanıcı onaylamadan mod değişmez.
   Geri tuşu davranışı V50 ile aynıdır (geçmişteki ekran o anki modda açılır). */
(function () {
  if (typeof V30 === 'undefined' || typeof V39 === 'undefined') return;
  const V51 = window.V51 = window.V51 || {};
  const R = V51.Rota = {sayac: 0};
  const IK = (k, s) => (window.V46 && V46.ik ? V46.ik(k, s || 20) : '');
  const ESC = (x) => (typeof esc === 'function' ? esc(x) : String(x == null ? '' : x));

  /* ---------- 1. rota sarmalayıcıları: modu değiştirmez ---------- */
  const eski = {};
  R.sar = function () {
    (V39.ROUTES || []).forEach((r) => {
      if (eski[r] || typeof V30.routes[r] !== 'function') return;
      eski[r] = V30.routes[r];
      V30.routes[r] = function () {
        if (V39.on) return eski[r].apply(this, arguments);   // Altın'da eskisi gibi
        R.sayac++;
        return R.elmas(r);
      };
    });
  };
  R.sar();

  // Elmas'ta Altın'a özgü rotaların karşılığı (V39.on hiç değişmez)
  R.elmas = function (r) {
    try { V39.attr(); } catch (e) {}
    if (r === 'pilerleme') return R.ilerleme();
    if (r === 'pfav') return R.favori();
    if (r === 'poyun' || r === 'poyna') return R.oyunOnay(r);
    // psinif/punite/pders/pdunya normalde çizimden önce V49.Duzelt.uyum ile çevrilir; buraya gelirse güvenlik ağı
    const g = +(G.pg || G.g || 0);
    if ((r === 'psinif' || r === 'punite' || r === 'pozet') && g) { view = 'grade'; G.g = g; }
    else if (r === 'pders' && G.pt) { view = 'topic'; G.t = G.pt; G.tab = G.ptab || G.tab || 'anlat'; }
    else view = 'home';
    const f = V30.routes[view]; if (typeof f === 'function') return f();
    return draw();
  };

  const sinifStat = (g) => { const py = V39.pv(g), S = V39.gstat(g, py); return {py, S, yuzde: S.T.length ? Math.round(100 * S.tam / S.T.length) : 0}; };

  /* Elmas: Sınıf sınıf ilerleme (V39.r_pilerleme ile aynı veri, Elmas kart düzeni) */
  R.ilerleme = function () {
    const W = (typeof MT !== 'undefined' && MT.W) ? MT.W() : {}, wn = Object.keys(W).length;
    $.innerHTML = `<div class="il51">
<button class="back" onclick="go('profil46')">${typeof ico === 'function' ? ico('back', 18) : ''} Profilim</button>
<section class="hero slim"><p class="eyebrow">İlerlemem</p><h1>Sınıf sınıf ilerleme</h1><p class="lead">Elmas ve Altın sınıfları aynı ilerleme kaydını kullanır. Bir sınıfa dokunarak sınıf sayfasını aç.</p></section>
<div class="il51-gr" role="list">${(V39.GR || []).map((g) => { const {py, S, yuzde} = sinifStat(g); return `<button type="button" role="listitem" class="card il51-k" onclick="go('grade',{g:${g}})">
<span class="il51-n" aria-hidden="true">${g}</span><span class="il51-t"><b>${g}. Sınıf</b><small>${py === '2018' ? '2018 programı' : '2026 programı (TYMM)'}</small>
<span class="il51-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${yuzde}" aria-label="${g}. sınıf konu tamamlama"><i style="width:${yuzde}%"></i></span>
<small>${S.tam}/${S.T.length} konu tamamlandı · ${S.cl} çalışılıyor</small><small>${S.cal}/${S.O.length} kazanımda soru çözüldü</small></span>${IK('ok', 18)}</button>`; }).join('')}</div>
<section class="card il51-y"><h2>${IK('yanlis', 20)} Yanlışlarım</h2><p>${wn ? wn + ' soru tekrar bekliyor.' : 'Tekrar bekleyen soru yok.'}</p>${wn ? `<button type="button" class="p" onclick="go('yanlis')">Yanlışlarımı çöz</button>` : ''}</section></div>`;
  };

  /* Elmas: Favorilerim (V40.favs ile aynı kayıt) */
  R.favori = function () {
    let F = {s: [], k: []}; try { F = V40.favs(); } catch (e) {}
    const S = (F.s || []).filter((g) => (V39.GR || []).includes(g)).sort((a, b) => a - b);
    const K = (F.k || []).map((id) => Store.get('topics', id)).filter((t) => t && vis(t));
    const yildiz = (t, id) => (typeof V40 !== 'undefined' && V40.favBtn ? V40.favBtn(t, id) : '');
    $.innerHTML = `<div class="il51 fv51">
<button class="back" onclick="go('profil46')">${typeof ico === 'function' ? ico('back', 18) : ''} Profilim</button>
<section class="hero slim"><p class="eyebrow">Kişisel</p><h1>Favorilerim</h1><p class="lead">Sınıf ve konu sayfalarındaki yıldızla eklediklerin. Favoriler bu cihazda saklanır.</p></section>
<h2 class="il51-h">Sınıflar</h2>${S.length ? `<div class="il51-gr">${S.map((g) => `<div class="card il51-k fv"><button type="button" class="il51-a" onclick="go('grade',{g:${g}})"><span class="il51-n" aria-hidden="true">${g}</span><span class="il51-t"><b>${g}. Sınıf</b><small>${ESC(V39.pyName(V39.pv(g)))}</small></span></button>${yildiz('s', g)}</div>`).join('')}</div>` : '<p class="il51-bos">Henüz favori sınıf eklemedin.</p>'}
<h2 class="il51-h">Konular</h2>${K.length ? `<div class="il51-gr">${K.map((t) => { const u = Store.get('units', t.unitId) || {}; return `<div class="card il51-k fv"><button type="button" class="il51-a" onclick="go('topic',{t:'${t.id}',tab:'anlat'})"><span class="il51-n" aria-hidden="true">${t.grade}</span><span class="il51-t"><b>${ESC(t.title)}</b><small>${t.grade}. sınıf · ${ESC(u.title || '')}</small></span></button>${yildiz('k', t.id)}</div>`; }).join('')}</div>` : '<p class="il51-bos">Henüz favori konu eklemedin.</p>'}</div>`;
  };

  /* Elmas: Oyun Dünyası (3B, yalnız Altın Sınıfı) — mod değişimi yalnız kullanıcı onayıyla */
  R.hedef = null;
  R.oyunOnay = function (r) {
    const a = r === 'poyna' && G.oyn ? {oyn: G.oyn, obol: G.obol || '', odevam: G.odevam || 0} : null;
    R._bekleyen = {v: r, a};
    $.innerHTML = `<div class="il51 oy51">
<button class="back" onclick="go('games')">${typeof ico === 'function' ? ico('back', 18) : ''} Oyunlar</button>
<section class="card oy51-k" role="region" aria-labelledby="oy51h"><span class="oy51-am" aria-hidden="true">${V51.Gorsel.altinPara(56, 'op51b')}</span>
<h1 id="oy51h">Oyun Dünyası Altın Sınıfı'nda</h1>
<p>3B Oyun Dünyası (Kayıp Bilgeliğin Kütüphanesi ve sınıf dünyaları) Altın Sınıfı'nda açılır. Şu an <b>Elmas Sınıfı</b>'ndasın; modun kendiliğinden değişmez.</p>
<p class="small mut">İlerlemen ve oyun kayıtların iki modda da aynıdır. İstediğin zaman üst menüdeki Mod düğmesiyle Elmas'a dönebilirsin.</p>
<div class="oy51-bb"><button type="button" class="p" onclick="V51.Rota.altindaAc()">Altın Sınıfı'na geç ve aç</button><button type="button" onclick="go('games')">Elmas oyunlarına dön</button></div></section></div>`;
  };
  R.altindaAc = function () {
    R.hedef = R._bekleyen || {v: 'poyun', a: null};
    if (window.V50 && V50.Mod) V50.Mod.gec('altin'); else V42.gec('premium');
  };
  // V50.Mod.gec → V42.gec → V42.hedef: kullanıcı onaylı hedef (yalnız bir kez)
  if (typeof V42 !== 'undefined' && V42.hedef) {
    const h0 = V42.hedef;
    V42.hedef = function (mod) { if (mod === 'premium' && R.hedef) { const h = R.hedef; R.hedef = null; return {v: h.v, a: h.a, t: 'Oyun Dünyası'}; } return h0.apply(this, arguments); };
  }

  /* ---------- 2. alt menü vurgusu (Elmas) ---------- */
  if (typeof navKey === 'function') {
    const nk0 = navKey;
    navKey = function () { if (!V39.on && (view === 'pilerleme' || view === 'pfav')) return 'profil'; if (!V39.on && (view === 'poyun' || view === 'poyna')) return 'games'; return nk0.apply(this, arguments); };
  }

  /* ---------- 3. Altın para amblemi (Elmas'taki lacivert daire içi elmasın Altın karşılığı) ---------- */
  const Gor = V51.Gorsel = V51.Gorsel || {};
  // Daireye tam oturan altın sikke: tırtıllı kenar, iç halka, ortada 8 yapraklı çiçek kabartması (8 kat simetri)
  Gor.altinPara = function (s, id) {
    id = id || 'ap51'; s = s || 24;
    const yaprak = Array.from({length: 8}, (_, i) => `<ellipse cx="32" cy="22.6" rx="3.1" ry="7.4" transform="rotate(${i * 45} 32 32)"/>`).join('');
    const tirtil = Array.from({length: 40}, (_, i) => `<rect x="31.3" y="2.2" width="1.4" height="3.2" rx=".5" transform="rotate(${i * 9} 32 32)"/>`).join('');
    return `<svg class="ap51" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs>
<radialGradient id="${id}a" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#FFF1C2"/><stop offset=".35" stop-color="#F3CF72"/><stop offset=".75" stop-color="#C9922F"/><stop offset="1" stop-color="#8E5E17"/></radialGradient>
<linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9B954"/><stop offset=".55" stop-color="#B37B22"/><stop offset="1" stop-color="#7A4E10"/></linearGradient>
<radialGradient id="${id}c" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="#FBE3A0"/><stop offset=".6" stop-color="#E0AE4C"/><stop offset="1" stop-color="#A86F1C"/></radialGradient></defs>
<circle cx="32" cy="32" r="30.5" fill="url(#${id}b)"/><g fill="#7A4E10" opacity=".55">${tirtil}</g>
<circle cx="32" cy="32" r="26" fill="url(#${id}a)"/><circle cx="32" cy="32" r="21.5" fill="none" stroke="#9A6519" stroke-width="1.3" opacity=".8"/>
<circle cx="32" cy="32" r="20.2" fill="none" stroke="#FFF4D2" stroke-width=".8" opacity=".55"/>
<g fill="url(#${id}c)" stroke="#9A6519" stroke-width=".9">${yaprak}</g><circle cx="32" cy="32" r="4.2" fill="#FBE7AE" stroke="#9A6519" stroke-width=".9"/>
<path d="M14 22a21 21 0 0 1 14-10" stroke="#FFF8E1" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/></svg>`;
  };
  if (window.V50 && V50.Mod && V50.Mod.amblem) {
    const am0 = V50.Mod.amblem;
    V50.Mod.amblem = function (k, s) { if (k === 'altin') return Gor.altinPara(s, 'ap51m' + s); return am0.apply(this, arguments); };
    // üst menü düğmeleri V50.Mod.dugmeHTML'i çağırır; amblem artık altın para — eski çizimleri yenile
    try { document.querySelectorAll('.md50[data-md50=altin]').forEach((b) => { delete b.dataset.md50; }); } catch (e) {}
  }
})();
