/* ===================== V47.0: Ayarlar (Profilim › Görünüm ve ses) — rota: ayar47 =====================
   Beş bölüm, her biri ayrı sekmede: Öğrenme alanı · Tema · Hareket · Ses ve müzik · Ders Atmosferi.
   Mevcut ayarları ve kayıtları kullanır (yeni anahtar yalnızca Elmas için otomatik tema: dk-tema47 = 'oto').
     Öğrenme alanı  → V42.gec('normal' | 'premium')         (dk-deneyim39 aynı)
     Tema           → Elmas: dk-theme (açık/koyu) + dk-tema47 (otomatik) · Altın: V43.ayarla (dk-ptema43)
     Hareket        → V30.setFx (animasyonlar) · V311.setLite (düşük donanım, dk-lite) · V40.setLite (koridor sade görünüm)
     Ses ve müzik   → ATM.setMaster / ATM.toggle / ATM.stopAll · V42.muzikCal
     Ders Atmosferi → durum ATM.st / ATM.rt, ATM.open, hazır karışımlar ATM.PRE */
(function () {
  const V47 = window.V47 = window.V47 || {};
  const A = V47.Ayar = {};
  const AL = () => !!(typeof V39 !== 'undefined' && V39.on);
  const ADLAR = {normal: 'Elmas Öğrenme Alanı', premium: 'Altın Öğrenme Alanı'};
  const BOL = [['alan', 'Öğrenme alanı'], ['tema', 'Tema'], ['hareket', 'Hareket'], ['ses', 'Ses ve müzik'], ['atmosfer', 'Ders Atmosferi']];

  /* ---------- Elmas: otomatik tema ---------- */
  const K47 = 'dk-tema47', mq = window.matchMedia ? matchMedia('(prefers-color-scheme: light)') : null;
  A.elmasTema = () => { let o = ''; try { o = localStorage.getItem(K47) || ''; } catch (e) {} return o === 'oto' ? 'oto' : (themeNow() === 'light' ? 'acik' : 'koyu'); };
  A.elmasUygula = function () {
    if (AL()) return; let o = ''; try { o = localStorage.getItem(K47) || ''; } catch (e) {}
    if (o !== 'oto') return; const t = mq && mq.matches ? 'light' : 'dark';
    if (document.documentElement.dataset.theme !== t) { document.documentElement.dataset.theme = t; try { localStorage.setItem('dk-theme', t); } catch (e) {} try { themeBtns(); } catch (e) {} }
  };
  A.elmasSec = function (v) {
    try { if (v === 'oto') localStorage.setItem(K47, 'oto'); else localStorage.removeItem(K47); } catch (e) {}
    if (v === 'oto') A.elmasUygula(); else { const t = v === 'acik' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; try { localStorage.setItem('dk-theme', t); } catch (e) {} try { themeBtns(); } catch (e) {} }
    A.ciz();
  };
  try { mq && mq.addEventListener('change', A.elmasUygula); } catch (e) {}
  A.elmasUygula();

  /* ---------- küçük önizlemeler (SVG) ---------- */
  const ON = {
    normal: '<svg viewBox="0 0 120 72" aria-hidden="true"><rect width="120" height="72" rx="10" fill="#eef2f8"/><rect x="8" y="8" width="104" height="10" rx="5" fill="#fff"/><rect x="8" y="24" width="50" height="20" rx="6" fill="#dbe5ff"/><rect x="62" y="24" width="50" height="20" rx="6" fill="#d9f2ec"/><rect x="8" y="48" width="50" height="16" rx="6" fill="#ede5ff"/><rect x="62" y="48" width="50" height="16" rx="6" fill="#ffefd6"/><circle cx="16" cy="13" r="3" fill="#5b7cfa"/></svg>',
    premium: '<svg viewBox="0 0 120 72" aria-hidden="true"><defs><linearGradient id="ap47" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2614"/><stop offset="1" stop-color="#140d08"/></linearGradient></defs><rect width="120" height="72" rx="10" fill="url(#ap47)"/><path d="M0 72 44 40h32l44 32z" fill="#2b1e12"/><path d="M60 40v32M52 40l-10 32M68 40l10 32" stroke="#e2b765" stroke-opacity=".35"/><path d="M48 40V22a12 12 0 0 1 24 0v18z" fill="#6b4224" stroke="#e2b765"/><circle cx="60" cy="24" r="9" fill="#ffd890" opacity=".35"/><rect x="18" y="20" width="10" height="20" rx="5" fill="#ffe6b0" opacity=".5"/><rect x="92" y="20" width="10" height="20" rx="5" fill="#ffe6b0" opacity=".5"/></svg>'
  };
  const sw = (a, b) => `<span class="a47-sw" aria-hidden="true"><i style="background:${a}"></i><i style="background:${b}"></i></span>`;
  const anahtar = (ad, ack, on, f, dis) => `<div class="a47-sat"><span><b>${ad}</b><small>${ack}</small></span><button type="button" role="switch" aria-checked="${!!on}" class="a47-anh ${on ? 'on' : ''}" ${dis ? 'disabled' : ''} onclick="${f}" aria-label="${ad}"><i></i></button></div>`;

  /* ---------- bölümler ---------- */
  const B = {};
  B.alan = () => { const m = AL() ? 'premium' : 'normal';
    return `<p class="a47-ack">İki ayrı öğrenme deneyimi. İçerikler ve ilerlemen aynıdır; görünüm ve gezinme değişir.</p><div class="a47-alan">${['normal', 'premium'].map((k) => `<button type="button" class="a47-dk ${k === 'normal' ? 'el' : 'al'} ${k === m ? 'on' : ''}" aria-pressed="${k === m}" onclick="V47.Ayar.alanSec('${k}')"><span class="a47-on">${ON[k]}</span><span class="a47-dt"><b>${ADLAR[k]}</b><small>${k === 'normal' ? 'Sade, ferah ve hızlı. Az hareket, düzenli ekranlar.' : 'Atmosferik ve keşif odaklı. 3B koridor, derinlik ve geçişler.'}</small>${k === m ? '<em class="a47-etkin">Şu an kullanılıyor</em>' : '<em class="a47-gec">Bu alana geç</em>'}</span></button>`).join('')}</div>
<p class="small mut">Açılışta soru sorulmasını istersen: deneyim seçim ekranında “Seçimimi hatırla” kutusunu kaldır.</p><div class="p46-bb"><button type="button" onclick="V39.secim(true)">Seçim ekranını aç</button></div>`; };
  B.tema = () => {
    const el = A.elmasTema(), pt = (typeof V43 !== 'undefined' && V43.tercih) ? V43.tercih() : 'gece';
    const elmasH = `<div class="a47-tm">${[['acik', 'Açık', '#f5f6f8', '#5b7cfa'], ['koyu', 'Koyu', '#0f1522', '#7aa2ff'], ['oto', 'Otomatik', 'linear-gradient(90deg,#f5f6f8 50%,#0f1522 50%)', '#7aa2ff']].map(([k, n, a, b]) => `<button type="button" class="a47-to ${el === k ? 'on' : ''}" aria-pressed="${el === k}" onclick="V47.Ayar.elmasSec('${k}')">${sw(a, b)}<b>${n}</b>${k === 'oto' ? '<small>Cihazın temasını izler</small>' : ''}</button>`).join('')}</div>`;
    const altinH = `<div class="a47-tm">${[['gunduz', 'Gündüz', '#f4ead6', '#9a6b22'], ['gece', 'Gece', '#140d08', '#e2b765'], ['oto', 'Otomatik', 'linear-gradient(90deg,#f4ead6 50%,#140d08 50%)', '#e2b765']].map(([k, n, a, b]) => `<button type="button" class="a47-to ${pt === k ? 'on' : ''}" aria-pressed="${pt === k}" onclick="V43.ayarla('${k}');V47.Ayar.ciz()">${sw(a, b)}<b>${n}</b>${k === 'oto' ? '<small>Cihazın temasını izler</small>' : ''}</button>`).join('')}</div>`;
    return AL() ? `<h3 class="a47-h">Altın Öğrenme Alanı</h3>${altinH}<details class="a47-d"><summary>Elmas Öğrenme Alanı’nın teması</summary><p class="small mut">Elmas alanına geçince uygulanır.</p>${elmasH}</details>`
      : `<h3 class="a47-h">Elmas Öğrenme Alanı</h3>${elmasH}<details class="a47-d"><summary>Altın Öğrenme Alanı’nın teması</summary><p class="small mut">Altın alanına geçince uygulanır.</p>${altinH}</details>`;
  };
  B.hareket = () => {
    const fx = !!V30.pref.get().fx, lite = !!(typeof V311 !== 'undefined' && V311.lite), az = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    let kor = false; try { kor = V40.lite(); } catch (e) {}
    return `${anahtar('Animasyonlar', 'Geçişler, kaydırma ve parallax efektleri. Kapalıyken her şey aynen çalışır.', fx, 'V30.setFx(!V30.pref.get().fx);V47.Ayar.ciz()')}
${anahtar('Düşük donanım modu', 'Cam ve bulanıklık efektlerini kapatır, yüzeyleri sadeleştirir. Eski telefonlarda daha akıcı.', lite, 'V311.setLite(!V311.lite);V47.Ayar.ciz()')}
${anahtar('Koridorda sade görünüm', 'Altın alandaki 3B koridoru daha hafif çizer.', kor, 'V40.setLite(!V40.lite());V47.Ayar.ciz()')}
<div class="a47-sat"><span><b>Hareketi azalt (cihaz ayarı)</b><small>${az ? 'Cihazında açık: animasyonlar kendiliğinden azaltılır.' : 'Cihazında kapalı. Açarsan uygulama da animasyonları azaltır.'}</small></span><span class="a47-dur ${az ? 'on' : ''}">${az ? 'Açık' : 'Kapalı'}</span></div>
<details class="a47-d"><summary>Cihaz hareketi (jiroskop)</summary><p class="small mut">Telefonu eğince illüstrasyonların hafifçe kayması. İsteğe bağlıdır; izin ister.</p><div class="p46-bb"><button type="button" onclick="V47.eskiAyar()">Cihaz hareketi ayarlarını aç</button></div></details>`;
  };
  B.ses = () => {
    const s = V47.Ses ? V47.Ses.durum() : {calisiyor: false, katman: [], ses: .75}, M = (typeof V42 !== 'undefined' && V42.MUZ) ? V42.MUZ.filter(V42.var || (() => true)) : [];
    const durum = s.calisiyor ? 'Çalıyor' : s.duraklatildi ? 'Duraklatıldı' : 'Kapalı';
    return `<div class="a47-sat"><span><b>Ses seviyesi</b><small>Bütün sesler ve müzikler için.</small></span><span class="a47-yz">%${Math.round((ATM.st.vol || 0) * 100)}</span></div>
<input class="a47-rng" type="range" min="0" max="1" step=".05" value="${ATM.st.vol}" aria-label="Ses seviyesi" oninput="ATM.setMaster(+this.value);this.previousElementSibling.querySelector('.a47-yz').textContent='%'+Math.round(this.value*100)">
<div class="a47-sat"><span><b>Ses durumu</b><small>${s.katman.length ? s.katman.map((x) => esc(x.s.n)).join(' + ') : 'Seçili ses yok.'}</small></span><span class="a47-dur ${s.calisiyor ? 'on' : ''}">${durum}</span></div>
<div class="p46-bb">${s.katman.length ? `<button type="button" onclick="ATM.toggle();setTimeout(V47.Ayar.ciz,300)">${s.calisiyor ? 'Duraklat' : 'Oynat'}</button>` : ''}${ATM.live() ? '<button type="button" onclick="ATM.stopAll();V47.Ayar.ciz()">Sesi kapat</button>' : ''}<button type="button" onclick="V37.sndOpen()">Zamanlayıcı ve ayrıntılar</button></div>
<h3 class="a47-h">Müzikler</h3>${M.length ? `<ul class="a47-mz">${M.map((m) => { const on = ATM.has('m42_' + m.id) && ATM.live(); return `<li><button type="button" class="${on ? 'on' : ''}" aria-pressed="${on}" onclick="V42.muzikCal('${m.id}');setTimeout(V47.Ayar.ciz,400)"><b>${esc(m.n)}</b><small>${m.s}${on ? (ATM.rt.playing ? ' · çalıyor' : ' · duraklatıldı') : ''}</small></button></li>`; }).join('')}</ul><p class="small mut">Müziklerin sanatçı ve lisans bilgisi kaynakta bulunmuyor.</p>` : '<p class="small mut">Kayıtlı müzik bulunmuyor.</p>'}`;
  };
  B.atmosfer = () => {
    const s = V47.Ses ? V47.Ses.durum() : {calisiyor: false, katman: []}, durum = s.calisiyor ? 'Çalıyor' : s.duraklatildi ? 'Duraklatıldı' : 'Kapalı';
    return `<div class="a47-atm ${s.calisiyor ? 'on' : ''}"><div class="a47-atm-ust"><span class="a47-dalga" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span><b>Ders Atmosferi</b><small>Çalışırken doğa sesleri, odak sesleri ve müzikler.</small></span><span class="a47-dur ${s.calisiyor ? 'on' : ''}">${durum}</span></div>
<p class="a47-atm-k">${s.katman.length ? 'Etkin: ' + s.katman.map((x) => `${esc(x.s.n)}${x.on ? '' : ' (sessiz)'}`).join(' · ') : 'Henüz ses seçilmedi.'}${s.kalan ? ` · ${s.kalan} dk sonra kapanacak` : ''}</p>
<div class="p46-bb"><button type="button" class="p" onclick="ATM.open()">Ders Atmosferi’ni aç</button>${s.katman.length ? `<button type="button" onclick="ATM.toggle();setTimeout(V47.Ayar.ciz,300)">${s.calisiyor ? 'Duraklat' : 'Oynat'}</button>` : ''}</div></div>
<h3 class="a47-h">Hazır karışımlar</h3><div class="a47-krs">${ATM.PRE.map((m) => `<button type="button" onclick="ATM.loadMix(${esc(JSON.stringify(m.L)).replace(/"/g, '&quot;')},'${esc(m.n)}',true);setTimeout(V47.Ayar.ciz,600)"><b>${esc(m.n)}</b><small>${m.L.map((x) => (ATM.byId(x[0]) || {}).n).filter(Boolean).join(' + ')}</small></button>`).join('')}</div>
<p class="small mut">Sesler varsayılan olarak kapalıdır; sen başlatırsın. Doğa ve odak sesleri cihazında üretilir, internet gerekmez.</p>`;
  };

  /* ---------- ekran ---------- */
  A.alanSec = function (k) { if ((k === 'premium') === AL()) return; V42.gec(k); setTimeout(() => go('ayar47', {at: 'alan'}), 120); };
  A.ciz = function () { if (view !== 'ayar47') return; const b = document.getElementById('a47b'); if (!b) return; const k = G.at || 'alan'; b.innerHTML = B[k](); };
  V30.routes.ayar47 = function () {
    const k = BOL.some((x) => x[0] === G.at) ? G.at : (G.at = 'alan');
    $.innerHTML = `<button class="back" onclick="go('profil46')">${ico('back', 18)} Profilim</button><section class="hero slim"><p class="eyebrow">Profilim</p><h1>Görünüm ve ses</h1></section>
<nav class="a47-sek" role="tablist" aria-label="Ayar bölümleri">${BOL.map(([x, n]) => `<button type="button" role="tab" aria-selected="${x === k}" class="${x === k ? 'on' : ''}" onclick="G.at='${x}';V47.Ayar.sekme()">${n}</button>`).join('')}</nav>
<section class="card a47-b" id="a47b" role="tabpanel" aria-label="${BOL.find((x) => x[0] === k)[1]}">${B[k]()}</section>`;
  };
  A.sekme = function () { const k = G.at; document.querySelectorAll('.a47-sek button').forEach((b) => { const on = b.getAttribute('onclick').includes(`'${k}'`); b.classList.toggle('on', on); b.setAttribute('aria-selected', on); }); const p = document.getElementById('a47b'); if (p) { p.setAttribute('aria-label', BOL.find((x) => x[0] === k)[1]); p.innerHTML = B[k](); } };
  // ses değişince açık ayar ekranını tazele (sürgü kullanılırken değil)
  const p0 = ATM.paint; let zt = 0;
  ATM.paint = function () { const r = p0.apply(this, arguments); if (view === 'ayar47' && (G.at === 'ses' || G.at === 'atmosfer')) { clearTimeout(zt); zt = setTimeout(() => { const ae = document.activeElement; if (!(ae && ae.type === 'range')) A.ciz(); }, 200); } return r; };
  // eski “Görünüm ve hareket” penceresi (jiroskop ayrıntıları) korunur; üst çubuktaki ayar düğmesi yeni ekrana gider
  V47.eskiAyar = V30.settings;
  V30.settings = function () { go('ayar47', {at: 'hareket'}); };

  /* ---------- Profilim: Görünüm bölümü yerine özet kart ---------- */
  const pr0 = V30.routes.profil46;
  V30.routes.profil46 = function () {
    const r = pr0.apply(this, arguments);
    try {
      const sec = [...$.querySelectorAll('section.p46-s')].find((s) => /^Görünüm$/.test((s.querySelector('h2') || {}).textContent || ''));
      if (sec) {
        const prog = sec.querySelector('details.p46-d'), s = V47.Ses ? V47.Ses.durum() : {calisiyor: false}, fx = !!V30.pref.get().fx;
        const tema = AL() ? ({gunduz: 'Gündüz', gece: 'Gece', oto: 'Otomatik'})[(typeof V43 !== 'undefined' && V43.tercih) ? V43.tercih() : 'gece'] : ({acik: 'Açık', koyu: 'Koyu', oto: 'Otomatik'})[A.elmasTema()];
        const sat = (k, n, v) => `<button type="button" class="a47-oz" onclick="go('ayar47',{at:'${k}'})"><span>${n}</span><b>${v}</b>${V46.ik('ok', 18)}</button>`;
        sec.innerHTML = `<h2>Görünüm ve ses</h2><div class="a47-ozl">${sat('alan', 'Öğrenme alanı', AL() ? 'Altın' : 'Elmas')}${sat('tema', 'Tema', tema)}${sat('hareket', 'Animasyonlar', fx ? 'Açık' : 'Kapalı')}${sat('ses', 'Ses ve müzik', s.calisiyor ? 'Çalıyor' : 'Kapalı')}${sat('atmosfer', 'Ders Atmosferi', s.katman && s.katman.length ? s.katman.length + ' ses seçili' : 'Seçili ses yok')}</div>`;
        if (prog) { const d = document.createElement('details'); d.className = 'card p46-s p46-d'; d.innerHTML = prog.innerHTML; sec.after(d); }
      }
    } catch (e) { console.warn('[V47] profil', e); }
    return r;
  };
  // gezinme: ayar ekranı Profilim altında
  try { const nk = navKey; navKey = function () { return view === 'ayar47' ? 'profil' : nk.apply(this, arguments); }; } catch (e) {}
})();
