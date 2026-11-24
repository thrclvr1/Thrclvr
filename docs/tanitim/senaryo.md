# DKAB Öğrenme Platformu — Sinematik Tanıtım Videosu: Sahne Planı ve Üretim Adımları

- **Uygulama:** V51.7 (`index.html`)
- **Çıktılar:**
  - `docs/tanitim/dkab-tanitim-v51.7-16x9.mp4` — 1920×1080, 30 fps, H.264, 90 sn
  - `docs/tanitim/dkab-tanitim-v51.7-9x16.mp4` — 1080×1920, 30 fps, H.264, 42 sn
- **Ses:** AAC 256 kb/sn, 48 kHz stereo, −14 LUFS'a normalize.

## Temel ilke: yalnız gerçek ekranlar

Telefon ve tablet içindeki her görüntü uygulamanın **gerçek** ekran kaydıdır. Kayıtlar `tools/tanitim/kayit.js` ile alınır. Kayıt sırasında uygulama yeni bir profille açılır:
- hesap girişi yok, kişisel veri yok (“Misafir öğrenci”);
- rehber baloncukları kapalı;
- uygulamanın yalnız kendi işlevleri çağrılır.

Videoda bunlara eklenen şeyler yalnız şunlardır:
- cihaz çerçevesi;
- kamera hareketi (yakınlaştırma, kaydırma, 3B dönüş);
- ışık, parçacık ve vurgu halkası;
- yazılar.

Hiçbir ekran yeniden çizilmedi, uydurma düğme ya da içerik eklenmedi.

Hareketli bölümler de gerçektir:
- **Altın koridorda yürüyüş:** Playwright sahte saatiyle 30 fps kare kare kaydedildi.
- **3B kütüphanede oda dönüşü:** aynı yöntemle 30 fps kare kare kaydedildi.
- **Ana sayfa ve Oyun Dünyası kaydırması:** sayfa adım adım gerçekten kaydırılarak kaydedildi.
- **Arama kutusuna yazma ve mini teste cevap verme:** uygulamada adım adım yapıldı.

**Kapsam notu:** Uygulamada yalnız Elmas'ta bulunan ayrı bir oyun yok. Bu yüzden videoda “Elmas'a özel oyun” gösterilmez. Gösterilen ve doğru olan bilgiler şunlardır:
- Etkinlik Oyunları iki modda da var.
- 3B Oyun Dünyası yalnız Altın'da (kütüphane, sınıf dünyaları).

## Görsel dil

| Bölüm | Renk / ortam | Cihaz çerçevesi |
|---|---|---|
| Açılış ve kapanış | gece mavisi-siyah, altın ışık huzmeleri, altın parçacıklar | — (uygulamanın kendi amblemi) |
| Ana ekran, Elmas | lacivert/safir, kristal beyaz parçacık, mavi ışık süpürmesi | gümüş-mavi |
| Altın | sıcak kehribar-altın, altın ışık süpürmesi | altın |
| Oyunlar | koyu mor-lacivert, hızlı parçacık (en enerjik bölüm) | altın / mavi |
| Öğretmen | açık gri-mavi, sade, parçacık neredeyse yok, koyu yazı | açık gümüş |
| Editör | açık turkuaz tonu, turkuaz vurgu | açık gümüş |

**Efektler:**
- yumuşak yakınlaştırma/uzaklaştırma (ekran içinde);
- paralaks (arkadaki ikinci cihaz bulanık ve yavaş hareket eder);
- sinematik kaydırma (pan);
- odak geçişi (bulanıklaştırarak giriş/çıkış);
- Altın/Elmas ışık süpürmesi;
- hızlı geçişlerde hareket bulanıklığı;
- uyum kesmesi (Altın → Elmas, beyaz parlama ile);
- 3B cihaz dönüşü (ekran değişimi dönüşün ortasında);
- bölünmüş ekran (Altın | Elmas);
- dokunma halkası (gerçek dokunulan yerde).

**Yazı tipi:** Inter Display / Inter.

## 16:9 sahne planı (90 sn, 120 BPM; 1 ölçü = 2 sn)

| Zaman | Ekran (gerçek kayıt) | Bölge / vurgu | Kamera | Geçiş | Ekran yazısı | Ses |
|---|---|---|---|---|---|---|
| **S1 0–8** | Uygulama amblemi | amblem üzerinde ışık süpürmesi | 0,82→1,0 yaklaşma; 6,9–8,1 amblemin içinden geçiş (×6,5) | siyahtan açılış; 8,0'da beyaz parlama | “DKAB ÖĞRENME PLATFORMU”, “Öğrenmenin yeni dünyasına hoş geldin.” (kelime kelime) | gizemli pad + alt bas; 2,0 darbe; 3,0 ışıltı; 5–8 yükselen; 7,9 whoosh |
| **S2 8–20** | Elmas ana sayfa (`e_ana`), gerçek kaydırma (`e_ana_kaydir`) | 10,4 arama kutusu; 12/13/14/15 Derslerim, Oyunlar, Çalışmam, Profilim (dokunma halkası) | 3B dönüşle aşağıdan yükselir; aramaya 1,9× yakınlaşma; kartlara 1,18×; kaydırırken Y ekseninde −8°→+12° pan | 19–20 odak bulanıklığıyla uzaklaşma | “Her şey tek dokunuşta”, “Konu, kavram, kişi ve kazanım ara”, sırayla parlayan liste, “Hızlı erişim” | nabız + arpej; kartlarda tık sesleri; 19,9 whoosh |
| **S3a 20–22** | Mod paneli (`e_mod_paneli`) | Elmas kartı (mavi), Altın kartı (altın) | odak çekme ile giriş, 1,22× | odak bulanıklığı | “İki öğrenme alanı”, “İlerlemen, favorilerin ve seçtiğin sınıf her modda korunur.” | 20,0 darbe |
| **S3b 22–29 Altın** | koridor yürüyüşü (60 kare), 5. sınıf merkezi, konu, Oyun Dünyası + kaydırma | “Oyun Dünyası” başlığı | soldan 3B dönüşle giriş; arkada bulanık ikinci telefon (paralaks); ekranlar arası itme | 22,0 altın ışık süpürmesi; 28,9 hızlı kaydırma (hareket bulanıklığı) | “Keşif dolu 3B okul koridoru”, “Sınıf merkezi ve konu anlatımı”, “Yalnız Altın'da: 3B Oyun Dünyası” | 22 whoosh + ışıltı; davul girer |
| **S3c 29–35 Elmas** | Sınıflar, 5. sınıf, konu ekranı | 5. sınıf kartı; konu başlığına 1,45× | sağdan giriş (Altın'ın ayna görüntüsü = uyum kesmesi), paralaks | 29,0 beyaz parlama + mavi kristal süpürme | “Ferah, sade ve hızlı” | 29 darbe + çan dizisi; 1/8 arpej |
| **S3d 35–38** | Altın Etkinlik oyunları \| Elmas Oyunlar | Elmas oyun türleri listesi | bölünmüş ekran; telefonlar yukarıdan/aşağıdan gelir | 37,4–38 kameraya doğru odak bulanıklığı | “Etkinlik Oyunları iki alanda da”, “3B Oyun Dünyası yalnız Altın'da” | 35 whoosh; 36–38 yükselen + klap dizisi |
| **S4 38–56** | Konu (`e_konu`, `_metin`, `_gecis`), arama yazma dizisi, mini test dizisi, Çalışma Merkezim | Öğren/Pekiştir/Kendini Dene; önceki/sonraki konu; arama kutusu; sonuçlar; süzgeç çipleri; “Doğru, tebrikler!” | başlığa 1,6× yakınlaşma; 43,0'da 3B dönüşle ekran değişimi; 49,0'da itme geçişi | dokunma halkaları (Mini Test, doğru şık) | “Öğren · Pekiştir · Kendini Dene”, “Tek aramada her şey”, “Mini testlerle anında geri bildirim”, “İlerlemeni takip et” | groove; yazarken tık sesleri; 50,2/52,2 tık; 52,3 ışıltı; 54–56 yükselen |
| **S5 56–68** | Etkinlik oyunu (soru → cevap), bilgi kartı (soru → cevap), 3B Kütüphane (giriş, 102 karelik oda dönüşü, nesne paneli), sınıf dünyası | doğru cevap kutusu | sert giriş (ölçek 1,35→1), hızlı kaydırmalar, kart için 3B çevirme, kütüphanede yörünge dönüşü, iki bulanık arka telefon | her 2 sn'de bir geçiş, hareket bulanıklığı | “Oyna, öğren”, “Çevir, hatırla, tekrar et”, “Kayıp Bilgeliğin Kütüphanesi”, “Sınıf dünyaları” | en enerjik bölüm: 1/16 hi-hat, açık hi-hat; 56/58/60/66 darbe |
| **S6 68–80** | Öğretmen: Haftalık (10. hafta), Sınıflarım, Öğretmen Araması. Editör: ana panel, onay listesi, içerik kaydı, yayın durumu | 10. hafta kartı; editör kuyrukları; toplu işlem çubuğu; sıkı yayın tablosu | sağdan 3B dönüşle tablet; hafta şeridine 1,55×; 74'te 3B dönüşle editöre geçiş | itme geçişleri | “Haftalık plan”, “Sınıflarım”, “Öğretmen araması”, “İçerik kontrolü: İncele → Onayla → Yayımla” | sakin, profesyonel; 77–80 yükselen |
| **S7 80–90** | 24 gerçek ekrandan eğik 3B kolaj, sonra amblem | — | kolaj çapraz kayar; 84–86 içinden geçiş; amblem 1,35→1 | 80,0 ve 86,0 parlama; 89,2–90 siyaha geçiş | “Altın · Elmas · 4–12. sınıf”, “Bilgiyi keşfet. Öğren. Geliş.”, “DKAB Öğrenme Platformu”, “Din Kültürü ve Ahlak Bilgisi · 4–12. sınıf” | 80 büyük darbe; 84 whoosh; 86 büyük darbe + son akor |

## 9:16 sahne planı (42 sn)

| Zaman | İçerik |
|---|---|
| 0–4 | amblem, ışık huzmeleri, “Öğrenmenin yeni dünyasına hoş geldin.” |
| 4–8 | Elmas ana sayfa: arama ve dört ana kart vurgusu |
| 8–14 | Altın: koridor yürüyüşü → konu → 3B Oyun Dünyası (“Yalnız Altın'da”) |
| 14–18 | Elmas: Sınıflar → 5. sınıf → konu (“Ferah, sade ve hızlı”) |
| 18–22 | yan yana Altın/Elmas Etkinlik Oyunları, “3B Oyun Dünyası yalnız Altın'da” |
| 22–26 | arama: yazma ve sonuçlar |
| 26–30 | mini test: dokunma ve “Doğru, tebrikler!” |
| 30–36 | 3B Kütüphane: oda dönüşü, nesne paneli, sınıf dünyası |
| 36–38 | öğretmen haftalık planı → editör onay listesi |
| 38–42 | amblem, slogan, uygulama adı |

Telefon büyük ve ortada durur; yazılar üstte ve altta, telefonun üstüne binmez.

## Müzik ve ses efektleri

`tools/tanitim/muzik.py` müziği ve efektleri **tamamen kodla sentezler**: hiçbir örnek, kayıt ya da hazır müzik kullanılmaz, dolayısıyla telif sorunu yoktur. Uygulamanın kendi müzikleri (`m42-*`) kullanılmadı, çünkü lisans bilgileri kaynakta yok.

- **Yapı:** 120 BPM, Re minör (Dm–B♭–F–C).
- **Bölümler:**
  - açılışta gizemli pad;
  - mod geçişlerinde yükselen yapı ve darbeler;
  - oyunlarda en yoğun davul;
  - öğretmen/editör bölümünde sakin;
  - finalde büyük darbe ve uzun son akor.
- **Efektler:** whoosh (süzgeçli gürültü), tık, darbe, ışıltı (çan). Ekrandaki olaylarla aynı anlara yerleştirildi ve müziğin altında kalacak düzeyde tutuldu.

## Üretim adımları (yeniden üretmek için, depo kökünden)

1. Gerçek ekranları kaydet:
   ```
   node tools/tanitim/kayit.js
   ```
   - Çıktı `tools/tanitim/.kayit/` klasörüne yazılır (depoya eklenmez).
   - Bölümler tek tek de kaydedilebilir: `e_`, `a_`, `o_`, `t_`, `s_`.
   - Vurgu konumları `tools/tanitim/olcu.json` dosyasındadır (CSS px). Ekran tasarımı değişirse yeniden ölçülmelidir.
2. Müziği üret (yaklaşık 25 sn sürer):
   ```
   python3 tools/tanitim/muzik.py
   ```
   Çıktı `tools/tanitim/.ses/` klasörüne yazılır.
3. İstenirse tek tek karelere önizleme olarak bak:
   ```
   node tools/tanitim/render.js yatay --onizle 12,30,60
   ```
4. Videoları üret:
   ```
   node tools/tanitim/render.js yatay
   node tools/tanitim/render.js dikey
   ```
   - Kareler `tools/tanitim/sahne.html` içinde zamana bağlı ve belirlenimci biçimde çizilir: aynı girdiyle her seferinde aynı video çıkar.
   - Kareler ffmpeg'e (libx264, CRF 19, yuv420p) borudan aktarılır.

Bir sahneyi değiştirmek için `sahne.html` içindeki ilgili `sahne(t0, t1, …)` bloğu düzenlenir. Sahneler zaman aralıklarıyla ayrıdır, birbirinden bağımsız üretilip tek zaman çizelgesinde birleşir.

## Denetlenen / denetlenmeyen

- **Denetlenen:**
  - Çıktı biçimi `ffprobe` ile doğrulandı:
    - 16:9 → H.264, 1920×1080, 30 fps, 90,0 sn
    - 9:16 → H.264, 1080×1920, 30 fps, 42,0 sn
    - ses AAC 48 kHz stereo
  - Ses düzeyi yaklaşık −13,4 LUFS, tepe −1,5 dBFS (kırpma yok).
  - Her sahneden kareler çıkarılıp gözle incelendi: ekranlar, yazılar, vurgu halkalarının doğru öğede durması.
- **Denetlenmeyen:**
  - Müzik ve efektler bu ortamda dinlenemedi; yalnız düzey ölçüldü. Karışım dengesi (efektlerin müziği bastırmaması) kulakla doğrulanmadı.
  - Videolar gerçek telefonda, televizyonda ya da sosyal medya platformuna yüklenerek oynatılmadı.
- **Bilinen sınırlar:**
  - 3B dönüş ve hızlı kaydırma geçişlerinin tam ortasında (43,3 sn, 49,0 sn, 59,1 sn) bir–iki kare cihaz görünmez; bu, geçişin doğal parçasıdır.
  - Kayıtlar Chromium'da 390×844 telefon görünümüyle alındı; gerçek Android cihazdaki yazı tipi oluşturması biraz farklı olabilir.
