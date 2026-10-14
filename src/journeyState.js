export const initialJourney = { phase: 'idle', mode: null, destination: 'work' };
export function journeyReducer(state, action) {
  switch (action.type) {
    case 'START':
      return state.phase === 'idle' ? { phase: 'entering', mode: 'cinematic', destination: 'work' } : state;
    case 'BROWSE':
      return state.phase !== 'active' ? { phase: 'entering', mode: 'direct', destination: action.destination || 'work' } : state;
    case 'ARRIVE':
      return state.phase === 'entering' ? { ...state, phase: 'active' } : state;
    case 'REPLAY':
      return initialJourney;
    default:
      return state;
  }
}
export function shouldAnimateJourney(journey, reducedMotion) {
  return journey.phase !== 'idle' && journey.mode === 'cinematic' && !reducedMotion;
}
