import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import VoiceExperience from './voice/VoiceExperience.jsx';
import './personal-invitation.css';

export default function ContactSection({ animate, reducedMotion, onReplay }) {
  const root=useRef(null), timeout=useRef(null);
  const [copyStatus,setCopyStatus]=useState('idle');
  useEffect(()=>{
    if(!animate || reducedMotion) return;
    const context=gsap.context(()=>{
      for (const selector of ['.personal-invitation-copy','.personal-story-object']) {
        const group=root.current.querySelector(selector);
        gsap.from(group.children,{y:14,opacity:0,duration:.55,stagger:.04,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:group,start:'top 90%',once:true}});
      }
    },root);
    return ()=>context.revert();
  },[animate,reducedMotion]);
  useEffect(()=>()=>clearTimeout(timeout.current),[]);
  async function copyEmail(){
    try{await navigator.clipboard.writeText('dev.lucide@gmail.com');setCopyStatus('copied');}
    catch{setCopyStatus('failed');}
    clearTimeout(timeout.current); timeout.current=setTimeout(()=>setCopyStatus('idle'),2500);
  }
  return <section id="connect" className="about-section personal-invitation-section" ref={root} aria-labelledby="contact-title">
    <div className="personal-invitation about-layout voice-layout">
      <VoiceExperience reducedMotion={reducedMotion}>
        <div className="personal-invitation-copy voice-heading"><p className="hero-intro">Well, a cartoon of me. Go on, ask him anything.</p><h2 id="contact-title">Meet the person<br/>behind the <span>pieces.</span></h2></div>
      </VoiceExperience>
    </div>
    <div className="personal-contact-strip contact-row" id="contact"><div><h3>Prefer a direct hello?</h3><a className="email-link" href="mailto:dev.lucide@gmail.com">Say hello <span aria-hidden="true">↗</span></a></div><div className="personal-copy-email"><span>dev.lucide@gmail.com</span><button onClick={copyEmail}>{copyStatus==='copied'?'Copied':'Copy email'}</button><p className="copy-status" aria-live="polite">{copyStatus==='failed'?'Copy unavailable. You can select the email above or use Say hello.':''}</p></div></div>
    <footer className="site-footer"><span>Debapallab Das <span className="footer-domain">dev.lucide.in</span></span><button onClick={onReplay}>Back to the first piece <span aria-hidden="true">↺</span></button></footer>
  </section>;
}
