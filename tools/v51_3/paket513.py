"""V51.3 kayıpsız veri paketleme (HTML boyutu).

Büyük JSON veri bloklarını (seed-curriculum, seed-rel, seed-hide, seed-km, seed-yp) ham DEFLATE + base64 olarak
saklar. Sayfa açılırken ana betikten ÖNCE çalışan küçük bir açıcı (pako 1.0.11 inflate, MIT/Zlib lisanslı, dosyaya
gömülü; internet gerekmez) her bloğu açar ve <script id="seed-..."> öğesinin textContent'ini özgün JSON metnine
bayt bayt geri koyar. Uygulama kodu veriyi eskisi gibi textContent'ten okur; hiçbir veri değişmez.

  paketle(h)  -> paketlenmiş HTML      ac(h) -> okunur HTML (paket öncesiyle bayt bayt aynı)

Sonraki sürümün derleme betiği V51.3 dosyasını önce ac() ile açmalı, yamaları okunur metne uygulamalı, sonra
paketle() ile yazmalıdır (tools/v51_3/build513.py örneği).
"""
import base64, hashlib, os, re, zlib

HERE = os.path.dirname(os.path.abspath(__file__))
PAKO = '/opt/node-tools/node_modules/pako/dist/pako_inflate.min.js'
PAKO_YEREL = os.path.join(HERE, 'pako_inflate_1.0.11.min.js')
BLOKLAR = ['seed-hide', 'seed-rel', 'seed-km', 'seed-yp', 'seed-curriculum']
ACICI_BAS = '<script id="z513-acici">'
ACICI_SON = '/* z513 son */</script>'


def _pako():
    if os.path.exists(PAKO_YEREL):
        return open(PAKO_YEREL, encoding='utf-8').read()
    s = open(PAKO, encoding='utf-8').read()
    open(PAKO_YEREL, 'w', encoding='utf-8').write(s)
    return s


def acici_js():
    p = _pako().strip()
    assert '</script' not in p.lower()
    return (ACICI_BAS + '/* V51.3 veri açıcı: pako 1.0.11 inflate (MIT AND Zlib, (C) 2014-2017 Vitaly Puzrin, Andrei Tuputcyn; '
            'zlib (C) 1995-2013 Jean-loup Gailly, Mark Adler) */\n' + p + '\n'
            '(function(){var Z=window.Z513={ok:true,bloklar:0,ms:0,hata:null},t0=Date.now();'
            'try{var L=document.querySelectorAll("script[data-z513]");'
            'for(var i=0;i<L.length;i++){var e=L[i],b=atob(e.textContent),u=new Uint8Array(b.length);'
            'for(var j=0;j<b.length;j++)u[j]=b.charCodeAt(j);var o=pako.inflateRaw(u),s;'
            'if(typeof TextDecoder!=="undefined")s=new TextDecoder("utf-8").decode(o);else s=pako.inflateRaw(u,{to:"string"});'
            'e.textContent=s;e.removeAttribute("data-z513");Z.bloklar++}}'
            'catch(x){Z.ok=false;Z.hata=String(x&&x.message||x);console.error("[V51.3] veri açılamadı",x)}'
            'Z.ms=Date.now()-t0})();' + ACICI_SON)


def _deflate(b):
    c = zlib.compressobj(9, zlib.DEFLATED, -15, 9)
    return c.compress(b) + c.flush()


def paketle(h):
    assert 'data-z513' not in h and ACICI_BAS not in h, 'zaten paketli'
    for k in BLOKLAR:
        a = f'<script type="application/json" id="{k}">'
        assert h.count(a) == 1, k
        i = h.index(a) + len(a); j = h.index('</script>', i)
        ham = h[i:j].encode('utf-8')
        z = base64.b64encode(_deflate(ham)).decode('ascii')
        assert zlib.decompress(base64.b64decode(z), -15) == ham
        oz = hashlib.sha256(ham).hexdigest()[:16]
        h = h[:h.index(a)] + f'<script type="application/json" id="{k}" data-z513="deflate-raw;base64;sha256-16={oz}">' + z + h[j:]
    # açıcı: ana uygulama betiğinden hemen önce (seed bloklarının ardından)
    son = '<script type="application/json" id="seed-curriculum"'
    i = h.index(son); j = h.index('</script>', i) + len('</script>')
    return h[:j] + '\n' + acici_js() + h[j:]


def ac(h):
    if ACICI_BAS not in h:
        return h
    i = h.index(ACICI_BAS); j = h.index(ACICI_SON, i) + len(ACICI_SON)
    assert h[i - 1] == '\n'
    h = h[:i - 1] + h[j:]
    def geri(m):
        ham = zlib.decompress(base64.b64decode(m.group(3)), -15)
        assert hashlib.sha256(ham).hexdigest()[:16] == m.group(2), m.group(1)
        return f'<script type="application/json" id="{m.group(1)}">' + ham.decode('utf-8') + '</script>'
    h = re.sub(r'<script type="application/json" id="([^"]+)" data-z513="deflate-raw;base64;sha256-16=([0-9a-f]+)">([^<]*)</script>', geri, h)
    assert 'data-z513' not in h
    return h
