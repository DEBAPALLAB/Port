import React, { useEffect, useRef, useState } from 'react';
export default function FolioStage({ enabled, opened, layer, print, reducedMotion, onOpen }) {
  const host=useRef(null), canvas=useRef(null), scene=useRef(null), latest=useRef({opened,layer,print,reducedMotion}), callback=useRef(onOpen);
  const [ready,setReady]=useState(false);
  latest.current={opened,layer,print,reducedMotion}; callback.current=onOpen;
  useEffect(()=>{
    if(!enabled || typeof IntersectionObserver === 'undefined') return;
    let cancelled=false,started=false;
    const observer=new IntersectionObserver(async entries=>{
      if(started || !entries.some(entry=>entry.isIntersecting)) return;
      started=true;
      try { const {createFolioScene}=await import('./createFolioScene.js'); if(cancelled)return; scene.current=createFolioScene(canvas.current,host.current,index=>callback.current(index)); scene.current.update(latest.current); setReady(true); }
      catch { /* The HTML folio remains usable without WebGL. */ }
    },{rootMargin:'150px'});
    observer.observe(host.current);
    return ()=>{cancelled=true;observer.disconnect();scene.current?.dispose();scene.current=null;};
  },[enabled]);
  useEffect(()=>{scene.current?.update({opened,layer,print,reducedMotion});},[opened,layer,print,reducedMotion]);
  return <div className="folio-stage" ref={host} data-ready={ready} data-open={opened} data-layer={layer}><div className="folio-fallback" aria-hidden="true"><div className="paper-under paper-under-back"/><div className="paper-under"/><div className="paper-cover"><span>Superforms</span><strong>A brief.<br/>A working form.</strong><span className="paper-cover-foot">Follow the decision through.</span></div></div><canvas ref={canvas} className="folio-canvas" aria-hidden="true"/><span className="folio-material-note">Tap a paper tab to follow the decision.</span></div>;
}
