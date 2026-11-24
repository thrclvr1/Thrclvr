// Kullanım (depo kökünden): node tools/v40/olcum_v40.js
// 4× yavaş CPU, dokunmatik emülasyonu. V39 ↔ V40: koridor çizimi; V40: doku üretimi, katman sayısı, yürüme/odak/sürükleme
// sırasında kare aralıkları (tam ve sade görünüm). Medyan / 3–5 tekrar. Başsız Chromium'da birleştirme yazılımla (SwiftShader)
// yapılır; kare süreleri gerçek bir telefon GPU'sunu temsil etmez. Gerçek cihaz ölçümü değildir.
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'..','..');
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});fs.createReadStream(f).pipe(r)}).listen(0,'127.0.0.1');
const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
(async()=>{await new Promise(r=>srv.once('listening',r));const P=srv.address().port;const b=await chromium.launch();const OUT={};
for(const [W,H] of [[390,844],[820,1180],[1440,900]]){
 for(const v of ['39','40']){for(const lite of (v==='40'?[0,1]:[0])){
  const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:W<1000,hasTouch:true});
  await ctx.addInitScript(l=>{localStorage.setItem('dk-deneyim39',JSON.stringify({son:'premium',hatirla:true}));localStorage.setItem('dk-ilerleme39',JSON.stringify({ipucu40:1,lite40:l}))},lite);
  const p=await ctx.newPage();await p.goto(`http://127.0.0.1:${P}/surumler/din-kulturu-platformu-v${v}.0.html`);await p.waitForTimeout(3000);
  const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const R={};const fr=fn=>`(()=>new Promise(res=>{const t0=performance.now();(${fn})();requestAnimationFrame(()=>requestAnimationFrame(()=>res(performance.now()-t0)))}))()`;
  const t=async(n,fn,k=5)=>{const L=[];for(let i=0;i<k;i++){L.push(await p.evaluate(fn));await p.waitForTimeout(150)}R[n]=Math.round(med(L))};
  await t('Koridor çizimi (ms)',fr("()=>{go('psinif',{pg:8});go('pdunya')}"));
  if(v==='40'){
   R['Doku üretimi (ms, 4× CPU)']=Math.round(await p.evaluate(()=>{V40.tex=null;const t0=performance.now();V40.uret();return performance.now()-t0}));
   R['Doku boyutu (KB)']=Math.round(await p.evaluate(()=>Object.values(V40.tex).reduce((a,u)=>a+u.length,0)/1024));
   await cdp.send('LayerTree.enable');let L=null;cdp.on('LayerTree.layerTreeDidChange',e=>{if(e.layers)L=e.layers});
   const rec=async(fn,ms)=>{await p.evaluate(()=>{window.__f=[];let on=true;const lp=n=>{__f.push(n);if(on)requestAnimationFrame(lp)};requestAnimationFrame(lp);window.__stop=()=>on=false});await p.evaluate(fn);await p.waitForTimeout(ms);
    return p.evaluate(()=>{__stop();const d=__f.slice(1).map((x,i)=>x-__f[i]);d.sort((a,b)=>a-b);return{p95:d[Math.floor(d.length*.95)],avg:d.reduce((a,b)=>a+b,0)/d.length,n:d.length}})};
   const S=[],O=[];for(let i=0;i<3;i++){await p.evaluate(()=>V40.git(1));await p.waitForTimeout(1600);S.push(await rec('V40.adim(1)',900));O.push(await rec('V40.sec(2)',1300))}
   R['Yürüme adımı: ortalama kare (ms)']=Math.round(med(S.map(x=>x.avg)));R['Yürüme adımı: %95 kare (ms)']=Math.round(med(S.map(x=>x.p95)));
   R['Kapıya dönüş: ortalama kare (ms)']=Math.round(med(O.map(x=>x.avg)));R['Kapıya dönüş: %95 kare (ms)']=Math.round(med(O.map(x=>x.p95)));
   await p.evaluate(()=>V40.git(2));await p.waitForTimeout(1600);
   const box=await p.evaluate(()=>document.getElementById('s40').getBoundingClientRect().toJSON());const D=[];
   for(let i=0;i<3;i++){await p.evaluate(()=>{window.__f=[];let on=true;const lp=n=>{__f.push(n);if(on)requestAnimationFrame(lp)};requestAnimationFrame(lp);window.__stop=()=>on=false});
    const x0=box.x+box.width*.8,y0=box.y+box.height*.5;await p.mouse.move(x0,y0);await p.mouse.down();for(let k=1;k<=20;k++){await p.mouse.move(x0-k*14,y0);await p.waitForTimeout(16)}await p.mouse.up();await p.waitForTimeout(700);
    D.push(await p.evaluate(()=>{__stop();const d=__f.slice(1).map((x,i)=>x-__f[i]);d.sort((a,b)=>a-b);return{p95:d[Math.floor(d.length*.95)],avg:d.reduce((a,b)=>a+b,0)/d.length}}));await p.evaluate(()=>V40.git(2));await p.waitForTimeout(1500)}
   R['Sürükleme: ortalama kare (ms)']=Math.round(med(D.map(x=>x.avg)));R['Sürükleme: %95 kare (ms)']=Math.round(med(D.map(x=>x.p95)));
   await p.evaluate(()=>{const k=document.getElementById('k40');k.style.opacity='.999'});await p.waitForTimeout(500);
   R['Birleştirilen katman (odak dışı yürüme durağı)']=L?L.filter(l=>l.drawsContent).length:null;
   R['Görünür yüzey / toplam']=await p.evaluate(()=>V40._els.filter(e=>e._v).length+'/'+V40._els.length);
   R['DOM öğesi (koridor)']=await p.evaluate(()=>document.querySelectorAll('#s40 *').length);
  }
  OUT[`${W}x${H} V${v}${lite?' sade':''}`]=R;console.log(`${W}x${H} V${v}${lite?' sade':''}`,JSON.stringify(R));await ctx.close()}}}
fs.writeFileSync(path.join(__dirname,'olcum_sonuc.json'),JSON.stringify(OUT,null,1));
await b.close();srv.close()})();
