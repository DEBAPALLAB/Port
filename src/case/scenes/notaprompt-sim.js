// A deterministic, seeded contagion on a small-world ring.
// A portfolio illustration of the mechanism. It is not the Notaprompt engine and makes no prediction.
export const AGENTS = 48;
export const MAX_STEPS = 16;
export const DEFAULTS = { conformity: .4, influence: .45, shortcuts: .12 };

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ring lattice (each agent knows two neighbours either side), then each link is rewired with probability `shortcuts`.
export function buildGraph(shortcuts = DEFAULTS.shortcuts) {
  const rnd = mulberry32(4183);
  const links = new Set();
  const key = (a, b) => (a < b ? a + '-' + b : b + '-' + a);
  const lattice = [];
  for (let i = 0; i < AGENTS; i++) for (const d of [1, 2]) lattice.push([i, (i + d) % AGENTS]);
  const dice = lattice.map(() => rnd());
  const pick = lattice.map(() => rnd());
  lattice.forEach(([a, b], index) => {
    if (dice[index] < shortcuts) {
      let c = Math.floor(pick[index] * AGENTS), guard = 0;
      while ((c === a || links.has(key(a, c))) && guard++ < AGENTS) c = (c + 1) % AGENTS;
      links.add(key(a, c));
    } else links.add(key(a, b));
  });
  const edges = [...links].map(text => text.split('-').map(Number));
  const adjacent = Array.from({ length: AGENTS }, () => []);
  edges.forEach(([a, b]) => { adjacent[a].push(b); adjacent[b].push(a); });
  const traits = Array.from({ length: AGENTS }, (_, i) => ({
    resistance: .2 + .65 * rnd(),
    conformity: .25 + .7 * rnd(),
    influence: Math.min(1, .45 + .4 * rnd() + adjacent[i].length * .03),
  }));
  return { edges, adjacent, traits };
}

// One step: every agent that has not adopted feels the pull of the neighbours who have.
// pull = 1 - product(1 - influence * neighbourInfluence). Agent adopts when pull reaches its own bar.
// bar = resistance * (1 - .85 * conformity * agentConformity). More conformity lowers the bar.
export function simulate(graph, params, seedNode, steps) {
  const { adjacent, traits } = graph;
  const adopted = new Int8Array(AGENTS).fill(-1);
  const parent = new Int16Array(AGENTS).fill(-1);
  adopted[seedNode] = 0;
  const pulls = new Float32Array(AGENTS);
  for (let step = 1; step <= steps; step++) {
    const next = [];
    for (let i = 0; i < AGENTS; i++) {
      if (adopted[i] >= 0) continue;
      let calm = 1, best = -1, bestPull = 0;
      for (const j of adjacent[i]) {
        if (adopted[j] < 0 || adopted[j] >= step) continue;
        const push = params.influence * traits[j].influence;
        calm *= 1 - push;
        if (push > bestPull) { bestPull = push; best = j; }
      }
      pulls[i] = 1 - calm;
      const bar = traits[i].resistance * (1 - .85 * params.conformity * traits[i].conformity);
      if (best >= 0 && pulls[i] >= bar) next.push([i, best]);
    }
    for (const [i, j] of next) { adopted[i] = step; parent[i] = j; }
  }
  let count = 0;
  for (let i = 0; i < AGENTS; i++) if (adopted[i] >= 0 && adopted[i] <= steps) count++;
  return { adopted, parent, pulls, count, steps };
}

export function curve(graph, params, seedNode) {
  const full = simulate(graph, params, seedNode, MAX_STEPS);
  const series = [];
  for (let s = 0; s <= MAX_STEPS; s++) {
    let c = 0;
    for (let i = 0; i < AGENTS; i++) if (full.adopted[i] >= 0 && full.adopted[i] <= s) c++;
    series.push(c);
  }
  return { series, full };
}

// 0 unaware, 1 adopted, 2 resisting (felt the pull, high resistance, has not adopted)
export function statuses(graph, params, seedNode, step) {
  const run = simulate(graph, params, seedNode, step);
  const out = new Int8Array(AGENTS);
  for (let i = 0; i < AGENTS; i++) {
    if (run.adopted[i] >= 0) out[i] = 1;
    else if (run.pulls[i] > .05 && graph.traits[i].resistance > .6) out[i] = 2;
  }
  return { status: out, run };
}

// Ring layout; alternate radius a little so the network reads as a crowd, not a clock.
export function layout(radius = 3.1) {
  return Array.from({ length: AGENTS }, (_, i) => {
    const angle = (i / AGENTS) * Math.PI * 2 - Math.PI / 2;
    const r = radius + .28 * Math.sin(i * 2.399);
    return [Math.cos(angle) * r, Math.sin(angle) * r];
  });
}
