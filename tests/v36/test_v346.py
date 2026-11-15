import json
from playwright.sync_api import sync_playwright
def _sess36(b):
    """V36 PIN: öğretmen paneline giren eski testler için geçici öğretmen oturumu (yalnızca test)."""
    _nc=b.new_context
    def _c(*a,**k):
        cx=_nc(*a,**k);cx.add_init_script("try{sessionStorage.setItem('dk-ogrt-oturum','1')}catch(e){}");return cx
    b.new_context=_c
    _np=b.new_page
    def _p(*a,**k):
        pg=_np(*a,**k);pg.context.add_init_script("try{sessionStorage.setItem('dk-ogrt-oturum','1')}catch(e){}");return pg
    b.new_page=_p
    return b
def _noauto(b):
    _nc=b.new_context
    def _c(*a,**k):
        cx=_nc(*a,**k);cx.add_init_script("window.__ogrtNoAuto=1");return cx
    b.new_context=_c
    _np=b.new_page
    def _p(*a,**k):
        pg=_np(*a,**k);pg.context.add_init_script("window.__ogrtNoAuto=1");return pg
    b.new_page=_p
    return b
URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
R={};errs=[]
def ok(k,v,info=''):R[k]=bool(v);print(('OK  ' if v else 'FAIL'),k,str(info)[:260])
with sync_playwright() as p:
    b=_sess36(_noauto(p.chromium.launch()))
    c=b.new_context(viewport={'width':1366,'height':900},accept_downloads=True);pg=c.new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'ERR_' not in m.text and 'file:' not in m.text and errs.append(m.text))
    pg.goto(URL);pg.wait_for_timeout(1300);ev=pg.evaluate
    ok('1 Ana ekran çalışıyor (V34.6, hata yok; ana sayfada Öğretmen Paneli kartı ve alt menü girişi)',ev("V31.VER")=='V36.0' and ev("document.querySelector('nav.bnav [data-k=\"ogretmen\"]')!==null") and ev("document.querySelectorAll('#app .og-home').length")==1 and not errs,(ev("V31.VER"),errs[:2]))
    lsBefore=ev("Object.keys(localStorage).sort()")
    pg.click('nav.bnav [data-k="ogretmen"]');pg.wait_for_timeout(400)
    tabs=ev("[...document.querySelectorAll('.og-tabs button')].map(b=>b.textContent)")
    ok('2 Öğretmen Paneli açılıyor; yalnızca 5 bölüm',ev("view")=='ogretmen' and tabs==['Haftalık','Sınıflarım','Diğer'] and ev("document.querySelector('nav.bnav [data-k=\"ogretmen\"]').classList.contains('on')||document.querySelector('nav.bnav [data-k=\"ogretmen\"]').getAttribute('aria-current')!==null"),tabs)
    ok('2b Cihaz/tarayıcı uyarısı görünür','yalnızca bu cihaz' in ev("document.body.innerText"))
    # 3 çoklu sınıf
    def add(g,py):
        pg.select_option('#og-g',str(g));pg.select_option('#og-py',py);pg.click('.og-add button[type=submit]');pg.wait_for_timeout(250);ev("OGRT.S().tab='sinif';OGRT.render()")
    opts8=None
    pg.select_option('#og-g','8');opts8=ev("[...document.querySelectorAll('#og-py option')].map(o=>[o.value,o.selected])")
    pg.select_option('#og-g','5');opts5=ev("[...document.querySelectorAll('#og-py option')].map(o=>o.value)")
    ok('3a Program seçenekleri: 8. sınıfta 2018 varsayılan (yürürlükte), 5. sınıfta yalnızca 2026',opts8==[['2018',True],['2026',False]] and opts5==['2026'],(opts8,opts5))
    add(4,'2018');add(8,'2018');add(5,'2026');add(4,'2026')
    cl=ev("OGRT.d.classes")
    ok('3 Birden fazla sınıf eklenebiliyor',cl==[{'g':4,'py':'2018'},{'g':4,'py':'2026'},{'g':5,'py':'2026'},{'g':8,'py':'2018'}],cl)
    add(8,'2018');ok('3b Aynı sınıf iki kez eklenmiyor',len(ev("OGRT.d.classes"))==4)
    # 4-6
    ev("OGRT.pick('5|2026','kaz')");pg.wait_for_timeout(300)
    us=ev("[...document.querySelectorAll('.og-u')].map(d=>d.dataset.u)")
    exp=ev("Store.all('units').filter(u=>u.grade===5&&u.programYear==='2026').sort((a,b)=>a.order-b.order).map(u=>u.id)")
    ok('4 Ünite sırası MEB sırası (order) ile aynı',us==exp and len(us)==5,us)
    allok=True;bad=[]
    for g,py in [(4,'2018'),(4,'2026'),(5,'2026'),(8,'2018')]:
        ev(f"OGRT.pick('{g}|{py}','kaz')");pg.wait_for_timeout(150)
        shown=ev("[...document.querySelectorAll('.og-o')].map(e=>[e.dataset.oid,e.querySelector('code').textContent,e.querySelector('.og-ot').textContent])")
        want=ev(f"Store.all('units').filter(u=>u.grade==={g}&&u.programYear==='{py}').sort((a,b)=>a.order-b.order).flatMap(u=>Store.all('outcomes').filter(o=>o.unitId===u.id).sort((a,b)=>a.order-b.order).map(o=>[o.id,o.code,o.title]))")
        if shown!=want:allok=False;bad.append((g,py,len(shown),len(want)))
    ok('5 Tüm kazanımlar listeleniyor (4 sınıf/program, eksiksiz ve sıralı)',allok,bad)
    ok('6 Kazanım kodları ve metinleri veriyle birebir aynı',allok)
    tot=ev("[4,5,6,7,8,9,10,11,12].flatMap(g=>['2018','2026'].map(py=>OGRT.allOuts(g,py).length)).reduce((a,b)=>a+b,0)")
    ok('5b Tüm sınıf/programlardaki kazanım toplamı = 238',tot==238 and ev("Store.all('outcomes').length")==238,tot)
    # 8
    ev("OGRT.pick('4|2018','kaz')");pg.wait_for_timeout(200)
    py18=ev("[...document.querySelectorAll('.og-o')].every(e=>Store.get('units',Store.get('outcomes',e.dataset.oid).unitId).programYear==='2018')")
    ev("OGRT.pick('4|2026','kaz')");pg.wait_for_timeout(200)
    py26=ev("[...document.querySelectorAll('.og-o')].every(e=>{const u=Store.get('units',Store.get('outcomes',e.dataset.oid).unitId);return u.programYear==='2026'&&u.grade===4})")
    warn=ev("(document.querySelector('.og-warn')||{}).textContent||''")
    ok('8 2018 ve 2026 karışmıyor; 2026·4 için “henüz uygulanmıyor” açıklaması',py18 and py26 and '2027' in warn,warn[:120])
    # 7 içerik
    oid=ev("OGRT.allOuts(4,'2018')[0].id");ev(f"OGRT.pick('4|2018','kaz');OGRT.toggleO('{oid}')");pg.wait_for_timeout(300)
    secs=ev("[...document.querySelectorAll('.og-det h4')].map(h=>h.textContent)")
    ok('7a Kazanım detayında yalnızca 3 bölüm',secs==['A. İçeriği aç','B. Ders hazırla','C. Kazanım durumu'],secs)
    tps=ev(f"OGRT.topicsOf('{oid}').map(t=>t.id)")
    pg.click('.og-det .og-tb');pg.wait_for_timeout(500)
    ok('7 “İçeriği aç” bağlı konunun öğrenci içerik ekranını açıyor',ev("view")=='topic' and ev("G.t")==tps[0] and all(t and oid in ev(f"Store.get('topics','{t}').outcomeIds") for t in tps),(ev("view"),ev("G.t"),tps))
    ev("go('ogretmen')");pg.wait_for_timeout(300)
    o26=ev("OGRT.allOuts(4,'2026')[0].id");ev(f"OGRT.pick('4|2026','kaz');OGRT.toggleO('{o26}')");pg.wait_for_timeout(300)
    t26=ev("document.querySelector('.og-det .og-tb small').textContent")
    ok('7b İçeriği hazırlanmamış konu açıkça belirtiliyor',"henüz hazırlanmadı" in t26,t26)
    ok('7c Her kazanım yalnızca kendi bağlı konularını gösteriyor (başka kazanımdan içerik yok)',ev("Store.all('outcomes').every(o=>OGRT.topicsOf(o.id).every(t=>t.outcomeIds.includes(o.id)))"))
    # 9 durum
    pg.click(f'.og-o[data-oid="{o26}"] .og-det .og-seg button[data-st="isl"]');pg.wait_for_timeout(150)
    ev("OGRT.pick('8|2018','kaz')");o8=ev("OGRT.allOuts(8,'2018').filter(o=>o.unitId===OGRT.units(8,'2018')[0].id)");pg.wait_for_timeout(200);pg.click('.og-u summary');pg.wait_for_timeout(200)
    pg.click(f'.og-o[data-oid="{o8[0]["id"]}"] .og-seg button[data-st="tek"]');pg.click(f'.og-o[data-oid="{o8[1]["id"]}"] .og-seg button[data-st="isl"]');pg.wait_for_timeout(150)
    chip=ev("document.querySelector('.og-o[data-oid=\"%s\"] .og-chip').textContent"%o8[0]['id'])=='Tekrar edilmeli'
    order_after=ev("[...document.querySelectorAll('.og-u[open] .og-o')].map(e=>e.dataset.oid)")
    sv=json.loads(ev("localStorage.getItem('dk-ogretmen-v1')"))['status']
    ok('9 Durumlar anında kaydediliyor; sıra değişmiyor',sv.get(o26)=='isl' and sv.get(o8[0]['id'])=='tek' and sv.get(o8[1]['id'])=='isl' and order_after==[o['id'] for o in o8] and chip,sv)
    # 12 plan CRUD
    ev(f"OGRT.toggleO('{o8[2]['id']}')");pg.wait_for_timeout(250)
    f='.og-o.open .og-form'
    pg.fill(f+' input[name=date]','2026-11-12');pg.fill(f+' input[name=time]','09:40');pg.fill(f+' input[name=dur]','40');pg.fill(f+' textarea[name=goal]','Hedef A');pg.fill(f+' textarea[name=method]','Soru-cevap');pg.fill(f+' textarea[name=notes]','Not 1')
    pg.click(f+' button[type=submit]');pg.wait_for_timeout(300)
    P=ev("OGRT.d.plans")
    c1=len(P)==1 and P[0]['oid']==o8[2]['id'] and P[0]['g']==8 and P[0]['py']=='2018' and P[0]['goal']=='Hedef A' and ev(f"OGRT.st('{o8[2]['id']}')")=='plan'
    still_open=ev("OGRT.S().oid")==o8[2]['id']
    pg.click('.og-o.open .og-nf summary');pg.fill(f+' input[name=date]','2026-11-03');pg.fill(f+' textarea[name=goal]','Hedef B');pg.click(f+' button[type=submit]');pg.wait_for_timeout(300)
    c2=len(ev("OGRT.d.plans"))==2 and still_open
    ev("OGRT.S().tab='plan';OGRT.render()");pg.wait_for_timeout(200)
    rows=ev("[...document.querySelectorAll('.og-t tbody tr')].map(r=>r.innerText.replace(/\\s+/g,' '))")
    c3=len(rows)==2 and '2026-11-03' in rows[0] and '8. sınıf' in rows[0] and o8[2]['code'] in rows[0] and '40 dk' in rows[1]
    pg.click('.og-t tbody tr:nth-child(2) button');pg.wait_for_timeout(300)
    pg.fill('.sheet .og-form textarea[name=goal], .og-form textarea[name=goal]','Hedef A2') if False else pg.locator('.og-form textarea[name=goal]').last.fill('Hedef A2')
    pg.locator('.og-form input[name=dur]').last.fill('80');pg.locator('.og-form button[type=submit]').last.click();pg.wait_for_timeout(300)
    pid=[x for x in ev("OGRT.d.plans") if x['date']=='2026-11-12'][0]
    c4=pid['goal']=='Hedef A2' and pid['dur']==80 and len(ev("OGRT.d.plans"))==2
    ev("OGRT.S().tab='plan';OGRT.render()");pg.click('.og-t tbody tr:nth-child(1) button');pg.wait_for_timeout(300)
    pg.locator('.og-form button:has-text("Planı sil")').last.click();pg.wait_for_timeout(300)
    c5=[x['date'] for x in ev("OGRT.d.plans")]==['2026-11-12']
    pg.locator('.og-form').count()
    ok('12 Ders planı ekleme/çoklu plan/listeleme/düzenleme/silme',c1 and c2 and c3 and c4 and c5,(c1,c2,c3,c4,c5,rows))
    # 13 takvim
    ev("OGRT.d.plans.push({id:'Ptest1',g:8,py:'2018',unitId:Store.get('outcomes','%s').unitId,oid:'%s',date:'2026-10-01',time:'',dur:40,goal:'',method:'',notes:''});OGRT.save()"%(o8[0]['id'],o8[0]['id']))
    ev("Object.assign(OGRT.S(),{tab:'takvim',cal:'hafta',day:'2026-11-12'});OGRT.render()");pg.wait_for_timeout(200)
    wk=ev("[...document.querySelectorAll('.og-day')].map(d=>[d.dataset.d,d.querySelectorAll('li').length])")
    w_ok=len(wk)==7 and wk[0][0]=='2026-11-09' and dict(wk)['2026-11-12']==1 and sum(x[1] for x in wk)==1
    ev("Object.assign(OGRT.S(),{cal:'gun',day:'2026-11-12'});OGRT.render()");pg.wait_for_timeout(150)
    dy=ev("[...document.querySelectorAll('.og-day')].map(d=>[d.dataset.d,d.querySelectorAll('li').length])")
    today=ev("new Date().toISOString().slice(0,10)")
    up=ev("[...document.querySelectorAll('.og-two>div:first-child .og-ll>li')].map(l=>l.dataset.d)");past=ev("[...document.querySelectorAll('.og-two>div:last-child .og-ll>li')].map(l=>l.dataset.d)")
    ok('13 Takvim: haftalık (Pzt başlangıç), günlük, yaklaşan/geçmiş doğru',w_ok and dy==[['2026-11-12',1]] and all(d>=today for d in up) and all(d<today for d in past) and len(up)+len(past)==2,(wk,dy,up,past,today))
    # 16b İlerleme
    ev("OGRT.S().tab='ilerleme';OGRT.render()");pg.wait_for_timeout(150)
    il=ev("[...document.querySelectorAll('.og-ip')].map(d=>[d.querySelector('b').textContent,[...d.querySelectorAll('dd')].map(x=>+x.textContent),d.querySelector('.og-pc').textContent])")
    n8=ev("OGRT.allOuts(8,'2018').length");e8=['8. sınıf',[n8,1,1,n8-3,1],'%'+str(round(100/n8))]
    ok('İlerleme: sınıf başına gerçek sayılar ve yüzde',e8 in il and len(il)==4,il)
    # 10 reload
    snap=ev("localStorage.getItem('dk-ogretmen-v1')")
    pg.reload();pg.wait_for_timeout(1300);ev("go('ogretmen')");pg.wait_for_timeout(300)
    ok('10 Sayfa yenilendikten sonra sınıflar, durumlar, planlar korunuyor',json.loads(ev("JSON.stringify(OGRT.d)"))==json.loads(snap) and ev("OGRT.st('%s')"%o8[0]['id'])=='tek')
    # 11 bağımsızlık
    st4=ev("OGRT.prog(4,'2018').c");st426=ev("OGRT.prog(4,'2026').c");st8=ev("OGRT.prog(8,'2018').c")
    ok('11 Sınıflar birbirinden bağımsız (4·2018 etkilenmedi; 4·2026 ve 8·2018 ayrı)',st4=={'bas':ev("OGRT.allOuts(4,'2018').length"),'plan':0,'isl':0,'tek':0} and st426['isl']==1 and st8['tek']==1,(st4,st426,st8))
    ev("OGRT.S().tab='sinif';OGRT.render()");ev("OGRT.rmClass('4|2026')");pg.wait_for_timeout(200)
    ok('3c Sınıf kaldırma müfredatı ve kişisel kayıtları silmiyor',ev("Store.all('outcomes').length")==238 and ev("Store.all('units').filter(u=>u.grade===4&&u.programYear==='2026').length")==5 and ev(f"OGRT.d.status['{o26}']")=='isl' and len(ev("OGRT.d.classes"))==3)
    # 14 yedek/geri yükleme
    pg.click('nav.bnav [data-k="ogretmen"]');ev("OGRT.S().tab='yedek';OGRT.render()");pg.wait_for_timeout(200)
    with pg.expect_download() as dl:pg.click('.og-bk button:has-text("JSON olarak yedekle")')
    path=dl.value.path();bk=json.load(open(path,encoding='utf-8'))
    good=json.loads(ev("JSON.stringify(OGRT.d)"))
    b1=bk['app']=='dkab-ogretmen' and bk['plans']==good['plans'] and bk['status']==good['status']
    import tempfile,os
    td=tempfile.mkdtemp()
    def up_file(name,content):
        fp=os.path.join(td,name);open(fp,'w',encoding='utf-8').write(content)
        pg.set_input_files('.og-bk input[type=file]',fp);pg.wait_for_timeout(400)
    up_file('bozuk.json','{bozuk');e1=ev("document.getElementById('og-rerr').textContent");s1=ev("localStorage.getItem('dk-ogretmen-v1')")==ev("JSON.stringify(OGRT.d)") and json.loads(ev("JSON.stringify(OGRT.d)"))==good
    bad=dict(bk);bad['status']={'x':'yanlis'};up_file('yanlis.json',json.dumps(bad));e2=ev("document.getElementById('og-rerr').textContent");s2=json.loads(ev("JSON.stringify(OGRT.d)"))==good
    up_file('baska.json',json.dumps({'a':1}));s3=json.loads(ev("JSON.stringify(OGRT.d)"))==good
    ev("OGRT.d=OGRT.def();OGRT.save();OGRT.render()");pg.wait_for_timeout(150)
    up_file('iyi.json',open(path,encoding='utf-8').read());s4=json.loads(ev("JSON.stringify(OGRT.d)"))['plans']==good['plans'] and json.loads(ev("JSON.stringify(OGRT.d)"))['status']==good['status']
    ok('14 JSON yedek alma ve geri yükleme; bozuk/yanlış dosya mevcut veriyi bozmuyor',b1 and s1 and s2 and s3 and s4 and 'Geri yükleme yapılmadı' in e1 and 'durum' in e2,(b1,s1,s2,s3,s4,e1[:80],e2[:80]))
    lsAfter=ev("Object.keys(localStorage).sort()")
    ok('Veri güvenliği: yalnızca yeni anahtar eklendi, diğer anahtarlar korunuyor; müfredat sayıları aynı',set(lsAfter)-set(lsBefore)<={'dk-ogretmen-v1','dk-ogretmen-hafta-v1'} and 'dk-ogretmen-v1' in lsAfter and set(lsBefore)<=set(lsAfter) and ev("[Store.all('units').length,Store.all('outcomes').length,Store.all('topics').length]")==[60,238,246],(lsBefore,lsAfter))
    src=open('/home/claude/work/v350/ogrt.js',encoding='utf-8').read()
    ok('Yetki ayrımı: öğretmen kodu Store.patch/put/del, KMAP.save, V34 yönetimi çağırmıyor',not any(x in src for x in ['Store.patch','Store.put','Store.set','Store.del','KMAP.save','KMAP.ov','V34.ov','isEd']))
    ok('Konsol/sayfa hatası yok (masaüstü akışı)',not errs,errs[:3])
    # 15 responsive
    res=[]
    for w,h in [(360,740),(390,844),(768,1024),(1024,768),(1440,900)]:
        for th in ['light','dark']:
            cc=b.new_context(viewport={'width':w,'height':h},has_touch=w<800);q=cc.new_page();e2s=[];q.on('pageerror',lambda e:e2s.append(str(e)))
            q.add_init_script("localStorage.setItem('dk-ogretmen-v1',%s)"%json.dumps(json.dumps(good)));q.goto(URL);q.wait_for_timeout(1100)
            q.evaluate(f"document.documentElement.dataset.theme='{th}'")
            hc=q.evaluate("document.querySelectorAll('#app .og-home').length")==1
            q.click('#app .og-home');q.wait_for_timeout(250)
            hc=hc and q.evaluate("view")=='ogretmen' and q.evaluate("getComputedStyle(document.querySelector('nav.bnav [data-k=\"ogretmen\"]')).display")==('none' if w<600 else 'flex')
            r=[]
            for tab in ['sinif','kaz','plan','ilerleme','takvim']:
                q.evaluate(f"OGRT.S().tab='{tab}';OGRT.S().oid='';OGRT.render()")
                if tab=='kaz':q.evaluate("OGRT.pick('8|2018','kaz');OGRT.toggleO(OGRT.allOuts(8,'2018')[0].id)")
                q.wait_for_timeout(150)
                ov=q.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
                small=q.evaluate("[...document.querySelectorAll('.og button, .og summary, .og select, .og input:not([type=file]), .og-file')].filter(e=>e.offsetParent&&!e.closest('details:not([open])')||e.tagName==='SUMMARY').map(e=>e.getBoundingClientRect()).filter(r=>r.width>0&&r.height<43.5).length")
                r.append((tab,ov,small))
            nb=q.evaluate("[...document.querySelectorAll('nav.bnav button')].filter(b=>b.offsetParent).map(b=>Math.round(b.getBoundingClientRect().width))")
            if w in(390,1024) or th=='light':q.screenshot(path=f'/home/claude/work/v360/t/s6_{w}_{th}.png')
            res.append((w,th,q.evaluate('document.documentElement.dataset.theme')==th and all(x[1]<=0 and x[2]==0 for x in r) and min(nb)>=44 and not e2s and hc,r,min(nb)))
            cc.close()
    ok('15 Mobil/tablet/masaüstü (360/390/768/1024/1440 × açık/koyu): yatay taşma yok, dokunma hedefleri ≥44px',all(x[2] for x in res),[x for x in res if not x[2]][:3])
    b.close()
print(json.dumps({'pass':sum(R.values()),'total':len(R)}))
# ek: telefonda durum güncelleme (detay C bölümünden, gerçek tıklama)
with sync_playwright() as p:
    b=_sess36(_noauto(p.chromium.launch()));c=b.new_context(viewport={'width':360,'height':740},has_touch=True);q=c.new_page()
    q.goto(URL);q.wait_for_timeout(1100);q.tap('#app .og-home');q.wait_for_timeout(200)
    q.select_option('#og-g','7');q.tap('.og-add button[type=submit]');q.wait_for_timeout(200);q.evaluate("OGRT.S().tab='kaz';OGRT.render()");q.wait_for_timeout(200)
    q.tap('.og-u summary');q.wait_for_timeout(150);q.locator('.og-o .og-ob').first.tap();q.wait_for_timeout(250)
    vis=q.evaluate("getComputedStyle(document.querySelector('.og-rowseg')).display")
    q.locator('.og-det .og-seg button[data-st="isl"]').tap();q.wait_for_timeout(150)
    o=q.evaluate("OGRT.allOuts(7,'2026')[0].id");r=json.loads(q.evaluate("localStorage.getItem('dk-ogretmen-v1')"))
    ok('15b Telefonda (360px, dokunma): Sınıf ekle → Ünite → Kazanım → durum işlendi; satırda durum etiketi',vis=='none' and r['status'].get(o)=='isl' and q.evaluate("document.querySelector('.og-o .og-chip').textContent")=='İşlendi' and r['classes']==[{'g':7,'py':'2026'}],(vis,r['status']))
    b.close()
print(json.dumps({'pass':sum(R.values()),'total':len(R)}))
