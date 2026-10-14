import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/notaprompt.css';
import { CasePage, CaseHero, Chapter, Prose, Statement, Shot, Reel, Decision, CodeNote, Ledger, Timeline, Numbers, Stage3D } from '../kit.jsx';
import { AGENTS, MAX_STEPS, DEFAULTS, buildGraph, curve, statuses } from '../scenes/notaprompt-sim.js';

const scene = () => import('../scenes/notaprompt.js');

function RingFallback() {
  const dots = Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2; return [100 + Math.cos(a) * 62, 100 + Math.sin(a) * 62, i === 3]; });
  return <svg className="np-hero-fallback" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92" fill="#f4f1ea"/>{dots.map(([x, y, on], i) => <circle key={i} cx={x} cy={y} r={on ? 7 : 5} fill={on ? '#ed5939' : '#8896a8'}/>)}</svg>;
}

const pct = (n, d = AGENTS) => Math.round(n / d * 100);

function Curve({ series, ghost, step, label }) {
  const W = 620, H = 262, L = 46, R = 14, T = 12, B = 46;
  const x = s => L + s / MAX_STEPS * (W - L - R), y = n => T + (1 - n / AGENTS) * (H - T - B);
  const line = list => list.map((n, s) => `${s ? 'L' : 'M'}${x(s).toFixed(1)} ${y(n).toFixed(1)}`).join('');
  const upto = series.slice(0, step + 1);
  const area = `${line(upto)}L${x(step).toFixed(1)} ${y(0)}L${x(0)} ${y(0)}Z`;
  return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
    {[0, 50, 100].map(v => <text key={v} x={L - 10} y={y(v / 100 * AGENTS) + 5} textAnchor="end">{v}%</text>)}
    {[0, 4, 8, 12, 16].map(s => <text key={s} x={x(s)} y={H - 24} textAnchor="middle">{s}</text>)}
    <rect x={L} y={y(AGENTS)} width={W - L - R} height={y(0) - y(AGENTS)} fill="#fff"/>
    {ghost && <path d={line(ghost)} fill="none" stroke="#b3bcc8" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"/>}
    <path d={line(series)} fill="none" stroke="#e1ddd3" strokeWidth="4" strokeLinejoin="round"/>
    <path d={area} fill="#ffded3"/>
    <path d={line(upto)} fill="none" stroke="#ed5939" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"/>
    <circle cx={x(step)} cy={y(series[step])} r="8" fill="#ed5939"/>
    <text x={(L + W - R) / 2} y={H - 4} textAnchor="middle">steps</text>
  </svg>;
}

function Simulator() {
  const stage = useRef(null);
  const [ready, setReady] = useState(false);
  const [conformity, setConformity] = useState(DEFAULTS.conformity);
  const [influence, setInfluence] = useState(DEFAULTS.influence);
  const [shortcuts, setShortcuts] = useState(DEFAULTS.shortcuts);
  const [seed, setSeed] = useState(17);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ghost, setGhost] = useState(null);
  const [hovered, setHovered] = useState(-1);

  const graph = useMemo(() => buildGraph(shortcuts), [shortcuts]);
  const params = useMemo(() => ({ conformity, influence }), [conformity, influence]);
  const { series } = useMemo(() => curve(graph, params, seed), [graph, params, seed]);
  const { status, run } = useMemo(() => statuses(graph, params, seed, step), [graph, params, seed, step]);
  const settled = useMemo(() => { let last = 1; for (let s = 1; s <= MAX_STEPS; s++) if (series[s] !== series[s - 1]) last = s; return last; }, [series]);
  const degrees = graph.adjacent.map(list => list.length);
  const hub = degrees.indexOf(Math.max(...degrees)), loner = degrees.indexOf(Math.min(...degrees));

  useEffect(() => { if (ready) stage.current?.send('graph', { shortcuts }); }, [ready, graph]);
  useEffect(() => {
    if (!ready) return;
    stage.current?.send('state', { status: Array.from(status), parent: Array.from(run.parent), adopted: Array.from(run.adopted), step, seed });
  }, [ready, graph, status, run, step, seed]);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setStep(value => { if (value >= Math.max(settled, 1)) { setPlaying(false); return value; } return value + 1; }), 650);
    return () => clearInterval(timer);
  }, [playing, settled]);

  const onEvent = (name, payload) => {
    if (name === 'ready') setReady(true);
    if (name === 'hover') setHovered(payload);
    if (name === 'seed') { setSeed(payload); setStep(0); setPlaying(false); }
  };
  const choose = id => { setSeed(id); setStep(0); setPlaying(false); };
  const play = () => { if (step >= settled) setStep(0); setPlaying(value => !value); };
  const reset = () => { setStep(0); setPlaying(false); };

  const id = hovered >= 0 ? hovered : seed;
  const trait = graph.traits[id];
  const state = id === seed ? 'The seed. It holds the idea at step 0.' : run.adopted[id] >= 0 ? `Adopted at step ${run.adopted[id]}.` : status[id] === 2 ? 'Felt the pull and is holding out.' : 'Has not heard of it, or not enough yet.';
  const count = series[step];

  return <div className="np-sim">
    <div className="np-sim-stage" data-reveal>
      <div className="case-stage-block">
        <Stage3D ref={stage} scene={scene} onEvent={onEvent} label={`A ring of ${AGENTS} agents on a ceramic plate. Coral agents have adopted the idea. Drag to turn the plate, click an agent to plant the idea there.`} fallback={<RingFallback/>}/>
      </div>
      <p className="case-caption">Drag to turn the plate. Click or tap an agent to plant the idea there. Thick coral links show who convinced whom.</p>
    </div>
    <div className="np-panel">
      <div className="np-chart" data-reveal>
        <div className="np-readout"><strong aria-live="polite">{pct(count)}%</strong><span>{count} of {AGENTS} agents have adopted at step {step}</span></div>
        <Curve series={series} ghost={ghost} step={step} label={`Adoption curve. ${count} of ${AGENTS} agents adopted at step ${step}; the run settles at ${series[MAX_STEPS]} agents.`}/>
        <div className="np-legend"><span style={{ '--c': '#ed5939' }}>Adopted</span><span style={{ '--c': '#30312e' }}>Holding out</span><span style={{ '--c': '#8896a8' }}>Not yet</span>{ghost && <span style={{ '--c': '#8896a8' }}>Kept run</span>}</div>
      </div>
      <div className="np-run" data-reveal>
        <button type="button" className="case-button" onClick={play}>{playing ? 'Pause' : step >= settled ? 'Play again' : 'Play'}</button>
        <button type="button" className="case-chip" onClick={() => { setPlaying(false); setStep(value => Math.min(value + 1, MAX_STEPS)); }} disabled={step >= MAX_STEPS}>Step</button>
        <button type="button" className="case-chip" onClick={reset}>Reset</button>
        <button type="button" className="case-chip" onClick={() => setGhost(ghost ? null : series)} aria-pressed={!!ghost}>{ghost ? 'Clear kept run' : 'Keep this run to compare'}</button>
      </div>
      <div className="np-field" data-reveal>
        <label htmlFor="np-conf">Conformity <span>{Math.round(conformity * 100)}%</span></label>
        <input id="np-conf" type="range" min="0" max="1" step=".05" value={conformity} onChange={e => setConformity(+e.target.value)}/>
        <small>How strongly agents follow their neighbours. Higher lowers every agent's bar.</small>
      </div>
      <div className="np-field" data-reveal>
        <label htmlFor="np-inf">Influence <span>{Math.round(influence * 100)}%</span></label>
        <input id="np-inf" type="range" min="0" max="1" step=".05" value={influence} onChange={e => setInfluence(+e.target.value)}/>
        <small>How hard an adopter pushes its neighbours. Hubs push harder than the rest.</small>
      </div>
      <div data-reveal>
        <p className="case-caption" style={{ margin: '0 0 6px' }}>Plant the idea in</p>
        <div className="case-controls" style={{ marginTop: 0 }}>
          {[['Most connected', hub], ['Least connected', loner], ['The far side', (seed + AGENTS / 2) % AGENTS]].map(([name, target]) => <button key={name} type="button" className="case-chip" aria-pressed={seed === target} onClick={() => choose(target)}>{name}</button>)}
        </div>
        <p className="case-caption" style={{ margin: '14px 0 6px' }}>Shortcuts across the network</p>
        <div className="case-controls" style={{ marginTop: 0 }}>
          {[['Few', .04], ['Some', .12], ['Many', .3]].map(([name, value]) => <button key={name} type="button" className="case-chip" aria-pressed={shortcuts === value} onClick={() => { setShortcuts(value); setStep(0); setPlaying(false); }}>{name}</button>)}
        </div>
      </div>
      <div className="np-card" data-reveal>
        <h3>Agent {String(id + 1).padStart(2, '0')}</h3>
        <p>{state}</p>
        <div className="np-bars">
          <div className="np-bar"><span>Conformity</span><i><b style={{ width: `${trait.conformity * 100}%` }}/></i><span>{Math.round(trait.conformity * 100)}</span></div>
          <div className="np-bar"><span>Influence</span><i><b className="is-accent" style={{ width: `${trait.influence * 100}%` }}/></i><span>{Math.round(trait.influence * 100)}</span></div>
          <div className="np-bar"><span>Resistance</span><i><b style={{ width: `${trait.resistance * 100}%` }}/></i><span>{Math.round(trait.resistance * 100)}</span></div>
        </div>
      </div>
    </div>
  </div>;
}

function RuleDiagram() {
  const pull = 62, bar = 44;
  return <svg viewBox="0 0 460 330" role="img" aria-label="One agent with three neighbours. Two have adopted and push. Their combined pull is compared with the agent's own bar.">
    <path d="M230 120L90 60M230 120L370 60M230 120L230 235" stroke="#e1ddd3" strokeWidth="8" strokeLinecap="round"/>
    <path d="M230 120L90 60M230 120L370 60" stroke="#ed5939" strokeWidth="8" strokeLinecap="round"/>
    <circle cx="90" cy="60" r="30" fill="#ed5939"/><circle cx="370" cy="60" r="22" fill="#ed5939"/><circle cx="230" cy="235" r="24" fill="#b3bcc8"/>
    <circle cx="230" cy="120" r="38" fill="#fff" stroke="#30312e" strokeWidth="6"/>
    <text x="90" y="112" textAnchor="middle">adopted, influence 78</text>
    <text x="370" y="104" textAnchor="middle">adopted, 61</text>
    <text x="230" y="282" textAnchor="middle">not yet</text>
    <text x="230" y="126" textAnchor="middle" style={{ fontWeight: 700 }}>me</text>
    <rect x="30" y="296" width="400" height="14" rx="7" fill="#ebe8e1"/>
    <rect x="30" y="296" width={400 * pull / 100} height="14" rx="7" fill="#ed5939"/>
    <rect x={30 + 400 * bar / 100 - 3} y="288" width="6" height="30" fill="#30312e"/>
    <text x="34" y="326" textAnchor="start" style={{ fontSize: 15 }}>pull 62</text>
    <text x={30 + 400 * bar / 100 + 10} y="326" textAnchor="start">my bar 44, so I adopt</text>
  </svg>;
}

export default function Notaprompt() {
  return <CasePage slug="notaprompt">
    <CaseHero
      name="Notaprompt"
      title="Give an idea somewhere to go."
      lede="Notaprompt began as a tool that sharpened prompts. Today its site runs a concept through a network of agents and watches it spread. This page follows that move, and lets you run a small version of it yourself."
      facts={[{ label: 'Role', value: 'Product and engineering' }, { label: 'Timeline', value: 'Oct 2025 to now' }, { label: 'Stack', value: 'Next.js, React, TypeScript, OpenRouter' }, { label: 'Status', value: 'Live at notaprompt.in' }]}
      links={[{ href: '#simulator', label: 'Run the simulation' }, { href: 'https://notaprompt.in', label: 'notaprompt.in' }]}
      stage={<Stage3D scene={scene} eager label="A ring of agents on a ceramic plate. A coral idea spreads from one agent to its neighbours, step by step." fallback={<RingFallback/>}/>}
      note="A demo run of my own seeded model. Drag to turn the plate."
    />

    <Chapter id="origin" title="Origin" heading="It began as a prompt sharpener">
      <Prose>
        <p>The name is older than the product it sits on today. Three repositories on my machine hold the earlier ones. Scrub the timeline to see how each one changed what a user was asked to do.</p>
      </Prose>
      <div className="case-gap"/>
      <Timeline label="Notaprompt versions" items={[
        { date: 'Oct 2025', title: 'v1: builders', body: 'A Next.js app with builders for coding, creative and research prompts. Each builder composed ingredients, logic pills, a persona and a mode into one prompt. 14 commits, from 22 October 2025 to 12 January 2026.' },
        { date: 'Jan 2026', title: 'A verdict, not advice', body: 'A small Next.js variant. One text box: describe a situation. A classifier routed it to a startup or a hiring assessment, and a persona prompt returned BUILD, PIVOT, KILL or REJECT. 5 commits, 28 January to 28 February 2026.' },
        { date: 'Apr 2026', title: 'v2: ask what is missing', body: 'Compose, clarify, result. The app analysed a prompt, asked three to five questions about what was missing, then compiled a brief for Claude, ChatGPT, Gemini, Perplexity or Copilot. 2 commits, 3 April 2026.' },
        { date: 'Today', title: 'Simulate the decision', body: 'The live site at notaprompt.in now says: simulation-driven decisions, powered by AI agents. The code behind that is not in the three repositories I reopened for this page, so I describe only what the site itself says.' },
      ]}/>
    </Chapter>

    <Chapter id="shift" title="The shift" heading="A chatbot answers. A crowd reacts." tone="paper">
      <Split2/>
      <div className="case-gap"/>
      <Reel label="Screens from notaprompt.in" shots={[
        { src: '/cases/notaprompt/desktop-0.jpg', alt: 'The Notaprompt home page: Simulation-Driven Decisions, powered by AI agents, with a network graph panel below', caption: 'The home page today. The panel shows an agent card with conformity and influence, and an adoption peak.', address: 'notaprompt.in' },
        { src: '/cases/notaprompt/desktop-1.jpg', alt: 'A mesh of small spheres over a lattice, with the line Built on clear intention', caption: 'The network drawn as spheres over a lattice, with the site\'s own vision statement.', address: 'notaprompt.in' },
        { src: '/cases/notaprompt/desktop-2.jpg', alt: 'The Mechanics of a Small-World Cascade section with a live contagion cascade card and a confidence readout', caption: 'The small-world cascade section: a live network card and a confidence readout.', address: 'notaprompt.in' },
        { src: '/cases/notaprompt/desktop-3.jpg', alt: 'A comparison section titled Boring Chatbot Guesswork versus Notaprompt Simulation with a playground', caption: 'The comparison the site makes with a chatbot, and a playground that takes a launch to stress-test.', address: 'notaprompt.in' },
        { src: '/cases/notaprompt/mobile-0.jpg', alt: 'The Notaprompt home page on a phone', caption: 'The same page on a phone.', frame: 'phone' },
        { src: '/cases/notaprompt/mobile-2.jpg', alt: 'The small-world cascade card on a phone', caption: 'The cascade card on a phone.', frame: 'phone' },
      ]}/>
    </Chapter>

    <Chapter id="claims" title="Claims" heading="The numbers are the site's claims" tone="ink">
      <Numbers items={[
        { label: 'respondents behind the agents', value: '1,499', note: 'Technology page: a 2024 General Social Survey sample.' },
        { label: 'agents in one run, at most', value: '5,000', note: 'Features page.' },
        { label: 'agents on the free tier', value: '100', note: 'The Explorer tier, no card needed.' },
        { label: 'behavioural dimensions', value: '8', note: 'Trust, risk aversion, conformity, economic outlook and others.' },
      ]}/>
      <div className="case-gap"/>
      <Prose>
        <p>I am reporting these as the product's own statements. The site also gives a margin of error, a confidence figure, a latency and an uptime. I am not repeating them. I have not verified them, and this page does not vouch for them.</p>
      </Prose>
    </Chapter>

    <Chapter id="simulator" title="Simulator" heading="Run one idea through 48 agents">
      <p className="np-note" data-reveal>A portfolio illustration of the mechanism, written for this page. It is not the Notaprompt engine, it is not calibrated to any data, and its curves predict nothing. It runs the same way every time you give it the same settings.</p>
      <Simulator/>
    </Chapter>

    <Chapter id="rule" title="The rule" heading="Conformity lowers the bar" tone="paper">
      <div className="np-rule">
        <div data-reveal>
          <RuleDiagram/>
        </div>
        <div className="np-stack">
          <Prose>
            <p>Each agent has three traits: how much it conforms, how much it influences others, and how much it resists on its own. Each step, an agent that has not adopted counts the push from neighbours who have.</p>
            <p>Pushes combine, so a second adopter helps more than nothing and less than double. If the combined pull reaches the agent's bar, it adopts on the next step. More conformity lowers the bar. More influence raises the pull. Shortcuts let an idea jump the ring.</p>
          </Prose>
        </div>
      </div>
      <div className="case-gap"/>
      <CodeNote file="src/case/scenes/notaprompt-sim.js" language="js" code={`
      let calm = 1, best = -1, bestPull = 0;
      for (const j of adjacent[i]) {
        if (adopted[j] < 0 || adopted[j] >= step) continue;
        const push = params.influence * traits[j].influence;
        calm *= 1 - push;
        if (push > bestPull) { bestPull = push; best = j; }
      }
      pulls[i] = 1 - calm;
      const bar = traits[i].resistance * (1 - .85 * params.conformity * traits[i].conformity);
      if (best >= 0 && pulls[i] >= bar) next.push([i, best]);
`} caption="The whole spread rule. No randomness at run time: the graph and traits come from a seeded generator, so a run can be replayed."/>
    </Chapter>

    <Chapter id="decisions" title="Decisions" heading="Three decisions, each with a price">
      <Decision title="How should the first product ask?" chosen="ask" problem="A raw prompt rarely says who it is for, or what the answer should look like. v1 solved that with builders. v2 had to choose again." options={[
        { id: 'builders', label: 'Builders and pills', body: 'v1 composed ingredients, logic pills, personas and modes into a prompt. It gave control, and it meant a config file for every domain.', cost: 'Adding a domain meant new configuration, and the user had to know what to pick.' },
        { id: 'oneshot', label: 'One-shot rewrite', body: 'Send the prompt to a model and return a better one. Fastest to build.', cost: 'The model has to guess what is missing, so it fills gaps with its own assumptions.' },
        { id: 'ask', label: 'Ask what is missing', body: 'v2 sends the prompt to an analyze step that returns a detected intent and three to five questions, merges them with a few fixed questions per platform, then compiles. The compile call runs at temperature 0.2.', cost: 'Two model calls per run, and quality rests on one free-tier model, arcee-ai/trinity-large-preview:free.' },
      ]}>
        <CodeNote file="notaprompt v2/app/api/compile/route.ts" language="ts" code={`
  const response = await callOpenRouter({
    model: "arcee-ai/trinity-large-preview:free",
    messages: [
      {
        role: "system",
        content:
          "You are a senior prompt engineer. Rewrite the user's prompt into a sharper, platform-aware brief. Do not fill in a template. Rewrite the prompt itself into the strongest possible version for the target platform. Return only the final enhanced prompt."
      },
`}/>
      </Decision>
      <Decision title="What should a verdict sound like?" chosen="blunt" problem="The decision variant had to say something about a startup or a hire. Polite advice is easy to write and easy to ignore." options={[
        { id: 'polite', label: 'Balanced advice', body: 'Pros, cons and encouragement. Hard to get wrong, hard to act on.', cost: 'It rarely commits to a call.' },
        { id: 'blunt', label: 'A decision', body: 'The prompt tells the model: "Your job is to deliver a DECISION, not advice." A classifier first routes the input to a startup assessment, a hiring assessment or reject, and the startup path ends in BUILD, PIVOT, KILL or REJECT.', cost: 'My read: it can be wrong in a way that stings, for example killing an idea that was only badly told. It also covered only two kinds of decision, and it never went past five commits.' },
        { id: 'ask-first', label: 'Ask more first', body: 'Interview the user before judging. That is what v2 later did for prompts.', cost: 'It would have turned a one-box demo into a flow.' },
      ]}/>
      <Decision title="How do I show a simulator I can't open?" chosen="mine" problem="The live engine's code is not in the repositories I have, and its claims are not mine to verify. A case study still needs the mechanism to be felt." options={[
        { id: 'shots', label: 'Screenshots only', body: 'Honest, and flat. A reader sees an adoption number and learns nothing about how an idea moves.', cost: 'No way to feel the mechanism.' },
        { id: 'copy', label: 'Recreate its numbers', body: 'Draw a curve that ends at 78.4 per cent and call it the product.', cost: 'That would be inventing evidence. I ruled it out.' },
        { id: 'mine', label: 'A small model of my own', body: 'Forty-eight agents, a seeded small-world ring, one spread rule, two dials. Labelled as an illustration on the page, next to the controls.', cost: 'It shows how a cascade can behave, not how Notaprompt behaves. Its curves mean nothing outside this page.' },
      ]}/>
    </Chapter>

    <Chapter id="ledger" title="Ledger" heading="What I can show, and what I can't" tone="paper">
      <Ledger mineTitle="What I can show" othersTitle="What the site states and I haven't verified"
        mine={['The three earlier versions, read from their repositories: v1 with 14 commits, the decision variant with 5, v2 with 2.', 'The real screenshots on this page, taken from notaprompt.in.', 'This page\'s simulator: 48 agents, a seeded graph, one rule, a replayable run.', 'That the simulation code is not among the repositories I reopened.']}
        others={['Agents built from a 2024 General Social Survey sample of 1,499 respondents.', 'Watts-Strogatz small-world networks and a Prospect-theory model.', 'Agents that reason through a language model over OpenRouter.', 'The Quibi case study the site\'s banner advertises. I have not read it.']}/>
    </Chapter>

    <Chapter id="next" title="Next" heading="Next: show the misses" tone="ink">
      <Statement>A simulator earns trust when it shows where it was wrong.</Statement>
      <Prose>
        <p>If I were taking the product further, I would put one thing beside every peak: a past launch whose real outcome is known, the run the model produced for it, and the gap. Publish the misses as plainly as the hits.</p>
        <p>I would also let a user replay any run exactly, the way this page does. A cascade you can replay is a cascade you can argue with.</p>
      </Prose>
    </Chapter>
  </CasePage>;
}

function Split2() {
  return <Prose>
    <p>The live site makes one argument. Asking a chatbot about a launch gives you a generic opinion. Running the concept through a network of agents, each with its own temperament, shows how the idea might move from person to person, and where it stalls.</p>
    <p>Those are the site's words, not mine to prove. What I can say is what the screens show: a network, agent cards with conformity and influence, and an adoption peak. That vocabulary is what the simulator below borrows.</p>
  </Prose>;
}
