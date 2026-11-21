# Android APK — V51.6 (sürüm kodu 5106)

**Dosya:** `apk/din-kulturu-v51.6.apk` (10,7 MB)
- SHA-256: `2e55da4fcc1586bcb6af70baa727bc033e54725896589684893bf74c54abc8fd`
- İmza sertifikası: V36 ile **aynı anahtar**. Sertifika SHA-256 `48226315954bf037baac87386ab608850cdf0c952ddbeeeac98c87830684a6ea`, SHA-1 `62:4F:81:04:2C:90:4D:5E:1E:32:B3:86:ED:45:F1:8B:AB:79:DB:52`. V36'nın üzerine veriler silinmeden kurulur.

## V51.6'da eklenen: Gmail (Google) ile giriş
- Google, WebView içinde Google hesabıyla OAuth girişini engeller (`disallowed_useragent`). Bu yüzden APK'da giriş, Android'in kendi “Google ile oturum aç” penceresiyle yapılır: `androidx.credentials` 1.3.0 + `googleid` 1.1.1, `GetSignInWithGoogleOption`.
- Köprü: sayfa `DKAndroid.postMessage({tur:'google', istemci})` gönderir. Uygulama kimlik belgesini (ID token) aynı köprüyle geri verir. Sayfa belgeyi sunucuya (`/api/giris`) yollar; sunucu Google anahtarlarıyla doğrular. Çıkışta `google-cikis` iletilir.
- Köprü yalnız uygulamanın kendi kökenine (`https://appassets.androidplatform.net`) açıktır; gömülü YouTube çerçeveleri erişemez.
- APK'da ve HTML'de gizli anahtar yok.
- **Çalışması için gerekenler:** Google Cloud'da Web istemcisi (sunucunun `GOOGLE_CLIENT_ID`'si) ve paket `tr.dkab.platform` + yukarıdaki SHA-1 ile Android istemcisi; sunucuda `IZINLI_KOKENLER` içinde `https://appassets.androidplatform.net`. Adımlar: `docs/KURULUM_SUNUCU_VE_APK.md`.

## Yeniden derleme
```
cd android
# local.properties: sdk.dir=<Android SDK yolu>;  keystore.properties (git'e eklenmez): storeFile, storePassword, keyAlias, keyPassword
./gradlew assembleRelease     # → app/build/outputs/apk/release/app-release.apk
```

## Test edilen
- Derleme başarılı; `apksigner verify`: imza geçerli ve V36 ile aynı sertifika.
- `aapt2 dump badging`: paket `tr.dkab.platform`, sürüm 51.6 (5106), yalnız INTERNET izni.
- APK içindeki `assets/index.html` = V51.6 (SHA-256 eşleşiyor). Credential Manager sınıfları `classes.dex` içinde.
- Sayfa tarafının köprüyle Google girişi (Chromium benzetimi + gerçek sunucu): `tests/v51_6/test_v516.js`.

## Gerçek cihazda / emülatörde test edilmeyen
- Bu ortamda Android emülatörü yok (KVM yok). **APK hiçbir telefonda açılmadı.**
- Android'in Google hesabı seçme penceresi, Google Play Hizmetleri ile etkileşim ve gerçek bir Google hesabıyla giriş **denenmedi**.
- V36 bölümündeki test edilmeyen maddeler de geçerlidir (kurulum, simge, dosya kaydetme, ses, video, geri tuşu, döndürme).

---

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
