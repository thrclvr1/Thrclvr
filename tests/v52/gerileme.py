"""Gerileme: V51.9, V51.8 ve V51.5 testlerini V52.0 dosyasına yönlendirilmiş kopyalarla çalıştırır.
Çalıştırma (depo kökünden): python3 tests/v52/gerileme.py
V52.0: istemci kimliği (dk-google52) girilmemiş cihazda yönetici akışı V51.9 ile aynıdır; sunucu adresi kuran testler V51.9 yolunu izler.
Kopyalar tests/v52/.gerileme/ altına yazılır (depoya eklenmez). V51.9'da yönetici (editör) alanı Google doğrulaması + PIN ister;
eski testler Google adımından habersiz olduğundan kopyalarda her tarayıcı bağlamına “geçiş dönemi” yönetici kaydı eklenir
(sessionStorage dk-yonetici519 = {v:1, yol:'gecis'}). Bu kayıt yalnız sunucu adresi girilmemiş cihazda geçerlidir; sunucu adresi
kuran V51.5 PIN sıfırlama testleri ise Google adımı tamamlanmış sayılarak çalıştırılır (Google adımı test_v519.js'de sınanır).
Altın Mod V51.8'den beri kapalıdır."""
import os, re, subprocess, sys
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(R, 'tests', 'v52', '.gerileme'); os.makedirs(D, exist_ok=True)
OKU = os.path.join(D, 'v52.0-okunur.html')
subprocess.run(['node', os.path.join(R, 'tests', 'v51_3', 'ac513.js'), os.path.join(R, 'surumler', 'din-kulturu-platformu-v52.0.html'), OKU], check=True)
def kopya(src, dst, eski, ver, ekran, rehber=True, gecis=True):
    s = open(os.path.join(R, src), encoding='utf-8').read()
    s = s.replace("path.resolve(__dirname, '..', '..')", "path.resolve(__dirname, '..', '..', '..')")
    s = re.sub(r"path\.join\(ROOT, 'docs', '[^']+_ekran'\)", "path.join(__dirname, '%s')" % ekran, s)
    s = s.replace("din-kulturu-platformu-%s.html" % eski, "din-kulturu-platformu-v52.0.html")
    s = s.replace(ver.replace('.', '\\.'), 'V52\\.0').replace("'%s'" % ver, "'V52.0'")
    s = s.replace("x.includes('%s')" % eski, "x.includes('v52.0')")
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
    open(os.path.join(D, dst), 'w', encoding='utf-8').write(s)
kopya('tests/v51_9/test_v519.js', 't519.js', 'v51.9', 'V51.9', 'ekran519', rehber=False, gecis=False)  # yönetici adımlarını kendisi kurar
kopya('tests/v51_8/test_v518.js', 't518.js', 'v51.8', 'V51.8', 'ekran518', rehber=False)  # kendi dk-rehber517 değerini kurar
kopya('tests/v51_5/test_v515.js', 't515.js', 'v51.5', 'V51.5', 'ekran515')
for t in (sys.argv[1:] or ['t519.js', 't518.js', 't515.js']):
    r = subprocess.run(['node', os.path.join(D, t)], cwd=R, capture_output=True, text=True)
    print(t); print('\n'.join(l[:260] for l in r.stdout.splitlines() if l.startswith(('✘', 'KALDI', 'Toplam')) or 'kontrol geçti' in l))
