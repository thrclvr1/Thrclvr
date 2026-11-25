/* ===================== V54.0 (2/3): Altın — ana sayfa, Çalışma Masam, temalar, gündüz/gece, öğretmen teması =====================
   • Altın ana sayfası (koridor altı) .ah54: devam et, günlük hedef, Çalışma Masam özeti, Oyun Dünyası, keşif alanları. Ayrı “önizleme menüsü”
     (V53 #on53) kaldırıldı; editör kontrolü (“Önizlemeden çık”) Altın ana sayfasının başında ve Altın Profilim'de, akışta (yüzen değil).
   • Çalışma Masam = rota acalis53 (V53 Gelişmiş Çalışma Merkezi + tamamlanan konular, son çalışılanlar, 4 haftalık gelişim, öğrenme geçmişi).
     Altın'da alt menü “Çalışmam” ve koridordaki Çalışma Masası buraya açılır. Elmas Çalışmam (calis45) aynen sade kalır.
   • Temalar  dk-tema54 = {v:1, altin, ogretmen, ogretmenMod}: altin (Altın Mihrap, varsayılan) | lacivert (Gece Lacivert) | zumrut (Zümrüt
     Kütüphane) | murekkep (Mürekkep ve Bakır) | kumtasi (Kum Taşı). Her tema gece ve gündüz için ayrı palet; gündüz/gece temadan bağımsız:
     Altın'da V43 (dk-ptema43), Öğretmen Modu'nda ogretmenMod. Altın'a ilk girişte gündüz/gece sorulur (dk-gorunum54 = {v:1, altin:1}).
     V53 tema öznitelikleri (data-tema53a/o) etkisizleştirildi; dk-tema53 bir kez dk-tema54'e taşınır.
   • Öğretmen paneli Tema düğmesi OGRT.render + draw sonrasında her seferinde .og-top'ta (kalıcı). */
(function () {
  if (!window.V53 || !V53.Calis || !V53.Tema || !V53.Onizleme || typeof V38 === 'undefined') return;
  const V54 = window.V54 = window.V54 || {};
  const A = V51.Altin, O = V53.Onizleme;
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const ls = {al: (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } }, yaz: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }};
  const altin = () => { try { return typeof V39 !== 'undefined' && !!V39.on; } catch (x) { return false; } };

  /* ---------- 1. temalar ---------- */
  const TM = V54.Tema = {K: 'dk-tema54'};
  TM.LISTE = [
    ['altin', 'Altın Mihrap', 'Obsidyen zemin, altın vurgular', ['#130E0A', '#E2B765'], ['#F2EADB', '#7A5012']],
    ['lacivert', 'Gece Lacivert', 'Derin lacivert, pirinç vurgular', ['#0B1322', '#D8B56A'], ['#EEF1F6', '#7A5A1C']],
    ['zumrut', 'Zümrüt Kütüphane', 'Koyu yeşil, eski altın', ['#0A1512', '#D9B76E'], ['#EEF3EF', '#6E5418']],
    ['murekkep', 'Mürekkep ve Bakır', 'Mürekkep moru, bakır vurgular', ['#15101A', '#D99A6C'], ['#F4EFF3', '#8A4F27']],
    ['kumtasi', 'Kum Taşı', 'Sıcak taş, toprak tonları', ['#17120E', '#D7A06A'], ['#F5EFE7', '#84501F']]
  ];
  // Altın: --p-* (gece / gündüz). Altın Mihrap = V43'ün kendi paleti (geçersiz kılınmaz).
  const PA = {
    lacivert: {gece: ['#0B1322', '#121C30', '#18243B', '#101A2C', 'rgba(216,181,106,.22)', '#D8B56A', '#A8843F', '#E6CB8E', '#EDF1F8', '#D9E0EC', '#AEB9CB', '#10131A'], gunduz: ['#EEF1F6', '#FFFFFF', '#E5EAF2', '#F7F9FC', 'rgba(40,60,100,.18)', '#7A5A1C', '#A8843F', '#6E5016', '#16213A', '#26324D', '#4E5A70', '#FFFFFF']},
    zumrut: {gece: ['#0A1512', '#10201B', '#172B24', '#0E1C17', 'rgba(217,183,110,.22)', '#D9B76E', '#A9883F', '#E8CF95', '#EEF5F1', '#D7E5DD', '#A9BFB4', '#0E1510'], gunduz: ['#EEF3EF', '#FFFFFF', '#E3ECE6', '#F6F9F7', 'rgba(30,80,60,.18)', '#6E5418', '#A9883F', '#62490F', '#14261F', '#22362D', '#4A5F55', '#FFFFFF']},
    murekkep: {gece: ['#15101A', '#1E1725', '#281F31', '#1A1420', 'rgba(217,154,108,.24)', '#D99A6C', '#AA6E44', '#E8B796', '#F3EDF5', '#E2D8E6', '#BDB0C2', '#1A0F0A'], gunduz: ['#F4EFF3', '#FFFFFF', '#EBE3EA', '#FAF7F9', 'rgba(90,50,80,.18)', '#8A4F27', '#AA6E44', '#7C4520', '#23182A', '#33263B', '#5E5164', '#FFFFFF']},
    kumtasi: {gece: ['#17120E', '#211A14', '#2B221A', '#1C1611', 'rgba(215,160,106,.24)', '#D7A06A', '#A8733F', '#E7BD90', '#F5EEE6', '#E6DACE', '#C2B3A3', '#1A100A'], gunduz: ['#F5EFE7', '#FFFDF9', '#EDE3D6', '#FBF7F1', 'rgba(120,80,40,.2)', '#84501F', '#A8733F', '#76461A', '#2A1F15', '#3B2D20', '#5E4F40', '#FFFFFF']}
  };
  const PK = ['bg', 'card', 'card2', 'sheet', 'line', 'gold', 'gold2', 'gold-t', 'ink', 'ink2', 'mut', 'on-gold'];
  // Öğretmen: --t37-* [bg, card, card2, line, line2, ink, mut, act, on, steel, steel2, soft, kz-bg, kz-line, kz-ink, kz-code]
  const PO = {
    altin: {gunduz: ['#F6F1E7', '#FFFFFF', '#F1E9DA', '#DCCCAE', '#C7B28A', '#241B10', '#5A4B36', '#7A5012', '#FFFFFF', '#7A5012', '#6A450F', '#EFE5D2', '#FFFFFF', '#B38A45', '#241B10', '#7A5012']},
    lacivert: {gece: ['#0B1322', '#121C30', '#18243B', '#2A3A56', '#3E5274', '#EDF1F8', '#AEB9CB', '#D8B56A', '#10131A', '#D8B56A', '#B8964F', '#16223A', '#0F1828', '#A8843F', '#EDF1F8', '#E6CB8E'], gunduz: ['#EEF1F6', '#FFFFFF', '#E5EAF2', '#CBD4E2', '#AEBBD0', '#16213A', '#4E5A70', '#7A5A1C', '#FFFFFF', '#7A5A1C', '#664A15', '#E6EBF3', '#FFFFFF', '#A8843F', '#16213A', '#6E5016']},
    zumrut: {gece: ['#0A1512', '#10201B', '#172B24', '#264438', '#34604E', '#EEF5F1', '#A9BFB4', '#D9B76E', '#0E1510', '#D9B76E', '#B99A55', '#13291F', '#0C1A14', '#A9883F', '#EEF5F1', '#E8CF95'], gunduz: ['#EEF3EF', '#FFFFFF', '#E3ECE6', '#C6D6CC', '#A7BFB1', '#14261F', '#4A5F55', '#6E5418', '#FFFFFF', '#6E5418', '#5C460F', '#E4EDE7', '#FFFFFF', '#A9883F', '#14261F', '#62490F']},
    murekkep: {gece: ['#15101A', '#1E1725', '#281F31', '#3B2E46', '#55426A', '#F3EDF5', '#BDB0C2', '#D99A6C', '#1A0F0A', '#D99A6C', '#BB7F55', '#241B2E', '#18121E', '#AA6E44', '#F3EDF5', '#E8B796'], gunduz: ['#F4EFF3', '#FFFFFF', '#EBE3EA', '#D8CAD6', '#C1ADBF', '#23182A', '#5E5164', '#8A4F27', '#FFFFFF', '#8A4F27', '#74411F', '#EEE6ED', '#FFFFFF', '#AA6E44', '#23182A', '#7C4520']},
    kumtasi: {gece: ['#17120E', '#211A14', '#2B221A', '#433526', '#5E4A35', '#F5EEE6', '#C2B3A3', '#D7A06A', '#1A100A', '#D7A06A', '#B9854F', '#2A2119', '#1A1410', '#A8733F', '#F5EEE6', '#E7BD90'], gunduz: ['#F5EFE7', '#FFFDF9', '#EDE3D6', '#DCCDB9', '#C6B196', '#2A1F15', '#5E4F40', '#84501F', '#FFFFFF', '#84501F', '#6E4219', '#EFE6D9', '#FFFFFF', '#A8733F', '#2A1F15', '#76461A']}
  };
  const OK = ['bg', 'card', 'card2', 'line', 'line2', 'ink', 'mut', 'act', 'on', 'steel', 'steel2', 'soft', 'kz-bg', 'kz-line', 'kz-ink', 'kz-code'];
  let css = '';
  Object.entries(PA).forEach(([k, m]) => {
    css += `html:not([data-pt43="gunduz"])[data-tema54a="${k}"] body[data-prem39][data-prem39]{${m.gece.map((v, i) => `--p-${PK[i]}:${v}`).join(';')}}\n`;
    css += `html[data-pt43="gunduz"][data-tema54a="${k}"] body[data-prem39][data-prem39]{${m.gunduz.map((v, i) => `--p-${PK[i]}:${v}`).join(';')}}\n`;
  });
  Object.entries(PO).forEach(([k, m]) => ['gece', 'gunduz'].forEach((md) => { if (m[md]) css += `html[data-tema54o="${k}"][data-tema54om="${md}"] body[data-ogrt37][data-ogrt37][data-ogrt37][data-ogrt37]{${m[md].map((v, i) => `--t37-${OK[i]}:${v}`).join(';')}}\n`; }));
  css += `html[data-pt43="gunduz"][data-tema54a="altin"] body[data-prem39][data-prem39]{--p-on-gold:#FFFFFF}\n`;   // V43 gündüz: altın düğme yazısı okunur
  css += `
html[data-tema54om="gunduz"] body[data-ogrt37]{color-scheme:light}
body[data-prem39],body[data-ogrt37]{transition:background-color .35s ease,color .35s ease}
.tm54{display:grid;gap:10px}.tm54-k{display:flex;align-items:center;gap:14px;min-height:64px;padding:10px 14px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.tm54-k.on{border-color:var(--pri);box-shadow:0 0 0 2px var(--pri) inset}.tm54-k b{display:block}.tm54-k small{display:block;color:var(--mut)}
.tm54-o{display:flex;width:56px;height:40px;border-radius:10px;overflow:hidden;border:1px solid rgba(127,127,127,.35);flex:none}.tm54-o i{flex:1;display:flex;align-items:center;justify-content:center}.tm54-o i b{width:12px;height:12px;border-radius:50%}
.gg54{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 14px}.gg54 button{min-height:56px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:700;cursor:pointer}
.gg54 button[aria-pressed="true"]{border-color:var(--pri);box-shadow:0 0 0 2px var(--pri) inset}
#gg54{position:fixed;inset:0;z-index:9650;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(8,6,4,.72)}
#gg54 .gg54-k{width:100%;max-width:420px;padding:22px;border-radius:20px;background:var(--p-card,#1E1710);color:var(--p-ink,#F3EADB);border:1px solid var(--p-line,rgba(226,183,101,.3))}
#gg54 h2{margin:0 0 6px}#gg54 p{margin:0 0 16px;color:var(--p-mut,#CFC2AA)}
#gg54 .gg54-s{display:grid;grid-template-columns:1fr 1fr;gap:12px}#gg54 .gg54-s button{display:flex;flex-direction:column;align-items:center;gap:8px;min-height:120px;border-radius:16px;font:inherit;font-weight:700;cursor:pointer;border:1px solid var(--p-line,#555)}
#gg54 .gg54-gun{background:#F6EFE2;color:#2A1E12}#gg54 .gg54-gec{background:#120D09;color:#F3EADB}
.og54-tm{min-height:40px;padding:6px 14px;border-radius:999px;border:1px solid var(--t37-line2,var(--line));background:var(--t37-card2,var(--surface));color:var(--t37-ink,var(--ink));font:inherit;font-weight:600;cursor:pointer}
.og53-tm{display:none!important}#on53{display:none!important}
`;
  try { const st = document.createElement('style'); st.id = 'v54-tema-css'; st.textContent = css; document.head.appendChild(st); } catch (x) {}

  TM.oku = function () {
    let r = ls.al(TM.K);
    if (!r || r.v !== 1) {
      const eski = ls.al('dk-tema53') || {}, es = {royal: 'altin', ocean: 'lacivert', emerald: 'zumrut', amethyst: 'murekkep', crimson: 'murekkep', pearl: 'altin'};
      r = {v: 1, altin: es[eski.altin] || 'altin', ogretmen: es[eski.ogretmen] || 'altin', ogretmenMod: eski.ogretmen === 'pearl' ? 'gunduz' : 'gece'};
      ls.yaz(TM.K, r);
    }
    return r;
  };
  TM.uygula = function () {
    const r = TM.oku(), d = document.documentElement;
    d.setAttribute('data-tema54a', r.altin || 'altin'); d.setAttribute('data-tema54o', r.ogretmen || 'altin'); d.setAttribute('data-tema54om', r.ogretmenMod || 'gece');
    d.setAttribute('data-tema53a', 'royal'); d.setAttribute('data-tema53o', 'royal');   // V53 paletleri etkisiz
  };
  V53.Tema.uygula = TM.uygula;
  V53.Tema.ac = (yer) => TM.ac(yer === 'ogretmen' ? 'ogretmen' : 'altin');
  TM.sec = function (yer, k) {
    if (!TM.LISTE.some((t) => t[0] === k)) return;
    const r = TM.oku(); r[yer] = k; ls.yaz(TM.K, r); TM.uygula();                    // gündüz/gece değişmez
    UI.toast(TM.LISTE.find((t) => t[0] === k)[1] + ' teması uygulandı.');
    TM.yenile(yer);
  };
  TM.mod = function (yer, m) {
    if (!['gunduz', 'gece'].includes(m)) return;
    if (yer === 'altin') { try { V43.ayarla(m); } catch (x) {} const g = ls.al('dk-gorunum54') || {v: 1}; g.altin = 1; ls.yaz('dk-gorunum54', g); }
    else { const r = TM.oku(); r.ogretmenMod = m; ls.yaz(TM.K, r); TM.uygula(); }
    TM.yenile(yer);
  };
  TM.modu = (yer) => (yer === 'altin' ? (document.documentElement.getAttribute('data-pt43') === 'gunduz' ? 'gunduz' : 'gece') : (TM.oku().ogretmenMod || 'gece'));
  TM.icerik = function (yer) {
    const r = TM.oku(), a = r[yer] || 'altin', md = TM.modu(yer);
    return `<div class="gg54" role="group" aria-label="Görünüm"><button type="button" aria-pressed="${md === 'gunduz'}" onclick="V54.Tema.mod('${yer}','gunduz')">☀ Gündüz</button><button type="button" aria-pressed="${md === 'gece'}" onclick="V54.Tema.mod('${yer}','gece')">☾ Gece</button></div>
<div class="tm54" role="radiogroup" aria-label="Tema">${TM.LISTE.map(([k, ad, ack, g, d]) => { const c = md === 'gunduz' ? d : g; return `<button type="button" role="radio" aria-checked="${k === a}" class="tm54-k ${k === a ? 'on' : ''}" onclick="V54.Tema.sec('${yer}','${k}')"><span class="tm54-o"><i style="background:${c[0]}"><b style="background:${c[1]}"></b></i></span><span><b>${ad}</b><small>${ack}</small></span></button>`; }).join('')}</div>`;
  };
  TM.ac = function (yer) {
    TM._yer = yer;
    TM._s = UI.sheet({title: (yer === 'altin' ? 'Altın' : 'Öğretmen Modu') + ' görünümü', body: () => `<div id="tm54-kap">${TM.icerik(yer)}</div><p class="small mut">Gündüz/gece ve tema ayrı ayrı saklanır.</p>`, footer: () => '<button onclick="UI.close()">Kapat</button>'});
  };
  TM.yenile = function (yer) { const k = document.getElementById('tm54-kap'); if (k) k.innerHTML = TM.icerik(yer); const p = document.getElementById('pr54-gor'); if (p) p.innerHTML = TM.icerik('altin'); };
  TM.uygula();

  // Altın'a ilk girişte gündüz / gece
  TM.ilkSor = function () {
    if (!altin() || document.getElementById('gg54') || (ls.al('dk-gorunum54') || {}).altin) return;
    const d = document.createElement('div'); d.id = 'gg54'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'gg54-h');
    d.innerHTML = `<div class="gg54-k"><h2 id="gg54-h">Altın görünümünü seç</h2><p>İstediğin zaman Profilim › Görünüm'den değiştirebilirsin.</p><div class="gg54-s"><button type="button" class="gg54-gun" onclick="V54.Tema.ilkSec('gunduz')"><span aria-hidden="true" style="font-size:2rem">☀</span>Gündüz</button><button type="button" class="gg54-gec" onclick="V54.Tema.ilkSec('gece')"><span aria-hidden="true" style="font-size:2rem">☾</span>Gece</button></div></div>`;
    document.body.appendChild(d);
  };
  TM.ilkSec = function (m) { TM.mod('altin', m); const d = document.getElementById('gg54'); if (d) d.remove(); };

  // öğretmen paneli: Tema düğmesi kalıcı
  TM.ogrDugme = function () {
    if (view !== 'ogretmen') return;
    const top = document.querySelector('#app .og-top'); if (!top || top.querySelector('.og54-tm')) return;
    top.insertAdjacentHTML('beforeend', '<button type="button" class="og54-tm" onclick="V54.Tema.ac(\'ogretmen\')" aria-label="Öğretmen Modu görünümü: tema ve gündüz/gece">Tema</button>');
  };
  if (typeof OGRT !== 'undefined' && OGRT.render) { const or0 = OGRT.render; OGRT.render = function () { const r = or0.apply(this, arguments); try { TM.ogrDugme(); } catch (x) {} return r; }; }
  try { new MutationObserver(() => { if (view === 'ogretmen') TM.ogrDugme(); }).observe(document.getElementById('app') || document.body, {childList: true, subtree: true}); } catch (x) {}

  /* ---------- 2. Çalışma Masam ---------- */
  const CM = V53.Calis;
  const ciz0 = CM.ciz;
  CM.ciz = function () {
    let h = ciz0.apply(this, arguments);
    h = h.replace('Altın · Gelişmiş Çalışma Merkezi', 'Altın · Çalışma Masam').replace('<h1>Sana özel çalışma</h1>', '<h1>Çalışma Masam</h1>');
    const s = CM.sinif(), mt = (Store.ov && Store.ov.mt) || {}, simdi = Date.now();
    const tamam = Object.entries(mt).map(([id, r]) => ({t: Store.get('topics', id), r})).filter((x) => x.t && (!s || +x.t.grade === s) && x.r && x.r.n && x.r.ok / x.r.n >= 0.7).sort((a, b) => String(b.r.at || '').localeCompare(String(a.r.at || '')));
    let son = []; try { const z = (V39.ilr().z) || {}; son = Object.entries(z).map(([id, t]) => ({t: Store.get('topics', id), at: typeof t === 'number' ? t : (t && t.t) || 0})).filter((x) => x.t && (!s || +x.t.grade === s)).sort((a, b) => b.at - a.at).slice(0, 5); } catch (x) {}
    const sonT = (() => { const r = ls.al('dk-son54'); const id = r && r.s && r.s[s]; return id ? Store.get('topics', id) : null; })();
    if (!son.length && sonT) son = [{t: sonT}];
    let cal = {gun: {}}; try { cal = V45.Calis.oku(); } catch (x) {}
    const haftalar = [3, 2, 1, 0].map((h) => { let n = 0; for (let i = 0; i < 7; i++) { const d = new Date(simdi - (h * 7 + i) * 864e5); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); n += (cal.gun || {})[k] || 0; } return n; });
    const mx = Math.max(1, ...haftalar), testler = ((Store.ov && Store.ov.tests) || []).slice(0, 5);
    const bos = (m) => `<p class="ac53-bos">${m}</p>`;
    const ek = `
<article class="ac53-k"><h2>Tamamlanan konular</h2>${tamam.length ? `<p><b>${tamam.length}</b> konuyu mini testte %70 ve üstüyle tamamladın.</p><ul class="ac53-l">${tamam.slice(0, 5).map((x) => `<li><span>${e(x.t.title)}</span><b>%${Math.round(100 * x.r.ok / x.r.n)}</b></li>`).join('')}</ul>` : bos('Henüz tamamlanan konu yok. Bir konunun mini testinde %70 ve üstü yaptığında burada görünür.')}</article>
<article class="ac53-k"><h2>Son çalıştığın konular</h2>${son.length ? `<ul class="ac53-l">${son.map((x) => `<li><button type="button" onclick="go('pders',{pt:'${e(x.t.id)}'})"><span>${e(x.t.title)}</span><b>›</b></button></li>`).join('')}</ul>` : bos('Henüz konu açmadın.')}</article>
<article class="ac53-k"><h2>Gelişimin (son 4 hafta)</h2>${haftalar.some((n) => n) ? `<div class="ac53-gr ah54-4" role="img" aria-label="Son 4 haftada verilen cevaplar">${haftalar.map((n, i) => `<span><i style="height:${Math.round(100 * n / mx)}%"></i><small>${i === 3 ? 'Bu hafta' : (3 - i) + ' hf önce'}</small><em>${n}</em></span>`).join('')}</div>` : bos('Henüz cevap kaydı yok.')}</article>
<article class="ac53-k"><h2>Öğrenme geçmişi</h2>${testler.length ? `<ul class="ac53-l">${testler.map((t) => { const n = +t.n || (t.total || 0), d = +t.ok || +t.correct || 0; return `<li><span>${e(t.title || t.name || 'Test')}</span><b>${n ? '%' + Math.round(100 * d / n) : ''}</b><small>${e(String(t.at || t.date || '').slice(0, 10))}</small></li>`; }).join('')}</ul>` : bos('Henüz test geçmişi yok.')}</article>`;
    return h.replace(/<\/div><\/section>\s*$/, ek + '</div></section>');
  };
  try { const st = document.createElement('style'); st.textContent = '.ah54-4{grid-template-columns:repeat(4,1fr)!important}'; document.head.appendChild(st); } catch (x) {}

  /* ---------- 3. Altın ana sayfa (koridor altı) ---------- */
  const AH = V54.AltinAna = {};
  AH.html = function () {
    const s = CM.sinif(), V = CM.veri();
    const r = ls.al('dk-son54'), sonT = s && r && r.s && r.s[s] ? Store.get('topics', r.s[s]) : null;
    const hedef = V.cal.hedef || 20, bugun = V.gunler[6].n, plan = V.zayif[0] ? `${e(V.zayif[0].t.title)} konusunu tekrar et` : (V.yanlis.length ? `${V.yanlis.length} yanlış soruyu yeniden çöz` : (V.tekrar ? `${V.tekrar} kartı tekrar et` : 'Bugün yeni bir konuya başla'));
    const k = (ad, alt, js) => `<button type="button" class="ah54-s" onclick="${js}"><b>${ad}</b><small>${alt}</small></button>`;
    return `<section class="ah54" aria-label="Altın ana sayfa">
${O.acik() ? `<div class="ah54-ed" role="note"><span>Editör önizlemesi · Altın öğrencilere henüz açık değil</span><button type="button" onclick="V53.Onizleme.bitir()">Önizlemeden çık</button></div>` : ''}
<div class="ah54-ust">${sonT ? `<button type="button" class="ah54-dv" onclick="go('pders',{pt:'${e(sonT.id)}'})"><small>Kaldığın yerden devam et</small><b>${e(sonT.title)}</b></button>` : `<button type="button" class="ah54-dv" onclick="${s ? `go('psinif',{pg:${s}})` : "V53.Hesap.sinifAc(true)"}"><small>Öğrenme alanım</small><b>${s ? s + '. sınıf merkezine gir' : 'Sınıfını seç'}</b></button>`}
<div class="ah54-hd"><span class="ah54-hl" style="--y:${Math.min(100, Math.round(100 * bugun / hedef))}"><b>${bugun}</b><small>/${hedef}</small></span><small>Günlük hedef</small></div></div>
<button type="button" class="ah54-masa" onclick="go('acalis53')"><span><small>Çalışma Masam</small><b>${plan}</b></span><em>Planın ve analizlerin ›</em></button>
<div class="ah54-g">${k('Derslerim', s ? s + '. sınıf ve diğer sınıflar' : '4–12. sınıflar', s ? `go('psinif',{pg:${s}})` : "go('pdunya')")}${k('Oyun Dünyası', 'Altın oyunları, hikâyeli görevler', "go('poyun')")}</div>
<h3 class="ah54-b">Keşif</h3><div class="ah54-g ah54-g4">${k('Sureler ve Dualar', 'Dinle, oku', "go('sd')")}${k('Kavramlar', 'Sözlük', "go('kavram')")}${k('Kişiler ve Eserler', 'Şahsiyetler, mekânlar', "go('kisi')")}${k('Bağlantılar', 'Kavram haritası', "go('links',{lk:{tab:'harita'}})")}</div></section>`;
  };
  try {
    const st = document.createElement('style');
    st.textContent = `.ah54{display:grid;gap:12px;margin:14px max(16px,env(safe-area-inset-left)) 24px max(16px,env(safe-area-inset-right))}.ah54-ed{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-radius:12px;border:1px dashed var(--p-gold,#E2B765);color:var(--p-gold-t,#EBCB8B);font-size:.88rem}
.ah54-ed button{min-height:40px;padding:6px 12px;border-radius:999px;border:1px solid currentColor;background:none;color:inherit;font:inherit;font-weight:700;cursor:pointer}
.ah54-ust{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:stretch}
.ah54-dv,.ah54-masa,.ah54-s{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:14px 16px;border-radius:16px;border:1px solid var(--p-line,var(--line));background:var(--p-card,var(--surface));color:var(--p-ink,var(--ink));font:inherit;text-align:left;cursor:pointer;min-height:64px}
.ah54-dv small,.ah54-masa small{color:var(--p-gold-t,var(--pri));font-weight:700}.ah54-dv b{font-size:1.05rem}
.ah54-hd{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px 12px;border-radius:16px;border:1px solid var(--p-line,var(--line));background:var(--p-card,var(--surface));min-width:92px}
.ah54-hl{display:flex;align-items:baseline;justify-content:center;width:62px;height:62px;border-radius:50%;padding-top:18px;background:conic-gradient(var(--p-gold,#E2B765) calc(var(--y)*1%),var(--p-line,#444) 0)}
.ah54-hl b{font-size:1.1rem}.ah54-hl small{font-size:.7rem;color:var(--p-mut,var(--mut))}.ah54-hd>small{color:var(--p-mut,var(--mut));font-size:.78rem}
.ah54-hl{position:relative}.ah54-hl::before{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--p-card,var(--surface));z-index:0}.ah54-hl b,.ah54-hl small{position:relative;z-index:1}
.ah54-masa{flex-direction:row;align-items:center;justify-content:space-between;background:linear-gradient(135deg,var(--p-card2,var(--surface)),var(--p-card,var(--surface)))}.ah54-masa span{display:flex;flex-direction:column;gap:3px}.ah54-masa em{font-style:normal;color:var(--p-gold-t,var(--pri));font-size:.86rem;white-space:nowrap}
.ah54-g{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ah54-s b{font-size:.98rem}.ah54-s small{color:var(--p-mut,var(--mut));font-size:.8rem}
.ah54-b{margin:6px 2px 0;font-size:.95rem;color:var(--p-mut,var(--mut))}`;
    document.head.appendChild(st);
  } catch (x) {}
  AH.yerlestir = function () {
    if (view !== 'pdunya' || $.querySelector('.ah54')) return;
    const m = $.querySelector('.c48-masa'); if (m) m.remove();
    const s47 = $.querySelector('.s47');
    if (s47) s47.insertAdjacentHTML('afterend', AH.html()); else $.insertAdjacentHTML('beforeend', AH.html());
  };

  /* ---------- 4. önizleme: yüzen menü yok; Altın Profilim'de görünüm + çıkış ---------- */
  O.serit = function () { const s = document.getElementById('on53'); if (s) s.remove(); };
  O.menu = function () { go('pdunya'); };
  AH.profil = function () {
    if (view !== 'profil46' || !altin() || $.querySelector('.pr54')) return;
    const h = `<section class="card p46-s pr54" aria-labelledby="pr54-h"><h2 id="pr54-h">Görünüm</h2><div id="pr54-gor">${TM.icerik('altin')}</div>${O.acik() ? '<div class="ah54-ed"><span>Editör önizlemesi</span><button type="button" onclick="V53.Onizleme.bitir()">Önizlemeden çık</button></div>' : ''}</section>`;
    const y = $.querySelector('.pr53') || $.querySelector('.pr49-ust'); if (y) y.insertAdjacentHTML('afterend', h); else $.insertAdjacentHTML('afterbegin', h);
  };

  /* ---------- 5. gezinme: Altın'da Çalışmam → Çalışma Masam ---------- */
  const go0 = go;
  window.go = go = function (v, a) { try { if (v === 'calis45' && altin()) v = 'acalis53'; } catch (x) {} return go0.call(this, v, a); };

  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try {
      O.serit(); TM.ogrDugme();
      if (altin()) { AH.yerlestir(); AH.profil(); TM.ilkSor(); $.querySelectorAll('.c48-mb').forEach((b) => b.setAttribute('onclick', "go('acalis53')")); }
    } catch (x) {}
    return r;
  };
})();
