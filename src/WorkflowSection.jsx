import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const tools = [
  { name: 'Documents', label: 'Keep the context close.', body: 'Write and organize shared documents with an AI writing assistant.', x: 146, y: 95, angle: -7 },
  { name: 'Tasks', label: 'Turn context into action.', body: 'Keep task lists alongside the work they belong to.', x: 415, y: 73, angle: 5 },
  { name: 'Calendar', label: 'Give the work a place in time.', body: 'Bring scheduling into the same team workspace.', x: 684, y: 105, angle: 8 },
  { name: 'Whiteboard', label: 'Make space for a rough idea.', body: 'Lay out ideas together on a shared whiteboard.', x: 267, y: 267, angle: -4 },
  { name: 'Chat', label: 'Keep the conversation connected.', body: 'Move between group chat and the documents, tasks, and ideas around it.', x: 548, y: 273, angle: 4 },
];
function ToolSymbol({ index }) {
  if (index === 0) return <g fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M-19-24h28l12 12v36h-40z"/><path d="M9-24v12h12M-10-2h20M-10 7h20M-10 16h12"/></g>;
  if (index === 1) return <g fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><rect x="-23" y="-23" width="46" height="46" rx="7"/><path d="m-13 0 9 9L14-10"/></g>;
  if (index === 2) return <g fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><rect x="-23" y="-21" width="46" height="44" rx="6"/><path d="M-23-8h46M-11-26v10M11-26v10"/><circle cx="0" cy="7" r="4"/></g>;
  if (index === 3) return <g fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M-24-18h48v34h-48zM0 16v13M-13 29h26M-15 4l10-13 12 15 9-7"/></g>;
  return <g fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M-23-20h46v34H-8l-13 10V14h-2zM-12-4h24M-12 5h16"/></g>;
}

export default function WorkflowSection({ animate, reducedMotion }) {
  const rootRef = useRef(null);
  const [mode, setMode] = useState('dashboard'), [selected, setSelected] = useState(0);
  const tool = tools[selected];
  useEffect(() => {
    const scope = rootRef.current;
    if (!animate || !scope) return;
    const context = gsap.context(() => {
      ScrollTrigger.create({ trigger: '.workflow-map', start: 'top 68%', once: true, onEnter: () => setMode('godmode') });
      gsap.from('.workflow-heading > *', { y: 28, opacity: 0, duration: .8, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: '.workflow-heading', start: 'top 86%', once: true } });
    }, scope);
    return () => context.revert();
  }, [animate]);
  useLayoutEffect(() => {
    const scope = rootRef.current;
    if (!scope) return;
    const immediate = reducedMotion || !animate;
    const timeline = gsap.timeline();
    tools.forEach((item, i) => {
      const open = mode === 'godmode';
      timeline.to(scope.querySelector(`.workflow-object-${i}`), { x: open ? item.x : 415 + (i - 2) * 9, y: open ? item.y : 165 + (i - 2) * 10, rotation: open ? item.angle : (i - 2) * 4, duration: immediate ? 0 : .85, ease: 'power3.inOut' }, immediate ? 0 : i * .045);
    });
    timeline.to(scope.querySelector('.workflow-connections'), { opacity: mode === 'godmode' ? 1 : 0, duration: immediate ? 0 : .45 }, immediate ? 0 : .4);
    // Preserve the current positions on interruption so the next mode flows from them.
    return () => timeline.kill();
  }, [mode, animate, reducedMotion]);
  return <section id="luman-workflow" className="workflow-section" ref={rootRef} aria-labelledby="workflow-title">
    <div className="workflow-heading"><h2 id="workflow-title">The pieces should<br/>work together.</h2><p>Luman brings the work into one place.<br/>Godmode gives you room to see the connections.</p></div>
    <div className="workflow-map">
      <div className="workflow-map-header"><span>Luman <span className="map-caption">Workflow study</span></span><button onClick={() => setMode(mode === 'godmode' ? 'dashboard' : 'godmode')} aria-pressed={mode === 'godmode'}>{mode === 'godmode' ? 'Return to dashboard' : 'Enter Godmode'} <span aria-hidden="true">{mode === 'godmode' ? '↙' : '↗'}</span></button></div>
      <svg viewBox="0 0 830 405" className="workflow-canvas" role="img" aria-label="Illustrated map of Luman documents, tasks, calendar, whiteboard, and chat">
        <g className="workflow-connections" stroke="#e1d5cb" strokeWidth="1.3" fill="none"><path d="M146 140C150 220 260 210 267 290M415 110C416 180 620 130 684 140M415 110C370 195 300 195 267 290M415 110C418 240 548 220 548 290M267 290C370 360 500 350 548 290"/></g>
        {tools.map((item, index) => <g key={item.name} className={`workflow-object workflow-object-${index}`} style={{ color: selected === index ? '#ed5939' : '#747168' }}>
          <rect x="-94" y="-60" width="188" height="137" rx="13" fill="#e8e3dc" transform="translate(5 7)"/><rect x="-94" y="-60" width="188" height="137" rx="13" fill="#fff" stroke={selected === index ? '#edac98' : '#dfd8ce'}/><g transform="translate(0 -13)"><ToolSymbol index={index}/></g><text x="0" y="50" textAnchor="middle" fill="#4e4b43" fontSize="12" fontFamily="Manrope Variable, sans-serif">{item.name}</text>
        </g>)}
      </svg>
      <div className="workflow-tool-tabs" role="group" aria-label="Explore Luman tools">{tools.map((item, i) => <button key={item.name} aria-pressed={selected === i} onClick={() => { setSelected(i); setMode('godmode'); }}>{item.name}</button>)}</div>
    </div>
    <div className="workflow-detail" aria-live="polite"><h3>{tool.label}</h3><p>{tool.body}</p><a href="https://luman.lucide.in" target="_blank" rel="noreferrer">Visit Luman <span aria-hidden="true">↗</span></a></div>
    <div className="approach-strip"><span>Think about the system.</span><span>Build the useful version.</span><span>Get it into people’s hands.</span></div>
  </section>;
}
