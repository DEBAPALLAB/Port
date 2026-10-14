import { createChips, stackTargets } from './pokerChips.js';
import { computeSidePots } from './pokerEngine.js';

// Hero: four players, three different stack depths, everyone all-in. One push and the chips settle into the
// pots the engine would make (computeSidePots, ported from src/lib/sidePots.ts). Click to take them back.
export const options = { frame: 4.1, height: 1.1, fov: 28, startPitch: .66, pitch: [.36, .95], yaw: [-.75, .75], startYaw: -.3, floor: -.42, shadow: .18 };

const NAMES = ['Ana', 'Ben', 'Cy', 'Dee'];
const STACKS = [460, 1130, 1930, 1930];
const SEAT_X = [-2.55, -.85, .85, 2.55];
const SEAT_Z = 1.45, POT_Z = -.9, SURFACE = .012;

export default function setup(api) {
  const { THREE, root, materials } = api;
  const slab = new THREE.Mesh(api.roundedBox(8.6, .42, 5.4, .2, 5), materials.ceramic(0xece8df));
  slab.position.y = -.21; slab.receiveShadow = true; slab.castShadow = true; root.add(slab);
  const inset = new THREE.Mesh(api.roundedBox(8.0, .06, 4.8, .1, 4), new THREE.MeshStandardMaterial({ color: 0xf6f3ec, roughness: .8 }));
  inset.position.y = -.0; inset.receiveShadow = true; root.add(inset);

  const chipRoot = new THREE.Group(); chipRoot.position.y = .03 + SURFACE; root.add(chipRoot);
  const chips = createChips(api, { capacity: 40, parent: chipRoot });

  const pots = computeSidePots(STACKS.map((total, i) => ({ playerId: String(i), totalCommitted: total, folded: false })));
  const potX = k => (k - (pots.length - 1) / 2) * 2.05;

  const flat = (w, h, draw, x, z) => {
    const texture = api.canvasTexture(512, Math.round(512 * h / w), draw);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, .03 + SURFACE + .004, z); mesh.renderOrder = 2; root.add(mesh); return { mesh, texture };
  };
  const draw = (ctx, w, h, d) => {
    if (!d) return;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(0, 0, w, h, h * .2); ctx.fill();
    ctx.fillStyle = '#30312e'; ctx.textAlign = 'center';
    ctx.font = '700 ' + h * .22 + 'px "Manrope Variable"'; ctx.fillText(d.title, w / 2, h * .34);
    ctx.font = '640 ' + h * .46 + 'px "Manrope Variable"'; ctx.fillText(String(d.value), w / 2, h * .8);
  };
  const seatLabels = NAMES.map((name, i) => flat(1.5, .78, draw, SEAT_X[i], SEAT_Z + 1.2));
  const potLabels = pots.map((pot, k) => flat(1.7, .86, draw, potX(k), POT_Z + 1.05));

  let committed = false, started = false, hoverIndex = null;

  function layout() {
    const targets = [];
    STACKS.forEach((amount, i) => {
      if (!committed) targets.push(...stackTargets(amount, SEAT_X[i], SEAT_Z, { group: i, perColumn: 8 }));
    });
    if (committed) pots.forEach((pot, k) => {
      const from = { x: SEAT_X[Math.min(k + 1, 3)], y: .5, z: SEAT_Z };
      targets.push(...stackTargets(pot.amount, potX(k), POT_Z, { group: 10 + k, from, perColumn: 8 }));
    });
    chips.retarget(targets, { stagger: .028, speed: 1.05 });
    seatLabels.forEach((l, i) => l.texture.redraw({ title: NAMES[i], value: committed ? 0 : STACKS[i] }));
    potLabels.forEach((l, k) => { l.mesh.visible = committed; l.texture.redraw({ title: k === 0 ? 'Main pot' : `Side pot ${k}`, value: pots[k].amount }); });
    if (api.reducedMotion) chips.settle();
    api.emit('committed', committed);
  }

  const zone = new THREE.Mesh(new THREE.BoxGeometry(8.4, 1.6, 5.4), new THREE.MeshBasicMaterial({ visible: false }));
  zone.position.y = .8; root.add(zone); api.interactive.push(zone);
  zone.userData.onPick = () => { committed = !committed; layout(); };

  layout();
  return {
    on(name) { if (name === 'toggle') { committed = !committed; layout(); } if (name === 'commit') { committed = true; layout(); } },
    hover(obj) { hoverIndex = obj ? 1 : null; api.setCursor(obj ? 'pointer' : 'grab'); },
    update(dt, state) {
      if (!started && state.visible && state.time > 1.1 && !api.reducedMotion) { started = true; committed = true; layout(); }
      return chips.update(dt);
    },
  };
}
