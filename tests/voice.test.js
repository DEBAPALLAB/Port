import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoiceSessionHandler } from '../server/voiceSession.js';
import { buildVoiceSetup } from '../server/voicePersona.js';
import { PcmEncoder } from '../public/voice/pcm.js';
import { audioRate, decodePcm, encodePcm } from '../src/voice/audio.js';
import { voiceRecommendation } from '../src/voice/recommendations.js';
import LiveVoiceSession from '../src/voice/LiveVoiceSession.js';

async function request(handler,{method='POST',origin='http://localhost:5173',ip='127.0.0.1'}={}) {
  const headers={};let body='';
  const res={setHeader:(name,value)=>{headers[name]=value;},end:value=>{body=value;},statusCode:200};
  await handler({method,headers:{host:'localhost:5173',origin,'x-forwarded-for':ip},socket:{}},res);
  return {status:res.statusCode,headers,body:JSON.parse(body)};
}

test('voice session mints a one-use constrained token without returning the API key',async()=>{
  let sent;
  const now=()=>1800000000000;
  const handler=createVoiceSessionHandler({getEnv:()=>({GEMINI_API_KEY:'server-secret'}),now,fetchImpl:async(url,options)=>{
    sent={url,...options};return {ok:true,json:async()=>({name:'auth_tokens/short-lived'})};
  }});
  const result=await request(handler);
  assert.equal(result.status,200);
  assert.equal(result.body.token,'auth_tokens/short-lived');
  assert.equal(result.body.model,'gemini-3.1-flash-live-preview');
  assert.equal(result.body.maxSeconds,240);
  assert.equal(result.headers['Cache-Control'],'no-store, max-age=0');
  assert.ok(!JSON.stringify(result.body).includes('server-secret'));
  assert.equal(sent.headers['x-goog-api-key'],'server-secret');
  const config=JSON.parse(sent.body);
  assert.equal(config.uses,1);
  assert.equal(Date.parse(config.newSessionExpireTime)-now(),60000);
  assert.equal(Date.parse(config.expireTime)-now(),300000);
  assert.equal(config.bidiGenerateContentSetup.model,'models/gemini-3.1-flash-live-preview');
  assert.deepEqual(config.bidiGenerateContentSetup.generationConfig.responseModalities,['AUDIO']);
  assert.match(config.bidiGenerateContentSetup.systemInstruction.parts[0].text,/Mindspace was an internship, not a company I founded/);
  assert.ok(config.bidiGenerateContentSetup.tools[0].functionDeclarations.length===2);
  assert.ok(!('fieldMask' in config),'the whole setup is constrained');
});

test('voice readiness and missing keys need no Gemini request',async()=>{
  const handler=createVoiceSessionHandler({getEnv:()=>({}),fetchImpl:()=>assert.fail('must not call Gemini')});
  assert.deepEqual((await request(handler,{method:'GET'})).body,{ready:false});
  assert.equal((await request(handler)).status,503);
  assert.equal((await request(handler,{method:'DELETE'})).status,405);
  assert.equal((await request(handler,{origin:'https://another-site.example'})).status,403);
});

test('voice endpoint throttles and sanitizes provider failures',async()=>{
  let count=0;
  const handler=createVoiceSessionHandler({getEnv:()=>({GEMINI_API_KEY:'server-secret'}),fetchImpl:async()=>{
    count++;return {ok:false,status:403,json:async()=>({error:'server-secret: debug details'})};
  }});
  for(let i=0;i<5;i++) {
    const response=await request(handler);assert.equal(response.status,502);
    assert.ok(!JSON.stringify(response).includes('server-secret'));
  }
  assert.equal((await request(handler)).status,429);assert.equal(count,5);
});

test('voice persona keeps the requested model, grounded biography and interruptible audio',()=>{
  const setup=buildVoiceSetup();
  assert.equal(setup.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName,'Achird');
  assert.equal(setup.realtimeInputConfig.activityHandling,'START_OF_ACTIVITY_INTERRUPTS');
  assert.equal(setup.realtimeInputConfig.automaticActivityDetection.silenceDurationMs,650);
  assert.match(setup.systemInstruction.parts[0].text,/not a clone of his voice/);
  assert.match(setup.systemInstruction.parts[0].text,/do not invent/i);
});

test('streaming resampling preserves timing and PCM16 byte order across arbitrary blocks',()=>{
  for(const rate of [44100,48000]) {
    const encoder=new PcmEncoder(rate),chunks=[];
    const input=new Float32Array(rate).fill(.5);
    for(let i=0;i<input.length;i+=128)encoder.push(input.subarray(i,i+128),bytes=>chunks.push(bytes));
    assert.equal(chunks.length,50,'one second gives fifty 20ms chunks');
    assert.equal(chunks[0].byteLength,640);
    const view=new DataView(chunks[0]);assert.equal(view.getInt16(0,true),16384);
    const decoded=decodePcm(encodePcm(chunks[0]));assert.equal(decoded.length,320);assert.equal(decoded[0],.5);
  }
  const encoder=new PcmEncoder(16000),chunks=[];
  encoder.push(new Float32Array(320).fill(-1.5),bytes=>chunks.push(bytes));
  assert.equal(new DataView(chunks[0]).getInt16(0,true),-32768);
  assert.equal(audioRate('audio/pcm;rate=24000'),24000);
  assert.throws(()=>audioRate('audio/pcm;rate=999999'));
});

test('recommendations resolve only known portfolio destinations',()=>{
  assert.equal(voiceRecommendation('show_project',{projectId:'superforms'}).href,'/work/superforms/');
  assert.equal(voiceRecommendation('show_about',{chapter:'home'}).href,'/about/#home');
  assert.equal(voiceRecommendation('show_project',{projectId:'javascript:alert(1)'}),null);
  assert.equal(voiceRecommendation('show_about',{chapter:'__proto__'}),null);
  assert.equal(voiceRecommendation('execute_code',{}),null);
});

function harness() {
  const states=[],transcripts=[],recommendations=[],sent=[],sources=[],tracks=[];
  let microphoneRequests=0,context,capture;
  const node=()=>({connect(){},disconnect(){},gain:{value:1}});
  class AudioContext {
    constructor(){context=this;this.currentTime=0;this.destination={};this.audioWorklet={addModule:async()=>{}};}
    resume(){return Promise.resolve();}
    close(){this.closed=true;return Promise.resolve();}
    createGain(){return node();}
    createAnalyser(){return {...node(),fftSize:256,getFloatTimeDomainData:array=>array.fill(.1)};}
    createBuffer(channels,length,rate){return {duration:length/rate,copyToChannel(){}};}
    createBufferSource(){const n={...node(),start(at){this.at=at;},stop(){this.stopped=true;}};sources.push(n);return n;}
    createMediaStreamSource(){return node();}
  }
  class Worklet {
    constructor(){capture=this;this.port={onmessage:null,close(){}};}
    connect(){} disconnect(){}
  }
  class Socket {
    constructor(){this.readyState=0;this.bufferedAmount=0;queueMicrotask(()=>{this.readyState=1;this.onopen?.();queueMicrotask(()=>this.emit({setupComplete:{}}));});}
    send(data){sent.push(JSON.parse(data));}
    close(){this.readyState=3;}
    emit(message){this.onmessage?.({data:JSON.stringify(message)});}
  }
  const listeners=new Map();
  const doc={hidden:false,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
  const session=new LiveVoiceSession({onState:s=>states.push(s),onTranscript:t=>transcripts.push(t),onRecommendation:r=>recommendations.push(r)}, {
    AudioContext,AudioWorkletNode:Worklet,WebSocket:Socket,document:doc,
    mediaDevices:{getUserMedia:async constraints=>{
      assert.equal(constraints.video,false);microphoneRequests++;
      const track={enabled:true,stop(){this.stopped=true;}};tracks.push(track);
      return {getAudioTracks:()=>[track],getTracks:()=>[track]};
    }},
    fetch:async(url,options)=>({ok:true,json:async()=>options?.method==='POST'?{token:'auth_tokens/test',model:'gemini-3.1-flash-live-preview',voice:'Orus',maxSeconds:240}:{ready:true}}),
  });
  return {session,states,transcripts,recommendations,sent,sources,tracks,listeners,doc,get microphoneRequests(){return microphoneRequests;},get context(){return context;},get capture(){return capture;}};
}

test('listen mode never requests a microphone; audio parts are queued and interruptions stop all playback',async()=>{
  const h=harness(),s=h.session;
  try {
    assert.equal(await s.start({microphone:false}),true);
    assert.equal(h.microphoneRequests,0);
    const pcm=encodePcm(new Int16Array(480).buffer);
    s.handleMessage({serverContent:{inputTranscription:{text:'Tell me about Superforms'},outputTranscription:{text:'It is a form builder.'},modelTurn:{parts:[{inlineData:{data:pcm,mimeType:'audio/pcm;rate=24000'}},{inlineData:{data:pcm,mimeType:'audio/pcm;rate=24000'}}]}}});
    assert.equal(h.sources.length,2);
    assert.ok(Math.abs(h.sources[1].at-h.sources[0].at-.02)<.0001,'audio is scheduled contiguously');
    assert.equal(h.states.at(-1),'speaking');
    assert.ok(h.transcripts.some(t=>t.role==='user'&&t.text==='Tell me about Superforms'));
    assert.ok(h.transcripts.some(t=>t.role==='assistant'&&t.text==='It is a form builder.'));
    s.handleMessage({serverContent:{interrupted:true}});
    assert.ok(h.sources.every(n=>n.stopped));assert.equal(s.nodes.size,0);assert.equal(h.states.at(-1),'listening');
    assert.ok(h.transcripts.some(t=>t.interrupted));
    s.handleMessage({toolCall:{functionCalls:[{id:'one',name:'show_project',args:{projectId:'superforms'}}]}});
    assert.equal(h.recommendations[0].title,'Superforms');
    assert.equal(h.sent.at(-1).toolResponse.functionResponses[0].response.shown,true);
    const count=h.recommendations.length;
    s.handleMessage({toolCallCancellation:{ids:['cancelled']},toolCall:{functionCalls:[{id:'cancelled',name:'show_project',args:{projectId:'luman'}}]}});
    assert.equal(h.recommendations.length,count);
  } finally{s.dispose();}
  assert.equal(h.context.closed,true);assert.equal(s.timers.size,0);
});

test('microphone mute flushes the stream; end releases tracks, audio and listeners',async()=>{
  const h=harness(),s=h.session;
  try {
    await s.start({microphone:true});assert.equal(h.microphoneRequests,1);
    h.capture.port.onmessage({data:{pcm:new ArrayBuffer(640),level:.1}});
    assert.equal(h.sent.at(-1).realtimeInput.audio.mimeType,'audio/pcm;rate=16000');
    await s.setMicrophone(false);assert.equal(h.tracks[0].enabled,false);
    assert.equal(h.sent.at(-1).realtimeInput.audioStreamEnd,true);
    const count=h.sent.length;h.capture.port.onmessage({data:{pcm:new ArrayBuffer(640),level:.1}});assert.equal(h.sent.length,count);
    await s.setMicrophone(true);assert.equal(h.microphoneRequests,1);assert.equal(h.tracks[0].enabled,true);
    h.doc.hidden=true;h.listeners.get('visibilitychange')();
    assert.equal(s.closed,true);assert.ok(h.tracks.every(t=>t.stopped));assert.equal(h.listeners.size,0);
  }finally{s.dispose();}
});

test('cancelling while microphone permission is pending stops a late arriving stream',async()=>{
  const h=harness(),s=h.session;let resolvePermission;
  const track={stop(){this.stopped=true;}};
  s.deps.mediaDevices.getUserMedia=()=>new Promise(resolve=>{resolvePermission=resolve;});
  const starting=s.start({microphone:true});
  while(!resolvePermission)await new Promise(resolve=>setTimeout(resolve,0));
  s.stop();resolvePermission({getTracks:()=>[track],getAudioTracks:()=>[track]});
  assert.equal(await starting,false);assert.equal(track.stopped,true);assert.equal(s.closed,true);
});

test('repeated microphone activation shares one permission request',async()=>{
  const h=harness(),s=h.session;
  try {
    await s.start({microphone:false});
    await Promise.all([s.setMicrophone(true),s.setMicrophone(true),s.setMicrophone(true)]);
    assert.equal(h.microphoneRequests,1);assert.equal(h.tracks.length,1);
  }finally{s.dispose();}
  assert.ok(h.tracks.every(track=>track.stopped));
});

test('worklet startup failure releases the microphone while listen mode remains available',async()=>{
  const h=harness(),s=h.session;
  try {
    await s.start({microphone:false});
    h.context.audioWorklet.addModule=async()=>{throw new Error('Worklet failed');};
    assert.equal(await s.setMicrophone(true),false);
    assert.ok(h.tracks.every(track=>track.stopped));
    assert.equal(s.stream,null);assert.equal(s.closed,false);assert.equal(s.ready,true);
  }finally{s.dispose();}
});
