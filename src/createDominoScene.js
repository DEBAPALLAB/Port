import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { createFrameLoop } from './frameLoop.js';
import { dominoPath, fallAngle, TILE_HEIGHT, TILE_WIDTH, TILE_DEPTH, TILE_COUNT, CASCADE_STEP, CASCADE_DURATION, releaseStartsCascade } from './dominoMath.js';

const CORAL = '#ed5939';

function makeFace(index) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = index === 0 ? CORAL : '#fdfcfb';
  ctx.beginPath();
  ctx.roundRect(2, 2, 252, 508, 24);
  ctx.fill();
  ctx.strokeStyle = index === 0 ? 'rgba(255,255,255,.45)' : '#dbd7d1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(38, 256); ctx.lineTo(218, 256); ctx.stroke();
  const patterns = [
    [[0, 0]],
    [[-1, -1], [1, 1]],
    [[-1, -1], [0, 0], [1, 1]],
    [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  ];
  ctx.fillStyle = index === 0 ? '#fff8f3' : '#3b3a37';
  for (const [half, pattern] of [[0, patterns[index % 6]], [1, patterns[(index + 2) % 6]]]) {
    for (const [x, y] of pattern) {
      ctx.beginPath();
      ctx.arc(128 + x * 57, 128 + half * 256 + y * 55, 13, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
  gradient.addColorStop(0, 'rgba(68,54,40,.28)');
  gradient.addColorStop(.38, 'rgba(68,54,40,.13)');
  gradient.addColorStop(1, 'rgba(68,54,40,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

/** Imperative rendering keeps continuous pointer/animation values out of React. */
export function createDominoScene({ canvas, host, anchor, reducedMotion, onReady, onStart, onComplete, onFailure, soundEnabled }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    onFailure();
    return { push() {}, reset() {}, destroy() {} };
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-8, 8, 4, -4, .1, 100);
  camera.position.set(8, 8.2, 13);
  camera.lookAt(0, .6, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .45;
  room.dispose();
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd7cbc0, 2.4));
  const key = new THREE.DirectionalLight(0xfffaf5, 3.7);
  key.position.set(-4, 10, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 7, bottom: -7, near: .1, far: 30 });
  key.shadow.normalBias = .045;
  key.shadow.bias = -.0001;
  key.shadow.radius = 5;
  scene.add(key);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: '#9a8677', opacity: .19 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.position.y = -.015;
  scene.add(ground);

  const geometry = new RoundedBoxGeometry(TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH, 4, .06);
  geometry.translate(0, TILE_HEIGHT / 2, 0);
  const faceGeometry = new THREE.PlaneGeometry(TILE_WIDTH - .055, TILE_HEIGHT - .055);
  const ceramic = new THREE.MeshStandardMaterial({ color: '#f5f2ee', roughness: .28, metalness: .04 });
  const coral = new THREE.MeshStandardMaterial({ color: CORAL, roughness: .27, metalness: .08 });
  const shadowTexture = makeShadowTexture();
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: .85 });
  const shadowGeometry = new THREE.PlaneGeometry(1, 1);
  const tiles = [];
  const meshes = [];
  const faceResources = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    const path = dominoPath(i);
    const root = new THREE.Group();
    root.position.set(path.x, .03, path.z);
    root.rotation.y = Math.PI / 2 + path.heading;
    const pivot = new THREE.Group();
    const mesh = new THREE.Mesh(geometry, i === 0 ? coral : ceramic);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    pivot.add(mesh);
    const texture = makeFace(i);
    const faceMaterial = new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: .39, metalness: 0, depthWrite: false });
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    face.position.set(0, TILE_HEIGHT / 2, TILE_DEPTH / 2 + .001);
    pivot.add(face);
    const back = new THREE.Mesh(faceGeometry, faceMaterial);
    back.position.set(0, TILE_HEIGHT / 2, -TILE_DEPTH / 2 - .001);
    back.rotation.y = Math.PI;
    pivot.add(back);
    faceResources.push(texture, faceMaterial);
    root.add(pivot);
    scene.add(root);
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(path.x, .002 + i * .0001, path.z);
    shadow.scale.set(.85, 1.25, 1);
    scene.add(shadow);
    tiles.push({ root, pivot, shadow, path });
    meshes.push(mesh);
  }

  let disposed = false;
  let inView = true;
  let running = false;
  let started = false;
  let elapsed = 0;
  let width = 0, height = 0;
  let lastTick = -1;
  let introTween;
  let settleTween;
  let pointer = null;
  let hoverFrame = 0, hoverEvent = null;
  let audioContext;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const projected = new THREE.Vector3();
  const initial = { lift: reducedMotion ? 0 : .4, opacity: reducedMotion ? 1 : 0 };
  const loop = createFrameLoop({ draw: drawFrame, step: animate });

  function updateAnchor() {
    if (!anchor || started) return;
    tiles[0].pivot.updateWorldMatrix(true, false);
    projected.set(0, TILE_HEIGHT * .65, 0);
    tiles[0].pivot.localToWorld(projected);
    projected.project(camera);
    anchor.style.transform = `translate(${(projected.x * .5 + .5) * width}px, ${(-projected.y * .5 + .5) * height}px)`;
  }

  function render() {
    renderer.shadowMap.needsUpdate = true;
    loop.invalidate();
  }

  function drawFrame() {
    renderer.render(scene, camera);
    updateAnchor();
  }

  function tickSound(index) {
    if (!soundEnabled() || reducedMotion) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(420 + index * 24, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + .065);
      gain.gain.setValueAtTime(.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .09);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + .1);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* Sound is optional; interaction never depends on audio. */ }
  }

  function applyCascade(elapsed) {
    for (let i = 0; i < tiles.length; i++) {
      const angle = -fallAngle(elapsed, i);
      // Overlapping pieces rest on the next tile instead of passing through it.
      const restFactor = i === TILE_COUNT - 1 ? 1 : .83;
      tiles[i].pivot.rotation.x = angle * restFactor;
      const progress = Math.min(1, angle / (Math.PI / 2));
      tiles[i].shadow.scale.set(.85, 1.25 + progress * 1.05, 1);
    }
  }

  function animate(delta) {
    if (disposed || !running) return false;
    elapsed += delta;
    applyCascade(elapsed);
    renderer.shadowMap.needsUpdate = true;
    const tick = Math.min(TILE_COUNT - 1, Math.floor((elapsed - CASCADE_STEP) / CASCADE_STEP));
    if (tick > lastTick && tick >= 0) { tickSound(tick); lastTick = tick; }
    if (elapsed >= CASCADE_DURATION + .12) {
      running = false;
      applyCascade(CASCADE_DURATION + 1);
      onComplete();
    }
    return running;
  }

  function push() {
    if (started || disposed) return;
    started = true;
    pointer = null;
    canvas.style.cursor = 'default';
    introTween?.kill();
    settleTween?.kill();
    tiles.forEach(tile => { tile.root.position.y = .03; });
    canvas.style.opacity = '1';
    onStart();
    if (reducedMotion) {
      applyCascade(CASCADE_DURATION + 1);
      render();
      onComplete();
      return;
    }
    // Audio can be resumed only from the visitor's initiating gesture.
    if (soundEnabled()) tickSound(0);
    running = true;
    elapsed = 0;
    lastTick = -1;
    loop.start();
  }

  function reset() {
    running = false;
    started = false;
    pointer = null;
    host.dataset.hovered = 'false';
    canvas.style.cursor = 'default';
    cancelAnimationFrame(hoverFrame); hoverFrame = 0;
    loop.stop();
    introTween?.kill();
    tiles.forEach(tile => { tile.root.position.y = .03; });
    canvas.style.opacity = '1';
    lastTick = -1;
    const value = { amount: 1 };
    const rotations = tiles.map(tile => tile.pivot.rotation.x);
    settleTween?.kill();
    if (reducedMotion) { tiles.forEach(tile => { tile.pivot.rotation.x = 0; tile.shadow.scale.set(.85, 1.25, 1); }); render(); return; }
    settleTween = gsap.to(value, {
      amount: 0, duration: .65, ease: 'power2.inOut',
      onUpdate: () => {
        tiles.forEach((tile, i) => {
          tile.pivot.rotation.x = rotations[i] * value.amount;
          tile.shadow.scale.set(.85, 1.25 + value.amount * 1.05, 1);
        });
        render();
      },
    });
  }

  function resize() {
    if (disposed) return;
    const nextWidth = host.clientWidth, nextHeight = host.clientHeight;
    if (!nextWidth || !nextHeight || (width === nextWidth && height === nextHeight)) return;
    width = nextWidth; height = nextHeight;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    // Fit the whole composed path. Mobile keeps the same story, at a tighter angle.
    const viewHeight = Math.max(5.0, (width < 600 ? 14.0 : 14.9) / aspect);
    const halfWidth = viewHeight * aspect / 2;
    camera.left = -halfWidth; camera.right = halfWidth;
    // A taller upper frustum leaves room for the standing pieces and their entry.
    camera.top = viewHeight * .65; camera.bottom = -viewHeight * .35;
    camera.updateProjectionMatrix();
    render();
  }

  function hitFirst(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObject(meshes[0], false).length > 0;
  }

  function pointerDown(event) {
    if (started || !event.isPrimary || event.button !== 0 || !hitFirst(event)) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now(), distance: 0 };
    cancelAnimationFrame(hoverFrame); hoverFrame = 0;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
    introTween?.kill();
    settleTween?.kill();
    canvas.style.opacity = '1';
    tiles.forEach(tile => { tile.root.position.y = .03; });
    render();
  }

  function pointerMove(event) {
    if (started) return;
    if (pointer && pointer.id === event.pointerId) {
      // Drag intent follows the chain horizontally; vertical gestures remain page scrolling.
      pointer.distance = Math.max(0, event.clientX - pointer.x);
      if (Math.abs(event.clientY - pointer.y) > 12 && Math.abs(event.clientY - pointer.y) > Math.abs(event.clientX - pointer.x)) { pointerCancel(); return; }
      tiles[0].pivot.rotation.x = Math.min(.4, pointer.distance / 100);
      render();
      if (pointer.distance > 44) push();
    } else {
      hoverEvent = { clientX: event.clientX, clientY: event.clientY };
      if (!hoverFrame) hoverFrame = requestAnimationFrame(() => {
        hoverFrame = 0;
        if (!started && !pointer && !disposed) setHovered(hitFirst(hoverEvent));
      });
    }
  }

  function setHovered(active) {
    canvas.style.cursor = active ? 'grab' : 'default';
    if (host.dataset.hovered === String(active)) return;
    host.dataset.hovered = String(active);
    if (!reducedMotion) {
      settleTween?.kill();
      settleTween = gsap.to(tiles[0].pivot.rotation, { x: active ? .085 : 0, duration: .25, ease: 'power2.out', onUpdate: render });
    }
  }

  function pointerLeave() {
    cancelAnimationFrame(hoverFrame); hoverFrame = 0;
    if (!started && !pointer) setHovered(false);
  }

  function pointerUp(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const distance = pointer.distance;
    const duration = performance.now() - pointer.time;
    const travel = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y);
    pointer = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = 'grab';
    if (travel < 6 || releaseStartsCascade(distance, duration)) push();
    else settleTween = gsap.to(tiles[0].pivot.rotation, { x: 0, duration: .3, ease: 'power2.out', onUpdate: render });
  }

  function pointerCancel() {
    if (pointer && canvas.hasPointerCapture(pointer.id)) canvas.releasePointerCapture(pointer.id);
    pointer = null;
    if (!started) {
      settleTween?.kill();
      settleTween = gsap.to(tiles[0].pivot.rotation, { x: 0, duration: .25, onUpdate: render });
    }
  }

  function visibility() {
    loop.setVisible(inView && !document.hidden);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    visibility();
  }, { rootMargin: '80px' });
  intersectionObserver.observe(host);
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerCancel);
  canvas.addEventListener('pointerleave', pointerLeave);
  document.addEventListener('visibilitychange', visibility);
  const contextLost = event => { event.preventDefault(); running = false; loop.setVisible(false); introTween?.kill(); settleTween?.kill(); onFailure(); };
  canvas.addEventListener('webglcontextlost', contextLost);

  resize();
  onReady();
  if (!reducedMotion) {
    introTween = gsap.to(initial, {
      lift: 0, opacity: 1, duration: .9, delay: .04, ease: 'power2.out',
      onUpdate: () => {
        tiles.forEach((tile, i) => { tile.root.position.y = .03 + initial.lift * (1 + i * .02); });
        canvas.style.opacity = String(initial.opacity);
        render();
      },
    });
  }

  return {
    push, reset,
    destroy() {
      disposed = true;
      running = false;
      loop.destroy();
      cancelAnimationFrame(hoverFrame);
      introTween?.kill(); settleTween?.kill();
      resizeObserver.disconnect(); intersectionObserver.disconnect();
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerCancel);
      canvas.removeEventListener('pointerleave', pointerLeave);
      canvas.removeEventListener('webglcontextlost', contextLost);
      document.removeEventListener('visibilitychange', visibility);
      geometry.dispose(); faceGeometry.dispose(); ground.geometry.dispose(); ground.material.dispose();
      ceramic.dispose(); coral.dispose(); shadowTexture.dispose(); shadowMaterial.dispose(); shadowGeometry.dispose();
      faceResources.forEach(resource => resource.dispose());
      environment.dispose();
      key.shadow.map?.dispose();
      renderer.dispose();
      audioContext?.close().catch(() => {});
    },
  };
}
