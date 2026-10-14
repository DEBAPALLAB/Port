import React, { useEffect, useRef, useState } from 'react';
import { Stage3D } from './case/kit.jsx';
import { caseIndex } from './case/caseIndex.js';
import { projects } from './projects.js';

const shelfScene = () => import('./case/scenes/shelf.js');

// Every case study is a domino. Hovering a title lifts its piece; pushing a piece opens its story.
export default function CaseShelf() {
  const stage = useRef(null);
  const [hot, setHot] = useState(null);
  useEffect(() => {
    const reset = event => { if (event.persisted) stage.current?.send('reset'); };
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);
  const onEvent = (name, slug) => {
    if (name === 'hover') setHot(slug);
    if (name === 'open') window.location.assign(`/work/${slug}/`);
  };
  return <section id="cases" className="case-shelf" aria-labelledby="cases-title">
    <div className="shelf-heading">
      <h2 id="cases-title" tabIndex="-1">Nine pieces.<br/>Push any one.</h2>
      <p>Each case study follows one decision through the product, the build and what came after: real screens, real code, and the trade-offs I would make again.</p>
    </div>
    <div className="shelf-stage">
      <Stage3D ref={stage} scene={shelfScene} label="Nine standing dominoes, one for each case study. Push a piece to open its case study." onEvent={onEvent}/>
      <p className="shelf-hint" aria-hidden="true">Drag to look around. Push a piece to open it.</p>
    </div>
    <ul className="shelf-list">
      {caseIndex.map(item => {
        const project = projects.find(entry => entry.id === item.slug);
        return <li key={item.slug}><a href={`/work/${item.slug}/`} data-hot={hot === item.slug}
          onPointerEnter={() => stage.current?.send('focus', item.slug)} onPointerLeave={() => stage.current?.send('focus', null)}
          onFocus={() => stage.current?.send('focus', item.slug)} onBlur={() => stage.current?.send('focus', null)}>
          <span className="shelf-name">{item.name}</span><span className="shelf-kind">{project?.kind}</span><span className="shelf-line">{item.line}</span><span className="shelf-arrow" aria-hidden="true">→</span>
        </a></li>;
      })}
    </ul>
  </section>;
}
