// Geometry and motion for the talking portrait. Everything here is pure maths so
// the render loop can update SVG attributes directly, without React re-renders.

export const PARALLAX = 16; // px a layer at depth 1 travels at full head yaw/pitch

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const f = n => Math.round(n * 10) / 10;

// Exponential approach that is frame-rate independent.
export function approach(current, target, dt, tc) {
  return target + (current - target) * Math.exp(-dt / Math.max(tc, 1e-4));
}

// Slightly underdamped spring: the head overshoots a hair and settles, like a neck does.
export class Spring {
  constructor(value = 0, stiffness = 70, damping = 13) { this.value = value; this.velocity = 0; this.k = stiffness; this.d = damping; }
  step(target, dt) {
    const steps = Math.ceil(dt / 0.008);
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      this.velocity += ((target - this.value) * this.k - this.velocity * this.d) * h;
      this.value += this.velocity * h;
    }
    return this.value;
  }
  kick(amount) { this.velocity += amount; }
}

// A point that moves with the head: depth z decides how far it travels when the head turns.
const P = (x, y, z, rig) => [x + rig.yaw * PARALLAX * z, y + rig.pitch * PARALLAX * z * 0.7];
const pt = ([x, y]) => `${f(x)},${f(y)}`;

export function facePath(rig) {
  const j = rig.jaw * 11;
  const T1 = P(141, 138, -0.35, rig), C1 = P(137, 190, -0.3, rig), J1 = P(153, 252 + j * 0.35, 0.05, rig);
  const K1 = P(183, 287 + j, 0.35, rig), K2 = P(217, 287 + j, 0.35, rig);
  const J2 = P(247, 252 + j * 0.35, 0.05, rig), C2 = P(263, 190, -0.3, rig), T2 = P(259, 138, -0.35, rig);
  const top = P(200, 100, 0, rig);
  return `M${pt(T1)}C${pt([T1[0] - 4, T1[1] + 22])} ${pt([C1[0], C1[1] - 22])} ${pt(C1)}`
    + `C${pt([C1[0] + 1, C1[1] + 26])} ${pt([J1[0] - 7, J1[1] - 14])} ${pt(J1)}`
    + `L${pt(K1)}Q${pt([(K1[0] + K2[0]) / 2, K1[1] + 6])} ${pt(K2)}L${pt(J2)}`
    + `C${pt([J2[0] + 7, J2[1] - 14])} ${pt([C2[0] - 1, C2[1] + 26])} ${pt(C2)}`
    + `C${pt([C2[0], C2[1] - 22])} ${pt([T2[0] + 4, T2[1] + 22])} ${pt(T2)}Q${pt(top)} ${pt(T1)}Z`;
}

// Flat cel shadow down the far side of the face (key light sits upper-left).
export function faceShadowPath(rig) {
  const j = rig.jaw * 11;
  const turn = rig.yaw * 10;
  const T2 = P(259, 138, -0.35, rig), C2 = P(263, 190, -0.3, rig), J2 = P(247, 252 + j * 0.35, 0.05, rig), K2 = P(217, 287 + j, 0.35, rig);
  const a = P(238 - turn, 146, 0.1, rig), b = P(244 - turn, 206, 0.15, rig), c = P(232 - turn * 0.6, 262 + j * 0.6, 0.25, rig);
  return `M${pt(T2)}L${pt(a)}Q${pt([b[0] + 4, b[1] - 30])} ${pt(b)}Q${pt([b[0] - 2, b[1] + 34])} ${pt(c)}Q${pt([c[0] - 6, c[1] + 18])} ${pt(K2)}`
    + `L${pt(J2)}C${pt([J2[0] + 7, J2[1] - 14])} ${pt([C2[0] - 1, C2[1] + 26])} ${pt(C2)}C${pt([C2[0], C2[1] - 22])} ${pt([T2[0] + 4, T2[1] + 22])} ${pt(T2)}Z`;
}

export function stubblePath(rig) {
  const j = rig.jaw * 11;
  const J1 = P(156, 248 + j * 0.35, 0.05, rig), K1 = P(183, 287 + j, 0.35, rig), K2 = P(217, 287 + j, 0.35, rig), J2 = P(244, 248 + j * 0.35, 0.05, rig);
  const m = mouthCentre(rig);
  return `M${pt(J1)}L${pt(K1)}Q${pt([(K1[0] + K2[0]) / 2, K1[1] + 6])} ${pt(K2)}L${pt(J2)}`
    + `Q${pt([m[0] + 34, m[1] + 4])} ${pt([m[0] + 18, m[1] + 13 + rig.jaw * 8])}Q${pt([m[0], m[1] + 19 + rig.jaw * 10])} ${pt([m[0] - 18, m[1] + 13 + rig.jaw * 8])}Q${pt([m[0] - 34, m[1] + 4])} ${pt(J1)}Z`;
}

export function mouthCentre(rig) { return P(200, 259 + rig.jaw * 5, 0.3, rig); }

// Parametric mouth: open (jaw), wide (ee/s), round (oo/oh), smile.
export function mouthShape(rig) {
  const [cx, cy] = mouthCentre(rig);
  const { open, wide, round, smile } = rig;
  const w = 17 * (1 + 0.22 * wide - 0.38 * round + 0.12 * smile);
  const o = open * 17 * (1 - 0.35 * wide) + round * open * 3;
  const lift = smile * 6.5 - open * 0.8;
  const L = [cx - w, cy - lift], R = [cx + w, cy - lift];
  const upper = cy - 1 - o * 0.18 + smile * 1.2;
  const lower = upper + 0.6 + o * 1.15 + smile * open * 2;
  const roundness = round * 5;
  const inner = `M${pt(L)}C${pt([L[0] + 4 - roundness * 0.4, upper - roundness * 0.5])} ${pt([cx - 6, upper])} ${pt([cx, upper])}`
    + `C${pt([cx + 6, upper])} ${pt([R[0] - 4 + roundness * 0.4, upper - roundness * 0.5])} ${pt(R)}`
    + `C${pt([R[0] - 3 + roundness * 0.3, lower - 2 + roundness * 0.3])} ${pt([cx + w * 0.55, lower])} ${pt([cx, lower])}`
    + `C${pt([cx - w * 0.55, lower])} ${pt([L[0] + 3 - roundness * 0.3, lower - 2 + roundness * 0.3])} ${pt(L)}Z`;
  const lipTop = upper - 3.8 + round * 1.5;
  const upperLip = `M${pt([L[0] - 1, L[1] + 0.5])}C${pt([cx - w * 0.7, lipTop + 1.5])} ${pt([cx - 7, lipTop])} ${pt([cx - 3, lipTop + 0.6])}`
    + `Q${pt([cx, lipTop + 2])} ${pt([cx + 3, lipTop + 0.6])}C${pt([cx + 7, lipTop])} ${pt([cx + w * 0.7, lipTop + 1.5])} ${pt([R[0] + 1, R[1] + 0.5])}`
    + `C${pt([cx + 6, upper + 0.5])} ${pt([cx - 6, upper + 0.5])} ${pt([L[0] - 1, L[1] + 0.5])}Z`;
  const lipBottom = lower + 5.5 - smile * 1.2 + round * 1.5;
  const lowerLip = `M${pt(L)}C${pt([cx - w * 0.5, lower + 0.5])} ${pt([cx + w * 0.5, lower + 0.5])} ${pt(R)}`
    + `C${pt([cx + w * 0.75, lipBottom])} ${pt([cx - w * 0.75, lipBottom])} ${pt(L)}Z`;
  const teethH = clamp(o * 0.38, 0, 5.5);
  const teeth = `M${pt([cx - w * 0.72, upper - 1])}L${pt([cx + w * 0.72, upper - 1])}L${pt([cx + w * 0.6, upper + teethH])}Q${pt([cx, upper + teethH + 1.5])} ${pt([cx - w * 0.6, upper + teethH])}Z`;
  const tongueY = lower - o * 0.18;
  const tongue = `M${pt([cx - w * 0.55, lower + 2])}Q${pt([cx - w * 0.2, tongueY - o * 0.28])} ${pt([cx, tongueY - o * 0.18])}Q${pt([cx + w * 0.2, tongueY - o * 0.28])} ${pt([cx + w * 0.55, lower + 2])}Z`;
  const shade = `M${pt([cx - 9, lipBottom + 3.5])}Q${pt([cx, lipBottom + 6])} ${pt([cx + 9, lipBottom + 3.5])}`;
  const creases = smile > 0.35
    ? `M${pt([L[0] - 3, L[1] - 4])}q-3,4 0,8M${pt([R[0] + 3, R[1] - 4])}q3,4 0,8`
    : '';
  return { inner, upperLip, lowerLip, teeth, tongue, shade, creases, openness: o };
}

const EYES = {
  left: { cx: 171, cy: 200, a: [152, 203], b: [190, 199], top: 183, bottom: 211 },
  right: { cx: 229, cy: 200, a: [210, 199], b: [248, 203], top: 183, bottom: 211 },
};

export function eyeShapes(side, rig) {
  const e = EYES[side], z = 0.12;
  const A = P(...e.a, z, rig), B = P(...e.b, z, rig), C = P(e.cx, e.cy, z, rig);
  const dy = C[1] - e.cy;
  const white = `M${pt(A)}Q${pt([C[0], e.top + dy])} ${pt(B)}Q${pt([C[0], e.bottom + dy])} ${pt(A)}Z`;
  // Lid edge slides from the upper arc (open) to the lower arc (closed).
  const lid = clamp(rig.lid + (side === 'left' ? rig.blinkL : rig.blinkR), 0, 1);
  const edgeY = lerp(e.top + dy, e.bottom - 4 + dy, lid);
  const lidFill = `M${pt([A[0] - 2, A[1]])}Q${pt([C[0], e.top - 16 + dy])} ${pt([B[0] + 2, B[1]])}Q${pt([C[0], edgeY])} ${pt([A[0] - 2, A[1]])}Z`;
  const lash = `M${pt([A[0] - 2, A[1] + 0.5])}Q${pt([C[0], edgeY])} ${pt([B[0] + 2, B[1] + 0.5])}`;
  const crease = `M${pt([A[0] + 3, A[1] - 6 - (1 - lid) * 1.5])}Q${pt([C[0], e.top - 6 + dy - rig.brow * 2])} ${pt([B[0] - 3, B[1] - 6 - (1 - lid) * 1.5])}`;
  const iris = [C[0] + rig.gazeX * 6.5 + rig.yaw * 2, C[1] + rig.gazeY * 3.4 + 0.6];
  const lower = `M${pt([A[0] + 5, A[1] + 2])}Q${pt([C[0], e.bottom + dy + 1])} ${pt([B[0] - 5, B[1] + 2])}`;
  return { white, lidFill, lash, crease, lower, iris };
}

export function browPath(side, rig) {
  const s = side === 'left' ? 1 : -1;
  const ox = side === 'left' ? 0 : 400;
  const raise = rig.brow * 6 + (side === 'right' ? rig.browAsym * 4 : -rig.browAsym * 1.5);
  const inner = rig.furrow * 4; // pulls the inner end down and in
  const X = x => ox + s * x;
  const pts = [
    P(X(148), 187 - raise * 0.6, 0.15, rig),
    P(X(168), 175 - raise, 0.15, rig),
    P(X(190) - s * inner * 0.6, 178 - raise * 0.75 + inner, 0.18, rig),
    P(X(191) - s * inner * 0.6, 185 - raise * 0.75 + inner, 0.18, rig),
    P(X(168), 182 - raise, 0.15, rig),
  ];
  return `M${pt(pts[0])}Q${pt([pts[1][0] - s * 6, pts[1][1] - 1])} ${pt(pts[1])}Q${pt([pts[1][0] + s * 12, pts[1][1] - 1])} ${pt(pts[2])}`
    + `L${pt(pts[3])}Q${pt([pts[4][0] + s * 10, pts[4][1] + 1])} ${pt(pts[4])}Q${pt([pts[4][0] - s * 9, pts[4][1] + 1])} ${pt(pts[0])}Z`;
}

// ---------------------------------------------------------------------------
// Lip sync: turns the voice stream into jaw, width and rounding in real time.
// It reads the guide's own playback graph, so the mouth moves to what you hear.

export class LipSync {
  constructor() { this.reset(); }
  reset() {
    this.open = 0; this.wide = 0; this.round = 0;
    this.level = 0; this.slow = 0; this.peak = 0.06; this.onset = 0;
  }
  attach(session) {
    if (this.session === session) return;
    this.detach();
    this.session = session;
    const source = session?.analyser, context = session?.context;
    if (!source || !context || context.state === 'closed') return;
    try {
      const node = context.createAnalyser();
      node.fftSize = 512; node.smoothingTimeConstant = 0.15;
      source.connect(node);
      this.node = node; this.source = source;
      this.time = new Float32Array(node.fftSize);
      this.freq = new Uint8Array(node.frequencyBinCount);
      this.binHz = context.sampleRate / node.fftSize;
    } catch { this.node = null; }
  }
  detach() {
    try { if (this.node) this.source.disconnect(this.node); } catch {}
    this.node = null; this.source = null; this.session = null;
  }
  band(lo, hi) {
    const a = Math.max(1, Math.floor(lo / this.binHz)), b = Math.min(this.freq.length - 1, Math.ceil(hi / this.binHz));
    let sum = 0;
    for (let i = a; i <= b; i++) { const v = this.freq[i] / 255; sum += v * v; }
    return sum / (b - a + 1);
  }
  update(dt) {
    let rms = 0, wideT = 0, roundT = 0, speaking = false;
    const session = this.session;
    if (session && !session.closed) {
      const status = session.levels?.() || {};
      speaking = !!status.speaking;
      if (this.node && session.context?.state === 'running') {
        this.node.getFloatTimeDomainData(this.time);
        for (const s of this.time) rms += s * s;
        rms = Math.sqrt(rms / this.time.length);
        this.node.getByteFrequencyData(this.freq);
        const low = this.band(150, 900), mid = this.band(900, 2400), high = this.band(2600, 7500);
        const total = low + mid + high + 1e-6;
        wideT = clamp((high / total - 0.12) * 3.2);
        roundT = clamp((low / total - 0.62) * 3.5) * (1 - wideT);
      } else {
        rms = status.output || 0;
      }
    }
    if (!speaking) rms *= 0.2;
    // Adaptive gain: quiet and loud voices both use the whole jaw range.
    this.peak = Math.max(rms, this.peak * Math.exp(-dt / 2.5), 0.03);
    const raw = clamp((rms - 0.008) / (this.peak * 0.85 - 0.008));
    const level = raw < 0.06 ? 0 : Math.pow(raw, 0.75);
    this.onset = level - this.slow > 0.32 && this.level < 0.35 ? level : 0;
    this.slow = approach(this.slow, level, dt, 0.22);
    this.level = level;
    const openT = level * (1 - 0.35 * wideT);
    this.open = approach(this.open, openT, dt, openT > this.open ? 0.03 : 0.075);
    this.wide = approach(this.wide, wideT * clamp(level * 3), dt, 0.06);
    this.round = approach(this.round, roundT * clamp(level * 3), dt, 0.07);
    return this;
  }
}

// ---------------------------------------------------------------------------
// Behaviour: where to look, when to blink, how the head carries itself.

const rand = (a, b) => a + Math.random() * (b - a);

export class Behaviour {
  constructor() {
    this.t = 0;
    this.yaw = new Spring(0, 55, 11); this.pitch = new Spring(0, 55, 11); this.roll = new Spring(0, 40, 10);
    this.hairX = new Spring(0, 90, 9); this.hairY = new Spring(0, 90, 9);
    this.gaze = { x: 0, y: 0, tx: 0, ty: 0 };
    this.nextSaccade = 1; this.nextBlink = rand(1.5, 4); this.blinkT = -1; this.doubleBlink = false;
    this.brow = 0; this.browKick = 0; this.browAsym = 0; this.furrow = 0; this.smile = 0.35; this.lid = 0.14;
    this.surprise = 0; this.pointerSeen = -10; this.lastState = 'idle';
  }
  blink(now = true) { if (this.blinkT < 0 || now) this.blinkT = 0; }
  poke() { this.surprise = 1; this.pitch.kick(-2.2); this.roll.kick(rand(-1, 1)); this.blink(); }
  greet() { this.browKick = Math.max(this.browKick, 0.9); }
  // Someone was just sent here: eyes to camera, a brow flash and a little bob.
  summon() { this.greet(); this.gaze.tx = 0; this.gaze.ty = 0; this.nextSaccade = this.t + 1.6; this.pitch.kick(1.6); this.blink(); this.summoned = this.t; }
  pointer(x, y) { this.pointer_ = { x, y }; this.pointerSeen = this.t; }

  update(dt, { state, hovering, lips, userLevel = 0, reduced }) {
    this.t += dt;
    const t = this.t;
    if (state !== this.lastState) {
      if (state === 'speaking' || state === 'listening') this.greet();
      if (state === 'thinking') { this.gaze.tx = rand(-0.6, -0.35); this.gaze.ty = -0.55; this.nextSaccade = t + rand(0.6, 1.2); }
      this.lastState = state;
    }

    // Gaze ------------------------------------------------------------
    if (t >= this.nextSaccade) {
      const pointerFresh = t - this.pointerSeen < 2.5 && this.pointer_;
      let tx, ty, hold;
      if (state === 'speaking') {
        const away = Math.random() < 0.18;
        tx = away ? rand(-0.65, 0.65) : rand(-0.18, 0.18); ty = away ? rand(-0.4, 0.15) : rand(-0.12, 0.1);
        hold = away ? rand(0.35, 0.7) : rand(0.9, 2.2);
      } else if (state === 'thinking') {
        tx = rand(-0.7, -0.25); ty = rand(-0.7, -0.4); hold = rand(0.5, 1.1);
      } else if (state === 'listening' || state === 'connecting') {
        tx = rand(-0.12, 0.12); ty = rand(-0.08, 0.1); hold = rand(1.2, 2.8);
      } else if (pointerFresh) {
        tx = this.pointer_.x; ty = this.pointer_.y; hold = 0.08;
      } else {
        const camera = Math.random() < 0.55;
        tx = camera ? rand(-0.1, 0.1) : rand(-0.75, 0.75); ty = camera ? rand(-0.05, 0.08) : rand(-0.45, 0.35);
        hold = rand(1.2, 3.6);
      }
      const jump = Math.hypot(tx - this.gaze.tx, ty - this.gaze.ty);
      if (jump > 0.55 && Math.random() < 0.4) this.blink(false);
      this.gaze.tx = clamp(tx, -1, 1); this.gaze.ty = clamp(ty, -1, 1);
      this.nextSaccade = t + hold;
    }
    // Eyes jump (saccade); the head follows later and only part of the way.
    this.gaze.x = approach(this.gaze.x, this.gaze.tx, dt, 0.035);
    this.gaze.y = approach(this.gaze.y, this.gaze.ty, dt, 0.035);

    // Head ------------------------------------------------------------
    const m = reduced ? 0 : 1;
    const drift = m * (Math.sin(t * 0.61) * 0.05 + Math.sin(t * 1.37 + 1.3) * 0.025);
    const driftP = m * (Math.sin(t * 0.83 + 0.4) * 0.035 + Math.sin(t * 1.9) * 0.015);
    let yawT = this.gaze.tx * 0.55 + drift, pitchT = this.gaze.ty * 0.45 + driftP;
    let rollT = m * Math.sin(t * 0.47 + 2) * 0.03;
    if (state === 'listening') { rollT += 0.07; pitchT += 0.05; }
    if (state === 'thinking') rollT -= 0.05;
    if (hovering && state === 'idle') pitchT -= 0.04;
    if (lips.onset && m) { this.pitch.kick(lips.onset * rand(1.1, 2)); this.yaw.kick(rand(-0.7, 0.7) * lips.onset); if (Math.random() < 0.35) this.browKick = Math.max(this.browKick, lips.onset * 0.8); }
    if (state === 'speaking' && m) pitchT += lips.level * 0.06;
    if (state === 'listening' && userLevel > 0.12 && Math.random() < dt * 0.8 && m) this.pitch.kick(1.4); // small "mm-hm" nods
    if (reduced) { yawT *= 0.5; pitchT *= 0.5; rollT = 0; }
    const yaw = this.yaw.step(yawT, dt), pitch = this.pitch.step(pitchT, dt), roll = this.roll.step(rollT, dt);
    // Hair lags behind the head and catches up with a little bounce.
    const hairX = this.hairX.step(yaw, dt), hairY = this.hairY.step(pitch, dt);

    // Blinks ------------------------------------------------------------
    if (t >= this.nextBlink && this.blinkT < 0) { this.blink(); this.doubleBlink = !this.doubleBlink && Math.random() < 0.15; }
    let blink = 0;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      const close = 0.06, hold = 0.03, open = 0.1, b = this.blinkT;
      blink = b < close ? b / close : b < close + hold ? 1 : 1 - (b - close - hold) / open;
      if (b > close + hold + open) {
        blink = 0; this.blinkT = -1;
        this.nextBlink = t + (this.doubleBlink ? 0.1 : state === 'thinking' ? rand(1.2, 2.5) : rand(2, 5.5));      }
    }

    // Expression ------------------------------------------------------------
    this.browKick = approach(this.browKick, 0, dt, 0.35);
    this.surprise = approach(this.surprise, 0, dt, 0.5);
    const beaming = this.summoned !== undefined && t - this.summoned < 2.2;
    const smileT = beaming ? 0.85 : state === 'error' ? 0 : state === 'thinking' ? 0.1 : state === 'speaking' ? 0.3 : state === 'listening' ? 0.42 : hovering ? 0.75 : 0.35;
    this.smile = approach(this.smile, smileT * (1 - this.surprise), dt, 0.25);
    this.furrow = approach(this.furrow, state === 'thinking' ? 0.6 : state === 'error' ? 0.8 : 0, dt, 0.3);
    this.browAsym = approach(this.browAsym, state === 'thinking' ? 0.6 : state === 'listening' ? 0.25 : 0, dt, 0.4);
    this.brow = Math.max(this.browKick, this.surprise) - this.furrow * 0.3 - this.gaze.y * 0.15;
    this.lid = approach(this.lid, 0.14 * (1 - this.surprise) - this.gaze.y * 0.12 + (state === 'thinking' ? 0.08 : 0), dt, 0.08);

    return {
      yaw, pitch, roll, hairX: (hairX - yaw), hairY: (hairY - pitch),
      gazeX: this.gaze.x, gazeY: this.gaze.y, blinkL: blink, blinkR: blink, lid: this.lid,
      brow: this.brow, browAsym: this.browAsym, furrow: this.furrow, smile: this.smile,
      jaw: lips.open, open: lips.open + this.surprise * 0.35, wide: lips.wide + this.smile * 0.15 * (1 - lips.open), round: lips.round + this.surprise * 0.5,
      breath: m * Math.sin(t * (Math.PI * 2 / 4.2)),
    };
  }
}
