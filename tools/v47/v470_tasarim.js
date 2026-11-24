/* ===================== V47.0: tasarım bütünlüğü — hızlı erişim modülleri =====================
   Her aracın tek ana konumu vardır:
   - Elmas Öğrenme Alanı: ana sayfada (devam et + dört ana giriş altında) dört 3B modül:
       Sureler ve Dualar · Kavramlar · Kişiler ve Eserler · Bağlantılar. Sınıflar ekranı doğrudan sınıf kartlarıyla başlar.
   - Altın Öğrenme Alanı: koridorun altındaki boşlukta yatay kaydırılabilir 3B araç şeridi:
       Üniteler ve Konular · Sureler ve Dualar · Kavramlar · Kişiler ve Eserler · Bağlantılar · Öğrenme Araçları.
   Yönlendirmeler mevcut ekranlara gider; yeni içerik eklenmez. */
(function () {
  const V47 = window.V47 = window.V47 || {};
  const T = V47.Tasarim = {};
  const elmas = () => !(typeof V39 !== 'undefined' && V39.on);
  /* ---------- 3B illüstrasyonlar (SVG; ortak ikon dili: yumuşak hacim, üstten ışık, alt gölge) ---------- */
  const golge = '<ellipse cx="32" cy="56" rx="20" ry="4.5" fill="#000" opacity=".18"/>';
  T.SVG = {
    sd: (a, b) => `<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">${golge}<path d="M10 22 32 14l22 8v24L32 54 10 46z" fill="${b}"/><path d="M32 14v40L10 46V22z" fill="${a}"/><path d="M32 14l22 8-22 8-22-8z" fill="#fff" opacity=".55"/><path d="M18 30l8 3M18 35l8 3M38 33l8-3M38 38l8-3" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/><circle cx="47" cy="13" r="5" fill="#fff" opacity=".9"/><circle cx="49.5" cy="11.5" r="4.2" fill="${a}"/></svg>`,
    kavram: (a, b) => `<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">${golge}<rect x="12" y="18" width="30" height="24" rx="8" fill="${a}"/><rect x="22" y="26" width="30" height="24" rx="8" fill="${b}"/><path d="M30 50l-4 6 9-6" fill="${b}"/><rect x="28" y="33" width="16" height="3" rx="1.5" fill="#fff" opacity=".85"/><rect x="28" y="39" width="11" height="3" rx="1.5" fill="#fff" opacity=".65"/><circle cx="20" cy="26" r="3" fill="#fff" opacity=".7"/></svg>`,
    kisi: (a, b) => `<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">${golge}<path d="M12 50V22l14-5v33z" fill="${a}"/><path d="M26 17l14 5v28l-14 0z" fill="${b}"/><path d="M40 22l12-3v29l-12 2z" fill="${a}" opacity=".85"/><circle cx="46" cy="12" r="5" fill="${b}"/><path d="M38 28h0" stroke="#fff"/><path d="M16 28l6-2M16 34l6-2M30 26l6 2M30 32l6 2" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".75"/></svg>`,
    bag: (a, b) => `<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">${golge}<path d="M20 22 44 18M20 22l6 22M44 18l-2 24M26 44l16-2" stroke="${b}" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="22" r="8" fill="${a}"/><circle cx="44" cy="18" r="7" fill="${b}"/><circle cx="26" cy="44" r="7" fill="${b}"/><circle cx="42" cy="42" r="9" fill="${a}"/><circle cx="18" cy="19" r="2.5" fill="#fff" opacity=".7"/><circle cx="39" cy="39" r="3" fill="#fff" opacity=".7"/></svg>`,
    unite: (a, b) => `<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">${golge}<path d="M12 40l20 8 20-8-20-8z" fill="${b}"/><path d="M12 32l20 8 20-8-20-8z" fill="${a}"/><path d="M12 24l20 8 20-8-20-8z" fill="#fff" opacity=".85"/><path d="M12 24v0l20 8v0" stroke="${a}" stroke-width="1"/></svg>`,
    arac: (a, b) => `<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">${golge}<rect x="14" y="16" width="16" height="16" rx="5" fill="${a}"/><rect x="34" y="16" width="16" height="16" rx="5" fill="${b}"/><rect x="14" y="36" width="16" height="16" rx="5" fill="${b}"/><rect x="34" y="36" width="16" height="16" rx="5" fill="${a}"/><path d="M18 20h8M38 20h8M18 40h8M38 40h8" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/></svg>`
  };
  const kisiSay = () => Store.all('entities').filter((e) => !['ayet', 'hadis', 'dua'].includes(e.type)).length;
  const MOD = () => [
    {k: 'sd', ad: 'Sureler ve Dualar', alt: 'Dinle, oku ve takip et', f: "go('sd')", r: ['#0f766e', '#14b8a6']},
    {k: 'kavram', ad: 'Kavramlar', alt: Store.all('concepts').length + ' kavram, konularla bağlı', f: "go('kavram')", r: ['#4338ca', '#818cf8']},
    {k: 'kisi', ad: 'Kişiler ve Eserler', alt: kisiSay() + ' kayıt, sözlük', f: "go('kisi')", r: ['#b45309', '#f59e0b']},
    {k: 'bag', ad: 'Bağlantılar', alt: 'Kavram haritası ve konu bağları', f: "go('links',{lk:{tab:'harita'}})", r: ['#0369a1', '#38bdf8']}
  ];

  /* ---------- 1. Elmas: ana sayfa modülleri ---------- */
  T.ana = function () {
    if (view !== 'home' || !elmas() || $.querySelector('.m47')) return;
    const h = $.querySelector('.h46'); if (!h) return;
    h.insertAdjacentHTML('afterend', `<section class="m47" aria-labelledby="m47-h"><h2 id="m47-h" class="m47-h">Hızlı erişim</h2><div class="m47-g">${MOD().map((m) => `<button type="button" class="m47-k" data-k="${m.k}" style="--a:${m.r[0]};--b:${m.r[1]}" onclick="${m.f}"><span class="m47-i">${T.SVG[m.k](m.r[0], m.r[1])}</span><span class="m47-t"><b>${m.ad}</b><small>${m.alt}</small></span></button>`).join('')}</div></section>`);
  };
  /* Sınıflar: yalnız sınıf seçimi (araç satırı ve program ayarı burada tekrar edilmez; program ayarı Profilim › Ayarlar'da) */
  T.siniflar = function () {
    if (view !== 'classes' || !elmas()) return;
    $.querySelectorAll('.r46').forEach((e) => e.remove());
    const hero = $.querySelector('.hero'); if (hero && !hero.dataset.v47) { hero.dataset.v47 = 1; hero.classList.add('h47-ince'); const l = hero.querySelector('.lead'); if (l) l.remove(); }
    [...$.querySelectorAll('details.card')].forEach((d) => { if (/Program sürümü/.test((d.querySelector('summary') || {}).textContent || '')) d.remove(); });
  };

  /* ---------- 2. Altın: koridor altındaki 3B araç şeridi ---------- */
  T.sinif = () => { try { const i = V40.cur(); if (V40.mode === 'odak' || V40.s > -0.5) return V39.GR[i]; } catch (e) {} try { return +V39.ilr().sonSinif || 5; } catch (e) { return 5; } };
  const SERIT = () => [
    {k: 'unite', ad: 'Üniteler ve Konular', alt: () => T.sinif() + '. sınıf', f: "V47.Tasarim.git('unite')", r: ['#8a5a1f', '#e2b765']},
    {k: 'sd', ad: 'Sureler ve Dualar', alt: () => 'Dinleme merkezi', f: "go('sd')", r: ['#0f5f58', '#5fc7b4']},
    {k: 'kavram', ad: 'Kavramlar', alt: () => 'Sözlük', f: "go('kavram')", r: ['#3b3a8f', '#a5a8f5']},
    {k: 'kisi', ad: 'Kişiler ve Eserler', alt: () => 'Sözlük', f: "go('kisi')", r: ['#8a4b12', '#f2b45a']},
    {k: 'bag', ad: 'Bağlantılar', alt: () => 'Kavram haritası', f: "go('links',{lk:{tab:'harita'}})", r: ['#1f5c80', '#7cc6ec']},
    {k: 'arac', ad: 'Öğrenme Araçları', alt: () => T.sinif() + '. sınıf: özet, kart, test…', f: "V47.Tasarim.git('arac')", r: ['#6b3a5c', '#e7a3c9']}
  ];
  T.git = function (k) { const g = T.sinif(); if (k === 'arac') T._arac = 1; go('psinif', {pg: g}); };
  T.serit = function () {
    if (view !== 'pdunya') return; const p = document.getElementById('p40'); if (!p || p.querySelector('.s47')) return;
    const sah = p.querySelector('.sahne40'); if (!sah) return;
    sah.insertAdjacentHTML('afterend', `<section class="s47" aria-labelledby="s47-h"><div class="s47-bas"><h2 id="s47-h">Öğrenme araçları</h2><small>Yana kaydır</small></div><div class="s47-r" role="list">${SERIT().map((m) => `<button type="button" role="listitem" class="s47-k" data-k="${m.k}" style="--a:${m.r[0]};--b:${m.r[1]}" onclick="${m.f}"><span class="s47-i">${T.SVG[m.k]('#fff8e6', m.r[1])}</span><b>${m.ad}</b><small data-alt="${m.k}">${m.alt()}</small></button>`).join('')}</div></section>`);
  };
  T.seritGuncelle = function () { document.querySelectorAll('.s47 [data-alt]').forEach((e) => { const m = SERIT().find((x) => x.k === e.dataset.alt); if (m) e.textContent = m.alt(); }); };
  if (typeof V40 !== 'undefined' && V40.durum) { const d0 = V40.durum; V40.durum = function () { const r = d0.apply(this, arguments); try { T.seritGuncelle(); } catch (e) {} return r; }; }
  // “Öğrenme Araçları” ile gelindiyse sınıf merkezinde araçlar açık gelir
  T.psinif = function () { if (view !== 'psinif' || !T._arac) return; T._arac = 0; const d = $.querySelector('details.d46a'); if (d) { d.open = true; try { d.scrollIntoView({block: 'start'}); } catch (e) {} } };

  const d0 = draw;
  draw = function () { const r = d0.apply(this, arguments); try { T.ana(); T.siniflar(); T.serit(); T.psinif(); } catch (e) { console.warn('[V47] tasarım', e); } return r; };
})();
