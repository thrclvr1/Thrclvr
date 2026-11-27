"""V59.1'i V59.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v59_1/build591.py
Girdi : surumler/din-kulturu-platformu-v59.0.html (değiştirilmez). paket513.ac() ile açılır, sonunda paketlenir.
Çıktı : surumler/din-kulturu-platformu-v59.1.html ve index.html; tools/v59_1/.okunur/v59.1-okunur.html (depoya eklenmez).

V59.1 (v591.js):
  • Öğretmen kazanım kartı her temada o temanın kendi renginin koyu tonuyla (V59.0'da her temada aynı altın kart).
  • Bağlantılar / Kavram Haritası yalnız Altın'da: Elmas'ta bütün girişler kapalı (editörün Yönetim ekranı hariç).
Veri, müzik ve görsel blokları değişmez.
"""
import hashlib, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'v51_3'))
import paket513  # noqa: E402

SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v59.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v59.1.html')
IDX = os.path.join(ROOT, 'index.html')
OKU = os.path.join(HERE, '.okunur', 'v59.1-okunur.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v59.1' not in f]
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
rep('V31.VER="V59.0"', 'V31.VER="V59.1"', cnt=h.count('V31.VER="V59.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V59.0">', '<meta name="app-version" content="V59.1">', what='sürüm metaverisi')

js = open(os.path.join(HERE, 'v591.js'), encoding='utf-8').read()
assert '</script' not in js.lower()
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v591 js eklendi (%d bayt)' % len(js.encode()))
assert seeds(h) == SEED0, 'veri/müzik/görsel blokları değişti!'
os.makedirs(os.path.dirname(OKU), exist_ok=True)
open(OKU, 'w', encoding='utf-8').write(h)
assert '030792' not in h, 'açık metin PIN HTML içinde!'
assert not re.search(r'[A-Za-z0-9._%+-]+@gmail\.com', h), 'gmail adresi HTML içinde!'
p = paket513.paketle(h)
assert paket513.ac(p) == h, 'paket açılınca okunur sürümle aynı değil!'
open(OUT, 'w', encoding='utf-8').write(p)
open(IDX, 'w', encoding='utf-8').write(p)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print('V59.1 paketli:', len(p.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri blokları aynı:', len(SEED0), '| eski sürüm dosyaları değişmedi:', len(keep))
