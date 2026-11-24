"""Gerileme: V42.0 ve V41.0 testlerini V43.0 dosyasına yönlendirilmiş kopyalarla çalıştırır.
Çalıştırma (depo kökünden): python3 tests/v43/gerileme.py
Kopyalar ve ekran görüntüleri tests/v43/.gerileme/ altına yazılır (depoya eklenmez)."""
import os, re, subprocess
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(R, 'tests', 'v43', '.gerileme'); os.makedirs(D, exist_ok=True)
def kopya(src, dst, eski, ver, ekran):
    s = open(os.path.join(R, src), encoding='utf-8').read()
    s = s.replace("path.resolve(__dirname, '..', '..')", "path.resolve(__dirname, '..', '..', '..')")
    s = re.sub(r"path\.join\(ROOT, 'docs', '[^']+_ekran'\)", "path.join(__dirname, '%s')" % ekran, s)
    s = s.replace("din-kulturu-platformu-%s.html" % eski, "din-kulturu-platformu-v43.0.html")
    s = s.replace(ver.replace('.', '\\.'), 'V43\\.0').replace("'%s'" % ver, "'V43.0'")
    s = s.replace("x.includes('%s')" % eski, "x.includes('v43.0')")
    s = s.replace("path.join(__dirname, 'son_sonuc.json')", "path.join(__dirname, '%s.json')" % ekran)
    open(os.path.join(D, dst), 'w', encoding='utf-8').write(s)
kopya('tests/v42/test_v420.js', 't42.js', 'v42.0', 'V42.0', 'ekran42')
kopya('tests/v41/test_v410.js', 't41.js', 'v41.0', 'V41.0', 'ekran41')
for t in ['t42.js', 't41.js']:
    r = subprocess.run(['node', os.path.join(D, t)], cwd=R, capture_output=True, text=True)
    print(t); print('\n'.join(l[:260] for l in r.stdout.splitlines() if l.startswith(('✘', 'KALDI', 'Toplam')) or 'kontrol geçti' in l))
