/* ===================== V40.2: koridor tek çizim yüzeyinde (WebGL) =====================
   Neden: V40.0/V40.1'de koridor ~190 ayrı CSS 3B katmanıydı. Gerçek telefonda (Android Chrome) kamera hareket
   ederken tarayıcı bu katmanları yeniden çizmeye yetişemiyor, çizilemeyen yerlerde koyu zemin rengi görünüyordu
   (tavan/duvar/zeminde siyah bölgeler, içi çizilmemiş bilgi kartı). Renk ayarı bunu çözmez.
   Çözüm: bütün koridor tek bir <canvas> üzerinde, küçük ve özel bir WebGL çizicisiyle çizilir (hazır 3B motor yok).
   - Derinlik tamponu: yüzey sıralaması/kesişmesi sorunu yok. Yakın düzlem kırpması GPU'da.
   - Dokular canvas 2B ile bir kez üretilir, ekran kartına yüklenir; ışık dokulara işlenmiştir (aydınlık, sıcak).
   - Kapılar yine gerçek <button> öğeleridir: her karede kapının ekrandaki kutusuna yerleştirilen saydam düğmeler.
   - Kamera pozları, modlar, sürükleme, klavye, giriş/çıkış mantığı V40.0 kodudur; yalnızca V40.sahneHTML ve V40.uygula
     bu modülde yeniden tanımlanır. Kapı durumu yine düğme sınıflarından okunur (sec, kis, yak, acik, an0).
   - WebGL yoksa ya da kurulamazsa V40.1'deki CSS koridoru aynen kullanılır (konsola uyarı yazılır). */
(function(){
const GL=V40.GL={aktif:false,hazir:false,kap:[],T:{},son:0,durum:{kaynak:"bekliyor",hata:[]}};
const eski={sahne:V40.sahneHTML,uygula:V40.uygula,init:V40.init,tex:V40.texUygula,olc:V40.olc};
V40.VER="V40.2";
const uyar=(m,e)=>{GL.durum.hata.push(m+(e?": "+((e&&e.message)||e):""));try{console.warn("[V40.2] "+m+(e?": "+((e&&e.message)||e):""))}catch(_){}};

/* ---------- 1. WebGL çekirdeği ---------- */
const VS="attribute vec3 aP;attribute vec2 aT;attribute float aL;uniform vec3 uC;uniform vec2 uR;uniform vec4 uJ;varying vec2 vT;varying float vL;varying float vD;"+
 "void main(){vec3 d=aP-uC;float xc=d.x*uR.y+d.z*uR.x;float ds=d.x*uR.x-d.z*uR.y;vT=aT;vL=aL;vD=ds;gl_Position=vec4(xc*uJ.x,-d.y*uJ.y+uJ.z*ds,ds*1.0057-40.11,ds);}";
const FS="precision mediump float;varying vec2 vT;varying float vL;varying float vD;uniform sampler2D uS;uniform float uK;uniform float uE;uniform vec3 uF;"+
 "void main(){vec4 c=texture2D(uS,vT);if(c.a<uK)discard;if(uE>0.5){gl_FragColor=vec4(c.rgb*c.a*vL,1.0);}else{vec3 k=c.rgb*vL;float f=clamp((vD-1200.0)/5200.0,0.0,0.16);gl_FragColor=vec4(mix(k,uF,f),1.0);}}";
GL.destek=function(){if(GL._d!=null)return GL._d;try{const cv=document.createElement("canvas");cv.className="gl40";cv.setAttribute("aria-hidden","true");
  const o={alpha:false,antialias:true,depth:true,stencil:false,preserveDrawingBuffer:false,powerPreference:"default"},g=cv.getContext("webgl",o)||cv.getContext("experimental-webgl",o);
  if(!g)throw new Error("WebGL bağlamı alınamadı");const sh=(t,s)=>{const x=g.createShader(t);g.shaderSource(x,s);g.compileShader(x);if(!g.getShaderParameter(x,g.COMPILE_STATUS))throw new Error("gölgelendirici: "+g.getShaderInfoLog(x));return x};
  const p=g.createProgram();g.attachShader(p,sh(g.VERTEX_SHADER,VS));g.attachShader(p,sh(g.FRAGMENT_SHADER,FS));g.linkProgram(p);if(!g.getProgramParameter(p,g.LINK_STATUS))throw new Error("program: "+g.getProgramInfoLog(p));g.useProgram(p);
  GL.cv=cv;GL.g=g;GL.p=p;GL.a={P:g.getAttribLocation(p,"aP"),T:g.getAttribLocation(p,"aT"),L:g.getAttribLocation(p,"aL")};GL.u={};["uC","uR","uJ","uS","uK","uE","uF"].forEach(n=>GL.u[n]=g.getUniformLocation(p,n));
  GL.an=g.getExtension("EXT_texture_filter_anisotropic")||g.getExtension("WEBKIT_EXT_texture_filter_anisotropic");GL.dyn=g.createBuffer();
  cv.addEventListener("webglcontextlost",e=>{e.preventDefault();GL.hazir=false;GL.kayip=true;uyar("WebGL bağlamı kaybedildi")});
  cv.addEventListener("webglcontextrestored",()=>{GL._d=null;GL.kayip=false;GL.T={};try{if(view==="pdunya")draw()}catch(_){}});
  GL._d=true}catch(e){GL._d=false;uyar("WebGL kullanılamıyor; CSS koridoru kullanılacak",e)}return GL._d};
GL.doku=function(ad,cv){const g=GL.g,t=g.createTexture();g.bindTexture(g.TEXTURE_2D,t);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,cv);g.generateMipmap(g.TEXTURE_2D);
 g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR_MIPMAP_LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.REPEAT);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.REPEAT);
 if(GL.an)g.texParameterf(g.TEXTURE_2D,GL.an.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,g.getParameter(GL.an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)||1));GL.T[ad]=t};
/* dörtgen: sol-üst, sağ-üst, sağ-alt, sol-alt köşeler; uv: [u0,v0,u1,v1]; l: ışık çarpanı */
const dort=(A,p,uv,l)=>{const [u0,v0,u1,v1]=uv,V=[[0,u0,v0],[1,u1,v0],[2,u1,v1],[0,u0,v0],[2,u1,v1],[3,u0,v1]];for(const [i,u,v] of V)A.push(p[i*3],p[i*3+1],p[i*3+2],u,v,l)};
GL.bagla=function(buf){const g=GL.g;g.bindBuffer(g.ARRAY_BUFFER,buf);g.enableVertexAttribArray(GL.a.P);g.vertexAttribPointer(GL.a.P,3,g.FLOAT,false,24,0);g.enableVertexAttribArray(GL.a.T);g.vertexAttribPointer(GL.a.T,2,g.FLOAT,false,24,12);g.enableVertexAttribArray(GL.a.L);g.vertexAttribPointer(GL.a.L,1,g.FLOAT,false,24,20)};

/* ---------- 2. Geometri ---------- */
const X=V40.X,FY=V40.FY,CY=V40.CY,L=V40.L,ZS=V40.ZS,DW=V40.DW,DH=V40.DH,AR=V40.AR,ES=V40.ES;
/* kapının yerel ekseni: O = açıklığın sol-üst köşesi (duvar düzleminde), ux = kapı boyunca, n = koridora doğru */
GL.eksen=function(k){const y=FY-DH-ES;if(k.side<0)return{O:[-X,y,k.z+DW/2],ux:[0,0,-1],n:[1,0,0]};if(k.side>0)return{O:[X,y,k.z-DW/2],ux:[0,0,1],n:[-1,0,0]};return{O:[-DW/2,y,-L],ux:[1,0,0],n:[0,0,1]}};
const W3=(e,lx,ly,lz)=>[e.O[0]+e.ux[0]*lx+e.n[0]*lz,e.O[1]+ly,e.O[2]+e.ux[2]*lx+e.n[2]*lz];
const kare=(e,x0,y0,x1,y1,z)=>[].concat(W3(e,x0,y0,z),W3(e,x1,y0,z),W3(e,x1,y1,z),W3(e,x0,y1,z));
GL.statik=function(){const g=GL.g,B={};const ek=(t,p,uv)=>dort(B[t]||(B[t]=[]),p,uv,1);
 ek("zemin",[-X,FY,ZS, X,FY,ZS, X,FY,-L, -X,FY,-L],[0,0,1,(ZS+L)/600]);
 ek("tavan",[-X,CY,-L, X,CY,-L, X,CY,ZS, -X,CY,ZS],[0,(ZS+L)/900,1,0]);
 /* duvar dokusu 880 birimde bir tekrar eder; kapı merkezleri doku ortasına (u=.5) denk gelir */
 ek("duvar",[-X,CY,ZS, -X,CY,-L, -X,FY,-L, -X,FY,ZS],[(-ZS-460)/880,0,(L-460)/880,1]);
 ek("duvar",[X,CY,-L, X,CY,ZS, X,FY,ZS, X,FY,-L],[-(L-900)/880,0,-(-ZS-900)/880,1]);
 ek("uc",[-X,CY,-L, X,CY,-L, X,FY,-L, -X,FY,-L],[0,0,1,1]);
 ek("duvar",[X,CY,ZS, -X,CY,ZS, -X,FY,ZS, X,FY,ZS],[0,0,960/880,1]); /* girişin arkasındaki duvar (normalde görünmez) */
 GL.st=Object.keys(B).map(t=>{const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array(B[t]),g.STATIC_DRAW);return{t,b,n:B[t].length/6}})};
/* kasa dokusunun dünya kutusu: x −40…290, y −48…470; tabela 3×3 atlas */
const KU=[-40,-48,290,470],TAB=i=>{const c=i%3,r=(i/3)|0;return[c/3+.004,r/3+.004,(c+1)/3-.004,(r+1)/3-.004]};
GL.dinamik=function(cam,dt){const K=V40.kapilar(),B={ic:[],kanat:[],kasa:[],tabela:[],bitki:[],hale:[]},y=cam.yaw*Math.PI/180,rx=Math.cos(y),rz=Math.sin(y);let hareket=false;
 K.forEach((k,i)=>{const e=GL.eks[i],s=GL.kap[i],b=(V40._kap||[])[i],cl=b?b.classList:null,hA=cl&&cl.contains("acik")?102:0,hG=cl&&cl.contains("sec")&&!cl.contains("acik")?1:cl&&cl.contains("yak")?.4:0,hT=cl&&cl.contains("kis")?.8:1;
  if(cl&&cl.contains("an0")||dt<0){s.a=hA;s.g=hG;s.t=hT}else{const f=1-Math.exp(-dt/170);s.a+=(hA-s.a)*f;s.g+=(hG-s.g)*(1-Math.exp(-dt/140));s.t+=(hT-s.t)*(1-Math.exp(-dt/140));
   if(Math.abs(hA-s.a)<.3)s.a=hA;if(Math.abs(hG-s.g)<.01)s.g=hG;if(Math.abs(hT-s.t)<.005)s.t=hT;if(s.a!==hA||s.g!==hG||s.t!==hT)hareket=true}
  const t=s.t,ac=s.a*Math.PI/180,c=Math.cos(ac),sn=Math.sin(ac),ia=1+.25*Math.min(1,s.a/60);
  dort(B.ic,kare(e,0,AR,DW,DH,1.5),[0,0,1,1],t*ia);
  /* kanatlar: menteşeden dışarı (koridora) doğru döner; açıkken sınıftan gelen ışıkla biraz aydınlanır */
  const kn=(hx,yon)=>{const a=W3(e,hx,AR,5),d=W3(e,hx,DH,5),ex=hx+yon*125*c,ez=5+125*sn,b2=W3(e,ex,AR,ez),c2=W3(e,ex,DH,ez);dort(B.kanat,[].concat(a,b2,c2,d),[0,0,1,1],t*(1+.12*sn))};kn(0,1);kn(DW,-1);
  /* pervaz iç ve dış yüzleri (kasanın derinliği) */
  [[0,.82],[DW,.82],[-28,.7],[DW+28,.7]].forEach(([lx,l])=>dort(B.kanat,[].concat(W3(e,lx,AR,16),W3(e,lx,AR,0),W3(e,lx,DH,0),W3(e,lx,DH,16)),[.02,.6,.06,.98],t*l));
  dort(B.kasa,kare(e,KU[0],KU[1],KU[2],KU[3],16),[0,0,1,1],t);
  dort(B.tabela,kare(e,37,-106,213,-42,20),TAB(i),Math.max(t,.92));
  if(s.g>.01)dort(B.hale,kare(e,-60,-70,310,470,18),[0,0,1,1],s.g)});
 /* bitkiler kameraya döner */
 GL.bit.forEach(([px,pz])=>dort(B.bitki,[px-45*rx,FY-174,pz-45*rz, px+45*rx,FY-174,pz+45*rz, px+45*rx,FY-2,pz+45*rz, px-45*rx,FY-2,pz-45*rz],[0,0,1,1],1));
 GL.hareket=hareket;return B};

/* ---------- 3. Çizim ---------- */
GL.boyut=function(){const st=document.getElementById("s40");if(!st||!GL.cv)return;const W=st.clientWidth||390,H=st.clientHeight||700,lite=!!document.querySelector("#p40.lite"),dpr=Math.min(window.devicePixelRatio||1,lite?1.25:2),w=Math.round(W*dpr),h=Math.round(H*dpr);
 GL.W=W;GL.H=H;if(GL.cv.width!==w||GL.cv.height!==h){GL.cv.width=w;GL.cv.height=h}};
GL.iz=function(c,wx,wy,wz){const y=c.yaw*Math.PI/180,sn=Math.sin(y),cs=Math.cos(y),dx=wx-c.x,dz=wz-c.z,xc=dx*cs+dz*sn,ds=dx*sn-dz*cs;return{x:GL.W/2+V40.P*xc/ds,y:.46*GL.H+V40.P*wy/ds,d:ds}};
GL.kutu=function(i,x0,y0,x1,y1,z){const e=GL.eks[i],c=V40.cam,P=[W3(e,x0,y0,z),W3(e,x1,y0,z),W3(e,x1,y1,z),W3(e,x0,y1,z)].map(p=>GL.iz(c,p[0],p[1],p[2]));if(P.some(p=>p.d<30))return null;
 const xs=P.map(p=>p.x),ys=P.map(p=>p.y),l=Math.min(...xs),r=Math.max(...xs),t=Math.min(...ys),b=Math.max(...ys);return r<0||l>GL.W||b<0||t>GL.H?null:{l,t,w:r-l,h:b-t}};
GL.dugmeler=function(){(V40._kap||[]).forEach((b,i)=>{const k=GL.kutu(i,0,0,DW,DH,0),cl=b.classList;if(!k||k.w<6){if(!cl.contains("gz")){cl.add("gz");b.style.cssText=""}return}
  if(cl.contains("gz"))cl.remove("gz");const s=b.style;s.left=k.l.toFixed(1)+"px";s.top=k.t.toFixed(1)+"px";s.width=k.w.toFixed(1)+"px";s.height=k.h.toFixed(1)+"px"})};
GL.ciz=function(snap){if(!GL.aktif||!GL.hazir||GL.kayip)return;const g=GL.g,c=V40.cam,now=performance.now(),dt=snap?-1:Math.min(64,now-(GL.son||now));GL.son=now;GL.boyut();
 const y=c.yaw*Math.PI/180;g.viewport(0,0,GL.cv.width,GL.cv.height);g.clearColor(.93,.87,.75,1);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.enable(g.DEPTH_TEST);g.depthFunc(g.LEQUAL);g.depthMask(true);g.disable(g.BLEND);g.disable(g.CULL_FACE);
 g.useProgram(GL.p);g.uniform3f(GL.u.uC,c.x,0,c.z);g.uniform2f(GL.u.uR,Math.sin(y),Math.cos(y));g.uniform4f(GL.u.uJ,V40.P/(GL.W/2),V40.P/(GL.H/2),.08,0);g.uniform3f(GL.u.uF,.97,.91,.78);g.uniform1i(GL.u.uS,0);g.uniform1f(GL.u.uE,0);g.uniform1f(GL.u.uK,0);
 g.activeTexture(g.TEXTURE0);for(const s of GL.st){g.bindTexture(g.TEXTURE_2D,GL.T[s.t]);GL.bagla(s.b);g.drawArrays(g.TRIANGLES,0,s.n)}
 const B=GL.dinamik(c,dt),sira=["ic","kanat","kasa","tabela","bitki","hale"],tum=[];const ar={};sira.forEach(t=>{ar[t]=[tum.length/6,B[t].length/6];for(let i=0;i<B[t].length;i++)tum.push(B[t][i])});
 GL.bagla(GL.dyn);g.bufferData(g.ARRAY_BUFFER,new Float32Array(tum),g.DYNAMIC_DRAW);
 for(const t of sira){if(!ar[t][1])continue;g.bindTexture(g.TEXTURE_2D,GL.T[t]);if(t==="hale"){g.enable(g.BLEND);g.blendFunc(g.ONE,g.ONE);g.depthMask(false);g.uniform1f(GL.u.uE,1);g.uniform1f(GL.u.uK,0)}else g.uniform1f(GL.u.uK,t==="kasa"||t==="tabela"||t==="bitki"?.5:0);g.drawArrays(g.TRIANGLES,ar[t][0],ar[t][1])}
 g.depthMask(true);g.disable(g.BLEND);GL.dugmeler();GL.kare=(GL.kare||0)+1;
 if(GL.hareket&&!GL._raf)GL._raf=requestAnimationFrame(()=>{GL._raf=0;if(view==="pdunya"&&!document.hidden)GL.ciz()})};

/* ---------- 4. Dokular (canvas 2B; aydınlık, sıcak; ışık dokuya işlenir) ---------- */
let seed=40200;const R=()=>(seed=(seed*16807)%2147483647,(seed-1)/2147483646);
const cizgi=(x,a,b,c,d)=>{x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()};
const yildiz="20 4 23.4 11.7 31.3 8.7 28.3 16.6 36 20 28.3 23.4 31.3 31.3 23.4 28.3 20 36 16.6 28.3 8.7 31.3 11.7 23.4 4 20 11.7 16.6 8.7 8.7 16.6 11.7".split(" ").map(Number);
/* geometrik kafes deseni (8 köşeli yıldız) */
const kafes=(x,renk,olcek,kal)=>{const s=olcek||1,c=document.createElement("canvas");c.width=c.height=Math.max(8,Math.round(40*s));const k=c.getContext("2d");k.scale(c.width/40,c.width/40);k.strokeStyle=renk;k.lineWidth=kal||1.4;k.beginPath();
 for(let i=0;i<yildiz.length;i+=2)i?k.lineTo(yildiz[i],yildiz[i+1]):k.moveTo(yildiz[i],yildiz[i+1]);k.closePath();[[0,0,8.7,8.7],[40,0,31.3,8.7],[0,40,8.7,31.3],[40,40,31.3,31.3],[20,0,20,4],[20,36,20,40],[0,20,4,20],[36,20,40,20]].forEach(q=>{k.moveTo(q[0],q[1]);k.lineTo(q[2],q[3])});k.stroke();return x.createPattern(c,"repeat")};
/* ahşap: taban geçişi + ton dalgaları + damarlar (dikey ya da yatay) */
const ahsap=(x,X0,Y0,Wd,Hd,o)=>{o=o||{};const c1=o.c1||"#7a4926",c2=o.c2||"#96602f",yatay=!!o.yatay;x.save();x.beginPath();x.rect(X0,Y0,Wd,Hd);x.clip();const g=yatay?x.createLinearGradient(0,Y0,0,Y0+Hd):x.createLinearGradient(X0,0,X0+Wd,0);g.addColorStop(0,c1);g.addColorStop(.5,c2);g.addColorStop(1,c1);x.fillStyle=g;x.fillRect(X0,Y0,Wd,Hd);
 const uz=yatay?Wd:Hd,en=yatay?Hd:Wd,n=Math.max(8,Math.round(en*(o.sik||.36)));for(let l=0;l<n;l++){const p=R()*en,a=1+R()*4,k=1+(R()*3|0),ph=R()*6.28;x.beginPath();for(let s=0;s<=uz;s+=10){const q=p+Math.sin(s*k*Math.PI/Math.max(120,uz)+ph)*a;yatay?(s?x.lineTo(X0+s,Y0+q):x.moveTo(X0+s,Y0+q)):(s?x.lineTo(X0+q,Y0+s):x.moveTo(X0+q,Y0+s))}
  x.strokeStyle=R()<.5?`rgba(58,28,10,${.12+R()*.2})`:`rgba(232,180,116,${.08+R()*.14})`;x.lineWidth=.5+R()*1.4;x.stroke()}x.restore()};
const altin=(x,X0,Y0,Wd,Hd)=>{const g=x.createLinearGradient(0,Y0,0,Y0+Hd);g.addColorStop(0,"#f4dc9c");g.addColorStop(.5,"#d2a85c");g.addColorStop(1,"#a67a36");x.fillStyle=g;x.fillRect(X0,Y0,Wd,Hd)};
const benek=(x,Wd,Hd,n,f)=>{for(let i=0;i<n;i++){x.fillStyle=f();x.fillRect(R()*Wd,R()*Hd,1+R()*3.5,1+R()*3.5)}};
/* kireçtaşı duvar yüzeyi: açık krem, blok derzleri, hafif leke */
const tas=(x,Wd,y0,y1)=>{const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,"#d9c8a8");g.addColorStop(.35,"#e6d7bb");g.addColorStop(1,"#dfcfb1");x.fillStyle=g;x.fillRect(0,y0,Wd,y1-y0);
 x.save();x.beginPath();x.rect(0,y0,Wd,y1-y0);x.clip();benek(x,Wd,y1,Wd*1.6,()=>R()<.5?`rgba(150,126,88,${R()*.07})`:`rgba(255,255,255,${R()*.09})`);
 x.strokeStyle="rgba(128,104,70,.42)";x.lineWidth=1.4;let s=0;for(let y=y0;y<y1;y+=94,s++){cizgi(x,0,y,Wd,y);for(let xx=s%2?110:0;xx<=Wd;xx+=220)cizgi(x,xx,y,xx,y+94)}
 x.strokeStyle="rgba(255,255,255,.35)";x.lineWidth=1;s=0;for(let y=y0+1.5;y<y1;y+=94)cizgi(x,0,y,Wd,y);x.restore()};
const kornis=(x,Wd)=>{ahsap(x,0,0,Wd,54,{yatay:true,c1:"#6d4425",c2:"#8f5e33"});altin(x,0,49,Wd,5);x.fillStyle="rgba(60,36,14,.5)";x.fillRect(0,54,Wd,1.5);const g=x.createLinearGradient(0,55,0,150);g.addColorStop(0,"rgba(90,62,30,.26)");g.addColorStop(1,"rgba(90,62,30,0)");x.fillStyle=g;x.fillRect(0,55,Wd,95)};
const lambri=(x,Wd,y0)=>{ahsap(x,0,y0,Wd,770-y0,{c1:"#73442a",c2:"#8d5a31",sik:.3});x.lineWidth=2;for(let xx=0;xx<Wd;xx+=110){x.strokeStyle="rgba(60,32,12,.55)";x.strokeRect(xx+9,y0+22,92,92);x.strokeStyle="rgba(236,196,124,.5)";x.lineWidth=1.2;x.strokeRect(xx+13,y0+26,84,84);x.lineWidth=2}
 altin(x,0,y0-7,Wd,9);const g=x.createLinearGradient(0,y0,0,770);g.addColorStop(0,"rgba(255,226,180,.1)");g.addColorStop(1,"rgba(40,20,8,.16)");x.fillStyle=g;x.fillRect(0,y0,Wd,770-y0);
 x.fillStyle="#4a3d34";x.fillRect(0,744,Wd,26);x.fillStyle="rgba(255,240,215,.08)";x.fillRect(0,744,Wd,8);altin(x,0,741,Wd,3)};
const pilastr=(x,cx,y0,y1)=>{ahsap(x,cx-18,y0,36,y1-y0,{c1:"#64391f",c2:"#8a5830",sik:.5});x.strokeStyle="rgba(232,192,120,.55)";x.lineWidth=1.5;x.strokeRect(cx-13,y0+30,26,y1-y0-52);altin(x,cx-24,y0,48,22);altin(x,cx-22,y1-14,44,14)};
const isik=(x,cx,cy,r,a)=>{x.save();x.globalCompositeOperation="lighter";const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,`rgba(255,214,150,${a})`);g.addColorStop(.5,`rgba(255,206,140,${a*.35})`);g.addColorStop(1,"rgba(255,200,130,0)");x.fillStyle=g;x.fillRect(cx-r,cy-r,2*r,2*r);x.restore()};
const aplik=(x,cx,cy)=>{isik(x,cx,cy-10,170,.3);x.fillStyle="#8c6431";x.fillRect(cx-4,cy+26,8,24);const g=x.createRadialGradient(cx,cy-6,2,cx,cy,34);g.addColorStop(0,"#fffbe9");g.addColorStop(.45,"#ffe2a6");g.addColorStop(1,"#e0a352");x.fillStyle=g;x.strokeStyle="#9b7238";x.lineWidth=2;
 x.beginPath();x.moveTo(cx-16,cy+28);x.lineTo(cx-16,cy-14);x.quadraticCurveTo(cx-16,cy-30,cx,cy-30);x.quadraticCurveTo(cx+16,cy-30,cx+16,cy-14);x.lineTo(cx+16,cy+28);x.closePath();x.fill();x.stroke()};
const kemerYol=(x,x0,y0,x1,y1,r)=>{x.beginPath();x.moveTo(x0,y1);x.lineTo(x0,y0+r);x.arc((x0+x1)/2,y0+r,r,Math.PI,0);x.lineTo(x1,y1);x.closePath()};
const nis=(x,cx,ust)=>{const w=95;x.save();kemerYol(x,cx-w-10,ust-10,cx+w+10,ust+310,w+10);x.fillStyle="#6b4124";x.fill();x.strokeStyle="#d9b064";x.lineWidth=2.5;x.stroke();kemerYol(x,cx-w,ust,cx+w,ust+300,w);x.clip();
 const g=x.createRadialGradient(cx,ust+130,10,cx,ust+150,210);g.addColorStop(0,"#f6dca8");g.addColorStop(.55,"#c99556");g.addColorStop(1,"#8a5c33");x.fillStyle=g;x.fillRect(cx-w,ust,2*w,300);x.fillStyle=kafes(x,"rgba(112,66,26,.75)",.95,1.6);x.fillRect(cx-w,ust,2*w,300);x.restore();
 /* nişin altında ceviz konsol */ ahsap(x,cx-80,596,160,30,{yatay:true,c1:"#6a3f22",c2:"#8a5830"});altin(x,cx-84,592,168,5)};
GL.URET={
 duvar:[1024,1024,x=>{x.scale(1024/880,1024/770);tas(x,880,0,620);isik(x,440,120,330,.1);kornis(x,880);lambri(x,880,620);pilastr(x,145,54,613);pilastr(x,735,54,613);aplik(x,237,400);aplik(x,643,400);nis(x,0,140);nis(x,880,140)}],
 uc:[1024,1024,x=>{x.scale(1024/960,1024/770);tas(x,960,0,620);kornis(x,960);lambri(x,960,620);
  /* büyük kemer ve ışıklı kafes pencere */
  x.save();x.beginPath();x.moveTo(150,620);x.lineTo(150,450);x.arc(480,450,330,Math.PI,0);x.lineTo(810,620);x.lineTo(786,620);x.lineTo(786,450);x.arc(480,450,306,0,Math.PI,true);x.lineTo(174,620);x.closePath();x.clip();ahsap(x,150,110,660,520,{c1:"#6a3f22",c2:"#8f5d32"});x.restore();
  x.strokeStyle="#dcb568";x.lineWidth=3;x.beginPath();x.moveTo(150,620);x.lineTo(150,450);x.arc(480,450,330,Math.PI,0);x.lineTo(810,620);x.stroke();x.beginPath();x.moveTo(174,620);x.lineTo(174,450);x.arc(480,450,306,Math.PI,0);x.lineTo(786,620);x.stroke();
  x.save();x.beginPath();x.moveTo(265,350);x.arc(480,350,215,Math.PI,0);x.closePath();x.clip();const g=x.createRadialGradient(480,350,10,480,350,230);g.addColorStop(0,"#fffbe9");g.addColorStop(.6,"#ffe6ae");g.addColorStop(1,"#eec07a");x.fillStyle=g;x.fillRect(265,130,430,220);x.fillStyle=kafes(x,"rgba(140,90,36,.8)",.85,1.7);x.fillRect(265,130,430,220);x.restore();
  x.strokeStyle="#6a3f22";x.lineWidth=7;x.beginPath();x.moveTo(265,350);x.arc(480,350,215,Math.PI,0);x.closePath();x.stroke();isik(x,480,300,360,.22);
  pilastr(x,301,238,613);pilastr(x,659,238,613);aplik(x,258,400);aplik(x,702,400)}],
 zemin:[1024,512,x=>{x.scale(1024/960,512/600);const g=x.createLinearGradient(0,0,960,0);g.addColorStop(0,"#e7ddca");g.addColorStop(.12,"#f4eee2");g.addColorStop(.88,"#f4eee2");g.addColorStop(1,"#e7ddca");x.fillStyle=g;x.fillRect(0,0,960,600);
  benek(x,960,600,1500,()=>`rgba(${150+R()*60|0},${138+R()*50|0},${118+R()*40|0},${R()*.06})`);
  const damar=(n,renk,x0,x1)=>{for(let v=0;v<n;v++){let px=x0+R()*(x1-x0),py=R()*600;const yol=[[px,py]];for(let s=0;s<9;s++){px+=(R()-.5)*90;py+=(R()-.35)*70;yol.push([px,py])}x.strokeStyle=renk();x.lineWidth=.6+R()*1.6;for(const dy of[-600,0,600]){x.beginPath();yol.forEach((p,i)=>i?x.lineTo(p[0],p[1]+dy):x.moveTo(p[0],p[1]+dy));x.stroke()}}};
  damar(16,()=>R()<.7?`rgba(128,116,100,${.14+R()*.18})`:`rgba(186,142,74,${.18+R()*.18})`,0,960);
  x.strokeStyle="rgba(150,130,100,.26)";x.lineWidth=1.2;for(let xx=160;xx<960;xx+=160)cizgi(x,xx,0,xx,600);for(let y=0;y<600;y+=150)cizgi(x,0,y+.6,960,y+.6);
  /* koyu mermer yolluk, altın şeritler, yıldız madalyon */
  x.fillStyle="#463a31";x.fillRect(330,0,300,600);x.save();x.beginPath();x.rect(330,0,300,600);x.clip();benek(x,960,600,500,()=>`rgba(255,238,215,${R()*.05})`);damar(7,()=>`rgba(220,190,136,${.14+R()*.2})`,330,630);x.restore();
  altin(x,330,0,4,600);altin(x,626,0,4,600);x.fillStyle="#c9a056";x.fillRect(342,0,1.6,600);x.fillRect(616.4,0,1.6,600);
  x.save();x.translate(480,300);x.fillStyle="#352b24";x.beginPath();x.arc(0,0,84,0,7);x.fill();x.strokeStyle="#d2a85c";x.lineWidth=3;x.stroke();x.lineWidth=1.2;x.beginPath();x.arc(0,0,74,0,7);x.stroke();
  const yz=(Ro,ri,dol,cz)=>{x.beginPath();for(let k=0;k<16;k++){const a=-Math.PI/2+k*Math.PI/8,r=k%2?ri:Ro;k?x.lineTo(r*Math.cos(a),r*Math.sin(a)):x.moveTo(r*Math.cos(a),r*Math.sin(a))}x.closePath();x.fillStyle=dol;x.fill();if(cz){x.strokeStyle=cz;x.lineWidth=2;x.stroke()}};yz(68,48,"#efe6d3","#c9a056");yz(40,27,"#c9a056");x.fillStyle="#352b24";x.beginPath();x.arc(0,0,10,0,7);x.fill();x.restore();
  const k=x.createLinearGradient(0,0,960,0);k.addColorStop(0,"rgba(96,66,34,.2)");k.addColorStop(.07,"rgba(96,66,34,0)");k.addColorStop(.93,"rgba(96,66,34,0)");k.addColorStop(1,"rgba(96,66,34,.2)");x.fillStyle=k;x.fillRect(0,0,960,600)}],
 tavan:[1024,1024,x=>{x.scale(1024/960,1024/900);ahsap(x,0,0,960,900,{c1:"#7b4d2a",c2:"#93602f",sik:.2});
  /* kasetler: açık ceviz panel, pahlı kenar, ince altın çizgi */
  for(let r=0;r<6;r++)for(let c=0;c<6;c++){const px=c*160+14,py=r*150+13;ahsap(x,px,py,132,124,{c1:"#a67644",c2:"#c08f58",sik:.16,yatay:(r+c)%2===0});x.strokeStyle="rgba(70,40,16,.6)";x.lineWidth=3;x.strokeRect(px,py,132,124);x.strokeStyle="rgba(244,214,150,.7)";x.lineWidth=1.3;x.strokeRect(px+7,py+7,118,110);
   const g=x.createLinearGradient(0,py,0,py+124);g.addColorStop(0,"rgba(50,26,8,.2)");g.addColorStop(.3,"rgba(50,26,8,0)");x.fillStyle=g;x.fillRect(px,py,132,124)}
  /* tepe penceresi: kafesli, sıcak beyaz */
  x.fillStyle="#5f3b1f";x.fillRect(238,318,484,264);altin(x,244,324,472,3);altin(x,244,573,472,3);const g=x.createLinearGradient(250,0,710,0);g.addColorStop(0,"#fbeccb");g.addColorStop(.5,"#fffaf0");g.addColorStop(1,"#f8e4bb");x.fillStyle=g;x.fillRect(254,334,452,232);x.fillStyle=kafes(x,"rgba(176,128,60,.75)",1,1.5);x.fillRect(254,334,452,232);isik(x,480,450,420,.3);
  /* kenarlarda gizli ışık */
  x.save();x.globalCompositeOperation="lighter";[[0,0,90,0],[960,0,870,0]].forEach(q=>{const k=x.createLinearGradient(q[0],0,q[2],0);k.addColorStop(0,"rgba(255,226,170,.55)");k.addColorStop(1,"rgba(255,226,170,0)");x.fillStyle=k;x.fillRect(Math.min(q[0],q[2]),0,90,900)});x.restore()}],
 /* kasa: kemerli ceviz çerçeve + kafesli üst pencere; açıklığın içi saydam */
 kasa:[512,1024,x=>{x.scale(512/330,1024/518);x.translate(40,48);const dis=()=>{x.beginPath();x.moveTo(-28,470);x.lineTo(-28,125);x.arc(125,125,153,Math.PI,0);x.lineTo(278,470);x.lineTo(250,470);x.lineTo(250,125);x.arc(125,125,125,0,Math.PI,true);x.lineTo(0,470);x.closePath()};
  x.save();dis();x.clip();ahsap(x,-40,-48,330,518,{c1:"#6f4226",c2:"#93602f",sik:.4});const g=x.createLinearGradient(0,-40,0,470);g.addColorStop(0,"rgba(255,232,190,.2)");g.addColorStop(.4,"rgba(255,232,190,0)");x.fillStyle=g;x.fillRect(-40,-48,330,518);x.restore();
  x.lineWidth=2.4;x.strokeStyle="#e8c47c";x.beginPath();x.moveTo(-2.5,470);x.lineTo(-2.5,125);x.arc(125,125,127.5,Math.PI,0);x.lineTo(252.5,470);x.stroke();x.strokeStyle="#c8964c";x.beginPath();x.moveTo(-25.5,470);x.lineTo(-25.5,125);x.arc(125,125,150.5,Math.PI,0);x.lineTo(275.5,470);x.stroke();
  x.strokeStyle="rgba(60,32,12,.7)";x.lineWidth=1.6;x.beginPath();x.moveTo(-28,470);x.lineTo(-28,125);x.arc(125,125,153,Math.PI,0);x.lineTo(278,470);x.stroke();
  x.save();x.beginPath();x.moveTo(0,125);x.arc(125,125,125,Math.PI,0);x.closePath();x.clip();const r=x.createRadialGradient(125,125,6,125,125,130);r.addColorStop(0,"#fff6dc");r.addColorStop(.55,"#f6cf8a");r.addColorStop(1,"#c98d48");x.fillStyle=r;x.fillRect(0,0,250,125);x.fillStyle=kafes(x,"rgba(118,70,24,.8)",.75,1.8);x.fillRect(0,0,250,125);x.restore();
  ahsap(x,0,115,250,10,{yatay:true,c1:"#5f3a20",c2:"#7d5029"});altin(x,0,113,250,2.5);
  x.save();x.translate(125,-28);x.rotate(Math.PI/4);const d=x.createLinearGradient(-10,-10,10,10);d.addColorStop(0,"#f8e4a8");d.addColorStop(1,"#b0843c");x.fillStyle=d;x.fillRect(-10,-10,20,20);x.restore()}],
 kanat:[256,512,x=>{x.scale(256/125,512/345);ahsap(x,0,0,125,345,{c1:"#7c4a27",c2:"#9a6332",sik:.55});let g=x.createLinearGradient(0,0,0,345);g.addColorStop(0,"rgba(255,236,200,.22)");g.addColorStop(.4,"rgba(255,236,200,0)");g.addColorStop(1,"rgba(46,22,8,.08)");x.fillStyle=g;x.fillRect(0,0,125,345);
  x.strokeStyle="#4d2c15";x.lineWidth=3;x.strokeRect(1.5,1.5,122,342);x.strokeStyle="rgba(236,196,120,.85)";x.lineWidth=1.6;x.strokeRect(4.5,4.5,116,336);
  /* üst panel: kafes süs */ x.fillStyle="rgba(70,38,14,.22)";x.fillRect(16,16,93,150);x.fillStyle=kafes(x,"rgba(244,208,134,.95)",.62,2);x.fillRect(16,16,93,150);x.strokeStyle="rgba(70,38,14,.8)";x.lineWidth=2;x.strokeRect(16,16,93,150);x.strokeStyle="rgba(240,202,128,.75)";x.lineWidth=1.3;x.strokeRect(19,19,87,144);
  /* alt panel */ g=x.createLinearGradient(0,195,0,327);g.addColorStop(0,"rgba(255,232,190,.1)");g.addColorStop(1,"rgba(46,22,8,.1)");x.fillStyle=g;x.fillRect(16,195,93,132);x.strokeStyle="rgba(70,38,14,.8)";x.lineWidth=2;x.strokeRect(16,195,93,132);x.strokeStyle="rgba(240,202,128,.7)";x.lineWidth=1.3;x.strokeRect(19,198,87,126);
  /* kol (kanadın serbest kenarında) */ g=x.createLinearGradient(109,0,119,0);g.addColorStop(0,"#a47636");g.addColorStop(.45,"#fff2c8");g.addColorStop(1,"#c0924a");x.fillStyle=g;x.strokeStyle="rgba(84,52,20,.7)";x.lineWidth=1;x.beginPath();if(x.roundRect)x.roundRect(109,176,10,54,5);else x.rect(109,176,10,54);x.fill();x.stroke()}],
 ic:[256,512,x=>{x.scale(256/250,512/345);const g=x.createRadialGradient(125,250,10,125,200,300);g.addColorStop(0,"#fff4d8");g.addColorStop(.5,"#f6d296");g.addColorStop(1,"#c28a4c");x.fillStyle=g;x.fillRect(0,0,250,345);
  [[42,100],[150,208]].forEach(([a,b])=>{x.save();kemerYol(x,a,18,b,140,(b-a)/2);x.fillStyle="#6b4224";x.lineWidth=5;x.strokeStyle="#6b4224";x.stroke();x.clip();x.fillStyle="#fffbee";x.fillRect(a,18,b-a,122);x.fillStyle=kafes(x,"rgba(190,150,84,.6)",.5,1.6);x.fillRect(a,18,b-a,122);x.restore()});
  /* kitaplık */ x.fillStyle="#7a4b28";x.fillRect(18,222,214,123);const renk=["#9c4a36","#c9a056","#3f6478","#7a5230","#b8873f","#5d7a52","#8a3f4a","#d9b877"];for(let r=0;r<3;r++){let px=24;while(px<224){const w=7+R()*8;x.fillStyle=renk[(R()*renk.length)|0];x.fillRect(px,230+r*40,w-1.5,30);px+=w}x.fillStyle="#5f3a20";x.fillRect(18,260+r*40,214,6)}
  const z=x.createLinearGradient(0,0,0,345);z.addColorStop(0,"rgba(255,244,216,.25)");z.addColorStop(1,"rgba(255,244,216,0)");x.fillStyle=z;x.fillRect(0,0,250,345)}],
 tabela:[1024,512,x=>{const cw=1024/3,ch=512/3;V40.kapilar().forEach((k,i)=>{x.save();x.translate((i%3)*cw,((i/3)|0)*ch);x.scale(cw/176,ch/64);const yol=()=>{x.beginPath();if(x.roundRect)x.roundRect(2,2,172,60,11);else x.rect(2,2,172,60)};yol();const g=x.createLinearGradient(0,0,0,64);g.addColorStop(0,"#4a3520");g.addColorStop(1,"#2a1d12");x.fillStyle=g;x.fill();x.strokeStyle="#e0b866";x.lineWidth=2.6;x.stroke();
   const m=x.createRadialGradient(30,26,2,30,32,22);m.addColorStop(0,"#fff6dc");m.addColorStop(.6,"#ecc67c");m.addColorStop(1,"#b0843c");x.fillStyle=m;x.beginPath();x.arc(30,32,21,0,7);x.fill();x.fillStyle="#2a170c";x.textAlign="center";x.textBaseline="middle";x.font="700 "+(k.g>9?21:24)+"px Literata, Georgia, serif";x.fillText(String(k.g),30,33.5);
   x.textAlign="left";x.fillStyle="#fbe8ba";x.font="700 20px Literata, Georgia, serif";x.fillText(k.g+". Sınıf",60,25);x.fillStyle="#e2cda4";x.font="500 12.5px system-ui, sans-serif";x.fillText(V39.stage(k.g),60,46);x.restore()})}],
 bitki:[128,256,x=>{x.scale(128/90,256/172);const yap=(d,r)=>{x.fillStyle=r;x.fill(new Path2D(d))};yap("M45 118C40 90 22 70 8 62c18 2 30 18 37 40z","#3a5a30");yap("M45 118c4-30 22-52 38-58-14 10-26 30-30 58z","#48703a");yap("M44 116C34 80 28 42 40 8c6 34 8 70 6 108z","#5c8a44");yap("M46 116c2-36 14-70 34-92-10 30-20 62-28 94z","#4f7a3c");yap("M44 118C30 96 14 92 2 96c18-14 34-4 44 18z","#6a9a4c");yap("M46 118c10-22 28-30 42-26-18 2-30 12-38 28z","#588842");
  yap("M20 116h50l-6 52H26z","#a8703a");yap("M18 112h54v9H18z","#d9b064");x.strokeStyle="#f0d08c";x.lineWidth=1.4;cizgi(x,24,130,66,130)}],
 hale:[256,512,x=>{x.scale(256/370,512/540);x.translate(60,70);x.lineJoin="round";[[26,.05],[16,.1],[8,.22],[3,.6]].forEach(([w,a])=>{x.strokeStyle=`rgba(255,214,130,${a})`;x.lineWidth=w;x.beginPath();x.moveTo(-36,470);x.lineTo(-36,125);x.arc(125,125,161,Math.PI,0);x.lineTo(286,470);x.stroke()})}]};
GL.hazirla=function(){if(GL._yap)return;GL._yap=true;const lite=!!document.querySelector("#p40.lite"),q=lite?.5:1,adlar=Object.keys(GL.URET),t0=performance.now();let i=0;GL.durum.q=q;
 const adim=()=>{try{if(i<adlar.length){const ad=adlar[i++],[w,h,fn]=GL.URET[ad],c=document.createElement("canvas");c.width=w*q;c.height=h*q;const x=c.getContext("2d");if(!x)throw new Error("2B çizim bağlamı yok ("+ad+")");x.scale(q,q);x.save();fn(x);x.restore();GL.doku(ad,c);c.width=c.height=1;setTimeout(adim,0);return}
   GL.statik();GL.hazir=true;GL._yap=false;GL.durum.kaynak="webgl";GL.durum.ms=Math.round(performance.now()-t0);const y=document.getElementById("yk40");if(y)y.remove();if(view==="pdunya"){GL.ciz(true)}}
  catch(e){GL._yap=false;GL._d=false;GL.aktif=false;GL.durum.kaynak="css";uyar("koridor dokuları hazırlanamadı; CSS koridoru kullanılacak",e);try{if(view==="pdunya")draw()}catch(_){}}};
 setTimeout(adim,0)};

/* ---------- 5. V40 ile bağlantı ---------- */
V40.sahneHTML=function(){if(!GL.destek())return eski.sahne.call(V40);V40.items=[];V40.bb=[];
 return V40.kapilar().map(k=>{const g=k.g;return `<button class="k40 g gz" data-i="${k.i}" data-g="${g}" aria-label="${g}. Sınıf kapısı, ${V39.stage(g)}, ${esc(V39.pyName(V39.pv(g)))}. Seçmek için dokun; seçiliyken tekrar dokunursan kapı açılır ve sınıf merkezine girersin."></button>`}).join("")};
V40.uygula=function(c){if(!GL.aktif)return eski.uygula.call(V40,c);V40.cam=c;GL.ciz()};
V40.texUygula=function(){if(GL.aktif)return;return eski.tex.call(V40)};
V40.olc=function(){const r=eski.olc.call(V40);if(GL.aktif)GL.boyut();return r};
V40.init=function(i0,gel){const cam=document.getElementById("k40"),st=document.getElementById("s40");GL.aktif=!!(cam&&st&&!cam.querySelector(".z40")&&GL.destek());
 if(GL.aktif){const K=V40.kapilar();GL.eks=K.map(GL.eksen);GL.kap=K.map(()=>({a:0,g:0,t:1}));GL.bit=K.filter(k=>k.side).map(k=>[k.side*(X-58),k.z+DW/2+120]).concat([[-(X-70),-L+90],[X-70,-L+90]]);
  cam.classList.add("gl");st.classList.add("gl");cam.insertBefore(GL.cv,cam.firstChild);GL.son=0;
  if(!GL.hazir&&!document.getElementById("yk40"))st.insertAdjacentHTML("beforeend",'<i class="yuk40" id="yk40" role="status">Koridor hazırlanıyor…</i>');
  /* kapı durum sınıfları değişince (seçim, açılma) kamera dursa da yeniden çiz */
  if(GL._mo)GL._mo.disconnect();GL._mo=new MutationObserver(()=>{if(!GL._raf)GL._raf=requestAnimationFrame(()=>{GL._raf=0;if(view==="pdunya")GL.ciz()})});
  cam.querySelectorAll(".k40").forEach(b=>GL._mo.observe(b,{attributes:true,attributeFilter:["class"]}))}
 const r=eski.init.call(V40,i0,gel);if(GL.aktif){if(GL.hazir)GL.ciz(true);else GL.hazirla()}return r};
if(!V40._gl40g){V40._gl40g=1;document.addEventListener("visibilitychange",()=>{if(!document.hidden&&view==="pdunya"&&GL.aktif&&GL.hazir){GL.son=0;GL.ciz(true)}})}
})();
