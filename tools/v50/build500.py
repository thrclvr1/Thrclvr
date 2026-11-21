"""V50.0'ı V49.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v50/build500.py
Girdi : surumler/din-kulturu-platformu-v49.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v50.0.html  ve  index.html (aynı içerik)

1. Seçim ekranı görselleri: kullanıcının verdiği orijinal görseller (kaynaklar/v50-gorsel/*.png) yalnız boyutu küçültülmüş
   WebP olarak (tools/v50/gorsel/*.webp, 1280×720, oran ve renk aynı) <script type="text/plain" id="g50-elmas|g50-altin">
   bloklarına gömülür; v500_gorsel.js <body> başında V49 görsel betiğinden sonra yüklenir.
2. Ortak mod geçiş sistemi (v500_mod.js), Altın alt menüsü (v500_nav.js), v500.css.
3. Görünüm ve ses › Öğrenme alanı bölümü ortak mod kartlarını kullanır (ayrı bir mod yönetimi kalmaz).
Var olan veri ve müzik blokları bayt bayt korunur.
"""
import base64, hashlib, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v49.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v50.0.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v50.0' not in f]
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
rep('V31.VER="V49.0"', 'V31.VER="V50.0"', cnt=h.count('V31.VER="V49.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V49.0">', '<meta name="app-version" content="V50.0">', what='sürüm metaverisi')

# 1. görseller: <body> başındaki görsel betiklerinden (V48, V49) sonra
bloklar = ''
for ad in ('elmas', 'altin'):
    veri = open(os.path.join(HERE, 'gorsel', ad + '.webp'), 'rb').read()
    assert veri[:4] == b'RIFF' and veri[8:12] == b'WEBP'
    bloklar += f'<script type="text/plain" id="g50-{ad}">{base64.b64encode(veri).decode()}</script>'
    LOG.append(f'görsel {ad}: {len(veri)} bayt WebP')
gjs = open(os.path.join(HERE, 'v500_gorsel.js'), encoding='utf-8').read()
i = h.index('</style></head><body><script>')
j = h.index('</script>', i + 30) + 9   # V48 görsel betiği
j = h.index('</script>', j) + 9        # V49 görsel betiği
assert h[j - 300:j].find('gk49a') >= 0, 'V49 görsel betiği bulunamadı'
h = h[:j] + bloklar + '<script>' + gjs + '</script>' + h[j:]
LOG.append('v500_gorsel.js <body> başında (%d bayt)' % len(gjs.encode()))

# 2. ayarlar › Öğrenme alanı: ortak mod kartları
rep("  B.alan = () => { const m = AL() ? 'premium' : 'normal';",
    "  B.alan = () => { if (window.V50 && V50.Mod) return `<p class=\"a47-ack\">Üç mod: Elmas Sınıfı, Altın Sınıfı ve Öğretmen Modu. İçerikler ve ilerlemen aynıdır; görünüm ve araçlar değişir.</p>${V50.Mod.kartlar('ayar')}<div class=\"p46-bb\"><button type=\"button\" onclick=\"V39.secim(true)\">Giriş ekranını aç</button></div>`; const m = AL() ? 'premium' : 'normal';",
    what='ayar › Öğrenme alanı → ortak mod kartları')

# 3. CSS ve modüller
css = open(os.path.join(HERE, 'v500.css'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in ['v500_mod.js', 'v500_nav.js'])
assert '</script' not in (js + gjs).lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v500.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v500 js eklendi (%d bayt)' % len(js.encode()))

S1 = seeds(h)
assert all(S1.get(k_) == v for k_, v in SEED0.items()), 'veri/müzik blokları değişti!'
assert set(S1) - set(SEED0) == {'g50-elmas', 'g50-altin'}, sorted(set(S1) - set(SEED0))
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri ve müzik blokları aynı:', len(SEED0), '+ yeni görsel blokları: 2')
print('eski sürüm dosyaları değişmedi:', len(keep))
