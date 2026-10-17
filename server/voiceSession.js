import { buildVoiceSetup, DEFAULT_VOICE, SESSION_SECONDS, VOICES, VOICE_MODEL } from './voicePersona.js';

// Best-effort per-instance throttle. Production-wide quotas belong at the edge
// (Vercel Firewall) and in the Gemini project's quota/billing configuration.
export function createVoiceSessionHandler({getEnv=()=>process.env,fetchImpl=globalThis.fetch,now=Date.now}={}) {
  const attempts = new Map();
  function limited(ip) {
    const time=now();
    for(const [key,bucket] of attempts) if(time-bucket.start>=600000) attempts.delete(key);
    if(attempts.size>5000) return true;
    const bucket=attempts.get(ip)||{start:time,count:0};
    attempts.set(ip,bucket);
    return ++bucket.count>5;
  }
  return async function voiceSession(req,res) {
    res.setHeader('Cache-Control','no-store, max-age=0');
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options','nosniff');
    const reply=(status,body)=>{res.statusCode=status;res.end(JSON.stringify(body));};
    const env=getEnv();
    if(req.method==='GET') return reply(200,{ready:!!(env.GEMINI_API_KEY||env.GOOGLE_API_KEY)?.trim()});
    if(req.method!=='POST') {res.setHeader('Allow','GET, POST');return reply(405,{error:'Use POST to start a conversation.'});}
    const origin=req.headers.origin;
    const host=req.headers.host;
    let originHost;
    try {originHost=new URL(origin).host;} catch {return reply(403,{error:'Open the conversation from this portfolio.'});}
    const allowed=(env.VOICE_ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
    if(originHost!==host&&!allowed.includes(origin)) return reply(403,{error:'Open the conversation from this portfolio.'});
    if(req.headers['sec-fetch-site']==='cross-site') return reply(403,{error:'Open the conversation from this portfolio.'});
    const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'local').split(',')[0].trim();
    const apiKey=env.GEMINI_API_KEY||env.GOOGLE_API_KEY;
    if(!apiKey?.trim()) return reply(503,{error:'The voice guide is not available yet. You can still read my story.',code:'VOICE_NOT_CONFIGURED'});
    if(limited(ip)) {res.setHeader('Retry-After','600');return reply(429,{error:'A few conversations have started recently. Please try again in a little while.'});}
    let audition=null;
    try {audition=new URL(req.url||'/','http://local').searchParams.get('voice');} catch {}
    const voice=VOICES.includes(audition)?audition:VOICES.includes(env.GEMINI_VOICE)?env.GEMINI_VOICE:DEFAULT_VOICE;
    const setup=buildVoiceSetup(voice);
    try {
      const response=await fetchImpl('https://generativelanguage.googleapis.com/v1beta/auth_tokens',{
        method:'POST',
        headers:{'Content-Type':'application/json','x-goog-api-key':apiKey.trim()},
        signal:AbortSignal.timeout(12000),
        body:JSON.stringify({
          uses:1,
          newSessionExpireTime:new Date(now()+60000).toISOString(),
          expireTime:new Date(now()+(SESSION_SECONDS+60)*1000).toISOString(),
          // REST uses bidiGenerateContentSetup (the SDK calls this liveConnectConstraints).
          // Empty fieldMask locks the entire setup, including persona, model and tools.
          bidiGenerateContentSetup:setup,
        }),
      });
      if(!response.ok) return reply(response.status===429?429:502,{error:response.status===429?'The voice guide is busy. Please try again shortly.':'The voice connection could not start. Please try again shortly.'});
      const token=await response.json();
      if(typeof token.name!=='string'||!token.name.startsWith('auth_tokens/')) return reply(502,{error:'The voice connection could not start. Please try again.'});
      // The durable API key and system instructions never go to the browser.
      return reply(200,{token:token.name,model:VOICE_MODEL,voice,maxSeconds:SESSION_SECONDS,apiVersion:'v1beta'});
    } catch {
      return reply(502,{error:'The voice service did not respond. Please try again.'});
    }
  };
}

export default createVoiceSessionHandler();
