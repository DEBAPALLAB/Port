// Cubic sections stay vertically monotonic, so the thread follows reading position.
export function buildThread({ width, start, stops, end }) {
  const narrow = width < 1000;
  const gutter = Math.max(7, Math.min(54, width * (narrow ? .024 : .035)));
  const points = [start];
  // A missing or temporarily collapsed anchor must never send the path backwards.
  for (const y of [...stops, end]) {
    if (Number.isFinite(y) && y > points.at(-1).y) points.push({ x: gutter, y });
  }
  const samples = [{ ...start, length: 0 }];
  let d = `M${start.x},${start.y}`, length = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], gap = b.y - a.y;
    const bow = i === 1 ? 0 : Math.min(gutter * (narrow ? .2 : .6), gap * .08) * (i % 2 ? -1 : 1);
    const c = { x: i === 1 ? a.x : gutter + bow, y: a.y + gap * .38 };
    const e = { x: gutter + bow, y: a.y + gap * .68 };
    d += `C${c.x},${c.y} ${e.x},${e.y} ${b.x},${b.y}`;
    for (let j = 1; j <= 80; j++) {
      const t = j / 80, u = 1 - t;
      const point = { x: u*u*u*a.x + 3*u*u*t*c.x + 3*u*t*t*e.x + t*t*t*b.x, y: u*u*u*a.y + 3*u*u*t*c.y + 3*u*t*t*e.y + t*t*t*b.y };
      const previous = samples[samples.length - 1];
      length += Math.hypot(point.x - previous.x, point.y - previous.y);
      samples.push({ ...point, length });
    }
  }
  return { d, samples, length, gutter };
}

export function threadPointAtY(samples, y) {
  let low = 0, high = samples.length - 1;
  if (y <= samples[0].y) return samples[0];
  if (y >= samples[high].y) return samples[high];
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (samples[mid].y < y) low = mid; else high = mid;
  }
  const a = samples[low], b = samples[high], t = (y - a.y) / (b.y - a.y);
  return { x: a.x + (b.x-a.x)*t, y, length: a.length + (b.length-a.length)*t };
}
