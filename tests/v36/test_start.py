import asyncio,json
from playwright.async_api import async_playwright
URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
async def main():
    res=[];bad=0
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for w,h in [(360,740),(390,844),(412,915),(768,1024)]:
            c=await b.new_context(viewport={'width':w,'height':h},has_touch=True);pg=await c.new_page()
            errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
            await pg.goto(URL);await pg.wait_for_timeout(1200)
            await pg.evaluate("go('home');V30.go?V30.go('games'):go('games')") if False else None
            await pg.evaluate("go('games')");await pg.wait_for_timeout(500)
            has=await pg.evaluate("document.querySelectorAll('.gt').length")
            if not has:
                await pg.evaluate("V30.routes&&V30.routes.games&&go('games')")
            keys=await pg.evaluate("[...document.querySelectorAll('.gt')].map(b=>b.dataset.t)")
            for k in keys:
                await pg.evaluate("window.scrollTo(0,0)")
                card=pg.locator(f'.gt[data-t="{k}"]');await card.scroll_into_view_if_needed();await card.tap();await pg.wait_for_timeout(1100)
                st=await pg.evaluate("""()=>{const s=document.getElementById('g33-start'),g=document.querySelector('.g33-go'),nav=document.querySelector('.bnav'),on=document.querySelector('.gt.on');
                  if(!s||!g||!on)return{ok:false,why:'no panel',on:!!on};
                  const r=g.getBoundingClientRect(),o=on.getBoundingClientRect(),n=nav?nav.getBoundingClientRect():null;
                  return{ok:true,dis:g.disabled,top:r.top,bot:r.bottom,h:r.height,w:r.width,belowCard:r.top>=o.bottom-1,vh:innerHeight,navTop:n?n.top:null,navPos:nav?getComputedStyle(nav).position:null,
                   covered:(()=>{const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !(e===g||g.contains(e))})(),near:r.top-o.bottom,sw:document.documentElement.scrollWidth,cw:innerWidth}}""")
                ok=st.get('ok') and not st['covered'] and st['belowCard'] and st['h']>=44 and st['near']<80 and st['sw']<=st['cw'] and (st['navTop'] is None or st['bot']<=st['navTop']+1 or st['navTop']<st['vh']/2)
                if st.get('dis'): ok=ok  # empty type
                if not ok: bad+=1
                res.append((w,k,ok,st))
                if not ok: print('FAIL',w,k,st)
                # start via button
                if st.get('ok') and not st['dis']:
                    await pg.locator('.g33-go').tap();await pg.wait_for_timeout(500)
                    started=await pg.evaluate("view!=='games'||!!document.querySelector('.gplay,.game,#gstage,[class*=gp-]')")
                    if not started: bad+=1;print('NOSTART',w,k)
                    await pg.evaluate("history.back()");await pg.wait_for_timeout(400)
                    if not await pg.evaluate("!!document.querySelector('.gt')"): await pg.evaluate("go('games')");await pg.wait_for_timeout(300)
            # second tap start
            if keys:
                await pg.evaluate("gSet('ty','')");await pg.wait_for_timeout(200)
                c1=pg.locator(f'.gt[data-t="{keys[0]}"]');await c1.tap();await pg.wait_for_timeout(500)
                v0=await pg.evaluate("view");await pg.locator(f'.gt[data-t="{keys[0]}"]').tap();await pg.wait_for_timeout(600)
                print(w,'second-tap started:',await pg.evaluate("document.querySelector('.g33-go')===null||view!=='games'||document.querySelector('.g33-go').classList.contains('busy')"))
            print(w,'types',len(keys),'errs',errs)
            await c.close()
        await b.close()
    print('checks',len(res),'bad',bad)
    json.dump(res,open('t/res_start.json','w'))
asyncio.run(main())
