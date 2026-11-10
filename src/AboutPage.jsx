import React, { useEffect, useRef, useState } from 'react';
import useReducedMotion from './useReducedMotion.js';
import { chapters, personalPhotos, competitions, rabbitHoles } from './personalStory.js';
import './about-page.css';

function Photo({ photo, className = '', eager = false }) {
  return <figure className={`personal-photo ${className}`}>
    <div className="personal-photo-crop"><img src={photo.src} alt={photo.alt} loading={eager ? 'eager' : 'lazy'} width="800" height="1000"/></div>
  </figure>;
}

export default function AboutPage() {
  const [chapter, setChapter] = useState(0);
  const [competition, setCompetition] = useState(0);
  const [question, setQuestion] = useState(0);
  const root = useRef(null), reduced = useReducedMotion();
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('personal-visible');
        if (entry.target.dataset.storyIndex !== undefined) setChapter(Number(entry.target.dataset.storyIndex));
      }
    }), { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    root.current.querySelectorAll('[data-personal-reveal], [data-story-index]').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  function goToChapter(index) {
    setChapter(index);
    document.getElementById(chapters[index].id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  }
  return <div className="personal-page" ref={root}>
    <a className="skip-link" href="#personal-main">Skip to my story</a>
    <header className="personal-header"><a href="/" className="personal-name">Debapallab Das</a><nav aria-label="Main navigation"><a href="/#work">Work</a><a href="/about/" aria-current="page">About me</a><a href="mailto:dev.lucide@gmail.com">Say hello</a></nav></header>
    <main id="personal-main">
      <section className="personal-intro" aria-labelledby="personal-title">
        <h1 id="personal-title">I get<br/>carried away.</h1>
        <div className="personal-intro-bottom"><p>I’m Dev. 20. From Dibrugarh. I build products, get very specific about the details, and occasionally turn a question into six PRDs.</p><a href="#rabbit-holes" className="personal-read">Follow a rabbit hole <span aria-hidden="true">↓</span></a></div>
      </section>
      <div className="personal-photo-spread" data-personal-reveal><Photo photo={personalPhotos.college} eager/><Photo photo={personalPhotos.portrait} eager className="personal-portrait"/></div>
      <section className="personal-context" data-personal-reveal><h2>A few things at once.</h2><div><p className="personal-statement">Product at Mindspace AI. Building Superforms. Founder at Lucide Tech. Engineering student.</p><p>I move between product, design and development because the question usually needs all three. At Lucide Tech, that has meant writing code, talking to clients, thinking about distribution, and learning when to stop doing everything myself.</p><a href="/#work">See what I’m building ↗</a></div></section>
      <section className="personal-questions" id="rabbit-holes" aria-labelledby="questions-title" data-personal-reveal>
        <div className="personal-questions-heading"><h2 id="questions-title">It starts with a question.</h2><p>Then I need to see where it goes.</p></div>
        <div className="personal-question-browser"><nav aria-label="Choose a rabbit hole">{rabbitHoles.map((item,index)=><button key={item.id} id={`question-${item.id}`} aria-expanded={question===index} aria-controls={`answer-${item.id}`} onClick={()=>setQuestion(index)}><span>{item.question}</span><span aria-hidden="true">{question===index ? '−' : '+'}</span></button>)}</nav>
          <div className="personal-answers">{rabbitHoles.map((item,index)=><article key={item.id} id={`answer-${item.id}`} hidden={question!==index} aria-labelledby={`question-${item.id}`} className="personal-answer"><p className="personal-answer-name">{item.name}</p><p className="personal-answer-opening">{item.opening}</p>{item.paragraphs.map(text=><p key={text}>{text}</p>)}<p className="personal-answer-takeaway">{item.takeaway}</p>{item.link && <a href={item.link}>{item.action} ↗</a>}</article>)}</div>
        </div>
      </section>
      <section className="personal-build-note" data-personal-reveal><div><h2>Show the reasoning.</h2><p>I write in public because explaining a result makes me defend it. The methodology, the assumptions, the part that still doesn’t work. A good-looking demo is the beginning of that conversation.</p><p>That includes the awkward stuff: scoring my own product, saying no to an internship I couldn’t afford to take, or admitting that a spike in impressions doesn’t mean I’ve figured out distribution.</p><a href="https://linkedin.com/in/dev-designs" target="_blank" rel="noreferrer">Read along on LinkedIn ↗</a></div><a className="personal-product-picture" href="/work/notaprompt/"><img src="/cases/notaprompt/desktop-0.jpg" alt="The notaprompt product: simulating how an idea spreads through a population" loading="lazy" width="1440" height="1000"/><span>notaprompt. A question I couldn’t leave alone.</span></a></section>
      <div className="personal-story" id="personal-story">
        <aside className="personal-story-stage" aria-label="Places and moments in my story"><h2>How I got here.</h2><div className="personal-stage-frame"><p>Dibrugarh<br/><span aria-hidden="true">→ </span>Nagpur</p><span>Design came along for the ride.</span></div><nav aria-label="Explore my story">{chapters.map((item,index)=><button key={item.id} aria-current={chapter===index ? 'step' : undefined} onClick={()=>goToChapter(index)}>{item.nav}</button>)}</nav></aside>
        <div className="personal-story-reading">{chapters.map((item,index)=><section className="personal-chapter" id={item.id} key={item.id} data-story-index={index} data-personal-reveal><h2>{item.title}</h2>{item.paragraphs.map(text=><p key={text}>{text}</p>)}{item.note && <p className="personal-chapter-note">{item.note}</p>}</section>)}</div>
      </div>
      <section className="personal-competition-section" data-personal-reveal aria-labelledby="competition-title"><div className="personal-competition-heading"><h2 id="competition-title">Very different arenas.</h2><p>Seven podium finishes across product, UX, branding and film. I like being in a room where I have to figure something out with other people.</p></div><div className="personal-competition-book"><nav aria-label="Choose a competition">{competitions.map((item,index)=><button key={item.name} aria-pressed={competition===index} aria-controls="competition-note" onClick={()=>setCompetition(index)}><span>{item.name}</span><span>{item.result}</span></button>)}</nav><article id="competition-note" className="personal-competition-note" key={competition} aria-live="polite"><h3>{competitions[competition].name}</h3><span>{competitions[competition].event}</span><p>{competitions[competition].story}</p><p className="personal-competition-detail">{competitions[competition].detail}</p><p className="personal-competition-result">{competitions[competition].result}</p></article></div></section>
      <section id="music" className="personal-music" data-personal-reveal><Photo photo={personalPhotos.candid}/><div><h2>There’s music, too.</h2><p className="personal-statement">I sing. I play the guitar. I have interests that don’t need a launch date.</p><p>And I want people around me who like making things. That’s why I started putting together a small 48-hour build sprint in Nagpur: ten builders, an idea, and something real to ship. The environment matters to me as much as the tools.</p><p>I’m still a student. Still trying things. Still very capable of getting carried away.</p></div></section>
      <section className="personal-now" data-personal-reveal><h2>What I’m looking for.</h2><div><p>People who care about the problem enough to challenge the idea. A product conversation that goes past the demo. Something ambitious enough that I have to learn a few things to build it.</p><p>If that sounds like your kind of work, I’d like to meet you. You can <a href="/debapallab-das-resume.pdf" target="_blank" rel="noreferrer">read my résumé</a> for the experience and education.</p></div></section>
      <section className="personal-hello" data-personal-reveal><h2>Let’s talk.</h2><p>A product, a question, a song recommendation. I’m listening.</p><a href="mailto:dev.lucide@gmail.com">dev.lucide@gmail.com <span aria-hidden="true">↗</span></a><div><a href="https://github.com/DEBAPALLAB" target="_blank" rel="noreferrer">GitHub</a><a href="https://linkedin.com/in/dev-designs" target="_blank" rel="noreferrer">LinkedIn</a></div></section>
    </main><footer className="personal-footer"><span>Debapallab Das</span><a href="/">Back to the first piece ↗</a></footer>
  </div>;
}
