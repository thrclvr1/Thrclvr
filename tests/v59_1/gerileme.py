"""Gerileme: V59.0, V58.0 ve V51.5 testlerini V59.1 dosyasına yönlendirilmiş kopyalarla çalıştırır.
Çalıştırma (depo kökünden): python3 tests/v59_1/gerileme.py
Bilinçli farklar: V59.0 Z1 kazanım kartının her temada altın çerçeveli olmasını bekler; V59.1'de kart temanın kendi tonunda
(Lacivert/Elmas mavi, Zümrüt yeşil, Mürekkep mor). V59.0 F0 karşılaştırması V58.0 dosyasıyla yapılır (değişmedi).
Kopyalar tests/v59_1/.gerileme/ altına yazılır."""
import os, re, subprocess, sys
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(R, 'tests', 'v59_1', '.gerileme'); os.makedirs(D, exist_ok=True)
OKU = os.path.join(D, 'v59.1-okunur.html')
subprocess.run(['node', os.path.join(R, 'tests', 'v51_3', 'ac513.js'), os.path.join(R, 'surumler', 'din-kulturu-platformu-v59.1.html'), OKU], check=True)
K0 = "const ROOT = path.resolve(__dirname, '..', '..', '..');"
def kopya(src, dst, eski, ver, ekran, rehber=True, gecis=True, giris=True):
    s = open(os.path.join(R, src), encoding='utf-8').read()
    s = s.replace("path.resolve(__dirname, '..', '..')", "path.resolve(__dirname, '..', '..', '..')")
    s = re.sub(r"path\.join\(ROOT, 'docs', '[^']+_ekran'\)", "path.join(__dirname, '%s')" % ekran, s)
    s = s.replace("din-kulturu-platformu-%s.html" % eski, "din-kulturu-platformu-v59.1.html")
    s = s.replace(ver.replace('.', '\\.'), 'V59\\.1').replace("'%s'" % ver, "'V59.1'")
    s = s.replace("x.includes('%s')" % eski, "x.includes('v59.1')")
    s = s.replace("'tools', 'v43', 'denetim_sonuc.json'", "'tools', 'v51', 'denetim_sonuc.json'").replace("'tools', 'v45', 'denetim_sonuc.json'", "'tools', 'v51', 'denetim_sonuc.json'").replace("'tools', 'v44', 'denetim_sonuc.json'", "'tools', 'v51', 'denetim_sonuc.json'").replace("'tools', 'v46', 'denetim_sonuc.json'", "'tools', 'v51', 'denetim_sonuc.json'").replace("'tools', 'v47', 'denetim_sonuc.json'", "'tools', 'v51', 'denetim_sonuc.json'").replace("'tools', 'v48', 'denetim_sonuc.json'", "'tools', 'v51', 'denetim_sonuc.json'")
    s = s.replace("path.join(__dirname, 'son_sonuc.json')", "path.join(__dirname, '%s.json')" % ekran)
    # V48: Ses ve müzik bölümü yeni ses paneliyle değişti; eski seçiciler yeni karşılıklarına yönlendirilir
    s = s.replace("document.querySelector('.a47-rng')", "document.querySelector('.sp48-vol input')").replace("p.click('.a47-mz button')", "p.click('ul.sp48-l:nth-of-type(2) button')")
    # V50: Öğrenme alanı kartları ortak mod kartlarıyla değişti; eski seçiciler yeni karşılıklarına yönlendirilir
    s = s.replace("await p.click('.a47-oz'); await p.waitForTimeout(400);", "await p.evaluate(() => go('ayar47', {at: 'alan'})); await p.waitForTimeout(400);").replace("'.a47-dk.al'", "'.mk50-k.altin'").replace("'.a47-dk.el'", "'.mk50-k.elmas'").replace("'.a47-dk.on b'", "'.mk50-k.on b'").replace("querySelectorAll('.a47-dk')", "querySelectorAll('.mk50-k')")
    # V51.1: Ana Panel'deki editör düğmesi kaldırıldı; adım editör rotasına yönlendirilir (T10/T10b bilinçli olarak farklı)
    s = s.replace("await p.click('.ap51-bb button'); await bek(500);", "await p.evaluate(() => go('editor')); await bek(500);")
    s = s.replace("path.join(__dirname, 'yp_karsilastir.js')", "path.join(ROOT, 'tests', 'v51', 'yp_karsilastir.js')")
    s = s.replace("require('../v51_3/ac513.js')", "require(path.join(ROOT, 'tests', 'v51_3', 'ac513.js'))")
    s = s.replace("require('./ac513.js')", "require(path.join(ROOT, 'tests', 'v51_3', 'ac513.js'))")
    # V51.3: paketli veri blokları — .html dosya okumaları açılmış metni döndürür
    a = "const ROOT = path.resolve(__dirname, '..', '..', '..');"
    assert a in s, src
    s = s.replace(a, a + "\n{const _r = fs.readFileSync, AC = require(path.join(ROOT, 'tests', 'v51_3', 'ac513.js')); fs.readFileSync = function (f) { const x = _r.apply(this, arguments); return (typeof x === 'string' && /\\.html$/.test(String(f))) ? AC(x) : x; };}", 1)
    s = s.replace("[path.join(ROOT, 'tests', 'v51', 'yp_karsilastir.js'), path.join(ROOT, F51)]", "[path.join(ROOT, 'tests', 'v51', 'yp_karsilastir.js'), OKU]")
    s = s.replace(a, a + "\nconst OKU = %r;" % OKU, 1)
    # V51.7: eski testlerde rehber kendiliğinden açılmasın (kullanıcının “kendiliğinden gösterme” tercihiyle aynı)
    if gecis: s = s.replace(a, a + "\n{const _l = chromium.launch.bind(chromium); chromium.launch = async (...x) => { const br = await _l(...x); const _n = br.newContext.bind(br); br.newContext = async (...y) => { const c = await _n(...y); await c.addInitScript(() => { try { if (!sessionStorage.getItem('dk-yonetici519')) sessionStorage.setItem('dk-yonetici519', JSON.stringify({v: 1, yol: 'gecis', t: Date.now()})); } catch (e) {} }); return c; }; return br; };}", 1)
    if rehber: s = s.replace(a, a + "\n{const _l = chromium.launch.bind(chromium); chromium.launch = async (...x) => { const br = await _l(...x); const _n = br.newContext.bind(br); br.newContext = async (...y) => { const c = await _n(...y); await c.addInitScript(() => { try { if (!localStorage.getItem('dk-rehber517')) localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); } catch (e) {} }); return c; }; return br; };}", 1)
    # V51.8: Altın Mod kapalı — V51.4'ün Altın arama bölümü yarıda kesilirse kalan (öğretmen) bölümleri sürsün; bölüm ✘ sayılır
    s = s.replace("  /* ---------- L. Altın ---------- */\n  {", "  /* ---------- L. Altın ---------- */\n  try {", 1)
    s = s.replace("  }\n\n  /* ---------- T. Öğretmen", "  } catch (e) { ok('L* Altın arama bölümü yarıda kaldı (V51.8: Altın Mod kapalı): ' + String(e.message).slice(0, 90), false); }\n\n  /* ---------- T. Öğretmen", 1)
    s = s.replace("  for (const [ad, d] of [['Altın', 'premium'], ['Elmas', 'normal'], ['Öğretmen', 'normal']]) {", "  ok('M* Altın küçük ekran/klavye araması çalıştırılmadı (V51.8: Altın Mod kapalı)', false);\n  for (const [ad, d] of [['Elmas', 'normal'], ['Öğretmen', 'normal']]) {", 1)
    # V51.9: V51.5'in PIN ve e-postayla sıfırlama testleri, yönetici girişinin 1. adımı (Google) tamamlanmış sayılarak çalıştırılır
    # (V51.Yonetici.tamam = () => true); Google adımının kendisi tests/v51_9/test_v519.js'de gerçek sunucuyla sınanır.
    s = s.replace("const editorAc = (p) => p.evaluate(async () => { go('editor');", "const editorAc = (p) => p.evaluate(async () => { try { V51.Yonetici.tamam = () => true; } catch (e) {} go('editor');", 1)
    # V52.0: kurulum ekranının açıklaması uzadı; V51.9 testi ekran metninin ilk 260 karakterini okuyordu
    s = s.replace("c.innerText.replace(/\\s+/g, ' ').slice(0, 260)", "c.innerText.replace(/\\s+/g, ' ').slice(0, 900)")
    # V52.3: APK adresinde giriş ekranı geçilmiş sayılır (misafir); eski testler giriş ekranından habersiz
    if giris: s = s.replace(K0, K0 + "\n{const _l = chromium.launch.bind(chromium); chromium.launch = async (...x) => { const br = await _l(...x); const _n = br.newContext.bind(br); br.newContext = async (...y) => { const c = await _n(...y); await c.addInitScript(() => { try { if (!localStorage.getItem('dk-giris523')) localStorage.setItem('dk-giris523', JSON.stringify({v: 1, tur: 'misafir'})); } catch (e) {} }); return c; }; return br; };}", 1)
    # V52.3: seçim ekranındaki Google düğmesi APK'da gizli (giriş ayrı ekranda); eski K1 aynı işlevi doğrudan çağırır
    s = s.replace("await p.click('#uye39 .hs46-g');", "await p.evaluate(() => V46.Hesap.googleGiris());")
    # V53.0: sınıf sorusu eski testlerde kapalı (her yükleniş), bütün sınıflar görünümü açık
    s = s.replace(K0, K0 + "\n{const _l = chromium.launch.bind(chromium); chromium.launch = async (...x) => { const br = await _l(...x); const _n = br.newContext.bind(br); br.newContext = async (...y) => { const c = await _n(...y); await c.addInitScript(() => { try { sessionStorage.setItem('dk-tum53', '1'); if (!localStorage.getItem('dk-profil53')) localStorage.setItem('dk-profil53', JSON.stringify({v: 1, h: {misafir: {sinif: 5}}})); let t = 0; const iv = setInterval(() => { if (window.V53 && V53.Hesap) { V53.Hesap.gerekli = () => false; clearInterval(iv); } if (++t > 400) clearInterval(iv); }, 5); } catch (e) {} }); return c; }; return br; };}", 1)
    # V54.0: sınıf sorusu açılışta zorunlu değil (öğrenme bölümüne girerken); V53 S bölümü için pencere elle açılır
    s = s.replace("await p.click('#gir523 .g523-m'); await bek(500);", "await p.click('#gir523 .g523-m'); await bek(500); await p.evaluate(() => V53.Hesap.sinifAc(false)); await bek(200);")
    # V55.0: akordiyon düğmesi .ak54 → .ak55-b (konu listesi artık [hidden] değil, ünite gövdesi kapanır; E3 bilinçli olarak farklı)
    s = s.replace("'.ak54'", "'.ak55-b'").replace("querySelectorAll('.ak54')", "querySelectorAll('.ak55-b')")
    # V56.0: tema seçim ekranında beş palet yerine Açık/Koyu/Otomatik (.tm56-k); V55 AL7 seçicileri yönlendirilir (çökmesin, kalan kontroller çalışsın)
    s = s.replace("document.querySelector('.tm54-k.on')", "document.querySelector('.tm54-k.on, .tm56-k.on, .tm57-k.on')").replace("document.querySelector('.gg54 button[aria-pressed=\"true\"]')", "document.querySelector('.gg54 button[aria-pressed=\"true\"], .tm56-k.on')")
    # V57.0: Elmas Profilim'de “İlerlemem” (.pr49-ilr) yok; V56 H bölümü ekran görüntüsü için kaydırırken çökmesin (H1 bilinçli olarak farklı)
    s = s.replace("document.querySelector('.pr49-ilr').getBoundingClientRect()", "(document.querySelector('.pr49-ilr') || document.body).getBoundingClientRect()")
    # V57.0: V56 ortak tema (V56.Tema) bilinçli olarak geri alındı; V56 T bölümü çalıştırılmaz (✘ sayılır), Altın gündüz/gece V43 ile
    s = s.replace("  /* ---------- T: ortak tema ---------- */\n  {", "  /* ---------- T: ortak tema ---------- */\n  ok('T* V56 ortak tema bölümü çalıştırılmadı (V57: Altın/Öğretmen kendi temalarına döndü; yeni davranış test_v570.js T1–T7)', false);\n  if (false) {", 1)
    s = s.replace("V56.Tema.sec('acik')", "V43.ayarla('gunduz')").replace("V56.Tema.sec('koyu')", "V43.ayarla('gece')")
    # V57.0: “Nereden başlamalıyım?” (.sn55) yerine “Nerede Kaldım?” (.nk57); V55 AL6 tema kontrastı yeni devam düğmesinde ölçülür
    s = s.replace("dv = cs('.sn55-dv em')", "dv = cs('.sn55-dv em') || cs('.nk57-d')")
    open(os.path.join(D, dst), 'w', encoding='utf-8').write(s)
kopya('tests/v59/test_v590.js', 't590.js', 'v59.0', 'V59.0', 'ekran590', rehber=False, gecis=False, giris=False)
kopya('tests/v58/test_v580.js', 't580.js', 'v58.0', 'V58.0', 'ekran580', rehber=False, gecis=False, giris=False)
kopya('tests/v51_5/test_v515.js', 't515.js', 'v51.5', 'V51.5', 'ekran515')
for t in (sys.argv[1:] or ['t590.js', 't580.js', 't515.js']):
    r = subprocess.run(['node', os.path.join(D, t)], cwd=R, capture_output=True, text=True)
    print(t); print('\n'.join(l[:260] for l in r.stdout.splitlines() if l.startswith(('✘', 'KALDI', 'Toplam')) or 'kontrol geçti' in l))
    if r.returncode and not any('kontrol geçti' in l for l in r.stdout.splitlines()): print('  (çıkış kodu %d) %s' % (r.returncode, r.stderr.strip().splitlines()[-1:] if r.stderr.strip() else ''))
