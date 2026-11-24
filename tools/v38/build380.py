"""V38.0'ı V37.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v38/build380.py
Girdi : surumler/din-kulturu-platformu-v37.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v38.0.html  ve  index.html (aynı içerik)

Veri blokları (müfredat, ilişkiler, sureler-dualar, yıllık plan) bayt bayt korunur.
Yalnızca: öğretmen paneli görünüm haritası genişletilebilir yapılır, sürüm etiketi güncellenir, V38 modülü (v380.js/v380.css) eklenir.
"""
import hashlib, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v37.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v38.0.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v38.0' not in f]

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

# 1. Öğretmen paneli: "Diğer" altındaki yeni bölümler için görünüm haritası genişletilebilir (mevcut 7 görünüm aynen kalır)
MAP = '({hafta:()=>OGRT.W.view(),sinif:OGRT.vSinif,kaz:OGRT.vKaz,plan:OGRT.vPlan,ilerleme:OGRT.vIler,takvim:OGRT.vTak,yedek:OGRT.vYedek})[s.tab]()'
rep(MAP, '(Object.assign({hafta:()=>OGRT.W.view(),sinif:OGRT.vSinif,kaz:OGRT.vKaz,plan:OGRT.vPlan,ilerleme:OGRT.vIler,takvim:OGRT.vTak,yedek:OGRT.vYedek},OGRT.EXT||{})[s.tab]||OGRT.vPlan)()',
    what='öğretmen paneli görünüm haritası (OGRT.EXT)')

# 2. Sürüm etiketi
rep('V31.VER="V37.0"', 'V31.VER="V38.0"', cnt=h.count('V31.VER="V37.0"'), what='sürüm etiketi')

# 3. V38 modülü (V37 modülünden sonra)
js = open(os.path.join(HERE, 'v380.js'), encoding='utf-8').read()
css = open(os.path.join(HERE, 'v380.css'), encoding='utf-8').read()
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v380.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v380.js eklendi (%d bayt)' % len(js.encode()))

assert seeds(h) == SEED0, 'veri blokları değişti!'
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri blokları aynı:', ', '.join(sorted(SEED0)))
print('eski sürüm dosyaları değişmedi:', len(keep))
