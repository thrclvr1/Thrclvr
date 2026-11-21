"""Gerileme: V43.0 ve V42.0 testlerini V44.0 dosyasına yönlendirilmiş kopyalarla çalıştırır.
Çalıştırma (depo kökünden): python3 tests/v44/gerileme.py
Kopyalar ve ekran görüntüleri tests/v44/.gerileme/ altına yazılır (depoya eklenmez)."""
import os, re, subprocess
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(R, 'tests', 'v44', '.gerileme'); os.makedirs(D, exist_ok=True)
def kopya(src, dst, eski, ver, ekran):
    s = open(os.path.join(R, src), encoding='utf-8').read()
    s = s.replace("path.resolve(__dirname, '..', '..')", "path.resolve(__dirname, '..', '..', '..')")
    s = re.sub(r"path\.join\(ROOT, 'docs', '[^']+_ekran'\)", "path.join(__dirname, '%s')" % ekran, s)
    s = s.replace("din-kulturu-platformu-%s.html" % eski, "din-kulturu-platformu-v44.0.html")
    s = s.replace(ver.replace('.', '\\.'), 'V44\\.0').replace("'%s'" % ver, "'V44.0'")
    s = s.replace("x.includes('%s')" % eski, "x.includes('v44.0')")
    s = s.replace("'tools', 'v43', 'denetim_sonuc.json'", "'tools', 'v44', 'denetim_sonuc.json'")
    s = s.replace("path.join(__dirname, 'son_sonuc.json')", "path.join(__dirname, '%s.json')" % ekran)
    open(os.path.join(D, dst), 'w', encoding='utf-8').write(s)
kopya('tests/v43/test_v430.js', 't43.js', 'v43.0', 'V43.0', 'ekran43')
kopya('tests/v42/test_v420.js', 't42.js', 'v42.0', 'V42.0', 'ekran42')
for t in ['t43.js', 't42.js']:
    r = subprocess.run(['node', os.path.join(D, t)], cwd=R, capture_output=True, text=True)
    print(t); print('\n'.join(l[:260] for l in r.stdout.splitlines() if l.startswith(('✘', 'KALDI', 'Toplam')) or 'kontrol geçti' in l))
