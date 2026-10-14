import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const out='.taste-skill/project-files'; mkdirSync(out,{recursive:true});
const browser=await Browser.launch();
const base=process.env.PERSONAL_BASE || 'http://127.0.0.1:5173';
async function loaded(page) {
  for(let attempt=0;attempt<60;attempt++) {
    if(await page.eval(()=>document.querySelector('.project-file-dialog')?.dataset.ready==='true')) return;
    await sleep(150);
  }
  throw new Error('Complete file did not become ready');
}
try {
  for(const width of [1440,1200,768,390]) {
    const page=await browser.newPage({width,height:width===1200?700:width===390?844:1000,mobile:width===390});
    try {
      await page.goto(`${base}/#workflow`,{settleMs:900});
      assert.equal(await page.eval(()=>!!document.querySelector('.file-navigation')),false,'old tabs removed');
      await page.eval(()=>{const element=document.querySelector('#drawer-superforms .folder-content button'); element.focus(); element.click();});
      await loaded(page); await sleep(1000);
      const detail=await page.eval(()=>{
        const doc=document.querySelector('.project-file-body iframe').contentDocument;
        return {chapters:doc.querySelectorAll('[data-chapter]').length, images:doc.querySelectorAll('img').length, nav:doc.querySelector('.case-header'), overflow:document.documentElement.scrollWidth>innerWidth, frameOverflow:doc.documentElement.scrollWidth>doc.defaultView.innerWidth};
      });
      assert.ok(detail.chapters>=5,'complete study has actual chapters');
      assert.ok(detail.images>=4,'actual screenshots available');
      assert.equal(detail.nav,null,'embedded study does not duplicate navigation');
      assert.equal(detail.overflow,false); assert.equal(detail.frameOverflow,false);
      await page.screenshot({path:`${out}/${width}-open-superforms.jpg`,quality:90});
      await page.eval(()=>{
        const options=[...document.querySelector('.project-file-chapters select').options];
        const item=options.find(option=>/identity|edit|sanit|guard/i.test(option.textContent)) || options[2];
        const select=document.querySelector('.project-file-chapters select');
        select.value=item.value; select.dispatchEvent(new Event('change',{bubbles:true}));
      });
      await sleep(1400);
      assert.ok(await page.eval(()=>document.querySelector('.project-file-body iframe').contentWindow.scrollY>100),'chapter navigation scrolls inside file');
      await page.screenshot({path:`${out}/${width}-chapter.jpg`,quality:90});
      await page.eval(()=>{
        const doc=document.querySelector('.project-file-body iframe').contentDocument;
        const button=[...doc.querySelectorAll('button')].find(node=>node.textContent.trim()==='Apply this edit');
        if (!button) throw new Error('Missing complete edit experiment');
        button.click();
      });
      await sleep(3200);
      assert.equal(await page.eval(()=>document.querySelector('.project-file-body iframe').contentDocument.querySelectorAll('.sf-step[data-on="true"]').length),4,'the real edit experiment runs inside the file');
      await page.eval(()=>document.querySelector('.project-file-body iframe').contentDocument.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
      await sleep(100);
      assert.equal(await page.eval(()=>!!document.querySelector('.project-file-dialog')),false,'Escape inside iframe closes the file');
      assert.equal(await page.eval(()=>document.activeElement.closest('.drawer-files')?.id),'drawer-superforms','focus returns to the opener');
      assert.notEqual(await page.eval(()=>document.documentElement.style.overflow),'hidden');
      await page.eval(()=>document.querySelector('#drawer-culprit .folder-content button').click());
      await loaded(page);
      await page.eval(()=>document.querySelector('[aria-label="Next project file"]').click());
      await loaded(page);
      assert.equal(await page.eval(()=>document.querySelector('.project-file-toolbar h2').textContent),'Lucide Tech');
      await page.eval(()=>document.querySelector('.file-return').click());
      if(width===1440 || width===1200) {
        for(const id of ['mindspace','comparefi','luman','notaprompt','gdc','lucide','poker','culprit','superforms']) {
          await page.eval(id=>document.querySelector(`#drawer-${id} .folder-content button`).click(),id);
          await loaded(page);
          assert.ok(await page.eval(()=>document.querySelector('.project-file-body iframe').contentDocument.querySelectorAll('[data-chapter]').length)>=5,id+' complete chapters');
          assert.ok(await page.eval(()=>document.querySelector('.project-file-chapters nav').children.length)>=6,id+' chapter navigation');
          if(width===1200) assert.equal(await page.eval(()=>{
            const doc=document.querySelector('.project-file-body iframe').contentDocument;
            const facts=doc.querySelector('.case-facts');
            return facts.getBoundingClientRect().bottom<=doc.defaultView.innerHeight && [...facts.querySelectorAll('dd')].every(node=>node.textContent.trim());
          }),true,id+' complete facts fit the short laptop opening');
          await page.eval(()=>document.querySelector('.file-return').click());
        }
      }
      assert.equal(page.consoleErrors.length,0,'no runtime errors');
      console.log(`ok ${width}: complete file, screenshots, chapter navigation, Escape, focus, project switching, no overflow${width===1440?', all nine files':''}`);
    } finally {await page.close();}
  }
  const page=await browser.newPage({width:390,height:844,mobile:true});
  try {
    await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await page.goto(`${base}/#workflow`,{settleMs:600});
    await page.eval(()=>document.querySelector('#drawer-superforms .folder-content button').click());
    await loaded(page);
    assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('.project-file-cover')).transitionDuration),'0s');
    assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('.project-file-dialog')).animationName),'none');
    console.log('ok reduced motion');
  } finally {await page.close();}
} finally {await browser.close();}

