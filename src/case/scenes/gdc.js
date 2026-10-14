import { createInstitution } from './gdcBuilding.js';

// Hero: the institution pulls apart into its audiences, and closes again as you scroll past.
export const options = { frame: 4.35, fov: 28, height: 2.1, startYaw: -.42, startPitch: .24, yaw: [-.8, .8], pitch: [-.04, .5], floor: -3.62, shadow: .17, exposure: 1.02 };

export default function setup(api) {
  const { state, reducedMotion } = api;
  const inst = createInstitution(api);
  let intro = reducedMotion ? 1 : 0;
  api.kick(2.4);
  return {
    update(dt, s) {
      intro = Math.min(1, intro + dt / 1.7);
      const eased = reducedMotion ? 1 : inst.smooth(.18, 1, intro);
      const open = reducedMotion ? 1 : eased * (1 - inst.smooth(.58, .97, s.progressSmooth));
      return inst.step(dt, open) || intro < 1;
    },
    hover(obj) { inst.hover(obj); },
    pick(obj) {
      if (!obj) return;
      const d = obj.userData;
      api.emit('wing', { wing: d.wing, page: d.page || null });
    },
    on(name, payload) { if (name === 'route') inst.setRoute(payload.wing, payload.page); },
  };
}
