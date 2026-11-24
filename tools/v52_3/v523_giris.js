/* ===================== V52.3: Ayrı giriş ekranı (APK) =====================
   Uygulama açılınca, içerik görünmeden önce tam ekran bir giriş ekranı gelir (#gir523). Yalnız iki seçenek vardır:
     • “Google ile giriş”  → doğrudan telefonun kendi Google hesap listesi (V52.1 köprüsü 'hesap-sec') → seçilen hesapla girilir.
     • “Misafir olarak devam et” → hesapsız; ilerleme telefonda kalır.
   Ekranda kayıtlı hesap, e-posta ya da şifre gösterilmez. Giriş ekranı açıkken uygulamanın geri kalanı görünmez (visibility).
   Yönetici hesabıyla girilirse doğrudan yönetici şifresi ekranına (go('editor')) gidilir; diğer hesaplar öğrenme alanına.
   Kayıt: localStorage dk-giris523 = {v:1, tur:'google'|'misafir', t}. Google girişi açıkken ya da misafir seçilmişken ekran tekrar gelmez;
   “Çıkış yap” giriş ekranını geri getirir. Yalnız APK'da (telefondaki hesap seçici yolu, V52.Cihaz.mi()) etkin; tarayıcıda değişiklik yok. */
(function () {
  if (!window.V52 || !V52.Cihaz || !V52.Tek || !window.V51 || !V51.Android || typeof V46 === 'undefined') return;
  const C = V52.Cihaz, T = V52.Tek, G = V52.Google, H = V46.Hesap, Y = V51.Yonetici;
  const GI = V52.Giris = {K: 'dk-giris523', ID: 'gir523'};
  const ls = {al: (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } }, yaz: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }};

  GI.etkin = () => C.mi();
  GI.kayit = () => { const r = ls.al(GI.K); return r && r.v === 1 ? r : null; };
  GI.girildi = () => { const r = GI.kayit(); if (!r) return false; if (r.tur === 'google') return G.yerelGiris(); return r.tur === 'misafir'; };
  GI.gerekli = () => GI.etkin() && !GI.girildi();

  const GLOGO = '<svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  const CSS = `
html.gir523-acik{overflow:hidden}
html.gir523-acik body>*:not(#gir523):not(script):not(style){visibility:hidden!important}
html.gir523-acik body>#gir523.g523:not(#g523-a):not(#g523-b):not(#g523-c){visibility:visible!important}
#gir523{outline:none;position:fixed;inset:0;z-index:9800;display:flex;align-items:center;justify-content:center;padding:max(24px,env(safe-area-inset-top)) 20px max(24px,env(safe-area-inset-bottom));
  background:radial-gradient(120% 80% at 50% 0%,#2a2416 0%,#14120d 45%,#0b0a08 100%);color:#f3ead6;font-family:inherit;overflow:auto}
#gir523 .g523-k{width:100%;max-width:400px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px}
#gir523 .g523-l{width:84px;height:84px;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,.45),0 0 0 1px rgba(214,178,94,.35)}
#gir523 h1{margin:6px 0 0;font-size:1.55rem;line-height:1.25;font-weight:700;color:#f6ecd2}
#gir523 .g523-a{margin:0 0 10px;font-size:1rem;color:#cdbf9c}
#gir523 .g523-b{width:100%;display:flex;align-items:center;gap:14px;min-height:64px;padding:12px 18px;border-radius:16px;font:inherit;text-align:left;cursor:pointer;border:1px solid rgba(214,178,94,.45)}
#gir523 .g523-b b{display:block;font-size:1.06rem}
#gir523 .g523-b small{display:block;font-size:.86rem;opacity:.85;margin-top:2px}
#gir523 .g523-g{background:#fff;color:#1f1f1f;border-color:#fff}
#gir523 .g523-g .g523-i{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff;flex:none}
#gir523 .g523-m{background:rgba(255,255,255,.06);color:#f3ead6}
#gir523 .g523-m .g523-i{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(214,178,94,.18);color:#e9cf8a;flex:none}
#gir523 .g523-b:focus-visible{outline:3px solid #e9cf8a;outline-offset:3px}
#gir523 .g523-b[disabled]{opacity:.6;cursor:progress}
#gir523 .g523-d{min-height:1.4em;margin:2px 0 0;font-size:.92rem;color:#f1c27a}
#gir523 .g523-n{margin:8px 0 0;font-size:.82rem;color:#a99a78}
html[data-gir523] #uye39 .hs46-sec{display:none!important}
`;
  try { const st = document.createElement('style'); st.id = 'gir523-css'; st.textContent = CSS; document.head.appendChild(st); } catch (x) {}

  GI.html = function () {
    const logo = (typeof V31 !== 'undefined' && V31.EMB && V31.EMB.s128) ? `<img class="g523-l" src="${V31.EMB.s128}" width="84" height="84" alt="" decoding="async">` : '';
    return `<div class="g523-k">${logo}<h1 id="gir523-h">Din Kültürü ve Ahlak Bilgisi</h1><p class="g523-a">Devam etmek için giriş yap</p>
<button type="button" class="g523-b g523-g" onclick="V52.Giris.google()"><span class="g523-i">${GLOGO}</span><span><b>Google ile giriş</b><small>Telefondaki Google hesabını seç</small></span></button>
<button type="button" class="g523-b g523-m" onclick="V52.Giris.misafir()"><span class="g523-i" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg></span><span><b>Misafir olarak devam et</b><small>Hesap gerekmez; ilerlemen bu telefonda saklanır</small></span></button>
<p class="g523-d" id="gir523-d" role="status" aria-live="polite"></p>
<p class="g523-n">Öğrenci ve yönetici girişi Google hesabıyla yapılır.</p></div>`;
  };
  GI.ac = function () {
    if (document.getElementById(GI.ID)) return;
    const d = document.createElement('div'); d.id = GI.ID; d.className = 'g523'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'gir523-h');
    d.innerHTML = GI.html(); document.body.appendChild(d);
    document.documentElement.classList.add('gir523-acik');
    d.tabIndex = -1; setTimeout(() => { try { d.focus({preventScroll: true}); } catch (x) {} }, 50);
  };
  GI.kapat = function () {
    const d = document.getElementById(GI.ID); if (d) d.remove();
    document.documentElement.classList.remove('gir523-acik');
  };
  GI.yaz = (m) => { const d = document.getElementById('gir523-d'); if (d) d.textContent = m || ''; };
  GI.mesgul = (v) => { document.querySelectorAll('#gir523 .g523-b').forEach((b) => { b.disabled = !!v; }); };

  GI.google = async function () {
    if (GI._calisiyor) return; GI._calisiyor = 1; GI.mesgul(1); GI.yaz('');
    try {
      const eposta = await C.sec();
      const o = H.oku(); o.mod = 'google'; o.yerel = 1; o.cihaz = 1; o.oturum = ''; o.hata = ''; o.misafir = 0;
      o.kullanici = {ad: eposta, eposta, roller: ['ogrenci'], o: await C.ozet(eposta)}; o.son = new Date().toISOString(); H.yaz(o);
      ls.yaz(GI.K, {v: 1, tur: 'google', t: new Date().toISOString()});
      try { Y.durum.asama = 'bekle'; Y.durum.mesaj = ''; } catch (x) {}
      GI.kapat();
      if (T.yoneticiHesap()) { try { V39.secim(false); } catch (x) {} go('editor'); UI.toast('Yönetici hesabıyla giriş yapıldı.'); }
      else { if (!document.getElementById('uye39')) go('home'); UI.toast('Google hesabıyla giriş yapıldı.'); }
    } catch (er) {
      GI.yaz(er.iptal ? '' : er.message);
    } finally { GI._calisiyor = 0; GI.mesgul(0); }
  };
  GI.misafir = function () {
    const o = H.oku(); o.misafir = 1; H.yaz(o);
    ls.yaz(GI.K, {v: 1, tur: 'misafir', t: new Date().toISOString()});
    GI.kapat();
    if (!document.getElementById('uye39')) go('home');
  };
  GI.denetle = function () {
    try { document.documentElement.toggleAttribute('data-gir523', GI.etkin()); } catch (x) {}
    if (GI.gerekli()) GI.ac(); else GI.kapat();
  };

  // çıkış: giriş ekranı geri gelir
  const ck0 = H.cikis;
  H.cikis = async function () {
    if (GI.etkin()) ls.yaz(GI.K, null);
    const r = await ck0.apply(this, arguments);
    GI.denetle();
    return r;
  };
  // Android geri tuşu giriş ekranını atlatmasın: açıkken her çizimden sonra yeniden denetlenir
  if (typeof draw === 'function') {
    const dr0 = draw;
    window.draw = draw = function () { const r = dr0.apply(this, arguments); if (GI.gerekli() && !document.getElementById(GI.ID)) GI.ac(); return r; };
  }
  // odak giriş ekranında kalsın
  document.addEventListener('focusin', (ev) => { const d = document.getElementById(GI.ID); if (d && !d.contains(ev.target)) { try { d.focus({preventScroll: true}); } catch (x) {} } }, true);

  GI.denetle();
  setTimeout(GI.denetle, 0);
})();
