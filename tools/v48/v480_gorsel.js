/* ===================== V48.0: Elmas ve Altın Öğrenme Alanı görselleri, amblemler, motif ailesi =====================
   Bütün görseller vektördür (SVG, birkaç KB); mobilde her çözünürlükte keskin, ek dosya indirmez.
   Motif ailesi 8 kat simetriktir (sekiz köşeli Selçuklu yıldızı, girih, geçme). Altı köşeli yıldız / altıgen kullanılmaz. */
(function () {
  const V48 = window.V48 = window.V48 || {};
  const Gr = V48.Gorsel = {};
  // sekiz köşeli Selçuklu yıldızı (16 köşe)
  const y8 = (cx, cy, R, r, rot) => { r = r == null ? R * 0.62 : r; rot = rot == null ? -90 : rot; const p = []; for (let i = 0; i < 16; i++) { const a = (rot + i * 22.5) * Math.PI / 180, q = i % 2 ? r : R; p.push((cx + q * Math.cos(a)).toFixed(1) + ',' + (cy + q * Math.sin(a)).toFixed(1)); } return p.join(' '); };
  const s8 = (cx, cy, R) => { const p = []; for (let i = 0; i < 8; i++) { const a = (-67.5 + i * 45) * Math.PI / 180; p.push((cx + R * Math.cos(a)).toFixed(1) + ',' + (cy + R * Math.sin(a)).toFixed(1)); } return p.join(' '); };
  Gr.y8 = y8;

  /* ---------- amblemler ---------- */
  // Altın: işlenmiş altın madalyon (metalik altın, kabartma Selçuklu yıldızı, boncuklu kenar)
  Gr.altinAmblem = (s, id) => { id = id || 'am' + Math.random().toString(36).slice(2, 7); return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs>
<radialGradient id="${id}a" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#fff6cf"/><stop offset=".28" stop-color="#f4d77d"/><stop offset=".62" stop-color="#d4a23c"/><stop offset=".86" stop-color="#9c6a17"/><stop offset="1" stop-color="#6f4a10"/></radialGradient>
<linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b8"/><stop offset=".45" stop-color="#e2b04b"/><stop offset="1" stop-color="#8a5c14"/></linearGradient></defs>
<circle cx="32" cy="32" r="30" fill="url(#${id}a)" stroke="#6f4a10" stroke-width="1.2"/>
<circle cx="32" cy="32" r="25.5" fill="none" stroke="#fff3c4" stroke-opacity=".55" stroke-width=".8"/>
${[...Array(32)].map((_, i) => { const a = i * Math.PI / 16; return `<circle cx="${(32 + 27.8 * Math.cos(a)).toFixed(1)}" cy="${(32 + 27.8 * Math.sin(a)).toFixed(1)}" r=".9" fill="#7a5212" opacity=".55"/>`; }).join('')}
<polygon points="${y8(32, 32, 19, 12)}" fill="url(#${id}b)" stroke="#7a5212" stroke-width="1"/>
<polygon points="${s8(32, 32, 9.5)}" fill="#b98424" stroke="#fff0b0" stroke-opacity=".7" stroke-width=".8"/>
<circle cx="32" cy="32" r="3.2" fill="#fff4c8"/><path d="M14 22q10-12 26-12" stroke="#fffbe6" stroke-opacity=".55" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`; };
  // Elmas: kesimli kristal (taç ve köşk yüzeyleri, platin ve buz mavisi yansımalar)
  Gr.elmasAmblem = (s, id) => { const F = [['22,13 14,24 24,24', '#c9d8ea'], ['22,13 27,13 24,24', '#eef5fc'], ['27,13 32,24 24,24', '#b4c8e0'], ['27,13 37,13 32,24', '#ffffff'], ['37,13 40,24 32,24', '#b4c8e0'], ['37,13 42,13 40,24', '#eef5fc'], ['42,13 50,24 40,24', '#c9d8ea'],
      ['14,24 24,24 32,53', '#8fa7c4'], ['24,24 32,24 32,53', '#dfeaf6'], ['32,24 40,24 32,53', '#a9bfd9'], ['40,24 50,24 32,53', '#7b93b3']];
    return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g stroke="#5f7491" stroke-width=".8" stroke-linejoin="round">${F.map(([p, c]) => `<polygon points="${p}" fill="${c}"/>`).join('')}</g>
<path d="M14 24 22 13h20l8 11-18 29z" fill="none" stroke="#4f6480" stroke-width="1.3" stroke-linejoin="round"/><path d="M26 15.5l-2.6 6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>
<path d="M31 4v5M44 5l-1.6 3.4M18 5l1.6 3.4" stroke="#9fb2c9" stroke-width="1.3" stroke-linecap="round"/></svg>`; };

  /* ---------- Elmas Öğrenme Alanı: aydınlık, kristal, modern dijital kütüphane ---------- */
  Gr.elmas = (id) => { id = id || 'ge48'; const kitap = (x0, y0, w, h, n, seed) => { let s = '', x = x0, r = seed; const C = ['#c9d4e2', '#aebdd0', '#d9e2ec', '#9fb0c6', '#e6ecf3', '#b9c7d8']; while (x < x0 + w - 4) { r = (r * 9301 + 49297) % 233280; const bw = 4 + (r % 5), bh = h * (0.62 + (r % 30) / 100); s += `<rect x="${x}" y="${(y0 + h - bh).toFixed(1)}" width="${bw}" height="${bh.toFixed(1)}" rx=".8" fill="${C[r % C.length]}"/>`; x += bw + 1.2; } return s; };
    return `<svg class="g48" viewBox="0 0 640 374" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>
<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f9fc"/><stop offset=".55" stop-color="#e3e9f1"/><stop offset="1" stop-color="#cdd6e2"/></linearGradient>
<linearGradient id="${id}z" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe6ef"/><stop offset="1" stop-color="#f4f7fb"/></linearGradient>
<linearGradient id="${id}p" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".85"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
<radialGradient id="${id}l" cx="50%" cy="40%" r="45%"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>
<rect width="640" height="374" fill="url(#${id}g)"/>
<path d="M0 260 260 168h120l260 92v114H0z" fill="url(#${id}z)"/>
<g stroke="#b7c3d3" stroke-width="1" opacity=".45">${[-6, -4, -2, 0, 2, 4, 6].map((k) => `<line x1="${320 + k * 10}" y1="168" x2="${320 + k * 120}" y2="374"/>`).join('')}${[190, 222, 262, 312].map((y) => `<line x1="0" y1="${y}" x2="640" y2="${y}" opacity=".5"/>`).join('')}</g>
<g opacity=".95"><path d="M40 40h140v190L40 268z" fill="#eef2f7" stroke="#c3cedc"/><path d="M600 40H460v190l140 38z" fill="#eef2f7" stroke="#c3cedc"/>
${[0, 1, 2, 3].map((k) => `<rect x="54" y="${56 + k * 44}" width="112" height="3" fill="#c7d1de"/>${kitap(56, 20 + k * 44, 110, 34, 0, 11 + k)}<rect x="474" y="${56 + k * 44}" width="112" height="3" fill="#c7d1de"/>${kitap(476, 20 + k * 44, 110, 34, 0, 37 + k)}`).join('')}</g>
<path d="M260 168V58q60-44 120 0v110z" fill="#ffffff" stroke="#c3cedc" stroke-width="2"/><path d="M270 168V64q50-36 100 0v104z" fill="url(#${id}l)"/>
<g fill="none" stroke="#aebdd0" stroke-width="1.3">${[[300, 84], [340, 84], [320, 112], [300, 140], [340, 140]].map(([x, y]) => `<polygon points="${y8(x, y, 12, 7.4)}"/>`).join('')}</g>
<rect x="200" y="40" width="240" height="3" fill="url(#${id}p)"/><path d="M120 0 250 374M520 0 390 374" stroke="url(#${id}p)" stroke-width="18" opacity=".35"/>
<radialGradient id="${id}r" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#e6f0fb" stop-opacity=".9"/><stop offset="1" stop-color="#cfe0f2" stop-opacity="0"/></radialGradient>
<circle cx="320" cy="214" r="118" fill="url(#${id}r)"/>
<ellipse cx="320" cy="318" rx="130" ry="15" fill="#8ea3bd" opacity=".28"/>
<g transform="translate(320 330) scale(3.1 -1.1) translate(-32 -40)" opacity=".16">${Gr.elmasAmblem(64, id + 'y').replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
<g transform="translate(320 205) scale(3.3) translate(-32 -32)">${Gr.elmasAmblem(64, id + 'a').replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
<path d="M262 150l-40-30M378 150l40-30M320 120V92" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
<g fill="#ffffff" stroke="#9fb2c9" stroke-width=".6">${[[214, 196, 7], [430, 176, 6], [396, 286, 5], [240, 270, 4.5], [352, 110, 4]].map(([x, y, r]) => `<path d="M${x} ${y - r}l${r * 0.3} ${r * 0.7} ${r * 0.7} ${r * 0.3}-${r * 0.7} ${r * 0.3}-${r * 0.3} ${r * 0.7}-${r * 0.3}-${r * 0.7}-${r * 0.7}-${r * 0.3} ${r * 0.7}-${r * 0.3}z"/>`).join('')}</g></svg>`; };

  /* ---------- Altın Öğrenme Alanı: zümrüt, metalik altın, ihtişamlı okul mimarisi, güçlü perspektif ---------- */
  Gr.altin = (id) => { id = id || 'ga48'; const kemer = (k) => { const s = 1 - k * 0.17, w = 300 * s, hh = 300 * s, x0 = 320 - w / 2, y0 = 360 - hh, o = (0.9 - k * 0.12).toFixed(2); return `<path d="M${x0.toFixed(1)} 374V${(y0 + w * 0.5).toFixed(1)}Q${x0.toFixed(1)} ${(y0 + w * 0.12).toFixed(1)} 320 ${y0.toFixed(1)}Q${(x0 + w).toFixed(1)} ${(y0 + w * 0.12).toFixed(1)} ${(x0 + w).toFixed(1)} ${(y0 + w * 0.5).toFixed(1)}V374" fill="none" stroke="#d6a84a" stroke-opacity="${o}" stroke-width="${(5 - k * 0.7).toFixed(1)}"/>`; };
    return `<svg class="g48" viewBox="0 0 640 374" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>
<radialGradient id="${id}g" cx="50%" cy="58%" r="70%"><stop offset="0" stop-color="#1f5a45"/><stop offset=".5" stop-color="#0b2f24"/><stop offset="1" stop-color="#03130d"/></radialGradient>
<radialGradient id="${id}l" cx="50%" cy="62%" r="30%"><stop offset="0" stop-color="#ffe7a6" stop-opacity=".95"/><stop offset=".5" stop-color="#f2b955" stop-opacity=".35"/><stop offset="1" stop-color="#f2b955" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}z" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a12"/><stop offset="1" stop-color="#0c0905"/></linearGradient>
<linearGradient id="${id}k" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5212"/><stop offset=".5" stop-color="#f2cf6b"/><stop offset="1" stop-color="#7a5212"/></linearGradient></defs>
<rect width="640" height="374" fill="url(#${id}g)"/>
<path d="M0 374 250 236h140l250 138z" fill="url(#${id}z)"/>
<g stroke="#d6a84a" stroke-opacity=".35" stroke-width="1.1">${[-5, -3, -1, 1, 3, 5].map((k) => `<line x1="${320 + k * 14}" y1="236" x2="${320 + k * 110}" y2="374"/>`).join('')}</g>
<path d="M300 236h40l70 138H230z" fill="#5a1f17" opacity=".85"/><path d="M300 236h40l70 138H230z" fill="none" stroke="#d6a84a" stroke-opacity=".7" stroke-width="1.5"/>
${[[262, 4, 1.2], [290, 8, 2.2], [336, 14, 4]].map(([y, r, w]) => `<ellipse cx="320" cy="${y}" rx="${r * 3.2}" ry="${r}" fill="none" stroke="#e8c46e" stroke-width="${w * .6}" opacity=".8"/>`).join('')}
<circle cx="320" cy="232" r="120" fill="url(#${id}l)"/>
${[5, 4, 3, 2, 1, 0].map(kemer).join('')}
${[0, 1, 2].map((k) => { const x = 70 + k * 46, h = 300 - k * 60; return `<rect x="${x}" y="${374 - h}" width="${16 - k * 3}" height="${h}" fill="url(#${id}k)" opacity="${0.9 - k * 0.2}"/><rect x="${640 - x - 16 + k * 3}" y="${374 - h}" width="${16 - k * 3}" height="${h}" fill="url(#${id}k)" opacity="${0.9 - k * 0.2}"/>`; }).join('')}
<g transform="translate(320 168) scale(2.4) translate(-32 -32)">${Gr.altinAmblem(64, id + 'a').replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
<ellipse cx="320" cy="300" rx="70" ry="8" fill="#f2cf6b" opacity=".22"/></svg>`; };
  // ayar ekranındaki küçük önizlemeler
  Gr.kucuk = (k) => (k === 'premium' ? Gr.altin('gk48a') : Gr.elmas('gk48e')).replace('class="g48"', 'class="g48 k"');
})();
