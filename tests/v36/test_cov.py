import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/work/din-kulturu-platformu-v36.0.html');pg.wait_for_timeout(1500)
    ev=pg.evaluate("""(()=>{const E=new Map();const add=(t,bi,a,e,tag)=>{const k=t+'|'+bi+'|'+a+'|'+e;if(!E.has(k))E.set(k,{t,bi,a,e,tags:new Set()});E.get(k).tags.add(tag)};const cs=new Set(),cw=new Set();
      for(const c of KMAP.roots()){const o=KMAP.firstOcc(c.id);if(o)add(o[0],o[1],o[2],o[3],'R:'+c.id);const cm=KMAP.cmps(c.id);cm.forEach(x=>{if(x.t)cw.add(x.c)});KMAP.related(c.id,new Set([c.id,...cm.map(x=>x.c)])).forEach(x=>{cs.add(x.c);const w=x.why;if(w&&w.kind==='sentence')add(w.t,w.bi,w.a,w.e,'C:'+x.c)})}
      return {ev:[...E.values()].map(v=>({t:v.t,bi:v.bi,a:v.a,e:v.e,tags:[...v.tags]})),nodes:[...cs],other:[...cw]}})()""")
    by={}
    for x in ev['ev']:by.setdefault(x['t'],[]).append(x)
    okc=set();bad=[];n=0
    for t,L in by.items():
        pg.evaluate(f"go('topic',{{t:'{t}',tab:'anlat'}})");pg.wait_for_timeout(120)
        res=pg.evaluate("""(L)=>L.map(x=>{const T=V34.TM(x.t),b=T.sections.anlatim[x.bi],arts=[...document.querySelectorAll('#app article.blk')];const art=arts.find((a,i)=>i===x.bi&&a.querySelector('h3')&&a.querySelector('h3').textContent===b.h)||arts.find(a=>a.querySelector('h3')&&a.querySelector('h3').textContent===b.h);if(!art)return 0;const s=V33.plain(b.p).slice(x.a,x.e);const r=KMAP.markText(art,s);document.querySelectorAll('mark.km-hl').forEach(m=>m.replaceWith(...m.childNodes));art.normalize();return r?1:0})""",L)
        for x,r in zip(L,res):
            n+=1
            if r:okc.update(x['tags'])
            else:bad.append((t,x['bi'],x['a']))
    allc=set('C:'+c for c in ev['nodes'])
    print(json.dumps({'kanit_cumle':n,'bulunan':n-len(bad),'bulunamayan':len(bad),'ornek':bad[:5],'iliskili_kavram':len(ev['nodes']),'ders_baglantisi_calisan_iliskili_kavram':len(allc&okc),'karsilastirma_konu_baglantili':len(ev['other'])},ensure_ascii=False))
    json.dump({'n':n,'bad':bad},open('t/res_cov.json','w'));print('errs',errs);b.close()
