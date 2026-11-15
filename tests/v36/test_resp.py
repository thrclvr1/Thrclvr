import json
from playwright.sync_api import sync_playwright
URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
R={};errs=[]
def ok(k,v,info=''):R[k]=bool(v);print(('OK  ' if v else 'FAIL'),k,str(info)[:240])
LUM="""(c)=>{const m=c.match(/[\\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])}"""
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,kind in [(360,740,'tel'),(390,844,'tel'),(412,915,'tel'),(768,1024,'tab'),(1024,768,'tab'),(1440,900,'mas')]:
        for theme in ['dark','light']:
            c=b.new_context(viewport={'width':w,'height':h},has_touch=kind!='mas');pg=c.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.goto(URL);pg.wait_for_timeout(1000);ev=pg.evaluate
            if theme=='light':ev("if(themeNow()!=='light'){theme();themeBtns()}")
            ev("go('links',{lk:{tab:'kavram',sel:{type:'concept',id:'CON-DKAB-6-oruc'},py:'',g:''}})");pg.wait_for_timeout(900)
            if kind=='tel' or w<1200:ev("document.querySelector('.km-tools [data-t=all]').click()");pg.wait_for_timeout(300)
            m=ev("""(()=>{const st=document.getElementById('km-stage').getBoundingClientRect(),N=[...document.querySelectorAll('.kmn')].map(e=>e.getBoundingClientRect());const small=[...document.querySelectorAll('.km button, .km input')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.height<43.5&&!e.closest('.km-leg')}).map(e=>e.className||e.textContent).slice(0,4);
              const fs=Math.min(...[...document.querySelectorAll('.kmn-t b, .km-cc-h b, .kmz-h b')].map(e=>parseFloat(getComputedStyle(e).fontSize)))*G.kmap.v.k;
              return{sw:document.documentElement.scrollWidth,iw:innerWidth,outX:N.filter(r=>r.left<st.left-1||r.right>st.right+1).length,mode:KMAP.mode,small,fs,k:G.kmap.v.k}})()""")
            if kind=='tel' or m['mode']=='tall':okx=m['mode']=='tall' and m['outX']==0 and m['fs']>=13
            else:okx=m['mode']=='wide' and m['outX']==0 and m['fs']>=10.5
            ok(f'{w} {theme} yerleşim',m['sw']<=m['iw'] and okx and not m['small'],m)
            key=ev("KMAP.RN[0].key");ev(f"document.querySelector('.kmn[data-k=\"{key}\"] .kmn-b').click()");pg.wait_for_timeout(450)
            pn=ev("""(()=>{const p=document.getElementById('km-panel').getBoundingClientRect(),s=document.getElementById('km-stage').getBoundingClientRect(),n=document.querySelector('nav.bnav').getBoundingClientRect(),cs=getComputedStyle(document.getElementById('km-panel'));return{pos:cs.position,top:p.top,bottom:p.bottom,left:p.left,right:p.right,sl:s.left,sr:s.right,st:s.top,navTop:n.top,navLeft:n.left,navRight:n.right,ih:innerHeight}})()""")
            if kind=='tel':okp=pn['pos']=='fixed' and pn['top']<pn['ih'] and pn['bottom']<=pn['navTop']+1 and pn['top']>pn['ih']*0.2
            else:okp=pn['pos']!='fixed' and pn['left']>=pn['sr']-1 and abs(pn['top']-pn['st'])<4
            ok(f'{w} {theme} bilgi paneli ({"alttan kart" if kind=="tel" else "yan panel"})',okp,pn)
            if kind=='tel':
                pg.locator('.kmp-x').click();pg.wait_for_timeout(400);ok(f'{w} {theme} alttan kart kapanıyor',ev("document.getElementById('km-panel').getBoundingClientRect().top>=innerHeight-2"))
            con=ev(f"""(()=>{{const L={LUM};const t=getComputedStyle(document.querySelector('.kmn-t b')).color,bg=getComputedStyle(document.getElementById('km')).getPropertyValue('--k-bg1').trim();const d=document.createElement('i');d.style.color=bg;document.body.appendChild(d);const bgc=getComputedStyle(d).color;d.remove();const a=L(t),b2=L(bgc);return [(Math.max(a,b2)+.05)/(Math.min(a,b2)+.05),t,bgc,document.documentElement.dataset.theme||'dark']}})()""")
            ok(f'{w} {theme} tema ve okunurluk (kontrast ≥ 4.5)',con[0]>=4.5 and (con[3]=='light')==(theme=='light'),con)
            if kind!='tel' and ev('KMAP.mode')=='wide':
                ev("document.querySelector('.km-tools [data-t=all]').click()");pg.wait_for_timeout(300);ok(f'{w} {theme} tümü açıkken yazı küçülmüyor (ölçek ≥ 0.6)',ev('G.kmap.v.k')>=0.6,ev('G.kmap.v.k'))
            if w==390 and theme=='dark':pg.screenshot(path='r_390.png')
            if w==1024 and theme=='light':pg.screenshot(path='r_1024_light.png')
            c.close()
    b.close()
print('errs',errs);print('PASS',sum(R.values()),'/',len(R));json.dump(R,open('t/res_resp.json','w'),ensure_ascii=False)
