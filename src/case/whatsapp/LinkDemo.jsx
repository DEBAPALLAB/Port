import React, { useState } from 'react';
import { FitBox, PHONE_W, PHONE_H } from './Phone.jsx';

// An illustrative "link a new device" request. The signals and the wait are design settings for this study, not WhatsApp's.
const SCENARIOS = [
  {
    id: 'mine', label: 'I am linking my laptop', device: 'Windows laptop', place: 'Pune, India', risky: false,
    signals: [['ok', 'You started this on this phone'], ['ok', 'Two-step verification is on'], ['ok', 'The device is in your usual city']],
    ok: 'Linked. You will see the laptop under Linked devices, and you can remove it any time.',
    asIs: 'A normal link. Nothing slows you down.', safer: 'The same link, with no extra wait, because nothing looks risky.',
  },
  {
    id: 'asked', label: 'A message told me to "verify"', device: 'Browser on a PC', place: 'Another country', risky: true,
    signals: [['bad', 'You did not start this from this phone'], ['bad', 'It came from a web page after a message'], ['bad', 'The device is in another country'], ['bad', 'Two-step verification is off']],
    ok: 'Waiting. The device cannot read your chats until the wait ends, and your phone keeps alerting you.',
    cancel: 'Cancelled. That device never saw your chats.',
    asIs: 'A normal link. If you enter the code, the other person reads your chats at once.', safer: 'A wait and a warning. You can cancel, and the device sees nothing meanwhile.',
  },
];

export default function LinkDemo() {
  const [id, setId] = useState('asked');
  const [safer, setSafer] = useState(false);
  const [state, setState] = useState('ask');
  const scenario = SCENARIOS.find(item => item.id === id);
  const reset = (nextId, nextSafer) => { setId(nextId); setSafer(nextSafer); setState('ask'); };
  const hold = safer && scenario.risky;
  const outcome = state === 'ok' ? (hold ? scenario.ok : scenario.id === 'mine' ? scenario.ok : 'Linked at once. The other person now reads your chats and can message your contacts as you.') : state === 'cancel' ? scenario.cancel : null;
  return <div className="wi-calldemo" data-reveal>
    <div className="wi-call-copy">
      <div className="wi-toggle" role="group" aria-label="Choose how linking works">
        <button type="button" aria-pressed={!safer} onClick={() => reset(id, false)}>As it is</button>
        <button type="button" aria-pressed={safer} onClick={() => reset(id, true)}>With a risk check</button>
      </div>
      <div className="wi-call-who" role="group" aria-label="Who started the link">
        {SCENARIOS.map(item => <button key={item.id} type="button" className="case-chip" aria-pressed={id === item.id} onClick={() => reset(item.id, safer)}>{item.label}</button>)}
      </div>
      <div className="wi-readout" aria-live="polite">
        <p className="wi-readout-title">{scenario.label}</p>
        <dl><div data-on={!safer}><dt>As it is</dt><dd>{scenario.asIs}</dd></div><div data-on={safer}><dt>Risk check</dt><dd>{scenario.safer}</dd></div></dl>
      </div>
      <p className="case-caption">An illustrative request. Which signals count as risky, and how long a wait lasts, are design settings for this study. They are not WhatsApp's, and I have left out anything that would help an attacker.</p>
    </div>
    <div className="wi-call-stage" data-stage="ready">
      <FitBox width={PHONE_W} height={PHONE_H}>
        <div className="wi-phone" data-ui role="group" aria-label="Illustrative link-device request" key={`${id}-${safer}`}>
          <div className="wi-glass wi-link">
            <div className="wi-status" aria-hidden="true"><span>9:41</span><span className="wi-status-dots"><i/><i/><i/></span></div>
            <header className="wi-bar"><h3>Link a device?</h3></header>
            <div className="wi-link-body">
              <div className="wi-link-device"><strong>{scenario.device}</strong><span>{scenario.place}</span></div>
              {!safer && state === 'ask' && <p className="wi-link-plain">{scenario.risky ? 'A web page says it needs your phone to confirm something. Linking lets that device read your chats.' : 'Linking lets this device read your chats and send messages as you.'}</p>}
              {safer && <ul className="wi-link-signals">{scenario.signals.map(([tone, text]) => <li key={text} data-tone={tone}><i aria-hidden="true"/>{text}</li>)}</ul>}
              {hold && state === 'ask' && <p className="wi-link-warn"><strong>Did someone ask you to do this?</strong> Scammers ask people to link a device. Waiting costs you nothing.</p>}
              {outcome && <p className="wi-link-out" data-bad={!hold && scenario.risky && state === 'ok' || undefined}>{outcome}</p>}
            </div>
            <div className="wi-link-actions">
              {state === 'ask' && (hold
                ? <><button type="button" data-hot onClick={() => setState('cancel')}>Cancel the link</button><button type="button" onClick={() => setState('ok')}>I started this, continue</button></>
                : <><button type="button" onClick={() => setState('cancel')}>Not me</button><button type="button" data-hot onClick={() => setState('ok')}>Link</button></>)}
              {state !== 'ask' && <button type="button" onClick={() => setState('ask')}>Start again</button>}
            </div>
          </div>
        </div>
      </FitBox>
    </div>
  </div>;
}
