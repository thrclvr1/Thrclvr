"""V57.0'ı V56.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v57/build570.py
Girdi : surumler/din-kulturu-platformu-v56.0.html (değiştirilmez; md5 doğrulanır). paket513.ac() ile açılır, sonunda paketlenir.
Çıktı : surumler/din-kulturu-platformu-v57.0.html ve index.html; tools/v57/.okunur/v57.0-okunur.html (depoya eklenmez);
        tools/v57/tema_uretilen.css (incelemek için)

Tema sistemi (V57) — seçenekler BİRLEŞTİRİLİR, hiçbiri kaldırılmaz:
  • V56'nın “tek ortak tema” modülü (v560_tema.js) çıkarılır; V54/V55 tema sistemi (Altın: 5 tema + gündüz/gece, dk-tema54 +
    dk-ptema43; Öğretmen: 5 tema + gündüz/gece, dk-tema54.ogretmen/ogretmenMod; Elmas: dk-theme/dk-tema47) aynen geri gelir.
  • Altın'a yeni “elmas” teması eklenir: Altın'ın sabit renkleri Elmas paletine eşlenir (V56 eşlemesi). Gündüz = Elmas Açık,
    gece = Elmas Koyu, otomatik = cihaz teması.
  • Altın temalarının üretilmiş CSS'i (V55'in 4 teması + elmas) tek seferde: kurallar bir kez, tema × gündüz/gece değişken tabloları.
"""
import hashlib, math, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'v51_3'))
import paket513  # noqa: E402

SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v56.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v57.0.html')
IDX = os.path.join(ROOT, 'index.html')
OKU = os.path.join(HERE, '.okunur', 'v57.0-okunur.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v57.0' not in f]
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
rep('V31.VER="V56.0"', 'V31.VER="V57.0"', cnt=h.count('V31.VER="V56.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V56.0">', '<meta name="app-version" content="V57.0">', what='sürüm metaverisi')

# ---------------------------------------------------------------- V56 ortak tema modülü çıkarılır (V54/V55 sistemi geri gelir)
tema56 = open(os.path.join(ROOT, 'tools', 'v56', 'v560_tema.js'), encoding='utf-8').read()
rep(tema56, '/* V57.0: V56 ortak tema modülü (v560_tema.js) çıkarıldı; temalar V57.Tema ile birleştirildi. */\n', what='V56 ortak tema modülü çıkarıldı')
rep('if(p){var m=localStorage.getItem("dk-tema47")==="oto"?"oto":(localStorage.getItem("dk-theme")==="light"?"gunduz":"gece");',
    'if(p){var m=localStorage.getItem("dk-ptema43")||"gece";', what='erken tema betiği: Altın yine kendi tercihini (dk-ptema43) okur')
rep('html[data-pt43] body[data-prem39] .pr49-ust.al{', 'html[data-pt43][data-tema54a="elmas"] body[data-prem39] .pr49-ust.al{', what='Profil başlığı lacivert yalnız Elmas temasında')

# V56 üretilmiş CSS'i (yalnız Elmas eşlemesi) kaldırılır; birleşik üretim aşağıda
i = h.index('/* ===== V56.0 üretilmiş: Altın renkleri Elmas')
j = h.index('</style></head><body>', i)
LOG.append(f'V56 üretilmiş CSS kaldırıldı: {j - i} bayt')
h = h[:i] + h[j:]

# ---------------------------------------------------------------- renk araçları (V43)
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


def yaz(L, C, H, a):
    r, g, b = from_oklab(L, C * math.cos(math.radians(H)), C * math.sin(math.radians(H)))
    r, g, b = [int(round(max(0, min(255, v)))) for v in (r, g, b)]
    return f'rgba({r},{g},{b},{a:g})' if a < 1 else f'#{r:02x}{g:02x}{b:02x}'


# V55 temaları (değerler V55 ile aynı)
TEMA55 = {
    'lacivert': dict(hs=258, cs=2.6, cmax=0.055, ak=0, ac=1.0),
    'zumrut': dict(hs=168, cs=2.4, cmax=0.05, ak=6, ac=0.95),
    'murekkep': dict(hs=318, cs=2.4, cmax=0.055, ak=-30, ac=1.02),
    'kumtasi': dict(hs=48, cs=1.5, cmax=0.04, ak=-24, ac=0.92),
}


def T55(c, tema, mod):
    p = TEMA55[tema]
    L, C, H = lch(c)
    if C < 0.004:
        return None
    sicak = 25 <= H <= 115
    if not sicak and C >= 0.03:
        return None
    if C >= 0.06 and sicak:
        return yaz(L, C * p['ac'], H + p['ak'], c[3])
    C2 = min(max(C, 0.008) * p['cs'], p['cmax'])
    if L > 0.9:
        C2 = min(C2, 0.022)
    return yaz(L, C2, p['hs'], c[3])


# Elmas teması (V56 eşlemesi): Altın rengi → Elmas'ın aynı görevdeki rengi
ESLE = {
    'gece': [('#130E0A', '#0B1020'), ('#1E1710', '#131A2D'), ('#271E15', '#19243A'), ('#2E2418', '#20304D'), ('#3D3020', '#26324D'), ('#C9BBA3', '#A4AEC2'), ('#F3EADB', '#F0F3FA')],
    'gunduz': [('#2A1E12', '#0B1020'), ('#3E2E1D', '#1B2740'), ('#5B4733', '#4A5670'), ('#DECBAA', '#DCE2EE'), ('#ECDFC8', '#E6ECF8'), ('#F2EADB', '#F3F5FA'), ('#FFFBF3', '#FFFFFF')],
}
TAB = {m: sorted([(lch(parse(a)), lch(parse(b))) for a, b in L], key=lambda x: x[0][0]) for m, L in ESLE.items()}


def ara(P, L0):
    if L0 <= P[0][0][0]:
        a, b = P[0], P[1]
    elif L0 >= P[-1][0][0]:
        a, b = P[-2], P[-1]
    else:
        for k in range(len(P) - 1):
            if P[k][0][0] <= L0 <= P[k + 1][0][0]:
                a, b = P[k], P[k + 1]
                break
    t = (L0 - a[0][0]) / ((b[0][0] - a[0][0]) or 1e-6)
    L = a[1][0] + t * (b[1][0] - a[1][0])
    tc = min(1, max(0, t))
    C = a[1][1] + tc * (b[1][1] - a[1][1])
    H = b[1][2] if a[1][1] < 0.005 else (a[1][2] if b[1][1] < 0.005 else a[1][2] + tc * (((b[1][2] - a[1][2] + 180) % 360) - 180))
    return max(0, min(1, L)), max(0, C), H


def TEL(c, tema, mod):
    L, C, H = lch(c)
    if C < 0.004:
        return None
    sicak = 25 <= H <= 115
    if (not sicak and C >= 0.03) or (C >= 0.06 and sicak):
        return None
    L2, C2, H2 = ara(TAB[mod], L)
    return yaz(L2, C2, H2, c[3])


TEMALAR = [(k, T55) for k in TEMA55] + [('elmas', TEL)]

tum = ''.join(re.findall(r'<style[^>]*>(.*?)</style>', h, flags=re.S))
i0 = tum.index('V39.0 · Üyelik seçimi + Altın Öğrenme Alanı')
altin_css = re.sub(r'/\*.*?\*/', '', tum[tum.rfind('/*', 0, i0):], flags=re.S)

KOK = '[data-tema54a][data-tema54a]:not([data-tema54a="altin"])'
PRE = {'b': 'html[data-pt43]' + KOK, 'g': 'html[data-pt43="gunduz"]' + KOK, 'n': 'html[data-pt43="gece"]' + KOK}
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
        on = '' if re.search(r'data-pt43', mm.group(2)) else '[data-pt43]'
        return mm.group(1) + mm.group(2) + on + KOK + sel[mm.end():] + sahte
    return f'{PRE[kip]} :is({sel}){sahte}'


def degisken(c, tur, kip):
    k = (re.sub(r'\s+', '', c.lower()), tur, kip)
    if k not in DEGIS:
        DEGIS[k] = len(SIRA)
        SIRA.append(k)
    return f'var(--c57-{DEGIS[k]})'


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
                deg[0] = True
                return degisken(m.group(0), tur, kk)
            y = RENK.sub(f, vv)
            if deg[0]:
                (bild_n if kk != kip else bild).append(f'{k}:{y}{"!important" if imp else ""}')
        for kp, bb in ((kip, bild), ('n', bild_n)):
            if not bb:
                continue
            yeni = [x for x in (ek_on(s, kp) for s in ss) if x]
            if yeni:
                say += len(bb)
                kural = ','.join(yeni) + '{' + ';'.join(bb) + '}'
                cikti[kp].append(f'{ctx}{{{kural}}}' if ctx else kural)


def bicim(k):
    return (f'rgba({int(k[0])},{int(k[1])},{int(k[2])},{k[3]:g})' if k[3] < 1 else '#%02x%02x%02x' % tuple(int(round(x)) for x in k[:3]))


tablo = []
for tema, fn in TEMALAR:
    for mod in ('gece', 'gunduz'):
        satir = []
        for idx, (c, tur, kip) in enumerate(SIRA):
            if (mod == 'gece' and kip == 'g') or (mod == 'gunduz' and kip == 'n'):
                continue
            rgb = parse(c)
            kay = rgb
            if mod == 'gunduz' and kip == 'b' and tur in ('yazi', 'zemin', 'cizgi'):
                v = donustur(rgb, tur)
                if v:
                    kay = parse(v)
            y = fn(kay, tema, mod)
            if y is None:
                y = c if kay is rgb else bicim(kay)
            satir.append(f'--c57-{idx}:{y}')
        tablo.append(f'html[data-pt43="{mod}"][data-tema54a="{tema}"]{{{";".join(satir)}}}')

tema_css = ('/* ===== V57.0 üretilmiş: Altın temaları (Gece Lacivert, Zümrüt Kütüphane, Mürekkep ve Bakır, Kum Taşı, Elmas). Altın Mihrap = V43 paleti. tools/v57/build570.py ===== */\n'
            + '\n'.join(tablo) + '\n' + '\n'.join(cikti['b']) + '\n' + '\n'.join(cikti['n']) + '\n' + '\n'.join(cikti['g']) + '\n')
open(os.path.join(HERE, 'tema_uretilen.css'), 'w', encoding='utf-8').write(tema_css)
LOG.append(f'tema: {len(SIRA)} renk değişkeni × {len(TEMALAR)} tema × 2 görünüm, {say} bildirim, {len(tema_css.encode())} bayt')

# ---------------------------------------------------------------- yerleştirme
JS = ['v570_tema.js', 'v570_elmas.js', 'v570_altin.js', 'v570_secici.js']
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in JS)
assert '</script' not in js.lower() and '</style' not in tema_css.lower()
a = h.index('</style></head><body>')
h = h[:a] + tema_css + h[a:]
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v570 js eklendi (%d bayt)' % len(js.encode()))
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
print('V56.0:', os.path.getsize(SRC), 'bayt  | V57.0 okunur:', len(h.encode()), 'bayt  | V57.0 paketli:', len(p.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri, müzik ve görsel blokları aynı (açılınca):', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
