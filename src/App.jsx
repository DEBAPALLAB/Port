import React, { useCallback, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import DominoHero from './DominoHero.jsx';
import WorkSection from './WorkSection.jsx';
import RangeSection from './RangeSection.jsx';
import ContactSection from './ContactSection.jsx';
import CaseShelf from './CaseShelf.jsx';
import JourneyThread from './JourneyThread.jsx';
import useReducedMotion from './useReducedMotion.js';
import { initialJourney, journeyReducer, shouldAnimateJourney } from './journeyState.js';
import { CASCADE_DURATION } from './dominoMath.js';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function App() {
  const [journey, dispatch] = useReducer(journeyReducer, initialJourney);
  const reducedMotion = useReducedMotion();
  const [intent, setIntent] = useState('product');
  const [revision, setRevision] = useState(0);
  const rootRef = useRef(null), heroRef = useRef(null), entryTimeline = useRef(null);
  const unlocked = journey.phase !== 'idle';
  const animate = shouldAnimateJourney(journey, reducedMotion);
  useLayoutEffect(() => {
    const destination = window.location.hash.slice(1);
    if (['work', 'workflow', 'cases', 'connect'].includes(destination)) dispatch({ type: 'BROWSE', destination });
  }, []);
  const activate = useCallback(() => dispatch({ type: 'START' }), []);

  useLayoutEffect(() => {
    if (journey.phase !== 'entering') return;
    const target = document.getElementById(journey.destination);
    if (!target) return;
    let finished = false;
    const finish = (moveFocus = true) => {
      if (finished) return;
      finished = true;
      dispatch({ type: 'ARRIVE' });
      if (moveFocus) {
        const heading = target.querySelector('h2');
        if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
      }
    };
    if (!animate) {
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      finish();
      return;
    }
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ onComplete: () => finish() });
      entryTimeline.current = timeline;
      // Keep the cascade in view, then carry its momentum into the next chapter.
      timeline.to(window, { scrollTo: { y: target, offsetY: 88, autoKill: true, onAutoKill: () => finish(false) }, duration: 1.35, ease: 'power2.inOut' }, CASCADE_DURATION - .25);
    }, rootRef);
    const interrupt = () => { entryTimeline.current?.kill(); finish(false); };
    const keyInterrupt = event => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) interrupt(); };
    window.addEventListener('wheel', interrupt, { passive: true });
    window.addEventListener('touchmove', interrupt, { passive: true });
    window.addEventListener('keydown', keyInterrupt);
    // Kill an interrupted handoff without reverting window scroll position.
    return () => {
      finished = true;
      window.removeEventListener('wheel', interrupt); window.removeEventListener('touchmove', interrupt); window.removeEventListener('keydown', keyInterrupt);
      entryTimeline.current?.kill(); entryTimeline.current = null; context.kill(false);
    };
  }, [journey.phase, journey.mode, journey.destination, animate]);

  const replay = useCallback(() => {
    entryTimeline.current?.kill();
    gsap.killTweensOf(window);
    window.scrollTo({ top: 0, behavior: 'instant' });
    heroRef.current?.reset();
    dispatch({ type: 'REPLAY' });
    setIntent('product');
    setRevision(value => value + 1);
    requestAnimationFrame(() => document.getElementById('start-journey')?.focus({ preventScroll: true }));
  }, []);

  function navigate(event, destination) {
    event.preventDefault();
    entryTimeline.current?.kill();
    gsap.killTweensOf(window);
    if (journey.phase === 'entering') dispatch({ type: 'ARRIVE' });
    if (!unlocked) {
      dispatch({ type: 'BROWSE', destination });
      return;
    }
    const target = document.getElementById(destination);
    target?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
    const heading = target?.querySelector('h2');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }

  return <div className={`site-root ${unlocked ? 'journey-open' : 'journey-locked'}`} data-journey-phase={journey.phase} data-journey-mode={journey.mode || 'none'} ref={rootRef}>
    <a className="skip-link" href="#work" onClick={event => navigate(event, 'work')}>Skip animation and read the work</a>
    <header className="site-header"><a className="identity" href="#top" aria-label="Debapallab Das, back to top"><svg className="identity-mark" viewBox="0 0 26 34" aria-hidden="true"><rect x="3" y="1" width="20" height="32" rx="4" fill="#ed5939" transform="rotate(-9 13 17)"/><path d="M8 17h10" stroke="#fff" strokeWidth="1"/><circle cx="13" cy="9" r="2" fill="#fff"/><circle cx="10" cy="23" r="1.8" fill="#fff"/><circle cx="16" cy="27" r="1.8" fill="#fff"/></svg><span>Debapallab Das<span className="identity-sub">Product + engineering</span></span></a><nav aria-label="Main navigation"><a href="#work" onClick={event => navigate(event, 'work')}>Selected work</a><a href="#cases" onClick={event => navigate(event, 'cases')}>Case studies</a><a href="/about/">About</a><a className="studio-nav" href="https://lucide.in" target="_blank" rel="noreferrer">My studio <span aria-hidden="true">↗</span></a><a href="#connect" onClick={event => navigate(event, 'connect')} className="nav-contact">Contact <span aria-hidden="true">↗</span></a></nav></header>
    <main id="top"><DominoHero ref={heroRef} onActivate={activate} onReplay={replay}/><div key={revision} className="journey-shell" hidden={!unlocked} inert={!unlocked} aria-hidden={!unlocked} data-testid="journey-content"><WorkSection enabled={unlocked} animate={animate} reducedMotion={reducedMotion} intent={intent} onIntent={setIntent}/><RangeSection animate={animate} reducedMotion={reducedMotion} intent={intent} onIntent={setIntent}/><CaseShelf/><ContactSection animate={animate} reducedMotion={reducedMotion} intent={intent} onIntent={setIntent} onReplay={replay}/></div></main>
    <JourneyThread enabled={unlocked && journey.mode === 'cinematic'} reducedMotion={reducedMotion} rootRef={rootRef}/>
  </div>;
}

