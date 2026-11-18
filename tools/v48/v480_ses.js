/* ===================== V48.0: modern ses paneli =====================
   Ders Atmosferi motorunu (ATM) kullanır; yeni ses üretmez. Üç yerde aynı bileşen:
     Profilim › Görünüm ve ses › Ses ve müzik  ·  üst çubuktaki hızlı ses paneli  ·  Ders Atmosferi bölümü
   - büyük oynat/duraklat düğmesi, şimdi çalan bilgisi, hareketi azaltma ayarına uyan ince dalga animasyonu
   - etkin ses göstergesi (katmanlar; tek dokunuşla çıkarılır)
   - ses seviyesi sürgüsü ve ayrı sessize alma (dk-ses48 = {v:1, sessiz, onceki})
   - zamanlayıcı kartı (15/25/45/60 dk, kalan süre) — ATM.setTimer
   Doğa sesleri V48'de kaldırıldı; odak sesleri (kahverengi/beyaz gürültü) ve kayıtlı müzikler kaldı. */
(function () {
  if (typeof ATM === 'undefined') return;
  const V48 = window.V48 = window.V48 || {};
  const P = V48.SesPanel = {};
  const KEY = 'dk-ses48';
  const oku = () => { let o = null; try { o = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {} return o && o.v === 1 ? o : {v: 1, sessiz: false, onceki: 0.75}; };
  const yaz = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
  const IK = {
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
    pause: '<path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" fill="currentColor"/>',
    ses: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.5 7.5 0 0 1 0 10.4"/>',
    sessiz: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 10l4 4M20 10l-4 4"/>',
    saat: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.6 2M9.5 2.5h5"/>',
    x: '<path d="M7 7l10 10M17 7 7 17"/>',
    onceki: '<path d="M18 6v12l-8.5-6zM7 6v12"/>', sonraki: '<path d="M6 6v12l8.5-6zM17 6v12"/>',
    nota: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'
  };
  const ik = (k, s) => `<svg width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[k]}</svg>`;

  P.sessiz = () => oku().sessiz && (ATM.st.vol || 0) === 0;
  P.sessizAc = function () {
    const o = oku();
    if (P.sessiz()) { o.sessiz = false; yaz(o); ATM.setMaster(o.onceki > 0 ? o.onceki : 0.75); }
    else { o.sessiz = true; o.onceki = ATM.st.vol > 0 ? ATM.st.vol : (o.onceki || 0.75); yaz(o); ATM.setMaster(0); }
    P.tazele(true);
  };
  P.seviye = function (v) {
    v = Math.max(0, Math.min(1, +v || 0)); ATM.setMaster(v);
    const o = oku(); if (v > 0 && o.sessiz) { o.sessiz = false; yaz(o); }
    document.querySelectorAll('.sp48').forEach((e) => { const y = e.querySelector('.sp48-yz'); if (y) y.textContent = '%' + Math.round(v * 100); const m = e.querySelector('.sp48-mute'); if (m) { const s = v === 0; m.setAttribute('aria-pressed', s); m.innerHTML = ik(s ? 'sessiz' : 'ses', 20); } });
  };
  P.pp = async function () {
    if (!ATM.st.L.length) { const m = ATM.PRE[0]; if (!m) { UI.toast('Önce bir ses seç.'); return; } await ATM.loadMix(m.L, m.n, true); P.tazele(true); return; }
    if (P.sessiz()) P.sessizAc();
    ATM.toggle(); setTimeout(() => P.tazele(true), 250);
  };
  P.cikar = function (id) { if (ATM.has(id)) ATM.toggleSound(id); setTimeout(() => P.tazele(true), 60); };
  P.zaman = function (dk) { ATM.setTimer(dk || 0); P.tazele(true); if (dk) UI.toast(dk + ' dakika sonra ses yavaşça kapanacak.'); };
  P.kapat = function () { ATM.stopAll(); P.tazele(true); };

  P.durum = function () {
    const R = ATM.rt, L = ATM.st.L.map((l) => ({id: l.id, s: ATM.byId(l.id), on: l.on !== false})).filter((x) => x.s);
    const kalan = ATM.left();
    return {L, cal: !!R.playing, dur: !!R.paused, ad: ATM.st.name || (L.length ? ATM.autoName() : ''), kalan, hata: R.err && !R.playing ? R.err : ''};
  };
  P.html = function (yer) {
    const d = P.durum(), sz = P.sessiz(), v = ATM.st.vol || 0, kompakt = yer === 'hizli';
    const etiket = d.hata ? 'Ses başlatılamadı' : d.cal ? 'Şimdi çalıyor' : d.dur ? 'Duraklatıldı' : d.L.length ? 'Hazır' : 'Ses kapalı';
    const ad = d.ad || (d.L.length ? '' : 'Ses seçilmedi');
    const zm = [15, 25, 45, 60];
    return `<div class="sp48 ${d.cal ? 'on' : ''} ${kompakt ? 'k' : ''}" data-yer="${yer || ''}">
 <div class="sp48-np">
  ${kompakt ? `<button type="button" class="sp48-ad" onclick="ATM.step(-1)" aria-label="Önceki ses">${ik('onceki', 18)}</button>` : ''}
  <button type="button" class="sp48-pp" onclick="V48.SesPanel.pp()" aria-label="${d.cal ? 'Duraklat' : d.L.length ? 'Oynat' : 'Derin Odak karışımını başlat'}"><span class="sp48-hl" aria-hidden="true"></span>${ik(d.cal ? 'pause' : 'play', 30)}</button>
  ${kompakt ? `<button type="button" class="sp48-ad" onclick="ATM.step(1)" aria-label="Sonraki ses">${ik('sonraki', 18)}</button>` : ''}
  <div class="sp48-bil" aria-live="polite"><small>${etiket}</small><b>${esc(ad)}</b>${d.hata ? `<em>${esc(d.hata)}</em>` : `<span class="sp48-dalga" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>`}</div>
 </div>
 ${d.L.length ? `<div class="sp48-etk" role="list" aria-label="Etkin sesler">${d.L.map((x) => `<span role="listitem" class="sp48-c ${x.on && (d.cal || d.dur) ? 'on' : ''}"><i aria-hidden="true"></i>${esc(x.s.n)}<button type="button" onclick="V48.SesPanel.cikar('${x.id}')" aria-label="${esc(x.s.n)} sesini çıkar">${ik('x', 14)}</button></span>`).join('')}</div>` : `<p class="sp48-bos">Oynat düğmesi Derin Odak karışımını başlatır; aşağıdan müzik veya odak sesi de seçebilirsin.</p>`}
 <div class="sp48-vol"><button type="button" class="sp48-mute" aria-pressed="${sz || v === 0}" onclick="V48.SesPanel.sessizAc()" aria-label="Sessize al">${ik(sz || v === 0 ? 'sessiz' : 'ses', 20)}</button>
  <input type="range" min="0" max="1" step="0.05" value="${v}" aria-label="Ses seviyesi" oninput="V48.SesPanel.seviye(this.value)"><span class="sp48-yz">%${Math.round(v * 100)}</span></div>
 <div class="sp48-zm"><div class="sp48-zmu">${ik('saat', 18)}<b>Zamanlayıcı</b><span class="sp48-kalan" aria-live="off">${d.kalan ? 'Kalan ' + ATM.fmt(d.kalan) : 'Kapalı'}</span></div>
  <div class="sp48-zmb" role="group" aria-label="Zamanlayıcı süresi">${zm.map((n) => `<button type="button" class="${d.kalan && Math.abs(d.kalan - n * 60) < 30 ? 'on' : ''}" onclick="V48.SesPanel.zaman(${n})">${n} dk</button>`).join('')}${d.kalan ? `<button type="button" class="ip" onclick="V48.SesPanel.zaman(0)">Kapat</button>` : ''}</div></div>
 ${ATM.live() ? `<button type="button" class="sp48-dur" onclick="V48.SesPanel.kapat()">Sesi tamamen kapat</button>` : ''}
</div>`;
  };
  // ayar ekranındaki tam görünüm: panel + odak sesleri + müzikler + hazır karışımlar
  P.tam = function () {
    const M = (typeof V42 !== 'undefined' && V42.MUZ) ? V42.MUZ.filter(V42.var || (() => true)) : [];
    const odak = ATM.S.filter((s) => s.cat === 'diger' || s.cat === 'odak');
    const satir = (on, f, ad, alt, ic) => `<li><button type="button" class="${on ? 'on' : ''}" aria-pressed="${on}" onclick="${f}">${ik(ic, 18)}<span><b>${esc(ad)}</b><small>${alt}</small></span></button></li>`;
    return P.html('ayar') + `
<h3 class="a47-h">Odak sesleri</h3><ul class="sp48-l">${odak.map((s) => satir(ATM.has(s.id), `ATM.toggleSound('${s.id}');setTimeout(()=>V48.SesPanel.tazele(true),300)`, s.n, esc(s.d), 'ses')).join('')}</ul>
<h3 class="a47-h">Müzikler</h3>${M.length ? `<ul class="sp48-l">${M.map((m) => { const on = ATM.has('m42_' + m.id) && ATM.live(); return satir(on, `V42.muzikCal('${m.id}');setTimeout(()=>V48.SesPanel.tazele(true),400)`, m.n, m.s + (on ? (ATM.rt.playing ? ' · çalıyor' : ' · duraklatıldı') : ''), 'nota'); }).join('')}</ul><p class="small mut">Müziklerin sanatçı ve lisans bilgisi kaynakta bulunmuyor.</p>` : '<p class="small mut">Kayıtlı müzik bulunmuyor.</p>'}
<div class="p46-bb"><button type="button" onclick="G.at='atmosfer';V47.Ayar.sekme()">Hazır karışımlar</button><button type="button" onclick="ATM.open()">Ders Atmosferi’ni aç</button></div>
<p class="small mut">Sesler varsayılan olarak kapalıdır; sen başlatırsın. Odak sesleri cihazında üretilir, müzikler uygulamanın içindedir; internet gerekmez.</p>`;
  };
  // açık panelleri tazele (sürgü kullanılırken değil)
  let zt = 0;
  P.tazele = function (hemen) {
    clearTimeout(zt);
    const f = () => {
      const ae = document.activeElement; if (ae && ae.type === 'range' && ae.closest && ae.closest('.sp48')) return;
      document.querySelectorAll('.sp48').forEach((e) => {
        if (e.dataset.yer === 'ayar' && typeof view !== 'undefined' && view === 'ayar47' && typeof V47 !== 'undefined' && V47.Ayar) { V47.Ayar.ciz(); return; }
        if (e.dataset.yer === 'hizli') { try { V37.sndPaint(); } catch (x) {} return; }
        const y = document.createElement('div'); y.innerHTML = P.html(e.dataset.yer); e.replaceWith(y.firstElementChild);
      });
    };
    hemen ? f() : (zt = setTimeout(f, 150));
  };
  // kalan süre: yalnız metni güncelle (her saniye tam yeniden çizim yok)
  setInterval(() => { if (!ATM.rt.tEnd) return; const t = ATM.left(); document.querySelectorAll('.sp48-kalan').forEach((e) => { e.textContent = t ? 'Kalan ' + ATM.fmt(t) : 'Kapalı'; }); }, 1000);
  // motor durumu değişince açık paneller (ayar ve hızlı panel kendi tazelemesini yapar)
  const p0 = ATM.paint;
  ATM.paint = function () { const r = p0.apply(this, arguments); try { if (document.querySelector('.sp48:not([data-yer="ayar"]):not([data-yer="hizli"])')) P.tazele(); } catch (e) {} return r; };
  // hızlı ses paneli: üst kısım (şimdi çalan, oynatma, ses seviyesi, kapat) yeni bileşenle
  if (typeof V37 !== 'undefined' && V37.sndBody) {
    const sb = V37.sndBody;
    V37.sndBody = function () {
      let h = sb.apply(this, arguments);
      const a = h.indexOf('<div class="snd37-np"'), b = h.indexOf('<button class="snd37-off"');
      if (a >= 0 && b > a) { const c = h.indexOf('</button>', b) + 9; h = h.slice(0, a) + P.html('hizli') + h.slice(c); }
      return h;
    };
  }
})();
