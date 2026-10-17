import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Damped spring response: a heavy drawer stops with little overshoot, while the
// lighter sheets have a longer settling tail. Normalization lands exactly at rest.
function springResponse(frequency, damping) {
  const oscillation = frequency*Math.sqrt(1-damping*damping);
  const ratio = damping/Math.sqrt(1-damping*damping);
  const response = t => 1-Math.exp(-damping*frequency*t)*(Math.cos(oscillation*t)+ratio*Math.sin(oscillation*t));
  const end = response(1);
  return t => response(t)/end;
}
const drawerSpring = springResponse(10,.88);
const paperSpring = springResponse(12,.7);

// Each mechanism owns a finite, interruptible timeline. A new gesture continues
// from its current position rather than replaying an entrance from the beginning.
export default function useDrawerMotion(root, expandedId, pinnedId, cardStates, reducedMotion) {
  const mechanisms = useRef(new Map());
  useLayoutEffect(() => {
    const present = new Set();
    root.current?.querySelectorAll('.cabinet-drawer').forEach(drawer => {
      const id = drawer.dataset.project;
      present.add(id);
      const expanded = expandedId===id;
      const active = pinnedId===id ? (cardStates[id] ?? 0) : -1;
      const signature = `${expanded}:${active}:${reducedMotion}`;
      const previous = mechanisms.current.get(id);
      if (previous?.signature===signature && previous.element===drawer) return;
      const wasMoving=previous?.timeline.isActive();
      previous?.timeline.kill();
      const face = drawer.querySelector('.drawer-face');
      const tray = drawer.querySelector('.drawer-tray');
      const side = drawer.querySelector('.drawer-side');
      const stack = drawer.querySelector('.drawer-card-stack');
      const files = drawer.querySelector('.drawer-files');
      const well = drawer.querySelector('.drawer-paper-window');
      const papers = [...drawer.querySelectorAll('.drawer-preview-card')];
      const inspector = drawer.querySelector('.drawer-inspector');
      const handle = drawer.querySelector('.drawer-handle');
      const travel = (window.innerWidth<=480?140:145) + (parseFloat(drawer.style.getPropertyValue('--drawer-clearance'))||0);
      const opening = expanded && !previous?.expanded;
      const duration = reducedMotion?0:1;
      const timeline = gsap.timeline({ defaults:{overwrite:'auto'} });
      const closedMask=`inset(0px 0px ${travel}px 0px)`;
      if (!previous && !expanded) {
        gsap.set(face,{x:0,y:0,rotationX:0,rotationY:0});
        gsap.set([tray,side],{scaleY:0});
        gsap.set(stack,{y:32});
        gsap.set(inspector,{opacity:0,x:0,y:12});
        gsap.set(files,{visibility:'hidden'});
        gsap.set(well,{clipPath:closedMask});
      } else if (expanded) {
        if(opening&&!wasMoving)gsap.set(well,{clipPath:closedMask});
        timeline.set(files,{visibility:'visible'},0);
        // The heavy front leads. The tray follows; paper has its own inertia.
        timeline.to(face,{x:-24,y:travel,rotationX:-3,rotationY:-2,transformPerspective:1100,duration:.78*duration,ease:drawerSpring},0);
        timeline.to(well,{clipPath:'inset(0px 0px 0px 0px)',duration:.78*duration,ease:drawerSpring},0);
        timeline.to([tray,side],{scaleY:1,duration:.78*duration,ease:drawerSpring},0);
        timeline.to(handle,{rotationX:16,y:2,duration:.24*duration,ease:'power2.out'},0);
        timeline.to(handle,{rotationX:0,y:0,duration:.55*duration,ease:'elastic.out(1,.65)'},.16*duration);
        timeline.to(stack,{y:0,duration:.65*duration,ease:'power3.out'},.08*duration);
        papers.forEach((paper,index) => {
          const chosen = index===active;
          const start = opening ? (.12+index*.045)*duration : 0;
          timeline.to(paper,{
            x:chosen?-3:(index-1)*7,
            y:chosen?-112-index*14:-40-index*38,
            rotation:chosen?-2.4:(index-1)*3.5,
            rotationX:chosen?0:-9,
            transformPerspective:1100,
            duration:(chosen ? .76 : .58)*duration,
            ease:chosen?paperSpring:'power3.out',
          },start);
        });
        timeline.to(inspector,{opacity:pinnedId===id?1:0,x:0,y:pinnedId===id?0:12,duration:.3*duration,ease:'power2.out'},opening&&pinnedId===id ? .24*duration : 0);
      } else {
        // Papers tuck in before the front travels home. No bounce on the heavy case.
        timeline.to(inspector,{opacity:0,y:8,duration:.12*duration,ease:'power2.in'},0);
        papers.forEach((paper,index)=>timeline.to(paper,{x:0,y:0,rotation:(index-1),rotationX:0,duration:.3*duration,ease:'power2.inOut'},index*.025*duration));
        timeline.to(stack,{y:32,duration:.36*duration,ease:'power2.inOut'},0);
        timeline.to(handle,{rotationX:0,y:0,duration:.28*duration,ease:'power2.out'},0);
        timeline.to(face,{x:0,y:0,rotationX:0,rotationY:0,duration:.56*duration,ease:'power3.inOut'},.1*duration);
        // The lower mask edge follows the front lip, not an unrelated CSS timer.
        timeline.to(well,{clipPath:closedMask,duration:.56*duration,ease:'power3.inOut'},.1*duration);
        timeline.to([tray,side],{scaleY:0,duration:.56*duration,ease:'power3.inOut'},.1*duration);
        timeline.set(files,{visibility:'hidden'},.66*duration);
      }
      mechanisms.current.set(id,{element:drawer,signature,timeline,expanded});
    });
    mechanisms.current.forEach((mechanism,id)=>{
      if (!present.has(id)) { mechanism.timeline.kill(); mechanisms.current.delete(id); }
    });
  }, [expandedId,pinnedId,cardStates,reducedMotion]);
  useLayoutEffect(()=>()=>{
    mechanisms.current.forEach(mechanism=>mechanism.timeline.kill());
    mechanisms.current.clear();
  },[]);
}
