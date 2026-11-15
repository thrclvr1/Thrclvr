import json,re,glob,os,tempfile,unicodedata,openpyxl
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
URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
R={};errs=[]
def ok(k,v,info=''):R[k]=bool(v);print(('OK  ' if v else 'FAIL'),k,str(info)[:400])
# --- Excel'i bağımsız olarak oku (birleştirilmiş hücreler doldurulur) ---
def grid(f):
    ws=openpyxl.load_workbook(f,data_only=True).worksheets[0];G=[[c.value for c in r] for r in ws.iter_rows()]
    for m in ws.merged_cells.ranges:
        v=G[m.min_row-1][m.min_col-1]
        for r in range(m.min_row,m.max_row+1):
            for c in range(m.min_col,m.max_col+1):G[r-1][c-1]=v
    G=[[('' if v is None else str(v)) for v in r] for r in G]
    # V36 uyarlaması: kullanıcı talimatıyla yapılan düzeltmeler Excel beklentisine de uygulanır (yalnız ilgili dosyada)
    C36={'dkab8.xlsx':[('Ayetelkürsi','Ayet el-Kürsi')],'dkab12.xlsx':[('Nisa suresi 136. ayette verilen mesajları değerlendirir.','Nisâ suresi 69. ayette verilen mesajları değerlendirir.'),('Nisa Suresi 136. Ayet','Nisa Suresi 69. Ayet')],
         'dkab11_TYMM.xlsx':[('sebeplerini sonuçlarını','sebeplerini-sonuçlarını')],'dkab5_TYMM.xlsx':[('MİMARİMİZDEKİ DİNÎ MOTİFLER','MİMARİMİZDE DİNÎ MOTİFLER')],'dkab6_TYMM.xlsx':[('KÜLTÜRÜMÜZDE DİNİ MOTİFLER','KÜLTÜRÜMÜZDEKİ DİNÎ MOTİFLER')]}
    for k,L in C36.items():
        if f.endswith(k):G=[[_c36(x,L) for x in r] for r in G]
    return G
def _c36(x,L):
    for a,b in L:x=x.replace(a,b)
    return x
ws_=lambda t:re.sub(r'\s+',' ',t or '').strip()
def nz(t):
    t=unicodedata.normalize('NFC',t or '').replace('İ','i').replace('I','ı').lower()
    t=re.sub(r'\((?:c\.?\s?c\.?|s\.?a\.?v\.?|a\.?s\.?)\)','',t);t=re.sub(r'[’\'`´"“”]','',t);t=t.replace('â','a').replace('î','i').replace('û','u')
    return re.sub(r'[^0-9a-zçğıöşü]+',' ',t).strip()
AY='ocak şubat mart nisan mayıs haziran temmuz ağustos eylül ekim kasım aralık'.split()
def dkey(lbl):  # "14-18 Eylül" / "28 Eylül - 2 Ekim" -> (14,'eyl',18,'eki')
    t=lbl.split(':',1)[-1];m=re.search(r'(\d+)\s*([^\d\s-]+)?\s*-\s*(\d+)\s*([^\d\s]+)',t)
    a,ma,b,mb=m.groups();mb=mb.replace('İ','i').lower()[:3];ma=(ma.replace('İ','i').lower()[:3] if ma else mb);return (int(a),ma,int(b),mb)
def ukey(s):  # "02–06 Kasım" / "28 Eyl–2 Eki"
    m=re.match(r'(\d+)\s*([^\d\s–]+)?\s*–\s*(\d+)\s*(\S+)',s);a,ma,b,mb=m.groups();mb=mb.lower()[:3];ma=(ma.lower()[:3] if ma else mb);return (int(a),ma,int(b),mb)
strip_codes=lambda t:re.sub(r'(?m)(DKAB\.\d+\.\d+\.\d+\.?|^\s*\d+\s*\.)','',t)
FILES=sorted(glob.glob('/home/claude/work/v350/src/*.xlsx'))
with sync_playwright() as p:
    b=_sess36(p.chromium.launch())
    c=b.new_context(viewport={'width':1366,'height':900},accept_downloads=True);pg=c.new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'ERR_' not in m.text and 'file:' not in m.text and errs.append(m.text))
    pg.goto(URL);pg.wait_for_timeout(800);ev=pg.evaluate
    CL=[{'g':int(re.search(r'dkab(\d+)',f).group(1)),'py':'2026' if 'TYMM' in f else '2018'} for f in FILES]
    ev("a=>localStorage.setItem('dk-ogretmen-v1',a)",json.dumps({"v":1,"app":"dkab-ogretmen","classes":CL,"active":"4|2018","status":{},"plans":[],"updatedAt":None}));pg.reload();pg.wait_for_timeout(1300)
    pg.click('#app .og-home');pg.wait_for_timeout(300)
    allres={}
    for f in FILES:
        g=int(re.search(r'dkab(\d+)',f).group(1));py='2026' if 'TYMM' in f else '2018';k=f'{g}|{py}';G=grid(f)
        ev(f"OGRT.d.active='{k}';OGRT.S().tab='hafta';OGRT.render();document.querySelectorAll('.ogw-c').forEach(d=>d.open=true)")
        cards=ev("[...document.querySelectorAll('.ogw-wk')].map(e=>[+e.dataset.wk,e.dataset.no,e.querySelector('small').textContent,e.querySelector('b').textContent])")
        byno={int(x[1]):x for x in cards if x[1]}
        C=dict(h=1,s=2,u=3,k=4,z=6,a=7) if py=='2026' else dict(h=1,s=2,u=3,k=5,z=6,a=7)
        fails=[];occ={};rows=0;hol=0
        for r in G:
            h=r[1].strip()
            if not h or h.startswith('Bu çerçeve'):continue
            if 'TATİL' in h.upper():
                hol+=1;mm=re.search(r'(\d+)\s*([^\d\s-]+)?\s*-\s*(\d+)\s*([^\d\s]+)\s*(\d{4})',h)
                import datetime
                AYN={'oca':1,'şub':2,'mar':3,'nis':4,'may':5,'haz':6,'eyl':9,'eki':10,'kas':11,'ara':12}
                d1,m1,d2,m2,yy=mm.groups();m2n=AYN[m2.replace('İ','i').lower()[:3]];m1n=AYN[m1.replace('İ','i').lower()[:3]] if m1 else m2n
                y2=int(yy);y1=y2 if m1n<=m2n else y2-1;st=datetime.date(y1,m1n,int(d1)).isoformat();en=datetime.date(y2,m2n,int(d2)).isoformat()
                L=ev("OGRT.W.weeks('2026-2027')");inw=[w for w in L if w['mon']>=st and w['fri']<=en]
                if not inw:fails.append(('tatil haftası yok',h[:30]));continue
                for w in inw:
                    ev(f"OGRT.W.go({w['n']})");t=ev("[(document.querySelector('.ogw-hol')||{}).innerText||'',document.querySelectorAll('.ogw-k').length,document.querySelector('.ogw-wk.on').dataset.no]")
                    if 'tatil' not in nz(t[0]) or t[1]!=0 or t[2]!='':fails.append(('tatil içerik',h[:30],t))
                ev(f"OGRT.W.go({inw[0]['n']})");t=ev("(document.querySelector('.ogw-hol')||{}).innerText||''")
                if nz(h.split(':')[0]) not in nz(t):fails.append(('tatil adı',h[:30],t[:60]))
                continue
            m=re.match(r'(\d+)\.\s*Hafta',h)
            if not m:continue
            n=int(m.group(1));rows+=1
            if n not in byno:fails.append(('hafta yok',n));continue
            cw,_,small,bt=byno[n]
            if ukey(small)!=dkey(h) or bt!=f'{n}. Hafta':fails.append(('tarih',n,small,h));continue
            ev(f"OGRT.W.go({cw});document.querySelectorAll('.ogw-c').forEach(d=>d.open=true)")
            ui=ev("""(()=>{const g=s=>[...document.querySelectorAll('.ogw-c.c-'+s+' .ogw-cv .ogw-l')].map(e=>e.textContent.trim());return{u:g('unite'),k:g('konu'),z:[...document.querySelectorAll('.ogw-k')].map(e=>[e.dataset.oid,e.querySelector('.ogw-kt').textContent.trim()]),a:(document.querySelector('.ogw-pre')||{}).textContent||'',oz:(document.querySelector('.ogw-ozel')||{}).innerText||''}})()""")
            z=r[C['z']];U=(z+' '+r[C['u']]).upper()
            if 'SOSYAL ETKİNLİK' in U or 'OKUL TEMELLİ PLANLAMA' in U:
                want='Sosyal etkinlik' if 'SOSYAL' in U else 'Okul temelli planlama'
                if want not in ui['oz'] or ui['z']:fails.append(('özel hafta',n,ui['oz'][:30],len(ui['z'])))
                continue
            if ui['u']!=[ws_(r[C['u']])]:fails.append(('ünite',n,ui['u'],ws_(r[C['u']])))
            if ui['k']!=[ws_(r[C['k']])]:fails.append(('konu',n,ui['k'],ws_(r[C['k']])))
            uiz=nz(' '.join(re.sub(r'^\S+\.\s*','',t) for _,t in ui['z']))
            if uiz!=nz(strip_codes(z)):fails.append(('kazanım',n,uiz[:60],nz(strip_codes(z))[:60]))
            if ws_(r[C['a']]) and ws_(ui['a'])!=ws_(r[C['a']]):fails.append(('açıklama',n,ws_(ui['a'])[:50],ws_(r[C['a']])[:50]))
            for oid,_ in ui['z']:occ.setdefault(oid,[]).append(n)
        # tekrarlanan kazanımlar: arayüzdeki "haftaları" listesi = Excel'deki haftalar
        rep=[];ev("OGRT.W.go(1)")
        for oid,ns in occ.items():
            if len(ns)>1:
                ev(f"OGRT.W.go({byno[ns[0]][0]})");t=ev(f"([...document.querySelectorAll('.ogw-k[data-oid=\"{oid}\"] p')].find(e=>e.textContent.includes('Bu kazanımın haftaları'))||{{}}).textContent||''")
                got=[int(x) for x in re.findall(r'(\d+)\.',t.split(':')[-1])]
                if got!=ns:rep.append((oid,ns,got))
        cov=ev(f"OGRT.allOuts({g},'{py}').map(o=>o.id)")
        allres[k]=dict(rows=rows,hol=hol,fails=fails,rep=rep,missing=[o for o in cov if o not in occ],lessonCards=len(byno),cards=len(cards))
    for k,v in allres.items():
        ok(f'Yıllık plan ↔ uygulama · {k}: {v["rows"]} ders haftası + {v["hol"]} tatil, hafta hafta tarih/ünite/konu/kazanım/açıklama/tatil; tekrarlanan kazanımlar; eksik kazanım yok',v['rows']==37 and v['hol']==3 and not v['fails'] and not v['rep'] and not v['missing'] and v['lessonCards']==37 and v['cards']==41,(v['fails'][:3],v['rep'][:2],v['missing'][:3]))
    # 2026 4/8/12: dosya yok → dağılım yok
    ev("OGRT.d.classes.push({g:4,py:'2026'},{g:8,py:'2026'},{g:12,py:'2026'});OGRT.d.active='8|2026';OGRT.render()")
    nf=ev("[!OGRT.W.hasPlan(8,'2026','2026-2027'),document.querySelector('.ogw-auto').innerText]")
    ok('Dosyası olmayan sınıf/program (4·8·12 · 2026 programı) için dağılım uydurulmuyor ve bu belirtiliyor',nf[0] and 'yıllık plan dosyası yok' in nf[1],nf)
    ev("OGRT.d=OGRT.load();OGRT.render()")
    b.close()
print(json.dumps({'pass':sum(R.values()),'total':len(R)}))
