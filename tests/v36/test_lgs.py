import json
from playwright.sync_api import sync_playwright
URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
R={}
def ok(k,v,i=''):R[k]=(bool(v),i);print(('OK  ' if v else 'FAIL'),k,i)
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,vp in(('390',{'width':390,'height':844}),('768',{'width':768,'height':1024}),('1440',{'width':1440,'height':900}),('844x390',{'width':844,'height':390})):
        pg=b.new_context(viewport=vp).new_page();pg.goto(URL);pg.wait_for_timeout(1200)
        hits=[]
        for v,a in[('home',''),('classes',''),('grade',',{g:8}'),('pek',''),('dene',''),('exams',''),('exam',",{e:'LGS'}"),('games',''),('search',",{q:'lgs'}"),('yanlis',''),('kavram',''),('kisi','')]:
            pg.evaluate(f"go('{v}'{a})");pg.wait_for_timeout(350)
            txt=pg.evaluate("document.body.innerText");nav=pg.evaluate("document.querySelector('nav.bnav').innerText")
            if 'LGS' in txt or 'lgs' in txt.lower().replace('algs',''):
                if not (v=='search'):hits.append(v)
                else:hits.append('search:'+('LGS' in txt and 'metinde LGS' or 'küçük'))
        pg.evaluate("go('home')");pg.wait_for_timeout(300)
        pg.fill('#q','lgs');pg.wait_for_timeout(500);sug=pg.evaluate("(document.querySelector('.h30-sug')||{innerText:''}).innerText")
        pg.evaluate("V30.settings()");pg.wait_for_timeout(300);st=pg.evaluate("document.querySelector('.v-sheet').innerText");pg.evaluate("UI.close()")
        ok(f'LGS görünmüyor ({name}): ana sayfa, nav, sınav merkezi, sınıf, arama, ayarlar',not hits and 'LGS' not in sug and 'LGS' not in st,f"isabet={hits} öneri={sug[:40]!r}")
        pg.context.close()
    # 8. sınıf ve müfredat verisi
    pg=b.new_context(viewport={'width':390,'height':844}).new_page();pg.goto(URL);pg.wait_for_timeout(1200)
    d=pg.evaluate("({g8:Store.all('topics').filter(t=>t.grade===8).length,p18:Store.all('topics').filter(t=>t.programYear==='2018').length,p26:Store.all('topics').filter(t=>t.programYear==='2026').length,lgsTopics:Store.all('topics').filter(t=>t.examLayer==='LGS').length,examCfg:Object.keys(SEED['config/exams.json']),all:Store.all('topics').length,navLabels:[...document.querySelectorAll('nav.bnav button')].map(b=>b.innerText.replace(/\\n/g,' '))})")
    ok('8. sınıf (42 konu) ve 2018/2026 yapısı korundu',d['g8']==42 and d['p18']==62 and d['p26']==184 and d['all']==246,str(d))
    ok('LGS verisi silinmedi (examLayer etiketleri ve sınav yapılandırması duruyor)',d['lgsTopics']>0 and 'LGS' in d['examCfg'],f"examLayer LGS konu: {d['lgsTopics']}")
    ok('Alt navigasyon: LGS/TYT/AYT/YKS yok',not any(x in ' '.join(d['navLabels']) for x in('LGS','TYT','AYT','YKS')),str(d['navLabels']))
    json.dump(R,open('t360/out/res_lgs.json','w'),ensure_ascii=False,indent=1);b.close()
print(sum(1 for v in R.values() if v[0]),'/',len(R))
