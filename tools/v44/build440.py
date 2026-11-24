"""V44.0'ı V43.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v44/build440.py
Girdi : surumler/din-kulturu-platformu-v43.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v44.0.html  ve  index.html (aynı içerik)

Eklenenler: v440.css, v440.js (roller ve yetki, içerik açma, öğretmen paneli, seçim ekranı) ve v440_oyun.js
(ortak oyun motoru, Zamanın İzinde, Bilgi Laboratuvarı, hibrit oyun merkezi). Veri ve müzik blokları bayt bayt korunur.
"""
import hashlib, math, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v43.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v44.0.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v44.0' not in f]
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
            for m in re.finditer(r'<script type="(?:application/json|text/plain)" id="([^"]+)">(.*?)</script>', s, flags=re.S)}


SEED0 = seeds(h)

# ---------------------------------------------------------------- yerleştirme
rep('V31.VER="V43.0"', 'V31.VER="V44.0"', cnt=h.count('V31.VER="V43.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V43.0">', '<meta name="app-version" content="V44.0">', what='sürüm metaverisi')
css = open(os.path.join(HERE, 'v440.css'), encoding='utf-8').read()
js = open(os.path.join(HERE, 'v440.js'), encoding='utf-8').read() + '\n' + open(os.path.join(HERE, 'v440_oyun.js'), encoding='utf-8').read()
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v440.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v440 js eklendi (%d bayt)' % len(js.encode()))

assert seeds(h) == SEED0, 'veri/müzik blokları değişti!'
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri ve müzik blokları aynı:', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
