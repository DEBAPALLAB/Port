import { createStack } from './superformsStack.js';
import { initialForm, runPipeline, PRESETS } from './superformsModel.js';

export const options = { frame: 3.6, fov: 26, startYaw: -.34, startPitch: .16, yaw: [-.85, .55], pitch: [-.04, .42], floor: -3.45, shadow: .16, height: 1.1, ambient: false };
const sequence = ['order', 'edit', 'design'].map(id => PRESETS.find(p => p.id === id));

export default function setup(api) {
  const stack = createStack(api, { pace: 1.5, stagger: true });
  let form = initialForm(), step = 0, clock = 0, pending = null, paused = api.reducedMotion;
  stack.sync(form);
  api.emit('ready');
  const reset = () => { form = initialForm(); step = 0; clock = 0; pending = null; stack.sync(form); api.emit('reset'); api.kick(1.5); };
  const play = () => {
    if (step === sequence.length) { reset(); return; }
    const preset = sequence[step];
    const result = runPipeline(form, preset.text, true);
    pending = { result, delay: api.reducedMotion ? 0 : .24 };
    api.emit('instruction', { text: preset.text, beat: preset.id });
    step++; clock = 0; api.kick(3.1);
  };
  const commit = () => {
    form = pending.result.form;
    stack.sync(form, pending.result.events);
    api.emit('edit', { text: sequence[step - 1].text, beat: sequence[step - 1].id, counts: pending.result.counts, ids: form.questions.map(q => q.id) });
    pending = null;
  };
  return {
    update(dt, state) {
      if (pending) { pending.delay -= dt; if (pending.delay <= 0) commit(); }
      if (!paused && state.visible && !state.dragging) { clock += dt; if (!pending && clock > (step === 0 ? 1.25 : 3.15)) play(); }
      return stack.update(dt, state) || !!pending || (!paused && state.visible);
    },
    hover(obj) { stack.setHover(obj ? stack.idOf(obj) : null); },
    pick() { if (!pending) play(); },
    on(name, payload) {
      if (name === 'next' && !pending) play();
      if (name === 'pause') { paused = !!payload; api.kick(.2); }
      if (name === 'replay') reset();
    },
    dispose() { stack.dispose(); },
  };
}
