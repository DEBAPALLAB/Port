import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const out='.taste-skill/working-files';mkdirSync(out,{recursive:true});
const browser=await Browser.launch(),results=[];
try{
  for(const width of [1440,768,390]){
    const page=await browser.newPage({width,height:width===390?844:1000,mobile:width===390});
    await page.goto('http://127.0.0.1:4174',{settleMs:1200});
    await page.eval(()=>document.querySelector('#start-journey').click());await sleep(4500);
    await page.screenshot({path:out+'/'+width+'-superforms.jpg',quality:90});
    await page.eval(()=>document.querySelector('.folio-controls button').click());await sleep(1100);
    if(!await page.eval(()=>document.querySelector('.folio-stage').dataset.settled==='open'))throw new Error('Folio did not settle open');
    await page.screenshot({path:out+'/'+width+'-folio.jpg',quality:90});
    await page.eval(()=>document.querySelector('.form-lab').scrollIntoView({behavior:'instant'}));await sleep(400);
    await page.eval(()=>{document.querySelector('.guard-action').click();document.querySelector('.implementation-note-toggle').click();});
    if(!await page.eval(()=>JSON.parse(document.querySelector('#study-schema code').textContent).id==='focus'))throw new Error('Identity guard failed');
    await page.screenshot({path:out+'/'+width+'-engineering.jpg',quality:90});
    await page.eval(()=>document.querySelectorAll('.lab-mobile-navigation button')[1].click());
    await page.eval(()=>document.querySelector('.respondent-paper form').requestSubmit());
    if(!await page.eval(()=>document.querySelector('#study-error').textContent.includes('Choose an answer')))throw new Error('Missing-answer validation failed');
    await page.eval(()=>{document.querySelectorAll('.study-answers input')[1].click();document.querySelector('.respondent-paper form').requestSubmit();});
    if(!await page.eval(()=>JSON.parse(document.querySelector('.study-result code').textContent).value==='Frontend craft'))throw new Error('Response contract failed');
    await page.eval(()=>document.querySelector('.respondent-paper').scrollIntoView({behavior:'instant',block:'center'}));await sleep(400);
    await page.screenshot({path:out+'/'+width+'-response.jpg',quality:90});
    await page.eval(()=>document.querySelectorAll('.answer-options button')[1].click());
    await page.eval(()=>document.querySelector('#workflow').scrollIntoView({behavior:'instant'}));await sleep(500);
    await page.screenshot({path:out+'/'+width+'-files.jpg',quality:90});
    for (const id of ['mindspace', 'poker', 'luman']) {
      await page.eval(id=>document.querySelector(`#drawer-${id} .folder-content button`).click(), id);
      let ready = false;
      for (let attempt=0; attempt<60; attempt++) {
        ready = await page.eval(()=>document.querySelector('.project-file-dialog')?.dataset.ready === 'true');
        if (ready) break;
        await sleep(150);
      }
      if (!ready) throw new Error('Complete file did not load: '+id);
      await sleep(1000);
      if (!await page.eval(()=>document.querySelector('.project-file-body iframe').contentDocument.querySelectorAll('[data-chapter]').length >= 5)) throw new Error('Incomplete project file: '+id);
      await page.screenshot({path:out+'/'+width+'-'+id+'-complete-file.jpg',quality:90});
      await page.eval(()=>document.querySelector('.file-return').click());
    }
    await page.eval(()=>{document.querySelector('#connect').scrollIntoView({behavior:'instant'});document.querySelectorAll('.placement-slots button')[2].click();});await sleep(1200);
    await page.eval(()=>document.querySelector('.invitation-board').scrollIntoView({behavior:'instant',block:'center'}));await sleep(400);
    await page.screenshot({path:out+'/'+width+'-invitation.jpg',quality:90});
    const state=await page.eval(()=>({overflow:document.documentElement.scrollWidth>innerWidth,decorativeHandoff:!!document.querySelector('.chapter-handoff'),intent:document.querySelector('.invitation-board').dataset.intent,headings:[...document.querySelectorAll('.journey-shell h2')].map(h=>({text:h.textContent,lines:Math.round(h.clientHeight/parseFloat(getComputedStyle(h).lineHeight))}))}));
    if(state.overflow||state.decorativeHandoff||page.consoleErrors.length)throw new Error('Browser state failed '+JSON.stringify({state,errors:page.consoleErrors}));
    results.push({width,...state,errors:page.consoleErrors});await page.close();
  }
  const page=await browser.newPage({width:390,height:844,mobile:true,reducedMotion:true});
  await page.goto('http://127.0.0.1:4174',{settleMs:800});await page.eval(()=>document.querySelector('#start-journey').click());await sleep(500);
  const reduced=await page.eval(()=>({phase:document.querySelector('.site-root').dataset.journeyPhase,focus:document.activeElement.id,oldReader:!!document.querySelector('.case-reader')}));
  if(reduced.phase!=='active'||reduced.focus!=='work-title'||reduced.oldReader)throw new Error('Reduced reading route failed');
  results.push({reducedMotion:true,...reduced});await page.close();
}finally{await browser.close();}
writeFileSync(out+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
