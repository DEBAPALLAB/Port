import * as THREE from 'three';
import { gsap } from 'gsap';
import { createFrameLoop } from './frameLoop.js';

// Four paper solids, printed faces, demand rendering. No physics or live shadow maps.
export function createFolioScene(canvas,host,onOpen) {
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.25:1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(), camera=new THREE.OrthographicCamera(-5,5,3.8,-3.8,.1,60);
  camera.position.set(5,12,10);camera.lookAt(0,.5,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0xb6aca0,2.5));
  const light=new THREE.DirectionalLight(0xffffff,2.4);light.position.set(-4,10,6);scene.add(light);
  const folio=new THREE.Group();folio.rotation.y=-.12;scene.add(folio);
  const geometry=new THREE.BoxGeometry(5.2,.055,3.6), textures=[],surfaces=[],materials=[],sheets=[];
  let currentPrint={brief:'Help people register for a design meetup.',question:'Which session would you join?',required:true,options:['Product decisions','Frontend craft','Shipping the first version'],response:null},printKey='',targetKey='',dirtyPrint=false;
  function printedFace(index){
    const surface=surfaces[index]||document.createElement('canvas');surface.width=1040;surface.height=720;surfaces[index]=surface;const ctx=surface.getContext('2d');
    ctx.fillStyle=index===3?'#f3f0e9':'#fffefa';ctx.fillRect(0,0,1040,720);
    ctx.fillStyle='#30312e';ctx.font='500 38px "Manrope Variable", sans-serif';ctx.fillText(index===3?'Superforms':['The brief','The interface','The response'][index],78,92);
    ctx.fillStyle='#ed5939';ctx.beginPath();ctx.arc(941,79,12,0,Math.PI*2);ctx.fill();
    if(index===3){
      ctx.fillStyle='#30312e';ctx.font='500 84px "Manrope Variable", sans-serif';ctx.fillText('A brief.',78,286);ctx.fillText('A working form.',78,383);
      ctx.font='400 26px "Manrope Variable", sans-serif';ctx.fillText('Follow the decision through.',78,604);
      ctx.strokeStyle='#ed5939';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(800,565);ctx.bezierCurveTo(870,530,844,642,1040,595);ctx.stroke();
    } else {
      ctx.fillStyle='#30312e';ctx.font='500 46px "Manrope Variable", sans-serif';ctx.fillText(['What are we collecting?','Make the choice usable.','An answer, ready to use.'][index],78,207);
      ctx.font='400 30px "Manrope Variable", sans-serif';
      if(index===0){
        ctx.fillText(currentPrint.brief.slice(0,50),78,300);
        ctx.fillText('The question:',78,400);ctx.font='500 36px "Manrope Variable", sans-serif';ctx.fillText((currentPrint.question||'Your question').slice(0,43),78,457);
        ctx.font='400 27px "Manrope Variable", sans-serif';ctx.fillText(currentPrint.required?'An answer is necessary.':'An answer is optional.',78,548);
      }else if(index===1){
        ctx.fillText((currentPrint.question||'Your question').slice(0,43),78,290);
        (currentPrint.options||[]).forEach((option,i)=>{ctx.fillStyle='#efede6';ctx.fillRect(78,331+i*73,884,57);ctx.fillStyle='#30312e';ctx.fillText(option.slice(0,46),110,369+i*73);});
      }else{
        ctx.fillStyle='#efede6';ctx.fillRect(78,275,884,255);ctx.fillStyle='#30312e';ctx.fillText('questionId: focus',110,334);ctx.fillText('value:',110,396);ctx.font='500 34px "Manrope Variable", sans-serif';ctx.fillText(currentPrint.response?currentPrint.response.slice(0,42):'Try the form below.',110,456);
      }
      ctx.fillStyle='#79756e';ctx.font='400 23px "Manrope Variable", sans-serif';ctx.fillText('Portfolio interaction study',78,643);
    }
    if(textures[index]){textures[index].needsUpdate=true;return textures[index];}
    const texture=new THREE.CanvasTexture(surface);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures[index]=texture;return texture;
  }
  function paper(index){const edge=new THREE.MeshStandardMaterial({color:index===3?0xe7e0d5:0xe6e3db,roughness:1}),top=new THREE.MeshBasicMaterial({map:printedFace(index)});materials.push(edge,top);return new THREE.Mesh(geometry,[edge,edge,top,edge,edge,edge]);}
  for(let i=0;i<3;i++){const mesh=paper(i);mesh.userData.chapter=i;folio.add(mesh);sheets.push(mesh);}
  const hinge=new THREE.Group();hinge.position.set(-2.6,.3,0);folio.add(hinge);const cover=paper(3);cover.position.x=2.6;hinge.add(cover);
  cover.userData.cover=true;
  const insideTexture=textures[0].clone();insideTexture.center.set(.5,.5);insideTexture.rotation=Math.PI;textures[4]=insideTexture;
  const insideCover=new THREE.MeshBasicMaterial({map:insideTexture});materials.push(insideCover);cover.material[3]=insideCover;
  const tabGeometry=new THREE.BoxGeometry(.42,.055,.65),tabMaterial=new THREE.MeshStandardMaterial({color:0xed5939,roughness:.8});materials.push(tabMaterial);
  const tabs=sheets.map((mesh,index)=>{const tab=new THREE.Mesh(tabGeometry,tabMaterial);tab.userData.chapter=index;tab.position.set(2.74,0,1.1);mesh.add(tab);return tab;});
  const threadGeometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-4.9,.05,1.5),new THREE.Vector3(-3,.05,1.25),new THREE.Vector3(-2.7,.1,.9),new THREE.Vector3(-2.7,.1,-.9),new THREE.Vector3(-1.6,.05,-2.5),new THREE.Vector3(4.7,.05,-2.7)]),70,.012,5,false);folio.add(new THREE.Mesh(threadGeometry,tabMaterial));
  const pose={open:0,selected:0},loop=createFrameLoop({draw:()=>{if(dirtyPrint){for(let i=0;i<4;i++)printedFace(i);insideTexture.needsUpdate=true;dirtyPrint=false;}renderer.render(scene,camera);},step:()=>false});
  function paint(){camera.zoom=1-pose.open*.22;camera.updateProjectionMatrix();hinge.rotation.z=pose.open*2.5;for(let i=0;i<3;i++){const active=Math.max(0,1-Math.abs(pose.selected-i));sheets[i].position.set(pose.open*(i-1)*.16,.08+i*.065+pose.open*active*.58,pose.open*(i-1)*.35);sheets[i].rotation.y=pose.open*(i-1)*.035;tabs[i].position.z=1.08-i*.78;}folio.position.x=pose.open*.6;loop.invalidate();}
  let tween,visible=false,disposed=false;
  const visibility=()=>loop.setVisible(visible&&!document.hidden),observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visibility();},{rootMargin:'60px'});observer.observe(host);document.addEventListener('visibilitychange',visibility);
  function resize(){const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);const aspect=width/height,span=aspect<1.3?3.8/aspect:3.65;camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();loop.invalidate();}
  const resizer=new ResizeObserver(resize);resizer.observe(host);resize();paint();
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;
  function pointerDown(event){if(event.isPrimary!==false)down={x:event.clientX,y:event.clientY};}
  function pointerUp(event){if(!down||Math.hypot(event.clientX-down.x,event.clientY-down.y)>12){down=null;return;}down=null;const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObject(folio,true).find(item=>item.object.userData.cover||Number.isInteger(item.object.userData.chapter));if(hit)onOpen(hit.object.userData.cover?undefined:hit.object.userData.chapter);}
  const cancelPointer=()=>{down=null;},contextLost=event=>{event.preventDefault();tween?.kill();loop.setVisible(false);host.dataset.ready='false';};
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',cancelPointer);canvas.addEventListener('webglcontextlost',contextLost);
  return {update({opened,layer,print,reducedMotion}){if(disposed)return;const nextPrint=JSON.stringify(print);if(print&&nextPrint!==printKey){currentPrint=print;printKey=nextPrint;dirtyPrint=true;loop.invalidate();}const nextTarget=[opened,layer,reducedMotion].join(':');if(targetKey===nextTarget)return;targetKey=nextTarget;tween?.kill();host.dataset.settled='moving';tween=gsap.to(pose,{open:opened?1:0,selected:layer,duration:reducedMotion?0:.95,ease:'power3.inOut',onUpdate:paint,onComplete:()=>{paint();host.dataset.settled=opened?'open':'closed';}});},dispose(){disposed=true;tween?.kill();observer.disconnect();resizer.disconnect();loop.destroy();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',cancelPointer);canvas.removeEventListener('webglcontextlost',contextLost);geometry.dispose();tabGeometry.dispose();threadGeometry.dispose();textures.forEach(texture=>texture.dispose());materials.forEach(material=>material.dispose());renderer.dispose();}};
}
