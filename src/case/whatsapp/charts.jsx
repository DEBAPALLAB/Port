import React from 'react';

// The spam loop: five steps, one direction. A coral dot travels the ring; reduced motion holds it still.
export function LoopDiagram() {
  const cx = 380, cy = 290, R = 205;
  const at = deg => [cx + R * Math.sin(deg * Math.PI / 180), cy - R * Math.cos(deg * Math.PI / 180)];
  const steps = [
    { id: 'personal', deg: 0, name: 'A channel feels personal', note: 'people you chose to hear from' },
    { id: 'arrive', deg: 72, name: 'Businesses arrive', note: 'cheap reach, high attention' },
    { id: 'degrade', deg: 144, name: 'Attention degrades', note: 'personal messages get buried' },
    { id: 'respond', deg: 216, name: 'Users and rules respond', note: 'block, DND, tabs, folders', accent: true },
    { id: 'move', deg: 288, name: 'Businesses move on', note: 'to the next personal channel' },
  ];
  const BW = 222, BH = 66;
  return <svg className="wi-loop" viewBox="0 0 760 545" role="img" aria-label="The spam loop. A channel feels personal, businesses arrive, attention degrades, users and rules respond, and businesses move on to the next personal channel.">
    <circle cx={cx} cy={cy} r={R} fill="none" stroke="#ebe8e1" strokeWidth="10"/>
    <g className="wi-orbit"><circle cx={cx} cy={cy - R} r="12" fill="#ed5939"/></g>
    {steps.map(step => {
      const [x, y] = at(step.deg);
      return <g key={step.id} data-step={step.id}>
        <rect x={x - BW / 2} y={y - BH / 2} width={BW} height={BH} rx="16" fill={step.accent ? '#ffeee8' : '#fff'} stroke={step.accent ? '#ed5939' : '#d6d2c9'} strokeWidth={step.accent ? 3 : 2}/>
        <text x={x} y={y - 4} textAnchor="middle" fontSize="15.5" fontWeight="680" fill="#30312e">{step.name}</text>
        <text x={x} y={y + 20} textAnchor="middle" fontSize="13" fill="#6b6a64">{step.note}</text>
      </g>;
    })}
    <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="620" fill="#30312e" letterSpacing="-.6">Email, then SMS,</text>
    <text x={cx} y={cy + 24} textAnchor="middle" fontSize="22" fontWeight="620" fill="#30312e" letterSpacing="-.6">now WhatsApp</text>
    <text x={cx} y={cy + 52} textAnchor="middle" fontSize="13" fill="#6b6a64">one turn of the loop per channel</text>
  </svg>;
}

const YEAR0 = 2005, YEAR1 = 2027, X0 = 170, X1 = 1180;
const xOf = year => X0 + (year - YEAR0) * (X1 - X0) / (YEAR1 - YEAR0);

export const LANES = [
  { id: 'email', name: 'Email', color: '#8896a8', y: 120, marks: [
    { year: 2013.4, when: '2013', what: 'Gmail sorts promotions into a tab', above: true },
  ] },
  { id: 'sms', name: 'SMS in India', color: '#30312e', y: 262, marks: [
    { year: 2007.5, when: '2007', what: 'National Do Not Call registry', above: true },
    { year: 2018.6, when: '2018 to 2019', what: 'Sender and template registration', above: true },
    { year: 2024.95, when: 'Dec 2024', what: 'Message traceability', above: true },
  ] },
  { id: 'wa', name: 'WhatsApp in India', color: '#ed5939', y: 404, marks: [
    { year: 2020.5, when: 'Jul 2020', what: 'Explicit opt-in relaxed', above: true },
    { year: 2022.8, when: 'Oct 2022', what: 'Spam reported in the press', above: false },
    { year: 2024.9, when: 'Nov 2024', what: 'Controls first tested', above: true },
    { year: 2026.5, when: 'Jul 2026', what: 'Business folder in testing', above: false },
  ] },
];

export function LaneChart() {
  return <>
    <svg className="wi-lanes" viewBox="0 0 1260 520" role="img" aria-label="Three lanes from 2005 to 2027. Email: Gmail tabs in 2013. SMS in India: do not call registry in 2007, sender registration in 2018 and 2019, traceability in December 2024. WhatsApp in India: opt-in relaxed in July 2020, press reports of spam in October 2022, controls tested in November 2024, business folder in testing in July 2026.">
      {[2005, 2010, 2015, 2020, 2025].map(year => <g key={year}>
        <rect x={xOf(year) - 1} y="40" width="2" height="400" fill="#f1eee8"/>
        <text x={xOf(year)} y="26" textAnchor="middle" fontSize="14" fontWeight="600" fill="#6b6a64">{year}</text>
      </g>)}
      {LANES.map(lane => <g key={lane.id}>
        <text x="0" y={lane.y + 5} fontSize="16" fontWeight="680" fill="#30312e">{lane.name}</text>
        <rect x={X0} y={lane.y - 5} width={X1 - X0} height="10" rx="5" fill="#ebe8e1"/>
        {lane.marks.map(mark => {
          const x = xOf(mark.year), y0 = mark.above ? lane.y - 30 : lane.y + 38;
          return <g key={mark.when}>
            <circle cx={x} cy={lane.y} r="11" fill={lane.color}/>
            <text x={x} y={y0 - (mark.above ? 18 : 0)} textAnchor="middle" fontSize="14.5" fontWeight="700" fill={lane.id === 'wa' ? '#b93c24' : '#30312e'}>{mark.when}</text>
            <text x={x} y={y0 - (mark.above ? 1 : -19)} textAnchor="middle" fontSize="13.5" fill="#55544e">{mark.what}</text>
          </g>;
        })}
      </g>)}
      <rect x={xOf(2020.5)} y={LANES[2].y - 5} width={xOf(2026.5) - xOf(2020.5)} height="10" rx="5" fill="#ed5939" opacity=".35"/>
      <text x={xOf(2022.8) - 60} y={LANES[2].y + 38} textAnchor="end" fontSize="15" fontWeight="680" fill="#b93c24">Six years from relaxed opt-in to a folder in test</text>
      <text x={xOf(2018.6)} y={LANES[1].y + 52} textAnchor="middle" fontSize="14" fontWeight="650" fill="#30312e">The rules were rewritten again and again</text>
    </svg>
    <ol className="wi-lanes-list" aria-label="The same milestones as a list">
      {LANES.map(lane => <li key={lane.id}><strong style={{ color: lane.id === 'wa' ? '#b93c24' : undefined }}>{lane.name}</strong><ul>{lane.marks.map(mark => <li key={mark.when}><b>{mark.when}</b> {mark.what}</li>)}</ul></li>)}
    </ol>
  </>;
}

// India users over time, from the figures reported at each date, with the events that changed why people call.
const U = { x0: 130, x1: 1180, y0: 330, y1: 70, a: 2015, b: 2027 };
const ux = year => U.x0 + (year - U.a) * (U.x1 - U.x0) / (U.b - U.a);
const uy = millions => U.y0 - millions / 600 * (U.y0 - U.y1);
export const USERS = [
  { year: 2015.1, m: 70, when: 'Early 2015', label: '70M' },
  { year: 2016.85, m: 160, when: 'Nov 2016', label: '160M' },
  { year: 2017.35, m: 200, when: 'May 2017', label: '200M' },
  { year: 2022.8, m: 550, when: 'Oct 2022', label: '550M' },
];
export const EVENTS = [
  { year: 2015.07, when: 'Jan 2015', what: 'Calling arrives on Android', row: 0, anchor: 'start' },
  { year: 2016.68, when: 'Sep 2016', what: 'Jio launches with free voice', row: 1, anchor: 'start' },
  { year: 2016.87, when: 'Nov 2016', what: 'Video calling added', row: 2, anchor: 'start' },
  { year: 2023.47, when: 'Jun 2023', what: 'Silence Unknown Callers', row: 0, anchor: 'start' },
  { year: 2025.8, when: 'Oct 2025', what: 'Supreme Court takes up digital arrest', row: 1, anchor: 'end' },
  { year: 2026.2, when: 'Mar 2026', what: 'Centre directs WhatsApp on scams', row: 2, anchor: 'end' },
];
const ROWS = [410, 458, 506];

export function UsersChart() {
  const line = USERS.map((p, i) => `${i ? 'L' : 'M'}${ux(p.year).toFixed(1)} ${uy(p.m).toFixed(1)}`).join('');
  const last = USERS[USERS.length - 1], first = USERS[0];
  return <>
    <svg className="wi-users" viewBox="0 0 1260 560" role="img" aria-label="WhatsApp users in India as reported: about 70 million in early 2015, 160 million in November 2016, 200 million in May 2017 and 550 million in October 2022. No public figure since. Events below: calling arrives in January 2015, Jio launches free voice in September 2016, video calling in November 2016, Silence Unknown Callers in June 2023, the Supreme Court takes up digital arrest in October 2025, and the Centre directs WhatsApp on scams in March 2026.">
      {[0, 200, 400, 600].map(v => <g key={v}>
        <rect x={U.x0} y={uy(v) - 1} width={U.x1 - U.x0} height="2" fill={v === 0 ? '#d6d2c9' : '#f1eee8'}/>
        <text x={U.x0 - 16} y={uy(v) + 5} textAnchor="end" fontSize="14" fill="#6b6a64">{v === 0 ? '0' : `${v}M`}</text>
      </g>)}
      {[2015, 2020, 2025].map(year => <text key={year} x={ux(year)} y={U.y0 + 28} textAnchor="middle" fontSize="14" fontWeight="600" fill="#6b6a64">{year}</text>)}
      <path d={`${line}L${ux(last.year)} ${U.y0}L${ux(first.year)} ${U.y0}Z`} fill="#ffeee8"/>
      <path d={line} fill="none" stroke="#ed5939" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"/>
      <path d={`M${ux(last.year) + 12} ${uy(last.m)}H${ux(2026.9)}`} stroke="#b3bcc8" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round"/>
      <text x={(ux(last.year) + ux(2026.9)) / 2 + 20} y={uy(last.m) + 34} textAnchor="middle" fontSize="14.5" fill="#55544e">No public figure since. Coverage says 500M or more; I could not confirm it.</text>
      {USERS.map(p => <g key={p.when}>
        <circle cx={ux(p.year)} cy={uy(p.m)} r="9" fill="#fff" stroke="#ed5939" strokeWidth="4"/>
        <text x={ux(p.year)} y={uy(p.m) - 20} textAnchor={p === first ? 'start' : 'middle'} dx={p === first ? -8 : 0} fontSize="21" fontWeight="700" fill="#30312e">{p.label}</text>
      </g>)}
      <g>
        <path d={`M${ux(2017.35) + 10} ${uy(200) + 10}L${ux(2017.35) + 36} ${uy(200) + 36}`} stroke="#30312e" strokeWidth="2"/>
        <text x={ux(2017.35) + 44} y={uy(200) + 48} fontSize="17" fontWeight="680" fill="#30312e">50 million minutes of video calls a day</text>
        <text x={ux(2017.35) + 44} y={uy(200) + 70} fontSize="14" fill="#55544e">India, May 2017, WhatsApp's own figure. The last public calling number.</text>
      </g>
      {EVENTS.map(ev => {
        const x = ux(ev.year), y = ROWS[ev.row];
        return <g key={ev.when}>
          <rect x={x - 1} y={U.y0} width="2" height={y - U.y0 - 18} fill="#d6d2c9"/>
          <circle cx={x} cy={U.y0} r="6" fill="#30312e"/>
          <text x={x + (ev.anchor === 'start' ? 10 : -10)} y={y - 2} textAnchor={ev.anchor} fontSize="14.5" fontWeight="700" fill="#30312e">{ev.when}</text>
          <text x={x + (ev.anchor === 'start' ? 10 : -10)} y={y + 17} textAnchor={ev.anchor} fontSize="14" fill="#55544e">{ev.what}</text>
        </g>;
      })}
    </svg>
    <ul className="wi-users-list" aria-label="The same data as a list">
      {USERS.map(p => <li key={p.when}><b>{p.when}</b> {p.label} users in India</li>)}
      <li><b>May 2017</b> 50 million minutes of video calls a day</li>
      {EVENTS.map(ev => <li key={ev.when}><b>{ev.when}</b> {ev.what}</li>)}
    </ul>
  </>;
}
