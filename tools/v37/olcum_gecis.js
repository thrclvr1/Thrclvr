// Kullanım: node tools/v37/olcum_gecis.js <html dosyası (mutlak yol)> <genişlik> <yükseklik> [tekrar]
// 4× yavaşlatılmış CPU ile alt sekme geçişlerinde ilk kare süresi ve en uzun kare.
const {chromium}=require('playwright');
(async()=>{const [file,W,H,R]=[process.argv[2],+process.argv[3],+process.argv[4],+(process.argv[5]||3)];
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await ctx.newPage();const cdp=await ctx.newCDPSession(p);
await p.goto('file://'+file);await p.waitForTimeout(3500);
const coarse=await p.evaluate(()=>matchMedia('(pointer:coarse)').matches);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
const keys=['classes','pek','dene','links','games','home'];const all={first:[],maxf:[],long:[]};
for(let r=0;r<R;r++)for(const k of keys){
 const t=await p.evaluate(k=>new Promise(res=>{const ts=[];const t0=performance.now();document.querySelector(`nav.bnav button[data-k="${k}"]`).click();
  const loop=now=>{ts.push(now);if(now-t0<900)requestAnimationFrame(loop);else{const d=ts.slice(1).map((x,i)=>x-ts[i]);res({first:ts[0]-t0,maxf:Math.max(...d),long:d.filter(x=>x>50).length})}};requestAnimationFrame(loop)}),k);
 all.first.push(t.first);all.maxf.push(t.maxf);all.long.push(t.long);await p.waitForTimeout(300)}
const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)],sum=a=>a.reduce((x,y)=>x+y,0);
console.log(`${file.split('/').pop().padEnd(36)} ${W}x${H} coarse=${coarse} | ilk kare medyan ${med(all.first).toFixed(0)} ms | en uzun kare medyan ${med(all.maxf).toFixed(0)} ms | >50ms kare toplam ${sum(all.long)} (${all.first.length} geçiş)`);
await b.close()})();
