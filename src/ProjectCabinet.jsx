import React, { useEffect, useRef, useState } from 'react';
import './project-cabinet.css';
import DrawerCards from './DrawerCards.jsx';
import useDrawerMotion from './useDrawerMotion.js';

const colours = { mindspace:'#e7c7bc', comparefi:'#cbd9df', luman:'#d9d7c4', notaprompt:'#cfd8ca', gdc:'#e2cbbd', lucide:'#d3d5de', poker:'#dcd2b4', culprit:'#d7cbd7', superforms:'#c7d8d2' };

export default function ProjectCabinet({ projects, selected, onSelect, reducedMotion }) {
  const [open, setOpen] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [cardStates, setCardStates] = useState({});
  const root = useRef(null);
  const leaveTimer = useRef(null);
  const hoverTimer = useRef(null);
  const dismissed = useRef(null);
  const pointerDrawer = useRef(null);
  const expandedId = open || hovered;
  useDrawerMotion(root, expandedId, open, cardStates, reducedMotion);
  useEffect(() => () => { clearTimeout(leaveTimer.current); clearTimeout(hoverTimer.current); }, []);
  const close = () => {
    const front = root.current?.querySelector(`[data-project="${expandedId}"] .drawer-front`);
    dismissed.current = pointerDrawer.current===expandedId ? expandedId : null;
    clearTimeout(leaveTimer.current);
    clearTimeout(hoverTimer.current);
    setHovered(null);
    setOpen(null);
    front?.focus({ preventScroll:true });
  };
  const positionDrawer = id => {
    const drawer = root.current?.querySelector(`[data-project="${id}"]`);
    if (drawer) {
      const top = drawer.getBoundingClientRect().top;
      const panelTop = Math.max(85,Math.min(top-35,window.innerHeight-440));
      drawer.style.setProperty('--drawer-clearance', `${Math.max(0,192-top)}px`);
      drawer.style.setProperty('--inspector-offset', `${panelTop-top}px`);
      drawer.style.setProperty('--inspector-room', `${Math.max(180,window.innerHeight-panelTop-20)}px`);
    }
  };
  useEffect(() => {
    clearTimeout(hoverTimer.current);
    clearTimeout(leaveTimer.current);
    if (!projects.some(project => project.id === open)) setOpen(null);
    setHovered(null);
  }, [projects.map(project => project.id).join('|')]);

  return <div className="cabinet-archive" ref={root} data-reduced={reducedMotion} data-has-open={!!expandedId} onKeyDown={event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }}>
    <div className="cabinet-instructions"><p>A little cabinet of things I’ve made.</p><span className="cabinet-pointer-instruction">Hover to pull a drawer. Click to explore its files.</span><span className="cabinet-touch-instruction">Tap a drawer to explore its files.</span></div>
    <div className="project-cabinet" role="group" aria-label="Project filing cabinet">
      {projects.map((project, index) => {
        const expanded = expandedId === project.id;
        const notesOpen = open===project.id;
        const activeCard = open===project.id ? (cardStates[project.id] ?? 0) : -1;
        const chooseCard = value => {
          clearTimeout(leaveTimer.current);
          clearTimeout(hoverTimer.current);
          setOpen(project.id);
          setHovered(null);
          setCardStates(state=>state[project.id]===value?state:{...state,[project.id]:value});
        };
        return <div className="cabinet-drawer" key={project.id} data-open={expanded} data-pinned={open===project.id} data-notes-open={notesOpen} data-selected={selected === project.id}
          data-project={project.id}
          data-panel-side={index%3===0?'right':'left'}
          style={{ '--folder-colour': colours[project.id] || '#d9dfd3', '--drawer-delay': `${index * 65}ms` }}
          onPointerEnter={event => {
            if (event.pointerType==='mouse') pointerDrawer.current=project.id;
            if (event.pointerType!=='mouse' || open || dismissed.current===project.id) return;
            clearTimeout(leaveTimer.current);
            clearTimeout(hoverTimer.current);
            hoverTimer.current=setTimeout(()=>{
              positionDrawer(project.id);
              setHovered(project.id);
            },120);
          }}
          onPointerLeave={() => {
            if (pointerDrawer.current===project.id) pointerDrawer.current=null;
            if (dismissed.current===project.id) dismissed.current=null;
            clearTimeout(hoverTimer.current);
            clearTimeout(leaveTimer.current);
            leaveTimer.current=setTimeout(()=>setHovered(current=>current===project.id?null:current),180);
          }}>
          <button className="drawer-front" aria-expanded={notesOpen} aria-controls={`notes-${project.id}`}
            aria-label={`${open===project.id ? 'Close' : expanded ? 'Keep open' : 'Open'} ${project.name} drawer`}
            onClick={() => { if (open===project.id) close(); else { clearTimeout(leaveTimer.current); clearTimeout(hoverTimer.current); positionDrawer(project.id); setHovered(null); setOpen(project.id); } }}>
            <span className="drawer-face">
            <span className="drawer-label-frame"><span className="drawer-label">{project.name}</span></span>
            <svg className="drawer-keyhole" viewBox="0 0 16 25" aria-hidden="true"><path d="M5 12a6 6 0 1 1 6 0l2 10H3Z"/></svg>
            <span className="drawer-handle" aria-hidden="true"/>
            <span className="drawer-kind">{project.kind}</span>
            </span>
          </button>
          <div className="drawer-cavity" aria-hidden="true"/>
          <div className="drawer-tray" aria-hidden="true"/>
          <div className="drawer-bridge" aria-hidden="true"/>
          <div className="drawer-files" id={`drawer-${project.id}`} inert={!expanded} aria-hidden={!expanded}>
            <div className="drawer-paper-window" inert={open!==project.id}>
              <DrawerCards project={project} active={activeCard} onChoose={chooseCard} onOpen={event=>{setOpen(project.id);onSelect(project.id,event.currentTarget);}}/>
            </div>
            <div className="drawer-inspector" id={`notes-${project.id}`} inert={!notesOpen} aria-hidden={!notesOpen}>
              <div className="drawer-inspector-header"><h4>{project.name}</h4><button className="drawer-close" onClick={close} aria-label={`Close ${project.name} drawer`}>Close <span aria-hidden="true">×</span></button></div>
              <div className="folder-content"><p>{project.kind}</p><div className="drawer-primary-actions">
                <button onClick={event => { setOpen(project.id); onSelect(project.id, event.currentTarget); }}>Explore the file <span aria-hidden="true">↗</span></button>
                {project.url
                  ? <a className="folder-live-link" href={project.url} target="_blank" rel="noreferrer">Visit product <span aria-hidden="true">↗</span></a>
                  : <a href={`/work/${project.id}/`}>Full case study <span aria-hidden="true">→</span></a>}
              </div></div>
              <div className="drawer-card-selector" role="group" aria-label={`Lift a ${project.name} preview card`}>
                {['The story','The screens',project.url?'The destination':'The concept'].map((label,index)=><button key={label}
                  aria-pressed={activeCard===index}
                  onClick={()=>chooseCard(index)}>
                  <span className="selector-paper" aria-hidden="true"/>
                  <span>{label}<small>{['Purpose, decisions, and lessons','Real captures of the interface',project.url?project.domain:'Scope and working prototype'][index]}</small></span>
                  <span aria-hidden="true">{activeCard===index?'●':''}</span>
                </button>)}
              </div>
              <p className="drawer-inspector-hint">Choose a title to preview. Explore the file to read the full story.</p>
            </div>
          </div>
          <div className="drawer-side" aria-hidden="true"/>
          <div className="drawer-mobile-selector" role="group" aria-label={`Choose a ${project.name} card`} inert={!notesOpen} aria-hidden={!notesOpen}>
            {['Story','Screens',project.url?'Destination':'Concept'].map((label,index)=><button key={label} aria-pressed={activeCard===index}
              onClick={()=>chooseCard(index)}>{label}</button>)}
          </div>
        </div>;
      })}
    </div>
    <div className="cabinet-foot"><span>{projects.length} {projects.length === 1 ? 'file' : 'files'} in this cabinet</span><span>Made, kept, still evolving.</span></div>
  </div>;
}
