"""V49.0'ı V48.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v49/build490.py
Girdi : surumler/din-kulturu-platformu-v48.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v49.0.html  ve  index.html (aynı içerik)

1. Motifler: V48'in girih ve geçme desenleri (kenar ortalarındaki haç biçimleri artı işaretini çağrıştırıyordu)
   sekiz kollu çiçek rozetleri ve yapraklı bordürle değiştirilir (tools/v49/motif49.py).
2. Görseller: v490_gorsel.js, V48.Gorsel işlevlerini yeniden tanımlar (altın külçesi, pırlanta, iki alan görseli);
   <body> başındaki V48 görsel betiğinin hemen ardından yüklenir.
3. Eklenen kod: v490_duzelt.js (Elmas/Altın arayüz karışması düzeltmesi), v490_profil.js (Profilim), v490.css.
Veri ve müzik blokları bayt bayt korunur.
"""
import hashlib, os, re, sys, importlib.util

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))


def modul(ad, yol):
    s = importlib.util.spec_from_file_location(ad, yol); m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m


m48 = modul('motif48', os.path.join(ROOT, 'tools', 'v48', 'motif.py'))
m49 = modul('motif49', os.path.join(HERE, 'motif49.py'))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v48.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v49.0.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v49.0' not in f]
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
rep('V31.VER="V48.0"', 'V31.VER="V49.0"', cnt=h.count('V31.VER="V48.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V48.0">', '<meta name="app-version" content="V49.0">', what='sürüm metaverisi')

# 1. motifler
ESLE = {'GIRIH_ELMAS_ACIK': 'CICEK_ELMAS_ACIK', 'GIRIH_ELMAS_KOYU': 'CICEK_ELMAS_KOYU', 'GECME_ELMAS': 'BORDUR_ELMAS',
        'GIRIH_ALTIN_GECE': 'CICEK_ALTIN_GECE', 'GIRIH_ALTIN_GUNDUZ': 'CICEK_ALTIN_GUNDUZ', 'GIRIH_ACILIS': 'CICEK_ACILIS', 'GECME_ALTIN': 'BORDUR_ALTIN'}
for a, b in ESLE.items():
    rep(m48.DESEN[a], m49.DESEN[b], what=f'desen {a} → {b}')

# 2. görseller: V48 görsel betiğinin hemen ardından
gjs = open(os.path.join(HERE, 'v490_gorsel.js'), encoding='utf-8').read()
i = h.index('</style></head><body><script>'); j = h.index('</script>', i + 30) + len('</script>')
h = h[:j] + '<script>' + gjs + '</script>' + h[j:]
LOG.append('v490_gorsel.js <body> başında, V48 görsel betiğinden sonra (%d bayt)' % len(gjs.encode()))

# 3. CSS ve modüller
css = m49.doldur(open(os.path.join(HERE, 'v490.css'), encoding='utf-8').read())
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in ['v490_profil.js', 'v490_duzelt.js'])
assert '</script' not in (js + gjs).lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v490.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v490 js eklendi (%d bayt)' % len(js.encode()))

# denetim: haç biçimli girih ve altı köşeli çizim kalmadı
for k_, v in m48.DESEN.items():
    assert v not in h, ('eski desen kaldı', k_)
assert seeds(h) == SEED0, 'veri/müzik blokları değişti!'
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri ve müzik blokları aynı:', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
