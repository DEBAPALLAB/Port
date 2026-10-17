import React, { useEffect, useRef, useState } from 'react';
import LiveVoiceSession from './LiveVoiceSession.js';
import TalkingAvatar from '../avatar/TalkingAvatar.jsx';
import BookIcon from '../BookIcon.jsx';
import './voice-experience.css';

const questions=[
  {label:'Where should I start?',text:'Which of your projects should I explore first, and why?'},
  {label:'How do you work?',text:'How do you bring product thinking, design and development together?'},
  {label:'Dibrugarh to Nagpur?',text:'Tell me about your journey from Dibrugarh to Nagpur, and life beyond the work.'},
];
const labels={idle:'Ready when you are.',connecting:'Waking the cartoon up…',listening:'Listening. Take your time.',thinking:'Hmm, thinking…',speaking:'Talking.',ended:'That was fun. Again?',error:'That didn’t work. Try again?'};
const bubbles={idle:'Psst. I’m the cartoon me. Ask about my work, or how I got from Dibrugarh to Nagpur.',connecting:'One sec, finding my voice…',ended:'Come back anytime. I’ll be right here, blinking.',error:'Well, that didn’t work. Give it another go?'};

function Microphone({muted=false}) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>{muted&&<path d="m3 3 18 18"/>}</svg>;
}

function Speaker({muted=false}) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/>{muted?<path d="m17 9 5 6m0-6-5 6"/>:<path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/>}</svg>;
}
function MiniFace() {
  return <svg className="voice-mini-face" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#dfa77d"/><path d="M2.6 11.5C2.4 4.6 7.6 1.2 13 1.6c5.8.4 8.8 4.6 8.2 10.6-1.6-2.8-4.6-3.8-7.6-3-2.6-2-6.6-.6-11 2.3Z" fill="#1d1719"/><circle cx="8.8" cy="13.6" r="1.15" fill="#17110f"/><circle cx="15.2" cy="13.6" r="1.15" fill="#17110f"/><path d="M9.4 17.4q2.6 2 5.2 0" stroke="#17110f" strokeWidth="1.3" fill="none" strokeLinecap="round"/></svg>;
}

export default function VoiceExperience({reducedMotion=false,children}) {
  const sessionRef=useRef(null),mounted=useRef(true);
  const [status,setStatus]=useState('idle'),[notice,setNotice]=useState('');
  const [microphone,setMicrophone]=useState(false),[sound,setSound]=useState(true);
  const [transcripts,setTranscripts]=useState([]),[recommendation,setRecommendation]=useState(null),[draft,setDraft]=useState('');
  const live=['listening','thinking','speaking'].includes(status),connecting=status==='connecting';
  useEffect(()=>{
    mounted.current=true;
    return()=>{mounted.current=false;sessionRef.current?.dispose();};
  },[]);
  async function start({mic=true,prompt}={}) {
    if(sessionRef.current&&!sessionRef.current.closed)return;
    setNotice('');setTranscripts([]);setRecommendation(null);setSound(true);setMicrophone(false);
    const current=fn=>(...args)=>{if(mounted.current&&sessionRef.current===session)fn(...args);};
    const session=new LiveVoiceSession({
      onState:current(setStatus),
      onMicrophone:current(setMicrophone),
      onNotice:current(setNotice),
      onTranscript:current(entry=>setTranscripts(items=>{
        const index=items.findIndex(item=>item.id===entry.id);
        return (index<0?[...items,entry]:items.map((item,i)=>i===index?entry:item)).slice(-24);
      })),
      onRecommendation:current(setRecommendation),
      onError:current(message=>{setStatus('error');setNotice(message);setMicrophone(false);}),
      onEnded:current(message=>{setStatus('ended');setNotice(message);setMicrophone(false);}),
    });
    sessionRef.current=session;
    await session.start({microphone:mic,prompt});
  }
  function ask(text) {
    if(!text.trim())return;
    if(live)sessionRef.current?.sendText(text);
    else if(!connecting)start({mic:false,prompt:text});
    setDraft('');
  }
  function end() {sessionRef.current?.stop();}
  const latest=transcripts.filter(item=>item.role==='assistant').at(-1);
  const latestUser=transcripts.filter(item=>item.role==='user').at(-1);
  const caption=latest?.text?.trim();
  const said=caption?(caption.length>220?'…'+caption.slice(-220).replace(/^\S*\s/,''):caption):status==='thinking'?'Hmm…':bubbles[status]||bubbles.idle;
  return <div className="voice-experience" data-ui data-state={status}>
    {children}
    <div className="personal-story-object voice-stage">
      <div className={`voice-bubble voice-caption${caption?' has-reply':''}`} aria-label="Latest spoken reply">
        {latestUser&&live&&<p className="voice-question">You: {latestUser.text.length>70?latestUser.text.slice(0,70)+'…':latestUser.text}</p>}
        <p>{said}</p>
        {latest?.interrupted&&<span className="voice-interrupted">You cut in. Go ahead.</span>}
      </div>
      <TalkingAvatar framed={false} sessionRef={sessionRef} state={status} reducedMotion={reducedMotion} onActivate={live||connecting?undefined:()=>start()} label={live||connecting?'Dev, drawn as a cartoon, talking':'Talk to AI Dev. Starts a voice conversation.'}/>
      {recommendation&&<a key={recommendation.href} className="voice-recommendation" href={recommendation.href}>
        <small>{recommendation.kind==='project'?'Case study':'From my story'}</small>
        <strong>{recommendation.title}</strong>
        <span>{recommendation.label} <span aria-hidden="true">↗</span></span>
      </a>}
    </div>
    <div className="voice-dock">
      {live&&<div className="voice-questions" role="group" aria-label="Try a question">{questions.map(question=><button key={question.label} onClick={()=>ask(question.text)}>{question.label}</button>)}</div>}
      {notice&&status==='error'&&<p className="voice-notice" role="alert">{notice}</p>}
      <div className="voice-bar">
        <div className="voice-corner voice-corner-start">
          {live&&transcripts.length>0
            ? <details className="voice-transcript"><summary>Read the conversation</summary><div className="voice-transcript-log" role="log" aria-live="off" tabIndex="0">{transcripts.map(item=><p key={item.id}><strong>{item.role==='user'?'You':'AI Dev'}</strong><span>{item.text}</span>{item.interrupted&&<small>Interrupted</small>}</p>)}</div></details>
            : <p className="voice-privacy">AI voice and cartoon. Mic audio goes to Google only while it’s on.</p>}
        </div>
        <div className="voice-center">
          {live||connecting ? <div className="voice-transport push-button">
            {live&&<button className="voice-mic-control" aria-pressed={microphone} aria-label={microphone?'Mute microphone':'Turn on microphone'} onClick={()=>sessionRef.current?.setMicrophone(!microphone)}><Microphone muted={!microphone}/></button>}
            {live&&<form className="voice-text-form" onSubmit={event=>{event.preventDefault();ask(draft);}}>
              <label className="sr-only" htmlFor="voice-question-input">Type a question for AI Dev</label>
              <input id="voice-question-input" value={draft} onChange={event=>setDraft(event.target.value)} maxLength={500} placeholder={microphone?'Speak, or type…':'Type a question…'} autoComplete="off"/>
              <button type="submit" disabled={!draft.trim()} aria-label="Ask">↗</button>
            </form>}
            {connecting&&<span className="voice-connecting">Waking the cartoon up…</span>}
            {live&&<button className="voice-sound-control" aria-pressed={sound} aria-label={sound?'Mute his voice':'Unmute his voice'} onClick={()=>{sessionRef.current?.setSound(!sound);setSound(!sound);}}><Speaker muted={!sound}/></button>}
            <button className="voice-end" onClick={end} aria-label={connecting?'Cancel':'End conversation'}>{connecting?'Cancel':'End'}</button>
          </div> : <div className="voice-ctas">
            <button className="voice-start push-button" onClick={()=>start()}><MiniFace/><span>{status==='idle'?'Talk to me':'Talk again'}</span><span aria-hidden="true">›</span></button>
            <a className="voice-story read-personal-story push-button" href="/about/"><BookIcon/><span>Read my story</span></a>
          </div>}
        </div>
        <div className="voice-corner voice-corner-end">
          {live||connecting
            ? <p className="voice-state" role="status"><span className="voice-status-dot" data-live={live}/>{labels[status]}</p>
            : <button className="voice-listen" onClick={()=>start({mic:false})}><Speaker/>Just listen</button>}
        </div>
      </div>
    </div>
  </div>;
}
