import React, { useRef, useState } from 'react';
import { CasePage, CaseHero, Chapter, Prose, Statement, Stage3D, Decision, CodeNote, Ledger, Timeline, Numbers, Reel } from '../kit.jsx';
import '../styles/culprit.css';

/* ------------------------------------------------------------------ */
/* The scorer, implemented from culprit-symptom-distance-spec.md        */
/* ------------------------------------------------------------------ */
const WEIGHTS = { SP: .20, CD: .15, LL: .15, BR: .15, AB: .10, NF: .10, BM: .15 };

const spFrom = frameIndex => frameIndex === null ? 1 : frameIndex === 0 ? 0 : frameIndex <= 2 ? .3 : frameIndex <= 5 ? .6 : 1;
const cdFrom = hops => Math.min(1, Math.max(0, (hops - 1) / 5));
const STOP = new Set(['the', 'and', 'test', 'tests', 'expected', 'const', 'return', 'new', 'from', 'import', 'export', 'function', 'should', 'does']);
const tokens = text => new Set(text.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z]+/).filter(t => t.length > 2 && !STOP.has(t)));
const jaccard = (a, b) => { const both = [...a].filter(t => b.has(t)).length, union = new Set([...a, ...b]).size; return union ? both / union : 0; };
const abFrom = ({ removed, added }) => removed > 0 && added === 0 ? 1 : removed > 0 && added > 0 ? .5 : 0;
const rawScore = s => WEIGHTS.SP * s.SP + WEIGHTS.CD * s.CD + WEIGHTS.LL * s.LL + WEIGHTS.BR * s.BR + WEIGHTS.AB * s.AB + WEIGHTS.NF * s.NF + WEIGHTS.BM * s.BM;
const TIERS = [
  { id: 'Sev4', max: .25, text: 'One file. The trace points at it. A warm-up.' },
  { id: 'Sev3', max: .45, text: 'Two or three files, the symptom one hop from the cause.' },
  { id: 'Sev2', max: .65, text: 'No useful trace. A behavioural symptom. You find the failing test yourself.' },
  { id: 'Sev1', max: .82, text: 'Cross-module. The failing test lives nowhere near the bug. The naive fix is wrong.' },
  { id: 'Sev0', max: 9, text: 'Conditional, state-dependent, or an absence. Held for human review before it ships.' },
];
const tierOf = raw => TIERS.find(t => raw < t.max) || TIERS[4];

/* ------------------------------------------------------------------ */
/* The toy repo for the live challenge                                  */
/* ------------------------------------------------------------------ */
const FILES = [
  { file: 'orders.test.ts', lines: [
    { t: "import { placeOrder } from './order';" },
    { t: "import { cart } from './fixtures';" },
    { t: '' },
    { t: "it('totals a discounted order', () => {", fn: 'test' },
    { t: "  const order = placeOrder(cart, 'SUMMER25', '2026-08-31T12:00');", fn: 'test' },
    { t: '  expect(order.total).toBe(74.99);', fn: 'test' },
    { t: '});', fn: 'test' },
  ] },
  { file: 'order.ts', lines: [
    { t: 'export function placeOrder(cart, code, at) {', fn: 'placeOrder' },
    { t: '  const subtotal = sumLines(cart.lines);', fn: 'placeOrder' },
    { t: '  const promo = findPromo(code);', fn: 'placeOrder' },
    { t: '  const off = promo && isActive(promo, at) ? promo.percent : 0;', fn: 'placeOrder' },
    { t: '  return { subtotal, total: round2(subtotal * (1 - off / 100)) };', fn: 'placeOrder' },
    { t: '}', fn: 'placeOrder' },
  ] },
  { file: 'cart.ts', lines: [
    { t: 'export const sumLines = lines =>', fn: 'sumLines' },
    { t: '  lines.reduce((sum, l) => sum + l.price * l.qty, 0);', fn: 'sumLines' },
  ] },
  { file: 'money.ts', lines: [
    { t: 'export const round2 = n =>', fn: 'round2' },
    { t: '  Math.round(n * 100) / 100;', fn: 'round2' },
  ] },
  { file: 'promo.ts', lines: [
    { t: "import { endOfDay } from './dates';" },
    { t: '' },
    { t: 'const PROMOS = {', fn: 'findPromo' },
    { t: "  SUMMER25: { percent: 25, endsOn: '2026-08-31' },", fn: 'findPromo' },
    { t: '};', fn: 'findPromo' },
    { t: 'export const findPromo = code => PROMOS[code];', fn: 'findPromo' },
    { t: '' },
    { t: 'export const isActive = (promo, at) =>', fn: 'isActive' },
    { t: '  new Date(at) <= endOfDay(promo.endsOn);', fn: 'isActive' },
  ] },
  { file: 'dates.ts', lines: [
    { t: 'export function endOfDay(day) {', fn: 'endOfDay' },
    { t: '  const d = new Date(day);', fn: 'endOfDay' },
    { t: '  return d;', fn: 'endOfDay' },
    { t: '}', fn: 'endOfDay' },
  ] },
];
const GHOST = '  d.setHours(23, 59, 59, 999);';
const FN_FILE = { test: 'orders.test.ts', placeOrder: 'order.ts', sumLines: 'cart.ts', round2: 'money.ts', findPromo: 'promo.ts', isActive: 'promo.ts', endOfDay: 'dates.ts' };
const FN_LABEL = { test: 'The failing test', placeOrder: 'placeOrder', sumLines: 'sumLines', round2: 'round2', findPromo: 'findPromo', isActive: 'isActive', endOfDay: 'endOfDay' };
const CALLS = [['test', 'placeOrder'], ['placeOrder', 'sumLines'], ['placeOrder', 'round2'], ['placeOrder', 'findPromo'], ['placeOrder', 'isActive'], ['isActive', 'endOfDay']];
const CULPRIT = 'endOfDay', SYMPTOM = 'test';

// Hops in the static call graph, treated as undirected so a guess upstream and downstream both measure distance.
function hopsFrom(start) {
  const dist = { [start]: 0 }, queue = [start];
  while (queue.length) {
    const cur = queue.shift();
    for (const [a, b] of CALLS) {
      const next = a === cur ? b : b === cur ? a : null;
      if (next && dist[next] === undefined) { dist[next] = dist[cur] + 1; queue.push(next); }
    }
  }
  return dist;
}
const DIST = hopsFrom(CULPRIT);
const TEST_TO_BUG_HOPS = hopsFrom(SYMPTOM)[CULPRIT];

const TEST_TOKENS = tokens('totals a discounted order expected 99.99 to be 74.99 orders.test.ts');
const BUG_TOKENS = tokens('dates.ts endOfDay const d = new Date(day) return d');
const PATCH = { removed: 1, added: 0 };
const TOY_BLAST = { touching: 12, passing: 11 };

const distanceText = d => d === 0 ? 'That is the function. The cause lives here.' : d === 1 ? 'One call away from the cause.' : `${d} calls away from the cause.`;

/* ------------------------------------------------------------------ */
/* Chapter 2: two bugs, one distance                                     */
/* ------------------------------------------------------------------ */
const CASES = {
  near: {
    label: 'The test names the bug',
    nodes: ['coupon.test', 'applyCoupon', 'cart', 'tax', 'format'], test: 0, bug: 1,
    testWords: 'test_coupon_expiry', bugWords: 'coupon.ts applyCoupon expiry', frame: 0, hops: 1,
    says: 'The test is called test_coupon_expiry and the bug sits in applyCoupon. Ctrl-F finds it in five seconds. The spec caps any problem like this at Sev4.',
  },
  far: {
    label: 'The test names nothing',
    nodes: ['orders.test', 'placeOrder', 'isActive', 'endOfDay', 'format'], test: 0, bug: 3,
    testWords: 'totals a discounted order orders.test.ts', bugWords: 'dates.ts endOfDay const d new Date day return d', frame: null, hops: 3,
    says: 'The trace names only the test file. Nothing in it shares a word with the cause. You have to follow calls to get there. This is the money case in the spec.',
  },
};

function TwoBugs() {
  const [key, setKey] = useState('far');
  const c = CASES[key];
  const leak = 1 - jaccard(tokens(c.testWords), tokens(c.bugWords));
  const rows = [
    ['Stack proximity', spFrom(c.frame)],
    ['Call-graph distance', cdFrom(c.hops)],
    ['Lexical leak', leak],
  ];
  const slot = i => 70 + i * 150;
  return <div className="twobugs" data-reveal>
    <div className="case-controls" role="group" aria-label="Choose a bug">
      {Object.entries(CASES).map(([id, item]) => <button key={id} type="button" className="case-chip" aria-pressed={key === id} onClick={() => setKey(id)}>{item.label}</button>)}
    </div>
    <div className="twobugs-map">
      <svg viewBox="0 0 800 190" role="img" aria-label={`${c.nodes[c.test]} fails. The bug is in ${c.nodes[c.bug]}, ${c.hops} ${c.hops === 1 ? 'call' : 'calls'} away.`}>
        {c.nodes.slice(0, -1).map((n, i) => <rect key={`l${i}`} x={slot(i)} y="86" width="150" height="8" fill="#d8d3c8"/>)}
        {c.nodes.map((n, i) => {
          const isTest = i === c.test, isBug = i === c.bug;
          return <g key={n} transform={`translate(${slot(i) - 54} 52)`}>
            <rect width="108" height="76" rx="14" fill={isTest ? '#30312e' : isBug ? '#ed5939' : '#e8e4db'}/>
            <text x="54" y="44" textAnchor="middle" fontSize="16" fontWeight="650" fill={isTest || isBug ? '#fff' : '#30312e'}>{n.length > 12 ? n.slice(0, 11) + '…' : n}</text>
          </g>;
        })}
        <text x={slot(c.test)} y="30" textAnchor="middle" fontSize="17" fontWeight="650" fill="#30312e">hurts here</text>
        <text x={slot(c.bug)} y="164" textAnchor="middle" fontSize="17" fontWeight="650" fill="#b93c24">bug is here</text>
      </svg>
    </div>
    <dl className="twobugs-rows">
      {rows.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value.toFixed(2)}</dd></div>)}
    </dl>
    <p className="case-caption" aria-live="polite">{c.says}{leak < .4 && ' Lexical leak under 0.4 means the problem is capped at Sev4, whatever else is true.'}</p>
  </div>;
}

/* ------------------------------------------------------------------ */
/* Chapter 3: the live hunt                                              */
/* ------------------------------------------------------------------ */
function Hunt() {
  const stage = useRef(null);
  const [open, setOpen] = useState('orders.test.ts');
  const [opened, setOpened] = useState(['orders.test.ts']);
  const [guesses, setGuesses] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [says, setSays] = useState('Pick a line. Each guess reports how many calls away the cause is.');
  const [blind, setBlind] = useState(0);
  const [naive, setNaive] = useState('trap');

  const openFile = file => { setOpen(file); setOpened(list => list.includes(file) ? list : [...list, file]); };
  const reveal = () => { setRevealed(true); stage.current?.send('reveal'); };
  const guess = id => {
    if (revealed) return;
    if (guesses.some(g => g.id === id)) { setSays(`You already tried ${FN_LABEL[id]}. It is ${DIST[id]} ${DIST[id] === 1 ? 'call' : 'calls'} away.`); return; }
    const entry = { id, distance: DIST[id] };
    setGuesses(list => [...list, entry]);
    stage.current?.send('guess', entry);
    setSays(`${FN_LABEL[id]}: ${distanceText(entry.distance)}`);
    if (!opened.includes(FN_FILE[id])) setOpened(list => [...list, FN_FILE[id]]);
    if (entry.distance === 0) reveal();
  };
  const reset = () => { setGuesses([]); setRevealed(false); setOpen('orders.test.ts'); setOpened(['orders.test.ts']); setSays('Pick a line. Each guess reports how many calls away the cause is.'); stage.current?.send('reset'); };
  const onEvent = (name, id) => { if (name === 'pick') { guess(id); openFile(FN_FILE[id]); } };

  const file = FILES.find(f => f.file === open);
  const lines = file.lines.slice();
  if (revealed && open === 'dates.ts') lines.splice(2, 0, { t: GHOST, ghost: true });
  const guessed = id => guesses.find(g => g.id === id);

  const signals = {
    SP: spFrom(null), CD: cdFrom(TEST_TO_BUG_HOPS), LL: 1 - jaccard(TEST_TOKENS, BUG_TOKENS),
    BR: TOY_BLAST.passing / TOY_BLAST.touching, AB: abFrom(PATCH),
    NF: naive === 'trap' ? 1 : naive === 'broken' ? .6 : 0, BM: 1 - blind / 3,
  };
  const raw = rawScore(signals), tier = tierOf(raw), rejected = blind >= 2;

  return <div className="hunt" id="try">
    <div className="hunt-ticket" data-reveal>
      <div className="hunt-report">
        <p className="hunt-label">Bug report</p>
        <p>Customers using SUMMER25 on the last day of the sale are charged full price. Started after Tuesday&rsquo;s deploy.</p>
        <p className="case-caption">No file names, no test names. That is the spec&rsquo;s rule for the statement.</p>
      </div>
      <div className="hunt-fail" data-ui>
        <pre><code>{`FAIL  orders.test.ts > totals a discounted order
AssertionError: expected 99.99 to be 74.99
  at orders.test.ts:6

Tests  1 failed`}</code></pre>
      </div>
    </div>

    <div className="hunt-board">
      <div className="hunt-editor" data-reveal data-ui>
        <div className="hunt-tabs" role="tablist" aria-label="Files">
          {FILES.map(f => <button key={f.file} type="button" role="tab" aria-selected={open === f.file} onClick={() => openFile(f.file)}>{f.file}</button>)}
        </div>
        <pre className="hunt-code"><code>{lines.map((line, i) => {
          const g = line.fn && guessed(line.fn);
          const first = line.fn && file.lines.find(l => l.fn === line.fn) === line;
          const number = line.ghost ? '−' : file.lines.indexOf(line) + 1;
          if (!line.fn && !line.ghost) return <span key={i} className="hline is-idle"><span className="hnum">{number}</span><span className="htext">{line.t || ' '}</span>{'\n'}</span>;
          if (line.ghost) return <span key={i} className="hline is-ghost"><span className="hnum">{number}</span><span className="htext">{line.t}</span>{'\n'}</span>;
          return <button key={i} type="button" className={`hline ${g ? 'is-guessed' : ''} ${revealed && line.fn === CULPRIT ? 'is-cause' : ''}`} onClick={() => guess(line.fn)} disabled={revealed} aria-label={`Line ${number}: ${line.t.trim()}. Guess ${FN_LABEL[line.fn]}.`}>
            <span className="hnum">{number}</span><span className="htext">{line.t}</span>{first && g && <span className="hdist" aria-hidden="true">{g.distance}</span>}
          </button>;
        })}</code></pre>
        <p className="hunt-meta">Files opened: {opened.length}. Guesses: {guesses.length}.</p>
      </div>

      <div className="hunt-side">
        <div className="case-stage-block hunt-stage" data-reveal>
          <Stage3D ref={stage} scene={() => import('../scenes/culpritTrail.js')} onEvent={onEvent}
            label="A ceramic map of the toy repo. Files are plinths, functions are stacks of line slabs. Guesses plant pegs showing their distance from the bug."
            fallback={<svg viewBox="0 0 400 300" width="100%" aria-hidden="true"><rect x="30" y="170" width="120" height="70" rx="12" fill="#e8e4db"/><rect x="250" y="120" width="120" height="70" rx="12" fill="#e8e4db"/><rect x="190" y="200" width="90" height="60" rx="12" fill="#e8e4db"/><rect x="60" y="130" width="46" height="40" rx="6" fill="#30312e"/><rect x="278" y="84" width="48" height="36" rx="6" fill="#ed5939"/></svg>}/>
        </div>
        <p className="hunt-says" aria-live="polite">{says}</p>
        <div className="case-controls">
          {!revealed && <button type="button" className="case-chip" onClick={reveal}>Reveal the mutation</button>}
          <button type="button" className="case-chip" onClick={reset}>Start over</button>
        </div>
      </div>
    </div>

    {guesses.length > 0 && <ol className="hunt-log" data-reveal>{guesses.map((g, i) => <li key={g.id}><span>Guess {i + 1}</span><strong>{FN_LABEL[g.id]}</strong><span>{g.distance === 0 ? 'the cause' : `${g.distance} ${g.distance === 1 ? 'call' : 'calls'} away`}</span></li>)}</ol>}

    {revealed && <div className="hunt-result">
      <div className="hunt-mutation">
        <h3>The mutation was a deleted line</h3>
        <p>In <strong>dates.ts</strong>, <strong>endOfDay</strong> lost the line that moves the time to 23:59:59. The promotion now ends at midnight, so an order at noon on the last day is too late and the discount never applies.</p>
        <div data-ui className="hunt-diff"><pre><code>{`dates.ts
  export function endOfDay(day) {
    const d = new Date(day);
-   d.setHours(23, 59, 59, 999);
    return d;
  }`}</code></pre></div>
        <p className="case-caption">{guesses.length ? `You made ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'} and opened ${opened.length} of 6 files.` : 'You revealed it without guessing.'} The symptom was three calls from the cause. That gap is what the scorer prices.</p>
      </div>

      <div className="hunt-score" data-ui>
        <div className="score-head">
          <p className="score-raw" aria-live="polite">{rejected ? 'Rejected' : raw.toFixed(2)}</p>
          <p className="score-tier">{rejected ? 'The blind model solves it two times out of three. Cheatable, so it contributes nothing.' : `${tier.id}. ${tier.text}`}</p>
        </div>
        <ul className="score-rows">
          <SignalRow name="Stack proximity" w={WEIGHTS.SP} v={signals.SP} basis="measured" note="The trace names only orders.test.ts. dates.ts is absent from it."/>
          <SignalRow name="Call-graph distance" w={WEIGHTS.CD} v={signals.CD} basis="measured" note={`${TEST_TO_BUG_HOPS} hops from the test to endOfDay in the call graph, so (${TEST_TO_BUG_HOPS} - 1) / 5.`}/>
          <SignalRow name="Lexical leak" w={WEIGHTS.LL} v={signals.LL} basis="measured" note={`Words in the test: ${[...TEST_TOKENS].join(', ')}. Words at the bug: ${[...BUG_TOKENS].join(', ')}. Overlap ${jaccard(TEST_TOKENS, BUG_TOKENS).toFixed(2)}.`}/>
          <SignalRow name="Blast radius" w={WEIGHTS.BR} v={signals.BR} basis="set by me" note={`I said ${TOY_BLAST.passing} of ${TOY_BLAST.touching} tests that touch dates.ts still pass. High means the bug is conditional.`}/>
          <SignalRow name="Absence bonus" w={WEIGHTS.AB} v={signals.AB} basis="measured" note={`${PATCH.removed} line removed, ${PATCH.added} added: a pure deletion.`}/>
          <SignalRow name="Naive-fix trap" w={WEIGHTS.NF} v={signals.NF} basis="set by me" note="A cheap model sees only the failing test and trace and writes a patch.">
            <div className="case-controls" role="group" aria-label="Naive fix outcome">
              {[['trap', 'Greens the test, breaks a hidden one'], ['broken', 'Does not compile'], ['fixed', 'Fixes it correctly']].map(([id, label]) => <button key={id} type="button" className="case-chip" aria-pressed={naive === id} onClick={() => setNaive(id)}>{label}</button>)}
            </div>
          </SignalRow>
          <SignalRow name="Blind-model baseline" w={WEIGHTS.BM} v={signals.BM} basis="set by me" note="A frontier model gets the failure output and the files in the trace, no repo, three tries.">
            <div className="case-controls" role="group" aria-label="Blind model solves">
              {[0, 1, 2, 3].map(n => <button key={n} type="button" className="case-chip" aria-pressed={blind === n} onClick={() => setBlind(n)}>Solves {n} of 3</button>)}
            </div>
          </SignalRow>
        </ul>
        <p className="case-caption">Formula, weights and tiers are the spec&rsquo;s. The repo is a toy I wrote for this page. This page cannot run tests or call a model, so those three signals are values you can set. The hard gates are checked by hand here: it compiles, one test flips red, one line changed in one file.</p>
      </div>
    </div>}
  </div>;
}

function SignalRow({ name, w, v, basis, note, children }) {
  return <li className="score-row">
    <div className="score-line"><strong>{name}</strong><span className="score-v">{v.toFixed(2)} &times; {w.toFixed(2)} = {(v * w).toFixed(3)}</span></div>
    <span className="score-bar" aria-hidden="true"><i style={{ width: `${v * 100}%` }}/></span>
    <p>{note} <em>{basis === 'measured' ? 'Computed from the code on this page.' : 'Set by me.'}</em></p>
    {children}
  </li>;
}

/* ------------------------------------------------------------------ */
/* Chapter 4: severity ladder                                            */
/* ------------------------------------------------------------------ */
function SevLadder() {
  const [value, setValue] = useState(86);
  const raw = value / 100, tier = tierOf(raw);
  const bands = [[0, .25], [.25, .45], [.45, .65], [.65, .82], [.82, 1]];
  return <div className="sev" data-reveal>
    <div className="sev-bar" aria-hidden="true">
      {bands.map(([a, b], i) => <span key={i} style={{ width: `${(b - a) * 100}%` }} data-on={tier.id === TIERS[i].id}>{TIERS[i].id}</span>)}
      <i style={{ left: `${value}%` }}/>
    </div>
    <label className="sev-slider"><span>Raw score {raw.toFixed(2)}</span>
      <input type="range" min="0" max="100" value={value} onChange={e => setValue(+e.target.value)} aria-valuetext={`${raw.toFixed(2)}, ${tier.id}`}/>
    </label>
    <p className="sev-read" aria-live="polite"><strong>{tier.id}.</strong> {tier.text}</p>
  </div>;
}

/* ------------------------------------------------------------------ */
/* Chapter 7: the v1 pipeline                                            */
/* ------------------------------------------------------------------ */
function Pipeline() {
  const edit = [
    ['Monaco', 'Edits write into filesState, one object per virtual file.'],
    ['Babel Standalone', 'Compiles JSX and ES modules in the browser, from a CDN.'],
    ['require() loader', 'Resolves relative imports against the virtual file tree. Caches modules, injects CSS.'],
    ['React render', 'Mounts the entry component inside an error boundary that shows runtime errors.'],
  ];
  const test = [
    ['Run Tests', 'Calls each visibleTests[].check(filesState).'],
    ['Check functions', 'Plain JavaScript over the file text. No test runner.'],
    ['Tests panel', 'Draws a pass or fail tree, Jest style.'],
  ];
  return <div className="pipeline" data-reveal>
    <ol className="flow flow-4">{edit.map(([t, b]) => <li key={t}><strong>{t}</strong><span>{b}</span></li>)}</ol>
    <ol className="flow flow-3">{test.map(([t, b]) => <li key={t}><strong>{t}</strong><span>{b}</span></li>)}</ol>
  </div>;
}

const heroFallback = <svg viewBox="0 0 520 420" width="100%" aria-hidden="true">
  <rect x="40" y="250" width="200" height="110" rx="18" fill="#e8e4db"/><rect x="280" y="210" width="200" height="110" rx="18" fill="#e8e4db"/>
  <rect x="70" y="170" width="70" height="80" rx="8" fill="#f7f4ed"/><rect x="70" y="196" width="70" height="14" rx="4" fill="#ed5939"/>
  <rect x="330" y="130" width="76" height="80" rx="8" fill="#f7f4ed"/><rect x="334" y="104" width="76" height="22" rx="6" fill="#30312e" transform="rotate(6 372 115)"/>
</svg>;

export default function Culprit() {
  const [note, setNote] = useState('Drag to turn it. Click the cracked block, then the one with the coral slab.');
  const onEvent = (name, file) => {
    if (name === 'symptom') setNote(`The failure shows up in ${file}. Follow the markers to the cause.`);
    else if (name === 'culprit') setNote(`The cause was in ${file}, a different place from the failure.`);
    else setNote(`${file}: nothing wrong here. Keep looking.`);
  };

  return <CasePage slug="culprit">
    <CaseHero
      name="Culprit"
      title="The bug is not where it hurts."
      lede="Culprit scores a bug by the distance between its symptom and its cause. I wrote the scoring spec, planned the build in eight versions, and built the reading half as a working prototype."
      facts={[
        { label: 'Role', value: 'Product concept, spec and prototype' },
        { label: 'Timeline', value: 'July to August 2026' },
        { label: 'Stack', value: 'Next.js 16, React 19, Monaco, Babel Standalone' },
        { label: 'Status', value: 'Spec and v1 prototype built. The rest is roadmap.' },
      ]}
      links={[{ href: '#try', label: 'Find the bug' }, { href: '#roadmap', label: 'See the roadmap' }]}
      note={note}
      stage={<Stage3D eager scene={() => import('../scenes/culprit.js')} onEvent={onEvent} fallback={heroFallback} label="A codebase built as a ceramic city. Files are plinths and functions are stacks of line slabs. One coral slab is the bug. A cracked, lifted block far away is the failure. A trail of coral markers joins them."/>}
    />

    <Chapter id="problem" title="The problem" heading="Debugging is search, not recall.">
      <Split>
        <div>
          <Prose>
            <p>Algorithm sites test whether you can write something. Real debugging is a different job. You read a failing test, read the trace, open a file, search, follow a call, and test a guess.</p>
            <p>The skill is <strong>where you have to look, compared with where you started.</strong> A bug that sits in a function named in the test is a lookup. A bug three calls away, in a file the trace never mentions, is production.</p>
          </Prose>
          <Statement cite="The bet behind Culprit">Debugging is navigation, not computation.</Statement>
        </div>
        <TwoBugs/>
      </Split>
    </Chapter>

    <Chapter id="hunt" title="Find the bug" heading="Place a guess. See the distance." tone="paper" wide>
      <Prose>
        <p>This is a working miniature of the scorer&rsquo;s idea. The report and the failing test are below. Click the lines where you think the bug lives, or the blocks in the model. Every guess says how many calls away the cause is. Reveal the mutation and the spec&rsquo;s formula prices it.</p>
        <p>The repo is a toy I wrote for this page. It is not one of the thirty challenges in the prototype.</p>
      </Prose>
      <div className="case-gap"/>
      <Hunt/>
    </Chapter>

    <Chapter id="scorer" title="The scorer" heading="The weights are guesses. I said so." tone="ink">
      <Split>
        <div>
          <Prose>
            <p>The scorer takes seven signals, each between 0 and 1, and a weighted sum maps to a severity from Sev4 down to Sev0. Most signals are adversarial. They ask whether a problem can be shortcut, not whether it looks tricky.</p>
            <p>The spec says of its own weights: <strong>&ldquo;Do not defend them.&rdquo;</strong> They exist so the pipeline has a number today. After the first in-person contest I regress them against real human solve times and throw them away.</p>
          </Prose>
          <div className="case-gap"/>
          <SevLadder/>
        </div>
        <CodeNote file="culprit-symptom-distance-spec.md" language="text" code={`frame_index = position of injected file in the trace (0 = top frame)

SP = 0.0   if frame_index == 0        # trace points straight at the bug. Free.
   = 0.3   if frame_index in 1..2
   = 0.6   if frame_index in 3..5
   = 1.0   if injected file is absent from the trace entirely

raw = 0.20·SP + 0.15·CD + 0.15·LL + 0.15·BR + 0.10·AB + 0.10·NF + 0.15·BM`} caption="One signal and the composite, copied from the spec. Absent from the trace is the case the product exists for."/>
      </Split>
    </Chapter>

    <Chapter id="decisions" title="Decisions" heading="Cheating is designed out, not policed.">
      <Decision
        title="Show a bug report, never the stack trace"
        problem="Hand someone the failing test name and the trace and the first move is Ctrl-F. The problem then measures reading speed, not debugging."
        chosen="report"
        options={[
          { id: 'trace', label: 'Show the failing test and trace', body: 'Easy to build and easy to solve. Every problem points at the place to start.', cost: 'The test name gives the answer away. The lexical leak signal exists to measure exactly this, and caps any problem that leaks at Sev4.' },
          { id: 'report', label: 'Write a customer bug report', body: 'The statement generator writes what a customer would say: customers with a coupon expiring today are charged full price. No file names, no test names, no trace. Finding the failing test is part of the work.', cost: 'Easy problems get harder by accident, because nothing points at them. The severity tiers are the answer on paper and I have not tested it with people. My own prototype also breaks the rule: its ticket panel prints the file location.' },
        ]}/>
      <Decision
        title="Make cheating pointless instead of watching for it"
        problem="Judges that rely on clipboard and screen monitoring are costly and annoying, and a model on a second screen walks around them."
        chosen="design"
        options={[
          { id: 'monitor', label: 'Monitor the candidate', body: 'Clipboard monitoring, environment isolation, screen recording.', cost: 'The spec says one rule does more for contest integrity than a year of clipboard engineering: reject any problem a blind model solves two times out of three.' },
          { id: 'design', label: 'Fresh problems, process scoring, top-N checks', body: 'Contest problems are new mutations nobody has seen. The blind-model baseline rejects cheatable ones at generation. A pasted one-shot diff with zero test runs and zero file opens scores worse than an honest solve. The top ten of each rated contest get a live follow-up: a mutation of the bug they just fixed, and explain your root cause.', cost: 'It needs fresh problems forever and a human at the top of every contest. None of it is built yet.' },
          { id: 'agent', label: 'Let them use AI, openly', body: 'Version five puts a repo-aware agent in the app, built to be strictly better than anything smuggled in through screenshots. Transcripts become a second ladder.', cost: 'It does not replace the other measures. Its exit test is that AI should not help equally at Sev0, or the hard problems are not hard.' },
        ]}/>
      <Decision
        title="Rate with Glicko-2, then replace my own weights"
        problem="A new platform has few players who show up irregularly. The rating still has to separate good debuggers from bad ones."
        chosen="glicko"
        options={[
          { id: 'elo', label: 'Elo', body: 'Simple and familiar.', cost: 'It needs a density of games a new platform will not have.' },
          { id: 'glicko', label: 'Glicko-2', body: 'It handles low volume and irregular participation, which is exactly how a new platform looks.', cost: 'I do not know yet whether ratings converge when a hundred people solve a problem or two each. Version six has a kill test: if the best and worst engineers land within 100 points, the rating measures nothing.' },
          { id: 'weights', label: 'Ship the spec weights as final', body: 'The seven weights give the pipeline a number today.', cost: 'They are guesses. After Contest Zero, 10 to 30 people in a room, I regress them against median human solve times.' },
        ]}/>
    </Chapter>

    <Chapter id="prototype" title="The prototype" heading="I built the reading half first." tone="paper">
      <Prose>
        <p>The roadmap puts a read-only renderer ahead of any container, to test the riskiest UX bet cheaply: whether a file tree, a real editor and search teach debugging. What I built is a looser version of that. You can edit, and the tests are simulated. It runs thirty hand-written challenges in the browser.</p>
      </Prose>
      <div className="case-gap"/>
      <Reel label="Screens from the working prototype" shots={[
        { src: '/cases/culprit/editor-tests.jpg', alt: 'The Culprit editor on challenge 3.1 with the Tests tab showing 0 of 6 tests passed and failing assertions listed.', caption: 'Challenge 3.1 after Run Tests. File tree on the left, Monaco in the middle, the ticket on the right. Six failing checks.', address: 'localhost:4197/editor?challenge=3.1', priority: true },
        { src: '/cases/culprit/editor-preview.jpg', alt: 'The Preview view showing an AuthProvider sandbox stuck on Please Sign In.', caption: 'The symptom: the preview says Please Sign In. One of the causes is in a different file, apiClient.js. Distance, in a real challenge.', address: 'localhost:4197/editor?challenge=3.1' },
        { src: '/cases/culprit/editor-1-1.jpg', alt: 'The editor on challenge 1.1, Dashboard Card Grid Overflow, with five files in the tree.', caption: 'Challenge 1.1 opens on a different file from the one with the bug. The ticket says where it is. The roadmap says it should not.', address: 'localhost:4197/editor?challenge=1.1' },
        { src: '/cases/culprit/landing-1.jpg', alt: 'The landing page showing a mock editor window demonstrating fixing a bug in Monaco.', caption: 'The landing page. The leaderboard and the rank it shows are mock data.', address: 'localhost:4197' },
      ]}/>
      <div className="case-gap"/>
      <Ledger mineTitle="What works" othersTitle="What is a placeholder"
        mine={['A Next.js app with a landing page, an editor workspace and a full-screen preview', 'Monaco with a file tree, tabs and a live preview that recompiles on every edit', 'Thirty challenges across UI rendering, responsive design and authentication, five easy and five medium in each', 'The scoring spec and the version plan behind it']}
        others={['Run Tests runs check functions over file text. It is not a test runner', 'The terminal output is mocked', 'The hidden tests field exists and is unused', 'One dark theme. The theme button opens a coming-soon modal', 'The challenges are hand-written. The mutation injector is not built', 'No accounts, no submissions, no ratings']}/>
    </Chapter>

    <Chapter id="runtime" title="Under the hood" heading="The browser is the whole runtime." tone="ink">
      <Pipeline/>
      <div className="case-gap"/>
      <Split>
        <CodeNote file="culprit-v1/src/components/AppPreview.jsx" code={`transpiled = Babel.transform(code, {
  presets: ['react'],
  plugins: ['transform-modules-commonjs']
}).code;

const requireMock = (importPath) => {
  if (importPath === 'react') {
    return React;
  }
  // …
  const resolved = resolvePath(file.path, importPath);
  return executeModule(resolved);
};

const fn = new Function('React', 'require', 'exports', 'module', transpiled);
fn(React, requireMock, module.exports, module);`} caption="Each virtual file is compiled, then run with a require() that looks inside the challenge's own file tree."/>
        <Decision
          title="Compile in the browser before running containers"
          problem="Version one has to prove the reading experience before I pay for infrastructure."
          chosen="browser"
          options={[
            { id: 'containers', label: 'Server containers first', body: 'Real shells, real test runs, hidden tests the client never touches.', cost: 'Expensive and slow to start. I would be building the costliest part before knowing whether anyone enjoys reading code in a browser. They arrive in version two.' },
            { id: 'browser', label: 'Babel in the browser', body: 'Challenge files are plain objects. Babel Standalone compiles them on the client and a custom loader resolves the imports. No server at all.', cost: 'It cannot run npm packages or server code, so it only fits pure React challenges, and the tests are simulated.' },
            { id: 'webcontainers', label: 'WebContainers', body: 'Free compute, and real Node in the tab.', cost: 'The roadmap rejects it for the real thing: the client can tamper with everything, and StackBlitz needs a commercial licence. It may come back later as a cost optimisation for practice mode.' },
          ]}/>
      </Split>
      <div className="case-gap"/>
      <Numbers items={[
        { label: 'Challenges', value: '30', note: 'Six files of five. Easy and medium in three categories.' },
        { label: 'Lines in src', value: '13,521', note: '7,069 of them are challenge definitions.' },
        { label: 'Commits', value: '5', note: '22 July to 5 August 2026.' },
        { label: 'Signals in the scorer', value: '7', note: 'Behind six hard gates.' },
      ]}/>
    </Chapter>

    <Chapter id="roadmap" title="Roadmap" heading="Every version has a kill switch.">
      <Prose>
        <p>Each version ships one slice and has an exit test. If it fails, I fix it or I kill the project. Only the spec and a looser version one exist. Drag through the rest.</p>
      </Prose>
      <div className="case-gap"/>
      <Timeline label="Versions" items={[
        { date: 'v0', title: 'The Foundry', body: 'No UI. The mutation injector and scorer, three seed repos, twenty accepted problems tiered Sev4 to Sev1, and a blind-model baseline recorded for each. Exit: yield between 5 and 15 percent, blind solve rate under 20 percent, and I solve five blind with none feeling fake. If those five feel arbitrary, I stop the whole project here. Not built.' },
        { date: 'v1', title: 'The Renderer', body: 'Read-only: bug report, file tree, Monaco with go-to-definition and find-references, no terminal and no editing. Exit: five engineers get a Sev2 and have twenty minutes to say where the bug is. What I built is a looser prototype of this, with editing and simulated tests.' },
        { date: 'v2', title: 'The Environment', body: 'A server container per session, a real xterm.js terminal, vitest output parsed into a pass and fail tree, an idle reaper at fifteen minutes, and event logging from day one. Exit: cold start under 3 seconds at p50 and under 6 at p95. Over 8 seconds means the wrong sandbox. Not built.' },
        { date: 'v3', title: 'The Judge', body: 'Submit sends the diff to a fresh cold container. Four gates: hidden suite green, nothing that passed broke, no test files touched, not a revert. The verdict page shows your diff beside the canonical fix. Exit: a correct fix, a symptom patch and a test-file edit all get the right verdict. Not built.' },
        { date: 'v4', title: 'The Ladder', body: 'First public version. Solo and unrated, GitHub sign-in, a problem list by severity, a profile with process stats, editorials on solved problems only. Exit: 100 people solve one problem and day-seven retention is above 15 percent. Not built.' },
        { date: 'v5', title: 'The Agent', body: 'A repo-aware assistant in the app, with full transcript capture and derived scores: prompts to a correct hypothesis, verification rate, pushback rate. A separate ladder. Exit: AI users are faster only on Sev3 and above. It is also a dataset of people debugging with AI against known ground truth. Not built.' },
        { date: 'v6', title: 'Contests and rating', body: 'Two-hour windows, five never-seen problems, Glicko-2 per ladder, process telemetry in the score. Contest Zero runs in person with 10 to 30 people. Exit: the rating distribution separates. Then the scorer weights are re-fitted to human solve times. Not built.' },
        { date: 'v7', title: 'The Trust Layer', body: 'The MVP. Top-N live verification, a public leaderboard that puts frontier models on the same fresh problems beside humans, a shareable rating card, private contests for companies. The credential is the business. Not built.' },
      ]}/>
      <div className="case-gap"/>
      <Statement cite="From the roadmap">The first public post is the AI baseline table from version zero.</Statement>
      <Prose>
        <p>Twenty bugs, and how the frontier models did on them. It needs no product.</p>
        <p><strong>What I would do next:</strong> stop adding screens. Build the Foundry. Everything after it is decoration on bad problems, and the only existential risk is that the five bugs I solve blind feel unfair.</p>
      </Prose>
    </Chapter>
  </CasePage>;
}

function Split({ children }) { return <div className="culprit-split">{children}</div>; }
