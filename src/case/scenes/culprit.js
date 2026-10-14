import { createParts, rng, SLAB, GAP } from './culpritShared.js';

// A codebase as a ceramic city. Files are plinths, functions are stacks of line-slabs.
// One coral slab hides in a stack at the back. The failure shows up as a cracked, lifted block far away.
// A trail of coral markers walks the distance between them. Hover lifts a function; click the cracked block to replay the trail.
export const options = { frame: 4.9, fov: 28, startYaw: -.34, startPitch: .58, yaw: [-.9, .9], pitch: [.3, .95], floor: null, shadow: .2, exposure: 1.02 };

const NAMES = ['cart.ts', 'order.ts', 'promo.ts', 'money.ts', 'user.ts', 'dates.ts', 'session.ts', 'api.ts', 'store.ts', 'format.ts', 'tax.ts', 'orders.test.ts'];
const CULPRIT = 5, SYMPTOM = 11, PITCH = 2.02, COLS = 4, ROWS = 3;

export default function setup(api) {
  const { THREE, root, interactive, state } = api;
  const parts = createParts(api);
  const r = rng(11);
  const city = new THREE.Group(); root.add(city);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: .17 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; city.add(ground);

  const functions = [];
  let culpritStack = null, symptomStack = null, coralSlab = null;
  const center = index => new THREE.Vector3(((index % COLS) - (COLS - 1) / 2) * PITCH, 0, (Math.floor(index / COLS) - (ROWS - 1) / 2) * PITCH);

  NAMES.forEach((name, index) => {
    const origin = center(index);
    const plinth = parts.plinth(name, 40 + index * 7, 1.74, 1.74);
    plinth.position.copy(origin); city.add(plinth);
    const cells = [[-.42, -.4], [.42, -.4], [-.42, .42], [.42, .42]];
    const count = index === CULPRIT ? 2 : index === SYMPTOM ? 2 : 2 + Math.floor(r() * 3);
    for (let c = 0; c < count; c++) {
      const cell = index === CULPRIT ? [[-.4, -.42], [.0, .46]][c] : index === SYMPTOM ? [[-.4, .35], [.45, -.42]][c] : cells[(c + index) % 4];
      let n = 2 + Math.floor(r() * 5), ink = r() > .8 ? [Math.floor(r() * n)] : [];
      let opts = { w: .5 + r() * .2, d: .46 + r() * .18, n, seed: 100 + index * 13 + c, ink };
      if (index === CULPRIT && c === 0) opts = { w: .62, d: .56, n: 6, seed: 777, ink: [] };
      if (index === CULPRIT && c === 1) opts = { w: .7, d: .5, n: 8, seed: 321, ink: [5] };
      if (index === SYMPTOM && c === 0) opts = { w: .66, d: .6, n: 6, seed: 909, ink: [5] };
      const stack = parts.stack(opts);
      stack.position.set(origin.x + cell[0], .14, origin.z + cell[1]);
      stack.userData.base = stack.position.y; stack.userData.lift = 0; stack.userData.target = 0; stack.userData.file = name;
      city.add(stack); interactive.push(stack); functions.push(stack);
      if (index === CULPRIT && c === 0) {
        culpritStack = stack;
        // The bug: one coral slab inside an otherwise ordinary stack.
        const slab = stack.userData.slabs[3]; slab.material = parts.mats.accent;
        coralSlab = slab; slab.userData.home = slab.position.x;
      }
      if (index === SYMPTOM && c === 0) symptomStack = stack;
    }
  });

  // The failure: the top slabs of the symptom stack are lifted and tilted, with a crack across the face.
  const { slabs } = symptomStack.userData;
  const lifted = [slabs[4], slabs[5]];
  lifted.forEach((slab, i) => { slab.position.y += .1 + i * .06; slab.rotation.z = .09 - i * .03; slab.rotation.x = .05 + i * .04; });
  const crack = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    [-.3, .06, .31], [-.18, .17, .31], [-.08, .1, .31], [.04, .24, .31], [.14, .17, .31], [.28, .33, .31],
  ].map(p => new THREE.Vector3(...p))), 24, .008, 5, false), parts.mats.ink);
  crack.position.z = .0; symptomStack.add(crack);

  // The trail: coral markers flying the distance from the symptom to the cause.
  const from = symptomStack.position.clone().add(new THREE.Vector3(0, .85, 0));
  const to = culpritStack.position.clone().add(new THREE.Vector3(0, .95, 0));
  const control = from.clone().lerp(to, .5).add(new THREE.Vector3(0, 1.5, 0));
  const curve = new THREE.QuadraticBezierCurve3(from, control, to);
  const chipGeo = new THREE.CylinderGeometry(.085, .085, .03, 24);
  const chips = [];
  const TOTAL = 11;
  for (let i = 0; i < TOTAL; i++) {
    const chip = new THREE.Mesh(chipGeo, i === TOTAL - 1 ? parts.mats.accent : parts.mats.accent);
    const t = i / (TOTAL - 1);
    chip.position.copy(curve.getPoint(t)); chip.castShadow = true;
    chip.scale.setScalar(.01); chip.userData.t = t;
    const tangent = curve.getTangent(t); chip.lookAt(chip.position.clone().add(tangent)); chip.rotateX(Math.PI / 2);
    city.add(chip); chips.push(chip);
  }

  let trail = api.reducedMotion ? 99 : 0;
  const pop = x => { const t = Math.min(1, Math.max(0, x)); return 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2); };
  let slide = 0, slideTarget = 0;

  function replay() { trail = 0; api.kick(4.5); }
  function pickStack(object) {
    if (!object) return;
    object.userData.target = .34; setTimeout(() => { object.userData.target = 0; api.invalidate(); api.kick(1); }, 1100);
    api.kick(1.6);
    if (object === symptomStack) { replay(); api.emit('symptom', object.userData.file); }
    else if (object === culpritStack) { slideTarget = 1; setTimeout(() => { slideTarget = 0; api.kick(1.4); }, 1600); api.kick(2.4); api.emit('culprit', object.userData.file); }
    else api.emit('block', object.userData.file);
  }

  return {
    update(dt, s) {
      let busy = false;
      if (trail < TOTAL + 2) { trail += dt * (api.reducedMotion ? 60 : 6.5); busy = true; }
      const started = s.time > .7 || api.reducedMotion;
      chips.forEach((chip, i) => { const k = started ? pop((trail - 1.2 - i) / 1.2) : .01; chip.scale.setScalar(Math.max(.01, k)); });
      for (const stack of functions) {
        const u = stack.userData;
        u.lift += (u.target - u.lift) * (1 - Math.exp(-11 * dt));
        stack.position.y = u.base + Math.max(0, u.lift);
        if (Math.abs(u.target - u.lift) > .002) busy = true;
      }
      slide += (slideTarget - slide) * (1 - Math.exp(-8 * dt));
      coralSlab.position.x = coralSlab.userData.home + slide * .55;
      if (Math.abs(slideTarget - slide) > .002) busy = true;
      return busy;
    },
    hover(object, previous) {
      if (previous && previous.userData.target < .3) previous.userData.target = 0;
      if (object && object.userData.target < .3) object.userData.target = .11;
    },
    pick: pickStack,
    on(name) { if (name === 'replay') replay(); },
  };
}
