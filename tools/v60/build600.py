"""V60.0'ı V59.1'den üretir.

Çalıştırma (depo kökünden):  python3 tools/v60/build600.py
Girdi : surumler/din-kulturu-platformu-v59.1.html (değiştirilmez). paket513.ac() ile açılır, sonunda paketlenir.
Çıktı : surumler/din-kulturu-platformu-v60.0.html ve index.html (web; veri blokları paketli)
        tools/v60/.okunur/v60.0-okunur.html (depoya eklenmez)

V60.0:
  • Altın koridor zemini: yolluğun ortasındaki yıldız madalyon (WebGL zemin dokusu GL.URET.zemin ve CSS yedeği .mad) kaldırılır;
    yolluğun rengi, mermer damarları, altın şeritleri, perspektif ve ışık aynı.
  • Müzikler: yedi parça özgün kayıtlardan (kaynaklar/muzik, 192 kbps MP3) 40 kbps Opus/WebM'e kodlanır (tools/v60/muzik/).
  • v600_bag.js (bağlantıdan doğru cümle/kelimeye, Altın'da tıklanabilir kavramlar), v600_ust.js (Altın üst çubuk, Önerilen),
    v600_muzik.js (müzik biçimi).
Ders içerikleri, kazanımlar, sorular, oyunlar ve müfredat/ilişki/plan veri blokları değişmez (derlemede denetlenir).
"""
import base64, hashlib, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'v51_3'))
import paket513  # noqa: E402

SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v59.1.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v60.0.html')
IDX = os.path.join(ROOT, 'index.html')
OKU = os.path.join(HERE, '.okunur', 'v60.0-okunur.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v60.0' not in f]
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
rep('V31.VER="V59.1"', 'V31.VER="V60.0"', cnt=h.count('V31.VER="V59.1"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V59.1">', '<meta name="app-version" content="V60.0">', what='sürüm metaverisi')

# ---------------------------------------------------------------- 1. koridor zemini: yıldız madalyon yok
a = h.index('x.save();x.translate(480,300);x.fillStyle="#352b24";x.beginPath();x.arc(0,0,84,0,7)')
b = h.index('x.fillStyle="#352b24";x.beginPath();x.arc(0,0,10,0,7);x.fill();x.restore();', a) + len('x.fillStyle="#352b24";x.beginPath();x.arc(0,0,10,0,7);x.fill();x.restore();')
assert b - a < 1200, b - a
h = h[:a] + '/* V60: yolluğun ortasındaki yıldız madalyon kaldırıldı (sade zemin) */' + h[b:]
LOG.append('WebGL zemin dokusu: yıldız madalyon çizimi kaldırıldı (%d karakter)' % (b - a))
rep('damar(7,()=>`rgba(220,190,136,${.14+R()*.2})`,330,630)', 'damar(7,()=>`rgba(220,190,136,${.04+R()*.05})`,330,630)', what='yolluk üzerindeki mermer damarları hafifletildi (sade zemin)')
rep('/* koyu mermer yolluk, altın şeritler, yıldız madalyon */', '/* koyu mermer yolluk, altın şeritler */', what='zemin açıklaması')
rep('.z40.zem .mad{position:absolute;', '.z40.zem .mad{display:none!important;position:absolute;', what='CSS koridor yedeği: madalyon gizli')

# ---------------------------------------------------------------- 2. müzikler: Opus 40 kbps (özgün kayıtlardan)
MUZ = {'esik': 'before_the_sacred_threshold', 'sessizdua': 'sessiz_dua', 'neynefes': 'the_reed_s_breath', 'neydua': 'the_prayer_of_the_reed',
       'isik': 'where_the_light_rests', 'kubbe': 'the_vaulted_study', 'cam': 'rain_on_the_pane'}
toplam0 = toplam1 = 0
for mid, ad in MUZ.items():
    m = re.search(r'(<script type="text/plain" id="m42-%s">)(.*?)(</script>)' % mid, h, flags=re.S)
    assert m, mid
    yeni = base64.b64encode(open(os.path.join(HERE, 'muzik', ad + '.webm'), 'rb').read()).decode()
    toplam0 += len(m.group(2)); toplam1 += len(yeni)
    h = h[:m.start(2)] + yeni + h[m.end(2):]
LOG.append('müzik blokları (base64): %.2f MB → %.2f MB' % (toplam0 / 1e6, toplam1 / 1e6))

# ---------------------------------------------------------------- yerleştirme
JS = ['v600_perf.js', 'v600_bag.js', 'v600_ust.js', 'v600_muzik.js']
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in JS)
assert '</script' not in js.lower()
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v600 js eklendi (%d bayt)' % len(js.encode()))

yeni = seeds(h)
degisen = sorted(k for k in SEED0 if yeni.get(k) != SEED0[k])
assert set(yeni) == set(SEED0), 'veri bloğu eklendi/silindi'
assert all(k.startswith('m42-') for k in degisen) and len(degisen) == 7, ('beklenmeyen veri bloğu değişti', degisen)
LOG.append('değişen veri blokları yalnız müzik: ' + ', '.join(degisen))
os.makedirs(os.path.dirname(OKU), exist_ok=True)
open(OKU, 'w', encoding='utf-8').write(h)
assert '030792' not in h, 'açık metin PIN HTML içinde!'
assert not re.search(r'[A-Za-z0-9._%+-]+@gmail\.com', h), 'gmail adresi HTML içinde!'
p = paket513.paketle(h)
assert paket513.ac(p) == h, 'paket açılınca okunur sürümle aynı değil!'
open(OUT, 'w', encoding='utf-8').write(p)
open(IDX, 'w', encoding='utf-8').write(p)
# Not: paketi açılmış bir APK kopyası denendi; ölçümde açılışı YAVAŞLATTI (HTML ayrıştırma > paket çözme), kullanılmadı.
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print('V59.1 paketli:', os.path.getsize(SRC), '| V60.0 paketli:', len(p.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('eski sürüm dosyaları değişmedi:', len(keep))
