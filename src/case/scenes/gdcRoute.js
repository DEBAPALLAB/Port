import { createInstitution } from './gdcBuilding.js';
import { TASKS } from './gdcData.js';

// Find-it chapter: always pulled apart. Tiles that belong to a real task carry an amber dot and can be tapped.
export const options = { frame: 4.35, fov: 28, height: 2.1, startYaw: -.3, startPitch: .26, yaw: [-.8, .8], pitch: [-.04, .5], floor: -3.62, shadow: .17, exposure: 1.02 };

export default function setup(api) {
  const keys = new Set(TASKS.map(t => `${t.wing}/${t.page}`));
  const inst = createInstitution(api, { taskTiles: keys });
  api.kick(1);
  setTimeout(() => api.emit('ready'), 60);
  return {
    update(dt) { return inst.step(dt, 1); },
    hover(obj) { inst.hover(obj); },
    pick(obj) {
      const d = obj?.userData;
      if (d?.kind === 'tile') api.emit('tile', { wing: d.wing, page: d.page });
    },
    on(name, payload) {
      if (name === 'route') inst.setRoute(payload.wing, payload.page);
      if (name === 'clear') inst.clearRoute();
    },
  };
}
