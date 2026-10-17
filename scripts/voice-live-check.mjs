import { loadEnv } from 'vite';
import { mkdirSync,writeFileSync } from 'node:fs';
import { createVoiceSessionHandler } from '../server/voiceSession.js';

// Real provider smoke test. Reads credentials in memory; never prints a key,
// token, request URL or upstream error payload. No microphone is used.
const env={...process.env,...loadEnv('development',process.cwd(),'')};
if(!(env.GEMINI_API_KEY||env.GOOGLE_API_KEY)?.trim()) {
  console.error('Live voice check needs GEMINI_API_KEY in .env.local. No Gemini request was made.');
  process.exit(2);
}
const handler=createVoiceSessionHandler({getEnv:()=>env});
let credentials,status;
await handler({method:'POST',headers:{host:'localhost:5173',origin:'http://localhost:5173'},socket:{remoteAddress:'local-smoke-check'}},{
  setHeader(){},set statusCode(value){status=value;},end(text){credentials=JSON.parse(text);},
});
if(status!==200) {console.error(credentials.error);process.exit(1);}
const parts=[];let transcript='',chain=Promise.resolve(),socket;
await new Promise((resolve,reject)=>{
  let settled=false;
  const finish=error=>{
    if(settled)return;settled=true;clearTimeout(timeout);socket?.close();
    if(error)reject(new Error(error));else resolve();
  };
  const timeout=setTimeout(()=>finish('Gemini did not complete the spoken reply within 30 seconds.'),30000);
  socket=new WebSocket(`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(credentials.token)}`);
  socket.onopen=()=>socket.send(JSON.stringify({setup:{model:`models/${credentials.model}`,generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:credentials.voice}}}}}}));
  socket.onmessage=event=>{
    chain=chain.then(async()=>{
      const data=JSON.parse(typeof event.data==='string'?event.data:await event.data.text());
      if(data.error)return finish('Gemini rejected the live session configuration.');
      if(data.setupComplete)socket.send(JSON.stringify({clientContent:{turns:[{role:'user',parts:[{text:'For a connection check, briefly introduce yourself as Debapallab’s AI portfolio guide in one sentence. Do not call tools.'}]}],turnComplete:true}}));
      const content=data.serverContent;
      if(content?.outputTranscription?.text)transcript+=content.outputTranscription.text;
      for(const part of content?.modelTurn?.parts||[]) {
        if(part.inlineData?.mimeType?.startsWith('audio/pcm'))parts.push(Buffer.from(part.inlineData.data,'base64'));
      }
      if(content?.turnComplete)finish();
    }).catch(()=>finish('Could not decode the live audio response.'));
  };
  socket.onerror=()=>finish('Could not connect to Gemini Live.');
  socket.onclose=()=>{if(!settled)finish('Gemini closed before a complete spoken reply.');};
}).catch(error=>{console.error(error.message);process.exit(1);});
const pcm=Buffer.concat(parts);
if(!pcm.length||!transcript.trim()) {console.error('Gemini returned no complete audio/transcript pair.');process.exit(1);}
const header=Buffer.alloc(44);
header.write('RIFF',0);header.writeUInt32LE(pcm.length+36,4);header.write('WAVEfmt ',8);
header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);
header.writeUInt32LE(24000,24);header.writeUInt32LE(48000,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);
header.write('data',36);header.writeUInt32LE(pcm.length,40);
mkdirSync('.tmp/voice-live',{recursive:true});writeFileSync('.tmp/voice-live/reply.wav',Buffer.concat([header,pcm]));
console.log(`ok real Gemini Live: ${credentials.model}, ${credentials.voice}, ${(pcm.length/48000).toFixed(2)} seconds of audio and a transcript`);
console.log('Local listening sample: .tmp/voice-live/reply.wav');
