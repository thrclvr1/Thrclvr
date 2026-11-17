/* ===================== V46.0: sadeleştirme ve öğretmen girişi =====================
   İçerik, kayıt ve özellik silinmez; yalnızca yerleri değişir.
   - Ana gezinme dört alan: Derslerim · Oyunlar · Çalışmam · Profilim (+ Ana sayfa). Öğretmen düğmesi yalnız öğretmen modunda.
   - Klasik ana sayfa: arama, kaldığın yerden devam ve dört büyük giriş. Eski bölümler taşındı:
       Sureler ve Dualar, Sözlük, Bağlantılar → Derslerim · Pekiştir, Kendini Dene, Sınavlar, kısayollar → Çalışmam
       İlerlemem, ayarlar, program sürümü, ses, öğretmen/editör girişi → Profilim · Oyun türleri → Oyunlar
   - Konu ekranı (Klasik ve Premium): önce üç ana sekme (Öğren / Pekiştir / Kendini Dene), altında yalnız o grubun sekmeleri.
     Kaynak etiketleri açılır “Kaynak bilgisi” bölümünde.
   - Premium: koridor menüsü aynı dört alan; tekrar eden “Hızlı Erişim” kaldırıldı; sınıf merkezinde araçlar açılır bölümde,
     tekrar eden konu listesi gizli.
   - Öğretmen paneli PIN istemez (yerel PIN güvenlik değildir); editör alanı ayrıdır ve öğretmen panelinde yer almaz. */
(function () {
  const V46 = window.V46 = window.V46 || {};
  const S46 = (p, s) => `<svg width="${s || 22}" height="${s || 22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const IK = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
    ders: '<path d="M4 5.5C6.5 4 9.5 4 12 5.5c2.5-1.5 5.5-1.5 8 0V19c-2.5-1.5-5.5-1.5-8 0-2.5-1.5-5.5-1.5-8 0Z"/><path d="M12 5.5V19"/>',
    oyun: '<rect x="3" y="7" width="18" height="11" rx="4"/><path d="M8 10.5v4M6 12.5h4"/><circle cx="15.5" cy="11.5" r=".6"/><circle cx="17.5" cy="13.5" r=".6"/>',
    calis: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    profil: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    ogrt: '<path d="M3 8.5 12 4l9 4.5-9 4.5z"/><path d="M7 10.6V15c0 1.4 2.2 2.6 5 2.6s5-1.2 5-2.6v-4.4"/><path d="M21 8.5V14"/>',
    ok: '<path d="m9 6 6 6-6 6"/>'
  };
  V46.ik = (k, s) => S46(IK[k] || '', s);
  const TT = () => (typeof V39 !== 'undefined' && V39.on);

  /* ---------- 1. Öğretmen girişi: PIN yok ---------- */
  if (typeof V36 !== 'undefined') {
    V36.pinView = function () { V36.ss(V36.SK, '1'); if (view === 'ogretmen') { try { OGRT.render(); } catch (e) { console.warn('[V46] öğretmen paneli', e); } } V46.nav(); };
    V36.pinForm = () => '';
  }
  V46.ogretmenCik = function () { try { V36.ss(V36.SK, null); } catch (e) {} V46.nav(); go('home'); };
  if (typeof OGRT !== 'undefined') {
    if (Array.isArray(OGRT.SUB)) OGRT.SUB = OGRT.SUB.filter(([k]) => k !== 'editor');
    try { if (V38.SUBD) V38.SUBD.ayar = 'Görünüm ve editör alanına geçiş'; } catch (e) {}
    const r0 = OGRT.render;
    OGRT.render = function () {
      const r = r0.apply(this, arguments);
      try {
        const d = $.querySelector('.og-tabs [data-t="diger"]'); if (d && !d.dataset.v46) { d.dataset.v46 = 1; d.lastChild.textContent = 'Araçlar'; }
        const o = $.querySelector('.og-out'); if (o && !o.dataset.v46) { o.dataset.v46 = 1; o.textContent = 'Öğretmen modundan çık'; o.onclick = V46.ogretmenCik; }
        const p = $.querySelector('.og-top .mut.small'); if (p && !p.dataset.v46) { p.dataset.v46 = 1; p.textContent = 'Kayıtların bu cihazda tutulur. Editör onayı ayrı bir alandadır (Profilim › Öğretmen ve editör).'; }
        [...$.querySelectorAll('#og-body p')].forEach((x) => { if (/öğretmen PIN'inden ayrı/.test(x.textContent)) x.textContent = 'Editör Onay Alanı ayrı bir alandır ve kendi 6 haneli editör PIN’iyle açılır. Öğretmen paneli PIN istemez. Bu ayrım yalnızca bu cihazdaki yerel bir erişim ayrımıdır; gerçek güvenlik değildir.'; });
        // Ana Panel: sık kullanılan üç bölüm önde, veri ve ayarlar “İleri düzey” başlığı altında
        const y = [...$.querySelectorAll('button, a')].find((b) => /Veri Yönetimi/.test(b.textContent) && b.closest('#og-body') && !b.closest('.og-tabs'));
        if (y && !$.querySelector('.og46-ileri')) { const h = document.createElement('h3'); h.className = 'og46-ileri'; h.textContent = 'İleri düzey'; const kap = y.parentElement; if (kap && kap.children.length > 2) { const satir = document.createElement('div'); satir.className = kap.className; kap.after(h); h.after(satir); [...kap.children].filter((b) => /Veri Yönetimi|Ayarlar/.test(b.textContent)).forEach((b) => satir.appendChild(b)); } }
      } catch (e) {}
      return r;
    };
  }
  if (typeof V44 !== 'undefined') {
    V44.giris = function () {
      UI.sheet({title: 'Öğretmen ve editör', body: () => `<div class="g44"><p class="small">Öğrenciler için giriş gerekmez.</p>
<button type="button" class="g44-b" onclick="UI.close();V36.ss(V36.SK,'1');go('ogretmen')"><b>Öğretmen paneli</b><small>Haftalık plan, sınıflarım, kazanımlar, arama, son işlemler</small></button>
<button type="button" class="g44-b" onclick="UI.close();go('editor')"><b>Editör alanı</b><small>İçerik onayı ve kaynak kontrolü (ayrı editör PIN’i)</small></button>
<p class="small mut">Bu cihazdaki ayrım basit bir erişim ayrımıdır, gerçek güvenlik değildir. Gerçek yetkilendirme Google hesabı ve sunucu ile yapılır (Profilim › Hesap).</p></div>`});
    };
  }

  /* ---------- 2. Ana gezinme ---------- */
  const NAV = [['home', 'Ana sayfa', 'home', "go('home')"], ['classes', 'Derslerim', 'ders', "go('classes')"], ['games', 'Oyunlar', 'oyun', "go('games')"], ['calis', 'Çalışmam', 'calis', "go('calis45')"], ['profil', 'Profilim', 'profil', "go('profil46')"]];
  V46.nav = function () {
    const nv = document.querySelector('nav.bnav'); if (!nv) return;
    const og = typeof V36 !== 'undefined' && V36.ok(), imza = 'v46' + (og ? 'o' : '');
    if (nv.dataset.v46 !== imza) {
      nv.innerHTML = NAV.map(([k, t, i, f]) => `<button data-k="${k}" onclick="${f}" aria-label="${t}">${V46.ik(i)}<span>${t}</span></button>`).join('') + (og ? `<button data-k="ogretmen" onclick="go('ogretmen')" aria-label="Öğretmen paneli">${V46.ik('ogrt')}<span>Öğretmen</span></button>` : '');
      nv.dataset.v46 = imza;
    }
    const k = navKey(); nv.querySelectorAll('button').forEach((b) => { const on = b.dataset.k === k; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  };
  const NK = {home: 'home', classes: 'classes', grade: 'classes', topic: 'classes', book: 'classes', kavram: 'classes', kisi: 'classes', links: 'classes', sd: 'classes', search: 'classes',
    games: 'games', game: 'games', poyun: 'games', poyna: 'games', pek: 'calis', pekbol: 'calis', cards: 'calis', dene: 'calis', test: 'calis', yanlis: 'calis', exams: 'calis', exam: 'calis', calis45: 'calis', profil46: 'profil', ogretmen: 'ogretmen'};
  const nk0 = navKey;
  navKey = function () { return NK[view] || nk0.apply(this, arguments); };

  /* ---------- 3. Klasik ana sayfa ---------- */
  const kutu = (k, ik, b, s, f, rozet) => `<button type="button" class="h46-k" data-k="${k}" onclick="${f}"><span class="h46-i">${V46.ik(ik, 26)}</span><span class="h46-t"><b>${b}</b><small>${s}</small></span>${rozet ? `<em class="h46-r">${rozet}</em>` : ''}</button>`;
  V46.ana = function () {
    if (view !== 'home' || TT() || $.querySelector('.h46')) return;
    const al = (s) => { const e = $.querySelector(s); return e ? e.outerHTML : ''; };
    const st = V30.stats(), cal = (V45.Calis && V45.Calis.oku()) || {gun: {}, hedef: 20}, d = new Date(), gk = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'), bg = cal.gun[gk] || 0, tek = st.due + st.wrong;
    $.innerHTML = `${al('.h30-hello')}${al('.h30-sticky')}${al('.h30-cont')}<section class="h46" aria-label="Ana bölümler">
${kutu('ders', 'ders', 'Derslerim', 'Sınıflar, konular, sureler ve dualar', "go('classes')")}
${kutu('oyun', 'oyun', 'Oyunlar', 'Oyun Dünyası ve Klasik oyunlar', "go('games')")}
${kutu('calis', 'calis', 'Çalışmam', `Bugün ${bg}/${cal.hedef} cevap · tekrar ve testler`, "go('calis45')", tek ? String(tek) : '')}
${kutu('profil', 'profil', 'Profilim', 'Hesap, ilerleme ve ayarlar', "go('profil46')")}</section>`;
  };

  /* ---------- 4. Derslerim, Oyunlar ve Çalışmam'a taşınanlar ---------- */
  const satir = (L) => `<nav class="r46" aria-label="Kısayollar">${L.map(([t, s, f]) => `<button type="button" onclick="${f}"><b>${t}</b><small>${s}</small></button>`).join('')}</nav>`;
  V46.tasi = function () {
    try {
      if (TT()) return;
      if (view === 'classes' && !$.querySelector('.r46')) { const h = $.querySelector('.hero'); if (h) h.insertAdjacentHTML('afterend', satir([['Sureler ve Dualar', 'Dinleme merkezi', "go('sd')"], ['Kavramlar', Store.all('concepts').length + ' kavram', "go('kavram')"], ['Kişiler ve eserler', 'Sözlük', "go('kisi')"], ['Bağlantılar', 'Kavram haritası', "go('links',{lk:{tab:'harita'}})"]])); }
      if (view === 'games' && !$.querySelector('.r46')) { const h = $.querySelector('.hero') || $.firstElementChild; if (h) h.insertAdjacentHTML('afterend', `<button type="button" class="g46-dunya" onclick="go('poyun')"><b>Oyun Dünyası</b><small>Kayıp Bilgeliğin Kütüphanesi (4–12. sınıf), Sınıf Dünyaları, Zamanın İzinde, Bilgi Laboratuvarı · Premium deneyimde açılır</small></button>`); }
      if (view === 'calis45' && !$.querySelector('.r46')) { const h = $.querySelector('.hero'); if (h) { const l = h.querySelector('.lead'); if (l) l.textContent = 'Tekrar edeceklerin ve sana özel öneriler.'; h.insertAdjacentHTML('afterend', satir([['Pekiştir', 'Kartlar, kodlama, tablo', "go('pek')"], ['Kendini Dene', 'Testler ve yanlışlarım', "go('dene')"], ['Sınavlar', 'LGS ve YKS', "go('exams')"]])); } }
    } catch (e) { console.warn('[V46] taşıma', e); }
  };

  /* ---------- 5. Profilim (rota: profil46) ---------- */
  V30.routes.profil46 = function () {
    const st = V30.stats(), pc = (a, b) => (b ? Math.min(100, Math.round(100 * a / b)) : 0), pr = TT();
    const hesap = (window.V46 && V46.Hesap && V46.Hesap.kart) ? V46.Hesap.kart() : '';
    $.innerHTML = `<section class="hero slim"><p class="eyebrow">Profilim</p><h1>Profilim</h1></section>
${hesap}
<section class="card p46-s"><h2>İlerlemem</h2>
<div class="p46-pg"><span>Tamamlanan konu (mini test %70+)</span><b>${st.done}</b></div>
<div class="p46-pg"><span>Kazanım başarısı</span><b>${st.mast === null ? '—' : '%' + st.mast}</b><div class="v-prog"><i style="width:${st.mast || 0}%"></i></div></div>
<div class="p46-pg"><span>İçeriği hazır konu</span><b>${st.withC}/${st.TP.length}</b><div class="v-prog"><i style="width:${pc(st.withC, st.TP.length)}%"></i></div></div>
<div class="p46-bb"><button type="button" onclick="go('calis45')">Çalışma Merkezim</button><button type="button" onclick="go('pilerleme')">Sınıf sınıf ilerleme</button><button type="button" onclick="go('pfav')">Favorilerim</button></div></section>
<section class="card p46-s"><h2>Görünüm</h2><div class="p46-bb">
<button type="button" onclick="V42.degistir()">Deneyim: ${pr ? 'Premium' : 'Klasik'} — değiştir</button>
${pr ? `<button type="button" onclick="V43.cevir&&V43.cevir();go('profil46')">Premium tema: ${({gunduz: 'Gündüz', gece: 'Gece', oto: 'Otomatik'})[(V43.cozum && V43.cozum()) || 'gece'] || 'Gece'}</button>` : `<button type="button" onclick="theme();themeBtns();go('profil46')">Tema: ${themeNow() === 'dark' ? 'Koyu' : 'Açık'} — değiştir</button>`}
<button type="button" onclick="V30.settings()">Hareket ve animasyonlar</button><button type="button" onclick="V37.sndOpen()">Ses ve müzik</button><button type="button" onclick="ATM.open()">Ders Atmosferi</button></div>
<details class="p46-d"><summary>Program sürümü ve taslak görünümü</summary>${typeof ctl === 'function' ? ctl() : ''}</details></section>
<details class="card p46-s p46-d"><summary>Öğretmen ve editör</summary><p class="small mut">Öğrenciler bu bölümü kullanmaz.</p><div class="p46-bb"><button type="button" onclick="V36.ss(V36.SK,'1');go('ogretmen')">Öğretmen paneli</button><button type="button" onclick="go('editor')">Editör alanı</button></div></details>
<p class="small mut p46-v">Sürüm ${esc(V31.VER)}</p>`;
  };

  /* ---------- 6. Konu ekranı: üç ana sekme ---------- */
  const GRUP = [['ogren', 'Öğren', ['anlat', 'ozet', 'otuz', 'video', 'hik', 'kay']], ['pek', 'Pekiştir', ['kod', 'tab', 'kar', 'kart']], ['dene', 'Kendini Dene', ['test', 'sin', 'oyun']]];
  const grupOf = (k) => (GRUP.find((g) => g[2].includes(k)) || GRUP[0])[0];
  const anahtar = (b) => b.dataset.k || ((b.getAttribute('onclick') || '').match(/tabTo\('([a-z]+)'\)/) || [])[1];
  V46.sekme = function () {
    try {
      const tl = $.querySelector('.tabs[role=tablist], .p39-tabs'); if (!tl) return;
      const B = [...tl.querySelectorAll('button[role=tab]')]; if (!B.length) return;
      const on = B.find((b) => b.classList.contains('on')) || B[0], aktif = grupOf(anahtar(on));
      let sg = tl.previousElementSibling; if (!sg || !sg.classList.contains('seg46')) { sg = document.createElement('div'); sg.className = 'seg46'; sg.setAttribute('role', 'group'); sg.setAttribute('aria-label', 'Konu bölümleri'); tl.before(sg); }
      const var_ = (g) => B.some((b) => g[2].includes(anahtar(b)));
      sg.innerHTML = GRUP.filter(var_).map(([k, t]) => `<button type="button" data-g="${k}" aria-pressed="${k === aktif}" class="${k === aktif ? 'on' : ''}">${t}</button>`).join('');
      sg.querySelectorAll('button').forEach((x) => x.onclick = () => { const g = GRUP.find((y) => y[0] === x.dataset.g), k = g[2].find((kk) => B.some((y) => anahtar(y) === kk)), b = B.find((y) => anahtar(y) === k); if (b && !b.classList.contains('on')) b.click(); });
      tl.classList.add('tabs46');
      B.forEach((b) => b.classList.toggle('g46h', grupOf(anahtar(b)) !== aktif));
      // kaynak etiketleri açılır bölüme
      const pt = $.querySelector('.p39-ders .p39-tags'), hero = $.querySelector('.hero.topic') || (pt && pt.parentElement);
      if (hero && !hero.querySelector('.d46k')) { const K = [...hero.querySelectorAll('.kd45')].map((e) => e.closest('span:not(.kd45)') || e), gv = [...hero.querySelectorAll('.tag, .p39-tags span')].filter((e) => /kaynak güveni/i.test(e.textContent));
        if (K.length || gv.length) { const d = document.createElement('details'); d.className = 'd46k'; d.innerHTML = '<summary>Kaynak bilgisi</summary><div class="d46k-i"></div>'; const ic = d.querySelector('.d46k-i'); [...new Set(K.concat(gv))].forEach((e) => ic.appendChild(e)); if (pt && pt.parentElement === hero) pt.after(d); else hero.appendChild(d); } }
    } catch (e) { console.warn('[V46] sekme', e); }
  };
  if (typeof tabTo === 'function') { const t0 = tabTo; tabTo = function () { const r = t0.apply(this, arguments); V46.sekme(); return r; }; }
  if (typeof V39 !== 'undefined' && V39.tab) { const t1 = V39.tab; V39.tab = function () { const r = t1.apply(this, arguments); V46.sekme(); return r; }; }

  /* ---------- 7. Premium ---------- */
  if (typeof V40 !== 'undefined') {
    V40.ustHTML = () => `<header class="ust40"><button class="mk40" onclick="V40.git(-1)" aria-label="Öğrenme Dünyası: koridorun girişine dön">${V39.emb(36)}<span><b>Din Kültürü</b><small>Öğrenme Dünyası</small></span></button>
 <nav class="nv40" aria-label="Öğrenme Dünyası menüsü"><button class="on" aria-current="page" onclick="V40.git(-1)">${V46.ik('ders', 20)}<span>Derslerim</span></button><button onclick="go('poyun')">${V46.ik('oyun', 20)}<span>Oyunlar</span></button><button onclick="go('calis45')">${V46.ik('calis', 20)}<span>Çalışmam</span></button><button onclick="go('profil46')">${V46.ik('profil', 20)}<span>Profilim</span></button></nav>
 <span class="sp40"></span><button class="ib40" onclick="V39.ara()" aria-label="Ara">${V39.svg('search', 20)}</button><button class="ib40 ses" onclick="V37.sndOpen()" aria-label="Ses kontrolü">${V39.svg('vol', 20)}</button></header>`;
  }
  V46.psinif = function () {
    try {
      if (view !== 'psinif' || $.querySelector('.d46a')) return;
      const ar = $.querySelector('.p40-ar'); if (ar) { const d = document.createElement('details'); d.className = 'd46a p39-card'; const n = ar.querySelectorAll('.ar40 button').length; d.innerHTML = `<summary>Öğrenme araçları (${n})</summary>`; ar.before(d); d.appendChild(ar); }
      [...$.querySelectorAll('.p39 section, .p39 details')].forEach((s) => { const h = s.querySelector('h2'); if (h && /^\s*Konular\s*$/.test(h.textContent) && !s.classList.contains('d46a')) s.classList.add('g46h'); });
    } catch (e) {}
  };

  /* ---------- 8. çizim kancası ---------- */
  const d0 = draw;
  draw = function () { const r = d0.apply(this, arguments); V46.ana(); V46.tasi(); V46.sekme(); V46.psinif(); V46.nav(); return r; };
  V46.nav();
})();
