# Din Kültürü ve Ahlak Bilgisi — Dijital Öğrenme Platformu

4–12. sınıf DKAB öğrenme platformu. Tek HTML dosyası; bütün veri (müfredat, ilişkiler, sureler-dualar, yıllık plan) dosyanın içindeki JSON bloklarında. Sunucu yok, kurulum yok.

## Depo düzeni
- `index.html` — güncel sürüm (şu an V39.0). GitHub Pages bu dosyayı yayınlar.
- `surumler/din-kulturu-platformu-vXX.Y.html` — teslim edilmiş sürümler. **Bir kez teslim edilen sürüm dosyası bir daha değiştirilmez.**
- `docs/` — sürüm raporları (`VXX.Y_rapor.md`, `VXX.Y_performans_raporu.md`), tanıtım videosu.
- `tools/v36/` — V36.0'ı V35.0'dan üreten derleme betiği (`build360.py`) ve eklediği kod (`v360.js`, `v360.css`), performans ölçümü.
- `tools/v37/` — V37.0'ı V36.0'dan üreten `build370.py` (depo yollarıyla çalışır: `python3 tools/v37/build370.py`; `index.html`'i de yazar), eklediği `v370.js`/`v370.css` ve ölçüm betikleri (`olcum_*.js`).
- `tools/v38/` — V38.0'ı V37.0'dan üreten `build380.py` (`python3 tools/v38/build380.py`; `index.html`'i de yazar), `v380.js`/`v380.css`, ölçüm `olcum_v38.js`.
- `tools/v39/` — V39.0'ı V38.0'dan üreten `build390.py` (`python3 tools/v39/build390.py`; `index.html`'i de yazar), `v390.js`/`v390.css`, ölçüm `olcum_v39.js`.
- `tests/v39/test_v390.js` — V39 testleri (51 kontrol; `node tests/v39/test_v390.js`, yerel http sunucusu). Normal ekranların V38 ile aynı kaldığını hesaplanmış stillerle karşılaştırır.
- `tests/v38/test_v380.js` — V38 testleri (73 kontrol; `node tests/v38/test_v380.js`, yerel http sunucusu).
- `tests/v37/test_v370.js` — V37 testleri; depo yollarıyla çalışır (`node tests/v37/test_v370.js`), sayfaları yerel http sunucusundan açar (başsız Chromium'da `file://` ile localStorage güvenilir değildi).
- `tests/v36/` — Playwright testleri. **Not:** Bu betikler ilk yazıldıkları çalışma alanındaki mutlak yolları (`/home/claude/work/...`) ve bazı eski sürüm dosyalarını kullanıyor; depoda çalıştırmadan önce yolları depoya göre uyarlamak gerekir.
- `android/` — `index.html`'i WebView içinde açan Android sarmalayıcısı (`./gradlew assembleRelease`; derlemede `../index.html` APK'ya kopyalanır, sürüm `V31.VER`'den okunur). İmza anahtarı ve `keystore.properties` depoda değil; güncellemeler aynı anahtarla imzalanmalı. Ayrıntı: `docs/android_apk_rapor.md`.
- `apk/din-kulturu-vXX.Y.apk` — teslim edilmiş APK'lar (sürüm dosyaları gibi değiştirilmez). Şu an yalnızca V36.0 APK'sı var; Android çalışması kullanıcı isteğiyle beklemede.
- `kaynaklar/yillik-plan-2026-2027/` — öğretmenin verdiği yıllık plan Excel dosyaları (birincil kaynak).

## Çalışma kuralları (kullanıcının kalıcı kuralları)
1. Yeni sürüm her zaman yeni dosyadır: `surumler/din-kulturu-platformu-vYENİ.html` oluştur, `index.html`'i onunla güncelle. Önceki sürüm dosyasına dokunma.
2. Kaynakta olmayan bilgiyi tahmin ederek üretme. Eksik veri için “Veri bulunmuyor” türü açık ifade göster (ör. “Ders kitabında veri bulunmuyor.”, “Yıllık plan Excel'inde veri bulunmuyor.”, “Kaynakta veri bulunmuyor.”).
3. 2018 programı ile 2026 Türkiye Yüzyılı Maarif Modeli (TYMM) programını karıştırma; kayıtlar ayrı tutulur.
4. Yıllık plan Excel dosyaları birincil kaynaktır; haftalık dağılımı kendi algoritmanla yeniden hesaplama.
5. Kullanıcı verisini ve localStorage anahtarlarını koru (ör. `dk2`, öğretmen kayıtları, `dk-ogretmen-pin`). Öğretmen oturumu yalnızca `sessionStorage`'da (`dk-ogrt-oturum`).
6. Mevcut tasarımı ve özellikleri koru; içerik silme.
7. Dürüst raporla: test edilmeyeni başarılı sayma. Tarayıcı otomasyonu gerçek cihaz testi değildir; raporda “gerçek cihazda test edilen / edilmeyen” bölümü olsun.
8. Her sürüm teslimi: HTML + `docs/VXX.Y_rapor.md` (+ performans işi varsa performans raporu). Sonunda Türkçe özet: yapılanlar / test edilmeyenler / bilinen sorunlar.
9. Öğretmen PIN'i yalnızca tuzlu SHA-256 özeti olarak saklanır; açık metin PIN koyma. Bu basit bir erişim ayrımıdır; gerçek güvenlik sunucu gerektirir.

## Teknik notlar
- Veri blokları: `<script id="seed-curriculum|seed-sd|seed-rel|seed-hide|seed-km|seed-yp" type="application/json">` (boşluksuz JSON).
- Veri erişimi `Store.all(koleksiyon)` / `Store.get(koleksiyon, id)`; V36'dan beri önbellekli (`Store._rows`), `save()` önbelleği yeniler.
- Rotalar: `go('home'|'classes'|'grade'|'topic'|'pek'|'dene'|'links'|'games'|'sd'|'ogretmen'...)`.
- Açılış ekranı `#boot36`, ilk `draw()` sonrası `V36.boot()` ile kalkar.
- V39: Açılışta üyelik seçimi (`#uye39`; tercih `dk-deneyim39` = `{son, hatirla}`; premium oturum bayrağı sessionStorage `dk-deneyim39-aktif`). Öğrenme Dünyası rotaları `pdunya` (koridor), `psinif` (`G.pg`), `punite` (`G.pu`), `pders` (`G.pt`, `G.ptab`), `pozet`, `pilerleme`; premium oturumda `<body data-prem39 data-pv=…>` ve `go('home'|'classes'|'grade'|'topic')` premium karşılıklarına yönlenir. İçerik Klasik alanla aynı `Store` kayıtlarından; program `pvOf` kuralı (sınıf başına seçim `dk-ilerleme39.prog`). Ortak ilerleme `dk-ilerleme39` (`z` ziyaret, `t` konu bazında cevaplar, `son`, `sonSinif`). Mini test/kart/oyun mevcut `MT`, `FC`, `playGame` ile. Üyelik `V39.Uyelik` (şimdilik `yerel-prototip` sağlayıcı; gerçek güvenlik değil). Premium CSS yalnızca `#uye39`, `.p39-*`, `body[data-prem39]` kapsamında; kısa sınıf adları mevcut CSS ile çakışmasın diye önekli.
- V38: Editör Onay Alanı rotası `go('editor')` (`V30.routes.editor`), ayrı 6 haneli editör PIN'i `dk-editor-pin38` + oturum `dk-editor-oturum38` (sessionStorage) + sayaç `dk-editor-kilit38`. Editör kayıtları, not defteri, sınavlar, şablonlar, işlem günlüğü IndexedDB `dk38`/`kv` (`ed`, `notlar`, `sinavlar`, `sablonlar`, `log`; yoksa localStorage `dk38-*`). Kuyruklar `V38.ED.cat()` ile gerçek veriden hesaplanır. Onay ≠ yayım: Yayımla, onaylı sürümü `Store.patch` (dk2) ile yazar; önceki yama saklanır ve yayından kaldırınca birebir geri konur. Öğretmen paneli Diğer bölümleri `OGRT.SUB` + `OGRT.EXT`; premium renkler `--t37-*` değişkenlerinin yeniden tanımı (yalnızca `body[data-ogrt37]`). Öğretmen yedeği JSON'unda yeni `v38` alanı (eski yedekler aynen okunur).
- V37: öğretmen ekranında `<body data-ogrt37>` (renk sistemi `--t37-*`); PIN `dk-ogretmen-pin` = `{v:2,salt,h,len}` (V36 `{v:1}` de okunur), hatalı deneme sayacı `dk-ogrt-kilit37`; ses kontrolü üst çubukta `#snd37` (`ATM.bar/ATM.fab` artık yüzen öğe oluşturmaz).
