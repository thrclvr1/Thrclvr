"""V51.3'ü V51.2'den üretir.

Çalıştırma (depo kökünden):  python3 tools/v51_3/build513.py
Girdi : surumler/din-kulturu-platformu-v51.2.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v51.3.html  ve  index.html (aynı içerik)
        tools/v51_3/.okunur/v51.3-okunur.html (paketlenmemiş ara çıktı; depoya eklenmez)

Eklenen: v513_gecis.js (V51.KonuGecis: konu sonu önceki/sonraki konu, iki modda; Android :has() yedeği) ve v513.css.
Derleme yamaları: Etkinlik oyunları ekran başlığı ("Oyun merkezi" → "Etkinlik oyunları"); öğretmen hafta şeridinde
eski durum kaydından gelen “✓” işareti gösterilmez (OGRT.d.status korunur).
Boyut: paket513.paketle() büyük JSON veri bloklarını kayıpsız sıkıştırır; açıcı sayfa açılırken özgün metni geri koyar.
"""
import hashlib, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import paket513  # noqa: E402

SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v51.2.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v51.3.html')
IDX = os.path.join(ROOT, 'index.html')
OKU = os.path.join(HERE, '.okunur', 'v51.3-okunur.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v51.3' not in f]
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
rep('V31.VER="V51.2"', 'V31.VER="V51.3"', cnt=h.count('V31.VER="V51.2"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V51.2">', '<meta name="app-version" content="V51.3">', what='sürüm metaverisi')
rep('<p class="eyebrow" style="margin:0">Pekiştir · Oyunlar</p><h1>Oyun merkezi</h1>',
    '<p class="eyebrow" style="margin:0">Pekiştir · Oyunlar</p><h1>Etkinlik oyunları</h1>', what='Etkinlik oyunları başlığı')
rep('return `${done?"✓ ":""}${o?esc(W.short(o.code)):""}', 'return `${o?esc(W.short(o.code)):""}', what='öğretmen hafta şeridi: eski “işlendi” ✓ işareti gösterilmez (kayıt korunur)')
JS = ['v513_gecis.js']
css = open(os.path.join(HERE, 'v513.css'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in JS)
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v513.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v513 js eklendi (%d bayt)' % len(js.encode()))
S1 = seeds(h)
assert S1 == SEED0, 'veri/müzik/görsel blokları değişti!'
os.makedirs(os.path.dirname(OKU), exist_ok=True)
open(OKU, 'w', encoding='utf-8').write(h)
okunur = len(h.encode('utf-8'))
p = paket513.paketle(h)
assert paket513.ac(p) == h, 'paket açılınca okunur sürümle aynı değil!'
open(OUT, 'w', encoding='utf-8').write(p)
open(IDX, 'w', encoding='utf-8').write(p)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
v512 = os.path.getsize(SRC)
son = len(p.encode('utf-8'))
print('V51.2:', v512, 'bayt  | V51.3 okunur:', okunur, 'bayt  | V51.3 paketli:', son, 'bayt  (%.1f%% küçük)' % (100 * (v512 - son) / v512))
print('\n'.join(LOG))
print('veri, müzik ve görsel blokları aynı (açılınca):', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
