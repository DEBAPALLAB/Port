import { caseIndex } from '../caseIndex.js';
import { projects } from '../../projects.js';

// Nine case studies as nine standing dominoes. Scroll sets them up; pushing one topples it into its story.
export const options = { frame: 4.6, height: 2.2, target: [0, .55, 0], yaw: [-.35, .35], startYaw: 0, startPitch: .06, pitch: [-.05, .2], floor: -.02, shadow: .16, ambient:false, maxPixelRatio:1.5 };

const W = .92, H = 1.84, D = .26;

function wrap(ctx, text, maxWidth) {
  const words = text.split(' '), lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export default function setup(api) {
  const { THREE, root, roundedBox, materials, canvasTexture, interactive, palette, state, emit, kick, reducedMotion } = api;
  const pieces = [];
  const geometry = roundedBox(W, H, D, .07, 5);
  const body = materials.ceramic(palette.ceramic), bodyHot = materials.accent();
  const count = 9;

  function face(item, hot) {
    return canvasTexture(512, 1024, (ctx, w, h) => {
      ctx.fillStyle = hot ? '#ed5939' : '#fbfaf6'; ctx.fillRect(0, 0, w, h);
      const ink = hot ? '#ffffff' : '#30312e';
      ctx.fillStyle = hot ? '#ffffff' : '#ed5939';
      ctx.beginPath(); ctx.arc(w - 70, 72, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = ink;
      ctx.font = '600 66px "Manrope Variable", sans-serif';
      wrap(ctx, item.name, 420).forEach((line, i) => ctx.fillText(line, 46, 150 + i * 74));
      ctx.font = '500 34px "Manrope Variable", sans-serif';
      ctx.globalAlpha = .78; ctx.fillText(item.kind, 46, 400); ctx.globalAlpha = 1;
      ctx.fillStyle = hot ? '#ffffff' : '#d9d4ca'; ctx.fillRect(46, 508, w - 92, 6);
      ctx.fillStyle = ink; ctx.font = '500 38px "Manrope Variable", sans-serif';
      wrap(ctx, item.line, 420).forEach((line, i) => ctx.fillText(line, 46, 610 + i * 50));
      ctx.font = '650 34px "Manrope Variable", sans-serif';
      ctx.fillText('Read the case study →', 46, 940);
    });
  }

  function build(items) {
    items.forEach((item, index) => {
      const pivot = new THREE.Group();
      const cool = new THREE.MeshBasicMaterial({ map: face(item, false) });
      const hot = new THREE.MeshBasicMaterial({ map: face(item, true) });
      const mesh = new THREE.Mesh(geometry, [body, body, body, body, cool, body]);
      mesh.position.set(0, H / 2, D / 2); mesh.castShadow = true;
      mesh.userData = { slug: item.slug, onPick: () => push(index) };
      pivot.add(mesh); root.add(pivot); interactive.push(mesh);
      pieces.push({ item, pivot, mesh, cool, hot, lift: 0, liftTarget: 0, fall: 0, falling: false, fallVelocity: 0, stand: reducedMotion ? 1 : 0 });
    });
  }

  let hovered = -1, pushed = -1, openTimer;
  function setHover(index) {
    if (index === hovered) return;
    if (hovered >= 0 && hovered !== pushed) { const p = pieces[hovered]; p.liftTarget = 0; p.mesh.material = [body, body, body, body, p.cool, body]; }
    hovered = index;
    if (index >= 0) { const p = pieces[index]; p.liftTarget = 1; p.mesh.material = [bodyHot, bodyHot, bodyHot, bodyHot, p.hot, bodyHot]; }
    emit('hover', index >= 0 ? pieces[index].item.slug : null);
    kick(.8);
  }
  function push(index) {
    if (pushed >= 0 || index < 0 || index >= pieces.length) return;
    pushed = index; setHover(index);
    const p = pieces[index];
    if (reducedMotion) { emit('open', p.item.slug); return; }
    p.falling = true; p.fallVelocity = .6;
    kick(2);
    openTimer=setTimeout(() => emit('open', p.item.slug), 620);
  }

  // Wide stages hold one arc of nine; narrow stages stack three rows of three, stepping back in depth.
  function layout(width, height) {
    const aspect = width / height, wide = aspect >= 1.55;
    const tan = Math.tan(THREE.MathUtils.degToRad(api.camera.fov) / 2);
    pieces.forEach((p, index) => {
      if (wide) {
        const t = index / (count - 1) - .5;
        p.pivot.position.set(t * 10, 0, -Math.pow(t * 2, 2) * 1.2 + .5);
        p.pivot.rotation.y = -t * .45;
      } else {
        const row = Math.floor(index / 3), col = index % 3;
        p.pivot.position.set((col - 1) * 1.22 + (row % 2) * .18, 0, 1.3 - row * 1.75);
        p.pivot.rotation.y = -(col - 1) * .12;
      }
    });
    const halfWidth = wide ? 5.7 : 2.2;
    const distance = Math.max(halfWidth / (tan * aspect), wide ? 7 : 6.5);
    const lift = wide ? .26 : .62;
    api.camera.position.set(0, .7 + distance * lift, distance * (wide ? 1 : .9));
    api.camera.lookAt(0, wide ? .75 : .5, wide ? 0 : -.4);
  }

  build(caseIndex.map(item => ({ ...item, kind: projects.find(project => project.id === item.slug)?.kind || '' })));

  return {
    on(name, payload) {
      if (name === 'focus') setHover(pieces.findIndex(p => p.item.slug === payload));
      if (name === 'push') push(pieces.findIndex(p => p.item.slug === payload));
      if (name === 'reset') { clearTimeout(openTimer); pushed = -1; pieces.forEach(p => { p.fall = 0; p.falling = false; }); setHover(-1); }
    },
    resize(width, height) { layout(width, height); },
    dispose() { clearTimeout(openTimer); },
    hover(object) { setHover(object ? pieces.findIndex(p => p.mesh === object) : -1); },
    update(dt) {
      let busy = false;
      // Scroll stands the pieces up from flat, left to right.
      const setUp = THREE.MathUtils.clamp((state.progressSmooth - .08) / .32, 0, 1);
      pieces.forEach((p, index) => {
        const local = reducedMotion ? 1 : THREE.MathUtils.clamp(setUp * 1.8 - index / (count - 1) * .8, 0, 1);
        const eased = 1 - Math.pow(1 - local, 3);
        if (Math.abs(eased - p.stand) > .0005) { p.stand = eased; busy = true; }
        p.lift = reducedMotion ? p.liftTarget : p.lift + (p.liftTarget - p.lift) * (1 - Math.exp(-12 * dt));
        if (Math.abs(p.liftTarget - p.lift) > .001) busy = true;
        if (p.falling) {
          // Hinged fall with gravity-like acceleration, settling flat with a small rebound.
          p.fallVelocity += 9 * Math.cos(p.fall) * dt * 1.2;
          p.fall += p.fallVelocity * dt;
          if (p.fall >= Math.PI / 2 - .02) { p.fall = Math.PI / 2 - .02; p.fallVelocity *= -.18; if (Math.abs(p.fallVelocity) < .05) p.falling = false; }
          busy = true;
        }
        const lying = (1 - p.stand) * (Math.PI / 2 - .02);
        p.pivot.rotation.x = -Math.max(lying, p.fall) + p.lift * .08;
        p.pivot.position.y = p.lift * .12 * (1 - p.fall / 1.6);
      });
      return busy;
    },
  };
}
