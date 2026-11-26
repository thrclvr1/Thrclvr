"""V58.0'ı V57.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v58/build580.py
Girdi : surumler/din-kulturu-platformu-v57.0.html (değiştirilmez; md5 doğrulanır). paket513.ac() ile açılır, sonunda paketlenir.
        tools/v58/oyun58.json — mevcut oyunlar için kaynaktan türetilmiş yeni içerikler (üretici: tools/v58/oyun58.js).
Çıktı : surumler/din-kulturu-platformu-v58.0.html ve index.html; tools/v58/.okunur/v58.0-okunur.html (depoya eklenmez).

V58.0:
  • Tema: Öğretmen Modu gündüz/gece düzeltmesi (üst çubuk düğmesi artık Öğretmen Modu'nun ayarını değiştirir, Elmas'ınkini değil;
    Öğretmen Modu açıkken data-theme öğretmen ayarını izler); tema seçim ekranlarında “Önerilen” işaretleri.
  • Altın ana sayfa: Kavramlar + Kişiler ve Eserler → Bilgi Atlası; Bağlantılar kartı öne çıkarıldı (özellik aynı).
  • Bilgi Atlası (iki modda): arama bütün kategorilerde, sonuçlar kategorilere göre, kategori süzgeci.
  • Altın anlatım ekranı: krem kâğıt yalnız gündüzde (gece görünümünde beyaz blok kalmaz).
  • APK üst boşluğu: durum çubuğu boşluğu yalnız uygulamada (MainActivity kenar bilgisini tüketir; sayfa APK'da ikinci kez eklemez).
  • Oyunlar: yeni oyun türü yok; mevcut türlere (Eksik Kelime, Hata Avcısı, Çark Çevirme, Kelimeyi Anlat/Tabu, Eşleştirme,
    Zamanın İzinde olayları) kaynaktan türetilmiş yeni içerik — veri bloğu <script id="seed-oyun58">; mevcut veri blokları aynen.
"""
import hashlib, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'v51_3'))
import paket513  # noqa: E402

SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v57.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v58.0.html')
IDX = os.path.join(ROOT, 'index.html')
OKU = os.path.join(HERE, '.okunur', 'v58.0-okunur.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v58.0' not in f]
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
rep('V31.VER="V57.0"', 'V31.VER="V58.0"', cnt=h.count('V31.VER="V57.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V57.0">', '<meta name="app-version" content="V58.0">', what='sürüm metaverisi')

# ---------------------------------------------------------------- oyun içerikleri (yeni veri bloğu; eski bloklar aynen)
O = json.load(open(os.path.join(HERE, 'oyun58.json'), encoding='utf-8'))
ids = [g['id'] for g in O]
assert len(ids) == len(set(ids)) and all(i.startswith('GM58-') for i in ids), 'oyun kimlikleri'
oyun = json.dumps(O, ensure_ascii=False, separators=(',', ':'))
assert '</script' not in oyun.lower()
a = h.index('<script type="application/json" id="seed-curriculum">')
b = h.index('</script>', a) + len('</script>')
h = h[:b] + '<script type="application/json" id="seed-oyun58">' + oyun + '</script>' + h[b:]
LOG.append(f'seed-oyun58: {len(O)} oyun kaydı, {len(oyun.encode())} bayt')
rep('SEED["data/games.json"]=SEED["data/games.json"].concat(CUR.gamesV2||[]);',
    'SEED["data/games.json"]=SEED["data/games.json"].concat(CUR.gamesV2||[]).concat((function(){try{return JSON.parse(document.getElementById("seed-oyun58").textContent)}catch(e){console.warn("[V58] oyun içerikleri okunamadı",e);return[]}})());',
    what='V58 oyun içerikleri oyun koleksiyonuna eklenir')
# Zamanın İzinde: V58'in olay kayıtları (zaman58) bölüm olur, Bilgi Laboratuvarı'na gitmez
rep("const tarihMi = (g) => { const t = g.topicId", "const tarihMi = (g) => { if (g && g.zaman58) return true; const t = g.topicId", what='Zamanın İzinde: zaman58 olay kayıtları')

rep("B = {id: g.id, sinif: g.grade, program: g.programYear, ad: (t && t.title) || g.title.replace(/ · .*$/, ''),",
    "B = {id: g.id, sinif: g.grade, program: g.programYear, ad: g.zaman58Ad || (t && t.title) || g.title.replace(/ · .*$/, ''),", what='Zamanın İzinde: V58 bölüm adı')

# ---------------------------------------------------------------- yerleştirme
JS = ['v580_tema.js', 'v580_atlas.js', 'v580_duzen.js']
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in JS)
assert '</script' not in js.lower()
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v580 js eklendi (%d bayt)' % len(js.encode()))
yeni = seeds(h)
assert {k: v for k, v in yeni.items() if k != 'seed-oyun58'} == SEED0, 'veri/müzik/görsel blokları değişti!'
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
print('V57.0:', os.path.getsize(SRC), 'bayt  | V58.0 okunur:', len(h.encode()), 'bayt  | V58.0 paketli:', len(p.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri, müzik ve görsel blokları aynı (açılınca):', len(SEED0), '+ yeni seed-oyun58')
print('eski sürüm dosyaları değişmedi:', len(keep))
