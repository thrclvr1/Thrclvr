/* ===================== V44.0: roller ve yetki, içerik açma, öğretmen paneli, seçim ekranı =====================
   1. Merkezi yetki (V44.Yetki): roller öğrenci / öğretmen / editör; varsayılan RED; eylem tablosu tek yerde.
      Sağlayıcı şimdilik “yerel-prototip” (PIN + sessionStorage). Bu GERÇEK GÜVENLİK DEĞİLDİR: tek HTML dosyasında
      her kod istemcide çalışır. Sunucuya geçişte V44.Yetki.kullan({roller}) ile sağlayıcı değiştirilir; kritik kontroller
      sunucuda yapılmalıdır.
   2. Yönlendirme yarışı: panel kapanırken tarayıcı geçmişinde bekleyen “geri” adımı, hemen ardından yapılan go() kaydını
      siliyordu (“İçeriği aç” bazen/çok konulu kazanımda hiç açılmıyordu). go() artık bu adım bitene kadar bekler.
   3. Ortak içerik açma: V44.icerikAc(konu, sekme) — kaydı doğrular, içerik durumunu denetler, paneli güvenle kapatır,
      tek yönlendirme yapar; içerik yoksa açık uyarı verir.
   4. Öğretmen paneli: ana ekranda altı bölüm. Diğer modüllerin kodu ve verisi silinmez.
   5. Seçim ekranı: arkadaki sayfa seçim ekranı açıkken gizlenir (mobil adres çubuğu kayarken görünmesin); amblem.
   Yeni kalıcı anahtar yok. */
window.V44 = window.V44 || {};
(function () {
  const $id = (i) => document.getElementById(i);

  /* ---------- 1. Roller ve yetki ---------- */
  V44.ROLLER = {ogrenci: 'Öğrenci', ogretmen: 'Öğretmen', editor: 'Yönetici / Editör'};
  // eylem → izinli roller. Tabloda olmayan eylem REDDEDİLİR.
  V44.IZIN = {
    'ogren': ['ogrenci', 'ogretmen', 'editor'], 'oyna': ['ogrenci', 'ogretmen', 'editor'], 'ilerleme': ['ogrenci', 'ogretmen', 'editor'],
    'ogretmen.panel': ['ogretmen'], 'kazanim': ['ogretmen'], 'ders.plani': ['ogretmen'], 'ogretmen.ara': ['ogretmen'], 'son.islemler': ['ogretmen'],
    'ogretmen.veri': ['ogretmen'], 'ogretmen.ayar': ['ogretmen'],
    'editor.alan': ['editor'], 'icerik.duzenle': ['editor'], 'kaynak.dogrula': ['editor'], 'kazanim.eslestir': ['editor'], 'icerik.onayla': ['editor'],
    'icerik.yayinla': ['editor'], 'icerik.geri.cek': ['editor'], 'surum.gecmisi': ['editor'], 'veri.yonetimi': ['editor']
  };
  V44.ROTA = {ogretmen: 'ogretmen.panel', editor: 'editor.alan', admin: 'veri.yonetimi'};
  V44.Yetki = (function () {
    let P = {ad: 'yerel-prototip', roller: () => { const r = ['ogrenci']; try { if (V36.ok()) r.push('ogretmen'); } catch (e) {} try { if (V38.edOk()) r.push('editor'); } catch (e) {} return r; }};
    return {
      saglayici: () => P.ad,
      kullan(p) { if (p && typeof p.roller === 'function') P = p; },
      roller() { try { const r = P.roller(); return Array.isArray(r) ? r : ['ogrenci']; } catch (e) { return ['ogrenci']; } },
      izin(eylem) { const L = V44.IZIN[eylem]; if (!L) return false; const R = this.roller(); return L.some((x) => R.includes(x)); }
    };
  })();
  // Veri yönetimi (eski “Yönetim” ekranı: içerik verisi düzenleme) yalnız editör rolüyle. Öğretmen ve editör rotaları kendi PIN kapılarıyla korunuyor.
  if (typeof admin === 'function') {
    const a0 = admin;
    admin = function () {
      if (!V44.Yetki.izin('veri.yonetimi')) {
        $.innerHTML = `<section class="hero slim"><p class="eyebrow">Yetki gerekli</p><h1>Veri yönetimi</h1><p class="lead">Bu alan içerik verisini değiştirir; yalnızca yönetici/editör rolüyle açılır.</p></section>
<div class="card"><p>Editör girişi yapmadan bu ekran gösterilmez. Not: Bu çevrimdışı sürümdeki PIN, cihaz üzerinde basit bir erişim ayrımıdır; gerçek güvenlik sunucu tarafında sağlanmalıdır.</p><div class="row"><button class="p" onclick="go('editor')">Editör girişi</button><button onclick="go('home')">Ana sayfa</button></div></div>`;
        return;
      }
      return a0.apply(this, arguments);
    };
  }
  // Rol işaretleri: öğrenci ekranlarında yönetim araçları gösterilmez
  V44.rolIsaretle = function () {
    const R = V44.Yetki.roller(), b = document.body; if (!b) return;
    const og = R.includes('ogretmen'), ed = R.includes('editor');
    if (b.hasAttribute('data-r44-ogretmen') !== og) b.toggleAttribute('data-r44-ogretmen', og);
    if (b.hasAttribute('data-r44-editor') !== ed) b.toggleAttribute('data-r44-editor', ed);
  };
  if (typeof OGRT !== 'undefined' && OGRT.homeCard) { OGRT._homeCard43 = OGRT.homeCard; OGRT.homeCard = function () {}; }
  // Rol girişi: öğretmen ve editör girişleri ayrı; öğrenci ekranında yalnız bu giriş bağlantısı bulunur (araç değil)
  V44.giris = function () {
    UI.sheet({title: 'Öğretmen / editör girişi', body: () => `<div class="g44">
<p class="small">Öğrenci olarak giriş gerekmez. Öğretmen ve editör alanları ayrı PIN ile açılır.</p>
<button type="button" class="g44-b" onclick="UI.close();go('ogretmen')"><b>Öğretmen girişi</b><small>Kazanımlar, hızlı arama, son işlemler, veri, ayarlar</small></button>
<button type="button" class="g44-b" onclick="UI.close();go('editor')"><b>Yönetici / editör girişi</b><small>İçerik onayı, kaynak doğrulama, eşleştirme, yayımlama, sürüm geçmişi</small></button>
<p class="small mut">Bu sürümdeki PIN yalnızca bu cihazda basit bir erişim ayrımıdır; gerçek kullanıcı hesabı ve güvenlik sunucu gerektirir.</p></div>`, footer: () => '<button onclick="UI.close()">Kapat</button>'});
  };
  // Premium profil: “Öğretmen Paneli” aracı yerine giriş bağlantısı
  if (typeof V40 !== 'undefined' && V40.profil) {
    const p0 = V40.profil;
    V40.profil = function () { const r = p0.apply(this, arguments); try { const L = UI._stack[UI._stack.length - 1]; if (L && L.o) { const ob = L.o.body; L.o.body = (...a) => { const h = typeof ob === 'function' ? ob(...a) : ob; return h.replace(/<button onclick="UI\.close\(\);setTimeout\(\(\)=>go\('ogretmen'\),220\)">[\s\S]*?<\/button>/, '<button onclick="UI.close();setTimeout(V44.giris,240)">' + V39.svg('teach', 20) + '<span>Öğretmen / editör girişi</span><small>Yönetim alanları ayrı PIN ile açılır</small></button>'); }; L.refresh(); } } catch (e) {} return r; };
  }
  // Klasik ayarlar: giriş bağlantısı
  if (typeof V30 !== 'undefined' && V30.settings) {
    const s0 = V30.settings;
    V30.settings = function () { const r = s0.apply(this, arguments); try { const L = UI._stack[UI._stack.length - 1]; if (L && L.o) { const ob = L.o.body; L.o.body = (...a) => (typeof ob === 'function' ? ob(...a) : ob) + '<div class="g44-ay"><button type="button" onclick="UI.close();setTimeout(V44.giris,240)">Öğretmen / editör girişi</button></div>'; L.refresh(); } } catch (e) {} return r; };
  }

  /* ---------- 2. Yönlendirme yarışı (panel kapanırken bekleyen “geri” adımı) ---------- */
  V44.sonra = function (fn) {
    if (typeof V29 !== 'undefined' && V29._skip) { V44._bek = fn; clearTimeout(V44._bekT); V44._bekT = setTimeout(() => { const f = V44._bek; V44._bek = null; if (f) f(); }, 600); }
    else fn();
  };
  const go0 = go;
  go = function (v, a) { const self = this; if (typeof V29 !== 'undefined' && V29._skip) { V44.sonra(() => go0.call(self, v, a)); return; } return go0.apply(this, arguments); };
  addEventListener('popstate', () => { if (V44._bek) { const f = V44._bek; V44._bek = null; clearTimeout(V44._bekT); setTimeout(f, 0); } });

  /* ---------- 3. Ortak içerik açma ---------- */
  V44.icerikDurum = function (t) {
    if (!t) return {ok: false, kod: 'yok', neden: 'Konu kaydı bulunamadı.'};
    if (!vis(t)) return {ok: false, kod: 'gizli', neden: 'Bu konu yayında değil (arşivlenmiş ya da önizleme kapalı).'};
    const s = t.sections;
    if (!s || typeof s !== 'object' || !Object.keys(s).length) return {ok: false, kod: 'bos', neden: 'Bu konunun içeriği henüz hazırlanmadı. Ders kitabında veri bulunmuyor.'};
    const anl = Array.isArray(s.anlatim) && s.anlatim.length > 0;
    return {ok: true, taslak: t.status !== 'published', anlatim: anl, etiket: t.status === 'published' ? 'Yayında' : 'Taslak · editör onayı bekliyor'};
  };
  V44.icerikAc = function (tid, tab) {
    const t = Store.get('topics', tid), d = V44.icerikDurum(t);
    const ac = () => {
      if (!d.ok) {
        UI.sheet({title: t ? t.title : 'İçerik', body: () => `<p>${esc(d.neden)}</p>${t && d.kod === 'bos' ? '<p class="small mut">Konu sayfasında kaynak bağlantıları ve kitap sayfası gösterilebilir.</p>' : ''}`,
          footer: () => (t && d.kod === 'bos' ? `<button onclick="UI.close();go('topic',{t:'${t.id}',tab:''})">Konu sayfasını aç</button>` : '') + '<button class="p" onclick="UI.close()">Tamam</button>'});
        return;
      }
      const sk = d.anlatim ? (tab || 'anlat') : '';
      go('topic', {t: t.id, tab: sk});
    };
    if (UI._stack && UI._stack.length) UI.close();
    V44.sonra(ac);
    return d.ok;
  };
  if (typeof OGRT !== 'undefined') {
    const W = OGRT.W;
    if (W && W.content) {
      W.content = function (oid) {
        const T = OGRT.topicsOf(oid); if (!T.length) { UI.toast('Bu kazanıma bağlı içerik yok.'); return; }
        if (T.length === 1) return V44.icerikAc(T[0].id, 'anlat');
        UI.sheet({title: 'İçeriği aç', body: () => `<p class="small">Bu kazanım birden fazla konuyla ilişkili:</p>${T.map((t) => { const d = V44.icerikDurum(t); return `<button type="button" class="og-tb ${d.ok ? 'p' : ''}" onclick="V44.icerikAc('${t.id}','anlat')">${esc(t.title)}<small>${d.ok ? 'Öğrenci panelindeki içerik · ' + esc(d.etiket) : esc(d.neden)}</small></button>`; }).join('')}`, footer: () => '<button onclick="UI.close()">Kapat</button>'});
      };
    }
    if (OGRT.oRow) { const r0 = OGRT.oRow; OGRT.oRow = function () { return r0.apply(this, arguments).replace(/onclick="go\('topic',\{t:'([^']+)',tab:'([^']*)'\}\)"/g, `onclick="V44.icerikAc('$1','$2')"`); }; }
    /* ---------- 4. Öğretmen paneli: ana ekranda altı bölüm (Kazanımlar başta) ---------- */
    // Ana Panel yalnız altı bölüm kartı: “Bugün”, “Sınıflarım”, “Editör kısayolları”, “Son işlemler” özet kartları kaldırıldı (modüller ve verileri duruyor)
    if (OGRT.EXT && OGRT.EXT.genel) { const gn0 = OGRT.EXT.genel; OGRT.EXT.genel = function () { const h = gn0.apply(this, arguments), i = h.indexOf('<div class="v38-row2">'); return (i > 0 ? h.slice(0, i) + '</section>' : h).replace('<h2>Genel Bakış</h2>', '<h2>Ana Panel</h2><p class="mut small">Kazanımlar en önemli bölümdür. Diğer araçların kayıtları korunur.</p>'); }; }
    OGRT.SUB43 = OGRT.SUB;
    OGRT.SUB = [['genel', 'Ana Panel'], ['kaz', 'Kazanımlar'], ['ara', 'Hızlı Arama'], ['son', 'Son İşlemler'], ['yedek', 'Veri Yönetimi'], ['ayar', 'Ayarlar'], ['editor', 'Editör Onayı']];
    if (typeof V38 !== 'undefined' && V38.SUBD) { V38.SUBD.kaz = 'Program sırasıyla kazanımlar, durumlar, haftalık plan ve ders hazırlama'; V38.SUBD.editor = 'Onay, kaynak kontrolü, eşleşmeler (ayrı editör PIN’i)'; }
  }

  /* ---------- 5. Seçim ekranı: amblem ve arka sayfayı gizleme ---------- */
  V42.motif = `<span class="o44-amb" aria-hidden="true"><i></i>${V39.emb(52)}<i></i></span>`;
  const sec0 = V39.secim;
  V39.secim = function (show) {
    const r = sec0.apply(this, arguments);
    try { const o = $id('uye39'); if (o && show) { const ogr = o.querySelector('.o42-ogr span'); if (ogr) ogr.textContent = 'Öğretmen girişi'; if (!o.querySelector('.o44-ed')) { const alt = o.querySelector('.o42-alt'); if (alt) alt.insertAdjacentHTML('beforeend', `<p class="o44-ed"><button type="button" class="o44-edb" onclick="V42.geriSonra(()=>{V39.secim(false);go('editor')})">Yönetici / editör girişi</button></p>`); } } } catch (e) {}
    return r;
  };

  /* ---------- draw ---------- */
  const d0 = draw;
  draw = function () { const r = d0.apply(this, arguments); V44.rolIsaretle(); return r; };
  try { V44.rolIsaretle(); if ($id('uye39')) V39.secim(true); } catch (e) { console.warn('[V44]', e); }
})();
