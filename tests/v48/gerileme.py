"""Gerileme: V47.0 ve V46.0 testlerini V48.0 dosyasına yönlendirilmiş kopyalarla çalıştırır.
Çalıştırma (depo kökünden): python3 tests/v48/gerileme.py
Kopyalar ve ekran görüntüleri tests/v48/.gerileme/ altına yazılır (depoya eklenmez)."""
import os, re, subprocess
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(R, 'tests', 'v48', '.gerileme'); os.makedirs(D, exist_ok=True)
def kopya(src, dst, eski, ver, ekran):
    s = open(os.path.join(R, src), encoding='utf-8').read()
    s = s.replace("path.resolve(__dirname, '..', '..')", "path.resolve(__dirname, '..', '..', '..')")
    s = re.sub(r"path\.join\(ROOT, 'docs', '[^']+_ekran'\)", "path.join(__dirname, '%s')" % ekran, s)
    s = s.replace("din-kulturu-platformu-%s.html" % eski, "din-kulturu-platformu-v48.0.html")
    s = s.replace(ver.replace('.', '\\.'), 'V48\\.0').replace("'%s'" % ver, "'V48.0'")
    s = s.replace("x.includes('%s')" % eski, "x.includes('v48.0')")
    s = s.replace("'tools', 'v43', 'denetim_sonuc.json'", "'tools', 'v48', 'denetim_sonuc.json'").replace("'tools', 'v45', 'denetim_sonuc.json'", "'tools', 'v48', 'denetim_sonuc.json'").replace("'tools', 'v44', 'denetim_sonuc.json'", "'tools', 'v48', 'denetim_sonuc.json'").replace("'tools', 'v46', 'denetim_sonuc.json'", "'tools', 'v48', 'denetim_sonuc.json'").replace("'tools', 'v47', 'denetim_sonuc.json'", "'tools', 'v48', 'denetim_sonuc.json'")
    s = s.replace("path.join(__dirname, 'son_sonuc.json')", "path.join(__dirname, '%s.json')" % ekran)
    open(os.path.join(D, dst), 'w', encoding='utf-8').write(s)
kopya('tests/v47/test_v470.js', 't47.js', 'v47.0', 'V47.0', 'ekran47')
kopya('tests/v46/test_v460.js', 't46.js', 'v46.0', 'V46.0', 'ekran46')
for t in ['t47.js', 't46.js']:
    r = subprocess.run(['node', os.path.join(D, t)], cwd=R, capture_output=True, text=True)
    print(t); print('\n'.join(l[:260] for l in r.stdout.splitlines() if l.startswith(('✘', 'KALDI', 'Toplam')) or 'kontrol geçti' in l))
