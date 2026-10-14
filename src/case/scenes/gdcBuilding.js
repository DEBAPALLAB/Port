import { WINGS, TASKS } from './gdcData.js';

// A ceramic model of the institution. Each floor is an audience, each plaque on a roof is a page.
// Floors lift apart to show the plaques; a route lights the door, a floor, a page and draws a cable between them.
const SLAB = .5, HOME_H = 1.15, GAP = .64, Y0 = -3.3;
const AMBER = 0xe0900f, AMBER_DEEP = 0xa86400, NAVY = 0x14274e, GLASS = 0x2b3a5c;
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function archShape(THREE, w, h, base = 0) {
  const s = new THREE.Shape(), hw = w / 2, rise = h - hw;
  s.moveTo(-hw, base); s.lineTo(hw, base); s.lineTo(hw, rise); s.absarc(0, rise, hw, 0, Math.PI, false); s.lineTo(-hw, base);
  return s;
}
function archPath(THREE, w, h) {
  const p = new THREE.Path(), hw = w / 2, rise = h - hw;
  p.moveTo(-hw, 0); p.lineTo(-hw, rise); p.absarc(0, rise, hw, Math.PI, 0, true); p.lineTo(hw, 0); p.lineTo(-hw, 0);
  return p;
}
function wrap(ctx, text, maxWidth) {
  const words = text.split(' '), lines = []; let line = '';
  for (const word of words) { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test; }
  if (line) lines.push(line);
  return lines;
}

export function createInstitution(api, { taskTiles = null } = {}) {
  const { THREE, root, materials, roundedBox, canvasTexture, interactive } = api;
  const group = new THREE.Group(); root.add(group);
  const amber = new THREE.Color(AMBER);

  // Plinth
  const plinth = new THREE.Mesh(roundedBox(7.2, .32, 3.9, .1), materials.ceramic(0xe6e2da));
  plinth.position.y = Y0 - .17; plinth.receiveShadow = true; plinth.castShadow = true; group.add(plinth);

  // Side windows are shared by every floor.
  const sideTex = canvasTexture(512, 128, (ctx, w, h) => {
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#2b3a5c'; ctx.beginPath(); ctx.roundRect(30 + i * 118, 18, 84, 92, 12); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(30 + i * 118, 18, 84, 14); }
  });
  const sideMat = new THREE.MeshStandardMaterial({ map: sideTex, transparent: true, roughness: .5 });

  const facade = (ctx, w, h, wing, lit, home) => {
    ctx.fillStyle = lit ? '#a86400' : '#30312e';
    ctx.font = `700 ${home ? 74 : 84}px "Manrope Variable"`; ctx.textBaseline = 'middle';
    const label = home ? 'GDC Dibrugarh' : wing.label;
    ctx.fillText(label, 54, h / 2 - (home ? 0 : 2));
    const labelW = ctx.measureText(label).width;
    if (!home) { ctx.font = '600 44px "Manrope Variable"'; ctx.fillStyle = lit ? '#a86400' : '#6b6a64'; ctx.fillText(`${wing.pages.length} pages`, 54 + labelW + 36, h / 2 + 4); }
    const start = home ? 1450 : 900;
    for (let x = start; x < w - 90; x += 118) {
      ctx.fillStyle = lit ? '#f4b93f' : '#2b3a5c'; ctx.beginPath(); ctx.roundRect(x, 24, 82, h - 48, 14); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(x, 24, 82, 12);
    }
  };

  const floors = WINGS.map((wing, i) => {
    const home = i === 0, h = home ? HOME_H : SLAB, w = 6 - i * .15, d = 2.7 - i * .05;
    const g = new THREE.Group(); g.userData = { kind: 'floor', wing: wing.id };
    const mat = materials.ceramic(i % 2 ? 0xf1ede4 : 0xf7f4ed); mat.emissive = new THREE.Color(AMBER); mat.emissiveIntensity = 0;
    const slab = new THREE.Mesh(roundedBox(w, h, d, .1), mat); slab.position.y = h / 2; slab.castShadow = true; slab.receiveShadow = true; g.add(slab);
    const tex = canvasTexture(2048, 160, (ctx, cw, ch, lit = false) => facade(ctx, cw, ch, wing, lit, home));
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w - .4, h - .16), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .5 }));
    plane.position.set(0, h / 2 + (home ? 0 : 0), d / 2 + .012); g.add(plane);
    for (const s of [-1, 1]) { const side = new THREE.Mesh(new THREE.PlaneGeometry(d - .5, Math.min(.6, h - .2)), sideMat); side.rotation.y = s * Math.PI / 2; side.position.set(s * (w / 2 + .012), h / 2, 0); g.add(side); }
    const floor = { wing, index: i, group: g, mat, tex, h, w, d, hover: 0, hoverT: 0, pull: 0, pullT: 0, lit: 0, litT: 0, litDrawn: false, tiles: [] };
    g.userData.floor = floor;

    wing.pages.forEach((page, k) => {
      const n = wing.pages.length, pitch = Math.min(1.34, (w - .5) / n), tw = Math.min(1.14, pitch - .1);
      const t = new THREE.Group(); t.userData = { kind: 'tile', wing: wing.id, page: page.id, floor };
      const key = `${wing.id}/${page.id}`, isTask = !taskTiles || taskTiles.has(key);
      const body = roundedBox(tw, .64, .09, .04, 3); body.translate(0, .32, 0);
      const bodyMat = materials.paper(); bodyMat.emissive = new THREE.Color(AMBER); bodyMat.emissiveIntensity = 0;
      const mesh = new THREE.Mesh(body, bodyMat); mesh.castShadow = true; t.add(mesh);
      const ttex = canvasTexture(512, 288, (ctx, cw, ch, lit = false) => {
        ctx.fillStyle = lit ? '#e0900f' : '#fffdf8'; ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = lit ? '#fff' : '#30312e'; ctx.font = '700 58px "Manrope Variable"'; ctx.textBaseline = 'top';
        const lines = wrap(ctx, page.title, cw - 70).slice(0, 3);
        lines.forEach((line, li) => ctx.fillText(line, 36, 30 + li * 64));
        ctx.font = '600 34px "Manrope Variable"'; ctx.fillStyle = lit ? '#fff' : '#6b6a64'; ctx.textBaseline = 'alphabetic';
        ctx.fillText(page.path.length > 24 ? page.path.slice(0, 23) + '…' : page.path, 36, ch - 28);
        if (isTask && taskTiles) { ctx.fillStyle = lit ? '#fff' : '#e0900f'; ctx.beginPath(); ctx.arc(cw - 46, 46, 18, 0, 7); ctx.fill(); }
      });
      const face = new THREE.Mesh(new THREE.PlaneGeometry(tw - .06, .58), new THREE.MeshBasicMaterial({ map: ttex, toneMapped: false }));
      face.position.set(0, .32, .048); t.add(face);
      t.position.set((k - (n - 1) / 2) * pitch, h - .02, d / 2 - .5); t.rotation.x = -.3;
      g.add(t);
      const tile = { group: t, page, key, mat: bodyMat, tex: ttex, hover: 0, hoverT: 0, lit: 0, litT: 0, litDrawn: false, x: t.position.x, z: t.position.z, reveal: 0 };
      t.userData.tile = tile; floor.tiles.push(tile);
      if (isTask) interactive.push(t);
    });
    group.add(g);
    interactive.push(g);
    return floor;
  });

  // Entrance: an extruded arch, an amber door and two steps, on the Home floor.
  const home = floors[0];
  const doorGroup = new THREE.Group(); doorGroup.position.set(0, 0, home.d / 2);
  const outer = archShape(THREE, 1.3, 1.02, -.02); outer.holes.push(archPath(THREE, .86, .9));
  const frameGeo = new THREE.ExtrudeGeometry(outer, { depth: .16, bevelEnabled: true, bevelThickness: .035, bevelSize: .035, bevelSegments: 3, curveSegments: 24 });
  const frame = new THREE.Mesh(frameGeo, materials.ceramic(0xfffdf8)); frame.position.z = .02; frame.castShadow = true; doorGroup.add(frame);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x1e2c4d, roughness: .5, emissive: amber, emissiveIntensity: 0 });
  const panel = new THREE.Mesh(new THREE.ShapeGeometry(archShape(THREE, .86, .9), 24), doorMat); panel.position.z = .012; doorGroup.add(panel);
  for (let s = 0; s < 2; s++) { const step = new THREE.Mesh(roundedBox(1.7 + s * .5, .07, .34, .03), materials.ceramic(0xe6e2da)); step.position.set(0, .035, .4 + s * .26); step.castShadow = true; step.receiveShadow = true; doorGroup.add(step); }
  home.group.add(doorGroup);
  const door = { lit: 0, litT: 0, mat: doorMat };

  // Crown on the top floor: a lathe dome and a finial.
  const top = floors[floors.length - 1];
  const profile = [[0, 0], [.55, 0], [.57, .07], [.5, .22], [.36, .4], [.18, .55], [.05, .62], [0, .63]].map(([x, y]) => new THREE.Vector2(x, y));
  const dome = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), materials.accent(NAVY)); dome.position.set(0, top.h, -.5); dome.castShadow = true; top.group.add(dome);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(.07, 20, 14), materials.accent(AMBER)); finial.position.set(0, top.h + .68, -.5); top.group.add(finial);

  // Route cable
  const cableMat = new THREE.MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: .7, roughness: .4 });
  let cable = null, cableSeg = 90, route = null, routeT = 0, lastOpen = -1;
  const SEG = { tubular: 90, radial: 8 };

  function clearRoute() {
    route = null; routeT = 0; door.litT = 0;
    floors.forEach(f => { f.litT = 0; f.pullT = 0; f.tiles.forEach(t => { t.litT = 0; }); });
    if (cable) { group.remove(cable); cable.geometry.dispose(); cable = null; }
  }
  function setRoute(wingId, pageId) {
    clearRoute();
    const j = floors.findIndex(f => f.wing.id === wingId); if (j < 1) return;
    const f = floors[j], tile = f.tiles.find(t => t.page.id === pageId); if (!tile) return;
    let y = Y0; const ys = floors.map(fl => { const v = y; y += fl.h + GAP; return v; });
    const side = tile.x >= 0 ? 1 : -1, W = f.w / 2 + .55;
    const tz = tile.z + .85, ty = ys[j] + f.h;
    const pts = [
      new THREE.Vector3(0, Y0 + .1, home.d / 2 + 1.05),
      new THREE.Vector3(side * W * .5, Y0 + .55, home.d / 2 + 1.5),
      new THREE.Vector3(side * W, ys[1] + .2, home.d / 2 + 1.5),
      new THREE.Vector3(side * W, ty - .1, tz + .9),
      new THREE.Vector3(tile.x + side * .3, ty + .75, tz + .7),
      new THREE.Vector3(tile.x, ty + .62, tz + .22),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    cable = new THREE.Mesh(new THREE.TubeGeometry(curve, SEG.tubular, .05, SEG.radial, false), cableMat);
    cable.geometry.setDrawRange(0, 0); group.add(cable);
    route = { floor: f, tile }; routeT = 0;
    api.kick(2.6);
  }

  let hoverFloor = null, hoverTile = null;
  function hover(obj) {
    if (hoverFloor) hoverFloor.hoverT = 0; if (hoverTile) hoverTile.hoverT = 0;
    hoverFloor = hoverTile = null;
    if (!obj) return;
    if (obj.userData.kind === 'tile') { hoverTile = obj.userData.tile; hoverTile.hoverT = 1; hoverFloor = obj.userData.floor; hoverFloor.hoverT = .6; }
    else if (obj.userData.kind === 'floor') { hoverFloor = obj.userData.floor; hoverFloor.hoverT = 1; }
  }

  function redrawIfNeeded(item, lit, args) { const on = lit > .5; if (on !== item.litDrawn) { item.litDrawn = on; item.tex.redraw(on); } }

  // One frame. `open` 0 = assembled, 1 = pulled apart. Returns true while anything is still moving.
  function step(dt, open, { pullSelected = true } = {}) {
    let busy = Math.abs(open - lastOpen) > .0004; lastOpen = open;
    if (route) {
      routeT += dt;
      door.litT = routeT > .05 ? 1 : 0;
      route.floor.litT = routeT > .6 ? 1 : 0; if (pullSelected) route.floor.pullT = routeT > .6 ? 1 : 0;
      route.tile.litT = routeT > 1.15 ? 1 : 0; route.tile.hoverT = Math.max(route.tile.hoverT, routeT > 1.15 ? .7 : 0);
      const p = smooth(0, 1.25, routeT);
      cable.geometry.setDrawRange(0, Math.floor(p * SEG.tubular) * SEG.radial * 6);
      if (routeT < 1.6) busy = true;
    }
    let y = Y0;
    floors.forEach(f => {
      const hv = f.hover, pl = f.pull, lt = f.lit;
      f.hover = damp(f.hover, f.hoverT, 10, dt); f.pull = damp(f.pull, f.pullT, 7, dt); f.lit = damp(f.lit, f.litT, 9, dt);
      f.group.position.set(0, y + f.hover * .15, f.pull * .85);
      y += f.h + GAP * open;
      f.mat.emissiveIntensity = f.lit * .42;
      redrawIfNeeded(f, f.lit);
      const reveal = smooth(.3, .85, open);
      f.tiles.forEach(t => {
        const ht = t.hover; t.hover = damp(t.hover, t.hoverT, 12, dt); t.lit = damp(t.lit, t.litT, 9, dt);
        t.reveal = reveal;
        const s = Math.max(.001, reveal); t.group.scale.setScalar(s);
        t.group.position.y = f.h - .02 + t.hover * .16;
        t.group.rotation.x = -.3 + t.hover * .1;
        t.mat.emissiveIntensity = t.lit * .35; redrawIfNeeded(t, t.lit);
        if (Math.abs(t.hover - t.hoverT) > .002 || Math.abs(t.lit - t.litT) > .002) busy = true;
      });
      if (Math.abs(f.hover - f.hoverT) > .002 || Math.abs(f.pull - f.pullT) > .002 || Math.abs(f.lit - f.litT) > .002) busy = true;
    });
    door.lit = damp(door.lit, door.litT, 8, dt); door.mat.emissiveIntensity = door.lit * 1.1;
    if (Math.abs(door.lit - door.litT) > .002) busy = true;
    return busy;
  }

  return { floors, step, hover, setRoute, clearRoute, group, smooth };
}

export { WINGS, TASKS };
