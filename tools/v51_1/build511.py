"""V51.1'i V51.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v51_1/build511.py
Girdi : surumler/din-kulturu-platformu-v51.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v51.1.html  ve  index.html (aynı içerik)

Eklenenler (ana betiğin sonunda, V31 son işaretinden önce):
  v511_toplu.js — Editör Onay Alanı toplu işlemleri (seçim, onay, ret, düzeltme, kaynak, yayımla, yayından kaldır,
                  onayı geri çek, kuyruktan kaldır/geri al, toplu işlem geçmişi ve geri alma)
  v511_duzen.js — bildirim gönderme düzeltmeleri, öğretmen panelinden editör bölümünün kaldırılması, ayrı editör girişi
  v511.css
Derleme yaması: haftalık kazanım kartındaki “Ders hazırla” düğmesi kaldırılır (ders planları ve kayıtları korunur).
Var olan veri, müzik ve görsel blokları bayt bayt korunur.
"""
import hashlib, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v51.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v51.1.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v51.1' not in f]
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
rep('V31.VER="V51.0"', 'V31.VER="V51.1"', cnt=h.count('V31.VER="V51.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V51.0">', '<meta name="app-version" content="V51.1">', what='sürüm metaverisi')
rep("""<button class="ogw-b" onclick="OGRT.W.prep('${o.id}',${w.n})">Ders hazırla</button>""", '', what='haftalık kazanım kartı: “Ders hazırla” düğmesi kaldırıldı (OGRT.W.prep ve ders planları duruyor)')

rep('sub.textContent="Müfredat, plan ve içerik yönetimi"', 'sub.textContent="Haftalık plan ve sınıf takibi"', what='öğretmen paneli alt başlığı (yönetim çağrışımı kaldırıldı)')
rep("""onclick="V38.EP.pv.msg='';go('ogretmen')">Öğretmen paneline dön</button>""", """onclick="V38.EP.pv.msg='';go('home')">Editör girişinden çık</button>""", what='editör PIN ekranı: öğretmen paneline bağlantı yerine çıkış')
rep('UI.toast("Editör oturumu kapatıldı.");go("ogretmen")', 'UI.toast("Editör oturumu kapatıldı.");go("home")', what='editör oturumu kapatınca öğretmen paneli yerine ana sayfa')
JS = ['v511_toplu.js', 'v511_duzen.js']
css = open(os.path.join(HERE, 'v511.css'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in JS)
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v511.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v511 js eklendi (%d bayt): %s' % (len(js.encode()), ', '.join(JS)))

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
