import React, { useState } from 'react';

// Each entry mirrors a PRD written for this study. Scores and targets in the PRDs are my own judgement, not measurements.
const PRDS = [
  {
    id: 'business', name: 'Business tab', cat: 'marketing',
    problem: 'Business and promotional messages crowd the main chat list. WhatsApp\'s folder test sorts only large senders, and only after up to 24 hours.',
    recommend: 'Instant sorting by the category each sender declares, into one Business tab. Start with large verified senders and sort marketing at once. Add small verified senders and the verification strip later.',
    options: ['Do nothing, rely on existing filters', 'A delayed folder for large senders (WhatsApp\'s test)', 'Instant sorting by category into one Business tab', 'Senders pay for visibility', 'Rules the user writes'], chosen: [2],
    weak: 'My scores are judgement, not measurements. I could not confirm how WhatsApp\'s folder treats one-time codes.',
    test: 'Instant sorting against 6-hour and 24-hour delays and a control. The guardrail is missed time-sensitive messages.',
  },
  {
    id: 'verify', name: 'Verification inbox', cat: 'auth',
    problem: 'Codes from many businesses land in separate chats. A pooled place has to be safe, and it must never be slow.',
    recommend: 'A hybrid: a pooled verification inbox, backed by SMS as a fallback and by the phone\'s own autofill.',
    options: ['A pooled verification inbox', 'Per-business threads that collapse and expire', 'Phone-level autofill, no inbox', 'Passkeys or another phishing-resistant replacement', 'SMS only', 'The hybrid'], chosen: [5],
    weak: 'It rests on one student\'s report that people care. I could not read RBI\'s own text on which channel codes may use.',
    test: 'A pilot with a few large senders. Measure time from request to code use, failures and resends.',
  },
  {
    id: 'consent', name: 'Consent centre', cat: 'people',
    problem: 'People cannot see why a business can message them, or control it. Consent became passive in July 2020.',
    recommend: 'A preference centre with consent provenance: per-business and per-category controls, "why am I seeing this", consent receipts and one switch for all marketing.',
    options: ['Status quo plus stricter policy', 'A stop link on every message', 'A preference centre with provenance', 'A consent manager under the data protection law', 'A national do-not-disturb registry', 'Opt-in only by default'], chosen: [2],
    weak: 'Scores are my judgement. Whether telecom rules reach WhatsApp is uncertain. This is not legal advice.',
    test: 'Share of business chats that show a consent source, time to opt out, and blocks and reports.',
  },
  {
    id: 'calls', name: 'Unknown callers', cat: 'utility',
    problem: 'Anyone with your number can ring you. "Digital arrest" scammers use that, then a video call, to pressure people into paying.',
    recommend: 'Card first, not silence first. Show a context card on a first call from a non-contact. Ring normally when there is a shared group or verified status. Silence only above a high-risk threshold. Add friction on first video calls and on screen-share from strangers.',
    options: ['Keep the opt-in setting', 'Silence all unknown callers, with a card', 'Friction on a first video call', 'Verified officials and businesses', 'Warnings mid-call, screen-share checks', 'Phone-company caller names or SIM binding', 'On-device scam detection'], chosen: [1, 2, 4], notes: { 1: 'Softened' }, scores: [18, 21, 23, 21, 22, 18, 18],
    weak: 'Totals are my judgement. The "police do not arrest by video call" wording rests on a news report of an advisory, not the advisory itself.',
    test: 'Card against silence against a control. Track legitimate calls that were missed.',
  },
  {
    id: 'takeover', name: 'Account takeover', cat: 'auth',
    problem: 'Scammers take accounts by getting you to share a code or link their device. A hijacked account then messages your contacts.',
    recommend: 'Ship clearer prompts everywhere first. Add a cool-off on newly linked devices only for risky attempts and for accounts without two-step verification. Nudge towards two-step verification and passkeys instead of mandating them. Invest in recovery.',
    options: ['Clearer prompts only', 'A cool-off on new linked devices', 'Mandatory strong linking', 'SIM binding as the state wants it', 'Risk scoring on link attempts', 'Stronger recovery and trusted contacts'], chosen: [0, 1, 4, 5],
    weak: 'SIM binding\'s status is disputed between sources. WhatsApp\'s changes after the GhostPairing advisory are known only from secondary pages.',
    test: 'Extra friction against a control. Watch for legitimate new-device links that give up.',
  },
  {
    id: 'economics', name: 'Sender economics', cat: 'marketing',
    problem: 'The platform is paid per delivered promotion and decides how visible it is. That mix can weaken the push to cut volume.',
    recommend: 'Start with transparency reporting and an independent audit. Then audit template categories, with penalties. Add caps that follow user preference. Pilot quality-adjusted pricing last, because its effect on small sellers and on revenue is uncertain.',
    options: ['Status quo plus caps', 'Quality-adjusted pricing', 'Caps by user preference', 'Template-category audits with penalties', 'User-priced attention', 'Transparency reporting and an audit', 'A national registry'], chosen: [5, 3, 2, 1],
    weak: 'India\'s rates come from a vendor guide, and the break-even inputs are my assumptions.',
    test: 'Price signals on a small slice of marketing traffic, with kill criteria for harm to small sellers.',
  },
];

const TONE = { marketing: 'var(--c-marketing)', auth: 'var(--c-auth)', utility: 'var(--c-utility)', people: 'var(--c-people)' };

export default function PrdExplorer() {
  const [id, setId] = useState('business');
  const prd = PRDS.find(item => item.id === id);
  return <div className="wi-prd" data-reveal>
    <div className="wi-prd-tabs" role="tablist" aria-label="The six problems">
      {PRDS.map(item => <button key={item.id} type="button" role="tab" aria-selected={id === item.id} onClick={() => setId(item.id)} style={{ '--tone': TONE[item.cat] }}><i aria-hidden="true"/>{item.name}</button>)}
    </div>
    <div className="wi-prd-body" role="tabpanel" key={id}>
      <div className="wi-prd-main">
        <h3>{prd.name}</h3>
        <p className="wi-prd-problem">{prd.problem}</p>
        <div className="wi-prd-reco"><strong>What I recommend</strong><p>{prd.recommend}</p></div>
        <dl className="wi-prd-facts">
          <div><dt>The first test</dt><dd>{prd.test}</dd></div>
          <div><dt>Where it is weakest</dt><dd>{prd.weak}</dd></div>
        </dl>
      </div>
      <div className="wi-prd-opts">
        <h4>Options I weighed</h4>
        <ul>
          {prd.options.map((label, index) => {
            const picked = prd.chosen.includes(index);
            const score = prd.scores?.[index];
            return <li key={label} data-picked={picked || undefined}>
              <span className="wi-opt-label">{label}</span>
              {score ? <span className="wi-opt-score" aria-label={`Score ${score} of 30`}><i style={{ width: `${score / 30 * 100}%` }}/><b>{score}</b></span> : null}
              {picked ? <em>{prd.notes?.[index] || 'Recommended'}</em> : null}
            </li>;
          })}
        </ul>
        {prd.scores && <p className="case-caption">Totals out of 30, from six criteria scored 1 to 5. My judgement, not measurements.</p>}
      </div>
    </div>
  </div>;
}
