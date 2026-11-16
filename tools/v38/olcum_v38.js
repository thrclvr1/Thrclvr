// Kullanım (depo kökünden): node tools/v38/olcum_v38.js — 4× yavaş CPU, 820×1180 dokunmatik emülasyonunda V37/V38 öğrenci sekme geçişleri ve öğretmen/editör ekranlarının çizim süreleri (medyan, 5 tekrar).
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'..','..');
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});fs.createReadStream(f).pipe(r)}).listen(0);
(async()=>{await new Promise(r=>srv.once('listening',r));const P=srv.address().port;const b=await chromium.launch();
for(const v of ['37','38']){const ctx=await b.newContext({viewport:{width:820,height:1180},isMobile:true,hasTouch:true});
 await ctx.addInitScript(()=>{if(localStorage.getItem('__s'))return;localStorage.setItem('__s','1');localStorage.setItem('dk-ogretmen-v1',JSON.stringify({v:1,app:'dkab-ogretmen',classes:[{g:12,py:'2018'},{g:5,py:'2026'}],active:'12|2018',status:{},plans:[],updatedAt:null}));sessionStorage.setItem('dk-ogrt-oturum','1');sessionStorage.setItem('dk-editor-oturum38','1')});
 const p=await ctx.newPage();const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});await p.goto(`http://127.0.0.1:${P}/surumler/din-kulturu-platformu-v${v}.0.html`);await p.waitForTimeout(3000);
 await p.evaluate(()=>{const salt='s';localStorage.setItem('dk-ogretmen-pin',JSON.stringify({v:2,salt,h:V36.hash(salt,'1111'),len:4}));try{localStorage.setItem('dk-editor-pin38',JSON.stringify({v:1,salt:'e',h:V38.edHash('e','583920')}))}catch(e){}});
 const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];const R={};
 const t=async(name,fn)=>{const L=[];for(let i=0;i<5;i++){L.push(await p.evaluate(fn));await p.waitForTimeout(150)}R[name]=Math.round(med(L))};
 const sw=k=>`(()=>new Promise(res=>{const t0=performance.now();document.querySelector('nav.bnav button[data-k="${k}"]').click();requestAnimationFrame(()=>requestAnimationFrame(()=>res(performance.now()-t0)))}))()`;
 for(const k of ['classes','games','links','home'])await t('öğrenci→'+k,sw(k));
 await t('öğretmen haftalık',`(()=>{const t0=performance.now();go('ogretmen');OGRT.S().tab='hafta';OGRT.render();return performance.now()-t0})()`);
 if(v==='38'){await t('öğretmen genel bakış',`(()=>{const t0=performance.now();OGRT.S().tab='genel';OGRT.render();return performance.now()-t0})()`);
  await t('editör ana ekran (sayılar)',`(()=>{const t0=performance.now();G.ed={k:'',cid:'',mode:'',f:{tur:'',g:'',py:'',q:''},n:30,cmp:''};go('editor');return performance.now()-t0})()`);
  await t('editör liste (1387 kayıt, 30 gösterilir)',`(()=>{const t0=performance.now();V38.edGo({k:'bekleyen'});return performance.now()-t0})()`);
  await t('editör inceleme ekranı',`(()=>{const t0=performance.now();const x=Store.all('topics').find(t=>t.sections);V38.edGo({cid:'topics:'+x.id,k:'bekleyen'});return performance.now()-t0})()`)}
 console.log('V'+v,JSON.stringify(R),'konsol hataları:',errs);await ctx.close()}
await b.close();srv.close()})();
