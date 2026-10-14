import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stage3D, CodeNote } from './kit.jsx';
import useReducedMotion from '../useReducedMotion.js';
import { PRESETS, initialForm, runPipeline, questionTypeLabel } from './scenes/superformsModel.js';

const labScene = () => import('./scenes/superformsLab.js');
const SCREENS = [
  { id: 'build', label: 'Build', src: '/cases/superforms/builder-build.jpg', alt: 'Actual Superforms builder: question list, editable form canvas and question settings', caption: 'Build: select a question, edit it in place, and set its rules without leaving the preview.' },
  { id: 'design', label: 'Design', src: '/cases/superforms/builder-design.jpg', alt: 'Actual Superforms Design mode with art directions, transitions and styling controls', caption: 'Design: choose an art direction, then adjust inputs, buttons and motion around the same form.' },
  { id: 'preview', label: 'Preview', src: '/cases/superforms/builder-preview.jpg', alt: 'Actual Superforms Preview mode displaying the workshop form as respondents see it', caption: 'Preview: try the respondent experience before sharing the link.' },
  { id: 'ai', label: 'AI editor', src: '/cases/superforms/builder-ai.jpg', alt: 'Actual Superforms builder with its Ask AI editing panel open', caption: 'Ask AI: describe a change to the form you already have. An applied edit can be undone.' },
  { id: 'home', label: 'Homepage', src: '/cases/superforms/desktop-0.jpg', alt: 'Superforms homepage introducing the product', caption: 'One homepage capture for context. The other views show the actual builder.' },
];

export function ProductScreens() {
  const [selected, setSelected] = useState('build');
  const screen = SCREENS.find(s => s.id === selected);
  return <div className="sf-screens" data-reveal>
    <div className="sf-screen-tabs" role="group" aria-label="Explore the real builder" data-ui>
      {SCREENS.map(s => <button key={s.id} type="button" aria-pressed={selected === s.id} onClick={() => setSelected(s.id)}><img src={s.src} alt="" loading="lazy"/><span>{s.label}</span></button>)}
    </div>
    <figure className={`case-shot sf-builder-shot ${selected === 'home' ? 'is-home' : ''}`}>
      <div className="shot-device" data-ui><div className="shot-bar"><span/><span/><span/><em>{selected === 'home' ? 'superforms.in' : 'Superforms builder · sample form'}</em></div>
        <picture>{selected !== 'home' && <source media="(max-width: 700px)" srcSet={`/cases/superforms/builder-mobile-${selected}.jpg`}/>}<img src={screen.src} alt={screen.alt} decoding="async"/></picture>
      </div><figcaption>{screen.caption}</figcaption>
    </figure>
    <a className="sf-image-full" href={screen.src} target="_blank" rel="noreferrer">Open screenshot at full size ↗</a>
    <p className="sf-capture-note">Builder captures use the real app component with isolated sample data and system font fallbacks. No customer responses are shown.</p>
  </div>;
}

const EDITS = [
  { id: 'edit', label: 'Rewrite a question', result: 'The food question becomes a dropdown. Its identity stays attached, so existing responses still belong to it.' },
  { id: 'order', label: 'Reorder the form', result: 'Email moves first and the rating disappears. The remaining questions keep their original identities.' },
  { id: 'design', label: 'Change the look', result: 'The form switches to Terminal on Pro. On Free, it uses Minimal. Its questions and existing response links stay intact.' },
];

export function EditLab() {
  const stage = useRef(null), timers = useRef([]), current = useRef(initialForm());
  const reduced = useReducedMotion();
  const [choice, setChoice] = useState('edit'), [pro, setPro] = useState(true);
  const [shown, setShown] = useState(current.current), [run, setRun] = useState(null), [phase, setPhase] = useState(0);
  const preset = PRESETS.find(p => p.id === choice);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);
  const ready = useCallback(name => {
    if (name === 'ready') timers.current.push(setTimeout(() => stage.current?.send('form', { form: current.current, events: [] }), 0));
  }, []);
  const execute = () => {
    clear();
    // Every example starts from the same form, so before/after stays understandable.
    const before = initialForm(), result = runPipeline(before, preset.text, pro);
    current.current = before; setShown(before); setRun({ ...result, choice }); setPhase(1);
    stage.current?.send('form', { form: before, events: [] });
    const finish = () => { current.current = result.form; setShown(result.form); setPhase(3); stage.current?.send('form', { form: result.form, events: result.events }); };
    if (reduced) finish();
    else { timers.current.push(setTimeout(() => setPhase(2), 350), setTimeout(finish, 800)); }
  };
  const reset = () => { clear(); current.current = initialForm(); setShown(current.current); setRun(null); setPhase(0); stage.current?.send('form', { form: current.current, events: [] }); };
  const busy = phase === 1 || phase === 2;
  return <div className="sf-edit-demo">
    <div className="sf-demo-instructions" data-reveal>
      <p>Choose an example, then press <strong>Apply this edit</strong>. Watch the questions change; their coral stamps keep the answers connected.</p>
      <p className="sf-demo-disclosure">Interactive replay of recorded proposals, using the product&rsquo;s safety rules. It does not call an AI service.</p>
    </div>
    <div className="sf-demo-workspace">
      <div className="sf-demo-form" data-reveal>
        <div className="sf-demo-form-heading"><h3>{shown.title}</h3><span>{phase === 3 ? 'After the edit' : 'Starting form'}</span></div>
        <div className="sf-demo-model"><Stage3D ref={stage} scene={labScene} onEvent={ready} label="Workshop form blocks, initially populated. Applying an edit changes the blocks while their identity stamps stay attached." fallback={<ol>{shown.questions.map(q => <li key={q.id}>{q.label}</li>)}</ol>}/></div>
        <ul className="sf-demo-questions">{shown.questions.map(q => <li key={q.id}><span className="sf-stamp">{q.id}</span><span>{q.label}<small>{questionTypeLabel(q.type)}</small></span></li>)}</ul>
      </div>
      <div className="sf-demo-actions" data-reveal>
        <h3>What should change?</h3>
        <div className="sf-demo-options" role="group" aria-label="Recorded instructions">{EDITS.map(e => <button key={e.id} type="button" disabled={busy} aria-pressed={choice === e.id} onClick={() => { setChoice(e.id); reset(); }}>{e.label}</button>)}</div>
        <form className="sf-ask-row" onSubmit={e => { e.preventDefault(); execute(); }}>
          <p className="sf-demo-request">&ldquo;{preset.text}&rdquo;</p>
          {choice === 'design' && <div className="sf-demo-plan" role="group" aria-label="Account plan"><span>Try it on</span>{[false, true].map(value => <button key={String(value)} type="button" aria-pressed={pro === value} disabled={busy} onClick={() => { setPro(value); reset(); }}>{value ? 'Pro' : 'Free'}</button>)}</div>}
          <button className="sf-run" type="submit" disabled={busy}>{busy ? 'Applying edit…' : 'Apply this edit'}</button>
        </form>
        <div className="sf-demo-result" aria-live="polite">
          <h4>{phase === 3 ? 'Changed. Still connected.' : busy ? 'Checking the edit…' : 'Your form is ready.'}</h4>
          <p>{phase === 3 ? EDITS.find(e => e.id === run.choice).result : busy ? 'The proposed change is checked before it reaches the form.' : 'The starting form is already on the left. There is nothing to configure before trying an example.'}</p>
        </div>
        <button className="sf-demo-reset" type="button" onClick={reset}>Reset example</button>
      </div>
    </div>
    <details className="sf-technical" data-reveal>
      <summary>See how the edit stays safe</summary>
      <ol className="sf-steps">
        <li className="sf-step" data-on={phase >= 1}><h3>Understand the request</h3><p>{run ? `This example asks for ${run.route.categories.join(' and ')} changes.` : 'A small routing step chooses the relevant instructions.'}</p></li>
        <li className="sf-step" data-on={phase >= 2}><h3>Propose a change</h3>{run ? <CodeNote file="Recorded proposal" language="json" code={run.proposed.map(op => JSON.stringify(op)).join('\n')}/> : <p>The AI proposes operations rather than replacing the whole form.</p>}</li>
        <li className="sf-step" data-on={phase >= 3}><h3>Protect existing work</h3><p>{run && phase === 3 ? `${run.counts.applied} changes accepted, ${run.counts.coerced} adjusted, ${run.counts.rejected} skipped. Identity changes are removed before applying an edit.` : 'Keep question identities, recover usable changes and skip malformed operations.'}</p></li>
        <li className="sf-step" data-on={phase >= 3}><h3>Update the form</h3><p>The same form definition drives the builder and respondent view. The code trace is available here; the result stays readable above.</p></li>
      </ol>
    </details>
  </div>;
}

const DECISIONS = [
  { title: 'Design defaults, with control', chosen: 'A library of complete aesthetics', why: 'A creator should not have to become a designer to publish a form that belongs to their brand. Each aesthetic chooses typography, inputs, buttons and motion together; the builder still lets them tune those choices.', cost: 'A curated library can never express every brand. Advanced controls add flexibility, but also more states to maintain.', measure: 'Time from first preview to publish, and how often creators switch styles before sharing.', alternative: 'A blank styling panel asks for too many decisions before a creator sees a result. Generating every visual detail with AI would make consistency harder to guarantee.' },
  { title: 'A conversation, then an editor', chosen: 'Plain-language changes alongside direct editing', why: 'A prompt gets someone started, but their real brief changes as they see the form. They can ask for a revision or edit one question directly, without generating a new form and starting over.', cost: 'Two ways to edit must agree. The AI needs boundaries, and creators need a predictable undo path.', measure: 'First-form publication, successful revisions and returning creators who publish another form.', alternative: 'Prompt-only would hide small corrections behind another AI request. Manual-only would make the first useful form take more setup.' },
  { title: 'Try a real form before paying', chosen: 'Four free aesthetics; more range on paid plans', why: 'Free should let a creator experience the complete creation and sharing loop. The paid design library gives them more expression when presentation matters, rather than making the first draft a dead end.', cost: 'Some creators will never need the paid range. Aesthetic restrictions also need a clear explanation before publication.', measure: 'Free creators who publish, repeat use by cohort, and upgrades after a real form has collected responses.', alternative: 'A paywall before preview would ask for trust before showing value. Giving everything away would remove one reason to support the product.' },
  { title: 'Let the preview be the promise', chosen: 'One visual system across builder and runner', why: 'What a creator approves should be what a respondent sees. One style map carries the same design through editing, preview and the live form, reducing the uncertainty that comes before sharing a link.', cost: 'Every aesthetic must work across input types, phone widths and interaction states. A shared renderer concentrates that testing responsibility.', measure: 'Preview-to-publish drop-off, mobile completion and reports of a live form differing from its preview.', alternative: 'A polished marketing mockup with a separate, simpler live renderer would promise an experience the product cannot reliably deliver.' },
];

export function ProductDecisions() {
  return <div className="sf-product-decisions"><p className="sf-decision-intro" data-reveal>These are choices in the product today. The measures below are how I would evaluate their effect on activation and repeat use.</p>{DECISIONS.map(d => <article key={d.title} className="sf-product-decision" data-reveal>
    <h3>{d.title}</h3><p className="sf-chosen">{d.chosen}</p>
    <div className="sf-decision-reading"><div><h4>Why I chose it</h4><p>{d.why}</p></div><div><h4>What it costs</h4><p>{d.cost}</p></div></div>
    <p className="sf-decision-measure"><strong>How I would judge it:</strong> {d.measure}</p>
    <details><summary>Why I passed on the alternatives</summary><p>{d.alternative}</p></details>
  </article>)}</div>;
}

export function GrowthPlan() {
  return <div className="sf-growth">
    <div className="sf-growth-thesis" data-reveal><p>Help small teams publish a form that looks like theirs, then turn its answers into useful next steps.</p><p>The next constraint is distribution and repeat use. More features only matter if the right people find the product, publish a form, and come back.</p></div>
    <div className="sf-market" data-reveal>
      <h3>The category is proven</h3>
      <div className="sf-market-comparison">
        <article><h4>Google Forms</h4><strong className="sf-market-number">500k</strong><p>Responses per form under Google&rsquo;s limits introduced in September 2026. Google also documents a 100,000-response threshold for Sheets sync. That is a strong utility baseline, not a claim about the number of Forms users.</p><a href="https://support.google.com/docs/answer/139706?hl=en" target="_blank" rel="noreferrer">Google&rsquo;s response limits ↗</a></article>
        <article><h4>Typeform</h4><strong className="sf-market-number">150,000+</strong><p>Businesses, according to Typeform. Its Basic plan lists 100 responses a month at $39/month when billed monthly. The category supports paid products built around the quality of the experience.</p><div className="sf-source-links"><a href="https://www.typeform.com/about-us" target="_blank" rel="noreferrer">Typeform&rsquo;s company figures ↗</a><a href="https://www.typeform.com/pricing" target="_blank" rel="noreferrer">Plans and pricing ↗</a></div></article>
      </div>
      <p className="sf-growth-note">Sources checked 14 October 2026. These figures describe different things—capacity, business adoption and pricing—and are not comparable market shares.</p>
    </div>
    <div className="sf-growth-target" data-reveal><div><h3>My next three months</h3><p className="sf-target-number">2,000+</p><p>Users. My stated acquisition goal, not an achieved result.</p></div><div><h3>A twelve-month scenario</h3><p className="sf-target-number">8,000+</p><p>If the same 2,000-user goal is reached in each of four quarters. This is a linear planning scenario, not a forecast or a measured growth rate.</p></div></div>
    <div className="sf-growth-plan" data-reveal>
      <article><h3>Search for a job, land on a form</h3><p>Build SEO around specific work: event registrations, workshop signups, client intake and feedback. Each page should offer a useful template, a real preview and a direct route into the builder. A generic &ldquo;AI form builder&rdquo; page cannot answer all those needs.</p><p><strong>Measure:</strong> non-brand search visits → template starts → first published form. Rank and traffic alone do not establish product demand.</p></article>
      <article><h3>Show the product doing the work</h3><p>Make organic demos from real workflows: a brief becomes a form, a plain-language edit improves it, a chosen aesthetic gives it a distinct identity. Pair those clips with useful templates and examples. The product supplies the evidence and the reason to try it.</p><p><strong>Why organic first:</strong> it tests which use cases resonate before paying to amplify them. Search pages and reusable demonstrations can keep working after publication; whether they do must be measured.</p></article>
      <article><h3>Keep creators after the first link</h3><p>The product roadmap goes beyond collecting answers: partial-response visibility, useful follow-up, and tools that connect a submission to an outcome. Prioritize one recurring use case, then test whether seeing useful responses brings its creators back.</p><p><strong>Measure:</strong> creators receiving a first response, a second published form within 30 days, and paid retention by cohort. Roadmap features are proposed work, not shipped claims.</p></article>
    </div>
    <div className="sf-funnel" data-reveal><h3>Make the goal testable</h3><p>One working acquisition scenario for the first three months:</p><ol><li><strong>20,000</strong><span>qualified visits</span></li><li><strong>10%</strong><span>visit-to-signup assumption</span></li><li><strong>2,000</strong><span>new users</span></li></ol><p>If signup conversion is 5%, the traffic requirement doubles to 40,000. I would instrument the funnel before scaling content, then set publication and repeat-use targets from the first real cohorts.</p><p className="sf-growth-note">Only the 2,000+ user goal came from me. Traffic and conversion figures are explicit planning assumptions; there is no verified baseline or revenue forecast attached.</p></div>
  </div>;
}
