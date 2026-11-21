# DKAB hesap, bulut kayıt ve hata bildirimi sunucusu (V46.0; bildirimler V48.0)

Uygulamadaki **Google ile giriş** ve **bulut kayıt** bu sunucu kurulup uygulamaya adresi girilmeden **çalışmaz**. Sunucu adresi girilmemişse uygulama misafir modunda çalışır ve bunu açıkça yazar. Hiçbir ilerleme sunucuya gitmez.

## Ne yapar?

- Google Identity Services'in verdiği **kimlik belgesini** (ID token) doğrular: Google'ın açık anahtarlarıyla RS256 imzası, `aud` = sizin istemci kimliğiniz, `iss` = Google, süre ve e-posta doğrulaması.
- Kullanıcıya 30 gün geçerli bir oturum belirteci verir. Veritabanında belirtecin kendisi değil, yalnız SHA-256 özeti tutulur.
- Kullanıcının ilerlemesini saklar ve sürüm denetimiyle günceller. Eski sürümle yazma 409 döner; uygulama birleştirip yeniden dener.
- Eşitlenen ilerleme şunlardır:
  - `dk2` (kazanım ilerlemesi, kartlar, yanlışlar, mini testler, oyun puanları)
  - `dk-ilerleme39`
  - `dk-oyun41` (oyun kayıtları)
  - `dk-calis45`
- Rolleri (öğretmen, editör) e-posta listelerinden sunucuda belirler.

Bağımlılık yoktur. Yalnızca **Node.js 22.13 veya üstü** gerekir (yerleşik `node:sqlite`).

## 1. Google OAuth istemci kimliği

1. https://console.cloud.google.com → yeni proje.
2. **APIs & Services › OAuth consent screen**:
   - Uygulama adı, destek e-postası.
   - Kullanıcı türü: *External*.
   - Kapsamlar: yalnız `openid`, `email`, `profile`.
3. **APIs & Services › Credentials › Create credentials › OAuth client ID** → tür: **Web application**.
4. **Authorized JavaScript origins** (uygulamanın açıldığı adresler):
   - `https://thrclvr1.github.io` (GitHub Pages)
   - Yerel deneme için gerekirse: `http://localhost:8080`
5. **Authorized redirect URIs**: gerekmez. Google Identity Services açılır pencere (popup) ile kimlik belgesi verir; yönlendirme kullanılmaz.
6. Oluşan **Client ID** (`…apps.googleusercontent.com`) gizli değildir. **Client secret kullanılmaz**; hiçbir yere yazmayın.

## 2. Sunucuyu çalıştırma

```bash
GOOGLE_CLIENT_ID=123-abc.apps.googleusercontent.com \
IZINLI_KOKENLER=https://thrclvr1.github.io \
OGRETMEN_EPOSTALARI=ogretmen@okul.k12.tr \
EDITOR_EPOSTALARI=editor@ornek.com \
PORT=8787 \
node sunucu/sunucu.js
```

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `GOOGLE_CLIENT_ID` | evet | 1. adımdaki istemci kimliği |
| `IZINLI_KOKENLER` | evet | Uygulamanın açıldığı köken(ler), virgülle (CORS). Başka sitelerden gelen istekler reddedilir. Android uygulaması (APK) için `https://appassets.androidplatform.net` de eklenmeli. |
| `VERITABANI` | hayır | SQLite dosyası (varsayılan `sunucu/veri/dkab.sqlite`). **Yedekleyin.** |
| `OGRETMEN_EPOSTALARI`, `EDITOR_EPOSTALARI` | hayır | Rol verilecek Google e-postaları, virgülle |
| `OTURUM_GUN` | hayır | Oturum süresi (varsayılan 30) |
| `PORT` | hayır | Varsayılan 8787 |

**HTTPS zorunludur.** Sunucuyu HTTPS veren bir barındırmada çalıştırın ya da önüne HTTPS'li bir ters vekil (reverse proxy) koyun. Örnekler: Render, Railway, Fly.io ya da Nginx/Caddy'li bir VPS.

- Kalıcı disk gerekir; SQLite dosyası silinirse bulut kayıtları kaybolur.
- `sunucu/veri/` klasörü depoya eklenmez.

## 3. Uygulamaya bağlama

Uygulamada **Profilim › Hesap › Sunucu ayarı › Sunucu adresini gir** bölümüne sunucunun HTTPS adresini yazın (ör. `https://dkab-sunucu.example.com`). Uygulama:

1. `/api/saglik` ile sunucuyu dener.
2. `/api/yapilandirma`'dan istemci kimliğini alır.
3. Google düğmesini gösterir.

## Uç noktalar

| Yöntem | Yol | Açıklama |
|---|---|---|
| GET | `/api/saglik` | Çalışıyor mu |
| GET | `/api/yapilandirma` | `{googleClientId, veriAnahtarlari}` |
| POST | `/api/giris` | `{credential}` (Google kimlik belgesi) → `{oturum, kullanici}` |
| GET | `/api/ben` | Oturumdaki kullanıcı |
| GET | `/api/veri` | `{surum, veri, guncelleme}` |
| PUT | `/api/veri` | `{temelSurum, veri}` → 200 ya da 409 (güncel veriyle) |
| POST | `/api/cikis` | Oturumu siler |
| POST | `/api/bildirim` | (V48) İçerik/soru hata bildirimi. `{id, tur:'icerik'|'soru', kategori, aciklama, anonim, kaynak, baglam, tarih, surum}` → 201; aynı `id` yeniden gelirse 200 (çift kayıt yok) |
| GET | `/api/bildirim/benim` | (V48) Kullanıcının kendi bildirimlerinin durumu `{liste:[{id, durum, gerekce, guncelleme}]}` |
| GET | `/api/bildirim?durum=yeni` | (V48) **Yalnız editör** (EDITOR_EPOSTALARI). Bütün bildirimler; anonimse ad yok, değilse yalnız ad (e-posta hiç gönderilmez) |
| PATCH | `/api/bildirim/:id` | (V48) **Yalnız editör.** `{durum:'yeni'|'inceleniyor'|'duzeltildi'|'gecersiz', not, gerekce}`; `gecersiz` gerekçe ister; notlar ve durum geçmişi saklanır |

### Hata ve geri bildirim (V48)

- Yeni kurulum gerekmez: sunucu ilk açılışta `bildirim` tablosunu kendisi oluşturur (eski veritabanı aynen kalır).
- Öğrenci ve öğretmen bildirim gönderebilmek için Google ile giriş yapmış olmalıdır (yetkisiz/sahte gönderimi önler). `kaynak` sunucuda doğrulanır: e-postası `OGRETMEN_EPOSTALARI`'nda olmayan hesap “öğrenci” sayılır.
- Editör listesi ve durum değişikliği yalnız e-postası `EDITOR_EPOSTALARI`'nda olan hesaplarla yapılabilir; Hata ve Geri Bildirim Merkezi (Editör Onay Alanı içinde) bu hesapla girişte sunucudaki kayıtları gösterir.
- Sunucu kurulu değilse ya da giriş yapılmamışsa uygulama bildirimi cihazda **taslak** olarak saklar, “gönderildi” demez; bağlantı ve giriş olunca kendiliğinden gönderir. Taslaklar Profilim › Bildirimlerim'den JSON olarak dışa aktarılıp editör cihazında içe aktarılabilir.
- Test: `node tests/v48/sunucu_test.js` (16 kontrol, gerçek Google'a bağlanmaz).

## Editör PIN sıfırlama (V51.5)

Uygulamadaki **Editör PIN'imi unuttum** düğmesi, bu sunucu kurulup e-posta servisi tanımlanmadan **çalışmaz**. O durumda uygulama “sıfırlama henüz yapılandırılmadı” yazar; “e-posta gönderildi” demez.

**Akış:**

1. Kullanıcı sıfırlama ister.
2. Sunucu tek kullanımlık 6 haneli bir kod üretir ve kodu **yalnız sunucuda tanımlı** editör e-posta adresine gönderir.
3. Kod en çok 5 kez denenebilir ve 10 dakika sonra geçersizleşir.
4. Doğru kod 10 dakikalık, tek kullanımlık bir jeton verir.
5. Yeni PIN yalnız bu jetonla kaydedilir. Kayıttan sonra PIN sürümü artar ve eski editör oturumları kapanır.
6. İşlem geçmişi `ep_gecmis` tablosunda tutulur.

**E-posta adresi, SMTP parolası ve API anahtarı yalnız sunucu ortam değişkenlerindedir; HTML'e hiçbiri yazılmaz.**

| Değişken | Açıklama |
|---|---|
| `EDITOR_SIFIRLAMA_EPOSTASI` | Kodun gönderileceği editör e-posta adresi |
| `EPOSTA_SAGLAYICI` | `smtp` ya da `resend` (`dosya` yalnız yerel testtir; gerçek e-posta göndermez, uygulama “test modu” yazar) |
| `EPOSTA_GONDEREN` | Gönderen, ör. `DKAB <no-reply@alanadiniz.com>` |
| `SMTP_SUNUCU`, `SMTP_PORT` (465), `SMTP_KULLANICI`, `SMTP_PAROLA` | SMTP (TLS, 465). Gmail için: hesapta 2 adımlı doğrulama açılır, **uygulama şifresi** oluşturulur; `SMTP_SUNUCU=smtp.gmail.com`, kullanıcı = Gmail adresi, parola = uygulama şifresi |
| `RESEND_API_ANAHTARI` | `EPOSTA_SAGLAYICI=resend` ise |
| `EP_KOD_SURE_SN` | Kod süresi (varsayılan 600 sn) |

Örnek (Gmail SMTP):

```bash
EDITOR_SIFIRLAMA_EPOSTASI=editor-adresiniz@... \
EPOSTA_SAGLAYICI=smtp EPOSTA_GONDEREN="DKAB <gonderen-adresiniz@...>" \
SMTP_SUNUCU=smtp.gmail.com SMTP_PORT=465 SMTP_KULLANICI=gonderen-adresiniz@... SMTP_PAROLA=uygulama-sifresi \
GOOGLE_CLIENT_ID=... IZINLI_KOKENLER=https://thrclvr1.github.io node sunucu/sunucu.js
```

Barındırma hizmetinde bu değerleri **gizli ortam değişkeni (secret)** olarak girin; depoya ya da HTML'e yazmayın.

| Yöntem | Yol | Açıklama |
|---|---|---|
| GET | `/api/editor-pin/durum` | `{sifirlama, saglayici, test, pinSunucuda, kodDakika}` (e-posta adresi dönmez) |
| POST | `/api/editor-pin/talep` | Kod üretir ve e-postayla gönderir → `{talepId, bitis, test}`. Yapılandırılmamışsa 503 `yapilandirilmadi`; gönderilemezse 502. Hız sınırı: adres başına 15 dakikada 3, toplam saatte 10 |
| POST | `/api/editor-pin/dogrula` | `{talepId, kod}` → `{jeton}`; hatalı kod `kalan` döner; 5 hatada kod geçersiz; süre dolunca `suresi-doldu`; tek kullanımlık |
| POST | `/api/editor-pin/tamamla` | `{jeton, pin}` (pin: 6 rakamlı **metin**) → PIN sunucuda scrypt özetiyle saklanır, sürüm artar, editör oturumları kapanır |
| POST | `/api/editor-pin/giris` | `{pin}` → `{oturum, pinSurumu}`. Sunucu taraflı doğrulama; 5 hatada kademeli kilit (1 dk, 5 dk, 15 dk, 1 sa, 6 sa). **Üretim altyapısı:** uygulama şu an PIN'i cihazda doğrular (`V51.EdPin.SUNUCU_DOGRULAMA = false`) |
| GET | `/api/editor-pin/gecmis` | `X-Editor-Oturum` başlığıyla işlem geçmişi |

Test: `node tests/v51_5/sunucu_test.js` (dosya sağlayıcısı ve yerel sahte SMTP sunucusuyla; gerçek e-posta gönderilmez).

## Bilinen sınırlar

- **Android sarmalayıcısı (WebView):** Google, gömülü WebView içinde OAuth girişine izin vermez (`disallowed_useragent`). V51.6'dan beri APK'da giriş Android'in kendi oturum açma penceresiyle (Credential Manager) yapılır. Bunun için Google Cloud'da paket `tr.dkab.platform` ve imza SHA-1'iyle bir **Android** OAuth istemcisi gerekir. Adımlar: `docs/KURULUM_SUNUCU_VE_APK.md`.
- **Hazır kurulum:** `sunucu/Dockerfile` (Docker) ve depo kökündeki `render.yaml` (Render Blueprint, kalıcı disk).
- **Dosyadan açma:** `file://` ile açılan sayfanın kökeni olmadığından Google girişi çalışmaz; uygulama web adresinden açılmalıdır.
- **Öğretmen ve editör verileri** (öğretmen kayıtları, editör onayları) bu sürümde eşitlenmez; yalnız öğrenci ilerlemesi eşitlenir.
- **Bildirimler:** Bildirim yönetimi sunucuda yetkilidir; ama içeriğin kendisinin düzeltilmesi (Editör Onay Alanı) hâlâ cihazda yapılır.
- **Yetki:** Roller sunucuda belirlenir, ama içerik onayı ve yayımlama hâlâ cihazda yapılır. Gerçek yetki denetimi için bu işlemlerin sunucu uç noktalarına taşınması gerekir.
