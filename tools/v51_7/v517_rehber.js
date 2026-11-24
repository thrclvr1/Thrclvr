/* ===================== V51.7: akıllı ilk kullanım rehberi, bölüm tanıtımları ve yardım merkezi =====================
   V51.Rehber — uygulamanın kullanımını kolaylaştırır; içerik, oyun, kayıt ya da gezinme değiştirmez.
   • İlk açılış tanıtımı ('genel', 4 adım) bir kez; Altın ('mod.altin') ve Elmas ('mod.elmas') mod rehberleri o moda
     ilk girişte bir kez (kendi renkleriyle).
   • Bölüm baloncukları: bir bölüme ilk girişte ilgili düğme/alan vurgulanır, yanında kısa açıklama çıkar.
     Öğrenci (Altın ve Elmas için ayrı), öğretmen (yalnız öğretmen oturumunda) ve editör (yalnız editör oturumunda).
   • Her rehber için durum: tamam (Anladım/bitti) · atlandi (Kapat/Atla) · kapali (Bir daha gösterme) ·
     tekrar (Bana tekrar göster → bir sonraki girişte yeniden çıkar). Bir rehberin durumu diğerlerini etkilemez.
   • Kayıt YALNIZ localStorage 'dk-rehber517' = {v:1, otomatik:true|false, r:{<id>:{d, n, t}}}; ilerleme anahtarlarıyla
     karışmaz. “Tüm rehberleri yeniden başlat” yalnız bu anahtarı sıfırlar.
   • Kullanım Rehberi merkezi: Profilim kartı ve öğretmen/editör üst çubuğundaki “Rehber” düğmesi (alt pencere).
   • Hata olursa sessizce devre dışı kalır; uygulama normal çalışır. Harici kütüphane ve görsel yok (çevrimdışı). */
(function () {
  'use strict';
  const V51 = window.V51 || (window.V51 = {});
  const R = V51.Rehber = {};
  const KEY = 'dk-rehber517';
  const e = (s) => (typeof esc === 'function' ? esc(String(s == null ? '' : s)) : String(s == null ? '' : s));
  const gor = (el) => { if (!el || !el.isConnected) return false; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity !== 0; };

  /* ---------- 1. kayıt ---------- */
  R.oku = function () { try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && o.v === 1) { o.r = o.r || {}; return o; } } catch (x) {} return {v: 1, otomatik: true, r: {}}; };
  R.yaz = function (o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (x) {} };
  R.durum = (id) => (R.oku().r[id] || {}).d || '';
  R.isaretle = function (id, d) { const o = R.oku(), x = o.r[id] || {n: 0}; x.d = d; x.n = (x.n || 0) + (d === 'tekrar' ? 0 : 1); x.t = new Date().toISOString(); o.r[id] = x; R.yaz(o); };
  R.uygun = function (id) { const o = R.oku(); if (o.otomatik === false) return false; const x = o.r[id]; return !x || x.d === 'tekrar'; };
  R.sifirla = function () { R.yaz({v: 1, otomatik: true, r: {}}); };

  /* ---------- 2. bağlam ---------- */
  const ogrOk = () => { try { return V36.ok(); } catch (x) { return false; } };
  const edOk = () => { try { return typeof V38 !== 'undefined' && V38.edOk(); } catch (x) { return false; } };
  const kip = () => { try { return V51.Gorunum.kip(); } catch (x) { return 'ogrenci'; } };
  R.mod = () => { try { const a = V50.Mod.aktif(); if (a === 'altin' || a === 'elmas') return a; } catch (x) {} return (typeof V39 !== 'undefined' && V39.on) ? 'altin' : 'elmas'; };
  const engel = () => {
    if (document.getElementById('rh517-m')) return true;
    const u = document.getElementById('uye39'); if (u && gor(u)) return true;
    const bt = document.getElementById('boot36'); if (bt && gor(bt)) return true;
    return false;
  };

  /* ---------- 3. içerik ---------- */
  const IK = {
    kitap: '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><path d="M8 14c8-4 16-4 24 2v36c-8-6-16-6-24-2z" fill="currentColor" opacity=".25"/><path d="M56 14c-8-4-16-4-24 2v36c8-6 16-6 24-2z" fill="currentColor" opacity=".45"/><path d="M8 14c8-4 16-4 24 2 8-6 16-6 24-2v36c-8-4-16-4-24 2-8-6-16-6-24-2z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>',
    yol: '<svg viewBox="0 0 120 40" width="150" height="50" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="8" width="30" height="24" rx="6"/><rect x="45" y="8" width="30" height="24" rx="6"/><rect x="88" y="8" width="30" height="24" rx="6"/><path d="M33 20h10M76 20h10" stroke-linecap="round"/></g><g fill="currentColor" font-size="9" font-family="sans-serif" text-anchor="middle"><text x="17" y="23">Sınıf</text><text x="60" y="23">Ünite</text><text x="103" y="23">Konu</text></g></svg>',
    grafik: '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><path d="M8 54h48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><rect x="12" y="34" width="9" height="18" rx="2" fill="currentColor" opacity=".35"/><rect x="27" y="24" width="9" height="28" rx="2" fill="currentColor" opacity=".55"/><rect x="42" y="12" width="9" height="40" rx="2" fill="currentColor" opacity=".8"/></svg>',
    ara: '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="27" cy="27" r="15" fill="none" stroke="currentColor" stroke-width="3"/><path d="M38 38l14 14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
    oyun: '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><rect x="6" y="18" width="52" height="30" rx="14" fill="none" stroke="currentColor" stroke-width="3"/><path d="M20 27v12M14 33h12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="42" cy="30" r="3" fill="currentColor"/><circle cx="48" cy="37" r="3" fill="currentColor"/></svg>'
  };
  const amb = (k, n) => { try { return V50.Mod.amblem(k, n || 54); } catch (x) { return IK.kitap; } };
  R.TANITIM = {
    'genel': {ad: 'Uygulamayı tanı', tema: 'genel', adim: [
      {b: 'DKAB Öğrenme Platformu', m: '4–12. sınıf Din Kültürü ve Ahlak Bilgisi: konu anlatımları, sorular, bilgi kartları ve oyunlar tek yerde. İnternet olmadan da çalışır.', g: () => IK.kitap},
      {b: 'İki öğrenme alanı', m: 'Elmas Sınıfı sade ve hızlıdır; Altın Sınıfı 3B koridor ve oyun dünyasıyla öğretir. İlerlemen ikisinde ortaktır; Mod düğmesiyle istediğin zaman geçersin.', g: () => `<span class="rh517-iki">${amb('elmas', 50)}${amb('altin', 50)}</span>`},
      {b: 'Derslere ulaşmak', m: 'Derslerim’den sınıfını, sonra üniteyi ve konuyu seç. Konu ekranında anlatım, mini test, bilgi kartları ve oyunlar bulunur.', g: () => IK.yol},
      {b: 'İlerlemeni takip et', m: 'Çalışmam’da günlük hedefini ve tekrarlarını, Profilim’de ilerlemeni görürsün. Bu rehbere Profilim › Kullanım Rehberi’nden yeniden ulaşabilirsin.', g: () => IK.grafik}
    ]},
    'mod.elmas': {ad: 'Elmas Sınıfı rehberi', tema: 'elmas', adim: [
      {b: 'Elmas Öğrenme Alanı', m: 'Sınıflar, üniteler ve konular sade bir liste düzeninde; hızlı ve dikkat dağıtmayan çalışma için.', g: () => amb('elmas', 58)},
      {b: 'Sınıflar ve üniteler', m: 'Alttaki Derslerim’den sınıfını seç. Ünite kartlarındaki konu satırına dokunarak konuyu aç.', g: () => IK.yol},
      {b: 'Konu anlatımı', m: 'Konu ekranında Öğren, Pekiştir ve Kendini Dene bölümleri var. Konunun sonunda önceki ya da sonraki konuya geçebilirsin.', g: () => IK.kitap},
      {b: 'Kapsamlı arama', m: 'Üstteki büyüteçle konu, ünite, kavram, kişi ve eser, soru ve bilgi kartı arayabilir; sonuçları sınıfa göre süzebilirsin.', g: () => IK.ara},
      {b: 'Oyunlar', m: 'Elmas’ta oyunlar Oyunlar bölümündeki Etkinlik Oyunları’ndadır (eşleştirme, doğru cevabı bul, gruplandırma…). 3B Oyun Dünyası Altın Sınıfı’na özeldir; Elmas’ta yalnız tanıtım kartı vardır.', g: () => IK.oyun},
      {b: 'Çalışma ve ilerleme', m: 'Çalışmam’da günlük hedefin, tekrar kartların ve kaldığın konu; Profilim’de ilerlemen ve rehber ayarların.', g: () => IK.grafik}
    ]},
    'mod.altin': {ad: 'Altın Sınıfı rehberi', tema: 'altin', adim: [
      {b: 'Altın Öğrenme Alanı', m: 'Sınıf kapılarının bulunduğu 3B bir koridorda gezerek öğrenirsin; oyunlaştırılmış, görsel bir alan.', g: () => amb('altin', 58)},
      {b: 'Sınıflar ve üniteler', m: 'Koridorda ilerle ve sınıf kapısına dokun. Sınıf merkezinde üniteleri, ünitede konuları açarsın.', g: () => IK.yol},
      {b: 'Konu anlatımı', m: 'Ders ekranında Öğren, Pekiştir ve Kendini Dene bölümleri var; yıldızla konuyu favorilere eklersin. Konu sonunda önceki/sonraki konuya geçersin.', g: () => IK.kitap},
      {b: 'Arama', m: 'Büyüteç; konu, ünite, kavram, kişi ve eser, soru ve bilgi kartlarını bulur. Her sınıfta Altın’da seçtiğin programda arar.', g: () => IK.ara},
      {b: 'Altın’a özel oyunlar', m: 'Oyunlar › Oyun Dünyası: Kayıp Bilgeliğin Kütüphanesi, sınıf dünyaları, Zamanın İzinde ve Bilgi Laboratuvarı. Bunlar yalnız Altın Sınıfı’ndadır.', g: () => IK.oyun},
      {b: 'Etkinlik Oyunları', m: 'Oyun Dünyası’ndaki “Etkinlik oyunları” kartıyla Elmas’taki etkinlik oyunlarının aynısını Altın tasarımında oynarsın.', g: () => IK.oyun},
      {b: 'Çalışma ve ilerleme', m: 'Çalışmam’da günlük hedefin ve tekrarların; üst çubuktaki İlerlemem’de sınıf sınıf ilerlemen.', g: () => IK.grafik}
    ]}
  };
  // bölüm baloncukları: adım = {s:[seçiciler], t:/metin/ (isteğe bağlı), m:'açıklama'}; görünür hedef yoksa adım atlanır
  const NAV_E = (k) => [`nav.bnav button[data-k="${k}"]`];
  const NAV_A = (k, rx) => [{s: '.ust40 .nv40 button', t: rx}, `#bn50 [data-k="${k}"]`];
  const ORTAK = {
    konu: (A) => [
      {s: ['#app .seg46'], m: 'Öğren: anlatım ve özet. Pekiştir: kartlar, tablo ve kodlama. Kendini Dene: mini test ve oyunlar.'},
      A ? {s: ['#app .fav40'], m: 'Yıldıza dokunarak konuyu favorilerine ekle.'} : null,
      {s: ['#app .b48-ib'], m: 'İçerikte bir hata görürsen buradan bildirebilirsin.'},
      {s: ['#app .kg513'], m: 'Konunun sonunda önceki ya da sonraki konuya geçebilirsin.'}].filter(Boolean),
    test: [{s: ['#app .mt-modes', '#app [onclick^="MT.start"]'], m: 'Mini testi buradan başlat. Her sorudan sonra doğru cevabı ve açıklamasını görürsün.'}],
    kart: [{s: ['#app .fx-card'], m: 'Karta dokununca arka yüzü (cevap) açılır.'}, {s: ['#app .fx-rate3'], m: 'Ne kadar bildiğini işaretle; kartların tekrar sırası buna göre ayarlanır.'}],
    calis: [{s: ['#app .c48-ust', '#app .c48-hd'], m: 'Çalışma Merkezim: günlük hedefin ve çalışma serin burada.'}, {s: ['#app .c48-sg'], m: 'Tekrar kartlarına ve çalışma kısayollarına buradan ulaşırsın.'}],
    profil: [{s: ['#app .rh517-prof'], m: 'Kullanım Rehberi: rehberleri buradan yeniden açabilir, tercihleri sıfırlayabilirsin.'}, {s: ['#app .md50-p', '#app .mk50'], m: 'Öğrenme modunu buradan da değiştirebilirsin.'}]
  };
  R.BOLUM = {
    // Elmas
    'elmas.ana': {ad: 'Ana sayfa', adim: [
      {s: ['header.top [data-v30s]', 'header.top .iconbtn[aria-label="Ara"]'], m: 'Buradan konu, kavram ve soru arayabilirsin.'},
      {s: NAV_E('classes'), m: 'Derslerim: sınıfını seçerek ünite ve konulara ulaşabilirsin.'},
      {s: NAV_E('games'), m: 'Oyunlar: öğrendiklerini oyunlarla pekiştirebilirsin.'},
      {s: NAV_E('calis'), m: 'Çalışmam: çözdüğün soruları ve ilerlemeni burada takip edebilirsin.'},
      {s: NAV_E('profil'), m: 'Profilim: kişisel tercihlerini ve rehber ayarlarını buradan yönetebilirsin.'},
      {s: ['#dg42k', 'header.top .md50'], m: 'Mod: Elmas ile Altın arasında geçiş. İlerlemen iki modda ortaktır.'}]},
    'elmas.derslerim': {ad: 'Derslerim', adim: [{s: ['#app .gc3'], m: 'Sınıfını seç; o sınıfın üniteleri ve konuları açılır.'}]},
    'elmas.sinif': {ad: 'Sınıf ve üniteler', adim: [{s: ['#app .card.unit'], m: 'Her kart bir ünite. Ünitenin konuları kartın içinde listelenir.'}, {s: ['#app .trow'], m: 'Konuya dokunarak anlatımını aç.'}]},
    'elmas.arama': {ad: 'Arama', adim: [{s: ['#q2'], m: 'Konu, ünite, kavram, kişi, soru ya da kart adı yaz; sonuçlar yazdıkça gelir.'}, {s: ['#app .v-chips'], m: 'Sonuçları sınıfa göre süzebilirsin.'}]},
    'elmas.konu': {ad: 'Konu anlatımı', adim: ORTAK.konu(false)},
    'elmas.test': {ad: 'Sorular ve mini test', adim: ORTAK.test},
    'elmas.kart': {ad: 'Bilgi kartları', adim: ORTAK.kart},
    'elmas.oyun': {ad: 'Oyunlar', adim: [{s: ['#app .gh-types'], m: 'Etkinlik Oyunları: bir oyun türü seç (eşleştirme, doğru cevabı bul, gruplandırma…).'}, {s: ['#app .g46-dunya'], m: '3B Oyun Dünyası Altın Sınıfı’na özeldir; buradan tanıtımı ve Altın’a geçiş onayı açılır.'}]},
    'elmas.calis': {ad: 'Çalışmam', adim: ORTAK.calis},
    'elmas.profil': {ad: 'Profilim', adim: ORTAK.profil},
    // Altın
    'altin.ana': {ad: 'Koridor', adim: [
      {s: ['.ust40 .ib40'], m: 'Buradan konu, kavram ve soru arayabilirsin.'},
      {s: NAV_A('sinif', /Derslerim/), m: 'Derslerim: sınıfını seçerek ünite ve konulara ulaşabilirsin.'},
      {s: NAV_A('oyun', /Oyunlar/), m: 'Oyunlar: Oyun Dünyası ve Etkinlik Oyunları burada.'},
      {s: NAV_A('calis', /Çalışmam/), m: 'Çalışmam: çözdüğün soruları ve ilerlemeni burada takip edebilirsin.'},
      {s: NAV_A('profil', /Profilim/), m: 'Profilim: kişisel tercihlerini ve rehber ayarlarını buradan yönetebilirsin.'},
      {s: ['.alt40 .yon40', '.yon40'], m: 'Koridorda ilerlemek için okları kullan ya da kaydır; sınıf kapısına dokunarak sınıfa gir.'},
      {s: ['.ust40 .md50'], m: 'Mod: Altın ile Elmas arasında geçiş. İlerlemen iki modda ortaktır.'}]},
    'altin.derslerim': {ad: 'Sınıf merkezi', adim: [{s: ['#app .p39-ug', '#app .p39-un'], m: 'Ünitelere dokunarak konularını aç.'}, {s: ['#app .p39-prg'], m: 'Bu sınıf için programı (2018 ya da 2026) buradan seçersin.'}, {s: ['#app .p39-top .p39-ib[aria-label="İlerlemem"]'], m: 'İlerlemem: sınıf sınıf ilerlemeni gösterir.'}]},
    'altin.unite': {ad: 'Ünite', adim: [{s: ['#app .p39-tc'], m: 'Her kart bir konu; “Konuyu aç” ile ders ekranına geç.'}]},
    'altin.arama': {ad: 'Arama', ust: true, adim: [{s: ['#p39q'], m: 'Konu, kavram, kişi, soru ya da kart adı yaz; sonuçlar türlerine göre gruplanır.'}]},
    'altin.konu': {ad: 'Konu anlatımı', adim: ORTAK.konu(true)},
    'altin.test': {ad: 'Sorular ve mini test', adim: ORTAK.test},
    'altin.kart': {ad: 'Bilgi kartları', adim: ORTAK.kart},
    'altin.oyun': {ad: 'Oyun Dünyası', adim: [{s: ['#app .p39-top', '#app .p39-cr'], m: 'Oyun Dünyası: Altın’a özel 3B ve hibrit oyunlar (Kütüphane, sınıf dünyaları, Zamanın İzinde, Bilgi Laboratuvarı) bu ekranda.'}, {s: [{s: '#app button', t: /Etkinlik oyunlarına git/}], m: 'Etkinlik Oyunları: Elmas’takiyle aynı oyunlar, Altın tasarımında.'}]},
    'altin.etkinlik': {ad: 'Etkinlik oyunları', adim: [{s: ['#app .gh-types'], m: 'Bir oyun türü seç; oyunlar Altın tasarımında açılır.'}]},
    'altin.calis': {ad: 'Çalışmam', adim: ORTAK.calis},
    'altin.profil': {ad: 'Profilim', adim: ORTAK.profil},
    // Öğretmen
    'ogretmen.panel': {ad: 'Öğretmen paneli', rol: 'ogretmen', adim: [
      {s: ['#app .og-main'], m: 'Öğretmen paneli üç bölümdür: Haftalık plan, Sınıflarım ve Araçlar.'},
      {s: ['#app .rh517-yb'], m: 'Rehber: öğretmen rehberini buradan yeniden açabilirsin.'},
      {s: ['#app .og-top .md50'], m: 'Mod: öğrenci alanlarına geçiş.'},
      {s: ['#app .og-out'], m: 'Öğretmen modundan buradan çıkarsın.'}]},
    'ogretmen.hafta': {ad: 'Haftalık plan', rol: 'ogretmen', adim: [{s: ['#app .ogw-strip'], m: 'Haftalar yıllık plan Excel’inden gelir; bir haftaya dokunarak o haftanın kazanımlarını gör.'}, {s: ['#app .ogw-b'], m: '“İçeriği aç” konuyu öğretmen görünümünde, kazanım bilgileriyle açar.'}]},
    'ogretmen.sinif': {ad: 'Sınıflarım', rol: 'ogretmen', adim: [{s: ['#app .og-cls', '#app .og-sec'], m: 'Sınıflarını ve programını (2018/2026) buradan ekle ve seç; haftalık plan bu sınıflara göre kurulur.'}]},
    'ogretmen.araclar': {ad: 'Araçlar', rol: 'ogretmen', adim: [{s: [{s: '#app .og-main [role=tab]', t: /Araçlar/}], m: 'Araçlar: Sorun Bildir bu bölümdedir.'}]},
    'ogretmen.hata': {ad: 'Hata Bildir', rol: 'ogretmen', adim: [{s: ['#app select', '#app .og-sec'], m: 'Sorunun olduğu bölümü seç ve kısaca anlat.'}, {s: [{s: '#app button', t: /Sorunu bildir/}], m: 'Gönder. Sunucu bağlı değilse bildirim bu cihazda kayıtlı kalır; “gönderildi” denmez.'}]},
    // Editör
    'editor.ana': {ad: 'Editör ana paneli', rol: 'editor', adim: [
      {s: ['#app .ed38-cat'], m: 'Kuyruklar: bekleyen, kaynak bekleyen, düzeltme, reddedilen, onaylanan… Bir kuyruğa dokunarak kayıtları incele.'},
      {s: ['#app [onclick*="yayin51"]'], m: 'Yayın durumu: öğrenciye gösterim kuralı ve sıkı yayın öncesi kontrol.'},
      {s: ['#app [onclick*="toplu51"]'], m: 'Toplu işlem geçmişi: yapılan toplu işlemler ve geri alma.'},
      {s: ['#app .rh517-yb'], m: 'Rehber: editör rehberini buradan yeniden açabilirsin.'}]},
    'editor.inceleme': {ad: 'İçerik inceleme', rol: 'editor', adim: [{s: ['#app .ed38-row'], m: 'Bir kayda dokunarak içeriğini, kaynaklarını ve önceki sürümle farkını incele.'}]},
    'editor.toplu': {ad: 'Toplu işlemler', rol: 'editor', adim: [{s: ['#app .tp51-ust', '#app .tp51'], m: 'Kayıtları işaretle ya da “Tümünü seç”; seçim yalnız bu kuyrukta geçerlidir.'}, {s: ['#app .tp51-is'], m: 'Seçilenleri onayla, reddet (gerekçeyle), düzeltmeye gönder (notla) veya kuyruktan kaldır. Önce kontrol ve özet gösterilir; işlem geri alınabilir.'}]},
    'editor.kaynak': {ad: 'Kaynak ve doğrulama bilgileri', rol: 'editor', adim: [{s: [{s: '#app .ed38-box', t: /^\s*C\. Kaynak/}], m: 'Kaynak bilgileri: kaynak kayıtları, kitap sayfaları ve doğrulama uyarıları burada.'}, {s: [{s: '#app .ed38-box', t: /^\s*D\. Karşılaştırma/}], m: 'Karşılaştırma: önceki sürümle farkı gösterir.'}]},
    'editor.onay': {ad: 'Onaylama ve düzeltmeye gönderme', rol: 'editor', adim: [{s: [{s: '#app .v38-b', t: /^Onayla$/}], m: 'Onayla: içerik onaylanır. Onay, yayın değildir.'}, {s: [{s: '#app .v38-b', t: /Düzeltme bekliyor/}], m: 'Düzeltmeye gönder: kayıt düzeltme kuyruğuna gider.'}, {s: [{s: '#app .v38-b', t: /^Reddet$/}], m: 'Reddet: kayıt öğrenciye gösterilmez.'}]},
    'editor.yayin': {ad: 'Yayınlama ve yayından kaldırma', rol: 'editor', adim: [{s: [{s: '#app h2', t: /Öğrenciye gösterim kuralı/}], m: 'Öğrenciye hangi kayıtların gösterileceği buradaki kurala bağlıdır.'}, {s: [{s: '#app h2', t: /Sıkı yayın öncesi kontrol/}], m: 'Sıkı yayını açmadan önce eksikleri buradan kontrol et. Yayımlama ve yayından kaldırma onaylanan kayıtlarda yapılır.'}]},
    'editor.gecmis': {ad: 'İşlem geçmişi', rol: 'editor', adim: [{s: ['#app h1', '#app h2'], m: 'Yapılan editör işlemleri tarih sırasıyla burada listelenir.'}]}
  };

  /* ---------- 4. hangi ekranda hangi rehber ---------- */
  R.bolumler = function () {
    const v = typeof view !== 'undefined' ? view : '', L = [];
    if (v === 'ogretmen' && ogrOk()) {
      L.push('ogretmen.panel'); let t = ''; try { t = OGRT.S().tab; } catch (x) {}
      if (t === 'hafta') L.push('ogretmen.hafta'); else if (t === 'sinif') L.push('ogretmen.sinif'); else if (t === 'diger' || t === 'sorun') L.push('ogretmen.araclar', 'ogretmen.hata');
      return L;
    }
    if (v === 'editor') {
      if (!edOk()) return L; let s = {}; try { s = V38.ES(); } catch (x) {}
      if (!s.k) L.push('editor.ana');
      else if (s.k === 'yayin51') L.push('editor.yayin');
      else if (s.k === 'log' || s.k === 'toplu51') L.push('editor.gecmis');
      else if (s.cid) L.push('editor.kaynak', 'editor.onay');
      else if (!/^(yp51|veri51)$/.test(s.k)) L.push('editor.inceleme', 'editor.toplu');
      return L;
    }
    if (/^(editor|admin|bildirim48|ogara|game|poyna|ogretmen)$/.test(v)) return L;
    if (kip() !== 'ogrenci') return L; // öğretmen görünümü / ön izleme: öğrenci baloncukları yok
    const m = R.mod(), A = m === 'altin', tab = A ? (typeof G !== 'undefined' && G.ptab) : (typeof G !== 'undefined' && G.tab);
    const T = {home: 'ana', pdunya: 'ana', classes: 'derslerim', psinif: 'derslerim', grade: 'sinif', punite: 'unite', search: 'arama', calis45: 'calis', profil46: 'profil', poyun: 'oyun'};
    if (v === 'topic' || v === 'pders') L.push(m + (tab === 'test' ? '.test' : tab === 'kart' ? '.kart' : '.konu'));
    else if (v === 'games') L.push(A ? 'altin.etkinlik' : 'elmas.oyun');
    else if (T[v]) L.push(m + '.' + T[v]);
    if (A && document.getElementById('p39q') && gor(document.getElementById('p39q'))) L.unshift('altin.arama');
    return L.filter((id) => R.BOLUM[id]);
  };

  /* ---------- 5. hedef bulma ---------- */
  R.bul = function (adim) {
    for (const s of adim.s) {
      const sec = typeof s === 'string' ? s : s.s, rx = typeof s === 'string' ? adim.t : s.t;
      let L; try { L = [...document.querySelectorAll(sec)]; } catch (x) { continue; }
      const el = L.find((x) => gor(x) && (!rx || rx.test(x.textContent.trim())));
      if (el) return el;
    }
    return null;
  };

  /* ---------- 6. tanıtım penceresi (ilk açılış ve mod rehberleri) ---------- */
  R.tanitim = function (id, el) {
    const T = R.TANITIM[id]; if (!T) return;
    R.kapatBaloncuk(true);
    let i = 0, eski = document.getElementById('rh517-m'); if (eski) eski.remove();
    const ov = document.createElement('div'); ov.id = 'rh517-m'; ov.className = 'v-ov modal rh517-ov';
    ov.innerHTML = `<div class="rh517-k rh517-${T.tema}" role="dialog" aria-modal="true" aria-labelledby="rh517-b"></div>`;
    document.body.appendChild(ov);
    const kut = ov.firstChild, son = T.adim.length - 1;
    const bitir = (d) => { R.isaretle(id, d); ov.remove(); document.removeEventListener('keydown', tus, true); R.planla(400); };
    const tus = (ev) => { if (ev.key === 'Escape') { ev.preventDefault(); bitir('atlandi'); } };
    document.addEventListener('keydown', tus, true);
    const ciz = () => {
      const a = T.adim[i];
      kut.innerHTML = `<div class="rh517-kb"><span class="rh517-say">${i + 1} / ${T.adim.length}</span><button type="button" class="rh517-at" data-a="atla">${id === 'genel' ? 'Tanıtımı atla' : 'Rehberi atla'}</button></div>
        <div class="rh517-g" aria-hidden="true">${a.g()}</div><h2 id="rh517-b">${e(a.b)}</h2><p>${e(a.m)}</p>
        <div class="rh517-nok" aria-hidden="true">${T.adim.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>
        <div class="rh517-alt"><button type="button" class="rh517-on" data-a="onceki" ${i === 0 ? 'disabled' : ''}>Önceki</button><button type="button" class="rh517-p" data-a="${i === son ? 'bitir' : 'sonraki'}">${i === son ? 'Başla' : 'Sonraki'}</button></div>
        <div class="rh517-alt2"><button type="button" class="rh517-l" data-a="tekrar">Bana tekrar göster</button><button type="button" class="rh517-l" data-a="kapali">Bir daha gösterme</button></div>`;
      const p = kut.querySelector('.rh517-p'); try { p.focus({preventScroll: true}); } catch (x) {}
    };
    kut.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
      if (a === 'sonraki') { i = Math.min(son, i + 1); ciz(); } else if (a === 'onceki') { i = Math.max(0, i - 1); ciz(); }
      else if (a === 'bitir') bitir('tamam'); else if (a === 'atla') bitir('atlandi'); else if (a === 'tekrar') bitir('tekrar'); else if (a === 'kapali') bitir('kapali');
    });
    ciz();
  };

  /* ---------- 7. bölüm baloncuğu (vurgulama + kısa açıklama) ---------- */
  R._b = null;
  R.kapatBaloncuk = function (sessiz, d) {
    const b = R._b; if (!b) return; R._b = null;
    ['rh517-h', 'rh517-bal'].forEach((x) => { const el = document.getElementById(x); if (el) el.remove(); });
    window.removeEventListener('scroll', b.yer, true); window.removeEventListener('resize', b.yer); if (window.visualViewport) { visualViewport.removeEventListener('resize', b.yer); visualViewport.removeEventListener('scroll', b.yer); }
    document.removeEventListener('keydown', b.tus, true);
    if (!sessiz && d) R.isaretle(b.id, d);
    else if (sessiz && b.gosterildi && d !== 'yok') R.isaretle(b.id, 'atlandi');
  };
  R.baloncuk = function (id) {
    const B = R.BOLUM[id]; if (!B) return false;
    const adimlar = B.adim.filter((a) => R.bul(a)); if (!adimlar.length) return false;
    R.kapatBaloncuk(true, 'yok');
    const tema = B.rol === 'editor' ? 'editor' : B.rol === 'ogretmen' ? 'ogretmen' : id.split('.')[0];
    const h = document.createElement('div'); h.id = 'rh517-h'; h.className = 'rh517-h' + (B.ust ? ' ust' : ''); h.setAttribute('aria-hidden', 'true');
    const bal = document.createElement('div'); bal.id = 'rh517-bal'; bal.className = `rh517-bal rh517-${tema}` + (B.ust ? ' ust' : ''); bal.setAttribute('role', 'dialog'); bal.setAttribute('aria-live', 'polite'); bal.setAttribute('aria-label', B.ad + ' rehberi');
    document.body.appendChild(h); document.body.appendChild(bal);
    let i = 0, hedef = null;
    const b = R._b = {id, gosterildi: false};
    const yer = b.yer = () => {
      if (!hedef || !hedef.isConnected || !gor(hedef)) { const yeni = R.bul(adimlar[i]); if (!yeni) { R.kapatBaloncuk(true); return; } hedef = yeni; }
      const r = hedef.getBoundingClientRect(), vv = window.visualViewport, VH = vv ? vv.height + vv.offsetTop : innerHeight, VW = innerWidth, pad = 4;
      Object.assign(h.style, {left: (r.left - pad) + 'px', top: (r.top - pad) + 'px', width: (r.width + 2 * pad) + 'px', height: (r.height + 2 * pad) + 'px'});
      let altSinir = VH;
      if (!B.ust) document.querySelectorAll('nav.bnav, #bn50').forEach((n) => { if (!gor(n)) return; const q = n.getBoundingClientRect(); if (q.top > VH * 0.5 && !n.contains(hedef)) altSinir = Math.min(altSinir, q.top); });
      const w = Math.min(340, VW - 24); bal.style.width = w + 'px';
      const bh = bal.offsetHeight, bosluk = 12;
      let top; const asagi = r.bottom + pad + bosluk, yukari = r.top - pad - bosluk - bh;
      if (asagi + bh <= altSinir - 8) top = asagi; else if (yukari >= 8) top = yukari; else top = Math.max(8, Math.min(altSinir - bh - 8, asagi));
      let left = r.left + r.width / 2 - w / 2; left = Math.max(12, Math.min(VW - w - 12, left));
      bal.style.top = Math.round(top) + 'px'; bal.style.left = Math.round(left) + 'px';
      bal.classList.toggle('alt', top < r.top);
    };
    const ciz = () => {
      const a = adimlar[i]; hedef = R.bul(a);
      if (!hedef) { if (i < adimlar.length - 1) { i++; return ciz(); } return R.kapatBaloncuk(false, 'tamam'); }
      b.gosterildi = true;
      const son = i === adimlar.length - 1;
      bal.innerHTML = `<div class="rh517-bb"><b>${e(B.ad)}</b>${adimlar.length > 1 ? `<span>${i + 1} / ${adimlar.length}</span>` : ''}<button type="button" class="rh517-x" data-a="kapat" aria-label="Rehberi kapat">×</button></div>
        <p>${e(a.m)}</p><div class="rh517-ba"><button type="button" class="rh517-l" data-a="tekrar">Bana tekrar göster</button><button type="button" class="rh517-p" data-a="${son ? 'tamam' : 'sonraki'}">${son ? 'Anladım' : 'Sonraki'}</button></div>
        <button type="button" class="rh517-l rh517-bd" data-a="kapali">Bu bölümde bir daha gösterme</button>`;
      const sabit = (el) => { for (let x = el; x && x !== document.body; x = x.parentElement) { const p = getComputedStyle(x).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
      const r = hedef.getBoundingClientRect(), VH = window.visualViewport ? visualViewport.height : innerHeight;
      if (!sabit(hedef) && (r.top < 60 || r.bottom > VH - 140)) { try { hedef.scrollIntoView({block: 'center', inline: 'nearest'}); } catch (x) {} }
      requestAnimationFrame(() => { yer(); setTimeout(yer, 260); });
    };
    bal.addEventListener('click', (ev) => {
      const t = ev.target.closest('[data-a]'); if (!t) return; const a = t.dataset.a;
      if (a === 'sonraki') { i++; ciz(); } else if (a === 'tamam') { R.kapatBaloncuk(false, 'tamam'); R.planla(500); }
      else if (a === 'kapat') { R.kapatBaloncuk(false, 'atlandi'); } else if (a === 'tekrar') { R.kapatBaloncuk(false, 'tekrar'); } else if (a === 'kapali') { R.kapatBaloncuk(false, 'kapali'); }
    });
    b.tus = (ev) => { if (ev.key === 'Escape' && R._b === b) { R.kapatBaloncuk(false, 'atlandi'); } };
    document.addEventListener('keydown', b.tus, true);
    window.addEventListener('scroll', yer, true); window.addEventListener('resize', yer);
    if (window.visualViewport) { visualViewport.addEventListener('resize', yer); visualViewport.addEventListener('scroll', yer); }
    ciz();
    return true;
  };

  /* ---------- 8. yönetici: ilk açılış → mod rehberi → bölüm baloncukları ---------- */
  R.kontrol = function () {
    try {
      if (R._b) { const t = R._b; const ids = R.bolumler(); if (ids.includes(t.id)) return; R.kapatBaloncuk(true); }
      if (document.getElementById('rh517-m')) return;
      const bt = document.getElementById('boot36'); if (bt && gor(bt)) return R.planla(800);
      if (R.uygun('genel')) return R.tanitim('genel');
      if (engel()) return;
      const v = typeof view !== 'undefined' ? view : '', ogrEkran = !/^(ogretmen|editor|admin|bildirim48|ogara|game|poyna)$/.test(v) && kip() === 'ogrenci';
      if (ogrEkran) { const m = R.mod(); if (R.uygun('mod.' + m)) return R.tanitim('mod.' + m); }
      const sheet = document.querySelector('body > .v-ov:not(#rh517-m)');
      for (const id of R.bolumler()) {
        if (!R.uygun(id)) continue;
        if (sheet && !R.BOLUM[id].ust) return; // açık alt pencere varken (Altın araması dışında) baloncuk yok
        if (R.baloncuk(id)) return;
      }
    } catch (x) { try { console.warn('[V51.7] rehber', x); } catch (y) {} }
  };
  R.planla = function (ms) { clearTimeout(R._t); R._t = setTimeout(R.kontrol, ms == null ? 650 : ms); };

  /* ---------- 9. Kullanım Rehberi merkezi ---------- */
  R.GRUP = [
    {k: 'genel', ad: 'Uygulamayı tanı', tanit: 'genel'},
    {k: 'altin', ad: 'Altın Sınıfı rehberi', tanit: 'mod.altin'},
    {k: 'elmas', ad: 'Elmas Sınıfı rehberi', tanit: 'mod.elmas'},
    {k: 'ders', ad: 'Dersler ve konu anlatımları', ids: (m) => m === 'altin' ? ['altin.ana', 'altin.derslerim', 'altin.unite', 'altin.konu', 'altin.test', 'altin.kart'] : ['elmas.ana', 'elmas.derslerim', 'elmas.sinif', 'elmas.konu', 'elmas.test', 'elmas.kart'], git: (m) => (m === 'altin' ? go('pdunya') : go('home'))},
    {k: 'arama', ad: 'Arama kullanımı', ids: (m) => [m + '.arama'], git: (m) => (m === 'altin' ? (go('pdunya'), setTimeout(() => { try { V39.ara(); } catch (x) {} }, 500)) : go('search', {q: ''}))},
    {k: 'oyun', ad: 'Oyunlar ve etkinlikler', ids: (m) => m === 'altin' ? ['altin.oyun', 'altin.etkinlik'] : ['elmas.oyun'], git: (m) => go(m === 'altin' ? 'poyun' : 'games')},
    {k: 'calis', ad: 'Çalışma takibi', ids: (m) => [m + '.calis', m + '.profil'], git: () => go('calis45')},
    {k: 'ogretmen', ad: 'Öğretmen paneli', rol: 'ogretmen', ids: () => ['ogretmen.panel', 'ogretmen.hafta', 'ogretmen.sinif', 'ogretmen.araclar', 'ogretmen.hata'], git: () => go('ogretmen')},
    {k: 'editor', ad: 'Editör paneli', rol: 'editor', ids: () => ['editor.ana', 'editor.inceleme', 'editor.toplu', 'editor.kaynak', 'editor.onay', 'editor.yayin', 'editor.gecmis'], git: () => { try { V38.edGo({k: '', cid: '', mode: ''}); } catch (x) { go('editor'); } }}
  ];
  const DAD = {tamam: 'Görüldü', atlandi: 'Atlandı', kapali: 'Kapalı (bir daha gösterme)', tekrar: 'Tekrar gösterilecek'};
  R.grupDurum = function (g, m) {
    const ids = g.tanit ? [g.tanit] : g.ids(m), D = ids.map((i) => R.durum(i));
    if (D.some((d) => d === 'tekrar')) return 'Tekrar gösterilecek';
    if (D.every((d) => !d)) return 'Henüz gösterilmedi';
    if (D.every((d) => d === 'kapali')) return DAD.kapali;
    if (D.every((d) => d)) return 'Görüldü';
    return 'Kısmen görüldü';
  };
  R.gorunurGruplar = () => R.GRUP.filter((g) => !g.rol || (g.rol === 'ogretmen' ? ogrOk() : edOk()));
  R.merkezHTML = function () {
    const o = R.oku(), m = R.mod();
    return `<div class="rh517-mz"><p class="rh517-mzp">Rehberler, ilgili ekrana ilk girişinde kısa baloncuklarla bir kez çıkar. İstediğini buradan yeniden açabilir ya da bir sonraki girişte tekrar gösterilmesini isteyebilirsin.</p>
      <label class="rh517-oto"><input type="checkbox" ${o.otomatik === false ? '' : 'checked'} onchange="V51.Rehber.otomatik(this.checked)"> Rehberleri ilk girişte kendiliğinden göster</label>
      <ul class="rh517-lis">${R.gorunurGruplar().map((g) => `<li data-g="${g.k}"><div><b>${e(g.ad)}</b><small>${e(R.grupDurum(g, m))}</small></div><span><button type="button" class="rh517-p" onclick="V51.Rehber.goster('${g.k}')">Göster</button><button type="button" class="rh517-l" onclick="V51.Rehber.tekrarGoster('${g.k}')">Sonra tekrar göster</button></span></li>`).join('')}</ul>
      <button type="button" class="rh517-sif" onclick="V51.Rehber.sifirlaSor()">Tüm rehberleri yeniden başlat</button>
      <p class="rh517-mzn">Yeniden başlatma yalnız rehberlerin gösterim tercihlerini sıfırlar; ders ilerlemen, puanların, kayıtların ve editör kayıtları silinmez.</p></div>`;
  };
  R.merkez = function () { try { UI.sheet({title: 'Kullanım Rehberi', body: () => R.merkezHTML()}); } catch (x) {} };
  R.yenile = function () { const k = document.querySelector('.rh517-mz'); if (k) k.outerHTML = R.merkezHTML(); };
  R.otomatik = function (on) { const o = R.oku(); o.otomatik = !!on; R.yaz(o); };
  R.tekrarGoster = function (k) { const g = R.GRUP.find((x) => x.k === k); if (!g) return; const m = R.mod(); (g.tanit ? [g.tanit] : g.ids(m)).forEach((i) => R.isaretle(i, 'tekrar')); R.yenile(); try { UI.toast('Bu rehber, ilgili ekrana bir sonraki girişinde yeniden gösterilecek.'); } catch (x) {} };
  R.goster = function (k) {
    const g = R.GRUP.find((x) => x.k === k); if (!g) return; const m = R.mod();
    try { UI.close(); } catch (x) {}
    if (g.tanit) { setTimeout(() => R.tanitim(g.tanit), 320); return; }
    g.ids(m).forEach((i) => R.isaretle(i, 'tekrar'));
    const o = R.oku(); o.otomatik = true; R.yaz(o);
    setTimeout(() => { try { g.git(m); } catch (x) {} R.planla(700); }, 320);
  };
  R.sifirlaSor = function () {
    const ok = () => { R.sifirla(); R.yenile(); try { UI.toast('Bütün rehberler yeniden başlatıldı. İlerlemen ve kayıtların değişmedi.'); } catch (x) {} };
    try { if (typeof V38 !== 'undefined' && V38.confirm) { V38.confirm({title: 'Tüm rehberler yeniden başlatılsın mı?', text: 'Rehberler ilgili ekranlara ilk girişindeki gibi yeniden gösterilir. Ders ilerlemen, puanların ve kayıtların silinmez.', ok: 'Yeniden başlat', onOk: ok}); return; } } catch (x) {}
    if (window.confirm('Tüm rehberler yeniden başlatılsın mı? İlerlemen ve kayıtların silinmez.')) ok();
  };

  /* ---------- 10. giriş noktaları (Profilim kartı; öğretmen ve editör üst çubuğunda “Rehber”) ---------- */
  R.yerlestir = function () {
    try {
      const v = typeof view !== 'undefined' ? view : '', app = document.getElementById('app'); if (!app) return;
      if (v === 'profil46' && !app.querySelector('.rh517-prof')) {
        app.insertAdjacentHTML('beforeend', `<section class="rh517-prof ${R.mod() === 'altin' ? 'a' : 'e'}" aria-labelledby="rh517-ph"><h2 id="rh517-ph">Kullanım Rehberi</h2><p>Uygulamayı tanıtan rehberleri, Altın ve Elmas rehberlerini ve bölüm ipuçlarını yeniden açabilirsin.</p><div class="rh517-pb"><button type="button" class="rh517-p" onclick="V51.Rehber.merkez()">Rehberi aç</button><button type="button" class="rh517-l" onclick="V51.Rehber.tanitim('genel')">Tanıtımı yeniden izle</button></div></section>`);
      }
      if (v === 'ogretmen' && ogrOk()) { const t = app.querySelector('.og-top'); if (t && !t.querySelector('.rh517-yb')) { const out = t.querySelector('.og-out'); const h = '<button type="button" class="rh517-yb og" onclick="V51.Rehber.merkez()" aria-label="Kullanım rehberi">Rehber</button>'; if (out) out.insertAdjacentHTML('beforebegin', h); else t.insertAdjacentHTML('beforeend', h); } }
      if (v === 'editor' && edOk()) { const t = app.querySelector('.ed38-top'); if (t && !t.querySelector('.rh517-yb')) t.insertAdjacentHTML('beforeend', '<button type="button" class="rh517-yb ed v38-b" onclick="V51.Rehber.merkez()" aria-label="Kullanım rehberi">Rehber</button>'); }
    } catch (x) {}
  };

  /* ---------- 11. bağlama ---------- */
  try {
    const d0 = draw;
    draw = function () { if (R._b) R.kapatBaloncuk(true); const r = d0.apply(this, arguments); try { R.yerlestir(); R.planla(); } catch (x) {} return r; };
  } catch (x) {}
  try { if (typeof OGRT !== 'undefined' && OGRT.render) { const o0 = OGRT.render; OGRT.render = function () { const r = o0.apply(this, arguments); try { R.yerlestir(); R.planla(); } catch (x) {} return r; }; } } catch (x) {}
  try { if (typeof V38 !== 'undefined' && V38.edView) { const e0 = V38.edView; V38.edView = function () { const r = e0.apply(this, arguments); try { R.yerlestir(); R.planla(); } catch (x) {} return r; }; } } catch (x) {}
  try { if (typeof V39 !== 'undefined' && V39.ara) { const a0 = V39.ara; V39.ara = function () { const r = a0.apply(this, arguments); R.planla(500); return r; }; } } catch (x) {}
  // seçim ekranı kapandığında (ilk mod seçimi) mod rehberi için yeniden bak
  try { new MutationObserver(() => { if (!document.getElementById('rh517-m')) R.planla(900); }).observe(document.body, {childList: true}); } catch (x) {}
  R.planla(1200);
})();
