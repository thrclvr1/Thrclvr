"""V56.0'ı V55.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v56/build560.py
Girdi : surumler/din-kulturu-platformu-v55.0.html  (değiştirilmez; md5 doğrulanır). Paketli; paket513.ac() ile açılır, sonunda paketlenir.
Çıktı : surumler/din-kulturu-platformu-v56.0.html  ve  index.html (aynı içerik)
        tools/v56/.okunur/v56.0-okunur.html (paketlenmemiş; depoya eklenmez)
        tools/v56/tema_uretilen.css (incelemek için; depoda)

Ortak tema altyapısı (V56):
  • V55'in beş Altın teması için üretilmiş CSS (≈ 296 KB) KALDIRILIR; Altın ve Öğretmen modu Elmas'ın tema sistemini kullanır
    (Açık / Koyu / Otomatik — tek tercih).
  • Altın'ın sabit renkleri derlemede Elmas paletine UYARLANIR: Altın yüzey/yazı/çizgi renkleri, açıklıklarına göre Elmas'ın aynı
    görevdeki renklerine eşlenir (koyu: lacivert zemin #0B1020, kart #131A2D …; açık: #F3F5FA, beyaz kart, #0B1020 yazı …);
    altın vurgular (Altın kimliği) korunur; yeşil/kırmızı/mavi durum renkleri ve saf gri dokunulmaz.
    Her renk bir değişkene (--c56-N) bağlanır; kurallar bir kez yazılır, açık ve koyu için yalnız değişken tablosu yazılır.
    Açık değer V43'ün gündüz dönüşümünden (tools/v43/build430.py donustur) sonra eşlenir.
"""
import hashlib, math, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'v51_3'))
import paket513  # noqa: E402

SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v55.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v56.0.html')
IDX = os.path.join(ROOT, 'index.html')
OKU = os.path.join(HERE, '.okunur', 'v56.0-okunur.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v56.0' not in f]
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
rep('V31.VER="V55.0"', 'V31.VER="V56.0"', cnt=h.count('V31.VER="V55.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V55.0">', '<meta name="app-version" content="V56.0">', what='sürüm metaverisi')

# ---------------------------------------------------------------- V55 tema CSS'i kaldırılır
i = h.index('/* ===== V55.0 üretilmiş: Altın temaları')
j = h.index('</style></head><body>', i)
LOG.append(f'V55 beş tema CSS kaldırıldı: {j - i} bayt')
h = h[:i] + h[j:]

# ---------------------------------------------------------------- erken tema betiği: ortak tercih
# V43 betiği Altın için dk-ptema43'ü okur; V56'da ortak tercih (dk-tema47 'oto' | dk-theme) Altın'a da uygulanır.
ESKI = 'if(p){var m=localStorage.getItem("dk-ptema43")||"gece";'
YENI = 'if(p){var m=localStorage.getItem("dk-tema47")==="oto"?"oto":(localStorage.getItem("dk-theme")==="light"?"gunduz":"gece");'
rep(ESKI, YENI, what='erken tema betiği: Altın ortak tercihi izler')

# ---------------------------------------------------------------- Altın renkleri → Elmas paleti
_k = open(os.path.join(ROOT, 'tools', 'v43', 'build430.py'), encoding='utf-8').read()
_bas, _son = _k.index('# ---------------------------------------------------------------- renk dönüşümü (OKLab)'), _k.index('def ek_on(')
_ns = {'math': math, 're': re}
exec(_k[_bas:_son], _ns)
to_oklab, from_oklab, donustur, parse, RENK, kurallar, bildirimler, dahil = (_ns[x] for x in ('to_oklab', 'from_oklab', 'donustur', 'parse', 'RENK', 'kurallar', 'bildirimler', 'dahil'))
TUR = dict(_ns['TUR'])
for k in ('box-shadow', 'outline', 'outline-color', 'text-shadow', 'accent-color', 'column-rule-color', 'border-image'):
    TUR[k] = 'diger'


def lch(c):
    L, A, B = to_oklab(*c[:3])
    return L, math.hypot(A, B), (math.degrees(math.atan2(B, A)) + 360) % 360


def hexc(x):
    return parse(x)


def yaz(L, C, H, a):
    r, g, b = from_oklab(L, C * math.cos(math.radians(H)), C * math.sin(math.radians(H)))
    r, g, b = [int(round(max(0, min(255, v)))) for v in (r, g, b)]
    return f'rgba({r},{g},{b},{a:g})' if a < 1 else f'#{r:02x}{g:02x}{b:02x}'


# (Altın rengi, Elmas'taki aynı görevdeki renk): zemin, kart, ikinci kart, üçüncü yüzey, çizgi, ikincil yazı, yazı
ESLE = {
    'koyu': [('#130E0A', '#0B1020'), ('#1E1710', '#131A2D'), ('#271E15', '#19243A'), ('#2E2418', '#20304D'), ('#3D3020', '#26324D'), ('#C9BBA3', '#A4AEC2'), ('#F3EADB', '#F0F3FA')],
    'acik': [('#2A1E12', '#0B1020'), ('#3E2E1D', '#1B2740'), ('#5B4733', '#4A5670'), ('#DECBAA', '#DCE2EE'), ('#ECDFC8', '#E6ECF8'), ('#F2EADB', '#F3F5FA'), ('#FFFBF3', '#FFFFFF')],
}
TAB = {}
for mod, L in ESLE.items():
    P = sorted([(lch(hexc(a)), lch(hexc(b))) for a, b in L], key=lambda x: x[0][0])
    TAB[mod] = P


def ara(P, L0):
    """Altın açıklığı L0 → Elmas (L, C, H): bağlantı noktaları arasında doğrusal; uçlarda en yakın aralığın eğimiyle."""
    if L0 <= P[0][0][0]:
        a, b = P[0], P[1]
    elif L0 >= P[-1][0][0]:
        a, b = P[-2], P[-1]
    else:
        for k in range(len(P) - 1):
            if P[k][0][0] <= L0 <= P[k + 1][0][0]:
                a, b = P[k], P[k + 1]
                break
    dx = b[0][0] - a[0][0] or 1e-6
    t = (L0 - a[0][0]) / dx
    L = a[1][0] + t * (b[1][0] - a[1][0])
    tc = min(1, max(0, t))
    C = a[1][1] + tc * (b[1][1] - a[1][1])
    H = b[1][2] if a[1][1] < 0.005 else (a[1][2] if b[1][1] < 0.005 else a[1][2] + tc * (((b[1][2] - a[1][2] + 180) % 360) - 180))
    return max(0, min(1, L)), max(0, C), H


def T(c, mod):
    L, C, H = lch(c)
    if C < 0.004:
        return None                       # saf beyaz/siyah/gri
    sicak = 25 <= H <= 115
    if not sicak and C >= 0.03:
        return None                       # durum renkleri (yeşil, kırmızı, mavi)
    if C >= 0.06 and sicak:
        return None                       # altın vurgular: Altın kimliği korunur
    L2, C2, H2 = ara(TAB[mod], L)
    return yaz(L2, C2, H2, c[3])


tum = ''.join(re.findall(r'<style[^>]*>(.*?)</style>', h, flags=re.S))
i0 = tum.index('V39.0 · Üyelik seçimi + Altın Öğrenme Alanı')
altin_css = re.sub(r'/\*.*?\*/', '', tum[tum.rfind('/*', 0, i0):], flags=re.S)

KOK = '[data-pt43][data-pt43]:not([data-x56])'
PRE = {'b': 'html' + KOK, 'g': 'html[data-pt43="gunduz"]' + KOK, 'n': 'html[data-pt43="gece"]' + KOK}
DEGIS, SIRA = {}, []


def tur_kipi(sel):
    if re.search(r'data-pt43=["\']?gunduz', sel):
        return 'g'
    if re.search(r'data-pt43=["\']?gece', sel):
        return 'n'
    return 'b'


def ek_on(sel, kip):
    sel = sel.strip()
    m = re.search(r'(::?(?:before|after|placeholder|marker|selection|-webkit-[\w-]+|first-line|first-letter))\s*$', sel)
    sahte = ''
    if m and (m.group(1).startswith('::') or m.group(1) in (':before', ':after')):
        sahte = m.group(1)
        sel = sel[:m.start()]
    if not sel:
        return None
    if re.match(r'^(html|:root)\b', sel):
        mm = re.match(r'^(html|:root)((?:\[[^\]]*\]|:not\([^)]*\)|\.[\w-]+)*)', sel)
        return mm.group(1) + mm.group(2) + KOK + ('' if re.search(r'data-pt43', mm.group(2)) else '') + sel[mm.end():] + sahte
    return f'{PRE[kip]} :is({sel}){sahte}'


def norm(s):
    return re.sub(r'\s+', '', s.lower())


def degisken(c, tur, kip):
    k = (norm(c), tur, kip)
    if k not in DEGIS:
        DEGIS[k] = len(SIRA)
        SIRA.append(k)
    return f'var(--c56-{DEGIS[k]})'


cikti = {'b': [], 'n': [], 'g': []}
say = 0
for ctx, sel, govde in kurallar(altin_css):
    if 'prefers-reduced-motion' in ctx or 'print' in ctx:
        continue
    secs = [s for s in sel.split(',') if s.strip() and dahil(s)]
    if not secs:
        continue
    gruplar = {}
    for s in secs:
        gruplar.setdefault(tur_kipi(s), []).append(s)
    for kip, ss in gruplar.items():
        bild, bild_n = [], []
        for k, v in bildirimler(govde):
            ozel = k.startswith('--')
            if (not ozel and k not in TUR) or 'url(' in v:
                continue
            tur = 'ozel' if ozel else TUR[k]
            imp = '!important' in v
            vv = v.replace('!important', '').strip()
            if not RENK.search(vv):
                continue
            kk = 'n' if (ozel and kip == 'b') else kip
            deg = [False]

            def f(m, tur=tur, kk=kk):
                c = parse(m.group(0))
                if not c:
                    return m.group(0)
                # dönüşmeyen renk (vurgu, durum) değişkene bağlanmaz
                if T(c, 'koyu') is None and (kk == 'n' or T(c, 'acik') is None) and not (kk != 'n' and tur in ('yazi', 'zemin', 'cizgi') and donustur(c, tur)):
                    return m.group(0)
                deg[0] = True
                return degisken(m.group(0), tur, kk)
            y = RENK.sub(f, vv)
            if deg[0]:
                (bild_n if kk != kip else bild).append(f'{k}:{y}{"!important" if imp else ""}')
        for kp, bb in ((kip, bild), ('n', bild_n)):
            if not bb:
                continue
            yeni = [x for x in (ek_on(s, kp) for s in ss) if x]
            if not yeni:
                continue
            kural = ','.join(yeni) + '{' + ';'.join(bb) + '}'
            say += len(bb)
            cikti[kp].append(f'{ctx}{{{kural}}}' if ctx else kural)


def kaynak_yazi(k):
    return k if k[3] >= 1 else k


tablo = []
for mod, pt in (('koyu', 'gece'), ('acik', 'gunduz')):
    satir = []
    for i, (c, tur, kip) in enumerate(SIRA):
        if (pt == 'gece' and kip == 'g') or (pt == 'gunduz' and kip == 'n'):
            continue
        rgb = parse(c)
        kay = rgb
        if pt == 'gunduz' and kip == 'b' and tur in ('yazi', 'zemin', 'cizgi'):
            v = donustur(rgb, tur)
            if v:
                kay = parse(v)
        y = T(kay, mod)
        if y is None:
            y = c if kay is rgb else (f'rgba({int(kay[0])},{int(kay[1])},{int(kay[2])},{kay[3]:g})' if kay[3] < 1 else '#%02x%02x%02x' % tuple(int(round(x)) for x in kay[:3]))
        satir.append(f'--c56-{i}:{y}')
    tablo.append(f'html[data-pt43="{pt}"]{{{";".join(satir)}}}')

tema_css = ('/* ===== V56.0 üretilmiş: Altın renkleri Elmas tema sistemine uyarlanır (tools/v56/build560.py). Açık = gündüz, Koyu = gece. ===== */\n'
            + '\n'.join(tablo) + '\n' + '\n'.join(cikti['b']) + '\n' + '\n'.join(cikti['n']) + '\n' + '\n'.join(cikti['g']) + '\n')
open(os.path.join(HERE, 'tema_uretilen.css'), 'w', encoding='utf-8').write(tema_css)
LOG.append(f'tema: {len(SIRA)} renk değişkeni, {say} bildirim, {len(tema_css.encode())} bayt')

# ---------------------------------------------------------------- yerleştirme
JS = ['v560_ilerleme.js', 'v560_tema.js', 'v560_altin.js', 'v560_oyun.js']
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in JS)
assert '</script' not in js.lower() and '</style' not in tema_css.lower()
a = h.index('</style></head><body>')
h = h[:a] + tema_css + h[a:]
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v560 js eklendi (%d bayt)' % len(js.encode()))
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
print('V55.0:', os.path.getsize(SRC), 'bayt  | V56.0 okunur:', len(h.encode()), 'bayt  | V56.0 paketli:', len(p.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri, müzik ve görsel blokları aynı (açılınca):', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
