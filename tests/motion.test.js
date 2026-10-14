import test from 'node:test';
import assert from 'node:assert/strict';
import { createFrameLoop } from '../src/frameLoop.js';
import { buildThread, threadPointAtY } from '../src/threadGeometry.js';

function harness() {
  let id=0, draws=0; const pending=new Map(), deltas=[];
  const loop=createFrameLoop({draw:()=>draws++,step:delta=>{deltas.push(delta);},request:fn=>{pending.set(++id,fn);return id;},cancel:id=>pending.delete(id)});
  return {loop,pending,deltas,get draws(){return draws;},tick(now){const callbacks=[...pending.values()];pending.clear();callbacks.forEach(fn=>fn(now));}};
}
test('hover, resize and cascade invalidations share exactly one queued frame',()=>{
  const h=harness();h.loop.start();
  for(let i=0;i<100;i++)h.loop.invalidate();
  assert.equal(h.pending.size,1);h.tick(100);assert.equal(h.draws,1);assert.equal(h.pending.size,1);
  h.loop.stop();h.tick(116);assert.equal(h.pending.size,0);
});
test('offscreen time does not advance the cascade and destroying cancels work',()=>{
  const h=harness();h.loop.start();h.tick(100);h.tick(116);
  h.loop.setVisible(false);assert.equal(h.pending.size,0);
  h.loop.invalidate();assert.equal(h.pending.size,0);
  h.loop.setVisible(true);h.tick(5000);h.tick(5016);
  assert.deepEqual(h.deltas,[0,.016,0,.016]);
  h.loop.destroy();h.loop.invalidate();assert.equal(h.pending.size,0);
});
test('a long foreground frame is bounded rather than teleporting the pieces',()=>{
  const h=harness();h.loop.start();h.tick(100);h.tick(1000);assert.equal(h.deltas[1],.05);
});
test('pointer and scroll invalidations cannot repeatedly reset an active animation clock',()=>{
  const h=harness();h.loop.start();h.tick(100);
  for(let i=1;i<=20;i++) { for(let event=0;event<6;event++)h.loop.start(); h.tick(100+i*16); }
  assert.equal(h.pending.size,1);
  assert.ok(Math.abs(h.deltas.reduce((sum,dt)=>sum+dt,0)-.32)<1e-9);
  h.loop.stop();h.loop.start();h.tick(5000);assert.equal(h.deltas.at(-1),0);
});
test('the continuous thread fits mobile and desktop gutters and follows reading height',()=>{
  for(const width of [320,390,768,1440]) {
    const g=buildThread({width,start:{x:width/2,y:800},stops:[960,2300,3900],end:4500});
    assert.equal(g.samples[0].length,0);
    for(let i=1;i<g.samples.length;i++) {
      assert.ok(g.samples[i].y>g.samples[i-1].y);
      assert.ok(g.samples[i].x>=0 && g.samples[i].x<width);
      assert.ok(g.samples[i].length>g.samples[i-1].length);
      if(width<1000 && g.samples[i].y>=960) assert.ok(g.samples[i].x+7<width*.06, 'the moving tip clears the content gutter');
    }
    const p=threadPointAtY(g.samples,2345);assert.equal(p.y,2345);
    assert.equal(threadPointAtY(g.samples,0).length,0);
    assert.equal(threadPointAtY(g.samples,Infinity).length,g.length);
  }
});
