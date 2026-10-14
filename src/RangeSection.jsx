import React, { useRef, useState } from 'react';
import { projects } from './projects.js';
import ProjectCabinet from './ProjectCabinet.jsx';
import ProjectFile from './ProjectFile.jsx';

const lenses = {
  product: { label:'Product', title:'Different problems.', copy:'The problem, the choices, and the product that came out of them. Every drawer opens a complete project story.' },
  frontend: { label:'Frontend', title:'Different interfaces.', copy:'Real screens, interactive models, and the engineering behind them. Open a file and explore it from the inside.' },
  distribution: { label:'Distribution', title:'Different destinations.', copy:'Follow each project from its original idea to its public home, including the tradeoffs and what comes next.' },
};
const order = ['mindspace','comparefi','luman','notaprompt','gdc','lucide','poker','culprit','superforms'];
export default function RangeSection({ reducedMotion, intent, onIntent }) {
  const [projectId, setProjectId] = useState(null), [category, setCategory] = useState('all');
  const opener = useRef(null);
  const lens = lenses[intent];
  const visible = order.map(id=>projects.find(item=>item.id===id)).filter(item=>category==='all'||(category==='products'?!['gdc','lucide','culprit'].includes(item.id):category==='websites'?['gdc','lucide','comparefi'].includes(item.id):item.id==='culprit'));
  function openFile(id, source) { opener.current = source || document.activeElement; setProjectId(id); }
  function closeFile() { setProjectId(null); requestAnimationFrame(()=>opener.current?.focus({preventScroll:true})); }
  return <section id="workflow" className="range-section project-files" aria-labelledby="range-title">
    <div className="workflow-heading"><h2 id="range-title">{lens.title}<br/>Open the files.</h2><p>{lens.copy}</p><div className="intent-switch" role="group" aria-label="Choose a perspective on all projects">{Object.entries(lenses).map(([id,item])=><button key={id} aria-pressed={intent===id} onClick={()=>onIntent(id)}>{item.label}</button>)}</div></div>
    <div className="collection-heading"><h3>Choose a file.</h3><div className="collection-filters" role="group" aria-label="Filter projects">{[['all','All work'],['products','Products'],['websites','Websites'],['concepts','Concepts']].map(([id,label])=><button key={id} aria-pressed={category===id} onClick={()=>setCategory(id)}>{label}</button>)}</div></div>
    <ProjectCabinet projects={visible} selected={projectId} onSelect={openFile} reducedMotion={reducedMotion}/>
    <div className="range-outro"><span>The next file could start with your idea.</span><a href="#connect">Place the next piece <span aria-hidden="true">↘</span></a></div>
    {projectId && <ProjectFile project={projects.find(item=>item.id===projectId)} onClose={closeFile} onProject={setProjectId} reducedMotion={reducedMotion}/>}
  </section>;
}
