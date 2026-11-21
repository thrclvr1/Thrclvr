// Kullanım (depo kökünden): node tools/v39/olcum_v39.js
// 4× yavaş CPU, dokunmatik emülasyonu: Normal sekme geçişleri (V38 ↔ V39), Öğrenme Dünyası ekranlarının çizim süreleri,
// koridorda sürükleme sırasında kare aralıkları. Medyan / 5 tekrar. Gerçek cihaz ölçümü değildir.
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'..','..');
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});fs.createReadStream(f).pipe(r)}).listen(0);
const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
(async()=>{await new Promise(r=>srv.once('listening',r));const P=srv.address().port;const b=await chromium.launch();
for(const [W,H] of [[820,1180],[390,844]]){
for(const v of ['38','39']){const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});await ctx.addInitScript(()=>localStorage.setItem('dk-deneyim39',JSON.stringify({son:'normal',hatirla:true})));
 const p=await ctx.newPage();await p.goto(`http://127.0.0.1:${P}/surumler/din-kulturu-platformu-v${v}.0.html`);await p.waitForTimeout(3000);const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const R={};const t=async(n,fn)=>{const L=[];for(let i=0;i<5;i++){L.push(await p.evaluate(fn));await p.waitForTimeout(120)}R[n]=Math.round(med(L))};
 const sw=k=>`(()=>new Promise(res=>{const t0=performance.now();document.querySelector('nav.bnav button[data-k="${k}"]').click();requestAnimationFrame(()=>requestAnimationFrame(()=>res(performance.now()-t0)))}))()`;
 for(const k of ['classes','games','home'])await t('Normal→'+k,sw(k));
 if(v==='39'){await p.evaluate(()=>{V39.on=true;go('pdunya')});await p.waitForTimeout(300);
  const fr=(fn)=>`(()=>new Promise(res=>{const t0=performance.now();(${fn})();requestAnimationFrame(()=>requestAnimationFrame(()=>res(performance.now()-t0)))}))()`;
  await t('Koridor çizimi',fr("()=>go('pdunya')"));await t('Kapı değişimi (ok)',fr("()=>V39.korGit((V39.kor.cur+1)%9)"));await t('Sınıf merkezi',fr("()=>go('psinif',{pg:8})"));
  await t('Ünite alanı',fr("()=>go('punite',{pg:8,pu:V39.units(8,V39.pv(8))[0].id})"));await t('Ders (anlatım)',fr("()=>go('pders',{pt:Store.all('topics').find(t=>t.sections&&t.grade==6).id,ptab:'anlat'})"));
  await p.evaluate(()=>go('pdunya'));await p.waitForTimeout(300);
  const box=await p.evaluate(()=>document.getElementById('p39kor').getBoundingClientRect().toJSON());const L=[];
  for(let i=0;i<3;i++){await p.evaluate(()=>{window.__f=[];let on=true;const lp=n=>{__f.push(n);if(on)requestAnimationFrame(lp)};requestAnimationFrame(lp);window.__stop=()=>on=false});
   const x0=box.x+box.width*.7,y0=box.y+box.height*.35;await p.mouse.move(x0,y0);await p.mouse.down();for(let k=1;k<=20;k++){await p.mouse.move(x0-k*12,y0);await p.waitForTimeout(16)}await p.mouse.up();await p.waitForTimeout(500);
   const f=await p.evaluate(()=>{__stop();const d=__f.slice(1).map((x,i)=>x-__f[i]);return {mx:Math.max(...d),avg:d.reduce((a,b)=>a+b,0)/d.length}});L.push(f)}
  R['Sürükleme: en uzun kare']=Math.round(med(L.map(x=>x.mx)));R['Sürükleme: ortalama kare']=Math.round(med(L.map(x=>x.avg)))}
 console.log(`${W}x${H} V${v}`,JSON.stringify(R));await ctx.close()}}
await b.close();srv.close()})();
