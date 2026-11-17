/* ===================== V45.0: bağlantılar (kaynak doğrulama arayüzü, editör kuyruğu) ===================== */
(function () {
  // Editör kuyruğu: yalnız gerçekten kontrol gerektiren (C) içerik; editörün açık kararı (onay/red/düzeltme) korunur
  try {
    const ED = V38.ED, c0 = ED.cat;
    ED.cat = function (c, r) { const s = c0.apply(this, arguments); if (s === 'bekleyen' || s === 'kaynak') { if (['topics', 'questions', 'flashcards', 'games', 'concepts', 'entities'].includes(c) && !V45.KD.editorGerekli(c, r)) return ''; } return s; };
  } catch (e) { console.warn('[V45] editör kuyruğu', e); }
  // Konu kaynak kartı
  if (typeof dvInfo === 'function') {
    dvInfo = function (t) {
      const d = t.dogrulama, k = V45.KD.konu(t); if (!d || !k) return '';
      const nd = Object.entries(k.neden || {}).map(([a, n]) => `${esc(V45.KD.NEDEN[a] || a)}: ${n}`).join(' · ');
      return `<div class="card"><b>Kaynak doğrulama</b><p class="note">${V45.KD.etiket(k)}</p><p class="note">${d.kaynak ? 'Karşılaştırılan kaynak: ' + esc(d.kaynak) + '. ' : ''}Kaynakla doğrulanan: ${k.A} · kaynaktan türetilen: ${k.B} · editör kontrolü gereken: ${k.C} bölüm.</p>${nd ? `<p class="note">Editör kontrolü nedenleri — ${nd}</p>` : ''}<p class="note">${esc(d.yontem || '')} Kaynakla doğrulanan ve türetilen bölümler için editör onayı zorunlu değildir.</p></div>`;
    };
  }
  // Oyun kartları (Klasik ve Premium): “editör onayı bekliyor” yalnız C etkinlikte
  if (typeof gCard === 'function') {
    const g0 = gCard;
    gCard = function (g) {
      let h = g0.apply(this, arguments); const k = V45.KD.kayit('games', g), C = k && k.kat === 'C';
      h = h.replace('otomatik kaynak kontrolü; editör onayı bekliyor', C ? 'editör kontrolü gerekli: ' + (V45.KD.NEDEN[k.alt] || '') : 'kaynaktan türetildi; otomatik kaynak denetimini geçti');
      h = h.replace('<span class="d43 bek">Editör onayı bekliyor</span>', C ? `<span class="d43 uy">Editör kontrolü gerekli</span>` : '<span class="d43 ok">Kaynaktan türetildi</span>');
      return h;
    };
  }
  // Konu başlığındaki doğrulama etiketi (Klasik ve Premium)
  V45.etiketDuzelt = function () {
    try {
      const tid = view === 'topic' ? G.t : view === 'pders' ? G.pt : null; if (!tid) return; const t = Store.get('topics', tid); if (!t || !t.dogrulama) return;
      const k = V45.KD.konu(t), eski = Object.values(DVL);
      document.querySelectorAll('#app .tag.dv, #app .p39-tags span').forEach((e) => { if (e.dataset.kd45) return; if (eski.includes(e.textContent.trim())) { const d = document.createElement('span'); d.innerHTML = V45.KD.etiket(k); d.dataset.kd45 = 1; e.replaceWith(d); } });
    } catch (e) {}
  };
  const d0 = draw;
  draw = function () { const r = d0.apply(this, arguments); V45.etiketDuzelt(); return r; };
})();

/* ---------- Sınıf dünyaları: oyun merkezi kartı ve sınıf merkezi girişi ---------- */
(function () {
  if (!V45.Dunya) return;
  const D = V45.Dunya;
  const dKart = () => {
    const gr = Object.keys(D.D).map(Number); let b = 0, t = 0, y = 0;
    gr.forEach((g) => { const k = D.kayit(g), U = D.uniteler(g); t += U.length; U.forEach((u) => { const B = k.bolge[u.id]; if (B && B.bitti) b++; if (B && B.kapi) y += B.kapi.yildiz; }); });
    return `<section class="o41-oyun g44-ok d45-hub" data-kat="hibrit" aria-labelledby="o45-dunya"><div class="o41-afis" style="background:linear-gradient(160deg,#2b3d5a,#1b2433)" aria-hidden="true"><i></i></div><div class="o41-ic"><h3 id="o45-dunya">Sınıf Dünyaları</h3><p>Her sınıfın kendi dünyası, hikâyesi ve karakterleri var: Işık Bahçesi (4), Gözlem Kubbesi (5), Kervan Yolu (6), Zaman Kapıları (7), LGS Kulesi (8), Akademi Arşivi (9), Medeniyet Atlası (10), Düşünce Konseyi (11), Mezuniyet Projesi (12).</p><p class="g44-oz"><span>${gr.length} dünya · ${b} / ${t} bölge</span><span>★ ${y} / ${t * 3}</span></p><div class="o41-bb"><button class="o41-b p" onclick="go('poyna',{oyn:'dunya45',obol:'',odevam:0})">Dünya seç</button></div></div></section>`;
  };
  const p0 = V39.r_poyun;
  V39.r_poyun = function () {
    const r = p0.apply(this, arguments);
    try { const h = [...$.querySelectorAll('.g44-kat')].find((x) => /Hibrit/.test(x.textContent)), L = h && h.nextElementSibling; if (L && !L.querySelector('.d45-hub')) L.insertAdjacentHTML('afterbegin', dKart()); } catch (e) {}
    return r;
  };
  const s0 = V39.r_psinif;
  V39.r_psinif = function () {
    const r = s0.apply(this, arguments);
    try {
      const g = +G.pg, c = D.D[g], yer = $.querySelector('.p40-ar') || $.querySelector('.p39-sts');
      if (c && yer && !$.querySelector('.d45-banner')) { const k = D.kayit(g), U = D.uniteler(g), b = U.filter((u) => k.bolge[u.id] && k.bolge[u.id].bitti).length;
        yer.insertAdjacentHTML('afterend', `<button type="button" class="d45-banner" style="--d45a:${c.renk[0]};--d45b:${c.renk[1]}" onclick="go('poyna',{oyn:'dunya45',obol:'g${g}',odevam:0})"><span class="d45-bs">${D.sahne(g, 0)}</span><span class="d45-bt2"><small>${g}. sınıf oyun dünyası</small><b>${esc(c.ad)}</b><small>${esc(c.alt)} · ${b} / ${U.length} bölge</small></span></button>`); }
    } catch (e) {}
    return r;
  };
})();
/* ---------- Denetim bulgusu: “book” rotası kitap kimliği olmadan açılınca hata veriyordu ---------- */
(function () {
  if (typeof bookView !== 'function') return;
  const b0 = bookView;
  bookView = function () {
    if (!Store.get('textbooks', G.b)) { $.innerHTML = `<button class="back" onclick="go('classes')">${ico('back', 18)} Sınıflar</button><section class="hero slim"><p class="eyebrow">Ders kitabı</p><h1>Kitap seçilmedi</h1><p class="lead">Ders kitabı bilgisini sınıf sayfasından açabilirsin.</p></section>`; return; }
    return b0.apply(this, arguments);
  };
})();
