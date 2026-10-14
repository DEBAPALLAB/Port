import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { Browser,sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const browser=await Browser.launch(),out='.taste-skill/drawer-cards';
mkdirSync(out,{recursive:true});
try {
  for(const width of [1440,768,390]) {
    const page=await browser.newPage({width,height:width===390?844:1000,mobile:width===390});
    try {
      await page.goto('http://127.0.0.1:5173/#workflow',{settleMs:800});
      await page.eval(()=>document.querySelectorAll('.drawer-front')[4].focus());
      await sleep(750);
      assert.equal(await page.eval(()=>document.querySelectorAll('.cabinet-drawer')[4].dataset.open),'true','focus opens the cabinet drawer');
      assert.equal(await page.eval(()=>document.querySelectorAll('.cabinet-drawer')[4].dataset.notesOpen),'false','preview keeps notes closed');
      assert.equal(await page.eval(()=>document.querySelector('#notes-gdc').inert),true,'closed notes cannot receive focus');
      assert.equal(await page.eval(()=>document.querySelectorAll('#drawer-gdc .drawer-preview-card[data-active="true"]').length),0,'cards stay inside until click');
      await page.eval(()=>{const drawer=document.querySelectorAll('.cabinet-drawer')[4];scrollTo({top:drawer.getBoundingClientRect().top+scrollY-340,behavior:'instant'});});
      assert.equal(await page.eval(()=>{const link=document.querySelector('#drawer-gdc .drawer-peek-live'),b=link.getBoundingClientRect();return link.contains(document.elementFromPoint(b.left+b.width/2,b.top+b.height/2));}),true,'live link is reachable in drawer preview');
      await page.screenshot({path:`${out}/${width}-drawer-preview.jpg`,quality:90});
      assert.equal(await page.eval(()=>[...document.querySelectorAll('#drawer-gdc .preview-card-tab')].every(tab=>{const b=tab.getBoundingClientRect();return tab.contains(document.elementFromPoint(b.left+b.width/2,b.top+b.height/2));})),true,'each file tab can be selected directly from the open drawer');
      await page.eval(()=>document.querySelector('#drawer-gdc .preview-card-tab').click());
      await sleep(750);
      await page.eval(()=>{const drawer=document.querySelectorAll('.cabinet-drawer')[4];scrollTo({top:drawer.getBoundingClientRect().top+scrollY-(innerWidth<481?230:340),behavior:'instant'});});
      for(const index of [0,1,2]) {
        if(width===390) await page.eval(index=>document.querySelectorAll('.cabinet-drawer')[4].querySelectorAll('.drawer-mobile-selector button')[index].click(),index);
        else {
          const point=await page.eval(index=>{const box=document.querySelectorAll('#drawer-gdc .drawer-card-selector button')[index].getBoundingClientRect();return{x:box.left+box.width/2,y:box.top+box.height/2};},index);
          await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
        }
        await sleep(width===390?1000:650);
        assert.equal(await page.eval(index=>document.querySelectorAll('#drawer-gdc .drawer-preview-card')[index].dataset.active,index),'true','the selected card lifts');
        assert.equal(await page.eval(index=>document.querySelectorAll('#drawer-gdc .drawer-preview-card')[index].querySelector('.preview-card-action').inert,index),false);
        const bounds=await page.eval(index=>{
          const root=document.querySelectorAll('.cabinet-drawer')[4];
          const card=root.querySelectorAll('.drawer-preview-card')[index].getBoundingClientRect();
          const front=root.querySelector('.drawer-front').getBoundingClientRect();
          return {cardBottom:card.bottom,frontTop:front.top};
        },index);
        assert.ok(bounds.cardBottom<=bounds.frontTop,'raised card is clear of the drawer front');
        await page.screenshot({path:`${out}/${width}-card-${index}.jpg`,quality:90});
      }
      await page.eval(()=>{const slider=document.querySelector('#drawer-gdc input[type=range]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(slider,'1');slider.dispatchEvent(new Event('input',{bubbles:true}));});
      await sleep(700);
      assert.equal(await page.eval(()=>document.querySelector('#drawer-gdc .screen-preview').dataset.active),'true','slider selects and lifts the corresponding file');
      assert.ok(await page.eval(()=>document.querySelector('#drawer-gdc img').naturalWidth)>0,'real project screenshot loaded');
      assert.equal(await page.eval(()=>document.querySelector('#drawer-gdc .folder-live-link').href),'https://gdcdibrugarh.in/');
      if(width===390) assert.equal(await page.eval(()=>document.querySelectorAll('.cabinet-drawer')[4].querySelector('.drawer-inspector').getBoundingClientRect().bottom<=document.querySelectorAll('.cabinet-drawer')[5].getBoundingClientRect().top),true,'phone drawer has room for its controls');
      await page.eval(()=>document.querySelector('#drawer-gdc .drawer-inspector').scrollIntoView({behavior:'instant',block:'center'}));
      await sleep(200);
      assert.equal(await page.eval(()=>[...document.querySelectorAll('#drawer-gdc .folder-content button,#drawer-gdc .folder-content a')].every(node=>{const b=node.getBoundingClientRect();return node.contains(document.elementFromPoint(b.left+b.width/2,b.top+b.height/2));})),true,'primary actions remain physically reachable');
      assert.equal(await page.eval(()=>document.documentElement.scrollWidth<=innerWidth),true,'no page overflow');
      assert.equal(page.consoleErrors.length,0);
      await page.eval(()=>document.querySelectorAll('.drawer-front')[4].dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
      await sleep(100);
      assert.equal(await page.eval(()=>document.querySelectorAll('.cabinet-drawer')[4].dataset.notesOpen),'false','Escape closes notes');
      assert.equal(await page.eval(()=>document.querySelector('#notes-gdc').inert),true,'Escape removes notes from keyboard navigation');
      console.log(`ok ${width}: hover/tap selection, card clearance, real screenshot, live link, action hit targets, layout`);
    } finally {await page.close();}
  }
} finally {await browser.close();}
