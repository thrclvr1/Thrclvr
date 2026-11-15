import json,os,tempfile
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
URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
R={};errs=[]
def ok(k,v,info=''):R[k]=bool(v);print(('OK  ' if v else 'FAIL'),k,str(info)[:300])
SY='2026-2027'
# V34.9 kayıtları: 4·2018 hesaplanmış ve düzenlenmemiş; 8·2018 hesaplanmış ve öğretmen düzenlemiş; 12·2018 öğretmenin elle kurduğu (V34.8)
A={"v":1,"app":"dkab-ogretmen","classes":[{"g":4,"py":"2018"},{"g":8,"py":"2018"},{"g":12,"py":"2018"}],"active":"4|2018","status":{"DKAB18-4-U01-O01":"isl","DKAB18-8-U01-O01":"tek"},
 "plans":[{"id":"Pa","created":"2026-11-09T08:00:00.000Z","g":4,"py":"2018","unitId":"DKAB18-4-U01","oid":"DKAB18-4-U01-O01","date":"2026-11-11","time":"09:40","dur":40,"goal":"Hedef","method":"","notes":"","sy":SY,"wk":9,"updated":"2026-11-09T08:00:00.000Z"}],"updatedAt":"2026-11-09T08:00:00.000Z"}
H={"v":1,"app":"dkab-ogretmen-hafta","cal":{},"tatil":{},
 "weeks":{"4|2018":{SY:{"1":["DKAB18-4-U01-O01"],"2":["DKAB18-4-U01-O01"],"9":["DKAB18-4-U02-O01"]}},"8|2018":{SY:{"1":["DKAB18-8-U01-O01"],"3":["DKAB18-8-U01-O02","DKAB18-8-U01-O03"]}},"12|2018":{SY:{"5":["DKAB18-12-U01-O02"]}}},
 "notes":{"4|2018|2026-2027|9":[{"id":"N1","text":"Eski not","created":"2026-11-09T08:00:00.000Z","updated":"2026-11-09T08:00:00.000Z"}]},
 "auto":{"4|2018":{SY:{"gen":"2026-11-10T10:00:00.000Z","edited":False,"basis":"saat","lessonWeeks":37}},"8|2018":{SY:{"gen":"2026-11-10T10:00:00.000Z","edited":True,"basis":"saat","lessonWeeks":37}}},
 "migrated":True,"migratedPlans":0,"updatedAt":"2026-11-10T10:00:00.000Z"}
with sync_playwright() as p:
    b=_sess36(p.chromium.launch());c=b.new_context(viewport={'width':1366,'height':900},accept_downloads=True);pg=c.new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'ERR_' not in m.text and 'file:' not in m.text and errs.append(m.text))
    pg.goto(URL);pg.wait_for_timeout(800);pg.evaluate("([a,h])=>{localStorage.setItem('dk-ogretmen-v1',a);localStorage.setItem('dk-ogretmen-hafta-v1',h)}",[json.dumps(A),json.dumps(H)]);pg.reload();pg.wait_for_timeout(1300);ev=pg.evaluate
    same=ev("localStorage.getItem('dk-ogretmen-v1')")==json.dumps(A)
    pg.click('#app .og-home');pg.wait_for_timeout(300)
    src4=ev("(()=>{const m=OGRT.W.srcMap(4,'2018','2026-2027'),o={};Object.entries(m).forEach(([n,x])=>{if(x.oids&&x.oids.length)o[n]=x.oids});return o})()")
    w4=json.loads(ev("JSON.stringify(OGRT.W.d.weeks['4|2018']['2026-2027'])"));a4=json.loads(ev("JSON.stringify(OGRT.W.d.auto['4|2018']['2026-2027'])"))
    ok('V34.9 hesaplanmış ve düzenlenmemiş plan (4·2018) yıllık plana kendiliğinden geçti; durum, not ve ders planı korundu',same and w4==src4 and a4['basis']=='yillik-plan' and not a4['edited'] and ev("OGRT.st('DKAB18-4-U01-O01')")=='isl' and ev("(OGRT.W.d.notes['4|2018|2026-2027|9']||[]).length")==1 and ev("OGRT.d.plans.length")==1,a4)
    pg.click('.ogw .og-cls button:nth-child(2)');pg.wait_for_timeout(250)
    w8=json.loads(ev("JSON.stringify(OGRT.W.d.weeks['8|2018']['2026-2027'])"));n8=ev("document.querySelector('.ogw-auto').innerText")
    ok('V34.9’da öğretmenin düzenlediği plan (8·2018) kendiliğinden değişmedi; ekranda belirtiliyor',w8==H['weeks']['8|2018'][SY] and 'sen düzenlemişsin' in n8,n8)
    pg.click('.ogw-auto .ogw-lnk');pg.wait_for_timeout(200);warn=ev("document.body.innerText.includes('silinip yıllık plana göre yeniden kurulacak')");pg.click('button:text-is("Vazgeç")');pg.wait_for_timeout(150)
    kept=json.loads(ev("JSON.stringify(OGRT.W.d.weeks['8|2018']['2026-2027'])"))==w8
    pg.click('.ogw-auto .ogw-lnk');pg.wait_for_timeout(200);pg.click('button:has-text("Evet, yıllık plana göre kur")');pg.wait_for_timeout(200)
    src8=ev("(()=>{const m=OGRT.W.srcMap(8,'2018','2026-2027'),o={};Object.entries(m).forEach(([n,x])=>{if(x.oids&&x.oids.length)o[n]=x.oids});return o})()")
    ok('Yıllık plana geçiş onay istiyor (Vazgeç değiştirmiyor); onaylanınca plan yıllık plandan kuruluyor, durum korunuyor',warn and kept and json.loads(ev("JSON.stringify(OGRT.W.d.weeks['8|2018']['2026-2027'])"))==src8 and ev("OGRT.st('DKAB18-8-U01-O01')")=='tek')
    pg.click('.ogw .og-cls button:nth-child(3)');pg.wait_for_timeout(250)
    w12=json.loads(ev("JSON.stringify(OGRT.W.d.weeks['12|2018']['2026-2027'])"));n12=ev("document.querySelector('.ogw-auto').innerText")
    ok('V34.8’de öğretmenin elle kurduğu plan (12·2018) korunuyor; yıllık plana geçiş öneriliyor',w12==H['weeks']['12|2018'][SY] and 'sen oluşturdun' in n12,n12)
    # öğretmen düzenlemeleri (4·2018 yıllık plan üzerinde)
    pg.click('.ogw .og-cls button:nth-child(1)');pg.wait_for_timeout(200)
    ev("OGRT.W.go(9)");pg.wait_for_timeout(100)
    pg.click('.ogw-k .ogw-more summary');pg.click('.ogw-k .ogw-b:has-text("Taşı / kopyala")');pg.wait_for_timeout(150);pg.select_option('#ogw-to','15');pg.click('button:text-is("Kopyala")');pg.wait_for_timeout(200)
    cp=ev("[OGRT.W.list(4,'2018','2026-2027',9),OGRT.W.list(4,'2018','2026-2027',15),OGRT.W.ar(4,'2018','2026-2027').edited]")
    pg.select_option('.ogw-k .ogw-st','plan');pg.click('.ogw-nadd');pg.fill('.ogw-nfm textarea','Yıllık plan notu');pg.click('.ogw-nfm button[type=submit]');pg.wait_for_timeout(200)
    pg.click('.ogw-k .ogw-b:has-text("Ders hazırla")');pg.wait_for_timeout(200);pg.locator('.og-form textarea[name=goal]').last.fill('İnanç esasları');pg.locator('.og-form button[type=submit]').last.click();pg.wait_for_timeout(250)
    pl=[x for x in ev("OGRT.d.plans") if x['goal']=='İnanç esasları']
    ok('Öğretmen yıllık plan üzerinde düzenleme yapabiliyor (kopyala, durum, not, ders planı); plan “düzenlendi” sayılıyor',cp[0]==['DKAB18-4-U02-O01'] and 'DKAB18-4-U02-O01' in cp[1] and cp[2] is True and ev("OGRT.st('DKAB18-4-U02-O01')")=='plan' and len(pl)==1 and pl[0]['wk']==9,(cp,pl))
    # tatil işareti dağılımı kaydırmaz
    snap=ev("JSON.stringify(OGRT.W.d.weeks)");ev("OGRT.W.go(5)");pg.click('.ogw-foot .ogw-lnk:has-text("tatil olarak işaretle")');pg.wait_for_timeout(150)
    noshift=ev("JSON.stringify(OGRT.W.d.weeks)")==snap and ev("document.querySelectorAll('.ogw-k').length")>0 and ev("!!document.querySelector('.ogw-hol')")
    pg.click('.ogw-foot .ogw-lnk:has-text("İşareti sıfırla")');pg.wait_for_timeout(100)
    ok('Öğretmenin tatil işareti yıllık plan dağılımını kaydırmıyor (tarihler sabit)',noshift)
    # yenile
    sA,sH=ev("localStorage.getItem('dk-ogretmen-v1')"),ev("localStorage.getItem('dk-ogretmen-hafta-v1')")
    pg.reload();pg.wait_for_timeout(1300);ev("go('ogretmen')");pg.wait_for_timeout(200)
    ok('Sayfa yenilenince yıllık plan ve öğretmen düzenlemeleri korunuyor (yeniden kurulmuyor)',json.loads(ev("JSON.stringify(OGRT.W.d)"))==json.loads(sH) and json.loads(ev("JSON.stringify(OGRT.d)"))==json.loads(sA))
    # sınıflar karışmıyor
    ok('Sınıfların planları karışmıyor: her sınıf yalnız kendi programının kazanımlarını içeriyor; 2018 ve 2026 ayrı',ev("Object.entries(OGRT.W.d.weeks).every(([k,Y])=>{const[g,py]=k.split('|'),ok=new Set(OGRT.allOuts(+g,py).map(o=>o.id));return Object.values(Y).every(ws=>Object.values(ws).flat().every(id=>ok.has(id)))})") and ev("Object.entries(OGRT.W.YP).every(([k,p])=>{const[g,py]=k.split('|'),ok=new Set(OGRT.allOuts(+g,py).map(o=>o.id));return p.weeks.every(w=>w.oids.every(id=>ok.has(id)))})"))
    # yedek
    ev("OGRT.S().tab='yedek';OGRT.render()");pg.wait_for_timeout(100)
    with pg.expect_download() as dl:pg.click('.og-bk button:has-text("JSON olarak yedekle")')
    bk=json.load(open(dl.value.path(),encoding='utf-8'));good=json.loads(ev("JSON.stringify(OGRT.W.d)"))
    td=tempfile.mkdtemp();fp=os.path.join(td,'b.json');json.dump(bk,open(fp,'w'))
    ev("OGRT.W.d=OGRT.W.def();OGRT.W.d.migrated=true;OGRT.W.save();OGRT.render()");pg.set_input_files('.og-bk input[type=file]',fp);pg.wait_for_timeout(350)
    got=json.loads(ev("JSON.stringify(OGRT.W.d)"));fp2=os.path.join(td,'v349.json');json.dump({**A,'hafta':H},open(fp2,'w'));pg.set_input_files('.og-bk input[type=file]',fp2);pg.wait_for_timeout(350)
    got2=json.loads(ev("JSON.stringify(OGRT.W.d)"))
    ok('JSON yedek alma/geri yükleme çalışıyor; V34.9 yedeği de yüklenebiliyor',got['weeks']==good['weeks'] and got['auto']==good['auto'] and got2['weeks']==H['weeks'])
    src=open('/home/claude/work/v350/ogrt_w.js',encoding='utf-8').read()
    ok('Müfredat verisi değişmedi; öğretmen kodu müfredata/yönetime yazmıyor; öğrenci konu ekranı açılıyor; V34.9 hesaplama kodu kaldırıldı',ev("[Store.all('units').length,Store.all('outcomes').length,Store.all('topics').length]")==[60,238,246] and not any(x in src for x in ['Store.patch','Store.put','Store.set(','Store.del','KMAP.save','KMAP.ov','autoMap']) and (ev("go('topic',{t:'TPC18-4-1-01',tab:'anlat'})") or True) and ev("view")=='topic')
    ok('Konsol/sayfa hatası yok',not errs,errs[:3])
    resm=[]
    for w,hh in [(360,740),(390,844),(768,1024),(1024,768),(1440,900)]:
        for th in ['light','dark']:
            cx=b.new_context(viewport={'width':w,'height':hh},has_touch=w<800);m=cx.new_page();E2=[];m.on('pageerror',lambda e:E2.append(str(e)))
            m.goto(URL);m.wait_for_timeout(700);m.evaluate("a=>localStorage.setItem('dk-ogretmen-v1',a)",json.dumps({**A,'classes':[{"g":5,"py":"2026"},{"g":12,"py":"2018"}],'active':'5|2026'}));m.reload();m.wait_for_timeout(1000)
            m.evaluate(f"document.documentElement.dataset.theme='{th}'");(m.tap if w<800 else m.click)('#app .og-home');m.wait_for_timeout(200)
            bad=[]
            for n in [1,19,37]:
                m.evaluate(f"OGRT.W.go({n});document.querySelectorAll('.ogw-c,.ogw-more,.ogw-x').forEach(d=>d.open=true)");m.wait_for_timeout(100)
                r=m.evaluate("""(()=>{const vw=document.documentElement.clientWidth;return[document.documentElement.scrollWidth-vw,[...document.querySelectorAll('.og button,.og select,.og summary')].filter(e=>e.offsetParent&&!e.closest('details:not([open])>:not(summary)')).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.height<43.5||r.width<43.5)}).map(e=>e.textContent.slice(0,20)),[...document.querySelectorAll('.ogw-c,.ogw-all,.ogw-notes,.ogw-wk,.ogw-ozel')].filter(e=>e.scrollWidth>e.clientWidth+1).length]})()""")
                if r[0]>0 or r[1] or r[2]:bad.append((n,r))
            if w==390:m.evaluate("OGRT.W.go(1)");m.screenshot(path=f'/home/claude/work/v360/t/m_{th}.png',full_page=True)
            resm.append((w,th,not bad and not E2,bad[:2]));cx.close()
    ok('Mobil/tablet/masaüstü (360/390/768/1024/1440 × açık/koyu), TYMM uzun açıklamalı haftalar dahil: taşma yok, dokunma hedefleri ≥44px',all(x[2] for x in resm),[x for x in resm if not x[2]][:3])
    b.close()
print(json.dumps({'pass':sum(R.values()),'total':len(R)}))
