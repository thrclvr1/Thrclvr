/* ===================== V42.0: Premium giriş deneyimi, gezinme, okunabilirlik, kayıtlı müzikler =====================
   1. Kayıtlı müzikler (7 parça; HTML içine gömülü, internetsiz) → Ders Atmosferi'ne yeni bölüm
   2. Giriş (seçim) ekranı: Obsidyen-altın tasarım (V39.secim yeniden tanımlanır; API ve sınıf adları korunur)
   3. Deneyim değiştirme: her ekranda yazılı düğme + “Deneyimi değiştir” paneli (kaldığın yere eşleme)
   4. Geri tuşu: ekran geçmişine deneyim kaydı; seçim ekranı geçmişe bağlı; açılış seçimi kök olur
   5. Klavye: visualViewport ile alt paneller klavyenin üstünde kalır
   Kayıt anahtarlarına dokunulmaz; yeni kalıcı anahtar yok. */
window.V42 = window.V42 || {};
(function () {
  const $id = (i) => document.getElementById(i);
  const SVG = (p, s) => `<svg width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  V42.IC = {
    swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
    book: '<path d="M3 5.5C5.5 4 9 4 12 6c3-2 6.5-2 9-.5V19c-2.5-1.5-6-1.5-9 .5-3-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/>',
    door: '<path d="M6 21V9a6 6 0 0 1 12 0v12"/><path d="M4 21h16M14.5 13.5v1"/>',
    teach: '<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c3 2.4 8 2.4 11 0V11M21.5 9v5"/>',
    ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    sag: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    geri: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    star: '<path d="M12 2.8l2.2 4.4 4.9.7-3.5 3.4.8 4.9L12 13.9l-4.4 2.3.8-4.9-3.5-3.4 4.9-.7z"/>',
    menu: '<path d="M8 5v14M16 5v14"/>'
  };
  V42.svg = (k, s) => SVG(V42.IC[k] || '', s);

  /* ---------- 1. Kayıtlı müzikler ---------- */
  // Adlar dosya adlarının Türkçesidir; parçalar bu sürümde dinlenerek içerik (sözlü/sözsüz, çalgı) yönünden doğrulanmadı.
  V42.MUZ = [
    {id: 'esik', f: 'before_the_sacred_threshold.mp3', n: 'Kutsal Eşikte', s: '1:06', ic: 'calm'},
    {id: 'sessizdua', f: 'sessiz_dua.mp3', n: 'Sessiz Dua', s: '1:05', ic: 'calm'},
    {id: 'neynefes', f: 'the_reed_s_breath.mp3', n: 'Neyin Nefesi', s: '1:06', ic: 'ney'},
    {id: 'neydua', f: 'the_prayer_of_the_reed.mp3', n: 'Neyin Duası', s: '3:00', ic: 'ney'},
    {id: 'isik', f: 'where_the_light_rests.mp3', n: 'Işığın Dinlendiği Yer', s: '1:03', ic: 'isik'},
    {id: 'kubbe', f: 'the_vaulted_study.mp3', n: 'Kubbeli Çalışma Odası', s: '1:57', ic: 'ezgi'},
    {id: 'cam', f: 'rain_on_the_pane.mp3', n: 'Cama Vuran Yağmur', s: '0:57', ic: 'cam'}
  ];
  V42.var = (m) => !!$id('m42-' + m.id);
  V42._url = {};
  V42.muzikURL = function (id) {
    if (V42._url[id]) return Promise.resolve(V42._url[id]);
    return new Promise((ok, no) => {
      try {
        const e = $id('m42-' + id); if (!e) throw new Error('kayıt yok');
        const s = atob(e.textContent.trim()), n = s.length, u = new Uint8Array(n);
        for (let i = 0; i < n; i++) u[i] = s.charCodeAt(i);
        ok(V42._url[id] = URL.createObjectURL(new Blob([u], {type: 'audio/mpeg'})));
      } catch (er) { no(er); }
    });
  };
  if (typeof ATM !== 'undefined') {
    ATM.CAT = ATM.CAT.filter((c) => c.id !== 'muzik42');
    ATM.CAT.unshift({id: 'muzik42', n: 'Kayıtlı müzikler', d: 'Uygulamanın içinde, internetsiz çalar. Aynı anda bir müzik çalar; doğa sesleriyle karıştırabilirsin.'});
    // müzik blokları ana betikten sonra gelir (henüz DOM'da değiller): kayıt koşulsuz, veri çalma anında okunur
    V42.MUZ.forEach((m) => { if (!ATM.byId('m42_' + m.id)) ATM.S.push({id: 'm42_' + m.id, cat: 'muzik42', n: m.n, d: 'Kayıtlı müzik · ' + m.s, ic: m.ic, k: 'm42:' + m.id, m42: m}); });
    // V33 temizliği, önceki açılışta seçilmiş müzikleri (o anda listede olmadıkları için) silmiş olabilir: ham kayıttan geri al.
    try {
      const ham = window.ATM42HAM;
      if (ham && ham.indexOf('m42_') >= 0) { const o = JSON.parse(ham); if (o && typeof o === 'object') { ATM.st = Object.assign(ATM.def(), o); V33.sanAtm(); ATM.save(); } }
    } catch (e) {}
    const isM = (id) => { const s = ATM.byId(id); return !!(s && s.m42); };
    const sL = ATM.startLayer;
    ATM.startLayer = async function (id) {
      const s = ATM.byId(id); if (!s || !s.m42) return sL.apply(this, arguments);
      const R = ATM.rt; if (R.nodes[id]) return; const l = ATM.st.L.find((x) => x.id === id); if (!l) return;
      R.nodes[id] = {loading: true}; ATM.paint();
      let url; try { url = await V42.muzikURL(s.m42.id); } catch (e) { delete R.nodes[id]; UI.toast('Müzik açılamadı: ' + s.n); ATM.paint(); return; }
      const cur = R.nodes[id]; if (!cur || !cur.loading || !ATM.has(id) || !ATM.live()) { if (cur && cur.loading) delete R.nodes[id]; return; }
      const el = new Audio(); el.loop = true; el.preload = 'auto'; el.src = url;
      let src; try { src = R.ctx.createMediaElementSource(el); } catch (e) { delete R.nodes[id]; UI.toast('Müzik çalınamadı: ' + s.n); ATM.paint(); return; }
      const g = R.ctx.createGain(), an = R.ctx.createAnalyser(); an.fftSize = 256; g.gain.value = 0; src.connect(g); g.connect(an); an.connect(R.master);
      const dur = () => { try { el.pause(); el.removeAttribute('src'); el.load(); } catch (e) {} try { src.disconnect(); g.disconnect(); an.disconnect(); } catch (e) {} };
      // ATM.stopLayer, kaynağın stop(t) yöntemini çağırır: sesi kıstıktan sonra öğeyi durdur.
      R.nodes[id] = {src: {stop: (t) => setTimeout(dur, Math.max(0, ((t || 0) - R.ctx.currentTime) * 1000))}, el, g, an, loading: false, m42: 1};
      try { await el.play(); } catch (e) { UI.toast('Müzik başlatılamadı: ' + s.n); }
      g.gain.setTargetAtTime(l.on === false ? 0 : l.v, R.ctx.currentTime, 0.4); ATM.paint();
    };
    const pz = ATM.pause;
    ATM.pause = function () { const r = pz.apply(this, arguments); const R = ATM.rt; Object.keys(R.nodes).forEach((id) => { const n = R.nodes[id]; if (n && n.m42 && n.el) setTimeout(() => { if (R.paused) try { n.el.pause(); } catch (e) {} }, 300); }); return r; };
    const pl = ATM.play;
    ATM.play = async function () { const r = await pl.apply(this, arguments); const R = ATM.rt; if (R.playing) Object.keys(R.nodes).forEach((id) => { const n = R.nodes[id]; if (n && n.m42 && n.el && n.el.paused) n.el.play().catch(() => {}); }); return r; };
    // Aynı anda tek müzik: yeni müzik seçilince önceki müzik karışımdan çıkar.
    const ts = ATM.toggleSound;
    ATM.toggleSound = async function (id) {
      if (isM(id) && !ATM.has(id)) { const eski = ATM.st.L.filter((x) => isM(x.id)); if (eski.length) { eski.forEach((x) => ATM.stopLayer(x.id)); ATM.st.L = ATM.st.L.filter((x) => !isM(x.id)); UI.toast('Önceki müzik durduruldu; aynı anda bir müzik çalar.'); } }
      return ts.apply(this, arguments);
    };
    const tb = ATM.tabBody;
    ATM.tabBody = function () {
      let h = tb.apply(this, arguments); const t = ATM.st.tab;
      if (t === 'sesler') h = h.replace('Doğa ve gürültü sesleri cihazında üretilir; internet gerekmez.', 'Doğa ve gürültü sesleri cihazında üretilir; kayıtlı müzikler uygulama dosyasının içindedir. İkisi de internet gerektirmez.');
      if (t === 'kaynak') {
        h = h.replace('<b>Gerçek enstrüman kaydı yok:</b> bu sürümde internetten ses dosyası indirilemediği için ney/kanun/ud kaydı eklenmedi. Sentetik enstrüman sesleri kaldırıldı.', '<b>Lisans bilgisi doğrulanmış (manifest) enstrüman kaydı yok.</b> Sentetik enstrüman sesleri kaldırıldı.');
        h = `<div class="m42-kay"><p class="small"><b>Kayıtlı müzikler</b> (${V42.MUZ.filter(V42.var).length} parça, V42.0): dosyalar platform sahibi tarafından sağlandı ve uygulama dosyasının içine gömüldü (64 kbps MP3; özgün dosyalar 192 kbps). Adlar dosya adlarının Türkçesidir.</p><div class="atm-lic">${V42.MUZ.filter(V42.var).map((m) => `<details><summary>${esc(m.n)}</summary><dl><dt>Dosya</dt><dd>${esc(m.f)}</dd><dt>Süre</dt><dd>${esc(m.s)}</dd><dt>Kaynak</dt><dd>Platform sahibi tarafından sağlandı</dd><dt>Sanatçı/üretici</dt><dd>Kaynakta veri bulunmuyor.</dd><dt>Lisans</dt><dd>Kaynakta veri bulunmuyor.</dd><dt>Çevrimdışı</dt><dd>Evet — uygulama dosyasının içinde</dd></dl></details>`).join('')}</div></div>` + h;
      }
      return h;
    };
  }

  // Hızlı ses paneli (üst çubuktaki ses düğmesi): “Müzikler” listesi; dokununca o müzik tek başına çalar
  V42.muzikCal = function (id) {
    const s = ATM.byId('m42_' + id); if (!s) return;
    if (ATM.has(s.id) && ATM.live() && ATM.st.L.length === 1) { ATM.toggle(); return; }
    ATM.rt.qi = -1; ATM.loadMix([[s.id, 0.8]], s.n, true);
  };
  if (typeof V37 !== 'undefined' && V37.sndBody) {
    const sb = V37.sndBody;
    V37.sndBody = function () {
      const h = sb.apply(this, arguments), M = V42.MUZ.filter(V42.var); if (!M.length) return h;
      const R = ATM.rt, li = M.map((m) => { const on = ATM.has('m42_' + m.id) && ATM.live(); return `<li><button class="snd37-m m42-m${on ? ' on' : ''}" aria-pressed="${on}" onclick="V42.muzikCal('${m.id}')"><b>${esc(m.n)}</b><small>Kayıtlı müzik · ${m.s}</small>${on ? `<span class="snd37-now">${R.playing ? 'Çalıyor' : 'Duraklatıldı'}</span>` : ''}</button></li>`; }).join('');
      return h.replace('<h3>Ses seç</h3>', `<h3>Müzikler</h3><ul class="snd37-l m42-l">${li}</ul><h3>Ses seç</h3>`);
    };
  }

  /* ---------- 2. Giriş (seçim) ekranı ---------- */
  // Klasik kart görseli: kemerli pencere, kafes, raflar ve rahle üzerinde açık kitap (yalnızca çizim; yazı içermez).
  V42.kitaplik = function () {
    let r = 7, rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    const C = ['#7d3434', '#1f5a4a', '#2d416b', '#a8843c', '#5b3f28', '#3d5f3a', '#6b3550'];
    const raf = (x0, w) => { let s = ''; for (let k = 0; k < 3; k++) { const y = 38 + k * 44; let x = x0 + 3; s += `<rect x="${x0}" y="${y + 36}" width="${w}" height="3.5" fill="#c9a35a"/>`; while (x < x0 + w - 8) { const bw = 5 + Math.round(rnd() * 5), bh = 22 + Math.round(rnd() * 12), c = C[Math.floor(rnd() * C.length)]; s += `<rect x="${x}" y="${y + 36 - bh}" width="${bw}" height="${bh}" rx="1" fill="${c}"/><rect x="${x}" y="${y + 36 - bh + 4}" width="${bw}" height="1.6" fill="#e6c77f" opacity=".7"/>`; x += bw + 1.4; } } return s; };
    const yildiz = (cx, cy, R) => { const p = []; for (let i = 0; i < 16; i++) { const a = Math.PI / 8 * i - Math.PI / 2, q = i % 2 ? R * 0.52 : R; p.push((cx + q * Math.cos(a)).toFixed(1) + ',' + (cy + q * Math.sin(a)).toFixed(1)); } return `<polygon points="${p.join(' ')}"/>`; };
    let kafes = ''; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) kafes += yildiz(140 + i * 13.3, 52 + j * 15, 6);
    return `<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><radialGradient id="kg42" cx="50%" cy="38%" r="60%"><stop offset="0" stop-color="#2f6b55"/><stop offset=".55" stop-color="#123a2e"/><stop offset="1" stop-color="#08140f"/></radialGradient><radialGradient id="kl42" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient><linearGradient id="kw42" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e2b0" stop-opacity=".35"/><stop offset="1" stop-color="#d6b46a" stop-opacity=".08"/></linearGradient></defs>
<rect width="320" height="180" fill="url(#kg42)"/>
<path d="M128 150V62q0-30 32-44q32 14 32 44v88z" fill="url(#kw42)" stroke="#d8b46a" stroke-width="2"/><g fill="none" stroke="#e7c983" stroke-width=".9" opacity=".75" clip-path="url(#kc42)">${kafes}</g><clipPath id="kc42"><path d="M131 148V63q0-27 29-41q29 14 29 41v85z"/></clipPath>
<line x1="160" y1="0" x2="160" y2="20" stroke="#c9a35a" stroke-width="1.2"/><circle cx="160" cy="34" r="26" fill="url(#kl42)"/><path d="M152 22h16l-3 14h-10z" fill="#c9a35a"/><path d="M155 36h10l-5 7z" fill="#f3d58f"/>
<g>${raf(12, 92)}</g><g>${raf(216, 92)}</g>
<rect x="8" y="34" width="100" height="134" fill="none" stroke="#8a6a35" stroke-width="2.4" rx="2"/><rect x="212" y="34" width="100" height="134" fill="none" stroke="#8a6a35" stroke-width="2.4" rx="2"/>
<path d="M126 176l34-30 34 30" fill="none" stroke="#a8823f" stroke-width="5" stroke-linecap="round"/><path d="M126 146l34 30 34-30" fill="none" stroke="#8a6a35" stroke-width="5" stroke-linecap="round"/>
<path d="M118 142q21-12 42 0q21-12 42 0v6q-21-10-42 0q-21-10-42 0z" fill="#f4ead2" stroke="#c9a35a" stroke-width="1.2"/><path d="M160 142v6" stroke="#b08a3e"/><g stroke="#c8b48a" stroke-width=".8" opacity=".8"><path d="M126 140.5q14-6 28-.5M126 136.5q14-6 28-.5M166 140q14-5.5 28 .5M166 136q14-5.5 28 .5"/></g>
<rect x="0" y="168" width="320" height="12" fill="#06100c"/></svg>`;
  };
  V42.motif = `<svg class="o42-motif" viewBox="0 0 120 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1"><path d="M0 12h44M76 12h44"/><rect x="52" y="4" width="16" height="16" transform="rotate(45 60 12)"/><rect x="52" y="4" width="16" height="16"/><circle cx="60" cy="12" r="2.6" fill="currentColor"/></g></svg>`;

  const eskiSecim = V39.secim;
  V39.secim = function (show) {
    let o = $id('uye39');
    if (!show) { if (o) o.remove(); V42._uyeH = 0; try { document.documentElement.classList.remove('uye39-acik'); } catch (e) {} return; }
    const P = V39.pref(), u = V39.Uyelik.premium(), orta = !!V42.hazir && !V42._acilis;
    if (!o) {
      o = document.createElement('div'); o.id = 'uye39'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'uye39-h'); document.body.appendChild(o);
      if (orta) { try { history.pushState({v30: V30.cur, u42: 1}, ''); V42._uyeH = 1; } catch (e) {} }
    }
    o.className = 'o42';
    document.documentElement.classList.add('uye39-acik');
    const son = (k) => P.son === k ? `<span class="o42-son">${V42.svg('ok', 14)} Son kullandığın</span>` : '';
    o.innerHTML = `<div class="uye39-in o42-in">
 <header class="o42-ust">${orta ? `<button type="button" class="o42-geri" onclick="V42.secimKapat()">${V42.svg('geri', 18)}<span>Geri dön</span></button>` : `<span class="o42-logo">${V39.emb(44)}</span>`}
  <span class="o42-sp"></span><button type="button" class="uye39-lnk o42-ogr" onclick="V42.geriSonra(()=>{V39.secim(false);go('ogretmen')})">${V42.svg('teach', 18)}<span>Öğretmen paneli</span></button></header>
 <div class="o42-bas"><p class="uye39-k">Din Kültürü ve Ahlak Bilgisi</p><h1 id="uye39-h" tabindex="-1">Nasıl öğrenmek istersin?</h1>${V42.motif}<p class="o42-acik">İki alan da aynı ders içeriklerini ve aynı ilerleme kaydını kullanır.</p></div>
 <div class="uye39-opts o42-kartlar">
  <section class="uye39-c cn o42-k o42-kn${P.son === 'normal' ? ' son' : ''}" aria-labelledby="o42-kn-h">
   <div class="o42-gor">${V42.kitaplik()}</div>
   <div class="o42-ic"><div class="o42-ets"><span class="o42-etk">${V42.svg('book', 14)} Klasik</span>${son('normal')}</div>
    <h2 id="o42-kn-h">Klasik Öğrenme Alanı</h2><p>Sade ve hızlı: sınıflar, konular, kartlar, testler ve oyunlar aynı ekranda.</p>
    <ul class="o42-oz"><li>Tüm sınıflar tek listede</li><li>Hafif; eski cihazlarda da akıcı</li></ul>
    <button type="button" class="uye39-b cn o42-b" onclick="V39.sec('normal')"><span>Klasik alana gir</span>${V42.svg('sag', 18)}</button></div></section>
  <section class="uye39-c cp o42-k o42-kp${P.son === 'premium' ? ' son' : ''}" aria-labelledby="o42-kp-h">
   <div class="o42-gor o42-kemer"><img src="${V42.KP || ''}" alt="" decoding="async" width="640" height="374"><i class="o42-isik" aria-hidden="true"></i></div>
   <div class="o42-ic"><div class="o42-ets"><span class="o42-etk p">${V42.svg('star', 14)} Premium</span>${son('premium')}</div>
    <h2 id="o42-kp-h">Premium Öğrenme Dünyası</h2><p>Okul koridorunda yürü, sınıfının kapısını aç; dersler, sınıf merkezi ve Oyun Dünyası seni bekliyor.</p>
    <ul class="o42-oz"><li>3B okul koridoru ve sınıf merkezleri</li><li>Oyun Dünyası, favoriler, ilerleme</li></ul>
    <p class="uye39-not">${esc(u.aciklama || '')}</p>
    <button type="button" class="uye39-b cp o42-b" onclick="V39.sec('premium')"><span>Öğrenme Dünyası'na gir</span>${V42.svg('sag', 18)}</button></div></section>
 </div>
 <footer class="o42-alt"><label class="uye39-h"><input type="checkbox" id="uye39-hat" ${P.hatirla ? 'checked' : ''}> Seçimimi hatırla; bir dahaki açılışta sormadan aç</label>
  <p class="uye39-alt">${V42.svg('swap', 16)} İstediğin zaman deneyimini değiştirebilirsin: her ekranda <b>Klasik</b> / <b>Premium</b> düğmesi var.</p></footer></div>`;
    o.onkeydown = (e) => { if (e.key === 'Escape' && orta) { e.stopPropagation(); V42.secimKapat(); } };
    // odak başlığa: ekran okuyucu soruyu okur, dokunmatik ekranda düğmede kalın odak halkası görünmez
    try { o.querySelector('#uye39-h').focus({preventScroll: true}); } catch (e) {}
  };
  V42.secimKapat = function () { if (V42._uyeH && history.state && history.state.u42) history.back(); else V39.secim(false); };
  // Seçim ekranı geçmişe eklenmişse: önce o kaydı geri al, sonra işlemi yap (Android/tarayıcı geri tuşu fazladan basış istemez).
  V42.geriSonra = function (fn) {
    if (V42._uyeH && history.state && history.state.u42) { V42._then = fn; history.back(); V42._thenT = setTimeout(() => { if (V42._then) { const f = V42._then; V42._then = null; f(); } }, 600); }
    else fn();
  };
  V39.sec = function (k) {
    const h = $id('uye39-hat'); V39.setPref({hatirla: !!(h && h.checked)});
    const yap = () => { if (k === 'premium') V39.toPremium(); else V39.toNormal(); };
    if (V42._acilis) { // açılıştaki seçim geçmişin kökü olur: geri tuşu Klasik ana sayfaya düşmez
      V42._acilis = 0; V30.noPush = 1; try { yap(); } finally { V30.noPush = 0; }
      V30.hist = []; V30.cur = 0; try { history.replaceState({v30: 0}, ''); } catch (e) {} return;
    }
    V42.geriSonra(yap);
  };

  /* ---------- 3. Deneyim değiştirme ---------- */
  V42.PREM = () => V39.ROUTES || [];
  V42.hedef = function (mod) {
    if (mod === 'normal') {
      const g = +G.pg;
      if (['psinif', 'punite', 'pozet'].includes(view) && g) return {v: 'grade', a: {g}, t: `${g}. sınıf`};
      if (view === 'pders' && G.pt) { const t = Store.get('topics', G.pt); if (t) return {v: 'topic', a: {t: t.id, tab: 'anlat'}, t: `${t.grade}. sınıf · ${t.title}`}; }
      if (view === 'poyun' || view === 'poyna') return {v: 'games', a: null, t: 'Oyunlar'};
      return {v: 'home', a: null, t: 'Ana sayfa'};
    }
    if (view === 'grade' && G.g && (V39.GR || []).includes(+G.g)) return {v: 'psinif', a: {pg: +G.g}, t: `${+G.g}. Sınıf Merkezi`};
    if (view === 'topic' && G.t) { const t = Store.get('topics', G.t); if (t && (V39.GR || []).includes(+t.grade)) return {v: 'pders', a: {pt: t.id, ptab: 'anlat'}, t: `${t.grade}. sınıf · ${t.title}`}; }
    if (view === 'games') return {v: 'poyun', a: null, t: 'Oyun Dünyası'};
    return {v: 'pdunya', a: null, t: 'Okul koridoru'};
  };
  V42.gec = function (mod) {
    const h = V42.hedef(mod);
    if (mod === 'premium') {
      const u = V39.Uyelik.premium(); if (!u.izin) { UI.toast(u.aciklama || "Öğrenme Dünyası'na erişim yok."); return; }
      V39.on = true; try { sessionStorage.setItem(V39.SK, '1'); } catch (e) {}
    } else { V39.on = false; try { sessionStorage.removeItem(V39.SK); } catch (e) {} }
    V39.setPref({son: mod === 'premium' ? 'premium' : 'normal'}); V39.secim(false); V39.attr(); go(h.v, h.a);
  };
  V42.degistir = function () {
    const p = !!V39.on, hd = V42.hedef(p ? 'normal' : 'premium');
    UI.sheet({title: 'Deneyimi değiştir', body: () => `<div class="dg42s"><p class="dg42-su">Şu an: <b>${p ? 'Premium Öğrenme Dünyası' : 'Klasik Öğrenme Alanı'}</b></p>
  <button type="button" class="dg42-sec ${p ? 'kn' : 'kp'}" onclick="UI.close();setTimeout(()=>V42.gec('${p ? 'normal' : 'premium'}'),220)"><span class="dg42-i">${V42.svg(p ? 'book' : 'door', 24)}</span><span class="dg42-t"><b>${p ? 'Klasik Öğrenme Alanı’na geç' : 'Premium Öğrenme Dünyası’na geç'}</b><small>Açılacak yer: ${esc(hd.t)}</small></span>${V42.svg('sag', 18)}</button>
  <button type="button" class="dg42-sec" onclick="UI.close();setTimeout(()=>V39.secim(true),220)"><span class="dg42-i">${V42.svg('swap', 24)}</span><span class="dg42-t"><b>Giriş ekranına dön</b><small>İki deneyimin tanıtıldığı seçim ekranı</small></span>${V42.svg('sag', 18)}</button>
  <p class="dg42-not">İlerlemen, favorilerin, notların ve ayarların iki alanda da korunur.</p></div>`, footer: () => '<button onclick="UI.close()">Vazgeç</button>'});
  };
  V42.dugme = (p, cls) => `<button type="button" class="dg42 ${cls || ''}" onclick="V42.degistir()" aria-label="${p ? 'Klasik alana geç — deneyimi değiştir' : 'Premium Öğrenme Dünyası’na geç — deneyimi değiştir'}">${V42.svg('swap', 18)}<span>${p ? 'Klasik' : 'Premium'}</span></button>`;
  // Premium ortak üst çubuk: simgeli düğme yazılı olur (dar ekranda da “Klasik” yazar)
  const top0 = V39.top;
  V39.top = function () { return top0.apply(this, arguments).replace(/<button class="p39-ib p39-sw"[^>]*>/, '<button type="button" class="p39-ib p39-sw dg42" onclick="V42.degistir()" aria-label="Klasik alana geç — deneyimi değiştir">'); };
  // Koridor üst çubuğu: yer olmadığı için düğme çubuğun hemen altında, solda (sağdaki “?” ile simetrik)
  if (typeof V40 !== 'undefined' && V40.ustHTML) { const u0 = V40.ustHTML; V40.ustHTML = function () { return u0.apply(this, arguments).replace(/<\/header>\s*$/, V42.dugme(true, 'yuz') + '</header>'); }; }
  V42.yerlestir = function () {
    try {
      if (V39.on && !(V39.NOPREM || []).includes(view)) {
        const bar = $id('p39bar'); if (bar && !bar.querySelector('.dg42')) bar.insertAdjacentHTML('beforeend', V42.dugme(true, 'bar'));
        const k = $id('dg42k'); if (k) k.remove();
      } else if (!V39.on && !(V39.NOPREM || []).includes(view) && !document.body.hasAttribute('data-ogrt37')) {
        const h = document.querySelector('header.top'); if (h && !$id('dg42k')) { const ref = $id('snd37') || h.querySelector('.iconbtn'); const t = document.createElement('div'); t.innerHTML = V42.dugme(false, 'kl'); const b = t.firstChild; b.id = 'dg42k'; if (ref) ref.before(b); else h.appendChild(b); }
      } else { const k = $id('dg42k'); if (k) k.remove(); }
    } catch (e) { console.warn('[V42] deneyim düğmesi', e); }
  };
  const d0 = draw;
  draw = function () { const r = d0.apply(this, arguments); V42.yerlestir(); return r; };
  // Oyun ekranı: giriş kartında ve duraklatma menüsünde deneyim değiştirme; duraklat düğmesi yazılı (“Menü”)
  try {
    const K = V41.oyunlar.kutuphane;
    if (K && K.giris) { const g0 = K.giris; K.giris = function () { const r = g0.apply(this, arguments); const gr = document.querySelector('#o41 .o41-giris'); if (gr && !gr.querySelector('.dg42')) gr.insertAdjacentHTML('afterbegin', V42.dugme(true, 'oy')); return r; }; }
    if (K && K.odaAc) { const a0 = K.odaAc; K.odaAc = function () { const r = a0.apply(this, arguments); const b = document.querySelector('#o41 .o41-hud .o41-ib'); if (b && !b.querySelector('.m42t')) { b.insertAdjacentHTML('beforeend', '<span class="m42t">Menü</span>'); b.classList.add('o42-menu'); b.setAttribute('aria-label', 'Menü — oyunu duraklat'); } return r; }; }
    const m0 = V41.menu;
    V41.menu = function (ac) { const r = m0.apply(this, arguments); if (ac) { const k = document.querySelector('#o41m .o41-kart'); if (k && !k.querySelector('.dg42')) { const son = [...k.querySelectorAll('.o41-b')].pop(); const t = document.createElement('div'); t.innerHTML = `<button type="button" class="o41-b dg42 mn" onclick="V42.degistir()">${V42.svg('swap', 18)}<span>Deneyimi değiştir (Klasik alan)</span></button>`; if (son) son.after(t.firstChild); else k.appendChild(t.firstChild); } } return r; };
  } catch (e) { console.warn('[V42] oyun düğmeleri', e); }

  /* ---------- 4. Geri tuşu (tarayıcı ve Android) ---------- */
  const sn0 = V30.snap;
  V30.snap = function () { const s = sn0.apply(this, arguments); s.m42 = V39.on ? 1 : 0; return s; };
  const rs0 = V30.restore;
  V30.restore = function (s) {
    try {
      if (s && 'm42' in s) { const on = !!s.m42; if (on !== !!V39.on) { V39.on = on; try { on ? sessionStorage.setItem(V39.SK, '1') : sessionStorage.removeItem(V39.SK); } catch (e) {} V39.setPref({son: on ? 'premium' : 'normal'}); } }
      if ($id('uye39') && !V42._acilis) V39.secim(false);
    } catch (e) {}
    return rs0.apply(this, arguments);
  };
  addEventListener('popstate', () => {
    if (V42._then) { clearTimeout(V42._thenT); const f = V42._then; V42._then = null; V42._uyeH = 0; f(); return; }
    if (V42._uyeH && $id('uye39')) V39.secim(false);
  });

  /* ---------- 5. Klavye: görünür alan (visualViewport) ---------- */
  V42.hMax = innerHeight; V42.wSon = innerWidth;
  V42.vv = function () {
    const v = window.visualViewport, de = document.documentElement;
    if (innerWidth !== V42.wSon) { V42.wSon = innerWidth; V42.hMax = innerHeight; }
    V42.hMax = Math.max(V42.hMax, innerHeight);
    const vh = v ? v.height : innerHeight, kb = v ? Math.max(0, Math.round(innerHeight - v.height - v.offsetTop)) : 0;
    const a = document.activeElement, yazi = !!(a && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && !/^(checkbox|radio|range|button|submit|file|color)$/i.test(a.type))));
    const acik = yazi && (kb > 80 || V42.hMax - innerHeight > 120);
    de.style.setProperty('--kb42', kb + 'px'); de.style.setProperty('--vvh42', Math.round(vh) + 'px');
    if (de.classList.contains('kb42') !== acik) de.classList.toggle('kb42', acik);
    if (acik) { clearTimeout(V42._kbT); V42._kbT = setTimeout(() => { try { const r = a.getBoundingClientRect(); if (r.bottom > vh - 8 || r.top < 0) a.scrollIntoView({block: 'center'}); } catch (e) {} }, 90); }
  };
  if (window.visualViewport) { visualViewport.addEventListener('resize', V42.vv); visualViewport.addEventListener('scroll', V42.vv); }
  addEventListener('resize', V42.vv); addEventListener('focusin', () => setTimeout(V42.vv, 350)); addEventListener('focusout', () => setTimeout(V42.vv, 120));

  /* ---------- açılış ---------- */
  try {
    if ($id('uye39')) { V42._acilis = 1; V39.secim(true); }
    V42.yerlestir(); V42.hazir = true;
  } catch (e) { console.error('[V42] açılış', e); V42.hazir = true; }
})();
