"""V37.0'ı V36.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v37/build370.py
Girdi : surumler/din-kulturu-platformu-v36.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v37.0.html  ve  index.html (aynı içerik)

Veri blokları (müfredat, ilişkiler, sureler-dualar, yıllık plan) ve localStorage anahtarları dokunulmadan kopyalanır.
Yalnızca: varsayılan PIN özeti kaldırılır, sürüm etiketi güncellenir, V37 modülü (v370.js/v370.css) eklenir.
"""
import hashlib, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v36.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v37.0.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v37.0' not in f]

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

# 1. Sabit varsayılan PIN (1999) kaldırılır: özeti dosyada kalmaz. İlk girişte öğretmen kendi PIN'ini oluşturur.
m = re.search(r'DEF:\{salt:"v36-varsayilan",h:"[0-9a-f]{64}"\}', h)
assert m, 'V36 varsayılan PIN özeti bulunamadı'
rep(m.group(0), 'DEF:null', what='varsayılan PIN özeti kaldırıldı')
assert 'v36-varsayilan' not in h

# 2. Sürüm etiketi
rep('V31.VER="V36.0"', 'V31.VER="V37.0"', cnt=h.count('V31.VER="V36.0"'), what='sürüm etiketi')

# 3. Alt menünün altındaki boşluk: menü, sistem alanının (env(safe-area-inset-bottom)) ÜSTÜNE ayrıca 8–10 px eklemek yerine
#    sistem alanı varsa doğrudan onun üstünde, yoksa 8 px yukarıda durur: bottom = max(8px, inset). Sabit piksel hilesi yok.
SAB = 'env(safe-area-inset-bottom,0px)'
rep('nav.bnav{left:12px;right:12px;bottom:calc(10px + %s);' % SAB, 'nav.bnav{left:12px;right:12px;bottom:max(8px,%s);' % SAB, what='alt menü (temel)')
rep('width:min(calc(100%% - 24px),440px);bottom:calc(10px + %s);' % SAB, 'width:min(calc(100%% - 24px),440px);bottom:max(8px,%s);' % SAB, what='alt menü (yüzen cam)')
rep('right:auto;top:auto;bottom:calc(8px + %s);' % SAB, 'right:auto;top:auto;bottom:max(8px,%s);' % SAB, what='alt menü (alçak yatay ekran)')

# 4. V37 modülü
js = open(os.path.join(HERE, 'v370.js'), encoding='utf-8').read()
css = open(os.path.join(HERE, 'v370.css'), encoding='utf-8').read()
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v370.css eklendi')
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v370.js eklendi')

# Doğrulamalar
assert seeds(h) == SEED0, 'veri blokları değişti!'
assert '1999' not in js
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri blokları aynı:', ', '.join(sorted(SEED0)))
print('eski sürüm dosyaları değişmedi:', len(keep))
