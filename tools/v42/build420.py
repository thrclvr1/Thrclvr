"""V42.0'ı V41.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v42/build420.py
Girdi : surumler/din-kulturu-platformu-v41.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v42.0.html  ve  index.html (aynı içerik)

Veri blokları (müfredat, ilişkiler, sureler-dualar, yıllık plan) bayt bayt korunur.
Eklenenler: v420.css, v420.js (giriş ekranı, deneyim değiştirme, geri tuşu, klavye, kayıtlı müzikler),
seçim ekranı görseli (kart_premium.webp, uygulamanın kendi koridorundan) ve 7 müzik kaydı (muzik/*.mp3, 64 kbps).
Müzik kayıtları ana betikten SONRA, <script type="text/plain"> bloklarında durur: uygulama önce açılır,
müzik baytları yalnızca çalınınca çözülür.
"""
import base64, hashlib, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v41.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v42.0.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v42.0' not in f]
MUZ = [('esik', 'before_the_sacred_threshold.mp3'), ('sessizdua', 'sessiz_dua.mp3'), ('neynefes', 'the_reed_s_breath.mp3'),
       ('neydua', 'the_prayer_of_the_reed.mp3'), ('isik', 'where_the_light_rests.mp3'), ('kubbe', 'the_vaulted_study.mp3'), ('cam', 'rain_on_the_pane.mp3')]

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
rep('V31.VER="V41.0"', 'V31.VER="V42.0"', cnt=h.count('V31.VER="V41.0"'), what='sürüm etiketi')
# Android Chrome 108+: klavye açılınca yerleşim alanı da küçülsün (alt paneller klavyenin altında kalmasın)
rep('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">', what='viewport: interactive-widget')
# V33 ses temizliği çalışmadan önce ham ses kaydını sakla (önceki açılışta seçilen kayıtlı müzikler silinmesin)
rep('V33.keep=["yagmur"', 'try{window.ATM42HAM=localStorage.getItem(ATM.KEY)}catch(e){}\nV33.keep=["yagmur"', what='ses kaydı ham kopya')

css = open(os.path.join(HERE, 'v420.css'), encoding='utf-8').read()
kp = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(HERE, 'kart_premium.webp'), 'rb').read()).decode()
js = 'window.V42={KP:"%s"};\n' % kp + open(os.path.join(HERE, 'v420.js'), encoding='utf-8').read()
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v420.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v420 js eklendi (%d bayt, görsel dahil)' % len(js.encode()))

son = '</script></body></html>'
assert h.rstrip().endswith(son)
bloklar = ''
for mid, f in MUZ:
    b = base64.b64encode(open(os.path.join(HERE, 'muzik', f), 'rb').read()).decode()
    bloklar += '\n<script type="text/plain" id="m42-%s">%s</script>' % (mid, b)
    LOG.append('müzik %-10s %s (%d bayt base64)' % (mid, f, len(b)))
h = h.rstrip()[:-len(son)] + '</script>' + bloklar + '\n</body></html>\n'

assert seeds(h) == SEED0, 'veri blokları değişti!'
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri blokları aynı:', ', '.join(sorted(SEED0)))
print('eski sürüm dosyaları değişmedi:', len(keep))
