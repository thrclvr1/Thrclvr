// V51.3 paketli HTML'i okunur hâle getirir (tools/v51_3/paket513.py ac() ile aynı; testler ve gerileme için).
// Kullanım: const ac = require('./ac513.js'); const okunur = ac(fs.readFileSync(dosya, 'utf8'));
const zlib = require('zlib'), crypto = require('crypto');
const BAS = '<script id="z513-acici">', SON = '/* z513 son */</script>';
module.exports = function ac(h) {
  const i = h.indexOf(BAS); if (i < 0) return h;
  const j = h.indexOf(SON, i) + SON.length;
  h = h.slice(0, i - 1) + h.slice(j);
  return h.replace(/<script type="application\/json" id="([^"]+)" data-z513="deflate-raw;base64;sha256-16=([0-9a-f]+)">([^<]*)<\/script>/g, (m, id, oz, b) => {
    const ham = zlib.inflateRawSync(Buffer.from(b, 'base64'));
    if (crypto.createHash('sha256').update(ham).digest('hex').slice(0, 16) !== oz) throw new Error('özet uyuşmuyor: ' + id);
    return `<script type="application/json" id="${id}">` + ham.toString('utf8') + '</script>';
  });
};
if (require.main === module) { const fs = require('fs'); const [g, c] = process.argv.slice(2); const s = module.exports(fs.readFileSync(g, 'utf8')); if (c) fs.writeFileSync(c, s); else process.stdout.write(String(s.length) + '\n'); }
