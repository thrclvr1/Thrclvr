import json,re,hashlib,sys
W='/home/claude/work/';V=W+'v360/'
md=lambda f:hashlib.md5(open(W+f,'rb').read()).hexdigest()
OLD=['din-kulturu-platformu-v35.0.html','din-kulturu-platformu-v34.9.html','din-kulturu-platformu-v34.8.html','din-kulturu-platformu-v34.7.html','din-kulturu-platformu-v34.6.html','din-kulturu-platformu-v34.5.html']
keep={f:md(f) for f in OLD}
h=open(W+'din-kulturu-platformu-v35.0.html',encoding='utf-8').read()
LOG=[]
def rep(a,b,cnt=1,what=''):
    global h
    n=h.count(a);assert n==cnt,(what,n,a[:120]);h=h.replace(a,b);LOG.append(f'{what}: {n} yer')
def seed_get(id_):
    m=re.search(r'<script type="application/json" id="%s">'%id_,h);e=h.index('</script>',m.end());return m.end(),e,json.loads(h[m.end():e])
def seed_put(id_,obj):
    global h
    a,e,_=seed_get(id_);s=json.dumps(obj,ensure_ascii=False,separators=(',',':'));assert '</script' not in s.lower();h=h[:a]+s+h[e:]
FIX=[]
def fix(rec,field,old,new,label):
    v=rec[field]
    if isinstance(v,str):
        assert old in v,(label,field,old,v[:120]);rec[field]=v.replace(old,new);FIX.append((label,field,v.count(old)))
    elif isinstance(v,list):
        n=0
        for i,x in enumerate(v):
            if isinstance(x,str) and old in x:v[i]=x.replace(old,new);n+=x.count(old)
            elif isinstance(x,dict):
                for k,y in x.items():
                    if isinstance(y,str) and old in y:x[k]=y.replace(old,new);n+=y.count(old)
        assert n,(label,field,old);FIX.append((label,field,n))
    elif isinstance(v,dict):
        s=json.dumps(v,ensure_ascii=False);assert old in s,(label,field,old);n=s.count(old);rec[field]=json.loads(s.replace(old,new));FIX.append((label,field,n))
# ---------------- 1. Müfredat ve yazım düzeltmeleri ----------------
_,_,CUR=seed_get('seed-curriculum');_,_,REL=seed_get('seed-rel');_,_,YP=seed_get('seed-yp')
byid=lambda col,i:next(r for r in CUR[col] if r.get('id')==i)
# (1) 11.4.3 · "sebeplerinisonuçlarını" → "sebeplerini-sonuçlarını"
o=byid('outcomes','DKAB-11-U04-O03');fix(o,'title','sebeplerinisonuçlarını','sebeplerini-sonuçlarını','11.4.3');fix(o,'description','sebeplerinisonuçlarını','sebeplerini-sonuçlarını','11.4.3')
r=next(x for x in REL['relations'] if 'sebeplerinisonuçlarını' in x.get('description',''));fix(r,'description','sebeplerinisonuçlarını','sebeplerini-sonuçlarını','11.4.3 ilişki')
for w in YP['plans']['11|2026']['weeks']:
    if 'DKAB-11-U04-O03' in w['oids']:
        i=w['oids'].index('DKAB-11-U04-O03');assert 'sebeplerini sonuçlarını' in w['kt'][i];w['kt'][i]=w['kt'][i].replace('sebeplerini sonuçlarını','sebeplerini-sonuçlarını');FIX.append(('11.4.3 yıllık plan hafta %d'%w['no'],'kt',1))
# (2) 8.1.6 (2018) · "Ayetelkürsi" → "Ayet el-Kürsi" (yalnızca 2018 programına bağlı kayıtlar; 2026 TYMM kayıtları kendi yazımıyla kalır)
assert "Ayet el-Kürsi" in byid('outcomes','DKAB18-8-U01-O06')['title']
def ayet(rec,label):
    s=json.dumps(rec,ensure_ascii=False);n=s.count('Ayetelkürsi');assert n,label
    new=json.loads(s.replace('Ayetelkürsi','Ayet el-Kürsi'));rec.clear();rec.update(new);FIX.append((label,'*',n))
for col,i in [('topicsV2','TPC18-8-1-05'),('topicsV2','TPC18-4-2-01'),('questionsV2','Q25-TPC18-8-1-05-01'),('questionsV2','Q25-TPC18-8-1-05-02'),('questionsV2','Q25-TPC18-8-1-05-03'),('gamesV2','GM30-BK-8-2018')]:
    rec=byid(col,i);assert rec.get('programYear')=='2018',i;ayet(rec,'8.1.6 '+i)
for w in YP['plans']['8|2018']['weeks']:
    if 'DKAB18-8-U01-O06' in w['oids']:
        for k in ['konu','ac']:
            if 'Ayetelkürsi' in w[k]:w[k]=w[k].replace('Ayetelkürsi','Ayet el-Kürsi');FIX.append(('8.1.6 yıllık plan hafta %d'%w['no'],k,1))
        i=w['oids'].index('DKAB18-8-U01-O06');assert 'Ayetelkürsi' in w['kt'][i];w['kt'][i]=w['kt'][i].replace('Ayetelkürsi','Ayet el-Kürsi');FIX.append(('8.1.6 yıllık plan hafta %d'%w['no'],'kt',1))
# (3) 5. sınıf 5. ünite · (4) 6. sınıf 5. ünite — uygulama verisi zaten doğru; yıllık plan gösterimindeki yazım programla eşitlenir
assert byid('units','DKAB-5-U05')['title']=='MİMARİMİZDE DİNÎ MOTİFLER' and byid('units','DKAB-6-U05')['title']=='KÜLTÜRÜMÜZDEKİ DİNÎ MOTİFLER'
for key,old,new in [('5|2026','MİMARİMİZDEKİ DİNÎ MOTİFLER','MİMARİMİZDE DİNÎ MOTİFLER'),('6|2026','KÜLTÜRÜMÜZDE DİNİ MOTİFLER','KÜLTÜRÜMÜZDEKİ DİNÎ MOTİFLER')]:
    n=0
    for w in YP['plans'][key]['weeks']:
        if old in w['unite']:w['unite']=w['unite'].replace(old,new);n+=1
    assert n;FIX.append((key+' 5. ünite adı (yıllık plan)','unite',n))
# (5) 10. sınıf 5. ünite adı tamamlanır
u=byid('units','DKAB-10-U05');assert u['title']=='İSLAM DÜŞÜNCESİNDE İTİKADİ-SİYASİ VE FIKHİ';u['title']='İSLAM DÜŞÜNCESİNDE İTİKADİ-SİYASİ VE FIKHİ YORUMLAR';FIX.append(('10. sınıf 5. ünite','title',1))
g=byid('gamesV2','GM28-DKAB-10-U05-dogru');fix(g,'title','İSLAM DÜŞÜNCESİNDE İTİKADİ-SİYASİ VE FIKHİ ·','İSLAM DÜŞÜNCESİNDE İTİKADİ-SİYASİ VE FIKHİ YORUMLAR ·','10. sınıf 5. ünite oyun başlığı')
# (6) 12.2.3 · Nisa suresi 136. ayet → 69. ayet (ders kitabı ve resmî program esas; uygulama verisi zaten 69)
o=byid('outcomes','DKAB18-12-U02-O03');assert '69. ayet' in o['title'],o['title']
for w in YP['plans']['12|2018']['weeks']:
    if 'DKAB18-12-U02-O03' in w['oids']:
        i=w['oids'].index('DKAB18-12-U02-O03');assert w['kt'][i]=='Nisa suresi 136. ayette verilen mesajları değerlendirir.';w['kt'][i]=o['title'];FIX.append(('12.2.3 yıllık plan hafta %d'%w['no'],'kt',1))
        assert 'Nisa Suresi 136. Ayet' in w['konu'];w['konu']=w['konu'].replace('Nisa Suresi 136. Ayet','Nisa Suresi 69. Ayet');FIX.append(('12.2.3 yıllık plan hafta %d'%w['no'],'konu',1))
YP['corrections']={'version':'V36.0','note':'Kullanıcı talimatıyla düzeltildi: 11.4.3 yazım, 8.1.6 Ayet el-Kürsi, 5/6. sınıf 5. ünite adı yazımı, 12.2.3 Nisa 69. ayet (Excel 136 hatalı kaynak bilgisi).'}
seed_put('seed-curriculum',CUR);seed_put('seed-rel',REL);seed_put('seed-yp',YP)
_,_,SD=seed_get('seed-sd');seed_put('seed-sd',SD)   # yalnızca boşluklar kaldırılır (içerik aynı)
# ---------------- 1b. Eksik veri ifadeleri (kaynak ayrımı korunarak) ----------------
rep('"Bu haftanın ders saati yıllık planda yazılmamış"','"Ders saati: Yıllık plan Excel\'inde veri bulunmuyor."',what='eksik ders saati')
rep('<p class="small mut">Yıllık planda bu hafta için açıklama yazılmamış. Aşağıda programdaki kazanım açıklaması var.</p>','<p class="small mut"><b>Yıllık plan Excel\'inde veri bulunmuyor.</b> Aşağıda ayrı kaynak olarak öğretim programındaki kazanım açıklaması gösteriliyor.</p>',what='eksik açıklama')
rep('<span class="ogw-l mut">Bu kazanımlara bağlı konu kaydı yok.</span>','<span class="ogw-l mut">Kaynakta veri bulunmuyor.</span>',what='eksik konu')
rep('<p class="small mut">Yıllık planda bu hafta kazanım yazılmamış${','<p class="small mut">Yıllık plan Excel\'inde bu haftaya kazanım verilmemiş${',what='özel hafta ifadesi')
# ---------------- 2. Veri erişimi: Store önbelleği ----------------
rep(' all(c){const seen=new Set();return (SEED[COL[c].f]||[]).concat(this.ov.added[c]||[]).filter(r=>{if(seen.has(r.id))return false;seen.add(r.id);return true}).map(r=>this.ov.patch[r.id]?{...r,...this.ov.patch[r.id]}:r)},\n get(c,id){return this.all(c).find(r=>r.id===id)},',
 ' _v:0,_c:{},_E:Object.freeze([]),\n /* V36: koleksiyon önbelleği. Kaynak dizi, eklenenler, yamalar ve kayıt sürümü (_v, her save() ile artar) değişmedikçe yeniden kurulmaz; dışarıya her zaman kopya verilir. */\n _rows(c){const S=SEED[COL[c].f]||Store._E,A=this.ov.added[c]||Store._E,P=this.ov.patch,k=this._c[c];if(k&&k.s===S&&k.sl===S.length&&k.a===A&&k.al===A.length&&k.p===P&&k.v===this._v)return k;const seen=new Set(),r=S.concat(A).filter(x=>{if(seen.has(x.id))return false;seen.add(x.id);return true}).map(x=>P[x.id]?{...x,...P[x.id]}:x);return this._c[c]={s:S,sl:S.length,a:A,al:A.length,p:P,v:this._v,r,m:null}},\n all(c){return this._rows(c).r.slice()},\n get(c,id){const k=this._rows(c);if(!k.m){k.m=new Map();k.r.forEach(x=>{if(!k.m.has(x.id))k.m.set(x.id,x)})}return k.m.get(id)},',what='Store önbelleği')
rep(' save(){try{localStorage.setItem("dk2",JSON.stringify(this.ov))}catch(e){}},',' save(){this._v++;try{localStorage.setItem("dk2",JSON.stringify(this.ov))}catch(e){}},',what='Store.save sürümü')
rep('Store.get=function(c,id){return all.call(this,c).find(r=>r.id===id)}})();','Store.get=function(c,id){return Store.__get36(c,id)}})();',what='V34 Store.get dizinli')
rep('const Store={ov:{added:{},patch:{},raw:[],prog:{},cards:{}},','const Store={ov:{added:{},patch:{},raw:[],prog:{},cards:{}},\n __get36(c,id){const k=this._rows(c);if(!k.m){k.m=new Map();k.r.forEach(x=>{if(!k.m.has(x.id))k.m.set(x.id,x)})}return k.m.get(id)},',what='Store dizin yardımcısı')
# ---------------- 2b. Çizim sonrası düzen zorlamaları ----------------
rep('els.forEach(e=>{const r=e.getBoundingClientRect();e.style.setProperty("--i",r.top<innerHeight?Math.min(k++,9):0);e.classList.add("rv");V30.io.observe(e)});',
    'const T36=els.map(e=>e.getBoundingClientRect().top);els.forEach((e,i)=>{e.style.setProperty("--i",T36[i]<innerHeight?Math.min(k++,9):0);e.classList.add("rv");V30.io.observe(e)});',what='reveal: önce okuma sonra yazma')
rep('V30.setHH=function(){const h=document.querySelector("header.top");if(h)document.documentElement.style.setProperty("--hh",h.offsetHeight+"px")};',
    'V30.setHH=function(){const h=document.querySelector("header.top");if(!h)return;const de=document.documentElement;if(typeof ResizeObserver==="undefined"){de.style.setProperty("--hh",h.offsetHeight+"px");return}if(V30._hhro!==h){V30._hhro=h;V30._hhv=h.offsetHeight+"px";new ResizeObserver(es=>{const b=es[0].borderBoxSize&&es[0].borderBoxSize[0];V30._hhv=Math.round(b?b.blockSize:es[0].contentRect.height)+"px"}).observe(h)}if(V30._hhv!==V30._hhw){V30._hhw=V30._hhv;de.style.setProperty("--hh",V30._hhv)}};',what='üst çubuk yüksekliği ResizeObserver')
rep('Store.all=function(c){const L=all.apply(this,arguments);if(c!=="concepts"&&c!=="entities")return L;const H=V34.hid();return H.size?L.filter(r=>!H.has(r.id)):L};',
    'Store.all=function(c){if(c!=="concepts"&&c!=="entities")return all.apply(this,arguments);const H=V34.hid(),k=Store._rows(c);if(k.h!==H||!k.f){k.h=H;k.f=H.size?k.r.filter(r=>!H.has(r.id)):k.r}return k.f.slice()};',what='gizli kavram süzgeci önbelleği')
# ---------------- 3. Açılış: eski arayüz yerine ilk boyamada açılış ekranı ----------------
s192=re.search(r'"s192":\s*"(data:image/png;base64,[A-Za-z0-9+/=]+)"',h).group(1)
rep('<body>\n<header class="top">','<body>\n<div id="boot36" role="presentation"><img src="'+s192+'" alt="" width="148" height="148"><p>Din Kültürü Öğrenme Platformu</p></div>\n<header class="top">',what='açılış ekranı')
rep(' try{if(sessionStorage.getItem("dk-splash"))return;sessionStorage.setItem("dk-splash","1")}catch(e){}\n const sp=document.createElement("div");sp.id="splash31";',' /* V36: ikinci (geç) açılış ekranı kaldırıldı; açılışı #boot36 karşılar */ return;\n const sp=document.createElement("div");sp.id="splash31";',what='geç splash kapatıldı')
rep('\ndraw();\n</script></body></html>','\ndraw();try{V36.boot()}catch(e){var b36=document.getElementById("boot36");if(b36)b36.remove()}\n</script></body></html>',what='ilk çizimden sonra açılış ekranı kaldırılır')
# Google Fonts: render-blocking → engellemeyen yükleme (çevrimdışında ilk boyamayı bekletmez; yazı tipi gelince yerine geçer)
rep('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;0,7..72,700;0,7..72,800;1,7..72,400&display=swap">',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;0,7..72,700;0,7..72,800;1,7..72,400&display=swap" media="print" onload="this.media=\'all\'">',what='yazı tipi engellemeyen')
# ---------------- 4. Kaydırma: parallax değişkeni yalnızca gerektiğinde ----------------
rep('de.style.setProperty("--sy",Math.min(y,1200));de.style.setProperty("--sp",Math.min(1,y/110).toFixed(3));',
    'const sy=Math.min(y,1200),sp=Math.min(1,y/110).toFixed(3);if(sy!==V30._sy&&(sy<=900||V30._sy<=900)){V30._sy=sy;de.style.setProperty("--sy",sy)}if(sp!==V30._sp){V30._sp=sp;de.style.setProperty("--sp",sp)}',what='kaydırma değişkenleri')
# ---------------- 5. Tabu: yalnızca görünüm ----------------
rep('<div class="fbd">${it.forbidden.map(w=>`<span>${esc(w)}</span>`).join("")}</div>','<div class="fbd">${it.forbidden.map(w=>`<span><i>YASAKLI</i>${esc(w)}</span>`).join("")}</div>',what='Tabu yasaklı etiketi')
# ---------------- 6. V36 modülü ----------------
DEF=hashlib.sha256('dkab36|v36-varsayilan|1999'.encode()).hexdigest()
js=open(V+'v360.js',encoding='utf-8').read().replace('__DEF_HASH__',DEF);assert '1999' not in js
css=open(V+'v360.css',encoding='utf-8').read()
a=h.index('</style></head><body>');h=h[:a]+css+h[a:]
k=h.index('/* ===== V31 son ===== */');h=h[:k]+js+'\n'+h[k:]
rep('V31.VER="V35.0"','V31.VER="V36.0"',cnt=h.count('V31.VER="V35.0"'),what='sürüm')
open(W+'din-kulturu-platformu-v36.0.html','w',encoding='utf-8').write(h)
for f,m in keep.items():assert md(f)==m,f
json.dump({'log':LOG,'fix':FIX},open(V+'build_log.json','w'),ensure_ascii=False,indent=1)
print(len(h),'bayt');print('\n'.join(LOG));print('düzeltmeler:',len(FIX));print('eski dosyalar değişmedi')
