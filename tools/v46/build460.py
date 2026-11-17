"""V46.0'ı V45.0'dan üretir.

Çalıştırma (depo kökünden):  python3 tools/v46/build460.py
Girdi : surumler/din-kulturu-platformu-v45.0.html  (değiştirilmez; md5 doğrulanır)
Çıktı : surumler/din-kulturu-platformu-v46.0.html  ve  index.html (aynı içerik)

Eklenenler: v460_kutuphane.js (Kütüphane 4–12), v460_sade.js (sadeleştirme, öğretmen girişi),
v460_hesap.js (Google girişi / misafir / bulut eşitleme istemcisi), v460.css.
Eski kodda yalnızca aşağıdaki küçük yamalar yapılır (her biri tam olarak sayılan kez bulunmalı).
Veri ve müzik blokları bayt bayt korunur.
"""
import hashlib, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v45.0.html')
OUT = os.path.join(ROOT, 'surumler', 'din-kulturu-platformu-v46.0.html')
IDX = os.path.join(ROOT, 'index.html')
OLD = [os.path.join(ROOT, 'surumler', f) for f in os.listdir(os.path.join(ROOT, 'surumler')) if f.endswith('.html') and 'v46.0' not in f]
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
rep('V31.VER="V45.0"', 'V31.VER="V46.0"', cnt=h.count('V31.VER="V45.0"'), what='sürüm etiketi')
rep('<meta name="app-version" content="V45.0">', '<meta name="app-version" content="V46.0">', what='sürüm metaverisi')

# ---------- Kütüphane: üç odalı tek bölümden bütün ünitelere ----------
rep('K.icerik=function(bid){if(K._ic&&K._ic[bid])return K._ic[bid];',
    'K.icerik=function(bid){if(K._ic&&K._ic[bid])return K._ic[bid];if(bid!==K.ESKI&&K.genel){const y=K.genel(bid);(K._ic=K._ic||{})[bid]=y;return y}', what='kütüphane: genel bölüm üreticisi')
rep('K.dokuHazirla=function(r,adlar,q){adlar.forEach(ad=>{if(r.T[ad])return;let tanim=DOKU[ad]||koridorDoku(ad);',
    'K.ARAC={ahsap,altin,isik,yuvarlak,kemer,yildizYol,kafesDesen,kitaplar,rafDolap,tasDoku};K.dokuHazirla=function(r,adlar,q){adlar.forEach(ad=>{if(r.T[ad])return;let tanim=DOKU[ad]||(K.DOKU_EK&&K.DOKU_EK[ad])||koridorDoku(ad);', what='kütüphane: ek dokular')
rep('[duv,zem,hal,tav]=ODA_DOKU[D.oda]', '[duv,zem,hal,tav]=oda().doku||ODA_DOKU[D.oda]', what='kütüphane: oda dokusu (sahne)')
rep('.concat(ODA_DOKU[D.oda],', '.concat(oda().doku||ODA_DOKU[D.oda],', what='kütüphane: oda dokusu (hazırlık)')
rep('son=D.oda===2;', 'son=D.oda===IC.odalar.length-1;', what='kütüphane: son oda')
rep('if(D.oda===0){const b=o.bulmaca,yer=', 'if(o.bulmaca.tur==="muhur"){const b=o.bulmaca,yer=', what='kütüphane: mühür yuvaları')
rep('if(D.oda===1&&!(D.cozum.raf&&D.cozum.raf.bitti))', 'if(o.bulmaca.tur==="raf"&&!(D.cozum.raf&&D.cozum.raf.bitti))', what='kütüphane: raf kilidi')
rep('<small>Oda ${D.oda+1} / 3</small>', '<small>Oda ${D.oda+1} / ${IC.odalar.length}</small>', what='kütüphane: oda sayacı')
rep('m=D.oda<2?"Kapı açıldı.', 'm=D.oda<IC.odalar.length-1?"Kapı açıldı.', what='kütüphane: görev metni')
rep('${D.oda<2?"Sonraki odaya geç"', '${D.oda<IC.odalar.length-1?"Sonraki odaya geç"', what='kütüphane: kapı paneli')
rep('if(D.oda<2){D.oda++;', 'if(D.oda<IC.odalar.length-1){D.oda++;', what='kütüphane: sonraki oda')
rep('<p>Bu kanatta üç oda var.', '<p>Bu kanatta ${["","bir","iki","üç","dört"][IC.odalar.length]||IC.odalar.length} oda var.', what='kütüphane: giriş oda sayısı')
rep('<p>Yüzyıllardır kapalı duran bilgelik kütüphanesinin kapısı aralandı.', '${IC.giris?`<p>${esc(IC.giris)}</p>`:""}<p ${IC.giris?"hidden":""}>Yüzyıllardır kapalı duran bilgelik kütüphanesinin kapısı aralandı.', what='kütüphane: giriş hikâyesi')
rep('<p>Kapıda dört yuva var. Her yuvada “düzenin işareti” yazıyor. Her mührü, gösterdiği alanın işaretine yerleştir. Sürükle ya da önce mühre, sonra yuvaya dokun.</p>',
    '<p>${b.aciklama?esc(b.aciklama):"Kapıda dört yuva var. Her yuvada “düzenin işareti” yazıyor. Her mührü, gösterdiği alanın işaretine yerleştir. Sürükle ya da önce mühre, sonra yuvaya dokun."}</p>', what='kütüphane: mühür açıklaması')
rep('geriBildirim(p,"yanlis",`Bu mühür bu yuvaya ait değil.`,`“${hedef.sag}” işareti ${hedef.sol} alanına aittir (gözlem: ${hedef.gozlem}). ${x.sol} alanında ise şunu gözlemleriz: ${x.gozlem}.`)',
    'geriBildirim(p,"yanlis",`Bu mühür bu yuvaya ait değil.`,b.genel?`“${hedef.sag}” yuvası ${hedef.sol} mührüne aittir.${x.gozlem?` ${x.sol}: ${x.gozlem}.`:""}`:`“${hedef.sag}” işareti ${hedef.sol} alanına aittir (gözlem: ${hedef.gozlem}). ${x.sol} alanında ise şunu gözlemleriz: ${x.gozlem}.`)', what='kütüphane: mühür geri bildirimi')
rep('if(c.ipucu===1)geriBildirim(p,"ipucu","İpucu 1",`Defterine bak: ${x.sol} alanında “${x.gozlem}” gözlenir. Bu gözlem hangi düzen işaretine uyar?`);',
    'if(c.ipucu===1)geriBildirim(p,"ipucu","İpucu 1",b.genel?(x.gozlem?`Defterine bak: ${x.sol} — ${b.ara?b.ara+": ":""}${x.gozlem}. Hangi yuvaya uyar?`:`“${x.sol}” mührü için Defter’indeki notları oku; yuvalardaki açıklamalardan biri onu anlatıyor.`):`Defterine bak: ${x.sol} alanında “${x.gozlem}” gözlenir. Bu gözlem hangi düzen işaretine uyar?`);', what='kütüphane: mühür ipucu')
rep('<p>Her kitabın sırtında bir anlam ya da durum yazıyor. Kitabı, ilgili ismin rafına yerleştir.</p>',
    '<p>${b.aciklama?esc(b.aciklama):"Her kitabın sırtında bir anlam ya da durum yazıyor. Kitabı, ilgili ismin rafına yerleştir."}</p>', what='kütüphane: raf açıklaması')
rep('geriBildirim(p,"yanlis",`Bu kitap ${r} rafına ait değil.`,`${r}: ${b.anlam[r]||"Kaynakta veri bulunmuyor."} Bu kitap ise ${k.raf} ismiyle ilgilidir: ${b.anlam[k.raf]||""}`)',
    'geriBildirim(p,"yanlis",`Bu kitap ${r} rafına ait değil.`,b.genel?`Kitabı yeniden oku ve raf başlıklarını Defter’indeki notlarla karşılaştır.`:`${r}: ${b.anlam[r]||"Kaynakta veri bulunmuyor."} Bu kitap ise ${k.raf} ismiyle ilgilidir: ${b.anlam[k.raf]||""}`)', what='kütüphane: raf geri bildirimi')
rep('if(c.ipucu===1)geriBildirim(p,"ipucu","İpucu 1",`“${k.metin}” — Defterindeki isim levhalarına bak: bu, ${b.raflar.map(r=>`${r} (${b.anlam[r]||"?"})`).join(", ")} isimlerinden hangisiyle ilgili?`);',
    'if(c.ipucu===1)geriBildirim(p,"ipucu","İpucu 1",b.genel?`“${k.metin}” — şu raflardan hangisine ait: ${b.raflar.join(", ")}? Defter’indeki notlar yardımcı olur.`:`“${k.metin}” — Defterindeki isim levhalarına bak: bu, ${b.raflar.map(r=>`${r} (${b.anlam[r]||"?"})`).join(", ")} isimlerinden hangisiyle ilgili?`);', what='kütüphane: raf ipucu 1')
rep('else geriBildirim(p,"ipucu","İpucu 3 · Kaynak tablo",b.tablo.rows.map(r=>`${r[0]}: ${r[1]} (${r[2]})`).join(" | "));',
    'else geriBildirim(p,"ipucu","İpucu 3 · Kaynak",b.genel?b.raflar.map(r=>`${r}: ${b.kitaplar.filter(x=>x.raf===r).map(x=>x.metin).join(" / ")}`).join(" | "):b.tablo.rows.map(r=>`${r[0]}: ${r[1]} (${r[2]})`).join(" | "));', what='kütüphane: raf ipucu 3')
rep('const n=Object.values(D.kesif).find(v=>v.o===oda().ad&&/evren|kâinat/i.test(v.m));geriBildirim(p,"ipucu","İpucu 1",n?`Defterindeki “${n.b}” notu: ${n.m}`:"Odadaki “Evren levhası”nı incele; cümlelerin cevabı orada.")',
    'const n=Object.values(D.kesif).find(v=>v.o===oda().ad&&(b.genel?String(v.m).toLocaleLowerCase("tr").includes(String(x.cevap).toLocaleLowerCase("tr")):/evren|kâinat/i.test(v.m)));geriBildirim(p,"ipucu","İpucu 1",n?`Defterindeki “${n.b}” notu: ${n.m}`:b.genel?"Odadaki notları incele; boşluğa gelecek kavram notlarda geçebilir.":"Odadaki “Evren levhası”nı incele; cümlelerin cevabı orada.")', what='kütüphane: yazıt ipucu')
rep('<p>Allah İnancı kanadının üç kilidini de çözdün.</p>', '<p>${esc(IC.sonMetin||"Allah İnancı kanadının üç kilidini de çözdün.")}</p>', what='kütüphane: son metin')
rep('aria-label="${y} / 9 yıldız">${[0,1,2].map(i=>', 'aria-label="${y} / ${IC.odalar.length*3} yıldız">${IC.odalar.map((_,i)=>', what='kütüphane: son ekran yıldızları')
rep('<dd>${y} / 9</dd>', '<dd>${y} / ${IC.odalar.length*3}</dd>', what='kütüphane: son ekran toplam')
rep('K.baslat=function(kok,bid,o){K.temizle();KOK=kok;S=bid;IC=K.icerik(bid);',
    'K.baslat=function(kok,bid,o){if(K.kur)K.kur();if(!bid||!K.BOL[bid]){K.temizle();if(K.secim)K.secim(kok);return}K.temizle();KOK=kok;S=bid;IC=K.icerik(bid);', what='kütüphane: bölüm seçimi')
# oyun kabı: yalnızca 3B oda sahnesi tam ekran sabit (sayfa gibi akan ekranlar kayar)
rep('K.odaAc=function(){const o=oda();', 'K.odaAc=function(){const o=oda();KOK.classList.add("o41-tam");', what='kütüphane: sahnede tam ekran')
rep('K.giris=function(){const B=K.BOL[S],u=Store.get("units",B.unite);', 'K.giris=function(){const B=K.BOL[S],u=Store.get("units",B.unite);KOK.classList.remove("o41-tam");', what='kütüphane: girişte akış')
rep('K.sonEkran=function(){K.sahneBirak();', 'K.sonEkran=function(){K.sahneBirak();if(KOK)KOK.classList.remove("o41-tam");', what='kütüphane: son ekranda akış')
# oyun merkezi kartı: kütüphane de bölüm seçimiyle
rep("if (O.id === 'kutuphane') { const b = hz[0];", "if (O.id === 'kutuphane' && false) { const b = hz[0];", what='oyun merkezi: kütüphane bölüm seçimi')

css = open(os.path.join(HERE, 'v460.css'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in ['v460_kutuphane.js', 'v460_sade.js', 'v460_hesap.js'] if os.path.exists(os.path.join(HERE, f)))
assert '</script' not in js.lower() and '</style' not in css.lower()
a = h.index('</style></head><body>')
h = h[:a] + css + h[a:]
LOG.append('v460.css eklendi (%d bayt)' % len(css.encode()))
k = h.index('/* ===== V31 son ===== */')
h = h[:k] + js + '\n' + h[k:]
LOG.append('v460 js eklendi (%d bayt)' % len(js.encode()))

assert seeds(h) == SEED0, 'veri/müzik blokları değişti!'
open(OUT, 'w', encoding='utf-8').write(h)
open(IDX, 'w', encoding='utf-8').write(h)
for f, v in keep.items():
    assert md(f) == v, ('eski sürüm dosyası değişti', f)
print(len(h.encode('utf-8')), 'bayt')
print('\n'.join(LOG))
print('veri ve müzik blokları aynı:', len(SEED0))
print('eski sürüm dosyaları değişmedi:', len(keep))
