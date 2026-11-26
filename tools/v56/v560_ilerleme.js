/* ===================== V56.0 (1/4): sınıfımın ilerlemesi ve genel çalışma ilerlemem =====================
   Sorun (V55'e kadar): günlük hedef sayacı (dk-calis45.gun) her cevabı sınıfına bakmadan sayıyordu; 4. sınıfı seçmiş öğrenci 5. sınıftan
   soru çözünce 4. sınıf hedefi de artıyordu. Profilim'deki kazanım başarısı da bütün sınıfların cevaplarını karıştırıyordu.
   V56:
   • dk-calis45 = {v:1, hedef, gun:{tarih: bütün cevaplar}, sg:{tarih:{<sınıf>: cevap}}} — gun eskisi gibi (GENEL); sg YENİ (sınıf dağılımı).
     Sınıf, cevabın kazanım kimliğinden bulunur (DKAB-<s>- / DKAB18-<s>-). Eski günlerin sınıf dağılımı kayıtlarda yok:
     o günler genel sayaçta kalır, hiçbir sınıfa yazılmaz (tahmin edilmez).
   • V45.Calis.oku() artık SEÇİLİ SINIFIN görünümünü verir (gun = o sınıfın günlük sayıları; genel = bütün sınıflar). Günlük hedef,
     seri, halkalar ve “Bugün x/y” bütün ekranlarda (Elmas ana sayfa, Çalışmam, Altın, Çalışma Masam, Profilim) yalnız seçili sınıfı sayar.
     Sınıf seçilmemişse genel sayaç kullanılır.
   • V45.Calis.yaz() yalnız hedefi yazar; sayaçları yalnız V56 Prog.rec sarmalayıcısı artırır (çift sayım yok).
   • V56.Hedef.genel(): bütün sınıflardaki çalışma (bugün, sınıf dağılımı, son 7 gün, toplam cevap, başarı) — ayrı gösterilir.
   • Profilim › İlerlemem: “Sınıfım” (yalnız seçili sınıfın kazanım başarısı, tamamlanan konu, bugünkü hedef) ve “Genel çalışmam”
     (bütün sınıflar) ayrı. “İçeriği hazır konu” (içerik üretim durumu) öğrenci ekranlarında hiç gösterilmez.
   • Profilim'deki “Öğretmen ve editör” kartı kaldırılır; öğretmen ve yönetici girişi Mod panelinde (yetki denetimleri aynı). */
(function () {
  if (typeof V45 === 'undefined' || !V45.Calis || typeof Prog === 'undefined') return;
  const V56 = window.V56 = window.V56 || {};
  const H = V56.Hedef = {K: 'dk-calis45'};
  const C = V45.Calis;
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const tarih = (d) => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  H.tarih = tarih;
  H.sinif = () => { try { return (window.V53 && V53.Hesap && +V53.Hesap.sinif()) || 0; } catch (x) { return 0; } };
  H.sinifOf = (oids) => { const L = Array.isArray(oids) ? oids : [oids]; for (const o of L) { const m = String(o || '').match(/^DKAB(?:18)?-(\d{1,2})-/); if (m) return +m[1]; } return 0; };
  H.ham = function () {
    let o = null; try { o = JSON.parse(localStorage.getItem(H.K) || 'null'); } catch (x) {}
    if (!o || o.v !== 1) o = {v: 1, hedef: 20, gun: {}};
    o.gun = o.gun && typeof o.gun === 'object' ? o.gun : {}; o.sg = o.sg && typeof o.sg === 'object' ? o.sg : {};
    o.hedef = Math.max(5, Math.min(200, +o.hedef || 20));
    return o;
  };
  H.yazHam = function (o) {
    const kes = (m) => { const k = Object.keys(m).sort(); k.slice(0, Math.max(0, k.length - 30)).forEach((x) => delete m[x]); };
    kes(o.gun); kes(o.sg);
    try { localStorage.setItem(H.K, JSON.stringify({v: 1, hedef: o.hedef, gun: o.gun, sg: o.sg})); } catch (x) {}
  };
  // seçili sınıfın görünümü (eski kod V45.Calis.oku().gun[tarih] okur)
  C.oku = function () {
    const h = H.ham(), s = H.sinif();
    const gun = s ? Object.fromEntries(Object.entries(h.sg).map(([d, m]) => [d, +(m && m[s]) || 0])) : Object.assign({}, h.gun);
    return {v: 1, hedef: h.hedef, gun, genel: h.gun, sg: h.sg, sinif: s};
  };
  C.yaz = function (o) { const h = H.ham(); if (o && o.hedef) h.hedef = Math.max(5, Math.min(200, +o.hedef || 20)); H.yazHam(h); };
  C.hedefAyarla = (n) => { const h = H.ham(); h.hedef = Math.max(5, Math.min(200, +n || 20)); H.yazHam(h); try { draw(); } catch (x) {} };
  // sayaç: her cevap genel sayaca, kazanımının sınıfına
  const r0 = Prog.rec;
  Prog.rec = function (oids) {
    const r = r0.apply(this, arguments);
    try { const h = H.ham(), d = tarih(), g = H.sinifOf(oids); h.gun[d] = (+h.gun[d] || 0) + 1; if (g) { const m = h.sg[d] = h.sg[d] || {}; m[g] = (+m[g] || 0) + 1; } H.yazHam(h); } catch (x) {}
    return r;
  };
  H.bugun = function (s) {
    const h = H.ham(); s = s == null ? H.sinif() : s; const d = tarih();
    const n = s ? +((h.sg[d] || {})[s]) || 0 : +h.gun[d] || 0;
    return {n, hedef: h.hedef, sinif: s, tamam: n >= h.hedef, asti: n > h.hedef, fazla: Math.max(0, n - h.hedef), kalan: Math.max(0, h.hedef - n)};
  };
  H.genel = function () {
    const h = H.ham(), d = tarih(), dag = Object.assign({}, h.sg[d] || {}), bugun = +h.gun[d] || 0;
    const sinifli = Object.values(dag).reduce((a, b) => a + (+b || 0), 0);
    let hafta = 0; for (let i = 0; i < 7; i++) hafta += +h.gun[tarih(new Date(Date.now() - i * 864e5))] || 0;
    let dg = 0, yn = 0; const sin = new Set();
    Object.entries((typeof Store !== 'undefined' && Store.ov && Store.ov.prog) || {}).forEach(([oid, p]) => { if (!p) return; const c = +p.correct || 0, w = +p.wrong || 0; if (!(c + w)) return; dg += c; yn += w; const g = H.sinifOf(oid); if (g) sin.add(g); });
    return {bugun, dagilim: dag, ayrilmamis: Math.max(0, bugun - sinifli), hafta, dogru: dg, yanlis: yn, oran: dg + yn ? Math.round(100 * dg / (dg + yn)) : null, siniflar: [...sin].sort((a, b) => a - b)};
  };
  // seçili sınıfın kazanım başarısı ve tamamlanan konular (başka sınıfların cevapları karışmaz)
  H.sinifDurum = function (s) {
    s = s == null ? H.sinif() : s;
    let dg = 0, yn = 0, kz = 0;
    Object.entries((Store.ov && Store.ov.prog) || {}).forEach(([oid, p]) => { if (!p || (s && H.sinifOf(oid) !== s)) return; const c = +p.correct || 0, w = +p.wrong || 0; if (!(c + w)) return; dg += c; yn += w; kz++; });
    let TP = []; try { TP = Store.all('topics').filter((t) => (!s || +t.grade === s) && vis(t) && !t.parentId && (typeof pvOf !== 'function' || t.programYear === pvOf(+t.grade))); } catch (x) {}
    const mt = (Store.ov && Store.ov.mt) || {}, tam = TP.filter((t) => { const r = mt[t.id]; return r && r.n && r.ok / r.n >= 0.7; }).length;
    return {s, dogru: dg, yanlis: yn, kazanim: kz, oran: dg + yn ? Math.round(100 * dg / (dg + yn)) : null, konu: TP.length, tamam: tam};
  };
  H.dagilimMetni = function (g) {
    const L = Object.entries(g.dagilim).filter(([, n]) => +n > 0).sort((a, b) => +a[0] - +b[0]).map(([s, n]) => `${s}. sınıf ${n}`);
    if (g.ayrilmamis) L.push(`sınıfı belirsiz ${g.ayrilmamis}`);
    return L.join(' · ');
  };
  H.genelHTML = function (cls) {
    const g = H.genel(), s = H.sinif();
    return `<section class="gn56 ${cls || ''}" aria-labelledby="gn56-h"><div class="gn56-b"><h2 id="gn56-h">Genel çalışmam</h2><small>Bütün sınıflar</small></div>
<div class="gn56-g"><div><b>${g.bugun}</b><span>Bugün cevap</span></div><div><b>${g.hafta}</b><span>Son 7 gün</span></div><div><b>${g.oran == null ? '—' : '%' + g.oran}</b><span>Genel başarı</span></div></div>
<p class="gn56-n">${g.bugun ? `Bugün: ${e(H.dagilimMetni(g))}.` : 'Bugün henüz cevap yok.'} ${s ? `Günlük hedefin yalnız <b>${s}. sınıf</b> cevaplarını sayar; başka sınıflardan çözdüklerin burada görünür.` : ''}</p></section>`;
  };

  /* ---------- Profilim › İlerlemem ---------- */
  if (window.V49 && V49.Profil) {
    const Pr = V49.Profil;
    Pr.ilerleme = function () {
      const s = H.sinif(), D = H.sinifDurum(s), b = H.bugun(s), g = H.genel(), pc = (a, x) => (x ? Math.min(100, Math.round(100 * a / x)) : 0);
      const IKS = {onay: '<path d="M5 12.5l4.5 4.5L19 7"/>', hedef: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>', masa: '<path d="M3 20h18M5 20v-7h14v7M8 13l3-7 4 2"/>', grafik: '<path d="M4 20h16M7 17v-5M12 17V8M17 17v-8"/>', yildiz: '<path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8-4.2-4.1 5.8-.8z"/>', ok: '<path d="m9 6 6 6-6 6"/>'};
      const ik = (k, n) => `<svg width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IKS[k] || ''}</svg>`;
      let fav = 0; try { const f = V39.ilr().fav || {}; fav = (f.s || []).length + (f.k || []).length; } catch (x) {}
      const halka = (y, ic) => `<span class="pr56-hl" style="--y:${y == null ? 0 : y}" aria-hidden="true"><b>${ic}</b></span>`;
      return `<div class="pr49-bas"><h2>İlerlemem</h2><span class="pr49-not">Elmas ve Altın aynı kaydı kullanır</span></div>
<h3 class="pr56-h">${s ? `Sınıfım · ${s}. sınıf` : 'Sınıfım'}</h3>
${s ? `<div class="pr49-ist pr56-ist">
 <div class="pr49-k pr49-k1">${halka(D.oran, D.oran == null ? '—' : '%' + D.oran)}<span><b>Kazanım başarısı</b><small>${D.oran == null ? 'Bu sınıfta henüz cevap yok' : `${D.dogru} doğru · ${D.yanlis} yanlış`}</small></span></div>
 <div class="pr49-k"><span class="pr49-ki">${ik('onay', 20)}</span><b class="pr49-sy">${D.tamam}<small>/${D.konu}</small></b><span><b>Tamamlanan konu</b><small>Mini testte %70 ve üstü</small></span><span class="pr49-bar" aria-hidden="true"><i style="width:${pc(D.tamam, D.konu)}%"></i></span></div>
 <div class="pr49-k"><span class="pr49-ki">${ik('hedef', 20)}</span><b class="pr49-sy">${b.n}<small>/${b.hedef}</small></b><span><b>Bugünkü hedef</b><small>${b.asti ? `Hedef aşıldı · +${b.fazla}` : b.tamam ? 'Hedef tamam' : `${b.kalan} cevap kaldı`}</small></span><span class="pr49-bar" aria-hidden="true"><i style="width:${pc(b.n, b.hedef)}%"></i></span></div>
</div>` : `<p class="pr56-y">Sınıfını seçtiğinde sınıfına ait başarı ve günlük hedef burada görünür. <button type="button" class="pr56-sb" onclick="V53.Hesap.sinifAc(true)">Sınıf seç</button></p>`}
<h3 class="pr56-h">Genel çalışmam <small>bütün sınıflar</small></h3>
<div class="pr56-gn"><span><b>${g.bugun}</b> bugün</span><span><b>${g.hafta}</b> son 7 gün</span><span><b>${g.oran == null ? '—' : '%' + g.oran}</b> başarı</span><span><b>${g.siniflar.length}</b> sınıfta çalıştın</span></div>
<div class="pr49-hz" role="list">
 <button type="button" role="listitem" class="pr49-h" data-k="calis" onclick="go('calis45')"><span class="pr49-hi">${ik('masa', 22)}</span><span><b>${V39.on ? 'Çalışma Masam' : 'Çalışma Merkezim'}</b><small>${s ? `${s}. sınıf · bugün ${b.n}/${b.hedef}` : `Bugün ${b.n}/${b.hedef} cevap`}</small></span>${ik('ok', 18)}</button>
 <button type="button" role="listitem" class="pr49-h" data-k="sinif" onclick="go('pilerleme')"><span class="pr49-hi">${ik('grafik', 22)}</span><span><b>Sınıf sınıf ilerleme</b><small>4–12. sınıflar</small></span>${ik('ok', 18)}</button>
 <button type="button" role="listitem" class="pr49-h" data-k="fav" onclick="go('pfav')"><span class="pr49-hi">${ik('yildiz', 22)}</span><span><b>Favorilerim</b><small>${fav ? fav + ' favori' : 'Henüz favori yok'}</small></span>${ik('ok', 18)}</button>
</div>`;
    };
  }

  /* ---------- öğrenci ekranlarından içerik üretim bilgisi ve yönetim kartları ---------- */
  H.OGRENCI = ['home', 'classes', 'grade', 'topic', 'profil46', 'calis45', 'acalis53', 'pdunya', 'psinif', 'punite', 'pders', 'pilerleme', 'games', 'poyun'];
  H.temizle = function () {
    if (!H.OGRENCI.includes(view)) return;
    $.querySelectorAll('.pr49-k, .p46-pg').forEach((k) => { if (/İçeriği hazır|içeriği hazır/i.test(k.textContent || '')) k.remove(); });
    $.querySelectorAll('small, p, span, .lead').forEach((x) => {
      if (x.children.length) return; const t = x.textContent || '';
      if (/içeriği hazır|taslak içeriği|taslak hazır|içerik hazır/i.test(t)) x.textContent = t.replace(/\s*·?\s*\d+\s*(?:\/\s*\d+\s*)?(?:konunun |konu )?(?:taslak )?(?:içeriği|içerik) hazır(?: \(taslak\))?/gi, '').replace(/\s*·\s*\d+\/\d+ taslak hazır/gi, '').replace(/^\s*·\s*|\s*·\s*$/g, '').trim();
    });
    if (view === 'profil46') $.querySelectorAll('details').forEach((d) => { const s = d.querySelector(':scope > summary'); if (s && /^\s*(Öğretmen ve editör|Öğretmen modu)\s*$/i.test(s.textContent)) d.remove(); });
  };

  /* ---------- hedef etiketleri: hangi sınıfın hedefi ---------- */
  H.etiket = function () {
    const s = H.sinif(); if (!s) return;
    if (view === 'calis45' && !V39.on) {
      const h = $.querySelector('.c48-hdr h2'); if (h && !h.querySelector('.gn56-s')) h.insertAdjacentHTML('beforeend', ` <small class="gn56-s">${s}. sınıf</small>`);
      const ec = $.querySelector('.ec55'); if (ec && !$.querySelector('.gn56')) ec.insertAdjacentHTML('afterend', H.genelHTML());
    }
  };

  try {
    const st = document.createElement('style'); st.id = 'v56-ilerleme-css';
    st.textContent = `
.gn56{margin:16px 0;padding:16px;border-radius:18px;border:1px solid var(--line);background:var(--surface)}
.gn56-b{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:10px}.gn56-b h2{margin:0;font-size:1.05rem}.gn56-b small{color:var(--mut)}
.gn56-g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.gn56-g div{display:flex;flex-direction:column;gap:2px;padding:10px;border-radius:12px;background:var(--surface2,var(--surface));border:1px solid var(--line)}
.gn56-g b{font-size:1.25rem}.gn56-g span{color:var(--mut);font-size:.8rem}.gn56-n{margin:10px 0 0;color:var(--mut);font-size:.86rem;line-height:1.45}
.gn56-s{font-size:.75rem;font-weight:600;color:var(--mut)}
.pr56-h{margin:14px 2px 8px;font-size:.95rem}.pr56-h small{font-weight:500;color:var(--mut)}
.pr56-hl{position:relative;display:inline-grid;place-items:center;width:64px;height:64px;flex:none;border-radius:50%;background:conic-gradient(var(--pri) calc(var(--y)*1%),var(--line) 0)}
.pr56-hl::before{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--surface)}.pr56-hl b{position:relative;font-size:.95rem}
.pr56-gn{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:0 0 12px}.pr56-gn span{padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--surface2,var(--surface));color:var(--mut);font-size:.84rem}.pr56-gn b{display:block;color:var(--ink);font-size:1.15rem}
.pr56-y{color:var(--mut)}.pr56-sb{min-height:40px;margin-left:6px;padding:4px 14px;border-radius:999px;border:1px solid var(--line);background:var(--surface2,var(--surface));color:var(--ink);font:inherit;font-weight:600;cursor:pointer}
`;
    document.head.appendChild(st);
  } catch (x) {}

  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try { H.temizle(); H.etiket(); } catch (x) { console.warn('[V56] ilerleme', x); }
    return r;
  };
})();
