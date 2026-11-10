import React from 'react';
import './prd.css';
import '../styles/whatsapp-inbox.css';
import { CasePage, CaseHero, Chapter, Prose, Statement } from '../kit.jsx';
import { PRDS, pageSlug, pageHref } from './registry.js';
import { caseIndex } from '../caseIndex.js';
import { InboxPhone } from '../whatsapp/Phone.jsx';
import { ProposalStage } from '../whatsapp/Proposal.jsx';
import CallDemo from '../whatsapp/CallDemo.jsx';
import ConsentDemo from '../whatsapp/ConsentDemo.jsx';
import LinkDemo from '../whatsapp/LinkDemo.jsx';
import { PriceBars, BreakEven } from '../whatsapp/Economics.jsx';

const ACCENT = { marketing: '#b93c24', auth: '#256349', utility: '#3f5b79', people: '#30312e' };

// The interactive piece for each PRD, shown right after the opening.
function Prototype({ data }) {
  switch (data.slug) {
    case 'business-tab': return <ProposalStage/>;
    case 'verification-inbox': return <VerifyStage/>;
    case 'consent-centre': return <ConsentDemo/>;
    case 'unknown-callers': return <CallDemo/>;
    case 'account-takeover': return <LinkDemo/>;
    case 'sender-economics': return <div data-stage="ready"><PriceBars/><div style={{ height: 40 }}/><BreakEven/></div>;
    default: return null;
  }
}

const PROTO_TITLE = {
  'business-tab': 'Make a message arrive.',
  'verification-inbox': 'Ask for a code.',
  'consent-centre': 'See where a permission came from.',
  'unknown-callers': 'Take the call.',
  'account-takeover': 'Be asked to link a device.',
  'sender-economics': 'Would the sender still send it?',
};

function VerifyStage() {
  return <div className="wi-proposal">
    <div className="wi-proposal-copy">
      <ul className="wi-treat">
        {[['Instant', 'A code is never delayed or sorted later.'], ['Short-lived', 'It expires, and then it is gone.'], ['No replies', 'You cannot answer it, so a stranger cannot pose as it.'], ['Its own place', 'It never mixes with your chats or the business tab.']].map(([title, body]) =>
          <li key={title} style={{ '--cat': '#256349', '--tint': '#e1f0e9' }}><div><strong>{title}</strong><p>{body}</p></div></li>)}
      </ul>
      <p className="case-caption">Tap "A login code" under the phone. The expiry time is a design setting that this PRD tests.</p>
    </div>
    <div className="wi-proposal-phone"><InboxPhone mode="sorted" initialScreen="verify" showSend sendIds={['code']}/></div>
  </div>;
}

function Tldr({ data }) {
  return <div className="pp-tldr">
    <div className="pp-tldr-block" data-tone="paper"><h3>The problem</h3><p>{data.problem?.[0]}</p></div>
    <div className="pp-tldr-block" data-tone="ink"><h3>What I recommend</h3><p>{tidy(data.recommendation?.headline)}</p></div>
    {data.experiments?.arms?.length > 0 && <div className="pp-tldr-block" data-tone="blush"><h3>The first test</h3><p>{data.experiments.arms.join('. ')}.</p></div>}
  </div>;
}

const tidy = text => (text || '').replace(/^I recommend\s+/i, '').replace(/^./, c => c.toUpperCase());
const trustClass = trust => (trust || 'Medium').toLowerCase();

export default function PrdPage({ data }) {
  const index = PRDS.findIndex(item => item.slug === data.slug);
  const nextPrd = PRDS[index + 1];
  const next = nextPrd
    ? { slug: pageSlug(nextPrd), name: nextPrd.name, line: nextPrd.line, label: 'Next PRD' }
    : { slug: 'whatsapp-inbox', name: 'The full study', line: 'Back to where these six problems come from.', label: 'Back to the study' };
  const parentStudy = caseIndex.find(item => item.slug === 'whatsapp-inbox');
  const accent = parentStudy.color;
  const p0 = (data.requirements || []).filter(item => item.priority === 'P0');
  const rest = (data.requirements || []).filter(item => item.priority !== 'P0');
  return <CasePage slug={pageSlug(data)} accent={accent} ink={parentStudy.ink} parent={{ name: 'The full study', href: '/work/whatsapp-inbox/' }} next={next}>
    <CaseHero
      name={`WhatsApp PRD, ${data.number} of ${PRDS.length}`}
      title={data.title}
      lede={data.line}
      facts={[
        { label: 'Kind', value: 'Product requirements document' },
        { label: 'Part of', value: 'WhatsApp, in India: the inbox became a billboard' },
        { label: 'Status', value: 'Independent proposal, not Meta\'s plan' },
        { label: 'Targets', value: 'My placeholders, not benchmarks' },
      ]}
      links={[{ href: '#try-it', label: 'Try the prototype' }, { href: '/work/whatsapp-inbox/', label: 'Read the full study' }]}
      stage={<Tldr data={data}/>}
    />

    <Chapter id="try-it" title="Try it" heading={PROTO_TITLE[data.slug] || 'Try it.'} tone="paper">
      <Prototype data={data}/>
    </Chapter>

    <Chapter id="problem" title="The problem" heading="Who it hurts, and how.">
      <div className="wi-intro"><Prose>{(data.problem || []).map(text => <p key={text}>{text}</p>)}</Prose></div>
      <div className="pp-users">
        {(data.users || []).map(user => <article key={user.who} data-reveal><h3>{user.who}</h3><p className="pp-job">{user.job}</p><p className="pp-cost"><strong>If it fails</strong>{user.cost}</p></article>)}
      </div>
    </Chapter>

    <Chapter id="evidence" title="Evidence" heading="What the evidence says." tone="paper">
      <div className="pp-evidence">
        {(data.evidence || []).map(item => <article key={item.fact} data-reveal><p>{item.fact}</p><footer><span>{item.source}</span><b data-trust={trustClass(item.trust)}>{item.trust}</b></footer></article>)}
      </div>
      <p className="wi-source" data-reveal>Trust is how far to rely on the source: High is primary or well-sourced, Low is a vendor or a search snippet.</p>
    </Chapter>

    <Chapter id="options" title="Options" heading="Options I weighed.">
      <div className="pp-options">
        {(data.options || []).map(option => <article key={option.label} data-picked={option.picked || undefined} data-reveal>
          <header><h3>{option.label}</h3>{option.picked && <em>Recommended</em>}</header>
          {option.note && <p>{option.note}</p>}
          {option.weakness && <p className="pp-weak"><strong>Weak spot</strong>{option.weakness}</p>}
          {option.score != null && data.scoreMax && <div className="pp-score" aria-label={`Score ${option.score} of ${data.scoreMax}`}><i style={{ width: `${option.score / data.scoreMax * 100}%` }}/><b>{option.score}</b></div>}
        </article>)}
      </div>
      {data.scoreMax && <p className="wi-source" data-reveal>Scores are out of {data.scoreMax}. They are my judgement, not measurements.</p>}
    </Chapter>

    <Chapter id="recommendation" title="Recommendation" heading="What I recommend." tone="ink">
      <Statement>{tidy(data.recommendation?.headline)}</Statement>
      <div className="pp-reco">
        {data.recommendation?.why && <div data-reveal><h3>Why</h3><p>{data.recommendation.why}</p></div>}
        {data.recommendation?.firstPhase && <div data-reveal><h3>First phase</h3><p>{data.recommendation.firstPhase}</p></div>}
      </div>
    </Chapter>

    <Chapter id="requirements" title="Requirements" heading="What it must do.">
      <ul className="pp-reqs">
        {[...p0, ...rest].map(item => <li key={item.id} data-reveal><span className="pp-pri" data-p={item.priority}>{item.priority}</span><div><p>{item.text}</p>{item.accept && <small><strong>Done when</strong> {item.accept}</small>}</div></li>)}
      </ul>
      <p className="wi-source" data-reveal>P0 means the first release cannot ship without it. P1 follows soon after.</p>
    </Chapter>

    {(data.flows || []).length > 0 && <Chapter id="flows" title="How it works" heading="How it works." tone="paper">
      <div className="pp-flows">
        {data.flows.map(flow => <article key={flow.title} data-reveal><h3>{flow.title}</h3><ol>{flow.steps.map(step => <li key={step}>{step}</li>)}</ol></article>)}
      </div>
    </Chapter>}

    <Chapter id="testing" title="Testing" heading="How I would test it.">
      <div className="pp-test">
        <div className="pp-test-card" data-reveal>
          <h3>The experiment</h3>
          <div className="pp-arms">{(data.experiments?.arms || []).map(arm => <span key={arm}>{arm}</span>)}</div>
          {data.experiments?.guardrail && <p><strong>Guardrail</strong>{data.experiments.guardrail}</p>}
          {(data.experiments?.kill || []).length > 0 && <><strong className="pp-kill">Stop if</strong><ul>{data.experiments.kill.map(item => <li key={item}>{item}</li>)}</ul></>}
        </div>
        <ul className="pp-metrics" data-reveal>
          {(data.metrics || []).map(item => <li key={item.metric}><strong>{item.metric}</strong><p>{item.definition}</p>{item.guardrail && <small>Guardrail: {item.guardrail}</small>}</li>)}
        </ul>
      </div>
      <div className="pp-phases">
        {(data.rollout || []).map(phase => <article key={phase.phase} data-reveal><h3>{phase.phase}</h3><p>{phase.what}</p></article>)}
      </div>
      <p className="wi-source" data-reveal>Baselines are mostly not public. Every target here is a placeholder from me, not a benchmark.</p>
    </Chapter>

    <Chapter id="risks" title="Risks" heading="Risks and objections." tone="paper">
      <div className="pp-two">
        <div>
          <h3 className="wi-figure-title" data-reveal>What could go wrong</h3>
          <ul className="pp-cards">{(data.risks || []).map(item => <li key={item.risk} data-reveal><strong>{item.risk}</strong><p>{item.mitigation}</p></li>)}</ul>
        </div>
        <div>
          <h3 className="wi-figure-title" data-reveal>The best arguments against</h3>
          <ul className="pp-cards">{(data.against || []).map(item => <li key={item.objection} data-reveal><strong>{item.objection}</strong><p>{item.answer}</p></li>)}</ul>
        </div>
      </div>
    </Chapter>

    <Chapter id="limits" title="Limits and sources" heading="What I could not verify.">
      <div className="pp-two">
        <div data-reveal>
          <h3 className="wi-figure-title">Weakest claims</h3>
          <ul className="wi-verify">{(data.limits || []).map(item => <li key={item}>{item}</li>)}</ul>
          {(data.openQuestions || []).length > 0 && <><h3 className="wi-figure-title" style={{ marginTop: 40 }}>Still open</h3><ul className="wi-verify">{data.openQuestions.map(item => <li key={item}>{item}</li>)}</ul></>}
        </div>
        <div className="wi-sources" data-reveal>
          <ul>{(data.sources || []).map(item => <li key={item.name} data-trust={item.trust}><a href={item.href} target="_blank" rel="noreferrer">{item.name}<span aria-hidden="true"> ↗</span></a><b className="wi-src-trust">{item.trust}</b></li>)}</ul>
        </div>
      </div>
      <p className="wi-source" data-reveal>An independent proposal built from public sources. Not affiliated with Meta or WhatsApp. <a href="/work/whatsapp-inbox/" style={{ textDecoration: 'underline' }}>Read the full study</a>.</p>
    </Chapter>
  </CasePage>;
}
