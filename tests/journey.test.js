import test from 'node:test';
import assert from 'node:assert/strict';
import { initialJourney, journeyReducer, shouldAnimateJourney } from '../src/journeyState.js';

test('nothing can arrive or animate until a visitor starts the journey', () => {
  assert.equal(shouldAnimateJourney(initialJourney, false), false);
  assert.equal(journeyReducer(initialJourney, { type: 'ARRIVE' }), initialJourney);
});
test('the first CTA unlocks one handoff and repeated activation cannot restart it', () => {
  const entering = journeyReducer(initialJourney, { type: 'START' });
  assert.equal(entering.phase, 'entering');
  assert.equal(shouldAnimateJourney(entering, false), true);
  assert.equal(journeyReducer(entering, { type: 'START' }), entering);
  const active = journeyReducer(entering, { type: 'ARRIVE' });
  assert.equal(active.phase, 'active');
  assert.equal(journeyReducer(active, { type: 'START' }), active);
});
test('direct browsing and reduced motion never enable cinematic transitions', () => {
  const direct = journeyReducer(initialJourney, { type: 'BROWSE', destination: 'about' });
  assert.equal(direct.destination, 'about');
  assert.equal(shouldAnimateJourney(direct, false), false);
  assert.equal(shouldAnimateJourney(journeyReducer(initialJourney, { type: 'START' }), true), false);
});
test('replay re-locks the journey and requires a fresh visitor action', () => {
  const active = journeyReducer(journeyReducer(initialJourney, { type: 'START' }), { type: 'ARRIVE' });
  const reset = journeyReducer(active, { type: 'REPLAY' });
  assert.deepEqual(reset, initialJourney);
  assert.equal(shouldAnimateJourney(reset, false), false);
});
test('navigation queued with the first activation takes priority over the default destination', () => {
  const entering = journeyReducer(initialJourney, { type: 'START' });
  const redirected = journeyReducer(entering, { type: 'BROWSE', destination: 'about' });
  assert.equal(redirected.destination, 'about');
  assert.equal(redirected.mode, 'direct');
});
