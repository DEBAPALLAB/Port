import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { Browser,sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const browser=await Browser.launch(),out='.taste-skill/drawer-close-sync';
mkdirSync(out,{recursive:true});
async function synchronized(page,id) {
  const samples=await page.eval(async id=>{
    const drawer=document.querySelector(`[data-project="${id}"]`),results=[];
    const started=performance.now();
    while(performance.now()-started<900) {
      await new Promise(requestAnimationFrame);
      const face=new DOMMatrixReadOnly(getComputedStyle(drawer.querySelector('.drawer-face')).transform);
      const well=drawer.querySelector('.drawer-paper-window');
      const values=getComputedStyle(well).clipPath.match(/-?\d*\.?\d+/g)?.map(Number)||[];
      const bottom=values[2]??values[0]??0;
      const travel=(innerWidth<=480?140:145)+(parseFloat(drawer.style.getPropertyValue('--drawer-clearance'))||0);
      results.push({face:face.m42,mask:bottom,travel,visible:getComputedStyle(drawer.querySelector('.drawer-files')).visibility});
    }
    return results;
  },id);
  assert.ok(samples.every(s=>Math.abs(s.face+s.mask-s.travel)<.6),'paper aperture follows the front on every sampled frame: '+JSON.stringify(samples.find(s=>Math.abs(s.face+s.mask-s.travel)>=.6)));
  return samples;
}
try {
  for(const width of [1440,768,390]) {
    const page=await browser.newPage({width,height:900,mobile:width===390});
    try {
      await page.goto('http://127.0.0.1:5173/#workflow',{settleMs:700});
      await page.eval(()=>document.querySelector('[data-project="culprit"]').scrollIntoView({block:'center',behavior:'instant'}));
      // Both a hover-only drawer and a raised selected file must close cleanly.
      for(const pinned of [false,true]) {
        await page.eval(({pinned})=>{
          const old=document.querySelector('[data-project="culprit"]');
          if(pinned)old.querySelector('.drawer-front').click();
          else old.dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse'}));
        },{pinned});
        await sleep(1050);
        assert.equal(await page.eval(()=>document.querySelector('[data-project="culprit"]').dataset.open),'true');
        if(pinned)await page.eval(()=>document.querySelectorAll('#drawer-culprit .drawer-card-selector button')[1].click());
        await sleep(850);
        await page.eval(()=>document.querySelector('[data-project="lucide"] .drawer-front').click());
        const samples=await synchronized(page,'culprit');
        assert.equal(samples.at(-1).visible,'hidden','closed papers stop rendering with the mechanism');
        await page.screenshot({path:`${out}/${width}-${pinned?'selected':'hover'}-closed.jpg`,quality:92});
        await page.eval(()=>document.querySelector('[data-project="lucide"] .drawer-front').click());
        await sleep(750);
      }
      // Reopen midway through closing, then close again. No stale visibility set
      // from the interrupted timeline may hide the newly opened papers.
      await page.eval(()=>document.querySelector('[data-project="culprit"] .drawer-front').click());
      await sleep(300);
      await page.eval(()=>document.querySelector('[data-project="lucide"] .drawer-front').click());
      await sleep(180);
      await page.eval(()=>document.querySelector('[data-project="culprit"] .drawer-front').click());
      await synchronized(page,'culprit');
      await sleep(150);
      assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('#drawer-culprit')).visibility),'visible');
      await page.eval(()=>document.querySelector('[data-project="culprit"] .drawer-front').click());
      await synchronized(page,'culprit');
      assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('#drawer-culprit')).visibility),'hidden');
      assert.equal(page.consoleErrors.length,0);
      console.log(`ok ${width}: hover/selected file close, per-frame mask/front synchronization, interrupted reopen, no lingering papers`);
    }finally{await page.close();}
  }
}finally{await browser.close();}
