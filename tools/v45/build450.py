"""V45.0'ı V44.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v45/build450.py
Girdi : surumler/din-kulturu-platformu-v44.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v45.0.html  ve  index.html (aynı içerik)

Eklenenler: v450_kd.js (kaynak doğrulama sınıflandırması), v450_dunya.js (sınıfa özel hibrit oyun dünyaları),
v450_calis.js (öğrenme ve tekrar merkezi), v450.js (bağlantılar), v450.css.
Eski kodda yalnızca şu küçük yamalar yapılır (her biri tam olarak bir kez bulunmalı):
  - vis(): önizleme kapalıyken A/B (kaynakla doğrulanmış / türetilmiş) içerik de yayına uygun sayılır (status değişmez)
  - dvb()/dvq(): editör etiketi yalnız C (gerçekten kontrol gerektiren) paragraf ve sorularda, nedeniyle
  - V44 oyunları: C sınıfı etkinlik kullanılmaz; bölüm girişindeki not gerçek durumu yazar; V44 görevleri dışa açılır (V44.Gorev)
Veri ve müzik blokları bayt bayt korunur.
"""
import hashlib, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v44.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v45.0.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v45.0' not in f]
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
rep('V31.VER="V44.0"', 'V31.VER="V45.0"', cnt=h.count('V31.VER="V44.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V44.0">', '<meta name="app-version" content="V45.0">', what='sürüm metaverisi')
# --- kaynak doğrulama yamaları ---
rep('const vis=r=>S.prev?r.status!=="archived":r.status==="published";',
    'const vis=r=>S.prev?r.status!=="archived":(r.status==="published"||(typeof V45!=="undefined"&&!!V45.yayinaUygun&&V45.yayinaUygun(r)));', what='vis(): A/B içerik yayına uygun')
rep('const dvb=(t,sec,i)=>{const s=t.dogrulama',
    'const dvb=(t,sec,i)=>{try{if(typeof V45!=="undefined"&&V45.KD){const k=V45.KD.blok(t,sec,i);return k.kat==="C"?`<p class="dvb dv-${k.alt==="kaynak-eksik"?"kaynak-yetersiz":"editor-onayi-bekliyor"}">${k.alt==="kaynak-eksik"?"Kaynak yetersiz: bu paragraf ders kitabının ilgili sayfalarında yeterince bulunamadı.":"Editör kontrolü gerekli: "+V45.KD.NEDEN[k.alt]+"."}</p>`:""}}catch(e){}const s=t.dogrulama', what='dvb(): yalnız C paragrafta etiket')
rep('const dvq=q=>q.dogrulama?',
    'const dvq=q=>(typeof V45!=="undefined"&&V45.KD)?V45.KD.soruNotu(q):q.dogrulama?', what='dvq(): soru notu')
rep('const okKayit = (g) => !!(g && g.dogrulama && vis(g));',
    'const okKayit = (g) => !!(g && g.dogrulama && vis(g) && !(typeof V45 !== "undefined" && V45.KD && V45.KD.editorGerekli("games", g)));', what='oyunlar: C etkinlik kullanılmaz')
rep('<small>Otomatik kaynak kontrolünden geçti · insan editör onayı bekliyor (önizleme).</small>',
    '<small>${esc(typeof V45 !== "undefined" && V45.KD ? V45.KD.oyunNotu(B) : "")}</small>', what='oyun bölüm notu')
rep('V44.oyunZaman = iskelet(ZAMAN);', 'V44.Gorev = G; V44.iskelet = iskelet; V44.oyunZaman = iskelet(ZAMAN);', what='V44 görevleri dışa açık')

# --- öğrenciye görünen “editör onayı bekliyor” yazıları gerçek duruma bağlanır ---
rep('${g.status!=="published"?`<p class="mut small">Taslak etkinlik: içerik editör onayı bekliyor.</p>`:""}',
    '${(typeof V45!=="undefined"&&V45.KD?V45.KD.editorGerekli("games",g):g.status!=="published")?`<p class="mut small">Editör kontrolü gerekli: bu etkinlik kaynakla tam doğrulanamadı.</p>`:""}', what='Klasik oyun: taslak notu yalnız C')
rep('Bu konunun kaynak kontrolünden geçmiş verilerinden üretilen oyunlar. Oyunlar editör onayı bekliyor.',
    'Bu konunun kaynak kontrolünden geçmiş verilerinden üretilen oyunlar. Editör kontrolü gereken etkinlik varsa kartında yazar.', what='konu oyun sekmesi notu')
rep("etiket: t.status === 'published' ? 'Yayında' : 'Taslak · editör onayı bekliyor'}",
    "etiket: t.status === 'published' ? 'Yayında' : (typeof V45 !== 'undefined' && V45.KD ? ({A: 'Kaynakla doğrulandı', B: 'Kaynaktan türetildi'})[(V45.KD.konu(t) || {}).kat] || 'Bazı bölümleri editör kontrolü bekliyor' : 'Taslak · editör onayı bekliyor')}", what='içerik durumu etiketi')
rep('Kaynak: uygulamanın soru bankası. Sorular editör onayı bekliyor olabilir.',
    'Kaynak: uygulamanın soru bankası (ders kitabından türetilmiş sorular). Bazı sorular editör kontrolü gerektirebilir.', what='öğretmen dışa aktarım notu')

# --- öğrenci ekranında “Taslak” durum çipi: yayına uygun (A/B) kayıtta gösterilmez (status alanı değişmez; editör alanı aynen gösterir) ---
rep('const pill=r=>`<span class="tag ${r.status==="published"?"":"w"}">${TR[r.status]}</span>`;',
    'const pill=r=>(view!=="admin"&&r.status!=="published"&&typeof V45!=="undefined"&&V45.yayinaUygun&&V45.yayinaUygun(r))?"":`<span class="tag ${r.status==="published"?"":"w"}">${TR[r.status]}</span>`;', what='Klasik durum çipi')
rep('<span>${esc((typeof TR!=="undefined"&&TR[t.status])||t.status)}</span>${t.dogrulama',
    '${(t.status!=="published"&&typeof V45!=="undefined"&&V45.yayinaUygun&&V45.yayinaUygun(t))?"":`<span>${esc((typeof TR!=="undefined"&&TR[t.status])||t.status)}</span>`}${t.dogrulama', what='Premium durum çipi')

css = open(os.path.join(HERE, 'v450.css'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in ['v450_kd.js', 'v450_dunya.js', 'v450_calis.js', 'v450.js'] if os.path.exists(os.path.join(HERE, f)))
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v450.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v450 js eklendi (%d bayt)' % len(js.encode()))

assert seeds(h) == SEED0, 'veri/müzik blokları değişti!'
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri ve müzik blokları aynı:', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
