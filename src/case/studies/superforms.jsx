import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../styles/superforms.css';
import { CasePage, CaseHero, Chapter, Prose, Split, CodeNote, Timeline, Numbers, Stage3D } from '../kit.jsx';
import useReducedMotion from '../../useReducedMotion.js';
import { ProductScreens, EditLab, ProductDecisions, GrowthPlan } from '../superformsStory.jsx';
import { THEMES, FREE_AESTHETICS, themeFor } from '../scenes/superformsModel.js';

const heroScene = () => import('../scenes/superforms.js');
const labScene = () => import('../scenes/superformsLab.js');

const StackFallback = () => <svg viewBox="0 0 320 360" width="320" role="img" aria-label="A stack of form question blocks, each with a coral id stamp">
  {[0, 1, 2, 3, 4].map(i => <g key={i} transform={`translate(${i % 2 ? 6 : 0} ${i * 64 + 20})`}><rect width="260" height="52" x="30" rx="10" fill={i === 0 ? '#30312e' : '#f4f1ea'}/><circle cx="62" cy="26" r="14" fill="#ed5939"/><rect x="92" y="20" width="110" height="12" rx="6" fill={i === 0 ? '#fff' : '#30312e'} opacity=".7"/></g>)}
</svg>;

/* ---------- Chapter 1: the identity demo ---------- */
const ANSWERS = { 1: 'Sample Person', 2: 'sample@example.com', 3: 'Frontend craft' };
const ID_MODES = [
  { id: 'original', label: 'Original form', list: [[1, 'Your name'], [2, 'Email address'], [3, 'Which session?']], say: 'Three questions, three ids, three stored answers. Every answer row points at its question by id.' },
  { id: 'keep', label: 'AI reorders, ids kept', list: [[2, 'Email address'], [1, 'Your name'], [3, 'Which session?']], say: 'Email moved to the top. The stamps moved with the blocks, so every stored answer still lands on its own question.' },
  { id: 'renumber', label: 'AI reorders, ids renumbered', list: [[1, 'Email address'], [2, 'Your name'], [3, 'Which session?']], say: 'Same reorder, but the ids were renumbered by position. Old answer 1 now reads as the email, so a name sits under Email address and an email under Your name. Nothing errors. The data is just wrong.' },
];
function IdDemo() {
  const [mode, setMode] = useState('keep');
  const current = ID_MODES.find(item => item.id === mode);
  return <div className="sf-iddemo" data-reveal>
    <div className="sf-id-modes" role="group" aria-label="What the AI edit did to the form">
      {ID_MODES.map(item => <button key={item.id} type="button" className="case-chip" aria-pressed={mode === item.id} onClick={() => setMode(item.id)}>{item.label}</button>)}
    </div>
    <div className="sf-id-grid">
      <div className="sf-id-col"><h3>The form after the edit</h3>
        <ol className="sf-id-list">{current.list.map(([id, label]) => <li key={label}><span className="sf-stamp" aria-label={`id ${id}`}>{id}</span><span>{label}</span></li>)}</ol>
      </div>
      <div className="sf-id-col"><h3>A stored response, read through that form</h3>
        <ul className="sf-id-list sf-id-answers">{current.list.map(([id, label]) => {
          const stored = ANSWERS[id], original = ID_MODES[0].list.find(([, text]) => text === label)[0];
          const wrong = ANSWERS[original] !== stored;
          return <li key={label} data-wrong={wrong}><span className="sf-id-answer"><small>{label}{wrong ? ' (wrong answer)' : ''}</small><strong>{stored}</strong></span></li>;
        })}</ul>
      </div>
    </div>
    <p className="sf-id-verdict" aria-live="polite">{current.say}</p>
    <p className="case-caption">Sample answers, simulated. In the product an answer row stores the question&rsquo;s id as a derived uuid, so ids are the join key for the viewer, CSV export and Google Sheets.</p>
  </div>;
}

/* ---------- Chapter 5: aesthetics ---------- */
const FONTS = { sans: 'inherit', serif: 'Georgia, "Times New Roman", serif', mono: 'ui-monospace, "Cascadia Code", Consolas, monospace' };
const luminance = hex => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const onColor = hex => luminance(hex) > .4 ? '#0d0d0d' : '#ffffff';
function ThemeFragment({ theme }) {
  const radius = theme.input === 'pill' ? 28 : ['grid', 'scanline', 'corner'].includes(theme.motif) || theme.name === 'Brutalist' ? 0 : theme.card === theme.bg ? 0 : 14;
  const tint = theme.dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)', edge = theme.dark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.35)';
  const field = { underline: { borderBottom: `2px solid ${edge}`, padding: '13px 2px' }, boxed: { border: `1.5px solid ${edge}`, borderRadius: theme.name === 'Terminal' || theme.name === 'Brutalist' ? 0 : 6 }, pill: { border: `1.5px solid ${edge}`, borderRadius: 999, padding: '13px 20px' }, inset: { background: tint, borderRadius: 12 } }[theme.input];
  const accentFg = onColor(theme.accent);
  const button = { filled: { background: theme.accent, color: accentFg }, pill: { background: theme.accent, color: accentFg, borderRadius: 999 }, soft: { background: `color-mix(in srgb, ${theme.accent} 22%, transparent)`, color: theme.text, borderRadius: 12 }, outline: { border: `1.5px solid ${theme.text}`, color: theme.text } }[theme.button];
  const sharp = theme.name === 'Terminal' || theme.name === 'Brutalist' || theme.name === 'NeoBrutalist';
  const upper = theme.name === 'Terminal' || theme.name === 'Brutalist';
  const font = FONTS[theme.font];
  return <div className="sf-fragment" data-ui style={{ background: theme.bg, color: theme.text, fontFamily: font }}>
    <div className="sf-card" style={{ background: theme.card, color: theme.card === '#FFFFFF' || theme.name === 'Boardroom' ? (theme.name === 'Boardroom' ? '#10131a' : theme.text) : theme.text, borderRadius: radius, border: ['Brutalist', 'NeoBrutalist', 'Marker', 'Terminal', 'Cyberpunk', 'Bubblegum'].includes(theme.name) ? `${theme.name === 'NeoBrutalist' ? 3 : 2}px solid ${theme.name === 'Brutalist' ? '#fff' : theme.name === 'Terminal' ? theme.accent : theme.name === 'Cyberpunk' ? '#ff007f' : theme.name === 'Bubblegum' ? '#ff4fa3' : '#000'}` : 'none' }}>
      <p className="sf-f-count">3 / 5</p>
      <h4 style={{ textTransform: upper ? 'uppercase' : 'none', fontStyle: theme.name === 'Editorial' ? 'italic' : 'normal', fontWeight: theme.font === 'mono' || theme.name === 'Brutalist' ? 800 : 650 }}>Which session would you join?</h4>
      <p className="sf-f-help">Choose one. You can change it later.</p>
      <div className="sf-f-opts">{['Product decisions', 'Frontend craft', 'Shipping v1'].map((option, i) => <div key={option} className="sf-f-opt" style={{ ...field, outline: i === 1 ? `2px solid ${theme.accent}` : 'none', outlineOffset: 2, color: 'inherit' }}>{option}</div>)}</div>
      <button type="button" className="sf-f-btn" tabIndex={-1} style={{ ...button, borderRadius: button.borderRadius ?? (sharp ? 0 : 10), textTransform: upper ? 'uppercase' : 'none', fontFamily: font }}>Continue</button>
    </div>
  </div>;
}
function Aesthetics() {
  const [name, setName] = useState('Terminal');
  const theme = themeFor(name);
  const group = (title, list) => <div className="sf-swatch-group"><h3>{title}</h3><div className="sf-swatches">{list.map(item => <button key={item.name} type="button" aria-pressed={name === item.name} onClick={() => setName(item.name)}><span className="sf-dot" style={{ background: item.bg, outline: `3px solid ${item.accent}`, outlineOffset: -3 }}/>{item.name}</button>)}</div></div>;
  return <div className="sf-aes">
    <div className="sf-aes-copy" data-reveal>
      {group('Free: 4', THEMES.filter(item => item.free))}
      {group('Pro: 17', THEMES.filter(item => !item.free))}
    </div>
    <div className="sf-fragment-wrap" data-reveal>
      <ThemeFragment theme={theme}/>
      <p className="sf-fragment-caption" aria-live="polite"><strong>{theme.name}.</strong> {theme.free ? 'On every plan.' : `A Pro aesthetic. If a Free account asks the AI for it, set_style becomes "${FREE_AESTHETICS[0]}".`} Colours, font pairing, button and input shape are read from the real style map; textures and shadows are left out of this miniature.</p>
    </div>
  </div>;
}

/* ---------- Chapter 6: submission paths ---------- */
const PATHS = [
  { id: 'native', name: 'Native runner', sub: 'the public form at /f/slug', steps: [['Respondent', 'Fills the form at /f/slug'], ['Browser', 'Anon Supabase key, checked by RLS'], ['responses + answers', 'One row per question, keyed by question id'], ['Afterwards', 'Sheets sync and webhooks, fire and forget']] },
  { id: 'gated', name: 'Gated runner', sub: 'forms with a Google sign-in block', steps: [['Respondent', 'Signs in with Google, gets a 30-day signed cookie'], ['Server', 'POST /api/forms/submit-gated, service role'], ['responses + answers', 'Same shape as native, plus verified email'], ['Afterwards', 'Sync and webhooks with the identity attached']] },
  { id: 'api', name: 'Raw API and embeds', sub: 'POST /api/submit/formId', steps: [['Embed or script', 'HTML form action or a JSON post'], ['Server', 'Service role, no browser involved'], ['submissions.data', 'The whole payload as one JSON blob'], ['Afterwards', 'Same triggers, with an internal secret']] },
];
function Paths() {
  const [open, setOpen] = useState('native');
  return <div className="sf-paths" data-reveal>
    {PATHS.map(path => <div key={path.id} className="sf-path" data-on={open === path.id}>
      <button type="button" className="sf-path-name" aria-pressed={open === path.id} onClick={() => setOpen(path.id)}>{path.name}<small>{path.sub}</small></button>
      <ol className="sf-path-steps">{path.steps.map(([title, body]) => <li key={title}><strong>{title}</strong>{body}</li>)}</ol>
    </div>)}
    <p className="sf-path-foot">{open === 'api' ? 'This path writes a different table. The responses viewer and CSV export read both shapes, so neither source is second class.' : 'Native and gated submissions agree on one vocabulary, lib/formSubmission.ts, so a bug in one path shows up in the other.'}</p>
  </div>;
}

const SANITIZER_CODE = `case "edit_question": {
  if (typeof raw.id !== "number" || !raw.changes || typeof raw.changes !== "object") return null;
  // Never let an edit rewrite a block into an invalid type.
  const changes = { ...raw.changes };
  if ("type" in changes) {
    const probe = coerceBlockType({ type: changes.type });
    changes.type = probe.type;
  }
  // "id" is identity, not a mutable field — strip it from changes.
  delete changes.id;
  return { op: "edit_question", id: raw.id, changes };
}`;
const COERCE_CODE = `export function coerceBlockType<T extends { type?: unknown }>(q: T): T {
  if (q && typeof q === "object" && !VALID_BLOCK_TYPES.has(q.type as string)) {
    return { ...q, type: "short" };
  }
  return q;
}`;
const UUID_CODE = `export function answerQuestionUuid(questionId: number | string): string {
  return \`00000000-0000-0000-0000-\${String(questionId).padStart(12, "0")}\`;
}`;
const TERMINAL_CODE = `Terminal: {
  pageBg: "bg-[#020A02] text-[#33FF66]",
  // pageTexture: scanline gradients (omitted)
  card: "bg-[#020A02] border border-[#33FF66]/40",
  button: "bg-[#33FF66] text-[#020A02] font-mono font-bold rounded-none uppercase hover:brightness-110",
  accentHex: "#33FF66",
  dark: true,
  motif: "scanline",
  defaults: { button: "filled", elevation: "framed", fontPairing: "mono", inputShape: "boxed" },
},`;

/* ---------- The page ---------- */
export default function Superforms() {
  const [edit, setEdit] = useState(null), [paused, setPaused] = useState(false), [ready, setReady] = useState(false);
  const reduced = useReducedMotion();
  const heroRef = useRef(null);
  const onHero = useCallback((name, payload) => {
    if (name === 'ready') setReady(v => v + 1);
    if (name === 'instruction' || name === 'edit') setEdit(payload);
    if (name === 'reset') setEdit(null);
  }, []);
  useEffect(() => { if (ready) heroRef.current?.send('pause', paused || reduced); }, [ready, paused, reduced]);
  const note = <><span className="sf-hero-caption">{edit ? edit.text : 'Rearrange. Rewrite. Restyle.'}</span><span className="sf-hero-assurance">The form changes. Its answer connections stay intact.</span><span className="sf-hero-controls">{!reduced && <button type="button" aria-pressed={paused} onClick={() => setPaused(v => !v)}>{paused ? 'Play animation' : 'Pause animation'}</button>}<button type="button" onClick={() => heroRef.current?.send('next')}>Next edit</button><button type="button" onClick={() => heroRef.current?.send('replay')}>Replay</button></span></>;

  return <CasePage slug="superforms">
    <CaseHero
      name="Superforms"
      title="Make a form. Make it yours."
      lede="A form builder where an AI can reword, retype and reorder your form without losing a single answer. I designed and built the product, and the guard that makes that safe."
      facts={[{ label: 'Role', value: 'Product and engineering, end to end' }, { label: 'Timeline', value: 'Apr to Oct 2026, 130 commits' }, { label: 'Stack', value: 'Next.js 16, React 19, Supabase, OpenAI' }, { label: 'Status', value: 'Live at superforms.in' }]}
      links={[{ href: 'https://superforms.in', label: 'Open superforms.in' }, { href: '#lab', label: 'Try the AI edit' }]}
      stage={<Stage3D ref={heroRef} eager scene={heroScene} label="A 3D stack of form question blocks, each stamped with its id. Click to run an AI edit; blocks reorder, retype and reword while the id stamps stay attached." fallback={<StackFallback/>} onEvent={onHero}/>}
      note={note}
    />

    <Chapter id="problem" title="The problem" heading="An AI edit puts every answer at risk">
      <div className="sf-two">
        <div className="sf-problem-reading" data-reveal>
          <p className="sf-problem-lead">Change the form.<br/>Keep the answers trustworthy.</p>
          <p>A creator might ask for a better question, a new order or a different look. They should be able to make that change without worrying about the answers they already collected.</p>
          <p>If the AI changes a question&rsquo;s identity, an answer can end up under the wrong heading. The form still looks fine. The data is quietly wrong.</p>
          <p className="sf-problem-rule"><strong>My boundary:</strong> AI can change the wording, type and order. It cannot change which question an existing answer belongs to.</p>
        </div>
        <IdDemo/>
      </div>
    </Chapter>

    <Chapter id="product" title="The product" heading="Describe it, then edit it in words" tone="paper">
      <div className="sf-product-intro" data-reveal><p>Describe the starting form, then refine it where the work happens. The builder keeps the question list, editable canvas and settings together.</p><p>Build the content, choose its design, and try the respondent view before you publish. Ask AI handles a revision; direct editing keeps small corrections close.</p></div>
      <ProductScreens/>
    </Chapter>



    <Chapter id="aesthetics" title="21 aesthetics" heading="21 ways to make it yours" tone="paper">
      <Aesthetics/>
      <div className="case-gap"/>
      <Split>
        <Prose>
          <p>Every aesthetic is one entry in a single map: Tailwind class slots for the page, card, title, button and inputs, a signature motif, a dark flag, an accent, and defaults for button, elevation, font pairing and input shape.</p>
          <p>The builder preview, the public runner and the marketing preview import the same file. Adding an aesthetic is one entry. The AI editor is told only which aesthetics your plan may use, and the sanitizer clamps anything else.</p>
        </Prose>
        <CodeNote file="lib/aestheticStyles.ts" language="ts" code={TERMINAL_CODE} caption="One real entry, trimmed. The class strings carry the look; nothing is repeated in the builder or the runner."/>
      </Split>
    </Chapter>

    <Chapter id="decisions" title="Decisions" heading="Each decision has a price I can name">
      <ProductDecisions/>
    </Chapter>



    <Chapter id="lab" title="Try an edit" heading="One edit. Same trusted answers." tone="ink" wide><EditLab/></Chapter>

    <Chapter id="underhood" title="Under the hood" heading="One schema, three ways to submit">
      <Paths/>
      <div className="sf-code-pair">
        <div className="sf-code-stack">
          <CodeNote file="app/api/ai-edit/route.ts" language="ts" code={SANITIZER_CODE} caption="The identity guard. An edit can rewrite any field except the one that says which question it is."/>
          <CodeNote file="lib/formSchema.ts" language="ts" code={COERCE_CODE}/>
        </div>
        <div className="sf-code-stack">
          <Prose>
            <p>The twelve types the sanitizer accepts do not include <strong>signin</strong> or <strong>canvas</strong>. A model cannot add a sign-in gate to your form, because the gate would be coerced into a short text field.</p>
            <p>Answers are stored against an id derived from the block&rsquo;s number. The viewer, CSV export and the Sheets sync each reproduce it, which is why the first rule of the repo&rsquo;s compatibility notes is that it never changes.</p>
          </Prose>
          <CodeNote file="lib/formSubmission.ts" language="ts" code={UUID_CODE}/>
        </div>
      </div>
    </Chapter>

    <Chapter id="numbers" title="Counted" heading="Counted from the repo, not guessed" tone="ink">
      <Numbers items={[
        { label: 'Commits', value: '130', note: 'Apr 16 to Oct 13, 2026' },
        { label: 'Aesthetics', value: '21', note: '4 free, 17 Pro, one style map' },
        { label: 'Block types an AI can add', value: '12', note: 'signin and canvas are not among them' },
        { label: 'Edit operations', value: '6', note: 'each one sanitized before it touches a form' },
        { label: 'Migrations', value: '13', note: 'none drops a table or a column' },
      ]}/>
    </Chapter>

    <Chapter id="history" title="History" heading="What the commit log admits to" tone="paper">
      <Timeline label="Superforms history" items={[
        { date: 'Apr 16', title: 'First commit', body: 'Schema and auth first. The form lives in one JSON column from the start, which is what everything later leans on.' },
        { date: 'May 27', title: 'Blank form, instantly', body: 'An instant blank form that skips the AI, a premium loader, and routing-rule polish. The first version of the product was in production by then.' },
        { date: 'Jun 26', title: 'Aesthetics grow up', body: 'A contrast and dark-theme pass across the aesthetics, Free accounts blocked from publishing Pro ones, a coupon system, and the SEO pages.' },
        { date: 'Jul 15', title: 'The two-layer prompt', body: 'The commit reads “2-layer-layout for master prompt done”: the router and the sliced executor. A per-user AI-edit quota migration lands the same week.' },
        { date: 'Sep 18', title: 'A silent 1000-row cap', body: 'The database client returns the first 1000 rows with no error. A busy form was quietly losing answers in the viewer and the Sheets sync. I added a paging helper and fixed a header-write race the same day.' },
        { date: 'Oct 13', title: 'Voice, hardened', body: 'Signed tokens and usage caps for voice transcription, duplicate-submission blocking, and instant templates.' },
      ]}/>
    </Chapter>

    <Chapter id="next" title="Next" heading="The next bet is distribution">
      <GrowthPlan/>
    </Chapter>
  </CasePage>;
}
