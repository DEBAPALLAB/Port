import test from 'node:test';
import assert from 'node:assert/strict';
import { dominoPath, fallAngle, releaseStartsCascade, TILE_COUNT, CASCADE_DURATION } from '../src/dominoMath.js';

test('cascade advances sequentially and every tile settles flat', () => {
  assert.equal(fallAngle(0.1, 1), 0);
  assert.ok(fallAngle(0.1, 0) < 0);
  for (let i = 0; i < TILE_COUNT; i++) assert.equal(fallAngle(CASCADE_DURATION + 1, i), -Math.PI / 2);
});
test('path has continuous forward motion and finite tangent headings', () => {
  for (let i = 1; i < TILE_COUNT; i++) {
    assert.ok(dominoPath(i).x > dominoPath(i - 1).x);
    assert.ok(Number.isFinite(dominoPath(i).heading));
  }
});
test('tap jitter does not become a drag; deliberate pushes and flicks do', () => {
  assert.equal(releaseStartsCascade(4, 120), false);
  assert.equal(releaseStartsCascade(24, 600), true);
  assert.equal(releaseStartsCascade(15, 25), true);
  assert.equal(releaseStartsCascade(15, 0), false);
});
