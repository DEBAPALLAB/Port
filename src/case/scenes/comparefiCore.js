import { criteria, scenePayload } from './comparefiData.js';

// A row of ceramic slabs, one per lender (sample values). Heights are the chosen criterion, drawn from zero.
// A green sheet sits at the best value. A slab above it carries dark "excess" on top; a slab below it
// carries a pale "gap" up to the sheet. Choosing a criterion makes every slab settle and re-sort.
export const stageOptions = {
  frame: 4.1, target: [0, 1.35, 0], height: 1.3, fov: 28,
  yaw: [-.75, .75], pitch: [.04, .5], startYaw: -.42, startPitch: .26, floor: -.22, shadow: .17,
};

const GREEN = 0x1f5e3c, DEEP = 0x124434, LIME = 0xb1ed67;
const SLOT = 1.6, W = 1.16, D = 1.16, MAXH = 3.15, SLAB_Z = -.32;

export function build(api, { auto = false } = {}) {
  const { THREE, root, materials, roundedBox, interactive, canvasTexture, palette, emit, kick, reducedMotion } = api;
  const damp = (a, b, k, dt) => reducedMotion ? b : a + (b - a) * (1 - Math.exp(-k * dt));

  const plinth = new THREE.Mesh(roundedBox(7.1, .2, 3.2, .07), materials.ceramic(palette.stone));
  plinth.position.y = -.1; plinth.receiveShadow = true; root.add(plinth);

  const unit = roundedBox(W, 1, D, .07);
  const gapMat = new THREE.MeshStandardMaterial({ color: LIME, transparent: true, opacity: .5, roughness: .6, depthWrite: false });
  const capMat = materials.accent(LIME);
  const sheetMat = new THREE.MeshStandardMaterial({ color: GREEN, transparent: true, opacity: .26, roughness: .7, depthWrite: false });
  const edgeMat = materials.accent(GREEN);
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(7.0, .03, 2.3), sheetMat);
  sheet.position.z = SLAB_Z; sheet.renderOrder = 5; root.add(sheet);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(7.0, .045, .04), edgeMat);
  edge.position.set(0, 0, SLAB_Z + 1.15); edge.castShadow = true; root.add(edge);

  const slabs = new Map();
  const makeSlab = key => {
    const group = new THREE.Group(); group.userData.key = key;
    const base = new THREE.Mesh(unit, materials.ceramic(0xdcd6c8)); base.castShadow = true; base.receiveShadow = true;
    const over = new THREE.Mesh(unit, materials.ink(DEEP)); over.castShadow = true;
    const gap = new THREE.Mesh(unit, gapMat); gap.scale.set(.94, 1, .94); gap.renderOrder = 4;
    const cap = new THREE.Mesh(roundedBox(W + .02, .07, D + .02, .03), capMat); cap.castShadow = true;
    const tileBase = new THREE.Mesh(roundedBox(W + .1, .06, .84, .025), materials.paper(0xfffdf8)); tileBase.receiveShadow = true;
    const texture = canvasTexture(512, 330, (ctx, w, h, letter = '', text = '', best = false) => {
      ctx.fillStyle = '#fffdf8'; ctx.fillRect(0, 0, w, h);
      if (best) { ctx.fillStyle = '#b1ed67'; ctx.fillRect(0, 0, w, 34); }
      ctx.fillStyle = '#30312e'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      ctx.font = '700 104px "Manrope Variable"'; ctx.fillText(letter, 40, 140);
      ctx.textAlign = 'center'; ctx.font = '700 118px "Manrope Variable"'; ctx.fillText(text, w / 2, 280);
    });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(W, .74), new THREE.MeshStandardMaterial({ map: texture, roughness: .9 }));
    face.rotation.x = -Math.PI / 2; face.position.set(0, .036, 0);
    tileBase.add(face);
    group.add(base, over, gap, cap);
    root.add(group, tileBase);
    group.userData.tile = tileBase;
    interactive.push(group);
    group.userData.onPick = () => { emit('pick', { key }); if (auto) manual(); };
    const slab = { key, group, base, over, gap, cap, texture, tileBase, v: 0, x: 0, lift: 0, liftTarget: 0, targetX: 0, targetV: 0, active: false, best: false, tileText: '' };
    slabs.set(key, slab);
    return slab;
  };

  let payload = null, plane = 0, planeTarget = 0, scale = 1, focusKey = null, firstSet = true;

  function apply(next) {
    payload = next;
    const max = Math.max(...next.items.map(item => item.value));
    scale = MAXH / max;
    planeTarget = next.plane * scale;
    const count = next.items.length;
    const used = new Set();
    next.items.forEach((item, index) => {
      const slab = slabs.get(item.key) || makeSlab(item.key);
      used.add(item.key);
      slab.targetX = (index - (count - 1) / 2) * SLOT;
      slab.targetV = item.value * scale;
      slab.best = index === 0;
      if (!slab.active || firstSet) { slab.x = slab.targetX; if (firstSet) slab.v = slab.targetV; }
      slab.active = true;
      slab.group.visible = slab.tileBase.visible = true;
      slab.texture.redraw(item.label, item.text, slab.best);
    });
    slabs.forEach((slab, key) => { if (!used.has(key)) { slab.active = false; slab.targetV = 0; slab.group.visible = slab.tileBase.visible = false; } });
    if (firstSet) plane = planeTarget;
    firstSet = false;
    kick(1.6);
  }

  let cycle = 0;
  const loanCriteria = criteria.las;
  const startAuto = () => { cycle = 0; apply(scenePayload('las', loanCriteria[0].id)); emit('criterion', { label: loanCriteria[0].label, rule: loanCriteria[0].rule }); };
  if (auto) startAuto();
  else apply(scenePayload('las', 'y1'));
  let nextAt = 5;
  const advance = () => {
    cycle = (cycle + 1) % loanCriteria.length;
    const c = loanCriteria[cycle];
    apply(scenePayload('las', c.id));
    emit('criterion', { label: c.label, rule: c.rule });
  };

  function manual() { advance(); nextAt = api.state.time + 9; }
  const SHEET_LIFT = .02;
  emit('ready');
  return {
    update(dt, state) {
      if (auto && !reducedMotion && state.visible && state.time > nextAt && !state.dragging) { nextAt = state.time + 5.2; advance(); }
      let busy = false;
      const dv = damp(plane, planeTarget, 5, dt);
      busy = busy || Math.abs(dv - planeTarget) > .002; plane = dv;
      sheet.position.y = plane + .015 + SHEET_LIFT; edge.position.y = plane + .03;
      slabs.forEach(slab => {
        const nv = damp(slab.v, slab.targetV, 5.5, dt), nx = damp(slab.x, slab.targetX, 5, dt);
        slab.lift = damp(slab.lift, slab.liftTarget, 12, dt);
        if (Math.abs(nv - slab.targetV) > .002 || Math.abs(nx - slab.targetX) > .002 || Math.abs(slab.lift - slab.liftTarget) > .002) busy = true;
        slab.v = nv; slab.x = nx;
        const baseH = Math.max(.001, Math.min(slab.v, plane)), overH = Math.max(0, slab.v - plane), gapH = Math.max(0, plane - slab.v);
        slab.group.position.set(slab.x, slab.lift, SLAB_Z);
        slab.tileBase.position.set(slab.x, .2, SLAB_Z + 1.2); slab.tileBase.rotation.x = .62;
        slab.base.scale.y = baseH; slab.base.position.y = baseH / 2;
        slab.over.visible = overH > .02; slab.over.scale.y = Math.max(.001, overH); slab.over.position.y = plane + overH / 2 + SHEET_LIFT * 2;
        slab.gap.visible = gapH > .02 && slab.active; slab.gap.scale.y = Math.max(.001, gapH); slab.gap.position.y = slab.v + gapH / 2;
        slab.cap.visible = slab.best && slab.active; slab.cap.position.y = slab.v + .035;
      });
      return busy;
    },
    on(name, data) {
      if (name === 'set') { apply(data); }
      if (name === 'focus') { focusKey = data?.key ?? null; slabs.forEach(slab => { slab.liftTarget = slab.key === focusKey ? .16 : 0; }); }
    },
    hover(object, previous) {
      if (previous) slabs.get(previous.userData.key).liftTarget = previous.userData.key === focusKey ? .16 : 0;
      if (object) slabs.get(object.userData.key).liftTarget = .22;
      emit('hover', { key: object?.userData.key ?? null });
    },
    pick() { if (auto) manual(); },
    dispose() {},
  };
}
