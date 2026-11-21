"""Tanıtım videosu müziği ve ses efektleri — tamamen kodla sentezlenir (telifsiz; hiçbir örnek/kayıt kullanılmaz).

Kullanım (depo kökünden):  python3 tools/tanitim/muzik.py
Çıktı: tools/tanitim/.ses/muzik_16x9.wav (90 sn) ve muzik_9x16.wav (42 sn), 44,1 kHz stereo.
Yapı: 120 BPM (1 vuruş = 0,5 sn, 1 ölçü = 2 sn), Re minör; Dm – B♭ – F – C döngüsü.
Ses efektleri (whoosh, click, impact, ışık parıltısı) video sahne zamanlarıyla eş: KURGU sözlüğü.
"""
import numpy as np, wave, os, sys

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.ses')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(51)
BEAT = 0.5

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
CHORDS = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]  # Dm, B♭, F, C (MIDI)

def env_adsr(n, a, d, s, r, sr=SR):
    t = np.arange(n) / sr; L = n / sr; e = np.ones(n) * s
    e[t < a] = t[t < a] / max(a, 1e-4)
    m = (t >= a) & (t < a + d); e[m] = 1 - (1 - s) * (t[m] - a) / max(d, 1e-4)
    rs = L - r; m = t >= rs; e[m] = e[m] * np.clip((L - t[m]) / max(r, 1e-4), 0, 1)
    return e

def fft_filter(x, lo=None, hi=None, slope=2.0):
    n = len(x); N = 1 << int(np.ceil(np.log2(n + 1)))
    X = np.fft.rfft(x, N); f = np.fft.rfftfreq(N, 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** (2 * slope))
    if lo: g *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** (2 * slope))
    return np.fft.irfft(X * g, N)[:n]

def sweep_filter(x, f0, f1, bp=False, blk=2048):
    """zamanla değişen alçak/bant geçiren süzgeç (blok FFT, örtüşerek ekleme)"""
    hop = blk // 2; w = np.hanning(blk); y = np.zeros(len(x) + blk); n = len(x)
    f = np.fft.rfftfreq(blk, 1 / SR)
    for i in range(0, n, hop):
        seg = np.zeros(blk); s = x[i:i + blk]; seg[:len(s)] = s
        k = min(1.0, i / max(1, n - 1)); fc = f0 * (f1 / f0) ** k
        g = 1 / (1 + (f / fc) ** 4)
        if bp: g *= 1 / (1 + (fc * 0.35 / np.maximum(f, 1e-3)) ** 4)
        y[i:i + blk] += np.fft.irfft(np.fft.rfft(seg * w) * g, blk)
    return y[:n]

def osc(f, n, harm=8, pw=1.2, odd=False, phase=0.0):
    t = np.arange(n) / SR; y = np.zeros(n)
    for k in range(1, harm + 1):
        if odd and k % 2 == 0: continue
        if f * k > 15000: break
        y += np.sin(2 * np.pi * f * k * t + phase * k) / k ** pw
    return y

class Iz:
    def __init__(self, sure): self.n = int(sure * SR); self.L = np.zeros(self.n); self.R = np.zeros(self.n)
    def ekle(self, t, y, g=1.0, pan=0.0):
        i = int(t * SR)
        if i >= self.n or i + len(y) <= 0: return
        if i < 0: y = y[-i:]; i = 0
        y = y[:self.n - i]
        self.L[i:i + len(y)] += y * g * np.sqrt(0.5 * (1 - pan)) * 1.41
        self.R[i:i + len(y)] += y * g * np.sqrt(0.5 * (1 + pan)) * 1.41

def reverb(L, R, sure=2.2, wet=0.25, hi=6000):
    n = int(sure * SR); t = np.arange(n) / SR
    out = []
    for ch in (L, R):
        ir = rng.standard_normal(n) * np.exp(-t / (sure / 4.5)); ir = fft_filter(ir, hi=hi); ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
        N = 1 << int(np.ceil(np.log2(len(ch) + n)))
        y = np.fft.irfft(np.fft.rfft(ch, N) * np.fft.rfft(ir, N), N)[:len(ch)]
        out.append(ch * (1 - wet) + y * wet * 1.6)
    return out

# ---------------- enstrümanlar ----------------
def pad(iz, t0, t1, akor, parlak=1.0, g=0.12, oktav=0):
    n = int((t1 - t0 + 1.2) * SR); e = env_adsr(n, 0.9, 0.5, 0.85, 1.4)
    for m in [akor[0] - 12] + akor + [akor[0] + 12]:
        for dt, pan in ((-0.07, -0.6), (0.0, 0.0), (0.07, 0.6)):
            f = mtof(m + 12 * oktav + dt)
            y = osc(f, n, harm=int(6 + 6 * parlak), pw=1.25, phase=rng.uniform(0, 6.28)) * e
            iz.ekle(t0, y, g / 5, pan)

def pad_bolum(iz, t0, t1, parlak=1.0, g=0.12, oktav=0):
    t = t0
    while t < t1 - 1e-6:
        c = CHORDS[int(round(t / 2)) % 4]; pad(iz, t, min(t + 2, t1), c, parlak, g, oktav); t += 2

def sub(iz, t0, t1, g=0.25):
    n = int((t1 - t0) * SR); tt = np.arange(n) / SR; e = env_adsr(n, 1.5, 0.1, 1, 1.5)
    iz.ekle(t0, np.sin(2 * np.pi * mtof(38) * tt) * e, g)

def pluck(iz, t, m, g=0.10, pan=0.0, tau=0.16, odd=True):
    n = int(0.9 * SR); tt = np.arange(n) / SR
    y = osc(mtof(m), n, harm=9, pw=1.0, odd=odd) * np.exp(-tt / tau) * np.minimum(1, tt / 0.003)
    iz.ekle(t, y, g, pan)

def arp(iz, t0, t1, adim=0.25, oktav=1, g=0.08, tau=0.14):
    t = t0; i = 0
    while t < t1 - 1e-6:
        c = CHORDS[int(t // 2) % 4]; notes = c + [c[0] + 12]
        m = notes[[0, 2, 1, 3, 2, 1, 3, 2][i % 8]] + 12 * oktav
        pluck(iz, t, m, g, pan=(-0.35 if i % 2 else 0.35), tau=tau); t += adim; i += 1

def bell(iz, t, m, g=0.08, pan=0.0):
    n = int(2.5 * SR); tt = np.arange(n) / SR; f = mtof(m)
    y = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt / d) for r, a, d in ((1, 1, 1.4), (2.76, .5, .6), (5.4, .25, .3), (8.93, .12, .15)))
    iz.ekle(t, y * np.minimum(1, tt / 0.002), g, pan)

def kick(iz, t, g=0.55):
    n = int(0.5 * SR); tt = np.arange(n) / SR
    f = 45 + 110 * np.exp(-tt / 0.035); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-tt / 0.28) + 0.3 * rng.standard_normal(n) * np.exp(-tt / 0.004)
    iz.ekle(t, np.tanh(y * 1.4), g)

def clap(iz, t, g=0.22):
    n = int(0.35 * SR); tt = np.arange(n) / SR
    y = fft_filter(rng.standard_normal(n), lo=900, hi=6000) * (np.exp(-tt / 0.12) + 0.6 * np.exp(-((tt - 0.012) / 0.004) ** 2))
    y += 0.3 * np.sin(2 * np.pi * 190 * tt) * np.exp(-tt / 0.06)
    iz.ekle(t, y, g)

HAT = fft_filter(rng.standard_normal(int(0.4 * SR)), lo=7000)
def hat(iz, t, g=0.05, acik=False, pan=0.2):
    tt = np.arange(len(HAT)) / SR; iz.ekle(t, HAT * np.exp(-tt / (0.16 if acik else 0.03)), g, pan)

def bas(iz, t0, t1, adim=0.25, g=0.20, desen=None):
    t = t0; i = 0
    while t < t1 - 1e-6:
        c = CHORDS[int(t // 2) % 4]; m = c[0] - 24 + (12 if desen and desen[i % len(desen)] else 0)
        n = int(adim * 0.95 * SR); tt = np.arange(n) / SR
        y = (np.sin(2 * np.pi * mtof(m) * tt) + 0.35 * osc(mtof(m), n, harm=5)) * env_adsr(n, 0.004, 0.08, 0.7, 0.04)
        iz.ekle(t, y, g); t += adim; i += 1

def riser(iz, t0, t1, g=0.12):
    n = int((t1 - t0) * SR); tt = np.arange(n) / SR
    y = sweep_filter(rng.standard_normal(n), 400, 9000, bp=True) * (tt / tt[-1]) ** 2.2
    f = 180 * (8 ** (tt / tt[-1])); y += 0.25 * np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / tt[-1]) ** 2
    iz.ekle(t0, y, g)

def whoosh(iz, t, sure=0.9, g=0.16, pan=0.0):
    n = int(sure * SR); tt = np.arange(n) / SR; e = np.sin(np.pi * tt / sure) ** 2
    y = sweep_filter(rng.standard_normal(n), 300, 5000, bp=True) * e
    iz.ekle(t - sure * 0.55, y, g, pan)

def impact(iz, t, g=0.5, buyuk=False):
    n = int((2.6 if buyuk else 1.6) * SR); tt = np.arange(n) / SR
    f = 32 + 70 * np.exp(-tt / 0.08); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / (0.9 if buyuk else 0.55))
    y += 0.5 * fft_filter(rng.standard_normal(n), hi=1800) * np.exp(-tt / 0.12)
    iz.ekle(t, np.tanh(y * 1.3), g)

def click(iz, t, g=0.10):
    n = int(0.05 * SR); tt = np.arange(n) / SR
    iz.ekle(t, (np.sin(2 * np.pi * 2300 * tt) * np.exp(-tt / 0.006) + 0.3 * rng.standard_normal(n) * np.exp(-tt / 0.002)), g, 0.15)

def parilti(iz, t, g=0.05):
    for i, m in enumerate([86, 89, 93, 98]): bell(iz, t + i * 0.06, m, g * (1 - i * 0.15), pan=-0.5 + i * 0.33)

# ---------------- düzenlemeler ----------------
def davul(iz, t0, t1, kick_=True, kick_yari=False, clap_=True, hat8=True, hat16=False, acik=False, g=1.0):
    t = t0
    while t < t1 - 1e-6:
        b = int(round((t - t0) / BEAT))
        if kick_ and (not kick_yari or b % 2 == 0): kick(iz, t, 0.55 * g)
        if clap_ and b % 2 == 1: clap(iz, t, 0.22 * g)
        if hat8: hat(iz, t + BEAT / 2, 0.05 * g)
        if hat16: hat(iz, t + BEAT / 4, 0.03 * g, pan=-0.2); hat(iz, t + 3 * BEAT / 4, 0.03 * g, pan=-0.2)
        if acik and b % 2 == 1: hat(iz, t + BEAT / 2, 0.04 * g, acik=True, pan=-0.3)
        t += BEAT

def yatay():
    iz = Iz(91.5)
    # 1 açılış 0–8: gizemli
    sub(iz, 0, 8.5, 0.22); pad_bolum(iz, 0, 8, parlak=0.35, g=0.10)
    for t in (1.2, 2.7, 4.4, 5.9): bell(iz, t, [86, 81, 89, 84][int(t) % 4], 0.03, pan=rng.uniform(-.7, .7))
    impact(iz, 2.0, 0.35); parilti(iz, 3.0, 0.05); riser(iz, 5.0, 8.0, 0.10); whoosh(iz, 7.9, 0.8, 0.14)
    # 2 ana sayfa 8–20: nabız
    pad_bolum(iz, 8, 20, parlak=0.6, g=0.10); arp(iz, 8, 20, 0.25, 1, 0.055); bas(iz, 12, 20, 0.5, 0.14)
    davul(iz, 8, 20, clap_=False, hat8=False, g=0.6); davul(iz, 12, 20, kick_=False, clap_=False, hat8=True, g=0.7)
    for t in (10.5, 12.0, 13.0, 14.0, 15.0): click(iz, t, 0.06)
    whoosh(iz, 19.9, 0.9, 0.16)
    # 3 Altın / Elmas 20–38: yükselen
    impact(iz, 20.0, 0.45); pad_bolum(iz, 20, 29, parlak=0.9, g=0.12); pad_bolum(iz, 22, 29, parlak=0.7, g=0.05, oktav=1)
    bas(iz, 20, 29, 0.5, 0.17); davul(iz, 22, 29, clap_=True, hat8=True, g=0.75); arp(iz, 22, 29, 0.25, 1, 0.05)
    whoosh(iz, 22.0, 0.9, 0.14); parilti(iz, 22.1, 0.05)
    whoosh(iz, 29.0, 1.1, 0.2); impact(iz, 29.0, 0.35); parilti(iz, 29.05, 0.07)
    pad_bolum(iz, 29, 38, parlak=1.2, g=0.10); arp(iz, 29, 38, 0.125, 2, 0.04, tau=0.09)
    for i, t in enumerate(np.arange(29, 35, 1.0)): bell(iz, t, [86, 89, 93, 91, 89, 86][i], 0.045, pan=(-.4 if i % 2 else .4))
    bas(iz, 29, 38, 0.5, 0.16); davul(iz, 29, 35, g=0.8)
    whoosh(iz, 35.0, 0.9, 0.14); riser(iz, 35.0, 38.0, 0.12)
    for k, t in enumerate(np.arange(36, 38, 0.125)): clap(iz, t, 0.04 + 0.1 * k / 16)
    # 4 eğitim deneyimi 38–56: ritim
    impact(iz, 38.0, 0.4); pad_bolum(iz, 38, 56, parlak=0.8, g=0.09); arp(iz, 38, 56, 0.25, 1, 0.045)
    bas(iz, 38, 56, 0.25, 0.17, desen=[0, 0, 1, 0]); davul(iz, 38, 56, hat8=True, g=0.85)
    for t in (43.0, 49.0): whoosh(iz, t, 0.7, 0.12)
    for t in np.arange(43.6, 45.0, 0.18): click(iz, t, 0.04)  # yazma
    for t in (50.2, 52.2): click(iz, t, 0.08)
    parilti(iz, 52.3, 0.05); riser(iz, 54.0, 56.0, 0.10)
    # 5 oyunlar 56–68: en enerjik
    impact(iz, 56.0, 0.55); pad_bolum(iz, 56, 68, parlak=1.3, g=0.09); arp(iz, 56, 68, 0.125, 2, 0.05, tau=0.08)
    bas(iz, 56, 68, 0.125, 0.18, desen=[0, 1, 0, 0, 1, 0, 1, 0]); davul(iz, 56, 68, hat8=True, hat16=True, acik=True, g=1.0)
    for t in (58.0, 60.0, 66.0): whoosh(iz, t, 0.6, 0.13); impact(iz, t, 0.25)
    click(iz, 57.0, 0.08); parilti(iz, 63.2, 0.05)
    whoosh(iz, 68.0, 1.0, 0.16)
    # 6 öğretmen ve editör 68–80: sakin, profesyonel
    pad_bolum(iz, 68, 80, parlak=0.55, g=0.10); arp(iz, 68, 80, 0.5, 1, 0.05, tau=0.25); bas(iz, 68, 80, 1.0, 0.13)
    davul(iz, 68, 80, kick_yari=True, clap_=False, hat8=False, g=0.55)
    for t in (70.5, 74.0, 76.5): whoosh(iz, t, 0.6, 0.09)
    riser(iz, 77.0, 80.0, 0.13)
    # 7 final 80–90
    impact(iz, 80.0, 0.6, buyuk=True); pad_bolum(iz, 80, 86, parlak=1.2, g=0.11); arp(iz, 80, 86, 0.125, 2, 0.045, tau=0.08)
    bas(iz, 80, 86, 0.25, 0.17, desen=[0, 0, 1, 0]); davul(iz, 80, 84, hat8=True, hat16=True, g=0.9)
    whoosh(iz, 84.0, 0.9, 0.15); parilti(iz, 84.6, 0.06)
    impact(iz, 86.0, 0.6, buyuk=True); pad(iz, 86, 90.5, [50, 57, 62], parlak=0.9, g=0.13); sub(iz, 86, 90.8, 0.18)
    bell(iz, 86.0, 74, 0.06); bell(iz, 86.02, 81, 0.05); parilti(iz, 87.0, 0.04)
    return iz, 90.0

def dikey():
    iz = Iz(43.5)
    sub(iz, 0, 4.5, 0.2); pad_bolum(iz, 0, 4, parlak=0.4, g=0.1); impact(iz, 1.0, 0.35); parilti(iz, 1.4, 0.05); riser(iz, 2.5, 4.0, 0.1); whoosh(iz, 3.95, 0.8, 0.14)
    impact(iz, 4.0, 0.4); pad_bolum(iz, 4, 14, parlak=0.9, g=0.1); arp(iz, 4, 14, 0.25, 1, 0.05); bas(iz, 4, 14, 0.5, 0.16); davul(iz, 6, 14, g=0.8)
    for t in (8.0, 14.0): whoosh(iz, t, 0.9, 0.16); impact(iz, t, 0.3)
    parilti(iz, 8.05, 0.06)
    pad_bolum(iz, 14, 22, parlak=1.2, g=0.1); arp(iz, 14, 22, 0.125, 2, 0.04, tau=0.09); bas(iz, 14, 22, 0.5, 0.16); davul(iz, 14, 22, g=0.85)
    for i, t in enumerate(np.arange(14, 18, 1.0)): bell(iz, t, [86, 89, 93, 91][i], 0.045)
    whoosh(iz, 18.0, 0.8, 0.14); whoosh(iz, 22.0, 0.8, 0.14)
    pad_bolum(iz, 22, 30, parlak=0.8, g=0.09); bas(iz, 22, 30, 0.25, 0.17, desen=[0, 0, 1, 0]); davul(iz, 22, 30, g=0.9); arp(iz, 22, 30, 0.25, 1, 0.045)
    for t in np.arange(22.6, 24.0, 0.18): click(iz, t, 0.04)
    click(iz, 28.2, 0.08); parilti(iz, 28.3, 0.05)
    impact(iz, 30.0, 0.5); pad_bolum(iz, 30, 36, parlak=1.3, g=0.09); arp(iz, 30, 36, 0.125, 2, 0.05, tau=0.08); bas(iz, 30, 36, 0.125, 0.18, desen=[0, 1, 0, 0, 1, 0, 1, 0]); davul(iz, 30, 36, hat16=True, acik=True)
    whoosh(iz, 36.0, 0.9, 0.15); riser(iz, 36.5, 38.0, 0.1)
    impact(iz, 38.0, 0.6, buyuk=True); pad(iz, 38, 43, [50, 57, 62], parlak=0.9, g=0.13); sub(iz, 38, 43.2, 0.18); bell(iz, 38.0, 74, 0.06); parilti(iz, 39.0, 0.04)
    return iz, 42.0

def yaz(ad, iz, sure):
    L, R = reverb(iz.L, iz.R, 2.4, 0.22)
    n = int(sure * SR); L = L[:n]; R = R[:n]
    f = np.minimum(1, (n - np.arange(n)) / (1.2 * SR)); L *= f; R *= f      # son 1,2 sn yumuşak bitiş
    m = max(np.max(np.abs(L)), np.max(np.abs(R))) + 1e-9
    L = np.tanh(L / m * 1.6) / np.tanh(1.6); R = np.tanh(R / m * 1.6) / np.tanh(1.6)
    d = (np.stack([L, R], 1) * 0.89 * 32767).astype('<i2')
    with wave.open(os.path.join(OUT, ad), 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())
    print('✓', ad, f'{sure} sn')

if __name__ == '__main__':
    hangi = sys.argv[1:] or ['yatay', 'dikey']
    if 'yatay' in hangi: yaz('muzik_16x9.wav', *yatay())
    if 'dikey' in hangi: yaz('muzik_9x16.wav', *dikey())
