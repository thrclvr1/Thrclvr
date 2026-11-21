// Kullanım: node tools/v37/olcum_boyama.js <html dosyası (mutlak yol)> <genişlik> <yükseklik> <iz dosyası.json>
// Alt sekme geçişlerinde (6 sekme × 3 tur) tarayıcı izleme kaydından boyama/rasterleştirme/katman sürelerini toplar (ms).
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [file,W,H]=[process.argv[2],+process.argv[3],+process.argv[4]];
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await ctx.newPage();
await p.goto('file://'+file);await p.waitForTimeout(3500);
const tp=process.argv[5];
await b.startTracing(p,{path:tp,categories:['devtools.timeline','disabled-by-default-devtools.timeline','cc','gpu','viz']});
for(let r=0;r<3;r++)for(const k of ['classes','pek','dene','links','games','home']){await p.click(`nav.bnav button[data-k="${k}"]`);await p.waitForTimeout(900)}
await b.stopTracing();
const ev=JSON.parse(fs.readFileSync(tp)).traceEvents||JSON.parse(fs.readFileSync(tp));
const sum={};for(const e of ev){if(e.ph!=='X'||!e.dur)continue;if(['Paint','RasterTask','PaintImage','UpdateLayerTree','Layout','UpdateLayoutTree','Layerize','PrePaint','Commit','ImageDecodeTask'].includes(e.name))sum[e.name]=(sum[e.name]||0)+e.dur/1000}
console.log(file.split('/').pop().padEnd(36),`${W}x${H}`,Object.entries(sum).map(([k,v])=>k+'='+v.toFixed(0)).join(' '));
await b.close()})();
