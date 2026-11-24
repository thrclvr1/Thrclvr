"""V51.5'i V51.4'ten üretir.

Çalıştırma (depo kökünden):  python3 tools/v51_5/build515.py
Girdi : surumler/din-kulturu-platformu-v51.4.html  (değiştirilmez; md5 doğrulanır). Paketli olduğundan önce
        tools/v51_3/paket513.ac() ile açılır, yamalar okunur metne uygulanır, sonunda paket513.paketle() ile yazılır.
Çıktı : surumler/din-kulturu-platformu-v51.5.html  ve  index.html (aynı içerik)
        tools/v51_5/.okunur/v51.5-okunur.html (paketlenmemiş ara çıktı; depoya eklenmez)

Eklenen: v515_edpin.js (V51.EdPin: ilk editör PIN'i yalnız tuzlu özet olarak, kademeli kilit, e-posta doğrulamalı
PIN sıfırlama akışı, PIN sürümüyle oturum kapatma, giriş geçmişi) ve v515.css. Derleme yaması yok.
Sunucu tarafı: sunucu/editor_pin.js (sunucu.js yükler).
"""
import hashlib, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'v51_3'))
import paket513  # noqa: E402

SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v51.4.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v51.5.html')
IDX = os.path.join(ROOT, 'index.html')
OKU = os.path.join(HERE, '.okunur', 'v51.5-okunur.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v51.5' not in f]
md = lambda f: hashlib.md5(open(f, 'rb').read()).hexdigest()
keep = {f: md(f) for f in OLD}
h = paket513.ac(open(SRC, encoding='utf-8').read())
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
rep('V31.VER="V51.4"', 'V31.VER="V51.5"', cnt=h.count('V31.VER="V51.4"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V51.4">', '<meta name="app-version" content="V51.5">', what='sürüm metaverisi')
JS = ['v515_edpin.js']
css = open(os.path.join(HERE, 'v515.css'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in JS)
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v515.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v515 js eklendi (%d bayt)' % len(js.encode()))
S1 = seeds(h)
assert S1 == SEED0, 'veri/müzik/görsel blokları değişti!'
os.makedirs(os.path.dirname(OKU), exist_ok=True)
open(OKU, 'w', encoding='utf-8').write(h)
okunur = len(h.encode('utf-8'))
assert '030792' not in h, 'açık metin PIN HTML içinde!'
assert not re.search(r'[A-Za-z0-9._%+-]+@gmail\.com', h), 'gmail adresi HTML içinde!'
p = paket513.paketle(h)
assert paket513.ac(p) == h, 'paket açılınca okunur sürümle aynı değil!'
open(OUT, 'w', encoding='utf-8').write(p)
open(IDX, 'w', encoding='utf-8').write(p)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
v514 = os.path.getsize(SRC)
son = len(p.encode('utf-8'))
print('V51.4:', v514, 'bayt  | V51.5 okunur:', okunur, 'bayt  | V51.5 paketli:', son, 'bayt')
print('\n'.join(LOG))
print('veri, müzik ve görsel blokları aynı (açılınca):', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
