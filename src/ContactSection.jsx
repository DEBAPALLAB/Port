import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { personalPhotos } from './personalStory.js';
import './personal-invitation.css';

export default function ContactSection({ animate, reducedMotion, onReplay }) {
  const root=useRef(null), timeout=useRef(null);
  const [copyStatus,setCopyStatus]=useState('idle');
  useEffect(()=>{
    if(!animate || reducedMotion) return;
    const context=gsap.context(()=>{
      gsap.from('.personal-invitation-copy > *, .story-postcard > *, .invitation-guitar, .story-photo',{y:24,opacity:0,duration:.75,stagger:.075,ease:'power3.out',scrollTrigger:{trigger:'.personal-invitation',start:'top 82%',once:true}});
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
    <div className="personal-invitation about-layout">
      <div className="personal-invitation-copy about-heading">
        <h2 id="contact-title">Meet the person<br/>behind the pieces.</h2>
        <p>I’m Debapallab. I grew up in Dibrugarh, came to Nagpur for engineering, and found my way through design, freelancing, and building things.</p>
        <p>There’s singing, a guitar, and a life outside the screen, too.</p>
        <a className="read-personal-story" href="/about/">Read my story <span aria-hidden="true">↗</span></a>
        <span className="personal-story-promise">Home, college, the people, and the music.</span>
      </div>
      <div className="personal-story-object">
        {personalPhotos.portrait.src
          ? <figure className="story-photo"><img src={personalPhotos.portrait.src} alt={personalPhotos.portrait.alt} loading="lazy" width="800" height="1000"/><figcaption>Debapallab Das</figcaption></figure>
          : <div className="story-postcard"><p className="postcard-greeting">A little about me.</p><a href="/about/#home" className="postcard-place"><strong>Dibrugarh.</strong><span>Where I began.</span></a><span className="postcard-arrow" aria-hidden="true">↓</span><a href="/about/#college" className="postcard-place"><strong>Nagpur.</strong><span>Where I’m becoming.</span></a><a href="/about/#music" className="postcard-music">And a little music in between. <span aria-hidden="true">↗</span></a></div>}
        <svg className="invitation-guitar" viewBox="0 0 520 220" fill="none" aria-hidden="true"><path d="M100 43C73 17 29 32 29 66c0 23 23 29 24 42 0 17-24 19-24 47 0 36 49 51 78 24 24-23 1-46 16-59 13-11 33-5 37-29 6-32-27-56-49-40-7 6-10 0-11-8Z" fill="#d6ddcf"/><path d="m124 98 302-52 16-16 47 4 6 26-45 12-17-9-303 53" fill="#c0cbb7"/><circle cx="96" cy="115" r="22" fill="#303a31"/><circle cx="96" cy="115" r="17" fill="#9baa91"/><path className="guitar-strings" d="m63 133 376-78M63 136l376-79M63 139l376-80M63 142l376-81M63 145l376-82M63 148l376-83" stroke="#4d5846" strokeWidth="1"/><path d="m60 129 5 23" stroke="#303a31" strokeWidth="7"/><path d="m450 33 3-9m15 11 3-9m15 12 3-8m-33 40 2 10m14-14 2 10m14-14 2 10" stroke="#4d5846" strokeWidth="3"/></svg>
      </div>
    </div>
    <div className="personal-contact-strip contact-row" id="contact"><div><h3>Rather start a conversation?</h3><a className="email-link" href="mailto:dev.lucide@gmail.com">Say hello <span aria-hidden="true">↗</span></a></div><div className="personal-copy-email"><span>dev.lucide@gmail.com</span><button onClick={copyEmail}>{copyStatus==='copied'?'Copied':'Copy email'}</button><p className="copy-status" aria-live="polite">{copyStatus==='failed'?'Copy unavailable. You can select the email above or use Say hello.':''}</p></div></div>
    <footer className="site-footer"><span>Debapallab Das <span className="footer-domain">dev.lucide.in</span></span><button onClick={onReplay}>Back to the first piece <span aria-hidden="true">↺</span></button></footer>
  </section>;
}
