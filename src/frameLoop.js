// One demand-render queue. Visibility pauses the simulation clock, not just painting.
export function createFrameLoop({ draw, step, request = requestAnimationFrame, cancel = cancelAnimationFrame }) {
  let frame = 0, running = false, visible = true, destroyed = false, previous = null;
  function invalidate() {
    if (!destroyed && visible && !frame) frame = request(tick);
  }
  function tick(now) {
    frame = 0;
    if (destroyed || !visible) return;
    if (running) {
      const delta = previous === null ? 0 : Math.max(0, Math.min((now - previous) / 1000, .05));
      previous = now;
      running = step(delta) !== false;
    }
    draw();
    if (running) invalidate();
  }
  return {
    invalidate,
    start() { if (!running) previous = null; running = true; invalidate(); },
    stop() { running = false; previous = null; },
    setVisible(value) {
      visible = value; previous = null;
      if (!value) { cancel(frame); frame = 0; }
      else invalidate();
    },
    destroy() { destroyed = true; running = false; cancel(frame); frame = 0; },
  };
}
