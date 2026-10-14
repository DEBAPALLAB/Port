import React, { useMemo, useRef, useState } from 'react';
import '../styles/luman.css';
import { CasePage, CaseHero, Chapter, Prose, Statement, Split, Shot, Reel, Decision, CodeNote, Timeline, Numbers, Stage3D } from '../kit.jsx';

const heroScene = () => import('../scenes/lumanHero.js');
const chapterScene = () => import('../scenes/luman.js');

const TOOLS = {
  docs: { name: 'Docs', body: 'A Tiptap editor with slash commands, an AI assistant, Markdown and DOCX import and export, and share links with role-gated visibility.' },
  tasks: { name: 'Tasks', body: 'A kanban board with three states: todo, doing, done. The voice agent can add and move cards.' },
  calendar: { name: 'Calendar', body: 'Events, reminders and tasks live in one events table, so a task with a date is a calendar entry.' },
  chat: { name: 'Chat', body: 'Channels with threads, reactions and @mentions. A mention sets a red badge on the dock.' },
  whiteboard: { name: 'Whiteboard', body: 'Exactly one board per organisation and one per workspace, enforced by unique indexes, not by the UI.' },
};

const fallback = <svg viewBox="0 0 400 300" role="img" aria-label="Five workspace tiles in a dashboard grid"><rect x="20" y="30" width="170" height="120" fill="#f4f1ea"/><rect x="200" y="30" width="90" height="120" fill="#f4f1ea"/><rect x="300" y="30" width="80" height="120" fill="#f4f1ea"/><rect x="20" y="160" width="175" height="110" fill="#f4f1ea"/><rect x="205" y="160" width="175" height="110" fill="#f4f1ea"/></svg>;

/* ---------- Hero: the 3D workspace with a mode toggle ---------- */
function HeroStage() {
  const ref = useRef(null);
  const [mode, setMode] = useState('classic');
  const [tool, setTool] = useState(null);
  const set = next => { setMode(next); ref.current?.send('mode', next); };
  const info = TOOLS[tool];
  return <div className="lm-hero-stage">
    <Stage3D ref={ref} scene={heroScene} eager label="Five ceramic tool tiles: Docs, Tasks, Calendar, Chat and Whiteboard, arranged as a dashboard or lifted into floating windows" fallback={fallback}
      onEvent={(name, payload) => { if (name === 'hover' && payload) setTool(payload); if (name === 'pick') setTool(payload); if (name === 'mode') setMode(payload ? 'godmode' : 'classic'); }}/>
    <div className="lm-hero-controls" data-reveal>
      <div className="case-controls" role="group" aria-label="Shell">
        <button type="button" className="case-chip" aria-pressed={mode === 'classic'} onClick={() => set('classic')}>Classic dashboard</button>
        <button type="button" className="case-chip" aria-pressed={mode === 'godmode'} onClick={() => set('godmode')}>Godmode</button>
      </div>
      <p className="lm-hero-read" aria-live="polite">{info ? <><strong>{info.name}.</strong> {info.body}</> : 'Hover or tap a tile to read what it does. Drag to turn the whole workspace.'}</p>
    </div>
  </div>;
}

/* ---------- Product, shown: annotated real screenshot ---------- */
const HOT = [
  { id: 'doc', label: 'Document editor', x: 11.8, y: 17.5, w: 43.5, h: 62, text: 'The editor is Tiptap. Typing / opens commands: /table inserts a table, /schedule pins an event to the calendar from inside a document.' },
  { id: 'ai', label: 'AI assistant', x: 13.5, y: 57.5, w: 40.5, h: 19.5, text: 'An optional assistant lives under the document. It is optional on purpose: the app is a workspace first, a chatbot never.' },
  { id: 'cal', label: 'Team schedule', x: 57.8, y: 17.5, w: 30.5, h: 30, text: 'The shared calendar is one table of events, reminders and tasks. Days with something on them are marked.' },
  { id: 'items', label: 'Action items', x: 57.8, y: 49.5, w: 30.5, h: 28.5, text: 'Action items are tasks. Ticking one here changes the same row the kanban board shows.' },
];
function Hotspots() {
  const [id, setId] = useState('doc');
  const hot = HOT.find(h => h.id === id);
  return <div className="lm-hot" data-reveal>
    <figure className="lm-hot-fig">
      <div className="lm-hot-frame" data-ui>
        <img src="/cases/luman/desktop-1.jpg" alt="The live Luman home page showing a document editor with slash commands and an AI assistant beside a team schedule and action items" loading="lazy"/>
        {HOT.map(h => <button key={h.id} type="button" className="lm-hot-spot" aria-pressed={id === h.id} aria-label={h.label} style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }} onClick={() => setId(h.id)}/>)}
      </div>
      <figcaption className="case-caption">Real capture of luman.lucide.in. Press a region.</figcaption>
    </figure>
    <div className="lm-hot-text" aria-live="polite"><h3>{hot.label}</h3><p>{hot.text}</p>
      <div className="case-controls">{HOT.map(h => <button key={h.id} type="button" className="case-chip" aria-pressed={id === h.id} onClick={() => setId(h.id)}>{h.label}</button>)}</div>
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

/* ---------- Godmode chapter ---------- */
function GodmodeStage() {
  const ref = useRef(null);
  const [mode, setMode] = useState('scroll');
  const set = next => { setMode(next); ref.current?.send('mode', next); };
  return <div className="lm-god" data-reveal>
    <div className="case-stage-block is-tall"><Stage3D ref={ref} scene={chapterScene} label="The same five tiles. Scrolling lifts them out of the dashboard into floating windows with a dock and a dust burst" fallback={fallback}/></div>
    <div className="case-controls" role="group" aria-label="Godmode drive">
      {[['scroll', 'Scroll drives it'], ['classic', 'Classic'], ['godmode', 'Godmode']].map(([id, label]) => <button key={id} type="button" className="case-chip" aria-pressed={mode === id} onClick={() => set(id)}>{label}</button>)}
    </div>
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
    <CaseHero name="Luman" title="One shared workspace"
      lede="Documents, tasks, a calendar, chat and whiteboards for one private team. On the web, on the desktop, and in a second shell I call Godmode."
      facts={[{ label: 'Role', value: 'Product and engineering, solo' }, { label: 'Timeline', value: '11 Aug to 6 Sep 2026' }, { label: 'Stack', value: 'Next.js, Supabase, Electron' }, { label: 'Status', value: 'Live at luman.lucide.in' }]}
      links={[{ href: 'https://luman.lucide.in', label: 'Open Luman' }, { href: '#signature', label: 'Try the workspace' }]}
      stage={<HeroStage/>}/>

    <Chapter id="problem" title="Five tabs" heading="A team's day lives in five tabs" tone="paper">
      <Split>
        <Prose>
          <p>A small team writes in one app, tracks work in another, schedules in a third, talks in a fourth and sketches in a fifth. Every hand-off is a copy and paste.</p>
          <p>Luman puts them in one organisation. A task is a row. The calendar shows that row. A document can pin an event. Chat can mention the person who owns it.</p>
          <p>The decision that shaped everything after: <strong>who may see a row is decided in the database</strong>, not in the screens. Every tool inherits it.</p>
        </Prose>
        <Shot src="/cases/luman/desktop-0.jpg" alt="Luman landing page: Organize your ideas, coordinate your team" caption="The live landing page. Its own look is bold on purpose; this page keeps mine." address="luman.lucide.in" priority/>
      </Split>
    </Chapter>

    <Chapter id="product" title="Product" heading="Docs, calendar and tasks side by side">
      <Hotspots/>
      <div className="case-gap"/>
      <Reel label="More of the live site" shots={[
        { src: '/cases/luman/desktop-2.jpg', alt: 'Feature cards for smart shortcuts, safe team roles and easy file sharing', caption: 'Roles are a product feature, not a settings page. Founders hold admin control; members read or write.', address: 'luman.lucide.in' },
        { src: '/cases/luman/mobile-1.jpg', alt: 'Luman on a phone', frame: 'phone', caption: 'The same page on a phone.' },
      ]}/>
    </Chapter>

    <Chapter id="signature" title="One task" heading="One task, three places, one rulebook" tone="paper" wide>
      <Prose><p>Add a task below. It lands in Tasks, on the Calendar and in Chat. Then change who you are. Every dimmed row is a row the real policies would not return.</p></Prose>
      <div className="case-gap"/>
      <MiniWorkspace/>
      <div className="case-gap"/>
      <Split>
        <Prose><p>The rules are the ones in <code className="lm-inline">check_note_visibility</code> and <code className="lm-inline">can_see_workspace</code>. A note is public to members, gated by hierarchy level where a lower number is more authority, or limited to specific roles. A task or event is visible when its workspace is.</p><p>The fixed tiers are founder, admin and intern. Organisations can also define their own ladder, and the same comparison runs on levels.</p></Prose>
        <CodeNote file="supabase/migrations/028_close_rls_gaps.sql" language="sql" code={`  if v_visibility_mode = 'public' then
    return true;
  end if;

  if v_visibility_mode = 'hierarchy' then
    return (v_member_level is not null and v_min_level is not null and v_member_level <= v_min_level);
  end if;

  if v_visibility_mode = 'specific' then
    return (v_member_role_id is not null and v_specific_role_ids is not null and v_member_role_id = any(v_specific_role_ids));
  end if;

  return false;`} caption="The last three branches of the function the notes policies call. It ends in false: anything unknown is hidden."/>
      </Split>
    </Chapter>

    <Chapter id="godmode" title="Godmode" heading="Godmode turns the app into a desk" tone="ink" wide>
      <Prose>
        <p>The classic dashboard is a page. Godmode is a desktop: notes, chat, tasks and calendars open as windows you drag, maximise and minimise to a dock. A dependency-free reducer holds the window stack.</p>
        <p>Switching is a state change, so it should feel like one. The page breaks into dust: one particle per cell of a 26 by 16 grid, in the product's five colours, then the route swaps as it clears.</p>
        <p>Scroll to lift the tiles. The left rail becomes the dock. The dust is the real recipe, rebuilt in 3D.</p>
      </Prose>
      <div className="case-gap"/>
      <GodmodeStage/>
      <div className="case-gap"/>
      <CodeNote file="components/transitions/god-mode-transition.tsx" language="tsx" code={`    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const delay = (r / rows) * 120 + (c / cols) * 180 + Math.random() * 160;
        particles.push({
          x: c * cellW + cellW / 2 + (Math.random() - 0.5) * cellW,
          y: r * cellH + cellH / 2 + (Math.random() - 0.5) * cellH,
          size: 1.5 + Math.random() * 3.5,
          vx: (Math.random() - 0.5) * 60,
          vy: -40 - Math.random() * 90,
          color: palette[Math.floor(Math.random() * palette.length)],
          born: start + delay,
          life: durationMs * 0.55 + Math.random() * durationMs * 0.35,
        });
      }
    }`} caption="A canvas, not DOM nodes: four hundred elements would mean four hundred style recalculations a frame."/>
    </Chapter>

    <Chapter id="decisions" title="Decisions" heading="Three calls I would defend">
      <Decision title="Where should permissions live?" chosen="db"
        problem="Roles can be fixed (founder, admin, intern) or a custom ladder. Visibility depends on both."
        options={[
          { id: 'db', label: 'Row level security', body: 'Policies call small security-definer functions. Any client that reaches Postgres gets the same answer.', cost: 'Bugs are silent. A too-narrow policy returns zero rows, which looks like data loss. Migrations 005, 006, 009, 010 and 017 are all fixes to this layer.' },
          { id: 'app', label: 'Filter in API routes', body: 'It is what I started with for workspaces: fetch, then filter in JavaScript.', cost: 'Data has already crossed the network, and every new code path must remember the rule. My own security review flagged it, and migration 027 replaced it.' },
        ]}/>
      <Decision title="How does a desktop app sign in?" chosen="browser"
        problem="The embedded server runs on a random loopback port, which Google and Supabase cannot whitelist."
        options={[
          { id: 'browser', label: 'Browser, then deep link', body: 'Sign-in happens in the system browser. Tokens return over luman:// and are installed by the embedded server.', cost: 'The user needs a real browser. Also, the tokens travel in a link query string. A one-time code would be tighter.' },
          { id: 'webview', label: 'Embedded webview', body: 'Keep sign-in inside the window.', cost: 'Providers dislike it, the user is rarely signed in there, and the PKCE verifier lives with whoever started the flow.' },
        ]}/>
      <Decision title="What ships in the installer?" chosen="delegate"
        problem="An Electron package is an archive, not a vault. Some routes need the service-role key or paid AI keys."
        options={[
          { id: 'delegate', label: 'Keep secrets home', body: 'The desktop build never loads them. A route that needs one forwards the request to the deployed backend with the user\'s own access token.', cost: 'Those features need the network. The set of delegated routes is greppable on purpose, not hidden in middleware.' },
          { id: 'bundle', label: 'Bundle the keys', body: 'Simplest, and works offline.', cost: 'Extracting an installer takes seconds. This is the same as publishing the key.' },
        ]}/>
    </Chapter>

    <Chapter id="desktop" title="Desktop sign-in" heading="The browser signs in, the app receives" tone="paper" wide>
      <Sequence/>
      <div className="case-gap"/>
      <CodeNote file="electron/main.js" language="js" code={`  const accessToken = parsed.searchParams.get('access_token');
  const refreshToken = parsed.searchParams.get('refresh_token');
  const org = parsed.searchParams.get('org');

  if (accessToken && refreshToken) {
    const target = new URL(\`http://127.0.0.1:\${resolvedPort}/auth/desktop-session\`);
    target.searchParams.set('access_token', accessToken);
    target.searchParams.set('refresh_token', refreshToken);
    if (org) target.searchParams.set('org', org);
    mainWindow.loadURL(target.toString());`} caption="Inside handleDeepLink. A link can arrive before the window exists, so it is held and replayed once the server is up."/>
    </Chapter>

    <Chapter id="security" title="Security review" heading="I reviewed my own app and fixed it" tone="ink">
      <Split>
        <Prose><p>I wrote a review of the organisation and employee flow, then checked every claim against the files instead of trusting it. Some claims needed correction. One finding was new, and it was the worst.</p><p>Four are fixed. Four are not. Press a finding.</p></Prose>
        <Findings/>
      </Split>
    </Chapter>

    <Chapter id="numbers" title="Numbers" heading="What the repository says">
      <Numbers items={[
        { label: 'SQL migrations', value: '38', note: 'Numbered 001 to 038, plus three older unnumbered files.' },
        { label: 'API route files', value: '52', note: 'Under app/api in the Next.js app.' },
        { label: 'Commits', value: '40', note: '11 August to 6 September 2026.' },
        { label: 'E2E spec files', value: '3', note: 'Playwright. I do not have a test count.' },
      ]}/>
      <div className="case-gap"/>
      <Timeline label="Build timeline" items={[
        { date: '11 Aug', title: 'First commit', body: 'Auth, notes and workspaces on Next.js and Supabase.' },
        { date: '14 Aug', title: 'OS shell, boards, voice', body: 'The second version merged in: a desktop-style shell, whiteboards and voice calls, plus a team chat redesign.' },
        { date: '16 Aug', title: 'Godmode', body: 'The dust transition and the switch between the two dashboards.' },
        { date: '19 Aug', title: 'Security review', body: 'Validated, then the worst holes closed: set-role deleted, founder claims signed, role reorder made safe.' },
        { date: '27 Aug', title: 'Calls, comments, PWA', body: 'Voice reliability, note comments and export, and an installable web app.' },
        { date: '29 Aug', title: 'Kanban and agent', body: 'A task board, @mentions, and a voice agent that can control tasks and the calendar.' },
        { date: '6 Sep', title: 'Races closed', body: 'Double-submit races and API auth gaps fixed.' },
      ]}/>
    </Chapter>

    <Chapter id="next" title="Next" heading="What I would do next" tone="paper">
      <Split>
        <Prose><ul>
          <li>Replace tokens in the deep link with a single-use code the app exchanges itself.</li>
          <li>Build invitations that are email-scoped and rate limited, and stop trusting a six-character code.</li>
          <li>Add the last-founder guard before a remove-member endpoint exists, not after.</li>
          <li>Write down how whiteboards and chat resolve concurrent edits. I cannot point to a strategy in the schema today.</li>
        </ul></Prose>
        <Statement>Move the rule down until no screen can forget it.</Statement>
      </Split>
    </Chapter>
  </CasePage>;
}
