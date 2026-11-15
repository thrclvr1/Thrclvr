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
R={};errs=[]
def ok(k,v,info=''):R[k]=bool(v);print(('OK  ' if v else 'FAIL'),k,str(info)[:230])
REMOVED=['Genel Konu Haritası','Sınıf ve Ünite','Bağlantı Keşfi','Karşılaştırmalar']
with sync_playwright() as p:
    b=p.chromium.launch()
    def page(w=1366,h=900):
        c=b.new_context(viewport={'width':w,'height':h},has_touch=w<800);pg=c.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'ERR_' not in m.text and 'file:' not in m.text and errs.append(m.text))
        pg.goto(URL);pg.wait_for_timeout(1300);return c,pg
    # 1 sekmeler
    for w in [360,390,768,1024,1440]:
        c,pg=page(w);ev=pg.evaluate
        pg.locator('nav.bnav [data-k=links]').first.click();pg.wait_for_timeout(700)
        tabs=ev("[...document.querySelectorAll('.lk-tabs button')].map(b=>b.textContent.trim())")
        txt=ev("document.getElementById('app').innerText")
        ok(f'1a {w}px: yalnızca “Kavram Haritası | Yönetim”',tabs==['Kavram Haritası','Yönetim'] and not any(r in txt for r in REMOVED) and ev("document.documentElement.scrollWidth<=innerWidth"),tabs)
        c.close()
    c,pg=page();ev=pg.evaluate
    for t in ['harita','sinif','kesif','karsi','xyz']:
        ev(f"go('links',{{lk:{{tab:'{t}',sel:{{type:'topic',id:'TPC-5-1-01'}}}}}})");pg.wait_for_timeout(500)
        ok(f'1b Eski “{t}” girişi bağımsız ekran açmıyor → Kavram Haritası',ev("G.lk.tab")=='kavram' and ev("!document.querySelector('.lkm,.lk-grp,.lk-pick,.lk-cmp,.lk-unit,.lk-trow')") and ev("[...document.querySelectorAll('.lk-tabs button')].length")==2 and ev("!!document.querySelector('.km-gal')"))
    ok('1c Eski ekran fonksiyonlarına giden düğme/menü yok',ev("![...document.querySelectorAll('button,a')].some(e=>/tab:'(harita|sinif|kesif|karsi)'|'kesif'|'karsi'/.test(e.getAttribute('onclick')||''))"))
    # 2 ders sayfası düğmesi
    ev("go('topic',{t:'TPC-6-2-02',tab:'anlat'})");pg.wait_for_timeout(700)
    bt=ev("(()=>{const b=document.querySelector('.lk-see');return b?[b.textContent,b.querySelector('i').textContent]:null})()")
    pg.locator('.lk-see').click();pg.wait_for_timeout(700)
    cards=ev("[...document.querySelectorAll('.km-tc')].map(e=>e.dataset.c)")
    okt=ev("(ids)=>{const L=KMAP.topicConcepts('TPC-6-2-02').map(x=>x.cid);return ids.length===L.length&&ids.every(id=>L.includes(id))}",cards)
    ok('2 Ders sayfasındaki “Kavram Haritası” düğmesi konunun kavramlarını süzüyor',bt and 'Kavram Haritası' in bt[0] and int(bt[1])==len(cards) and okt and ev("G.lk.tab")=='kavram' and ev("!!document.querySelector('.km-topic')"),[bt,len(cards)])
    pg.locator('.km-tf button').first.click();pg.wait_for_timeout(400);ok('2b Konu süzgeci kaldırılabiliyor',not ev("!!document.querySelector('.km-topic')") and ev("document.querySelectorAll('.km-card').length")>0)
    # 3 filtreler
    ev("go('links',{lk:{tab:'kavram',sel:null,t:'',g:'',u:'',py:'2026',q:'',lim:999}})");pg.wait_for_timeout(500)
    pg.select_option('#lk-g','6');pg.wait_for_timeout(500)
    g6=ev("[...document.querySelectorAll('.km-card')].map(c=>c.getAttribute('onclick').match(/'(CON-[^']+)'/)[1])")
    ok('3a Sınıf süzgeci',len(g6)>0 and ev("(ids)=>ids.every(id=>KMAP.C(id).grade===6&&KMAP.C(id).programYear==='2026')",g6),len(g6))
    u=ev("document.querySelector('#lk-u').options[1].value");pg.select_option('#lk-u',u);pg.wait_for_timeout(500)
    gu=ev("[...document.querySelectorAll('.km-card')].map(c=>c.getAttribute('onclick').match(/'(CON-[^']+)'/)[1])")
    ok('3b Ünite süzgeci',0<len(gu)<len(g6) and ev(f"(ids)=>ids.every(id=>[...KMAP.ctopics(id)].some(t=>(V34.TM(t)||{{}}).unitId==='{u}'))",gu),len(gu))
    pg.select_option('#lk-py','2018');pg.wait_for_timeout(500);ok('3c Program süzgeci (2018/2026 ayrı)',ev("[...document.querySelectorAll('.km-card')].every(c=>KMAP.C(c.getAttribute('onclick').match(/'(CON-[^']+)'/)[1]).programYear==='2018')"))
    # 4 kavram haritası özellikleri
    ev("G.kmap=null;go('links',{lk:{tab:'kavram',sel:{type:'concept',id:'CON-DKAB-8-kader'},py:'',g:'',u:'',t:''}})");pg.wait_for_timeout(900)
    ok('4a Ana kavram + dersle ilişkili grup + karıştırılanlar aynı ekranda',ev("!!document.querySelector('.kmr')&&document.querySelectorAll('.kmz .kmn.rel, .kmn.rel').length>0&&!!document.querySelector('.km-cmp .km-cc')&&!!document.querySelector('.kmph')"))
    k=ev("KMAP.RN[0].key");pg.locator(f'.kmn[data-k="{k}"] .kmn-b').click();pg.wait_for_timeout(300);w=ev(f"KMAP.idx.get('{k}').link.why")
    ok('4b Bilgi paneli ve gerekçe',ev("document.querySelector('#km-panel h3').textContent")==ev(f"KMAP.C('{k[2:]}').term") and ev("!!document.querySelector('#km-panel .kmq')"))
    pg.locator("#km-panel button.p:text('İlgili derse git')").click();pg.wait_for_timeout(1000)
    ok('4c İlgili derse git (doğru konu, bölüm, cümle vurgusu)',ev("view")=='topic' and ev("G.t")==w['t'] and ev("!!document.querySelector('mark.km-hl')&&!!document.querySelector('article.km-blk')"))
    pg.locator('#km-bar button.p').click();pg.wait_for_timeout(900);ok('4d Haritaya dönüş ve seçim korunuyor',ev("view")=='links' and ev("G.kmap.sel")==k and ev("G.lk.tab")=='kavram')
    pg.locator('.km-cc button.p').first.click();pg.wait_for_timeout(800);ok('4e Karşılaştırmadan derse (Karışanlar)',ev("view==='topic'&&G.tab==='kar'"))
    c.close()
    # 5 Yönetim kapısı
    c,pg=page();ev=pg.evaluate
    ev("go('links',{lk:{tab:'yonetim'}})");pg.wait_for_timeout(500)
    ok('5a Editör modu açılmadan yönetim içeriği görünmüyor',ev("!!document.querySelector('.kma-gate')&&!document.querySelector('.kma-p')"))
    pg.locator('.kma-gate button.p').click();pg.wait_for_timeout(400)
    ok('5b Editör modunda tek yönetim ekranı ve açılır paneller (alt sekme yok)',ev("document.querySelectorAll('.kma-p').length")==6 and ev("!document.querySelector('.lk-ys')"),ev("[...document.querySelectorAll('.kma-p summary b')].map(x=>x.textContent)"))
    # 6 onay/ret
    ev("""KMAP.ov.links.push({id:'KML_UP1',p:'CON-DKAB-8-kader',c:'CON-DKAB-8-inanc',ty:'alt',why:'öneri',t:null,bi:null,src:'',st:'review'});KMAP.save()""")
    dk=ev("KMAP.related('CON-DKAB-8-kader',new Set(['CON-DKAB-8-kader'])).find(x=>x.origin==='derived'&&x.c!=='CON-DKAB-8-inanc').key")
    ev(f"KMAP.ov.patch['{dk}']={{ty:'alt'}};KMAP.save();V34.renderBody()");pg.wait_for_timeout(300)
    if not ev("document.querySelector('.kma-p[data-p=onay]').open"):pg.locator('.kma-p[data-p=onay] summary').click();pg.wait_for_timeout(400)
    ok('6a İki öneri listede (yönetici + türü değiştirilmiş otomatik)',ev("document.querySelectorAll('.kma-p[data-p=onay] .lk-it').length")==2 and ev("KMAP.pend().length")==2)
    pg.locator('.kma-p[data-p=onay] .lk-it').filter(has_text='yönetici önerisi').locator('button.p').click();pg.wait_for_timeout(400)
    ok('6b Onayla: yönetici önerisi ana ağaca girdi',ev("KMAP.ov.links.find(m=>m.id==='KML_UP1').ed===true") and ev("KMAP.tree('CON-DKAB-8-kader').kids.some(k=>k.cid==='CON-DKAB-8-inanc')"))
    x=ev(f"(()=>{{const x=KMAP.findLink('{dk}');return[x.p,x.c]}})()")
    pg.locator('.kma-p[data-p=onay] .lk-it button.p').nth(1).click();pg.wait_for_timeout(400)
    nm=ev("KMAP.ov.links.find(m=>m.from)")
    ok('6c Otomatik öneri seçilen yönle onaylandı (yeni yönetici kaydı, otomatik bağlantı silinmedi)',nm and nm['ed'] and nm['p']==x[1] and nm['c']==x[0] and ev(f"!!KMAP.findLink('{dk}')") and ev(f"!KMAP.ov.patch['{dk}']"),nm)
    ev("KMAP.ov.links.push({id:'KML_UP2',p:'CON-DKAB-8-kader',c:'CON-DKAB-8-yasa',ty:'parca',why:'öneri2',st:'review'});KMAP.save();V34.renderBody()");pg.wait_for_timeout(300)
    pg.locator('.kma-p[data-p=onay] .lk-it button:text("Reddet")').first.click();pg.wait_for_timeout(300)
    ok('6d Reddet: öneri kaldırıldı, otomatik bağlantılar duruyor',not ev("KMAP.ov.links.some(m=>m.id==='KML_UP2')") and ev("(()=>{let n=0;KMAP.adj().forEach((L)=>L.forEach(x=>{if(x.p<x.c&&x.origin==='derived')n++}));return n})()")==978)
    # 7 V34 kayıt düzenle/kaldır
    pg.locator('.kma-p[data-p=liste] summary').click();pg.wait_for_timeout(500)
    rid=ev("document.querySelector('.kma-p[data-p=liste] [data-rid]').dataset.rid");n0=ev("V34.load().R.length")
    pg.locator(f'[data-rid="{rid}"] button:text("Kaldır")').click();pg.wait_for_timeout(400)
    ok('7a Kayıt kaldırıldı (yalnızca katmanda) ve geri alınabiliyor',ev("V34.load().R.length")==n0-1 and ev(f"V34.ov.del.includes('{rid}')"))
    ev(f"V34.undel('{rid}')");ok('7b Geri al',ev("V34.load().R.length")==n0)
    ev(f"V34.edit('{rid}')");pg.wait_for_timeout(400);pg.fill("form.lk-form textarea[name=d] >> nth=-1","düzenlendi 343");pg.locator("form.lk-form button[type=submit]").last.click();pg.wait_for_timeout(400)
    ok('7c Kayıt düzenlendi',ev(f"V34.load().byId.get('{rid}').description")=='düzenlendi 343')
    ev(f"delete V34.ov.patch['{rid}'];V34.save()")
    # 8 hata paneli
    ev("KMAP.ov.links.push({id:'KML_UBAD',p:'CON-YOK',c:'CON-DKAB-8-kader',ty:'alt',why:'x',st:'verified'});KMAP.save();V34.S().open=['hata'];V34.renderBody()");pg.wait_for_timeout(300)
    t=ev("document.querySelector('.kma-p[data-p=hata]').innerText")
    ok('8 Kaynak ve veri hataları: bozuk kavram ve kaynaksız “Kaynaklı” tespit edildi','kavram bulunamadı' in t and 'Kaynaksız' in t,t[:150])
    ev("KMAP.ov.links=KMAP.ov.links.filter(m=>m.id!=='KML_UBAD');KMAP.save()")
    # 9 gizli + sözlük notu
    ev("go('kavram')");pg.wait_for_timeout(500);pg.locator('.v34-hn a').click();pg.wait_for_timeout(600)
    ok('9a Sözlük notu → Yönetim, gizli kayıt paneli açık',ev("G.lk.tab")=='yonetim' and ev("document.querySelector('.kma-p[data-p=gizli]').open"))
    ev("V34.restore('CON-DKAB-4-hamt',1)");ok('9b Geri getir',ev("Store.all('concepts').some(c=>c.id==='CON-DKAB-4-hamt')"));ev("V34.restore('CON-DKAB-4-hamt',0)")
    pg.locator('.kma-top button').click();pg.wait_for_timeout(300);ok('5c Editör modundan çıkış',ev("!!document.querySelector('.kma-gate')"))
    c.close()
    # 10 veri
    c,pg=page();ev=pg.evaluate
    ok('10a Açılışta localStorage değişmiyor',ev("Object.keys(localStorage).filter(k=>k.startsWith('dk')).sort()")==[] or ev("localStorage.getItem('dk-km')===null&&localStorage.getItem('dk-rel')===null"))
    ok('10b 988 kavram bağlantısı, 2610 bağlantı kaydı, 1121 kavram, 246 konu',ev("(()=>{let n=0;KMAP.adj().forEach(L=>L.forEach(x=>{if(x.p<x.c)n++}));return[n,V34.load().R.length,Store.allRaw('concepts').length,Store.all('topics').length]})()")==[988,2610,1121,246])
    c.close();b.close()
h2=open('/home/claude/work/din-kulturu-platformu-v34.2.html',encoding='utf-8').read();h3=open('/home/claude/work/din-kulturu-platformu-v36.0.html',encoding='utf-8').read()
def blk(h,i):k=h.index(f'id="{i}">');return h[k:h.index('</script>',k)]
_d=_diff36(h2,h3)
ok('10c Veri blokları V34.2 ile aynı (ayrıştırılmış; V36 boşluksuz yazım); fark yalnızca V36 düzeltme kayıtlarında',_d==_EXP36,sorted(_d^_EXP36))
ok('10d V34.2 / V34.1 / V34 dosyaları değişmedi (V34.4 derlemesinde)',[hashlib.md5(open('/home/claude/work/din-kulturu-platformu-%s.html'%v,'rb').read()).hexdigest() for v in['v34.2','v34.1','v34']]==['90f08052427af73199792c4ff8be64f3','8f7da88517b281b94a54fc2a2749d02f','569d48d389a522f2da2c99476dba9774'])
print('errs',errs);print('PASS',sum(R.values()),'/',len(R));json.dump(R,open('t/res_v343.json','w'),ensure_ascii=False)
