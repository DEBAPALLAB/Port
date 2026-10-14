import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const out = '.taste-skill/personal-cabinet';
mkdirSync(out, { recursive:true });
const browser = await Browser.launch();
const base = process.env.PERSONAL_BASE || 'http://127.0.0.1:5173';
try {
  for (const width of [1440,768,390]) {
    const page = await browser.newPage({width, height:width === 390 ? 844 : 1000, mobile:width === 390});
    try {
      await page.goto(`${base}/#workflow`, {settleMs:1000});
      assert.equal(await page.eval(()=>document.querySelector('.journey-shell').hidden),false,'hash links unlock the destination');
      assert.equal(await page.eval(()=>document.querySelectorAll('.cabinet-drawer').length),9);
      assert.equal(await page.eval(()=>document.querySelector('.site-header a[href="/about/"]').textContent),'About');
      await page.eval(()=>document.querySelector('.collection-heading').scrollIntoView({behavior:'instant'}));
      await sleep(900);
      await page.screenshot({path:`${out}/${width}-cabinet-closed.jpg`,quality:90});
      await page.eval(()=>document.querySelectorAll('.drawer-front')[4].click());
      await sleep(850);
      assert.equal(await page.eval(()=>document.querySelectorAll('.drawer-front')[4].getAttribute('aria-expanded')),'true');
      assert.equal(await page.eval(()=>document.querySelectorAll('.drawer-files')[4].inert),false);
      if(width === 390) await page.eval(()=>document.querySelectorAll('.cabinet-drawer')[4].scrollIntoView({behavior:'instant',block:'start'}));
      assert.equal(await page.eval(()=>[...document.querySelectorAll('#drawer-gdc .folder-content button, #drawer-gdc .folder-content a')].every(node=>{
        const box=node.getBoundingClientRect(), x=box.left+box.width/2,y=box.top+box.height/2;
        return node.contains(document.elementFromPoint(x,y));
      })),true,'folder actions are physically clickable, not covered by drawer front');
      await page.screenshot({path:`${out}/${width}-cabinet-open.jpg`,quality:90});
      await page.eval(()=>document.querySelector('#drawer-gdc .folder-content button').click());
      await sleep(900);
      assert.equal(await page.eval(()=>document.querySelector('.project-file-toolbar h2').textContent),'GDC Dibrugarh');
      await page.eval(()=>document.querySelector('.file-return').click());
      await page.eval(()=>document.querySelector('.cabinet-archive').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
      await sleep(70);
      assert.equal(await page.eval(()=>document.querySelectorAll('.drawer-front[aria-expanded="true"]').length),0);
      await page.eval(()=>[...document.querySelectorAll('.collection-filters button')].find(b=>b.textContent==='Concepts').click());
      await sleep(100);
      assert.equal(await page.eval(()=>document.querySelectorAll('.cabinet-drawer').length),1);
      assert.equal(await page.eval(()=>document.querySelector('.drawer-front').textContent.includes('Culprit')),true);
      assert.equal(await page.eval(()=>document.documentElement.scrollWidth <= innerWidth),true,'cabinet no page overflow');
      await page.goto(`${base}/about/`,{settleMs:1200});
      await page.screenshot({path:`${out}/${width}-about-hero.jpg`,quality:90});
      assert.equal(await page.eval(()=>document.querySelectorAll('h1').length),1);
      assert.equal(await page.eval(()=>document.querySelectorAll('.personal-chapter').length),4);
      await page.eval(()=>document.querySelectorAll('.personal-story-stage button')[2].click());
      await sleep(1000);
      assert.equal(await page.eval(()=>document.querySelector('.personal-stage-frame').textContent.includes('A new city.')),true);
      await page.screenshot({path:`${out}/${width}-about-story.jpg`,quality:90});
      await page.eval(()=>document.querySelectorAll('.personal-competition-book button')[6].click());
      await sleep(550);
      assert.match(await page.eval(()=>document.querySelector('.personal-competition-note').textContent),/Cineblitz.*3rd place/s);
      await page.eval(()=>document.querySelector('.personal-competition-section').scrollIntoView({behavior:'instant'}));
      await sleep(900);
      await page.screenshot({path:`${out}/${width}-about-competitions.jpg`,quality:90});
      await page.eval(()=>document.querySelector('.personal-music').scrollIntoView({behavior:'instant'}));
      await sleep(900);
      await page.screenshot({path:`${out}/${width}-about-music.jpg`,quality:90});
      assert.equal(await page.eval(()=>document.documentElement.scrollWidth <= innerWidth),true,'about no page overflow');
      assert.equal(await page.eval(()=>document.querySelectorAll('.personal-photo img').length),0,'no invented photos');
      assert.equal(page.consoleErrors.length,0, 'no runtime errors');
      console.log(`ok ${width}: drawer selection, escape, filtering, navigation, story chapters, competitions, overflow`);
    } finally { await page.close(); }
  }
  const page = await browser.newPage({width:390,height:844,mobile:true});
  try {
    await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await page.goto(`${base}/#workflow`,{settleMs:500});
    await page.eval(()=>document.querySelector('.drawer-front').focus());
    await sleep(100);
    assert.equal(await page.eval(()=>document.querySelector('.cabinet-drawer').dataset.open),'true','keyboard focus opens only the drawer');
    assert.equal(await page.eval(()=>document.querySelector('.drawer-front').getAttribute('aria-expanded')),'false','focus does not open notes');
    assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('.drawer-front')).transitionDuration),'0s');
    await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await sleep(100);
    assert.equal(await page.eval(()=>document.querySelector('.drawer-front').getAttribute('aria-expanded')),'true','Enter opens the notes');
    await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await sleep(100);
    assert.equal(await page.eval(()=>document.activeElement.classList.contains('preview-card-tab')),true,'the individual files are next in keyboard order');
    await page.goto(`${base}/about/`,{settleMs:600});
    assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('.personal-portrait')).animationName),'none');
    console.log('ok reduced motion and keyboard');
  } finally { await page.close(); }
} finally { await browser.close(); }

