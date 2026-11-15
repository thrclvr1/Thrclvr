import json,re
from playwright.sync_api import sync_playwright
F30="file:///home/claude/work/din-kulturu-platformu-v30.html";F31="file:///home/claude/work/din-kulturu-platformu-v36.0.html"
R={}
# ---- 1) JSON karşılaştırması
C30=json.load(open('../CUR_v30.json'));C31=json.load(open('../CUR_v31.json'))
same=[k for k in C30 if k not in('concepts','entities','topicsV2','questionsV2','gamesV2') and C30[k]==C31[k]]
R['koleksiyon_ayni']=sorted(same);R['koleksiyon_degisen']=[k for k in C30 if C30[k]!=C31[k]]
R['kayit_sayilari_V30_V31']={k:[len(C30[k]),len(C31[k])] for k in('topicsV2','questionsV2','flashcardsV2','concepts','entities','gamesV2')}
# kavram/varlık: eski alanlar aynı, topicIds yalnızca genişledi
bad=[]
for k in('concepts','entities'):
    o={r['id']:r for r in C30[k]};n={r['id']:r for r in C31[k]}
    assert list(o)==list(n),k
    for i,r in o.items():
        r2=n[i]
        for f,v in r.items():
            if f in('topicIds','snippet'):continue
            if r2.get(f)!=v:bad.append((i,f))
        if not set(r['topicIds'])<=set(r2['topicIds']):bad.append((i,'topicIds kayıp'))
        if r['snippet'] and r2['snippet']!=r['snippet']:bad.append((i,'snippet'))
R['kavram_varlik_alan_kaybi']=len(bad)
# konular: yalnızca conceptIds/entityIds genişledi
tb=0
for a,b in zip(C30['topicsV2'],C31['topicsV2']):
    for f,v in a.items():
        if f in('conceptIds','entityIds'):
            if not set(v)<=set(b[f]):tb+=1
        elif b.get(f)!=v:tb+=1
R['konu_alan_kaybi']=tb
# sorular
qd=[]
for a,b in zip(C30['questionsV2'],C31['questionsV2']):
    if a!=b:qd.append(a['id']);assert a['answer']==b['answer'] and a['text']==b['text'] and a['topicId']==b['topicId']
R['degisen_soru']=len(qd);R['degisen_soru_cevap_ayni']=True
R['sorular_haric_ayni']=len(C30['questionsV2'])==len(C31['questionsV2'])
R['kartlar_ayni']=C30['flashcardsV2']==C31['flashcardsV2']
g30=C30['gamesV2'];g31=C31['gamesV2']
R['v29_oyun_oneki_ayni']=g30[:275]==g31[:275]
R['v30_oyun_kimlikleri']={'toplam':len(g30)-275,'korunan_kimlik':len({g['id'] for g in g30[275:]}&{g['id'] for g in g31}),'kaldirilan':len({g['id'] for g in g30[275:]}-{g['id'] for g in g31})}
A30=json.load(open('../topics_all_v30.json'));A31=json.load(open('../topics_all_v31.json'))
R['topics_all']={k:[len(A30[k]),len(A31[k])] for k in A30}
R['topics_all_konu_sayisi_246']=len(A31['topics'])==246
# ---- 2) tarayıcıda göç
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F30);pg.wait_for_timeout(1500)
    ids=pg.evaluate("""()=>{const g=gList().find(g=>g.gameType==='eleme'),t=gList().find(g=>g.gameType==='tabu'),q=Store.all('questions')[0],c=Store.all('flashcards')[0];
     Store.ov.gscore={};Store.ov.gscore[g.id]={best:30,max:40,plays:2,last:30,lastAt:'2026-11-01',ts:1};Store.ov.gscore[t.id]={best:20,max:30,plays:1,last:20,lastAt:'2026-11-01',ts:1};Store.ov.gscore[gList()[3].id]={best:10,max:20,plays:1,last:10,lastAt:'2026-11-01',ts:1};
     Store.ov.prog['DKAB-5-U01-O01']={outcomeId:'DKAB-5-U01-O01',mastery:.6,correct:3,wrong:2,lastReviewed:'2026-11-02'};Store.ov.cards[c.id]={box:2,last:'ok',seen:3,ok:3,due:1,lvl:'ok'};Store.ov.last='TPC-5-1-01';
     Store.ov.wrong={};Store.ov.wrong[q.id]={t:q.topicId,at:'2026-11-03'};Store.ov.mt={'TPC-5-1-01':{at:'2026-11-03',n:5,ok:4,wr:1,bl:0,mode:'ogren'}};Store.ov.tests=[{at:Date.now(),mode:'mini',n:5,ok:4}];Store.ov.ghist=[{id:g.id,at:Date.now(),pts:30}];Store.save();localStorage.setItem('dk-theme','light');return [g.id,t.id]}""")
    before=pg.evaluate("()=>JSON.parse(localStorage.getItem('dk2'))");kb=pg.evaluate("Object.keys(localStorage)")
    pg.goto(F31);pg.wait_for_timeout(1800)
    after=pg.evaluate("()=>JSON.parse(localStorage.getItem('dk2'))");ka=pg.evaluate("Object.keys(localStorage)")
    R['dataVersion']=[before.get('dataVersion'),after.get('dataVersion')]
    for k in['gscore','prog','cards','last','wrong','mt','tests','ghist']:
        v=before.get(k);a=after.get(k)
        R['korundu_'+k]=(v==a) or (isinstance(v,dict) and all(a.get(i)==x for i,x in v.items()))
    R['yeni_oyun_skoru_korundu(kalan oyun)']=after['gscore'].get(ids[0])==before['gscore'].get(ids[0])
    R['kaldirilan_oyunun_skoru_silinmedi']=after['gscore'].get(ids[1])==before['gscore'].get(ids[1])
    R['localStorage_anahtarlari']=[sorted(kb),sorted(ka)]
    R['tema_korundu']=pg.evaluate("document.documentElement.dataset.theme")=='light'
    R['calisma_zamani_sayilari']=pg.evaluate("({topics:Store.all('topics').length,q:Store.all('questions').length,cards:Store.all('flashcards').length,games:Store.all('games').length,concepts:Store.all('concepts').length,entities:Store.all('entities').length})")
    R['V31_acilista_hata']=errs
    b.close()
json.dump(R,open('t360/out/res_data31.json','w'),ensure_ascii=False,indent=1);print(json.dumps(R,ensure_ascii=False,indent=1))
