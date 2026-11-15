# V35.0 uyarlaması: 4 beklenti yeni hafta numarası/tarih/metin biçimine göre güncellendi (bkz. V35.0 raporu)
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
def ok(k,v,info=''):R[k]=bool(v);print(('OK  ' if v else 'FAIL'),k,str(info)[:300])
# V34.6 biçiminde gerçek eski kayıt (V34.6 arayüzünün ürettiği şekil)
OLD={"v":1,"app":"dkab-ogretmen","classes":[{"g":8,"py":"2018"}],"active":"8|2018","status":{"DKAB18-8-U01-O01":"isl","DKAB18-8-U01-O02":"tek"},
 "plans":[{"id":"Pold1","created":"2026-11-01T10:00:00.000Z","g":8,"py":"2018","unitId":"DKAB18-8-U01","oid":"DKAB18-8-U01-O03","date":"2026-11-04","time":"10:30","dur":40,"goal":"Eski hedef","method":"","notes":"","updated":"2026-11-01T10:00:00.000Z"}],"updatedAt":"2026-11-01T10:00:00.000Z"}
with sync_playwright() as p:
    b=_sess36(_noauto(p.chromium.launch()))
    c=b.new_context(viewport={'width':1366,'height':900},accept_downloads=True);pg=c.new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'ERR_' not in m.text and 'file:' not in m.text and errs.append(m.text))
    pg.goto(URL);pg.wait_for_timeout(800);pg.evaluate("a=>localStorage.setItem('dk-ogretmen-v1',a)",json.dumps(OLD))
    pg.reload();pg.wait_for_timeout(1300);ev=pg.evaluate
    # 13 eski kayıtlar
    raw=json.loads(ev("localStorage.getItem('dk-ogretmen-v1')"))
    hw=json.loads(ev("localStorage.getItem('dk-ogretmen-hafta-v1')"))
    ok('13 V34.6 kayıtları korunuyor (anahtar aynen) ve eski plan kendi haftasına uyarlandı',raw==OLD and ev("OGRT.d.classes")==OLD['classes'] and ev("OGRT.st('DKAB18-8-U01-O02')")=='tek' and hw['weeks']=={'8|2018':{'2026-2027':{'8':['DKAB18-8-U01-O03']}}} and hw['migrated'] and ev("OGRT.W.weekOf('2026-11-04').n")==8,hw.get('weeks'))
    # 1
    pg.click('nav.bnav [data-k="ogretmen"]');pg.wait_for_timeout(400)
    tabs=ev("[...document.querySelectorAll('.og-tabs button')].map(b=>b.textContent)")
    ok('1 Öğretmen paneli açılıyor; ana ekran haftalık görünüm',ev("view")=='ogretmen' and ev("OGRT.S().tab")=='hafta' and ev("!!document.querySelector('.ogw .ogw-strip')") and tabs==['Haftalık','Sınıflarım','Diğer'] and not errs,(tabs,errs[:2]))
    # 4 tarihler (bugün = 11 Kasım 2026 → 9. hafta)
    today=ev("OGRT.today()")
    L=ev("OGRT.W.weeks('2026-2027')")
    hol=[w['n'] for w in L if w['hol']]
    sel=ev("[document.querySelector('.ogw-wk.on').dataset.wk,document.querySelector('.ogw-dt').innerText]")
    exp9= today>='2026-11-09' and today<='2026-11-15'
    ok('4 Tarihler resmî takvimle doğru: 41 hafta, 1. hafta 14–20 Eylül, 9. hafta 9–15 Kasım, tatiller 10/20/21/26, 37 ders haftası',len(L)==41 and L[0]['mon']=='2026-09-14' and L[0]['sun']=='2026-09-20' and L[8]['mon']=='2026-11-09' and L[8]['sun']=='2026-11-15' and L[-1]['mon']=='2027-06-21' and hol==[10,20,21,26] and (not exp9 or (sel[0]=='9' and '9 Kasım 2026 Pazartesi' in sel[1] and '13 Kasım 2026 Cuma' in sel[1])) and 'ders haftası / 37' in ev("document.querySelector('.ogw-pt').textContent"),(len(L),hol,sel,today))
    # 3 gezinme
    pg.click('.ogw-arr[aria-label="Sonraki hafta"]');pg.wait_for_timeout(150);a=ev("+document.querySelector('.ogw-wk.on').dataset.wk")
    pg.click('.ogw-arr[aria-label="Önceki hafta"]');pg.click('.ogw-arr[aria-label="Önceki hafta"]');pg.wait_for_timeout(150);bb=ev("+document.querySelector('.ogw-wk.on').dataset.wk")
    pg.click('.ogw-wk[data-wk="12"]');pg.wait_for_timeout(150);cc=ev("+document.querySelector('.ogw-wk.on').dataset.wk")
    pg.focus('.ogw-strip');pg.keyboard.press('ArrowRight');pg.wait_for_timeout(150);dd=ev("+document.querySelector('.ogw-wk.on').dataset.wk")
    vis=ev("(()=>{const s=document.querySelector('.ogw-strip').getBoundingClientRect(),o=document.querySelector('.ogw-wk.on').getBoundingClientRect();return o.left>=s.left-1&&o.right<=s.right+1})()")
    pg.click('.ogw-wk[data-wk="1"]');pg.wait_for_timeout(100);dis=ev("document.querySelector('.ogw-arr[aria-label=\"Önceki hafta\"]').disabled")
    ok('3 İleri/geri oklar, karta dokunma, klavye; seçili hafta görünür alanda ortalanıyor; 1. haftada geri oku pasif',(a,bb,cc,dd)==(10,8,12,13) and vis and dis,(a,bb,cc,dd,vis,dis))
    # 2 çoklu sınıf
    ev("OGRT.S().tab='sinif';OGRT.render()");pg.select_option('#og-g','4');pg.select_option('#og-py','2018');pg.click('.og-add button[type=submit]');pg.wait_for_timeout(250)
    t4=ev("[OGRT.S().tab,document.querySelector('.ogw .og-cls button.on').textContent]")
    ev("OGRT.S().tab='sinif';OGRT.render()");pg.select_option('#og-g','5');pg.click('.og-add button[type=submit]');pg.wait_for_timeout(250)
    chips=ev("[...document.querySelectorAll('.og-cls button')].map(b=>b.textContent)")
    ok('2 Birden fazla sınıf; sınıf eklenince haftalık ekran açılıyor; sınıf çipleriyle geçiş',t4==['hafta','4. sınıf 2018'] and len(chips)==3 and ev("document.querySelector('.ogw .og-cls button.on').textContent")=='5. sınıf 2026',(t4,chips))
    # 5-6 içerik ve birden fazla kazanım
    ev("OGRT.pick('4|2018','hafta')");pg.click('.ogw-wk[data-wk="9"]');pg.wait_for_timeout(150)
    nx=ev("OGRT.W.next(4,'2018','2026-2027').id")
    pg.click('.ogw-acts .ogw-b.p');pg.wait_for_timeout(200)
    pg.click('.ogw-x summary');pg.click('.ogw-acts .ogw-b:has-text("Listeden ekle")');pg.wait_for_timeout(250)
    O4=ev("OGRT.allOuts(4,'2018').map(o=>o.id)")
    pg.click('.ogw-all .og-seg2 button:nth-child(2)');pg.wait_for_timeout(150)
    pk=ev("[...document.querySelectorAll('.ogw-ar')].map(i=>i.dataset.lo)")
    pg.click(f'.ogw-ar[data-lo="{O4[5]}"] .ogw-b');pg.wait_for_timeout(200);pg.click(f'.ogw-ar[data-lo="{O4[2]}"] .ogw-b');pg.wait_for_timeout(250)
    ids=ev("OGRT.W.list(4,'2018','2026-2027',9)")
    ok('6 Bir haftaya birden fazla kazanım eklenebiliyor (sıradaki + seçim); hafta içi sıra MEB sırası; seçim ekranı MEB sırasında',nx==O4[0] and ids==[O4[0],O4[2],O4[5]] and pk==O4,ids)
    shown=ev("""(()=>{const g=s=>[...document.querySelectorAll('.ogw-c.c-'+s+' .ogw-cv .ogw-l')].map(e=>e.textContent.trim());return{u:g('unite'),k:g('konu'),z:[...document.querySelectorAll('.ogw-k')].map(e=>[e.dataset.oid,e.querySelector('.ogw-kt').textContent.trim()]),a:[...document.querySelectorAll('.ogw-c.c-acik .ogw-cb .ogw-sp')].map(u=>u.textContent)}})()""")
    want=ev("""(()=>{const ids=OGRT.W.list(4,'2018','2026-2027',9),O=ids.map(i=>Store.get('outcomes',i)),U=[...new Set(O.map(o=>o.unitId))].map(u=>Store.get('units',u)).sort((a,b)=>a.order-b.order);
      const T=[];O.forEach(o=>Store.all('topics').filter(t=>t.outcomeIds.includes(o.id)).sort((a,b)=>a.order-b.order).forEach(t=>{if(!T.includes(t.title))T.push(t.title)}));
      return{u:U.map(u=>u.order+'. '+u.title),T,z:O.map(o=>[o.id,o.code.replace(/\s*\(.*\)\s*$/,'')+'. '+o.title]),sp:O.filter(o=>o.subProcesses&&o.subProcesses.length).map(o=>o.subProcesses.map(x=>x.text))}})()""")
    k_ok=len(shown['k'])==len(want['T']) and all(any(t in s for s in shown['k']) for t in want['T'])
    a_ok=all(all(t in shown['a'][i] for t in sp) for i,sp in enumerate(want['sp'])) and len(shown['a'])==len(want['sp'])
    ok('5 Ünite, konu, kazanım ve açıklama program verisiyle birebir (4 ayrı açılır kart)',shown['u']==want['u'] and k_ok and shown['z']==want['z'] and a_ok and ev("[...document.querySelectorAll('.ogw-c')].map(d=>d.dataset.c)")==['unite','konu','kaz','acik'],(shown['u'],want['u'],shown['k'],want['T']))
    pg.click('.ogw-c.c-unite summary');pg.click('.ogw-c.c-kaz summary');pg.wait_for_timeout(150)
    tg=ev("[document.querySelector('.ogw-c.c-unite').open,document.querySelector('.ogw-c.c-kaz').open]")
    pg.click('.ogw-c.c-kaz summary');pg.wait_for_timeout(100)
    ok('5b Kartlar açılıp kapanıyor (başlangıçta yalnız Kazanım açık)',tg==[True,False] and ev("document.querySelector('.ogw-c.c-kaz').open"))
    # 7 İçeriği aç
    pg.click(f'.ogw-k[data-oid="{O4[0]}"] .ogw-b:has-text("İçeriği aç")');pg.wait_for_timeout(500)
    t0=ev(f"OGRT.topicsOf('{O4[0]}').map(t=>t.id)")
    okc=ev("view")=='topic' and (ev("G.t") in t0 or ev("!!document.querySelector('.sheet, .ui-sheet')"))
    ev("go('ogretmen')");pg.wait_for_timeout(300)
    ok('İçeriği aç: mevcut öğrenci konu ekranını açıyor',okc,(ev("G.t"),t0))
    # 7 taşı / kopyala
    pg.click(f'.ogw-k[data-oid="{O4[5]}"] .ogw-more summary');pg.click(f'.ogw-k[data-oid="{O4[5]}"] .ogw-b:has-text("Taşı")');pg.wait_for_timeout(200);pg.select_option('#ogw-to','11');pg.click('button:text-is("Taşı")');pg.wait_for_timeout(250)
    m1=(ev("OGRT.W.list(4,'2018','2026-2027',9)"),ev("OGRT.W.list(4,'2018','2026-2027',11)"))
    pg.click(f'.ogw-k[data-oid="{O4[2]}"] .ogw-more summary');pg.click(f'.ogw-k[data-oid="{O4[2]}"] .ogw-b:has-text("Taşı")');pg.wait_for_timeout(200);pg.select_option('#ogw-to','12');pg.click('button:text-is("Kopyala")');pg.wait_for_timeout(250)
    m2=(ev("OGRT.W.list(4,'2018','2026-2027',9)"),ev("OGRT.W.list(4,'2018','2026-2027',12)"),ev(f"OGRT.W.weeksOfOut(4,'2018','2026-2027','{O4[2]}')"))
    note=ev(f"document.querySelector('.ogw-k[data-oid=\"{O4[2]}\"]').innerText")
    ok('7 Kazanım başka haftaya taşınıyor; kopyalanınca birden fazla haftada yer alıyor',m1==([O4[0],O4[2]],[O4[5]]) and m2==([O4[0],O4[2]],[O4[2]],[9,12]) and 'Bu kazanımın haftaları: 9., 11.' in note,(m1,m2))
    # 8 durum
    pg.select_option(f'.ogw-k[data-oid="{O4[0]}"] .ogw-st','isl');pg.select_option(f'.ogw-k[data-oid="{O4[2]}"] .ogw-st','tek');pg.wait_for_timeout(150)
    s1=json.loads(ev("localStorage.getItem('dk-ogretmen-v1')"))['status']
    chip=ev(f"[...document.querySelectorAll('.ogw-c.c-kaz .ogw-cv .ogw-chip')].map(e=>e.textContent)")
    ok('8 Kazanım durumu anında kaydediliyor; her kazanım ayrı; eski 8. sınıf durumları etkilenmedi',s1.get(O4[0])=='isl' and s1.get(O4[2])=='tek' and s1.get('DKAB18-8-U01-O02')=='tek' and chip==['İşlendi','Tekrar edilmeli'] and ev(f"OGRT.prog(4,'2018').c.isl")==1,(s1,chip))
    # 9 notlar
    pg.click('.ogw-nadd');pg.fill('.ogw-nfm textarea','Hafta 9 notu\nikinci satır');pg.click('.ogw-nfm button[type=submit]');pg.wait_for_timeout(200)
    pg.click('.ogw-nadd');pg.fill('.ogw-nfm textarea','İkinci not');pg.click('.ogw-nfm button[type=submit]');pg.wait_for_timeout(200)
    pg.click('.ogw-n:nth-of-type(1) .ogw-b:has-text("Düzenle")');pg.fill('.ogw-nfm textarea','Hafta 9 notu (düzenlendi)');pg.click('.ogw-nfm button[type=submit]');pg.wait_for_timeout(200)
    pg.click('.ogw-n:has-text("İkinci not") .ogw-b:has-text("Sil")');pg.wait_for_timeout(200)
    N=json.loads(ev("localStorage.getItem('dk-ogretmen-hafta-v1')"))['notes']
    hdr=ev("document.querySelector('.ogw-notes h3').textContent.trim()")
    pg.click('.ogw-wk[data-wk="8"]');pg.wait_for_timeout(100);n8=ev("document.querySelectorAll('.ogw-n').length")
    ev("OGRT.pick('5|2026','hafta')");ev("OGRT.W.go(9)");pg.wait_for_timeout(100);n5=ev("document.querySelectorAll('.ogw-n').length")
    ok('9 Haftalık not ekleme/düzenleme/silme; sınıf+program+yıl+haftaya göre ayrı; başlık metni doğru',list(N.keys())==['4|2018|2026-2027|9'] and [x['text'] for x in N['4|2018|2026-2027|9']]==['Hafta 9 notu (düzenlendi)'] and n8==0 and n5==0 and hdr=='Bu hafta ile ilgili kişisel notlarını ekleyebilirsin.',(N,hdr))
    # 10 ders planı
    ev("OGRT.pick('4|2018','hafta')");ev("OGRT.W.go(9)");pg.wait_for_timeout(150)
    pg.click(f'.ogw-k[data-oid="{O4[0]}"] .ogw-b:has-text("Ders hazırla")');pg.wait_for_timeout(250)
    d0=pg.locator('.og-form input[name=date]').last.input_value()
    pg.locator('.og-form input[name=time]').last.fill('09:40');pg.locator('.og-form textarea[name=goal]').last.fill('Haftalık hedef');pg.locator('.og-form button[type=submit]').last.click();pg.wait_for_timeout(300)
    P=[x for x in ev("OGRT.d.plans") if x['oid']==O4[0]]
    inrow=ev(f"document.querySelector('.ogw-k[data-oid=\"{O4[0]}\"] .ogw-pl')?.innerText||''")
    pid=P[0]['id'];ev(f"OGRT.editPlan('{pid}')");pg.wait_for_timeout(250);pg.locator('.og-form input[name=date]').last.fill('2026-11-25');pg.locator('.og-form button[type=submit]').last.click();pg.wait_for_timeout(300)
    P2=[x for x in ev("OGRT.d.plans") if x['id']==pid][0]
    ok('10 Ders planı sınıf, hafta ve kazanımla ilişkili (formdaki tarih haftanın içinde; tarih değişince yeni haftaya da yerleşiyor)','2026-11-09'<=d0<='2026-11-13' and len(P)==1 and P[0]['wk']==9 and P[0]['sy']=='2026-2027' and P[0]['g']==4 and 'Haftalık hedef' in inrow and P2['wk']==11 and O4[0] in ev("OGRT.W.list(4,'2018','2026-2027',11)") and O4[0] in ev("OGRT.W.list(4,'2018','2026-2027',9)"),(d0,P,P2.get('wk')))
    ev("OGRT.S().tab='plan';OGRT.render()");rows=ev("document.querySelectorAll('.og-t tbody tr').length")
    ok('10b Ders Planım listesi ve eski plan birlikte duruyor; düzenle/sil çalışıyor',rows==2)
    # tatil
    ev("OGRT.S().tab='hafta';OGRT.render()");ev("OGRT.W.go(9)");pg.wait_for_timeout(100)
    pg.click('.ogw-foot .ogw-lnk:has-text("tatil olarak işaretle")');pg.wait_for_timeout(150)
    h9=ev("[!!document.querySelector('.ogw-hol'),document.querySelector('.ogw-wk[data-wk=\"9\"]').classList.contains('hol'),!!document.querySelector('.ogw-c.c-kaz'),!!document.querySelector('.ogw-notes')]")
    pg.click('.ogw-foot .ogw-lnk:has-text("İşareti sıfırla")');pg.wait_for_timeout(100)
    ev("OGRT.W.go(10)");pg.wait_for_timeout(100)
    h10=ev("[document.querySelector('.ogw-hol').innerText,!!document.querySelector('.ogw-x'),!!document.querySelector('.ogw-notes')]")
    pg.click('.ogw-foot .ogw-lnk:has-text("Bu haftada ders var")');pg.wait_for_timeout(100);h10b=ev("!document.querySelector('.ogw-hol')")
    pg.click('.ogw-foot .ogw-lnk:has-text("MEB takvimine dön")');pg.wait_for_timeout(100);h10c=ev("!!document.querySelector('.ogw-hol')")
    ok('Tatil: öğretmen işaretleyebiliyor/kaldırabiliyor; MEB ara tatili kaynakla gösteriliyor; tatilde not alanı var, kazanım ekleme isteğe bağlı',h9==[True,True,True,True] and '1. DÖNEM ARA TATİLİ' in h10[0] and 'meb.gov.tr' in h10[0] and h10[1] and h10[2] and h10b and h10c,(h9,h10,h10b,h10c))
    # takvim ayarı (resmî verisi olmayan yıl)
    ev("OGRT.S().sy='2027-2028';OGRT.render()");pg.wait_for_timeout(100)
    nocal=ev("document.querySelector('.ogw-empty').innerText")
    pg.click('.ogw-empty .ogw-b');pg.wait_for_timeout(200);pg.fill('#ogw-calf input[name=start]','2027-09-13');pg.fill('#ogw-calf input[name=end]','2028-06-23');pg.click('#ogw-calf button[type=submit]');pg.wait_for_timeout(250)
    L2=ev("OGRT.W.weeks('2027-2028')")
    ok('Takvim yoksa uydurulmuyor; öğretmen başlangıç/bitiş girince haftalar oluşuyor, tatil üretilmiyor',"takvim bilgisi yok" in nocal and len(L2)==41 and not any(w['hol'] for w in L2) and L2[0]['mon']=='2027-09-13',(len(L2),))
    ev("OGRT.S().sy='2026-2027';OGRT.render()")
    # 11 yenile
    snapA=ev("localStorage.getItem('dk-ogretmen-v1')");snapB=ev("localStorage.getItem('dk-ogretmen-hafta-v1')")
    pg.reload();pg.wait_for_timeout(1300);ev("go('ogretmen')");pg.wait_for_timeout(300)
    ok('11 Sayfa yenilenince sınıflar, durumlar, haftalık dağılım, notlar ve planlar korunuyor',json.loads(ev("JSON.stringify(OGRT.d)"))==json.loads(snapA) and json.loads(ev("JSON.stringify(OGRT.W.d)"))==json.loads(snapB) and ev("OGRT.W.list(4,'2018','2026-2027',9)")==[O4[0],O4[2]])
    # 12 yedek
    ev("OGRT.S().tab='yedek';OGRT.render()");pg.wait_for_timeout(150)
    with pg.expect_download() as dl:pg.click('.og-bk button:has-text("JSON olarak yedekle")')
    bk=json.load(open(dl.value.path(),encoding='utf-8'))
    good=(json.loads(ev("JSON.stringify(OGRT.d)")),json.loads(ev("JSON.stringify(OGRT.W.d)")))
    td=tempfile.mkdtemp()
    def up(name,obj):
        fp=os.path.join(td,name);open(fp,'w',encoding='utf-8').write(obj if isinstance(obj,str) else json.dumps(obj));pg.set_input_files('.og-bk input[type=file]',fp);pg.wait_for_timeout(350)
    cur=lambda:(json.loads(ev("JSON.stringify(OGRT.d)")),json.loads(ev("JSON.stringify(OGRT.W.d)")))
    badh=json.loads(json.dumps(bk));badh['hafta']['weeks']['4|2018']['2026-2027']['9']=['YOK-123']
    up('bad.json',badh);e1=ev("document.getElementById('og-rerr').textContent");s1=cur()==good
    up('broken.json','{x');s2=cur()==good
    ev("OGRT.d=OGRT.def();OGRT.save();OGRT.W.d=OGRT.W.def();OGRT.W.d.migrated=true;OGRT.W.save();OGRT.render()");pg.wait_for_timeout(100)
    up('good.json',bk);s3=cur()[0]['plans']==good[0]['plans'] and cur()[1]['weeks']==good[1]['weeks'] and cur()[1]['notes']==good[1]['notes']
    up('old346.json',OLD);s4=cur()[0]==json.loads(json.dumps({**OLD,'updatedAt':cur()[0]['updatedAt']})) and cur()[1]['weeks']==good[1]['weeks']
    ok('12 JSON yedek haftalık planı da içeriyor; geri yükleme çalışıyor; hatalı haftalık veri tümüyle reddediliyor; V34.6 yedeği de yüklenebiliyor',bk.get('hafta',{}).get('app')=='dkab-ogretmen-hafta' and s1 and s2 and s3 and s4 and 'Haftalık plan' in e1,(s1,s2,s3,s4,e1[:120]))
    up('good.json',bk)
    # yetki
    src=open('/home/claude/work/v350/ogrt_w.js',encoding='utf-8').read()
    ok('Yetki ayrımı: haftalık modül müfredata/yönetime yazmıyor',not any(x in src for x in ['Store.patch','Store.put','Store.set','Store.del','KMAP.save','KMAP.ov','V34.ov','isEd']) and ev("[Store.all('units').length,Store.all('outcomes').length,Store.all('topics').length]")==[60,238,246])
    # 14 öğrenci/yönetim hızlı kontrol (tam regresyon ayrıca)
    ev("go('home')");pg.wait_for_timeout(300);h=ev("document.querySelectorAll('#app .og-home').length")
    ev("go('topic',{t:'TPC18-4-1-01',tab:'anlat'})");pg.wait_for_timeout(400);tp=ev("view")=='topic' and len(ev("document.getElementById('app').innerText"))>500
    ev("go('admin')");pg.wait_for_timeout(400);ad=ev("view")=='admin'
    ok('14a Ana sayfa, öğrenci konu ekranı ve yönetim ekranı açılıyor (tam regresyon ayrıca çalıştırıldı)',h==1 and tp and ad)
    ok('Konsol/sayfa hatası yok',not errs,errs[:3])
    # 15 responsive
    st=json.dumps(good[0]);sw=json.dumps(good[1]);res=[]
    for w,hh in [(360,740),(390,844),(768,1024),(1024,768),(1440,900)]:
        for th in ['light','dark']:
            cx=b.new_context(viewport={'width':w,'height':hh},has_touch=w<800);q=cx.new_page();E2=[];q.on('pageerror',lambda e:E2.append(str(e)))
            q.add_init_script("localStorage.setItem('dk-ogretmen-v1',%s);localStorage.setItem('dk-ogretmen-hafta-v1',%s)"%(json.dumps(st),json.dumps(sw)));q.goto(URL);q.wait_for_timeout(1100)
            q.evaluate(f"document.documentElement.dataset.theme='{th}'")
            (q.tap if w<800 else q.click)('#app .og-home');q.wait_for_timeout(250)
            q.evaluate("OGRT.pick('4|2018','hafta');OGRT.W.go(9)");q.wait_for_timeout(200)
            q.evaluate("document.querySelectorAll('.ogw-c').forEach(d=>d.open=true)");q.wait_for_timeout(150)
            ov=q.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
            cards=q.evaluate("[...document.querySelectorAll('.ogw-c,.ogw-notes,.ogw-sel')].filter(e=>e.scrollWidth>e.clientWidth+1).length")
            smallL=q.evaluate("[...document.querySelectorAll('.ogw button,.ogw select,.ogw summary')].filter(e=>e.offsetParent&&!e.closest('details:not([open])>.ogw-cb')).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.height<43.5||r.width<43.5)}).map(e=>e.className+':'+e.textContent.slice(0,25)+':'+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height))");small=len(smallL)
            wk=q.evaluate("[...document.querySelectorAll('.ogw-wk')].slice(0,3).map(e=>Math.round(e.getBoundingClientRect().height))")
            onv=q.evaluate("(()=>{const s=document.querySelector('.ogw-strip').getBoundingClientRect(),o=document.querySelector('.ogw-wk.on').getBoundingClientRect();return o.left>=s.left-1&&o.right<=s.right+1})()")
            if w in(390,768) or (w==1440 and th=='dark'):q.screenshot(path=f'/home/claude/work/v360/t/w_{w}_{th}.png',full_page=True)
            res.append((w,th,ov<=0 and cards==0 and small==0 and min(wk)>=44 and onv and not E2 and q.evaluate('document.documentElement.dataset.theme')==th,ov,cards,smallL,onv,E2[:1]))
            cx.close()
    ok('15 Mobil/tablet/masaüstü (360/390/768/1024/1440 × açık/koyu): yatay taşma yok, kart metinleri taşmıyor, dokunma hedefleri ≥44px, seçili hafta görünür',all(x[2] for x in res),[x for x in res if not x[2]][:3])
    b.close()
print(json.dumps({'pass':sum(R.values()),'total':len(R)}))
