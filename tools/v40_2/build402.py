"""V40.2'yi V40.1'den üretir.

Çalıştırma (depo kökünden):  python3 tools/v40_2/build402.py
Girdi : surumler/din-kulturu-platformu-v40.1.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v40.2.html  ve  index.html (aynı içerik)

Veri blokları (müfredat, ilişkiler, sureler-dualar, yıllık plan) bayt bayt korunur.
Yalnızca: sürüm etiketi güncellenir ve V40.2 modülü (v402.js / v402.css: koridorun tek WebGL yüzeyinde çizilmesi, aydınlık malzemeler) eklenir.
Mevcut (Normal üyelik) ekranların koduna dokunulmaz.
"""
import hashlib, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v40.1.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v40.2.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v40.2' not in f]

md = lambda f: hashlib.md5(open(f, 'rb').read()).hexdigest()
keep = {f: md(f) for f in OLD}
h = open(SRC, encoding='utf-8').read()
LOG = []


def rep(a, b, cnt=1, what=''):
    global h
    n = h.count(a)
    assert n == cnt, (what, n, a[:120])
    h = h.replace(a, b)
    LOG.append(f'{what}: {n} yer')


def seeds(s):
    return {m.group(1): hashlib.sha256(m.group(2).encode()).hexdigest()
            for m in re.finditer(r'<script type="application/json" id="([^"]+)">(.*?)</script>', s, flags=re.S)}


SEED0 = seeds(h)
rep('V31.VER="V40.1"', 'V31.VER="V40.2"', cnt=h.count('V31.VER="V40.1"'), what='sürüm etiketi')
js = open(os.path.join(HERE, 'v402.js'), encoding='utf-8').read()
css = open(os.path.join(HERE, 'v402.css'), encoding='utf-8').read()
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v402.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v402.js eklendi (%d bayt)' % len(js.encode()))

assert seeds(h) == SEED0, 'veri blokları değişti!'
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri blokları aynı:', ', '.join(sorted(SEED0)))
print('eski sürüm dosyaları değişmedi:', len(keep))
