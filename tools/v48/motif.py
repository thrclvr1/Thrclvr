"""V48 motif ailesi: geleneksel İslam sanatından esinlenen, 8 kat simetrili desenler (6 kat simetri YOK).
- yildiz8: sekiz köşeli Selçuklu yıldızı (16 köşeli çokgen)
- girih: yıldız-ve-haç (Selçuklu) döşemesi: merkezde 8 köşeli yıldız, köşelerde çeyrek yıldızlar, aralarda haç biçimleri
- gecme: iki şeridin birbirine geçtiği bordür, kesişimlerde küçük sekizgen rozetler
Bu dosya derleme sırasında CSS'teki {{...}} yer tutucularını doldurur (data URI). Çıktı yalnızca SVG metnidir.
"""
import math, urllib.parse


def yildiz8(cx, cy, R, r=None, rot=-90):
    r = r if r is not None else R * 0.62
    p = []
    for i in range(16):
        a = math.radians(rot + i * 22.5)
        q = R if i % 2 == 0 else r
        p.append(f'{cx + q * math.cos(a):.2f},{cy + q * math.sin(a):.2f}')
    return ' '.join(p)


def sekizgen(cx, cy, R, rot=-90 + 22.5):
    return ' '.join(f'{cx + R * math.cos(math.radians(rot + i * 45)):.2f},{cy + R * math.sin(math.radians(rot + i * 45)):.2f}' for i in range(8))


def girih(s, renk, op, w=1.0):
    """s: karo boyu. Merkez yıldız + köşe yıldızları + haçlar. Bütün öğeler 4/8 kat simetrik."""
    h = s / 2
    R, r = s * 0.30, s * 0.30 * 0.62
    parcalar = []
    for (cx, cy) in [(h, h), (0, 0), (s, 0), (0, s), (s, s)]:
        parcalar.append(f'<polygon points="{yildiz8(cx, cy, R, r)}"/>')
        parcalar.append(f'<polygon points="{sekizgen(cx, cy, R * 1.18)}" opacity=".55"/>')
    # haç biçimleri: kenar ortalarında, yıldız uçlarını birleştiren çizgiler
    for (cx, cy) in [(h, 0), (0, h), (s, h), (h, s)]:
        k = s * 0.11
        parcalar.append(f'<path d="M{cx - k:.2f} {cy:.2f}h{2 * k:.2f}M{cx:.2f} {cy - k:.2f}v{2 * k:.2f}"/>')
    # yıldız uçlarından komşu yıldızlara giden ince geçme çizgileri (çapraz yönler)
    d = R * 0.98
    for sx, sy in [(1, 1), (-1, 1), (1, -1), (-1, -1)]:
        parcalar.append(f'<path d="M{h + sx * d * 0.7071:.2f} {h + sy * d * 0.7071:.2f}L{h + sx * (h - d * 0.7071):.2f} {h + sy * (h - d * 0.7071):.2f}"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{s}" height="{s}" viewBox="0 0 {s} {s}">'
            f'<g fill="none" stroke="{renk}" stroke-opacity="{op}" stroke-width="{w}" stroke-linejoin="round">{"".join(parcalar)}</g></svg>')


def gecme(w, hgt, renk, op, renk2=None):
    """Yatay geçme bordürü: iki şerit sinüs biçiminde birbirine geçer; kesişimlerde sekizgen rozet."""
    renk2 = renk2 or renk
    m = hgt / 2; a = hgt * 0.32; n = 2
    def serit(faz):
        d = f'M0 {m + faz * a:.2f}'
        for i in range(n):
            x0 = i * w / n
            d += f' C{x0 + w / n * 0.25:.2f} {m + faz * a:.2f} {x0 + w / n * 0.25:.2f} {m - faz * a:.2f} {x0 + w / n * 0.5:.2f} {m - faz * a:.2f}'
            d += f' S{x0 + w / n * 0.75:.2f} {m + faz * a:.2f} {x0 + w / n:.2f} {m + faz * a:.2f}'
        return d
    roz = ''.join(f'<polygon points="{yildiz8(x, m, hgt * 0.18)}" fill="{renk2}" fill-opacity="{op}"/>' for x in [w / (2 * n) * (2 * i + 1) for i in range(n)])
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{hgt}" viewBox="0 0 {w} {hgt}">'
            f'<g fill="none" stroke="{renk}" stroke-opacity="{op}" stroke-width="1.2"><path d="{serit(1)}"/><path d="{serit(-1)}"/>'
            f'<path d="M0 1.2H{w}M0 {hgt - 1.2}H{w}" stroke-opacity="{float(op) * 0.8:.3f}"/></g>{roz}</svg>')


def uri(svg):
    svg = svg.replace('"', "'")
    return 'url("data:image/svg+xml,' + urllib.parse.quote(svg, safe=" =:/,.'-") + '")'


DESEN = {
    # Elmas: platin / gümüş (açık tema) ve kristal (koyu tema)
    'GIRIH_ELMAS_ACIK': uri(girih(120, '#6f7f96', '.10')),
    'GIRIH_ELMAS_KOYU': uri(girih(120, '#cfdbea', '.055')),
    'GECME_ELMAS': uri(gecme(160, 18, '#8a9ab0', '.35', '#b8c6d8')),
    # Altın: zümrüt zemin üzerinde metalik altın / bronz
    'GIRIH_ALTIN_GECE': uri(girih(120, '#d8ac55', '.075')),
    'GIRIH_ALTIN_GUNDUZ': uri(girih(120, '#8c6a2c', '.085')),
    'GIRIH_ACILIS': uri(girih(96, '#d9b56c', '.09')),
    'GECME_ALTIN': uri(gecme(160, 18, '#c9973f', '.55', '#e7c47a')),
}


def doldur(css):
    for k, v in DESEN.items():
        css = css.replace('{{' + k + '}}', v)
    assert '{{' not in css, 'doldurulmamış yer tutucu'
    return css
