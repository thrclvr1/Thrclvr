# Sunucu, Gmail girişi ve APK kurulumu (adım adım)

Bu rehber V51.6 için yazıldı. Kod tarafında yapılabilen her şey hazır:

- APK: `apk/din-kulturu-v51.6.apk`
- Sunucu paketi: `sunucu/Dockerfile`
- Render kurulum dosyası: `render.yaml`

Aşağıdaki **3 adımı yalnız siz yapabilirsiniz**, çünkü sizin hesaplarınızla giriş gerektiriyor: Google Cloud, Gmail uygulama şifresi ve Render. Toplam 20–30 dakika sürer.

> **Gizli bilgileri** (Gmail uygulama şifresi, e-posta adresleri) hiçbir dosyaya yazmayın ve sohbete yapıştırmayın. Yalnız Render'ın ortam değişkeni ekranına girin.

---

## Hiç kurulum olmadan (V56.0): giriş ekranı, sınıf seçimi, telefondaki Google hesabıyla giriş, tek yönetici, Google yedeği

`apk/din-kulturu-v56.0.apk` dosyasını telefona kurun. Google Play için `apk/play/din-kulturu-v56.0.aab` dosyasını kullanın. Hiçbir ayar gerekmez. (Aynı imza anahtarıyla imzalı; önceki sürümün üzerine güncelleme olarak kurulur, veriler korunur.)

- **Uygulama açılınca önce giriş ekranı gelir** (içerik görünmez). Yalnız iki seçenek var: **Google ile giriş** (telefonun hesap listesi açılır) ya da **Misafir olarak devam et**. Bir kez seçen kişiye tekrar sorulmaz; “Çıkış yap” giriş ekranını geri getirir.
- **Öğrenci:** “Google ile giriş” → telefonun kendi hesap listesi açılır → hesabınızı seçin. Ya da “Misafir olarak devam et”. Ardından **“Hangi sınıfta okuyorsun?”** (Profilim'den değiştirilebilir; eski ilerleme silinmez).
- **Altın önizlemesi (yalnız yönetici):** Editör Onay Alanı › “Altın'ı önizle”. Öğrenciler ve öğretmenler Altın'da “Çok yakında” görür.
- **Yönetici (yalnız tanımlı yönetici hesabı):**
  1. Giriş ekranında Google ile giriş → yönetici hesabını seçin. Doğrudan yönetici şifresi ekranı açılır. (Uygulama içinde: Mod düğmesi › Yönetici / Editör girişi; yalnız yönetici hesabında görünür.)
  2. İlk kez: **“Yönetici şifreni belirle”**: 6 rakam, iki kez.
  3. Sonraki girişler: hesap → şifre. Unutursanız “Şifremi unuttum” → yeni şifre.
- **Veriler:** her kişinin telefonu, uygulama verisini kendi Google hesabına yedekler (Android otomatik yedeği; genellikle günde bir kez, şarjda ve Wi-Fi'de). Uygulama yeniden kurulunca ya da yeni telefonda veriler geri gelir.

Sınırlar:
- Yalnız telefon uygulamasında çalışır; web sitesinde çalışmaz.
- Yedek anlık eşitleme değildir.
- Yönetici alanının asıl koruması şifredir.

Aşağıdaki Google Cloud ve sunucu adımları yalnız imzalı doğrulama, web sitesinde Google girişi ya da anlık eşitleme istenirse gerekir.

## En kolay yol (V52.0): sunucusuz Google girişi

V52.0'dan beri Google ile giriş için **sunucu gerekmez**. Yalnız aşağıdaki **Adım 1** (Google Cloud) yeterlidir; Adım 2 ve 3 (Gmail uygulama şifresi, Render) gerekmez.

Bu yolda:
- öğrenciler ve siz telefondan Google hesabıyla girersiniz;
- yönetici girişi Google hesabınız + editör PIN'iniz ile yapılır.

Sınırları:
- ilerleme cihazda kalır (başka telefona taşınmaz);
- editör PIN'ini e-postayla sıfırlama çalışmaz.

Bunlar gerekirse ileride Adım 2–4 ile sunucu kurulur.

1. **Adım 1'i yapın** (aşağıda): Web istemci kimliği + Android istemci kimliği.
   - OAuth izin ekranı “Test” durumundaysa giriş yapacak **kendi Gmail hesaplarınızı Test kullanıcıları listesine ekleyin**.
   - Öğrenciler de girecekse uygulamayı **yayınlayın (Publish)**.
2. Telefona `apk/din-kulturu-v52.0.apk` kurun (aşağıda “APK kurulumu”).
3. Uygulamada **Mod düğmesi › Yönetici / Editör girişi** → **“Google istemci kimliğini gir”**.
   - Aynı yer: **Profilim › Hesap › Google girişi kurulumu**.
   - Adım 1.3'teki **Web** istemci kimliğini (`…apps.googleusercontent.com`) yapıştırın → Kaydet.
   - Android istemci kimliğini girmeyin; o yalnız Google Cloud'da durur.
   - Bu kimlik gizli değildir; isterseniz bana da gönderebilirsiniz, sonraki sürümde uygulamaya varsayılan olarak yazarım.
4. **Google ile doğrula** → kendi hesabınızı seçin → **“Bu hesabı yönetici yap (PIN ile)”** → editör PIN'iniz.
   - Bu, her cihazda bir kez yapılır.
   - Sonraki girişler: Google hesabı → PIN.
5. Öğrenciler açılış ekranında ya da Profilim'de **Google ile giriş** ya da **Misafir olarak devam et** seçer.
   - İstemci kimliği her cihaza bir kez girilmelidir; uygulamaya varsayılan olarak yazılana kadar.

| Belirti | Neden / çözüm |
|---|---|
| “Kimlik belgesi bu uygulama için verilmemiş” | Uygulamaya **Android** kimliği girilmiş; **Web** istemci kimliğini girin |
| “Google anahtarları alınamadı” | İnternet bağlantısı yok |
| Tarayıcıda Google düğmesi çıkmıyor / “origin” hatası | Web istemcisinde yetkili kaynak `https://thrclvr1.github.io` değil |

---

## Adım 1 — Google Cloud: Gmail ile giriş için iki istemci kimliği

1. https://console.cloud.google.com adresine Gmail hesabınızla girin → üstten **Yeni proje** → ad: `DKAB` → Oluştur.
2. Sol menü: **API'ler ve Hizmetler › OAuth izin ekranı** (Google Auth Platform › Marka):
   - Uygulama adı: `Din Kültürü`
   - Destek e-postası: kendi adresiniz
   - Kullanıcı türü: **Harici (External)**
   - Kapsamlar: yalnız `openid`, `email`, `profile`
   - **Önemli:** “Test” durumundayken yalnız **Test kullanıcıları** listesine eklediğiniz Gmail hesapları giriş yapabilir. Öğrenciler de girecekse **Uygulamayı yayınla (Publish)** deyin.
3. **Kimlik bilgileri › Kimlik bilgisi oluştur › OAuth istemci kimliği** → tür: **Web uygulaması**
   - Ad: `DKAB Web`
   - Yetkili JavaScript kaynakları: `https://thrclvr1.github.io`
   - Oluştur → çıkan **İstemci kimliğini** (`…apps.googleusercontent.com`) bir yere not edin. Bu gizli değildir. (İstemci gizli anahtarı / client secret **kullanılmaz**.)
4. Yine **OAuth istemci kimliği** → tür: **Android**
   - Ad: `DKAB Android`
   - Paket adı: `tr.dkab.platform`
   - SHA-1 sertifika parmak izi: `62:4F:81:04:2C:90:4D:5E:1E:32:B3:86:ED:45:F1:8B:AB:79:DB:52`
   - Oluştur. Bu kimliği hiçbir yere girmeniz gerekmez; Google, APK'nın gerçekten bu uygulama olduğunu buradan anlar.

## Adım 2 — Gmail: editör PIN sıfırlama e-postası için uygulama şifresi

1. https://myaccount.google.com/security → **2 Adımlı Doğrulama**'yı açın (açık değilse).
2. https://myaccount.google.com/apppasswords → uygulama adı: `DKAB sunucu` → Oluştur.
3. Çıkan **16 harfli şifreyi** yalnız Adım 3'te Render'a girin. Bu şifre normal Gmail şifreniz değildir; istediğiniz zaman aynı sayfadan silebilirsiniz.

## Adım 3 — Render: sunucuyu yayına almak

1. https://render.com → **GitHub ile kaydol** → `thrclvr1/Thrclvr` deposuna izin verin.
2. **New › Blueprint** → depoyu seçin. Render, depodaki `render.yaml` dosyasını okur.
   - Bu dosya şu an `claude/uygulama-gorunurlugu-nfjhxv` dalında. Ya Render'da bu dalı seçin ya da dalı önce `main`'e birleştirin.
3. Render şu değerleri sorar (hepsi gizli saklanır):

| Değer | Ne girilecek |
|---|---|
| `GOOGLE_CLIENT_ID` | Adım 1.3'teki Web istemci kimliği |
| `EDITOR_EPOSTALARI` | **Yönetici** olacak Gmail adresi (sizinki). V51.9'dan beri yönetici girişi bu hesapla Google doğrulaması + editör PIN'i ile yapılır. Birden çok yönetici için virgülle ayırın. |
| `OGRETMEN_EPOSTALARI` | Öğretmen rolü verilecek Gmail adresleri (virgülle; boş bırakılabilir) |
| `EDITOR_SIFIRLAMA_EPOSTASI` | Editör PIN sıfırlama kodunun gideceği adres (sizinki) |
| `SMTP_KULLANICI` | Gönderen Gmail adresi (sizinki) |
| `SMTP_PAROLA` | Adım 2'deki 16 harfli uygulama şifresi |
| `EPOSTA_GONDEREN` | `DKAB <gmail-adresiniz>` |

4. **Apply / Create** → birkaç dakika sonra sunucu adresi çıkar (ör. `https://dkab-sunucu.onrender.com`).
   - Tarayıcıda `…/api/saglik` adresi `{"ok":true}` göstermeli.
5. **Ücret:** veriler (bulut kayıtları) kalıcı diskte tutulur. Render'da disk yalnız ücretli **Starter** planda vardır (aylık birkaç dolar). Ücretsiz planda her yeniden başlatmada kayıtlar silinir; bu yüzden `render.yaml` Starter plan ister.

## Yönetici girişi (V51.9: Google + PIN)

- Yönetici (Editör Onay Alanı) girişi iki adımlıdır:
  1. Google ile doğrulama.
  2. Editör PIN'i.
- Yönetici, Render'daki `EDITOR_EPOSTALARI` değerine yazdığınız Gmail hesabıdır. Bu adres yalnız sunucuda durur; uygulamanın HTML dosyasında yoktur.
- **Kurulum bitince bana şu iki bilgiyi gönderin.** İkisi de gizli bilgi değildir; şifre, SMTP parolası gibi gizli bilgileri sohbete yazmayın.
  - Adım 1.3'teki **Web istemci kimliği** (`…apps.googleusercontent.com`)
  - Adım 3'teki **sunucu adresi** (`https://…onrender.com`)
- Ben de yeni sürümde:
  - sunucu adresini uygulamaya varsayılan olarak yazarım; öğrenciler hiçbir şey girmeden Google ile girebilir;
  - **geçiş dönemini kapatırım**: yalnız PIN ile yönetici girişi tamamen kalkar;
  - aynı imza anahtarıyla yeni APK üretirim.
- Kurulum bitene kadar: sunucu adresi girilmemiş cihazda yönetici alanına “Geçiş dönemi: PIN ile devam et” ile girilebilir (açık uyarıyla). Bir cihaza sunucu adresi girildiği ya da orada bir kez Google ile doğrulama yapıldığı anda bu seçenek o cihazda kapanır.

## Adım 4 — Uygulamaya bağlamak

1. Uygulamada (APK ya da https://thrclvr1.github.io/Thrclvr/) **Profilim › Hesap › Sunucu ayarı** → Adım 3.4'teki adresi yazın → Kaydet.
2. **Google ile giriş**:
   - APK'da telefonun kendi Google hesabı seçme penceresi açılır.
   - Tarayıcıda Google düğmesi çıkar.
3. **Editör PIN'imi unuttum** artık e-postayla çalışır: kod, `EDITOR_SIFIRLAMA_EPOSTASI` adresine gelir.

## APK kurulumu

1. En yeni APK'yı (`apk/din-kulturu-v54.0.apk`) telefona gönderin (e-posta, Drive, USB).
2. Dosyaya dokunun → telefon “bilinmeyen kaynak” izni ister → izin verin → **Yükle**.
   - Play Protect “tanınmayan uygulama” diyebilir: **Yine de yükle**.
3. Eski bir APK (V36, V51.x, V52.x, V53.0) yüklüyse bu sürüm onun **üzerine** kurulur, çünkü imza anahtarı aynı. Uygulamadaki ilerleme silinmez.

## Bir şey çalışmazsa

| Belirti | Neden / çözüm |
|---|---|
| “Bu telefonda kullanılabilir Google hesabı bulunamadı ya da uygulama Google Cloud'da Android istemcisi olarak tanımlı değil” | Adım 1.4 yapılmadı, SHA-1 ya da paket adı yanlış girildi, ya da telefonda Google hesabı yok |
| “Google kimliği doğrulanamadı: hedef kitle” | Render'daki `GOOGLE_CLIENT_ID`, Web istemci kimliğiyle aynı değil |
| Giriş penceresinden sonra “erişim engellendi” | OAuth izin ekranı “Test” durumunda ve hesap test kullanıcısı değil (Adım 1.2) |
| “Sunucuya ulaşılamadı” | Sunucu adresi yanlış ya da Render'da sunucu uykuda / kapalı |
| PIN sıfırlamada “e-posta gönderilemedi” | Uygulama şifresi yanlış ya da 2 Adımlı Doğrulama kapalı |
