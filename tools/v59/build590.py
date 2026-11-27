"""V59.0'ı V58.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v59/build590.py
Girdi : surumler/din-kulturu-platformu-v58.0.html (değiştirilmez; md5 doğrulanır). paket513.ac() ile açılır, sonunda paketlenir.
Çıktı : surumler/din-kulturu-platformu-v59.0.html ve index.html; tools/v59/.okunur/v59.0-okunur.html (depoya eklenmez).

V59.0:
  • Elmas teması Altın'da bütün arayüze: V57'nin “elmas” tema tablolarında (html[data-pt43=gece|gunduz][data-tema54a="elmas"])
    Altın'dan kalan sıcak vurgu renkleri (altın/amber/bronz; düğmeler, seçili sekmeler, alt menü, kenarlıklar, ikonlar…) aynı
    açıklıkta Elmas mavisine çevrilir. Durum renkleri (uyarı/hata/başarı) ve diğer beş Altın teması DOKUNULMAZ.
  • Performans: V57'nin üretilmiş Altın tema CSS'i (~333 KB, 960 seçici; hepsi “Altın Mihrap dışında bir Altın teması” koşullu)
    <script type="text/plain" id="tema57-css"> içine alınır ve yalnız gerektiğinde (Altın açık + tema ≠ altin) <style> olarak eklenir.
    Elmas'ta ve Altın Mihrap'ta tarayıcı bu kuralları hiç ayrıştırmaz/eşlemez. Görünüm aynı.
  • Altın oyunları Elmas'tan ayrılır (veri ve mod düzeyinde): Elmas Oyunlar ekranındaki “Oyun Dünyası” kartı yalnız Altın'da
    eklenir; Elmas ana sayfa Oyunlar kartının alt yazısı Altın oyunlarını anmaz. Oyun listesi süzgeci v590_ekran.js'de.
"""
import colorsys, hashlib, math, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'v51_3'))
import paket513  # noqa: E402

SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v58.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v59.0.html')
IDX = os.path.join(ROOT, 'index.html')
OKU = os.path.join(HERE, '.okunur', 'v59.0-okunur.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v59.0' not in f]
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
rep('V31.VER="V58.0"', 'V31.VER="V59.0"', cnt=h.count('V31.VER="V58.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V58.0">', '<meta name="app-version" content="V59.0">', what='sürüm metaverisi')

# ---------------------------------------------------------------- OKLab yardımcıları
def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def gam(c):
    c = 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
    return max(0, min(255, round(c * 255)))


def oklch(r, g, b):
    r, g, b = lin(r), lin(g), lin(b)
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
    A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
    B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    return L, math.hypot(A, B), (math.degrees(math.atan2(B, A)) + 360) % 360


def rgb_of(L, C, H):
    A, B = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
    l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
    m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
    s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
    return r, g, b


def to_rgb_safe(L, C, H):
    # gamut içine al: renk doygunluğunu (C) gerekirse azalt
    for _ in range(40):
        r, g, b = rgb_of(L, C, H)
        if all(-0.0005 <= x <= 1.0005 for x in (r, g, b)):
            return tuple(gam(max(0, min(1, x))) for x in (r, g, b))
        C *= 0.92
    r, g, b = rgb_of(L, 0, H)
    return tuple(gam(max(0, min(1, x))) for x in (r, g, b))


ELMAS_H = oklch(0x4F, 0x7C, 0xFF)[2]          # Elmas vurgu tonu (#4F7CFF)


def parse(c):
    c = c.strip()
    m = re.fullmatch(r'#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})', c)
    if m:
        x = m.group(1)
        if len(x) == 3:
            x = ''.join(ch * 2 for ch in x)
        return int(x[0:2], 16), int(x[2:4], 16), int(x[4:6], 16), (int(x[6:8], 16) / 255 if len(x) == 8 else 1)
    m = re.fullmatch(r'rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)', c)
    if m:
        return float(m.group(1)), float(m.group(2)), float(m.group(3)), float(m.group(4)) if m.group(4) else 1
    return None


def mavi(c):
    p = parse(c)
    if not p:
        return None
    r, g, b, a = p
    L, C, H = oklch(r, g, b)
    if C < 0.045 or not (45 <= H <= 112):          # altın/amber/bronz/kahve; kırmızı (hata) tonları dışarıda
        return None
    R, G, B = to_rgb_safe(L, min(0.2, C * 1.15 + 0.02), ELMAS_H)
    return f'rgba({R},{G},{B},{a:g})' if a < 1 else '#%02x%02x%02x' % (R, G, B)


# ---------------------------------------------------------------- 1. Elmas teması: sıcak vurgular → Elmas mavisi
i = h.index('/* ===== V57.0 üretilmiş: Altın temaları')
j = h.index('</style></head><body>', i)
blk = h[i:j]
# durum renkleri: bu değişkenleri kullanan seçiciler uyarı/hata/başarı/kaynak doğrulama ise dokunma
DURUM_SEL = re.compile(r'\.uy\b|uyar|warn|\.kt\b|\.kd45|\.ok\b|\.d43|\.ps-|\.yn\b|\.dg\b|\.err\b|yanlis|kirmizi')
DURUM_OZ = re.compile(r'^--p-(?:uy|kt|ok)-')
durum = set()
for sel, govde in re.findall(r'([^{}]+)\{([^{}]*)\}', re.sub(r'/\*.*?\*/', '', blk, flags=re.S)):
    if sel.strip().startswith('html[data-pt43="'):
        continue                                   # tablo satırları
    for d in govde.split(';'):
        if ':' not in d:
            continue
        oz = d.split(':', 1)[0].strip()
        if DURUM_SEL.search(sel) or DURUM_OZ.match(oz):
            durum.update(int(n) for n in re.findall(r'var\(--c57-(\d+)\)', d))
say = {'gece': 0, 'gunduz': 0}


def tablo_cevir(m):
    mod, ic = m.group(1), m.group(2)
    out = []
    for d in ic.split(';'):
        if ':' not in d:
            out.append(d)
            continue
        k, v = d.split(':', 1)
        n = int(k.strip()[6:]) if k.strip().startswith('--c57-') else -1
        if n in durum:
            out.append(d)
            continue
        # tek renk ya da renk içeren değer (gölge, degrade)
        def sub(mm):
            y = mavi(mm.group(0))
            if y:
                say[mod] += 1
                return y
            return mm.group(0)
        out.append(k + ':' + re.sub(r'#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)', sub, v))
    return f'html[data-pt43="{mod}"][data-tema54a="elmas"]{{' + ';'.join(out) + '}'


blk2 = re.sub(r'html\[data-pt43="(gece|gunduz)"\]\[data-tema54a="elmas"\]\{([^}]*)\}', tablo_cevir, blk)
assert blk2 != blk
LOG.append(f'Elmas teması: sıcak vurgu → Elmas mavisi (gece {say["gece"]}, gündüz {say["gunduz"]} değer; durum renkleri korunan değişken: {len(durum)})')

# ---------------------------------------------------------------- 2. tema CSS'i gerektiğinde yüklenir
assert '</script' not in blk2.lower()
h = h[:i] + h[j:]
yukle = ('<script type="text/plain" id="tema57-css">' + blk2 + '</script>'
         '<script>/* V59: Altın tema CSS’i yalnız Altın açık ve tema ≠ Altın Mihrap iken eklenir (performans) */'
         '(function(){var d=document.documentElement,ref=document.currentScript,y=0;function k(){if(y)return;var a=d.getAttribute("data-tema54a");'
         'if(d.hasAttribute("data-pt43")&&a&&a!=="altin"){y=1;var s=document.createElement("style");s.id="tema57";'
         's.textContent=document.getElementById("tema57-css").textContent;ref.parentNode.insertBefore(s,ref);window.V59T={yuklendi:Date.now()}}}'
         'k();try{new MutationObserver(k).observe(d,{attributes:true,attributeFilter:["data-tema54a","data-pt43"]})}catch(e){}})();</script>')
rep('</style></head><body>', '</style>' + yukle + '</head><body>', what='tema CSS’i gerektiğinde yüklenir')
LOG.append(f'tema CSS’i ayrıldı: {len(blk2.encode())} bayt')

# ---------------------------------------------------------------- 3. Altın oyunları Elmas'tan ayrılır
rep("if (view === 'games' && !$.querySelector('.r46')) {", "if (view === 'games' && V39.on && !$.querySelector('.r46')) {", what='Oyun Dünyası kartı yalnız Altın’da')
rep("${kutu('oyun', 'oyun', 'Oyunlar', 'Oyun Dünyası ve Etkinlik oyunları', \"go('games')\")}", "${kutu('oyun', 'oyun', 'Oyunlar', 'Etkinlik oyunları ve Çark Çevirme', \"go('games')\")}", what='Elmas ana sayfa Oyunlar alt yazısı')

# ---------------------------------------------------------------- yerleştirme
JS = ['v590_perf.js', 'v590_tema.js', 'v590_ekran.js']
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in JS)
assert '</script' not in js.lower()
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v590 js eklendi (%d bayt)' % len(js.encode()))
yeni = seeds(h)
assert {k: v for k, v in yeni.items() if k != 'tema57-css'} == SEED0, 'veri/müzik/görsel blokları değişti!'
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
print('V58.0:', os.path.getsize(SRC), 'bayt  | V59.0 okunur:', len(h.encode()), 'bayt  | V59.0 paketli:', len(p.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri, müzik ve görsel blokları aynı (açılınca):', len(SEED0), '+ tema57-css')
print('eski sürüm dosyaları değişmedi:', len(keep))
