import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const out = process.argv[2] || '.taste-skill/motion';
mkdirSync(out, { recursive: true });
const browser = await Browser.launch();
const results = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ width, height: width === 390 ? 844 : 900, mobile: width === 390 });
    await page.goto('http://127.0.0.1:4174', { settleMs: 1800 });
    await page.eval(() => {
      window.__frameTimes = []; window.__sampling = true;
      let last;
      function sample(time) { if (last) window.__frameTimes.push(time-last); last=time; if(window.__sampling) requestAnimationFrame(sample); }
      requestAnimationFrame(sample);
    });
    const button = await page.eval(() => { const r=document.querySelector('#start-journey').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
    await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...button, button: 'left', clickCount: 1 });
    await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...button, button: 'left', clickCount: 1 });
    await sleep(4600);
    await page.screenshot({path:`${out}/${width}-work.jpg`,quality:88});
    const frames = await page.eval(() => { window.__sampling=false; const f=window.__frameTimes.sort((a,b)=>a-b); return {samples:f.length,p50:f[Math.floor(f.length*.5)],p95:f[Math.floor(f.length*.95)],over50:f.filter(x=>x>50).length,phase:document.querySelector('.site-root').dataset.journeyPhase,overflow:document.documentElement.scrollWidth>innerWidth}; });
    await page.eval(() => document.getElementById('workflow').scrollIntoView({behavior:'instant'}));
    await sleep(1400);
    await page.screenshot({path:`${out}/${width}-workflow.jpg`,quality:88});
    await page.eval(() => document.getElementById('about').scrollIntoView({behavior:'instant'}));
    await sleep(1000);
    await page.screenshot({path:`${out}/${width}-about.jpg`,quality:88});
    await page.goto('http://127.0.0.1:4174', {settleMs:1500});
    await page.eval(() => { document.querySelector('#start-journey').click(); document.querySelector('a[href="#about"]').click(); });
    await sleep(4200);
    const interrupted = await page.eval(() => ({focus:document.activeElement.id,phase:document.querySelector('.site-root').dataset.journeyPhase}));
    if(interrupted.focus !== 'about-title' || interrupted.phase !== 'active') throw new Error(`Interrupted navigation failed: ${JSON.stringify(interrupted)}`);
    await page.eval(() => document.querySelector('.site-footer button').click());
    await sleep(1000);
    const replay = await page.eval(() => ({phase:document.querySelector('.site-root').dataset.journeyPhase,thread:!!document.querySelector('.journey-thread'),locked:document.querySelector('.journey-shell').hidden}));
    if(replay.phase !== 'idle' || replay.thread || !replay.locked) throw new Error('Replay did not fully reset the journey');
    // Tap the actual 3D piece rather than relying only on the HTML CTA.
    const piece = await page.eval(() => {const r=document.querySelector('.first-piece-anchor').getBoundingClientRect();return {x:r.left,y:r.top};});
    await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...piece});
    await sleep(300);
    await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...piece,button:'left',clickCount:1});
    await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...piece,button:'left',clickCount:1});
    await sleep(100);
    const pieceWorks = await page.eval(() => document.querySelector('.site-root').dataset.journeyMode === 'cinematic');
    if(!pieceWorks) throw new Error(`3D piece tap failed at ${width}px`);
    // Manual scrolling during the initial wait must permanently cancel the handoff.
    await page.wheel(160);
    await sleep(200);
    const interruptedY = await page.eval('scrollY');
    await sleep(4200);
    const yielded = await page.eval(() => ({y:scrollY,phase:document.querySelector('.site-root').dataset.journeyPhase}));
    if(Math.abs(yielded.y-interruptedY)>2 || yielded.phase !== 'active') throw new Error(`Manual scrolling was overridden: ${JSON.stringify(yielded)}`);
    results.push({width,...frames,interrupted,replay,pieceWorks,yielded,errors:page.consoleErrors});
    await page.close();
  }
} finally { await browser.close(); }
writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
