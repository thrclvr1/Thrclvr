/* ===================== V51.1: bildirim gönderme, öğretmen paneli ayrımı, ayrı editör girişi =====================
   1. İçerik/soru bildir penceresi — KÖK NEDEN: V50'de eklenen Altın alt menüsü (#bn50) z-index 900 ile açılan alt
      pencerenin (.v-ov, z-index 80) önüne geçiyor, pencerenin alt kısmındaki “Bildir” düğmesini örtüyordu.
      Düzeltme (v511.css): alt menüler pencere açıkken gizlenir ve pencerenin altında kalır; pencere altlığı
      (footer) güvenli alan payıyla her zaman görünür. Gönderim: çift gönderim engellenir, “Gönderiliyor…” durumu,
      bildirim önce cihaza kaydedilir (kaybolmaz), sunucu yanıtı gelmeden “gönderildi” denmez; sunucuya
      ulaşılamazsa pencere AÇIK kalır, kategori ve açıklama korunur, “Tekrar dene” sunulur.
      Profilim › Bildirimlerim: “Bu cihazda kayıtlı” / “Gönderildi” ayrımı ve kayıt başına “Yeniden gönder”.
   2. Öğretmen paneli: Ana Panel'deki editör onayı kartı kaldırıldı; öğretmen ekranında editör/yönetici bölümü yok.
   3. Ayrı Yönetici/Editör girişi: Mod paneli › “Yönetici / Editör girişi” (editör PIN'i; mevcut sistem aynen).
      Editör alanındaki “Öğretmen paneli” düğmesi yerine “Editör alanından çık”. */
(function () {
  const V51 = window.V51 = window.V51 || {};

  /* ---------- 1. V48 bildirim gönderimi ---------- */
  if (window.V48 && V48.Bildir) {
    const B = V48.Bildir;
    const uuid = () => { try { return crypto.randomUUID(); } catch (e) { return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); } };
    const rol = () => { try { if (V36.ok()) return 'ogretmen'; } catch (e) {} return 'ogrenci'; };
    const surum = () => { try { return V31.VER; } catch (e) { return ''; } };
    const ac0 = B.ac;
    B.ac = function () { B._gidiyor = false; const r = ac0.apply(this, arguments); if (B._f) B._f.id = uuid(); return r; };
    const dugme = () => document.querySelector('.v-sf button.p');
    const durumYaz = (t, hata) => { const h = document.getElementById('b48-h'); if (h) { h.textContent = t || ''; h.classList.toggle('b51-bilgi', !!t && !hata); } };
    B.gonder = async function () {
      const f = B._f; if (!f || B._gidiyor) return;   // çift gönderim yok
      if (!f.kat) { durumYaz('Lütfen bir bildirim türü seç.', true); return; }
      B._gidiyor = true;
      const btn = dugme(), sunucu = B.sunucuVar();
      if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = sunucu ? 'Gönderiliyor…' : 'Kaydediliyor…'; }
      durumYaz('');
      // 1) önce bu cihaza kaydet (aynı kimlikle; tekrar denemede çift kayıt olmaz)
      const o = B.oku(), k = {id: f.id || (f.id = uuid()), tur: f.tur, kategori: f.kat, aciklama: String(f.ack || '').trim().slice(0, 1000), anonim: !!f.anonim, kaynak: rol(), baglam: f.b, tarih: new Date().toISOString(), surum: surum(), durum: 'taslak', gonderim: null};
      const i = o.liste.findIndex((x) => x.id === k.id);
      if (i >= 0) { if (o.liste[i].durum === 'gonderildi') { B._gidiyor = false; UI.close(); B._f = null; return; } o.liste[i] = Object.assign(o.liste[i], k); } else o.liste.unshift(k);
      o.liste = o.liste.slice(0, 300); B.yaz(o);
      if (!sunucu) {
        B._gidiyor = false; B._f = null; UI.close();
        UI.toast('Bildirimin bu cihazda kayıtlı. Merkezi sunucu bağlı olmadığı için gönderilmedi (Profilim › Bildirimlerim).'); B.isaret(); return;
      }
      // 2) sunucuya gönder; yanıt gelmeden başarı denmez
      let gitti = false; try { gitti = await B.tekGonder(k.id); } catch (e) { gitti = false; }
      B._gidiyor = false;
      if (gitti) { B._f = null; UI.close(); UI.toast('Teşekkürler. Bildirimin editöre gönderildi.'); B.isaret(); return; }
      const son = (B.oku().liste.find((x) => x.id === k.id) || {}).gonderim || {};
      durumYaz(`Sunucuya ulaşılamadı${son.hata && /^HTTP \d+/.test(son.hata) ? ' (' + son.hata + ')' : ''}. Bildirimin bu cihazda kayıtlı; seçimin ve açıklaman duruyor. “Tekrar dene” ya da kapat (bağlantı gelince kendiliğinden gönderilir).`, true);
      const b2 = dugme(); if (b2) { b2.disabled = false; b2.removeAttribute('aria-busy'); b2.textContent = 'Tekrar dene'; }
    };
    // tek kaydı yeniden gönder (Profilim ve Sorun Bildir listesi)
    B.yenidenGonder = async function (id, el) {
      if (!B.sunucuVar()) { UI.toast('Hesap sunucusu bağlı değil; bildirim bu cihazda kayıtlı kalır.'); return false; }
      if (el) { el.disabled = true; el.textContent = 'Gönderiliyor…'; }
      let ok = false; try { ok = await B.tekGonder(id); } catch (e) {}
      UI.toast(ok ? 'Bildirim editöre gönderildi.' : 'Gönderilemedi; bildirim bu cihazda kayıtlı kalıyor.');
      if (el) { el.disabled = false; el.textContent = 'Yeniden gönder'; }
      try { B.isaret(); if (window.V51 && V51.Ogretmen && V51.Ogretmen.yenile) V51.Ogretmen.yenile(); } catch (e) {}
      return ok;
    };
    B.durumEtiket = function (k) {
      if (k.durum === 'gonderildi') return [k.sunucuDurum === 'duzeltildi' ? 'ok' : k.sunucuDurum === 'gecersiz' ? 'kt' : 'uy', 'Gönderildi · ' + (B.DURUM[k.sunucuDurum] || 'Yeni')];
      return ['bek', k.gonderim && k.gonderim.hata ? 'Bu cihazda kayıtlı · gönderilemedi' : 'Bu cihazda kayıtlı'];
    };
    const prBos = B.profilHTML;   // V49: boş durum kartı
    B.profilHTML = function () {
      const L = B.oku().liste, t = L.filter((x) => x.durum === 'taslak').length, sv = B.sunucuVar();
      if (!L.length && prBos) return prBos.apply(this, arguments);
      return `<section class="card p46-s b48-p"><div class="pr49-bas"><h2>Bildirimlerim</h2><span class="pr49-sayi">${L.length}</span></div>${L.length ? `<p class="small">${L.length} bildirim${t ? ` · <b>${t} bu cihazda kayıtlı</b> (${sv ? 'gönderilmedi; bağlantı olunca kendiliğinden gönderilir' : 'hesap sunucusu bağlı değil'})` : ''}.</p>
<details class="b48-pl"><summary>Listeyi göster</summary><ul>${L.slice(0, 40).map((k) => { const d = B.durumEtiket(k); return `<li><span class="d43 ${d[0]}">${d[1]}</span><b>${esc(k.kategori)}</b><small>${esc((k.baglam && (k.baglam.konu || k.baglam.soruId || k.baglam.bolumAd)) || '')}${k.baglam && k.baglam.soruId ? ' · ' + esc(k.baglam.soruId) : ''} · ${new Date(k.tarih).toLocaleDateString('tr-TR')}</small>${k.gerekce ? `<em>Editör notu: ${esc(k.gerekce)}</em>` : ''}${k.durum === 'taslak' && sv ? `<button type="button" class="b51-yg" onclick="V48.Bildir.yenidenGonder('${esc(k.id)}',this)">Yeniden gönder</button>` : ''}</li>`; }).join('')}</ul></details>
<div class="p46-bb">${t && sv ? '<button type="button" onclick="V48.Bildir.gonderBekleyen()">Bekleyenlerin hepsini gönder</button>' : ''}<button type="button" onclick="V48.Bildir.disaAktar()">Dışa aktar (JSON)</button>${sv ? '<button type="button" onclick="V48.Bildir.durumlariAl().then(V48.Bildir.isaret)">Durumları yenile</button>' : ''}</div>
${sv ? '' : '<p class="small mut">Merkezi gönderim için hesap sunucusu kurulmalı ve Google ile giriş yapılmalı. O zamana kadar bildirimlerin bu cihazda kayıtlı kalır; dışa aktardığın dosyayı iletebilirsin.</p>'}` : '<p class="small mut">Henüz bildirim yok. Konu sayfalarının sonundaki “İçerik hatası bildir” ve soruların altındaki “Soruyu bildir” düğmeleriyle hata bildirebilirsin.</p>'}</section>`;
    };
  }

  /* ---------- 2. öğretmen paneli: editör bölümü yok ---------- */
  if (V51.Ogretmen) {
    V51.Ogretmen.anaPanel = () => '';
    // Sorun Bildir: çift gönderim engeli + listede yeniden gönder
    const g0 = V51.Ogretmen.gonder;
    V51.Ogretmen.gonder = function (ev) {
      if (V51.Ogretmen._gidiyor) { if (ev) ev.preventDefault(); return false; }
      const n0 = V51.Ogretmen.liste().length;
      const r = g0.apply(this, arguments);
      if (V51.Ogretmen.liste().length > n0) {   // kayıt oluştu: kısa süre ikinci dokunuşu engelle (doğrulama hatasında kilit yok)
        V51.Ogretmen._gidiyor = true; const b = document.querySelector('.sb51-f button[type=submit]'); if (b) { b.disabled = true; b.setAttribute('aria-busy', 'true'); }
        setTimeout(() => { V51.Ogretmen._gidiyor = false; const b2 = document.querySelector('.sb51-f button[type=submit]'); if (b2) { b2.disabled = false; b2.removeAttribute('aria-busy'); } }, 800);
      }
      return r;
    };
    const s0 = V51.Ogretmen.sorunHTML;
    V51.Ogretmen.sorunHTML = OGRT.EXT.sorun = function () {
      let h = s0.apply(this, arguments)
        .replace('Uygulamada fark ettiğin bir hatayı ya da sorunu editöre bildir. Bildirim içerik kayıtlarını değiştirmez; editör inceler.', 'Uygulamada fark ettiğin bir hatayı ya da sorunu bildir. Bildirimin içerik kayıtlarını değiştirmez; incelenir ve durumu aşağıda görünür.')
        .replace('Hesap sunucusu bağlı: bildirim editöre gönderilir.', 'Hesap sunucusu bağlı: bildirim merkezi sisteme gönderilir.')
        .split('>Editöre gönderildi<').join('>Gönderildi<').split('>Editör: ').join('>Durum: ');
      try { const sv = V48.Bildir.sunucuVar(); if (sv) { const T = V51.Ogretmen.liste().filter((k) => k.durum === 'taslak'); T.forEach((k) => { h = h.replace(`kayıt no ${esc(String(k.id).slice(0, 8))}</small>`, `kayıt no ${esc(String(k.id).slice(0, 8))}</small><button type="button" class="b51-yg" onclick="V48.Bildir.yenidenGonder('${esc(k.id)}',this)">Yeniden gönder</button>`); }); } } catch (e) {}
      return h;
    };
  }
  if (typeof V44 !== 'undefined') {
    V44.giris = function () {
      UI.sheet({title: 'Öğretmen modu', body: () => `<div class="g44"><p class="small">Öğrenciler için giriş gerekmez.</p>
<button type="button" class="g44-b" onclick="UI.close();V36.ss(V36.SK,'1');go('ogretmen')"><b>Öğretmen paneli</b><small>Haftalık plan, sınıflarım, sorun bildir</small></button></div>`});
    };
  }

  /* ---------- 3. ayrı Yönetici / Editör girişi ---------- */
  V51.editorGiris = function () { try { UI.close(); } catch (e) {} setTimeout(() => go('editor'), 220); };
  if (window.V50 && V50.Mod && V50.Mod.ac) {
    const ac0 = V50.Mod.ac;
    V50.Mod.ac = function () {
      const r = ac0.apply(this, arguments);
      try { const b = V50.Mod._ac && V50.Mod._ac.box; const g = b && b.querySelector('.mk50-giris'); if (g && !b.querySelector('.ed51-giris')) g.insertAdjacentHTML('afterend', '<button type="button" class="ed51-giris" onclick="V51.editorGiris()">Yönetici / Editör girişi <small>(ayrı editör PIN’i)</small></button>'); } catch (e) {}
      return r;
    };
  }
  if (typeof V38 !== 'undefined' && V38.edHomeHTML) {
    const h0 = V38.edHomeHTML;
    V38.edHomeHTML = function () { return h0.apply(this, arguments).replace(`<button class="v38-b" onclick="go('ogretmen')">Öğretmen paneli</button>`, `<button class="v38-b" onclick="go('home')">Editör alanından çık</button>`); };
    V38.edHead0 = V38.edHead;
  }
  if (typeof navKey === 'function') { const nk0 = navKey; navKey = function () { return view === 'editor' ? '' : nk0.apply(this, arguments); }; }
  if (V51.Yayin && V51.Yayin.uyari) {
    V51.Yayin.uyari = function () {
      $.innerHTML = `<section class="card ue51" role="alert" aria-labelledby="ue51h"><h1 id="ue51h">Bu sayfa editör alanına ait</h1>
<p>Ders kitabı künyeleri, kaynak listeleri, sayfa eşleştirmeleri, doğrulama ve veri yönetimi ekranları yalnız editör yetkisiyle açılır. Öğrenme alanında bu bilgiler gösterilmez; içerikteki durumları buradan değiştiremezsin.</p>
<p class="small mut">Editörsen: Mod düğmesi › Yönetici / Editör girişi (ayrı editör PIN’i).</p>
<div class="row"><button class="p" onclick="go('home')">Ana sayfaya dön</button></div></section>`;
    };
  }
})();
