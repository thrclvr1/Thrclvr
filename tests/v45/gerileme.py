"""Gerileme: V44.0 ve V43.0 testlerini V45.0 dosyasına yönlendirilmiş kopyalarla çalıştırır.
Çalıştırma (depo kökünden): python3 tests/v45/gerileme.py
Kopyalar ve ekran görüntüleri tests/v45/.gerileme/ altına yazılır (depoya eklenmez)."""
import os, re, subprocess
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(R, 'tests', 'v45', '.gerileme'); os.makedirs(D, exist_ok=True)
def kopya(src, dst, eski, ver, ekran):
    s = open(os.path.join(R, src), encoding='utf-8').read()
    s = s.replace("path.resolve(__dirname, '..', '..')", "path.resolve(__dirname, '..', '..', '..')")
    s = re.sub(r"path\.join\(ROOT, 'docs', '[^']+_ekran'\)", "path.join(__dirname, '%s')" % ekran, s)
    s = s.replace("din-kulturu-platformu-%s.html" % eski, "din-kulturu-platformu-v45.0.html")
    s = s.replace(ver.replace('.', '\\.'), 'V45\\.0').replace("'%s'" % ver, "'V45.0'")
    s = s.replace("x.includes('%s')" % eski, "x.includes('v45.0')")
    s = s.replace("'tools', 'v43', 'denetim_sonuc.json'", "'tools', 'v45', 'denetim_sonuc.json'").replace("'tools', 'v44', 'denetim_sonuc.json'", "'tools', 'v45', 'denetim_sonuc.json'")
    s = s.replace("path.join(__dirname, 'son_sonuc.json')", "path.join(__dirname, '%s.json')" % ekran)
    open(os.path.join(D, dst), 'w', encoding='utf-8').write(s)
kopya('tests/v44/test_v440.js', 't44.js', 'v44.0', 'V44.0', 'ekran44')
kopya('tests/v43/test_v430.js', 't43.js', 'v43.0', 'V43.0', 'ekran43')
for t in ['t44.js', 't43.js']:
    r = subprocess.run(['node', os.path.join(D, t)], cwd=R, capture_output=True, text=True)
    print(t); print('\n'.join(l[:260] for l in r.stdout.splitlines() if l.startswith(('✘', 'KALDI', 'Toplam')) or 'kontrol geçti' in l))
