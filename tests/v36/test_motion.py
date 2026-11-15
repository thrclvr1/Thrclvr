import asyncio
from playwright.async_api import async_playwright
URL='file:///home/claude/work/din-kulturu-platformu-v36.0.html'
IOS="""window.__rp=0;window.DeviceOrientationEvent=function(){};DeviceOrientationEvent.requestPermission=()=>{window.__rp++;return Promise.resolve(window.__res||'granted')};"""
AND="""window.DeviceOrientationEvent=window.DeviceOrientationEvent||function(){};delete DeviceOrientationEvent.requestPermission;"""
NONE="""delete window.DeviceOrientationEvent;"""
INSEC="""Object.defineProperty(window,'isSecureContext',{value:false});window.DeviceOrientationEvent=function(){};"""
async def run(b,name,init,pre,steps):
    c=await b.new_context(viewport={'width':390,'height':844},has_touch=True);pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(init+pre);await pg.goto(URL);await pg.wait_for_timeout(900)
    r=await steps(pg);print(name,r,'errs',errs);await c.close();return r,errs
async def openask(pg):
    await pg.evaluate("V30.settings()");await pg.wait_for_timeout(500)
    txt=await pg.evaluate("document.getElementById('m33-st').textContent");await pg.locator('#m33-on').tap();await pg.wait_for_timeout(700)
    return txt
async def main():
    ok=True
    async with async_playwright() as p:
        b=await p.chromium.launch()
        async def ios_grant(pg):
            t0=await openask(pg);rp0=await pg.evaluate("window.__rp");dlg=await pg.evaluate("document.querySelector('.m33dlg')!==null")
            st_before=await pg.evaluate("V33.motion.state")
            await pg.get_by_text('İzin iste ve etkinleştir').tap();await pg.wait_for_timeout(500)
            rp=await pg.evaluate("window.__rp");s1=await pg.evaluate("V33.motion.state")
            await pg.evaluate("dispatchEvent(Object.assign(new Event('deviceorientation'),{gamma:14,beta:54,alpha:0}))");await pg.wait_for_timeout(200)
            s2=await pg.evaluate("[V33.motion.state,getComputedStyle(document.documentElement).getPropertyValue('--gx').trim(),getComputedStyle(document.documentElement).getPropertyValue('--gy').trim()]")
            return dict(t0=t0,rp_before_click=rp0,dialog=dlg,st_before=st_before,rp_after=rp,state_no_data=s1,after_data=s2)
        r,e=await run(b,'iOS-granted',IOS,'',ios_grant)
        ok&=(r['rp_before_click']==0 and r['dialog'] and r['rp_after']==1 and r['state_no_data']=='dinleniyor' and r['after_data'][0]=='aktif' and r['after_data'][1]=='0.500')
        async def nodata(pg):
            await openask(pg);await pg.get_by_text('İzin iste ve etkinleştir').tap();await pg.wait_for_timeout(4200);return await pg.evaluate("V33.motion.state")
        r,e=await run(b,'iOS-granted-no-data',IOS,'',nodata);ok&=(r=='veriyok')
        async def denied(pg):
            await openask(pg);await pg.get_by_text('İzin iste ve etkinleştir').tap();await pg.wait_for_timeout(500)
            await pg.evaluate("dispatchEvent(Object.assign(new Event('deviceorientation'),{gamma:10,beta:50}))");await pg.wait_for_timeout(150)
            await pg.evaluate("V30.settings()");await pg.wait_for_timeout(400)
            return await pg.evaluate("[V33.motion.state,document.getElementById('m33-st').textContent,getComputedStyle(document.documentElement).getPropertyValue('--gx').trim()]")
        r,e=await run(b,'iOS-denied',IOS,"window.__res='denied';",denied);ok&=(r[0]=='reddedildi' and r[2] in('','0','0.000'))
        async def retry(pg):
            await openask(pg);await pg.get_by_text('İzin iste ve etkinleştir').tap();await pg.wait_for_timeout(400)
            await pg.evaluate("window.__res='granted'");await pg.evaluate("V30.settings()");await pg.wait_for_timeout(400);await pg.locator('#m33-on').tap();await pg.wait_for_timeout(600)
            await pg.get_by_text('İzin iste ve etkinleştir').tap();await pg.wait_for_timeout(400)
            await pg.evaluate("dispatchEvent(Object.assign(new Event('deviceorientation'),{gamma:7,beta:47}))");await pg.wait_for_timeout(150);return await pg.evaluate("[V33.motion.state,window.__rp]")
        r,e=await run(b,'iOS-denied-then-retry',IOS,"window.__res='denied';",retry);ok&=(r==['aktif',2])
        async def andr(pg):
            await openask(pg);await pg.get_by_text('İzin iste ve etkinleştir').tap();await pg.wait_for_timeout(300);s=await pg.evaluate("V33.motion.state")
            await pg.evaluate("dispatchEvent(Object.assign(new Event('deviceorientation'),{gamma:-28,beta:12}))");await pg.wait_for_timeout(150);return [s,await pg.evaluate("V33.motion.state")]
        r,e=await run(b,'Android-no-permission-API',AND,'',andr);ok&=(r==['dinleniyor','aktif'])
        async def unsup(pg):
            await openask(pg);txt=await pg.evaluate("document.querySelector('.m33w')&&document.querySelector('.m33w').textContent");btn=await pg.get_by_text('İzin iste ve etkinleştir').count()
            await pg.get_by_text('Manuel kontrol').last.tap();await pg.wait_for_timeout(300);return [txt,btn,await pg.evaluate("V33.motion.state")]
        r,e=await run(b,'unsupported',NONE,'',unsup);ok&=(r[0] and r[1]==0 and r[2]=='manuel')
        async def insec(pg):
            await openask(pg);txt=await pg.evaluate("document.querySelector('.m33w')&&document.querySelector('.m33w').textContent");return [txt,await pg.get_by_text('İzin iste ve etkinleştir').count()]
        r,e=await run(b,'insecure-context',INSEC,'',insec);ok&=(r[0] and 'HTTPS' in r[0] and r[1]==0)
        async def pad(pg):
            await pg.evaluate("V30.settings()");await pg.wait_for_timeout(800)
            await pg.locator('#m33-pad').scroll_into_view_if_needed();bx=await pg.locator('#m33-pad').bounding_box()
            await pg.mouse.move(bx['x']+bx['width']*0.9,bx['y']+bx['height']/2);await pg.mouse.down();await pg.mouse.move(bx['x']+bx['width']*0.9,bx['y']+bx['height']/2+1);await pg.mouse.up();await pg.wait_for_timeout(150)
            return await pg.evaluate("[V33.motion.state,getComputedStyle(document.documentElement).getPropertyValue('--gx').trim()]")
        r,e=await run(b,'manual-pad',NONE,'',pad);ok&=(r[0]=='manuel' and float(r[1])>0.5)
        await b.close()
    print('ALL OK' if ok else 'SOME FAIL')
asyncio.run(main())
