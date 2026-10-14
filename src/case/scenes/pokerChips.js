// Ceramic poker chips: LatheGeometry body with a bevelled rim, six edge inserts, a canvas-printed face.
// Colours are the real denominations from Poker Gods (src/components/Chip.tsx, TIER_STYLE).
export const TIERS = [1, 5, 10, 25, 100, 500, 1000];
export const TIER_STYLE = {
  1: { base: '#e6e1d2', spot: '#46535a', ink: '#2c383e' },
  5: { base: '#c13b2a', spot: '#f2ecde', ink: '#fbf4e8' },
  10: { base: '#2f64a8', spot: '#f2ecde', ink: '#f3f6fb' },
  25: { base: '#1f8450', spot: '#f2ecde', ink: '#effaf3' },
  100: { base: '#1c201e', spot: '#d9b45c', ink: '#e6cf8f' },
  500: { base: '#69409b', spot: '#f2ecde', ink: '#f6f0fb' },
  1000: { base: '#b78a22', spot: '#f6eed2', ink: '#2a1f08' },
};
export const R = .4, H = .095;

// Greedy split into the fewest chips, biggest at the bottom (same idea as Chip.tsx).
export function breakDown(amount) {
  const chips = [];
  let left = Math.max(0, Math.round(amount));
  for (const tier of [...TIERS].reverse()) while (left >= tier) { chips.push(tier); left -= tier; }
  return chips;
}

// Where each chip of an amount sits: columns of at most `perColumn`, centred on (x, z).
export function stackTargets(amount, x, z, { group = 0, perColumn = 7, spread = .86 } = {}) {
  const chips = breakDown(amount);
  const columns = Math.max(1, Math.ceil(chips.length / perColumn));
  return chips.map((tier, i) => {
    const column = Math.floor(i / perColumn), level = i % perColumn;
    return { tier, x: x + (column - (columns - 1) / 2) * spread, y: H * (level + .5), z, group, key: i };
  });
}

export function createChips(api, { capacity = 56, parent } = {}) {
  const { THREE } = api;
  const group = new THREE.Group();
  (parent || api.root).add(group);

  const profile = [[0, H / 2], [R - .075, H / 2], [R - .045, H / 2 - .003], [R - .012, H / 2 - .02], [R, H / 2 - .04], [R, -H / 2 + .04], [R - .012, -H / 2 + .02], [R - .045, -H / 2 + .003], [R - .075, -H / 2], [0, -H / 2]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const bodyGeo = new THREE.LatheGeometry(profile, 44);
  const faceGeo = new THREE.CircleGeometry(R - .06, 40); faceGeo.rotateX(-Math.PI / 2);
  const insertGeo = api.roundedBox(.19, H * .62, .05, .014, 2);

  const dummy = new THREE.Object3D(), local = new THREE.Object3D(), full = new THREE.Matrix4();
  const sets = {};
  for (const tier of TIERS) {
    const style = TIER_STYLE[tier];
    const body = new THREE.InstancedMesh(bodyGeo, new THREE.MeshPhysicalMaterial({ color: style.base, roughness: .5, clearcoat: .35, clearcoatRoughness: .4 }), capacity);
    const inserts = new THREE.InstancedMesh(insertGeo, new THREE.MeshPhysicalMaterial({ color: style.spot, roughness: .55, clearcoat: .2 }), capacity * 6);
    const texture = api.canvasTexture(256, 256, (ctx, w, h) => drawFace(ctx, w, h, tier, style));
    const face = new THREE.InstancedMesh(faceGeo, new THREE.MeshPhysicalMaterial({ map: texture, roughness: .5, clearcoat: .3, clearcoatRoughness: .4 }), capacity);
    for (const mesh of [body, inserts, face]) { mesh.frustumCulled = false; mesh.count = 0; group.add(mesh); }
    body.castShadow = true; body.receiveShadow = true; inserts.castShadow = true; face.receiveShadow = true;
    sets[tier] = {
      body, inserts, face,
      tokens: Array.from({ length: capacity }, (_, i) => ({
        i, active: false, pos: new THREE.Vector3(), start: new THREE.Vector3(), end: new THREE.Vector3(), t: 1, delay: 0, speed: 1.25,
        scale: 0, scaleStart: 0, scaleEnd: 0, yaw: ((i * 2.399) % 6.283), group: 0, arc: 1,
      })),
      used: 0,
    };
  }

  const lifts = new Map(); // group id -> { value, target }
  const ease = t => 1 - Math.pow(1 - t, 3);

  function drawFace(ctx, w, h, tier, style) {
    const c = w / 2;
    ctx.fillStyle = style.base; ctx.beginPath(); ctx.arc(c, c, c, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = style.spot;
    for (let i = 0; i < 24; i++) {
      ctx.save(); ctx.translate(c, c); ctx.rotate(i / 24 * Math.PI * 2);
      ctx.fillRect(-w * .022, -c * .97, w * .044, c * .13);
      ctx.restore();
    }
    ctx.lineWidth = w * .016; ctx.strokeStyle = style.spot;
    ctx.beginPath(); ctx.arc(c, c, c * .66, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.arc(c, c, c * .6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = style.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const label = String(tier), size = label.length > 3 ? w * .25 : label.length > 2 ? w * .3 : w * .38;
    ctx.font = `700 ${size}px "Manrope Variable"`;
    ctx.fillText(label, c, c + w * .015);
  }

  const insertAngles = Array.from({ length: 6 }, (_, k) => k / 6 * Math.PI * 2 + Math.PI / 6);

  function writeToken(tier, token) {
    const set = sets[tier], lift = (lifts.get(token.group)?.value || 0);
    dummy.position.set(token.pos.x, token.pos.y + lift, token.pos.z);
    dummy.rotation.set(0, token.yaw, 0);
    dummy.scale.setScalar(Math.max(token.scale, 1e-4));
    dummy.updateMatrix();
    set.body.setMatrixAt(token.i, dummy.matrix);
    local.position.set(0, H / 2 + .0016, 0); local.rotation.set(0, 0, 0); local.scale.setScalar(1); local.updateMatrix();
    full.multiplyMatrices(dummy.matrix, local.matrix);
    set.face.setMatrixAt(token.i, full);
    for (let k = 0; k < 6; k++) {
      const a = insertAngles[k];
      local.position.set(Math.cos(a) * (R - .018), 0, Math.sin(a) * (R - .018));
      local.rotation.set(0, Math.PI / 2 - a, 0); local.updateMatrix();
      full.multiplyMatrices(dummy.matrix, local.matrix);
      set.inserts.setMatrixAt(token.i * 6 + k, full);
    }
  }

  function flush(tier) {
    const set = sets[tier];
    set.body.count = set.used; set.face.count = set.used; set.inserts.count = set.used * 6;
    set.body.instanceMatrix.needsUpdate = true; set.face.instanceMatrix.needsUpdate = true; set.inserts.instanceMatrix.needsUpdate = true;
  }

  // targets: [{ tier, x, y, z, group, from?: {x,y,z} }]. Chips already on the table fly to the nearest target
  // of their own denomination; new ones are lifted from `from`, spare ones shrink away.
  function retarget(targets, { stagger = .03, speed = 1.25 } = {}) {
    for (const tier of TIERS) {
      const set = sets[tier], wanted = targets.filter(t => t.tier === tier).slice(0, capacity);
      const free = set.tokens.filter(token => !token.active || token.scaleEnd === 0);
      const live = set.tokens.filter(token => token.active && token.scaleEnd !== 0);
      const taken = new Set();
      wanted.forEach((target, order) => {
        let best = null, bestDistance = Infinity;
        for (const token of live) {
          if (taken.has(token)) continue;
          const d = (token.pos.x - target.x) ** 2 + (token.pos.z - target.z) ** 2 + (token.pos.y - target.y) ** 2;
          if (d < bestDistance) { best = token; bestDistance = d; }
        }
        let token = best;
        if (token) taken.add(token);
        else {
          token = free.find(candidate => !taken.has(candidate)) || set.tokens.find(candidate => !taken.has(candidate));
          taken.add(token);
          const from = target.from || { x: target.x, y: target.y + .5, z: target.z };
          token.pos.set(from.x, from.y, from.z); token.scale = 0; token.active = true;
          set.used = Math.max(set.used, token.i + 1);
        }
        token.start.copy(token.pos); token.end.set(target.x, target.y, target.z);
        token.scaleStart = token.scale; token.scaleEnd = 1; token.group = target.group || 0;
        token.t = 0; token.delay = Math.min(order * stagger, .5); token.speed = speed;
        token.arc = Math.hypot(target.x - token.pos.x, target.z - token.pos.z) > .2 ? 1 : .15;
      });
      for (const token of live) if (!taken.has(token)) {
        token.start.copy(token.pos); token.end.copy(token.pos); token.scaleStart = token.scale; token.scaleEnd = 0; token.t = 0; token.delay = 0; token.speed = 2.2; token.arc = 0;
      }
    }
    api.kick(1.6);
  }

  function setLift(groupId, value) {
    const entry = lifts.get(groupId) || { value: 0, target: 0 };
    entry.target = value; lifts.set(groupId, entry); api.kick(.6);
  }

  function update(dt) {
    let busy = false;
    for (const [, entry] of lifts) {
      if (entry.value === entry.target) continue;
      entry.value += (entry.target - entry.value) * (1 - Math.exp(-14 * dt));
      if (Math.abs(entry.value - entry.target) < .002) entry.value = entry.target;
      busy = true;
    }
    const anyLift = [...lifts.values()].some(entry => entry.value !== 0 || entry.target !== 0);
    for (const tier of TIERS) {
      const set = sets[tier];
      let touched = false;
      for (let n = 0; n < set.used; n++) {
        const token = set.tokens[n];
        if (!token.active) continue;
        const moving = token.t < 1;
        if (moving) {
          token.delay -= dt;
          if (token.delay <= 0) {
            token.t = Math.min(1, token.t + dt * token.speed);
            const e = ease(token.t);
            token.pos.lerpVectors(token.start, token.end, e);
            token.pos.y += Math.sin(Math.PI * e) * .9 * token.arc;
            token.scale = token.scaleStart + (token.scaleEnd - token.scaleStart) * Math.min(1, e * 1.4);
            if (token.t >= 1 && token.scaleEnd === 0) token.active = false;
          }
          busy = true;
        }
        if (moving || anyLift) { writeToken(tier, token); touched = true; }
      }
      if (touched) flush(tier);
    }
    return busy;
  }

  // Everything resting at its target immediately (reduced motion, first frame).
  function settle() {
    for (const tier of TIERS) {
      const set = sets[tier];
      for (let n = 0; n < set.used; n++) {
        const token = set.tokens[n];
        if (!token.active) continue;
        token.t = 1; token.delay = 0; token.pos.copy(token.end); token.scale = token.scaleEnd;
        if (token.scaleEnd === 0) token.active = false;
        writeToken(tier, token);
      }
      flush(tier);
    }
    api.invalidate();
  }

  return { group, retarget, setLift, update, settle };
}
