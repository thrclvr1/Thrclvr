'use strict';
/* =====================================================================================================
   Tanıtım videosu 2 (V51.8) — zaman çizelgesi. Motor: sahne2.html. Müzik: muzik.py yatay2 / dikey2 (120 BPM).
   İçerik kuralları: yalnız gerçek ekranlar (.kayit2/); yönetici/editör ekranı YOK; Altın Mod yalnız “Çok yakında”
   duyurusu (V51.7'deki gerçek Altın oyun ekranları yalnız kapının ardında bir bakış olarak); web yalnız “Çok Yakında Web'de”
   (uygulama ekranı olmayan boş bir tarayıcı çerçevesi).
   ===================================================================================================== */
const ALTIN = '#f2c46d', MAVI = '#8cc4ff', MAVI2 = '#4c8dff', YESIL = '#22c55e', OGR = '#334e68', INK = '#1e293b';
PAL.altinKoyu = { a: [5, 3, 1], b: [46, 28, 7], p: [255, 206, 120], n: 1.5, isik: [255, 190, 90] };
const T3 = (ekran, k) => R(ekran, k, 3), T2 = (ekran, k) => R(ekran, k, 2);
const px3 = (r) => r.map((v) => v * 3), px2 = (r) => r.map((v) => v * 2);
const merkezY = (r) => r[1] + r[3] / 2, merkezX = (r) => r[0] + r[2] / 2;
const dizi = (ad, u) => kare(ad, u);                     // u: kare sırası (meta yoksa) ya da 0..1 (meta varsa)

/* ---------------- ek öğeler: altın kapı, tarayıcı çerçevesi ---------------- */
let KAPI = null, WEB = null;
function kapiKur() {
  if (KAPI) return KAPI;
  const el = document.createElement('div'); el.id = 'kapi2';
  el.innerHTML = `<canvas class="ic" width="1040" height="1440"></canvas><div class="kanat sol"><i></i><i></i></div><div class="kanat sag"><i></i><i></i></div><div class="kemer"></div>`;
  const st = document.createElement('style');
  st.textContent = `#kapi2{position:absolute;left:50%;top:50%;width:520px;height:720px;transform-style:preserve-3d;display:none}
#kapi2 .ic{position:absolute;inset:0;width:100%;height:100%;border-radius:260px 260px 0 0;transform:translateZ(-2px)}
#kapi2 .kanat{position:absolute;top:0;width:50%;height:100%;box-sizing:border-box;background:linear-gradient(160deg,#5a3a10 0%,#c9963f 18%,#f3d58f 32%,#a7752a 50%,#6b4615 72%,#d2a24f 100%);
 border:3px solid #f3d58f;box-shadow:inset 0 0 40px rgba(0,0,0,.45),inset 0 0 0 10px rgba(60,38,8,.35);backface-visibility:hidden}
#kapi2 .kanat.sol{left:0;border-radius:260px 0 0 0;transform-origin:0 50%}
#kapi2 .kanat.sag{right:0;border-radius:0 260px 0 0;transform-origin:100% 50%}
#kapi2 .kanat i{position:absolute;left:22%;right:22%;border:2px solid rgba(255,236,180,.55);border-radius:8px;box-shadow:inset 0 0 18px rgba(0,0,0,.35)}
#kapi2 .kanat i:nth-child(1){top:30%;height:26%}#kapi2 .kanat i:nth-child(2){top:62%;height:30%}
#kapi2 .kanat.sol i{border-top-left-radius:60px}#kapi2 .kanat.sag i{border-top-right-radius:60px}
#kapi2 .kemer{position:absolute;inset:-26px -26px 0 -26px;border:14px solid transparent;border-bottom:0;border-radius:290px 290px 0 0;
 background:linear-gradient(#000,#000) padding-box,linear-gradient(170deg,#fff1c9,#c9963f 35%,#6b4615 65%,#e7c277) border-box;-webkit-mask:linear-gradient(#000 0 0) border-box,linear-gradient(#000 0 0) padding-box;-webkit-mask-composite:xor;mask-composite:exclude;
 filter:drop-shadow(0 0 30px rgba(241,198,106,.55))}
#web2{position:absolute;left:50%;top:50%;width:1000px;height:600px;border-radius:22px;display:none;box-sizing:border-box;overflow:hidden;
 background:linear-gradient(160deg,rgba(255,255,255,.12),rgba(255,255,255,.04));border:1px solid rgba(200,220,255,.45);box-shadow:0 40px 120px rgba(0,0,0,.55),0 0 0 1px rgba(0,0,0,.3);backdrop-filter:blur(6px)}
#web2 .ust{height:54px;display:flex;align-items:center;gap:10px;padding:0 20px;background:rgba(10,20,40,.55);border-bottom:1px solid rgba(200,220,255,.25)}
#web2 .ust i{width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.35)}
#web2 .ust b{flex:1;margin-left:16px;height:28px;border-radius:14px;background:rgba(255,255,255,.12)}
#web2 .gov{position:absolute;inset:54px 0 0 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;
 background:radial-gradient(70% 70% at 50% 45%,rgba(76,141,255,.35),rgba(8,18,40,.2) 70%)}
#web2 .gov img{width:120px;height:120px;filter:drop-shadow(0 0 24px rgba(245,170,80,.5))}
#web2 .gov h3{margin:0;font:700 64px/1 'Inter Display','Inter';letter-spacing:-.02em;color:#fff;text-shadow:0 4px 30px rgba(76,141,255,.6)}
#web2 .gov p{margin:0;font:500 26px 'Inter';color:#cfe0ff;letter-spacing:.2em}`;
  document.head.appendChild(st);
  dunya.appendChild(el); KAPI = {el, ic: el.querySelector('.ic'), g: el.querySelector('.ic').getContext('2d'), sol: el.querySelector('.sol'), sag: el.querySelector('.sag'), kemer: el.querySelector('.kemer')};
  const w = document.createElement('div'); w.id = 'web2';
  w.innerHTML = `<div class="ust"><i></i><i></i><i></i><b></b></div><div class="gov"><img src=".kayit2/emb.png" alt=""><h3>Çok Yakında Web’de</h3><p>TARAYICIDAN ERİŞİM HAZIRLANIYOR</p></div>`;
  dunya.appendChild(w); WEB = w;
  return KAPI;
}
function kapi(o) {
  const K = kapiKur();
  if (!o || o.a <= 0) { K.el.style.display = 'none'; return; }
  K.el.style.display = 'block'; K.el.style.opacity = o.a;
  K.el.style.transform = `translate(-50%,-50%) translate3d(${o.x || 0}px,${o.y || 0}px,${o.z || 0}px) rotateY(${o.ry || 0}deg) scale(${o.s || 1})`;
  K.el.style.filter = (o.bl || 0) > .05 ? `blur(${o.bl}px)` : 'none';
  K.sol.style.transform = `rotateY(${-(o.ac || 0) * 105}deg)`; K.sag.style.transform = `rotateY(${(o.ac || 0) * 105}deg)`;
  // kapının ardı: altın ışık + Altın Mod'un gerçek oyun ekranlarından derinlikte süzülen kartlar
  const g = K.g, W = 1040, H = 1440, t = o.t;
  g.clearRect(0, 0, W, H);
  const rg = g.createRadialGradient(W / 2, H * .55, 0, W / 2, H * .55, H * .75);
  rg.addColorStop(0, `rgba(255,244,210,${.95 * (o.isik ?? 1)})`); rg.addColorStop(.35, `rgba(241,190,95,${.75 * (o.isik ?? 1)})`); rg.addColorStop(1, 'rgba(60,34,6,1)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  if (o.kartlar) for (const k of o.kartlar) {
    if (!k.im || k.a <= 0) continue;
    const kw = 1170 * .34 * k.s, kh = 2532 * .34 * k.s;
    g.save(); g.globalAlpha = k.a; g.translate(W / 2 + k.x, H * .52 + k.y); g.rotate(k.r || 0);
    g.shadowColor = 'rgba(255,200,110,.8)'; g.shadowBlur = 40;
    g.beginPath(); g.roundRect(-kw / 2, -kh / 2, kw, kh, 26 * k.s); g.clip();
    g.drawImage(k.im, -kw / 2, -kh / 2, kw, kh);
    g.fillStyle = `rgba(255,205,120,${.18 + .2 * (1 - k.a)})`; g.fillRect(-kw / 2, -kh / 2, kw, kh);
    g.restore();
  }
  // parlama perdesi (kapı açılırken ışık her şeyi örter)
  if (o.perde > 0) { g.fillStyle = `rgba(255,246,220,${o.perde})`; g.fillRect(0, 0, W, H); }
}
function web(o) {
  kapiKur();
  if (!o || o.a <= 0) { WEB.style.display = 'none'; return; }
  WEB.style.display = 'block'; WEB.style.opacity = o.a;
  WEB.style.transform = `translate(-50%,-50%) translate3d(${o.x || 0}px,${o.y || 0}px,${o.z || 0}px) rotateX(${o.rx || 0}deg) rotateY(${o.ry || 0}deg) scale(${o.s || 1})`;
  WEB.style.filter = (o.bl || 0) > .05 ? `blur(${o.bl}px)` : 'none';
}
/* yöntem çipleri (o an anlatılan parlak) */
function cipler(id, t, t0, t1, o) {
  const a = Z(t, t0, t1, .5, .45); if (a <= 0) return;
  const h = o.ogeler.map((m, i) => `<span style="display:inline-block;margin:0 10px 12px 0;padding:10px 20px;border-radius:999px;font:600 ${o.fs || 22}px 'Inter';${i === o.aktif ? `background:${o.vurgu};color:#06122b;box-shadow:0 0 24px ${o.vurgu}` : 'background:rgba(255,255,255,.08);color:rgba(230,240,255,.75);border:1px solid rgba(255,255,255,.18)'}">${m}</span>`).join('');
  yazi(id, { h, c: 'alt', x: o.x, y: o.y, a, gen: o.gen || 640, ty: (1 - E.o(clamp((t - t0) / .6, 0, 1))) * 20, renk: '#fff', hiza: o.hiza, fs: o.fs || 22 });
}

/* =========================================== YATAY 16:9, 120 sn =========================================== */
const Y2 = [];
const s2 = (t0, t1, f) => Y2.push({ t0, t1, f });

/* S1 · 0–8 açılış */
s2(0, 8.3, (t) => {
  logo({ a: K(t, [[1.3, 0], [2.3, 1], [7.6, 1], [8.1, 0, 'i']]), s: K(t, [[1.3, .82], [3.0, 1, 'o'], [6.9, 1.05, 'l'], [8.1, 6.5, 'i']]), y: -110,
    bl: K(t, [[1.3, 18], [2.6, 0, 'o'], [7.3, 0], [8.1, 16, 'i']]), sup: K(t, [[2.5, -0.2], [3.9, 1.2]]), parA: K(t, [[2, 0], [3, .55], [7, .45]]) });
  const ya = K(t, [[7.0, 1], [7.6, 0]]), yb = K(t, [[7.0, 0], [7.6, 10]]), tg = clamp((t - 3.2) / .9, 0, 1);
  yazi('a1t', { h: 'DKAB ÖĞRENME PLATFORMU', c: 'etiket', x: 0, y: 115, hiza: 'orta', a: E.o(tg) * ya, ls: (0.62 - .3 * E.o(tg)) + 'em', renk: ALTIN, bl: yb, fs: 22 });
  kelimeler('a1k', t, 4.2, 'Öğrenmenin yeni yolu.', { y: 215, a: ya, bl: yb, ara: .34, fs: 72 });
});

/* S2 · 8–20 platform + Elmas: sınıf → ünite → konu */
s2(7.8, 20.4, (t) => {
  const c = cihaz('tel');
  const kartlar = ['ders', 'oyun', 'calis', 'profil'].map((k) => T3('e_ana', k));
  const ak = t >= 10.4 && t < 12.4 ? Math.min(3, Math.floor((t - 10.4) / .5)) : -1;
  const kz = K(t, [[10.0, 1], [10.6, 1.15], [11.9, 1.15], [12.2, 1]]);
  const k = [{ im: IM.e_ana, z: kz, cy: K(t, [[10.0, 1266], [10.6, 1100]]) },
    { im: IM.e_siniflar, a: K(t, [[12.0, 0], [12.3, 1]]), dx: K(t, [[12.0, .3], [12.35, 0, 'o']]) },
    { im: IM.e_sinif5, a: K(t, [[14.0, 0], [14.3, 1]]), dx: K(t, [[14.0, .3], [14.35, 0, 'o']]), z: K(t, [[14.4, 1], [15.4, 1.2]]), cy: K(t, [[14.4, 1266], [15.4, 700]]) },
    { im: IM.e_sinif5_unite, a: K(t, [[16.5, 0], [16.8, 1]]), dx: K(t, [[16.5, .3], [16.85, 0, 'o']]), z: K(t, [[17.0, 1], [18.0, 1.3]]), cy: K(t, [[17.0, 1266], [18.0, merkezY(T3('e_sinif5_unite', 'konu')) + 200]]) }];
  const hl = [];
  if (ak >= 0) hl.push({ r: kartlar[ak], a: Z(t, 10.4 + ak * .5, 10.9 + ak * .5, .1, .1), renk: MAVI2 });
  hl.push({ r: T3('e_siniflar', 's5'), a: Z(t, 12.8, 14.0, .25, .2), renk: MAVI2 });
  hl.push({ r: T3('e_sinif5', 'hero'), a: Z(t, 15.0, 16.4, .25, .2), renk: MAVI2 });
  hl.push({ r: T3('e_sinif5_unite', 'konu'), a: Z(t, 18.0, 19.6, .25, .2), renk: MAVI2 });
  let dok = null;
  if (t >= 13.4 && t < 13.9) dok = { x: 287, y: 218, p: (t - 13.4) / .5 };
  if (t >= 18.6 && t < 19.1) dok = { x: 195, y: 324, p: (t - 18.6) / .5 };
  yerlestir(c, {
    x: K(t, [[8, 330], [19.6, 330]]), y: K(t, [[8, 1000], [9.6, 0, 'o'], [19.0, 0], [20.2, 60]]), z: K(t, [[19.2, 0], [20.3, -800, 'i']]),
    rx: K(t, [[8, 42], [9.6, 6, 'o'], [19, 2]]), ry: K(t, [[8, -32], [9.6, -14, 'o'], [19, -6]]), rz: K(t, [[8, 6], [9.6, 0, 'o']]),
    s: K(t, [[8, .92], [9.6, 1, 'o']]), a: K(t, [[19.7, 1], [20.3, 0]]), bl: K(t, [[19.3, 0], [20.2, 16, 'i']]), cer: 'mavi',
    ek: { k, hl, dok, sup: { p: K(t, [[9.4, -0.4], [10.6, 1.4]]), renk: [200, 225, 255] } }
  });
  blok('a2a', t, 8.7, 12.2, { x: -830, y: -90, etiket: 'Elmas Mod', baslik: 'Her şey<br>tek uygulamada', alt: 'Din Kültürü ve Ahlak Bilgisi · 4–12. sınıf', vurgu: MAVI, altY: 140 });
  blok('a2b', t, 12.3, 19.8, { x: -830, y: -230, etiket: 'Konu öğrenme sistemi', baslik: 'Konuya üç adımda ulaş', vurgu: MAVI, bfs: 54 });
  liste('a2l', t, 12.5, 19.8, { x: -830, y: -80, ogeler: ['Sınıfını seç', 'Üniteni bul', 'Konuyu aç'], aktif: t < 14.2 ? 0 : t < 16.6 ? 1 : 2, vurgu: MAVI2, renk: '#cfe0ff', ara: 72, fs: 38 });
});

/* S3 · 20–46 farklı öğrenme yöntemleri */
const YONTEM = [
  { t0: 20.0, t1: 26.0, ad: 'Konu Anlatımı', no: '01', alt: 'Konuyu baştan sona, anlaşılır biçimde öğren.' },
  { t0: 26.0, t1: 30.0, ad: 'Konu Özeti', no: '02', alt: 'Önemli bilgiler kısa ve düzenli.', im: 'k_ozet' },
  { t0: 30.0, t1: 34.0, ad: '30 Saniyede Öğren', no: '03', alt: 'En önemli noktaları hızla hatırla.', im: 'k_otuz' },
  { t0: 34.0, t1: 38.0, ad: 'Hikâyeler', no: '04', alt: 'Konuyu bir hikâyeyle anla, kolayca hatırla.', im: 'k_hik' },
  { t0: 38.0, t1: 42.0, ad: 'Kodlamalar', no: '05', alt: 'Kısa kodlarla bilgiyi akılda tut.', im: 'k_kod' },
  { t0: 42.0, t1: 46.0, ad: 'Arama', no: '', alt: 'Konu, kavram, kişi, soru ve karta saniyeler içinde ulaş.' }
];
s2(19.8, 46.3, (t) => {
  const c = cihaz('tel');
  const i = YONTEM.findIndex((y) => t >= y.t0 && t < y.t1), Y = YONTEM[Math.max(0, i)];
  const k = [], hl = []; let dok = null;
  // 01 anlatım: başlığa yaklaş → metni oku (gerçek kaydırma) ; 02–05 sekmeler ; 06 arama
  if (t < 26.4) {
    const bas = T3('k_anlat', 'baslik');
    k.push({ im: IM.k_anlat, z: K(t, [[20.4, 1], [21.3, 1.45], [21.8, 1.45]]), cy: K(t, [[20.4, 1266], [21.3, merkezY(bas) + 120]]), a: K(t, [[21.8, 1], [22.1, 0]]) });
    const u = K(t, [[22.0, 0], [25.6, 59, 'io']]);
    k.push({ im: dizi('k_anlat_kaydir', u), a: K(t, [[21.8, 0], [22.1, 1]]), z: K(t, [[22.0, 1.05], [24.0, 1.3], [25.8, 1.3]]), cx: 600, cy: K(t, [[22.0, 1266], [24.0, 1500]]) });
    hl.push({ r: T3('k_anlat', 'seg'), a: Z(t, 20.5, 21.2, .2, .2), renk: MAVI2 });
  }
  YONTEM.slice(1, 5).forEach((y) => {
    if (t < y.t0 - .2 || t > y.t1 + .5) return;
    const gir = clamp((t - y.t0) / .45, 0, 1), sek = T3(y.im, 'sekme');
    k.push({ im: IM[y.im], a: E.o(gir), z: K(t, [[y.t0, 1.25], [y.t0 + .45, 1, 'o'], [y.t0 + 1.6, 1, 'io'], [y.t0 + 2.6, 1.28], [y.t1, 1.32, 'l']]), cy: K(t, [[y.t0 + 1.6, 1266], [y.t0 + 2.6, 1500]]) });
    hl.push({ r: sek, a: Z(t, y.t0 + .5, y.t0 + 1.6, .2, .25), renk: MAVI2 });
  });
  if (t >= 41.8) {
    const u = clamp((t - 42.4) / 2.3, 0, 1), kutu = T3('e_arama', 'kutu'), son = T3('e_arama', 'sonuc');
    k.push({ im: dizi('e_arama', u), a: K(t, [[41.8, 0], [42.25, 1]]), z: K(t, [[42.2, 1.3], [44.6, 1.3], [45.2, 1.12]]), cx: K(t, [[44.6, merkezX(kutu)], [45.2, 585]]), cy: K(t, [[42.2, merkezY(kutu) + 500], [44.6, merkezY(kutu) + 500], [45.2, 1300]]) });
    hl.push({ r: kutu, a: Z(t, 42.4, 44.6, .25, .25), renk: MAVI2 }, { r: [48, 879, 1074, 1000], a: Z(t, 44.9, 46.0, .25, .2), renk: MAVI2 });
  }
  // geçiş biçimleri: 26 yakınlaşma, 30 3B çevirme, 34 itme, 38 ışık süpürmesi, 42 3B çevirme
  let ry = K(t, [[20, -10], [46, -4]]), x = 330;
  for (const tb of [30.0, 42.0]) if (t > tb - .3 && t < tb + .3) ry = t < tb ? K(t, [[tb - .3, -8], [tb, -90, 'i']]) : K(t, [[tb, 90], [tb + .3, -8, 'o']]);
  if (t > 33.75 && t < 34.35) x = t < 34.0 ? K(t, [[33.75, 330], [34.0, -1300, 'i']]) : K(t, [[34.0, 1500], [34.35, 330, 'o']]);
  yerlestir(c, {
    x, y: 0, rx: 3, ry, z: K(t, [[19.8, -800], [20.5, 0, 'o'], [45.6, 0], [46.3, 700, 'i']]), s: 1,
    a: K(t, [[19.8, 0], [20.2, 1], [45.8, 1], [46.3, 0]]), bl: Math.max(K(t, [[19.8, 14], [20.5, 0, 'o']]), K(t, [[45.7, 0], [46.3, 16, 'i']]), t > 33.8 && t < 34.3 ? 7 : 0), cer: 'mavi',
    ek: { k, hl, dok, sup: t > 37.7 && t < 39.2 ? { p: K(t, [[37.8, -0.4], [39.0, 1.4]]), renk: [200, 230, 255] } : null }
  });
  yazi('a3h', { h: 'FARKLI ÖĞRENME YÖNTEMLERİ', c: 'etiket', x: -840, y: -330, a: Z(t, 20.2, 41.8, .5, .4), renk: MAVI, fs: 20 });
  yazi('a3s', { h: t < 34 ? 'Sadece okuma: keşfederek öğren.' : 'Kodla, hikâyeyle, kartlarla öğren.', c: 'alt', x: -840, y: -280, a: Z(t, 20.4, 41.8, .5, .4) * .85, gen: 640, fs: 26, renk: '#dbe8ff' });
  YONTEM.forEach((y, j) => blok('a3m' + j, t, y.t0 + .05, y.t1, { x: -840, y: -70, etiket: y.no ? y.no + ' · Öğrenme yöntemi' : 'Ara ve bul', baslik: y.ad, alt: y.alt, vurgu: MAVI, altY: 96, bfs: 62, altGen: 600 }));
  cipler('a3c', t, 20.6, 41.8, { x: -840, y: 200, ogeler: ['Anlatım', 'Özet', '30 Saniyede', 'Hikâye', 'Kodlama'], aktif: i, vurgu: MAVI, gen: 640 });
});

/* S4 · 46–62 kartlar, kavramlar, kişiler-eserler, sınav, test */
s2(45.8, 62.3, (t) => {
  const c = cihaz('tel'), sol = cihaz('tel'), sag = cihaz('tel');
  const k = [], hl = []; let dok = null, x = 330, ry = -8, s = 1, a = 1, bl = 0;
  if (t < 50.2) {                                   // bilgi kartı: çevir
    k.push({ im: t < 48.0 ? IM.k_kart_soru : IM.k_kart_cevap, z: 1.12, cy: 1300 });
    ry = t < 47.8 ? K(t, [[46.2, 6], [47.8, -4]]) : t < 48.0 ? K(t, [[47.8, -4], [48.0, 90, 'i']]) : K(t, [[48.0, -90], [48.3, -6, 'o']]);
    if (t >= 47.3 && t < 47.8) dok = { x: 195, y: 600, p: (t - 47.3) / .5 };
    s = K(t, [[45.8, 1.3], [46.3, 1, 'o']]); bl = Math.max(K(t, [[45.8, 14], [46.3, 0, 'o']]), t > 49.8 ? 8 : 0);
    a = K(t, [[49.8, 1], [50.2, 0]]);
  } else if (t < 56.0) { a = 0; }                   // bölünmüş ekran: iki telefon
  else if (t < 58.6) {                              // sınav odaklı
    const r = T3('k_sin', 'sekme');
    k.push({ im: IM.k_sin, z: K(t, [[56.2, 1], [57.2, 1.25]]), cy: K(t, [[56.2, 1266], [57.2, 1450]]) });
    hl.push({ r, a: Z(t, 56.3, 57.0, .2, .2), renk: MAVI2 });
    s = K(t, [[55.8, 1.25], [56.3, 1, 'o']]); bl = K(t, [[55.8, 12], [56.3, 0, 'o']]);
  } else {                                          // mini test → doğru
    const fi = t < 58.9 ? 0 : t < 59.2 ? 1 : t < 60.2 ? 2 : 3, geri = px3([16, 612, 358, 175]);
    k.push({ im: SEQ.k_test.im[fi], z: fi === 3 ? K(t, [[60.4, 1], [61.0, 1.08]]) : 1, cy: fi === 3 ? K(t, [[60.4, 1266], [61.0, merkezY(geri)]]) : undefined });
    if (fi === 3) hl.push({ r: geri, a: Z(t, 60.6, 62.0, .25, .2), renk: YESIL });
    if (t >= 59.75 && t < 60.25) dok = { x: 195, y: 522, p: (t - 59.75) / .5 };
    ry = t < 58.9 ? K(t, [[58.6, 70], [58.9, -6, 'o']]) : -6;
    a = K(t, [[61.7, 1], [62.2, 0]]); bl = K(t, [[61.6, 0], [62.2, 14, 'i']]); s = K(t, [[61.5, 1], [62.2, 1.3, 'i']]);
  }
  if (a > 0) yerlestir(c, { x, y: 0, rx: 3, ry, s, a, bl, cer: 'mavi', ek: { k, hl, dok } });
  // 50–56: Kavramlar | Kişiler ve Eserler
  const sg = K(t, [[50.0, 0], [50.6, 1, 'o']]), sc = K(t, [[55.4, 0], [56.0, 1, 'i']]);
  if (t >= 50.0 && t < 56.1) {
    yerlestir(sol, { x: -430 - sc * 300, y: 40 + (1 - sg) * -1100, rx: 3, ry: 10, s: .86, a: 1 - sc, bl: sc * 12, cer: 'mavi', ek: { k: [{ im: IM.e_kavram, z: K(t, [[51, 1], [53, 1.15]]), cy: K(t, [[51, 1266], [53, 1350]]) }] } });
    yerlestir(sag, { x: 430 + sc * 300, y: 40 + (1 - sg) * 1100, rx: 3, ry: -10, s: .86, a: 1 - sc, bl: sc * 12, cer: 'mavi', ek: { k: [{ im: IM.e_kisi, a: K(t, [[53.2, 1], [53.5, 0]]) }, { im: IM.e_kisi_liste, a: K(t, [[53.2, 0], [53.5, 1]]) }] } });
    const aa = Z(t, 50.4, 55.8, .5, .4);
    yazi('a4k', { h: '<span style="opacity:.7;font-size:.55em;letter-spacing:.2em">07 · SÖZLÜK</span><br>Kavramlar', c: 'baslik', x: -430, y: -480, hiza: 'orta', a: aa, fs: 46 });
    yazi('a4p', { h: '<span style="opacity:.7;font-size:.55em;letter-spacing:.2em">08 · SÖZLÜK</span><br>Kişiler ve Eserler', c: 'baslik', x: 430, y: -480, hiza: 'orta', a: aa, fs: 46 });
    yazi('a4a', { h: 'Her kayıt geçtiği konuyla bağlantılı', c: 'alt', x: 0, y: 492, hiza: 'orta', a: aa, gen: 900, fs: 28 });
  }
  blok('a4b', t, 46.2, 50.0, { x: -840, y: -60, etiket: '06 · Pekiştir', baslik: 'Bilgi Kartları', alt: 'Çevir, hatırla, tekrar et. Biliyorum, kararsızım ya da tekrar etmeliyim diye işaretle.', vurgu: MAVI, altY: 96, altGen: 600 });
  blok('a4c', t, 56.2, 58.6, { x: -840, y: -60, etiket: '09 · Sınav odaklı', baslik: 'Sınavlara daha<br>bilinçli hazırlan', alt: 'Bilmen gereken, sık karıştırılan ve dikkat edilecek noktalar', vurgu: MAVI, altY: 140, altGen: 600, bfs: 58 });
  blok('a4d', t, 58.7, 61.9, { x: -840, y: -60, etiket: '10 · Test ve sorular', baslik: 'Öğrendiğini ölç,<br>eksiğini gör', alt: 'Mini test, karma test ve yanlışlarım · 723 soru', vurgu: '#4ade80', altY: 140, altGen: 600, bfs: 58 });
});

/* S5 · 62–75 oyunlar ve etkinlikler */
s2(61.8, 75.3, (t) => {
  const c = cihaz('tel'), f1 = cihaz('tel'), f2 = cihaz('tel'), f3 = cihaz('tel');
  const k = [], hl = []; let dok = null, ry = -10, x = 330, a = 1, bl = 0, s = 1;
  if (t < 64.2) {
    k.push({ im: IM.e_oyunlar, a: K(t, [[63.0, 1], [63.3, 0]]) }, { im: IM.e_oyunlar_turler, a: K(t, [[63.0, 0], [63.3, 1]]), z: K(t, [[63.2, 1], [64.2, 1.12]]) });
    s = K(t, [[61.8, 1.35], [62.15, 1, 'o']]); bl = K(t, [[61.8, 18], [62.15, 0, 'o']]); ry = K(t, [[62, -18], [64, -8]]);
  } else if (t < 67.2) {
    const u = clamp((t - 64.0) / 3.0, 0, 1);
    k.push({ im: dizi('g_esles', u), z: K(t, [[64.2, 1.05], [66.0, 1.18]]), cy: K(t, [[64.2, 1300], [66.0, 1350]]) });
    hl.push({ r: T3('g_esles', 'hud'), a: Z(t, 66.0, 67.1, .2, .1), renk: ALTIN });
    x = K(t, [[64.0, 1400], [64.3, 330, 'o'], [66.9, 330], [67.15, -1400, 'i']]); bl = (t < 64.25 || t > 66.95) ? 8 : 0; ry = K(t, [[64.3, -14], [67, -4]]);
  } else if (t < 69.7) {
    k.push({ im: t < 68.3 ? IM.g_quiz_soru : IM.g_quiz_dogru, z: K(t, [[67.4, 1], [68.6, 1.15]]), cy: K(t, [[67.4, 1266], [68.6, 1100]]) });
    if (t >= 67.85 && t < 68.35) dok = { x: 195, y: 382, p: (t - 67.85) / .5 };
    x = K(t, [[67.0, 1400], [67.3, -330, 'o'], [69.4, -330], [69.65, 1400, 'i']]); ry = K(t, [[67.3, 14], [69.4, 4]]); bl = (t < 67.25 || t > 69.45) ? 8 : 0;
  } else if (t < 72.7) {
    const fr = clamp(Math.floor((t - 69.5) * 30), 0, 89);
    k.push({ im: dizi('g_cark_don', fr), z: K(t, [[69.7, 1.05], [71.0, 1.22], [72.6, 1.22]]), cy: K(t, [[69.7, 1266], [71.0, 750], [71.9, 750], [72.5, 1000]]) });
    x = K(t, [[69.5, 1400], [69.8, 330, 'o']]); ry = K(t, [[69.8, -12], [72.6, -2]]); bl = t < 69.75 ? 8 : 0; a = K(t, [[72.4, 1], [72.7, 0]]);
  } else a = 0;
  if (a > 0) yerlestir(c, { x, y: 0, rx: 3, ry, s, a, bl, cer: 'mavi', ek: { k, hl, dok } });
  if (t >= 72.4) {
    const g = (d) => K(t, [[72.5 + d, 0], [73.1 + d, 1, 'o']]), cik = K(t, [[74.6, 0], [75.3, 1, 'i']]);
    [[f1, IM.g_kelime, -560, -14, 0], [f2, IM.g_sirala, 0, 0, .12], [f3, IM.g_grup, 560, 14, .24]].forEach(([d, im, px, rr, gd]) => {
      yerlestir(d, { x: px * (1 + cik * .4), y: 50 + (1 - g(gd)) * 900, rx: 4, ry: -rr * .6, rz: rr * .25, s: .82 * (1 + cik * .4), a: g(gd) * (1 - cik), bl: cik * 14, cer: 'mavi', ek: { k: [{ im, z: 1.05, cy: 1150 }] } });
    });
    yazi('a5t', { h: 'Kelime avı · Sıralama · Gruplandırma', c: 'baslik', x: 0, y: -480, hiza: 'orta', a: Z(t, 72.7, 74.8, .4, .3), fs: 44 });
    yazi('a5u', { h: 'Süreli ya da süresiz oyna, puanını yükselt', c: 'alt', x: 0, y: 492, hiza: 'orta', a: Z(t, 72.9, 74.8, .4, .3), gen: 1000, fs: 28 });
  }
  blok('a5a', t, 62.2, 67.0, { x: -840, y: -70, etiket: 'Etkinlik oyunları', baslik: 'Öğrenirken<br>eğlen', alt: '525 etkinlik · 12 oyun türü · puan ve ilerleme', vurgu: ALTIN, altY: 140, altGen: 600 });
  blok('a5b', t, 67.3, 69.6, { x: 180, y: -60, etiket: 'Doğru cevabı bul', baslik: 'Her cevapta<br>anında sonuç', vurgu: ALTIN, altY: 140 });
  blok('a5c', t, 69.8, 72.4, { x: -840, y: -60, etiket: 'Çarkıfelek', baslik: 'Çarkı çevir,<br>soruyu yanıtla', vurgu: ALTIN, altY: 140 });
});

/* S6 · 75–87 telefon, tablet, yakında web */
s2(74.8, 87.3, (t) => {
  const tel = cihaz('tel'), tab = cihaz('tabd');
  const gir = K(t, [[74.9, 0], [76.0, 1, 'o']]), kay = K(t, [[82.8, 0], [84.0, 1, 'io']]), cik = K(t, [[86.4, 0], [87.2, 1, 'i']]);
  yerlestir(tel, { x: -470 - kay * 420, y: 60 + (1 - gir) * 900, rx: 4, ry: K(t, [[75, 24], [82, 10]]), s: .9, a: 1 - kay * .9, bl: kay * 8, cer: 'mavi',
    ek: { k: [{ im: IM.e_ana }, { im: IM.k_otuz, a: K(t, [[79.8, 0], [80.2, 1]]), dx: K(t, [[79.8, .3], [80.2, 0, 'o']]) }] } });
  yerlestir(tab, { x: 230 + kay * 560, y: 30 + (1 - gir) * -900, rx: 4, ry: K(t, [[75, -22], [82, -8]]), s: .98, a: 1 - kay * .9, bl: kay * 8, cer: 'mavi',
    ek: { k: [{ im: IM.b_konu }, { im: IM.b_oyunlar, a: K(t, [[79.8, 0], [80.2, 1]]), dx: K(t, [[79.8, .3], [80.2, 0, 'o']]) }], ol: 2 } });
  web({ a: K(t, [[83.2, 0], [83.9, 1]]) * (1 - cik), x: 0, y: 40, z: K(t, [[83.2, -500], [84.2, 0, 'o'], [86.4, 80]]), rx: 4, ry: K(t, [[83.2, -20], [84.3, -4, 'o'], [86.4, 4]]), s: .92, bl: K(t, [[83.2, 10], [84.0, 0]]) + cik * 12 });
  const aa = Z(t, 75.6, 83.0, .5, .4);
  yazi('a6a', { h: 'Telefonunda, tabletinde.', c: 'baslik', x: 0, y: -478, hiza: 'orta', a: aa, fs: 54 });
  yazi('a6b', { h: 'TELEFON', c: 'etiket', x: -470, y: 488, hiza: 'orta', a: aa, renk: MAVI, fs: 20 });
  yazi('a6c', { h: 'TABLET', c: 'etiket', x: 230, y: 488, hiza: 'orta', a: aa, renk: MAVI, fs: 20 });
  yazi('a6d', { h: 'Aynı içerik, aynı ilerleme; geniş ekranda daha rahat', c: 'alt', x: 0, y: -400, hiza: 'orta', a: Z(t, 76.2, 83.0, .5, .4), gen: 1000, fs: 26, renk: '#cfe0ff' });
  yazi('a6w', { h: 'WEB SÜRÜMÜ HENÜZ KULLANIMDA DEĞİL', c: 'etiket', x: 0, y: 420, hiza: 'orta', a: Z(t, 84.3, 86.6, .4, .3), renk: MAVI, fs: 18 });
});

/* S7 · 87–99 Öğretmen Modu: kazanım takibi (yalnız öğretmen ekranları; yönetici/editör yok) */
s2(86.8, 99.3, (t) => {
  const tab = cihaz('tabd');
  const hafta = T2('t_haftalik', 'hafta'), serit = px2([119, 366, 671, 80]), kaz = px2([117, 708, 673, 318]), sin = px2([124, 360, 330, 262]), gor = px2([112, 410, 678, 410]);
  const k = [
    { im: IM.t_haftalik, z: K(t, [[87.6, 1], [88.6, 1.45], [90.4, 1.45], [91.2, 1.2]]), cx: K(t, [[87.6, 820], [88.6, merkezX(hafta)], [90.4, merkezX(hafta)], [91.2, merkezX(kaz)]]), cy: K(t, [[87.6, 1180], [88.6, merkezY(serit) + 160], [90.4, merkezY(serit) + 160], [91.2, merkezY(kaz) - 60]]) },
    { im: IM.t_siniflar, a: K(t, [[94.0, 0], [94.3, 1]]), dx: K(t, [[94.0, .25], [94.35, 0, 'o']]), z: K(t, [[94.3, 1], [95.2, 1.45]]), cx: K(t, [[94.3, 820], [95.2, merkezX(sin) + 120]]), cy: K(t, [[94.3, 1180], [95.2, merkezY(sin)]]) },
    { im: IM.t_gorunum, a: K(t, [[96.5, 0], [96.8, 1]]), dx: K(t, [[96.5, .25], [96.85, 0, 'o']]), z: K(t, [[96.8, 1], [97.7, 1.35]]), cy: K(t, [[96.8, 1180], [97.7, merkezY(gor)]]) }
  ];
  const hl = [{ r: hafta, a: Z(t, 88.7, 90.4, .25, .2), renk: '#a0672b' }, { r: kaz, a: Z(t, 91.3, 94.0, .3, .2), renk: '#a0672b' }];
  if (t >= 94.0) hl.push({ r: sin, a: Z(t, 95.2, 96.5, .25, .2), renk: '#a0672b' });
  if (t >= 96.5) hl.push({ r: gor, a: Z(t, 97.7, 99.0, .25, .2), renk: '#a0672b' });
  yerlestir(tab, { x: K(t, [[86.8, 1500], [87.6, 300, 'o']]), y: 20, rx: 3, ry: K(t, [[86.8, -34], [87.6, -10, 'o'], [98.6, -4]]), s: 1.0, cer: 'acik', golgeA: .22, cam: .05,
    bl: K(t, [[86.8, 12], [87.6, 0, 'o'], [98.6, 0], [99.2, 12]]), a: K(t, [[98.7, 1], [99.2, 0]]), ek: { k, hl, zemin: '#f6efe2', ol: 2 } });
  yazi('a7u', { h: 'ÖĞRETMENLER İÇİN', c: 'etiket', x: -880, y: -430, a: Z(t, 87.2, 98.8, .4, .3), renk: OGR, golge: false, fs: 18 });
  blok('a7a', t, 87.4, 90.8, { x: -880, y: -90, etiket: 'Öğretmen Modu', baslik: 'Haftalık<br>ders planı', alt: 'Yıllık plandan hafta hafta ünite, konu ve kazanım', vurgu: OGR, renk: INK, golge: false, altY: 140, altGen: 520, bfs: 60 });
  blok('a7b', t, 90.9, 94.0, { x: -880, y: -90, etiket: 'Kazanım takibi', baslik: 'Bu haftanın<br>kazanımı', alt: 'Kazanım kodu, açıklaması ve işleneceği haftalar', vurgu: OGR, renk: INK, golge: false, altY: 140, altGen: 520, bfs: 60 });
  blok('a7c', t, 94.1, 96.5, { x: -880, y: -90, etiket: 'Sınıflarım', baslik: 'Sınıf sınıf<br>ilerleme', alt: 'Takvime göre geçilen kazanımlar', vurgu: OGR, renk: INK, golge: false, altY: 140, altGen: 520, bfs: 60 });
  blok('a7d', t, 96.6, 98.9, { x: -880, y: -90, etiket: 'Öğretmen görünümü', baslik: 'Konuyu öğretmen<br>gözüyle aç', alt: 'MEB kazanımı ve süreç bileşenleriyle', vurgu: OGR, renk: INK, golge: false, altY: 140, altGen: 520, bfs: 56 });
});

/* S8 · 99–111 ALTIN MOD — ÇOK YAKINDA */
s2(98.8, 111.3, (t) => {
  const ac = K(t, [[102.0, 0], [104.6, 1, 'io']]);
  const kartlar = [
    { im: dizi('x_koridor_yuru', clamp(Math.floor((t - 102.4) * 30), 0, 71)), x: 0, y: K(t, [[102, 60], [106, -10]]), s: K(t, [[102, .9], [106, 1.15]]), a: K(t, [[102.4, 0], [103.2, .95]]), r: 0 },
    { im: dizi('x_kutuphane_don', clamp(Math.floor((t - 102.8) * 30), 0, 77)), x: K(t, [[102, -330], [106, -360]]), y: 120, s: K(t, [[102, .6], [106, .72]]), a: K(t, [[102.9, 0], [103.6, .8]]), r: -.12 },
    { im: IM.x_dunya, x: K(t, [[102, 330], [106, 360]]), y: 130, s: K(t, [[102, .6], [106, .72]]), a: K(t, [[103.1, 0], [103.8, .8]]), r: .12 }
  ];
  kapi({ t, a: K(t, [[98.9, 0], [99.8, 1], [106.0, 1], [106.4, 0]]), x: 0, y: 30, z: K(t, [[99, -600], [102, -150, 'o'], [105.6, 120], [106.2, 1400, 'i']]), s: 1, ry: K(t, [[99, 14], [102.5, 0, 'io']]),
    bl: K(t, [[105.7, 0], [106.3, 10, 'i']]), ac, isik: K(t, [[99, .35], [101.8, .55], [104, 1]]), kartlar: ac > .05 ? kartlar : null, perde: K(t, [[105.2, 0], [106.0, .9, 'i']]) });
  yazi('a8o', { h: 'Altın Mod’a özel 3B oyun dünyası', c: 'etiket', x: 0, y: 470, hiza: 'orta', a: Z(t, 103.4, 105.6, .4, .3), renk: ALTIN, fs: 22, ls: '.22em' });
  const g1 = clamp((t - 107.0) / .9, 0, 1), g2 = clamp((t - 108.5) / .8, 0, 1), son = K(t, [[110.5, 1], [111.1, 0]]);
  yazi('a8a', { h: 'ALTIN MOD', c: 'etiket', x: 0, y: -150, hiza: 'orta', a: E.o(g1) * son, ls: (0.9 - .45 * E.o(g1)) + 'em', renk: ALTIN, fs: 40, bl: (1 - g1) * 10 });
  yazi('a8b', { h: '<span style="background:linear-gradient(100deg,#c9963f 0%,#f7e3ad 30%,#fffbe9 45%,#f1c66a 60%,#b9862f 100%);background-size:220% 100%;background-position:' + (100 - 100 * E.o(clamp((t - 108.5) / 1.6, 0, 1))) + '% 0;-webkit-background-clip:text;background-clip:text;color:transparent">ÇOK YAKINDA...</span>',
    c: 'baslik', x: 0, y: 0, hiza: 'orta', a: E.o(g2) * son, fs: 150, s: 1 + (1 - E.o(g2)) * .12, bl: (1 - g2) * 14, golge: false });
  yazi('a8c', { h: 'Yeni bir öğrenme deneyimi için hazırlıklarımız devam ediyor. Altın Mod henüz kullanıma açılmadı.', c: 'alt', x: 0, y: 150, hiza: 'orta', a: Z(t, 109.3, 110.9, .5, .3), gen: 1100, fs: 28, renk: '#f3e7cc' });
});

/* S9 · 111–120 final */
const KOLAJ2 = ['e_ana', 'k_anlat', 'k_ozet', 'k_otuz', 'k_hik', 'k_kod', 'k_kart_cevap', 'k_sin', 'e_kavram', 'e_kisi_liste', 'g_quiz_dogru', 'e_oyunlar_turler',
  'e_siniflar', 'k_tablo', 'k_kar', 'e_pek', 'e_dene', 'e_calis', 'g_cark', 'g_grup', 'e_sinif5', 'k_gecis', 'g_sirala', 'e_ilerleme'];
s2(110.9, 116.3, (t) => {
  const g = K(t, [[110.9, 0], [111.4, 1, 'o']]), cik = K(t, [[115.0, 0], [116.1, 1, 'i']]);
  const kx = K(t, [[111, 260], [115.2, -200, 'l']]), ky = K(t, [[111, 140], [115.2, -120, 'l']]);
  for (let i = 0; i < 24; i++) {
    const c = cihaz('tel'), sut = i % 6, sat = Math.floor(i / 6);
    const bx = (sut - 2.5) * 430 + (sat % 2 ? 215 : 0), by = (sat - 1.5) * 880, ang = -24 * Math.PI / 180;
    const x = bx * Math.cos(ang) - by * Math.sin(ang), y = bx * Math.sin(ang) + by * Math.cos(ang), sc = .62 * (1 + (1 - g) * .4) * (1 + cik * 1.6);
    yerlestir(c, { x: (x + kx) * sc / .62 * .9, y: (y * .62 + ky) * sc / .62 * .9, z: -200 + cik * 600, rx: 38, rz: -24, s: sc, a: g * (1 - cik), bl: (1 - g) * 12 + cik * 14, cer: 'mavi', golgeA: .35, ek: { k: [{ im: IM[KOLAJ2[i]] }] } });
  }
  const sz = ['Öğren', 'Tekrar et', 'Sınava hazırlan', 'Gelişimini takip et'];
  const h = sz.map((w, i) => { const e = E.o(clamp((t - 111.5 - i * .55) / .5, 0, 1)); return `<span style="display:inline-block;opacity:${e};transform:translateY(${(1 - e) * 16}px)">${w}</span>`; }).join('<span style="opacity:.5"> · </span>');
  yazi('a9k', { h: `<span style="display:inline-block;padding:22px 44px;border-radius:999px;background:rgba(6,8,16,.78);box-shadow:0 0 60px rgba(0,0,0,.6)">${h}</span>`, c: 'baslik', x: 0, y: 0, hiza: 'orta', a: Z(t, 111.3, 115.4, .5, .5), fs: 44 });
});
s2(115.8, 120, (t) => {
  logo({ a: K(t, [[115.8, 0], [116.1, 1], [119.4, 1], [120, 0]]), s: K(t, [[115.8, 1.35], [116.4, 1, 'o'], [120, 1.06, 'l']]), y: -170, b: 240, bl: K(t, [[115.8, 14], [116.3, 0, 'o']]), sup: K(t, [[116.6, -0.2], [117.8, 1.2]]), parA: .55, par: 50 });
  kelimeler('a9s', t, 116.5, 'Öğrenmenin yeni yolu.', { y: 20, ara: .3, fs: 74 });
  const a = K(t, [[117.6, 0], [118.2, 1]]);
  yazi('a9a', { h: 'DKAB Öğrenme Platformu', c: 'baslik', x: 0, y: 130, hiza: 'orta', a, fs: 40, renk: ALTIN, ty: (1 - a) * 14 });
  yazi('a9b', { h: 'Din Kültürü ve Ahlak Bilgisi · 4–12. sınıf · Telefon ve tablet', c: 'alt', x: 0, y: 186, hiza: 'orta', a: a * .9, fs: 24, gen: 1100 });
  yazi('a9c', { h: 'Web’de ve Altın Mod’da: çok yakında', c: 'etiket', x: 0, y: 250, hiza: 'orta', a: K(t, [[118.2, 0], [118.7, 1]]) * .9, fs: 18, renk: ALTIN });
});

function yatay2Kare(t) {
  const p = palet(t, [[0, 'gece'], [7.9, 'elmasG'], [19.8, 'elmas'], [45.8, 'elmasG'], [61.7, 'enerji'], [74.8, 'elmas'], [86.7, 'ogretmen'], [98.8, 'altinKoyu'], [110.8, 'gece']]);
  const bolum = Z(t, 50.0, 56.0, .5, .5) * 0;   // (bölünmüş arka plan bu kurguda kullanılmıyor)
  arkaCiz(t, p, { hiz: (t >= 62 && t < 75) ? 2.2 : (t >= 99 && t < 111) ? 1.8 : 1, kx: -t * 20, bolum: bolum > 0 ? bolum : undefined });
  kapi(null); web(null);
  for (const s of Y2) if (t >= s.t0 && t < s.t1) s.f(t);
  if (!(t < 8.3 || t >= 115.8)) logo(null);
  fxCiz({
    cizgi: { p: K(t, [[.3, 0], [2.4, 1, 'l']]), a: Z(t, .3, 2.4, .5, .6) },
    huzme: { a: Math.max(K(t, [[1.8, 0], [2.6, .8], [6.5, .5], [8.0, 0]]), K(t, [[99.5, 0], [101.5, .5], [104, 1], [106, 1], [107, .8], [110.6, .7], [111.0, 0]]), K(t, [[115.8, 0], [116.2, 1], [119.4, .6], [120, 0]])), renk: [255, 196, 110], cy: t > 99 && t < 111 ? .45 : .38 },
    sup: (t > 37.6 && t < 39.4) ? { p: K(t, [[37.8, -0.1], [39.2, 1.1]]), renk: [150, 205, 255] } : (t > 74.8 && t < 76.6) ? { p: K(t, [[75.0, -0.1], [76.4, 1.1]]), renk: [170, 215, 255], a: .8 } : (t > 112.6 && t < 114.6) ? { p: K(t, [[112.8, -0.1], [114.4, 1.1]]), renk: [255, 230, 180], a: .8 } : null,
    vinA: (t >= 86.8 && t < 98.9) ? .12 : .55,
    flas: Math.max(K(t, [[7.7, 0], [8.0, .9, 'i'], [8.5, 0]]), K(t, [[61.6, 0], [61.85, .5], [62.2, 0]]), K(t, [[105.6, 0], [106.0, 1, 'i'], [106.9, 0]]), K(t, [[110.75, 0], [111.0, .8, 'i'], [111.4, 0]]), K(t, [[115.75, 0], [116.0, .7, 'i'], [116.4, 0]])),
    siyah: Math.max(K(t, [[0, 1], [.6, 0]]), K(t, [[98.7, 0], [99.0, .7], [99.6, 0]]), K(t, [[119.2, 0], [120, 1]])),
  });
}

/* =========================================== DİKEY 9:16, 46 sn =========================================== */
const D2 = [];
const d2 = (t0, t1, f) => D2.push({ t0, t1, f });
const DS = 1.42;
function dyaz(id, t, t0, t1, ust, alt, renk = '#fff', vurgu = MAVI, golge) {
  if (ust) blok(id + 'u', t, t0, t1, { x: 0, y: -790, hiza: 'orta', etiket: ust[0], baslik: ust[1], vurgu, renk, golge, bfs: 58, gen: 1000 });
  if (alt) { const a = Z(t, t0 + .2, t1, .5, .4); yazi(id + 'al', { h: alt, c: 'alt', x: 0, y: 830, hiza: 'orta', a, gen: 960, renk, golge, ty: (1 - E.o(clamp((t - t0 - .2) / .6, 0, 1))) * 20, fs: 34 }); }
}
d2(0, 4.3, (t) => {
  logo({ a: K(t, [[.4, 0], [1.1, 1], [3.6, 1], [4.1, 0, 'i']]), s: K(t, [[.4, .85], [1.6, 1, 'o'], [3.4, 1.04, 'l'], [4.1, 6, 'i']]), y: -200, b: 340, bl: K(t, [[.4, 16], [1.3, 0, 'o'], [3.5, 0], [4.1, 14, 'i']]), sup: K(t, [[1.2, -0.2], [2.4, 1.2]]), parA: .55 });
  const ya = K(t, [[3.3, 1], [3.8, 0]]);
  yazi('b1t', { h: 'DKAB ÖĞRENME PLATFORMU', c: 'etiket', x: 0, y: 60, hiza: 'orta', a: E.o(clamp((t - 1.4) / .8, 0, 1)) * ya, ls: '.4em', renk: ALTIN, fs: 26 });
  kelimeler('b1k', t, 1.9, 'Öğrenmenin yeni yolu.', { y: 190, a: ya, ara: .25, fs: 70 });
});
const DYON = [[8, 'k_anlat_kaydir', 'Konu Anlatımı', 'Anlaşılır ve kapsamlı'], [10, 'k_ozet', 'Konu Özeti', 'Önemli bilgiler kısa ve düzenli'], [12, 'k_otuz', '30 Saniyede Öğren', 'En önemli noktalar, hızlı tekrar'],
  [14, 'k_hik', 'Hikâyeler', 'Hikâyeyle anla, kolay hatırla'], [16, 'k_kod', 'Kodlamalar', 'Kısa kodlarla akılda tut'], [18, 'kart', 'Bilgi Kartları', 'Çevir, hatırla, tekrar et']];
d2(3.8, 20.3, (t) => {
  const c = cihaz('tel'); const k = [], hl = []; let dok = null, ry = K(t, [[3.8, -24], [5, -6, 'o'], [20, 4]]);
  if (t < 8.2) {
    k.push({ im: IM.e_ana, a: K(t, [[6.0, 1], [6.3, 0]]) }, { im: IM.e_siniflar, a: K(t, [[6.0, 0], [6.3, 1]]), dx: K(t, [[6.0, .3], [6.35, 0, 'o']]) });
    hl.push({ r: T3('e_siniflar', 's5'), a: Z(t, 6.6, 7.9, .2, .2), renk: MAVI2 });
    if (t >= 6.4 && t < 6.9) dok = { x: 287, y: 218, p: (t - 6.4) / .5 };
  }
  DYON.forEach(([t0, im, , ], j) => {
    if (t < t0 - .2 || t > t0 + 2.4) return;
    const gir = E.o(clamp((t - t0) / .4, 0, 1));
    if (im === 'k_anlat_kaydir') k.push({ im: dizi(im, K(t, [[8.2, 0], [10, 50]])), a: gir, z: K(t, [[8, 1.25], [8.4, 1.1, 'o']]), cx: 600, cy: K(t, [[8.4, 1266], [10, 1400]]) });
    else if (im === 'kart') k.push({ im: t < 19.0 ? IM.k_kart_soru : IM.k_kart_cevap, a: gir, z: 1.1, cy: 1300 });
    else { k.push({ im: IM[im], a: gir, z: K(t, [[t0, 1.25], [t0 + .4, 1, 'o'], [t0 + 1.0, 1], [t0 + 2, 1.25]]), cy: K(t, [[t0 + 1.0, 1266], [t0 + 2, 1500]]) }); hl.push({ r: T3(im, 'sekme'), a: Z(t, t0 + .4, t0 + 1.2, .2, .2), renk: MAVI2 }); }
  });
  if (t > 18.8 && t < 19.2) ry = t < 19.0 ? K(t, [[18.8, 4], [19.0, 90, 'i']]) : K(t, [[19.0, -90], [19.2, 4, 'o']]);
  yerlestir(c, { x: 0, y: K(t, [[3.8, 1400], [5.0, 40, 'o']]), rx: K(t, [[3.8, 40], [5.0, 4, 'o']]), ry, s: DS, z: K(t, [[19.6, 0], [20.2, -900, 'i']]), bl: K(t, [[19.5, 0], [20.2, 14, 'i']]), a: K(t, [[19.8, 1], [20.25, 0]]), cer: 'mavi', ek: { k, hl, dok } });
  dyaz('b2', t, 4.4, 8.0, ['Elmas Mod', 'Sınıfını seç, konuya ulaş'], 'Din Kültürü ve Ahlak Bilgisi · 4–12. sınıf');
  DYON.forEach(([t0, , ad, alt], j) => dyaz('b3' + j, t, t0 + .1, t0 + 2.0, ['Öğrenme yöntemi ' + (j + 1) + '/6', ad], alt));
});
d2(19.9, 24.3, (t) => {
  const c = cihaz('tel'); const fi = t < 20.6 ? 0 : t < 20.9 ? 1 : t < 22.1 ? 2 : 3, geri = px3([16, 612, 358, 175]);
  let dok = null; if (t >= 21.6 && t < 22.1) dok = { x: 195, y: 522, p: (t - 21.6) / .5 };
  yerlestir(c, { x: K(t, [[19.9, 1300], [20.3, 0, 'o']]), y: 40, rx: 3, ry: K(t, [[19.9, -30], [20.3, -6, 'o'], [23.6, 4]]), s: K(t, [[23.5, DS], [24.1, DS * 1.5, 'i']]), cer: 'mavi',
    bl: Math.max(K(t, [[19.9, 10], [20.3, 0]]), K(t, [[23.5, 0], [24.1, 14, 'i']])), a: K(t, [[23.6, 1], [24.15, 0]]),
    ek: { k: [{ im: SEQ.k_test.im[fi], z: fi === 3 ? K(t, [[22.3, 1], [23.0, 1.08]]) : 1, cy: fi === 3 ? K(t, [[22.3, 1266], [23.0, merkezY(geri)]]) : undefined }], hl: fi === 3 ? [{ r: geri, a: Z(t, 22.6, 23.9, .2, .2), renk: YESIL }] : [], dok } });
  dyaz('b4', t, 20.3, 23.9, ['Test ve sorular', 'Öğrendiğini ölç'], 'Mini test, sınav odaklı içerik ve anında geri bildirim', '#fff', '#4ade80');
});
d2(23.9, 30.3, (t) => {
  const c = cihaz('tel'); const k = []; let dok = null;
  if (t < 26.0) k.push({ im: dizi('g_esles', clamp((t - 24.0) / 2.0, 0, 1)), z: 1.1, cy: 1300 });
  else if (t < 28.0) { k.push({ im: t < 27.0 ? IM.g_quiz_soru : IM.g_quiz_dogru, z: 1.1, cy: 1150 }); if (t >= 26.55 && t < 27.05) dok = { x: 195, y: 382, p: (t - 26.55) / .5 }; }
  else k.push({ im: dizi('g_cark_don', clamp(Math.floor((t - 28.0) * 45), 0, 89)), z: 1.15, cy: 900 });
  let x = 0; for (const tb of [26.0, 28.0]) if (t > tb - .2 && t < tb + .25) x = t < tb ? K(t, [[tb - .2, 0], [tb, -1300, 'i']]) : K(t, [[tb, 1300], [tb + .25, 0, 'o']]);
  yerlestir(c, { x, y: 40, rx: 3, ry: K(t, [[24, -12], [30, 6]]), s: K(t, [[23.9, DS * 1.3], [24.2, DS, 'o'], [29.6, DS], [30.2, DS * .8, 'i']]), cer: 'mavi', a: K(t, [[29.8, 1], [30.2, 0]]), bl: Math.max(K(t, [[23.9, 14], [24.2, 0]]), Math.abs(x) > 50 ? 8 : 0), ek: { k, dok } });
  dyaz('b5', t, 24.2, 29.8, ['Etkinlik oyunları', 'Öğrenirken eğlen'], 'Eşleştirme, doğru cevabı bul, çarkıfelek ve daha fazlası', '#fff', ALTIN);
});
d2(29.9, 33.3, (t) => {
  const tel = cihaz('tel'), tab = cihaz('tabd'); const g = K(t, [[29.9, 0], [30.6, 1, 'o']]), w = K(t, [[31.6, 0], [32.3, 1, 'o']]), cik = K(t, [[32.9, 0], [33.3, 1]]);
  yerlestir(tab, { x: 120, y: -250 + (1 - g) * -1300, rx: 4, ry: -10, s: .95 * (1 - w * .25), a: 1 - cik, cer: 'mavi', ek: { k: [{ im: IM.b_konu }], ol: 2 } });
  yerlestir(tel, { x: -250, y: 120 + (1 - g) * 1300, rx: 4, ry: 12, s: .92 * (1 - w * .25), a: 1 - cik, cer: 'mavi', ek: { k: [{ im: IM.k_otuz }] } });
  web({ a: w * (1 - cik), x: 0, y: 520, s: .82, rx: 6, bl: (1 - w) * 8 });
  dyaz('b6', t, 30.2, 33.1, ['Telefon ve tablet', 'Telefonunda, tabletinde'], null);
});
d2(32.9, 36.3, (t) => {
  const tab = cihaz('tabd'), kaz = px2([117, 708, 673, 318]);
  yerlestir(tab, { x: 0, y: 30, rx: 3, ry: K(t, [[32.9, -30], [33.4, -6, 'o'], [36, 4]]), s: K(t, [[32.9, 1.2], [33.4, 1.45, 'o']]), cer: 'acik', golgeA: .22, cam: .05, a: K(t, [[35.8, 1], [36.25, 0]]), bl: K(t, [[32.9, 10], [33.4, 0], [35.8, 0], [36.2, 10]]),
    ek: { k: [{ im: IM.t_haftalik, z: K(t, [[33.6, 1], [34.5, 1.2]]), cx: merkezX(kaz), cy: K(t, [[33.6, 1180], [34.5, merkezY(kaz)]]) }], hl: [{ r: kaz, a: Z(t, 34.4, 35.9, .25, .2), renk: '#a0672b' }], zemin: '#f6efe2', ol: 2 } });
  blok('b7', t, 33.2, 36.0, { x: 0, y: -790, hiza: 'orta', etiket: 'Öğretmen Modu', baslik: 'Öğretmenler için<br>kazanım takibi', vurgu: OGR, renk: INK, golge: false, bfs: 58 });
});
d2(35.9, 42.3, (t) => {
  const ac = K(t, [[37.2, 0], [38.8, 1, 'io']]);
  const kartlar = [{ im: dizi('x_koridor_yuru', clamp(Math.floor((t - 37.6) * 30), 0, 71)), x: 0, y: 40, s: K(t, [[37.2, .9], [39.4, 1.1]]), a: K(t, [[37.6, 0], [38.2, .95]]), r: 0 },
    { im: dizi('x_kutuphane_don', clamp(Math.floor((t - 37.8) * 30), 0, 77)), x: -330, y: 120, s: .62, a: K(t, [[38.0, 0], [38.6, .8]]), r: -.12 },
    { im: IM.x_dunya, x: 330, y: 130, s: .62, a: K(t, [[38.2, 0], [38.8, .8]]), r: .12 }];
  kapi({ t, a: K(t, [[35.9, 0], [36.5, 1], [39.6, 1], [40.0, 0]]), x: 0, y: 0, z: K(t, [[36, -500], [37.2, 0, 'o'], [39.3, 120], [40.0, 1400, 'i']]), s: 1.45, ac, isik: K(t, [[36, .4], [38.2, 1]]), kartlar: ac > .05 ? kartlar : null, perde: K(t, [[39.2, 0], [39.9, .9, 'i']]), bl: K(t, [[39.4, 0], [40, 10]]) });
  const g1 = clamp((t - 40.0) / .7, 0, 1), g2 = clamp((t - 41.0) / .7, 0, 1), son = K(t, [[41.8, 1], [42.25, 0]]);
  yazi('b8a', { h: 'ALTIN MOD', c: 'etiket', x: 0, y: -200, hiza: 'orta', a: E.o(g1) * son, ls: (0.8 - .4 * E.o(g1)) + 'em', renk: ALTIN, fs: 44 });
  yazi('b8b', { h: '<span style="background:linear-gradient(100deg,#c9963f,#f7e3ad 30%,#fffbe9 45%,#f1c66a 60%,#b9862f);-webkit-background-clip:text;background-clip:text;color:transparent">ÇOK<br>YAKINDA...</span>', c: 'baslik', x: 0, y: 0, hiza: 'orta', a: E.o(g2) * son, fs: 150, s: 1 + (1 - E.o(g2)) * .12, bl: (1 - g2) * 14, golge: false });
  yazi('b8c', { h: 'Altın Mod henüz kullanıma açılmadı.', c: 'alt', x: 0, y: 230, hiza: 'orta', a: Z(t, 41.2, 42.1, .3, .2), gen: 900, fs: 32, renk: '#f3e7cc' });
});
d2(41.8, 46, (t) => {
  logo({ a: K(t, [[41.8, 0], [42.1, 1], [45.4, 1], [46, 0]]), s: K(t, [[41.8, 1.35], [42.4, 1, 'o'], [46, 1.06, 'l']]), y: -260, b: 340, bl: K(t, [[41.8, 14], [42.3, 0, 'o']]), sup: K(t, [[42.6, -0.2], [43.8, 1.2]]), parA: .55, par: 50 });
  kelimeler('b9s', t, 42.4, 'Öğrenmenin yeni yolu.', { y: 30, ara: .28, fs: 72 });
  const a = K(t, [[43.4, 0], [44.0, 1]]);
  yazi('b9a', { h: 'DKAB Öğrenme Platformu', c: 'baslik', x: 0, y: 160, hiza: 'orta', a, fs: 48, renk: ALTIN, ty: (1 - a) * 14 });
  yazi('b9b', { h: 'Din Kültürü ve Ahlak Bilgisi<br>4–12. sınıf · Telefon ve tablet', c: 'alt', x: 0, y: 260, hiza: 'orta', a: a * .9, fs: 32, gen: 900 });
});
function dikey2Kare(t) {
  const p = palet(t, [[0, 'gece'], [3.8, 'elmas'], [19.8, 'elmasG'], [23.8, 'enerji'], [29.8, 'elmas'], [32.8, 'ogretmen'], [35.8, 'altinKoyu'], [41.7, 'gece']]);
  arkaCiz(t, p, { hiz: (t >= 24 && t < 30) ? 2.2 : (t >= 36 && t < 42) ? 1.8 : 1, kx: -t * 20 });
  kapi(null); web(null);
  for (const s of D2) if (t >= s.t0 && t < s.t1) s.f(t);
  if (!(t < 4.3 || t >= 41.8)) logo(null);
  fxCiz({
    huzme: { a: Math.max(K(t, [[.8, 0], [1.4, .8], [3.2, .4], [4, 0]]), K(t, [[36.2, 0], [38.2, 1], [41.4, .7], [41.8, 0]]), K(t, [[41.8, 0], [42.2, 1], [45.4, .6], [46, 0]])), renk: [255, 196, 110], cy: .42 },
    vinA: (t >= 32.9 && t < 36.0) ? .12 : .55,
    flas: Math.max(K(t, [[3.75, 0], [4.0, .85, 'i'], [4.4, 0]]), K(t, [[39.6, 0], [40.0, 1, 'i'], [40.7, 0]]), K(t, [[41.75, 0], [42.0, .7, 'i'], [42.4, 0]])),
    siyah: Math.max(K(t, [[0, 1], [.4, 0]]), K(t, [[45.3, 0], [46, 1]])),
  });
}

/* ---------------- kare çizimi ---------------- */
window.ciz = (t) => {
  kul = { tel: 0, tab: 0, tabd: 0 }; yzKul = new Set();
  (YON === 'dikey' ? dikey2Kare : yatay2Kare)(t);
  for (const tur of ['tel', 'tab', 'tabd']) havuz[tur].forEach((c, i) => { if (i >= kul[tur]) c.el.style.display = 'none'; });
  for (const [id, el] of Object.entries(YZ)) el.style.display = yzKul.has(id) ? 'block' : 'none';
  return true;
};
window.SURE = YON === 'dikey' ? 46 : 120;
