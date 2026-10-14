// Luman: five tool tiles laid out as a classic dashboard, lifted into an OS-shell arrangement ("Godmode").
// Messages in: 'mode' ('classic' | 'godmode' | 'scroll'). Messages out: 'hover' (tile key | null), 'pick' (tile key), 'mode' (0|1).
export const options = { frame: 4.5, fov: 28, height: .2, startYaw: -.18, startPitch: .04, yaw: [-.5, .5], pitch: [-.14, .2], floor: null, shadow: 0 };

const YELLOW = '#ffcc00', CREAM = '#fdfbf7', BLACK = '#111111';
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const TOOLS = [
  { key: 'docs', title: 'DOCS', w: 3.6, h: 2.6, classic: [-2.7, .95, 0], god: [-3.5, .9, 1.9, .42] },
  { key: 'tasks', title: 'TASKS', w: 2.6, h: 2.6, classic: [.6, .95, 0], god: [-.1, 1.9, -.7, 0] },
  { key: 'calendar', title: 'CALENDAR', w: 2.4, h: 2.6, classic: [3.3, .95, 0], god: [3.7, .8, 1.4, -.5] },
  { key: 'chat', title: 'CHAT', w: 4.4, h: 2.2, classic: [-2.3, -1.65, 0], god: [-2.3, -1.6, 3, .28] },
  { key: 'whiteboard', title: 'WHITEBOARD', w: 4.4, h: 2.2, classic: [2.3, -1.65, 0], god: [2.7, -1.5, 2.2, -.3] },
];

function drawFace(ctx, W, H, tool) {
  const u = W / (tool.w * 100);
  ctx.fillStyle = CREAM; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = BLACK; ctx.lineWidth = 7 * u; ctx.strokeRect(3.5 * u, 3.5 * u, W - 7 * u, H - 7 * u);
  const bar = 44 * u;
  ctx.fillStyle = YELLOW; ctx.fillRect(7 * u, 7 * u, W - 14 * u, bar);
  ctx.fillStyle = BLACK; ctx.fillRect(7 * u, 7 * u + bar, W - 14 * u, 4 * u);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc((28 + i * 26) * u, 7 * u + bar / 2, 8 * u, 0, 7); ctx.fill(); });
  ctx.fillStyle = BLACK; ctx.font = `800 ${19 * u}px "Manrope Variable"`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText(tool.title, W - 24 * u, 7 * u + bar / 2 + 1); ctx.textAlign = 'left';
  const x0 = 28 * u, y0 = 90 * u, bw = W - 56 * u;
  const line = (y, w, c = '#c9c5bb') => { ctx.fillStyle = c; ctx.fillRect(x0, y, bw * w, 9 * u); };
  const box = (x, y, w, h, fill = CREAM) => { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); ctx.strokeStyle = BLACK; ctx.lineWidth = 3.5 * u; ctx.strokeRect(x, y, w, h); };
  if (tool.key === 'docs') {
    ctx.fillStyle = BLACK; ctx.font = `800 ${22 * u}px "Manrope Variable"`; ctx.fillText('LAUNCH STRATEGY.MD', x0, y0 + 8 * u);
    line(y0 + 40 * u, .9); line(y0 + 62 * u, .7);
    box(x0 + bw * .42, y0 + 34 * u, 72 * u, 26 * u, YELLOW);
    box(x0, y0 + 98 * u, bw, 34 * u); box(x0, y0 + 144 * u, bw, 34 * u);
    ctx.fillStyle = BLACK; ctx.fillRect(x0 + 8 * u, y0 + 106 * u, 62 * u, 18 * u); ctx.fillRect(x0 + 8 * u, y0 + 152 * u, 92 * u, 18 * u);
    line(y0 + 116 * u, 0); ctx.fillStyle = '#c9c5bb'; ctx.fillRect(x0 + 120 * u, y0 + 112 * u, bw * .55, 9 * u); ctx.fillRect(x0 + 120 * u, y0 + 158 * u, bw * .5, 9 * u);
  } else if (tool.key === 'tasks') {
    [1, 0, 0, 1].forEach((done, i) => {
      const y = y0 + i * 58 * u; box(x0, y, bw, 44 * u);
      box(x0 + 10 * u, y + 11 * u, 22 * u, 22 * u, done ? '#28c840' : CREAM);
      ctx.fillStyle = done ? '#9a968c' : BLACK; ctx.fillRect(x0 + 48 * u, y + 17 * u, bw * (.55 - i * .06), 10 * u);
    });
  } else if (tool.key === 'calendar') {
    const cw = (bw) / 7;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      const hot = (r === 0 && c === 2) || (r === 1 && c === 6) || (r === 3 && c === 3);
      box(x0 + c * cw + 2 * u, y0 + r * 56 * u, cw - 5 * u, 48 * u, hot ? YELLOW : CREAM);
    }
  } else if (tool.key === 'chat') {
    const bub = (y, w, fill, right) => box(right ? x0 + bw * (1 - w) : x0, y, bw * w, 40 * u, fill);
    bub(y0 - 6 * u, .6, CREAM, false); bub(y0 + 46 * u, .5, YELLOW, true);
    ctx.fillStyle = BLACK; ctx.font = `800 ${20 * u}px "Manrope Variable"`; ctx.fillText('@maya', x0 + 16 * u, y0 + 14 * u);
    ctx.fillStyle = '#9a968c'; ctx.fillRect(x0 + bw * .56, y0 + 62 * u, bw * .3, 9 * u);
    box(x0, y0 + 104 * u, bw, 32 * u);
  } else {
    box(x0 + 10 * u, y0 - 6 * u, 100 * u, 80 * u, YELLOW); box(x0 + 140 * u, y0 + 20 * u, 110 * u, 80 * u, '#a7f3d0'); box(x0 + 290 * u, y0 - 4 * u, 90 * u, 80 * u, '#ffb3b3');
    ctx.strokeStyle = BLACK; ctx.lineWidth = 5 * u; ctx.beginPath(); ctx.moveTo(x0 + 112 * u, y0 + 34 * u); ctx.lineTo(x0 + 138 * u, y0 + 58 * u); ctx.moveTo(x0 + 252 * u, y0 + 58 * u); ctx.lineTo(x0 + 288 * u, y0 + 36 * u); ctx.stroke();
  }
}

export default function setup(api, initial = 'scroll') {
  const { THREE, root, materials, roundedBox, canvasTexture, interactive, state } = api;
  const board = new THREE.Mesh(roundedBox(9.9, 5.8, .14, .1), materials.ceramic(0xe6e2da));
  board.position.set(0, -.25, -.22); board.receiveShadow = true; root.add(board);
  const rail = new THREE.Mesh(roundedBox(.62, 5.8, .14, .1), materials.ink());
  rail.position.set(-5.5, -.25, -.22); root.add(rail);

  const tiles = TOOLS.map((tool, i) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(roundedBox(tool.w, tool.h, .2, .06), materials.ceramic(0xf4f1ea));
    body.castShadow = true; body.receiveShadow = true;
    const tex = canvasTexture(Math.round(tool.w * 240), Math.round(tool.h * 240), (ctx, W, H) => drawFace(ctx, W, H, tool));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(tool.w - .04, tool.h - .04), new THREE.MeshStandardMaterial({ map: tex, roughness: .7, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    face.position.z = .112; face.receiveShadow = true;
    g.add(body, face); g.userData = { key: tool.key, lift: 0, pulse: 0 }; g.position.set(...tool.classic);
    root.add(g); interactive.push(g);
    g.userData.onPick = () => { g.userData.pulse = 1; api.emit('pick', tool.key); api.kick(.8); };
    return { tool, g, phase: i * 1.7 };
  });

  // dock: five small blocks that sit in the left rail in classic mode and slide into a pill in Godmode
  const dock = new THREE.Mesh(roundedBox(4.6, .7, .3, .22), materials.ink());
  dock.castShadow = true; root.add(dock);
  const icons = TOOLS.map((tool, i) => {
    const m = new THREE.Mesh(roundedBox(.44, .44, .16, .1), materials.accent(0xffcc00));
    m.castShadow = true; root.add(m); return m;
  });

  // dust burst: one square per grid cell, the same 26 x 16 grid and palette as the real GodModeTransition
  const COLS = 26, ROWS = 16, N = COLS * ROWS;
  const dust = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), N);
  dust.frustumCulled = false; dust.visible = false; root.add(dust);
  const palette = ['#FBBF24', '#A7F3D0', '#F5F1E8', '#111111', '#FDFBF7'].map(c => new THREE.Color(c));
  const seeds = Array.from({ length: N }, (_, i) => {
    const r = Math.floor(i / COLS), c = i % COLS;
    dust.setColorAt(i, palette[Math.floor(Math.random() * palette.length)]);
    return { x: (c / COLS - .5) * 10 + (Math.random() - .5) * .4, y: (.5 - r / ROWS) * 6 - .25 + (Math.random() - .5) * .4, z: 1 + Math.random() * 1.5,
      size: .05 + Math.random() * .09, vx: (Math.random() - .5) * .9, vy: .6 + Math.random() * 1.4, delay: (r / ROWS) * .12 + (c / COLS) * .18 + Math.random() * .16, life: .5 + Math.random() * .35 };
  });
  dust.instanceColor.needsUpdate = true;
  const dummy = new THREE.Object3D();
  let burstAt = -1;

  let mode = initial, m = 0, selected = null, lastSide = 0;
  const start = () => { burstAt = state.time; dust.visible = true; api.kick(1.5); };

  const place = (t, time) => {
    const e = t * t * (3 - 2 * t);
    tiles.forEach(({ tool, g, phase }) => {
      const ud = g.userData;
      const [cx, cy, cz] = tool.classic, [gx, gy, gz, gr] = tool.god;
      const bob = state.reducedMotion ? 0 : Math.sin(time * .9 + phase) * .09 * e;
      g.position.set(cx + (gx - cx) * e, cy + (gy - cy) * e + bob, cz + (gz - cz) * e + ud.lift * .45 + ud.pulse * .25);
      g.rotation.y = gr * e + ud.lift * -.05 * Math.sign(gr || 1);
      g.rotation.x = ud.lift * .05;
      const s = 1 + .08 * e + ud.lift * .03; g.scale.setScalar(s);
    });
    const dockE = smooth(.35, 1, t);
    dock.position.set(0, -3.2 + (1 - dockE) * -.9, 2.8); dock.scale.set(Math.max(dockE, .001), Math.max(dockE, .001), 1);
    icons.forEach((ic, i) => {
      const rx = -5.5, ry = 1.7 - i * .72 - .25, rz = -.05;
      const dx = (i - 2) * .86, dy = -3.2 + (1 - dockE) * -.9, dz = 3.02;
      ic.position.set(rx + (dx - rx) * e, ry + (dy - ry) * e, rz + (dz - rz) * e);
      ic.scale.setScalar(1 - .1 * e);
    });
    const gone = 1 - smooth(0, .55, t);
    board.scale.set(Math.max(gone, .001), Math.max(gone, .001), 1); rail.scale.set(Math.max(gone, .001), Math.max(gone, .001), 1);
    board.visible = rail.visible = gone > .01;
  };
  place(0, 0);

  return {
    update(dt, s) {
      const target = mode === 'classic' ? 0 : mode === 'godmode' ? 1 : smooth(.32, .62, s.progress);
      const side = target > .5 ? 1 : 0;
      if (side !== lastSide) { lastSide = side; start(); api.emit('mode', side); }
      m = damp(m, target, s.reducedMotion ? 40 : 4.2, dt);
      let busy = Math.abs(m - target) > .002;
      tiles.forEach(({ g }) => {
        const ud = g.userData, want = s.hovered === g ? 1 : 0;
        ud.lift = damp(ud.lift, want, 10, dt); ud.pulse = damp(ud.pulse, 0, 6, dt);
        if (Math.abs(ud.lift - want) > .003 || ud.pulse > .003) busy = true;
      });
      place(m, s.time);
      if (burstAt >= 0) {
        const t = s.time - burstAt; let alive = false;
        seeds.forEach((p, i) => {
          const k = t - p.delay; if (k < 0) { dummy.scale.setScalar(0); } else {
            const pr = Math.min(1, k / p.life); if (pr < 1) alive = true;
            const ease = 1 - (1 - pr) ** 3, sc = pr >= 1 ? 0 : p.size * (1 - pr * .6);
            dummy.position.set(p.x + p.vx * ease, p.y + p.vy * ease, p.z); dummy.scale.setScalar(sc);
          }
          dummy.updateMatrix(); dust.setMatrixAt(i, dummy.matrix);
        });
        dust.instanceMatrix.needsUpdate = true;
        if (!alive && t > 1.4) { burstAt = -1; dust.visible = false; } else busy = true;
      }
      return busy || !s.reducedMotion && m > .3;
    },
    on(name, value) {
      if (name === 'mode') { mode = value; api.kick(1.4); }
    },
    hover(obj) { api.emit('hover', obj ? obj.userData.key : null); },
    pick(obj) { if (!obj) api.emit('pick', null); },
    dispose() { dust.dispose?.(); },
  };
}
