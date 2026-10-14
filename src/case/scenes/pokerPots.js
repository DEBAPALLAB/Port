import { createChips, stackTargets } from './pokerChips.js';

// The side-pot table. React computes the pots with the ported engine (pokerEngine.js) and sends the model here;
// this scene only draws it: stacks at the seats, bets in front, pots in the middle, chips flying between them.
export const options = { frame: 3.7, height: 1.2, fov: 28, startPitch: .78, pitch: [.42, 1.02], yaw: [-.7, .7], startYaw: -.12, floor: -.4, shadow: .17, exposure: 1.02 };

const SEATS = [{ x: -2.05, z: 2.2 }, { x: -2.05, z: -2.2 }, { x: 2.05, z: -2.2 }, { x: 2.05, z: 2.2 }];
const BETS = [{ x: -1.1, z: 1.12 }, { x: -1.1, z: -1.12 }, { x: 1.1, z: -1.12 }, { x: 1.1, z: 1.12 }];
const PLATES = [{ x: -3.4, z: 2.25 }, { x: -3.4, z: -2.25 }, { x: 3.4, z: -2.25 }, { x: 3.4, z: 2.25 }];
const SURFACE = .014;

function roundedShape(THREE, w, d, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
  s.lineTo(x + w, y + d - r); s.absarc(x + w - r, y + d - r, r, 0, Math.PI / 2);
  s.lineTo(x + r, y + d); s.absarc(x + r, y + d - r, r, Math.PI / 2, Math.PI);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  return s;
}

export default function setup(api) {
  const { THREE, root, materials, palette } = api;
  const table = new THREE.Group(); root.add(table);

  const top = new THREE.ExtrudeGeometry(roundedShape(THREE, 9.4, 7.6, 1.5), { depth: .3, bevelEnabled: true, bevelSize: .07, bevelThickness: .07, bevelSegments: 4, curveSegments: 18 });
  top.rotateX(-Math.PI / 2); top.computeBoundingBox(); top.translate(0, -top.boundingBox.max.y, 0);
  const slab = new THREE.Mesh(top, materials.ceramic(0xe4e0d7)); slab.receiveShadow = true; slab.castShadow = true; table.add(slab);
  const inset = new THREE.ExtrudeGeometry(roundedShape(THREE, 8.7, 6.9, 1.2), { depth: SURFACE, bevelEnabled: false, curveSegments: 18 });
  inset.rotateX(-Math.PI / 2);
  const surface = new THREE.Mesh(inset, new THREE.MeshStandardMaterial({ color: 0xf3f0e9, roughness: .8 })); surface.receiveShadow = true; table.add(surface);

  const chipRoot = new THREE.Group(); chipRoot.position.y = SURFACE; table.add(chipRoot);
  const chips = createChips(api, { capacity: 44, parent: chipRoot });

  // Flat labels that lie on the table.
  const flat = (w, h, draw, x, z) => {
    const texture = api.canvasTexture(512, Math.round(512 * h / w), draw);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, SURFACE + .004, z); mesh.renderOrder = 2;
    table.add(mesh); return { mesh, texture };
  };
  const roundRect = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };

  const drawPlate = (ctx, w, h, p) => {
    if (!p) return;
    ctx.fillStyle = p.folded ? '#e6e2da' : '#ffffff'; roundRect(ctx, 0, 0, w, h, h * .22);
    ctx.fillStyle = '#30312e'; ctx.textBaseline = 'alphabetic';
    ctx.font = '700 ' + h * .27 + 'px "Manrope Variable"'; ctx.fillText(p.name, w * .09, h * .36);
    ctx.font = '620 ' + h * .43 + 'px "Manrope Variable"'; ctx.fillText(String(p.chips), w * .09, h * .82);
    const tag = p.folded ? 'folded' : p.allIn ? 'all in' : '';
    if (tag) { ctx.font = '700 ' + h * .2 + 'px "Manrope Variable"'; ctx.fillStyle = p.folded ? '#6b6a64' : '#b93c24'; ctx.textAlign = 'right'; ctx.fillText(tag, w * .93, h * .36); ctx.textAlign = 'left'; }
  };
  const drawPot = (ctx, w, h, p) => {
    if (!p) return;
    ctx.fillStyle = p.on ? '#30312e' : '#ffffff'; roundRect(ctx, 0, 0, w, h, h * .2);
    ctx.fillStyle = p.on ? '#ffffff' : '#30312e'; ctx.textAlign = 'center';
    ctx.font = '700 ' + h * .22 + 'px "Manrope Variable"'; ctx.fillText(p.title, w / 2, h * .34);
    ctx.font = '640 ' + h * .46 + 'px "Manrope Variable"'; ctx.fillText(String(p.amount), w / 2, h * .8);
    ctx.textAlign = 'left';
  };
  const plates = SEATS.map((s, i) => flat(1.55, .66, drawPlate, PLATES[i].x, PLATES[i].z));
  const potLabels = Array.from({ length: 4 }, () => flat(1.28, .8, drawPot, 0, 0.95));
  potLabels.forEach(l => { l.mesh.visible = false; });

  // Dealer button
  const dealerTexture = api.canvasTexture(128, 128, (ctx, w) => {
    ctx.fillStyle = '#fffdf8'; ctx.beginPath(); ctx.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b93c24'; ctx.font = '700 70px "Manrope Variable"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('D', w / 2, w / 2 + 4);
  });
  const dealer = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .06, 36), [materials.ceramic(0xfffdf8), new THREE.MeshStandardMaterial({ map: dealerTexture, roughness: .6 }), materials.ceramic(0xfffdf8)]);
  dealer.position.set(3.0, SURFACE + .03, 1.25); dealer.castShadow = true; table.add(dealer);

  // Pick zones (invisible; raycast ignores visibility).
  const zoneMaterial = new THREE.MeshBasicMaterial({ visible: false });
  const makeZone = (kind, index, radius) => {
    const zone = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 1.2, 16), zoneMaterial);
    zone.userData = { kind, index }; zone.position.y = .6; chipRoot.add(zone); api.interactive.push(zone); return zone;
  };
  const seatZones = SEATS.map((s, i) => { const z = makeZone('seat', i, .95); z.position.set(s.x, .6, s.z); return z; });
  const potZones = Array.from({ length: 4 }, (_, i) => makeZone('pot', i, .8));
  potZones.forEach(z => { z.position.set(0, -9, 0); });

  let model = null, lastPhase = null, highlight = null, announced = false;
  const potX = (k, n) => (k - (n - 1) / 2) * 1.5;

  function build() {
    const { players, pots, phase } = model;
    const targets = [];
    const nPots = pots.length;
    const potCenter = k => ({ x: potX(k, nPots), y: .3, z: 0 });
    players.forEach((p, i) => {
      const seat = SEATS[i], bet = BETS[i];
      let seatAmount = p.stack;
      let from;
      if (phase !== 'stacks') seatAmount = p.stack - p.bet;
      if (phase === 'pots') { seatAmount += p.refund; if (p.refund) from = { x: bet.x, y: .5, z: bet.z }; }
      if (phase === 'award') {
        seatAmount += p.refund + p.payout;
        const source = pots.findIndex(pot => pot.payouts[i] > 0);
        if (source >= 0) from = potCenter(source); else if (p.refund) from = { x: bet.x, y: .5, z: bet.z };
      }
      targets.push(...stackTargets(seatAmount, seat.x, seat.z, { group: i, from }));
      if (phase === 'bets' && p.bet > 0) targets.push(...stackTargets(p.bet, bet.x, bet.z, { group: i, from: { x: seat.x, y: .8, z: seat.z } }));
    });
    if (phase === 'pots') {
      pots.forEach((pot, k) => {
        const mean = { x: 0, z: 0 }, n = pot.contributors.length || 1;
        pot.contributors.forEach(i => { mean.x += BETS[i].x / n; mean.z += BETS[i].z / n; });
        targets.push(...stackTargets(pot.amount, potX(k, nPots), 0, { group: 10 + k, from: { x: mean.x, y: .6, z: mean.z }, perColumn: 6, spread: .82 }));
      });
    }
    return targets;
  }

  function labels() {
    const { players, pots, phase } = model;
    players.forEach((p, i) => {
      const chips = phase === 'stacks' ? p.stack : p.stack - p.bet + (phase === 'pots' || phase === 'award' ? p.refund : 0) + (phase === 'award' ? p.payout : 0);
      plates[i].texture.redraw({ name: p.name, chips, folded: p.folded, allIn: p.allIn && phase !== 'award' });
    });
    potLabels.forEach((label, k) => {
      const pot = pots[k], show = pot && (phase === 'pots' || phase === 'award');
      label.mesh.visible = !!show;
      if (!show) return;
      const winners = Object.keys(pot.payouts).filter(i => pot.payouts[i] > 0).map(i => players[i].name);
      label.mesh.position.x = potX(k, pots.length);
      label.texture.redraw({ title: phase === 'award' ? (winners.join(' + ') || pot.name) : pot.name, amount: pot.amount, on: highlight === k });
    });
    potZones.forEach((zone, k) => { const on = pots[k] && phase === 'pots'; zone.position.set(on ? potX(k, pots.length) : 0, on ? .6 : -9, 0); });
  }

  function apply() {
    if (!model) return;
    chips.retarget(build(), { stagger: model.phase === 'stacks' ? .02 : .035, speed: model.phase === 'stacks' ? 1.6 : 1.15 });
    labels();
    if (api.reducedMotion) chips.settle();
    lastPhase = model.phase;
  }

  return {
    on(name, payload) {
      if (name === 'model') { model = payload; apply(); }
      if (name === 'highlight') {
        const next = payload?.pot ?? null;
        if (highlight !== null) chips.setLift(10 + highlight, 0);
        highlight = next;
        if (next !== null) chips.setLift(10 + next, .16);
        if (model) labels();
      }
    },
    hover(obj, prev) {
      if (prev?.userData?.kind === 'seat') chips.setLift(prev.userData.index, 0);
      if (obj?.userData?.kind === 'seat') chips.setLift(obj.userData.index, .12);
      api.emit('hover', obj ? { kind: obj.userData.kind, index: obj.userData.index } : null);
    },
    pick(obj) { if (obj) api.emit('pick', { kind: obj.userData.kind, index: obj.userData.index }); },
    update(dt) { if (!announced) { announced = true; api.emit('ready'); } return chips.update(dt); },
  };
}
