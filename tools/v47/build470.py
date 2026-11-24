"""V47.0'ı V46.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v47/build470.py
Girdi : surumler/din-kulturu-platformu-v46.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v47.0.html  ve  index.html (aynı içerik)

1. Ad değişikliği (yalnızca arayüz kodunda; içerik verisinde değil): Klasik → Elmas Öğrenme Alanı, Premium / Öğrenme Dünyası → Altın Öğrenme Alanı.
   Kayıt anahtarları ve iç değerler ('normal' / 'premium', dk-deneyim39, V39.on …) aynen kalır.
2. Ders Atmosferi kataloğu: V33'te listeden çıkarılan sentez seslerin (ney, kanun, koro, ezgi …) katalog kayıtları, üretici
   fonksiyonları, yalnız onların kullandığı yardımcılar ve onlara bağlı eski hazır karışımlar koddan silinir.
3. Eklenen kod: v470_ses.js, v470_tasarim.js, v470_ayar.js, v470.css.
Veri ve müzik blokları bayt bayt korunur.
"""
import hashlib, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v46.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v47.0.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v47.0' not in f]
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


def kodda(fn):
    """fn yalnızca veri/müzik blokları DIŞINDAKİ metne uygulanır."""
    global h
    parcalar, son = [], 0
    for m in re.finditer(SEED_RE, h, flags=re.S):
        parcalar.append(fn(h[son:m.start()])); parcalar.append(m.group(0)); son = m.end()
    parcalar.append(fn(h[son:]))
    h = ''.join(parcalar)


SEED0 = seeds(h)
rep('V31.VER="V46.0"', 'V31.VER="V47.0"', cnt=h.count('V31.VER="V46.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V46.0">', '<meta name="app-version" content="V47.0">', what='sürüm metaverisi')

# ---------- 1. açılış seçim ekranı: iki öğrenme deneyimi (üyelik/ödeme dili yok) ----------
ELMAS_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l-2 6 5 12 5-12-2-6"/></svg>'
ALTIN_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>'
rep("<span class=\"o42-etk\">${V42.svg('book', 14)} Klasik</span>", f'<span class="o42-etk">{ELMAS_SVG} Elmas</span>', what='seçim: Elmas etiketi')
rep('<h2 id="o42-kn-h">Klasik Öğrenme Alanı</h2><p>Sade ve hızlı: sınıflar, konular, kartlar, testler ve oyunlar aynı ekranda.</p>\n    <ul class="o42-oz"><li>Tüm sınıflar tek listede</li><li>Hafif; eski cihazlarda da akıcı</li></ul>',
    '<h2 id="o42-kn-h">Elmas Öğrenme Alanı</h2><p>Sade, ferah ve hızlı: sınıflar, konular, kartlar ve testler düzenli ve anlaşılır ekranlarda.</p>\n    <ul class="o42-oz"><li>Az hareket, hızlı açılış</li><li>Her araca tek dokunuşla ulaşım</li></ul>', what='seçim: Elmas kartı')
rep('<span>Klasik alana gir</span>', '<span>Elmas Öğrenme Alanı’na gir</span>', what='seçim: Elmas düğmesi')
rep("<span class=\"o42-etk p\">${V42.svg('star', 14)} Premium</span>", f'<span class="o42-etk p">{ALTIN_SVG} Altın</span>', what='seçim: Altın etiketi')
rep('<h2 id="o42-kp-h">Premium Öğrenme Dünyası</h2><p>Okul koridorunda yürü, sınıfının kapısını aç; dersler, sınıf merkezi ve Oyun Dünyası seni bekliyor.</p>\n    <ul class="o42-oz"><li>3B okul koridoru ve sınıf merkezleri</li><li>Oyun Dünyası, favoriler, ilerleme</li></ul>',
    '<h2 id="o42-kp-h">Altın Öğrenme Alanı</h2><p>Atmosferik ve keşif odaklı: 3B okul koridorunda yürü, sınıfının kapısını aç; dersler ve Oyun Dünyası seni bekliyor.</p>\n    <ul class="o42-oz"><li>3B koridor ve derinlikli sınıf merkezleri</li><li>Özenle hazırlanmış geçişler ve animasyonlar</li></ul>', what='seçim: Altın kartı')
rep('<p class="o42-acik">İki alan da aynı ders içeriklerini ve aynı ilerleme kaydını kullanır.</p>', '<p class="o42-acik">İki ayrı öğrenme deneyimi: içerikler ve ilerleme kaydı aynıdır, yalnızca görünüm ve gezinme farklıdır.</p>', what='seçim: açıklama')
rep('<p class="uye39-not">${esc(u.aciklama || \'\')}</p>', '', what='seçim: üyelik notu kaldırıldı')

# ---------- 2. ad değişikliği (arayüz kodu; uzun ifadeler önce) ----------
ADLAR = [
    ('Bu sürümde Öğrenme Dünyası bir arayüz prototipidir; ödeme ya da gerçek üyelik doğrulaması yoktur. Erişim bu cihazda serbesttir.', 'Altın Öğrenme Alanı herkese açıktır; hesap gerekmez.'),
    ('${V39.Uyelik.premium().kaynak==="prototip"?" Üyelik bu sürümde prototiptir (gerçek ödeme / doğrulama yok).":""}', ''),
    ('<b>Üyelik:</b>', '<b>Erişim:</b>'), ('Üyelik bilgisi bulunmuyor.', 'Erişim bilgisi bulunmuyor.'),
    ("Premium Öğrenme Dünyası’na geç — deneyimi değiştir", "Altın Öğrenme Alanı’na geç — deneyimi değiştir"),
    ("Klasik alana geç — deneyimi değiştir", "Elmas Öğrenme Alanı’na geç — deneyimi değiştir"),
    ("Premium Öğrenme Dünyası’na geç", "Altın Öğrenme Alanı’na geç"),
    ("Klasik Öğrenme Alanı’na geç", "Elmas Öğrenme Alanı’na geç"),
    ("Premium Öğrenme Dünyası", "Altın Öğrenme Alanı"),
    ("Öğrenme Dünyası (Premium)", "Altın Öğrenme Alanı"),
    ("Klasik Öğrenme Alanı (Normal)", "Elmas Öğrenme Alanı"),
    ("Din Kültürü – Öğrenme Dünyası", "Altın Öğrenme Alanı"),
    ("Klasik Öğrenme Alanı", "Elmas Öğrenme Alanı"),
    ("Klasik alan ve Öğrenme Dünyası aynı ilerleme kaydını kullanır.", "Elmas ve Altın öğrenme alanları aynı ilerleme kaydını kullanır."),
    ("Öğrenme Dünyası'na gir", "Altın Öğrenme Alanı’na gir"),
    ("Öğrenme Dünyası'na erişim yok.", "Altın Öğrenme Alanı’na erişim yok."),
    ("Öğrenme Dünyası'nda ara", "Altın Öğrenme Alanı’nda ara"),
    ("Öğrenme Dünyası", "Altın Öğrenme Alanı"),
    ("Klasik alana gir", "Elmas Öğrenme Alanı’na gir"),
    ("Deneyimi değiştir (Klasik alana geç)", "Deneyimi değiştir (Elmas Öğrenme Alanı’na geç)"),
    ("Deneyimi değiştir (Klasik alan)", "Deneyimi değiştir (Elmas Öğrenme Alanı)"),
    ("Oyunlar Klasik alandaki oyun sistemiyle oynanır", "Oyunlar Elmas Öğrenme Alanı’ndaki oyun sistemiyle oynanır"),
    ("İçerik Klasik alanla aynı kayıtlardan gelir", "İçerik Elmas Öğrenme Alanı ile aynı kayıtlardan gelir"),
    ("Klasik alanın teması ayrıdır.", "Elmas Öğrenme Alanı’nın teması ayrıdır."),
    ("<span>Klasik</span>", "<span>Elmas</span>"),
    ("${p ? 'Klasik' : 'Premium'}", "${p ? 'Elmas' : 'Altın'}"),
    ("${pr ? 'Premium' : 'Klasik'}", "${pr ? 'Altın' : 'Elmas'}"),
    ("Normal Üyelik", "Elmas Öğrenme Alanı"), ("Premium Üyelik", "Altın Öğrenme Alanı"),
    ('<p class="p39-ey">Premium</p>', '<p class="p39-ey">Altın Öğrenme Alanı</p>'),
    ("<b>Premium görünüm</b>", "<b>Altın alan görünümü</b>"), ('aria-label="Premium görünüm"', 'aria-label="Altın alan görünümü"'),
    ("Klasik oyunlara git", "Etkinlik oyunlarına git"), ("Klasik oyunlar", "Etkinlik oyunları"),
    ('split(" · Klasik")', 'split(" · Etkinlik")'), (" · Klasik oyun: ", " · Etkinlik kaydı: "), ("Klasik oyun: ", "Etkinlik kaydı: "),
    ("Premium deneyimde açılır", "Altın Öğrenme Alanı’nda açılır"), ("Premium tema: ", "Altın alan teması: "),
    ("her ekranda <b>Klasik</b> / <b>Premium</b> düğmesi var", "her ekranda <b>Elmas</b> / <b>Altın</b> düğmesi var"),
]
SAY = {}
def adlar(s):
    for a, b in ADLAR:
        n = s.count(a)
        if n: SAY[a] = SAY.get(a, 0) + n; s = s.replace(a, b)
    return s
kodda(adlar)
LOG.append('ad değişikliği: %d ifade, %d yer' % (len(SAY), sum(SAY.values())))
for a, b in ADLAR[:6]:
    pass

# ---------- 3. Ders Atmosferi: kaldırılmış sentez seslerinin kalıntıları ----------
SIL = ['calm', 'ney', 'kanun', 'ezgi', 'koro', 'isik', 'ambient', 'derin']
# 3a. özgün katalog kayıtları
i = h.index('ATM.S=[\n {id:"calm"'); j = h.index('];', i)
seg = h[i:j]
eski = re.findall(r'\{id:"(' + '|'.join(SIL) + r')",cat:"[^"]+",n:"([^"]+)"', seg)
LOG.append('silinen katalog kayıtları: ' + ', '.join(f'{a} ({b})' for a, b in eski))
assert len(eski) == len(SIL), eski
seg2 = re.sub(r'\{id:"(?:' + '|'.join(SIL) + r')",cat:"[^"]+",[^}]*\},?\s*', '', seg)
h = h[:i] + seg2 + h[j:]
rep('ATM.CAT=[{id:"dini",n:"Dinî enstrümantal fonlar",d:"Sözsüz, sakin; ney ve kanun tınılı sentezlenmiş fonlar"},{id:"doga",n:"Doğa ve ortam sesleri",d:"Yağmur, orman, su, rüzgâr"},{id:"odak",n:"Odaklanma sesleri",d:"Gürültü ve sade drone zeminleri"}];',
    'ATM.CAT=[{id:"doga",n:"Doğa sesleri",d:"Yağmur, orman, su, rüzgâr"},{id:"odak",n:"Odak sesleri",d:"Gürültü"}];', what='özgün kategoriler')
rep('ATM.PRE=[{id:"p1",n:"Huzurlu Ders",L:[["ney",.7],["yagmur",.28]]},{id:"p2",n:"Yağmurlu Akşam",L:[["yagmur",.6],["somine",.32],["ruzgar",.14]]},{id:"p3",n:"Derin Odak",L:[["brown",.5],["derin",.4]]},',
    'ATM.PRE=[{id:"p1",n:"Huzurlu Ders",L:[["yagmur",.4],["kus",.2]]},{id:"p2",n:"Yağmurlu Akşam",L:[["yagmur",.6],["somine",.32],["ruzgar",.14]]},{id:"p3",n:"Derin Odak",L:[["brown",.5],["yagmur",.22]]},', what='özgün hazır karışımlar (ney/drone bağları)')
rep('<p class="small mut"><b>Önemli:</b> “ney”, “kanun” ve “koro” adlı fonlar gerçek enstrüman veya insan sesi kaydı değildir; bu tınıları taklit eden sentezlerdir ve gerçek bir ney/kanun kaydının sıcaklığına sahip değildir.</p>', '', what='eski bilgi metni (ney/kanun/koro)')
# 3b. üretici fonksiyonlar ve yalnız onların kullandığı yardımcılar
gi = h.index('function ATM_GEN(){'); gj = h.index('return G}', gi)
gen = h[gi:gj]
a0 = gen.index('G.focusDeep='); gen = gen[:a0]
SILG = re.findall(r'G\.(focusDeep|ambient|calm|ney|kanunNey|doguEzgi|koro|bells)=', h[gi:gj])
LOG.append('silinen üreticiler: ' + ', '.join(SILG))
def fn_sil(g, ad):
    m = re.search(r'(?m)^function ' + ad + r'\(', g)
    if not m: return g, False
    s = m.start(); e = re.search(r'(?m)^(function |const |let |var |/\*)', g[s + 10:]); e = s + 10 + e.start()
    rest = g[:s] + g[e:]
    if re.search(r'\b' + ad + r'\(', rest): return g, False
    return rest, True
silinen = []
for _ in range(3):
    for ad in ['reverb', 'ks', 'neyNote', 'padVoice', 'pluckPad', 'melody', 'chirp', 'biq', 'rmsOf']:
        gen, ok = fn_sil(gen, ad)
        if ok: silinen.append(ad)
def sabit_sil(g, ad):
    m = re.search(r'(?m)^const ' + ad + r'\s*=', g)
    if not m: return g, False
    s = m.start(); e = re.search(r'(?m)^(function |const |let |var |/\*)', g[s + 6:]); e = s + 6 + e.start()
    rest = g[:s] + g[e:]
    if re.search(r'\b' + ad + r'\b', rest): return g, False
    return rest, True
for ad in ['USSAK', 'HICAZ', 'RAST', 'NIHAVENT']:
    gen, ok = sabit_sil(gen, ad)
    if ok: silinen.append(ad)
assert 'const N_=' in gen and 'const A=' in gen
LOG.append('silinen yardımcılar: ' + ', '.join(silinen))
h = h[:gi] + gen + h[gj:]
# 3c. V33 kategori adları ve boş “enstrüman” bölümünün metni
rep('ATM.CAT=[{id:"doga",n:"Doğa sesleri",d:"Yağmur, kuşlar, orman, akarsu, rüzgâr ve diğer doğa sesleri (uygulama içinde üretilir)"},{id:"enstruman",n:"Gerçek enstrümantal kayıtlar",d:"Ney, kanun, ud… Lisanslı kayıt dosyaları eklendiğinde burada görünür"},{id:"diger",n:"Diğer sesler",d:"Odak için kahverengi ve beyaz gürültü"}];',
    'ATM.CAT=[{id:"doga",n:"Doğa sesleri",d:"Yağmur, su, rüzgâr, orman ve gece sesleri; uygulama içinde üretilir"},{id:"enstruman",n:"Lisanslı enstrüman kayıtları",d:"Yalnızca dosyası ve lisans bilgisi doğrulanmış kayıtlar"},{id:"diger",n:"Odak sesleri",d:"Kahverengi ve beyaz gürültü"}];', what='ses kategorileri (V33)')
rep("ATM.CAT.unshift({id: 'muzik42', n: 'Kayıtlı müzikler', d: 'Uygulamanın içinde, internetsiz çalar. Aynı anda bir müzik çalar; doğa sesleriyle karıştırabilirsin.'});",
    "ATM.CAT.unshift({id: 'muzik42', n: 'Müzikler', d: 'Uygulamaya eklenmiş kayıtlı müzikler; internetsiz çalar. Aynı anda bir müzik çalar, doğa sesleriyle karıştırılabilir.'});", what='müzik kategorisi')

css = open(os.path.join(HERE, 'v470.css'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in ['v470_ses.js', 'v470_tasarim.js', 'v470_ayar.js'] if os.path.exists(os.path.join(HERE, f)))
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v470.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v470 js eklendi (%d bayt)' % len(js.encode()))

assert seeds(h) == SEED0, 'veri/müzik blokları değişti!'
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('ad değişiklikleri:'); [print('  %3d  %s' % (n, a[:80])) for a, n in SAY.items()]
print('veri ve müzik blokları aynı:', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
