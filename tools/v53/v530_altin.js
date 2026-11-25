/* ===================== V53.0 (2/3): editörün Altın önizlemesi, Altın ve Öğretmen temaları, Altın Gelişmiş Çalışma Merkezi =====================
   • Altın HÂLÂ YAYINDA DEĞİL: V51.Altin.ACIK=false. Yalnız editör oturumu açıkken (V38.edOk()) “Altın önizlemesi” açılabilir:
     sessionStorage dk-altin-onizleme53='1' + V38.edOk() → V51.Altin.acikMi() true. Öğrenci ve öğretmen “Çok yakında” görür.
     Editör çıkışı ya da “Önizlemeden çık” önizlemeyi kapatır ve Elmas'a döner.
   • Temalar  dk-tema53 = {v:1, altin, ogretmen}: royal (varsayılan) | ocean | emerald | amethyst | pearl | crimson.
     Altın: --p-* değişkenleri (pearl = V43 Gündüz + inci vurgusu); Öğretmen: --t37-* değişkenleri. html[data-tema53a|data-tema53o].
   • Gelişmiş Çalışma Merkezi  rota 'acalis53' (yalnız Altın açıkken): gerçek kayıtlardan zayıf konular, yanlış sorular,
     tekrar kartları, günlük/haftalık hedef, ünite başarısı ve bugünkü plan. Veri yoksa “henüz veri yok” yazar; uydurma yüzde yok. */
(function () {
  if (!window.V51 || !V51.Altin || typeof V38 === 'undefined') return;
  const V53 = window.V53 = window.V53 || {};
  const A = V51.Altin;
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const ls = {al: (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } }, yaz: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }};

  /* ---------- 1. editörün Altın önizlemesi ---------- */
  const O = V53.Onizleme = {K: 'dk-altin-onizleme53'};
  O.bayrak = () => { try { return sessionStorage.getItem(O.K) === '1'; } catch (x) { return false; } };
  O.acik = () => O.bayrak() && !!V38.edOk();
  const ak0 = A.acikMi;
  A.acikMi = function () { return ak0.apply(this, arguments) || O.acik(); };
  const isaret = () => { try { document.documentElement.toggleAttribute('data-altin-kapali', !A.acikMi()); document.documentElement.toggleAttribute('data-onizleme53', O.acik()); } catch (x) {} };
  O.baslat = function () {
    if (!V38.edOk()) { UI.toast('Altın önizlemesi yalnız editör oturumunda açılır.'); return; }
    try { sessionStorage.setItem(O.K, '1'); } catch (x) {}
    isaret(); O.yakindaKapat(); V42.gec('premium'); setTimeout(O.yakindaKapat, 300);
  };
  O.yakindaKapat = () => { try { document.querySelectorAll('#yk518').forEach((x) => x.remove()); document.documentElement.classList.remove('yk518-kilit'); } catch (x) {} };
  O.bitir = function (sessiz) {
    try { sessionStorage.removeItem(O.K); } catch (x) {}
    isaret();
    try { if (typeof V39 !== 'undefined' && V39.on) V39.on = false; } catch (x) {}
    try { sessionStorage.removeItem(V39.SK); } catch (x) {}
    if (!sessiz) { try { V42.gec('normal'); } catch (x) { go('home'); } }
  };
  const lo0 = V38.edLogout;
  V38.edLogout = function () { const onz = O.bayrak(); const r = lo0.apply(this, arguments); if (onz) O.bitir(true); isaret(); return r; };
  if (V38.edHomeHTML) {
    const h0 = V38.edHomeHTML;
    V38.edHomeHTML = function () {
      const h = h0.apply(this, arguments);
      return h + `<section class="ed53-al" aria-label="Altın önizlemesi"><div><b>Altın Öğrenme Alanı · önizleme</b><small>Altın henüz öğrencilere ve öğretmenlere açık değil (“Çok yakında”). Burada editör olarak içerikleri, oyunları ve Gelişmiş Çalışma Merkezi'ni öğrenci görünümünde inceleyebilirsin.</small></div><button type="button" class="ed53-alb" onclick="V53.Onizleme.baslat()">Altın'ı önizle</button></section>`;
    };
  }
  // Altın'dayken üst şerit: önizleme bilgisi, Gelişmiş Çalışma Merkezi, Altın Oyunları, Tema, çıkış
  O.serit = function () {
    let s = document.getElementById('on53');
    if (!(O.acik() && typeof V39 !== 'undefined' && V39.on)) { if (s) s.remove(); return; }
    if (!s) { s = document.createElement('div'); s.id = 'on53'; s.setAttribute('role', 'region'); s.setAttribute('aria-label', 'Editör önizlemesi'); document.body.appendChild(s); }
    if (!s.firstChild) s.innerHTML = `<button type="button" class="on53-e" aria-haspopup="dialog" onclick="V53.Onizleme.menu()">Editör önizlemesi ▾</button>`;
  };

  O.menu = function () {
    UI.sheet({title: 'Altın önizlemesi (editör)', body: () => `<p class="small mut">Altın henüz öğrencilere ve öğretmenlere açık değil. Bu menü yalnız editör oturumunda görünür.</p><div class="on53-m"><button type="button" onclick="UI.close();go('acalis53')">Gelişmiş Çalışma Merkezi</button><button type="button" onclick="UI.close();go('aoyun53')">Altın Oyunları</button><button type="button" onclick="UI.close();setTimeout(()=>V53.Tema.ac('altin'),250)">Altın teması</button><button type="button" class="on53-x" onclick="UI.close();V53.Onizleme.bitir()">Önizlemeden çık</button></div>`,
      footer: () => '<button onclick="UI.close()">Kapat</button>'});
  };

  /* ---------- 2. temalar ---------- */
  const TM = V53.Tema = {K: 'dk-tema53'};
  TM.LISTE = [['royal', 'Royal Gold', 'Siyah ve altın', '#130E0A', '#E2B765'], ['ocean', 'Ocean Blue', 'Lacivert ve gümüş', '#0A1220', '#B9CBE3'], ['emerald', 'Emerald', 'Zümrüt ve koyu yeşil', '#08140F', '#6FD3A4'], ['amethyst', 'Amethyst', 'Mor ve menekşe', '#120C1C', '#C7A6F0'], ['pearl', 'Pearl', 'Beyaz ve inci', '#F7F4EF', '#8C7A57'], ['crimson', 'Crimson', 'Antrasit ve bordo', '#141416', '#E58C97']];
  TM.oku = () => { const r = ls.al(TM.K); return r && r.v === 1 ? r : {v: 1, altin: 'royal', ogretmen: 'royal'}; };
  TM.uygula = function () {
    const r = TM.oku(), d = document.documentElement;
    d.setAttribute('data-tema53a', r.altin || 'royal'); d.setAttribute('data-tema53o', r.ogretmen || 'royal');
  };
  TM.sec = function (yer, k) {
    if (!TM.LISTE.some((t) => t[0] === k)) return;
    const r = TM.oku(); r[yer] = k; ls.yaz(TM.K, r);
    if (yer === 'altin' && typeof V43 !== 'undefined' && V43.ayarla) { try { V43.ayarla(k === 'pearl' ? 'gunduz' : 'gece'); } catch (x) {} }
    TM.uygula(); try { UI.close(); } catch (x) {}
    UI.toast(TM.LISTE.find((t) => t[0] === k)[1] + ' teması uygulandı.');
    setTimeout(() => { try { draw(); } catch (x) {} }, 220);
  };
  TM.ac = function (yer) {
    const r = TM.oku(), a = r[yer] || 'royal';
    UI.sheet({title: (yer === 'altin' ? 'Altın' : 'Öğretmen Modu') + ' teması', body: () => `<div class="tm53" role="radiogroup" aria-label="Tema">${TM.LISTE.map(([k, ad, ack, z, v]) => `<button type="button" role="radio" aria-checked="${k === a}" class="tm53-k ${k === a ? 'on' : ''}" onclick="V53.Tema.sec('${yer}','${k}')"><span class="tm53-o" style="background:${z}"><i style="background:${v}"></i></span><span><b>${ad}</b><small>${ack}</small></span></button>`).join('')}</div><p class="small mut">Seçimin bu cihazda saklanır.</p>`,
      footer: () => '<button onclick="UI.close()">Kapat</button>'});
  };
  const PAL = {
    ocean: {bg: '#0A1220', card: '#111C2E', card2: '#172539', sheet: '#0F1A2B', line: 'rgba(170,195,230,.26)', gold: '#B9CBE3', gold2: '#7F9CC2', goldt: '#D3E0F1', ink: '#EAF1FA', ink2: '#D6E1EF', mut: '#B4C3D6', on: '#0A1220'},
    emerald: {bg: '#08140F', card: '#0F2019', card2: '#152B22', sheet: '#0D1C16', line: 'rgba(110,200,160,.26)', gold: '#6FD3A4', gold2: '#3E9E74', goldt: '#9BE3C1', ink: '#E8F5EE', ink2: '#D2EADF', mut: '#AFCDBF', on: '#06140D'},
    amethyst: {bg: '#120C1C', card: '#1C1429', card2: '#261C37', sheet: '#191226', line: 'rgba(190,160,235,.26)', gold: '#C7A6F0', gold2: '#9473C9', goldt: '#DCC7F7', ink: '#F1EAFB', ink2: '#E2D8F1', mut: '#C8BCDB', on: '#140C20'},
    crimson: {bg: '#141416', card: '#1D1C20', card2: '#27252B', sheet: '#1A191D', line: 'rgba(225,130,140,.28)', gold: '#E58C97', gold2: '#B5505E', goldt: '#F0AEB6', ink: '#F2ECEE', ink2: '#E3DADD', mut: '#C6BCC0', on: '#1A0B0E'}
  };
  const OGR = {
    ocean: {bg: '#0A1220', card: '#111C2E', card2: '#172539', line: '#2A3A52', line2: '#3D5172', ink: '#EAF1FA', mut: '#B4C3D6', act: '#B9CBE3', on: '#0A1220', steel: '#AFC3DF', steel2: '#8FA9CC', soft: '#16243A', kzbg: '#0E1828', kzline: '#8FA9CC', kzink: '#EAF1FA', kzcode: '#C9DBF2'},
    emerald: {bg: '#08140F', card: '#0F2019', card2: '#152B22', line: '#24443A', line2: '#326050', ink: '#E8F5EE', mut: '#AFCDBF', act: '#6FD3A4', on: '#06140D', steel: '#7FD8AE', steel2: '#5BBF92', soft: '#13291F', kzbg: '#0C1A14', kzline: '#5BBF92', kzink: '#E8F5EE', kzcode: '#9BE3C1'},
    amethyst: {bg: '#120C1C', card: '#1C1429', card2: '#261C37', line: '#3A2C52', line2: '#544074', ink: '#F1EAFB', mut: '#C8BCDB', act: '#C7A6F0', on: '#140C20', steel: '#CDB0F2', steel2: '#AE8EDD', soft: '#241A36', kzbg: '#170F24', kzline: '#AE8EDD', kzink: '#F1EAFB', kzcode: '#DCC7F7'},
    crimson: {bg: '#141416', card: '#1D1C20', card2: '#27252B', line: '#3D3438', line2: '#5A474D', ink: '#F2ECEE', mut: '#C6BCC0', act: '#E58C97', on: '#1A0B0E', steel: '#E89AA4', steel2: '#C9707D', soft: '#2A2226', kzbg: '#18171A', kzline: '#C9707D', kzink: '#F2ECEE', kzcode: '#F0AEB6'},
    pearl: {bg: '#F7F4EF', card: '#FFFFFF', card2: '#F2EDE5', line: '#DED5C6', line2: '#C8B99F', ink: '#1E1A15', mut: '#585045', act: '#6E5A33', on: '#FFFFFF', steel: '#6E5A33', steel2: '#5C4A27', soft: '#EFE8DC', kzbg: '#FFFFFF', kzline: '#B39A6A', kzink: '#1E1A15', kzcode: '#6E5A33'}
  };
  const SA = 'html[data-tema53a="%"][data-tema53a] body[data-prem39][data-prem39]', SO = 'html[data-tema53o="%"][data-tema53o] body[data-ogrt37][data-ogrt37][data-ogrt37]';
  let css = Object.entries(PAL).map(([k, p]) => `${SA.replace('%', k)}{--p-bg:${p.bg};--p-card:${p.card};--p-card2:${p.card2};--p-sheet:${p.sheet};--p-line:${p.line};--p-gold:${p.gold};--p-gold2:${p.gold2};--p-gold-t:${p.goldt};--p-ink:${p.ink};--p-ink2:${p.ink2};--p-mut:${p.mut};--p-on-gold:${p.on}}`).join('\n');
  css += `\n${SA.replace('%', 'pearl')}{--p-gold:#8C7A57;--p-gold2:#6E5A33;--p-gold-t:#6E5A33;--p-on-gold:#FFFFFF}\n`;
  css += Object.entries(OGR).map(([k, p]) => `${SO.replace('%', k)}{--t37-bg:${p.bg};--t37-card:${p.card};--t37-card2:${p.card2};--t37-line:${p.line};--t37-line2:${p.line2};--t37-ink:${p.ink};--t37-mut:${p.mut};--t37-act:${p.act};--t37-on:${p.on};--t37-steel:${p.steel};--t37-steel2:${p.steel2};--t37-soft:${p.soft};--t37-kz-bg:${p.kzbg};--t37-kz-line:${p.kzline};--t37-kz-ink:${p.kzink};--t37-kz-code:${p.kzcode}}`).join('\n');
  css += `
html[data-tema53a],html[data-tema53o]{transition:none}
body[data-prem39],body[data-ogrt37]{transition:background-color .35s ease,color .35s ease}
.tm53{display:grid;gap:10px}
.tm53-k{display:flex;align-items:center;gap:14px;min-height:64px;padding:10px 14px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.tm53-k.on{border-color:var(--pri);box-shadow:0 0 0 2px var(--pri) inset}
.tm53-k b{display:block}.tm53-k small{display:block;color:var(--mut)}
.tm53-o{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(127,127,127,.35);flex:none}
.tm53-o i{width:18px;height:18px;border-radius:50%}
.ed53-al{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin:16px 0;padding:16px;border-radius:16px;border:1px solid var(--line);background:var(--surface)}
.ed53-al b{display:block}.ed53-al small{display:block;color:var(--mut);max-width:52ch}
.ed53-alb{min-height:46px;padding:8px 18px;border-radius:12px;border:0;background:#C9A25E;color:#1A1206;font:inherit;font-weight:700;cursor:pointer}
#on53{position:fixed;left:10px;top:calc(env(safe-area-inset-top) + 68px);z-index:75}
#on53 .on53-e{min-height:40px;padding:6px 14px;border-radius:999px;border:1px solid var(--p-gold,#E2B765);background:rgba(10,8,6,.9);color:var(--p-gold,#E2B765);font:inherit;font-size:.86rem;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35)}
.on53-m{display:grid;gap:10px}.on53-m button{min-height:50px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:600;cursor:pointer}
.on53-m .on53-x{border-color:#D9574B;color:#D9574B}
body:has(.v-ov) #on53{display:none}
.og53-tm{min-height:40px;padding:6px 12px;border-radius:999px;border:1px solid var(--t37-line2,var(--line));background:var(--t37-card2,var(--surface));color:var(--t37-ink,var(--ink));font:inherit;font-weight:600;cursor:pointer}
`;
  try { const st = document.createElement('style'); st.id = 'v53-altin-css'; st.textContent = css; document.head.appendChild(st); } catch (x) {}
  TM.uygula();

  /* ---------- 3. Gelişmiş Çalışma Merkezi (Altın) ---------- */
  const CM = V53.Calis = {};
  const yuzde = (d, y) => (d + y ? Math.round(100 * d / (d + y)) : null);
  CM.sinif = () => { try { return (V53.Hesap && V53.Hesap.sinif()) || +(V39.ilr().sonSinif || 0) || 0; } catch (x) { return 0; } };
  CM.veri = function () {
    const ov = (typeof Store !== 'undefined' && Store.ov) || {}, prog = ov.prog || {}, s = CM.sinif();
    const sinifta = (id) => !s || new RegExp('^DKAB-' + s + '-').test(id);
    // kazanım → konu (öğrenciye kazanım kodu gösterilmez; konu adı gösterilir)
    const konuOf = {}; try { Store.all('topics').forEach((t) => (t.outcomeIds || []).forEach((o) => { if (!konuOf[o]) konuOf[o] = t; })); } catch (x) {}
    const konular = {}, uniteler = {};
    Object.entries(prog).forEach(([oid, p]) => {
      if (!p || !sinifta(oid)) return; const d = +p.correct || 0, y = +p.wrong || 0; if (!(d + y)) return;
      const t = konuOf[oid]; if (t) { const k = konular[t.id] || (konular[t.id] = {t, d: 0, y: 0}); k.d += d; k.y += y; }
      const u = (oid.match(/^(DKAB-\d+-U\d+)/) || [])[1]; if (u) { const x = uniteler[u] || (uniteler[u] = {id: u, d: 0, y: 0}); x.d += d; x.y += y; }
    });
    const zayif = Object.values(konular).filter((k) => k.y > 0).map((k) => Object.assign(k, {o: yuzde(k.d, k.y)})).sort((a, b) => a.o - b.o || b.y - a.y);
    const unite = Object.values(uniteler).map((u) => Object.assign(u, {o: yuzde(u.d, u.y), ad: ((Store.get('units', u.id) || {}).title || u.id)})).sort((a, b) => a.id.localeCompare(b.id, 'tr', {numeric: true}));
    const yanlis = Object.keys(ov.wrong || {}).filter((q) => { const x = Store.get('questions', q); return x && (!s || +x.grade === s); });
    const simdi = Date.now(); let tekrar = 0, kart = 0;
    Object.entries(ov.cards || {}).forEach(([id, c]) => { const f = Store.get('flashcards', id); if (!f || (s && +f.grade !== s)) return; kart++; const due = c && (c.due || c.next); if ((due && new Date(due).getTime() <= simdi) || (!due && (+c.box || 0) < 3)) tekrar++; });
    let cal = {gun: {}, hedef: 20}; try { cal = V45.Calis.oku(); } catch (x) {}
    const gunler = []; for (let i = 6; i >= 0; i--) { const d = new Date(simdi - i * 864e5); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); gunler.push({k, n: (cal.gun || {})[k] || 0, ad: d.toLocaleDateString('tr-TR', {weekday: 'short'})}); }
    return {s, zayif, unite, yanlis, tekrar, kart, cal, gunler, hafta: gunler.reduce((a, g) => a + g.n, 0)};
  };
  CM.ciz = function () {
    const V = CM.veri(), bos = (m) => `<p class="ac53-bos">${m}</p>`;
    const bugun = V.gunler[6].n, hedef = V.cal.hedef || 20, hHedef = hedef * 7, maks = Math.max(hedef, ...V.gunler.map((g) => g.n), 1);
    const plan = [];
    if (V.zayif[0]) plan.push(`<b>${e(V.zayif[0].t.title)}</b> konusunu tekrar et (başarı %${V.zayif[0].o}).`);
    if (V.yanlis.length) plan.push(`<b>${V.yanlis.length} yanlış soruyu</b> yeniden çöz.`);
    if (V.tekrar) plan.push(`<b>${V.tekrar} bilgi kartını</b> tekrar et.`);
    if (bugun < hedef) plan.push(`Günlük hedef için <b>${hedef - bugun} cevap</b> daha ver.`);
    return `<section class="ac53"><header class="ac53-b"><small>Altın · Gelişmiş Çalışma Merkezi</small><h1>Sana özel çalışma</h1><p>${V.s ? V.s + '. sınıf · ' : ''}Bütün değerler bu cihazdaki gerçek cevaplarından hesaplanır.</p></header>
<div class="ac53-g">
<article class="ac53-k ac53-plan"><h2>Bugünkü planın</h2>${plan.length ? `<ol>${plan.map((p) => `<li>${p}</li>`).join('')}</ol>` : bos('Henüz plan çıkaracak kadar veri yok. Soru çözdükçe ve kart çalıştıkça planın oluşur.')}</article>
<article class="ac53-k"><h2>Hedefler</h2><div class="ac53-h"><span><b>${bugun}/${hedef}</b><small>Bugün</small></span><span><b>${V.hafta}/${hHedef}</b><small>Bu hafta</small></span></div>
<div class="ac53-gr" role="img" aria-label="Son 7 günde verilen cevaplar">${V.gunler.map((g) => `<span><i style="height:${Math.round(100 * g.n / maks)}%"></i><small>${e(g.ad)}</small><em>${g.n}</em></span>`).join('')}</div></article>
<article class="ac53-k"><h2>Eksik olduğun konular</h2>${V.zayif.length ? `<ul class="ac53-l">${V.zayif.slice(0, 6).map((k) => `<li><button type="button" onclick="V44.icerikAc ? V44.icerikAc('${e(k.t.id)}','anlat') : go('topic',{t:'${e(k.t.id)}'})"><span>${e(k.t.title)}</span><b>%${k.o}</b></button><span class="ac53-bar"><i style="width:${k.o}%"></i></span></li>`).join('')}</ul>` : bos('Henüz yanlış cevap yok; eksik konu bulunamadı.')}</article>
<article class="ac53-k"><h2>Yanlış yaptığın sorular</h2>${V.yanlis.length ? `<p><b>${V.yanlis.length}</b> soru tekrar bekliyor.</p><button type="button" class="ac53-d" onclick="go('yanlis')">Yanlışlarımı çöz</button>` : bos('Yanlış soru kaydı yok.')}</article>
<article class="ac53-k"><h2>Tekrar zamanı gelenler</h2>${V.kart ? `<p><b>${V.tekrar}</b> kart tekrar bekliyor (çalıştığın ${V.kart} karttan).</p><button type="button" class="ac53-d" onclick="go('pek')">Kartlara git</button>` : bos('Henüz bilgi kartı çalışmadın.')}</article>
<article class="ac53-k ac53-gen"><h2>Ünite başarısı</h2>${V.unite.length ? `<ul class="ac53-l">${V.unite.map((u) => `<li><span>${e(u.ad)}</span><b>%${u.o}</b><span class="ac53-bar"><i style="width:${u.o}%"></i></span><small>${u.d} doğru · ${u.y} yanlış</small></li>`).join('')}</ul>` : bos('Henüz ünite başarısı hesaplanacak cevap yok.')}</article>
</div></section>`;
  };
  try {
    const st = document.createElement('style'); st.id = 'v53-calis-css';
    st.textContent = `.ac53{padding-bottom:24px}.ac53-b small{color:var(--p-gold,var(--pri));font-weight:700;letter-spacing:.04em}.ac53-b h1{margin:4px 0}.ac53-b p{color:var(--mut)}
.ac53-g{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))}
.ac53-k{padding:16px;border-radius:18px;border:1px solid var(--line);background:var(--surface)}.ac53-k h2{font-size:1.05rem;margin:0 0 10px}
.ac53-bos{color:var(--mut);margin:0}.ac53-plan ol{margin:0;padding-left:1.2em;display:grid;gap:6px}
.ac53-h{display:flex;gap:18px;margin-bottom:10px}.ac53-h b{display:block;font-size:1.3rem}.ac53-h small{color:var(--mut)}
.ac53-gr{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;height:110px;align-items:end}.ac53-gr span{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:2px}
.ac53-gr i{display:block;width:70%;min-height:3px;border-radius:6px 6px 2px 2px;background:var(--p-gold,var(--pri))}.ac53-gr small,.ac53-gr em{font-size:.72rem;color:var(--mut);font-style:normal}
.ac53-l{list-style:none;margin:0;padding:0;display:grid;gap:10px}.ac53-l li{display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center}
.ac53-l button{grid-column:1/-1;display:flex;justify-content:space-between;gap:10px;background:none;border:0;padding:0;color:var(--ink);font:inherit;text-align:left;cursor:pointer;min-height:32px}
.ac53-bar{grid-column:1/-1;height:8px;border-radius:99px;background:var(--line);overflow:hidden}.ac53-bar i{display:block;height:100%;background:var(--p-gold,var(--pri))}
.ac53-l small{grid-column:1/-1;color:var(--mut)}.ac53-d{min-height:44px;padding:8px 16px;border-radius:12px;border:0;background:var(--p-gold,var(--pri));color:var(--p-on-gold,#fff);font:inherit;font-weight:700;cursor:pointer}`;
    document.head.appendChild(st);
  } catch (x) {}
  V30.routes.acalis53 = function () {
    if (!A.acikMi()) { A.yakinda && A.yakinda('acalis53'); return V30.routes.calis45 ? V30.routes.calis45.apply(this, arguments) : ''; }
    $.innerHTML = CM.ciz();
  };

  /* ---------- 4. çizim sonrası: şerit, öğretmen tema düğmesi, Altın Çalışma Merkezi bağlantısı ---------- */
  const dr0 = draw;
  window.draw = draw = function () {
    const r = dr0.apply(this, arguments);
    try {
      isaret(); O.serit();
      if (view === 'ogretmen') { const top = document.querySelector('.og-top'); if (top && !top.querySelector('.og53-tm')) top.insertAdjacentHTML('beforeend', '<button type="button" class="og53-tm" onclick="V53.Tema.ac(\'ogretmen\')">Tema</button>'); }
      if (view === 'calis45' && typeof V39 !== 'undefined' && V39.on && !$.querySelector('.ac53-git')) $.insertAdjacentHTML('afterbegin', '<button type="button" class="ac53-d ac53-git" onclick="go(\'acalis53\')">Gelişmiş Çalışma Merkezi</button>');
    } catch (x) {}
    return r;
  };
  isaret();
})();
