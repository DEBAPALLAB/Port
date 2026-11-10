import React, { useState } from 'react';
import { FitBox, PHONE_W, PHONE_H } from './Phone.jsx';

// An illustrative consent centre. Businesses and records are invented. This is not legal advice and not WhatsApp's interface.
const START = [
  { id: 'urban', name: 'Urban Threads', source: 'Checkout, 12 Mar 2026', agreed: 'Offers and order updates', number: '4102', offers: true, updates: true, record: true },
  { id: 'nest', name: 'NestMart', source: 'You messaged first, 3 Feb 2026', agreed: 'Replies to your questions', number: '4102', offers: false, updates: true, record: true },
  { id: 'trip', name: 'TripNow', source: 'No record of your permission', agreed: 'Nothing on file', number: '4102', offers: true, updates: false, record: false },
  { id: 'campus', name: 'CampusPrint', source: 'College admission form, 8 Jul 2026', agreed: 'Exam and fee updates', number: '4102', offers: false, updates: true, record: true },
];

function Switch({ on, onChange, label }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className="wi-switch" onClick={() => onChange(!on)}><i/></button>;
}

export default function ConsentDemo() {
  const [shops, setShops] = useState(START);
  const [marketing, setMarketing] = useState(true);
  const [sheet, setSheet] = useState(null);
  const [said, setSaid] = useState('Tap "Why am I seeing this?" on any business, flip a switch, or turn all marketing off.');
  const set = (id, patch, message) => { setShops(list => list.map(shop => shop.id === id ? { ...shop, ...patch } : shop)); if (message) setSaid(message); };
  const shop = shops.find(item => item.id === sheet);
  const offersShown = shops.filter(item => item.offers && marketing).length;
  return <div className="wi-calldemo" data-reveal>
    <div className="wi-call-copy">
      <div className="wi-readout" aria-live="polite">
        <p className="wi-readout-title">What just happened</p>
        <dl><div data-on="true"><dt>Result</dt><dd>{said}</dd></div><div data-on="true"><dt>Offers now</dt><dd>{marketing ? `${offersShown} of ${shops.length} businesses can still send you offers.` : 'No business can send you offers.'}</dd></div></dl>
      </div>
      <p className="case-caption">The businesses, dates and records here are invented. The idea is that you can see where each permission came from, change it per business and per kind of message, and report a sender that has no record. This is a design sketch, not legal advice.</p>
    </div>
    <div className="wi-call-stage" data-stage="ready">
      <FitBox width={PHONE_W} height={PHONE_H}>
        <div className="wi-phone" data-ui role="group" aria-label="Illustrative consent centre">
          <div className="wi-glass">
            <div className="wi-status" aria-hidden="true"><span>9:41</span><span className="wi-status-dots"><i/><i/><i/></span></div>
            <header className="wi-bar"><h3>Business messages</h3></header>
            <div className="wi-consent-all"><div><strong>Offers from all businesses</strong><span>{marketing ? 'On. Each business below can still be turned off.' : 'Off. Updates like delivery and tickets still arrive.'}</span></div><Switch on={marketing} label="Offers from all businesses" onChange={value => { setMarketing(value); setSaid(value ? 'Offers are allowed again, business by business.' : 'All offers are off. Updates still arrive.'); }}/></div>
            <div className="wi-list wi-consent-list">
              {shops.map(item => <article key={item.id} className="wi-consent" data-flag={!item.record || undefined}>
                <div className="wi-consent-head"><strong>{item.name}</strong><span>{item.source}</span></div>
                <div className="wi-consent-rows">
                  <label><span>Offers</span><Switch on={item.offers && marketing} label={`Offers from ${item.name}`} onChange={value => set(item.id, { offers: value }, `Offers from ${item.name} are ${value ? 'on' : 'off'}.`)}/></label>
                  <label><span>Updates</span><Switch on={item.updates} label={`Updates from ${item.name}`} onChange={value => set(item.id, { updates: value }, `Updates from ${item.name} are ${value ? 'on' : 'off'}.`)}/></label>
                </div>
                <button type="button" className="wi-consent-why" onClick={() => setSheet(item.id)}>Why am I seeing this?</button>
              </article>)}
            </div>
            {shop && <div className="wi-sheet" role="dialog" aria-label={`Why you hear from ${shop.name}`}>
              <h4>{shop.record ? `Why you hear from ${shop.name}` : `${shop.name} has no record of your permission`}</h4>
              <dl>
                <div><dt>Where it came from</dt><dd>{shop.source}</dd></div>
                <div><dt>You agreed to</dt><dd>{shop.agreed}</dd></div>
                <div><dt>Number used</dt><dd>ending {shop.number}</dd></div>
              </dl>
              <div className="wi-sheet-actions">
                {shop.record
                  ? <button type="button" onClick={() => { set(shop.id, { offers: false }, `Offers from ${shop.name} are off.`); setSheet(null); }}>Stop offers</button>
                  : <button type="button" data-hot onClick={() => { set(shop.id, { offers: false, updates: false }, `${shop.name} is stopped and reported for having no record.`); setSheet(null); }}>Stop and report</button>}
                <button type="button" onClick={() => setSheet(null)}>Close</button>
              </div>
            </div>}
          </div>
        </div>
      </FitBox>
    </div>
  </div>;
}
