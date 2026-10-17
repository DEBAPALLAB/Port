import React from 'react';

const captures = {
  superforms:'/cases/superforms/builder-build.jpg',
  culprit:'/cases/culprit/editor-tests.jpg',
  lucide:'/cases/lucide/live/hero-lit.jpg',
};
export default function DrawerCards({ project, active, onChoose, onOpen }) {
  const screen = captures[project.id] || `/cases/${project.id}/desktop-0.jpg`;
  return <div className="drawer-card-stack" aria-label={`${project.name} preview cards`}>
    <article className="drawer-preview-card story-preview" data-active={active===0} style={{'--card-order':0}}>
      <button className="preview-card-tab" aria-pressed={active===0} onClick={()=>onChoose(0)}>The story</button><div className="preview-card-heading"><span>{project.name}</span><span aria-hidden="true">↗</span></div>
      <p className="preview-card-title">{project.story}</p><p className="preview-card-note">{project.id==='mindspace'?'My internship contribution.':project.id==='culprit'?'An idea, a spec, and a prototype.':'The choices behind the finished work.'}</p>
      <button className="preview-card-action" inert={active!==0} onClick={onOpen}>Read the story ↗</button>
    </article>
    <article className="drawer-preview-card screen-preview" data-active={active===1} style={{'--card-order':1}}>
      <button className="preview-card-tab" aria-pressed={active===1} onClick={()=>onChoose(1)}>The screens</button><div className="preview-card-heading"><span>{project.name}</span><span aria-hidden="true">↗</span></div>
      <img src={screen} alt={`${project.name} interface captured for its case study`} width="800" height="500" loading="lazy"/>
      <p className="preview-card-note">Captured from the actual interface.</p>
      <button className="preview-card-action" inert={active!==1} onClick={onOpen}>Explore the screens ↗</button>
    </article>
    <article className="drawer-preview-card destination-preview" data-active={active===2} style={{'--card-order':2}}>
      <button className="preview-card-tab" aria-pressed={active===2} onClick={()=>onChoose(2)}>{project.url?'The destination':'The concept'}</button><div className="preview-card-heading"><span>{project.name}</span><span aria-hidden="true">{project.url?'↗':'→'}</span></div>
      <span className="preview-domain">{project.domain}</span><p className="preview-card-note">{project.url?'The working product, one click away.':'A prototype of the product idea.'}</p>
      <a className="preview-card-action" inert={active!==2} href={project.url||`/work/${project.id}/`} target={project.url?'_blank':undefined} rel={project.url?'noreferrer':undefined}>{project.url?'Visit product ↗':'Explore the concept →'}</a>
    </article>
  </div>;
}
