import React, { useEffect, useRef, useState } from 'react';
import '../styles/lucide.css';
import { CasePage, CaseHero, Chapter, Prose, Statement, Split, Shot, Decision, CodeNote, Ledger, Numbers } from '../kit.jsx';
import useReducedMotion from '../../useReducedMotion.js';

/* The lamp, rebuilt from the constants in v8/src/components/HeroLamp.tsx.
   Same pivot, same rest, sweep and aim angles, same cold-start flicker. */
const LX = 155, MY = 208, LENS_Y = 242;
const REST = -18, AIM = -82, AIM_NARROW = -31, SWEEP_NEAR = -4, SWEEP_FAR = -34;
const FLICKER = [[0, 0], [.75, 75], [0, 95], [.45, 55], [0, 80], [.88, 65], [.06, 45], [.92, 55], [0, 85], [.6, 60], [0, 70], [1, 500]];

function LampDemo() {
  const reduced = useReducedMotion();
  const host = useRef(null), rig = useRef(null), angle = useRef(REST), lockedRef = useRef(false), aimRef = useRef(AIM);
  const [locked, setLocked] = useState(false);
  const [lit, setLit] = useState(false);
  const [power, setPower] = useState(reduced ? 1 : 0);
  const [narrow, setNarrow] = useState(false);
  const [readout, setReadout] = useState(REST);
  lockedRef.current = locked;
  aimRef.current = narrow ? AIM_NARROW : AIM;

  // The rig is its own layer, drawn once at 0° and turned with a CSS transform about the pivot,
  // so the blurred beam is rasterised once and the compositor does the turning.
  const set = value => { angle.current = value; if (rig.current) rig.current.style.transform = `rotate(${value.toFixed(2)}deg)`; };

  useEffect(() => {
    const node = host.current;
    const measure = () => {
      const w = node.clientWidth, h = node.clientHeight, isNarrow = w < 560;
      const scale = Math.max(w / 1000, h / 600), offsetY = isNarrow ? 0 : (h - 600 * scale) / 2;
      if (rig.current) rig.current.style.transformOrigin = `${LX * scale}px ${MY * scale + offsetY}px`;
      setNarrow(isNarrow);
    };
    measure();
    const resizer = new ResizeObserver(measure); resizer.observe(node);
    return () => resizer.disconnect();
  }, []);

  // Cold start, once, the first time the lamp is on screen.
  useEffect(() => {
    if (reduced) { setPower(1); return undefined; }
    const ids = [];
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      let elapsed = 250;
      FLICKER.forEach(([value, duration]) => { ids.push(setTimeout(() => setPower(value), elapsed)); elapsed += duration; });
    });
    observer.observe(host.current);
    return () => { observer.disconnect(); ids.forEach(clearTimeout); };
  }, [reduced]);

  // One loop: sweep while idle, swing onto the headline while locked, sleep off screen.
  useEffect(() => {
    if (reduced) return undefined;
    let frame = 0, previous = 0, sync = 0, visible = false, clock = 0;
    const tick = now => {
      frame = 0;
      if (!visible) { previous = 0; return; }
      const dt = previous ? Math.min(.05, (now - previous) / 1000) : 0; previous = now;
      let target, rate;
      if (lockedRef.current) { target = aimRef.current; rate = 9; }
      else { clock += dt; const s = (1 - Math.cos(clock * .55)) / 2; target = SWEEP_NEAR + (SWEEP_FAR - SWEEP_NEAR) * s; rate = 2.6; }
      set(angle.current + (target - angle.current) * (1 - Math.exp(-rate * dt)));
      if (now - sync > 150) { sync = now; setReadout(angle.current); }
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible && !frame) frame = requestAnimationFrame(tick); }, { rootMargin: '120px 0px' });
    observer.observe(host.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [reduced]);

  useEffect(() => { if (reduced) { const value = locked ? aimRef.current : REST; set(value); setReadout(value); } }, [locked, narrow, reduced]);

  const lock = () => { setLocked(true); setLit(true); };
  const onEnter = event => { if (event.pointerType === 'mouse') lock(); };
  const toggle = () => { if (locked) setLocked(false); else lock(); };
  const ratio = narrow ? 'xMinYMin slice' : 'xMinYMid slice';

  const headlineState = locked ? 'is-locked' : lit ? 'is-dim' : 'is-dark';
  return <div className={`lc-lamp ${narrow ? 'is-narrow' : ''}`} ref={host} data-ui data-stage="ready" style={{ '--lamp': power }}>
    <svg className="lc-lamp-scene" viewBox="0 0 1000 600" preserveAspectRatio={ratio} aria-hidden="true">
      <defs><filter id="lc-pool-soft" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="14"/></filter></defs>
      <ellipse className="lc-pool" cx="330" cy="508" rx="220" ry="16" fill="#3b5d99" filter="url(#lc-pool-soft)"/>
      <rect x="80" y="148" width="8" height="360" rx="3" fill="#1d2a3d"/>
      <path d="M84 152 C 84 120, 150 118, 155 196" fill="none" stroke="#1d2a3d" strokeWidth="7" strokeLinecap="round"/>
    </svg>
    <div className="lc-lamp-rig" ref={rig} style={{ transform: `rotate(${REST}deg)` }}>
      <svg viewBox="0 0 1000 600" preserveAspectRatio={ratio} aria-hidden="true">
        <defs>
          <linearGradient id="lc-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dfe8ff" stopOpacity=".78"/>
            <stop offset=".45" stopColor="#8fb0f0" stopOpacity=".26"/>
            <stop offset="1" stopColor="#3b7fe8" stopOpacity="0"/>
          </linearGradient>
          <filter id="lc-soft" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
          <filter id="lc-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6"/></filter>
        </defs>
        <g className="lc-beam">
          <polygon points={`${LX - 14},${LENS_Y} ${LX + 14},${LENS_Y} ${LX + 190},${LENS_Y + 700} ${LX - 190},${LENS_Y + 700}`} fill="url(#lc-beam)" filter="url(#lc-soft)"/>
          <polygon points={`${LX - 8},${LENS_Y} ${LX + 8},${LENS_Y} ${LX + 70},${LENS_Y + 460} ${LX - 70},${LENS_Y + 460}`} fill="url(#lc-beam)" filter="url(#lc-soft)"/>
        </g>
        <path d={`M${LX - 13} ${MY - 6} L${LX + 13} ${MY - 6} L${LX + 26} ${LENS_Y} L${LX - 26} ${LENS_Y} Z`} fill="#2a3a55"/>
        <g className="lc-lens">
          <ellipse cx={LX} cy={LENS_Y} rx="22" ry="6" fill="#eef3ff" filter="url(#lc-glow)"/>
          <ellipse cx={LX} cy={LENS_Y} rx="17" ry="4" fill="#ffffff"/>
        </g>
        <circle cx={LX} cy={MY - 6} r="7" fill="#1d2a3d"/>
      </svg>
    </div>
    <button type="button" className={`lc-lamp-headline ${headlineState}`} onPointerEnter={onEnter} onClick={toggle} aria-pressed={locked} aria-label={locked ? 'Release the lamp from the headline' : 'Point the lamp at the headline'}>
      <span>We build</span><span>what finds you</span><span>in the dark<i>.</i></span>
    </button>
    <dl className="lc-lamp-readout" aria-live="off">
      <div><dt>Head</dt><dd>{Math.round(readout)}°</dd></div>
      <div><dt>State</dt><dd>{locked ? 'Locked on the headline' : reduced ? 'At rest' : 'Sweeping'}</dd></div>
    </dl>
  </div>;
}

/* Every version, read from its own folder in web design tests/. */
const versions = [
  { id: 'v1', when: '17 Apr', line: 'We build websites that make people stop scrolling.', shot: 'v1-desktop-0', alt: 'v1: a cream page with WE BUILD WEBSITES THAT MAKE PEOPLE STOP SCROLLING set in heavy capitals down the left side',
    tried: 'Cream paper, black grotesque capitals, a Work, About and Contact page. Framer Motion for the reveals.', went: 'The headline ran to seven lines at desktop width and still did not finish on the first screen.' },
  { id: 'v2', when: '18 Apr', line: 'We build websites that make people stop scrolling.', shot: 'v2-desktop-0', alt: 'v2: the same sentence in a serif on the same cream page',
    tried: 'The same sentence in a serif, sticky sections that stacked over each other, and Lenis for smooth scrolling.', went: 'A new typeface on the same idea. Lenis stayed; it is still in v8.' },
  { id: 'v3', when: '18 Apr', line: 'Make an impression.', shot: 'v3-desktop-0', alt: 'v3: a periwinkle page with Make an Impression and a photograph of two hands passing a blue sphere',
    tried: 'A periwinkle field, a photograph of two hands passing a sphere, and React Three Fiber in the dependencies for a fluid wave.', went: 'It could have been any studio’s site. Nothing in it belonged to Lucide.' },
  { id: 'v4', when: '18 to 27 Apr', line: 'Most websites are forgettable. Yours doesn’t have to be.', shot: 'v4-desktop-1', alt: 'v4: Most websites are forgettable. Yours doesn’t have to be, in a serif on a blue field, with a dock at the bottom',
    tried: 'A loader, a floating dock for navigation and the first pricing table: two plans, ₹25,000 and ₹65,000.', went: 'The first line about the visitor’s problem, not ours. The pricing table survived one more round.' },
  { id: 'v5', when: '27 Apr to 14 May', line: 'We design websites that make people stop scrolling.', shot: 'v5-desktop-0', alt: 'v5: a near-black page with We design websites that make people stop scrolling, the last words in acid green italic',
    tried: 'Obsidian, bone and acid green. A loader that read Understanding the problem, Questioning the brief, Ignoring the brief. A founder letter, a manifesto, Nagpur’s coordinates, pricing. Six commits.', went: 'The most finished of the early versions, and the old sentence came back with it.' },
  { id: 'v6', when: '14 May', line: 'We design websites that make people stop scrolling.', shot: 'v6-desktop-0', alt: 'v6: a dark page with a green crystal monolith beside the same stop scrolling headline',
    tried: 'I wrote v5 up as a long spec and had Lovable generate a multipage build from it: a 3D obsidian monolith, Work, Philosophy and Contact routes.', went: 'The only version I did not write by hand. It followed the spec and I still did not want to keep it. Four weeks went by before v7.' },
  { id: 'v7', when: '12 to 15 Jun', line: 'We build what finds you in the dark.', shot: 'v7-desktop-0', alt: 'v7: a dark page with a street lamp throwing light',
    tried: 'A new sentence and an object to go with it: a street lamp in SVG. GSAP took over the work section as a pinned rail called Things we’ve shipped.', went: 'The idea held. But the lamp hung straight down and could not move, and the headline sat there in grey whether anyone looked or not.' },
  { id: 'v8', when: '20 Jun to 10 Jul', line: 'We build what finds you in the dark.', shot: 'v8-desktop-0', alt: 'v8: the live lucide.in, a lamp on the left and the headline on the right',
    tried: 'One lamp, re-drawn, that can turn and light the headline. An intro, the case notes, the team, a contact sentence, an FAQ and the search groundwork. Twelve commits.', went: 'Live at lucide.in.' },
];

function VersionViewer() {
  const [id, setId] = useState('v8');
  const index = versions.findIndex(item => item.id === id), item = versions[index];
  const step = d => setId(versions[(index + d + versions.length) % versions.length].id);
  return <div className="lc-versions" data-reveal>
    <div className="lc-version-tabs" role="tablist" aria-label="Versions of lucide.in">
      {versions.map(entry => <button key={entry.id} type="button" role="tab" aria-selected={entry.id === id} onClick={() => setId(entry.id)} data-line={entry.line.includes('stop scrolling') ? 'old' : entry.line.includes('dark') ? 'new' : 'other'}>
        <span className="lc-v-id">{entry.id}</span><span className="lc-v-when">{entry.when}</span>
      </button>)}
    </div>
    <div className="lc-version" role="tabpanel" key={id}>
      <figure className="lc-version-shot">
        <div className="shot-device" data-ui><div className="shot-bar"><span/><span/><span/><em>localhost · {item.id}</em></div><img src={`/cases/lucide/versions/${item.shot}.jpg`} alt={item.alt} loading="lazy" decoding="async"/></div>
      </figure>
      <div className="lc-version-copy">
        <p className="lc-version-line">“{item.line}”</p>
        <h3>What it tried</h3><p>{item.tried}</p>
        <h3>{item.id === 'v8' ? 'Where it is' : 'Why it went'}</h3><p>{item.went}</p>
        <div className="lc-version-step"><button type="button" className="case-round" onClick={() => step(-1)} aria-label="Previous version">←</button><button type="button" className="case-round" onClick={() => step(1)} aria-label="Next version">→</button></div>
      </div>
    </div>
  </div>;
}

/* The Work rail's sync rule, from v8/src/components/sections/Work.tsx. */
const STOPS = [1.6, 2.6, 3.68, 4.76];
const SERVICES = ['Design that converts', 'Engineered to perform', 'Idea to product', 'Built to be found'];
const naive = time => STOPS.reduce((best, stop, i) => Math.abs(stop - time) < Math.abs(STOPS[best] - time) ? i : best, 0);
const withBand = (time, current) => {
  let next = current;
  if (current < STOPS.length - 1 && time >= STOPS[current] + (STOPS[current + 1] - STOPS[current]) * .6) next = current + 1;
  if (current > 0 && time < STOPS[current] - (STOPS[current] - STOPS[current - 1]) * .4) next = current - 1;
  return Math.max(0, Math.min(STOPS.length - 1, next));
};

function RailDemo() {
  const reduced = useReducedMotion();
  const [time, setTime] = useState(2.05);
  const [band, setBand] = useState(0);
  const [swaps, setSwaps] = useState({ naive: 0, band: 0 });
  const prev = useRef({ time: 2.05, naive: naive(2.05), band: 0 });
  const jitter = useRef(0);

  const move = next => {
    const p = prev.current, n = naive(next);
    let b = p.band;
    // Walk the rule across the distance moved, the way onUpdate sees every frame of a scrub.
    const steps = Math.max(1, Math.ceil(Math.abs(next - p.time) / .02));
    for (let i = 1; i <= steps; i++) b = withBand(p.time + (next - p.time) * i / steps, b);
    setSwaps(s => ({ naive: s.naive + (n !== p.naive ? 1 : 0), band: s.band + (b !== p.band ? 1 : 0) }));
    prev.current = { time: next, naive: n, band: b };
    setTime(next); setBand(b);
  };

  const wobble = () => {
    cancelAnimationFrame(jitter.current);
    const centre = (STOPS[0] + STOPS[1]) / 2, start = performance.now();
    if (reduced) { [centre - .05, centre + .05, centre - .05, centre + .05].forEach(move); return; }
    const run = now => {
      const t = (now - start) / 1000;
      move(centre + Math.sin(t * 9) * .09);
      if (t < 2.2) jitter.current = requestAnimationFrame(run);
    };
    jitter.current = requestAnimationFrame(run);
  };
  useEffect(() => () => cancelAnimationFrame(jitter.current), []);

  const n = naive(time);
  const pct = v => `${((v - 1) / 4.2) * 100}%`;
  return <div className="lc-rail" data-reveal>
    <div className="lc-rail-track">
      {STOPS.map((stop, i) => <span key={stop} className="lc-rail-stop" style={{ left: pct(stop) }} aria-hidden="true"><b>{SERVICES[i]}</b></span>)}
      <label className="lc-rail-range"><span className="sr-only">Timeline position</span>
        <input type="range" min="1" max="5.2" step="0.005" value={time} onChange={e => move(Number(e.target.value))} aria-valuetext={`Timeline at ${time.toFixed(2)}`}/>
      </label>
    </div>
    <div className="lc-rail-compare">
      <div className="lc-rail-col">
        <h3>Nearest stop</h3>
        <p className="lc-rail-active">{SERVICES[n]}</p>
        <p className="lc-rail-count"><strong>{swaps.naive}</strong> copy swaps</p>
      </div>
      <div className="lc-rail-col is-chosen">
        <h3>With the band, as shipped</h3>
        <p className="lc-rail-active">{SERVICES[band]}</p>
        <p className="lc-rail-count"><strong>{swaps.band}</strong> copy swaps</p>
      </div>
    </div>
    <div className="case-controls">
      <button type="button" className="case-chip" onClick={wobble}>Hover at the boundary</button>
      <button type="button" className="case-chip" onClick={() => { setSwaps({ naive: 0, band: 0 }); }}>Reset the counts</button>
    </div>
    <p className="case-caption">Drag the timeline or press Hover at the boundary, which rocks the scroll back and forth between the first two services, like a trackpad that will not settle. Each swap is a staggered word animation on the real site.</p>
  </div>;
}

/* The contact sentence, with the same fields and the same WhatsApp text it builds. */
const kinds = ['a brand site', 'a web app', 'a portfolio', 'something else'];
const budgets = ['below ₹30k', '₹30–60k', '₹60–90k', 'flexible'];
function Sentence() {
  const [name, setName] = useState('Asha');
  const [company, setCompany] = useState('Kiln & Co');
  const [kind, setKind] = useState(kinds[0]);
  const [budget, setBudget] = useState(budgets[1]);
  const parts = [];
  if (name.trim()) parts.push(`Hi, I'm ${name.trim()}${company.trim() ? ` from ${company.trim()}` : ''}.`);
  parts.push(`I'm looking to build ${kind}.`, `Budget: ${budget}.`);
  return <div className="lc-sentence" data-reveal>
    <div className="lc-sentence-form" data-ui>
      <p>Hi Lucide, I’m <input aria-label="Your name" value={name} onChange={e => setName(e.target.value)} size={Math.max(6, name.length)}/> from <input aria-label="Company" value={company} onChange={e => setCompany(e.target.value)} size={Math.max(7, company.length)}/>, looking to build <select aria-label="Project type" value={kind} onChange={e => setKind(e.target.value)}>{kinds.map(k => <option key={k}>{k}</option>)}</select> on a <select aria-label="Budget" value={budget} onChange={e => setBudget(e.target.value)}>{budgets.map(b => <option key={b}>{b}</option>)}</select> budget.</p>
    </div>
    <div className="lc-sentence-out">
      <h3>What WhatsApp opens with</h3>
      <p>{parts.join(' ')}</p>
      <h3>Where Send goes</h3>
      <p>A Superforms submission endpoint, as a form post. The studio’s contact form is a form on its own form builder.</p>
    </div>
  </div>;
}

export default function Lucide() {
  return <CasePage slug="lucide">
    <CaseHero
      name="Lucide Tech"
      title="Built to be found in the dark."
      lede="Lucide Tech is my web studio. Its site took eight versions between April and July 2026. The one that shipped has a lamp that turns to light its own headline, and a name it has to share with an icon library."
      facts={[{ label: 'Role', value: 'Founder. I designed and built every version' }, { label: 'Timeline', value: '17 April to 10 July 2026, eight versions' }, { label: 'Stack', value: 'Next.js 16, React 19, GSAP, Framer Motion, Lenis, Tailwind 4' }, { label: 'Status', value: 'Live at lucide.in' }]}
      links={[{ href: 'https://www.lucide.in', label: 'Open lucide.in' }, { href: '#versions', label: 'See all eight' }]}
      stage={<LampDemo/>}
      note="Point at the headline, or tap it. Tap again to let the lamp go."
    />

    <Chapter id="versions" title="Versions" heading="Eight versions, one sentence too many" tone="ink">
      <Split>
        <Statement>Four of the first six versions open with the same sentence. I changed the look six times before I changed what the site said.</Statement>
        <Prose>
          <p>Every version still sits in its own folder, and each one below is a screenshot of that folder running on my machine. v1 to v6 change the typeface, the palette and the effects. Most of them still say websites that make people stop scrolling, a line any studio could sign.</p>
          <p>v7 is where it turns. The sentence became We build what finds you in the dark, and the sentence brought an object with it: a lamp. Everything after that is about making the lamp do the work.</p>
        </Prose>
      </Split>
      <div className="case-gap"/>
      <VersionViewer/>
    </Chapter>

    <Chapter id="lamp" title="Lamp" heading="The headline stays dark until you look" tone="plain">
      <Split>
        <Prose>
          <p>The hero has one claim: we build what finds you. So the headline does not simply sit there. It loads blurred and dim. A street lamp on the left sweeps slowly across the ground. When the pointer reaches the headline, the lamp turns, its head swings from −18° to −82° in two thirds of a second, and the words come into focus with the button under them.</p>
          <p>After the first time the words never go fully dark again. They rest half lit, so a returning glance can still read them. Clicking the headline releases the lamp back into its sweep.</p>
        </Prose>
        <Prose>
          <p>The lamp warms up like a sodium lamp, flickering through twelve levels before it holds. The beam is a stack of blurred gradient cones, so rotating it redraws filters on every frame, and the sweep pauses whenever the hero is off screen.</p>
          <p>A phone cannot hover, so on touch screens the scene crops into a tall window around the lamp head, the beam pours down the page and the headline is fully lit from the start. A visitor on a phone never has to discover a gesture to read the first line.</p>
        </Prose>
      </Split>
      <div className="case-gap"/>
      <div className="lc-pair">
        <Shot src="/cases/lucide/live/hero-dark.jpg" alt="lucide.in before the pointer reaches the headline: the lamp lights the ground and the headline is blurred" caption="Before: the lamp sweeps the ground and the headline is out of focus." address="lucide.in" priority/>
        <Shot src="/cases/lucide/live/hero-lit.jpg" alt="lucide.in with the pointer on the headline: the lamp has turned and lights WE BUILD WHAT FINDS YOU IN THE DARK, with Start a project below" caption="After: the head has swung to −82°, the words are sharp and Start a project appears." address="lucide.in"/>
      </div>
      <div className="case-gap"/>
      <Split>
        <CodeNote file="v8/src/components/HeroLamp.tsx" language="ts" caption="The lamp is one rig rotated about the joint between arm and head. Four angles describe all of its behaviour." code={`// Head aim around the pivot (LX, MY). Negative = swing the downward beam to the
// RIGHT, toward the headline (SVG's y-down axis makes positive rotate go left).
const REST_ANGLE = -18;  // resting throw — down, slightly toward the scene
const AIM_ANGLE  = -82;  // locked onto the headline — beam aimed at text centre

// Idle back-and-forth scan — the beam slowly sweeps across the ground at rest.
const SWEEP_NEAR = -4;   // swung toward the scene (right)
const SWEEP_FAR  = -34;  // swung back toward the pole (left)`}/>
        <Shot src="/cases/lucide/live/m-hero.jpg" alt="lucide.in on a phone: the lamp hangs at the top and the beam falls onto the lit headline and Start a project button" frame="phone" caption="On a phone the lamp becomes a spotlight and the headline is lit without a gesture."/>
      </Split>
      <div className="case-gap"/>
      <Decision title="How does a phone read a headline that only lights on hover?" chosen="reveal" problem="On a desktop the reveal is the point. On a touch screen there is no pointer to bring the lamp over, and the first line of the site is the one line nobody should miss."
        options={[
          { id: 'reveal', label: 'Light it from the start', body: 'Touch screens get the headline sharp and the button visible on arrival. The lamp is re-framed as a spotlight falling down the page, so the scene still makes sense.', cost: 'Phone visitors never see the reveal. The hero is calmer there than on a desktop.' },
          { id: 'tap', label: 'Ask for a tap', body: 'Keep the blur and let a tap on the words bring the lamp round.', cost: 'It hides the main sentence behind a gesture nobody has been told about.' },
          { id: 'timer', label: 'Swing it on a timer', body: 'After a few seconds the lamp turns to the headline by itself.', cost: 'The site decides when you have looked long enough. A visitor who scrolls first never sees the words lit.' },
        ]}/>
    </Chapter>

    <Chapter id="rail" title="Rail" heading="A pinned rail that never argues with itself" tone="paper">
      <Split>
        <Prose>
          <p>Below the hero, four services pass through a section pinned for 760vh of scroll. The pictures travel diagonally across the screen. The big number and the copy stay still and change when a new picture reaches the centre. GSAP owns this section and nothing else; Framer Motion owns the hero and the nav, and they never share a component.</p>
          <p>The copy follows the timeline, not the scroll position. In v7 the rail picked whichever stop was nearest at each moment. Halfway between two stops, a hand resting on a trackpad can flick the copy back and forth, and every flick is a staggered word animation.</p>
        </Prose>
        <Prose>
          <p>The fix is a band. Going forward, the copy changes once the timeline is 60% of the way to the next stop. Going back, it only reverts once the timeline has fallen 40% of the way to the previous one. Between the two, nothing changes.</p>
          <p>Try it below. The two rules agree when you drag with intent. They disagree when the scroll hesitates.</p>
        </Prose>
      </Split>
      <div className="case-gap"/>
      <RailDemo/>
      <div className="case-gap"/>
      <div className="lc-pair">
        <Shot src="/cases/lucide/live/work-1.jpg" alt="The pinned services rail on lucide.in: Design that converts, with a blue Web Design tile and a large 01" caption="The first stop. The tile is the only thing that travels." address="lucide.in"/>
        <Shot src="/cases/lucide/live/work-2.jpg" alt="The rail mid-transition: Idea to product with an orange tile still out of focus and a large 03" caption="Mid-scrub. The copy has already changed while the tile is still coming into focus." address="lucide.in"/>
      </div>
      <div className="case-gap"/>
      <CodeNote file="v8/src/components/sections/Work.tsx" language="ts" caption="Runs on every update of the scrubbed timeline. currentIndex only moves when the timeline leaves the band." code={`const stops = [1.6, 2.6, 3.68, 4.76];
let next = currentIndex;
if (currentIndex < stops.length - 1) {
  const midFwd = stops[currentIndex] + (stops[currentIndex + 1] - stops[currentIndex]) * 0.6;
  if (time >= midFwd) next = currentIndex + 1;
}
if (currentIndex > 0) {
  const midBwd = stops[currentIndex] - (stops[currentIndex] - stops[currentIndex - 1]) * 0.4;
  if (time < midBwd) next = currentIndex - 1;
}`}/>
    </Chapter>

    <Chapter id="name" title="Name" heading="A name that was already taken" tone="plain">
      <Split className="lc-top">
        <Prose>
          <p>Search for Lucide and the answer is an open-source icon library at lucide.dev, widely used in React projects. Search for Lucid and it is Lucidchart. People also write us as Tech Lucide, or drop the e. The studio site has to be the right answer for a search engine and for an AI assistant, with no budget.</p>
          <p>So the last commits on v8 are not visual. They make the site describe itself the same way in four places.</p>
        </Prose>
        <ul className="lc-signals">
          <li><h3>An FAQ that answers the confusion</h3><p>Is Lucide Tech the Lucide icon library? No. Is Lucid Tech the same as Lucide Tech? Yes. The questions use the words people type.</p></li>
          <li><h3>Structured data</h3><p>Organization, ProfessionalService and WebSite schema, with Nagpur as the address and the four services as an offer catalogue. Each project on the page is a CreativeWork credited to the studio.</p></li>
          <li><h3>An llms.txt</h3><p>A plain summary at /llms.txt for answer engines: one line saying who the studio is, what it is not, the spelling variants, and the same questions answered.</p></li>
          <li><h3>One address</h3><p>Every canonical URL, the sitemap and the schema point at www.lucide.in, so the site is not split across two hosts.</p></li>
        </ul>
      </Split>
      <div className="case-gap"/>
      <Split>
        <CodeNote file="v8/src/app/llms.txt/route.ts" language="md" caption="Served as static text. The first paragraph is the one an assistant is most likely to quote." code={`# Lucide Tech

> Lucide Tech (also written "Tech Lucide") is a premium web design and
> development studio based in Nagpur, India, serving clients across India
> and worldwide.

## What Lucide Tech is

Lucide Tech is an independent digital studio. It is NOT affiliated with
the Lucide open-source icon library (lucide.dev), Lucidchart (lucid.co),
or any other company using a similar name.`}/>
        <Shot src="/cases/lucide/live/faq.jpg" alt="The FAQ on lucide.in, including Is Lucide Tech related to the Lucide icon library (lucide.dev)?" caption="The FAQ sits just above the footer. Its answers say the same things the llms.txt says." address="lucide.in"/>
      </Split>
      <p className="case-caption">There are no rankings on this page. The site has no analytics in its code, so I cannot yet tell you whether any of this has moved a search result.</p>
    </Chapter>

    <Chapter id="door" title="Door" heading="The contact form is a sentence" tone="paper">
      <Split>
        <Prose>
          <p>v4 and v5 both carried a pricing table with two plans, ₹25,000 and ₹65,000. v8 drops it. The budget moved into the contact form, which reads as one sentence with blanks in it, so the price comes up as part of a conversation and not as a menu.</p>
          <p>The same fields build a WhatsApp message, for clients who would rather talk than wait for an email. Send posts the sentence to Superforms, the form builder in this portfolio, so the studio takes its own enquiries through its own product.</p>
        </Prose>
        <Shot src="/cases/lucide/live/contact.jpg" alt="The contact section on lucide.in: Start your conversation, with the fill-in-the-blanks sentence and Send message and WhatsApp buttons" caption="The live form. Empty blanks pulse gently, one after the other." address="lucide.in"/>
      </Split>
      <div className="case-gap"/>
      <Sentence/>
      <div className="case-gap"/>
      <Decision title="Where does price go on a studio site?" chosen="sentence" problem="Clients ask what a site costs before anything else. Two versions answered with a table."
        options={[
          { id: 'sentence', label: 'A budget blank in the sentence', body: 'Four ranges, from below ₹30k to flexible, chosen inside the enquiry itself. The studio learns the budget with the brief.', cost: 'A visitor who only wants a number has to start a conversation to give one.' },
          { id: 'table', label: 'A pricing table', body: 'Two plans at ₹25,000 and ₹65,000, as in v4 and v5.', cost: 'Fixed plans priced every project before anyone knew what it was, and anchored the conversation on the cheaper one.' },
          { id: 'none', label: 'Say nothing about price', body: 'Leave cost to the first call.', cost: 'Every enquiry becomes a call, including the ones that were never going to fit.' },
        ]}/>
    </Chapter>

    <Chapter id="ledger" title="Ledger" heading="What I can count, and whose it is" tone="plain">
      <Numbers items={[
        { label: 'versions of the site', value: '8', note: 'v1 to v8, each in its own folder.' },
        { label: 'scroll the services rail is pinned for', value: '760vh', note: 'Four services, one pinned GSAP timeline.' },
        { label: 'levels in the lamp’s warm-up flicker', value: '12', note: 'The last one is full power.' },
        { label: 'people on the studio page', value: '6', note: 'Read from the live site.' },
      ]}/>
      <div className="case-gap"/>
      <Ledger mineTitle="What is mine" othersTitle="What is shared" mine={[
        'The design and the code of all eight versions. Every commit in their repositories is mine.',
        'The lamp, the services rail and its sync rule, the contact sentence and the search groundwork.',
        'The v6 spec. Lovable generated that build from it; it is the one version I did not write by hand.',
      ]} others={[
        'Lucide Tech is six people. The team section on the site lists all of them.',
        'The projects the site shows are studio work. Superforms, CompareFi and Notaprompt each have their own case study here, with their own credits.',
      ]}/>
      <div className="case-gap"/>
      <Shot src="/cases/lucide/live/team.jpg" alt="The team section on lucide.in: Senior hands on every decisive detail, with portraits of Dev, Dhruv, Tanvi and Shivam" caption="The team section. I am Dev, first on the left." address="lucide.in"/>
    </Chapter>

    <Chapter id="next" title="Next" heading="Next: find out if the lamp is found" tone="ink">
      <Split>
        <Statement>The hero asks for one gesture. I should know how many people make it.</Statement>
        <Prose>
          <p>Three things I would do next. These are plans, not shipped work.</p>
          <ul>
            <li>Add analytics, then count how many desktop visitors bring the lamp to the headline and how many leave before it lights.</li>
            <li>Watch the searches for Lucide Tech, Tech Lucide and Lucid Tech in Search Console, now that the signals are in place.</li>
            <li>Clear out what v7 left behind: the old LampScene, PageLoader and an unused ambient layer are still in the repository.</li>
          </ul>
        </Prose>
      </Split>
    </Chapter>
  </CasePage>;
}
