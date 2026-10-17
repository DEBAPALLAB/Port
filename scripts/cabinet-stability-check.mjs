import assert from 'node:assert/strict';
import {Browser,sleep} from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const browser=await Browser.launch();
try{for(const width of [1440,1024,768,390]){const page=await browser.newPage({width,height:width<481?844:700,mobile:width<481});try{
await page.goto('http://127.0.0.1:5173/#workflow',{settleMs:900});
for(const index of [0,4,8]){
await page.eval(()=>document.querySelector('.cabinet-drawer[data-open="true"] .drawer-front')?.click());await sleep(500);
await page.eval(index=>{const d=document.querySelectorAll('.cabinet-drawer')[index];scrollTo({top:d.getBoundingClientRect().top+scrollY-95,behavior:'instant'});d.querySelector('.drawer-front').click();d.querySelector('.preview-card-tab').click();},index);await sleep(600);
const bounds=await page.eval(index=>{const d=document.querySelectorAll('.cabinet-drawer')[index],card=d.querySelector('[data-active=true]'),b=card.getBoundingClientRect(),panel=d.querySelector('.drawer-inspector').getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,panelLeft:panel.left,panelRight:panel.right,panelBottom:panel.bottom,delay:getComputedStyle(card).transitionDelay,scroll:scrollY};},index);
assert.ok(bounds.top>=80&&bounds.left>=0&&bounds.right<=width,JSON.stringify(bounds));if(width>480)assert.ok(bounds.panelLeft>=0&&bounds.panelRight<=width&&bounds.panelBottom<=700,JSON.stringify(bounds));assert.equal(bounds.delay,'0s');
if(width>480){for(const selected of [2,0,2,1]){const pt=await page.eval(({index,selected})=>{const r=document.querySelectorAll('.cabinet-drawer')[index].querySelectorAll('.drawer-card-selector button')[selected].getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};},{index,selected});await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...pt});for(const type of ['mousePressed','mouseReleased'])await page.send('Input.dispatchMouseEvent',{type,...pt,button:'left',clickCount:1});await sleep(100);}await sleep(550);assert.equal(await page.eval(index=>document.querySelectorAll('.cabinet-drawer')[index].querySelector('.screen-preview').dataset.active,index),'true','rapid clicks end on intended file');}
else{await page.eval(index=>document.querySelectorAll('.cabinet-drawer')[index].querySelectorAll('.drawer-mobile-selector button')[2].click(),index);await sleep(600);assert.equal(await page.eval(()=>scrollY),bounds.scroll,'mobile selection does not scroll the page');}
await page.screenshot({path:`.taste-skill/drawer-cards/${width}-compact-${index}.jpg`,quality:90});
}
assert.equal(page.consoleErrors.length,0);console.log(`ok ${width}: top-edge opening, card and panel bounds, no transition delays, rapid selection`);
}finally{await page.close();}}}finally{await browser.close();}
