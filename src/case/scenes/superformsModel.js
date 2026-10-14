// Shared model for the Superforms case study: a faithful JS port of the AI-edit sanitizer
// (superform-v2/app/api/ai-edit/route.ts, lib/formSchema.ts) plus a small form reducer.
// The LLM step is scripted: the proposals below are shaped like the failures the sanitizer exists for.

export const FREE_AESTHETICS = ['Minimal', 'Editorial', 'Glass', 'Cinematic'];
export const VALID_BLOCK_TYPES = ['cover', 'section', 'short', 'long', 'email', 'phone', 'multiple', 'dropdown', 'yesno', 'rating', 'upload', 'consent'];
const STYLE_SURFACES = ['Flat', 'Card', 'Glass', 'Frame'];
const STYLE_TYPOGRAPHY = ['SM', 'MD', 'LG', 'XL'];
const STYLE_RADIUS = ['None', 'SM', 'MD', 'Full'];

// Real tokens from lib/aestheticStyles.ts (page background, text, accent, dark flag, font pairing, button, input shape).
// `slab` is the solid tone the 3D blocks take; textures and shadows from the real map are left out of the miniature.
const T = (name, free, bg, text, card, accent, dark, font, button, input, motif) => ({ name, free, bg, text, card, accent, dark, font, button, input, motif });
export const THEMES = [
  T('Minimal', true, '#FAF9F6', '#0D0D0D', '#FFFFFF', '#0D0D0D', false, 'sans', 'filled', 'underline', 'rule'),
  T('Editorial', true, '#FAF8F4', '#0D0D0D', '#FAF8F4', '#0D0D0D', false, 'serif', 'pill', 'underline', 'quote'),
  T('Glass', true, '#EEF2F8', '#0D0D0D', '#F7F9FC', '#0D0D0D', false, 'sans', 'soft', 'inset', 'glow'),
  T('Cinematic', true, '#0D0D0D', '#FFFFFF', '#1A1A1A', '#FFFFFF', true, 'serif', 'filled', 'underline', 'kicker'),
  T('Brutalist', false, '#000000', '#FFFFFF', '#141414', '#FFFFFF', true, 'sans', 'filled', 'boxed', 'grid'),
  T('NeoBrutalist', false, '#FFDF00', '#000000', '#FFFFFF', '#2563EB', false, 'sans', 'filled', 'boxed', 'corner'),
  T('Cyberpunk', false, '#0A051B', '#00FFC2', '#150B30', '#FF007F', true, 'mono', 'filled', 'underline', 'glow'),
  T('Vogue', false, '#F7F4EF', '#111111', '#F7F4EF', '#111111', false, 'serif', 'filled', 'underline', 'rule'),
  T('MidnightOLED', false, '#000000', '#EDEDED', '#141420', '#6366F1', true, 'sans', 'filled', 'inset', 'glow'),
  T('Broadsheet', false, '#F2ECDD', '#1A1712', '#F2ECDD', '#1A1712', false, 'serif', 'filled', 'underline', 'kicker'),
  T('Gallery', false, '#FCFCFA', '#1C1C1C', '#FFFFFF', '#1C1C1C', false, 'sans', 'outline', 'boxed', 'rule'),
  T('Acid', false, '#150B2E', '#CCFF00', '#1E0F3D', '#CCFF00', true, 'sans', 'pill', 'pill', 'glow'),
  T('Marker', false, '#FFFDF7', '#2B2B2B', '#FFFFFF', '#FF5C39', false, 'sans', 'filled', 'boxed', 'corner'),
  T('Terminal', false, '#020A02', '#33FF66', '#06140A', '#33FF66', true, 'mono', 'filled', 'boxed', 'scanline'),
  T('Noir', false, '#0E0E0E', '#E8DECE', '#1C1611', '#C8A050', true, 'serif', 'filled', 'underline', 'kicker'),
  T('Cotton', false, '#EAF2FB', '#3A4A5E', '#FFFFFF', '#6FA8FF', false, 'sans', 'pill', 'pill', 'none'),
  T('Bubblegum', false, '#FFE3F1', '#7A1346', '#FFFFFF', '#FF1E7A', false, 'sans', 'pill', 'pill', 'none'),
  T('Sunrise', false, '#FFF0E6', '#5B2E1E', '#FFFFFF', '#FF8A3D', false, 'serif', 'soft', 'inset', 'glow'),
  T('Mint', false, '#E8F6EF', '#1E4034', '#FFFFFF', '#2BB57A', false, 'sans', 'soft', 'inset', 'none'),
  T('Boardroom', false, '#08111F', '#E6ECF3', '#F0F4FA', '#2E6BE6', false, 'sans', 'filled', 'boxed', 'rule'),
  T('Fintech', false, '#F7F8FB', '#10131A', '#FFFFFF', '#4F46E5', false, 'sans', 'filled', 'boxed', 'none'),
];
export const ALL_AESTHETICS = THEMES.map(theme => theme.name);
export const themeFor = name => THEMES.find(theme => theme.name === name) || THEMES[0];

// ---- sanitizer (port of sanitizeOp / coerceBlockType) ------------------------------------------------
export function coerceBlockType(q) {
  if (q && typeof q === 'object' && !VALID_BLOCK_TYPES.includes(q.type)) return { ...q, type: 'short' };
  return q;
}

// Returns { clean, verdict: 'applied' | 'coerced' | 'rejected', notes: [] }.
// `clean` is exactly what the real sanitizeOp would return; verdict says whether it had to rewrite anything.
export function inspectOp(raw, isPro) {
  const reject = reason => ({ clean: null, verdict: 'rejected', notes: [reason] });
  if (!raw || typeof raw !== 'object' || typeof raw.op !== 'string') return reject('not an operation object');
  const notes = [];
  switch (raw.op) {
    case 'add_question': {
      if (!raw.question || typeof raw.question !== 'object') return reject('add_question has no question object');
      const question = coerceBlockType(raw.question);
      if (question !== raw.question) notes.push(`type "${raw.question.type}" does not exist, coerced to "short"`);
      return { clean: { op: 'add_question', question, afterId: typeof raw.afterId === 'number' ? raw.afterId : null }, verdict: notes.length ? 'coerced' : 'applied', notes };
    }
    case 'edit_question': {
      if (typeof raw.id !== 'number') return reject(`id must be a number, got ${typeof raw.id} "${raw.id}"`);
      if (!raw.changes || typeof raw.changes !== 'object') return reject('changes must be an object');
      const changes = { ...raw.changes };
      if ('type' in changes) {
        const probe = coerceBlockType({ type: changes.type });
        if (probe.type !== changes.type) notes.push(`type "${changes.type}" coerced to "short"`);
        changes.type = probe.type;
      }
      if ('id' in changes) { notes.push(`id is identity: stripped "id: ${changes.id}" from changes`); delete changes.id; }
      return { clean: { op: 'edit_question', id: raw.id, changes }, verdict: notes.length ? 'coerced' : 'applied', notes };
    }
    case 'remove_question':
      if (typeof raw.id !== 'number') return reject('remove_question needs a numeric id');
      return { clean: { op: 'remove_question', id: raw.id }, verdict: 'applied', notes };
    case 'reorder':
      if (!Array.isArray(raw.order) || !raw.order.every(n => typeof n === 'number')) return reject('order must be a list of numbers');
      return { clean: { op: 'reorder', order: raw.order }, verdict: 'applied', notes };
    case 'set_style': {
      const out = { op: 'set_style' };
      if (typeof raw.aesthetic === 'string') {
        out.aesthetic = !isPro && !FREE_AESTHETICS.includes(raw.aesthetic) ? 'Minimal' : raw.aesthetic;
        if (out.aesthetic !== raw.aesthetic) notes.push(`${raw.aesthetic} is a Pro aesthetic, clamped to Minimal on a Free plan`);
      }
      for (const [key, allowed] of [['surface', STYLE_SURFACES], ['typography', STYLE_TYPOGRAPHY], ['radius', STYLE_RADIUS]]) {
        if (typeof raw[key] === 'string') {
          if (allowed.includes(raw[key])) out[key] = raw[key];
          else notes.push(`${key} "${raw[key]}" is not on the allowed list, dropped`);
        }
      }
      if (!out.aesthetic && !out.surface && !out.typography && !out.radius) return reject('set_style carries nothing usable');
      return { clean: out, verdict: notes.length ? 'coerced' : 'applied', notes };
    }
    case 'set_title': {
      if (typeof raw.title !== 'string' || !raw.title.trim()) return reject('title must be a non-empty string');
      if (raw.title.length > 200) notes.push('title cut to 200 characters');
      return { clean: { op: 'set_title', title: raw.title.slice(0, 200) }, verdict: notes.length ? 'coerced' : 'applied', notes };
    }
    default:
      return reject(`unknown op "${raw.op}"`);
  }
}

// ---- the form --------------------------------------------------------------------------------------
export const initialForm = () => ({
  title: 'Workshop signup',
  style: { aesthetic: 'Minimal', surface: 'Card', typography: 'MD', radius: 'MD' },
  nextId: 6,
  questions: [
    { id: 1, type: 'short', label: 'Your name' },
    { id: 2, type: 'email', label: 'Email address' },
    { id: 3, type: 'multiple', label: 'Which session would you join?', options: ['Product decisions', 'Frontend craft', 'Shipping v1'] },
    { id: 4, type: 'short', label: 'Anything we should know about food?' },
    { id: 5, type: 'rating', label: 'How was the last event?' },
  ],
});

// Applies one sanitized op. Returns { form, id } where id is the question the op touched (if any).
function applyOp(form, op) {
  const questions = form.questions.map(q => ({ ...q }));
  switch (op.op) {
    case 'add_question': {
      const id = form.nextId;
      const created = { ...op.question, id };
      const at = op.afterId == null ? -1 : questions.findIndex(q => q.id === op.afterId);
      questions.splice(at < 0 ? questions.length : at + 1, 0, created);
      return { form: { ...form, questions, nextId: id + 1 }, id };
    }
    case 'edit_question': {
      const index = questions.findIndex(q => q.id === op.id);
      if (index < 0) return { form, id: null };
      questions[index] = { ...questions[index], ...op.changes, id: questions[index].id };
      return { form: { ...form, questions }, id: op.id };
    }
    case 'remove_question':
      return { form: { ...form, questions: questions.filter(q => q.id !== op.id) }, id: op.id };
    case 'reorder': {
      const rank = id => { const i = op.order.indexOf(id); return i < 0 ? op.order.length + questions.findIndex(q => q.id === id) : i; };
      return { form: { ...form, questions: questions.sort((a, b) => rank(a.id) - rank(b.id)) }, id: null };
    }
    case 'set_style': {
      const { op: _op, ...style } = op;
      return { form: { ...form, style: { ...form.style, ...style } }, id: null };
    }
    case 'set_title':
      return { form: { ...form, title: op.title }, id: null };
    default:
      return { form, id: null };
  }
}

// ---- layer 1: the router (keyword stand-in for the real gpt-4o-mini call) ---------------------------
const DESIGN_WORDS = /theme|look|style|dark|light|colou?r|font|aesthetic|mood|feel|surface|typograph|radius|rounded|title|heading|terminal|glass|cinematic|neon|retro|brutal|editorial|minimal|vogue|noir|mint|cotton|bubblegum|sunrise|fintech|gallery|acid|marker/i;
const ADD_WORDS = /\badd\b|new question|include|also ask|ask for|ask about|another question/i;
const EDIT_WORDS = /change|reword|remove|drop|delete|move|reorder|order|put|first|last|required|optional|dropdown|turn|rename|swap|replace|make .* (a|an|the)|retype/i;

export function classify(text) {
  const categories = [];
  if (DESIGN_WORDS.test(text)) categories.push('design');
  if (ADD_WORDS.test(text)) categories.push('add');
  if (EDIT_WORDS.test(text)) categories.push('edit');
  if (categories.length) return { categories, fallback: false };
  return { categories: ['design', 'add', 'edit'], fallback: true };
}

// Which master-prompt slices the executor receives, as in buildExecutorSystem / buildExecutorUserMessage.
export const slicesFor = categories => {
  const blocks = categories.includes('add') || categories.includes('edit');
  return [
    { id: 'blocks', label: 'Block types guide', sent: blocks },
    { id: 'design', label: 'Design system guide', sent: categories.includes('design') },
    { id: 'questions', label: 'The form’s questions', sent: blocks },
  ];
};

// ---- layer 2: scripted executor output ---------------------------------------------------------------
export const PRESETS = [
  {
    id: 'add', text: 'Add a phone number and an arrival date',
    ops: [
      { op: 'add_question', question: { type: 'phone', label: 'Phone number' }, afterId: 2 },
      { op: 'add_question', question: { type: 'datepicker', label: 'Arrival date' }, afterId: null },
      { op: 'add_question', afterId: 3 },
    ],
  },
  {
    id: 'edit', text: 'Make the food question a dropdown and ask it kindly',
    ops: [
      { op: 'edit_question', id: 4, changes: { id: 41, type: 'dropdown', label: 'Any dietary needs?', options: ['None', 'Vegetarian', 'Vegan', 'Allergy'] } },
      { op: 'edit_question', id: '3', changes: { label: 'Pick your session' } },
    ],
  },
  {
    id: 'design', text: 'Make it look like a late-night terminal',
    ops: [
      { op: 'set_style', aesthetic: 'Terminal', surface: 'Frame', radius: 'Huge' },
      { op: 'set_title', title: 'workshop --signup' },
    ],
  },
  {
    id: 'order', text: 'Drop the rating and put email first',
    ops: [
      { op: 'remove_question', id: 5 },
      { op: 'reorder', order: [2, 1, 3, 4] },
      { op: 'frobnicate', id: 2 },
    ],
  },
];

function proposalFor(text, categories) {
  const preset = id => PRESETS.find(p => p.id === id).ops.map(op => ({ ...op }));
  const ops = [];
  if (categories.includes('edit')) ops.push(...preset(/\b(remove|drop|delete|move|first|last|reorder|order)\b/i.test(text) ? 'order' : 'edit'));
  if (categories.includes('add')) ops.push(...preset('add'));
  if (categories.includes('design')) {
    const mentioned = ALL_AESTHETICS.find(name => new RegExp(name, 'i').test(text));
    const design = preset('design');
    if (mentioned) design[0].aesthetic = mentioned;
    ops.push(...design);
  }
  return ops;
}

// Runs the whole pipeline against `form`. Returns everything the page and the 3D stack need.
export function runPipeline(form, text, isPro) {
  const route = classify(text);
  const slices = slicesFor(route.categories);
  const proposed = route.fallback ? [] : proposalFor(text, route.categories);
  const inspected = proposed.map(raw => ({ raw, ...inspectOp(raw, isPro) }));
  let next = form, nextId = form.nextId;
  const events = [];
  const surviving = inspected.filter(item => item.clean);
  for (const item of inspected) {
    if (!item.clean) {
      const target = typeof item.raw.afterId === 'number' ? item.raw.afterId : typeof item.raw.id === 'number' ? item.raw.id : null;
      events.push({ kind: 'rejected', id: target, note: item.notes[0] });
      continue;
    }
    const before = next;
    const result = applyOp(next, item.clean);
    next = result.form;
    item.targetId = result.id;
    const kind = item.verdict;
    if (item.clean.op === 'edit_question' && result.id != null) {
      const was = before.questions.find(q => q.id === result.id);
      events.push({ kind: kind === 'coerced' ? 'coerced' : 'applied', id: result.id, note: item.notes[0] || '', retyped: was && was.type !== next.questions.find(q => q.id === result.id).type });
    } else if (item.clean.op === 'add_question') {
      events.push({ kind, id: result.id, note: item.notes[0] || '', coercedFrom: item.verdict === 'coerced' ? item.raw.question.type : null });
    } else events.push({ kind, id: result.id, note: item.notes[0] || '' });
  }
  const counts = { applied: 0, coerced: 0, rejected: 0 };
  inspected.forEach(item => { counts[item.verdict]++; });
  return { route, slices, proposed, inspected, form: next, events, counts, empty: surviving.length === 0, nextId };
}

export const questionTypeLabel = type => ({ short: 'Short text', long: 'Long text', email: 'Email', phone: 'Phone', multiple: 'Multiple choice', dropdown: 'Dropdown', yesno: 'Yes / no', rating: 'Rating', consent: 'Consent', upload: 'Upload', cover: 'Cover', section: 'Section' }[type] || type);
