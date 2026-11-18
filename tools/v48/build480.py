"""V48.0'ı V47.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v48/build480.py
Girdi : surumler/din-kulturu-platformu-v47.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v48.0.html  ve  index.html (aynı içerik)

1. Motifler: altı kat simetrili çizimler (kavram haritası altıgenleri, 6 köşeli yıldız seçeneği, 60°/120° dönen elipsler,
   seçim ekranı görselindeki üst üste iki üçgen) 8 / 4 kat simetrili karşılıklarla değiştirilir; arka planlara 8 köşeli
   Selçuklu yıldızlı girih ve geçme bordürü eklenir (motif.py ile üretilen SVG, v480.css yer tutucuları).
2. Seçim ekranı ve ayar önizlemeleri: yeni Elmas (kristal, platin) ve Altın (zümrüt, metalik altın) görselleri ve amblemleri.
3. Ders Atmosferi: 9 doğa sesinin katalog kayıtları, simgeleri, üreticileri, yalnız onların kullandığı yardımcılar ve onlara
   bağlı hazır karışımlar silinir; açıklama metinleri güncellenir. Kahverengi/beyaz gürültü ve müzikler kalır.
4. Eklenen kod: v480_gorsel.js, v480_ses.js, v480_calis.js, v480_bildirim.js, v480.css.
Veri ve müzik blokları bayt bayt korunur.
"""
import hashlib, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import motif  # noqa: E402

SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v47.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v48.0.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v48.0' not in f]
md = lambda f: hashlib.md5(open(f, 'rb').read()).hexdigest()
keep = {f: md(f) for f in OLD}
h = open(SRC, encoding='utf-8').read()
LOG = []
SEED_RE = r'<script type="(?:application/json|text/plain)" id="[^"]+">.*?</script>'


def rep(a, b, cnt=1, what=''):
    global h
    n = h.count(a)
    assert n == cnt, (what, n, a[:140])
    h = h.replace(a, b)
    LOG.append(f'{what}: {n} yer')


def seeds(s):
    return {m.group(1): hashlib.sha256(m.group(2).encode()).hexdigest()
            for m in re.finditer(r'<script type="(?:application/json|text/plain)" id="([^"]+)">(.*?)</script>', s, flags=re.S)}


def kod(s):
    return re.sub(SEED_RE, '', s, flags=re.S)


SEED0 = seeds(h)
rep('V31.VER="V47.0"', 'V31.VER="V48.0"', cnt=h.count('V31.VER="V47.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V47.0">', '<meta name="app-version" content="V48.0">', what='sürüm metaverisi')

# ---------- 1. altı kat simetrili çizimler ----------
rep('const n=[6,8,10,12][H%4]', 'const n=[8,8,12,16][H%4]', what='kavram motifi: 6 köşeli yıldız seçeneği → 8/12/16')
rep('<polygon points="${[0,1,2,3,4,5].map(i=>{const a=Math.PI/3*i+Math.PI/6;return (x+Math.cos(a)*12).toFixed(1)+","+(y+Math.sin(a)*12).toFixed(1)}).join(" ")}"',
    '<polygon points="${[0,1,2,3,4,5,6,7].map(i=>{const a=Math.PI/4*i+Math.PI/8;return (x+Math.cos(a)*12).toFixed(1)+","+(y+Math.sin(a)*12).toFixed(1)}).join(" ")}"', what='kavram motifi (toplum): altıgen → sekizgen')
rep('transform="rotate(60 50 50)" opacity=".7"', 'transform="rotate(45 50 50)" opacity=".7"', what='kavram motifi (evren): 60° → 45°')
rep('transform="rotate(120 50 50)" opacity=".45"', 'transform="rotate(135 50 50)" opacity=".45"', what='kavram motifi (evren): 120° → 135°')
rep('<path d="M126 146l34 30 34-30" fill="none" stroke="#8a6a35" stroke-width="5" stroke-linecap="round"/>', '', what='eski Elmas görseli: üst üste iki üçgen (rahle) kaldırıldı')

# ---------- 2. seçim ekranı, amblemler, ayar önizlemeleri ----------
rep('<div class="o42-gor">${V42.kitaplik()}</div>', '<div class="o42-gor">${window.V48&&V48.Gorsel?V48.Gorsel.elmas(\'ge48s\'):V42.kitaplik()}</div>', what='seçim: Elmas görseli')
rep('<div class="o42-gor o42-kemer"><img src="${V42.KP || \'\'}" alt="" decoding="async" width="640" height="374"><i class="o42-isik" aria-hidden="true"></i></div>',
    '<div class="o42-gor o42-kemer">${window.V48&&V48.Gorsel?V48.Gorsel.altin(\'ga48s\'):\'\'}<i class="o42-isik" aria-hidden="true"></i></div>', what='seçim: Altın görseli')
GUNES = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg> Altın</span>'
rep(GUNES, '${window.V48&&V48.Gorsel?V48.Gorsel.altinAmblem(20,\'am48s\').replace(\'<svg\',\'<svg class="am48"\'):\'\'} Altın</span>', what='seçim: güneş simgesi → altın madalyon')
ELMAS_ETK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l-2 6 5 12 5-12-2-6"/></svg> Elmas</span>'
rep(ELMAS_ETK, '${window.V48&&V48.Gorsel?V48.Gorsel.elmasAmblem(20,\'em48s\').replace(\'<svg\',\'<svg class="am48"\'):\'\'} Elmas</span>', what='seçim: Elmas kristal amblemi')
rep('${V42.motif}<p class="o42-acik">', '${V42.motif}<i class="gc48" aria-hidden="true"></i><p class="o42-acik">', what='seçim: geçme bordürü')
rep('<span class="a47-on">${ON[k]}</span>', '<span class="a47-on">${window.V48&&V48.Gorsel?V48.Gorsel.kucuk(k):ON[k]}</span>', what='ayar: alan önizlemeleri')

# ---------- 3. Ders Atmosferi: doğa sesleri ----------
DOGA = ['yagmur', 'cam', 'orman', 'dere', 'deniz', 'ruzgar', 'somine', 'gece', 'kus']
GEN = ['rainLight', 'rainGlass', 'forest', 'stream', 'sea', 'wind', 'fire', 'night', 'birds']
# 3a. özgün katalog
i = h.index('ATM.S=[\n {id:"yagmur"'); j = h.index('];', i)
seg = h[i:j]
eski = re.findall(r'\{id:"(' + '|'.join(DOGA) + r')",cat:"doga",n:"([^"]+)"', seg)
assert len(eski) == 9, eski
LOG.append('silinen katalog kayıtları: ' + ', '.join(f'{a} ({b})' for a, b in eski))
seg2 = re.sub(r'\s*\{id:"(?:' + '|'.join(DOGA) + r')",cat:"doga",[^}]*\},', '', seg)
assert 'cat:"doga"' not in seg2 and '"brown"' in seg2 and '"white"' in seg2
h = h[:i] + seg2 + h[j:]
# 3b. simgeler
for k in DOGA:
    m = re.search(r'\n ' + k + r":'[^']*',", h)
    assert m, k
    h = h[:m.start()] + h[m.end():]
LOG.append('silinen simgeler: ' + ', '.join(DOGA))
# 3c. kategoriler ve hazır karışımlar (özgün + V33)
rep('ATM.CAT=[{id:"doga",n:"Doğa sesleri",d:"Yağmur, orman, su, rüzgâr"},{id:"odak",n:"Odak sesleri",d:"Gürültü"}];',
    'ATM.CAT=[{id:"odak",n:"Odak sesleri",d:"Gürültü"}];', what='özgün kategoriler')
rep('ATM.CAT=[{id:"doga",n:"Doğa sesleri",d:"Yağmur, su, rüzgâr, orman ve gece sesleri; uygulama içinde üretilir"},{id:"enstruman",n:"Lisanslı enstrüman kayıtları",d:"Yalnızca dosyası ve lisans bilgisi doğrulanmış kayıtlar"},{id:"diger",n:"Odak sesleri",d:"Kahverengi ve beyaz gürültü"}];',
    'ATM.CAT=[{id:"enstruman",n:"Lisanslı enstrüman kayıtları",d:"Yalnızca dosyası ve lisans bilgisi doğrulanmış kayıtlar"},{id:"diger",n:"Odak sesleri",d:"Kahverengi ve beyaz gürültü; uygulama içinde üretilir"}];', what='ses kategorileri (V33)')
PRE0 = 'ATM.PRE=[{id:"p1",n:"Huzurlu Ders",L:[["yagmur",.4],["kus",.2]]},{id:"p2",n:"Yağmurlu Akşam",L:[["yagmur",.6],["somine",.32],["ruzgar",.14]]},{id:"p3",n:"Derin Odak",L:[["brown",.5],["yagmur",.22]]},{id:"p4",n:"Doğa Molası",L:[["orman",.55],["dere",.45],["kus",.2]]}];'
PRE1 = 'ATM.PRE=[{id:"p3",n:"Derin Odak",L:[["brown",.5]]},{id:"p5",n:"Sade Odak",L:[["white",.35]]},{id:"p6",n:"Yumuşak Odak",L:[["brown",.42],["white",.12]]}];'
rep(PRE0, PRE1, cnt=2, what='hazır karışımlar (doğa sesli 3 karışım silindi; Derin Odak yalnız kahverengi gürültü)')
rep('V33.keep=["yagmur","cam","orman","dere","deniz","ruzgar","somine","gece","kus","brown","white"];', 'V33.keep=["brown","white"];', what='V33 izinli ses listesi')
rep('ic:cat==="enstruman"?"ney":"orman"', 'ic:cat==="enstruman"?"ney":"wave"', what='harici kayıt simgesi')
# 3d. üreticiler ve yalnız onların kullandığı yardımcılar
gi = h.index('function ATM_GEN(){'); gj = h.index('return G}', gi)
gen = h[gi:gj]
a0 = gen.index('G.rainLight='); gen = gen[:a0]
assert all(('G.' + g + '=') not in gen for g in GEN)
LOG.append('silinen üreticiler: ' + ', '.join(GEN))


def fn_sil(g, ad):
    m = re.search(r'(?m)^function ' + ad + r'\(', g)
    if not m: return g, False
    s = m.start(); e = re.search(r'(?m)^(function |const |let |var |/\*|G\.)', g[s + 10:]); e = s + 10 + e.start()
    rest = g[:s] + g[e:]
    if re.search(r'\b' + ad + r'\b', rest): return g, False
    return rest, True


silinen = []
for _ in range(4):
    for ad in re.findall(r'(?m)^function (\w+)\(', gen):
        if ad in ('ATM_GEN',): continue
        gen, ok = fn_sil(gen, ad)
        if ok: silinen.append(ad)
assert 'const N_=' in gen and 'const A=' in gen and 'function brownN' in gen and 'function whiteN' in gen and 'function filt' in gen and 'function finish' in gen and 'function loopify' in gen
LOG.append('silinen yardımcılar: ' + ', '.join(silinen))
h = h[:gi] + gen + h[gj:]
# 3e. açıklama metinleri
METIN = [
    ('<small>Çalışma sesleri: fon müziği, doğa sesleri, karışım</small>', '<small>Çalışma sesleri: odak sesleri, müzikler, karışım</small>', 1),
    ("d: 'Uygulamaya eklenmiş kayıtlı müzikler; internetsiz çalar. Aynı anda bir müzik çalar, doğa sesleriyle karıştırılabilir.'", "d: 'Uygulamaya eklenmiş kayıtlı müzikler; internetsiz çalar. Aynı anda bir müzik çalar, odak sesleriyle karıştırılabilir.'", 1),
    ("h = h.replace('Doğa ve gürültü sesleri cihazında üretilir; internet gerekmez.', 'Doğa ve gürültü sesleri cihazında üretilir; kayıtlı müzikler uygulama dosyasının içindedir. İkisi de internet gerektirmez.');",
     "h = h.replace('Odak sesleri cihazında üretilir; internet gerekmez.', 'Odak sesleri cihazında üretilir; kayıtlı müzikler uygulama dosyasının içindedir. İkisi de internet gerektirmez.');", 1),
    ('Doğa ve gürültü sesleri cihazında üretilir; internet gerekmez.', 'Odak sesleri cihazında üretilir; internet gerekmez.', 1),
    ('<b>Doğa ve gürültü sesleri özgün sentezdir</b>', '<b>Odak sesleri (kahverengi ve beyaz gürültü) özgün sentezdir</b>', 1),
    ('<small>Çalışırken doğa sesleri, odak sesleri ve müzikler.</small>', '<small>Çalışırken odak sesleri ve müzikler.</small>', 1),
    ('Sesler varsayılan olarak kapalıdır; sen başlatırsın. Doğa ve odak sesleri cihazında üretilir, internet gerekmez.', 'Sesler varsayılan olarak kapalıdır; sen başlatırsın. Odak sesleri cihazında üretilir, internet gerekmez.', 1),
]
for a, b, n in METIN:
    rep(a, b, cnt=n, what='metin: ' + a[:50])
# ayar › Ses ve müzik: yeni ses paneli
rep("  B.ses = () => {\n", "  B.ses = () => {\n    if (window.V48 && V48.SesPanel) return V48.SesPanel.tam();\n", what='ayar: Ses ve müzik → V48 ses paneli')
k = kod(h)
for ad in ['Hafif yağmur', 'Cam üzerine yağmur', 'Orman ve kuşlar', 'Dere ve akan su', 'Deniz ve dalga', 'Hafif rüzgâr', 'Şömine ve çıtırtı', 'Gece doğası', 'Hafif kuş cıvıltıları', 'Doğa sesleri', 'doğa sesleri', 'rainLight', 'Doğa Molası', 'Yağmurlu Akşam', 'Huzurlu Ders']:
    assert ad not in k, ('kalıntı', ad)
LOG.append('kalıntı taraması: doğa sesi adları kodda yok')

# ---------- 4. eklenen kod ----------
css = motif.doldur(open(os.path.join(HERE, 'v480.css'), encoding='utf-8').read())
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in ['v480_ses.js', 'v480_calis.js', 'v480_bildirim.js'])
gjs = open(os.path.join(HERE, 'v480_gorsel.js'), encoding='utf-8').read()
assert '</script' not in (js + gjs).lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + '</style></head><body><script>' + gjs + '</script>' + h[a + len('</style></head><body>'):]
LOG.append('v480_gorsel.js <body> başında (seçim ekranından önce yüklenir)')
LOG.append('v480.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v480 js eklendi (%d bayt)' % len(js.encode()))

assert seeds(h) == SEED0, 'veri/müzik blokları değişti!'
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri ve müzik blokları aynı:', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
