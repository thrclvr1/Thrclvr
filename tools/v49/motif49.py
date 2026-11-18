"""V49 motif sistemi: sekiz kollu çiçek rozetleri (İslam sanatındaki geometrik çiçek / rumi esintili yaprak düzeni).
- Her rozet üç yaprak katmanından oluşur (dış sivri yapraklar, 22,5° kaydırılmış orta yapraklar, iç tomurcuk).
- Her yaprak iki yarımdır: ışık alan yarım açık, gölgedeki yarım koyu ton → hafif kabartma / işlenmiş metal ya da sır
  seramik hissi. İnce kontur parlak kenar gibi çalışır.
- Döşeme: karonun ortasında büyük rozet, köşelerde (dört karonun birleştiği yerde tamamlanan) küçük rozet; aralarında
  hiçbir birleştirici çizgi yok → artı / haç biçimi ya da altı köşeli yıldız oluşmaz.
- Bordür: küçük rozetler ve aralarında yatay badem (yaprak) biçimleri.
Derleme sırasında CSS'teki {{...}} yer tutucularını data URI olarak doldurur."""
import math, urllib.parse


def f(n):
    return f'{n:.1f}'.rstrip('0').rstrip('.')


def yaprak(r0, R, w):
    """Dolgun gövdeli, sivri uçlu (lale/nilüfer) yaprağın iki yarımı."""
    L = R - r0
    a = f'M{f(r0)} 0C{f(r0 + L * .05)} {f(-w * .9)} {f(r0 + L * .55)} {f(-w * 1.05)} {f(R)} 0Z'
    b = f'M{f(r0)} 0C{f(r0 + L * .05)} {f(w * .9)} {f(r0 + L * .55)} {f(w * 1.05)} {f(R)} 0Z'
    return a, b


def dis(r0, R, w):
    """Yaprağın kapalı dış konturu."""
    L = R - r0
    return f'M{f(r0)} 0C{f(r0 + L * .05)} {f(-w * .9)} {f(r0 + L * .55)} {f(-w * 1.05)} {f(R)} 0C{f(r0 + L * .55)} {f(w * 1.05)} {f(r0 + L * .05)} {f(w * .9)} {f(r0)} 0Z'


def ic(r0, R, w):
    """Yaprağın içindeki ikinci kontur (7. referanstaki çift çizgi)."""
    L = R - r0
    r0, R, w = r0 + L * .22, R - L * .14, w * .55
    L = R - r0
    return f'M{f(r0)} 0C{f(r0 + L * .05)} {f(-w * .9)} {f(r0 + L * .55)} {f(-w * 1.05)} {f(R)} 0C{f(r0 + L * .55)} {f(w * 1.05)} {f(r0 + L * .05)} {f(w * .9)} {f(r0)} 0Z'


def tanim(acik, koyu, kontur, R=50):
    """Bir kez tanımlanan rozet (#r) ve iki katmanlı küçük rozet (#k); yarıçap 50 birim, use ile ölçeklenir."""
    katlar = [(R * .22, R, R * .19, 0), (R * .16, R * .72, R * .16, 22.5), (R * .08, R * .4, R * .1, 0)]
    d = []
    for n, (r0, r1, w, _) in enumerate(katlar):
        a, b = yaprak(r0, r1, w)
        d.append(f'<g id="y{n}"><path d="{a}" fill="{acik}"/><path d="{b}" fill="{koyu}"/><path d="{dis(r0, r1, w)}" fill="none" stroke="{kontur}" stroke-width="1.2"/>'
                 + (f'<path d="{ic(r0, r1, w)}" fill="none" stroke="{kontur}" stroke-width="1"/>' if n < 2 else '') + '</g>')
    def kat(n, dd):
        return ''.join(f'<use href="#y{n}" transform="rotate({f(dd + i * 45)})"/>' for i in range(8))
    merkez = f'<circle r="5" fill="{koyu}"/><circle r="2.5" fill="{acik}"/>'
    d.append(f'<g id="r">{kat(0, 0)}{kat(1, 22.5)}{kat(2, 0)}{merkez}</g>')
    d.append(f'<g id="k">{kat(0, 0)}{kat(1, 22.5)}{merkez}</g>')
    return '<defs>' + ''.join(d) + '</defs>'


def koy(ad, cx, cy, R):
    return f'<use href="#{ad}" transform="translate({f(cx)} {f(cy)}) scale({f(R / 50)})"/>'


def rozet(cx, cy, R, acik, koyu, kontur, kat=3):
    return tanim(acik, koyu, kontur) + koy('r' if kat == 3 else 'k', cx, cy, R)


def karo(S, acik, koyu, kontur, op):
    """S boyunda karo: ortada büyük rozet, dört köşede küçük rozet çeyrekleri (dört karo birleşince tamamlanır)."""
    h = S / 2
    parca = [koy('r', h, h, S * .23)] + [koy('k', cx, cy, S * .1) for cx, cy in [(0, 0), (S, 0), (0, S), (S, S)]]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}" viewBox="0 0 {S} {S}">{tanim(acik, koyu, kontur)}'
            f'<g opacity="{op}">{"".join(parca)}</g></svg>')


def bordur(W, H, acik, koyu, kontur, op):
    """Yatay bordür: iki küçük rozet ve aralarında yatay badem yapraklar."""
    m = H / 2
    p = [koy('k', x, m, H * .42) for x in (W * .25, W * .75)]
    for x in (0, W * .5, W):
        a, b = yaprak(-W * .14, W * .14, H * .22)
        p.append(f'<g transform="translate({f(x)} {f(m)})"><path d="{a}" fill="{acik}"/><path d="{b}" fill="{koyu}"/></g>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{tanim(acik, koyu, kontur)}'
            f'<g opacity="{op}">{"".join(p)}</g></svg>')


def uri(svg):
    svg = svg.replace('"', "'")
    return 'url("data:image/svg+xml,' + urllib.parse.quote(svg, safe=" =:/,.'-") + '")'


DESEN = {
    # Elmas: gümüş / platin / kristal
    'CICEK_ELMAS_ACIK': uri(karo(168, '#e9eef5', '#9fafc4', '#c3cfdd', '.32')),
    'CICEK_ELMAS_KOYU': uri(karo(168, '#9fb3cc', '#3e5170', '#7f95b3', '.2')),
    'BORDUR_ELMAS': uri(bordur(120, 22, '#eef3f9', '#9aabc2', '#b9c7d8', '.85')),
    # Altın: gece zümrüt/kahve zemin üzerinde altın, gündüz krem üzerinde bronz
    'CICEK_ALTIN_GECE': uri(karo(168, '#f1cf7f', '#8a5d1c', '#c9973f', '.16')),
    'CICEK_ALTIN_GUNDUZ': uri(karo(168, '#e2bf7a', '#9a6c2a', '#b98a45', '.2')),
    'CICEK_ACILIS': uri(karo(150, '#f1cf7f', '#7f561a', '#c9973f', '.17')),
    'BORDUR_ALTIN': uri(bordur(120, 22, '#f6dc9d', '#a8711b', '#d6a84a', '.9')),
}


def doldur(css):
    for k, v in DESEN.items():
        css = css.replace('{{' + k + '}}', v)
    assert '{{' not in css, 'doldurulmamış yer tutucu'
    return css
