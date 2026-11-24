"""V43.0'ı V42.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v43/build430.py
Girdi : surumler/din-kulturu-platformu-v42.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v43.0.html  ve  index.html (aynı içerik)

Eklenenler:
 1. Kök neden düzeltmesi: :root'ta hesaplanan türetilmiş renk değişkenleri (--gl1/2/3, --glnav, --soft…) Premium'da
    ve krem ders sayfasında yeniden tanımlanır (CSS'te var() içeren özel değişken, tanımlandığı öğede hesaplanır;
    Premium yalnızca temel renkleri <body>'de değiştirdiği için cam yüzeyler Klasik temanın rengiyle kalıyordu).
 2. Gündüz modu ve krem ders sayfası için üretilmiş CSS: Premium bloklarındaki (V39–V42) sabit renkler OKLab'de,
    kullanıldıkları özelliğe göre (yazı / zemin / çizgi) dönüştürülür. 3B sahne ve giriş ekranı kuralları dışarıda.
 3. v430.css (tasarım sistemi: tokenlar, paneller, kartlar, ses paneli, ders sayfası) ve v430.js (tema sistemi,
    kart düzeni, tema düğmeleri).
 4. <head> içindeki tema betiği: Premium oturumunda Premium teması ilk boyamadan önce uygulanır (parlama olmaz).
Veri blokları ve müzik blokları bayt bayt korunur.
"""
import hashlib, math, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v42.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v43.0.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v43.0' not in f]
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
            for m in re.finditer(r'<script type="(?:application/json|text/plain)" id="([^"]+)">(.*?)</script>', s, flags=re.S)}


SEED0 = seeds(h)

# ---------------------------------------------------------------- renk dönüşümü (OKLab)
def _lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _srgb(x):
    x = max(0.0, min(1.0, x))
    return 255 * (12.92 * x if x <= 0.0031308 else 1.055 * x ** (1 / 2.4) - 0.055)


def to_oklab(r, g, b):
    r, g, b = _lin(r), _lin(g), _lin(b)
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    return (0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s)


def from_oklab(L, a, b):
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    return (_srgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), _srgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
            _srgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s))


def donustur(rgb, tur):
    r, g, b, a = rgb
    L, A, B = to_oklab(r, g, b)
    C = math.hypot(A, B)
    hue = math.atan2(B, A)
    if tur == 'yazi':
        if L < 0.6:
            return None
        L2, C2 = (0.42, min(C * 1.15, 0.12)) if C >= 0.05 else (0.29, min(C, 0.03))
        if a < 1:  # saydam açık yazı (soluk açıklama): açık zeminde opak ve soluk-koyu olsun (okunurluk için)
            L2, a = max(L2, 0.40), 1
    elif tur == 'zemin':
        if L > 0.42:
            return None
        L2, C2 = 0.975 - L * 0.3, max(C * 0.7, 0.022)
    else:  # çizgi
        if L <= 0.42:
            L2, C2 = 0.84 - L * 0.2, max(C * 0.8, 0.03)
        elif L >= 0.75 and C < 0.04:
            L2, C2 = 0.38, C
        else:
            return None
    if C < 0.02:  # nötr ya da az doygun: sıcak ton ver (ceviz/krem ailesi)
        hue = math.atan2(0.03, 0.012)
    R, G, Bb = from_oklab(L2, C2 * math.cos(hue), C2 * math.sin(hue))
    R, G, Bb = [int(round(max(0, min(255, x)))) for x in (R, G, Bb)]
    return f'rgba({R},{G},{Bb},{a:g})' if a < 1 else f'#{R:02x}{G:02x}{Bb:02x}'


ADLI = {'white': (255, 255, 255, 1), 'black': (0, 0, 0, 1)}
RENK = re.compile(r'#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b|rgba?\([^()]*\)|\b(?:white|black)\b')


def parse(s):
    if s in ADLI:
        return ADLI[s]
    if s.startswith('#'):
        x = s[1:]
        if len(x) in (3, 4):
            x = ''.join(c * 2 for c in x)
        r, g, b = int(x[0:2], 16), int(x[2:4], 16), int(x[4:6], 16)
        a = int(x[6:8], 16) / 255 if len(x) == 8 else 1
        return r, g, b, a
    v = re.split(r'[\s,/]+', s[s.index('(') + 1:-1].strip())
    if len(v) < 3 or any('var' in t or 'calc' in t for t in v):
        return None
    try:
        f = [float(t[:-1]) * 2.55 if t.endswith('%') else float(t) for t in v[:3]]
        a = 1.0
        if len(v) > 3:
            a = float(v[3][:-1]) / 100 if v[3].endswith('%') else float(v[3])
        return f[0], f[1], f[2], a
    except ValueError:
        return None


def deger_donustur(val, tur):
    if 'url(' in val:
        return None
    deg = [False]

    def f(m):
        c = parse(m.group(0))
        if not c:
            return m.group(0)
        y = donustur(c, tur)
        if y is None:
            return m.group(0)
        deg[0] = True
        return y
    out = RENK.sub(f, val)
    return out if deg[0] else None


TUR = {'color': 'yazi', '-webkit-text-fill-color': 'yazi', 'caret-color': 'yazi', 'fill': 'yazi', 'stroke': 'yazi', 'text-decoration-color': 'yazi',
       'background': 'zemin', 'background-color': 'zemin', 'background-image': 'zemin',
       'border': 'cizgi', 'border-color': 'cizgi', 'border-top': 'cizgi', 'border-bottom': 'cizgi', 'border-left': 'cizgi', 'border-right': 'cizgi',
       'border-top-color': 'cizgi', 'border-bottom-color': 'cizgi', 'border-left-color': 'cizgi', 'border-right-color': 'cizgi'}
# 3B sahne, kapılar, giriş ekranı, öğretmen alanı: dönüştürülmez (konu öğesi bu sınıflardan biriyse)
HARIC = re.compile(r'uye39|\.o42|sahne40|\.vp40|\.kam40|\.z40|\.k40\b|\.k40-|\.kd(?![\w-])|hava40|perde40|\.bit40|\.apg|\.yan40|\.sk40|\.uc40|\.ap40|madalyon|o41-sahne|o41-cv|o41-perde|o41-gkapi|p39-kapi|p39-kor|\.kapi|ogrt37|\.dg42|print')


UI = re.compile(r'ust40|alt40|bil40|ipu40|yrd40|nok40|nv40|mk40|ib40|o41-(?!sahne|cv|perde|gkapi)')


def dahil(s):
    s = s.strip()
    if not s or re.search(r'uye39|\.o42|ogrt37|\.dg42', s):
        return False
    konu = re.split(r'[\s>+~]+', s)[-1]
    if UI.search(konu):
        return True
    return not HARIC.search(s)


def kurallar(s, ctx=''):
    i, n = 0, len(s)
    while i < n:
        j = s.find('{', i)
        if j < 0:
            break
        sel = s[i:j].strip()
        d, k = 1, j + 1
        while d and k < n:
            if s[k] == '{':
                d += 1
            elif s[k] == '}':
                d -= 1
            k += 1
        govde = s[j + 1:k - 1]
        if sel.startswith('@media') or sel.startswith('@supports'):
            yield from kurallar(govde, (ctx + ' ' if ctx else '') + sel)
        elif not sel.startswith('@'):
            yield ctx, sel, govde
        i = k


def bildirimler(govde):
    parca, d, q, buf = [], 0, None, ''
    for ch in govde:
        if q:
            buf += ch
            if ch == q:
                q = None
            continue
        if ch in '"\'':
            q = ch
        elif ch == '(':
            d += 1
        elif ch == ')':
            d -= 1
        if ch == ';' and d == 0:
            parca.append(buf)
            buf = ''
        else:
            buf += ch
    if buf.strip():
        parca.append(buf)
    for p in parca:
        if ':' in p:
            k, v = p.split(':', 1)
            yield k.strip().lower(), v.strip()


def ek_on(sel, on, kok_ek):
    """sel'i ön ek bağlamına alır: 'ON :is(sel)::sahte'. html/:root ile başlıyorsa kök_ek eklenir."""
    sel = sel.strip()
    m = re.search(r'(::?(?:before|after|placeholder|marker|selection|-webkit-[\w-]+|first-line|first-letter))\s*$', sel)
    sahte = ''
    if m and m.group(1).startswith('::') or (m and m.group(1) in (':before', ':after')):
        sahte = m.group(1)
        sel = sel[:m.start()]
    if re.match(r'^(html|:root)\b', sel):
        if not kok_ek:
            return None
        return re.sub(r'^(html|:root)', r'\1' + kok_ek, sel) + sahte
    if not sel:
        return None
    return f'{on} :is({sel}){sahte}'


def uret(css, on, kok_ek):
    cikti, say = [], 0
    for ctx, sel, govde in kurallar(css):
        if 'prefers-reduced-motion' in ctx or 'print' in ctx:
            continue
        secs = [s for s in sel.split(',') if dahil(s)]
        if not secs:
            continue
        bild = []
        for k, v in bildirimler(govde):
            if k.startswith('--') or k not in TUR:
                continue
            imp = '!important' in v
            vv = v.replace('!important', '').strip()
            y = deger_donustur(vv, TUR[k])
            if y:
                bild.append(f'{k}:{y}{"!important" if imp else ""}')
        if not bild:
            continue
        yeni = [x for x in (ek_on(s, on, kok_ek) for s in secs) if x]
        if not yeni:
            continue
        kural = ','.join(yeni) + '{' + ';'.join(bild) + '}'
        say += len(bild)
        cikti.append(f'{ctx}{{{kural}}}' if ctx else kural)
    return '\n'.join(cikti), say


tum_css = ''.join(re.findall(r'<style[^>]*>(.*?)</style>', h, flags=re.S))
tum_css = re.sub(r'/\*.*?\*/', '', tum_css, flags=re.S)
bas = ''.join(re.findall(r'<style[^>]*>(.*?)</style>', h, flags=re.S))
i0 = bas.index('V39.0 · Üyelik seçimi + Öğrenme Dünyası')
prem_css = re.sub(r'/\*.*?\*/', '', bas[bas.rfind('/*', 0, i0):], flags=re.S)
gunduz, n1 = uret(prem_css, 'html[data-pt43=gunduz]', '[data-pt43=gunduz]')
kagit, n2 = uret(prem_css, '.p43-kagit', None)
LOG.append(f'üretilen gündüz bildirimi: {n1}, ders sayfası bildirimi: {n2}')

# türetilmiş kök değişkenler (yalnız koşulsuz :root kurallarında tanımlı olanlar) → Premium ve ders sayfasında yeniden
kok = re.compile(r'^(?:html|:root)$')
tur = {}
kosullu = set()
for ctx, sel, govde in kurallar(tum_css):
    ss = [x.strip() for x in sel.split(',')]
    if not all(re.match(r'^(?:html|:root)(?:\[[^\]]*\]|:not\([^)]*\)|\.[\w-]+)*$', x) for x in ss):
        continue
    for k, v in bildirimler(govde):
        if k.startswith('--') and 'var(' in v:
            if ctx or not all(kok.match(x) for x in ss):
                kosullu.add(k)
            else:
                tur[k] = v
turet = {k: v for k, v in tur.items() if k not in kosullu and k not in ('--ca', '--cb')}
turet_css = ':where(body[data-prem39],body[data-prem39] .p43-kagit){' + ';'.join(f'{k}:{v}' for k, v in turet.items()) + '}'
LOG.append('yeniden tanımlanan türetilmiş değişkenler: ' + ', '.join(turet))

uretilen = '/* ===== V43.0 üretilmiş: türetilmiş değişkenler, Premium gündüz modu, krem ders sayfası (tools/v43/build430.py) ===== */\n' + turet_css + '\n' + gunduz + '\n' + kagit + '\n'
open(os.path.join(HERE, 'uretilen.css'), 'w', encoding='utf-8').write(uretilen)

# ---------------------------------------------------------------- yerleştirme
rep('V31.VER="V42.0"', 'V31.VER="V43.0"', cnt=h.count('V31.VER="V42.0"'), what='sürüm etiketi')
rep('<meta name="data-version" content="v31">', '<meta name="data-version" content="v31"><meta name="app-version" content="V43.0">', what='sürüm metaverisi')
ESKI = '<script>try{document.documentElement.dataset.theme=localStorage.getItem("dk-theme")||"dark"}catch(e){document.documentElement.dataset.theme="dark"}</script>'
YENI = ('<script>(function(){var d=document.documentElement,t="dark";try{t=localStorage.getItem("dk-theme")||"dark";'
        'var p=0;try{var pr=JSON.parse(localStorage.getItem("dk-deneyim39")||"{}");p=sessionStorage.getItem("dk-deneyim39-aktif")==="1"||(pr.hatirla&&pr.son==="premium")}catch(e){}'
        'if(p){var m=localStorage.getItem("dk-ptema43")||"gece";if(m==="oto")m=matchMedia("(prefers-color-scheme: light)").matches?"gunduz":"gece";'
        'if(m!=="gunduz")m="gece";d.dataset.pt43=m;t=m==="gunduz"?"light":"dark"}}catch(e){}d.dataset.theme=t})()</script>')
rep(ESKI, YENI, what='erken tema betiği (Premium teması ilk boyamadan önce)')

css = open(os.path.join(HERE, 'v430.css'), encoding='utf-8').read()
js = open(os.path.join(HERE, 'v430.js'), encoding='utf-8').read()
assert '</script' not in js.lower() and '</style' not in (css + uretilen).lower()
a = h.index('</style></head><body>')
h = h[:a] + uretilen + css + h[a:]
LOG.append('üretilen css %d bayt, v430.css %d bayt' % (len(uretilen.encode()), len(css.encode())))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v430.js eklendi (%d bayt)' % len(js.encode()))

assert seeds(h) == SEED0, 'veri/müzik blokları değişti!'
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri ve müzik blokları aynı:', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
