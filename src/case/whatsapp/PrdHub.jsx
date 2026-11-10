import React from 'react';
import { PRDS, pageHref } from '../prd/registry.js';

// The six PRDs as six doors. Each opens its own focused page.
export default function PrdHub() {
  return <div className="wi-hub">
    {PRDS.map(item => <a key={item.slug} className="wi-hub-card" data-accent={item.accent} href={pageHref(item)} data-reveal>
      <span className="wi-hub-no">PRD {item.number}</span>
      <h3>{item.name}</h3>
      <p>{item.line}</p>
      <span className="wi-hub-go">Read the PRD <span aria-hidden="true">→</span></span>
    </a>)}
  </div>;
}
