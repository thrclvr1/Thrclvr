"""V51.0'ı V50.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v51/build510.py
Girdi : surumler/din-kulturu-platformu-v50.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v51.0.html  ve  index.html (aynı içerik)

Eklenenler (hepsi ana betiğin sonunda, V31 son işaretinden önce):
  v510_mod.js      — rotalar modu değiştirmez (Sınıf sınıf ilerleme / Favorilerim Elmas'ta Elmas), Altın para amblemi
  v510_yp.js       — yıllık plan yükleme (editör), Excel okuyucu, sınıf/program bazında otomatik haftalık dağılım
  v510_ogretmen.js — öğretmen paneli sadeleştirme (Haftalık, Sınıflarım, Araçlar = Sorun Bildir, editör onayı Ana Panel)
  v510_yayin.js    — öğrenme alanında editoryal/teknik bilgiyi gizleme, yayın durumu modeli, doğrudan erişim denetimi
  v510.css
Var olan veri, müzik ve görsel blokları bayt bayt korunur.
"""
import hashlib, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v50.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v51.0.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v51.0' not in f]
md = lambda f: hashlib.md5(open(f, 'rb').read()).hexdigest()
keep = {f: md(f) for f in OLD}
h = open(SRC, encoding='utf-8').read()
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
rep('V31.VER="V50.0"', 'V31.VER="V51.0"', cnt=h.count('V31.VER="V50.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V50.0">', '<meta name="app-version" content="V51.0">', what='sürüm metaverisi')

# Öğretmen paneli (yalnız arayüz; kayıtlar ve işlevler aynen):
rep('if(!w.querySelector(".v38-qa")){', 'if(!(window.V51&&V51.sade)&&!w.querySelector(".v38-qa")){', what='Haftalık: tekrarlanan hızlı kartlar (V38) kapalı')
rep('${svg("not")}Bu hafta ile ilgili kişisel notlarını ekleyebilirsin.</h3>', '${svg("not")}Haftalık notlarım</h3>', what='Haftalık: not başlığı')
rep('<label class="ogw-stl">Durum ${W.st(st)}</label>', '', what='kazanım kartı: durum menüsü kaldırıldı (durum kaydı korunur)')
rep(' <em class="ogw-chip c-${OGRT.st(o.id)}" data-ch="${o.id}">${OGRT.ST[OGRT.st(o.id)]}</em>', '', what='kazanım kartı başlığı: durum etiketi kaldırıldı')
rep('Henüz hiçbir haftaya atanmadı"} · ${OGRT.ST[OGRT.st(o.id)]}</small>', 'Henüz hiçbir haftaya atanmadı"}</small>', what='kazanım listesi: durum metni kaldırıldı')
rep('Kaynak: ${esc(p?p.file:"yıllık plan")}', 'Kaynak: yıllık plan', what='Ünite kartı: dosya adı yerine “yıllık plan”')
rep("['Bildirim türü', tur === 'soru' ? 'Soru' : 'İçerik']", "['Bildirim türü', tur === 'soru' ? 'Soru' : tur === 'genel' ? 'Sorun bildirimi (öğretmen)' : 'İçerik']", what='bildirim özeti: genel tür')
rep("[['', 'Tümü'], ['icerik', 'İçerik'], ['soru', 'Soru']]", "[['', 'Tümü'], ['icerik', 'İçerik'], ['soru', 'Soru'], ['genel', 'Öğretmen sorunları']]", what='editör bildirim merkezi: genel süzgeci')

JS = ['v510_mod.js', 'v510_yp.js', 'v510_ogretmen.js', 'v510_yayin.js']
css = open(os.path.join(HERE, 'v510.css'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in JS if os.path.exists(os.path.join(HERE, f)))
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v510.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v510 js eklendi (%d bayt): %s' % (len(js.encode()), ', '.join(f for f in JS if os.path.exists(os.path.join(HERE, f)))))

S1 = seeds(h)
assert S1 == SEED0, 'veri/müzik/görsel blokları değişti!'
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri, müzik ve görsel blokları aynı:', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
