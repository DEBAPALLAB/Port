import React from 'react';

// These are deliberately drawn product symbols, not invented screenshots.
export default function ProjectArtwork({ project, explored = false }) {
  const id = `art-${project.id}`;
  const coral = '#ed5939';
  return <svg className="project-art" viewBox="0 0 760 440" role="img" data-shape={project.shape} data-explored={explored} aria-label={`${project.name}: a hand-drawn visual study`}>
    <defs>
      <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="220%"><feDropShadow dx="0" dy="17" stdDeviation="14" floodColor="#827466" floodOpacity=".12" /></filter>
      <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#f0eeeb"/></linearGradient>
      <linearGradient id={`${id}-coral`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f97759"/><stop offset="1" stopColor={coral}/></linearGradient>
    </defs>
    <g className="art-assembly">{project.shape === 'workspace' ? <g filter={`url(#${id}-shadow)`}>
      <g transform="translate(385 242) rotate(-11)">
        <rect x="-151" y="-101" width="302" height="202" rx="16" fill="#e9e6e1" stroke="#d7d3cd" transform="translate(16 20)"/>
        <rect x="-151" y="-101" width="302" height="202" rx="16" fill={`url(#${id}-paper)`} stroke="#dedad5"/>
        <path d="M-80 -43v84h43V15h39V-43z" fill="#373a35"/>
        <path d="M11 -43v58h58V-43z" fill={coral}/>
        <path d="M-80 41v17h43V41zM-37 15v17H2V15z" fill="#b9bbb4"/>
        <path d="M11 15v17h58V15z" fill="#bd4128"/>
        <circle cx="113" cy="-64" r="5" fill="#d2cec7"/>
      </g>
      <g transform="translate(194 154) rotate(-20)"><rect x="-59" y="-48" width="118" height="96" rx="10" fill="#fff" stroke="#dfdbd5"/><path d="M-27 -17h54M-27 -3h36M-27 11h46" stroke="#949089" strokeWidth="3" strokeLinecap="round"/></g>
      <g transform="translate(573 142) rotate(13)"><rect x="-47" y="-58" width="94" height="116" rx="10" fill="#fff" stroke="#dfdbd5"/><path d="m-20 -5 14 14 27-30" fill="none" stroke={coral} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/></g>
      <g transform="translate(550 331) rotate(9)"><rect x="-63" y="-42" width="126" height="84" rx="10" fill="#fff" stroke="#dfdbd5"/><g fill="#b4b0a8"><circle cx="-25" cy="-9" r="5"/><circle cx="0" cy="-9" r="5"/><circle cx="25" cy="-9" r="5"/><circle cx="-25" cy="15" r="5"/><circle cx="0" cy="15" r="5"/><circle cx="25" cy="15" r="5"/></g><circle cx="0" cy="-9" r="5" fill={coral}/></g>
    </g> : project.shape === 'forms' ? <g filter={`url(#${id}-shadow)`} transform="translate(382 215) rotate(-10)">
      <rect x="-132" y="-140" width="264" height="300" rx="12" fill="#e5e0da" transform="translate(18 16) rotate(5)"/>
      <rect x="-132" y="-140" width="264" height="300" rx="12" fill={`url(#${id}-paper)`} stroke="#d9d5ce"/>
      <path d="M-76-70h102M-76-48h152" stroke="#393a36" strokeWidth="8" strokeLinecap="round"/>
      <rect x="-80" y="-7" width="24" height="24" rx="5" fill={coral}/><path d="m-74 4 5 5 9-11" stroke="#fff" strokeWidth="3" fill="none"/>
      <path d="M-37 5h98M-37 50h77M-37 95h108" stroke="#b4b0aa" strokeWidth="6" strokeLinecap="round"/>
      <rect x="-80" y="38" width="24" height="24" rx="5" fill="none" stroke="#c6c1b9" strokeWidth="2"/>
      <rect x="-80" y="83" width="24" height="24" rx="5" fill="none" stroke="#c6c1b9" strokeWidth="2"/>
    </g> : project.shape === 'voice' ? <g filter={`url(#${id}-shadow)`}>
      <ellipse cx="380" cy="287" rx="157" ry="62" fill="#e5e3df"/>
      <ellipse cx="380" cy="270" rx="157" ry="62" fill="#faf9f7" stroke="#dcd8d2"/>
      <g transform="translate(380 210)">{[28,53,85,125,158,125,85,53,28].map((height, i) => <rect key={i} x={(i-4)*25-7} y={-height/2} width="14" height={height} rx="7" fill={i === 4 ? coral : '#ccc7bf'}/>)}</g>
    </g> : project.shape === 'poker' ? <g filter={`url(#${id}-shadow)`}>
      {[0,1,2].map(i => <g key={i} transform={`translate(${294+i*77} ${249-i*30})`}><ellipse cy="18" rx="62" ry="33" fill={i === 1 ? '#be442c' : '#c5c0b7'}/><rect x="-62" width="124" height="18" fill={i === 1 ? '#be442c' : '#c5c0b7'}/><ellipse rx="62" ry="33" fill={i === 1 ? coral : '#f3f0ea'} stroke={i === 1 ? '#d04a30' : '#d6d0c7'} strokeWidth="2"/><ellipse rx="44" ry="23" fill="none" stroke={i === 1 ? '#fff' : '#888077'} strokeWidth="2" strokeDasharray="8 6"/></g>)}
    </g> : project.shape === 'network' ? <g>
      <g stroke="#d2ccc3" strokeWidth="2">{[[200,230,310,130],[310,130,420,190],[420,190,555,120],[420,190,540,300],[310,130,320,330],[320,330,540,300],[200,230,320,330]].map((v,i) => <path key={i} d={`M${v[0]} ${v[1]}L${v[2]} ${v[3]}`}/>)}</g>
      <g filter={`url(#${id}-shadow)`}>{[[200,230],[310,130],[420,190],[555,120],[540,300],[320,330]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r={i===2?36:24} fill={i===2?coral:'#f9f7f3'} stroke={i===2?'#d94c2f':'#d4cec4'} strokeWidth="2"/>)}</g>
    </g> : project.shape === 'compare' ? <g filter={`url(#${id}-shadow)`} transform="translate(380 215) rotate(-8)">
      <path d="M-128 49v-109h67v109zM-33 49v-174h67V49zM62 49v-138h67V49z" fill="#f1eee8" stroke="#d5cfc5" strokeWidth="2"/>
      <path d="M-128 49v39h67V49zM-33 49v39h67V49zM62 49v39h67V49z" fill="#d3cec4"/>
      <path d="M-33 49v-174h67V49z" fill={coral}/><path d="M-33 49v39h67V49z" fill="#bc432c"/>
    </g> : project.shape === 'campus' ? <g filter={`url(#${id}-shadow)`} transform="translate(380 230)">
      <path d="M-150-44 0-118 150-44 0 30z" fill="#f8f6f2" stroke="#d4cec4" strokeWidth="2"/><path d="M-150-44V-26L0 48V30z" fill="#ded8ce"/><path d="M0 30v18l150-74v-18z" fill="#eae6de"/>
      <path d="M-99-7v108M-34 26v108M34 26v108M99-7v108" stroke="#d4cec4" strokeWidth="23"/>
      <path d="m-130 108 130 65 130-65" fill="none" stroke={coral} strokeWidth="10"/>
    </g> : project.shape === 'culprit' ? <g filter={`url(#${id}-shadow)`} transform="translate(380 220) rotate(-13)">
      <circle cx="-25" cy="-20" r="84" fill="#f5f2ed" stroke="#d4cec4" strokeWidth="13"/><path d="m37 46 85 84" stroke={coral} strokeWidth="27" strokeLinecap="round"/><path d="m-53-42-22 22 22 22M3-42l22 22-22 22" stroke="#777168" strokeWidth="5" fill="none" strokeLinecap="round"/>
    </g> : <g filter={`url(#${id}-shadow)`} transform="translate(380 225) rotate(-9)"><path d="M-99-120h66V54h132v66H-99z" fill={`url(#${id}-coral)`}/><path d="M-99 120v19H99v-19z" fill="#bd422b"/><path d="M99 54v66l18-12V43z" fill="#d8492c"/></g>}
    </g>
  </svg>;
}
