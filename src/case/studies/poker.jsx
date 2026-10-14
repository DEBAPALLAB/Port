import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../styles/poker.css';
import { CasePage, CaseHero, Chapter, Prose, Statement, Split, Shot, Reel, Decision, CodeNote, Timeline, Numbers, Stage3D } from '../kit.jsx';
import { computeSidePots, splitPot, uncalledRefunds, computeTransfers, fewestTransfers, createSimulation } from '../scenes/pokerEngine.js';

const heroScene = () => import('../scenes/pokerHero.js');
const potsScene = () => import('../scenes/pokerPots.js');

const NAMES = ['Ana', 'Ben', 'Cy', 'Dee'];
const DEALER = 3; // Dee holds the button, so odd chips go to Ana first (the seat closest to her left).
const PRESETS = [
  { id: 'tiers', label: 'Three tiers', stacks: [60, 150, 400, 400], bets: [60, 150, 250, 250], folded: [0, 0, 0, 0], ranks: [1, 2, 3, 4], note: 'Ana is all-in for 60, Ben for 150, Cy and Dee for 250. Three pots, three different winners.' },
  { id: 'split', label: 'Odd chip in a tie', stacks: [200, 200, 200, 200], bets: [75, 75, 75, 0], folded: [0, 0, 0, 1], ranks: [1, 1, 2, 4], note: 'Ana and Ben tie for 225. One chip cannot be halved, so it goes to the winner closest left of the button.' },
  { id: 'refund', label: 'Uncalled bet', stacks: [100, 5, 100, 100], bets: [10, 5, 0, 0], folded: [1, 0, 1, 1], ranks: [4, 1, 3, 2], note: 'Ana posts 10 and folds to Ben, who is all-in for 5. The other 5 was never called, so it goes back to Ana.' },
  { id: 'covered', label: 'Everyone covered', stacks: [300, 300, 300, 300], bets: [100, 100, 100, 100], folded: [0, 0, 0, 0], ranks: [2, 1, 3, 4], note: 'Nobody is short, so there is one pot and no side pots.' },
];
const presetPlayers = preset => NAMES.map((name, i) => ({ name, stack: preset.stacks[i], bet: preset.bets[i], folded: !!preset.folded[i], rank: preset.ranks[i] }));

// The same pipeline the server runs at showdown: refund uncalled chips, cut the pots, split ties by the button.
function evaluate(players) {
  const contributions = players.map((p, i) => ({ playerId: String(i), totalCommitted: p.bet, folded: p.folded }));
  const refund = players.map(() => 0);
  uncalledRefunds(contributions).forEach(r => { refund[Number(r.playerId)] = r.amount; });
  const pots = computeSidePots(contributions).map((pot, k) => {
    const eligible = pot.eligiblePlayerIds.map(Number);
    const best = Math.min(...eligible.map(i => players[i].rank));
    const winners = eligible.filter(i => players[i].rank === best);
    const payouts = {};
    splitPot(pot.amount, winners.map(i => ({ id: String(i), seat: i })), DEALER).forEach(share => { payouts[Number(share.id)] = share.amount; });
    return { name: k === 0 ? 'Main pot' : `Side pot ${k}`, amount: pot.amount, eligible, winners, payouts, contributors: players.map((p, i) => i).filter(i => players[i].bet > pot.from) };
  });
  const payout = players.map((_, i) => pots.reduce((sum, pot) => sum + (pot.payouts[i] || 0), 0));
  const nets = players.map((p, i) => ({ id: p.name, net: payout[i] + refund[i] - p.bet }));
  const transfers = computeTransfers(nets);
  return { pots, refund, payout, nets, transfers, fewest: fewestTransfers(nets), committed: players.reduce((s, p) => s + p.bet, 0) };
}

const list = (indexes, names = NAMES) => indexes.map(i => names[i]).join(', ') || 'nobody';

/* ---------------------------------------------------------------- the side-pot table (signature) */
function PotLab() {
  const [players, setPlayers] = useState(() => presetPlayers(PRESETS[0]));
  const [preset, setPreset] = useState('tiers');
  const [phase, setPhase] = useState('stacks');
  const [hot, setHot] = useState(null);
  const [ready, setReady] = useState(false);
  const stage = useRef(null), touched = useRef(false), timers = useRef([]);
  const result = useMemo(() => evaluate(players), [players]);

  const model = useMemo(() => ({
    phase,
    players: players.map((p, i) => ({ name: p.name, stack: p.stack, bet: p.bet, folded: p.folded, allIn: p.bet > 0 && p.bet === p.stack, refund: result.refund[i], payout: result.payout[i] })),
    pots: result.pots.map(pot => ({ name: pot.name, amount: pot.amount, payouts: pot.payouts, contributors: pot.contributors })),
  }), [players, phase, result]);

  useEffect(() => { if (ready) stage.current?.send('model', model); }, [model, ready]);
  useEffect(() => { if (ready) stage.current?.send('highlight', { pot: hot }); }, [hot, ready]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const play = useCallback(() => {
    clear();
    setPhase('stacks');
    [['bets', 1100], ['pots', 2900], ['award', 5200]].forEach(([name, at]) => timers.current.push(setTimeout(() => setPhase(name), at)));
  }, []);
  useEffect(() => clear, []);

  const onEvent = useCallback((name, payload) => {
    if (name === 'ready') {
      setReady(true);
      if (!touched.current) {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) setPhase('pots');
        else { timers.current.push(setTimeout(() => !touched.current && setPhase('bets'), 900), setTimeout(() => !touched.current && setPhase('pots'), 2500)); }
      }
    }
    if (name === 'hover') setHot(payload?.kind === 'pot' ? payload.index : null);
    if (name === 'pick' && payload?.kind === 'seat') { touched.current = true; clear(); setPlayers(list => list.map((p, i) => i === payload.index ? { ...p, folded: !p.folded } : p)); setPhase(current => current === 'stacks' ? 'bets' : current); }
  }, []);

  const touch = () => { touched.current = true; clear(); };
  const edit = (index, patch) => {
    touch();
    setPlayers(list => list.map((p, i) => {
      if (i !== index) return p;
      const next = { ...p, ...patch };
      next.bet = Math.min(next.bet, next.stack);
      return next;
    }));
    setPreset('custom');
    setPhase(current => current === 'stacks' ? 'bets' : current);
  };
  const choose = id => {
    touch();
    const next = PRESETS.find(item => item.id === id);
    setPlayers(presetPlayers(next)); setPreset(id); setPhase('pots');
  };
  const note = PRESETS.find(item => item.id === preset)?.note || 'Your own table. Move a slider, tap a stack to fold that player, change who has the best hand.';
  const phases = [['stacks', 'Stacks'], ['bets', 'Bets'], ['pots', 'Pots'], ['award', 'Award']];

  return <div className="pk-lab">
    <div className="pk-lab-stage" data-reveal>
      <div className="case-stage-block is-tall pk-stage">
        <Stage3D ref={stage} scene={potsScene} label="A ceramic poker table with four players' chip stacks. Chips move into a main pot and side pots, then out to the winners." onEvent={onEvent}
          fallback={<p className="pk-fallback">The 3D table needs WebGL. The pots below still work.</p>}/>
      </div>
      <div className="pk-phases" role="group" aria-label="Show the hand at">
        {phases.map(([id, label]) => <button key={id} type="button" className="case-chip" aria-pressed={phase === id} onClick={() => { touch(); setPhase(id); }}>{label}</button>)}
        <button type="button" className="case-chip pk-play" onClick={() => { touched.current = true; play(); }}>Play the hand</button>
      </div>
    </div>

    <div className="pk-lab-body">
      <div className="pk-controls" data-reveal>
        <div className="case-controls pk-presets" role="group" aria-label="Start from a table">
          {PRESETS.map(item => <button key={item.id} type="button" className="case-chip" aria-pressed={preset === item.id} onClick={() => choose(item.id)}>{item.label}</button>)}
        </div>
        <p className="pk-note" aria-live="polite">{note}</p>
        <div className="pk-players">
          {players.map((p, i) => {
            const allIn = p.bet > 0 && p.bet === p.stack;
            return <fieldset key={p.name} className="pk-player" data-folded={p.folded}>
              <legend>{p.name}{i === DEALER ? ', dealer' : ''}{p.folded ? ', folded' : allIn ? ', all in' : ''}</legend>
              <label className="pk-field"><span>Stack</span><input type="range" min="10" max="1000" step="5" value={p.stack} onChange={e => edit(i, { stack: +e.target.value })}/><output>{p.stack}</output></label>
              <label className="pk-field"><span>Bet</span><input type="range" min="0" max={p.stack} step="5" value={p.bet} onChange={e => edit(i, { bet: +e.target.value })}/><output>{p.bet}</output></label>
              <div className="pk-actions">
                <button type="button" className="case-chip" onClick={() => edit(i, { bet: p.stack })}>All in</button>
                <button type="button" className="case-chip" aria-pressed={p.folded} onClick={() => edit(i, { folded: !p.folded })}>Fold</button>
                <div className="pk-rank" role="group" aria-label={`${p.name} hand rank, 1 is best`}>
                  <button type="button" aria-label={`Rank ${p.name} higher`} disabled={p.rank <= 1} onClick={() => edit(i, { rank: p.rank - 1 })}>−</button>
                  <span>Hand {p.rank}</span>
                  <button type="button" aria-label={`Rank ${p.name} lower`} disabled={p.rank >= 4} onClick={() => edit(i, { rank: p.rank + 1 })}>+</button>
                </div>
              </div>
            </fieldset>;
          })}
        </div>
        <p className="case-caption">Rank 1 is the best hand and equal ranks tie. Folded players put chips in but cannot win. The numbers come from my port of <em>sidePots.ts</em> and <em>settlement.ts</em>, not from a lookalike.</p>
      </div>

      <div className="pk-results" data-reveal>
        <h3>The pots</h3>
        {result.pots.length === 0 ? <p className="pk-empty">Nobody has put anything in.</p> :
          <table className="pk-table">
            <thead><tr><th scope="col">Pot</th><th scope="col">Chips</th><th scope="col">Can win</th><th scope="col">Takes</th></tr></thead>
            <tbody>{result.pots.map((pot, k) => <tr key={k} tabIndex={0} data-hot={hot === k} onMouseEnter={() => setHot(k)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(k)} onBlur={() => setHot(null)}>
              <th scope="row">{pot.name}</th><td>{pot.amount}</td><td>{list(pot.eligible)}</td>
              <td>{Object.keys(pot.payouts).map(i => `${NAMES[i]} ${pot.payouts[i]}`).join(', ')}</td>
            </tr>)}</tbody>
          </table>}
        {result.refund.some(Boolean) && <p className="pk-refund"><strong>Returned, never called:</strong> {result.refund.map((amount, i) => amount ? `${NAMES[i]} ${amount}` : null).filter(Boolean).join(', ')}</p>}
        <p className="pk-sum">Pots {result.pots.reduce((s, p) => s + p.amount, 0)} + returned {result.refund.reduce((a, b) => a + b, 0)} = {result.committed} committed. No chip created, none lost.</p>

        <h3>Who pays whom</h3>
        {result.transfers.length === 0 ? <p className="pk-empty">Nobody owes anybody.</p> :
          <ul className="pk-transfers">{result.transfers.map((t, i) => <li key={i}><span>{t.from}</span> pays <span>{t.to}</span><b>{t.amount}</b></li>)}</ul>}
        <p className="case-caption">{result.transfers.length} transfer{result.transfers.length === 1 ? '' : 's'}. The fewest possible for these balances is {result.fewest}.</p>
      </div>
    </div>
  </div>;
}

/* ---------------------------------------------------------------- settlement counterexample */
const KNOT = [['P', 40], ['Q', 20], ['R', 25], ['S', -40], ['T', 40], ['U', -85]].map(([id, net]) => ({ id, net }));
function Greedy() {
  const [show, setShow] = useState('greedy');
  const greedy = useMemo(() => computeTransfers(KNOT), []);
  const fewest = useMemo(() => fewestTransfers(KNOT), []);
  const best = [{ from: 'S', to: 'P', amount: 40 }, ...(() => {
    const rest = KNOT.filter(n => n.id !== 'S' && n.id !== 'P');
    return computeTransfers(rest);
  })()];
  const rows = show === 'greedy' ? greedy : best;
  return <div className="pk-greedy" data-reveal>
    <div className="pk-nets" aria-label="Net balances">{KNOT.map(n => <span key={n.id} data-sign={n.net > 0 ? 'up' : 'down'}>{n.id}<b>{n.net > 0 ? '+' : ''}{n.net}</b></span>)}</div>
    <div className="case-controls" role="group" aria-label="Settlement method">
      <button type="button" className="case-chip" aria-pressed={show === 'greedy'} onClick={() => setShow('greedy')}>The code: largest with largest</button>
      <button type="button" className="case-chip" aria-pressed={show === 'best'} onClick={() => setShow('best')}>Settle P and S first</button>
    </div>
    <ul className="pk-transfers pk-transfers-light">{rows.map((t, i) => <li key={show + i}><span>{t.from}</span> pays <span>{t.to}</span><b>{t.amount}</b></li>)}</ul>
    <p className="pk-greedy-count">{rows.length} transfers{show === 'greedy' ? ` here. The fewest possible is ${fewest}.` : ', the fewest possible. P and S cancel out on their own.'}</p>
  </div>;
}

/* ---------------------------------------------------------------- 12 round trips against 1 */
function QueryRace() {
  const [mode, setMode] = useState('before');
  const [latency, setLatency] = useState(260);
  const trips = mode === 'before' ? 12 : 1;
  const total = (trips * latency) / 1000;
  return <div className="pk-race" data-reveal>
    <div className="case-controls" role="group" aria-label="How the room is read">
      <button type="button" className="case-chip" aria-pressed={mode === 'before'} onClick={() => setMode('before')}>Prisma include</button>
      <button type="button" className="case-chip" aria-pressed={mode === 'after'} onClick={() => setMode('after')}>One SQL query</button>
    </div>
    <div className="pk-trips" key={mode} style={{ width: `${trips / 12 * 100}%` }} aria-hidden="true">
      {Array.from({ length: trips }, (_, i) => <span key={i} style={{ '--n': i }}/>)}
    </div>
    <label className="pk-latency"><span>One round trip to Neon takes</span><input type="range" min="230" max="300" step="5" value={latency} onChange={e => setLatency(+e.target.value)}/><output>{latency} ms</output></label>
    <p className="pk-race-total"><b>{total.toFixed(2)} s</b> of waiting on the network per room read, before the database does any work.</p>
    <p className="case-caption">This is arithmetic on the round-trip time I measured on this deployment (230 to 300 ms), not a benchmark. Every connected player's browser reads the room every two seconds.</p>
  </div>;
}

/* ---------------------------------------------------------------- 20,000 hands in your browser */
const CELL = ['#ebe8e1', '#9a968c', '#ffffff', '#ed5939', '#ffd33d'];
function Proof() {
  const canvas = useRef(null), sim = useRef(null), raf = useRef(0);
  const [seed, setSeed] = useState(20261011);
  const [stats, setStats] = useState(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const COLS = 200, ROWS = 100;

  const paint = useCallback((from, to, log) => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext('2d'), w = c.width / COLS, h = c.height / ROWS;
    for (let n = from; n < to; n++) {
      const code = log[n]; // 0 showdown, 1 showdown with side pots, 2 broke a check, 3 everyone folded
      ctx.fillStyle = code === 2 ? CELL[4] : code === 3 ? CELL[3] : code === 1 ? CELL[1] : CELL[2];
      ctx.fillRect((n % COLS) * w, Math.floor(n / COLS) * h, Math.ceil(w) - (w > 2 ? 1 : 0), Math.ceil(h) - (h > 2 ? 1 : 0));
    }
  }, []);
  const reset = useCallback(() => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext('2d'); ctx.fillStyle = CELL[0]; ctx.fillRect(0, 0, c.width, c.height);
  }, []);
  useEffect(() => { const c = canvas.current; c.width = 800; c.height = 400; reset(); return () => cancelAnimationFrame(raf.current); }, [reset]);

  const run = () => {
    cancelAnimationFrame(raf.current);
    reset();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    sim.current = createSimulation(20000, seed);
    setRunning(true); setStats(null);
    const started = performance.now();
    let painted = 0;
    const tick = () => {
      const s = sim.current, done = s.step(reduced ? 20000 : 320);
      paint(painted, s.stats.hands, s.log); painted = s.stats.hands;
      setStats({ ...s.stats });
      if (done) { setRunning(false); setElapsed(Math.round(performance.now() - started)); } else raf.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const s = stats;
  const clean = s && s.illegal + s.stuck + s.leaked + s.potMismatch + s.badTurn + s.tooSmall === 0;
  const rows = [
    ['Hands played', s?.hands ?? 0, 'of 20,000'],
    ['Betting actions applied', s?.actions ?? 0, 'folds, calls, raises, all-ins'],
    ['Hands that cut side pots', s?.sidePotHands ?? 0, `up to ${s?.mostPots ?? 0} pots in one hand`],
    ['Uncalled bets returned', s?.refundHands ?? 0, 'hands'],
    ['Chips created or lost', s ? s.leaked : 0, 'checked after every action'],
    ['Pot not equal to chips in', s ? s.potMismatch : 0, 'including the final pot split'],
    ['Illegal actions accepted or refused', s ? s.illegal + s.tooSmall : 0, 'from a legal-options picker'],
    ['Hands stuck on a player', s ? s.stuck + s.badTurn : 0, 'turn on someone who cannot act'],
  ];
  return <div className="pk-proof">
    <div className="pk-proof-grid" data-reveal>
      <canvas ref={canvas} className="pk-cells" role="img" aria-label="Twenty thousand small squares, one per simulated hand, filling in as the hands are played"/>
      <p className="case-caption pk-legend"><span data-k="a"/>showdown <span data-k="b"/>showdown with side pots <span data-k="c"/>everyone folded <span data-k="d"/>a check failed</p>
    </div>
    <div className="pk-proof-side" data-reveal>
      <div className="pk-run">
        <button type="button" className="pk-go" onClick={run} disabled={running}>{running ? 'Playing…' : s ? 'Run it again' : 'Play 20,000 hands'}</button>
        <label className="pk-seed"><span>Seed</span><input type="number" inputMode="numeric" value={seed} onChange={e => setSeed(Math.max(1, Math.floor(+e.target.value) || 1))}/></label>
      </div>
      <dl className="pk-stats">{rows.map(([label, value, note]) => <div key={label}><dt>{label}</dt><dd>{value.toLocaleString('en')}</dd><p>{note}</p></div>)}</dl>
      <p className="pk-verdict" aria-live="polite">{!s ? 'Press the button. It runs in your browser, on the engine port in this page.' : running ? 'Playing…' : clean ? `Every check held${elapsed ? `, in ${elapsed} ms` : ''}.` : 'A check failed. The yellow squares show which hands.'}</p>
    </div>
  </div>;
}

/* ---------------------------------------------------------------- how a night runs, from the live site */
const NIGHT = [
  ['Open the room', 'Name the table, set the blinds, choose real cards or digital dealing.'],
  ['Share the code', 'Friends join from their own phones with a six character code. No account needed.'],
  ['Buy in', 'Players ask for chips and the host approves each request from a phone.'],
  ['Deal', 'Bet from the dock under your thumb. Pots, side pots and the final settlement are worked out for you.'],
];

const heroFallback = <svg viewBox="0 0 320 220" role="img" aria-label="Stacks of poker chips" width="100%"><ellipse cx="160" cy="176" rx="140" ry="26" fill="#ebe8e1"/>{[[80, 150, '#c13b2a', 3], [140, 140, '#2f64a8', 5], [200, 146, '#1f8450', 4], [250, 154, '#1c201e', 2]].map(([x, y, c, n]) => Array.from({ length: n }, (_, i) => <ellipse key={x + '-' + i} cx={x} cy={y - i * 9} rx="26" ry="9" fill={c}/>))}</svg>;

export default function Poker() {
  const heroStage = useRef(null);
  return <CasePage slug="poker" accent="#c13b2a">
    <CaseHero
      name="Poker Gods"
      title="A home game that counts itself."
      lede="Buy-ins, blinds, betting and settlement for 1 to 9 players, with rules I can test 20,000 hands at a time."
      links={[{ href: 'https://pokergods.vercel.app', label: 'Open the live site' }, { href: '#pots', label: 'Try the side-pot table' }]}
      facts={[
        { label: 'Role', value: 'Product and engineering' },
        { label: 'Timeline', value: 'October 2026, v1.5.0' },
        { label: 'Stack', value: 'Next.js 16, React 19, Postgres on Neon, Prisma' },
        { label: 'Status', value: 'Live. poker.lucide.in is next.' },
      ]}
      note="Click the table. The chips settle into the pots the engine would make."
      stage={<Stage3D ref={heroStage} eager scene={heroScene} label="Four stacks of ceramic poker chips that slide into a main pot and two side pots when you click" fallback={heroFallback}/>}
    />

    <Chapter id="why" title="Why" heading="Chips cause the arguments." tone="paper">
      <Split>
        <div>
          <Prose>
            <p>At a home game the cards sit on the table where everyone can see them. The money does not. Buy-ins, rebuys and who owes whom end up in one person's head, or a notes app, and they come out at midnight.</p>
            <p>Poker Gods keeps the money straight and leaves the cards alone. The site says it in one line: <strong>Run the chips. Cards stay real.</strong> A table can run on physical cards with the host declaring the winner, or deal digitally with Texas Hold'em or Omaha.</p>
            <p>The rules around money are where a poker app goes wrong. A short all-in, a folded blind, a three-way split. I decided early that all of that would be one pure function I could attack with random hands, and everything else would be built around it.</p>
          </Prose>
        </div>
        <Shot src="/cases/poker/desktop-0.jpg" alt="The Poker Gods home page: Run the chips. Cards stay real. A dark table with stacks of chips and the buttons Host a game, Join with code and Watch a game." caption="The live landing page. Host, join with a code, or watch." address="pokergods.vercel.app" priority/>
      </Split>
      <Statement>The cards stay real. The chips don't need to.</Statement>
      <Numbers items={[
        { label: 'Players per table', value: '1–9', note: 'The layout engine is checked at every count.' },
        { label: 'Game variants', value: '2', note: "Texas Hold'em and Omaha." },
        { label: 'Room modes', value: '2', note: 'Cash rooms and tournaments with rising blinds.' },
        { label: 'Seconds per turn', value: '30', note: 'Then it checks or folds for you.' },
      ]}/>
    </Chapter>

    <Chapter id="product" title="The product" heading="A night runs on a six-character code." tone="plain">
      <ol className="pk-night">{NIGHT.map(([title, body]) => <li key={title} data-reveal><h3>{title}</h3><p>{body}</p></li>)}</ol>
      <div className="case-gap"/>
      <Reel label="Poker Gods screens" shots={[
        { src: '/cases/poker/desktop-0.jpg', alt: 'Poker Gods landing page on desktop with the host, join and watch actions', caption: 'Landing, desktop.', frame: 'browser', address: 'pokergods.vercel.app' },
        { src: '/cases/poker/desktop-1.jpg', alt: 'The How a night works section on desktop: open the room, share the code, buy in, deal', caption: 'The four steps of a night, as the site tells it.', frame: 'browser', address: 'pokergods.vercel.app' },
        { src: '/cases/poker/mobile-0.jpg', alt: 'Poker Gods on a phone: headline, host and join buttons and a table with chip stacks', caption: 'On a phone. Everyone plays from their own.', frame: 'phone' },
        { src: '/cases/poker/mobile-2.jpg', alt: 'The four steps on a phone, ending with Deal', caption: 'Same four steps, phone width.', frame: 'phone' },
      ]}/>
      <p className="case-caption pk-after">These are the public pages. The table itself only exists inside a live room, so I have not faked a screenshot of one.</p>
      <div className="case-gap"/>
      <Prose>
        <p>Underneath the lobby the host gets a tabbed drawer: game settings, buy-in requests, and the ledger. Blinds can change between hands without pausing. Players get an action dock with pot odds, bet presets (minimum raise, half pot, three-quarter pot, full pot, all-in) and the keys F, C and R.</p>
        <p>A separate spectator code opens a read-only analysis view with live hole cards and equity. Player routes never accept it, and the spectator route never accepts a player code. Hole cards are withheld on the server, not hidden in the browser.</p>
      </Prose>
    </Chapter>

    <Chapter id="pots" title="Side pots" heading="Every all-in cuts a new pot." tone="ink" wide>
      <Prose>
        <p>This is the part people get wrong. When stacks are uneven, one pot is not enough: a short stack can only win what it could match. Below is the real algorithm, re-implemented from <em>src/lib/sidePots.ts</em> and <em>src/components/settlement.ts</em>.</p>
        <p>Set the stacks and bets. Tap a stack in the 3D table to fold that player. Hover a pot on either side and the other lights up.</p>
      </Prose>
      <div className="case-gap"/>
      <PotLab/>
      <div className="case-gap"/>
      <CodeNote file="src/lib/sidePots.ts" language="ts" caption="Tiers are every distinct amount anyone put in. A folded player still defines a layer, because their chips filled it, but cannot win it."
        code={`export function computeSidePots(contributions: Contribution[]): SidePotResult[] {
  const withMoney = contributions.filter((c) => c.totalCommitted > 0);
  if (withMoney.length === 0) return [];

  const tiers = [...new Set(withMoney.map((c) => c.totalCommitted))].sort((a, b) => a - b);

  const pots: SidePotResult[] = [];
  let prevTier = 0;
  let tierIndex = 0;
  for (const tier of tiers) {
    let amount = 0;
    for (const c of withMoney) {
      amount += Math.max(0, Math.min(c.totalCommitted, tier) - prevTier);
    }
    const eligiblePlayerIds = withMoney
      .filter((c) => !c.folded && c.totalCommitted >= tier)
      .map((c) => c.playerId);`}/>
    </Chapter>

    <Chapter id="engine" title="The engine" heading="The rules never touch the database." tone="plain">
      <Split>
        <Prose>
          <p><em>betting.ts</em> has no database and no clock. The API layer loads a round, calls <em>applyAction</em>, and writes back what changed. That is the whole reason I can play thousands of hands against it.</p>
          <p>It enforces the rules people argue about at a real table. Minimum raise is the size of the last full raise. A short all-in lifts the bet but does not reopen the betting for players who already acted: they may call or fold. A full raise reopens it for everyone. Uncalled chips go back to whoever put them in, never to the winner.</p>
          <p>Every refusal is a <em>RuleError</em> whose message is safe to show a player, like "Betting wasn't reopened — you can only call or fold".</p>
        </Prose>
        <ol className="pk-flow" data-reveal>
          <li><h3>Phone</h3><p>Tap Raise. POST to the hand action route with the seat and the action.</p></li>
          <li><h3>applyAction.ts</h3><p>Load the hand and its contributions. Build a plain Round object.</p></li>
          <li data-pure="true"><h3>betting.ts</h3><p>Pure. Round in, outcome out: continue, round complete, or folded out.</p></li>
          <li><h3>One transaction</h3><p>Row-lock the turn so two taps cannot both act. Write stacks, contributions, next turn.</p></li>
        </ol>
      </Split>
      <div className="case-gap"/>
      <CodeNote file="src/lib/betting.ts" language="ts" caption="A raise is only a full raise if it is at least the last one. Only then does everyone else get to act again."
        code={`const target = Math.min(to, opts.maxRaiseTo);
if (target <= round.currentBet) throw new RuleError("Raise must be higher than the current bet");
const isAllIn = target === opts.maxRaiseTo;
if (target < round.currentBet + round.minRaise && !isAllIn) {
  throw new RuleError(\`Minimum raise is to \${round.currentBet + round.minRaise}\`);
}
const increment = target - round.currentBet;
commit(target - actor.roundCommitted);
if (increment >= round.minRaise) {
  minRaise = increment;
  for (const s of seats) if (s.id !== actor.id) s.canRaise = true;
}
currentBet = target;
reopens = true;`}/>
    </Chapter>

    <Chapter id="decisions" title="Decisions" heading="Three decisions, each with a price." tone="paper">
      <Decision title="Where do the rules live?" chosen="pure"
        problem="Raising, reopening, refunds and side pots all depend on each other. A bug here loses someone's chips."
        options={[
          { id: 'pure', label: 'One pure file', body: 'betting.ts takes a round and an action and returns an outcome. No database, no clock. The API loads, calls, and writes back only the changes. Because it is pure, a script can play 20,000 random hands against it in seconds and assert that chips are never created or lost.', cost: 'A mapping layer in applyAction.ts, and two extra columns (Hand.minRaise, HandContribution.canRaise) so the database can hold what the engine needs.' },
          { id: 'routes', label: 'Inside the routes', body: 'Put the checks next to the writes.', cost: 'The only way to test it is through a server and a database. Random hands at that scale are not realistic, so the rules would only ever be tested by hand.' },
          { id: 'sql', label: 'In the database', body: 'Keep the rules in SQL so they sit next to the data.', cost: 'Same problem as the routes, with the rules harder to read. I wanted them in a file a stranger can open and follow.' },
        ]}/>
      <Decision title="How does a phone hear about the table?" chosen="poll"
        problem="Everyone at the table needs to see the same hand, within a moment."
        options={[
          { id: 'poll', label: 'Poll every two seconds', body: 'Vercel runs stateless functions, so there is no socket server to hold. Each phone fetches the room every 2000 ms, pauses when the tab is hidden, skips the render when the payload is identical, and queues exactly one trailing fetch if you act while a poll is in flight, so your own action never loses a race with the timer.', cost: 'About two seconds of lag, plus the database round trip. It is a stopgap and the handoff notes say so.' },
          { id: 'socket', label: 'A WebSocket server', body: 'Push every change the moment it happens.', cost: 'Needs a long-lived server. That is a second thing to host, for a game that should deploy as one app.' },
          { id: 'managed', label: 'A managed channel (planned)', body: 'Keep Vercel. Publish "room changed" through Pusher, Ably or server-sent events, and let the phone fetch the same single-query snapshot it fetches today.', cost: 'Not built, and I have not picked a provider yet.' },
        ]}/>
      <Decision title="How should the room be read?" chosen="sql"
        problem="Every connected phone reads the whole room every two seconds: players, requests, the hand with contributions and side pots, ledger, tournament."
        options={[
          { id: 'include', label: 'Prisma include', body: 'Nested includes are easy to write.', cost: 'With the pg driver adapter it issued one statement per relation. I counted twelve round trips for one room read, at 230 to 300 ms each.' },
          { id: 'join', label: 'Prisma join strategy', body: 'Ask Prisma to join in the database.', cost: 'Not supported with driver adapters in this version. I tried it rather than assuming.' },
          { id: 'sql', label: 'One raw query', body: 'fetchRoomTree is a single SELECT with lateral subqueries that build JSON with json_agg and json_build_object. Timestamps leave as epoch milliseconds, so nothing depends on a timezone setting. I checked the output field by field against live game data.', cost: 'No query builder, and I own the NULL handling. It is 110 lines of SQL where I used to have three lines of include.' },
        ]}/>
    </Chapter>

    <Chapter id="settle" title="Settlement" heading="Settlement is greedy, and I say so." tone="accent">
      <Split>
        <Prose>
          <p>At the end of a night everyone has a net. The settlement screen turns those into "who pays whom". The code matches the largest debtor with the largest creditor, again and again. The docstring in the repo calls it "minimal-ish", and that is the honest word.</p>
          <p>Greedy is always correct: everyone ends up square. It is not always the fewest payments. Finding the true minimum means finding the most groups of people who cancel out on their own, which gets hard as tables grow. For a table of nine I took the simple rule and kept the list readable.</p>
          <p>The balances on the right are one I found by search. The greedy rule pays five times. Settling P and S with each other first saves one.</p>
        </Prose>
        <Greedy/>
      </Split>
      <div className="case-gap"/>
      <CodeNote file="src/components/settlement.ts" language="ts" caption="Deterministic: ties break by id, so every phone shows the same list."
        code={`while (debtors.length && creditors.length) {
  debtors.sort(bySize);
  creditors.sort(bySize);
  const debtor = debtors[0];
  const creditor = creditors[0];
  const amount = Math.min(debtor.left, creditor.left);
  transfers.push({ from: debtor.id, to: creditor.id, amount });
  debtor.left -= amount;
  creditor.left -= amount;
  if (debtor.left === 0) debtors.shift();
  if (creditor.left === 0) creditors.shift();
}`}/>
    </Chapter>

    <Chapter id="reads" title="One query" heading="One room read went from 12 trips to 1." tone="plain">
      <Split>
        <div>
          <Prose>
            <p>I did not assume the slowness was a cold start. The free Neon branch does suspend after five minutes idle, and in development a keep-alive ping every four minutes fixes that. The real cost was structural: roughly 230 to 300 ms from this deployment to the database, paid once per query.</p>
            <p>So the job was to pay it fewer times. The hottest read in the app now makes one trip. I also removed two more: a route that re-fetched a room it already had, and two aggregate queries that fold into the same statement.</p>
          </Prose>
        </div>
        <QueryRace/>
      </Split>
      <div className="case-gap"/>
      <Split reverse>
        <CodeNote file="src/lib/roomState.ts" language="sql" caption="The top of fetchRoomTree. Every relation is aggregated into JSON inside the database."
          code={`SELECT
  r.id, r.code, r."spectatorCode", r.name, r.status, r."smallBlind", r."bigBlind", r."chipUnit", r.mode, r."cardEngine", r.variant,
  COALESCE(players.data, '[]'::json) AS players,
  COALESCE(buyins.data, '[]'::json) AS "buyInRequests",
  COALESCE(hand.data, '[]'::json) AS hands,
  COALESCE(ledger.data, '[]'::json) AS "ledgerEntries",
  tournament.data AS tournament,
  COALESCE(buyinsums.data, '[]'::json) AS "buyInSums",
  COALESCE(handcount.total, 0) AS "handsPlayed"
FROM "Room" r`}/>
        <CodeNote file="src/hooks/useRoomState.ts" language="ts" caption="Visibility-aware: a hidden tab does not poll."
          code={`function scheduleNext() {
  if (cancelled) return;
  timerRef.current = setTimeout(async () => {
    if (document.visibilityState === "visible") {
      await refresh();
    }
    scheduleNext();
  }, POLL_INTERVAL_MS);
}`}/>
      </Split>
    </Chapter>

    <Chapter id="proof" title="The proof" heading="20,000 hands, and no chip goes missing." tone="ink">
      <Prose>
        <p>A rules engine you cannot test is a rumour. The repo has a script, <em>npm run verify:rules</em>, that deals 20,000 random hands: 2 to 9 players, random stacks, random blinds, random legal actions. After every action it checks that chips are conserved. At the end of every hand it checks that the side pots plus any returned chips equal the pot exactly.</p>
        <p>The button below runs the same generator and the same seed in your browser, against my port of the engine. I also ran the repo's own script, and it passes.</p>
      </Prose>
      <div className="case-gap"/>
      <Proof/>
      <div className="case-gap"/>
      <Split>
        <CodeNote file="scripts/verify-betting-rules.ts" language="ts" caption="The picker only chooses actions the engine says are legal. If the engine then refuses one, that counts as a failure."
          code={`function randomAction(round: Round, id: string): BettingAction {
  const o = optionsFor(round, id)!;
  const r = rand();
  if (o.toCall > 0) {
    if (r < 0.2) return { action: "fold" };
    if (r < 0.65 || !o.canRaise) return { action: "call" };
  } else if (r < 0.5 || !o.canRaise) return { action: "check" };
  if (r > 0.93) return { action: "all-in" };
  const to = o.minRaiseTo + Math.floor(rand() * (o.maxRaiseTo - o.minRaiseTo + 1));
  return { action: "raise", to };
}`}/>
        <Numbers items={[
          { label: 'Random hands in verify:rules', value: '20,000' },
          { label: 'Viewport, player-count and state checks in verify:table-ui', value: '72' },
          { label: 'Layout combinations in verify:layout', value: '450' },
        ]}/>
      </Split>
    </Chapter>

    <Chapter id="timeline" title="Timeline" heading="Nine days from scaffold to v1.5.0." tone="paper">
      <Timeline label="Poker Gods commits" items={[
        { date: 'Oct 2', title: 'Scaffold', body: 'Initial commit from Create Next App.' },
        { date: 'Oct 5', title: 'Table and spectators', body: 'The first poker table, spectator analysis and a second code for watchers, with player motion that reacts to state changes instead of replaying on every poll.' },
        { date: 'Oct 6', title: 'Database and design overhaul', body: 'Twelve room-read round trips became one. The settlement screen gained a transfers list. A new card-room design system replaced the first look, and the app got its production address.' },
        { date: 'Oct 8', title: 'Omaha, timer, exploit', body: 'Omaha with four hole cards and exactly-two-plus-three scoring. Kick player and resumable seats. A 30-second turn timer. A pot-award exploit closed in digital rooms, and a shuffle fairness check added.' },
        { date: 'Oct 11', title: 'v1.5.0', body: 'The betting engine rewritten as a pure module, uncalled bets refunded, the showdown review sheet, and the 20,000-hand rules check.' },
      ]}/>
      <div className="case-gap"/>
      <Prose>
        <h3 className="pk-open">What is still open</h3>
        <p>Copied from my own handoff notes, as of v1.5.0:</p>
        <ul>
          <li>Real-time is still polling. A managed push channel is the plan; the provider is not chosen.</li>
          <li>The dealer button does not yet stay dead when a player is eliminated.</li>
          <li>A player who drops mid-hand is not handled yet.</li>
          <li>Tournament antes exist in the schema and are not enforced.</li>
          <li>Streets do not advance on their own: someone taps to continue.</li>
          <li>The visual check fails at 844 by 390: a seat plate overlaps the dock. It failed the same way before the last round of work.</li>
          <li>The live six-hand smoke test had passed four hands when I last recorded it. It needs a clean re-run before I would call it done.</li>
        </ul>
      </Prose>
    </Chapter>
  </CasePage>;
}
