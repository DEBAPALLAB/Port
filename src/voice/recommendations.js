import { projects } from '../projects.js';

export function voiceRecommendation(name,args={}) {
  if(name==='show_project') {
    const project=projects.find(p=>p.id===args.projectId);
    if(!project) return null;
    return {kind:'project',id:project.id,title:project.name,description:project.description,href:`/work/${project.id}/`,label:'Read the case study'};
  }
  if(name==='show_about') {
    const titles={home:'It starts in Dibrugarh.',school:'Design arrived early.',college:'Then came Nagpur.',hackathons:'The people behind the wins.',music:'A little music in between.'};
    if(!Object.hasOwn(titles,args.chapter)) return null;
    return {kind:'about',id:args.chapter,title:titles[args.chapter],description:'A chapter from Dev’s story.',href:`/about/#${args.chapter}`,label:'Read the story'};
  }
  return null;
}
