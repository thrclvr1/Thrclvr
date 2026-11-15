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
# V34.7 arayüzünün ürettiği biçimde eski kayıtlar
A={"v":1,"app":"dkab-ogretmen","classes":[{"g":4,"py":"2018"},{"g":8,"py":"2018"}],"active":"4|2018","status":{"DKAB18-4-U01-O01":"isl","DKAB18-8-U01-O02":"tek"},
 "plans":[{"id":"Pa","created":"2026-11-09T08:00:00.000Z","g":4,"py":"2018","unitId":"DKAB18-4-U01","oid":"DKAB18-4-U01-O01","date":"2026-11-11","time":"09:40","dur":40,"goal":"Hedef","method":"","notes":"","sy":"2026-2027","wk":9,"updated":"2026-11-09T08:00:00.000Z"}],"updatedAt":"2026-11-09T08:00:00.000Z"}
H={"v":1,"app":"dkab-ogretmen-hafta","cal":{"2027-2028":{"start":"2027-09-13","end":"2028-06-23"}},"tatil":{"2026-2027":{"12":True}},
 "weeks":{"4|2018":{"2026-2027":{"9":["DKAB18-4-U01-O01","DKAB18-4-U01-O02"],"11":["DKAB18-4-U02-O01"]}},"8|2018":{"2026-2027":{"9":["DKAB18-8-U01-O01"]}}},
 "notes":{"4|2018|2026-2027|9":[{"id":"N1","text":"Eski not","created":"2026-11-09T08:00:00.000Z","updated":"2026-11-09T08:00:00.000Z"}]},"migrated":True,"migratedPlans":0,"updatedAt":"2026-11-09T08:00:00.000Z"}
SA,SH=json.dumps(A),json.dumps(H)
with sync_playwright() as p:
    b=_sess36(p.chromium.launch())
    c=b.new_context(viewport={'width':1366,'height':900},accept_downloads=True);pg=c.new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'ERR_' not in m.text and 'file:' not in m.text and errs.append(m.text))
    pg.goto(URL);pg.wait_for_timeout(800);pg.evaluate("([a,h])=>{localStorage.setItem('dk-ogretmen-v1',a);localStorage.setItem('dk-ogretmen-hafta-v1',h)}",[SA,SH])
    pg.reload();pg.wait_for_timeout(1300);ev=pg.evaluate
    pg.click('#app .og-home');pg.wait_for_timeout(300)
    # gezinme
    main=ev("[...document.querySelectorAll('.og-main button')].map(b=>b.textContent)")
    pg.click('.og-main button[data-t="diger"]');pg.wait_for_timeout(200)
    sub=ev("[...document.querySelectorAll('.og-sub button')].map(b=>b.textContent)")
    seen={}
    for k,sel in [('plan','.og-t tbody tr'),('ilerleme','.og-ip'),('takvim','.og-days .og-day'),('yedek','.og-bk input[type=file]')]:
        pg.click(f'.og-sub button[data-t="{k}"]');pg.wait_for_timeout(150);seen[k]=[ev(f"document.querySelectorAll('{sel}').length"),ev("document.querySelector('.og-main button.on').dataset.t"),ev(f"document.querySelector('.og-sub button.on').dataset.t")]
    ycal=ev("(document.querySelector('.og-ycal')||{}).innerText||''") if False else None
    pg.click('.og-sub button[data-t="takvim"]');ycal=ev("document.querySelector('.og-ycal').innerText")
    pg.click('.og-main button[data-t="sinif"]');pg.wait_for_timeout(150);bk_in_sinif=ev("!!document.querySelector('.og-bk')")
    pg.click('.og-main button[data-t="diger"]');pg.wait_for_timeout(150);back=ev("OGRT.S().tab")
    ok('Sekmeler: ana gezinmede yalnız Haftalık · Sınıflarım · Diğer; Diğer altında 4 sayfa, her biri içeriğini gösteriyor; son açılan alt sayfa hatırlanıyor',main==['Haftalık','Sınıflarım','Diğer'] and sub==['Ders Planlarım','İlerlemem','Ders Takvimim','Yedekleme'] and seen['plan'][0]==1 and seen['ilerleme'][0]==2 and seen['takvim'][0]==7 and seen['yedek'][0]==1 and all(v[1]=='diger' and v[2]==k for k,v in seen.items()) and '41 hafta' in ycal and not bk_in_sinif and back=='takvim',(main,sub,seen,ycal,back))
    # 6 eski kayıtlar
    same=ev("localStorage.getItem('dk-ogretmen-v1')")==SA and ev("localStorage.getItem('dk-ogretmen-hafta-v1')")==SH
    pg.click('.og-main button[data-t="hafta"]');pg.wait_for_timeout(200)
    shown=ev("[document.querySelector('.ogw-wk.on').dataset.wk,[...document.querySelectorAll('.ogw-k')].map(e=>e.dataset.oid),document.querySelector('.ogw-n p').textContent,document.querySelector('.ogw-k .ogw-st').value,document.querySelector('.ogw-wk[data-wk=\"12\"]').classList.contains('hol'),(document.querySelector('.ogw-k .ogw-pl')||{}).innerText||'']")
    ok('Eski V34.7 kayıtları korunuyor: iki anahtar açılış ve gezinme sonrası bayt bayt aynı; durum, atama, not, tatil ve plan görünüyor',same and shown[:5]==['9',['DKAB18-4-U01-O01','DKAB18-4-U01-O02'],'Eski not','isl',True] and 'Hedef' in shown[5],shown)
    # sınıf seçimi
    chips=ev("[...document.querySelectorAll('.ogw .og-cls button')].map(b=>[b.textContent,b.getAttribute('aria-selected')])")
    pg.click('.ogw .og-cls button:nth-child(2)');pg.wait_for_timeout(200)
    s8=ev("[OGRT.d.active,[...document.querySelectorAll('.ogw-k')].map(e=>e.dataset.oid),document.querySelector('.ogw .og-cls button.on').textContent]")
    pg.click('.og-main button[data-t="diger"]');pg.click('.og-sub button[data-t="ilerleme"]');pg.wait_for_timeout(100);nochoose=ev("!document.querySelector('#og-body .og-cls')")
    pg.click('.og-main button[data-t="hafta"]');pg.wait_for_timeout(150);keep=ev("OGRT.cls().g")
    ok('Sınıf seçimi: haftalık ekranda sınıf çipleri, tek dokunuşla geçiş, aktif sınıf belirgin; diğer sayfalarda tekrar sınıf sorulmuyor; seçim korunuyor; sınıflar bağımsız',chips==[['4. sınıf 2018','true'],['8. sınıf 2018','false']] and s8==['8|2018',['DKAB18-8-U01-O01'],'8. sınıf 2018'] and nochoose and keep==8,(chips,s8))
    pg.click('.ogw .og-cls button:nth-child(1)');pg.wait_for_timeout(150)
    # kazanım sıralaması (tüm sınıf/program)
    combos=ev("[4,5,6,7,8,9,10,11,12].flatMap(g=>['2018','2026'].filter(py=>OGRT.units(g,py).length).map(py=>[g,py]))")
    bad=[]
    for g,py in combos:
        exp=ev(f"""Store.all('units').filter(u=>u.grade==={g}&&u.programYear==='{py}').sort((a,b)=>a.order-b.order).map(u=>[u.order+'. '+u.title,Store.all('outcomes').filter(o=>o.unitId===u.id).sort((a,b)=>a.order-b.order).map(o=>[o.id,o.code+' '+o.title])])""")
        ev(f"OGRT.d.classes.some(c=>c.g==={g}&&c.py==='{py}')||OGRT.d.classes.push({{g:{g},py:'{py}'}});OGRT.d.active='{g}|{py}';Object.assign(OGRT.W.S(),{{lf:'tum',lo:true}});OGRT.S().tab='hafta';OGRT.render()")
        got=ev("[...document.querySelectorAll('.ogw-ag')].map(d=>[d.querySelector('h4').textContent,[...d.querySelectorAll('.ogw-ar')].map(l=>[l.dataset.lo,l.querySelector('.ogw-at p').textContent])])")
        if got!=exp:bad.append((g,py))
    ok(f'Kazanım sıralaması: {len(combos)} sınıf/programın tamamında ünite ve kazanımlar order alanına göre, kod ve tam metinle listeleniyor',len(combos)==12 and not bad,bad)
    ev("OGRT.d=JSON.parse(localStorage.getItem('dk-ogretmen-v1'));OGRT.S().tab='hafta';OGRT.render()")
    # atanmamış liste ve haftalık gösterim
    ev("Object.assign(OGRT.W.S(),{lf:'bos',lo:true});OGRT.W.go(9)");pg.wait_for_timeout(150)
    free=ev("[...document.querySelectorAll('.ogw-ar')].map(l=>l.dataset.lo)")
    allo=ev("OGRT.allOuts(4,'2018').map(o=>o.id)")
    used={'DKAB18-4-U01-O01','DKAB18-4-U01-O02','DKAB18-4-U02-O01'}
    f1=free==[x for x in allo if x not in used]
    tgt=free[2];pg.click(f'.ogw-ar[data-lo="{tgt}"] .ogw-b');pg.wait_for_timeout(200)
    free2=ev("[...document.querySelectorAll('.ogw-ar')].map(l=>l.dataset.lo)");wk9=ev("[...document.querySelectorAll('.ogw-k')].map(e=>e.dataset.oid)")
    pg.click('.ogw-all .og-seg2 button:nth-child(2)');pg.wait_for_timeout(150)
    allrows=ev("[...document.querySelectorAll('.ogw-ar')].map(l=>l.dataset.lo)");lab=ev(f"document.querySelector('.ogw-ar[data-lo=\"{tgt}\"]').innerText")
    ok('Atanmamış kazanımlar ayrı ve sıralı listede; listeden ekleyince haftaya geliyor, atanmamıştan çıkıyor; sıra değişmiyor',f1 and free2==[x for x in free if x!=tgt] and wk9==[x for x in allo if x in used|{tgt} and x!='DKAB18-4-U02-O01'] and allrows==allo and 'Bu haftada' in lab,(len(free),len(free2),wk9))
    ev("OGRT.W.go(10)");pg.wait_for_timeout(100);w10=ev("document.querySelectorAll('.ogw-k').length");ev("OGRT.W.go(11)");pg.wait_for_timeout(100);w11=ev("[...document.querySelectorAll('.ogw-k')].map(e=>e.dataset.oid)")
    ok('Haftalık ekrana yalnızca o haftaya atanmış kazanımlar geliyor',w10==0 and w11==['DKAB18-4-U02-O01'],(w10,w11))
    # sıradaki + sıra
    ev("OGRT.W.go(13)");pg.click('.ogw-acts .ogw-b.p');pg.wait_for_timeout(150)
    nx=ev("OGRT.W.list(4,'2018','2026-2027',13)")
    ok('“Sıradaki kazanım” MEB sırasında ilk atanmamış kazanımı ekliyor',nx==[[x for x in allo if x not in used|{tgt}][0]],nx)
    # durum/notlar/taşı (ana işlevler)
    ev("OGRT.W.go(9)");pg.wait_for_timeout(100)
    pg.select_option('.ogw-k:nth-child(2) .ogw-st','tek');pg.click('.ogw-k:nth-child(2) .ogw-more summary');pg.click('.ogw-k:nth-child(2) .ogw-b:has-text("Taşı / kopyala")');pg.wait_for_timeout(200)
    pg.select_option('#ogw-to','14');pg.click('button:text-is("Taşı")');pg.wait_for_timeout(200)
    mv=(ev("OGRT.W.list(4,'2018','2026-2027',9)"),ev("OGRT.W.list(4,'2018','2026-2027',14)"),ev("OGRT.st('DKAB18-4-U01-O02')"))
    ok('Durum ve taşıma çalışmaya devam ediyor (taşıma “Taşı, kopyala veya çıkar” açılır bölümünde)',mv==(['DKAB18-4-U01-O01',tgt],['DKAB18-4-U01-O02'],'tek'),mv)
    # yenile
    a2=ev("localStorage.getItem('dk-ogretmen-v1')");h2=ev("localStorage.getItem('dk-ogretmen-hafta-v1')")
    pg.reload();pg.wait_for_timeout(1300);ev("go('ogretmen')");pg.wait_for_timeout(200)
    ok('Sayfa yenilenince kayıtlar korunuyor',json.loads(ev("JSON.stringify(OGRT.d)"))==json.loads(a2) and json.loads(ev("JSON.stringify(OGRT.W.d)"))==json.loads(h2))
    # yedek
    pg.click('.og-main button[data-t="diger"]');pg.click('.og-sub button[data-t="yedek"]');pg.wait_for_timeout(150)
    with pg.expect_download() as dl:pg.click('.og-bk button:has-text("JSON olarak yedekle")')
    bk=json.load(open(dl.value.path(),encoding='utf-8'));good=(json.loads(a2),json.loads(h2))
    td=tempfile.mkdtemp()
    def up(n,o):
        fp=os.path.join(td,n);open(fp,'w',encoding='utf-8').write(o if isinstance(o,str) else json.dumps(o));pg.set_input_files('.og-bk input[type=file]',fp);pg.wait_for_timeout(350)
    cur=lambda:(json.loads(ev("JSON.stringify(OGRT.d)")),json.loads(ev("JSON.stringify(OGRT.W.d)")))
    badb=json.loads(json.dumps(bk));badb['hafta']['notes']={'x':1};up('bad.json',badb);r1=cur()==good and 'Geri yükleme yapılmadı' in ev("document.getElementById('og-rerr').textContent")
    ev("OGRT.d=OGRT.def();OGRT.save();OGRT.W.d=OGRT.W.def();OGRT.W.d.migrated=true;OGRT.W.save();OGRT.render()")
    up('good.json',bk);c2=cur();r2=c2[0]['plans']==good[0]['plans'] and c2[0]['status']==good[0]['status'] and c2[1]['weeks']==good[1]['weeks'] and c2[1]['notes']==good[1]['notes'] and c2[1]['tatil']==good[1]['tatil']
    ok('JSON yedekleme (Diğer › Yedekleme) ve geri yükleme; hatalı yedek mevcut veriyi bozmuyor',bk['hafta']['weeks']==good[1]['weeks'] and r1 and r2,(r1,r2))
    # dokunuş sayısı
    t=b.new_context(viewport={'width':390,'height':844},has_touch=True).new_page();t.add_init_script("localStorage.setItem('dk-ogretmen-v1',%s);localStorage.setItem('dk-ogretmen-hafta-v1',%s)"%(json.dumps(SA),json.dumps(SH)));t.goto(URL);t.wait_for_timeout(1100)
    t.tap('#app .og-home');t.wait_for_timeout(250);one=t.evaluate("document.querySelectorAll('.ogw-k').length")
    t.tap('.ogw .og-cls button:nth-child(2)');t.wait_for_timeout(200);two=t.evaluate("document.querySelectorAll('.ogw-k').length")
    ok('Ana sayfadan 1 dokunuşla bu haftanın kazanımları; 1 dokunuşla diğer sınıf',one==2 and two==1,(one,two))
    src=open('/home/claude/work/v350/ogrt_w.js',encoding='utf-8').read()+open('/home/claude/work/v350/ogrt.js',encoding='utf-8').read()
    ok('Müfredat verisi değişmedi; öğretmen kodu müfredata/yönetime yazmıyor',ev("[Store.all('units').length,Store.all('outcomes').length,Store.all('topics').length]")==[60,238,246] and not any(x in src for x in ['Store.patch','Store.put','Store.set(','Store.del','KMAP.save','KMAP.ov','V34.ov']))
    ev("go('topic',{t:'TPC18-4-1-01',tab:'anlat'})");pg.wait_for_timeout(400);ok('Öğrenci konu ekranı açılıyor',ev("view")=='topic' and len(ev("document.getElementById('app').innerText"))>500)
    ok('Konsol/sayfa hatası yok',not errs,errs[:3])
    # mobil
    res=[]
    for w,hh in [(360,740),(390,844),(768,1024),(1024,768),(1440,900)]:
        for th in ['light','dark']:
            cx=b.new_context(viewport={'width':w,'height':hh},has_touch=w<800);q=cx.new_page();E2=[];q.on('pageerror',lambda e:E2.append(str(e)))
            q.add_init_script("localStorage.setItem('dk-ogretmen-v1',%s);localStorage.setItem('dk-ogretmen-hafta-v1',%s)"%(json.dumps(SA),json.dumps(SH)));q.goto(URL);q.wait_for_timeout(1000)
            q.evaluate(f"document.documentElement.dataset.theme='{th}'");(q.tap if w<800 else q.click)('#app .og-home');q.wait_for_timeout(200)
            bad=[]
            for st in ["OGRT.S().tab='hafta';Object.assign(OGRT.W.S(),{lo:true,lf:'tum'});OGRT.render();document.querySelectorAll('.ogw-c,.ogw-more').forEach(d=>d.open=true)","OGRT.S().tab='sinif';OGRT.render()","OGRT.S().tab='plan';OGRT.render()","OGRT.S().tab='ilerleme';OGRT.render()","OGRT.S().tab='takvim';OGRT.render()","OGRT.S().tab='yedek';OGRT.render()"]:
                q.evaluate(st);q.wait_for_timeout(120)
                r=q.evaluate("""(()=>{const vw=document.documentElement.clientWidth,ov=document.documentElement.scrollWidth-vw;
                 const sm=[...document.querySelectorAll('.og button,.og select,.og summary,.og-file')].filter(e=>e.offsetParent&&!e.closest('details:not([open])>:not(summary)')).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.height<43.5||r.width<43.5)}).map(e=>e.className+':'+e.textContent.slice(0,20));
                 const nav=[...document.querySelectorAll('.og-main button,.og-sub button')].filter(e=>{const r=e.getBoundingClientRect();return r.left<0||r.right>vw}).length;
                 const of=[...document.querySelectorAll('.ogw-c,.ogw-all,.ogw-notes,.og-sec')].filter(e=>e.scrollWidth>e.clientWidth+1&&!e.querySelector('.og-tw')).length;return[ov,sm,nav,of]})()""")
                if r[0]>0 or r[1] or r[2] or r[3]:bad.append((st[:28],r))
            if w==390:q.evaluate("OGRT.S().tab='hafta';OGRT.render()");q.screenshot(path=f'/home/claude/work/v360/t/m_{th}.png',full_page=True)
            res.append((w,th,not bad and not E2 and q.evaluate('document.documentElement.dataset.theme')==th,bad[:2],E2[:1]));cx.close()
    ok('Mobil/tablet/masaüstü (360/390/768/1024/1440 × açık/koyu), 6 ekran: yatay taşma yok, gezinme düğmeleri ekranda, dokunma hedefleri ≥44px, kart taşması yok',all(x[2] for x in res),[x for x in res if not x[2]][:3])
    b.close()
print(json.dumps({'pass':sum(R.values()),'total':len(R)}))
