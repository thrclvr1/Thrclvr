import json,sys
from playwright.sync_api import sync_playwright
BOT=r"""
async (ids)=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms)),out=[];
 const click=s=>{const e=document.querySelector(s);if(!e||e.disabled)throw new Error('yok:'+s);e.click()};
 for(const id of ids){
  const g=Store.get('games',id);let err=null;
  try{
   playGame(id,{v:'games',a:{}});await sleep(30);
   const t=g.gameType;
   if(t==='eleme'){for(let k=0;k<GP.st.qs.length;k++){const c=GP.st.qs[GP.st.i];for(let guard=0;guard<6&&!c.done;guard++){const bs=[...document.querySelectorAll('.opt30')];const j=bs.findIndex((b,j)=>!b.disabled&&c.ord[j]!==c.q.answer);if(j<0)break;bs[j].click()}
     if(!c.done)throw new Error('eleme bitmedi');click('.cardx .p')}}
   else if(t==='eksik'){for(let k=0;k<GP.st.its.length;k++){const c=GP.st.its[GP.st.i];const bs=[...document.querySelectorAll('.opt30')];bs[c.ord.indexOf(c.it.answer)].click();click('.cardx .p')}}
   else if(t==='hata'){for(let k=0;k<GP.st.rs.length;k++){const r=GP.st.rs[GP.st.i];document.querySelectorAll('.stm')[r.wrong].click();click('.cardx .p')}}
   else if(t==='tabu'){click('.setup .p');await sleep(20);const n=GP.st.list.length;for(let k=0;k<n;k++){click('.acts .ok')}}
   else if(t==='benkimim'){click('.setup .p');await sleep(20);const n=GP.st.list.length;for(let k=0;k<n;k++){const c=GP.st.list[GP.st.i];const bs=[...document.querySelectorAll('.opt30')];bs[c.opts.indexOf(c.it.name)].click();click('.cardx .p')}}
   else if(t==='olay'){const n=g.items.length;GP.st.cur=[...Array(n).keys()];GP.paint();click('#od-check')}
   await sleep(t==='olay'?1600:20);
   const res=!!document.querySelector('.gres');
   out.push({id,t,score:GP.score,max:GP.max,res,fin:GP.fin});
  }catch(e){out.push({id,t:g&&g.gameType,err:String(e)})}
 }
 return out}
"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'TUNNEL' not in m.text else None)
    pg.goto('file:///home/claude/work/din-kulturu-platformu-v36.0.html');pg.wait_for_timeout(800)
    G=json.load(open('new_games31.json'))
    ids=[g['id'] for g in G]
    res=[]
    for i in range(0,len(ids),40):
        res+=pg.evaluate(BOT,ids[i:i+40])
    bad=[r for r in res if r.get('err') or not r.get('res') or r['score']!=r['max']]
    print('oynanan',len(res),'sorunlu',len(bad));print(bad[:12])
    import collections
    print(collections.Counter(r['t'] for r in res))
    print('hist',pg.evaluate("(Store.ov.ghist||[]).length"),'gscore',pg.evaluate("Object.keys(Store.ov.gscore||{}).length"))
    print('errs',errs[:6]);json.dump(res,open('t360/out/res_games31.json','w'))
    b.close()
