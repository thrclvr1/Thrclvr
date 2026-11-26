/* ===================== V57.0 (3/4): Altın — Nerede Kaldım?, konu sekmeleri, dairesel Harf Halkası =====================
   • Sınıf merkezi: ünitelerin üstündeki oyun dünyası kartı ve “Nereden başlamalıyım?” başlığı kaldırıldı; yerine yalnız
     “Nerede Kaldım?”: son çalışılan konu (dk-ilerleme39.son), ünitesi, konudaki ilerleme (V39.tst: cevaplanan soru / toplam)
     ve “Kaldığın yerden devam et”. Yeni ilerleme sistemi yok; mevcut kayıt okunur.
   • Konu ekranı: Öğren · Pekiştir · Kendini Dene segmentli kontrol (kayan vurgu, hafif derinlik, yumuşak geçiş); alt sekmeler
     (Anlatım, Özet, 30 Saniyede, Hikâye, Kaynaklar…) hap biçimli sekmeler. Sekmelerin yeri, sırası ve işlevi aynı (V39.tab).
   • Harf Halkası: Türk alfabesinin 29 harfi doğru sırayla gerçek bir halka üzerinde; ortada sıradaki harf, süre ve puan;
     doğru/yanlış/sıradaki/bekleyen durumları; sorusu olmayan harf soluk; bekleyen bir harfe dokununca o harfe geçilir.
     Süre, puan, pas ve cevaplama V54 ile aynı. */
(function () {
  if (typeof V39 === 'undefined') return;
  const V57 = window.V57 = window.V57 || {};
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const OK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  // başlık biçimi; kesme işaretinden sonraki ek küçük harf kalır (“İslam’ı”, “İslam’I” değil)
  const adB = (t) => String(window.V55 && V55.Dunya && V55.Dunya.adBicim ? V55.Dunya.adBicim(t) : t).replace(/([’'])(\p{Lu}+)/gu, (m, a, b) => a + b.toLocaleLowerCase('tr-TR'));

  /* ---------- 1. Nerede Kaldım? ---------- */
  const NK = V57.NeredeKaldim = {};
  NK.konu = function (g) {
    let L = []; try { L = V55.Altin.konular(g); } catch (x) {}
    let id = ''; try { id = V39.ilr().son[g] || ''; } catch (x) {}
    try { const r = JSON.parse(localStorage.getItem('dk-son54') || 'null'); if (!id && r && r.s && r.s[g]) id = r.s[g]; } catch (x) {}
    return {x: L.find((y) => y.t.id === id) || null, ilk: L[0] || null};
  };
  NK.html = function (g) {
    const {x, ilk} = NK.konu(g);
    if (!x) return `<section class="sn55 nk57" aria-labelledby="nk57-h"><h2 class="nk57-h" id="nk57-h">Nerede Kaldım?</h2><article class="nk57-k bos"><p>Bu sınıfta henüz bir konu açmadın.</p>${ilk ? `<button type="button" class="nk57-d" onclick="go('pders',{pt:'${e(ilk.t.id)}',ptab:''})">İlk konuyla başla: ${e(ilk.t.title)} ${OK}</button>` : '<p class="nk57-n">Bu sınıf ve program için konu verisi bulunmuyor.</p>'}</article></section>`;
    const d = V39.tst(x.t), p = Math.max(0, Math.min(100, d.p || 0));
    const durum = d.k === 'tamam' ? 'Tamamlandı' : d.q ? `${d.n}/${d.q} soru cevaplandı` : (d.k === 'calis' ? 'Açıldı' : 'Başlanmadı');
    return `<section class="sn55 nk57" aria-labelledby="nk57-h"><h2 class="nk57-h" id="nk57-h">Nerede Kaldım?</h2>
<article class="nk57-k"><small class="nk57-u">${x.u.order}. ünite · ${e(adB(x.u.title))}</small><b class="nk57-t">${e(x.t.title)}</b>
<div class="nk57-il"><span class="nk57-bar" role="img" aria-label="Konu ilerlemesi yüzde ${p}"><i style="width:${p}%"></i></span><span class="nk57-y">%${p}</span></div>
<p class="nk57-n">${e(durum)}${d.q && d.n ? ` · ${d.ok} doğru` : ''}</p>
<button type="button" class="nk57-d" onclick="go('pders',{pt:'${e(x.t.id)}',ptab:''})">${d.k === 'tamam' ? 'Konuya dön' : 'Kaldığın yerden devam et'} ${OK}</button></article></section>`;
  };
  NK.duzenle = function () {
    if (view !== 'psinif' || !V39.on) return;
    const sn = $.querySelector('.sn55'); if (!sn || sn.classList.contains('nk57')) return;
    $.querySelectorAll('.d45-banner').forEach((x) => x.remove());
    sn.outerHTML = NK.html(+G.pg || 4);
  };

  /* ---------- 2. konu sekmeleri: kayan vurgu ---------- */
  V57.sekme = function () {
    if (!V39.on || view !== 'pders') return;
    $.querySelectorAll('.seg46').forEach((s) => { const B = [...s.querySelectorAll('button')], i = Math.max(0, B.findIndex((b) => b.classList.contains('on'))); s.style.setProperty('--n', B.length); s.style.setProperty('--i', i); s.classList.add('seg57'); });
    $.querySelectorAll('nav.tabs46').forEach((n) => { n.classList.add('tab57'); const on = n.querySelector('button.on'); if (on && n.scrollWidth > n.clientWidth) { const r = on.offsetLeft - (n.clientWidth - on.offsetWidth) / 2; n.scrollLeft = Math.max(0, r); } });
  };

  /* ---------- 3. Harf Halkası: gerçek halka ---------- */
  const OY = window.V54 && V54.Oyun;
  const HH = V57.Halka = {};
  HH.sec = function (h) {
    const d = OY && OY.d; if (!d || d.tip !== 'halka' || d.bitti) return;
    const i = d.harfler.findIndex((x) => x.h === h), k = d.sira.indexOf(i); if (k < 0) return;
    d.k = k; d.son = null; OY.ciz();
    setTimeout(() => { const inp = document.getElementById('hh54-i'); if (inp) try { inp.focus({preventScroll: true}); } catch (x) {} }, 30);
  };
  HH.html = function (d) {
    const HARF = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split(''), n = HARF.length, cur = d.bitti ? null : d.harfler[d.sira[d.k]];
    const say = {dg: d.harfler.filter((x) => x.d === true).length, yn: d.harfler.filter((x) => x.d === false).length};
    const bit = say.dg + say.yn, top = d.harfler.length, c = 2 * Math.PI * 43, oran = top ? bit / top : 0;
    const kal = Math.max(0, Math.round((d.bitis - Date.now()) / 1000));
    const h = HARF.map((x, i) => {
      const a = (i / n) * 2 * Math.PI - Math.PI / 2, L = 50 + 43 * Math.cos(a), T = 50 + 43 * Math.sin(a), it = d.harfler.find((y) => y.h === x);
      const cls = !it ? 'yok' : it.d === true ? 'dg' : it.d === false ? 'yn' : (cur && cur.h === x ? 'su' : 'bk');
      const ad = !it ? 'bu harf için soru yok' : it.d === true ? 'doğru' : it.d === false ? 'yanlış' : (cls === 'su' ? 'sıradaki' : 'bekliyor');
      return `<button type="button" class="hr57-h ${cls}" style="left:${L.toFixed(2)}%;top:${T.toFixed(2)}%" ${cls === 'bk' && !d.bitti ? `onclick="V57.Halka.sec('${x}')"` : 'tabindex="-1"'} aria-label="${x}: ${ad}">${x}</button>`;
    }).join('');
    const orta = d.bitti ? `<div class="hr57-m son"><small>Oyun bitti</small><b class="hr57-p">${d.puan}</b><span>puan · ${say.dg}/${top} doğru</span></div>`
      : `<div class="hr57-m"><small>Sıradaki harf</small><b class="hr57-c">${cur ? cur.h : ''}</b><span class="hr57-z"><i aria-hidden="true">⏱</i> <span id="hh54-z">${kal} sn</span></span><span class="hr57-s">${d.puan} puan · ${d.sira.length} harf kaldı</span></div>`;
    return `<div class="hr57" role="group" aria-label="Harf halkası: ${say.dg} doğru, ${say.yn} yanlış, ${top - bit} bekliyor">
<svg class="hr57-iz" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="hr57g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--p-gold2,#B8873F)"/><stop offset="1" stop-color="var(--p-gold,#E2B765)"/></linearGradient></defs><circle cx="50" cy="50" r="43" class="hr57-r0"/><circle cx="50" cy="50" r="43" class="hr57-r1" stroke="url(#hr57g)" stroke-dasharray="${(c * oran).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 50 50)"/><circle cx="50" cy="50" r="33" class="hr57-r2"/></svg>
${h}${orta}</div>
<p class="hr57-lj"><span class="dg">● ${say.dg} doğru</span><span class="yn">● ${say.yn} yanlış</span><span class="bk">● ${top - bit} bekliyor</span>${top < n ? `<span class="yok">● ${n - top} harf için soru yok</span>` : ''}</p>`;
  };
  // Pas: son sıradaki harfte aynı harfte kalmasın (başa sar)
  if (OY && OY.hhCevap) { const h0 = OY.hhCevap; OY.hhCevap = function (pas) { const d = OY.d, once = d && d.sira ? d.sira[d.k] : null; const r = h0.apply(this, arguments); try { if (pas && d && !d.bitti && d.sira.length > 1 && d.sira[d.k] === once) { d.k = 0; OY.ciz(); } } catch (x) {} return r; }; }
  if (OY && OY.ciz) {
    const c0 = OY.ciz;
    OY.ciz = function () {
      const r = c0.apply(this, arguments);
      try {
        const d = OY.d; if (!d || d.tip !== 'halka' || !d.harfler || !d.harfler.length) return r;
        const eski = $.querySelector('.hh54-r'); if (!eski) return r;
        eski.outerHTML = HH.html(d);
        const ust = [...$.querySelectorAll('p.ao53-ad')].find((p) => p.querySelector('#hh54-z') || /harf/.test(p.textContent)); if (ust && !ust.closest('.hr57')) ust.remove();
        const k = $.querySelector('.hh54-k'); if (k) k.classList.add('hr57-k');
      } catch (x) { console.warn('[V57] harf halkası', x); }
      return r;
    };
  }

  /* ---------- 4. stiller ---------- */
  try {
    const st = document.createElement('style'); st.id = 'v57-altin-css';
    st.textContent = `
.nk57-h{margin:4px 0 0;font:600 1.1rem Literata,Georgia,serif;color:var(--p-ink)}
.nk57-k{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:18px;border-radius:22px;border:1px solid color-mix(in srgb,var(--p-gold) 30%,var(--p-line));background:linear-gradient(155deg,color-mix(in srgb,var(--p-gold) 10%,var(--p-card2)),var(--p-card) 65%);box-shadow:var(--a56-sh,0 10px 24px -14px rgba(0,0,0,.5));color:var(--p-ink);overflow:hidden}
.nk57-k::before{content:"";position:absolute;left:18px;right:18px;top:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--p-gold) 70%,transparent),transparent)}
.nk57-u{color:var(--p-gold-t,var(--p-gold));font-weight:700;font-size:.78rem;letter-spacing:.02em}
.nk57-t{font:600 1.18rem/1.3 Literata,Georgia,serif}
.nk57-il{display:flex;align-items:center;gap:10px;width:100%;margin-top:4px}.nk57-bar{flex:1;height:8px;border-radius:99px;background:color-mix(in srgb,var(--p-ink) 12%,transparent);overflow:hidden}
.nk57-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--p-gold2,var(--p-gold)),var(--p-gold))}.nk57-y{font-weight:800;font-size:.9rem}
.nk57-n{margin:0;color:var(--p-mut);font-size:.86rem}
.nk57-d{display:inline-flex;align-items:center;gap:6px;margin-top:8px;min-height:46px;padding:8px 20px;border-radius:999px;border:0;background:var(--p-gold);color:var(--p-on-gold,#1a120a);font:inherit;font-weight:700;cursor:pointer;box-shadow:0 6px 16px -6px color-mix(in srgb,var(--p-gold) 70%,transparent)}
.nk57-k.bos p{margin:0;color:var(--p-mut)}
body[data-prem39] .seg46.seg57{position:relative;display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:0;padding:5px;border-radius:20px;background:color-mix(in srgb,var(--p-ink) 6%,var(--p-card));border:1px solid var(--p-line);box-shadow:inset 0 1px 3px rgba(0,0,0,.25)}
body[data-prem39] .seg46.seg57::before{content:"";position:absolute;top:5px;bottom:5px;left:5px;width:calc((100% - 10px) / var(--n,3));border-radius:15px;background:linear-gradient(180deg,color-mix(in srgb,var(--p-gold) 34%,var(--p-card2)),color-mix(in srgb,var(--p-gold) 16%,var(--p-card)));box-shadow:0 1px 0 color-mix(in srgb,#fff 14%,transparent) inset,0 8px 16px -8px rgba(0,0,0,.55),0 0 0 1px color-mix(in srgb,var(--p-gold) 50%,transparent);transform:translateX(calc(var(--i,0) * 100%));transition:transform .34s cubic-bezier(.2,.8,.2,1)}
body[data-prem39] .seg46.seg57 button{position:relative;z-index:1;min-height:50px;border:0!important;background:none!important;box-shadow:none!important;color:var(--p-mut)!important;font-weight:700;letter-spacing:.01em;transition:color .25s ease}
body[data-prem39] .seg46.seg57 button.on{color:var(--p-ink)!important}
body[data-prem39] nav.tabs46.tab57{gap:8px;padding:10px 2px 12px;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 14px,#000 calc(100% - 14px),transparent);mask-image:linear-gradient(90deg,transparent 0,#000 14px,#000 calc(100% - 14px),transparent);scroll-behavior:smooth}
body[data-prem39] nav.tabs46.tab57 button{position:relative;min-height:42px;padding:0 16px;border-radius:999px;border:1px solid var(--p-line)!important;background:color-mix(in srgb,var(--p-card) 80%,transparent)!important;color:var(--p-mut)!important;font-weight:600;transition:background-color .22s ease,color .22s ease,border-color .22s ease,box-shadow .22s ease}
body[data-prem39] nav.tabs46.tab57 button.on{background:color-mix(in srgb,var(--p-gold) 20%,var(--p-card2))!important;color:var(--p-ink)!important;border-color:color-mix(in srgb,var(--p-gold) 60%,var(--p-line))!important;box-shadow:0 6px 14px -8px color-mix(in srgb,var(--p-gold) 80%,transparent),inset 0 -2px 0 var(--p-gold);font-weight:700}
@keyframes a57f{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
body[data-prem39] .p39-pane{animation:a57f .28s ease both}
@media (prefers-reduced-motion:reduce){body[data-prem39] .seg46.seg57::before{transition:none}body[data-prem39] .p39-pane{animation:none}}
.hr57{position:relative;width:min(100%,400px);aspect-ratio:1;margin:6px auto 4px}
.hr57-iz{position:absolute;inset:0;width:100%;height:100%}
.hr57-r0{fill:none;stroke:color-mix(in srgb,var(--p-ink,var(--ink)) 10%,transparent);stroke-width:8.6}
.hr57-r1{fill:none;stroke-width:1.4;stroke-linecap:round;transition:stroke-dasharray .5s ease}
.hr57-r2{fill:color-mix(in srgb,var(--p-gold,var(--pri)) 7%,var(--p-card,var(--surface)));stroke:color-mix(in srgb,var(--p-gold,var(--pri)) 35%,transparent);stroke-width:.4}
.hr57-h{position:absolute;width:8.6%;aspect-ratio:1;transform:translate(-50%,-50%);display:grid;place-items:center;padding:0;border-radius:50%;border:1.5px solid var(--p-line,var(--line));background:var(--p-card2,var(--surface2));color:var(--p-ink,var(--ink));font:800 clamp(.72rem,3.4vw,.98rem)/1 var(--sans,system-ui);cursor:default;transition:transform .2s ease,background-color .2s ease,box-shadow .2s ease;z-index:1}
.hr57-h.bk{cursor:pointer;border-color:color-mix(in srgb,var(--p-gold,var(--pri)) 45%,var(--p-line,var(--line)))}
.hr57-h.bk:active{transform:translate(-50%,-50%) scale(.92)}
.hr57-h.su{z-index:2;transform:translate(-50%,-50%) scale(1.32);background:linear-gradient(180deg,color-mix(in srgb,var(--p-gold,var(--pri)) 80%,#fff),var(--p-gold,var(--pri)));border-color:transparent;color:var(--p-on-gold,#1a120a);box-shadow:0 0 0 3px color-mix(in srgb,var(--p-gold,var(--pri)) 35%,transparent),0 6px 14px -4px rgba(0,0,0,.45)}
.hr57-h.dg{background:#2F8F62;border-color:#2F8F62;color:#fff}.hr57-h.yn{background:#B4473E;border-color:#B4473E;color:#fff}
.hr57-h.yok{opacity:.35;border-style:dashed;background:transparent}
.hr57-m{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:58%;display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center;color:var(--p-ink,var(--ink))}
.hr57-m small{color:var(--p-mut,var(--mut));font-size:.74rem;letter-spacing:.04em;text-transform:uppercase}
.hr57-c{font:700 clamp(2.6rem,15vw,3.8rem)/1 Literata,Georgia,serif;color:var(--p-gold-t,var(--pri))}
.hr57-p{font:800 clamp(2rem,11vw,2.8rem)/1 var(--sans,system-ui);color:var(--p-gold-t,var(--pri))}
.hr57-z{font-weight:800;font-size:.95rem}.hr57-z i{font-style:normal}.hr57-s,.hr57-m.son span{color:var(--p-mut,var(--mut));font-size:.8rem}
.hr57-lj{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 12px;margin:2px 0 12px;font-size:.78rem;color:var(--p-mut,var(--mut))}
.hr57-lj .dg{color:#2F8F62}.hr57-lj .yn{color:#C0564C}.hr57-lj .bk{color:var(--p-gold-t,var(--pri))}.hr57-lj .yok{opacity:.7}
.hr57-k{border-radius:20px!important;border-color:color-mix(in srgb,var(--p-gold,var(--pri)) 30%,var(--p-line,var(--line)))!important}
@media (prefers-reduced-motion:reduce){.hr57-h,.hr57-r1{transition:none}}
`;
    document.head.appendChild(st);
  } catch (x) {}

  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try { NK.duzenle(); V57.sekme(); } catch (x) { console.warn('[V57] Altın', x); }
    return r;
  };
  document.addEventListener('click', (ev) => { if (ev.target && ev.target.closest && ev.target.closest('.seg46 button, nav.tabs46 button')) setTimeout(() => { try { V57.sekme(); } catch (x) {} }, 0); }, true);
  // V39.tab yalnız bölmeyi yeniden çizebilir: sekme vurgusunu güncelle
  if (V39.tab) { const t0 = V39.tab; V39.tab = function () { const r = t0.apply(this, arguments); try { V57.sekme(); } catch (x) {} return r; }; }
})();
