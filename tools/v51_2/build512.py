"""V51.2'yi V51.1'den üretir.

Çalıştırma (depo kökünden):  python3 tools/v51_2/build512.py
Girdi : surumler/din-kulturu-platformu-v51.1.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v51.2.html  ve  index.html (aynı içerik)

Eklenen: v512_gorunum.js (V51.Gorunum: öğrenci/öğretmen görünüm bağlamı, öğretmen görünümü, yayın kuralı, sıkı yayın
öncesi kontrol ekranı) ve v512.css. Derleme yaması yok. Var olan veri, müzik ve görsel blokları bayt bayt korunur.
"""
import hashlib, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v51.1.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v51.2.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v51.2' not in f]
md = lambda f: hashlib.md5(open(f, 'rb').read()).hexdigest()
keep = {f: md(f) for f in OLD}
h = open(SRC, encoding='utf-8').read()
LOG = []


def rep(a, b, cnt=1, what=''):
    global h
    n = h.count(a)
    assert n == cnt, (what, n, a[:140])
    h = h.replace(a, b)
    LOG.append(f'{what}: {n} yer')


def seeds(s):
    return {m.group(1): hashlib.sha256(m.group(2).encode()).hexdigest()
            for m in re.finditer(r'<script type="(?:application/json|text/plain)" id="([^"]+)">(.*?)</script>', s, flags=re.S)}


SEED0 = seeds(h)
rep('V31.VER="V51.1"', 'V31.VER="V51.2"', cnt=h.count('V31.VER="V51.1"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V51.1">', '<meta name="app-version" content="V51.2">', what='sürüm metaverisi')
JS = ['v512_gorunum.js']
css = open(os.path.join(HERE, 'v512.css'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in JS)
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v512.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v512 js eklendi (%d bayt)' % len(js.encode()))
S1 = seeds(h)
assert S1 == SEED0, 'veri/müzik/görsel blokları değişti!'
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri, müzik ve görsel blokları aynı:', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
