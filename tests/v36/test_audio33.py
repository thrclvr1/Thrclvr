import json,os,shutil,subprocess,time,wave,struct,math,random
from playwright.sync_api import sync_playwright
W='/home/claude/work/';T='/tmp/claude-0/-home-claude/af43b156-3860-514b-88f7-812ca2e32c8e/scratchpad/srv33/'
shutil.rmtree(T,ignore_errors=True);os.makedirs(T+'assets/audio')
shutil.copy(W+'din-kulturu-platformu-v36.0.html',T+'index.html')
# GEÇİCİ test dosyası (teslim edilmez): 4 sn yumuşak sinüs+gürültü
w=wave.open(T+'assets/audio/test.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(22050)
random.seed(1);w.writeframes(b''.join(struct.pack('<h',int(6000*math.sin(i*2*math.pi*220/22050)+random.randint(-800,800))) for i in range(22050*4)));w.close()
good=dict(id="t1",file="test.wav",title="TEST kaydı",artist="test",sourceUrl="http://localhost/test",license="TEST-ONLY",commercialUse=True,attribution="-",downloadDate="2026-11-10",category="enstruman",distribution=True)
bad1=dict(good,id="t2",license="");bad2=dict(good,id="t3",commercialUse=False)
json.dump({"items":[good,bad1,bad2]},open(T+'assets/audio/manifest.json','w'))
srv=subprocess.Popen(['python3','-m','http.server','8733','--bind','127.0.0.1'],cwd=T,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
R={};errs=[]
def ok(k,v,info=''):R[k]=bool(v);print(('OK  ' if v else 'FAIL'),k,info)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']);ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page()
  pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
  # eski kayıtlı durumda kaldırılmış sesler: temizlenmeli
  pg.add_init_script("""if(!localStorage.getItem('seeded')){localStorage.setItem('seeded','1');localStorage.setItem('dk-atm',JSON.stringify({vol:.5,L:[{id:'ney',v:.6,on:true},{id:'yagmur',v:.5,on:true}],name:'x',saved:[{id:'s1',n:'eski',L:[['kanun',.5]]},{id:'s2',n:'iyi',L:[['orman',.5],['ney',.4]]}],fav:['ney','dere'],favMix:[],queue:[],rep:'one',segMin:15,tab:'sesler'}))}""")
  pg.goto('http://127.0.0.1:8733/index.html');pg.wait_for_timeout(1500)
  ok('A0 açılışta ses yok',pg.evaluate("ATM.rt.ctx===null&&!ATM.live()"))
  ok('A1 sentetik enstrümanlar kaldırıldı',pg.evaluate("!['calm','ney','kanun','ezgi','koro','isik','ambient','derin'].some(i=>ATM.byId(i))"))
  st=pg.evaluate("ATM.st");ok('A2 eski kayıt temizlendi (ney yok, yağmur kaldı, favori dere kaldı)',[l['id'] for l in st['L']]==['yagmur'] and st['fav']==['dere'] and [m['id'] for m in st['saved']]==['s2'] and st['saved'][0]['L']==[['orman',.5]],str(st['L'])+str(st['fav']))
  ok('A3 harici kayıt: geçerli yüklendi, eksik lisans ve ticari-izinsiz reddedildi',pg.evaluate("ATM.byId('x_t1')&&!ATM.byId('x_t2')&&!ATM.byId('x_t3')&&V33.ext.list.filter(x=>x.bad).length===2"))
  pg.click('.h30-atm');pg.wait_for_timeout(600)
  heads=pg.evaluate("[...document.querySelectorAll('.atm-h')].map(h=>h.textContent)");ok('B0 kategoriler',any('Doğa' in h for h in heads) and any('enstrümantal' in h for h in heads) and any('Diğer' in h for h in heads),str(heads))
  ids=pg.evaluate("ATM.S.map(s=>s.id)")
  for sid in ids:
    pg.evaluate(f"ATM.loadMix([['{sid}',.8]],'t',true)")
    pg.wait_for_function(f"ATM.rt.nodes['{sid}']&&!ATM.rt.nodes['{sid}'].loading",timeout=20000);pg.wait_for_timeout(700)
    r=pg.evaluate(f"""(()=>{{const R=ATM.rt,n=R.nodes['{sid}'];const d=new Uint8Array(128);let mx=0;for(let k=0;k<12;k++){{n.an.getByteTimeDomainData(d);let s=0;for(const v of d){{const x=(v-128)/128;s+=x*x}}mx=Math.max(mx,Math.sqrt(s/128))}};return{{state:R.ctx.state,live:mx,src:!!n.src}}}})()""")
    ok(f'S {sid} çalıyor',r['state']=='running' and r['live']>0.004 and r['src'],f"{r['live']:.3f}")
  pg.evaluate("ATM.stopAll()");pg.wait_for_timeout(300);ok('C1 durdur',pg.evaluate("!ATM.live()&&Object.values(ATM.rt.nodes).every(n=>!n.src)"))
  pg.evaluate("ATM.loadMix([['yagmur',.7],['kus',.5]],'k',true)");pg.wait_for_timeout(2000)
  pg.evaluate("ATM.setMaster(.2)");pg.wait_for_timeout(700);g1=pg.evaluate("ATM.rt.master.gain.value");pg.evaluate("ATM.setMaster(.9)");pg.wait_for_timeout(700);g2=pg.evaluate("ATM.rt.master.gain.value")
  ok('C2 ses seviyesi',g1<g2 and abs(g1-.2)<.1 and abs(g2-.9)<.15,f"{g1:.2f}->{g2:.2f}")
  pg.evaluate("ATM.toggleSound('dere')") if False else None
  pg.evaluate("ATM.setLayerOn('kus',false)");pg.wait_for_timeout(600);ok('C3 ses değiştirme/kapatma',pg.evaluate("ATM.rt.nodes.kus.g.gain.value")<.05)
  pg.evaluate("ATM.setTimer(1)");ok('C4 zamanlayıcı kuruldu',pg.evaluate("ATM.rt.tEnd>Date.now()+50000&&ATM.rt.tEnd<Date.now()+61000"))
  pg.evaluate("ATM.rt.tEnd=Date.now()+400;clearTimeout(ATM.rt.tTimer);ATM.rt.tTimer=setTimeout(ATM.timerDone,400)");pg.wait_for_timeout(8000)
  ok('C5 süre bitince yumuşakça kapandı (duraklatıldı)',pg.evaluate("ATM.rt.paused&&!ATM.rt.playing"),pg.evaluate("JSON.stringify([ATM.rt.playing,ATM.rt.paused])"))
  pg.evaluate("ATM.stopAll()")
  pg.reload();pg.wait_for_timeout(1200);ok('D1 tercih saklandı, açılışta çalmıyor',pg.evaluate("ATM.rt.ctx===null&&!ATM.live()&&ATM.st.vol>0"))
  pg.click('.h30-atm');pg.wait_for_timeout(500);pg.evaluate("ATM.st.tab='kaynak';ATM.paint()");pg.wait_for_timeout(300)
  ok('E1 envanter sekmesi: kayıtlı + sentez alanları',pg.evaluate("document.querySelectorAll('.atm-lic details').length")==ATM.__len__() if False else pg.evaluate("document.querySelectorAll('.atm-lic details').length===ATM.S.length"))
  pg.evaluate("ATM.st.tab='sesler';ATM.paint()");pg.wait_for_timeout(300)
  ok('E2 enstrüman kategorisinde kayıt görünüyor',pg.evaluate("[...document.querySelectorAll('.atm-sc')].some(e=>/TEST kaydı/.test(e.textContent))"))
  b.close()
  # harici dosya yokken: boş durum
  b=p.chromium.launch();pg=b.new_page();pg.goto('file://'+W+'din-kulturu-platformu-v36.0.html');pg.wait_for_timeout(1200);pg.click('.h30-atm');pg.wait_for_timeout(500)
  ok('F1 gerçek kayıt yokken dürüst boş durum',pg.evaluate("/Henüz lisanslı gerçek enstrüman kaydı eklenmedi/.test(document.body.textContent)"));b.close()
finally: srv.terminate()
print('errs',errs);print('PASS',sum(R.values()),'/',len(R))
json.dump(R,open('t/res_audio33.json','w'))
