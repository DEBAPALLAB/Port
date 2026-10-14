// The voice object: a ceramic orb in a turned dish, ringed by five concentric bands.
// The rings are the session. They rise one after another while connecting, ripple while connected,
// tilt and drop when the connection is interrupted, and re-seat one by one on retry.
// Host sends: on('state', 'entry|connecting|connected|interrupted|retry'), on('speaking', bool), on('clock', seconds).
// The scene emits: 'tap' (orb pressed), 'ring' (index of a ring pressed).

export const options = {
  frame: 3.25, fov: 28, height: .7, target: [0, .32, 0],
  yaw: [-1.1, 1.1], pitch: [.16, .78], startYaw: -.28, startPitch: .44,
  floor: -.2, shadow: .17, exposure: 1.02,
};

const STATES = ['entry', 'connecting', 'connected', 'interrupted', 'retry'];
const RING_RADII = [1.12, 1.46, 1.8, 2.14, 2.48];
const SAGE = 0x6f9279, CORAL = 0xed5939, SAGE_SOFT = 0xa9bfae;
const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

export default function setup(api) {
  const { THREE, root, materials, palette, interactive, canvasTexture, reducedMotion } = api;
  const group = new THREE.Group(); root.add(group);

  // The dish: a lathe-turned disc with a shallow groove under every ring.
  const profile = [new THREE.Vector2(0, -.2), new THREE.Vector2(2.52, -.2)];
  for (let a = 0; a <= 1.001; a += .125) profile.push(new THREE.Vector2(2.52 + Math.sin(a * Math.PI / 2) * .2, -.2 + (1 - Math.cos(a * Math.PI / 2)) * .2));
  const groove = r => RING_RADII.reduce((sum, ring) => sum + Math.exp(-(((r - ring) / .1) ** 2)) * .05, 0);
  for (let r = 2.72; r >= 0; r -= .03) profile.push(new THREE.Vector2(r, -groove(r)));
  const dish = new THREE.Mesh(new THREE.LatheGeometry(profile, 128), materials.ceramic(0xb7c8bc));
  dish.receiveShadow = true; dish.castShadow = true; group.add(dish);

  // The rings: flat elliptical torus bands, one material each so they can be tinted separately.
  const rings = RING_RADII.map((radius, index) => {
    const section = [];
    for (let a = 0; a <= Math.PI * 2 + .001; a += Math.PI / 12) section.push(new THREE.Vector2(radius + Math.cos(a) * .13, Math.sin(a) * .075));
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(section, 128), materials.ceramic(0xfcfaf5));
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData.ring = index;
    const holder = new THREE.Group(); holder.add(mesh); group.add(holder);
    mesh.userData.onPick = () => { ring.bump = 1; api.emit('ring', index); api.kick(1.2); };
    interactive.push(mesh);
    const ring = { holder, mesh, y: 0, rx: 0, rz: 0, ox: 0, s: 1, tint: 0, bump: 0, hover: 0, hovered: false, base: new THREE.Color(0xfcfaf5) };
    return ring;
  });

  // The orb carries the session readout, printed on its front.
  const face = canvasTexture(2048, 1024, (ctx, w, h, view = { state: 'entry', clock: 0, speaking: false }) => {
    ctx.fillStyle = '#fbf9f4'; ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const mm = String(Math.floor(view.clock / 60)).padStart(2, '0'), ss = String(view.clock % 60).padStart(2, '0');
    const copy = {
      entry: ['Tara', 'Tap to start', '#30312e'],
      connecting: ['Connecting', 'One moment', '#30312e'],
      connected: [`${mm}:${ss}`, view.speaking ? 'Tara is speaking' : 'Listening', '#30312e'],
      interrupted: ['Dropped', 'Tap to retry', '#b93c24'],
      retry: ['Retrying', 'Reconnecting', '#30312e'],
    }[view.state];
    const x = w * .25;
    ctx.fillStyle = copy[2]; ctx.font = '600 150px "Manrope Variable"'; ctx.fillText(copy[0], x, h * .34);
    ctx.fillStyle = '#6b6a64'; ctx.font = '500 72px "Manrope Variable"'; ctx.fillText(copy[1], x, h * .5);
  });
  const orbMaterial = materials.ceramic(0xffffff); orbMaterial.map = face; orbMaterial.roughness = .3;
  const orb = new THREE.Mesh(new THREE.SphereGeometry(.8, 72, 56), orbMaterial);
  orb.position.y = .8; orb.castShadow = true;
  const orbHolder = new THREE.Group(); orbHolder.add(orb); group.add(orbHolder);
  orb.userData.onPick = () => { orbPress = 1; api.emit('tap'); api.kick(1); };
  interactive.push(orb);

  let state = 'entry', previous = 'entry', changed = -10, speaking = false, clock = 0, orbPress = 0, orbShake = 0, orbHover = 0;
  const view = () => ({ state, clock, speaking });
  const tmp = new THREE.Color();

  // Where each ring wants to be in each state. Delay staggers the change from ring to ring.
  function target(name, i, time) {
    const calm = reducedMotion ? 0 : 1;
    switch (name) {
      case 'connecting': return { y: .12 + calm * .04 * Math.sin(time * 4 - i * 1.1), rx: 0, rz: 0, ox: 0, s: 1, tint: .55, delay: i * .16 };
      case 'connected': {
        const loud = speaking ? 1 : .35;
        return { y: .05 + calm * loud * .09 * (Math.sin(time * 3.1 - i * .9) * .5 + .5), rx: 0, rz: 0, ox: 0, s: 1 + (speaking && calm ? .012 * Math.sin(time * 3.1 - i * .9) : 0), tint: 1, delay: i * .1 };
      }
      case 'interrupted': {
        if (i < 2) return { y: 0, rx: 0, rz: 0, ox: 0, s: 1, tint: .35, delay: (4 - i) * .08 };
        if (i === 2) return { y: -.02, rx: .32, rz: -.1, ox: .06, s: 1, tint: 2, delay: .1 };
        return { y: -.05, rx: (i % 2 ? .4 : -.34), rz: (i % 2 ? .26 : -.28), ox: (i % 2 ? .16 : -.12), s: .97, tint: 1.7, delay: (4 - i) * .07 };
      }
      case 'retry': return { y: .03 + calm * .06 * (Math.sin(time * 2.4 - i * 1.3) * .5 + .5), rx: 0, rz: 0, ox: 0, s: 1, tint: .7, delay: i * .22 };
      default: return { y: 0, rx: 0, rz: 0, ox: 0, s: 1, tint: 0, delay: (4 - i) * .06 };
    }
  }
  const tintColor = (base, tint, out) => {
    // 0 ceramic, 1 sage, 2 coral; fractions blend.
    if (tint <= 1) return out.copy(base).lerp(tmp.set(tint < .6 ? SAGE_SOFT : SAGE), Math.min(1, tint));
    return out.set(SAGE).lerp(tmp.set(CORAL), Math.min(1, tint - 1));
  };
  const scratch = new THREE.Color();

  setTimeout(() => api.emit('ready'), 0);

  return {
    on(name, payload) {
      if (name === 'state' && STATES.includes(payload) && payload !== state) {
        previous = state; state = payload; changed = api.state.time;
        if (state === 'interrupted') orbShake = 1;
        face.redraw(view()); api.kick(3);
      }
      if (name === 'speaking') { speaking = !!payload; face.redraw(view()); api.kick(1); }
      if (name === 'clock') { clock = payload | 0; face.redraw(view()); }
    },
    hover(object, prev) {
      rings.forEach(ring => { ring.hovered = ring.mesh === object; });
      orbHover = object === orb ? 1 : 0;
      api.kick(.6);
    },
    update(dt, s) {
      const time = s.time;
      const lambda = reducedMotion ? 40 : 7;
      const spread = Math.abs(s.progressSmooth - .5) * 1.1;
      let moving = state === 'connecting' || state === 'connected' || state === 'retry' ? !reducedMotion : false;
      rings.forEach((ring, i) => {
        const now = target(state, i, time), before = target(previous, i, time);
        const go = time - changed > now.delay || changed < 0;
        const goal = go ? now : before;
        ring.bump = damp(ring.bump, 0, 3, dt);
        ring.hover = damp(ring.hover, ring.hovered ? 1 : 0, 12, dt);
        const lift = goal.y + ring.bump * .14 + ring.hover * .07 + (state === 'entry' ? spread * (i + 1) * .07 : 0);
        ring.y = damp(ring.y, lift, lambda, dt);
        ring.rx = damp(ring.rx, goal.rx, lambda, dt);
        ring.rz = damp(ring.rz, goal.rz, lambda, dt);
        ring.ox = damp(ring.ox, goal.ox, lambda, dt);
        ring.s = damp(ring.s, goal.s, lambda, dt);
        ring.tint = damp(ring.tint, goal.tint, reducedMotion ? 40 : 5, dt);
        ring.holder.position.set(ring.ox, ring.y + .09, 0);
        ring.holder.rotation.set(ring.rx, 0, ring.rz);
        ring.holder.scale.setScalar(ring.s);
        ring.mesh.material.color.copy(tintColor(ring.base, ring.tint, scratch));
        if (Math.abs(ring.y - lift) > .002 || Math.abs(ring.tint - goal.tint) > .004 || Math.abs(ring.rx - goal.rx) > .004) moving = true;
      });
      orbPress = damp(orbPress, 0, 6, dt);
      orbShake = damp(orbShake, 0, 3.2, dt);
      const breath = reducedMotion ? 0 : Math.sin(time * 1.6) * (state === 'connected' && speaking ? .03 : .012);
      orbHolder.scale.setScalar(1 + breath + orbPress * -.06 + (orbHover ? .025 : 0));
      orbHolder.position.y = (state === 'interrupted' ? -.05 : 0) + (state === 'connecting' ? .05 : 0);
      orbHolder.rotation.y = reducedMotion ? 0 : Math.sin(time * 38) * orbShake * .05;
      if (orbPress > .004 || orbShake > .004) moving = true;
      return moving;
    },
    dispose() {},
  };
}
