# DKAB hesap ve bulut kayıt sunucusu (V46.0)

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
| `IZINLI_KOKENLER` | evet | Uygulamanın açıldığı köken(ler), virgülle (CORS). Başka sitelerden gelen istekler reddedilir. |
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

## Bilinen sınırlar

- **Android sarmalayıcısı (WebView):** Google, gömülü WebView içinde OAuth girişine izin vermez (`disallowed_useragent`). APK'da Google girişi için yerel Android oturum açma (Credential Manager) eklenmesi gerekir. Bu yapılmadı.
- **Dosyadan açma:** `file://` ile açılan sayfanın kökeni olmadığından Google girişi çalışmaz; uygulama web adresinden açılmalıdır.
- **Öğretmen ve editör verileri** (öğretmen kayıtları, editör onayları) bu sürümde eşitlenmez; yalnız öğrenci ilerlemesi eşitlenir.
- **Yetki:** Roller sunucuda belirlenir, ama içerik onayı ve yayımlama hâlâ cihazda yapılır. Gerçek yetki denetimi için bu işlemlerin sunucu uç noktalarına taşınması gerekir.
