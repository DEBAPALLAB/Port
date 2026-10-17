import React, { useEffect, useRef, useState } from 'react';
import '../styles/luman.css';
import { CasePage, CaseHero, Chapter, Prose, Statement, Split, Decision, CodeNote, Ledger, Timeline, Numbers } from '../kit.jsx';
import useReducedMotion from '../../useReducedMotion.js';

/* ---------- The desk: Classic and Godmode, rebuilt from lumanv1 ----------
   Geometry, colours and behaviour are read from the repository:
   lib/os/window-store.ts (cascade 32px from 132,72; blobs 46px bottom-right),
   lib/voice/layout.ts (tile(), the five named layouts), lib/os/use-base-layout.ts
   (the first-visit 2x2 seed), components/os/* (dock, frame) and
   components/transitions/god-mode-transition.tsx (the dust). Content is sample. */
const VW = 1200, VH = 720;
const YELLOW = '#FBBF24', MINT = '#A7F3D0', CREAM = '#FDFBF7';
const TINT = { note: '#8FB8AC', chat: '#C3A6D8', tasks: '#E0A458', calendar: '#7FA5C4', workspace: '#E8B4B8', whiteboard: '#F2C9A0', files: '#D7D3C8' };
const SIZE = { note: [720, 560], chat: [460, 620], tasks: [640, 580], calendar: [860, 600], workspace: [520, 560], whiteboard: [820, 600], files: [620, 520] };
const TITLE = { note: 'Week 32 planning', chat: '# general', tasks: 'My tasks', calendar: 'Calendar', workspace: 'Launch', whiteboard: 'Launch board', files: 'Files' };
const LAYOUTS = {
  focus: ['note'], planning: ['tasks', 'calendar', 'note'], comms: ['chat', 'tasks'],
  review: ['note', 'whiteboard', 'tasks'], everything: ['tasks', 'calendar', 'note', 'chat', 'files'],
};
const LAYOUT_WORDS = [[['focus'], 'focus'], [['planning', 'plan'], 'planning'], [['comms', 'communication'], 'comms'], [['review'], 'review'], [['everything', 'all apps'], 'everything']];
const TARGET_WORDS = [[['task', 'tasks', 'todo', 'todos'], 'tasks'], [['calendar', 'schedule', 'agenda'], 'calendar'], [['file', 'files', 'drive'], 'files'], [['whiteboard', 'board', 'canvas'], 'whiteboard'], [['chat', 'channel', 'messages', 'channels'], 'chat'], [['workspace', 'workspaces'], 'workspace'], [['note', 'notes', 'doc', 'docs'], 'note']];

function tile(count) {
  const area = { x: 116, y: 56, w: VW - 116 - 24, h: VH - 56 - 24 }, G = 12;
  if (count === 1) return [{ x: area.x, y: area.y, w: area.w, h: area.h }];
  if (count === 2) { const w = (area.w - G) / 2; return [{ x: area.x, y: area.y, w, h: area.h }, { x: area.x + w + G, y: area.y, w, h: area.h }]; }
  if (count === 3) { const w = (area.w - G) / 2, h = (area.h - G) / 2; return [{ x: area.x, y: area.y, w, h: area.h }, { x: area.x + w + G, y: area.y, w, h }, { x: area.x + w + G, y: area.y + h + G, w, h }]; }
  const cols = count <= 4 ? 2 : 3, rows = Math.ceil(count / cols), w = (area.w - G * (cols - 1)) / cols, h = (area.h - G * (rows - 1)) / rows;
  return Array.from({ length: count }, (_, i) => ({ x: area.x + (i % cols) * (w + G), y: area.y + Math.floor(i / cols) * (h + G), w, h }));
}
function cascadeRect(kind, n) {
  const [sw, sh] = SIZE[kind], off = (n % 6) * 32, left = 132 + off, top = 72 + off;
  return { x: Math.min(left, Math.max(132, VW - sw - 40)), y: Math.min(top, Math.max(72, VH - sh - 40)), w: Math.min(sw, VW - left - 40), h: Math.min(sh, VH - top - 40) };
}
// First visit: Tasks, Calendar, the org channel and the first workspace in a 2x2 grid (use-base-layout.ts).
function seed() {
  const cw = (VW - 132 - 40 - 16) / 2, ch = (VH - 72 - 40 - 16) / 2;
  return ['tasks', 'calendar', 'chat', 'workspace'].map((kind, i) => ({ kind, min: false, max: false, z: i + 1, x: 132 + (i % 2) * (cw + 16), y: 72 + Math.floor(i / 2) * (ch + 16), w: cw, h: ch }));
}
function parse(input) {
  const text = input.toLowerCase().replace(/[^a-z\s,]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  for (const [words, name] of LAYOUT_WORDS) if (words.some(w => new RegExp(`\\b${w}\\b`).test(text))) return { layout: name, kinds: LAYOUTS[name] };
  const kinds = [];
  for (const part of text.split(/\s+(?:and|then|plus|also)\s+|,\s*/)) for (const [words, kind] of TARGET_WORDS) if (words.some(w => new RegExp(`\\b${w}\\b`).test(part)) && !kinds.includes(kind)) { kinds.push(kind); break; }
  return kinds.length ? { layout: null, kinds } : null;
}

function useFit(ref) {
  const [scale, setScale] = useState(.5);
  useEffect(() => {
    const node = ref.current; if (!node) return undefined;
    const fit = () => setScale(node.clientWidth / VW);
    fit(); const ro = new ResizeObserver(fit); ro.observe(node); return () => ro.disconnect();
  }, [ref]);
  return scale;
}

const Ico = ({ d, size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const ICON = {
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  agent: <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/>,
  workspace: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>,
  whiteboard: <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></>,
  voice: <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>,
  tasks: <><path d="m4 7 2 2 4-4M4 17l2 2 4-4M14 7h6M14 17h6"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
  files: <path d="M4 4h6l2 3h8v13H4z"/>,
  note: <><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h5"/></>,
};

function WinBody({ kind }) {
  if (kind === 'tasks') return <div className="lmd-kanban">{[['Todo', ['Send board update', 'Book venue']], ['Doing', ['Review hiring plan']], ['Done', ['Draft launch goals', 'Pick a name']]].map(([col, cards]) => <div key={col}><b>{col}</b>{cards.map(c => <span key={c}>{c}</span>)}</div>)}</div>;
  if (kind === 'calendar') return <div className="lmd-cal">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => <div key={d}><b>{d}</b>{i === 0 && <span style={{ background: MINT }}>Stand-up</span>}{i === 1 && <span style={{ background: YELLOW }}>Review hiring plan</span>}{i === 3 && <span style={{ background: '#C9DAF0' }}>Send board update</span>}{i === 4 && <span style={{ background: MINT }}>Demo</span>}</div>)}</div>;
  if (kind === 'chat') return <div className="lmd-chat"><p><b>Maya</b> Moving the demo to Friday.</p><p><b>Arjun</b> Fine by me. <em>@Priya</em> can you take the board update?</p><p><b>Priya</b> On it, adding it to tasks now.</p><div className="lmd-compose">Message # general</div></div>;
  if (kind === 'workspace') return <div className="lmd-ws">{['Week 32 planning', 'Launch checklist', 'Press kit', 'Hiring plan'].map(t => <span key={t}><Ico d={ICON.note} size={14}/>{t}</span>)}</div>;
  if (kind === 'whiteboard') return <div className="lmd-board">{[['Pricing page', YELLOW, 8, 10], ['Onboarding email', MINT, 40, 22], ['Demo video', '#C9DAF0', 18, 52], ['Launch tweet', '#F5C6CB', 58, 58]].map(([t, c, x, y]) => <span key={t} style={{ background: c, left: `${x}%`, top: `${y}%` }}>{t}</span>)}</div>;
  if (kind === 'files') return <div className="lmd-files">{['press-kit.pdf', 'logo-final.svg', 'roadmap.docx', 'board-deck.pdf'].map(f => <span key={f}><Ico d={ICON.files} size={14}/>{f}</span>)}</div>;
  return <div className="lmd-note"><h5>Week 32 planning</h5><p>Ship the onboarding email before the demo on Friday. Arjun owns the deck; Priya takes the board update.</p><p>Open questions: venue for the launch, and whether pricing goes live with it.</p><p className="lmd-presence"><i/>Priya is also here</p></div>;
}

function Desk({ windows, setWindows, focused, setFocused, interactive, scale, onDock, overlay }) {
  const drag = useRef(null);
  const raise = i => { setWindows(ws => { const top = Math.max(0, ...ws.map(w => w.z)) + 1; return ws.map((w, j) => j === i ? { ...w, z: top } : w); }); setFocused(i); };
  const down = (e, i) => {
    if (!interactive || windows[i].max) return;
    raise(i);
    drag.current = { i, sx: e.clientX, sy: e.clientY, ox: windows[i].x, oy: windows[i].y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = e => {
    const d = drag.current; if (!d) return;
    const x = Math.max(-200, Math.min(VW - 80, d.ox + (e.clientX - d.sx) / scale)), y = Math.max(0, Math.min(VH - 40, d.oy + (e.clientY - d.sy) / scale));
    setWindows(ws => ws.map((w, j) => j === d.i ? { ...w, x, y, dragged: true } : w));
  };
  const up = () => { drag.current = null; };
  const act = (i, what) => setWindows(ws => ws.map((w, j) => j !== i ? w : what === 'min' ? { ...w, min: true } : what === 'max' ? { ...w, max: !w.max } : null).filter(Boolean));
  let blob = 0;
  return <div className="lmd-desk" style={{ width: VW, height: VH, transform: `scale(${scale})` }} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
    <div className="lmd-grid" aria-hidden="true"/>
    <nav className="lmd-dock" aria-label="Dock">
      {[['search', 'Search ⌘K', true], ['agent', 'Voice agent ⌘J']].map(([k, label, accent]) => <button key={k} type="button" tabIndex={interactive ? 0 : -1} aria-label={label} className={accent ? 'is-accent' : ''} onClick={() => interactive && onDock?.(k)}><Ico d={ICON[k]}/></button>)}
      <i/>
      {[['workspace', 'Workspaces'], ['chat', 'Channels'], ['whiteboard', 'Whiteboards'], ['voice', 'Voice calls'], ['tasks', 'My tasks'], ['calendar', 'Calendar'], ['files', 'Files']].map(([k, label]) => <button key={k} type="button" tabIndex={interactive ? 0 : -1} aria-label={label} onClick={() => interactive && onDock?.(k)}><Ico d={ICON[k]}/>{k === 'chat' && <em className="lmd-badge"/>}</button>)}
    </nav>
    {windows.map((w, i) => w.min ? null : <section key={w.kind} className={`lmd-win ${focused === i ? 'is-focused' : ''} ${w.dragged ? 'is-dragged' : ''}`} style={w.max ? { left: 116, top: 56, width: VW - 140, height: VH - 80, zIndex: w.z } : { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }} onPointerDown={() => interactive && focused !== i && raise(i)} aria-label={TITLE[w.kind]}>
      <header onPointerDown={e => down(e, i)} onDoubleClick={() => interactive && act(i, 'max')}>
        <span>{TITLE[w.kind]}</span>
        {['min', 'max', 'close'].map(a => <button key={a} type="button" tabIndex={interactive ? 0 : -1} aria-label={`${a === 'min' ? 'Minimise' : a === 'max' ? 'Maximise' : 'Close'} ${TITLE[w.kind]}`} onPointerDown={e => e.stopPropagation()} onClick={() => interactive && act(i, a)}>{a === 'min' ? '–' : a === 'max' ? '□' : '×'}</button>)}
      </header>
      <div className="lmd-win-body"><WinBody kind={w.kind}/></div>
    </section>)}
    {windows.map((w, i) => !w.min ? null : <button key={`b-${w.kind}`} type="button" tabIndex={interactive ? 0 : -1} className="lmd-blob" aria-label={`Restore ${TITLE[w.kind]}`} style={{ left: VW - 20 - 46, top: VH - 20 - 46 - (blob++) * 56, background: TINT[w.kind] }} onClick={() => { if (!interactive) return; setWindows(ws => { const top = Math.max(0, ...ws.map(x => x.z)) + 1; return ws.map((x, j) => j === i ? { ...x, min: false, z: top } : x); }); setFocused(i); }}><Ico d={ICON[w.kind]}/></button>)}
    {overlay}
  </div>;
}

function Classic({ scale, onGod }) {
  return <div className="lmd-classic" style={{ width: VW, height: VH, transform: `scale(${scale})` }}>
    <aside className="lmc-side">
      <b className="lmc-logo">LUMAN</b>
      {['Dashboard', 'Tasks', 'Calendar', 'Chat', 'Admin', 'Settings'].map((n, i) => <span key={n} className={i === 0 ? 'is-on' : ''}>{n}</span>)}
      <b className="lmc-head">Workspaces</b>
      {['Launch', 'Ops', 'Design'].map((n, i) => <span key={n} className="lmc-ws"><i style={{ background: [YELLOW, MINT, '#93C5FD'][i] }}/>{n}</span>)}
      <span className="lmc-note">Week 32 planning</span><span className="lmc-note">Launch checklist</span>
    </aside>
    <main className="lmc-main">
      <span className="lmc-invite">Invite: K7Q2LM</span>
      <div className="lmc-top"><div><h5>Welcome to Luman</h5><p>Manage your team, notes, and workspaces beautifully.</p></div>
        <div className="lmc-actions"><button type="button" className="lmc-god" onClick={onGod} tabIndex={onGod ? 0 : -1}><span style={{ color: YELLOW, display: 'inline-flex' }}><Ico d={ICON.agent} size={16}/></span> God Mode</button><span className="lmc-btn">New folder</span></div></div>
      <div className="lmc-bar"><span>Filter by workspace name…</span><em>Sort by</em><i>Name (A-Z)</i></div>
      <div className="lmc-cards">{[['Launch', YELLOW, '6 notes'], ['Ops', MINT, '4 notes'], ['Design', '#93C5FD', '9 notes']].map(([n, c, m]) => <div key={n} style={{ background: c }}><b>{n}</b><span>{m}</span></div>)}</div>
      <div className="lmc-lower">
        <div className="lmc-panel"><b>My Tasks</b>{['Review hiring plan', 'Send board update', 'Book venue'].map(t => <span key={t}><i/>{t}</span>)}<em>Go to board →</em></div>
        <div className="lmc-panel"><b>Upcoming Events</b>{[['Tue', 'Review hiring plan'], ['Thu', 'Send board update'], ['Fri', 'Demo']].map(([d, t]) => <span key={t}><u>{d}</u>{t}</span>)}</div>
      </div>
    </main>
  </div>;
}

// The dust: one particle per cell of a 26 x 16 grid in the product's five colours, 900ms (god-mode-transition.tsx).
function Dust({ run, onDone }) {
  const canvas = useRef(null), done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (!run) return undefined;
    const node = canvas.current, box = node.parentElement.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const width = box.width, height = box.height, ctx = node.getContext('2d');
    node.width = width * dpr; node.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const palette = [YELLOW, MINT, '#F5F1E8', '#111111', CREAM], cols = 26, rows = 16, cw = width / cols, ch = height / rows, start = performance.now(), dur = 900, ps = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) ps.push({ x: c * cw + cw / 2 + (Math.random() - .5) * cw, y: r * ch + ch / 2 + (Math.random() - .5) * ch, s: 1.5 + Math.random() * 3.5, vx: (Math.random() - .5) * 60, vy: -40 - Math.random() * 90, col: palette[Math.floor(Math.random() * 5)], born: start + (r / rows) * 120 + (c / cols) * 180 + Math.random() * 160, life: dur * .55 + Math.random() * dur * .35 });
    let raf = 0;
    const draw = now => {
      ctx.clearRect(0, 0, width, height);
      for (const p of ps) { const t = now - p.born; if (t < 0) continue; const k = Math.min(1, t / p.life); if (k >= 1) continue; const e = 1 - (1 - k) ** 3; ctx.globalAlpha = 1 - k; ctx.fillStyle = p.col; const s = p.s * (1 - k * .6) * 1.6; ctx.fillRect(p.x + p.vx * e, p.y + p.vy * e, s, s); }
      ctx.globalAlpha = 1;
      if (now - start < dur + 200) raf = requestAnimationFrame(draw); else done.current?.();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [run]);
  return <canvas ref={canvas} className="lmd-dust" aria-hidden="true"/>;
}

/* Hero: the classic dashboard, its God Mode button, the dust, the desktop. */
function ShellSwitch() {
  const reduced = useReducedMotion();
  const box = useRef(null), scale = useFit(box);
  const [mode, setMode] = useState('classic');
  const [phase, setPhase] = useState('idle');
  const [windows, setWindows] = useState(seed);
  const [focused, setFocused] = useState(0);
  const go = next => {
    if (next === mode || phase !== 'idle') return;
    if (next === 'classic' || reduced) { setMode(next); return; }
    setPhase('dust');
  };
  return <div className="lm-switch">
    <div className="lmd-frame" ref={box} style={{ height: VH * scale }} data-ui data-stage="ready">
      {mode === 'classic'
        ? <div className={phase === 'dust' ? 'lmd-dissolve' : ''}><Classic scale={scale} onGod={() => go('god')}/></div>
        : <div className="lmd-materialize"><Desk windows={windows} setWindows={setWindows} focused={focused} setFocused={setFocused} interactive scale={scale}/></div>}
      {phase === 'dust' && <Dust run onDone={() => { setMode('god'); setPhase('idle'); }}/>}
    </div>
    <div className="case-controls" role="group" aria-label="Dashboard">
      <button type="button" className="case-chip" aria-pressed={mode === 'classic'} onClick={() => go('classic')}>Classic dashboard</button>
      <button type="button" className="case-chip" aria-pressed={mode === 'god'} onClick={() => go('god')}>God Mode</button>
    </div>
  </div>;
}

/* The power demo: say a layout, watch the desk rearrange. */
const SCRIPT = 'planning';
function GodDemo() {
  const reduced = useReducedMotion();
  const host = useRef(null), box = useRef(null), scale = useFit(box);
  const [windows, setWindows] = useState(seed);
  const [focused, setFocused] = useState(0);
  const [text, setText] = useState('');
  const [said, setSaid] = useState('First visit: Tasks, Calendar, the org channel and a workspace, seeded in a 2x2 grid.');
  const [count, setCount] = useState({ actions: 0, phrases: 0 });
  const opened = useRef(4), played = useRef(false), timers = useRef([]);

  const apply = (kinds, label) => {
    const rects = tile(kinds.length);
    setWindows(ws => {
      let list = ws.map(w => ({ ...w, dragged: false }));
      let top = Math.max(0, ...list.map(w => w.z));
      kinds.forEach((kind, i) => {
        const r = rects[i] ?? cascadeRect(kind, i), at = list.findIndex(w => w.kind === kind);
        const next = { kind, x: r.x, y: r.y, w: r.w, h: r.h, min: false, max: false, z: 0 };
        if (at >= 0) list[at] = { ...list[at], ...next }; else list.push(next);
      });
      // The first thing named ends on top, as it was spoken (execute.ts).
      [...kinds].reverse().forEach(kind => { const at = list.findIndex(w => w.kind === kind); list[at] = { ...list[at], z: ++top }; });
      setFocused(list.findIndex(w => w.kind === kinds[0]));
      return list;
    });
    setCount(c => ({ actions: c.actions + kinds.length, phrases: c.phrases + 1 }));
    setSaid(label);
  };
  const run = input => {
    const parsed = parse(input);
    if (!parsed) { setSaid(`Nothing to do for “${input}”. Try a layout name, or “tasks and calendar”.`); return; }
    apply(parsed.kinds, parsed.layout ? `${parsed.layout[0].toUpperCase() + parsed.layout.slice(1)} layout: ${parsed.kinds.map(k => TITLE[k]).join(', ')}.` : `Opened and tiled ${parsed.kinds.map(k => TITLE[k]).join(', ')}.`);
  };
  const onDock = kind => {
    if (kind === 'agent') { host.current?.querySelector('input')?.focus(); return; }
    if (kind === 'search' || kind === 'voice') { setSaid(kind === 'search' ? '⌘K opens search across notes, tasks and people. Not rebuilt here.' : 'Voice calls open a room with presence and screen share. Not rebuilt here.'); return; }
    setWindows(ws => {
      const at = ws.findIndex(w => w.kind === kind), top = Math.max(0, ...ws.map(w => w.z)) + 1;
      if (at >= 0) { setFocused(at); return ws.map((w, j) => j === at ? { ...w, min: false, z: top } : w); }
      const r = cascadeRect(kind, opened.current++); setFocused(ws.length);
      return [...ws, { kind, ...r, min: false, max: false, z: top }];
    });
    setCount(c => ({ ...c, actions: c.actions + 1 }));
    setSaid(`Opened ${TITLE[kind]}, cascaded 32px from the last new window.`);
  };
  const reset = () => { timers.current.forEach(clearTimeout); setWindows(seed()); setFocused(0); setCount({ actions: 0, phrases: 0 }); opened.current = 4; setText(''); setSaid('Back to the seeded desk.'); };

  // Plays once when it first comes into view: the agent is asked for "planning".
  useEffect(() => {
    const node = host.current;
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || played.current) return;
      played.current = true; io.disconnect();
      if (reduced) { run(SCRIPT); return; }
      SCRIPT.split('').forEach((_, i) => timers.current.push(setTimeout(() => setText(SCRIPT.slice(0, i + 1)), 900 + i * 90)));
      timers.current.push(setTimeout(() => { run(SCRIPT); setText(''); }, 900 + SCRIPT.length * 90 + 400));
    }, { threshold: .45 });
    io.observe(node);
    return () => { io.disconnect(); timers.current.forEach(clearTimeout); };
  }, [reduced]);

  const onScreen = windows.filter(w => !w.min).length;
  return <div className="lm-god-demo" ref={host} data-reveal>
    <div className="lmd-frame" ref={box} style={{ height: VH * scale }} data-ui>
      <Desk windows={windows} setWindows={setWindows} focused={focused} setFocused={setFocused} interactive scale={scale} onDock={onDock}/>
    </div>
    <div className="lm-agent">
      <form className="lm-agent-bar" data-ui onSubmit={e => { e.preventDefault(); if (text.trim()) { run(text); setText(''); } }}>
        <label htmlFor="lm-agent-in"><span aria-hidden="true">⌘J</span><span className="lm-sr">Tell the agent what to set up</span></label>
        <input id="lm-agent-in" value={text} onChange={e => setText(e.target.value)} placeholder="Say a layout" autoComplete="off"/>
        <button type="submit">Run</button>
      </form>
      <div className="case-controls" role="group" aria-label="Named layouts">
        {Object.keys(LAYOUTS).map(name => <button key={name} type="button" className="case-chip" onClick={() => run(name)}>{name[0].toUpperCase() + name.slice(1)}</button>)}
        <button type="button" className="case-chip lm-reset" onClick={reset}>Reset</button>
      </div>
      <p className="lm-agent-said" aria-live="polite">{said}</p>
      <dl className="lm-agent-count">
        <div><dt>Windows on screen</dt><dd>{onScreen}</dd></div>
        <div><dt>Window moves done for you</dt><dd>{count.actions}</dd></div>
        <div><dt>Page loads</dt><dd>0</dd></div>
      </dl>
    </div>
  </div>;
}

/* The same job, counted step by step. Classic routes and Godmode actions are read from the code. */
const JOB = [
  { classic: ['Open the planning note', 'Sidebar → /workspace/launch/note/…', 1], god: ['Ask for the Planning layout', '⌘J “planning”: Tasks, Calendar and the note, tiled', 0] },
  { classic: ['Check the week', 'Sidebar → /calendar. The note leaves the screen.', 1], god: ['Check the week', 'Calendar is already on screen beside the note.', 0] },
  { classic: ['Re-read who owns what', 'Back to the note. The calendar leaves the screen.', 1], god: ['Re-read who owns what', 'The note never left.', 0] },
  { classic: ['Move two tasks', 'Sidebar → /dashboard/tasks', 1], god: ['Move two tasks', 'In the Tasks window, next to the note.', 0] },
  { classic: ['Tell the team', 'Sidebar → /messaging', 1], god: ['Tell the team', 'Channels in the dock: one window, one click.', 0] },
];
function SameJob() {
  const [step, setStep] = useState(JOB.length - 1);
  const upto = JOB.slice(0, step + 1);
  const classicLoads = upto.reduce((n, s) => n + s.classic[2], 0);
  return <div className="lm-job" data-reveal>
    <div className="lm-job-track" role="tablist" aria-label="Steps of the job">
      {JOB.map((s, i) => <button key={i} type="button" role="tab" aria-selected={i === step} onClick={() => setStep(i)}>{s.classic[0]}</button>)}
    </div>
    <div className="lm-job-cols">
      {[['Classic dashboard', 'classic', classicLoads, 1], ['God Mode', 'god', 0, step === 0 ? 3 : step >= 4 ? 4 : 3]].map(([label, key, loads, visible]) => <div key={key} className={`lm-job-col is-${key}`}>
        <h3>{label}</h3>
        <ol>{JOB.map((s, i) => <li key={i} className={i <= step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}><b>{s[key][0]}</b><span>{s[key][1]}</span></li>)}</ol>
        <dl><div><dt>Route changes</dt><dd>{loads}</dd></div><div><dt>Tools on screen at once</dt><dd>{visible}</dd></div></dl>
      </div>)}
    </div>
  </div>;
}

/* ---------- Signature: one task, three places, one rulebook ---------- */
const ROLES = [
  { id: 'founder', label: 'Founder', level: 1 },
  { id: 'admin', label: 'Admin', level: 2 },
  { id: 'intern', label: 'Intern', level: 3 },
  { id: 'outsider', label: 'Not a member', level: null },
];
const SPACES = [
  { id: 'launch', label: 'Launch', gate: null, rule: 'no gate' },
  { id: 'ops', label: 'Ops', gate: 'admin', rule: "ws.role = 'admin'" },
  { id: 'board', label: 'Board', gate: 'founder', rule: "ws.role = 'founder'" },
];
const NOTES = [
  { id: 'n1', title: 'Launch checklist', mode: 'public' },
  { id: 'n2', title: 'Hiring plan', mode: 'hierarchy', min: 2 },
  { id: 'n3', title: 'Cap table', mode: 'hierarchy', min: 1 },
  { id: 'n4', title: 'Intern handbook', mode: 'specific', roles: ['intern'] },
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function canSeeSpace(role, space) {
  if (role.level === null) return { ok: false, why: 'not an organisation member' };
  if (space.gate === 'founder' && role.id !== 'founder') return { ok: false, why: `${space.rule} and member.role is '${role.id}'` };
  if (space.gate === 'admin' && role.id === 'intern') return { ok: false, why: `${space.rule} and member.role is 'intern'` };
  return { ok: true, why: space.gate ? `${space.rule}, member.role is '${role.id}'` : 'member, no gate set' };
}
function canSeeNote(role, note) {
  if (role.level === null) return { ok: false, why: 'not a member of the organisation' };
  if (note.mode === 'public') return { ok: true, why: "mode 'public': any member" };
  if (note.mode === 'hierarchy') { const ok = role.level <= note.min; return { ok, why: `level ${role.level} <= ${note.min} is ${ok}` }; }
  const ok = note.roles.includes(role.id);
  return { ok, why: `role '${role.id}' in specific_role_ids is ${ok}` };
}

function MiniWorkspace() {
  const [role, setRole] = useState(ROLES[0]);
  const [space, setSpace] = useState('launch');
  const [day, setDay] = useState(2);
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Draft launch goals', space: 'launch', day: 0, status: 'done' },
    { id: 2, title: 'Review hiring plan', space: 'ops', day: 1, status: 'doing' },
    { id: 3, title: 'Send board update', space: 'board', day: 3, status: 'todo' },
  ]);
  const seen = useRef(4);
  const spaceById = id => SPACES.find(s => s.id === id);
  const add = event => {
    event.preventDefault();
    const text = title.trim();
    if (!text) return;
    setTasks(list => [...list, { id: seen.current++, title: text, space, day, status: 'todo', fresh: true }]);
    setTitle('');
  };
  const advance = id => setTasks(list => list.map(t => t.id === id ? { ...t, fresh: false, status: t.status === 'todo' ? 'doing' : t.status === 'doing' ? 'done' : 'todo' } : t));
  const visible = t => canSeeSpace(role, spaceById(t.space));
  return <div className="lm-ws" data-ui data-reveal>
    <div className="lm-ws-top">
      <div className="lm-ws-roles" role="radiogroup" aria-label="Signed in as">
        <span className="lm-ws-lab">Signed in as</span>
        {ROLES.map(r => <button key={r.id} type="button" role="radio" aria-checked={role.id === r.id} onClick={() => setRole(r)}>{r.label}</button>)}
      </div>
      <form className="lm-ws-add" onSubmit={add}>
        <label className="lm-sr" htmlFor="lm-new-task">New task</label>
        <input id="lm-new-task" value={title} onChange={e => setTitle(e.target.value)} placeholder="New task, then press Add" maxLength={48}/>
        <div className="lm-ws-pick" role="group" aria-label="Workspace">{SPACES.map(s => <button type="button" key={s.id} aria-pressed={space === s.id} onClick={() => setSpace(s.id)}>{s.label}</button>)}</div>
        <div className="lm-ws-pick" role="group" aria-label="Due day">{DAYS.map((d, i) => <button type="button" key={d} aria-pressed={day === i} onClick={() => setDay(i)}>{d}</button>)}</div>
        <button type="submit" className="lm-ws-go">Add task</button>
      </form>
    </div>
    <div className="lm-ws-grid">
      <section className="lm-ws-tile" aria-label="Tasks">
        <h4>Tasks</h4>
        <ul>{tasks.map(t => { const v = visible(t); return <li key={t.id} className={`${v.ok ? '' : 'is-off'} ${t.fresh ? 'is-fresh' : ''}`}>
          <button type="button" className="lm-status" data-status={t.status} onClick={() => advance(t.id)} disabled={!v.ok} aria-label={`${t.title}: ${t.status}. Change status`}>{t.status}</button>
          <span className="lm-row-main"><b>{t.title}</b><i>{spaceById(t.space).label} · {v.ok ? 'visible' : 'no rows returned'}</i></span></li>; })}</ul>
      </section>
      <section className="lm-ws-tile" aria-label="Calendar">
        <h4>Calendar</h4>
        <div className="lm-cal">{DAYS.map((d, i) => <div key={d}><span>{d}</span>
          {tasks.filter(t => t.day === i).map(t => { const v = visible(t); return <em key={t.id} className={`${v.ok ? '' : 'is-off'} ${t.fresh ? 'is-fresh' : ''}`}>{v.ok ? t.title : 'hidden'}</em>; })}</div>)}</div>
        <p className="lm-link">tasks.event_id references events.id. Same row, two views.</p>
      </section>
      <section className="lm-ws-tile" aria-label="Chat">
        <h4>Chat</h4>
        <ul className="lm-chat">{tasks.filter(t => t.fresh || t.id > 3).slice(-3).map(t => { const v = visible(t); return <li key={t.id} className={v.ok ? '' : 'is-off'}>{v.ok ? <><b>@maya</b> {t.title} is due {DAYS[t.day]}.</> : 'message not shown'}</li>; })}
          {!tasks.some(t => t.id > 3) && <li className="lm-empty">Add a task and its announcement lands here.</li>}</ul>
        <p className="lm-link">Drawn as a concept: today chat mentions people, not tasks.</p>
      </section>
      <section className="lm-ws-tile lm-ws-notes" aria-label="Notes">
        <h4>Docs</h4>
        <ul>{NOTES.map(n => { const v = canSeeNote(role, n); return <li key={n.id} className={v.ok ? '' : 'is-off'}><span className="lm-row-main"><b>{v.ok ? n.title : 'Hidden note'}</b><i>{n.mode}{n.min ? ` ≤ ${n.min}` : ''}{n.roles ? ` · ${n.roles.join(', ')}` : ''}</i></span><code>{v.why}</code></li>; })}</ul>
      </section>
    </div>
    <p className="lm-ws-foot">Level {role.level ?? 'none'}. Postgres would return no rows at all for the dimmed ones; I dim them so you can see what disappeared. Workspace owners always see their own workspace, so this assumes you are not the owner.</p>
  </div>;
}

/* ---------- Desktop sign-in sequence ---------- */
const ACTORS = ['Desktop app', 'System browser', 'Google + Supabase', 'Embedded server'];
const STEPS = [
  { from: 0, to: 1, label: 'Open sign-in', text: 'Every external URL opens in the real browser. The Electron window never shows a consent screen. The user is already signed in to Google there.' },
  { from: 1, to: 2, label: 'Consent', text: 'The browser runs Google sign-in through Supabase. The PKCE code verifier is created here, so only the browser can finish the exchange.' },
  { from: 2, to: 1, label: 'Code returns', text: '/auth/callback?desktop=1 receives the code and exchanges it for a session. It never hands the raw code to the app, because the app has no verifier.' },
  { from: 1, to: 0, label: 'luman:// link', text: '/auth/desktop forwards the session to luman://auth/callback. The operating system routes that to the registered app.' },
  { from: 0, to: 3, label: 'Install session', text: "The app loads /auth/desktop-session on 127.0.0.1 with the tokens. setSession() runs there and the cookie lands in the app's own jar." },
  { from: 3, to: 0, label: 'Dashboard', text: 'The server redirects to /dashboard with the organisation. The user never typed a password into the app.' },
];
function Sequence() {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const X = n => 90 + n * 190;
  return <div className="lm-seq" data-reveal>
    <svg viewBox="0 0 740 360" role="img" aria-label={`Step ${i + 1} of ${STEPS.length}: ${step.label}`}>
      {ACTORS.map((a, n) => <g key={a}><rect x={X(n) - 74} y="8" width="148" height="44" rx="10" className="lm-actor"/><text x={X(n)} y="36" textAnchor="middle" className="lm-actor-t">{a}</text><line x1={X(n)} y1="56" x2={X(n)} y2="350" className="lm-life"/></g>)}
      {STEPS.map((s, n) => { const y = 84 + n * 46, a = X(s.from), b = X(s.to), on = n === i, dir = b > a ? 1 : -1;
        return <g key={n} className={`lm-msg ${on ? 'on' : n < i ? 'past' : ''}`} onClick={() => setI(n)} role="button" tabIndex={0} aria-label={s.label} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setI(n)}>
          <line x1={a} y1={y} x2={b - dir * 8} y2={y} className="lm-arrow"/><path d={`M${b} ${y} l${-dir * 12} -6 v12 z`} className="lm-head"/>
          <text x={(a + b) / 2} y={y - 8} textAnchor="middle" className="lm-msg-t">{s.label}</text></g>; })}
    </svg>
    <div className="lm-seq-text" aria-live="polite"><h3>{step.label}</h3><p>{step.text}</p>
      <div className="case-controls"><button type="button" className="case-chip" onClick={() => setI(v => Math.max(0, v - 1))} disabled={i === 0}>Back</button><button type="button" className="case-chip" onClick={() => setI(v => Math.min(STEPS.length - 1, v + 1))} disabled={i === STEPS.length - 1}>Next step</button></div>
    </div>
  </div>;
}

/* ---------- Security review explorer ---------- */
const FINDINGS = [
  { id: '0.1', title: 'set-role let any signed-in user become Founder', sev: 'Critical', state: 'fixed', note: 'Found while validating the review. I deleted the route after confirming nothing called it. The folder is gone from app/api/auth.' },
  { id: '2.3', title: 'Anonymous org creation, then first registrant is Founder', sev: 'Critical', state: 'fixed', note: 'Creating an org now sets a signed ten-minute founder_claim cookie. Register only grants Founder to a holder of that claim.' },
  { id: '4', title: 'Role reorder raced a unique constraint', sev: 'High', state: 'fixed', note: 'Migration 018 defers the constraint and adds a reorder_roles() RPC that updates the batch in one statement.' },
  { id: '6', title: 'Workspace visibility filtered in JavaScript', sev: 'Medium', state: 'fixed', note: 'Migration 027 turns on RLS for workspaces with can_see_workspace(), and 028 gates tasks and events through it.' },
  { id: '2.2', title: 'No rate limiting on invite-code checks', sev: 'Critical', state: 'open', note: 'Still open as far as I can tell: a search for rate limiting only finds the AI and voice routes.' },
  { id: '2.1', title: 'Six-character invite codes', sev: 'High', state: 'open', note: 'The plan is email-scoped, hashed, single-use invitations. Not built.' },
  { id: '1', title: 'Member lookup scans every user in the project', sev: 'Critical', state: 'open', note: 'The profiles table in the plan does not appear in any migration.' },
  { id: '7', title: 'Nothing stops the last Founder leaving', sev: 'Medium', state: 'open', note: 'No guard trigger in the migrations. The review also found no working remove-member endpoint, so the risk is for later.' },
];
const FILTERS = [['all', 'All eight'], ['fixed', 'Fixed'], ['open', 'Still open']];
function Findings() {
  const [filter, setFilter] = useState('all');
  const [id, setId] = useState('0.1');
  const list = FINDINGS.filter(f => filter === 'all' || f.state === filter);
  const open = FINDINGS.find(f => f.id === id);
  return <div className="lm-find" data-reveal>
    <div className="case-controls" role="group" aria-label="Filter findings">{FILTERS.map(([k, l]) => <button key={k} type="button" className="case-chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>)}</div>
    <div className="lm-find-body">
      <ul>{list.map(f => <li key={f.id}><button type="button" aria-pressed={id === f.id} data-state={f.state} onClick={() => setId(f.id)}><span>{f.title}</span><em>{f.sev}</em></button></li>)}</ul>
      <div className="lm-find-detail" aria-live="polite"><h3>{open.title}</h3><p className="lm-find-state" data-state={open.state}>{open.state === 'fixed' ? 'Fixed' : 'Open'}</p><p>{open.note}</p></div>
    </div>
  </div>;
}


export default function Luman() {
  return <CasePage slug="luman" accent="#f2b800">
    <CaseHero name="Luman" title="A page, or a desk."
      lede="Luman is one workspace for a private team: docs, tasks, a calendar, chat and whiteboards. It has two dashboards. Classic gives each tool a page. God Mode is a desktop where all of them stay open at once."
      facts={[{ label: 'Role', value: 'Product and engineering. I built God Mode; Dhruv worked on roles and the dashboard picker' }, { label: 'Timeline', value: '11 Aug to 6 Sep 2026' }, { label: 'Stack', value: 'Next.js, Supabase, Electron, Gemini Live' }, { label: 'Status', value: 'Live at luman.lucide.in' }]}
      links={[{ href: 'https://luman.lucide.in', label: 'Open Luman' }, { href: '#power', label: 'Try God Mode' }]}
      stage={<ShellSwitch/>}
      note="Press God Mode inside the dashboard. Rebuilt from the repository; content is sample."/>

    <Chapter id="why" title="Why" heading="Work happens across tools at once" tone="paper">
      <Split>
        <Statement>A planning meeting needs the note, the calendar, the task board and the team chat at the same time. Classic could only show one of them.</Statement>
        <Prose>
          <p>The classic dashboard is a good page. It has a sidebar with Dashboard, Tasks, Calendar, Chat, Admin and Settings, and every one of those is its own route. Opening the calendar means leaving the note. Checking the note again means leaving the calendar.</p>
          <p>That is fine for one job at a time, and team work is rarely one job at a time. So on 14 August I merged a second shell: a desktop where notes, chats, tasks and calendars open as windows that sit side by side. Two days later it shipped as God Mode.</p>
        </Prose>
      </Split>
      <div className="case-gap"/>
      <ul className="lm-reasons" data-reveal>
        <li><h3>Side by side, not one after another</h3><p>Every tool is a window on one route, so nothing has to close for something else to open.</p></li>
        <li><h3>A surface an agent can arrange</h3><p>A voice agent that opens and tiles windows needs windows to tile. “One phrase for a whole working setup” is how the layout code describes it.</p></li>
        <li><h3>The phone dashboard</h3><p>Classic never got a mobile layout and never will. A phone that opens /dashboard is sent to God Mode, which has its own mobile home, dock and full-screen windows.</p></li>
        <li><h3>One load for the whole desk</h3><p>The desktop resolves the organisation once and hands it to every window, so five open windows do not cost five copies of the same requests.</p></li>
      </ul>
    </Chapter>

    <Chapter id="look" title="Look" heading="The same team, two ways to hold it">
      <Prose><p>Both dashboards read the same rows from the same database. What changes is how much of it you can hold at once.</p></Prose>
      <div className="case-gap"/>
      <div className="lm-compare" data-reveal>
        <table>
          <thead><tr><th scope="col"/><th scope="col">Classic</th><th scope="col">God Mode</th></tr></thead>
          <tbody>
            {[
              ['Navigation', 'A sidebar rail of six pages and the workspace tree', 'A dock: search, the agent, then workspaces, channels, whiteboards, calls, tasks, calendar and files'],
              ['Tools on screen', 'One page at a time', 'As many windows as you open, eleven kinds of them'],
              ['Switching', 'A route change; each page fetches its own data', 'Focus a window. The route never changes'],
              ['Arranging', 'Not applicable', 'Drag, maximise, minimise to blobs, or ask for a layout'],
              ['Search', 'Filter workspaces and notes on the dashboard', '⌘K from anywhere; ⌘D clears the desk; ⌘J talks to the agent'],
              ['Settings', 'A /settings page', 'A window, so opening it never drops you out of God Mode'],
              ['On a phone', 'Redirects to God Mode', 'Mobile home, dock and full-screen windows'],
            ].map(([row, a, b]) => <tr key={row}><th scope="row">{row}</th><td>{a}</td><td>{b}</td></tr>)}
          </tbody>
        </table>
      </div>
    </Chapter>

    <Chapter id="power" title="Power" heading="One sentence sets up the desk" tone="ink" wide>
      <Split>
        <Prose>
          <p>This is God Mode as the code lays it out: the dock on the left, windows with yellow title bars when focused, blobs bottom right when minimised. It starts the way a first visit does, with Tasks, Calendar, the team channel and a workspace in a two by two grid.</p>
          <p>Then the agent is asked for planning. Drag a title bar, minimise a window, open more from the dock, or type a layout yourself.</p>
        </Prose>
        <Prose>
          <p>The five named layouts are the real ones. Focus is one note at full size. Planning is Tasks, Calendar and the note. Comms is chat and tasks. Review is the note, the whiteboard and tasks. Everything is five windows.</p>
          <p>The tiling is the real rule too. Two windows go side by side. Three become one tall window with two stacked beside it, the first one named getting the big tile. Four make quarters. Typed phrases go through the same narrow word list the app falls back to offline.</p>
        </Prose>
      </Split>
      <div className="case-gap"/>
      <GodDemo/>
      <div className="case-gap"/>
      <Split>
        <CodeNote file="lib/voice/layout.ts" language="ts" caption="The five named layouts. A slot names a kind, not a document, so “focus” means the note you are actually working on." code={`export const LAYOUTS = {
  focus:      { label: "Focus",      items: [{ target: "note" }] },
  planning:   { label: "Planning",   items: [{ target: "tasks" }, { target: "calendar" }, { target: "note" }] },
  comms:      { label: "Comms",      items: [{ target: "chat" }, { target: "tasks" }] },
  review:     { label: "Review",     items: [{ target: "note" }, { target: "whiteboard" }, { target: "tasks" }] },
  everything: { label: "Everything", items: [{ target: "tasks" }, { target: "calendar" },
                                             { target: "note" }, { target: "chat" }, { target: "files" }] },
};`}/>
        <Prose>
          <p>The agent runs on Gemini Live and has 20 tools. Six of them arrange the desk: open, close, arrange, apply a layout, control a window and open search. The rest do the work itself: create and write notes, send a message, create and move tasks, create and cancel events.</p>
          <p>So “planning, then move the board update to Thursday and tell the team” is one spoken request and not a tour of four pages. When the model cannot be reached, a local parser still understands the plain phrases and refuses anything it would have to guess.</p>
        </Prose>
      </Split>
    </Chapter>

    <Chapter id="saved" title="Time saved" heading="The same job, counted" tone="paper">
      <Split>
        <Prose>
          <p>I have no analytics on Luman, so I will not put a number of minutes on this. What I can count is the work the interface asks of you for the same job: plan the week from last week’s note, check the calendar, move two tasks, tell the team.</p>
          <p>The number of clicks barely changes. What changes is how often the screen is taken away from you, and how much of the job you can see while you do it.</p>
        </Prose>
        <Statement>Classic asks for five route changes and shows one tool at a time. God Mode asks for none and keeps four on screen.</Statement>
      </Split>
      <div className="case-gap"/>
      <SameJob/>
    </Chapter>

    <Chapter id="team" title="Collaboration" heading="Everyone on one desk, seeing only their share" wide>
      <Split>
        <Prose>
          <p>God Mode is personal: each person arranges their own desk. What sits in the windows is shared by the whole organisation, and four things make it feel shared.</p>
        </Prose>
        <ul className="lm-reasons is-tight">
          <li><h3>Presence</h3><p>Open a note and you see who else has it open. “Priya is also here” before you type is what stops two people editing the same paragraph.</p></li>
          <li><h3>Live notes</h3><p>A note learns the moment someone else saves it. If two saves still collide, the API answers 409 rather than overwriting.</p></li>
          <li><h3>Calls in a window</h3><p>Voice rooms with screen share, on the web and in the Electron app, which needs its own source picker.</p></li>
          <li><h3>Mentions that find you</h3><p>An @mention puts a red badge on the dock’s Channels button, wherever you are on the desk.</p></li>
        </ul>
      </Split>
      <div className="case-gap"/>
      <Prose><p>All of it obeys one rulebook, enforced in Postgres and not in the screens. Add a task below, then change who you are. Every dimmed row is a row the real policies would not return, in Classic and in God Mode alike.</p></Prose>
      <div className="case-gap"/>
      <MiniWorkspace/>
      <div className="case-gap"/>
      <Split>
        <CodeNote file="lib/os/use-note-live-updates.ts" language="ts" caption="Live updates had to pass the same visibility check per subscriber. Without the second migration the channel connected and silently received nothing." code={`// Subscribes to Postgres changes on this one note. Two migrations make this
// actually deliver events, not just connect:
//   - 035_notes_realtime.sql adds \`notes\` to the supabase_realtime
//     publication (necessary, not sufficient on its own).
//   - 037_notes_replica_identity_full.sql sets REPLICA IDENTITY FULL, which
//     is what lets Realtime evaluate check_note_visibility per subscriber at
//     all — without it, a channel reports SUBSCRIBED and silently receives
//     nothing for every authenticated (non-service-role) client.`}/>
        <CodeNote file="supabase/migrations/028_close_rls_gaps.sql" language="sql" code={`  if v_visibility_mode = 'public' then
    return true;
  end if;

  if v_visibility_mode = 'hierarchy' then
    return (v_member_level is not null and v_min_level is not null and v_member_level <= v_min_level);
  end if;

  if v_visibility_mode = 'specific' then
    return (v_member_role_id is not null and v_specific_role_ids is not null and v_member_role_id = any(v_specific_role_ids));
  end if;

  return false;`} caption="The last branches of the function the notes policies call. It ends in false: anything unknown is hidden."/>
      </Split>
    </Chapter>

    <Chapter id="decisions" title="Decisions" heading="The calls behind God Mode" tone="paper">
      <Decision title="Replace the classic dashboard, or run beside it?" chosen="beside"
        problem="God Mode was a new shell for the same data. Some people think in pages, and Classic already worked."
        options={[
          { id: 'beside', label: 'A second route', body: 'God Mode lives at /dashboard2 so the two could be compared side by side while it was built. On a desktop the dashboard asks which one you want every time it opens, and the God Mode button dissolves the page into it. Phones always get God Mode.', cost: 'Two dashboards to maintain on desktop. Anything added to one has to be asked of the other.' },
          { id: 'replace', label: 'Replace /dashboard', body: 'One dashboard, one codebase path.', cost: 'Everyone who liked the page loses it on the same day, before the desk had earned it.' },
        ]}/>
      <Decision title="Where does a new window open?" chosen="cascade"
        problem="Windows open one at a time from the dock, and several at once from the agent."
        options={[
          { id: 'cascade', label: 'Cascade, tile batches', body: 'One at a time, each new window steps 32px down and right from the top-left of the free area, clear of the dock. A batch from the agent is tiled instead, by the rule above.', cost: 'Two placement systems. The tiler had to share the dock’s geometry so the edges line up.' },
          { id: 'centre', label: 'Centre every window', body: 'The obvious default.', cost: 'Each new window lands exactly on top of the last one. The code calls it the most disorienting thing a window manager can do.' },
          { id: 'tile', label: 'Always tile', body: 'Every window gets a slot.', cost: 'Opening one more window would reshuffle everything you had arranged.' },
        ]}/>
      <Decision title="Where does a minimised window go?" chosen="blobs"
        problem="Minimised windows need to stay findable without crowding the dock, which is for launching things."
        options={[
          { id: 'blobs', label: 'Blobs on the desk', body: 'Round 46px blobs stack bottom right, tinted by kind so three minimised chats are still told apart. Drag one and it stays where you put it.', cost: 'A new object to learn, and blobs can cover a window’s corner.' },
          { id: 'pills', label: 'Pills in the dock', body: 'Like a taskbar.', cost: 'A minimised note would sit in the dock as if it were an app, next to Workspaces.' },
        ]}/>
      <Decision title="How does a desktop app sign in?" chosen="browser"
        problem="The Electron build runs its server on a random loopback port, which Google and Supabase cannot whitelist."
        options={[
          { id: 'browser', label: 'Browser, then deep link', body: 'Sign-in happens in the system browser. Tokens return over luman:// and are installed by the embedded server.', cost: 'The user needs a real browser. The tokens travel in a link query string; a one-time code would be tighter.' },
          { id: 'webview', label: 'Embedded webview', body: 'Keep sign-in inside the window.', cost: 'Providers dislike it, the user is rarely signed in there, and the PKCE verifier lives with whoever started the flow.' },
        ]}/>
    </Chapter>

    <Chapter id="desktop" title="Desktop sign-in" heading="The browser signs in, the app receives" wide>
      <Sequence/>
    </Chapter>

    <Chapter id="security" title="Security review" heading="I reviewed my own app and fixed it" tone="ink">
      <Split>
        <Prose><p>I wrote a review of the organisation and employee flow, then checked every claim against the files instead of trusting it. Some claims needed correction. One finding was new, and it was the worst.</p><p>Four are fixed. Four are not. Press a finding.</p></Prose>
        <Findings/>
      </Split>
    </Chapter>

    <Chapter id="numbers" title="Numbers" heading="What the repository says">
      <Numbers items={[
        { label: 'kinds of window', value: '11', note: 'Note, chat, tasks, calendar, workspace, whiteboard, voice, settings, search, files, media.' },
        { label: 'tools the agent can call', value: '20', note: 'Six arrange the desk; the rest do the work.' },
        { label: 'named layouts', value: '5', note: 'Focus, planning, comms, review, everything.' },
        { label: 'days from merge to God Mode', value: '2', note: 'OS shell merged 14 Aug; enabled 16 Aug.' },
      ]}/>
      <div className="case-gap"/>
      <Ledger mineTitle="What is mine" othersTitle="What is Dhruv’s" mine={[
        '34 of the 40 commits in lumanv1.',
        'God Mode: the window store, the desktop, dock and blobs, the layouts and tiling, the agent’s tools and the dust transition.',
        'Presence, live note updates, calls, the desktop sign-in and the security review.',
      ]} others={[
        'Six commits, including the “Choose your dashboard” picker that offers Classic or God Mode whenever the dashboard opens.',
        'Fixes to custom role hierarchies and organisation creation, migrations 021 to 025.',
        'Deployment setup and the desktop app icon.',
      ]}/>
      <div className="case-gap"/>
      <Timeline label="Build timeline" items={[
        { date: '11 Aug', title: 'First commit', body: 'Auth, notes and workspaces on Next.js and Supabase.' },
        { date: '14 Aug', title: 'OS shell merged', body: 'The desktop shell, whiteboards and voice calls came in from a second branch, mounted at /dashboard2 beside the classic dashboard.' },
        { date: '16 Aug', title: 'God Mode', body: 'The God Mode button, the dust transition and the switch between the two dashboards.' },
        { date: '27 Aug', title: 'The picker', body: 'Dhruv added the picker that asks for Classic or God Mode each time the dashboard opens. Calls, comments and the installable web app landed the same day.' },
        { date: '29 Aug', title: 'Kanban and agent', body: 'A task board, @mentions, and a voice agent that controls tasks and the calendar.' },
        { date: '1 Sep', title: 'Gemini Live', body: 'The agent moved to Gemini with a live conversation mode, and notes got share links.' },
        { date: '6 Sep', title: 'Races closed', body: 'Double-submit races in the dock flyout and API auth gaps fixed.' },
      ]}/>
    </Chapter>

    <Chapter id="next" title="Next" heading="What I would do next" tone="paper">
      <Split>
        <Prose><ul>
          <li>Remember the choice. The picker asks on every visit and stores nothing, so a God Mode person answers the same question every morning.</li>
          <li>Measure it. Count how many people pick God Mode, which layouts get asked for, and how often people drop back to Classic.</li>
          <li>Let a team save its own layouts next to the five built in ones.</li>
          <li>Replace tokens in the desktop deep link with a single-use code the app exchanges itself.</li>
          <li>Build invitations that are email-scoped and rate limited, and stop trusting a six-character code.</li>
        </ul></Prose>
        <Statement>Keep the page for people who think in pages. Give everyone else the desk.</Statement>
      </Split>
    </Chapter>
  </CasePage>;
}
