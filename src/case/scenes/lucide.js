// The studio as a workshop press: a paper brief slides in, the press comes down, a ceramic browser tile comes out.
// Four kinds of client re-print the brief and the finished site. Click anything to run the press again.
export const options = { frame: 4.4, fov: 28, height: 1.2, target: [0, 1.15, 0], startYaw: -.38, startPitch: .5, yaw: [-.85, .7], pitch: [.18, .75], floor: -.36, shadow: .17 };

const ease = {
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t,
  inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (cur, target, k, dt) => cur + (target - cur) * (1 - Math.exp(-k * dt));
const INK = '#30312e', PAPER = '#fffdf8', STONE = '#ebe8e1', ACCENT = '#ed5939', MUTED = '#8a877f', BLUSH = '#ffded3';

const KINDS = {
  exporter: { title: 'Export catalogue', url: 'exporter.in', brief: ['Buyers abroad must', 'trust us before they write.'] },
  shop: { title: 'Online shop', url: 'herbal-shop.in', brief: ['Sell our herbal range', 'and let us edit prices.'] },
  restaurant: { title: 'Table ordering', url: 'cafe.app/table/4', brief: ['Guests scan a table,', 'staff see the order.'] },
  startup: { title: 'Product site', url: 'product.io', brief: ['Explain the product', 'before the first call.'] },
};

function bar(ctx, x, y, w, h, color, r = 6) { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }

function drawBrief(ctx, w, h, kind) {
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = INK; ctx.font = '600 50px "Manrope Variable", sans-serif'; ctx.fillText('The brief', 62, 104);
  ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(w - 74, 84, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = INK; ctx.font = '500 44px "Manrope Variable", sans-serif';
  KINDS[kind].brief.forEach((line, i) => ctx.fillText(line, 62, 240 + i * 62));
  ctx.strokeStyle = ACCENT; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(62, 394); ctx.bezierCurveTo(190, 370, 250, 424, 420, 388); ctx.stroke();
  [[62, 470, 560], [62, 512, 470], [62, 554, 330]].forEach(([x, y, bw]) => bar(ctx, x, y, bw, 14, STONE, 7));
}

function drawTile(ctx, w, h, kind) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = STONE; ctx.fillRect(0, 0, w, 54);
  [0, 1, 2].forEach(i => { ctx.fillStyle = '#d3cec4'; ctx.beginPath(); ctx.arc(34 + i * 26, 27, 8, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = MUTED; ctx.font = '500 22px "Manrope Variable", sans-serif'; ctx.fillText(KINDS[kind].url, 140, 35);
  const top = 54;
  if (kind === 'exporter') {
    bar(ctx, 50, top + 44, 470, 34, INK, 8); bar(ctx, 50, top + 96, 340, 34, INK, 8);
    bar(ctx, 50, top + 156, 420, 14, STONE, 7); bar(ctx, 50, top + 184, 300, 14, STONE, 7);
    bar(ctx, 50, top + 226, 190, 44, ACCENT, 22);
    [0, 1, 2].forEach(i => bar(ctx, 560 + i * 110, top + 52, 94, 120, '#f6f4ef', 10));
    ctx.font = '600 20px "Manrope Variable", sans-serif'; ctx.fillStyle = MUTED; ctx.fillText('Certified by', 50, top + 330);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 3 === 0 ? BLUSH : STONE; ctx.beginPath(); ctx.arc(80 + i * 92, top + 394, 30, 0, Math.PI * 2); ctx.fill(); }
  } else if (kind === 'shop') {
    ctx.fillStyle = BLUSH; ctx.beginPath(); ctx.arc(250, top + 220, 170, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.roundRect(210, top + 120, 80, 200, 28); ctx.fill();
    bar(ctx, 500, top + 70, 360, 34, INK, 8); bar(ctx, 500, top + 120, 270, 34, INK, 8);
    bar(ctx, 500, top + 184, 340, 14, STONE, 7); bar(ctx, 500, top + 212, 260, 14, STONE, 7);
    bar(ctx, 500, top + 260, 200, 48, ACCENT, 24);
    [0, 1, 2].forEach(i => { bar(ctx, 500 + i * 128, top + 350, 112, 100, '#f6f4ef', 12); });
  } else if (kind === 'restaurant') {
    bar(ctx, 50, top + 50, 300, 300, '#f6f4ef', 14);
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) if (rnd() > .46 || (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7)) { ctx.fillStyle = INK; ctx.fillRect(76 + x * 22, top + 76 + y * 22, 18, 18); }
    ctx.fillStyle = INK; ctx.font = '600 34px "Manrope Variable", sans-serif'; ctx.fillText('Table 4', 50, top + 410);
    [0, 1, 2, 3].forEach(i => { bar(ctx, 410, top + 54 + i * 76, 330, 22, INK, 8); bar(ctx, 410, top + 90 + i * 76, 220, 12, STONE, 6); bar(ctx, 770, top + 60 + i * 76, 60, 22, STONE, 8); });
    bar(ctx, 410, top + 376, 420, 56, ACCENT, 28);
  } else {
    ctx.fillStyle = INK; ctx.fillRect(0, top, w, 300);
    bar(ctx, 50, top + 56, 520, 44, '#f6f4ef', 10); bar(ctx, 50, top + 116, 400, 44, '#f6f4ef', 10);
    bar(ctx, 50, top + 190, 360, 14, '#8a877f', 7); bar(ctx, 50, top + 218, 260, 14, '#8a877f', 7);
    bar(ctx, 50, top + 252, 180, 14, ACCENT, 7);
    bar(ctx, 620, top + 56, 250, 200, '#45463f', 18); bar(ctx, 650, top + 86, 190, 24, ACCENT, 12); bar(ctx, 650, top + 130, 140, 14, '#8a877f', 7);
    [0, 1, 2].forEach(i => bar(ctx, 50 + i * 290, top + 330, 262, 120, '#f6f4ef', 14));
  }
}

export default function setup(api) {
  const { THREE, root, materials, roundedBox, interactive, canvasTexture } = api;
  let kind = 'exporter';

  // Table with a recessed track.
  const table = new THREE.Mesh(roundedBox(9.4, .36, 3.9, .12), materials.ceramic(0xdcd7cb));
  table.position.y = -.18; table.castShadow = table.receiveShadow = true; root.add(table);
  const track = new THREE.Mesh(roundedBox(8.6, .02, 1.9, .01, 2), materials.ceramic(0xc5bfb2));
  track.position.y = .005; track.receiveShadow = true; root.add(track);

  // Press frame.
  const press = new THREE.Group(); root.add(press);
  [-1.55, 1.55].forEach(z => {
    const post = new THREE.Mesh(roundedBox(.36, 3.1, .36, .1), materials.ceramic(0xe9e5dc));
    post.position.set(0, 1.55, z); post.castShadow = true; press.add(post);
  });
  const cross = new THREE.Mesh(roundedBox(.62, .42, 3.5, .12), materials.accent());
  cross.position.y = 3.05; cross.castShadow = true; press.add(cross);
  const headGroup = new THREE.Group(); press.add(headGroup);
  const head = new THREE.Mesh(roundedBox(2.7, .5, 1.95, .08), materials.ink());
  head.castShadow = true; headGroup.add(head);
  const stemGeo = new THREE.CylinderGeometry(.13, .13, 1, 24);
  const stem = new THREE.Mesh(stemGeo, materials.metal(0xd9d6cf)); stem.castShadow = true; press.add(stem);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.2, 24, 16), materials.accent()); knob.position.set(0, 3.45, 0); knob.castShadow = true; press.add(knob);

  // Inbox stack of blank briefs, left.
  for (let i = 0; i < 3; i++) {
    const blank = new THREE.Mesh(roundedBox(2.3, .03, 1.6, .01, 1), materials.paper());
    blank.position.set(-3.55, .02 + i * .035, 0); blank.rotation.y = (i - 1) * .06; blank.castShadow = blank.receiveShadow = true; root.add(blank);
  }

  // The brief sheet (printed on top).
  const briefTex = canvasTexture(920, 640, (ctx, w, h) => drawBrief(ctx, w, h, kind));
  const paperSide = materials.paper(), paperTop = materials.paper(0xffffff); paperTop.map = briefTex; paperTop.color.set(0xffffff);
  const sheetGroup = new THREE.Group();
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(2.3, .03, 1.6), [paperSide, paperSide, paperTop, paperSide, paperSide, paperSide]);
  sheet.castShadow = sheet.receiveShadow = true; sheetGroup.add(sheet); root.add(sheetGroup);

  // The finished site: a ceramic tile with a printed browser face.
  const tileTex = canvasTexture(920, 600, (ctx, w, h) => drawTile(ctx, w, h, kind));
  const tileGroup = new THREE.Group();
  const tileBody = new THREE.Mesh(roundedBox(2.5, .2, 1.72, .09), materials.ceramic());
  tileBody.position.y = .1; tileBody.castShadow = tileBody.receiveShadow = true; tileGroup.add(tileBody);
  const faceMat = new THREE.MeshStandardMaterial({ map: tileTex, roughness: .5 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.5), faceMat);
  face.rotation.x = -Math.PI / 2; face.position.y = .202; face.receiveShadow = true; tileGroup.add(face);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 12), materials.accent()); dot.scale.y = .35; dot.position.set(1.05, .2, .8); tileGroup.add(dot);
  tileGroup.visible = false; root.add(tileGroup);

  // Station plates that light up as the process passes: three small ceramic discs along the front.
  const plates = [-2.6, 0, 2.6].map(x => {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .05, 32), materials.ceramic(0xb9b3a6));
    disc.position.set(x, .025, 1.55); disc.receiveShadow = true; root.add(disc); return disc;
  });
  const lit = materials.accent(), unlit = plates[0].material;

  const run = { t: 99, hadTile: false, announced: false };
  const lift = { sheet: 0, tile: 0, press: 0 };
  const D = 3.4;

  function start(delay = 0) { run.t = -delay; run.hadTile = tileGroup.visible; run.announced = false; sheetGroup.visible = true; api.kick(D + delay + .3); }
  function emitDone() { api.emit('pressed', { kind, title: KINDS[kind].title }); }

  function pose(dt) {
    const t = run.t;
    let tileScale = 1;
    if (run.hadTile && t < .4) tileScale = 1 - ease.inOut(clamp(t / .4));
    else if (t < 1.55) tileGroup.visible = false;
    // Sheet slides in.
    const si = clamp(t / .9);
    sheetGroup.position.set(lerp(-3.55, 0, ease.out(si)), .1 + .55 * (1 - ease.out(si)) * (1 - si * .2) + lift.sheet, 0);
    sheetGroup.rotation.y = lerp(-.25, 0, ease.out(si));
    sheetGroup.visible = t < 1.55;
    // Head down / up.
    let bottom;
    if (t < 1.65) bottom = lerp(1.9, .05, ease.in(clamp((t - .9) / .55)));
    else bottom = lerp(.05, 1.9, ease.out(clamp((t - 1.65) / .7)));
    // Tile is born, then slides to the tray.
    if (t >= 1.55) {
      tileGroup.visible = true;
      const born = clamp((t - 1.55) / .45);
      const ty = lerp(.12, 1, ease.back(born));
      const ts = clamp((t - 2.05) / 1.1);
      tileGroup.scale.set(1, ty * tileScale, 1);
      tileGroup.position.set(3.05 * ease.inOut(ts), lift.tile, 0);
      tileGroup.rotation.y = -.22 * ease.inOut(ts);
      bottom = Math.max(bottom, .2 * ty * (t < 2.1 ? 1 : 0) + .02);
    } else if (run.hadTile && t < .4) {
      tileGroup.scale.set(1, tileScale, 1);
    }
    const headY = bottom + .25;
    headGroup.position.y = headY;
    const stemTop = 2.84, stemBottom = headY + .25;
    stem.position.y = (stemTop + stemBottom) / 2; stem.scale.y = Math.max(.01, stemTop - stemBottom);
    knob.position.y = 3.45 + (bottom < .5 ? -.06 : 0) + lift.press * .5;
    // Stations: process lights.
    plates[0].material = t > .2 ? lit : unlit; plates[1].material = t > 1.0 ? lit : unlit; plates[2].material = t > 2.2 ? lit : unlit;
    if (!run.announced && t > 2.4) { run.announced = true; emitDone(); }
  }

  const pickables = { sheet: sheetGroup, tile: tileGroup, press };
  const onPick = () => { if (run.t > D * .6) start(); };
  [sheetGroup, tileGroup, press].forEach(obj => { obj.userData.onPick = onPick; interactive.push(obj); });

  start(.5);

  return {
    update(dt) {
      let busy = false;
      if (run.t < D) { run.t += dt; busy = true; pose(dt); } else if (run.t < 90) { run.t = 99; pose(dt); }
      const h = api.state.hovered;
      for (const key of ['sheet', 'tile', 'press']) {
        const goal = h === pickables[key] ? (key === 'press' ? .12 : .16) : 0;
        const next = damp(lift[key], goal, 10, dt);
        if (Math.abs(next - goal) > .002) busy = true;
        lift[key] = next;
      }
      if (run.t >= 90) pose(dt);
      return busy;
    },
    on(name, payload) {
      if (name === 'kind' && KINDS[payload]) {
        kind = payload; briefTex.redraw(); tileTex.redraw(); start(.05);
      }
      if (name === 'press') start();
    },
    hover(obj) { api.invalidate(); },
    pick() {},
    dispose() {},
  };
}
