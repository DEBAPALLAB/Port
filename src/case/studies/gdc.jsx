import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../styles/gdc.css';
import { CasePage, CaseHero, Chapter, Prose, Statement, Split, Shot, Reel, Decision, CodeNote, Timeline, Numbers, Stage3D } from '../kit.jsx';
import { WINGS, TASKS } from '../scenes/gdcData.js';

const heroScene = () => import('../scenes/gdc.js');
const routeScene = () => import('../scenes/gdcRoute.js');
const boardScene = () => import('../scenes/gdcBoard.js');

const wingLabel = id => WINGS.find(w => w.id === id)?.label || '';

function BuildingFallback() {
  return <svg viewBox="0 0 400 420" role="img" aria-label="A stack of five floors above an entrance" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    {[0, 1, 2, 3, 4].map(i => <rect key={i} x={40 + i * 6} y={40 + i * 56} width={320 - i * 12} height="44" rx="10" fill={i % 2 ? '#ebe8e1' : '#f6f4ef'}/>)}
    <rect x="30" y="330" width="340" height="70" rx="12" fill="#ebe8e1"/>
    <path d="M178 400v-40a22 22 0 0 1 44 0v40z" fill="#e0900f"/>
  </svg>;
}

/* ---- Audiences ---- */
const AUDIENCES = [
  { who: 'Patients', ask: 'When is the OPD open, and how do I register?', where: 'Hospital Services, Patient Registration' },
  { who: 'Applicants', ask: 'How many BDS seats are there, and what do I need?', where: 'Admissions, Academics, Downloads' },
  { who: 'Students', ask: 'Where do I report ragging? Where is the new circular?', where: 'Student Portal, Notice Board' },
  { who: 'Faculty', ask: 'Which department page is mine? Who is in my department?', where: 'Faculty and Staff, Departments' },
  { who: 'The public', ask: 'Is a tender open? What does the RTI page say?', where: 'Tenders, About Us, News and Events' },
];

function Audiences() {
  return <ul className="gdc-audiences">
    {AUDIENCES.map(a => <li key={a.who} data-reveal><h3>{a.who}</h3><p className="aud-ask">{a.ask}</p><p className="aud-where">{a.where}</p></li>)}
  </ul>;
}

/* ---- Find it in three taps ---- */
function TapsFinder() {
  const [id, setId] = useState(TASKS[0].id);
  const stageRef = useRef(null);
  const idRef = useRef(id);
  const task = TASKS.find(t => t.id === id);
  const send = useCallback(t => stageRef.current?.send('route', { wing: t.wing, page: t.page }), []);
  idRef.current = id;
  useEffect(() => { send(task); }, [task, send]);
  const onEvent = useCallback((name, payload) => {
    if (name === 'ready') send(TASKS.find(t => t.id === idRef.current));
    if (name === 'tile') { const hit = TASKS.find(t => t.wing === payload.wing && t.page === payload.page); if (hit) setId(hit.id); }
  }, [send]);
  const taps = task.steps.length - 1;
  return <div className="gdc-finder">
    <div className="finder-controls">
      <p className="finder-lead" data-reveal>Pick something a visitor really wants. The route lights up in the model and below.</p>
      <div className="finder-tasks" role="group" aria-label="Tasks" data-reveal>
        {TASKS.map(t => <button key={t.id} type="button" className="case-chip" aria-pressed={t.id === id} onClick={() => setId(t.id)}>{t.ask}</button>)}
      </div>
      <div className="finder-route" key={task.id} aria-live="polite">
        <p className="route-taps">{taps === 1 ? 'One tap' : `${taps} taps`}, from the {wingLabel(task.wing)} floor</p>
        <ol>{task.steps.map((s, i) => <li key={s} style={{ '--i': i }} aria-current={i === task.steps.length - 1 ? 'step' : undefined}>{s}</li>)}</ol>
      </div>
    </div>
    <div className="finder-stage case-stage-block is-tall" data-reveal>
      <Stage3D ref={stageRef} scene={routeScene} onEvent={onEvent} label="A ceramic model of the college website. Five floors are audiences, the plaques on each roof are pages. The chosen route lights up from the door to a page." fallback={<BuildingFallback/>}/>
    </div>
    <div className="finder-shot">
      <Shot key={task.id} src={task.shot} alt={`The live page: ${task.steps[task.steps.length - 1]}`} caption={task.note} address={task.address}/>
    </div>
    <p className="case-caption finder-foot" data-reveal>Drag the model to turn it. The amber plaques are the pages these six tasks end on; tap one. The site&rsquo;s own menu is organised by function, so the floors are my reading of who uses what, not a menu level.</p>
  </div>;
}

/* ---- Notice lab: the CMS in miniature ---- */
const TODAY = new Date();
const dayLabel = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const SEED = [
  { id: 1, title: 'Admissions Open for BDS Programme 2026-27 - Apply via State Counselling', category: 'NoticeBoard', isNew: true, enabled: true },
  { id: 2, title: 'Academic Calendar for BDS Term Session 2026-2027 released', category: 'StudentNotice', isNew: true, enabled: true },
  { id: 3, title: 'Tender Notice: Procurement of High-End Dental Operative Microscopes', category: 'NoticeBoard', isNew: true, enabled: true },
  { id: 4, title: 'Anti-Ragging Committee Notification & Safe Helpline numbers', category: 'Scrolling', isNew: true, enabled: true },
  { id: 5, title: 'Free Mega Dental Camp organized in Dibrugarh Rural Centers on World Oral Health Day', category: 'Scrolling', isNew: false, enabled: true },
];
const CATEGORIES = [
  { id: 'NoticeBoard', label: 'General notice board' },
  { id: 'StudentNotice', label: 'Student portal notice' },
  { id: 'Scrolling', label: 'Scrolling ticker' },
];
const categoryLabel = id => CATEGORIES.find(c => c.id === id).label;
// The two queries the home page really runs, applied to the in-memory list (newest first).
const view = list => ({
  ticker: list.filter(n => n.category === 'Scrolling' && n.enabled).map(n => n.title),
  board: list.filter(n => n.category !== 'Scrolling' && n.enabled).slice(0, 6).map(n => ({ title: n.title, date: dayLabel(TODAY), isNew: n.isNew })),
});
const clock = () => new Date().toLocaleTimeString('en-GB');

function NoticeLab() {
  const [notices, setNotices] = useState(SEED);
  const [audit, setAudit] = useState([]);
  const [title, setTitle] = useState('Counselling schedule for BDS 2026-27 updated');
  const [category, setCategory] = useState('NoticeBoard');
  const [isNew, setIsNew] = useState(true);
  const [trace, setTrace] = useState(null);
  const stageRef = useRef(null), latest = useRef(view(SEED)), counter = useRef(10);
  const push = (next, published) => { setNotices(next); latest.current = view(next); stageRef.current?.send('state', { ...latest.current, published }); };
  const log = (action, details) => setAudit(a => [{ id: counter.current++, time: clock(), action, section: 'Announcements & Notices', details }, ...a].slice(0, 5));
  const publish = event => {
    event.preventDefault();
    const text = title.trim(); if (!text) return;
    push([{ id: counter.current++, title: text, category, isNew, enabled: true }, ...notices], true);
    log('Create', `Published notice: "${text}"`);
    setTrace({ text, category });
    setTitle('');
  };
  const toggle = n => {
    push(notices.map(x => x.id === n.id ? { ...x, enabled: !x.enabled } : x), false);
    log('Update', `Modified notice: "${n.title}"`);
    setTrace(null);
  };
  const onEvent = useCallback(name => { if (name === 'ready') stageRef.current?.send('state', { ...latest.current, published: false }); }, []);
  const v = view(notices);
  const boardTotal = notices.filter(n => n.category !== 'Scrolling' && n.enabled).length;
  return <div className="gdc-lab">
    <div className="lab-editor" data-reveal>
      <form onSubmit={publish}>
        <label htmlFor="lab-title">Notice heading</label>
        <input id="lab-title" type="text" value={title} maxLength={110} onChange={e => setTitle(e.target.value)} placeholder="e.g. Academic timetable released" required/>
        <p className="lab-hint">Sample text. Change it, or publish it as it is.</p>
        <div className="case-controls" role="group" aria-label="Notice category">
          {CATEGORIES.map(c => <button key={c.id} type="button" className="case-chip" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>{c.label}</button>)}
        </div>
        <div className="lab-actions">
          <button type="button" className="case-chip" aria-pressed={isNew} onClick={() => setIsNew(v => !v)}>Mark as new</button>
          <button type="submit" className="case-button lab-publish">Publish notice</button>
        </div>
      </form>
      <div className="lab-trace" aria-live="polite">
        {trace
          ? <><p><strong>Saved.</strong> The model did what the real route does, in this order:</p>
            <ol><li>POST to /api/admin/announcements, after the session check</li><li>INSERT the row with today&rsquo;s date, enabled</li><li>logAudit writes who, what and where</li><li>The next request to the home page runs its two SELECTs again. Nothing was cached, so nothing needs clearing.</li></ol></>
          : <p>Publish a notice and watch the board. Switch one off and it leaves the page and the audit trail records it.</p>}
      </div>
    </div>
    <div className="lab-board case-stage-block" data-reveal>
      <Stage3D ref={stageRef} scene={boardScene} onEvent={onEvent} label="A ceramic notice board with a scrolling ticker above it. Published notices appear on it immediately." fallback={<ol className="lab-fallback">{v.board.map(b => <li key={b.title}>{b.title}</li>)}</ol>}/>
    </div>
    <div className="lab-queue" data-reveal>
      <h3>Notices in the database</h3>
      <p className="lab-count">The ticker query matches {v.ticker.length}. The board query matches {boardTotal} and shows {Math.min(6, boardTotal)}, because it ends in LIMIT 6.</p>
      <ul>
        {notices.map(n => <li key={n.id} data-off={!n.enabled}>
          <span className="q-title">{n.title}</span>
          <span className="q-cat">{categoryLabel(n.category)}</span>
          <button type="button" className="case-chip" aria-pressed={n.enabled} onClick={() => toggle(n)} aria-label={`${n.enabled ? 'Switch off' : 'Switch on'}: ${n.title}`}>{n.enabled ? 'Live' : 'Hidden'}</button>
        </li>)}
      </ul>
    </div>
    <div className="lab-audit" data-reveal>
      <h3>Audit log</h3>
      {audit.length === 0 ? <p className="lab-empty">Empty until someone acts. The dashboard shows the last ten entries.</p>
        : <ul>{audit.map(a => <li key={a.id}><span>{a.time}</span><span>editor</span><span>{a.action}</span><span>{a.details}</span></li>)}</ul>}
    </div>
    <p className="case-caption lab-foot" data-reveal>A model that runs in your browser. Nothing is sent or saved. The starter notices are the five my code seeds, the field names and the log strings are the real ones. In the real query two notices from the same day have no defined order, because the date is a day, not a time. The model puts yours first.</p>
  </div>;
}

/* ---- Two roads: read and write ---- */
const LANES = {
  read: { label: 'A visitor reads', steps: [
    { t: 'A visitor opens /tenders', s: 'There is no stored copy of the page to hand back.' },
    { t: 'The server component runs', s: 'export const revalidate = 0' },
    { t: 'It reads the database', s: "db.all('SELECT * FROM tenders ...')" },
    { t: 'It applies today’s date', s: 'last_date >= today decides what is live and what is archived.' },
  ] },
  write: { label: 'An editor writes', steps: [
    { t: 'An editor saves in /admin/home', s: 'The form sends a request to /api/admin/announcements.' },
    { t: 'The route checks the session', s: 'getSession(req) reads the signed cookie. No session, a 401.' },
    { t: 'It writes the row', s: 'INSERT INTO announcements ...' },
    { t: 'It writes the trail', s: 'logAudit(db, username, action, section, details)' },
  ] },
};

function Lanes() {
  const [lane, setLane] = useState('read');
  const data = LANES[lane];
  return <div className="gdc-lanes" data-reveal>
    <div className="case-controls" role="tablist" aria-label="Which road">
      {Object.entries(LANES).map(([key, value]) => <button key={key} type="button" role="tab" className="case-chip" aria-selected={lane === key} onClick={() => setLane(key)}>{value.label}</button>)}
    </div>
    <ol className="lane-steps" key={lane}>
      {data.steps.map((step, i) => <li key={step.t} style={{ '--i': i }}><h3>{step.t}</h3><p>{step.s}</p></li>)}
    </ol>
  </div>;
}

/* ---- What I'd do next ---- */
const NEXT = [
  { t: 'More than one editor', now: 'The first administrator is created from a seed file when the database is first made. Changing that password means editing code, and no screen adds a second editor.', next: 'An add-editor screen, a forced password change at first login, and a role check on each module. The audit table already records the username, so it would start telling people apart.' },
  { t: 'An image uploader', now: 'Photos for the gallery, faculty and department banners are URL fields. An editor has to host the picture somewhere else first.', next: 'Upload to a bucket, resize on the way in, and store the address. It is the first thing a non-developer would ask for.' },
  { t: 'Clean the HTML editors write', now: 'Page content is stored as HTML and rendered as it is. Only a signed-in administrator can write it and every write is logged, but nothing sits between a bad paste and the page.', next: 'A sanitiser on save, with an allow-list that still permits the tables, alert boxes and fact sheets the editor inserts.' },
  { t: 'Tell someone when a form arrives', now: 'Contact, appointment, grievance and alumni forms land in an inbox table. No email goes out, and the public forms have no spam guard or rate limit.', next: 'A message to the office on each submission, a hidden-field trap and a rate limit. A grievance that sits unread is the worst failure this site can have.' },
  { t: 'Back up the one file', now: 'Everything lives in one SQLite file on one machine. I wrote no backup job.', next: 'A nightly copy to storage somewhere else, and one restore tested before it is needed.' },
  { t: 'Fix the stray characters', now: 'On the live pages the OPD hours are wrapped in literal asterisks, and the admissions intro shows a backslash in “Assam\\\'s”. Text is stored plain and shown raw.', next: 'Render the markers, or strip them on save. It is small, and it is on the page a patient reads.' },
  { t: 'Give every page its own title', now: 'Only the root layout sets metadata, so a department page and a tender share the site title in search results.', next: 'A generateMetadata for each route, filled from the same rows the page reads.' },
  { t: 'Order notices on the same day', now: 'A notice’s date is a day, not a time. Two published on one day have no defined order on the board.', next: 'Sort by date, then by id, or store the timestamp.' },
];

function NextUp() {
  const [open, setOpen] = useState(0);
  const item = NEXT[open];
  return <div className="gdc-next" data-reveal>
    <div className="next-list" role="tablist" aria-label="What I would do next" aria-orientation="vertical">
      {NEXT.map((n, i) => <button key={n.t} type="button" role="tab" aria-selected={open === i} onClick={() => setOpen(i)}>{n.t}</button>)}
    </div>
    <div className="next-detail" role="tabpanel" key={open}>
      <h3>{item.t}</h3>
      <p><strong>What is true today.</strong> {item.now}</p>
      <p><strong>What I would do.</strong> {item.next}</p>
    </div>
  </div>;
}

/* ---- Page ---- */
const TENDERS_CODE = `export const revalidate = 0;

export default async function TendersPage() {
  const db = await getDb();

  // 1. Fetch all Tenders from SQLite
  const tenders = await db.all('SELECT * FROM tenders ORDER BY published_date DESC');

  const today = new Date().toISOString().split('T')[0];

  // 2. Classify Tenders into Active and Archived on-load
  // Tenders auto-archive when today's date exceeds the "last_date"
  const activeTenders = tenders.filter(t => t.last_date >= today && t.status === 'Active');
  const archivedTenders = tenders.filter(t => t.last_date < today || t.status === 'Archived');`;

const AUDIT_CODE = `// Generic helper to log audit trails
async function logAudit(db: any, username: string, action: string, section: string, details: string) {
  await db.run(
    'INSERT INTO audit_logs (timestamp, admin_username, action, section, details) VALUES (?, ?, ?, ?, ?)',
    [new Date().toISOString(), username, action, section, details]
  );
}`;

const QUERY_CODE = `const scrollingNotices = await db.all(
  "SELECT * FROM announcements WHERE category = 'Scrolling' AND enabled = 1 ORDER BY date DESC"
);`;

export default function GdcStudy() {
  const [wing, setWing] = useState(null);
  const onHero = useCallback((name, payload) => { if (name === 'wing') setWing(payload); }, []);
  const wingData = wing && WINGS.find(w => w.id === wing.wing);
  const note = wingData
    ? (wingData.pages.length ? `${wingData.label}: ${wingData.pages.map(p => p.title).join(', ')}.` : 'The front door: gdcdibrugarh.in.')
    : 'Drag to turn it. Tap a floor or a plaque.';

  return <CasePage slug="gdc" accent="#14274e">
    <CaseHero
      name="GDC Dibrugarh"
      title="A clear way into an institution."
      lede="The portal for Government Dental College, Dibrugarh: five kinds of visitor, nine departments, and a CMS so staff can keep it current without me."
      facts={[{ label: 'Role', value: 'Product, design and engineering' }, { label: 'Repo started', value: '27 May 2026' }, { label: 'Stack', value: 'Next.js 14, SQLite, Tailwind' }, { label: 'Status', value: 'Live at gdcdibrugarh.in' }]}
      links={[{ href: 'https://gdcdibrugarh.in', label: 'Visit the live site' }, { href: '#taps', label: 'Find it in three taps' }]}
      stage={<Stage3D scene={heroScene} eager onEvent={onHero} label="A ceramic model of the college. Five floors, one for each audience, pull apart to show the pages on their roofs." fallback={<BuildingFallback/>}/>}
      note={note}
    />

    <Chapter id="audiences" title="Who comes" heading="Five kinds of visitor, one door" tone="ink">
      <Audiences/>
      <Split reverse>
        <Prose>
          <p>A dental college site is read in a hurry. A patient wants the hours before the bus. An applicant is counting seats against a rank. A student wants one phone number and no menus.</p>
          <p>The top bar has thirteen entries and the home page puts six direct tiles under the hero. I kept the menu organised by what the college does, and let the home page do the sorting by who is asking.</p>
        </Prose>
        <Shot src="/cases/gdc/desktop-0.jpg" alt="The live home page: a hero about the tertiary dental hospital with a View OPD timings button, and six counters." caption="The live home page. The hero button goes straight to the OPD page; the counters are edited in the CMS." address="gdcdibrugarh.in" priority/>
      </Split>
    </Chapter>

    <Chapter id="taps" title="Three taps" heading="Every task is within three taps" tone="paper" wide>
      <TapsFinder/>
    </Chapter>

    <Chapter id="product" title="The home page" heading="The home page does the sorting" tone="plain">
      <Prose>
        <p>The hero is a slider whose slides, text and buttons are rows in a table. Under it sit the counters, the principal&rsquo;s note, six direct portals and the nine departments.</p>
        <p>Two panels in these captures are empty: the news list and the notice board. That is the live site&rsquo;s content on the day I captured it, and the page says so plainly instead of hiding the panel.</p>
      </Prose>
      <div className="case-gap"/>
      <Reel label="Screens of the live site" shots={[
        { src: '/cases/gdc/desktop-0.jpg', alt: 'Home hero with a View OPD timings button and six counters: 2018, 63, 102, 9, 150 plus and 220', caption: 'The hero and six counters: established 2018, 63 BDS seats, 102 dental chairs, 9 departments, 150+ alumni, 220 hostel places.', address: 'gdcdibrugarh.in' },
        { src: '/cases/gdc/desktop-1.jpg', alt: 'The principal’s note and six direct portal tiles', caption: 'Six direct portals: admissions, patient registration, tenders, anti-ragging, faculty, RTI.', address: 'gdcdibrugarh.in' },
        { src: '/cases/gdc/desktop-2.jpg', alt: 'Cards for the clinical departments', caption: 'Nine departments, each card opening the same template.', address: 'gdcdibrugarh.in' },
        { src: '/cases/gdc/desktop-3.jpg', alt: 'Empty news list and notice board, then accreditation names', caption: 'News and the notice board, both empty on capture day.', address: 'gdcdibrugarh.in' },
        { src: '/cases/gdc/mobile-0.jpg', alt: 'Mobile home page with the hero slider', caption: 'On a phone the hero stays first and the counters become two columns.', frame: 'phone' },
        { src: '/cases/gdc/mobile-3.jpg', alt: 'Mobile list of department cards', caption: 'Departments stack into one column.', frame: 'phone' },
      ]}/>
    </Chapter>

    <Chapter id="cms" title="The CMS" heading="A saved notice is live at once" tone="paper" wide>
      <Prose>
        <p>The college has to publish dates that matter: admission deadlines, closures, tenders. So every public page reads the database on each request. An editor saves, and the next visitor sees it. There is no deploy and no cache to flush.</p>
        <p>Every write goes through one route that also writes to an audit table. That table is what an RTI request or an audit would ask for.</p>
      </Prose>
      <div className="case-gap"/>
      <NoticeLab/>
    </Chapter>

    <Chapter id="decisions" title="Decisions" heading="Three bets, and what each cost" tone="plain">
      <Decision title="Read the database on every request" chosen="fresh" problem="A tender that has closed must not look open. A deadline moved this morning must not show last night&rsquo;s date." options={[
        { id: 'fresh', label: 'No cache, every time', body: 'Every page sets revalidate to 0 and reads SQLite when asked. What an editor saves is what the next visitor sees, and the tender page can work out active or archived from today’s date with no job to run.', cost: 'Every view touches the disk. I have not measured it, and I would not call it settled for heavy traffic.' },
        { id: 'isr', label: 'Cache for a minute', body: 'Next can serve a stored page and refresh it on a timer. It is cheaper and faster.', cost: 'For a minute, an editor and a visitor see different pages. For a college publishing deadlines I did not want to explain that.' },
        { id: 'static', label: 'Rebuild on every edit', body: 'Build static pages and redeploy after each change.', cost: 'It puts a developer between the office and the website. That is the problem the CMS exists to remove.' },
      ]}/>
      <Decision title="One route file for nine departments" chosen="param" problem="Nine clinical departments each need a head of department, services, infrastructure, research and a contact." options={[
        { id: 'param', label: 'One parameterised route', body: 'A single departments/[deptId] page reads one row from the departments table. The editor changes the text, the head of department and the banner for each, and a tenth department would be a new row.', cost: 'If one department ever needs a different layout, the shared file collects exceptions. Splitting it later is easy.' },
        { id: 'files', label: 'Nine page files', body: 'Hand-written pages, one per department.', cost: 'Nine copies to keep in step, and every edit becomes a code change.' },
        { id: 'free', label: 'Free-form pages', body: 'Let editors build each page from blank HTML.', cost: 'Nine pages that look nine ways. The head of department card, in the same place on each, is a kind of wayfinding.' },
      ]}/>
      <Decision title="Give editors blocks, not a blank box" chosen="blocks" problem="Staff update fee tables, policy notices and warnings. They are not HTML authors." options={[
        { id: 'blocks', label: 'Insert-a-block buttons', body: 'The settings editor has a visual mode and a raw mode, with buttons that insert a table, a green box, a red alert and a fact sheet. The result is styled the same way every time.', cost: 'The content is stored as HTML and shown as it is. I did not add a sanitiser, and that is on the list below.' },
        { id: 'fields', label: 'Structured fields', body: 'A form field for every piece of every page.', cost: 'Safe, but a policy page or a fee schedule does not fit into fields without a long argument with each one.' },
      ]}/>
    </Chapter>

    <Chapter id="hood" title="Under the hood" heading="Reads and writes take two roads" tone="paper">
      <Lanes/>
      <div className="case-gap"/>
      <Split>
        <CodeNote file="src/app/tenders/page.tsx" language="tsx" code={TENDERS_CODE} caption="There is no archive flag to forget. Whether a tender is live is a date comparison made on every request."/>
        <div className="hood-codes">
          <CodeNote file="src/app/api/admin/[...module]/route.ts" language="ts" code={AUDIT_CODE} caption="Every create, update and delete in the CMS calls this before it answers."/>
          <CodeNote file="src/app/page.tsx" language="tsx" code={QUERY_CODE} caption="The ticker query. The notice board runs a second one with LIMIT 6."/>
        </div>
      </Split>
      <div className="case-gap"/>
      <Prose>
        <p>Thirteen tables live in one SQLite file: users, settings, departments, faculty, news and events, announcements, hero slides, stats, tenders, downloads, gallery, submissions and audit logs. Login uses bcrypt for the password and a signed cookie for the session. I kept it small enough for one person to run, on purpose.</p>
      </Prose>
    </Chapter>

    <Chapter id="numbers" title="Numbers" heading="Two days from scaffold to commit" tone="ink">
      <Numbers items={[
        { label: 'tables in one SQLite file', value: '13' },
        { label: 'departments, one route', value: '9' },
        { label: 'kinds of notice', value: '3', note: 'Scrolling, student, notice board.' },
        { label: 'commits in the repo', value: '3' },
      ]}/>
      <div className="case-gap"/>
      <Timeline label="Project timeline" items={[
        { date: '27 May 2026', title: 'Scaffold', body: 'A create-next-app project, nothing else.' },
        { date: '29 May 2026', title: 'First commit', body: 'The public pages, the admin, the schema and the seed data arrive together. A second commit follows in the same minute.' },
        { date: 'Since', title: 'In use', body: 'The live site shows 63 BDS seats and OPD hours that my seed file never had (it says 50 seats and 8:00 AM to 2:00 PM). Those edits did not come from me, which is the point of the CMS. The history is three commits, so these dates show when the repo began, not how long the thinking took.' },
      ]}/>
    </Chapter>

    <Chapter id="next" title="What I'd do next" heading="What I'd fix before it grows" tone="plain">
      <Prose><p>This was built fast, for one college, and it shows in places. Here is the list in the order I would take it, and what is true today.</p></Prose>
      <div className="case-gap"/>
      <NextUp/>
    </Chapter>
  </CasePage>;
}
