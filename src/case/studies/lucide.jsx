import React, { useEffect, useRef, useState } from 'react';
import '../styles/lucide.css';
import { CasePage, CaseHero, Chapter, Prose, Statement, Split, Reel, Shot, Decision, CodeNote, Ledger, Timeline, Numbers, Stage3D } from '../kit.jsx';
import { caseIndex } from '../caseIndex.js';
import useReducedMotion from '../../useReducedMotion.js';

const loadScene = () => import('../scenes/lucide.js');

const press = <svg viewBox="0 0 400 300" role="img" aria-label="A press above a paper brief and a finished browser tile"><rect x="40" y="236" width="320" height="22" rx="8" fill="#ebe8e1"/><rect x="186" y="40" width="28" height="196" rx="8" fill="#f4f1ea"/><rect x="170" y="30" width="60" height="26" rx="8" fill="#ed5939"/><rect x="132" y="168" width="136" height="36" rx="8" fill="#30312e"/><rect x="60" y="224" width="86" height="12" rx="3" fill="#fffdf8"/><rect x="262" y="214" width="88" height="22" rx="8" fill="#f4f1ea"/></svg>;

/* What each kind of client got. Every line below is read from the build's own repository. */
const kinds = [
  {
    id: 'exporter', chip: 'Exporter', build: 'Aarsh Global',
    heading: 'A pharmaceutical exporter that foreign buyers have to trust before they write.',
    steps: [
      ['Trust goes first', 'The home page carries a strip of eight certification logos: GST Council, FDA Maharashtra, MSME, Pharmexcil, DGFT, ISO 9001:2015 and two more.'],
      ['The catalogue routes itself', 'Products sit behind a category route and a product route, so every category and every product has its own address.'],
      ['A clear way to write', 'Company profile and contact each get a page of their own, apart from the catalogue.'],
    ],
    facts: [['Stack', 'Next.js 16.1.6, React 19.2.3, TypeScript, Tailwind CSS 4'], ['Routes', '/, /company-profile, /contact-us, /our-products, /category/[slug], /[slug]'], ['My share', '7 of the 19 commits. Teammates wrote the rest.']],
    note: 'No screenshot: this is a client build and I do not publish its address, so the routes are shown instead.',
  },
  {
    id: 'shop', chip: 'Herbal shop', build: 'AaradhyaHerbal',
    heading: 'A herbal manufacturer that wants to show its range and its prices.',
    steps: [
      ['A range you can search', 'A product listing with a search component, and one page per product addressed by its slug.'],
      ['Prices as their own page', 'The price list is a route of its own instead of a footnote under each product.'],
      ['Data from an API, never cached', 'Product pages read from a products API with caching switched off, so the data is fetched fresh on every request.'],
    ],
    facts: [['Stack', 'Next.js 16.1.1, React 19.2.3, JavaScript, Tailwind CSS 4, Framer Motion, the React Compiler plugin'], ['Routes', '/, /products, /products/[slug], /prices, /about'], ['My share', '8 of the 27 commits. Teammates wrote the rest.']],
    note: 'No screenshot: I have no public address for this build, so the routes are shown instead.',
  },
  {
    id: 'restaurant', chip: 'Restaurant', build: 'Dinedesk',
    heading: 'Cafes whose guests scan a table and whose staff watch the orders arrive.',
    steps: [
      ['Three doors, three roles', 'The first screen offers the customer experience, the owner dashboard and the super admin. Each lands in its own part of the app.'],
      ['The guest never installs anything', 'A table address opens the menu, then cart, order, payment and bill. Payment goes through Razorpay; tables get QR codes.'],
      ['The owner sees the day', 'Orders, menu, tables, reports and settings live in a dashboard; Recharts draws the analytics.'],
    ],
    facts: [['Stack', 'Next.js 14.2.35, React 18, Prisma, Supabase, Razorpay, Recharts, Radix UI, zod'], ['Pages', '19 page routes across customer, dashboard and admin'], ['My share', '1 of the 6 commits. Teammates wrote the rest.']],
    note: 'No screenshot: the repository runs as a local development portal, so I show its structure.',
  },
  {
    id: 'startup', chip: 'Product startup', build: 'The rest of this portfolio',
    heading: 'A founder who has to explain a product before the first call.',
    steps: caseIndex.filter(item => item.slug !== 'lucide' && item.slug !== 'gdc' && item.slug !== 'culprit' && item.slug !== 'mindspace').map(item => [item.name, item.line, `/work/${item.slug}/`]),
    facts: [['What these share', 'Each one is a product, not a brochure: a decision, a working piece of it and the consequences.'], ['Read next', 'Every name above opens its own case study.']],
    note: '',
  },
];

function BriefPicker() {
  const stage = useRef(null);
  const [id, setId] = useState('exporter');
  const [pressed, setPressed] = useState('Exporter brief pressed into a site.');
  const kind = kinds.find(item => item.id === id);
  const pick = next => { setId(next); stage.current?.send('kind', next); };
  return <>
    <div className="case-controls lc-kinds" role="group" aria-label="Kind of client" data-reveal>
      {kinds.map(item => <button key={item.id} type="button" className="case-chip" aria-pressed={id === item.id} onClick={() => pick(item.id)}>{item.chip}</button>)}
    </div>
    <div className="lc-picker">
      <div className="lc-picker-stage">
        <div className="case-stage-block is-tall" data-reveal>
          <Stage3D ref={stage} scene={loadScene} label="A paper brief slides under a press and comes out as a ceramic browser tile. Click the press to run it again." fallback={press} onEvent={(name, payload) => name === 'pressed' && setPressed(`${payload.title} pressed. Click the press to run it again.`)}/>
        </div>
        <p className="case-caption" aria-live="polite">{pressed}</p>
      </div>
      <article className="lc-sheet" key={kind.id} data-reveal>
        <p className="lc-build">{kind.build}</p>
        <h3>{kind.heading}</h3>
        <ul className="lc-steps">
          {kind.steps.map(([title, body, href]) => <li key={title}><h4>{href ? <a href={href}>{title}<span aria-hidden="true"> →</span></a> : title}</h4><p>{body}</p></li>)}
        </ul>
        <dl className="lc-facts">{kind.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        {kind.note && <p className="case-caption">{kind.note}</p>}
      </article>
    </div>
  </>;
}

/* The real hero technique, running here on 24 of the 240 real frames. */
const SAMPLE_COUNT = 24;
const tri = (p, a, b, c) => p <= a || p >= c ? 0 : p < b ? (p - a) / (b - a) : (c - p) / (c - b);
const stages = [
  { text: 'Clarity emerges from complexity', fn: p => tri(p, 0, .15, .3) },
  { text: 'Precision through process', fn: p => tri(p, .35, .45, .55) },
  { text: 'Architecting the future of digital logic', fn: p => tri(p, .6, .7, .85) },
  { text: 'LUCID TECH', fn: p => Math.min(1, Math.max(0, (p - .85) / .1)) },
];

function FrameScrubber() {
  const reduced = useReducedMotion();
  const wrap = useRef(null), canvas = useRef(null), images = useRef([]), dims = useRef(null), last = useRef(-1), p = useRef(0), counts = useRef({ ticks: 0, draws: 0 }), visible = useRef(false), playing = useRef(false), loaded = useRef(false);
  const [view, setView] = useState({ p: 0, ticks: 0, draws: 0 });
  const [play, setPlay] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let frameId = 0, previous = 0, sync = 0, alive = true, count = 0;
    images.current = []; last.current = -1; loaded.current = false;
    const measure = () => {
      const node = canvas.current, box = wrap.current, first = images.current[0];
      if (!node || !box || !first) return;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      node.width = Math.round(box.clientWidth * ratio); node.height = Math.round(box.clientHeight * ratio);
      const imgRatio = first.naturalWidth / first.naturalHeight, canvasRatio = node.width / node.height;
      let w, h, x, y;
      if (imgRatio > canvasRatio) { h = node.height; w = h * imgRatio; x = (node.width - w) / 2; y = 0; } else { w = node.width; h = w / imgRatio; x = 0; y = (node.height - h) / 2; }
      dims.current = { w, h, x, y };
      last.current = -1;
    };
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const img = new Image();
      img.onload = () => { count += 1; if (count === SAMPLE_COUNT && alive) { loaded.current = true; measure(); setReady(true); } };
      img.src = `/cases/lucide/seq/f${String(i).padStart(2, '0')}.jpg`;
      images.current[i] = img;
    }
    const resizer = new ResizeObserver(measure); resizer.observe(wrap.current);
    const observer = new IntersectionObserver(entries => { visible.current = entries[0].isIntersecting; if (visible.current && !frameId) frameId = requestAnimationFrame(tick); });
    observer.observe(wrap.current);
    function tick(now) {
      frameId = 0;
      if (!visible.current) return;
      const dt = previous ? Math.min(.05, (now - previous) / 1000) : 0; previous = now;
      if (playing.current) p.current = (p.current + dt / 9) % 1;
      counts.current.ticks += 1;
      const frame = Math.floor(p.current * 239) + 1;
      if (frame !== last.current && dims.current && loaded.current) {
        const ctx = canvas.current.getContext('2d', { alpha: false });
        const { w, h, x, y } = dims.current;
        ctx.drawImage(images.current[Math.min(SAMPLE_COUNT - 1, Math.round((frame - 1) / 10))], x, y, w, h);
        last.current = frame; counts.current.draws += 1;
      }
      if (now - sync > 90) { sync = now; setView({ p: p.current, ticks: counts.current.ticks, draws: counts.current.draws }); }
      frameId = requestAnimationFrame(tick);
    }
    return () => { alive = false; cancelAnimationFrame(frameId); resizer.disconnect(); observer.disconnect(); };
  }, []);

  const toggle = () => { playing.current = !playing.current; setPlay(playing.current); };
  const scrub = event => { const value = Number(event.target.value); p.current = value; setView(current => ({ ...current, p: value })); };
  const frame = Math.floor(view.p * 239) + 1;

  return <div className="lc-scrub" data-reveal>
    <div className="lc-scrub-view" ref={wrap}>
      <canvas ref={canvas} role="img" aria-label={`Frame ${frame} of 240 from the studio's scroll hero`}/>
      {!ready && <p className="lc-scrub-loading">Loading 24 frames</p>}
      <div className="lc-scrub-text" aria-hidden="true">
        {stages.map(stage => <p key={stage.text} style={{ opacity: stage.fn(view.p) }}>{stage.text}</p>)}
      </div>
    </div>
    <div className="lc-scrub-controls">
      <button type="button" className="case-round" onClick={toggle} aria-label={play ? 'Pause the scrub' : 'Play the scrub'}>{play ? '❚❚' : '▶'}</button>
      <label className="lc-range"><span>Scroll position</span><input type="range" min="0" max="1" step="0.001" value={view.p} onChange={scrub} aria-valuetext={`Frame ${frame} of 240`}/></label>
    </div>
    <dl className="lc-readout">
      <div><dt>Frame shown</dt><dd>{frame}<span> / 240</span></dd></div>
      <div><dt>Ticks of the loop</dt><dd>{view.ticks}</dd></div>
      <div><dt>Canvas redraws</dt><dd>{view.draws}</dd></div>
    </dl>
  </div>;
}

const studioPortfolio = caseIndex.filter(item => item.slug !== 'lucide');

export default function Lucide() {
  return <CasePage slug="lucide">
    <CaseHero
      name="Lucide Tech"
      title="Turn a brief into a presence."
      lede="Lucide Tech is my web design and development studio. A brief goes under the press. A site comes out. This page shows how, and the builds that prove it."
      facts={[{ label: 'Role', value: 'Founder, design and engineering' }, { label: 'Timeline', value: 'Est. 2024, per lucide.in' }, { label: 'Stack', value: 'Next.js, React, Framer Motion, canvas' }, { label: 'Status', value: 'Live at lucide.in' }]}
      links={[{ href: 'https://lucide.in', label: 'Open lucide.in' }, { href: '#brief', label: 'Pick a client' }]}
      stage={<Stage3D scene={loadScene} eager label="A workshop press: a paper brief slides under it and comes out as a ceramic browser tile. Click to press again." fallback={press}/>}
      note="Click the press, the sheet or the tile."
    />

    <Chapter id="brief" title="Brief" heading="Pick a client and press the brief" tone="paper">
      <Prose><p>Every client arrives as a few sentences. Choose one of four kinds. The press re-prints the brief and stamps out the matching site, and the sheet beside it lists what the real build did about that brief.</p></Prose>
      <BriefPicker/>
    </Chapter>

    <Chapter id="versions" title="Versions" heading="I built the studio site three ways" tone="ink">
      <Prose><p>Two repositories and the live site. They do not agree on what a studio looks like, which is the useful part.</p></Prose>
      <div className="case-gap"/>
      <Reel label="Screens of lucide.in" shots={[
        { src: '/cases/lucide/desktop-0.jpg', alt: 'lucide.in hero: a street lamp on a dark field and the line We build what finds you in the dark', caption: 'lucide.in today. A lamp, a dark field, and one sentence.', address: 'lucide.in', priority: true },
        { src: '/cases/lucide/desktop-3.jpg', alt: 'lucide.in services section: Design that converts, with a blue shader tile labelled Web Design', caption: 'The services section: one service at a time, each with its own shader tile.', address: 'lucide.in' },
        { src: '/cases/lucide/mobile-0.jpg', alt: 'lucide.in on a phone: the lamp hero and a Start a project button', frame: 'phone', caption: 'On a phone the lamp moves to the edge.' },
        { src: '/cases/lucide/mobile-3.jpg', alt: 'lucide.in on a phone: Web Development, Engineered to perform', frame: 'phone', caption: 'Web Development, the second service.' },
      ]}/>
      <div className="case-gap"/>
      <Timeline label="The three versions" items={[
        { date: 'Scroll hero', title: 'lucide-website', body: 'Next.js 16.1.1 with Framer Motion. The hero is a 240-frame image sequence on a canvas, with four lines of copy fading in and out as you scroll: Clarity emerges from complexity, Precision through process, Architecting the future of digital logic, LUCID TECH. Three services: Intelligent Systems, Digital Products, Strategic Design. Three commits, all mine.' },
        { date: 'Lamp and shader', title: 'lucide-agency', body: 'Next.js 15.5.4 with Turbopack. A lamp component, a raycast background, magnetic lines, a liquid button and a UnicornStudio scene loaded without server rendering. Four commits, all mine.' },
        { date: 'Live today', title: 'lucide.in', body: 'A lamp hero that says We build what finds you in the dark, a service section titled Four things we do best, and a Start a project button. I read this from the live pages. I have not checked which repository it was built from, so I will not pretend to know.' },
      ]}/>
    </Chapter>

    <Chapter id="frames" title="Frames" heading="A hero scrubbed by 240 frames" tone="plain">
      <Split>
        <Prose>
          <p>The first studio site opens on a glass slab that comes apart into an exploded device. It is not a video. It is 240 stills drawn onto one canvas, and your scroll position decides which one.</p>
          <p>Drag the slider or press play. The demo below runs the same loop on every tenth frame, 24 of the 240, so it stays light. Watch the two counters. The loop ticks on every animation frame, but the canvas only redraws when the frame number changes.</p>
        </Prose>
        <Prose>
          <p>The real hero keeps three things out of the loop. Dimensions are calculated once on resize. The last drawn frame is remembered. The canvas is opaque, so nothing needs clearing.</p>
          <p>The cost is honest too: the frames are about 13 MB on disk, none are lazy loaded, and a low-memory phone will feel it.</p>
        </Prose>
      </Split>
      <div className="case-gap"/>
      <FrameScrubber/>
      <div className="case-gap"/>
      <CodeNote file="lucide-website/src/components/SystemScroll.tsx" language="tsx" caption="The render loop of the real hero. One comparison keeps it from redrawing a frame it has already drawn." code={`const render = () => {
    const currentFrame = Math.floor(frameIndex.get()) - 1;

    if (currentFrame !== lastFrameRef.current && images[currentFrame] && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d", { alpha: false });
        if (ctx) {
            const { width, height, x, y } = dimensionsRef.current;
            // Note: No clearRect needed because images are full-screen and opaque
            ctx.drawImage(images[currentFrame], x, y, width, height);
            lastFrameRef.current = currentFrame;
        }
    }
    frameId = requestAnimationFrame(render);
};`}/>
    </Chapter>

    <Chapter id="decisions" title="Decisions" heading="Three calls that shaped the builds" tone="paper">
      <Decision title="How should a hero move on scroll?" chosen="canvas" problem="The first studio site needed a hero that felt authored, not scrolled past. Three ways to get motion tied to the scroll bar."
        options={[
          { id: 'canvas', label: 'A canvas image sequence', body: 'Preload every frame, map scroll progress to a frame number and draw that still. Each scroll position has an exact picture.', cost: 'About 13 MB of frames with no lazy loading. Works best on desktop and can strain low-memory phones.' },
          { id: 'video', label: 'A video, seeked by scroll', body: 'One file, small by comparison. Moving the playhead from scroll depends on how often the encoder placed keyframes.', cost: 'Seeking is only as exact as the keyframes, so scrubbing can stutter.' },
          { id: 'css', label: 'CSS transforms', body: 'Move, scale and fade layers with scroll-linked CSS. No assets to load.', cost: 'It moves a layer. It cannot play 240 different renders of one object.' },
        ]}/>
      <Decision title="Where should a studio's 3D background come from?" chosen="unicorn" problem="The second site wanted depth behind the hero without a week of shader work."
        options={[
          { id: 'unicorn', label: 'Embed a UnicornStudio scene', body: 'A dynamically imported React component with server rendering off, layered under the interface. The scene is authored visually.', cost: 'An outside service, more JavaScript in the bundle and a dependency I do not control.' },
          { id: 'three', label: 'Write it in Three.js', body: 'Full control over geometry, light and behaviour. It is how every object on this portfolio is built.', cost: 'Time. Every scene is custom code, so it only pays when the scene is the point.' },
          { id: 'still', label: 'A still image', body: 'Cheapest and most portable.', cost: 'No depth, no response to the pointer. It would not carry the studio.' },
        ]}/>
      <Decision title="One app for three kinds of people, or three apps?" chosen="one" problem="Dinedesk serves guests at a table, cafe owners and a platform admin. We kept their needs apart without splitting the codebase. This was a team decision."
        options={[
          { id: 'one', label: 'One Next.js app, three areas', body: 'Customer pages, an owner dashboard and an admin area live as separate route groups. Prisma and Supabase sit behind all of them.', cost: 'Auth and sessions get harder, and each role needs its own mental model. More roles would hurt.' },
          { id: 'three', label: 'Three separate apps', body: 'Each role gets its own deploy and its own code.', cost: 'Shared things such as the menu model would be copied or published as a package, for three roles.' },
        ]}/>
    </Chapter>

    <Chapter id="numbers" title="Numbers" heading="What I can count, and whose it is" tone="plain">
      <Numbers items={[
        { label: 'frames in the scroll hero', value: '240', note: 'About 13 MB, read from the sequence folder.' },
        { label: 'page routes in Dinedesk', value: '19', note: 'Across customer, dashboard and admin.' },
        { label: 'certification logos on one home page', value: '8', note: 'Aarsh Global.' },
        { label: 'studio site repositories', value: '2', note: 'Plus the live site.' },
      ]}/>
      <div className="case-gap"/>
      <Ledger mineTitle="What is mine" othersTitle="What is shared" mine={[
        'Both studio site repositories: 3 and 4 commits, all mine.',
        'Two small prototypes alone, one of them an early OpenAI experiment.',
        'Commits in the client builds: 8 of 27 in AaradhyaHerbal, 7 of 19 in Aarsh Global, 1 of 6 in Dinedesk.',
      ]} others={[
        'The rest of those commits were written by teammates.',
        'So these are studio builds, shown as studio work. I do not claim them as solo work.',
        'I publish no client results, no revenue and no testimonials, because I have none to show here.',
      ]}/>
    </Chapter>

    <Chapter id="portfolio" title="Portfolio" heading="One studio sits behind this portfolio" tone="ink">
      <div className="lc-umbrella">
        <Prose>
          <p>Lucide Tech is the umbrella over the products on this site. Luman runs at luman.lucide.in. Every name on the right opens its own case study, each one a decision followed to its consequences.</p>
          <p>CompareFi and Notaprompt sit in the same studio folder as the client builds above.</p>
        </Prose>
        <ul className="lc-roster" data-reveal>
          {studioPortfolio.map(item => <li key={item.slug}><a href={`/work/${item.slug}/`}><span className="lc-roster-name">{item.name}</span><span className="lc-roster-line">{item.line}</span></a></li>)}
        </ul>
      </div>
    </Chapter>

    <Chapter id="next" title="Next" heading="Next: show the work, measure the site" tone="paper">
      <Split>
        <Statement>The proof is in the builds, so the studio site should show them.</Statement>
        <Prose>
          <p>Three things I would do. These are plans, not shipped work.</p>
          <ul>
            <li>Put real captures of the client builds on the studio site, with the clients' permission.</li>
            <li>Collapse the three versions into one, and keep the scroll hero as a chapter.</li>
            <li>Add analytics. The code I read has none, so I cannot say how any of it performs.</li>
          </ul>
        </Prose>
      </Split>
    </Chapter>
  </CasePage>;
}
