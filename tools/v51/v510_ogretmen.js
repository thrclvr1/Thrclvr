/* ===================== V51.0: öğretmen paneli sadeleştirme =====================
   - Sekmeler: Haftalık (çekirdek) · Sınıflarım · Araçlar. Araçlar'da yalnız “Sorun Bildir” var.
     Eski Araçlar bölümleri (Kazanımlar, Hızlı Arama, Son İşlemler, Ayarlar…) menüden kalktı; kodları ve kayıtları duruyor
     (OGRT.SUB51_ESKI). Veri Yönetimi (yedekle / geri yükle) editör alanına taşındı.
   - Ana Panel: öğretmen panelinin başındaki bölüm. Editör onayı yalnız buradan açılır ve yalnız editör yetkisiyle
     (V38.edOk(): ayrı 6 haneli editör PIN'i ile açılan oturum) kullanılabilir. Normal öğretmen onay veremez.
   - Haftalık: tekrarlanan kart/düğmeler kaldırıldı (“Bu haftaya kazanım ekle / Kişisel notlar / Yıllık plana göre yeniden
     kur” hızlı kartları zaten aşağıda bulunan işlemlerin kopyasıydı); kazanım kartındaki durum menüsü (Başlanmadı /
     Planlandı / İşlendi / Tekrar edilmeli) kaldırıldı. Durum kayıtları (dk-ogretmen-v1.status) ve onlara bağlı işlevler korunur.
   - Sorun Bildir: bölüm, sınıf/konu, açıklama, isteğe bağlı ek not. V48 bildirim sistemine “genel” türüyle yazılır:
     hesap sunucusu bağlıysa editöre gönderilir, değilse bu cihazda kaydedilir; öğretmen durumu listede görür. */
(function () {
  if (typeof OGRT === 'undefined' || !OGRT.W) return;
  const V51 = window.V51 = window.V51 || {};
  const O = V51.Ogretmen = {};
  V51.sade = true;
  const W = OGRT.W, IK = (k, s) => (window.V38 && V38.svg ? V38.svg(k, s || 18) : '');

  /* ---------- 1. sekmeler ---------- */
  OGRT.TABS = [['hafta', 'Haftalık'], ['sinif', 'Sınıflarım'], ['diger', 'Araçlar']];
  OGRT.SUB51_ESKI = OGRT.SUB;
  OGRT.SUB = [['sorun', 'Sorun Bildir']];
  try { V38.SUBI.sorun = 'info'; V38.SUBD.sorun = 'Uygulamadaki bir sorunu editöre bildir'; } catch (e) {}
  const ANA = ['hafta', 'sinif', 'diger'];
  const S0 = OGRT.S;
  OGRT.S = function () { const s = S0.apply(this, arguments); if (!OGRT.isSub(s.sub)) s.sub = 'sorun'; if (!ANA.includes(s.tab) && !OGRT.isSub(s.tab)) s.tab = 'hafta'; return s; };

  /* ---------- 2. Ana Panel (editör onayı burada) ---------- */
  O.edSayi = function () { try { if (!V38.isReady) return null; const n = V38.ED.counts(); return {karar: n.bekleyen + n.kaynak + n.eslesme + n.duzeltme, yayinsiz: n.onay - n.yayinda}; } catch (e) { return null; } };
  O.anaPanel = function () {
    const ed = (() => { try { return V38.edOk(); } catch (e) { return false; } })(), n = ed ? O.edSayi() : null;
    return `<section class="ap51" aria-labelledby="ap51h"><h2 id="ap51h">Ana Panel</h2>
<div class="ap51-k ${ed ? 'acik' : ''}"><span class="ap51-i" aria-hidden="true">${IK('shield', 22)}</span><div class="ap51-t"><b>Editör onayı</b>
<small>${ed ? (n ? `${n.karar} içerik karar bekliyor · ${n.yayinsiz} onaylı içerik yayımlanmadı` : 'Editör oturumu açık') : 'İçerik onayı, yayımlama, yıllık plan yükleme ve veri yönetimi yalnız editör yetkisiyle yapılır.'}</small></div>
${ed ? `<div class="ap51-bb"><button type="button" class="p" onclick="go('editor')">Onay alanını aç</button><button type="button" onclick="V38.edGo({k:'yp51',cid:'',mode:''})">Yıllık planlar</button><button type="button" onclick="V38.edGo({k:'veri51',cid:'',mode:''})">Veri yönetimi</button></div>`
      : `<div class="ap51-bb"><button type="button" onclick="go('editor')">${IK('lock', 16)} Editör girişi</button></div>`}</div>
<p class="ap51-not small">${ed ? 'Editör oturumu bu sekmede açık. İşin bitince editör alanından oturumu kapat.' : 'Editör girişi ayrı 6 haneli editör PIN’i ister; öğretmen oturumu bu alanı açmaz.'}</p></section>`;
  };
  const R0 = OGRT.render;
  OGRT.render = function () {
    if (typeof view !== 'undefined' && view === 'editor') { try { return V38.edView(); } catch (e) {} }   // editör alanındaki veri yönetimi işlemleri sonrası
    const r = R0.apply(this, arguments);
    try {
      const top = document.querySelector('.og-top');
      if (top) {
        const p = top.querySelector('.mut.small'); if (p) p.textContent = 'Kayıtların bu cihazda tutulur. Müfredat ve içerik burada değiştirilemez.';
        if (!top.querySelector('.ap51')) top.insertAdjacentHTML('beforeend', O.anaPanel());
      }
      const sub = document.querySelector('.og-sub'); if (sub && OGRT.SUB.length < 2) sub.remove();
      // V50 hatası: sekme değişiminde (draw olmadan) üst bölüm yeniden çizilince Mod düğmesi kayboluyordu
      if (window.V50 && V50.Mod && V50.Mod.dugmeler) V50.Mod.dugmeler();
    } catch (e) { console.warn('[V51] öğretmen paneli', e); }
    return r;
  };

  /* ---------- 3. Haftalık: yıllık plan bilgisi + uyum bildirimi ---------- */
  W.planNote = function (c, sy) {
    const a = W.ar(c.g, c.py, sy), p = W.src(c.g, c.py, sy), has = W.hasPlan(c.g, c.py, sy);
    const kim = p && p.kaynak === 'editor' ? 'editörün yüklediği' : '';
    if (a && a.basis === 'yillik-plan') return `<p class="ogw-auto"><b>Yıllık plana göre${a.edited ? ' · senin düzenlemelerinle' : ''}.</b> Haftalar ${esc(sy)} ${kim ? kim + ' ' : ''}yıllık planından otomatik dağıtıldı.</p>`;
    if (!p) return has ? '' : `<p class="ogw-auto">Bu sınıf ve program için ${esc(sy)} yıllık planı yok; haftalık dağılım yapılmadı. Kazanımları kendin ekleyebilirsin.</p>`;
    return `<p class="ogw-auto">${a ? 'Bu plan önceki sürümde hesaplanmış ve sen düzenlemişsin' : 'Bu sınıfın haftalık planını sen oluşturdun'}; yıllık plana göre güncellenmedi. <button class="ogw-lnk" onclick="OGRT.W.regenSheet()">Yıllık plana göre oluştur</button></p>`;
  };
  const V0 = W.view;
  W.view = function () {
    const h = V0.apply(this, arguments);
    try { const c = OGRT.cls(), s = W.S(); if (c && V51.YP && V51.YP.bildirimHTML) { const b = V51.YP.bildirimHTML(c, s.sy); if (b) return h.replace('<div class="ogw-nav">', b + '<div class="ogw-nav">'); } } catch (e) { console.warn('[V51] yıllık plan bildirimi', e); }
    return h;
  };

  /* ---------- 4. Sınıflarım: durum menüsü olmadan sade özet (haftalık plan ve takvimden) ---------- */
  O.sinifOzet = function (x) {
    const sy = W.syNow(); try { W.ensure(x, sy); } catch (e) {}
    const L = W.weeks(sy), T = OGRT.today(), ck = OGRT.ck(x.g, x.py), Y = (W.d.weeks[ck] || {})[sy] || {};
    const top = OGRT.allOuts(x.g, x.py).length, yer = new Set(Object.values(Y).flat());
    const gecen = L ? new Set(L.filter((w) => w.fri < T).flatMap((w) => Y[w.n] || [])) : new Set();
    const cw = L && L.find((w) => w.mon <= T && T <= w.sun), bu = cw ? (Y[cw.n] || []) : [];
    const kod = (id) => { const o = Store.get('outcomes', id); return o ? W.short(o.code) : ''; };
    const p = W.src(x.g, x.py, sy), pc = top ? Math.round(100 * gecen.size / top) : 0;
    const st = OGRT.prog(x.g, x.py), eskiDurum = st.c.isl + st.c.plan + st.c.tek;
    return `<div class="s51-oz"><p class="small"><b>Bu hafta:</b> ${cw ? (cw.hol ? 'tatil haftası' : (bu.length ? esc(bu.map(kod).join(', ')) : 'kazanım atanmamış')) : 'ders yılı dışında'}</p>
<div class="og-bar s51-bar" role="img" aria-label="Takvime göre geçilen kazanım yüzde ${pc}"><i style="width:${pc}%"></i></div>
<p class="small">Takvime göre geçilen: ${gecen.size}/${top} kazanım · haftalara yerleşen: ${yer.size}/${top}</p>
<p class="small mut">${p ? `Haftalar ${esc(sy)} yıllık planından${p.kaynak === 'editor' ? ' (editör yüklemesi)' : ''}.` : `${esc(sy)} için yıllık plan yok; dağılım üretilmedi.`}${eskiDurum ? ` Önceki sürümlerde işaretlediğin durumlar saklanıyor (${st.c.isl} işlendi, ${st.c.plan} planlandı, ${st.c.tek} tekrar).` : ''}</p></div>`;
  };
  OGRT.vSinif = function () {
    const G0 = OGRT.grades(), c = OGRT.cls();
    const gsel = `<label>Sınıf<select id="og-g" onchange="OGRT.pyOpts()">${G0.map((g) => `<option value="${g}">${g}. sınıf</option>`).join('')}</select></label><label>Program<select id="og-py"></select></label>`;
    return `<section class="og-sec"><h2>Sınıflarım</h2>${OGRT.d.classes.length ? `<ul class="og-cl">${OGRT.d.classes.map((x) => { const k = OGRT.ck(x.g, x.py), st = KMAP.pstatus(x.g, x.py), on = c && OGRT.ck(c.g, c.py) === k; return `<li class="${on ? 'on' : ''}"><div class="og-cl-h"><b>${x.g}. sınıf</b> <span class="kmps py-${x.py}">${esc(OGRT.pyName(x.py))}</span> ${OGRT.badge(st)}</div>${O.sinifOzet(x)}<div class="og-acts"><button class="p" onclick="OGRT.pick('${k}','hafta')">Haftalık görünüm</button><button onclick="OGRT.rmClass('${k}')" aria-label="${x.g}. sınıfı panelimden kaldır">Panelimden kaldır</button></div></li>`; }).join('')}</ul>` : '<p class="og-empty">Henüz sınıf eklemedin. Aşağıdan sınıfını ve programını seç.</p>'}
<form class="og-add" onsubmit="event.preventDefault();OGRT.addClass()"><h3>Sınıf ekle</h3><div class="og-fr">${gsel}<button class="p" type="submit">Ekle</button></div><p class="mut small" id="og-pyinfo"></p></form></section>`;
  };

  /* ---------- 5. Araçlar › Sorun Bildir ---------- */
  O.BOLUM = ['Haftalık plan', 'Yıllık plan dağılımı', 'Sınıflarım', 'Konu içeriği', 'Sorular ve testler', 'Bilgi kartları', 'Oyunlar', 'Görünüm ve gezinme', 'Diğer'];
  try { if (window.V48 && V48.Bildir) { V48.Bildir.KAT.genel = O.BOLUM.slice(); } } catch (e) {}
  O.f = {bolum: '', sinif: '', konu: '', ack: '', not: ''};
  O.konular = (g) => (g ? Store.all('topics').filter((t) => t.grade === +g && t.level !== 'alt' && vis(t)).sort((a, b) => String(a.programYear).localeCompare(String(b.programYear)) || String(a.unitId).localeCompare(String(b.unitId)) || (a.order || 0) - (b.order || 0)) : []);
  O.liste = () => { try { return V48.Bildir.oku().liste.filter((k) => k.tur === 'genel'); } catch (e) { return []; } };
  const DUR = {taslak: 'Bu cihazda kayıtlı', gonderildi: 'Editöre gönderildi'};
  O.sorunHTML = function () {
    const f = O.f, sunucu = (() => { try { return V48.Bildir.sunucuVar(); } catch (e) { return false; } })(), L = O.liste();
    const sinifSec = [...new Set(OGRT.d.classes.map((c) => c.g).concat(OGRT.grades()))].sort((a, b) => a - b);
    return `<section class="og-sec sb51" aria-labelledby="sb51h"><h2 id="sb51h">Sorun Bildir</h2>
<p class="small">Uygulamada fark ettiğin bir hatayı ya da sorunu editöre bildir. Bildirim içerik kayıtlarını değiştirmez; editör inceler.</p>
<form class="og-form sb51-f" onsubmit="return V51.Ogretmen.gonder(event)" novalidate>
<label>Hatanın bulunduğu bölüm <small>(zorunlu)</small><select name="bolum" required onchange="V51.Ogretmen.f.bolum=this.value"><option value="">Seç…</option>${O.BOLUM.map((b) => `<option ${f.bolum === b ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select></label>
<div class="og-fr"><label>İlgili sınıf <small>(isteğe bağlı)</small><select name="sinif" onchange="V51.Ogretmen.f.sinif=this.value;V51.Ogretmen.f.konu='';V51.Ogretmen.yenile()"><option value="">—</option>${sinifSec.map((g) => `<option value="${g}" ${String(f.sinif) === String(g) ? 'selected' : ''}>${g}. sınıf</option>`).join('')}</select></label>
<label>İlgili konu <small>(isteğe bağlı)</small><select name="konu" ${f.sinif ? '' : 'disabled'} onchange="V51.Ogretmen.f.konu=this.value"><option value="">—</option>${O.konular(f.sinif).map((t) => `<option value="${t.id}" ${f.konu === t.id ? 'selected' : ''}>${esc(t.title)} · ${t.programYear === '2018' ? '2018' : '2026'}</option>`).join('')}</select></label></div>
<label>Açıklama <small>(zorunlu)</small><textarea name="ack" rows="4" maxlength="800" required placeholder="Ne oldu, nerede gördün, ne olması gerekiyordu?" oninput="V51.Ogretmen.f.ack=this.value">${esc(f.ack)}</textarea></label>
<label>Ek not <small>(isteğe bağlı)</small><textarea name="not" rows="2" maxlength="300" oninput="V51.Ogretmen.f.not=this.value">${esc(f.not)}</textarea></label>
<p class="bad small sb51-h" role="alert"></p>
<div class="og-acts"><button class="p" type="submit">Sorunu bildir</button></div>
<p class="small mut">${sunucu ? 'Hesap sunucusu bağlı: bildirim editöre gönderilir.' : 'Hesap sunucusu bağlı değil: bildirim bu cihazda kaydedilir; sunucu bağlanınca kendiliğinden gönderilir. Gönderilmeden “gönderildi” denmez.'}</p></form>
<h3 class="sb51-lh">Bildirimlerim <span>${L.length}</span></h3>${L.length ? `<ul class="sb51-l">${L.slice(0, 30).map((k) => `<li><div><b>${esc(k.kategori)}</b>${k.baglam && k.baglam.sinif ? ` · ${k.baglam.sinif}. sınıf` : ''}${k.baglam && k.baglam.konu ? ` · ${esc(k.baglam.konu)}` : ''}</div><p>${esc(String(k.aciklama || '').split('\n\nEk not:')[0])}</p><small><span class="d43 ${k.durum === 'gonderildi' ? 'ok' : 'bek'}">${DUR[k.durum] || esc(k.durum)}</span>${k.sunucuDurum && V48.Bildir.DURUM[k.sunucuDurum] ? ` <span class="d43 ${k.sunucuDurum === 'duzeltildi' ? 'ok' : k.sunucuDurum === 'gecersiz' ? 'kt' : 'uy'}">Editör: ${esc(V48.Bildir.DURUM[k.sunucuDurum])}</span>` : ''} · ${esc(new Date(k.tarih).toLocaleString('tr-TR'))} · kayıt no ${esc(String(k.id).slice(0, 8))}</small></li>`).join('')}</ul>` : '<p class="small mut">Henüz sorun bildirmedin.</p>'}</section>`;
  };
  O.yenile = () => { const b = document.getElementById('og-body'); if (b && OGRT.S().tab === 'sorun') b.innerHTML = O.sorunHTML(); };
  O.gonder = function (ev) {
    ev.preventDefault();
    const f = O.f, h = document.querySelector('.sb51-h'), hata = (t) => { if (h) h.textContent = t; return false; };
    f.ack = String(f.ack || '').trim(); f.not = String(f.not || '').trim();
    if (!f.bolum || !O.BOLUM.includes(f.bolum)) return hata('Hatanın bulunduğu bölümü seç.');
    if (f.ack.length < 5) return hata('Kısa bir açıklama yaz (en az 5 karakter).');
    const B = V48.Bildir, t = f.konu ? Store.get('topics', f.konu) : null;
    const b = t ? B.baglam(t.id, '', '') : {sinif: f.sinif ? +f.sinif : null, programYili: '', uniteId: '', unite: '', konuId: '', konu: '', kazanim: [], soruId: '', bolum: '', bolumAd: ''};
    b.bolumAd = f.bolum.slice(0, 40); if (!b.sinif && f.sinif) b.sinif = +f.sinif;
    const id = (() => { try { return crypto.randomUUID(); } catch (e) { return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); } })();
    const k = {id, tur: 'genel', kategori: f.bolum, aciklama: (f.ack + (f.not ? '\n\nEk not: ' + f.not : '')).slice(0, 1000), anonim: false, kaynak: 'ogretmen', baglam: b, tarih: new Date().toISOString(), surum: (() => { try { return V31.VER; } catch (e) { return ''; } })(), durum: 'taslak', gonderim: null};
    const o = B.oku(); o.liste.unshift(k); o.liste = o.liste.slice(0, 300); B.yaz(o);
    O.f = {bolum: '', sinif: '', konu: '', ack: '', not: ''}; O.son = id;
    const bitti = (gitti) => { O.yenile(); const l = document.querySelector('.sb51-l li'); if (l) l.classList.add('yeni'); UI.toast(gitti ? 'Teşekkürler. Bildirimin editöre gönderildi.' : 'Teşekkürler. Bildirimin bu cihazda kaydedildi (kayıt no ' + id.slice(0, 8) + ').'); try { V38.logT && V38.logT('Sorun bildirildi', k.kategori); } catch (e) {} };
    if (B.sunucuVar()) B.tekGonder(id).then(bitti, () => bitti(false)); else bitti(false);
    return false;
  };
  OGRT.EXT.sorun = O.sorunHTML;

  /* ---------- 6. Profilim › “Öğretmen ve editör”: editör girişi artık yalnız öğretmen panelinin Ana Panel'inde ---------- */
  if (typeof V44 !== 'undefined') {
    V44.giris = function () {
      UI.sheet({title: 'Öğretmen modu', body: () => `<div class="g44"><p class="small">Öğrenciler için giriş gerekmez.</p>
<button type="button" class="g44-b" onclick="UI.close();V36.ss(V36.SK,'1');go('ogretmen')"><b>Öğretmen paneli</b><small>Haftalık plan, sınıflarım, sorun bildir</small></button>
<p class="small mut">Editör onayı öğretmen panelinin Ana Panel bölümünden, ayrı editör PIN’iyle açılır. Bu cihazdaki ayrım basit bir erişim ayrımıdır, gerçek güvenlik değildir.</p></div>`});
    };
  }

  /* ---------- 7. editör alanı: Yıllık planlar ve Veri yönetimi (yalnız editör oturumunda) ---------- */
  if (window.V38 && V38.edListHTML) {
    const L0 = V38.edListHTML;
    O.veriHTML = () => `${V38.edHead('Veri yönetimi', 'Öğretmen kayıtlarının yedeği ve geri yüklenmesi (bu cihaz)', "V38.edGo({k:'',cid:'',mode:''})")}<div class="ed38-info">${(OGRT.EXT.yedek || OGRT.vYedek)()}</div>`;
    V38.edListHTML = function () {
      const s = V38.ES();
      if (s.k === 'yp51') return V51.YP && V51.YP.html ? V51.YP.html() : '';
      if (s.k === 'veri51') return O.veriHTML();
      if (s.k === 'yayin51' && V51.Yayin && V51.Yayin.html) return V51.Yayin.html();
      return L0.apply(this, arguments);
    };
    const H0 = V38.edHomeHTML;
    V38.edHomeHTML = function () {
      const h = H0.apply(this, arguments);
      return h + `<section class="ed38-info ed51-ara"><h2>Editör araçları</h2><div class="ed38-cats">
<button class="ed38-cat" onclick="V38.edGo({k:'yp51',cid:'',mode:''})"><span class="ic">${IK('cal', 22)}</span><span class="tx"><b>Yıllık planlar</b><small>Excel yıllık planı yükle; haftalık dağılım sınıf ve programa göre oluşur</small></span></button>
<button class="ed38-cat" onclick="V38.edGo({k:'yayin51',cid:'',mode:''})"><span class="ic">${IK('check', 22)}</span><span class="tx"><b>Yayın durumu</b><small>Taslak · İnceleme · Onaylandı · Reddedildi · Yayında · Yayından kaldırıldı</small></span></button>
<button class="ed38-cat" onclick="V38.edGo({k:'veri51',cid:'',mode:''})"><span class="ic">${IK('db', 22)}</span><span class="tx"><b>Veri yönetimi</b><small>Öğretmen kayıtlarını yedekle ve geri yükle</small></span></button>
<button class="ed38-cat" onclick="go('bildirim48')"><span class="ic">${IK('info', 22)}</span><span class="tx"><b>Hata ve geri bildirim</b><small>Öğrenci ve öğretmen bildirimleri</small></span></button>
</div></section>`;
    };
  }
})();
