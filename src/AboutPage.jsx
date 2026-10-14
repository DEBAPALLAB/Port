import React, { useEffect, useRef, useState } from 'react';
import useReducedMotion from './useReducedMotion.js';
import { chapters, personalPhotos, competitions } from './personalStory.js';
import './about-page.css';

function PhotoSpace({ photo, className = '' }) {
  return <figure className={`personal-photo ${className}`} style={{ '--photo-ground': photo.colour }}>
    {photo.src ? <img src={photo.src} alt={photo.alt} loading="lazy" width="800" height="1000"/> : <div className="personal-photo-space"><span>{photo.title}</span><p>{photo.prompt}</p><span className="photo-reserved">A space for a photograph.</span></div>}
    <figcaption>{photo.caption}</figcaption>
  </figure>;
}
export default function AboutPage() {
  const [chapter, setChapter] = useState(0), [competition, setCompetition] = useState(0);
  const root = useRef(null), reduced = useReducedMotion();
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('personal-visible');
        if (entry.target.dataset.storyIndex !== undefined) setChapter(Number(entry.target.dataset.storyIndex));
      }
    }), { rootMargin: '-15% 0px -35% 0px', threshold: .05 });
    root.current.querySelectorAll('[data-personal-reveal], [data-story-index]').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  function goToChapter(index) {
    setChapter(index);
    document.getElementById(chapters[index].id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
  }
  return <div className="personal-page" ref={root}>
    <a className="skip-link" href="#personal-main">Skip to my story</a>
    <header className="personal-header"><a href="/" className="personal-name">Debapallab Das</a><nav aria-label="Main navigation"><a href="/#work">Work</a><a href="/about/" aria-current="page">About me</a><a href="mailto:dev.lucide@gmail.com">Say hello ↗</a></nav></header>
    <main id="personal-main">
      <section className="personal-intro"><div><h1>Hi, I’m<br/>Debapallab.</h1><p>From the Tea City.<br/>Still following my curiosity.</p><a href="#personal-story" className="personal-read">Here’s my story <span aria-hidden="true">↓</span></a><span className="personal-intro-note">Dibrugarh, Assam → Nagpur, Maharashtra</span></div><PhotoSpace photo={personalPhotos.portrait} className="personal-portrait"/></section>
      <div className="personal-story" id="personal-story">
        <aside className="personal-story-stage" aria-label="Places and moments in my story"><div className="personal-stage-frame" key={chapter}><PhotoSpace photo={personalPhotos[chapters[chapter].photo]}/></div><nav aria-label="Explore my story">{chapters.map((item,index)=><button key={item.id} aria-current={chapter===index ? 'step' : undefined} onClick={()=>goToChapter(index)}>{item.nav}</button>)}</nav></aside>
        <div className="personal-story-reading">{chapters.map((item,index)=><section className="personal-chapter" id={item.id} key={item.id} data-story-index={index} data-personal-reveal><h2>{item.title}</h2>{item.paragraphs.map(text=><p key={text}>{text}</p>)}{item.note && <p className="personal-chapter-note">{item.note}</p>}</section>)}</div>
      </div>
      <section className="personal-competition-section" data-personal-reveal aria-labelledby="competition-title"><div className="personal-competition-heading"><h2 id="competition-title">Different rooms.<br/>Different lessons.</h2><p>Design, brands, code, and even filmmaking. The competitions took me through more than one version of myself.</p></div><div className="personal-competition-book"><nav aria-label="Choose a competition">{competitions.map((item,index)=><button key={item.name} aria-pressed={competition===index} onClick={()=>setCompetition(index)}>{item.name}</button>)}</nav><article className="personal-competition-note" key={competition} aria-live="polite"><h3>{competitions[competition].name}</h3><span>{competitions[competition].event}</span><p>{competitions[competition].story}</p><p className="personal-competition-result">{competitions[competition].result}</p></article></div></section>
      <section id="music" className="personal-music" data-personal-reveal><div><h2>Sometimes,<br/>it’s six strings.</h2><p>I sing. I play the guitar.</p><p>That belongs here too. It’s another part of my life, alongside college, competitions, and all the things I’m learning to make.</p><svg className="personal-guitar" viewBox="0 0 450 170" fill="none" aria-hidden="true"><path d="M61 52C40 34 8 44 9 75c1 22 25 27 27 39 23 33 60 19 62-8 0-17-9-27 8-33 22-12 6-49-18-33-9 7-13 0-25-8Z" fill="#d9dfd3"/><path d="m97 84 290-50 22-12 28 9-2 16-26 5-15-8-292 51" fill="#deded4"/><circle cx="76" cy="96" r="17" stroke="#64655e" strokeWidth="3"/><path d="m48 112 345-69M48 115l345-70M48 118l345-71M48 121l345-72M48 124l345-73M48 127l345-74" stroke="#777c70" strokeWidth=".8"/><path d="m46 110 4 20" stroke="#64655e" strokeWidth="5"/></svg></div><PhotoSpace photo={personalPhotos.music}/></section>
      <section className="personal-now" data-personal-reveal><h2>Still becoming.</h2><div><p>I always wanted to do engineering. I got here through design, freelancing, and a lot of trying things. At IIIT Nagpur, I’m studying Computer Science and Engineering. I’m also pursuing the online BS in Data Science at IIT Madras.</p><p>Design didn’t replace engineering for me. It became another way into it. Today, UI/UX, product, and development sit together in what I do. I’m still a student, still making things, and still finding out where this goes.</p><a href="/debapallab-das-resume.pdf" target="_blank" rel="noreferrer">Read my résumé ↗</a></div></section>
      <section className="personal-hello" data-personal-reveal><h2>Say hello.</h2><p>About music, college, a good idea, or just life.</p><a href="mailto:dev.lucide@gmail.com">dev.lucide@gmail.com <span aria-hidden="true">↗</span></a><div><a href="https://github.com/DEBAPALLAB" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://linkedin.com/in/dev-designs" target="_blank" rel="noreferrer">LinkedIn ↗</a></div></section>
    </main><footer className="personal-footer"><span>Debapallab Das</span><a href="/">Back to the first piece ↗</a></footer>
  </div>;
}


