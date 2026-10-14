export const TILE_HEIGHT = 1.82;
export const TILE_WIDTH = 0.82;
export const TILE_DEPTH = 0.29;
export const FALL_DURATION = 0.48;
export const TILE_COUNT = 13;
const TILE_SPACING = 10.8 / (TILE_COUNT - 1);
const CONTACT_ANGLE = Math.asin((TILE_SPACING - TILE_DEPTH) / TILE_HEIGHT);
// Start the next piece when the previous piece reaches the contact angle.
export const CASCADE_STEP = FALL_DURATION * .86 * Math.sqrt(CONTACT_ANGLE / (Math.PI / 2));

// The path is deliberately composed, rather than random on every visit.
export function dominoPath(index) {
  const u = index / (TILE_COUNT - 1);
  const x = -5.4 + u * 10.8;
  const z = Math.sin(u * Math.PI * 1.4) * 1.15 - 0.4;
  const dz = 1.15 * Math.PI * 1.4 * Math.cos(u * Math.PI * 1.4) / 10.8;
  return { x, z, heading: -Math.atan(dz) };
}

export function fallAngle(elapsed, index) {
  const local = Math.max(0, Math.min(1, (elapsed - index * CASCADE_STEP) / FALL_DURATION));
  if (local === 0) return 0;
  // Acceleration under gravity, followed by a tiny contact rebound.
  const impact = Math.min(1, local / 0.86);
  const base = impact * impact * Math.PI / 2;
  const bounce = local > 0.86 ? Math.sin((local - 0.86) / 0.14 * Math.PI) * 0.035 : 0;
  return -(base - bounce);
}

export function releaseStartsCascade(distance, duration) {
  return distance > 22 || (distance > 9 && duration > 0 && distance / duration > 0.32);
}

export const CASCADE_DURATION = (TILE_COUNT - 1) * CASCADE_STEP + FALL_DURATION;
