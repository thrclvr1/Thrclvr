"""V55.0'ı V54.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v55/build550.py
Girdi : surumler/din-kulturu-platformu-v54.0.html  (değiştirilmez; md5 doğrulanır). Paketli olduğundan önce
        tools/v51_3/paket513.ac() ile açılır, yamalar okunur metne uygulanır, sonunda paket513.paketle() ile yazılır.
Çıktı : surumler/din-kulturu-platformu-v55.0.html  ve  index.html (aynı içerik)
        tools/v55/.okunur/v55.0-okunur.html (paketlenmemiş ara çıktı; depoya eklenmez)
        tools/v55/tema_uretilen.css (incelemek için; depoda)

Eklenen: v550_duzen.js (V55.Duzen), v550_altin.js (V55.AltinAna, V55.Sinif, V55.Masa, V55.Tema), v550_oyun.js (V55.Oyun, V55.Dunya).
Derleme yamaları:
  • V45 Sınıf Dünyaları kapanışına iç durum erişimi (D._ic: kök, sınıf, bölge, ekran/ust/isaretle) — V55.Dunya bunu kullanır.
  • Altın tema renkleri ÜRETİLİR: Altın CSS'indeki (V39 işaretinden sonrası) sabit renkler OKLab/OKLCh'de tema kurallarıyla
    dönüştürülür (yüzeyler temanın tonuna, vurgular temanın vurgu tonuna; açıklık korunur → kontrast korunur). Her renk bir
    değişkene (--c55-N) bağlanır; kurallar bir kez yazılır, her tema × gündüz/gece için yalnız değişken tablosu yazılır.
    Gündüz değeri V43'ün gündüz dönüşümünden (tools/v43/build430.py donustur) sonra tema dönüşümüyle bulunur.
"""
import colorsys, hashlib, json, math, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'v51_3'))
import paket513  # noqa: E402

SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v54.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v55.0.html')
IDX = os.path.join(ROOT, 'index.html')
OKU = os.path.join(HERE, '.okunur', 'v55.0-okunur.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v55.0' not in f]
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
rep('V31.VER="V54.0"', 'V31.VER="V55.0"', cnt=h.count('V31.VER="V54.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V54.0">', '<meta name="app-version" content="V55.0">', what='sürüm metaverisi')

# ---------------------------------------------------------------- V45 Sınıf Dünyaları: iç durum erişimi
rep("  let KOK = null, G_ = 0, U_ = null, sayac = null, kalan = 0, durdu = false;\n",
    "  let KOK = null, G_ = 0, U_ = null, sayac = null, kalan = 0, durdu = false;\n"
    "  D._ic = {get kok() { return KOK; }, get g() { return G_; }, get u() { return U_; }, set u(v) { U_ = v; }, ekran: (a, b) => ekran(a, b), ust: (a, b) => ust(a, b), isaretle: (x, f) => isaretle(x, f), durSay: () => durSay(), get durdu() { return durdu; }};\n",
    what='V45 Sınıf Dünyaları iç durum erişimi (D._ic)')
rep("""    const kapat = `<div class="g44-ara"><button type="button" class="g44-b p" onclick="V45.Dunya.bolge('${U_}')">Devam</button></div>`;""",
    """    const kapat = D.devamHTML ? D.devamHTML(nid) : `<div class="g44-ara"><button type="button" class="g44-b p" onclick="V45.Dunya.bolge('${U_}')">Devam</button></div>`;""",
    what='V45 görev sonu: sıradaki görev akışı (D.devamHTML)')
rep('<article class="d45-not acil"><small>Bulunan not · ${esc(n.konu)}</small>',
    '<article class="d45-not acil"><small>${esc(x.yer ? x.yer + " · Keşif notu" : "Bulunan not")} · ${esc(n.konu)}</small>',
    what='V45 not başlığı: keşif noktasının yeri')

# ---------------------------------------------------------------- tema üretimi
sys.path.insert(0, os.path.join(ROOT, 'tools', 'v43'))
# build430.py modül olarak içe aktarılamaz (çalışınca derler); dönüşüm işlevlerini kaynak metinden al
_k = open(os.path.join(ROOT, 'tools', 'v43', 'build430.py'), encoding='utf-8').read()
_bas, _son = _k.index('# ---------------------------------------------------------------- renk dönüşümü (OKLab)'), _k.index('def ek_on(')
_ns = {'math': math, 're': re}
exec(_k[_bas:_son], _ns)
to_oklab, from_oklab, donustur, parse, RENK, kurallar, bildirimler, dahil = (_ns[x] for x in ('to_oklab', 'from_oklab', 'donustur', 'parse', 'RENK', 'kurallar', 'bildirimler', 'dahil'))
TUR = dict(_ns['TUR'])
for k in ('box-shadow', 'outline', 'outline-color', 'text-shadow', 'accent-color', 'column-rule-color', 'border-image', 'border-block-color', 'border-inline-color'):
    TUR[k] = 'diger'

# Tema kuralları (OKLCh): yüzey tonu hs, yüzey doygunluk katsayısı cs ve sınırı cmax; vurgu tonu kayması ak, vurgu doygunluğu ac
TEMA = {
    'lacivert': dict(hs=258, cs=2.6, cmax=0.055, ak=0, ac=1.0),
    'zumrut': dict(hs=168, cs=2.4, cmax=0.05, ak=6, ac=0.95),
    'murekkep': dict(hs=318, cs=2.4, cmax=0.055, ak=-30, ac=1.02),
    'kumtasi': dict(hs=48, cs=1.5, cmax=0.04, ak=-24, ac=0.92),
}


def lch(c):
    L, A, B = to_oklab(*c[:3])
    return L, math.hypot(A, B), (math.degrees(math.atan2(B, A)) + 360) % 360


def yaz(L, C, H, a):
    r, g, b = from_oklab(L, C * math.cos(math.radians(H)), C * math.sin(math.radians(H)))
    r, g, b = [int(round(max(0, min(255, x)))) for x in (r, g, b)]
    return f'rgba({r},{g},{b},{a:g})' if a < 1 else f'#{r:02x}{g:02x}{b:02x}'


def T(c, tema):
    """c: (r,g,b,a). Sıcak tonlu (Altın) yüzey/vurgu renklerini temaya taşır; açıklık aynen korunur."""
    p = TEMA[tema]
    L, C, H = lch(c)
    if C < 0.004:          # saf beyaz/siyah/gri: dokunma
        return None
    sicak = 25 <= H <= 115
    if not sicak and C >= 0.03:   # yeşil/kırmızı/mavi durum renkleri: dokunma
        return None
    if C >= 0.06 and sicak:       # vurgu (altın, pirinç, bakır)
        return yaz(L, C * p['ac'], H + p['ak'], c[3])
    C2 = min(max(C, 0.008) * p['cs'], p['cmax'])
    if L > 0.9:
        C2 = min(C2, 0.022)
    return yaz(L, C2, p['hs'], c[3])


def norm(s):
    return re.sub(r'\s+', '', s.lower())


tum = ''.join(re.findall(r'<style[^>]*>(.*?)</style>', h, flags=re.S))
i0 = tum.index('V39.0 · Üyelik seçimi + Altın Öğrenme Alanı')
altin_css = re.sub(r'/\*.*?\*/', '', tum[tum.rfind('/*', 0, i0):], flags=re.S)

PRE = {'b': 'html[data-pt43][data-tema54a][data-tema54a]:not([data-tema54a="altin"])',
       'g': 'html[data-pt43="gunduz"][data-tema54a][data-tema54a]:not([data-tema54a="altin"])',
       'n': 'html[data-pt43="gece"][data-tema54a][data-tema54a]:not([data-tema54a="altin"])'}
KOK = {'b': '[data-tema54a][data-tema54a]:not([data-tema54a="altin"])'}
KOK['g'] = KOK['n'] = KOK['b']
DEGIS = {}      # (renk, tur, tür-kipi) -> indeks
SIRA = []


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
        on = 'html[data-pt43]' if kip == 'b' else ''
        return mm.group(1) + mm.group(2) + (on if not re.search(r'data-pt43', mm.group(2)) else '') + KOK[kip] + sel[mm.end():] + sahte
    return f'{PRE[kip]} :is({sel}){sahte}'


def degisken(c, tur, kip):
    k = (norm(c), tur, kip)
    if k not in DEGIS:
        DEGIS[k] = len(SIRA)
        SIRA.append(k)
    return f'var(--c55-{DEGIS[k]})'


kurallar_cikti = {'b': [], 'n': [], 'g': []}
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
        bild, bild_var = [], []
        for k, v in bildirimler(govde):
            ozel = k.startswith('--')
            if not ozel and k not in TUR:
                continue
            if 'url(' in v:
                continue
            tur = 'ozel' if ozel else TUR[k]
            imp = '!important' in v
            vv = v.replace('!important', '').strip()
            if not RENK.search(vv):
                continue
            deg = [False]
            kk = 'n' if (ozel and kip == 'b') else kip     # temel kuraldaki değişken tanımı yalnız gecede (gündüzü V43 tanımlar)

            def f(m, tur=tur, kk=kk):
                c = parse(m.group(0))
                if not c:
                    return m.group(0)
                deg[0] = True
                return degisken(m.group(0), tur, kk)
            y = RENK.sub(f, vv)
            if deg[0]:
                (bild_var if kk != kip else bild).append(f'{k}:{y}{"!important" if imp else ""}')
        for kp, bb in ((kip, bild), ('n', bild_var)):
            if not bb:
                continue
            yeni = [x for x in (ek_on(s, kp) for s in ss) if x]
            if not yeni:
                continue
            kural = ','.join(yeni) + '{' + ';'.join(bb) + '}'
            say += len(bb)
            kurallar_cikti[kp].append(f'{ctx}{{{kural}}}' if ctx else kural)

# değişken tabloları
tablo = []
ORNEK = {}
for tema in TEMA:
    for mod in ('gece', 'gunduz'):
        satir = []
        for i, (c, tur, kip) in enumerate(SIRA):
            if mod == 'gece' and kip == 'g':
                continue
            if mod == 'gunduz' and kip == 'n':
                continue
            rgb = parse(c)
            if not rgb:
                continue
            kaynak = rgb
            if mod == 'gunduz' and kip == 'b' and tur in ('yazi', 'zemin', 'cizgi'):
                v = donustur(rgb, tur)
                if v:
                    kaynak = parse(v)
            y = T(kaynak, tema)
            if y is None:
                y = c if kaynak is rgb else (f'rgba({int(kaynak[0])},{int(kaynak[1])},{int(kaynak[2])},{kaynak[3]:g})' if kaynak[3] < 1 else '#%02x%02x%02x' % tuple(int(round(x)) for x in kaynak[:3]))
            satir.append(f'--c55-{i}:{y}')
        tablo.append(f'html[data-pt43="{mod}"][data-tema54a="{tema}"]{{{";".join(satir)}}}')
    # örnek renkler (tema seçim ekranındaki kutucuklar): zemin + vurgu
    ORNEK[tema] = {'gece': [T(parse('#130E0A'), tema), T(parse('#1E1710'), tema), T(parse('#E2B765'), tema)],
                   'gunduz': [T(parse('#F2EADB'), tema), T(parse('#FFFBF3'), tema), T(parse('#7A5012'), tema)]}
ORNEK['altin'] = {'gece': ['#130E0A', '#1E1710', '#E2B765'], 'gunduz': ['#F2EADB', '#FFFBF3', '#7A5012']}

tema_css = ('/* ===== V55.0 üretilmiş: Altın temaları (tools/v55/build550.py). Altın Mihrap = V43 paleti; diğer temalar renk değişkenleriyle. ===== */\n'
            + '\n'.join(tablo) + '\n' + '\n'.join(kurallar_cikti['b']) + '\n' + '\n'.join(kurallar_cikti['n']) + '\n' + '\n'.join(kurallar_cikti['g']) + '\n')
open(os.path.join(HERE, 'tema_uretilen.css'), 'w', encoding='utf-8').write(tema_css)
LOG.append(f'tema: {len(SIRA)} renk değişkeni, {say} bildirim, {len(tema_css.encode())} bayt')

# ---------------------------------------------------------------- yerleştirme
JS = ['v550_duzen.js', 'v550_altin.js', 'v550_oyun.js']
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in JS)
js = js.replace('/*{{TEMA55_ORNEK}}*/null', json.dumps(ORNEK, ensure_ascii=False))
assert '{{TEMA55_ORNEK}}' not in js
assert '</script' not in js.lower() and '</style' not in tema_css.lower()
a = h.index('</style></head><body>')
h = h[:a] + tema_css + h[a:]
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v550 js eklendi (%d bayt)' % len(js.encode()))
S1 = seeds(h)
assert S1 == SEED0, 'veri/müzik/görsel blokları değişti!'
os.makedirs(os.path.dirname(OKU), exist_ok=True)
open(OKU, 'w', encoding='utf-8').write(h)
okunur = len(h.encode('utf-8'))
assert '030792' not in h, 'açık metin PIN HTML içinde!'
assert not re.search(r'[A-Za-z0-9._%+-]+@gmail\.com', h), 'gmail adresi HTML içinde!'
p = paket513.paketle(h)
assert paket513.ac(p) == h, 'paket açılınca okunur sürümle aynı değil!'
open(OUT, 'w', encoding='utf-8').write(p)
open(IDX, 'w', encoding='utf-8').write(p)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print('V54.0:', os.path.getsize(SRC), 'bayt  | V55.0 okunur:', okunur, 'bayt  | V55.0 paketli:', len(p.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri, müzik ve görsel blokları aynı (açılınca):', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
