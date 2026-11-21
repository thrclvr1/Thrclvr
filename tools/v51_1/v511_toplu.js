/* ===================== V51.1: Editör Onay Alanı — toplu işlemler =====================
   Her kategori listesinde (Onay bekleyen, Kaynak kontrolü, Kazanım eşleşmesi, Düzenleme bekleyen, Reddedilen,
   Onay Arşivi, Kuyruktan çıkarılanlar) kayıt başına seçim kutusu, “Tümünü seç” (yalnız o kategori + etkin
   süzgeçler), “Seçimi temizle” ve kategoriye uygun toplu işlemler.
   Güvenlik: her kayıt mevcut V38 işlevleriyle (ED.approve, ED.mark, ED.srcDone, ED.publish, ED.unpublish,
   ED.withdraw) TEK TEK işlenir; aynı doğrulama koşulları uygulanır (kaynak kontrolü, içerik var mı, onaylanan sürüm
   = son sürüm, veri doğrulama). Uygun olmayan kayıtlar işlemden önce nedenleriyle gösterilir ve atlanır; bir kayıttaki
   hata diğerlerini durdurmaz. Her kaydın geçmişine ayrı satır yazılır (toplu işlem kimliğiyle). Onay yayımlamaz.
   “Kuyruktan kaldır” veri silmez: kayda geri alınabilir bir işaret (kuyrukDisi51) konur ve kayıt “Kuyruktan
   çıkarılanlar” kategorisine geçer; yayımlanmış içerik bu yolla kaldırılamaz (önce yayından kaldırılmalı).
   Her toplu işlem V38.mem.ed.toplu51 içinde saklanır ve “Toplu işlem geçmişi”nden kayıt bazında geri alınabilir. */
(function () {
  if (typeof V38 === 'undefined' || !V38.ED) return;
  const ED = V38.ED, V51 = window.V51 = window.V51 || {};
  const T = V51.Toplu = {k: '', set: new Set(), calisiyor: false};
  const IK = (k, s) => V38.svg(k, s || 18);

  /* ---------- 1. kuyruk dışı (arşiv) kategorisi: veri silinmez, geri alınabilir ---------- */
  const li = ED.CAT.findIndex((x) => x[0] === 'log');
  ED.CAT.splice(li < 0 ? ED.CAT.length : li, 0, ['arsiv51', 'Kuyruktan çıkarılanlar (geri alınabilir)', 'db']);
  const cat0 = ED.cat;
  ED.cat = function (c, r) { const it = ED.it(c, r.id); if (it && it.kuyrukDisi51) return 'arsiv51'; return cat0.apply(this, arguments); };
  const say0 = ED.counts;
  ED.counts = function () { const n = say0.apply(this, arguments); n.arsiv51 = Object.values(V38.mem.ed.items || {}).filter((it) => it && it.kuyrukDisi51).length; return n; };
  const ev0 = V38.edHomeHTML;
  V38.edHomeHTML = function () {
    let h = ev0.apply(this, arguments);
    h = h.replace(/(data-k="arsiv51"[\s\S]*?<small>)[^<]*(<\/small>)/, '$1Aktif kuyruktan çıkarılan kayıtlar; veri silinmez, geri alınır$2');
    return h + `<section class="ed38-info tp51-ana"><h2>Toplu işlemler</h2><p class="small">Her kategoride kayıtları seçip toplu onaylayabilir, reddedebilir, düzeltmeye gönderebilir, yayımlayabilir ya da kuyruktan çıkarabilirsin. Her işlem kayıt bazında geri alınabilir.</p><div class="ed38-cats"><button class="ed38-cat" onclick="V38.edGo({k:'toplu51',cid:'',mode:''})"><span class="ic">${IK('clock', 22)}</span><span class="tx"><b>Toplu işlem geçmişi</b><small>${(V38.mem.ed.toplu51 || []).length} işlem · geri alma</small></span></button></div></section>`;
  };

  /* ---------- 2. işlemler ve kategori kısıtları ---------- */
  const yayinda = (it) => !!(it && it.published);
  const I = T.ISLEM = {
    onayla: {ad: 'Seçilenleri onayla', kisa: 'Onayla', not: 'istege', notAd: 'Onay notu', kat: ['bekleyen', 'eslesme', 'duzeltme'],
      uygun: (c, r, it) => (it && it.state === 'onay' ? 'Zaten onaylı' : ED.canApprove(c, r)),
      yap: (c, r, it, n) => ED.approve(c, r.id, n), sonuc: 'onaylandı'},
    kaynak: {ad: 'Kaynak kontrolünü tamamla', kisa: 'Kaynak kontrolü', not: 'zorunlu', notAd: 'Kontrol edilen kaynak (kitap, sayfa, MEB belgesi)', kat: ['kaynak'],
      uyari: 'Seçilen kayıtların kaynağını kendin kontrol ettiğini kaydediyorsun. Bu işlem onay değildir; kayıtlar ardından “Onay bekleyen içerikler”e geçer.',
      uygun: (c, r) => (!ED.needSrc(c, r) ? 'Kaynak kontrolü gerekmiyor' : ED.srcOk(c, r) ? 'Kaynak kontrolü zaten tamam' : ''),
      yap: (c, r, it, n) => ED.srcDone(c, r.id, n), sonuc: 'kaynak kontrolü tamamlandı'},
    reddet: {ad: 'Seçilenleri reddet', kisa: 'Reddet', not: 'zorunlu', notAd: 'Ret gerekçesi (her kayda ayrı yazılır)', tehlike: true, kat: ['bekleyen', 'kaynak', 'eslesme', 'duzeltme'],
      uyari: 'Öğrenci ekranındaki mevcut içerik silinmez. Geçiş döneminde reddedilen içerik öğrenciden gizlenir.',
      uygun: (c, r, it) => (yayinda(it) ? 'Yayında; önce yayından kaldır' : it && it.state === 'red' ? 'Zaten reddedilmiş' : ''),
      yap: (c, r, it, n) => ED.mark(c, r.id, 'red', n), sonuc: 'reddedildi'},
    duzeltme: {ad: 'Seçilenleri düzeltmeye gönder', kisa: 'Düzeltmeye gönder', not: 'zorunlu', notAd: 'Düzeltme açıklaması (her kayda ayrı yazılır)', kat: ['bekleyen', 'kaynak', 'eslesme'],
      uygun: (c, r, it) => (yayinda(it) ? 'Yayında; önce yayından kaldır' : it && it.state === 'duzeltme' ? 'Zaten düzeltme bekliyor' : ''),
      yap: (c, r, it, n) => ED.mark(c, r.id, 'duzeltme', n), sonuc: 'düzeltme bekliyor'},
    incele: {ad: 'Yeniden incelemeye al', kisa: 'İncelemeye al', not: 'istege', notAd: 'Not', kat: ['duzeltme', 'red'],
      uygun: (c, r, it) => (!it || !['red', 'duzeltme'].includes(it.state) ? 'Ret ya da düzeltme durumunda değil' : ''),
      yap: (c, r, it, n) => { it = ED.ensure(c, r); ED.hist(it, 'Yeniden incelemeye alındı', n); it.state = 'bekliyor'; it.approved = null; return true; }, sonuc: 'incelemeye alındı'},
    yayimla: {ad: 'Seçilenleri yayımla', kisa: 'Yayımla', not: 'istege', notAd: 'Yayın notu', kat: ['onay'],
      uyari: 'Her kaydın onaylanan sürümü öğrenci ekranında kullanılacak. Önceki içerik saklanır; “Yayından kaldır” ile birebir geri gelir.',
      uygun: (c, r, it) => { if (yayinda(it)) return 'Zaten yayında'; if (!it || it.state !== 'onay' || !it.approved) return 'Onaylanmamış'; if (ED.last(it).vid !== it.approved.vid) return 'Onaydan sonra içerik değişmiş; yeniden onay gerekir'; return ED.canPublish(c, r.id); },
      yap: (c, r, it, n) => ED.publish(c, r.id, n), sonuc: 'yayımlandı'},
    yayindanKaldir: {ad: 'Seçilenleri yayından kaldır', kisa: 'Yayından kaldır', not: 'istege', notAd: 'Not', tehlike: true, kat: ['onay'],
      uyari: 'Öğrenci ekranı her kayıtta yayımlamadan önceki içeriğe birebir döner. Onay ve geçmiş korunur.',
      uygun: (c, r, it) => (!yayinda(it) ? 'Yayında değil' : ''),
      yap: (c, r, it, n) => ED.unpublish(c, r.id, n), sonuc: 'yayından kaldırıldı'},
    geriCek: {ad: 'Onayı geri çek', kisa: 'Onayı geri çek', not: 'zorunlu', notAd: 'Gerekçe', tehlike: true, kat: ['onay'],
      uyari: 'Yayındaki kayıtlar önce yayından kaldırılır. Geçmiş silinmez.',
      uygun: (c, r, it) => (!it || it.state !== 'onay' ? 'Onaylı değil' : ''),
      yap: (c, r, it, n) => ED.withdraw(c, r.id, n), sonuc: 'onayı geri çekildi'},
    arsiv: {ad: 'Seçilenleri kuyruktan kaldır', kisa: 'Kuyruktan kaldır', not: 'istege', notAd: 'Neden', kat: ['bekleyen', 'kaynak', 'eslesme', 'duzeltme', 'red', 'onay'],
      uyari: 'Kalıcı silme değildir: içerik, kaynak, sürümler ve geçmiş aynen kalır. Kayıtlar “Kuyruktan çıkarılanlar” kategorisine geçer ve oradan geri alınabilir.',
      uygun: (c, r, it) => (yayinda(it) ? 'Yayında; önce yayından kaldır' : it && it.kuyrukDisi51 ? 'Zaten kuyruk dışında' : ''),
      yap: (c, r, it, n) => { it = ED.ensure(c, r); it.kuyrukDisi51 = {at: V38.now(), not: n || '', kat: T.k}; ED.hist(it, 'Kuyruktan çıkarıldı (arşiv)', n); return true; }, sonuc: 'kuyruktan çıkarıldı'},
    kuyruga: {ad: 'Seçilenleri kuyruğa geri al', kisa: 'Kuyruğa geri al', not: 'istege', notAd: 'Not', kat: ['arsiv51'],
      uygun: (c, r, it) => (!it || !it.kuyrukDisi51 ? 'Kuyruk dışında değil' : ''),
      yap: (c, r, it, n) => { delete it.kuyrukDisi51; ED.hist(it, 'Kuyruğa geri alındı', n); return true; }, sonuc: 'kuyruğa geri alındı'}
  };
  T.islemler = (k) => Object.keys(I).filter((x) => I[x].kat.includes(k));

  /* ---------- 3. seçim ---------- */
  T.kayitlar = () => V38.edRows();   // yalnız etkin kategori + süzgeçler
  T.hazirla = function () {
    const k = V38.ES().k; if (k !== T.k) { T.k = k; T.set = new Set(); }
    const R = new Set(T.kayitlar().map((x) => ED.cid(x.c, x.r.id)));
    [...T.set].forEach((cid) => { if (!R.has(cid)) T.set.delete(cid); });   // süzgeç dışına çıkan seçim kalmaz
    return R.size;
  };
  T.say = function () {
    const n = T.set.size, e = document.getElementById('tp51-n'); if (e) e.textContent = n ? `${n} içerik seçildi.` : 'Seçili içerik yok.';
    document.querySelectorAll('.tp51-is').forEach((b) => { b.disabled = !n || T.calisiyor; });
    const tum = document.getElementById('tp51-tum'); if (tum) tum.setAttribute('aria-pressed', String(!!n && n === T.kayitlar().length));
  };
  T.degis = function (cb) { if (cb.checked) T.set.add(cb.dataset.cid); else T.set.delete(cb.dataset.cid); cb.closest('li').classList.toggle('sec', cb.checked); T.say(); };
  T.tumu = function () { T.kayitlar().forEach((x) => T.set.add(ED.cid(x.c, x.r.id))); document.querySelectorAll('.tp51-cb input').forEach((cb) => { cb.checked = true; cb.closest('li').classList.add('sec'); }); T.say(); UI.toast(`${T.set.size} içerik seçildi (yalnız bu kategori ve süzgeç).`); };
  T.temizle = function () { T.set.clear(); document.querySelectorAll('.tp51-cb input').forEach((cb) => { cb.checked = false; cb.closest('li').classList.remove('sec'); }); T.say(); };

  /* ---------- 4. liste ekranına seçim kutuları ve işlem çubuğu ---------- */
  const L0 = V38.edListHTML;
  V38.edListHTML = function () {
    const s = V38.ES();
    if (s.k === 'toplu51') return T.gecmisHTML();
    let h = L0.apply(this, arguments);
    if (!ED.CAT.some((x) => x[0] === s.k) || s.k === 'log') return h;
    const n = T.hazirla(), IS = T.islemler(s.k);
    h = h.replace(/<li><button class="ed38-row" onclick="V38\.edOpen\('([^']+)','([^']+)'\)">/g, (m, c, id) => { const cid = c + ':' + id, on = T.set.has(cid); return `<li class="tp51-li${on ? ' sec' : ''}"><label class="tp51-cb"><input type="checkbox" data-cid="${cid}" ${on ? 'checked' : ''} onchange="V51.Toplu.degis(this)" aria-label="Kaydı seç"></label><button class="ed38-row" onclick="V38.edOpen('${c}','${id}')">`; });
    const bar = `<div class="tp51" id="tp51" role="region" aria-label="Toplu işlemler">
<div class="tp51-ust"><b id="tp51-n" aria-live="polite">${T.set.size ? T.set.size + ' içerik seçildi.' : 'Seçili içerik yok.'}</b><small>Bu kategoride${s.f.tur || s.f.g || s.f.py || s.f.q ? ' ve süzgeçte' : ''} ${n} kayıt</small></div>
<div class="tp51-bb"><button type="button" id="tp51-tum" ${n ? '' : 'disabled'} onclick="V51.Toplu.tumu()">Tümünü seç (${n})</button><button type="button" onclick="V51.Toplu.temizle()">Seçimi temizle</button>
${IS.map((x) => `<button type="button" class="tp51-is${I[x].tehlike ? ' tehlike' : ''}${x === 'onayla' || x === 'yayimla' || x === 'kaynak' || x === 'kuyruga' ? ' p' : ''}" data-is="${x}" ${T.set.size && !T.calisiyor ? '' : 'disabled'} onclick="V51.Toplu.baslat('${x}')">${I[x].ad}</button>`).join('')}</div>
<div class="tp51-il" id="tp51-il" hidden role="status"></div></div>`;
    return h.replace(/(<\/div>\s*)(<ul class="ed38-list">|<p class="v38-empty">)/, `$1${bar}$2`);
  };

  /* ---------- 5. ön kontrol, onay penceresi, çalıştırma ---------- */
  const secilenler = () => [...T.set].map((cid) => { const [c, id] = V38.edSplit(cid), r = ED.R(c, id); return r ? {c, r, cid} : null; }).filter(Boolean);
  T.onKontrol = function (is) {
    const D = I[is], L = secilenler(), uy = [], ret = [];
    L.forEach((x) => { const it = ED.it(x.c, x.r.id); let n = ''; try { n = (ED.cat(x.c, x.r) !== T.k) ? 'Bu kategoride değil' : (D.uygun(x.c, x.r, it) || ''); } catch (e) { n = 'Denetlenemedi: ' + (e.message || e); } if (n) ret.push(Object.assign({neden: n}, x)); else uy.push(x); });
    return {L, uy, ret};
  };
  const nedenOzet = (ret) => { const G = {}; ret.forEach((x) => { (G[x.neden] = G[x.neden] || []).push(x); }); return Object.entries(G).map(([n, A]) => `<li><b>${A.length}</b> · ${esc(n)}<small>${A.slice(0, 3).map((x) => esc(String(ED.title(x.c, x.r)).slice(0, 60))).join(' · ')}${A.length > 3 ? ' …' : ''}</small></li>`).join(''); };
  T.baslat = function (is) {
    if (!V38.edOk()) { UI.toast('Bu işlem editör yetkisi gerektirir.'); return; }
    if (T.calisiyor) return;
    const D = I[is]; if (!D || !D.kat.includes(T.k)) { UI.toast('Bu işlem bu kategoride kullanılamaz.'); return; }
    const K = T.onKontrol(is);
    const ozet = `<p><b>${K.L.length}</b> kayıt seçildi · <b>${K.uy.length}</b> kayıt bu işleme uygun${K.ret.length ? ` · <b>${K.ret.length}</b> kayıt atlanacak` : ''}.</p>${D.uyari ? `<p class="small">${D.uyari}</p>` : ''}${K.ret.length ? `<details class="tp51-ret" ${K.uy.length ? '' : 'open'}><summary>Uygun olmayanlar ve nedenleri</summary><ul>${nedenOzet(K.ret)}</ul></details>` : ''}`;
    if (!K.uy.length) { UI.modal({title: D.ad, body: () => `<div class="v38-cf">${ozet}<p>Bu işleme uygun kayıt yok; hiçbir şey değiştirilmedi.</p></div>`, footer: () => '<button type="button" onclick="UI.close()">Kapat</button>'}); return; }
    V38.confirm({title: `${D.ad} (${K.uy.length})`, text: ozet + (is === 'onayla' ? '<p class="small"><b>Onay yayımlamaz.</b> Yayımlama ayrı adımdır (Onay Arşivi › Seçilenleri yayımla).</p>' : ''),
      note: D.not, noteLabel: D.notAd, ok: `${K.uy.length} kayıtta uygula`, danger: !!D.tehlike, onOk: (t) => T.calistir(is, K.uy.map((x) => x.cid), t, K.ret)});
  };
  T.calistir = async function (is, cidler, not, onceAtla) {
    if (!V38.edOk() || T.calisiyor) return null;
    const D = I[is], op = {id: 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), at: V38.now(), is, ad: D.ad, kat: T.k, not: not || '', kayit: [], geriAlindi: null};
    const sonuc = {ok: [], atla: (onceAtla || []).map((x) => ({cid: x.cid, neden: x.neden})), hata: []};
    T.calisiyor = true; T.say();
    const il = document.getElementById('tp51-il');
    // tek tek işle; kayıt arası kaydetmeyi ve tekrar eden ağır doğrulamayı bir kez yap
    const save0 = ED.save; let kirli = false; ED.save = () => { kirli = true; return Promise.resolve(true); };
    const st0 = Store.save; let stKirli = false; Store.save = function () { stKirli = true; };   // öğrenci verisi (dk2) işlem sonunda bir kez yazılır
    const toast0 = UI.toast; UI.toast = () => {};
    let va0 = null, vaC = null; try { if (typeof validateAll === 'function') { va0 = validateAll; validateAll = function () { return vaC || (vaC = va0.apply(this, arguments)); }; } } catch (e) {}
    try {
      for (let i = 0; i < cidler.length; i++) {
        const cid = cidler[i], [c, id] = V38.edSplit(cid), r = ED.R(c, id);
        try {
          if (!r) throw new Error('Kayıt bulunamadı');
          const it0 = ED.it(c, id), neden = (ED.cat(c, r) !== op.kat) ? 'Kategori değişmiş' : D.uygun(c, r, it0);
          if (neden) { sonuc.atla.push({cid, neden}); continue; }
          const once = it0 ? {state: it0.state, approved: V38.clone(it0.approved), kaynakOk: !!it0.kaynakOk, kaynakNot: it0.kaynakNot || '', kuyrukDisi51: it0.kuyrukDisi51 ? V38.clone(it0.kuyrukDisi51) : null, yayinda: !!it0.published} : null;
          const sonu = D.yap(c, r, it0, not || '');
          const it = ED.it(c, id);
          if (!sonu || !it) throw new Error('İşlem uygulanamadı');
          const h = it.history[it.history.length - 1]; if (h) { h.toplu51 = op.id; if (!h.note && not) h.note = not; }
          op.kayit.push({cid, once, durum: 'ok'}); sonuc.ok.push(cid);
        } catch (e) { sonuc.hata.push({cid, neden: String(e.message || e)}); }
        if (i % 12 === 11) { if (il) { il.hidden = false; il.textContent = `İşleniyor… ${i + 1}/${cidler.length}`; } await new Promise((res) => setTimeout(res, 0)); }
      }
    } finally {
      ED.save = save0; UI.toast = toast0; if (va0) { try { validateAll = va0; } catch (e) {} }
      Store.save = st0; if (stKirli) { try { Store.save(); } catch (e) { sonuc.hata.push({cid: '—', neden: 'Öğrenci verisi kaydedilemedi: ' + (e.message || e)}); } }
      T.calisiyor = false;
    }
    op.sayi = {ok: sonuc.ok.length, atla: sonuc.atla.length, hata: sonuc.hata.length};
    op.atla = sonuc.atla.slice(0, 300); op.hata = sonuc.hata.slice(0, 300);
    const G = V38.mem.ed.toplu51 = V38.mem.ed.toplu51 || []; G.unshift(op); if (G.length > 60) G.length = 60;
    V38.mem.ed.log.unshift({at: op.at, cid: 'toplu51:' + op.id, t: `${D.ad} (${op.sayi.ok} kayıt)`, a: 'Toplu işlem', n: not || '', vid: ''});
    await ED.save(); kirli = false;
    sonuc.ok.forEach((cid) => T.set.delete(cid));
    T.son = {op, sonuc};
    if (view === 'editor') V38.edView();
    T.raporGoster(op, sonuc);
    return {op, sonuc};
  };
  const etiket = (cid) => { const [c, id] = V38.edSplit(cid), r = ED.R(c, id); return r ? esc(String(ED.title(c, r)).slice(0, 80)) : esc(cid); };
  T.raporGoster = function (op, s) {
    UI.modal({title: 'Toplu işlem tamamlandı', body: () => `<div class="v38-cf tp51-rp"><p><b>${esc(op.ad)}</b></p><ul class="tp51-say"><li class="ok"><b>${s.ok.length}</b> başarılı</li><li class="at"><b>${s.atla.length}</b> atlandı</li><li class="ht"><b>${s.hata.length}</b> başarısız</li></ul>
${s.hata.length ? `<details open><summary>Başarısız kayıtlar</summary><ul>${s.hata.slice(0, 50).map((x) => `<li>${etiket(x.cid)} — ${esc(x.neden)}</li>`).join('')}</ul></details>` : ''}
${s.atla.length ? `<details><summary>Atlanan kayıtlar</summary><ul>${s.atla.slice(0, 50).map((x) => `<li>${etiket(x.cid)} — ${esc(x.neden)}</li>`).join('')}</ul></details>` : ''}
<p class="small mut">Her kaydın geçmişine ayrı işlendi (toplu işlem ${esc(op.id)}). ${s.ok.length ? 'Bu işlemi Toplu işlem geçmişinden geri alabilirsin.' : ''}</p></div>`,
      footer: () => `${s.ok.length ? `<button type="button" onclick="UI.close();setTimeout(()=>V51.Toplu.geriAl('${op.id}'),200)">Geri al</button>` : ''}<button type="button" class="p" onclick="UI.close()">Tamam</button>`});
  };

  /* ---------- 6. geri alma (kayıt bazında) ---------- */
  T.geriAl = function (opId, onaysiz) {
    if (!V38.edOk()) { UI.toast('Bu işlem editör yetkisi gerektirir.'); return; }
    const op = (V38.mem.ed.toplu51 || []).find((x) => x.id === opId); if (!op) return;
    if (op.geriAlindi) { UI.toast('Bu işlem zaten geri alındı.'); return; }
    const yap = async () => {
      const save0 = ED.save; ED.save = () => Promise.resolve(true); const toast0 = UI.toast; UI.toast = () => {};
      const st0 = Store.save; let stKirli = false; Store.save = function () { stKirli = true; };
      let ok = 0; const hata = [];
      try {
        for (const k of op.kayit) {
          const [c, id] = V38.edSplit(k.cid), r = ED.R(c, id), it = ED.it(c, id), o = k.once || {state: 'bekliyor', approved: null, kaynakOk: false, kaynakNot: '', kuyrukDisi51: null, yayinda: false};
          try {
            if (!r || !it) throw new Error('Kayıt bulunamadı');
            if (op.is === 'yayimla') { if (it.published) ED.unpublish(c, id, 'Toplu yayımlama geri alındı'); }
            else if (op.is === 'yayindanKaldir') { if (!it.published && !ED.publish(c, id, 'Toplu yayından kaldırma geri alındı')) throw new Error(ED.canPublish(c, id) || 'Yeniden yayımlanamadı'); }
            else if (op.is === 'arsiv' || op.is === 'kuyruga') { if (o.kuyrukDisi51) it.kuyrukDisi51 = o.kuyrukDisi51; else delete it.kuyrukDisi51; ED.hist(it, 'Toplu işlem geri alındı: ' + op.ad, ''); }
            else if (op.is === 'kaynak') { it.kaynakOk = o.kaynakOk; it.kaynakNot = o.kaynakNot; ED.hist(it, 'Toplu işlem geri alındı: ' + op.ad, ''); }
            else {
              if (it.published && !o.yayinda) ED.unpublish(c, id, 'Toplu işlem geri alındı', true);
              it.state = o.state || 'bekliyor'; it.approved = o.approved || null; ED.hist(it, 'Toplu işlem geri alındı: ' + op.ad, '');
              if (o.yayinda && !it.published && it.state === 'onay') ED.publish(c, id, 'Toplu işlem geri alındı');
            }
            const h = it.history[it.history.length - 1]; if (h) h.toplu51 = op.id + '-geri';
            k.durum = 'geri'; ok++;
          } catch (e) { hata.push(etiket(k.cid) + ' — ' + (e.message || e)); }
        }
      } finally { ED.save = save0; UI.toast = toast0; Store.save = st0; if (stKirli) { try { Store.save(); } catch (e) {} } }
      op.geriAlindi = {at: V38.now(), ok, hata: hata.length};
      V38.mem.ed.log.unshift({at: V38.now(), cid: 'toplu51:' + op.id, t: `${op.ad} geri alındı (${ok} kayıt)`, a: 'Toplu işlem geri alındı', n: '', vid: ''});
      await ED.save();
      if (view === 'editor') V38.edView();
      UI.toast(`Geri alındı: ${ok} kayıt${hata.length ? ` · ${hata.length} kayıt geri alınamadı` : ''}.`);
      return {ok, hata};
    };
    if (onaysiz) return yap();
    V38.confirm({title: 'Toplu işlemi geri al', text: `<b>${esc(op.ad)}</b> (${op.kayit.length} kayıt) geri alınacak. Her kaydın geçmişine “geri alındı” satırı eklenir; geçmiş silinmez.`, ok: 'Geri al', onOk: () => yap()});
  };
  T.gecmisHTML = function () {
    const G = V38.mem.ed.toplu51 || [];
    return `${V38.edHead('Toplu işlem geçmişi', 'Son 60 toplu işlem · kayıt bazında geri alma', "V38.edGo({k:'',cid:'',mode:''})")}
${G.length ? `<ul class="tp51-gc">${G.map((op) => `<li class="ed38-info"><div><b>${esc(op.ad)}</b><small>${esc(V38.fmt(op.at))} · ${esc((ED.CAT.find((x) => x[0] === op.kat) || ['', op.kat])[1])}</small></div>
<p class="small">${op.sayi.ok} başarılı · ${op.sayi.atla} atlandı · ${op.sayi.hata} başarısız${op.not ? ` · “${esc(op.not.slice(0, 120))}”` : ''}</p>
${op.geriAlindi ? `<p class="small mut">Geri alındı: ${esc(V38.fmt(op.geriAlindi.at))} (${op.geriAlindi.ok} kayıt)</p>` : op.kayit.length ? `<button type="button" class="v38-b" onclick="V51.Toplu.geriAl('${op.id}')">Geri al</button>` : ''}</li>`).join('')}</ul>` : '<p class="v38-empty">Henüz toplu işlem yapılmadı.</p>'}`;
  };

  /* ---------- 7. işlem çubuğu uzun listede üst çubuğun hemen altında görünür kalır ---------- */
  const d0 = draw;
  draw = function () {
    const r = d0.apply(this, arguments);
    try { if (view === 'editor') { const hd = document.querySelector('header.top'), p = hd && getComputedStyle(hd).position, u = hd && (p === 'fixed' || p === 'sticky') ? Math.max(0, Math.round(hd.getBoundingClientRect().bottom)) : 0; document.documentElement.style.setProperty('--tp51-ust', u + 'px'); } } catch (e) {}
    return r;
  };
})();
