/* ===================== V49.0: Elmas ve Altın görsel kimliği =====================
   V48.Gorsel işlevlerini yeniden tanımlar (aynı adlar; çağıran kod değişmez):
     altinAmblem(s)  → gerçek altın külçesi (üç yüzlü prizma, metalik ışık, üst yüzde kazınmış 8 yapraklı rozet)
     elmasAmblem(s)  → pırlanta kesim elmas (taç, kuşak, köşk yüzeyleri; mavi, gümüş, platin yansımalar)
     elmas()         → Elmas Öğrenme Alanı: ferah, kristal ve camdan modern dijital kütüphane, merkezde büyük pırlanta
     altin()         → Altın Öğrenme Alanı: zümrüt duvarlı, altın kemer ve sütunlu, kitaplıklı ihtişamlı okul koridoru,
                       önde kaide üzerinde altın külçeler ve açık kitap
   Hepsi vektör (SVG); yazı içermez, dosya indirmez. Sonuçlar bellekte saklanır (her çizimde yeniden üretilmez).
   Altı köşeli yıldız, haç ya da artı biçimi kullanılmaz; süslemeler 8 yapraklı çiçek rozetlerdir. */
(function () {
  const V48 = window.V48 = window.V48 || {};
  const Gr = V48.Gorsel = V48.Gorsel || {};
  const V49 = window.V49 = window.V49 || {};
  V49.Gorsel = Gr;
  const f1 = (n) => +n.toFixed(1);
  const P = (L) => L.map(([x, y]) => f1(x) + ',' + f1(y)).join(' ');
  const bel = {};
  const sakla = (k, fn) => (bel[k] || (bel[k] = fn()));
  const rnd = (s) => () => ((s = (s * 9301 + 49297) % 233280) / 233280);

  /* ---------- 8 yapraklı çiçek rozeti (iki katman yaprak, her yaprak iki yarım: ışık ve gölge) ---------- */
  const yaprak = (r0, R, w) => { // +x yönünde sivri yaprak; iki yarım
    const a = `M${f1(r0)} 0C${f1(r0 + (R - r0) * 0.3)} ${f1(-w)} ${f1(R - (R - r0) * 0.3)} ${f1(-w * 0.5)} ${f1(R)} 0Z`;
    const b = `M${f1(r0)} 0C${f1(r0 + (R - r0) * 0.3)} ${f1(w)} ${f1(R - (R - r0) * 0.3)} ${f1(w * 0.5)} ${f1(R)} 0Z`;
    return [a, b];
  };
  Gr.rozet = (cx, cy, R, ac, ko, cizgi, op) => {
    let s = `<g transform="translate(${f1(cx)} ${f1(cy)})" ${op ? `opacity="${op}"` : ''}>`;
    const kat = [[R * 0.18, R, R * 0.26, 0], [R * 0.12, R * 0.66, R * 0.2, 22.5], [R * 0.08, R * 0.36, R * 0.12, 0]];
    kat.forEach(([r0, r1, w, d]) => { const [a, b] = yaprak(r0, r1, w); for (let i = 0; i < 8; i++) s += `<g transform="rotate(${d + i * 45})"><path d="${a}" fill="${ac}"/><path d="${b}" fill="${ko}"/><path d="${a.replace('Z', '')}" fill="none" stroke="${cizgi}" stroke-width="${f1(Math.max(.4, R / 60))}"/></g>`; });
    return s + `<circle r="${f1(R * 0.1)}" fill="${ko}"/><circle r="${f1(R * 0.05)}" cx="${f1(-R * 0.02)}" cy="${f1(-R * 0.02)}" fill="${ac}"/></g>`;
  };

  /* ---------- amblemler ---------- */
  // altın külçesi: (x,y) sol alt köşe, w genişlik; gradyan kimlikleri öneki ile
  const kulce = (x, y, w, id, rozet) => {
    const k = w / 50, X = (a) => x + a * k, Y = (b) => y + b * k;
    const on = [[0, 0], [50, 0], [43, -16], [7, -16]], ust = [[7, -16], [43, -16], [49, -24], [13, -24]], yan = [[50, 0], [58, -9], [49, -24], [43, -16]];
    const m = (L) => P(L.map(([a, b]) => [X(a), Y(b)]));
    return `<g><polygon points="${m(yan)}" fill="url(#${id}y)"/><polygon points="${m(on)}" fill="url(#${id}o)"/><polygon points="${m(ust)}" fill="url(#${id}u)"/>
<path d="M${f1(X(7))} ${f1(Y(-16))}H${f1(X(43))}" stroke="#fff6d0" stroke-width="${f1(1.2 * k)}" stroke-linecap="round" opacity=".9"/>
<path d="M${f1(X(43))} ${f1(Y(-16))}L${f1(X(49))} ${f1(Y(-24))}" stroke="#fff1bf" stroke-width="${f1(.8 * k)}" opacity=".7"/>
<path d="M${f1(X(4))} ${f1(Y(-3))}L${f1(X(9))} ${f1(Y(-14))}" stroke="#fff3c6" stroke-width="${f1(1.6 * k)}" stroke-linecap="round" opacity=".55"/>
<polygon points="${m([[11, -17.5], [39, -17.5], [44, -22.5], [16, -22.5]])}" fill="none" stroke="#9c6a1a" stroke-width="${f1(.6 * k)}" opacity=".55"/>
${rozet ? `<g transform="matrix(${f1(k)} 0 ${f1(0.37 * k)} ${f1(0.5 * k)} ${f1(X(28))} ${f1(Y(-20))})" opacity=".75">${Gr.rozet(0, 0, 9, '#fff0b8', '#b3801f', '#8a5d14')}</g>` : ''}</g>`;
  };
  const kulceGrad = (id) => `<linearGradient id="${id}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe089"/><stop offset=".45" stop-color="#e2ad3b"/><stop offset="1" stop-color="#a8711b"/></linearGradient>
<linearGradient id="${id}u" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f8d374"/><stop offset=".5" stop-color="#fff4c4"/><stop offset="1" stop-color="#e7b54a"/></linearGradient>
<linearGradient id="${id}y" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c38a26"/><stop offset="1" stop-color="#6e4610"/></linearGradient>`;
  Gr.kulce = kulce; Gr.kulceGrad = kulceGrad;
  Gr.altinAmblem = (s, id) => { id = id || 'ak49'; const kk = s < 40; return `<svg width="${kk ? Math.round(s * 1.75) : s}" height="${s}" viewBox="${kk ? '0 14 64 36.5' : '0 0 64 64'}" aria-hidden="true" focusable="false"><defs>${kulceGrad(id)}<radialGradient id="${id}p" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="#ffd86b" stop-opacity=".45"/><stop offset="1" stop-color="#ffd86b" stop-opacity="0"/></radialGradient></defs>
${s >= 40 ? `<ellipse cx="32" cy="46" rx="28" ry="7" fill="url(#${id}p)"/><ellipse cx="30" cy="47" rx="24" ry="3.2" fill="#3a2508" opacity=".35"/>` : ''}${kulce(2, 45, 52, id, s >= 40)}<circle cx="49" cy="18" r="1.6" fill="#fffbe8"/></svg>`; };

  // pırlanta: kuşak 9 nokta, tabla 5 nokta, köşk ucu; yüzeyler simetrik renk dizisiyle
  const pirlanta = (cx, cy, w, id) => {
    const k = w / 56, gx = (i) => cx + (-28 + 7 * i) * k, gy = cy, tx = (i) => cx + (-12 + 6 * i) * k, ty = cy - 12 * k, ucx = cx, ucy = cy + 31 * k;
    const TAC = ['#eef6ff', '#bcd3ee', '#ffffff', '#9fbde3', '#dcebfb', '#8fb0d9', '#ffffff', '#b5cdea', '#e8f2fd', '#a7c3e6', '#ffffff', '#c9dcf2'];
    const KOSK = ['#8eaad3', '#e9f2fc', '#6d90c4', '#f7fbff', '#cfe0f4', '#5f86bd', '#dbe9f8', '#87a6d1'];
    let s = '', n = 0;
    for (let i = 0; i < 4; i++) {
      s += `<polygon points="${P([[tx(i), ty], [gx(2 * i), gy], [gx(2 * i + 1), gy]])}" fill="${TAC[n++]}"/>`;
      s += `<polygon points="${P([[tx(i), ty], [gx(2 * i + 1), gy], [tx(i + 1), ty]])}" fill="${TAC[n++]}"/>`;
      s += `<polygon points="${P([[tx(i + 1), ty], [gx(2 * i + 1), gy], [gx(2 * i + 2), gy]])}" fill="${TAC[n++]}"/>`;
    }
    for (let i = 0; i < 8; i++) s += `<polygon points="${P([[gx(i), gy], [gx(i + 1), gy], [ucx, ucy]])}" fill="${KOSK[i]}"/>`;
    for (let i = 0; i < 8; i++) { const mx = ucx + ((gx(i) + gx(i + 1)) / 2 - ucx) * 0.45, my = gy + (ucy - gy) * 0.55; s += `<polygon points="${P([[gx(i), gy], [mx, my], [gx(i + 1), gy]])}" fill="${i % 2 ? '#ffffff' : '#a9c4e6'}" opacity="${i % 2 ? .55 : .5}"/>`; }
    // köşk iç kesimleri ve ışık
    s += `<g stroke="#ffffff" stroke-width="${f1(.5 * k)}" opacity=".55">${[1, 3, 5, 7].map((i) => `<path d="M${f1(gx(i))} ${f1(gy)}L${f1(ucx + (gx(i) - ucx) * 0.35)} ${f1(gy + (ucy - gy) * 0.62)}"/>`).join('')}</g>`;
    s += `<polygon points="${P([[gx(0), gy], [gx(8), gy], [gx(8), gy + 1.4 * k], [gx(0), gy + 1.4 * k]])}" fill="#dfe9f5"/>`;
    s += `<polygon points="${P([[tx(0), ty], [gx(0), gy], [ucx, ucy], [gx(8), gy], [tx(4), ty]])}" fill="none" stroke="#3f5f8c" stroke-width="${f1(1 * k)}" stroke-linejoin="round"/>`;
    s += `<path d="M${f1(tx(0) + 2 * k)} ${f1(ty + 1.5 * k)}L${f1(gx(1))} ${f1(gy - 1.5 * k)}" stroke="#fff" stroke-width="${f1(1.3 * k)}" stroke-linecap="round" opacity=".9"/>`;
    s += `<polygon points="${P([[cx - 3 * k, cy + 4 * k], [cx + 5 * k, cy + 2 * k], [cx + 1 * k, cy + 18 * k]])}" fill="#9fe3ff" opacity=".45"/>`;
    return s;
  };
  Gr.pirlanta = pirlanta;
  Gr.elmasAmblem = (s, id) => `<svg width="${s < 40 ? Math.round(s * 1.3) : s}" height="${s}" viewBox="${s < 40 ? '0 8 64 49' : '0 0 64 64'}" aria-hidden="true" focusable="false"><defs><radialGradient id="${id || 'ea49'}p" cx="50%" cy="45%" r="50%"><stop offset="0" stop-color="#d9ecff" stop-opacity=".8"/><stop offset="1" stop-color="#d9ecff" stop-opacity="0"/></radialGradient></defs><circle cx="32" cy="30" r="30" fill="url(#${id || 'ea49'}p)"/>${pirlanta(32, 24, 58, id)}<circle cx="47" cy="13" r="1.5" fill="#fff"/><circle cx="47" cy="13" r="3.5" fill="#e6f4ff" opacity=".5"/></svg>`;

  /* ---------- perspektif yardımcıları ---------- */
  const yanDuvarKitap = (o) => { // o: {VX, VY, X(dünya, ± yan), raflar:[Yalt], yuk, z0, z1, renk[], r, sirt}
    let s = ''; const R = rnd(o.r), px = (z) => o.VX + o.X / z, py = (Y, z) => o.VY + (Y - o.VY) / z;
    o.raflar.forEach((Ya) => {
      let z = o.z0;
      while (z < o.z1) {
        const dz = (0.05 + R() * 0.05) * z * 0.9, h = o.yuk * (0.72 + R() * 0.28), z2 = Math.min(z + dz, o.z1), c = o.renk[Math.floor(R() * o.renk.length)];
        s += `<polygon points="${P([[px(z), py(Ya, z)], [px(z), py(Ya - h, z)], [px(z2), py(Ya - h, z2)], [px(z2), py(Ya, z2)]])}" fill="${c}"/>`;
        if (o.sirt && R() < 0.5) s += `<path d="M${f1(px(z))} ${f1(py(Ya - h * 0.82, z))}L${f1(px(z2))} ${f1(py(Ya - h * 0.82, z2))}" stroke="${o.sirt}" stroke-width="${f1(1.2 / z)}" opacity=".8"/>`;
        z = z2 + 0.006 * z;
      }
      s += `<polygon points="${P([[px(o.z0), py(Ya, o.z0)], [px(o.z1), py(Ya, o.z1)], [px(o.z1), py(Ya + 7, o.z1)], [px(o.z0), py(Ya + 7, o.z0)]])}" fill="${o.raf}"/>`;
      if (o.rafIsik) s += `<path d="M${f1(px(o.z0))} ${f1(py(Ya, o.z0))}L${f1(px(o.z1))} ${f1(py(Ya, o.z1))}" stroke="${o.rafIsik}" stroke-width="1" opacity=".9"/>`;
    });
    return s;
  };

  /* ---------- Elmas Öğrenme Alanı ---------- */
  Gr.elmas = (id) => sakla('e' + (id || ''), () => { id = id || 'ge49'; const VX = 320, VY = 150, ZF = 3.56;
    const px = (X, z) => VX + X / z, py = (Y, z) => VY + (Y - VY) / z;
    const KIT = ['#dfe7f1', '#c7d3e2', '#eef3f8', '#b6c6da', '#d4e1ef', '#a9bdd6', '#e7eef6', '#c2d6ec', '#9fb6d2'];
    let s = `<svg class="g48 g49" viewBox="0 0 640 374" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>
<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8fc"/><stop offset="1" stop-color="#dbe5f0"/></linearGradient>
<linearGradient id="${id}z" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8e2ee"/><stop offset=".5" stop-color="#eef3f9"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
<linearGradient id="${id}t" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e9eff6"/><stop offset="1" stop-color="#fbfdff"/></linearGradient>
<linearGradient id="${id}d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e3eaf3"/><stop offset="1" stop-color="#f3f7fb"/></linearGradient>
<linearGradient id="${id}d2" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#e3eaf3"/><stop offset="1" stop-color="#f3f7fb"/></linearGradient>
<radialGradient id="${id}l" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#eaf4ff" stop-opacity=".85"/><stop offset="1" stop-color="#dcebfb" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}m" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#9fd2ff" stop-opacity=".55"/><stop offset="1" stop-color="#9fd2ff" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
<linearGradient id="${id}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#c9dcf0" stop-opacity=".55"/></linearGradient></defs>
<rect width="640" height="374" fill="url(#${id}g)"/>`;
    // tavan, duvarlar, zemin
    s += `<polygon points="${P([[0, 0], [640, 0], [px(320, ZF), py(0, ZF)], [px(-320, ZF), py(0, ZF)]])}" fill="url(#${id}t)"/>`;
    s += `<polygon points="${P([[0, 0], [px(-320, ZF), py(0, ZF)], [px(-320, ZF), py(374, ZF)], [0, 374]])}" fill="url(#${id}d)"/>`;
    s += `<polygon points="${P([[640, 0], [px(320, ZF), py(0, ZF)], [px(320, ZF), py(374, ZF)], [640, 374]])}" fill="url(#${id}d2)"/>`;
    s += `<polygon points="${P([[0, 374], [px(-320, ZF), py(374, ZF)], [px(320, ZF), py(374, ZF)], [640, 374]])}" fill="url(#${id}z)"/>`;
    // tavan ışık şeritleri
    [-150, 0, 150].forEach((X) => { s += `<polygon points="${P([[px(X - 14, 1), py(0, 1)], [px(X + 14, 1), py(0, 1)], [px(X + 14, ZF), py(0, ZF)], [px(X - 14, ZF), py(0, ZF)]])}" fill="#ffffff" opacity=".95"/>`; });
    [1.4, 2, 2.8].forEach((z) => { s += `<path d="M${f1(px(-320, z))} ${f1(py(0, z))}H${f1(px(320, z))}" stroke="#d5dfeb" stroke-width="${f1(2 / z)}"/>`; });
    // zemin derzleri (cam karolar) — yalnız derinliğe giden çizgiler ve yatay derzler; yansıma şeritleri
    s += `<g stroke="#c9d6e5" stroke-width=".8" opacity=".7">${[-240, -160, -80, 0, 80, 160, 240].map((X) => `<path d="M${f1(px(X, 1))} 374L${f1(px(X, ZF))} ${f1(py(374, ZF))}"/>`).join('')}${[1.15, 1.45, 1.9, 2.6].map((z) => `<path d="M${f1(px(-320, z))} ${f1(py(374, z))}H${f1(px(320, z))}"/>`).join('')}</g>`;
    // cam kitaplıklar (iki yan duvar)
    const raf = {VX, VY, raflar: [92, 168, 244, 320], yuk: 58, z0: 1.12, z1: 3.3, renk: KIT, raf: '#f7fbff', rafIsik: '#ffffff', sirt: '#8fa7c4'};
    s += yanDuvarKitap(Object.assign({X: -320, r: 7}, raf)) + yanDuvarKitap(Object.assign({X: 320, r: 19}, raf));
    // raf dikmeleri (cam) ve duvar kristal kenarları
    [1.12, 1.6, 2.3, 3.3].forEach((z) => { [-320, 320].forEach((X) => { s += `<path d="M${f1(px(X, z))} ${f1(py(20, z))}V${f1(py(334, z))}" stroke="#ffffff" stroke-width="${f1(4 / z)}" opacity=".9"/><path d="M${f1(px(X, z) + (X < 0 ? 2 : -2) / z)} ${f1(py(20, z))}V${f1(py(334, z))}" stroke="#a9bcd3" stroke-width="${f1(1 / z)}" opacity=".7"/>`; }); });
    // arka duvar: kemerli büyük pencere ve çiçek rozetli kafes
    const ax = px(-56, ZF), bx = px(56, ZF), ab = py(374, ZF), at = py(70, ZF);
    s += `<path d="M${f1(ax)} ${f1(ab)}V${f1(at + 26)}Q${f1(ax)} ${f1(at)} 320 ${f1(at - 8)}Q${f1(bx)} ${f1(at)} ${f1(bx)} ${f1(at + 26)}V${f1(ab)}Z" fill="#ffffff" stroke="#c3d1e1" stroke-width="1.5"/>`;
    s += [[307, at + 22], [333, at + 22], [320, at + 44], [307, at + 66], [333, at + 66]].map(([x, y]) => Gr.rozet(x, y, 11, '#e6eef7', '#b9c9dc', '#9db1c8', .9)).join('');
    // ışık huzmeleri
    s += `<polygon points="${P([[ax + 6, at + 10], [bx - 6, at + 10], [470, 374], [170, 374]])}" fill="url(#${id}k)" opacity=".35"/>`;
    // dijital cam paneller (yazısız)
    const panel = (x, y, w, h, sk) => `<g transform="translate(${x} ${y}) skewY(${sk})"><rect width="${w}" height="${h}" rx="7" fill="url(#${id}c)" stroke="#a9c3e0" stroke-width="1"/><rect x="8" y="10" width="${w * 0.5}" height="4" rx="2" fill="#9cc1e6"/><rect x="8" y="20" width="${w - 16}" height="3" rx="1.5" fill="#cddff1"/><rect x="8" y="28" width="${w - 26}" height="3" rx="1.5" fill="#cddff1"/><rect x="8" y="${h - 22}" width="${w - 16}" height="12" rx="4" fill="#e3effa" stroke="#b8d0ea" stroke-width=".8"/></g>`;
    s += panel(58, 120, 74, 92, -8) + panel(508, 110, 74, 92, 8);
    // kaide ve ışık halkası
    s += `<ellipse cx="320" cy="300" rx="98" ry="15" fill="#c6d6e8" opacity=".55"/><path d="M236 300v22q84 26 168 0v-22" fill="#eef4fa" stroke="#c3d2e3"/><ellipse cx="320" cy="300" rx="84" ry="12" fill="#ffffff" stroke="#b6cbe2" stroke-width="1.2"/><ellipse cx="320" cy="300" rx="62" ry="8" fill="none" stroke="#7fb8f0" stroke-width="1.2" opacity=".7"/>`;
    // pırlanta: hale, yörünge halkası, yansıma
    s += `<circle cx="320" cy="190" r="130" fill="url(#${id}l)"/><ellipse cx="320" cy="214" rx="120" ry="34" fill="url(#${id}m)"/>`;
    s += `<ellipse cx="320" cy="206" rx="132" ry="26" fill="none" stroke="#9cc6ee" stroke-width="1.2" opacity=".6"/><circle cx="452" cy="206" r="3" fill="#7fb8f0"/><circle cx="196" cy="214" r="2.2" fill="#a9d0f5"/>`;
    s += `<ellipse cx="320" cy="300" rx="40" ry="5" fill="#7fb8f0" opacity=".35"/>`;
    s += pirlanta(320, 180, 190, id + 'a');
    s += [[214, 132, 3], [436, 120, 2.6], [404, 262, 2.2], [236, 252, 2], [352, 96, 2.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="#e3f2ff" opacity=".45"/>`).join('');
    return s + '</svg>'; });

  /* ---------- Altın Öğrenme Alanı ---------- */
  Gr.altin = (id) => sakla('a' + (id || ''), () => { id = id || 'ga49'; const VX = 320, VY = 196, ZF = 5.2;
    const px = (X, z) => VX + X / z, py = (Y, z) => VY + (Y - VY) / z;
    const KIT = ['#6b2a1e', '#2f4a3c', '#7a5326', '#3b2a4d', '#8a3a24', '#25423a', '#5a3a1a', '#7d6230', '#43301c'];
    let s = `<svg class="g48 g49" viewBox="0 0 640 374" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>${kulceGrad(id + 'k')}
<linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b2a20"/><stop offset="1" stop-color="#174a39"/></linearGradient>
<linearGradient id="${id}d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#061a13"/><stop offset="1" stop-color="#15453a"/></linearGradient>
<linearGradient id="${id}d2" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#061a13"/><stop offset="1" stop-color="#15453a"/></linearGradient>
<linearGradient id="${id}z" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2914"/><stop offset="1" stop-color="#120c06"/></linearGradient>
<linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a2a1c"/><stop offset="1" stop-color="#3e130d"/></linearGradient>
<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5212"/><stop offset=".45" stop-color="#f6d77d"/><stop offset=".6" stop-color="#e2b04b"/><stop offset="1" stop-color="#6f4a10"/></linearGradient>
<radialGradient id="${id}l" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff2c9"/><stop offset=".35" stop-color="#ffd27a" stop-opacity=".7"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}f" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd98a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d4a3c"/><stop offset="1" stop-color="#0a2219"/></linearGradient></defs>
<rect width="640" height="374" fill="#06140f"/>`;
    s += `<polygon points="${P([[0, 0], [640, 0], [px(300, ZF), py(-40, ZF)], [px(-300, ZF), py(-40, ZF)]])}" fill="url(#${id}t)"/>`;
    s += `<polygon points="${P([[0, 0], [px(-300, ZF), py(-40, ZF)], [px(-300, ZF), py(380, ZF)], [0, 374]])}" fill="url(#${id}d)"/>`;
    s += `<polygon points="${P([[640, 0], [px(300, ZF), py(-40, ZF)], [px(300, ZF), py(380, ZF)], [640, 374]])}" fill="url(#${id}d2)"/>`;
    s += `<polygon points="${P([[0, 374], [px(-300, ZF), py(380, ZF)], [px(300, ZF), py(380, ZF)], [640, 374]])}" fill="url(#${id}z)"/>`;
    // uçtaki aydınlık kapı
    const kx = px(-60, ZF), kx2 = px(60, ZF), kb = py(380, ZF), kt = py(150, ZF);
    s += `<circle cx="320" cy="${f1(kt + 10)}" r="120" fill="url(#${id}l)"/><path d="M${f1(kx)} ${f1(kb)}V${f1(kt + 18)}Q${f1(kx)} ${f1(kt - 6)} 320 ${f1(kt - 18)}Q${f1(kx2)} ${f1(kt - 6)} ${f1(kx2)} ${f1(kt + 18)}V${f1(kb)}Z" fill="#fff0c8" stroke="#e2b04b" stroke-width="1.4"/>`;
    // kitaplıklar: sütun aralarında yan duvarlarda
    const Z = [1.25, 1.85, 2.7, 3.9, 5.2];
    for (let i = 0; i < Z.length - 1; i++) [-300, 300].forEach((X, j) => { s += yanDuvarKitap({VX, VY, X, raflar: [118, 186, 254, 322], yuk: 56, z0: Z[i] + 0.08 * Z[i], z1: Z[i + 1] - 0.05 * Z[i + 1], renk: KIT, raf: '#3a2610', rafIsik: '#c9973f', sirt: '#e2b04b', r: 11 + i * 7 + j * 3}); });
    // halı ve madalyonlar
    s += `<polygon points="${P([[px(-95, 1), 374], [px(95, 1), 374], [px(95, ZF), py(380, ZF)], [px(-95, ZF), py(380, ZF)]])}" fill="url(#${id}h)"/>`;
    s += `<g fill="none" stroke="#d6a84a" stroke-width="1.4" opacity=".85"><path d="M${f1(px(-82, 1))} 374L${f1(px(-82, ZF))} ${f1(py(380, ZF))}M${f1(px(82, 1))} 374L${f1(px(82, ZF))} ${f1(py(380, ZF))}"/></g>`;
    [1.35, 2.1, 3.3].forEach((z) => { s += `<g transform="translate(320 ${f1(py(380, z) - 2 / z)}) scale(1 .32)">${Gr.rozet(0, 0, 46 / z * 1.4, '#f3d27e', '#9a6a22', '#6f4a10', .85)}</g>`; });
    // sütunlar ve kemerler (derinlikten yakına)
    for (let i = Z.length - 1; i >= 0; i--) {
      const z = Z[i], w = 22 / z, xl = px(-300, z), xr = px(300, z), yb = py(380, z), ys = py(40, z), yt = py(-40, z);
      // kemer (sivri kemer, altın şerit)
      s += `<path d="M${f1(xl)} ${f1(ys)}Q${f1(xl)} ${f1(yt)} 320 ${f1(yt - 6 / z)}Q${f1(xr)} ${f1(yt)} ${f1(xr)} ${f1(ys)}" fill="none" stroke="url(#${id}s)" stroke-width="${f1(12 / z)}"/>`;
      s += `<path d="M${f1(xl + w)} ${f1(ys)}Q${f1(xl + w)} ${f1(yt + 14 / z)} 320 ${f1(yt + 8 / z)}Q${f1(xr - w)} ${f1(yt + 14 / z)} ${f1(xr - w)} ${f1(ys)}" fill="none" stroke="#e2b04b" stroke-width="${f1(1.5 / z)}" opacity=".6"/>`;
      // fener
      const fy = yt + 40 / z;
      s += `<path d="M320 ${f1(yt + 6 / z)}V${f1(fy - 9 / z)}" stroke="#b8862f" stroke-width="${f1(1 / z)}"/><circle cx="320" cy="${f1(fy)}" r="${f1(42 / z)}" fill="url(#${id}f)"/><path d="M${f1(320 - 7 / z)} ${f1(fy - 8 / z)}h${f1(14 / z)}l${f1(3 / z)} ${f1(8 / z)}l${f1(-10 / z)} ${f1(10 / z)}l${f1(-10 / z)} ${f1(-10 / z)}z" fill="#ffd27a" stroke="#a8711b" stroke-width="${f1(.8 / z)}"/>`;
      // sütunlar
      [[xl - w / 2, 1], [xr - w / 2, -1]].forEach(([x]) => { s += `<rect x="${f1(x)}" y="${f1(ys)}" width="${f1(w)}" height="${f1(yb - ys)}" fill="url(#${id}s)"/><rect x="${f1(x - w * 0.3)}" y="${f1(ys - 6 / z)}" width="${f1(w * 1.6)}" height="${f1(8 / z)}" rx="${f1(2 / z)}" fill="#d6a84a"/><rect x="${f1(x - w * 0.3)}" y="${f1(yb - 8 / z)}" width="${f1(w * 1.6)}" height="${f1(8 / z)}" fill="#a8711b"/>`; });
    }
    // ön plan: zümrüt kaide, açık kitap ve altın külçeler
    s += `<ellipse cx="320" cy="352" rx="150" ry="18" fill="#000" opacity=".45"/>`;
    s += `<path d="M206 300h228l14 52H192z" fill="url(#${id}m)"/><path d="M206 300h228" stroke="#e2b04b" stroke-width="2"/><path d="M192 352h256" stroke="#a8711b" stroke-width="2"/><path d="M214 312h212M210 340h220" stroke="#d6a84a" stroke-width=".8" opacity=".55"/>`;
    s += `<circle cx="320" cy="270" r="96" fill="url(#${id}f)" opacity=".55"/>`;
    s += `<g transform="translate(232 300)"><path d="M0 0c14-9 34-9 48-2 14-7 34-7 48 2l-3-24c-14-8-32-8-45 0-13-8-31-8-45 0z" fill="#f6ead0" stroke="#b98a3e" stroke-width="1.2"/><path d="M48-2v-24" stroke="#b98a3e"/><path d="M9-17c10-4 22-4 32 0M9-11c10-4 22-4 32 0M57-17c10-4 22-4 32 0M57-11c10-4 22-4 32 0" stroke="#c9a35a" stroke-width=".9" fill="none"/></g>`;
    s += kulce(332, 300, 60, id + 'k', true) + kulce(380, 300, 60, id + 'k', true) + kulce(356, 276, 60, id + 'k', true);
    s += `<circle cx="366" cy="258" r="2.6" fill="#fffbe8"/><circle cx="366" cy="258" r="7" fill="#fff1bf" opacity=".35"/>`;
    return s + '</svg>'; });

  Gr.kucuk = (k) => '<span class="g48-kap" style="display:block;overflow:hidden;width:100%;height:100%;border-radius:10px">' + (k === 'premium' ? Gr.altin('gk49a') : Gr.elmas('gk49e')).replace('class="g48 g49"', 'class="g48 g49 k"') + '</span>';
})();
