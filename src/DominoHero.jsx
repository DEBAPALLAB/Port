import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import useReducedMotion from './useReducedMotion.js';

function DominoFallback({ failed, push }) {
  return <div className={`domino-fallback ${failed ? 'is-fallback' : ''}`} aria-hidden={!failed}>
    <svg viewBox="0 0 900 300" aria-hidden="true">
      <defs><filter id="fallback-shadow"><feDropShadow dx="-10" dy="13" stdDeviation="6" floodColor="#9b8c7a" floodOpacity=".16"/></filter></defs>
      <g filter="url(#fallback-shadow)">{Array.from({length: 10}, (_, i) => <g key={i} transform={`translate(${120+i*67} ${90+Math.sin(i*.35)*30}) skewY(-9)`}>
        <path d="M0 0 10-6 10 125 0 131z" fill={i ? '#d9d3c9' : '#c1442a'} transform="translate(46 0)"/>
        <rect width="46" height="131" rx="5" fill={i ? '#f8f5ef' : '#ed5939'} stroke={i ? '#ded8ce' : '#d64b2e'}/>
        <path d="M9 66h28" stroke={i ? '#cbc4b8' : '#ffd6c8'}/><g fill={i ? '#4b4740' : '#fff'}><circle cx="23" cy="33" r="4"/><circle cx="14" cy="88" r="4"/><circle cx="32" cy="110" r="4"/></g>
      </g>)}</g>
    </svg>
    {failed && <button className="fallback-piece-button" onClick={push} aria-label="Activate the first domino and enter the portfolio"/>}
  </div>;
}

const DominoHero = forwardRef(function DominoHero({ onActivate, onReplay }, ref) {
  const hostRef = useRef(null), canvasRef = useRef(null), anchorRef = useRef(null), apiRef = useRef(null);
  const soundRef = useRef(false), activatedRef = useRef(false), activateCallback = useRef(onActivate);
  activateCallback.current = onActivate;
  const [sound, setSound] = useState(false), [status, setStatus] = useState('loading'), [failed, setFailed] = useState(false);
  const reducedMotion = useReducedMotion();
  const activate = useCallback(() => {
    if (activatedRef.current) return;
    activatedRef.current = true;
    setStatus('falling');
    activateCallback.current();
  }, []);
  const push = useCallback(() => {
    if (activatedRef.current) return;
    // Navigation is independent of the WebGL asset and cascade duration.
    activate();
    if (apiRef.current && !failed) apiRef.current.push();
    else setStatus('complete');
  }, [activate, failed]);
  const reset = useCallback(() => {
    activatedRef.current = false;
    apiRef.current?.reset();
    setStatus('ready');
  }, []);
  useImperativeHandle(ref, () => ({ reset, push }), [reset, push]);
  useEffect(() => {
    let cancelled = false, api;
    import('./createDominoScene.js').then(({ createDominoScene }) => {
      if (cancelled) return;
      api = createDominoScene({
        host: hostRef.current, canvas: canvasRef.current, anchor: anchorRef.current,
        reducedMotion, soundEnabled: () => soundRef.current,
        onReady: () => { if (!cancelled && !activatedRef.current) setStatus('ready'); },
        onStart: () => { if (!cancelled) activate(); },
        onComplete: () => { if (!cancelled) setStatus('complete'); },
        onFailure: () => { if (!cancelled) { setFailed(true); if (!activatedRef.current) setStatus('ready'); } },
      });
      apiRef.current = api;
      if (activatedRef.current) api.push();
    }).catch(() => { if (!cancelled) { setFailed(true); if (!activatedRef.current) setStatus('ready'); } });
    return () => { cancelled = true; api?.destroy(); apiRef.current = null; };
  }, [reducedMotion, activate]);
  function toggleSound() { soundRef.current = !soundRef.current; setSound(soundRef.current); }
  const started = activatedRef.current;
  return <section className={`hero ${started ? 'hero-complete' : ''}`} aria-labelledby="hero-title" data-state={status}>
    <div className="hero-heading"><p className="hero-intro">Product thinking. Hands-on building.</p><h1 id="hero-title">Every product starts<br/>with a <span>decision.</span></h1></div>
    <div className={`domino-stage ${failed ? 'stage-failed' : ''}`} ref={hostRef} data-state={status}>
      <DominoFallback failed={failed} push={push}/><canvas ref={canvasRef} className="domino-canvas" aria-hidden="true"/>
      <div className="first-piece-anchor" ref={anchorRef} aria-hidden="true"><svg viewBox="0 0 90 70"><path d="M5 56C41 68 66 33 73 12M62 20l12-9 2 15" fill="none" stroke="#ed5939" strokeWidth="1.5" strokeLinecap="round"/></svg><span>Start something.</span></div>
    </div>
    <div className="hero-bottom">
      <div className="hero-note"><span className="tiny-domino" aria-hidden="true"/><p>I’m Debapallab.<br/><span>Product, code, and getting it used.</span></p></div>
      <div className="hero-action" aria-live="polite"><button className="push-button" id="start-journey" onClick={started ? onReplay : push} aria-label={started ? 'Replay the portfolio journey' : 'Push the first domino to enter the portfolio'}><span className="push-glyph" aria-hidden="true"><i/><i/><i/></span>{started ? 'Start again' : 'Push the first piece'}<span aria-hidden="true">{started ? '↺' : '↘'}</span></button></div>
      <div className="hero-utilities">{!reducedMotion && <button className="utility-button sound-button" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? 'Turn sound off' : 'Turn sound on'}><svg viewBox="0 0 22 20" aria-hidden="true"><path d="M3 7h4l5-4v14l-5-4H3z" fill="none" stroke="currentColor" strokeWidth="1.3"/>{sound ? <path d="M15 6c3 2 3 6 0 8M17 3c5 3 5 11 0 14" fill="none" stroke="currentColor" strokeWidth="1.3"/> : <path d="m16 8 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.3"/>}</svg><span>Sound {sound ? 'on' : 'off'}</span></button>}</div>
    </div>
  </section>;
});
export default DominoHero;
