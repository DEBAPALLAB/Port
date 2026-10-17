import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {Browser,sleep} from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const out='.taste-skill/drawer-physics';mkdirSync(out,{recursive:true});
const browser=await Browser.launch();
async function key(page,key,code) {
 for(const type of ['keyDown','keyUp']) await page.send('Input.dispatchKeyEvent',{type,key,code:key===' '?'Space':key,windowsVirtualKeyCode:code,...(key==='Enter'&&type==='keyDown'?{text:'\r'}:{})});
}
async function clickAt(page,p,mobile=false) {
 if(mobile) {
  await page.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});
  await page.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 } else for(const type of ['mousePressed','mouseReleased']) await page.send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});
}
async function controlPoint(page,selector) {
 return page.eval(s=>{
  const e=document.querySelector(s),r=e.getBoundingClientRect(),p={x:r.left+r.width/2,y:r.top+r.height/2};
  if(!e.contains(document.elementFromPoint(p.x,p.y))) throw Error('Covered control: '+s);
  return p;
 },selector);
}
try {
 for(const width of [1440,768,390]) {
  const mobile=width===390;
  const page=await browser.newPage({width,height:mobile?844:900,mobile});
  const d='.cabinet-drawer[data-project="gdc"]';
  try {
   await page.goto('http://127.0.0.1:5173/#workflow',{settleMs:800});
   await page.eval(s=>document.querySelector(s).scrollIntoView({block:'center',behavior:'instant'}),d);
   const position=await controlPoint(page,d+' .drawer-front');
   const initialScroll=await page.eval(()=>scrollY);
   if(!mobile) {
    await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...position});
    await sleep(210);
    const leading=await page.eval(s=>{const d=document.querySelector(s);return {front:d.querySelector('.drawer-face').getBoundingClientRect().top,card:d.querySelector('.story-preview').getBoundingClientRect().top};},d);
    await page.screenshot({path:out+'/'+width+'-pull-early.jpg',quality:92});
    await sleep(950);
    assert.equal(await page.eval(s=>document.querySelector(s).dataset.open,d),'true','hover pulls out the full mechanism');
    assert.equal(await page.eval(s=>document.querySelector(s).dataset.pinned,d),'false','hover does not pin');
    assert.equal(await page.eval(s=>getComputedStyle(document.querySelector(s+' .drawer-inspector')).visibility,d),'hidden','hover never exposes a side panel');
    assert.equal(await page.eval(()=>scrollY),initialScroll,'hover never scrolls');
    await page.screenshot({path:out+'/'+width+'-hover.jpg',quality:92});
    const settled=await page.eval(s=>document.querySelector(s+' .drawer-face').getBoundingClientRect().top,d);
    assert.ok(settled>leading.front+15,'the front travels over time rather than snapping');
   }
   await clickAt(page,position,mobile);
   await sleep(1000);
   assert.equal(await page.eval(s=>document.querySelector(s).dataset.pinned,d),'true','first click at the original pointer position pins');
   assert.equal(await page.eval(()=>scrollY),initialScroll,'pinning does not scroll');
   assert.equal(await page.eval(s=>document.querySelector(s+' .story-preview').dataset.active,d),'true');
   for(const index of [2,0,1]) {
    const selector=mobile?d+' .drawer-mobile-selector button:nth-child('+(index+1)+')':d+' .drawer-card-selector button:nth-child('+(index+1)+')';
    await page.eval(s=>document.querySelector(s).scrollIntoView({block:'nearest',behavior:'instant'}),selector);
    const y=await page.eval(()=>scrollY);
    const p=await controlPoint(page,selector);
    await clickAt(page,p,mobile);await sleep(950);
    assert.equal(await page.eval(({s,index})=>document.querySelectorAll(s+' .drawer-preview-card')[index].dataset.active,{s:d,index}),'true');
    assert.equal(await page.eval(()=>scrollY),y);
    const bounds=await page.eval(s=>{
     const d=document.querySelector(s),card=d.querySelector('[data-active=true]').getBoundingClientRect(),face=d.querySelector('.drawer-face').getBoundingClientRect();
     return {left:card.left,right:card.right,bottom:card.bottom,front:face.top,wellOverflow:getComputedStyle(d.querySelector('.drawer-paper-window')).overflow};
    },d);
    assert.ok(bounds.left>=0&&bounds.right<=width,JSON.stringify(bounds));
    assert.ok(bounds.bottom<=bounds.front+4,'raised file clears the front: '+JSON.stringify(bounds));
    assert.equal(bounds.wellOverflow,'clip');
   }
   await page.screenshot({path:out+'/'+width+'-selected.jpg',quality:92});
   const action=d+' .screen-preview .preview-card-action';
   await page.eval(s=>document.querySelector(s).scrollIntoView({block:'center',behavior:'instant'}),action);
   await clickAt(page,await controlPoint(page,action),mobile);await sleep(500);
   assert.equal(await page.eval(()=>document.querySelector('.project-file-dialog')?.open),true,'file action is reachable');
   await clickAt(page,await controlPoint(page,'.file-return'),mobile);await sleep(100);
   await key(page,'Escape',27);await sleep(850);
   assert.equal(await page.eval(s=>document.querySelector(s).dataset.open,d),'false','Escape dismisses even while pointer remains');
   await key(page,'Enter',13);await sleep(950);
   assert.equal(await page.eval(s=>document.querySelector(s).dataset.pinned,d),'true');
   await key(page,' ',32);await sleep(850);
   assert.equal(await page.eval(s=>document.querySelector(s).dataset.open,d),'false');
   if(!mobile) {
    await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:5,y:120});await sleep(250);
    await page.eval(s=>document.querySelector(s).scrollIntoView({block:'center',behavior:'instant'}),d);
    const p=await controlPoint(page,d+' .drawer-front');
    for(let i=0;i<4;i++) {
     await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await sleep(110);
     await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:5,y:120});await sleep(210);
    }
    await sleep(900);
    assert.equal(await page.eval(s=>document.querySelector(s).dataset.open,d),'false','rapid interrupted hover returns to rest');
    const rest=await page.eval(s=>{const m=new DOMMatrixReadOnly(getComputedStyle(document.querySelector(s+' .drawer-face')).transform);return {x:m.m41,y:m.m42,xx:m.m11,yy:m.m22};},d);
    assert.ok(Math.abs(rest.x)<.1&&Math.abs(rest.y)<.1&&Math.abs(rest.xx-1)<.001&&Math.abs(rest.yy-1)<.001,'no residual displacement after reversal');
    for (const neighbor of ['notaprompt','lucide']) {
     const n='.cabinet-drawer[data-project="'+neighbor+'"]';
     const next=await controlPoint(page,n+' .drawer-front');
     await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...next});
     await sleep(45);
     await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});
     await sleep(220);
     assert.equal(await page.eval(s=>document.querySelector(s).dataset.open,n),'false','crossing a neighbor does not pull it out');
     assert.equal(await page.eval(()=>document.querySelectorAll('.cabinet-drawer[data-notes-open="true"]').length),0,'crossing neighbors never exposes a side panel');
     assert.equal(await page.eval(({x,y,s})=>document.querySelector(s+' .drawer-front').contains(document.elementFromPoint(x,y)),{...p,s:d}),true,'middle drawer still receives the intended click');
    }
    await page.screenshot({path:out+'/'+width+'-hover-clear-sides.jpg',quality:92});
   }
   assert.equal(await page.eval(()=>document.documentElement.scrollWidth<=innerWidth),true);
   assert.equal(page.consoleErrors.length,0);
   console.log('ok '+width+': hover pull, fixed click target, spring settling, file clearance, clipping, hit targets, reversal, keyboard, no scroll/overflow');
  }finally{await page.close();}
 }
 const page=await browser.newPage({width:1440,height:900,reducedMotion:true});
 try {
  await page.goto('http://127.0.0.1:5173/#workflow',{settleMs:800});
  await page.eval(()=>{const e=document.querySelector('.drawer-front');e.focus();e.click();});await sleep(50);
  const first=await page.eval(()=>getComputedStyle(document.querySelector('.drawer-face')).transform);
  await sleep(150);
  assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('.drawer-face')).transform),first,'reduced motion settles immediately');
  console.log('ok reduced motion');
 }finally{await page.close();}
}finally{await browser.close();}
