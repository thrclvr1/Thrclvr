"""Gerileme: V51.6, V51.5 ve V51.4 testlerini V51.7 dosyasına yönlendirilmiş kopyalarla çalıştırır.
Çalıştırma (depo kökünden): python3 tests/v51_7/gerileme.py
Kopyalar ve ekran görüntüleri tests/v51_7/.gerileme/ altına yazılır (depoya eklenmez).
V51.7 veri blokları paketli. Eski testler rehberden habersiz olduğundan kopyalarda her tarayıcı bağlamına
“rehberleri kendiliğinden gösterme” tercihi (dk-rehber517 = {v:1, otomatik:false}) eklenir olduğundan kopyalarda .html okumaları tests/v51_3/ac513.js ile açılır (tarayıcı paketli dosyayı açar)."""
import os, re, subprocess, sys
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(R, 'tests', 'v51_7', '.gerileme'); os.makedirs(D, exist_ok=True)
OKU = os.path.join(D, 'v51.7-okunur.html')
subprocess.run(['node', os.path.join(R, 'tests', 'v51_3', 'ac513.js'), os.path.join(R, 'surumler', 'din-kulturu-platformu-v51.7.html'), OKU], check=True)
def kopya(src, dst, eski, ver, ekran):
    s = open(os.path.join(R, src), encoding='utf-8').read()
    s = s.replace("path.resolve(__dirname, '..', '..')", "path.resolve(__dirname, '..', '..', '..')")
    s = re.sub(r"path\.join\(ROOT, 'docs', '[^']+_ekran'\)", "path.join(__dirname, '%s')" % ekran, s)
    s = s.replace("din-kulturu-platformu-%s.html" % eski, "din-kulturu-platformu-v51.7.html")
    s = s.replace(ver.replace('.', '\\.'), 'V51\\.7').replace("'%s'" % ver, "'V51.7'")
    s = s.replace("x.includes('%s')" % eski, "x.includes('v51.7')")
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
    s = s.replace(a, a + "\n{const _l = chromium.launch.bind(chromium); chromium.launch = async (...x) => { const br = await _l(...x); const _n = br.newContext.bind(br); br.newContext = async (...y) => { const c = await _n(...y); await c.addInitScript(() => { try { if (!localStorage.getItem('dk-rehber517')) localStorage.setItem('dk-rehber517', JSON.stringify({v: 1, otomatik: false})); } catch (e) {} }); return c; }; return br; };}", 1)
    open(os.path.join(D, dst), 'w', encoding='utf-8').write(s)
kopya('tests/v51_6/test_v516.js', 't516.js', 'v51.6', 'V51.6', 'ekran516')
kopya('tests/v51_5/test_v515.js', 't515.js', 'v51.5', 'V51.5', 'ekran515')
kopya('tests/v51_4/test_v514.js', 't514.js', 'v51.4', 'V51.4', 'ekran514')
for t in (sys.argv[1:] or ['t516.js', 't515.js', 't514.js']):
    r = subprocess.run(['node', os.path.join(D, t)], cwd=R, capture_output=True, text=True)
    print(t); print('\n'.join(l[:260] for l in r.stdout.splitlines() if l.startswith(('✘', 'KALDI', 'Toplam')) or 'kontrol geçti' in l))
