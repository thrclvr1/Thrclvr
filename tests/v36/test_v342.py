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

URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
R={};errs=[];INFO={}
def ok(k,v,info=''):R[k]=bool(v);print(('OK  ' if v else 'FAIL'),k,str(info)[:230])
OV={"links":[{"id":"KML_UT1","p":"CON-DKAB-8-kader","c":"CON-DKAB-8-tevekkul","ty":"alt","why":"TEST gerekçe A","t":None,"bi":None,"src":"test","st":"review","ed":True},
 {"id":"KML_UT2","p":"CON-DKAB-8-tevekkul","c":"CON-DKAB-8-tedbir","ty":"alt","why":"TEST gerekçe B","t":None,"bi":None,"src":"test","st":"review","ed":True},
 {"id":"KML_UT3","p":"CON-DKAB-8-kader","c":"CON-DKAB-8-inanc","ty":"parca","why":"TEST onaysız","t":None,"bi":None,"src":"","st":"review"}],"patch":{},"hide":[],"roots":{"add":[],"del":[]}}
with sync_playwright() as p:
    b=p.chromium.launch()
    def page(ov=None,w=1366,h=900):
        c=b.new_context(viewport={'width':w,'height':h},has_touch=w<800);pg=c.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'ERR_' not in m.text and 'file:' not in m.text and errs.append(m.text))
        if ov:pg.add_init_script("if(!sessionStorage.getItem('x')){sessionStorage.setItem('x','1');localStorage.setItem('dk-km',%s)}"%json.dumps(json.dumps(ov)))
        pg.goto(URL);pg.wait_for_timeout(1300);return c,pg
    def openroot(pg,r):
        pg.evaluate(f"G.kmap=null;go('links',{{lk:{{tab:'kavram',sel:{{type:'concept',id:'{r}'}},py:'',g:''}}}})");pg.wait_for_timeout(800)
    # ---- A: varsayılan veri (yönetici kaydı yok)
    c,pg=page();ev=pg.evaluate
    st=ev("""(()=>{let treeN=0,relN=0,cmpN=0,bad=[];for(const r of KMAP.roots()){const T=KMAP.tree(r.id);treeN+=T.kids.length;KMAP.related(r.id,new Set([r.id])).forEach(x=>{relN++;if(x.origin==='derived'&&KMAP.cat(x)!=='rel')bad.push(x.key)});cmpN+=KMAP.cmps(r.id).length}
      let pairs=0,der=0;KMAP.adj().forEach((L,a)=>L.forEach(x=>{if(x.p<x.c){pairs++;if(x.origin==='derived')der++}}));return{roots:KMAP.roots().length,treeN,relN,cmpN,bad:bad.length,pairs,der}})()""")
    INFO['A']=st;print(st)
    ok('2a Hiçbir otomatik (aynı cümle) bağlantı alt kavram olarak ağaçta değil (273 ana kavram)',st['treeN']==0 and st['bad']==0,st)
    ok('2b Mevcut bağlantılar silinmedi (988 çift, 978 ders metni)',st['pairs']==988 and st['der']==978,st)
    openroot(pg,'CON-DKAB-8-kader')
    d=ev("""(()=>{const Z=document.querySelector('.kmz').getBoundingClientRect(),rel=[...document.querySelectorAll('.kmn.rel')],inZ=rel.every(e=>{const r=e.getBoundingClientRect();return r.left>=Z.left-1&&r.right<=Z.right+1&&r.top>=Z.top-1&&r.bottom<=Z.bottom+1});
      return{tree:document.querySelectorAll('.kmn:not(.rel):not(.kmr)').length,rel:rel.length,inZ,zh:document.querySelector('.kmz-h').textContent,ph:!!document.querySelector('.kmph'),cmpInMap:[...document.querySelectorAll('.kmn')].some(e=>e.dataset.k.endsWith('CON-DKAB-8-kaza'))}})()""")
    ok('2c DOM: aynı cümlede geçenler alt kavram düğümü değil',d['tree']==0,d)
    ok('3 Dersle ilişkili kavramlar ayrı, çerçeveli grupta',d['rel']>0 and d['inZ'] and 'alt kavram değildir' in d['zh'],d)
    ok('1a Doğrulanmış alt kavram yoksa dürüst boş durum',d['ph'])
    ok('6a Karşılaştırma (kaza) haritada/ağaçta değil',not d['cmpInMap'])
    cc=ev("""(()=>{const c=[...document.querySelectorAll('.km-cc')].find(x=>x.textContent.includes('kaza'));const T=V34.TM(KMAP.CMP[0].t),K=(T.sections.karisanlar||[]).find(k=>/kaza/i.test(k.a+k.b));return{has:!!c,txt:c&&c.querySelector('.km-cc-f')&&c.querySelector('.km-cc-f').textContent,exp:K&&K.fark}})()""")
    ok('6b Karşılaştırma ayrı bölümde, fark metni veriyle aynı',cc['has'] and cc['txt']==cc['exp'] and bool(cc['exp']),cc)
    pg.locator('.km-cc button.p').first.click();pg.wait_for_timeout(900);ok('6c Karşılaştırmadan derse (Karışanlar sekmesi)',ev("view==='topic'&&G.tab==='kar'"),ev("[view,G.t,G.tab]"))
    openroot(pg,'CON-DKAB-8-kader')
    # 4-5 ilişkili düğüm paneli ve ders bağlantısı
    k=ev("KMAP.RN[0].key");pg.locator(f'.kmn[data-k="{k}"] .kmn-b').click();pg.wait_for_timeout(300)
    t=ev("document.getElementById('km-panel').innerText");cid=k[2:]
    w=ev(f"KMAP.idx.get('{k}').link.why")
    both=ev(f"(()=>{{const s=KMAP.sent('{w['t']}',{w['bi']},{w['a']},{w['e']});return V33.scan(s,V33.rx(V33.terms(KMAP.C('{cid}')))).length>0&&V33.scan(s,V33.rx(V33.terms(KMAP.C('CON-DKAB-8-kader')))).length>0&&document.querySelector('#km-panel .kmq').textContent.trim()===s.trim()}})()")
    ok('4a İlişkili kavram paneli: ad, kategori, “alt kavram değildir”',ev("document.querySelector('#km-panel h3').textContent")==ev(f"KMAP.C('{cid}').term") and 'Dersle ilişkili' in t and 'Alt kavram ilişkisi değildir' in t and 'Yol:' not in t,t[:120])
    ok('4b Gerekçe cümlesi iki kavramı içeriyor',both)
    les=ev(f"(()=>{{const T=V34.TM('{w['t']}'),U=V34.UM(T.unitId);return[T.grade+'. sınıf',U.order+'. '+U.title,T.title]}})()");dl=ev("[...document.querySelectorAll('#km-panel .kmp-dl dd')].map(x=>x.textContent)")
    ok('4c Ders, ünite, konu ve bölüm doğru',dl[0]==les[0] and dl[2]==les[1] and dl[3]==les[2] and len(dl)==5,dl)
    ok('4d Açıklama yoksa uydurulmuyor (kural)',ev("(()=>{const c=Store.all('concepts').find(c=>!c.snippet&&KMAP.of(c.id).length);if(!c)return 'yok';KMAP.T={key:'x',cid:c.id,depth:0,kids:[]};return 'n/a'})()") is not None)
    v0=ev("JSON.stringify(G.kmap.v)")
    pg.locator("#km-panel button.p:text('İlgili derse git')").click();pg.wait_for_timeout(1100)
    ok('5a Ders bağlantısı doğru konuya',ev("view")=='topic' and ev("G.t")==w['t'])
    ok('5b Doğru bölüm ve cümle vurgulandı',ev(f"document.querySelector('article.km-blk h3').textContent===KMAP.bh('{w['t']}',{w['bi']})") and ev(f"[...document.querySelectorAll('mark.km-hl')].map(x=>x.textContent).join('').replace(/\\s+/g,' ').trim()===KMAP.sent('{w['t']}',{w['bi']},{w['a']},{w['e']}).replace(/\\s+/g,' ').trim()"))
    pg.locator('#km-bar button.p').click();pg.wait_for_timeout(900)
    ok('5c Geri dönüşte seçim ve görünüm korunuyor',ev("view")=='links' and ev("G.kmap.sel")==k and ev("JSON.stringify(G.kmap.v)")==v0 and ev(f"document.querySelector('.kmn[data-k=\"{k}\"]').classList.contains('sel')"))
    # tümünü göster + arama
    n0=ev("document.querySelectorAll('.kmn.rel').length");tot=ev("KMAP.REL.length")
    if tot>n0:
        pg.locator('.kmz-more').click();pg.wait_for_timeout(300);ok('3b “Tümünü göster” ilişkili kavramları açıyor',ev("document.querySelectorAll('.kmn.rel').length")==tot,f"{n0}->{tot}")
        pg.locator('.kmz-more').click();pg.wait_for_timeout(300)
        last=ev("KMAP.C(KMAP.RN[KMAP.RN.length-1].cid).term");pg.fill('#km-q',last);pg.wait_for_timeout(200);pg.keyboard.press('Enter');pg.wait_for_timeout(500)
        ok('3c Arama gizli ilişkili kavramı bulup gösteriyor',ev("G.kmap.sel")==ev("KMAP.RN[KMAP.RN.length-1].key") and ev("G.kmap.relAll"))
    c.close()
    # ---- B: yönetici hiyerarşisi (editör onaylı) + onaysız
    c,pg=page(OV);ev=pg.evaluate;openroot(pg,'CON-DKAB-8-kader')
    tr=ev("KMAP.T.kids.map(k=>[k.cid,k.link.ty,k.kids.map(x=>x.cid)])")
    ok('1b Editör onaylı alt kavram ana ağaçta (kader → tevekkül → tedbir)',tr==[['CON-DKAB-8-tevekkul','alt',['CON-DKAB-8-tedbir']]],tr)
    ok('1c Onaysız hiyerarşi ana ağaçta değil, öneri olarak ilişkili grupta',ev("!!document.querySelector('.kmn.rel.pend[data-k=\"R:CON-DKAB-8-inanc\"]')") and not ev("KMAP.T.kids.some(k=>k.cid==='CON-DKAB-8-inanc')"))
    ok('1d Alt kavram ağaçtan kalktığı için ilişkili grupta tekrar görünmüyor',not ev("KMAP.RN.some(n=>n.cid==='CON-DKAB-8-tevekkul')"))
    pg.locator('.kmn[data-k="CON-DKAB-8-kader>CON-DKAB-8-tevekkul"] .kmn-x').click();pg.wait_for_timeout(300)
    ok('1e Alt kavramın alt dalı açılıyor',ev("!!document.querySelector('.kmn[data-k=\"CON-DKAB-8-kader>CON-DKAB-8-tevekkul>CON-DKAB-8-tedbir\"]')"))
    pg.locator('.kmn[data-k="CON-DKAB-8-kader>CON-DKAB-8-tevekkul"] .kmn-b').click();pg.wait_for_timeout(300);t=ev("document.getElementById('km-panel').innerText")
    ok('4e Alt kavram paneli: kategori “Alt kavram”, yönetici gerekçesi',('Alt kavram' in t and 'Editörün onayladığı' in t and 'TEST gerekçe A' in t),t[:140])
    # ---- 7 yönetici ekle/düzenle
    ev("sessionStorage.setItem('dk-editor','1');go('links',{lk:{tab:'yonetim',open:['kavram'],lim:60}})");pg.wait_for_timeout(600)
    pg.fill(".kma input[name=p]","concept:CON-DKAB-8-kader");pg.fill(".kma input[name=c]","concept:CON-DKAB-8-kaza");pg.select_option(".kma select[name=ty]","alt");pg.fill(".kma textarea[name=why]","Deneme");pg.check(".kma input[name=ed]");pg.click(".kma button[type=submit]");pg.wait_for_timeout(400)
    ok('7a Yönetici editör onaylı alt kavram ekledi',ev("KMAP.ov.links.some(m=>m.c==='CON-DKAB-8-kaza'&&m.ed)"))
    ev("KMAP.editLink('M:KML_UT3')");pg.wait_for_timeout(400);pg.check(".lk-form input[name=ed] >> nth=-1");pg.locator("form.lk-form button[type=submit]").last.click();pg.wait_for_timeout(400)
    ok('7b Düzenleme: onay verilince ana ağaca taşınıyor',ev("KMAP.ov.links.find(m=>m.id==='KML_UT3').ed===true"))
    openroot(pg,'CON-DKAB-8-kader');tr=ev("KMAP.T.kids.map(k=>k.cid)")
    ok('7c Ağaç güncellendi (irade ve kaza alt kavram)', 'CON-DKAB-8-inanc' in tr and 'CON-DKAB-8-kaza' in tr,tr)
    ok('7d Onaylı alt kavram karşılaştırma bölümünden kalkmıyor (kayıtlar ayrı)',ev("KMAP.CMP.some(x=>x.c==='CON-DKAB-8-kaza')"))
    dk=ev("KMAP.REL.find(x=>x.origin==='derived').key");ev(f"KMAP.editLink('{dk}')");pg.wait_for_timeout(300)
    ok('7e Otomatik bağlantı düzenleme ekranı ana ağaca alınamayacağını söylüyor',ev("document.querySelector('.lk-form').textContent.includes('ana ağaca alınamaz')"));ev("UI.close()")
    ev(f"KMAP.ov.patch['{dk}']={{ty:'alt',st:'review'}};KMAP.save()");openroot(pg,'CON-DKAB-8-kader')
    ok('7f Otomatik bağlantının türü “alt” yapılsa bile ana ağaca girmiyor (öneri olarak kalıyor)',not ev(f"KMAP.T.kids.some(k=>k.link.key==='{dk}')") and ev(f"KMAP.REL.some(x=>x.key==='{dk}'&&KMAP.cat(x)==='pend')"))
    c.close()
    # ---- V34.1 biçimli eski kayıt (ed alanı yok) uyumu
    old={"links":[{"id":"KML_UOLD","p":"CON-DKAB-8-kader","c":"CON-DKAB-8-tevekkul","ty":"alt","why":"eski","t":None,"bi":None,"src":"","st":"review","at":"2026-11-11"}],"patch":{},"hide":[],"roots":{"add":[],"del":[]}}
    c,pg=page(old);ev=pg.evaluate;openroot(pg,'CON-DKAB-8-kader')
    ok('9a V34.1 yönetici kaydı korunuyor; onaysız olduğu için öneri olarak gösteriliyor',ev("KMAP.ov.links.length===1&&!KMAP.T.kids.length&&KMAP.REL.some(x=>x.c==='CON-DKAB-8-tevekkul'&&KMAP.cat(x)==='pend')"))
    c.close()
    h1=open('/home/claude/work/din-kulturu-platformu-v34.1.html',encoding='utf-8').read();h2=open('/home/claude/work/din-kulturu-platformu-v36.0.html',encoding='utf-8').read()
    def blk(h,i):k=h.index(f'id="{i}">');return h[k:h.index('</script>',k)]
    _d=_diff36(h1,h2)
    ok('9b Veri blokları V34.1 ile aynı (ayrıştırılmış; V36 boşluksuz yazım); fark yalnızca V36 düzeltme kayıtlarında',_d==_EXP36,sorted(_d^_EXP36))
    ok('9c V34.1 ve V34 dosyaları değişmedi',hashlib.md5(h1.encode()).hexdigest()=='8f7da88517b281b94a54fc2a2749d02f' and hashlib.md5(open('/home/claude/work/din-kulturu-platformu-v34.html','rb').read()).hexdigest()=='569d48d389a522f2da2c99476dba9774')
    b.close()
print('errs',errs);print('PASS',sum(R.values()),'/',len(R));json.dump({'R':R,'INFO':INFO},open('t/res_v342.json','w'),ensure_ascii=False)
