/* ===================== V48.0: Hata ve Geri Bildirim sistemi =====================
   Öğrenci ve öğretmen içerik ya da soru hatası bildirir; editör “Hata ve Geri Bildirim Merkezi”nde yönetir.
   - İçerik: konu ekranında her bölümün sonunda “Bu içerikte bir hata mı fark ettin?”
   - Soru  : mini test, test, yanlışlarım ve oyun sorularında “Soruyu bildir” (soru kimliği otomatik)
   - Otomatik alanlar: sınıf, müfredat yılı, ünite, konu, kazanım, soru kimliği, içerik bölümü, bildirim türü, tarih,
     uygulama sürümü, açıklama; kaynak (öğrenci/öğretmen); isteğe bağlı anonim.
   - Gönderim: hesap sunucusu kurulu ve Google ile giriş yapılmışsa POST /api/bildirim (benzersiz kimlik, idempotent).
     Değilse bildirim bu cihazda TASLAK olarak kalır (dk-bildirim48); bağlantı olunca kendiliğinden gönderilir; JSON olarak
     dışa aktarılabilir. Sunucu yokken “gönderildi” denmez.
   - Öğrenci içerik değiştiremez: bu modül hiçbir içerik kaydına yazmaz. Editör işlemleri editör oturumu ister
     (yerelde V38.edOk(); sunucuda e-postası EDITOR_EPOSTALARI'nda olan hesap). */
(function () {
  const V48 = window.V48 = window.V48 || {};
  const B = V48.Bildir = {};
  const KEY = 'dk-bildirim48', EKEY = 'dk-bildirim48-ed';
  B.KAT = {
    icerik: ['Yanlış bilgi', 'Eksik bilgi', 'Ayet veya hadis referansı hatalı', 'Kaynak hatası', 'Açıklama yetersiz', 'Yazım hatası', 'Diğer'],
    soru: ['Doğru cevap hatalı', 'Soru kökü hatalı', 'Birden fazla doğru cevap', 'Şıklar hatalı', 'Açıklama hatalı', 'Kaynak veya kazanım eşleşmesi yanlış', 'Diğer']
  };
  B.DURUM = {yeni: 'Yeni', inceleniyor: 'İnceleniyor', duzeltildi: 'Düzeltildi', gecersiz: 'Geçersiz / Reddedildi'};
  const js = (k, d) => { try { const o = JSON.parse(localStorage.getItem(k) || 'null'); return o && o.v === 1 ? o : d; } catch (e) { return d; } };
  B.oku = () => { const o = js(KEY, null) || {v: 1, liste: []}; o.liste = Array.isArray(o.liste) ? o.liste : []; return o; };
  B.yaz = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { UI.toast('Bildirim bu cihaza kaydedilemedi (depolama dolu olabilir).'); } };
  const uuid = () => { try { return crypto.randomUUID(); } catch (e) { return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); } };
  const surum = () => { try { return V31.VER; } catch (e) { return ''; } };
  const rol = () => { try { if (V36.ok()) return 'ogretmen'; } catch (e) {} return 'ogrenci'; };
  const ROL = {ogrenci: 'Öğrenci', ogretmen: 'Öğretmen'};
  const arr = (x) => (Array.isArray(x) ? x : []);

  /* ---------- bağlam (otomatik alanlar) ---------- */
  const SEKME = () => Object.assign({}, (typeof V39 !== 'undefined' && V39.AL) || {}, {anlat: 'Anlatım'});
  B.baglam = function (konuId, soruId, bolum) {
    const q = soruId ? Store.get('questions', soruId) : null, t = Store.get('topics', konuId || (q && q.topicId)) || null;
    const u = t ? Store.get('units', t.unitId) : null;
    const kz = arr((q && q.outcomeIds && q.outcomeIds.length) ? q.outcomeIds : t && t.outcomeIds).map((id) => { const o = Store.get('outcomes', id); return o ? (o.code || id) : id; });
    return {
      sinif: t ? +t.grade || t.grade : (q ? +q.grade || null : null), programYili: (t || q || {}).programYear || '',
      uniteId: u ? u.id : '', unite: u ? `${u.order}. ${u.title}` : '', konuId: t ? t.id : '', konu: t ? t.title : '',
      kazanim: kz, soruId: soruId || '', bolum: bolum || '', bolumAd: SEKME()[bolum] || bolum || ''
    };
  };
  const YIL = (p) => { try { return (typeof progLab === 'function' ? progLab(p) : '') || (p ? p + ' programı' : ''); } catch (e) { return p || ''; } };
  B.ozetHTML = (b, tur) => `<dl class="b48-oz">${[
    ['Bildirim türü', tur === 'soru' ? 'Soru' : 'İçerik'], ['Sınıf', b.sinif ? b.sinif + '. sınıf' : 'Kaynakta veri bulunmuyor.'], ['Müfredat', YIL(b.programYili) || 'Kaynakta veri bulunmuyor.'],
    ['Ünite', b.unite || '—'], ['Konu', b.konu || '—'], ['Kazanım', b.kazanim.length ? b.kazanim.join(', ') : '—'],
    ...(b.soruId ? [['Soru kimliği', b.soruId]] : []), ['İçerik bölümü', b.bolumAd || '—'], ['Uygulama sürümü', surum()]
  ].map(([k, v]) => `<dt>${k}</dt><dd>${esc(String(v))}</dd>`).join('')}</dl>`;

  /* ---------- form ---------- */
  B.ac = function (tur, konuId, soruId, bolum) {
    const b = B.baglam(konuId, soruId, bolum); if (!b.konuId && !b.soruId) { UI.toast('Bildirilecek kayıt bulunamadı.'); return; }
    B._f = {tur, b, kat: '', ack: '', anonim: false};
    UI.sheet({
      title: tur === 'soru' ? 'Soruyu bildir' : 'İçerik hatası bildir',
      body: () => { const f = B._f; return `<div class="b48-f"><p class="b48-g">${tur === 'soru' ? 'Bu soruda neyin hatalı olduğunu seç.' : 'Bu içerikte bir hata mı fark ettin? Türünü seç; istersen kısa bir açıklama ekle.'}</p>
<div class="b48-kat" role="radiogroup" aria-label="Bildirim türü">${B.KAT[tur].map((k) => `<button type="button" role="radio" aria-checked="${f.kat === k}" class="${f.kat === k ? 'on' : ''}" onclick="V48.Bildir._f.kat=this.dataset.k;V48.Bildir._sec(this)" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div>
<label class="b48-a"><span>Açıklama <small>(isteğe bağlı)</small></span><textarea maxlength="1000" rows="3" placeholder="Örn. hangi cümle, doğrusu ne olmalı, hangi kaynakta gördün?" oninput="V48.Bildir._f.ack=this.value">${esc(f.ack)}</textarea></label>
<label class="b48-an"><input type="checkbox" ${f.anonim ? 'checked' : ''} onchange="V48.Bildir._f.anonim=this.checked"> Adım görünmesin (anonim bildir)</label>
<details class="b48-d"><summary>Otomatik eklenen bilgiler</summary>${B.ozetHTML(f.b, tur)}<p class="small mut">Kaynak: ${ROL[rol()]}. ${B.sunucuVar() ? 'Hesabınla sunucuya gönderilir; anonim seçersen editör adını görmez.' : 'Hesap sunucusu bağlı olmadığı için bu cihazda taslak olarak saklanır.'}</p></details>
<p class="b48-h" id="b48-h" role="alert"></p></div>`; },
      footer: () => `<button onclick="UI.close()">Vazgeç</button><button class="p" onclick="V48.Bildir.gonder()">Bildir</button>`
    });
  };
  B._sec = (el) => { el.parentNode.querySelectorAll('button').forEach((x) => { const on = x === el; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); }); const h = document.getElementById('b48-h'); if (h) h.textContent = ''; };
  B.gonder = async function () {
    const f = B._f; if (!f) return; if (!f.kat) { const h = document.getElementById('b48-h'); if (h) h.textContent = 'Lütfen bir bildirim türü seç.'; return; }
    const k = {id: uuid(), tur: f.tur, kategori: f.kat, aciklama: String(f.ack || '').trim().slice(0, 1000), anonim: !!f.anonim, kaynak: rol(), baglam: f.b, tarih: new Date().toISOString(), surum: surum(), durum: 'taslak', gonderim: null};
    const o = B.oku(); o.liste.unshift(k); o.liste = o.liste.slice(0, 300); B.yaz(o); B._f = null; UI.close();
    if (!B.sunucuVar()) { UI.toast('Teşekkürler. Merkezi sunucu bağlı olmadığı için bildirimin bu cihazda saklandı (Profilim › Bildirimlerim).'); B.isaret(); return; }
    const r = await B.tekGonder(k.id);
    UI.toast(r ? 'Teşekkürler. Bildirimin editöre gönderildi.' : 'Bildirimin bu cihazda saklandı; bağlantı olunca kendiliğinden gönderilecek.'); B.isaret();
  };

  /* ---------- sunucu ---------- */
  B.sunucuVar = () => { try { const h = V46.Hesap.oku(); return h.mod === 'google' && !!h.oturum && !!h.sunucu; } catch (e) { return false; } };
  B.tekGonder = async function (id) {
    const o = B.oku(), k = o.liste.find((x) => x.id === id); if (!k || k.durum !== 'taslak') return !!k;
    try {
      const r = await V46.Hesap.istek('/api/bildirim', 'POST', {id: k.id, tur: k.tur, kategori: k.kategori, aciklama: k.aciklama, anonim: k.anonim, kaynak: k.kaynak, baglam: k.baglam, tarih: k.tarih, surum: k.surum});
      const o2 = B.oku(), k2 = o2.liste.find((x) => x.id === id); if (!k2) return false;
      if (r.durum === 200 || r.durum === 201) { k2.durum = 'gonderildi'; k2.gonderim = {zaman: new Date().toISOString(), hata: ''}; k2.sunucuDurum = (r.j && r.j.durum) || 'yeni'; B.yaz(o2); return true; }
      k2.gonderim = {zaman: new Date().toISOString(), hata: (r.j && r.j.hata) || ('HTTP ' + r.durum)}; B.yaz(o2); return false;
    } catch (e) { const o2 = B.oku(), k2 = o2.liste.find((x) => x.id === id); if (k2) { k2.gonderim = {zaman: new Date().toISOString(), hata: String(e.message || e)}; B.yaz(o2); } return false; }
  };
  let calisiyor = false;
  B.gonderBekleyen = async function () {
    if (calisiyor || !B.sunucuVar() || (navigator.onLine === false)) return 0; calisiyor = true; let n = 0;
    try { for (const k of B.oku().liste.filter((x) => x.durum === 'taslak')) { if (await B.tekGonder(k.id)) n++; } } finally { calisiyor = false; }
    if (n) { UI.toast(n + ' bildirim editöre gönderildi.'); B.isaret(); } return n;
  };
  // gönderilmiş bildirimlerin editör durumunu sunucudan al
  B.durumlariAl = async function () {
    if (!B.sunucuVar()) return false;
    try { const r = await V46.Hesap.istek('/api/bildirim/benim', 'GET'); if (r.durum !== 200 || !r.j || !Array.isArray(r.j.liste)) return false; const o = B.oku(), M = {}; r.j.liste.forEach((x) => (M[x.id] = x)); o.liste.forEach((k) => { if (M[k.id]) { k.sunucuDurum = M[k.id].durum; k.gerekce = M[k.id].gerekce || ''; } }); B.yaz(o); return true; } catch (e) { return false; }
  };
  addEventListener('online', () => B.gonderBekleyen());
  setTimeout(() => B.gonderBekleyen(), 4000);
  try { const e0 = V46.Hesap.esitle; V46.Hesap.esitle = async function () { const r = await e0.apply(this, arguments); setTimeout(() => B.gonderBekleyen(), 300); return r; }; } catch (e) {}

  B.disaAktar = function (liste, ad) {
    const L = liste || B.oku().liste; if (!L.length) { UI.toast('Dışa aktarılacak bildirim yok.'); return; }
    const veri = {tur: 'dkab-bildirim', v: 1, surum: surum(), olusturma: new Date().toISOString(), liste: L.map((k) => Object.assign({}, k))};
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(veri, null, 1)], {type: 'application/json'})); a.download = (ad || 'dkab-bildirimler') + '-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* ---------- ekrana yerleştirme ---------- */
  const IKON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>';
  B.ik = IKON;
  const qdugme = (qid) => `<button type="button" class="b48-q" data-b48q="${esc(qid)}" onclick="V48.Bildir.ac('soru','','${esc(qid)}',V48.Bildir.sekme())">${IKON}<span>Soruyu bildir</span></button>`;
  B.sekme = () => { try { if (view === 'topic') return G.tab || ''; if (view === 'pders') return G.ptab || ''; } catch (e) {} return ''; };
  const konuId = () => { try { if (view === 'topic') return G.t; if (view === 'pders') return G.pt; } catch (e) {} return ''; };
  B.yerlestir = function () {
    try {
      // 1. içerik sonu: konu ekranının bölmesi
      const pane = document.getElementById('tb'), tid = konuId();
      if (pane && tid && !pane.querySelector(':scope > .b48-ic')) {
        const sk = B.sekme() || (pane.className.match(/t-(\w+)/) || [])[1] || '';
        if (!['kay', 'test', 'oyun'].includes(sk)) pane.insertAdjacentHTML('beforeend', `<div class="b48-ic"><span>Bu içerikte bir hata mı fark ettin?</span><button type="button" class="b48-ib" onclick="V48.Bildir.ac('icerik','${esc(tid)}','','${esc(sk)}')">${IKON}<span>İçerik hatası bildir</span></button></div>`);
      }
      // 2. sorular: mini test (MT.pick), yanlışlarım (V30.yDrop), V30 test ekranı (.tq-q)
      const ekle = (el, qid) => { if (!el || !qid || el.querySelector(':scope > .b48-q') || (el.nextElementSibling && el.nextElementSibling.matches('.b48-q'))) return; el.insertAdjacentHTML('beforeend', qdugme(qid)); };
      document.querySelectorAll('[onclick*="MT.pick("]').forEach((b) => { const m = /MT\.pick\('[^']*','([^']+)'/.exec(b.getAttribute('onclick')); if (!m) return; const kap = b.parentElement && b.parentElement.closest('.mtq,.mt-q,.q,.card,article,li,div'); ekle(kap && kap !== document.body ? kap : b.parentElement, m[1]); });
      document.querySelectorAll('[onclick*="V30.yDrop("]').forEach((b) => { const m = /V30\.yDrop\('([^']+)'/.exec(b.getAttribute('onclick')); if (m) ekle(b.parentElement, m[1]); });
      const tq = document.querySelector('.tq-q'); if (tq && typeof V30 !== 'undefined' && V30.tq && V30.tq.ids) { const qid = V30.tq.ids[V30.tq.i]; const v = tq.querySelector(':scope > .b48-q'); if (v && v.dataset.b48q !== qid) v.remove(); ekle(tq, qid); }
      document.querySelectorAll('[data-qid]:not(.b48-q)').forEach((e) => ekle(e, e.dataset.qid));
    } catch (e) { console.warn('[V48] bildirim yerleştirme', e); }
  };
  let zt = 0; const plan = () => { clearTimeout(zt); zt = setTimeout(B.yerlestir, 120); };
  const d0 = draw; draw = function () { const r = d0.apply(this, arguments); plan(); return r; };
  try { new MutationObserver((L) => { if (L.some((m) => [...m.addedNodes].some((n) => n.nodeType === 1 && !(n.classList && (n.classList.contains('b48-q') || n.classList.contains('b48-ic')))))) plan(); }).observe(document.getElementById('app') || document.body, {childList: true, subtree: true}); } catch (e) {}

  /* ---------- Profilim › Bildirimlerim ---------- */
  B.isaret = function () { try { if (view === 'profil46') draw(); } catch (e) {} };
  const DR = (k) => k.durum === 'taslak' ? ['bek', 'Taslak · gönderilmedi'] : [k.sunucuDurum === 'duzeltildi' ? 'ok' : k.sunucuDurum === 'gecersiz' ? 'kt' : 'uy', 'Gönderildi · ' + (B.DURUM[k.sunucuDurum] || 'Yeni')];
  B.profilHTML = function () {
    const L = B.oku().liste, t = L.filter((x) => x.durum === 'taslak').length;
    return `<section class="card p46-s b48-p"><h2>Bildirimlerim</h2>${L.length ? `<p class="small">${L.length} bildirim${t ? ` · <b>${t} taslak</b> (${B.sunucuVar() ? 'bağlantı olunca gönderilecek' : 'hesap sunucusu bağlı değil; bu cihazda'})` : ''}.</p>
<details class="b48-pl"><summary>Listeyi göster</summary><ul>${L.slice(0, 40).map((k) => { const d = DR(k); return `<li><span class="d43 ${d[0]}">${d[1]}</span><b>${esc(k.kategori)}</b><small>${esc(k.baglam.konu || k.baglam.soruId || '')}${k.baglam.soruId ? ' · ' + esc(k.baglam.soruId) : ''} · ${new Date(k.tarih).toLocaleDateString('tr-TR')}</small>${k.gerekce ? `<em>Editör notu: ${esc(k.gerekce)}</em>` : ''}</li>`; }).join('')}</ul></details>
<div class="p46-bb">${t && B.sunucuVar() ? '<button type="button" onclick="V48.Bildir.gonderBekleyen()">Taslakları şimdi gönder</button>' : ''}<button type="button" onclick="V48.Bildir.disaAktar()">Dışa aktar (JSON)</button>${B.sunucuVar() ? '<button type="button" onclick="V48.Bildir.durumlariAl().then(V48.Bildir.isaret)">Durumları yenile</button>' : ''}</div>
${B.sunucuVar() ? '' : '<p class="small mut">Merkezi gönderim için hesap sunucusu kurulmalı ve Google ile giriş yapılmalı. O zamana kadar dışa aktardığın dosyayı öğretmenine iletebilirsin.</p>'}` : '<p class="small mut">Henüz bildirim yok. Konu sayfalarının sonundaki “İçerik hatası bildir” ve soruların altındaki “Soruyu bildir” düğmeleriyle hata bildirebilirsin.</p>'}</section>`;
  };
  const pr0 = V30.routes.profil46;
  if (pr0) V30.routes.profil46 = function () { const r = pr0.apply(this, arguments); try { const s = [...$.querySelectorAll('section.p46-s')].pop(); const h = B.profilHTML(); if (s) s.insertAdjacentHTML('beforebegin', h); else $.insertAdjacentHTML('beforeend', h); } catch (e) { console.warn('[V48] bildirimlerim', e); } return r; };

  /* ---------- Editör: Hata ve Geri Bildirim Merkezi (rota: bildirim48) ---------- */
  const E = B.Ed = {};
  E.oku = () => { const o = js(EKEY, null) || {v: 1, gelen: [], islem: {}}; o.gelen = arr(o.gelen); o.islem = o.islem || {}; return o; };
  E.yaz = (o) => { try { localStorage.setItem(EKEY, JSON.stringify(o)); } catch (e) { UI.toast('Kaydedilemedi.'); } };
  E.st = () => (G.b48 = G.b48 || {f: 'yeni', tur: '', sec: '', sun: null, hata: ''});
  E.sunucuEditor = () => { try { const h = V46.Hesap.oku(); return B.sunucuVar() && arr(h.kullanici && h.kullanici.roller).includes('editor'); } catch (e) { return false; } };
  // yerel kayıtlar: bu cihazın bildirimleri + içe aktarılanlar; işlem durumu ayrı tutulur (bildirimin kendisi değişmez)
  E.yerel = function () {
    const o = E.oku(), M = new Map();
    B.oku().liste.forEach((k) => M.set(k.id, Object.assign({}, k, {kaynakYer: 'Bu cihaz'})));
    o.gelen.forEach((k) => { if (!M.has(k.id)) M.set(k.id, Object.assign({}, k, {kaynakYer: 'İçe aktarılan dosya'})); });
    return [...M.values()].map((k) => { const i = o.islem[k.id] || {}; return Object.assign(k, {edDurum: i.durum || 'yeni', notlar: arr(i.notlar), gerekce: i.gerekce || '', yer: 'yerel'}); });
  };
  E.liste = function () { const s = E.st(), Y = E.yerel(), S = arr(s.sun).map((k) => Object.assign({}, k, {edDurum: k.durum, yer: 'sunucu', kaynakYer: 'Sunucu'})); const ids = new Set(S.map((x) => x.id)); return S.concat(Y.filter((x) => !ids.has(x.id))); };
  E.hedef = (k) => k.baglam && k.baglam.soruId ? 'soru:' + k.baglam.soruId : 'konu:' + ((k.baglam && k.baglam.konuId) || '') + ':' + ((k.baglam && k.baglam.bolum) || '');
  E.sunucuYukle = async function () {
    const s = E.st(); if (!E.sunucuEditor()) { s.sun = null; return; }
    try { const r = await V46.Hesap.istek('/api/bildirim', 'GET'); if (r.durum === 200 && r.j && Array.isArray(r.j.liste)) { s.sun = r.j.liste; s.hata = ''; } else s.hata = (r.j && r.j.hata) || ('Sunucu yanıtı: ' + r.durum); } catch (e) { s.hata = 'Sunucuya ulaşılamadı: ' + (e.message || e); }
  };
  E.islem = async function (id, eylem) {
    const k = E.liste().find((x) => x.id === id); if (!k) return;
    let not = '', gerekce = '';
    if (eylem === 'not') { const t = document.getElementById('b48-not'); not = t ? t.value.trim() : ''; if (!not) { UI.toast('Not boş.'); return; } }
    if (eylem === 'gecersiz') { const t = document.getElementById('b48-ger'); gerekce = t ? t.value.trim() : ''; if (gerekce.length < 5) { UI.toast('Kapatmak için kısa bir gerekçe yaz.'); try { t.focus(); } catch (e) {} return; } }
    const durum = {incele: 'inceleniyor', duzeltildi: 'duzeltildi', gecersiz: 'gecersiz', yeni: 'yeni'}[eylem];
    if (k.yer === 'sunucu') {
      try { const r = await V46.Hesap.istek('/api/bildirim/' + encodeURIComponent(id), 'PATCH', Object.assign({}, durum ? {durum} : {}, not ? {not} : {}, gerekce ? {gerekce} : {})); if (r.durum !== 200) { UI.toast('İşlem kaydedilemedi: ' + ((r.j && r.j.hata) || r.durum)); return; } } catch (e) { UI.toast('Sunucuya ulaşılamadı.'); return; }
      await E.sunucuYukle();
    } else {
      const o = E.oku(), i = o.islem[id] = o.islem[id] || {durum: 'yeni', notlar: []};
      if (durum) i.durum = durum; if (gerekce) i.gerekce = gerekce; if (not) i.notlar.push({metin: not, zaman: new Date().toISOString()});
      if (durum) i.notlar.push({metin: 'Durum: ' + B.DURUM[durum] + (gerekce ? ' — ' + gerekce : ''), zaman: new Date().toISOString(), sistem: 1});
      E.yaz(o);
    }
    UI.toast(eylem === 'not' ? 'Not eklendi.' : 'Durum güncellendi: ' + B.DURUM[durum]); E.ciz();
  };
  E.iceAktar = function (inp) {
    const f = inp.files && inp.files[0]; if (!f) return;
    f.text().then((t) => { const d = JSON.parse(t); if (!d || d.tur !== 'dkab-bildirim' || !Array.isArray(d.liste)) throw new Error('Bu dosya bildirim dışa aktarımı değil.');
      const o = E.oku(), ids = new Set(o.gelen.map((x) => x.id)); let n = 0;
      d.liste.forEach((k) => { if (k && typeof k.id === 'string' && k.baglam && B.KAT[k.tur] && !ids.has(k.id)) { o.gelen.push({id: k.id.slice(0, 64), tur: k.tur, kategori: String(k.kategori || '').slice(0, 80), aciklama: String(k.aciklama || '').slice(0, 1000), anonim: !!k.anonim, kaynak: k.kaynak === 'ogretmen' ? 'ogretmen' : 'ogrenci', baglam: k.baglam, tarih: k.tarih, surum: k.surum}); ids.add(k.id); n++; } });
      E.yaz(o); UI.toast(n + ' yeni bildirim içe aktarıldı.'); E.ciz(); }).catch((e) => UI.toast('İçe aktarılamadı: ' + e.message)).finally(() => { inp.value = ''; });
  };
  E.git = function (id) { const k = E.liste().find((x) => x.id === id); if (!k) return; const b = k.baglam || {};
    if (b.soruId) return E.soruGor(b.soruId);
    if (b.konuId) V44.icerikAc(b.konuId, b.bolum && b.bolum !== 'kay' ? b.bolum : 'anlat'); };
  E.soruGor = function (qid) { const q = Store.get('questions', qid);
    UI.sheet({title: 'Soru ' + qid, body: () => q ? `<p><b>${esc(q.text || q.q || '')}</b></p><ol type="A" class="b48-so">${arr(q.options).map((x, i) => `<li class="${String(i) === String(q.answer) ? 'dg' : ''}">${esc(x)}${String(i) === String(q.answer) ? ' <small>(kayıtlı doğru cevap)</small>' : ''}</li>`).join('')}</ol>${q.explanation ? `<p class="small"><b>Açıklama:</b> ${esc(q.explanation)}</p>` : ''}<p class="small mut">İçeriği değiştirmek için Editör Onay Alanı'nı kullan; bu ekran yalnız bildirimleri yönetir.</p>` : '<p>Bu kimlikte soru kaydı bulunmuyor.</p>',
      footer: () => (q ? `<button onclick="UI.close();V38.edOpen('questions','${esc(qid)}')">Editör Onay Alanı'nda aç</button>` : '') + (q && q.topicId ? `<button onclick="UI.close();V44.icerikAc('${esc(q.topicId)}','test')">Konusuna git</button>` : '') + '<button class="p" onclick="UI.close()">Kapat</button>'}); };
  E.secAc = (id) => { E.st().sec = E.st().sec === id ? '' : id; E.ciz(); };
  E.ciz = function () { if (view !== 'bildirim48') return; const y = scrollY; V30.routes.bildirim48(); scrollTo(0, y); };
  E.kart = function (k, n) {
    const b = k.baglam || {}, s = E.st(), acik = s.sec === k.id;
    const kim = k.anonim ? 'Anonim' : (k.kullaniciAd || 'ad paylaşılmadı');
    return `<li class="b48-e ${k.edDurum}"><button type="button" class="b48-eb" aria-expanded="${acik}" onclick="V48.Bildir.Ed.secAc('${esc(k.id)}')"><span class="d43 ${k.edDurum === 'duzeltildi' ? 'ok' : k.edDurum === 'gecersiz' ? 'kt' : k.edDurum === 'inceleniyor' ? 'uy' : 'bek'}">${B.DURUM[k.edDurum] || k.edDurum}</span><b>${esc(k.kategori)}</b><small>${k.tur === 'soru' ? 'Soru ' + esc(b.soruId) : 'İçerik · ' + esc(b.bolumAd || '')} · ${b.sinif ? b.sinif + '. sınıf · ' : ''}${esc(b.konu || '')}</small>${n > 1 ? `<em class="b48-gr">${n} benzer bildirim</em>` : ''}</button>
${acik ? `<div class="b48-ed">${k.aciklama ? `<p class="b48-ack">“${esc(k.aciklama)}”</p>` : '<p class="small mut">Açıklama yazılmamış.</p>'}${B.ozetHTML(b, k.tur)}<p class="small mut">Bildiren: ${esc(kim)} (${ROL[k.kaynak] || 'Öğrenci'}) · ${k.tarih ? new Date(k.tarih).toLocaleString('tr-TR') : ''} · kayıt yeri: ${esc(k.kaynakYer)} · kimlik ${esc(k.id)}</p>
${arr(k.notlar).length ? `<ul class="b48-nt">${k.notlar.map((x) => `<li><small>${new Date(x.zaman).toLocaleString('tr-TR')}${x.editor ? ' · ' + esc(x.editor) : ''}</small> ${esc(x.metin)}</li>`).join('')}</ul>` : ''}${k.gerekce ? `<p class="small"><b>Kapatma gerekçesi:</b> ${esc(k.gerekce)}</p>` : ''}
<div class="p46-bb"><button type="button" onclick="V48.Bildir.Ed.git('${esc(k.id)}')">${b.soruId ? 'Soruyu gör' : 'İçeriğe git'}</button>${k.edDurum !== 'inceleniyor' ? `<button type="button" onclick="V48.Bildir.Ed.islem('${esc(k.id)}','incele')">İncelemeye al</button>` : ''}${k.edDurum !== 'duzeltildi' ? `<button type="button" class="p" onclick="V48.Bildir.Ed.islem('${esc(k.id)}','duzeltildi')">Düzeltildi olarak işaretle</button>` : ''}${k.edDurum !== 'yeni' ? `<button type="button" onclick="V48.Bildir.Ed.islem('${esc(k.id)}','yeni')">Yeniye geri al</button>` : ''}</div>
<label class="b48-a"><span>İç not (yalnız editörler görür)</span><textarea id="b48-not" rows="2" maxlength="1000"></textarea></label><div class="p46-bb"><button type="button" onclick="V48.Bildir.Ed.islem('${esc(k.id)}','not')">Not ekle</button></div>
${k.edDurum !== 'gecersiz' ? `<label class="b48-a"><span>Geçersiz say / reddet — gerekçe</span><textarea id="b48-ger" rows="2" maxlength="500" placeholder="Örn. bilgi kaynakla doğrulandı, hata yok."></textarea></label><div class="p46-bb"><button type="button" class="b48-red" onclick="V48.Bildir.Ed.islem('${esc(k.id)}','gecersiz')">Gerekçeyle kapat</button></div>` : ''}</div>` : ''}</li>`;
  };
  V30.routes.bildirim48 = function () {
    if (!V38.edOk()) return V38.edPinView();
    try { V37.mode(); } catch (e) {}
    const s = E.st(), L = E.liste(), say = {}; Object.keys(B.DURUM).forEach((d) => (say[d] = L.filter((k) => k.edDurum === d).length));
    const F = L.filter((k) => k.edDurum === s.f && (!s.tur || k.tur === s.tur));
    const grp = {}; F.forEach((k) => (grp[E.hedef(k)] = grp[E.hedef(k)] || []).push(k));
    const gruplar = Object.values(grp).sort((a, b) => b.length - a.length || String(b[0].tarih).localeCompare(String(a[0].tarih)));
    $.innerHTML = `<div class="ed38 b48-m">${V38.edHead('Hata ve Geri Bildirim Merkezi', 'Öğrenci ve öğretmenlerin içerik ve soru bildirimleri', "go('editor')")}
<div class="ed38-bar"><span class="ed38-ses">${E.sunucuEditor() ? 'Sunucu bağlı · editör hesabı' : 'Yerel mod: bu cihazdaki ve içe aktarılan bildirimler'}</span>${E.sunucuEditor() ? `<button class="v38-b" onclick="V48.Bildir.Ed.sunucuYukle().then(V48.Bildir.Ed.ciz)">Sunucudan yenile</button>` : ''}<label class="v38-b v38-file">Bildirim dosyası içe aktar<input type="file" accept="application/json,.json" onchange="V48.Bildir.Ed.iceAktar(this)"></label><button class="v38-b" onclick="V48.Bildir.disaAktar(V48.Bildir.Ed.liste(),'dkab-bildirim-merkezi')">Hepsini dışa aktar</button></div>
${s.hata ? `<p class="small bad" role="alert">${esc(s.hata)}</p>` : ''}
<nav class="b48-sek" role="tablist" aria-label="Durum">${Object.entries(B.DURUM).map(([d, n]) => `<button type="button" role="tab" aria-selected="${s.f === d}" class="${s.f === d ? 'on' : ''}" onclick="G.b48.f='${d}';G.b48.sec='';V48.Bildir.Ed.ciz()">${n}<span>${say[d]}</span></button>`).join('')}</nav>
<div class="b48-fl">${[['', 'Tümü'], ['icerik', 'İçerik'], ['soru', 'Soru']].map(([k, n]) => `<button type="button" class="${s.tur === k ? 'on' : ''}" aria-pressed="${s.tur === k}" onclick="G.b48.tur='${k}';V48.Bildir.Ed.ciz()">${n}</button>`).join('')}</div>
${gruplar.length ? `<ul class="b48-el">${gruplar.map((g) => E.kart(g[0], g.length) + (g.length > 1 && s.sec === g[0].id ? g.slice(1).map((k) => E.kart(k, 1)).join('') : '')).join('')}</ul>` : `<p class="v38-empty">Bu durumda bildirim yok.</p>`}
<section class="ed38-info"><h2>Nasıl çalışır?</h2><ol><li><b>Yeni</b> bildirimler burada toplanır; aynı soru ya da aynı içerik bölümü için gelenler tek satırda “benzer bildirim” olarak gruplanır.</li><li><b>İncelemeye al</b>, iç not ekle; içeriği değiştirmek gerekiyorsa Editör Onay Alanı'nda düzenle ve onayla. Bu ekran içeriğe yazmaz.</li><li>Düzelttiğinde <b>Düzeltildi</b>, hata yoksa gerekçesiyle <b>Geçersiz / Reddedildi</b> olarak kapat.</li></ol>
<p class="small mut">${E.sunucuEditor() ? 'Kayıtlar sunucuda saklanır; işlemler editör hesabıyla yapılır.' : 'Merkezi sunucu bağlı değil: burada yalnız bu cihazdaki ve içe aktarılan bildirimler görünür, işlemler bu cihazda saklanır. Öğrencilerin bildirimleri ancak sunucu kurulunca ya da dışa aktarılan dosyalar içe aktarılınca buraya gelir.'}</p></section></div>`;
    if (s.sun === null && E.sunucuEditor() && !s._yk) { s._yk = 1; E.sunucuYukle().then(() => { s._yk = 0; E.ciz(); }); }
  };
  // Editör Onay Alanı ana ekranına giriş kartı
  if (typeof V38 !== 'undefined' && V38.edHomeHTML) {
    const eh = V38.edHomeHTML;
    V38.edHomeHTML = function () { const h = eh.apply(this, arguments); let n = 0; try { n = E.liste().filter((k) => k.edDurum === 'yeni').length; } catch (e) {}
      return h.replace('<section class="ed38-info">', `<button type="button" class="ed38-cat b48-gir" onclick="go('bildirim48')"><span class="ic">${IKON}</span><span class="tx"><b>Hata ve Geri Bildirim Merkezi</b><small>Öğrenci ve öğretmen bildirimleri: incele, not al, düzeltildi / geçersiz olarak kapat</small></span><span class="n">${n}</span></button><section class="ed38-info">`); };
  }
  try { const nk = navKey; navKey = function () { return view === 'bildirim48' ? 'ogretmen' : nk.apply(this, arguments); }; } catch (e) {}
})();
