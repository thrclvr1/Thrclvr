// sayfa içinde çalışır: görünür öğelerde sıcak (altın/kahve) renkleri bulur. window.__sicak(kok, istisnaSecici)
window.__sicak = function (istisna) {
  const toLin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lch = (r, g, b) => { r = toLin(r); g = toLin(g); b = toLin(b); const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b); const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s; return [L, Math.hypot(A, B), (Math.atan2(B, A) * 180 / Math.PI + 360) % 360]; };
  const cv = document.createElement('canvas').getContext('2d');
  const renkler = (s) => { const o = []; const re = /(rgba?\([^)]*\)|color\(srgb[^)]*\)|#[0-9a-fA-F]{3,8}\b)/g; let m; while ((m = re.exec(s))) { let c = m[1]; if (c.startsWith('color(srgb')) { const n = c.match(/[\d.]+/g).map(Number); o.push([n[0] * 255, n[1] * 255, n[2] * 255, n[3] == null ? 1 : n[3]]); continue; } const n = c.match(/[\d.]+/g); if (c[0] === '#') { cv.fillStyle = c; const h = cv.fillStyle; o.push([parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), 1]); } else if (n) o.push([+n[0], +n[1], +n[2], n[3] == null ? 1 : +n[3]]); } return o; };
  const sicak = ([r, g, b, a]) => { if (a < 0.25) return false; const [L, C, H] = lch(r, g, b); return C > 0.05 && H >= 25 && H <= 110; };
  const B = [], seen = new Set();
  document.querySelectorAll('body *').forEach((el) => {
    if (istisna && el.closest(istisna)) return;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) return;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.opacity === '0' || cs.display === 'none') return;
    const L = [['bg', cs.backgroundColor], ['img', cs.backgroundImage.startsWith('url(') ? '' : cs.backgroundImage], ['bd', cs.borderTopWidth !== '0px' ? cs.borderTopColor : ''], ['bdl', cs.borderLeftWidth !== '0px' ? cs.borderLeftColor : ''], ['sh', cs.boxShadow]];
    if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim())) L.push(['yazi', cs.color]);
    if (el instanceof SVGElement) { L.push(['fill', cs.fill]); L.push(['stroke', cs.stroke]); }
    for (const [k, v] of L) { if (!v || v === 'none') continue; if (renkler(v).some(sicak)) { const ad = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''); const key = ad + ':' + k; if (!seen.has(key)) { seen.add(key); B.push(key + ' ' + v.slice(0, 60)); } } }
  });
  return B;
};
