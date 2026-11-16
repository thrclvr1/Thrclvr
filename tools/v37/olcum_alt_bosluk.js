// Kullanım: node tools/v37/olcum_alt_bosluk.js <html>... — env(safe-area-inset-bottom) 0/24/48 px taklidiyle alt menünün altındaki boşluk.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const f of process.argv.slice(2))for(const [w,h] of [[390,844],[360,740],[820,1180],[1180,820],[900,500]])for(const inset of [0,24,48]){
 const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:w<700,hasTouch:true});const p=await ctx.newPage();const cdp=await ctx.newCDPSession(p);
 await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets:{bottom:inset,bottomMax:inset}});
 await p.goto('file://'+f);await p.waitForTimeout(2200);
 const r=await p.evaluate(()=>{const n=document.querySelector('nav.bnav').getBoundingClientRect();return {layout:n.width>n.height?'alt':'yan',gap:Math.round(innerHeight-n.bottom),navH:Math.round(n.height)}});
 console.log(f.split('-').pop().padEnd(10),`${w}x${h}`.padEnd(9),'inset',String(inset).padStart(2),'| menü',r.layout,'| menünün altındaki boşluk',r.gap,'px');await ctx.close()}
await b.close()})();
