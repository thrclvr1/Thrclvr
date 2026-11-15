from playwright.sync_api import sync_playwright
URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_context(viewport={'width':390,'height':844},has_touch=True).new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL);pg.wait_for_timeout(1500)
    pick=pg.evaluate("""(()=>{let best=null;for(const col of['concepts','entities'])for(const r of Store.all(col)){if(!vis(r)||!(r.topicIds||[]).length)continue;const M=V33.find(r),c={};M.forEach(x=>c[x.t]=(c[x.t]||0)+1);const mx=Math.max(0,...Object.values(c));if(mx>=4&&(!best||mx>best[2]))best=[col,r.id,mx,r.term||r.name,Object.keys(c).find(k=>c[k]===mx),M.length]}return best})()""")
    print(pick);col,rid,mx,term,tid,tot=pick
    pg.evaluate(f"V33.go('{col}','{rid}',V33.find(Store.get('{col}','{rid}')).findIndex(x=>x.t==='{tid}'))");pg.wait_for_timeout(1500)
    r1=pg.evaluate("({t:G.t,marks:document.querySelectorAll('mark.hl33').length,cur:[...document.querySelectorAll('mark.hl33')].findIndex(m=>m.classList.contains('cur')),y:scrollY,txt:document.getElementById('hl33').innerText.split('\\n')[0]})");print(r1)
    ok=[r1['t']==tid and r1['marks']==mx]
    ys=[]
    for i in range(mx-1):
        pg.locator('#hl33 button[aria-label="Sonraki eşleşme"]').tap();pg.wait_for_timeout(900)
        s=pg.evaluate("({t:G.t,cur:[...document.querySelectorAll('mark.hl33')].findIndex(m=>m.classList.contains('cur')),top:document.querySelector('mark.hl33.cur').getBoundingClientRect().top,vh:innerHeight,txt:document.getElementById('hl33').innerText.split('\\n')[0]})");ys.append(s)
    print(ys)
    ok.append(all(s['t']==tid for s in ys));ok.append([s['cur'] for s in ys]==list(range(1,mx)))
    ok.append(all(165<=s['top']<=770 for s in ys))
    # blocks distinct?
    print(pg.evaluate("[...document.querySelectorAll('mark.hl33')].map(m=>m.closest('article.blk').querySelector('h3').textContent.slice(0,30))"))
    print('ALL',all(ok),ok,errs);b.close()
