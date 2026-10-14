import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../styles/mindspace.css';
import useReducedMotion from '../../useReducedMotion.js';
import { CasePage, CaseHero, Chapter, Prose, Statement, Split, Shot, Reel, Decision, CodeNote, Ledger, Timeline, Numbers, Stage3D } from '../kit.jsx';

const scene = () => import('../scenes/mindspace-voice.js');
const IMG = '/cases/mindspace/';

const Fallback = () => <svg viewBox="0 0 400 300" role="presentation" aria-hidden="true"><ellipse cx="200" cy="190" rx="170" ry="62" fill="#ebe8e1"/><ellipse cx="200" cy="178" rx="132" ry="46" fill="#f6f4ef"/><ellipse cx="200" cy="170" rx="92" ry="30" fill="#dfe8e0"/><circle cx="200" cy="130" r="52" fill="#fff"/><circle cx="200" cy="130" r="52" fill="none" stroke="#506b58" strokeWidth="3"/></svg>;

/* ---------- The session state machine (a study, not production code) ---------- */
const STATES = ['entry', 'connecting', 'connected', 'interrupted', 'retry'];
const NAMES = { entry: 'Entry', connecting: 'Connecting', connected: 'Connected', interrupted: 'Interrupted', retry: 'Retry' };

function useSession() {
  const [state, setState] = useState('entry');
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (state === 'connecting') { const id = setTimeout(() => setState('connected'), 1900); return () => clearTimeout(id); }
    if (state === 'retry') { const id = setTimeout(() => setState('connected'), 2600); return () => clearTimeout(id); }
    if (state === 'connected') { const id = setInterval(() => setSeconds(value => value + 1), 1000); return () => clearInterval(id); }
  }, [state]);
  const speaking = state === 'connected' && seconds % 8 >= 3 && seconds % 8 < 6;
  const actions = {
    start: () => { setSeconds(0); setState('connecting'); },
    cancel: () => setState('entry'),
    drop: () => setState('interrupted'),
    retry: () => setState('retry'),
    end: () => setState('entry'),
    tap: () => setState(current => { if (current === 'entry') { setSeconds(0); return 'connecting'; } if (current === 'connected') return 'interrupted'; if (current === 'interrupted') return 'retry'; return current; }),
  };
  return { state, seconds, speaking, actions };
}

// Keeps the 3D scene in step with the session, including after the lazy scene finishes loading.
function useSceneSync(ref, session) {
  const latest = useRef(session); latest.current = session;
  const push = useCallback(() => {
    const s = latest.current;
    ref.current?.send('state', s.state); ref.current?.send('speaking', s.speaking); ref.current?.send('clock', s.seconds);
  }, [ref]);
  useEffect(() => { push(); }, [push, session.state, session.speaking, session.seconds]);
  return useCallback(name => { if (name === 'ready') setTimeout(push, 0); }, [push]);
}

const heroLine = {
  entry: 'Tap the orb. It runs through the states of a voice session.',
  connecting: 'Connecting. The rings rise one after another.',
  connected: 'Connected. Tap again to drop the connection.',
  interrupted: 'Interrupted. The outer rings slip. Tap to retry.',
  retry: 'Retrying. The rings re-seat, one by one.',
};

function HeroStage() {
  const ref = useRef(null);
  const session = useSession();
  const ready = useSceneSync(ref, session);
  const onEvent = useCallback((name) => { ready(name); if (name === 'tap') session.actions.tap(); }, [ready, session.actions]);
  return { stage: <div className="ms-hero-stage"><Stage3D ref={ref} scene={scene} eager label="A ceramic orb inside five concentric rings. The rings change shape as a voice session moves between its states." fallback={<Fallback/>} onEvent={onEvent}/></div>, note: <span aria-live="polite">{heroLine[session.state]}</span> };
}

const panel = {
  entry: {
    status: 'Press call to start.', source: 'From the app: "Press call button to start"',
    facts: [['In the app', 'A first call goes through a consent step. It says Tara is an AI assistant, not a licensed professional, and does not provide therapy or medical advice.'], ['In the app', 'The status line asks for microphone access before anything else.']],
  },
  connecting: {
    status: 'Opening the session.', source: 'From my study. The app has no separate waiting copy.',
    facts: [['In the app', 'The voice agent is picked in this order: a stored choice of accent, then the visitor’s country, then the browser timezone, then a default.'], ['In my study', 'Waiting is visible motion, so a slow start never looks like a failure.']],
  },
  connected: {
    status: 'Take your time. This is your space.', source: 'From the app: the toast shown when a call connects',
    facts: [['In the app', 'The status line alternates between "Listening..." and "Agent is speaking...". The orb’s ripple follows it.'], ['In the app', 'Every 10 seconds the app deducts usage and updates the call log, so a closed tab loses at most a few seconds of record.'], ['In the app', 'If someone’s words match a list of crisis phrases, a helpline panel opens and the phone’s dialer is offered. The person confirms with one tap.']],
  },
  interrupted: {
    status: 'Connection dropped.', source: 'From the app: the toast title when a call closes within two seconds',
    facts: [['In the app', 'The message asks the person to check their internet, account status or microphone permission. The call log is updated either way.'], ['In the app', 'After a disconnect the person is returned to the home screen.']],
  },
  retry: {
    status: 'Reconnecting.', source: 'From my study. This state is a proposal, not shipped.',
    facts: [['In my study', 'Instead of returning home, the person stays on the call screen with one clear next step, and the session re-opens.'], ['In my study', 'The rings re-seat one by one, so recovery is something you can see.']],
  },
};

function SessionStudy() {
  const ref = useRef(null);
  const session = useSession();
  const { state, actions } = session;
  const ready = useSceneSync(ref, session);
  const onEvent = useCallback(name => { ready(name); if (name === 'tap') actions.tap(); }, [ready, actions]);
  const info = panel[state];
  const buttons = {
    entry: [['Start the session', actions.start, true]],
    connecting: [['Cancel', actions.cancel, false]],
    connected: [['Drop the connection', actions.drop, true], ['End the session', actions.end, false]],
    interrupted: [['Retry', actions.retry, true], ['Return home', actions.end, false]],
    retry: [['Cancel', actions.cancel, false]],
  }[state];
  return <div className="ms-session" data-reveal>
    <div className="ms-session-stage"><Stage3D ref={ref} scene={scene} label="The voice orb. Press it to move the session forward, or use the buttons beside it." fallback={<Fallback/>} onEvent={onEvent}/></div>
    <div className="ms-panel">
      <ol className="ms-steps" aria-label="Session states">{STATES.map(name => <li key={name} aria-current={name === state ? 'step' : undefined} data-warn={name === 'interrupted'}>{NAMES[name]}</li>)}</ol>
      <p className="ms-status" aria-live="polite">{info.status}</p>
      <p className="ms-source">{info.source}</p>
      <div className="ms-actions">{buttons.map(([label, handler, primary]) => <button key={label} type="button" className={`ms-action ${primary ? 'is-primary' : ''}`} onClick={handler}>{label}</button>)}</div>
      <div className="ms-facts"><p className="ms-facts-title">What happens at this state</p>{info.facts.map(([who, text]) => <p key={text}><strong>{who}</strong>{text}</p>)}</div>
    </div>
  </div>;
}

/* ---------- Landing extraction: before / after ---------- */
const SHARED = ['Hero art', 'Previews', 'Steps', 'Strips'];
function Extraction() {
  const [view, setView] = useState('before');
  const reduced = useReducedMotion();
  return <div className="ms-extract" data-view={view} data-reveal>
    <svg viewBox="0 0 600 372" role="img" aria-label={view === 'before' ? 'Before: Landing.tsx and IndiaLanding.tsx each contain their own copy of the hero art, previews, steps and strips.' : 'After: both pages import the hero art, previews, steps and strips from one shared file, and keep only their own copy.'}>
      <rect className="ex-page" x="10" y="10" width="190" height="352" rx="10"/><rect className="ex-page" x="400" y="10" width="190" height="352" rx="10"/>
      <text x="30" y="40">Landing.tsx</text><text x="420" y="40">IndiaLanding.tsx</text>
      <text x="300" y="40" textAnchor="middle" className="ex-in" style={{ opacity: view === 'after' ? 1 : 0, transition: reduced ? 'none' : 'opacity .6s ease .3s' }}>LandingShared.tsx</text>
      {SHARED.map((label, i) => <g key={label}>
        <g className="ex-move ex-left"><rect className="ex-block" x="30" y={58 + i * 58} width="150" height="46" rx="8"/><text x="46" y={86 + i * 58}>{label}</text></g>
        <g className="ex-move ex-right"><rect className="ex-block" x="420" y={58 + i * 58} width="150" height="46" rx="8"/><text x="436" y={86 + i * 58}>{label}</text></g>
        <g className="ex-in"><rect className="ex-shared" x="225" y={58 + i * 58} width="150" height="46" rx="8"/><text className="ex-shared-text" x="241" y={86 + i * 58}>{label}</text></g>
      </g>)}
      <rect className="ex-own" x="30" y="292" width="150" height="54" rx="8"/><text x="46" y="324">Its own copy</text>
      <rect className="ex-own" x="420" y="292" width="150" height="54" rx="8"/><text x="436" y="324">India copy</text>
    </svg>
    <div className="case-controls" role="group" aria-label="Show the page structure">
      <button type="button" className="case-chip" aria-pressed={view === 'before'} onClick={() => setView('before')}>Before</button>
      <button type="button" className="case-chip" aria-pressed={view === 'after'} onClick={() => setView('after')}>After</button>
    </div>
    <dl className="ms-extract-numbers"><div><dd>+520</dd><dt>lines in LandingShared.tsx</dt></div><div><dd>&minus;509</dd><dt>lines from Landing.tsx</dt></div><div><dd>+36</dd><dt>net lines in IndiaLanding.tsx</dt></div></dl>
  </div>;
}

/* ---------- The geo bug: before / after ---------- */
const dedent = text => text.replace(/^ {2}/gm, '');
const geoBefore = dedent(`  const result = await handler(event);
  // ...
  // 3. Lightweight geo-IP lookup (server-side so the user IP never hits the browser)
  const services = [
    // ip-api.com - 45 req/min free, no key needed
    async () => {
      const res = await fetch('http://ip-api.com/json/?fields=countryCode', {`);
const geoAfter = dedent(`  // 1. context.geo - the primary signal on v2 functions.
  const ctxCountry = context?.geo?.country?.code;

  // 2. Edge geo headers (Netlify, and Vercel/Cloudflare if ever migrated).
  const headerCountry =
    h['x-nf-geo-country'] || h['X-Nf-Geo-Country'] ||
    h['x-vercel-ip-country'] || h['X-Vercel-Ip-Country'] ||
    h['cf-ipcountry'] || h['CF-IPCountry'];

  const country = String(ctxCountry || headerCountry || '').toUpperCase();
  const ok = /^[A-Z]{2}$/.test(country);
  // ...
  const result = await handler(event, ctx);`);

function GeoPath() {
  const [view, setView] = useState('before');
  const before = view === 'before';
  return <div className="ms-geo" data-reveal>
    <div>
      <div className="case-controls ms-geo-controls" role="group" aria-label="Show the geo function before or after the fix">
        <button type="button" className="case-chip" aria-pressed={before} onClick={() => setView('before')}>Before the fix</button>
        <button type="button" className="case-chip" aria-pressed={!before} onClick={() => setView('after')}>After the fix</button>
      </div>
      <ol className="ms-path" aria-live="polite">
        <li><b>A visitor in Kolkata</b><span>Opens the landing page. The page asks /geo where this request came from.</span></li>
        <li><b>Netlify&rsquo;s edge</b><span>Knows the real address of the visitor, so it can tell the function the country.</span></li>
        <li data-bad={before} data-good={!before}><b>The /geo function</b><span>{before ? 'The adapter never passed the context along, so context.geo was out of reach. With the header also missing, the function asked an IP service from inside the function.' : 'Reads context.geo.country.code first, then the edge headers. It has no outside lookup at all. With no signal it answers null.'}</span></li>
        <li data-bad={before} data-good={!before}><b>The answer</b><span>{before ? 'That request leaves from Netlify’s own datacenter, so the service saw Netlify.' : 'The country comes from the visitor’s side of the connection, so a VPN exit is read correctly too.'}</span><span className="ms-answer">{before ? '{ "country": "US" }' : '{ "country": "IN" }'}</span></li>
      </ol>
    </div>
    <div className="ms-geo-code" key={view}><CodeNote file={before ? 'netlify/functions/geo.js, before' : 'netlify/functions/geo.js, after'} language="js" code={before ? geoBefore : geoAfter} caption={before ? 'Trimmed to the two lines that mattered. The context never reached the handler, and the fallback lookup could only ever see Netlify.' : 'Trimmed. The fix reads the edge signals and deletes the lookup.'}/></div>
  </div>;
}

/* ---------- One country code, five consequences ---------- */
const chain = [
  ['The country', 'Everything starts with one two-letter code from the /geo function.'],
  ['The voice accent', 'The home screen picks its default accent from it: India, the Arab world, Australia, or the US.'],
  ['The India banner', 'The landing page shows a banner to Indian visitors, using the same signal.'],
  ['Booking', 'Booking and the schedule page choose their India or international flow from it.'],
  ['Conversion tags', 'Checkout and booking events report INR or USD from it, so a wrong country is also a wrong report.'],
];
function Chain() {
  const [fallen, setFallen] = useState(0);
  const [read, setRead] = useState(0);
  const reduced = useReducedMotion();
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const push = () => {
    timers.current.forEach(clearTimeout); setFallen(0); setRead(0);
    if (reduced) { setFallen(chain.length); setRead(chain.length - 1); return; }
    chain.forEach((_, i) => timers.current.push(setTimeout(() => { setFallen(i + 1); setRead(i); }, 120 + i * 320)));
  };
  const reset = () => { timers.current.forEach(clearTimeout); setFallen(0); setRead(0); };
  return <div className="ms-chain-wrap" data-reveal>
    <h3>One wrong country touches five things</h3>
    <p className="case-caption">Each of these reads the country in the code. Push the first one.</p>
    <div className="ms-chain">{chain.map(([label], i) => <button key={label} type="button" className="ms-block" data-fallen={fallen > i} aria-pressed={read === i} onClick={() => setRead(i)}>{label}</button>)}</div>
    <p className="ms-chain-read" aria-live="polite">{chain[read][1]}</p>
    <div className="case-controls"><button type="button" className="case-chip" onClick={push}>Push the first domino</button><button type="button" className="case-chip" onClick={reset}>Stand them up</button></div>
  </div>;
}

/* ---------- Branch map: where my commits live ---------- */
const DAY = 86400000, START = Date.parse('2026-08-08'), SPAN = Date.parse('2026-09-24') - START;
const lanes = [
  { name: 'main', note: 'shared line', commits: [['84db77e', '2026-08-08', 'Feat: Posthog Integration done', 'Event tracking and feature flags. The first of my commits in the app.'], ['bab98b1', '2026-08-13', 'Fix: bump SW cache version to evict broken PostHog bundle', 'One line: the service worker cache version, v2 to v3. Returning visitors had kept a broken bundle.'], ['4f8caa4', '2026-08-16', 'feat: make top mindspace.ai logo clickable to home, bundle posthog properly', 'Logo links home, and PostHog is bundled with the app instead of loaded separately.'], ['eb4aaa3', '2026-08-17', 'Fix: Posthog Feature Flags Fix', 'A small fix to how feature flags initialise.']] },
  { name: 'dhruv', note: 'a teammate’s branch; I committed to it', commits: [['0feab77', '2026-08-28', 'Update: Tags integrated', 'Currency on checkout and purchase events, so USD and INR flows report correctly.'], ['d5b799f', '2026-08-28', 'Update: Tags Update', 'More analytics changes on the booking page.'], ['7ff6f08', '2026-08-29', 'Update: final Tags added', 'The last tag changes on the purchase screens.']] },
  { name: 'geo-context-fix', note: 'bug one', commits: [['46fefef', '2026-09-08', 'fix(geo): read context.geo; drop server-side IP lookup that geolocated Netlify', 'The root cause. Read the context, delete the lookup that could only see Netlify.']] },
  { name: 'geo-no-stale-cache', note: 'bug two', commits: [['1ef8520', '2026-09-08', 'fix(geo): the /geo function was geolocating Netlify, not the user', 'The same fix, written up with the root cause in the message.'], ['55ff23a', '2026-09-08', 'fix(geo): stop stale country pinning VPN/travelling users', 'A session flag froze the first answer and a timezone guess entered the cache. Both removed.']] },
  { name: 'landing-featured-strip', note: 'landing', commits: [['44ac42b', '2026-09-08', 'Landing featured strip (#40)', 'A strip of the places the product is featured, added to the landing page.']] },
  { name: 'corporate-remove-pricing', note: 'small, on request', commits: [['bc1a102', '2026-09-10', 'fix(corporate): remove all pricing numbers from /corporate page', 'The corporate page no longer shows price figures.']] },
  { name: 'feat/booking-india-conversion-2', note: 'India work', commits: [['5d58296', '2026-09-14', 'feat(analytics): add second India booking conversion label', 'A second conversion label for India bookings.'], ['b608096', '2026-09-19', 'feat(seo): trust page, India landing, and sitemap/schema fixes', 'An About page, SEO metadata for the India landing, and sitemap and schema fixes.'], ['d413618', '2026-09-20', 'feat(footer): add directory badges', 'Directory badges in the footer.'], ['c9fa669', '2026-09-24', 'feat(footer): add more directory badges', 'More directory badges, in full colour.'], ['1c56b93', '2026-09-24', 'feat(india): rebuild /india page with shared landing visuals', 'The rebuild: shared landing parts pulled into one file, both pages use it.']] },
];
const fmt = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function BranchMap() {
  const [pick, setPick] = useState('1c56b93');
  const chosen = lanes.flatMap(lane => lane.commits.map(commit => ({ lane, commit }))).find(item => item.commit[0] === pick);
  return <div data-reveal>
    <div className="ms-branches" role="group" aria-label="Branches that hold my commits. Select a dot to read the commit.">
      {lanes.map(lane => <div className="ms-lane" key={lane.name}>
        <div className="ms-lane-name">{lane.name}<small>{lane.note}</small></div>
        <div className="ms-track">{lane.commits.map(([hash, date, subject], i) => {
          const same = lane.commits.slice(0, i).filter(other => other[1] === date).length;
          const left = Math.min(96, 2 + ((Date.parse(date) - START) / SPAN) * 94 + same * 5);
          return <button key={hash} type="button" className="ms-dot" style={{ left: `${left}%` }} aria-pressed={pick === hash} aria-label={`${fmt(date)}: ${subject}`} onClick={() => setPick(hash)}/>;
        })}</div>
      </div>)}
    </div>
    <div className="ms-commit" aria-live="polite"><h3>{chosen.commit[2]}</h3><p className="ms-meta">{fmt(chosen.commit[1])}, commit {chosen.commit[0]}</p><p>{chosen.commit[3]}</p></div>
  </div>;
}

/* ---------- Closing orb ---------- */
function RestingOrb() {
  const ref = useRef(null);
  const ready = useCallback(name => { if (name === 'ready') setTimeout(() => ref.current?.send('state', 'entry'), 0); }, []);
  return <div className="ms-close-stage"><Stage3D ref={ref} scene={scene} label="The ceramic voice orb at rest. Press it or a ring to make it ripple." fallback={<Fallback/>} onEvent={ready}/></div>;
}

export default function Mindspace() {
  const hero = HeroStage();
  return <CasePage slug="mindspace" accent="#506b58">
    <CaseHero
      name="Mindspace · internship work"
      title="Make room for a conversation."
      lede="For seven weeks I worked on the front door of Mindspace, a team-built app where people talk to an AI companion called Tara. This page keeps what I built apart from what the team built."
      links={[{ href: 'https://mindspace.ai', label: 'Open mindspace.ai' }, { href: '#states', label: 'Drive a session' }]}
      facts={[{ label: 'Role', value: 'Intern, product engineering' }, { label: 'Company', value: 'GoodMindIndia' }, { label: 'Timeline', value: 'August to September 2026' }, { label: 'Stack', value: 'React, TypeScript, Netlify Functions, PostHog' }, { label: 'Status', value: 'Live. A team product; my share is itemised below.' }]}
      stage={hero.stage} note={hero.note}/>

    <Chapter id="product" title="The product" heading="Mindspace is a place to start talking">
      <div className="ms-intro">
        <div>
          <Prose>
            <p>Mindspace is a mental wellness app from GoodMindIndia. A person can talk to Tara, an AI voice companion, chat with her by text, take a self-assessment, or book a session with a licensed therapist.</p>
            <p>Tara is clear about what she is. Before a first call, a consent step says she is an AI assistant, not a licensed professional, and does not provide therapy or medical advice.</p>
            <p>I make no claims here about outcomes. This page is about the software and how it was made.</p>
          </Prose>
        </div>
        <Shot src={`${IMG}hero-crop.jpg`} alt="The Mindspace landing page: the headline 'For the moments you don't know who to talk to', an illustration of a person in a bean bag chair, and buttons to start talking or find a therapist." frame="browser" address="mindspace.ai" caption="The landing page, live. I worked on this page and its India version. The product behind the buttons is the team's." priority/>
      </div>
      <Reel label="Screens from the live landing page" shots={[
        { src: `${IMG}demo-crop.jpg`, alt: 'Landing page previews: a call button with five minutes available, and an anxiety assessment question with four answers.', frame: 'browser', address: 'mindspace.ai', caption: 'Talk and assess previews on the landing page. They are illustrative demos, not live sessions.' },
        { src: `${IMG}desktop-2.jpg`, alt: 'Landing page section about finding a therapist, with a sample booking card and six time slots.', frame: 'browser', address: 'mindspace.ai', caption: 'The booking preview. The therapist card is sample content.' },
        { src: `${IMG}mobile-1.jpg`, alt: 'Mobile view of the talk-to-Tara section with a call button.', frame: 'phone', caption: 'On a phone: Talk.' },
        { src: `${IMG}mobile-2.jpg`, alt: 'Mobile view of the assessment section showing question three of ten.', frame: 'phone', caption: 'Assess.' },
        { src: `${IMG}mobile-3.jpg`, alt: 'Mobile view of the booking section with a confirmed slot.', frame: 'phone', caption: 'Book.' },
      ]}/>
    </Chapter>

    <Chapter id="mine" title="My part" heading="My part was the front door" tone="paper">
      <Prose>
        <p>I joined in August as an intern. In the app repository I have 30 of 184 non-merge commits across its branches. Git shows two author names for me, DEBAPALLAB and Debapallab Das. Both are mine.</p>
        <p>My work sits at the edges: the landing pages, regional detection, analytics, SEO and small interface fixes. The voice session, chat, assessments, accounts and payments were built by the team. I touched purchase screens only to add analytics fields.</p>
      </Prose>
      <div className="ms-ledger-gap"><Ledger
        mineTitle="What I did"
        othersTitle="What the team built"
        mine={[
          'Rebuilt the /india landing page on shared components, so both landing pages use one set of parts.',
          'Found and fixed the geo function that reported the wrong country, and the cache that kept the wrong answer.',
          'Integrated PostHog, fixed its feature flags, and cleared the service worker cache that held a broken bundle.',
          'Added currency to checkout and purchase events and a second India booking conversion.',
          'SEO: an About page, India landing metadata, sitemap and schema fixes.',
          'Small interface work: logo swap and link home, directory badges in the footer, a removed hero pill, a removed tap-circle hint, pricing numbers taken off the corporate page.',
        ]}
        others={[
          'Voice sessions with ElevenLabs, call logs and usage accounting.',
          'Text chat, self-assessments, therapist booking, accounts and payments.',
          'Tara’s voice, system prompt and consent wording.',
          'The landing sections and previews that I later moved into the shared file.',
          'Hosting, deploys and the data model.',
        ]}/></div>
      <div className="case-gap"/>
      <Numbers items={[
        { label: 'commits of mine', value: '30', note: 'of 184 non-merge commits across the repository’s branches.' },
        { label: 'days, 8 August to 24 September', value: '47', note: 'The span of my commits.' },
        { label: 'line changed to fix a broken bundle', value: '1', note: 'A cache version string in the service worker.' },
      ]}/>
    </Chapter>

    <Chapter id="states" title="Session states" heading="A session is five states, not one screen" tone="ink">
      <Prose>
        <p>The voice screen is the heart of the app, and it is the team&rsquo;s work. To understand it the way a user lives it, I built a study of its states.</p>
        <p>This is not the product&rsquo;s code. It never opens a microphone and never calls an AI. The status lines are the app&rsquo;s own words where it has them. Each fact below is marked as the app&rsquo;s or my study&rsquo;s.</p>
      </Prose>
      <div className="case-gap"/>
      <SessionStudy/>
      <p className="ms-note" data-reveal>Retry is my proposal. In the shipped app a dropped call returns to the home screen.</p>
    </Chapter>

    <Chapter id="landing" title="Landing" heading="Two landing pages, one set of parts">
      <Split>
        <div>
          <Prose>
            <p>The India page repeated sections of the main landing page, so the two had started to drift. I pulled the shared parts into one file, LandingShared.tsx: the hero art, the talk, assess and book previews, the onboarding steps and the directory strips.</p>
            <p>Both pages now import it. Each keeps only what is its own. The move was a refactor with no change in what a visitor sees, which is why I checked the pages side by side before and after.</p>
          </Prose>
          <div className="case-gap"/>
          <Extraction/>
        </div>
        <Shot src={`${IMG}demo-crop.jpg`} alt="The talk and assess previews on the landing page." frame="browser" address="mindspace.ai" caption="These previews now live in the shared file, so the India page shows the same ones."/>
      </Split>
    </Chapter>

    <Chapter id="geo" title="The geo bug" heading="The lookup was finding our server" tone="paper">
      <Prose>
        <p>Visitors in India were getting the US experience. Regional behaviour on Mindspace depends on one question: which country is this request from?</p>
        <p>The /geo function answered it from Netlify&rsquo;s edge. When that signal was missing, it asked an IP service from inside the function. A request from a function leaves Netlify&rsquo;s own datacenter, so the service answered with Netlify&rsquo;s country. An Indian visitor on an Indian address got US.</p>
      </Prose>
      <div className="case-gap"/>
      <GeoPath/>
      <div className="case-gap"/>
      <Decision
        title="Which signal decides the country?"
        problem="Three signals were available, and each fails in its own way."
        chosen="edge"
        options={[
          { id: 'clock', label: 'The visitor’s timezone', body: 'Instant and free. It is also wrong for a VPN, a travelling visitor, or a laptop clock set elsewhere.', cost: 'Kept only as the guess for first paint. It is never written to the cache.' },
          { id: 'lookup', label: 'A lookup from the function', body: 'This is what was there. It can only ever see the address the function runs from, which is Netlify.', cost: 'It answered for our server. I deleted it.' },
          { id: 'edge', label: 'Netlify’s edge geo', body: 'Netlify works the country out from the real client address, so it reads a VPN exit correctly. The function reads context.geo first and the edge headers second.', cost: 'It is best effort. When neither signal exists, the function answers null and the page keeps the timezone guess instead of pretending.' },
        ]}/>
      <div className="case-gap"/>
      <Prose>
        <p>There was a second bug, in code I had written. A session flag froze the first answer for the rest of the session, and a timezone guess was written into the 24-hour cache. A teammate testing on a US VPN kept seeing India. I removed both. /geo now runs on every mount, and only a real answer is cached.</p>
      </Prose>
      <Chain/>
    </Chapter>

    <Chapter id="journey" title="Journey" heading="Seven weeks, in the order they happened">
      <Timeline label="My work over seven weeks" items={[
        { date: 'Aug 8', title: 'PostHog goes in', body: 'Event tracking and feature flags, plus the first logo swap. A couple of days later the flags needed a fix.' },
        { date: 'Aug 13', title: 'A cached broken bundle', body: 'Returning visitors kept an old PostHog bundle in the service worker cache. Bumping the cache version from v2 to v3 evicted it. One line.' },
        { date: 'Aug 28', title: 'Tags for checkout and booking', body: 'Currency added to checkout and purchase events, so USD and INR flows report separately.' },
        { date: 'Sep 8', title: 'The geo day', body: 'Three geo commits in one day, two branches, one root cause written into the commit message. The same day: a featured strip on the landing page and a price qualifier removed from booking.' },
        { date: 'Sep 10', title: 'Prices off /corporate', body: 'Price numbers removed from the corporate page.' },
        { date: 'Sep 19', title: 'Trust page and SEO', body: 'An About page, India landing metadata, sitemap and schema fixes. The landing hero lost its eyebrow pill.' },
        { date: 'Sep 24', title: 'The India rebuild', body: 'The shared landing file, both pages on it, and more directory badges. My last commits in this repository.' },
      ]}/>
    </Chapter>

    <Chapter id="team" title="Team work" heading="Working in a codebase I didn't start" tone="ink">
      <BranchMap/>
      <div className="ms-habits">
        <Prose>
          <ul>
            <li>One concern per branch and per commit. The geo fix is two branches because it was two bugs.</li>
            <li>Commit messages that carry the root cause, so a reviewer does not have to reproduce the bug.</li>
            <li>Reusing what exists. The India banner uses the existing isIndianVisitor() signal instead of a new one.</li>
            <li>Merging main back into my branch to stay current, rather than rewriting shared history.</li>
          </ul>
        </Prose>
      </div>
      <Statement>In someone else&rsquo;s codebase, the best change is the one the next person does not have to explain.</Statement>
    </Chapter>

    <Chapter id="learned" title="What I learned" heading="What I'd carry into the next one" tone="accent">
      <div className="ms-close">
        <div>
          <ul className="ms-lessons" data-reveal>
            <li><strong>Find the layer that is lying.</strong>The geo bug looked like a pricing bug, then a cache bug. It was a function answering for its own server.</li>
            <li><strong>Small fixes carry weight.</strong>One version string repaired a broken bundle for everyone who had visited before.</li>
            <li><strong>Say what is yours.</strong>The voice session, chat and payments are not mine. Knowing where my work ended let me change the front door without touching them.</li>
          </ul>
          <p className="ms-next" data-reveal><strong>What I would do next.</strong> Give the session the retry from my study, as a proposal for the team to weigh. And move the crisis helpline from one hard-coded number to a list by country, next to the country signal I fixed. Neither is built.</p>
        </div>
        <RestingOrb/>
      </div>
    </Chapter>
  </CasePage>;
}
