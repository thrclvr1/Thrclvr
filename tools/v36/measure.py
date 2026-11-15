import json,sys,statistics
from playwright.sync_api import sync_playwright
f=sys.argv[1];out=sys.argv[2];RATE=4
INIT="""
window.__lt=[];try{new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push([Math.round(e.startTime),Math.round(e.duration)]))).observe({type:'longtask',buffered:true})}catch(e){}
window.__appw=0;window.__ready=null;
document.addEventListener('DOMContentLoaded',()=>{const a=document.getElementById('app');if(!a)return;new MutationObserver(m=>{window.__appw+=m.length}).observe(a,{childList:true})});
(function chk(){const ok=document.readyState!=='loading'&&document.querySelector('#app .h30-hello')&&!document.getElementById('splash31')&&!document.getElementById('boot36');if(ok&&window.__ready===null){window.__ready=Math.round(performance.now())}else requestAnimationFrame(chk)})();
"""
ROUTES=[("Sınıflar","go('classes')"),("Konu (anlatım)","go('topic',{t:'TPC-6-2-02',tab:'anlat'})"),("Oyunlar","go('games')"),("Pekiştir","go('pek')"),("Kendini Dene","go('dene')"),("Bağlantılar","go('links',{lk:{tab:'kavram',sel:null}})"),("Sınıf 6","go('grade',{g:6})"),("Sözlük (kavram)","go('kavram')"),("Ana sayfa","go('home')")]
res={}
with sync_playwright() as p:
    b=p.chromium.launch()
    for W,H in [(360,740),(390,844),(768,1024),(1024,768),(1440,900)]:
        c=b.new_context(viewport={'width':W,'height':H},has_touch=W<800);pg=c.new_page();c.add_init_script(INIT)
        if 'v36' in f:c.add_init_script("try{sessionStorage.setItem('dk-ogrt-oturum','test')}catch(e){}")
        cdp=c.new_cdp_session(pg);cdp.send('Emulation.setCPUThrottlingRate',{'rate':RATE});cdp.send('Performance.enable')
        pg.goto(f'file:///home/claude/work/{f}',wait_until='load')
        pg.wait_for_function("window.__ready!==null",timeout=60000);pg.wait_for_timeout(1200)
        nav=pg.evaluate("(()=>{const n=performance.getEntriesByType('navigation')[0],p=performance.getEntriesByType('paint');return{dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),fcp:Math.round((p.find(x=>x.name==='first-contentful-paint')||{}).startTime||0)}})()")
        nav['ready']=pg.evaluate("window.__ready");nav['lt_load']=pg.evaluate("window.__lt.slice()");nav['appw_load']=pg.evaluate("window.__appw")
        heap0=pg.evaluate("performance.memory?performance.memory.usedJSHeapSize:0")
        tr={}
        for name,cmd in ROUTES:
            pg.evaluate("window.__lt=[];window.__appw=0")
            t=pg.evaluate("c=>new Promise(r=>{const t0=performance.now();eval(c);requestAnimationFrame(()=>requestAnimationFrame(()=>r(Math.round(performance.now()-t0))))})",cmd)
            pg.wait_for_timeout(400)
            tr[name]={'ms':t,'appw':pg.evaluate("window.__appw"),'lt':[d for _,d in pg.evaluate("window.__lt")]}
        # kaydırma akıcılığı (ana sayfa)
        pg.evaluate("go('home')");pg.wait_for_timeout(500)
        fr=pg.evaluate("""()=>new Promise(r=>{const f=[];let last=performance.now(),t0=last,y=0;const H=document.documentElement.scrollHeight;function s(){const n=performance.now();f.push(n-last);last=n;y+=24;window.scrollTo(0,y%(H-innerHeight));if(n-t0<2500)requestAnimationFrame(s);else r(f)}requestAnimationFrame(s)})""")
        fr=fr[1:];heap1=pg.evaluate("performance.memory?performance.memory.usedJSHeapSize:0")
        dom=pg.evaluate("document.getElementsByTagName('*').length")
        res[W]={'nav':nav,'tr':tr,'scroll':{'frames':len(fr),'avg_ms':round(statistics.mean(fr),1),'p95_ms':round(sorted(fr)[int(len(fr)*.95)],1),'over50':sum(1 for x in fr if x>50)},'heap_mb':[round(heap0/1e6,1),round(heap1/1e6,1)],'dom_nodes':dom}
        print(W,json.dumps(res[W],ensure_ascii=False)[:600])
        c.close()
json.dump(res,open(out,'w'),ensure_ascii=False,indent=1)
