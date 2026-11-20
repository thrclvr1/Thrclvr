"""Gerileme: V51.0 ve V50.0 testlerini V51.1 dosyasına yönlendirilmiş kopyalarla çalıştırır.
Çalıştırma (depo kökünden): python3 tests/v51_1/gerileme.py
Kopyalar ve ekran görüntüleri tests/v51_1/.gerileme/ altına yazılır (depoya eklenmez)."""
import os, re, subprocess, sys
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(R, 'tests', 'v51_1', '.gerileme'); os.makedirs(D, exist_ok=True)
def kopya(src, dst, eski, ver, ekran):
    s = open(os.path.join(R, src), encoding='utf-8').read()
    s = s.replace("path.resolve(__dirname, '..', '..')", "path.resolve(__dirname, '..', '..', '..')")
    s = re.sub(r"path\.join\(ROOT, 'docs', '[^']+_ekran'\)", "path.join(__dirname, '%s')" % ekran, s)
    s = s.replace("din-kulturu-platformu-%s.html" % eski, "din-kulturu-platformu-v51.1.html")
    s = s.replace(ver.replace('.', '\\.'), 'V51\\.1').replace("'%s'" % ver, "'V51.1'")
    s = s.replace("x.includes('%s')" % eski, "x.includes('v51.1')")
    s = s.replace("'tools', 'v43', 'denetim_sonuc.json'", "'tools', 'v51', 'denetim_sonuc.json'").replace("'tools', 'v45', 'denetim_sonuc.json'", "'tools', 'v51', 'denetim_sonuc.json'").replace("'tools', 'v44', 'denetim_sonuc.json'", "'tools', 'v51', 'denetim_sonuc.json'").replace("'tools', 'v46', 'denetim_sonuc.json'", "'tools', 'v51', 'denetim_sonuc.json'").replace("'tools', 'v47', 'denetim_sonuc.json'", "'tools', 'v51', 'denetim_sonuc.json'").replace("'tools', 'v48', 'denetim_sonuc.json'", "'tools', 'v51', 'denetim_sonuc.json'")
    s = s.replace("path.join(__dirname, 'son_sonuc.json')", "path.join(__dirname, '%s.json')" % ekran)
    # V48: Ses ve müzik bölümü yeni ses paneliyle değişti; eski seçiciler yeni karşılıklarına yönlendirilir
    s = s.replace("document.querySelector('.a47-rng')", "document.querySelector('.sp48-vol input')").replace("p.click('.a47-mz button')", "p.click('ul.sp48-l:nth-of-type(2) button')")
    # V50: Öğrenme alanı kartları ortak mod kartlarıyla değişti; eski seçiciler yeni karşılıklarına yönlendirilir
    s = s.replace("await p.click('.a47-oz'); await p.waitForTimeout(400);", "await p.evaluate(() => go('ayar47', {at: 'alan'})); await p.waitForTimeout(400);").replace("'.a47-dk.al'", "'.mk50-k.altin'").replace("'.a47-dk.el'", "'.mk50-k.elmas'").replace("'.a47-dk.on b'", "'.mk50-k.on b'").replace("querySelectorAll('.a47-dk')", "querySelectorAll('.mk50-k')")
    # V51.1: Ana Panel'deki editör düğmesi kaldırıldı; adım editör rotasına yönlendirilir (T10/T10b bilinçli olarak farklı)
    s = s.replace("await p.click('.ap51-bb button'); await bek(500);", "await p.evaluate(() => go('editor')); await bek(500);")
    s = s.replace("path.join(__dirname, 'yp_karsilastir.js')", "path.join(ROOT, 'tests', 'v51', 'yp_karsilastir.js')")
    open(os.path.join(D, dst), 'w', encoding='utf-8').write(s)
kopya('tests/v51/test_v510.js', 't51.js', 'v51.0', 'V51.0', 'ekran51')
kopya('tests/v50/test_v500.js', 't50.js', 'v50.0', 'V50.0', 'ekran50')
for t in (sys.argv[1:] or ['t51.js', 't50.js']):
    r = subprocess.run(['node', os.path.join(D, t)], cwd=R, capture_output=True, text=True)
    print(t); print('\n'.join(l[:260] for l in r.stdout.splitlines() if l.startswith(('✘', 'KALDI', 'Toplam')) or 'kontrol geçti' in l))
