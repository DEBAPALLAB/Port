import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { Browser,sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const out='.taste-skill/voice-experience';mkdirSync(out,{recursive:true});
const browser=await Browser.launch({extraArgs:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required']});

// Only this test replaces the provider. The production app has no demo transport.
// Real Web Audio, getUserMedia, AudioWorklet, PCM encoding and cleanup still run.
function installFixture() {
  const nativeFetch=window.fetch.bind(window),NativeWebSocket=window.WebSocket;
  const nativeMic=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  window.__voiceTest={sent:[],streams:[],requests:0,deny:false,sockets:[]};
  navigator.mediaDevices.getUserMedia=async options=>{
    window.__voiceTest.requests++;
    if(window.__voiceTest.deny)throw new DOMException('Denied for test','NotAllowedError');
    const stream=await nativeMic(options);window.__voiceTest.streams.push(stream);return stream;
  };
  window.fetch=(url,options={})=>{
    if(url==='/api/voice-session')return Promise.resolve(new Response(JSON.stringify(options.method==='POST'?{token:'auth_tokens/browser-fixture',model:'gemini-3.1-flash-live-preview',voice:'Orus',maxSeconds:240,apiVersion:'v1beta'}:{ready:true}),{status:200,headers:{'Content-Type':'application/json'}}));
    return nativeFetch(url,options);
  };
  const pcm=new Uint8Array(4800),view=new DataView(pcm.buffer);
  for(let i=0;i<2400;i++)view.setInt16(i*2,Math.round(Math.sin(i/24000*2*Math.PI*220)*1800),true);
  let binary='';for(const byte of pcm)binary+=String.fromCharCode(byte);
  const tone=btoa(binary);
  window.WebSocket=class {
    constructor(url) {
      if(!url.includes('generativelanguage.googleapis.com'))return new NativeWebSocket(url);
      this.readyState=0;this.bufferedAmount=0;window.__voiceTest.sockets.push(this);
      setTimeout(()=>{if(this.readyState!==3){this.readyState=1;this.onopen?.();}},10);
    }
    emit(message){if(this.readyState===1)this.onmessage?.({data:JSON.stringify(message)});}
    send(data) {
      const message=JSON.parse(data);window.__voiceTest.sent.push(message);
      if(message.setup)setTimeout(()=>this.emit({setupComplete:{}}),10);
      if(message.clientContent)setTimeout(()=>{
        this.emit({serverContent:{outputTranscription:{text:'Superforms brings a brief, design, and responses into one form builder.'},modelTurn:{parts:[{inlineData:{data:tone,mimeType:'audio/pcm;rate=24000'}},{inlineData:{data:tone,mimeType:'audio/pcm;rate=24000'}}]}}});
        this.emit({toolCall:{functionCalls:[{id:'fixture-project',name:'show_project',args:{projectId:'superforms'}}]}});
        this.emit({serverContent:{turnComplete:true}});
      },20);
    }
    close(){this.readyState=3;}
  };
}

async function click(page,selector,mobile) {
  await page.eval(s=>document.querySelector(s).scrollIntoView({block:'center',behavior:'instant'}),selector);
  const point=await page.eval(s=>{
    const node=document.querySelector(s),r=node.getBoundingClientRect();const p={x:r.left+r.width/2,y:r.top+r.height/2};
    if(!node.contains(document.elementFromPoint(p.x,p.y)))throw Error('Covered control: '+s);
    return p;
  },selector);
  if(mobile){await page.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await page.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else for(const type of ['mousePressed','mouseReleased'])await page.send('Input.dispatchMouseEvent',{type,...point,button:'left',clickCount:1});
}
async function state(page,expected) {
  for(let i=0;i<60;i++) {
    if(await page.eval(()=>document.querySelector('.voice-experience').dataset.state)===expected)return;
    await sleep(100);
  }
  throw Error(`Expected ${expected}; got `+await page.eval(()=>({state:document.querySelector('.voice-experience').dataset.state,notice:document.querySelector('.voice-notice')?.textContent})));
}

try {
  for(const width of [1440,768,390]) {
    const mobile=width===390,page=await browser.newPage({width,height:mobile?844:1000,mobile});
    try {
      await page.goto('http://127.0.0.1:5173/#connect',{settleMs:900});
      await page.eval(()=>document.querySelector('.personal-invitation').scrollIntoView({block:'start',behavior:'instant'}));
      assert.equal(await page.eval(()=>document.documentElement.scrollWidth<=innerWidth),true,'no responsive overflow');
      await page.screenshot({path:`${out}/${width}-idle.jpg`,quality:92});
      // No credential is read or printed. Missing configuration has an honest UI.
      const configured=await page.eval(async()=>((await (await fetch('/api/voice-session')).json()).ready));
      if(!configured) {
        await click(page,'.voice-start',mobile);await state(page,'error');
        assert.match(await page.eval(()=>document.querySelector('.voice-notice').textContent),/not available yet/);
      }
      await page.eval(installFixture);
      await click(page,'.voice-listen',mobile);await state(page,'listening');
      assert.equal(await page.eval(()=>window.__voiceTest.requests),0,'listen requires no microphone');
      assert.match(await page.eval(()=>document.querySelector('.voice-caption').textContent),/Superforms/);
      assert.equal(await page.eval(()=>document.querySelector('.voice-recommendation').getAttribute('href')),'/work/superforms/');
      await click(page,'.voice-text-form input',mobile);
      await page.send('Input.insertText',{text:'What did you learn building Superforms?'});
      await click(page,'.voice-text-form button',mobile);await state(page,'listening');
      assert.ok(await page.eval(()=>window.__voiceTest.sent.some(message=>message.clientContent?.turns?.[0]?.parts?.[0]?.text==='What did you learn building Superforms?')),'typed questions reach the live session');
      await page.eval(()=>document.querySelector('.voice-experience').scrollIntoView({block:'start',behavior:'instant'}));
      await page.screenshot({path:`${out}/${width}-conversation.jpg`,quality:92});
      await click(page,'.voice-mic-control',mobile);await sleep(1800);
      assert.equal(await page.eval(()=>document.querySelector('.voice-mic-control').getAttribute('aria-pressed')),'true');
      assert.ok(await page.eval(()=>window.__voiceTest.sent.some(message=>message.realtimeInput?.audio?.mimeType==='audio/pcm;rate=16000')),'AudioWorklet streams real PCM chunks');
      await click(page,'.voice-mic-control',mobile);
      assert.equal(await page.eval(()=>window.__voiceTest.streams.every(stream=>stream.getAudioTracks().every(track=>!track.enabled))),true);
      assert.ok(await page.eval(()=>window.__voiceTest.sent.some(message=>message.realtimeInput?.audioStreamEnd)));
      await click(page,'.voice-sound-control',mobile);assert.equal(await page.eval(()=>document.querySelector('.voice-sound-control').getAttribute('aria-pressed')),'false');
      await click(page,'.voice-end',mobile);await state(page,'ended');
      assert.equal(await page.eval(()=>window.__voiceTest.streams.every(stream=>stream.getTracks().every(track=>track.readyState==='ended'))),true,'end releases device tracks');
      await page.eval(()=>{window.__voiceTest.deny=true;});
      await click(page,'.voice-start',mobile);await state(page,'error');
      assert.match(await page.eval(()=>document.querySelector('.voice-notice').textContent),/not granted/);
      await click(page,'.voice-listen',mobile);await state(page,'listening');
      await page.eval(()=>document.querySelector('.voice-transcript').open=true);
      assert.ok(await page.eval(()=>document.querySelectorAll('.voice-transcript-log p').length)>0);
      await click(page,'.voice-end',mobile);await state(page,'ended');
      assert.equal(page.consoleErrors.length,0,JSON.stringify(page.consoleErrors));
      console.log(`ok ${width}: responsive UI, honest unconfigured state, listen, captions, recommendations, real microphone PCM, mute, sound, end, permission recovery (fixture provider)`);
    }finally{await page.close();}
  }
}finally{await browser.close();}
