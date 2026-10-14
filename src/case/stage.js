import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createFrameLoop } from '../frameLoop.js';

// Shared studio for every case-study object: ceramic light, a soft contact shadow,
// damped orbit with inertia, hover/pick raycasting, scroll progress and demand rendering.
export const palette = {
  ground: 0xffffff, ceramic: 0xf4f1ea, paper: 0xfffdf8, stone: 0xe6e2da, ink: 0x30312e,
  muted: 0x8a877f, accent: 0xed5939, accentDeep: 0xb93c24, blush: 0xffded3,
};

const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

export function createStage(canvas, host, { setup, options = {}, reducedMotion = false, onEvent = () => {}, onFail = () => {} }) {
  const {
    fov = 28, distance = 10, height = 1.4, target = [0, 0, 0], frame = 0,
    yaw = [-.55, .55], pitch = [-.18, .32], startYaw = -.32, startPitch = .1,
    drag = true, ambient = true, floor = -1.2, shadow = .14, exposure = 1, maxPixelRatio = 2,
  } = options;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (error) { onFail(error); return { dispose() {}, send() {} }; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : maxPixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envMap = pmrem.fromScene(room, .035).texture;
  scene.environment = envMap;
  room.dispose?.(); pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(fov, 1, .1, 200);
  const lookAt = new THREE.Vector3(...target);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d1c6, .55));
  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(-5, 9, 7); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -.0004; key.shadow.normalBias = .02;
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe7de, .6); rim.position.set(6, 3, -6); scene.add(rim);

  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: shadow }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = floor; catcher.receiveShadow = true;
  if (floor !== null) scene.add(catcher);

  const root = new THREE.Group(); scene.add(root);
  const state = {
    time: 0, yaw: startYaw, pitch: startPitch, targetYaw: startYaw, targetPitch: startPitch, velocity: 0,
    dragging: false, pointer: new THREE.Vector2(9, 9), pointerInside: false, hovered: null,
    progress: 0, progressSmooth: 0, width: 1, height: 1, reducedMotion, visible: false,
  };
  const interactive = [];
  const owned = new Set();
  let kickUntil = 0;

  const materials = {
    ceramic: (color = palette.ceramic) => new THREE.MeshPhysicalMaterial({ color, roughness: .32, clearcoat: .6, clearcoatRoughness: .25 }),
    paper: (color = palette.paper) => new THREE.MeshStandardMaterial({ color, roughness: .92 }),
    ink: (color = palette.ink) => new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .05 }),
    accent: (color = palette.accent) => new THREE.MeshPhysicalMaterial({ color, roughness: .38, clearcoat: .5, clearcoatRoughness: .3 }),
    glass: (color = 0xffffff) => new THREE.MeshPhysicalMaterial({ color, roughness: .08, transmission: 1, thickness: .6, ior: 1.4, transparent: true }),
    metal: (color = 0xd9d6cf) => new THREE.MeshStandardMaterial({ color, roughness: .28, metalness: 1 }),
  };

  const loop = createFrameLoop({ step, draw: () => renderer.render(scene, camera) });

  function canvasTexture(width, height, draw) {
    const surface = document.createElement('canvas'); surface.width = width; surface.height = height;
    const ctx = surface.getContext('2d');
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const redraw = (...args) => { ctx.clearRect(0, 0, width, height); draw(ctx, width, height, ...args); texture.needsUpdate = true; invalidate(); };
    redraw();
    texture.redraw = redraw;
    owned.add(texture);
    return texture;
  }

  const api = {
    THREE, scene, root, camera, renderer, state, palette, materials, interactive, reducedMotion,
    roundedBox: (w, h, d, r = .08, segments = 4) => new RoundedBoxGeometry(w, h, d, segments, r),
    canvasTexture,
    invalidate: () => invalidate(),
    // Keep the clock running for a finite effect (seconds).
    kick: (seconds = 1) => { kickUntil = Math.max(kickUntil, state.time + seconds); loop.start(); },
    emit: (name, payload) => onEvent(name, payload),
    setCursor: value => { canvas.style.cursor = value; },
  };

  let hooks = {};
  hooks = setup(api) || {};
  const ray = new THREE.Raycaster();

  function pickAt(ndc) {
    if (!interactive.length) return null;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(interactive, true)[0];
    if (!hit) return null;
    let object = hit.object;
    while (object && !interactive.includes(object)) object = object.parent;
    return object ? { object, point: hit.point } : null;
  }

  function placeCamera() {
    const aspect = state.width / state.height;
    let dist = distance;
    if (frame) dist = frame / Math.sin(THREE.MathUtils.degToRad(fov) / 2) / Math.min(1, aspect * .9);
    camera.aspect = aspect;
    camera.position.set(0, height, dist).add(lookAt);
    camera.lookAt(lookAt);
    camera.updateProjectionMatrix();
  }

  function step(dt) {
    state.time += dt;
    const ambientOn = ambient && !reducedMotion && state.visible;
    if (!state.dragging) {
      state.targetYaw += state.velocity * dt; state.velocity *= Math.exp(-3.2 * dt);
      if (Math.abs(state.velocity) < .002) state.velocity = 0;
      state.targetYaw = THREE.MathUtils.clamp(state.targetYaw, yaw[0], yaw[1]);
    }
    const hoverTilt = state.pointerInside && !state.dragging && !reducedMotion ? state.pointer.x * .06 : 0;
    const sway = ambientOn && !state.dragging ? Math.sin(state.time * .45) * .035 : 0;
    state.yaw = damp(state.yaw, state.targetYaw + hoverTilt + sway, reducedMotion ? 30 : 7, dt);
    const hoverPitch = state.pointerInside && !state.dragging && !reducedMotion ? -state.pointer.y * .035 : 0;
    state.pitch = damp(state.pitch, state.targetPitch + hoverPitch, reducedMotion ? 30 : 7, dt);
    root.rotation.set(state.pitch, state.yaw, 0);
    state.progressSmooth = reducedMotion ? state.progress : damp(state.progressSmooth, state.progress, 6, dt);

    if (state.pointerInside && !state.dragging) {
      const hit = pickAt(state.pointer);
      const next = hit?.object || null;
      if (next !== state.hovered) {
        const previous = state.hovered; state.hovered = next;
        hooks.hover?.(next, previous);
        canvas.style.cursor = next ? 'pointer' : drag ? 'grab' : '';
      }
    }
    const busy = hooks.update?.(dt, state) === true;
    const settling = Math.abs(state.yaw - state.targetYaw - hoverTilt - sway) > .0005 || Math.abs(state.pitch - state.targetPitch - hoverPitch) > .0005
      || Math.abs(state.progressSmooth - state.progress) > .0005;
    return busy || ambientOn || state.dragging || state.velocity !== 0 || settling || state.time < kickUntil;
  }

  function invalidate() { loop.invalidate(); }

  // Scroll progress: 0 as the stage enters from below, 1 as it leaves at the top.
  let measureFrame=0;
  function scheduleMeasure() { if (!measureFrame) measureFrame=requestAnimationFrame(measure); }
  function measure() {
    measureFrame=0;
    const rect = host.getBoundingClientRect();
    const total = innerHeight + rect.height;
    const value = THREE.MathUtils.clamp((innerHeight - rect.top) / total, 0, 1);
    if (Math.abs(value - state.progress) > .0005) { state.progress = value; loop.start(); }
  }

  function resize() {
    const width = host.clientWidth, heightPx = host.clientHeight;
    if (!width || !heightPx || (width===state.width && heightPx===state.height)) return;
    state.width = width; state.height = heightPx;
    renderer.setSize(width, heightPx, false);
    placeCamera();
    hooks.resize?.(width, heightPx);
    invalidate();
  }

  let down = null;
  function toNdc(event) {
    const rect = canvas.getBoundingClientRect();
    state.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
  }
  function pointerDown(event) {
    if (event.button > 0) return;
    toNdc(event);
    down = { x: event.clientX, y: event.clientY, yaw: state.targetYaw, pitch: state.targetPitch, t: performance.now(), lastX: event.clientX, lastT: performance.now(), type: event.pointerType };
    if (drag && event.pointerType === 'mouse') { state.dragging = true; canvas.setPointerCapture(event.pointerId); canvas.style.cursor = 'grabbing'; }
    loop.start();
  }
  function pointerMove(event) {
    toNdc(event); state.pointerInside = true;
    if (down && drag) {
      const dx = event.clientX - down.x, dy = event.clientY - down.y;
      // Touch: horizontal intent orbits, vertical intent stays a page scroll.
      if (!state.dragging && down.type !== 'mouse' && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.4) { state.dragging = true; canvas.setPointerCapture(event.pointerId); }
      if (state.dragging) {
        state.targetYaw = THREE.MathUtils.clamp(down.yaw + dx / state.width * 2.4, yaw[0] - .15, yaw[1] + .15);
        state.targetPitch = THREE.MathUtils.clamp(down.pitch + dy / state.height * 1.2, pitch[0], pitch[1]);
        const now = performance.now();
        if (now > down.lastT) state.velocity = (event.clientX - down.lastX) / state.width * 2.4 / ((now - down.lastT) / 1000);
        down.lastX = event.clientX; down.lastT = now;
      }
    }
    loop.start();
  }
  function pointerUp(event) {
    if (!down) return;
    const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y);
    if (performance.now() - down.lastT > 80) state.velocity = 0;
    state.velocity = THREE.MathUtils.clamp(state.velocity, -3, 3);
    state.dragging = false; down = null;
    canvas.style.cursor = state.hovered ? 'pointer' : drag ? 'grab' : '';
    if (moved < 8) {
      toNdc(event);
      const hit = pickAt(state.pointer);
      if (hit) { (hit.object.userData.onPick || hooks.pick)?.(hit.object, hit.point); }
      else hooks.pick?.(null, null);
    }
    loop.start();
  }
  function pointerLeave() { state.pointerInside = false; if (state.hovered) { hooks.hover?.(null, state.hovered); state.hovered = null; } loop.start(); }
  function cancel() { state.dragging = false; state.velocity=0; down = null; loop.start(); }

  canvas.style.cursor = drag ? 'grab' : '';
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', cancel);
  canvas.addEventListener('pointerleave', pointerLeave);
  const lost = event => { event.preventDefault(); onFail(new Error('WebGL context lost')); };
  canvas.addEventListener('webglcontextlost', lost);
  addEventListener('scroll', scheduleMeasure, { passive: true });

  const visibility = () => { const on = state.visible && !document.hidden; loop.setVisible(on); if (on) loop.start(); };
  const observer = new IntersectionObserver(entries => { state.visible = entries[0].isIntersecting; visibility(); }, { rootMargin: '80px' });
  observer.observe(host);
  document.addEventListener('visibilitychange', visibility);
  const resizer = new ResizeObserver(resize); resizer.observe(host);
  resize(); measure();
  state.progressSmooth = state.progress;
  root.rotation.set(state.pitch, state.yaw, 0);
  loop.start();

  return {
    send(name, payload) { hooks.on?.(name, payload); loop.start(); },
    dispose() {
      loop.destroy(); observer.disconnect(); resizer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      removeEventListener('scroll', scheduleMeasure); cancelAnimationFrame(measureFrame);
      canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp); canvas.removeEventListener('pointercancel', cancel);
      canvas.removeEventListener('pointerleave', pointerLeave); canvas.removeEventListener('webglcontextlost', lost);
      hooks.dispose?.();
      scene.traverse(object => {
        object.geometry?.dispose();
        const list = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
        for (const material of list) { for (const value of Object.values(material)) if (value?.isTexture) value.dispose(); material.dispose(); }
      });
      owned.forEach(texture => texture.dispose());
      envMap.dispose(); renderer.dispose();
    },
  };
}
