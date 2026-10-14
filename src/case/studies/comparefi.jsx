import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CasePage, CaseHero, Chapter, Prose, Statement, Split, Shot, Reel, Decision, CodeNote, Ledger, Timeline, Numbers, Stage3D } from '../kit.jsx';
import useReducedMotion from '../../useReducedMotion.js';
import { basis, products, criteria, rank, scenePayload } from '../scenes/comparefiData.js';
import '../styles/comparefi.css';

const heroScene = () => import('../scenes/comparefiHero.js');
const barsScene = () => import('../scenes/comparefiBars.js');

const SlabFallback = () => <svg viewBox="0 0 420 300" role="img" aria-label="Four ceramic slabs of different heights" style={{ width: 'min(100%, 520px)' }}>
  <rect x="20" y="250" width="380" height="14" rx="7" fill="#ebe8e1"/>
  {[[44, 150], [136, 96], [228, 190], [320, 60]].map(([x, h], i) => <g key={x}><rect x={x} y={250 - h} width="64" height={h} rx="8" fill="#f4f1ea"/>{i === 3 && <rect x={x} y={250 - h - 6} width="64" height="8" rx="4" fill="#b1ed67"/>}</g>)}
  <rect x="20" y="190" width="380" height="5" fill="#1f5e3c" opacity=".5"/>
</svg>;

/* ---------------------------------------------------------------- Hero */
function Hero() {
  const [note, setNote] = useState({ label: 'Year-1 cost', rule: 'Lowest first' });
  return <CaseHero
    name="CompareFi"
    title="Lenders, lined up."
    lede="A comparison site for loans against shares, loans against mutual funds and margin funding in India. I built much of its front end, with a small team."
    links={[{ href: 'https://comparefi.in', label: 'Open comparefi.in' }, { href: '#compare', label: 'Try the comparison' }]}
    facts={[
      { label: 'Role', value: 'Front end and product engineering, 162 of 360 commits' },
      { label: 'Timeline', value: 'July 2025 to February 2026' },
      { label: 'Stack', value: 'Next.js 16, Supabase, Tailwind, Google Apps Script' },
      { label: 'Status', value: 'Live at comparefi.in' },
    ]}
    stage={<Stage3D scene={heroScene} eager label="Four ceramic slabs, one per lender, that change height and order when the comparison criterion changes. Sample values." fallback={<SlabFallback/>} onEvent={(name, payload) => { if (name === 'criterion') setNote(payload); }}/>}
    note={`Sample values. Showing ${note.label.toLowerCase()}: ${note.rule.toLowerCase()}. Tap a slab.`}
  />;
}

/* ---------------------------------------------------------------- Signature: the comparison */
const money = value => '₹' + Math.round(value).toLocaleString('en-IN');

function Comparator() {
  const reduced = useReducedMotion();
  const [product, setProduct] = useState('las');
  const [crit, setCrit] = useState('y1');
  const [hover, setHover] = useState(null);
  const [pinned, setPinned] = useState(null);
  const stage = useRef(null), rowRefs = useRef(new Map()), lastTops = useRef(new Map()), latest = useRef({});
  const { criterion, rows } = useMemo(() => rank(product, crit), [product, crit]);
  const focus = hover ?? pinned;
  latest.current = { product, crit, focus };

  useEffect(() => { stage.current?.send('set', scenePayload(product, crit)); }, [product, crit]);
  useEffect(() => { stage.current?.send('focus', { key: focus }); }, [focus]);

  // Rows keep their cells in place; when the order changes they glide to their new row.
  useLayoutEffect(() => {
    const next = new Map();
    rowRefs.current.forEach((node, key) => { if (node) next.set(key, node.getBoundingClientRect().top); });
    if (!reduced) next.forEach((top, key) => {
      const before = lastTops.current.get(key);
      const node = rowRefs.current.get(key);
      if (before !== undefined && Math.abs(before - top) > 1 && node?.animate) node.animate([{ transform: `translateY(${before - top}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
    });
    lastTops.current = next;
  }, [product, crit, reduced]);

  const onStage = useCallback((name, payload) => {
    if (name === 'hover') setHover(payload.key);
    if (name === 'pick') setPinned(current => current === payload.key ? null : payload.key);
    if (name === 'ready') setTimeout(() => {
      const { product: p, crit: c, focus: f } = latest.current;
      stage.current?.send('set', scenePayload(p, c)); stage.current?.send('focus', { key: f });
    }, 0);
  }, []);

  const choose = id => { setProduct(id); if (!criteria[id].some(item => item.id === crit)) setCrit(criteria[id][0].id); setPinned(null); };
  const isLoan = product !== 'mtf';
  const columns = isLoan
    ? [['y1', 'Year 1'], ['y2', 'Year 2'], ['y12', 'Two years'], ['ltv', 'LTV'], ['reg', 'Regularisation']]
    : [['cost', 'Cost over 12 months'], ['margin', 'Margin requirement']];
  const defByid = Object.fromEntries(criteria[product].map(item => [item.id, item]));
  const best = rows[0].value;
  const lead = id => rank(product, id).rows[0].lender.id;
  const cell = (lender, id) => {
    const def = defByid[id], value = def.get(lender);
    const main = def.fmt(value);
    const sub = (id === 'y1' || id === 'y2') ? `${(value / 1000).toFixed(1)}% of ₹1 lakh` : null;
    let delta = null;
    if (id === crit && lender.id !== rows[0].lender.id) {
      const gap = Math.abs(value - best), unit = (id === 'ltv' || id === 'margin') ? `${gap} points` : def.fmt(gap);
      delta = `${unit} ${def.dir === 'low' ? 'above' : 'below'} first`;
    }
    return <div key={id} className={`cf-cell ${id === crit ? 'is-sorted' : ''}`}><span className="cf-k">{def.label}</span><strong>{main}</strong>{sub && <span className="cf-sub">{sub}</span>}{delta && <span className="cf-delta">{delta}</span>}</div>;
  };

  return <div className="cf-compare" id="compare-tool" data-reveal>
    <div className="cf-controls">
      <div role="group" aria-label="Product">
        <p className="cf-label">Product</p>
        <div className="case-controls">{Object.entries(products).map(([id, item]) => <button key={id} type="button" className="case-chip" aria-pressed={product === id} onClick={() => choose(id)}>{item.short}</button>)}</div>
        <p className="case-caption">{products[product].name}. Basis: {basis[product]}.</p>
      </div>
      <div role="group" aria-label="Criterion">
        <p className="cf-label">Line the lenders up by</p>
        <div className="case-controls">{criteria[product].map(item => <button key={item.id} type="button" className="case-chip" aria-pressed={crit === item.id} onClick={() => { setCrit(item.id); }}>{item.label}</button>)}</div>
        <p className="case-caption">{criterion.rule}. Cost-first is the default on the real site: year-1 cost, lowest first.</p>
      </div>
      {isLoan && <p className="cf-flip" aria-live="polite">Lender {lead('y1')} is lowest in year 1. Lender {lead('y2')} is lowest in year 2. Over both years, lender {lead('y12')} is lowest.</p>}
    </div>
    <div className="cf-stage">
      <div className="case-stage-block"><Stage3D ref={stage} scene={barsScene} onEvent={onStage} label={`Slabs for ${criterion.label}, ${criterion.rule.toLowerCase()}. Sample values.`} fallback={<SlabFallback/>}/></div>
      <ul className="cf-legend"><li><i className="k-sheet"/>Green sheet: the first value</li><li><i className="k-over"/>Dark top: above the sheet</li><li><i className="k-gap"/>Pale: the gap up to it</li></ul>
    </div>
    <div className="cf-table" style={{ '--n': columns.length }} role="table" aria-label={`${products[product].name}, sorted by ${criterion.label}`}>
      <div className="cf-head" role="row"><span role="columnheader">Lender</span>{columns.map(([id, label]) => <span role="columnheader" key={id} className={id === crit ? 'is-sorted' : ''}>{label}</span>)}</div>
      {rows.map(({ lender }, index) => <div key={lender.id} role="row" ref={node => { if (node) rowRefs.current.set(lender.id, node); else rowRefs.current.delete(lender.id); }}
        className={`cf-row ${focus === lender.id ? 'is-focus' : ''} ${index === 0 ? 'is-first' : ''}`} onMouseEnter={() => setHover(lender.id)} onMouseLeave={() => setHover(null)}>
        <div className="cf-lender" role="cell"><button type="button" aria-pressed={pinned === lender.id} onClick={() => setPinned(current => current === lender.id ? null : lender.id)}><b>{lender.id}</b><span>{lender.name}</span></button>{index === 0 && <em>First</em>}</div>
        {columns.map(([id]) => <div role="cell" key={id} style={{ display: 'contents' }}>{cell(lender, id)}</div>)}
      </div>)}
    </div>
    <p className="cf-fine">These are sample figures I made up for this page, so the lenders are labelled A, B, C and D. They are not any lender's real price. The real numbers live in CompareFi's database and change; check comparefi.in. This is not financial advice.</p>
  </div>;
}

/* ---------------------------------------------------------------- Plumbing diagram */
const nodes = {
  table: { x: 20, y: 30, w: 250, h: 100, title: 'Comparison table', body: 'CompareProductsTable.jsx loads one product from Supabase in the browser, maps the rows to the fields it shows, keeps only the named lenders and sorts them cost-first.' },
  tables: { x: 20, y: 200, w: 250, h: 100, title: 'Supabase tables', body: 'Three tables: las, lamf and mtf, one row per institution. fetchTableData selects everything ordered by id. On an error it logs and returns an empty list, so the table shows nothing instead of crashing.' },
  auth: { x: 20, y: 370, w: 250, h: 100, title: 'Admin and Auth', body: 'Supabase email and password sign-in, then /api/admin compares the user id with an ADMIN_UID value held on the server. Soham built most of the admin side.' },
  modal: { x: 380, y: 30, w: 250, h: 100, title: 'Enquiry modal', body: 'Name, mobile, email and a message that is pre-filled with the product and the lender. It posts to /api/contact with source set to comparison-table.' },
  route: { x: 380, y: 200, w: 250, h: 100, title: '/api/contact', body: 'A Next.js route. It checks name, mobile, email and product on the server, reads the Apps Script address from an environment variable, and answers 500 if that is missing.' },
  script: { x: 380, y: 370, w: 250, h: 100, title: 'Apps Script', body: 'A Google Apps Script web endpoint. Its code is not in the repo. The route requires a JSON reply with success set to true before it tells the visitor it worked.' },
  sheet: { x: 690, y: 370, w: 170, h: 100, title: 'Google Sheet', body: 'Where leads land. A sheet lets someone on the team add calls and follow-up notes by hand, without writing SQL.' },
};
const links = [['table', 'tables'], ['auth', 'tables'], ['modal', 'route'], ['route', 'script'], ['script', 'sheet']];

function Plumbing() {
  const [active, setActive] = useState('route');
  const node = nodes[active];
  const mid = id => [nodes[id].x + nodes[id].w / 2, nodes[id].y + nodes[id].h / 2];
  const edge = ([a, b]) => { const [x1, y1] = mid(a), [x2, y2] = mid(b); return `M${x1} ${y1} L${x2} ${y2}`; };
  return <div className="cf-plumb" data-reveal>
    <svg viewBox="0 0 880 500" role="group" aria-label="How the pieces connect. Select a block to read what it does.">
      {links.map(link => <path key={link.join()} d={edge(link)} className={link.includes(active) ? 'is-on' : ''}/>)}
      {Object.entries(nodes).map(([id, item]) => <g key={id} role="button" tabIndex={0} aria-pressed={active === id} aria-label={item.title} onClick={() => setActive(id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActive(id); } }} className={active === id ? 'is-active' : ''}>
        <rect x={item.x} y={item.y} width={item.w} height={item.h} rx="16"/>
        <text x={item.x + item.w / 2} y={item.y + item.h / 2 + 6} textAnchor="middle">{item.title}</text>
      </g>)}
    </svg>
    <div className="case-controls cf-plumb-chips" role="group" aria-label="Blocks">{Object.entries(nodes).map(([id, item]) => <button key={id} type="button" className="case-chip" aria-pressed={active === id} onClick={() => setActive(id)}>{item.title}</button>)}</div>
    <div className="cf-plumb-note" aria-live="polite"><h3>{node.title}</h3><p>{node.body}</p></div>
  </div>;
}

const institutionsByProduct = {
  las: { label: 'Loan Against Shares (LAS)', names: ['Mirae Asset', 'Zerodha', 'Kotak', 'Bajaj'] },
  lamf: { label: 'Loan Against Mutual Funds (LAMF)', names: ['Bank of Baroda', 'Mirae Asset', 'Kotak', 'SBI'] },
  mtf: { label: 'Margin Trading Facility (MTF)', names: ['Kotak', 'HDFC Sky', 'Dhan'] },
};

function PayloadLab() {
  const [product, setProduct] = useState('las');
  const [institution, setInstitution] = useState(0);
  const [filled, setFilled] = useState({ name: true, mobile: true, email: true });
  const spec = institutionsByProduct[product];
  const lender = spec.names[Math.min(institution, spec.names.length - 1)];
  const missing = ['name', 'mobile', 'email'].filter(field => !filled[field]);
  const fields = [
    ['name', filled.name ? 'Asha (example)' : '(empty)'], ['mobile', filled.mobile ? '(example number)' : '(empty)'], ['email', filled.email ? 'asha@example.com' : '(empty)'],
    ['product', spec.label], ['institution', lender], ['source', 'comparison-table'],
    ['message', `I’m interested in ${spec.label} offered by ${lender}.`],
  ];
  return <div className="cf-lab" data-reveal>
    <div className="cf-lab-controls">
      <p className="cf-label">Enquiry from the table</p>
      <div className="case-controls">{Object.entries(institutionsByProduct).map(([id, item]) => <button key={id} type="button" className="case-chip" aria-pressed={product === id} onClick={() => { setProduct(id); setInstitution(0); }}>{id.toUpperCase()}</button>)}</div>
      <div className="case-controls">{spec.names.map((name, index) => <button key={name} type="button" className="case-chip" aria-pressed={institution === index} onClick={() => setInstitution(index)}>{name}</button>)}</div>
      <p className="cf-label">Fields the visitor filled</p>
      <div className="case-controls">{['name', 'mobile', 'email'].map(field => <button key={field} type="button" className="case-chip" aria-pressed={filled[field]} onClick={() => setFilled(current => ({ ...current, [field]: !current[field] }))}>{field}</button>)}</div>
    </div>
    <div className="cf-lab-out" aria-live="polite">
      <dl>{fields.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
      <p className={`cf-verdict ${missing.length ? 'is-fail' : 'is-ok'}`}>{missing.length
        ? `The modal stops it first. If it did reach the server, the route would answer 400, "Missing required fields".`
        : 'Passes both checks. The route forwards it to Apps Script and waits for success: true.'}</p>
    </div>
  </div>;
}

/* ---------------------------------------------------------------- Sitemap before / after */
const committedSitemap = ['/about', '/Admin/dashboard/lamf', '/Admin/dashboard/las', '/Admin/dashboard/mtf', '/Admin/dashboard', '/Admin/login', '/contact', '/', '/products/lamf', '/products/las', '/products/mtf'];
const liveSitemap = ['/about', '/contact', '/', '/products/lamf', '/products/las', '/products/mtf'];

function SitemapCompare() {
  const [which, setWhich] = useState('live');
  const list = which === 'live' ? liveSitemap : committedSitemap;
  return <div className="cf-sitemap" data-reveal>
    <div className="case-controls" role="group" aria-label="Which sitemap">
      <button type="button" className="case-chip" aria-pressed={which === 'committed'} onClick={() => setWhich('committed')}>Committed file, 8 Jan 2026</button>
      <button type="button" className="case-chip" aria-pressed={which === 'live'} onClick={() => setWhich('live')}>Live file, lastmod 21 Mar 2026</button>
    </div>
    <ul className="cf-urls" aria-live="polite">{list.map(path => <li key={path} className={path.startsWith('/Admin') ? 'is-admin' : ''}>{path === '/' ? 'www.comparefi.in' : `www.comparefi.in${path}`}</li>)}</ul>
    <p className="case-caption">{which === 'committed'
      ? `${list.length} URLs, five of them under /Admin. The exclude rule says /admin, and the folder on disk was spelled Admin. My guess is that a Windows build kept the capital letter and slipped past the rule.`
      : `${list.length} URLs, all public. I fetched this file while writing this page. The Admin paths are gone.`}</p>
  </div>;
}

/* ---------------------------------------------------------------- Design: contrast pairs, computed */
const lum = hex => { const channel = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * channel[0] + .7152 * channel[1] + .0722 * channel[2]; };
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + .05) / (lo + .05); };
const pairs = [
  { fg: '#ffffff', bg: '#124434', text: 'White on forest', note: 'Section fields and table headers' },
  { fg: '#124434', bg: '#b1ed67', text: 'Forest on lime', note: 'The Get Started and Contact Us buttons' },
  { fg: '#0a0f2c', bg: '#eff3f6', text: 'Midnight on the page', note: 'Body text' },
  { fg: '#124434', bg: '#b1ed67', text: 'White on lime', note: 'The sample below is white on #b1ed67. It is not used for text because it would not hold.', sample: '#ffffff', ratioOf: ['#ffffff', '#b1ed67'] },
];

function Contrast() {
  return <div className="cf-swatches" data-reveal>
    {pairs.map(pair => {
      const [a, b] = pair.ratioOf || [pair.fg, pair.bg], value = ratio(a, b);
      return <div key={pair.text} className="cf-swatch" style={{ background: pair.bg, color: pair.fg }}>
        <strong>{pair.text}</strong>
        <span className="cf-ratio">{value.toFixed(1)} to 1</span>{pair.sample && <span className="cf-sample" aria-hidden="true" style={{ color: pair.sample }}>Aa</span>}
        <span>{pair.note}</span>
        <span className="cf-pass">{value >= 4.5 ? 'Passes 4.5 to 1 for body text' : 'Fails 4.5 to 1 for body text'}</span>
      </div>;
    })}
  </div>;
}

/* ---------------------------------------------------------------- Commits per month (all authors) */
const months = [['Jul', 21], ['Aug', 10], ['Sep', 15], ['Oct', 108], ['Nov', 109], ['Dec', 72], ['Jan', 19], ['Feb', 6]];
function CommitChart() {
  const [on, setOn] = useState(3);
  const max = 109;
  return <div className="cf-chart" data-reveal>
    <svg viewBox="0 0 640 280" role="img" aria-label="Commits per month, July 2025 to February 2026. October and November are the busiest, with 108 and 109.">
      {months.map(([name, count], i) => {
        const h = Math.max(6, count / max * 210), x = 20 + i * 76;
        return <g key={name} tabIndex={0} onMouseEnter={() => setOn(i)} onFocus={() => setOn(i)} onClick={() => setOn(i)} className={on === i ? 'is-on' : ''}>
          <rect x={x - 6} y="0" width="64" height="250" fill="transparent"/>
          <rect x={x} y={232 - h} width="52" height={h} rx="8"/>
          <text x={x + 26} y="264" textAnchor="middle">{name}</text>
        </g>;
      })}
    </svg>
    <p className="cf-chart-read" aria-live="polite"><strong>{months[on][1]}</strong> commits in {['July 2025', 'August 2025', 'September 2025', 'October 2025', 'November 2025', 'December 2025', 'January 2026', 'February 2026'][on]}, all authors.</p>
  </div>;
}

/* ---------------------------------------------------------------- Code excerpts (copied from the repo) */
const filterCode = `const filterNames =
  type === "las"
    ? ["mirae asset", "zerodha", "kotak", "bajaj"]
    : type === "lamf"
      ? ["bank of baroda", "mirae asset", "kotak", "sbi"]
      : ["kotak - trade free pro plan", "hdfc sky", "dhan"];

const filtered = clean.filter((r) =>
  filterNames.includes((r.name || "").trim().toLowerCase())
);

const sorted = [...filtered].sort((a, b) => {
  if (type === "las" || type === "lamf") {
    return (
      getNumericAmount(a.cost_first_year) -
      getNumericAmount(b.cost_first_year)
    );
  }`;
const amountCode = `const getNumericAmount = (obj) => {
  if (!obj || obj.amount === null || obj.amount === undefined) return Infinity;

  const num =
    typeof obj.amount === "number"
      ? obj.amount
      : Number(
        String(obj.amount)
          .replace(/₹|rs\\.?|,/gi, "")
          .trim()
      );

  return Number.isNaN(num) ? Infinity : num;
};`;
const routeCode = `// Server-side validation
if (!data.name || !data.mobile || !data.email || !data.product) {
  return new Response(
    JSON.stringify({ error: "Missing required fields" }),
    { status: 400 }
  );
}

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

const res = await fetch(GOOGLE_SCRIPT_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});`;
const sitemapCode = `module.exports = {
  siteUrl: 'https://www.comparefi.in', // strictly use the www version
  generateRobotsTxt: true,

  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
  ],`;
const cleanCode = `const clean = (val) => {
  if (!val) return Infinity;

  const str = String(val).toLowerCase();

  // hard stop for non-numeric disclosures
  if (
    str.includes("data not") ||
    str.includes("not disclosed") ||
    str.includes("na") ||
    str.includes("n/a")
  ) {
    return Infinity;
  }`;

/* ---------------------------------------------------------------- Page */
export default function ComparefiStudy() {
  return <CasePage slug="comparefi" accent="#1f5e3c">
    <Hero/>

    <Chapter id="problem" title="The problem" heading="Every lender hides cost somewhere else">
      <Split>
        <div>
          <Prose>
            <p>Borrowing against shares or mutual funds lets you keep the holdings and still raise cash. Margin funding lets you buy more than you have paid for. Each lender prices that differently: an interest rate here, a processing fee there, a yearly charge somewhere further down the page.</p>
            <p>A borrower reading three lender pages ends up comparing three different layouts, not three prices. CompareFi’s answer is on its own home page: <em>No hidden charges. No jargon. No biased recommendations.</em></p>
          </Prose>
          <Statement>The product is one idea: put the same facts in the same place, for every lender.</Statement>
        </div>
        <Shot src="/cases/comparefi/desktop-1.jpg" alt="The Compare Products section of comparefi.in: product tabs, and a Loan Against Securities table whose headers read Overall Cost over 1 lakh, first year and second year." caption="The live comparison table on comparefi.in. The header names its basis: the overall cost over ₹1 lakh, for year one and year two." address="comparefi.in"/>
      </Split>
    </Chapter>

    <Chapter id="product" title="The product" heading="Three products, read the same way" tone="paper">
      <Prose>
        <p>The site covers three products: loan against shares (LAS), loan against mutual funds (LAMF) and margin trading facility (MTF). Each has a short card on the home page, a table of its lenders, and a longer page with questions and answers. There are six public pages in all.</p>
      </Prose>
      <div className="case-gap"/>
      <Reel label="Screens of comparefi.in" shots={[
        { src: '/cases/comparefi/desktop-0.jpg', alt: 'The CompareFi home page: Compare Right, Choose Right, with three product cards fanned out below.', caption: 'The home page opens on the promise and the three products.', address: 'comparefi.in' },
        { src: '/cases/comparefi/mobile-0.jpg', alt: 'The CompareFi home page on a phone.', frame: 'phone', caption: 'The same page at 390 pixels wide.' },
        { src: '/cases/comparefi/desktop-1.jpg', alt: 'Product Highlights and the Compare Products table.', caption: 'Product highlights, then the table with a tab for each product.', address: 'comparefi.in' },
        { src: '/cases/comparefi/mobile-1.jpg', alt: 'The three product cards on a phone.', frame: 'phone', caption: 'On a phone the three products stack.' },
        { src: '/cases/comparefi/desktop-3.jpg', alt: 'The closing call to action and the footer with links to products, about, contact and disclaimers.', caption: 'The close: a Contact Us button that opens WhatsApp, and the footer.', address: 'comparefi.in' },
      ]}/>
    </Chapter>

    <Chapter id="compare" title="The comparison" heading="Pick a criterion. The rows line up.">
      <Prose>
        <p>Here is the idea, rebuilt small. Choose a product and a criterion. Every lender stays on one row, and the rows re-sort best first. The slabs on the right are the same rows, drawn from zero, so a difference you could miss in a column becomes a height you can see.</p>
      </Prose>
      <div className="case-gap"/>
      <Comparator/>
    </Chapter>

    <Chapter id="decisions" title="Decisions" heading="Three choices that shaped the table" tone="paper">
      <Decision title="Show a few lenders, not every lender" chosen="curated" problem="A table of every lender would be complete and almost unreadable. A table of three or four can be read in one look."
        options={[
          { id: 'curated', label: 'A named set per product', body: 'The table keeps four lenders for LAS, four for LAMF and three for MTF, listed by name in code. Everything else in the database is filtered out before it renders.', cost: 'A visitor who wants a lender that is not shown has to ask. The enquiry form and the WhatsApp button are how they do.' },
          { id: 'all', label: 'Every lender', body: 'The most complete view, and the one that never leaves someone out.', cost: 'The table stops being a comparison and becomes a directory. The point was to decide faster.' },
          { id: 'pick', label: 'Let the visitor pick', body: 'Flexible, and a good second version.', cost: 'It needs a picker, empty states and a rule for how many columns fit. A named set needs none of that.' },
        ]}/>
      <Decision title="Show the cost for year one and year two" chosen="dual" problem="A single rate says little. Processing fees land in year one and yearly charges repeat, so the cheapest lender can change after twelve months."
        options={[
          { id: 'dual', label: 'Two cost columns', body: 'Each lender shows the overall cost over ₹1 lakh for the first year and for the second, as a percentage and as a rupee amount. The basis is printed under the table: a ₹1,00,000 position held 12 months, ₹2,00,000 of collateral and 50% funding.', cost: 'Two columns take width and ask more of the reader. On a phone the table scrolls sideways.' },
          { id: 'index', label: 'One cost index', body: 'A single number is easier to scan and to sort.', cost: 'It hides the very thing the two columns show: which lender gets cheaper, and which does not.' },
          { id: 'rate', label: 'Headline interest rate', body: 'The number every lender already advertises.', cost: 'It leaves out fees, so it can rank lenders in a different order from what the borrower pays.' },
        ]}/>
      <Decision title="Sort by cost, cheapest first" chosen="cost" problem="Rows have to appear in some order, and the first row always gets read first."
        options={[
          { id: 'cost', label: 'Year-1 cost, ascending', body: 'The default sort is the first-year cost, lowest first. Anything missing or unreadable is treated as infinitely large, so it falls to the bottom instead of floating to the top.', cost: 'A rule that reads like a recommendation. That is why the basis and the second-year column sit right beside it, and why a visitor can re-sort.' },
          { id: 'alpha', label: 'Alphabetical', body: 'Neutral, and arbitrary.', cost: 'The lender whose name starts with A would get the first look for no reason a visitor could use.' },
          { id: 'partner', label: 'By partner', body: 'The common model on comparison sites.', cost: 'It would put the lender who pays first. It contradicts the promise on the home page.' },
        ]}/>
      <div className="case-gap"/>
      <Split>
        <CodeNote file="app/components/CompareProductsTable.jsx" language="js" code={filterCode} caption="The named set and the cost-first sort, trimmed."/>
        <div>
          <CodeNote file="app/components/CompareProductsTable.jsx" language="js" code={amountCode} caption="No amount means Infinity, so the row sorts last."/>
        </div>
      </Split>
    </Chapter>

    <Chapter id="plumbing" title="Under the hood" heading="Prices in Supabase, leads in Sheets" tone="ink">
      <Prose>
        <p>Prices live in three Supabase tables. Enquiries do not. They go through one small API route to a Google Apps Script and end up in a Google Sheet. Google Analytics 4 sits in the root layout. Select any block to see what it does.</p>
      </Prose>
      <div className="case-gap"/>
      <Plumbing/>
      <div className="case-gap"/>
      <Split>
        <div>
          <Prose>
            <p>Try the enquiry. The modal pre-fills its message with the product and the lender from the row you pressed. Leave a field out and see where it stops.</p>
          </Prose>
          <PayloadLab/>
        </div>
        <CodeNote file="app/api/contact/route.js" language="js" code={routeCode} caption="Validation on the server, then a plain POST to Apps Script. Trimmed."/>
      </Split>
      <div className="case-gap"/>
      <Decision title="Leads go to a spreadsheet, not the database" chosen="sheet" problem="Leads could sit next to the prices in Supabase, or in a sheet the whole team already knows."
        options={[
          { id: 'sheet', label: 'Google Sheet through Apps Script', body: 'Nothing to host and nothing to learn. A person on the team can add a call, a note or a follow-up status in a cell.', cost: 'Product views and enquiries live in different places, so linking them is manual work.' },
          { id: 'db', label: 'A Supabase table', body: 'Easier to automate and to join with product data.', cost: 'Reading leads would need an admin screen first.' },
          { id: 'crm', label: 'A CRM', body: 'The right home once there is a sales process to follow.', cost: 'A CRM adds a sales process to run, and the repo shows none.' },
        ]}/>
    </Chapter>

    <Chapter id="seo" title="Search" heading="The sitemap lists pages, not the admin">
      <Split>
        <div>
          <Prose>
            <p>Comparison queries are how a site like this gets found, so the basics are generated, not hand-written. <strong>next-sitemap</strong> runs after every build, writes the sitemap and the robots file, and skips the admin and API paths. The root layout sets the title, description, keywords, a canonical address on the www host and an Organization record in JSON-LD.</p>
            <p>The repo shows something worth checking. The sitemap file committed on 8 January 2026 contains five admin URLs. Toggle between that file and the live one.</p>
          </Prose>
        </div>
        <SitemapCompare/>
      </Split>
      <div className="case-gap"/>
      <Split reverse>
        <CodeNote file="next-sitemap.config.js" language="js" code={sitemapCode} caption="The exclude list is case-sensitive. The robots file repeats it as Disallow: /admin and /api."/>
        <Prose>
          <p><strong>What is not there yet:</strong> no Product or breadcrumb markup, no page for a single lender, and one big file per product page. The sitemap lists the six public pages and nothing else. A comparison page for a pair of lenders is the page I would build for search next.</p>
        </Prose>
      </Split>
    </Chapter>

    <Chapter id="design" title="Design" heading="Green says money. Contrast has to hold." tone="accent">
      <Split>
        <Prose>
          <p>The site is deliberately not corporate grey. It uses a deep forest green, a lime for actions and glass cards over a midnight hero. The aim was a product that feels more like an app than a branch.</p>
          <p>That choice has a cost, and numbers show it. I computed the contrast ratios of the pairs the site uses. Lime holds as a button with dark text. It cannot carry white text.</p>
        </Prose>
        <Contrast/>
      </Split>
      <Statement>Lime is for actions. Text stays on forest or midnight.</Statement>
    </Chapter>

    <Chapter id="record" title="The record" heading="What I built, and what others built" tone="paper">
      <Ledger mineTitle="What I did" othersTitle="What the team did" mine={[
        '162 of the 360 commits, across two spellings of my git identity.',
        'The home page: 84 of my commits touch app/page.js. The hero, the fanned product cards and the sections under them.',
        'The display cards component, the global styles and the page-level layout.',
        'Work on the LAS and LAMF pages and the comparison table, shared with Dhruv.',
      ]} others={[
        'Dhruv (137 commits, and the repository sits under his GitHub account): the comparison table, the product pages, navbar, footer, about and contact.',
        'Soham Thakare (60 commits under two names): the admin login and dashboard, the Vercel deploy workflow, config.',
        'The product decisions in this page were made together. I am not claiming them alone.',
      ]}/>
      <div className="case-gap"/>
      <Split>
        <CommitChart/>
        <Numbers items={[
          { label: 'commits, all authors', value: '360', note: '5 git author names, 4 email addresses. First on 11 July 2025, last on 10 February 2026.' },
          { label: 'lender rows', value: '11', note: 'Four for LAS, four for LAMF, three for MTF.' },
          { label: 'public pages', value: '6', note: 'Everything else is blocked from search.' },
        ]}/>
      </Split>
      <div className="case-gap"/>
      <Timeline label="Milestones from the git history" items={[
        { date: '11 Jul 2025', title: 'First commit', body: 'An Initial commit, a setup commit of mine and a navbar update, all on the first day. 21 commits that month.' },
        { date: '11 Oct 2025', title: 'Admin dashboard', body: 'The commit “Admin Dashboard done” lands. October is one of the two busiest months, with 108 commits.' },
        { date: '9 Nov 2025', title: 'Admin table editor', body: 'The commit “Admin Section Table Editor Done”. The people who keep prices current get a screen to do it on. 109 commits this month.' },
        { date: '17 Dec 2025', title: 'LAMF cost summary', body: 'The commit “lamf cost summary table done”: the year-one and year-two cost columns reach the mutual funds table.' },
        { date: '8 Jan 2026', title: 'Sitemap generated', body: 'The date stamped on the committed sitemap file, and the one containing the Admin URLs.' },
        { date: '10 Feb 2026', title: 'Latest commit', body: 'Navbar and logo fixes. Six commits in February.' },
      ]}/>
    </Chapter>

    <Chapter id="next" title="Next" heading="What I would change first">
      <Split>
        <Prose>
          <p><strong>A calculator in the visitor’s own numbers.</strong> The table fixes a ₹1 lakh basis. A visitor borrowing another amount has to do the arithmetic. Recharts is already a dependency and unused.</p>
          <p><strong>A date on every row.</strong> Prices change. Each lender row should say when it was last checked.</p>
          <p><strong>Split the big pages.</strong> The LAS page is 2,168 lines in one file, LAMF is 2,078 and MTF 1,329.</p>
        </Prose>
        <div>
          <CodeNote file="app/products/lamf/page.jsx" language="js" code={cleanCode} caption="Any text containing the letters “na” counts as a missing value, even one like “national”. I have not seen it misfire on live data. I would still match whole words."/>
          <p className="case-caption">Two smaller things I found: the enquiry modal keeps an unused pan field in its state and posts it empty, and the committed sitemap needs a case check in the build.</p>
        </div>
      </Split>
    </Chapter>
  </CasePage>;
}
