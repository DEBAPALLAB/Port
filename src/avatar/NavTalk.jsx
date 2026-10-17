import React, { useId } from 'react';
import { C, EarLeft, EarRight, HairBack, HairFront, Nose, line } from './avatarArt.jsx';
import { browPath, eyeShapes, facePath, faceShadowPath, mouthShape } from './avatarRig.js';
import './nav-talk.css';

// One fixed, sneaky expression for the cameo: head turned toward the button, eyes on it, brows up, a grin.
const GRIN = { yaw: 0.25, pitch: 0, roll: 0, gazeX: 0.4, gazeY: -0.1, blinkL: 0, blinkR: 0, lid: 0.12, brow: 0.7, browAsym: 0.5, furrow: 0, smile: 0.85, jaw: 0.12, open: 0.14, wide: 0.5, round: 0 };
const face = facePath(GRIN), shadow = faceShadowPath(GRIN), mouth = mouthShape(GRIN);
const eyes = { l: eyeShapes('left', GRIN), r: eyeShapes('right', GRIN) };
const brows = { l: browPath('left', GRIN), r: browPath('right', GRIN) };

function PeekHead() {
  const id = useId().replace(/:/g, '');
  return <svg className="nav-peek-head" viewBox="104 50 200 262" focusable="false">
    <defs>{['l', 'r'].map(k => <clipPath key={k} id={`${id}-${k}`}><path d={eyes[k].white}/></clipPath>)}<clipPath id={`${id}-m`}><path d={mouth.inner}/></clipPath></defs>
    <HairBack/><EarLeft/><EarRight/>
    <path d={face} fill={C.skin} {...line}/>
    <path d={shadow} fill={C.shade}/>
    {['l', 'r'].map(k => <g key={k}>
      <path d={eyes[k].white} fill={C.white}/>
      <g clipPath={`url(#${id}-${k})`}><g transform={`translate(${eyes[k].iris[0]} ${eyes[k].iris[1]})`}>
        <circle r="7.4" fill={C.iris}/><circle r="3.4" fill="#0d0706"/><circle cx="-2.6" cy="-2.6" r="1.9" fill="#fff"/>
      </g></g>
      <path d={eyes[k].lidFill} fill={C.skin}/>
      <path d={eyes[k].lash} fill="none" stroke={C.ink} strokeWidth="4.6" strokeLinecap="round"/>
      <path d={brows[k]} fill={C.hair} stroke={C.ink} strokeWidth="1.5" strokeLinejoin="round"/>
    </g>)}
    <Nose/>
    <path d={mouth.lowerLip} fill={C.lip}/>
    <path d={mouth.inner} fill={C.mouth}/>
    <g clipPath={`url(#${id}-m)`}><path d={mouth.tongue} fill={C.tongue}/><path d={mouth.teeth} fill={C.teeth}/></g>
    <path d={mouth.inner} fill="none" stroke={C.ink} strokeWidth="3.4" strokeLinejoin="round"/>
    <path d={mouth.creases} fill="none" stroke={C.shade} strokeWidth="2.4" strokeLinecap="round"/>
    <HairFront/>
  </svg>;
}

// The main nav's way into the conversation. On hover, the cartoon leaves the porthole,
// hides behind the button and peeks around its edge to make the pitch in person.
export default function NavTalk({ onClick }) {
  return <a href="#connect" onClick={onClick} className="nav-talk">
    <span className="nav-talk-slot" aria-hidden="true">
      <svg className="nav-talk-face" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill={C.skin}/><path d="M2.6 11.5C2.4 4.6 7.6 1.2 13 1.6c5.8.4 8.8 4.6 8.2 10.6-1.6-2.8-4.6-3.8-7.6-3-2.6-2-6.6-.6-11 2.3Z" fill={C.hair}/><circle cx="8.8" cy="13.6" r="1.15" fill={C.ink}/><circle cx="15.2" cy="13.6" r="1.15" fill={C.ink}/><rect className="nav-talk-lid" x="7" y="11.8" width="10" height="3.4" fill={C.skin}/><path d="M9.4 17.4q2.6 2 5.2 0" stroke={C.ink} strokeWidth="1.3" fill="none" strokeLinecap="round"/></svg>
    </span>
    <span className="nav-talk-label">Talk<span className="nav-talk-more"> to me</span></span>
    <span className="nav-talk-wave" aria-hidden="true"><i/><i/><i/></span>
    <span className="nav-peek" aria-hidden="true"><span className="nav-peek-hang"><PeekHead/></span></span>
    <span className="nav-peek-bubble" aria-hidden="true">Literally, talk to me. <small>(AI)</small></span>
  </a>;
}
