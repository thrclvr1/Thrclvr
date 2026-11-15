# Din Kültürü ve Ahlak Bilgisi — Dijital Öğrenme Platformu

4–12. sınıf DKAB öğrenme platformu. Tek HTML dosyası; bütün veri (müfredat, ilişkiler, sureler-dualar, yıllık plan) dosyanın içindeki JSON bloklarında. Sunucu yok, kurulum yok.

## Depo düzeni
- `index.html` — güncel sürüm (şu an V36.0). GitHub Pages bu dosyayı yayınlar.
- `surumler/din-kulturu-platformu-vXX.Y.html` — teslim edilmiş sürümler. **Bir kez teslim edilen sürüm dosyası bir daha değiştirilmez.**
- `docs/` — sürüm raporları (`VXX.Y_rapor.md`, `VXX.Y_performans_raporu.md`), tanıtım videosu.
- `tools/v36/` — V36.0'ı V35.0'dan üreten derleme betiği (`build360.py`) ve eklediği kod (`v360.js`, `v360.css`), performans ölçümü.
- `tests/v36/` — Playwright testleri. **Not:** Bu betikler ilk yazıldıkları çalışma alanındaki mutlak yolları (`/home/claude/work/...`) ve bazı eski sürüm dosyalarını kullanıyor; depoda çalıştırmadan önce yolları depoya göre uyarlamak gerekir.
- `android/` — `index.html`'i WebView içinde açan Android sarmalayıcısı (`./gradlew assembleRelease`; derlemede `../index.html` APK'ya kopyalanır, sürüm `V31.VER`'den okunur). İmza anahtarı ve `keystore.properties` depoda değil; güncellemeler aynı anahtarla imzalanmalı. Ayrıntı: `docs/android_apk_rapor.md`.
- `apk/din-kulturu-vXX.Y.apk` — teslim edilmiş APK'lar (sürüm dosyaları gibi değiştirilmez).
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
