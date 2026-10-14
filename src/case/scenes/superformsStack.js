import { themeFor, questionTypeLabel } from './superformsModel.js';

// A form as a stack of ceramic slabs. Every question slab carries a coral id stamp that never moves off it:
// blocks slide, flip and re-print around their stamp. Rejected ops bounce off; coerced types get a paper tag.
const W = 3.8, H = .66, D = 1.4, PITCH = .86;
const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));
const FONT = '"Manrope Variable", sans-serif';

function drawFace(ctx, w, h, block, theme) {
  const ink = theme.text, soft = theme.dark ? 'rgba(255,255,255,.55)' : 'rgba(48,49,46,.55)';
  if (block.title) {
    ctx.fillStyle = theme.dark ? theme.text : '#fffdf8';
    ctx.font = `600 64px ${FONT}`; ctx.textBaseline = 'middle';
    ctx.fillText(block.title.slice(0, 26), 70, h / 2 + 2);
    return;
  }
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = soft; ctx.font = `600 31px ${FONT}`;
  ctx.fillText(questionTypeLabel(block.type), 196, 66);
  ctx.fillStyle = ink; ctx.font = `620 52px ${FONT}`;
  let label = block.label || '';
  while (ctx.measureText(label).width > 560 && label.length > 4) label = label.slice(0, -2);
  ctx.fillText(label + (label !== block.label ? '…' : ''), 196, 124);
  ctx.strokeStyle = soft; ctx.fillStyle = soft; ctx.lineWidth = 7; ctx.lineCap = 'round';
  const x0 = 800, x1 = 980, y = h / 2 + 4;
  const bar = (a, b, yy) => { ctx.beginPath(); ctx.moveTo(a, yy); ctx.lineTo(b, yy); ctx.stroke(); };
  switch (block.type) {
    case 'long': bar(x0, x1, y - 26); bar(x0, x1, y); bar(x0, x0 + 110, y + 26); break;
    case 'multiple': for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x0 + 8, y - 28 + i * 28, 8, 0, 7); ctx.fill(); bar(x0 + 32, x1 - i * 24, y - 28 + i * 28); } break;
    case 'dropdown': bar(x0, x1, y); ctx.beginPath(); ctx.moveTo(x1 - 34, y - 20); ctx.lineTo(x1 - 22, y - 8); ctx.lineTo(x1 - 10, y - 20); ctx.stroke(); break;
    case 'yesno': ctx.beginPath(); ctx.roundRect(x0, y - 22, 80, 44, 22); ctx.stroke(); ctx.beginPath(); ctx.roundRect(x0 + 100, y - 22, 80, 44, 22); ctx.stroke(); break;
    case 'rating': for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x0 + 16 + i * 40, y, i < 4 ? 14 : 14, 0, 7); i < 4 ? ctx.fill() : ctx.stroke(); } break;
    case 'email': bar(x0, x1, y); ctx.font = `700 34px ${FONT}`; ctx.fillText('@', x0 + 4, y - 12); break;
    case 'phone': bar(x0 + 40, x1, y); ctx.fillRect(x0, y - 12, 22, 22); break;
    default: bar(x0, x1, y);
  }
}

export function createStack(api, { pace = 1, stagger = false } = {}) {
  const { THREE, root, materials, roundedBox, canvasTexture, interactive, palette } = api;
  const group = new THREE.Group(); root.add(group);
  const slabGeo = roundedBox(W, H, D, .1);
  const stampGeo = new THREE.CylinderGeometry(.24, .24, .08, 40);
  const discGeo = new THREE.CircleGeometry(.2, 40);
  const planeGeo = new THREE.PlaneGeometry(3.5, .6);
  const tagGeo = new THREE.PlaneGeometry(1.45, .36);
  const chipGeo = roundedBox(.6, .6, .36, .09);
  const rm = api.reducedMotion;
  const entries = new Map();
  const transients = [];
  let theme = themeFor('Minimal'), order = [], hoverId = null, selectedId = null;
  const ink = new THREE.Color(palette.ink), coral = new THREE.Color(palette.accent);
  const stampTexture = id => canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#fff'; ctx.font = `700 ${String(id).length > 2 ? 58 : 76}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(id), w / 2, h / 2 + 4);
  });
  const slabColor = (block, t) => block.title ? (t.dark ? new THREE.Color(t.card) : ink) : new THREE.Color(t.card);

  function make(block) {
    const g = new THREE.Group();
    const mat = materials.ceramic(slabColor(block, theme));
    const slab = new THREE.Mesh(slabGeo, mat); slab.castShadow = true; slab.receiveShadow = true;
    const holder = { block };
    const tex = canvasTexture(1024, 176, (ctx, w, h, b, t) => drawFace(ctx, w, h, b || holder.block, t || theme));
    const face = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
    face.position.set(.06, 0, D / 2 + .004);
    g.add(slab, face);
    let stamp = null, stampTex = null;
    if (!block.title) {
      stamp = new THREE.Group(); stamp.position.set(-1.52, 0, D / 2);
      const body = new THREE.Mesh(stampGeo, materials.accent()); body.rotation.x = Math.PI / 2; body.castShadow = true; body.position.z = .02;
      stampTex = stampTexture(block.id);
      const disc = new THREE.Mesh(discGeo, new THREE.MeshBasicMaterial({ map: stampTex, transparent: true, toneMapped: false })); disc.position.z = .066;
      stamp.add(body, disc); g.add(stamp);
    }
    g.userData.id = block.id;
    group.add(g); interactive.push(g);
    const entry = { id: block.id, g, slab, mat, face, tex, stamp, stampTex, block, y: 6, ty: 0, x: 0, tx: 0, s: .01, ts: 1, rot: 0, trot: 0, wob: 0, wobV: 0, nudge: 0, pulse: 0, delay: 0, travel: 1, out: false, hover: 0, color: mat.color.clone() };
    g.position.set(0, 6, 0); g.scale.setScalar(.01);
    entries.set(block.id, entry);
    return entry;
  }

  function release(entry) {
    group.remove(entry.g);
    const index = interactive.indexOf(entry.g); if (index >= 0) interactive.splice(index, 1);
    entry.mat.dispose(); entry.face.material.dispose(); entry.tex.dispose(); entry.stampTex?.dispose();
    entry.stamp?.traverse(o => o.material && !o.material.map && o.material.dispose());
    entries.delete(entry.id);
  }

  function slotY(id) { const i = order.indexOf(id); return i < 0 ? 0 : ((order.length - 1) / 2 - i) * PITCH; }

  function spawnChip(id, note) {
    const mat = materials.ink();
    const mesh = new THREE.Mesh(chipGeo, mat); mesh.castShadow = true;
    const tex = canvasTexture(128, 128, (ctx, w, h) => { ctx.strokeStyle = '#fff'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(34, 34); ctx.lineTo(94, 94); ctx.moveTo(94, 34); ctx.lineTo(34, 94); ctx.stroke(); });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(.46, .46), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })); face.position.z = .185;
    mesh.add(face); group.add(mesh);
    const y = entries.has(id) ? slotY(id) : 0;
    transients.push({ kind: 'chip', mesh, mat, tex, face, t: 0, y, id, hit: false });
  }

  function spawnTag(id, text) {
    const e = entries.get(id); if (!e) return;
    const tex = canvasTexture(512, 128, (ctx, w, h) => {
      ctx.fillStyle = '#fffdf8'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#b93c24'; ctx.font = `700 46px ${FONT}`; ctx.textBaseline = 'middle'; ctx.fillText(text, 26, h / 2 + 3);
    });
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false });
    const mesh = new THREE.Mesh(tagGeo, mat); mesh.position.set(W / 2 - .1, .46, D / 2 + .05); mesh.rotation.z = -.12; mesh.scale.setScalar(.01);
    e.g.add(mesh);
    transients.push({ kind: 'tag', mesh, mat, tex, t: 0, parent: e });
  }

  function sync(form, events = []) {
    const t = themeFor(form.style.aesthetic);
    const themeChanged = t !== theme; theme = t;
    const blocks = [{ id: 'title', title: form.title, type: 'cover' }, ...form.questions];
    order = blocks.map(b => b.id);
    const seen = new Set();
    for (const block of blocks) {
      seen.add(block.id);
      let e = entries.get(block.id);
      const fresh = !e;
      if (fresh) e = make(block);
      else if (e.out) { e.out = false; e.ts = 1; e.tx = 0; }
      const before = e.block;
      const changed = fresh || before.type !== block.type || before.label !== block.label || before.title !== block.title || themeChanged || before.options !== block.options;
      if (!fresh && before.type !== block.type) e.trot += Math.PI * 2;
      if (!fresh && (before.label !== block.label || before.title !== block.title)) e.pulse = 1;
      const nextY = slotY(block.id);
      if (!fresh && Math.abs(e.ty - nextY) > .1) { e.travel = 0; e.delay = stagger && !rm ? order.indexOf(block.id) * .045 : 0; }
      e.block = block; e.ty = nextY; e.ts = 1; e.tx = 0;
      if (fresh) { const i = order.indexOf(block.id); e.y = e.ty + (stagger ? 2.4 : 4.2); e.x = stagger ? (i % 2 ? -1.1 : 1.1) : 0; e.s = .01; e.delay = stagger && !rm ? i * .06 : 0; e.travel = 0; }
      if (rm) { e.y = e.ty; e.x = e.tx; e.s = e.ts; e.rot = e.trot; e.pulse = 0; }
      if (changed) { e.tex.redraw(block, theme); e.color.copy(slabColor(block, theme)); }
    }
    for (const e of entries.values()) if (!seen.has(e.id) && !e.out) { e.out = true; e.tx = 7; e.ts = .01; e.trot -= Math.PI; }
    for (const ev of rm ? [] : events) {
      if (ev.kind === 'rejected') spawnChip(typeof ev.id === 'number' && entries.has(ev.id) ? ev.id : order[Math.ceil(order.length / 2)], ev.note);
      else if (ev.id != null && entries.has(ev.id)) {
        const e = entries.get(ev.id);
        e.pulse = 1;
        if (ev.kind === 'coerced' && ev.coercedFrom) { e.wobV = 2.4; spawnTag(ev.id, `${ev.coercedFrom} → short`); }
        else if (ev.kind === 'coerced') { e.wobV = 1.8; spawnTag(ev.id, 'id kept'); }
      }
    }
    api.kick(2.6);
  }

  function setHover(id) { hoverId = id; }
  function select(id) { selectedId = id; const e = entries.get(id); if (e) e.pulse = 1; }

  function update(dt) {
    let busy = false;
    const k = rm ? 40 : 7 * pace;
    for (const e of [...entries.values()]) {
      if (e.delay > 0) { e.delay = Math.max(0, e.delay - dt); busy = true; continue; }
      e.travel = Math.min(1, e.travel + dt * pace / .85);
      e.y = damp(e.y, e.ty, k * .85, dt); e.x = damp(e.x, e.tx, k * .8, dt); e.s = damp(e.s, e.ts, k, dt);
      e.rot = damp(e.rot, e.trot, rm ? 40 : 5.2 * pace, dt);
      e.hover = damp(e.hover, hoverId === e.id || selectedId === e.id ? 1 : 0, 12, dt);
      e.wobV += -e.wob * 60 * dt; e.wobV *= Math.exp(-5 * dt); e.wob += e.wobV * dt;
      e.nudge = damp(e.nudge, 0, 8, dt);
      e.pulse = Math.max(0, e.pulse - dt * 1.6);
      e.g.position.set(e.x + e.hover * .22 - e.nudge, e.y, rm ? 0 : Math.sin(e.travel * Math.PI) * .48);
      e.g.rotation.set(e.rot, e.hover * -.04, e.wob * .08);
      e.g.scale.setScalar(Math.max(.01, e.s));
      e.mat.color.lerp(e.color, 1 - Math.exp(-8 * dt));
      if (e.stamp) { const p = e.pulse; e.stamp.position.z = D / 2 + p * .28; e.stamp.scale.setScalar(1 + p * .22); }
      if (e.out && e.s < .03) release(e);
      else if (e.travel < 1 || Math.abs(e.y - e.ty) > .002 || Math.abs(e.x - e.tx) > .002 || Math.abs(e.s - e.ts) > .002 || Math.abs(e.rot - e.trot) > .002 || e.pulse > 0 || Math.abs(e.wob) > .002 || Math.abs(e.wobV) > .01 || Math.abs(e.hover - (hoverId === e.id || selectedId === e.id ? 1 : 0)) > .002 || e.mat.color.getHex() !== e.color.getHex()) busy = true;
    }
    for (let i = transients.length - 1; i >= 0; i--) {
      const tr = transients[i]; tr.t += dt; busy = true;
      if (tr.kind === 'chip') {
        const a = Math.min(tr.t / .55, 1), b = Math.max(0, (tr.t - .55) / .75);
        const x = tr.t < .55 ? 7 + (2.5 - 7) * (a * a) : 2.5 + (7.5 - 2.5) * (1 - (1 - Math.min(b, 1)) ** 3);
        tr.mesh.position.set(x, tr.y + Math.sin(Math.min(b, 1) * Math.PI) * .9, .1);
        tr.mesh.rotation.z = tr.t < .55 ? 0 : b * 7;
        if (tr.t >= .55 && !tr.hit) { tr.hit = true; const e = entries.get(tr.id); if (e) { e.nudge = .34; e.wobV = -1.6; } }
        tr.mesh.scale.setScalar(tr.t > 1.15 ? Math.max(.01, 1 - (tr.t - 1.15) * 4) : 1);
        if (tr.t > 1.4) { group.remove(tr.mesh); tr.mat.dispose(); tr.tex.dispose(); tr.face.material.dispose(); tr.face.geometry.dispose(); transients.splice(i, 1); }
      } else {
        const grow = Math.min(tr.t / .3, 1), shrink = tr.t > 3.3 ? Math.max(0, 1 - (tr.t - 3.3) * 4) : 1;
        tr.mesh.scale.setScalar(Math.max(.01, (1 - (1 - grow) ** 3) * shrink));
        if (tr.t > 3.7) { tr.parent.g.remove(tr.mesh); tr.mat.dispose(); tr.tex.dispose(); transients.splice(i, 1); }
      }
    }
    return busy;
  }

  const idOf = obj => { while (obj && obj.userData.id === undefined) obj = obj.parent; return obj?.userData.id; };
  return { group, sync, update, setHover, select, idOf, dispose() { entries.forEach(e => e.mat.dispose()); }, count: () => order.length };
}
