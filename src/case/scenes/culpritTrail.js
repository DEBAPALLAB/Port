import { createParts, SLAB, GAP } from './culpritShared.js';

// The call graph of the live challenge, built as ground you can stand on. Each function is a stack
// of line-slabs on its file's plinth, bridges are calls. A guess plants a peg that shows its distance
// from the cause; the reveal fills the missing slab, lifts the failing test and lays the trail.
export const options = { frame: 5.1, fov: 28, startYaw: -.12, startPitch: .6, yaw: [-.7, .7], pitch: [.3, .95], floor: null, shadow: .2 };

const FILES = {
  test: ['orders.test.ts', [-3.2, .8], [1.5, 1.4]],
  order: ['order.ts', [-.9, .5], [1.5, 1.4]],
  cart: ['cart.ts', [-1.7, -1.9], [1.4, 1.2]],
  money: ['money.ts', [.4, -1.9], [1.4, 1.2]],
  promo: ['promo.ts', [1.6, .8], [1.9, 1.5]],
  dates: ['dates.ts', [3.6, -.7], [1.5, 1.4]],
};
const NODES = {
  test: ['test', [0, 0], 4, 3],
  placeOrder: ['order', [0, 0], 6, 5],
  sumLines: ['cart', [0, 0], 2, 7],
  round2: ['money', [0, 0], 2, 9],
  findPromo: ['promo', [-.45, .32], 4, 11],
  isActive: ['promo', [.4, -.28], 2, 13],
  endOfDay: ['dates', [0, 0], 4, 15],
};
const CALLS = [['test', 'placeOrder'], ['placeOrder', 'sumLines'], ['placeOrder', 'round2'], ['placeOrder', 'findPromo'], ['placeOrder', 'isActive'], ['isActive', 'endOfDay']];
const ROUTE = ['test', 'placeOrder', 'isActive', 'endOfDay'];

export default function setup(api) {
  const { THREE, root, interactive } = api;
  const parts = createParts(api);
  const world = new THREE.Group(); root.add(world);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: .17 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; world.add(ground);

  const fileOrigin = {};
  Object.entries(FILES).forEach(([key, [name, [x, z], [w, d]]], i) => {
    const plinth = parts.plinth(name, 60 + i * 9, w, d);
    plinth.position.set(x, 0, z); world.add(plinth); fileOrigin[key] = new THREE.Vector3(x, .14, z);
  });

  const nodes = {};
  Object.entries(NODES).forEach(([id, [file, cell, n, seed]]) => {
    const gapAt = id === 'endOfDay' ? 2 : -1;
    const stack = parts.stack({ w: id === 'placeOrder' ? .8 : .62, d: .56, n, seed, gapAt, ink: id === 'test' ? [3] : [] });
    stack.position.set(fileOrigin[file].x + cell[0], .14, fileOrigin[file].z + cell[1]);
    Object.assign(stack.userData, { id, base: .14, lift: 0, target: 0, top: .14 + stack.userData.height });
    world.add(stack); interactive.push(stack); nodes[id] = stack;
  });

  // Calls as low bridges between functions.
  CALLS.forEach(([a, b]) => {
    const p = nodes[a].position, q = nodes[b].position;
    const length = Math.hypot(q.x - p.x, q.z - p.z);
    const bridge = new THREE.Mesh(parts.box(length, .05, .08, .02), parts.mats.plinth);
    bridge.position.set((p.x + q.x) / 2, .045, (p.z + q.z) / 2);
    bridge.rotation.y = -Math.atan2(q.z - p.z, q.x - p.x);
    bridge.receiveShadow = true; world.add(bridge);
  });

  // Distance badges for the pegs.
  const badge = [];
  for (let d = 0; d <= 5; d++) {
    badge[d] = api.canvasTexture(128, 128, (ctx, w, h) => {
      ctx.fillStyle = d === 0 ? '#ed5939' : '#30312e';
      ctx.beginPath(); ctx.arc(w / 2, h / 2, 58, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '700 72px "Manrope Variable", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(d), w / 2, h / 2 + 4);
    });
  }
  const stemGeo = new THREE.CylinderGeometry(.018, .018, .42, 8);
  const pegs = [];
  function plant(id, distance) {
    if (pegs.some(p => p.id === id)) return;
    const group = new THREE.Group();
    const stem = new THREE.Mesh(stemGeo, distance === 0 ? parts.mats.accent : parts.mats.ink); stem.position.y = .21; stem.castShadow = true;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: badge[Math.min(5, distance)], transparent: true }));
    sprite.scale.setScalar(.34); sprite.position.y = .5;
    group.add(stem, sprite);
    group.position.set(nodes[id].position.x, nodes[id].userData.top + .05, nodes[id].position.z);
    group.userData = { drop: 0 }; world.add(group); pegs.push({ id, group });
    api.kick(1);
  }

  // The cause: the missing slab, shown as a coral slab that settles into the gap.
  const bug = new THREE.Mesh(parts.box(.5, SLAB, .56), parts.mats.accent);
  bug.position.set(nodes.endOfDay.position.x - .06, .14 + 2 * (SLAB + GAP) + SLAB / 2, nodes.endOfDay.position.z); bug.castShadow = true; bug.scale.setScalar(.001); world.add(bug);
  // The symptom: the failing test's top slab lifts, with a crack.
  const testSlabs = nodes.test.userData.slabs;
  const crack = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-.25, .05, .29], [-.12, .17, .29], [0, .1, .29], [.12, .23, .29], [.26, .3, .29]].map(p => new THREE.Vector3(...p))), 20, .008, 5, false), parts.mats.ink);
  crack.scale.setScalar(.001); nodes.test.add(crack);
  // The trail.
  const routePoints = ROUTE.map(id => nodes[id].position.clone().setY(nodes[id].userData.top + .75));
  const curve = new THREE.CatmullRomCurve3(routePoints, false, 'catmullrom', .5);
  const chipGeo = new THREE.CylinderGeometry(.085, .085, .03, 24), chips = [];
  const TOTAL = 12;
  for (let i = 0; i < TOTAL; i++) {
    const chip = new THREE.Mesh(chipGeo, parts.mats.accent), t = i / (TOTAL - 1);
    chip.position.copy(curve.getPoint(t)); chip.castShadow = true; chip.scale.setScalar(.001);
    const tangent = curve.getTangent(t); chip.lookAt(chip.position.clone().add(tangent)); chip.rotateX(Math.PI / 2);
    world.add(chip); chips.push(chip);
  }

  let revealed = false, reveal = api.reducedMotion ? 99 : 0;
  const ease = x => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
  const pop = x => { const t = Math.min(1, Math.max(0, x)); return 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2); };

  return {
    update(dt) {
      let busy = false;
      if (revealed && reveal < 8) { reveal += dt * (api.reducedMotion ? 80 : 1.5); busy = true; }
      if (!revealed && reveal > 0) { reveal = 0; }
      // Slab lands in the gap, the test's top slab lifts, crack opens, markers lay down.
      const land = ease(reveal / 1.2);
      bug.scale.setScalar(Math.max(.001, land));
      bug.position.y = .14 + 2 * (SLAB + GAP) + SLAB / 2 + (1 - land) * .5;
      const lift = ease((reveal - 1.4) / 1.0);
      const top = testSlabs[testSlabs.length - 1];
      top.position.y = SLAB / 2 + 3 * (SLAB + GAP) + lift * .16; top.rotation.z = lift * .12; top.rotation.x = lift * .08;
      crack.scale.setScalar(Math.max(.001, lift));
      chips.forEach((chip, i) => chip.scale.setScalar(Math.max(.001, pop((reveal - 2.2) * 2.4 - i * .55))));
      for (const id in nodes) {
        const u = nodes[id].userData;
        u.lift += (u.target - u.lift) * (1 - Math.exp(-11 * dt));
        nodes[id].position.y = u.base + Math.max(0, u.lift);
        if (Math.abs(u.target - u.lift) > .002) busy = true;
      }
      for (const peg of pegs) {
        const d = peg.group.userData;
        d.drop += (1 - d.drop) * (1 - Math.exp(-9 * dt));
        peg.group.position.y = nodes[peg.id].position.y + nodes[peg.id].userData.height + .05 + (1 - d.drop) * .7;
        if (d.drop < .995) busy = true;
      }
      return busy;
    },
    hover(object, previous) {
      if (previous) previous.userData.target = 0;
      if (object) object.userData.target = .08;
    },
    pick(object) { if (object) api.emit('pick', object.userData.id); },
    on(name, payload) {
      if (name === 'guess') plant(payload.id, payload.distance);
      if (name === 'reveal') { revealed = true; reveal = api.reducedMotion ? 99 : 0; api.kick(8); }
      if (name === 'reset') {
        revealed = false; reveal = 0;
        pegs.splice(0).forEach(p => { world.remove(p.group); });
        api.kick(.6);
      }
    },
  };
}
