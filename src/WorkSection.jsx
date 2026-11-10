import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { competitions } from './personalStory.js';

const headline = [['I', 'started', 'with', 'design,'], ['and', 'kept', 'going', 'until'], ['I', 'could', 'build', 'it.']];

// Every fact here comes from the resume or the About story. Shots are real captures already in /public/cases.
const threads = [
  {
    label: 'Design', statement: 'The first thing I could actually do.',
    rows: [
      ['2022–23', 'Snapchat Opinion Leader', 'A year of graphic design and digital content for a young audience, through Under 25 Universe.'],
      ['2023', 'Calix Labs', 'Social media manager. Content strategy and engagement tracking.'],
      ['Since', 'Freelance UI/UX', 'Design work that kept pulling me toward how a product actually works.'],
    ],
    shots: [{ src: '/cases/lucide/versions/v1-desktop-0.jpg', alt: 'The first version of the Lucide studio website' }, { src: '/cases/lucide/versions/v8-desktop-0.jpg', alt: 'The eighth version of the Lucide studio website' }],
    caption: 'My studio’s site, version 1 and version 8.',
  },
  {
    label: 'Engineering', statement: 'I came for engineering. Design came with me.',
    rows: [
      ['2028', 'IIIT Nagpur', 'B.Tech in Computer Science and Engineering. Alongside it, IIT Madras’ online BS in Data Science.'],
      ['2025–26', 'Club Head, Avalok', 'Led the college media cell for seven months, across graphic design, motion and content.'],
      ['Stack', 'Next.js, React, TypeScript', 'Python and SQL as well. Hands-on with PostgreSQL, REST APIs, the OpenAI API and the Vercel AI SDK.'],
    ],
    shots: [{ src: '/cases/culprit/editor-tests.jpg', alt: 'The Culprit code editor with its tests running' }],
    caption: 'Culprit, a debugging concept with a working editor.',
  },
  {
    label: 'Winning', statement: 'Design, brand and product, always against a clock.',
    wins: competitions.map(({ name, event, result }) => [result === 'Winning team' ? 'Won' : result.replace(' place', ''), name, event]),
    caption: 'Plus Manthan for Yuva: a winning team, and a meeting with the Chief Minister of Maharashtra.',
  },
  {
    label: 'Building', statement: 'Now I take products from first idea to live code.',
    rows: [
      ['2025–', 'Lucide Tech', 'Founder and Head of Product. I defined and shipped an internal agency platform that cut project delivery friction by 40%.'],
      ['2025–', 'Superforms', 'Solo founder. I designed, built and now distribute an AI form builder.'],
      ['2026–', 'Mindspace', 'Product intern. The homepage redesign and the experience design for Tara, its voice AI.'],
    ],
    shots: [{ src: '/cases/superforms/builder-build.jpg', alt: 'The Superforms builder' }, { src: '/cases/mindspace/desktop-0.jpg', alt: 'The Mindspace homepage' }],
    caption: 'Superforms and Mindspace, in production.',
  },
];
const FIRST = 3.6, lengths = threads.map(item => item.wins ? 4 : 2.8);
const starts = lengths.map((_, i) => FIRST + lengths.slice(0, i).reduce((sum, value) => sum + value, 0));
const total = starts.at(-1) + lengths.at(-1);
const tally = ['1st', '2nd', '3rd'].map(place => [place, competitions.filter(item => item.result === `${place} place`).length]);

export default function WorkSection({ enabled, reducedMotion }) {
  const root = useRef(null), timeline = useRef(null);
  const kinetic = !reducedMotion;

  useLayoutEffect(() => {
    if (!kinetic || !enabled) return;
    const context = gsap.context(() => {
      const q = selector => gsap.utils.toArray(selector, root.current);
      const words = q('.kw'), slides = q('.about-slide'), buttons = q('.about-rail button');
      gsap.set(words, { opacity: 0, filter: 'blur(14px)', y: 54 });
      gsap.set('.about-slide .kl', { opacity: 0, filter: 'blur(14px)', y: 70 });
      gsap.set('.about-statement, .about-rows li', { opacity: 0, filter: 'blur(8px)', y: 26 });
      gsap.set('.about-shots', { opacity: 0, filter: 'blur(10px)', y: 40, clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set('.chapter-description, .chapter-exit', { opacity: 0, filter: 'blur(10px)', y: 18 });
      q('.tally-n').forEach(node => { node.textContent = '0'; });
      gsap.set('.about-rail', { opacity: 0, y: 14 });
      gsap.set(buttons, { opacity: .35 });
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.about-pin', start: 'top top', end: `+=${Math.round(total * 52)}%`, pin: true, scrub: 1.4, anticipatePin: 1 } });
      timeline.current = tl;
      tl.to(words, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.4, stagger: { each: .32 }, ease: 'power2.out' }, 0)
        .to('.chapter-description', { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 }, 2.2)
        .to('.about-rail', { opacity: 1, y: 0, duration: 1 }, FIRST - .8)
        .to('.work-intro h2', { opacity: .3, filter: 'blur(2px)', duration: 1.2 }, FIRST - .6);
      slides.forEach((slide, i) => {
        const at = starts[i], SLIDE = lengths[i], letters = slide.querySelectorAll('.kl');
        const body = [slide.querySelector('.about-statement'), ...slide.querySelectorAll('.about-rows li')], shots = slide.querySelector('.about-shots');
        tl.to(buttons[i], { opacity: 1, duration: .4 }, at)
          .to(letters, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.1, stagger: .07, ease: 'power2.out' }, at)
          .to(body[0], { opacity: 1, filter: 'blur(0px)', y: 0, duration: .9, ease: 'power2.out' }, at + .5)
          .to(body.slice(1), { opacity: 1, filter: 'blur(0px)', y: 0, duration: .9, stagger: slide.querySelector('.is-wins') ? .14 : .22, ease: 'power2.out' }, at + .8)
          .to(shots, { opacity: 1, filter: 'blur(0px)', y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.out' }, at + .6)
          .to('.about-fill', { '--p': (i + 1) / threads.length, duration: SLIDE * .5, ease: 'power1.inOut' }, at);
        slide.querySelectorAll('.tally-n').forEach(node => {
          const target = Number(node.dataset.n), counter = { v: 0 };
          tl.to(counter, { v: target, duration: 1.4, snap: { v: 1 }, ease: 'power1.out', onUpdate: () => { node.textContent = String(counter.v); } }, at + 1);
        });
        if (i < slides.length - 1) {
          tl.to(letters, { opacity: 0, filter: 'blur(14px)', y: -70, duration: .8, stagger: .04, ease: 'power2.in' }, at + SLIDE - .8)
            .to([...body, shots], { opacity: 0, filter: 'blur(8px)', y: -24, duration: .7, ease: 'power2.in' }, at + SLIDE - .8)
            .to(buttons[i], { opacity: .35, duration: .3 }, at + SLIDE - .4);
        }
      });
      const end = total;
      tl.to('.chapter-exit', { opacity: 1, filter: 'blur(0px)', y: 0, duration: .8 }, end - 1.2).to({}, { duration: .8 }, end);
    }, root);
    ScrollTrigger.refresh();
    return () => { timeline.current = null; context.revert(); root.current?.querySelectorAll('.tally-n').forEach(node => { node.textContent = node.dataset.n; }); };
  }, [kinetic, enabled]);

  // The tabs scrub the page to the matching moment of the story.
  function seek(index) {
    const tl = timeline.current, st = tl?.scrollTrigger;
    if (!st) return;
    const at = (starts[index] + 2) / tl.duration();
    gsap.to(window, { scrollTo: st.start + (st.end - st.start) * at, duration: 1.2, ease: 'power2.inOut' });
  }

  return <section className="work-section work-about" id="work" ref={root} aria-labelledby="work-title" data-kinetic={kinetic}>
    <div className="about-pin">
      <div className="work-intro">
        <h2 id="work-title" tabIndex="-1">{headline.map((line, row) => <React.Fragment key={row}>{row > 0 && <br/>}{line.map((word, i) => <React.Fragment key={word + i}>{i > 0 && ' '}<span className={`kw ${word.startsWith('design') ? 'kw-accent' : ''}`}>{word}</span></React.Fragment>)}</React.Fragment>)}</h2>
        <p className="chapter-description">I’m Debapallab, from Dibrugarh, Assam, now working between product and engineering. I like the part of a project where an idea has to become something people can actually use.</p>
      </div>
      <div className="about-stage">
        <ol className="about-rail" aria-label="Jump to a chapter"><i className="about-fill" aria-hidden="true"/>{threads.map((item, i) => <li key={item.label}><button type="button" onClick={() => seek(i)}><span>0{i + 1}</span>{item.label}</button></li>)}</ol>
        <div className="about-slides">{threads.map(item => <div className="about-slide" key={item.label}>
          <div className="about-text">
            <span className="about-big" aria-label={item.label}>{[...item.label].map((char, i) => <span className="kl" aria-hidden="true" key={i}>{char}</span>)}</span>
            <p className="about-statement">{item.statement}</p>
            <ol className={`about-rows ${item.wins ? 'is-wins' : ''}`}>{(item.wins || item.rows).map(([when, what, detail]) => <li key={what}><span className="row-when">{when}</span><div><strong>{what}</strong><p>{detail}</p></div></li>)}</ol>
          </div>
          {item.wins
            ? <figure className="about-shots about-tally" data-count="0" aria-label="Six placements: three firsts, two seconds and a third">{tally.map(([place, count]) => <div key={place}><b className="tally-n" data-n={count}>{count}</b><span>× {place} place</span></div>)}<figcaption>{item.caption}</figcaption></figure>
            : <figure className="about-shots" data-count={item.shots.length}>{item.shots.map(shot => <img key={shot.src} src={shot.src} alt={shot.alt} loading="lazy" decoding="async"/>)}<figcaption>{item.caption}</figcaption></figure>}
        </div>)}</div>
      </div>
      <div className="chapter-exit"><p>The longer version has more people and fewer job titles.</p><a href="/about/">Read my story <span aria-hidden="true">→</span></a><a href="#workflow">See the work <span aria-hidden="true">↓</span></a></div>
    </div>
  </section>;
}
