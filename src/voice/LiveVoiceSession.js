import { audioRate, decodePcm, encodePcm } from './audio.js';
import { voiceRecommendation } from './recommendations.js';
import { openingPrompt } from './openers.js';



export default class LiveVoiceSession {
  constructor(callbacks={},dependencies={}) {
    this.callbacks=callbacks;
    this.deps={
      fetch:(...args)=>globalThis.fetch(...args),
      WebSocket:globalThis.WebSocket,
      AudioContext:globalThis.AudioContext||globalThis.webkitAudioContext,
      mediaDevices:globalThis.navigator?.mediaDevices,
      AudioWorkletNode:globalThis.AudioWorkletNode,
      document:globalThis.document,
      ...dependencies,
    };
    this.closed=false;this.ready=false;this.muted=true;this.sound=true;
    this.nodes=new Set();this.timers=new Set();this.playAt=0;
    this.transcripts={};this.nextTranscript=0;this.inputLevel=0;
    this.lastActivity=Date.now();this.messageQueue=Promise.resolve();
  }
  state(value) {if(!this.closed)this.callbacks.onState?.(value);}
  assertOpen() {if(this.closed)throw new DOMException('Conversation ended.','AbortError');}
  timer(fn,ms) {
    const id=setTimeout(()=>{this.timers.delete(id);fn();},ms);
    this.timers.add(id);return id;
  }
  clearTimer(id) {clearTimeout(id);this.timers.delete(id);}
  send(message) {
    if(!this.closed&&this.socket?.readyState===1) {
      if(this.socket.bufferedAmount>256000) {this.fail('Your connection is falling behind. Please reconnect.');return false;}
      this.socket.send(JSON.stringify(message));return true;
    }
    return false;
  }
  async requestSession(options={}) {
    const controller=new AbortController();
    const cancel=()=>controller.abort();
    this.abort.signal.addEventListener('abort',cancel,{once:true});
    const timeout=this.timer(()=>controller.abort(),15000);
    try {
      // ?voice=Name on the page auditions another allowlisted voice (the server validates it).
      const audition=options.method==='POST'&&new URLSearchParams(globalThis.location?.search||'').get('voice');
      const url='/api/voice-session'+(audition?`?voice=${encodeURIComponent(audition)}`:'');
      const response=await this.deps.fetch(url,{...options,signal:controller.signal,cache:'no-store'});
      let data;
      try {data=await response.json();} catch {throw new Error('The voice service is not reachable. Please try again.');}
      return {ok:response.ok,data};
    } catch(error) {
      if(controller.signal.aborted&&!this.closed)throw new Error('The voice connection took too long. Please try again.');
      throw error;
    } finally {
      this.clearTimer(timeout);this.abort.signal.removeEventListener('abort',cancel);
    }
  }
  async start({microphone=true,prompt}={}) {
    this.state('connecting');
    this.abort=new AbortController();
    try {
      if(!this.deps.AudioContext||!this.deps.WebSocket) throw new Error('This browser cannot play the live conversation. Try a recent Chrome, Safari, Edge or Firefox.');
      // Resume in the original click gesture, before any network/permission wait.
      this.context=new this.deps.AudioContext({latencyHint:'interactive'});
      await this.context.resume();this.assertOpen();
      this.output=this.context.createGain();
      this.analyser=this.context.createAnalyser();this.analyser.fftSize=256;
      this.analyser.connect(this.output);this.output.connect(this.context.destination);
      this.levelSamples=new Float32Array(this.analyser.fftSize);
      const health=await this.requestSession();
      this.assertOpen();
      if(!health.ok||health.data.ready!==true) throw new Error('The voice guide is not available yet. You can still read my story.');
      if(microphone) await this.prepareMicrophone();
      this.assertOpen();
      const response=await this.requestSession({method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
      const credentials=response.data;
      this.assertOpen();
      if(!response.ok) throw new Error(credentials.error||'The voice connection could not start. Please try again.');
      if(!credentials.token?.startsWith('auth_tokens/')) throw new Error('The voice connection could not start. Please try again.');
      await this.connect(credentials);
      this.assertOpen();this.ready=true;
      this.muted=!microphone;
      this.callbacks.onMicrophone?.(microphone);
      this.state('listening');
      this.lastActivity=Date.now();
      this.timer(()=>this.stop('This conversation has finished. Start another whenever you like.'),Math.min(credentials.maxSeconds||240,240)*1000);
      this.checkIdle();
      this.onVisibility=()=>{if(this.deps.document.hidden)this.stop('Conversation paused when you left the page. Start again whenever you’re ready.');};
      this.deps.document?.addEventListener('visibilitychange',this.onVisibility);
      this.onPageHide=()=>this.stop();
      globalThis.addEventListener?.('pagehide',this.onPageHide);
      this.sendText(prompt||openingPrompt(),{hidden:!prompt});
      return true;
    } catch(error) {
      if(this.closed||error.name==='AbortError') return false;
      const permission=error.name==='NotAllowedError'||error.name==='PermissionDeniedError';
      const unavailable=error.name==='NotFoundError'||error.name==='NotReadableError';
      this.fail(permission?'Microphone access was not granted. Choose “Just listen” or type a question instead.':unavailable?'We couldn’t use that microphone. Choose “Just listen” or try another input.':error.message||'The voice connection could not start. Please try again.');
      return false;
    }
  }
  prepareMicrophone() {
    if(this.microphoneTask)return this.microphoneTask;
    this.microphoneTask=this.openMicrophone().catch(error=>{this.releaseMicrophone();throw error;}).finally(()=>{this.microphoneTask=null;});
    return this.microphoneTask;
  }
  async openMicrophone() {
    if(this.stream) return;
    if(!this.deps.mediaDevices?.getUserMedia||!this.context.audioWorklet) throw new Error('Live microphone input needs a secure connection and a supported browser. You can still choose “Just listen”.');
    const stream=await this.deps.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
    if(this.closed) {stream.getTracks().forEach(t=>t.stop());this.assertOpen();}
    this.stream=stream;
    await this.context.audioWorklet.addModule('/voice/pcm-capture.js');this.assertOpen();
    this.capture=new this.deps.AudioWorkletNode(this.context,'portfolio-pcm-capture',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[1]});
    this.microphone=this.context.createMediaStreamSource(stream);
    this.capture.port.onmessage=({data})=>{
      if(this.closed||this.muted||!this.ready) return;
      this.inputLevel=data.level;
      if(data.level>.025)this.lastActivity=Date.now();
      this.send({realtimeInput:{audio:{data:encodePcm(data.pcm),mimeType:'audio/pcm;rate=16000'}}});
    };
    this.microphone.connect(this.capture);this.capture.connect(this.context.destination);
    stream.getAudioTracks().forEach(track=>{track.onended=()=>{if(!this.closed)this.setMicrophone(false);};});
  }
  connect(credentials) {
    return new Promise((resolve,reject)=>{
      const timeout=this.timer(()=>reject(new Error('The voice connection took too long. Please try again.')),15000);
      const version=credentials.apiVersion==='v1alpha'?'v1alpha':'v1beta';
      const url=`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.${version}.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(credentials.token)}`;
      const socket=this.socket=new this.deps.WebSocket(url);
      this.rejectConnection=reject;
      socket.onopen=()=>this.send({setup:{model:`models/${credentials.model}`,generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:credentials.voice}}}}}});
      socket.onmessage=event=>{
        this.messageQueue=this.messageQueue.then(async()=>{
          if(this.closed)return;
          const text=typeof event.data==='string'?event.data:await event.data.text();
          this.assertOpen();
          const message=JSON.parse(text);
          if(message.setupComplete) {this.clearTimer(timeout);this.rejectConnection=null;resolve();}
          this.handleMessage(message);
        }).catch(error=>{if(!this.closed) {reject(error);if(this.ready)this.fail('The voice stream was interrupted. Please reconnect.');}});
      };
      socket.onerror=()=>{
        const error=new Error('The voice connection failed. Check your connection and try again.');
        if(this.ready)this.fail(error.message);else reject(error);
      };
      socket.onclose=()=>{
        this.clearTimer(timeout);
        if(this.closed)return;
        if(!this.ready)reject(new Error('The voice session was declined. Please try again shortly.'));
        else this.fail('The conversation disconnected. You can start again when you’re ready.');
      };
    });
  }
  appendTranscript(role,text) {
    if(!text)return;
    if(!this.transcripts[role])this.transcripts[role]={id:++this.nextTranscript,role,text:'',final:false};
    const entry=this.transcripts[role];entry.text=(entry.text+text).slice(-6000);
    this.callbacks.onTranscript?.({...entry});
  }
  finishTranscript(role,interrupted=false) {
    const entry=this.transcripts[role];
    if(entry)this.callbacks.onTranscript?.({...entry,final:true,interrupted});
    delete this.transcripts[role];
  }
  handleMessage(message) {
    if(this.closed)return;
    if(message.error) {this.fail('The voice service could not continue. Please start again.');return;}
    if(message.goAway) {this.stop('This voice session has finished. Start a fresh conversation whenever you like.');return;}
    const content=message.serverContent;
    if(content) {
      if(content.interrupted) {this.clearPlayback();this.finishTranscript('assistant',true);this.state('listening');}
      if(content.inputTranscription?.text) {this.lastActivity=Date.now();this.appendTranscript('user',content.inputTranscription.text);}
      if(content.outputTranscription?.text) {this.finishTranscript('user');this.appendTranscript('assistant',content.outputTranscription.text);}
      // 3.1 can return multiple parts and transcripts in a single message.
      for(const part of content.modelTurn?.parts||[]) {
        if(part.inlineData?.data&&part.inlineData.mimeType?.startsWith('audio/pcm')) this.play(part.inlineData);
      }
      if(content.turnComplete) {
        this.finishTranscript('user');this.finishTranscript('assistant');
        this.turnComplete=true;this.finishPlayback();
      }
    }
    const cancelled=new Set(message.toolCallCancellation?.ids||[]);
    if(message.toolCall) {
      const responses=[];
      for(const call of message.toolCall.functionCalls||[]) {
        if(cancelled.has(call.id))continue;
        const recommendation=voiceRecommendation(call.name,call.args);
        if(recommendation)this.callbacks.onRecommendation?.(recommendation);
        responses.push({id:call.id,name:call.name,response:recommendation?{shown:true,title:recommendation.title}:{shown:false,error:'Unknown portfolio item.'}});
      }
      if(responses.length)this.send({toolResponse:{functionResponses:responses}});
    }
  }
  play({data,mimeType}) {
    if(this.closed)return;
    const samples=decodePcm(data);
    if(!samples.length)return;
    const buffer=this.context.createBuffer(1,samples.length,audioRate(mimeType));
    buffer.copyToChannel(samples,0);
    const node=this.context.createBufferSource();node.buffer=buffer;node.connect(this.analyser);
    const at=Math.max(this.context.currentTime+.035,this.playAt);
    if(at-this.context.currentTime>30) {this.fail('The audio stream fell behind. Please reconnect.');return;}
    this.playAt=at+buffer.duration;this.nodes.add(node);this.turnComplete=false;
    node.onended=()=>{node.disconnect();this.nodes.delete(node);this.finishPlayback();};
    node.start(at);this.state('speaking');
  }
  finishPlayback() {
    if(this.turnComplete&&!this.nodes.size&&!this.closed)this.state('listening');
  }
  clearPlayback() {
    for(const node of this.nodes) {node.onended=null;try{node.stop();node.disconnect();}catch{}}
    this.nodes.clear();this.playAt=this.context?.currentTime||0;this.turnComplete=false;
  }
  sendText(text,{hidden=false}={}) {
    const value=text.trim().slice(0,500);
    if(!this.ready||!value||this.closed)return false;
    this.clearPlayback();this.finishTranscript('assistant',true);
    if(!hidden) {this.appendTranscript('user',value);this.finishTranscript('user');}
    this.lastActivity=Date.now();this.state('thinking');
    return this.send({clientContent:{turns:[{role:'user',parts:[{text:value}]}],turnComplete:true}});
  }
  async setMicrophone(enabled) {
    if(this.closed||!this.ready)return false;
    if(enabled&&this.stream?.getAudioTracks().every(track=>track.readyState==='ended')) {
      this.releaseMicrophone();
    }
    if(enabled&&!this.stream) {
      try {await this.prepareMicrophone();this.assertOpen();}
      catch(error) {if(!this.closed)this.callbacks.onNotice?.(error.name==='NotAllowedError'?'Microphone access was not granted. You can keep listening or type.':'The microphone could not start. You can keep listening or type.');return false;}
    }
    this.muted=!enabled;this.inputLevel=0;
    this.stream?.getAudioTracks().forEach(track=>{track.enabled=enabled;});
    if(!enabled)this.send({realtimeInput:{audioStreamEnd:true}});
    this.callbacks.onMicrophone?.(enabled);return true;
  }
  setSound(enabled) {this.sound=enabled;if(this.output)this.output.gain.value=enabled?1:0;}
  releaseMicrophone() {
    if(this.capture) {this.capture.port.onmessage=null;this.capture.disconnect();this.capture.port.close();}
    this.microphone?.disconnect();
    this.stream?.getTracks().forEach(track=>{track.onended=null;track.stop();});
    this.stream=null;this.capture=null;this.microphone=null;this.inputLevel=0;
  }
  levels() {
    let output=0;
    if(!this.closed&&this.analyser&&this.nodes.size) {
      this.analyser.getFloatTimeDomainData(this.levelSamples);
      for(const sample of this.levelSamples)output+=sample*sample;
      output=Math.sqrt(output/this.levelSamples.length);
    }
    return {input:this.muted?0:this.inputLevel,output,speaking:this.nodes.size>0&&!this.closed};
  }
  checkIdle() {
    this.timer(()=>{
      if(this.closed)return;
      if(!this.nodes.size&&Date.now()-this.lastActivity>90000)this.stop('The conversation ended after a quiet moment. Start again whenever you like.');
      else this.checkIdle();
    },15000);
  }
  fail(message) {
    if(this.closed)return;
    this.dispose();this.callbacks.onError?.(message);
  }
  stop(message='Conversation ended. Your microphone is off.') {
    if(this.closed)return;
    this.finishTranscript('user');this.finishTranscript('assistant');this.dispose();
    this.callbacks.onEnded?.(message);
  }
  dispose() {
    if(this.closed)return;
    this.closed=true;this.ready=false;this.muted=true;this.inputLevel=0;
    this.abort?.abort();
    this.rejectConnection?.(new DOMException('Conversation ended.','AbortError'));this.rejectConnection=null;
    for(const id of this.timers)clearTimeout(id);this.timers.clear();
    this.clearPlayback();
    if(this.socket) {this.socket.onopen=null;this.socket.onmessage=null;this.socket.onerror=null;this.socket.onclose=null;try{this.socket.close();}catch{}}
    this.releaseMicrophone();
    this.output?.disconnect();this.analyser?.disconnect();
    this.context?.close().catch(()=>{});
    this.deps.document?.removeEventListener('visibilitychange',this.onVisibility);
    globalThis.removeEventListener?.('pagehide',this.onPageHide);
  }
}
