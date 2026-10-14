import React, { useEffect, useRef, useState } from 'react';
import './project-cabinet.css';
import DrawerCards from './DrawerCards.jsx';

const colours = { mindspace:'#e7c7bc', comparefi:'#cbd9df', luman:'#d9d7c4', notaprompt:'#cfd8ca', gdc:'#e2cbbd', lucide:'#d3d5de', poker:'#dcd2b4', culprit:'#d7cbd7', superforms:'#c7d8d2' };

export default function ProjectCabinet({ projects, selected, onSelect, reducedMotion }) {
  const [pinned, setPinned] = useState(null);
  const [peek, setPeek] = useState(null);
  const [cardStates, setCardStates] = useState({});
  const leaveTimer = useRef(null);
  const cardTimer = useRef(null);
  const root = useRef(null);
  const open = pinned || peek;
  const preview = id => {
    clearTimeout(leaveTimer.current);
    if (pinned) return;
    const drawer = root.current?.querySelector(`[data-project="${id}"]`);
    if (drawer) drawer.style.setProperty('--stack-offset', `${Math.max(20,110-drawer.getBoundingClientRect().top+80)}px`);
    setPeek(id);
  };
  const keepInView = id => {
    const drawer = root.current?.querySelector(`[data-project="${id}"]`);
    if (!drawer) return;
    const bounds=drawer.getBoundingClientRect();
    drawer.style.setProperty('--stack-offset','20px');
    if (bounds.top<200 || bounds.top>220) {
      window.scrollTo({top:window.scrollY+bounds.top-200,behavior:'instant'});
    }
  };
  useEffect(()=>()=>{clearTimeout(leaveTimer.current);clearTimeout(cardTimer.current);},[]);
  useEffect(() => {
    clearTimeout(cardTimer.current); clearTimeout(leaveTimer.current);
    if (!projects.some(project => project.id === pinned)) setPinned(null);
    setPeek(null);
  }, [projects.map(project => project.id).join('|')]);
  useEffect(() => {
    if (reducedMotion || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { root.current?.setAttribute('data-arrived', 'true'); observer.disconnect(); }
    }, { threshold: .15 });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return <div className="cabinet-archive" ref={root} data-reduced={reducedMotion} data-has-open={!!open} onKeyDown={event => {
    if (event.key === 'Escape') {
      clearTimeout(cardTimer.current);
      event.target.closest('.cabinet-drawer')?.querySelector('.drawer-front')?.focus({ preventScroll:true });
      clearTimeout(leaveTimer.current); setPeek(pinned || null); setPinned(null);
    }
  }}>
    <div className="cabinet-instructions"><p>A little cabinet of things I’ve made.</p><span>Pull a drawer. Choose a file. Watch it rise.</span></div>
    <div className="project-cabinet" role="group" aria-label="Project filing cabinet">
      {projects.map((project, index) => {
        const expanded = open === project.id;
        const notesOpen = expanded && pinned === project.id;
        const activeCard = cardStates[project.id] ?? -1;
        const chooseCard = value => {
          clearTimeout(cardTimer.current); clearTimeout(leaveTimer.current);
          if (!notesOpen) keepInView(project.id);
          setPinned(project.id); setPeek(null);
          setCardStates(state=>state[project.id]===value?state:{...state,[project.id]:value});
        };
        return <div className="cabinet-drawer" key={project.id} data-open={expanded} data-notes-open={notesOpen} data-selected={selected === project.id}
          data-project={project.id}
          data-panel-side={index%3===0?'right':'left'}
          style={{ '--folder-colour': colours[project.id] || '#d9dfd3', '--drawer-delay': `${index * 65}ms` }}
          onPointerEnter={event => { if (event.pointerType === 'mouse') preview(project.id); }}
          onPointerLeave={() => { clearTimeout(leaveTimer.current); leaveTimer.current=setTimeout(()=>setPeek(current=>current===project.id?null:current),280); }}
          onFocus={event => { if (!event.currentTarget.contains(event.relatedTarget)) { keepInView(project.id); preview(project.id); } }}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPeek(null); }}>
          <button className="drawer-front" aria-expanded={notesOpen} aria-controls={`notes-${project.id}`}
            aria-label={`${notesOpen ? 'Close notes for' : 'Explore notes for'} ${project.name}`}
            onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); if (!event.repeat) event.currentTarget.click(); } }}
            onClick={() => { clearTimeout(leaveTimer.current); clearTimeout(cardTimer.current); if (!notesOpen) keepInView(project.id); setPinned(pinned === project.id ? null : project.id); setPeek(project.id); }}>
            <span className="drawer-label-frame"><span className="drawer-label">{project.name}</span></span>
            <svg className="drawer-keyhole" viewBox="0 0 16 25" aria-hidden="true"><path d="M5 12a6 6 0 1 1 6 0l2 10H3Z"/></svg>
            <span className="drawer-handle" aria-hidden="true"/>
            <span className="drawer-kind">{project.kind}</span>
          </button>
          <div className="drawer-cavity" aria-hidden="true"/>
          <div className="drawer-tray" aria-hidden="true"/>
          <div className="drawer-files" id={`drawer-${project.id}`} inert={!expanded} aria-hidden={!expanded}>
            <DrawerCards project={project} active={notesOpen ? activeCard : -1} onChoose={chooseCard} onOpen={event=>{setPinned(project.id);onSelect(project.id,event.currentTarget);}}/>
            {project.url && <a className="drawer-peek-live" href={project.url} target="_blank" rel="noreferrer" inert={notesOpen} aria-hidden={notesOpen}>Visit product ↗</a>}
            <div className="drawer-inspector" id={`notes-${project.id}`} inert={!notesOpen} aria-hidden={!notesOpen}>
              <div className="folder-content"><h4>{project.name}</h4><p>{project.kind}</p><div className="drawer-primary-actions">
                <button onClick={event => { setPinned(project.id); onSelect(project.id, event.currentTarget); }}>Explore the file <span aria-hidden="true">↗</span></button>
                {project.url
                  ? <a className="folder-live-link" href={project.url} target="_blank" rel="noreferrer">Visit product <span aria-hidden="true">↗</span></a>
                  : <a href={`/work/${project.id}/`}>Full case study <span aria-hidden="true">→</span></a>}
              </div></div>
              <div className="drawer-card-selector" role="group" aria-label={`Lift a ${project.name} preview card`}>
                {['The story','The screens',project.url?'The destination':'The concept'].map((label,index)=><button key={label}
                  aria-pressed={activeCard===index}
                  onPointerEnter={event=>{if(event.pointerType==='mouse'){clearTimeout(cardTimer.current);cardTimer.current=setTimeout(()=>chooseCard(index),80);}}}
                  onPointerLeave={()=>clearTimeout(cardTimer.current)}
                  onFocus={()=>chooseCard(index)}
                  onClick={()=>chooseCard(index)}>
                  <span className="selector-paper" aria-hidden="true"/>
                  <span>{label}<small>{['Purpose, decisions, and lessons','Real captures of the interface',project.url?project.domain:'Scope and working prototype'][index]}</small></span>
                  <span aria-hidden="true">↗</span>
                </button>)}
              </div>
              <div className="drawer-file-slider">
                <button aria-label="Previous file" onClick={()=>chooseCard(activeCard<0?2:(activeCard+2)%3)}>←</button>
                <input type="range" min="0" max="2" step="1" value={Math.max(0,activeCard)} aria-label={`Slide through ${project.name} files`} aria-valuetext={['The story','The screens',project.url?'The destination':'The concept'][Math.max(0,activeCard)]} onChange={event=>chooseCard(Number(event.target.value))}/>
                <button aria-label="Next file" onClick={()=>chooseCard((activeCard+1)%3)}>→</button>
                <span>{activeCard<0?'Choose a file':`${activeCard+1} / 3`}</span>
              </div>
              <p className="drawer-inspector-hint"><span className="drawer-desktop-hint">Hover a title to lift its card.</span><span className="drawer-touch-hint">Tap a title to lift its card.</span></p>
            </div>
          </div>
          <div className="drawer-side" aria-hidden="true"/>
          <div className="drawer-mobile-selector" role="group" aria-label={`Choose a ${project.name} card`} inert={!notesOpen} aria-hidden={!notesOpen}>
            {['Story','Screens',project.url?'Live site':'Concept'].map((label,index)=><button key={label} aria-pressed={activeCard===index}
              onClick={()=>chooseCard(index)}>{label}</button>)}
          </div>
        </div>;
      })}
    </div>
    <div className="cabinet-foot"><span>{projects.length} {projects.length === 1 ? 'file' : 'files'} in this cabinet</span><span>Made, kept, still evolving.</span></div>
  </div>;
}
