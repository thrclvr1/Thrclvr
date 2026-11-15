import json,re,os,tempfile,base64,io
from playwright.sync_api import sync_playwright
URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
HTML=open('/home/claude/work/din-kulturu-platformu-v36.0.html',encoding='utf-8').read()
R={};errs=[]
def ok(k,v,info=''):R[k]=bool(v);print(('OK  ' if v else 'FAIL'),k,str(info)[:300])
SY='2026-2027'
def seed(id_):
    m=re.search(r'<script type="application/json" id="%s">'%id_,HTML);e=HTML.index('</script>',m.end());return json.loads(HTML[m.end():e])
CUR,YP=seed('seed-curriculum'),seed('seed-yp')
# ============ A. Müfredat düzeltmeleri (veri) ============
ok('A1 Eski hatalı ifadelerin kopyası kalmadı: “sebeplerinisonuçlarını”, “Nisa suresi 136”, “Nisa Suresi 136”, “MİMARİMİZDEKİ”, “KÜLTÜRÜMÜZDE DİNİ”, kesik 10. sınıf ünite adı',
   all(HTML.count(x)==0 for x in ['sebeplerinisonuçlarını','Nisa suresi 136','Nisa Suresi 136','MİMARİMİZDEKİ','KÜLTÜRÜMÜZDE DİNİ']) and not re.search(r'VE FIKH[İI](?! YORUMLAR)',HTML),
   [x for x in ['sebeplerinisonuçlarını','Nisa suresi 136','Nisa Suresi 136','MİMARİMİZDEKİ','KÜLTÜRÜMÜZDE DİNİ'] if HTML.count(x)])
# Ayetelkürsi yalnızca 2026 (TYMM) kayıtlarında kalmalı
left=[]
for col in ['units','outcomes','textbookSections','outcomeLinks','topicsV2','questionsV2','gamesV2','concepts']:
    for r in CUR.get(col,[]):
        if 'Ayetelkürsi' in json.dumps(r,ensure_ascii=False):left.append((col,r.get('id'),r.get('programYear')))
ok('A2 “Ayetelkürsi” 2018 programı kayıtlarında kalmadı (yalnız 2026 TYMM kayıtları kendi yazımıyla duruyor)',all(py!='2018' for _,_,py in left) and 'Ayetelkürsi' not in json.dumps(YP['plans']['8|2018'],ensure_ascii=False),left)
# 2018/2026 ayrımı yıllık planda korunuyor
O={o['id']:o for o in CUR['outcomes']};U={u['id']:u for u in CUR['units']}
mix=[(k,o) for k,p in YP['plans'].items() for w in p['weeks'] for o in w['oids'] if (('DKAB18-' in o)!=(k.endswith('2018'))) or not o.split('-')[1 if 'DKAB18' in o else 1]==k.split('|')[0]]
ok('A3 Yıllık plan ve program ayrımı korunuyor (2018/2026 kazanımları karışmıyor; 9 sınıf, 37’şer hafta)',not mix and len(YP['plans'])==9 and all(len(p['weeks'])==37 for p in YP['plans'].values()),mix[:3])
with sync_playwright() as p:
    b=p.chromium.launch()
    def ctx(w=1024,h=800,touch=False,session=False):
        c=b.new_context(viewport={'width':w,'height':h},has_touch=touch,accept_downloads=True)
        if session:c.add_init_script("try{sessionStorage.setItem('dk-ogrt-oturum','1')}catch(e){}")
        pg=c.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'ERR_' not in m.text and 'file:' not in m.text and errs.append(m.text));return c,pg
    # ---- A. ekranlarda gösterim ----
    c,pg=ctx(session=True);pg.goto(URL);pg.wait_for_timeout(1200);ev=pg.evaluate
    ev("a=>localStorage.setItem('dk-ogretmen-v1',a)",json.dumps({"v":1,"app":"dkab-ogretmen","classes":[{"g":5,"py":"2026"},{"g":6,"py":"2026"},{"g":8,"py":"2018"},{"g":10,"py":"2026"},{"g":11,"py":"2026"},{"g":12,"py":"2018"}],"active":"8|2018","status":{},"plans":[],"updatedAt":None}));pg.reload();pg.wait_for_timeout(1300)
    ev("go('ogretmen')");pg.wait_for_timeout(300)
    def week(k,no):
        ev(f"OGRT.d.active='{k}';OGRT.S().tab='hafta';OGRT.render()");n=ev(f"[...document.querySelectorAll('.ogw-wk')].find(e=>e.dataset.no==='{no}').dataset.wk");ev(f"OGRT.W.go({n});document.querySelectorAll('.ogw-c').forEach(d=>d.open=true)");pg.wait_for_timeout(60)
        return ev("({u:[...document.querySelectorAll('.ogw-c.c-unite .ogw-cv .ogw-l')].map(e=>e.textContent),k:[...document.querySelectorAll('.ogw-c.c-konu .ogw-cv .ogw-l')].map(e=>e.textContent),z:[...document.querySelectorAll('.ogw-kt')].map(e=>e.textContent),note:[...document.querySelectorAll('.ogw-k p')].map(e=>e.textContent).join('|'),body:document.querySelector('.ogw').innerText})")
    w=week('11|2026',27);ok('A4 11.4.3 öğretmen panelinde “sebeplerini-sonuçlarını”; programla çelişki notu yok',any('sebeplerini-sonuçlarını' in z for z in w['z']) and 'Programdaki metin' not in w['note'],w['z'])
    w=week('8|2018',7);ok('A5 8.1.6 öğretmen panelinde “Ayet el-Kürsi” (kazanım ve konu); çelişki notu yok',any('Ayet el-Kürsi’yi okur' in z for z in w['z']) and 'Ayet el-Kürsi' in w['k'][0] and 'Programdaki metin' not in w['note'] and 'Ayetelkürsi' not in w['body'],(w['z'],w['k']))
    w5=week('5|2026',31);w6=week('6|2026',30);w10=week('10|2026',30)
    ok('A6 5. ve 6. sınıf 5. ünite adları programla aynı; 10. sınıf 5. ünite adı tam',w5['u']==['5. MİMARİMİZDE DİNÎ MOTİFLER'] and w6['u']==['5. KÜLTÜRÜMÜZDEKİ DİNÎ MOTİFLER'] and w10['u']==['5. İSLAM DÜŞÜNCESİNDE İTİKADİ-SİYASİ VE FIKHİ YORUMLAR'] and 'Programdaki adı' not in w5['body']+w6['body'],(w5['u'],w6['u'],w10['u']))
    w=week('12|2018',15);ok('A7 12.2.3 öğretmen panelinde “Nisâ suresi 69. ayet” (kazanım ve konu); 136 yok',any('69. ayet' in z for z in w['z']) and '69. Ayet' in w['k'][0] and '136' not in w['body'] and 'Programdaki metin' not in w['note'],(w['z'],w['k']))
    ev("go('grade',{g:10})");pg.wait_for_timeout(300);g10=ev("document.getElementById('app').innerText")
    ev("go('topic',{t:'TPC18-8-1-05',tab:'anlat'})");pg.wait_for_timeout(400);t8=ev("document.getElementById('app').innerText")
    ev("go('search',{q:'Ayet el-Kürsi'})");pg.wait_for_timeout(400);sr=ev("document.getElementById('app').innerText")
    ok('A8 Öğrenci ekranları: 10. sınıf sayfasında tam ünite adı; 8.1.6 konusu “Ayet el-Kürsi”; arama sonuç veriyor',('FIKHİ YORUMLAR' in g10.upper() or 'Fıkhi Yorumlar' in g10) and 'Ayet el-Kürsi' in t8 and 'Ayetelkürsi' not in t8 and 'Ayet el-Kürsi' in sr,(g10[:0],))
    # B'den önce: eksik veri ifadeleri
    w=week('12|2018',16);ok('A9 Eksik veri: 12. sınıf 16. hafta ders saati tahmin edilmiyor, “Yıllık plan Excel’inde veri bulunmuyor.”',"Yıllık plan Excel'inde veri bulunmuyor" in w['body'] and not re.search(r'Bu hafta: \d+ ders saati',w['body']))
    w=week('8|2018',2);ok('A10 Eksik veri: boş açıklama hücresi uydurulmuyor; “Yıllık plan Excel’inde veri bulunmuyor.” + ayrı kaynak olarak program açıklaması',"Yıllık plan Excel'inde veri bulunmuyor" in w['body'] and 'öğretim programındaki kazanım açıklaması' in w['body'])
    c.close()
    # ============ B. PIN ============
    c,pg=ctx();pg.goto(URL);pg.wait_for_timeout(1200);ev=pg.evaluate
    ok('B0 Varsayılan PIN HTML’de açık metin değil (yalnızca SHA-256 özeti)','"1999"' not in HTML[HTML.index('const V36='):HTML.index('const V36=')+20000] and re.search(r'DEF:\{salt:"v36-varsayilan",h:"[0-9a-f]{64}"\}',HTML))
    ok('B1 Açılışta öğretmen oturumu kapalı',ev("sessionStorage.getItem('dk-ogrt-oturum')") is None and ev("localStorage.getItem('dk-ogrt-oturum')") is None)
    ways={}
    for name,js in [('alt menü',"document.querySelector('nav.bnav [data-k=\"ogretmen\"]').click()"),('ana sayfa kartı',"go('home');document.querySelector('#app .og-home').click()"),('doğrudan rota',"view='ogretmen';draw()"),('OGRT.render()',"view='ogretmen';OGRT.render()"),('haftalık çizim',"view='ogretmen';OGRT.W.render()"),('geçmiş/geri',"go('ogretmen');go('home');history.back()")]:
        ev("go('home')");pg.wait_for_timeout(100);ev(js);pg.wait_for_timeout(350)
        ways[name]=ev("[!!document.querySelector('.pin36'),!!document.querySelector('.og-tabs')]")
    ok('B2 PIN girilmeden hiçbir yoldan panele erişilemiyor (alt menü, kart, doğrudan rota, render çağrıları, geri)',all(v==[True,False] for v in ways.values()),ways)
    ev("go('ogretmen')");pg.wait_for_timeout(200)
    attrs=ev("(()=>{const i=document.getElementById('pin36-in');return [i.type,i.inputMode,i.maxLength,i.getAttribute('pattern')]})()")
    ok('B3 PIN alanı sayısal klavye açar ve noktalarla gizlenir',attrs==['password','numeric',4,'[0-9]*'],attrs)
    pg.fill('#pin36-in','1234');pg.wait_for_timeout(200)
    m1=ev("document.getElementById('pin36-msg').textContent");s1=ev("sessionStorage.getItem('dk-ogrt-oturum')")
    ok('B4 Yanlış PIN reddediliyor, anlaşılır hata mesajı',s1 is None and 'PIN hatalı' in m1 and 'Kalan deneme: 4' in m1 and ev("!!document.querySelector('.pin36')"),m1)
    for x in ['0000','1111','2222','3333']:pg.fill('#pin36-in',x);pg.wait_for_timeout(120)
    lock=ev("[document.getElementById('pin36-msg').textContent,document.getElementById('pin36-in').disabled]")
    ev("document.getElementById('pin36-in').disabled=false");pg.fill('#pin36-in','1999');pg.wait_for_timeout(200)
    stillLocked=ev("sessionStorage.getItem('dk-ogrt-oturum')") is None
    ev("(()=>{const a=JSON.parse(sessionStorage.getItem('dk-ogrt-deneme'));a.until=Date.now()-1;sessionStorage.setItem('dk-ogrt-deneme',JSON.stringify(a))})()");ev("go('home');go('ogretmen')");pg.wait_for_timeout(200)
    ok('B5 5 hatalı denemeden sonra 30 sn bekleme; bu sürede doğru PIN de kabul edilmiyor; süre bitince giriş açılıyor','30 saniye' in lock[0] and lock[1] and stillLocked and not ev("document.getElementById('pin36-in').disabled"),lock)
    pg.fill('#pin36-in','1999');pg.wait_for_timeout(350)
    ok('B6 Doğru PIN (1999) ile oturum açılıyor; “Oturumu kapat” görünür',ev("[sessionStorage.getItem('dk-ogrt-oturum'),!!document.querySelector('.og-tabs'),!!document.querySelector('.og-out')]")==['1',True,True])
    ok('B7 Oturum kalıcı depoya yazılmıyor',ev("Object.keys(localStorage).filter(k=>/oturum|session/i.test(k))")==[] and ev("localStorage.getItem('dk-ogrt-oturum')") is None)
    for js in ["go('home')","go('topic',{t:'TPC-6-2-02',tab:'anlat'})","go('games')","go('links',{lk:{tab:'kavram',sel:null}})","go('classes')"]:ev(js);pg.wait_for_timeout(150)
    ev("go('ogretmen')");pg.wait_for_timeout(250);t8=ev("[!!document.querySelector('.pin36'),!!document.querySelector('.og-tabs')]")
    ok('B8 Öğrenci ekranlarında dolaştıktan sonra panele dönüşte PIN yeniden sorulmuyor; ana sayfaya dönmek oturumu kapatmıyor',t8==[False,True],t8)
    for k in ['sinif','diger','plan','yedek','hafta']:ev(f"OGRT.S().tab='{k}';OGRT.render()")
    ok('B9 Sekme/sayfa geçişleri oturumu etkilemiyor',ev("sessionStorage.getItem('dk-ogrt-oturum')")=='1' and ev("!!document.querySelector('.og-tabs')"))
    cdp=c.new_cdp_session(pg)
    ev("Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}))")
    cdp.send('Page.setWebLifecycleState',{'state':'frozen'});pg.wait_for_timeout(300);cdp.send('Page.setWebLifecycleState',{'state':'active'})
    ev("Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))")
    ev("go('home');go('ogretmen')");pg.wait_for_timeout(200)
    ok('B10 Arka plana geçiş / sayfa dondurma (benzetim) oturumu kapatmıyor',ev("[sessionStorage.getItem('dk-ogrt-oturum'),!!document.querySelector('.og-tabs')]")==['1',True])
    pg.reload();pg.wait_for_timeout(1300);ev("go('ogretmen')");pg.wait_for_timeout(250)
    ok('B11 Sayfa yenileme oturumu kapatmıyor',ev("!!document.querySelector('.og-tabs')"))
    # PIN değiştir
    ev("OGRT.S().tab='yedek';OGRT.render()");pg.wait_for_timeout(150)
    f='.pin36-s form';pg.fill(f+' input[name=a]','0000');pg.fill(f+' input[name=b]','2468');pg.fill(f+' input[name=c]','2468');pg.click(f+' button[type=submit]');pg.wait_for_timeout(150)
    e1=ev("document.querySelector('.pin36-s .og-err').textContent")
    pg.fill(f+' input[name=a]','1999');pg.fill(f+' input[name=b]','2468');pg.fill(f+' input[name=c]','2468');pg.click(f+' button[type=submit]');pg.wait_for_timeout(150)
    rec=json.loads(ev("localStorage.getItem('dk-ogretmen-pin')"))
    with pg.expect_download() as dl:pg.click('.og-bk button:has-text("JSON olarak yedekle")')
    bk=open(dl.value.path(),encoding='utf-8').read()
    # 12 Oturumu kapat
    pg.click('.og-out');pg.wait_for_timeout(250);ev("go('ogretmen')");pg.wait_for_timeout(200)
    out=ev("[sessionStorage.getItem('dk-ogrt-oturum'),!!document.querySelector('.pin36'),view]")
    pg.fill('#pin36-in','1999');pg.wait_for_timeout(200);old=ev("sessionStorage.getItem('dk-ogrt-oturum')")
    pg.fill('#pin36-in','2468');pg.wait_for_timeout(250);new=ev("sessionStorage.getItem('dk-ogrt-oturum')")
    ok('B12 “Oturumu kapat” sonrası PIN tekrar isteniyor',out==[None,True,'ogretmen'],out)
    ok('B13 PIN değiştirme: yanlış mevcut PIN reddediliyor; yeni PIN özet olarak saklanıyor, eski PIN artık geçmiyor, yeni PIN geçiyor; PIN yedeğe girmiyor','hatalı' in e1 and re.fullmatch(r'[0-9a-f]{64}',rec['h']) and '2468' not in json.dumps(rec) and old is None and new=='1' and 'dk-ogretmen-pin' not in bk and '2468' not in bk,(e1,old,new))
    # 14 yeni oturum (uygulama tamamen kapatılıp açıldı): yeni tarayıcı bağlamı ve aynı bağlamda yeni sekme
    c2,p2=ctx();p2.goto(URL);p2.wait_for_timeout(1100);p2.evaluate("go('ogretmen')");p2.wait_for_timeout(200)
    t14a=p2.evaluate("!!document.querySelector('.pin36')");c2.close()
    p3=c.new_page();p3.goto(URL);p3.wait_for_timeout(1100);p3.evaluate("go('ogretmen')");p3.wait_for_timeout(200);t14b=p3.evaluate("!!document.querySelector('.pin36')")
    ok('B14 Uygulama kapatılıp yeni oturumla açıldığında PIN yeniden isteniyor (yeni tarayıcı oturumu ve yeni sekme)',t14a and t14b,(t14a,t14b))
    c.close()
    # ============ C. Açılış ve performans ============
    c,pg=ctx(768,1024,True)
    c.add_init_script("""window.__seen={old:false,splash:false,boot:false,appWrites:0};new MutationObserver(m=>{m.forEach(r=>r.addedNodes.forEach(n=>{if(n.id==='splash31')window.__seen.splash=true}))}).observe(document,{childList:true,subtree:true});
     document.addEventListener('DOMContentLoaded',()=>{});(function f(){const bt=document.getElementById('boot36');if(bt)window.__seen.boot=true;const nv=document.querySelector('nav.bnav');
     if(nv&&nv.offsetParent!==null){const r=nv.getBoundingClientRect(),el=document.elementFromPoint(Math.max(1,r.left+r.width/2),Math.max(1,r.top+r.height/2));if(el&&nv.contains(el)&&!document.querySelector('nav.bnav [data-k=\"pek\"]'))window.__seen.old=true}
     if(!window.__done)requestAnimationFrame(f)})();""")
    cdp=c.new_cdp_session(pg);cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    b.start_tracing(page=pg,screenshots=True,categories=['devtools.timeline','disabled-by-default-devtools.screenshot'])
    pg.goto(URL,wait_until='load');pg.wait_for_timeout(2500);ev=pg.evaluate;ev("window.__done=true")
    tr=json.loads(b.stop_tracing());seen=ev("window.__seen")
    shots=[e for e in tr['traceEvents'] if e.get('name')=='Screenshot'];nav0=max([e['ts'] for e in tr['traceEvents'] if e.get('name')=='navigationStart'] or [0])
    from PIL import Image
    import statistics
    def kind(d):
        im=Image.open(io.BytesIO(base64.b64decode(d))).convert('L').resize((48,64));W_,H_=im.size;px=im.load()
        allp=[px[i,j] for i in range(W_) for j in range(H_)];edge=[px[i,j] for i in range(W_) for j in range(H_) if i<10 or i>=W_-10 or j<12 or j>=H_-12]
        if statistics.pstdev(allp)<6:return 'blank'
        return 'boot' if statistics.pstdev(edge)<6 else 'app'
    seq=[];last=None
    for s in shots:
        if s['ts']<nav0:continue
        k=kind(s['args']['snapshot'])
        if k=='blank':continue
        if k!=last:seq.append(k);last=k
    ok('C1 Eski arayüz hiç görünmüyor: ilk boyamadan itibaren açılış ekranı, sonra doğrudan yeni arayüz; geç splash yok',seen['boot'] and not seen['old'] and not seen['splash'] and seq and seq[0]=='boot' and 'boot' not in seq[seq.index('app'):] if 'app' in seq else False,(seen,seq))
    ok('C2 İlk çizim doğru: alt menü yeni sürüm (Öğretmen düğmesi dahil), ana sayfa kartları, açılış ekranı kaldırıldı',ev("[!document.getElementById('boot36'),!!document.querySelector('#app .h30-hello'),[...document.querySelectorAll('nav.bnav button')].map(b=>b.dataset.k).join(',')]")==[True,True,'home,classes,pek,dene,links,games,ogretmen'])
    # draw sayısı: açılışta bir kez; geçişte bir kez
    ev("window.__dc=0;(function(){const d=draw;draw=function(){window.__dc++;return d.apply(this,arguments)}})()")
    for js in ["go('classes')","go('topic',{t:'TPC-6-2-02',tab:'anlat'})","go('games')","go('home')"]:ev(js)
    ok('C3 Ekran geçişlerinde tek çizim (4 geçiş = 4 draw)',ev("window.__dc")==4,ev("window.__dc"))
    # önbellek doğruluğu: Store.all/get sonuçları, değişiklik sonrası güncelleniyor
    r1=ev("(()=>{const t=Store.get('topics','TPC-6-2-02');const a=Store.all('topics');a.reverse();const b=Store.all('topics');return [!!t,a[0].id!==b[0].id,Store.get('outcomes','DKAB18-12-U02-O03').title]})()")
    r2=ev("(()=>{const before=Store.get('concepts',Store.all('concepts')[0].id).term;Store.patch(Store.all('concepts')[0].id,{term:'TEST36'});const after=Store.get('concepts',Store.all('concepts')[0].id).term;Store.patch(Store.all('concepts')[0].id,{term:before});return [after,Store.get('concepts',Store.all('concepts')[0].id).term===before]})()")
    ev("(()=>{const id=Store.all('concepts')[0].id;delete Store.ov.patch[id];Store.save()})()")
    ok('C4 Veri önbelleği doğru: dışarıya kopya veriyor (sıralama/ters çevirme önbelleği bozmuyor), Store.patch sonrası hemen güncelleniyor',r1[0] and r1[1] and '69' in r1[2] and r2==['TEST36',True],(r1,r2))
    c.close()
    # ============ D. Tabu ============
    res=[]
    for W,H in [(360,740),(390,844),(768,1024),(1024,768),(1440,900)]:
        for th in ['light','dark']:
            c,pg=ctx(W,H,W<800);pg.goto(URL);pg.wait_for_timeout(1100);ev=pg.evaluate;ev(f"document.documentElement.dataset.theme='{th}'")
            gid=ev("gList().find(g=>g.gameType==='tabu').id");g=ev(f"(()=>{{const g=gList().find(x=>x.id==='{gid}');return JSON.parse(JSON.stringify(g.items))}})()")
            ev(f"playGame('{gid}')");pg.wait_for_timeout(300);pg.click('button:has-text("Oyunu başlat")');pg.wait_for_timeout(300)
            r=ev("""(()=>{const S=[...document.querySelectorAll('.n30 .fbd span')],cs=S.map(s=>getComputedStyle(s)),bg=getComputedStyle(document.querySelector('.n30 .cardx')).backgroundColor;
              const L=c=>{const m=c.match(/[\\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])};
              const span=S[0],word=span.childNodes[1].textContent,col=cs[0].color,bgc=getComputedStyle(span).backgroundColor;
              return{n:S.length,lt:cs.some(c=>c.textDecorationLine.includes('line-through')),col,red:(()=>{const m=col.match(/\\d+/g).map(Number);return m[0]>m[1]+60&&m[0]>m[2]+60})(),lab:S.every(s=>s.querySelector('i')&&s.querySelector('i').textContent==='YASAKLI'),words:S.map(s=>s.childNodes[1].textContent),
               term:document.querySelector('.n30 .big').textContent,ov:document.documentElement.scrollWidth-document.documentElement.clientWidth,fw:cs[0].fontWeight,fs:cs[0].fontSize}})()""")
            # kontrast: kelime rengi ile kart zemini
            con=ev("""(()=>{const s=document.querySelector('.n30 .fbd span');const P=c=>{const m=c.match(/[\d.]+/g).map(Number);return c.startsWith('color(')?[m[0]*255,m[1]*255,m[2]*255,m.length>3?m[3]:1]:(m.length===3?[...m,1]:m)};
              const layers=[];let e=s;while(e){const b=P(getComputedStyle(e).backgroundColor);if(b[3]>0)layers.push(b);if(b[3]>=1)break;e=e.parentElement}
              let base=e?null:P(getComputedStyle(document.documentElement).backgroundColor);if(!base||base[3]<1)base=[255,255,255,1];if(e)base=layers.pop();
              let bg=base.slice(0,3);for(let k=layers.length-1;k>=0;k--){const l=layers[k];bg=bg.map((v,q)=>l[q]*l[3]+v*(1-l[3]))}
              const fg=P(getComputedStyle(s).color);const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};const a=lum(fg),b2=lum(bg);return Math.round(((Math.max(a,b2)+.05)/(Math.min(a,b2)+.05))*100)/100})()""")

            item=next(x for x in g if x['term']==r['term'])
            okk=r['n']>0 and not r['lt'] and r['red'] and r['lab'] and r['words']==item['forbidden'] and r['ov']<=0 and con>=4.5 and int(r['fw'])>=600
            if W in (390,1024):pg.screenshot(path=f'/home/claude/work/v360/t/tabu_{W}_{th}.png')
            res.append((W,th,okk,con,r['col'],r['n']));c.close()
    ok('D1 Tabu: yasaklı sözcükler üstü çizili değil, kırmızı, “YASAKLI” etiketli, kalın; kontrast ≥4.5 (açık/koyu); sözcükler oyun verisiyle aynı; 5 genişlikte taşma yok',all(x[2] for x in res),[x for x in res if not x[2]][:3] or [(x[0],x[1],x[3]) for x in res][:4])
    src=HTML[HTML.index('GI.tabu={'):HTML.index('GI.tabu={')+6000]
    ok('D2 Tabu oyun mantığı/puanlama değişmedi (yalnız görünüm): +10 / −5 / pas kuralları ve veri aynı',all(x in src for x in ["Doğru +10","Tabu −5","passes:3"]))
    ok('Konsol/sayfa hatası yok',not errs,errs[:3])
    b.close()
print(json.dumps({'pass':sum(R.values()),'total':len(R)}))
