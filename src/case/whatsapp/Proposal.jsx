import React, { useCallback, useState } from 'react';
import { CATS, CAT_ORDER } from './data.js';
import { InboxPhone } from './Phone.jsx';

const TREATMENT = [
  { cat: 'people', to: 'Main chat list', how: 'Notifies as usual' },
  { cat: 'marketing', to: 'Business, Offers', how: 'No sound. Grouped by business. Findable by search' },
  { cat: 'utility', to: 'Business, Updates', how: 'Still notifies. Delivery, tickets, receipts' },
  { cat: 'auth', to: 'Verification inbox', how: 'Instant. Short-lived. No replies. Never delayed' },
];

// The live prototype: make a message arrive and see how the inbox treats it, as it is and sorted.
export function ProposalStage() {
  const [mode, setMode] = useState('sorted');
  const [last, setLast] = useState(null);
  const onArrival = useCallback(item => setLast(item), []);
  const sorted = mode === 'sorted';
  return <div className="wi-proposal">
    <div className="wi-proposal-copy">
      <ul className="wi-treat">
        {TREATMENT.map(row => <li key={row.cat} style={{ '--cat': CATS[row.cat].deep, '--tint': row.cat === 'people' ? '#fff' : CATS[row.cat].tint }}>
          <div><strong>{CATS[row.cat].label}<span> goes to </span>{row.to}</strong><p>{row.how}</p></div>
        </li>)}
      </ul>
      <div className="wi-toggle" role="group" aria-label="Choose how the inbox is arranged">
        <button type="button" aria-pressed={!sorted} onClick={() => setMode('asis')}>As it is</button>
        <button type="button" aria-pressed={sorted} onClick={() => setMode('sorted')}>Sorted by category</button>
      </div>
      <div className="wi-readout" aria-live="polite">
        {last ? <>
          <p className="wi-readout-title">{last.label}</p>
          <dl>
            <div data-on={!sorted}><dt>As it is</dt><dd>{last.asIs}</dd></div>
            <div data-on={sorted}><dt>Sorted</dt><dd>{last.sorted}</dd></div>
          </dl>
        </> : <p className="wi-readout-title">Tap a button under the phone to make a message arrive.</p>}
      </div>
    </div>
    <div className="wi-proposal-phone"><InboxPhone mode={mode} showSend onArrival={onArrival}/></div>
  </div>;
}

const SCREENS = [
  { id: 'chats', screen: 'chats', title: 'Chats', note: 'People stay. Business and Verification sit on top with their own counts.' },
  { id: 'updates', screen: 'business', tab: 'utility', title: 'Business, Updates', note: 'Delivery and tickets still notify you.' },
  { id: 'offers', screen: 'business', tab: 'marketing', title: 'Business, Offers', note: 'No sound and no badge in your chat list.' },
  { id: 'verify', screen: 'verify', title: 'Verification', note: 'Instant, short-lived, no replies.' },
];

export function ScreenSet() {
  return <div className="wi-screens">
    {SCREENS.map(item => <figure key={item.id} data-reveal>
      <InboxPhone mode="sorted" initialScreen={item.screen} initialTab={item.tab} frozen/>
      <figcaption><strong>{item.title}</strong>{item.note}</figcaption>
    </figure>)}
  </div>;
}

export const RULES = [
  ['Sort by the label, not the sender.', 'Meta already asks every business to declare a category. Use it, whatever the size of the business.'],
  ['Never delay a code.', 'Codes arrive instantly and expire. They are the one thing a wait can break.'],
  ['Quiet is not hidden.', 'Promotions get no sound and no badge in your chat list, and stay searchable.'],
  ['Your choice wins.', 'You can move a business back to your chats, or switch the whole thing off.'],
];
export { CAT_ORDER };
