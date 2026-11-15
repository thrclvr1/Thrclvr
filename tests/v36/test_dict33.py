import json
from playwright.sync_api import sync_playwright
URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
R={};errs=[]
def ok(k,v,info=''):R[k]=bool(v);print(('OK  ' if v else 'FAIL'),k,info)
def opencard(pg,col,rid):
    pg.evaluate(f"V30.openDict('{col}','{rid}')");pg.wait_for_timeout(900)
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844},has_touch=True);pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL);pg.wait_for_timeout(1500)
    info=pg.evaluate("""(()=>{const f=(t)=>{const r=[...Store.all('concepts'),...Store.all('entities')].filter(r=>vis(r)&&(r.term||r.name)===t&&(r.topicIds||[]).length);return r.map(r=>[r.id,r.entities?'':'',V33.find(r).length,[...new Set(V33.find(r).map(x=>x.t))].length,Store.all('concepts').includes(r)?'concepts':'entities'])};
      return{oruc:f('oruç'),mekke:f('Mekke'),kibir:f('kibir'),dua:f('dua')}})()""")
    print(info)
    multi=max(info['oruc'],key=lambda x:x[2]);rid,_,n,nt,col=multi
    opencard(pg,col,rid)
    ok('A1 kart açıldı ve düğme var',pg.evaluate(f"!!document.querySelector('#kv-{rid} .v33f button:first-child')"))
    cnt=pg.evaluate(f"document.querySelector('#kv-{rid} .v33f span').textContent");ok('A2 eşleşme sayısı kartta gösteriliyor',str(n) in cnt and 'konu' in cnt,cnt)
    pg.locator(f'#kv-{rid} .v33f button:first-child').scroll_into_view_if_needed();pg.locator(f'#kv-{rid} .v33f button:first-child').tap();pg.wait_for_timeout(1500)
    s=pg.evaluate("({view,tab:G.tab,t:G.t,bar:!!document.getElementById('hl33'),marks:document.querySelectorAll('mark.hl33').length,cur:document.querySelectorAll('mark.hl33.cur').length,txt:document.getElementById('hl33')&&document.getElementById('hl33').innerText})")
    print(s);ok('B1 konu açıldı, anlatım sekmesi',s['view']=='topic' and (s['tab'] in('anlat',None)),str(s['tab']))
    ok('B2 vurgular var, tam bir tane güncel',s['marks']>=1 and s['cur']==1)
    ok('B3 çubukta sayı, sınıf/ünite/konu bilgisi',s['bar'] and f'1/{n}' in s['txt'] and 'sınıf' in s['txt'],s['txt'].replace('\n',' | '))
    vis_=pg.evaluate("(()=>{const m=document.querySelector('mark.hl33.cur'),r=m.getBoundingClientRect(),bar=document.getElementById('hl33').getBoundingClientRect(),nav=document.querySelector('.bnav').getBoundingClientRect();return{top:r.top,bot:r.bottom,vh:innerHeight,barBot:bar.bottom,navTop:nav.top,word:m.textContent}})()")
    print(vis_);ok('B4 güncel vurgu görünür alanda (çubuk/gezinmenin altında değil)',vis_['top']>=vis_['barBot']-2 and vis_['bot']<=vis_['navTop']+2)
    ok('B5 vurgulanan metin gerçekten terimle başlıyor (Türkçe katlama)',pg.evaluate("[...document.querySelectorAll('mark.hl33')].every(m=>V33.fold(m.textContent).startsWith('oruc'))"))
    # biçim bozulmadı: vurguları kaldırınca innerHTML aynı
    same=pg.evaluate("""(()=>{const a=[...document.querySelectorAll('article.blk')].map(e=>e.innerHTML.replace(/<\\/?mark[^>]*>/g,''));const html0=a.join('|');const clone=[...document.querySelectorAll('article.blk')].map(e=>{const c=e.cloneNode(true);c.querySelectorAll('mark.hl33').forEach(m=>m.replaceWith(...m.childNodes));c.normalize();return c.innerHTML}).join('|');return [html0.length>0,clone.replace(/<\\/?mark[^>]*>/g,'')===html0]})()""")
    ok('B6 HTML yapısı vurgu dışında aynı',same[0] and same[1])
    # gezinme
    seq=[]
    for i in range(min(n,6)):
        seq.append(pg.evaluate("document.getElementById('hl33').innerText.split('\\n')[0]"));pg.locator('#hl33 button[aria-label="Sonraki eşleşme"]').tap();pg.wait_for_timeout(900)
    print(seq);ok('C1 ileri gezinme sayacı artıyor',seq[0].endswith(f'1/{n}') and seq[1].endswith(f'2/{n}'))
    pg.locator('#hl33 button[aria-label="Önceki eşleşme"]').tap();pg.wait_for_timeout(900)
    ok('C2 geri',pg.evaluate("document.getElementById('hl33').innerText.split('\\n')[0]").endswith(f'6/{n}'))
    # konular arası
    topics=pg.evaluate("[...new Set(V33.hl.M.map(x=>x.t))]");ok('C3 birden fazla konuda eşleşme',len(topics)==nt and nt>1,str(topics))
    # sona kadar git: tüm konulara uğranıyor
    seen=set()
    for i in range(n):
        seen.add(pg.evaluate("G.t"));pg.locator('#hl33 button[aria-label="Sonraki eşleşme"]').tap();pg.wait_for_timeout(700 if i%7 else 1000)
    ok('C4 tüm eşleşme konuları gezildi',len(seen)==nt,f"{len(seen)}/{nt}")
    ok('C5 döngü başa dönüyor',pg.evaluate("document.getElementById('hl33').innerText.split('\\n')[0]").find(' · ')>0)
    # kararlı ID
    ids1=pg.evaluate("V33.hl.M.map(x=>x.id)");ok('D1 kimlikler benzersiz ve kararlı biçimde',len(set(ids1))==len(ids1) and all(i.startswith('HL-') for i in ids1))
    pg.locator('#hl33 button[aria-label="Vurguyu kapat"]').tap();pg.wait_for_timeout(300)
    ok('E1 kapatınca vurgu ve çubuk yok, metin bütün',pg.evaluate("!document.querySelector('mark.hl33')&&!document.getElementById('hl33')"))
    ids2=pg.evaluate(f"V33.find(Store.get('{col}','{rid}')).map(x=>x.id)");ok('D2 aynı arama aynı kimlikleri üretiyor',ids2==ids1,f"{len(ids2)} vs {len(ids1)}")
    # eşleşmesiz
    kb=[x for x in info['kibir']]
    pg.evaluate("go('home')");pg.evaluate("V34.restore('CON-DKAB-4-kibir',1)");kb=[['CON-DKAB-4-kibir','',0,0,'concepts']];kid='CON-DKAB-4-kibir';kcol='concepts';opencard(pg,kcol,kid)
    t=pg.evaluate(f"document.querySelector('#kv-{kid} .v33f span')&&document.querySelector('#kv-{kid} .v33f span').textContent");print('kibir',kb,t)
    pg.locator(f'#kv-{kid} .v33f button:first-child').tap();pg.wait_for_timeout(700)
    msg=pg.evaluate(f"document.querySelector('#kv-{kid} .v33f span').textContent");ok('F1 eşleşme yoksa yönlendirme yok ve bildirim',pg.evaluate("view")!='topic' and ('bulunamadı' in msg or 'yok' in msg),msg)
    # Sheet (kavram bottom sheet) yolu
    pg.evaluate("go('home')");pg.evaluate(f"V30.rec('{col}','{rid}')");pg.wait_for_timeout(700)
    ok('G1 sheet içinde sayı',pg.evaluate("(document.querySelector('.rec30 .v33f span')||{}).textContent||''").find(str(n))>=0)
    pg.evaluate("UI.close()");pg.wait_for_timeout(300)
    # ek ve büyük/küçük harf: sentetik doğrudan eşleyici testleri
    cases=[("Mekke","Mekke’de ve MEKKE'ye gidenler, mekkelilerin",3),("oruç","ORUÇ tutmak, orucun, oruçlu değil, orucunu bozan",3),("iman","imanı, imanlar, imanın; İMAN",4),("zekât","zekat ve ZEKÂTI verdi",2),("hutbe","hutbesini okudu, hutbeler",2),("dua","duası, duaya, duaları, duali",3),("kabile","kabilesinden, kabilelerine, kabil",2),("ışık","IŞIK ve ışığı",1)]
    for term,txt,exp in cases:
        got=pg.evaluate("([t,x])=>V33.scan(x,V33.rx(V33.terms({term:t}))).length",[term,txt])
        ok(f'H {term}: {exp} bekleniyor',got==exp,f"bulunan {got}: {txt}")
    b.close()
print('errs',errs);print('PASS',sum(R.values()),'/',len(R));json.dump(R,open('t/res_dict33.json','w'))
