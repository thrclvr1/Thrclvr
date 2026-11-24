/* ===================== V51.4: arama sistemi — ortak dizin, Altın araması, Öğretmen Arama Merkezi =====================
   V51.Ara
   • Tek ortak dizin  A.taban  (konu, ünite, kazanım, kavram, kişi/eser/âyet/hadis, soru, bilgi kartı; bütün sınıflar ve
     programlar). Bir kez kurulur; Elmas (V30.idx), Altın ve Öğretmen listeleri bu dizinin AYNI kayıt nesnelerini süzer
     (metin üç kez dizinlenmez). Editör yayın işlemi (V38 ED.inval) dizini sıfırlar.
   • Rol/mod ayrımı A.liste(mod):  'elmas'  → V30 kuralı (vis + PM(pvOf(sınıf), program))
                                   'altin'  → vis + program = V39.pv(sınıf) (Altın'ın sınıf başına seçili programı)
                                   'ogretmen' → vis; bütün sınıflar ve programlar (süzgeçler ekranda)
   • Eşleşme kelime başından (A.bul): “namaz” “algılanamazlığı”nı, “din” “tevhidin”i, “ayet” “hidayet”i bulmaz.
   • Öğrenciye kazanım kodu/metni gösterilmez (V51.2 kuralı): kazanım eşleşmesi, kazanımı içeren konu olarak gösterilir.
   • Kavram/kişi ayrıntısı (V31.body) öğrencide “Kitap s.”, eşleşme/doğrulama satırları, “Kaynak: … editör onayı
     bekliyor”, “Meal doğrulanamadı … kontrol bekliyor” gibi kaynak doğrulama metaverisi olmadan çizilir (A.temizle);
     öğretmende sayfa bilgisi kalır, doğrulama satırları gizlenir; editörde aynen.
   • Öğretmen Arama Merkezi: rota 'ogara' (yalnız öğretmen oturumunda). Öğretmen alanından veya öğretmen görünümünden
     açılan her arama buraya gelir; sonuçlar öğretmen görünümünde açılır (G.okip='ogretmen'); V42.gec / V50.Mod.gec
     çağrılmaz, dk-deneyim39 / dk-mod50 değişmez.
   Arama hiçbir kaydı değiştirmez, silmez. */
(function () {
  'use strict';
  const V51 = window.V51 || (window.V51 = {});
  const A = V51.Ara = {};
  const e = (s) => esc(String(s == null ? '' : s));
  const gor = (r) => { try { return !!r && vis(r); } catch (er) { return !!r; } };
  A.TUR = [['topics', 'Konular'], ['units', 'Üniteler'], ['outcomes', 'Kazanımlar'], ['concepts', 'Kavramlar'], ['people', 'Kişiler ve eserler'], ['ayet', 'Âyet kaynakları'], ['hadis', 'Hadis kaynakları'], ['questions', 'Sorular'], ['flashcards', 'Bilgi kartları']];
  A.AD = Object.fromEntries(A.TUR);
  A.TEK = {topics: 'Konu', units: 'Ünite', outcomes: 'Kazanım', concepts: 'Kavram', people: 'Kişi / eser', ayet: 'Âyet kaynağı', hadis: 'Hadis kaynağı', questions: 'Soru', flashcards: 'Bilgi kartı'};
  A.COL = {topics: 'topics', units: 'units', outcomes: 'outcomes', concepts: 'concepts', people: 'entities', ayet: 'entities', hadis: 'entities', questions: 'questions', flashcards: 'flashcards'};
  const VISLI = {topics: 1, units: 1, outcomes: 1, questions: 1, flashcards: 1}; // V30.build ile aynı: kavram/kişi kayıtları yayın kuralına bağlı değil

  /* ---------- 1. ortak dizin ---------- */
  A.taban = null; A._liste = {};
  A.kur = function () {
    const L = [], U = {}, T = {};
    Store.all('units').forEach((u) => { U[u.id] = u; });
    Store.all('topics').forEach((t) => { T[t.id] = t; });
    const un = (id) => (U[id] ? U[id].title : '');
    const add = (o) => { o.n = tn(o.n); o.v = !!VISLI[o.c]; o.col = A.COL[o.c]; L.push(o); };
    Store.all('topics').forEach((t) => add({c: 'topics', id: t.id, g: t.grade, py: t.programYear, us: [t.unitId], tid: t.id, t: t.title, s: t.grade + '. sınıf · ' + un(t.unitId), n: t.title + ' ' + (t.subtitle || '') + ' ' + (t.description || ''), w: 3}));
    Store.all('units').forEach((u) => add({c: 'units', id: u.id, g: u.grade, py: u.programYear, us: [u.id], t: u.title, s: u.grade + '. sınıf · ' + progLab(u.programYear) + ' ünitesi', n: u.title, w: 2}));
    Store.all('outcomes').forEach((o) => add({c: 'outcomes', id: o.id, g: o.grade, py: o.programYear, us: [o.unitId], t: (o.code || '') + ' ' + (o.text || o.title || ''), s: o.grade + '. sınıf kazanımı', n: (o.code || '') + ' ' + (o.text || o.title || ''), w: 2}));
    const tus = (r) => [...new Set((r.topicIds || []).map((i) => T[i] && T[i].unitId).filter(Boolean))];
    Store.all('concepts').forEach((r) => add({c: 'concepts', id: r.id, g: r.grade, py: r.programYear, us: tus(r), t: r.term, s: r.grade + '. sınıf · kavram', n: r.term, w: 2}));
    Store.all('entities').forEach((r) => { const c = r.type === 'ayet' ? 'ayet' : r.type === 'hadis' ? 'hadis' : 'people'; add({c, rc: 'entities', id: r.id, g: r.grade, py: r.programYear, us: tus(r), t: r.name || r.term, s: r.grade + '. sınıf · ' + ((typeof ETL !== 'undefined' && ETL[r.type]) || r.type), n: r.name || r.term, w: 1}); });
    Store.all('questions').forEach((q) => add({c: 'questions', id: q.id, g: q.grade, py: q.programYear, us: [T[q.topicId] && T[q.topicId].unitId].filter(Boolean), tid: q.topicId, t: q.text, s: q.grade + '. sınıf · soru', n: q.text, w: 0}));
    Store.all('flashcards').forEach((q) => add({c: 'flashcards', id: q.id, g: q.grade, py: q.programYear, us: [T[q.topicId] && T[q.topicId].unitId].filter(Boolean), tid: q.topicId, t: q.question, s: q.grade + '. sınıf · kart', n: q.question + ' ' + q.answer, w: 0}));
    A.taban = L; A._liste = {}; A.kurulum = (A.kurulum || 0) + 1;
    return L;
  };
  A.sifirla = function () { A.taban = null; A._liste = {}; };
  A.kayit = (en) => Store.get(en.col, en.id);
  /* kazanım → modda görünür ilk konu (öğrenciye kazanım yerine bu konu gösterilir) */
  A.kazKonu = function (oid, py) { return Store.all('topics').find((t) => (t.outcomeIds || []).includes(oid) && (!py || t.programYear === py) && gor(t)) || null; };
  A.liste = function (mod) {
    if (!A.taban) A.kur();
    let key = (typeof S !== 'undefined' ? S.prog + '|' + S.prev : '') + '|' + (window.V51.Yayin && V51.Yayin.siki ? (V51.Yayin.siki() ? 1 : 0) : '');
    if (mod === 'altin') key += '|' + [4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => V39.pv(g)).join(',');
    const c = A._liste[mod]; if (c && c.key === key) return c.L;
    const prog = mod === 'elmas' ? (en) => PM(pvOf(en.g), en.py) : mod === 'altin' ? (en) => en.py === V39.pv(en.g) : () => true;
    const L = [];
    A.taban.forEach((en) => {
      if (!prog(en)) return;
      if (en.v && !gor(A.kayit(en))) return;
      if (mod !== 'ogretmen' && en.c === 'outcomes') {
        // öğrenci: kazanım kodu/metni gösterilmez; eşleşme kazanımı içeren konu olarak gelir (konu yoksa sonuç yok)
        const t = A.kazKonu(en.id, en.py); if (!t) return;
        L.push(Object.assign(Object.create(en), {t: t.title, s: en.g + '. sınıf · kazanımı bu konuda işlenir', tid: t.id, ogr: 1}));
        return;
      }
      L.push(en);
    });
    A._liste[mod] = {key, L};
    return L;
  };
  /* kelime başından eşleşme */
  const HARF = /[\p{L}\p{N}]/u;
  A.bas = function (n, t) { let i = n.indexOf(t); while (i >= 0) { if (i === 0 || !HARF.test(n[i - 1])) return i; i = n.indexOf(t, i + 1); } return -1; };
  A.bul = function (L, q, f) {
    const ts = tn(q).split(' ').filter(Boolean); if (!ts.length) return {};
    const out = {};
    L.forEach((en) => {
      if (f && !f(en)) return;
      let sc = 0;
      for (const t of ts) { const i = A.bas(en.n, t); if (i < 0) return; sc += (i === 0 || en.n[i - 1] === ' ') ? 2 : 1; }
      if (tn(en.t).startsWith(ts[0])) sc += 3;
      (out[en.c] = out[en.c] || []).push([sc + en.w, en]);
    });
    Object.keys(out).forEach((k) => out[k].sort((a, b) => b[0] - a[0] || a[1].t.length - b[1].t.length));
    return out;
  };

  /* ---------- 2. Elmas: V30 aynı arayüz, ortak dizinden ---------- */
  if (typeof V30 !== 'undefined') {
    V30.build = function () { V30.idx = A.liste('elmas'); V30.idxKey = S.prog + '|' + S.prev; };
    V30.find = function (q, g) { if (!V30.idx || V30.idxKey !== S.prog + '|' + S.prev) V30.build(); return A.bul(V30.idx, q, g ? (en) => en.g == g : null); };
    const o0 = V30.open;
    V30.open = function (c, id, rc) {
      if (c === 'outcomes') { const en = (V30.idx || []).find((x) => x.c === 'outcomes' && x.id === id); if (en && en.tid) return go('topic', {t: en.tid, tab: 'anlat'}); }
      if (c === 'questions' || c === 'flashcards') { const r = Store.get(c, id), t = r && Store.get('topics', r.topicId); if (!t || !gor(t)) return A.kartDetay(c, id); }
      return o0.apply(this, arguments);
    };
  }
  try { if (typeof V38 !== 'undefined' && V38.ED && V38.ED.inval) { const i0 = V38.ED.inval; V38.ED.inval = function () { A.sifirla(); return i0.apply(this, arguments); }; } } catch (er) {}

  /* ---------- 3. rol ---------- */
  const ogrOk = () => { try { return V36.ok(); } catch (er) { return false; } };
  const edOk = () => { try { return typeof V38 !== 'undefined' && V38.edOk(); } catch (er) { return false; } };
  A.ogretmenMi = function () {
    if (!ogrOk()) return false;
    if (typeof view !== 'undefined' && (view === 'ogretmen' || view === 'ogara')) return true;
    try { return /^(ogretmen|onizleme)$/.test(V51.Gorunum.kip()); } catch (er) { return false; }
  };
  A.seviye = function () { if (edOk()) return 'editor'; if (A.ogretmenMi() && !(window.V51.Gorunum && V51.Gorunum.kip && V51.Gorunum.kip() === 'onizleme')) return 'ogretmen'; return 'ogrenci'; };
  if (V51.Gorunum && V51.Gorunum.kip) {
    const k0 = V51.Gorunum.kip;
    V51.Gorunum.kip = function () { const k = k0.apply(this, arguments); return (k === 'ogrenci' && typeof view !== 'undefined' && view === 'ogara' && ogrOk()) ? 'ogretmen' : k; };
  }
  if (typeof V37 !== 'undefined' && V37.mode) {
    const m0 = V37.mode;
    V37.mode = function () { const r = m0.apply(this, arguments); try { const on = typeof view !== 'undefined' && view === 'ogara'; if (on) document.body.setAttribute('data-ogrt37', ''); document.body.toggleAttribute('data-ogara514', on); } catch (er) {} return r; };
  }

  /* ---------- 4. kavram / kişi ayrıntısı: kaynak doğrulama metaverisi ---------- */
  const DOG = /doğrula|editör|kontrol bekl|kaynak bekl|otomatik tespit|eşleşme|mevcut bağlantı|konu aralığında|sayfa aralığında/i;
  A.temizle = function (html, sev) {
    if (sev === 'editor') return html;
    const d = document.createElement('template'); d.innerHTML = html; const R = d.content;
    if (sev === 'ogrenci') R.querySelectorAll('.chips .tag').forEach((t) => { if (/^Kitap s\./.test(t.textContent.trim())) t.remove(); });
    R.querySelectorAll('.row30 small, .v31-tl small').forEach((s) => { const br = s.querySelector('br'); if (!br) return; let n = br.nextSibling; while (n) { const x = n.nextSibling; n.remove(); n = x; } br.remove(); });
    R.querySelectorAll('p').forEach((p) => {
      if (p.classList.contains('cp-sn') || p.classList.contains('v31-fn')) return;
      const t = p.textContent.trim();
      if (/^Kaynak:/.test(t)) { if (sev === 'ogretmen') { const m = t.match(/^Kaynak: ders kitabı(?: · s\. [\d, –-]+)?/); if (m) p.textContent = m[0]; else p.remove(); } else p.remove(); return; }
      if (p.classList.contains('sd-wait')) { p.className = 'mut small'; p.textContent = 'Bu kaydın metni ve meali henüz uygulamaya eklenmedi.'; return; }
      if (/^Bu bir arama bağlantısıdır/.test(t)) { p.textContent = 'Bu bir arama bağlantısıdır; tek bir video değildir.'; return; }
      if (sev === 'ogrenci' && /^Bu ad konu anlatımında cümle olarak geçmiyor/.test(t)) { p.remove(); return; }
      if (DOG.test(t)) p.remove();
    });
    const w = document.createElement('div'); w.appendChild(R); return w.innerHTML;
  };
  if (typeof V31 !== 'undefined' && V31.body) {
    const b0 = V31.body;
    V31.body = function () { const h = b0.apply(this, arguments); try { return A.temizle(h, A.seviye()); } catch (er) { return h; } };
  }

  /* ---------- 5. ortak ayrıntı pencereleri (Altın ve Öğretmen; moda göre yönlendirir) ---------- */
  const tabFor = (c) => (c === 'questions' ? 'test' : c === 'flashcards' ? 'kart' : 'anlat');
  A.konuAc = function (tid, tab) {
    const t = Store.get('topics', tid); if (!t) { UI.toast('Bu kayıt için konu bulunamadı.'); return; }
    try { UI.close(); } catch (er) {}
    if (A.ogretmenMi()) {
      const a = {okip: 'ogretmen'};
      if (V39.on) go('pders', Object.assign(a, {pt: tid, ptab: tab && tab !== 'anlat' && V39.av(t).some((x) => x[0] === tab) ? tab : ''}));
      else go('topic', Object.assign(a, {t: tid, tab: tab || 'anlat'}));
      return;
    }
    if (V39.on) go('pders', {pt: tid, ptab: tab && tab !== 'anlat' && V39.av(t).some((x) => x[0] === tab) ? tab : ''});
    else go('topic', {t: tid, tab: tab || 'anlat'});
  };
  const yonlendir = (h) => h.replace(/V30\.closeGo\(\(\)=(?:>|&gt;)go\('topic',\{t:'([^']+)',tab:'anlat'\}\)\)/g, "V51.Ara.konuAc('$1')")
    .replace(/V30\.rec\('(concepts|entities)','([^']+)'\)/g, "V51.Ara.detay('$1','$2')").replace(/class="xl"/g, 'class="xl514"');
  const meta = (r, uid) => { const u = Store.get('units', uid); return `<span class="ar514-t">${r.grade}. sınıf</span><span class="ar514-t">${e(progLab(r.programYear))}</span>${u ? `<span class="ar514-t">${u.order}. Ünite: ${e(u.title)}</span>` : ''}`; };
  A.detay = function (col, id) {
    const r = Store.get(col, id); if (!r) return;
    let ic = '';
    try { ic = yonlendir(V31.body(col, r, true)); } catch (er) { ic = ''; }
    const d = document.createElement('div'); d.innerHTML = ic; d.querySelectorAll('.v33f, .v34f').forEach((x) => x.remove()); ic = d.innerHTML;
    const T = (r.topicIds || []).map((i) => Store.get('topics', i)).filter((t) => t && gor(t));
    UI.sheet({title: r.term || r.name, body: () => `<div class="rec30 ar514-d">${ic}${T.length ? '' : '<p class="ar514-bos">Bu kayıt henüz bir konuya bağlı değil; konu önerilmedi.</p>'}</div>`,
      footer: () => `${T.length ? `<button class="p" onclick="V51.Ara.konuAc('${T[0].id}')">${A.ogretmenMi() ? 'İlgili konuyu öğretmen görünümünde aç' : 'İlgili konuyu aç'}</button>` : ''}<button onclick="UI.close()">Kapat</button>`});
  };
  A.kartDetay = function (c, id) {
    const r = Store.get(c, id); if (!r) return;
    const t = r.topicId && Store.get('topics', r.topicId), tok = t && gor(t), ogr = A.ogretmenMi();
    const kz = ogr ? (r.outcomeIds || []).map((o) => Store.get('outcomes', o)).filter(Boolean) : [];
    const govde = c === 'questions'
      ? `<p class="ar514-s">${e(r.text)}</p>${(r.options || []).length ? `<ol class="ar514-op" type="A">${r.options.map((o, i) => `<li class="${ogr && i === r.answer ? 'dogru' : ''}">${e(o)}${ogr && i === r.answer ? ' <b>✓ doğru cevap</b>' : ''}</li>`).join('')}</ol>` : ''}${ogr && r.explanation ? `<p class="ar514-ac"><b>Açıklama:</b> ${e(r.explanation)}</p>` : ''}`
      : `<div class="ar514-kart"><p><span class="ar514-k">Ön yüz</span>${e(r.question)}</p>${ogr ? `<p><span class="ar514-k">Arka yüz</span>${e(r.answer)}</p>` : ''}</div>`;
    UI.sheet({title: c === 'questions' ? (ogr ? 'Soru incelemesi' : 'Soru') : (ogr ? 'Bilgi kartı incelemesi' : 'Bilgi kartı'),
      body: () => `<div class="ar514-d"><div class="ar514-m">${meta(r, t && t.unitId)}</div>${govde}${kz.length ? `<p class="ar514-kz"><b>Kazanım:</b> ${kz.map((o) => `<code>${e(o.code)}</code> ${e(o.title)}`).join('<br>')}</p>` : ''}${tok ? `<p class="ar514-kn"><b>Bağlı olduğu konu:</b> ${e(t.title)}</p>` : '<p class="ar514-bos">Bu kayıt görünür bir konuya bağlı değil; başka konuya yönlendirilmedi.</p>'}</div>`,
      footer: () => `${tok ? `<button class="p" onclick="V51.Ara.konuAc('${t.id}','${tabFor(c)}')">${ogr ? 'Konuyu öğretmen görünümünde aç' : 'Konuyu aç'}</button>` : ''}<button onclick="UI.close()">Kapat</button>`});
  };
  A.kazDetay = function (id) {
    const o = Store.get('outcomes', id); if (!o) return;
    const T = Store.all('topics').filter((t) => (t.outcomeIds || []).includes(id) && t.programYear === o.programYear && gor(t));
    UI.sheet({title: 'Kazanım ' + (o.code || ''), body: () => `<div class="ar514-d"><div class="ar514-m">${meta(o, o.unitId)}</div><p class="ar514-s"><code>${e(o.code)}</code> ${e(o.title || o.text)}</p>${(o.subProcesses || []).length ? `<details class="ar514-sp"><summary>Süreç bileşenleri (${o.subProcesses.length})</summary>${o.subProcesses.map((x) => `<p>${e(x.key)}) ${e(x.text)}</p>`).join('')}</details>` : ''}
      <h3 class="ar514-h">İlgili konular</h3>${T.length ? `<div class="ar514-tl">${T.map((t) => `<button onclick="V51.Ara.konuAc('${t.id}')"><b>${e(t.title)}</b><small>${t.sections ? 'öğrenci içeriği var' : 'içerik henüz hazırlanmadı'}</small></button>`).join('')}</div>` : '<p class="ar514-bos">Bu kazanıma bağlı konu kaydı bulunmuyor; başka konuya yönlendirilmedi.</p>'}</div>`,
      footer: () => `<button onclick="UI.close()">Kapat</button>`});
  };
  A.uniteDetay = function (id) {
    const u = Store.get('units', id); if (!u) return;
    const T = Store.all('topics').filter((t) => t.unitId === id && gor(t)).sort((a, b) => (a.order || 0) - (b.order || 0));
    const O = Store.all('outcomes').filter((o) => o.unitId === id).sort((a, b) => (a.order || 0) - (b.order || 0));
    UI.sheet({title: u.order + '. Ünite: ' + u.title, body: () => `<div class="ar514-d"><div class="ar514-m">${meta(u, id)}</div><h3 class="ar514-h">Konular (${T.length})</h3>${T.length ? `<div class="ar514-tl">${T.map((t) => `<button onclick="V51.Ara.konuAc('${t.id}')"><b>${e(t.title)}</b><small>${t.parentId ? 'alt konu' : 'konu'}</small></button>`).join('')}</div>` : '<p class="ar514-bos">Bu ünite için konu kaydı yok.</p>'}
      <h3 class="ar514-h">Kazanımlar (${O.length})</h3>${O.map((o) => `<p class="ar514-kz"><code>${e(o.code)}</code> ${e(o.title)}</p>`).join('') || '<p class="ar514-bos">Kaynakta veri bulunmuyor.</p>'}</div>`, footer: () => `<button onclick="UI.close()">Kapat</button>`});
  };

  /* ---------- 6. Altın araması (Altın tasarımı ve yönlendirmesi) ---------- */
  A.altin = {q: '', tur: '', ac: {}};
  A.altinAc = function (c, id) {
    if (c === 'topics') return A.konuAc(id);
    if (c === 'units') { const u = Store.get('units', id); UI.close(); return go('punite', {pg: u.grade, pu: id}); }
    if (c === 'outcomes') { const en = A.liste('altin').find((x) => x.c === 'outcomes' && x.id === id); if (en && en.tid) return A.konuAc(en.tid); return; }
    if (c === 'questions' || c === 'flashcards') { const r = Store.get(c, id), t = r && Store.get('topics', r.topicId); if (t && gor(t)) return A.konuAc(t.id, tabFor(c)); return A.kartDetay(c, id); }
    return A.detay('entities' === A.COL[c] ? 'entities' : 'concepts', id);
  };
  const altinHTML = function () {
    const s = A.altin, q = s.q;
    if (tn(q).length < 2) return `<p class="p39-mut">En az iki harf yaz. Konular, üniteler, kavramlar, kişiler ve eserler, sorular ve bilgi kartları aranır; her sınıfta Altın’da seçili program.</p>`;
    const R = A.bul(A.liste('altin'), q), cats = A.TUR.filter(([k]) => R[k]);
    if (!cats.length) return `<p class="p39-mut">“${e(q)}” için sonuç yok. (Her sınıfta Altın’da seçili programın kayıtlarında arar.)</p>`;
    const cip = `<div class="ar514-cip" role="group" aria-label="Sonuç türü">${[['', 'Tümü']].concat(cats).map(([k, l]) => `<button type="button" class="${s.tur === k ? 'on' : ''}" aria-pressed="${s.tur === k}" onclick="V51.Ara.altinTur('${k}')">${e(l)}${k ? ` <small>${R[k].length}</small>` : ''}</button>`).join('')}</div>`;
    const goster = s.tur ? cats.filter(([k]) => k === s.tur) : cats;
    return cip + goster.map(([k, l]) => { const L = R[k], n = s.tur || s.ac[k] ? 80 : 4; return `<section class="ar514-g"><h4>${e(l)} <small>${L.length}</small></h4>${L.slice(0, n).map(([, en]) => { const u = Store.get('units', en.us && en.us[0]); return `<button class="p39-ri" data-c="${k}" onclick="V51.Ara.altinAc('${k}','${en.id}')"><b>${e(en.t.length > 110 ? en.t.slice(0, 109) + '…' : en.t)}</b><small>${e(A.TEK[k])} · ${en.g}. sınıf${u ? ' · ' + e(u.title) : ''}</small></button>`; }).join('')}${L.length > n ? `<button class="ar514-daha" onclick="V51.Ara.altinAcGrup('${k}')">Tümünü göster (${L.length})</button>` : ''}</section>`; }).join('');
  };
  A.altinYaz = function () { const r = document.getElementById('p39r'); if (r) r.innerHTML = altinHTML(); };
  A.altinTur = function (k) { A.altin.tur = k; A.altinYaz(); };
  A.altinAcGrup = function (k) { A.altin.ac[k] = 1; A.altinYaz(); };
  if (typeof V39 !== 'undefined') {
    V39.araEski = V39.ara; V39.araSonucEski = V39.araSonuc;
    V39.ara = function () {
      if (A.ogretmenMi()) { go('ogara', {}); return; }
      A.altin.tur = ''; A.altin.ac = {};
      UI.sheet({title: 'Altın Öğrenme Alanı’nda ara', body: () => `<input id="p39q" class="p39-in" type="search" autocomplete="off" enterkeyhint="search" placeholder="Konu, kavram, kişi, soru, kart…" aria-label="Ara" value="${e(A.altin.q)}" oninput="V39.araSonuc(this.value)"><div id="p39r" class="p39-rs ar514-r" aria-live="polite">${altinHTML()}</div>`});
      setTimeout(() => { const i = document.getElementById('p39q'); if (i) i.focus(); }, 120);
    };
    V39.araSonuc = function (q) { A.altin.q = q || ''; A.altin.ac = {}; clearTimeout(A._at); A._at = setTimeout(A.altinYaz, 120); };
  }

  /* ---------- 7. Öğretmen Arama Merkezi (rota 'ogara') ---------- */
  A.ogr = {q: '', g: '', py: '', c: '', u: '', n: 60};
  const ogrSonuc = function () {
    const s = A.ogr; if (tn(s.q).length < 2) return {R: {}, L: []};
    const f = (en) => (!s.g || en.g == s.g) && (!s.py || en.py === s.py) && (!s.u || (en.us || []).includes(s.u));
    const R = A.bul(A.liste('ogretmen'), s.q, f);
    const L = A.TUR.filter(([k]) => R[k] && (!s.c || s.c === k)).flatMap(([k]) => R[k]).sort((a, b) => b[0] - a[0]);
    return {R, L};
  };
  const ogrSatir = function (en) {
    const r = A.kayit(en) || {}, uid = en.us && en.us[0], u = Store.get('units', uid), t = en.tid && Store.get('topics', en.tid);
    const ek = (en.c === 'questions' || en.c === 'flashcards') && t ? `<span class="ar514-ek">Konu: ${e(t.title)}</span>` : (en.c === 'concepts' || en.rc === 'entities') && !(r.topicIds || []).length ? '<span class="ar514-ek">Bağlı konu yok</span>' : '';
    return `<button class="ar514-sn" data-c="${en.c}" onclick="V51.Ara.ogrAc('${en.c}','${en.id}')"><span class="ar514-tur">${e(A.TEK[en.c])}</span><b>${e(en.t.length > 160 ? en.t.slice(0, 159) + '…' : en.t)}</b><span class="ar514-mt"><span>${en.g}. sınıf</span><span>${e(progLab(en.py))}</span>${u ? `<span>${u.order}. Ünite: ${e(u.title)}</span>` : (en.us || []).length > 1 ? '<span>birden çok ünite</span>' : ''}</span>${ek}</button>`;
  };
  A.ogrSonucHTML = function () {
    const s = A.ogr; if (tn(s.q).length < 2) return `<div class="ar514-bilgi"><b>Bütün sınıflarda ve programlarda ara</b><span>Konu, ünite, kazanım (kod veya metin), kavram, kişi/eser, soru ve bilgi kartı. Sonuçlar öğretmen görünümünde açılır; öğrenci modun değişmez.</span></div>`;
    const {R, L} = ogrSonuc();
    if (!L.length) return `<p class="ar514-bos">“${e(s.q)}” için sonuç yok. Süzgeçleri genişletmeyi dene.</p>`;
    const say = A.TUR.filter(([k]) => R[k]).map(([k, l]) => `<button type="button" class="${s.c === k ? 'on' : ''}" onclick="V51.Ara.ogrSec('c','${s.c === k ? '' : k}')">${e(l)} <small>${R[k].length}</small></button>`).join('');
    return `<div class="ar514-cip" role="group" aria-label="Türe göre süz">${say}</div><p class="ar514-sy">${L.length} sonuç${L.length > s.n ? ' · ilk ' + s.n + ' gösteriliyor' : ''}</p><div class="ar514-lis">${L.slice(0, s.n).map(([, en]) => ogrSatir(en)).join('')}</div>${L.length > s.n ? `<button class="ar514-daha" onclick="V51.Ara.ogr.n+=60;V51.Ara.ogrYaz()">Daha fazla göster</button>` : ''}`;
  };
  A.ogrYaz = function () { const r = document.getElementById('ar514-sonuc'); if (r) r.innerHTML = A.ogrSonucHTML(); };
  A.ogrQ = function (v) { A.ogr.q = v; A.ogr.n = 60; G.oaq = v; clearTimeout(A._ot); A._ot = setTimeout(A.ogrYaz, 160); };
  A.ogrSec = function (k, v) { A.ogr[k] = v; if (k === 'g' || k === 'py') A.ogr.u = ''; A.ogr.n = 60; if (k === 'c') { A.ogrYaz(); const sl = document.getElementById('ar514-c'); if (sl) sl.value = v; return; } draw(); };
  const sec = (k, lab, opts) => `<label class="ar514-f"><span>${lab}</span><select ${k === 'c' ? 'id="ar514-c"' : ''} onchange="V51.Ara.ogrSec('${k}',this.value)">${opts.map(([v, t]) => `<option value="${v}" ${String(A.ogr[k] || '') === String(v) ? 'selected' : ''}>${e(t)}</option>`).join('')}</select></label>`;
  A.ogrAc = function (c, id) {
    if (c === 'topics') return A.konuAc(id);
    if (c === 'units') return A.uniteDetay(id);
    if (c === 'outcomes') return A.kazDetay(id);
    if (c === 'questions' || c === 'flashcards') return A.kartDetay(c, id);
    return A.detay(A.COL[c], id);
  };
  if (typeof V30 !== 'undefined' && V30.routes) {
    V30.routes.ogara = function () {
      if (!ogrOk()) { go('home'); return; }
      if (typeof G.oaq === 'string' && G.oaq !== A.ogr.q) A.ogr.q = G.oaq;
      const s = A.ogr, U = s.g ? Store.all('units').filter((u) => u.grade == s.g && (!s.py || u.programYear === s.py)).sort((a, b) => String(a.programYear).localeCompare(String(b.programYear)) || a.order - b.order) : [];
      $.innerHTML = `<div class="ar514 og-wrap"><header class="og-top ar514-ust"><div><p class="ar514-ey">Öğretmen Modu</p><h1>Öğretmen Araması</h1><p class="sub">Bütün sınıflar ve programlar · sonuçlar öğretmen görünümünde açılır</p></div><button class="ar514-geri" onclick="go('ogretmen')">← Öğretmen paneli</button></header>
        <div class="ar514-kut"><input id="ar514-q" type="search" autocomplete="off" enterkeyhint="search" value="${e(s.q)}" placeholder="Konu, kazanım kodu, kavram, kişi, soru, kart…" aria-label="Öğretmen araması" oninput="V51.Ara.ogrQ(this.value)"></div>
        <div class="ar514-fs">${sec('g', 'Sınıf', [['', 'Tüm sınıflar']].concat([4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => [g, g + '. sınıf'])))}${sec('py', 'Müfredat', [['', '2018 ve 2026'], ['2018', '2018 Programı'], ['2026', '2026 TYMM']])}${sec('c', 'İçerik türü', [['', 'Tüm türler']].concat(A.TUR))}${s.g ? sec('u', 'Ünite', [['', 'Tüm üniteler']].concat(U.map((u) => [u.id, (s.py ? '' : progLab(u.programYear) + ' · ') + u.order + '. ' + u.title]))) : '<label class="ar514-f kapali"><span>Ünite</span><select disabled><option>Önce sınıf seç</option></select></label>'}</div>
        <div id="ar514-sonuc" aria-live="polite">${A.ogrSonucHTML()}</div></div>`;
      if (!s.q) setTimeout(() => { const i = document.getElementById('ar514-q'); if (i) i.focus({preventScroll: true}); }, 60);
    };
  }
  /* öğretmen bağlamında her arama Öğretmen Arama Merkezi'ne gider (Elmas/Altın araması açılmaz) */
  const go0 = go;
  go = function (v, a) {
    if (v === 'search' && A.ogretmenMi()) { const q = a && a.q; arguments[0] = 'ogara'; arguments[1] = Object.assign({}, a || {}); if (q) { A.ogr.q = q; arguments[1].oaq = q; } delete arguments[1].q; return go0.apply(this, arguments); }
    return go0.apply(this, arguments);
  };
})();
