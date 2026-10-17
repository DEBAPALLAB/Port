import React, { useEffect, useRef } from 'react';

// A real audio meter, not a pretend avatar. onAudioFrame can drive the future
// avatar's mouth/blend shapes from the exact same playback signal.
export default function VoiceSignal({sessionRef,active,reducedMotion,onAudioFrame}) {
  const canvas=useRef(null);
  useEffect(()=>{
    const element=canvas.current,context=element.getContext('2d');
    if(!context)return;
    let frame=0,phase=0,smoothed=0;
    function draw() {
      const width=element.clientWidth,height=element.clientHeight;
      const scale=Math.min(window.devicePixelRatio||1,2);
      if(element.width!==Math.round(width*scale)||element.height!==Math.round(height*scale)) {element.width=Math.round(width*scale);element.height=Math.round(height*scale);}
      context.setTransform(scale,0,0,scale,0,0);context.clearRect(0,0,width,height);
      const levels=sessionRef.current?.levels()||{input:0,output:0,speaking:false};
      const energy=Math.min(1,Math.max(levels.input,levels.output)*5);
      smoothed+=(energy-smoothed)*.22;
      phase+=reducedMotion?0:.085;
      context.lineCap='round';
      for(let band=0;band<3;band++) {
        context.beginPath();context.lineWidth=band===1?2.5:1.5;
        context.strokeStyle=band===1?'#bf4b31':band===0?'#73806b':'#a8b29e';
        for(let x=0;x<=width;x+=2) {
          const envelope=Math.sin(Math.PI*x/width)**1.6;
          const amplitude=(4+smoothed*height*.34)*envelope;
          const y=height/2+Math.sin(x/width*Math.PI*(4+band*1.1)+phase+band*.8)*amplitude*(band===1?1:.65);
          if(x===0)context.moveTo(x,y);else context.lineTo(x,y);
        }
        context.stroke();
      }
      onAudioFrame?.({amplitude:Math.min(1,levels.output*6),speaking:levels.speaking,input:levels.input});
      // Idle renders once; live frames read audio without a React render loop.
    }
    draw();
    function tick() {draw();frame=requestAnimationFrame(tick);}
    if(active)frame=requestAnimationFrame(tick);
    // The journey initially mounts this section hidden. Draw once it has a size.
    const observer=new ResizeObserver(draw);observer.observe(element);
    return()=>{observer.disconnect();cancelAnimationFrame(frame);onAudioFrame?.({amplitude:0,speaking:false,input:0});};
  },[active,reducedMotion,sessionRef,onAudioFrame]);
  return <canvas className="voice-signal" ref={canvas} aria-hidden="true"/>;
}
