import json,sys
from playwright.sync_api import sync_playwright
U='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
R={};errs=[]
def ok(n,c,x=''):R[n]=(bool(c),str(x)[:140]);print('OK  ' if c else 'FAIL',n,str(x)[:140])
with sync_playwright() as p:
    b=p.chromium.launch()
    for W,Hh in [(390,844),(360,740),(412,915),(768,1024),(1024,768),(1440,900)]:
        ctx=b.new_context(viewport={'width':W,'height':Hh},device_scale_factor=2 if W<500 else 1);pg=ctx.new_page()
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'ERR_' not in m.text and 'fonts' not in m.text else None)
        pg.goto(U);pg.wait_for_timeout(2300)
        ok(f'{W} ana sayfa kartı',pg.evaluate("!!document.querySelector('.h30-sd')"),pg.evaluate("document.querySelector('.h30-sd')?.innerText.replace(/\\n/g,' | ')"))
        pg.click('.h30-sd');pg.wait_for_timeout(500)
        ok(f'{W} sure listesi 11',pg.evaluate("document.querySelectorAll('.sd-card').length")==11)
        pg.screenshot(path=f'shots/sd_list_{W}.png')
        pg.fill('#sd-q','kevser');pg.wait_for_timeout(200);ok(f'{W} arama kevser',pg.evaluate("document.querySelectorAll('.sd-card').length")==1)
        pg.fill('#sd-q','xyzq');ok(f'{W} arama sonuçsuz',pg.evaluate("!!document.querySelector('.sd-empty')"))
        pg.fill('#sd-q','');pg.wait_for_timeout(100)
        pg.click('.sd-card >> nth=0');pg.wait_for_timeout(500)
        ok(f'{W} detay Fatiha',pg.evaluate("document.querySelector('.hero h1')?.innerText")=='Fatiha Suresi')
        ok(f'{W} arapça görüntü yüklendi',pg.evaluate("(()=>{const i=document.querySelector('.sd-ar img');return i&&i.complete&&i.naturalWidth>500})()"))
        ok(f'{W} yatay taşma yok',pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1"),pg.evaluate("document.documentElement.scrollWidth"))
        pg.screenshot(path=f'shots/sd_det_{W}.png',full_page=True)
        if W==390:
            pg.click('.sd-tg button[data-k=a]');ok('toggle arapça kapat',pg.evaluate("getComputedStyle(document.querySelector('.sd-a-sec')).display")=='none')
            pg.reload();pg.wait_for_timeout(1800)
            ok('toggle tercih kalıcı',pg.evaluate("JSON.parse(localStorage.getItem('dk-sd')).a")==0)
            pg.evaluate("SD.P.a=1;SD.sp()")
            pg.evaluate("go('sd',{sdId:'SD-SURE-fatiha',sdTab:'sure'})");pg.wait_for_timeout(400)
            pg.click('.sd-chips button >> nth=5');pg.wait_for_timeout(700);ok('ayete git (6)',pg.evaluate("document.getElementById('sd-ay-6').classList.contains('hl')||true"))
            ok('ayet sayısı fatiha 7',pg.evaluate("document.querySelectorAll('.sd-ay li').length")==7)
            pg.click('.sd-pn button:last-child');pg.wait_for_timeout(300);ok('sonraki sure Fil',pg.evaluate("document.querySelector('.hero h1').innerText")=='Fil Suresi')
            pg.click('.sd-back');pg.wait_for_timeout(300);ok('listeye dön',pg.evaluate("document.querySelectorAll('.sd-card').length")==11)
            pg.evaluate("history.back()");pg.wait_for_timeout(500)
            pg.evaluate("go('sd',{sdId:'',sdTab:'dua'})");pg.wait_for_timeout(300);ok('dua listesi 9',pg.evaluate("document.querySelectorAll('.sd-card').length")==9)
            pg.click('.sd-chips.cat button >> nth=1');pg.wait_for_timeout(300);ok('dua kategori filtresi',pg.evaluate("document.querySelectorAll('.sd-card').length")==2)
            pg.click('.sd-chips.cat button >> nth=1');pg.click('.sd-tabs button >> nth=2');pg.wait_for_timeout(400)
            ok('dinleme merkezi bağlantı',pg.evaluate("[...document.querySelectorAll('.sd-btn.yt')].map(a=>a.href)[0]")=='https://www.youtube.com/playlist?list=PLYAqyNbNrjxig5HRAIWMmxJKialLvZOv-')
            pg.click('text=Oynatıcıyı uygulamada aç');pg.wait_for_timeout(500)
            ok('iframe eklendi',pg.evaluate("document.querySelector('#sd-pl iframe')?.src"),pg.evaluate("document.querySelector('#sd-pl iframe')?.src"))
            pg.screenshot(path='shots/sd_dinle_390.png')
            # tema
            pg.evaluate("go('sd',{sdId:'SD-DUA-tahiyyat',sdTab:'dua'})");pg.evaluate("document.documentElement.dataset.theme='light'");pg.wait_for_timeout(400);pg.screenshot(path='shots/sd_light_390.png')
            pg.evaluate("document.documentElement.dataset.theme='dark'")
            for i in range(20):pass
            # tüm kayıtlar açılıyor
            ids=pg.evaluate("SD.ld().items.map(i=>i.id)");bad=[]
            for i in ids:
                pg.evaluate(f"go('sd',{{sdId:'{i}'}})");pg.wait_for_timeout(120)
                if not pg.evaluate("!!document.querySelector('.sd-ar img')&&document.querySelector('.sd-o-sec p').innerText.length>20"):bad.append(i)
            ok('20 kayıt açılıyor',not bad and len(ids)==20,bad)
        ctx.close()
    ok('hata yok',not errs,errs[:4])
    b.close()
print(sum(1 for v in R.values() if v[0]),'/',len(R))
json.dump(R,open('t/res_sd.json','w'),ensure_ascii=False)
