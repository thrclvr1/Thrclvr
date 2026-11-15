import json,hashlib
from playwright.sync_api import sync_playwright
URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
R={};errs=[]
def ok(k,v,info=''):R[k]=bool(v);print(('OK  ' if v else 'FAIL'),k,str(info)[:240])
with sync_playwright() as p:
    b=p.chromium.launch()
    def page(w=1366,h=900):
        c=b.new_context(viewport={'width':w,'height':h},has_touch=w<800);pg=c.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'ERR_' not in m.text and 'file:' not in m.text and errs.append(m.text))
        pg.goto(URL);pg.wait_for_timeout(1300);return c,pg
    c,pg=page();ev=pg.evaluate
    # 1
    for g in [4,8,12]:
        ev(f"go('links',{{lk:{{tab:'kavram',sel:null,py:'2018',g:'{g}',u:'',t:'',q:'',lim:999}}}})");pg.wait_for_timeout(500)
        r=ev("[document.querySelectorAll('.km-card').length,(document.querySelector('.kmps-box')||{}).className||'',[...document.querySelectorAll('.km-card')].every(e=>{const c=KMAP.C(e.getAttribute('onclick').match(/'(CON-[^']+)'/)[1]);return c.programYear==='2018'&&c.grade===%d})]"%g)
        ok(f'1 2018 · {g}. sınıf kavramları normal gösteriliyor, durum “Veriler mevcut”',r[0]>0 and 'ps-mevcut' in r[1] and r[2],r)
    ev("V34.see('TPC18-4-1-01')");pg.wait_for_timeout(500);ok('1b 2018 · 4. sınıf konu listesi (V34.4 davranışı) korunuyor: 15 kavram',ev("document.querySelectorAll('.km-tc').length")==15 and 'ps-mevcut' in ev("document.querySelector('.kmps-box').className"))
    # 2
    st=ev("[4,5,6,7,8,9,10,11,12].map(g=>[g,KMAP.pstatus(g,'2018').key,KMAP.pstatus(g,'2026').key])")
    exp=[[4,'mevcut','uygulanmiyor'],[5,'kaldirildi','mevcut'],[6,'kaldirildi','mevcut'],[7,'kaldirildi','mevcut'],[8,'mevcut','uygulanmiyor'],[9,'kaldirildi','mevcut'],[10,'kaldirildi','mevcut'],[11,'kaldirildi','mevcut'],[12,'mevcut','uygulanmiyor']]
    ok('2a Program/sınıf durumları resmî takvimle aynı (2026-2027)',st==exp and ev("KMAP.syTxt(KMAP.sy())")=='2026-2027',st)
    ok('2b 2026 · 4/8/12: 2027-2028 başlangıcı, veri hatası değil',all('2027-2028' in ev(f"KMAP.pstatus({g},'2026').detail") and 'veri hatası değildir' in ev(f"KMAP.pstatus({g},'2026').detail") for g in [4,8,12]))
    ev("go('links',{lk:{tab:'kavram',sel:null,py:'2026',g:'8',u:'',t:''}})");pg.wait_for_timeout(500)
    ok('2c 2026 · 8. sınıf seçilince genel boş liste değil, durum kutusu',ev("document.querySelector('.kmps-box').className").find('ps-uygulanmiyor')>=0 and 'nedeni yukarıda' in ev("document.querySelector('.kmps-empty').textContent"))
    t26=ev("V34.topics().find(t=>t.grade===4&&t.programYear==='2026').id");ev(f"V34.see('{t26}')");pg.wait_for_timeout(500)
    ok('2d 2026 · 4. sınıf konusundan gelince “henüz uygulanmıyor” durumu',ev("document.querySelector('.kmps-box').className").find('ps-uygulanmiyor')>=0)
    ev("go('links',{lk:{tab:'kavram',sel:null,py:'',g:'',u:'',t:''}})");pg.wait_for_timeout(500);pg.locator('.kmpm summary').click();pg.wait_for_timeout(200)
    rows=ev("[...document.querySelectorAll('.kmpm tbody tr')].map(r=>[r.querySelector('th').textContent,[...r.querySelectorAll('td .kmps')].map(x=>x.textContent)])")
    ok('2e Program ve sınıf durumu tablosu (9 sınıf × 2 program, ayrı durum adları)',len(rows)==9 and rows[0][1][0]=='Veriler mevcut' and rows[0][1][-1]=='İçerik henüz uygulanmıyor' and rows[1][1][0]=='Bu sınıfta artık uygulanmıyor',rows[:2])
    # 3
    mix=ev("V34.topics().filter(t=>t.programYear==='2018').some(t=>KMAP.topicConcepts(t.id).some(x=>KMAP.C(x.cid).programYear!=='2018'))||V34.topics().filter(t=>t.programYear==='2026').some(t=>KMAP.topicConcepts(t.id).some(x=>KMAP.C(x.cid).programYear!=='2026'))")
    ok('3a Konu–kavram listelerinde programlar karışmıyor (246 konu)',not mix)
    ok('3b 2018 verisi 2026 olarak kopyalanmadı (2026 · 4/8/12 kavramı 0, ünite/çıktı yalnızca resmî program metni)',ev("[4,8,12].every(g=>Store.allRaw('concepts').filter(c=>c.grade===g&&c.programYear==='2026').length===0)"))
    # 4 yolculuk
    ev("G.kmap=null;go('links',{lk:{tab:'kavram',sel:{type:'concept',id:'CON-DKAB-5-tevhit'},py:'',g:''}})");pg.wait_for_timeout(900)
    rows=ev("[...document.querySelectorAll('.kjr')].map(e=>[e.querySelector('.kjr-h b').textContent,e.querySelector('.kmps').textContent,e.className])")
    exp=ev("[...new Set([KMAP.C('CON-DKAB-5-tevhit'),...Store.all('concepts').filter(c=>c.normalizedTerm==='tevhit'&&c.id!=='CON-DKAB-5-tevhit')].map(c=>c.grade+'. sınıf|'+(c.programYear==='2018'?'2018 programı':'2026 programı (TYMM)')))]")
    ok('4a Tevhit yolculuğu: 6 sınıf, sıralı, her satırda kendi programı',[r[0]+'|'+r[1] for r in rows]==sorted(exp,key=lambda x:int(x.split('.')[0])),rows)
    ok('4b Yolculuk satırında ünite, konu, açıklama var; konu kavramın gerçek dersi',ev("[...document.querySelectorAll('.kjr')].every(e=>e.querySelector('.kjr-d')&&e.querySelector('p.small').textContent.length>5)"))
    t7=ev("KMAP.jmain('CON-DKAB-7-tevhit').id");pg.locator('.kjr:has-text(\"7. sınıf\") button:text(\"7. sınıf dersine git\")').click();pg.wait_for_timeout(700)
    ok('4c Sınıfa dokununca ilgili derse gidiyor',ev("view")=='topic' and ev("G.t")==t7,t7);ev("history.back()");pg.wait_for_timeout(700)
    # 5 benzer isim
    a=ev("(()=>{const A=KMAP.jall();return{n:A.length,autos:[...new Set(A.map(p=>p.auto))],sameTerm:A.every(p=>Store.get('concepts',p.a).normalizedTerm===Store.get('concepts',p.b).normalizedTerm),approved:A.filter(p=>p.st==='onay').length,imam:A.some(p=>[p.a,p.b].some(i=>/imam/.test(i))&&[p.a,p.b].some(i=>/-iman$/.test(i)))}})()")
    ok('5 Aday yalnızca aynı ad; “farklı anlam” ya da birleştirme otomatik yapılmıyor; hiçbir aday onaylı değil',a['sameTerm'] and set(a['autos'])<={'ayni','belirsiz'} and a['approved']==0 and not a['imam'],a)
    # 6 karşılaştırma
    pc=ev("JSON.stringify(KMAP.progCmp('CON-DKAB-5-tevhit'),(k,v)=>v instanceof Map?[...v]:v)");pcj=json.loads(pc)
    ok('6a Tevhit: her iki programda (2018: 4, 12 · 2026: 4p, 5, 7, 9, 11)',pcj['auto']=='ikisi' and sorted(g for g,_ in pcj['pres']['2018'])==[4,12] and sorted(g for g,_ in pcj['pres']['2026'])==[4,5,7,9,11],pcj['pres'])
    only18=ev("(()=>{const c=Store.all('concepts').find(c=>c.programYear==='2018'&&KMAP.progCmp(c.id).auto!=='ikisi');const r=KMAP.progCmp(c.id);return[c.term,r.auto,r.why]})()")
    ok('6b Yalnızca 2018’de görülen kavram “yok” diye kesinleştirilmiyor (2026 4/8/12 kitapları yok → inceleme)',only18[1]=='inceleme',only18)
    ok('6c Karşılaştırma yolculuktan ayrı bölüm',ev("!!document.querySelector('.km-pc')&&!document.querySelector('.km-jr .km-pc')"))
    # 7 onay bekleyen
    ok('7a Bekleyen adaylar öğrenci tarafında “(aday)” ve “editör onayı bekliyor” etiketli, kesik çizgili',ev("[...document.querySelectorAll('.kjr.pend')].every(e=>/\\(aday\\)/.test(e.textContent)&&/editör onayı bekliyor/.test(e.textContent))") and ev("document.querySelectorAll('.kjr.ok').length")==0)
    jid=ev("KMAP.jid('CON-DKAB-5-tevhit','CON-DKAB-7-tevhit')");jid2=ev("KMAP.jid('CON-DKAB-5-tevhit','CON-DKAB-11-tevhit')")
    ev("sessionStorage.setItem('dk-editor','1');go('links',{lk:{tab:'yonetim',open:['jr'],jf:{list:'bekleyen',py:'',g:'5',u:'',t:'',ty:'',st:'',src:''},lim:60}})");pg.wait_for_timeout(800)
    ok('A0 Yönetim: ilişki paneli, 6 liste, 7 süzgeç',ev("document.querySelectorAll('.kjf select').length")==8 and ev("document.querySelector('.kjf select').options.length")==6)
    n5=ev("document.querySelectorAll('.kma-p[data-p=jr] .lk-it').length");ok('A1 Sınıf süzgeci listeyi daraltıyor',0<n5<ev("KMAP.jall().length"),n5)
    ev(f"KMAP.jset('{jid2}','onay')");ok('A2 Türü belirsiz aday tür seçilmeden onaylanamıyor',ev(f"!KMAP.jdec('{jid2}')||KMAP.jdec('{jid2}').st!=='onay'"))
    ev(f"KMAP.jty('{jid2}','genis')");ev(f"KMAP.jset('{jid2}','onay')");ok('A3 Tür değiştir + onayla',ev(f"KMAP.jdec('{jid2}').st==='onay'&&KMAP.jdec('{jid2}').ty==='genis'"))
    key=jid.replace(':','_').replace('~','_');ev(f"(()=>{{const t=document.getElementById('jn-{key}');if(t)t.value='Tevhit 7. sınıfta sure bağlamında yeniden ele alınıyor.'}})()");ev(f"KMAP.jnote('{jid}')")
    ok('A4 Açıklama ekle (karar beklemeye alınır)',ev(f"KMAP.jdec('{jid}').note.startsWith('Tevhit 7')&&KMAP.jdec('{jid}').st==='bekle'"))
    jid3=ev("KMAP.jid('CON-DKAB-5-tevhit','CON-DKAB-9-tevhit')");ev(f"KMAP.jset('{jid3}','red')");ok('A5 Reddet',ev(f"KMAP.jdec('{jid3}').st==='red'"))
    ev("V34.S().jf.list='red';V34.renderBody()");pg.wait_for_timeout(300);ok('A6 Reddedilmiş liste',ev("document.querySelectorAll('.kma-p[data-p=jr] .lk-it').length")>=1)
    ev("V34.S().jf.list='onay';V34.S().jf.g='';V34.renderBody()");pg.wait_for_timeout(300);ok('A7 Onaylanmış liste',ev("document.querySelectorAll('.kma-p[data-p=jr] .lk-it').length")==1)
    ev("V34.S().jf.list='uygulanmayan';V34.renderBody()");pg.wait_for_timeout(300);ok('A8 Henüz uygulanmayan kombinasyonlar (2026: 4/8/12; 2018: 5-7, 9-11)',ev("document.querySelectorAll('.kma-p[data-p=jr] .kma-in > p:not(.mut)').length")==9)
    ev("V34.S().jf.list='eksik';V34.renderBody()");pg.wait_for_timeout(300);el=ev("document.querySelector('.kma-p[data-p=jr] .kma-in').innerText")
    ok('A9 Eksik veri listesi yalnızca uygulanan programları sayıyor',('Konuya git' in el) or ('eksik olduğu doğrulanan kavram verisi yok' in el),el[:160])
    ev("V34.S().jf.list='pc';V34.renderBody()");pg.wait_for_timeout(300);ok('A10 Programlar arası karşılaştırma adayları + editör durumu',ev("document.querySelectorAll('.kma-p[data-p=jr] .lk-it').length")>0)
    ev("KMAP.pcset('tevhit','farkli')")
    ev("G.kmap=null;go('links',{lk:{tab:'kavram',sel:{type:'concept',id:'CON-DKAB-5-tevhit'}}})");pg.wait_for_timeout(800)
    t=ev("document.querySelector('.km-jr').innerText")
    ok('7b Onaylanan ilişki öğrenciye “Editör onaylı”; reddedilen gösterilmiyor; not “Neden?” altında',ev("[...document.querySelectorAll('.kjr.ok')].some(e=>/11\\. sınıf/.test(e.textContent)&&/Genişleyen kavram/.test(e.textContent)&&/Editör onaylı/.test(e.textContent))") and '9. sınıf' not in t and not ev("[...document.querySelectorAll('.kjr.pend')].some(e=>/Tevhit 7. sınıfta sure/.test(e.textContent))"),[ev("[...document.querySelectorAll('.kjr.ok')].map(e=>e.textContent.slice(0,90))"),'9. sınıf' in t])
    ok('7c Editör notu onaylanmadan öğrenciye gösterilmiyor; onaylı ilişkide not “Neden?” altında',(ev(f"KMAP.ov.jr['{jid}'].st='onay'")=='onay') and (ev("V34.renderBody()") or True) and ev("[...document.querySelectorAll('.kjr.ok')].some(e=>/Tevhit 7. sınıfta sure/.test(e.textContent))"))
    ok('6d Editör karşılaştırma kararı öğrenciye yansıyor',ev("/Anlatım veya kapsamı farklı/.test(document.querySelector('.km-pc').textContent)&&/editör değerlendirmesi/.test(document.querySelector('.km-pc').textContent)"))
    # 9
    ok('9 988 kavram bağlantısı, 2610 kayıt, 1121 kavram, 246 konu, kimlikler aynı',ev("(()=>{let n=0;KMAP.adj().forEach(L=>L.forEach(x=>{if(x.p<x.c&&x.origin!=='manual')n++}));return[n,V34.load().R.length,Store.allRaw('concepts').length,Store.all('topics').length]})()")==[988,2610,1121,246])
    ok('9b Editör kararları yalnızca dk-km katmanında (kavram/konu kaydı değişmedi)',ev("!!JSON.parse(localStorage.getItem('dk-km')).jr&&Store.get('concepts','CON-DKAB-5-tevhit').status==='review'"))
    c.close()
    # duyarlı
    for w,h in [(360,740),(390,844),(768,1024),(1024,768),(1440,900)]:
        for th in ['dark','light']:
            c,pg=page(w,h);ev=pg.evaluate
            if th=='light':ev("if(themeNow()!=='light'){theme();themeBtns()}")
            res=[]
            for js in ["go('links',{lk:{tab:'kavram',sel:null,py:'',g:'',u:'',t:''}});setTimeout(()=>document.querySelector('.kmpm').open=true,50)","G.kmap=null;go('links',{lk:{tab:'kavram',sel:{type:'concept',id:'CON-DKAB-5-tevhit'}}});setTimeout(()=>document.querySelectorAll('.kjr-why').forEach(d=>d.open=true),50)","sessionStorage.setItem('dk-editor','1');go('links',{lk:{tab:'yonetim',open:['jr'],jf:{list:'bekleyen'},lim:20}})"]:
                ev(js);pg.wait_for_timeout(700)
                res.append(ev("[document.documentElement.scrollWidth<=innerWidth||getComputedStyle(document.querySelector('.kmpm-in')||document.body).overflowX==='auto',[...document.querySelectorAll('.km-jr button,.km-jr summary,.km-pc button,.kmpm summary,.kjf select,.kma-p[data-p=jr] button,.kma-p[data-p=jr] summary,.kma-p[data-p=jr] textarea')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height<43.5}).map(e=>e.className||e.tagName).slice(0,3)]"))
            okk=all(r[0] and not r[1] for r in res)
            ok(f'R {w}px {th}: taşma yok, dokunma hedefleri ≥44 (liste+durum tablosu, yolculuk, yönetim)',okk and not errs,res)
            c.close()
    b.close()
h4=open('/home/claude/work/din-kulturu-platformu-v34.4.html',encoding='utf-8').read();h5=open('/home/claude/work/din-kulturu-platformu-v36.0.html',encoding='utf-8').read()
def blk(h,i):k=h.index(f'id="{i}">');return h[k:h.index('</script>',k)]
# V36 uyarlaması: bloklar artık boşluksuz (kompakt) yazılıyor ve 6 maddelik müfredat düzeltmesi uygulandı.
# Ayrıştırılmış veri V34.4 ile aynı olmalı; fark yalnızca beklenen düzeltme kayıtlarında olabilir.
def jb(h,i):k=h.index(f'id="{i}">');k=h.index('>',k)+1;return json.loads(h[k:h.index('</script>',k)])
EXP={('outcomes','DKAB-11-U04-O03'),('units','DKAB-10-U05'),('gamesV2','GM28-DKAB-10-U05-dogru'),('topicsV2','TPC18-8-1-05'),('topicsV2','TPC18-4-2-01'),('questionsV2','Q25-TPC18-8-1-05-01'),('questionsV2','Q25-TPC18-8-1-05-02'),('questionsV2','Q25-TPC18-8-1-05-03'),('gamesV2','GM30-BK-8-2018'),('relations','REL_2497')}
diff=set()
for i in ['seed-curriculum','seed-sd','seed-rel','seed-hide','seed-km']:
    A,B=jb(h4,i),jb(h5,i)
    if A==B:continue
    for col in set(A)|set(B):
        if A.get(col)==B.get(col):continue
        if isinstance(A.get(col),list) and isinstance(B.get(col),list) and len(A[col])==len(B[col]):
            for x,y in zip(A[col],B[col]):
                if x!=y:diff.add((col,x.get('id') if isinstance(x,dict) and x.get('id') else '*'))
        else:diff.add((col,'?'))
ok('9c Veri blokları V34.4 ile aynı (ayrıştırılmış); fark yalnızca V36 düzeltme kayıtlarında',diff==EXP,sorted(diff^EXP))
ok('9d V34.4 dosyası değişmedi',hashlib.md5(h4.encode()).hexdigest()=='1c348a4dc5f23628f1c342575ebf25d9')
print('errs',errs);print('PASS',sum(R.values()),'/',len(R));json.dump(R,open('t/res_v345x.json','w'),ensure_ascii=False)
