// The notice board: the public side of the notice editor. Six cards (the real query is LIMIT 6) and a ticker above.
export const options = { frame: 3.1, fov: 28, height: .8, startYaw: -.28, startPitch: .08, yaw: [-.6, .6], pitch: [-.15, .3], floor: -2.35, shadow: .16 };

const SLOTS = 6, TOP = .92, STEP = .5;
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

export default function setup(api) {
  const { THREE, root, materials, roundedBox, canvasTexture, reducedMotion } = api;
  const board = new THREE.Mesh(roundedBox(4.7, 3.7, .2, .12), materials.ceramic(0xe6e2da)); board.castShadow = true; board.receiveShadow = true; root.add(board);

  const headTex = canvasTexture(1024, 128, (ctx, w, h) => {
    ctx.fillStyle = '#14274e'; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 28); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '700 62px "Manrope Variable"'; ctx.textBaseline = 'middle'; ctx.fillText('Notice Board', 44, h / 2 + 3);
    ctx.fillStyle = '#e0900f'; ctx.beginPath(); ctx.arc(w - 60, h / 2, 14, 0, 7); ctx.fill();
  });
  const head = new THREE.Mesh(new THREE.PlaneGeometry(4.3, .54), new THREE.MeshBasicMaterial({ map: headTex, transparent: true, toneMapped: false }));
  head.position.set(0, 1.46, .11); root.add(head);

  // Ticker rail above the board
  const tickTex = canvasTexture(4096, 80, (ctx, w, h, items = []) => {
    ctx.fillStyle = '#14274e'; ctx.fillRect(0, 0, w, h);
    ctx.font = '600 38px "Manrope Variable"'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
    const text = items.length ? items.join('      •      ') + '      •      ' : 'No scrolling notices are enabled      •      ';
    const tw = ctx.measureText(text).width, n = Math.max(1, Math.floor(w / tw)), period = w / n;
    for (let i = 0; i < n; i++) ctx.fillText(text, i * period, h / 2 + 2);
  });
  tickTex.wrapS = THREE.RepeatWrapping; tickTex.repeat.set(.36, 1);
  const rail = new THREE.Mesh(roundedBox(4.7, .46, .16, .08), materials.ink(0x14274e)); rail.position.set(0, 2.2, 0); rail.castShadow = true; root.add(rail);
  const tick = new THREE.Mesh(new THREE.PlaneGeometry(4.5, .32), new THREE.MeshBasicMaterial({ map: tickTex, toneMapped: false })); tick.position.set(0, 2.2, .09); root.add(tick);

  const cards = Array.from({ length: SLOTS }, (_, k) => {
    const g = new THREE.Group(); g.position.set(0, TOP - k * STEP, .12);
    const mat = materials.paper(); mat.emissive = new THREE.Color(0xe0900f); mat.emissiveIntensity = 0;
    const body = new THREE.Mesh(roundedBox(4.3, .42, .06, .03, 3), mat); body.castShadow = true; g.add(body);
    const tex = canvasTexture(1536, 150, (ctx, w, h, item = null) => {
      ctx.fillStyle = item ? '#fffdf8' : '#f1ede4'; ctx.fillRect(0, 0, w, h);
      if (!item) return;
      ctx.textBaseline = 'middle'; ctx.fillStyle = '#30312e'; ctx.font = '600 46px "Manrope Variable"';
      let title = item.title; const max = w - 330;
      while (ctx.measureText(title).width > max && title.length > 4) title = title.slice(0, -2);
      if (title !== item.title) title = title.trimEnd() + '…';
      ctx.fillText(title, 40, h / 2 + 2);
      ctx.fillStyle = '#6b6a64'; ctx.font = '500 36px "Manrope Variable"'; ctx.textAlign = 'right'; ctx.fillText(item.date, w - 40, h / 2 + 2); ctx.textAlign = 'left';
      if (item.isNew) { ctx.fillStyle = '#e0900f'; ctx.beginPath(); ctx.arc(w - 290, h / 2, 12, 0, 7); ctx.fill(); }
    });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(4.24, .4), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); face.position.z = .034; g.add(face);
    root.add(g);
    return { g, mat, tex, off: 0, pulse: 0, drawn: false };
  });

  let ticker = [], board6 = [];
  function apply(payload) {
    const { ticker: t = [], board: b = [], published = false } = payload;
    tickTex.redraw(t); ticker = t;
    cards.forEach((c, k) => {
      const item = b[k] || null;
      c.tex.redraw(item);
      if (published && !reducedMotion) { c.off = k === 0 ? 2.6 : .5; c.pulse = k === 0 ? 1 : 0; }
      else if (published) c.pulse = k === 0 ? 1 : 0;
    });
    board6 = b;
    api.kick(2.4);
  }
  setTimeout(() => api.emit('ready'), 60);
  return {
    update(dt) {
      let busy = false;
      if (!reducedMotion) { tickTex.offset.x = (tickTex.offset.x + dt * .012) % 1; busy = true; }
      cards.forEach((c, k) => {
        c.off = damp(c.off, 0, 7, dt); c.pulse = damp(c.pulse, 0, 1.6, dt);
        c.g.position.y = TOP - k * STEP + c.off; c.mat.emissiveIntensity = c.pulse * .5;
        if (c.off > .002 || c.pulse > .01) busy = true;
      });
      return busy;
    },
    on(name, payload) { if (name === 'state') apply(payload); },
  };
}
