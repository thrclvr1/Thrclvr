"""Gerileme: V41.0 ve V40.2 testlerini V42.0 dosyasına yönlendirilmiş kopyalarla çalıştırır.
Çalıştırma (depo kökünden): python3 tests/v42/gerileme.py
Kopyalar ve ekran görüntüleri tests/v42/.gerileme/ altına yazılır (depoya eklenmez).
Beklenen “kaldı”lar (bilinçli değişiklik): V41 0.3 ve V40.2 0.5 (Premium’da yazılı “Klasik” düğmesi, AA kontrast renkleri);
V40.2 0.2 (rota listesi V41.0’da eklenen poyun/poyna yüzünden V40.1’den farklı — V41.0’da da böyleydi)."""
import os, re, subprocess
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(R, 'tests', 'v42', '.gerileme'); os.makedirs(D, exist_ok=True)
def kopya(src, dst, eski, ver, ekran):
    s = open(os.path.join(R, src), encoding='utf-8').read()
    s = s.replace("path.resolve(__dirname, '..', '..')", "path.resolve(__dirname, '..', '..', '..')")
    s = re.sub(r"path\.join\(ROOT, 'docs', '[^']+_ekran'\)", "path.join(__dirname, '%s')" % ekran, s)
    s = s.replace("'/surumler/din-kulturu-platformu-%s.html'" % eski, "'/surumler/din-kulturu-platformu-v42.0.html'")
    s = s.replace("'%s'" % ver, "'V42.0'").replace("path.join(__dirname, 'son_sonuc.json')", "path.join(__dirname, '%s.json')" % ekran)
    open(os.path.join(D, dst), 'w', encoding='utf-8').write(s)
kopya('tests/v41/test_v410.js', 't41.js', 'v41.0', 'V41.0', 'ekran41')
kopya('tests/v40_2/test_v402.js', 't402.js', 'v40.2', 'V40.2', 'ekran402')
for t in ['t41.js', 't402.js']:
    r = subprocess.run(['node', os.path.join(D, t)], cwd=R, capture_output=True, text=True)
    print(t, '\n'.join(l[:200] for l in r.stdout.splitlines() if l.startswith(('KALDI', 'Toplam'))))
