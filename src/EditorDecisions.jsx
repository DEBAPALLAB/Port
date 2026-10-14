import React, { useState } from 'react';
import { decisionKinds, editorScreens } from './editorDecisions.js';

// Opens the card beside its box, towards the roomier side of the screenshot.
function cardPlacement([x, y, w, h]) {
  const place = {};
  if (x + w / 2 > 50) place.right = `${100 - x + 1.2}%`; else place.left = `${x + w + 1.2}%`;
  if (y + h / 2 > 55) place.bottom = `${Math.max(100 - y - h, 2)}%`; else place.top = `${Math.max(y, 2)}%`;
  return place;
}

export default function EditorDecisions() {
  const [screenId, setScreenId] = useState('build');
  const [hovered, setHovered] = useState(null), [pinned, setPinned] = useState(null), [kindFocus, setKindFocus] = useState(null);
  const screen = editorScreens.find(item => item.id === screenId);
  const active = hovered ?? pinned, decision = active === null ? null : screen.decisions[active];

  function chooseScreen(id) { setScreenId(id); setHovered(null); setPinned(null); }
  // A click pins (or unpins) the card; clearing hover lets a second tap close it on touch screens.
  function toggle(index) { setHovered(null); setPinned(current => current === index ? null : index); }
  const boxStyle = ([x, y, w, h]) => ({ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` });

  return <figure className="editor-reading" aria-labelledby="editor-reading-title" onKeyDown={event => { if (event.key === 'Escape') { setHovered(null); setPinned(null); } }}>
    <div className="editor-reading-heading"><h3 id="editor-reading-title">Every mark is a decision.</h3><p>The Superforms builder and design panel as they ship. Hover a highlighted area to see the decision and why it exists. Colour shows who it serves.</p></div>
    <div className="decision-toolbar">
      <div className="screen-switch" role="group" aria-label="Choose a screen">{editorScreens.map(item => <button key={item.id} aria-pressed={screenId === item.id} onClick={() => chooseScreen(item.id)}>{item.label}<span>{item.decisions.length}</span></button>)}</div>
      <ul className="decision-legend" aria-label="Colour key">{Object.entries(decisionKinds).map(([kind, item]) => <li key={kind} data-kind={kind} tabIndex="0" data-focused={kindFocus === kind} onMouseEnter={() => setKindFocus(kind)} onMouseLeave={() => setKindFocus(null)} onFocus={() => setKindFocus(kind)} onBlur={() => setKindFocus(null)}><span className="kind-dot" aria-hidden="true"/>{item.label}</li>)}</ul>
    </div>
    <div className="editor-shot" data-spotlight={active !== null}>
      <img key={screen.src} src={screen.src} alt={screen.alt} width="1440" height="960" decoding="async"/>
      {screen.decisions.map((item, index) => <button key={`${screenId}-${index}`} type="button" className="decision-spot" data-kind={item.kind} data-active={active === index} data-muted={!!kindFocus && kindFocus !== item.kind} style={boxStyle(item.box)} aria-label={`${index + 1}. ${item.title}`} aria-expanded={active === index} aria-describedby={active === index ? 'decision-card' : undefined} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)} onClick={() => toggle(index)}><span className="decision-tag" aria-hidden="true">{index + 1}</span></button>)}
      {decision && <div key={`${screenId}-${active}`} id="decision-card" className="decision-card" data-kind={decision.kind} style={cardPlacement(decision.box)} role="note"><span className="decision-kind"><span className="kind-dot" aria-hidden="true"/>{decisionKinds[decision.kind].label}</span><strong>{decision.title}</strong><p><span>Why it exists</span>{decision.why}</p></div>}
    </div>
    <figcaption><ol className="decision-index">{screen.decisions.map((item, index) => <li key={`${screenId}-${index}`} data-kind={item.kind} data-active={active === index} data-muted={!!kindFocus && kindFocus !== item.kind}><button type="button" aria-expanded={active === index} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} onClick={() => toggle(index)}><span className="decision-number">{index + 1}</span><span className="decision-index-title">{item.title}</span><span className="decision-index-kind">{decisionKinds[item.kind].short}</span></button><p>{item.why}</p></li>)}</ol></figcaption>
  </figure>;
}
