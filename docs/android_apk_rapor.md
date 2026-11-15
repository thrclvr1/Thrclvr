# Android APK — V36.0 (sürüm kodu 3600)

**Dosya:** `apk/din-kulturu-v36.0.apk` (3,7 MB)
SHA-256: `c762f0da0f0f8cbf6c137f0082de6ec90e76c0a09837026e7b9015bc8de57266`
İmza sertifikası SHA-256: `48226315954bf037baac87386ab608850cdf0c952ddbeeeac98c87830684a6ea`

## Ne yapıldı
- `android/`: `index.html`'i tam ekran WebView içinde açan küçük bir Android uygulaması (Java, harici kütüphane olarak yalnızca `androidx.webkit`).
- Web uygulamasına (`index.html`) **dokunulmadı**. Derleme sırasında depodaki `index.html` APK'nın içine kopyalanıyor; sürüm adı `V31.VER` değerinden okunuyor (V36.0 → 36.0 / 3600).
- Sayfa sabit bir https kökeninden açılıyor (`https://appassets.androidplatform.net/assets/index.html`). localStorage (`dk2`, öğretmen kayıtları, `dk-ogretmen-pin`) ve sessionStorage (`dk-ogrt-oturum`) bu kökende tutulur, uygulama güncellense de kaybolmaz.
- Uygulama internetsiz çalışır. YouTube videoları, Diyanet/MEB bağlantıları ve Google yazı tipleri için internet izni var. Dış bağlantılar telefonun tarayıcısında açılır.
- Öğretmen panelindeki "JSON olarak yedekle" ve ilişki/kavram haritası dışa aktarmaları Android'in "Kaydet" penceresiyle dosyaya yazılıyor. "Yedekten geri yükle" Android dosya seçicisini açıyor.
- Geri tuşu: uygulama içi geçmişte geri gider, açık pencereyi kapatır. Ana sayfada uygulamadan çıkar.
- Simge: uygulamanın kendi amblemi (`V31.EMB`) kullanıldı. Android 8 ve sonrası için uyarlanabilir simge de var.
- En düşük Android 7.0 (API 24), hedef Android 15 (API 35).

## Yeniden derleme
```
cd android
# local.properties: sdk.dir=<Android SDK yolu>
# keystore.properties: storeFile, storePassword, keyAlias, keyPassword (git'e eklenmez)
./gradlew assembleRelease
# çıktı: app/build/outputs/apk/release/app-release.apk
```
Güncellemenin eski uygulamanın üzerine kurulabilmesi (ve verilerin korunması) için **aynı imza anahtarı** (`din-kulturu-imza.jks`) kullanılmalı. Anahtar depoda değil, kullanıcıya ayrıca verildi.

## Test edilen (tarayıcı otomasyonu / derleme araçları)
- APK derlendi; `apksigner verify` ile imza doğrulandı (v2 imza).
- `aapt2 dump badging`: paket `tr.dkab.platform`, ad "Din Kültürü", sürüm 36.0, yalnızca INTERNET izni.
- APK içindeki `assets/index.html`, depodaki `index.html` ile birebir aynı (SHA-256 eşleşiyor).
- İndirme köprüsünün JavaScript tarafı Chromium'da (Playwright) denendi: `OGRT.backup()` ve Türkçe karakterli bir blob doğru ad ve içerikle iletildi. İndirme olmayan bağlantılar etkilenmedi; betik iki kez eklendiğinde bir kez çalıştı.

## Gerçek cihazda / emülatörde test edilmeyen
Bu ortamda Android emülatörü çalıştırılamadı (KVM yok). Bu yüzden aşağıdakiler **hiçbir Android cihazda denenmedi**:
- Kurulum, açılış, simgenin görünümü.
- Durum çubuğu / gezinme çubuğu boşlukları (Android 15 kenardan kenara çizim), klavye açılınca yerleşim.
- Dosya kaydetme ve yedekten geri yükleme pencerelerinin Java tarafı.
- YouTube videosu ve tam ekran oynatma, ses (Ders Atmosferi, Dinleme Merkezi).
- Geri tuşu davranışı, ekran döndürme.
- Eski (Android 7–9) cihazlardaki WebView sürümleriyle uyumluluk.

## Bilinen sınırlamalar
- APK Google Play dışından kurulur. Telefon "bilinmeyen kaynak" izni ister; Play Protect "tanınmayan uygulama" uyarısı gösterebilir.
- Tarayıcıda kullanılan sürümün verileri (localStorage) APK'ya taşınmaz; ikisi ayrı depolama alanlarıdır. Öğretmen verisi JSON yedeğiyle taşınabilir.
- İmza anahtarı kaybolursa sonraki sürümler eski uygulamanın üzerine kurulamaz. Önce kaldırmak gerekir, bu da uygulama içindeki verileri siler.
