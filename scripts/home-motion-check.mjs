import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {Browser,sleep} from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const browser=await Browser.launch(),base=process.env.PERSONAL_BASE||'http://127.0.0.1:5173',out='.taste-skill/home-motion';mkdirSync(out,{recursive:true});
async function until(page,fn,label){for(let i=0;i<70;i++){if(await page.eval(fn))return;await sleep(100);}throw new Error(label);}
try{for(const width of [1440,390]){const page=await browser.newPage({width,height:width===390?844:900,mobile:width===390});try{
await page.goto(base,{settleMs:1000});assert.equal(await page.eval(()=>document.querySelector('.journey-shell').hidden),true);
await page.eval(()=>document.getElementById('start-journey').click());await until(page,()=>document.querySelector('.site-root').dataset.journeyPhase==='active','cinematic handoff');
await sleep(900);assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('.work-intro h2')).opacity),'1');
await page.eval(()=>document.querySelector('.folio-stage').scrollIntoView({block:'center',behavior:'instant'}));await until(page,()=>document.querySelector('.folio-stage').dataset.ready==='true','folio ready');
await page.eval(()=>{for(const index of [0,2,1,2])document.querySelectorAll('.layer-switch button')[index].click();});await until(page,()=>document.querySelector('.folio-stage').dataset.settled==='open','folio settles after fast changes');assert.equal(await page.eval(()=>document.querySelector('.folio-stage').dataset.layer),'2');
await page.screenshot({path:`${out}/${width}-folio.jpg`,quality:90});
await page.eval(()=>document.querySelectorAll('.screen-switch button')[1].click());await page.eval(()=>document.querySelectorAll('.decision-index button')[1].click());assert.equal(await page.eval(()=>document.querySelectorAll('.decision-index li')[1].dataset.active),'true');
await page.eval(()=>document.querySelector('.shelf-stage').scrollIntoView({block:'center',behavior:'instant'}));await until(page,()=>document.querySelector('.shelf-stage .stage3d').dataset.status==='ready','shelf ready');await sleep(650);
await page.eval(()=>document.querySelector('.shelf-list').scrollIntoView({block:'center',behavior:'instant'}));
const pos=await page.eval(()=>{const b=document.querySelector('.shelf-list a').getBoundingClientRect();return{x:b.left+4,y:b.top+4,top:b.top};});await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:pos.x,y:pos.y});await sleep(400);assert.ok(Math.abs(await page.eval(()=>document.querySelector('.shelf-list a').getBoundingClientRect().top)-pos.top)<.5,'shelf hover target stays still');
await page.eval(()=>document.querySelector('.personal-invitation').scrollIntoView({block:'center',behavior:'instant'}));await sleep(1100);assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('.personal-invitation-copy h2')).opacity),'1');assert.equal(await page.eval(()=>document.querySelector('.story-postcard').style.transform),'','entrance does not override postcard hover');await page.screenshot({path:`${out}/${width}-invitation.jpg`,quality:90});
assert.equal(await page.eval(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(page.consoleErrors.length,0);
await page.eval(()=>document.querySelector('.site-footer button').click());await sleep(200);assert.equal(await page.eval(()=>document.querySelector('.journey-shell').hidden),true);console.log(`ok ${width}: cascade handoff, rapid folio selection, editor, shelf, invitation, replay, no errors`);
}finally{await page.close();}}
const page=await browser.newPage({width:390,height:844,mobile:true});try{await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await page.goto(base,{settleMs:600});await page.eval(()=>document.getElementById('start-journey').click());await until(page,()=>document.querySelector('.site-root').dataset.journeyPhase==='active','reduced motion handoff');assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('.push-button')).transitionDuration),'0s');console.log('ok reduced motion: no animated handoff or hover transitions');}finally{await page.close();}
}finally{await browser.close();}
