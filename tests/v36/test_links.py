import json,sys
from playwright.sync_api import sync_playwright
URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
R={};errs=[]
def ok(k,v,info=''):R[k]=(bool(v),info);print(('OK  ' if v else 'FAIL'),k,info)
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page()
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.goto(URL);pg.wait_for_timeout(1200)
    # Abbas
    pg.evaluate("V30.rec('entities','ENT-DKAB-9-kisi-abbas')");pg.wait_for_timeout(500)
    t=pg.evaluate("document.querySelector('.rec30').innerText")
    ok('L1 Abbas kaydı: sınıf/program/kitap sayfası/konu gösteriliyor','9. sınıf' in t and '2026' in t and 'Kitap s. 161' in t and 'Hz. Muhammed' in t,t.replace('\n',' | ')[:300])
    ok('L1b Abbas: Abdullah bin Abbas bilgisi','Abdullah bin Abbas' in t)
    pg.screenshot(path='shots32/abbas390.png')
    pg.click('.rec30 .v31-tl button');pg.wait_for_timeout(900)
    st=pg.evaluate("({v:view,t:G.t,tab:G.tab})")
    ok('L2 Abbas → konu anlatım sekmesi açılıyor',st['v']=='topic' and st['t']=='TPC-9-5-02' and st['tab']=='anlat',str(st))
    # 10. sınıf Abbas'ın
    pg.evaluate("V30.rec('entities','ENT-DKAB-10-kisi-abbas-in')");pg.wait_for_timeout(400)
    t2=pg.evaluate("document.querySelector('.rec30').innerText")
    ok('L3 Abbas’ın (10. sınıf, farklı kişi) başka konuya bağlı','TPC-10' in pg.evaluate("Store.get('entities','ENT-DKAB-10-kisi-abbas-in').topicIds[0]") and 'amcası' in t2,t2.replace('\n',' | ')[:220]);pg.evaluate("UI.close()")
    # tüm kayıtlar
    res=pg.evaluate("""(()=>{const out={tot:0,linked:0,multi:0,none:0,review:0,bad:[],byType:{}};for(const col of['concepts','entities']){for(const r of Store.all(col)){out.tot++;const T=(r.topicIds||[]);if(r.linkStatus==='dogrulandi-kaynak'&&T.length){out.linked++;if(T.length>1)out.multi++;for(const id of T){const t=Store.get('topics',id);if(!t||t.grade!==r.grade||t.programYear!==r.programYear)out.bad.push(r.id+'>'+id)}}else if(r.linkStatus==='inceleme-bekliyor')out.review++;else out.none++}}return out})()""")
    ok('L4 tüm bağlantılarda sınıf+program tutarlı',len(res['bad'])==0,json.dumps(res,ensure_ascii=False)[:300])
    json.dump(res,open('t360/out/res_links.json','w'),ensure_ascii=False)
    # çoklu konu kaydı
    mid=pg.evaluate("Store.all('entities').find(e=>(e.topicIds||[]).length>=3&&e.linkStatus==='dogrulandi-kaynak').id")
    pg.evaluate(f"V30.rec('entities','{mid}')");pg.wait_for_timeout(400)
    n=pg.evaluate("document.querySelectorAll('.rec30 .v31-tl button').length");exp=min(12,pg.evaluate(f"Store.get('entities','{mid}').topicIds.length"))
    ok('L5 çoklu konulu kayıt liste olarak gösteriliyor',n==exp and n>=3,f"{mid}: {n}/{exp}")
    pg.evaluate("UI.close()")
    # inceleme ve bağlantısız
    pg.evaluate("V30.rec('entities','ENT-DKAB-9-eser-zebur')");pg.wait_for_timeout(400)
    ok('L6 incelemede bekleyen kayıt dürüstçe işaretli','inceleme bekliyor' in pg.evaluate("document.querySelector('.rec30').innerText").lower());pg.evaluate("UI.close()")
    nid=pg.evaluate("(Store.all('entities').concat(Store.all('concepts'))).find(r=>r.linkStatus==='baglanti-bulunamadi').id");col='entities' if nid.startswith('ENT') else 'concepts'
    pg.evaluate(f"V30.rec('{col}','{nid}')");pg.wait_for_timeout(400)
    ok('L7 bağlantısız kayıt: “Konuya bağlanamadı”',('Konuya bağlanamadı' in pg.evaluate("document.querySelector('.rec30').innerText")),nid);pg.evaluate("UI.close()")
    # konu → kavram → başka konu → geri
    tid=pg.evaluate("Store.all('topics').find(t=>t.sections&&t.conceptIds&&t.conceptIds.length>2).id")
    pg.evaluate(f"go('home')");pg.wait_for_timeout(300)
    pg.evaluate(f"go('topic',{{t:'{tid}',tab:'anlat'}})");pg.wait_for_timeout(900)
    nx=pg.evaluate("document.querySelectorAll('#tb a.xl').length")
    ok('L8 konu anlatımında tıklanabilir kavram/kişi/eser adları var',nx>0,str(nx))
    if nx:
        pg.evaluate("document.querySelector('#tb a.xl').click()");pg.wait_for_timeout(500)
        ok('L9 addan kayıt penceresi açılıyor',pg.evaluate("!!document.querySelector('.rec30')"))
        # başka konuya geç (varsa)
        other=pg.evaluate(f"(()=>{{const b=[...document.querySelectorAll('.rec30 .v31-tl button')].find(x=>!x.getAttribute('onclick').includes('{tid}'));return b?b.querySelector('b').textContent:null}})()")
        if other:
            pg.evaluate(f"[...document.querySelectorAll('.rec30 .v31-tl button')].find(x=>!x.getAttribute('onclick').includes('{tid}')).click()");pg.wait_for_timeout(1000)
            t2=pg.evaluate("G.t");ok('L10 kavramdan başka konuya geçiş',t2!=tid,f"{tid}→{t2}")
            pg.go_back();pg.wait_for_timeout(900)
            ok('L11 geri tuşu önceki konuya dönüyor',pg.evaluate("G.t")==tid,pg.evaluate("G.t"))
        else:ok('L10 kavramdan başka konuya geçiş (bu kavram tek konulu; atlandı)',True)
    # sözlük ↔ konu
    pg.evaluate("go('kisi')");pg.wait_for_timeout(700)
    eid=pg.evaluate("Store.all('entities').find(e=>e.type==='kisi'&&(e.topicIds||[]).length&&V33.find(e).length).id");eti=pg.evaluate(f"Store.get('entities','{eid}').topicIds")
    pg.evaluate(f"V30.openDict('entities','{eid}')");pg.wait_for_timeout(900)
    ok('L12 sözlükte kayıt açılıyor ve konuya gidiyor',pg.evaluate(f"!!document.querySelector('#kv-{eid}[open]')"),eid)
    pg.evaluate(f"document.querySelector('#kv-{eid} .v31-tl button').click()");pg.wait_for_timeout(900)
    ok('L13 sözlükten konuya',pg.evaluate("view")=='topic' and pg.evaluate("G.t") in eti,pg.evaluate("G.t"))
    # konudan sözlüğe: kavram penceresinden "Sözlükte aç"
    pg.evaluate("V30.rec('concepts',Store.all('concepts').find(c=>c.topicIds.length).id)");pg.wait_for_timeout(400)
    pg.evaluate("[...document.querySelectorAll('.v-sf button')].find(b=>/Sözlükte aç/.test(b.textContent)).click()");pg.wait_for_timeout(900)
    ok('L14 konudan/pencereden sözlüğe geçiş',pg.evaluate("view")in('kavram','kisi'),pg.evaluate("view"))
    print([e for e in errs if 'ERR_TUNNEL' not in e and 'fonts' not in e][:6])
    b.close()
print(sum(1 for v in R.values() if v[0]),'/',len(R));json.dump(R,open('t360/out/res_links_tests.json','w'),ensure_ascii=False,indent=1)
