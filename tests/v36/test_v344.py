import json,hashlib
from playwright.sync_api import sync_playwright

# V36 uyarlaması (test_v345x 9c ile aynı yöntem): bloklar boşluksuz yazılıyor ve müfredat düzeltmesi uygulandı.
def _jb36(h,i):
    import json;k=h.index(f'id="{i}">');k=h.index('>',k)+1;return json.loads(h[k:h.index('</script>',k)])
_EXP36={('outcomes','DKAB-11-U04-O03'),('units','DKAB-10-U05'),('gamesV2','GM28-DKAB-10-U05-dogru'),('topicsV2','TPC18-8-1-05'),('topicsV2','TPC18-4-2-01'),('questionsV2','Q25-TPC18-8-1-05-01'),('questionsV2','Q25-TPC18-8-1-05-02'),('questionsV2','Q25-TPC18-8-1-05-03'),('gamesV2','GM30-BK-8-2018'),('relations','REL_2497')}
def _diff36(ha,hb):
    d=set()
    for i in ['seed-curriculum','seed-sd','seed-rel','seed-hide','seed-km']:
        A,B=_jb36(ha,i),_jb36(hb,i)
        if A==B:continue
        for col in set(A)|set(B):
            if A.get(col)==B.get(col):continue
            if isinstance(A.get(col),list) and isinstance(B.get(col),list) and len(A[col])==len(B[col]):
                for x,y in zip(A[col],B[col]):
                    if x!=y:d.add((col,x.get('id') if isinstance(x,dict) and x.get('id') else '*'))
            else:d.add((col,'?'))
    return d

URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html';TID='TPC18-4-1-01'
d=json.load(open('/home/claude/work/v33/CUR_v33.json'));H=set(x[1] for x in json.load(open('/home/claude/work/v34/hide_calc.json'))['hide'])
T=[t for t in d['topicsV2'] if t['id']==TID][0];REG=set(c['id'] for c in d['concepts'] if (TID in c.get('topicIds',[]) or c['id'] in T['conceptIds']) and c['id'] not in H)
R={};errs=[]
def ok(k,v,info=''):R[k]=bool(v);print(('OK  ' if v else 'FAIL'),k,str(info)[:240])
with sync_playwright() as p:
    b=p.chromium.launch()
    def page(w=1366,h=900):
        c=b.new_context(viewport={'width':w,'height':h},has_touch=w<800);pg=c.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'ERR_' not in m.text and 'file:' not in m.text and errs.append(m.text))
        pg.goto(URL);pg.wait_for_timeout(1300);return c,pg
    c,pg=page();ev=pg.evaluate
    ok('0 KMAP.picker tek temel tanım (V34.5 yalnızca durum kutusu için sarmalıyor)',open('/home/claude/work/din-kulturu-platformu-v36.0.html',encoding='utf-8').read().count('KMAP.picker=function(b){const S=V34.S()')==1)
    ev(f"go('topic',{{t:'{TID}',tab:'anlat'}})");pg.wait_for_timeout(700)
    n=int(ev("document.querySelector('.lk-see i').textContent"));ttl=ev("document.querySelector('#app h1').textContent")
    pg.locator('.lk-see').click();pg.wait_for_timeout(800)
    ids=ev("[...document.querySelectorAll('.km-tc')].map(e=>e.dataset.c)")
    ok('1 Düğmedeki sayı = açılan liste (Günlük Konuşmalarda Dinî İfadeler)',n==len(ids)==int(ev("document.querySelector('.km-topic .kma-n').textContent")) and ttl==ev("document.querySelector('.km-topic h2').textContent"),[n,len(ids)])
    ok('2a Listedeki kavramlar = bu konuya kayıtlı görünür kavramlar (veri dosyasından bağımsız kontrol)',set(ids)==REG,sorted(set(ids)^REG))
    ok('2b Gizli “hak” ve “minnettar” listede yok, “dua / dilek / esenlik” var',not {'CON-DKAB-4-hak','CON-DKAB-4-minnettar'}&set(ids) and {'CON-DKAB-4-dua','CON-DKAB-4-dilek','CON-DKAB-4-esenlik'}<=set(ids))
    chk=ev(f"""(()=>{{const out=[];for(const x of KMAP.topicConcepts('{TID}')){{const c=KMAP.C(x.cid),T=V34.TM('{TID}');if(c.grade!==T.grade||c.programYear!==T.programYear)out.push(['sınıf',c.term]);if(x.kind==='gecis'){{for(const h of x.hits){{const s=KMAP.sent('{TID}',h.bi,h.a,h.e);if(!s||!V33.scan(s,V33.rx(V33.terms(c))).length)out.push(['cümle',c.term])}}}}else if(!x.reg&&!x.kar.length)out.push(['dayanak yok',c.term])}}return out}})()""")
    ok('3 İlgisiz kavram yok: hepsi aynı sınıf/program, “geçiyor” olanların cümlesi kavramı gerçekten içeriyor',chk==[],chk)
    lab=ev("[...document.querySelectorAll('.km-tc')].map(e=>[e.dataset.c,e.querySelector('.tg .kmk').textContent,e.querySelector('small').textContent,(e.querySelector('.kmk.ml')||{}).textContent||''])")
    tc={x['cid']:x for x in ev(f"KMAP.topicConcepts('{TID}').map(x=>({{cid:x.cid,kind:x.kind,h:x.hits.length,d:KMAP.lessons(x.cid).length}}))")}
    bad=[l for l in lab if (tc[l[0]]['kind']=='gecis')!=(l[1]=='Bu konuda geçiyor') or (tc[l[0]]['kind']=='kayit')!=(l[1]=='Bu konunun ilgili kavramı') or (tc[l[0]]['d']>=2)!=('Birden fazla derste' in l[3]) or (tc[l[0]]['d']>=2 and f"{tc[l[0]]['d']} ders" not in l[3])]
    ok('4a Kart etiketleri veriye dayanıyor (geçiyor / ilgili kavram / birden fazla derste + gerçek ders sayısı)',not bad,bad[:3])
    dd=ev("(id)=>{const s=new Set(KMAP.C(id).topicIds||[]);V34.of('concept',id).forEach(x=>{if(x.o.type==='topic'&&x.r.relation_type==='concept')s.add(x.o.id)});return s.size}",'CON-DKAB-4-peygamber')
    ok('4b “n ders” farklı ders kimliklerini sayıyor (peygamber)',tc['CON-DKAB-4-peygamber']['d']==dd,dd)
    # 5 ayrıntı
    x=ev(f"KMAP.topicConcepts('{TID}').find(x=>x.kind==='gecis'&&x.cid==='CON-DKAB-4-haram')");h=x['hits'][0]
    pg.locator('.km-tc[data-c="CON-DKAB-4-haram"] summary').click();pg.wait_for_timeout(300)
    dt=ev("document.querySelector('.km-tc[data-c=\"CON-DKAB-4-haram\"] .km-tc-d').innerText");sen=ev(f"KMAP.sent('{TID}',{h['bi']},{h['a']},{h['e']})");bh=ev(f"KMAP.bh('{TID}',{h['bi']})")
    ok('5a Ayrıntı: ders, bölüm, ilişki yöntemi, kanıt cümlesi, otomatik/editör bilgisi',bh in dt and sen.strip() in dt.replace('\n',' ') and 'İlişki nasıl kuruldu' in dt.replace('İLİŞKİ','İlişki').replace('NASIL KURULDU','nasıl kuruldu') and 'editör onayı yok' in dt and 'Ders metni eşleşmesi' in dt,dt[:200])
    pg.locator('.km-tc[data-c="CON-DKAB-4-haram"] button:text("Derste göster")').click();pg.wait_for_timeout(1000)
    ok('5b “Derste göster” doğru derse gidip cümleyi vurguluyor',ev("view")=='topic' and ev("G.t")==TID and ev(f"[...document.querySelectorAll('mark.km-hl')].map(m=>m.textContent).join('').replace(/\\s+/g,' ').trim()===KMAP.sent('{TID}',{h['bi']},{h['a']},{h['e']}).replace(/\\s+/g,' ').trim()"))
    pg.locator('#km-bar button.p').click();pg.wait_for_timeout(900)
    ok('5c Haritaya dönüşte konu listesi ve açık kart korunuyor',ev("view")=='links' and ev("G.lk.t")==TID and ev("document.querySelector('.km-tc[data-c=\"CON-DKAB-4-haram\"]').open"))
    pg.locator('.km-tc[data-c="CON-DKAB-4-dua"] summary').click();pg.wait_for_timeout(300);dt=ev("document.querySelector('.km-tc[data-c=\"CON-DKAB-4-dua\"] .km-tc-d').innerText")
    ok('5d Anlatımda geçmeyen kayıtlı kavram dürüstçe belirtiliyor (kanıt cümlesi uydurulmuyor)','kanıt cümlesi yok' in dt and 'Veri kaydı' in dt,dt[:160])
    pg.locator('.km-tc[data-c="CON-DKAB-4-dua"] button:text("Kavram haritası")').click();pg.wait_for_timeout(700)
    ok('5e Kavram haritasına geçiş ve “Bu konunun kavramları” geri düğmesi',ev("!!document.querySelector('.kmr')") and 'Bu konunun' in ev("document.querySelector('.km-back').textContent"))
    pg.locator('.km-back').click();pg.wait_for_timeout(500);ok('5f Geri: konu listesine dönüş',ev("!!document.querySelector('.km-topic')"))
    # 6
    pg.locator('.km-tf button').first.click();pg.wait_for_timeout(600)
    ok('6 Konu süzgeci kaldırılınca genel liste (konu/ünite/sınıf süzgeci temiz)',ev("G.lk.t===''&&G.lk.u===''&&G.lk.g===''") and ev("!document.querySelector('.km-topic')&&!!document.querySelector('.km-gal')") and ev("document.getElementById('lk-u').value===''&&document.getElementById('lk-g').value===''"))
    gc=ev("(()=>{const e=document.querySelector('.km-card');const id=e.getAttribute('onclick').match(/'(CON-[^']+)'/)[1];return[e.querySelector('small').textContent,KMAP.counts(id)]})()")
    ok('4c Genel kart sayaçları ne saydığını söylüyor ve kodla aynı',('bağlantılı kavram' in gc[0] if gc[1]['r'] else True) and 'dersle ilişkili' not in gc[0] and (f"{gc[1]['r']} bağlantılı kavram" in gc[0] if gc[1]['r'] else True) and (f"{gc[1]['d']} derste geçiyor" in gc[0] if gc[1]['d'] else True),gc)
    # süzgeç tutarlılığı
    ev(f"V34.see('{TID}')");pg.wait_for_timeout(600);pg.select_option('#lk-g','8');pg.wait_for_timeout(500)
    ok('6b Konu modunda sınıf değiştirilince konu süzgeci kalkıyor',ev("G.lk.t===''&&G.lk.g==='8'") and ev("!document.querySelector('.km-topic')"))
    # tüm konular için düğme = liste
    allc=ev("V34.topics().map(t=>[t.id,KMAP.topicConcepts(t.id).length])")
    mism=[]
    for tid,cnt in allc[::12]:
        ev(f"go('topic',{{t:'{tid}',tab:'anlat'}})");pg.wait_for_timeout(250);bn=ev("(document.querySelector('.lk-see i')||{}).textContent")
        ev(f"V34.see('{tid}')");pg.wait_for_timeout(300);ln=ev("document.querySelectorAll('.km-tc').length")
        if str(cnt)!=bn or ln!=cnt:mism.append((tid,bn,ln,cnt))
    ok(f'1b {len(allc[::12])} örnek konuda düğme sayısı = liste',not mism,mism)
    old=ev("(()=>{let reg=0;for(const t of V34.topics()){const r=Store.all('concepts').filter(c=>(c.topicIds||[]).includes(t.id)||(t.conceptIds||[]).includes(c.id));const L=new Set(KMAP.topicConcepts(t.id).map(x=>x.cid));if(r.some(c=>!L.has(c.id)))reg++}return reg})()")
    ok('2c 246 konunun hiçbirinde kayıtlı görünür kavram listeden düşmüyor',old==0,old)
    c.close()
    # 7 duyarlı
    for w,hh in [(360,740),(390,844),(768,1024),(1024,768),(1440,900)]:
        for th in ['dark','light']:
            c,pg=page(w,hh);ev=pg.evaluate
            if th=='light':ev("if(themeNow()!=='light'){theme();themeBtns()}")
            ev(f"V34.see('{TID}')");pg.wait_for_timeout(600);pg.locator('.km-tc').first.locator('summary').click();pg.wait_for_timeout(300)
            m=ev("[document.documentElement.scrollWidth<=innerWidth,[...document.querySelectorAll('.km-topic button,.km-tc summary,.km-tc-d button')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height<43.5}).length,Math.min(...[...document.querySelectorAll('.km-tc .tx b,.km-tc small')].map(e=>parseFloat(getComputedStyle(e).fontSize)))]")
            ok(f'7 {w}px {th}: taşma yok, dokunma hedefi ≥44, yazı ≥12px',m[0] and m[1]==0 and m[2]>=12,m)
            if w==390 and th=='dark':pg.screenshot(path='m390.png',full_page=False)
            c.close()
    b.close()
h3=open('/home/claude/work/din-kulturu-platformu-v34.3.html',encoding='utf-8').read();h4=open('/home/claude/work/din-kulturu-platformu-v36.0.html',encoding='utf-8').read()
def blk(h,i):k=h.index(f'id="{i}">');return h[k:h.index('</script>',k)]
_d=_diff36(h3,h4)
ok('8 Veri blokları V34.3 ile aynı (ayrıştırılmış; V36 boşluksuz yazım); fark yalnızca V36 düzeltme kayıtlarında',_d==_EXP36,sorted(_d^_EXP36))
ok('8b V34.3 dosyası değişmedi',hashlib.md5(h3.encode()).hexdigest()=='051a4edd0d77f5e3358b25db64e31ec9')
print('errs',errs);print('PASS',sum(R.values()),'/',len(R));json.dump(R,open('t/res_v344.json','w'),ensure_ascii=False)
