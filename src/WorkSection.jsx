import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import FolioStage from './FolioStage.jsx';
import EditorDecisions from './EditorDecisions.jsx';

const chapters = [
  { label: 'The brief', title: 'Start with what matters.', body: 'Someone wants to collect useful answers. The first decision is what to ask — before choosing a field, a theme, or an animation.', connection: 'The brief gives the interface a purpose.' },
  { label: 'The interface', title: 'Control after the first draft.', body: 'A generated draft is a starting point. People still need to edit the questions, preview the result, and trust that a change won’t break what they already built.', connection: 'AI can change a question. It must not rewrite its identity.' },
  { label: 'The response', title: 'The answer has to go somewhere.', body: 'A missing answer gets a useful error; a valid answer becomes structured data. Then the work extends to publishing, sharing, and understanding responses.', connection: 'The experience ends with something usable.' },
];

const folioPrint = { brief: 'Help people register for a design meetup.', question: 'Which session would you join?', required: true, options: ['Product decisions', 'Frontend craft', 'Shipping the first version'], response: null };

export default function WorkSection({ animate, reducedMotion, enabled, intent, onIntent }) {
  const root = useRef(null);
  const [opened, setOpened] = useState(false), [chapter, setChapter] = useState(0);
  const [visitorChoice, setVisitorChoice] = useState(null);
  const story = chapters[chapter];
  useEffect(() => {
    if (!animate) return;
    const context = gsap.context(() => {
      for (const selector of ['.work-intro', '.superforms-copy']) {
        const group=root.current.querySelector(selector);
        gsap.from(group.children, { y: 14, opacity: 0, duration: .55, stagger: .035, ease: 'power2.out', clearProps:'transform,opacity', scrollTrigger: { trigger: group, start: 'top 90%', once: true } });
      }
      gsap.from('.folio-stage', { y: 16, opacity: 0, duration: .6, ease: 'power2.out', clearProps:'transform,opacity', scrollTrigger: { trigger: '.folio-stage', start: 'top 92%', once: true } });
    }, root);
    return () => context.revert();
  }, [animate]);

  function visit(index) { setChapter(index); setOpened(true); }

  return <section className="work-section superforms-chapter folio-reconsidered" id="work" ref={root} aria-labelledby="work-title" data-open={opened} data-chapter={chapter}>
    <div className="work-intro"><h2 id="work-title" tabIndex="-1">Less building.<br/>More answering.</h2><p className="chapter-description">Superforms turns a brief into a designed form.<br/>Follow one decision from intention to interaction.</p></div>
    <div className="superforms-layout">
      <div className="folio-wrap"><FolioStage enabled={enabled} opened={opened} layer={chapter} print={folioPrint} reducedMotion={reducedMotion} onOpen={index => Number.isInteger(index) ? visit(index) : setOpened(value => !value)}/><div className="folio-controls"><button className="solid-action" onClick={() => setOpened(value => !value)} aria-expanded={opened}>{opened ? 'Close the folio' : 'Open Superforms'} <span aria-hidden="true">{opened ? '↙' : '↗'}</span></button><span>A brief. An interface. An answer.</span></div></div>
      <div className="superforms-copy"><a className="chapter-project-name" href="https://www.superforms.in" target="_blank" rel="noreferrer">Superforms.in <span aria-hidden="true">↗</span></a><a className="file-case-link superforms-case-link" href="/work/superforms/">Read the Superforms case study <span aria-hidden="true">→</span></a><p className="project-introduction">The product decision<br/>is in the details.</p><div className="layer-switch" role="group" aria-label="Follow the Superforms story">{chapters.map((item, index) => <button key={item.label} aria-pressed={chapter === index} onClick={() => visit(index)}><span className="layer-paper" aria-hidden="true"/>{item.label}</button>)}</div><div className="layer-story" aria-live="polite"><h3>{story.title}</h3><p>{story.body}</p></div><p className="story-connection">{story.connection}</p><button className="story-next" onClick={() => visit((chapter + 1) % 3)}>{chapter === 2 ? 'Back to the brief' : chapter === 0 ? 'See what the decision changes' : 'See where the answer goes'} <span aria-hidden="true">→</span></button></div>
    </div>
    <EditorDecisions/>
    <div className="answer-study perspective-handoff"><div><h3>Where should we go next?</h3><p>Carry your perspective into the wider body of work.</p></div><div className="answer-options" role="group" aria-label="Choose your portfolio intention">{[['product', 'A useful product'], ['frontend', 'A better interface'], ['distribution', 'A public presence']].map(([id, label]) => <button key={id} aria-pressed={visitorChoice === id} onClick={() => { setVisitorChoice(id); onIntent(id); }}><span className="answer-check" aria-hidden="true">{visitorChoice === id ? '✓' : '+'}</span>{label}</button>)}</div><div className="answer-feedback" aria-live="polite">{visitorChoice ? 'That perspective carries forward. You can change it at any point.' : 'The story continues either way.'}</div></div> {/* taste-skill-ignore: the check mark is the selected answer indicator. */}
    <div className="chapter-exit"><p>A decision only matters when the interface follows through.</p><a href="#workflow">Open the project files <span aria-hidden="true">↓</span></a></div>
  </section>;
}
