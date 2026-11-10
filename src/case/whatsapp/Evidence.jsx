import React from 'react';

// Horizontal bars on one 0 to 100 scale. Values are the survey's own percentages.
const BARS = [
  { group: 'How often', rows: [
    { label: 'Get eight or more unwanted messages a day, 2023', value: 11, tone: 'quiet' },
    { label: 'Get eight or more unwanted messages a day, 2026', value: 19, tone: 'accent' },
  ] },
  { group: 'Where it comes from', rows: [
    { label: 'Name real estate a main source', value: 71, tone: 'ink' },
    { label: 'Name financial services a main source', value: 71, tone: 'ink' },
  ] },
];

export function SurveyBars() {
  return <div className="wi-bars" data-reveal>
    {BARS.map(block => <section key={block.group} aria-label={block.group}>
      <h4>{block.group}</h4>
      <ul>
        {block.rows.map(row => <li key={row.label}>
          <span className="wi-bar-label">{row.label}</span>
          <span className="wi-bar-track"><i className="wi-bar-fill" data-tone={row.tone} style={{ width: `${row.value}%` }}/></span>
          <b className="wi-bar-value">{row.value}%</b>
        </li>)}
      </ul>
    </section>)}
    <p className="case-caption">LocalCircles survey of 42,000+ people in 324 districts, reported by Storyboard18 on 4 February 2026. Bars share one scale from 0 to 100%.</p>
  </div>;
}
