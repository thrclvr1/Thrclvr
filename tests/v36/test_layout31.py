import json,sys
from playwright.sync_api import sync_playwright
VP=[('p360',360,740),('p390',390,844),('p412',412,915),('p768',768,1024),('p1024',1024,1366),('p1440',1440,900),('l740',740,360),('l844',844,390),('l915',915,412),('l1024',1024,768),('l1366',1366,1024)]
CHK=r"""()=>{const vw=innerWidth,bad=[];document.querySelectorAll('#app *').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return;if(e.closest('.h30-hs,.v-chips,.tw-sc,.tabs,.od-list,svg,.par,.art,.gh-hs,.tq-dots,.v-tv,.ws,.wsg,.h30-sug'))return;const cs=getComputedStyle(e);if(cs.position==='fixed')return;if(r.right>vw+1||r.left<-1)bad.push((e.className&&e.className.baseVal===undefined?e.className:e.tagName)+'')});
 const small=[];document.querySelectorAll('#app button,#app a.xl,nav.bnav button,header.top button,#app select,#app input').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width)return;if(r.height<40&&!e.closest('.tq-dots,.v-tv,.ws,.wsg')&&getComputedStyle(e).visibility!=='hidden')small.push((e.className||e.tagName)+':'+Math.round(r.height))});
 const nv=document.querySelector('nav.bnav').getBoundingClientRect();
 return {sw:document.documentElement.scrollWidth,vw,over:[...new Set(bad)].slice(0,6),small:[...new Set(small)].slice(0,6),nav:[Math.round(nv.left),Math.round(nv.top),Math.round(nv.width),Math.round(nv.height)],h:document.documentElement.scrollHeight}}"""
out={};errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,w,h in VP:
        ctx=b.new_context(viewport={'width':w,'height':h},device_scale_factor=1,reduced_motion='reduce');pg=ctx.new_page()
        pg.on('pageerror',lambda e:errs.append(name+' '+str(e)))
        pg.on('console',lambda m:errs.append(name+' '+m.text) if m.type=='error' and 'TUNNEL' not in m.text and 'lipboard' not in m.text else None)
        pg.goto('file:///home/claude/work/din-kulturu-platformu-v36.0.html');pg.wait_for_timeout(900)
        ev=pg.evaluate
        ev("localStorage.setItem('dk-atm',JSON.stringify({L:[{id:'yagmur',v:.5,on:true},{id:'ney',v:.6,on:true}],name:'Huzurlu Ders'}))")
        tid=ev("Store.all('topics').find(t=>t.sections&&t.grade==7&&vis(t)).id")
        tq=ev("Store.all('topics').find(t=>t.sections&&Store.all('questions').filter(q=>q.topicId===t.id).length>=6).id")
        gid={t:ev(f"gList().find(g=>g.gameType==='{t}').id") for t in ['eleme','eksik','hata','tabu','benkimim','olay','quiz','matching','grouping','ordering','wheel','wordsearch']}
        scr=[('home',"go('home')"),('classes',"go('classes')"),('grade5',"go('grade',{g:5})"),('grade10',"go('grade',{g:10})"),('grade12',"go('grade',{g:12})"),('topic',f"go('topic',{{t:'{tid}',tab:'anlat'}})"),('topic_tab',f"go('topic',{{t:'{tid}',tab:'tab'}})"),
         ('pek',"go('pek')"),('pekbol',"go('pekbol',{pk:{k:'kar',g:''}})"),('plan',"go('pekbol',{pk:{k:'plan'}})"),('dene',"go('dene')"),('testkur',f"G.tq={{mode:'mini',g:'',u:'',t:'{tq}',n:10}};V30.tq=null;go('test')"),
         ('testrun',f"G.tq={{mode:'mini',g:'',u:'',t:'{tq}',n:10}};V30.tqStart()"),('yanlis',"go('yanlis')"),('games',"G.gf={};go('games')"),('search',"go('search',{q:'namaz'})"),('kavram',"go('kavram')"),('kisi',"go('kisi')"),('cards',f"go('cards',{{fc:{{type:'topic',id:'{tid}'}}}})")]
        scr+=[('atm_home_bar',"ATM.st=ATM.load();ATM.rt.playing=false;ATM.rt.paused=true;ATM.paint();go('home')"),('atm_topic_bar',f"go('topic',{{t:'{tid}',tab:'anlat'}})"),('atm_games_bar',"go('games')"),
          ('atm_panel_sesler',"ATM.st.tab='sesler';ATM.open()"),('atm_panel_karisim',"UI.close();ATM.st.tab='karisim';ATM.open()"),('atm_panel_hazir',"UI.close();ATM.st.tab='hazir';ATM.open()"),('atm_panel_sure',"UI.close();ATM.st.tab='sure';ATM.open()"),('atm_panel_kaynak',"UI.close();ATM.st.tab='kaynak';ATM.open()"),
          ('rec_abbas',"UI.close();ATM.rt.paused=false;ATM.rt.playing=false;ATM.paint();V30.rec('entities','ENT-DKAB-9-kisi-abbas')"),('settings',"UI.close();V30.settings()")]
        scr+= [('game_'+t,f"playGame('{i}',{{v:'games',a:{{}}}})") for t,i in gid.items()]
        res={}
        for k,js in scr:
            ev(js);pg.wait_for_timeout(260)
            if k in('game_tabu','game_benkimim'):
                try: pg.click('.setup .p');pg.wait_for_timeout(150)
                except Exception as e: pass
            r=ev(CHK)
            if k.startswith('atm_') or k=='rec_abbas':
                r['barNav']=ev("(()=>{const b=document.getElementById('atm-bar'),n=document.querySelector('nav.bnav');if(!b||!n)return null;const a=b.getBoundingClientRect(),c=n.getBoundingClientRect();const ov=!(a.right<=c.left||a.left>=c.right||a.bottom<=c.top||a.top>=c.bottom);return {overlap:ov,bar:[Math.round(a.left),Math.round(a.top),Math.round(a.width),Math.round(a.height)],inView:a.left>=0&&a.right<=innerWidth&&a.bottom<=innerHeight}})()")
                r['sheet']=ev("(()=>{const s=document.querySelector('.v-sheet');if(!s)return null;const a=s.getBoundingClientRect();return {w:Math.round(a.width),h:Math.round(a.height),inView:a.left>=-1&&a.right<=innerWidth+1&&a.top>=-1}})()")
            res[k]=r
            if name in('p360','p768','p1440','l844','l1024','p412') and k in('atm_home_bar','atm_panel_sesler','atm_panel_karisim','rec_abbas','home','classes','grade5','grade12','topic','pek','dene','testrun','games','game_tabu','game_benkimim','game_hata','game_eleme','game_olay','search'):
                pg.screenshot(path=f'shots32/v31_{name}_{k}.png')
        out[name]=res;ctx.close()
    b.close()
json.dump(out,open('t360/out/res_layout31.json','w'),ensure_ascii=False,indent=1)
nb=0
for n,res in out.items():
    for k,r in res.items():
        if r.get('barNav') and r['barNav']['overlap']:print('BAR-NAV ÇAKIŞMA',n,k,r['barNav'])
        if r.get('barNav') and not r['barNav']['inView']:print('BAR EKRAN DIŞI',n,k,r['barNav'])
        if r['sw']>r['vw']+1 or r['over']:
            nb+=1;print('TAŞMA',n,k,r['sw'],r['vw'],r['over'])
print('ekran sayısı',sum(len(v) for v in out.values()),'taşma',nb,'hata',errs[:5])
