"""Gerileme: V49.0, V48.0 ve V47.0 testlerini V50.0 dosyasına yönlendirilmiş kopyalarla çalıştırır.
Çalıştırma (depo kökünden): python3 tests/v50/gerileme.py
Kopyalar ve ekran görüntüleri tests/v50/.gerileme/ altına yazılır (depoya eklenmez)."""
import os, re, subprocess, sys
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(R, 'tests', 'v50', '.gerileme'); os.makedirs(D, exist_ok=True)
def kopya(src, dst, eski, ver, ekran):
    s = open(os.path.join(R, src), encoding='utf-8').read()
    s = s.replace("path.resolve(__dirname, '..', '..')", "path.resolve(__dirname, '..', '..', '..')")
    s = re.sub(r"path\.join\(ROOT, 'docs', '[^']+_ekran'\)", "path.join(__dirname, '%s')" % ekran, s)
    s = s.replace("din-kulturu-platformu-%s.html" % eski, "din-kulturu-platformu-v50.0.html")
    s = s.replace(ver.replace('.', '\\.'), 'V50\\.0').replace("'%s'" % ver, "'V50.0'")
    s = s.replace("x.includes('%s')" % eski, "x.includes('v50.0')")
    s = s.replace("'tools', 'v43', 'denetim_sonuc.json'", "'tools', 'v50', 'denetim_sonuc.json'").replace("'tools', 'v45', 'denetim_sonuc.json'", "'tools', 'v50', 'denetim_sonuc.json'").replace("'tools', 'v44', 'denetim_sonuc.json'", "'tools', 'v50', 'denetim_sonuc.json'").replace("'tools', 'v46', 'denetim_sonuc.json'", "'tools', 'v50', 'denetim_sonuc.json'").replace("'tools', 'v47', 'denetim_sonuc.json'", "'tools', 'v50', 'denetim_sonuc.json'").replace("'tools', 'v48', 'denetim_sonuc.json'", "'tools', 'v50', 'denetim_sonuc.json'")
    s = s.replace("path.join(__dirname, 'son_sonuc.json')", "path.join(__dirname, '%s.json')" % ekran)
    # V48: Ses ve müzik bölümü yeni ses paneliyle değişti; eski seçiciler yeni karşılıklarına yönlendirilir
    s = s.replace("document.querySelector('.a47-rng')", "document.querySelector('.sp48-vol input')").replace("p.click('.a47-mz button')", "p.click('ul.sp48-l:nth-of-type(2) button')")
    # V50: Öğrenme alanı kartları ortak mod kartlarıyla değişti; eski seçiciler yeni karşılıklarına yönlendirilir
    s = s.replace("await p.click('.a47-oz'); await p.waitForTimeout(400);", "await p.evaluate(() => go('ayar47', {at: 'alan'})); await p.waitForTimeout(400);").replace("'.a47-dk.al'", "'.mk50-k.altin'").replace("'.a47-dk.el'", "'.mk50-k.elmas'").replace("'.a47-dk.on b'", "'.mk50-k.on b'").replace("querySelectorAll('.a47-dk')", "querySelectorAll('.mk50-k')")
    open(os.path.join(D, dst), 'w', encoding='utf-8').write(s)
kopya('tests/v49/test_v490.js', 't49.js', 'v49.0', 'V49.0', 'ekran49')
kopya('tests/v48/test_v480.js', 't48.js', 'v48.0', 'V48.0', 'ekran48')
kopya('tests/v47/test_v470.js', 't47.js', 'v47.0', 'V47.0', 'ekran47')
for t in (sys.argv[1:] or ['t49.js', 't48.js', 't47.js']):
    r = subprocess.run(['node', os.path.join(D, t)], cwd=R, capture_output=True, text=True)
    print(t); print('\n'.join(l[:260] for l in r.stdout.splitlines() if l.startswith(('✘', 'KALDI', 'Toplam')) or 'kontrol geçti' in l))
