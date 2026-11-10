import React, { useMemo, useState } from 'react';
import { CATS } from './data.js';

// Rates are vendor-reported for January 2026. Meta's new India rate card applies from 1 October 2026, so these may have moved.
const PRICES = [
  { id: 'auth', label: 'Authentication', value: 0.115, text: 'Rs 0.115', color: CATS.auth.color },
  { id: 'utility', label: 'Utility', value: 0.12, text: 'Rs 0.11 to 0.13', color: CATS.utility.color },
  { id: 'sms', label: 'SMS one-time code', value: 0.15, text: 'Rs 0.10 to 0.20', color: '#8d8b83' },
  { id: 'marketing', label: 'Marketing', value: 0.87, text: 'Rs 0.86 to 0.88', color: CATS.marketing.color },
];

export function PriceBars() {
  return <div className="wi-prices" data-reveal>
    <ul>
      {PRICES.map(row => <li key={row.id}>
        <span className="wi-price-label">{row.label}</span>
        <span className="wi-price-track"><i className="wi-price-fill" style={{ width: `${row.value * 100}%`, background: row.color }}/></span>
        <b className="wi-price-value">{row.text}</b>
      </li>)}
    </ul>
    <p className="case-caption">Price per delivered message, as vendors reported it for January 2026. Bars share one scale from Rs 0 to Rs 1. Meta's new India rate card applies from 1 October 2026, so check it before quoting a rate.</p>
  </div>;
}

const MARKETING = 0.87;
const ARCHETYPES = [
  { id: 'cart', name: 'Cart reminder', conv: 20 },
  { id: 'sale', name: 'Sale blast', conv: 3 },
  { id: 'cold', name: 'Cold offer', conv: 0.5 },
];
const rs = value => `Rs ${value < 1 ? value.toFixed(2) : value < 10 ? value.toFixed(2) : value.toFixed(1)}`;

// Would the sender still send? Expected margin per message against the price of one.
export function BreakEven() {
  const [mult, setMult] = useState(1);
  const [aov, setAov] = useState(500);
  const [margin, setMargin] = useState(10);
  const price = MARKETING * mult;
  const rows = useMemo(() => ARCHETYPES.map(row => ({ ...row, gain: row.conv / 100 * aov * margin / 100 })), [aov, margin]);
  const scale = Math.max(...rows.map(row => row.gain), price) * 1.08;
  const breakEven = price / (aov * margin / 100) * 100;
  return <div className="wi-calc" data-reveal>
    <div className="wi-calc-controls">
      <div className="wi-field"><label htmlFor="wi-mult">Price of a marketing message <b>{mult}x today's rate, {rs(price)}</b></label><input id="wi-mult" type="range" min="1" max="6" step=".5" value={mult} onChange={e => setMult(+e.target.value)}/></div>
      <div className="wi-field"><label htmlFor="wi-aov">Average order <b>Rs {aov}</b></label><input id="wi-aov" type="range" min="200" max="2000" step="50" value={aov} onChange={e => setAov(+e.target.value)}/></div>
      <div className="wi-field"><label htmlFor="wi-margin">Margin on an order <b>{margin}%</b></label><input id="wi-margin" type="range" min="5" max="30" step="1" value={margin} onChange={e => setMargin(+e.target.value)}/></div>
      <p className="wi-calc-note">All inputs here are my assumptions, not data. The point is the shape: a higher price removes the low-converting senders first.</p>
    </div>
    <div className="wi-calc-out" aria-live="polite">
      <p className="wi-calc-big"><b>{breakEven < 10 ? breakEven.toFixed(1) : Math.round(breakEven)}%</b><span>of messages must lead to an order for a sender to break even.</span></p>
      <ul>
        {rows.map(row => {
          const keeps = row.gain >= price;
          return <li key={row.id} data-keeps={keeps}>
            <div className="wi-calc-head"><strong>{row.name}</strong><span>{row.conv}% buy</span><em>{keeps ? 'Keeps sending' : 'Stops'}</em></div>
            <div className="wi-calc-bar" role="img" aria-label={`Earns ${rs(row.gain)} per message against a price of ${rs(price)}`}>
              <i style={{ width: `${Math.min(100, row.gain / scale * 100)}%` }}/>
              <s style={{ left: `${price / scale * 100}%` }}/>
            </div>
            <div className="wi-calc-nums"><span>Earns {rs(row.gain)} a message</span><span>Pays {rs(price)}</span></div>
          </li>;
        })}
      </ul>
    </div>
  </div>;
}
