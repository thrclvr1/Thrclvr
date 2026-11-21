"""denetim.js yardımcısı: ekran görüntüsü + yazı kutuları → kontrast oranları (WCAG 2.x göreli parlaklık)."""
import json, sys
from PIL import Image

im = Image.open(sys.argv[1]).convert('RGB'); W, H = im.size; px = im.load()
E = json.load(open(sys.argv[2])); out = []


def rgb(s):
    sr = s.startswith('color(')
    v = [float(x) for x in s[s.index('(') + 1:s.index(')')].replace('srgb', '').replace('/', ' ').replace(',', ' ').split() if x.strip()]
    if sr:
        v = [x * 255 for x in v[:3]] + v[3:]
    return v + [1.0] * (4 - len(v))


def L(c):
    r = []
    for x in c[:3]:
        x /= 255
        r.append(x / 12.92 if x <= .03928 else ((x + .055) / 1.055) ** 2.4)
    return .2126 * r[0] + .7152 * r[1] + .0722 * r[2]


for e in E:
    x0, y0, x1, y1 = [int(round(v)) for v in e['kutu']]
    if x1 - x0 < 2 or y1 - y0 < 2:
        continue
    P = [px[x, y] for y in range(y0, min(H, y1), max(1, (y1 - y0) // 8)) for x in range(x0, min(W, x1), max(1, (x1 - x0) // 12))]
    if not P:
        continue
    P.sort(key=lambda c: sum(c)); bg = P[len(P) // 2]
    c = rgb(e['renk']); a = c[3] * e['op']
    fg = [c[k] * a + bg[k] * (1 - a) for k in range(3)]
    l1, l2 = L(fg), L(bg); oran = (max(l1, l2) + .05) / (min(l1, l2) + .05)
    buyuk = e['fs'] >= 24 or (e['fs'] >= 18.66 and e['fw'] >= 700)
    out.append(dict(e, bg=bg, fg=[round(v) for v in fg], oran=round(oran, 2), esik=3.0 if buyuk else 4.5))
print(json.dumps(out))
