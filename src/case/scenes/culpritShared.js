// Shared building blocks for the Culprit scenes: a codebase made of ceramic parts.
// A file is a plinth, a function is a stack of slabs, one slab per line.
export const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

export const SLAB = .085, GAP = .014;

export function drawFileTop(ctx, w, h, name, seed) {
  const r = rng(seed);
  ctx.fillStyle = '#f0ede5'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#30312e'; ctx.globalAlpha = .72;
  ctx.font = '600 38px "Manrope Variable", sans-serif'; ctx.fillText(name, 34, 64);
  ctx.globalAlpha = 1;
  for (let row = 0; row < 14; row++) {
    const y = 104 + row * 30, indent = Math.floor(r() * 3) * 26, length = 70 + r() * (w - 190 - indent);
    ctx.fillStyle = row % 5 === 2 ? '#d2ccc0' : '#e0dbcf';
    ctx.beginPath(); ctx.roundRect(34 + indent, y, length, 12, 6); ctx.fill();
  }
}

// Geometry cache keyed by quantised size so a hundred slabs share a dozen geometries.
export function createParts(api) {
  const { THREE, materials, roundedBox } = api;
  const geometries = new Map();
  const box = (w, h, d, r = .018) => {
    const key = `${w.toFixed(2)}|${h.toFixed(3)}|${d.toFixed(2)}`;
    if (!geometries.has(key)) geometries.set(key, roundedBox(w, h, d, Math.min(r, h * .4), 2));
    return geometries.get(key);
  };
  const mats = {
    plinth: materials.ceramic(0xe8e4db),
    slabs: [materials.ceramic(0xf7f4ed), materials.ceramic(0xfffdf8), materials.ceramic(0xefe9df)],
    ink: materials.ink(),
    accent: materials.accent(),
    blush: materials.ceramic(0xffded3),
  };
  mats.slabs.forEach(m => { m.roughness = .4; m.clearcoat = .35; });

  // One function: a stack of slabs with left-aligned lengths, like lines of code.
  // gapAt removes a slab (an absence); pass `ink` slab indexes for charcoal accents.
  function stack({ w, d, n, seed, gapAt = -1, ink = [], blush = [] }) {
    const r = rng(seed), group = new THREE.Group(), slabs = [];
    for (let i = 0; i < n; i++) {
      if (i === gapAt) continue;
      const sw = Math.max(.24, Math.round((w * (.58 + r() * .42)) / .05) * .05);
      const material = ink.includes(i) ? mats.ink : blush.includes(i) ? mats.blush : mats.slabs[Math.floor(r() * 3)];
      const mesh = new THREE.Mesh(box(sw, SLAB, d), material);
      mesh.position.set((sw - w) / 2, SLAB / 2 + i * (SLAB + GAP), 0);
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.userData.index = i;
      group.add(mesh); slabs.push(mesh);
    }
    group.userData = { w, d, n, height: n * (SLAB + GAP), slabs };
    return group;
  }

  function plinth(name, seed, w, d) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(box(w, .14, d, .05), mats.plinth);
    base.position.y = .07; base.castShadow = true; base.receiveShadow = true;
    const texture = api.canvasTexture(512, Math.round(512 * d / w), (ctx, tw, th) => drawFileTop(ctx, tw, th, name, seed));
    const top = new THREE.Mesh(new THREE.PlaneGeometry(w - .12, d - .12), new THREE.MeshStandardMaterial({ map: texture, roughness: .9 }));
    top.rotation.x = -Math.PI / 2; top.position.y = .1405; top.receiveShadow = true;
    group.add(base, top);
    return group;
  }
  return { box, mats, stack, plinth };
}
