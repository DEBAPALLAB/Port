import { track } from '../../analytics.js';
import React, { useMemo, useState } from 'react';
import { CATS, CAT_ORDER, MESSAGES, count } from './data.js';
import { InboxPhone, useMedia } from './Phone.jsx';

const COLS = 6;

// Sixteen squares, one per conversation. In the inbox as it is, they sit in time order. Sorted, each kind gathers in its own column.
// Sizes come from the panel's own width (container units), so the chart can never be wider than its box.
function UnitChart({ sorted }) {
  const slots = useMemo(() => {
    const perCat = {};
    return MESSAGES.map((msg, index) => {
      const within = perCat[msg.cat] = (perCat[msg.cat] ?? -1) + 1;
      return { msg, asis: { col: index % COLS, row: Math.floor(index / COLS) }, grouped: { col: CAT_ORDER.indexOf(msg.cat), row: within } };
    });
  }, []);
  return <div className="wi-units" data-sorted={sorted || undefined} role="img" aria-label={sorted ? 'Sixteen conversations grouped by kind: five people, five marketing, four utility, two authentication.' : 'Sixteen conversations in time order, coloured by what each really is.'}>
    {slots.map(({ msg, asis, grouped }) => {
      const pos = sorted ? grouped : asis;
      return <i key={msg.id} className="wi-unit" style={{ '--col': pos.col, '--row': pos.row, background: CATS[msg.cat].color }}/>;
    })}
    {CAT_ORDER.map((cat, index) => <span key={cat} className="wi-unit-label" data-show={sorted || undefined} style={{ '--col': index, color: CATS[cat].deep }}>{count(MESSAGES, cat)}</span>)}
  </div>;
}

export default function HeroStage() {
  const [mode, setMode] = useState('asis');
  const [touched, setTouched] = useState(false);
  const wide = useMedia('(min-width: 901px)');
  const sorted = mode === 'sorted';
  const notPeople = MESSAGES.length - count(MESSAGES, 'people');
  const toggle = () => { setTouched(true); setMode(sorted ? 'asis' : 'sorted'); track('inbox_sorted', { sorted: !sorted }); };
  return <div className="wi-hero" data-mode={mode}>
    <div className="wi-panel">
      <div className="wi-panel-top">
        <p className="wi-bignum" aria-live="polite"><span key={mode}><b>{sorted ? count(MESSAGES, 'people') : notPeople}</b><small>of {MESSAGES.length}</small></span></p>
        <p className="wi-bigline">{sorted ? 'conversations stay in your chat list. Everything else has its own place.' : 'conversations in this chat list are not from people.'}</p>
        <button type="button" className="wi-cta" data-state={sorted ? 'done' : 'ready'} data-nudge={!touched || undefined} onClick={toggle}>
          {sorted ? 'Put it back' : <>Sort this inbox <span aria-hidden="true">→</span></>}
        </button>
        <p className="wi-cta-hint">{sorted ? 'Now tap Business or Verification in the phone.' : 'One tap. Same messages, sorted by what each sender declared.'}</p>
      </div>
      <div className="wi-panel-mid">
        <UnitChart sorted={sorted}/>
        <p className="wi-key">{sorted ? 'People stay. Offers and updates go to Business. Codes go to Verification.' : 'Each square is a conversation, coloured by what it really is. In the chat list, nothing tells you.'}</p>
      </div>
      <p className="wi-fig">An illustrative inbox I drew for this study. It is not WhatsApp's interface.</p>
    </div>
    <div className="wi-hero-phone">
      <InboxPhone mode={mode} fitHeight={wide} hint={sorted}/>
    </div>
  </div>;
}
