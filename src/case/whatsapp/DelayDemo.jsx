import React, { useState } from 'react';
import { CATS } from './data.js';

const ITEMS = [
  { id: 'a', cat: 'marketing', name: 'Urban Threads', text: 'Flat 40% off your cart, 3 hours left' },
  { id: 'b', cat: 'utility', name: 'QuickBite', text: 'Out for delivery. Arriving in 12 min' },
  { id: 'c', cat: 'marketing', name: 'NestMart', text: 'You left 2 items in your cart' },
  { id: 'd', cat: 'people', name: 'Amma', text: 'Did you eat? Call me when you are free' },
];

function Row({ item, moved }) {
  return <div className="wi-row" data-hidden={moved || undefined} aria-hidden={moved || undefined}>
    <div className="wi-row-clip">
      <div className="wi-mini-row"><i style={{ background: CATS[item.cat].color }} aria-hidden="true"/><span><strong>{item.name}</strong>{item.text}</span></div>
    </div>
  </div>;
}

// Two chat lists, same four messages. One waits for a delay before sorting; the other sorts on arrival.
export default function DelayDemo() {
  const [hours, setHours] = useState(2);
  const [delay, setDelay] = useState(24);
  const sortedByDelay = hours >= delay;
  const inList = ITEMS.filter(item => item.cat !== 'people').length;
  return <div className="wi-delay" data-reveal>
    <div className="wi-delay-controls">
      <div className="wi-field"><label htmlFor="wi-hours">Time since the messages arrived <b>{hours} {hours === 1 ? 'hour' : 'hours'}</b></label><input id="wi-hours" type="range" min="0" max="24" step="1" value={hours} onChange={e => setHours(+e.target.value)}/></div>
      <div className="wi-delay-chips" role="group" aria-label="How long the folder waits before sorting">
        <span>The folder waits</span>
        {[6, 12, 24].map(value => <button key={value} type="button" className="case-chip" aria-pressed={delay === value} onClick={() => setDelay(value)}>{value} hours</button>)}
      </div>
    </div>
    <div className="wi-delay-panels">
      <section className="wi-delay-panel" aria-label="A delayed folder">
        <h4>A delayed folder</h4>
        <p className="wi-delay-count" data-bad={!sortedByDelay}><b>{sortedByDelay ? 0 : inList}</b> business messages in your chat list</p>
        <div className="wi-delay-list" data-ui>
          {ITEMS.map(item => <Row key={item.id} item={item} moved={sortedByDelay && item.cat !== 'people'}/>)}
          <div className="wi-row" data-hidden={!sortedByDelay || undefined}><div className="wi-row-clip"><div className="wi-mini-row wi-mini-folder"><i style={{ background: '#ed5939' }} aria-hidden="true"/><span><strong>Offers and updates</strong>{inList} messages moved here</span></div></div></div>
        </div>
      </section>
      <section className="wi-delay-panel" data-good aria-label="Instant sorting">
        <h4>Instant sorting by category</h4>
        <p className="wi-delay-count"><b>0</b> business messages in your chat list</p>
        <div className="wi-delay-list" data-ui>
          {ITEMS.map(item => <Row key={item.id} item={item} moved={item.cat !== 'people'}/>)}
          <div className="wi-row"><div className="wi-row-clip"><div className="wi-mini-row wi-mini-folder"><i style={{ background: '#ed5939' }} aria-hidden="true"/><span><strong>Business</strong>{inList} messages, sorted on arrival</span></div></div></div>
        </div>
      </section>
    </div>
    <p className="case-caption">An illustration of the reported design: messages from large businesses move after up to 24 hours, and you can switch it off. It is not a recording of WhatsApp's behaviour. Move the slider and notice that Amma's message sits under business messages until the wait ends.</p>
  </div>;
}
