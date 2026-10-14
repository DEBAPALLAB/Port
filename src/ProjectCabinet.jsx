import React, { useEffect, useRef, useState } from 'react';
import './project-cabinet.css';

const colours = ['#e7c7bc', '#cbd9df', '#d9d7c4', '#cfd8ca', '#e2cbbd', '#d3d5de', '#dcd2b4', '#d7cbd7', '#c7d8d2'];

export default function ProjectCabinet({ projects, selected, onSelect, reducedMotion }) {
  const [pinned, setPinned] = useState(null);
  const [peek, setPeek] = useState(null);
  const root = useRef(null);
  const open = peek || pinned;
  useEffect(() => {
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

  return <div className="cabinet-archive" ref={root} data-reduced={reducedMotion} onKeyDown={event => {
    if (event.key === 'Escape') {
      event.target.closest('.cabinet-drawer')?.querySelector('.drawer-front')?.focus({ preventScroll:true });
      setPinned(null); setPeek(null);
    }
  }}>
    <div className="cabinet-instructions"><p>A little cabinet of things I’ve made.</p><span>Pull a drawer. Open a file.</span></div>
    <div className="project-cabinet" role="group" aria-label="Project filing cabinet">
      {projects.map((project, index) => {
        const expanded = open === project.id;
        return <div className="cabinet-drawer" key={project.id} data-open={expanded} data-selected={selected === project.id}
          style={{ '--folder-colour': colours[index % colours.length], '--drawer-delay': `${index * 65}ms` }}
          onPointerEnter={event => { if (event.pointerType === 'mouse') setPeek(project.id); }}
          onPointerLeave={() => setPeek(null)}
          onFocus={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPeek(project.id); }}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPeek(null); }}>
          <button className="drawer-front" aria-expanded={expanded} aria-controls={`drawer-${project.id}`}
            aria-label={`${expanded ? 'Close' : 'Pull open'} ${project.name} drawer`}
            onClick={() => { setPinned(pinned === project.id ? null : project.id); setPeek(null); }}>
            <span className="drawer-label-frame"><span className="drawer-label">{project.name}</span></span>
            <svg className="drawer-keyhole" viewBox="0 0 16 25" aria-hidden="true"><path d="M5 12a6 6 0 1 1 6 0l2 10H3Z"/></svg>
            <span className="drawer-handle" aria-hidden="true"/>
            <span className="drawer-kind">{project.kind}</span>
          </button>
          <div className="drawer-cavity" aria-hidden="true"/>
          <div className="drawer-tray" aria-hidden="true"/>
          <div className="drawer-files" id={`drawer-${project.id}`} inert={!expanded} aria-hidden={!expanded}>
            <div className="cabinet-folder folder-back" aria-hidden="true"><span>Notes & decisions</span></div>
            <div className="cabinet-folder folder-middle" aria-hidden="true"><span>{project.kind}</span></div>
            <div className="cabinet-folder folder-main">
              <span className="folder-tab">{project.name}</span>
              <div className="folder-content"><p>{project.story}</p><div>
                <button onClick={event => { setPinned(project.id); onSelect(project.id, event.currentTarget); }}>Explore the file <span aria-hidden="true">↗</span></button>
                {project.url
                  ? <a className="folder-live-link" href={project.url} target="_blank" rel="noreferrer">Visit product <span aria-hidden="true">↗</span></a>
                  : <a href={`/work/${project.id}/`}>Full case study <span aria-hidden="true">→</span></a>}
              </div></div>
            </div>
          </div>
          <div className="drawer-side" aria-hidden="true"/>
        </div>;
      })}
    </div>
    <div className="cabinet-foot"><span>{projects.length} {projects.length === 1 ? 'file' : 'files'} in this cabinet</span><span>Made, kept, still evolving.</span></div>
  </div>;
}
