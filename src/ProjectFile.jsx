import React, { useEffect, useRef, useState } from 'react';
import { projects } from './projects.js';
import './project-file.css';

export default function ProjectFile({ project, onClose, onProject, reducedMotion }) {
  const dialog = useRef(null), frame = useRef(null), cleanupFrame = useRef(null);
  const [ready, setReady] = useState(false), [chapters, setChapters] = useState([]), [active, setActive] = useState('');
  const index = projects.findIndex(item=>item.id===project.id);
  useEffect(() => {
    const element = dialog.current;
    if (typeof element.showModal === 'function') element.showModal();
    else element.setAttribute('open', '');
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = overflow;
      cleanupFrame.current?.();
      if (element.open && typeof element.close === 'function') element.close();
    };
  }, []);
  useEffect(() => { setReady(false); setChapters([]); setActive(''); cleanupFrame.current?.(); }, [project.id]);
  useEffect(() => {
    if (!ready) return;
    const heading = frame.current?.contentDocument?.querySelector('h1');
    if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
  }, [ready, project.id]);

  function connectFile() {
    cleanupFrame.current?.();
    const doc = frame.current?.contentDocument, win = frame.current?.contentWindow;
    if (!doc || !win) return;
    let initialized = false, observer, frameId = 0;
    const updateProgress = () => {
      frameId = 0;
      const distance = doc.documentElement.scrollHeight - win.innerHeight;
      dialog.current?.style.setProperty('--file-read', String(distance > 0 ? win.scrollY / distance : 0));
    };
    const onScroll = () => { if (!frameId) frameId = win.requestAnimationFrame(updateProgress); };
    const onKey = event => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } };
    const initialize = () => {
      const sections = [...doc.querySelectorAll('[data-chapter]')];
      if (!sections.length || initialized) return;
      initialized = true; mutation.disconnect();
      setChapters(sections.map(node=>({ id:node.id, title:node.dataset.chapter })));
      setReady(true);
      observer = new win.IntersectionObserver(entries => {
        const visible = entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      }, { rootMargin:'-10% 0px -55% 0px' });
      sections.forEach(node=>observer.observe(node));
      win.addEventListener('scroll',onScroll,{passive:true});
      win.addEventListener('resize',onScroll);
      doc.addEventListener('keydown',onKey);
      updateProgress();
    };
    const mutation = new win.MutationObserver(initialize);
    mutation.observe(doc.body,{childList:true,subtree:true});
    initialize();
    cleanupFrame.current = () => {
      mutation.disconnect(); observer?.disconnect();
      win.removeEventListener('scroll',onScroll); win.removeEventListener('resize',onScroll);
      doc.removeEventListener('keydown',onKey); win.cancelAnimationFrame(frameId);
    };
  }
  function jump(id) {
    if (!id) { frame.current?.contentWindow?.scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'}); setActive(''); return; }
    frame.current?.contentDocument?.getElementById(id)?.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});
    setActive(id);
  }
  function nextFile(direction) { onProject(projects[(index+direction+projects.length)%projects.length].id); }
  return <dialog className="project-file-dialog" ref={dialog} aria-labelledby="open-file-name" data-ready={ready} data-reduced={reducedMotion}
    onCancel={event=>{event.preventDefault();onClose();}}>
    <header className="project-file-toolbar"><button className="file-return" onClick={onClose} autoFocus><span aria-hidden="true">←</span> Return to cabinet</button><div><h2 id="open-file-name">{project.name}</h2><span>{project.id==='mindspace'?'Internship contribution':project.kind}</span></div><a href={`/work/${project.id}/`} target="_blank" rel="noreferrer">Open as a page <span aria-hidden="true">↗</span></a></header>
    <div className="project-file-chapters"><nav aria-label="Project file chapters"><button onClick={()=>jump('')} aria-current={!active?'true':undefined}>Start</button>{chapters.map(item=><button key={item.id} aria-current={active===item.id?'true':undefined} onClick={()=>jump(item.id)}>{item.title}</button>)}</nav><select aria-label="Jump to a file chapter" value={active} onChange={event=>jump(event.target.value)}><option value="">Start of the file</option>{chapters.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select><div className="file-neighbours"><button onClick={()=>nextFile(-1)} aria-label="Previous project file">←</button><button onClick={()=>nextFile(1)} aria-label="Next project file">→</button></div></div>
    <div className="project-file-body">
      <div className="project-file-cover" key={`cover-${project.id}`} inert={ready} aria-hidden={ready}><span>{project.kind}</span><h3>{project.name}</h3><p>{project.story}</p><div><p>Real screens. The decisions. The details.</p><span role="status">Opening the complete file…</span><a href={`/work/${project.id}/`}>Read on its own page ↗</a></div></div>
      <iframe key={project.id} ref={frame} title={`${project.name} complete project file`} src={`/work/${project.id}/?file=1`} onLoad={connectFile} inert={!ready}/>
    </div>
    <div className="project-file-progress" aria-hidden="true"/>
  </dialog>;
}
