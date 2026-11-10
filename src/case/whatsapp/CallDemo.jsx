import React, { useState } from 'react';
import { FitBox, PHONE_W, PHONE_H } from './Phone.jsx';

// An illustrative incoming-call screen. The signals and the threshold are design settings for this study, not WhatsApp's.
const SCENARIOS = [
  {
    id: 'courier', label: 'A courier at your gate', name: '+91 98xxx 41021', claim: 'Fresh Mart Delivery',
    signals: [['ok', 'A verified business'], ['ok', 'Account is two years old'], ['neutral', 'Not in your contacts']],
    asIs: 'Rings. You see a number and nothing else.', card: 'Rings, with a card that says who is calling.', silenced: false,
  },
  {
    id: 'classmate', label: 'A classmate from a group', name: 'Ishaan', claim: 'Not saved in your contacts',
    signals: [['ok', 'Shares two groups with you: Hostel 4B, Project'], ['ok', 'Account is three years old'], ['neutral', 'Not in your contacts']],
    asIs: 'Rings. You may not know who this is.', card: 'Rings, with a card showing the groups you share.', silenced: false,
  },
  {
    id: 'scam', label: 'A caller claiming to be police', name: '+84 90xxx 22817', claim: 'Calls itself "Delhi Police"',
    signals: [['bad', 'Account is three days old'], ['bad', 'Number is from outside India'], ['bad', 'Reported by 14 people this week'], ['bad', 'Claims to be police but is not verified']],
    asIs: 'Rings. A video call can follow, and the name looks official.', card: 'Silenced. It waits in your call list with a warning. Nothing rings.', silenced: true,
  },
];

function CallScreen({ scenario, card }) {
  const silenced = card && scenario.silenced;
  const initials = scenario.name.startsWith('+') ? '?' : scenario.name.slice(0, 2).toUpperCase();
  return <div className="wi-phone wi-call-phone" data-ui role="group" aria-label={`Illustrative incoming call from ${scenario.name}`}>
    <div className="wi-glass wi-call">
      <div className="wi-status" aria-hidden="true"><span>9:41</span><span className="wi-status-dots"><i/><i/><i/></span></div>
      <div className="wi-call-top">
        <span className="wi-call-avatar" aria-hidden="true">{initials}</span>
        <h3>{scenario.name}</h3>
        <p>{silenced ? 'This call did not ring' : 'WhatsApp voice call'}</p>
        <small>{scenario.claim}</small>
      </div>
      {card && <div className="wi-call-card" data-risk={scenario.silenced ? 'high' : 'low'}>
        <strong>{scenario.silenced ? 'Why this was silenced' : 'About this caller'}</strong>
        <ul>{scenario.signals.map(([tone, text]) => <li key={text} data-tone={tone}><i aria-hidden="true"/>{text}</li>)}</ul>
      </div>}
      <div className="wi-call-actions">
        {silenced
          ? <><span><b className="wi-call-btn" data-kind="report">Report</b>Report</span><span><b className="wi-call-btn" data-kind="block">Block</b>Block</span></>
          : <><span><b className="wi-call-btn" data-kind="decline">End</b>Decline</span><span><b className="wi-call-btn" data-kind="answer">Call</b>Answer</span></>}
      </div>
    </div>
  </div>;
}

export default function CallDemo() {
  const [mode, setMode] = useState('asis');
  const [id, setId] = useState('scam');
  const scenario = SCENARIOS.find(item => item.id === id);
  const card = mode === 'card';
  return <div className="wi-calldemo" data-reveal>
    <div className="wi-call-copy">
      <div className="wi-toggle" role="group" aria-label="Choose how calls from unknown numbers are shown">
        <button type="button" aria-pressed={!card} onClick={() => setMode('asis')}>As it is</button>
        <button type="button" aria-pressed={card} onClick={() => setMode('card')}>Card first</button>
      </div>
      <div className="wi-call-who" role="group" aria-label="Who is calling">
        {SCENARIOS.map(item => <button key={item.id} type="button" className="case-chip" aria-pressed={id === item.id} onClick={() => setId(item.id)}>{item.label}</button>)}
      </div>
      <div className="wi-readout" aria-live="polite">
        <p className="wi-readout-title">{scenario.label}</p>
        <dl>
          <div data-on={!card}><dt>As it is</dt><dd>{scenario.asIs}</dd></div>
          <div data-on={card}><dt>Card first</dt><dd>{scenario.card}</dd></div>
        </dl>
      </div>
      <p className="case-caption">Card first means a context card on a first call from a non-contact, normal ringing when there is a shared group or verified status, and silence only above a high-risk threshold. The signals and the threshold here are design settings for this study. They are not WhatsApp's.</p>
    </div>
    <div className="wi-call-stage" data-stage="ready">
      <FitBox width={PHONE_W} height={PHONE_H}><CallScreen scenario={scenario} card={card} key={`${id}-${mode}`}/></FitBox>
    </div>
  </div>;
}
