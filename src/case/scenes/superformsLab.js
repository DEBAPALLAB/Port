import { createStack } from './superformsStack.js';
import { initialForm } from './superformsModel.js';

// Signature stage: driven entirely by the page's pipeline panel. `form` carries the sanitized result and the verdict events.
export const options = { frame: 3.45, fov: 26, startYaw: -.4, startPitch: .2, yaw: [-.85, .55], pitch: [-.04, .42], floor: -3.45, shadow: .3, height: 1.2 };

export default function setup(api) {
  const stack = createStack(api);
  stack.sync(initialForm());
  api.emit('ready');
  return {
    update(dt, state) { return stack.update(dt, state); },
    hover(obj) { stack.setHover(obj ? stack.idOf(obj) : null); },
    pick(obj) { const id = obj ? stack.idOf(obj) : null; stack.select(id); api.emit('pick', { id }); },
    on(name, payload) {
      if (name === 'form') stack.sync(payload.form, payload.events || []);
      if (name === 'select') stack.select(payload.id);
    },
    dispose() { stack.dispose(); },
  };
}
