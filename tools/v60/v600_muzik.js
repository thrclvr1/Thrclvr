/* ===================== V60.0 (3/3): müzik biçimi =====================
   Yedi kayıtlı müzik (V42) uygulama boyutunun yarıdan fazlasıydı (64 kbps MP3, ~4,9 MB). V60'ta aynı parçalar ÖZGÜN kayıtlardan
   (kaynaklar/muzik, 192 kbps) 48 kbps Opus'a (WebM kabı) yeniden kodlandı. Opus 48 kbps, MP3 64 kbps'den daha yüksek ses kalitesi
   verir; parçalar, süreler ve adlar aynı. Biçim verinin ilk baytlarından anlaşılır (WebM: 1A 45 DF A3), eski MP3 verisi de çalar.
   Opus'u desteklemeyen bir tarayıcıda müzik açılırken bu açıkça söylenir (Android WebView ve Chrome destekler). */
(function () {
  if (typeof V42 === 'undefined' || !V42.muzikURL) return;
  const V60 = window.V60 = window.V60 || {};
  const M = V60.Muzik = {};
  M.tur = (u) => (u[0] === 0x1A && u[1] === 0x45 && u[2] === 0xDF && u[3] === 0xA3) ? 'audio/webm; codecs="opus"' : (u[0] === 0x4F && u[1] === 0x67 && u[2] === 0x67 && u[3] === 0x53) ? 'audio/ogg; codecs="opus"' : 'audio/mpeg';
  M.destek = (t) => { try { return !!document.createElement('audio').canPlayType(t); } catch (x) { return false; } };
  V42.muzikURL = function (id) {
    if (V42._url[id]) return Promise.resolve(V42._url[id]);
    return new Promise((ok, no) => {
      try {
        const e = document.getElementById('m42-' + id); if (!e) throw new Error('kayıt yok');
        const s = atob(e.textContent.trim()), n = s.length, u = new Uint8Array(n);
        for (let i = 0; i < n; i++) u[i] = s.charCodeAt(i);
        const t = M.tur(u);
        if (t !== 'audio/mpeg' && !M.destek(t)) { try { UI.toast('Bu tarayıcı müzik biçimini (Opus) desteklemiyor. Uygulamada (Android) çalar.'); } catch (x) {} throw new Error('biçim desteklenmiyor'); }
        ok(V42._url[id] = URL.createObjectURL(new Blob([u], {type: t.split(';')[0]})));
      } catch (er) { no(er); }
    });
  };
})();
