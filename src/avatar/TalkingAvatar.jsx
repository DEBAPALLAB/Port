import React, { useEffect, useId, useRef } from 'react';
import { Behaviour, LipSync, PARALLAX, browPath, eyeShapes, facePath, faceShadowPath, mouthShape, stubblePath } from './avatarRig.js';
import { C, EarLeft, EarRight, HairBack, HairFront, Nose, line } from './avatarArt.jsx';
import './avatar.css';

// A hand-drawn, 1980s cel-shaded portrait of Debapallab, rigged as layers at different
// depths. Turning the head slides near layers further than far ones, which reads as 3D.
// Pass a LiveVoiceSession as `session` or a ref to one as `sessionRef`; `state` is its state.
export default function TalkingAvatar({ session = null, sessionRef = null, state = 'idle', reducedMotion = false, onActivate, framed = true, label = 'Dev, drawn as a cartoon' }) {
  const id = useId().replace(/:/g, '');
  const root = useRef(null), refs = useRef({});
  const live = useRef({});
  live.current = { session, sessionRef, state, reducedMotion };
  const behaviour = useRef(null);
  const r = name => el => { refs.current[name] = el; };

  useEffect(() => {
    const el = root.current;
    const b = behaviour.current = new Behaviour();
    const lips = new LipSync();
    const n = refs.current;
    let frame = 0, last = performance.now(), hovering = false, visible = true;
    const set = (name, attr, value) => { const node = n[name]; if (node && node.__last?.[attr] !== value) { node.setAttribute(attr, value); (node.__last ||= {})[attr] = value; } };
    const layer = (name, z, rig, extraX = 0, extraY = 0) => set(name, 'transform', `translate(${(rig.yaw * PARALLAX * z + extraX).toFixed(2)} ${(rig.pitch * PARALLAX * z * 0.7 + extraY).toFixed(2)})`);

    function render(rig) {
      set('body', 'transform', `translate(${(rig.yaw * 3).toFixed(2)} ${(rig.breath * 1.3).toFixed(2)})`);
      set('shoulders', 'transform', `translate(0 ${(-16 - rig.breath * 0.8).toFixed(2)}) scale(1 ${(1 + rig.breath * 0.006).toFixed(4)})`);
      set('head', 'transform', `translate(${(rig.yaw * 4).toFixed(2)} ${(24 + rig.pitch * 5 + rig.breath * 0.9).toFixed(2)}) rotate(${(rig.roll * 57.3).toFixed(2)} 200 300)`);
      layer('hairBack', -0.45, rig, -rig.hairX * 5, -rig.hairY * 3);
      layer('earL', -0.55, rig); layer('earR', -0.55, rig);
      layer('nose', 0.45, rig);
      layer('hairFront', 0.32, rig, -rig.hairX * 9, -rig.hairY * 6);
      set('face', 'd', facePath(rig));
      set('faceShadow', 'd', faceShadowPath(rig));
      set('stubble', 'd', stubblePath(rig));
      for (const side of ['left', 'right']) {
        const e = eyeShapes(side, rig), k = side[0];
        set(`white${k}`, 'd', e.white); set(`clip${k}`, 'd', e.white);
        set(`iris${k}`, 'transform', `translate(${e.iris[0].toFixed(2)} ${e.iris[1].toFixed(2)})`);
        set(`lid${k}`, 'd', e.lidFill); set(`lower${k}`, 'd', e.lower); set(`lash${k}`, 'd', e.lash); set(`crease${k}`, 'd', e.crease);
        set(`brow${k}`, 'd', browPath(side, rig));
      }
      const m = mouthShape(rig);
      set('mouthInner', 'd', m.inner); set('mouthClip', 'd', m.inner); set('mouthLine', 'd', m.inner);
      set('teeth', 'd', m.teeth); set('tongue', 'd', m.tongue);
      set('upperLip', 'd', m.upperLip); set('lowerLip', 'd', m.lowerLip);
      set('lipShade', 'd', m.shade); set('creases', 'd', m.creases || 'M0,0');
      set('mouthLine', 'stroke-width', m.openness > 1.5 ? '3.2' : '3.6');
    }

    function tick(now) {
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 1 / 20); last = now;
      if (!visible) return;
      const { state: st, reducedMotion: reduced } = live.current;
      const s = live.current.sessionRef ? live.current.sessionRef.current : live.current.session;
      if (s && !s.closed) lips.attach(s); else if (lips.session) { lips.detach(); lips.reset(); }
      lips.update(dt);
      const userLevel = s?.levels?.().input || 0;
      render(b.update(dt, { state: st, hovering, lips, userLevel, reduced }));
      el.style.setProperty('--tilt-x', `${(b.yaw.value * 5).toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${(-b.pitch.value * 4).toFixed(2)}deg`);
    }

    function onPointer(event) {
      const box = el.getBoundingClientRect();
      const cx = box.left + box.width / 2, cy = box.top + box.height * 0.42;
      const dx = (event.clientX - cx) / Math.max(window.innerWidth * 0.45, 300), dy = (event.clientY - cy) / Math.max(window.innerHeight * 0.5, 300);
      b.pointer(Math.max(-1, Math.min(1, dx)), Math.max(-1, Math.min(1, dy)));
    }
    const enter = () => { hovering = true; b.greet(); };
    const summon = () => b.summon();
    window.addEventListener('avatar:summon', summon);
    const leave = () => { hovering = false; };
    const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; last = performance.now(); }) : null;
    io?.observe(el);
    window.addEventListener('pointermove', onPointer, { passive: true });
    el.addEventListener('pointerenter', enter); el.addEventListener('pointerleave', leave);
    render(b.update(0.016, { state: live.current.state, hovering, lips: lips.update(0.016), reduced: live.current.reducedMotion }));
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame); io?.disconnect(); lips.detach();
      window.removeEventListener('pointermove', onPointer); window.removeEventListener('avatar:summon', summon);
      el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave);
    };
  }, []);

  function activate() { behaviour.current?.poke(); onActivate?.(); }

  // The root never changes element type, so the render loop keeps its node.
  return <div ref={root} className={`talking-avatar is-${state}${onActivate ? ' is-actionable' : ''}${framed ? ' is-framed' : ' is-standing'}`} data-state={state}>
    {onActivate && <button type="button" className="talking-avatar-hit" onClick={activate} aria-label={label}/>}
    <svg viewBox={framed ? '38 56 324 371' : '-12 56 424 371'} role="img" aria-label={label} aria-hidden={onActivate ? true : undefined} focusable="false">
      <defs>
        <clipPath id={`${id}-el`}><path ref={r('clipl')}/></clipPath>
        <clipPath id={`${id}-er`}><path ref={r('clipr')}/></clipPath>
        <clipPath id={`${id}-m`}><path ref={r('mouthClip')}/></clipPath>
      </defs>
      {framed && <rect className="avatar-backdrop" x="38" y="56" width="324" height="371"/>}

      <g ref={r('body')}>
        <path d="M158,250 L156,340 Q200,358 244,340 L242,250 Z" fill={C.skin} {...line}/>
        <path d="M157,280 L183,316 Q200,324 217,316 L243,280 L243,330 Q200,354 157,330 Z" fill={C.shade}/>
        <path d="M231,322 L243,318 L244,346 L232,352 Z" fill={C.shade}/>
        <g ref={r('shoulders')} style={{ transformOrigin: '200px 460px' }}>
          <path d="M-10,480 C-6,400 50,374 122,360 C146,355 156,350 162,343 Q200,372 238,343 C244,350 254,355 278,360 C350,374 406,400 410,480 Z" fill={C.tee} {...line}/>
          <path d="M278,360 C350,374 406,400 410,480 L318,480 C318,430 304,394 274,372 Z" fill={C.teeShade}/>
          <path d="M122,362 C86,372 56,392 42,428" fill="none" stroke={C.teeHi} strokeWidth="7" strokeLinecap="round"/>
          <path d="M162,343 Q200,372 238,343" fill="none" stroke={C.teeShade} strokeWidth="10" strokeLinecap="round"/>
          <path d="M158,340 Q200,380 242,340" fill="none" {...line}/>
          <path d="M92,412 Q106,440 102,480 M308,406 Q296,436 300,480" fill="none" stroke={C.ink} strokeWidth="3" strokeLinecap="round"/>
          <path d="M-10,480 C-6,400 50,374 122,360 C146,355 156,350 162,343 M238,343 C244,350 254,355 278,360 C350,374 406,400 410,480" fill="none" {...line} strokeWidth="5"/>
        </g>
      </g>

      <g ref={r('head')}>
        <g ref={r('hairBack')}>
          <HairBack/>
        </g>
        <g ref={r('earL')}>
          <EarLeft/>
        </g>
        <g ref={r('earR')}>
          <EarRight/>
        </g>
        <path ref={r('face')} fill={C.skin} {...line}/>
        <path ref={r('faceShadow')} fill={C.shade}/>
        <path d="M147,214 Q158,226 163,244 Q152,236 145,226 Z" fill={C.shade}/>
        <path ref={r('stubble')} fill="#6b4532" opacity=".2"/>

        {['l', 'r'].map(k => <g key={k}>
          <path ref={r(`white${k}`)} fill={C.white}/>
          <g clipPath={`url(#${id}-e${k})`}>
            <g ref={r(`iris${k}`)}>
              <circle r="7.4" fill={C.iris}/>
              <circle r="3.4" fill="#0d0706"/>
              <circle cx="-2.6" cy="-2.6" r="1.9" fill="#fff"/>
              <circle cx="2.4" cy="2.2" r=".9" fill="#fff" opacity=".7"/>
            </g>
          </g>
          <path ref={r(`lid${k}`)} fill={C.skin}/>
          <path ref={r(`lower${k}`)} fill="none" stroke={C.shade} strokeWidth="2.2" strokeLinecap="round"/>
          <path ref={r(`crease${k}`)} fill="none" stroke={C.shade} strokeWidth="2.6" strokeLinecap="round"/>
          <path ref={r(`lash${k}`)} fill="none" stroke={C.ink} strokeWidth="4.6" strokeLinecap="round"/>
          <path ref={r(`brow${k}`)} fill={C.hair} stroke={C.ink} strokeWidth="1.5" strokeLinejoin="round"/>
        </g>)}

        <g ref={r('nose')}>
          <Nose/>
        </g>

        <path ref={r('lowerLip')} fill={C.lip}/>
        <path ref={r('upperLip')} fill={C.shade}/>
        <path ref={r('mouthInner')} fill={C.mouth}/>
        <g clipPath={`url(#${id}-m)`}>
          <path ref={r('tongue')} fill={C.tongue}/>
          <path ref={r('teeth')} fill={C.teeth}/>
        </g>
        <path ref={r('mouthLine')} fill="none" stroke={C.ink} strokeLinejoin="round" strokeLinecap="round"/>
        <path ref={r('lipShade')} fill="none" stroke={C.shade} strokeWidth="2.6" strokeLinecap="round"/>
        <path ref={r('creases')} fill="none" stroke={C.shade} strokeWidth="2.4" strokeLinecap="round"/>

        <g ref={r('hairFront')}>
          <HairFront/>
        </g>
      </g>
    </svg>
  </div>;
}
