import { AGENTS, MAX_STEPS, DEFAULTS, buildGraph, layout, statuses } from './notaprompt-sim.js';

// A ceramic plate holds forty-eight agents. An idea (a coral flag) is planted in one of them
// and travels along the links. The same scene runs the hero demo and the signature simulator.
export const options = {
  frame: 4.0, fov: 28, height: 0, yaw: [-.9, .9], pitch: [.25, 1.05], startYaw: -.28, startPitch: .78,
  floor: -.62, shadow: .17, exposure: 1.02,
};

const PLATE = 4.4, FLAT = 3.98, RING = 3.0;
const UNAWARE = 0x8896a8, ADOPTED = 0xed5939, RESISTING = 0x30312e, EDGE = 0xc9c4b8;
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

export default function setup(api) {
  const { THREE, root, materials, palette, reducedMotion } = api;
  const dummy = new THREE.Object3D();
  const pos = layout(RING);
  let graph = buildGraph(DEFAULTS.shortcuts);

  // The plate: a lathed dish with a raised rim.
  const profile = [[0, -.3], [3.3, -.3], [3.95, -.22], [4.3, -.04], [4.4, .1], [4.33, .15], [4.18, .08], [FLAT, 0], [0, 0]].map(([x, y]) => new THREE.Vector2(x, y));
  const plate = new THREE.Mesh(new THREE.LatheGeometry(profile, 96), materials.ceramic(0xe9e4da));
  plate.material.side = THREE.DoubleSide;
  plate.castShadow = true; plate.receiveShadow = true;
  root.add(plate);

  // Step dial printed on the plate; the current step is coral.
  const dialTexture = api.canvasTexture(1024, 1024, (ctx, w, h, step = 0) => {
    const c = w / 2, start = Math.PI * .75, span = Math.PI * 1.5;
    for (let s = 0; s <= MAX_STEPS; s++) {
      const angle = start + span * (s / MAX_STEPS), cos = Math.cos(angle), sin = Math.sin(angle);
      const long = s % 4 === 0, now = s === step;
      ctx.strokeStyle = now ? '#ed5939' : s < step ? '#30312e' : '#b9b4a8';
      ctx.lineWidth = now ? 12 : long ? 7 : 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(c + cos * (long || now ? 478 : 488), c + sin * (long || now ? 478 : 488)); ctx.lineTo(c + cos * 506, c + sin * 506); ctx.stroke();
      if (long) {
        ctx.fillStyle = now ? '#b93c24' : '#6b6a64'; ctx.font = '600 34px "Manrope Variable"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(s), c + cos * 446, c + sin * 446);
      }
    }
  });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(FLAT, 96), new THREE.MeshStandardMaterial({ map: dialTexture, transparent: true, roughness: .8, polygonOffset: true, polygonOffsetFactor: -2 }));
  dial.rotation.x = -Math.PI / 2; dial.position.y = .004; dial.receiveShadow = true;
  root.add(dial);

  // Agents.
  const sphere = new THREE.SphereGeometry(1, 28, 18);
  const agentMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .34, clearcoat: .55, clearcoatRoughness: .25 });
  const agents = new THREE.InstancedMesh(sphere, agentMaterial, AGENTS);
  agents.castShadow = true; agents.receiveShadow = true;
  agents.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  root.add(agents);
  api.interactive.push(agents);
  const colorNow = Array.from({ length: AGENTS }, () => new THREE.Color(UNAWARE));
  const colorTo = Array.from({ length: AGENTS }, () => new THREE.Color(UNAWARE));
  const lift = new Float32Array(AGENTS), liftTo = new Float32Array(AGENTS), pulse = new Float32Array(AGENTS), hoverK = new Float32Array(AGENTS);
  const radius = i => .085 + .1 * graph.traits[i].influence;
  const nodeTop = i => [pos[i][0], pos[i][1]];

  // Links: near ones are instanced rods, long shortcuts are arches.
  const rodGeometry = new THREE.CylinderGeometry(1, 1, 1, 8, 1);
  const rodMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .6 });
  const rods = new THREE.InstancedMesh(rodGeometry, rodMaterial, 160);
  rods.instanceMatrix.setUsage(THREE.DynamicDrawUsage); rods.castShadow = true; rods.frustumCulled = false;
  root.add(rods);
  const archGroup = new THREE.Group(); root.add(archGroup);
  const archMaterials = { rest: new THREE.MeshStandardMaterial({ color: EDGE, roughness: .6 }), lit: new THREE.MeshStandardMaterial({ color: ADOPTED, roughness: .45 }) };
  let rodList = [], archList = [], litEdge = new Set();
  const edgeKey = (a, b) => (a < b ? a * 100 + b : b * 100 + a);
  const EDGE_Y = .2;
  const p3 = i => new THREE.Vector3(pos[i][0], EDGE_Y, pos[i][1]);

  function buildLinks() {
    archList.forEach(item => { item.mesh.geometry.dispose(); archGroup.remove(item.mesh); });
    rodList = []; archList = [];
    for (const [a, b] of graph.edges) {
      const gap = Math.min((a - b + AGENTS) % AGENTS, (b - a + AGENTS) % AGENTS);
      if (gap <= 2) rodList.push([a, b]);
      else {
        const from = p3(a), to = p3(b), mid = from.clone().add(to).multiplyScalar(.5);
        mid.multiplyScalar(.55); mid.y = .9 + gap * .06;
        const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
        const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, .022, 6), archMaterials.rest);
        mesh.castShadow = true; archGroup.add(mesh); archList.push({ a, b, mesh });
      }
    }
    rods.count = rodList.length;
    const up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion();
    rodList.forEach(([a, b], index) => {
      const from = p3(a), to = p3(b), dir = to.clone().sub(from), len = dir.length();
      q.setFromUnitVectors(up, dir.normalize());
      rods.userData[index] = { pos: from.add(to).multiplyScalar(.5), q: q.clone(), len };
    });
    paintLinks(true);
  }
  function paintLinks(force) {
    const c = new THREE.Color();
    rodList.forEach(([a, b], index) => {
      const lit = litEdge.has(edgeKey(a, b)), d = rods.userData[index];
      dummy.position.copy(d.pos); dummy.quaternion.copy(d.q);
      const r = lit ? .034 : .017; dummy.scale.set(r, d.len, r); dummy.updateMatrix();
      rods.setMatrixAt(index, dummy.matrix);
      rods.setColorAt(index, c.set(lit ? ADOPTED : EDGE));
    });
    rods.instanceMatrix.needsUpdate = true; if (rods.instanceColor) rods.instanceColor.needsUpdate = true;
    archList.forEach(item => { item.mesh.material = litEdge.has(edgeKey(item.a, item.b)) ? archMaterials.lit : archMaterials.rest; });
    if (!force) api.invalidate();
  }

  // The idea: an ink pole with a coral flag, planted in the seed agent.
  const flag = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1.15, 10), materials.ink());
  pole.position.y = .575; pole.castShadow = true;
  const cloth = new THREE.Mesh(api.roundedBox(.5, .3, .04, .04), materials.accent());
  cloth.position.set(.25, 1.0, 0); cloth.castShadow = true;
  flag.add(pole, cloth); root.add(flag);
  const flagTo = new THREE.Vector3(), flagAt = new THREE.Vector3();
  let wave = 0;

  // State from outside (or from the hero demo).
  const model = { step: 0, seed: 17, status: new Int8Array(AGENTS), parent: new Int16Array(AGENTS).fill(-1), adopted: new Int8Array(AGENTS).fill(-1) };
  let colorsDirty = true, hovered = -1, auto = !reducedMotion, autoClock = 0, announced = false, hoverEmitted = -2;

  function apply({ status, parent, adopted, step, seed }) {
    const fresh = [];
    status.forEach((value, i) => { if (value === 1 && model.status[i] !== 1 && i !== seed) fresh.push(i); });
    model.status = Int8Array.from(status); model.parent = Int16Array.from(parent); model.adopted = Int8Array.from(adopted);
    const seedMoved = model.seed !== seed; model.seed = seed;
    const stepped = model.step !== step; model.step = step;
    for (let i = 0; i < AGENTS; i++) {
      const s = model.status[i];
      colorTo[i].set(s === 1 ? ADOPTED : s === 2 ? RESISTING : UNAWARE);
      liftTo[i] = s === 1 ? .1 : 0;
      if (api.reducedMotion) { colorNow[i].copy(colorTo[i]); lift[i] = liftTo[i]; }
    }
    fresh.forEach(i => { pulse[i] = 1; });
    litEdge = new Set();
    for (let i = 0; i < AGENTS; i++) if (model.parent[i] >= 0 && model.adopted[i] >= 0 && model.adopted[i] <= step) litEdge.add(edgeKey(i, model.parent[i]));
    paintLinks();
    if (stepped) dialTexture.redraw(step);
    const [x, z] = nodeTop(seed);
    flagTo.set(x, radius(seed) * 1.7, z);
    if (seedMoved && !api.reducedMotion) { wave = 1; } else if (api.reducedMotion) flagAt.copy(flagTo);
    colorsDirty = true; api.kick(1.6);
  }

  function demo(step) {
    const params = { conformity: DEFAULTS.conformity, influence: DEFAULTS.influence };
    const { status, run } = statuses(graph, params, 17, step);
    apply({ status, parent: run.parent, adopted: run.adopted, step, seed: 17 });
  }
  { const [x, z] = nodeTop(17); flagAt.set(x, radius(17) * 1.7, z); flagTo.copy(flagAt); }
  buildLinks();
  demo(reducedMotion ? 9 : 0);

  const ray = new THREE.Raycaster();
  function agentAt() {
    ray.setFromCamera(api.state.pointer, api.camera);
    const hit = ray.intersectObject(agents, false)[0];
    return hit ? hit.instanceId : -1;
  }

  return {
    update(dt, state) {
      let busy = false;
      if (auto && state.visible) {
        autoClock += dt;
        const stepNow = Math.min(11, Math.floor(autoClock / .8));
        const cycle = 11 * .8 + 2.6;
        if (autoClock >= cycle) autoClock = 0;
        if (stepNow !== model.step && autoClock < cycle) demo(stepNow);
        busy = true;
      }
      if (!announced) { announced = true; api.emit('ready'); }
      if (state.pointerInside && !state.dragging && !auto) {
        const id = agentAt();
        if (id !== hovered) { hovered = id; }
      } else if (!state.pointerInside && hovered !== -1) hovered = -1;
      if (hovered !== hoverEmitted) { hoverEmitted = hovered; api.emit('hover', hovered); api.setCursor(hovered >= 0 ? 'pointer' : 'grab'); }

      wave = Math.max(0, wave - dt * 1.4);
      const kk = reducedMotion ? 40 : 9;
      flagAt.x = damp(flagAt.x, flagTo.x, kk, dt); flagAt.z = damp(flagAt.z, flagTo.z, kk, dt); flagAt.y = damp(flagAt.y, flagTo.y, kk, dt);
      flag.position.set(flagAt.x, 0, flagAt.z);
      flag.rotation.y = Math.sin(state.time * 1.3) * .08;
      cloth.rotation.y = Math.sin(state.time * 2.1) * .12;
      if (Math.abs(flagAt.x - flagTo.x) + Math.abs(flagAt.z - flagTo.z) > .003) busy = true;
      flag.position.y = radius(model.seed) + lift[model.seed] + wave * .5;

      for (let i = 0; i < AGENTS; i++) {
        const c = colorNow[i];
        if (colorsDirty || Math.abs(c.r - colorTo[i].r) + Math.abs(c.g - colorTo[i].g) + Math.abs(c.b - colorTo[i].b) > .004) {
          c.r = damp(c.r, colorTo[i].r, kk, dt); c.g = damp(c.g, colorTo[i].g, kk, dt); c.b = damp(c.b, colorTo[i].b, kk, dt);
          if (Math.abs(c.r - colorTo[i].r) + Math.abs(c.g - colorTo[i].g) + Math.abs(c.b - colorTo[i].b) > .004) busy = true;
        }
        lift[i] = damp(lift[i], liftTo[i], kk, dt);
        if (Math.abs(lift[i] - liftTo[i]) > .002) busy = true;
        pulse[i] = Math.max(0, pulse[i] - dt * 1.6); if (pulse[i] > 0) busy = true;
        hoverK[i] = damp(hoverK[i], i === hovered ? 1 : 0, 14, dt);
        if (Math.abs(hoverK[i] - (i === hovered ? 1 : 0)) > .01) busy = true;
        const r = radius(i) * (1 + .5 * Math.sin(pulse[i] * Math.PI) + .16 * hoverK[i]);
        dummy.position.set(pos[i][0], r + lift[i] + .18 * hoverK[i], pos[i][1]);
        dummy.scale.setScalar(r); dummy.quaternion.identity(); dummy.updateMatrix();
        agents.setMatrixAt(i, dummy.matrix); agents.setColorAt(i, c);
      }
      colorsDirty = false;
      agents.instanceMatrix.needsUpdate = true; agents.instanceColor.needsUpdate = true;
      return busy;
    },
    on(name, payload) {
      if (name === 'graph') { graph = buildGraph(payload.shortcuts); buildLinks(); }
      if (name === 'state') { auto = false; apply(payload); }
      if (name === 'auto') auto = !!payload && !reducedMotion;
    },
    pick() {
      if (auto) return;
      const id = agentAt();
      if (id >= 0) api.emit('seed', id);
    },
    dispose() { rodGeometry.dispose(); sphere.dispose(); agentMaterial.dispose(); rodMaterial.dispose(); archList.forEach(item => item.mesh.geometry.dispose()); archMaterials.rest.dispose(); archMaterials.lit.dispose(); },
  };
}
