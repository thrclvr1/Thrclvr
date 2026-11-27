/* ===================== V59.0 (1/3): performans — ölçülen darboğazlar =====================
   Ölçüm (4× yavaş işlemci, telefon görünümü; tools/v59/olcum/): ekran geçişlerinde V38.edOk() kayıt başına çağrılıyordu
   (yayın kuralı V45.yayinaUygun, görünüm bağlamı V51.Gorunum). Her çağrı 3–4 sessionStorage/localStorage okuması ve JSON
   ayrıştırması yapıyor (V38 → V51.5 PIN sürümü → V51.9 yönetici adımı); bir sınıf ekranında yüzlerce kez.
   Düzeltme: aynı iş adımı (aynı senkron çizim) içinde sonuç önbelleğe alınır; bir sonraki mikro görevde ve HERHANGİ bir
   localStorage/sessionStorage yazma/silme işleminde önbellek silinir. Böylece oturum açma/kapama hemen görünür (davranış aynı).
   V38.edRec() (editör PIN kaydı, localStorage + JSON) aynı yöntemle önbelleklenir. */
(function () {
  if (typeof V38 === 'undefined') return;
  const V59 = window.V59 = window.V59 || {};
  const P = V59.Perf = {sayac: {edOk: 0, edOkHesap: 0, edRec: 0, edRecHesap: 0}};
  let ok = null, rec, recVar = false, plan = false;
  const sil = () => { ok = null; recVar = false; rec = undefined; plan = false; };
  const planla = () => { if (!plan) { plan = true; Promise.resolve().then(sil); } };
  P.sil = sil;
  try {
    const sI = Storage.prototype.setItem, rI = Storage.prototype.removeItem, cl = Storage.prototype.clear;
    Storage.prototype.setItem = function () { sil(); return sI.apply(this, arguments); };
    Storage.prototype.removeItem = function () { sil(); return rI.apply(this, arguments); };
    Storage.prototype.clear = function () { sil(); return cl.apply(this, arguments); };
  } catch (x) {}
  const e0 = V38.edOk;
  if (typeof e0 === 'function') {
    V38.edOk = function () {
      P.sayac.edOk++;
      if (ok === null) { P.sayac.edOkHesap++; ok = !!e0.apply(this, arguments); planla(); }
      return ok;
    };
  }
  const r0 = V38.edRec;
  if (typeof r0 === 'function') {
    V38.edRec = function () {
      P.sayac.edRec++;
      if (!recVar) { P.sayac.edRecHesap++; rec = r0.apply(this, arguments); recVar = true; planla(); }
      return rec;
    };
  }

  /* ---------- 2. ekran geçişinde zorunlu yerleşim hesapları (layout thrash) ----------
     Ölçüm: V30'un çizim kancası her ekran değişiminde, yeni DOM kurulur kurulmaz üç kez zorunlu yerleşim yaptırıyordu
     (V30.trans: void offsetWidth; V30.reveal: 70 öğeye getBoundingClientRect; V30.setHH: yeni başlığın offsetHeight'ı).
     Sonraki sürüm modülleri DOM'u değiştirdiği için tarayıcı yerleşimi karede bir kez daha hesaplıyordu.
     Aynı görsel sonuç, zorunlu yerleşim olmadan: animasyon sınıfı bir sonraki karede eklenir; kademeli açılış sırası
     IntersectionObserver'ın ilk bildiriminden; başlık yüksekliği ResizeObserver'dan (ilk kez ölçülürken bir kez okunur). */
  if (typeof V30 !== 'undefined') {
    P.v30 = {trans: 0, reveal: 0, hh: 0};
    const tr0 = V30.trans;
    if (typeof tr0 === 'function') V30.trans = function (from, to) {
      if (V30.off() || !from || from === to) return;
      const a = document.getElementById('app'); if (!a) return;
      const k = (to === 'games' || to === 'game') ? 'liquid' : to === 'search' ? 'shards' : (to === 'topic') ? 'settle' : (to === 'grade' || to === 'classes') ? 'layer' : (to === 'pek' || to === 'dene' || to === 'cards' || to === 'pekbol') ? 'wave' : '';
      if (!k) return;
      P.v30.trans++;
      a.className = a.className.replace(/\btr-\w+/g, '');
      requestAnimationFrame(() => { a.classList.add('tr-' + k); setTimeout(() => a.classList.remove('tr-' + k), 800); });
    };
    if (typeof V30.reveal === 'function') V30.reveal = function () {
      if (V30.off() || typeof IntersectionObserver === 'undefined') return;
      if (V30.io) V30.io.disconnect();
      P.v30.reveal++;
      const sira = new Map(); let ilk = true;
      V30.io = new IntersectionObserver((es) => {
        if (ilk) { ilk = false; let k = 0; es.slice().sort((x, y) => sira.get(x.target) - sira.get(y.target)).forEach((en) => en.target.style.setProperty('--i', en.isIntersecting ? Math.min(k++, 9) : 0)); }
        es.forEach((en) => { if (en.isIntersecting) { const e = en.target; e.classList.add('in'); V30.io.unobserve(e); setTimeout(() => e.classList.add('done'), 1000); } });
      }, {rootMargin: '0px 0px -4% 0px', threshold: 0.04});
      const els = [...document.querySelectorAll('#app > *, #app .g30-grid > *, #app .hub30 > *, #app .ugrid > *, #app .pg30 > *')].filter((e) => !e.classList.contains('rv') && !e.classList.contains('h30-hello') && !e.classList.contains('h30-sticky')).slice(0, 70);
      els.forEach((e, i) => { sira.set(e, i); e.style.setProperty('--i', 0); e.classList.add('rv'); V30.io.observe(e); });
      setTimeout(() => document.querySelectorAll('.rv:not(.in)').forEach((e) => e.classList.add('in')), 1600);
    };
    if (typeof V30.setHH === 'function') {
      const hh0 = V30.setHH;
      V30.setHH = function () {
        const h = document.querySelector('header.top'); if (!h) return;
        if (typeof ResizeObserver === 'undefined' || !V30._hhw) { P.v30.hh++; return hh0.apply(this, arguments); }   // ilk ölçüm: eski yol
        const de = document.documentElement;
        if (V30._hhro !== h) {
          V30._hhro = h;
          // tek gözlemci: eski başlık bırakılır (eskiden her yeni başlık için yeni ResizeObserver kuruluyordu; uzun kullanımda birikiyordu)
          P.ro = P.ro || new ResizeObserver((es) => { const en = es[es.length - 1], b = en.borderBoxSize && en.borderBoxSize[0]; const v = Math.round(b ? b.blockSize : en.contentRect.height) + 'px'; V30._hhv = v; if (v !== V30._hhw) { V30._hhw = v; de.style.setProperty('--hh', v); } });
          P.ro.disconnect(); P.ro.observe(h);
        }
      };
    }
  }
})();
